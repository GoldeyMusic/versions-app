-- 018_credits_apply_delta_rpc.sql
-- RPC interne pour appliquer un delta de crédit atomiquement.
--
-- Appelée depuis decode-api/lib/credits.js avec le service_role.
-- Évite le pattern read-then-write (race) en faisant l'UPDATE en
-- une seule transaction Postgres. La contrainte CHECK
-- balance_remaining >= 0 (cf. migration 016) protège du
-- débit qui passerait sous zéro : la transaction roll back
-- avec une erreur claire.
--
-- Renvoie le nouveau balance après application.

CREATE OR REPLACE FUNCTION public.apply_credit_delta_internal(
  target_user_id UUID,
  delta_value INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'target_user_id required';
  END IF;

  -- INSERT si absent puis UPDATE — atomique grâce au upsert + RETURNING.
  INSERT INTO public.user_credits (user_id, balance_remaining)
  VALUES (target_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.user_credits
  SET balance_remaining = balance_remaining + delta_value,
      updated_at = NOW()
  WHERE user_id = target_user_id
  RETURNING balance_remaining INTO new_balance;

  RETURN new_balance;
END;
$$;

-- Pas de GRANT EXECUTE TO authenticated : cette RPC est appelée
-- uniquement avec le service_role depuis le backend.
REVOKE ALL ON FUNCTION public.apply_credit_delta_internal(UUID, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_credit_delta_internal(UUID, INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.apply_credit_delta_internal(UUID, INTEGER) TO service_role;
