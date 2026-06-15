# Versions — Roadmap

Source de vérité partagée **Cowork ↔ Dispatch**. Mise à jour 2026-06-02.

> **Mode d'emploi pour toute session (Cowork ou Dispatch)**
> 1. `git pull` sur `versions-app` ET `versions-api` avant toute édition.
> 2. Lire ce fichier en premier — reprendre à la **première case non cochée**.
> 3. À la fin de la tâche : cocher, commit, push.
> 4. Si une décision change la séquence : mettre à jour ce fichier (et pas une mémoire locale).

Pour le détail : `AUBIOMIX_PLAN.md` (clos), `roadmap_post_aubiomix_2026-05-19.md` (sprint scoring/présentation), `PLUGIN_ROADMAP.md` (plugin DAW VST3/AU/AAX), `frequency_balance_map_spec.md` (spec viz balance fréquentielle), `ADMIN_DASHBOARD.md`, `audit_aubiomix.md`.

---

## ✅ Livré — récapitulatif

### Bloc 1 — Bouclage technique (CLOS)

Hard cap durée audio 12 min · Stripe complet (one-shot + abos, webhook, debit/refund) · Tables crédits `user_credits` + `credit_events` + RPC `apply_delta` (modèle Splice 2 buckets) · Sidebar live crédits · Blocage analyse si 0 crédits (modale + redirect /pricing) · Seed signups 5 crédits · `MONETIZATION_ENABLED` allumé en prod.

### Bloc 2 — Mise en production publique (CLOS, livré mai 2026)

- [x] Pages légales `/privacy` et `/terms` (éditeur Multicolorz, i18n FR/EN).
- [x] Google OAuth en Production (branding "Versions" + logo, domaine vérifié, app publiée — cap 100 users en mode Test).
- [x] URLs propres (suppression du `#`) — History API + flow PKCE Supabase + rewrite SPA Vercel + `migrateHashToPath()` filet de sécurité.
- [x] `MONETIZATION_ENABLED=true` en prod Stripe.

### AubioMix Tier 1 → Tier 4 (CLOS — cf. `AUBIOMIX_PLAN.md`)

Format des notes structuré · landing publique unifiée · checklist cochable + table `mix_note_completions` · Score Card PNG 1080×1080 · page `/exemple` sample report · score floor protection · advice-followed locking · Release Readiness verdict · Plateau detector + bouton "VERSION FINALE".

### Sprint post-snapshot AubioMix (2026-05-19 → 2026-05-21, livré — cf. `roadmap_post_aubiomix_2026-05-19.md`)

- [x] **A.2 Caps mécaniques** : `versions-api/lib/scoring/mechanicalCaps.js` (5 caps : stéréo quasi-mono, LRA serré mix, clipping mix, voix masquée, sibilantes excessives).
- [x] **A.3 Anchors mix/master** + clause CONTEXTE DEMO/MAQUETTE.
- [x] **B.3 Score Band social Option A** : 6 paliers (référence/hit/pro/démo avancée/en développement/début de parcours), ladder horizontale sous verdict, marqueur "tu es ici" avec triangle ▼.
- [x] **C.2 Question "masterisé ?"** simplifiée en Oui/Non (Auto-detect retiré 2026-05-21, mapping yes→master / no→mix).
- [x] **Persistance backend `lib/persistAnalysis.js`** + 4 paliers de protection des crédits (bg poll relais, cron orphan refund, modal+RPC `refund_my_failed_analysis`, persist côté serveur).
- [x] Hotfix `ReferenceError persistAnalysisResult` + garde-fou LUFS aberrant ([-40, +1]) + patch IPv6 `rateLimit.js`.
- [x] "Type de titre" toujours visible dans l'AddModal (plus de garde `file &&`).

### Plomberie compte / billing (mai 2026)

- [x] **Suppression de compte automatique** — danger zone dans Réglages → RPC `delete_my_account` (cascade purge DB) → signOut → redirect `/`.
- [x] **Résiliation abonnement en 1 clic** — bouton Réglages → `POST /api/billing/cancel-subscription` → Stripe `cancel_at_period_end`. Fallback mailto si abo pré-fix-webhook.
- [x] **🔥 Fix webhook Stripe abonnements** — l'API `2025-04-30.basil` déplace `invoice.subscription` vers `invoice.parent.subscription_details.subscription`. Helpers `getInvoiceSubscriptionId()` + `fetchStripeNetForInvoice()`.
- [x] **Notification intention d'annulation Stripe** — handler `customer.subscription.updated` détecte la transition `cancel_at_period_end: false → true`.
- [x] **Newsletter mensuelle automatique** — `lib/newsletter.js` + `api/_newsletter.js` (stats par user, 2 templates actif/inactif, List-Unsubscribe Resend, 12 conseils rotatifs).
- [x] **🔥 Fix analyse perdue sur refresh / tab switch / cancel** — `pendingJob.js` localStorage (TTL 30 min) + Page Visibility API + recovery + watcher 5s.
- [x] **Crédits cumulables modèle Splice** — 2 buckets `subscription_balance` / `pack_balance`, débit ordonné via RPC `debit_credits_ordered`, purge sub uniquement sur `customer.subscription.deleted`.

