import { useState, useEffect, useRef } from 'react';
import API from '../constants/api';
import { loadTracks, deleteTrack, renameTrack } from '../lib/storage';
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

// Anneau de score 140x140 — formule identique à la maquette : dasharray=276
function ScoreRingBig({ value }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const offset = 276 - (276 * v) / 100;
  return (
    <div className="score-ring">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="44" fill="none" stroke="#f5b05622" strokeWidth="5" />
        <circle
          cx="50" cy="50" r="44" fill="none" stroke="#f5b056" strokeWidth="5"
          strokeDasharray="276" strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="center">
        <div className="big">{Math.round(v)}</div>
        <div className="unit">SCORE / 100</div>
      </div>
    </div>
  );
}

// Anneau 32x32 (items diag) — dasharray=82 ; couleur par seuil
function ScoreRingSmall({ value }) {
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
function renderWithEmphasis(text) {
  if (!text) return null;
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((p, i) =>
    p.startsWith('*') && p.endsWith('*') && p.length > 2
      ? <em key={i}>{p.slice(1, -1)}</em>
      : <span key={i}>{p}</span>
  );
}

// Sépare un texte en (1ʳᵉ phrase → titre) + (reste → paragraphe).
// Retourne { headline, rest } ; rest peut être vide.
function splitVerdict(text) {
  if (!text) return { headline: '', rest: '' };
  // Découpe à la première ponctuation forte suivie d'espace (ou fin de texte).
  const m = text.match(/^([^.!?]*[.!?])\s+(.*)$/s);
  if (m) return { headline: m[1].trim(), rest: m[2].trim() };
  return { headline: text.trim(), rest: '' };
}

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
  // Accepte string OU objet { text: "..." } OU { sections: [...] }
  let text = null;
  if (typeof listening === 'string') text = listening;
  else if (listening?.text) text = listening.text;
  else if (listening?.content) text = listening.content;

  const sections = text ? parseListening(text) : (listening?.sections || []);
  if (!sections.length) return null;

  return (
    <section style={{ marginTop: 48, marginBottom: 8 }}>
      <div className="section-head">
        <span className="t">{s.fiche.listeningTitle}</span>
        <span className="line" />
        <span className="count">{sections.length} {sections.length > 1 ? s.fiche.sectionPlural : s.fiche.sectionSingular}</span>
      </div>

      <div style={{
        background: 'rgba(245,176,86,.03)',
        border: '1px solid #2a2a2e',
        borderRadius: 12,
        padding: '28px 32px',
        display: 'flex', flexDirection: 'column', gap: 24,
      }}>
        {sections.map((sec, i) => (
          <div key={i}>
            {sec.title && (
              <h3 style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10, letterSpacing: 2, fontWeight: 500,
                color: '#f5b056', textTransform: 'uppercase',
                margin: '0 0 10px',
              }}>{sec.title}</h3>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sec.blocks.map((b, j) => b.type === 'bullet' ? (
                <div key={j} style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                  color: '#c5c5c7', lineHeight: 1.7, fontWeight: 300,
                }}>
                  <span style={{
                    color: '#f5b056', fontSize: 14, lineHeight: 1.5,
                    flexShrink: 0, marginTop: 1,
                  }}>▸</span>
                  <span>{renderWithEmphasis(b.text)}</span>
                </div>
              ) : (
                <p key={j} style={{
                  margin: 0,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 17, lineHeight: 1.6, fontWeight: 400,
                  color: '#ededed',
                }}>{renderWithEmphasis(b.text)}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── AnalyzingState (page d'attente riche) ─────────────────

function AnalyzingState({ stage }) {
  const { s } = useLang();
  const tips = s.fiche.analysisTips || [];
  const [tipIdx, setTipIdx] = useState(() => Math.floor(Math.random() * Math.max(1, tips.length)));
  useEffect(() => {
    if (!tips.length) return;
    const id = setInterval(() => {
      setTipIdx((i) => (i + 1) % tips.length);
    }, 10000);
    return () => clearInterval(id);
  }, [tips.length]);

  const steps = [
    { id: 'upload', label: s.fiche.stepUpload },
    { id: 'listening', label: s.fiche.stepListening },
    { id: 'fiche', label: s.fiche.stepFiche },
  ];
  // Derive progress from stage
  const currentIdx =
    stage === 'all_done' ? 3 :
    stage === 'fiche_done' ? 2 :
    stage === 'listening_done' ? 2 :
    stage === 'listening_started' ? 1 :
    1;

  return (
    <div style={{
      maxWidth: 560, margin: '80px auto 0', padding: '0 60px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40,
    }}>
      {/* Titre + indicateur rotatif */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '2px solid #f5b05622',
          borderTopColor: '#f5b056',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <h1 style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 32, fontWeight: 400,
          color: '#ededed', margin: 0, textAlign: 'center', lineHeight: 1.2,
        }}>{s.fiche.analyzingTitle}</h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#7c7c80',
          margin: 0, textAlign: 'center', fontWeight: 300, lineHeight: 1.6,
        }}>
          {s.fiche.analyzingSub1}<br/>
          {s.fiche.analyzingSub2}
        </p>
      </div>

      {/* Étapes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        {steps.map((s, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx - 1 && currentIdx < 3;
          const color = done ? '#7bd88f' : active ? '#f5b056' : '#5a5a5e';
          return (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '10px 14px',
              border: `1px solid ${active ? '#f5b05655' : '#2a2a2e'}`,
              borderRadius: 8,
              background: active ? '#f5b05611' : 'transparent',
              transition: 'all .3s',
            }}>
              <span style={{
                width: 18, height: 18, borderRadius: '50%',
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
              <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 1,
                textTransform: 'uppercase',
                color: done ? '#c5c5c7' : active ? '#f5b056' : '#7c7c80',
              }}>{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Tip qui défile */}
      <div style={{
        width: '100%', padding: '20px 24px',
        background: '#f5b05608', border: '1px solid #f5b05622', borderLeft: '3px solid #f5b056',
        borderRadius: 10, minHeight: 80, display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 2,
          color: '#f5b056', textTransform: 'uppercase',
        }}>{s.fiche.didYouKnow}</div>
        <div key={tipIdx} style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#c5c5c7',
          lineHeight: 1.7, fontWeight: 300,
          animation: 'fadein .4s ease',
        }}>{tips[tipIdx]}</div>
      </div>
    </div>
  );
}

// ── Menu contextuel du titre (⋯) ───────────────────────────

function TrackMenu({ track, onRename, onDelete, onExport }) {
  const { s } = useLang();
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (menuRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', h);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', h);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        title={s.fiche.trackOptionsTitle}
        style={{
          width: 28, height: 28, borderRadius: 8,
          background: open ? 'rgba(245,176,86,.12)' : 'transparent',
          border: `1px solid ${open ? '#f5b05655' : '#2a2a2e'}`,
          color: '#7c7c80', cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, letterSpacing: 1, lineHeight: 1,
        }}
      >⋯</button>
      {open && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50,
            minWidth: 200, background: '#141416', border: '1px solid #2a2a2e',
            borderRadius: 10, padding: 6, boxShadow: '0 12px 40px rgba(0,0,0,.5)',
            animation: 'popin .12s ease',
          }}
        >
          <MenuItem label={s.fiche.menuRenameTrack} onClick={() => { setOpen(false); onRename?.(track); }} />
          <MenuItem label={s.fiche.menuExportTrack} onClick={() => { setOpen(false); onExport?.(track); }} />
          <div style={{ height: 1, background: '#2a2a2e', margin: '4px 2px' }} />
          <MenuItem label={s.fiche.menuDeleteTrack} danger onClick={() => { setOpen(false); onDelete?.(track); }} />
        </div>
      )}
    </div>
  );
}

