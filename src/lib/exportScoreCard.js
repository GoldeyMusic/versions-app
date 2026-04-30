// Score Card 1080×1080 — partage Insta/X.
// Refonte 2026-05-01 : composition "trophée + constellation" — gros score
// centré dans son anneau, 9 chips colorés flottants avec rotations subtiles
// (catégories + BPM/Key/LUFS/genre/delta), verdict italique en bandeau bas.
// Halos ambient amber/cyan/violet pour donner de la chaleur.
//
// Canvas 2D pur (pas de html2canvas) pour un rendu pixel-perfect.

const SIZE = 1080;
const BG = '#0a0b14';

// Palette cohérente avec les .vside-chip de la fiche.
const AMBER = '#f5b056';
const CYAN = '#5cb8cc';
const VIOLET = '#a67ef5';
const MINT = '#8ee07a';
const RED = '#ff5d5d';
const SOFT = 'rgba(255,255,255,0.75)';
const MUTED = 'rgba(255,255,255,0.45)';

// Couleur du ring + score chip selon le score (mêmes seuils que ScoreRingBig).
function ringColor(v) {
  if (v < 50) return RED;
  if (v < 75) return AMBER;
  return MINT;
}

// Convertit un hex (#rrggbb) en rgba(r,g,b,a). Pour fond et bordure des chips.
function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

async function ensureFonts() {
  if (!document.fonts || !document.fonts.load) return;
  try {
    await Promise.all([
      document.fonts.load('700 220px "DM Sans"'),
      document.fonts.load('700 64px "DM Sans"'),
      document.fonts.load('600 24px "JetBrains Mono"'),
      document.fonts.load('500 22px "JetBrains Mono"'),
      document.fonts.load('italic 500 40px "Cormorant Garamond"'),
    ]);
  } catch {
    // Fallback navigateur si une font ne charge pas.
  }
}

function wrapText(ctx, text, maxWidth, maxLines = 2) {
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
  if (lines.length === maxLines) {
    let last = lines[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 1) {
      last = last.slice(0, -1);
    }
    lines[maxLines - 1] = `${last}${ctx.measureText(`${last}…`).width <= maxWidth ? '…' : ''}`;
  }
  return lines;
}

// Halos ambient seedés sur le titre — amber centre, cyan top-left,
// violet bottom-right. Reproduit la grammaire bg du site.
function paintHalos(ctx, seed) {
  let s = seed || 1;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  // Amber au centre (gros, prédominant).
  const ax = SIZE * (0.4 + rand() * 0.2);
  const ay = SIZE * (0.4 + rand() * 0.2);
  const ag = ctx.createRadialGradient(ax, ay, 0, ax, ay, SIZE * 0.7);
  ag.addColorStop(0, 'rgba(245, 176, 86, 0.32)');
  ag.addColorStop(0.5, 'rgba(245, 176, 86, 0.10)');
  ag.addColorStop(1, 'rgba(245, 176, 86, 0)');
  ctx.fillStyle = ag;
  ctx.fillRect(0, 0, SIZE, SIZE);
  // Cyan top-left.
  const cg = ctx.createRadialGradient(SIZE * 0.1, SIZE * 0.15, 0, SIZE * 0.1, SIZE * 0.15, SIZE * 0.5);
  cg.addColorStop(0, 'rgba(92, 184, 204, 0.22)');
  cg.addColorStop(1, 'rgba(92, 184, 204, 0)');
  ctx.fillStyle = cg;
  ctx.fillRect(0, 0, SIZE, SIZE);
  // Violet bottom-right.
  const vg = ctx.createRadialGradient(SIZE * 0.9, SIZE * 0.9, 0, SIZE * 0.9, SIZE * 0.9, SIZE * 0.5);
  vg.addColorStop(0, 'rgba(166, 126, 245, 0.20)');
  vg.addColorStop(1, 'rgba(166, 126, 245, 0)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

// Anneau de score avec gros chiffre au centre. Rayon donné, anneau
// tracé sur 360° pour la track + arc partiel pour la valeur.
function paintScoreRing(ctx, cx, cy, radius, value) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const color = ringColor(v);
  // Track de fond.
  ctx.lineWidth = 22;
  ctx.strokeStyle = `${color}26`;
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  // Arc partiel (top center, clockwise).
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  const start = -Math.PI / 2;
  const end = start + (Math.PI * 2 * v) / 100;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, start, end);
  ctx.stroke();
  // Numéro centre.
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 220px "DM Sans", sans-serif';
  ctx.fillText(String(Math.round(v)), cx, cy + 8);
  // /100 sous le chiffre.
  ctx.fillStyle = MUTED;
  ctx.font = '500 24px "JetBrains Mono", monospace';
  ctx.textBaseline = 'middle';
  ctx.fillText('/ 100', cx, cy + 130);
}

