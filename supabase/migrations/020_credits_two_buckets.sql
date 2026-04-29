-- 020_credits_two_buckets.sql
-- Split du balance en 2 buckets : subscription_balance + pack_balance.
--
-- Décision cadrée avec David (2026-04-29, révision) — modèle Splice :
--   - Crédits abo : se cumulent mois après mois tant que l'abo est ACTIF.
--     Pas de reset au renouvellement (≠ décision initiale du 2026-04-29).
--     Purgés intégralement à la résiliation (event customer.subscription.deleted).
--   - Crédits packs : à vie. Survivent à toute résiliation. Inclut signup_bonus.
--   - Débit d'analyse : consomme subscription_balance D'ABORD, puis pack_balance.
--
-- Schéma : on garde balance_remaining comme miroir agrégé pour ne pas casser
-- les lectures existantes (sidebar, admin), et on ajoute les 2 buckets séparés.
-- Invariant : balance_remaining = subscription_balance + pack_balance.
--
-- Pour les RPC :
--   - apply_credit_delta_internal : conservée pour rétrocompat (push tout dans pack
--     si pas de bucket précisé). Marquée DEPRECATED, à dégager après migration des callers.
--   - apply_credit_delta_bucketed (new) : applique sur le bucket explicite.
--   - debit_credits_ordered (new) : consomme sub puis pack en transaction.
--   - purge_subscription_balance (new) : zéro le bucket sub à la résiliation,
--     renvoie le montant purgé pour le credit_event d'audit.

-- ─────────────────────────────────────────────────────────────
-- 1. Colonnes subscription_balance + pack_balance
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.user_credits
  ADD COLUMN IF NOT EXISTS subscription_balance INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pack_balance INTEGER NOT NULL DEFAULT 0;

-- Contraintes nonneg séparées (en plus de la contrainte existante sur balance_remaining).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_credits_sub_balance_nonneg'
  ) THEN
    ALTER TABLE public.user_credits
      ADD CONSTRAINT user_credits_sub_balance_nonneg CHECK (subscription_balance >= 0);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_credits_pack_balance_nonneg'
  ) THEN
    ALTER TABLE public.user_credits
      ADD CONSTRAINT user_credits_pack_balance_nonneg CHECK (pack_balance >= 0);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 2. Backfill
--
-- Phase test : MONETIZATION_ENABLED=false. La quasi-totalité du balance
-- existant vient de seed_test_phase (99 crédits) et éventuellement de
-- manual_admin. Aucun "vrai" crédit abo en circulation puisque le pipeline
-- ne débite pas et qu'aucun abo prod n'a été facturé.
--
-- → On pousse tout le balance_remaining existant dans pack_balance.
-- C'est sûr : ces crédits ne se purgeront pas à la résiliation
-- (comportement attendu pour des seeds de test ou des ajustements admin).
-- ─────────────────────────────────────────────────────────────
UPDATE public.user_credits
SET pack_balance = balance_remaining,
    subscription_balance = 0
WHERE pack_balance = 0 AND subscription_balance = 0 AND balance_remaining > 0;

