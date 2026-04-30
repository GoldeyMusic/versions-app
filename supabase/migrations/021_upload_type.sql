-- Migration 021 — upload_type (Mix / Master) sur les versions.
--
-- Toggle ajouté à la modale d'upload : l'artiste indique si le fichier qu'il
-- envoie est un MIX (in-progress, pas encore masterisé) ou un MASTER (prêt
-- pour streaming). Cette info conditionne :
--   - la pondération de la section "Master & Loudness" dans le scoring
--     (poids 0.5 en mode mix vs 2 en mode master) — cf. lib/claude.js
--   - le verdict de sortie ("Prêt pour le mastering" vs "Prêt pour la sortie")
--   - les libellés/recettes de la section master (analyse purement
--     informative en mode mix, normative en mode master)
--
-- Default 'mix' : c'est le cas le plus fréquent et le moins pénalisant
-- (pas de surprise pour les anciennes lignes — leur master & loudness
-- continuent d'exister mais le ressenti score est plus indulgent).
-- Les anciennes versions (avant cette migration) seront donc traitées
-- comme des "mix" — comportement plus permissif, on ne casse rien.
--
-- Note de numérotation : la spec dans CLAUDE.md mentionnait
-- `010_upload_type.sql`, mais 010 était déjà pris (010_dsp_metrics.sql).
-- La séquence vivante est en 020 → on prend 021.
--
-- Note RPC publique : on NE TOUCHE PAS à `get_public_fiche` ici. Le viewer
-- public servira par défaut le verdict "mix" (plus permissif), ce qui est
-- une régression acceptable pour l'instant — on étendra la RPC dans une
-- migration séparée quand on aura la signature exacte de la fonction
-- actuelle (analysis_locale / analysis_translations ont été ajoutés en
-- prod via une migration i18n absente du repo).

BEGIN;

ALTER TABLE public.versions
  ADD COLUMN IF NOT EXISTS upload_type text NOT NULL DEFAULT 'mix';

-- Garde-fou : on n'accepte que les deux valeurs prévues. Si on en ajoute
-- une troisième plus tard (stem-only, etc.), on remplacera la contrainte.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'versions_upload_type_check'
  ) THEN
    ALTER TABLE public.versions
      ADD CONSTRAINT versions_upload_type_check
      CHECK (upload_type IN ('mix', 'master'));
  END IF;
END $$;

-- Index léger : sera utile dès qu'on voudra filtrer "mes mix vs mes
-- masters" dans le dashboard ou agréger des stats par type. Coût négligeable
-- (cardinalité = 2) mais utile pour les EXPLAIN futurs.
CREATE INDEX IF NOT EXISTS idx_versions_upload_type
  ON public.versions (upload_type);

COMMIT;
