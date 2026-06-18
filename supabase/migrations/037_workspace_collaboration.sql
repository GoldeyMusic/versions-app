-- =============================================================
-- Migration 037 — Collaboration Phase 2 : membres de workspace
-- =============================================================
-- À appliquer une seule fois, via Supabase Studio → SQL Editor → Run.
-- Script idempotent (safe à ré-exécuter).
--
-- Objectif : partager un PROJET avec d'autres comptes (workspace), avec
-- 3 rôles — viewer (lecture), commenter (lecture + commentaires),
-- editor (lecture + édition + lance des analyses). Le propriétaire reste
-- projects.user_id (rôle implicite 'owner', non stocké comme membre).
--
-- PRINCIPE DE SÉCURITÉ — NON-RÉGRESSION :
--   On AJOUTE des policies "membre" à côté des policies "owner" existantes.
--   Les policies RLS sont permissives (OR) → on ne fait qu'ÉLARGIR l'accès.
--   Tant qu'aucun membre n'est ajouté, le comportement est identique à avant.
--   Les fonctions de rôle sont SECURITY DEFINER → pas de récursion RLS.
--
-- Crédits : "celui qui lance paie" → aucune logique de crédit ici. Le débit
--   reste sur auth.uid() côté backend (l'éditeur qui lance paie ses crédits).
--
-- Invitations : par EMAIL (usage unique, expire) ET par LIEN partageable
--   (réutilisable). Email envoyé via pg_net + Resend (mêmes secrets Vault
--   que la migration 036 ; inactif si non configurés).
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- 1. Tables
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('viewer','commenter','editor')),
  invited_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT workspace_members_unique UNIQUE (project_id, user_id)
);
CREATE INDEX IF NOT EXISTS workspace_members_project_idx ON public.workspace_members (project_id);
CREATE INDEX IF NOT EXISTS workspace_members_user_idx    ON public.workspace_members (user_id);

CREATE TABLE IF NOT EXISTS public.workspace_invites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  email       text,                 -- NULL = lien partageable générique
  role        text NOT NULL DEFAULT 'editor' CHECK (role IN ('viewer','commenter','editor')),
  token       text NOT NULL UNIQUE,
  invited_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz,          -- NULL = pas d'expiration (lien)
  max_uses    integer,              -- NULL = illimité (lien) ; 1 pour un email
  uses        integer NOT NULL DEFAULT 0,
  accepted_at timestamptz,
  accepted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS workspace_invites_project_idx ON public.workspace_invites (project_id);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- 2. Fonctions de rôle (SECURITY DEFINER → bypass RLS, pas de récursion)
--    Renvoient 'owner' | 'editor' | 'commenter' | 'viewer' | NULL.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.project_role_for_project(p_project uuid)
RETURNS text LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT CASE
    WHEN p_project IS NULL OR auth.uid() IS NULL THEN NULL
    WHEN EXISTS (SELECT 1 FROM public.projects p WHERE p.id = p_project AND p.user_id = auth.uid())
      THEN 'owner'
    ELSE (SELECT m.role FROM public.workspace_members m
            WHERE m.project_id = p_project AND m.user_id = auth.uid() LIMIT 1)
  END;
$$;

CREATE OR REPLACE FUNCTION public.project_role_for_track(p_track uuid)
RETURNS text LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT public.project_role_for_project((SELECT t.project_id FROM public.tracks t WHERE t.id = p_track));
$$;

CREATE OR REPLACE FUNCTION public.project_role_for_version(p_version uuid)
RETURNS text LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT public.project_role_for_track((SELECT v.track_id FROM public.versions v WHERE v.id = p_version));
$$;

