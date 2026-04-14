import { useState, useEffect, useRef } from 'react';
import T from '../constants/theme';
import API from '../constants/api';
import { REF_DATA, PERSO_DATA } from '../db/mockData';
import useIsDesktop from '../hooks/useIsDesktop';
import { loadTracks } from '../lib/storage';

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

// Anneau coloré pour score /10 (petit, à côté du label d'item) ou /100 (gros, dans le header)
const ScoreRing = ({ value, max = 10, size = 28, strokeWidth = 2.5, showLabel = true }) => {
  if (value == null || typeof value !== "number" || Number.isNaN(value)) return null;
  const normalized = max === 100 ? value / 100 : value / 10;
  // Seuils : rouge < 0.5, amber 0.5-0.75, vert > 0.75
  const color = normalized < 0.5 ? T.red : normalized <= 0.75 ? T.amber : (T.green || "#4ade80");
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - normalized);
  // Chiffre lisible mais discret, homogène avec la typo mono du reste de l'app
  const fontSize = size <= 34 ? Math.round(size * 0.44) : Math.round(size * 0.34);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={`${color}2a`} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
      </svg>
      {showLabel && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: T.mono, fontSize, color: T.muted, fontWeight: 500, letterSpacing: 0.5, lineHeight: 1,
        }}>
          {Math.round(value)}
        </div>
      )}
    </div>
  );
};

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

// ── Titre avec une lettre en italique ambre ──────────────────
// Pour rester déterministe : on italicise le caractère alphabétique le plus proche du centre.
const TrackTitle = ({ title }) => {
  if (!title) return null;
  const s = String(title);
  let idx = Math.floor(s.length / 2);
  // trouve le caractère alpha le plus proche du centre (évite espaces / ponctuation)
  if (!/[A-Za-zÀ-ÿ]/.test(s[idx])) {
    for (let d = 1; d < s.length; d++) {
      const a = idx - d, b = idx + d;
      if (a >= 0 && /[A-Za-zÀ-ÿ]/.test(s[a])) { idx = a; break; }
      if (b < s.length && /[A-Za-zÀ-ÿ]/.test(s[b])) { idx = b; break; }
    }
  }
  return (
    <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, letterSpacing: 0.5, lineHeight: 1, color: T.text }}>
      {s.slice(0, idx)}
      <span style={{ fontStyle: "italic", color: T.amber }}>{s[idx]}</span>
      {s.slice(idx + 1)}
    </span>
  );
};

