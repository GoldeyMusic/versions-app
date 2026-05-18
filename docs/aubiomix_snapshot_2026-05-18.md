# AubioMix — snapshot comparatif post-audit
*David Berdugo · 18 mai 2026 · Comparaison directe sur le même titre (Comme un rêve / Goldey — mix 8 non masterisé, French pop, vocal)*

Complète l'audit du 26 avril (`audit_aubiomix.md`) avec une comparaison point à point des deux rapports sur le même morceau, après ~3 semaines de retravail produit chez AubioMix. Sources : PDF AubioMix exporté depuis `aubiomix.com/report/50e3617c-f36d-…`, PDF Versions du mix 8, captures du flow d'upload AubioMix.

---

## TL;DR

- **Scores divergents sur le même mix** : AubioMix **57/100** ("Demo-Level Mix · Amateur engineers") vs Versions **83/100**. Le mix sonne pro à l'écoute → la sévérité d'AubioMix est probablement injuste sur ce cas, mais elle crée un standard perçu "exigeant" qui peut peser sur la perception Versions ("trop gentil").
- **AubioMix a fait un vrai bond sur la présentation du rapport** : breakdown granulaire en 9 sous-scores, histogramme spectral coloré avec annotations directes des pics, cards "réglages compression" structurées, score bands narratives avec positionnement social, peer comparison par genre.
- **Versions garde un avantage net sur la voix et la culture musicale** : verdict en prose littéraire, analyse harmonique (tonalité, fondamentale), diagnostic par élément musical (Voix/Chœurs/Basses…), pédagogie mix vs master, plugins réels nominatifs.
- **Les leviers à activer sont surtout visuels et structurels** — pas du DSP, du polish de présentation.

---

## 1. Le delta de score 57 vs 83 — lecture stratégique

