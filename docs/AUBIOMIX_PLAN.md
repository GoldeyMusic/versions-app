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

- [ ] **1.1 — Format des notes (decode-api)**
  Modifier le prompt pour imposer un schema strict : `{section, priority(high/med/low), title, why, how(avec valeurs Hz/dB/Q/ratio/attack/release/GR), plugin_pick}`. Référence : §6.3 et §8.1 de l'audit. Effet : chaque note devient actionnable comme chez AubioMix (ex. *"compress vocal: 2:1, 10-20ms attack, 80-120ms release, 2-4dB GR"*).

- [ ] **1.2 — Page `/comment-on-evalue`**
  Équivalent francophone du `/evaluation-framework` d'AubioMix. 1500-2500 mots, prose + encadrés. Décrit notre méthodologie : axes évalués, pondérations, gates, ce qu'on mesure objectivement vs ce qui relève du jugement IA. Effet : autorité, SEO, trust. **À écrire à 2 mains avec David** (ne jamais citer Gemini/Claude — cf. `feedback_no_source_citations`).

## Tier 2 — Engagement + viralité (semaine 2)

- [ ] **2.1 — Checklist cochable sur les notes du rapport**
  Front : cases cliquables sur chaque note. Backend : persister l'état dans Supabase (table `mix_note_completions` par exemple). UI : compteur "X/N completed (Y%)" en haut de la section Notes. Effet : engagement (l'utilisateur revient pour cocher) + base pour le futur *advice-followed locking* (Tier 4).

- [ ] **2.2 — Score Card image téléchargeable**
  Canvas → PNG. Format carré 1080×1080 partageable Insta/X. Doit contenir : titre, score global, tier (avec couleur), 3 sub-scores principaux, watermark Versions. Bouton "Télécharger ma Score Card" sur la fiche.

## Tier 3 — Vitrine (semaines 3-4)

- [ ] **3.1 — Refonte home : séparer landing publique vs dashboard connecté**
  - **Landing publique (déconnecté)** : hero avec mockup rapport intégré (PAS juste promesse texte) + 5-7 cartes bénéfices (pas 13 comme AubioMix) + How It Works 4-5 étapes + bloc trust persona + pricing + footer riche.
  - **Dashboard connecté compte neuf** : un seul gros bloc *"Analysez votre 1er morceau"* 80% écran. À 3+ analyses : timeline + percentile par genre (à activer quand cohorte suffisante) + récents.

- [ ] **3.2 — Page `/exemple-de-rapport` (sample report public)**
  Route accessible sans signup, montre la profondeur réelle d'un rapport (mock data réaliste). Lien depuis la landing. Référence : structure du sample d'AubioMix mais avec un morceau francophone et notre angle "intention artistique" en première section.

## Tier 4 — Fidélisation + différenciation algo (mois 2)

- [ ] **4.1 — Score floor protection en révision**
  Max -3 points overall, max -5 par sub-score sauf dégradation prouvée par DSP. Réponse directe à "j'ai amélioré et le score baisse". Référence : §5.1 de l'audit.

- [ ] **4.2 — Advice-followed locking**
  S'appuie sur la checklist (2.1). Si une reco est cochée comme implémentée, le sub-score concerné est verrouillé à la baisse en révision suivante.

- [ ] **4.3 — Release Readiness verdict**
  Bandeau en haut du rapport : "Prêt à sortir / Presque / Pas encore" avec liste des blocants exacts. Conditions inspirées d'AubioMix (score ≥ X, pas de notes critiques outstanding, technical integrity ≥ Y, etc.) à calibrer.

- [ ] **4.4 — Plateau detector**
  Si v(n) ≈ v(n-1) sur 6+ critères statistiques (overall ±2, sub-scores ±3, LUFS ±0.5, crest ±0.5, bandes spectrales ±2%) → proposer "marquer comme finale". Badge "Final" sur la fiche, filtre dashboard.

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
