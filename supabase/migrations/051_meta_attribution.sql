-- =============================================================
-- Migration 051 — attribution acquisition (pub Meta & co)
-- =============================================================
-- Contexte (2026-07-26) : campagne Meta Ads lancée, mais rien en DB
-- ne permet de savoir qui vient de la pub. Le pixel Meta envoie ses
-- events VERS Meta, pas vers nous → l'admin /admin est aveugle sur
-- la provenance. On ajoute :
--
--   1. landing_events    : événements ANONYMES de la landing
--      ('visit' + 'cta_click'), avec UTM / fbclid / referrer.
--      Écrits via la RPC log_landing_event (SECURITY DEFINER,
--      exécutable par anon) — pas d'INSERT direct sur la table.
--   2. user_attribution  : première provenance connue d'un COMPTE.
--      First-touch : écrite une seule fois par user via la RPC
--      claim_attribution (ON CONFLICT DO NOTHING), appelée au
--      premier SIGNED_IN (même point que trackPixelSignup).
--   3. RPC admin : admin_get_landing_stats (agrégats jour × source)
--      + admin_get_user_attribution (1 ligne par user attribué).
--
-- Détection Meta SANS UTM : tous les clics sortants de FB/IG portent
-- un `?fbclid=...` auto-ajouté → fbclid=true suffit à marquer 'meta'
-- même si l'URL de l'ad n'a pas d'UTM. Les UTM restent utiles pour
-- distinguer campagnes/ads entre elles.
--
-- Check admin : is_admin() (réparée en 049, pattern des RPC en 050).
-- =============================================================

BEGIN;