GRANT EXECUTE ON FUNCTION public.project_role_for_project(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.project_role_for_track(uuid)   TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.project_role_for_version(uuid) TO authenticated, anon;

-- -------------------------------------------------------------
-- 3. RLS sur les tables de collaboration elles-mêmes
-- -------------------------------------------------------------
-- Membres : un membre (ou l'owner) du projet voit les co-membres.
DROP POLICY IF EXISTS "workspace_members select" ON public.workspace_members;
CREATE POLICY "workspace_members select" ON public.workspace_members FOR SELECT
  USING (public.project_role_for_project(project_id) IS NOT NULL);
-- Écritures via RPC SECURITY DEFINER uniquement ; en direct, owner seulement.
DROP POLICY IF EXISTS "workspace_members owner write" ON public.workspace_members;
CREATE POLICY "workspace_members owner write" ON public.workspace_members FOR ALL
  USING (public.project_role_for_project(project_id) = 'owner')
  WITH CHECK (public.project_role_for_project(project_id) = 'owner');

-- Invitations : visibles par l'owner du projet (contiennent emails/tokens).
DROP POLICY IF EXISTS "workspace_invites owner all" ON public.workspace_invites;
CREATE POLICY "workspace_invites owner all" ON public.workspace_invites FOR ALL
  USING (public.project_role_for_project(project_id) = 'owner')
  WITH CHECK (public.project_role_for_project(project_id) = 'owner');

-- -------------------------------------------------------------
-- 4. Policies ADDITIVES "membre" sur les tables métier
--    (les policies owner existantes restent intactes — OR permissif)
-- -------------------------------------------------------------

-- PROJECTS : lecture pour tout membre (owner déjà couvert).
DROP POLICY IF EXISTS "projects_select_member" ON public.projects;
CREATE POLICY "projects_select_member" ON public.projects FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.workspace_members m
                 WHERE m.project_id = projects.id AND m.user_id = auth.uid()));

-- TRACKS : lecture (tout membre), insert/update (editor+).
DROP POLICY IF EXISTS "tracks_select_member" ON public.tracks;
CREATE POLICY "tracks_select_member" ON public.tracks FOR SELECT
  USING (public.project_role_for_project(project_id) IS NOT NULL);

DROP POLICY IF EXISTS "tracks_insert_member" ON public.tracks;
CREATE POLICY "tracks_insert_member" ON public.tracks FOR INSERT
  WITH CHECK (public.project_role_for_project(project_id) IN ('owner','editor'));

DROP POLICY IF EXISTS "tracks_update_member" ON public.tracks;
CREATE POLICY "tracks_update_member" ON public.tracks FOR UPDATE
  USING (public.project_role_for_project(project_id) IN ('owner','editor'))
  WITH CHECK (public.project_role_for_project(project_id) IN ('owner','editor'));
-- DELETE de track reste owner-only (destructif) → pas de policy membre.

-- VERSIONS : lecture (tout membre), insert/update (editor+).
DROP POLICY IF EXISTS "versions_select_member" ON public.versions;
CREATE POLICY "versions_select_member" ON public.versions FOR SELECT
  USING (public.project_role_for_version(id) IS NOT NULL);

DROP POLICY IF EXISTS "versions_insert_member" ON public.versions;
CREATE POLICY "versions_insert_member" ON public.versions FOR INSERT
  WITH CHECK (public.project_role_for_track(track_id) IN ('owner','editor'));

DROP POLICY IF EXISTS "versions_update_member" ON public.versions;
CREATE POLICY "versions_update_member" ON public.versions FOR UPDATE
  USING (public.project_role_for_version(id) IN ('owner','editor'))
  WITH CHECK (public.project_role_for_version(id) IN ('owner','editor'));
-- DELETE de version reste owner-only.

-- COMPARISONS : lecture (tout membre), insert (editor+).
DROP POLICY IF EXISTS "comparisons_select_member" ON public.comparisons;
CREATE POLICY "comparisons_select_member" ON public.comparisons FOR SELECT
  USING (public.project_role_for_track(track_id) IS NOT NULL);

DROP POLICY IF EXISTS "comparisons_insert_member" ON public.comparisons;
CREATE POLICY "comparisons_insert_member" ON public.comparisons FOR INSERT
  WITH CHECK (public.project_role_for_track(track_id) IN ('owner','editor'));

