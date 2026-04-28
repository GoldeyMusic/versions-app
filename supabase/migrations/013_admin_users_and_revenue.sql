-- =============================================================
-- Migration 013 — Table revenue_logs + RPC stats admin
-- =============================================================
-- À appliquer une seule fois, via Supabase Studio → SQL Editor → Run.
-- Script idempotent (safe à ré-exécuter).
--
-- Contexte (session 2026-04-28) :
--   Pour le dashboard #/admin on veut afficher :
--     1. La liste exhaustive des users avec stats (email, prénom, nom,
--        date d'inscription, dernière activité, nb projets/titres/versions,
--        coût total dépensé, recettes encaissées, balance = rentabilité).
--     2. Une section "Recettes" avec l'historique des transactions —
--        prête à recevoir les webhooks Stripe quand David branchera
--        le paiement (table `revenue_logs`).
--
--   On crée :
--     A. Table `public.revenue_logs` (placeholder pour Stripe)
--     B. RPC `public.admin_get_user_stats()` — retourne 1 ligne par user
--        avec toutes les stats agrégées en une seule requête (jointure
--        SQL côté DB, plus rapide que multi-fetch côté front).
--     C. RPC `public.admin_get_global_stats()` — KPIs business globaux
--        (total users, titres, recettes, rentabilité, etc.).
--
--   Les deux RPC sont SECURITY DEFINER : elles s'exécutent avec les
--   droits du créateur (admin Postgres) et peuvent donc lire auth.users.
--   Le check d'autorisation se fait À L'INTÉRIEUR de chaque fonction
--   via un IF qui compare auth.jwt() ->> 'email' à l'email admin
--   hardcodé. Si tu changes d'admin, fais une migration 014 qui
--   recrée les fonctions avec le nouvel email.
-- =============================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────
-- A. Table revenue_logs — historique des transactions
-- ─────────────────────────────────────────────────────────────
-- Une ligne par transaction encaissée (achat pack, abo récurrent, refund).
-- Sera alimentée plus tard par les webhooks Stripe (charge.succeeded,
-- invoice.paid, charge.refunded). En attendant, table vide → toutes
-- les recettes affichées sur le dashboard sont à 0.
CREATE TABLE IF NOT EXISTS public.revenue_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Source : 'stripe' (webhook), 'manual' (saisie admin via dashboard),
  -- 'refund' (montant négatif), 'free' (analyse gratuite/promo, montant 0)
  source text NOT NULL DEFAULT 'stripe',
  -- Produit acheté : 'pack_1', 'pack_3', 'pack_5', 'pack_10',
  -- 'sub_inde', 'sub_pro', 'topup', 'refund', etc. — chaîne libre.
  product text,
  -- Montant TTC encaissé (positif pour vente, négatif pour refund)
  amount_eur numeric(10, 2) NOT NULL DEFAULT 0,
  -- Net après frais Stripe (~2.5 % + 0.25 € en EU). Optionnel.
  net_eur numeric(10, 2),
  -- ID Stripe pour corréler avec le dashboard Stripe (charge_id, invoice_id)
  stripe_id text,
  -- Description libre pour debug ou saisie manuelle
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS revenue_logs_created_at_idx
  ON public.revenue_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS revenue_logs_user_id_idx
  ON public.revenue_logs (user_id);

ALTER TABLE public.revenue_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "revenue_logs_insert_service_role" ON public.revenue_logs;
CREATE POLICY "revenue_logs_insert_service_role"
  ON public.revenue_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "revenue_logs_select_admin" ON public.revenue_logs;
CREATE POLICY "revenue_logs_select_admin"
  ON public.revenue_logs
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'berdugo.david@gmail.com');

