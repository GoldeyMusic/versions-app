-- =============================================================
-- Migration 035 — Commentaires de fiche (collaboration Phase 1)
-- =============================================================
-- À appliquer une seule fois, via Supabase Studio → SQL Editor → Run.
-- Script idempotent (safe à ré-exécuter).
--
-- Contexte (Collaboration — Phase 1 : feedback + partage identifié) :
--   On veut permettre à plusieurs personnes de commenter une fiche
--   d'analyse SANS toucher au RLS owner-only existant (zéro régression
--   sur les fiches en prod). Deux chemins d'accès :
--     • Le PROPRIÉTAIRE lit/écrit/résout les commentaires de SES fiches
--       par RLS direct (auth.uid() = owner de la track).
--     • Un VISITEUR à qui on a partagé le lien (versions.public_share_token)
--       passe par des RPC SECURITY DEFINER (mêmes "portes contrôlées" que
--       get_public_fiche). Écrire un commentaire exige d'être connecté
--       (partage IDENTIFIÉ) ; lire est autorisé en anonyme.
--
-- Effets :
--   • Nouvelle table public.fiche_comments
--   • RLS : owner de la fiche + auteur du commentaire
--   • RPC get_fiche_comments(token)            → anon + authenticated (lecture)
--   • RPC add_fiche_comment(token, …)          → authenticated (écriture)
--   • RPC set_fiche_comment_resolved(id, bool) → authenticated (owner/auteur)
--   • RPC delete_fiche_comment(id)             → authenticated (owner/auteur)
--
-- NB : on NE modifie PAS get_public_fiche (signature i18n vivante en prod).
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- 1. Table fiche_comments
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fiche_comments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id   uuid NOT NULL REFERENCES public.versions(id) ON DELETE CASCADE,
  -- ON DELETE CASCADE sur l'auteur : si un compte est supprimé, ses
  -- commentaires partent avec lui (cohérent avec delete_my_account).
  author_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name  text NOT NULL,                       -- nom d'affichage dénormalisé
  body         text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  anchor       text,                                -- section ciblée (ex. "diag:basses"), nullable
  resolved     boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS fiche_comments_version_idx
  ON public.fiche_comments (version_id, created_at);

CREATE INDEX IF NOT EXISTS fiche_comments_author_idx
  ON public.fiche_comments (author_id);

-- Auto-update updated_at (réutilise public.set_updated_at de la migration 001)
DROP TRIGGER IF EXISTS fiche_comments_updated_at ON public.fiche_comments;
CREATE TRIGGER fiche_comments_updated_at
  BEFORE UPDATE ON public.fiche_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------------
-- 2. Row-Level Security
--    Accès direct table = owner de la fiche OU auteur du commentaire.
--    (Les visiteurs partagés passent par les RPC SECURITY DEFINER.)
-- -------------------------------------------------------------
ALTER TABLE public.fiche_comments ENABLE ROW LEVEL SECURITY;

-- Helper inline : la version appartient-elle à l'utilisateur courant ?
-- (on l'écrit en sous-requête EXISTS dans chaque policy plutôt qu'une
--  fonction, pour rester lisible et auto-contenu.)

-- SELECT : owner de la fiche OU auteur
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'fiche_comments'
      AND policyname = 'fiche_comments owner_or_author select'
  ) THEN
    CREATE POLICY "fiche_comments owner_or_author select"
      ON public.fiche_comments FOR SELECT
      USING (
        author_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.versions v
          JOIN public.tracks t ON t.id = v.track_id
          WHERE v.id = fiche_comments.version_id
            AND t.user_id = auth.uid()
        )
      );
  END IF;
END;
$$;

-- INSERT direct : réservé au PROPRIÉTAIRE de la fiche (les visiteurs
-- partagés insèrent via la RPC add_fiche_comment, qui bypasse le RLS).
-- author_id doit être l'utilisateur courant.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'fiche_comments'
      AND policyname = 'fiche_comments owner insert'
  ) THEN
    CREATE POLICY "fiche_comments owner insert"
      ON public.fiche_comments FOR INSERT
      WITH CHECK (
        author_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM public.versions v
          JOIN public.tracks t ON t.id = v.track_id
          WHERE v.id = fiche_comments.version_id
            AND t.user_id = auth.uid()
        )
      );
  END IF;
END;
$$;

-- UPDATE : owner de la fiche (résoudre) OU auteur (éditer/résoudre son propre)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'fiche_comments'
      AND policyname = 'fiche_comments owner_or_author update'
  ) THEN
    CREATE POLICY "fiche_comments owner_or_author update"
      ON public.fiche_comments FOR UPDATE
      USING (
        author_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.versions v
          JOIN public.tracks t ON t.id = v.track_id
          WHERE v.id = fiche_comments.version_id
            AND t.user_id = auth.uid()
        )
      )
      WITH CHECK (
        author_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.versions v
          JOIN public.tracks t ON t.id = v.track_id
          WHERE v.id = fiche_comments.version_id
            AND t.user_id = auth.uid()
        )
      );
  END IF;
END;
$$;

-- DELETE : owner de la fiche OU auteur
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'fiche_comments'
      AND policyname = 'fiche_comments owner_or_author delete'
  ) THEN
    CREATE POLICY "fiche_comments owner_or_author delete"
      ON public.fiche_comments FOR DELETE
      USING (
        author_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.versions v
          JOIN public.tracks t ON t.id = v.track_id
          WHERE v.id = fiche_comments.version_id
            AND t.user_id = auth.uid()
        )
      );
  END IF;
