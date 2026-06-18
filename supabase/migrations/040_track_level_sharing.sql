-- =============================================================
-- Migration 040 — Partage au niveau TITRE (collaboration Phase 2.1)
-- =============================================================
-- À appliquer une seule fois, via Supabase Studio → SQL Editor → Run.
-- Idempotent.
--
-- On peut désormais partager soit un PROJET entier (workspace_members,
-- migration 037), soit un TITRE précis (track_members, ici) — avec des
-- collaborateurs différents par titre.
--
-- PRINCIPE : le rôle effectif sur un titre = le PLUS ÉLEVÉ entre le rôle
-- projet et le rôle titre. Comme tout le RLS passe par les fonctions
-- project_role_for_track/version, il suffit de les enrichir → aucune
-- réécriture de policy métier (on ajuste juste tracks select/update pour
-- qu'ils consultent le rôle TITRE et pas seulement le rôle PROJET).
-- Additif : aucune régression sur l'existant.
-- =============================================================

BEGIN;

-- 1. Table track_members
CREATE TABLE IF NOT EXISTS public.track_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id    uuid NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('viewer','commenter','editor')),
  invited_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT track_members_unique UNIQUE (track_id, user_id)
);
CREATE INDEX IF NOT EXISTS track_members_track_idx ON public.track_members (track_id);
CREATE INDEX IF NOT EXISTS track_members_user_idx  ON public.track_members (user_id);
ALTER TABLE public.track_members ENABLE ROW LEVEL SECURITY;

-- 2. Invitations : portée titre éventuelle
ALTER TABLE public.workspace_invites ADD COLUMN IF NOT EXISTS track_id uuid REFERENCES public.tracks(id) ON DELETE CASCADE;

-- 3. Comparateur de rôles (rang) — pour prendre le max projet/titre
CREATE OR REPLACE FUNCTION public.role_rank(r text)
RETURNS int LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE r WHEN 'owner' THEN 4 WHEN 'editor' THEN 3 WHEN 'commenter' THEN 2 WHEN 'viewer' THEN 1 ELSE 0 END;
$$;
CREATE OR REPLACE FUNCTION public.role_max(a text, b text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN public.role_rank(a) >= public.role_rank(b) THEN a ELSE b END;
$$;

-- 4. project_role_for_track : max(rôle projet, rôle titre)
CREATE OR REPLACE FUNCTION public.project_role_for_track(p_track uuid)
RETURNS text LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT public.role_max(
    public.project_role_for_project((SELECT t.project_id FROM public.tracks t WHERE t.id = p_track)),
    (SELECT tm.role FROM public.track_members tm WHERE tm.track_id = p_track AND tm.user_id = auth.uid())
  );
$$;
-- project_role_for_version inchangée : elle appelle project_role_for_track → bénéficie du titre.

-- 5. RLS track_members
DROP POLICY IF EXISTS "track_members select" ON public.track_members;
CREATE POLICY "track_members select" ON public.track_members FOR SELECT
  USING (public.project_role_for_track(track_id) IS NOT NULL);
DROP POLICY IF EXISTS "track_members owner write" ON public.track_members;
CREATE POLICY "track_members owner write" ON public.track_members FOR ALL
  USING (public.project_role_for_project((SELECT project_id FROM public.tracks WHERE id = track_id)) = 'owner')
  WITH CHECK (public.project_role_for_project((SELECT project_id FROM public.tracks WHERE id = track_id)) = 'owner');

-- 6. Policies tracks : SELECT/UPDATE consultent désormais le rôle TITRE
DROP POLICY IF EXISTS "tracks_select_member" ON public.tracks;
CREATE POLICY "tracks_select_member" ON public.tracks FOR SELECT
  USING (public.project_role_for_track(id) IS NOT NULL);
DROP POLICY IF EXISTS "tracks_update_member" ON public.tracks;
CREATE POLICY "tracks_update_member" ON public.tracks FOR UPDATE
  USING (public.project_role_for_track(id) IN ('owner','editor'))
  WITH CHECK (public.project_role_for_track(id) IN ('owner','editor'));
-- INSERT de track reste un droit PROJET (créer un titre) → policy 037 inchangée.

-- 7. projects : un membre d'un titre peut lire le projet parent (contexte)
DROP POLICY IF EXISTS "projects_select_track_member" ON public.projects;
CREATE POLICY "projects_select_track_member" ON public.projects FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.track_members tm JOIN public.tracks t ON t.id = tm.track_id
    WHERE t.project_id = projects.id AND tm.user_id = auth.uid()
  ));

