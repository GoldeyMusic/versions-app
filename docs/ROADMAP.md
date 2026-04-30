# Versions — Roadmap

Source de vérité partagée **Cowork ↔ Dispatch**. Mise à jour 2026-05-01.

> **Mode d'emploi pour toute session (Cowork ou Dispatch)**
> 1. `git pull` sur `versions-app` ET `decode-api` avant toute édition.
> 2. Lire ce fichier en premier — reprendre à la **première case non cochée**.
> 3. À la fin de la tâche : cocher, commit, push.
> 4. Si une décision change la séquence : mettre à jour ce fichier (et pas une mémoire locale).

Pour le détail : `AUBIOMIX_PLAN.md` (clos en intégralité), `ADMIN_DASHBOARD.md`, `UPLOAD_DIRECT_PLAN.md`, `audit_aubiomix.md`.

---

## ✅ Livré depuis le 2026-04-28

### Bloc 1 — Bouclage technique (CLOS)

- [x] **Hard cap durée audio à 12 min** (front + back). Refus à la sélection dans `AddModal`, 413 côté `LoadingScreen`, double validation backend.
- [x] **Stripe complet** : checkout one-shot (packs) + subscriptions (Indé / Pro), webhook `charge.succeeded` / `invoice.paid`, debit/refund pipeline, init-catalog script.
- [x] **Tables crédits** : `user_credits` + `credit_events` + RPC `apply_delta`. Modèle Splice 2 buckets (sub / pack), cumul + purge à résiliation.
- [x] **Sidebar live** des crédits restants.
- [x] **Blocage analyse si pas de crédits** : 402 Payment Required côté `/analyze/start` → redirect front vers `/pricing`.
- [x] **Consommation par analyse** + **modale 0 crédits**.
- [x] **Seed initial signups** = 5 crédits (passé de 999 → 99 → 5 pendant la phase de test).
- [x] **MONETIZATION_ENABLED=false** par sécurité tant que la prod n'est pas allumée.

### Tier 4 AubioMix (livré le 2026-04-27, archivé ici pour mémoire)

- [x] Score floor protection en révision (4.1)
- [x] Advice-followed locking (4.2)
- [x] Release Readiness verdict (4.3)
- [x] Plateau detector + bouton "Marquer comme finale" (4.4)

→ Tout `AUBIOMIX_PLAN.md` est désormais clos.

### Toggle Mix / Master (livré 2026-04-30)

- [x] Toggle dans la modale d'upload (`uploadType` state dans `AddModal`).
- [x] Persistance `versions.upload_type` (migration 021).
- [x] Backend `decode-api/lib/claude.js` : pondération master `0.5` en mode mix + `uploadTypeBlock` injecté dans le system prompt.
- [x] Front fiche : `ReleaseReadinessBanner` adapte les libellés ("Prêt pour le mastering / Presque prêt à masteriser / Pas encore prêt") en mode mix.
- [x] Strings FR + EN dans `strings.js`.

### Charte mastering chat (livré 2026-04-30)

- [x] Endpoint `/api/mastering-charter` (decode-api) : croise fiche + verdict + RAG PureMix.
- [x] CTA "Conseils mastering ?" déclenche un seed personnalisé dans le chat.
- [x] Pill chat = chat vierge ; CTA = seed.
- [x] Garde-fou polarité LUFS dans le system prompt mastering (règles non négociables).
- [x] Fixes runtime : capture fetcher via ref, gate sur versionId, safety timeout 90 s, commit même si effect cleanup a fired.

### Admin dashboard (mises à jour récentes)

- [x] Page `#/admin` en **layout topbar** (plus de sidebar).
- [x] Bouton Admin dans `DashboardRail` (home/tarifs/dashboard).
- [x] Footer sidebar : Admin (admin only) + Réglages + Déconnexion.
- [x] **Mode coûts-only** par défaut tant qu'aucune vente Stripe (revenus / balance / marge masqués).
- [x] **KPIs nets Stripe** : recettes nettes 30 j + balance corrigée frais déduits.
- [x] **Section Crédit Fadr du mois** : 200 min et 9,20 € inclus.
- [x] **Coûts infra trackés** : Supabase Pro $25 + Railway Hobby $5 = ~27,60 €/mois (constante `INFRA_COSTS` en haut de `AdminScreen.jsx`).
- [x] Migration 015 : recompute rétroactif `fadr_eur` à 0,046 €/min.