-- ── 1. landing_events ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.landing_events (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id   uuid NOT NULL,
  event        text NOT NULL CHECK (event IN ('visit', 'cta_click')),
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  utm_content  text,
  utm_term     text,
  fbclid       boolean NOT NULL DEFAULT false,
  referrer     text,
  landing_path text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS landing_events_created_at_idx ON public.landing_events (created_at);
CREATE INDEX IF NOT EXISTS landing_events_session_idx    ON public.landing_events (session_id);

ALTER TABLE public.landing_events ENABLE ROW LEVEL SECURITY;

-- Lecture : admin uniquement. Aucune policy INSERT/UPDATE/DELETE :
-- l'écriture passe exclusivement par la RPC SECURITY DEFINER.
DROP POLICY IF EXISTS "landing_events admin select" ON public.landing_events;
CREATE POLICY "landing_events admin select"
  ON public.landing_events FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.log_landing_event(
  p_session_id   uuid,
  p_event        text,
  p_utm_source   text DEFAULT NULL,
  p_utm_medium   text DEFAULT NULL,
  p_utm_campaign text DEFAULT NULL,
  p_utm_content  text DEFAULT NULL,
  p_utm_term     text DEFAULT NULL,
  p_fbclid       boolean DEFAULT false,
  p_referrer     text DEFAULT NULL,
  p_landing_path text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  -- Validation silencieuse : on ne throw JAMAIS (le tracking ne doit
  -- pas remonter d'erreur au front, même en cas d'appel malformé).
  IF p_session_id IS NULL OR p_event IS NULL OR p_event NOT IN ('visit', 'cta_click') THEN
    RETURN;
  END IF;

  -- Anti-abus léger : une session navigateur légitime génère quelques
  -- events (1 visit + 1 cta_click par session, re-visites comprises).
  -- Cap à 40 pour qu'un script malveillant ne remplisse pas la table
  -- sur un même session_id (varier le session_id reste possible, mais
  -- le volume reste borné par IP côté Supabase rate limiting).
  SELECT count(*) INTO v_count
  FROM public.landing_events
  WHERE session_id = p_session_id;
  IF v_count >= 40 THEN
    RETURN;
  END IF;

  INSERT INTO public.landing_events
    (session_id, event, utm_source, utm_medium, utm_campaign,
     utm_content, utm_term, fbclid, referrer, landing_path)
  VALUES
    (p_session_id,
     p_event,
     nullif(left(trim(p_utm_source),   120), ''),
     nullif(left(trim(p_utm_medium),   120), ''),
     nullif(left(trim(p_utm_campaign), 160), ''),
     nullif(left(trim(p_utm_content),  160), ''),
     nullif(left(trim(p_utm_term),     160), ''),
     COALESCE(p_fbclid, false),
     nullif(left(trim(p_referrer),     300), ''),
     nullif(left(trim(p_landing_path), 200), ''));
END;
$$;

REVOKE ALL ON FUNCTION public.log_landing_event(uuid, text, text, text, text, text, text, boolean, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_landing_event(uuid, text, text, text, text, text, text, boolean, text, text) TO anon, authenticated;

-- ── 2. user_attribution ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_attribution (
  user_id       uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id    uuid,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  utm_term      text,
  fbclid        boolean NOT NULL DEFAULT false,
  referrer      text,
  landing_path  text,
  -- Date de PREMIÈRE arrivée du navigateur avec cette provenance
  -- (posée côté client au moment de la capture — antérieure au signup
  -- pour un vrai nouvel inscrit). Le front admin compare avec
  -- signed_up_at pour distinguer "inscription venue de la pub" d'un
  -- "user existant revenu via la pub".
  first_seen_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_attribution ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_attribution admin select" ON public.user_attribution;
CREATE POLICY "user_attribution admin select"
  ON public.user_attribution FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.claim_attribution(
  p_session_id    uuid DEFAULT NULL,
  p_utm_source    text DEFAULT NULL,
  p_utm_medium    text DEFAULT NULL,
  p_utm_campaign  text DEFAULT NULL,
  p_utm_content   text DEFAULT NULL,
  p_utm_term      text DEFAULT NULL,
  p_fbclid        boolean DEFAULT false,
  p_referrer      text DEFAULT NULL,
  p_landing_path  text DEFAULT NULL,
  p_first_seen_at timestamptz DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  -- First-touch strict : la première provenance revendiquée gagne,
  -- les appels suivants sont ignorés (idempotent, l'anti-doublon
  -- localStorage côté client n'est qu'une optimisation).
  INSERT INTO public.user_attribution
    (user_id, session_id, utm_source, utm_medium, utm_campaign,
     utm_content, utm_term, fbclid, referrer, landing_path, first_seen_at)
  VALUES
    (auth.uid(),
     p_session_id,
     nullif(left(trim(p_utm_source),   120), ''),
     nullif(left(trim(p_utm_medium),   120), ''),
     nullif(left(trim(p_utm_campaign), 160), ''),
     nullif(left(trim(p_utm_content),  160), ''),
     nullif(left(trim(p_utm_term),     160), ''),
     COALESCE(p_fbclid, false),
     nullif(left(trim(p_referrer),     300), ''),
     nullif(left(trim(p_landing_path), 200), ''),
     COALESCE(p_first_seen_at, now()))
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_attribution(uuid, text, text, text, text, text, boolean, text, text, timestamptz) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.claim_attribution(uuid, text, text, text, text, text, boolean, text, text, timestamptz) FROM anon;
GRANT EXECUTE ON FUNCTION public.claim_attribution(uuid, text, text, text, text, text, boolean, text, text, timestamptz) TO authenticated;

-- ── 3. RPC admin ──────────────────────────────────────────────
-- Dérivation de la source, partagée par les deux RPC :
--   utm_source ∈ {meta, facebook, fb, instagram, ig}  → 'meta'
--   utm_source posé (autre)                           → sa valeur
--   fbclid présent (clic pub/lien FB-IG sans UTM)     → 'meta'
--   referrer facebook/instagram (organique)           → 'meta-organique'
--   pas de referrer                                   → 'direct'
--   sinon                                             → 'autre'
CREATE OR REPLACE FUNCTION public.derive_acquisition_source(
  p_utm_source text,
  p_fbclid     boolean,
  p_referrer   text
)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN lower(COALESCE(p_utm_source, '')) IN ('meta', 'facebook', 'fb', 'instagram', 'ig') THEN 'meta'
    WHEN COALESCE(p_utm_source, '') <> '' THEN lower(p_utm_source)
    WHEN COALESCE(p_fbclid, false) THEN 'meta'
    WHEN p_referrer ILIKE '%facebook.%' OR p_referrer ILIKE '%instagram.%'
      OR p_referrer ILIKE '%fb.me%'    OR p_referrer ILIKE '%fb.com%' THEN 'meta-organique'
    WHEN COALESCE(p_referrer, '') = '' THEN 'direct'
    ELSE 'autre'
  END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_landing_stats(p_days int DEFAULT 30)
RETURNS TABLE (
  day        date,
  source     text,
  visits     bigint,
  cta_clicks bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT
    date(e.created_at) AS day,
    public.derive_acquisition_source(e.utm_source, e.fbclid, e.referrer) AS source,
    count(DISTINCT e.session_id) FILTER (WHERE e.event = 'visit')     AS visits,
    count(DISTINCT e.session_id) FILTER (WHERE e.event = 'cta_click') AS cta_clicks
  FROM public.landing_events e
  WHERE e.created_at >= now() - make_interval(days => GREATEST(p_days, 1))
  GROUP BY 1, 2
  ORDER BY 1;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_landing_stats(int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_landing_stats(int) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_get_landing_stats(int) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_get_user_attribution()
RETURNS TABLE (
  user_id       uuid,
  email         text,
  source        text,
  utm_campaign  text,
  utm_content   text,
  fbclid        boolean,
  referrer      text,
  first_seen_at timestamptz,
  signed_up_at  timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT
    a.user_id,
    u.email::text,
    public.derive_acquisition_source(a.utm_source, a.fbclid, a.referrer) AS source,
    a.utm_campaign,
    a.utm_content,
    a.fbclid,
    a.referrer,
    a.first_seen_at,
    u.created_at AS signed_up_at
  FROM public.user_attribution a
  JOIN auth.users u ON u.id = a.user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_user_attribution() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_user_attribution() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_get_user_attribution() TO authenticated;

COMMIT;

-- =============================================================
-- Rollback :
--   DROP FUNCTION IF EXISTS public.admin_get_user_attribution();
--   DROP FUNCTION IF EXISTS public.admin_get_landing_stats(int);
--   DROP FUNCTION IF EXISTS public.derive_acquisition_source(text, boolean, text);
--   DROP FUNCTION IF EXISTS public.claim_attribution(uuid, text, text, text, text, text, boolean, text, text, timestamptz);
--   DROP FUNCTION IF EXISTS public.log_landing_event(uuid, text, text, text, text, text, text, boolean, text, text);
--   DROP TABLE IF EXISTS public.user_attribution;
--   DROP TABLE IF EXISTS public.landing_events;
-- =============================================================
