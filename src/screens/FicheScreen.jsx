import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import API from '../constants/api';
// import CompareButton from '../components/CompareButton'; // mis en sommeil
// VChip (carousel de chips V1/V2/V3) remplacé par VersionDropdown — import retiré.
import ExportPdfModal from '../components/ExportPdfModal';
import ShareLinkModal from '../components/ShareLinkModal';
import VocalTypeSuggestionBanner from '../components/VocalTypeSuggestionBanner';
import EvolutionBanner from '../components/EvolutionBanner';
import ReleaseReadinessBanner from '../components/ReleaseReadinessBanner';
import PlateauBanner from '../components/PlateauBanner';
import { loadTracks, saveVersionNotes, loadChatHistory, saveChatHistory, updateTrackVocalType, loadVersionLocalized, loadNoteCompletions, setNoteCompletion, setVersionFinal, renameVersion, deleteVersion, updateVersionDspMetrics } from '../lib/storage';
import { preloadTrackVersions } from '../components/BottomPlayer';
import { confirmDialog } from '../lib/confirm.jsx';
import { exportFicheToPdf } from '../lib/exportPdf';
import { downloadScoreCard } from '../lib/exportScoreCard';
import { renderWithEmphasis, formatAnalyzedAt, splitVerdict, applyVocalTypeToFiche, isVoiceCategory, normalizeDiagItem } from '../lib/ficheHelpers.jsx';
import useMobile from '../hooks/useMobile';
import useNarrowDesktop from '../hooks/useNarrowDesktop';
import useLang from '../hooks/useLang';
import OnboardingHints from '../components/OnboardingHints';
import { FICHE_STEPS, ONBOARDING_STORAGE_KEYS } from '../constants/onboardingSteps';

/**
 * FicheScreen — rendu fidèle à mockup-v3.html.
 * Les styles viennent de MockupStyles.jsx (classes .sidebar, .timeline, .verdict,
 * .priority, .diag-cat, .focus, .chat-panel, .chat-fab, .player).
 */

// ── Helpers ──────────────────────────────────────────────

// Identifiant stable pour la persistance Supabase de la checklist (Ticket 2.1).
// On préfère l'id backend ; à défaut on retombe sur (categorie::index::titre)
// pour rester stable d'une analyse à l'autre tant que le contenu ne bouge pas.
function diagItemKey(catId, item, idx) {
  if (item?.id) return String(item.id);
  const head = (item?.title || '').slice(0, 60);
  return `${catId || 'cat'}::${idx}::${head}`;
}

function findItalicIdx(title) {
  if (!title) return -1;
  const mid = Math.floor(title.length / 2);
  for (let dist = 0; dist < title.length; dist++) {
    for (const d of [0, -1, 1, -2, 2]) {
      const i = mid + dist * d;
      if (i < 0 || i >= title.length) continue;
      if (/[a-zA-Z]/.test(title[i])) return i;
    }
  }
  return -1;
}

function TrackTitleText({ title }) {
  const i = findItalicIdx(title);
  if (i < 0) return <span>{title}</span>;
  return (
    <span>{title.slice(0, i)}<span className="it">{title[i]}</span>{title.slice(i + 1)}</span>
  );
}

// v2 : le dernier mot du titre passe en italique serif amber (cf. "Comme un *rêve*")
function TrackTitleTextV2({ title }) {
  if (!title) return <span className="fiche-title-text" />;
  const trimmed = title.trim();
  const words = trimmed.split(/\s+/);
  if (words.length < 2) {
    return <span className="fiche-title-text"><em>{trimmed}</em></span>;
  }
  const last = words[words.length - 1];
  const head = words.slice(0, -1).join(' ');
  return (
    <span className="fiche-title-text">{head} <em>{last}</em></span>
  );
}

// Anneau de score 140x140 — formule identique à la maquette : dasharray=276
export function ScoreRingBig({ value, prevScore = null }) {
  const { s } = useLang();
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const offset = 276 - (276 * v) / 100;
  const color = v < 50 ? '#ef6b6b' : v < 75 ? '#f5b056' : '#7bd88f';
  const band = v < 50 ? s.fiche.scoreBandLow : v < 75 ? s.fiche.scoreBandMid : s.fiche.scoreBandHigh;
  const [tipOpen, setTipOpen] = useState(false);
  const delta = typeof prevScore === 'number' ? Math.round(v - prevScore) : null;
  return (
    <div
      className={`score-ring${tipOpen ? ' tip-open' : ''}`}
      onMouseEnter={() => setTipOpen(true)}
      onMouseLeave={() => setTipOpen(false)}
      onClick={() => setTipOpen((v) => !v)}
      role="button"
      tabIndex={0}
      aria-label={s.fiche.scoreAriaLabel}
    >
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="44" fill="none" stroke={`${color}22`} strokeWidth="5" />
        <circle
          cx="50" cy="50" r="44" fill="none" stroke={color} strokeWidth="5"
          strokeDasharray="276" strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="center">
        <div className="big">
          {Math.round(v)}
          <span className="big-suffix">/100</span>
        </div>
      </div>
      <span className="ring-help" aria-hidden="true">?</span>
      <div className="ring-tooltip" role="tooltip">
        <div className="rt-head">
          <span className="rt-dot" style={{ background: color }} />
          <strong>{band}</strong>
          <span className="rt-val">{Math.round(v)}/100</span>
        </div>
        <div className="rt-bands">
          <div className={`rt-band${v < 50 ? ' active' : ''}`}>
            <span className="dot" style={{ background: '#ef6b6b' }} />
            <span>{s.fiche.scoreBandLowRange}</span>
          </div>
          <div className={`rt-band${v >= 50 && v < 75 ? ' active' : ''}`}>
            <span className="dot" style={{ background: '#f5b056' }} />
            <span>{s.fiche.scoreBandMidRange}</span>
          </div>
          <div className={`rt-band${v >= 75 ? ' active' : ''}`}>
            <span className="dot" style={{ background: '#7bd88f' }} />
            <span>{s.fiche.scoreBandHighRange}</span>
          </div>
        </div>
        {delta != null && (
          <div className="rt-calib">
            {delta === 0
              ? s.fiche.scoreCalibStable
              : s.fiche.scoreCalibDelta.replace('{delta}', `${delta > 0 ? '+' : ''}${delta}`)}
          </div>
        )}
        <div className="rt-note">
          {s.fiche.scoreNote}
        </div>
      </div>
    </div>
  );
}

// ── Mix indicators (6 tuiles dans Score Global) ──────────
// Dérive 6 métriques synthétiques à partir des éléments / listening
// de la fiche. Si le backend expose un jour `rawFiche.mix_profile`,
// on l'utilise en priorité. Sinon on calcule à partir des catégories
// existantes (Basses, Spatial, Master, etc.) avec des fallbacks sur
// le score global pour que les 6 tuiles restent cohérentes.
function pickCatAvg(elements, keywords) {
  const el = (elements || []).find((e) =>
    keywords.some((k) => (e.cat || '').toLowerCase().includes(k))
  );
  if (!el) return null;
  const scores = (el.items || [])
    .map((it) => normalizeDiagItem(it)?.score)
    .filter((x) => typeof x === 'number');
  if (!scores.length) return null;
  // normalizeDiagItem ramène déjà tous les scores sur /100.
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(avg);
}

function clampScore(v, fallback) {
  if (typeof v !== 'number' || Number.isNaN(v)) return fallback;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function tierWord(score, tierSet) {
  if (!tierSet) return '';
  if (score < 50) return tierSet.low;
  if (score < 75) return tierSet.mid;
  return tierSet.high;
}

function tierColor(score) {
  if (score < 50) return 'red';
  if (score < 75) return 'amber';
  return 'mint';
}

function computeMixIndicators(rawFiche, elements, globalScore, s) {
  const tiers = s?.fiche?.mixIndicators || {};
  const mp = rawFiche?.mix_profile || null;

  // Dérivations par défaut à partir des catégories
  const bass = pickCatAvg(elements, ['bass', 'kick', 'basse']);
  const spatial = pickCatAvg(elements, ['spatial', 'reverb', 'fx']);
  const master = pickCatAvg(elements, ['master', 'loudness']);
  const drums = pickCatAvg(elements, ['drum', 'percus']);
  const voice = pickCatAvg(elements, ['voix', 'vocal', 'voice']);
  const inst = pickCatAvg(elements, ['instrument']);

  // Balance = moyenne pondérée de toutes catégories (ou globalScore)
  const allCats = [bass, spatial, master, drums, voice, inst].filter((x) => x != null);
  const avgAll = allCats.length
    ? Math.round(allCats.reduce((a, b) => a + b, 0) / allCats.length)
    : globalScore;

  const G = typeof globalScore === 'number' ? globalScore : 70;

  const balance    = clampScore(mp?.balance,    avgAll ?? G);
  const dynamique  = clampScore(mp?.dynamique,  master ?? G);
  const stereo     = clampScore(mp?.stereo,     spatial ?? G);
  const saturation = clampScore(mp?.saturation, master != null ? Math.max(40, Math.min(90, master + 5)) : G);
  const clarte     = clampScore(mp?.clarte,     voice != null && inst != null ? Math.round((voice + inst) / 2) : G);
  const assise     = clampScore(mp?.assise_basse ?? mp?.assise, bass ?? G);

  // Sources exposées dans le tooltip — liste des catégories qui ont servi au calcul
  const allSources = [
    { label: 'Voix',              score: voice },
    { label: 'Instruments',       score: inst },
    { label: 'Basses & Kick',     score: bass },
    { label: 'Batterie',          score: drums },
    { label: 'Spatial & Reverb',  score: spatial },
    { label: 'Master & Loudness', score: master },
  ].filter((x) => x.score != null);

  const list = [
    { key: 'balance',    score: balance,    tier: tiers.balance,
      direct: mp?.balance != null,
      sources: allSources },
    { key: 'dynamique',  score: dynamique,  tier: tiers.dynamique,
      direct: mp?.dynamique != null,
      sources: master != null ? [{ label: 'Master & Loudness', score: master }] : [] },
    { key: 'stereo',     score: stereo,     tier: tiers.stereo,
      direct: mp?.stereo != null,
      sources: spatial != null ? [{ label: 'Spatial & Reverb', score: spatial }] : [] },
    { key: 'saturation', score: saturation, tier: tiers.saturation,
      direct: mp?.saturation != null,
      sources: master != null ? [{ label: 'Master & Loudness', score: master }] : [] },
    { key: 'clarte',     score: clarte,     tier: tiers.clarte,
      direct: mp?.clarte != null,
      sources: [
        voice != null ? { label: 'Voix', score: voice } : null,
        inst  != null ? { label: 'Instruments', score: inst } : null,
      ].filter(Boolean) },
    { key: 'assise',     score: assise,     tier: tiers.assise,
      direct: (mp?.assise_basse ?? mp?.assise) != null,
      sources: bass != null ? [{ label: 'Basses & Kick', score: bass }] : [] },
  ];

  return list.map((t) => ({
    key: t.key,
    label: t.tier?.label || t.key,
    score: t.score,
    word: tierWord(t.score, t.tier),
    color: tierColor(t.score),
    what: t.tier?.what || '',
    how:  t.tier?.how  || '',
    direct: t.direct,
    sources: t.sources,
  }));
}

// Mini-ring 32×32 pour les tuiles mix indicators.
function MiniRing({ value, color }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const offset = 82 - (82 * v) / 100;
  const c = color === 'red'   ? '#ff5d5d'
          : color === 'mint'  ? '#8ee07a'
          : color === 'amber' ? '#f5a623'
          :                      '#5cb8cc';
  return (
    <div className="mi-ring" aria-hidden="true">
      <svg width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle
          cx="16" cy="16" r="13" fill="none" stroke={c} strokeWidth="3"
          strokeDasharray="82" strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 16 16)"
        />
      </svg>
      <div className="mi-val">{Math.round(v)}</div>
    </div>
  );
}

