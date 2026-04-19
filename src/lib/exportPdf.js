// Export d'une fiche VERSIONS en PDF partageable.
// Pure client : jsPDF, pas d'appel serveur, pas de capture DOM.
// L'utilisateur choisit dans la modale d'export les sections à inclure :
//   qualitatif · diagnostic · plan · notes
// Le rendu est texte, vectoriel, sobre — optimisé pour partage par mail.

import { jsPDF } from 'jspdf';

// ── Palette (alignée sur la charte Versions) ──────────────
const COLORS = {
  bg: [255, 255, 255],
  text: [20, 20, 22],
  subtle: [120, 120, 125],
  muted: [160, 160, 165],
  rule: [220, 220, 225],
  orange: [245, 176, 86],
  green: [122, 196, 142],
  redSoft: [239, 107, 107],
};

// ── Géométrie page A4 ─────────────────────────────────────
const PAGE = { w: 210, h: 297 };
const MARGIN = { top: 18, bottom: 16, left: 18, right: 18 };
const CONTENT_W = PAGE.w - MARGIN.left - MARGIN.right;

// ── Helpers texte ─────────────────────────────────────────
function setFont(doc, style = 'normal', size = 10, color = COLORS.text) {
  doc.setFont('helvetica', style);
  doc.setFontSize(size);
  doc.setTextColor(color[0], color[1], color[2]);
}

// La police helvetica intégrée à jsPDF est encodée WinAnsi (Latin-1 + quelques
// extras). Les caractères Unicode hors de cette plage (guillemets typo,
// apostrophes courbes, tirets cadratins, emojis, etc.) sortent en charabia
// avec des largeurs de glyphe aberrantes ("casse bizarre" / gros espaces
// entre les lettres). On normalise vers de l'ASCII avant rendu.
function sanitize(str) {
  if (str == null) return '';
  let s = String(str);
  // Apostrophes courbes → droit
  s = s.replace(/[\u2018\u2019\u201A\u201B\u2032]/g, "'");
  // Guillemets courbes → droit
  s = s.replace(/[\u201C\u201D\u201E\u201F\u2033]/g, '"');
  // Tirets longs → hyphen
  s = s.replace(/[\u2013\u2014\u2015\u2212]/g, '-');
  // Points de suspension unicode → 3 points
  s = s.replace(/\u2026/g, '...');
  // Espaces exotiques → espace normal
  s = s.replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000\u2060]/g, ' ');
  // Ligatures françaises → lettres séparées
  s = s.replace(/œ/g, 'oe').replace(/Œ/g, 'OE');
  s = s.replace(/æ/g, 'ae').replace(/Æ/g, 'AE');
  // Flèches courantes → ASCII approx.
  s = s.replace(/\u2192/g, '->').replace(/\u2190/g, '<-');
  s = s.replace(/\u2191/g, '^').replace(/\u2193/g, 'v');
  // Puces/bullets → •  (la puce est en Latin-1, 0xB7 ·, on prend ça)
  s = s.replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '\u00B7');
  // Tout ce qui reste hors Latin-1 (emojis, kanjis, symboles) → supprimé
  // eslint-disable-next-line no-control-regex -- Latin-1 inclut la plage de contrôle, c'est volontaire ici.
  s = s.replace(/[^\u0000-\u00FF]/g, '');
  return s;
}

function wrap(doc, text, width) {
  if (!text) return [];
  return doc.splitTextToSize(sanitize(text), width);
}

function safeText(doc, text, x, y, opts) {
  doc.text(sanitize(text), x, y, opts);
}

function ensureSpace(doc, cursor, needed) {
  if (cursor.y + needed > PAGE.h - MARGIN.bottom) {
    doc.addPage();
    cursor.y = MARGIN.top;
    drawPageHeader(doc);
  }
}

function drawPageHeader(doc) {
  // Filigrane léger en haut de page (à partir de la page 2)
  if (doc.getNumberOfPages() <= 1) return;
  setFont(doc, 'bold', 8, COLORS.muted);
  safeText(doc, 'VERSIONS', MARGIN.left, MARGIN.top - 6);
  setFont(doc, 'normal', 8, COLORS.muted);
  const pageLabel = `page ${doc.getNumberOfPages()}`;
  safeText(doc, pageLabel, PAGE.w - MARGIN.right, MARGIN.top - 6, { align: 'right' });
}

function rule(doc, cursor, color = COLORS.rule) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.2);
  doc.line(MARGIN.left, cursor.y, PAGE.w - MARGIN.right, cursor.y);
  cursor.y += 4;
}

