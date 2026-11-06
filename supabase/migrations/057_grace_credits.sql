-- 057_grace_credits.sql
-- Crédits « grâce » à la résiliation (audit 2026-11-05, chantier tarifs).
--
-- Avant : customer.subscription.deleted → purge_subscription_balance() mettait
-- le bucket abo à 0 (17 et 43 crédits perdus chez deux abonnés résiliés, et la
-- raison n° 1 de ne pas revenir). Désormais le solde abo non consommé est
-- CONVERTI en crédits de grâce valables 90 jours :
--   - user_credits.grace_balance / grace_expires_at (nouveaux champs)
--   - ordre de débit : abo → grâce → pack (debit_credits_ordered)
--   - convert_subscription_to_grace(user, days) : appelée par le webhook
--   - expire_grace_credits() : cron quotidien (pg_cron), journalise en
--     credit_events (reason 'grace_expired')
--   - balance_remaining reste le miroir du total (abo + grâce + pack) pour
--     que le front n'ait rien à changer.
-- purge_subscription_balance() est conservée (inutilisée par le webhook).

ALTER TABLE public.user_credits
  ADD COLUMN IF NOT EXISTS grace_balance INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS grace_expires_at TIMESTAMPTZ;

ALTER TABLE public.credit_events DROP CONSTRAINT IF EXISTS credit_events_reason_check;
ALTER TABLE public.credit_events ADD CONSTRAINT credit_events_reason_check CHECK (
  reason = ANY (ARRAY[
    'signup_bonus', 'debit_analysis', 'refund_failed', 'purchase_pack',
    'subscription_grant', 'subscription_reset', 'manual_admin', 'seed_test_phase',
    'grace_convert', 'grace_expired'
  ])
);

-- ── Débit ordonné : abo → grâce (si non expirée) → pack ────────────────
CREATE OR REPLACE FUNCTION public.debit_credits_ordered(target_user_id uuid, debit_amount integer)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  current_sub INTEGER;
  current_grace INTEGER;
  current_pack INTEGER;
  grace_exp TIMESTAMPTZ;
  from_sub INTEGER;
  from_grace INTEGER;
  from_pack INTEGER;
  usable_grace INTEGER;
BEGIN
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'target_user_id required';
  END IF;
  IF debit_amount IS NULL OR debit_amount <= 0 THEN
    RAISE EXCEPTION 'debit_amount must be a positive integer';
  END IF;

  SELECT subscription_balance, grace_balance, pack_balance, grace_expires_at
  INTO current_sub, current_grace, current_pack, grace_exp
  FROM public.user_credits
  WHERE user_id = target_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN -1;
  END IF;

  -- Grâce expirée : on la neutralise au passage (le cron la journalisera).
  usable_grace := CASE WHEN grace_exp IS NOT NULL AND grace_exp > NOW() THEN COALESCE(current_grace, 0) ELSE 0 END;

  IF (COALESCE(current_sub, 0) + usable_grace + COALESCE(current_pack, 0)) < debit_amount THEN
    RETURN -1;
  END IF;

  from_sub := LEAST(COALESCE(current_sub, 0), debit_amount);
  from_grace := LEAST(usable_grace, debit_amount - from_sub);
  from_pack := debit_amount - from_sub - from_grace;

  UPDATE public.user_credits
  SET subscription_balance = subscription_balance - from_sub,
      grace_balance = grace_balance - from_grace,
      pack_balance = pack_balance - from_pack,
      balance_remaining = balance_remaining - debit_amount,
      updated_at = NOW()
  WHERE user_id = target_user_id;

  RETURN COALESCE(current_sub, 0) + usable_grace + COALESCE(current_pack, 0) - debit_amount;
END;
$$;

-- ── Conversion abo → grâce (webhook customer.subscription.deleted) ──────
CREATE OR REPLACE FUNCTION public.convert_subscription_to_grace(target_user_id uuid, grace_days integer DEFAULT 90)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  prev_sub INTEGER;
  new_exp TIMESTAMPTZ;
BEGIN
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'target_user_id required';
  END IF;

  SELECT subscription_balance INTO prev_sub
  FROM public.user_credits
  WHERE user_id = target_user_id
  FOR UPDATE;

  IF NOT FOUND OR prev_sub IS NULL OR prev_sub <= 0 THEN
    RETURN 0;
  END IF;

  new_exp := NOW() + make_interval(days => GREATEST(1, COALESCE(grace_days, 90)));

  -- balance_remaining ne bouge pas : on déplace le solde d'un bucket à l'autre.
  -- Si une grâce non expirée existe déjà, on cumule et on garde la date la plus lointaine.
  UPDATE public.user_credits
  SET grace_balance = CASE WHEN grace_expires_at IS NOT NULL AND grace_expires_at > NOW()
                           THEN grace_balance + prev_sub ELSE prev_sub END,
      grace_expires_at = CASE WHEN grace_expires_at IS NOT NULL AND grace_expires_at > new_exp
                              THEN grace_expires_at ELSE new_exp END,
      subscription_balance = 0,
      updated_at = NOW()
  WHERE user_id = target_user_id;

  INSERT INTO public.credit_events (user_id, delta, reason, notes)
  VALUES (target_user_id, 0, 'grace_convert',
          format('%s crédits abo convertis en crédits de grâce, valables jusqu''au %s', prev_sub, to_char(new_exp, 'YYYY-MM-DD')));

  RETURN prev_sub;
END;
$$;

-- ── Expiration quotidienne ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.expire_grace_credits()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  r RECORD;
  n INTEGER := 0;
BEGIN
  FOR r IN
    SELECT user_id, grace_balance
    FROM public.user_credits
    WHERE grace_balance > 0 AND grace_expires_at IS NOT NULL AND grace_expires_at <= NOW()
    FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE public.user_credits
    SET balance_remaining = GREATEST(0, balance_remaining - r.grace_balance),
        grace_balance = 0,
        grace_expires_at = NULL,
        updated_at = NOW()
    WHERE user_id = r.user_id;

    INSERT INTO public.credit_events (user_id, delta, reason, notes)
    VALUES (r.user_id, -r.grace_balance, 'grace_expired', 'Crédits de grâce expirés (90 jours après la résiliation)');
    n := n + 1;
  END LOOP;
  RETURN n;
END;
$$;

REVOKE ALL ON FUNCTION public.convert_subscription_to_grace(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.expire_grace_credits() FROM PUBLIC;

-- Cron quotidien 04:10 UTC (pg_cron déjà actif, cf. migration 032).
SELECT cron.schedule('expire-grace-credits', '10 4 * * *', $$ SELECT public.expire_grace_credits(); $$);
