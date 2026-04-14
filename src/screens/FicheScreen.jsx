import { useState, useEffect, useRef } from 'react';
import T from '../constants/theme';
import API from '../constants/api';
import { REF_DATA, PERSO_DATA } from '../db/mockData';
import useIsDesktop from '../hooks/useIsDesktop';

// ── Icon Components ────────────────────────────────────────

const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const IconPlug = ({ c, s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
    <path d="M8 1v3M4 6H1M12 6h3M2 6h10a1 1 0 011 1v7a1 1 0 01-1 1H2a1 1 0 01-1-1V7a1 1 0 011-1z" stroke={c || T.amber} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconBulb = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1.5c-2.3 0-4 1.7-4 4 0 1.5.8 2.8 2 3.6v2.4H5v1h4v-1h-.5v-2.4c1.2-.8 2-2.1 2-3.6 0-2.3-1.7-4-4-4z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconPin = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M6 1c1.66 0 3 1.34 3 3 0 2.5-3 5-3 5s-3-2.5-3-5c0-1.66 1.34-3 3-3z" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="6" cy="4" r="0.8" fill="currentColor"/>
  </svg>
);

const IconChat = ({ c = "currentColor", s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
    <path d="M2 3h12v8H7l-3 3v-3H2V3z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/>
  </svg>
);

const IconChevronRight = ({ s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
    <path d="M5 2 L10 7 L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── PriorityBadge ────────────────────────────────────────

const PriorityBadge = ({ p }) => {
  if (!p) return null;
  const colors = { HIGH: T.red, MED: T.orange, LOW: T.muted };
  return (
    <span style={{
      fontFamily: T.mono, fontSize: 9, padding: "2px 7px", borderRadius: 4,
      background: `${colors[p]}15`, border: `1px solid ${colors[p]}33`,
      color: colors[p], letterSpacing: 0.5
    }}>
      {p}
    </span>
  );
};


// ── WaveformZone Component ────────────────────────────────────────

const WaveformZone = ({ zone, onZoneChange }) => {
  const [dragging, setDragging] = useState(false);
  const [dragAnchor, setDragAnchor] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);

  const TOTAL = 215; // 3:35 simulated
  const WAVE_BARS = Array.from({ length: 80 }, (_, i) => {
    const pos = i / 80;
    const envelope = Math.sin(pos * Math.PI) * 0.6 + 0.4;
    const rand = 0.3 + Math.random() * 0.7;
    return Math.min(1, rand * envelope);
  });

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPlayhead(p => {
        if (p >= 100) { setPlaying(false); return 100; }
        return p + (100 / TOTAL / 10);
      });
    }, 100);
    return () => clearInterval(id);
  }, [playing]);

  const getX = (e, clientX) => {
    const r = e.currentTarget.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
  };

  const onDown = (e) => {
    const x = getX(e, e.touches ? e.touches[0].clientX : e.clientX);
    setDragging(true);
    setDragAnchor(x);
    onZoneChange({ start: Math.round(x), end: Math.round(x), id: "custom", label: "Zone personnalisée", color: T.amber });
  };

  const onMove = (e) => {
    if (!dragging) return;
    const x = getX(e, e.touches ? e.touches[0].clientX : e.clientX);
    const a = Math.min(dragAnchor, x), b = Math.max(dragAnchor, x);
    onZoneChange({ start: Math.round(a), end: Math.round(b), id: "custom", label: "Zone personnalisée", color: T.amber });
  };

  const onUp = () => setDragging(false);

  const seek = (e) => {
    const x = getX(e, e.clientX);
    setPlayhead(x);
  };

  const fmt = (pct) => {
    const s = Math.round((pct / 100) * TOTAL);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  const selW = zone.end - zone.start;

  const IconPlay = () => <svg width="16" height="16" viewBox="0 0 16 16" fill={T.black}><polygon points="3,1 15,8 3,15" /></svg>;
  const IconPause = () => <svg width="16" height="16" viewBox="0 0 16 16" fill={T.black}><rect x="2" y="1" width="4" height="14" rx="1" /><rect x="10" y="1" width="4" height="14" rx="1" /></svg>;
  const IconRew = () => <svg width="14" height="14" viewBox="0 0 14 14" fill={T.muted}><polygon points="13,1 6,7 13,13" /><rect x="1" y="1" width="2" height="12" rx="1" /></svg>;
  const IconFwd = () => <svg width="14" height="14" viewBox="0 0 14 14" fill={T.muted}><polygon points="1,1 8,7 1,13" /><rect x="11" y="1" width="2" height="12" rx="1" /></svg>;
  const IconSkipB = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round"><polyline points="9,2 3,7 9,12" /><polyline points="13,2 7,7 13,12" /></svg>;
  const IconSkipF = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round"><polyline points="5,2 11,7 5,12" /><polyline points="1,2 7,7 1,12" /></svg>;

  return (
    <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, userSelect: "none" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.amber }}>ZONE D'ANALYSE</div>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: zone.id === "full" ? T.muted : T.amber }}>
          {zone.id === "full" ? "Morceau complet — 3:35" : `${fmt(zone.start)} → ${fmt(zone.end)} · ${zone.label}`}
        </div>
      </div>

      {/* Waveform */}
      <div
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
        style={{ position: "relative", height: 64, cursor: "crosshair", borderRadius: 8, overflow: "hidden", background: T.s2 }}
      >
        {/* Bars */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "flex-end", gap: 1, padding: "4px 4px" }}>
          {WAVE_BARS.map((h, i) => {
            const pct = (i / WAVE_BARS.length) * 100;
            const inSel = zone.id !== "full" && pct >= zone.start && pct <= zone.end;
            const played = pct <= playhead;
            let bg;
            if (inSel && played) bg = zone.color || T.amber;
            else if (inSel && !played) bg = `${zone.color || T.amber}99`;
            else if (!inSel && played) bg = "rgba(255,255,255,0.4)";
            else bg = "rgba(255,255,255,0.18)";
            return (
              <div key={i} style={{
                flex: 1,
                height: Math.max(3, h * 52),
                background: bg,
                borderRadius: 2,
                transition: "background .15s",
              }} />
            );
          })}
        </div>

        {/* Zone selection handles */}
        {selW > 1 && (
          <>
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${zone.start}%`, width: 2, background: zone.color || T.amber, borderRadius: 1 }} />
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${zone.end}%`, width: 2, background: zone.color || T.amber, borderRadius: 1 }} />
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${zone.start}%`, right: `${100 - zone.end}%`, background: `${zone.color || T.amber}18`, pointerEvents: "none" }} />
          </>
        )}

        {/* Playhead */}
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: `${playhead}%`,
          width: 1.5, background: "rgba(255,255,255,0.75)",
          boxShadow: "0 0 6px rgba(255,255,255,0.4)",
          pointerEvents: "none", transition: "left .1s linear",
        }}>
          <div style={{
            position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)",
            width: 8, height: 8, borderRadius: "50%",
            background: "white", boxShadow: "0 0 6px rgba(255,255,255,0.6)",
          }} />
        </div>

        {/* Clickable seek overlay */}
        <div
          onClick={seek}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, cursor: "pointer" }}
          onMouseDown={e => e.stopPropagation()}
        />
      </div>

      {/* Transport Bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginTop: 14, gap: 12,
      }}>
        {/* Time display */}
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, minWidth: 72 }}>
          {fmt(playhead)} <span style={{ color: T.muted2 }}>/ {fmt(100)}</span>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => { setPlayhead(0); setPlaying(false); }} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 6, display: "flex", alignItems: "center" }}>
            <IconRew />
          </button>
          <button onClick={() => setPlayhead(p => Math.max(0, p - (10 / TOTAL * 100)))} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 6, display: "flex", alignItems: "center" }}>
            <IconSkipB />
          </button>
          <button
            onClick={() => { if (playhead >= 100) setPlayhead(0); setPlaying(p => !p); }}
            style={{
              width: 38, height: 38, borderRadius: "50%",
              background: `linear-gradient(135deg, ${T.amber}, ${T.orange})`,
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 2px 12px rgba(245,160,0,.35)`,
              flexShrink: 0,
            }}
          >
            {playing ? <IconPause /> : <IconPlay />}
          </button>
          <button onClick={() => setPlayhead(p => Math.min(100, p + (10 / TOTAL * 100)))} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 6, display: "flex", alignItems: "center" }}>
            <IconSkipF />
          </button>
          <button onClick={() => { setPlayhead(100); setPlaying(false); }} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 6, display: "flex", alignItems: "center" }}>
            <IconFwd />
          </button>
        </div>

        {/* Drag hint */}
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted2, textAlign: "right", minWidth: 72 }}>
          Glisser pour<br />sélectionner
        </div>
      </div>
    </div>
  );
};