-- 8. Invitations : ajout du paramètre p_track (portée titre)
DROP FUNCTION IF EXISTS public.create_project_invite(uuid, text, text, text);
CREATE OR REPLACE FUNCTION public.create_project_invite(
  p_project uuid, p_email text, p_role text DEFAULT 'editor', p_message text DEFAULT NULL, p_track uuid DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  v_token       text;
  v_project     uuid := p_project;
  v_scope_name  text;
  v_resend_key  text;
  v_from        text;
  v_link        text;
  v_email       text := nullif(btrim(lower(coalesce(p_email,''))), '');
  v_msg         text := nullif(btrim(coalesce(p_message,'')), '');
  v_msg_safe    text;
  v_msg_html    text := '';
BEGIN
  IF p_track IS NOT NULL THEN
    SELECT project_id INTO v_project FROM public.tracks WHERE id = p_track;
  END IF;
  IF public.project_role_for_project(v_project) <> 'owner' THEN RAISE EXCEPTION 'not_owner'; END IF;
  IF p_role NOT IN ('viewer','commenter','editor') THEN RAISE EXCEPTION 'bad_role'; END IF;
  IF v_email IS NULL THEN RAISE EXCEPTION 'bad_email'; END IF;

  v_token := public.gen_invite_token();
  INSERT INTO public.workspace_invites (project_id, track_id, email, role, token, invited_by, expires_at, max_uses, message)
  VALUES (v_project, p_track, v_email, p_role, v_token, auth.uid(), now() + interval '14 days', 1, v_msg);

  IF p_track IS NOT NULL THEN SELECT title INTO v_scope_name FROM public.tracks WHERE id = p_track;
  ELSE SELECT name INTO v_scope_name FROM public.projects WHERE id = v_project; END IF;
  v_link := 'https://versions.studio/join/' || v_token;

  IF v_msg IS NOT NULL THEN
    v_msg_safe := replace(replace(replace(v_msg, '&', '&amp;'), '<', '&lt;'), '>', '&gt;');
    v_msg_html := '<div style="margin:0 0 18px;background:#0f0f12;border-left:3px solid #f5b056;border-radius:8px;padding:11px 13px;font-size:14px;line-height:1.5;color:#e2e2e8;white-space:pre-wrap">' || v_msg_safe || '</div>';
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
          'subject', 'Tu es invite a collaborer sur ' || coalesce(v_scope_name,'Versions') || ' (Versions)',
          'html',
            '<div style="font-family:''DM Sans'',Arial,sans-serif;background:#0f0f12;padding:28px;color:#eaeaea">'
            || '<div style="max-width:520px;margin:0 auto;background:#17171c;border:1px solid #2a2a31;border-radius:16px;padding:24px">'
            || '<div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#f5b056;font-weight:700">VERSIONS</div>'
            || '<h1 style="font-size:18px;margin:10px 0 6px;color:#fff">Invitation a collaborer</h1>'
            || '<p style="font-size:14px;color:#a9a9b2;margin:0 0 14px">On t''invite a rejoindre '
            || CASE WHEN p_track IS NOT NULL THEN 'le titre ' ELSE 'le projet ' END
            || '<b style="color:#fff">' || coalesce(replace(replace(v_scope_name,'&','&amp;'),'<','&lt;'),'Versions')
            || '</b> sur Versions (role : ' || p_role || ').</p>'
            || v_msg_html
            || '<div style="margin-top:6px"><a href="' || v_link || '" style="display:inline-block;background:linear-gradient(135deg,#f5b056,#d4900e);color:#1a1206;text-decoration:none;font-weight:700;font-size:14px;padding:11px 20px;border-radius:10px">Rejoindre</a></div>'
            || '<p style="font-size:11px;color:#6c6c76;margin-top:22px">Lien valable 14 jours.</p>'
            || '</div></div>'
        ),
        params := '{}'::jsonb,
        headers := jsonb_build_object('Authorization','Bearer '||v_resend_key,'Content-Type','application/json'),
        timeout_milliseconds := 5000
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN RAISE WARNING 'invite email failed: %', SQLERRM; END;

  RETURN jsonb_build_object('token', v_token, 'link', v_link, 'email', v_email, 'role', p_role,
                            'scope', CASE WHEN p_track IS NOT NULL THEN 'track' ELSE 'project' END);
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_project_invite(uuid, text, text, text, uuid) TO authenticated;

