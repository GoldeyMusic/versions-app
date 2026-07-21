-- 047_plugin_first_seen_platform.sql (2026-07-21)
-- Plateforme stockée sur l'installation RÉELLE (plugin_first_seen) au lieu
-- d'être déduite à la volée du dernier téléchargement. But : OS fiable et
-- fixable, suppression des "inconnu" dès que la source est connue, et canal
-- pour que le plugin déclare lui-même son OS (à venir, nécessite une release).
--
-- Contexte : la plateforme des téléchargements vient du SITE (le download
-- passe par le navigateur, cf. plugin_downloads.platform via req.body). Un
-- user qui OUVRE le plugin sans avoir téléchargé via le site (binaire partagé,
-- install avant tracking) n'a pas de plateforme déduisible → "inconnu".
-- On stocke donc l'OS sur first_seen : backfill depuis les downloads, correction
-- manuelle possible, et à terme le plugin l'envoie via plugin_report_platform().

-- 1) Colonne
ALTER TABLE public.plugin_first_seen ADD COLUMN IF NOT EXISTS platform text;

-- 2) Backfill depuis le dernier téléchargement loggé
UPDATE public.plugin_first_seen fs
SET platform = d.platform
FROM (
  SELECT DISTINCT ON (user_id) user_id, platform
  FROM public.plugin_downloads
  WHERE platform IN ('mac', 'windows')
  ORDER BY user_id, created_at DESC
) d
WHERE d.user_id = fs.user_id AND fs.platform IS NULL;

-- 3) Openers sans download loggé, plateforme fournie par David (2026-07-21)
UPDATE public.plugin_first_seen
SET platform = 'windows'
WHERE user_id IN (
  '2fa7b89b-a4de-4070-a9da-ed9753ef0f9e',  -- kryssnake@gmail.com
  '21797b75-b5ef-4cf7-bd40-18818a513fcd'   -- thimotheciba@gmail.com
) AND platform IS NULL;

-- 4) Canal plugin → OS (nouvelle RPC, ne touche AUCUNE RPC existante).
--    Le plugin (une fois mis à jour) appelle plugin_report_platform au
--    démarrage avec son OS (#if JUCE_MAC / JUCE_WINDOWS). Ne clobbe pas une
--    plateforme déjà connue.
CREATE OR REPLACE FUNCTION public.plugin_report_platform(p_platform text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL OR p_platform NOT IN ('mac', 'windows') THEN RETURN; END IF;
  INSERT INTO public.plugin_first_seen (user_id, email, platform)
  SELECT uid, (SELECT u.email FROM auth.users u WHERE u.id = uid), p_platform
  ON CONFLICT (user_id) DO UPDATE
    SET platform = COALESCE(public.plugin_first_seen.platform, EXCLUDED.platform);
END;
$$;
REVOKE ALL ON FUNCTION public.plugin_report_platform(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.plugin_report_platform(text) TO authenticated;

-- 5) La page /admin utilise la plateforme stockée (fallback = déduction).
CREATE OR REPLACE FUNCTION public.admin_get_plugin_installs()
RETURNS TABLE (user_id uuid, email text, first_seen_at timestamptz, platform text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY
  SELECT p.user_id, p.email, p.first_seen_at, coalesce(p.platform, d.platform) AS platform
  FROM public.plugin_first_seen p
  LEFT JOIN LATERAL (
    SELECT dl.platform FROM public.plugin_downloads dl
    WHERE dl.user_id = p.user_id ORDER BY dl.created_at DESC LIMIT 1
  ) d ON true
  ORDER BY p.first_seen_at DESC;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_get_plugin_installs() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_plugin_installs() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_get_plugin_installs() TO authenticated;