// ── GeminiEcouteTab (Placeholder - structure from original) ────────────────────────────────────────

const GeminiEcouteTab = ({ config, zone }) => {
  const [activeCategory, setActiveCategory] = useState("balance");
  const isRef = config.mode === "ref";

  const GEMINI_CATEGORIES = [
    { id: "balance", label: "Balance" },
    { id: "frequence", label: "Fréquence" },
    { id: "dynamique", label: "Dynamique" },
    { id: "stereo", label: "Stéréo" },
  ];

  const GEMINI_DATA = {
    ref: {
      verdict: "Mix cohérent et professionnel. Tous les éléments ont de l'espace et sont clairement différenciés.",
      categories: {
        balance: [
          { label: "Niveaux équilibrés", severity: "info", text: "Chaque élément occupe son espace en fréquence." },
          { label: "Voix bien centrée", severity: "info", text: "La voix a la place d'honneur au centre du mix." },
        ],
      },
    },
    perso: {
      verdict: "Mix en cours de développement. Quelques ajustements fréquentiels et de dynamique pourraient améliorer la clarté.",
      categories: {
        balance: [
          { label: "Accumulation mi-graves", severity: "warning", text: "Plusieurs éléments se chevauchent entre 400-800Hz." },
          { label: "Kick manque de punch", severity: "warning", text: "La transient du kick est écrasée par la compression du bus." },
        ],
      },
    },
  };

  const data = GEMINI_DATA[isRef ? "ref" : "perso"];
  const items = data.categories[activeCategory] || [];
  const SEVERITY_STYLE = {
    info: { color: T.green, bg: "rgba(87,204,153,0.08)", label: "OK" },
    warning: { color: T.orange, bg: "rgba(232,93,4,0.08)", label: "⚠ À VÉRIFIER" },
    critical: { color: T.red, bg: "rgba(230,57,70,0.08)", label: "❌ CRITIQUE" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeup .3s ease" }}>
      {/* Header badge */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, boxShadow: `0 0 8px ${T.green}` }} />
          <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.muted }}>ANALYSE QUALITATIVE</div>
        </div>
        <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 0.5 }}>
          {zone.id === "full" ? "Morceau complet" : zone.label}
        </span>
      </div>

      {/* Verdict global */}
      <div style={{
        background: `rgba(87,204,153,0.06)`, border: `1px solid rgba(87,204,153,0.2)`,
        borderLeft: `3px solid ${T.green}`, borderRadius: 10, padding: "14px 18px",
      }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 2, color: T.green, marginBottom: 8 }}>VERDICT GLOBAL</div>
        <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, lineHeight: 1.8 }}>{data.verdict}</div>
      </div>

      {/* Category nav */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {GEMINI_CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setActiveCategory(c.id)} style={{
            fontFamily: T.mono, fontSize: 10, padding: "5px 12px", borderRadius: 20,
            border: `1px solid ${activeCategory === c.id ? T.amber : T.border}`,
            background: activeCategory === c.id ? T.amberGlow : T.s1,
            color: activeCategory === c.id ? T.amber : T.muted,
            cursor: "pointer", transition: "all .15s",
          }}>{c.label}</button>
        ))}
      </div>

      {/* Category items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item, i) => {
          const sev = SEVERITY_STYLE[item.severity] || SEVERITY_STYLE.info;
          return (
            <div key={i} style={{
              background: sev.bg, border: `1px solid ${sev.color}33`,
              borderRadius: 10, padding: "14px 18px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontFamily: T.mono, fontSize: 9, padding: "2px 8px", borderRadius: 4,
                  background: `${sev.color}15`, border: `1px solid ${sev.color}33`,
                  color: sev.color, letterSpacing: 0.5,
                }}>{sev.label}</span>
                <span style={{ fontFamily: T.mono, fontSize: 12, color: T.text }}>{item.label}</span>
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, lineHeight: 1.8 }}>{item.text}</div>
            </div>
          );
        })}
      </div>

      {/* Source note */}
      <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted2, textAlign: "center", paddingTop: 4 }}>
        Analyse qualitative générée par écoute IA — interprétation, pas mesure
      </div>
    </div>
  );
};

