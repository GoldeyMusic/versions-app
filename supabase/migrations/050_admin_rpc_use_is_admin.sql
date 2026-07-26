-- =============================================================
-- Migration 050 — RPC admin (013/014) : check is_admin()
-- =============================================================
-- Appliquée en prod le 2026-07-26.
--
-- Corps fonctionnel identique à 013/014, seul le garde-fou change :
--   avant : auth.jwt() ->> 'email' = 'berdugo.david@gmail.com'
--   après : public.is_admin()  (= appartenance à public.admin_users)
--
-- C'était le TODO laissé en suspens par la migration 025. Les RPC
-- admin_get_plugin_installs (045) et admin_get_funnel (046) utilisaient
-- déjà le bon pattern, elles ne sont pas touchées ici.
-- =============================================================

CREATE OR REPLACE FUNCTION public.admin_get_global_stats()
 RETURNS TABLE(total_users bigint, total_tracks bigint, total_versions bigint, new_signups_30d bigint, total_cost_30d numeric, total_revenue_30d numeric, balance_30d numeric, total_cost_all_time numeric, total_revenue_all_time numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden — admin only';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM auth.users) AS total_users,
    (SELECT COUNT(*) FROM public.tracks) AS total_tracks,
    (SELECT COUNT(*) FROM public.versions) AS total_versions,
    (SELECT COUNT(*) FROM auth.users WHERE created_at >= now() - interval '30 days') AS new_signups_30d,
    COALESCE((SELECT SUM(total_eur) FROM public.analysis_cost_logs WHERE created_at >= now() - interval '30 days'), 0) AS total_cost_30d,
    COALESCE((SELECT SUM(amount_eur) FROM public.revenue_logs WHERE created_at >= now() - interval '30 days'), 0) AS total_revenue_30d,
    COALESCE((SELECT SUM(amount_eur) FROM public.revenue_logs WHERE created_at >= now() - interval '30 days'), 0)
      - COALESCE((SELECT SUM(total_eur) FROM public.analysis_cost_logs WHERE created_at >= now() - interval '30 days'), 0) AS balance_30d,
    COALESCE((SELECT SUM(total_eur) FROM public.analysis_cost_logs), 0) AS total_cost_all_time,
    COALESCE((SELECT SUM(amount_eur) FROM public.revenue_logs), 0) AS total_revenue_all_time;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_get_user_stats()
 RETURNS TABLE(user_id uuid, email text, prenom text, nom text, langue text, signed_up_at timestamp with time zone, last_sign_in_at timestamp with time zone, last_activity timestamp with time zone, projects_count bigint, tracks_count bigint, versions_count bigint, analyses_count bigint, total_cost_eur numeric, total_revenue_eur numeric, balance_eur numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden — admin only';
  END IF;

  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.email::text,
    p.prenom,
    p.nom,
    p.langue,
    u.created_at AS signed_up_at,
    u.last_sign_in_at,
    (
      SELECT MAX(v.created_at)
      FROM public.versions v
      INNER JOIN public.tracks t2 ON t2.id = v.track_id
      WHERE t2.user_id = u.id
    ) AS last_activity,
    COALESCE((SELECT COUNT(*) FROM public.projects pr WHERE pr.user_id = u.id), 0) AS projects_count,
    COALESCE((SELECT COUNT(*) FROM public.tracks t WHERE t.user_id = u.id), 0) AS tracks_count,
    COALESCE((
      SELECT COUNT(*)
      FROM public.versions v
      INNER JOIN public.tracks t2 ON t2.id = v.track_id
      WHERE t2.user_id = u.id
    ), 0) AS versions_count,
    COALESCE((SELECT COUNT(*) FROM public.analysis_cost_logs cl WHERE cl.user_id = u.id), 0) AS analyses_count,
    COALESCE((SELECT SUM(cl.total_eur) FROM public.analysis_cost_logs cl WHERE cl.user_id = u.id), 0) AS total_cost_eur,
    COALESCE((SELECT SUM(rl.amount_eur) FROM public.revenue_logs rl WHERE rl.user_id = u.id), 0) AS total_revenue_eur,
    COALESCE((SELECT SUM(rl.amount_eur) FROM public.revenue_logs rl WHERE rl.user_id = u.id), 0)
      - COALESCE((SELECT SUM(cl.total_eur) FROM public.analysis_cost_logs cl WHERE cl.user_id = u.id), 0)
      AS balance_eur
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  ORDER BY balance_eur ASC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_get_user_detail(target_user_id uuid)
 RETURNS TABLE(track_id uuid, track_title text, track_created_at timestamp with time zone, version_id uuid, version_name text, version_created_at timestamp with time zone, cost_eur numeric, audio_duration_sec numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden — admin only';
  END IF;

  RETURN QUERY
  SELECT
    t.id AS track_id,
    t.title::text AS track_title,
    t.created_at AS track_created_at,
    v.id AS version_id,
    v.name::text AS version_name,
    v.created_at AS version_created_at,
    (
      SELECT cl.total_eur FROM public.analysis_cost_logs cl
      WHERE cl.user_id = target_user_id
        AND cl.created_at >= v.created_at
        AND cl.created_at <= v.created_at + interval '5 minutes'
      ORDER BY cl.created_at ASC
      LIMIT 1
    ) AS cost_eur,
    (
      SELECT cl.audio_duration_sec FROM public.analysis_cost_logs cl
      WHERE cl.user_id = target_user_id
        AND cl.created_at >= v.created_at
        AND cl.created_at <= v.created_at + interval '5 minutes'
      ORDER BY cl.created_at ASC
      LIMIT 1
    ) AS audio_duration_sec
  FROM public.tracks t
  LEFT JOIN public.versions v ON v.track_id = t.id
  WHERE t.user_id = target_user_id
  ORDER BY t.created_at DESC, v.created_at DESC;
END;
$function$;
