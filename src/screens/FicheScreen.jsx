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

// Met en italique ambre un segment de la phrase verdict si un "emphasis" est fourni.
function renderVerdictHeadline(text, emphasis) {
  if (!text) return null;
  if (emphasis && text.includes(emphasis)) {
    const [before, ...rest] = text.split(emphasis);
    return <>{before}<em>{emphasis}</em>{rest.join(emphasis)}</>;
  }
  return text;
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

// ── FocusOverlay ──────────────────────────────────────────

function FocusOverlay({ open, plan, idx, elements, onClose, onPrev, onNext, isResolved, onToggleResolved }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  if (!open || idx == null || !plan?.[idx]) return null;
  const p = plan[idx];
  const prio = (p.p || '').toLowerCase();
  const linkedItems = (elements || []).flatMap((el) =>
    (el.items || [])
      .filter((it) => Array.isArray(p.linkedItemIds) && it.id && p.linkedItemIds.includes(it.id))
      .map((it) => ({ ...it, cat: el.cat }))
  );

  return (
    <div className="focus open">
      <div className="focus-bar">
        <button className="focus-back" onClick={onClose}>← Retour</button>
        <div className="focus-local">
          <button className={`nav-btn${idx === 0 ? ' disabled' : ''}`} onClick={onPrev}>←</button>
          <span className="counter"><b>{idx + 1}</b> / {plan.length}</span>
          <button className={`nav-btn${idx === plan.length - 1 ? ' disabled' : ''}`} onClick={onNext}>→</button>
        </div>
      </div>
      <div className="focus-content">
        <h2>
          <span className={`pbadge pbadge-inline ${prio}`}>{(p.p || '').toUpperCase()}</span>
          {p.task}
        </h2>
        {p.daw && (
          <div className="daw-box">
            <span className="daw-label">Action DAW</span>
            {p.daw}
          </div>
        )}
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
  const [openCats, setOpenCats] = useState(new Set([0])); // 1ʳᵉ catégorie ouverte par défaut
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

  const toggleCat = (i) => {
    setOpenCats((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

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
          {/* 1 · Verdict */}
          <section className="verdict">
            {score != null && <ScoreRingBig value={score} />}
            <div className="verdict-text">
              {fiche?.verdict ? (
                <h1>{renderVerdictHeadline(fiche.verdict, fiche.verdictEmphasis)}</h1>
              ) : fiche?.summary ? (
                <h1>{fiche.summary.split(/[.!?]\s/)[0] + '.'}</h1>
              ) : (
                <h1>Analyse en cours…</h1>
              )}
              {fiche?.summary && fiche?.verdict && <p>{fiche.summary}</p>}
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
                const open = openCats.has(idx);
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
      </main>

      {/* Focus overlay */}
      <FocusOverlay
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
