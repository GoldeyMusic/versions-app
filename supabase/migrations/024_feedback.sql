-- =============================================================
-- Migration 024 — Retours testeurs (questionnaire in-app)
-- =============================================================
-- À appliquer une seule fois, via Supabase Studio → SQL Editor → Run.
-- Script idempotent (safe à ré-exécuter).
--
-- Contexte (session 2026-05-03) :
--   Phase beta privée — on capte les retours testeurs via une modale
--   in-app (composant FeedbackModal.jsx) déclenchée depuis la sidebar
--   ou la fiche. Une ligne par soumission.
--
--   Les 6 questions du formulaire sont volontairement courtes :
--     - nps          : entier 0..10 (recommanderais-tu Versions ?)
--     - surprise     : qu'est-ce qui t'a le plus surpris dans le diagnostic ?
--     - friction     : moment "j'ai pas compris" ou "ça me sert à rien" ?
--     - paywill      : aurais-tu payé ? à quel prix ça t'aurait paru juste ?
--     - oneliner     : décris Versions en une phrase à un pote musicien
--     - priority     : une chose à changer en priorité ?
--
--   Contexte capté automatiquement (sans questionner le testeur) :
--     - user_id        : auth.uid() au moment de l'envoi
--     - version_id     : si la modale est ouverte depuis une fiche
--     - track_id       : pareil, dénormalisé pour faciliter les jointures
--     - route          : chemin de hash router au moment de l'envoi
--                        (#/dashboard, #/fiche/slug/v2, #/exemple…)
--     - app_version    : optionnel, hash git ou tag passé via env
--                        (utile quand on aura des releases identifiables)
--     - user_agent     : pour distinguer desktop/mobile/iOS sans
--                        recoder de fingerprint
--
--   RLS :
--     - INSERT : tout utilisateur authentifié peut soumettre POUR LUI-MÊME
--                (user_id obligatoire et = auth.uid()).
--     - SELECT : admin only (berdugo.david@gmail.com), comme les autres
--                tables d'observabilité (analysis_cost_logs / chat_cost_logs).
--                On n'expose pas les retours aux autres utilisateurs.
-- =============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Note NPS sur 0..10 (NULL si le testeur n'a pas répondu).
  -- check contraint pour éviter les valeurs aberrantes côté SQL.
  nps smallint,
  CONSTRAINT feedback_nps_range CHECK (nps IS NULL OR (nps >= 0 AND nps <= 10)),

  -- Verbatims libres. text plutôt que varchar pour ne pas couper.
  surprise text,
  friction text,
  paywill text,
  oneliner text,
  priority text,

  -- Contexte de soumission (rempli côté front).
  -- ON DELETE SET NULL pour ne pas perdre le retour si la version est supprimée.
  version_id uuid,
  track_id uuid,
  route text,
  app_version text,
  user_agent text,
  locale text,

  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index pour le futur dashboard de retours (#/admin → onglet Feedback).
CREATE INDEX IF NOT EXISTS feedback_created_at_idx
  ON public.feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS feedback_user_id_idx
  ON public.feedback (user_id);
CREATE INDEX IF NOT EXISTS feedback_nps_idx
  ON public.feedback (nps);

-- Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- INSERT : utilisateur authentifié, doit poser user_id = auth.uid().
DROP POLICY IF EXISTS "feedback_insert_own"
  ON public.feedback;
CREATE POLICY "feedback_insert_own"
  ON public.feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- SELECT : admin only (email hardcodé, cf. migrations 012 / 023).
DROP POLICY IF EXISTS "feedback_select_admin"
  ON public.feedback;
CREATE POLICY "feedback_select_admin"
  ON public.feedback
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'berdugo.david@gmail.com');

COMMIT;

-- =============================================================
-- Fin migration 024.
-- Rollback :
--   DROP POLICY IF EXISTS "feedback_select_admin" ON public.feedback;
--   DROP POLICY IF EXISTS "feedback_insert_own" ON public.feedback;
--   DROP TABLE IF EXISTS public.feedback;
-- =============================================================
