-- =============================================================
-- Migration 010 — DSP metrics par stem + champ stéréo (Phase 3)
-- =============================================================
-- À appliquer une seule fois, via Supabase Studio → SQL Editor → Run.
-- Script idempotent (safe à ré-exécuter).
--
-- Contexte (DSP_PLAN B.6, session 2026-04-28) :
--   Les mesures DSP "master" (LUFS / LRA / TruePeak) tiennent déjà dans
--   les colonnes existantes versions.lufs (text). Avec la Phase 3 du
--   DSP_PLAN, on ajoute :
--     - mesures par stem (vocal/drums/bass/other) : LUFS + truePeak +
--       énergie bandes 5-8 kHz / 1-3 kHz
--     - mesures du champ stéréo : corrélation L/R, mid/side ratio,
--       balance L/R, mono compat (delta LUFS stéréo - mono)
--
--   Les deux structures sont stockées en jsonb plutôt qu'en colonnes
--   typées car :
--     - le shape évoluera (ajout de bandes, ajout de stems sur upgrade Fadr)
--     - on n'a pas besoin de filtrer/trier dessus (juste lire et afficher)
--     - cohérent avec le pattern analysis_result jsonb déjà en place.
--
-- Effets :
--   • Nouvelles colonnes versions.dsp_stems jsonb (default null)
--   • Nouvelles colonnes versions.dsp_stereo jsonb (default null)
-- =============================================================

BEGIN;

-- Ajout idempotent des colonnes dsp_stems / dsp_stereo
ALTER TABLE public.versions
  ADD COLUMN IF NOT EXISTS dsp_stems jsonb,
  ADD COLUMN IF NOT EXISTS dsp_stereo jsonb;

-- Pas d'index : on n'interroge jamais ces colonnes en filtre, juste en
-- lecture par version_id (déjà indexé via la PK).

COMMIT;

-- =============================================================
-- Fin migration 010.
-- Rollback :
--   ALTER TABLE public.versions
--     DROP COLUMN IF EXISTS dsp_stems,
--     DROP COLUMN IF EXISTS dsp_stereo;
-- =============================================================