### Refonte UI desktop (avril 2026)

- [x] **Fiche desktop** : grid verdict 2/3 + side panel 1/3 chips colorées (BPM cyan / Key violet / LUFS mint / Genre amber). BPM/Key cliquables → `DspEditModal`. Genre cliquable → édition inline. LUFS non éditable.
- [x] **Eyebrows en chip pill** sans rotation (Verdict, Score, Diagnostic, Notes, Évolution).
- [x] **Glyphes premium SVG** par catégorie diagnostic (`<CategoryIcon>`) — pas d'emojis.
- [x] **MOY color-coded chip** + chips deltas EvolutionBanner (mint up / red down / muted stable / amber new).
- [x] **Animations entrée scroll** (`.wh-anim`, IntersectionObserver local sur fiche).
- [x] **Chat pill** centrée à droite (wrapper `.chat-pill-wrap`), animation `chat-pill-peek` 60 s, bottom-strip mobile sous 1240 px.
- [x] **Fix bande sombre** : `va-bg-orbs` débordant + `chat-panel` translation 100% + 80px.
- [x] **LoadingScreen** plein écran, logo top-left, typo Cormorant.
- [x] **Refonte modales** unifiées + dashboard projets + écran loading + verdict toujours déployé.

### Refonte landing / pricing / welcome (avril 2026)

- [x] Landing topbar avec bouton Dashboard à droite, Tarifs au milieu.
- [x] Pricing : podium 2 cartes (Pack 1 + 5), chips néon, fond animé, FAQ numérotée, scroll anim, **i18n FR/EN complète** (namespace `s.pricing`), `highlightKey` en plan.
- [x] Logo + wordmark alignés avec sidebar dashboard, switch FR/EN.
- [x] Section école rapprochée de la section abonnements.
- [x] Welcome refonte + parité topbar avec landing/pricing.
- [x] Plus d'italique partout (sauf verdicts Cormorant).

### Refonte mobile (avril 2026)

- [x] Page exemple alignée fiche.
- [x] Coins de cards plus arrondis (border-radius 20-24).
- [x] Background fullscreen via theme-color.
- [x] **Bug cache iPhone** identifié : la refonte marche sur Chrome desktop 390 px mais pas sur iPhone physique → cf. `project_versions_iphone_cache_bug.md`.

### Score Card (livré 2026-05-01)

- [x] Refonte trophée + constellation.

### Migration Vercel-only — tentée puis revert

- [x] Tentative `decode-kappa.vercel.app` → revert vers Railway. Le pipeline d'analyse 3-5 min est incompatible avec `maxDuration` 60 s serverless. Code upload direct dort dans le backend (`api/_storage.js`), réactivable plus tard si on trouve comment splitter le pipeline.

---

## 🟡 Bloc 2 — Mise en production publique (à faire avant d'allumer Stripe)

- [ ] **Pages légales** `/privacy` et `/terms` (~1 h, template SaaS musique français à adapter). **Prérequis Google OAuth Production**.

- [ ] **Google OAuth en Production** (~30 min + review Google). Branding "Versions" + logo, vérification domaine dans Search Console (DNS TXT), passage Testing → Production. Vire le warning "application non vérifiée".

- [ ] **URLs propres (suppression du `#`)** (~45 min). Refactor `parseHash`/`buildHash` → `parsePath`/`buildPath`, listeners `hashchange` → `popstate`, `vercel.json` avec rewrite vers `index.html`. Vérifier que l'OAuth Google continue de marcher après. À faire avant de partager les premiers liens publics.

- [ ] **Allumer `MONETIZATION_ENABLED=true`** sur la prod Stripe (env var côté backend) — quand les 3 items ci-dessus sont OK et que les pages légales sont en ligne.

---

## 🟡 Bloc 3 — Bugs / polish UI restants

- [ ] **Bug cache iPhone refonte mobile** — la refonte mobile (border-radius 20-24 + bg fullscreen via theme-color) marche sur Chrome desktop 390 px mais pas sur iPhone physique. À élucider avant prod ; en attendant, rediriger les beta testeurs vers desktop.
- [ ] **Badge "EN COURS" tronqué sur mobile** (premier chip V1).
- [ ] **Audit complet vue mobile** — chantier commencé, reste à passer chaque écran au crible.
- [ ] **Thème clair** — maquettes "H" explorées, pas encore implémenté.
- [ ] **Densifier la Home desktop** — trop d'espace vide pour un compte neuf (cf. `project_versions_home_desktop.md`).

