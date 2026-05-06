-- 027_delete_user_account_admin.sql
-- Crée une RPC `delete_user_account(p_user_id UUID)` callable par le service
-- role uniquement. Mêmes effets que `delete_my_account()` mais paramétrée
-- (au lieu d'utiliser auth.uid()), ce qui permet à l'API backend de
-- supprimer un compte au nom du user après validation d'un token signé
-- (cf. flow "confirmation par email" — versions-api/api/_account.js).
--
-- Pourquoi pas appeler delete_my_account() côté backend ? Cette fonction
-- utilise auth.uid() qui vient du JWT du user. En appel admin (service
-- role), auth.uid() est NULL et la RPC échouerait. La nouvelle fonction
-- accepte explicitement le user_id en paramètre.
--
-- Sécurité : SECURITY DEFINER + REVOKE public/anon/authenticated → seul
-- le service_role (Railway via SUPABASE_SERVICE_ROLE_KEY) peut l'invoquer.
-- Le frontend NE peut PAS l'appeler directement, même avec un Bearer JWT.

CREATE OR REPLACE FUNCTION public.delete_user_account(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id required';
  END IF;

  -- Purge en cascade des tables liées au user.
  -- Ordre IMPORTANT : on supprime les tables enfants AVANT les parents
  -- pour respecter les FK (mix_note_completions → versions → tracks → projects).
  DELETE FROM public.mix_note_completions WHERE user_id = p_user_id;
  DELETE FROM public.comparisons WHERE user_id = p_user_id;
  DELETE FROM public.versions WHERE user_id = p_user_id;
  DELETE FROM public.tracks WHERE user_id = p_user_id;
  DELETE FROM public.projects WHERE user_id = p_user_id;
  DELETE FROM public.credit_events WHERE user_id = p_user_id;
  DELETE FROM public.user_credits WHERE user_id = p_user_id;
  DELETE FROM public.analysis_cost_logs WHERE user_id = p_user_id;
  DELETE FROM public.chat_cost_logs WHERE user_id = p_user_id;
  DELETE FROM public.feedback WHERE user_id = p_user_id;
  DELETE FROM public.user_profiles WHERE user_id = p_user_id;
  DELETE FROM public.revenue_logs WHERE user_id = p_user_id;

  -- Suppression de l'auth.users (déclenche le webhook Supabase auth.users
  -- DELETE → notif ops David via /api/internal/notify-deletion).
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Verrouille l'accès : seul le service role (et postgres direct) peut appeler.
REVOKE ALL ON FUNCTION public.delete_user_account(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_user_account(UUID) FROM anon;
REVOKE ALL ON FUNCTION public.delete_user_account(UUID) FROM authenticated;
