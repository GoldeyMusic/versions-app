-- =============================================================
-- Migration 049 — admin_users devient la SEULE source de vérité
-- =============================================================
-- Appliquée en prod le 2026-07-26.
--
-- Contexte :
--   1. is_admin() (025) exigeait le claim JWT `email_verified` qui
--      n'existe pas au top-level des JWT Supabase (il vit dans
--      user_metadata) → la fonction renvoyait TOUJOURS false.
--      On le remplace par un check sur auth.users.email_confirmed_at.
--   2. Les DROP POLICY de la 025 ciblaient de mauvais noms de policy
--      ("Admin only select" au lieu de "<table>_select_admin") : les
--      anciennes policies hardcodées sur l'email de David coexistaient
--      donc encore (OR permissif). On les supprime pour de bon.
--   3. Seed du 2e admin (David Abakan).
--
-- Cf. migration 050 pour la bascule des RPC admin_get_* sur is_admin().
-- =============================================================

BEGIN;

-- 1. is_admin() réparée -----------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users a
    JOIN auth.users u ON u.id = a.user_id
    WHERE a.user_id = auth.uid()
      AND u.email_confirmed_at IS NOT NULL
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;

-- 2. Seed du 2e admin -------------------------------------------
INSERT INTO public.admin_users (user_id, notes)
SELECT id, 'Admin 2 — David Abakan (ajouté 2026-07-26)'
FROM auth.users
WHERE email = 'davidabakan@gmail.com'
  AND email_confirmed_at IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- 3. Suppression des policies hardcodées ------------------------
DROP POLICY IF EXISTS "analysis_cost_logs_select_admin" ON public.analysis_cost_logs;
DROP POLICY IF EXISTS "chat_cost_logs_select_admin"     ON public.chat_cost_logs;
DROP POLICY IF EXISTS "feedback_select_admin"           ON public.feedback;
DROP POLICY IF EXISTS "revenue_logs_select_admin"       ON public.revenue_logs;

-- Filet de sécurité : on (re)crée les policies is_admin() au cas où
-- l'une d'elles manquerait sur un environnement donné.
DROP POLICY IF EXISTS "Admin only select" ON public.analysis_cost_logs;
CREATE POLICY "Admin only select"
  ON public.analysis_cost_logs FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin only select chat costs" ON public.chat_cost_logs;
CREATE POLICY "Admin only select chat costs"
  ON public.chat_cost_logs FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin only select feedback" ON public.feedback;
CREATE POLICY "Admin only select feedback"
  ON public.feedback FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin only select revenue" ON public.revenue_logs;
CREATE POLICY "Admin only select revenue"
  ON public.revenue_logs FOR SELECT TO authenticated
  USING (public.is_admin());

COMMIT;

-- =============================================================
-- Ajouter / retirer un admin ensuite (aucun redéploiement front) :
--
--   INSERT INTO public.admin_users (user_id, notes)
--   SELECT id, 'motif' FROM auth.users WHERE email = 'x@y.z'
--   ON CONFLICT (user_id) DO NOTHING;
--
--   DELETE FROM public.admin_users
--   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'x@y.z');
-- =============================================================
