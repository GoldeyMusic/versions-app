-- =============================================================
-- Migration 011 — Genre musical déclaré + détection auto IA
-- =============================================================
-- À appliquer une seule fois, via Supabase Studio → SQL Editor → Run.
-- Script idempotent (safe à ré-exécuter).
--
-- Contexte (session 2026-04-28) :
--   On ajoute un champ "Genre musical" sur l'écran d'upload, à côté du
--   sélecteur DAW. L'artiste peut soit le saisir librement (texte court),
--   soit cliquer "Choisir automatiquement" → l'IA infère le genre depuis
--   l'écoute Gemini déjà faite (zéro coût supplémentaire), et l'écrit dans
--   `inferred_genre`.
--
--   Trois colonnes sur `versions` (le genre est par version, comme l'intent) :
--     - declared_genre (text)        : saisie texte libre par l'artiste
--     - genre_inferred_by_ai (bool)  : true si l'artiste a cliqué
--                                      "Choisir automatiquement"
--     - inferred_genre (text)        : valeur émise par Claude dans la fiche
--                                      quand genre_inferred_by_ai = true
--
--   Effets :
--     • declared_genre nullable, ≤ 600 chars (cohérent avec version_intent)
--     • genre_inferred_by_ai default false
--     • inferred_genre nullable
-- =============================================================

BEGIN;

ALTER TABLE public.versions
  ADD COLUMN IF NOT EXISTS declared_genre text,
  ADD COLUMN IF NOT EXISTS genre_inferred_by_ai boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS inferred_genre text;

-- Garde-fou de longueur sur le déclaratif (l'inféré est borné par le prompt
-- Claude qui demande ≤ 3 mots, mais on ne contraint pas en SQL pour rester
-- tolérant si le prompt évolue).
ALTER TABLE public.versions
  ADD CONSTRAINT versions_declared_genre_length
  CHECK (declared_genre IS NULL OR length(declared_genre) <= 600);

-- Pas d'index : on lit ces colonnes uniquement par version_id (PK déjà indexée).

COMMIT;

-- =============================================================
-- Fin migration 011.
-- Rollback :
--   ALTER TABLE public.versions
--     DROP CONSTRAINT IF EXISTS versions_declared_genre_length,
--     DROP COLUMN IF EXISTS declared_genre,
--     DROP COLUMN IF EXISTS genre_inferred_by_ai,
--     DROP COLUMN IF EXISTS inferred_genre;
-- =============================================================
