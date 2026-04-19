-- =============================================================
-- Migration 003 — Persistance du chat par version
-- =============================================================
-- À appliquer une seule fois, via Supabase Studio → SQL Editor → Run.
-- Script idempotent (safe à ré-exécuter).
--
-- Effets :
--   • `versions` gagne une colonne `chat_history` (jsonb, défaut [])
--     qui stocke l'historique de la conversation IA pour CETTE version.
--
-- Choix de modèle :
--   • Colonne dédiée (et non `analysis_result.chatHistory`) pour que
--     la fiche publique (RPC get_public_fiche) n'expose PAS le chat,
--     qui est personnel. La RPC ne lit que `analysis_result`.
--
--   • Format :
--       [
--         { "role": "user",      "content": "…" },
--         { "role": "assistant", "content": "…" },
--         …
--       ]
--
-- RLS : versions est déjà owner-only → inutile d'ajouter une policy.
-- =============================================================

BEGIN;

ALTER TABLE public.versions
  ADD COLUMN IF NOT EXISTS chat_history jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMIT;

-- =============================================================
-- Fin migration 003.
-- Rollback (à ne lancer qu'en cas de pépin) :
--   ALTER TABLE public.versions DROP COLUMN IF EXISTS chat_history;
-- =============================================================