function sectionTitle(doc, cursor, label) {
  ensureSpace(doc, cursor, 14);
  setFont(doc, 'bold', 11, COLORS.text);
  safeText(doc, label.toUpperCase(), MARGIN.left, cursor.y);
  cursor.y += 2.5;
  rule(doc, cursor, COLORS.text);
  cursor.y += 2;
}

function paragraph(doc, cursor, text, opts = {}) {
  const size = opts.size || 10;
  const color = opts.color || COLORS.text;
  const style = opts.style || 'normal';
  const width = opts.width || CONTENT_W;
  const indent = opts.indent || 0;
  setFont(doc, style, size, color);
  const lines = wrap(doc, text, width - indent);
  const lh = size * 0.45;
  lines.forEach((line) => {
    ensureSpace(doc, cursor, lh);
    // lines viennent déjà de wrap() → déjà sanitisés
    doc.text(line, MARGIN.left + indent, cursor.y);
    cursor.y += lh;
  });
  cursor.y += 1.5;
}

function bullet(doc, cursor, text, opts = {}) {
  const size = opts.size || 10;
  const color = opts.color || COLORS.text;
  const dotColor = opts.dotColor || COLORS.orange;
  setFont(doc, 'normal', size, color);
  const lines = wrap(doc, text, CONTENT_W - 6);
  const lh = size * 0.45;
  ensureSpace(doc, cursor, lh);
  // puce ronde
  doc.setFillColor(dotColor[0], dotColor[1], dotColor[2]);
  doc.circle(MARGIN.left + 1.6, cursor.y - 1.2, 0.9, 'F');
  lines.forEach((line, i) => {
    if (i > 0) ensureSpace(doc, cursor, lh);
    doc.text(line, MARGIN.left + 5, cursor.y);
    if (i < lines.length - 1) cursor.y += lh;
  });
  cursor.y += lh + 0.5;
}

// Score global (0-100) — rendu en "XX/100" ou "XX%" selon l'échelle détectée.
function globalScoreBadge(doc, cursor, score) {
  if (typeof score !== 'number') return;
  // Nos scores globaux sont sur 100 (pourcentage). On garde un seuil
  // proportionnel pour la couleur.
  const color =
    score >= 70 ? COLORS.green : score >= 40 ? COLORS.orange : COLORS.redSoft;
  const rounded = Math.round(score);
  setFont(doc, 'bold', 10, color);
  safeText(doc, `${rounded}/100`, MARGIN.left, cursor.y);
  cursor.y += 5;
}

// ── Extraction tolérante ──────────────────────────────────
// Supporte les deux formats rencontrés (legacy + v2) pour ne pas casser les fiches anciennes.
function pickListening(listening) {
  if (!listening) return null;
  const impression = listening.impression || listening.first_listen || '';
  const points = Array.isArray(listening.points_forts)
    ? listening.points_forts
    : Array.isArray(listening.forts) ? listening.forts : [];
  const aTravailler = Array.isArray(listening.a_travailler)
    ? listening.a_travailler
    : Array.isArray(listening.travail) ? listening.travail : [];
  const espace = listening.espace || '';
  const dynamique = listening.dynamique || '';
  const potentiel = listening.potentiel || '';
  return { impression, points, aTravailler, espace, dynamique, potentiel };
}

