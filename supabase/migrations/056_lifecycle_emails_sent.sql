-- 056_lifecycle_emails_sent.sql
-- Journal des emails « cycle de vie » envoyés (audit 2026-11-05, quick win 7).
--
-- Un seul envoi de chaque email par utilisateur, jamais de relance :
--   - activation_j2  : J+2 après inscription, aucune analyse (web ni express)
--   - example_j7     : J+7, toujours aucune analyse
--   - v2_nudge       : J+3 après la première fiche, pas de V2, ≥ 1 crédit
-- Clé primaire (user_id, kind) = garantie d'unicité côté DB, quel que soit
-- le nombre de passages du cron. Lecture/écriture service_role uniquement
-- (versions-api/lib/lifecycleRunner.js) : RLS activée sans policy.

CREATE TABLE IF NOT EXISTS public.lifecycle_emails_sent (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, kind)
);

ALTER TABLE public.lifecycle_emails_sent ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS lifecycle_emails_sent_sent_at_idx
  ON public.lifecycle_emails_sent (sent_at DESC);
