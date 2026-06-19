-- =============================================================
-- Migration 042 — Lecture Storage de l'audio pour les collaborateurs
-- =============================================================
-- Idempotent.
--
-- Le bucket `audio` est privé et n'avait AUCUNE policy SELECT côté client
-- (la lecture passait uniquement par le backend qui signe l'URL après un
-- check de propriété). Un collaborateur (membre projet/titre) ne peut donc
-- pas lire l'audio → le player ne marche pas pour lui.
--
-- On ajoute une policy SELECT (lecture) sur les objets du bucket `audio`
-- autorisant : le PROPRIÉTAIRE (1er segment du chemin = son user_id) OU
-- tout MEMBRE du titre correspondant (via project_role_for_track). Le front
-- bascule alors sur supabase.storage.createSignedUrl en repli quand le
-- backend refuse. Purement additif — n'enlève aucun accès existant.
-- =============================================================

BEGIN;

DROP POLICY IF EXISTS "audio member read" ON storage.objects;
CREATE POLICY "audio member read" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'audio' AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR EXISTS (
      -- NB : versions a une colonne `name` (nom de version) → on qualifie
      -- explicitement storage.objects.name pour éviter la collision.
      SELECT 1 FROM public.versions v
      WHERE v.storage_path = storage.objects.name
        AND public.project_role_for_track(v.track_id) IS NOT NULL
    )
  )
);

COMMIT;

-- Rollback : DROP POLICY IF EXISTS "audio member read" ON storage.objects;
