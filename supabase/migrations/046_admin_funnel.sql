-- 046_admin_funnel.sql
-- Section "Parcours d'entrée" du dashboard /admin (décision David
-- 2026-07-10) : le funnel n'est PAS linéaire — certains entrent dans
-- l'écosystème par l'analyse web, d'autres par le plugin DAW. On
-- renvoie donc les 3 dates fondatrices par utilisateur et le front
-- segmente (entrée analyse / entrée plugin / dormants) et construit
-- deux mini-funnels + le KPI de croisement (utilise les deux).
--
--   first_analysis_at : première version uploadée (versions → tracks,
--     versions n'a pas de user_id).
--   first_plugin_at   : première ouverture du plugin (plugin_first_seen,
--     migration 044).
--   first_paid_at     : premier paiement réel (revenue_logs, amount > 0).
--
-- Check admin : appartenance à admin_users via auth.uid() — PAS
-- is_admin() (claim JWT email_verified absent, cf. note migration 045).

CREATE OR REPLACE FUNCTION public.admin_get_funnel()
RETURNS TABLE (
  user_id uuid,
  email text,
  signed_up_at timestamptz,
  first_analysis_at timestamptz,
  first_plugin_at timestamptz,
  first_paid_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.email::text,
    u.created_at AS signed_up_at,
    (
      SELECT MIN(v.created_at)
      FROM public.versions v
      INNER JOIN public.tracks t ON t.id = v.track_id
      WHERE t.user_id = u.id
    ) AS first_analysis_at,
    (
      SELECT pfs.first_seen_at
      FROM public.plugin_first_seen pfs
      WHERE pfs.user_id = u.id
    ) AS first_plugin_at,
    (
      SELECT MIN(r.created_at)
      FROM public.revenue_logs r
      WHERE r.user_id = u.id AND COALESCE(r.amount_eur, 0) > 0
    ) AS first_paid_at
  FROM auth.users u;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_funnel() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_funnel() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_get_funnel() TO authenticated;

-- Rollback :
--   DROP FUNCTION IF EXISTS public.admin_get_funnel();
