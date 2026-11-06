-- 055_seed_2_credits.sql
-- Passe le seed initial des nouveaux signups de 1 → 2 crédits.
--
-- Contexte (audit 2026-11-05) : 57 utilisateurs sur 64 s'arrêtent après la
-- première analyse. Avec 1 seul crédit, personne ne vit jamais le cycle
-- V1 → V2 (bandeau d'évolution, diagnostic comparatif), qui est la promesse
-- différenciante du produit. 2 crédits = une V1 + une V2 offertes.
--
-- Une seule opération :
--   - Redéfinit la RPC get_or_create_user_credits avec seed_amount = 2
--     (bucket pack, à vie, non purgé à la résiliation d'un éventuel abo).
--   - Signature inchangée (mêmes 5 colonnes), lectures FE non impactées.
--
-- IMPORTANT : on NE touche PAS aux balances existantes.
--   - Seuls les NOUVEAUX signups (premier appel à la RPC) reçoivent 2.
--   - Les comptes déjà créés gardent leur solde courant.

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
  -- 2 crédits signup gratuits = V1 + V2 (migration 055, 2026-11-06).
  seed_amount INTEGER := 2;
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
            'Signup bonus : 2 crédits offerts à l''inscription, V1 + V2 (migration 055).');
  END IF;

  RETURN QUERY
    SELECT uc.balance_remaining, uc.subscription_balance, uc.pack_balance,
           uc.monthly_grant, uc.monthly_renews_at
    FROM public.user_credits uc
    WHERE uc.user_id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_or_create_user_credits() TO authenticated;
