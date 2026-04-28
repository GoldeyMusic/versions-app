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

- [x] **1.1bis — Brancher Fadr dans le pipeline `analyze.js`**
  Dans `decode-api/api/analyze.js`, importer `{ analyzeFile, extractFadrData }` de `../lib/fadr`. Lancer `analyzeFile(fileBuffer, …)` **en parallèle** de `analyzeListening` (Promise.all ou pattern parallèle similaire au transcodage) après réception du fichier. À l'issue, appeler `extractFadrData(task)` et stocker le résultat dans le `ctx`/job sous une clé `fadrMetrics`. Propager `fadrMetrics` jusqu'à `generateFiche` (nouvelle signature). Gérer les erreurs Fadr en mode dégradé : si Fadr échoue ou timeout, on continue sans mesures (le pipeline ne doit pas casser).

  **Implémenté (2026-04-27)** :
  - `api/analyze.js` : import de `fadr.js`, lancement de `fadrAnalyzeFile` dès réception du fichier (en parallèle de Gemini, RAG, perception). `fadrPromise` propagé via le `ctx` jusqu'à la Phase B.
  - `runDiagnosticPhase` : `await Promise.race([fadrPromise, timeout 90s])`. Mode dégradé `fadrMetrics=null` si Fadr KO ou timeout. Stage intermédiaire `fadr_done` (pct 75) pour info front.
  - `fadrMetrics` exposé sur le job final (`status: 'complete'`) → consommable côté front (1.4) et persistable (1.3).
  - `lib/claude.js` : signature `generateFiche(...)` étendue avec `fadrMetrics` en dernier paramètre **optionnel**. Pour l'instant la valeur est juste reçue et loggée (`[claude] fadr metrics available — bpm:… key:… lufs:…`). L'injection effective dans le `systemPrompt` est l'objet de **1.2**.
  - Sanity check `node --check` OK sur les deux fichiers.
  - ⚠️ Variable d'env `FADR_API_KEY` doit être présente dans l'environnement Vercel/Railway/host de `decode-api` (déjà utilisée par `lib/fadr.js`, à vérifier côté secrets si elle n'avait jamais servi).

- [x] **1.2 — Reformuler le prompt Claude principal**
  Dans `decode-api/lib/claude.js`, retirer la consigne *"Tu n'as AUCUNE MESURE"*. Remplacer par un bloc en tête de prompt :
  ```
  MESURES OBJECTIVES (mesurées sur ce morceau, à citer si pertinent) :
  - BPM : 124 (Fadr)
  - Tonalité : Am (Fadr)
  - Loudness intégré : -8.4 LUFS (Fadr, conforme ITU-R BS.1770)
  Tu peux et dois citer ces valeurs quand elles éclairent un item. Tu ne dois pas inventer d'autres mesures.
  ```

  **Implémenté (2026-04-27)** : `dspBlock` dynamique injecté dans le `systemPrompt` quand `fadrMetrics` non-null. La règle de fer "Tu n'as AUCUNE MESURE" est rendue conditionnelle (gardée en mode dégradé Fadr KO, remplacée sinon). Claude reçoit aussi une instruction d'exploitation : citer textuellement, calibrer le diagnostic MASTER & LOUDNESS contre la cible streaming (-10/-12 LUFS), proposer des delays calculés sur le BPM (`60000 / bpm / 2 = ms pour 1/8`). Garde-fous : interdit d'inventer d'autres mesures (crest factor, fréquences précises). Rappel concis dupliqué en queue de user prompt (recency bias).

- [x] **1.3 — Persister les mesures côté Supabase**
  Ajouter une colonne `dsp_metrics jsonb` sur la table `versions` (migration `010_dsp_metrics.sql`). Y stocker `{bpm, key, lufs, source: 'fadr'}` à la fin de l'analyse pour pouvoir les afficher sans re-appeler Fadr.

  **Implémenté (2026-04-27) — adapté** : pas besoin de migration `010`, les colonnes `versions.bpm/key/lufs` (text) **existent déjà** depuis l'origine, simplement jamais peuplées. `src/lib/storage.js` `saveAnalysis()` extrait `analysisResult.fadrMetrics` et populate ces colonnes au save (insert + update). Si Fadr KO/timeout → on n'écrit rien (pas d'écrasement par null). Donnée disponible côté front sans parser le JSON `analysis_result`.

- [x] **1.4 — Affichage front (topbar fiche)**
  Petit chip mono dans la topbar de `FicheScreen.jsx` : `124 BPM · Am · -8.4 LUFS`. Style aligné sur les autres chips de la fiche.

  **Implémenté (2026-04-27)** : composant `<DspBadge />` dans `FicheScreen.jsx`, helper `pickDspMetrics()` qui lit en priorité `analysisResult.fadrMetrics` (frais post-analyse) sinon `version.bpm/key/lufs` (DB). Helper `formatDspKey()` normalise la notation Fadr (`G:maj` → `G maj`). Inséré dans la topbar desktop (entre `meta` et `actions`) et mobile (sous le titre, avant les actions). Style mono, pill, cohérent avec les autres chips.

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

- [x] **2.1 — Module `decode-api/lib/dsp.js`** *(LUFS/LRA/truePeak en place ; le reste pour 2.6)*
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

  **Implémenté (2026-04-27, partiel)** : `lib/dsp.js` créé avec `measureMaster(buffer)` qui retourne `{ lufs, lra, truePeak }` via ffmpeg ebur128 (bundle `@ffmpeg-installer/ffmpeg`, conforme ITU-R BS.1770). Spawn ffmpeg sur stdin du buffer, parse le block "Summary" stderr, mode dégradé (null) si timeout/erreur. Ce sont les 3 mesures les plus prioritaires pour la promesse landing. Le reste (crest factor, dcOffset, clipping, spectralBands 6 bandes) est ajouté en 2.6 si besoin — ffmpeg seul ne les calcule pas, il faudra `meyda` ou un calcul maison sur les samples PCM.

- [x] **2.2 — Brancher dans le pipeline post-Fadr**
  Dans `analyze.js` ou équivalent, après réception du fichier audio, appeler `dsp.measureMaster(buffer)` en parallèle de Fadr. Persister dans `dsp_metrics` (Phase 1.3).

  **Implémenté** : `dspPromise = dspMeasureMaster(fileBuffer)` lancé en parallèle de Fadr et Gemini dès réception du fichier. `Promise.all([awaitWithTimeout(fadr), awaitWithTimeout(dsp)])` dans `runDiagnosticPhase` — les deux mesures sont attendues en parallèle. Fusion fadr+dsp dans `mergedMetrics` passé à `generateFiche`. Pas de migration `dsp_metrics` jsonb pour l'instant, on persiste juste `lufs` dans la colonne text existante (suffit pour le chip + Claude). On migrera vers jsonb quand on aura plus de mesures (2.6).

- [x] **2.3 — Enrichir le prompt Claude**
  Ajouter un bloc :
  ```
  MESURES DSP MASTER :
  - Facteur de crête : 12.4 dB (sain : 10-14 dB)
  - Plage dynamique (LRA) : 6.2 LU
  - True peak : -0.8 dBTP
  - Distribution spectrale : sub 8% / bass 22% / low-mid 18% / mid 15% / hi-mid 22% / highs 15%
  - Clipping : aucun
  ```

  **Implémenté** : `dspBlock` dans `claude.js` enrichi avec LRA et truePeak. Verdicts pré-calculés côté Node (LUFS vs cible streaming, LRA vs plage dynamique pop/jazz/cinematic, truePeak vs cible -1 dBTP) injectés dans le prompt pour calibrer le diagnostic master. Claude doit citer textuellement les valeurs et calibrer sa recette en MASTER & LOUDNESS.

- [ ] **2.4 — Affichage front DSP master**
  Décidé en session 2026-04-27 : on **abandonne** l'idée d'un panneau "Mesures DSP" séparé (trop technique, redondant avec le chip topbar). À la place, on intègre les visuels directement dans la section MASTER & LOUDNESS du diagnostic. Voir Phase 5 ci-dessous (visuels) pour le détail.

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

## Roadmap session 2026-04-28 (Phase 3 stems + visuels fiche)

Décidé en session 2026-04-27. À enchaîner dans cet ordre. Estimation totale : 1 grosse journée + 1 demi-journée si on va au bout.

### A — Visuels données déjà disponibles (LUFS / LRA / TruePeak / scores)

Couleurs : `var(--amber)` pour cible, `var(--muted)` pour neutre, rouge subtle uniquement pour critique. **Pas** de barres mint→rouge style AubioMix. Animations fade-in 150ms, halos `0 0 12px rgba(245,176,86,0.04)` max.

- [x] **A.1 — Loudness meter (section MASTER & LOUDNESS)**
  Barre fine ~6px pleine largeur, 4 zones graduées :
  `< -16 LUFS` Trop sage (gris) · `-16 à -10` Streaming (ambre clair) · `-10 à -7` Compétitif (ambre fort) · `> -7` Surcomprimé (rouge subtle).
  Curseur trait vertical ambre + valeur mono au-dessus. Affiché si LUFS dispo. *~3h*

  **Implémenté (2026-04-28)** : composant `LoudnessMeter` + `pickDspBlockMetrics` dans `FicheScreen.jsx`, injecté en tête du `diag-cat-body` de la catégorie MASTER & LOUDNESS (test sur `el.cat` lowercase contient `master`/`loudness`). Source = `analysisResult.dspMetrics.lufs` (ffmpeg ebur128) avec fallback `fadrMetrics.lufs`. Ticks `-25/-16/-10/-7/-3` mono petits sous la barre, verdict mono caps coloré selon la zone. Curseur passe en rouge subtle uniquement zone critique (>-7), sinon ambre.

- [x] **A.2 — Mini-cards LRA + True Peak (section MASTER & LOUDNESS)**
  Deux cards alignées row sous le Loudness meter. Par card : kicker mono caps ("PLAGE DYNAMIQUE" / "TRUE PEAK"), valeur grosse mono ambre, mini-barre horizontale fine 3-4 zones, verdict court ("Confortable" / "Risque clipping" / "Cible OK"). Bordure `rgba(255,255,255,0.08)`. *~2h*

  **Implémenté (2026-04-28)** : composant `DspMiniCard` générique (kicker, value mono ambre, mini-barre 4 zones, curseur ambre, verdict mono caps). LRA seuils `<4 / 4-7 / 7-12 / >12 LU` (Écrasée/Standard/Confortable/Large). TruePeak seuils `<-1 / -1→0 / >0 dBTP` (Sous cible/Risque/Clipping). Wrapper `DspMasterBlock` rend Loudness + mini-row dans un même bloc encadré, animation fade-in 150ms. Stack vertical sur mobile (`@max-width: 600px`).

- [x] **A.3 — Radar 6 catégories (en tête de fiche, à droite de la pochette)**
  Hexagone constellation (pas de polygone rempli style AubioMix) : 6 axes (voix/instruments/basses/drums/spatial/master), lignes ambre 1px, points ambre sur chaque axe à la position du score moyen de la catégorie. Échelle 0-100 mono petite. Au hover : axe survolé éclairé, valeur affichée. Cohérent avec la grammaire "constellation" de la landing. *~3h*

  **Implémenté (2026-04-28)** : composant `MixRadar` SVG `220x220 viewBox`, **remplace** `MixIndicators` dans `.rv-top` (mêmes data via `computeMixIndicators`, viz plus pure). 4 hexagones guides très subtils (25/50/75/100), lignes axes 1px, polygone constellation stroke-only ambre (pas de fill). Points colorés selon score (rouge<50 / ambre<75 / mint≥75) avec drop-shadow. Hover sur point : axe éclairé + carte détail HTML positionnée sous le radar (label, score/100, what, how) — préserve la valeur pédagogique des anciens tooltips MiTile. Échelle `0–100` au centre devient la valeur ambre au hover. Layout flex:1 dans `.rv-top` (stack vertical hérité <1100px via media existante). MiTile/MixIndicators conservés en code (tree-shake) pour rollback facile.

### B — Phase 3 (stems Fadr) — implémentation

- [x] **B.1 — Téléchargement des stems Fadr**
  Dans `decode-api/lib/fadr.js`, fonction `downloadStems(asset)` qui appelle Fadr pour récupérer les URLs signées des 5 stems et les fetch en buffers RAM. Pas de stockage côté nous (jeté après mesure). Mode dégradé si un stem échoue. *~3h*

  **Implémenté (2026-04-28, en local — push avec B.2-B.6 conformément au plan)** : `downloadStems(asset, opts)` dans `decode-api/lib/fadr.js`. Téléchargement parallèle (`Promise.all`) avec timeout par stem (10s pour la signed URL, 30s pour l'audio). Helper `fetchSignedUrl(stem)` qui essaie 3 sources dans l'ordre : `stem.audioUrl`/`stem.url` (fallback rapide si Fadr embarque l'URL signée sur l'asset complet), puis `GET /assets/download/{stemId}`, puis `POST /assets/download` body `{_id}`. Mode dégradé total : un stem KO → on l'oublie, le reste continue. Helper `classifyStem(name)` mappe le nom Fadr ("vocals"/"Drums"/"bass-stem") vers nos types canoniques `vocal`/`drums`/`bass`/`other` pour B.2. Retourne `[{name, stemType, buffer, sizeBytes}, ...]` ou `null` si tous KO. Logs détaillés (taille KB + temps par stem).

- [x] **B.2 — Mesures DSP par stem**
  Étendre `decode-api/lib/dsp.js` avec `measureStem(buffer, label)` qui retourne `{ lufs, peak, energyBand_5_8kHz, energyBand_1_3kHz }` via ffmpeg ebur128 + filter `astats` ou calcul maison. *~2h*

  **Implémenté (2026-04-28, en local)** : `measureStem(buffer, label)` lance 3 ffmpeg en parallèle via `Promise.all` : `measureMaster` (lufs+truePeak), `measureBandEnergy(buffer, 6500, 3000)` pour les sibilantes (5-8 kHz), `measureBandEnergy(buffer, 2000, 2000)` pour la présence (1-3 kHz). Le band energy passe par `bandpass=f=...:width_type=h:w=...,volumedetect` puis parse `mean_volume` (RMS). Mode dégradé champ par champ. Renvoie `{lufs, truePeak, peak, energyBand_5_8kHz, energyBand_1_3kHz}`.

- [x] **B.3 — Mesures image stéréo (sur le master, pas sur les stems)**
  `measureStereoField(buffer)` via ffmpeg `astats` qui donne corrélation L/R + Mid/Side ratio + balance L/R. Ajouter `mono_compat` calculé en re-mesurant le buffer mixed-down en mono. *~3h*

  **Implémenté (2026-04-28, en local)** : `measureStereoField(buffer, stereoLufs?)` orchestre 2 ffmpeg parallèles : `measureStereoStats` (astats `length=0` pour RMS par canal + Cross corr.) et `measureMonoLufs` (filter `pan=mono|c0=0.5*c0+0.5*c1,ebur128=peak=true`). `monoCompat = LUFS_stereo − LUFS_mono`. `midSideRatio` estimé à partir de la corrélation : `(1−corr)/2` (approximation valable quand L et R ont une énergie comparable). `balanceLR = RMS_L − RMS_R` en dB. Optimisation : si `stereoLufs` est passé en argument (déjà mesuré par dspPromise), on évite un troisième spawn ebur128.

- [x] **B.4 — Pipeline analyze.js + propagation jusqu'à Claude**
  Lancer `downloadStems` + `measureStem` x5 + `measureStereoField` en parallèle de l'existant. Mode dégradé sur chaque mesure. Fusionner dans `mergedMetrics.stems` et `mergedMetrics.stereo` passés au prompt Claude. *~2h*

  **Implémenté (2026-04-28, en local)** : ajout dans `api/analyze.js` :
  - `stemsPromise` chaîné sur `fadrPromise` : récupère `data.stems` (depuis extractFadrData) → `fadrDownloadStems({ stems })` → `Promise.all` de `dspMeasureStem(buffer, stemType)` sur chaque stem téléchargé. Buffers jetés après mesure (juste `{name, stemType, sizeBytes, ...measure}` retourné).
  - `stereoPromise` chaîné sur `dspPromise` : passe le LUFS stéréo déjà mesuré pour éviter un spawn ebur128 redondant.
  - Timeouts dédiés `STEMS_TIMEOUT_MS=90s`, `STEREO_TIMEOUT_MS=60s`. Mode dégradé null-able sur chaque axe.
  - Propagation via `ctx.stemsPromise/stereoPromise` pour Phase B.
  - `runDiagnosticPhase` await les 4 mesures en parallèle (`fadr`/`dsp`/`stems`/`stereo`).
  - `mergedMetrics.stemsMeasured` et `mergedMetrics.stereo` passés à `generateFiche`.
  - Job exposé : `stemsMetrics` + `stereoMetrics` consultables côté front.

- [x] **B.5 — Prompt Claude (lib/claude.js)**
  Enrichir `dspBlock` avec un sous-bloc STEMS et un sous-bloc STEREO. Ajouter des verdicts pré-calculés (voix bien posée, sibilantes objectivement présentes, mono-compat OK, etc.). Aligner les recettes "how" pour qu'elles citent les valeurs voix vs instru quand pertinent. *~2h*

  **Implémenté (2026-04-28, en local)** : dans `generateFiche` :
  - Calcul `instruLufs` = moyenne énergétique des stems non-voix (somme linéaire puis retour en dB), pour avoir un repère face au LUFS voix.
  - `voiceVsInstruDelta = vocalLufs − instruLufs`. Verdict pré-calculé : `<−3 LU` voix en retrait + recette `"remonter de X dB"`, `>+3` voix proéminente, sinon "voix bien posée (cible −3/+3 LU)".
  - Verdict sibilantes basé sur `vocalStem.energyBand_5_8kHz` : `>−25 dB` = "sibilantes appuyées, de-esser conseillé (Sibilance ratio 4:1, threshold −28 dB)", `>−30` = "présentes mais maitrisées", sinon "douces".
  - Verdicts stéréo : corrélation (étroit/équilibré/large/risque phase), monoCompat (≤1 excellent, ≤2 OK avec perte sensible, >2 dangereux), balanceLR (centré/léger pencheche/désequilibre marqué).
  - Sous-blocs `STEMS` et `STEREO` injectés dans `dspBlock` quand dispos.
  - Instruction d'exploitation enrichie : "En VOIX, calibre tes items sur delta voix/instru et sibilantes mesurées" / "En SPATIAL, calibre sur correlation L/R et mono compat".
  - Rappel recency-bias en fin de user-prompt étendu pour citer textuellement delta voix/instru, sibilantes, corrélation, mono compat.

- [x] **B.6 — Persistence DB**
  Migration `010_dsp_metrics.sql` : ajouter colonne `versions.dsp_stems jsonb` et `versions.dsp_stereo jsonb`. Storage via `saveAnalysis` dans `storage.js`. *~1h*

  **Implémenté (2026-04-28, en local — migration à appliquer manuellement dans Supabase Studio avant le push backend)** :
  - `supabase/migrations/010_dsp_metrics.sql` : `ALTER TABLE versions ADD COLUMN IF NOT EXISTS dsp_stems jsonb, dsp_stereo jsonb` (idempotent). Pas d'index (lecture par version_id seulement, déjà couvert par PK).
  - `LoadingScreen.jsx` : 3 callsites `onDone(...)` étendus avec `stemsMetrics: job.stemsMetrics, stereoMetrics: job.stereoMetrics` pour propager jusqu'à `analysisResult`.
  - `lib/storage.js` `saveAnalysis()` : extrait `analysisResult.stemsMetrics`/`stereoMetrics`, les écrit dans `dsp_stems`/`dsp_stereo` UNIQUEMENT si dispo (pas d'écrasement par null pour préserver les mesures précédentes en cas de Phase 3 KO).

### C — Visuels données stems / stéréo (suite des visuels A après Phase 3)

- [x] **C.1 — Voix vs instru (section VOIX du diagnostic)**
  Deux jauges horizontales empilées style "stem racks" : barre voix au-dessus, barre instru en-dessous, mêmes échelles, valeurs LUFS mono à droite. Mini-badge ambre "+2.5 LU" entre les deux pour le delta. Verdict mono : si delta dans cible (-3 à +3 LU) → "Voix bien posée ✓" mint, sinon → "À retravailler" ambre/rouge. **Important pour les chanteurs.** *~3h*

  **Implémenté (2026-04-28)** : composant `VoiceVsInstruBlock` injecté en tête du `diag-cat-body` de la catégorie VOIX (sauf si `voiceLabelOverride` actif — pas de visuel sur un titre `instrumental_pending`). Lecture `analysisResult.stemsMetrics`, calcule `instruLufs` (moyenne énergétique linéaire des stems drums/bass/other, cohérent avec claude.js B.5), `delta = vocalLufs - instruLufs`. Echelle alignée sur LoudnessMeter (-25 à -3 LUFS). Bar fill gradient ambre + curseur 2px ambre + valeur mono à droite. Badge delta centré entre les deux jauges, couleur cible/low/critical selon zone. Verdict mono caps à droite : "Voix bien posée ✓" si dans -3/+3 LU, sinon "À retravailler — voix en retrait/proéminente". Mode dégradé : retourne null si pas de stem voix mesuré ou pas de stems instru.

- [x] **C.2 — Stereo field map (section SPATIAL & REVERB)**
  Cercle dashed L/R minimal (pas de rosace AubioMix), point ambre = position W/D du mix. Width et Depth affichés en mono à côté ("Width 24% · Depth 60%"). Sobre. *~3h*

  **Implémenté (2026-04-28)** : composant `StereoFieldBlock` injecté en tête du `diag-cat-body` de la catégorie SPATIAL & REVERB. SVG cercle dashed rgba(255,255,255,0.12), cross axes faible, labels L/R mono caps muted aux bords. Position du point ambre dans le cercle :
  - X = `balanceLR` mappé sur ±3 dB (clamp ±1)
  - Y = `(2 × midSideRatio − 1)` (top = mix très large/sideful, bottom = focused)
  - Norme clampée à 0.95 du rayon pour garder une marge visuelle.

  Trois métriques en mono à droite (1 colonne desktop, row wrap mobile) :
  - **WIDTH** = `midSideRatio × 100 %`
  - **MONO COMPAT** = `monoCompat` LU avec verdict coloré ("mono OK" ≤1, "mono limite" ≤2, "mono dangereux" >2)
  - **CORR L/R** = corrélation 2 décimales

  Note : la spec initiale parlait de "Depth %" mais on n'a pas de mesure objective de profondeur (réverbération wetness). On expose **Mono Compat** à la place — mesure réelle, pertinente pour les chanteurs et la lecture en mono téléphone/BT. Plus honnête que de proxy une "depth" arbitraire.

### Notes pratiques pour la session

- **Pousse régulièrement** (après chaque tâche A.x ou B.x complète) pour pouvoir tester en prod sans accumuler.
- **Ordre conseillé** : A.1 → A.2 → push & test → A.3 → push & test → B.1-B.6 (un seul push à la fin de la phase 3 backend) → migration DB → push frontend (saveAnalysis + lecture des nouvelles données) → C.1 → push & test → C.2 → push final.
- **Total estimé** : 27h (~3 jours dev cumulés). Sur une session focus, on fait A entièrement (8h) + B entièrement (13h). C peut être reporté à J+2.
- **Tests** : lancer une analyse fraîche après chaque push pour valider que rien ne casse. Garder Lacher prise comme morceau de référence (on connaît ses valeurs).

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