-- ─────────────────────────────────────────────────────────────
-- 3. RPC apply_credit_delta_bucketed
--   Applique un delta sur le bucket spécifié et met à jour
--   balance_remaining = subscription_balance + pack_balance.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.apply_credit_delta_bucketed(
  target_user_id UUID,
  delta_value INTEGER,
  target_bucket TEXT  -- 'sub' ou 'pack'
)
RETURNS INTEGER  -- nouveau balance_remaining total
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total INTEGER;
BEGIN
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'target_user_id required';
  END IF;
  IF target_bucket NOT IN ('sub', 'pack') THEN
    RAISE EXCEPTION 'invalid bucket: %, must be sub or pack', target_bucket;
  END IF;

  -- INSERT idempotent au cas où la ligne n'existe pas encore.
  INSERT INTO public.user_credits (user_id, balance_remaining, subscription_balance, pack_balance)
  VALUES (target_user_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  IF target_bucket = 'sub' THEN
    UPDATE public.user_credits
    SET subscription_balance = subscription_balance + delta_value,
        balance_remaining = balance_remaining + delta_value,
        updated_at = NOW()
    WHERE user_id = target_user_id
    RETURNING balance_remaining INTO new_total;
  ELSE
    UPDATE public.user_credits
    SET pack_balance = pack_balance + delta_value,
        balance_remaining = balance_remaining + delta_value,
        updated_at = NOW()
    WHERE user_id = target_user_id
    RETURNING balance_remaining INTO new_total;
  END IF;

  RETURN new_total;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_credit_delta_bucketed(UUID, INTEGER, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_credit_delta_bucketed(UUID, INTEGER, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.apply_credit_delta_bucketed(UUID, INTEGER, TEXT) TO service_role;

-- ─────────────────────────────────────────────────────────────
-- 4. RPC debit_credits_ordered
--   Débit d'analyse : consomme subscription_balance D'ABORD,
--   puis pack_balance. Renvoie le nouveau balance_remaining total,
--   ou -1 si le solde est insuffisant (le caller log alors un 402).
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.debit_credits_ordered(
  target_user_id UUID,
  debit_amount INTEGER  -- positif (1 pour 1 analyse)
)
RETURNS INTEGER  -- nouveau balance_remaining, ou -1 si insuffisant
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_sub INTEGER;
  current_pack INTEGER;
  from_sub INTEGER;
  from_pack INTEGER;
BEGIN
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'target_user_id required';
  END IF;
  IF debit_amount IS NULL OR debit_amount <= 0 THEN
    RAISE EXCEPTION 'debit_amount must be a positive integer';
  END IF;

  -- Verrouille la ligne pour éviter une race avec un autre débit.
  SELECT subscription_balance, pack_balance
  INTO current_sub, current_pack
  FROM public.user_credits
  WHERE user_id = target_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN -1;  -- aucun solde
  END IF;

  IF (COALESCE(current_sub, 0) + COALESCE(current_pack, 0)) < debit_amount THEN
    RETURN -1;  -- solde insuffisant
  END IF;

  from_sub := LEAST(COALESCE(current_sub, 0), debit_amount);
  from_pack := debit_amount - from_sub;

  UPDATE public.user_credits
  SET subscription_balance = subscription_balance - from_sub,
      pack_balance = pack_balance - from_pack,
      balance_remaining = balance_remaining - debit_amount,
      updated_at = NOW()
  WHERE user_id = target_user_id;

  RETURN COALESCE(current_sub, 0) + COALESCE(current_pack, 0) - debit_amount;
END;
$$;

REVOKE ALL ON FUNCTION public.debit_credits_ordered(UUID, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.debit_credits_ordered(UUID, INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.debit_credits_ordered(UUID, INTEGER) TO service_role;

-- ─────────────────────────────────────────────────────────────
-- 5. RPC purge_subscription_balance
--   Appelée à la résiliation (event customer.subscription.deleted).
--   Met subscription_balance à 0 et recalcule balance_remaining.
--   Renvoie le montant purgé (à logger comme credit_event signé).
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.purge_subscription_balance(
  target_user_id UUID
)
RETURNS INTEGER  -- montant purgé (positif), 0 si rien à purger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prev_sub INTEGER;
BEGIN
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'target_user_id required';
  END IF;

  SELECT subscription_balance INTO prev_sub
  FROM public.user_credits
  WHERE user_id = target_user_id
  FOR UPDATE;

  IF NOT FOUND OR prev_sub IS NULL OR prev_sub = 0 THEN
    RETURN 0;
  END IF;

  UPDATE public.user_credits
  SET subscription_balance = 0,
      balance_remaining = pack_balance,
      updated_at = NOW()
  WHERE user_id = target_user_id;

  RETURN prev_sub;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_subscription_balance(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.purge_subscription_balance(UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.purge_subscription_balance(UUID) TO service_role;

-- ─────────────────────────────────────────────────────────────
-- 6. Mise à jour de get_or_create_user_credits
--   Renvoie aussi subscription_balance et pack_balance.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_or_create_user_credits()
RETURNS TABLE (
  balance_remaining INTEGER,
  subscription_balance INTEGER,
  pack_balance INTEGER,
  monthly_grant INTEGER,
  monthly_renews_at TIMESTAMPTZ
) AS $$
DECLARE
  uid UUID := auth.uid();
  -- Phase test : 99 crédits initiaux (en bucket pack pour ne pas être purgés).
  -- À ajuster (1 crédit signup_bonus) le jour où on switch en monétisation.
  seed_amount INTEGER := 99;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO public.user_credits (user_id, balance_remaining, pack_balance)
  VALUES (uid, seed_amount, seed_amount)
  ON CONFLICT (user_id) DO NOTHING;

  IF FOUND THEN
    INSERT INTO public.credit_events (user_id, delta, reason, notes)
    VALUES (uid, seed_amount, 'seed_test_phase',
            'Phase test : seed initial avant branchement Stripe.');
  END IF;

  RETURN QUERY
    SELECT uc.balance_remaining, uc.subscription_balance, uc.pack_balance,
           uc.monthly_grant, uc.monthly_renews_at
    FROM public.user_credits uc
    WHERE uc.user_id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_or_create_user_credits() TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- 7. Sanity check post-migration : invariant balance_remaining = sub + pack
--   (assertion best-effort — log un warning si désalignement).
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  desync_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO desync_count
  FROM public.user_credits
  WHERE balance_remaining <> (COALESCE(subscription_balance, 0) + COALESCE(pack_balance, 0));

  IF desync_count > 0 THEN
    RAISE WARNING 'user_credits desync after migration 020: % rows where balance_remaining ≠ sub + pack', desync_count;
  ELSE
    RAISE NOTICE 'user_credits OK after migration 020: invariant balance_remaining = sub + pack respected';
  END IF;
END $$;

COMMENT ON COLUMN public.user_credits.subscription_balance IS
  'Crédits issus d''abos en cours. Cumulés tant que l''abo est actif. Purgés à la résiliation (purge_subscription_balance). Consommés en premier au débit.';
COMMENT ON COLUMN public.user_credits.pack_balance IS
  'Crédits issus de packs one-shot, signup_bonus, manual_admin. À vie, jamais purgés. Consommés après subscription_balance au débit.';
