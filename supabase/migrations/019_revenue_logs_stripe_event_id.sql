-- 019_revenue_logs_stripe_event_id.sql
-- Ajoute une colonne `stripe_event_id` UNIQUE sur revenue_logs pour
-- garantir l'idempotence des webhooks Stripe : si Stripe retry un
-- event (réseau coupé, 5xx côté serveur, etc.), on ne loggue pas
-- deux fois la même recette.
--
-- La colonne `stripe_id` existante reste pour le charge_id ou
-- l'invoice_id (utile pour corréler avec le dashboard Stripe).
-- `stripe_event_id` (= evt_xxx) est un identifiant DIFFÉRENT,
-- celui de l'event qui a déclenché l'INSERT.

ALTER TABLE public.revenue_logs
  ADD COLUMN IF NOT EXISTS stripe_event_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS revenue_logs_stripe_event_id_unique
  ON public.revenue_logs (stripe_event_id)
  WHERE stripe_event_id IS NOT NULL;
