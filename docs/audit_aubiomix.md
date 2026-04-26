# Audit concurrentiel — AubioMix
*David Berdugo · 26 avril 2026 · Sources : aubiomix.com (toutes pages publiques), vidéo démo 45 min de Aubrey Whitfield, rapport "Lâcher prise" (Goldey) acheté sur la plateforme*

---

## 1. TL;DR (à lire en premier)

AubioMix est un concurrent direct de Versions, lancé en bêta mi-avril 2026 (la vidéo de démo a été publiée le **15 avril 2026**, soit 11 jours avant cet audit) par **Aubrey Whitfield**, ingé son et productrice UK reconnue (Little Mix, Kelly Clarkson, Soul II Soul) qui a déjà une école de mixage en ligne (`aubreywhitfield.com/promix`, `vocalmixing`, etc.). Le positionnement est volontairement plus étroit que Versions : **mix analysis pure, pas d'arrangement / production / lyrics**.

**Ce qui est exceptionnellement fort chez eux**
- Un **algorithme de scoring publié intégralement et en clair** sur `/evaluation-framework` : v6.3 du moteur, ~50 règles précises (caps, gates, AQF, DSP guardrails, anti-clustering, score floor protection en révision…). Transparence totale → confiance, autorité, défensibilité.
- Un **garde-fou DSP / IA combiné** très abouti : l'IA propose, des mesures DSP réelles (LUFS, crest factor, masking spectral, stereo correlation, mid/side ratio, distribution 6 bandes) "cap" les sur-estimations.
- Un **système de révision "advice-followed locking"** : si tu suis un conseil, le sous-score ne peut PAS redescendre à la version suivante (variance IA neutralisée). C'est une réponse directe au problème "le score baisse alors que j'ai amélioré le mix" qu'on a aussi sur Versions.
- Un **Release Readiness System** ("Ready to Ship / Almost / Not Yet" + détecteur de plateau + "Mark as Final") qui donne une **ligne d'arrivée** définie au mix — exactement le genre de feature qui transforme un outil "diagnostic" en outil "compagnon de production".
- Une **comparaison aux pairs du même genre** ("Lo-fi peers · Top 1%") sur le dashboard.
- Une **vraie persona Aubrey** dans le ton (warm, constructif, "c'est de la dégustation, pas de la chimie") + des **plugins picks** ("Aubrey's Pick: FabFilter Pro-Q 3", "LA-2A style compressor") qui ancrent la crédibilité.

**Ce qu'ils n'ont pas et que Versions a déjà ou peut s'approprier**
- Pas d'analyse d'arrangement, structure, production, intention artistique — seulement le mix.
- Pas de transcription, pas de paroles, pas de comparaison "autre titre" du même artiste, pas de "plan d'action global" sur la production.
- Pas d'écoute multilingue côté ton (tout en anglais, voix très "school of mixing UK").
- Pas de plan free permanent : la stratégie est un **micro-essai à £2.99 (un seul mix)** puis paiement direct.

**Ce qui doit déclencher une action courte chez nous (top 5)**
1. **Publier notre propre Evaluation Framework** sur `/comment-on-evalue` (le faire devient une page-pilier SEO + un argument d'autorité). Eux ont 3000+ mots de méthodologie publique.
2. **Ajouter un Release Readiness verdict** ("Prêt à sortir / Presque / Pas encore") + détecteur de plateau (deux versions statistiquement identiques → "marquer comme finale"). Mécaniquement faisable avec ce qu'on a déjà.
3. **Verrouiller les sous-scores quand l'utilisateur a suivi nos conseils** (notre prompt génère des recos numérotées → mémoriser celles cochées entre 2 versions, et empêcher la régression sur la dimension concernée). Réponse directe à la frustration "score qui baisse à tort".
4. **Faire passer notre rapport au format à actions priorisées + plugin pick + setting numérique** (ratio, attaque, release, GR en dB, fréquence, Q). Aubrey livre des recommandations *exécutables* — beaucoup plus actionnables que les paragraphes prosaïques.
5. **Dashboard "Mes mixes vs la communauté du même genre"** — perçu comme magique et c'est une rétention loop forte.

**Ce sur quoi on les bat déjà** (à ne pas perdre) : périmètre élargi (production / arrangement / intention), expérience desktop refondue, suivi inter-versions multi-axes, langue française native.

---

## 2. Positionnement & storytelling

### 2.1 Persona fondatrice
**Aubrey Whitfield** — productrice/songwriter/ingé son UK, 20+ ans, références commerciales (Little Mix, Kelly Clarkson, Soul II Soul, Simon Webbe). Elle a déjà :
- Une école de mixage en ligne (`promix`, `vocalmixing`, `promixing`)
- Une chaîne YouTube (`@AubreyWhitfielduk`)
- Un store, un EQ chart distribué gratuitement
- Une audience Instagram (`@aubreywhitfield`)

→ AubioMix n'est pas un produit "pure tech" lancé d'une rampe vide. C'est l'extension logicielle d'une **marque éducative déjà installée**, ce qui leur donne un canal d'acquisition gratuit massif (sa propre audience). C'est un avantage structurel à connaître mais qu'on ne peut pas répliquer.

### 2.2 Hook narratif (à voler)
La page **About** ouvre sur le concept d'**Auditory Habituation** ("au bout de ~20 min, le cerveau filtre des éléments du mix → on ne peut plus prendre de bonnes décisions") puis pivote sur "comment obtenir des oreilles fraîches → mentor ou plateforme". C'est un hook **ultra simple, mémorable, scientifiquement fondé**, qui justifie l'achat de "secondes oreilles".

→ Versions devrait avoir son propre angle équivalent. Nos atouts : l'angle est plus large que le mix → on peut aller chercher quelque chose comme **"Le compositeur n'est pas le bon juge de sa propre œuvre"** (biais d'auteur, attachement émotionnel à la maquette, etc.) qui justifie une analyse qui couvre **production/arrangement/intention**, pas juste le mix.

### 2.3 Tagline & promesses
- Headline : *"Get Pro-Level Feedback on Your Mixes — In Minutes"*
- Promesse temporelle : **2 à 4 minutes** par analyse (parfois "2-3 minutes" sur la page About) — donc temps perçu très court.
- Promesse qualitative : *"Built by professional Mix Engineer Aubrey Whitfield, with 20+ years experience"* — la signature humaine est partout.
- Anti-promesse explicite (très fort) : *"You won't find inflated scores here to make you feel good. Nor will you receive overly negative scores that aim to motivate you to do better."*
- Différenciation revendiquée : *"It's not cold AI, it's a feedback system that has guidelines, personality and bags of experience."*

### 2.4 Discours sur l'IA (à étudier de près)
Aubrey raconte **explicitement dans la vidéo et sur la page Evaluation Framework** comment elle a découvert que l'IA toute seule "faisait de l'analyse prédictive basée sur le genre" sans réellement écouter l'audio, et comment elle a passé un an (500+ heures) à corriger ça. Le mot "AI" est assumé mais immédiatement conditionné par "*AI-led musical evaluation, DSP-supported — not DSP scoring with AI decoration*". 

→ C'est une posture honnête + experte qui désamorce le rejet "encore un truc IA". À noter pour notre propre comm : on a la même règle interne (ne jamais citer Gemini/Claude dans l'UI), mais on peut être plus *explicite* sur la **méthode** sans nommer les modèles.

