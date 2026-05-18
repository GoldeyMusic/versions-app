# Roadmap post-snapshot AubioMix — sprint démarrant 2026-05-19
*David Berdugo · décision actée 18 mai 2026 en fin de session Cowork*

---

## Contexte

AubioMix devient un standard de marché (revendique ~3000 analyses). Le snapshot comparatif du 18 mai (`docs/aubiomix_snapshot_2026-05-18.md`) a montré qu'ils ont fait un bond sur la présentation et qu'on est probablement **trop indulgents sur le scoring**. Cette roadmap consolide les leviers retenus, par ordre de priorité.

**Position adoptée** : on s'inspire sans copier, on cesse de passer pour les gentils mignons. Sévérité juste et motivante, objectifs mesurables et accessibles.

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

**Mardi 19 mai**
- Matin : David constitue le panel de 15 titres et les passe dans Versions, note les scores obtenus → A.1
- Après-midi : analyse des résultats, identifier les caps à introduire en pratique → A.2 commencée

**Mercredi-jeudi 19-20 mai**
- Implémentation des caps mécaniques (A.2)
- Revoir coefficients par dimension si nécessaire (A.3)
- Tester le scoring recalibré sur le panel de 15 → boucle de validation

**Suite de la semaine**
- Score breakdown technique en parallèle (B.1)
- Cards compression (B.2)

**Sprint suivant**
- Score Band social (B.3) après brainstorm appellations
- Track Type "Live" et reformulation question masterisé (C.1, C.2)

---

## Liens

- `docs/aubiomix_snapshot_2026-05-18.md` — snapshot comparatif qui a motivé cette roadmap
- `docs/audit_aubiomix.md` — audit fond du 26 avril
- `docs/AUBIOMIX_PLAN.md` — plan post-audit tiers 1-4 (clos)
- `docs/frequency_balance_map_spec.md` — spec de la viz frequency map (parallèle, mode A retenu)