### Refonte UI desktop / pricing / mobile (avril → mai 2026)

Fiche desktop (verdict 2/3 + side panel chips colorées, BPM/Key cliquables, eyebrows en chip pill sans rotation, glyphes premium SVG, MOY chip color-coded, animations scroll, chat pill centrée) · Pricing podium + i18n FR/EN · Refonte landing/welcome/welcome topbar · Plus d'italique partout sauf verdicts Cormorant · Score Card refonte trophée + constellation · Charte mastering chat (CTA + seed personnalisé).

### Admin dashboard (avril → mai 2026)

Layout topbar (plus de sidebar) · Bouton Admin dans DashboardRail · Footer sidebar Admin (admin-only) · Mode coûts-only par défaut tant qu'aucune vente Stripe · KPIs nets Stripe · Section Crédit Fadr du mois (200 min / 9,20 €) · Coûts infra trackés (~27,60 €/mois) · Migration 015 recompute fadr_eur.

---

## 🟡 Sprint en cours — Scoring & présentation (cf. `roadmap_post_aubiomix_2026-05-19.md`)

### Priorité 1 — Calibration moteur

- [ ] **D.1 — Enrichir le `genreBlock`** dans `versions-api/lib/claude.js`. Preuve empirique 2026-05-21 : `declared_genre` quasi inopérant. Remplacer le "adapte tes recettes" mou par des règles formelles sur 10-12 esthétiques (pop rétro, soul Motown, R&B vintage, boom-bap, indie garage, métal moderne, country pop, latin reggaeton, electronica ambient, K-pop). **Estimé : ~1-2 h** (rédaction + 3-4 tests A/B).
- [ ] **D.2 — Améliorer le classifieur Gemini** en amont (après D.1). Soit vocabulaire fini contraint, soit 2è passe "es-tu sûr ?" sur titres mainstream. **Estimé : ~2-3 h** + mesure post-D.1.
- [ ] **Corriger le barème des verdicts** — 75/100 ne devrait pas déclencher "aïe aïe aïe". Recalibrer la zone neutre 70-79 dans le system prompt (section ECHELLE GLOBALE OBLIGATOIRE). **Estimé : ~1 h**.

### Priorité 2 — Présentation du rapport

