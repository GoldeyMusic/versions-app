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
| `#/privacy` | Politique de confidentialité (FR/EN) |
| `#/terms` | Conditions générales d'utilisation (FR/EN) |

- Logo cliquable → pointe vers la landing.
- "À propos" dans la sidebar → landing.

## Refonte récente des fiches d'analyse

- **Layout 1 colonne** (plus de 2 colonnes).
- **Section Plan d'action supprimée** — absorbée dans les items de diagnostic via les champs `how` (recette technique chiffrée) et `plugin_pick` (plugin réel).
- **Ordre des sections** : Topbar → Verdict de sortie + side panel → Pochette + Score global → Évolution + Intention → Diagnostic par éléments → Impression d'écoute → Notes.
- **Checklist cochable** par item de diagnostic — table `mix_note_completions` (Supabase).
- **Score Card PNG** exportable (watermark `www.versions.studio`).
- **Scores /100** (plus de /10).

## Refonte UI desktop fiche (2026-04-30, "page plus jeune")

- **Topbar fiche** = juste eyebrow `FICHE D'ANALYSE` + chips de versions (V1/V2 + bouton + nouvelle version). DspBadge / Genre / actions ont été SORTIS de la topbar et redistribués (cf. side panel verdict).
- **Slot topbar** (`.db-topbar-slot`) : `justify-content: flex-start` + `padding-left: max(16px, calc((100vw - 920px) / 2 - 204px))` pour que les chips topbar s'alignent avec le bord gauche de la colonne contenu 920px centrée.
- **Verdict row grid** (`.verdict-row-grid`) : 2/3 (ReleaseReadinessBanner) + 1/3 (`.verdict-col-side`).
  - Side panel = chips colorées centrées : BPM (cyan), Key (violet), LUFS (mint), Genre (amber), + 3 boutons share/scoreCard/export.
  - **BPM / Key cliquables** → `DspEditModal` (state `dspEditOpen` au niveau FicheScreen).
  - **Genre cliquable** → édition inline directement dans la chip (input + Enter/Escape).
  - **LUFS NON éditable** (mesure objective, cf. comment dans DspEditModal).
- **Chips fiche** : système néon cohérent avec `.pr-chip` (pricing) et `.vside-chip` (fiche side). Rotations `-2°/+1.5°/-1°/+2°` sur les chips de métadonnées et de delta. **PAS de rotation sur les TITRES de section (eyebrows)** — ça ressemblait à un bug.
- **Eyebrows en chip pill** : `.score-eyebrow`, `.q-eyebrow`, `.diag-eyebrow`, `.notes-eyebrow`, `.rr-eyebrow` (Verdict de sortie), titre EvolutionBanner — tous transformés en chips pill avec bg tinted + bordure colorée + box-shadow. **Sans rotation**. L'eyebrow Verdict + Évolution sont chartés en CERULEAN comme Diagnostic (et pas dans la couleur du tier).
- **Glyphes premium SVG** par catégorie diagnostic (`<CategoryIcon cat={...}/>` dans `FicheScreen.jsx`) : voix=micro, instruments=piano, basses=onde basse, drums=cymbale+stick, spatial=cube, master=VU meter. **Pas d'emojis** — le user veut des symboles premium type lucide.
- **MOY color-coded chip** : remplace le texte gris "MOY. 75" → mini chip mint (≥80) / amber (60-79) / red (<60). Le compteur "X éléments" se sépare en chiffre solide + label muted.
- **EvolutionBanner deltas** = chips colorées avec rotations (mint up / red down / muted stable / amber new), cohérent avec le langage chip global.
- **Animations entrée scroll** : classe `.wh-anim` + `--anim-d` sur les sections fiche. **Important** : un IntersectionObserver LOCAL est dans `FicheScreen.jsx` (pas que celui d'App.jsx), parce que le body fiche se monte async (rawFiche arrive après l'analyse) et l'observer global ne le ramasse pas. Si tu ajoutes `.wh-anim` ailleurs sur fiche, vérifie que ça apparaît bien — sinon le body reste à `opacity: 0`.

## Fond + bande sombre (debug 2026-04-30)

Le fond de page utilise 2 couches globales (`.ambient-halo` + `.va-bg-orbs`) montées au body via `useEffect` dans `App.jsx`. Une **bande sombre intermittente côté droit** (et top) était causée par l'animation `va-bg-drift` qui translate `-2.5%, 1.5%` → expose le bord du body noir derrière pendant la moitié du cycle 50s. **Fix** : `.va-bg-orbs { inset: -8vh -8vw }` au lieu de `inset: 0` → le conteneur dépasse le viewport, plus aucun bord exposé.

Une **2è bande sur la fiche uniquement** venait du `.chat-panel` (drawer) qui était toujours monté avec `box-shadow: -20px 0 40px rgba(0,0,0,0.45)` même fermé : son ombre dépassait de 60 px à gauche, entrait dans le viewport. **Fix** : `box-shadow` seulement quand `body.chat-open`, et `transform: translateX(calc(100% + 80px))` au lieu de `100%` pour pousser le panel encore plus loin.

## Chat pill (FAB chat fiche)

