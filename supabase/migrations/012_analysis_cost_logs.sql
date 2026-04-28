-- =============================================================
-- Migration 012 — Tracking de coût par analyse
-- =============================================================
-- À appliquer une seule fois, via Supabase Studio → SQL Editor → Run.
-- Script idempotent (safe à ré-exécuter).
--
-- Contexte (session 2026-04-28) :
--   Pour mesurer le coût réel d'une analyse (Gemini + Claude + Fadr +
--   infra) et alimenter un dashboard admin (#/admin) qui montre :
--   coût moyen, médiane, p95, total mois, top consommateurs.
--
--   Le backend (decode-api) insère une ligne par analyse réussie
--   à la fin de runDiagnosticPhase, avec les usage tokens captés
--   sur les SDK Gemini/Claude + les forfaits Fadr/infra.
--
--   Lecture gatée par RLS : seul l'admin (email hardcodé ci-dessous)
--   peut lire la table. INSERT réservé au service_role (backend).
--
--   Si l'email admin change un jour : créer une migration 013 qui
--   DROP/RECREATE la policy avec le nouvel email.
-- =============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.analysis_cost_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Identifiant éphémère du job côté backend (UUID-like, pas en FK car le job
  -- vit en mémoire et n'est pas persisté). Utile pour debug/corrélation logs.
  job_id text,
  -- Durée du fichier audio analysé (sert à corréler coût vs durée)
  audio_duration_sec numeric,

  -- Tokens captés depuis les SDK
  gemini_in_tokens integer NOT NULL DEFAULT 0,
  gemini_out_tokens integer NOT NULL DEFAULT 0,
  claude_in_tokens integer NOT NULL DEFAULT 0,
  claude_out_tokens integer NOT NULL DEFAULT 0,

  -- Coûts en EUR (calculés par lib/costTracker.js depuis les tokens × tarifs)
  gemini_eur numeric(10, 4) NOT NULL DEFAULT 0,
  claude_eur numeric(10, 4) NOT NULL DEFAULT 0,
  fadr_eur numeric(10, 4) NOT NULL DEFAULT 0,
  infra_eur numeric(10, 4) NOT NULL DEFAULT 0,
  total_eur numeric(10, 4) NOT NULL DEFAULT 0,

  -- Modèles utilisés pour debug ("gemini-2.5-flash", "claude-sonnet-4-6")
  gemini_model text,
  claude_model text,
  -- True si Fadr a été appelé (sinon forfait Fadr = 0)
  fadr_called boolean NOT NULL DEFAULT false,

  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index pour les agrégations du dashboard (par jour, par user)
CREATE INDEX IF NOT EXISTS analysis_cost_logs_created_at_idx
  ON public.analysis_cost_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS analysis_cost_logs_user_id_idx
  ON public.analysis_cost_logs (user_id);

-- Row Level Security
ALTER TABLE public.analysis_cost_logs ENABLE ROW LEVEL SECURITY;

-- INSERT : réservé au service_role (backend decode-api uniquement).
-- L'anon key et les JWT user n'ont aucun droit d'écriture.
DROP POLICY IF EXISTS "analysis_cost_logs_insert_service_role"
  ON public.analysis_cost_logs;
CREATE POLICY "analysis_cost_logs_insert_service_role"
  ON public.analysis_cost_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- SELECT : réservé à l'admin (email hardcodé). Un user normal connecté
-- via JWT Supabase ne voit RIEN. À changer si l'admin change.
DROP POLICY IF EXISTS "analysis_cost_logs_select_admin"
  ON public.analysis_cost_logs;
CREATE POLICY "analysis_cost_logs_select_admin"
  ON public.analysis_cost_logs
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'berdugo.david@gmail.com');

COMMIT;

-- =============================================================
-- Fin migration 012.
-- Rollback :
--   DROP POLICY IF EXISTS "analysis_cost_logs_select_admin" ON public.analysis_cost_logs;
--   DROP POLICY IF EXISTS "analysis_cost_logs_insert_service_role" ON public.analysis_cost_logs;
--   DROP TABLE IF EXISTS public.analysis_cost_logs;
-- =============================================================
