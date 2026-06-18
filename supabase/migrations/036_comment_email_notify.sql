-- =============================================================
-- Migration 036 — Notification email au propriétaire sur commentaire
-- =============================================================
-- À appliquer une seule fois, via Supabase Studio → SQL Editor → Run.
-- Script idempotent (safe à ré-exécuter).
--
-- Contexte (Collaboration — Phase 1, suite) :
--   Quand quelqu'un d'AUTRE que le propriétaire commente une fiche
--   (via le lien partagé), on prévient le propriétaire par email.
--   Tout se passe dans la base (pg_net + Vault) — ZÉRO dépendance au
--   backend Railway. Les secrets Resend vivent dans Vault.
--
-- Sécurité / robustesse :
--   • Le trigger est AFTER INSERT et entièrement enveloppé dans un
--     EXCEPTION WHEN OTHERS → il ne fait JAMAIS échouer l'insertion
--     d'un commentaire (un email raté ne casse rien).
--   • net.http_post est asynchrone (file pg_net) → n'attend pas Resend.
--   • Si les secrets Vault ne sont pas configurés, le trigger ne fait
--     rien (feature inactive par défaut, à activer en posant 2 secrets).
--   • On ne notifie pas l'auteur de son propre commentaire.
--
-- ACTIVATION (à faire une fois, dans le SQL Editor, avec TA vraie clé) :
--   select vault.create_secret('re_xxxxxxxx', 'resend_api_key');
--   select vault.create_secret('Versions <notifications@versions.studio>', 'resend_from');
--   -- (utilise la même adresse expéditrice que tes autres emails Resend,
--   --  c.-à-d. un domaine vérifié dans ton compte Resend.)
-- =============================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.notify_owner_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_owner_id     uuid;
  v_owner_email  text;
  v_track_title  text;
  v_version_name text;
  v_token        text;
  v_resend_key   text;
  v_from         text;
  v_base_url     text := 'https://versions.studio';
  v_link         text;
  v_subject      text;
  v_html         text;
  v_safe_body    text;
BEGIN
  -- Contexte de la fiche + email du propriétaire (auth.users).
  SELECT t.user_id, u.email, t.title, ver.name, ver.public_share_token
    INTO v_owner_id, v_owner_email, v_track_title, v_version_name, v_token
  FROM public.versions ver
  JOIN public.tracks t   ON t.id = ver.track_id
  JOIN auth.users u      ON u.id = t.user_id
  WHERE ver.id = NEW.version_id;

  -- Pas de propriétaire trouvé, pas d'email, ou auteur = propriétaire → on sort.
  IF v_owner_email IS NULL OR v_owner_id IS NULL OR NEW.author_id = v_owner_id THEN
    RETURN NEW;
  END IF;

  -- Secrets Resend (Vault). Absents → feature inactive, on sort sans bruit.
  SELECT decrypted_secret INTO v_resend_key
    FROM vault.decrypted_secrets WHERE name = 'resend_api_key' LIMIT 1;
  SELECT decrypted_secret INTO v_from
    FROM vault.decrypted_secrets WHERE name = 'resend_from' LIMIT 1;
  IF v_resend_key IS NULL OR v_from IS NULL THEN
    RETURN NEW;
  END IF;

  -- Lien vers la fiche : le lien partagé si dispo, sinon le dashboard.
  v_link := CASE
    WHEN v_token IS NOT NULL THEN v_base_url || '/p/' || v_token
    ELSE v_base_url || '/dashboard'
  END;

  -- Échappe le corps pour ne pas casser le HTML.
  v_safe_body := replace(replace(replace(coalesce(NEW.body, ''), '&', '&amp;'), '<', '&lt;'), '>', '&gt;');

  v_subject := 'Nouveau commentaire sur ' || coalesce(v_track_title, 'ta fiche')
               || ' — ' || coalesce(v_version_name, '');

  v_html :=
    '<div style="font-family:''DM Sans'',Arial,sans-serif;background:#0f0f12;padding:28px;color:#eaeaea">'
    || '<div style="max-width:520px;margin:0 auto;background:#17171c;border:1px solid #2a2a31;border-radius:16px;padding:24px">'
    || '<div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#f5b056;font-weight:700">VERSIONS</div>'
    || '<h1 style="font-size:18px;margin:10px 0 4px;color:#fff">Nouveau commentaire</h1>'
    || '<p style="font-size:14px;color:#a9a9b2;margin:0 0 18px">'
    || coalesce(replace(replace(NEW.author_name,'&','&amp;'),'<','&lt;'), 'Quelqu''un')
    || ' a commenté <b style="color:#fff">' || coalesce(replace(replace(v_track_title,'&','&amp;'),'<','&lt;'), 'ta fiche') || '</b>'
    || CASE WHEN v_version_name IS NOT NULL AND v_version_name <> '' THEN ' (' || replace(replace(v_version_name,'&','&amp;'),'<','&lt;') || ')' ELSE '' END
    || '.</p>'
    || '<div style="background:#0f0f12;border-left:3px solid #f5b056;border-radius:8px;padding:12px 14px;font-size:14px;line-height:1.5;color:#e2e2e8;white-space:pre-wrap">'
    || v_safe_body || '</div>'
    || '<div style="margin-top:22px"><a href="' || v_link || '" '
    || 'style="display:inline-block;background:linear-gradient(135deg,#f5b056,#d4900e);color:#1a1206;text-decoration:none;font-weight:700;font-size:14px;padding:11px 20px;border-radius:10px">Voir la fiche</a></div>'
    || '<p style="font-size:11px;color:#6c6c76;margin-top:22px">Tu reçois cet email car on a commenté une de tes fiches Versions.</p>'
    || '</div></div>';

  PERFORM net.http_post(
    url     := 'https://api.resend.com/emails',
    body    := jsonb_build_object(
                 'from',    v_from,
                 'to',      jsonb_build_array(v_owner_email),
                 'subject', v_subject,
                 'html',    v_html
               ),
    params  := '{}'::jsonb,
    headers := jsonb_build_object(
                 'Authorization', 'Bearer ' || v_resend_key,
                 'Content-Type',  'application/json'
               ),
    timeout_milliseconds := 5000
  );

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Un email raté ne doit JAMAIS empêcher l'enregistrement du commentaire.
  RAISE WARNING 'notify_owner_on_comment failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_owner_on_comment ON public.fiche_comments;
CREATE TRIGGER trg_notify_owner_on_comment
  AFTER INSERT ON public.fiche_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_owner_on_comment();

COMMIT;

-- =============================================================
-- Fin migration 036.
-- Rollback :
--   DROP TRIGGER IF EXISTS trg_notify_owner_on_comment ON public.fiche_comments;
--   DROP FUNCTION IF EXISTS public.notify_owner_on_comment();
-- Désactiver sans rollback : supprimer les secrets Vault
--   ('resend_api_key' / 'resend_from') → le trigger devient inerte.
-- =============================================================
