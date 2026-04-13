import { useState, useEffect, useRef } from 'react';
import T from '../constants/theme';
import API from '../constants/api';
import CONF from '../constants/confidence';
import { REF_DATA, PERSO_DATA } from '../db/mockData';

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

// ── ElementDrawer (Modal for deep-dive chat) ────────────────────────────────────────

const ElementDrawer = ({ item, onClose, daw, zOverride }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const systemPrompt = `Tu es l'assistant intégré de Versions, expert en production musicale et mixage avec 20 ans d'expérience.

DAW : ${daw || "Logic Pro"}
Élément analysé : ${item.label} — ${item.detail}

INSTRUCTIONS :
- Réponds avec des paramètres précis (attack, release, fréquence, ratio, valeurs concrètes)
- Pour chaque plugin payant, cite l'alternative gratuite
- Connais tous les plugins standards : FabFilter (Pro-Q, Pro-C, Pro-L, Saturn), Waves (SSL, CLA-76, CLA-2A, API 2500, H-Reverb), Valhalla (Room, VintageVerb, Delay, Supermassive), iZotope (Ozone, Neutron, RX), SoundToys (Decapitator, EchoBoy), UAD (1176, LA-2A, SSL G-Bus), TDR Nova/Kotelnikov (gratuits), Klanghelm IVGI (gratuit)
- Connais les instruments : Serum, Vital (gratuit), Sylenth1, u-he Diva, Arturia V Collection, Kontakt, Omnisphere, Superior Drummer 3, Keyscape, Pianoteq, Spitfire LABS (gratuit)
- Adapte tes réponses au DAW de l'utilisateur avec les chemins précis dans ce DAW
- Réponses courtes, directes, actionnables
- Réponds en français`;

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, item: { label: item.label, detail: item.detail }, daw }),
      });
      const data = await res.json();
      const reply = data.reply || data.error || "Erreur de connexion.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages([...newMessages, { role: "assistant", content: "Erreur : " + e.message }]);
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.65)", zIndex: zOverride || 200,
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(6px)", padding: 24,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.s1, border: `1px solid ${T.border}`, borderRadius: 20,
        width: "100%", maxWidth: 520,
        animation: "fadeup .22s ease", position: "relative",
        display: "flex", flexDirection: "column",
        maxHeight: "80vh", overflow: "hidden",
      }}>
        {/* Scrollable content */}
        <div style={{ overflowY: "auto", padding: "28px 28px 0" }}>

          {/* Close */}
          <button onClick={onClose} style={{
            position: "absolute", top: 16, right: 16,
            width: 30, height: 30, borderRadius: "50%",
            background: T.s2, border: `1px solid ${T.border}`,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <IconClose />
          </button>

          {/* Confidence badge */}
          {item.conf && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontFamily: T.mono, fontSize: 9, padding: "3px 10px", borderRadius: 4,
              background: `${CONF[item.conf].color}12`, border: `1px solid ${CONF[item.conf].color}33`,
              color: CONF[item.conf].color, letterSpacing: 0.5, marginBottom: 14,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: CONF[item.conf].color }} />
              {CONF[item.conf].label} — {CONF[item.conf].desc}
            </div>
          )}

          {/* Title + detail */}
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 2, color: T.amberDim, marginBottom: 5 }}>DÉTAIL</div>
          <div style={{ fontFamily: T.display, fontSize: 20, letterSpacing: 2, color: T.text, marginBottom: 12, lineHeight: 1.2 }}>{item.label}</div>
          <p style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, lineHeight: 1.8, marginBottom: 16 }}>{item.detail}</p>

          {/* Tools */}
          {item.tools?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 2, color: T.amberDim, marginBottom: 8 }}>APPROCHES COMPATIBLES</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {item.tools.map(t => (
                  <span key={t} style={{
                    fontFamily: T.mono, fontSize: 11, padding: "5px 11px", borderRadius: 6,
                    background: T.s2, border: `1px solid ${T.border}`, color: T.text,
                    display: "flex", alignItems: "center", gap: 6
                  }}>
                    <IconPlug c={T.amberDim} s={12} /> {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: T.border, marginBottom: 20 }} />

          {/* Assistant */}
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 2, color: T.amber, marginBottom: 14 }}>
            ASSISTANT — {daw || "Logic Pro"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {messages.length === 0 && (
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted2, lineHeight: 1.7, fontStyle: "italic" }}>
                Pose ta question sur cet élément.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                padding: "10px 14px", borderRadius: 10,
                background: m.role === "user" ? T.amberGlow : T.s2,
                border: `1px solid ${m.role === "user" ? T.amber + "33" : T.border}`,
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "90%",
              }}>
                <div style={{
                  fontFamily: T.mono, fontSize: 11, color: m.role === "user" ? T.amber : T.text,
                  lineHeight: 1.7, whiteSpace: "pre-wrap"
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ padding: "10px 14px", borderRadius: 10, background: T.s2, border: `1px solid ${T.border}`, alignSelf: "flex-start" }}>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>
                  <span style={{ animation: "blink 1s infinite" }}>▍</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input bar */}
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "center" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ta question…"
            style={{
              flex: 1, background: T.s2, border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "10px 14px",
              fontFamily: T.mono, fontSize: 16, color: T.text,
              outline: "none", transition: "border-color .2s",
            }}
            onFocus={e => e.target.style.borderColor = T.amber}
            onBlur={e => e.target.style.borderColor = T.border}
          />
          <button onClick={send} disabled={!input.trim() || loading} style={{
            width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
            background: input.trim() && !loading ? `linear-gradient(135deg, ${T.amber}, ${T.orange})` : T.s2,
            border: `1px solid ${input.trim() && !loading ? T.amber : T.border}`,
            cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all .2s",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7 L13 7 M8 2 L13 7 L8 12" stroke={input.trim() && !loading ? T.black : T.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
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

const FicheScreen = ({ config, analysisResult }) => {
  const isRef = config?.mode === "ref" || !config?.mode;
  const mockData = isRef ? REF_DATA : PERSO_DATA;

  const [tab, setTab] = useState("diagnostic");
  const [openCat, setOpenCat] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [zone, setZone] = useState({ id: "full", label: "Morceau complet", start: 0, end: 100, color: T.amber });

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

  const tabs = [
    { id: "diagnostic", label: "Diagnostic", ready: !!fiche },
    { id: "plan", label: "Plan d'action", ready: !!fiche },
    { id: "ecoute", label: "Écoute", ready: !!listening || stage === "all_done" },
  ];
  if (hasRef) tabs.push({ id: "comparaison", label: "Comparaison référence", ready: !!fiche });

  const Tab = ({ id, l, ready }) => (
    <button onClick={() => setTab(id)} style={{
      fontFamily: T.mono, fontSize: 11, padding: "9px 16px", background: "transparent", border: "none",
      borderBottom: `2px solid ${tab === id ? T.amber : "transparent"}`,
      color: tab === id ? T.text : T.muted, cursor: "pointer", transition: "all .15s", letterSpacing: 1,
      opacity: ready === false ? 0.5 : 1, display: "flex", alignItems: "center", gap: 6,
    }}>
      {l}
      {ready === false && <span style={{ width: 6, height: 6, borderRadius: "50%", border: `1.5px solid ${T.amber}`, borderTopColor: "transparent", display: "inline-block", animation: "spin 1s linear infinite" }} />}
    </button>
  );

  return (
    <>
      <ElementDrawer item={drawer} onClose={() => setDrawer(null)} daw={config?.daw} />

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "16px 16px 80px", animation: "fadeup .35s ease" }}>

        {/* Waveform */}
        <div style={{ marginBottom: 16 }}>
          <WaveformZone zone={zone} onZoneChange={setZone} />
        </div>

        {/* Top info */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              {config?.version && (
                <span style={{
                  fontFamily: T.mono, fontSize: 10, padding: "2px 9px", borderRadius: 20,
                  background: T.amberGlow, color: T.amber, border: `1px solid ${T.amber}44`, letterSpacing: 1
                }}>
                  {config.version}
                </span>
              )}
              <span style={{ fontFamily: T.mono, fontSize: 10, color: stage === "all_done" ? T.green : T.amber, display: "flex", alignItems: "center", gap: 5 }}>
                {stage === "all_done" ? "✓ Analyse complète" : stage === "fiche_done" ? "◎ Écoute en cours…" : "◎ Rapport IA en cours…"}
              </span>
            </div>
            <h2 style={{ fontFamily: T.display, fontSize: 26, letterSpacing: 3, color: T.text, lineHeight: 1, marginBottom: 8 }}>
              {config?.title || analysisResult?.meta?.title || data.title}
            </h2>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {meta.map(m => (
                <div key={m.label} style={{
                  fontFamily: T.mono, fontSize: 10, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "3px 9px", display: "flex", gap: 5
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
                    width: 44, height: 44, borderRadius: "50%", border: `2px solid ${v >= 70 ? T.green : v >= 55 ? T.amber : T.red}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.display, fontSize: 15, color: T.text, background: T.s1
                  }}>{v}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginTop: 3 }}>{k}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="fiche-tabs" style={{
          display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: 24, overflowX: "auto", alignItems: "center"
        }}>
          {tabs.map(t => <Tab key={t.id} id={t.id} l={t.label} ready={t.ready} />)}
        </div>

        {/* ── DIAGNOSTIC ── */}
        {tab === "diagnostic" && !fiche && (
          <TabLoading label="Génération du diagnostic par l'IA…" />
        )}
        {tab === "diagnostic" && fiche && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ficheSummary && (
              <div style={{ background: `rgba(245,160,0,0.06)`, border: `1px solid rgba(245,160,0,0.2)`, borderLeft: `3px solid ${T.amber}`, borderRadius: 10, padding: "14px 18px", marginBottom: 8 }}>
                <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 2, color: T.amber, marginBottom: 8 }}>RÉSUMÉ</div>
                <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, lineHeight: 1.8 }}>{ficheSummary}</div>
              </div>
            )}
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.amberDim, marginBottom: 2, letterSpacing: 0.5 }}>
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
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: 2, color: openCat === catId ? T.amber : T.muted }}>{el.cat}</span>
                    <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted2 }}>{el.items?.length || 0} points</span>
                  </div>
                  <span style={{
                    fontFamily: T.mono, fontSize: 14, color: T.muted, transition: "transform .2s", display: "inline-block",
                    transform: openCat === catId ? "rotate(90deg)" : "none"
                  }}>›</span>
                </div>
                {openCat === catId && (
                  <div style={{ borderTop: `1px solid ${T.border}` }}>
                    {el.items.map((it, i) => (
                      <div
                        key={i}
                        onClick={() => setDrawer(it)}
                        style={{
                          padding: "14px 20px", borderBottom: i < el.items.length - 1 ? `1px solid ${T.border}` : "none",
                          cursor: "pointer", transition: "background .15s", background: "transparent",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = T.s2}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          {it.priority ? <PriorityBadge p={it.priority} /> : null}
                          <span style={{ fontFamily: T.mono, fontSize: 12, color: T.text }}>{it.label}</span>
                        </div>
                        <div style={{ fontFamily: T.body, fontWeight: 300, fontSize: 11, color: T.muted, lineHeight: 1.7 }}>{it.detail}</div>
                        {it.conf && (
                          <span style={{
                            fontFamily: T.mono, fontSize: 9, padding: "1px 7px", borderRadius: 3,
                            background: `${CONF[it.conf].color}15`,
                            border: `1px solid ${CONF[it.conf].color}44`,
                            color: CONF[it.conf].color,
                            letterSpacing: 0.5, marginRight: 8, display: "inline-block", marginTop: 8,
                          }}>{CONF[it.conf].label}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ); })}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeup .3s ease" }}>
            {listening.impression && (
              <div style={{ background: `rgba(87,204,153,0.06)`, border: `1px solid rgba(87,204,153,0.2)`, borderLeft: `3px solid ${T.green}`, borderRadius: 10, padding: "14px 18px" }}>
                <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 2, color: T.green, marginBottom: 8 }}>IMPRESSION GÉNÉRALE</div>
                <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, lineHeight: 1.8 }}>{listening.impression}</div>
              </div>
            )}
            {listening.espace && (
              <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 18px" }}>
                <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 2, color: T.amber, marginBottom: 8 }}>ESPACE</div>
                <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, lineHeight: 1.8 }}>{listening.espace}</div>
              </div>
            )}
            {listening.dynamique && (
              <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 18px" }}>
                <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 2, color: T.amber, marginBottom: 8 }}>DYNAMIQUE</div>
                <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, lineHeight: 1.8 }}>{listening.dynamique}</div>
              </div>
            )}
            {listening.couleur && (
              <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 18px" }}>
                <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 2, color: T.amber, marginBottom: 8 }}>COULEUR SONORE</div>
                <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, lineHeight: 1.8 }}>{listening.couleur}</div>
              </div>
            )}
            {listening.points_forts && (
              <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 18px" }}>
                <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 2, color: T.green, marginBottom: 8 }}>POINTS FORTS</div>
                {listening.points_forts.map((p, i) => (
                  <div key={i} style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, lineHeight: 1.8, display: "flex", gap: 8 }}>
                    <span style={{ color: T.green }}>▸</span> {p}
                  </div>
                ))}
              </div>
            )}
            {listening.a_travailler && (
              <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 18px" }}>
                <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 2, color: T.orange, marginBottom: 8 }}>À TRAVAILLER</div>
                {listening.a_travailler.map((p, i) => (
                  <div key={i} style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, lineHeight: 1.8, display: "flex", gap: 8 }}>
                    <span style={{ color: T.orange }}>▸</span> {p}
                  </div>
                ))}
              </div>
            )}
            {listening.mood && (
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted2, textAlign: "center", marginTop: 8 }}>
                Mood : {listening.mood}
              </div>
            )}
          </div>
        )}

        {/* ── PLAN D'ACTION ── */}
        {tab === "plan" && !fiche && (
          <TabLoading label="Génération du plan d'action…" />
        )}
        {tab === "plan" && fiche && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(fichePlan || data.plan).map((p, i) => (
              <div key={i} style={{
                background: T.s1, border: `1px solid ${p.p === "HIGH" ? T.red + "33" : T.border}`, borderRadius: 10, padding: "16px 18px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <PriorityBadge p={p.p} />
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: T.text }}>{p.task}</span>
                </div>
                <div style={{
                  fontFamily: T.mono, fontSize: 10, color: T.amber, background: T.s2, border: `1px solid ${T.border}`,
                  borderRadius: 6, padding: "8px 12px", borderLeft: `3px solid ${T.amber}`, marginBottom: 10, lineHeight: 1.5
                }}>
                  {p.daw}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{
                    flex: 1, fontFamily: T.mono, fontSize: 10, color: T.muted, background: T.s2, borderRadius: 6, padding: "6px 10px"
                  }}>
                    <span style={{ color: T.amber, fontWeight: 600 }}>Mesuré : </span>{p.metered || "N/A"}
                  </div>
                  <div style={{
                    flex: 1, fontFamily: T.mono, fontSize: 10, color: T.muted, background: T.s2, borderRadius: 6, padding: "6px 10px"
                  }}>
                    <span style={{ color: T.green, fontWeight: 600 }}>Objectif : </span>{p.target || "N/A"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── COMPARAISON (only if ref) ── */}
        {tab === "comparaison" && hasRef && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: 0.5 }}>
              Différences et similitudes avec la référence
            </div>

            {/* Metrics table */}
            <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", padding: "10px 16px", borderBottom: `1px solid ${T.border}`,
                fontFamily: T.mono, fontSize: 9, letterSpacing: 1, color: T.muted
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
                  display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", padding: "10px 16px",
                  borderBottom: i < 3 ? `1px solid ${T.border}` : "none", alignItems: "center"
                }}>
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>{m.label}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.amber }}>{m.mine}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>{m.ref}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, lineHeight: 1.4 }}>{m.note}</span>
                </div>
              ))}
            </div>

            {/* Observations */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 1, color: T.amber, marginBottom: 4 }}>OBSERVATIONS</div>
              {[
                "La référence a plus de densité dans les médiums (800Hz-3kHz), ce qui donne plus de présence vocale.",
                "Ton mix a plus de headroom et de dynamique — c'est un choix, pas un défaut.",
                "Les basses fréquences (40-100Hz) sont similaires en niveau mais la ref utilise plus de saturation harmonique.",
                "La stéréo de la ref est plus large au-dessus de 5kHz (corrélation 0.65 vs 0.85).",
              ].map((o, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12, alignItems: "flex-start", background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px"
                }}>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.amber, flexShrink: 0, marginTop: 1 }}>▸</span>
                  <span style={{ fontFamily: T.body, fontWeight: 300, fontSize: 12, color: T.muted, lineHeight: 1.6 }}>{o}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confidence legend */}
        <div style={{ marginTop: 32, background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.muted, marginBottom: 12 }}>NIVEAUX DE CONFIANCE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.values(CONF).map(c => (
              <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontFamily: T.mono, fontSize: 9, padding: "2px 8px", borderRadius: 3,
                  background: `${c.color}15`, border: `1px solid ${c.color}44`, color: c.color, minWidth: 80, textAlign: "center"
                }}>{c.label}</span>
                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>{c.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Limites */}
        <div style={{ marginTop: 12, background: "rgba(232,93,4,0.05)", border: `1px solid rgba(232,93,4,0.2)`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", cursor: "pointer"
          }}>
            <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.orange }}>LIMITES DE CETTE ANALYSE</div>
          </div>
          <div style={{ padding: "0 20px 16px", borderTop: `1px solid rgba(232,93,4,0.15)` }}>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, lineHeight: 1.85, marginTop: 12 }}>
              Analyse basée sur l'empreinte audio du signal. Les conseils sont des directions, pas des vérités absolues — fais confiance à tes oreilles.
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default FicheScreen;
