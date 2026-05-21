# Roadmap post-snapshot AubioMix — sprint démarrant 2026-05-19
*David Berdugo · décision actée 18 mai 2026 en fin de session Cowork*

---

## Contexte

AubioMix devient un standard de marché (revendique ~3000 analyses). Le snapshot comparatif du 18 mai (`docs/aubiomix_snapshot_2026-05-18.md`) a montré qu'ils ont fait un bond sur la présentation et qu'on est probablement **trop indulgents sur le scoring**. Cette roadmap consolide les leviers retenus, par ordre de priorité.

**Position adoptée** : on s'inspire sans copier, on cesse de passer pour les gentils mignons. Sévérité juste et motivante, objectifs mesurables et accessibles.

---

## Avancement au 2026-05-21

### Livré
- **Bloc A.2 — Caps mécaniques** : `versions-api/lib/scoring/mechanicalCaps.js` déployé le 20 mai avec les 5 caps de la roadmap (stéréo quasi-mono, LRA serré mix, clipping mix, voix masquée, sibilantes excessives). Cf. validation panel : maquette 72, Polaroids 79, Chic Le Freak 90.
- **Bloc A.3 — Anchors mix/master + clause CONTEXTE DEMO/MAQUETTE** : recettes Master en checks pré-master côté mix, recettes streaming standards côté master ; clause maquette force bande 65-78 + globalScore ≤ 72.
- **Bloc B.3 — Score Band social Option A** : 6 paliers (référence/hit/pro/démo avancée/en développement/début de parcours) dans `ReleaseReadinessBanner`, ladder horizontale sous le verdict avec marqueur "tu es ici", anim flèche fluide qui remonte du palier 6 au palier actif (easeOutQuad, wrap-around entre lignes sur mobile).
- **Bloc C.2 — Question "masterisé ?"** : `AddModal` passe en Oui/Non/Auto-detect, mapping rétro-compat `yes`→master, `no`/`auto`→mix. Backend pondère LUFS à 0.5 en mix.
- **Persistance backend `lib/persistAnalysis.js`** + 4 paliers de protection des crédits (bg poll relais, cron orphan refund, modal+RPC refund_my_failed_analysis, persist côté serveur). Élimine la cause racine du bug "crédit débité sans fiche persistée".

### Incidents traités le 2026-05-21
- **`ReferenceError` persistAnalysisResult** : commit 9427693 référençait `version/projectId/vocalType/copyrightAcknowledgedAt` dans le call site persist sans les avoir destructurés de `ctx`. Throw qui cassait TOUTES les analyses entre 10:05 UTC et le hotfix. Heureusement seul David testait — 0 utilisateur prod touché. Fix : ajout au destructuring de `runDiagnosticPhase` + propagation dans les 2 ctx en `/start`.
- **Garde-fou LUFS aberrant** : `parseEbur128` sanitize désormais à [-40, +1] LUFS. Cas serrurerie.rayan (TikTok "Arts Márcio") : ffmpeg a sorti -70 LUFS sur un latin pop/rap → score 52 → plainte publique. Crédité +3 manual_admin + sa version/cache supprimés pour repartir propre.
- **Patch IPv6 `rateLimit.js`** : `keyByUser` utilise `ipKeyGenerator(req)` (express-rate-limit v8). Nettoie 8 ValidationError au boot Railway et ferme la vulnérabilité IPv6.

### Nouveau chantier prioritaire — Bloc D : enrichir le `genreBlock`
**Découverte empirique 2026-05-21** : test direct sur *Die With a Smile* (Bruno Mars × Lady Gaga) avec et sans `declared_genre="pop ballad rétro"`, uploadType=master :
- Sans genre déclaré : score **78**, 11 items
- Avec genre déclaré : score **78**, 10/11 items identiques (un seul item de voix qui passe de 86 à 87)

→ **Le levier "genre déclaré" tel qu'implémenté aujourd'hui est virtuellement inopérant**. Le prompt actuel dit à Claude "adapte tes recettes en conséquence" + 4 exemples vagues (dub-techno, folk, electro, jazz). Claude continue à appliquer sa grille mainstream et à pénaliser une basse chaude, un kick rond, une snare retenue — qui sont pourtant SIGNATURE de la pop ballad rétro / soul Motown / R&B vintage.

**Comparaison probante avec Chic Le Freak** (funk disco, score 90) sur les mêmes catégories techniques :
- Voix, master dynamique, image stéréo, True Peak, compat mono → quasi équivalents (différentiel 0-3 points)
- **Basses & kick + drums** → Chic 94-95 ("fondation serrée et mélodique", "groove de référence") vs Die 66-68 ("basse envahissante", "kick manque définition"). Même geste de production, lecture inverse selon le genre détecté par Gemini.

