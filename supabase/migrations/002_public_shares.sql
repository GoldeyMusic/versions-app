-- =============================================================
-- Migration 002 — Lien public lecture seule pour une version
-- =============================================================
-- À appliquer une seule fois, via Supabase Studio → SQL Editor → Run.
-- Script idempotent (safe à ré-exécuter).
--
-- Effets :
--   • `versions` gagne une colonne `public_share_token` (text, nullable, unique)
--   • Une RPC `get_public_fiche(token)` exposée à `anon` renvoie le JSON
--     de la fiche pour un token donné (track_title + version_name +
--     created_at + analysis_result). Aucune autre donnée n'est exposée.
--   • Les policies RLS de `versions` ne sont PAS modifiées : l'accès
--     anonyme passe uniquement par la fonction SECURITY DEFINER, qui
--     sert de porte contrôlée.
--
-- Usage côté front :
--   • Pour activer le partage :
--       UPDATE versions SET public_share_token = <token>
--       WHERE id = :version_id                     (authentifié, RLS
--                                                   owner-only suffit)
--   • Pour consulter un lien :
--       SELECT public.get_public_fiche(:token)     (anon autorisé)
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- 1. Colonne public_share_token sur versions
-- -------------------------------------------------------------
ALTER TABLE public.versions
  ADD COLUMN IF NOT EXISTS public_share_token text;

-- Unicité (permet nullable : plusieurs NULL, mais tokens distincts)
CREATE UNIQUE INDEX IF NOT EXISTS idx_versions_public_share_token
  ON public.versions (public_share_token)
  WHERE public_share_token IS NOT NULL;

-- -------------------------------------------------------------
-- 2. RPC publique : retourne la fiche pour un token donné
-- -------------------------------------------------------------
-- SECURITY DEFINER : s'exécute avec les droits du propriétaire
-- (bypass RLS). On verrouille le search_path pour éviter les
-- schémas hostiles (bonne pratique Supabase).
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
    'analysis_result',  v.analysis_result
  )
  FROM public.versions v
  JOIN public.tracks  t ON t.id = v.track_id
  WHERE v.public_share_token = p_token
  LIMIT 1;
$$;

-- Anon peut exécuter (c'est tout l'intérêt d'un lien public)
GRANT EXECUTE ON FUNCTION public.get_public_fiche(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_fiche(text) TO authenticated;

-- -------------------------------------------------------------
-- 3. Vérification (facultative)
--    Décommente pour tester après activation d'un token :
-- -------------------------------------------------------------
-- SELECT public.get_public_fiche('LE_TOKEN_A_TESTER');

COMMIT;

-- =============================================================
-- Fin migration 002.
-- Rollback complet (à ne lancer qu'en cas de pépin) :
--   DROP FUNCTION IF EXISTS public.get_public_fiche(text);
--   ALTER TABLE public.versions DROP COLUMN IF EXISTS public_share_token;
-- =============================================================
