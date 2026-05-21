-- 032_refund_orphan_debits.sql
-- Filet de sécurité crédits : auto-refund des analyses débitées sans fiche persistée.
--
-- Contexte : le crédit est débité côté backend dès /api/analyze/start.
-- La fiche est insérée en DB côté client par saveAnalysis(), uniquement
-- quand le polling reçoit _stage = "all_done". Si l'utilisateur ferme la
-- tab, perd le réseau, ou si LoadingScreen sort de sa boucle avant
-- all_done sans qu'un relais reprenne, le crédit est cramé sans fiche.
-- 4 cas observés en prod (2026-05-15 → 2026-05-21).
--
-- Le patch front (App.jsx, fix 2026-05-21) ajoute un relais polling fond
-- qui couvre la majorité des cas. Ce filet attrape les cas restants
-- (tab fermée pendant l'analyse, etc.) en rebalançant le crédit sous
-- 30 minutes maximum.
--
-- Heuristique : on n'auto-refund QUE les utilisateurs qui n'ont jamais
-- persisté une seule fiche (nouveaux comptes bloqués au premier essai).
-- Ça évite les faux positifs sur les power users qui font des tests
-- et nettoient leurs versions (debit reste, version supprimée → looked
-- like an orphan from the DB).
--
-- Vraie fix architecturale (persistance côté backend) à planifier dans
-- versions-api : éliminera la dépendance au client et rendra ce filet
-- inutile.

-- ──────────────────────────────────────────────────────────────────────
-- 1) Extension pg_cron (déjà disponible, juste pas activée)
-- ──────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ──────────────────────────────────────────────────────────────────────
-- 2) Fonction refund_orphan_debits()
-- ──────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.refund_orphan_debits()
RETURNS TABLE(
  refunded_user_id uuid,
  refunded_job_id  text,
  refunded_at      timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT ce.id AS debit_id, ce.user_id, ce.job_id, ce.created_at
    FROM public.credit_events ce
    WHERE ce.reason = 'debit_analysis'
      AND ce.created_at > now() - interval '7 days'
      AND ce.created_at < now() - interval '30 minutes'
      -- L'utilisateur n'a JAMAIS persisté aucune version (compte tout neuf)
      AND NOT EXISTS (
        SELECT 1 FROM public.tracks t
        JOIN public.versions v ON v.track_id = t.id
        WHERE t.user_id = ce.user_id
      )
      -- Pas déjà remboursé (refund_failed OU manual_admin avec job_id dans notes)
      AND NOT EXISTS (
        SELECT 1 FROM public.credit_events ce2
        WHERE ce2.user_id = ce.user_id
          AND ce2.delta   > 0
          AND (
            ce2.job_id = ce.job_id
            OR ce2.notes LIKE '%' || ce.job_id || '%'
          )
      )
    ORDER BY ce.created_at
  LOOP
    INSERT INTO public.credit_events (user_id, delta, reason, job_id, notes)
    VALUES (
      r.user_id, 1, 'refund_failed', r.job_id,
      'Auto-refund : analyse ' || r.job_id || ' débitée le '
        || to_char(r.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI UTC')
        || ' sans fiche persistée (compte sans aucune version).'
    );
    UPDATE public.user_credits
       SET balance_remaining = balance_remaining + 1,
           pack_balance      = pack_balance + 1,
           updated_at        = now()
     WHERE user_credits.user_id = r.user_id;
    refunded_user_id := r.user_id;
    refunded_job_id  := r.job_id;
    refunded_at      := now();
    RETURN NEXT;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.refund_orphan_debits() IS
'Filet de sécurité crédits : rembourse les debit_analysis sans fiche persistée, uniquement pour les comptes sans aucune version (nouveaux signups bloqués au 1er essai). Idempotente. Planifiée toutes les 30 min via pg_cron.';

REVOKE ALL ON FUNCTION public.refund_orphan_debits() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refund_orphan_debits() TO service_role;

-- ──────────────────────────────────────────────────────────────────────
-- 3) Planification pg_cron : toutes les 30 minutes
-- ──────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refund-orphan-debits') THEN
    PERFORM cron.unschedule('refund-orphan-debits');
  END IF;
END $$;

SELECT cron.schedule(
  'refund-orphan-debits',
  '*/30 * * * *',
  $cron$SELECT public.refund_orphan_debits()$cron$
);
