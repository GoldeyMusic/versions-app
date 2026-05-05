-- =============================================================
-- Migration OPTIONNELLE — passer le bucket `track-covers` en privé
-- =============================================================
-- À NE PAS APPLIQUER tant que le frontend n'a pas été migré pour
-- utiliser createSignedUrl() au lieu de getPublicUrl(). Le fichier
-- est préfixé par `_optional` pour qu'il ne soit pas exécuté par un
-- runner automatique. À renommer `025_track_covers_private.sql`
-- (ou suivant le numéro courant) le jour du switch.
--
-- Contexte (audit sécurité 2026-05-05) :
--   Aujourd'hui le bucket `track-covers` est PUBLIC en lecture
--   (cf. migration 007). Une cover uploadée AVANT la sortie publique
--   d'un titre est donc accessible à quiconque devine son URL. Le
--   risque pratique est faible (les paths sont `{user_id_uuid_v4}/
--   {track_id_uuid_v4}.{ext}` → 2^122 d'entropie, indevinable), mais
--   pour la rigueur, on passe le bucket en privé et on signe à la
--   demande côté frontend. Les fiches publiques `/p/{token}` font
--   l'objet d'une SELECT policy spécifique : la cover reste lisible
--   par anon SI le track a un public_share actif.
--
-- Travail frontend à faire avant d'appliquer :
--   1. src/lib/storage.js : setTrackCoverImage() → ne PLUS stocker
--      l'URL publique dans tracks.cover_image_url ; stocker juste
--      le path (`{user_id}/{track_id}.{ext}`).
--   2. Lecteurs (DashboardScreen, FicheScreen, PublicFicheScreen) :
--      résoudre le path en signed URL via supabase.storage.from(
--      'track-covers').createSignedUrl(path, 24 * 3600).
--   3. Pour `/p/{token}` : étendre la RPC get_public_fiche pour
--      qu'elle renvoie une signed URL côté serveur (createSignedUrl
--      avec service-role).
-- =============================================================

BEGIN;

-- 1. Passer le bucket en privé.
UPDATE storage.buckets SET public = false WHERE id = 'track-covers';

-- 2. Drop l'ancienne policy SELECT publique.
DROP POLICY IF EXISTS "track-covers public read" ON storage.objects;

-- 3. Owner peut lire ses propres covers.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND policyname='track-covers owner select'
  ) THEN
    CREATE POLICY "track-covers owner select"
      ON storage.objects FOR SELECT
      USING (
        bucket_id = 'track-covers'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END;
$$;

-- 4. Anon peut lire UNIQUEMENT les covers de tracks avec public_share actif.
--    Le path est `{user_id}/{track_id}.{ext}` → on extrait track_id en
--    splittant le name : tout après le 1er '/' jusqu'au dernier '.'.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND policyname='track-covers public-share select'
  ) THEN
    CREATE POLICY "track-covers public-share select"
      ON storage.objects FOR SELECT
      USING (
        bucket_id = 'track-covers'
        AND EXISTS (
          SELECT 1 FROM public.public_shares ps
          WHERE ps.track_id::text = regexp_replace(
            split_part(name, '/', 2),
            '\.[^.]+$',
            ''
          )
          -- Adapter selon la colonne d'activation : `revoked_at IS NULL`
          -- ou `active = true`. À ajuster selon le schéma réel de
          -- public_shares (cf. migration 002).
        )
      );
  END IF;
END;
$$;

COMMIT;

-- Rollback :
--   UPDATE storage.buckets SET public = true WHERE id = 'track-covers';
--   DROP POLICY IF EXISTS "track-covers owner select" ON storage.objects;
--   DROP POLICY IF EXISTS "track-covers public-share select" ON storage.objects;
--   CREATE POLICY "track-covers public read" ON storage.objects
--     FOR SELECT USING (bucket_id = 'track-covers');