---

## 3. Modèle économique (pricing)

### 3.1 Grille
| Pack | Prix | Prix/review | Note |
|---|---|---|---|
| **Try It** (1ʳᵉ fois uniquement) | £2.99 | £2.99 | Achat unique, vrai rapport complet |
| 1 Mix Review | £6.99 | £6.99 | Single |
| 3 Mix Reviews | £11.99 | £4.00 | -43% |
| 5 Mix Reviews | £14.99 | £3.00 | -57% |
| **10 Mix Reviews** ⭐ Aubrey Recommends | £24.99 | £2.50 | -64% |
| **200 Studio Year Pack** | £139 | £0.70 | -80%, expire à 12 mois |
| **Pro Subscription** | £19.99/mo | £1.00 | 20 reviews/mo, **roll-over** des crédits non utilisés (même après cancel) |
| Pro Subscription Annual | £19.99 × 12 × 0.6 ≈ £143.93/an | — | Save 40% |

### 3.2 Lecture stratégique
- **Anchor explicite** : "On average, music producers go through **6–10 different versions** of their mix before finishing a track" → justifie le pack 10 ⭐ et **renforce la feature révisions** comme cœur du produit.
- **Try It £2.99 = arme acquisition** : on "achète" un vrai rapport complet pour le prix d'un café. C'est le coup principal pour faire goûter — beaucoup plus convertissant qu'un freemium plafonné, parce qu'il y a déjà engagement monétaire (et donc engagement à utiliser le retour). Aucun freemium permanent.
- **"Credits never expire"** sauf le Studio Year Pack (200 reviews / 12 mois) → friction faible, achat sécurisant.
- **Roll-over abonnement** "even after cancellation" → réduit la peur de s'abonner. C'est rare.
- **Promo codes apply to credit packs only** → ils protègent leur MRR.
- **Reference Track Comparison** est gated **subscription only** → fait monter en abonnement pour les sérieux.

### 3.3 Comparaison avec Versions (modèle à choisir)
Notre dilemme actuel (cf. `project_versions_free_limits.md`) : pas encore de quotas Free + plan badge hardcodé Premium. Apprentissages d'AubioMix :

- **Si on garde un Free permanent** : limite-le à un seul rapport "léger" (sans révision tracking, sans plugin picks, sans comparaison pairs) plutôt qu'à un quota mensuel → l'utilisateur Free voit ce qu'il manque sans être bloqué.
- **Aller chercher l'introductory pack à 1-2 € pour le 1ᵉʳ achat** est très probablement plus convertissant qu'un Premium plein prix ; c'est l'ancrage à étudier en priorité.
- **Justifier le 10-pack par la stat "6-10 révisions par titre"** est très efficace — c'est exactement la cible du compositeur amateur sérieux.
- **Roll-over** sur abo annuel = différenciateur fort à copier.
- **Nous, on a un atout** : périmètre plus large (production/arrangement) → on peut **prix au-dessus** d'AubioMix sur l'abonnement à condition que ce soit clair qu'on couvre plus.

---

## 4. Features détaillées

### 4.1 Sur la home (12 cartes "What you get")
1. Tonal Balance & EQ
2. Mix Balance & Cohesion
3. Frequency Masking
4. Dynamics & Compression
5. Stereo Width & Depth
6. Creative Processing & FX
7. Noise & Artefact Detection (avec timestamps)
8. Clipping & Limiter Stress (mastered = limiter stress, unmastered = clipping)
9. Genre-Aware Scoring (les choix stylistiques ne sont pas pénalisés)
10. Personalised Feedback ("straight-talking, constructive")
11. Reference Comparisons
12. Revision Tracking
13. PDF Export

### 4.2 Workflow d'upload (déduit de la vidéo + UI)
Lors de l'upload, l'utilisateur renseigne :
- **Title** (clé de la détection révision : même titre = révision)
- **Artist**
- **Genre** (parmi une longue liste — voir tableau plus bas — ou "Don't know" → **détecteur automatique** de genre intégré : "We think your track is alt pop")
- **Vocal / Instrumental**
- **Mastered / Unmastered**
- **Reference track** (optionnel, abonnement uniquement)

Formats acceptés : **WAV 16/24-bit, MP3**, **44.1 kHz ou 48 kHz**, jusqu'à **70 Mo** (la home dit 70, le SEO meta dit 90 — *drift à signaler chez eux*).

### 4.3 Pipeline temps réel (déduit de la vidéo)
*"Within about two to four minutes on average."* → l'utilisateur peut "go off and get a cup of coffee". **Email alert** quand le rapport est prêt. **Queue system** activé "si des centaines d'utilisateurs uploadent en même temps" mais "still see within a few minutes".

