-- Migration 029 — Acceptation copyright à l'upload.
--
-- Ajoute une trace horodatée du fait que l'utilisateur a explicitement
-- coché la case "je détiens les droits sur ce fichier audio ou j'ai
-- l'autorisation de l'analyser sur Versions" au moment de l'upload.
--
-- Cette trace sert de defense en cas de litige (DMCA / safe harbor) :
-- si un ayant-droit nous remonte dessus pour un fichier analysé via
-- la plateforme, on peut produire l'acceptation horodatee de l'uploader.
-- La responsabilite glisse alors sur lui, pas sur Versions.
--
-- Nullable : on n'invalide pas retroactivement les versions deja en base
-- avant la mise en place de la case. Toute nouvelle version creee apres
-- le deploiement front DEVRA renseigner ce timestamp (validation cote front
-- via bouton disabled tant que la case n'est pas cochee).

BEGIN;

ALTER TABLE public.versions
  ADD COLUMN IF NOT EXISTS copyright_acknowledged_at timestamptz;

-- Pas de contrainte NOT NULL pour ne pas casser les anciennes lignes.
-- Pas d'index : la colonne est ecrite a la creation, jamais filtree
-- en lecture (purement pour audit legal posterieur).

COMMIT;
