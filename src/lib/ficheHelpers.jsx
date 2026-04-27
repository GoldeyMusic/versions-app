// Petits utilitaires partagés entre FicheScreen (privé) et PublicFicheScreen
// (lien public lecture seule). Extraits pour satisfaire la règle
// react-refresh/only-export-components : un fichier de composants ne doit
// exporter que des composants, les fonctions utilitaires vivent à côté.

// Reproduit `diagItemKey` de FicheScreen pour que les helpers puissent
// re-construire la cle d un item sans dependre du composant.
function buildItemKey(catId, item, idx) {
  if (item?.id) return String(item.id);
  const head = (item?.title || '').slice(0, 60);
  return `${catId || 'cat'}::${idx}::${head}`;
}

// ────────────────────────────────────────────────────────────────────
// computeReleaseReadiness (ticket 4.3)
//
// A partir d une fiche et de l ensemble des items "implementes" (cf.
// checklist 2.1), calcule un verdict de pret-a-sortir en 3 paliers :
//   - 'ready'   → score >= 80 ET tous les items high-prio sont coches
//   - 'almost'  → score >= 70 ET <= 2 items high-prio non-coches
//   - 'not-yet' → tout le reste (score < 70, ou trop d items high-prio
//                 non resolus)
//
// Retourne { tier, score, blockers[], totalHigh, uncompletedHigh }.
// Les blockers contiennent { kind: 'score'|'item', text?, cat?, title? }.
// ────────────────────────────────────────────────────────────────────
export function computeReleaseReadiness(fiche, completedItems = new Set()) {
  const completed = completedItems instanceof Set
    ? completedItems
    : new Set(Array.isArray(completedItems) ? completedItems : []);
  const score = typeof fiche?.globalScore === 'number' ? fiche.globalScore : null;
  const elements = Array.isArray(fiche?.elements) ? fiche.elements : [];

  let totalHigh = 0;
  const itemBlockers = [];

  elements.forEach((el, eIdx) => {
    const items = Array.isArray(el?.items) ? el.items : [];
    items.forEach((it, iIdx) => {
      if (!it) return;
      const prio = (it.priority || '').toString().toLowerCase();
      if (prio !== 'high') return;
      totalHigh += 1;
      const catId = el?.id || el?.cat || `cat${eIdx}`;
      const key = buildItemKey(catId, it, iIdx);
      if (!completed.has(key)) {
        itemBlockers.push({
          kind: 'item',
          cat: el?.cat || '',
          title: it.title || it.label || '',
        });
      }
    });
  });

  const uncompletedHigh = itemBlockers.length;

  const blockers = [];
  if (score != null && score < 70) {
    blockers.push({
      kind: 'score',
      text: `Score global ${score}/100 — viser ≥ 80 pour une sortie sereine.`,
    });
  }
  blockers.push(...itemBlockers);

  let tier;
  if (score != null && score >= 80 && uncompletedHigh === 0) tier = 'ready';
  else if (score != null && score >= 70 && uncompletedHigh <= 2) tier = 'almost';
  else tier = 'not-yet';

  return { tier, score, blockers, totalHigh, uncompletedHigh };
}

export function renderWithEmphasis(text) {
  if (!text) return null;
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((p, i) =>
    p.startsWith('*') && p.endsWith('*') && p.length > 2
      ? <em key={i}>{p.slice(1, -1)}</em>
      : <span key={i}>{p}</span>
  );
}

// Formate un timestamp en texte humain : "il y a N jours" / "hier" / "le X avril".
// Retourne null si la date n'est pas interprétable.
export function formatAnalyzedAt(input) {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'Analysé à l\u2019instant';
  if (diffMin < 60) return `Analysé il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `Analysé il y a ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  if (diffD === 1) return 'Analysé hier';
  if (diffD < 30) return `Analysé il y a ${diffD} jours`;
  try {
    const f = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    return `Analysé le ${f.format(d)}`;
  } catch {
    return `Analysé le ${d.toLocaleDateString('fr-FR')}`;
  }
}

