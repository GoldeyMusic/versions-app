# Versions — Notes de contexte

Récap pour reprendre proprement le projet depuis Cowork.

## Architecture

- **Front** : `~/versions-app/src/` — React + Vite, déployé sur Vercel.
- **Backend** : `~/decode-api/` — Node, héberge l'analyse Claude (Sonnet 4.6).
- **Deploy** : `git push` sur `main` → Vercel auto (front) et redeploy backend.
- **Ne PAS utiliser** `~/Desktop/Versions/` ni `deploy.sh` (legacy).

## Routing (hash-based)

| Route | Écran |
|---|---|
| `#/` | Landing publique (accessible connecté ou pas) |
| `#/dashboard` | Dashboard utilisateur (projets, titres) |
| `#/fiche/{slug}/{vN}` | Fiche d'analyse — URLs lisibles avec slug du titre |
| `#/exemple` | Page exemple avec données fictives |
| `#/analyse` | Nouvelle analyse |
| `#/reglages` | Réglages |

- Logo cliquable → pointe vers la landing.
- "À propos" dans la sidebar → landing.

## Refonte récente des fiches d'analyse

- **Layout 1 colonne** (plus de 2 colonnes).
- **Section Plan d'action supprimée** — absorbée dans les items de diagnostic via les champs `how` (recette technique chiffrée) et `plugin_pick` (plugin réel).
- **Ordre des sections** : Topbar → Pochette + Score global → Évolution + Intention → Diagnostic par éléments → Impression d'écoute → Notes.
- **Checklist cochable** par item de diagnostic — table `mix_note_completions` (Supabase).
- **Score Card PNG** exportable (watermark `www.versions.studio`).
- **Scores /100** (plus de /10).

## Roadmap AubioMix

- Tous les Tiers 1-4 sont **clos**.
- Détails dans `docs/AUBIOMIX_PLAN.md`.

## Feature intention artistique

Implémentée :
- `IntentionScreen.jsx` (saisie intention)
- Champ `artistic_intent` sur la table `tracks`
- Champ `version_intent` sur la table `versions`

## Typo

- **DM Sans** partout (corps + UI).
- **Cormorant Garamond** pour les verdicts (titres dramatiques).
- Pas d'italique sur les mots isolés en orange (règle visuelle d'emphasis).

## Points en suspens

- Badge "EN COURS" tronqué sur mobile (premier chip V1).
- Thème clair à finaliser (maquettes H explorées, pas encore implémenté).
- Adapter vue mobile complète (commencé, reste à auditer).
