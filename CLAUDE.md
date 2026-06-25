# Versions — Notes de contexte

Récap pour reprendre proprement le projet depuis Cowork.

## Architecture

- **Front** : `~/versions-app/src/` — React + Vite, déployé sur Vercel.
- **Backend** : `~/versions-api/` — Node, héberge l'analyse Claude (Sonnet 4.6).
  - Anciennement `~/decode-api/` — renommé 2026-05-05 lors du passage en prod (le projet "Decode" original n'est plus d'actualité).
- **Deploy** : `git push` sur `main` → Vercel auto (front) et redeploy backend.
- **Ne PAS utiliser** `~/Desktop/Versions/` ni `deploy.sh` (legacy).

## Routing (URLs propres, History API)

Bascule du hash router vers History API livrée 2026-05-04 (cf. section "Livré récemment"). Vercel sert tout via le rewrite SPA dans `vercel.json` (`/* → /index.html`).

| Route | Écran |
|---|---|
| `/` | Landing publique (accessible connecté ou pas) |
| `/dashboard` | Dashboard utilisateur (projets, titres) |
| `/fiche/{slug}/{vN}` | Fiche d'analyse — URLs lisibles avec slug du titre |
| `/p/{token}` | Fiche publique partagée (lecture seule, pas d'auth) |
| `/exemple` | Page exemple avec données fictives |
| `/analyse` | Nouvelle analyse |
| `/auth/callback` | Callback OAuth (PKCE) — Supabase échange le `?code=`, puis redirect vers `/dashboard` |
| `/pricing` | Page tarifs |
| `/admin` | Dashboard admin (gaté `VITE_ADMIN_EMAIL`) |
| `/privacy` | Politique de confidentialité (FR/EN) |
| `/terms` | Conditions générales d'utilisation (FR/EN) |

- Logo cliquable → pointe vers la landing.
- "À propos" dans la sidebar → landing.
- `migrateHashToPath()` exécutée au top de `App.jsx` convertit silencieusement tout vieux lien `/#/...` en `/...` à la volée (filet de sécurité même si rien n'a été partagé en `#`).

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
- `IntentionScreen.jsx` (saisie intention pendant un run d'analyse, quand le
  backend passe en `awaiting_intent` ; préremplie avec l'intention héritée en V2+).
- Champ `artistic_intent` sur la table `tracks`
- Champ `version_intent` sur la table `versions`

### Édition directe de l'intention sur la fiche (2026-06-15)

Avant : l'intention ne se saisissait QUE via `IntentionScreen` (donc pendant
une analyse) ; `IntentPanel` sur la fiche était en lecture seule et renvoyait
`null` quand il n'y avait aucune intention → un titre créé **sans** intention
(ex. depuis le plugin DAW) n'avait aucun moyen d'en recevoir une sans relancer
une analyse. Cul-de-sac du nudge plugin « complète ta fiche sur versions.studio ».

Fix (`src/screens/FicheScreen.jsx`, `IntentPanel`) :
- **Lecture** : bouton « Modifier » discret sous l'intention.
- **Édition** : textarea + Annuler/Enregistrer → écrit via
  `updateTrackIntent` / `updateVersionIntent` (déjà dans `storage.js`).
  Scope d'écriture = version si l'intention vit au niveau version, sinon titre.
  Un `localIntent` (state) reflète la sauvegarde immédiatement, puis `onRefresh`
  (`loadTracks().then(setTracks)`) recharge depuis Supabase.
- **Cas vide** : au lieu de `null`, le panneau affiche « Non renseignée » + un
  CTA pill « Ajouter une intention artistique ». Pour qu'il se monte même sur
  une V1 vierge, le wrapper colonne-droite teste désormais
  `evolution || hasIntentSource || canEditIntent` (`canEditIntent` = titre
  persisté, id non `__pending`).
- **Lecture seule préservée** sur fiche publique / page exemple : elles ne
  passent pas `onRefresh` → `editable=false`, aucun bouton, et si pas
  d'intention le panneau renvoie `null` comme avant.
- CSS dans `MockupStyles.jsx` (`.intent-panel-edit*`, `.intent-panel-add`,
  `.intent-panel-btn.ghost/.primary` — charte ambre). Strings FR+EN
  `intentEmpty/Edit/Add/Save/Saving/Cancel/Placeholder` dans `strings.js`.

## Typo

- **DM Sans** partout (corps + UI).
- **Cormorant Garamond** pour les verdicts (titres dramatiques).
- Pas d'italique sur les mots isolés en orange (règle visuelle d'emphasis).

## Question "Ce mix a-t-il été masterisé ?" (refonte 2026-05-20, livré — ex-Toggle Mix/Master)

- **Question dans la modale d'upload** entre vocal et DAW (`masteredAnswer` state dans `AddModal.jsx`). Default `auto`.
- 3 options UI : `yes` / `no` / `auto` (Auto-detect). Mapping rétro-compat au submit vers `upload_type` DB :
  - `yes`  → `'master'`
  - `no`   → `'mix'`
  - `auto` → `'mix'` (défaut safe — pondération master & loudness à 0.5, ne plombe pas le score d'un titre non finalisé. À enrichir si le backend gagne une heuristique LUFS réelle).
- Confirm modale conservée sur "Oui" : protège des utilisateurs qui cochent par réflexe alors qu'ils ont un limiteur sur le master bus pour l'écoute. Si annulation → bascule en `auto` (et non `no`, pour ne pas imposer une réponse négative non explicite).
- Persisté dans `versions.upload_type` (Supabase). Migration : `supabase/migrations/021_upload_type.sql` (la spec parlait de 010 mais 010 était pris par `010_dsp_metrics.sql`, on a pris 021). **Schéma DB inchangé** — toujours 'mix'/'master'.
- Backend `versions-api/lib/claude.js` :
  - `WEIGHTS.lufs` passe à `0.5` en mode mix (vs `2` en master) → la section Master & Loudness ne plombe plus le globalScore.
  - Bloc `uploadTypeBlock` injecté dans le system prompt → recettes Master en checks pré-master (head-room, mono compat, clipping) et scores hauts par défaut en mode mix ; recettes streaming standards en mode master.
- Front fiche : `ReleaseReadinessBanner` accepte `uploadType` → libellés "Prêt pour le mastering / Presque prêt à masteriser / Pas encore prêt" en mode mix, libellés historiques en master. Strings dans `strings.js` (FR + EN, clés `releaseMasteringReady*`).
- RPC publique `get_public_fiche` non touchée pour ne pas casser la signature i18n vivante en prod : les liens publics affichent le verdict "mix" par défaut. À étendre dans une migration séparée si besoin.

## Protection des crédits — 4 paliers (livré 2026-05-21)

Architecture historique fragile : le crédit était débité côté serveur dès `/api/analyze/start`, mais la fiche (`tracks`/`versions`) était persistée **uniquement côté client** par `src/lib/storage.js::saveAnalysis()`. Si l'utilisateur fermait sa tab ou perdait le réseau pendant l'analyse, le crédit était cramé sans qu'aucune ligne ne soit créée. 4 cas observés en 6 jours (verdoljose2, addlenywooo, imperatorselect, fifichayeb — tous des nouveaux signups bloqués à leur premier essai).

Quatre paliers de protection ont été empilés, du tactique au structurel :

1. **Relais polling fond** (`App.jsx`) — `handleLoaded` appelle désormais `startBackgroundPolling(merged._jobId)` dès que `_stage !== "all_done"`. Avant ce fix, `LoadingScreen` sortait de sa boucle sur `listening_done` (fiche partielle) et personne ne reprenait le polling → la fiche n'était jamais sauvegardée même si le backend la générait. La fonction `startBackgroundPolling` existait depuis longtemps mais n'avait jamais été branchée.

2. **Cron Supabase `refund_orphan_debits()` toutes les 30 min** (migration `032_refund_orphan_debits.sql`) — fonction SQL idempotente + extension `pg_cron`. Détecte les `credit_events.debit_analysis` sans `version` correspondante dans la fenêtre [debit, debit + 30 min] ET pour des utilisateurs qui n'ont **jamais** persisté aucune fiche (heuristique stricte qui évite les faux positifs sur power users qui testent + cleanupent). Reason='refund_failed'. Fenêtre 7 jours.

3. **Modal d'alerte + RPC immédiate sur échec saveAnalysis** — nouvelle RPC `refund_my_failed_analysis(p_job_id text)` user-callable (auth.uid()), anti-abus (vérifie l'absence de version persistée + l'idempotence). Helper front `handleSaveFailure(jobId, origin)` dans `App.jsx` qui détecte les retours null silencieux de saveAnalysis ET les .catch, appelle la RPC, affiche un modal (strings `errors.saveFailed*` FR + EN), reset vers welcome. Branché sur les deux call sites de saveAnalysis (handleLoaded all_done + startBackgroundPolling).

4. **Persistance côté backend** (fix architectural) — nouveau helper `versions-api/lib/persistAnalysis.js` (service_role) qui insère `tracks`/`versions` directement à la fin du pipeline, aux deux completion points (cache hit + chemin normal de `_analyze.js`). Le job state expose `persistedTrackId` / `persistedVersionId` / `persistError`. `LoadingScreen` propage ces IDs jusqu'à `onDone`. `App.jsx` (les deux call sites) préfère ces IDs au lieu d'appeler saveAnalysis si présents. **Si la persist échoue (Supabase outage, RLS), le front retombe sur le fallback saveAnalysis** — aucune régression possible.

Le client passe désormais `projectId` et `copyrightAcknowledgedAt` dans `startBody` pour que le backend respecte le projet choisi dans `AddModal`.

Combiné, le crédit n'est plus perdu :
- Tab fermée pendant l'analyse → palier 4 (fiche déjà en DB)
- LoadingScreen sort sur listening_done → palier 1 (relais polling)
- saveAnalysis crashe pendant que l'user est là → palier 3 (modal + RPC)
- Backend pipeline crash → existant (`refundCreditIfDebited` dans `_analyze.js`)
- Backend persist échoue + saveAnalysis échoue → palier 3 fallback + palier 2 cron (30 min)

Les paliers 1-3 sont devenus des filets de sécurité redondants une fois le palier 4 actif. On les garde en defense-in-depth.

## Score Band social (B.3, refonte 2026-05-20, livré)

- **Échelle complète des 6 paliers** rendue sous le verdict dans `ReleaseReadinessBanner.jsx` (inspirée AubioMix) — situe socialement le mix sans entrer en conflit avec le tier ready/almost/not-yet (les deux dimensions sont indépendantes : un mix peut être "Niveau pro" mais "Pas encore prêt" s'il a des bloquants non résolus).
- **Pas de chip unique séparé** : la 1ère mouture avait un chip palier en plus à droite du verdict, retiré 2026-05-20bis sur retour David ("doublon visuel avec le palier highlighted dans la ladder").
- Wording Option A "Sobre et factuel" tranchée avec David. 6 paliers calés sur `globalScore /100` :
  - 90-100 : Niveau référence (violet)
  - 80-89 : Niveau hit (cerulean)
  - 65-79 : Niveau pro (mint)
  - 50-64 : Démo avancée (amber) — sans "Niveau" pour rester court, le mot est déjà long
  - 30-49 : En développement (amber muted)
  - 0-29 : Début de parcours (neutre gris)
- **Pas de rouge dans la grille de couleurs** : "En développement" et "Début de parcours" sont encourageants, pas punitifs.
- Helper `getScoreBand(score)` inline dans le composant (pas dans `ficheHelpers.jsx` tant qu'il n'est pas réutilisé ailleurs — Score Card PNG potentielle 2è cible plus tard).
- Source de vérité partagée : `SCORE_BAND_LADDER` (ordre + tone par stringKey). Format compact volontairement (font 8.5px, padding 3×7px, gap 5px) — tient sur 1 ligne dans la colonne 920px, retombe en 2 lignes sur mobile via `flex-wrap`.
- **Marqueur visuel "tu es ici"** sur le palier actif : scale 1.08, opacité fond bump à 20%, petit triangle ▼ pointant le chip via `::before` (couleur héritée du tier via `currentColor`). Spécificité CSS chaînée `.is-active.rr-score-band-X` (0,3,0) pour battre les styles muted de la base.
- Strings `scoreBand*` (FR + EN). Aria-label dédié + `aria-current="true"` sur le palier actif pour les lecteurs d'écran.
- Bénéficie aux 3 écrans qui montent le banner : `FicheScreen`, `SampleFicheScreen`, `PublicFicheScreen` — pas de modif côté caller.

## Livré récemment (mai 2026)

Snapshot des chantiers fermés sur la sprint en cours — pour comprendre vite ce qui a bougé sans relire les commits.

- **Protection des crédits en 4 paliers (2026-05-21)** — cf. section dédiée. Fix root du bug "crédit débité sans fiche persistée" via persistance backend dans `versions-api/lib/persistAnalysis.js`, plus 3 filets de sécurité tactiques. Touche `versions-api` (lib/persistAnalysis, api/_analyze) et `versions-app` (App.jsx, LoadingScreen, strings, supabase/migrations/032_refund_orphan_debits.sql). 4 utilisateurs touchés au préalable manuellement re-crédités à 3 chacun via `manual_admin`.
- **Pages légales `/privacy` et `/terms`** — éditeur Multicolorz (SIRET 819 747 296), i18n FR/EN via `STRINGS.legal.{privacy,terms}`, layout partagé dans `components/LegalLayout.jsx` (helper `renderLegalInline` pour `**gras**` + `{email}`). Sous-traitants simplifiés en une phrase pointant vers `contact@versions.studio` pour la liste détaillée. Liens "Confidentialité · CGU" en bas de la landing.
- **Suppression de compte automatique** — bouton danger zone dans la modale Réglages → `confirmDialog({ danger: true })` → `supabase.rpc('delete_my_account')` (RPC SECURITY DEFINER côté DB qui purge en cascade : `mix_note_completions`, `comparisons`, `versions`, `tracks`, `projects`, `credit_events`, `user_credits`, `analysis_cost_logs`, `chat_cost_logs`, `feedback`, `user_profiles`, `revenue_logs`, puis `auth.users`) → `signOut()` → redirect `#/`. Modale d'erreur (mode alert) si la RPC échoue. Storage (audio, avatars, covers) NON purgé par la RPC — orphelin côté DB, à nettoyer via job batch ultérieur.
- **Résiliation abonnement en 1 clic (livré 2026-05-31)** — bouton dans Réglages visible si `monthly_grant > 0` → confirm modal d'explication (fin de période préservée) → `POST /api/billing/cancel-subscription` (Bearer JWT) → backend pose `cancel_at_period_end=true` sur l'abo Stripe → modale de succès avec la date de fin précise. Endpoint idempotent. Fallback mailto silencieux si l'API échoue OU si le backend renvoie `reason: 'missing_sub_id'` (abos pré-fix-webhook-2026-05-27 dont `stripe_subscription_id` n'a jamais été peuplé) — pas de régression possible. Strings `cancelSubSuccess*` FR + EN. Le webhook `customer.subscription.updated` existant détecte la transition et envoie la notif ops automatiquement (event coché côté Stripe Dashboard 2026-05-31).
- **Crédits — seed testeurs** — migration `022_seed_5_credits.sql` : 5 crédits aux nouveaux comptes ; `017_seed_99_credits.sql` : 99 crédits seedés pour David + Abakan.
- **Modale 0 crédits** — `NoCreditsModal.jsx` gate l'écran d'analyse quand `balance_remaining === 0`, CTA vers `/pricing`.
- **Score Card PNG** — watermark `www.versions.studio` ajouté à l'export (cf. section Refonte).
- **Plan d'action supprimé** — section absorbée dans les items de diagnostic via `how` + `plugin_pick` (cf. section Refonte).
- **Layout fiche 1 colonne** — refonte UI desktop fiche (cf. section dédiée).
- **Pochette + Score global sur la même ligne** — restauré depuis git history après une régression de la refonte.
- **Sections refermables sur page exemple** — accordéon strict (un seul ouvert à la fois) sur `SampleFicheScreen.jsx`.
- **Chat fictif sur page exemple** — démo UX du chat fiche sans appels API, pour les visiteurs.
- **URLs lisibles** — `/fiche/{slug}/{vN}` (cf. routing) avec rétrocompat UUID dans `parsePath`/`buildPath`.
- **Fix refresh routing** — guard sur `authLoading` dans le routeInit (deep-link `/fiche/...` n'écrase plus l'écran avant que la session soit hydratée).
- **Bloc 6 roadmap supprimé** — tous les tiers AubioMix sont clos, le bloc statut a été retiré (cf. section Roadmap AubioMix).
- **URLs propres (sans `#`)** — bascule du hash router vers History API livrée 2026-05-04. `vercel.json` ajoute le rewrite SPA `/* → /index.html`. Supabase OAuth bascule en flow PKCE (`flowType: 'pkce'` + `redirectTo: ${origin}/auth/callback`) pour ne plus laisser de tokens dans le fragment d'URL. Tous les liens internes (`href="#/..."`, `window.location.hash = ...`) migrés. `migrateHashToPath()` au top de `App.jsx` convertit les vieux liens `/#/...` à la volée. Branding Google Cloud Console (logo Versions + nom + privacy/terms) configuré dans la foulée — visible sur le consent screen pour les nouveaux utilisateurs.
- **Branding OAuth Google** — logo `Logo-Versions-web.png` + nom "Versions" + liens privacy/terms posés dans Google Cloud Console (Auth Platform → Branding) le 2026-05-04. App Google reste en mode Test, validation Google non requise tant qu'on n'est pas en Production.

## Points en suspens

- Badge "EN COURS" tronqué sur mobile (premier chip V1).
- Thème clair à finaliser (maquettes H explorées, pas encore implémenté).
- Adapter vue mobile complète (commencé, reste à auditer).
- Étendre la RPC `get_public_fiche` pour exposer `upload_type` (les liens publics servent le verdict "mix" par défaut tant que ce n'est pas fait).
- Job batch de nettoyage Storage des fichiers orphelins après suppression de compte (audio, avatars, covers).
- **Vérification Google OAuth pour passage en Production** — l'app Google est en mode Test (max 100 testeurs whitelistés). Avant launch public, soumettre le formulaire de vérification Google (logo, scopes justifiés, domaines vérifiés via Search Console). Délai 1-4 semaines. Sans ça, login Google bloqué pour les utilisateurs hors liste.
- **Custom Domain Supabase** (optionnel, ~$10/mo) — pour remplacer `uyeswtjisbzfyribnywt.supabase.co` par `auth.versions.studio` sur l'écran Google ("Accéder à l'application X"). Pas un blocker, à activer si on veut le polish premium avant le launch grand public.
- **Configurer cron mensuel newsletter** sur cron-job.org (ou Railway cron) — `0 9 1 * *`, POST `https://<api>/api/newsletter/send` avec header `X-Admin-Secret`. Sans `?wide=1` (réservé au tout premier envoi qui couvre 2 mois ; les suivants couvrent juste le mois écoulé).
- **Corriger le barème des verdicts** : 75/100 ne devrait pas déclencher "aïe aïe aïe". La calibration vit dans le system prompt de `versions-api/lib/claude.js` (section "ECHELLE GLOBALE OBLIGATOIRE" + consignes verdict). Probablement à remonter le seuil "verdict négatif" autour de 60-65 et ajouter une zone neutre 70-79.
## Livré 2026-05-21

- **🔥 Hotfix `ReferenceError` persistAnalysisResult (root cause du crash `measures_done`)** — le commit 9427693 du matin (persistance backend) référençait `version`, `vocalType`, `projectId`, `copyrightAcknowledgedAt` dans le call site de `persistAnalysisResult` côté `runDiagnosticPhase`, mais aucune de ces 4 variables n'était dans le destructuring de `ctx`. Résultat : ReferenceError quand le code construisait les options persist (juste après generateFiche), throw qui propageait au catch externe de `/start` ou `/diagnose` → `status:error` sans trace lisible. Toutes les analyses lancées entre 10:05 UTC et le push du hotfix ont crashé (heureusement, seul David testait pendant cette fenêtre — 0 utilisateur prod touché). **Fix** : ajout des 4 variables au destructuring + propagation depuis les 2 ctx en `/start` (skipIntent path + awaiting_intent ctx pour /diagnose). La mitigation temporaire `master+declared_genre` déployée plus tôt dans la journée a été retirée — elle visait à côté de la cible.

- **Patch IPv6 `versions-api/lib/rateLimit.js`** — `keyByUser` utilise maintenant `ipKeyGenerator(req)` de `express-rate-limit` v8 (au lieu de `req.ip` brut) pour le fallback non-authentifié. Nettoie les 8 `ValidationError ERR_ERL_KEY_GEN_IPV6` au démarrage Railway et ferme une vraie vulnérabilité (utilisateur IPv6 pouvait bypasser le limiteur en changeant le dernier segment de son adresse). Aucun impact fonctionnel côté requêtes authentifiées (chemin `req.user.id` inchangé).

- **Garde-fou LUFS aberrant dans `versions-api/lib/dsp.js`** — `parseEbur128()` sanitize maintenant la valeur LUFS : si elle sort de la plage [-40, +1] LUFS, on bascule en `null` (mode dégradé) avec un `console.warn` lisible côté Railway. Cause de l'ajout : un utilisateur (serrurerie.rayan, pseudo TikTok "Arts Márcio") a vu son mix latin pop/rap mesuré à `-70.0 LUFS` par ffmpeg ebur128 — valeur impossible musicalement, qui a plombé son score à 52 et l'a fait râler publiquement. Origine probable côté fichier source (silence long en début, encodage exotique, durée trop courte pour le gating ITU-R BS.1770). Le garde-fou couvre AUSSI `measureMonoLufs` qui partage `parseEbur128`, donc le calcul `monoCompat` reste cohérent. À surveiller dans Railway : la fréquence du warn nous dira si c'est anecdotique ou s'il faut creuser côté ffmpeg.

- **Question "masterisé ?" simplifiée en Oui/Non binaire** (`AddModal.jsx`) — l'option Auto-detect est retirée (elle promettait une détection LUFS/dynamique non implémentée, mappait silencieusement sur 'mix'). Default désormais `'no'` (la plupart des uploads sont des mix en cours). Hint reformulé pour expliquer que le titre est évalué sans exiger les niveaux d'un master fini. Strings `uploadTypeAuto` + `uploadTypeAutoHint` supprimés (FR + EN). Cancel du confirmDialog "Yes" retombe désormais sur `'no'` (et non plus `'auto'`). Mapping backend inchangé (yes→master, no→mix).

- **"Type de titre" toujours visible** (`AddModal.jsx` ligne 778) — retrait de la garde `file &&` qui cachait le toggle Chanté/Instrumental tant qu'aucun fichier n'était uploadé. Cohérence visuelle avec DAW/Genre/Intention/Masterisé qui sont tous visibles dès l'ouverture de la modale.

## Livré 2026-05-26

- **🔥 Fix analyse perdue sur refresh / tab switch / cancel** (`823e2d9`, front) — bug latent même après le palier 4 backend : quand l'analyse termine pendant que l'user n'est plus sur `LoadingScreen` (refresh, tab en background, click logo, back nav), le polling local meurt et la fiche n'est jamais affichée — crédit débité, analyse "perdue" malgré la persistance DB. **3 mécanismes** :
  1. **`pendingJob.js`** (nouveau) — sauvegarde `{jobId, audioHash, title, ...}` dans localStorage (TTL 30 min) immédiatement après `POST /start`. Plumbe `persistedTrackId` au fil du polling pour permettre un deeplink direct.
  2. **Page Visibility API + cap +12 min** dans `LoadingScreen` — sleep pokeable via `visibilitychange` (les tabs en background throttlent `setTimeout`, on rattrape au retour). Cap polling 120 → 240 attempts. Sur timeout réel, appel RPC `refund_my_failed_analysis` immédiat (pas d'attente du cron 30 min). 404 backend (job expiré en mémoire) → sortie propre, le watcher prend le relais.
  3. **Recovery + watcher dans `App.jsx`** — au mount (user+projects prêts), détecte `pending` : si job vivant → resume polling, si complete + `persistedTrackId` → deeplink direct, si 404 → fallback `findDuplicateAudio` par audioHash. Watcher 5s qui tourne tant qu'on est hors loading/fiche avec pending non vide (cas cancel/back mid-analyse). `navigateToPersistedFiche` bypasse le resolver `pendingFiche` pour éviter la race "projects pas à jour → fallback welcome".

## Livré 2026-05-27

- **🔥 Fix webhook Stripe abonnements** (backend, commit `8eb9f64`) — l'API Stripe `2025-04-30.basil` déplace `invoice.subscription` vers `invoice.parent.subscription_details.subscription` et supprime `invoice.charge` au profit de `invoice.payments[]`. Le guard `if (!invoice.subscription) return` rejetait silencieusement TOUS les `invoice.paid` d'abo reçus en nouveau format → crédit jamais appliqué, ni `stripe_customer_id` ni `stripe_subscription_id` persistés. Symptôme observé : sub Indie 14,99€ débité par Stripe sans contrepartie côté Versions. Fix : helpers `getInvoiceSubscriptionId(invoice)` et `fetchStripeNetForInvoice()` qui lisent les 2 formats. Le sub Indie touché reste à re-créditer manuellement (12 crédits bucket sub) + renseigner `stripe_customer_id`/`stripe_subscription_id` depuis Stripe Dashboard (le webhook ne rejouera pas).

- **Newsletter mensuelle automatique** (backend) — `lib/newsletter.js` + `api/_newsletter.js`, monté sur `/api/newsletter` dans `server.js`. Calcule par user les stats du mois (analyses via `credit_events.reason='debit_analysis'`, versions uploadées via `tracks→versions`, meilleur score depuis `analysis_result.fiche.globalScore`, progression = moyenne des deltas positifs entre versions consécutives d'une même track, recos appliquées via `mix_note_completions.completed=true`, crédits restants). 2 templates HTML inline light-only (charte amber `#f5b056` accents / `#d4900e` petits textes) : actif (≥1 analyse) et inactif (0 analyse). Pool de 12 conseils rotatifs (un par mois). Envoi via Resend avec header `List-Unsubscribe` (bouton natif Gmail/Outlook). Endpoints gated `X-Admin-Secret` (ou `?secret=` pour pouvoir trigger depuis Safari iPhone) :
  - `POST /api/newsletter/send` — params `?month=YYYY-MM`, `?wide=1` (fenêtre 2 mois pour premier envoi), `?only=email1,email2` (bypass liste admins, c'est comme ça que David/Abakan reçoivent la newsletter), `?dry=1`.
  - `GET /api/newsletter/preview?email=...` — rendu HTML sans envoi.
  - Mois résumé par défaut = mois précédent (cron prévu sur le 1er → récap du mois écoulé).

- **Notification intention d'annulation Stripe** (backend, commit `bedf633`) — handler `customer.subscription.updated` dans `api/_billing.js` qui détecte la transition `cancel_at_period_end: false → true` via `event.data.previous_attributes` (filtre strict pour ne pas spammer — `subscription.updated` fire sur plein de changements unrelated : plan, payment method, period rollover). Envoie une notif ops "[Versions] Intention d'annulation · {plan}" avec email client, plan, date de fin prévue (`cancel_at` ou `current_period_end`), user_id, lien Stripe. **Aucun mouvement DB** : l'abo reste actif jusqu'à la fin de période, puis le handler `customer.subscription.deleted` existant prend le relais (purge sub_balance + reset méta abo). **À activer** : cocher `customer.subscription.updated` dans les Listened events du webhook Stripe (cf. Points en suspens).

- **Pricing — crédits cumulables (pas reset)** — modèle Splice acté 2026-04-29 : 2 buckets dans `user_credits` (`subscription_balance` purgeable à résiliation, `pack_balance` à vie), mirror dans `balance_remaining`. Débit ordonné via RPC `debit_credits_ordered` (sub d'abord, puis pack). Abo mensuel cumule (pas de reset au renouvellement) tant qu'actif ; purge uniquement sur `customer.subscription.deleted`.

