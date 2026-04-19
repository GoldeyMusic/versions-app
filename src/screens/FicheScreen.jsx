import { useState, useEffect, useRef } from 'react';
import API from '../constants/api';
// import CompareButton from '../components/CompareButton'; // mis en sommeil
import VChip from '../components/VChip';
import ExportPdfModal from '../components/ExportPdfModal';
import ShareLinkModal from '../components/ShareLinkModal';
import { loadTracks, saveVersionNotes } from '../lib/storage';
import { exportFicheToPdf } from '../lib/exportPdf';
import { renderWithEmphasis, formatAnalyzedAt, splitVerdict } from '../lib/ficheHelpers.jsx';
import useMobile from '../hooks/useMobile';
import useNarrowDesktop from '../hooks/useNarrowDesktop';

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

// Anneau de score 140x140 — formule identique à la maquette : dasharray=276
export function ScoreRingBig({ value, prevScore = null }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const offset = 276 - (276 * v) / 100;
  const color = v < 50 ? '#ef6b6b' : v < 75 ? '#f5b056' : '#7bd88f';
  const band = v < 50 ? 'À retravailler' : v < 75 ? 'En progression' : 'Solide';
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
      aria-label="Voir les détails du score"
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
        <div className="big" style={{ color }}>
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
            <span>0–49 · À retravailler</span>
          </div>
          <div className={`rt-band${v >= 50 && v < 75 ? ' active' : ''}`}>
            <span className="dot" style={{ background: '#f5b056' }} />
            <span>50–74 · En progression</span>
          </div>
          <div className={`rt-band${v >= 75 ? ' active' : ''}`}>
            <span className="dot" style={{ background: '#7bd88f' }} />
            <span>75–100 · Solide</span>
          </div>
        </div>
        {delta != null && (
          <div className="rt-calib">
            {delta === 0
              ? 'Calibré sur la version précédente · stable'
              : `Calibré sur la version précédente · ${delta > 0 ? '+' : ''}${delta} pts`}
          </div>
        )}
        <div className="rt-note">
          Le score reflète la cohérence du mix (spatialisation, dynamique, équilibre, clarté). Il est calibré pour rester comparable d'une version à l'autre du même titre.
        </div>
      </div>
    </div>
  );
}

