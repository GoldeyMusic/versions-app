-- 028_fix_delete_user_account.sql
-- Corrige la fonction `delete_user_account` créée par migration 027 qui
-- supposait à tort que toutes les tables avaient une colonne `user_id`.
-- En réalité :
--   - `comparisons` : pas de user_id, mais `track_id` (FK vers tracks)
--   - `versions`    : pas de user_id, mais `track_id` (FK vers tracks)
--   - `user_profiles` : pas de user_id, `id` (PK) = auth.users.id directement
--
-- La migration 027 plantait au 1er DELETE sur `comparisons` :
--   "column user_id does not exist"
-- Toutes les tables enfants étaient donc préservées, et auth.users ne
-- pouvait pas être supprimé non plus → suppression de compte impossible.
--
-- Cette migration RECREATE la fonction avec les bons WHERE par table.
-- Ordre des DELETE inchangé (respecte les FK : enfants avant parents).

CREATE OR REPLACE FUNCTION public.delete_user_account(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id required';
  END IF;

  -- Tables avec user_id direct (FK vers auth.users)
  DELETE FROM public.mix_note_completions WHERE user_id = p_user_id;

  -- comparisons : pas de user_id, on passe par track_id (FK vers tracks)
  -- IMPORTANT : doit être fait AVANT le DELETE sur tracks ci-dessous
  DELETE FROM public.comparisons
   WHERE track_id IN (SELECT id FROM public.tracks WHERE user_id = p_user_id);

  -- versions : idem, pas de user_id, on passe par track_id
  -- IMPORTANT : doit être fait AVANT le DELETE sur tracks
  DELETE FROM public.versions
   WHERE track_id IN (SELECT id FROM public.tracks WHERE user_id = p_user_id);

  -- Maintenant on peut supprimer tracks (les enfants sont partis)
  DELETE FROM public.tracks WHERE user_id = p_user_id;
  DELETE FROM public.projects WHERE user_id = p_user_id;

  -- Tables annexes avec user_id direct
  DELETE FROM public.credit_events WHERE user_id = p_user_id;
  DELETE FROM public.user_credits WHERE user_id = p_user_id;
  DELETE FROM public.analysis_cost_logs WHERE user_id = p_user_id;
  DELETE FROM public.chat_cost_logs WHERE user_id = p_user_id;
  DELETE FROM public.feedback WHERE user_id = p_user_id;
  DELETE FROM public.revenue_logs WHERE user_id = p_user_id;

  -- user_profiles : id (PK) = auth.users.id directement (1:1 mapping)
  DELETE FROM public.user_profiles WHERE id = p_user_id;

  -- Suppression de auth.users (déclenche le webhook auth.users DELETE
  -- → notif ops David via /api/internal/notify-deletion).
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Verrouille l'accès (idempotent — déjà fait par 027 mais on ré-applique).
REVOKE ALL ON FUNCTION public.delete_user_account(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_user_account(UUID) FROM anon;
REVOKE ALL ON FUNCTION public.delete_user_account(UUID) FROM authenticated;