- [ ] **B.1 — Score breakdown technique** : 4-6 barres (Tonal / Stéréo / Dynamique / Master / Bruit) dans la verdict row, à côté du scoring par élément musical. **Estimé : ~2-3 h** (les sous-scores existent déjà côté backend, c'est principalement du front).
- [ ] **B.2 — Cards "réglages compression" structurées** : pour chaque reco de compression, extraire ATK / REL / Ratio / GR / Type (Opto/VCA/FET) dans une mini-carte. À placer en fin de section DRUMS / BASSES & KICK / VOIX. **Estimé : ~3-4 h** (parsing prompt + composant card + i18n).

### Priorité 3 — UX upload

- [ ] **C.1 — Track Type "Live"** au toggle de l'AddModal (déjà Chanté / Instrumental). Calibrer côté Claude : tolérance dynamique naturelle, moins d'exigence séparation, plus sur équilibre d'ensemble. **Estimé : ~2 h front + ~1 h backend prompt = ~3 h**.
- [ ] **C.3 — Upload pill sticky** : encart toujours visible sur fiche pour inviter à uploader la prochaine version (style AubioMix "Ready to improve?"). **À valider** : on ajoute, ou la chat pill suffit ? **Estimé : ~1-2 h** si on décide d'ajouter.

### Priorité 4 — Frequency Balance Map (cf. `frequency_balance_map_spec.md`)

- [ ] **Frequency Balance Map — mode A (preview au survol)**.
  - Pipeline backend : séparation stems (déjà fait via DSP_PLAN), FFT par stem, détection collisions par seuil adaptatif selon intention, simulation biquad pour mode A preview.
  - Front : SVG 720×420, 4 lanes (Voix/Instruments/Basse/Batterie), bandes de masquage gradient orange/bleu, pulse radar sur markers, hover focus bidirectionnel chips ↔ bandes, transition preview ~600 ms.
  - **Estimé : ~1 semaine de dev** (3 jours backend, 3 jours front, 1 jour calibration + finitions).

---

## 🟡 Polish UI / mobile

- [ ] **Bug cache iPhone refonte mobile** — refonte (border-radius 20-24 + bg fullscreen via theme-color) marche Chrome desktop 390 px mais pas iPhone physique. À élucider, beta testeurs orientés desktop en attendant.
- [ ] **Badge "EN COURS" tronqué sur mobile** (premier chip V1).
- [ ] **Audit complet vue mobile** — chantier commencé, reste à passer chaque écran au crible.
- [ ] **Thème clair** — maquettes "H" explorées, pas encore implémenté.
- [ ] **Densifier la Home desktop** — trop d'espace vide pour un compte neuf (cf. `project_versions_home_desktop.md`).

---

## 🟡 Backend / data plumbing

- [ ] **RPC `get_public_fiche` exposer `upload_type`** — les liens publics servent le verdict "mix" par défaut tant que ce n'est pas fait. Migration légère côté Supabase à prévoir sans casser la signature i18n vivante en prod.
- [ ] **Job state hors RAM** — déplacer le `jobs Map` en RAM dans `_analyze.js` vers une table Supabase. Pré-requis si on retente Vercel-only un jour.
- [ ] **Enrichir le pool de conseils newsletter** — passer de 12 → 36+ tips + rotation hash `(userId, month)`. À terme : conseils dynamiques basés sur les recurring weaknesses de l'utilisateur.
- [ ] **Configurer cron mensuel newsletter** sur cron-job.org (ou Railway cron) — `0 9 1 * *`, POST `/api/newsletter/send` avec header `X-Admin-Secret`.
- [ ] **Job batch de nettoyage Storage** des fichiers orphelins après suppression de compte (audio, avatars, covers).

---

## 🟡 Plugin DAW (cf. `PLUGIN_ROADMAP.md`)

Plan complet ~12 semaines en 5 phases. Reprise sprint en attente. **Prochaine action notée** : installer JUCE + Xcode, créer un projet vide, confirmer que le plugin charge dans un DAW.

---

## 🟡 Décisions data-driven (à partir de ~50 analyses loggées)

- [ ] **Ajuster la grille de prix** sur la base des coûts réels mesurés sur `#/admin`.
  - Coût moyen < 0,50 € → on peut baisser le pack 5 vers 2,50 €/u et ouvrir un pack 25 ou 50.
  - Coût moyen > 1,00 € → remonter pack et abo Pro.
  - Toujours regarder le P95 plus que la moyenne.
- [ ] **Annuel −2 mois sur les abos** (~30 min). Price récurrent annuel côté Stripe + toggle Mensuel/Annuel dans `PricingScreen.jsx`.
- [ ] **Hard cap durée plus serré** (8 min ?) si le P95 dépasse 1,50 €.
- [ ] **Vérification Google OAuth pour passage en Production publique** (au-delà du cap 100 testeurs). Soumettre formulaire à Google (logo, scopes, domaines vérifiés). Délai 1-4 semaines.
- [ ] **Custom Domain Supabase** (~$10/mo) — `auth.versions.studio` au lieu de `uyeswtjisbzfyribnywt.supabase.co` sur le consent screen Google. Optionnel.

---

## Reporté / backlog

- **Reference Mix payant** — upsell intéressant mais pas prioritaire.
- **Peer comparison par genre** — attendre une base d'historique (centaines de mix) avant des stats crédibles.
- **Persona qui signe le rapport** — trust signal humain à reconsidérer plus tard.
- **Frequency Balance Map mode B (toggle global) et mode C (roadmap interactive)** — à reconsidérer après le retour utilisateurs sur le mode A.

---

## Différenciation propre — à NE PAS abandonner

Ces axes restent notre territoire unique vs AubioMix.

- **Intention artistique en 1ʳᵉ section du rapport** — cf. `project_versions_intention.md`.
- **Production / arrangement / structure** — AubioMix ne touche pas du tout.
- **Multilingue (FR natif)** — eux 100% UK.
- **Comparaison de catalogue** (mes mixes entre eux) — eux track-par-track uniquement.
- **Hook narratif compositeur** (équivalent leur "Auditory Habituation", à créer).

---

## Journal des décisions

- **2026-04-28** — Roadmap initiale post-AubioMix. Bloc 1 (cap audio + Stripe + crédits) défini comme bouclage technique.
- **2026-04-29** — Bloc 1 entièrement clos. Tentative migration Vercel-only avortée. Decode-API revert sur Railway.
- **2026-04-30** — Toggle Mix/Master + charte mastering chat avec garde-fou LUFS. Refonte UI desktop fiche.
- **2026-05-01** — Score Card refonte trophée + constellation.
- **2026-05-04** — URLs propres livré (History API + OAuth PKCE + rewrite Vercel SPA).
- **2026-05-05** — Validation OAuth Google (passage Testing → Production, cap 100 users), pages légales `/privacy` et `/terms` livrées.
- **2026-05-18** — Snapshot comparatif AubioMix → décision d'attaquer scoring (caps + bands) + présentation (breakdown + cards compression).
- **2026-05-19 → 2026-05-21** — Sprint AubioMix livré : caps mécaniques, anchors mix/master, Score Band social, question masterisé. Persistance backend 4 paliers. Hotfix ReferenceError + LUFS + IPv6.
- **2026-05-26** — Fix analyse perdue (localStorage + Visibility API + watcher).
- **2026-05-27** — Fix webhook Stripe API basil + Newsletter mensuelle + Notif intention annulation.
- **2026-05-31** — Résiliation abonnement en 1 clic livrée.
- **2026-06-02** — Mise à jour roadmap : archivage Bloc 2 (toutes les pré-prod livrées), ajout sprint scoring en cours (D.1, D.2, B.1, B.2, C.1, C.3, Frequency Map mode A) en priorisé.