// Anneau 32x32 (items diag) — dasharray=82 ; couleur par seuil
export function ScoreRingSmall({ value }) {
  if (typeof value !== 'number') return null;
  const v = Math.max(0, Math.min(10, value));
  const offset = 82 - (82 * v) / 10;
  const color = v < 5 ? '#ef6b6b' : v < 7.5 ? '#f5b056' : '#7bd88f';
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
        fontSize: 10, letterSpacing: 2, fontWeight: 500,
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
      fontFamily: 'Inter, sans-serif', fontSize: 13,
      color: '#c5c5c7', lineHeight: 1.7, fontWeight: 300,
    }}>
      <span style={{ color: '#f5b056', fontSize: 14, lineHeight: 1.5, flexShrink: 0, marginTop: 1 }}>▸</span>
      <span>{renderWithEmphasis(children)}</span>
    </div>
  );

  return (
    <section className="listening-section">
      <div className="section-head">
        <span className="t">Écoute qualitative</span>
        <span className="line" />
      </div>
      <div className="listening-box">
        {hasStructured ? (
          <>
            {impression && <Block title="Impression"><P>{impression}</P></Block>}
            {expanded && (
              <>
                {points.length > 0 && <Block title="Points forts">{points.map((p, i) => <Bullet key={i}>{p}</Bullet>)}</Block>}
                {aTravailler.length > 0 && <Block title="À travailler">{aTravailler.map((p, i) => <Bullet key={i}>{p}</Bullet>)}</Block>}
                {espace && <Block title="Espace"><P>{espace}</P></Block>}
                {dynamique && <Block title="Dynamique"><P>{dynamique}</P></Block>}
                {potentiel && <Block title="Potentiel"><P>{potentiel}</P></Block>}
              </>
            )}
            {hasMore && (
              <button
                onClick={() => setExpanded((v) => !v)}
                style={{
                  alignSelf: 'flex-start', marginTop: -6,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#f5b056', fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10, letterSpacing: 2, fontWeight: 500,
                  textTransform: 'uppercase', padding: '6px 0',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {expanded ? '— Réduire' : '+ Voir l\u2019écoute complète'}
              </button>
            )}
          </>
        ) : (
          legacySections.map((sec, i) => (
            <div key={i}>
              {sec.title && <h3 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 2, fontWeight: 500, color: '#f5b056', textTransform: 'uppercase', margin: '0 0 10px' }}>{sec.title}</h3>}
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

const ANALYSIS_TIPS = [
  "Une caisse claire qui manque d'air : essaie une reverb courte en send, pas en insert.",
  "Mix qui manque de punch : compression parallèle sur la bus drums, ratio 4:1 avec beaucoup de blend.",
  "Voix qui perce trop : un de-esser après le compresseur, pas avant.",
  "Kick et basse qui se battent : sidechain léger sur la basse, attack rapide, release ~120ms.",
  "Mix qui sonne plat : checke la phase entre overhead et close mics sur la batterie.",
  "Graves brouillons : EQ soustractive entre 200 et 400 Hz sur les instruments du bas.",
  "Manque de profondeur : varie les temps de reverb — courte devant, longue derrière.",
  "Voix qui chante en avant : automation du volume note par note plutôt que compression forte.",
  "Trop d'aigus agressifs : un shelf très doux à partir de 10 kHz, -1 à -2 dB suffit souvent.",
  "Stéréo qui s'effondre en mono : checke le bus mix en mono dès le début, pas à la fin.",
];

function AnalyzingState({ stage }) {
  const [tipIdx, setTipIdx] = useState(() => Math.floor(Math.random() * ANALYSIS_TIPS.length));
  // Track the highest stage reached to prevent checkboxes from unchecking
  const [maxIdx, setMaxIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setTipIdx((i) => (i + 1) % ANALYSIS_TIPS.length);
    }, 10000);
    return () => clearInterval(id);
  }, []);

  const steps = [
    { id: 'upload', label: 'Upload audio' },
    { id: 'listening', label: 'Écoute qualitative' },
    { id: 'fiche', label: 'Génération de la fiche' },
  ];

  // Derive progress from stage — monotonic (never goes backward)
  const rawIdx =
    stage === 'all_done' ? 3 :
    stage === 'fiche_done' ? 3 :
    stage === 'listening_done' ? 2 :
    stage === 'listening_started' ? 1 :
    1;

  useEffect(() => {
    setMaxIdx((prev) => Math.max(prev, rawIdx));
  }, [rawIdx]);

  const currentIdx = Math.max(maxIdx, rawIdx);

  const bars = Array.from({ length: 20 }, (_, i) => Math.random());

  return (
    <div className="analyzing-state">
      {/* Spinner + titre */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          border: '2.5px solid #f5b05622',
          borderTopColor: '#f5b056',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, fontWeight: 400,
          color: '#ededed', margin: 0, textAlign: 'center', lineHeight: 1.2,
          letterSpacing: 5, textTransform: 'uppercase',
        }}>Finalisation de l'analyse</h1>
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#7c7c80',
          margin: 0, textAlign: 'center', fontWeight: 300, lineHeight: 1.6, letterSpacing: 1,
        }}>
          La fiche d'analyse se génère. Encore quelques secondes.
        </p>
      </div>

      {/* Étapes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        {steps.map((s, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx && currentIdx < 3;
          const color = done ? '#7bd88f' : active ? '#f5b056' : '#5a5a5e';
          return (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 16px',
              border: `1px solid ${active ? '#f5b05655' : '#2a2a2e'}`,
              borderRadius: 10,
              background: active ? '#f5b05611' : 'transparent',
              transition: 'all .3s',
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: '50%',
                background: done ? color : 'transparent',
                border: `1.5px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {done && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {active && (
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: color, animation: 'pulse 1.2s ease-in-out infinite',
                  }} />
                )}
              </span>
              <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
              <span style={{
                fontFamily: 'JetBrains Mono, Inter, monospace', fontSize: 11, letterSpacing: 1,
                textTransform: 'uppercase',
                color: done ? '#c5c5c7' : active ? '#f5b056' : '#7c7c80',
              }}>{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Mini animated bars */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 28, width: 120, opacity: 0.6 }}>
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              background: 'linear-gradient(to top, #f5b056, #f5b05633)',
              borderRadius: '1.5px 1.5px 0 0',
              animation: `barrise ${0.3 + h * 0.4}s ease ${i * 0.03}s alternate infinite`,
              transformOrigin: 'bottom',
              height: `${20 + h * 80}%`,
            }}
          />
        ))}
      </div>

      {/* Tip */}
      <div style={{
        width: '100%', padding: '18px 22px',
        background: '#f5b05608', border: '1px solid #f5b05622', borderLeft: '3px solid #f5b056',
        borderRadius: 10, minHeight: 70, display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 2,
          color: '#f5b056', textTransform: 'uppercase',
        }}>Le saviez-vous</div>
        <div key={tipIdx} style={{
          fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#c5c5c7',
          lineHeight: 1.7, fontWeight: 300,
          animation: 'fadein .4s ease',
        }}>{ANALYSIS_TIPS[tipIdx]}</div>
      </div>
    </div>
  );
}

