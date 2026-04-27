// Score Card 1080×1080 — partage Insta/X (Ticket 2.2 AubioMix).
// Canvas 2D pur (pas de html2canvas) pour un rendu pixel-perfect,
// indépendant des reflows DOM et des dimensions d'écran.
//
// Le design suit le DS existant : fond #0c0c0d, accents amber #f5b056,
// halos colorés en arrière-plan, italique Fraunces pour le verdict.
//
// Fonts utilisées (déjà chargées par MockupStyles) : DM Sans, Fraunces,
// JetBrains Mono. On attend leur disponibilité avant de dessiner pour
// éviter le flash de fallback.

const SIZE = 1080;
const BG = '#0c0c0d';
const AMBER = '#f5b056';
const SOFT = '#bdbdc0';
const MUTED = '#7c7c80';
const BORDER = 'rgba(255,255,255,0.12)';

// Couleur du ring selon le score (mêmes seuils que ScoreRingBig).
function ringColor(v) {
  if (v < 50) return '#ef6b6b';
  if (v < 75) return AMBER;
  return '#7bd88f';
}

async function ensureFonts() {
  if (!document.fonts || !document.fonts.load) return;
  try {
    await Promise.all([
      document.fonts.load('700 80px "DM Sans"'),
      document.fonts.load('500 60px "DM Sans"'),
      document.fonts.load('400 32px "DM Sans"'),
      document.fonts.load('400 36px "JetBrains Mono"'),
      document.fonts.load('italic 500 56px "Fraunces"'),
      document.fonts.load('italic 400 28px "Fraunces"'),
    ]);
  } catch {
    // Best-effort : on dessine quand même avec le fallback du navigateur.
  }
}

// Wraps `text` to fit inside `maxWidth` at `font`. Returns array of lines.
function wrapText(ctx, text, maxWidth, maxLines = 3) {
  if (!text) return [];
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width <= maxWidth) {
      cur = test;
    } else {
      if (cur) lines.push(cur);
      cur = w;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  // Si on a tronqué, ajoute …
  if (lines.length === maxLines) {
    let last = lines[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 1) {
      last = last.slice(0, -1);
    }
    lines[maxLines - 1] = `${last}${ctx.measureText(`${last}…`).width <= maxWidth ? '…' : ''}`;
  }
  return lines;
}

// Halos colorés en arrière-plan (esprit pochette abstraite).
function paintHalos(ctx, seed) {
  const palette = [
    'rgba(245, 176, 86, 0.55)',  // amber
    'rgba(110, 185, 110, 0.35)', // sage
    'rgba(70, 150, 210, 0.32)',  // cerulean
    'rgba(215, 115, 170, 0.28)', // rose
  ];
  let s = seed || 1;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < 4; i++) {
    const x = rand() * SIZE;
    const y = rand() * SIZE;
    const r = 280 + rand() * 220;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, palette[i % palette.length]);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // Léger voile pour foncer le rendu et garder la lisibilité du texte
  ctx.fillStyle = 'rgba(12,12,13,0.45)';
  ctx.fillRect(0, 0, SIZE, SIZE);
}

// Dessine l'anneau de score centré.
function paintScoreRing(ctx, cx, cy, radius, value) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const color = ringColor(v);
  // Track
  ctx.lineWidth = 18;
  ctx.strokeStyle = `${color}33`;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  // Progress (start at top, clockwise)
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  const start = -Math.PI / 2;
  const end = start + (Math.PI * 2 * v) / 100;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, start, end);
  ctx.stroke();
  // Numéro au centre
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = '700 130px "DM Sans", sans-serif';
  const num = String(Math.round(v));
  const numW = ctx.measureText(num).width;
  ctx.fillText(num, cx - 18, cy + 18);
  // Suffixe /100
  ctx.fillStyle = MUTED;
  ctx.font = '500 36px "DM Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('/100', cx + numW / 2 - 14, cy + 14);
}

