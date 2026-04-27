# AubioMix — Plan d'action Versions

> **Source de vérité partagée Cowork ↔ Dispatch.**
> Cocher au fur et à mesure. Toujours `git pull` avant d'éditer, `git push` après.
> Audit complet : [`audit_aubiomix.md`](./audit_aubiomix.md).

**Mode d'emploi pour toute session Claude (Cowork ou Dispatch)**
1. `git pull` sur les deux repos (`versions-app` et `decode-api`).
2. Lire ce fichier en premier — reprendre à la **première case non cochée**.
3. À la fin de la tâche, cocher la case + commit + push.
4. Si une décision change la séquence, mettre à jour ce fichier (et non une mémoire locale).

---

## Tier 1 — Quick wins (semaine 1)
*Cible : tous les rapports immédiatement plus pro + autorité produit.*

- [x] **1.1 — Format des notes (decode-api)**
  Modifier le prompt pour imposer un schema strict : `{section, priority(high/med/low), title, why, how(avec valeurs Hz/dB/Q/ratio/attack/release/GR), plugin_pick}`. Référence : §6.3 et §8.1 de l'audit. Effet : chaque note devient actionnable comme chez AubioMix (ex. *"compress vocal: 2:1, 10-20ms attack, 80-120ms release, 2-4dB GR"*).
  ✅ Livré : schema strict `{section, priority, title, score /100, why, how, plugin_pick}` dans `decode-api/lib/claude.js` + front adapté (`FicheScreen`, `PublicFicheScreen`, `exportPdf`, `ficheHelpers.normalizeDiagItem` avec rétrocompat ancien schema `{label, detail, tools[], score /10}`).

- [x] **1.2 — Page `/comment-on-evalue`**
  Équivalent francophone du `/evaluation-framework` d'AubioMix. 1500-2500 mots, prose + encadrés. Décrit notre méthodologie : axes évalués, pondérations, gates, ce qu'on mesure objectivement vs ce qui relève du jugement IA. Effet : autorité, SEO, trust. **À écrire à 2 mains avec David** (ne jamais citer Gemini/Claude — cf. `feedback_no_source_citations`).
  ✅ Livré — fusionné en landing publique (#/ = landing, #/dashboard = espace de travail, logo pointe vers landing, lien À propos en sidebar). Cf. ticket 3.1 et journal 2026-04-27.

## Tier 2 — Engagement + viralité (semaine 2)

- [x] **2.1 — Checklist cochable sur les notes du rapport**
  Front : cases cliquables sur chaque note. Backend : persister l'état dans Supabase (table `mix_note_completions` par exemple). UI : compteur "X/N completed (Y%)" en haut de la section Notes. Effet : engagement (l'utilisateur revient pour cocher) + base pour le futur *advice-followed locking* (Tier 4).
  ✅ Livré : table `mix_note_completions` (migration 008, RLS owner-only), checkbox amber par item diag dans `FicheScreen`, persistance optimiste via `loadNoteCompletions` / `setNoteCompletion`, compteur "X/N complétés (Y%)" + barre de progression dans le `diag-eyebrow`, items barrés/grisés quand cochés.

- [x] **2.2 — Score Card image téléchargeable**
  Canvas → PNG. Format carré 1080×1080 partageable Insta/X. Doit contenir : titre, score global, tier (avec couleur), 3 sub-scores principaux, watermark Versions. Bouton "Télécharger ma Score Card" sur la fiche.
  ✅ Livré : `lib/exportScoreCard.js` Canvas 2D pur 1080×1080 (fond `#0c0c0d`, halos seedés, anneau de score coloré par seuil, verdict italique Fraunces, top-3 sub-scores en cartes, watermark `versions-app.vercel.app`) + bouton Score Card dans la topbar desktop ET les actions mobile.

## Tier 3 — Vitrine (semaines 3-4)

