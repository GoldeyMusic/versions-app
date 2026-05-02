-- =============================================================
-- Migration 023 — Tracking de coût par tour de chat
-- =============================================================
-- À appliquer une seule fois, via Supabase Studio → SQL Editor → Run.
-- Script idempotent (safe à ré-exécuter).
--
-- Contexte (session 2026-05-03) :
--   Le dashboard #/admin trackait jusqu'ici uniquement les coûts
--   des analyses (analysis_cost_logs, migration 012). Le chat de
--   fiche, lui, partait dans la nature : tokens accumulés dans
--   le _usage de lib/claude.js mais jamais inscrits en base.
--
--   Cette table loggue UNE LIGNE PAR TOUR DE CHAT (un échange
--   user → assistant). Insérée par decode-api/lib/costTracker.js
--   via logChatCost() à la fin de api/_chat.js.
--
--   Particularité : on track 3 types de tokens INPUT pour Claude
--   parce qu'on active le prompt caching :
--     - input_tokens         : tokens facturés au tarif plein
--     - cache_creation_tokens: tokens écrits en cache (×1.25 du tarif input)
--     - cache_read_tokens    : tokens lus depuis le cache (×0.10 du tarif input)
--
--   Sans ces 3 colonnes séparées, on ne peut pas mesurer le gain
--   réel du caching et on surestime/sous-estime le coût.
--
--   RLS identique à analysis_cost_logs : INSERT service_role,
--   SELECT admin only (berdugo.david@gmail.com).
-- =============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.chat_cost_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Version de la fiche d'où le chat est lancé (peut être NULL pour
  -- les chats hors-fiche éventuels, ou si la version a été supprimée).
  version_id uuid,
  -- Nombre de messages dans l'historique au moment de l'appel
  -- (pour mesurer la croissance du coût avec la longueur de la conv).
  message_count integer NOT NULL DEFAULT 0,
  -- Si la requête a été enrichie avec PureMix RAG ce tour-ci.
  rag_used boolean NOT NULL DEFAULT false,
  -- Locale (fr/en) — utile pour debug.
  locale text,

  -- Tokens Claude — 3 buckets distincts à cause du caching.
  claude_in_tokens integer NOT NULL DEFAULT 0,
  claude_cache_creation_tokens integer NOT NULL DEFAULT 0,
  claude_cache_read_tokens integer NOT NULL DEFAULT 0,
  claude_out_tokens integer NOT NULL DEFAULT 0,

  -- Coûts en EUR.
  -- claude_eur agrège les 3 buckets (in standard + creation×1.25 + read×0.10 + out).
  claude_eur numeric(10, 4) NOT NULL DEFAULT 0,
  -- embedding_eur : coût OpenAI text-embedding-3-small pour le RAG (≈ négligeable
  -- mais on le track quand même, sinon on ne sait pas combien le RAG nous coûte).
  embedding_eur numeric(10, 4) NOT NULL DEFAULT 0,
  total_eur numeric(10, 4) NOT NULL DEFAULT 0,

  claude_model text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index pour agrégations du dashboard.
CREATE INDEX IF NOT EXISTS chat_cost_logs_created_at_idx
  ON public.chat_cost_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS chat_cost_logs_user_id_idx
  ON public.chat_cost_logs (user_id);
CREATE INDEX IF NOT EXISTS chat_cost_logs_version_id_idx
  ON public.chat_cost_logs (version_id);

-- Row Level Security — même posture que analysis_cost_logs.
ALTER TABLE public.chat_cost_logs ENABLE ROW LEVEL SECURITY;

-- INSERT : service_role uniquement (backend decode-api).
DROP POLICY IF EXISTS "chat_cost_logs_insert_service_role"
  ON public.chat_cost_logs;
CREATE POLICY "chat_cost_logs_insert_service_role"
  ON public.chat_cost_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- SELECT : admin only (email hardcodé, cf. migration 012).
DROP POLICY IF EXISTS "chat_cost_logs_select_admin"
  ON public.chat_cost_logs;
CREATE POLICY "chat_cost_logs_select_admin"
  ON public.chat_cost_logs
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'berdugo.david@gmail.com');

COMMIT;

-- =============================================================
-- Fin migration 023.
-- Rollback :
--   DROP POLICY IF EXISTS "chat_cost_logs_select_admin" ON public.chat_cost_logs;
--   DROP POLICY IF EXISTS "chat_cost_logs_insert_service_role" ON public.chat_cost_logs;
--   DROP TABLE IF EXISTS public.chat_cost_logs;
-- =============================================================
