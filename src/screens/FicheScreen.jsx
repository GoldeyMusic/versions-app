import { useState, useEffect, useRef } from 'react';
import API from '../constants/api';
import { loadTracks } from '../lib/storage';

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
          fontFamily: "'Instrument Serif', serif", fontSize: 32, fontWeight: 400,
          color: '#ededed', margin: 0, textAlign: 'center', lineHeight: 1.2,
        }}>Analyse en cours</h1>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#7c7c80',
          margin: 0, textAlign: 'center', fontWeight: 300, lineHeight: 1.6,
        }}>
          L'écoute qualitative et la fiche se génèrent en parallèle.<br/>
          Compte 30 à 90 secondes selon la longueur du titre.
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

function Timeline({ track, currentVersionName, stage, onSelectVersion, onAddVersion }) {
  if (!track) return null;
  const versions = track.versions || [];
  const currentIdx = versions.findIndex((v) => v.name === currentVersionName);
  const current = currentIdx >= 0 ? versions[currentIdx] : versions[versions.length - 1];
  const currentVIdx = currentIdx >= 0 ? currentIdx : versions.length - 1;

  const stageLabel =
    stage === 'all_done' ? 'Version actuelle' :
    stage === 'fiche_done' ? 'Écoute en cours' :
    'Analyse en cours';

  return (
    <div className="timeline">
      <div className="track-title">
        <span><TrackTitleText title={track.title} /></span>
        {current && (
          <span className="vsub">
            <span className="vlabel">{stageLabel}</span>
            <b>V{currentVIdx + 1}</b> · {current.name}
          </span>
        )}
      </div>

      <div className="versions-block">
        <span className="versions-label">Versions</span>
        <div className="versions-row">
          {versions.map((v, idx) => {
            const score = v.analysisResult?.fiche?.globalScore;
            const prev = idx > 0 ? versions[idx - 1]?.analysisResult?.fiche?.globalScore : null;
            const delta = (typeof score === 'number' && typeof prev === 'number') ? score - prev : null;
            const isActive = v.name === currentVersionName;
            return (
              <span key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
            title="Nouvelle version"
            onClick={() => onAddVersion && onAddVersion(track)}
          >+</button>
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

  const backdrop = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.72)',
    backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
    zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 80px', animation: 'fadein .2s ease',
  };
  const panel = {
    position: 'relative', width: '100%', maxWidth: 640, maxHeight: '88vh',
    overflowY: 'auto', background: '#141416', border: '1px solid #2a2a2e',
    borderRadius: 14, padding: '32px 36px',
    boxShadow: '0 24px 60px rgba(0,0,0,.6), 0 0 0 1px rgba(245,176,86,.08)',
    animation: 'popin .22s ease',
  };
  const arrowBtn = (side, disabled) => ({
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    [side]: 24, zIndex: 210,
    width: 52, height: 52, borderRadius: '50%',
    background: disabled ? 'rgba(255,255,255,.04)' : 'rgba(245,176,86,.12)',
    border: `1px solid ${disabled ? '#2a2a2e' : '#f5b05666'}`,
    color: disabled ? '#5a5a5e' : '#f5b056',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: disabled ? 'default' : 'pointer',
    fontSize: 22, fontFamily: 'Inter, sans-serif',
    transition: 'all .18s ease',
    pointerEvents: disabled ? 'none' : 'auto',
  });

  return (
    <div style={backdrop} onClick={onClose}>
      <style>{`
        @keyframes popin { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* Flèche gauche */}
      <button
        style={arrowBtn('left', atFirst)}
        onClick={(e) => { e.stopPropagation(); if (!atFirst) onPrev(); }}
        aria-label="Précédent"
      >‹</button>

      {/* Flèche droite */}
      <button
        style={arrowBtn('right', atLast)}
        onClick={(e) => { e.stopPropagation(); if (!atLast) onNext(); }}
        aria-label="Suivant"
      >›</button>

      <div style={panel} onClick={(e) => e.stopPropagation()}>
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
          fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 26,
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
  );
}

// ── VersionChat (panneau glissant) ─────────────────────────

function VersionChat({ config, analysisResult, open, onClose }) {
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
        body: JSON.stringify({ messages: [...messages, userMsg], config, analysisResult }),
      });
      const json = await res.json();
      setMessages((m) => [...m, { role: 'ai', content: json.reply || '…' }]);
    } catch {
      setMessages((m) => [...m, { role: 'ai', content: 'Erreur de connexion.' }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="chat-backdrop" onClick={onClose} />
      <aside className="chat-panel">
        <div className="chat-head">
          <span className="ctitle">Discussion</span>
          <button className="cclose" onClick={onClose}>✕</button>
        </div>
        <div className="chat-body">
          {messages.length === 0 && (
            <div className="msg ai">
              <span className="ai-label">Versions</span>
              Pose une question sur cette version — je regarde l'analyse et je te réponds.
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              {m.role === 'ai' && <span className="ai-label">Versions</span>}
              {m.content}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            placeholder="Écris ta question…"
          />
          <button onClick={send}>Envoyer</button>
        </div>
      </aside>
    </>
  );
}

// ── FicheScreen (principal) ────────────────────────────────

export default function FicheScreen({ config, analysisResult, onSelectVersion, onAddVersion }) {
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

  const currentTrack = tracks.find((t) => t.title === config?.title) || null;
  const fiche = analysisResult?.fiche || null;
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
            </div>
          </section>

          {/* 2 · Plan d'action */}
          {plan.length > 0 && (
            <>
              <div className="section-head">
                <span className="t">Plan d'action</span>
                <span className="line" />
                <span className="count">{plan.length} ajustement{plan.length > 1 ? 's' : ''}</span>
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
  );
}
