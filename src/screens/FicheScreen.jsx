import { useState, useEffect, useRef } from 'react';
import API from '../constants/api';
// import CompareButton from '../components/CompareButton'; // mis en sommeil
// VChip (carousel de chips V1/V2/V3) remplacé par VersionDropdown — import retiré.
import ExportPdfModal from '../components/ExportPdfModal';
import ShareLinkModal from '../components/ShareLinkModal';
import VocalTypeSuggestionBanner from '../components/VocalTypeSuggestionBanner';
import EvolutionBanner from '../components/EvolutionBanner';
import { loadTracks, saveVersionNotes, loadChatHistory, saveChatHistory, updateTrackVocalType, loadVersionLocalized } from '../lib/storage';
import { preloadTrackVersions } from '../components/BottomPlayer';
import { confirmDialog } from '../lib/confirm.jsx';
import { exportFicheToPdf } from '../lib/exportPdf';
import { renderWithEmphasis, formatAnalyzedAt, splitVerdict, applyVocalTypeToFiche, isVoiceCategory, normalizeDiagItem } from '../lib/ficheHelpers.jsx';
import useMobile from '../hooks/useMobile';
import useNarrowDesktop from '../hooks/useNarrowDesktop';
import useLang from '../hooks/useLang';

/**
 * FicheScreen — rendu fidèle à mockup-v3.html.
 * Les styles viennent de MockupStyles.jsx (classes .sidebar, .timeline, .verdict,
 * .priority, .diag-cat, .focus, .chat-panel, .chat-fab, .player).
 */

// ── Helpers ──────────────────────────────────────────────

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

