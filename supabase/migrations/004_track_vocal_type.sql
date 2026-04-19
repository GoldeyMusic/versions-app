-- =============================================================
-- Migration 004 — Type vocal du titre (chanté / instrumental)
-- =============================================================
-- À appliquer une seule fois, via Supabase Studio → SQL Editor → Run.
-- Script idempotent (safe à ré-exécuter).
--
-- Contexte :
--   Certains titres sont purement instrumentaux (par choix artistique) ;
--   d'autres sont encore sans voix mais en auront ("voix à venir") ;
--   d'autres sont chantés (cas par défaut).
--
--   Le type vocal est une propriété du TITRE (table tracks), pas d'une
--   version, car il caractérise l'œuvre elle-même et est hérité par
--   toutes ses versions.
--
-- Effets :
--   • `tracks` gagne la colonne `vocal_type` (text, défaut 'vocal').
--   • CHECK constraint pour limiter aux 3 valeurs autorisées.
--
-- Valeurs :
--   • 'vocal'                → titre chanté (défaut, comportement actuel)
--   • 'instrumental_pending' → instrumental pour l'instant,
--                              voix attendue sur prochaines versions
--   • 'instrumental_final'   → instrumental définitif (pas de voix prévue)
--
-- Impact en aval :
--   • L'analyse IA adapte son prompt selon vocal_type
--   • La fiche masque la section voix pour 'instrumental_final'
--   • Le score global est re-calibré (sans voix) pour 'instrumental_final'
--
-- RLS : tracks est déjà owner-only → inutile d'ajouter une policy.
-- =============================================================

BEGIN;

ALTER TABLE public.tracks
  ADD COLUMN IF NOT EXISTS vocal_type text NOT NULL DEFAULT 'vocal';

-- CHECK : n'autoriser que les 3 valeurs prévues
-- (utilise DO pour rester idempotent si la contrainte existe déjà)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'tracks_vocal_type_check'
      AND conrelid = 'public.tracks'::regclass
  ) THEN
    ALTER TABLE public.tracks
      ADD CONSTRAINT tracks_vocal_type_check
      CHECK (vocal_type IN ('vocal', 'instrumental_pending', 'instrumental_final'));
  END IF;
END;
$$;

COMMIT;

-- =============================================================
-- Fin migration 004.
-- Rollback (à ne lancer qu'en cas de pépin) :
--   ALTER TABLE public.tracks DROP CONSTRAINT IF EXISTS tracks_vocal_type_check;
--   ALTER TABLE public.tracks DROP COLUMN IF EXISTS vocal_type;
-- =============================================================