function MiTile({ item }) {
  const { s } = useLang();
  const [tipOpen, setTipOpen] = useState(false);
  const dotColor =
    item.color === 'red'   ? '#ff5d5d' :
    item.color === 'amber' ? '#f5a623' :
    item.color === 'mint'  ? '#8ee07a' : '#5cb8cc';

  // Note de bas de tooltip : affichée uniquement pour le cas direct
  // (score fourni directement par l'IA) ou le fallback "aucune catégorie".
  // Le cas "dérivé" est implicite via la liste "Basé sur" — pas besoin
  // d'une mention textuelle redondante.
  const sourceLine = item.direct
    ? s.fiche.miTooltipSourceDirect
    : (item.sources && item.sources.length)
      ? null
      : s.fiche.miTooltipNoSource;

  return (
    <div
      className={`mi-tile c-${item.color}${tipOpen ? ' tip-open' : ''}`}
      onMouseEnter={() => setTipOpen(true)}
      onMouseLeave={() => setTipOpen(false)}
      onClick={() => setTipOpen((v) => !v)}
      role="button"
      tabIndex={0}
    >
      <MiniRing value={item.score} color={item.color} />
      <div className="mi-body">
        <div className="mi-label">{item.label}</div>
        <div className="mi-word">{item.word}</div>
      </div>
      <span className="mi-help" aria-hidden="true">?</span>
      <div className="mi-tooltip" role="tooltip">
        <div className="mt-head">
          <span className="mt-dot" style={{ background: dotColor }} />
          <strong>{item.label}</strong>
          <span className="mt-val">{item.score}/100</span>
        </div>
        <div className="mt-section">
          <div className="mt-h">{s.fiche.miTooltipWhat}</div>
          <div className="mt-p">{item.what}</div>
        </div>
        <div className="mt-section">
          <div className="mt-h">{s.fiche.miTooltipHow}</div>
          <div className="mt-p">{item.how}</div>
        </div>
        {item.sources && item.sources.length > 0 && !item.direct && (
          <div className="mt-sources">
            <div className="mt-h">{s.fiche.miTooltipBasedOn}</div>
            <ul>
              {item.sources.map((src) => (
                <li key={src.label}>
                  <span className="mt-src-label">{src.label}</span>
                  <span className="mt-src-val">{src.score}/100</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {sourceLine && <div className="mt-note">{sourceLine}</div>}
      </div>
    </div>
  );
}

function MixIndicators({ items }) {
  if (!items || !items.length) return null;
  return (
    <div className="mix-indicators">
      {items.map((it) => (
        <MiTile key={it.key} item={it} />
      ))}
    </div>
  );
}

// ── A.3 — Radar 6 catégories (constellation) ──────────────────────
// Hexagone non rempli (juste lignes 1px ambre + points sur chaque axe à
// la position du score moyen), à droite de la pochette dans la topbar
// fiche. Cohérent avec la grammaire "constellation" de la landing —
// pas de polygone rempli style AubioMix.
//
// Les `items` sont ceux retournés par `computeMixIndicators` (mêmes que
// MixIndicators). Au hover d'un axe : axe éclairé + carte détail (label,
// score, what, how, sources) — préserve la valeur pédagogique des
// tooltips MixIndicators que ce composant remplace dans .rv-top.
function MixRadar({ items }) {
  const { s } = useLang();
  const [hovered, setHovered] = useState(null);
  if (!items || items.length === 0) return null;
  const N = items.length; // 6 normalement
  const SIZE = 220;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R_OUTER = 72;
  const R_LABEL = R_OUTER + 22;
  // Angle : on commence à -90° (axe 1 en haut), sens horaire.
  const angleAt = (i) => (-Math.PI / 2) + (i * 2 * Math.PI / N);
  const polar = (i, r) => {
    const a = angleAt(i);
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
  };
  const scoreNum = (it) => Math.max(0, Math.min(100, Number(it?.score) || 0));
  const pointAt = (i) => polar(i, (scoreNum(items[i]) / 100) * R_OUTER);
  // Couleur du point selon le score (cohérent avec MiniRing : <50 rouge,
  // <75 ambre, ≥75 mint).
  const pointColor = (score) => (
    score < 50 ? 'rgba(255,93,93,0.95)'
    : score < 75 ? 'rgba(245,176,86,0.95)'
    : 'rgba(142,224,122,0.95)'
  );
  // Polygone constellation (stroke seulement, pas de fill).
  const polyPoints = items.map((_, i) => {
    const p = pointAt(i);
    return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  }).join(' ');
  // Hexagones guides à 25/50/75/100 — très subtils.
  const guideHex = (frac) => Array.from({ length: N }, (_, i) => {
    const p = polar(i, frac * R_OUTER);
    return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  }).join(' ');
  const hov = (hovered != null && items[hovered]) ? items[hovered] : null;
  return (
    <div className={`mix-radar${hov ? ' is-hovering' : ''}`}>
      <svg
        className="mix-radar-svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="Radar des 6 catégories"
      >
        {/* Hexagones guides (4 paliers) */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <polygon
            key={`g-${f}`}
            points={guideHex(f)}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}
        {/* Axes (lignes 1px) */}
        {items.map((_, i) => {
          const e = polar(i, R_OUTER);
          const isH = hovered === i;
          return (
            <line
              key={`ax-${i}`}
              x1={CX} y1={CY} x2={e.x} y2={e.y}
              stroke={isH ? 'rgba(245,166,35,0.65)' : 'rgba(255,255,255,0.07)'}
              strokeWidth="1"
            />
          );
        })}
        {/* Polygone constellation (stroke ambre 1px, pas de fill) */}
        <polygon
          points={polyPoints}
          fill="none"
          stroke="rgba(245,166,35,0.55)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Points + zone de hover élargie */}
        {items.map((it, i) => {
          const p = pointAt(i);
          const isH = hovered === i;
          return (
            <g key={`pt-${i}`}>
              <circle
                cx={p.x} cy={p.y}
                r={isH ? 4.5 : 3}
                fill={pointColor(scoreNum(it))}
                style={{ filter: isH
                  ? 'drop-shadow(0 0 5px rgba(245,166,35,0.8))'
                  : 'drop-shadow(0 0 2px rgba(245,166,35,0.35))',
                  transition: 'r .12s ease, filter .12s ease' }}
              />
              {/* Hit area transparente pour faciliter le hover */}
              <circle
                cx={p.x} cy={p.y}
                r={14}
                fill="transparent"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
                style={{ cursor: 'pointer', outline: 'none' }}
                aria-label={`${it.label} : ${scoreNum(it)} sur 100`}
              />
            </g>
          );
        })}
        {/* Labels axes (mono caps petits) */}
        {items.map((it, i) => {
          const lp = polar(i, R_LABEL);
          const a = angleAt(i);
          const cosA = Math.cos(a);
          const anchor = cosA > 0.3 ? 'start' : (cosA < -0.3 ? 'end' : 'middle');
          const isH = hovered === i;
          return (
            <text
              key={`lb-${i}`}
              x={lp.x} y={lp.y + 3}
              textAnchor={anchor}
              className="mix-radar-label"
              style={{ fill: isH ? 'var(--amber, #f5a623)' : 'var(--muted, #7c7c80)' }}
            >
              {(it.label || '').toUpperCase()}
            </text>
          );
        })}
        {/* Score central : valeur en mono petit, indicatif d'échelle */}
        <text
          x={CX} y={CY + 3}
          textAnchor="middle"
          className="mix-radar-scale"
        >
          {hov ? `${scoreNum(hov)}` : '0–100'}
        </text>
      </svg>
      {/* Détail hover (préserve la valeur pédagogique des MiTile tooltips). */}
      {hov && (
        <div className="mix-radar-detail" role="tooltip">
          <div className="mr-detail-head">
            <span className="mr-detail-label">{hov.label}</span>
            <span className="mr-detail-val">{scoreNum(hov)}/100</span>
          </div>
          {hov.what && (
            <div className="mr-detail-section">
              <div className="mr-detail-h">{s.fiche.miTooltipWhat}</div>
              <div className="mr-detail-p">{hov.what}</div>
            </div>
          )}
          {hov.how && (
            <div className="mr-detail-section">
              <div className="mr-detail-h">{s.fiche.miTooltipHow}</div>
              <div className="mr-detail-p">{hov.how}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Anneau 32x32 (items diag) — dasharray=82 ; couleur par seuil.
// Schéma /100 (ticket 1.1). Rétrocompat : si la valeur est ≤ 10
// (ancien format /10), on la passe à l'échelle /100 pour l'affichage.
export function ScoreRingSmall({ value }) {
  if (typeof value !== 'number') return null;
  const scaled = value > 10 ? value : value * 10;
  const v = Math.max(0, Math.min(100, scaled));
  const offset = 82 - (82 * v) / 100;
  const color = v < 50 ? '#ef6b6b' : v < 75 ? '#f5b056' : '#7bd88f';
  const stroke22 = `${color}2a`;
  return (
    <div className="sring" style={{ width: 32, height: 32, position: 'relative' }}>
      <svg width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="13" fill="none" stroke={stroke22} strokeWidth="3" />
        <circle
          cx="16" cy="16" r="13" fill="none" stroke={color} strokeWidth="3"
          strokeDasharray="82" strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 16 16)"
        />
      </svg>
      <div className="n">{Math.round(v)}</div>
    </div>
  );
}

// Parse un texte avec des marqueurs *...* et retourne du JSX avec <em>
// pour les passages italiques (mis en ambre via la règle CSS .verdict-text h1 em).
// ── ListeningSection (écoute qualitative) ─────────────────

/**
 * Parse le texte d'écoute Gemini/Claude :
 * - Lignes en ALL CAPS → titre de section
 * - Lignes commençant par ▸ → bullet
 * - Reste → paragraphe
 * Retourne [{ title, paragraphs, bullets }]
 */
function parseListening(text) {
  if (!text || typeof text !== 'string') return [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sections = [];
  let current = null;
  const isHeader = (l) =>
    l.length >= 3 && l.length <= 60 &&
    /^[A-ZÀ-Ý][A-ZÀ-Ý\s\-&']+$/.test(l);

  for (const line of lines) {
    if (isHeader(line)) {
      if (current) sections.push(current);
      current = { title: line, blocks: [] };
    } else if (line.startsWith('▸') || line.startsWith('•') || line.startsWith('-')) {
      if (!current) current = { title: '', blocks: [] };
      current.blocks.push({ type: 'bullet', text: line.replace(/^[▸•\-]\s*/, '') });
    } else {
      if (!current) current = { title: '', blocks: [] };
      current.blocks.push({ type: 'para', text: line });
    }
  }
  if (current) sections.push(current);
  return sections;
}

function ListeningSection({ listening }) {
  const { s } = useLang();
  const [expanded, setExpanded] = useState(false);
  if (!listening) return null;

  let text = null;
  if (typeof listening === 'string') text = listening;
  else if (listening?.text) text = listening.text;
  else if (listening?.content) text = listening.content;
  const legacySections = text ? parseListening(text) : null;

  const impression = listening?.impression;
  const points = Array.isArray(listening?.points_forts) ? listening.points_forts : [];
  const aTravailler = Array.isArray(listening?.a_travailler) ? listening.a_travailler : [];
  const espace = listening?.espace;
  const dynamique = listening?.dynamique;
  const potentiel = listening?.potentiel;

  const hasStructured = impression || points.length || aTravailler.length || espace || dynamique || potentiel;
  if (!hasStructured && !(legacySections && legacySections.length)) return null;

  const hasMore = points.length || aTravailler.length || espace || dynamique || potentiel;

  const Block = ({ title, children }) => (
    <div>
      <h3 style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 14, letterSpacing: 2, fontWeight: 500,
        color: '#f5b056', textTransform: 'uppercase',
        margin: '0 0 10px',
      }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  );
  const P = ({ children }) => (
    <p style={{
      margin: 0, fontFamily: 'var(--body)',
      fontSize: 15, lineHeight: 1.7, fontWeight: 300, color: 'var(--soft)',
    }}>{renderWithEmphasis(children)}</p>
  );
  const Bullet = ({ children }) => (
    <div style={{
      display: 'flex', gap: 12, alignItems: 'flex-start',
      fontFamily: "'DM Sans', sans-serif", fontSize: 16,
      color: '#c5c5c7', lineHeight: 1.7, fontWeight: 300,
    }}>
      <span style={{ color: '#f5b056', fontSize: 16, lineHeight: 1.5, flexShrink: 0, marginTop: 1 }}>▸</span>
      <span>{renderWithEmphasis(children)}</span>
    </div>
  );

  return (
    <section className="listening-section">
      <div className="section-head">
        <span className="t">{s.fiche.listeningTitle}</span>
        <span className="line" />
      </div>
      <div className="listening-box">
        {hasStructured ? (
          <>
            {impression && <Block title={s.fiche.blockImpression}><P>{impression}</P></Block>}
            {expanded && (
              <>
                {points.length > 0 && <Block title={s.fiche.blockPointsForts}>{points.map((p, i) => <Bullet key={i}>{p}</Bullet>)}</Block>}
                {aTravailler.length > 0 && <Block title={s.fiche.blockATravailler}>{aTravailler.map((p, i) => <Bullet key={i}>{p}</Bullet>)}</Block>}
                {espace && <Block title={s.fiche.blockEspace}><P>{espace}</P></Block>}
                {dynamique && <Block title={s.fiche.blockDynamique}><P>{dynamique}</P></Block>}
                {potentiel && <Block title={s.fiche.blockPotentiel}><P>{potentiel}</P></Block>}
              </>
            )}
            {hasMore && (
              <button
                onClick={() => setExpanded((v) => !v)}
                style={{
                  alignSelf: 'flex-start', marginTop: -6,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#f5b056', fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 14, letterSpacing: 2, fontWeight: 500,
                  textTransform: 'uppercase', padding: '6px 0',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {expanded ? s.fiche.toggleReduce : s.fiche.toggleExpandListening}
              </button>
            )}
          </>
        ) : (
          legacySections.map((sec, i) => (
            <div key={i}>
              {sec.title && <h3 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, letterSpacing: 2, fontWeight: 500, color: '#f5b056', textTransform: 'uppercase', margin: '0 0 10px' }}>{sec.title}</h3>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sec.blocks.map((b, j) => b.type === 'bullet' ? <Bullet key={j}>{b.text}</Bullet> : <P key={j}>{b.text}</P>)}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

// ── AnalyzingState (page d'attente riche) ─────────────────
// Refonte v2 (2026-04-22) : même grammaire que LoadingScreen
// (ap-scaffold/ap-stack + ap-radial + ap-micro-steps + ap-wave + ap-tip).
// Variante "finalize" = widget plus compact (radial 140px au lieu de 220px)
// car l'utilisateur est déjà sur FicheScreen, on est dans la phase terminale.
// On dérive la progression de `stage` (monotone, ne recule jamais).

function AnalyzingState({ stage }) {
  const { s } = useLang();
  const tips = Array.isArray(s.fiche.analysisTips) ? s.fiche.analysisTips : [];
  const [tipIdx, setTipIdx] = useState(() => (tips.length ? Math.floor(Math.random() * tips.length) : 0));
  // Track the highest stage reached to prevent checkboxes from unchecking
  const [maxIdx, setMaxIdx] = useState(0);
  useEffect(() => {
    if (!tips.length) return;
    const id = setInterval(() => {
      setTipIdx((i) => (i + 1) % tips.length);
    }, 12000);
    return () => clearInterval(id);
  }, [tips.length]);

  // 4 micro-steps : Upload / Écoute / Rédaction / Finalisation (cohérent
  // avec LoadingScreen pour que la transition soit sans rupture).
  const microLabels = [
    s.loading?.microUpload || s.fiche.stepUpload,
    s.loading?.microListening || s.fiche.stepListening,
    s.loading?.microWriting || s.fiche.stepFiche,
    s.loading?.microDone || 'Done',
  ];

  // Derive progress from stage — monotonic (never goes backward).
  // Quand on arrive sur FicheScreen, l'upload et l'écoute sont déjà faits,
  // donc on démarre au minimum à l'étape 2 (rédaction).
  const rawIdx =
    stage === 'all_done' ? 3 :
    stage === 'fiche_done' ? 3 :
    stage === 'listening_done' ? 2 :
    stage === 'listening_started' ? 2 :
    2;

  useEffect(() => {
    setMaxIdx((prev) => Math.max(prev, rawIdx));
  }, [rawIdx]);

  const phase = Math.max(maxIdx, rawIdx);
  const microState = (i) => (i < phase ? 'is-done' : i === phase ? 'is-active' : '');

  // Anneau radial (cohérent avec LoadingScreen : 8 / 38 / 68 / 94).
  const pctByPhase = [8, 38, 68, 94];
  const pct = pctByPhase[Math.max(0, Math.min(phase, 3))];
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <div className="ap-finalize">
      {/* Titre + sous-titre (même grammaire que LoadingScreen) */}
      <h2 className="ap-title">
        {s.fiche.finalizingTitleBefore}{' '}
        <em>{s.fiche.finalizingTitleEm}</em>
      </h2>
      <p className="ap-sub" style={{ marginTop: -8 }}>
        {s.fiche.finalizingSubtitle}
      </p>

      {/* Anneau radial compact + % au centre + statut mono amber */}
      <div className="ap-radial-wrap" aria-hidden="true">
        <svg className="ap-radial" viewBox="0 0 220 220">
          <circle className="track" cx="110" cy="110" r={radius} />
          <circle
            className="bar"
            cx="110"
            cy="110"
            r={radius}
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>
        <div className="ap-radial-inner">
          <div className="ap-pct">
            {pct}<em>%</em>
          </div>
          <div className="ap-status">{s.fiche.finalizingStatus}</div>
        </div>
      </div>

      {/* Micro-steps horizontaux */}
      <div className="ap-micro-steps" role="list">
        {microLabels.map((label, i) => (
          <span
            key={i}
            role="listitem"
            className={`ap-micro ${microState(i)}`}
          >
            <span className="ap-micro-bullet" aria-hidden="true" />
            <b>{label}</b>
          </span>
        ))}
      </div>

      {/* Waveform animée */}
      <div className="ap-wave" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>

      {/* Carte "Le saviez-vous ?" */}
      {tips.length > 0 && (
        <div className="ap-tip" role="region" aria-label={s.fiche.didYouKnow}>
          <div className="ap-tip-kicker">
            <span className="ap-tip-dot" aria-hidden="true" />
            {s.fiche.didYouKnow}
          </div>
          <div key={tipIdx} className="ap-tip-body">
            {tips[tipIdx]}
          </div>
        </div>
      )}
    </div>
  );
}

// ── VocalTypePill (contrôle pour changer le type vocal d'un titre après coup) ──
// Montre l'état courant du titre (Chanté / Voix à venir / Instrumental) et permet
// à l'utilisateur de le changer. Utile si on s'est trompé à l'import, ou si un
// instrumental temporaire devient définitif.
function VocalTypePill({ track, onRefresh }) {
  const { s } = useLang();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);
  const current = track?.vocalType || 'vocal';
  const LABELS = {
    vocal: s.fiche.vocalTypeVocal,
    instrumental_pending: s.fiche.vocalPillInstrumentalPending,
    instrumental_final: s.fiche.vocalTypeInstrumental,
  };
  const TITLES = {
    vocal: s.fiche.vocalPillVocalTitle,
    instrumental_pending: s.fiche.vocalPillInstrumentalPendingTitle,
    instrumental_final: s.fiche.vocalPillInstrumentalFinalTitle,
  };

  // Ferme le popover au clic extérieur
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const handleChange = async (next) => {
    if (next === current || busy || !track?.id) { setOpen(false); return; }
    setBusy(true);
    try {
      await updateTrackVocalType(track.id, next);
      if (onRefresh) await onRefresh();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <span className={`vocal-pill-wrap ${current}`} ref={ref}>
      <button
        type="button"
        className={`vocal-pill ${current}`}
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        title={TITLES[current]}
      >
        <span className="vp-label">{LABELS[current]}</span>
        <svg className="vp-caret" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="vocal-pill-menu">
          {(['vocal', 'instrumental_pending', 'instrumental_final']).map((opt) => (
            <button
              key={opt}
              type="button"
              className={`vpm-item ${opt === current ? 'active' : ''}`}
              onClick={() => handleChange(opt)}
              disabled={busy}
            >
              <span className="vpm-label">{LABELS[opt]}</span>
              {opt === current && <span className="vpm-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}

// ── Version dropdown (partagé mobile + desktop) ──────────────
// Remplace l'ancien carousel de chips V1/V2/V3 : un trigger compact
// "Nom version ▾" ouvre un menu listant toutes les versions (nom + delta + score)
// et expose l'action "+ Nouvelle version" au pied du menu.

function VersionDropdown({ track, currentVersionName, versions, onSelectVersion, onAddVersion, onRefresh, onGoHome, newVersionLabel, showAddInMenu = true }) {
  const { s } = useLang();
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 220 });
  // actionFor : sous-menu d'actions (renommer/supprimer) pour UNE version precise.
  // null = ferme. Sinon : { v }. Le sous-menu est rendu DANS le menu principal
  // (en position absolute ancree sur la ligne), pas dans un second portal :
  // garantit qu'il est dans menuRef et evite les click-outside transitoires.
  const [actionFor, setActionFor] = useState(null);
  const ref = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const current = versions.find((v) => v.name === currentVersionName) || versions[versions.length - 1];

  useEffect(() => {
    if (!open) return;
    // Click-outside : autorise les clics dans la pill (ref) et dans le menu (menuRef).
    // Le sous-menu d'actions est rendu DANS le menu, donc menuRef.contains le couvre
    // automatiquement.
    const onDown = (e) => {
      if (ref.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
      setActionFor(null);
    };
    const onEsc = (e) => {
      if (e.key !== 'Escape') return;
      if (actionFor) setActionFor(null);
      else setOpen(false);
    };
    // Reposition lors du scroll/resize : le menu est en position: fixed (portal),
    // il doit suivre l'ancre. Sinon il « flotte » à l'ancien offset après scroll.
    const reposition = () => {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      setMenuPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 220) });
    };
    reposition();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, actionFor]);

  // Ouvre/toggle le sous-menu d'actions pour la version cliquee. e.stopPropagation
  // pour ne pas declencher la selection de version sur la ligne parent.
  const openActionMenu = (e, v) => {
    e.stopPropagation();
    e.preventDefault();
    setActionFor((prev) => (prev?.v?.id === v.id ? null : { v }));
  };

  const closeAll = () => { setActionFor(null); setOpen(false); };

  const handleRename = async (v) => {
    setActionFor(null);
    const next = window.prompt(s.fiche.renamePrompt || `Nouveau nom pour "${v.name}" :`, v.name || '');
    if (next == null) return; // annulé
    const trimmed = next.trim();
    if (!trimmed || trimmed === v.name) return;
    try {
      await renameVersion(track.id, v.id, trimmed);
      onRefresh?.();
    } catch (err) {
      console.warn('[VersionDropdown] renameVersion failed', err);
    }
  };

  const handleDelete = async (v) => {
    setActionFor(null);
    const ok = await confirmDialog({
      title: s.fiche.deleteVersionTitle || 'Supprimer cette version ?',
      message: (s.fiche.deleteVersionBody || 'La version "{name}" et son fichier audio seront définitivement supprimés.').replace('{name}', v.name || ''),
      confirmLabel: s.fiche.deleteVersionConfirm || 'Supprimer',
      cancelLabel: s.common?.cancel || 'Annuler',
      danger: true,
    });
    if (ok !== 'confirm') return;
    try {
      // Cas 1 : derniere version d un titre → deleteVersion supprime AUSSI le track
      //         (cf storage.deleteVersion). La fiche actuelle n a plus de cible
      //         valide, on retourne home.
      // Cas 2 : version active supprimee mais d autres existent → on retourne
      //         home plutot que de bricoler une selection automatique (le user
      //         re-cliquera sur le titre depuis la home, simple et previsible).
      // Cas 3 : version non-active supprimee → on reste sur la fiche, refresh.
      const isLast = (versions || []).length <= 1;
      const wasActive = v.name === currentVersionName;
      await deleteVersion(track.id, v.id);
      closeAll();
      onRefresh?.();
      if ((isLast || wasActive) && onGoHome) {
        // Petit delai pour laisser le refresh propager avant de naviguer
        setTimeout(() => onGoHome(), 50);
      }
    } catch (err) {
      console.warn('[VersionDropdown] deleteVersion failed', err);
    }
  };

  if (!current) return null;

  return (
    <div className="version-dropdown" ref={ref}>
      <button
        ref={triggerRef}
        type="button"
        className={`version-dropdown-trigger${open ? ' is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <b>{currentVersionName || current.name}</b>
        <svg className="vdd-chev" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          className="version-dropdown-menu version-dropdown-menu-portal"
          role="listbox"
          style={{
            position: 'fixed',
            top: menuPos.top,
            left: menuPos.left,
            minWidth: menuPos.width,
          }}
        >
          {versions.map((v, idx) => {
            const score = v.analysisResult?.fiche?.globalScore;
            const prev = idx > 0 ? versions[idx - 1]?.analysisResult?.fiche?.globalScore : null;
            const delta = (typeof score === 'number' && typeof prev === 'number') ? score - prev : null;
            const isActive = v.name === currentVersionName;
            // Versions persistees uniquement : on ne propose pas le menu sur la
            // ligne "pending" (id technique commence par "__pending").
            const canEdit = onRefresh && v.id && !String(v.id).startsWith('__pending');
            return (
              <div
                key={v.id}
                className={`vdd-item${isActive ? ' is-active' : ''}`}
                role="option"
                aria-selected={isActive}
                style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
              >
                <button
                  type="button"
                  className="vdd-item-row"
                  onClick={() => {
                    if (!isActive) onSelectVersion?.(track, v);
                    setOpen(false);
                  }}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'transparent', border: 0, color: 'inherit', cursor: 'pointer',
                    padding: 'inherit', font: 'inherit', textAlign: 'left',
                  }}
                >
                  <span className="vdd-item-name">{v.name}</span>
                  <span className="vdd-item-meta">
                    {typeof delta === 'number' && delta !== 0 && (
                      <span className={`vdd-item-delta${delta < 0 ? ' down' : ''}`}>
                        {delta > 0 ? '↑' : '↓'}{Math.abs(delta)}
                      </span>
                    )}
                    {typeof score === 'number' && (
                      <span className="vdd-item-score">{Math.round(score)}</span>
                    )}
                  </span>
                </button>
                {canEdit && (
                  <button
                    type="button"
                    className="vdd-item-actions"
                    onClick={(e) => openActionMenu(e, v)}
                    onMouseDown={(e) => e.stopPropagation()}
                    title={s.vchip?.optionsTitle || 'Options'}
                    aria-label={s.vchip?.optionsTitle || 'Options'}
                    style={{
                      width: 24, height: 24, marginLeft: 8, marginRight: 4,
                      borderRadius: 4, border: 0,
                      background: actionFor?.v?.id === v.id ? 'rgba(245,176,86,.18)' : 'transparent',
                      color: 'inherit', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0.85,
                      flexShrink: 0,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                      <circle cx="3" cy="7" r="1.3" fill="currentColor" />
                      <circle cx="7" cy="7" r="1.3" fill="currentColor" />
                      <circle cx="11" cy="7" r="1.3" fill="currentColor" />
                    </svg>
                  </button>
                )}
                {/* Sous-menu d'actions ancré en position absolute SUR la ligne.
                    Rendu dans menuRef, donc le click-outside listener ne le
                    confond pas avec un clic exterieur. */}
                {actionFor?.v?.id === v.id && (
                  <div
                    role="menu"
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      right: 6,
                      minWidth: 200,
                      background: 'var(--s1)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: 8,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      padding: 4,
                      zIndex: 50,
                    }}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={(e) => { e.stopPropagation(); handleRename(v); }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '8px 12px', borderRadius: 6, border: 0,
                        background: 'transparent', color: 'var(--soft)',
                        cursor: 'pointer', fontSize: 13, fontFamily: 'var(--body)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {s.vchip?.renameLabel || 'Renommer'}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={(e) => { e.stopPropagation(); handleDelete(v); }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '8px 12px', borderRadius: 6, border: 0,
                        background: 'transparent', color: '#ff7a7a',
                        cursor: 'pointer', fontSize: 13, fontFamily: 'var(--body)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,122,122,0.12)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {s.vchip?.deleteVersion || 'Supprimer cette version'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {showAddInMenu && onAddVersion && (
            <button
              type="button"
              className="vdd-item vdd-item-add"
              onClick={() => { setOpen(false); onAddVersion(track); }}
            >
              <span aria-hidden="true">+</span>
              <span>{newVersionLabel}</span>
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

// ── DSP badge (BPM · tonalité · LUFS) ──────────────────────────
// DSP 1.4 — chip mono pour la topbar.
// Source de vérité, par ordre :
//   1. version.bpm/key/lufs (DB) — source canonique, peut avoir été
//      corrigée manuellement par l'utilisateur via DspEditModal.
//   2. analysisResult.dspMetrics — phase 2 du DSP_PLAN, mesure ffmpeg
//      ebur128 (priorité sur fadrMetrics pour le LUFS car bien plus fiable).
//   3. analysisResult.fadrMetrics — fallback pour les versions pending
//      (post-analyse, avant que saveAnalysis ait fini).
// Cet ordre est crucial : si on prenait fadrMetrics ou dspMetrics en
// priorité, une correction manuelle ne serait jamais visible.
function pickDspMetrics(version, analysisResult) {
  const isPending = !version?.id || String(version.id).startsWith('__pending');
  const dbBpm = version?.bpm || null;
  const dbKey = version?.key || null;
  const dbLufs = version?.lufs || null;
  const hasDb = dbBpm || dbKey || dbLufs;

  // Si DB a au moins une valeur ET la version est persistée → DB seule
  if (hasDb && !isPending) {
    return { bpm: dbBpm, key: dbKey, lufs: dbLufs };
  }

  // Sinon (version pending ou DB vide), fallback sur fadrMetrics + dspMetrics
  const fm = analysisResult?.fadrMetrics || {};
  const dm = analysisResult?.dspMetrics || {};
  const bpm = (fm.bpm != null && fm.bpm !== '') ? String(fm.bpm) : dbBpm;
  const key = (typeof fm.key === 'string' && fm.key.trim()) ? fm.key.trim() : dbKey;
  // LUFS : ffmpeg ebur128 (dspMetrics) prioritaire car bien plus fiable que Fadr
  let lufs = null;
  if (typeof dm.lufs === 'number' && Number.isFinite(dm.lufs)) lufs = dm.lufs.toFixed(1);
  else if (typeof fm.lufs === 'number' && Number.isFinite(fm.lufs)) lufs = fm.lufs.toFixed(1);
  else if (typeof fm.lufs === 'string' && fm.lufs.trim()) lufs = fm.lufs.trim();
  else lufs = dbLufs;
  return { bpm: bpm || null, key: key || null, lufs: lufs || null };
}

// Normalise + formate la tonalité pour affichage (chip topbar).
// Cohérent avec normalizeKey() côté backend (decode-api/lib/fadr.js) :
// préfère les bémols en majeur (D# → Eb, A# → Bb, G# → Ab),
// préfère les dièses en mineur (Db → C#, Gb → F#, Ab → G#).
// Les anciennes valeurs Fadr brutes en base ("D#:maj") sont normalisées
// au passage pour rester cohérentes avec les nouvelles ("Eb maj").
function formatDspKey(rawKey) {
  if (!rawKey || typeof rawKey !== 'string') return null;
  const k = rawKey.trim();
  if (!k) return null;

  let note, modeRaw;
  if (k.includes(':')) {
    const parts = k.split(':');
    note = parts[0];
    modeRaw = (parts[1] || '').toLowerCase();
  } else {
    // Soit "Eb maj" / "G min" (déjà normalisé), soit "Am" / "C#m" / "Eb"
    const spaced = k.match(/^([A-G][b#]?)\s+(maj|min|major|minor)$/i);
    if (spaced) { note = spaced[1]; modeRaw = spaced[2].toLowerCase(); }
    else {
      const m = k.match(/^([A-G][b#]?)(m)?$/i);
      if (!m) return k; // valeur libre saisie par l'user → on la respecte
      note = m[1];
      modeRaw = m[2] ? 'min' : 'maj';
    }
  }
  const isMinor = modeRaw.startsWith('min');
  const modeStr = isMinor ? 'min' : 'maj';

  const SHARP_TO_FLAT = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };
  const FLAT_TO_SHARP = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
  const MAJOR_PREFER_FLAT = new Set(['D#', 'A#', 'G#']);
  const MINOR_PREFER_SHARP = new Set(['Db', 'Gb', 'Ab']);
  let normNote = note;
  if (!isMinor && MAJOR_PREFER_FLAT.has(note)) normNote = SHARP_TO_FLAT[note];
  else if (isMinor && MINOR_PREFER_SHARP.has(note)) normNote = FLAT_TO_SHARP[note];
  return `${normNote} ${modeStr}`;
}

function DspBadge({ version, analysisResult, track, onRefresh }) {
  const { bpm, key, lufs } = pickDspMetrics(version, analysisResult);
  const [editOpen, setEditOpen] = useState(false);
  if (!bpm && !key && !lufs && !version?.id) return null;

  const parts = [];
  if (bpm) parts.push(`${bpm} BPM`);
  if (key) parts.push(formatDspKey(key));
  if (lufs) {
    const ls = String(lufs).toLowerCase().includes('lufs') ? String(lufs) : `${lufs} LUFS`;
    parts.push(ls);
  }
  // Si on a un id de version persistee, le badge devient cliquable pour edition
  // manuelle (Fadr est imparfait sur la tonalite — voir DSP_PLAN).
  const editable = !!(version?.id && !String(version.id).startsWith('__pending') && onRefresh);
  const display = parts.length ? parts.join(' · ') : (editable ? '— · — · —' : null);
  if (!display) return null;

  return (
    <>
      <button
        type="button"
        className="fiche-topbar-dsp"
        title={editable ? 'Mesures objectives du fichier audio (clique pour corriger)' : 'Mesures objectives du fichier audio (Fadr)'}
        onClick={editable ? () => setEditOpen(true) : undefined}
        style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '4px 10px',
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.02)',
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: 0.5,
          color: 'var(--muted)',
          whiteSpace: 'nowrap',
          cursor: editable ? 'pointer' : 'default',
        }}
      >
        {display}
      </button>
      {editOpen && (
        <DspEditModal
          version={version}
          track={track}
          initial={{ bpm, key, lufs }}
          onClose={() => setEditOpen(false)}
          onSaved={() => { setEditOpen(false); onRefresh?.(); }}
        />
      )}
    </>
  );
}

function DspEditModal({ version, track, initial, onClose, onSaved }) {
  // LUFS pas editable manuellement : c'est une mesure objective (necessite
  // un loudness meter pour etre precise). Seuls BPM et tonalite sont des
  // valeurs que l'artiste connait et peut corriger. LUFS reste affiche dans
  // le chip topbar quand Fadr le fournit, et sera calcule en interne en
  // phase 2 du DSP_PLAN pour etre toujours disponible.
  const [bpm, setBpm] = useState(initial?.bpm || '');
  const [key, setKey] = useState(initial?.key || '');
  const [applyAll, setApplyAll] = useState(false);
  const [saving, setSaving] = useState(false);
  // Plusieurs versions sur le titre ? Si oui la checkbox "appliquer a toutes"
  // est cochable, sinon on l'affiche grisee + texte explicatif (la fonction
  // existe, juste pas applicable a un titre mono-version).
  const otherVersionsCount = Math.max(0, ((track?.versions || []).length) - 1);
  const canApplyAll = otherVersionsCount > 0;

  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape' && !saving) onClose?.(); };
    document.addEventListener('keydown', onEsc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = prev;
    };
  }, [onClose, saving]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await updateVersionDspMetrics(
        version.id,
        track?.id,
        { bpm: bpm || null, key: key || null },
        applyAll && canApplyAll,
      );
      onSaved?.();
    } catch (err) {
      console.warn('[DspEditModal] save failed', err);
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="add-mini-backdrop"
      onClick={saving ? undefined : onClose}
      role="presentation"
    >
      <div
        className="add-mini-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Mesures objectives"
      >
        <button
          type="button"
          className="add-mini-close"
          onClick={onClose}
          disabled={saving}
          aria-label="Fermer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="add-mini-title">
          Corriger BPM et <em>tonalité</em>
        </div>
        <div className="add-mini-body-text">
          Les valeurs initiales viennent de l'analyse automatique. Tu peux les corriger si nécessaire — le LUFS reste mesuré, pas modifiable.
        </div>

        <div className="add-mini-field">
          <span className="add-mini-field-label">BPM</span>
          <input
            type="number"
            className="add-mini-input"
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
            placeholder="ex: 120"
            disabled={saving}
          />
        </div>

        <div className="add-mini-field">
          <span className="add-mini-field-label">Tonalité</span>
          <input
            type="text"
            className="add-mini-input"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="ex: G maj, Am, F#m"
            disabled={saving}
          />
        </div>

        {/* Checkbox custom stylée — le reset CSS du site masque les
            inputs natifs, on rend donc le carré nous-mêmes. */}
        <div
          role="checkbox"
          aria-checked={applyAll}
          aria-disabled={!canApplyAll || saving}
          tabIndex={canApplyAll && !saving ? 0 : -1}
          onClick={() => { if (canApplyAll && !saving) setApplyAll((v) => !v); }}
          onKeyDown={(e) => {
            if (!canApplyAll || saving) return;
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              setApplyAll((v) => !v);
            }
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginTop: 6, marginBottom: 16,
            fontSize: 13, color: canApplyAll ? 'var(--soft)' : 'var(--muted)',
            cursor: canApplyAll && !saving ? 'pointer' : 'default',
            opacity: canApplyAll ? 1 : 0.55,
            userSelect: 'none',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 16, height: 16,
              borderRadius: 4,
              border: `1px solid ${applyAll ? 'var(--amber)' : 'rgba(255,255,255,0.25)'}`,
              background: applyAll ? 'var(--amber)' : 'transparent',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'all .12s',
            }}
          >
            {applyAll && (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#1b1108" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 6.2l2.3 2.3L9.5 3.5" />
              </svg>
            )}
          </span>
          <span>
            {canApplyAll
              ? `Appliquer aussi aux ${otherVersionsCount} autre${otherVersionsCount > 1 ? 's' : ''} version${otherVersionsCount > 1 ? 's' : ''} de ce titre`
              : 'Aucune autre version sur ce titre'}
          </span>
        </div>

        <div className="add-mini-foot">
          <button
            type="button"
            className="add-mini-btn"
            onClick={onClose}
            disabled={saving}
          >
            Annuler
          </button>
          <button
            type="button"
            className="add-mini-btn is-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── DSP visuels MASTER & LOUDNESS (A.1 + A.2 du DSP_PLAN) ─────────
// Petits composants purs : prennent un nombre, rendent un visuel sobre,
// retournent null si la valeur est absente. Pas d'appels réseau.
//
// Grammaire visuelle :
//   - Couleurs : --amber pour cible, --muted pour neutre, rouge subtle
//     pour critique uniquement. Pas de barres mint→rouge AubioMix.
//   - Bordure carte : rgba(255,255,255,0.08).
//   - Halo max : 0 0 12px rgba(245,176,86,0.04).
//   - Animations fade-in 150ms (gérées en CSS .dsp-master-block).

function pickDspBlockMetrics(analysisResult) {
  const dm = analysisResult?.dspMetrics || {};
  const fm = analysisResult?.fadrMetrics || {};
  const num = (v) => (typeof v === 'number' && Number.isFinite(v)) ? v : null;
  // LUFS : on accepte aussi version.lufs (chaîne "-8.4") pour les fiches
  // déjà persistées avant qu'on enrichisse le JSON. C'est le DspBadge qui
  // s'occupe de la priorité DB > dspMetrics > fadrMetrics ; ici on lit
  // uniquement le JSON post-analyse parce que LRA/truePeak ne sont pas
  // (encore) en colonnes DB séparées.
  return {
    lufs: num(dm.lufs) ?? num(fm.lufs),
    lra: num(dm.lra),
    truePeak: num(dm.truePeak),
  };
}

// Zones LUFS — alignées sur les seuils streaming usuels et sur les
// verdicts pré-calculés côté Claude (lib/claude.js, dspBlock).
const LUFS_ZONES = [
  { max: -16, label: 'Trop sage',    tone: 'soft'   }, // < -16
  { max: -10, label: 'Streaming',    tone: 'low'    }, // -16 → -10
  { max: -7,  label: 'Compétitif',   tone: 'target' }, // -10 → -7
  { max: Infinity, label: 'Surcomprimé', tone: 'critical' }, // > -7
];

// Zones LRA (Loudness Range, en LU). Cohérent avec lraVerdict côté Claude.
const LRA_ZONES = [
  { max: 4,  label: 'Écrasée',     tone: 'critical' },
  { max: 7,  label: 'Standard',    tone: 'low'      },
  { max: 12, label: 'Confortable', tone: 'target'   },
  { max: Infinity, label: 'Large', tone: 'soft'     },
];

// Zones True Peak (dBTP). Cible streaming = -1 dBTP.
// Note : truePeak peut être très négatif (-12+) sur un mix non masterisé.
const TRUE_PEAK_ZONES = [
  { max: -1, label: 'Sous cible',     tone: 'target'   }, // < -1 dBTP : safe
  { max: 0,  label: 'Risque',         tone: 'low'      }, // -1 → 0 : risque clipping intersample
  { max: Infinity, label: 'Clipping', tone: 'critical' }, // > 0 dBTP
];

function findZone(value, zones) {
  if (value == null) return null;
  return zones.find((z) => value < z.max) || zones[zones.length - 1];
}

function toneColor(tone) {
  // Amber affirmé pour cible, ambre clair pour streaming OK,
  // muted pour soft/standard, rouge subtle uniquement pour critique.
  switch (tone) {
    case 'target':   return 'var(--amber, #f5a623)';
    case 'low':      return 'rgba(245,166,35,0.55)';
    case 'soft':     return 'var(--muted, #7c7c80)';
    case 'critical': return 'rgba(255,93,93,0.85)';
    default:         return 'var(--muted, #7c7c80)';
  }
}

// ── A.1 — Loudness meter ──────────────────────────────────────────
// Barre fine 6px pleine largeur avec 4 zones, curseur ambre vertical,
// valeur mono au-dessus. Affiché si LUFS dispo.
function LoudnessMeter({ lufs }) {
  if (lufs == null || !Number.isFinite(lufs)) return null;
  const SCALE_MIN = -25;
  const SCALE_MAX = -3;
  const clamp = (v) => Math.max(SCALE_MIN, Math.min(SCALE_MAX, v));
  const pct = (v) => ((clamp(v) - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
  const cursorPct = pct(lufs);
  const zone = findZone(lufs, LUFS_ZONES);
  const cursorColor = zone?.tone === 'critical'
    ? 'var(--red, #ff5d5d)'
    : 'var(--amber, #f5a623)';
  return (
    <div className="dsp-loudness">
      <div className="dsp-loudness-track" aria-hidden="true">
        {/* 4 zones graduées — largeurs proportionnelles à l'échelle */}
        <div className="dsp-zone z-soft"     style={{ flexBasis: `${pct(-16) - pct(-25)}%` }} />
        <div className="dsp-zone z-streaming"style={{ flexBasis: `${pct(-10) - pct(-16)}%` }} />
        <div className="dsp-zone z-target"   style={{ flexBasis: `${pct(-7)  - pct(-10)}%` }} />
        <div className="dsp-zone z-critical" style={{ flexBasis: `${pct(-3)  - pct(-7)}%`  }} />
      </div>
      {/* Curseur (trait vertical + valeur au-dessus) */}
      <div
        className="dsp-loudness-cursor"
        style={{ left: `${cursorPct}%`, color: cursorColor }}
      >
        <span className="dsp-loudness-value">{lufs.toFixed(1)} LUFS</span>
        <span className="dsp-loudness-line" />
      </div>
      {/* Ticks (échelle dB) */}
      <div className="dsp-loudness-ticks" aria-hidden="true">
        <span style={{ left: `${pct(-25)}%` }}>-25</span>
        <span style={{ left: `${pct(-16)}%` }}>-16</span>
        <span style={{ left: `${pct(-10)}%` }}>-10</span>
        <span style={{ left: `${pct(-7)}%`  }}>-7</span>
        <span style={{ left: `${pct(-3)}%`  }}>-3</span>
      </div>
      {/* Verdict mono caps dans la couleur de la zone */}
      {zone && (
        <div className="dsp-loudness-verdict" style={{ color: toneColor(zone.tone) }}>
          {zone.label}
        </div>
      )}
    </div>
  );
}

// ── A.2 — Mini-card mesure DSP (LRA, True Peak, …) ────────────────
// Card compacte : kicker mono caps, valeur grosse mono ambre,
// mini-barre horizontale 3-4 zones avec curseur, verdict court.
function DspMiniCard({ kicker, value, unit, decimals = 1, scale, zones, displayValue }) {
  if (value == null || !Number.isFinite(value)) return null;
  const { min, max } = scale;
  const clamp = (v) => Math.max(min, Math.min(max, v));
  const pct = (v) => ((clamp(v) - min) / (max - min)) * 100;
  const zone = findZone(value, zones) || zones[zones.length - 1];
  const cursorColor = zone?.tone === 'critical'
    ? 'var(--red, #ff5d5d)'
    : 'var(--amber, #f5a623)';
  const cursorPct = pct(value);
  // Calcule la largeur de chaque zone (utilise zones.max, sauf le dernier
  // qui s'étend jusqu'à scale.max).
  const widths = zones.map((z, i) => {
    const start = i === 0 ? min : zones[i - 1].max;
    const end = (z.max === Infinity || z.max > max) ? max : z.max;
    return Math.max(0, pct(end) - pct(start));
  });
  const display = typeof displayValue === 'function'
    ? displayValue(value)
    : value.toFixed(decimals);
  return (
    <div className="dsp-mini-card">
      <div className="dsp-mini-kicker">{kicker}</div>
      <div className="dsp-mini-value">
        {display}
        <span className="dsp-mini-unit">{unit}</span>
      </div>
      <div className="dsp-mini-track" aria-hidden="true">
        {zones.map((z, i) => (
          <div
            key={i}
            className={`dsp-mini-zone t-${z.tone}`}
            style={{ flexBasis: `${widths[i]}%` }}
          />
        ))}
        <div
          className="dsp-mini-cursor"
          style={{ left: `${cursorPct}%`, color: cursorColor }}
        />
      </div>
      {zone && (
        <div className="dsp-mini-verdict" style={{ color: toneColor(zone.tone) }}>
          {zone.label}
        </div>
      )}
    </div>
  );
}

// Bloc visuel complet (loudness meter + mini-cards) — inséré en tête
// de la section MASTER & LOUDNESS du diagnostic.
function DspMasterBlock({ analysisResult }) {
  const { lufs, lra, truePeak } = pickDspBlockMetrics(analysisResult);
  if (lufs == null && lra == null && truePeak == null) return null;
  return (
    <div className="dsp-master-block">
      {lufs != null && <LoudnessMeter lufs={lufs} />}
      {(lra != null || truePeak != null) && (
        <div className="dsp-mini-row">
          <DspMiniCard
            kicker="PLAGE DYNAMIQUE"
            value={lra}
            unit="LU"
            scale={{ min: 0, max: 16 }}
            zones={LRA_ZONES}
          />
          <DspMiniCard
            kicker="TRUE PEAK"
            value={truePeak}
            unit="dBTP"
            scale={{ min: -6, max: 1 }}
            zones={TRUE_PEAK_ZONES}
            displayValue={(v) => (v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1))}
          />
        </div>
      )}
    </div>
  );
}

// ── Timeline (sticky bar topbar + dropdown versions) ──────────────

function Timeline({ track, currentVersionName, stage, analysisResult, onSelectVersion, onAddVersion, onShareVersion, onExportVersion, onScoreCard, onTracksRefresh, onGoHome }) {
  const { s } = useLang();
  const isMobile = useMobile();

  const versions = track?.versions || [];
  const currentIdx = versions.findIndex((v) => v.name === currentVersionName);
  const current = currentIdx >= 0 ? versions[currentIdx] : versions[versions.length - 1];

  if (!track) return null;

  const stageLabel =
    stage === 'all_done' ? s.fiche.stageAllDone :
    stage === 'fiche_done' ? s.fiche.stageFicheDone :
    s.fiche.stageOther;

  const stageClass =
    stage === 'all_done' ? '' :
    stage === 'fiche_done' ? 'pending' :
    'other';

  const canShare = !!current?.id && current.id !== '__pending_v__';

  // ── Desktop v2 : topbar + versions-row séparés, fidèle à la maquette ──
  if (!isMobile) {
    return (
      <div className="fiche-topbar-wrap">
        <div className="fiche-topbar">
          {onGoHome && (
            <button className="fiche-back" onClick={onGoHome} title={s.fiche.timelineBackHome} aria-label={s.fiche.timelineBackHome}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13l-5-5 5-5"/></svg>
            </button>
          )}
          {/* Titre supprimé de la topbar : il est déjà affiché en gros sur
              l'artwork (.cover-big-title) en colonne droite. */}
          <div className="fiche-topbar-versions">
            <VersionDropdown
              track={track}
              currentVersionName={currentVersionName}
              versions={versions}
              onSelectVersion={onSelectVersion}
              onAddVersion={onAddVersion}
              onRefresh={onTracksRefresh}
              onGoHome={onGoHome}
              newVersionLabel={s.fiche.newVersionTitle || 'Nouvelle version'}
              showAddInMenu={false}
            />
            {onAddVersion && (
              <button
                type="button"
                className="vchip-new"
                title={s.fiche.newVersionTitle}
                onClick={() => onAddVersion(track)}
              >+ {s.fiche.newVersionTitle || 'Nouvelle version'}</button>
            )}
          </div>
          {current && (
            <div className="fiche-topbar-meta">
              <div className="ver-label"><b className={stageClass}>{stageLabel}</b></div>
            </div>
          )}
          {current && <DspBadge version={current} analysisResult={analysisResult} track={track} onRefresh={onTracksRefresh} />}
          {current && (onShareVersion || onExportVersion || onScoreCard) && (
            <div className="fiche-topbar-actions">
              {onShareVersion && (
                <button
                  type="button"
                  className="btn-ic"
                  onClick={() => onShareVersion(track, current)}
                  disabled={!canShare}
                  title={canShare ? s.fiche.timelineShareTitle : s.fiche.timelineSavingInProgress}
                  aria-label={s.fiche.timelineShareBtn}
                >
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 9V2M5.5 4.5L8 2l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 8v4.5h8V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
              {onScoreCard && (
                <button
                  type="button"
                  className="btn-ic"
                  onClick={() => onScoreCard(track, current)}
                  title={s.fiche.timelineScoreCardTitle}
                  aria-label={s.fiche.timelineScoreCardBtn}
                >
                  {/* Icône Score Card : carré avec petit anneau */}
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </button>
              )}
              {onExportVersion && (
                <button
                  type="button"
                  className="btn-ic"
                  onClick={() => onExportVersion(track, current)}
                  title={s.fiche.timelineExportTitle}
                  aria-label={s.fiche.timelineExportBtn}
                >
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12v1.5A1.5 1.5 0 004.5 15h7A1.5 1.5 0 0013 13.5V12"
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    );
  }

  // ── Mobile : rendu historique préservé ──
  return (
    <div className="timeline">
      <div className="track-title">
        <span className="track-title-left">
          {onGoHome && (
            <button className="fiche-back" onClick={onGoHome} title={s.fiche.timelineBackHome}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13l-5-5 5-5"/></svg>
            </button>
          )}
          {/* Titre + badge type vocal retirés : tous deux déjà visibles
              sur l'artwork (.cover-big-title + .cover-vocal-pill). */}
        </span>
        {current && (
          <VersionDropdown
            track={track}
            currentVersionName={currentVersionName}
            versions={versions}
            onSelectVersion={onSelectVersion}
            onAddVersion={onAddVersion}
            onRefresh={onTracksRefresh}
            onGoHome={onGoHome}
            newVersionLabel={s.fiche.newVersionTitle || 'Nouvelle version'}
          />
        )}
      </div>

      {current && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '4px 0 8px' }}>
          <DspBadge version={current} analysisResult={analysisResult} />
        </div>
      )}

      {current && (onShareVersion || onExportVersion || onScoreCard) && (
        <div className="fiche-head-actions">
          {onShareVersion && (
            <button
              type="button"
              className="fiche-head-btn"
              onClick={() => onShareVersion(track, current)}
              disabled={!canShare}
              title={!canShare ? s.fiche.timelineSavingInProgress : s.fiche.timelineShareTitle}
            >
              {/* Icône share iOS-style : flèche vers le haut depuis un carré */}
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 9V2M5.5 4.5L8 2l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 8v4.5h8V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="fhb-label">{s.fiche.timelineShareBtn}</span>
            </button>
          )}
          {onScoreCard && (
            <button
              type="button"
              className="fiche-head-btn"
              onClick={() => onScoreCard(track, current)}
              title={s.fiche.timelineScoreCardTitle}
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span className="fhb-label">{s.fiche.timelineScoreCardBtn}</span>
            </button>
          )}
          {onExportVersion && (
            <button
              type="button"
              className="fiche-head-btn"
              onClick={() => onExportVersion(track, current)}
              title={s.fiche.timelineExportTitle}
            >
              {/* Icône export PDF : flèche vers le bas dans un plateau */}
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12v1.5A1.5 1.5 0 004.5 15h7A1.5 1.5 0 0013 13.5V12"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="fhb-label">{s.fiche.timelineExportBtn}</span>
            </button>
          )}
        </div>
      )}

      {/* .versions-block supprimée en mobile : le choix de version passe
          désormais par le dropdown compact dans .track-title. */}
    </div>
  );
}

// ── FocusModal (modale centrée, click-outside, flèches latérales) ───

function FocusModal({ open, plan, idx, elements, onClose, onPrev, onNext, isResolved, onToggleResolved }) {
  const { s } = useLang();
  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (e.key === 'Escape') onClose?.();
      else if (e.key === 'ArrowLeft') onPrev?.();
      else if (e.key === 'ArrowRight') onNext?.();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose, onPrev, onNext]);

  if (!open || idx == null || !plan?.[idx]) return null;
  const p = plan[idx];
  const prio = (p.p || '').toLowerCase();
  const linkedItems = (elements || []).flatMap((el) =>
    (el.items || [])
      .filter((it) => Array.isArray(p.linkedItemIds) && it.id && p.linkedItemIds.includes(it.id))
      .map((it) => ({ ...it, cat: el.cat }))
  );

  const atFirst = idx === 0;
  const atLast = idx === plan.length - 1;

  const backdrop = 'focus-backdrop';
  const panel = 'focus-panel';
  // (arrows styled via CSS classes now)

  return (
    <div className="focus-backdrop" onClick={onClose}>
      <style>{`
        @keyframes popin { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <button
        className={`focus-arrow focus-arrow-left${atFirst ? ' disabled' : ''}`}
        onClick={(e) => { e.stopPropagation(); if (!atFirst) onPrev(); }}
        aria-label={s.fiche.ariaPrev}
      >‹</button>
      <button
        className={`focus-arrow focus-arrow-right${atLast ? ' disabled' : ''}`}
        onClick={(e) => { e.stopPropagation(); if (!atLast) onNext(); }}
        aria-label={s.fiche.ariaNext}
      >›</button>

      <div className="focus-container" onClick={(e) => e.stopPropagation()}>
      <div className="focus-panel">
        {/* En-tête : compteur + close */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 14, letterSpacing: 2,
            color: '#7c7c80', textTransform: 'uppercase',
          }}>
            <b style={{ color: '#f5b056' }}>{idx + 1}</b> / {plan.length}
          </span>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 8, background: 'transparent',
              border: '1px solid #2a2a2e', color: '#7c7c80', cursor: 'pointer',
              fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label={s.fiche.ariaClose}
          >✕</button>
        </div>

        <h2 style={{
          fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: 26,
          lineHeight: 1.25, color: '#ededed', margin: '0 0 20px',
          display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap',
        }}>
          <span className={`pbadge pbadge-inline ${prio}`}>{(p.p || '').toUpperCase()}</span>
          <span style={{ flex: 1, minWidth: 0 }}>{p.task}</span>
        </h2>

        {p.daw && (
          <div className="daw-box" style={{ marginBottom: 16 }}>
            <span className="daw-label">{s.fiche.focusDawLabel}</span>
            {p.daw}
          </div>
        )}

        {(p.metered || p.target) && (
          <div className="mt-grid" style={{ marginBottom: 16 }}>
            {p.metered && (
              <div className="mt-box m">
                <div className="mt-label">{s.fiche.focusMeasured}</div>
                <div className="mt-val">{p.metered}</div>
              </div>
            )}
            {p.target && (
              <div className="mt-box t">
                <div className="mt-label">{s.fiche.focusTarget}</div>
                <div className="mt-val">{p.target}</div>
              </div>
            )}
          </div>
        )}

        {linkedItems.length > 0 && (
          <div className="linked-elements" style={{ marginBottom: 20 }}>
            <div className="label">{s.fiche.focusLinkedItems}</div>
            <div className="le-list">
              {linkedItems.map(normalizeDiagItem).map((it) => (
                <div className="le" key={it.id}>
                  <span className="cat">{it.cat}</span>
                  <span className="name">{it.title}</span>
                  {typeof it.score === 'number' && <ScoreRingSmall value={it.score} />}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          className={`resolve-action${isResolved ? ' done' : ''}`}
          onClick={onToggleResolved}
        >
          <span className="box">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          {isResolved ? s.fiche.focusResolved : s.fiche.focusMarkResolved}
        </button>
      </div>
      </div>
    </div>
  );
}

// ── VersionChat (panneau glissant) ─────────────────────────

function VersionChat({ versionId, config, analysisResult, open, onClose, anchored = false }) {
  const { lang, s } = useLang();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef(null);
  const textareaRef = useRef(null);

  // Charge l'historique persisté quand la version change — chat scopé par versionId.
  // Si versionId n'est pas encore en DB (__pending_v__) le helper retourne []
  // et on démarre avec une conversation vierge (sauvegardée plus tard quand l'ID existera).
  useEffect(() => {
    let alive = true;
    if (!versionId) { setMessages([]); return; }
    loadChatHistory(versionId).then((hist) => {
      if (alive) setMessages(hist);
    });
    return () => { alive = false; };
  }, [versionId]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const withUser = [...messages, userMsg];
    setMessages(withUser);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);
    try {
      if (controllerRef.current) controllerRef.current.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      const timeout = setTimeout(() => controller.abort(), 45000);
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          locale: lang,
          messages: withUser,
          title: config?.title || '',
          version: config?.version || '',
          daw: config?.daw || 'Logic Pro',
          listening: analysisResult?.listening || null,
          fiche: analysisResult?.fiche || null,
        }),
      });
      clearTimeout(timeout);
      const json = await res.json();
      const next = [...withUser, { role: 'assistant', content: json.reply || '…' }];
      setMessages(next);
      // Fire-and-forget : on ne bloque pas l'UI, les erreurs sont logguées côté helper.
      saveChatHistory(versionId, next);
    } catch (e) {
      if (e.name !== 'AbortError') {
        const next = [...withUser, { role: 'assistant', content: s.fiche.chatError }];
        setMessages(next);
        saveChatHistory(versionId, next);
      }
    } finally { setLoading(false); controllerRef.current = null; }
  };

  // Efface l'historique (local + DB) après confirmation. Le helper
  // saveChatHistory gere le cas versionId non persiste : no-op silencieux.
  const handleClear = async () => {
    if (!messages.length || loading) return;
    const res = await confirmDialog({
      title: s.fiche.chatClearConfirmTitle,
      message: s.fiche.chatClearConfirmBody,
      confirmLabel: s.fiche.chatClearConfirmLabel,
      cancelLabel: s.common.cancel,
      danger: true,
    });
    if (res !== 'confirm') return;
    setMessages([]);
    saveChatHistory(versionId, []);
  };

  return (
    <>
      {!anchored && <div className="chat-backdrop" onClick={onClose} />}
      <aside className={`chat-panel${anchored ? ' chat-panel-anchored' : ''}`}>
        <div className="chat-head">
          <span className="ctitle">{s.fiche.chatTitle}</span>
          <div className="chat-head-actions">
            {messages.length > 0 && (
              <button
                type="button"
                className="cclear"
                onClick={handleClear}
                disabled={loading}
                title={s.fiche.chatClearTitle}
                aria-label={s.fiche.chatClearTitle}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 4h10M6.5 4V2.5a1 1 0 011-1h1a1 1 0 011 1V4m-5 0v9a1.5 1.5 0 001.5 1.5h4a1.5 1.5 0 001.5-1.5V4"
                        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            {!anchored && (
              <button
                type="button"
                className="cclose"
                onClick={onClose}
                title={s.common?.close || 'Fermer'}
                aria-label={s.common?.close || 'Fermer'}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="chat-body">
          {messages.length === 0 && (
            <div className="msg ai">
              <span className="ai-label">{s.fiche.chatAiName}</span>
              {s.fiche.chatEmpty}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role === 'assistant' ? 'ai' : m.role}`}>
              {m.role === 'assistant' && <span className="ai-label">{s.fiche.chatAiName}</span>}
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="msg ai">
              <span className="ai-label">{s.fiche.chatAiName}</span>
              <span className="chat-typing">
                <span className="dot" /><span className="dot" /><span className="dot" />
              </span>
            </div>
          )}
        </div>
        <div className="chat-input">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={s.fiche.chatPlaceholderAnalysis}
            rows={1}
          />
          <button onClick={send}>{s.fiche.chatSend}</button>
        </div>
      </aside>
    </>
  );
}

// ── Helpers durée / delta ─────────────────────────────────

function fmtDuration(sec) {
  if (sec == null || !isFinite(sec)) return '—';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
function fmtScoreDelta(cur, prev, eqLabel = '= v. préc.') {
  if (cur == null || prev == null) return null;
  const d = cur - prev;
  if (d === 0) return eqLabel;
  return `${d > 0 ? '+' : '−'}${Math.abs(Math.round(d))} pts`;
}
function fmtDurationDelta(cur, prev, eqLabel = '= v. préc.') {
  if (cur == null || prev == null) return null;
  const d = Math.round(cur - prev);
  if (d === 0) return eqLabel;
  return `${d > 0 ? '+' : '−'}${Math.abs(d)}s`;
}
function scoreTier(v) {
  if (v == null) return 'mid';
  if (v < 60) return 'low';
  if (v < 75) return 'mid';
  return 'high';
}

// ── EvolutionPanel (sparkline + 2 stats) ──────────────────

function EvolutionPanel({ versionScores, currentVersionName, currentScore, currentDuration, prevScore, prevDuration }) {
  const { s } = useLang();
  const scores = versionScores.map((v) => v.score).filter((x) => typeof x === 'number');
  const hasMultiple = scores.length >= 2;
  const maxScore = scores.length ? Math.max(...scores, 100) : 100;
  const firstName = versionScores[0]?.name;
  const lastName = versionScores[versionScores.length - 1]?.name;
  const deltaLabel = fmtScoreDelta(currentScore, prevScore, s.fiche.deltaEqualPrev);

  return (
    <div className="evolution-panel">
      <div className="vr-title">
        {hasMultiple ? s.fiche.evolutionFromTo.replace('{first}', firstName).replace('{last}', lastName) : s.fiche.evolutionTitle}
      </div>

      <div className="spark">
        {versionScores.length === 0 ? (
          <div className="spark-empty">—</div>
        ) : versionScores.map((v, i) => {
          const sc = typeof v.score === 'number' ? v.score : 0;
          const h = Math.max(6, (sc / maxScore) * 100);
          const tier = scoreTier(v.score);
          const isLatest = i === versionScores.length - 1;
          return (
            <div
              key={i}
              className={`bar ${tier}${isLatest ? ' latest' : ''}`}
              style={{ height: `${h}%` }}
              title={`${v.name} · ${typeof v.score === 'number' ? v.score : '—'}`}
            >
              <div className="v-num">{typeof v.score === 'number' ? v.score : '—'}</div>
              <div className="v-label">{v.name}</div>
            </div>
          );
        })}
      </div>

      {hasMultiple && (
        <div className="evo-label">
          <span>{firstName} · {versionScores[0]?.score ?? '—'}</span>
          {deltaLabel && <span className={`delta ${currentScore - prevScore >= 0 ? 'up' : 'down'}`}>{deltaLabel}</span>}
          <span>{lastName} · {versionScores[versionScores.length - 1]?.score ?? '—'}</span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat">
          <div className="k">{s.fiche.statVersionActive}</div>
          <div className="v" title={currentVersionName || ''}>{currentVersionName || '—'}</div>
          <div className="d">
            {prevScore != null && currentScore != null
              ? (fmtScoreDelta(currentScore, prevScore, s.fiche.deltaEqualPrev) || `${currentScore} pts`)
              : (currentScore != null ? `${currentScore} pts` : '—')}
          </div>
        </div>
        <div className="stat">
          <div className="k">{s.fiche.statDuration}</div>
          <div className="v">{fmtDuration(currentDuration)}</div>
          <div className="d">
            {fmtDurationDelta(currentDuration, prevDuration, s.fiche.deltaEqualPrev) || '—'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── QualitativeSection v2 (2 colonnes : impression toggle | forts+travail) ──

// Normalise un titre de section (enlève accents, met en minuscules)
function normSectionTitle(t) {
  return (t || '')
    .toString()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Mappe une section du legacy parser vers un bucket qualitatif
function routeLegacySection(sec) {
  const t = normSectionTitle(sec.title);
  if (/points? forts?|forces/.test(t)) return 'forts';
  if (/a travailler|axes|faiblesses|points? faibles?|a ameliorer/.test(t)) return 'travail';
  if (/espace|image stereo|stereo/.test(t)) return 'espace';
  if (/dynamique|punch/.test(t)) return 'dynamique';
  if (/potentiel|possibles?|possibilites?/.test(t)) return 'potentiel';
  if (/impression|ecoute|global|verdict|ressenti/.test(t) || t === '') return 'impression';
  return 'impression';
}

// Convertit les blocs parsés en texte (paras concatenés) ou tableau de bullets
function blocksToText(blocks) {
  return blocks.filter((b) => b.type === 'para').map((b) => b.text).join('\n\n').trim();
}
function blocksToBullets(blocks) {
  const bullets = blocks.filter((b) => b.type === 'bullet').map((b) => b.text);
  // Si pas de bullets explicites mais des paragraphes courts, on les traite comme items
  if (bullets.length === 0) {
    const paras = blocks.filter((b) => b.type === 'para').map((b) => b.text);
    if (paras.length > 1 && paras.every((p) => p.length < 200)) return paras;
  }
  return bullets;
}

export function QualitativeSection({ listening }) {
  const { s } = useLang();
  const isMobile = useMobile();
  const [expanded, setExpanded] = useState(false);
  const [fortsOpen, setFortsOpen] = useState(false);
  const [travailOpen, setTravailOpen] = useState(false);
  if (!listening) return null;

  // 1. Format structuré (nouvelles fiches)
  let impression = listening?.impression;
  let points = Array.isArray(listening?.points_forts) ? listening.points_forts : [];
  let aTravailler = Array.isArray(listening?.a_travailler) ? listening.a_travailler : [];
  let espace = listening?.espace;
  let dynamique = listening?.dynamique;
  let potentiel = listening?.potentiel;

  const hasStructured = impression || points.length || aTravailler.length || espace || dynamique || potentiel;

  // 2. Fallback legacy : texte brut parsé → route vers les buckets
  if (!hasStructured) {
    let text = null;
    if (typeof listening === 'string') text = listening;
    else if (listening?.text) text = listening.text;
    else if (listening?.content) text = listening.content;
    const legacySections = text ? parseListening(text) : [];
    const bucketText = { impression: [], espace: [], dynamique: [], potentiel: [] };
    const bucketList = { forts: [], travail: [] };
    for (const sec of legacySections) {
      const bucket = routeLegacySection(sec);
      if (bucket === 'forts' || bucket === 'travail') {
        bucketList[bucket].push(...blocksToBullets(sec.blocks));
      } else {
        const t = blocksToText(sec.blocks);
        if (t) bucketText[bucket].push(t);
      }
    }
    impression = bucketText.impression.join('\n\n') || impression;
    espace = bucketText.espace.join('\n\n') || espace;
    dynamique = bucketText.dynamique.join('\n\n') || dynamique;
    potentiel = bucketText.potentiel.join('\n\n') || potentiel;
    points = bucketList.forts.length ? bucketList.forts : points;
    aTravailler = bucketList.travail.length ? bucketList.travail : aTravailler;
  }

  const hasAny = impression || points.length || aTravailler.length || espace || dynamique || potentiel;
  if (!hasAny) return null;

  // Section repliee par defaut : par surface on garde uniquement la citation
  // d'impression. Le bouton "Deployer" revele points forts, a travailler,
  // espace, dynamique et potentiel.
  const hasDeploy = points.length || aTravailler.length || potentiel || espace || dynamique;

  // Desktop (v2) : UN SEUL conteneur "Écoute qualitative" (panel cerulean),
  // avec eyebrow tout en haut, citation impression en dessous, puis tous les
  // sous-blocs (points forts, à travailler, espace, dynamique, potentiel)
  // imbriqués à l'intérieur comme des sous-items (pas des cartes séparées).
  // Matche exactement la maquette maquette-v2-complete.
  if (!isMobile) {
    return (
      <section className={`row-qualitative stacked${expanded ? ' expanded' : ''}`}>
        <div className="q-eyebrow cerulean">
          <span className="dot" />{s.fiche.listeningTitle}
        </div>

        {impression && (
          <div className="q-citation">
            <p>{renderWithEmphasis(impression)}</p>
          </div>
        )}

        {expanded && (
          <div className="q-subgrid">
            {points.length > 0 && (
              <div className="q-sub forts">
                <div className="q-sublabel mint">{s.fiche.blockPointsForts}</div>
                <ul>
                  {points.map((p, i) => <li key={i}>{renderWithEmphasis(p)}</li>)}
                </ul>
              </div>
            )}
            {aTravailler.length > 0 && (
              <div className="q-sub travail">
                <div className="q-sublabel amber">{s.fiche.blockATravailler}</div>
                <ul>
                  {aTravailler.map((p, i) => <li key={i}>{renderWithEmphasis(p)}</li>)}
                </ul>
              </div>
            )}
            {espace && (
              <div className="q-sub espace">
                <div className="q-sublabel cerulean">{s.fiche.blockEspace}</div>
                <div className="q-subbody">{renderWithEmphasis(espace)}</div>
              </div>
            )}
            {dynamique && (
              <div className="q-sub dynamique">
                <div className="q-sublabel cerulean">{s.fiche.blockDynamique}</div>
                <div className="q-subbody">{renderWithEmphasis(dynamique)}</div>
              </div>
            )}
            {potentiel && (
              <div className="q-sub potentiel">
                <div className="q-sublabel cerulean">{s.fiche.blockPotentiel}</div>
                <div className="q-subbody">{renderWithEmphasis(potentiel)}</div>
              </div>
            )}
          </div>
        )}

        {hasDeploy && (
          <button className="impression-toggle" onClick={() => setExpanded((v) => !v)}>
            {expanded ? s.fiche.toggleReduceDash : s.fiche.toggleExpandListening}
          </button>
        )}
      </section>
    );
  }

  // Mobile : layout historique (2 colonnes impression+potentiel | forts+travail)
  return (
    <section className={`row-qualitative${expanded ? ' expanded' : ''}`}>
      {/* Colonne gauche : Impression (+ Potentiel) → déploie Espace + Dynamique */}
      <div className="q-block impression">
        <div className="q-title"><span className="dot" />{s.fiche.blockImpression}</div>

        <div className="impression-summary">
          {impression && <p>{renderWithEmphasis(impression)}</p>}
        </div>

        <div className="impression-full">
          {potentiel && (
            <>
              <div className="subq-title">{s.fiche.blockPotentiel}</div>
              <p>{renderWithEmphasis(potentiel)}</p>
            </>
          )}
          {espace && (
            <>
              <div className="subq-title">{s.fiche.blockEspace}</div>
              <p>{renderWithEmphasis(espace)}</p>
            </>
          )}
          {dynamique && (
            <>
              <div className="subq-title">{s.fiche.blockDynamique}</div>
              <p>{renderWithEmphasis(dynamique)}</p>
            </>
          )}
        </div>

        {hasDeploy && (
          <button className="impression-toggle" onClick={() => setExpanded((v) => !v)}>
            {expanded ? s.fiche.toggleReduceDash : s.fiche.toggleExpandListening}
          </button>
        )}
      </div>

      {/* Colonne droite : Points forts + À travailler (collapsés par défaut, clic pour déployer) */}
      <div className="q-stack">
        {points.length > 0 && (
          <div className={`q-block forts collapsible${fortsOpen ? ' open' : ''}`}>
            <button
              type="button"
              className="q-head"
              onClick={() => setFortsOpen((v) => !v)}
              aria-expanded={fortsOpen}
            >
              <span className="q-title"><span className="dot" />{s.fiche.blockPointsForts}</span>
              <span className="q-count">{points.length}</span>
              <span className="q-chev" aria-hidden="true">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            <div className="q-body">
              <ul>
                {points.map((p, i) => <li key={i}>{renderWithEmphasis(p)}</li>)}
              </ul>
            </div>
          </div>
        )}
        {aTravailler.length > 0 && (
          <div className={`q-block travail collapsible${travailOpen ? ' open' : ''}`}>
            <button
              type="button"
              className="q-head"
              onClick={() => setTravailOpen((v) => !v)}
              aria-expanded={travailOpen}
            >
              <span className="q-title"><span className="dot" />{s.fiche.blockATravailler}</span>
              <span className="q-count">{aTravailler.length}</span>
              <span className="q-chev" aria-hidden="true">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            <div className="q-body">
              <ul>
                {aTravailler.map((p, i) => <li key={i}>{renderWithEmphasis(p)}</li>)}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── NotesSection (bloc notes perso, 1 par fiche) ───────────

function NotesSection({ versionId, initialNotes, v2 = false }) {
  const { s } = useLang();
  const [notes, setNotes] = useState(initialNotes || '');
  const [open, setOpen] = useState(() => v2 || Boolean(initialNotes && initialNotes.trim()));
  const [status, setStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'
  const taRef = useRef(null);
  const timerRef = useRef(null);
  const resetTimerRef = useRef(null);
  const lastSavedRef = useRef(initialNotes || '');

  // Auto-resize textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(400, Math.max(60, ta.scrollHeight)) + 'px';
  }, [notes, open]);

  // Nettoyage à l'unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const canEdit = Boolean(versionId) && versionId !== '__pending_v__' && versionId !== '__pending__';
  const label = status === 'saving' ? s.fiche.notesStatusSaving : status === 'saved' ? s.fiche.notesStatusSaved : null;

  const handleChange = (e) => {
    const next = e.target.value;
    setNotes(next);
    if (!canEdit) return;
    if (next === lastSavedRef.current) return;
    setStatus('saving');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        await saveVersionNotes(versionId, next);
        lastSavedRef.current = next;
        setStatus('saved');
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
        resetTimerRef.current = setTimeout(() => setStatus('idle'), 1400);
      } catch (err) {
        console.warn('[NotesSection] save error', err);
        setStatus('idle');
      }
    }, 1100);
  };

  const flushSave = async () => {
    if (!canEdit) return;
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (notes === lastSavedRef.current) {
      setStatus('saved');
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setStatus('idle'), 1400);
      return;
    }
    setStatus('saving');
    try {
      await saveVersionNotes(versionId, notes);
      lastSavedRef.current = notes;
      setStatus('saved');
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setStatus('idle'), 1400);
    } catch (err) {
      console.warn('[NotesSection] flush save error', err);
      setStatus('idle');
    }
  };

  const clearNotes = () => {
    setNotes('');
    if (!canEdit) return;
    if (lastSavedRef.current === '') return;
    setStatus('saving');
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    (async () => {
      try {
        await saveVersionNotes(versionId, '');
        lastSavedRef.current = '';
        setStatus('saved');
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
        resetTimerRef.current = setTimeout(() => setStatus('idle'), 1400);
      } catch (err) {
        console.warn('[NotesSection] clear save error', err);
        setStatus('idle');
      }
    })();
  };

  if (v2) {
    return (
      <section className="notes-section v2">
        <div className="notes-panel">
          <div className="notes-eyebrow">
            <span className="dot" />
            {s.fiche.notesTitleV2 || s.fiche.notesTitle}
            {label && <span className="notes-status" aria-live="polite">{label}</span>}
          </div>
          <textarea
            ref={taRef}
            className="notes-box"
            value={notes}
            onChange={handleChange}
            placeholder={canEdit
              ? (s.fiche.notesPlaceholderV2 || s.fiche.notesPlaceholder)
              : s.fiche.notesPlaceholderDisabled}
            disabled={!canEdit}
            rows={3}
          />
          <div className="notes-actions">
            <button
              type="button"
              className="btn"
              onClick={clearNotes}
              disabled={!canEdit || !notes}
            >
              {s.fiche.notesClear || 'Effacer'}
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={flushSave}
              disabled={!canEdit}
            >
              {s.fiche.notesSave || 'Enregistrer'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="notes-section">
      <div className={`notes-block collapsible${open ? ' open' : ''}`}>
        <button className="notes-head" type="button" onClick={() => setOpen((v) => !v)}>
          <span className="notes-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 13V3h7l3 3v7H3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M10 3v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M5.5 8.5h5M5.5 10.5h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </span>
          <span className="notes-title">{s.fiche.notesTitle}</span>
          {notes && notes.trim() && !open && (
            <span className="notes-preview">{notes.trim().slice(0, 80)}{notes.trim().length > 80 ? '…' : ''}</span>
          )}
          <span className="notes-status" aria-live="polite">{label}</span>
          <span className="notes-chev" aria-hidden="true">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
        <div className="notes-body">
          <textarea
            ref={taRef}
            className="notes-textarea"
            value={notes}
            onChange={handleChange}
            placeholder={canEdit
              ? s.fiche.notesPlaceholder
              : s.fiche.notesPlaceholderDisabled}
            disabled={!canEdit}
            rows={3}
          />
        </div>
      </div>
    </section>
  );
}

// ── IntentPanel (panneau « Intention artistique ») ─────────
// Affiche l'intention déclarée par l'artiste qui a calibré la fiche.
// Priorité de lecture :
//   1. analysisResult.intent_used     → intention fraîchement saisie dans ce run
//   2. versionInDb.versionIntent      → override au niveau de la version courante
//   3. currentTrack.artisticIntent    → intention « de base » du titre
// Renvoie null s'il n'y en a aucune (pipeline non-calibré ou ancien run).
export function IntentPanel({ analysisResult, currentTrack, versionInDb, open: openProp, onToggle }) {
  const { s } = useLang();
  // Mode contrôlé optionnel : si `open`/`onToggle` sont fournis, on s'aligne
  // dessus (cf. SampleFicheScreen qui orchestre un accordéon strict). Sinon,
  // état interne classique (comportement historique sur la vraie fiche).
  const [openInternal, setOpenInternal] = useState(false);
  const isControlled = typeof openProp === 'boolean';
  const open = isControlled ? openProp : openInternal;
  const handleToggle = () => {
    if (onToggle) onToggle();
    if (!isControlled) setOpenInternal((v) => !v);
  };
  const fresh = (typeof analysisResult?.intent_used === 'string' && analysisResult.intent_used.trim()) || null;
  const verIntent = (typeof versionInDb?.versionIntent === 'string' && versionInDb.versionIntent.trim()) || null;
  const trkIntent = (typeof currentTrack?.artisticIntent === 'string' && currentTrack.artisticIntent.trim()) || null;
  const intent = fresh || verIntent || trkIntent;
  if (!intent) return null;
  const scope = fresh
    ? (analysisResult?._intent_scope === 'version' ? 'version' : (analysisResult?._intent_scope || 'track'))
    : (verIntent ? 'version' : 'track');
  const scopeLabel = scope === 'version'
    ? (s.fiche?.intentScopeVersion || 'cette version')
    : (s.fiche?.intentScopeTrack || 'ce titre');
  return (
    <section className={`intent-panel-fiche${open ? ' open' : ''}`} aria-label="Intention artistique">
      <button
        type="button"
        className="intent-panel-eyebrow"
        aria-expanded={open}
        onClick={handleToggle}
      >
        <span className="intent-panel-label">
          <span className="intent-panel-title-row">
            <span className="dot" />
            <span className="intent-panel-title">
              {s.fiche?.intentKicker || 'Intention artistique'}
            </span>
          </span>
          <span className="intent-panel-scope">
            {s.fiche?.intentScopePrefix || 'Appliquée à'} {scopeLabel}
          </span>
        </span>
        <span className="intent-panel-chev" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {open && <p className="intent-panel-body">« {intent} »</p>}
    </section>
  );
}

// ── FicheScreen (principal) ────────────────────────────────

export default function FicheScreen({ config, analysisResult, onSelectVersion, onAddVersion, onGoHome, refreshKey }) {
  const { s, lang } = useLang();
  const [tracks, setTracks] = useState([]);
  // Fiche traduite (lazy) — null tant qu'on n'a pas fetché, sinon l'objet
  // `{ fiche, listening, ... }` dans la langue courante. Clé = `${versionId}::${lang}`.
  const [localizedAR, setLocalizedAR] = useState(null);
  const [localizedKey, setLocalizedKey] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [openCat, setOpenCat] = useState(null); // tous fermés par défaut — l'utilisateur ouvre ce qu'il veut
  const [openPlanIdx, setOpenPlanIdx] = useState(null);
  const [resolved, setResolved] = useState(new Set());
  const [hideResolved, setHideResolved] = useState(false);
  // Ticket 2.1 — items diagnostiques cochés (clés stables via diagItemKey).
  // Set<string>. Persisté dans Supabase (table mix_note_completions).
  const [completedItems, setCompletedItems] = useState(new Set());
  const [chatOpen, setChatOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState(null); // { track, version } ouverts dans la modale d'export PDF
  const [shareTarget, setShareTarget] = useState(null);   // { track, version } ouverts dans la modale de partage
  const [verdictExpanded, setVerdictExpanded] = useState(false); // verdict rétracté par défaut
  // Ticket 4.4 — état du toggle "Marquer comme finale" (plateau detector).
  const [markFinalBusy, setMarkFinalBusy] = useState(false);
  const isMobile = useMobile();
  const isNarrow = useNarrowDesktop(1200);
  const chatAsDrawer = isMobile || isNarrow;
  const planRefs = useRef({});

  // Scroll doux vers l'item Plan d'action ouvert
  useEffect(() => {
    if (openPlanIdx == null) return;
    const el = planRefs.current[openPlanIdx];
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch {
        el.scrollIntoView();
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [openPlanIdx]);

  useEffect(() => {
    let alive = true;
    loadTracks().then((t) => { if (alive) setTracks(t); });
  }, [config?.title, config?.version, analysisResult, refreshKey]);

  // Préchargement ciblé des versions du morceau courant : dès que la fiche
  // est ouverte, on télécharge en arrière-plan les MP3 de toutes les versions
  // (V1/V2/V3…) pour que le switch A/B soit instantané, même au 1ᵉʳ clic.
  // C'est le remplaçant ciblé du preload "playlist entière" qui consommait
  // de l'egress Supabase pour des morceaux que l'utilisateur n'allait pas écouter.
  useEffect(() => {
    if (!config?.title) return;
    const t = tracks.find((x) => x.title === config.title);
    if (t?.versions?.length) preloadTrackVersions(t.versions);
  }, [tracks, config?.title]);

  // body class pour le chat (maquette utilise body.chat-open)
  useEffect(() => {
    if (chatOpen) document.body.classList.add('chat-open');
    else document.body.classList.remove('chat-open');
    return () => document.body.classList.remove('chat-open');
  }, [chatOpen]);

  // ESC global : referme le plan ouvert ou le chat
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') {
        if (openPlanIdx != null) setOpenPlanIdx(null);
        else if (chatOpen) setChatOpen(false);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [openPlanIdx, chatOpen]);

  // Ticket 2.1 — charge l'état de la checklist quand on change de version.
  // versionInDb?.id n'est pas dispo tant que la version n'est pas persistée
  // (cas pending) ; loadNoteCompletions retourne alors un Set vide silencieux.
  const completionsVersionId = (() => {
    const dbTrack2 = tracks.find((t) => t.title === config?.title) || null;
    const v = dbTrack2?.versions?.find((vv) => vv.name === config?.version);
    return v?.id || null;
  })();
  useEffect(() => {
    if (!completionsVersionId) { setCompletedItems(new Set()); return; }
    let alive = true;
    loadNoteCompletions(completionsVersionId).then((set) => {
      if (alive) setCompletedItems(set);
    });
    return () => { alive = false; };
  }, [completionsVersionId]);

  // Toggle d'une checkbox d'item diag — optimistic update + persist.
  const toggleItemCompletion = (itemKey) => {
    if (!completionsVersionId) return;
    const wasCompleted = completedItems.has(itemKey);
    setCompletedItems((prev) => {
      const next = new Set(prev);
      if (wasCompleted) next.delete(itemKey);
      else next.add(itemKey);
      return next;
    });
    setNoteCompletion(completionsVersionId, itemKey, !wasCompleted);
  };

  const dbTrack = tracks.find((t) => t.title === config?.title) || null;
  // Si le track DB existe mais ne contient pas encore la version courante (save en cours),
  // utiliser un fallback avec la version en mémoire pour afficher les VChips immédiatement
  const versionInDb = dbTrack?.versions?.find(v => v.name === config?.version);
  const currentTrack = (dbTrack && versionInDb) ? dbTrack : (dbTrack && !versionInDb && config?.version) ? {
    ...dbTrack,
    versions: [...(dbTrack.versions || []), {
      id: "__pending_v__",
      name: config.version,
      analysisResult: analysisResult || null,
    }],
  } : dbTrack || (config?.title ? {
    id: "__pending__",
    title: config.title,
    versions: [{
      id: "__pending_v__",
      name: config.version || "V1",
      analysisResult: analysisResult || null,
    }],
  } : null);

  // ── i18n : traduction à la volée de la fiche + écoute ──────
  // On ne traduit que quand on a un id de version (persisté en DB).
  // Tant que la traduction n'est pas revenue, on montre l'original (meilleur
  // compromis UX : l'utilisateur voit toujours quelque chose, et l'indicateur
  // `translating` est affiché sur le panneau verdict/écoute).
  // La clé inclut une empreinte du payload source : si l'analyse est
  // re-sauvegardée, la clé change et on refait une traduction fraîche.
  const versionId = versionInDb?.id || null;
  const sourceStamp = analysisResult?._stage === 'idle'
    ? (analysisResult?.fiche ? 'ready' : 'empty')
    : (analysisResult?._stage || 'idle');
  const langKey = versionId ? `${versionId}::${lang}::${sourceStamp}` : null;
  useEffect(() => {
    if (!versionId || !analysisResult) return;
    // Si la clé courante = celle déjà fetchée, rien à faire.
    if (langKey && langKey === localizedKey) return;
    let alive = true;
    setTranslating(true);
    (async () => {
      try {
        const tr = await loadVersionLocalized(versionId, lang);
        if (!alive) return;
        setLocalizedAR(tr || null);
        setLocalizedKey(langKey);
      } catch (e) {
        console.warn('[FicheScreen] loadVersionLocalized failed', e?.message);
        if (alive) { setLocalizedAR(null); setLocalizedKey(langKey); }
      } finally {
        if (alive) setTranslating(false);
      }
    })();
    return () => { alive = false; };
  }, [versionId, lang, analysisResult, langKey, localizedKey]);

  // `displayAR` = analysisResult rendu à l'écran.
  //  - Si on a une traduction valide pour la clé courante → on la sert.
  //  - Sinon on retombe sur l'original (pas encore fetché, pas d'id, fallback).
  const displayAR = (langKey && langKey === localizedKey && localizedAR)
    ? localizedAR
    : analysisResult;

  const rawFiche = displayAR?.fiche || null;
  const listening = displayAR?.listening || null;
  const stage = displayAR?._stage || analysisResult?._stage || 'idle';

  // Type vocal du titre : priorité à la DB (la source de vérité), fallback
  // sur config.vocalType fraîchement choisi pendant l'import (avant que
  // le titre n'arrive en DB).
  const vocalType = currentTrack?.vocalType || config?.vocalType || 'vocal';

  // Applique le type vocal à la fiche courante :
  //  - 'instrumental_final' filtre la catégorie VOIX + items plan liés, recalcule score
  //  - 'instrumental_pending' ne filtre rien mais signale un relabel de la catégorie voix
  //  - 'vocal' : no-op
  const {
    elements,
    plan,
    globalScore: adjustedScore,
    voiceLabelOverride,
  } = applyVocalTypeToFiche(rawFiche, vocalType);
  const score = typeof adjustedScore === 'number' ? adjustedScore : null;

  // ── Données pour EvolutionPanel (sparkline + stats) ──
  // Pour que le graphique reste cohérent avec la fiche courante quand le
  // titre est 'instrumental_final', on recalcule le score de chaque version
  // (et pas seulement de la courante) via le même helper.
  const allVersions = currentTrack?.versions || [];
  const currentIdx = allVersions.findIndex((v) => v.name === config?.version);
  const adjustVersionScore = (v) => {
    const f = v?.analysisResult?.fiche;
    if (!f) return null;
    const { globalScore: s } = applyVocalTypeToFiche(f, vocalType);
    return typeof s === 'number' ? s : null;
  };
  const versionScores = allVersions.map((v, i) => ({
    name: v.name,
    // la version courante peut être en cours d'analyse → utiliser le `score` en mémoire plutôt que l'ancien analysisResult
    score: i === currentIdx && score != null ? score : adjustVersionScore(v),
  }));
  const currentDuration =
    (currentIdx >= 0 && allVersions[currentIdx]?.analysisResult?.fiche?.duration_seconds) ??
    rawFiche?.duration_seconds ??
    null;
  const prevVersion = currentIdx > 0 ? allVersions[currentIdx - 1] : null;
  const prevScore = adjustVersionScore(prevVersion);
  const prevDuration = prevVersion?.analysisResult?.fiche?.duration_seconds ?? null;

  // ── Suivi inter-versions (bandeau évolution discret) ──
  // Si le backend a généré un objet `evolution` (= une V précédente
  // avec listening était stockée), on l'affiche dans la colonne droite
  // juste au-dessus du panneau Intention artistique. Le delta numérique
  // reste rendu dans .score-calibration de la zone verdict.
  const evolution = displayAR?.evolution || null;
  const evolutionPrevName =
    displayAR?._previousVersionName || prevVersion?.name || null;
  // Pré-calcul de la présence d'une intention (mêmes sources que IntentPanel),
  // pour décider si le wrapper colonne-droite (bandeau + intent) doit être rendu.
  const hasIntentSource = !!(
    (typeof displayAR?.intent_used === 'string' && displayAR.intent_used.trim()) ||
    (typeof versionInDb?.versionIntent === 'string' && versionInDb.versionIntent.trim()) ||
    (typeof currentTrack?.artisticIntent === 'string' && currentTrack.artisticIntent.trim())
  );

  const toggleCat = (i) => setOpenCat((prev) => (prev === i ? null : i));

  const toggleResolved = (key, planIdx = null) => {
    let becameResolved = false;
    setResolved((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        becameResolved = true;
      }
      return next;
    });
    // Replie l'accordéon quand on passe en "résolu" (mais pas au décochage)
    if (becameResolved && planIdx != null) {
      setOpenPlanIdx((prev) => (prev === planIdx ? null : prev));
    }
  };

  // Handlers ⋯ version (depuis le menu d'une VChip)
  // Ces handlers sont rattachés à une version précise (pas forcément la version
  // actuellement affichée) : on stocke { track, version } pour que chaque
  // modale (Export PDF / Lien public) cible la bonne version.
  const handleExportVersion = (track, version) => {
    if (!track || !version) return;
    setExportTarget({ track, version });
  };
  const handleShareVersion = (track, version) => {
    if (!track || !version || !version.id || version.id === '__pending_v__') return;
    setShareTarget({ track, version });
  };

  // Ticket 2.2 — génère et télécharge la Score Card 1080×1080 pour la
  // version visée. On préfère le displayAR (langue courante) quand c'est
  // la version actuellement affichée, sinon on retombe sur l'analyse
  // brute stockée pour la version (FR par défaut).
  const handleScoreCard = (track, version) => {
    if (!track || !version) return;
    const ar = (version?.name === config?.version ? displayAR : null)
      || version?.analysisResult
      || (version?.name === config?.version ? analysisResult : null)
      || null;
    if (!ar?.fiche) return;
    const adjusted = applyVocalTypeToFiche(ar.fiche, track?.vocalType || 'vocal');
    const sc = typeof adjusted.globalScore === 'number' ? adjusted.globalScore : (typeof ar.fiche.globalScore === 'number' ? ar.fiche.globalScore : 0);
    const verdictText = ar?.fiche?.verdict ? splitVerdict(ar.fiche.verdict).headline : '';
    // Sub-scores = moyenne des items par catégorie (cohérent avec l'UI fiche).
    const subScores = (adjusted.elements || []).map((el) => {
      const items = (el.items || []).map(normalizeDiagItem);
      const scores = items.map((it) => it.score).filter((n) => typeof n === 'number');
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
      return { cat: el?.cat || '', score: avg };
    }).filter((x) => typeof x.score === 'number');

    downloadScoreCard({
      title: track?.title || '',
      versionName: version?.name || '',
      score: sc,
      verdict: verdictText,
      subScores,
    }).catch((err) => {
      console.warn('[scoreCard] échec de la génération', err);
    });
  };

  return (
    <>
      <main className="main">
        {currentTrack && (
          <Timeline
            onGoHome={onGoHome}
            track={currentTrack}
            currentVersionName={config?.version}
            stage={stage}
            analysisResult={analysisResult}
            onSelectVersion={onSelectVersion}
            onAddVersion={onAddVersion}
            onShareVersion={handleShareVersion}
            onExportVersion={handleExportVersion}
            onScoreCard={handleScoreCard}
            onTracksRefresh={() => loadTracks().then(setTracks)}
          />
        )}

        <div className={`fiche-layout${rawFiche ? ' fiche-v2' : ''}${!chatAsDrawer && rawFiche ? ' has-chat' : ''}`}>
        <div className="page">
          {!rawFiche ? (
            <AnalyzingState stage={stage} />
          ) : (
          <>
          {/* 0 · Bandeau « voix détectée » : propose de basculer le vocal_type
                  en « chanté » quand le titre est encore marqué « voix à venir »
                  mais que Gemini a entendu du chant sur la version courante. */}
          <VocalTypeSuggestionBanner
            track={currentTrack}
            versionId={versionInDb?.id}
            listening={listening}
            onRefresh={() => loadTracks().then(setTracks)}
          />

          {/* Bloc principal en layout 1 colonne : bandeaux + verdict + score */}
          <div className="f2-col-main">
          {/* Ticket 4.4 — bandeau "FINAL" si la version a été marquée finale,
              sinon plateau detector si convergence avec V_(n-1). */}
          {versionInDb?.isFinal ? (
            <div
              className="final-badge-banner"
              aria-label="Version finale"
              style={{
                margin: '0 0 18px',
                padding: '12px 16px',
                borderRadius: 14,
                border: '1px solid rgba(142, 224, 122, 0.30)',
                background: 'rgba(142, 224, 122, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontFamily: "'DM Sans', sans-serif",
                position: 'relative',
              }}
            >
              <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--mint, #8ee07a)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--mono, JetBrains Mono, monospace)', fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', color: 'var(--mint, #8ee07a)' }}>VERSION FINALE</span>
              <span style={{ fontSize: 13, color: 'var(--text, #ededed)', fontWeight: 300, flex: 1 }}>
                Validée comme sortie. Aucune itération supplémentaire prévue.
              </span>
              <button
                type="button"
                onClick={async () => {
                  if (!versionInDb?.id) return;
                  setMarkFinalBusy(true);
                  await setVersionFinal(versionInDb.id, false);
                  await loadTracks().then(setTracks);
                  setMarkFinalBusy(false);
                }}
                disabled={markFinalBusy}
                style={{
                  flexShrink: 0,
                  padding: '6px 12px',
                  borderRadius: 999,
                  background: 'transparent',
                  color: 'var(--muted, rgba(255,255,255,0.55))',
                  border: '1px solid var(--border, rgba(255,255,255,0.10))',
                  fontFamily: 'var(--mono, JetBrains Mono, monospace)',
                  fontSize: 10,
                  letterSpacing: 1.4,
                  textTransform: 'uppercase',
                  cursor: markFinalBusy ? 'not-allowed' : 'pointer',
                  opacity: markFinalBusy ? 0.55 : 1,
                }}
              >
                Retirer
              </button>
            </div>
          ) : (
            <PlateauBanner
              currentFiche={rawFiche}
              previousFiche={prevVersion?.analysisResult?.fiche || null}
              isFinal={false}
              busy={markFinalBusy}
              onMarkFinal={async () => {
                if (!versionInDb?.id) return;
                setMarkFinalBusy(true);
                await setVersionFinal(versionInDb.id, true);
                await loadTracks().then(setTracks);
                setMarkFinalBusy(false);
              }}
            />
          )}
          {/* Ticket 4.3 — bandeau "Prêt à sortir / Presque / Pas encore" */}
          <ReleaseReadinessBanner fiche={rawFiche} completedItems={completedItems} />
          {/* 1 · Verdict / Score global */}
          <section className="row-verdict">
            {/* Pochette carrée (v2 desktop) — artwork fait de halos color\u00e9s seed\u00e9s
                + titre en gros (police du logo VERSIONS). Remplaçable par l'upload user. */}
            {(() => {
              const title = config?.title || '';
              let h = 0;
              for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
              let seed = h || 1;
              const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
              // Palette color\u00e9e mais l\u00e9g\u00e8rement d\u00e9satur\u00e9e (tons de pochette abstraite)
              const palette = [
                'rgba(230, 140, 60, 1)',    // amber soutenu
                'rgba(110, 185, 110, 1)',   // sage/vert frais
                'rgba(215, 115, 170, 1)',   // rose/magenta
                'rgba(70, 150, 210, 1)',    // cerulean
                'rgba(235, 130, 90, 1)',    // peach
                'rgba(150, 110, 210, 1)',   // violet
                'rgba(90, 195, 180, 1)',    // teal
                'rgba(225, 90, 110, 1)',    // coral/red
                'rgba(240, 195, 70, 1)',    // doré
              ];
              const halos = Array.from({ length: 9 }, () => ({
                x: 5 + rand() * 90,
                y: 5 + rand() * 90,
                size: 95 + rand() * 70,
                color: palette[Math.floor(rand() * palette.length)],
                opacity: 0.78 + rand() * 0.22,
              }));
              return (
                <div className="col-cover-wrap">
                  <div className="col-cover-holder">
                    <div
                      className={`col-cover${currentTrack?.coverImageUrl ? ' has-image' : ' no-image'}`}
                      aria-label={title}
                    >
                      {currentTrack?.coverImageUrl ? (
                        <img
                          src={currentTrack.coverImageUrl}
                          alt=""
                          className="cover-img"
                          loading="lazy"
                        />
                      ) : (
                        <>
                          {halos.map((hl, i) => (
                            <span
                              key={i}
                              className="ca-halo"
                              style={{
                                left: `${hl.x}%`,
                                top: `${hl.y}%`,
                                width: `${hl.size}%`,
                                background: `radial-gradient(circle, ${hl.color} 0%, transparent 62%)`,
                                opacity: hl.opacity,
                              }}
                              aria-hidden
                            />
                          ))}
                          <div className="cover-big-title" aria-hidden>
                            {title}
                          </div>
                        </>
                      )}
                    </div>
                    {/* Pill type vocal : coin supérieur droit de l'artwork,
                        déplacée depuis la topbar. Hors de .col-cover pour que
                        son menu dropdown ne soit pas rogné par overflow:hidden. */}
                    <div className="cover-vocal-pill">
                      <VocalTypePill
                        track={currentTrack}
                        onRefresh={() => loadTracks().then(setTracks)}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
            <div className="rv-left">
              {/* Calque halo clippé : permet au panel de rester overflow:visible
                  pour que les tooltips des tuiles puissent déborder vers le bas. */}
              <div className="rv-halo" aria-hidden="true" />
              {score != null && (
                <div className="score-eyebrow">
                  <span className="dot" />
                  {s.fiche.scoreGlobalTitle || 'Score global'}
                </div>
              )}
              {score != null && (
                <div className="rv-top">
                  <ScoreRingBig value={score} prevScore={prevScore} />
                  {/* DSP_PLAN A.3 — Radar constellation 6 catégories.
                      Remplace les anciennes mi-tiles dans .rv-top. Les
                      tooltips pédagogiques (what/how) sont préservés via
                      la carte détail qui s'affiche au hover d'un point. */}
                  <MixRadar
                    items={computeMixIndicators(rawFiche, elements, score, s)}
                  />
                </div>
              )}
              {score != null && (
                <>
                  {(() => {
                    if (typeof prevScore !== 'number') return null;
                    const delta = Math.round(score - prevScore);
                    const prevName = prevVersion?.name || '';
                    if (!prevName) return null;
                    let tpl;
                    if (delta === 0) tpl = s.fiche.scoreDeltaStable;
                    else if (delta > 0) tpl = s.fiche.scoreDeltaUp;
                    else tpl = s.fiche.scoreDeltaDown;
                    if (!tpl) return null;
                    const txt = tpl
                      .replace('{delta}', String(Math.abs(delta)))
                      .replace('{prev}', prevName);
                    return (
                      <div className={`score-calibration${delta < 0 ? ' down' : delta === 0 ? ' stable' : ''}`}>
                        {txt}
                      </div>
                    );
                  })()}
                  {(() => {
                    // Ticket 4.1 — bandeau plafond de score (score floor protection).
                    // Affiché uniquement quand le backend a réellement appliqué un cap
                    // à cause d'items priorité high non résolus.
                    const sf = rawFiche?.score_floor;
                    if (!sf || !sf.applied) return null;
                    const tpl = sf.highCount === 1 ? s.fiche.scoreFloorOneItem : s.fiche.scoreFloorManyItems;
                    const txt = (tpl || '')
                      .replace('{count}', String(sf.highCount))
                      .replace('{ceiling}', String(sf.ceiling));
                    const orig = (s.fiche.scoreFloorOriginal || '').replace('{original}', String(sf.original));
                    return (
                      <div className="score-floor-banner" role="note">
                        <span className="sf-dot" aria-hidden="true" />
                        <span className="sf-text">{txt}</span>
                        {typeof sf.original === 'number' && (
                          <span className="sf-original" title={orig}>{orig}</span>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}
              <div className={`verdict-text${verdictExpanded ? ' expanded' : ' collapsed'}`}>
                {(() => {
                  // Priorité : verdict (phrase accrocheuse) pour le titre, summary pour le paragraphe.
                  // Si un seul des deux existe → on découpe en 1ʳᵉ phrase (titre) + reste (paragraphe).
                  const vText = rawFiche?.verdict || rawFiche?.summary || '';
                  if (!vText) return (
                    <button
                      type="button"
                      className="verdict-toggle"
                      onClick={() => setVerdictExpanded((v) => !v)}
                    >
                      <h1>{s.fiche.pendingVerdict}</h1>
                      <span className="verdict-caret" aria-hidden="true" />
                    </button>
                  );
                  let headlineNode = null;
                  let restNode = null;
                  if (rawFiche?.verdict && rawFiche?.summary && rawFiche.verdict !== rawFiche.summary) {
                    headlineNode = renderWithEmphasis(rawFiche.verdict);
                    restNode = rawFiche.summary;
                  } else {
                    const split = splitVerdict(vText);
                    headlineNode = renderWithEmphasis(split.headline);
                    restNode = split.rest;
                  }
                  return (
                    <>
                      <button
                        type="button"
                        className="verdict-toggle"
                        onClick={() => setVerdictExpanded((v) => !v)}
                        aria-expanded={verdictExpanded}
                      >
                        <h1>{headlineNode}</h1>
                        <span className="verdict-caret" aria-hidden="true" />
                      </button>
                      {restNode && verdictExpanded && <p>{restNode}</p>}
                    </>
                  );
                })()}
                {verdictExpanded && (() => {
                  const stamp = formatAnalyzedAt(versionInDb?.createdAt || versionInDb?.date);
                  return stamp ? <div className="analyzed-at">{stamp}</div> : null;
                })()}
                {translating && (
                  <div className="analyzed-at" style={{ opacity: 0.6, fontStyle: 'italic' }}>
                    {s.fiche.translating}
                  </div>
                )}
              </div>
            </div>
          </section>

          </div>

          {/* Bloc évolution + intention en layout 1 colonne (la pochette est masquée). */}
          <div className="f2-col-side">
              {/* Wrapper évolution + intention — pleine largeur en layout 1 colonne. */}
              {(evolution || hasIntentSource) && (
                <div
                  className="evo-intent-stack"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: 18,
                    minWidth: 0,
                    width: '100%',
                  }}
                >
                  {evolution && (
                    <EvolutionBanner
                      evolution={evolution}
                      previousVersionName={evolutionPrevName}
                      floorApplied={rawFiche?.score_floor?.applied ? rawFiche.score_floor : null}
                      adviceLockApplied={(() => {
                        // Ticket 4.2 — derive le summary "categories verrouillees"
                        // depuis advice_check.lockedCategories (array de strings).
                        const ac = rawFiche?.advice_check;
                        if (!ac) return null;
                        const cats = Array.isArray(ac.lockedCategories) ? ac.lockedCategories : [];
                        const followed = Array.isArray(ac.followed) ? ac.followed.length : 0;
                        const unfollowed = Array.isArray(ac.unfollowed) ? ac.unfollowed.length : 0;
                        if (followed + unfollowed === 0) return null;
                        return {
                          categories: cats.map((c) => ({ cat: c })),
                          followed,
                          unfollowed,
                        };
                      })()}
                    />
                  )}
                  <IntentPanel
                    analysisResult={displayAR}
                    currentTrack={currentTrack}
                    versionInDb={versionInDb}
                  />
                </div>
              )}
          </div>

          {/* Diagnostic par élément — pleine largeur, avant l'impression d'écoute */}
          {elements.length > 0 && (
            <div className="col-diag">
                {elements.length > 0 && (() => {
                  // Map catégorie → accent (cohérent avec l'esprit q-sublabel de l'écoute qualitative)
                  const catColor = (cat) => {
                    const k = (cat || '').toLowerCase();
                    if (k.includes('voix') || k.includes('vocal') || k.includes('voice')) return 'amber';
                    if (k.includes('instrument')) return 'cerulean';
                    if (k.includes('bass') || k.includes('kick')) return 'red';
                    if (k.includes('drum') || k.includes('percu')) return 'mint';
                    if (k.includes('spatial') || k.includes('reverb')) return 'cerulean';
                    if (k.includes('master') || k.includes('loudness')) return 'amber';
                    return 'cerulean';
                  };
                  // Ticket 2.1 — totaux pour le compteur "X/N complétés (Y%)".
                  // On exclut :
                  //   - les items de la catégorie voix tant que le titre est marqué
                  //     « voix à venir » (pending, ne doit pas peser sur la progression),
                  //   - les items de validation (score >= 75) qui n'ont pas de checkbox
                  //     visible (rien à "traiter"). Sinon le ratio serait toujours
                  //     incomplet alors que l'utilisateur n'a rien à cocher.
                  const allItemKeys = elements.flatMap((el, eIdx) => {
                    const isVoice = isVoiceCategory(el?.cat);
                    if (isVoice && voiceLabelOverride) return [];
                    return (el.items || [])
                      .map(normalizeDiagItem)
                      .filter((it) => !(typeof it.score === 'number' && it.score >= 75))
                      .map((it, i) => diagItemKey(el?.id || el?.cat || `cat${eIdx}`, it, i));
                  });
                  const totalCount = allItemKeys.length;
                  const doneCount = allItemKeys.reduce(
                    (acc, k) => acc + (completedItems.has(k) ? 1 : 0),
                    0,
                  );
                  const donePct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

                  const renderCats = () => elements.map((el, idx) => {
                    const open = openCat === idx;
                    const items = (el.items || []).map(normalizeDiagItem);
                    const count = items.length;
                    const scores = items.map((it) => it.score).filter((s) => typeof s === 'number');
                    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
                    const isVoice = isVoiceCategory(el?.cat);
                    const catLabel = (isVoice && voiceLabelOverride) ? s.fiche.voiceComingSoon : el.cat;
                    const color = catColor(el?.cat);
                    const catId = el?.id || el?.cat || `cat${idx}`;
                    // DSP_PLAN A.1+A.2 — visuels DSP en tête de la section
                    // MASTER & LOUDNESS uniquement. Les autres catégories
                    // gardent leur rendu standard.
                    const catKey = (el?.cat || '').toLowerCase();
                    const isMasterCat = catKey.includes('master') || catKey.includes('loudness');
                    return (
                      <div key={el.id || el.cat || idx} className={`diag-cat c-${color}${open ? ' open' : ''}${isVoice && voiceLabelOverride ? ' pending-voice' : ''}`}>
                        <div className="diag-cat-head" onClick={() => toggleCat(idx)}>
                          <span className="chev">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                          <span className="name">{catLabel}</span>
                          <span className="count">
                            {isVoice && voiceLabelOverride
                              ? s.fiche.pendingVoiceStep
                              : `${count} ${count > 1 ? s.fiche.elementPlural : s.fiche.elementSingular}${avg != null ? `${s.fiche.avgPrefix}${Math.round(avg)}` : ''}`}
                          </span>
                        </div>
                        <div className="diag-cat-body">
                          {isMasterCat && <DspMasterBlock analysisResult={displayAR} />}
                          {items.map((it, i) => {
                            const itemKey = diagItemKey(catId, it, i);
                            const done = completedItems.has(itemKey);
                            const canCheck = !!completionsVersionId && !(isVoice && voiceLabelOverride);
                            // Validation pure = pas d'action concrète proposée :
                            // 'how' vide OU commence par "RAS" (Rien À Signaler).
                            // Dans ce cas, la checkbox n'a pas de sens — il n'y a
                            // rien à "résoudre". Tous les autres items (avec une
                            // recette technique dans 'how') gardent la case, même
                            // si le score est élevé : un score 90 avec une vraie
                            // recommandation reste une action à appliquer.
                            const howStr = ((it && it.how) || '').trim();
                            const isPureValidation = !howStr || /^ras\b/i.test(howStr);
                            const isCorrective = !isPureValidation;
                            return (
                              <div key={it.id || i} className={`diag-item${it.priority ? ` prio-${it.priority}` : ''}${done ? ' is-done' : ''}${it.advice_locked ? ' advice-locked' : ''}`}>
                                <ScoreRingSmall value={it.score} />
                                <div className="di-body">
                                  <div className="di-name">
                                    {it.priority && (
                                      <span className={`di-prio prio-${it.priority}`} aria-label={`priorité ${it.priority}`} />
                                    )}
                                    {it.title}
                                    {it.advice_locked && (
                                      <span
                                        className="di-advice-lock"
                                        title="Tu as coché cet item comme implémenté en V précédente, mais il reste audible. Le score est verrouillé pour ne pas te pénaliser."
                                        aria-label="Conseil verrouillé"
                                      >
                                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                          <rect x="2.5" y="5.5" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                                          <path d="M4 5.5V3.5a2 2 0 014 0V5.5" stroke="currentColor" strokeWidth="1.4" />
                                        </svg>
                                      </span>
                                    )}
                                  </div>
                                  {it.why && <div className="di-detail">{it.why}</div>}
                                  {it.how && (
                                    <div className="di-how">
                                      <span className="di-how-label">Action</span>
                                      <code>{it.how}</code>
                                    </div>
                                  )}
                                  {(it.plugin_pick || isCorrective) && (
                                    <div
                                      className="di-tools"
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: 10,
                                      }}
                                    >
                                      {it.plugin_pick
                                        ? <span className="di-plugin">{it.plugin_pick}</span>
                                        : <span aria-hidden="true" />
                                      }
                                      {isCorrective && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (canCheck) toggleItemCompletion(itemKey);
                                          }}
                                          disabled={!canCheck}
                                          aria-pressed={done}
                                          aria-label={done ? s.fiche.diagItemDoneLabel : s.fiche.diagItemMarkDoneLabel}
                                          title={done ? s.fiche.diagItemDoneLabel : s.fiche.diagItemMarkDoneLabel}
                                          style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 8,
                                            padding: 0,
                                            border: 0,
                                            background: 'transparent',
                                            color: done ? 'var(--amber)' : 'var(--muted)',
                                            cursor: canCheck ? 'pointer' : 'not-allowed',
                                            opacity: canCheck ? 1 : 0.45,
                                            fontFamily: 'var(--mono)',
                                            fontSize: 10,
                                            letterSpacing: 1.2,
                                            textTransform: 'uppercase',
                                            whiteSpace: 'nowrap',
                                            flexShrink: 0,
                                            transition: 'color .15s',
                                          }}
                                        >
                                          <span
                                            aria-hidden="true"
                                            style={{
                                              // Override de .diag-item .di-tools span qui force
                                              // padding 3px 8px + border-radius 4px (styles des
                                              // badges plugin). Sans ces overrides, la case est
                                              // déformée par le padding hérité.
                                              width: 16, height: 16,
                                              minWidth: 16,
                                              padding: 0,
                                              borderRadius: 4,
                                              border: `1.5px solid ${done ? 'var(--amber)' : 'rgba(255,255,255,0.25)'}`,
                                              background: done ? 'var(--amber)' : 'transparent',
                                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                              flexShrink: 0,
                                              boxSizing: 'border-box',
                                              transition: 'border-color .15s, background .15s',
                                            }}
                                          >
                                            {done && (
                                              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#1b1108" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                <path d="M2.5 6.2l2.3 2.3L9.5 3.5" />
                                              </svg>
                                            )}
                                          </span>
                                          {done ? s.fiche.diagItemDoneShort : s.fiche.diagItemTodoShort}
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });

                  // Rendu v2 (desktop + mobile) : panel unifié avec eyebrow
                  // ambre + halo. Les media queries adaptent la taille mobile.
                  return (
                    <section className="diag-panel">
                      <div className="diag-eyebrow">
                        <span className="dot" />
                        {s.fiche.diagTitle} · {elements.length} {elements.length > 1 ? s.fiche.categoryPlural : s.fiche.categorySingular}
                        {totalCount > 0 && (
                          <span className="diag-progress" title={s.fiche.diagProgressTitle}>
                            <span className="diag-progress-bar" aria-hidden="true">
                              <span
                                className="diag-progress-bar-fill"
                                style={{ width: `${donePct}%` }}
                              />
                            </span>
                            <span className="diag-progress-label">
                              {doneCount}/{totalCount} {s.fiche.diagProgressDone} ({donePct}%)
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="diag-cats">
                        {renderCats()}
                      </div>
                    </section>
                  );
                })()}
            </div>
          )}

          {/* Impression d'écoute — pleine largeur, après le diagnostic */}
          <QualitativeSection listening={listening} />

          {/* 4 · Notes perso — tout en bas, pleine largeur */}
          <NotesSection
            key={versionInDb?.id || 'pending'}
            versionId={versionInDb?.id || null}
            initialNotes={(analysisResult && analysisResult.userNotes) || ''}
            v2
          />
          </>
          )}
        </div>
        {!chatAsDrawer && rawFiche && (
          <aside className="fiche-chat-side">
            <VersionChat
              versionId={versionInDb?.id || null}
              config={config}
              analysisResult={displayAR}
              open={true}
              onClose={() => {}}
              anchored
            />
          </aside>
        )}
        </div>
      </main>


      {/* Modale d'export PDF — cible la version cliquée dans le menu VChip
          (pas forcément la version actuellement affichée à l'écran). */}
      {exportTarget && (() => {
        const t = exportTarget.track;
        const v = exportTarget.version;
        // Si on exporte la version actuellement affichée, on prend le displayAR
        // (qui contient la traduction dans la langue courante si disponible).
        // Sinon on prend l'objet brut de la version ciblée (source FR par défaut).
        const ar = (v?.name === config?.version ? displayAR : null)
          || v?.analysisResult
          || (v?.name === config?.version ? analysisResult : null)
          || null;
        const hasListening = !!(ar?.listening && (
          ar.listening.impression ||
          (Array.isArray(ar.listening.points_forts) && ar.listening.points_forts.length) ||
          (Array.isArray(ar.listening.a_travailler) && ar.listening.a_travailler.length) ||
          ar.listening.espace || ar.listening.dynamique || ar.listening.potentiel
        ));
        const hasDiagnostic = !!(ar?.fiche?.elements && ar.fiche.elements.length);
        const hasNotes = !!(ar?.userNotes && ar.userNotes.trim());
        return (
          <ExportPdfModal
            title={t.title}
            versionName={v?.name || ''}
            hasListening={hasListening}
            hasDiagnostic={hasDiagnostic}
            hasNotes={hasNotes}
            onCancel={() => setExportTarget(null)}
            onExport={(sections) => {
              try {
                exportFicheToPdf({
                  track: t,
                  versionName: v?.name || '',
                  analysisResult: ar,
                  date: v?.createdAt || v?.date || new Date().toISOString(),
                  sections,
                });
              } catch (err) {
                console.warn('[export PDF] échec de la génération', err);
              } finally {
                setExportTarget(null);
              }
            }}
          />
        );
      })()}

      {/* Modale de partage (lien public lecture seule) pour la version
          cliquée dans le menu VChip. */}
      {shareTarget && (
        <ShareLinkModal
          versionId={shareTarget.version.id}
          trackTitle={shareTarget.track?.title || ''}
          versionName={shareTarget.version?.name || ''}
          onClose={() => setShareTarget(null)}
        />
      )}

      {/* Chat — bulle + panneau (mobile + desktop étroit <1200px) */}
      {chatAsDrawer && (
        <>
          <button className="chat-fab" onClick={() => setChatOpen(true)} title={s.fiche.chatFabTitle}>
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
              <path d="M2 3h12v8H7l-3 3v-3H2V3z" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
          <VersionChat
            versionId={versionInDb?.id || null}
            config={config}
            analysisResult={displayAR}
            open={chatOpen}
            onClose={() => setChatOpen(false)}
          />
        </>
      )}
      <OnboardingHints steps={FICHE_STEPS} storageKey={ONBOARDING_STORAGE_KEYS.fiche} />
    </>
  );
}
