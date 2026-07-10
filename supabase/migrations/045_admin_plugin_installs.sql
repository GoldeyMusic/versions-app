-- 045_admin_plugin_installs.sql
-- Stats installations plugin pour le dashboard /admin (décision David
-- 2026-07-10) : courbe inscriptions + installations par jour, total
-- d'utilisateurs plugin et répartition Mac / Windows.
--
-- plugin_first_seen (migration 044) est en RLS sans policy — seul le
-- service role y accède. Le dashboard admin tourne côté client avec le
-- JWT user : on expose donc une RPC SECURITY DEFINER gatée is_admin()
-- (même pattern que admin_get_user_stats / admin_get_global_stats).
--
-- On renvoie les lignes brutes (1 par installation) plutôt qu'un agrégat
-- par jour : le front calcule la série quotidienne comme il le fait déjà
-- pour les coûts (computeDailySeries), et garde la liberté de changer la
-- fenêtre (30j, 90j…) sans re-migrer. Volumes faibles (1 ligne par user
-- max, ON CONFLICT DO NOTHING) — aucun souci de payload.
--
-- Plateforme : plugin_first_seen ne stocke PAS l'OS (le touch passe par
-- des RPC PostgREST sans user-agent exploitable). On la déduit du
-- DERNIER téléchargement loggé du user (plugin_downloads, migration
-- 043). Best effort : un user installé sans download loggé (binaire
-- partagé, installé avant le gate login) sort en platform NULL →
-- affiché "inconnu" côté admin.
--
-- Les téléchargements en tant que TELS restent volontairement absents
-- de la courbe : doublon avec l'installation réelle, et faux positifs
-- (clics par erreur sur mobile).
--
-- ATTENTION check admin : on ne passe PAS par is_admin() (migration 025)
-- car elle exige un claim JWT top-level 'email_verified' qui n'existe
-- pas dans les JWT Supabase (il vit dans user_metadata) → Forbidden
-- systématique, constaté en prod le 2026-07-10. On check directement
-- l'appartenance à admin_users via auth.uid() — même niveau de sécurité
-- (la table est seedée sur email vérifié). NB : les autres RPC admin
-- (013) utilisent encore le check email hardcodé, le TODO de la 025 n'a
-- jamais été appliqué à leurs corps.

CREATE OR REPLACE FUNCTION public.admin_get_plugin_installs()
RETURNS TABLE (
  user_id uuid,
  email text,
  first_seen_at timestamptz,
  platform text
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
  SELECT p.user_id, p.email, p.first_seen_at, d.platform
  FROM public.plugin_first_seen p
  LEFT JOIN LATERAL (
    SELECT dl.platform
    FROM public.plugin_downloads dl
    WHERE dl.user_id = p.user_id
    ORDER BY dl.created_at DESC
    LIMIT 1
  ) d ON true
  ORDER BY p.first_seen_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_plugin_installs() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_plugin_installs() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_get_plugin_installs() TO authenticated;

-- Rollback :
--   DROP FUNCTION IF EXISTS public.admin_get_plugin_installs();