// ── Timeline versions (sticky haut de fiche) ─────────────────
const VersionsTimeline = ({ track, currentVersionName, stage, onSelectVersion, onAddVersion }) => {
  if (!track) return null;
  const versions = track.versions || [];
  const currentIdx = versions.findIndex((v) => v.name === currentVersionName);
  const current = currentIdx >= 0 ? versions[currentIdx] : versions[versions.length - 1] || null;
  const currentVIdx = currentIdx >= 0 ? currentIdx : versions.length - 1;
  const greenColor = T.green || "#4ade80";
  return (
    <div
      style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(12,12,13,0.92)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: `1px solid ${T.border}`,
        padding: "16px 40px 14px",
        display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap",
        marginBottom: 24,
      }}
    >
      {/* Titre + sous-titre version */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, minWidth: 0 }}>
        <TrackTitle title={track.title} />
        {current && (
          <span style={{
            fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.muted,
            textTransform: "uppercase", paddingLeft: 12, borderLeft: `1px solid ${T.border}`,
            alignSelf: "center", lineHeight: 1.3,
          }}>
            <span style={{ display: "block", fontSize: 9, color: T.muted, letterSpacing: 1.5 }}>
              {stage === "all_done" ? "Version actuelle" : stage === "fiche_done" ? "Écoute en cours" : "Analyse en cours"}
            </span>
            <b style={{ color: T.amber, fontWeight: 500 }}>V{currentVIdx + 1}</b>
            <span style={{ color: T.muted, margin: "0 6px" }}>·</span>
            <b style={{ color: T.text, fontWeight: 500, textTransform: "uppercase" }}>{current.name}</b>
          </span>
        )}
      </div>

      {/* Bloc versions : label + chips + bouton + */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        marginLeft: "auto",
        padding: "6px 10px 6px 14px",
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        background: "rgba(255,255,255,0.02)",
        flexWrap: "wrap",
      }}>
        <span style={{
          fontFamily: T.mono, fontSize: 9, letterSpacing: 2,
          color: T.muted, textTransform: "uppercase",
          paddingRight: 4, borderRight: `1px solid ${T.border}`, marginRight: 2,
        }}>Versions</span>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {versions.map((v, vIdx) => {
            const score = v.analysisResult?.fiche?.globalScore;
            const prevScore = vIdx > 0 ? versions[vIdx - 1]?.analysisResult?.fiche?.globalScore : null;
            const delta = (typeof score === "number" && typeof prevScore === "number") ? score - prevScore : null;
            const isActive = v.name === currentVersionName;
            const deltaColor = delta == null ? T.muted : delta > 0 ? greenColor : delta < 0 ? T.red : T.muted;
            const hasAnalysis = !!v.analysisResult;
            return (
              <span key={v.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {vIdx > 0 && delta != null && (
                  <span style={{
                    fontFamily: T.mono, fontSize: 10,
                    padding: "3px 7px", borderRadius: 4,
                    background: `${deltaColor}18`, color: deltaColor,
                    fontWeight: 500, letterSpacing: 0.5,
                  }}>
                    {delta > 0 ? "↑" : delta < 0 ? "↓" : "="}{Math.abs(delta)}
                  </span>
                )}
                <button
                  onClick={() => hasAnalysis && onSelectVersion && onSelectVersion(track, v)}
                  disabled={!hasAnalysis}
                  title={hasAnalysis ? `Voir l'analyse ${v.name}` : "Analyse non disponible"}
                  style={{
                    position: "relative",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    padding: "8px 14px",
                    borderRadius: 10,
                    cursor: hasAnalysis ? "pointer" : "default",
                    minWidth: 66,
                    transition: "background .15s, border-color .15s, transform .1s",
                    border: `1px solid ${isActive ? "#f5b05666" : "transparent"}`,
                    background: isActive ? T.amberGlow : "transparent",
                    boxShadow: isActive ? "0 0 0 1px #f5b05633, 0 4px 14px rgba(245,176,86,0.08)" : "none",
                    opacity: hasAnalysis ? 1 : 0.5,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive && hasAnalysis) {
                      e.currentTarget.style.background = T.s1;
                      e.currentTarget.style.borderColor = T.border;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                    }
                  }}
                >
                  {isActive && (
                    <span style={{
                      position: "absolute", top: -7, left: "50%", transform: "translateX(-50%)",
                      fontFamily: T.mono, fontSize: 7, letterSpacing: 1.5,
                      background: T.amber, color: "#000",
                      padding: "2px 6px", borderRadius: 3, whiteSpace: "nowrap",
                    }}>EN COURS</span>
                  )}
                  <span style={{
                    fontFamily: T.mono, fontSize: 11,
                    color: isActive ? T.amber : T.muted,
                    letterSpacing: 1, fontWeight: 500,
                  }}>{v.name}</span>
                  <span style={{
                    fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20,
                    color: isActive ? T.amber : T.text,
                    marginTop: 2, lineHeight: 1,
                  }}>
                    {typeof score === "number" ? Math.round(score) : "—"}
                    {typeof score === "number" && (
                      <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginLeft: 2, fontWeight: 400 }}>%</span>
                    )}
                  </span>
                </button>
              </span>
            );
          })}
          {onAddVersion && (
            <button
              onClick={() => onAddVersion(track)}
              title="Nouvelle version"
              style={{
                marginLeft: 6,
                width: 34, height: 34, borderRadius: "50%",
                border: `1px dashed #f5b05666`, color: T.amber,
                background: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 18, lineHeight: 1,
                transition: "all .15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = T.amberGlow; e.currentTarget.style.borderStyle = "solid"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderStyle = "dashed"; }}
            >+</button>
          )}
        </div>
      </div>
    </div>
  );
};

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

