-- =============================================================
-- Migration 007 — Image d'illustration par titre
-- =============================================================
-- À appliquer une seule fois, via Supabase Studio → SQL Editor → Run.
-- Script idempotent (safe à ré-exécuter).
--
-- Contexte :
--   Chaque titre (table tracks) peut désormais avoir une image
--   d'illustration propre (cover art), affichée dans la home au
--   niveau de la ligne titre (bouton play fusionné avec l'image).
--
-- Effets :
--   • `tracks` gagne la colonne `cover_image_url` (text, nullable).
--   • L'image elle-même vit dans un bucket Storage séparé :
--     `track-covers` (public), chemin `{user_id}/{track_id}.{ext}`.
--
-- RLS : tracks est déjà owner-only → inutile d'ajouter une policy.
-- Pour le bucket, voir la partie "Storage" en fin de fichier.
-- =============================================================

BEGIN;

ALTER TABLE public.tracks
  ADD COLUMN IF NOT EXISTS cover_image_url text;

COMMIT;

-- =============================================================
-- Création du bucket Storage `track-covers`
-- =============================================================
-- Bucket public pour servir directement les URL publiques.
-- Policies d'upload/delete : restreintes au propriétaire (même
-- logique que `project-covers`).
-- =============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('track-covers', 'track-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Policy : lecture publique (bucket déclaré public ; redondant mais explicite)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'track-covers public read'
  ) THEN
    CREATE POLICY "track-covers public read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'track-covers');
  END IF;
END;
$$;

-- Policy : upload autorisé au owner (premier segment du path = user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'track-covers owner insert'
  ) THEN
    CREATE POLICY "track-covers owner insert"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'track-covers'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END;
$$;

-- Policy : update autorisé au owner (upsert d'une nouvelle image)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'track-covers owner update'
  ) THEN
    CREATE POLICY "track-covers owner update"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id = 'track-covers'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END;
$$;

-- Policy : delete autorisé au owner
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'track-covers owner delete'
  ) THEN
    CREATE POLICY "track-covers owner delete"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'track-covers'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END;
$$;

-- =============================================================
-- Fin migration 007.
-- Rollback (à ne lancer qu'en cas de pépin) :
--   ALTER TABLE public.tracks DROP COLUMN IF EXISTS cover_image_url;
--   DROP POLICY IF EXISTS "track-covers public read"   ON storage.objects;
--   DROP POLICY IF EXISTS "track-covers owner insert"  ON storage.objects;
--   DROP POLICY IF EXISTS "track-covers owner update"  ON storage.objects;
--   DROP POLICY IF EXISTS "track-covers owner delete"  ON storage.objects;
--   DELETE FROM storage.buckets WHERE id = 'track-covers';
-- =============================================================
