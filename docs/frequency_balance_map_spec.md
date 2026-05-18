# Frequency Balance Map — Spec design & implémentation
*David Berdugo · 18 mai 2026 · Itéré dans une session Cowork (v1 à v13). Source de vérité visuelle : la v13 du mockup.*

---

## TL;DR

Une visualisation interactive de la balance fréquentielle d'un mix, **organisée par élément musical** (Voix / Instruments / Basse / Batterie) plutôt que par bande de fréquence comme la concurrence. Chaque ligne est l'enveloppe spectrale d'un stem, l'axe Y est l'énergie en dB, et les conflits de masquage sont matérialisés par des bandes verticales traversant toute la hauteur, avec des markers ambrés sur les lanes concernées.

Différenciateur clé : la viz **matérialise visuellement la mécanique du masquage** (deux éléments à des niveaux trop proches sur la même fréquence) au lieu de simplement pointer une bosse problématique sur une courbe globale FFT.

---

## 1. Voie technique retenue (voie A)

- 4 lanes basées sur les 4 stems de séparation déjà disponibles dans le pipeline : `vocal / drums / bass / other` → libellés `Voix / Batterie / Basse / Instruments` côté UI.
- Pas de sous-séparation lead vs chœurs au niveau visuel. Les conflits intra-stem voix (par exemple chœurs qui masquent la voix lead) sont identifiés par le diagnostic LLM textuellement, et représentés visuellement comme **conflit qualitatif** : marker à bordure pointillée, pas de delta dB chiffré.
- La voie C (vraie séparation lead/backing par un modèle dédié type MDX23C ou BS-RoFormer) est écartée pour le MVP — peut être reconsidérée plus tard si l'angle "outil unique pour pop/soul/gospel" devient stratégique.

Les conflits de Comme un rêve mix 8 (référence de test) :
- **104 Hz · Batterie vs Basse · Δ 2 dB** — mesuré, kick body chevauche la fondamentale basse en La♭ majeur.
- **200 Hz · Chœurs vs Voix** — qualitatif, intra-stem voix.
- **11 kHz · Manque d'air · −34 dB** — absence, cymbals trop discrètes pour l'ouverture du mix.

---

## 2. Décisions de design figées

### Structure du SVG
- ViewBox 720 × 420.
- 4 lanes empilées : Voix (haut) → Instruments → Basse → Batterie (bas).
- Lane height 44 px, gap entre lanes 12 px.
- Plot area horizontal : x=80 → x=700 (620 px de large), axe Hz log de 20 Hz à 20 kHz.
- Zone annotations (chips) : y=0 → 95.
- Labels bandes spectrales : y=118.
- Zone lanes : y=125 → 337.
- Axe Hz : y=348 → 388.

### Échelle verticale (dB)
- 0 dB en haut de chaque lane, −36 dB en bas, échelle linéaire (44 px ↔ 36 dB).
- Indicateur "0 dB / −36" affiché **uniquement** sur la lane Voix (à x=83, font 9, opacity 0.42).
- Le cartouche bas confirme verbalement que l'échelle est la même pour les 4 lanes.

### Grille
- Verticales aux fréquences clés (50, 100, 200, 500, 1k, 2k, 5k, 10k) — `stroke: rgba(255,255,255,0.10)`, `stroke-width: 0.5`.
- Horizontales aux bornes top et bottom de chaque lane (8 lignes) — même style.

### Bandes spectrales (zones colorées + labels)
- Affichées en français au-dessus de la grille : **Sub-graves / Graves / Bas-médiums / Médiums / Haut-médiums / Aigus**.
- Important : éviter "Basses" pour la bande de fréquence car ça entrerait en collision visuelle avec la lane musicale "Basse". "Graves" est plus clair.
- Bornes utilisées : Sub-graves 20-60 Hz, Graves 60-250 Hz, Bas-médiums 250-500 Hz, Médiums 500-2 kHz, Haut-médiums 2-6 kHz, Aigus 6-20 kHz.

