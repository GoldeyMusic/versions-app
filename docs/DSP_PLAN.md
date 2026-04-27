# DSP Mesures — Plan d'intégration Versions

> **Source de vérité partagée Cowork ↔ Dispatch.**
> Cocher au fur et à mesure. Toujours `git pull` avant d'éditer, `git push` après.
> Voir aussi : [`AUBIOMIX_PLAN.md`](./AUBIOMIX_PLAN.md) (clos) et [`audit_aubiomix.md`](./audit_aubiomix.md).

**Mode d'emploi pour toute session Claude (Cowork ou Dispatch)**
1. `git pull` sur les deux repos (`versions-app` et `decode-api`).
2. Lire ce fichier en premier — reprendre à la **première case non cochée**.
3. À la fin de la tâche, cocher la case + commit + push.

---

## Contexte du chantier

Le pipeline d'analyse actuel n'utilise **aucune mesure DSP** dans la fiche, alors que la landing promet 6 axes d'analyse incluant des termes objectifs (LUFS, facteur de crête, masquage, etc.). Ce plan vise à combler le gap entre **promesse** et **réalité technique**, sans exploser le budget par analyse.

### État actuel du pipeline (avril 2026)

1. **Fadr** (`decode-api/lib/fadr.js`) — fournit déjà : `bpm`, `key`, `lufs` intégré, `stems` séparés (vocal/drums/bass/other), `chords`, `duration`.
2. **Gemini** (`decode-api/lib/gemini.js`) — écoute le morceau et le décrit qualitativement.
3. **Claude** (`decode-api/lib/claude.js`) — rédige la fiche à partir de l'écoute Gemini + intention.

**Problème** : le prompt Claude indique explicitement *"Tu n'as AUCUNE MESURE DU MORCEAU (pas de BPM mesuré, pas de LUFS mesuré, pas de tonalité)."* — donc même les données Fadr déjà disponibles ne sont pas exploitées dans la fiche.

### Promesses landing à tenir (`landing.axe1Desc → axe6Desc`)

1. **Équilibre fréquentiel** — bas/médiums/aigus, masquages, courbe globale
2. **Dynamique** — facteur de crête, plage dynamique, transitoires, compression
3. **Image stéréo** — largeur, mono-compatibilité, équilibre L/R, placement
4. **Espace et profondeur** — réverbérations, delays, plans avant/arrière
5. **Cohérence globale** — tenue d'ensemble, fluidité entre sections, identité sonore
6. **Voix** — intelligibilité, présence, sibilances, intégration

### Budget par analyse

