-- 017_seed_99_credits.sql
-- Réduit le seed de phase test de 999 → 99 (pour économiser la place
-- dans la sidebar, "99 crédits" tient sur une ligne là où "999 crédits"
-- pousse le pill en hauteur).
--
-- Trois opérations :
--   1) Redéfinit la RPC get_or_create_user_credits avec seed_amount=99
--      (les nouveaux signups recevront 99 et plus 999).
--   2) UPDATE des balances existantes encore à 999 (= comptes qui n'ont
--      pas eu d'autre mouvement). On laisse tranquille les comptes qui
--      auraient déjà été débités via Stripe ou ajustés manuellement.
--   3) Trace dans credit_events l'ajustement (-900 reason='manual_admin')
--      pour préserver la cohérence SUM(delta) = balance_remaining.

-- ─── 1) RPC seed=99 ───
CREATE OR REPLACE FUNCTION public.get_or_create_user_credits()
RETURNS TABLE (
  balance_remaining INTEGER,
  monthly_grant INTEGER,
  monthly_renews_at TIMESTAMPTZ
) AS $$
DECLARE
  uid UUID := auth.uid();
  seed_amount INTEGER := 99;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO public.user_credits (user_id, balance_remaining)
  VALUES (uid, seed_amount)
  ON CONFLICT (user_id) DO NOTHING;

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

-- ─── 2) Ajuste les balances déjà en base : 999 → 99 ───
UPDATE public.user_credits
SET balance_remaining = 99
WHERE balance_remaining = 999;

-- ─── 3) Trace l'ajustement dans credit_events ───
INSERT INTO public.credit_events (user_id, delta, reason, notes)
SELECT user_id, -900, 'manual_admin',
       'Migration 017 : seed phase test ajusté de 999 à 99 pour gain de place sidebar.'
FROM public.user_credits
WHERE balance_remaining = 99
  AND NOT EXISTS (
    SELECT 1 FROM public.credit_events ce
    WHERE ce.user_id = public.user_credits.user_id
      AND ce.reason = 'manual_admin'
      AND ce.delta = -900
  );
