-- =============================================================
-- Migration 038 — Temps réel (collaboration Phase 2)
-- =============================================================
-- À appliquer une seule fois, via Supabase Studio → SQL Editor → Run.
-- Idempotent.
--
-- Ajoute fiche_comments + mix_note_completions à la publication
-- `supabase_realtime` pour que le front reçoive les changements en direct
-- (postgres_changes). REPLICA IDENTITY FULL : pour que les events UPDATE/
-- DELETE transportent toutes les colonnes (dont version_id) → indispensable
-- au filtrage côté client `version_id=eq.<id>`.
--
-- Sécurité : Realtime respecte le RLS via le rôle authenticated. Un membre
-- ne reçoit donc que les changements des fiches auxquelles il a accès
-- (policies de la migration 037). Aucune fuite.
-- =============================================================

BEGIN;

ALTER TABLE public.fiche_comments REPLICA IDENTITY FULL;
ALTER TABLE public.mix_note_completions REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'fiche_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.fiche_comments;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'mix_note_completions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mix_note_completions;
  END IF;
END $$;

COMMIT;

-- =============================================================
-- Rollback :
--   ALTER PUBLICATION supabase_realtime DROP TABLE public.fiche_comments;
--   ALTER PUBLICATION supabase_realtime DROP TABLE public.mix_note_completions;
-- =============================================================