function MenuItem({ label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        padding: '8px 12px', borderRadius: 6, border: 'none',
        background: 'transparent', cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 400,
        color: danger ? '#ef6b6b' : '#c5c5c7',
        transition: 'background .1s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = danger ? 'rgba(239,107,107,.08)' : 'rgba(245,176,86,.06)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >{label}</button>
  );
}

// ── Timeline (sticky bar avec chips versions) ──────────────

function Timeline({ track, currentVersionName, stage, onSelectVersion, onAddVersion, onRenameTrack, onDeleteTrack, onExportTrack }) {
  const { s } = useLang();
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
    stage === 'all_done' ? s.fiche.stageAllDone :
    stage === 'fiche_done' ? s.fiche.stageFicheDone :
    s.fiche.stageOther;

  return (
    <div className="timeline">
      <div className="track-title" style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <TrackMenu
            track={track}
            onRename={onRenameTrack}
            onDelete={onDeleteTrack}
            onExport={onExportTrack}
          />
          <span><TrackTitleText title={track.title} /></span>
        </span>
        {current && (
          <span className="vsub">
            <span className="vlabel">{stageLabel}</span>
            <b>{current.name}</b>
          </span>
        )}
      </div>

      <div className="versions-block" style={{ minWidth: 0, maxWidth: "55%" }}>
        <span className="versions-label">{s.fiche.versionsLabel}</span>
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <div
            ref={scrollRef}
            className="versions-row"
            style={{
              overflowX: 'auto', overflowY: 'hidden',
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
                  <div
                    className={`vchip${isActive ? ' active current-badge' : ''}`}
                    onClick={() => onSelectVersion && onSelectVersion(track, v)}
                  >
                    <span className="vname">V{idx + 1}</span>
                    <span className="vscore">
                      {typeof score === 'number' ? Math.round(score) : '—'}
                      {typeof score === 'number' && <span className="pct">%</span>}
                    </span>
                  </div>
                </span>
              );
            })}
            <button
              className="new-version-btn"
              title={s.fiche.newVersionTitle}
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

  const backdrop = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.72)',
    backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
    zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 40, animation: 'fadein .2s ease',
  };
  const panel = {
    position: 'relative',
    width: '100%', maxHeight: '88vh',
    overflowY: 'auto', background: '#141416', border: '1px solid #2a2a2e',
    borderRadius: 14, padding: '32px 36px',
    boxShadow: '0 24px 60px rgba(0,0,0,.6), 0 0 0 1px rgba(245,176,86,.08)',
    animation: 'popin .22s ease', boxSizing: 'border-box',
  };
  // Flèches positionnées en fixed par rapport au viewport :
  // horizontalement à ±(320 + 4)px du centre (320 = moitié de 640, 4 = overlap sur bordure).
  const arrowBtn = (disabled, side) => {
    const offset = `calc(50% - 320px - 4px)`; // distance depuis le bord opposé du viewport
    const base = {
      position: 'fixed', top: '50%', transform: 'translateY(-50%)',
      width: 44, height: 44, borderRadius: '50%',
      background: disabled ? 'rgba(20,20,22,.95)' : '#f5b056',
      border: `1px solid ${disabled ? '#2a2a2e' : '#f5b056'}`,
      color: disabled ? '#5a5a5e' : '#0c0c0d',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: disabled ? 'default' : 'pointer',
      fontSize: 22, fontFamily: "'DM Sans', sans-serif", lineHeight: 1,
      boxShadow: disabled ? 'none' : '0 6px 20px rgba(245,176,86,.35)',
      transition: 'all .18s ease',
      pointerEvents: disabled ? 'none' : 'auto',
      zIndex: 210,
    };
    return { ...base, [side]: offset };
  };

  return (
    <div style={backdrop} onClick={onClose}>
      <style>{`
        @keyframes popin { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* Flèche gauche — fixed à gauche du panneau */}
      <button
        style={arrowBtn(atFirst, 'left')}
        onClick={(e) => { e.stopPropagation(); if (!atFirst) onPrev(); }}
        aria-label={s.fiche.ariaPrev}
      >‹</button>

      {/* Flèche droite — fixed à droite du panneau */}
      <button
        style={arrowBtn(atLast, 'right')}
        onClick={(e) => { e.stopPropagation(); if (!atLast) onNext(); }}
        aria-label={s.fiche.ariaNext}
      >›</button>

      <div style={{ width: 640, maxWidth: 'calc(100vw - 160px)', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
      <div style={panel}>
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
          {isResolved ? s.fiche.focusResolved : s.fiche.focusMarkResolved}
        </button>
      </div>
      </div>
    </div>
  );
}

// ── VersionChat (panneau glissant) ─────────────────────────

function VersionChat({ config, analysisResult, open, onClose }) {
  const { s, lang } = useLang();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: lang, messages: [...messages, userMsg], config, analysisResult }),
      });
      const json = await res.json();
      setMessages((m) => [...m, { role: 'ai', content: json.reply || '…' }]);
    } catch {
      setMessages((m) => [...m, { role: 'ai', content: s.fiche.chatError }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="chat-backdrop" onClick={onClose} />
      <aside className="chat-panel">
        <div className="chat-head">
          <span className="ctitle">{s.fiche.chatTitle}</span>
          <button className="cclose" onClick={onClose}>✕</button>
        </div>
        <div className="chat-body">
          {messages.length === 0 && (
            <div className="msg ai">
              <span className="ai-label">{s.fiche.chatAiName}</span>
              {s.fiche.chatEmpty}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              {m.role === 'ai' && <span className="ai-label">{s.fiche.chatAiName}</span>}
              {m.content}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            placeholder={s.fiche.chatPlaceholder}
          />
          <button onClick={send}>{s.fiche.chatSend}</button>
        </div>
      </aside>
    </>
  );
}

// ── FicheScreen (principal) ────────────────────────────────

export default function FicheScreen({ config, analysisResult, onSelectVersion, onAddVersion, onTrackDeleted, onTrackRenamed }) {
  const { s } = useLang();
  const [tracks, setTracks] = useState([]);
  const [openCat, setOpenCat] = useState(0); // un seul accordéon ouvert à la fois
  const [focusIdx, setFocusIdx] = useState(null);
  const [resolved, setResolved] = useState(new Set());
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    loadTracks().then((t) => { if (alive) setTracks(t); });
  }, [config?.title, config?.version, analysisResult]);

  // body class pour le chat (maquette utilise body.chat-open)
  useEffect(() => {
    if (chatOpen) document.body.classList.add('chat-open');
    else document.body.classList.remove('chat-open');
    return () => document.body.classList.remove('chat-open');
  }, [chatOpen]);

  // ESC global pour focus
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') {
        if (focusIdx != null) setFocusIdx(null);
        else if (chatOpen) setChatOpen(false);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [focusIdx, chatOpen]);

  const dbTrack = tracks.find((t) => t.title === config?.title) || null;
  const currentTrack = dbTrack || (config?.title ? {
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

  const toggleCat = (i) => setOpenCat((prev) => (prev === i ? null : i));

  const toggleResolved = (key) => {
    setResolved((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // Handlers ⋯ track
  const handleRenameTrack = async (track) => {
    const next = window.prompt(s.fiche.renameTrackPrompt, track.title);
    if (!next || next.trim() === '' || next.trim() === track.title) return;
    try {
      await renameTrack(track.id, next.trim());
      const t = await loadTracks();
      setTracks(t);
      onTrackRenamed?.(track.id, next.trim());
    } catch (e) { console.warn('renameTrack failed', e); }
  };
  const handleDeleteTrack = async (track) => {
    const n = (track.versions || []).length;
    const versionWord = n > 1 ? s.fiche.versionPlural : s.fiche.versionSingular;
    const msg = (s.fiche.deleteTrackConfirm || '')
      .replace('{title}', track.title || '')
      .replace('{n}', String(n))
      .replace('{versionWord}', versionWord);
    if (!window.confirm(msg)) return;
    try {
      await deleteTrack(track.id);
      const t = await loadTracks();
      setTracks(t);
      onTrackDeleted?.(track.id);
    } catch (e) { console.warn('deleteTrack failed', e); }
  };
  const handleExportTrack = (track) => {
    const data = JSON.stringify(track, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${track.title.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <main className="main">
        {currentTrack && (
          <Timeline
            track={currentTrack}
            currentVersionName={config?.version}
            stage={stage}
            onSelectVersion={onSelectVersion}
            onAddVersion={onAddVersion}
            onRenameTrack={handleRenameTrack}
            onDeleteTrack={handleDeleteTrack}
            onExportTrack={handleExportTrack}
          />
        )}

        <div className="page">
          {!fiche ? (
            <AnalyzingState stage={stage} />
          ) : (
          <>
          {/* 1 · Verdict */}
          <section className="verdict">
            {score != null && <ScoreRingBig value={score} />}
            <div className="verdict-text">
              {(() => {
                // Priorité : verdict (phrase accrocheuse) pour le titre, summary pour le paragraphe.
                // Si un seul des deux existe → on découpe en 1ʳᵉ phrase (titre) + reste (paragraphe).
                const vText = fiche?.verdict || fiche?.summary || '';
                if (!vText) return <h1>{s.fiche.analyzingTitleEllipsis}</h1>;
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
            </div>
          </section>

          {/* 2 · Écoute qualitative (Gemini + Claude) */}
          {listening && <ListeningSection listening={listening} />}

          {/* 3 · Plan d'action */}
          {plan.length > 0 && (
            <>
              <div className="section-head">
                <span className="t">{s.fiche.planTitle}</span>
                <span className="line" />
                <span className="count">{plan.length} {plan.length > 1 ? s.fiche.adjustmentPlural : s.fiche.adjustmentSingular}</span>
              </div>
              <div className="priority-list">
                {plan.map((p, i) => {
                  const key = `${i}::${(p.task || '').slice(0, 60)}`;
                  const done = resolved.has(key);
                  const prio = (p.p || '').toLowerCase();
                  return (
                    <div key={i} className={`priority${done ? ' done' : ''}`} onClick={() => setFocusIdx(i)}>
                      <span className={`pbadge ${prio}`}>{(p.p || '').toUpperCase()}</span>
                      <span className="ptitle">{p.task}</span>
                      <div
                        className="pcheck"
                        onClick={(e) => { e.stopPropagation(); toggleResolved(key); }}
                      >
                        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" style={{ display: done ? 'block' : 'none' }}>
                          <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="parrow">→</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* 3 · Diagnostic */}
          {elements.length > 0 && (
            <>
              <div className="section-head">
                <span className="t">{s.fiche.diagTitle}</span>
                <span className="line" />
                <span className="count">{elements.length} {elements.length > 1 ? s.fiche.categoryPlural : s.fiche.categorySingular}</span>
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
                        {count} {count > 1 ? s.fiche.elementPlural : s.fiche.elementSingular}{avg != null ? `${s.fiche.avgPrefix}${avg.toFixed(1).replace(/\.0$/, '')}` : ''}
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
          </>
          )}
        </div>
      </main>

      {/* Focus modal */}
      <FocusModal
        open={focusIdx != null}
        plan={plan}
        idx={focusIdx}
        elements={elements}
        onClose={() => setFocusIdx(null)}
        onPrev={() => setFocusIdx((i) => Math.max(0, (i || 0) - 1))}
        onNext={() => setFocusIdx((i) => Math.min(plan.length - 1, (i || 0) + 1))}
        isResolved={focusIdx != null ? resolved.has(`${focusIdx}::${(plan[focusIdx]?.task || '').slice(0, 60)}`) : false}
        onToggleResolved={() => {
          if (focusIdx == null) return;
          toggleResolved(`${focusIdx}::${(plan[focusIdx]?.task || '').slice(0, 60)}`);
        }}
      />

      {/* Chat — bulle + panneau */}
      <button className="chat-fab" onClick={() => setChatOpen(true)} title={s.fiche.chatTitle}>
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
  );
}
