-- Migration 031 — Cache de la fiche complète par empreinte audio + paramètres.
--
-- Pourquoi
-- --------
-- Le cache d'écoute (migration 030) supprime la variance côté perception
-- Gemini, mais Claude reste appelé à chaque upload, ce qui réintroduit une
-- variance résiduelle (température 0 chez Anthropic n'est pas strictement
-- déterministe). Conséquence : pour un même fichier, l'analyse Claude peut
-- osciller sur les cas borderline (typique : une voix bien placée peut être
-- diagnostiquée tantôt LOW 82 tantôt HIGH 58).
--
-- Ce cache va plus loin : on stocke la réponse complète du pipeline d'analyse
-- (fiche Claude + écoute + mesures DSP) keyée sur l'empreinte audio ET les
-- paramètres user-spécifiques qui affectent légitimement le diagnostic
-- (intention artistique, genre déclaré, type d'upload mix/master).
--
-- Effet pratique :
--   - 2 uploads du même fichier avec les mêmes paramètres -> fiche identique
--     (reproductibilité absolue, même sur les cas borderline).
--   - 2 uploads du même fichier avec des paramètres différents -> fiches
--     différentes (chacune cachée séparément).
--   - 2 users différents qui analysent le même fichier avec les mêmes
--     paramètres -> même fiche (effet réseau légitime).
--
-- Clé de cache
-- ------------
-- (audio_hash, params_signature) où params_signature est un SHA-256 court
-- d'un JSON ordonné contenant intent, genre, upload_type. Cette structure
-- modulaire permet d'ajouter d'autres paramètres user-spécifiques plus tard
-- sans changer le schéma DB — il suffit de les inclure dans le calcul de
-- params_signature côté backend.
--
-- Pseudonymisation et purge
-- -------------------------
-- Même logique que le cache d'écoute (migration 030) : contributed_by_user_id
-- sert UNIQUEMENT au purge cascade à la suppression de compte, jamais au
-- lookup. ON DELETE CASCADE garantit la propreté RGPD sans hook RPC.

BEGIN;

CREATE TABLE IF NOT EXISTS public.analysis_cache (
  audio_hash text NOT NULL,
  params_signature text NOT NULL,
  cached_result jsonb NOT NULL,
  contributed_by_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (audio_hash, params_signature)
);

-- Index secondaire sur le contributeur pour que la cascade soit rapide.
CREATE INDEX IF NOT EXISTS idx_analysis_cache_contributor
  ON public.analysis_cache (contributed_by_user_id);

-- RLS : opaque côté client, seul le service_role accède.
ALTER TABLE public.analysis_cache ENABLE ROW LEVEL SECURITY;

COMMIT;
