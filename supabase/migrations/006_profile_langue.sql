-- ─────────────────────────────────────────────────────────────
-- 006_profile_langue.sql
-- Garantit que la colonne `langue` (préférence FR / EN) existe
-- sur la table `profiles`. Idempotent — safe à rejouer.
-- Également : colonne optionnelle `locale` sur `tracks` ou
-- `versions` pour garder la trace de la langue d'origine d'une
-- fiche (certaines fiches ont été générées avant l'i18n côté IA,
-- on les garde telles quelles).
-- ─────────────────────────────────────────────────────────────

-- 1) profiles.langue  ('fr' par défaut, seules valeurs acceptées : 'fr', 'en')
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS langue TEXT NOT NULL DEFAULT 'fr'
    CHECK (langue IN ('fr', 'en'));

-- 2) versions.locale  (langue au moment de la génération de la fiche)
ALTER TABLE IF EXISTS public.versions
  ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'fr'
    CHECK (locale IN ('fr', 'en'));

-- 3) Index léger pour filtrer par langue si besoin
CREATE INDEX IF NOT EXISTS idx_profiles_langue ON public.profiles(langue);

COMMENT ON COLUMN public.profiles.langue  IS 'Préférence de langue de l''utilisateur (fr | en)';
COMMENT ON COLUMN public.versions.locale  IS 'Langue dans laquelle l''analyse a été générée — ne change jamais après coup';