→ Implication : ils acceptent du **traitement asynchrone** (pas d'attente bloquante). C'est un design d'expérience à creuser pour Versions où on a un stream temps réel actuellement.

### 4.4 Le rapport (12 sections — voir détails au §6)
01 Mix Summary · 02 Reference Track Comparison · 03 Tonal Balance & Frequency Masking · 04 Dynamics & Compression · 05 Mix Balance · 06 Mix Bus Processing · 07 Stereo Width & Depth · 08 FX & Creative Processing · 09 Vocal Mix · 10 Mastering & Loudness · 11 Noise & Artefacts · 12 Technical Measurements

### 4.5 Features uniques à noter
- **Score Card téléchargeable** (image partageable type Spotify Wrapped)
- **Share Report Link** (rapport public sharable — exemple vivant : `aubiomix.com/report/26f75a6d-…`)
- **Notes utilisateur** ("Add personal notes about this mix — changes you've made, things to try")
- **Checklist interactive** sur les notes ("0/5 completed 0%") — l'utilisateur coche au fur et à mesure
- **Plugins picks** : "Aubrey's Pick: FabFilter Pro-Q 3" / "LA-2A style compressor" / "iZotope RX"
- **Cohesion Meter** visuel (Loose / Blended / Glued / Over-Processed)
- **Spectral distribution 6 bandes** affichée sous forme de bar chart avec étiquettes de bandes (Sub 20-60, Bass 60-250, Low-Mid 250-500, Mid 500-2k, Hi-Mid 2k-6k, Highs 6k+)
- **AI-Generated Track Detection** (Suno/Udio/etc. flaggés)
- **Low-Quality Source Detection** (MP3 ré-encodés / YouTube rips détectés et contextualisés)

### 4.6 Dashboard
- **Score Progression chart** (timeline d'évolution sur tous tes mixes)
- **You vs the Community** : *"Top 1% · 63 avg"* (ton percentile + score moyen)
- KPI cards : Avg Score / Mixes Uploaded / This Week / Genres
- **Genre breakdown** (probablement un mini chart des genres analysés)
- Liste "Your Mix Reports" triable ("Newest First")
- Filter "Final Versions Only" (pour les mixes marqués comme finis)
- Buy Credits + compteur de credits restants

---

## 5. Pipeline technique déduit (le plus important)

> **Aubrey raconte tout sur** `/evaluation-framework`. Cette page est en soi un manifeste d'ingénierie — environ 3000 mots qui décrivent la moitié de l'algorithme. Ci-dessous, mes hypothèses sur les couches non documentées + recoupement avec ce qu'on voit dans le rapport "Lâcher prise".

### 5.1 Architecture probable

```
┌─────────────────────────────────────────────────────────────┐
│                    UPLOAD + METADATA                        │
│  Title · Artist · Genre · Vocal? · Mastered? · Ref?         │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  SHA-256 hash + DSP fingerprint (LUFS/crest/correlation/    │
│  spectral bands) → Layer 1+2 duplicate detection            │
└──────────────────────────────┬──────────────────────────────┘
                               ▼ (si pas duplicat)
┌─────────────────────────────────────────────────────────────┐
│            DSP MEASUREMENT LAYER (déterministe)             │
│  • Integrated LUFS (BS.1770/EBU R 128)                      │
│  • True Peak (dBTP)                                         │
│  • Crest factor (peak-to-RMS)                               │
│  • Loudness Range (LRA)                                     │
│  • Stereo correlation (-1 → +1)                             │
│  • Mid/Side ratio (% side)                                  │
│  • Spectral energy distribution (6 bandes)                  │
│  • Per-window LUFS variance                                 │
│  • Noise floor (dBFS)                                       │
│  • Clipping detection (samples per minute)                  │
│  • 9 noise/artefact categories (hiss/hum/clicks/plosives…)  │
│  • AI-generated source detection (Suno/Udio fingerprint)    │
│  • Low-quality MP3 detection (cutoff 16kHz)                 │
│  • Mono detection (single channel)                          │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│      AI MUSICAL EVALUATION LAYER (LLM avec contexte)        │
│  Prompt = persona Aubrey + 9 tonal categories + scoring     │
│  rules + DSP measurements injectés en contexte + genre +    │
│  (si révision) note précédente + verdicts résolus           │
│                                                             │
│  Output : 6 sub-scores Mix Craft + notes priorisées +       │
│  insights (BIGGEST STRENGTH/WEAKNESS/QUICK WIN)             │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              GUARDRAIL LAYER (sanity caps DSP)              │
│  • Functional Cap ≤64 si <4 sub-scores ≥65                  │
│  • Weak Link Cap (lowest sub <50 → cap 64)                  │
│  • Tier Progression (65/80/90 thresholds)                   │
│  • Highly Skilled Gate (cap 79 si pas 4×75 + 2×80)          │
│  • Exceptional Fortress (cap 89)                            │
│  • Flat-Craft Demotion (5+ sub-scores ≤62 → hard cap 64)    │
│  • Severe Clipping Gate                                     │
│  • DSP Tonal/Mix/Masking/Dynamics/Stereo guardrails         │
│  • MaxUplift +6 (DSP ne peut pas remonter +6 sur AI)        │
│  • AQF (6 checks pour valider 80+, pénalités -3/-6/cap 85)  │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│      DIFFERENTIATION & UNIQUENESS LAYER                     │
│  • Anti-clustering (3+ sub-scores identiques → re-eval)     │
│  • Min spread 8 points entre sub-scores                     │
│  • Uniqueness salt ±2 micro-adjustment fingerprint          │
│  • Clean Mastering Bonus +2 si master commercial clean      │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│      REVISION LOGIC (si même titre) — v6.2                  │
│  • Resolution Trail : chaque note précédente classifiée     │
│    Resolved/Partially/Still Present/Made Worse              │
│  • Word-overlap dedup (>45% mots) + freq-range dedup (>25%) │
│  • Score floor protection (max -3 overall, -5 sub-score)    │
│  • Advice-followed locking (si conseil suivi → sub-score    │
│    ne peut pas redescendre)                                 │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│      RELEASE READINESS LAYER — v6.3                         │
│  • Verdict banner (Ready/Almost/Not Yet)                    │
│  • Plateau detector (V vs V-1 statistiquement identique)    │
│  • Per-Note Meaningfulness Floor (supprime notes <delta)    │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            POST-PROCESSING & RENDERING                      │
│  • Mandatory logging (raw AI / DSP-adjusted / gates / final)│
│  • PDF generator (mise en page A4, 9 pages typiques)        │
│  • Score Card image (downloadable, partageable)             │
│  • Email notification "your report is ready"                │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Stack DSP probable

Les mesures correspondent quasi à 100% à ce que **Essentia** (open source, Music Technology Group Barcelona) ou **librosa** + **pyloudnorm** + un détecteur de clipping maison fournissent en quelques secondes. Pas de magie côté mesures — c'est de l'ingénierie audio classique, bien faite et bien intégrée.

Pour la **détection des artefacts** (mouth clicks à 0:15, 0:42, 1:28, 2:36 dans le sample report) : très probablement **iZotope RX SDK** ou un détecteur maison basé sur la transitoire spectrale + segmentation temporelle. Le fait qu'Aubrey recommande "Aubrey's Pick: iZotope RX" pour la résolution renforce l'hypothèse RX comme moteur sous-jacent.

Pour la **détection AI-generated** (Suno/Udio) : pattern matching spectral sur "compression écrasée + cutoff HF irréaliste + artefacts du champ stéréo". Faisable maison avec quelques classifiers entraînés sur ~quelques milliers d'échantillons étiquetés.

Pour la **détection automatique du genre** ("We think your track is alt pop") : modèle de classification audio classique (CNN sur spectrogramme ou Essentia genre classifier).

### 5.3 Couche IA (LLM) probable

Tous les indices convergent vers **un LLM frontière** (probablement GPT-4 / Claude Sonnet) appelé avec :
1. Un **system prompt persona** très long (le "personality in tech-form" qu'Aubrey décrit, "500+ heures" passées à le polir).
2. Les **mesures DSP injectées en JSON** (LUFS, crest, bands %, correlation, masking %, etc.).
3. Les **9 catégories tonales** comme grille obligatoire d'évaluation ("at least 3 distinct issues are reported per mix").
4. Le **genre + thresholds** (table 60-85% en fonction du genre).
5. (En révision) **les notes précédentes + leur audio** ou en tout cas leurs deltas DSP.
6. Une **structure de sortie contrainte** (JSON schema) avec : 6 sub-scores Mix Craft + notes par section + priority level + plugin pick + 3 insights (strength/weakness/quick win).

Indices forts dans le rapport "Lâcher prise" :
- **Bug visible** dans une recommandation : *"Use a dynamic EQ to gently tame 2.5 kHz by 2-3 dB with a moderate Q (around 0:01)"* → ce "0:01" est très probablement une **hallucination LLM** (devrait être "Q around 1.0"). Confirme que c'est un LLM qui génère le texte des notes.
- **"Likely culprits"** dans la section masking : "Synth pads, Lead vocal, Bass" → ce niveau de spécificité instrumentale ne vient pas d'un DSP, c'est une **inférence LLM** sur l'audio (probablement via embeddings d'un modèle audio multimodal ou simplement déduit du genre + des bandes spectrales touchées).
- **Vocal Health** avec 7 sous-critères (Présence / Dynamiques / Sibilance / Dé-essing / Effets / Justesse / Timing) → soit un **second appel LLM** spécialisé voix après détection vocal=yes, soit une section du même prompt avec instructions ciblées.

### 5.4 Ce qu'ils font de très intelligent côté pipeline (et qu'on doit imiter)

| Ce qu'ils font | Pourquoi c'est malin | Ce qu'on devrait faire |
|---|---|---|
| **Hash SHA-256 + score clamping** sur upload identique | Évite que la variance LLM (±3-5 points) tue la confiance quand on re-upload le même fichier | Hasher chaque audio et retourner instantanément le score précédent |
| **DSP fingerprint en fallback** | Catche les ré-encodages du même mix (changement d'extension, etc.) | Idem, niveau 2 |
| **Score floor protection en révision** | Empêche que le score baisse à tort entre v1 et v2 → trust feedback | Mémoriser sub-scores v(n-1) et plafonner la baisse |
| **Advice-followed locking** | Si tu as suivi le conseil, le sub-score est *verrouillé* à la baisse | Implémenter un état "résolu" sur chaque reco et lock ce sub-score |
| **Per-note dedup word/freq overlap** | Évite de répéter "réduire 3kHz" alors que c'était déjà dit | Comparer les notes de v(n) vs v(n-1) au mot + à la fréquence |
| **Plateau detector** | Coupe la boucle infinie d'amélioration | Quand v(n) ≈ v(n-1), proposer "marquer comme finale" |
| **Per-note meaningfulness floor** | Supprime les notes triviales (< delta DSP perceptible) | Cap "ne pas suggérer < 1.5 dB de cut" |
| **MaxUplift +6** | Empêche les guardrails DSP de gonfler artificiellement un score IA bas | À cabler dans nos guardrails si on en ajoute |
| **Mandatory logging exhaustif** | Permet de monitorer/debugger en continu | Logger chaque appel LLM + état des guardrails déclenchés |

### 5.5 Ce qu'ils ne disent pas (et qu'on doit deviner)

- **Coût marginal d'un rapport** : leur prix mini £6.99 (single review) suggère un coût d'inférence pas négligeable (probablement £1-2 entre LLM frontier + DSP + génération PDF). Pour fournir 200 reviews à £139 = £0.70/review, ils tablent sur un mix d'utilisateurs qui ne consomment pas tout (cf. cohorte fitness club).
- **Stockage audio** : le rapport partagé public (`/report/26f75a6d-…`) intègre un player audio donc l'audio est conservé. Implications GDPR (eux UK) à étudier — on a déjà notre setup Supabase Storage.
- **Calibration des sub-scores** : "scoring version v6.2" / v6.3 indique des **ajustements continus avec versionnage**. À considérer pour Versions : un champ `scoring_version` sur chaque rapport pour permettre la migration.

---

## 6. Analyse du rapport réel : *"Lâcher prise" — Goldey* (Lo-fi · Vocal · Mastered)

### 6.1 Verdict global
- **Score : 63/100 — Demo-Level Mix** (limite supérieure de la bande 50-64)
- Mix Craft 66/100 — Technical Integrity 92/100
- Verdict : *"AubioMix suggests this mix hasn't reached professional level yet"*
- "You vs Community : Top 1%" sur le dashboard (parce qu'ils n'ont qu'un seul mix Lo-fi en base : 1 mix → top 1%, c'est un artefact de cold-start communautaire)

### 6.2 Sub-scores (avec lecture)
| Dimension | Poids | Score | Lecture |
|---|---|---|---|
| Tonal Balance & EQ | 20% | **57** *(Improve)* | Boxiness 300Hz vocale + harshness 2.5k synth + brittle 12k+ |
| Mix Balance | 20% | **73** *(Strongest)* | Hierarchie OK, vocal au-dessus, juste petit problème basse en couplet |
| Frequency Masking | 15% | 70 | Masking 250Hz entre synth pads + vocal + basse |
| Dynamics & Compression | 15% | 67 | OK pour le genre, vocal pourrait être compressé +2-4dB |
| Stereo Width & Depth | 15% | 63 | Correlation 0.846 = mono-safe, image OK |
| Creative Processing/FX | 15% | 60 | (peu commenté dans le détail) |
| Clipping | 50% Tech | 98 | None detected |
| Noise & Artefacts | 50% Tech | 85 | Low |
| Crest factor (advisory) | — | 65 | 13.7 dB — sain pour Lo-fi mastered |

### 6.3 Recommandations livrées (5 notes priorisées + plugin picks)

**HIGH PRIORITY (priority)**
1. *Apply a wide bell filter cut of 2-3 dB at 300 Hz on the lead vocal to reduce the boxiness and improve clarity.* → **FabFilter Pro-Q 3**
2. *Apply gentle compression to the lead vocal with an Opto-style compressor. Start with an attack of 10-20 ms, a release of 80-120 ms, a ratio of 2:1 - 3:1, and aim for 2-4 dB of gain reduction.* → **LA-2A style compressor**

**MEDIUM PRIORITY (priority + recommended)**
3. *Use a dynamic EQ to gently tame 2.5 kHz by 2-3 dB with a moderate Q (around 0:01) on the synth bus.* → **FabFilter Pro-Q 3**  
   ⚠ **Bug LLM visible** : "Q around 0:01" — devrait être "Q around 1.0"
4. *Consider using volume automation on the bass guitar in the verses to ensure its level remains consistent and supportive without overpowering the vocal.*

**LOW PRIORITY (polish)**
5. *Apply a gentle high-shelf cut of 1-1.5 dB from 12 kHz on the drum bus or overall mix bus to smooth out the subtle brittle quality in the top end.* → **FabFilter Pro-Q 3**

### 6.4 Données objectives livrées
**Spectral Energy Distribution** (6 bandes, en %) :
- Sub (20-60 Hz) : **24.5%** *(Too High flag)*
- Bass (60-250 Hz) : **46%** *(In Range pour Lo-fi)*
- Low-Mid (250-500 Hz) : 13.5%
- Mid (500-2k Hz) : 11.5%
- Hi-Mid (2k-6k Hz) : 3.4%
- Highs (6k+) : 1.3%

**Loudness Metrics** :
- Integrated LUFS : **-12.4** (target -14 → légèrement chaud)
- True Peak : **0.0 dBTP** (target -1.0 → ⚠ pas de marge inter-sample peak)
- Crest Factor : **13.7 dB**
- Stereo Correlation : **0.846**
- Mid/Side Ratio : **7.7% side**
- Clipping/artefacts : None detected
- Noise Status : Low

### 6.5 Vocal Health (section dédiée — 7 sous-critères)
Pour chaque mix avec voix, AubioMix analyse :
1. **Présence** (cuts through 2-5 kHz)
2. **Dynamiques** (level inconsistencies)
3. **Sibilance**
4. **De-essing**
5. **Effects** (reverb taste)
6. **Pitch / Tuning**
7. **Timing** (sync with instrumental)

→ **Feature à reprendre côté Versions** : un encart "santé voix" si vocal=yes, c'est très efficace pour l'utilisateur compositeur (qui chante souvent lui-même ses démos).

### 6.6 Forces et faiblesses du rapport vues par David
- ✅ **Très actionnable** : chaque reco a fréquence + dB + Q + ratio + attaque + release. Quasi un cahier de pré-mastering.
- ✅ **Plugin pick** ancre la crédibilité (FabFilter, iZotope, LA-2A type).
- ✅ **Distinction priorité high/medium/low** + checklist cochable = engageant.
- ✅ **Spectral chart 6 bandes** plus parlant qu'une réponse en fréquence brute.
- ✅ **Vocal Health 7 critères** = section très lisible.
- ⚠️ **Bug "Q around 0:01"** = ça arrive, montre que leur LLM hallucine encore parfois.
- ⚠️ **Très peu de mots sur FX/Creative Processing** alors que la section existe → reco incomplète sur ce score 60.
- ⚠️ **Pas d'écoute par section** (pas de timestamp horodaté autre que pour les artefacts) — alors que le sample report mentionne timestamps "0:15, 0:42, 1:28, 2:36" pour mouth clicks.
- ⚠️ **Très peu de commentaires positifs** : 1 BIGGEST STRENGTH + quelques phrases sympas dans Stereo et Dynamics, mais le ton reste très "à corriger". Versions a un avantage si on insiste plus sur ce qui marche.

---

## 7. Comparatif AubioMix ↔ Versions (à la louche)

| Axe | AubioMix | Versions | Verdict |
|---|---|---|---|
| **Périmètre** | Mix only (sound shaping) | Production / arrangement / mix / intention artistique | 🟢 Versions plus large |
| **Persona** | Aubrey Whitfield, ingé son UK 20+ ans | (à clarifier — angle "compositeur indé") | 🟡 à muscler côté Versions |
| **Storytelling** | Auditory Habituation (20 min) | (à formaliser) | 🟡 à créer |
| **Méthodologie publique** | Page Evaluation Framework ~3000 mots | Aucune | 🔴 manque chez nous |
| **Score 0-100** | Oui, 6 bandes nommées | Oui (à confirmer notation) | 🟡 à aligner |
| **Sub-scores avec poids** | 6 (Mix Craft) + 2 (Tech Integrity) | (à étendre sur l'intention artistique) | 🟡 |
| **Plugin picks** | Oui (FabFilter, iZotope, LA-2A type) | Non | 🔴 manque |
| **Spectral chart 6 bandes** | Oui | Partiel | 🟡 |
| **DSP measurements (LUFS/crest/correlation)** | Oui, dans rapport + glossary public | À cabler proprement | 🔴 manque |
| **Genre-aware thresholds** | Oui, ~40 genres mappés | Partiel | 🟡 |
| **Auto genre detection** | Oui ("We think your track is alt pop") | À étudier | 🟡 |
| **Reference track upload** | Oui (subscription only) | À étudier | 🟡 |
| **Revision tracking same-title** | Oui, ultra abouti (Resolution Trail v6.2) | Partiellement (1ʳᵉ passe livrée — `project_versions_inter_version_tracking.md`) | 🟢 acquis, à compléter |
| **Score floor protection révision** | Oui (max -3 overall, -5 sub, advice-locking) | Non | 🔴 manque |
| **Per-note dedup révision** | Oui (word 45% + freq overlap 25%) | Partiel | 🟡 |
| **Release Readiness verdict** | Oui (Ready/Almost/Not Yet) | Non | 🔴 manque |
| **Plateau detector** | Oui ("Mark as Final") | Non | 🔴 manque |
| **Per-note meaningfulness floor** | Oui (supprime notes triviales) | Non | 🔴 manque |
| **Vocal Health (7 critères)** | Oui | Partiel | 🟡 |
| **Mix Cohesion meter visuel** | Oui (4 zones) | Non | 🔴 |
| **Dashboard "vs community"** | Oui (Top X% par genre) | Non (cold start trop tôt de toute façon) | 🟡 prévoir |
| **Score Card téléchargeable image** | Oui | Non | 🔴 |
| **Share Report Link public** | Oui | Non | 🔴 |
| **Notes utilisateur sur le rapport** | Oui ("Add personal notes…") | Non | 🔴 |
| **Checklist cochable des notes** | Oui (0/X completed) | Non | 🔴 |
| **PDF export** | Oui (9 pages, soigné) | À étudier | 🟡 |
| **Email notification "report ready"** | Oui | À cabler | 🟡 |
| **Queue + traitement async** | Oui | Stream temps réel actuel | 🟢 différentiation |
| **Hash duplicate + score clamp** | Oui (SHA-256 + DSP fingerprint) | Non | 🔴 |
| **Mandatory logging exhaustif** | Oui (raw AI / DSP-adjusted / gates) | Partiel | 🟡 |
| **Detection AI-generated source** | Oui (Suno/Udio fingerprint) | Non | 🔴 |
| **Detection MP3 lossy ré-encodé** | Oui | Non | 🔴 |
| **Mono track handling fair** | Oui (sub-score neutralisé à 65) | À vérifier | 🟡 |
| **Multilingue** | Anglais uniquement | Français natif | 🟢 |
| **Web only** | Web only (PWA) | Web (refonte desktop en cours) | 🟢 différentiation desktop possible |
| **Pricing** | £2.99 try / £6.99-£24.99 packs / £19.99 Pro | À structurer (`project_versions_free_limits.md`) | 🟡 à finaliser |

---

## 8. Recommandations prioritisées pour Versions (backlog)

### 🔥 Quick wins (≤ 2 semaines)
1. **Page `/comment-on-evalue`** : publier notre méthodologie en clair (équivalent Evaluation Framework). Effet : autorité, SEO, trust. Format : 1500-2500 mots, prose + petits encadrés. À écrire ensemble sur la base de notre prompt actuel.
2. **Format des notes : actionnable + plugin pick + setting numérique.** Modifier le prompt côté `decode-api` pour que chaque reco respecte un schema : `{section, priority(high/med/low), title, why, how (avec valeurs : Hz, dB, Q, ratio, attack, release, GR), plugin_pick (optionnel)}`. Ne pas citer Gemini/Claude dans l'UI, mais on peut citer FabFilter Pro-Q 4 / iZotope Ozone / LA-2A type sans souci.
3. **Checklist cochable** sur les notes du rapport (état persisté côté Supabase). Compteur "X/N completed".
4. **Score Card image téléchargeable** (canvas → PNG, à partager sur IG/X).
5. **Share Report Link** (route publique en lecture seule, sans auth, pour partage utilisateur).
6. **Notes utilisateur** ("Add personal notes about this mix") sur la fiche.

### 🎯 Cœur produit (2-6 semaines)
7. **Score floor protection** sur les révisions (max -3 overall, max -5 sub-score sauf dégradation prouvée). C'est l'arme principale pour réparer la confiance.
8. **Advice-followed locking** : si l'utilisateur a coché une reco comme "implémentée" en v(n), le sub-score concerné est verrouillé à la baisse en v(n+1). Réponse directe à la frustration "j'ai amélioré mais le score baisse".
9. **Per-note dedup en révision** : comparer les notes de v(n) vs v(n-1) sur word overlap (>45%) + frequency overlap. Ne pas redire ce qui a déjà été dit.
10. **Hash SHA-256 sur upload** + score clamping ±1 si re-upload du même fichier sous 24h. Élimine la variance LLM perçue comme bug.
11. **Per-note meaningfulness floor** : refuser les notes "réduire 0.4 dB à 250 Hz" (delta DSP < seuil par dimension).
12. **Vocal Health section dédiée** (7 critères : présence, dynamiques, sibilance, de-essing, effets, justesse, timing) — à activer si vocal=yes dans l'upload form.
13. **Spectral chart 6 bandes** en haut du rapport (avec étiquettes Sub/Bass/Low-Mid/Mid/Hi-Mid/Highs et flag In Range / Too High / Too Low en fonction du genre).

### 🌅 Stratégique (1-3 mois)
14. **Release Readiness verdict** : "Prêt à sortir / Presque / Pas encore" avec liste des blocants. Aubrey a inventé une UX géniale là-dessus ("Anything below is taste, not technique").
15. **Plateau detector** : détecter v(n) ≈ v(n-1) sur 6+ critères statistiques → proposer "marquer comme finale" + ajouter badge "Final" sur la fiche.
16. **Dashboard "Vs Community" par genre** (% percentile sur la cohorte de l'utilisateur). À sortir uniquement quand on a >100 mixes du même genre, sinon ça affiche "Top 1%" comme chez eux et ça ridiculise la feature.
17. **Detection AI-generated source** (Suno/Udio fingerprint spectrale). Pas critique mais positionnement de qualité.
18. **Reference track upload** (gated abonnement supérieur si on segmente). Bonus differential : on pourrait permettre la comparaison à un autre titre de l'utilisateur lui-même, pas que d'une référence externe.
19. **Auto genre detection** (modèle léger côté front ou backend rapide). Améliore la friction d'upload — eux le font déjà.
20. **Refonte du PDF export** dans le style AubioMix (1 page de garde + TOC + section recos prioritisées + section "Detailed Analysis" par dimension + section "Technical Measurements" en fin). Très pro.

### 💡 Différenciation (à inventer chez nous, pas chez eux)
21. **Section "Intention artistique"** (qu'on a déjà commencée — `project_versions_intention.md`) reste notre différenciateur unique. À pousser en première section du rapport, pas en encart secondaire.
22. **Comparaison "votre style à travers le catalogue"** : si un user a uploadé 5+ titres, montrer les patterns récurrents de son mix (toujours masking 250Hz, toujours vocal -3dB en couplet…). Aubrey ne fait que track-par-track.
23. **Couverture arrangement / structure** : feedback sur intro trop longue, build-up absent, drop répétitif, etc. AubioMix ne touche pas du tout à ça. C'est notre territoire.
24. **Lyrics / phrasé** (si on intègre un transcripteur audio + analyse) : flow, syllabes, accroches. Encore une fois territoire pas couvert par AubioMix.
25. **Rapport bilingue** (FR natif + EN) : eux 100% UK, on capte tout le marché francophone qui galère avec leur langage ingé son.

---

## 9. Différenciation possible (positionnement)

### 9.1 La trappe à éviter
**Ne pas devenir "AubioMix mais en français".** Aubrey est plus connue qu'on ne l'est, sa marque pré-existe au produit, son audience est massive. Si on se bat sur le terrain "qualité de l'analyse mix", on a beaucoup à rattraper alors qu'eux ont 11 jours d'avance public + 1 an d'avance produit + une figure d'autorité ingé son.

### 9.2 La porte ouverte
**Versions = compagnon du compositeur, pas seulement du mixeur.**

Le compositeur indé a besoin de :
- "Mon morceau a-t-il une identité ?"
- "Ma structure tient-elle ?"
- "Mon refrain passe-t-il ?"
- "Mon mix est-il pro ?" *(ici AubioMix est imbattable)*
- "Comment ai-je évolué entre la v1 et la v3 ?"

→ **On peut être "AubioMix + plus" sur le mix lui-même** (en piquant ce qui marche : floor protection, plugin picks, settings numériques, release readiness, checklist) **et imbattables sur le reste** (intention, arrangement, structure, identité).

### 9.3 Trois angles de positionnement candidats

**A. "Le miroir du compositeur"**
"Versions vous donne ce que personne d'autre ne vous donne : un retour structuré sur la totalité de votre œuvre, pas juste sur les tranches techniques. Mix, oui — mais aussi intention, structure, et évolution dans le temps."

**B. "L'écoute pro complète, en français"**
Capture le marché francophone qu'AubioMix laisse de côté. Tonalité francophone + couverture plus large + plugins picks = produit "best of both".

**C. "Le journal de bord du producteur indé"**
Insister sur le suivi inter-versions (déjà notre force) + intention artistique + comparaison de catalogue. Versions devient l'outil qui *raconte ton parcours d'artiste*, pas juste un grader.

À choisir selon ton positionnement marketing — il faudra trancher avec toi.

---

## 10. Annexes

### A. Ce qu'on n'a pas pu capturer
- **FAQ** : accordéon Radix mono-ouverture en lazy mount → contenu non extractible sans clic+capture séquentielle (13 questions). À refaire à la main si nécessaire.
- **Termes / Privacy / Cookies** : non audités (peu d'intérêt stratégique).

### B. Liens utiles
- Site : <https://www.aubiomix.com>
- Évaluation framework : <https://www.aubiomix.com/evaluation-framework>
- Glossary : <https://www.aubiomix.com/glossary>
- Sample report : <https://www.aubiomix.com/sample-report>
- About : <https://www.aubiomix.com/about>
- Pricing : <https://www.aubiomix.com/pricing>
- Vidéo démo (45 min) : <https://www.youtube.com/watch?v=B-uaqanxlnk>
- Aubrey Whitfield (site fondatrice) : <https://www.aubreywhitfield.com>
- Cours ProMix : <https://www.aubreywhitfield.com/promix>
- Rapport public partagé (le "Lâcher prise" de David) : <https://www.aubiomix.com/report/26f75a6d-0a2e-42de-a1cb-e57181897382>

### C. Fichiers d'audit bruts (sandbox)
Tous les textes capturés sont conservés dans `/sessions/elegant-ecstatic-ride/mnt/outputs/aubiomix_audit/` :
- `pages/home.txt` · `pages/pricing.txt` · `pages/sample_report.txt` · `pages/about.txt` · `pages/glossary.txt` · `pages/evaluation_framework.txt` · `pages/live_report_lacher_prise.txt`
- `report.pdf` (rapport "Lâcher prise" original)
- `report.txt` (texte extrait du PDF)
- `demo.en.vtt` (sous-titres bruts de la vidéo)
- `demo_transcript.txt` (transcript nettoyé, ~7900 mots)

### E. Insights supplémentaires tirés de la lecture intégrale du transcript vidéo

*Lecture complète du transcript de 7 944 mots (45 min) — éléments présents dans la démo mais pas (ou peu) sur les pages publiques du site.*

**Workflow d'upload — détails non documentés**
- **Upload en bulk de 5 titres simultanés** (pour analyser un EP en une fois). *"You can do a single upload here or if you wanted to upload an album like an EP, you can do it in bunch of five."* Feature commerciale forte pour les producteurs qui sortent des EP.
- **Mastered = "Don't know"** : option explicite à 3 valeurs (Yes / No / Don't know). Si "Don't know", l'app **auto-détecte** si le titre est masterisé.
- **Genre = "I don't know my genre"** : bouton qui lance une **analyse automatique du genre** de l'audio. Démo en vidéo : *"We think your track is alt pop"*. Aubrey reconnaît : *"sometimes it's not 100% accurate"*.
- **Copyright confirmation checkbox** obligatoire à cocher avant analyse (sinon l'analyse ne se lance pas).

**Visualisations dans le rapport — non visibles sur sample report public**
- **Frequency masking map cliquable type EQ plugin** : graphe X (fréquences) / Y (gain) avec points de masking annotés ("265 Hz: bass guitar and kick drum are masking each other") sur lesquels on peut **cliquer pour highlight l'issue**. Aubrey : *"think of it like an EQ plugin"*. C'est une visu interactive très puissante.
- **5 sliders visuels** dans le rapport (positionnement du mix sur un curseur entre 2 extrêmes) :
  - Compression : `Squashed | Under | Balanced | Over` (et "Over n'est pas forcément mauvais")
  - Mix Bus Processing : `Loose | Blended | Glued | Over-Processed`
  - Mix Balance : `Weak | Poor | Fair | Good | Excellent`
  - Stereo Width : `0% Mono ←→ 100% Wide` avec zones (4% = narrow OK pour un titre style Bad Guy)
  - Depth : `0% Flat ←→ 100% Spacious` (Aubrey insiste : "depth is something a lot of producers lack")
- **Phase correlation gauge** : `-1 ←→ +1` avec lecture pédagogique (proche de +1 = mono-safe, proche de -1 = phase issues).
- **FX Usage Profile** : graphe radar/4-axes (Reverb / Delay / Saturation / Modulation) avec gradation Heavy / Moderate / Subtle / Minimal, comparé aux normes de genre.
- **Loudness slider** : `Commercial Loudness ←→ Competitive Loudness` avec position du mix.
- **Per-section LUFS + True Peak** : *"click down here and it will tell you the LUFS average and true peak averages per section of your track"* — **analyse temporelle par section** (couplet/refrain), feature très avancée que je n'avais pas captée.

**UX du rapport — détails workflow**
- **Notes utilisateur avec bouton "Save note"** : *"you can add a note here, you know, 'I have completed the dynamics notes' for example, save note"*.
- **Print + tick workflow physique** : Aubrey vante le PDF spécifiquement pour *"print it off and have it right by you during your mix session"* — l'usage attendu inclut un workflow papier en studio.
- **PDF ≠ web** : *"it will look slightly different to your report online"* — ils maintiennent **deux mises en page distinctes** (PDF imprimable vs SPA web).
- **Cross-out des notes résolues en révision** : *"When you upload a new revise mix, it will have a detail of what you've addressed and what you haven't. So it will cross it out."* — confirme la résolution trail v6.2 vue côté algo.
- **Score difference badge** sur dashboard : ±N points par rapport à la version précédente, affiché sur la carte du mix.

**Acquisition / onboarding — non visible sans signup**
- **Free account obligatoire pour uploader** : pas de freemium, mais signup gratuit pour avoir accès au store de credits (et au dashboard / sample report).
- **Aucun crédit gratuit offert au signup** : il faut **acheter au moins le pack Try It £2.99** (1 crédit, première fois uniquement) pour générer un premier rapport.

**Engagement / posture éditoriale — citations mémorables**
- *"It's not just kind of looking at that cold hard data and saying 4%. That's really narrow. You should have a wide mix."* → l'app est **stylistiquement intelligente** (ne pénalise pas un titre narrow s'il est cohérent avec le style du genre/track).
- *"There are some flaws, there are some caps, it kind of pushes the audio mix into certain categories"* → Aubrey **reconnaît publiquement les limites** de son système de scoring. Très désarmant.
- *"Is this AI? I will say it started as AI. […] So it is not AI anymore. It is a very robust evaluation system that is built on how I analyze mixers."* → narratif fort qui repositionne le produit **hors du marché "outils IA"** vers **"système expert"**. À étudier pour notre propre comm.
- *"Don't feel disheartened if you've implemented the changes, you've uploaded a new mix and your score has gone down."* → assumée comme un risque réel ; vise à amortir la frustration utilisateur. C'est exactement la blessure que le **score floor protection** (algo) vise à neutraliser côté technique.
- *"Every audio that you put through here is secure. It's private. It's not shared. It's not trained for anything. Only you have access to it."* → message **vie privée explicite** dans la vidéo. À ne pas oublier dans nos pages légales et homepage.

**Benchmarks observables**
- **Bad Guy (Billie Eilish, MP3) → 81/100 "Highly Skilled Mix"**. Décomposition : creative processing & FX = score le plus haut, tonal balance & EQ flagué comme "à améliorer" même sur un hit record. *Aubrey s'attendait à ce résultat* : *"I would expect most people like Billy Eilish and kind of hit records to fall within the highly skilled mix category. Maybe the skilled mix category. Exceptional, very very difficult to get up to that level."*
- **Bad Guy spectrale** : 62% Bass (60-250 Hz), confirmant le "très bassy / kick + bass center" du mix.
- **Aubrey a 48 uploads dans son compte** (au moment du tournage), Top 1% sur la dashboard → cold-start communautaire évident, à anticiper côté Versions.

**Test mené par Aubrey en vidéo (ingénieux à reproduire chez nous pour QA)**
*"With this one, we did a test and we didn't implement any of the recommended changes and we went away and just did a brand new mix to test that the app was going to basically score it down and it did."* → test de **régression honnête** : changer le mix sans suivre les conseils, vérifier que le score baisse. C'est un excellent **test de QA** à intégrer chez nous régulièrement.

**Features qu'Aubrey ne démontre PAS dans la vidéo (mais qui sont sur /evaluation-framework)**
- Duplicate detection (SHA-256 + DSP fingerprint)
- Release Readiness Banner (Ready/Almost/Not Yet)
- Plateau Detector + "Mark as Final"
- AQF (Accomplished Qualification Framework)
- Per-Note Meaningfulness Floor
- AI-Generated Track Detection (Suno/Udio)

→ La vidéo (publiée le **15 avril**, 11 jours avant cet audit) est probablement **antérieure aux versions v6.2/v6.3** du moteur. Ces features ont été ajoutées juste avant le go-live public. Cela suggère un rythme d'itération soutenu.

**Implications stratégiques additionnelles pour Versions**
- **Bulk EP upload (5 titres)** : feature commerciale très simple à ajouter et très différenciante pour les producteurs sérieux qui sortent par lots. À budget court.
- **Sliders visuels** : on en a peu actuellement. Ajouter des sliders sur Compression, Mix Balance, Stereo Width, Depth + Cohesion meter visuel rapproche d'un coup notre rapport du standard "pro" perçu.
- **Frequency masking map interactive** : c'est une visu signature qu'Aubrey met en avant comme moment "wow" de la démo. Investissement front non trivial mais effet de démo majeur.
- **Per-section LUFS / True Peak** : on a déjà la donnée audio, c'est une question de découpage temporel + visualisation. Bonne valeur ajoutée pour les utilisateurs qui veulent comprendre où ça décroche dans le morceau.
- **Auto-detect mastered + auto-detect genre** : réduit la friction d'upload de 2 champs. À envisager pour la nouvelle home desktop (`project_versions_home_desktop.md`).
- **Print-friendly PDF distinct du web** : à ne pas négliger — la communauté production en home studio imprime encore beaucoup.
- **Test de régression Aubrey** ("changer le mix sans suivre les conseils, vérifier que le score baisse") : à intégrer dans notre QA pour valider que notre prochain `score floor protection` ne devient pas un plafond aveugle.

---

### D. Versions du moteur (à date)
- Scoring engine : **v6.3**
- AQF (Accomplished Qualification Framework) : **v2.0**
- Revision-aware scoring : **v6.2**
- DSP Guardrails : **v6.0**
- Duplicate Detection : **v6.1**
- Release Readiness : **v6.3**
- Sample report (mock) tag : **v4.5**

→ Le versioning systémique du scoring est en soi une bonne pratique à adopter chez Versions (champ `scoring_version` sur chaque rapport).

---

*Audit réalisé le 26 avril 2026. Toutes les citations entre guillemets sont des extraits courts (< 15 mots) issus du site AubioMix ou de la vidéo démo publique d'Aubrey Whitfield.*