// Pill chip color-coded avec rotation. Position = centre du chip après rotation.
function paintChip(ctx, cx, cy, rotateDeg, label, color, paddingX = 24, height = 50, fontSize = 16) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotateDeg * Math.PI) / 180);

  ctx.font = `600 ${fontSize}px "JetBrains Mono", "DM Sans", monospace`;
  const textW = ctx.measureText(label).width;
  const w = Math.ceil(textW + paddingX * 2);
  const h = height;
  const r = h / 2;

  // Fond tinted + bordure pleine.
  ctx.fillStyle = hexToRgba(color, 0.10);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-w / 2 + r, -h / 2);
  ctx.arcTo(w / 2, -h / 2, w / 2, h / 2, r);
  ctx.arcTo(w / 2, h / 2, -w / 2, h / 2, r);
  ctx.arcTo(-w / 2, h / 2, -w / 2, -h / 2, r);
  ctx.arcTo(-w / 2, -h / 2, w / 2, -h / 2, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Label centré.
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 1);

  ctx.restore();
}

/**
 * Construit la Score Card 1080×1080 et déclenche son téléchargement.
 *
 * @param {object} args
 * @param {string} args.title          Titre du morceau (ex. "Your Song")
 * @param {number} args.score          Score global /100
 * @param {string} [args.verdict]      Verdict 1ʳᵉ phrase, italique Cormorant
 * @param {Array<{cat:string,score:number}>} [args.subScores]
 *        Liste { cat, score } — on pioche les 4 plus marquantes (les 2
 *        meilleures + les 2 moins bonnes pour donner un panorama).
 * @param {string} [args.versionName]  Nom de version (V1, V2…)
 * @param {string|number} [args.bpm]   BPM (chip cyan)
 * @param {string} [args.key]          Tonalité (chip violet)
 * @param {string|number} [args.lufs]  LUFS (chip mint)
 * @param {string} [args.genre]        Genre détecté (chip amber)
 * @param {number} [args.prevScore]    Score V-1 (pour delta)
 * @param {string} [args.filename]
 */
