-- Migration 030 — Cache mutualisé de l'écoute qualitative par empreinte audio.
--
-- Pourquoi
-- --------
-- L'écoute qualitative (perception du morceau) est générée par un modèle d'IA
-- multimodale coûteux. Pour un même fichier binaire, la perception est
-- déterministe à un epsilon près : deux uploads du même fichier doivent
-- produire la même analyse. Aujourd'hui chaque upload re-paie l'appel.
--
-- Ce cache :
--   - garantit la reproductibilité (même hash = même perception cachée)
--   - économise l'appel modèle pour tous les uploads ultérieurs du même fichier
--   - permet un effet réseau légitime : si un utilisateur a déjà analysé un
--     titre commercial, les utilisateurs suivants bénéficient instantanément
--     d'une analyse cohérente.
--
-- Pseudonymisation
-- ----------------
-- L'audio_hash (SHA-256) n'identifie pas une personne, il identifie un fichier.
-- Le contenu cache (listening_json) décrit une œuvre musicale, pas un individu.
-- Le champ contributed_by_user_id sert UNIQUEMENT au purge à la suppression
-- de compte (RGPD : "tout ce que j'ai créé disparaît"). Il n'est jamais
-- utilisé pour le lookup en lecture.
--
-- À la suppression d'un compte, ON DELETE CASCADE retire les lignes du
-- cache contribuées par cet utilisateur — pas besoin de hook RPC séparé.
--
-- Légitimité légale
-- -----------------
-- Couvert par la case copyright à l'upload (migration 029) : tout fichier
-- entré dans le cache l'a été par un utilisateur qui a explicitement
-- affirmé détenir les droits ou être autorisé à analyser le fichier.

BEGIN;

CREATE TABLE IF NOT EXISTS public.gemini_listening_cache (
  audio_hash text PRIMARY KEY,
  listening_json jsonb NOT NULL,
  contributed_by_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Index secondaire sur le contributeur, pour que la cascade soit rapide
-- (Postgres ne crée pas automatiquement d'index sur une colonne FK).
CREATE INDEX IF NOT EXISTS idx_gemini_cache_contributor
  ON public.gemini_listening_cache (contributed_by_user_id);

-- RLS : cache opaque côté client. Seul le service_role (backend) peut
-- lire et écrire. Pas de policy pour anon/authenticated → 100% bloqués.
ALTER TABLE public.gemini_listening_cache ENABLE ROW LEVEL SECURITY;

COMMIT;