// ── En-tête de fiche ─────────────────────────────────────
function drawHeader(doc, cursor, meta) {
  // Bandeau marque
  setFont(doc, 'bold', 9, COLORS.orange);
  safeText(doc, 'VERSIONS', MARGIN.left, cursor.y);
  setFont(doc, 'normal', 8, COLORS.muted);
  // Apostrophe ASCII pour éviter le rendu charabia de U+2019 en helvetica
  safeText(doc, "Fiche d'analyse", MARGIN.left + 22, cursor.y);

  const stamp = meta.date
    ? new Date(meta.date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';
  if (stamp) {
    setFont(doc, 'normal', 8, COLORS.muted);
    safeText(doc, stamp, PAGE.w - MARGIN.right, cursor.y, { align: 'right' });
  }
  cursor.y += 9;

  // Titre du morceau
  setFont(doc, 'bold', 18, COLORS.text);
  const titleLines = wrap(doc, meta.title || 'Titre', CONTENT_W);
  titleLines.forEach((l) => {
    doc.text(l, MARGIN.left, cursor.y);
    cursor.y += 7.5;
  });

  // Version
  if (meta.versionName) {
    setFont(doc, 'normal', 10, COLORS.subtle);
    safeText(doc, `Version ${meta.versionName}`, MARGIN.left, cursor.y);
    cursor.y += 5;
  }

  // Score global — échelle 0-100
  if (typeof meta.score === 'number') {
    cursor.y += 2;
    globalScoreBadge(doc, cursor, meta.score);
  }

  // Verdict / résumé
  if (meta.verdict) {
    setFont(doc, 'italic', 11, COLORS.text);
    const lines = wrap(doc, meta.verdict, CONTENT_W);
    lines.forEach((l) => {
      ensureSpace(doc, cursor, 5.5);
      doc.text(l, MARGIN.left, cursor.y);
      cursor.y += 5.5;
    });
  }
  if (meta.summary && meta.summary !== meta.verdict) {
    cursor.y += 1;
    paragraph(doc, cursor, meta.summary, { color: COLORS.subtle });
  }

  cursor.y += 3;
  rule(doc, cursor);
  cursor.y += 2;
}

// ── Sections ─────────────────────────────────────────────
function drawQualitatif(doc, cursor, listening) {
  const L = pickListening(listening);
  if (!L) return;
  const hasAny =
    L.impression || L.points.length || L.aTravailler.length || L.espace || L.dynamique || L.potentiel;
  if (!hasAny) return;

  sectionTitle(doc, cursor, 'Ecoute qualitative');

  if (L.impression) {
    setFont(doc, 'bold', 10, COLORS.text);
    ensureSpace(doc, cursor, 6);
    safeText(doc, 'Impression generale', MARGIN.left, cursor.y);
    cursor.y += 5;
    paragraph(doc, cursor, L.impression);
  }

  if (L.points.length) {
    setFont(doc, 'bold', 10, COLORS.text);
    ensureSpace(doc, cursor, 6);
    safeText(doc, 'Points forts', MARGIN.left, cursor.y);
    cursor.y += 5;
    L.points.forEach((p) => bullet(doc, cursor, p, { dotColor: COLORS.green }));
    cursor.y += 1;
  }

  if (L.aTravailler.length) {
    setFont(doc, 'bold', 10, COLORS.text);
    ensureSpace(doc, cursor, 6);
    safeText(doc, 'A travailler', MARGIN.left, cursor.y);
    cursor.y += 5;
    L.aTravailler.forEach((p) => bullet(doc, cursor, p, { dotColor: COLORS.orange }));
    cursor.y += 1;
  }

  [
    ['Espace', L.espace],
    ['Dynamique', L.dynamique],
    ['Potentiel', L.potentiel],
  ].forEach(([label, val]) => {
    if (!val) return;
    setFont(doc, 'bold', 10, COLORS.text);
    ensureSpace(doc, cursor, 6);
    safeText(doc, label, MARGIN.left, cursor.y);
    cursor.y += 5;
    paragraph(doc, cursor, val);
  });

  cursor.y += 3;
}

function drawDiagnostic(doc, cursor, elements) {
  if (!elements || !elements.length) return;
  sectionTitle(doc, cursor, 'Diagnostic par elements');

  elements.forEach((el) => {
    const items = el.items || [];
    if (!items.length) return;
    ensureSpace(doc, cursor, 10);
    setFont(doc, 'bold', 11, COLORS.text);
    safeText(doc, el.cat || 'Element', MARGIN.left, cursor.y);
    cursor.y += 5;

    items.forEach((it) => {
      ensureSpace(doc, cursor, 12);
      setFont(doc, 'bold', 10, COLORS.text);
      let xLabel = MARGIN.left + 4;
      if (typeof it.score === 'number') {
        const c =
          it.score >= 7 ? COLORS.green : it.score >= 4 ? COLORS.orange : COLORS.redSoft;
        setFont(doc, 'bold', 9, c);
        const s = it.score.toFixed(1).replace(/\.0$/, '');
        safeText(doc, s, MARGIN.left + 4, cursor.y);
        xLabel = MARGIN.left + 13;
        setFont(doc, 'bold', 10, COLORS.text);
      }
      safeText(doc, it.label || '', xLabel, cursor.y);
      cursor.y += 4.5;

      if (it.detail) {
        paragraph(doc, cursor, it.detail, {
          color: COLORS.subtle,
          size: 9.5,
          indent: 4,
        });
      }
      if (Array.isArray(it.tools) && it.tools.length) {
        setFont(doc, 'italic', 9, COLORS.muted);
        const tools = `Outils : ${it.tools.join(', ')}`;
        const lines = wrap(doc, tools, CONTENT_W - 4);
        lines.forEach((l) => {
          ensureSpace(doc, cursor, 4);
          doc.text(l, MARGIN.left + 4, cursor.y);
          cursor.y += 4;
        });
      }
      cursor.y += 1.5;
    });
    cursor.y += 2;
  });
}

function drawPlan(doc, cursor, plan) {
  if (!plan || !plan.length) return;
  sectionTitle(doc, cursor, "Plan d'action");

  plan.forEach((p, i) => {
    ensureSpace(doc, cursor, 14);
    // Badge priorité
    const prio = (p.p || '').toLowerCase();
    const badgeColor =
      prio === 'haute' || prio === 'high'
        ? COLORS.redSoft
        : prio === 'basse' || prio === 'low'
          ? COLORS.muted
          : COLORS.orange;
    setFont(doc, 'bold', 9, badgeColor);
    const badge = (p.p || '').toUpperCase() || `#${i + 1}`;
    safeText(doc, badge, MARGIN.left, cursor.y);

    setFont(doc, 'bold', 10.5, COLORS.text);
    const titleLines = wrap(doc, p.task || '', CONTENT_W - 18);
    titleLines.forEach((l, idx) => {
      if (idx > 0) ensureSpace(doc, cursor, 5);
      doc.text(l, MARGIN.left + 18, cursor.y);
      if (idx < titleLines.length - 1) cursor.y += 5;
    });
    cursor.y += 5.5;

    if (p.daw) {
      setFont(doc, 'italic', 9.5, COLORS.subtle);
      const lines = wrap(doc, `Action DAW - ${p.daw}`, CONTENT_W - 4);
      lines.forEach((l) => {
        ensureSpace(doc, cursor, 4.5);
        doc.text(l, MARGIN.left + 4, cursor.y);
        cursor.y += 4.5;
      });
    }
    if (p.metered || p.target) {
      const parts = [];
      if (p.metered) parts.push(`Mesure : ${p.metered}`);
      if (p.target) parts.push(`Objectif : ${p.target}`);
      setFont(doc, 'normal', 9.5, COLORS.subtle);
      const lines = wrap(doc, parts.join('    '), CONTENT_W - 4);
      lines.forEach((l) => {
        ensureSpace(doc, cursor, 4.5);
        doc.text(l, MARGIN.left + 4, cursor.y);
        cursor.y += 4.5;
      });
    }
    cursor.y += 2.5;
  });
}

function drawNotes(doc, cursor, notes) {
  if (!notes || !notes.trim()) return;
  sectionTitle(doc, cursor, 'Mes notes');
  paragraph(doc, cursor, notes);
}

function drawFooter(doc) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    setFont(doc, 'normal', 8, COLORS.muted);
    safeText(
      doc,
      `${i} / ${total}`,
      PAGE.w - MARGIN.right,
      PAGE.h - 8,
      { align: 'right' }
    );
    safeText(doc, 'Genere avec Versions', MARGIN.left, PAGE.h - 8);
  }
}

