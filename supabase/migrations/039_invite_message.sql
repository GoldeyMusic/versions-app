-- =============================================================
-- Migration 039 — Message facultatif dans l'invitation par email
-- =============================================================
-- Idempotent. Ajoute un message libre à l'invitation email : stocké sur
-- workspace_invites et inséré dans le mail Resend. On REMPLACE la signature
-- de create_project_invite (3 → 4 args) ; on DROP l'ancienne pour éviter
-- l'ambiguïté de surcharge côté PostgREST.
-- =============================================================

BEGIN;

ALTER TABLE public.workspace_invites ADD COLUMN IF NOT EXISTS message text;

DROP FUNCTION IF EXISTS public.create_project_invite(uuid, text, text);

CREATE OR REPLACE FUNCTION public.create_project_invite(
  p_project uuid, p_email text, p_role text DEFAULT 'editor', p_message text DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  v_token       text;
  v_project_nm  text;
  v_resend_key  text;
  v_from        text;
  v_link        text;
  v_email       text := nullif(btrim(lower(coalesce(p_email,''))), '');
  v_msg         text := nullif(btrim(coalesce(p_message,'')), '');
  v_msg_safe    text;
  v_msg_html    text := '';
BEGIN
  IF public.project_role_for_project(p_project) <> 'owner' THEN
    RAISE EXCEPTION 'not_owner';
  END IF;
  IF p_role NOT IN ('viewer','commenter','editor') THEN
    RAISE EXCEPTION 'bad_role';
  END IF;
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'bad_email';
  END IF;

  v_token := public.gen_invite_token();
  INSERT INTO public.workspace_invites (project_id, email, role, token, invited_by, expires_at, max_uses, message)
  VALUES (p_project, v_email, p_role, v_token, auth.uid(), now() + interval '14 days', 1, v_msg);

  SELECT name INTO v_project_nm FROM public.projects WHERE id = p_project;
  v_link := 'https://versions.studio/join/' || v_token;

  IF v_msg IS NOT NULL THEN
    v_msg_safe := replace(replace(replace(v_msg, '&', '&amp;'), '<', '&lt;'), '>', '&gt;');
    v_msg_html := '<div style="margin:0 0 18px;background:#0f0f12;border-left:3px solid #f5b056;border-radius:8px;padding:11px 13px;font-size:14px;line-height:1.5;color:#e2e2e8;white-space:pre-wrap">'
                  || v_msg_safe || '</div>';
  END IF;

  BEGIN
    SELECT decrypted_secret INTO v_resend_key FROM vault.decrypted_secrets WHERE name='resend_api_key' LIMIT 1;
    SELECT decrypted_secret INTO v_from       FROM vault.decrypted_secrets WHERE name='resend_from'     LIMIT 1;
    IF v_resend_key IS NOT NULL AND v_from IS NOT NULL THEN
      PERFORM net.http_post(
        url := 'https://api.resend.com/emails',
        body := jsonb_build_object(
          'from', v_from,
          'to', jsonb_build_array(v_email),
          'subject', 'Tu es invite a collaborer sur ' || coalesce(v_project_nm,'un projet') || ' (Versions)',
          'html',
            '<div style="font-family:''DM Sans'',Arial,sans-serif;background:#0f0f12;padding:28px;color:#eaeaea">'
            || '<div style="max-width:520px;margin:0 auto;background:#17171c;border:1px solid #2a2a31;border-radius:16px;padding:24px">'
            || '<div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#f5b056;font-weight:700">VERSIONS</div>'
            || '<h1 style="font-size:18px;margin:10px 0 6px;color:#fff">Invitation a collaborer</h1>'
            || '<p style="font-size:14px;color:#a9a9b2;margin:0 0 14px">On t''invite a rejoindre <b style="color:#fff">'
            || coalesce(replace(replace(v_project_nm,'&','&amp;'),'<','&lt;'),'un projet')
            || '</b> sur Versions (role : ' || p_role || ').</p>'
            || v_msg_html
            || '<div style="margin-top:6px"><a href="' || v_link || '" style="display:inline-block;background:linear-gradient(135deg,#f5b056,#d4900e);color:#1a1206;text-decoration:none;font-weight:700;font-size:14px;padding:11px 20px;border-radius:10px">Rejoindre le projet</a></div>'
            || '<p style="font-size:11px;color:#6c6c76;margin-top:22px">Lien valable 14 jours.</p>'
            || '</div></div>'
        ),
        params := '{}'::jsonb,
        headers := jsonb_build_object('Authorization','Bearer '||v_resend_key,'Content-Type','application/json'),
        timeout_milliseconds := 5000
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'invite email failed: %', SQLERRM;
  END;

  RETURN jsonb_build_object('token', v_token, 'link', v_link, 'email', v_email, 'role', p_role);
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_project_invite(uuid, text, text, text) TO authenticated;

COMMIT;

-- Rollback :
--   DROP FUNCTION IF EXISTS public.create_project_invite(uuid,text,text,text);
--   (puis recréer la version 3-args de la migration 037 si besoin)
--   ALTER TABLE public.workspace_invites DROP COLUMN IF EXISTS message;
