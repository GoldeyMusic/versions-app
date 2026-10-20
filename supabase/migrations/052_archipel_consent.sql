-- ════════════════════════════════════════════════════════════════════
-- 052 — Consentement emails Archipel Audio (série centrale « nouvelles
-- d'Archipel », même modèle que Poll the Band, mémo du 2026-10-20).
--
-- Versions est édité par Archipel Audio SAS → base « soft opt-in »
-- (mention + case de refus décochée) pour les comptes créés à partir de
-- la mise en ligne de la mention. Les comptes antérieurs n'ont AUCUNE
-- base : ils n'ont pas de ligne ici (ou une ligne sans basis), et ne
-- rejoignent la série que par un opt-in explicite depuis les Réglages.
-- Rien n'est jamais rempli rétroactivement.
--
-- Règle : l'opposition l'emporte toujours (c'est le consommateur, le
-- cockpit Archipel, qui exclut toute ligne avec archipel_optout_at).
--
-- Tables :
--   archipel_text_versions : textes réellement publiés (preuve). Une
--     nouvelle formulation = une nouvelle ligne + une nouvelle version.
--   archipel_consent : 1 ligne max par compte.
--
-- Écritures UNIQUEMENT via fonctions SECURITY DEFINER :
--   - trigger auth.users AFTER INSERT (inscription email : le front
--     passe archipel_text + archipel_refused dans options.data) ;
--   - archipel_record_signup()   : inscription Google (OAuth), appelée
--     par le front au SIGNED_IN, no-op si compte créé il y a > 1 h ;
--   - archipel_set_preference()  : réglage Oui/Non de la modale Réglages ;
--   - archipel_optout_by_email() : désinscription centrale (service_role).
--
-- Projet Supabase partagé avec Neodis : le trigger ne fait RIEN si le
-- signup ne porte pas de champ archipel_text (cas de toute autre app).
-- Idempotent — safe à rejouer.
-- ════════════════════════════════════════════════════════════════════

-- 1) Textes publiés ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.archipel_text_versions (
  version      text PRIMARY KEY,
  context      text NOT NULL CHECK (context IN ('signup', 'account')),
  locale       text NOT NULL CHECK (locale IN ('fr', 'en')),
  body         text NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.archipel_text_versions ENABLE ROW LEVEL SECURITY;

INSERT INTO public.archipel_text_versions (version, context, locale, body) VALUES
  ('fr-2026-10-A', 'signup', 'fr',
   'Versions est un outil Archipel Audio. On t''enverra de temps en temps nos outils pour musiciens (AudioKit, AudioPass, Poll the Band). Désinscription en un clic dans chaque email. [lien : Politique de confidentialité] — Case décochée par défaut : « Je ne souhaite pas les recevoir »'),
  ('en-2026-10-A', 'signup', 'en',
   'Versions is an Archipel Audio tool. Now and then, we''ll email you our tools for musicians (AudioKit, AudioPass, Poll the Band). One-click unsubscribe in every email. [link: Privacy] — Unchecked by default: "I don''t want to receive them"'),
  ('acct-fr-2026-10-A', 'account', 'fr',
   'Nouvelles d''Archipel Audio — Reçois de temps en temps nos outils pour musiciens (AudioKit, AudioPass, Poll the Band). Désinscription en un clic dans chaque email. [Oui / Non, Non par défaut sans choix antérieur]'),
  ('acct-en-2026-10-A', 'account', 'en',
   'Archipel Audio news — Now and then, get our tools for musicians (AudioKit, AudioPass, Poll the Band). One-click unsubscribe in every email. [Yes / No, No by default without a prior choice]')
ON CONFLICT (version) DO NOTHING;

-- 2) Consentement par compte -------------------------------------------
CREATE TABLE IF NOT EXISTS public.archipel_consent (
  user_id                uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  archipel_basis         text CHECK (archipel_basis IN ('soft_optin', 'optin')),
  archipel_basis_at      timestamptz,
  archipel_text_version  text REFERENCES public.archipel_text_versions(version),
  archipel_optout_at     timestamptz,
  archipel_optout_source text CHECK (archipel_optout_source IN ('form', 'email', 'account', 'central')),
  locale                 text CHECK (locale IN ('fr', 'en')),
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.archipel_consent ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS archipel_consent_select_own ON public.archipel_consent;
CREATE POLICY archipel_consent_select_own ON public.archipel_consent
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Grants explicites (ne pas dépendre des privilèges par défaut) : le front
-- ne fait que LIRE sa propre ligne ; toute écriture passe par les RPC.
REVOKE ALL ON public.archipel_consent FROM anon, authenticated;
REVOKE ALL ON public.archipel_text_versions FROM anon, authenticated;
GRANT SELECT ON public.archipel_consent TO authenticated;
GRANT ALL ON public.archipel_consent TO service_role;
GRANT ALL ON public.archipel_text_versions TO service_role;

-- 3) Capture à l'inscription email (trigger auth.users) ----------------
-- Ne doit JAMAIS faire échouer une inscription : tout est sous
-- EXCEPTION WHEN OTHERS.
CREATE OR REPLACE FUNCTION public.archipel_capture_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_text    text := NEW.raw_user_meta_data->>'archipel_text';
  v_refused boolean;
  v_locale  text;