function VersionDropdown({ track, currentVersionName, versions, onSelectVersion, onAddVersion, newVersionLabel, showAddInMenu = true }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = versions.find((v) => v.name === currentVersionName) || versions[versions.length - 1];

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  if (!current) return null;

  return (
    <div className="version-dropdown" ref={ref}>
      <button
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
      {open && (
        <div className="version-dropdown-menu" role="listbox">
          {versions.map((v, idx) => {
            const score = v.analysisResult?.fiche?.globalScore;
            const prev = idx > 0 ? versions[idx - 1]?.analysisResult?.fiche?.globalScore : null;
            const delta = (typeof score === 'number' && typeof prev === 'number') ? score - prev : null;
            const isActive = v.name === currentVersionName;
            return (
              <button
                key={v.id}
                type="button"
                className={`vdd-item${isActive ? ' is-active' : ''}`}
                onClick={() => {
                  if (!isActive) onSelectVersion?.(track, v);
                  setOpen(false);
                }}
                role="option"
                aria-selected={isActive}
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
        </div>
      )}
    </div>
  );
}

// ── Timeline (sticky bar topbar + dropdown versions) ──────────────

function Timeline({ track, currentVersionName, stage, onSelectVersion, onAddVersion, onShareVersion, onExportVersion, onTracksRefresh, onGoHome }) {
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
          {current && (onShareVersion || onExportVersion) && (
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
            newVersionLabel={s.fiche.newVersionTitle || 'Nouvelle version'}
          />
        )}
      </div>

      {current && (onShareVersion || onExportVersion) && (
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

  const hasDeploy = potentiel || espace || dynamique;

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
          {expanded && espace && (
            <div className="q-sub espace">
              <div className="q-sublabel cerulean">{s.fiche.blockEspace}</div>
              <div className="q-subbody">{renderWithEmphasis(espace)}</div>
            </div>
          )}
          {expanded && dynamique && (
            <div className="q-sub dynamique">
              <div className="q-sublabel cerulean">{s.fiche.blockDynamique}</div>
              <div className="q-subbody">{renderWithEmphasis(dynamique)}</div>
            </div>
          )}
          {expanded && potentiel && (
            <div className="q-sub potentiel">
              <div className="q-sublabel cerulean">{s.fiche.blockPotentiel}</div>
              <div className="q-subbody">{renderWithEmphasis(potentiel)}</div>
            </div>
          )}
        </div>

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
function IntentPanel({ analysisResult, currentTrack, versionInDb }) {
  const { s } = useLang();
  const [open, setOpen] = useState(false);
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
        onClick={() => setOpen((v) => !v)}
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
  const [chatOpen, setChatOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState(null); // { track, version } ouverts dans la modale d'export PDF
  const [shareTarget, setShareTarget] = useState(null);   // { track, version } ouverts dans la modale de partage
  const [verdictExpanded, setVerdictExpanded] = useState(false); // verdict rétracté par défaut
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

  return (
    <>
      <main className="main">
        {currentTrack && (
          <Timeline
            onGoHome={onGoHome}
            track={currentTrack}
            currentVersionName={config?.version}
            stage={stage}
            onSelectVersion={onSelectVersion}
            onAddVersion={onAddVersion}
            onShareVersion={handleShareVersion}
            onExportVersion={handleExportVersion}
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

          {/* COLONNE PRINCIPALE (col 1 en v2 desktop) : Score global + Diagnostic */}
          <div className="f2-col-main">
          {/* 1 · Verdict / Score global */}
          <section className="row-verdict">
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
                  <MixIndicators
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

          {/* 2 · Diagnostic par élément — directement sous le score global, en col 1 */}
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
                  const renderCats = () => elements.map((el, idx) => {
                    const open = openCat === idx;
                    const items = (el.items || []).map(normalizeDiagItem);
                    const count = items.length;
                    const scores = items.map((it) => it.score).filter((s) => typeof s === 'number');
                    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
                    const isVoice = isVoiceCategory(el?.cat);
                    const catLabel = (isVoice && voiceLabelOverride) ? s.fiche.voiceComingSoon : el.cat;
                    const color = catColor(el?.cat);
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
                          {items.map((it, i) => (
                            <div key={it.id || i} className={`diag-item${it.priority ? ` prio-${it.priority}` : ''}`}>
                              <ScoreRingSmall value={it.score} />
                              <div className="di-body">
                                <div className="di-name">
                                  {it.priority && (
                                    <span className={`di-prio prio-${it.priority}`} aria-label={`priorité ${it.priority}`} />
                                  )}
                                  {it.title}
                                </div>
                                {it.why && <div className="di-detail">{it.why}</div>}
                                {it.how && (
                                  <div className="di-how">
                                    <span className="di-how-label">Recette</span>
                                    <code>{it.how}</code>
                                  </div>
                                )}
                                {it.plugin_pick && (
                                  <div className="di-tools">
                                    <span className="di-plugin">{it.plugin_pick}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
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
                      </div>
                      <div className="diag-cats">
                        {renderCats()}
                      </div>
                    </section>
                  );
                })()}
            </div>
          )}
          </div>

          {/* COLONNE SECONDAIRE (col 2 en v2 desktop) : Pochette + Plan d'action */}
          <div className="f2-col-side">
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
              {/* 0b · Wrapper colonne droite : bandeau d'évolution + Intention.
                     Les deux sont stackés en flex column dans un seul grid-item
                     (col 4 / span 3, row 3) pour rester au-dessus du Plan d'action
                     sans casser les règles CSS existantes (.intent-panel-fiche
                     et .col-plan). Le gap interne (18px) est aligné sur le
                     row-gap du grid principal pour des espacements uniformes. */}
              {(evolution || hasIntentSource) && (
                <div
                  className="evo-intent-stack"
                  style={{
                    gridColumn: '4 / span 3',
                    gridRow: 3,
                    alignSelf: 'start',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch', // chaque enfant prend toute la largeur
                    gap: 18,
                    minWidth: 0,
                    width: '100%',
                  }}
                >
                  {evolution && (
                    <EvolutionBanner
                      evolution={evolution}
                      previousVersionName={evolutionPrevName}
                    />
                  )}
                  <IntentPanel
                    analysisResult={displayAR}
                    currentTrack={currentTrack}
                    versionInDb={versionInDb}
                  />
                </div>
              )}
              {plan.length > 0 && (
              <div className="col-plan">
                {(() => {
                  const planKeys = plan.map((p, i) => `${i}::${(p.task || '').slice(0, 60)}`);
                  const resolvedCount = planKeys.reduce((acc, k) => acc + (resolved.has(k) ? 1 : 0), 0);
                  const hasResolved = resolvedCount > 0;
                  const visibleCount = hideResolved ? (plan.length - resolvedCount) : plan.length;

                  // ── Rendu v2 unifié (desktop + mobile) : panel avec eyebrow
                  //    ambre + cards .plan-card.p0/p1/p2/resolved ──
                  if (true) {
                    const tagFor = (prio, done) => {
                      if (done) return s.fiche.planTagResolved;
                      if (prio === 'high' || prio === 'haute') return s.fiche.planTagPriority;
                      if (prio === 'med' || prio === 'moyenne') return s.fiche.planTagObservation;
                      return s.fiche.planTagObservation;
                    };
                    const klassFor = (prio, done) => {
                      if (done) return 'p2 resolved';
                      if (prio === 'high' || prio === 'haute') return 'p0';
                      if (prio === 'med' || prio === 'moyenne') return 'p1';
                      return 'p2';
                    };
                    return (
                      <section className="plan-panel">
                        <div className="plan-eyebrow">
                          <span className="dot" />
                          {s.fiche.planTitle} · {visibleCount} {visibleCount > 1 ? s.fiche.adjustmentPlural : s.fiche.adjustmentSingular}
                          {hasResolved && (
                            <button
                              type="button"
                              className={`plan-filter-toggle${hideResolved ? ' active' : ''}`}
                              onClick={() => setHideResolved((v) => !v)}
                              title={hideResolved ? s.fiche.planShowAllTitle : s.fiche.planHideResolvedTitle}
                            >
                              {hideResolved ? s.fiche.planShowAll : s.fiche.planHideResolved}
                            </button>
                          )}
                        </div>
                        <div className="plan-cards">
                          {plan.map((p, i) => {
                            const key = `${i}::${(p.task || '').slice(0, 60)}`;
                            const done = resolved.has(key);
                            if (hideResolved && done) return null;
                            const prio = (p.p || '').toLowerCase();
                            const linkedItems = (elements || []).flatMap((el) =>
                              (el.items || [])
                                .filter((it) => Array.isArray(p.linkedItemIds) && it.id && p.linkedItemIds.includes(it.id))
                                .map((it) => ({ ...it, cat: el.cat }))
                            );
                            const klass = klassFor(prio, done);
                            const isOpen = openPlanIdx === i;
                            const hasMore = !!(p.daw || p.metered || p.target || linkedItems.length > 0);
                            return (
                              <div
                                key={i}
                                ref={(el) => {
                                  if (el) planRefs.current[i] = el;
                                  else delete planRefs.current[i];
                                }}
                                className={`plan-card ${klass}${hasMore ? ' collapsible' : ''}${isOpen ? ' open' : ''}`}
                                onClick={() => hasMore && setOpenPlanIdx((prev) => (prev === i ? null : i))}
                                role={hasMore ? 'button' : undefined}
                                tabIndex={hasMore ? 0 : undefined}
                                onKeyDown={(e) => {
                                  if (!hasMore) return;
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setOpenPlanIdx((prev) => (prev === i ? null : i));
                                  }
                                }}
                              >
                                <div className="p-head">
                                  <span className="p-tag">{tagFor(prio, done)}</span>
                                </div>
                                <div className="p-title-row">
                                  {hasMore && (
                                    <span className="p-chev" aria-hidden="true">
                                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    </span>
                                  )}
                                  <div className="p-title">{p.task}</div>
                                </div>
                                {hasMore && isOpen && (
                                  <div
                                    className="p-body"
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                  >
                                    {p.daw && <div className="p-daw">{p.daw}</div>}
                                    {(p.metered || p.target) && (
                                      <div className="p-measure">
                                        {p.metered && (
                                          <div>
                                            <div className="m-label">{s.fiche.focusMeasured}</div>
                                            <div className="m-val">{p.metered}</div>
                                          </div>
                                        )}
                                        {p.target && (
                                          <div>
                                            <div className="m-label">{s.fiche.focusTarget}</div>
                                            <div className="m-val target">{p.target}</div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    {linkedItems.length > 0 && (
                                      <div className="p-links">
                                        {linkedItems.map(normalizeDiagItem).map((it) => (
                                          <span
                                            key={it.id}
                                            className="chip cerulean"
                                            title={`${it.cat} · ${it.title}${typeof it.score === 'number' ? ` · ${it.score}` : ''}`}
                                          >
                                            {it.title}{typeof it.score === 'number' ? ` · ${it.score}` : ''}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    <button
                                      type="button"
                                      className={`p-resolve${done ? ' done' : ''}`}
                                      onClick={(e) => { e.stopPropagation(); toggleResolved(key, i); }}
                                      aria-label={done ? s.fiche.focusResolved : s.fiche.focusMarkResolved}
                                    >
                                      <span className="p-check" aria-hidden="true">
                                        {done && (
                                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                            <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        )}
                                      </span>
                                      <span className="p-resolve-label">
                                        {done ? s.fiche.focusResolved : s.fiche.focusMarkResolved}
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    );
                  }

                  // ── Mobile / drawer : layout historique (collapsible) ──
                  return (
                  <>
                    <div className="section-head">
                      <span className="t">{s.fiche.planTitle}</span>
                      <span className="line" />
                      <span className="count">
                        {hasResolved
                          ? `${resolvedCount}/${plan.length} ${resolvedCount > 1 ? s.fiche.planResolvedPlural : s.fiche.planResolvedSingular}`
                          : `${plan.length} ${plan.length > 1 ? s.fiche.adjustmentPlural : s.fiche.adjustmentSingular}`}
                      </span>
                      {hasResolved && (
                        <button
                          type="button"
                          className={`plan-filter-toggle${hideResolved ? ' active' : ''}`}
                          onClick={() => setHideResolved((v) => !v)}
                          title={hideResolved ? s.fiche.planShowAllTitle : s.fiche.planHideResolvedTitle}
                        >
                          {hideResolved ? s.fiche.planShowAll : s.fiche.planHideResolved}
                        </button>
                      )}
                    </div>
                    <div className="priority-list">
                      {plan.map((p, i) => {
                        const key = `${i}::${(p.task || '').slice(0, 60)}`;
                        const done = resolved.has(key);
                        if (hideResolved && done) return null;
                        const prio = (p.p || '').toLowerCase();
                        const isOpen = openPlanIdx === i;
                        const linkedItems = (elements || []).flatMap((el) =>
                          (el.items || [])
                            .filter((it) => Array.isArray(p.linkedItemIds) && it.id && p.linkedItemIds.includes(it.id))
                            .map((it) => ({ ...it, cat: el.cat }))
                        );
                        return (
                          <div
                            key={i}
                            ref={(el) => {
                              if (el) planRefs.current[i] = el;
                              else delete planRefs.current[i];
                            }}
                            className={`priority collapsible${done ? ' done' : ''}${isOpen ? ' open' : ''}`}
                          >
                            <div
                              className="priority-head"
                              onClick={() => setOpenPlanIdx((prev) => (prev === i ? null : i))}
                            >
                              <span className={`pbadge ${prio}`}>{(p.p || '').toUpperCase()}</span>
                              <span className="ptitle">{p.task}</span>
                              <div
                                className="pcheck"
                                onClick={(e) => { e.stopPropagation(); toggleResolved(key, i); }}
                              >
                                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" style={{ display: done ? 'block' : 'none' }}>
                                  <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                              <span className="pchev" aria-hidden="true">
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                  <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                            </div>
                            <div className="priority-body">
                              {p.daw && (
                                <div className="daw-box">
                                  <span className="daw-label">{s.fiche.focusDawLabel}</span>
                                  {p.daw}
                                </div>
                              )}
                              {(p.metered || p.target) && (
                                <div className="mt-grid">
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
                                <div className="linked-elements">
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
                                className={`resolve-action${done ? ' done' : ''}`}
                                onClick={(e) => { e.stopPropagation(); toggleResolved(key, i); }}
                              >
                                <span className="box">
                                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                    <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </span>
                                {done ? s.fiche.focusResolved : s.fiche.focusMarkResolved}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                  );
                })()}
              </div>
              )}
          </div>

          {/* 3 · Écoute qualitative — en bas, pleine largeur */}
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
        const hasPlan = !!(ar?.fiche?.plan && ar.fiche.plan.length);
        const hasNotes = !!(ar?.userNotes && ar.userNotes.trim());
        return (
          <ExportPdfModal
            title={t.title}
            versionName={v?.name || ''}
            hasListening={hasListening}
            hasDiagnostic={hasDiagnostic}
            hasPlan={hasPlan}
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
    </>
  );
}