END;
$$;

-- -------------------------------------------------------------
-- 3. RPC lecture : commentaires d'une fiche partagée (par token)
--    SECURITY DEFINER → sert de porte contrôlée pour les visiteurs.
--    Renvoie [] si le token est invalide / le partage désactivé.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_fiche_comments(p_token text)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id',          c.id,
        'author_name', c.author_name,
        'body',        c.body,
        'anchor',      c.anchor,
        'resolved',    c.resolved,
        'created_at',  c.created_at,
        -- l'appelant ne sait jamais l'UUID auteur d'autrui ;
        -- on expose juste "is_mine" pour piloter l'UI (éditer/supprimer).
        'is_mine',     (c.author_id = auth.uid())
      )
      ORDER BY c.created_at ASC
    ),
    '[]'::jsonb
  )
  FROM public.fiche_comments c
  JOIN public.versions v ON v.id = c.version_id
  WHERE v.public_share_token = p_token;
$$;

GRANT EXECUTE ON FUNCTION public.get_fiche_comments(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_fiche_comments(text) TO authenticated;

-- -------------------------------------------------------------
-- 4. RPC écriture : ajouter un commentaire à une fiche partagée
--    Réservé aux utilisateurs CONNECTÉS (partage identifié).
--    Valide le token, le corps, et insère avec author_id = auth.uid().
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.add_fiche_comment(
  p_token       text,
  p_body        text,
  p_author_name text,
  p_anchor      text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_version_id uuid;
  v_uid        uuid := auth.uid();
  v_body       text := btrim(p_body);
  v_name       text := NULLIF(btrim(coalesce(p_author_name, '')), '');
  v_row        public.fiche_comments%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'auth_required';
  END IF;
  IF v_body IS NULL OR char_length(v_body) = 0 THEN
    RAISE EXCEPTION 'empty_body';
  END IF;
  IF char_length(v_body) > 4000 THEN
    v_body := left(v_body, 4000);
  END IF;

  -- Résout le token → version (et garantit que le partage est actif).
  SELECT v.id INTO v_version_id
  FROM public.versions v
  WHERE v.public_share_token = p_token
  LIMIT 1;

  IF v_version_id IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  INSERT INTO public.fiche_comments (version_id, author_id, author_name, body, anchor)
  VALUES (v_version_id, v_uid, COALESCE(v_name, 'Invité'), v_body, NULLIF(btrim(coalesce(p_anchor, '')), ''))
  RETURNING * INTO v_row;

  RETURN jsonb_build_object(
    'id',          v_row.id,
    'author_name', v_row.author_name,
    'body',        v_row.body,
    'anchor',      v_row.anchor,
    'resolved',    v_row.resolved,
    'created_at',  v_row.created_at,
    'is_mine',     true
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_fiche_comment(text, text, text, text) TO authenticated;

-- -------------------------------------------------------------
-- 5. RPC : résoudre / dé-résoudre un commentaire
--    Autorisé à l'AUTEUR ou au PROPRIÉTAIRE de la fiche.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_fiche_comment_resolved(
  p_comment_id uuid,
  p_resolved   boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_ok  boolean;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'auth_required';
  END IF;

  SELECT (
    c.author_id = v_uid
    OR EXISTS (
      SELECT 1 FROM public.versions v
      JOIN public.tracks t ON t.id = v.track_id
      WHERE v.id = c.version_id AND t.user_id = v_uid
    )
  ) INTO v_ok
  FROM public.fiche_comments c
  WHERE c.id = p_comment_id;

  IF v_ok IS NOT TRUE THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  UPDATE public.fiche_comments
  SET resolved = p_resolved
  WHERE id = p_comment_id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_fiche_comment_resolved(uuid, boolean) TO authenticated;

-- -------------------------------------------------------------
-- 6. RPC : supprimer un commentaire
--    Autorisé à l'AUTEUR ou au PROPRIÉTAIRE de la fiche.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_fiche_comment(p_comment_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_ok  boolean;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'auth_required';
  END IF;

  SELECT (
    c.author_id = v_uid
    OR EXISTS (
      SELECT 1 FROM public.versions v
      JOIN public.tracks t ON t.id = v.track_id
      WHERE v.id = c.version_id AND t.user_id = v_uid
    )
  ) INTO v_ok
  FROM public.fiche_comments c
  WHERE c.id = p_comment_id;

  IF v_ok IS NOT TRUE THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  DELETE FROM public.fiche_comments WHERE id = p_comment_id;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_fiche_comment(uuid) TO authenticated;

COMMIT;

-- =============================================================
-- Fin migration 035.
-- Rollback (à ne lancer qu'en cas de pépin) :
--   DROP FUNCTION IF EXISTS public.delete_fiche_comment(uuid);
--   DROP FUNCTION IF EXISTS public.set_fiche_comment_resolved(uuid, boolean);
--   DROP FUNCTION IF EXISTS public.add_fiche_comment(text, text, text, text);
--   DROP FUNCTION IF EXISTS public.get_fiche_comments(text);
--   DROP TABLE IF EXISTS public.fiche_comments CASCADE;
-- =============================================================