BEGIN
  IF v_text IS NULL THEN
    RETURN NEW;
  END IF;
  BEGIN
    SELECT locale INTO v_locale
      FROM public.archipel_text_versions
     WHERE version = v_text AND context = 'signup';
    IF NOT FOUND THEN
      RETURN NEW;
    END IF;
    v_refused := lower(coalesce(NEW.raw_user_meta_data->>'archipel_refused', 'false')) IN ('true', '1');
    INSERT INTO public.archipel_consent (
      user_id, archipel_basis, archipel_basis_at, archipel_text_version,
      archipel_optout_at, archipel_optout_source, locale
    ) VALUES (
      NEW.id,
      CASE WHEN v_refused THEN NULL ELSE 'soft_optin' END,
      CASE WHEN v_refused THEN NULL ELSE now() END,
      v_text,
      CASE WHEN v_refused THEN now() END,
      CASE WHEN v_refused THEN 'form' END,
      v_locale
    )
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'archipel_capture_signup failed for %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_archipel_capture_signup ON auth.users;
CREATE TRIGGER trg_archipel_capture_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.archipel_capture_signup();

-- 4) Capture à l'inscription Google (RPC front) ------------------------
-- Le front mémorise le choix avant la redirection OAuth puis appelle
-- cette RPC au SIGNED_IN. Garde-fous : compte créé il y a moins d'1 h
-- (un login d'un compte existant ne crée jamais de base), version
-- publiée, et aucune ligne existante (premier choix seulement).
CREATE OR REPLACE FUNCTION public.archipel_record_signup(p_text_version text, p_refused boolean)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid     uuid := auth.uid();
  v_created timestamptz;
  v_locale  text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN 'no_auth';
  END IF;
  SELECT created_at INTO v_created FROM auth.users WHERE id = v_uid;
  IF v_created IS NULL OR v_created < now() - interval '1 hour' THEN
    RETURN 'not_new';
  END IF;
  SELECT locale INTO v_locale
    FROM public.archipel_text_versions
   WHERE version = p_text_version AND context = 'signup';
  IF NOT FOUND THEN
    RETURN 'unknown_version';
  END IF;
  INSERT INTO public.archipel_consent (
    user_id, archipel_basis, archipel_basis_at, archipel_text_version,
    archipel_optout_at, archipel_optout_source, locale
  ) VALUES (
    v_uid,
    CASE WHEN coalesce(p_refused, false) THEN NULL ELSE 'soft_optin' END,
    CASE WHEN coalesce(p_refused, false) THEN NULL ELSE now() END,
    p_text_version,
    CASE WHEN coalesce(p_refused, false) THEN now() END,
    CASE WHEN coalesce(p_refused, false) THEN 'form' END,
    v_locale
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN 'ok';
END;
$$;

REVOKE ALL ON FUNCTION public.archipel_record_signup(text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.archipel_record_signup(text, boolean) TO authenticated;

-- 5) Réglage Oui/Non depuis la modale Réglages -------------------------
-- Oui = opt-in explicite (basis 'optin', lève une opposition antérieure :
-- c'est un nouveau choix volontaire). Non = opposition (source 'account').
CREATE OR REPLACE FUNCTION public.archipel_set_preference(p_subscribe boolean, p_text_version text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid    uuid := auth.uid();
  v_locale text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN 'no_auth';
  END IF;

  IF p_subscribe THEN
    SELECT locale INTO v_locale
      FROM public.archipel_text_versions
     WHERE version = p_text_version AND context = 'account';
    IF NOT FOUND THEN
      RETURN 'unknown_version';
    END IF;
    INSERT INTO public.archipel_consent AS c (
      user_id, archipel_basis, archipel_basis_at, archipel_text_version, locale
    ) VALUES (
      v_uid, 'optin', now(), p_text_version, v_locale
    )
    ON CONFLICT (user_id) DO UPDATE SET
      archipel_basis         = 'optin',
      archipel_basis_at      = now(),
      archipel_text_version  = EXCLUDED.archipel_text_version,
      archipel_optout_at     = NULL,
      archipel_optout_source = NULL,
      locale                 = coalesce(c.locale, EXCLUDED.locale),
      updated_at             = now();
  ELSE
    INSERT INTO public.archipel_consent AS c (
      user_id, archipel_optout_at, archipel_optout_source
    ) VALUES (
      v_uid, now(), 'account'
    )
    ON CONFLICT (user_id) DO UPDATE SET
      archipel_optout_at     = coalesce(c.archipel_optout_at, now()),
      archipel_optout_source = CASE WHEN c.archipel_optout_at IS NULL THEN 'account' ELSE c.archipel_optout_source END,
      updated_at             = now();
  END IF;
  RETURN 'ok';
END;
$$;

REVOKE ALL ON FUNCTION public.archipel_set_preference(boolean, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.archipel_set_preference(boolean, text) TO authenticated;

-- 6) Désinscription centrale (serveur à serveur, service_role) ---------
-- Idempotente : garde la date de la PREMIÈRE opposition. Email inconnu →
-- false, l'endpoint répond 200 quand même.
CREATE OR REPLACE FUNCTION public.archipel_optout_by_email(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
BEGIN
  SELECT id INTO v_uid
    FROM auth.users
   WHERE lower(email) = lower(trim(p_email))
   LIMIT 1;
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;
  INSERT INTO public.archipel_consent AS c (
    user_id, archipel_optout_at, archipel_optout_source
  ) VALUES (
    v_uid, now(), 'central'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    archipel_optout_at     = coalesce(c.archipel_optout_at, now()),
    archipel_optout_source = CASE WHEN c.archipel_optout_at IS NULL THEN 'central' ELSE c.archipel_optout_source END,
    updated_at             = now();
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.archipel_optout_by_email(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.archipel_optout_by_email(text) TO service_role;