-- ─────────────────────────────────────────────────────────────
-- B. RPC admin_get_user_stats — 1 ligne par user, stats agrégées
-- ─────────────────────────────────────────────────────────────
-- Retourne un TABLE typé : permet une seule requête côté frontend qui
-- récupère TOUT (email depuis auth.users + counts depuis tracks/versions
-- + coûts + recettes). Beaucoup plus rapide que 4-5 SELECT séparés.
DROP FUNCTION IF EXISTS public.admin_get_user_stats();
CREATE OR REPLACE FUNCTION public.admin_get_user_stats()
RETURNS TABLE (
  user_id uuid,
  email text,
  prenom text,
  nom text,
  langue text,
  signed_up_at timestamptz,
  last_sign_in_at timestamptz,
  last_activity timestamptz,
  projects_count bigint,
  tracks_count bigint,
  versions_count bigint,
  analyses_count bigint,
  total_cost_eur numeric,
  total_revenue_eur numeric,
  balance_eur numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Garde-fou : seul l'admin peut appeler cette fonction
  IF (auth.jwt() ->> 'email') IS DISTINCT FROM 'berdugo.david@gmail.com' THEN
    RAISE EXCEPTION 'Forbidden — admin only';
  END IF;

  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.email::text,
    p.prenom,
    p.nom,
    p.langue,
    u.created_at AS signed_up_at,
    u.last_sign_in_at,
    -- Dernière activité = dernier upload de version (proxy raisonnable).
    -- versions n'a PAS de user_id → on joint sur tracks pour récupérer l'ownership.
    (
      SELECT MAX(v.created_at)
      FROM public.versions v
      INNER JOIN public.tracks t2 ON t2.id = v.track_id
      WHERE t2.user_id = u.id
    ) AS last_activity,
    COALESCE((SELECT COUNT(*) FROM public.projects pr WHERE pr.user_id = u.id), 0) AS projects_count,
    COALESCE((SELECT COUNT(*) FROM public.tracks t WHERE t.user_id = u.id), 0) AS tracks_count,
    -- versions_count : même logique de jointure via tracks
    COALESCE((
      SELECT COUNT(*)
      FROM public.versions v
      INNER JOIN public.tracks t2 ON t2.id = v.track_id
      WHERE t2.user_id = u.id
    ), 0) AS versions_count,
    COALESCE((SELECT COUNT(*) FROM public.analysis_cost_logs cl WHERE cl.user_id = u.id), 0) AS analyses_count,
    COALESCE((SELECT SUM(cl.total_eur) FROM public.analysis_cost_logs cl WHERE cl.user_id = u.id), 0) AS total_cost_eur,
    COALESCE((SELECT SUM(rl.amount_eur) FROM public.revenue_logs rl WHERE rl.user_id = u.id), 0) AS total_revenue_eur,
    COALESCE((SELECT SUM(rl.amount_eur) FROM public.revenue_logs rl WHERE rl.user_id = u.id), 0)
      - COALESCE((SELECT SUM(cl.total_eur) FROM public.analysis_cost_logs cl WHERE cl.user_id = u.id), 0)
      AS balance_eur
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  ORDER BY balance_eur ASC; -- Les plus rentables tout en bas, les "déficitaires" en haut
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_user_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_get_user_stats() TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- C. RPC admin_get_global_stats — KPIs business globaux
-- ─────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.admin_get_global_stats();
CREATE OR REPLACE FUNCTION public.admin_get_global_stats()
RETURNS TABLE (
  total_users bigint,
  total_tracks bigint,
  total_versions bigint,
  new_signups_30d bigint,
  total_cost_30d numeric,
  total_revenue_30d numeric,
  balance_30d numeric,
  total_cost_all_time numeric,
  total_revenue_all_time numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF (auth.jwt() ->> 'email') IS DISTINCT FROM 'berdugo.david@gmail.com' THEN
    RAISE EXCEPTION 'Forbidden — admin only';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM auth.users) AS total_users,
    (SELECT COUNT(*) FROM public.tracks) AS total_tracks,
    (SELECT COUNT(*) FROM public.versions) AS total_versions,
    (SELECT COUNT(*) FROM auth.users WHERE created_at >= now() - interval '30 days') AS new_signups_30d,
    COALESCE((SELECT SUM(total_eur) FROM public.analysis_cost_logs WHERE created_at >= now() - interval '30 days'), 0) AS total_cost_30d,
    COALESCE((SELECT SUM(amount_eur) FROM public.revenue_logs WHERE created_at >= now() - interval '30 days'), 0) AS total_revenue_30d,
    COALESCE((SELECT SUM(amount_eur) FROM public.revenue_logs WHERE created_at >= now() - interval '30 days'), 0)
      - COALESCE((SELECT SUM(total_eur) FROM public.analysis_cost_logs WHERE created_at >= now() - interval '30 days'), 0) AS balance_30d,
    COALESCE((SELECT SUM(total_eur) FROM public.analysis_cost_logs), 0) AS total_cost_all_time,
    COALESCE((SELECT SUM(amount_eur) FROM public.revenue_logs), 0) AS total_revenue_all_time;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_global_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_get_global_stats() TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- D. RPC admin_get_user_detail — détail d'un user (titres + analyses)
-- ─────────────────────────────────────────────────────────────
-- Pour le clic "voir détail" sur une ligne user du dashboard.
-- Retourne ses titres avec leurs versions et le coût de chaque analyse.
DROP FUNCTION IF EXISTS public.admin_get_user_detail(uuid);
CREATE OR REPLACE FUNCTION public.admin_get_user_detail(target_user_id uuid)
RETURNS TABLE (
  track_id uuid,
  track_title text,
  track_created_at timestamptz,
  version_id uuid,
  version_name text,
  version_created_at timestamptz,
  cost_eur numeric,
  audio_duration_sec numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF (auth.jwt() ->> 'email') IS DISTINCT FROM 'berdugo.david@gmail.com' THEN
    RAISE EXCEPTION 'Forbidden — admin only';
  END IF;

  RETURN QUERY
  SELECT
    t.id AS track_id,
    t.title::text AS track_title,
    t.created_at AS track_created_at,
    v.id AS version_id,
    v.name::text AS version_name,
    v.created_at AS version_created_at,
    -- Coût de l'analyse de cette version (jointure best-effort sur user_id + timestamp proche)
    -- Note : analysis_cost_logs n'a pas de version_id, on rattache par user_id et
    -- proximité temporelle. Approximatif mais suffisant pour visualisation.
    (
      SELECT cl.total_eur FROM public.analysis_cost_logs cl
      WHERE cl.user_id = target_user_id
        AND cl.created_at >= v.created_at
        AND cl.created_at <= v.created_at + interval '5 minutes'
      ORDER BY cl.created_at ASC
      LIMIT 1
    ) AS cost_eur,
    (
      SELECT cl.audio_duration_sec FROM public.analysis_cost_logs cl
      WHERE cl.user_id = target_user_id
        AND cl.created_at >= v.created_at
        AND cl.created_at <= v.created_at + interval '5 minutes'
      ORDER BY cl.created_at ASC
      LIMIT 1
    ) AS audio_duration_sec
  FROM public.tracks t
  LEFT JOIN public.versions v ON v.track_id = t.id
  WHERE t.user_id = target_user_id
  ORDER BY t.created_at DESC, v.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_user_detail(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_get_user_detail(uuid) TO authenticated;

COMMIT;

-- =============================================================
-- Fin migration 013.
-- Rollback :
--   DROP FUNCTION IF EXISTS public.admin_get_user_detail(uuid);
--   DROP FUNCTION IF EXISTS public.admin_get_global_stats();
--   DROP FUNCTION IF EXISTS public.admin_get_user_stats();
--   DROP POLICY IF EXISTS "revenue_logs_select_admin" ON public.revenue_logs;
--   DROP POLICY IF EXISTS "revenue_logs_insert_service_role" ON public.revenue_logs;
--   DROP TABLE IF EXISTS public.revenue_logs;
-- =============================================================
