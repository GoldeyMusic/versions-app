-- 022_seed_5_credits.sql
-- Réduit le seed initial des nouveaux signups de 99 → 5 crédits.
--
-- Contexte : avec le débit réel par analyse (cf. _analyze.js + débit Splice
-- ordonné), 99 crédits gratuits laissent les nouveaux comptes "infinis"
-- pendant la phase test et la modale "Plus de crédits" ne se déclenche
-- jamais. 5 crédits = volume représentatif d'un mini-essai (≈ 5 analyses
-- avant de devoir s'abonner ou acheter un pack).
--
-- Une seule opération :
--   - Redéfinit la RPC get_or_create_user_credits avec seed_amount=5.
--     Signature inchangée (4 colonnes balance/sub/pack/monthly_grant +
--     monthly_renews_at), donc lectures FE non impactées.
--
-- IMPORTANT : on NE touche PAS aux balances existantes.
--   - Les comptes déjà créés gardent leur solde courant (99 ou autre).
--   - Seuls les NOUVEAUX signups (premier appel à la RPC) reçoivent 5.
--   - Si on voulait aussi ramener les comptes test existants à 5, il
--     faudrait un UPDATE explicite + INSERT credit_events (cf. pattern
--     migration 017). Volontairement omis ici.

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
  -- Phase test : 5 crédits initiaux (en bucket pack pour ne pas être purgés
  -- à la résiliation d'un éventuel abo). Diminué de 99 → 5 (migration 022).
  -- À ajuster (1 crédit signup_bonus) le jour où on switch en monétisation
  -- prod complète.
  seed_amount INTEGER := 5;
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
            'Phase test : seed initial 5 crédits (migration 022).');
  END IF;

  RETURN QUERY
    SELECT uc.balance_remaining, uc.subscription_balance, uc.pack_balance,
           uc.monthly_grant, uc.monthly_renews_at
    FROM public.user_credits uc
    WHERE uc.user_id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_or_create_user_credits() TO authenticated;