**Action D.1 — Enrichir `genreBlock` dans `versions-api/lib/claude.js` avec règles explicites de reconnaissance du craft par esthétique.** Remplacer le "adapte tes recettes" mou par des règles formelles type :
> *Si genre ∈ {pop ballad rétro, soul Motown, R&B vintage, pop rétro 70s/80s, retro-soul} : la basse chaude posée dans le bas-médium est CRAFT, ne pas la décrire comme "envahissante" ou "boueuse". Caisse claire vintage en retrait avec corps tendu = signature, ne pas exiger un kick punchy moderne. Score baseline ≥ 85 sur drums/basse si le mix est aligné sur le genre déclaré.*

Couvrir 10-12 esthétiques en première passe : pop rétro, soul Motown, R&B vintage, hip-hop boom-bap, indie rock garage, métal moderne, country pop, latin reggaeton, electronica ambient, K-pop. Effort ~1h de rédaction.

**Action D.2 — Améliorer le classifieur Gemini en amont** (à mesurer après D.1). *Die With a Smile* est classé "indie folk pop" alors que c'est une pop ballad rétro orchestrale — la voix proche + la guitare acoustique trompent Gemini. Soit on contraint Gemini sur un vocabulaire fini, soit on fait une 2è passe "es-tu sûr ?" sur les titres mainstream. À budgéter après D.1.

---

## Bloc A — Calibration du scoring (priorité 1)

### Pourquoi
Sur Comme un rêve mix 8, AubioMix sort 57/100 quand Versions sort 83/100. La vérité se situe probablement entre les deux. L'objectif : un scoring qui ne flatte pas mais qui ne décourage pas non plus.

### A.1 — Benchmark sur 15 titres (David)
Constituer un panel étalonné :
- **3-4 démos vraiment amateures** (home recordings bricolés, prises non corrigées, mix au casque)
- **4-5 mix indé propres** (niveau attendu "Versions Highly Skilled")
- **4-5 mix pros sortis commercialement** (niveau attendu "Hit record mixers")
- **2-3 hits commerciaux mondiaux** (niveau attendu "World-class / Exceptionnel")

Passer chacun dans Versions, noter les scores. Si tous les amateurs tombent à 70+ et tous les hits à 88+, l'échelle est trop tassée — on a une preuve factuelle pour resserrer.

### A.2 — Caps sur défauts spécifiques (Claude)
Plafonner le score quand un red flag mesurable est détecté, même si le reste est bon. Liste de départ à valider sur le benchmark :

| Red flag | Mesure | Cap proposé |
|---|---|---|
| Stéréo quasi-mono | corrélation > 0.95 OU side < 8 % | 75 |
| Clipping numérique | samples écrêtés détectés | 70 |
| Voix masquée par bus instrument | delta < 5 dB sur fréquence centrale voix | 75 |
| Sur-compression hors contexte master | LRA < 4 LU sur un mix non masterisé | 70 |
| Sibilantes excessives | > −40 dB sur 5-8 kHz | 80 |

Ces caps protègent contre le scoring "linéaire moyenné" qui dilue les défauts graves dans la moyenne.

### A.3 — Revoir les coefficients par dimension
Vérifier que les dimensions critiques (Mix Balance, Stereo Width, Dynamique) pèsent assez. Sur le code actuel (`versions-api/lib/claude.js`, constantes `WEIGHTS`), recalibrer en s'appuyant sur le retour du benchmark.

---

## Bloc B — Présentation du rapport (priorité 2)

### B.1 — Score breakdown technique
Ajouter dans la verdict row un mini-encart avec **4-6 barres techniques** : Tonal / Stéréo / Dynamique / Master / Bruit. Lecture en 3 secondes, à côté du scoring par élément musical actuel (qui reste). Inspirée d'AubioMix mais pas copiée — on garde notre logique "diagnostic par élément" comme dominante.

### B.2 — Cards "réglages compression" structurées
Pour chaque reco de compression dans le rapport, extraire dans une **mini-carte** : ATK / REL / Ratio / GR / Type (Opto / VCA / FET). Réutilisable côté DAW. À placer à la fin de chaque section dynamique (sections DRUMS / BASSES & KICK / VOIX si compression évoquée).

### B.3 — Score Band social
À côté du verdict "Prêt pour le mastering", afficher un **palier qui situe socialement**. Trois options d'appellations à brainstormer demain :

**Option A — Sobre et factuel**
- 90-100 : Niveau référence
- 80-89 : Niveau hit
- 65-79 : Niveau pro
- 50-64 : Niveau démo avancé
- 30-49 : En développement
- 0-29 : Début de parcours

**Option B — Plus poétique (style Versions)**
- 90-100 : Référence
- 80-89 : Singulier
- 65-79 : Abouti
- 50-64 : Maturé
- 30-49 : Esquissé
- 0-29 : Premiers pas