**Labels en filigrane** au-dessus de la grille :
- Style : font 10, opacity 0.45, sentence case, font-weight 500, text-anchor middle.

**Zones colorées en arrière-plan** (ajout v14, raffiné v15) — matérialisent les limites des bandes pour qu'on voie d'un coup d'œil où chacune commence et finit :
- 6 rect verticaux occupant toute la hauteur de la grille (y=125 → 337).
- Gradient froid → chaud (convention spectrogramme) :
  - Sub-graves : `rgba(74,63,140,0.18)` (indigo)
  - Graves : `rgba(31,79,135,0.16)` (navy)
  - Bas-médiums : `rgba(31,120,71,0.14)` (vert profond)
  - Médiums : `rgba(92,122,31,0.13)` (olive)
  - Haut-médiums : `rgba(151,101,26,0.15)` (ambre brun)
  - Aigus : `rgba(135,39,31,0.16)` (crimson)
- Couleurs choisies pour ne pas entrer en conflit avec les 4 couleurs des lanes (teal Voix / purple Instruments / pink Basse / coral Batterie).
- Ces zones se superposent sous les lane backgrounds — la superposition crée une teinte mixte 2D (bande × élément) qui reste subtile.
- **Clippées aux 4 zones de lanes uniquement** via un `<clipPath>` SVG (v15) : les interlignes (gaps de 12 px entre lanes) restent transparents, ce qui crée un rythme visuel "rangées colorées vs espaces noirs" et renforce la présence des bandes de masquage qui, elles, traversent toute la hauteur.

(Les mockups v1-v13 utilisaient les libellés anglais pour rapidité — à remplacer par les libellés FR ci-dessus en prod.)

### Lanes (envelopes spectrales)
- Couleurs (stroke / fill) :
  - Voix : `#5DCAA5` (teal) — fill `rgba(93,202,165,0.20)`
  - Instruments : `#7F77DD` (purple) — fill `rgba(127,119,221,0.20)`
  - Basse : `#ED93B1` (pink) — fill `rgba(237,147,177,0.18)`
  - Batterie : `#F0997B` (coral) — fill `rgba(240,153,123,0.20)`
- Backgrounds de lane (rect bg derrière les enveloppes) : même teinte à opacity 0.035-0.04 — détache les lanes du fond sombre sans alourdir.
- Stroke-width 1.5 sur l'enveloppe, stroke-linejoin round.

### Bandes de masquage
- Rect vertical traversant toute la hauteur de la grille (y=125 à y=337). Largeur dépend de la fréquence (typiquement 30-80 px en log scale, correspondant à environ ±25 % autour de la fréquence centrale).
- Fill via linearGradient horizontal :
  - Stops 0 % / 18 % / 82 % / 100 % pour fade-in / plateau / fade-out
  - Plateau opacity : 0.13 (conflit mesuré orange), 0.09 (conflit qualitatif orange), 0.12 (absence bleue)
- Bandes en arrière-plan visuel au repos, deviennent dominantes au focus par contraste relatif (les autres éléments dim à 0.16).

### Types de conflits

**Mesuré** (delta dB chiffré entre deux éléments)
- Markers : dot plein 3.6 px radius sur chaque lane impliquée, `fill: #EF9F27`, `stroke: #0d1015 1.2 px`.
- Texte dB inline à côté de chaque dot (ex : "Basse −10 dB").
- Chip d'annotation en haut : `{freq} · {élément A} vs {élément B} · Δ {n} dB`.
- Bande gradient orange à opacity plateau 0.13.

**Qualitatif** (identifié par diagnostic LLM, non mesurable, typiquement intra-stem voix)
- Marker à bordure pointillée (`stroke-dasharray: 2 2`), `fill: rgba(239,159,39,0.5)`.
- Pas de texte dB inline.
- Chip d'annotation avec bordure pointillée : `{freq} · {élément A} vs {élément B}` (pas de delta).
- Bande gradient orange à opacity plateau 0.09 (plus faible que mesuré).

