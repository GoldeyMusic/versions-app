-- =============================================================
-- Migration 025 — Table admin_users + bascule des RLS admin
-- =============================================================
-- À appliquer une seule fois, via Supabase Studio → SQL Editor → Run.
-- Script idempotent (safe à ré-exécuter).
--
-- Contexte (audit sécurité 2026-05-05) :
--   Les RLS admin (analysis_cost_logs 012, revenue_logs/admin views
--   013, chat_cost_logs 023, feedback 024) hardcodent l'email :
--   `auth.jwt() ->> 'email' = 'berdugo.david@gmail.com'`.
--   Si l'email change, toutes les RLS cassent en silence. Et il n'y a
--   pas de check `email_verified`, donc selon la config Supabase Auth
--   un user pourrait théoriquement se signer avec cet email sans
--   l'avoir vérifié.
--
-- Solution :
--   1. Créer une table `admin_users(user_id uuid PRIMARY KEY)`.
--   2. La seed avec David (et potentiellement d'autres admins demain).
--   3. Créer une fonction `is_admin()` qui check `EXISTS … admin_users`
--      ET `email_verified = true`.
--   4. Remplacer toutes les policies admin pour utiliser `is_admin()`.
-- =============================================================

BEGIN;

-- 1. Table admin_users — un user_id par admin. Pas d'autres colonnes
--    (juste un set d'identifiants). REFERENCES auth.users(id) pour
--    cascade auto si l'admin est supprimé (rare, mais propre).
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

-- RLS : aucun accès depuis le client, manipulation via SQL/admin
--       Supabase Studio uniquement. Le service_role bypasse RLS donc
--       les RPC backend peuvent toujours lire si besoin.
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 2. Seed : on récupère David par email vérifié. Sécurise contre le
--    cas pathologique où un autre user aurait cet email non vérifié.
INSERT INTO public.admin_users (user_id, notes)
SELECT id, 'Admin initial — créateur du produit'
FROM auth.users
WHERE email = 'berdugo.david@gmail.com'
  AND email_confirmed_at IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- 3. Fonction is_admin() : check appartenance + email_verified.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users a
    WHERE a.user_id = auth.uid()
  )
  AND COALESCE((auth.jwt() ->> 'email_verified')::boolean, false);
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;

-- =============================================================
-- 4. Bascule des policies admin existantes vers is_admin()
-- =============================================================
-- analysis_cost_logs (migration 012)
DROP POLICY IF EXISTS "Admin only select" ON public.analysis_cost_logs;
CREATE POLICY "Admin only select"
  ON public.analysis_cost_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- chat_cost_logs (migration 023)
DROP POLICY IF EXISTS "Admin only select chat costs" ON public.chat_cost_logs;
CREATE POLICY "Admin only select chat costs"
  ON public.chat_cost_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- feedback (migration 024) — admin-only SELECT
DROP POLICY IF EXISTS "Admin only select feedback" ON public.feedback;
CREATE POLICY "Admin only select feedback"
  ON public.feedback FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- revenue_logs (migration 013) — plusieurs policies admin
DROP POLICY IF EXISTS "Admin only select revenue" ON public.revenue_logs;
CREATE POLICY "Admin only select revenue"
  ON public.revenue_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- =============================================================
-- 5. RPC admin (013) : remplacer le check email par is_admin().
--    On REDÉCLARE chaque fonction admin avec le nouveau check.
-- =============================================================
-- Note : la signature exacte (paramètres, type de retour) doit
-- correspondre à 013_admin_users_and_revenue.sql + 014. Cette
-- migration s'occupe du check d'autorisation interne — elle laisse
-- intact le corps fonctionnel. Si la signature évolue plus tard
-- (nouveau paramètre filtre date par ex.), reprendre cette section.
--
-- Pour ne pas casser silencieusement si une fonction est manquante,
-- on utilise `DO $$ BEGIN … EXCEPTION WHEN undefined_function THEN
-- RAISE NOTICE … END $$;` — mais ici on préfère laisser planter pour
-- forcer l'opérateur à vérifier. Si une fonction admin a été
-- renommée, mettre à jour cette migration en conséquence.

-- admin_get_global_stats — pas de paramètre, retourne global stats
-- L'implémentation est dans 013, on ne l'altère pas ici. À la place
-- on rappelle dans le commentaire qu'elle DOIT vérifier is_admin().
-- En attendant un audit complet du corps des RPC, on note ici le TODO :
--
-- TODO  remplacer dans le corps des fonctions admin_get_*  :
--   IF (auth.jwt() ->> 'email') <> 'berdugo.david@gmail.com' THEN
--     RAISE EXCEPTION 'Forbidden';
--   END IF;
--
-- Par :
--   IF NOT public.is_admin() THEN
--     RAISE EXCEPTION 'Forbidden';
--   END IF;
--
-- À reprendre manuellement (les définitions sont dans 013/014). Sans
-- ça les RPC continuent de marcher pour David tant que son email reste
-- inchangé, mais elles ne profitent pas du check admin_users.

COMMIT;

-- =============================================================
-- Rollback :
--   DROP FUNCTION IF EXISTS public.is_admin();
--   DROP TABLE IF EXISTS public.admin_users;
--   -- Remettre les anciennes policies en hardcodant l'email…
-- =============================================================