// Sub-score pill (catégorie + score).
function paintSubScore(ctx, x, y, w, h, label, score) {
  // Carte arrondie
  const r = 14;
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Label
  ctx.fillStyle = SOFT;
  ctx.font = '500 22px "DM Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  // Tronque le label si trop long
  let lbl = String(label || '').toUpperCase();
  while (ctx.measureText(lbl).width > w - 110 && lbl.length > 1) lbl = lbl.slice(0, -1);
  ctx.fillText(lbl, x + 22, y + h / 2);
  // Score à droite
  ctx.fillStyle = ringColor(score);
  ctx.font = '700 32px "JetBrains Mono", "DM Sans", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(String(Math.round(score)), x + w - 22, y + h / 2 + 1);
}

/**
 * Construit la Score Card 1080×1080 et déclenche son téléchargement.
 *
 * @param {object} args
 * @param {string} args.title          Titre du morceau
 * @param {number} args.score          Score global /100
 * @param {string} [args.verdict]      Verdict (1ʳᵉ phrase, italique)
 * @param {Array<{cat:string,score:number}>} [args.subScores]
 *        Liste { cat, score } — on garde les 3 meilleurs.
 * @param {string} [args.versionName]  Nom de version (V1, V2…)
 * @param {string} [args.filename]     Nom du fichier téléchargé.
 */
export async function downloadScoreCard({
  title,
  score,
  verdict = '',
  subScores = [],
  versionName = '',
  filename,
} = {}) {
  await ensureFonts();

  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  // Fond
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Halos seedés depuis le titre (cohérent avec la pochette de la fiche)
  let seed = 0;
  for (let i = 0; i < (title || '').length; i++) seed = (seed * 31 + title.charCodeAt(i)) >>> 0;
  paintHalos(ctx, seed || 1);

  // Eyebrow "VERSIONS" en haut, ambre, mono
  ctx.fillStyle = AMBER;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = '500 22px "JetBrains Mono", monospace';
  ctx.fillText('VERSIONS', 64, 64);
  // Pastille version à droite
  if (versionName) {
    ctx.fillStyle = MUTED;
    ctx.textAlign = 'right';
    ctx.font = '500 22px "JetBrains Mono", monospace';
    ctx.fillText(versionName.toUpperCase(), SIZE - 64, 64);
  }

  // Titre du morceau (DM Sans bold) — wrap sur 2 lignes max
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = '700 64px "DM Sans", sans-serif';
  const titleLines = wrapText(ctx, title || 'Sans titre', SIZE - 128, 2);
  let yCursor = 130;
  for (const line of titleLines) {
    ctx.fillText(line, 64, yCursor);
    yCursor += 76;
  }

  // Anneau de score centré
  const ringR = 200;
  const ringCx = SIZE / 2;
  const ringCy = 540;
  paintScoreRing(ctx, ringCx, ringCy, ringR, score);

  // Verdict italique sous l'anneau
  if (verdict) {
    ctx.fillStyle = SOFT;
    ctx.font = 'italic 500 38px "Fraunces", "DM Sans", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const verdictLines = wrapText(ctx, verdict, SIZE - 200, 2);
    let vy = ringCy + ringR + 60;
    for (const line of verdictLines) {
      ctx.fillText(line, SIZE / 2, vy);
      vy += 50;
    }
  }

  // 3 top sub-scores (3 cartes côte à côte)
  const top3 = (Array.isArray(subScores) ? subScores : [])
    .filter((s) => s && typeof s.score === 'number')
    .slice() // copy
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  if (top3.length > 0) {
    const cardH = 70;
    const gap = 16;
    const cardW = (SIZE - 128 - gap * (top3.length - 1)) / top3.length;
    const cy = 900;
    for (let i = 0; i < top3.length; i++) {
      const cx = 64 + i * (cardW + gap);
      paintSubScore(ctx, cx, cy, cardW, cardH, top3[i].cat, top3[i].score);
    }
  }

  // Watermark bas
  ctx.fillStyle = MUTED;
  ctx.font = '500 18px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('www.versions.studio', SIZE / 2, SIZE - 32);

  // Téléchargement
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Canvas toBlob a renvoyé null');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safe = (title || 'score-card').toString().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'score-card';
  a.download = filename || `versions-${safe}${versionName ? `-${versionName.toLowerCase()}` : ''}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
