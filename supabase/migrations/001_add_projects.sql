-- =============================================================
-- Migration 001 — Ajout des Projets (dossiers conteneurs de titres)
-- =============================================================
-- À appliquer une seule fois, via Supabase Studio → SQL Editor → Run.
-- Le script est idempotent : safe à ré-exécuter (CREATE IF NOT EXISTS, etc.).
--
-- Effets :
--   • Nouvelle table `projects` avec RLS (chaque user ne voit que les siens)
--   • `tracks` gagne `project_id` (nullable pour l'instant) et
--     `position_in_project`
--   • Backfill automatique : pour chaque user avec des tracks existantes,
--     création d'un projet "Mon premier projet" qui contient toutes ses tracks
--
-- Après cette migration, le front continue à fonctionner normalement
-- (le champ project_id est ignoré par le code actuel).
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- 1. Table projects
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text NOT NULL,
  cover_gradient  smallint NOT NULL DEFAULT 0
                  CHECK (cover_gradient BETWEEN 0 AND 5),
  position        integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_position
  ON public.projects (user_id, position);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS projects_updated_at ON public.projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------------
-- 2. Row-Level Security sur projects
-- -------------------------------------------------------------
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_select_own" ON public.projects;
CREATE POLICY "projects_select_own"
  ON public.projects
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "projects_insert_own" ON public.projects;
CREATE POLICY "projects_insert_own"
  ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "projects_update_own" ON public.projects;
CREATE POLICY "projects_update_own"
  ON public.projects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "projects_delete_own" ON public.projects;
CREATE POLICY "projects_delete_own"
  ON public.projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- -------------------------------------------------------------
-- 3. Ajout colonnes sur tracks
-- -------------------------------------------------------------
ALTER TABLE public.tracks
  ADD COLUMN IF NOT EXISTS project_id uuid
  REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE public.tracks
  ADD COLUMN IF NOT EXISTS position_in_project integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_tracks_project_position
  ON public.tracks (project_id, position_in_project);

-- -------------------------------------------------------------
-- 4. Backfill : création d'un "Mon premier projet" par user
--    avec tracks existantes, et rattachement
-- -------------------------------------------------------------
DO $$
DECLARE
  u               RECORD;
  new_project_id  uuid;
  track_rec       RECORD;
  pos             integer;
BEGIN
  FOR u IN
    SELECT DISTINCT t.user_id
    FROM public.tracks t
    WHERE t.project_id IS NULL
  LOOP
    -- Crée le projet par défaut pour ce user
    INSERT INTO public.projects (user_id, name, cover_gradient, position)
    VALUES (u.user_id, 'Mon premier projet', 0, 0)
    RETURNING id INTO new_project_id;

    -- Affecte toutes ses tracks orphelines, ordre = created_at DESC
    -- (correspond au .order('created_at', desc) actuel dans loadTracks)
    pos := 0;
    FOR track_rec IN
      SELECT id
      FROM public.tracks
      WHERE user_id = u.user_id
        AND project_id IS NULL
      ORDER BY created_at DESC
    LOOP
      UPDATE public.tracks
      SET project_id = new_project_id,
          position_in_project = pos
      WHERE id = track_rec.id;
      pos := pos + 1;
    END LOOP;
  END LOOP;
END;
$$;

-- -------------------------------------------------------------
-- 5. Vérification (facultative, pour ton contrôle visuel)
--    Décommente pour voir le résultat :
-- -------------------------------------------------------------
-- SELECT p.name AS project, COUNT(t.id) AS nb_tracks
-- FROM public.projects p
-- LEFT JOIN public.tracks t ON t.project_id = p.id
-- GROUP BY p.id, p.name
-- ORDER BY p.created_at DESC;

COMMIT;

-- =============================================================
-- Fin migration 001.
-- Prochaine étape (Phase 2) : adapter src/lib/storage.js pour :
--   • exposer loadProjects / createProject / renameProject /
--     deleteProject / reorderProjects
--   • mettre à jour saveAnalysis pour lier toute nouvelle track
--     à un projet (paramètre projectId obligatoire)
-- Une fois Phase 2 en prod, migration 002 passera project_id
-- en NOT NULL.
-- =============================================================