- [x] **3.1 — Refonte home : séparer landing publique vs dashboard connecté**
  - **Landing publique (déconnecté)** : hero avec mockup rapport intégré (PAS juste promesse texte) + 5-7 cartes bénéfices (pas 13 comme AubioMix) + How It Works 4-5 étapes + bloc trust persona + pricing + footer riche.
  - **Dashboard connecté compte neuf** : un seul gros bloc *"Analysez votre 1er morceau"* 80% écran. À 3+ analyses : timeline + percentile par genre (à activer quand cohorte suffisante) + récents.
  ✅ Livré — fusionné avec 1.2 en landing publique (#/ = landing, #/dashboard = espace de travail, logo pointe vers landing, lien À propos en sidebar). Le contenu "comment on évalue" est intégré comme sections scrollables (différenciateurs, axes d'analyse, limites assumées). Sample report (3.2) et calibrations dashboard cold-start restent à faire séparément. Cf. journal 2026-04-27.

- [x] **3.2 — Page `/exemple-de-rapport` (sample report public)**
  Route accessible sans signup, montre la profondeur réelle d'un rapport (mock data réaliste). Lien depuis la landing. Référence : structure du sample d'AubioMix mais avec un morceau francophone et notre angle "intention artistique" en première section.
  ✅ Livré — page `#/exemple` avec mock data réaliste, intention artistique en tête, lien depuis le hero de la landing.

## Tier 4 — Fidélisation + différenciation algo (mois 2)

- [x] **4.1 — Score floor protection en révision**
  Plafond ambré sous le score global quand des items priorité high restent à traiter (84 / 79 / 74 selon le compte). Réponse directe à "j'ai uploadé sans rien fixer mais le score grimpe". Backend `score_floor` dans `lib/claude.js`, bandeau front sur fiche privée + publique + rappel dans `EvolutionBanner`.
  ✅ Livré : `applyScoreFloor` post-processeur backend, banner + CSS `.score-floor-banner`, strings FR/EN.

- [x] **4.2 — Advice-followed locking**
  S'appuie sur la checklist (2.1). Le front envoie les item ids cochés sur V_(n-1) au backend (`previousCompletions`). Backend résout le contenu via `previousAnalysisResult`, l'expose au prompt Claude, puis post-process : matching id puis fallback Jaccard sur titre dans la même catégorie. "followed" si item disparu OU score V_n ≥ V_(n-1) ; "unfollowed" si score baissé → on bumpe le score à oldScore (`advice_locked: true`) et on signale.
  ✅ Livré : `applyAdviceCheck` backend, icône cadenas par item + récapitulatif `EvolutionBanner` (X confirmés · Y encore présents).

- [x] **4.3 — Release Readiness verdict**
  Bandeau en tête du rapport : "Prêt à sortir / Presque prêt / Pas encore" avec liste des bloquants exacts. Calibration : `ready` si score ≥ 80 ET tous les items high cochés, `almost` si score ≥ 70 ET ≤ 2 items high non cochés, `not-yet` sinon.
  ✅ Livré : `computeReleaseReadiness` (ficheHelpers), `ReleaseReadinessBanner.jsx`, branché sur FicheScreen + PublicFicheScreen + SampleFicheScreen.

- [x] **4.4 — Plateau detector**
  Si v(n) ≈ v(n-1) sur 6+ critères (overall ±2, sub-scores par catégorie ±3) → bandeau ambré "Plateau détecté" avec CTA "Marquer comme finale". Badge mint "VERSION FINALE" + bouton "Retirer" quand `is_final=true`.
  ✅ Livré : `detectPlateau` (ficheHelpers), `PlateauBanner.jsx`, migration 009 (`versions.is_final` + index partiel), `setVersionFinal` storage helper. LUFS / crest / bandes spectrales restent en texte libre dans `listening.dynamique` — non encore extraits, à reprendre si besoin.

---

## Différenciation propre — à NE PAS abandonner

Ces axes restent notre territoire unique vs AubioMix. À garder dans toute décision produit.

- **Intention artistique en 1ʳᵉ section du rapport** (pas encart secondaire) — cf. `project_versions_intention.md`
- **Production / arrangement / structure** — AubioMix ne touche pas du tout
- **Multilingue (FR natif)** — eux 100% UK
- **Comparaison de catalogue** (mes mixes entre eux) — eux track-par-track uniquement
- **Hook narratif compositeur** (équivalent leur "Auditory Habituation", à créer)

---

## Choses à NE PAS copier d'AubioMix

- Leur ton "school of mixing UK" (trouver le nôtre)
- Leur dashboard cold-start qui affiche "Top 1%" sur 1 mix uploadé (ridicule)
- 13 cartes de features sur la home (trop dense)
- Pas de free tier permanent (eux : £2.99 try → on peut être plus généreux)

---

## Journal des décisions

*À remplir au fur et à mesure quand une décision modifie le plan.*

- **2026-04-26** — Plan initial agréé après audit complet. Séquence 4 tiers. Audit livré dans `docs/audit_aubiomix.md`.
- **2026-04-27** — Tickets 1.1, 2.1 et 2.2 livrés sur `main`. Tier 1 reste sur 1.2 (page `/comment-on-evalue`) ; Tier 2 entièrement clos.
- **2026-04-27** — Tickets 1.2 et 3.1 fusionnés en une landing publique unique (`#/`), accessible connecté comme déconnecté. Le contenu "comment on évalue" devient des sections scrollables (différenciateurs, 6 axes d'analyse, limites assumées). Routing : `#/dashboard` pour l'espace de travail, logo pointe vers la landing, lien "À propos" en pied de sidebar. Tier 1 entièrement clos ; Tier 3 partiellement (3.2 sample report et calibrations dashboard cold-start restent ouverts).
- **2026-04-27** — ✅ Livré — URLs persistantes pour les fiches : `#/fiche/{trackId}/{versionId}`, refresh conserve la fiche (résolveur `pendingFiche` + `getAnalysis` côté Supabase). Hors plan AubioMix mais débloque le partage interne et les bookmarks utilisateur.
- **2026-04-27** — Ticket 3.2 livré : `SampleFicheScreen` à `#/exemple` (alias `#/sample-report`). Mock data crédible (morceau "Brûle" V2, score 78), intention artistique rendue en tête via `IntentPanel`, structure parité `PublicFicheScreen`, bannière CTA bas de page. Lien "Voir un exemple" en CTA secondaire dans le hero de la landing. **Tier 3 entièrement clos.**
- **2026-04-27** — Tier 4 entièrement livré (4.1 → 4.4). Backend `decode-api` : nouveaux post-processeurs `applyScoreFloor` (plafond high-priority) et `applyAdviceCheck` (followed/unfollowed + score lock par item). Front : bandeau `ReleaseReadinessBanner` en tête, `PlateauBanner` + bouton "Marquer comme finale", icône cadenas par item verrouillé, ligne récapitulative dans `EvolutionBanner` (plafond + advice followed/unfollowed). Migration Supabase 009 : `versions.is_final` + index partiel.