-- FICHE_COMMENTS (Phase 1) : intégration aux membres.
--   Lecture : tout membre. Écriture directe : commenter/editor/owner.
--   Modération (update/delete) : owner/editor du projet (en plus de l'auteur).
DROP POLICY IF EXISTS "fiche_comments_member_select" ON public.fiche_comments;
CREATE POLICY "fiche_comments_member_select" ON public.fiche_comments FOR SELECT
  USING (public.project_role_for_version(version_id) IS NOT NULL);

DROP POLICY IF EXISTS "fiche_comments_member_insert" ON public.fiche_comments;
CREATE POLICY "fiche_comments_member_insert" ON public.fiche_comments FOR INSERT
  WITH CHECK (author_id = auth.uid()
              AND public.project_role_for_version(version_id) IN ('owner','commenter','editor'));

DROP POLICY IF EXISTS "fiche_comments_member_moderate_upd" ON public.fiche_comments;
CREATE POLICY "fiche_comments_member_moderate_upd" ON public.fiche_comments FOR UPDATE
  USING (public.project_role_for_version(version_id) IN ('owner','editor'))
  WITH CHECK (public.project_role_for_version(version_id) IN ('owner','editor'));

DROP POLICY IF EXISTS "fiche_comments_member_moderate_del" ON public.fiche_comments;
CREATE POLICY "fiche_comments_member_moderate_del" ON public.fiche_comments FOR DELETE
  USING (public.project_role_for_version(version_id) IN ('owner','editor'));

-- mix_note_completions : reste per-user (chacun sa progression) → inchangé.

-- -------------------------------------------------------------
-- 5. RPCs d'invitation / gestion des membres
-- -------------------------------------------------------------
-- Génère un token base64url (16 octets).
CREATE OR REPLACE FUNCTION public.gen_invite_token()
RETURNS text LANGUAGE sql VOLATILE AS $$
  SELECT replace(replace(replace(encode(extensions.gen_random_bytes(16), 'base64'), '+','-'), '/','_'), '=','');
$$;

-- Crée une invitation par EMAIL (usage unique, expire 14 j) et envoie le mail.
CREATE OR REPLACE FUNCTION public.create_project_invite(
  p_project uuid, p_email text, p_role text DEFAULT 'editor'
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  v_token       text;
  v_project_nm  text;
  v_resend_key  text;
  v_from        text;
  v_link        text;
  v_email       text := nullif(btrim(lower(coalesce(p_email,''))), '');
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
  INSERT INTO public.workspace_invites (project_id, email, role, token, invited_by, expires_at, max_uses)
  VALUES (p_project, v_email, p_role, v_token, auth.uid(), now() + interval '14 days', 1);

  SELECT name INTO v_project_nm FROM public.projects WHERE id = p_project;
  v_link := 'https://versions.studio/join/' || v_token;

  -- Email (best-effort, jamais bloquant).
  BEGIN
    SELECT decrypted_secret INTO v_resend_key FROM vault.decrypted_secrets WHERE name='resend_api_key' LIMIT 1;
    SELECT decrypted_secret INTO v_from       FROM vault.decrypted_secrets WHERE name='resend_from'     LIMIT 1;
    IF v_resend_key IS NOT NULL AND v_from IS NOT NULL THEN
      PERFORM net.http_post(
        url := 'https://api.resend.com/emails',
        body := jsonb_build_object(
          'from', v_from,
          'to', jsonb_build_array(v_email),
          'subject', 'Tu es invité·e à collaborer sur ' || coalesce(v_project_nm,'un projet') || ' (Versions)',
          'html',
            '<div style="font-family:''DM Sans'',Arial,sans-serif;background:#0f0f12;padding:28px;color:#eaeaea">'
            || '<div style="max-width:520px;margin:0 auto;background:#17171c;border:1px solid #2a2a31;border-radius:16px;padding:24px">'
            || '<div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#f5b056;font-weight:700">VERSIONS</div>'
            || '<h1 style="font-size:18px;margin:10px 0 6px;color:#fff">Invitation à collaborer</h1>'
            || '<p style="font-size:14px;color:#a9a9b2;margin:0 0 18px">On t''invite à rejoindre <b style="color:#fff">'
            || coalesce(replace(replace(v_project_nm,'&','&amp;'),'<','&lt;'),'un projet')
            || '</b> sur Versions (rôle : ' || p_role || ').</p>'
            || '<div style="margin-top:6px"><a href="' || v_link || '" style="display:inline-block;background:linear-gradient(135deg,#f5b056,#d4900e);color:#1a1206;text-decoration:none;font-weight:700;font-size:14px;padding:11px 20px;border-radius:10px">Rejoindre le projet</a></div>'
            || '<p style="font-size:11px;color:#6c6c76;margin-top:22px">Lien valable 14 jours. Si tu n''es pas concerné·e, ignore cet email.</p>'
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
GRANT EXECUTE ON FUNCTION public.create_project_invite(uuid, text, text) TO authenticated;

-- Crée (ou renvoie) un LIEN partageable réutilisable pour un rôle donné.
CREATE OR REPLACE FUNCTION public.create_project_join_link(
  p_project uuid, p_role text DEFAULT 'editor'
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  v_token text;
BEGIN
  IF public.project_role_for_project(p_project) <> 'owner' THEN
    RAISE EXCEPTION 'not_owner';
  END IF;
  IF p_role NOT IN ('viewer','commenter','editor') THEN
    RAISE EXCEPTION 'bad_role';
  END IF;

  -- Réutilise un lien existant (email NULL) pour ce rôle s'il y en a un.
  SELECT token INTO v_token FROM public.workspace_invites
    WHERE project_id = p_project AND email IS NULL AND role = p_role
    ORDER BY created_at DESC LIMIT 1;

  IF v_token IS NULL THEN
    v_token := public.gen_invite_token();
    INSERT INTO public.workspace_invites (project_id, email, role, token, invited_by, expires_at, max_uses)
    VALUES (p_project, NULL, p_role, v_token, auth.uid(), NULL, NULL);
  END IF;

  RETURN jsonb_build_object('token', v_token, 'link', 'https://versions.studio/join/' || v_token, 'role', p_role);
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_project_join_link(uuid, text) TO authenticated;

-- Aperçu d'une invitation (pour l'écran /join) — accessible connecté.
CREATE OR REPLACE FUNCTION public.preview_invite(p_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
DECLARE r record;
BEGIN
  SELECT i.role, i.email, i.expires_at, i.max_uses, i.uses, p.name AS project_name, i.project_id
    INTO r
  FROM public.workspace_invites i JOIN public.projects p ON p.id = i.project_id
  WHERE i.token = p_token;
  IF NOT FOUND THEN RETURN jsonb_build_object('valid', false, 'reason','not_found'); END IF;
  IF r.expires_at IS NOT NULL AND r.expires_at < now() THEN RETURN jsonb_build_object('valid', false, 'reason','expired'); END IF;
  IF r.max_uses IS NOT NULL AND r.uses >= r.max_uses THEN RETURN jsonb_build_object('valid', false, 'reason','used'); END IF;
  RETURN jsonb_build_object('valid', true, 'role', r.role, 'project_name', r.project_name);
END;
$$;
GRANT EXECUTE ON FUNCTION public.preview_invite(text) TO authenticated, anon;

-- Accepte une invitation (email ou lien). Crée la ligne de membre.
CREATE OR REPLACE FUNCTION public.accept_project_invite(p_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  i      public.workspace_invites%ROWTYPE;
  v_uid  uuid := auth.uid();
  v_ownr uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  SELECT * INTO i FROM public.workspace_invites WHERE token = p_token;
  IF NOT FOUND THEN RAISE EXCEPTION 'not_found'; END IF;
  IF i.expires_at IS NOT NULL AND i.expires_at < now() THEN RAISE EXCEPTION 'expired'; END IF;
  IF i.max_uses IS NOT NULL AND i.uses >= i.max_uses THEN RAISE EXCEPTION 'used'; END IF;

  SELECT user_id INTO v_ownr FROM public.projects WHERE id = i.project_id;
  IF v_ownr = v_uid THEN
    RETURN jsonb_build_object('project_id', i.project_id, 'role', 'owner', 'already', true);
  END IF;

  INSERT INTO public.workspace_members (project_id, user_id, role, invited_by)
  VALUES (i.project_id, v_uid, i.role, i.invited_by)
  ON CONFLICT (project_id, user_id) DO NOTHING;

  UPDATE public.workspace_invites
    SET uses = uses + 1,
        accepted_at = CASE WHEN max_uses IS NOT NULL THEN now() ELSE accepted_at END,
        accepted_by = CASE WHEN max_uses IS NOT NULL THEN v_uid ELSE accepted_by END
    WHERE id = i.id;

  RETURN jsonb_build_object('project_id', i.project_id, 'role', i.role);
END;
$$;
GRANT EXECUTE ON FUNCTION public.accept_project_invite(text) TO authenticated;

-- Liste les membres d'un projet (owner + membres) avec email/nom + rôle.
CREATE OR REPLACE FUNCTION public.list_project_members(p_project uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
DECLARE v_role text := public.project_role_for_project(p_project);
BEGIN
  IF v_role IS NULL THEN RAISE EXCEPTION 'no_access'; END IF;
  RETURN (
    SELECT jsonb_build_object(
      'members', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'user_id', x.user_id, 'role', x.role, 'email', x.email,
          'name', x.name, 'is_owner', x.is_owner
        ) ORDER BY x.is_owner DESC, x.created_at ASC)
        FROM (
          SELECT p.user_id, 'owner'::text AS role, u.email,
                 coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name') AS name,
                 true AS is_owner, p.created_at
          FROM public.projects p JOIN auth.users u ON u.id = p.user_id
          WHERE p.id = p_project
          UNION ALL
          SELECT m.user_id, m.role, u.email,
                 coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name') AS name,
                 false AS is_owner, m.created_at
          FROM public.workspace_members m JOIN auth.users u ON u.id = m.user_id
          WHERE m.project_id = p_project
        ) x
      ), '[]'::jsonb),
      -- invitations email en attente : owner uniquement
      'pending', CASE WHEN v_role = 'owner' THEN COALESCE((
        SELECT jsonb_agg(jsonb_build_object('email', i.email, 'role', i.role, 'token', i.token)
                         ORDER BY i.created_at DESC)
        FROM public.workspace_invites i
        WHERE i.project_id = p_project AND i.email IS NOT NULL
          AND i.uses = 0 AND (i.expires_at IS NULL OR i.expires_at > now())
      ), '[]'::jsonb) ELSE '[]'::jsonb END,
      'my_role', v_role
    )
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.list_project_members(uuid) TO authenticated;

-- Change le rôle d'un membre (owner uniquement).
CREATE OR REPLACE FUNCTION public.update_member_role(p_project uuid, p_user uuid, p_role text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.project_role_for_project(p_project) <> 'owner' THEN RAISE EXCEPTION 'not_owner'; END IF;
  IF p_role NOT IN ('viewer','commenter','editor') THEN RAISE EXCEPTION 'bad_role'; END IF;
  UPDATE public.workspace_members SET role = p_role WHERE project_id = p_project AND user_id = p_user;
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.update_member_role(uuid, uuid, text) TO authenticated;

-- Retire un membre. Owner peut retirer n'importe qui ; un membre peut se retirer lui-même.
CREATE OR REPLACE FUNCTION public.remove_member(p_project uuid, p_user uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_role text := public.project_role_for_project(p_project);
BEGIN
  IF v_role IS NULL THEN RAISE EXCEPTION 'no_access'; END IF;
  IF v_role <> 'owner' AND p_user <> auth.uid() THEN RAISE EXCEPTION 'not_allowed'; END IF;
  DELETE FROM public.workspace_members WHERE project_id = p_project AND user_id = p_user;
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.remove_member(uuid, uuid) TO authenticated;

-- Projets partagés AVEC moi (où je suis membre, pas owner) + mon rôle.
CREATE OR REPLACE FUNCTION public.my_shared_projects()
RETURNS jsonb LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'project_id', m.project_id, 'role', m.role,
    'name', p.name, 'cover_gradient', p.cover_gradient,
    'owner_name', coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', u.email)
  ) ORDER BY p.created_at DESC), '[]'::jsonb)
  FROM public.workspace_members m
  JOIN public.projects p ON p.id = m.project_id
  JOIN auth.users u ON u.id = p.user_id
  WHERE m.user_id = auth.uid();
$$;
GRANT EXECUTE ON FUNCTION public.my_shared_projects() TO authenticated;

COMMIT;

-- =============================================================
-- Fin migration 037.
-- Rollback (en cas de pépin) :
--   DROP les policies *_member / workspace_* puis :
--   DROP FUNCTION IF EXISTS public.my_shared_projects(), public.remove_member(uuid,uuid),
--     public.update_member_role(uuid,uuid,text), public.list_project_members(uuid),
--     public.accept_project_invite(text), public.preview_invite(text),
--     public.create_project_join_link(uuid,text), public.create_project_invite(uuid,text,text),
--     public.gen_invite_token(),
--     public.project_role_for_version(uuid), public.project_role_for_track(uuid),
--     public.project_role_for_project(uuid);
--   DROP TABLE IF EXISTS public.workspace_invites, public.workspace_members CASCADE;
-- =============================================================