**Absence** (manque d'air, manque de présence, masque inversé)
- Marker cercle ouvert (fill none) bleu (`#85B7EB`) à bordure pointillée.
- Texte "absent · −{n} dB" (niveau indicatif).
- Chip bleue : `{freq} · Manque d'air · −{n} dB`.
- Bande gradient bleue à opacity plateau 0.12.

### Pulse radar
- Chaque marker de conflit a un cercle de pulse derrière lui (SVG SMIL `<animate>`).
- Animation : `r` de 3.6 ou 4.5 px vers 11 ou 13 px, `opacity` de 0.55 vers 0, durée 2.4 s, `repeatCount="indefinite"`.
- Délais décalés entre les 4 markers (0 s, 0.7 s, 1.4 s, 2.1 s) pour éviter le clignotement synchro et donner une lecture séquentielle.
- Stroke = couleur du conflit (`#EF9F27` orange ou `#85B7EB` bleu), `stroke-width: 1.4`, `fill: none`.

### Hover focus
- Hover sur une chip **ou** sur une zone invisible (`fr-hover-zone`) traversant toute la hauteur d'une bande déclenche le focus du conflit correspondant.
- Effets au focus :
  - Lanes non impliquées → opacity 0.16
  - Autres bandes → opacity 0.16
  - Autres markers, pulses, chips → opacity 0.16
  - L'élément actif (lane, bande, marker, pulse, chip) reste à opacity 1
- Transition CSS 0.2 s ease sur tous les éléments.
- Bidirectionnel : chip ↔ bande pointent vers le même `data-conflict`.

### Seuil de masquage adaptatif
- Par défaut : **10 dB** (règle de pouce ingés son, écart suffisant pour que l'oreille sépare deux éléments).
- Adapté à l'intention artistique déclarée (`tracks.artistic_intent` / `versions.version_intent`) :
  - Mix dense voulu (rock, metal, shoegaze) → 6-7 dB
  - Aéré voulu (jazz acoustique, folk intime, ambient) → 13-15 dB
  - Pop / EDM / variété → 10 dB
  - Hip-hop → variable selon sub-genre (trap vs boom-bap)
- Détermine la sévérité affichée du conflit (LOW / MED / HIGH).

---

## 3. Pipeline backend nécessaire

1. **Séparation de stems** — sortie 4 stems (vocal / drums / bass / other). Réutilise le pipeline DSP existant (cf. `docs/DSP_PLAN.md`).
2. **FFT par stem** — signature spectrale moyenne sur la durée utile du morceau (hors silence début/fin), ramenée à une enveloppe en bandes log (1/12 d'octave par défaut, à ajuster si trop accidenté).
3. **Détection des collisions** — pour chaque paire de stems et chaque bande critique, calcul du delta de niveau (`max stem A − max stem B` sur la fenêtre).
4. **Filtre par seuil adaptatif** — `delta < seuil(intention)` → conflit candidat.
5. **Recoupement avec le diagnostic LLM** — ne garder que les conflits aussi identifiés textuellement (pour cohérence diagnostic ↔ viz). Les conflits intra-stem (qualitatifs) sont ajoutés depuis le diagnostic avec flag `qualitative: true`.

### Schéma JSON attendu par le front

```json
{
  "stems": ["voix", "instruments", "basse", "batterie"],
  "envelopes": {
    "voix":        [{"hz": 20, "db": -36}, ..., {"hz": 20000, "db": -36}],
    "instruments": [...],
    "basse":       [...],
    "batterie":    [...]
  },
  "conflicts": [
    {
      "id": "104hz",
      "freq_center": 104,
      "freq_range": [80, 130],
      "lanes": ["basse", "batterie"],
      "delta_db": 2,
      "type": "mesure",
      "color": "orange",
      "severity": "low"
    },
    {
      "id": "200hz",
      "freq_center": 200,
      "freq_range": [180, 240],
      "lanes": ["voix"],
      "type": "qualitatif",
      "color": "orange",
      "severity": "low"
    },
    {
      "id": "11khz",
      "freq_center": 11000,
      "freq_range": [9000, 13000],
      "lanes": ["batterie"],
      "level_db": -34,
      "type": "absence",
      "color": "blue",
      "severity": "low"
    }
  ],
  "threshold_used_db": 10,
  "intention": "french_pop_voix_lead"
}
```

---

### Cartouche pédagogique (sous le SVG)

Wording définitif :

> **Comment lire le masquage**
> Hauteur = énergie spectrale en dB (0 en haut, −36 en bas). Deux éléments cohabitent sans tension quand leur delta dépasse 10 dB. Sous ce seuil sur une bande critique, l'oreille ne sépare plus les deux — la bande ambrée matérialise la zone, ses bords flous reflètent l'étalement spectral du masquage.

Style : encart à gauche bordé d'une ligne ambrée 2 px, fond `rgba(239,159,39,0.05)`, padding 0.75rem 1rem, font 12, color `rgba(255,255,255,0.7)`, line-height 1.55.

---

## 3bis. Mode simulation — preview de solution

Décidé en session du 18 mai 2026 : **on transforme la viz d'un outil de diagnostic en outil de conception assistée**. L'utilisateur ne voit plus seulement les conflits, il peut visualiser à quoi ressemblerait le mix après application des recommandations.

### Mode A — Preview au survol (retenu pour MVP)

Au hover ou tap sur la chip d'un conflit (ou sur sa zone), la viz montre la courbe cible des stems concernés en superposition (pointillé teal/coral selon la lane), pendant ~600 ms de transition. Effets simultanés :

- Les enveloppes des lanes concernées morphent vers leur silhouette post-EQ.
- La bande de masquage ambrée s'estompe vers transparent.
- Un mini-tooltip apparaît à côté de la chip : `Δ 2 dB → Δ 12 dB · +3 pts au score`.
- Au mouseleave / second tap, retour à l'état actuel.

Avantages : préview localisée (pas de promesse globale), faible coût pédagogique (l'utilisateur voit "ce que ce conflit donnerait corrigé"), faible coût technique (~1-2 jours de dev).

### Calcul des courbes cibles côté backend

Voie retenue : **simulation DSP** par fonction biquad sur les FFT des stems.

- Pour chaque recommandation chiffrée du rapport (ex : "EQ soustractif à 100-120 Hz, Q 2.0, -2 à -3 dB"), parser les paramètres (fréquence, Q, gain, type) → appliquer la formule biquad sur la FFT du stem concerné → sortir la courbe modifiée.
- Pour les recommandations à plage de valeurs (`-2 à -3 dB`), prendre la médiane (`-2.5 dB`).
- Recalculer le delta projeté entre les stems concernés sur les courbes modifiées.
- Recalculer le score projeté en passant les courbes modifiées dans la même fonction de scoring qu'aujourd'hui.

### Format JSON enrichi pour le mode A

```json
"conflicts": [
  {
    "id": "104hz",
    "freq_center": 104,
    "lanes": ["basse", "batterie"],
    "delta_db": 2,
    "type": "mesure",
    "preview": {
      "envelopes_after": {
        "basse":    [{"hz": 20, "db": -36}, ..., {"hz": 20000, "db": -36}],
        "batterie": [{"hz": 20, "db": -36}, ..., {"hz": 20000, "db": -36}]
      },
      "delta_after_db": 12,
      "score_delta_estimate": 3
    }
  }
]
```

### Limites du mode A (à doser)

- **Recommandations non chiffrées** (recos qualitatives type "affiner légèrement") : non simulables → la chip du conflit ne déclenche pas de preview, juste le hover focus.
- **Recommandations non-EQ** (compression, stéréo widening, saturation) : exclues du MVP. Simuler une compression sur une FFT moyenne est mal défini (la compression dépend de la dynamique temporelle). À reconsidérer en évolution.
- **Cumul de plusieurs recos sur un même stem** : les biquads en cascade s'additionnent en dB (approximation linéaire, valable au premier ordre). Vérifier sur quelques mix réels avant push prod.

### Évolutions reportées au backlog

**Mode B — Toggle global "Actuel / Cible"** : bascule au-dessus de la viz qui applique simultanément toutes les recommandations chiffrées. Score projeté affiché en grand. Effort estimé ~1 semaine de dev parce qu'il partage l'infrastructure backend avec le mode A. Risque pédagogique moyen (sur-promesse). À évaluer après le retour utilisateurs sur le mode A.

**Mode C — Roadmap interactive** : cocher les recos une à une dans le rapport, voir la viz évoluer en direct. Effort ~2-3 semaines. Risque pédagogique élevé. Long terme uniquement.

---

## 4. Limites assumées

- **Pas de séparation lead vs chœurs au niveau visuel.** Les conflits intra-stem voix sont annotés "qualitatifs", sans chiffrage. Acceptable parce que ces conflits restent fréquemment des polishs (`[LOW]`), rarement bloquants.
- **Pas de représentation du défaut stéréo** (corrélation L/R, mid/side ratio). C'est une métrique transverse aux fréquences — à traiter par un widget complémentaire dédié (à spécifier séparément, peut-être un polar plot ou un graphe de corrélation par bande).
- **Couleurs et opacités calibrées pour fond sombre uniquement.** Le thème clair éventuel demandera un re-look (opacités à monter, contrastes à inverser).
- **Pas d'interaction tactile dans la spec actuelle.** Le hover ne se traduit pas tel quel sur smartphone — à porter sous forme de tap-to-focus.

---

## 5. Questions ouvertes

- **Forme stylée des courbes réelles** — les enveloppes du mockup sont synthétiques et lisses. En prod, la FFT donne des courbes plus accidentées (peaks, creux, dentelures fines). Faut-il lisser systématiquement (smoothing window), à quelle résolution (1/3, 1/6 ou 1/12 d'octave) ? À tester sur 10-15 morceaux pour calibrer.
- **Mobile / tactile** — sur smartphone, le hover n'existe pas. Options : tap sur chip = état actif persistant jusqu'au prochain tap ailleurs ; vue stackée verticalement ; longue pression sur bande pour focus.
- **Hover sub-fréquentiel libre** — aller plus loin que le focus par conflit. Permettre le survol n'importe où dans la grille pour afficher les niveaux dB des 4 stems à cette fréquence, avec une ligne verticale qui suit la souris. Améliorerait l'exploration mais charge la viz.
- **Mode "tous les conflits"** — afficher en permanence les sévérités (un mix dense a beaucoup de bandes, un mix propre n'en a presque aucune). Code couleur sévérité (LOW orange clair / MED orange moyen / HIGH rouge).
- **Animations supplémentaires** — animer l'apparition de la viz au chargement (enveloppes qui se dessinent en 800 ms) ? Risque de gimmick si surutilisé, à arbitrer.
- **Cohabitation avec la frequency balance map du rapport Versions actuel** — la map existante (par bandes 6 catégories) reste-t-elle en complément ou est-elle remplacée par cette viz ? Probablement la garder en survol synthétique et déplier la nouvelle sur clic.

---

## 6. Référence visuelle

Mockup final : v13 de la session Cowork du 2026-05-18. Les itérations v1 → v13 ont posé successivement :
- v1-v3 : structure générale (lanes par élément vs bandes spectrales)
- v4-v5 : axe Y mesurable en dB + bandes de masquage avec dégradé
- v6 : bandes pleine hauteur (vs uniquement entre lanes contiguës)
- v7 : atténuation des bandes (passage en arrière-plan visuel)
- v8 : retrait de toute mention de service technique tiers
- v9-v11 : franchissement complet du vocabulaire (Voix · Instruments · Basse · Batterie)
- v12 : double quadrillage (vertical + horizontal) et échelle dB sur la seule lane Voix
- v13 : labels bandes spectrales + pulse radar sur les markers + backgrounds de lane teintés

---

## Liens

- `docs/DSP_PLAN.md` — pipeline DSP existant (BPM/key/LUFS/stems).
- `docs/aubiomix_snapshot_2026-05-18.md` — comparaison concurrentielle qui a motivé cette viz.
- `docs/audit_aubiomix.md` — audit fond de mai 2026.
