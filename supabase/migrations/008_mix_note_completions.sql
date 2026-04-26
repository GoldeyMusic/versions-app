-- =============================================================
-- Migration 008 — Checklist cochable sur les items diagnostiques
-- =============================================================
-- À appliquer une seule fois, via Supabase Studio → SQL Editor → Run.
-- Script idempotent (safe à ré-exécuter).
--
-- Contexte (Ticket 2.1 du plan AubioMix) :
--   Chaque item diagnostique d'une fiche de version peut être coché
--   par l'utilisateur au fur et à mesure qu'il l'applique dans son
--   DAW. La progression est persistée par version + par item.
--
-- Effets :
--   • Nouvelle table public.mix_note_completions
--   • RLS owner-only (chaque ligne porte user_id = auth.uid())
--   • Index composé (version_id, item_id) pour les lectures fiche
--   • Contrainte unique (user_id, version_id, item_id) pour upsert
-- =============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.mix_note_completions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id   uuid NOT NULL REFERENCES public.versions(id) ON DELETE CASCADE,
  item_id      text NOT NULL,
  completed    boolean NOT NULL DEFAULT true,
  completed_at timestamptz NOT NULL DEFAULT now(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT mix_note_completions_unique
    UNIQUE (user_id, version_id, item_id)
);

CREATE INDEX IF NOT EXISTS mix_note_completions_version_idx
  ON public.mix_note_completions (version_id);

ALTER TABLE public.mix_note_completions ENABLE ROW LEVEL SECURITY;

-- Policy : lecture (chaque utilisateur ne voit que ses propres complétions)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'mix_note_completions'
      AND policyname = 'mix_note_completions owner select'
  ) THEN
    CREATE POLICY "mix_note_completions owner select"
      ON public.mix_note_completions FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END;
$$;

-- Policy : insert (auth.uid() doit correspondre à user_id inséré)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'mix_note_completions'
      AND policyname = 'mix_note_completions owner insert'
  ) THEN
    CREATE POLICY "mix_note_completions owner insert"
      ON public.mix_note_completions FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END;
$$;

-- Policy : update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'mix_note_completions'
      AND policyname = 'mix_note_completions owner update'
  ) THEN
    CREATE POLICY "mix_note_completions owner update"
      ON public.mix_note_completions FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END;
$$;

-- Policy : delete
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'mix_note_completions'
      AND policyname = 'mix_note_completions owner delete'
  ) THEN
    CREATE POLICY "mix_note_completions owner delete"
      ON public.mix_note_completions FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END;
$$;

COMMIT;

-- =============================================================
-- Fin migration 008.
-- Rollback :
--   DROP TABLE IF EXISTS public.mix_note_completions CASCADE;
-- =============================================================