-- 9. Lien partageable : portée titre éventuelle
DROP FUNCTION IF EXISTS public.create_project_join_link(uuid, text);
CREATE OR REPLACE FUNCTION public.create_project_join_link(
  p_project uuid, p_role text DEFAULT 'editor', p_track uuid DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE v_token text; v_project uuid := p_project;
BEGIN
  IF p_track IS NOT NULL THEN SELECT project_id INTO v_project FROM public.tracks WHERE id = p_track; END IF;
  IF public.project_role_for_project(v_project) <> 'owner' THEN RAISE EXCEPTION 'not_owner'; END IF;
  IF p_role NOT IN ('viewer','commenter','editor') THEN RAISE EXCEPTION 'bad_role'; END IF;

  SELECT token INTO v_token FROM public.workspace_invites
    WHERE project_id = v_project AND email IS NULL AND role = p_role
      AND track_id IS NOT DISTINCT FROM p_track
    ORDER BY created_at DESC LIMIT 1;

  IF v_token IS NULL THEN
    v_token := public.gen_invite_token();
    INSERT INTO public.workspace_invites (project_id, track_id, email, role, token, invited_by, expires_at, max_uses)
    VALUES (v_project, p_track, NULL, p_role, v_token, auth.uid(), NULL, NULL);
  END IF;

  RETURN jsonb_build_object('token', v_token, 'link', 'https://versions.studio/join/' || v_token, 'role', p_role,
                            'scope', CASE WHEN p_track IS NOT NULL THEN 'track' ELSE 'project' END);
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_project_join_link(uuid, text, uuid) TO authenticated;

-- 10. preview_invite : expose la portée + le nom (projet ou titre)
CREATE OR REPLACE FUNCTION public.preview_invite(p_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
DECLARE r record;
BEGIN
  SELECT i.role, i.expires_at, i.max_uses, i.uses, i.track_id,
         p.name AS project_name, tr.title AS track_title
    INTO r
  FROM public.workspace_invites i
  JOIN public.projects p ON p.id = i.project_id
  LEFT JOIN public.tracks tr ON tr.id = i.track_id
  WHERE i.token = p_token;
  IF NOT FOUND THEN RETURN jsonb_build_object('valid', false, 'reason','not_found'); END IF;
  IF r.expires_at IS NOT NULL AND r.expires_at < now() THEN RETURN jsonb_build_object('valid', false, 'reason','expired'); END IF;
  IF r.max_uses IS NOT NULL AND r.uses >= r.max_uses THEN RETURN jsonb_build_object('valid', false, 'reason','used'); END IF;
  RETURN jsonb_build_object('valid', true, 'role', r.role,
    'scope', CASE WHEN r.track_id IS NOT NULL THEN 'track' ELSE 'project' END,
    'project_name', r.project_name, 'track_title', r.track_title);
END;
$$;
GRANT EXECUTE ON FUNCTION public.preview_invite(text) TO authenticated, anon;

-- 11. accept_project_invite : route vers track_members ou workspace_members
CREATE OR REPLACE FUNCTION public.accept_project_invite(p_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE i public.workspace_invites%ROWTYPE; v_uid uuid := auth.uid(); v_ownr uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO i FROM public.workspace_invites WHERE token = p_token;
  IF NOT FOUND THEN RAISE EXCEPTION 'not_found'; END IF;
  IF i.expires_at IS NOT NULL AND i.expires_at < now() THEN RAISE EXCEPTION 'expired'; END IF;
  IF i.max_uses IS NOT NULL AND i.uses >= i.max_uses THEN RAISE EXCEPTION 'used'; END IF;

  SELECT user_id INTO v_ownr FROM public.projects WHERE id = i.project_id;
  IF v_ownr = v_uid THEN
    RETURN jsonb_build_object('project_id', i.project_id, 'track_id', i.track_id, 'role', 'owner', 'already', true);
  END IF;

  IF i.track_id IS NOT NULL THEN
    INSERT INTO public.track_members (track_id, user_id, role, invited_by)
    VALUES (i.track_id, v_uid, i.role, i.invited_by)
    ON CONFLICT (track_id, user_id) DO NOTHING;
  ELSE
    INSERT INTO public.workspace_members (project_id, user_id, role, invited_by)
    VALUES (i.project_id, v_uid, i.role, i.invited_by)
    ON CONFLICT (project_id, user_id) DO NOTHING;
  END IF;

  UPDATE public.workspace_invites
    SET uses = uses + 1,
        accepted_at = CASE WHEN max_uses IS NOT NULL THEN now() ELSE accepted_at END,
        accepted_by = CASE WHEN max_uses IS NOT NULL THEN v_uid ELSE accepted_by END
    WHERE id = i.id;

  RETURN jsonb_build_object('project_id', i.project_id, 'track_id', i.track_id,
    'scope', CASE WHEN i.track_id IS NOT NULL THEN 'track' ELSE 'project' END, 'role', i.role);
END;
$$;
GRANT EXECUTE ON FUNCTION public.accept_project_invite(text) TO authenticated;

-- 12. Membres d'un TITRE (owner du projet + membres titre) + invitations en attente
CREATE OR REPLACE FUNCTION public.list_track_members(p_track uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
DECLARE v_role text := public.project_role_for_track(p_track); v_project uuid;
BEGIN
  IF v_role IS NULL THEN RAISE EXCEPTION 'no_access'; END IF;
  SELECT project_id INTO v_project FROM public.tracks WHERE id = p_track;
  RETURN (SELECT jsonb_build_object(
    'members', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('user_id', x.user_id, 'role', x.role, 'email', x.email, 'name', x.name, 'is_owner', x.is_owner)
                       ORDER BY x.is_owner DESC, x.created_at ASC)
      FROM (
        SELECT p.user_id, 'owner'::text AS role, u.email,
               coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name') AS name, true AS is_owner, p.created_at
        FROM public.projects p JOIN auth.users u ON u.id = p.user_id WHERE p.id = v_project
        UNION ALL
        SELECT tm.user_id, tm.role, u.email,
               coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name') AS name, false AS is_owner, tm.created_at
        FROM public.track_members tm JOIN auth.users u ON u.id = tm.user_id WHERE tm.track_id = p_track
      ) x
    ), '[]'::jsonb),
    'pending', CASE WHEN v_role = 'owner' THEN COALESCE((
      SELECT jsonb_agg(jsonb_build_object('email', i.email, 'role', i.role, 'token', i.token) ORDER BY i.created_at DESC)
      FROM public.workspace_invites i
      WHERE i.track_id = p_track AND i.email IS NOT NULL AND i.uses = 0 AND (i.expires_at IS NULL OR i.expires_at > now())
    ), '[]'::jsonb) ELSE '[]'::jsonb END,
    'my_role', v_role
  ));
END;
$$;
GRANT EXECUTE ON FUNCTION public.list_track_members(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_track_member_role(p_track uuid, p_user uuid, p_role text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.project_role_for_project((SELECT project_id FROM public.tracks WHERE id = p_track)) <> 'owner' THEN RAISE EXCEPTION 'not_owner'; END IF;
  IF p_role NOT IN ('viewer','commenter','editor') THEN RAISE EXCEPTION 'bad_role'; END IF;
  UPDATE public.track_members SET role = p_role WHERE track_id = p_track AND user_id = p_user;
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.update_track_member_role(uuid, uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.remove_track_member(p_track uuid, p_user uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_role text := public.project_role_for_track(p_track);
BEGIN
  IF v_role IS NULL THEN RAISE EXCEPTION 'no_access'; END IF;
  IF public.project_role_for_project((SELECT project_id FROM public.tracks WHERE id = p_track)) <> 'owner' AND p_user <> auth.uid() THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;
  DELETE FROM public.track_members WHERE track_id = p_track AND user_id = p_user;
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.remove_track_member(uuid, uuid) TO authenticated;

-- 13. Titres partagés AVEC moi (membre titre, pas via projet)
CREATE OR REPLACE FUNCTION public.my_shared_tracks()
RETURNS jsonb LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'track_id', tm.track_id, 'role', tm.role, 'title', t.title,
    'project_id', t.project_id, 'project_name', p.name,
    'owner_name', coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', u.email)
  ) ORDER BY t.created_at DESC), '[]'::jsonb)
  FROM public.track_members tm
  JOIN public.tracks t ON t.id = tm.track_id
  JOIN public.projects p ON p.id = t.project_id
  JOIN auth.users u ON u.id = p.user_id
  WHERE tm.user_id = auth.uid();
$$;
GRANT EXECUTE ON FUNCTION public.my_shared_tracks() TO authenticated;

COMMIT;

-- =============================================================
-- Rollback : DROP les nouvelles policies/fonctions track_* + colonne track_id,
-- et restaurer project_role_for_track / create_project_invite(…4 args) /
-- create_project_join_link(…2 args) des migrations 037/039. DROP TABLE track_members.
-- =============================================================
