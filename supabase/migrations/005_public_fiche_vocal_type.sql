-- =============================================================
-- Migration 005 — Expose tracks.vocal_type dans la fiche publique
-- =============================================================
-- À appliquer une seule fois, via Supabase Studio → SQL Editor → Run.
-- Script idempotent (CREATE OR REPLACE), safe à ré-exécuter.
--
-- Contexte :
--   Migration 004 a ajouté tracks.vocal_type. La fiche publique doit
--   respecter le même comportement que la fiche privée : masquer la
--   section voix pour un instrumental définitif, relabeler pour un
--   instrumental temporaire. Pour ça, le consommateur public doit
--   connaître le vocal_type — on l'ajoute au payload de la RPC.
--
-- Effets :
--   • La RPC get_public_fiche(token) renvoie maintenant un champ
--     supplémentaire `vocal_type` (text) à côté des champs existants.
--
-- Pas de modification des RLS ni des tables.
-- =============================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.get_public_fiche(p_token text)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'track_title',      t.title,
    'version_name',     v.name,
    'created_at',       v.created_at,
    'analysis_result',  v.analysis_result,
    'vocal_type',       COALESCE(t.vocal_type, 'vocal')
  )
  FROM public.versions v
  JOIN public.tracks  t ON t.id = v.track_id
  WHERE v.public_share_token = p_token
  LIMIT 1;
$$;

-- Les GRANT sur anon/authenticated restent identiques à migration 002,
-- CREATE OR REPLACE conserve les privilèges existants.

COMMIT;

-- =============================================================
-- Fin migration 005.
-- Rollback (restaure la RPC sans vocal_type — voir migration 002) :
--   CREATE OR REPLACE FUNCTION public.get_public_fiche(p_token text) ...
-- =============================================================