export async function downloadScoreCard({
  title,
  score,
  verdict = '',
  subScores = [],
  versionName = '',
  bpm = null,
  key = null,
  lufs = null,
  genre = '',
  prevScore = null,
  filename,
} = {}) {
  await ensureFonts();

  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  // Fond + halos.
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, SIZE, SIZE);
  let seed = 0;
  for (let i = 0; i < (title || '').length; i++) seed = (seed * 31 + title.charCodeAt(i)) >>> 0;
  paintHalos(ctx, seed || 1);

  // ── HEADER ──────────────────────────────────────────────────────
  // Eyebrow VERSIONS (gauche) + version (droite).
  ctx.fillStyle = AMBER;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = '500 22px "JetBrains Mono", monospace';
  ctx.fillText('VERSIONS', 60, 80);
  if (versionName) {
    ctx.fillStyle = MUTED;
    ctx.textAlign = 'right';
    ctx.fillText(`MIX ${versionName.toUpperCase()}`, SIZE - 60, 80);
  }

  // ── TITRE DU MORCEAU ───────────────────────────────────────────
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 64px "DM Sans", sans-serif';
  const titleLines = wrapText(ctx, title || 'Sans titre', SIZE - 200, 2);
  let titleY = titleLines.length === 1 ? 200 : 175;
  for (const line of titleLines) {
    ctx.fillText(line, SIZE / 2, titleY);
    titleY += 70;
  }

  // ── SCORE RING CENTRAL ─────────────────────────────────────────
  const ringR = 240;
  const ringCx = SIZE / 2;
  const ringCy = 560;
  paintScoreRing(ctx, ringCx, ringCy, ringR, score);

  // ── CONSTELLATION DE CHIPS ─────────────────────────────────────
  // Top center : BPM + Key (si disponibles).
  if (bpm) paintChip(ctx, 420, 280, -3, `${bpm} BPM`, CYAN, 22, 48, 15);
  if (key) paintChip(ctx, 660, 290, 2, String(key).toUpperCase(), VIOLET, 22, 48, 15);

  // Sub-scores : 2 meilleurs côtés haut, 2 moins bons côtés bas.
  const sorted = (Array.isArray(subScores) ? subScores : [])
    .filter((s) => s && typeof s.score === 'number')
    .slice()
    .sort((a, b) => b.score - a.score);
  const top2 = sorted.slice(0, 2);
  const bot2 = sorted.length > 2 ? sorted.slice(-2).reverse() : [];

  // Top-gauche, top-droit.
  if (top2[0]) {
    const c = ringColor(top2[0].score);
    paintChip(ctx, 200, 420, -8, `${top2[0].cat.toUpperCase()} ${Math.round(top2[0].score)}`, c, 24, 56, 17);
  }
  if (top2[1]) {
    const c = ringColor(top2[1].score);
    paintChip(ctx, 880, 380, 6, `${top2[1].cat.toUpperCase()} ${Math.round(top2[1].score)}`, c, 24, 56, 17);
  }
  // Bottom-gauche, bottom-droit.
  if (bot2[0]) {
    const c = ringColor(bot2[0].score);
    paintChip(ctx, 180, 780, -4, `${bot2[0].cat.toUpperCase()} ${Math.round(bot2[0].score)}`, c, 24, 56, 17);
  }
  if (bot2[1]) {
    const c = ringColor(bot2[1].score);
    paintChip(ctx, 900, 800, 5, `${bot2[1].cat.toUpperCase()} ${Math.round(bot2[1].score)}`, c, 24, 56, 17);
  }

  // Bottom center : LUFS + delta + genre (sous le score).
  if (lufs) {
    const lufsLabel = String(lufs).toLowerCase().includes('lufs') ? String(lufs) : `${lufs} LUFS`;
    paintChip(ctx, 460, 880, 2, lufsLabel.toUpperCase(), MINT, 22, 50, 15);
  }
  if (typeof prevScore === 'number' && typeof score === 'number') {
    const delta = Math.round(score - prevScore);
    if (delta !== 0) {
      const arrow = delta > 0 ? '↑' : '↓';
      const color = delta > 0 ? MINT : RED;
      paintChip(ctx, 645, 875, -2, `${arrow} ${delta > 0 ? '+' : ''}${delta}`, color, 22, 50, 16);
    }
  }
  if (genre) {
    // Tronque si trop long pour ne pas sortir du canvas.
    let g = String(genre).toUpperCase();
    ctx.font = '600 14px "JetBrains Mono", monospace';
    while (ctx.measureText(g).width > 320 && g.length > 1) g = g.slice(0, -1);
    paintChip(ctx, SIZE / 2, 945, 1, g, AMBER, 22, 48, 14);
  }

  // ── VERDICT BANDEAU BAS ────────────────────────────────────────
  if (verdict) {
    ctx.fillStyle = AMBER;
    ctx.font = 'italic 500 40px "Cormorant Garamond", "Fraunces", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const vLines = wrapText(ctx, `« ${verdict} »`, SIZE - 200, 2);
    let vy = 1010;
    if (vLines.length === 2) vy = 990;
    for (const line of vLines) {
      ctx.fillText(line, SIZE / 2, vy);
      vy += 48;
    }
  }

  // ── WATERMARK ──────────────────────────────────────────────────
  ctx.fillStyle = MUTED;
  ctx.font = '500 14px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('www.versions.studio', SIZE / 2, SIZE - 30);

  // ── EXPORT ─────────────────────────────────────────────────────
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