// Sépare un texte en (1ʳᵉ phrase → titre) + (reste → paragraphe).
// Retourne { headline, rest } ; rest peut être vide.
export function splitVerdict(text) {
  if (!text) return { headline: '', rest: '' };
  const m = text.match(/^([^.!?]*[.!?])\s+(.*)$/s);
  if (m) return { headline: m[1].trim(), rest: m[2].trim() };
  return { headline: text.trim(), rest: '' };
}

// Normalise un item de diagnostic pour absorber l'évolution de schéma
// backend (ticket 1.1) : ancien { label, detail, tools[], score /10 }
// → nouveau { title, why, how, plugin_pick, priority, score /100 }.
// Heuristique d'échelle : score > 10 ⇒ déjà /100, sinon ×10.
export function normalizeDiagItem(it) {
  if (!it || typeof it !== 'object') return it;
  const rawScore = typeof it.score === 'number' ? it.score : null;
  const score100 = rawScore == null
    ? null
    : (rawScore > 10 ? Math.round(rawScore) : Math.round(rawScore * 10));
  const how = it.how
    || (Array.isArray(it.tools) && it.tools.length ? it.tools.join(' · ') : '');
  return {
    ...it,
    title: it.title || it.label || '',
    why: it.why || it.detail || '',
    how,
    plugin_pick: it.plugin_pick || '',
    priority: (it.priority || '').toLowerCase(),
    score: score100,
  };
}

// Détecte si une catégorie de diagnostic concerne la voix.
// Robuste aux variantes de casse et aux éventuels synonymes.
export function isVoiceCategory(cat) {
  const s = (cat || '').toString().trim().toLowerCase();
  return s === 'voix' || s === 'voice' || s === 'vocal' || s === 'voice/vocal' || s.startsWith('voix');
}

/**
 * Adapte une fiche d'analyse au type vocal du titre.
 *
 *  - 'vocal' : aucun changement.
 *
 *  - 'instrumental_pending' : aucune suppression (la voix est une étape
 *    à franchir qui doit rester dans le diag et peser sur le score),
 *    mais on signale à l'UI de relabeler la catégorie voix via
 *    voiceLabelOverride.
 *
 *  - 'instrumental_final' : on retire la catégorie VOIX du diagnostic,
 *    on retire les items du plan d'action dont tous les linkedItems
 *    sont dans la catégorie VOIX, et on recalcule le globalScore en
 *    prenant la moyenne des item.score restants (si au moins un score
 *    est disponible ; sinon on conserve l'original).
 *
 * Retourne { elements, plan, globalScore, voiceLabelOverride }.
 * Fonction pure : ne mute pas les entrées.
 */
export function applyVocalTypeToFiche(fiche, vocalType) {
  const elements = Array.isArray(fiche?.elements) ? fiche.elements : [];
  const plan = Array.isArray(fiche?.plan) ? fiche.plan : [];
  const globalScore = typeof fiche?.globalScore === 'number' ? fiche.globalScore : null;

  if (vocalType === 'instrumental_final') {
    const voiceItemIds = new Set();
    elements.forEach((el) => {
      if (isVoiceCategory(el?.cat)) {
        (el?.items || []).forEach((it) => { if (it?.id) voiceItemIds.add(it.id); });
      }
    });
    const filteredElements = elements.filter((el) => !isVoiceCategory(el?.cat));
    const filteredPlan = plan.filter((p) => {
      const ids = Array.isArray(p?.linkedItemIds) ? p.linkedItemIds : [];
      if (!ids.length) return true; // pas de lien explicite → garde (on ne peut pas trancher)
      return !ids.every((id) => voiceItemIds.has(id)); // retire si tous les liens sont dans VOIX
    });
    const scores = filteredElements
      .flatMap((el) => (el?.items || []).map((it) => normalizeDiagItem(it)?.score))
      .filter((s) => typeof s === 'number');
    const recomputed = scores.length
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : globalScore;
    return {
      elements: filteredElements,
      plan: filteredPlan,
      globalScore: recomputed,
      voiceLabelOverride: null,
    };
  }

  if (vocalType === 'instrumental_pending') {
    return {
      elements,
      plan,
      globalScore,
      voiceLabelOverride: 'VOIX À VENIR',
    };
  }

  return { elements, plan, globalScore, voiceLabelOverride: null };
}