// ── Entrée publique ───────────────────────────────────────
export function exportFicheToPdf({ track, versionName, analysisResult, date, sections }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  // Par défaut, tout coché
  const S = {
    qualitatif: true,
    diagnostic: true,
    plan: true,
    notes: true,
    ...(sections || {}),
  };

  const fiche = analysisResult?.fiche || null;
  const meta = {
    title: track?.title || 'Titre',
    versionName: versionName || track?.versions?.[0]?.name || '',
    date: date || new Date().toISOString(),
    score: typeof fiche?.globalScore === 'number' ? fiche.globalScore : null,
    verdict: fiche?.verdict || '',
    summary: fiche?.summary || '',
  };

  const cursor = { y: MARGIN.top };
  drawHeader(doc, cursor, meta);

  if (S.qualitatif) drawQualitatif(doc, cursor, analysisResult?.listening);
  if (S.diagnostic) drawDiagnostic(doc, cursor, fiche?.elements || []);
  if (S.plan) drawPlan(doc, cursor, fiche?.plan || []);
  if (S.notes) drawNotes(doc, cursor, analysisResult?.userNotes || '');

  drawFooter(doc);

  const safeTitle = (track?.title || 'Versions')
    .replace(/[^a-zA-Z0-9À-ÿ -]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 60);
  const safeVersion = (versionName || 'V1').replace(/[^a-zA-Z0-9]/g, '_');
  const fname = `${safeTitle}_${safeVersion}.pdf`;

  doc.save(fname);
}
