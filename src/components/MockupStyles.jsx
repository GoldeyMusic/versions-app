/**
 * MockupStyles — CSS verbatim extrait de mockup-v3.html.
 * Source: /sessions/.../Versions/mockup-v3.html validé 2026-04-14.
 * Ne pas modifier sans mettre à jour la maquette en parallèle.
 */
export default function MockupStyles() {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>
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
    --serif: 'DM Sans', sans-serif;
    --body: 'DM Sans', sans-serif;
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
  .brand { display: flex; align-items: center; gap: 12px; font-family: 'Bebas Neue', sans-serif; font-size: 34px; letter-spacing: 3px; color: var(--text); line-height: 1; }
  .brand .accent { color: var(--amber); font-style: normal; }
  .user-pill {
    display: flex; align-items: center; gap: 14px;
    width: 100%; box-sizing: border-box;
    padding: 16px 16px;
    border-radius: 14px;
    background: var(--s1);
    border: 1px solid var(--border);
    cursor: pointer;
  }
  .user-pill > div:last-child {
    flex: 1; min-width: 0;
  }
  .user-pill .avatar {
    width: 52px; height: 52px; border-radius: 50%;
    background: linear-gradient(135deg, var(--amber), #e88855);
    display: flex; align-items: center; justify-content: center;
    color: #000; font-family: var(--mono); font-weight: 600; font-size: 20px;
    flex-shrink: 0;
  }
  .user-pill .who {
    font-size: 16px; color: var(--text); font-weight: 500;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .user-pill .plan { font-family: var(--mono); font-size: 11px; color: var(--muted); margin-top: 3px; }

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

  /* ── Recherche sidebar ── */
  .sidebar-search {
    position: relative;
    display: flex;
    align-items: center;
    padding: 0;
  }
  .sidebar-search .sidebar-search-icon {
    position: absolute;
    left: 10px;
    color: var(--muted);
    pointer-events: none;
    display: inline-flex;
  }
  .sidebar-search-input {
    flex: 1;
    width: 100%;
    box-sizing: border-box;
    background: var(--s1);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 7px 32px 7px 30px;
    font-family: var(--body);
    font-size: 13px;
    color: var(--text);
    outline: none;
    transition: border-color .15s ease, background .15s ease;
  }
  .sidebar-search-input::placeholder {
    color: var(--muted);
    font-size: 12px;
  }
  .sidebar-search-input:focus {
    border-color: var(--amber);
    background: var(--s2);
  }
  .sidebar-search-clear {
    position: absolute;
    right: 8px;
    background: transparent;
    border: none;
    color: var(--muted);
    cursor: pointer;
    padding: 4px;
    display: inline-flex;
    border-radius: 4px;
    transition: color .15s ease, background .15s ease;
  }
  .sidebar-search-clear:hover {
    color: var(--text);
    background: var(--s3);
  }
  .sidebar-search-empty {
    font-family: var(--body);
    font-size: 12px;
    color: var(--muted);
    padding: 12px 10px;
    font-style: italic;
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
  .track-title .it { color: var(--amber); }
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

  /* Badge type vocal — legacy (conservé pour rétrocompat, remplacé par .vocal-pill) */
  .vocal-badge {
    font-family: var(--mono);
    font-size: 9.5px;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.02);
    color: var(--textSoft, #b8bdc7);
    align-self: center;
    white-space: nowrap;
    line-height: 1;
  }
  .vocal-badge.final {
    border-color: rgba(30,207,176,.35);
    color: var(--teal);
    background: rgba(30,207,176,.06);
  }
  .vocal-badge.pending {
    border-color: rgba(245,166,35,.35);
    color: var(--amber);
    background: rgba(245,166,35,.06);
  }

  /* VocalTypePill — contrôle cliquable pour changer le type vocal après coup. */
  .vocal-pill-wrap {
    position: relative;
    display: inline-flex;
    align-self: center;
  }
  .vocal-pill {
    font-family: var(--mono);
    font-size: 9.5px;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.02);
    color: var(--textSoft, #b8bdc7);
    white-space: nowrap;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: border-color .15s ease, background .15s ease, color .15s ease;
  }
  .vocal-pill:hover:not(:disabled) { border-color: rgba(255,255,255,0.2); }
  .vocal-pill:disabled { opacity: .6; cursor: progress; }
  .vocal-pill .vp-caret { flex: 0 0 auto; opacity: .7; }
  .vocal-pill.instrumental_final {
    border-color: rgba(30,207,176,.35);
    color: var(--teal);
    background: rgba(30,207,176,.06);
  }
  .vocal-pill.instrumental_pending {
    border-color: rgba(245,166,35,.35);
    color: var(--amber);
    background: rgba(245,166,35,.06);
  }

  .vocal-pill-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    z-index: 40;
    min-width: 180px;
    background: var(--bg, #0e1018);
    border: 1px solid var(--border);
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .vocal-pill-menu .vpm-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 8px;
    background: transparent;
    border: 0;
    color: var(--text, #e8eaf0);
    font-family: var(--body);
    font-size: 13px;
    text-align: left;
    cursor: pointer;
    transition: background .12s ease;
  }
  .vocal-pill-menu .vpm-item:hover:not(:disabled) { background: rgba(255,255,255,0.05); }
  .vocal-pill-menu .vpm-item.active { color: var(--accent, #f5a623); }
  .vocal-pill-menu .vpm-item:disabled { opacity: .6; cursor: progress; }
  .vocal-pill-menu .vpm-check {
    font-size: 12px;
    opacity: .85;
  }

  /* ── VocalTypeSuggestionBanner ──
     Bandeau affiché sur la fiche quand Gemini a détecté de la voix sur une
     version alors que le titre est encore marqué "voix à venir". Registre
     visuel ambré (cohérent avec la pill instrumental_pending), cliquable
     au clavier, disparaît sans animation brutale. */
  .vocal-suggest {
    display: flex; align-items: flex-start; gap: 14px;
    background: rgba(245,166,35,0.06);
    border: 1px solid rgba(245,166,35,0.35);
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 16px;
    color: var(--text);
    animation: fadeup .25s ease;
  }
  .vocal-suggest .vs-icon {
    flex: 0 0 auto;
    color: var(--amber);
    display: inline-flex; align-items: center; justify-content: center;
    width: 32px; height: 32px;
    border-radius: 50%;
    background: rgba(245,166,35,0.1);
    margin-top: 1px;
  }
  .vocal-suggest .vs-body {
    flex: 1 1 auto; min-width: 0;
    display: flex; flex-direction: column; gap: 3px;
  }
  .vocal-suggest .vs-title {
    font-family: var(--body); font-size: 14px; font-weight: 500;
    color: var(--text);
    letter-spacing: 0.1px;
  }
  .vocal-suggest .vs-text {
    font-family: var(--body); font-size: 13px; font-weight: 300;
    color: var(--textSoft, #b8bdc7);
    line-height: 1.4;
  }
  .vocal-suggest .vs-actions {
    flex: 0 0 auto;
    display: flex; gap: 8px; align-items: center;
    margin-left: 8px;
  }
  .vocal-suggest .vs-btn {
    font-family: var(--body); font-size: 12.5px; font-weight: 500;
    border-radius: 8px;
    padding: 8px 14px;
    cursor: pointer;
    transition: background .15s ease, border-color .15s ease, color .15s ease, opacity .15s ease;
    white-space: nowrap;
  }
  .vocal-suggest .vs-btn:disabled { opacity: .6; cursor: progress; }
  .vocal-suggest .vs-btn-primary {
    background: var(--amber);
    border: 1px solid var(--amber);
    color: #1a1a1e;
  }
  .vocal-suggest .vs-btn-primary:hover:not(:disabled) {
    background: #f5c056;
    border-color: #f5c056;
  }
  .vocal-suggest .vs-btn-ghost {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--textSoft, #b8bdc7);
  }
  .vocal-suggest .vs-btn-ghost:hover:not(:disabled) {
    border-color: rgba(255,255,255,0.2);
    color: var(--text);
  }

  /* Mobile : pile les actions sous le texte pour éviter la compression. */
  @media (max-width: 768px) {
    .vocal-suggest { flex-wrap: wrap; }
    .vocal-suggest .vs-actions {
      margin-left: 0;
      width: 100%;
      justify-content: flex-start;
    }
  }

  .versions-block {
    display: flex; align-items: center; gap: 10px;
    /* Le push-droite est désormais porté par .fiche-head-actions
       (margin-left: auto). Fallback ici si les boutons n'apparaissent pas. */
    margin-left: auto;
    padding: 10px 10px 8px 14px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: rgba(255,255,255,0.02);
  }
  /* Quand les boutons sont présents, ils portent déjà le margin-left: auto —
     on neutralise celui de .versions-block pour que les deux soient collés. */
  .fiche-head-actions + .versions-block {
    margin-left: 0;
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

  /* ── PAGE PRINCIPALE ───────────────────────────
     Pleine largeur comme la home : on utilise tout l'espace
     entre la sidebar et le bord droit au lieu de cadenasser
     à 880px.
  */
  .page { max-width: none; width: 100%; padding: 20px 28px 80px; box-sizing: border-box; }

  /* Section 1 : Verdict */
  .verdict {
    display: flex; align-items: center; gap: 42px;
    padding: 20px 0 48px;
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
    display: inline-flex; align-items: flex-start; gap: 2px;
  }
  .score-ring .big-suffix {
    font-family: var(--mono); font-size: 13px; color: var(--muted);
    letter-spacing: 0.5px; font-weight: 400; margin-top: 6px;
  }
  .score-ring .unit { font-family: var(--mono); font-size: 10px; color: var(--muted); letter-spacing: 1px; margin-top: 4px; }
  .score-ring { cursor: help; outline: none; }
  .score-ring:focus-visible {
    box-shadow: 0 0 0 2px var(--amber);
    border-radius: 50%;
  }
  .score-ring .ring-help {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--s3);
    color: var(--muted);
    font-family: var(--mono);
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity .18s ease;
    pointer-events: none;
  }
  .score-ring:hover .ring-help,
  .score-ring.tip-open .ring-help { opacity: 0.8; }
  .score-ring .ring-tooltip {
    position: absolute;
    top: calc(100% + 10px);
    /* Aligné à gauche de l'anneau → le tooltip s'étend vers la DROITE,
       dans la zone de contenu, pour ne jamais aller derrière la sidebar
       (qui est position:sticky et crée son propre stacking context). */
    left: 0;
    transform: translateY(-4px);
    width: 300px;
    max-width: min(300px, calc(100vw - 40px));
    background: var(--s1);
    border: 1px solid var(--s4);
    border-radius: 10px;
    padding: 14px 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
    opacity: 0;
    pointer-events: none;
    transition: opacity .16s ease, transform .16s ease;
    /* z-index élevé pour passer au-dessus du stacking context de la
       sidebar sticky et des sections sticky de la fiche (timeline, etc.). */
    z-index: 200;
  }
  .score-ring:hover .ring-tooltip,
  .score-ring.tip-open .ring-tooltip {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
  .ring-tooltip .rt-head {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--body);
    font-size: 13px;
    color: var(--text);
    margin-bottom: 10px;
  }
  .ring-tooltip .rt-head .rt-dot {
    width: 8px; height: 8px; border-radius: 50%;
  }
  .ring-tooltip .rt-head strong { font-weight: 500; }
  .ring-tooltip .rt-head .rt-val {
    margin-left: auto;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--muted);
  }
  .ring-tooltip .rt-bands {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 10px;
  }
  .ring-tooltip .rt-band {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.3px;
    opacity: 0.6;
  }
  .ring-tooltip .rt-band.active { opacity: 1; color: var(--text); }
  .ring-tooltip .rt-band .dot {
    width: 6px; height: 6px; border-radius: 50%;
  }
  .ring-tooltip .rt-calib {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--amber);
    padding: 8px 10px;
    background: rgba(245, 176, 86, 0.08);
    border-radius: 6px;
    margin-bottom: 10px;
  }
  .ring-tooltip .rt-note {
    font-family: var(--body);
    font-size: 12px;
    line-height: 1.5;
    color: var(--soft);
    font-weight: 300;
  }

  .verdict-text { flex: 1; min-width: 0; }
  .verdict-text h1 {
    /* Même typo ET même taille que la tagline aléatoire affichée sur
       la Home desktop (.wh-tagline-mid .wh-tagline-text) : DM Sans
       italic 400, 28px. On garde la couleur d'accent ambre pour les
       passages entre *astérisques*. */
    font-family: var(--serif);
    font-style: italic;
    font-size: 28px;
    font-weight: 400;
    line-height: 1.3;
    letter-spacing: 0.3px;
    margin: 0 0 14px;
    max-width: 900px;
  }
  .verdict-text h1 em { color: var(--amber); font-weight: 500; font-style: italic; }
  .verdict-text p {
    font-family: var(--body);
    font-size: 15px;
    line-height: 1.7;
    color: var(--soft);
    font-weight: 300;
    margin: 0;
    max-width: 780px;
  }
  .verdict-text .analyzed-at {
    margin-top: 10px;
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.4px;
    color: var(--muted);
    text-transform: uppercase;
    opacity: 0.75;
  }

  /* ── ROW 1 : Verdict + Évolution (2 colonnes) ── */
  .row-verdict {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 32px;
    align-items: stretch;
    padding: 20px 0 40px;
  }
  .rv-left {
    display: flex; align-items: center; gap: 28px;
    min-width: 0;
  }
  .rv-left .verdict-text h1 { font-size: 28px; margin-bottom: 10px; }
  .rv-left .verdict-text p { font-size: 14px; }
  .rv-right {
    display: flex;
    min-width: 0;
  }

  /* Panneau Évolution (sparkline + 2 stats) */
  .evolution-panel {
    display: flex; flex-direction: column; gap: 14px;
    padding: 18px 20px;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: var(--s1);
    width: 100%;
  }
  .vr-title {
    font-family: var(--mono); font-size: 10px; letter-spacing: 2px;
    color: var(--muted); text-transform: uppercase;
  }
  .spark {
    display: flex; align-items: flex-end; justify-content: space-between;
    gap: 4px;
    height: 54px;
    padding: 0 2px;
  }
  .spark .bar {
    flex: 1;
    min-width: 6px;
    border-radius: 3px 3px 0 0;
    transition: opacity .15s;
  }
  .spark .bar.low  { background: #ef6b6b88; }
  .spark .bar.mid  { background: #f5b05688; }
  .spark .bar.high { background: #5dd0a088; }
  .spark .bar:last-child { opacity: 1; }
  .spark .bar:last-child.low  { background: var(--red); }
  .spark .bar:last-child.mid  { background: var(--amber); }
  .spark .bar:last-child.high { background: var(--green); }
  .spark-empty {
    flex: 1; display: flex; align-items: center; justify-content: center;
    color: var(--muted); font-family: var(--mono); font-size: 11px;
  }
  .evo-label {
    display: flex; justify-content: space-between; align-items: center;
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    gap: 8px;
  }
  .evo-label .delta { padding: 2px 8px; border-radius: 10px; background: var(--s3); color: var(--muted); }
  .evo-label .delta.up   { background: #5dd0a022; color: var(--green); }
  .evo-label .delta.down { background: #ef6b6b22; color: var(--red); }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 2px;
  }
  .stats-grid .stat {
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--s2);
    min-width: 0;
  }
  .stats-grid .stat .k {
    font-family: var(--mono); font-size: 9px; letter-spacing: 1.5px;
    color: var(--muted); text-transform: uppercase; margin-bottom: 4px;
  }
  .stats-grid .stat .v {
    font-family: var(--serif); font-size: 18px; color: var(--text);
    line-height: 1.1;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .stats-grid .stat .d {
    font-family: var(--mono); font-size: 10px; color: var(--muted); margin-top: 3px;
  }

  /* ── ROW 2 : Écoute qualitative (2 colonnes) ── */
  .row-qualitative {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin: 8px 0 48px;
  }
  .q-stack {
    display: flex; flex-direction: column; gap: 20px;
    min-width: 0;
  }
  .q-block {
    padding: 20px 22px;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: var(--s1);
    min-width: 0;
  }
  .q-block.impression {
    display: flex; flex-direction: column;
  }
  .q-title {
    display: flex; align-items: center; gap: 10px;
    font-family: var(--mono); font-size: 10px; letter-spacing: 2px;
    color: var(--muted); text-transform: uppercase;
    margin-bottom: 14px;
  }
  .q-title .dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--amber);
  }
  .q-block.forts .q-title .dot { background: var(--green); }
  .q-block.travail .q-title .dot { background: var(--red); }

  .q-block p {
    font-family: var(--body); font-size: 14px; line-height: 1.65;
    color: var(--soft); font-weight: 300;
    margin: 0 0 12px;
  }
  .q-block p:last-child { margin-bottom: 0; }
  .q-block ul {
    list-style: none; padding: 0; margin: 0;
    display: flex; flex-direction: column; gap: 10px;
  }
  .q-block ul li {
    font-family: var(--body); font-size: 14px; line-height: 1.55;
    color: var(--soft); font-weight: 300;
    padding-left: 16px; position: relative;
  }
  .q-block ul li::before {
    content: '';
    position: absolute; left: 0; top: 8px;
    width: 4px; height: 4px; border-radius: 50%;
    background: var(--muted2);
  }
  .q-block.forts ul li::before { background: var(--green); }
  .q-block.travail ul li::before { background: var(--red); }

  /* Collapsibles (Points forts / À travailler) — compact par défaut, clic pour déployer */
  .q-block.collapsible {
    padding: 0;
    overflow: hidden;
  }
  .q-block.collapsible .q-head {
    all: unset;
    display: flex; align-items: center; gap: 12px;
    width: 100%; box-sizing: border-box;
    padding: 14px 18px;
    cursor: pointer;
    transition: background .15s;
  }
  .q-block.collapsible .q-head:hover { background: var(--s2); }
  .q-block.collapsible .q-title { margin-bottom: 0; flex: 1; }
  .q-block.collapsible .q-count {
    font-family: var(--mono); font-size: 11px; color: var(--muted2);
    padding: 2px 8px; border-radius: 10px; background: var(--s3);
    min-width: 22px; text-align: center;
  }
  .q-block.forts.collapsible .q-count { background: #5dd0a022; color: var(--green); }
  .q-block.travail.collapsible .q-count { background: #ef6b6b22; color: var(--red); }
  .q-block.collapsible .q-chev {
    color: var(--muted);
    display: flex; align-items: center;
    transition: transform .18s ease;
  }
  .q-block.collapsible.open .q-chev { transform: rotate(90deg); }

  .q-block.collapsible .q-body {
    max-height: 0;
    overflow: hidden;
    transition: max-height .22s ease, padding .22s ease;
    padding: 0 18px;
  }
  .q-block.collapsible.open .q-body {
    max-height: 1000px;
    padding: 4px 18px 18px;
  }

  .subq-title {
    font-family: var(--mono); font-size: 9px; letter-spacing: 1.5px;
    color: var(--muted); text-transform: uppercase;
    margin: 8px 0 6px;
  }

  /* Impression toggle — Impression toujours visible, le reste ajouté en plus si expanded */
  .impression-summary { display: block; }
  .impression-full { display: none; }
  .row-qualitative.expanded .impression-full { display: block; }

  .impression-toggle {
    align-self: flex-start;
    margin-top: 12px;
    padding: 6px 12px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-family: var(--mono); font-size: 10px; letter-spacing: 1.5px;
    color: var(--muted); text-transform: uppercase;
    cursor: pointer;
    transition: border-color .15s, color .15s, background .15s;
  }
  .impression-toggle:hover {
    border-color: var(--amber);
    color: var(--amber);
    background: var(--amber-glow);
  }

  /* ── ROW 3 : Diagnostic (gauche) + Plan d'action (droite) ── */
  .row-two {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 32px;
    margin-bottom: 64px;
  }
  .row-two .col-diag,
  .row-two .col-plan {
    min-width: 0;
  }
  /* Dans la colonne plan, un item par ligne (plus de grid auto-fill) */
  .row-two .priority-list {
    grid-template-columns: 1fr;
    margin-bottom: 0;
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
  .section-head .plan-filter-toggle {
    all: unset;
    cursor: pointer;
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 1px;
    color: var(--muted);
    text-transform: uppercase;
    padding: 4px 10px;
    border: 1px solid var(--s4);
    border-radius: 999px;
    transition: color .15s ease, border-color .15s ease, background .15s ease;
  }
  .section-head .plan-filter-toggle:hover {
    color: var(--text);
    border-color: var(--muted);
  }
  .section-head .plan-filter-toggle.active {
    color: var(--amber);
    border-color: rgba(245, 176, 86, 0.5);
    background: rgba(245, 176, 86, 0.08);
  }

  /* Section 2 : chantiers
     En desktop large, on passe en grille auto-fill pour éviter
     que chaque ligne fasse 2000px de large pour 4 mots.
  */
  .priority-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
    gap: 10px; margin-bottom: 64px;
  }
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

  /* Plan d'action : item dépliable (accordéon, un seul ouvert à la fois) */
  .priority.collapsible {
    display: block;
    padding: 0;
    overflow: hidden;
    cursor: default;
  }
  .priority.collapsible .priority-head {
    display: flex; align-items: center; gap: 18px;
    padding: 20px 22px;
    cursor: pointer;
    transition: background .15s;
  }
  .priority.collapsible .priority-head:hover { background: var(--s2); }
  .priority.collapsible .pchev {
    color: var(--muted); flex-shrink: 0;
    display: flex; align-items: center;
    transition: transform .2s ease, color .15s;
  }
  .priority.collapsible .priority-head:hover .pchev { color: var(--amber); }
  .priority.collapsible.open .pchev { transform: rotate(90deg); color: var(--amber); }
  .priority.collapsible.open {
    border-color: #f5b05655;
    background: var(--s1);
  }

  .priority.collapsible .priority-body {
    max-height: 0;
    overflow: hidden;
    transition: max-height .25s ease;
    padding: 0 22px;
  }
  .priority.collapsible.open .priority-body {
    max-height: 2000px;
    padding: 4px 22px 22px;
    border-top: 1px solid var(--border);
  }
  .priority.collapsible .priority-body .daw-box { margin-top: 16px; margin-bottom: 14px; }
  .priority.collapsible .priority-body .mt-grid { margin-bottom: 14px; }
  .priority.collapsible .priority-body .linked-elements { margin-top: 14px; margin-bottom: 14px; }
  .priority.collapsible .priority-body .resolve-action { margin-top: 6px; }

  /* Pas d'effet hover/translateY quand la card est en mode collapsible (le hover ne joue plus que sur la head) */
  .priority.collapsible:hover { border-color: var(--border); background: var(--s1); transform: none; }
  .priority.collapsible.open:hover { border-color: #f5b05655; background: var(--s1); }

  /* ── Notes perso (1 par fiche) — placées dans col-plan, à la suite du Plan d'action ── */
  .notes-section {
    margin-top: 22px;
    padding: 0 0 16px;
  }
  .col-plan .notes-section { margin-top: 18px; }
  .notes-block {
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--s1);
    overflow: hidden;
    transition: border-color .18s ease;
  }
  .notes-block:hover { border-color: var(--s4); }
  .notes-block.open { border-color: var(--s4); }
  .notes-head {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    width: 100%;
    box-sizing: border-box;
    transition: background .15s ease;
  }
  .notes-head:hover { background: var(--s2); }
  .notes-head .notes-icon {
    color: var(--muted);
    display: flex;
    align-items: center;
  }
  .notes-head .notes-title {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text);
    white-space: nowrap;
  }
  .notes-head .notes-preview {
    flex: 1;
    min-width: 0;
    font-family: var(--body);
    font-size: 13px;
    color: var(--soft);
    font-weight: 300;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .notes-head .notes-status {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--amber);
    letter-spacing: 0.4px;
    margin-left: auto;
    opacity: 0.8;
  }
  .notes-head .notes-chev {
    color: var(--muted);
    display: inline-flex;
    transition: transform .2s ease;
  }
  .notes-block.open .notes-head .notes-chev { transform: rotate(90deg); }
  .notes-body {
    max-height: 0;
    overflow: hidden;
    transition: max-height .22s ease;
    padding: 0 18px;
  }
  .notes-block.open .notes-body {
    max-height: 500px;
    padding: 4px 18px 18px;
    border-top: 1px solid var(--border);
  }
  .notes-textarea {
    width: 100%;
    box-sizing: border-box;
    background: var(--s2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 14px;
    font-family: var(--body);
    font-size: 14px;
    line-height: 1.55;
    color: var(--text);
    resize: none;
    outline: none;
    transition: border-color .15s ease, background .15s ease;
    min-height: 60px;
  }
  .notes-textarea:focus {
    border-color: var(--amber);
    background: var(--s1);
  }
  .notes-textarea:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .notes-textarea::placeholder {
    color: var(--muted);
    opacity: 0.7;
  }

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
  /* Catégorie voix en mode 'voix à venir' : teintée pour se distinguer */
  .diag-cat.pending-voice .diag-cat-head .name {
    color: var(--amber);
  }
  .diag-cat.pending-voice .diag-cat-head .count {
    color: var(--amber);
    text-transform: uppercase; letter-spacing: 1px;
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
  /* Desktop : wavesurfer visible, scrubber mobile caché */
  .player .pl-wavesurfer { display: block; }
  .player .pl-scrubber { display: none; }
  .player .pl-time {
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    flex-shrink: 0; min-width: 78px; text-align: right;
  }
  .player .pl-time b { color: var(--text); font-weight: 500; }

  /* Volume : icône + popup slider vertical (réutilisable dans player + hero) */
  .pl-volume { position: relative; flex-shrink: 0; }
  .pl-volume-btn {
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 6px;
    color: var(--muted); background: transparent; border: none; cursor: pointer;
    transition: color .1s, background .1s;
  }
  .pl-volume-btn:hover { color: var(--text); background: var(--s1); }
  .pl-volume-pop {
    position: absolute;
    bottom: calc(100% + 8px);
    right: 0;
    background: var(--s1);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 10px;
    box-shadow: 0 8px 20px rgba(0,0,0,.3);
    z-index: 10;
  }
  .pl-volume-pop input[type="range"] {
    -webkit-appearance: slider-vertical;
    writing-mode: vertical-lr; direction: rtl;
    width: 18px; height: 90px;
    accent-color: var(--amber);
    cursor: pointer;
    background: transparent;
  }

  /* Laisser la place au player */
  body { padding-bottom: 68px; }
  .focus { bottom: 68px; }
  .sidebar { height: calc(100vh - 68px); }

  /* Sur la home (welcome), le BottomPlayer est masqué : on retire la réserve
     de 68px pour que la sidebar et le contenu descendent jusqu'en bas. */
  body.no-bottom-player { padding-bottom: 0; }
  body.no-bottom-player .focus { bottom: 0; }
  body.no-bottom-player .sidebar { height: 100vh; }

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
  .chat-head-actions {
    display: inline-flex; align-items: center; gap: 4px;
  }
  .chat-head .cclear {
    width: 26px; height: 26px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    color: var(--muted); cursor: pointer;
    background: transparent; border: 0;
    transition: color 0.12s ease, background 0.12s ease;
  }
  .chat-head .cclear:hover:not(:disabled) {
    color: var(--red-soft, #ef6b6b);
    background: rgba(239, 107, 107, 0.08);
  }
  .chat-head .cclear:disabled { opacity: 0.4; cursor: not-allowed; }
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

  /* ── Chat ancré en colonne droite (fiche desktop) ──
     Colonne fixe contre le bord droit de la fenêtre,
     entre la timeline sticky (haut) et le BottomPlayer (bas).
     La page réserve la largeur du chat via padding-right. */
  .fiche-layout {
    display: block;
    width: 100%;
    box-sizing: border-box;
    position: relative;
  }
  .fiche-layout.has-chat {
    padding-right: 416px;
  }
  .fiche-chat-side {
    position: fixed;
    top: 124px;           /* largement sous la timeline sticky (qui peut faire 90-110px) */
    right: 16px;
    bottom: 84px;         /* 68px player + 16px respiration */
    width: 384px;
    z-index: 8;
    display: flex;
  }
  .chat-panel.chat-panel-anchored {
    position: relative;
    inset: auto;
    top: auto;
    right: auto;
    bottom: auto;
    width: 100%;
    height: 100%;
    flex: 1;
    transform: none !important;
    transition: none;
    box-shadow: 0 12px 32px rgba(0,0,0,0.25);
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--s1);
    overflow: hidden;     /* pour que le border-radius clippe bien */
  }
  .chat-panel.chat-panel-anchored .chat-head { padding: 12px 16px; }
  .chat-panel.chat-panel-anchored .chat-body { padding: 16px 14px; }
  .chat-panel.chat-panel-anchored .chat-input { padding: 10px 12px 12px; }

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
  /* Variante primaire — CTA "Ajouter" unique, bien en évidence */
  .wh-action.wh-action-primary {
    background: var(--amber); border-color: var(--amber); color: #141416;
    padding: 14px 28px; font-size: 14px; font-weight: 500;
    letter-spacing: 0.3px;
    box-shadow: 0 8px 24px rgba(245,176,86,0.22);
  }
  .wh-action.wh-action-primary:hover {
    background: #ffc77a; border-color: #ffc77a; color: #141416;
    box-shadow: 0 10px 28px rgba(245,176,86,0.32);
    transform: translateY(-1px);
  }
  .wh-action.wh-action-primary .wh-action-icon {
    font-size: 18px; font-weight: 500;
  }

  /* ══════════════════════════════════════════════════════ */
  /* WELCOME HOME — variante DESKTOP (max-width 1200, 2 col) */
  /* ══════════════════════════════════════════════════════ */
  .welcome-home.wh-desktop {
    /* Plein écran : on colle à la sidebar à gauche et au bord droit
       pour une home immersive, sans grosse marge de chaque côté. */
    max-width: none;
    padding: 18px 24px 80px;
    gap: 20px;
  }
  /* Tagline éditoriale masquée sur desktop (trop d'air avant le hero) ;
     conservée sur mobile où elle reste utile. */
  .wh-desktop .wh-tagline-hero { display: none; }

  /* Tagline ré-insérée sous les 4 cadres de stats : padding vertical
     pour respirer, mêmes glyphes que la version haute. */
  .wh-tagline-mid {
    display: flex; align-items: center; justify-content: center;
    text-align: center;
    padding: 56px 24px 52px;
  }
  .wh-tagline-mid .wh-tagline-text {
    font-family: var(--serif); font-style: italic; font-size: 28px;
    line-height: 1.3; color: var(--text); max-width: 820px;
    font-weight: 400;
  }

  /* Bouton Ajouter flottant en haut à droite (desktop uniquement).
     Fixed pour rester visible quel que soit le scroll. */
  .wh-add-floating {
    position: fixed;
    top: 16px;
    right: 24px;
    z-index: 20;
  }
  .wh-desktop .wh-header { margin-bottom: 4px; align-items: flex-start; }
  .wh-desktop .wh-greeting { font-size: 28px; letter-spacing: 2.5px; text-align: left; }
  .wh-desktop .wh-actions { justify-content: flex-start; flex-wrap: wrap; }
  .wh-desktop .wh-tracklist { max-width: none; margin: 0; }
  .wh-desktop .wh-section-title { font-size: 22px; margin-bottom: 14px; }
  /* Colonne gauche sans cap : elle occupe toute la largeur disponible,
     les tips à droite s'étaleront moins en hauteur. */
  .wh-desktop .wh-col-left { max-width: none; }

  /* ── Tagline hero (desktop only) ─────────────────────────
     Grande baseline éditoriale en haut de la home. Tourne à
     chaque ouverture via pickTip() / HOME_TAGLINES.
  */
  .wh-tagline-hero {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 14px; text-align: center;
    padding: 96px 20px 84px;
  }
  .wh-tagline-salut {
    font-family: var(--mono); font-size: 11px; letter-spacing: 3px;
    color: var(--amber); text-transform: uppercase;
  }
  .wh-tagline-text {
    font-family: var(--serif); font-style: italic; font-size: 34px;
    line-height: 1.25; color: var(--text); max-width: 760px;
    font-weight: 400;
  }

  /* ── Hero "Reprends où tu étais" ── */
  .wh-hero {
    display: grid; grid-template-columns: 280px 1fr; gap: 22px; align-items: stretch;
    background: linear-gradient(180deg, rgba(245,176,86,0.04) 0%, rgba(245,176,86,0) 100%), var(--s1);
    border: 1px solid var(--border); border-radius: 16px;
    padding: 22px; position: relative; overflow: hidden;
  }
  .wh-hero-cover {
    aspect-ratio: 1/1; border-radius: 12px; overflow: hidden;
    background: linear-gradient(135deg, rgba(245,176,86,0.25), rgba(232,136,85,0.35));
    position: relative; display: flex; align-items: center; justify-content: center;
  }
  .wh-hero-cover.tint-0 { background: linear-gradient(135deg, #2a3850, #4a6ba8); }
  .wh-hero-cover.tint-1 { background: linear-gradient(135deg, #3b2a4a, #7a5aa8); }
  .wh-hero-cover.tint-2 { background: linear-gradient(135deg, #2a4a3d, #4aa88a); }
  .wh-hero-cover.tint-3 { background: linear-gradient(135deg, #4a2a30, #b85a4a); }
  .wh-hero-cover.tint-4 { background: linear-gradient(135deg, #4a4030, #b89055); }
  .wh-hero-cover.tint-5 { background: linear-gradient(135deg, #2a2a38, #4a4a5a); }
  .wh-hero-play {
    width: 64px; height: 64px; border-radius: 50%;
    background: rgba(255,255,255,0.92); border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; color: #0a0a0b;
    box-shadow: 0 8px 28px rgba(0,0,0,0.4);
    transition: transform .15s;
  }
  .wh-hero-play:hover { transform: scale(1.06); }
  .wh-hero-info {
    display: flex; flex-direction: column; justify-content: space-between;
    gap: 16px; min-width: 0;
  }
  .wh-hero-kicker {
    font-family: var(--mono); font-size: 10px; letter-spacing: 2px;
    text-transform: uppercase; color: var(--amber);
  }
  .wh-hero-title {
    font-family: var(--serif); font-size: 38px; font-weight: 400;
    line-height: 1.1; letter-spacing: 0.3px;
    margin: 4px 0 6px; color: var(--text);
  }
  .wh-hero-meta {
    font-family: var(--mono); font-size: 11px; color: var(--muted); letter-spacing: 0.5px;
  }
  .wh-hero-wave {
    width: 100%; height: 56px; margin: 8px 0;
    cursor: pointer; overflow: hidden;
  }
  .wh-hero-wave-row {
    display: flex; align-items: center; gap: 10px; margin: 8px 0;
  }
  .wh-hero-wave-row .wh-hero-wave {
    flex: 1; margin: 0;
  }
  .wh-hero-wave-row .pl-volume-btn {
    color: rgba(255,255,255,0.7);
  }
  .wh-hero-wave-row .pl-volume-btn:hover {
    color: #fff; background: rgba(255,255,255,0.08);
  }
  .wh-hero-wave-empty {
    background:
      repeating-linear-gradient(
        90deg,
        rgba(255,255,255,0.06) 0 2px,
        transparent 2px 5px
      );
    border-radius: 3px;
    cursor: default;
  }
  .wh-hero-bottom {
    display: flex; justify-content: space-between; align-items: center; gap: 16px;
  }
  .wh-hero-score { display: flex; align-items: baseline; gap: 8px; }
  .wh-hero-score .num {
    font-family: var(--serif); font-size: 44px; font-weight: 400;
    color: var(--amber); line-height: 1;
    display: inline-flex; align-items: baseline; gap: 4px;
  }
  .wh-hero-score .num-suffix {
    font-family: var(--mono); font-size: 10px; letter-spacing: 1.5px;
    color: var(--muted); text-transform: uppercase; font-weight: 400;
  }
  .wh-hero-score .lbl {
    font-family: var(--mono); font-size: 10px; letter-spacing: 1.5px;
    color: var(--muted); text-transform: uppercase;
  }
  .wh-hero-ctas { display: flex; gap: 10px; }
  .wh-btn {
    font-family: var(--mono); font-size: 11px; letter-spacing: 1.2px;
    text-transform: uppercase; padding: 10px 16px; border-radius: 8px;
    background: transparent; border: 1px solid var(--border); color: var(--text);
    cursor: pointer; transition: all .15s;
  }
  .wh-btn:hover { border-color: var(--amber); color: var(--amber); }
  .wh-btn-primary {
    background: var(--amber); border-color: var(--amber); color: #0a0a0b; font-weight: 500;
  }
  .wh-btn-primary:hover { background: #ffca7a; border-color: #ffca7a; color: #0a0a0b; }

  /* ── Stats row ── */
  .wh-stats {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
  }
  .wh-stat {
    background: var(--s1); border: 1px solid var(--border); border-radius: 12px;
    padding: 16px 18px; min-height: 110px;
    display: flex; flex-direction: column;
  }
  .wh-stat-label {
    font-family: var(--mono); font-size: 9px; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--muted);
  }
  .wh-stat-value {
    font-family: var(--serif); font-size: 34px; font-weight: 400;
    margin-top: 8px; line-height: 1; color: var(--text);
  }
  .wh-stat-hint {
    font-family: var(--mono); font-size: 10px; color: var(--amber);
    margin-top: auto; letter-spacing: 0.5px;
  }
  .wh-stat-spark { margin-top: auto; }

  /* ── 2-col layout ──
     Les deux colonnes sont fractionnaires pour rester équilibrées
     quand la fenêtre grandit : un léger avantage à la gauche
     (hero + stats + projets) mais la droite suit le resize au
     lieu de rester figée à 520px.
  */
  .wh-cols {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(380px, 1fr);
    gap: 22px;
    align-items: start;
  }
  .wh-col-left { display: flex; flex-direction: column; gap: 14px; min-width: 0; max-width: 560px; }
  .wh-col-right { display: flex; flex-direction: column; gap: 12px; }

  /* ── Editorial cards ── */
  .wh-card {
    background: var(--s1); border: 1px solid var(--border); border-radius: 12px;
    padding: 16px 18px;
  }
  .wh-card.amber {
    background: rgba(245,176,86,0.06); border-color: rgba(245,176,86,0.22);
  }
  .wh-card-kicker {
    font-family: var(--mono); font-size: 9px; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--amber); margin-bottom: 8px;
  }
  .wh-card-title {
    font-family: var(--body); font-size: 15px; font-weight: 500;
    margin-bottom: 8px; color: var(--text);
  }
  .wh-card-body {
    font-size: 13px; line-height: 1.55; color: var(--soft); font-weight: 300;
  }
  .wh-card-link {
    display: inline-block; margin-top: 10px;
    font-family: var(--mono); font-size: 10px; letter-spacing: 1.2px;
    text-transform: uppercase; color: var(--amber);
    background: transparent; border: none; padding: 0; cursor: pointer;
  }
  .wh-card-link:hover { color: #ffca7a; }

  /* ── Checklist ── */
  .wh-checklist { display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }
  .wh-check-item {
    display: flex; align-items: center; gap: 10px; padding: 6px 0;
    font-size: 13px;
  }
  .wh-check-box {
    width: 16px; height: 16px; border-radius: 4px;
    border: 1.5px solid var(--muted); flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; color: transparent;
  }
  .wh-check-item.done .wh-check-box {
    background: var(--amber); border-color: var(--amber); color: #0a0a0b;
  }
  .wh-check-item.done .wh-check-label {
    color: var(--muted); text-decoration: line-through;
  }
  .wh-check-label { color: var(--soft); }

  /* ── Onboarding hero (état vide) ── */
  .wh-onboarding {
    background: linear-gradient(135deg, rgba(245,176,86,0.10) 0%, rgba(245,176,86,0.02) 100%);
    border: 1px solid rgba(245,176,86,0.22);
    border-radius: 20px;
    padding: 36px 40px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center;
  }
  .wh-ob-welcome {
    font-family: var(--display); font-size: 46px; line-height: 1;
    letter-spacing: 2px; margin-bottom: 12px; color: var(--text);
  }
  .wh-ob-tagline {
    font-family: var(--serif); font-style: italic; font-size: 20px;
    color: var(--soft); margin-bottom: 22px;
  }
  .wh-ob-ctas { display: flex; gap: 10px; flex-wrap: wrap; }
  .wh-ob-checklist {
    background: var(--s1); border: 1px solid var(--border); border-radius: 14px;
    padding: 20px 22px;
  }
  .wh-ob-progress {
    height: 6px; background: rgba(255,255,255,0.06); border-radius: 4px;
    overflow: hidden; margin: 12px 0 14px;
  }
  .wh-ob-progress-fill {
    height: 100%; background: var(--amber); transition: width .3s;
  }

  /* ── Le layout hérite des règles mobile existantes via media query.  */
  /* ── Sur mobile on ne rend pas la variante desktop, donc pas de     */
  /* ── conflit à gérer.                                               */

  .wh-section-title {
    font-family: var(--serif); font-size: 28px; font-weight: 400;
    line-height: 1.15; letter-spacing: 0.3px;
    color: var(--text); margin-bottom: 18px;
  }
  .wh-section-title em {
    color: var(--amber); font-weight: 400; font-style: normal;
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
  .wh-picker-create {
    justify-content: flex-start; gap: 8px;
    margin-top: 4px; padding-top: 12px;
    border-top: 1px solid var(--border); border-radius: 0 0 8px 8px;
    color: var(--text);
  }
  .wh-picker-create .wh-action-icon {
    font-size: 14px; line-height: 1; color: var(--amber); font-weight: 500;
  }
  .wh-picker-create:hover { color: var(--amber); }

  /* ── Input Screen ── */
  .input-screen {
    width: 100%; max-width: 1200px; margin: 0 auto;
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

  /* Body en 2 colonnes sur desktop (fichier+type à gauche, metadonnees+CTA à droite).
     Par défaut : mono-colonne. La grille 2-col s'active via le media query ≥1100px. */
  .input-body {
    display: flex; flex-direction: column; gap: 16px;
    max-width: 520px; margin: 0 auto; width: 100%;
  }
  .input-col-main,
  .input-col-side {
    display: flex; flex-direction: column; gap: 16px;
    min-width: 0;
  }

  /* À partir de 1100px, on bascule le body en grille 2 colonnes.
     Ratio 1.2fr / 1fr : le fichier (colonne principale) a un peu plus de poids
     visuel que les métadonnées. align-items:start pour éviter que la colonne
     la plus courte ne soit étirée. */
  @media (min-width: 1100px) {
    .input-body {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 24px;
      align-items: start;
      max-width: 1100px;
    }
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

  /* Sélecteur type de titre (chanté / instrumental) */
  .input-vkind {
    display: flex; gap: 8px; flex-wrap: wrap;
  }
  .input-vpill {
    flex: 1 1 auto; min-width: 0;
    background: var(--s2); border: 1px solid var(--border);
    border-radius: 8px; padding: 11px 14px;
    font-family: var(--body); font-size: 13px; font-weight: 300;
    color: var(--textSoft, #b8bdc7);
    cursor: pointer; transition: all .15s;
    text-align: center;
  }
  .input-vpill:hover {
    border-color: rgba(245,166,35,.5);
    color: var(--text);
  }
  .input-vpill.on {
    background: rgba(245,166,35,.08);
    border-color: var(--amber);
    color: var(--text);
    font-weight: 400;
  }
  .input-vpill.small {
    font-size: 12px; padding: 9px 12px;
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
  /* Quand le menu 3-points est ouvert sur un projet fermé, on laisse le
     menu déborder hors de la carte (sinon overflow:hidden le tronque et
     on ne voit que la première option). */
  .wh-acc-item.menu-open {
    overflow: visible;
    position: relative;
    z-index: 5;
  }
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
  /* Quand une image custom est présente, on neutralise le gradient de fond
     (le style inline place l'image en background-image + cover). */
  .wh-acc-cover.has-image,
  .wh-hero-cover.has-image {
    background-color: #141416;
  }

  /* ── Menu 3-points sur la card projet (home) ───────────────
     Bouton discret en haut à droite de la carte, dropdown avec
     Renommer / Changer l'image / (Retirer l'image) / Supprimer. */
  .wh-acc-menu-btn {
    position: absolute;
    top: 10px; right: 10px;
    width: 28px; height: 28px; padding: 0;
    display: flex; align-items: center; justify-content: center;
    background: transparent; border: none; border-radius: 8px;
    color: var(--muted); cursor: pointer;
    transition: background .15s, color .15s;
    z-index: 3;
  }
  .wh-acc-menu-btn:hover {
    background: rgba(255,255,255,0.06);
    color: var(--text);
  }
  .wh-acc-menu {
    position: absolute;
    top: 40px; right: 10px;
    min-width: 180px;
    background: #141416; border: 1px solid #2a2a2e;
    border-radius: 10px; padding: 6px;
    box-shadow: 0 12px 32px rgba(0,0,0,0.55);
    z-index: 10;
    z-index: 10;
    animation: fadeup .15s ease;
  }
  .wh-acc-menu-item {
    display: block; width: 100%;
    padding: 8px 12px; text-align: left;
    background: transparent; border: none; border-radius: 6px;
    color: var(--soft); font-family: var(--body); font-size: 13px; font-weight: 300;
    cursor: pointer; transition: all .12s;
  }
  .wh-acc-menu-item:hover {
    background: rgba(245,176,86,0.08); color: var(--amber);
  }
  .wh-acc-menu-item.danger { color: #d06a6a; }
  .wh-acc-menu-item.danger:hover {
    background: rgba(208,106,106,0.10); color: #e87a7a;
  }
  .wh-acc-menu-sep {
    height: 1px; background: #2a2a2e; margin: 4px 2px;
  }

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
    border: 1.5px solid rgba(255,255,255,0.85);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    cursor: pointer;
    transition: box-shadow .2s, transform .15s;
  }
  .mobile-avatar-btn:hover {
    box-shadow: 0 0 0 2px rgba(255,255,255,0.35);
  }
  .mobile-avatar-btn.open {
    box-shadow: 0 0 0 2px #fff;
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
    /* gap: 12px ≈ wh-projects gap (10px) → rythme uniforme au scroll */
    /* animation: none — supprime le fadeup (opacity 0→1 sur 350ms) qui crée le flash */
    .welcome-home { padding: 24px 20px 80px; max-width: 100%; gap: 12px; animation: none; }
    .wh-greeting { font-size: 28px; letter-spacing: 2px; }
    /* Bouton Ajouter déplacé dans le menu avatar sur mobile */
    .wh-actions { display: none; }
    .wh-tracklist { max-width: 100%; }
    .wh-action { justify-content: center; padding: 12px 10px; font-size: 12px; }
    /* Espace interne tracklist : title margin réduit pour coller aux projets */
    .wh-section-title { margin-bottom: 10px; }
    /* Corps accordéon ouvert : padding-bottom réduit pour éviter le grand blanc */
    .wh-acc-body { padding: 0 14px 10px; }
    /* Tagline hero — version compacte mobile (padding + font réduits) */
    .wh-tagline-hero { padding: 32px 20px 24px; gap: 10px; }
    .wh-tagline-text { font-size: 22px; line-height: 1.3; max-width: 100%; }
    /* Cartes pédago : margin-top annulé — le gap du parent gère l'espacement */
    .welcome-home > .wh-card + .wh-card { margin-top: 0; }
    .welcome-home > .wh-card:first-of-type { margin-top: 0; }

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
    .score-ring .big-suffix { font-size: 10px; margin-top: 4px; }
    .score-ring .unit { font-size: 8px; letter-spacing: 0.5px; margin-top: 2px; }
    .verdict-text h1 { font-size: 26px; }
    .verdict-text p { font-size: 14px; }
    .timeline { padding: 12px 16px 10px; gap: 12px; }
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
    .score-ring .big-suffix { font-size: 10px; margin-top: 4px; }
    .score-ring .unit { font-size: 8px; letter-spacing: 0.5px; margin-top: 2px; }
    .verdict-text h1 { font-size: 24px; }
    .verdict-text p { font-size: 13px; }

    /* Nouveau layout fiche mobile → collapse en 1 colonne */
    .row-verdict {
      grid-template-columns: 1fr;
      gap: 20px;
      padding: 20px 0 28px;
    }
    .rv-left {
      flex-direction: column; align-items: center; text-align: center;
      gap: 18px;
    }
    .rv-left .verdict-text h1 { font-size: 24px; }
    .rv-left .verdict-text p { font-size: 13px; }
    .evolution-panel { padding: 14px 16px; gap: 12px; }
    .spark { height: 44px; }
    .stats-grid .stat .v { font-size: 16px; }

    .row-qualitative {
      grid-template-columns: 1fr;
      gap: 14px;
      margin: 4px 0 32px;
    }
    .q-stack { gap: 14px; }
    .q-block { padding: 16px 16px; border-radius: 12px; }
    .q-block p { font-size: 13px; }
    .q-block ul li { font-size: 13px; }

    .row-two {
      grid-template-columns: 1fr;
      gap: 28px;
      margin-bottom: 40px;
    }

    /* Listening mobile */
    .listening-section { margin-top: 32px; }
    .listening-box { padding: 18px 16px; gap: 18px; border-radius: 10px; }

    /* Analyzing state mobile */
    .analyzing-state { margin-top: 30px; padding: 0 20px; gap: 28px; }

    /* Priority / plan d'action mobile */
    .priority { padding: 14px 14px; gap: 12px; }
    .pbadge { font-size: 9px; padding: 2px 5px; }
    .ptitle { font-size: 13px; }
    .parrow { display: none; }

    /* Diagnostic mobile */
    .diag-cat-head { padding: 12px 14px; gap: 10px; }
    .diag-item { gap: 12px; padding: 12px 0; }
    .diag-item .di-name { font-size: 15px; }
    .diag-item .di-detail { font-size: 13px; }

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
    /* Mobile : wavesurfer caché, scrubber range visible (plus léger côté perf) */
    .player .pl-wavesurfer { display: none; }
    .player .pl-scrubber {
      display: block;
      flex: 1; min-width: 0;
      -webkit-appearance: none; appearance: none;
      height: 3px; border-radius: 2px;
      background: var(--muted2);
      cursor: pointer;
    }
    .player .pl-scrubber::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: 12px; height: 12px; border-radius: 50%;
      background: var(--amber); border: none;
      cursor: pointer;
    }
    .player .pl-scrubber::-moz-range-thumb {
      width: 12px; height: 12px; border-radius: 50%;
      background: var(--amber); border: none;
      cursor: pointer;
    }
    .player .pl-time { font-size: 9px; min-width: 60px; }
    .player { gap: 12px; height: 60px; }
    .player .pl-btn { width: 34px; height: 34px; }
  }

  /* ─────────────────────────────────────────────────────
     Fiche publique (lecture seule, route #/p/<token>)
     ─────────────────────────────────────────────────── */
  .public-fiche-shell {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    display: flex;
    flex-direction: column;
  }
  .public-fiche-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 28px;
    border-bottom: 1px solid var(--border);
    background: var(--s1);
    position: sticky; top: 0; z-index: 10;
  }
  .public-fiche-topbar .pft-left {
    display: flex; align-items: baseline; gap: 12px;
  }
  .public-fiche-topbar .pft-brand {
    font-family: var(--mono, "DM Sans", sans-serif);
    font-size: 14px; font-weight: 600; letter-spacing: 2px;
    color: var(--accent);
  }
  .public-fiche-topbar .pft-subbrand {
    font-size: 11px; color: var(--muted); letter-spacing: 1px;
    text-transform: uppercase;
  }
  .public-fiche-topbar .pft-cta {
    font-size: 12px; color: var(--text); text-decoration: none;
    padding: 8px 14px;
    border: 1px solid var(--border); border-radius: 8px;
    transition: border-color .15s ease, background .15s ease;
  }
  .public-fiche-topbar .pft-cta:hover {
    border-color: var(--accent); background: var(--s2);
  }

  .public-fiche-main {
    flex: 1;
    padding: 28px 0 64px;
  }
  .public-fiche-page {
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 28px;
    display: flex; flex-direction: column; gap: 28px;
  }
  .public-fiche-page .row-verdict { grid-template-columns: 1fr; }
  .public-fiche-page .rv-right { display: none; }

  .public-fiche-meta {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: var(--muted);
    margin-top: 10px;
  }
  .public-fiche-meta .pfm-track {
    color: var(--text); font-weight: 500;
  }
  .public-fiche-meta .pfm-sep { color: var(--border); }

  /* Plan d'action en lecture seule : pas de chevron, pas de bouton résolu, pas de .pcheck */
  .priority.read-only { cursor: default; }
  .priority.read-only .priority-head { cursor: default; }
  .priority.read-only .priority-head .pchev,
  .priority.read-only .priority-head .pcheck,
  .priority.read-only .resolve-action { display: none; }
  .priority.read-only .priority-body {
    max-height: none; padding: 4px 18px 18px;
  }

  /* Notes perso en lecture seule */
  .notes-block.read-only { cursor: default; }
  .notes-block.read-only .notes-head { cursor: default; }
  .notes-block.read-only .notes-head .notes-chev,
  .notes-block.read-only .notes-head .notes-status,
  .notes-block.read-only .notes-head .notes-preview { display: none; }
  .notes-body.read-only {
    max-height: none;
    padding: 4px 18px 18px;
    border-top: 1px solid var(--border);
  }
  .notes-readonly {
    font-family: var(--body);
    font-size: 14px; line-height: 1.6;
    color: var(--text);
    white-space: pre-wrap;
    background: var(--s2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 14px;
  }

  /* Loading + 404 */
  .public-fiche-loading {
    flex: 1; display: grid; place-items: center;
    color: var(--muted); font-size: 12px; letter-spacing: 2px;
    text-transform: uppercase;
  }
  .public-fiche-404 {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px 28px; text-align: center;
  }
  .public-fiche-404 .pfx-kicker {
    font-family: var(--mono, "DM Sans", sans-serif);
    font-size: 12px; letter-spacing: 3px;
    color: var(--accent); margin-bottom: 18px;
  }
  .public-fiche-404 h1 {
    font-size: 28px; font-weight: 500;
    margin: 0 0 12px;
  }
  .public-fiche-404 p {
    color: var(--muted); font-size: 14px;
    max-width: 460px; line-height: 1.6;
    margin: 0 0 24px;
  }
  .public-fiche-404 .pfx-home {
    font-size: 13px; color: var(--text); text-decoration: none;
    padding: 10px 18px;
    border: 1px solid var(--accent); border-radius: 8px;
    background: transparent;
    transition: background .15s ease;
  }
  .public-fiche-404 .pfx-home:hover {
    background: var(--s2);
  }

  .public-fiche-footer {
    padding: 20px 28px; border-top: 1px solid var(--border);
    text-align: center; font-size: 11px; color: var(--muted);
    letter-spacing: 0.5px;
  }

  @media (max-width: 720px) {
    .public-fiche-topbar { padding: 12px 16px; }
    .public-fiche-page { padding: 0 16px; }
    .public-fiche-main { padding: 20px 0 48px; }
  }

  /* Actions Partager / Exporter PDF dans le header de la fiche.
     Sibling direct de la timeline — poussé à droite par margin-left: auto
     pour atterrir juste avant le bloc des chips de versions. */
  .fiche-head-actions {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
    align-self: center;
  }
  .fiche-head-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(245, 176, 86, 0.06);
    border: 1px solid rgba(245, 176, 86, 0.28);
    border-radius: 8px;
    color: #e0c389;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    letter-spacing: 0.1px;
    line-height: 1;
    transition: background 0.12s ease, border-color 0.12s ease, transform 0.12s ease;
  }
  .fiche-head-btn:hover:not(:disabled) {
    background: rgba(245, 176, 86, 0.14);
    border-color: rgba(245, 176, 86, 0.55);
    color: #f5b056;
  }
  .fiche-head-btn:active:not(:disabled) {
    transform: translateY(1px);
  }
  .fiche-head-btn:disabled {
    opacity: 0.42;
    cursor: not-allowed;
  }
  .fiche-head-btn svg {
    flex-shrink: 0;
    opacity: 0.9;
  }

  /* En desktop étroit (< 1200px) on masque les labels pour garder
     juste les icônes — évite de comprimer le titre du morceau. */
  @media (max-width: 1199px) {
    .fiche-head-btn .fhb-label { display: none; }
    .fiche-head-btn { padding: 6px 8px; }
  }

  /* ── Header fiche mobile : grille 2 colonnes ──────────────────────
     Ligne 1 : titre + vocal-pill (col 1)  |  icônes share/export (col 2)
     Ligne 2 : barre de versions pleine largeur
     Inspiré SoundCloud / Spotify : actions en icônes discrètes,
     info de version portée par la chip active plutôt que par le vsub. */
  @media (max-width: 720px) {
    .timeline {
      display: grid;
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto;
      gap: 8px 10px;
      padding: 10px 16px;
      align-items: center;
    }
    /* Titre : col 1 ligne 1 */
    .track-title {
      grid-column: 1;
      grid-row: 1;
      font-size: 17px;
      gap: 8px;
      min-width: 0;
      align-items: center;
    }
    .track-title-left {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      flex-shrink: 1;
    }
    /* Sous-titre "VERSION ACTUELLE V2" masqué — redondant avec la chip active */
    .track-title .vsub { display: none; }
    /* Icônes share/export : col 2 ligne 1, sans label */
    .fiche-head-actions {
      grid-column: 2;
      grid-row: 1;
      margin-left: 0;
      width: auto;
      gap: 4px;
      align-self: center;
    }
    .fiche-head-btn .fhb-label { display: none; }
    .fiche-head-btn { padding: 7px 8px; }
    /* Versions : col 1-2 ligne 2, pleine largeur */
    .versions-block {
      grid-column: 1 / -1;
      grid-row: 2;
      width: 100%;
      max-width: 100%;
      padding: 8px 10px;
      margin-left: 0;
    }
    .vchip { padding: 6px 8px; min-width: 46px; }
    .vchip .vname { font-size: 10px; }
    .vchip .vscore { font-size: 16px; }
  }
`}</style>
    </>
  );
}
