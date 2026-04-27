-- Migration 009 — flag "is_final" sur les versions (ticket 4.4 plateau detector).
--
-- Quand le plateau detector déclare une version comme stabilisée et que
-- l'utilisateur clique "Marquer comme finale", on persiste l'état ici.
-- Permet :
--   - le badge "Final" sur la fiche
--   - le filtre dashboard (afficher / masquer les finales)
--   - de servir de jalon pour de futures fonctionnalités (release notes,
--     export d'archive, etc.)
--
-- Default false : aucune ligne existante n'est marquée finale.

ALTER TABLE public.versions
  ADD COLUMN IF NOT EXISTS is_final boolean NOT NULL DEFAULT false;

-- Index partiel : la majorité des versions ne seront jamais marquées finales.
-- Un index partiel sur is_final=true accélère le filtre dashboard sans coût
-- d'écriture sur les inserts non-finales.
CREATE INDEX IF NOT EXISTS idx_versions_is_final
  ON public.versions (track_id)
  WHERE is_final = true;