// ── Timeline (sticky bar avec chips versions) ──────────────

function Timeline({ track, currentVersionName, stage, onSelectVersion, onAddVersion, onShareVersion, onExportVersion, onTracksRefresh, onGoHome }) {
  const scrollRef = useRef(null);
  const [showFadeRight, setShowFadeRight] = useState(false);
  const [showFadeLeft, setShowFadeLeft] = useState(false);

  const versions = track?.versions || [];
  const currentIdx = versions.findIndex((v) => v.name === currentVersionName);
  const current = currentIdx >= 0 ? versions[currentIdx] : versions[versions.length - 1];
  const currentVIdx = currentIdx >= 0 ? currentIdx : versions.length - 1;

  // Auto-scroll sur la version courante
  useEffect(() => {
    if (!scrollRef.current || currentVIdx < 0) return;
    const container = scrollRef.current;
    const activeChip = container.querySelector('.vchip.active');
    if (activeChip) {
      const cRect = container.getBoundingClientRect();
      const aRect = activeChip.getBoundingClientRect();
      const target = container.scrollLeft + (aRect.left - cRect.left) - (cRect.width - aRect.width) / 2;
      container.scrollTo({ left: target, behavior: 'smooth' });
    }
  }, [currentVIdx, versions.length]);

  // Surveille l'overflow pour afficher les fades
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setShowFadeLeft(el.scrollLeft > 4);
      setShowFadeRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [versions.length]);

  if (!track) return null;

  const stageLabel =
    stage === 'all_done' ? 'Version actuelle' :
    stage === 'fiche_done' ? 'Écoute en cours' :
    'Analyse en cours';

  return (
    <div className="timeline">
      <div className="track-title">
        <span className="track-title-left">
          {onGoHome && (
            <button className="fiche-back" onClick={onGoHome} title="Accueil">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13l-5-5 5-5"/></svg>
            </button>
          )}
          <span><TrackTitleText title={track.title} /></span>
        </span>
        {current && (
          <span className="vsub">
            <span className="vlabel">{stageLabel}</span>
            <b>{currentVersionName || current.name}</b>
          </span>
        )}
      </div>

      {current && (onShareVersion || onExportVersion) && (
        <div className="fiche-head-actions">
          {onShareVersion && (
            <button
              type="button"
              className="fiche-head-btn"
              onClick={() => onShareVersion(track, current)}
              disabled={!current?.id || current.id === '__pending_v__'}
              title={!current?.id || current.id === '__pending_v__' ? 'Enregistrement en cours…' : 'Générer un lien public lecture seule'}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6.5 9.5l3-3M5 11L3.5 12.5a2.12 2.12 0 01-3-3L3 7m8 2l1.5-1.5a2.12 2.12 0 000-3 2.12 2.12 0 00-3 0L8 6"
                      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="fhb-label">Partager un lien</span>
            </button>
          )}
          {onExportVersion && (
            <button
              type="button"
              className="fiche-head-btn"
              onClick={() => onExportVersion(track, current)}
              title="Générer un PDF partageable de cette version"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12v1.5A1.5 1.5 0 004.5 15h7A1.5 1.5 0 0013 13.5V12"
                      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="fhb-label">Exporter en PDF</span>
            </button>
          )}
        </div>
      )}

      <div className="versions-block">
        {/* CompareButton retiré — en sommeil */}
        <span className="versions-label">Versions</span>
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <div
            ref={scrollRef}
            className="versions-row"
            style={{
              overflowX: 'auto', overflowY: 'visible', paddingTop: 7, marginTop: -3,
              scrollbarWidth: 'none', msOverflowStyle: 'none',
              flexWrap: 'nowrap', maxWidth: '100%',
            }}
          >
            <style>{`.versions-row::-webkit-scrollbar { display: none; }`}</style>
            {versions.map((v, idx) => {
              const score = v.analysisResult?.fiche?.globalScore;
              const prev = idx > 0 ? versions[idx - 1]?.analysisResult?.fiche?.globalScore : null;
              const delta = (typeof score === 'number' && typeof prev === 'number') ? score - prev : null;
              const isActive = v.name === currentVersionName;
              return (
                <span key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {delta != null && (
                    <span className={`vdelta${delta < 0 ? ' down' : ''}`}>
                      {delta > 0 ? '↑' : delta < 0 ? '↓' : ''}{Math.abs(delta)}
                    </span>
                  )}
                  <VChip track={track} version={v} idx={idx} isActive={isActive} score={score} onSelect={onSelectVersion} onRefresh={onTracksRefresh} onShare={onShareVersion} onExport={onExportVersion} onDeleted={(deleted) => { if (deleted.name === currentVersionName && versions.length > 1) { const next = versions.find(x => x.id !== deleted.id); if (next) onSelectVersion?.(track, next); } }} />
                </span>
              );
            })}
            <button
              className="new-version-btn"
              title="Nouvelle version"
              onClick={() => onAddVersion && onAddVersion(track)}
              style={{ flexShrink: 0 }}
            >+</button>
          </div>
          {/* Fades */}
          {showFadeLeft && (
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 40,
              pointerEvents: 'none',
              background: 'linear-gradient(to right, rgba(20,20,22,.9), transparent)',
            }} />
          )}
          {showFadeRight && (
            <div style={{
              position: 'absolute', right: 0, top: 0, bottom: 0, width: 40,
              pointerEvents: 'none',
              background: 'linear-gradient(to left, rgba(20,20,22,.9), transparent)',
            }} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── FocusModal (modale centrée, click-outside, flèches latérales) ───

function FocusModal({ open, plan, idx, elements, onClose, onPrev, onNext, isResolved, onToggleResolved }) {
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
        aria-label="Précédent"
      >‹</button>
      <button
        className={`focus-arrow focus-arrow-right${atLast ? ' disabled' : ''}`}
        onClick={(e) => { e.stopPropagation(); if (!atLast) onNext(); }}
        aria-label="Suivant"
      >›</button>

      <div className="focus-container" onClick={(e) => e.stopPropagation()}>
      <div className="focus-panel">
        {/* En-tête : compteur + close */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 2,
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
            aria-label="Fermer"
          >✕</button>
        </div>

        <h2 style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 26,
          lineHeight: 1.25, color: '#ededed', margin: '0 0 20px',
          display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap',
        }}>
          <span className={`pbadge pbadge-inline ${prio}`}>{(p.p || '').toUpperCase()}</span>
          <span style={{ flex: 1, minWidth: 0 }}>{p.task}</span>
        </h2>

        {p.daw && (
          <div className="daw-box" style={{ marginBottom: 16 }}>
            <span className="daw-label">Action DAW</span>
            {p.daw}
          </div>
        )}

        {(p.metered || p.target) && (
          <div className="mt-grid" style={{ marginBottom: 16 }}>
            {p.metered && (
              <div className="mt-box m">
                <div className="mt-label">Mesuré</div>
                <div className="mt-val">{p.metered}</div>
              </div>
            )}
            {p.target && (
              <div className="mt-box t">
                <div className="mt-label">Objectif</div>
                <div className="mt-val">{p.target}</div>
              </div>
            )}
          </div>
        )}

        {linkedItems.length > 0 && (
          <div className="linked-elements" style={{ marginBottom: 20 }}>
            <div className="label">Éléments liés</div>
            <div className="le-list">
              {linkedItems.map((it) => (
                <div className="le" key={it.id}>
                  <span className="cat">{it.cat}</span>
                  <span className="name">{it.label}</span>
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
          {isResolved ? 'Résolu' : 'Marquer comme résolu'}
        </button>
      </div>
      </div>
    </div>
  );
}

// ── VersionChat (panneau glissant) ─────────────────────────

function VersionChat({ config, analysisResult, open, onClose, anchored = false }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef(null);
  const textareaRef = useRef(null);
  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages((m) => [...m, userMsg]);
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
          messages: [...messages, userMsg],
          title: config?.title || '',
          version: config?.version || '',
          daw: config?.daw || 'Logic Pro',
          listening: analysisResult?.listening || null,
          fiche: analysisResult?.fiche || null,
        }),
      });
      clearTimeout(timeout);
      const json = await res.json();
      setMessages((m) => [...m, { role: 'assistant', content: json.reply || '…' }]);
    } catch (e) {
      if (e.name !== 'AbortError') {
        setMessages((m) => [...m, { role: 'assistant', content: 'Erreur de connexion.' }]);
      }
    } finally { setLoading(false); controllerRef.current = null; }
  };

  return (
    <>
      {!anchored && <div className="chat-backdrop" onClick={onClose} />}
      <aside className={`chat-panel${anchored ? ' chat-panel-anchored' : ''}`}>
        <div className="chat-head">
          <span className="ctitle">Discussion</span>
          {!anchored && <button className="cclose" onClick={onClose}>✕</button>}
        </div>
        <div className="chat-body">
          {messages.length === 0 && (
            <div className="msg ai">
              <span className="ai-label">Versions</span>
              Pose une question sur cette version — je regarde l'analyse et je te réponds.
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role === 'assistant' ? 'ai' : m.role}`}>
              {m.role === 'assistant' && <span className="ai-label">Versions</span>}
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="msg ai">
              <span className="ai-label">Versions</span>
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
            placeholder="Pose une question sur l'analyse…"
            rows={1}
          />
          <button onClick={send}>Envoyer</button>
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
function fmtScoreDelta(cur, prev) {
  if (cur == null || prev == null) return null;
  const d = cur - prev;
  if (d === 0) return '= v. préc.';
  return `${d > 0 ? '+' : '−'}${Math.abs(Math.round(d))} pts`;
}
function fmtDurationDelta(cur, prev) {
  if (cur == null || prev == null) return null;
  const d = Math.round(cur - prev);
  if (d === 0) return '= v. préc.';
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
  const scores = versionScores.map((v) => v.score).filter((s) => typeof s === 'number');
  const hasMultiple = scores.length >= 2;
  const maxScore = scores.length ? Math.max(...scores, 100) : 100;
  const firstName = versionScores[0]?.name;
  const lastName = versionScores[versionScores.length - 1]?.name;
  const deltaLabel = fmtScoreDelta(currentScore, prevScore);

  return (
    <div className="evolution-panel">
      <div className="vr-title">
        {hasMultiple ? `Évolution ${firstName} → ${lastName}` : 'Évolution'}
      </div>

      <div className="spark">
        {versionScores.length === 0 ? (
          <div className="spark-empty">—</div>
        ) : versionScores.map((v, i) => {
          const s = typeof v.score === 'number' ? v.score : 0;
          const h = Math.max(6, (s / maxScore) * 100);
          const tier = scoreTier(v.score);
          return (
            <div
              key={i}
              className={`bar ${tier}`}
              style={{ height: `${h}%` }}
              title={`${v.name} · ${typeof v.score === 'number' ? v.score : '—'}`}
            />
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
          <div className="k">Version active</div>
          <div className="v" title={currentVersionName || ''}>{currentVersionName || '—'}</div>
          <div className="d">
            {prevScore != null && currentScore != null
              ? (fmtScoreDelta(currentScore, prevScore) || `${currentScore} pts`)
              : (currentScore != null ? `${currentScore} pts` : '—')}
          </div>
        </div>
        <div className="stat">
          <div className="k">Durée</div>
          <div className="v">{fmtDuration(currentDuration)}</div>
          <div className="d">
            {fmtDurationDelta(currentDuration, prevDuration) || '—'}
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

  return (
    <section className={`row-qualitative${expanded ? ' expanded' : ''}`}>
      {/* Colonne gauche : Impression (+ Potentiel) → déploie Espace + Dynamique */}
      <div className="q-block impression">
        <div className="q-title"><span className="dot" />Impression</div>

        <div className="impression-summary">
          {impression && <p>{renderWithEmphasis(impression)}</p>}
        </div>

        <div className="impression-full">
          {potentiel && (
            <>
              <div className="subq-title">Potentiel</div>
              <p>{renderWithEmphasis(potentiel)}</p>
            </>
          )}
          {espace && (
            <>
              <div className="subq-title">Espace</div>
              <p>{renderWithEmphasis(espace)}</p>
            </>
          )}
          {dynamique && (
            <>
              <div className="subq-title">Dynamique</div>
              <p>{renderWithEmphasis(dynamique)}</p>
            </>
          )}
        </div>

        {hasDeploy && (
          <button className="impression-toggle" onClick={() => setExpanded((v) => !v)}>
            {expanded ? '− Réduire' : "+ Voir l\u2019écoute complète"}
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
              <span className="q-title"><span className="dot" />Points forts</span>
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
              <span className="q-title"><span className="dot" />À travailler</span>
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

function NotesSection({ versionId, initialNotes }) {
  const [notes, setNotes] = useState(initialNotes || '');
  const [open, setOpen] = useState(() => Boolean(initialNotes && initialNotes.trim()));
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
  const label = status === 'saving' ? 'Sauvegarde…' : status === 'saved' ? 'Sauvegardé' : null;

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
          <span className="notes-title">Mes notes</span>
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
              ? 'Tes observations, rappels, TODOs pour le prochain mix…'
              : 'Notes disponibles une fois l\u2019analyse sauvegardée.'}
            disabled={!canEdit}
            rows={3}
          />
        </div>
      </div>
    </section>
  );
}

// ── FicheScreen (principal) ────────────────────────────────

export default function FicheScreen({ config, analysisResult, onSelectVersion, onAddVersion, onGoHome, refreshKey }) {
  const [tracks, setTracks] = useState([]);
  const [openCat, setOpenCat] = useState(0); // un seul accordéon ouvert à la fois
  const [openPlanIdx, setOpenPlanIdx] = useState(null);
  const [resolved, setResolved] = useState(new Set());
  const [hideResolved, setHideResolved] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState(null); // { track, version } ouverts dans la modale d'export PDF
  const [shareTarget, setShareTarget] = useState(null);   // { track, version } ouverts dans la modale de partage
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
  const fiche = analysisResult?.fiche || null;
  const listening = analysisResult?.listening || null;
  const stage = analysisResult?._stage || 'idle';
  const plan = fiche?.plan || [];
  const elements = fiche?.elements || [];
  const score = typeof fiche?.globalScore === 'number' ? fiche.globalScore : null;

  // ── Données pour EvolutionPanel (sparkline + stats) ──
  const allVersions = currentTrack?.versions || [];
  const currentIdx = allVersions.findIndex((v) => v.name === config?.version);
  const versionScores = allVersions.map((v, i) => ({
    name: v.name,
    // la version courante peut être en cours d'analyse → utiliser le `score` en mémoire plutôt que l'ancien analysisResult
    score: i === currentIdx && score != null
      ? score
      : (typeof v.analysisResult?.fiche?.globalScore === 'number' ? v.analysisResult.fiche.globalScore : null),
  }));
  const currentDuration =
    (currentIdx >= 0 && allVersions[currentIdx]?.analysisResult?.fiche?.duration_seconds) ??
    fiche?.duration_seconds ??
    null;
  const prevVersion = currentIdx > 0 ? allVersions[currentIdx - 1] : null;
  const prevScore = typeof prevVersion?.analysisResult?.fiche?.globalScore === 'number'
    ? prevVersion.analysisResult.fiche.globalScore
    : null;
  const prevDuration = prevVersion?.analysisResult?.fiche?.duration_seconds ?? null;

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

        <div className={`fiche-layout${!chatAsDrawer && fiche ? ' has-chat' : ''}`}>
        <div className="page">
          {!fiche ? (
            <AnalyzingState stage={stage} />
          ) : (
          <>
          {/* 1 · Verdict + Évolution (2 colonnes) */}
          <section className="row-verdict">
            <div className="rv-left">
              {score != null && <ScoreRingBig value={score} prevScore={prevScore} />}
              <div className="verdict-text">
                {(() => {
                  // Priorité : verdict (phrase accrocheuse) pour le titre, summary pour le paragraphe.
                  // Si un seul des deux existe → on découpe en 1ʳᵉ phrase (titre) + reste (paragraphe).
                  const vText = fiche?.verdict || fiche?.summary || '';
                  if (!vText) return <h1>Analyse en cours…</h1>;
                  if (fiche?.verdict && fiche?.summary && fiche.verdict !== fiche.summary) {
                    return (
                      <>
                        <h1>{renderWithEmphasis(fiche.verdict)}</h1>
                        <p>{fiche.summary}</p>
                      </>
                    );
                  }
                  const { headline, rest } = splitVerdict(vText);
                  return (
                    <>
                      <h1>{renderWithEmphasis(headline)}</h1>
                      {rest && <p>{rest}</p>}
                    </>
                  );
                })()}
                {(() => {
                  const stamp = formatAnalyzedAt(versionInDb?.createdAt || versionInDb?.date);
                  return stamp ? <div className="analyzed-at">{stamp}</div> : null;
                })()}
              </div>
            </div>
            <div className="rv-right">
              <EvolutionPanel
                versionScores={versionScores}
                currentVersionName={config?.version}
                currentScore={score}
                currentDuration={currentDuration}
                prevScore={prevScore}
                prevDuration={prevDuration}
              />
            </div>
          </section>

          {/* 2 · Écoute qualitative (2 cols : Impression | Points forts + À travailler) */}
          <QualitativeSection listening={listening} />

          {/* 3 · Diagnostic (gauche) + Plan d'action (droite) */}
          {(elements.length > 0 || plan.length > 0) && (
            <div className="row-two">
              <div className="col-diag">
                {elements.length > 0 && (
                  <>
                    <div className="section-head">
                      <span className="t">Diagnostic par éléments</span>
                      <span className="line" />
                      <span className="count">{elements.length} catégorie{elements.length > 1 ? 's' : ''}</span>
                    </div>
                    {elements.map((el, idx) => {
                      const open = openCat === idx;
                      const count = el.items?.length || 0;
                      const scores = (el.items || []).map((it) => it.score).filter((s) => typeof s === 'number');
                      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
                      return (
                        <div key={el.id || el.cat || idx} className={`diag-cat${open ? ' open' : ''}`}>
                          <div className="diag-cat-head" onClick={() => toggleCat(idx)}>
                            <span className="chev">
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                            <span className="name">{el.cat}</span>
                            <span className="count">
                              {count} élément{count > 1 ? 's' : ''}{avg != null ? ` · moy. ${avg.toFixed(1).replace(/\.0$/, '')}` : ''}
                            </span>
                          </div>
                          <div className="diag-cat-body">
                            {(el.items || []).map((it, i) => (
                              <div key={it.id || i} className="diag-item">
                                <ScoreRingSmall value={it.score} />
                                <div className="di-body">
                                  <div className="di-name">{it.label}</div>
                                  {it.detail && <div className="di-detail">{it.detail}</div>}
                                  {Array.isArray(it.tools) && it.tools.length > 0 && (
                                    <div className="di-tools">
                                      {it.tools.map((t) => <span key={t}>{t}</span>)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
              <div className="col-plan">
                {plan.length > 0 && (() => {
                  const planKeys = plan.map((p, i) => `${i}::${(p.task || '').slice(0, 60)}`);
                  const resolvedCount = planKeys.reduce((acc, k) => acc + (resolved.has(k) ? 1 : 0), 0);
                  const hasResolved = resolvedCount > 0;
                  return (
                  <>
                    <div className="section-head">
                      <span className="t">Plan d'action</span>
                      <span className="line" />
                      <span className="count">
                        {hasResolved
                          ? `${resolvedCount}/${plan.length} résolu${resolvedCount > 1 ? 's' : ''}`
                          : `${plan.length} ajustement${plan.length > 1 ? 's' : ''}`}
                      </span>
                      {hasResolved && (
                        <button
                          type="button"
                          className={`plan-filter-toggle${hideResolved ? ' active' : ''}`}
                          onClick={() => setHideResolved((v) => !v)}
                          title={hideResolved ? 'Afficher tous les ajustements' : 'Masquer les ajustements résolus'}
                        >
                          {hideResolved ? 'Tout afficher' : 'Masquer résolus'}
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
                                  <span className="daw-label">Action DAW</span>
                                  {p.daw}
                                </div>
                              )}
                              {(p.metered || p.target) && (
                                <div className="mt-grid">
                                  {p.metered && (
                                    <div className="mt-box m">
                                      <div className="mt-label">Mesuré</div>
                                      <div className="mt-val">{p.metered}</div>
                                    </div>
                                  )}
                                  {p.target && (
                                    <div className="mt-box t">
                                      <div className="mt-label">Objectif</div>
                                      <div className="mt-val">{p.target}</div>
                                    </div>
                                  )}
                                </div>
                              )}
                              {linkedItems.length > 0 && (
                                <div className="linked-elements">
                                  <div className="label">Éléments liés</div>
                                  <div className="le-list">
                                    {linkedItems.map((it) => (
                                      <div className="le" key={it.id}>
                                        <span className="cat">{it.cat}</span>
                                        <span className="name">{it.label}</span>
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
                                {done ? 'Résolu' : 'Marquer comme résolu'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                  );
                })()}

                {/* Notes perso — accolées au Plan d'action, dans la colonne de droite */}
                <NotesSection
                  key={versionInDb?.id || 'pending'}
                  versionId={versionInDb?.id || null}
                  initialNotes={(analysisResult && analysisResult.userNotes) || ''}
                />
              </div>
            </div>
          )}
          </>
          )}
        </div>
        {!chatAsDrawer && fiche && (
          <aside className="fiche-chat-side">
            <VersionChat
              config={config}
              analysisResult={analysisResult}
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
        const ar = v?.analysisResult
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
          <button className="chat-fab" onClick={() => setChatOpen(true)} title="Discussion">
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
              <path d="M2 3h12v8H7l-3 3v-3H2V3z" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
          <VersionChat
            config={config}
            analysisResult={analysisResult}
            open={chatOpen}
            onClose={() => setChatOpen(false)}
          />
        </>
      )}
    </>
  );
}
