-- =============================================================
-- Migration 014 — Fix admin_get_user_stats (jointure via tracks)
-- =============================================================
-- À appliquer une seule fois après la 013, dans Supabase Studio →
-- SQL Editor → Run.
--
-- Bug corrigé : la version 013 de `admin_get_user_stats()` faisait
-- `WHERE v.user_id = u.id` sur la table `versions`, mais cette table
-- n'a PAS de colonne `user_id` — l'ownership est porté par `tracks`
-- (via tracks.user_id). Conséquence : l'appel RPC plantait avec
-- "column v.user_id does not exist" et la page #/admin affichait Erreur.
--
-- Fix : on remplace les sous-requêtes versions par une jointure sur
-- tracks.
-- =============================================================

BEGIN;

DROP FUNCTION IF EXISTS public.admin_get_user_stats();
CREATE OR REPLACE FUNCTION public.admin_get_user_stats()
RETURNS TABLE (
  user_id uuid,
  email text,
  prenom text,
  nom text,
  langue text,
  signed_up_at timestamptz,
  last_sign_in_at timestamptz,
  last_activity timestamptz,
  projects_count bigint,
  tracks_count bigint,
  versions_count bigint,
  analyses_count bigint,
  total_cost_eur numeric,
  total_revenue_eur numeric,
  balance_eur numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF (auth.jwt() ->> 'email') IS DISTINCT FROM 'berdugo.david@gmail.com' THEN
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
    -- last_activity : dernière version créée sur l'un des titres du user.
    -- Jointure via tracks (versions n'a pas de user_id).
    (
      SELECT MAX(v.created_at)
      FROM public.versions v
      INNER JOIN public.tracks t2 ON t2.id = v.track_id
      WHERE t2.user_id = u.id
    ) AS last_activity,
    COALESCE((SELECT COUNT(*) FROM public.projects pr WHERE pr.user_id = u.id), 0) AS projects_count,
    COALESCE((SELECT COUNT(*) FROM public.tracks t WHERE t.user_id = u.id), 0) AS tracks_count,
    -- versions_count : pareil, jointure via tracks
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
$$;

REVOKE ALL ON FUNCTION public.admin_get_user_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_get_user_stats() TO authenticated;

COMMIT;

-- =============================================================
-- Fin migration 014.
-- =============================================================