**Option C — Factuel niveau mixeur**
- 90-100 : Niveau commercial mondial
- 80-89 : Niveau professionnel
- 65-79 : Niveau pro émergent
- 50-64 : Niveau amateur avancé
- 30-49 : Niveau apprenti
- 0-29 : Débutant

À trancher sans copier le wording AubioMix ("Amateur engineers", "Hit record mix engineers" — leur ton très anglo-saxon).

---

## Bloc C — UX upload (priorité 3)

### C.1 — Ajouter Track Type "Live"
Au toggle de l'AddModal (déjà Vocal Mix / Instrumental Mix), ajouter **Live Recording**. Calibrer les recettes côté analyse : un live tolère plus de dynamique naturelle, moins d'exigence sur la séparation mais plus sur l'équilibre instrumental d'ensemble.

### C.2 — Reformuler la question "masterisé ?"
Au lieu de "Le mix ou le master ?" (qui crée une confusion sémantique entre fichier et workflow), demander simplement : **"Ce mix a-t-il été masterisé ?"** — on parle toujours de "mix", la mastered-ness devient un attribut booléen.

Garder l'auto-detect en fallback (déjà actif quand le champ n'est pas rempli). Pas de friction supplémentaire — ne pas rendre obligatoire.

### C.3 — Upload pill sticky (à valider)
Encart toujours visible sur la fiche pour inviter à uploader la prochaine version, façon AubioMix "Ready to improve?". À décider : on ajoute, ou la chat pill suffit déjà ?

---

## Reporté

- **Reference Mix payant** — pas pour l'instant. Upsell intéressant mais pas prioritaire.
- **Peer comparison par genre** — attendre une base d'historique suffisante (centaines de mix au minimum) avant de proposer des statistiques crédibles.
- **Persona qui signe le rapport** — à reconsidérer plus tard si on veut un trust signal humain.
- **Frequency Balance Map** — spec figée dans `docs/frequency_balance_map_spec.md`. Implémentation à planifier après calibration scoring (les seuils de la map dépendent du scoring calibré).
- **Mode B et C de simulation** (toggle global, roadmap interactive) — backlog du frequency map, à reconsidérer après le mode A en prod.

---

## Séquence concrète

**Semaine du 19 mai — fait**
- A.1 panel benchmark (David, le 20 mai)
- A.2 caps mécaniques + A.3 anchors mix/master + clause maquette (déployés 20 mai)
- B.3 Score Band social Option A + ladder + anim flèche (déployé 21 mai)
- C.2 question "masterisé ?" 3 options (déployé 21 mai)
- Hotfix ReferenceError persistAnalysis + garde-fou LUFS aberrant + patch IPv6 rateLimit (21 mai)

**Prochain sprint — à attaquer**
- **D.1 enrichir `genreBlock`** (priorité 1 — c'est le levier qui doit faire bouger les scores rétro/pop ballad sans dénaturer la grille moderne)
- B.1 score breakdown technique (4-6 barres Tonal/Stéréo/Dynamique/Master/Bruit)
- B.2 cards "réglages compression" structurées

**Sprint suivant**
- D.2 amélioration classifieur Gemini (à mesurer après D.1)
- C.1 Track Type "Live" — toggle actuel est Chanté / Instrumental, à étendre avec une 3è option Live. Calibrer recettes Claude : tolérance dynamique naturelle, moins d'exigence séparation, plus sur équilibre d'ensemble.
- C.3 upload pill sticky (à valider — ou la chat pill suffit ?)
- Frequency Balance Map mode A (cf. `docs/frequency_balance_map_spec.md`)

### Dette honnêteté UI à traiter

- **Auto-detect mix/master non implémenté** — le hint AddModal annonce *"Versions détermine le statut à partir des mesures (loudness, dynamique)"* mais le mapping front (cf. `src/components/AddModal.jsx`) bascule silencieusement Auto → `mix`. Aucune heuristique côté backend. À trancher : (a) reformuler le hint pour être honnête (5 min) ou (b) coder l'heuristique réelle (LUFS ≥ -12 + LRA < 8 LU + True Peak proche -1 dBTP → probable master). On dispose déjà des mesures DSP nécessaires (`dspMetrics.lufs/lra/truePeak`), donc (b) est faisable ~1-2 h.

---

## Liens

- `docs/aubiomix_snapshot_2026-05-18.md` — snapshot comparatif qui a motivé cette roadmap
- `docs/audit_aubiomix.md` — audit fond du 26 avril
- `docs/AUBIOMIX_PLAN.md` — plan post-audit tiers 1-4 (clos)
- `docs/frequency_balance_map_spec.md` — spec de la viz frequency map (parallèle, mode A retenu)
