-- 016_user_credits.sql
-- Tables et RPC pour la gestion des crédits utilisateurs.
--
-- Décisions cadrées avec David (2026-04-29) :
--   1. Free tier : 1 crédit offert au signup (en monétisation). Pendant la
--      phase test (avant branchement Stripe), tous les users démarrent à
--      99 crédits — c'est purement visuel, le pipeline ne décrémente pas.
--   2. Crédits issus de packs : pas d'expiration. Disparaissent uniquement
--      à la suppression du compte (ON DELETE CASCADE).
--   3. Crédits issus d'abonnements : reset chaque mois (pas de cumul). À
--      la prochaine facturation, balance_remaining est remis à monthly_grant.
--      Les crédits "pack" (extra) survivent au reset car ils sont mémorisés
--      via les events "purchase_pack" ; logique de reset = la fonction
--      `apply_subscription_reset` qui posera plus tard, gérée par Stripe webhook.
--
-- Schéma événementiel : `user_credits` porte le balance "live" (lecture rapide,
-- une ligne par user). `credit_events` est l'audit trail signé (chaque +/-1
-- avec un motif). Sanity check : SUM(delta) WHERE user_id=X doit toujours
-- égaler balance_remaining (sauf seed initial qui n'est pas event-loggé).
--
-- Pour l'instant : aucune logique de débit/refund branchée dans le pipeline.
-- C'est juste la fondation. Le branchement viendra avec Stripe.

-- ─────────────────────────────────────────────────────────────
-- Table user_credits
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_remaining INTEGER NOT NULL DEFAULT 0,

  -- Quota mensuel issu d'un éventuel abonnement (0 si pas d'abo).
  -- À chaque renouvellement Stripe : balance_remaining := monthly_grant + crédits pack restants.
  monthly_grant INTEGER NOT NULL DEFAULT 0,
  monthly_renews_at TIMESTAMPTZ,

  -- Stripe ids (renseignés quand un abo ou un pack est lié au compte).
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT user_credits_balance_nonneg CHECK (balance_remaining >= 0)
);

CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);

-- ─────────────────────────────────────────────────────────────
-- Table credit_events (audit trail)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.credit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN (
    'signup_bonus',           -- crédits offerts au signup
    'debit_analysis',         -- analyse lancée
    'refund_failed',          -- analyse a échoué, crédit restauré
    'purchase_pack',          -- achat de pack one-shot
    'subscription_grant',     -- crédits mensuels d'un abo
    'subscription_reset',     -- expiration des crédits abo (delta négatif)
    'manual_admin',           -- ajustement manuel via admin
    'seed_test_phase'         -- backfill phase test (99 crédits)
  )),
  job_id TEXT,                          -- ref vers analysis_cost_logs.job_id
  stripe_event_id TEXT UNIQUE,          -- pour idempotence webhooks Stripe
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_events_user_id_created
  ON public.credit_events(user_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- Trigger : updated_at sur user_credits
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_credits_set_updated_at ON public.user_credits;
CREATE TRIGGER user_credits_set_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_user_credits();

-- ─────────────────────────────────────────────────────────────
-- RLS — owner-only
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_credits_select_self ON public.user_credits;
CREATE POLICY user_credits_select_self ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id);

-- Pas de policy INSERT/UPDATE pour les users : seul le service_role
-- (backend, RPC SECURITY DEFINER) peut modifier le balance.

DROP POLICY IF EXISTS credit_events_select_self ON public.credit_events;
CREATE POLICY credit_events_select_self ON public.credit_events
  FOR SELECT USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- RPC get_or_create_user_credits
-- Lue par le front à chaque login pour s'assurer qu'une ligne
-- existe et récupérer le balance courant. Crée la ligne avec
-- 99 crédits seed pendant la phase test.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_or_create_user_credits()
RETURNS TABLE (
  balance_remaining INTEGER,
  monthly_grant INTEGER,
  monthly_renews_at TIMESTAMPTZ
) AS $$
DECLARE
  uid UUID := auth.uid();
  -- Pendant la phase test : 99 crédits initiaux pour tout le monde.
  -- À ajuster (1 crédit) le jour où on switch en monétisation.
  seed_amount INTEGER := 99;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  -- INSERT idempotent grâce au UNIQUE(user_id).
  INSERT INTO public.user_credits (user_id, balance_remaining)
  VALUES (uid, seed_amount)
  ON CONFLICT (user_id) DO NOTHING;

  -- Si on vient juste de créer la ligne, on log l'event seed.
  IF FOUND THEN
    INSERT INTO public.credit_events (user_id, delta, reason, notes)
    VALUES (uid, seed_amount, 'seed_test_phase',
            'Phase test : seed initial avant branchement Stripe.');
  END IF;

  RETURN QUERY
    SELECT uc.balance_remaining, uc.monthly_grant, uc.monthly_renews_at
    FROM public.user_credits uc
    WHERE uc.user_id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_or_create_user_credits() TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- Backfill : seed 99 crédits pour tous les utilisateurs existants
-- (uniquement ceux qui n'ont pas encore de ligne user_credits).
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.user_credits (user_id, balance_remaining)
SELECT u.id, 99
FROM auth.users u
LEFT JOIN public.user_credits uc ON uc.user_id = u.id
WHERE uc.id IS NULL;

INSERT INTO public.credit_events (user_id, delta, reason, notes)
SELECT u.id, 99, 'seed_test_phase',
       'Backfill migration 016 : phase test, seed initial avant Stripe.'
FROM auth.users u
LEFT JOIN public.credit_events ce
  ON ce.user_id = u.id AND ce.reason = 'seed_test_phase'
WHERE ce.id IS NULL;

COMMENT ON TABLE public.user_credits IS
  'Solde courant de crédits par utilisateur. Mis à jour par le pipeline (debit/refund) et par les webhooks Stripe (purchases). Une ligne par user.';
COMMENT ON TABLE public.credit_events IS
  'Audit trail signé : chaque mouvement de crédit avec sa raison. SUM(delta) doit égaler user_credits.balance_remaining.';