// ── Main FicheScreen Component ────────────────────────────────────────

// ── Loading shimmer for tabs not yet ready ───────────────────
const TabLoading = ({ label }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 16 }}>
    <div style={{
      width: 40, height: 40, borderRadius: "50%", border: `2px solid ${T.border}`, borderTopColor: T.amber,
      animation: "spin 1s linear infinite",
    }} />
    <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted }}>{label}</div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── VersionChat : panneau de chat ancré à droite, contextualisé sur la version affichée ────
// Historique conservé par versionKey pendant la session (persistance Supabase : à venir).

const VersionChat = ({ config, analysisResult, collapsed, onToggleCollapse, expandedWidth, railWidth }) => {
  const versionKey = analysisResult?.id || config?.version || analysisResult?.meta?.title || 'current';
  const [messagesByVersion, setMessagesByVersion] = useState(() => new Map());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const messages = messagesByVersion.get(versionKey) || [];
  const setMessages = (next) => {
    setMessagesByVersion(prev => {
      const m = new Map(prev);
      const prevMsgs = m.get(versionKey) || [];
      m.set(versionKey, typeof next === 'function' ? next(prevMsgs) : next);
      return m;
    });
  };

  // Auto-scroll en bas quand un nouveau message arrive
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next,
          daw: config?.daw,
          title: config?.title || analysisResult?.meta?.title,
          artist: analysisResult?.meta?.artist || config?.artist,
          version: config?.version,
          listening: analysisResult?.listening,
          fiche: analysisResult?.fiche,
        }),
      });
      const data = await res.json();
      const reply = data.reply || data.error || "Erreur de connexion.";
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: "Erreur : " + e.message }]);
    }
    setLoading(false);
  };

  const titleLine = config?.title || analysisResult?.meta?.title || "Version actuelle";
  const versionLine = config?.version ? ` — ${config.version}` : "";

  if (collapsed) {
    return (
      <button onClick={onToggleCollapse} title="Ouvrir l'assistant" style={{
        position: "fixed", right: 0, top: 0, bottom: 48, width: railWidth,
        background: T.s1, border: "none", borderLeft: `1px solid ${T.border}`,
        cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: 20, gap: 16, zIndex: 100, color: T.muted,
        transition: "color .15s",
      }}
      onMouseEnter={e => e.currentTarget.style.color = T.amber}
      onMouseLeave={e => e.currentTarget.style.color = T.muted}>
        <IconChat s={18} />
        <span style={{
          writingMode: "vertical-rl", transform: "rotate(180deg)",
          fontFamily: T.mono, fontSize: 11, letterSpacing: 2,
        }}>ASSISTANT</span>
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed", right: 0, top: 0, bottom: 48, width: expandedWidth,
      background: T.s1, borderLeft: `1px solid ${T.border}`,
      display: "flex", flexDirection: "column", zIndex: 100,
    }}>
      {/* Header */}
      <div style={{
        padding: "18px 20px", borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.amberDim }}>ASSISTANT</div>
          <div style={{
            fontFamily: T.mono, fontSize: 13, color: T.text, marginTop: 3,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {titleLine}{versionLine}
          </div>
        </div>
        <button onClick={onToggleCollapse} title="Replier" style={{
          width: 28, height: 28, borderRadius: "50%",
          background: T.s2, border: `1px solid ${T.border}`,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          color: T.muted, flexShrink: 0,
        }}>
          <IconChevronRight s={12} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: "auto", padding: "18px 20px",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        {messages.length === 0 && (
          <div style={{
            fontFamily: T.mono, fontSize: 12, color: T.muted2,
            lineHeight: 1.75, fontStyle: "italic", padding: "8px 0",
          }}>
            Pose n'importe quelle question sur cette analyse — théorique, technique ou pratique. Je réponds en connaissant l'écoute et le diagnostic de la version affichée.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            padding: "10px 14px", borderRadius: 10,
            background: m.role === "user" ? T.amberGlow : T.s2,
            border: `1px solid ${m.role === "user" ? T.amber + "33" : T.border}`,
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "92%",
          }}>
            <div style={{
              fontFamily: T.mono, fontSize: 12, color: m.role === "user" ? T.amber : T.text,
              lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{
            padding: "10px 14px", borderRadius: 10, background: T.s2,
            border: `1px solid ${T.border}`, alignSelf: "flex-start",
          }}>
            <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted }}>
              <span style={{ animation: "blink 1s infinite" }}>▍</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        padding: "14px 16px", borderTop: `1px solid ${T.border}`,
        display: "flex", gap: 10, alignItems: "flex-end",
      }}>
        <textarea
          value={input}
          onChange={e => {
            setInput(e.target.value);
            // auto-grow up to ~6 lines
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
          }}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ta question…"
          disabled={loading}
          rows={1}
          style={{
            flex: 1, background: T.s2, border: `1px solid ${T.border}`,
            borderRadius: 10, padding: "10px 14px",
            fontFamily: T.mono, fontSize: 14, color: T.text, outline: "none",
            transition: "border-color .2s",
            resize: "none", overflow: "auto", lineHeight: 1.4,
            minHeight: 40, maxHeight: 140,
            whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}
          onFocus={e => e.target.style.borderColor = T.amber}
          onBlur={e => e.target.style.borderColor = T.border}
        />
        <button onClick={send} disabled={!input.trim() || loading} style={{
          width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
          background: input.trim() && !loading ? `linear-gradient(135deg, ${T.amber}, ${T.orange})` : T.s2,
          border: `1px solid ${input.trim() && !loading ? T.amber : T.border}`,
          cursor: input.trim() && !loading ? "pointer" : "not-allowed",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .2s",
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 7 L13 7 M8 2 L13 7 L8 12" stroke={input.trim() && !loading ? T.black : T.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
};

const FicheScreen = ({ config, analysisResult }) => {
  const isRef = config?.mode === "ref" || !config?.mode;
  const mockData = isRef ? REF_DATA : PERSO_DATA;
  const isDesktop = useIsDesktop();

  const [tab, setTab] = useState(isDesktop ? "split" : "diagnostic");
  const [openCat, setOpenCat] = useState(null);
  const [zone, setZone] = useState({ id: "full", label: "Morceau complet", start: 0, end: 100, color: T.amber });
  // Liens croisés colonnes <-> plan : on track l'item ou la tâche survolé(e)
  const [hoverItemId, setHoverItemId] = useState(null);
  const [hoverTaskIdx, setHoverTaskIdx] = useState(null);
  // Chat ancré à droite : état d'ouverture persistant au niveau de l'écran
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const CHAT_WIDTH = 380;
  const CHAT_RAIL = 48;

  // Resync tab when layout flips (desktop ↔ mobile): diagnostic/plan ne sont plus
  // des onglets valides sur desktop, et "split" n'existe pas sur mobile.
  useEffect(() => {
    if (isDesktop && (tab === "diagnostic" || tab === "plan")) setTab("split");
    if (!isDesktop && tab === "split") setTab("diagnostic");
  }, [isDesktop]); // eslint-disable-line react-hooks/exhaustive-deps

  // Progressive data: listening arrives first, then fiche
  const fiche = analysisResult?.fiche || null;
  const listening = analysisResult?.listening || null;
  const stage = analysisResult?._stage || "pending";

  // Use real fiche data when available, fallback to mock
  const ficheElements = fiche?.elements || null;
  const fichePlan = fiche?.plan || null;
  const ficheChain = fiche?.chain || null;
  const fichePlugins = fiche?.plugins || null;
  const ficheSummary = fiche?.summary || null;

  // For display, use fiche if available, otherwise mock
  const data = fiche ? { ...mockData, elements: ficheElements || mockData.elements, plan: fichePlan || mockData.plan } : mockData;

  const activeData = data;

  const meta = [
    { label: "DAW", val: config?.daw || "Logic Pro" },
  ];

  const hasRef = !!config?.refFile;
  const accent = isRef ? T.cyan : T.green;

  // Desktop: Diagnostic + Plan d'action sont permanents côte-à-côte dans la
  // vue "Fiche" — on ne les expose plus comme onglets cliquables.
  const tabs = isDesktop
    ? [
        { id: "split", label: "Fiche", ready: !!fiche },
        { id: "ecoute", label: "Écoute", ready: !!listening || stage === "all_done" },
      ]
    : [
        { id: "diagnostic", label: "Diagnostic", ready: !!fiche },
        { id: "plan", label: "Plan d'action", ready: !!fiche },
        { id: "ecoute", label: "Écoute", ready: !!listening || stage === "all_done" },
      ];
  if (hasRef) tabs.push({ id: "comparaison", label: "Comparaison référence", ready: !!fiche });

  const Tab = ({ id, l, ready }) => (
    <button onClick={() => setTab(id)} style={{
      fontFamily: T.mono, fontSize: 13, padding: "13px 22px", background: "transparent", border: "none",
      borderBottom: `2px solid ${tab === id ? T.amber : "transparent"}`,
      color: tab === id ? T.text : T.muted, cursor: "pointer", transition: "all .15s", letterSpacing: 1,
      opacity: ready === false ? 0.5 : 1, display: "flex", alignItems: "center", gap: 6,
    }}>
      {l}
      {ready === false && <span style={{ width: 6, height: 6, borderRadius: "50%", border: `1.5px solid ${T.amber}`, borderTopColor: "transparent", display: "inline-block", animation: "spin 1s linear infinite" }} />}
    </button>
  );

  // ── Panneaux extraits pour pouvoir les rendre soit dans les onglets mobile,
  // soit côte-à-côte dans le split desktop ──
  const diagnosticPanel = !fiche ? (
    <TabLoading label="Génération du diagnostic par l'IA…" />
  ) : (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {ficheSummary && (
        <div style={{ background: T.amberGlow, border: `1px solid ${T.amberLine}`, borderLeft: `3px solid ${T.amber}`, borderRadius: 10, padding: "22px 28px", marginBottom: 16 }}>
          <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: 2, color: T.amber, marginBottom: 12 }}>RÉSUMÉ</div>
          <div style={{ fontFamily: T.mono, fontSize: 15, color: T.textSoft, lineHeight: 1.85 }}>{ficheSummary}</div>
        </div>
      )}
      <div style={{ fontFamily: T.mono, fontSize: 15, color: T.amber, marginBottom: 8, letterSpacing: 0.5 }}>
        Voix, instruments, drums, espace, master — clique pour voir le détail
      </div>
      {(ficheElements || data.elements).map((el, idx) => {
        const catId = el.id || el.cat || idx;
        return (
        <div key={catId} style={{
          background: T.s1,
          border: `1px solid ${openCat === catId ? T.amber : T.border}`,
          borderRadius: 10, overflow: "hidden", transition: "border-color .2s",
        }}>
          <div
            onClick={() => setOpenCat(openCat === catId ? null : catId)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 28px", cursor: "pointer" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: T.mono, fontSize: 15, letterSpacing: 2, color: openCat === catId ? T.amber : T.text }}>{el.cat}</span>
              <span style={{ fontFamily: T.mono, fontSize: 15, color: T.muted }}>{el.items?.length || 0} points</span>
            </div>
            <span style={{
              fontFamily: T.mono, fontSize: 14, color: T.muted, transition: "transform .2s", display: "inline-block",
              transform: openCat === catId ? "rotate(90deg)" : "none"
            }}>›</span>
          </div>
          {openCat === catId && (
            <div style={{ borderTop: `1px solid ${T.border}` }}>
              {el.items.map((it, i) => {
                const plan = fichePlan || data.plan;
                const hoveredTask = hoverTaskIdx != null ? plan?.[hoverTaskIdx] : null;
                const isLinkedToHoveredTask = !!(it.id && hoveredTask && Array.isArray(hoveredTask.linkedItemIds) && hoveredTask.linkedItemIds.includes(it.id));
                const isSelfHover = hoverItemId && it.id === hoverItemId;
                return (
                <div
                  key={it.id || i}
                  onMouseEnter={() => setHoverItemId(it.id || null)}
                  onMouseLeave={() => setHoverItemId(null)}
                  style={{
                    padding: "22px 28px", borderBottom: i < el.items.length - 1 ? `1px solid ${T.border}` : "none",
                    transition: "background .15s, box-shadow .15s",
                    background: isSelfHover ? T.s2 : (isLinkedToHoveredTask ? T.amber + "14" : "transparent"),
                    boxShadow: isLinkedToHoveredTask ? `inset 3px 0 0 ${T.amber}` : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    {it.priority ? <PriorityBadge p={it.priority} /> : null}
                    <span style={{ fontFamily: T.mono, fontSize: 15, color: T.text }}>{it.label}</span>
                  </div>
                  <div style={{ fontFamily: T.mono, fontSize: 15, color: T.textSoft, lineHeight: 1.85 }}>{it.detail}</div>
                  {Array.isArray(it.tools) && it.tools.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                      {it.tools.map(t => (
                        <span key={t} style={{
                          fontFamily: T.mono, fontSize: 11, padding: "4px 10px", borderRadius: 6,
                          background: T.s2, border: `1px solid ${T.border}`, color: T.textSoft,
                          display: "inline-flex", alignItems: "center", gap: 6,
                        }}>
                          <IconPlug c={T.amberDim} s={11} /> {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>
      ); })}
    </div>
  );

  const planPanel = !fiche ? (
    <TabLoading label="Génération du plan d'action…" />
  ) : (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {(fichePlan || data.plan).map((p, i) => {
        const isLinkedToHoveredItem = !!(hoverItemId && Array.isArray(p.linkedItemIds) && p.linkedItemIds.includes(hoverItemId));
        const isSelfHover = hoverTaskIdx === i;
        return (
        <div
          key={i}
          onMouseEnter={() => setHoverTaskIdx(i)}
          onMouseLeave={() => setHoverTaskIdx(null)}
          style={{
            background: isLinkedToHoveredItem ? T.amber + "14" : T.s1,
            border: `1px solid ${isLinkedToHoveredItem || isSelfHover ? T.amber : (p.p === "HIGH" ? T.red + "33" : T.border)}`,
            borderRadius: 10, padding: "24px 28px",
            transition: "background .15s, border-color .15s",
          }}>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <PriorityBadge p={p.p} />
            <span style={{ fontFamily: T.mono, fontSize: 15, color: T.text }}>{p.task}</span>
          </div>
          <div style={{
            fontFamily: T.mono, fontSize: 15, color: T.amber, background: T.s2, border: `1px solid ${T.border}`,
            borderRadius: 6, padding: "14px 18px", borderLeft: `3px solid ${T.amber}`, marginBottom: 14, lineHeight: 1.85
          }}>
            {p.daw}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{
              flex: 1, fontFamily: T.mono, fontSize: 15, color: T.textSoft, background: T.s2, borderRadius: 6, padding: "10px 14px"
            }}>
              <span style={{ color: T.amber, fontWeight: 600 }}>Mesuré : </span>{p.metered || "N/A"}
            </div>
            <div style={{
              flex: 1, fontFamily: T.mono, fontSize: 15, color: T.textSoft, background: T.s2, borderRadius: 6, padding: "10px 14px"
            }}>
              <span style={{ color: T.green, fontWeight: 600 }}>Objectif : </span>{p.target || "N/A"}
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );

  const columnHeading = {
    fontFamily: T.mono, fontSize: 12, letterSpacing: 2, color: T.amber,
    marginBottom: 24, paddingBottom: 18, borderBottom: `1px solid ${T.border}`,
  };

  const chatOffset = isDesktop ? (chatCollapsed ? CHAT_RAIL : CHAT_WIDTH) : 0;

  return (
    <>
      {isDesktop && (
        <VersionChat
          config={config}
          analysisResult={analysisResult}
          collapsed={chatCollapsed}
          onToggleCollapse={() => setChatCollapsed(c => !c)}
          expandedWidth={CHAT_WIDTH}
          railWidth={CHAT_RAIL}
        />
      )}
      <div style={{ marginRight: chatOffset, transition: "margin-right .25s ease" }}>
      <div style={{ maxWidth: isDesktop ? 1380 : 780, margin: "0 auto", padding: isDesktop ? "40px 56px 100px" : "16px 16px 80px", animation: "fadeup .35s ease" }}>

        {/* Top info */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              {config?.version && (
                <span style={{
                  fontFamily: T.mono, fontSize: 12, padding: "3px 11px", borderRadius: 20,
                  background: T.amberGlow, color: T.amber, border: `1px solid ${T.amber}44`, letterSpacing: 1
                }}>
                  {config.version}
                </span>
              )}
              <span style={{ fontFamily: T.mono, fontSize: 12, color: stage === "all_done" ? T.green : T.amber, display: "flex", alignItems: "center", gap: 6 }}>
                {stage === "all_done" ? "✓ Analyse complète" : stage === "fiche_done" ? "◎ Écoute en cours…" : "◎ Rapport IA en cours…"}
              </span>
            </div>
            <h2 style={{ fontFamily: T.display, fontSize: 44, letterSpacing: 3, color: T.text, lineHeight: 1, marginBottom: 16 }}>
              {config?.title || analysisResult?.meta?.title || data.title}
            </h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {meta.map(m => (
                <div key={m.label} style={{
                  fontFamily: T.mono, fontSize: 12, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 12px", display: "flex", gap: 6
                }}>
                  <span style={{ color: T.muted }}>{m.label}</span><span style={{ color: T.amber }}>{m.val}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Score orbs — personal only */}
          {!isRef && data.score && (
            <div style={{ display: "flex", gap: 8 }}>
              {Object.entries(data.score).map(([k, v]) => (
                <div key={k} style={{ textAlign: "center" }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%", border: `2px solid ${v >= 70 ? T.green : v >= 55 ? T.amber : T.red}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.display, fontSize: 20, color: T.text, background: T.s1
                  }}>{v}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 5 }}>{k}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="fiche-tabs" style={{
          display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: 36, overflowX: "auto", alignItems: "center"
        }}>
          {tabs.map(t => <Tab key={t.id} id={t.id} l={t.label} ready={t.ready} />)}
        </div>

        {/* ── DIAGNOSTIC (mobile seulement) ── */}
        {!isDesktop && tab === "diagnostic" && diagnosticPanel}

        {/* ── SPLIT 2 COLONNES (desktop seulement) ── */}
        {isDesktop && tab === "split" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
            <section>
              <div style={columnHeading}>ÉLÉMENTS</div>
              {diagnosticPanel}
            </section>
            <section>
              <div style={{ position: "sticky", top: 24 }}>
                <div style={columnHeading}>PLAN D'ACTION</div>
                {planPanel}
              </div>
            </section>
          </div>
        )}

        {/* ── ÉCOUTE ── */}
        {tab === "ecoute" && !listening && stage !== "all_done" && (
          <TabLoading label="Écoute qualitative en cours…" />
        )}
        {tab === "ecoute" && !listening && stage === "all_done" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 12 }}>
            <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, textAlign: "center", maxWidth: 300, lineHeight: 1.7 }}>
              L'écoute qualitative n'a pas pu être générée pour cette analyse. Relance l'analyse pour réessayer.
            </div>
          </div>
        )}
        {tab === "ecoute" && listening && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18, animation: "fadeup .3s ease" }}>
            {listening.impression && (
              <div style={{ background: `rgba(87,204,153,0.06)`, border: `1px solid rgba(87,204,153,0.2)`, borderLeft: `3px solid ${T.green}`, borderRadius: 10, padding: "22px 28px" }}>
                <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: 2, color: T.green, marginBottom: 12 }}>IMPRESSION GÉNÉRALE</div>
                <div style={{ fontFamily: T.mono, fontSize: 15, color: T.textSoft, lineHeight: 1.85 }}>{listening.impression}</div>
              </div>
            )}
            {listening.espace && (
              <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "22px 28px" }}>
                <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: 2, color: T.amber, marginBottom: 12 }}>ESPACE</div>
                <div style={{ fontFamily: T.mono, fontSize: 15, color: T.textSoft, lineHeight: 1.85 }}>{listening.espace}</div>
              </div>
            )}
            {listening.dynamique && (
              <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "22px 28px" }}>
                <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: 2, color: T.amber, marginBottom: 12 }}>DYNAMIQUE</div>
                <div style={{ fontFamily: T.mono, fontSize: 15, color: T.textSoft, lineHeight: 1.85 }}>{listening.dynamique}</div>
              </div>
            )}
            {listening.couleur && (
              <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "22px 28px" }}>
                <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: 2, color: T.amber, marginBottom: 12 }}>COULEUR SONORE</div>
                <div style={{ fontFamily: T.mono, fontSize: 15, color: T.textSoft, lineHeight: 1.85 }}>{listening.couleur}</div>
              </div>
            )}
            {listening.points_forts && (
              <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "22px 28px" }}>
                <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: 2, color: T.green, marginBottom: 12 }}>POINTS FORTS</div>
                {listening.points_forts.map((p, i) => (
                  <div key={i} style={{ fontFamily: T.mono, fontSize: 15, color: T.textSoft, lineHeight: 1.85, display: "flex", gap: 10 }}>
                    <span style={{ color: T.green }}>▸</span> {p}
                  </div>
                ))}
              </div>
            )}
            {listening.a_travailler && (
              <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "22px 28px" }}>
                <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: 2, color: T.orange, marginBottom: 12 }}>À TRAVAILLER</div>
                {listening.a_travailler.map((p, i) => (
                  <div key={i} style={{ fontFamily: T.mono, fontSize: 15, color: T.textSoft, lineHeight: 1.85, display: "flex", gap: 10 }}>
                    <span style={{ color: T.orange }}>▸</span> {p}
                  </div>
                ))}
              </div>
            )}
            {listening.mood && (
              <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, textAlign: "center", marginTop: 12 }}>
                Mood : {listening.mood}
              </div>
            )}
          </div>
        )}

        {/* ── PLAN D'ACTION (mobile seulement) ── */}
        {!isDesktop && tab === "plan" && planPanel}

        {/* ── COMPARAISON (only if ref) ── */}
        {tab === "comparaison" && hasRef && (
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ fontFamily: T.mono, fontSize: 15, color: T.textSoft, letterSpacing: 0.5 }}>
              Différences et similitudes avec la référence
            </div>

            {/* Metrics table */}
            <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", padding: "14px 22px", borderBottom: `1px solid ${T.border}`,
                fontFamily: T.mono, fontSize: 11, letterSpacing: 1, color: T.muted
              }}>
                <span></span><span>TON MIX</span><span>RÉF</span><span>OBSERVATION</span>
              </div>
              {[
                { label: "BPM", mine: "95", ref: "92", note: "Très proche — même énergie" },
                { label: "LUFS", mine: "-12.1", ref: "-8.2", note: "4 dB d'écart — la ref est plus compressée" },
                { label: "Tonalité", mine: "Ré maj", ref: "La min", note: "Même univers tonal" },
                { label: "Crest Factor", mine: "12 dB", ref: "7 dB", note: "Plus de dynamique dans ton mix" },
              ].map((m, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", padding: "14px 22px",
                  borderBottom: i < 3 ? `1px solid ${T.border}` : "none", alignItems: "center"
                }}>
                  <span style={{ fontFamily: T.mono, fontSize: 15, color: T.muted }}>{m.label}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 15, color: T.amber }}>{m.mine}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 15, color: T.textSoft }}>{m.ref}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 15, color: T.textSoft, lineHeight: 1.6 }}>{m.note}</span>
                </div>
              ))}
            </div>

            {/* Observations */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontFamily: T.mono, fontSize: 12, letterSpacing: 1, color: T.amber, marginBottom: 8 }}>OBSERVATIONS</div>
              {[
                "La référence a plus de densité dans les médiums (800Hz-3kHz), ce qui donne plus de présence vocale.",
                "Ton mix a plus de headroom et de dynamique — c'est un choix, pas un défaut.",
                "Les basses fréquences (40-100Hz) sont similaires en niveau mais la ref utilise plus de saturation harmonique.",
                "La stéréo de la ref est plus large au-dessus de 5kHz (corrélation 0.65 vs 0.85).",
              ].map((o, i) => (
                <div key={i} style={{
                  display: "flex", gap: 14, alignItems: "flex-start", background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "20px 24px"
                }}>
                  <span style={{ fontFamily: T.mono, fontSize: 15, color: T.amber, flexShrink: 0, marginTop: 1 }}>▸</span>
                  <span style={{ fontFamily: T.mono, fontSize: 15, color: T.textSoft, lineHeight: 1.85 }}>{o}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Limites */}
        <div style={{ marginTop: 18, background: "rgba(232,93,4,0.05)", border: `1px solid rgba(232,93,4,0.2)`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px", cursor: "pointer"
          }}>
            <div style={{ fontFamily: T.mono, fontSize: 12, letterSpacing: 2, color: T.orange }}>LIMITES DE CETTE ANALYSE</div>
          </div>
          <div style={{ padding: "0 28px 22px", borderTop: `1px solid rgba(232,93,4,0.15)` }}>
            <div style={{ fontFamily: T.mono, fontSize: 15, color: T.textSoft, lineHeight: 1.85, marginTop: 18 }}>
              Analyse basée sur l'empreinte audio du signal. Les conseils sont des directions, pas des vérités absolues — fais confiance à tes oreilles.
            </div>
          </div>
        </div>

      </div>
      </div>
    </>
  );
};

export default FicheScreen;