- Wrapper `.chat-pill-wrap` : `position: fixed; right: 0; height: 100vh; width: max(0px, calc((100vw - 920px) / 2)); padding-right: 40px;` avec flex center → centre la pill dans l'espace libre droit, légèrement décalée à gauche pour compenser l'asymétrie visuelle (920px contenu n'est pas exactement centré entre les chips à cause du padding interne des cards).
- Animation `chat-pill-peek` : 56px → 280-295px overshoot → 280 hold 10s → 56, cycle 60s. Override sur hover (`animation: none`) pour ouvrir/fermer instant.
- Sous 1240px, le wrapper bascule en bottom-strip pleine largeur.

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

## Toggle Mix/Master (refonte 2026-04-30, livré)

- **Toggle dans la modale d'upload** entre vocal et DAW (`uploadType` state dans `AddModal.jsx`). Default `mix`.
- Persisté dans `versions.upload_type` (Supabase). Migration : `supabase/migrations/021_upload_type.sql` (la spec parlait de 010 mais 010 était pris par `010_dsp_metrics.sql`, on a pris 021).
- Backend `decode-api/lib/claude.js` :
  - `WEIGHTS.lufs` passe à `0.5` en mode mix (vs `2` en master) → la section Master & Loudness ne plombe plus le globalScore.
  - Bloc `uploadTypeBlock` injecté dans le system prompt → recettes Master en checks pré-master (head-room, mono compat, clipping) et scores hauts par défaut en mode mix ; recettes streaming standards en mode master.
- Front fiche : `ReleaseReadinessBanner` accepte `uploadType` → libellés "Prêt pour le mastering / Presque prêt à masteriser / Pas encore prêt" en mode mix, libellés historiques en master. Strings dans `strings.js` (FR + EN, clés `releaseMasteringReady*`).
- RPC publique `get_public_fiche` non touchée pour ne pas casser la signature i18n vivante en prod : les liens publics affichent le verdict "mix" par défaut. À étendre dans une migration séparée si besoin.

## Livré récemment (mai 2026)

Snapshot des chantiers fermés sur la sprint en cours — pour comprendre vite ce qui a bougé sans relire les commits.

- **Pages légales `/privacy` et `/terms`** — éditeur Multicolorz (SIRET 819 747 296), i18n FR/EN via `STRINGS.legal.{privacy,terms}`, layout partagé dans `components/LegalLayout.jsx` (helper `renderLegalInline` pour `**gras**` + `{email}`). Sous-traitants simplifiés en une phrase pointant vers `contact@versions.studio` pour la liste détaillée. Liens "Confidentialité · CGU" en bas de la landing.
- **Suppression de compte automatique** — bouton danger zone dans la modale Réglages → `confirmDialog({ danger: true })` → `supabase.rpc('delete_my_account')` (RPC SECURITY DEFINER côté DB qui purge en cascade : `mix_note_completions`, `comparisons`, `versions`, `tracks`, `projects`, `credit_events`, `user_credits`, `analysis_cost_logs`, `chat_cost_logs`, `feedback`, `user_profiles`, `revenue_logs`, puis `auth.users`) → `signOut()` → redirect `#/`. Modale d'erreur (mode alert) si la RPC échoue. Storage (audio, avatars, covers) NON purgé par la RPC — orphelin côté DB, à nettoyer via job batch ultérieur.
- **Résiliation abonnement** — bouton dans Réglages visible uniquement si `monthly_grant > 0` → modale d'explication → mailto pré-rempli vers `contact@versions.studio` (sujet + corps avec email du compte). À remplacer par `cancel_subscription` quand Stripe sera branché côté backend.
- **Crédits — seed testeurs** — migration `022_seed_5_credits.sql` : 5 crédits aux nouveaux comptes ; `017_seed_99_credits.sql` : 99 crédits seedés pour David + Abakan.
- **Modale 0 crédits** — `NoCreditsModal.jsx` gate l'écran d'analyse quand `balance_remaining === 0`, CTA vers `/pricing`.
- **Score Card PNG** — watermark `www.versions.studio` ajouté à l'export (cf. section Refonte).
- **Plan d'action supprimé** — section absorbée dans les items de diagnostic via `how` + `plugin_pick` (cf. section Refonte).
- **Layout fiche 1 colonne** — refonte UI desktop fiche (cf. section dédiée).
- **Pochette + Score global sur la même ligne** — restauré depuis git history après une régression de la refonte.
- **Sections refermables sur page exemple** — accordéon strict (un seul ouvert à la fois) sur `SampleFicheScreen.jsx`.
- **Chat fictif sur page exemple** — démo UX du chat fiche sans appels API, pour les visiteurs.
- **URLs lisibles** — `#/fiche/{slug}/{vN}` (cf. routing) avec rétrocompat UUID dans `parseHash`/`buildHash`.
- **Fix refresh routing** — guard sur `authLoading` dans le routeInit (deep-link `#/fiche/...` n'écrase plus l'écran avant que la session soit hydratée).
- **Bloc 6 roadmap supprimé** — tous les tiers AubioMix sont clos, le bloc statut a été retiré (cf. section Roadmap AubioMix).

## Points en suspens

- Badge "EN COURS" tronqué sur mobile (premier chip V1).
- Thème clair à finaliser (maquettes H explorées, pas encore implémenté).
- Adapter vue mobile complète (commencé, reste à auditer).
- Étendre la RPC `get_public_fiche` pour exposer `upload_type` (les liens publics servent le verdict "mix" par défaut tant que ce n'est pas fait).
- Brancher Stripe (webhook + RPC `cancel_subscription`) — la résiliation passe pour l'instant par mailto vers le support.
- Job batch de nettoyage Storage des fichiers orphelins après suppression de compte (audio, avatars, covers).