AubioMix tape plus dur. Sur ce mix non masterisé qui sonne déjà pro (Versions l'écrit explicitement dans son verdict), ils descendent à 57 ("Demo-Level"). Leur ventilation :

- Mix Craft global : 48 — Tonal Balance 49, Frequency Masking **42**, Stereo Width 50, Mix Balance 48, Dynamics 50, FX 50.
- Technical Integrity : 94 — Clipping 98, Noise 90, Crest Factor 50.

Leur score plafonne sur Mix Craft à 48 alors qu'aucun élément individuel n'est en dessous de 42. C'est mécaniquement très sévère sur les défauts cumulés.

**Risque pour Versions** : si AubioMix devient référence dans la communauté, leur dureté installe un standard perçu. Versions peut passer pour "le service qui flatte".

**Protection Versions** : le palier "Prêt pour le mastering" est verrouillé par des checks objectifs (mono compat, head-room, clipping). Notre seuil exigeant existe, il est juste réparti différemment. À mettre encore plus en avant — un mix peut avoir 83/100 ET ne pas être "Prêt pour le mastering". Ce découplage est notre rigueur calibrée.

---

## 2. Où AubioMix a clairement progressé depuis l'audit du 26 avril

### Sur la présentation du rapport (gros bond visuel)

**Score breakdown granulaire** — 9 sous-scores immédiatement lisibles, groupés en Mix Craft / Technical Integrity. En 3 secondes on sait où ça pèche. Versions a son score par élément musical (Voix, Basses, Drums…) qui est meilleur pour un artiste, mais on perd la lecture "techno" rapide.

**Histogramme spectral coloré + annotations sur le graph** — barres par bande (Sub/Bass/Low-Mid/Mid/Hi-Mid/Highs) avec code couleur In Range / Too High / Too Low, et les pics problématiques annotés directement sur la map fréquentielle (237Hz · Sustained mid-range vs Vocal, 119Hz · Slight booming, 6.9kHz · Lack of presence). C'est pédagogique et visible. Versions a la Frequency Balance Map en web — à pousser dans le PDF avec annotations.

**Cards "réglages recommandés" structurées** — pour la compression vocale et la bus comp, mini-carte ATK / REL / Ratio / GR / Type (Opto / VCA). Versions a tout ça dans le texte des actions mais c'est noyé dans la prose.

**Score Bands narratives** — 90-100 World-class / 80-89 Hit record mix engineers / 65-79 Professional / 50-64 Amateur / 30-49 New to mixing / 0-29 New to mixing. Ils situent socialement, pas que numériquement. Versions a "Prêt pour le mastering" mais pas le tier social.

**Peer comparison** — "Your Mix vs Your Peers' Mixes - French Pop Peers". Comparaison statistique vs cohorte du genre. Vrai différenciateur quand la base est suffisante.

**PDF type "rapport pro"** — cover page, table des matières (Mix Overview, Mix Notes & Recommendations, Detailed Analysis, Technical Measurements), pagination 1/9 … 9/9, footer "AubioMix · Professional Mix Analysis · www.aubiomix.com" sur chaque page. Notre PDF Versions est plus condensé (3 pages efficaces) mais peut paraître moins "officiel" pour un usage label / management.

### Sur l'UX d'upload (3 ajouts)

**Track Type étendu** — Vocal Mix / Instrumental Mix / Live Recording. Versions a vocal / DAW (+ mastered y/n via la 021). Ajouter "instrumental" et "live" calibrerait l'analyse différemment.

**Auto-detect** — pour le genre ET pour mastered y/n, option "Auto-detect". Geste d'accueil pour l'utilisateur qui ne sait pas.

**Reference Mix derrière paywall** — upload d'un track de référence pour comparer (subscription only). Upsell que Versions n'a pas dans ses plans Stripe.

### Sur l'engagement

**Persona humain qui endosse** — "Aubrey's Pick: LA-2A style compressor, Valhalla VintageVerb, EchoBoy" + signature Aubrey Whitfield (`@aubreywhitfield`). Trust signal puissant.

**"Ready to improve?" sticky** — encart en bas à droite toujours visible, "Upload Revised Mix to compare against this version". Drive le retour. Versions a la pill chat, pas l'upload pill.

**"Report an issue" bouton dédié** — sur la fiche, signale un bug d'analyse. Feedback loop encouragé.

---

## 3. Ce que Versions garde comme avantage net (à ne pas perdre)

- **Verdict en prose littéraire en intro** — *"Comme un rêve sonne déjà de manière professionnelle, avec une voix bien posée, une batterie dynamique et un arrangement riche qui tient sur toute la durée. Le principal point à reprendre avant d'envoyer au mastering : l'image stéréo réelle est beaucoup plus étroite que ce que l'oreille perçoit…"* — exactement ce que dirait un ingé son qui vient d'écouter. AubioMix n'a rien d'équivalent, ils balancent des barres et des recommandations.
- **Analyse harmonique** — *"En Ab majeur, la fondamentale de la basse gravite autour de 104 Hz"* → AubioMix ne fait pas ça. Culture musicale, pas du DSP.
- **Diagnostic par élément musical** — Voix / Chœurs / Basses & Kick / Drums / Spatial / Master, là où AubioMix range par axe technique (Tonal Balance / Frequency Masking). La logique Versions parle à un arrangeur.
- **Pédagogie mix vs master** — *"Le LUFS intégré à -24.7 est normal pour un mix non masterisé : ce n'est pas le rôle du mix d'atteindre la loudness streaming finale. Avant d'envoyer au mastering, vérifie que le bus master ne dépasse pas -3 dBFS sur les peaks les plus forts et qu'aucun plugin de limiting n'est actif sur le bus master - laisse cette marge au mastering engineer"*. AubioMix met juste un tag "Unmastered".
- **Ton "l'écoute confirme…"** — positionnement métier humain. Eux écrivent en mode descriptif neutre.
- **Suivi inter-versions** — EvolutionBanner + score smoothing pour reconnaître la progression. Chez AubioMix le bandeau "Scored independently — not linked to your previous upload" montre qu'ils y pensent mais c'est le fallback (besoin du même titre / fingerprint).
- **Plugins réels nommés à chaque action** — FabFilter Pro-Q 4, Pro-DS, Pro-L 2, Valhalla VintageVerb, Waves Transient Shaper. AubioMix nomme aussi mais beaucoup plus rarement (3-4 picks dans le rapport entier).

---

## 4. Leviers à activer — priorisés

### Haute priorité (combler le gap visuel)

1. **Score breakdown technique en plus du score artistique** — ajouter dans la verdict row un mini-encart 4-6 barres (Tonal / Stéréo / Dynamique / Master / Bruit) qui donne la lecture "techno" rapide, sans toucher au scoring par élément musical. Lecture en 3 secondes.
2. **Histogramme de balance fréquentielle dans le PDF** — la map web existe, pousser dans le PDF avec les pics annotés directement.
3. **Cards "réglages compression"** — extraire ATK/REL/Ratio/GR/Type dans une mini-carte à la fin de chaque action dynamique. Réutilisable côté DAW.
4. **Score Band social** — afficher à côté du "Prêt pour le mastering" un palier type "Niveau pro confirmé" / "Niveau hit potential" / etc. Situer socialement.

### Moyenne priorité (différenciation)

5. **Persona qui signe le rapport** — l'oreille de Versions a besoin d'un visage. Une signature en bas du verdict ("Analyse signée : l'oreille Versions" ou un nom de fiction). Branding, pas dialogue — respecte la règle "pas de simulation relationnelle".
6. **Track Type étendu** — ajouter Instrumental Mix + Live Recording au toggle d'upload. Calibrer les recettes derrière.
7. **Peer comparison par genre** — "Votre mix vs autres mix French Pop sur Versions" — faisable quand l'historique est suffisant.

### Basse priorité (polish)

8. **PDF format long en option** — garder le 3 pages condensé en défaut, proposer un "Rapport détaillé" PDF (cover, ToC, pagination) pour les plans payants.
9. **"Upload Revised Mix" sticky** — encart toujours visible sur la fiche, pas que le chat pill.
10. **Reference Mix premium** — upsell payant pour uploader un mix de référence à comparer.

---

## 5. Angle de communication (à manier finement)

Le score de 57 chez eux peut devenir un argument Versions. Un comparatif transparent du type *"Voici pourquoi Versions a noté Comme un rêve à 83 quand AubioMix l'a noté 57"* avec la pédagogie du seuil mastering vs scoring linéaire transforme leur sévérité en notre rigueur calibrée.

À manier finement — pas de bash frontal. Plutôt un post de blog / page comparative qui explique la philosophie des deux approches, montre qu'on connaît le concurrent, et invite l'utilisateur à juger par lui-même.

---

## 6. Annexe — éléments du flow d'upload AubioMix observés

- **Single Upload / Upload an Album** toggle (Album = plan payant).
- **Track Type** : Vocal Mix / Instrumental Mix / Live Recording.
- **Has your track been mastered?** : Yes / No / **Auto-detect**.
- **Genre** : dropdown + lien "Not sure? Analyse my genre for me" → modale "Detect My Genre" avec analyse audio.
- **Reference Mix (Optional)** : derrière paywall "Upgrade to a subscription plan to compare your mixes against reference tracks of your choice. View Plans →".
- **Confirmation copyright** : checkbox obligatoire avant upload.
- **Modale upload** : barre de progression MB / MB + %, "Please keep this tab open and don't navigate away during upload", bouton "Cancel Analysis".
- **Modale analyse** : barre de progression + étapes narratives qui changent ("Extracting frequency data…" → "Evaluating stereo field & depth…" → "Scanning for noise & artefacts…"), info "Average analysis time is 2-4 minutes. This may take longer during busier periods - thank you for your patience".
- **Étapes d'analyse narratives** : à reprendre dans le LoadingScreen Versions si pas déjà aligné sur le pipeline réel.

---

## 7. Liens vers les annexes locales

- Rapport AubioMix exporté : `~/Library/.../uploads/AubioMix_Report_Comme_un_rêve.pdf` (9 pages, anglais)
- Rapport Versions exporté : `~/Library/.../uploads/Comme_un_reve_mix_8.pdf` (3 pages, français)
- Captures du flow d'upload AubioMix : conversation Cowork du 2026-05-18