const VersionChat = ({ config, analysisResult, collapsed, onToggleCollapse, expandedWidth }) => {
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

  // Bulle flottante toujours présente (étape 4)
  const bubble = (
    <button
      onClick={onToggleCollapse}
      title={collapsed ? "Ouvrir l'assistant" : "Fermer l'assistant"}
      style={{
        position: "fixed", right: 24, bottom: 96, zIndex: 101,
        width: 56, height: 56, borderRadius: "50%",
        background: `linear-gradient(135deg, ${T.amber}, ${T.orange})`,
        border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 8px 24px rgba(245,176,86,0.35), 0 2px 8px rgba(0,0,0,0.3)",
        transition: "transform .2s, box-shadow .2s",
        color: "#000",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.06)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {collapsed ? <IconChat c="#000" s={22} /> : <IconClose />}
    </button>
  );

  return (
    <>
      {bubble}
      {/* Backdrop */}
      <div
        onClick={onToggleCollapse}
        style={{
          position: "fixed", inset: 0, zIndex: 99,
          background: "rgba(0,0,0,0.45)",
          opacity: collapsed ? 0 : 1,
          pointerEvents: collapsed ? "none" : "auto",
          transition: "opacity .25s ease",
        }}
      />
      {/* Panneau glissant */}
      <div style={{
        position: "fixed", right: 0, top: 0, bottom: 0, width: expandedWidth,
        background: T.s1, borderLeft: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column", zIndex: 100,
        transform: collapsed ? `translateX(${expandedWidth + 40}px)` : "translateX(0)",
        transition: "transform .28s cubic-bezier(0.22, 0.61, 0.36, 1)",
        boxShadow: collapsed ? "none" : "-12px 0 40px rgba(0,0,0,0.45)",
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
    </>
  );
};

// ── FocusOverlay : un ajustement en plein écran, avec nav prev/next et ESC ────
const FocusOverlay = ({ plan, idx, onClose, onPrev, onNext, onToggleResolved, isResolved, elements }) => {
  const p = plan?.[idx];
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft" && idx > 0) onPrev();
      if (e.key === "ArrowRight" && idx < (plan?.length || 0) - 1) onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, plan, onPrev, onNext]);

  if (!p) return null;
  const prio = (p.p || "").toUpperCase();
  const prioColors = { HIGH: T.red, MED: T.amber, LOW: T.muted };
  const prioColor = prioColors[prio] || T.muted;
  // Items liés (pour contextualiser)
  const linkedItems = [];
  if (Array.isArray(p.linkedItemIds) && Array.isArray(elements)) {
    for (const el of elements) {
      for (const it of (el.items || [])) {
        if (it.id && p.linkedItemIds.includes(it.id)) {
          linkedItems.push({ cat: el.cat, ...it });
        }
      }
    }
  }
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(8,8,10,0.94)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        display: "flex", flexDirection: "column",
        animation: "fadeup .25s ease",
      }}
    >
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: `1px solid ${T.border}` }}>
        <button onClick={onClose} style={{
          fontFamily: T.mono, fontSize: 11, letterSpacing: 2, color: T.muted,
          background: "transparent", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, textTransform: "uppercase",
        }}>← Retour</button>
        <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.muted }}>
          {idx + 1} / {plan.length} · ajustement
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onPrev} disabled={idx <= 0} style={{
            fontFamily: T.mono, fontSize: 11, padding: "6px 12px", borderRadius: 8,
            background: "transparent", border: `1px solid ${T.border}`,
            color: idx <= 0 ? T.muted2 : T.muted, cursor: idx <= 0 ? "not-allowed" : "pointer",
          }}>← Préc.</button>
          <button onClick={onNext} disabled={idx >= plan.length - 1} style={{
            fontFamily: T.mono, fontSize: 11, padding: "6px 12px", borderRadius: 8,
            background: "transparent", border: `1px solid ${T.border}`,
            color: idx >= plan.length - 1 ? T.muted2 : T.muted, cursor: idx >= plan.length - 1 ? "not-allowed" : "pointer",
          }}>Suiv. →</button>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, overflowY: "auto", padding: "60px 32px 80px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{
              fontFamily: T.mono, fontSize: 10, letterSpacing: 1.5,
              padding: "4px 9px", borderRadius: 4,
              background: `${prioColor}22`, color: prioColor,
            }}>{prio}</span>
            <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.muted, textTransform: "uppercase" }}>
              {isResolved ? "Résolu" : "À traiter"}
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 44, fontWeight: 400, lineHeight: 1.2, letterSpacing: 0.3,
            margin: 0, color: T.text,
          }}>{p.task}</h1>

          {p.daw && (
            <div style={{
              fontFamily: T.mono, fontSize: 14, color: T.amber,
              background: T.s1, border: `1px solid ${T.amberLine || T.border}`,
              borderLeft: `3px solid ${T.amber}`,
              borderRadius: 8, padding: "18px 22px", lineHeight: 1.85,
              whiteSpace: "pre-wrap",
            }}>
              {p.daw}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {p.metered && (
              <div style={{
                flex: 1, minWidth: 220,
                fontFamily: T.mono, fontSize: 13, color: T.textSoft,
                background: T.s1, borderRadius: 8, padding: "14px 18px",
                border: `1px solid ${T.border}`,
              }}>
                <div style={{ fontSize: 10, letterSpacing: 1.5, color: T.muted, marginBottom: 4, textTransform: "uppercase" }}>Mesuré</div>
                {p.metered}
              </div>
            )}
            {p.target && (
              <div style={{
                flex: 1, minWidth: 220,
                fontFamily: T.mono, fontSize: 13, color: T.textSoft,
                background: T.s1, borderRadius: 8, padding: "14px 18px",
                border: `1px solid ${T.border}`,
              }}>
                <div style={{ fontSize: 10, letterSpacing: 1.5, color: (T.green || "#4ade80"), marginBottom: 4, textTransform: "uppercase" }}>Objectif</div>
                {p.target}
              </div>
            )}
          </div>

          {linkedItems.length > 0 && (
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.muted, textTransform: "uppercase", marginBottom: 12 }}>
                Éléments concernés
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {linkedItems.map((it) => (
                  <div key={it.id} style={{
                    background: T.s1, border: `1px solid ${T.border}`, borderRadius: 8,
                    padding: "14px 18px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 1.5, color: T.muted, textTransform: "uppercase" }}>{it.cat}</span>
                      <span style={{ fontFamily: T.mono, fontSize: 14, color: T.text }}>{it.label}</span>
                    </div>
                    {it.detail && (
                      <div style={{ fontFamily: T.mono, fontSize: 13, color: T.textSoft, lineHeight: 1.75 }}>{it.detail}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center", paddingTop: 16 }}>
            <button onClick={onToggleResolved} style={{
              fontFamily: T.mono, fontSize: 11, letterSpacing: 1.5,
              padding: "10px 18px", borderRadius: 8,
              background: isResolved ? T.s2 : (T.green || "#4ade80"),
              color: isResolved ? T.muted : "#000",
              border: `1px solid ${isResolved ? T.border : (T.green || "#4ade80")}`,
              cursor: "pointer", textTransform: "uppercase",
            }}>
              {isResolved ? "Rouvrir" : "✓ Marquer comme résolu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FicheScreen = ({ config, analysisResult, onSelectVersion, onAddVersion }) => {
  const isRef = config?.mode === "ref" || !config?.mode;
  const mockData = isRef ? REF_DATA : PERSO_DATA;
  const isDesktop = useIsDesktop();

  // ── Chargement des tracks pour la timeline versions ──
  const [tracks, setTracks] = useState([]);
  useEffect(() => {
    let alive = true;
    loadTracks().then((t) => { if (alive) setTracks(t || []); });
    return () => { alive = false; };
  }, [config?.title, config?.version, analysisResult?.id]);
  const currentTrack = tracks.find((t) => t.title === config?.title) || null;

  const [openCat, setOpenCat] = useState(null);
  const [zone, setZone] = useState({ id: "full", label: "Morceau complet", start: 0, end: 100, color: T.amber });
  // Liens croisés colonnes <-> plan : on track l'item ou la tâche survolé(e)
  const [hoverItemId, setHoverItemId] = useState(null);
  const [hoverTaskIdx, setHoverTaskIdx] = useState(null);
  // Chat en panneau glissant overlay : fermé par défaut (étape 4)
  const [chatCollapsed, setChatCollapsed] = useState(true);
  const CHAT_WIDTH = 420;
  // FocusOverlay : index de l'ajustement en focus plein écran (null = fermé)
  const [focusIdx, setFocusIdx] = useState(null);
  // Sections Écoute / Comparaison en bas — accordéons
  const [openExtra, setOpenExtra] = useState(null);

  // Tâches du plan marquées comme "résolu" — persisté en localStorage par version
  const resolvedStorageKey = `resolved::${config?.title || ""}::${config?.version || ""}`;
  const [resolvedTasks, setResolvedTasks] = useState(() => {
    try {
      const raw = localStorage.getItem(resolvedStorageKey);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });
  // Recharge si on change de version
  useEffect(() => {
    try {
      const raw = localStorage.getItem(resolvedStorageKey);
      setResolvedTasks(raw ? new Set(JSON.parse(raw)) : new Set());
    } catch { setResolvedTasks(new Set()); }
  }, [resolvedStorageKey]);
  const toggleResolved = (taskKey) => {
    setResolvedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskKey)) next.delete(taskKey); else next.add(taskKey);
      try { localStorage.setItem(resolvedStorageKey, JSON.stringify([...next])); } catch {}
      return next;
    });
  };


  // ESC ferme FocusOverlay / ChatPanel
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (focusIdx !== null) { setFocusIdx(null); return; }
      if (!chatCollapsed) setChatCollapsed(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusIdx, chatCollapsed]);

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
  const data = fiche
    ? { ...mockData, elements: ficheElements || mockData.elements, plan: fichePlan || mockData.plan, globalScore: typeof fiche.globalScore === "number" ? fiche.globalScore : null }
    : mockData;

  const activeData = data;

  const meta = [
    { label: "DAW", val: config?.daw || "Logic Pro" },
  ];

  const hasRef = !!config?.refFile;
  const accent = isRef ? T.cyan : T.green;

  // Étape 2 : plus d'onglets — page unique scroll.
  // Les panels sont définis ci-dessous et assemblés dans le return.
  const diagnosticPanel = !fiche ? (
    <TabLoading label="Génération du diagnostic par l'IA…" />
  ) : (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {(ficheElements || data.elements).map((el, idx) => {
        const catId = el.id || el.cat || idx;
        const scores = (el.items || []).map(it => it.score).filter(s => typeof s === "number");
        const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : null;
        const count = el.items?.length || 0;
        return (
        <div key={catId} style={{
          background: T.s1,
          border: `1px solid ${openCat === catId ? T.amber : T.border}`,
          borderRadius: 10, overflow: "hidden", transition: "border-color .2s",
        }}>
          <div
            onClick={() => setOpenCat(openCat === catId ? null : catId)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", cursor: "pointer" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                fontFamily: T.mono, fontSize: 12, transition: "transform .2s", display: "inline-block",
                color: T.muted, transform: openCat === catId ? "rotate(90deg)" : "none"
              }}>›</span>
              <span style={{ fontFamily: T.mono, fontSize: 12, letterSpacing: 2.5, color: openCat === catId ? T.amber : T.text, textTransform: "uppercase" }}>{el.cat}</span>
            </div>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: 0.5 }}>
              {count} élément{count > 1 ? "s" : ""}{avg != null ? ` · moy. ${avg.toFixed(1).replace(/\.0$/, "")}` : ""}
            </span>
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
                    {typeof it.score === "number" && <ScoreRing value={it.score} max={10} size={30} strokeWidth={2.5} />}
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

  // Plan d'action : liste simple cliquable (détails dans FocusOverlay)
  const planList = fichePlan || data.plan || [];
  const planPanel = !fiche ? (
    <TabLoading label="Génération du plan d'action…" />
  ) : (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {planList.map((p, i) => {
        const taskKey = `${i}::${(p.task || '').slice(0, 60)}`;
        const isResolved = resolvedTasks.has(taskKey);
        const prio = (p.p || "").toUpperCase();
        const prioColors = { HIGH: T.red, MED: T.amber, LOW: T.muted };
        const prioColor = prioColors[prio] || T.muted;
        return (
          <div
            key={i}
            onClick={() => setFocusIdx(i)}
            style={{
              display: "flex", alignItems: "center", gap: 18,
              padding: "20px 22px",
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              background: T.s1,
              cursor: "pointer",
              opacity: isResolved ? 0.5 : 1,
              transition: "border-color .15s, background .15s, transform .1s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#f5b05655"; e.currentTarget.style.background = T.s2; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.s1; }}
          >
            <span style={{
              fontFamily: T.mono, fontSize: 9, letterSpacing: 1,
              padding: "3px 7px", borderRadius: 4, flexShrink: 0,
              background: `${prioColor}22`, color: prioColor,
            }}>{prio}</span>
            <span style={{
              flex: 1,
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 20, fontWeight: 400, lineHeight: 1.3, letterSpacing: 0.2,
              color: isResolved ? T.muted : T.text,
              textDecoration: isResolved ? "line-through" : "none",
            }}>{p.task}</span>
            <button
              onClick={(e) => { e.stopPropagation(); toggleResolved(taskKey); }}
              title={isResolved ? "Résolu — cliquer pour rouvrir" : "Marquer comme résolu"}
              style={{
                width: 24, height: 24, borderRadius: 6,
                background: isResolved ? (T.green || '#4ade80') : 'transparent',
                border: `1.5px solid ${isResolved ? (T.green || '#4ade80') : T.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', padding: 0, flexShrink: 0,
              }}
            >
              {isResolved && (
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span style={{ color: T.muted, fontFamily: T.mono, fontSize: 18, flexShrink: 0 }}>→</span>
          </div>
        );
      })}
    </div>
  );

  const columnHeading = {
    fontFamily: T.mono, fontSize: 12, letterSpacing: 2, color: T.amber,
    marginBottom: 24, paddingBottom: 18, borderBottom: `1px solid ${T.border}`,
  };

  // Section head utilitaire
  const SectionHead = ({ label, count }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "0 0 24px" }}>
      <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.muted, textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: T.border }} />
      {count != null && (
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted2 }}>{count}</span>
      )}
    </div>
  );

  // Verdict — on prend fiche.verdict si présent, sinon première phrase de fiche.summary, sinon mock
  const verdictText = fiche?.verdict || (fiche?.summary ? fiche.summary.split(/[.!?]\s/)[0] + "." : data.verdict);
  const scoreVal = typeof data.globalScore === "number" ? data.globalScore : null;
  const verdictSubtext = fiche?.summary && fiche?.verdict ? fiche.summary : null;

  return (
    <>
      {/* Chat overlay glissant (étape 4) — bulle + panneau */}
      <VersionChat
        config={config}
        analysisResult={analysisResult}
        collapsed={chatCollapsed}
        onToggleCollapse={() => setChatCollapsed(c => !c)}
        expandedWidth={CHAT_WIDTH}
      />

      {/* FocusOverlay plein écran (étape 3) */}
      {focusIdx !== null && fichePlan && (
        <FocusOverlay
          plan={planList}
          idx={focusIdx}
          elements={ficheElements || data.elements}
          onClose={() => setFocusIdx(null)}
          onPrev={() => setFocusIdx(i => Math.max(0, i - 1))}
          onNext={() => setFocusIdx(i => Math.min(planList.length - 1, i + 1))}
          onToggleResolved={() => {
            const taskKey = `${focusIdx}::${(planList[focusIdx]?.task || '').slice(0, 60)}`;
            toggleResolved(taskKey);
          }}
          isResolved={(() => {
            const taskKey = `${focusIdx}::${(planList[focusIdx]?.task || '').slice(0, 60)}`;
            return resolvedTasks.has(taskKey);
          })()}
        />
      )}

      {/* Timeline versions (sticky top) — étape 1 */}
      <VersionsTimeline
        track={currentTrack}
        currentVersionName={config?.version}
        stage={stage}
        onSelectVersion={onSelectVersion}
        onAddVersion={onAddVersion}
      />

      {/* Page unique scroll (étape 2) */}
      <div style={{ maxWidth: 880, margin: "0 auto", width: "100%", padding: isDesktop ? "40px 60px 140px" : "16px 16px 140px", animation: "fadeup .35s ease" }}>

        {/* 1 · Verdict : score + grande phrase serif */}
        <section style={{ display: "flex", alignItems: "center", gap: 42, padding: "30px 0 56px", flexWrap: "wrap" }}>
          {scoreVal != null && (
            <div style={{ flexShrink: 0 }}>
              <ScoreRing value={scoreVal} max={100} size={140} strokeWidth={5} showLabel={false} />
              <div style={{ position: "relative", marginTop: -140, height: 140, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 58, lineHeight: 1, color: T.text }}>{Math.round(scoreVal)}</div>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: 1, marginTop: 4 }}>SCORE / 100</div>
              </div>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 280 }}>
            <h1 style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 38, fontWeight: 400, lineHeight: 1.15, letterSpacing: 0.3,
              margin: "0 0 14px", color: T.text, maxWidth: 540,
            }}>
              {verdictText}
            </h1>
            {verdictSubtext && (
              <p style={{ fontFamily: T.body, fontSize: 15, lineHeight: 1.7, color: T.textSoft, fontWeight: 300, margin: 0, maxWidth: 540 }}>
                {verdictSubtext}
              </p>
            )}
            {meta.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
                {meta.map(m => (
                  <div key={m.label} style={{
                    fontFamily: T.mono, fontSize: 11, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "4px 10px", display: "flex", gap: 6
                  }}>
                    <span style={{ color: T.muted }}>{m.label}</span><span style={{ color: T.amber }}>{m.val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 2 · Plan d'action (liste cliquable) */}
        <SectionHead label="Plan d'action" count={planList.length ? `${planList.length} ajustement${planList.length > 1 ? "s" : ""}` : null} />
        <div style={{ marginBottom: 72 }}>
          {planPanel}
        </div>

        {/* 3 · Diagnostic (accordéons) */}
        <SectionHead label="Diagnostic détaillé" />
        <div style={{ marginBottom: 48 }}>
          {diagnosticPanel}
        </div>

        {/* 4 · Écoute qualitative (section pliable) */}
        {(listening || stage !== "all_done") && (
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={() => setOpenExtra(openExtra === "ecoute" ? null : "ecoute")}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 0", background: "transparent", border: "none", borderTop: `1px solid ${T.border}`,
                cursor: "pointer", color: T.muted,
              }}
            >
              <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>Écoute qualitative</span>
              <span style={{ fontFamily: T.mono, fontSize: 14, transform: openExtra === "ecoute" ? "rotate(90deg)" : "none", transition: "transform .2s" }}>›</span>
            </button>
            {openExtra === "ecoute" && (
              <div style={{ paddingTop: 16 }}>
                {!listening && stage !== "all_done" && <TabLoading label="Écoute qualitative en cours…" />}
                {!listening && stage === "all_done" && (
                  <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, lineHeight: 1.7, padding: "20px 0" }}>
                    L'écoute qualitative n'a pas pu être générée pour cette analyse.
                  </div>
                )}
                {listening && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {listening.impression && (
                      <div style={{ background: `rgba(87,204,153,0.06)`, border: `1px solid rgba(87,204,153,0.2)`, borderLeft: `3px solid ${T.green}`, borderRadius: 8, padding: "18px 22px" }}>
                        <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.green, marginBottom: 10 }}>IMPRESSION</div>
                        <div style={{ fontFamily: T.mono, fontSize: 13, color: T.textSoft, lineHeight: 1.85 }}>{listening.impression}</div>
                      </div>
                    )}
                    {["espace", "dynamique", "couleur"].map((k) => listening[k] && (
                      <div key={k} style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 8, padding: "18px 22px" }}>
                        <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.amber, marginBottom: 10, textTransform: "uppercase" }}>{k}</div>
                        <div style={{ fontFamily: T.mono, fontSize: 13, color: T.textSoft, lineHeight: 1.85 }}>{listening[k]}</div>
                      </div>
                    ))}
                    {listening.points_forts && (
                      <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 8, padding: "18px 22px" }}>
                        <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.green, marginBottom: 10 }}>POINTS FORTS</div>
                        {listening.points_forts.map((p, i) => (
                          <div key={i} style={{ fontFamily: T.mono, fontSize: 13, color: T.textSoft, lineHeight: 1.85, display: "flex", gap: 10 }}>
                            <span style={{ color: T.green }}>▸</span> {p}
                          </div>
                        ))}
                      </div>
                    )}
                    {listening.a_travailler && (
                      <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 8, padding: "18px 22px" }}>
                        <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.orange, marginBottom: 10 }}>À TRAVAILLER</div>
                        {listening.a_travailler.map((p, i) => (
                          <div key={i} style={{ fontFamily: T.mono, fontSize: 13, color: T.textSoft, lineHeight: 1.85, display: "flex", gap: 10 }}>
                            <span style={{ color: T.orange }}>▸</span> {p}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 5 · Comparaison référence (section pliable) */}
        {hasRef && (
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={() => setOpenExtra(openExtra === "comparaison" ? null : "comparaison")}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 0", background: "transparent", border: "none", borderTop: `1px solid ${T.border}`,
                cursor: "pointer", color: T.muted,
              }}
            >
              <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>Comparaison référence</span>
              <span style={{ fontFamily: T.mono, fontSize: 14, transform: openExtra === "comparaison" ? "rotate(90deg)" : "none", transition: "transform .2s" }}>›</span>
            </button>
            {openExtra === "comparaison" && (
              <div style={{ paddingTop: 16, fontFamily: T.mono, fontSize: 13, color: T.textSoft, lineHeight: 1.85 }}>
                Comparaison détaillée à venir — données encore mockées à cette étape.
              </div>
            )}
          </div>
        )}

        {/* Limites */}
        <div style={{ marginTop: 32, background: "rgba(232,93,4,0.04)", border: `1px solid rgba(232,93,4,0.15)`, borderRadius: 8, padding: "14px 20px" }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.orange, marginBottom: 8, textTransform: "uppercase" }}>Limites de cette analyse</div>
          <div style={{ fontFamily: T.mono, fontSize: 12, color: T.textSoft, lineHeight: 1.75 }}>
            Analyse basée sur l'empreinte audio. Les conseils sont des directions, pas des vérités — fais confiance à tes oreilles.
          </div>
        </div>
      </div>
    </>
  );
};

export default FicheScreen;