---

## 🟡 Bloc 4 — Backend / data plumbing

- [ ] **RPC `get_public_fiche` exposer `upload_type`** — les liens publics servent le verdict "mix" par défaut tant que ce n'est pas fait. Migration légère côté Supabase à prévoir sans casser la signature i18n vivante en prod.
- [ ] **Job state hors RAM** — déplacer le `jobs Map` en RAM dans `_analyze.js` vers une table Supabase. Permettra plusieurs invocations concurrentes sans perdre les jobs en cours. Pré-requis si on retente Vercel-only un jour.

---

## 🟡 Bloc 5 — Décisions data-driven (à partir de ~50 analyses loggées)

- [ ] **Ajuster la grille de prix** sur la base des coûts réels mesurés sur `#/admin`.
  - Coût moyen < 0,50 € → on peut baisser le pack 5 vers 2,50 €/u et ouvrir un pack 25 ou 50.
  - Coût moyen > 1,00 € → remonter pack et abo Pro.
  - Toujours regarder le P95 (worst case) plus que la moyenne.
- [ ] **Annuel −2 mois sur les abos** (~30 min). Créer un Price récurrent annuel côté Stripe + toggle Mensuel/Annuel dans `PricingScreen.jsx`.
- [ ] **Hard cap durée plus serré** (8 min ?) si le P95 dépasse 1,50 €.

---

## 🟡 Bloc 6 — Roadmap produit (post-monétisation)

- [ ] **Détection "autre titre" à l'upload** — compare BPM / tonalité / durée vs version précédente, alerte si trop différent.
- [ ] **Système de progression entre versions** — courbe trajectoire globale au-dessus de l'EvolutionBanner.
- [ ] **Upload direct navigateur → Supabase** (réactivable, code dort dans `api/_storage.js`). Pré-requis : pousser la Global file size limit Supabase à ≥ 100 Mo (Settings → Storage), repointer `src/constants/api.js` sur Vercel, repointer le webhook Stripe. Détail : `UPLOAD_DIRECT_PLAN.md`.
- [ ] **Drag-and-drop mobile** — porter les touch events sur la nouvelle archi.
- [ ] **Audit pédagogie globale de la copy** — toute la copy user-facing au crible de la double cible : musicien isolé sans largage + pro non-snob (cf. `feedback_pedagogie_versions.md`).
- [ ] **Migration Vercel-only** — déclencheur économique (couper Railway ~$10/mois). Bloqué tant que le pipeline d'analyse 3-5 min ne tient pas dans `maxDuration` 60 s. Cf. `UPLOAD_DIRECT_PLAN.md` § "Architecture cible court-terme".

---

## Conseil de séquence

**Si 2-3 h dispos** → Bloc 2 entier (légales + OAuth Prod + URLs propres) puis allumer `MONETIZATION_ENABLED=true`. À ce moment-là, le produit est ouvert au paiement.

**Si moins de temps** → juste **les pages légales** (indépendantes, déblocage immédiat pour Google OAuth Prod ensuite).

**Si tu veux plutôt avancer côté produit** → Bloc 6 #1 ou #2 (détection autre titre / courbe trajectoire). Ça enrichit l'expérience sans bloquer la mise en prod.

---

## Journal des décisions

- **2026-04-28** — Roadmap initiale post-AubioMix. Bloc 1 (cap audio + Stripe + crédits) défini comme bouclage technique.
- **2026-04-29** — Bloc 1 entièrement clos. Tentative migration Vercel-only avortée (pipeline 3-5 min incompatible serverless 60 s). Decode-API revert sur Railway, code upload direct dort.
- **2026-04-30** — Toggle Mix/Master livré + charte mastering chat avec garde-fou LUFS. Refonte UI desktop fiche (verdict 2/3, side panel chips, eyebrows pop, glyphes premium, scroll anim, fix bande sombre).
- **2026-05-01** — Score Card refonte trophée + constellation. Mise à jour de cette roadmap pour reprendre la séquence post-Bloc-1.
