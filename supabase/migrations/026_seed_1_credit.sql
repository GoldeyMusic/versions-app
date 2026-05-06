-- 026_seed_1_credit.sql
-- Réduit le seed initial des nouveaux signups de 5 → 1 crédit.
--
-- Contexte : passage en monétisation prod (2026-05-06). 5 crédits c'était
-- pour la phase test (≈ 5 analyses gratuites pour valider le produit).
-- En prod, on cale sur 1 crédit gratuit = 1 essai pour goûter, puis
-- abonnement / pack pour continuer. Aligne aussi avec le reset à 1 crédit
-- des 18 testeurs existants opéré le 2026-05-05.
--
-- Une seule opération :
--   - Redéfinit la RPC get_or_create_user_credits avec seed_amount = 1
--     et reason = 'signup_bonus' (au lieu de 'seed_test_phase').
--   - Signature inchangée (4 colonnes balance/sub/pack/monthly_grant +
--     monthly_renews_at), donc lectures FE non impactées.
--
-- IMPORTANT : on NE touche PAS aux balances existantes.
--   - Les comptes déjà créés gardent leur solde courant (que ce soit 99,
--     5, ou les 1 crédit des testeurs déjà reset).
--   - Seuls les NOUVEAUX signups (premier appel à la RPC) reçoivent 1.

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
  -- Prod : 1 crédit signup gratuit (en bucket pack pour ne pas être purgé
  -- à la résiliation d'un éventuel abo). Diminué de 5 → 1 (migration 026,
  -- passage prod 2026-05-06).
  seed_amount INTEGER := 1;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO public.user_credits (user_id, balance_remaining, pack_balance)
  VALUES (uid, seed_amount, seed_amount)
  ON CONFLICT (user_id) DO NOTHING;

  IF FOUND THEN
    INSERT INTO public.credit_events (user_id, delta, reason, notes)
    VALUES (uid, seed_amount, 'signup_bonus',
            'Signup bonus : 1 crédit offert à l''inscription (migration 026).');
  END IF;

  RETURN QUERY
    SELECT uc.balance_remaining, uc.subscription_balance, uc.pack_balance,
           uc.monthly_grant, uc.monthly_renews_at
    FROM public.user_credits uc
    WHERE uc.user_id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_or_create_user_credits() TO authenticated;
