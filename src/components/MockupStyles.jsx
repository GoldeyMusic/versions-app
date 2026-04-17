/**
 * MockupStyles — CSS verbatim extrait de mockup-v3.html.
 * Source: /sessions/.../Versions/mockup-v3.html validé 2026-04-14.
 * Ne pas modifier sans mettre à jour la maquette en parallèle.
 */
export default function MockupStyles() {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>
      <style>{`
  :root {
    --bg: #0c0c0d;
    --s1: #141416;
    --s2: #1b1b1d;
    --s3: #222225;
    --border: #2a2a2e;
    --text: #ededed;
    --soft: #c5c5c7;
    --muted: #7c7c80;
    --muted2: #5a5a5e;
    --amber: #f5b056;
    --amber-dim: #f5b05622;
    --amber-glow: #f5b05611;
    --green: #7bd88f;
    --green-dim: #7bd88f33;
    --red: #ef6b6b;
    --black: #000;
    --serif: 'Instrument Serif', serif;
    --body: 'Inter', sans-serif;
    --mono: 'JetBrains Mono', monospace;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: var(--bg); color: var(--text); font-family: var(--body); font-weight: 300; font-size: 14px; scroll-behavior: smooth; }
  a { color: inherit; text-decoration: none; }
  button { font-family: inherit; color: inherit; background: none; border: none; cursor: pointer; padding: 0; }

  /* ── Layout ──────────────────────────────────── */
  .app { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }

  /* Sidebar — très discrète */
  .sidebar {
    background: transparent;
    border-right: 1px solid var(--border);
    padding: 22px 18px;
    display: flex; flex-direction: column; gap: 18px;
    position: sticky; top: 0; height: 100vh; overflow-y: auto;
  }
  .brand { display: flex; align-items: center; gap: 10px; font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 3px; color: var(--text); }
  .brand .accent { color: var(--amber); font-style: normal; }
  .user-pill {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px;
    border-radius: 10px;
    background: var(--s1);
    border: 1px solid var(--border);
    cursor: pointer;
  }
  .user-pill .avatar {
    width: 26px; height: 26px; border-radius: 50%;
    background: linear-gradient(135deg, var(--amber), #e88855);
    display: flex; align-items: center; justify-content: center;
    color: #000; font-family: var(--mono); font-weight: 600; font-size: 12px;
  }
  .user-pill .who { font-size: 12px; color: var(--text); font-weight: 500; }
  .user-pill .plan { font-family: var(--mono); font-size: 9px; color: var(--muted); margin-top: 1px; }

  .new-track {
    padding: 9px 12px; border-radius: 8px;
    border: 1px dashed #f5b05666; color: var(--amber);
    font-family: var(--mono); font-size: 10px; letter-spacing: 1px; text-transform: uppercase;
    text-align: center;
  }
  .section-label {
    font-family: var(--mono); font-size: 9px; letter-spacing: 1.5px;
    color: var(--muted2); text-transform: uppercase;
    margin: 4px 4px 4px;
  }
  .track-list { display: flex; flex-direction: column; gap: 1px; }
  .track {
    padding: 7px 10px; border-radius: 6px;
    font-family: var(--body); font-size: 13px; color: var(--soft);
    cursor: pointer;
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
  }
  .track:hover { background: var(--s1); }
  .track.active { background: var(--amber-glow); color: var(--amber); }
  .track.drag-over-above { border-top: 2px solid var(--amber); margin-top: -2px; }
  .track.drag-over-below { border-bottom: 2px solid var(--amber); margin-bottom: -2px; }
  .track .count { font-family: var(--mono); font-size: 10px; color: var(--muted); }

  .sb-drag-handle {
    display: flex; align-items: center; justify-content: center;
    width: 14px; flex-shrink: 0;
    color: var(--muted2); cursor: grab;
    opacity: 0.4; transition: opacity .15s, color .15s;
    touch-action: none;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }
  .sb-drag-handle:active { cursor: grabbing; }
  .track:hover .sb-drag-handle { opacity: 1; color: var(--muted); }
  @media (max-width: 600px) {
    .sb-drag-handle {
      width: 24px; min-height: 32px;
      opacity: 0.6;
    }
  }

  .sb-play-btn {
    width: 22px; height: 22px; border-radius: 50%;
    background: transparent; border: 1px solid var(--border);
    color: var(--muted); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; padding: 0;
    transition: all .15s;
  }
  .sb-play-btn:hover { color: var(--amber); border-color: var(--amber); }
  .sb-play-btn.playing {
    color: var(--amber); border-color: var(--amber);
    background: rgba(245,176,86,0.12);
  }

  .footer {
    margin-top: auto;
    display: flex; flex-direction: column; gap: 6px;
    padding-top: 14px; border-top: 1px solid var(--border);
  }
  .footer button {
    padding: 7px 10px; border-radius: 7px;
    font-family: var(--mono); font-size: 10px; letter-spacing: 0.5px; text-transform: uppercase;
    color: var(--muted); border: 1px solid var(--border);
    text-align: left;
  }
  .footer button:hover { color: var(--text); border-color: var(--muted); }

  /* ── Main area ──────────────────────────────── */
  .main { display: flex; flex-direction: column; min-width: 0; position: relative; }

  .fiche-back {
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 6px;
    background: none; border: none; cursor: pointer;
    color: var(--muted); padding: 0; flex-shrink: 0;
    transition: color .15s;
  }
  .fiche-back:hover { color: var(--amber); }

  /* Timeline versions — sticky top, plus affirmée */
  .timeline {
    position: sticky; top: 0; z-index: 10;
    background: rgba(12,12,13,0.92);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border);
    padding: 16px 40px 14px;
    display: flex; align-items: center; gap: 28px;
  }
  .track-title {
    font-family: var(--serif);
    font-size: 28px;
    letter-spacing: 0.5px;
    line-height: 1;
    display: flex; align-items: baseline; gap: 12px;
  }
  .track-title .it { font-style: italic; color: var(--amber); }
  .track-title .vsub {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--muted);
    text-transform: uppercase;
    font-weight: 400;
    padding-left: 12px;
    border-left: 1px solid var(--border);
    align-self: center;
    line-height: 1.3;
  }
  .track-title .vsub b { color: var(--amber); font-weight: 500; }
  .track-title .vsub .vlabel {
    display: block;
    font-size: 9px; color: var(--muted2);
    letter-spacing: 1.5px;
  }

  .versions-block {
    display: flex; align-items: center; gap: 10px;
    margin-left: auto;
    padding: 10px 10px 8px 14px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: rgba(255,255,255,0.02);
  }
  .versions-label {
    font-family: var(--mono); font-size: 9px; letter-spacing: 2px;
    color: var(--muted2); text-transform: uppercase;
    padding-right: 4px; border-right: 1px solid var(--border);
    margin-right: 2px;
  }
  .versions-row { display: flex; align-items: center; gap: 6px; }
  .vchip {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 8px 14px;
    border-radius: 10px;
    cursor: pointer;
    min-width: 66px;
    transition: background .15s, border-color .15s, transform .1s;
    border: 1px solid transparent;
    position: relative;
  }
  .vchip:hover { background: var(--s1); border-color: var(--border); }
  .vchip.active {
    background: var(--amber-glow);
    border-color: #f5b05666;
    box-shadow: 0 0 0 1px #f5b05633, 0 4px 14px rgba(245,176,86,0.08);
  }
  .vchip .vname {
    font-family: var(--mono); font-size: 11px; color: var(--soft); letter-spacing: 1px;
    font-weight: 500;
  }
  .vchip.active .vname { color: var(--amber); }
  .vchip .vscore {
    font-family: var(--serif); font-size: 20px; color: var(--text);
    margin-top: 2px; line-height: 1;
  }
  .vchip.active .vscore { color: var(--amber); }
  .vchip .vscore .pct {
    font-family: var(--mono); font-size: 9px; color: var(--muted); margin-left: 2px;
    font-weight: 400;
  }
  .vchip.current-badge::after {
    content: "EN COURS"; pointer-events: none;
    position: absolute;
    top: -7px; left: 50%; transform: translateX(-50%);
    font-family: var(--mono); font-size: 7px; letter-spacing: 1.5px;
    background: var(--amber); color: #000;
    padding: 2px 6px; border-radius: 3px;
    white-space: nowrap;
  }
  .vsep {
    color: var(--muted2); font-size: 14px; padding: 0 2px;
    font-family: var(--mono); align-self: center;
  }
  .vdelta {
    font-family: var(--mono);
    font-size: 10px;
    padding: 3px 7px;
    border-radius: 4px;
    background: #7bd88f18;
    color: var(--green);
    font-weight: 500;
    letter-spacing: 0.5px;
  }
  .vdelta.down { background: #ef6b6b18; color: var(--red); }
  .new-version-btn {
    margin-left: 6px;
    width: 34px; height: 34px; border-radius: 50%;
    border: 1px dashed #f5b05666; color: var(--amber);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 18px; line-height: 1;
    transition: all .15s;
  }
  .new-version-btn:hover { background: var(--amber-glow); border-style: solid; }

  /* ── PAGE PRINCIPALE ─────────────────────────── */
  .page { max-width: 880px; margin: 0 auto; width: 100%; padding: 40px 60px 120px; }

  /* Section 1 : Verdict */
  .verdict {
    display: flex; align-items: center; gap: 42px;
    padding: 30px 0 60px;
  }
  .score-ring {
    width: 140px; height: 140px; position: relative; flex-shrink: 0;
  }
  .score-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  .score-ring .center {
    position: absolute; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
  }
  .score-ring .big {
    font-family: var(--serif); font-size: 58px; line-height: 1; color: var(--text);
  }
  .score-ring .unit { font-family: var(--mono); font-size: 10px; color: var(--muted); letter-spacing: 1px; margin-top: 4px; }

  .verdict-text h1 {
    font-family: var(--serif);
    font-size: 38px;
    font-weight: 400;
    line-height: 1.15;
    letter-spacing: 0.3px;
    margin: 0 0 14px;
    max-width: 540px;
  }
  .verdict-text h1 em { font-style: italic; color: var(--amber); font-weight: 400; }
  .verdict-text p {
    font-family: var(--body);
    font-size: 15px;
    line-height: 1.7;
    color: var(--soft);
    font-weight: 300;
    margin: 0;
    max-width: 540px;
  }

  /* Séparateur de section discret (juste un label avec une ligne) */
  .section-head {
    display: flex; align-items: center; gap: 16px;
    margin: 0 0 24px;
  }
  .section-head .t {
    font-family: var(--mono); font-size: 10px; letter-spacing: 2px; color: var(--muted); text-transform: uppercase;
    white-space: nowrap;
  }
  .section-head .line { flex: 1; height: 1px; background: var(--border); }
  .section-head .count {
    font-family: var(--mono); font-size: 10px; color: var(--muted2);
  }

  /* Section 2 : chantiers */
  .priority-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 80px; }
  .priority {
    display: flex; align-items: center; gap: 18px;
    padding: 20px 22px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--s1);
    cursor: pointer;
    transition: border-color .15s, background .15s, transform .1s;
  }
  .priority:hover {
    border-color: #f5b05655;
    background: var(--s2);
  }
  .priority:active { transform: translateY(1px); }
  .priority.done { opacity: 0.5; }

  .pbadge {
    font-family: var(--mono); font-size: 9px;
    padding: 3px 7px; border-radius: 4px;
    letter-spacing: 1px;
    flex-shrink: 0;
  }
  .pbadge.high { background: #ef6b6b22; color: var(--red); }
  .pbadge.med  { background: var(--amber-glow); color: var(--amber); }
  .pbadge.low  { background: var(--s3); color: var(--muted); }

  .ptitle {
    flex: 1;
    font-family: var(--body); font-size: 15px; font-weight: 300; line-height: 1.4;
    letter-spacing: 0.2px;
  }
  .done .ptitle { text-decoration: line-through; color: var(--muted); }

  .pcheck {
    width: 22px; height: 22px; border-radius: 5px;
    border: 1.5px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .pcheck:hover { border-color: var(--green); }
  .done .pcheck { background: var(--green); border-color: var(--green); }
  .done .pcheck svg { display: block; }
  .pcheck svg { display: none; }

  .parrow { color: var(--muted); flex-shrink: 0; font-size: 18px; }
  .priority:hover .parrow { color: var(--amber); }

  /* Section 3 : Diagnostic */
  .diag-cat {
    border: 1px solid var(--border);
    border-radius: 10px;
    margin-bottom: 10px;
    overflow: hidden;
  }
  .diag-cat-head {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 20px;
    cursor: pointer;
  }
  .diag-cat-head .name {
    font-family: var(--mono); font-size: 11px; letter-spacing: 2px; color: var(--amber); text-transform: uppercase;
    flex: 1;
  }
  .diag-cat-head .chev {
    color: var(--muted);
    transition: transform .15s;
  }
  .diag-cat.open .diag-cat-head .chev { transform: rotate(90deg); }
  .diag-cat-head .count {
    font-family: var(--mono); font-size: 10px; color: var(--muted);
  }
  .diag-cat-body {
    padding: 0 20px 16px;
    border-top: 1px solid var(--border);
    display: none;
  }
  .diag-cat.open .diag-cat-body { display: block; }
  .diag-item {
    padding: 16px 0;
    border-bottom: 1px dashed var(--border);
    display: flex; gap: 16px;
  }
  .diag-item:last-child { border-bottom: none; }
  .diag-item .sring { width: 32px; height: 32px; position: relative; flex-shrink: 0; margin-top: 2px; }
  .diag-item .sring svg { transform: rotate(-90deg); }
  .diag-item .sring .n {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-family: var(--mono); font-size: 11px; color: var(--muted);
  }
  .diag-item .di-body { flex: 1; }
  .diag-item .di-name { font-family: var(--body); font-size: 15px; font-weight: 400; margin-bottom: 4px; }
  .diag-item .di-detail { font-size: 13px; color: var(--soft); line-height: 1.6; font-weight: 300; margin-bottom: 10px; }
  .diag-item .di-tools { display: flex; flex-wrap: wrap; gap: 6px; }
  .diag-item .di-tools span {
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    padding: 3px 8px; border: 1px solid var(--border); border-radius: 4px;
  }

  /* ── FOCUS — overlay plein écran pour un chantier ── */
  .focus {
    position: fixed; inset: 0; z-index: 200;
    background: var(--bg);
    overflow-y: auto;
    display: none;
    animation: fadein .2s ease;
  }
  .focus.open { display: block; }
  @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }

  .focus-bar {
    position: sticky; top: 0;
    background: rgba(12,12,13,0.92);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border);
    padding: 14px 40px;
    display: flex; align-items: center; justify-content: space-between; gap: 18px;
  }
  .focus-back {
    display: flex; align-items: center; gap: 8px;
    font-family: var(--mono); font-size: 10px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase;
    padding: 6px 10px; border-radius: 6px;
  }
  .focus-back:hover { color: var(--amber); background: var(--s1); }
  .focus-local {
    display: flex; align-items: center; gap: 14px;
    font-family: var(--mono); font-size: 10px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase;
  }
  .focus-local .counter b { color: var(--amber); font-weight: 500; }
  .focus-local .nav-btn {
    padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border);
  }
  .focus-local .nav-btn:hover { border-color: var(--amber); color: var(--amber); }
  .focus-local .nav-btn.disabled { opacity: 0.3; pointer-events: none; }

  .focus-content { max-width: 880px; margin: 0 auto; padding: 40px 60px 100px; }
  .focus-content h2 {
    font-family: var(--serif);
    font-size: 42px;
    font-weight: 400;
    line-height: 1.15;
    letter-spacing: 0.3px;
    margin: 0 0 28px;
  }
  .focus-content h2 .pbadge-inline {
    display: inline-block;
    vertical-align: middle;
    margin-right: 14px;
    font-size: 10px;
    transform: translateY(-6px);
  }

  .daw-box {
    background: var(--s1);
    border: 1px solid var(--border);
    border-left: 3px solid var(--amber);
    border-radius: 10px;
    padding: 24px 28px;
    margin-bottom: 22px;
    font-family: var(--mono);
    font-size: 14px;
    line-height: 1.8;
    color: var(--amber);
  }
  .daw-box .daw-label {
    display: block;
    font-size: 9px; color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase;
    margin-bottom: 8px;
  }
  .mt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .mt-box {
    background: var(--s1); border: 1px solid var(--border); border-radius: 10px;
    padding: 18px 22px;
  }
  .mt-box .mt-label {
    font-family: var(--mono); font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase;
    margin-bottom: 8px;
  }
  .mt-box.m .mt-label { color: var(--amber); }
  .mt-box.t .mt-label { color: var(--green); }
  .mt-box .mt-val {
    font-family: var(--body); font-size: 14px; line-height: 1.6; color: var(--soft); font-weight: 300;
  }

  .linked-elements { margin-top: 34px; }
  .linked-elements .label {
    font-family: var(--mono); font-size: 10px; letter-spacing: 1.5px; color: var(--muted); text-transform: uppercase;
    margin-bottom: 14px;
  }
  .le-list { display: flex; flex-direction: column; gap: 8px; }
  .le {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 16px;
    border: 1px solid var(--border); border-radius: 8px;
  }
  .le .cat {
    font-family: var(--mono); font-size: 9px; letter-spacing: 1px;
    color: var(--muted); text-transform: uppercase;
    min-width: 60px;
  }
  .le .name { flex: 1; font-family: var(--body); font-size: 13px; font-weight: 500; }
  .le .sring { width: 26px; height: 26px; position: relative; flex-shrink: 0; }
  .le .sring svg { transform: rotate(-90deg); }
  .le .sring .n {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-family: var(--mono); font-size: 10px; color: var(--muted);
  }

  .resolve-action {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    margin-top: 40px;
    padding: 14px 22px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    cursor: pointer;
    font-family: var(--mono); font-size: 11px; letter-spacing: 1px; text-transform: uppercase;
    color: var(--muted);
    background: transparent;
    width: 100%;
    transition: all .15s;
  }
  .resolve-action:hover { border-color: var(--green); color: var(--green); }
  .resolve-action.done { background: var(--green-dim); border-color: var(--green); color: var(--green); }
  .resolve-action .box {
    width: 16px; height: 16px; border-radius: 3px;
    border: 1.5px solid currentColor;
    display: flex; align-items: center; justify-content: center;
  }
  .resolve-action.done .box { background: var(--green); color: var(--black); border-color: var(--green); }
  .resolve-action .box svg { display: none; }
  .resolve-action.done .box svg { display: block; }

  /* ── Player bottom bar ───────────────────────── */
  .player {
    position: fixed; bottom: 0; left: 0; right: 0;
    height: 68px;
    background: rgba(18,18,20,0.96);
    backdrop-filter: blur(14px);
    border-top: 1px solid var(--border);
    display: flex; align-items: center;
    padding: 0 24px 0 260px; /* 240 sidebar + 20 */
    gap: 20px;
    z-index: 90;
  }
  .player .pl-btn {
    width: 40px; height: 40px; border-radius: 50%;
    background: var(--amber); color: #000;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0;
  }
  .player .pl-btn:hover { filter: brightness(1.05); }
  .player .pl-ctrl {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: var(--muted); cursor: pointer; flex-shrink: 0;
  }
  .player .pl-ctrl:hover { color: var(--text); }
  .player .pl-meta {
    display: flex; flex-direction: column; gap: 2px;
    min-width: 140px; flex-shrink: 0;
  }
  .player .pl-meta .pl-title {
    font-family: var(--body); font-size: 13px; font-weight: 300; color: var(--soft); line-height: 1; letter-spacing: 0.3px;
  }
  .player .pl-meta .pl-sub {
    font-family: var(--mono); font-size: 9px; color: var(--muted); letter-spacing: 1px;
  }
  .player .pl-wave {
    flex: 1; height: 36px;
    display: flex; align-items: center; gap: 2px;
    overflow: hidden;
    cursor: pointer;
  }
  .player .pl-wave .bar {
    flex: 1; min-width: 2px;
    background: var(--muted2); border-radius: 1px;
    transition: background .1s;
  }
  .player .pl-wave .bar.past { background: var(--amber); }
  .player .pl-wave .bar.head { background: var(--text); }
  .player .pl-time {
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    flex-shrink: 0; min-width: 78px; text-align: right;
  }
  .player .pl-time b { color: var(--text); font-weight: 500; }

  /* Laisser la place au player */
  body { padding-bottom: 68px; }
  .focus { bottom: 68px; }
  .sidebar { height: calc(100vh - 68px); }

  /* ── Chat panneau ouvert — overlay glissant ──────── */
  .chat-backdrop {
    position: fixed; inset: 0 0 68px 0;
    background: rgba(0,0,0,0);
    pointer-events: none;
    transition: background .25s ease;
    z-index: 94;
  }
  body.chat-open .chat-backdrop {
    background: rgba(0,0,0,0.25);
    pointer-events: auto;
  }
  .chat-panel {
    position: fixed; top: 0; right: 0; bottom: 68px;
    width: 380px;
    background: var(--s1);
    border-left: 1px solid var(--border);
    display: flex; flex-direction: column;
    z-index: 95;
    box-shadow: -20px 0 40px rgba(0,0,0,0.45);
    transform: translateX(100%);
    transition: transform .28s cubic-bezier(.4, .0, .2, 1);
  }
  body.chat-open .chat-panel { transform: translateX(0); }
  .chat-head {
    padding: 14px 18px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid var(--border);
  }
  .chat-head .ctitle {
    font-family: var(--mono); font-size: 10px; letter-spacing: 2px;
    color: var(--amber); text-transform: uppercase;
  }
  .chat-head .cclose {
    width: 24px; height: 24px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    color: var(--muted); cursor: pointer;
  }
  .chat-head .cclose:hover { color: var(--text); background: var(--s2); }
  .chat-body {
    flex: 1; overflow-y: auto; padding: 20px 18px;
    display: flex; flex-direction: column; gap: 14px;
  }
  .msg {
    max-width: 86%;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 13px; line-height: 1.55; font-weight: 300;
  }
  .msg.user {
    align-self: flex-end;
    background: var(--amber-glow); color: var(--text);
    border: 1px solid #f5b05633;
    border-bottom-right-radius: 4px;
  }
  .msg.ai {
    align-self: flex-start;
    background: var(--s2); color: var(--soft);
    border: 1px solid var(--border);
    border-bottom-left-radius: 4px;
  }
  .msg .ai-label {
    font-family: var(--mono); font-size: 8px; letter-spacing: 1.5px;
    color: var(--amber); text-transform: uppercase;
    margin-bottom: 4px; display: block;
  }
  .chat-input {
    padding: 12px 14px 14px;
    border-top: 1px solid var(--border);
    display: flex; gap: 8px;
    align-items: center;
  }
  .chat-input textarea {
    flex: 1;
    background: var(--s2) !important; border: 1px solid var(--border);
    padding: 10px 12px; border-radius: 8px;
    color: var(--text); font-family: var(--body); font-size: 13px;
    outline: none; resize: none;
    line-height: 1.4;
    height: 40px; min-height: 40px;
    max-height: 120px;
    overflow-y: auto;
    -webkit-appearance: none;
    appearance: none;
    box-sizing: border-box;
  }
  .chat-input textarea:focus { border-color: var(--amber); }
  .chat-typing { display: inline-flex; gap: 4px; align-items: center; padding: 4px 0; }
  .chat-typing .dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--amber); opacity: 0.4;
    animation: chatBounce 1.2s infinite ease-in-out;
  }
  .chat-typing .dot:nth-child(2) { animation-delay: 0.2s; }
  .chat-typing .dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes chatBounce {
    0%, 60%, 100% { opacity: 0.4; transform: translateY(0); }
    30% { opacity: 1; transform: translateY(-4px); }
  }
  .chat-input button {
    background: var(--amber); color: #000;
    padding: 0 16px; border-radius: 8px;
    font-family: var(--mono); font-size: 10px; letter-spacing: 1px; text-transform: uppercase;
    font-weight: 500;
    height: 40px; min-height: 40px;
    flex-shrink: 0;
    cursor: pointer;
    box-sizing: border-box;
  }

  /* ── Chat overlay bubble ──────────────────────── */
  .chat-fab {
    position: fixed; bottom: 90px; right: 28px;
    width: 48px; height: 48px; border-radius: 50%;
    background: var(--amber) !important; color: var(--black);
    border: none; padding: 0;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 28px rgba(245,176,86,0.35);
    cursor: pointer; z-index: 100;
    transition: transform .2s ease, opacity .2s ease;
  }
  .chat-fab:hover { transform: scale(1.06); }
  body.chat-open .chat-fab {
    transform: scale(0.6); opacity: 0; pointer-events: none;
  }

  /* ── Keyframes for loading animations ── */
  @keyframes fadeup {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes barrise {
    from { transform: scaleY(0.1); }
    to   { transform: scaleY(1); }
  }

  /* ── Welcome Home ── */
  .welcome-home {
    width: 100%; max-width: 620px; margin: 0 auto;
    padding: 50px 40px 80px; box-sizing: border-box;
    display: flex; flex-direction: column; gap: 40px;
    animation: fadeup .35s ease;
  }

  .wh-header { display: flex; flex-direction: column; align-items: center; gap: 20px; }
  .wh-greeting {
    font-family: 'Bebas Neue', sans-serif; font-size: 36px; font-weight: 400;
    letter-spacing: 3px; color: var(--text); text-align: center;
  }
  .wh-tip {
    width: 100%; padding: 18px 22px;
    background: rgba(245,176,86,0.03); border: 1px solid rgba(245,176,86,0.13);
    border-left: 3px solid var(--amber);
    border-radius: 10px; display: flex; flex-direction: column; gap: 8px;
  }
  .wh-tip-label {
    font-family: var(--mono); font-size: 9px; letter-spacing: 2px;
    color: var(--amber); text-transform: uppercase;
  }
  .wh-tip-text {
    font-family: var(--body); font-size: 13px; color: var(--soft);
    line-height: 1.7; font-weight: 300;
  }

  .wh-actions {
    display: flex; justify-content: center; gap: 12px;
  }
  .wh-action {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 22px; border-radius: 10px;
    background: transparent; border: 1px solid var(--border);
    color: var(--soft); font-family: var(--body); font-size: 13px; font-weight: 300;
    cursor: pointer; transition: all .2s;
  }
  .wh-action:hover {
    border-color: var(--amber); color: var(--amber); background: rgba(245,176,86,0.06);
  }
  .wh-action-icon {
    font-size: 16px; line-height: 1;
  }

  .wh-section-title {
    font-family: var(--serif); font-size: 28px; font-weight: 400;
    line-height: 1.15; letter-spacing: 0.3px;
    color: var(--text); margin-bottom: 18px;
  }
  .wh-section-title em {
    font-style: italic; color: var(--amber); font-weight: 400;
  }

  /* Tracklist homepage */
  .wh-tracklist { width: 100%; max-width: 520px; margin: 0 auto; }
  .wh-tracklist-list {
    display: flex; flex-direction: column; gap: 6px;
  }
  .wh-track-row {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 14px; border-radius: 10px;
    background: var(--s1); border: 1px solid var(--border);
    transition: all .2s;
  }
  .wh-track-row.drag-over-above { border-top: 2px solid var(--amber); margin-top: -2px; }
  .wh-track-row.drag-over-below { border-bottom: 2px solid var(--amber); margin-bottom: -2px; }
  /* Poignée de déplacement DnD (home) */
  .wh-drag-handle {
    display: inline-flex; align-items: center; justify-content: center;
    width: 16px; height: 20px; flex-shrink: 0;
    cursor: grab; color: #c5c5c7;
    transition: opacity .15s;
    margin-right: -4px;
  }
  .wh-drag-handle:active { cursor: grabbing; }
  .wh-track-row:hover {
    border-color: rgba(245,176,86,0.3); background: rgba(245,176,86,0.04);
  }
  .wh-track-play {
    width: 34px; height: 34px; border-radius: 50%;
    background: transparent; border: 1px solid var(--border);
    color: var(--muted); cursor: pointer; flex-shrink: 0; padding: 0;
    display: flex; align-items: center; justify-content: center;
    transition: all .15s;
  }
  .wh-track-play:hover { color: var(--amber); border-color: var(--amber); }
  .wh-track-play.playing {
    color: var(--amber); border-color: var(--amber);
    background: rgba(245,176,86,0.12);
  }
  .wh-track-info { flex: 1; min-width: 0; }
  .wh-track-title {
    font-family: var(--body); font-size: 14px; font-weight: 400;
    color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .wh-track-date {
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    flex-shrink: 0; white-space: nowrap; letter-spacing: 0.3px;
  }
  @media (max-width: 600px) {
    .wh-track-date { display: none; }
  }
  .wh-track-meta {
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    letter-spacing: 0.5px; margin-top: 2px;
  }
  .wh-track-fiche {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 14px; border-radius: 8px;
    background: rgba(245,176,86,0.08); border: 1px solid rgba(245,176,86,0.25);
    color: var(--amber); cursor: pointer; flex-shrink: 0;
    font-family: var(--mono); font-size: 10px; letter-spacing: 0.8px;
    text-transform: uppercase; font-weight: 500;
    transition: all .15s;
  }
  .wh-track-fiche:hover {
    background: rgba(245,176,86,0.15); border-color: var(--amber);
  }

  .wh-track-picker {
    position: absolute; top: calc(100% + 6px); left: 0; right: 0;
    min-width: 220px;
    background: var(--s1); border: 1px solid var(--border); border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    padding: 6px; z-index: 50;
    animation: fadeup .15s ease;
  }
  .wh-picker-label {
    font-family: var(--mono); font-size: 9px; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--muted);
    padding: 8px 12px 4px;
  }
  .wh-picker-item {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 10px 12px; border-radius: 8px;
    font-family: var(--body); font-size: 13px; font-weight: 300; color: var(--soft);
    cursor: pointer; transition: all .15s;
  }
  .wh-picker-item:hover {
    background: rgba(245,176,86,0.08); color: var(--amber);
  }
  .wh-picker-count {
    font-family: var(--mono); font-size: 9px; color: var(--muted); letter-spacing: 0.5px;
  }

  /* ── Input Screen ── */
  .input-screen {
    width: 100%; max-width: 520px; margin: 0 auto;
    padding: 50px 40px 80px; box-sizing: border-box;
    display: flex; flex-direction: column; gap: 28px;
    animation: fadeup .35s ease;
  }
  .input-header { text-align: center; }
  .input-title {
    font-family: 'Bebas Neue', sans-serif; font-size: 36px; font-weight: 400;
    letter-spacing: 3px; color: var(--text); margin-bottom: 6px;
  }
  .input-tagline {
    font-family: var(--body); font-size: 11px; font-weight: 300;
    letter-spacing: 3px; color: var(--amber); text-transform: uppercase;
    display: flex; align-items: center; justify-content: center; gap: 12px;
  }
  .input-tagline-dot {
    font-size: 18px; line-height: 1; letter-spacing: 0; opacity: 0.5;
  }

  .input-progress {
    width: 100%; height: 3px; border-radius: 2px;
    background: var(--border);
  }
  .input-progress-bar {
    height: 100%; border-radius: 2px;
    background: linear-gradient(90deg, var(--amber), #f5c056);
    transition: width .4s ease;
  }

  .input-form {
    display: flex; flex-direction: column; gap: 16px;
  }

  .input-section {
    background: var(--s1); border: 1px solid var(--border);
    border-radius: 14px; padding: 20px; transition: border-color .2s;
  }
  .input-section-label {
    font-family: var(--mono); font-size: 10px; letter-spacing: 2px;
    color: var(--amber); margin-bottom: 14px;
    display: flex; align-items: center; gap: 10px;
  }
  .input-section-line {
    flex: 1; height: 1px; background: var(--border);
  }

  .input-dropzone {
    border: 1px dashed var(--border); border-radius: 10px;
    padding: 16px 18px;
    display: flex; align-items: center; gap: 14px;
    cursor: pointer; transition: all .2s;
  }
  .input-dropzone:hover {
    border-color: var(--muted); background: rgba(255,255,255,0.02);
  }
  .input-drop-name {
    font-family: var(--body); font-size: 13px; font-weight: 400;
    color: #7bd88f; flex: 1;
  }
  .input-drop-text { flex: 1; }
  .input-drop-hint {
    font-family: var(--body); font-size: 13px; font-weight: 300; color: var(--muted);
  }
  .input-drop-formats {
    font-family: var(--mono); font-size: 9px; color: #5a5a5e; margin-top: 3px;
    letter-spacing: 0.5px;
  }

  .input-fields {
    display: flex; gap: 12px;
  }
  .input-field { flex: 1; }
  .input-label {
    font-family: var(--mono); font-size: 9px; letter-spacing: 1.5px;
    color: var(--muted); margin-bottom: 6px; display: block;
  }
  .input-input {
    width: 100%; background: var(--s2); border: 1px solid var(--border);
    border-radius: 8px; padding: 10px 14px;
    font-family: var(--body); font-size: 13px; font-weight: 300;
    color: var(--text); outline: none; transition: border-color .2s;
    box-sizing: border-box;
  }
  .input-input:focus { border-color: var(--amber); }
  .input-input::placeholder { color: #5a5a5e; }

  .input-select {
    width: 100%; background: var(--s2); border: 1px solid var(--border);
    border-radius: 8px; padding: 11px 40px 11px 14px;
    font-family: var(--body); font-size: 13px; font-weight: 300;
    color: var(--muted); outline: none; cursor: pointer;
    appearance: none; transition: border-color .2s;
  }
  .input-select option { background: var(--s1); color: var(--text); }
  .input-select-arrow {
    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    pointer-events: none;
  }

  .input-cta {
    width: 100%; padding: 14px 16px; border-radius: 10px;
    background: var(--s2); border: 1px solid var(--border);
    font-family: var(--body); font-size: 13px; font-weight: 400;
    letter-spacing: 1px; text-transform: uppercase;
    color: var(--muted); cursor: not-allowed; transition: all .2s;
  }
  .input-cta.ready {
    background: linear-gradient(135deg, var(--amber), #e08a00);
    border-color: var(--amber); color: #000; cursor: pointer;
    font-weight: 600; box-shadow: 0 4px 24px rgba(245,160,0,.3);
  }
  .input-cta.ready:hover {
    box-shadow: 0 6px 32px rgba(245,160,0,.45); transform: translateY(-1px);
  }

  .input-mode-hint {
    text-align: center; font-family: var(--mono); font-size: 10px;
    color: var(--amber); opacity: 0.5; animation: fadeup .2s ease;
  }

  /* ── Accordion projets (Home "Mes projets") ── */
  .wh-projects {
    display: flex; flex-direction: column; gap: 10px;
    width: 100%;
  }
  /* Teintes projet (valeurs RGB, alpha appliqué plus bas).
     Correspondent à la couleur claire du gradient de chaque teinte. */
  .wh-tint-0 { --project-tint: 198, 161, 91;  }  /* 0 ambre  */
  .wh-tint-1 { --project-tint: 91, 161, 198;  }  /* 1 bleu   */
  .wh-tint-2 { --project-tint: 161, 91, 198;  }  /* 2 violet */
  .wh-tint-3 { --project-tint: 91, 198, 161;  }  /* 3 vert   */
  .wh-tint-4 { --project-tint: 198, 91, 91;   }  /* 4 rouge  */
  .wh-tint-5 { --project-tint: 140, 140, 160; }  /* 5 gris   */

  .wh-acc-item {
    /* Fond = teinte très douce (6%) superposée sur --s1 dark.
       En mode fermé la teinte est légèrement visible sur la ligne projet. */
    background:
      linear-gradient(rgba(var(--project-tint, 255,255,255), 0.06),
                      rgba(var(--project-tint, 255,255,255), 0.06)),
      var(--s1);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    transition: border-color 0.2s ease, background 0.2s ease;
  }
  .wh-acc-item:hover { border-color: rgba(245,176,86,.25); }
  .wh-acc-item.open {
    /* En mode ouvert, teinte un poil plus marquée (9%) pour bien détacher
       le cadre du background général sur toute la hauteur de la carte. */
    background:
      linear-gradient(rgba(var(--project-tint, 255,255,255), 0.09),
                      rgba(var(--project-tint, 255,255,255), 0.09)),
      var(--s1);
    border-color: rgba(245,176,86,.4);
    box-shadow: 0 8px 32px rgba(0,0,0,.25);
  }
  .wh-acc-head {
    position: relative;
    display: grid;
    grid-template-columns: 64px 1fr;
    gap: 16px;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    transition: padding 0.25s ease;
  }
  .wh-acc-item.open .wh-acc-head {
    /* Colonne vignette = auto (largeur pilotée par aspect-ratio 1/1),
       colonne titre = 1fr. Stretch pour que la vignette prenne la hauteur totale. */
    grid-template-columns: auto 1fr;
    padding: 18px 18px 20px 12px;
    align-items: stretch;
  }
  .wh-acc-cover {
    position: relative;
    width: 64px; height: 64px;
    border-radius: 10px;
    flex-shrink: 0;
    transition: border-radius 0.25s ease, box-shadow 0.25s ease;
  }
  .wh-acc-item.open .wh-acc-cover {
    /* Carré qui remplit la hauteur du header (titre + meta + actions).
       aspect-ratio 1/1 + align-self stretch => largeur = hauteur. */
    aspect-ratio: 1 / 1;
    width: auto;
    height: auto;
    min-height: 96px;
    min-width: 96px;
    align-self: stretch;
    border-radius: 12px;
    box-shadow: 0 12px 30px rgba(0,0,0,0.45);
  }
  .wh-acc-title { min-width: 0; overflow: hidden; }
  .wh-acc-kicker {
    display: none;
    font-family: var(--mono); font-size: 9px;
    letter-spacing: 2.5px; color: var(--amber);
    text-transform: uppercase; margin-bottom: 6px;
  }
  .wh-acc-item.open .wh-acc-kicker { display: block; }
  .wh-acc-name {
    font-family: var(--body); font-size: 15px; font-weight: 500;
    color: var(--text);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .wh-acc-item.open .wh-acc-name {
    font-family: var(--serif); font-size: 28px; font-weight: 400;
    letter-spacing: 0.3px; white-space: normal;
    line-height: 1.1;
  }
  .wh-acc-meta {
    font-family: var(--mono); font-size: 10px;
    color: var(--muted); letter-spacing: 0.5px;
    margin-top: 3px;
  }
  .wh-acc-item.open .wh-acc-meta { margin-top: 8px; }
  /* Play projet centré sur la vignette, apparaît au hover de la vignette.
     Fonctionne identiquement que le projet soit ouvert ou fermé. */
  .wh-acc-play {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 40px; height: 40px; border-radius: 50%;
    background: rgba(0,0,0,0.55);
    border: 1px solid rgba(255,255,255,0.2);
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    opacity: 0;
    transition: opacity .15s, background .15s, border-color .15s;
    padding: 0; cursor: pointer;
    z-index: 2;
    backdrop-filter: blur(4px);
  }
  .wh-acc-cover:hover .wh-acc-play,
  .wh-acc-play:focus-visible { opacity: 1; }
  .wh-acc-play:hover {
    background: rgba(0,0,0,0.7);
    border-color: #fff;
    color: #fff;
  }
  .wh-acc-play.playing {
    opacity: 1;
    background: rgba(245,176,86,0.2);
    border-color: var(--amber);
    color: var(--amber);
  }

  .wh-acc-body {
    display: none;
    padding: 0 18px 18px;
  }
  .wh-acc-item.open .wh-acc-body { display: block; }

  .wh-head-actions {
    display: flex; gap: 8px; flex-wrap: wrap;
    padding-top: 14px;
    margin-top: 4px;
    border-top: 1px solid var(--border);
  }
  .wh-head-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 16px; border-radius: 999px;
    font-family: var(--body); font-size: 12px; font-weight: 500;
    background: transparent; border: 1px solid var(--border);
    color: var(--soft); cursor: pointer;
    transition: all .15s;
  }
  .wh-head-btn:hover {
    border-color: rgba(245,176,86,.4); color: var(--amber);
  }
  .wh-head-btn.primary {
    background: var(--amber); border-color: var(--amber); color: #000;
  }
  .wh-head-btn.primary:hover { background: #e88855; border-color: #e88855; color: #000; }
  .wh-head-btn.ghost { color: var(--muted); }
  .wh-head-btn.danger:hover { color: var(--red); border-color: var(--red); }

  .wh-acc-tracklist {
    margin-top: 16px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .wh-acc-empty {
    padding: 24px 0; color: var(--muted); font-size: 12px;
    font-style: italic; text-align: center;
  }
  .wh-acc-add-track {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    margin-top: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    background: transparent;
    border: 1px dashed var(--border);
    color: var(--muted);
    font-family: var(--body); font-size: 12px;
    cursor: pointer;
    transition: all .15s;
  }
  .wh-acc-add-track:hover {
    border-color: var(--amber); color: var(--amber); background: rgba(245,176,86,0.04);
  }

  /* Gradients covers */
  .wh-gradient-0 { background: linear-gradient(135deg, #4a3b2a, #8a6a3f 60%, #c6a15b); }
  .wh-gradient-1 { background: linear-gradient(135deg, #2a3a4a, #3f6a8a 60%, #5ba1c6); }
  .wh-gradient-2 { background: linear-gradient(135deg, #3a2a4a, #6a3f8a 60%, #a15bc6); }
  .wh-gradient-3 { background: linear-gradient(135deg, #2a4a3a, #3f8a6a 60%, #5bc6a1); }
  .wh-gradient-4 { background: linear-gradient(135deg, #4a2a2a, #8a3f3f 60%, #c65b5b); }
  .wh-gradient-5 { background: linear-gradient(135deg, #24242c, #3a3a48 70%, #5a5a6e); }

  /* Layout compact sur mobile (portrait OU paysage) : vignette figée a 80x80
     alignee en haut, sinon aspect-ratio 1/1 + stretch la rend enorme et
     cache les infos du projet. La clause max-height 500px attrape le mobile
     paysage qui depasse 600px de large mais reste court en hauteur. */
  @media (max-width: 600px), (max-height: 500px) {
    .wh-acc-item.open .wh-acc-head {
      grid-template-columns: 80px 1fr;
      padding: 14px 14px 16px 12px;
      align-items: flex-start;
    }
    .wh-acc-item.open .wh-acc-cover {
      width: 80px;
      height: 80px;
      aspect-ratio: auto;
      min-width: 0;
      min-height: 0;
      align-self: flex-start;
    }
    .wh-acc-item.open .wh-acc-name { font-size: 22px; }
    .wh-head-btn { font-size: 11px; padding: 7px 12px; }
  }

  .wh-empty {
    display: flex; flex-direction: column; align-items: center; gap: 16px;
    padding: 40px 0;
    font-family: var(--body); font-size: 13px; font-weight: 300;
    color: var(--muted); text-align: center;
  }

  /* ── Auth Screen ── */
  .auth-screen {
    min-height: 100vh; display: grid; place-items: center;
    padding: 40px 24px; background: var(--bg); box-sizing: border-box;
  }
  .auth-card {
    width: 100%; max-width: 380px;
    display: flex; flex-direction: column; gap: 24px;
    animation: fadeup .35s ease;
  }
  .auth-logo {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    margin-bottom: 8px;
  }
  .auth-brand {
    font-family: 'Bebas Neue', sans-serif; font-size: 42px;
    letter-spacing: 5px; color: var(--text); line-height: 1;
  }
  .auth-brand .accent { color: var(--amber); }
  .auth-tagline {
    font-family: var(--body); font-size: 10px; font-weight: 300;
    letter-spacing: 3px; color: var(--amber); text-transform: uppercase;
    display: flex; align-items: center; gap: 10px;
  }
  .auth-tagline-dot {
    font-size: 16px; line-height: 1; letter-spacing: 0; opacity: 0.5;
  }
  .auth-form {
    display: flex; flex-direction: column; gap: 12px;
  }
  .auth-input {
    width: 100%; padding: 13px 16px;
    background: var(--s1); border: 1px solid var(--border);
    border-radius: 10px; color: var(--text);
    font-family: var(--body); font-size: 13px; font-weight: 300;
    outline: none; box-sizing: border-box; transition: border-color .2s;
  }
  .auth-input:focus { border-color: var(--amber); }
  .auth-input::placeholder { color: #5a5a5e; }
  .auth-error {
    color: var(--red); font-family: var(--mono); font-size: 11px;
    text-align: center; letter-spacing: 0.3px;
  }
  .auth-info {
    color: var(--green); font-family: var(--mono); font-size: 11px;
    text-align: center; letter-spacing: 0.3px;
  }
  .auth-submit {
    width: 100%; padding: 14px;
    background: linear-gradient(135deg, var(--amber), #e08a00);
    color: #000; border: none; border-radius: 10px;
    font-family: var(--body); font-size: 13px; font-weight: 600;
    letter-spacing: 1px; text-transform: uppercase;
    cursor: pointer; transition: all .2s;
    box-shadow: 0 4px 24px rgba(245,160,0,.25);
  }
  .auth-submit:hover {
    box-shadow: 0 6px 32px rgba(245,160,0,.4); transform: translateY(-1px);
  }

  .auth-sep {
    display: flex; align-items: center; gap: 14px;
  }
  .auth-sep-line { flex: 1; height: 1px; background: var(--border); }
  .auth-sep-text {
    font-family: var(--mono); font-size: 9px; letter-spacing: 2px;
    color: var(--muted2);
  }

  .auth-oauth {
    display: flex; flex-direction: column; gap: 10px;
  }
  .auth-oauth-btn {
    width: 100%; padding: 12px 16px;
    background: var(--s1); border: 1px solid var(--border);
    border-radius: 10px; color: var(--text);
    font-family: var(--body); font-size: 12px; font-weight: 400;
    cursor: pointer; transition: all .2s;
    display: flex; align-items: center; justify-content: center; gap: 10px;
  }
  .auth-oauth-btn:hover {
    border-color: var(--muted); background: var(--s2);
  }

  .auth-toggle { text-align: center; }
  .auth-toggle-btn {
    background: transparent; border: none;
    color: var(--muted); font-family: var(--body); font-size: 12px;
    cursor: pointer; text-decoration: underline; text-underline-offset: 3px;
    transition: color .2s;
  }
  .auth-toggle-btn:hover { color: var(--amber); }

  /* ── Réglages Screen ── */
  .reglages-screen {
    width: 100%; max-width: 560px; margin: 0 auto;
    padding: 50px 40px 80px; box-sizing: border-box;
    display: flex; flex-direction: column; gap: 32px;
    animation: fadeup .35s ease;
  }
  .reglages-header { text-align: center; }
  .reglages-title {
    font-family: 'Bebas Neue', sans-serif; font-size: 36px; font-weight: 400;
    letter-spacing: 3px; color: var(--text); margin-bottom: 6px;
  }
  .reglages-subtitle {
    font-family: var(--body); font-size: 13px; font-weight: 300;
    color: var(--muted); letter-spacing: 0.3px;
  }
  .reglages-body {
    display: flex; flex-direction: column; gap: 20px;
  }
  .reglages-section {
    background: var(--s1); border: 1px solid var(--border);
    border-radius: 14px; padding: 20px; transition: border-color .2s;
  }
  .reglages-section.premium {
    border-color: rgba(245,176,86,0.2);
  }
  .reglages-section-label {
    font-family: var(--mono); font-size: 10px; letter-spacing: 2px;
    color: var(--amber); margin-bottom: 14px;
    display: flex; align-items: center; gap: 10px;
  }
  .reglages-section-line {
    flex: 1; height: 1px; background: var(--border);
  }
  .reglages-premium-badge {
    font-family: var(--mono); font-size: 8px; letter-spacing: 1.5px;
    background: var(--amber); color: #000;
    padding: 2px 7px; border-radius: 4px; font-weight: 600;
  }

  .reglages-avatar-row {
    display: flex; align-items: center; gap: 18px;
  }
  .reglages-avatar {
    width: 72px; height: 72px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, var(--amber), #e88855);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; position: relative; overflow: hidden;
    transition: transform .15s;
  }
  .reglages-avatar:hover { transform: scale(1.04); }
  .reglages-avatar-initial {
    font-family: var(--mono); font-size: 28px; font-weight: 600; color: #000;
  }
  .reglages-avatar-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.5); color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; opacity: 0; transition: opacity .2s;
    border-radius: 50%;
  }
  .reglages-avatar:hover .reglages-avatar-overlay { opacity: 1; }
  .reglages-avatar-hint {
    font-family: var(--body); font-size: 12px; font-weight: 300;
    color: var(--muted); line-height: 1.5;
  }

  .reglages-fields {
    display: flex; gap: 12px;
  }
  .reglages-field { flex: 1; }
  .reglages-label {
    font-family: var(--mono); font-size: 9px; letter-spacing: 1.5px;
    color: var(--muted); margin-bottom: 6px; display: block;
  }
  .reglages-input {
    width: 100%; background: var(--s2); border: 1px solid var(--border);
    border-radius: 8px; padding: 10px 14px;
    font-family: var(--body); font-size: 13px; font-weight: 300;
    color: var(--text); outline: none; transition: border-color .2s;
    box-sizing: border-box;
  }
  .reglages-input:focus { border-color: var(--amber); }
  .reglages-input::placeholder { color: #5a5a5e; }
  .reglages-input.disabled {
    opacity: 0.5; cursor: not-allowed; color: var(--muted);
  }

  .reglages-select {
    width: 100%; background: var(--s2); border: 1px solid var(--border);
    border-radius: 8px; padding: 11px 40px 11px 14px;
    font-family: var(--body); font-size: 13px; font-weight: 300;
    color: var(--text); outline: none; cursor: pointer;
    appearance: none; transition: border-color .2s;
  }
  .reglages-select:focus { border-color: var(--amber); }
  .reglages-select option { background: var(--s1); color: var(--text); }
  .reglages-select-arrow {
    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    pointer-events: none;
  }

  .reglages-lang-row {
    display: flex; gap: 10px;
  }
  .reglages-lang-btn {
    flex: 1; padding: 11px 14px; border-radius: 8px;
    background: var(--s2); border: 1px solid var(--border);
    color: var(--muted); font-family: var(--body); font-size: 13px;
    font-weight: 300; cursor: pointer; transition: all .2s;
    text-align: center;
  }
  .reglages-lang-btn:hover { border-color: var(--muted); color: var(--text); }
  .reglages-lang-btn.active {
    border-color: var(--amber); color: var(--amber);
    background: rgba(245,176,86,0.06);
  }

  .reglages-bank-hint {
    margin-top: 12px;
    font-family: var(--mono); font-size: 10px; color: var(--muted2);
    letter-spacing: 0.3px; line-height: 1.6;
  }

  .reglages-actions {
    display: flex; flex-direction: column; gap: 10px;
    margin-top: 4px;
  }
  .reglages-save {
    width: 100%; padding: 14px 16px; border-radius: 10px;
    background: linear-gradient(135deg, var(--amber), #e08a00);
    border: none; color: #000;
    font-family: var(--body); font-size: 13px; font-weight: 600;
    letter-spacing: 1px; text-transform: uppercase;
    cursor: pointer; transition: all .2s;
    box-shadow: 0 4px 24px rgba(245,160,0,.25);
  }
  .reglages-save:hover {
    box-shadow: 0 6px 32px rgba(245,160,0,.4); transform: translateY(-1px);
  }
  .reglages-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .reglages-signout {
    width: 100%; padding: 12px 16px; border-radius: 10px;
    background: transparent; border: 1px solid var(--border);
    color: var(--red); font-family: var(--mono); font-size: 11px;
    letter-spacing: 1px; text-transform: uppercase;
    cursor: pointer; transition: all .2s;
  }
  .reglages-signout:hover {
    border-color: var(--red); background: rgba(239,107,107,.06);
  }

  /* ══════════════════════════════════════════════════════ */
  /* FICHE SCREEN — responsive helpers                      */
  /* ══════════════════════════════════════════════════════ */
  .track-title-left {
    display: flex; align-items: center; gap: 10px; min-width: 0;
  }
  .versions-block {
    min-width: 0; max-width: 55%;
  }

  .listening-section { margin-top: 48px; margin-bottom: 8px; }
  .listening-box {
    background: rgba(245,176,86,.03);
    border: 1px solid #2a2a2e; border-radius: 12px;
    padding: 28px 32px;
    display: flex; flex-direction: column; gap: 24px;
  }

  .analyzing-state {
    max-width: 480px; margin: 60px auto 0; padding: 0 40px;
    display: flex; flex-direction: column; align-items: center; gap: 36px;
    animation: fadeup .3s ease;
  }

  .focus-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,.72);
    backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
    z-index: 200; display: flex; align-items: center; justify-content: center;
    padding: 40px; animation: fadein .2s ease;
  }
  .focus-container {
    width: 640px; max-width: calc(100vw - 160px); flex-shrink: 0;
  }
  .focus-panel {
    position: relative; width: 100%; max-height: 88vh;
    overflow-y: auto; background: #141416; border: 1px solid #2a2a2e;
    border-radius: 14px; padding: 32px 36px;
    box-shadow: 0 24px 60px rgba(0,0,0,.6), 0 0 0 1px rgba(245,176,86,.08);
    animation: popin .22s ease; box-sizing: border-box;
  }
  @keyframes popin { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: scale(1); } }

  .focus-arrow {
    position: fixed; top: 50%; transform: translateY(-50%);
    width: 44px; height: 44px; border-radius: 50%;
    background: var(--amber); border: 1px solid var(--amber);
    color: #0c0c0d; display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 22px; font-family: var(--body); line-height: 1;
    box-shadow: 0 6px 20px rgba(245,176,86,.35);
    transition: all .18s ease; z-index: 210;
  }
  .focus-arrow-left { left: calc(50% - 324px); }
  .focus-arrow-right { right: calc(50% - 324px); }
  .focus-arrow.disabled {
    background: rgba(20,20,22,.95); border-color: #2a2a2e;
    color: #5a5a5e; box-shadow: none; pointer-events: none; cursor: default;
  }

  /* ══════════════════════════════════════════════════════ */
  /* VERSIONS SCREEN (Mes titres)                           */
  /* ══════════════════════════════════════════════════════ */
  .versions-screen {
    width: 100%; max-width: 520px; margin: 0 auto;
    padding: 50px 40px 80px; box-sizing: border-box;
    display: flex; flex-direction: column; gap: 28px;
    animation: fadeup .35s ease;
  }
  .versions-s-header { text-align: center; }
  .versions-s-title {
    font-family: 'Bebas Neue', sans-serif; font-size: 36px; font-weight: 400;
    letter-spacing: 3px; color: var(--text); margin-bottom: 6px;
  }
  .versions-s-tagline {
    font-family: var(--mono); font-size: 11px; font-weight: 400;
    letter-spacing: 1px; color: var(--muted);
  }
  .versions-s-tagline-dot {
    color: var(--amber); margin: 0 2px;
  }

  .versions-s-empty {
    display: flex; flex-direction: column; align-items: center; gap: 14px;
    padding: 60px 0;
    font-family: var(--body); font-size: 14px; font-weight: 300;
    color: var(--muted); text-align: center;
  }

  .versions-s-list {
    display: flex; flex-direction: column; gap: 10px;
  }
  .versions-s-card {
    background: var(--s1); border: 1px solid var(--border);
    border-radius: 14px; overflow: hidden; transition: border-color .2s;
  }
  .versions-s-card.open { border-color: rgba(245,176,86,0.25); }

  .versions-s-card-head {
    display: flex; align-items: center; gap: 14px;
    padding: 16px 18px; cursor: pointer; transition: background .15s;
  }
  .versions-s-card-head:active { background: var(--s2); }

  .versions-s-card-score {
    width: 44px; height: 44px; border-radius: 50%;
    border: 2px solid; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bebas Neue', sans-serif; font-size: 20px; line-height: 1;
  }
  .versions-s-card-info { flex: 1; min-width: 0; }
  .versions-s-card-title {
    font-family: var(--body); font-size: 14px; font-weight: 400;
    color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .versions-s-card-meta {
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    letter-spacing: 0.5px; margin-top: 3px;
  }
  .versions-s-card-chev { color: var(--muted); flex-shrink: 0; }

  .versions-s-card-body {
    padding: 0 18px 16px;
    border-top: 1px solid var(--border);
    display: flex; flex-direction: column; gap: 6px;
    padding-top: 12px;
  }

  .versions-s-version {
    display: flex; flex-direction: column; gap: 8px;
    padding: 12px; border-radius: 10px;
    background: var(--s1); border: 1px solid var(--border);
    transition: background .15s;
  }
  .versions-s-version:hover { background: var(--s2); }

  .versions-s-version-row {
    display: flex; align-items: center; gap: 12px;
  }
  .versions-s-version-badge {
    font-family: var(--mono); font-size: 13px; font-weight: 500;
    min-width: 28px; text-align: center;
  }
  .versions-s-version-info { flex: 1; min-width: 0; }
  .versions-s-version-name {
    font-family: var(--body); font-size: 13px; font-weight: 300; color: var(--soft);
  }
  .versions-s-version-date {
    font-family: var(--mono); font-size: 9px; color: var(--muted2);
    letter-spacing: 0.5px; margin-top: 2px;
  }

  .versions-s-btn-icon {
    width: 30px; height: 30px; border-radius: 6px;
    background: transparent; border: 1px solid var(--border);
    color: var(--muted); cursor: pointer; transition: all .15s;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .versions-s-btn-icon:hover { color: var(--amber); border-color: var(--amber); }
  .versions-s-btn-icon.playing {
    color: var(--amber); border-color: var(--amber);
    background: rgba(245,176,86,0.1);
  }

  .versions-s-btn-fiche {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 10px 14px; border-radius: 8px;
    background: rgba(245,176,86,0.08); border: 1px solid rgba(245,176,86,0.25);
    color: var(--amber); font-family: var(--mono); font-size: 11px;
    letter-spacing: 0.8px; text-transform: uppercase; font-weight: 500;
    cursor: pointer; transition: all .2s;
  }
  .versions-s-btn-fiche:hover {
    background: rgba(245,176,86,0.15); border-color: var(--amber);
  }

  .versions-s-add {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-top: 6px; padding: 10px 14px; border-radius: 8px;
    border: 1px dashed rgba(245,176,86,0.35);
    background: transparent; color: var(--amber);
    font-family: var(--mono); font-size: 10px; letter-spacing: 1px;
    text-transform: uppercase; cursor: pointer; transition: all .2s;
  }
  .versions-s-add:hover {
    background: rgba(245,176,86,0.06); border-style: solid;
  }

  /* ══════════════════════════════════════════════════════ */
  /* MOBILE TOPBAR + AVATAR MENU                            */
  /* ══════════════════════════════════════════════════════ */
  .mobile-topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid var(--border);
    background: rgba(12,12,13,0.96);
    backdrop-filter: blur(14px);
    position: sticky; top: 0; z-index: 100;
  }

  .mobile-avatar-wrap {
    position: relative;
  }

  .mobile-avatar-btn {
    width: 36px; height: 36px;
    border-radius: 50%;
    padding: 0;
    background: linear-gradient(135deg, var(--amber), #e88855);
    border: 1px solid rgba(245,176,86,0.35);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    cursor: pointer;
    transition: box-shadow .2s, transform .15s;
  }
  .mobile-avatar-btn:hover {
    box-shadow: 0 0 0 2px rgba(245,176,86,0.3);
  }
  .mobile-avatar-btn.open {
    box-shadow: 0 0 0 2px var(--amber);
  }
  .mobile-avatar-btn img {
    width: 100%; height: 100%; object-fit: cover;
    border-radius: 50%;
    display: block;
  }
  .mobile-avatar-initial {
    font-family: var(--mono); font-weight: 600; font-size: 14px;
    color: #000;
    line-height: 1;
  }

  .mobile-avatar-backdrop {
    position: fixed; inset: 0; z-index: 110;
    background: transparent;
  }

  .mobile-avatar-popover {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    z-index: 120;
    min-width: 220px;
    background: var(--s1);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0,0,0,0.55);
    animation: fadeup .15s ease;
    display: flex; flex-direction: column;
  }

  .mobile-avatar-popover-user {
    padding: 12px 14px 10px;
    border-bottom: 1px solid var(--border);
  }
  .mobile-avatar-popover-who {
    font-family: var(--body); font-size: 13px; font-weight: 500; color: var(--text);
  }
  .mobile-avatar-popover-mail {
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    margin-top: 3px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .mobile-avatar-popover-item {
    display: flex; align-items: center; gap: 10px;
    width: 100%;
    padding: 12px 14px;
    background: transparent; border: none;
    border-bottom: 1px solid var(--border);
    font-family: var(--body); font-size: 13px; font-weight: 400;
    color: var(--text);
    cursor: pointer; text-align: left;
    transition: background .12s;
  }
  .mobile-avatar-popover-item:last-child { border-bottom: none; }
  .mobile-avatar-popover-item:hover,
  .mobile-avatar-popover-item:active {
    background: var(--s2);
  }
  .mobile-avatar-popover-item.danger {
    color: var(--red);
  }
  .mobile-avatar-popover-item .mobile-menu-icon {
    width: 18px; display: inline-flex; align-items: center; justify-content: center;
    color: inherit; opacity: 0.85;
  }

  /* ══════════════════════════════════════════════════════ */
  /* RESPONSIVE MOBILE                                      */
  /* ══════════════════════════════════════════════════════ */
  @media (max-width: 768px) {
    /* Layout */
    .app { grid-template-columns: 1fr; }
    .sidebar { display: none; }
    .player { padding-left: 24px; }
    body { padding-bottom: 68px; }

    /* Auth */
    .auth-screen { padding: 30px 20px; min-height: 100dvh; }
    .auth-card { max-width: 100%; gap: 20px; }
    .auth-brand { font-size: 36px; letter-spacing: 4px; }
    .auth-tagline { font-size: 9px; letter-spacing: 2px; gap: 8px; }
    .auth-input { padding: 14px 16px; font-size: 16px; border-radius: 12px; }
    .auth-submit { padding: 16px; font-size: 14px; border-radius: 12px; }
    .auth-oauth-btn { padding: 14px 16px; font-size: 13px; border-radius: 12px; }

    /* Réglages */
    .reglages-screen { padding: 30px 20px 120px; max-width: 100%; }
    .reglages-title { font-size: 30px; letter-spacing: 2px; }
    .reglages-section { padding: 16px; border-radius: 12px; }
    .reglages-fields { flex-direction: column; gap: 10px; }
    .reglages-input { font-size: 16px; padding: 12px 14px; }
    .reglages-select { font-size: 16px; padding: 13px 40px 13px 14px; }
    .reglages-avatar { width: 64px; height: 64px; }
    .reglages-avatar-initial { font-size: 24px; }
    .reglages-save { padding: 16px; font-size: 14px; }
    .reglages-signout { padding: 14px 16px; }

    /* Welcome Home */
    .welcome-home { padding: 30px 20px 120px; max-width: 100%; }
    .wh-greeting { font-size: 28px; letter-spacing: 2px; }
    .wh-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .wh-tracklist { max-width: 100%; }
    .wh-action { justify-content: center; padding: 12px 10px; font-size: 12px; }

    /* Versions Screen */
    .versions-screen { padding: 30px 20px 120px; max-width: 100%; }
    .versions-s-title { font-size: 28px; letter-spacing: 2px; }
    .versions-s-card-head { padding: 14px 14px; }
    .versions-s-card-score { width: 38px; height: 38px; font-size: 17px; }

    /* Input Screen */
    .input-screen { padding: 30px 20px 120px; max-width: 100%; }
    .input-title { font-size: 28px; letter-spacing: 2px; }
    .input-tagline { font-size: 10px; letter-spacing: 2px; gap: 8px; }
    .input-fields { flex-direction: column; gap: 10px; }
    .input-input { font-size: 16px; padding: 12px 14px; }
    .input-select { font-size: 16px; padding: 13px 40px 13px 14px; }
    .input-cta { padding: 16px; font-size: 14px; }
    .input-section { padding: 16px; }

    /* Page / Fiche */
    .page { padding: 24px 20px 120px; }
    .verdict { flex-direction: column; gap: 24px; text-align: center; }
    .score-ring { width: 110px; height: 110px; }
    .score-ring .big { font-size: 38px; }
    .score-ring .unit { font-size: 8px; letter-spacing: 0.5px; margin-top: 2px; }
    .verdict-text h1 { font-size: 26px; }
    .verdict-text p { font-size: 14px; }
    .timeline { padding: 12px 16px 10px; gap: 12px; flex-wrap: wrap; }
    .track-title { font-size: 20px; }
    .versions-block { padding: 8px; }
    .vchip { padding: 6px 10px; min-width: 50px; }

    /* Focus */
    .focus-content { padding: 24px 20px 100px; }
    .focus-content h2 { font-size: 28px; }
    .focus-bar { padding: 12px 16px; }
    .mt-grid { grid-template-columns: 1fr; }

    /* Timeline mobile */
    .timeline {
      flex-direction: column; align-items: flex-start; gap: 10px;
      padding: 12px 16px;
    }
    .track-title { font-size: 18px; }
    .versions-block { max-width: 100%; width: 100%; }
    .vchip { padding: 6px 8px; min-width: 46px; }
    .vchip .vname { font-size: 10px; }
    .vchip .vscore { font-size: 16px; }

    /* Verdict mobile */
    .verdict {
      flex-direction: column; gap: 24px; align-items: center; text-align: center;
      padding: 24px 0 40px;
    }
    .score-ring { width: 110px; height: 110px; }
    .score-ring .big { font-size: 38px; }
    .score-ring .unit { font-size: 8px; letter-spacing: 0.5px; margin-top: 2px; }
    .verdict-text h1 { font-size: 24px; }
    .verdict-text p { font-size: 13px; }

    /* Listening mobile */
    .listening-section { margin-top: 32px; }
    .listening-box { padding: 18px 16px; gap: 18px; border-radius: 10px; }

    /* Analyzing state mobile */
    .analyzing-state { margin-top: 30px; padding: 0 20px; gap: 28px; }

    /* Priority / plan d'action mobile */
    .priority { padding: 14px 14px; gap: 12px; }
    .pbadge { font-size: 8px; padding: 2px 5px; }
    .ptitle { font-size: 13px; }
    .parrow { display: none; }

    /* Diagnostic mobile */
    .diag-cat-head { padding: 12px 14px; gap: 10px; }
    .diag-item { gap: 12px; padding: 12px 0; }
    .diag-item .di-name { font-size: 13px; }
    .diag-item .di-detail { font-size: 12px; }

    /* Focus modal mobile */
    .focus-backdrop { padding: 16px; }
    .focus-container { width: 100%; max-width: 100%; }
    .focus-panel { padding: 20px 18px; border-radius: 12px; max-height: 85vh; }
    .focus-arrow { display: none; }
    .mt-grid { grid-template-columns: 1fr; }

    /* Chat mobile — doit passer au-dessus de la topbar (z-index: 100) */
    .chat-panel { width: 100%; max-width: 100vw; z-index: 150; bottom: 60px; }
    .chat-backdrop { z-index: 140; bottom: 60px; }
    .chat-head { padding: 14px 16px; }
    .chat-head .cclose {
      width: 36px; height: 36px; border-radius: 8px;
      background: var(--s2); border: 1px solid var(--border);
      font-size: 18px;
    }
    .chat-fab { bottom: 82px; right: 16px; width: 44px; height: 44px; }

    /* Player mobile */
    .player .pl-meta .pl-title { font-size: 12px; }
    .player .pl-meta { min-width: 100px; }
    .player .pl-wave { display: none; }
    .player .pl-time { font-size: 9px; min-width: 60px; }
    .player { gap: 12px; height: 60px; }
    .player .pl-btn { width: 34px; height: 34px; }
  }
`}</style>
    </>
  );
}