| Brique | Coût aujourd'hui | Après plan complet |
|---|---|---|
| Fadr (stems + meta) | ~0.50–1.50 $ | identique |
| Gemini Pro (écoute) | ~0.50–1.00 $ | identique |
| Claude Sonnet 4.6 (fiche) | ~0.10–0.50 $ | +~0.05 $ (prompt enrichi mesures) |
| DSP maison (libs OSS Node) | n/a | **0 $ runtime** (juste CPU serveur) |
| iZotope | écarté | écarté (pas d'API REST claire, complexité) |

**TL;DR** : on tient les 6 axes (ou 5 raisonnablement) **sans dépasser le budget actuel par analyse**. Le coût réel c'est le temps de dev (~3-4 semaines cumulées).

---

## Phase 1 — Wirer les mesures Fadr déjà disponibles

**Effort** : 2-3 jours
**Coût/analyse** : +~0.05 $ (tokens Claude prompt enrichi)
**Effet immédiat** : "BPM mesuré, LUFS mesuré, tonalité mesurée" devient honnête.

- [x] **1.1 — Vérifier le pipeline Fadr → analyse**
  Tracer dans le code que `extractFadrData(task)` est bien appelé et que son retour (`{bpm, key, lufs, stems, …}`) arrive jusqu'au point où le prompt Claude est construit. Identifier où ça se perd actuellement.

  **Constat (2026-04-27)** : Fadr est du **code mort** dans le pipeline live. Détail :
  - `decode-api/lib/fadr.js` exporte bien `analyzeFile()` + `extractFadrData()`, mais **aucun fichier de `decode-api/` ne fait `require('./fadr')`** (vérifié : 0 match).
  - `decode-api/api/analyze.js` (route `/start` + `/diagnose/:jobId`, le pipeline réel) appelle uniquement `analyzeListening` (Gemini) → `retrievePureMixContext` (RAG) → `generateFiche` (Claude). Pas un seul appel à `analyzeFile()` de Fadr.
  - `decode-api/api/listen.js` et `decode-api/api/chat.js` acceptent un champ `fadrData` dans le `req.body`, mais **le front (`versions-app/src`) ne l'envoie jamais** (vérifié : 0 occurrence de `fadrData` côté front).
  - Bonus : `api/listen.js` passe même `fadrData` à `analyzeListening` à la place de `mode` (mauvaise arité — `analyzeListening(buffer, mime, title, artist, mode, vocalType, locale)`). Ce sera à nettoyer si on garde cette route.
  - `FADR_API_KEY` n'est utilisée que dans `lib/fadr.js` (jamais lue ailleurs).
  - Conclusion : ces données ne se "perdent" pas, elles n'existent pas au runtime. Le prompt Claude qui annonce *"Tu n'as AUCUNE MESURE"* est factuellement correct aujourd'hui.

  **Conséquence pour 1.2+** : avant de reformuler le prompt Claude (1.2), il faut **brancher Fadr dans `api/analyze.js`** (appel `analyzeFile` puis `extractFadrData`, en parallèle de Gemini), puis transmettre les valeurs à `generateFiche` via un nouveau paramètre. Tâche ajoutée ci-dessous (1.1bis).

- [ ] **1.1bis — Brancher Fadr dans le pipeline `analyze.js`**
  Dans `decode-api/api/analyze.js`, importer `{ analyzeFile, extractFadrData }` de `../lib/fadr`. Lancer `analyzeFile(fileBuffer, …)` **en parallèle** de `analyzeListening` (Promise.all ou pattern parallèle similaire au transcodage) après réception du fichier. À l'issue, appeler `extractFadrData(task)` et stocker le résultat dans le `ctx`/job sous une clé `fadrMetrics`. Propager `fadrMetrics` jusqu'à `generateFiche` (nouvelle signature). Gérer les erreurs Fadr en mode dégradé : si Fadr échoue ou timeout, on continue sans mesures (le pipeline ne doit pas casser).

- [ ] **1.2 — Reformuler le prompt Claude principal**
  Dans `decode-api/lib/claude.js`, retirer la consigne *"Tu n'as AUCUNE MESURE"*. Remplacer par un bloc en tête de prompt :
  ```
  MESURES OBJECTIVES (mesurées sur ce morceau, à citer si pertinent) :
  - BPM : 124 (Fadr)
  - Tonalité : Am (Fadr)
  - Loudness intégré : -8.4 LUFS (Fadr, conforme ITU-R BS.1770)
  Tu peux et dois citer ces valeurs quand elles éclairent un item. Tu ne dois pas inventer d'autres mesures.
  ```

- [ ] **1.3 — Persister les mesures côté Supabase**
  Ajouter une colonne `dsp_metrics jsonb` sur la table `versions` (migration `010_dsp_metrics.sql`). Y stocker `{bpm, key, lufs, source: 'fadr'}` à la fin de l'analyse pour pouvoir les afficher sans re-appeler Fadr.

- [ ] **1.4 — Affichage front (topbar fiche)**
  Petit chip mono dans la topbar de `FicheScreen.jsx` : `124 BPM · Am · -8.4 LUFS`. Style aligné sur les autres chips de la fiche.

- [ ] **1.5 — Test manuel**
  Lancer 3 analyses (rock, pop, hip-hop). Vérifier que les valeurs apparaissent, sont stables, et que Claude les cite quand pertinent (sans inventer).

---

## Phase 2 — DSP sur le master (équilibre fréquentiel + dynamique)

**Effort** : ~1 semaine
**Coût/analyse** : 0 $ (libs OSS Node, juste CPU serveur)
**Effet** : axes "Équilibre fréquentiel" et "Dynamique" deviennent **mesurés**.

### Décision préalable
Stack DSP : **Node + libs OSS** (recommandé pour rester sur la stack actuelle) vs microservice Python.
Libs candidates Node :
- `meyda` — features audio (RMS, spectral centroid, MFCC, énergie par bande)
- `loudness-meter` ou `node-loudness` — LUFS/LRA conformes ITU-R BS.1770
- Calculs maison pour le crest factor (peak / RMS, ~10 lignes)

### Tâches

- [ ] **2.1 — Module `decode-api/lib/dsp.js`**
  Prend un buffer audio (ou un path local) et retourne :
  ```js
  {
    crestFactor: 12.4,         // dB
    lra: 6.2,                  // LU (loudness range)
    truePeak: -0.8,            // dBTP
    dcOffset: 0.0001,
    clipping: { count: 0, samples: [] },
    spectralBands: {           // % d'énergie par bande
      sub: 8,                  // 20-60 Hz
      bass: 22,                // 60-250 Hz
      lowMid: 18,              // 250-500 Hz
      mid: 15,                 // 500-2000 Hz
      hiMid: 22,               // 2-6 kHz
      highs: 15,               // 6-20 kHz
    },
  }
  ```

- [ ] **2.2 — Brancher dans le pipeline post-Fadr**
  Dans `analyze.js` ou équivalent, après réception du fichier audio, appeler `dsp.measureMaster(buffer)` en parallèle de Fadr. Persister dans `dsp_metrics` (Phase 1.3).

- [ ] **2.3 — Enrichir le prompt Claude**
  Ajouter un bloc :
  ```
  MESURES DSP MASTER :
  - Facteur de crête : 12.4 dB (sain : 10-14 dB)
  - Plage dynamique (LRA) : 6.2 LU
  - True peak : -0.8 dBTP
  - Distribution spectrale : sub 8% / bass 22% / low-mid 18% / mid 15% / hi-mid 22% / highs 15%
  - Clipping : aucun
  ```

- [ ] **2.4 — Affichage front**
  Bloc "Mesures DSP" dans `FicheScreen.jsx` : graphique 6 bandes (réutiliser le composant chips ou en créer un dédié), valeurs crest/LRA en cartes. Cohérent avec la grammaire visuelle des autres sections.

- [ ] **2.5 — Tests**
  Comparer les valeurs DSP maison contre une mesure de référence (Logic Pro / Reaper meter). Tolérance ±0.5 dB pour LUFS, ±5% pour spectral bands.

---

## Phase 3 — DSP sur les stems (voix + image stéréo)

**Effort** : 1-2 semaines
**Coût/analyse** : 0 $
**Effet** : axes "Voix" et "Image stéréo" deviennent **mesurés**, parce qu'on isole la voix et on compare à l'instru.

### Tâches

- [ ] **3.1 — Récupération des stems Fadr**
  Vérifier que `fadrData.stems` contient bien voix/drums/bass/other (URLs S3). Télécharger les stems en buffers pour mesure (ne pas tout charger en RAM si gros — streaming idéal).

- [ ] **3.2 — Mesures par stem (`dsp.measureStem(buffer, label)`)**
  Pour chaque stem, retourner `{ lufs, peak, energyBands, duration }`.

- [ ] **3.3 — Mesures spécifiques voix**
  - Ratio LUFS voix/instru (= LUFS_vocal − LUFS_others) → "voix bien posée" si entre -3 et +3 LU
  - Énergie 5-8 kHz du stem voix → indicateur sibilances
  - Énergie 1-3 kHz → indicateur présence
  - Optionnel : analyse formants F1/F2 (intelligibilité) — lib `praat` via subprocess Python si on accepte un microservice

- [ ] **3.4 — Mesures image stéréo (sur master)**
  - Corrélation L/R (-1 à +1, où 1 = mono, 0 = très large, négatif = problèmes de phase)
  - Mid/Side ratio (% d'énergie M vs S)
  - Mono-compat : (LUFS_mono / LUFS_stereo) — si proche de 1, mix tient en mono
  - Balance L/R (différence d'énergie entre canaux)

- [ ] **3.5 — Persister + enrichir prompt**
  `dsp_metrics.stems = { vocal: {…}, drums: {…}, … }` et `dsp_metrics.stereo = {…}`. Bloc dédié dans le prompt Claude.

- [ ] **3.6 — Front**
  Carte "Voix" enrichie (LUFS voix, ratio voix/instru, indicateurs sibilances/présence).
  Carte "Image stéréo" enrichie (corrélation, mid/side, mono compat).

---

## Phase 4 — Cohérence et espace (le plus difficile)

**Effort** : 2-3 semaines
**Coût/analyse** : 0 $
**Effet** : couvre les 2 derniers axes, **mais avec des proxies moins fiables**.

⚠️ Si trop dur ou peu fiable après expérimentation, **reformuler ces 2 axes dans la landing** plutôt que de promettre du flou.

### Tâches

- [ ] **4.1 — Segmentation du morceau**
  Détection automatique de structure (intro/couplet/refrain/pont) via énergie + spectral. Lib candidate : `librosa` (Python via subprocess) ou implémentation maison sur changement d'énergie cumulée. Vérifier d'abord si Fadr peut le faire.

- [ ] **4.2 — Cohérence (variation inter-segments)**
  Pour chaque segment, calculer LUFS et distribution spectrale 6 bandes. Mesurer la variance entre segments. Faible variance → mix cohérent. Plus c'est élevé, plus c'est "patchwork".

- [ ] **4.3 — Espace / reverb (proxy)**
  Détection de wetness reverb par auto-corrélation du signal master (les réflexions tardives apparaissent comme des pics secondaires dans l'autocorrélation). Peu fiable, à valider sur 10+ titres avant de mettre en prod.

- [ ] **4.4 — Décision honnêteté**
  Si après expérimentation, "espace" reste trop flou pour une mesure objective : retirer `axe4Desc` de la landing ou le reformuler en *"Perception des effets spatiaux à l'écoute"*. Idem pour la cohérence si la variance n'est pas un indicateur fiable.

---

## Mises à jour landing en parallèle

Une fois les phases livrées, ajuster `src/screens/LandingScreen.jsx` (et les strings FR/EN) :

- [ ] **L.1 — Honnêteté dès Phase 1 livrée**
  Adapter `landing.axesLede` : aujourd'hui *"Chaque axe combine une analyse DSP objective et un jugement IA"* est partiellement faux. Après Phase 1 ça devient mostly vrai. Après Phase 2/3, c'est solide.

- [ ] **L.2 — Chips constellation enrichis**
  Une fois les mesures réelles disponibles, on peut faire des chips dynamiques côté hero (ex: *"MIX -8 LUFS"*, *"CREST 12 dB"*) — soit hardcodés sur des valeurs représentatives, soit via une démo interactive.

- [ ] **L.3 — Page `/comment-on-evalue` (si pertinent)**
  Documenter publiquement comment on mesure quoi (transparence). Référence : page `/evaluation-framework` d'AubioMix mais avec notre stack et notre angle "intention artistique".

---

## Décisions ouvertes à trancher avant de commencer

- **Stack DSP** : Node + libs OSS (recommandé, reste sur stack actuelle) vs microservice Python (plus puissant pour analyses avancées : librosa, essentia)
- **Persistance** : champ `dsp_metrics jsonb` sur `versions` (recommandé) vs table dédiée
- **Affichage front** : intégrer les mesures dans la fiche actuelle (cohérent) vs section "Mesures DSP" séparée (plus visible)
- **Granularité métrique exposée** : tout afficher (transparence totale, risque overload visuel) vs résumé pondéré + détails repliables (recommandé)

---

## Annexe — Récap budget Versions à produire

> Demande explicite David, avril 2026. À traiter dans la même session ou en parallèle.

Avant ou pendant les travaux DSP, produire un récap clair de ce que coûte Versions au mois (côté David) :

- **Abonnements** : Claude API (Anthropic), Gemini API (Google), Fadr API, Vercel (front), Supabase (DB + storage)
- **Stockage** : combien sont stockés sur Supabase Storage (audio + traductions cache + analyses), au tarif actuel et à la projection 100 / 1k / 10k utilisateurs
- **Coût par analyse** : décomposition exacte (Fadr stems + Gemini écoute + Claude fiche + DSP custom = 0 $) en fonction de la durée du morceau
- **Seuils de bascule** : à partir de combien d'analyses/mois le coût Fadr passe au tier supérieur, idem Anthropic/Gemini
- **Marge requise** par analyse pour ne pas être déficitaire selon le pricing Free/Premium envisagé

Objectif : David doit savoir à quel prix par analyse un utilisateur Free vs Premium devient rentable, pour calibrer les quotas Free et le prix Premium sans être de sa poche.

---

## Référence rapide : où chercher dans le code

- Pipeline d'analyse : `decode-api/api/listen.js`, `decode-api/analyze.js`
- Prompts LLM : `decode-api/lib/claude.js` (fiche), `decode-api/lib/gemini.js` (écoute)
- Données Fadr : `decode-api/lib/fadr.js` — voir `extractFadrData()`
- Schéma Supabase : `supabase/migrations/` côté `versions-app/`
- Affichage fiche : `src/screens/FicheScreen.jsx` + `src/screens/PublicFicheScreen.jsx` + `src/screens/SampleFicheScreen.jsx`
- Landing : `src/screens/LandingScreen.jsx` + `src/constants/strings.js` (namespace `landing`)
