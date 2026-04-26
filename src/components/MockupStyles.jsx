/**
 * MockupStyles — CSS aligné sur versions-dark-identity-mockup-v2.html.
 * Source: /sessions/.../Versions/versions-dark-identity-mockup-v2.html validé 2026-04-20.
 * Ne pas modifier sans mettre à jour la maquette en parallèle.
 */
export default function MockupStyles() {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500;1,9..144,600&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>
      <style>{`
  :root {
    /* Fond + surfaces — identité sombre v2 (cool, respirante).
       Le fond tire très légèrement vers un bleu électrique très sombre
       (B +10 vs R/G) — à peine perceptible, juste ce qu'il faut pour
       que la page ne soit pas strictement grise/noire. */
    --bg: #0a0b14;
    --s1: #111218;
    --s2: #16171e;
    --s3: #1d1e26;
    --card: #101118;
    --border: rgba(255,255,255,0.06);
    --border-strong: rgba(255,255,255,0.12);

    /* Textes */
    --text: #ededed;
    --soft: #c5c5c7;
    --muted: #8a8a90;
    --muted2: #5a5a5e;

    /* Accents — ambre principal, céruléen froid, violet en touche */
    --amber: #f5a623;
    --amber-dim: rgba(245,166,35,0.22);
    --amber-glow: rgba(245,166,35,0.16);
    --amber-line: rgba(245,166,35,0.35);

    --cerulean: #5cb8cc;
    --cerulean-glow: rgba(92,184,204,0.22);

    --violet: #a67ef5;
    --violet-glow: rgba(166,126,245,0.24);

    --mint: #8ee07a;
    --mint-glow: rgba(142,224,122,0.22);

    --red: #ff5d5d;
    --red-glow: rgba(255,93,93,0.22);

    /* Alias rétro-compat (conservés le temps de la migration) */
    --green: #8ee07a;
    --green-dim: rgba(142,224,122,0.33);
    --black: #000;

    /* Typographies */
    --serif: 'Fraunces', 'DM Sans', serif;
    --body: 'DM Sans', sans-serif;
    --mono: 'JetBrains Mono', monospace;
    --display: 'Bebas Neue', sans-serif;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: var(--bg); color: var(--text); font-family: var(--body); font-weight: 300; font-size: 14px; scroll-behavior: smooth; }
  a { color: inherit; text-decoration: none; }
  button { font-family: inherit; color: inherit; background: none; border: none; cursor: pointer; padding: 0; }

  /* ── Halo ambient (background de page) ──────────────────────
     Grand halo diffus positionné de façon asymétrique sur la page —
     jamais au centre, jamais pile dans un coin. Le halo est composé
     de 3 calques superposés qui crossfade (chacun avec sa couleur +
     position), pour donner une impression de couleur qui évolue
     lentement au cours de la session. Seuls transform et opacity
     sont animés (GPU-accelerated), blur calculé une seule fois. */
  .ambient-halo {
    position: fixed;
    inset: -15vh -15vw;
    pointer-events: none;
    z-index: 0;
    animation: ambient-drift 95s ease-in-out infinite alternate;
    will-change: transform;
  }
  @keyframes ambient-drift {
    0%   { transform: translate3d(0, 0, 0) scale(1); }
    100% { transform: translate3d(90px, -45px, 0) scale(1.05); }
  }
  .ambient-layer {
    position: absolute;
    inset: 0;
    filter: blur(60px);
    opacity: 0;
    animation: ambient-fade 90s ease-in-out infinite;
    will-change: opacity;
  }
  .ambient-halo.loaded .ambient-layer { animation-play-state: running; }
  /* Crossfade 3 calques : chacun passe 1/3 du cycle à plein, avec
     des offsets pour qu'il y ait toujours ~1 calque dominant et une
     transition douce. */
  .ambient-layer:nth-child(1) { animation-delay: 0s; }
  .ambient-layer:nth-child(2) { animation-delay: -30s; }
  .ambient-layer:nth-child(3) { animation-delay: -60s; }
  @keyframes ambient-fade {
    0%   { opacity: 0; }
    15%  { opacity: 1; }
    45%  { opacity: 1; }
    60%  { opacity: 0; }
    100% { opacity: 0; }
  }
  /* 5 variantes de couleur/position, appliquées sur chaque calque.
     Chaque halo est volontairement hors-axe (jamais 50/50, jamais
     pile en coin). */
  .ambient-layer[data-variant="0"] {
    background: radial-gradient(ellipse 900px 620px at 78% 18%,
      rgba(92,184,204,0.14), transparent 70%);
  }
  .ambient-layer[data-variant="1"] {
    background: radial-gradient(ellipse 720px 900px at 22% 72%,
      rgba(166,126,245,0.13), transparent 70%);
  }
  .ambient-layer[data-variant="2"] {
    background: radial-gradient(ellipse 820px 720px at 85% 78%,
      rgba(245,166,35,0.11), transparent 70%);
  }
  .ambient-layer[data-variant="3"] {
    background: radial-gradient(ellipse 860px 700px at 18% 28%,
      rgba(142,224,122,0.11), transparent 70%);
  }
  .ambient-layer[data-variant="4"] {
    background: radial-gradient(ellipse 780px 820px at 68% 12%,
      rgba(166,126,245,0.13), transparent 70%);
  }
  /* Fade-in global au premier load (avant que le crossfade prenne le relais). */
  .ambient-halo { opacity: 0; transition: opacity 1.8s ease; }
  .ambient-halo.loaded { opacity: 1; }
  /* Respect des préférences système : si l'utilisateur a désactivé
     les animations (reduced motion), on fige le halo et on garde
     uniquement le premier calque visible. */
  @media (prefers-reduced-motion: reduce) {
    .ambient-halo { animation: none; }
    .ambient-layer { animation: none; }
    .ambient-layer:nth-child(1) { opacity: 1; }
    .ambient-layer:nth-child(n+2) { opacity: 0; }
  }
  /* #root (racine React) doit passer explicitement au-dessus du halo —
     sans z-index, un frère en position fixed même avec z-index 0 peindrait
     par-dessus (règle CSS d'ordre de peinture des éléments positionnés).
     Ici on crée un stacking context sur #root pour que tout son arbre
     reste au-dessus du halo. */
  #root { position: relative; z-index: 1; }

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
  /* Logo VERSiONS — même typo que le slogan "Écoute, compare, décide."
     (DM Sans 700) pour unifier l'identité. Le "i" est en minuscule :
     son point remonte quasi à cap height, ce qui garde la silhouette
     compacte du mot sans alourdir la lecture. */
  .brand { display: flex; align-items: center; gap: 8px; font-family: var(--body); font-weight: 700; font-size: 27px; letter-spacing: -0.5px; color: var(--text); line-height: 1; }
  .brand .accent { color: var(--amber); font-style: normal; }
  /* Encadré utilisateur — même traitement que les cartes .wh-stat :
     fond var(--card), halo diffus en pseudo ::before et contenu
     remonté en z-index 1 pour passer au-dessus du halo. Overflow
     hidden pour que la tache floue ne déborde pas des coins arrondis. */
  /* Bloc utilisateur en haut de sidebar — version "à plat".
     Plus de cadre (pas de background, pas de border, pas de halo ambre) :
     juste l'avatar rond et le texte, posés directement sur la sidebar.
     Hover très discret pour signaler que c'est cliquable (→ Réglages). */
  .user-pill {
    display: flex; align-items: center; gap: 14px;
    width: 100%; box-sizing: border-box;
    padding: 6px 4px;
    border-radius: 10px;
    background: transparent;
    border: none;
    cursor: pointer;
    position: relative;
    transition: background .15s;
  }
  .user-pill:hover {
    background: rgba(255,255,255,0.025);
  }
  .user-pill > div:last-child {
    flex: 1; min-width: 0;
  }
  .user-pill .avatar {
    width: 44px; height: 44px; border-radius: 50%;
    /* Fond neutre sombre pour l'état "initiale" (pas de photo). */
    background: var(--s2);
    display: flex; align-items: center; justify-content: center;
    color: var(--amber); font-family: var(--mono); font-weight: 600; font-size: 18px;
    flex-shrink: 0;
    overflow: hidden;
  }
  .user-pill .who {
    font-size: 14px; color: var(--text); font-weight: 500;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .user-pill .plan { font-family: var(--mono); font-size: 11px; color: var(--muted); margin-top: 2px; letter-spacing: 0.5px; }

  /* Mini switch FR/EN à droite du nom utilisateur — raccourci depuis la
     sidebar. Posé à côté du bloc texte (flex-shrink: 0) : deux pill mono
     minuscules, la langue active en amber, l'inactive en muted.
     Le conteneur stoppe la propagation pour ne pas déclencher onGoReglages. */
  .sb-lang-switch {
    display: flex; gap: 2px;
    padding: 2px;
    background: rgba(255,255,255,0.035);
    border-radius: 999px;
    flex-shrink: 0;
  }
  .sb-lang-switch button {
    font-family: var(--mono); font-size: 10px; font-weight: 500;
    letter-spacing: 0.5px;
    padding: 4px 8px; border-radius: 999px;
    background: transparent; color: var(--muted);
    border: none; cursor: pointer;
    transition: color .15s, background .15s;
  }
  .sb-lang-switch button:hover { color: var(--soft); }
  .sb-lang-switch button.on {
    background: rgba(245,166,35,0.14);
    color: var(--amber);
  }

  .new-track {
    padding: 9px 12px; border-radius: 8px;
    border: 1px dashed #f5b05666; color: var(--amber);
    font-family: var(--mono); font-size: 12px; letter-spacing: 1px; text-transform: uppercase;
    text-align: center;
  }
  .section-label {
    font-family: var(--mono); font-size: 12px; letter-spacing: 1.5px;
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
    font-size: 14px;
    color: var(--text);
    outline: none;
    transition: border-color .15s ease, background .15s ease;
  }
  .sidebar-search-input::placeholder {
    color: var(--muted);
    font-size: 14px;
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
    font-size: 14px;
    color: var(--muted);
    padding: 12px 10px;
    font-style: italic;
  }
  .track-list { display: flex; flex-direction: column; gap: 1px; }
  .track {
    padding: 7px 10px; border-radius: 6px;
    font-family: var(--body); font-size: 14px; color: var(--soft);
    cursor: pointer;
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
  }
  .track:hover { background: var(--s1); }
  .track.active { background: var(--amber-glow); color: var(--amber); }
  .track.drag-over-above { border-top: 2px solid var(--amber); margin-top: -2px; }
  .track.drag-over-below { border-bottom: 2px solid var(--amber); margin-bottom: -2px; }
  .track .count { font-family: var(--mono); font-size: 12px; color: var(--muted); }

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
    font-family: var(--mono); font-size: 12px; letter-spacing: 0.5px; text-transform: uppercase;
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
    display: flex; align-items: center; gap: 12px;
  }
  .track-title .it { color: var(--amber); }
  .track-title .vsub {
    font-family: var(--mono);
    font-size: 12px;
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

  /* ─── Version dropdown (mobile) ─────────────────────────────────────
     Remplace le carousel de chips versions par un trigger compact
     qui ouvre un menu déroulant. Si ça prouve, on pourra le remonter
     côté desktop pour gagner de la place. */
  .version-dropdown { position: relative; display: inline-flex; }
  .version-dropdown-trigger {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 14px;
    background: transparent;
    border: 1px solid rgba(245,166,35,0.45);
    border-radius: 999px;
    color: var(--amber);
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    letter-spacing: 1.2px; text-transform: uppercase;
    line-height: 16px; cursor: pointer;
    transition: border-color .15s, background .15s;
    appearance: none; -webkit-appearance: none;
  }
  .version-dropdown-trigger b {
    font-weight: 500; color: var(--amber); letter-spacing: 1.2px;
  }
  .version-dropdown-trigger:hover,
  .version-dropdown-trigger.is-open {
    border-color: var(--amber);
    background: rgba(245,176,86,0.08);
  }
  .version-dropdown-trigger .vdd-chev {
    transition: transform .18s ease;
  }
  .version-dropdown-trigger.is-open .vdd-chev {
    transform: rotate(180deg);
  }
  .version-dropdown-menu {
    position: absolute; top: calc(100% + 6px); left: 0;
    min-width: 180px; max-width: 90vw;
    background: var(--s1);
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    padding: 6px;
    display: flex; flex-direction: column;
    gap: 2px; z-index: 40;
    animation: fadeup .18s ease;
  }
  .version-dropdown-menu .vdd-item {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; width: 100%;
    padding: 10px 12px; border-radius: 8px;
    background: transparent; border: none;
    color: var(--soft);
    font-family: var(--body); font-size: 14px; font-weight: 500;
    text-align: left; cursor: pointer;
    transition: background .12s, color .12s;
  }
  .version-dropdown-menu .vdd-item:hover {
    background: rgba(255,255,255,0.04);
    color: var(--text);
  }
  .version-dropdown-menu .vdd-item.is-active {
    background: rgba(245,176,86,0.08);
    color: var(--amber);
  }
  .version-dropdown-menu .vdd-item-score {
    font-family: var(--mono); font-size: 11px;
    letter-spacing: 1px; color: var(--muted);
  }
  .version-dropdown-menu .vdd-item.is-active .vdd-item-score {
    color: var(--amber);
  }
  .version-dropdown-menu .vdd-item-add {
    color: var(--muted);
    border-top: 1px dashed rgba(255,255,255,0.06);
    margin-top: 2px; padding-top: 12px;
  }
  .version-dropdown-menu .vdd-item-add:hover {
    color: var(--amber);
    background: rgba(245,176,86,0.05);
  }

  /* Delta (évolution vs version précédente) dans les items du dropdown.
     Vert par défaut (progression), rouge si .down (régression). */
  .version-dropdown-menu .vdd-item-meta {
    display: inline-flex; align-items: center; gap: 8px;
    flex-shrink: 0;
  }
  .version-dropdown-menu .vdd-item-delta {
    font-family: var(--mono); font-size: 10.5px;
    letter-spacing: 0.6px; color: var(--green, #8ee07a);
    white-space: nowrap;
  }
  .version-dropdown-menu .vdd-item-delta.down {
    color: var(--red, #ff5d5d);
  }

  /* Wrapper topbar desktop : [dropdown] + [+ Nouvelle version] sur la même ligne */
  .fiche-topbar-versions {
    display: inline-flex; align-items: center; gap: 10px;
    min-width: 0;
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
    /* correction optique : la baseline serif 28px fait apparaître la pill plus haut que le centre visuel du titre */
    transform: translateY(3px);
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
    font-size: 14px;
    text-align: left;
    cursor: pointer;
    transition: background .12s ease;
  }
  .vocal-pill-menu .vpm-item:hover:not(:disabled) { background: rgba(255,255,255,0.05); }
  .vocal-pill-menu .vpm-item.active { color: var(--accent, #f5a623); }
  .vocal-pill-menu .vpm-item:disabled { opacity: .6; cursor: progress; }
  .vocal-pill-menu .vpm-check {
    font-size: 14px;
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
    font-family: var(--body); font-size: 14px; font-weight: 300;
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
    border-radius: 999px;
    padding: 8px 16px;
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
    font-family: var(--mono); font-size: 12px; letter-spacing: 2px;
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
    /* Drop-shadow seule, pas de halo 1px qui double la bordure. */
    box-shadow: 0 4px 14px rgba(245,176,86,0.08);
  }
  .vchip .vname {
    font-family: var(--mono); font-size: 12px; color: var(--soft); letter-spacing: 1px;
    font-weight: 500;
  }
  .vchip.active .vname { color: var(--amber); }
  .vchip .vscore {
    font-family: var(--serif); font-size: 20px; color: var(--text);
    margin-top: 2px; line-height: 1;
  }
  .vchip.active .vscore { color: var(--amber); }
  .vchip .vscore .pct {
    font-family: var(--mono); font-size: 12px; color: var(--muted); margin-left: 2px;
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
    color: var(--muted2); font-size: 12px; padding: 0 2px;
    font-family: var(--mono); align-self: center;
  }
  .vdelta {
    font-family: var(--mono);
    font-size: 12px;
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

  /* ══════════════════════════════════════════════════════════════════ */
  /* FICHE TOPBAR v2 (desktop — mobile conserve l'ancien rendu)         */
  /* ══════════════════════════════════════════════════════════════════ */
  .fiche-topbar-wrap {
    position: sticky; top: 0; z-index: 10;
    /* Topbar totalement invisible : ni fond solide, ni backdrop-filter.
       Le fond ambient de la page (halos) remonte jusqu'en haut, comme
       sur la Home. Lorsqu'on scrolle, le contenu passe derrière la topbar
       sans flou ni démarcation. Si le recouvrement visuel devient gênant,
       on ajoutera un gradient mask plutôt qu'un fond opaque. */
    background: transparent;
    /* padding-top 22px = meme que sidebar. Combine avec line-height: 1 sur
       .fiche-topbar-title (voir plus bas), la baseline du titre s'aligne par
       construction avec celle du logo VERSIONS de la sidebar. */
    padding: 22px 40px 0;
    display: flex; flex-direction: column;
  }
  .fiche-topbar-wrap .fiche-topbar {
    display: flex; align-items: center; gap: 14px;
    /* Boite de 38px = meme hauteur que l'image logo VERSIONS de la sidebar.
       Combine avec padding-top 22px du wrap, le centre vertical (y=41) matche
       le centre du logo sidebar par construction. */
    min-height: 38px;
    padding-bottom: 16px;
    /* Pas de border-bottom : on veut que la topbar se fonde visuellement
       avec la page (pas de "barre header" délimitée). */
  }
  .fiche-topbar-wrap .fiche-back {
    background: transparent; border: 1px solid var(--border);
    color: var(--soft); cursor: pointer;
    width: 34px; height: 34px; border-radius: 8px;
    display: inline-flex; align-items: center; justify-content: center;
    padding: 0; flex-shrink: 0;
    transition: background .15s, color .15s, border-color .15s;
  }
  .fiche-topbar-wrap .fiche-back:hover {
    background: var(--s1); color: var(--text); border-color: rgba(255,255,255,0.18);
  }
  .fiche-topbar-title {
    font-family: var(--body); font-weight: 700;
    font-size: 24px; letter-spacing: -0.8px;
    line-height: 1.15;
    color: var(--text);
    display: flex; align-items: center; gap: 12px;
    min-width: 0;
  }
  .fiche-topbar-title em {
    /* Même typo/poids que le reste du titre — seul l'accent amber change.
       (Auparavant en serif italic amber comme la maquette "Comme un rêve".) */
    font-family: inherit;
    font-style: normal;
    font-weight: inherit;
    color: var(--amber);
  }
  .fiche-topbar-title .fiche-title-text {
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 32ch;
  }
  /* La VocalTypePill doit s'aligner en pill mono dans la topbar v2 */
  .fiche-topbar-title .vocal-pill-wrap { transform: none; align-self: center; }
  .fiche-topbar-title .vocal-pill {
    font-size: 9.5px;
    letter-spacing: 1.5px;
    padding: 4px 10px;
  }

  .fiche-topbar-meta {
    margin-left: auto;
    display: flex; flex-direction: column; align-items: flex-end;
    gap: 2px;
    line-height: 1.2;
  }
  .fiche-topbar-meta .ver-label {
    font-family: var(--mono); font-size: 9.5px; letter-spacing: 1.5px;
    color: var(--muted); text-transform: uppercase;
    white-space: pre-line;
    text-align: right;
    line-height: 1.35;
  }
  .fiche-topbar-meta .ver-label b { color: var(--green); font-weight: 500; }
  .fiche-topbar-meta .ver-label b.pending { color: var(--amber); }
  .fiche-topbar-meta .ver-label b.other { color: var(--soft); }
  .fiche-topbar-meta .ver-name {
    font-size: 13px; font-weight: 600; color: var(--soft);
  }

  .fiche-topbar-actions {
    display: flex; gap: 6px;
  }
  .fiche-topbar-actions .btn-ic {
    width: 34px; height: 34px; border-radius: 8px;
    border: 1px solid var(--border); background: transparent;
    color: var(--soft); cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center;
    padding: 0;
    transition: background .15s, color .15s, border-color .15s;
  }
  .fiche-topbar-actions .btn-ic:hover:not(:disabled) {
    background: var(--s1); color: var(--text);
    border-color: rgba(255,255,255,0.18);
  }
  .fiche-topbar-actions .btn-ic:disabled { opacity: .5; cursor: not-allowed; }
  .fiche-topbar-actions .btn-ic svg { width: 16px; height: 16px; }

  /* Versions timeline (chips v2) — row sous la topbar */
  .fiche-topbar-wrap .versions-row-wrap {
    position: relative;
  }

  /* Rangée de chips de versions rétablie (2026-04-23). */

  /* Variante inline (2026-04-23) : chips sur la même ligne que le titre,
     à droite de « Your Song Chanté », avant le badge et les actions.
     Conteneur en flex : flèche gauche | zone scroll (max 2 chips) | flèche droite.
     Pas de flex-grow : le badge/actions sont poussés à droite par margin-left: auto. */
  .fiche-topbar-wrap .versions-row-wrap.versions-row-inline {
    flex: 0 0 auto;
    min-width: 0;
    margin-left: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .fiche-topbar-wrap .versions-row-wrap.versions-row-inline .versions-row-v2 {
    padding: 0;
    flex: 0 0 auto;
    scroll-behavior: smooth;
    gap: 7px;
  }
  /* Carrousel activé uniquement à partir de 3 versions : contrainte de largeur
     (2 chips max visibles) + largeur fixe par chip pour un cap propre.
     En dessous (1 ou 2 versions) les chips prennent leur largeur naturelle
     et aucun scroll/flèches n'apparaît. */
  .fiche-topbar-wrap .versions-row-wrap.versions-row-inline.has-carousel .versions-row-v2 {
    width: 159px;       /* 2*76 + 1*7 (gap) = pile 2 chips visibles */
    max-width: 159px;
  }
  .fiche-topbar-wrap .versions-row-wrap.versions-row-inline.has-carousel .versions-row-v2 .vchip {
    flex: 0 0 76px;
    width: 76px;
    justify-content: center;
  }
  /* En mode inline, les flèches remplacent les fades comme indicateur d'overflow. */
  .fiche-topbar-wrap .versions-row-wrap.versions-row-inline .versions-row-fade {
    display: none;
  }

  /* Flèches de navigation carrousel — toujours cliquables (le clamp du scroll
     gère les bords). L'état .is-edge atténue visuellement au lieu de bloquer. */
  .fiche-topbar-wrap .vchip-arrow {
    flex-shrink: 0;
    width: 22px; height: 22px;
    border-radius: 50%;
    border: 1px solid var(--border, rgba(255,255,255,0.1));
    background: transparent;
    color: var(--soft, rgba(255,255,255,0.72));
    cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center;
    padding: 0;
    transition: background .15s, border-color .15s, color .15s, opacity .15s;
  }
  .fiche-topbar-wrap .vchip-arrow:hover {
    background: rgba(255,255,255,0.06);
    border-color: rgba(245,166,35,0.45);
    color: var(--amber);
  }
  .fiche-topbar-wrap .vchip-arrow.is-edge {
    opacity: 0.35;
  }
  .fiche-topbar-wrap .vchip-arrow.is-edge:hover {
    opacity: 0.6;
  }
  .fiche-topbar-wrap .vchip-arrow svg { width: 11px; height: 11px; }

  /* TEMP (2026-04-22) — resserre les espaces verticaux desktop v2 pour remonter
     le contenu et l'aligner avec la colonne chat. Réduit en cascade :
       - padding top de la topbar
       - padding-bottom de la ligne topbar
       - padding top du grid .page
       - margin top de la pochette (col-cover-wrap)
     + aligne le panneau chat sur le haut du contenu (top: 58px au lieu de 72px).
     Pour réactiver l'espacement d'origine : supprimer ce bloc. */
  .fiche-v2 .fiche-topbar-wrap { padding-top: 8px !important; }
  .fiche-v2 .fiche-topbar-wrap .fiche-topbar { padding-bottom: 8px !important; }
  .fiche-v2 .page { padding-top: 8px !important; }
  .fiche-v2 .col-cover-wrap { margin-top: 0 !important; }
  /* (override top: X supprimé — remplacé par l'alignement structurel grid+sticky plus bas) */
  .fiche-topbar-wrap .versions-row-v2 {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 0 12px;
    overflow-x: auto;
    scrollbar-width: none; -ms-overflow-style: none;
  }
  .fiche-topbar-wrap .versions-row-v2::-webkit-scrollbar { display: none; }
  .fiche-topbar-wrap .versions-row-fade {
    position: absolute; top: 0; bottom: 0; width: 40px;
    pointer-events: none; z-index: 2;
  }
  .fiche-topbar-wrap .versions-row-fade.left {
    left: 0;
    background: linear-gradient(90deg, rgba(12,12,13,0.92), transparent);
  }
  .fiche-topbar-wrap .versions-row-fade.right {
    right: 0;
    background: linear-gradient(-90deg, rgba(12,12,13,0.92), transparent);
  }

  /* VChip v2 (row layout) — scopé à .versions-row-v2 pour préserver le mobile */
  .versions-row-v2 .vchip {
    flex-shrink: 0;
    padding: 5px 10px;
    border-radius: 999px;
    background: var(--card);
    border: 1px solid var(--border);
    display: flex; flex-direction: row; align-items: center; gap: 7px;
    min-width: 0;
  }
  .versions-row-v2 .vchip:hover {
    background: var(--card);
    border-color: rgba(245,166,35,0.3);
  }
  .versions-row-v2 .vchip.active {
    border-color: var(--amber);
    background: rgba(245,166,35,0.06);
    /* Glow uniquement (pas de halo ambre 1px qui se faisait rogner quand la
       chip active atteignait un bord du scroll container). La bordure ambre
       suffit à marquer l'état actif. */
    box-shadow: 0 0 16px rgba(245,166,35,0.25);
  }
  .versions-row-v2 .vchip .vname {
    font-family: var(--mono); font-size: 9px; letter-spacing: 1px;
    color: var(--muted); text-transform: uppercase;
    margin-top: 0;
    font-weight: 500;
  }
  .versions-row-v2 .vchip.active .vname { color: var(--amber); }
  .versions-row-v2 .vchip .vscore {
    font-family: var(--body); font-weight: 600; font-size: 12.5px;
    letter-spacing: -0.2px;
    line-height: 1;
    margin-top: 0;
    color: var(--text);
  }
  .versions-row-v2 .vchip.active .vscore { color: var(--amber); }
  .versions-row-v2 .vchip .vscore.good { color: var(--green); }
  .versions-row-v2 .vchip .vscore.mid { color: var(--amber); }
  .versions-row-v2 .vchip .vscore.low { color: var(--red); }
  .versions-row-v2 .vchip .vscore .pct { display: none; }
  .versions-row-v2 .vchip .vdelta-inline {
    font-family: var(--mono); font-size: 9px; letter-spacing: 0.4px;
    background: transparent; padding: 0;
    color: var(--green);
  }
  .versions-row-v2 .vchip .vdelta-inline.down { color: var(--red); }
  /* Le badge "EN COURS" de la v1 est remplacé par un simple contour amber */
  .versions-row-v2 .vchip.current-badge::after { display: none; }

  .vchip-new {
    flex-shrink: 0;
    padding: 5px 11px;
    border-radius: 999px;
    background: transparent;
    border: 1px dashed rgba(245,166,35,0.6);
    color: var(--amber);
    cursor: pointer;
    font-family: var(--mono); font-size: 9.5px; letter-spacing: 0.9px;
    text-transform: uppercase; font-weight: 500;
    display: inline-flex; align-items: center; gap: 5px;
    transition: background .15s, border-color .15s;
  }
  .vchip-new:hover {
    background: rgba(245,166,35,0.08);
    border-color: var(--amber);
  }

  /* Label « version active » à côté du bouton + Nouvelle version :
     même style typographique et chromatique que l'eyebrow « Note de version »
     (mono muted white + dot cerulean à glow). Cohérence visuelle entre les
     repères discrets de l'app. */
  .fiche-topbar-wrap .versions-row-wrap.versions-row-inline .active-version-label {
    flex-shrink: 1;
    min-width: 0;
    margin-left: 4px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 1.1px;
    text-transform: uppercase;
    color: var(--muted, rgba(255,255,255,0.5));
    max-width: 160px;
  }
  .fiche-topbar-wrap .versions-row-wrap.versions-row-inline .active-version-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--muted, rgba(255,255,255,0.5));
    flex-shrink: 0;
  }
  .fiche-topbar-wrap .versions-row-wrap.versions-row-inline .active-version-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ══════════════════════════════════════════════════════════════════ */
  /* FICHE v2 — polish des panneaux (glows + eyebrows)                   */
  /* Appliqué via le wrapper .fiche-v2 ; n'impacte pas le layout mobile. */
  /* ══════════════════════════════════════════════════════════════════ */

  /* ══════════════════════════════════════════════════════════════════════
     FICHE v2 — LAYOUT 2 COLONNES INDÉPENDANTES + bandeau qualitative en bas
     Col 1 (.f2-col-main) : Score global + Diagnostic
     Col 2 (.f2-col-side) : Plan d'action + Notes
     Pleine largeur sous les colonnes : Écoute qualitative (.row-qualitative)
     Chaque colonne est un flex column → pas de rangée partagée, pas de gap.
     Le chat reste ancré en aside (3ᵉ colonne via .fiche-layout.has-chat).
     ══════════════════════════════════════════════════════════════════════ */
  .fiche-v2 .page {
    /* Grid 6 colonnes pour permettre 1/3-2/3 en row 2 (pochette/score)
       et 1/2-1/2 en row 3 (diagnostic/plan) sur le meme grid. */
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    grid-auto-flow: dense;
    column-gap: 20px;
    row-gap: 18px;
    align-items: start;
    padding: 20px 28px 80px;
  }
  /* f2-col-* deviennent transparents → leurs enfants montent au niveau .page
     pour permettre le placement explicite en grid (row/col alignés). */
  .fiche-v2 .page > .f2-col-main,
  .fiche-v2 .page > .f2-col-side { display: contents; }
  .fiche-v2 .page .vocal-suggest        { grid-column: 1 / -1; grid-row: 1; }
  /* Rangee 2 : le grand cadre score global (.row-verdict) prend toute la largeur,
     la pochette se superpose dessus a gauche (z-index + meme grid-row) pour
     donner l'impression d'etre "dans" le rectangle. .rv-left a un padding-left
     calcule pour laisser la place au visuel. */
  .fiche-v2 .page .col-cover-wrap  { grid-column: 1 / span 2; grid-row: 2; z-index: 2; }
  .fiche-v2 .page .row-verdict     { grid-column: 1 / -1; grid-row: 2; z-index: 1; }
  /* Quand un tooltip est ouvert (score global ou tuile mix), on booste le
     z-index de toute la row pour que le tooltip puisse déborder au-dessus
     du Plan d'action / Diagnostic qui suit dans la grille. Sans ça, le
     z-index interne du tooltip (200) reste plafonné par la row (1). */
  .fiche-v2 .page .row-verdict:has(.score-ring.tip-open),
  .fiche-v2 .page .row-verdict:has(.score-ring:hover),
  .fiche-v2 .page .row-verdict:has(.mi-tile.tip-open),
  .fiche-v2 .page .row-verdict:has(.mi-tile:hover) {
    z-index: 100;
  }
  .fiche-v2 .page .row-verdict .rv-left {
    /* Padding-left reserve la place de la pochette (spanning 2/6 cols + gap).
       2/6 = 33.33% ; le +40px couvre le gap + respiration interne. */
    padding-left: calc(33.33% + 40px);
  }
  /* Override du wrapper pochette en contexte grid v2 : on stretch le wrapper
     sur toute sa cellule (2/6), on applique un padding-left pour aligner
     visuellement sur le contenu de col-diag en dessous, et on recentre la
     pochette dans l'espace restant via flex. aspect-ratio deplace sur
     .col-cover pour que le wrapper ne devienne pas un carre geant. */
  .fiche-v2 .page .col-cover-wrap {
    justify-self: stretch;
    align-self: center;
    width: auto;
    max-width: none;
    aspect-ratio: auto;
    padding-left: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    margin: 12px 0;
  }
  .fiche-v2 .page .col-cover-wrap .col-cover-holder {
    position: relative;
    width: 100%;
    max-width: 250px;
    aspect-ratio: 1 / 1;
  }
  .fiche-v2 .page .col-cover-wrap .col-cover {
    width: 100%;
    height: 100%;
    aspect-ratio: auto;
    max-width: none;
  }
  /* Pill type vocal : coin supérieur droit de l'artwork, escape le
     overflow:hidden de .col-cover grâce au holder parent. */
  .fiche-v2 .col-cover-holder .cover-vocal-pill {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 5;
  }
  /* Neutralise le translateY correctif de la topbar et renforce le fond
     pour rester lisible par-dessus les halos colorés de l'artwork. */
  .fiche-v2 .col-cover-holder .cover-vocal-pill .vocal-pill-wrap {
    transform: none;
  }
  .fiche-v2 .col-cover-holder .cover-vocal-pill .vocal-pill {
    background: rgba(15, 15, 18, 0.6);
    backdrop-filter: blur(8px) saturate(1.1);
    -webkit-backdrop-filter: blur(8px) saturate(1.1);
    border-color: rgba(255, 255, 255, 0.18);
    color: #fff;
  }
  .fiche-v2 .col-cover-holder .cover-vocal-pill .vocal-pill:hover:not(:disabled) {
    border-color: rgba(255, 255, 255, 0.32);
    background: rgba(15, 15, 18, 0.72);
  }
  /* Menu de la pill : s'aligne à droite (au lieu de left:0) pour ne pas
     déborder de l'artwork quand la pill est dans le coin supérieur droit. */
  .fiche-v2 .col-cover-holder .cover-vocal-pill .vocal-pill-menu {
    left: auto;
    right: 0;
  }
  /* Le score-eyebrow reste a sa place d'origine (premier enfant de .rv-left,
     meme style que les autres eyebrows). On annule juste le padding-left
     calc(33.33% + 40px) qui reservait la place de la pochette, via un
     margin-left negatif, pour qu'il s'aligne avec la bordure interne gauche
     du card (= 24px, meme que diag-eyebrow / plan-eyebrow). */
  .fiche-v2 .row-verdict .rv-left .score-eyebrow {
    margin-left: calc(-33.33% - 16px);
  }
  /* Rangees 3-4 : col-diag a gauche, a droite Plan d'action (et optionnellement
     Intention artistique au-dessus).
     - Par defaut (pas d'intention) : col-plan directement en haut de la colonne
       droite (rangee 3), col-diag tient sur une seule rangee.
     - Si .intent-panel-fiche est present : il prend la rangee 3 a droite,
       col-plan descend sur la rangee 4, col-diag s'etire sur 2 rangees pour
       combler la hauteur a gauche. (:has() gere la bascule automatiquement) */
  .fiche-v2 .page .col-diag            { grid-column: 1 / span 3; grid-row: 3; }
  .fiche-v2 .page .col-plan            { grid-column: 4 / span 3; grid-row: 3; align-self: start; }
  .fiche-v2 .page .intent-panel-fiche  { grid-column: 4 / span 3; grid-row: 3; align-self: start; }
  .fiche-v2 .page:has(.intent-panel-fiche) .col-diag { grid-row: 3 / span 2; }
  .fiche-v2 .page:has(.intent-panel-fiche) .col-plan { grid-row: 4; }

  /* Wrapper qui empile EvolutionBanner + IntentPanel dans la colonne droite,
     juste au-dessus de Plan d action. On en fait un seul grid-item (col 4-6,
     row 3) pour eviter les conflits avec les regles .intent-panel-fiche /
     .col-plan. A l interieur, IntentPanel doit reprendre 100% de largeur
     (sa regle grid d origine ne s applique plus puisqu il n est plus enfant
     direct du grid .page). */
  .fiche-v2 .evo-intent-stack > .intent-panel-fiche {
    grid-column: auto;
    grid-row: auto;
    align-self: auto;
    width: 100%;
    box-sizing: border-box;
    margin: 0;
  }
  /* Rangees pleine largeur sous les 2 colonnes */
  .fiche-v2 .page .row-qualitative { grid-column: 1 / -1; grid-row: 5; }
  .fiche-v2 .page .notes-section   { grid-column: 1 / -1; grid-row: 6; }

  /* Mobile / drawer : les wrappers f2-col-* doivent s'effacer pour ne pas
     perturber le flow vertical historique. display: contents remonte les
     enfants au niveau du parent. */
  .f2-col-main, .f2-col-side { display: contents; }

  /* ══════════════════════════════════════════════════════════════════
     COL-COVER — pochette type artwork de single
     Fallback : patchwork de halos color\u00e9s d\u00e9satur\u00e9s (seed\u00e9s par titre)
     + titre en grosses capitales dans la police du logo VERSIONS.
     Image utilisateur remplace enti\u00e8rement le fallback.
     ══════════════════════════════════════════════════════════════════ */
  .fiche-v2 .col-cover-wrap {
    position: relative;
    width: 100%;
    max-width: 250px;
    aspect-ratio: 1 / 1;
    justify-self: center;
    align-self: center;
    margin: 12px 0;
    isolation: isolate;
  }
  .fiche-v2 .col-cover {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    overflow: hidden;
    background: #1a1725;
    box-shadow:
      0 24px 60px rgba(0,0,0,0.5),
      0 6px 16px rgba(0,0,0,0.35),
      inset 0 0 0 1px rgba(255,255,255,0.04);
    container-type: inline-size;
    isolation: isolate;
  }
  .fiche-v2 .col-cover .cover-img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }
  /* Halos color\u00e9s en fond (fallback sans image) — blend normal pour
     pr\u00e9server la saturation des couleurs individuelles, flou doux. */
  .fiche-v2 .col-cover .ca-halo {
    position: absolute;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    filter: blur(32px);
    pointer-events: none;
    z-index: 1;
  }
  /* Grain subtil par-dessus pour la texture (simule un papier/film grain).
     Impl\u00e9ment\u00e9 via un SVG base64 en feTurbulence \u2192 noise al\u00e9atoire. */
  .fiche-v2 .col-cover.no-image::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.25 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
    opacity: 0.14;
    mix-blend-mode: overlay;
    pointer-events: none;
    z-index: 2;
  }
  /* Tr\u00e8s l\u00e9ger voile sombre au bas pour la lisibilit\u00e9 du titre sans casser
     la saturation color\u00e9e du patchwork. */
  .fiche-v2 .col-cover.no-image::after {
    content: "";
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 35%;
    background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.22) 70%, rgba(0,0,0,0.38) 100%);
    pointer-events: none;
    z-index: 3;
  }
  /* Titre en gros \u2014 police du logo VERSIONS (DM Sans bold), tracking n\u00e9gatif.
     Taille proportionnelle au container pour que \u00e7a reste "grand" m\u00eame
     si la pochette change de taille. */
  .fiche-v2 .col-cover .cover-big-title {
    position: absolute;
    left: 14px; right: 14px; bottom: 12px;
    font-family: var(--body, 'DM Sans', sans-serif);
    font-weight: 800;
    font-size: clamp(32px, 22cqw, 84px);
    line-height: 0.86;
    letter-spacing: -2.2px;
    color: rgba(245,240,230,0.85);
    text-transform: uppercase;
    text-align: left;
    overflow-wrap: anywhere;
    word-break: break-word;
    text-shadow: 0 2px 14px rgba(0,0,0,0.38);
    z-index: 4;
    pointer-events: none;
  }

  /* Row verdict : en col-1 étroite, on empile score-panel et evolution
     comme 2 cartes indépendantes (pas de fond/bordure sur le wrapper). */
  .fiche-v2 .row-verdict {
    grid-template-columns: 1fr;
    gap: 14px;
    margin-bottom: 0;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 0;
    overflow: visible;
  }
  .fiche-v2 .row-verdict .rv-left {
    position: relative;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    background: var(--card);
    border: 1px solid rgba(245,166,35,0.18);
    border-radius: 16px;
    padding: 22px 24px 24px;
    overflow: visible; /* était hidden → empêchait les tooltips mix de déborder en bas */
  }
  /* Halo ambre isolé dans un calque clippé pour éviter d'avoir
     à mettre overflow:hidden sur le panel parent. */
  .fiche-v2 .row-verdict .rv-left .rv-halo {
    position: absolute;
    inset: 0;
    border-radius: 16px;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
  }
  .fiche-v2 .row-verdict .rv-left .rv-halo::before {
    content: ''; position: absolute; pointer-events: none;
    top: -80px; right: -80px;
    width: 280px; height: 280px;
    border-radius: 50%;
    background: var(--amber);
    filter: blur(80px); opacity: 0.22;
  }
  .fiche-v2 .row-verdict .rv-left > *:not(.rv-halo) { position: relative; z-index: 1; }

  /* Eyebrow "SCORE GLOBAL" façon maquette (.eyebrow.amber L303) */
  .fiche-v2 .row-verdict .rv-left .score-eyebrow {
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 10.5px;
    letter-spacing: 2.2px;
    text-transform: uppercase;
    color: var(--amber, #f5a623);
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 4px;
    line-height: 1;
  }
  .fiche-v2 .row-verdict .rv-left .score-eyebrow .dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--amber, #f5a623);
    flex-shrink: 0;
  }

  /* Ring centré (n'écrase pas les règles existantes) */
  .fiche-v2 .row-verdict .rv-left .score-ring {
    align-self: center;
    margin: 6px auto 4px;
  }

  /* Ring + 6 tuiles mix-indicators côte-à-côte (ring à gauche, grid 2×3 à droite).
     z-index élevé pour que le tooltip du score global (qui descend sous le ring)
     passe au-dessus du .verdict-text qui suit dans le DOM — sinon le texte
     d'explication apparaît "transparent" parce qu'un autre bloc peint par-dessus. */
  .fiche-v2 .row-verdict .rv-left .rv-top {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 4px 0 2px;
    position: relative;
    z-index: 20;
  }
  /* Boost supplémentaire quand le tooltip est ouvert, pour être safe
     même si un autre overlay (chat drawer, modale, etc.) s'intercale. */
  .fiche-v2 .row-verdict .rv-left .rv-top:has(.score-ring.tip-open),
  .fiche-v2 .row-verdict .rv-left .rv-top:has(.score-ring:hover) {
    z-index: 50;
  }
  .fiche-v2 .row-verdict .rv-left .rv-top .score-ring {
    align-self: center;
    margin: 0;
    flex-shrink: 0;
  }
  .fiche-v2 .row-verdict .rv-left .rv-top .mix-indicators {
    flex: 1;
    min-width: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .fiche-v2 .row-verdict .rv-left .mi-tile {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: rgba(255,255,255,0.02);
    border: 1px solid var(--border, rgba(255,255,255,0.06));
    border-radius: 9px;
    min-width: 0;
  }
  .fiche-v2 .row-verdict .rv-left .mi-tile .mi-ring {
    width: 28px; height: 28px;
    position: relative;
    flex-shrink: 0;
  }
  .fiche-v2 .row-verdict .rv-left .mi-tile .mi-ring svg { width: 28px; height: 28px; }
  .fiche-v2 .row-verdict .rv-left .mi-tile .mi-ring .mi-val {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 10px;
    font-weight: 600;
    color: var(--text, #f5f4ef);
  }
  .fiche-v2 .row-verdict .rv-left .mi-tile .mi-body {
    flex: 1;
    min-width: 0;
    line-height: 1.2;
  }
  .fiche-v2 .row-verdict .rv-left .mi-tile .mi-label {
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 9.5px;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: var(--muted, rgba(255,255,255,0.5));
    font-weight: 500;
  }
  .fiche-v2 .row-verdict .rv-left .mi-tile .mi-word {
    /* Casse alignee sur le verdict et la citation de l'ecoute qualitative :
       weight 300 + color soft, pour sortir du ton "titre" et rester sobre. */
    font-family: var(--body, 'DM Sans', sans-serif);
    font-weight: 300;
    font-size: 14px;
    margin-top: 2px;
    color: var(--soft, rgba(255,255,255,0.78));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Écran un peu étroit : ring sur le dessus, tuiles en 2 colonnes en dessous */
  @media (max-width: 1100px) {
    .fiche-v2 .row-verdict .rv-left .rv-top {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }
    .fiche-v2 .row-verdict .rv-left .rv-top .mix-indicators {
      grid-template-columns: 1fr 1fr;
    }
  }

  /* ─── Fiche v2 — tablette étroite / mobile ─────────────────────────────
     Sous 900px on casse la grille 6-colonnes desktop et on empile les
     sections verticalement (pochette → verdict → diagnostic → plan →
     qualitative → notes). Le chat reste un drawer en mobile (has-chat
     absent), donc pas de 3ᵉ colonne à gérer. */
  @media (max-width: 900px) {
    .fiche-v2 .page {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
      padding: 16px 16px 80px;
    }
    /* display: contents fait remonter les enfants de f2-col-main / side
       directement au niveau du flex parent .page. Ça permet d'ordonner
       pochette → score → diag → plan → qualitative → notes sans tenir
       compte de leur colonne d'origine (main ou side). */
    .fiche-v2 .page > .f2-col-main,
    .fiche-v2 .page > .f2-col-side {
      display: contents;
    }
    /* Ordre d'empilement mobile :
       0 vocal-suggest (banner) · 1 pochette · 2 score · 3 diag · 4 plan
       · 5 qualitative · 6 notes. */
    .fiche-v2 .page .vocal-suggest   { order: 0; }
    .fiche-v2 .page .col-cover-wrap  { order: 1; }
    .fiche-v2 .page .row-verdict     { order: 2; }
    /* Évolution depuis Vn + Intention artistique : juste avant le diagnostic
       par élément. Sans cette règle, le wrapper hérite de l'order par défaut
       (0) et remonte tout en haut, au-dessus de la pochette. */
    .fiche-v2 .page .evo-intent-stack { order: 3; }
    .fiche-v2 .page .col-diag        { order: 4; }
    .fiche-v2 .page .col-plan,
    .fiche-v2 .page .intent-panel-fiche { order: 5; }
    .fiche-v2 .page .row-qualitative { order: 6; }
    .fiche-v2 .page .notes-section   { order: 7; }
    /* Neutralise les grid-column/row du layout desktop (qui faisaient
       déborder les enfants puisqu'on n'est plus en grid). */
    .fiche-v2 .page .vocal-suggest,
    .fiche-v2 .page .col-cover-wrap,
    .fiche-v2 .page .row-verdict,
    .fiche-v2 .page .col-diag,
    .fiche-v2 .page .col-plan,
    .fiche-v2 .page .intent-panel-fiche,
    .fiche-v2 .page .row-qualitative,
    .fiche-v2 .page .notes-section {
      grid-column: auto;
      grid-row: auto;
    }
    /* Pochette : on neutralise le padding-left 48px et le stretch desktop,
       on la centre horizontalement dans .page (qui est flex column). */
    .fiche-v2 .page .col-cover-wrap {
      width: 100%;
      max-width: 280px;
      padding-left: 0;
      padding-right: 0;
      margin: 0 auto;
      align-self: center;
      justify-self: center;
      justify-content: center;
    }
    .fiche-v2 .page .col-cover-wrap .col-cover-holder {
      max-width: 100%;
    }
    /* row-verdict : padding-left calc(33.33% + 40px) réservait la place
       de la pochette superposée en desktop. En mobile, plus de superposition —
       la pochette est au-dessus en bloc. On remet un padding interne normal
       pour que le contenu ne colle pas aux bords du cadre. */
    .fiche-v2 .page .row-verdict .rv-left {
      padding-left: 22px;
    }
    /* rv-top empile verticalement (score ring au-dessus des 6 indicateurs),
       indicateurs en grille 2x3 compacte. */
    .fiche-v2 .row-verdict .rv-left .rv-top {
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }
    .fiche-v2 .row-verdict .rv-left .rv-top .mix-indicators {
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    /* Gros chiffre du score ring : 56px sort du cercle sur mobile —
       on réduit à 40px. !important car la règle desktop (même specificity)
       vient plus tard dans le fichier et gagnerait sinon le cascade. */
    .fiche-v2 .row-verdict .rv-left .score-ring .big,
    .fiche-v2 .score-ring .big {
      font-size: 40px !important;
      letter-spacing: -1px;
      line-height: 1;
    }
    .fiche-v2 .row-verdict .rv-left .score-ring .big-suffix,
    .fiche-v2 .score-ring .big-suffix {
      font-size: 9px !important;
      margin-top: 6px;
    }

    /* Padding uniforme sur tous les panels de la fiche en mobile pour que
       l'enchaînement vertical soit visuellement régulier. */
    .fiche-v2 .row-verdict .rv-left,
    .fiche-v2 .diag-panel,
    .fiche-v2 .plan-panel,
    .fiche-v2 .notes-panel {
      padding: 20px 22px !important;
    }

    /* Neutralise toutes les marges top/bottom sur les sections directes
       de .page — le rythme vertical est géré uniquement par le gap: 16px
       du flex parent, pour un espacement strictement uniforme. */
    .fiche-v2 .page > .row-qualitative,
    .fiche-v2 .page > .notes-section,
    .fiche-v2 .page > .col-cover-wrap,
    .fiche-v2 .page > .row-verdict,
    .fiche-v2 .page > .col-diag,
    .fiche-v2 .page > .col-plan,
    .fiche-v2 .page > .intent-panel-fiche,
    .fiche-v2 .page > .vocal-suggest,
    .fiche-v2 .col-diag,
    .fiche-v2 .col-plan {
      margin: 0 !important;
      padding: 0 !important;
    }
    /* Panels directement en flex items : plus de margin-top/bottom qui
       s'ajoute au gap: 16px de .page. */
    .fiche-v2 .diag-panel,
    .fiche-v2 .plan-panel,
    .fiche-v2 .row-qualitative > *,
    .fiche-v2 .notes-section {
      margin: 0 !important;
    }

    /* Badge type vocal sur la pochette : le 9.5px/3-8px par défaut fait
       très petit à côté des pills 11px du reste du site. On l'aligne sur
       la grammaire .add-mini-btn / .wh-btn pour rester raccord. */
    .fiche-v2 .col-cover-holder .cover-vocal-pill .vocal-pill {
      font-size: 11px;
      letter-spacing: 1.2px;
      padding: 6px 14px;
      line-height: 14px;
      border-radius: 999px;
    }
    .fiche-v2 .col-cover-holder .cover-vocal-pill {
      top: 12px;
      right: 12px;
    }
  }

  /* Très petit mobile : indicateurs 1 col. */
  @media (max-width: 420px) {
    .fiche-v2 .row-verdict .rv-left .rv-top .mix-indicators {
      grid-template-columns: 1fr;
    }
  }


  /* Typo du gros nombre dans le ring — on passe en DM Sans geometric
     (comme la maquette) pour une lisibilité plus nette que Cormorant 58px. */
  .fiche-v2 .row-verdict .rv-left .score-ring .big {
    font-family: var(--body, 'DM Sans', sans-serif);
    font-weight: 700;
    font-size: 56px;
    letter-spacing: -2px;
    line-height: 1;
  }
  .fiche-v2 .row-verdict .rv-left .score-ring .big-suffix {
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 10px;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    margin-top: 8px;
    margin-left: 2px;
    font-weight: 400;
  }

  /* Bands rouge / ambre / mint (cf. .score-bands maquette L793) */
  .fiche-v2 .row-verdict .rv-left .score-bands {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 9.5px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--muted, rgba(255,255,255,0.5));
    margin-top: 4px;
  }
  .fiche-v2 .row-verdict .rv-left .score-bands span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .fiche-v2 .row-verdict .rv-left .score-bands i {
    width: 6px; height: 6px;
    border-radius: 50%;
    display: inline-block;
  }
  .fiche-v2 .row-verdict .rv-left .score-bands .b-low i  { background: var(--red, #ff5d5d); }
  .fiche-v2 .row-verdict .rv-left .score-bands .b-mid i  { background: var(--amber, #f5a623); }
  .fiche-v2 .row-verdict .rv-left .score-bands .b-high i { background: var(--mint, #8ee07a); }

  /* Delta mint "↑ +15 points depuis V2" centré */
  .fiche-v2 .row-verdict .rv-left .score-calibration {
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 10px;
    letter-spacing: 1px;
    color: var(--mint, #8ee07a);
    text-align: center;
    margin: 6px 0 2px;
    text-transform: uppercase;
  }
  .fiche-v2 .row-verdict .rv-left .score-calibration.down { color: var(--red, #ff5d5d); }
  .fiche-v2 .row-verdict .rv-left .score-calibration.stable { color: var(--muted, rgba(255,255,255,0.5)); }

  /* Verdict en Cormorant italic 16px (cf. .verdict maquette L808) */
  .fiche-v2 .row-verdict .rv-left .verdict-text {
    margin-top: 10px;
    text-align: left;
  }
  /* Bouton-toggle pour ouvrir/fermer le verdict */
  .fiche-v2 .row-verdict .rv-left .verdict-text .verdict-toggle {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
    padding: 0;
    margin: 0;
    background: transparent;
    border: 0;
    cursor: pointer;
    text-align: left;
    color: inherit;
    transition: opacity .18s ease;
  }
  .fiche-v2 .row-verdict .rv-left .verdict-text .verdict-toggle:hover h1 {
    color: var(--amber, #f5a623);
  }
  .fiche-v2 .row-verdict .rv-left .verdict-text .verdict-toggle:focus-visible {
    outline: 2px solid var(--amber, #f5a623);
    outline-offset: 4px;
    border-radius: 6px;
  }
  .fiche-v2 .row-verdict .rv-left .verdict-text .verdict-toggle h1 {
    flex: 1;
    min-width: 0;
    transition: color .18s ease;
  }
  .fiche-v2 .row-verdict .rv-left .verdict-text .verdict-caret {
    flex-shrink: 0;
    width: 10px;
    height: 10px;
    /* Positionne entre les 2 lignes du h1 (line-height 1.55 sur 16px =
       ~24.8px par ligne → ~20px centre le caret sur la separation). */
    margin-top: 20px;
    border-right: 1.5px solid var(--muted, rgba(255,255,255,0.5));
    border-bottom: 1.5px solid var(--muted, rgba(255,255,255,0.5));
    transform: rotate(45deg);
    transition: transform .22s ease, border-color .18s ease;
  }
  .fiche-v2 .row-verdict .rv-left .verdict-text.expanded .verdict-caret {
    transform: rotate(225deg);
    margin-top: 24px;
  }
  .fiche-v2 .row-verdict .rv-left .verdict-text .verdict-toggle:hover .verdict-caret {
    border-color: var(--amber, #f5a623);
  }
  /* Verdict — homogénéisé avec le reste de la fiche (DM Sans, pas de serif italique).
     Le h1 reprend la recette .di-name (DM Sans 14 / 400) mais un cran au-dessus
     pour rester la "phrase d'accroche". Le p suit .di-detail (14 / 300 / soft). */
  .fiche-v2 .row-verdict .rv-left .verdict-text h1 {
    /* Casse alignee sur la citation de l'ecoute qualitative (.q-citation p)
       pour garder la hierarchie : verdict = recap sobre, pas un titre tape-a-l'oeil. */
    font-family: var(--body, 'DM Sans', sans-serif);
    font-size: 16px;
    line-height: 1.55;
    font-weight: 300;
    font-style: normal;
    color: var(--soft, rgba(255,255,255,0.78));
    letter-spacing: 0;
    margin: 0 0 8px;
  }
  /* Verdict collapsed : max 2 lignes avec ellipsis, pour inciter l'utilisateur
     a cliquer sur le toggle ">" pour lire la suite. Quand expanded, pas de clamp. */
  .fiche-v2 .row-verdict .rv-left .verdict-text.collapsed .verdict-toggle h1 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .fiche-v2 .row-verdict .rv-left .verdict-text h1 em,
  .fiche-v2 .row-verdict .rv-left .verdict-text h1 b,
  .fiche-v2 .row-verdict .rv-left .verdict-text h1 strong {
    color: var(--amber, #f5a623);
    font-weight: 600;
    font-style: normal;
  }
  .fiche-v2 .row-verdict .rv-left .verdict-text p {
    font-family: var(--body, 'DM Sans', sans-serif);
    font-size: 14px;
    line-height: 1.6;
    font-weight: 300;
    font-style: normal;
    color: var(--soft, rgba(255,255,255,0.78));
    margin: 0 0 6px;
  }
  .fiche-v2 .row-verdict .rv-left .verdict-text .analyzed-at {
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 10px;
    letter-spacing: 0.8px;
    color: var(--muted, rgba(255,255,255,0.5));
    text-transform: uppercase;
    margin-top: 10px;
    font-style: normal;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     ÉCOUTE QUALITATIVE v2 (desktop) — UN SEUL panel avec eyebrow cerulean en
     haut, citation impression + sous-items imbriqués à l'intérieur. Matche
     exactement .panel de maquette-v2-complete.html (ligne 2449 et suivantes).
     ══════════════════════════════════════════════════════════════════════════ */
  .fiche-v2 .row-qualitative.stacked {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 0;
    position: relative;
    overflow: hidden;
    background: var(--card);
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    border-radius: 14px;
    padding: 20px 22px;
  }
  /* Halo cerulean discret en bas-droite (cf. .panel::after maquette L318) */
  .fiche-v2 .row-qualitative.stacked::before {
    content: '';
    position: absolute;
    bottom: -60px; right: -60px;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: var(--cerulean);
    filter: blur(80px);
    opacity: 0.14;
    pointer-events: none;
    z-index: 0;
  }
  .fiche-v2 .row-qualitative.stacked > * {
    position: relative;
    z-index: 1;
  }

  /* Eyebrow "ÉCOUTE QUALITATIVE" en tête (cf. .eyebrow.cerulean maquette L293) */
  .fiche-v2 .row-qualitative.stacked .q-eyebrow {
    font-family: var(--mono);
    font-size: 10.5px;
    letter-spacing: 2.2px;
    text-transform: uppercase;
    color: var(--cerulean);
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }
  .fiche-v2 .row-qualitative.stacked .q-eyebrow .dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--cerulean);
    display: inline-block;
  }
  .fiche-v2 .row-qualitative.stacked .q-eyebrow.amber { color: var(--amber); }
  .fiche-v2 .row-qualitative.stacked .q-eyebrow.amber .dot { background: var(--amber); }
  .fiche-v2 .row-qualitative.stacked .q-eyebrow.mint { color: var(--mint, #8ee07a); }
  .fiche-v2 .row-qualitative.stacked .q-eyebrow.mint .dot { background: var(--mint, #8ee07a); }

  /* Citation impression — italique Cormorant, fond ambre translucide,
     barre ambre gauche (cf. .ecoute-impression maquette L818) */
  .fiche-v2 .row-qualitative.stacked .q-citation {
    padding: 12px 14px;
    background: rgba(245,166,35,0.05);
    border-left: 3px solid var(--amber);
    border-radius: 6px;
    margin-bottom: 2px;
  }
  .fiche-v2 .row-qualitative.stacked .q-citation p {
    /* Même famille que le verdict (row-verdict p : DM Sans) pour garder une
       cohérence typographique. Corps un cran au-dessus (16 vs 14) pour
       accentuer le rôle de "citation d'accroche" dans Écoute qualitative. */
    font-family: var(--body, 'DM Sans', sans-serif);
    font-style: normal;
    font-size: 16px;
    line-height: 1.55;
    font-weight: 300;
    color: var(--soft, rgba(255,255,255,0.78));
    margin: 0;
  }
  .fiche-v2 .row-qualitative.stacked .q-citation p::before { content: '« '; }
  .fiche-v2 .row-qualitative.stacked .q-citation p::after { content: ' »'; }

  /* Emphases *mot* dans l'écoute qualitative : renderWithEmphasis() produit des
     <em>, par défaut italiques. David veut éviter l'italique → on neutralise
     le style et on garde l'emphase via une couleur amber légère (lisible sans
     déstabiliser le rythme typographique). S'applique à la citation, aux
     puces points forts / à travailler et aux sous-blocs déployables. */
  .row-qualitative em,
  .fiche-v2 .row-qualitative em {
    font-style: normal;
    color: var(--amber);
  }

  /* Grille des sous-items — flex column avec gap (cf. .ecoute-sub L827) */
  .fiche-v2 .row-qualitative.stacked .q-subgrid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Sous-items nichés à l'intérieur du panel principal — pas de card indépendante,
     juste un fond rgba translucide discret (cf. .ecoute-subitem L830) */
  .fiche-v2 .row-qualitative.stacked .q-sub {
    padding: 10px 12px;
    background: rgba(255,255,255,0.02);
    border: none;
    border-radius: 8px;
    position: static;
    overflow: visible;
  }
  .fiche-v2 .row-qualitative.stacked .q-sub::before {
    content: none;
  }

  /* Labels colorés par type (cf. .sub-label / .sub-label.mint / .amber L835) */
  .fiche-v2 .row-qualitative.stacked .q-sublabel {
    font-family: var(--mono);
    font-size: 9.5px;
    letter-spacing: 1.5px;
    color: var(--cerulean);
    text-transform: uppercase;
    margin-bottom: 6px;
    font-weight: 500;
  }
  .fiche-v2 .row-qualitative.stacked .q-sublabel.mint { color: var(--mint, #8ee07a); }
  .fiche-v2 .row-qualitative.stacked .q-sublabel.amber { color: var(--amber); }
  .fiche-v2 .row-qualitative.stacked .q-sublabel.cerulean { color: var(--cerulean); }

  /* Body texte des sous-items */
  .fiche-v2 .row-qualitative.stacked .q-subbody {
    font-size: 13px;
    color: var(--soft, rgba(255,255,255,0.78));
    line-height: 1.55;
  }
  .fiche-v2 .row-qualitative.stacked .q-subbody p {
    margin: 0;
  }

  /* Listes à puces style maquette : puce ambre (·) en début de ligne */
  .fiche-v2 .row-qualitative.stacked .q-sub ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .fiche-v2 .row-qualitative.stacked .q-sub ul li {
    font-size: 13px;
    color: var(--soft, rgba(255,255,255,0.78));
    line-height: 1.55;
    position: relative;
    padding-left: 14px;
    margin-bottom: 3px;
  }
  .fiche-v2 .row-qualitative.stacked .q-sub ul li::before {
    content: '·';
    position: absolute;
    left: 4px;
    color: var(--amber);
    font-weight: 700;
    background: none;
    width: auto;
    height: auto;
    border-radius: 0;
    top: auto;
  }
  .fiche-v2 .row-qualitative.stacked .q-sub.forts ul li::before { color: var(--mint, #8ee07a); }
  .fiche-v2 .row-qualitative.stacked .q-sub.travail ul li::before { color: var(--amber); }

  /* Bouton "— RÉDUIRE / DÉPLOYER" discret, texte seul ambre (cf. .ecoute-toggle L852) */
  .fiche-v2 .row-qualitative.stacked .impression-toggle {
    margin-top: 4px;
    align-self: flex-start;
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--amber);
    background: transparent;
    border: none;
    padding: 6px 0;
    cursor: pointer;
    transition: opacity .15s;
  }
  .fiche-v2 .row-qualitative.stacked .impression-toggle:hover {
    opacity: 0.8;
    background: transparent;
  }

  /* FICHE v2 — halos diffus sur les cartes (même recette que la home .wh-card)
     Couleur solide + filter:blur + opacity → bien visibles sur fond sombre. */

  /* Le wrapper .row-verdict est transparent en v2 (simple layout vertical).
     Les styles carte sont maintenant sur .rv-left (score panel) et .rv-right
     (évolution, déjà cartée via .evolution-panel). Cf. bloc plus haut dans ce
     fichier où on pose le panel + halo ambre sur .rv-left. */
  .fiche-v2 .row-verdict { position: relative; }

  /* Q-BLOCKS (Impression / Points forts / À travailler) →
     chaque carte reçoit son halo coloré, même pattern que .wh-card */
  .fiche-v2 .q-block { position: relative; overflow: hidden; }
  .fiche-v2 .q-block > * { position: relative; z-index: 1; }
  .fiche-v2 .q-block::before {
    content: ''; position: absolute; pointer-events: none;
    border-radius: 50%; z-index: 0;
  }
  .fiche-v2 .q-block.impression {
    border-color: rgba(92,184,204,0.18);
  }
  .fiche-v2 .q-block.impression::before {
    top: -50px; right: -40px; width: 180px; height: 180px;
    background: var(--cerulean);
    filter: blur(60px); opacity: 0.20;
  }
  .fiche-v2 .q-block.forts {
    border-color: rgba(142,224,122,0.18);
  }
  .fiche-v2 .q-block.forts::before {
    bottom: -50px; right: -30px; width: 150px; height: 150px;
    background: var(--mint, #8ee07a);
    filter: blur(58px); opacity: 0.18;
  }
  .fiche-v2 .q-block.travail {
    border-color: rgba(255,93,93,0.18);
  }
  .fiche-v2 .q-block.travail::before {
    top: -40px; right: -30px; width: 150px; height: 150px;
    background: var(--red);
    filter: blur(58px); opacity: 0.16;
  }

  /* ROW TWO (Diag + Plan) — laisse passer les z-index internes */
  .fiche-v2 .row-two { position: relative; }
  .fiche-v2 .row-two > * { position: relative; z-index: 1; }

  /* SECTION HEAD v2 — eyebrow coloré affirmé (comme la maquette).
     La colonne Diag prend l'ambre, la colonne Plan prend le mint. */
  .fiche-v2 .col-diag > .section-head .t { color: var(--amber); }
  .fiche-v2 .col-plan > .section-head .t { color: var(--mint, #8ee07a); }
  .fiche-v2 .col-diag > .section-head .line {
    background: linear-gradient(to right, rgba(245,166,35,0.25), transparent);
  }
  .fiche-v2 .col-plan > .section-head .line {
    background: linear-gradient(to right, rgba(142,224,122,0.25), transparent);
  }

  /* DIAG CAT v2 — fond --s1 + hover ambre discret pour matcher la maquette */
  .fiche-v2 .diag-cat {
    background: var(--s1);
    transition: border-color 0.15s, background 0.15s;
  }
  .fiche-v2 .diag-cat:hover {
    border-color: rgba(245,166,35,0.3);
  }
  .fiche-v2 .diag-cat.open {
    border-color: rgba(245,166,35,0.35);
    background: var(--s2, #16171f);
  }

  /* EVOLUTION PANEL v2 — halo cerulean discret + bordure colorée */
  .fiche-v2 .evolution-panel {
    position: relative;
    overflow: hidden;
    border-color: rgba(92,184,204,0.18);
  }
  .fiche-v2 .evolution-panel::before {
    content: ''; position: absolute; pointer-events: none;
    top: -40px; right: -30px;
    width: 160px; height: 160px;
    border-radius: 50%;
    background: var(--cerulean);
    filter: blur(60px); opacity: 0.16;
    z-index: 0;
  }
  .fiche-v2 .evolution-panel > * { position: relative; z-index: 1; }

  /* Le titre de l'évolution panel reprend le cerulean */
  .fiche-v2 .evolution-panel .vr-title { color: var(--cerulean); }

  /* Plan cards v2 : badges P0/P1/P2 plus contrastés */
  .fiche-v2 .pbadge {
    font-family: var(--mono); font-size: 9.5px; letter-spacing: 1.2px;
    padding: 3px 8px; border-radius: 4px;
    font-weight: 500;
  }

  /* Bouton "cocher résolu" version desktop v2 : plus compact (16px au lieu de 22). */
  .fiche-v2 .pcheck {
    width: 16px; height: 16px;
    border-radius: 4px;
    border-width: 1.5px;
  }
  .fiche-v2 .pcheck svg {
    width: 10px; height: 10px;
  }

  /* Plan cards v2 : accent de gauche coloré selon la priorité (high/med/low)
     Comme la maquette .plan-card.p0/p1/p2 mais adapté aux classes existantes. */
  .fiche-v2 .priority.collapsible { border-left-width: 3px; }
  .fiche-v2 .priority.high {
    border-left-color: var(--red);
    background: linear-gradient(to right, rgba(255,93,93,0.05), transparent 30%), var(--s1);
  }
  .fiche-v2 .priority.med {
    border-left-color: var(--amber);
    background: linear-gradient(to right, rgba(245,166,35,0.05), transparent 30%), var(--s1);
  }
  .fiche-v2 .priority.low {
    border-left-color: var(--green);
    background: linear-gradient(to right, rgba(142,224,122,0.05), transparent 30%), var(--s1);
  }
  .fiche-v2 .priority.done {
    opacity: 0.55;
    background: var(--s1);
  }
  /* Le hover garde le même accent coloré */
  .fiche-v2 .priority.collapsible.high:hover {
    border-left-color: var(--red);
    background: linear-gradient(to right, rgba(255,93,93,0.08), transparent 35%), var(--s1);
  }
  .fiche-v2 .priority.collapsible.med:hover {
    border-left-color: var(--amber);
    background: linear-gradient(to right, rgba(245,166,35,0.08), transparent 35%), var(--s1);
  }
  .fiche-v2 .priority.collapsible.low:hover {
    border-left-color: var(--green);
    background: linear-gradient(to right, rgba(142,224,122,0.08), transparent 35%), var(--s1);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     PLAN D'ACTION v2 (desktop) — UN SEUL panel (.plan-panel) avec eyebrow
     ambre + halo mint + cards .plan-card.p0/p1/p2/resolved imbriquées.
     Matche maquette-v2-complete.html L892-955 + L2499-2557 (.panel.mint-glow).
     ══════════════════════════════════════════════════════════════════════════ */

  /* ══════════════════════════════════════════════════════════════════════════
     DIAGNOSTIC v2 (desktop) — UN SEUL panel (.diag-panel) avec eyebrow
     cerulean + halo cerulean bas-droite + liste .diag-cat imbriquée.
     Matche maquette-v2-complete.html L2357 (.eyebrow.cerulean "Diagnostic").
     ══════════════════════════════════════════════════════════════════════════ */
  .fiche-v2 .diag-panel {
    position: relative;
    overflow: hidden;
    background: var(--card);
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    border-radius: 14px;
    padding: 20px 22px;
    margin: 0 0 14px;
  }
  .fiche-v2 .diag-panel::before {
    content: '';
    position: absolute;
    bottom: -60px; right: -60px;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: var(--cerulean, #5cb8cc);
    filter: blur(80px);
    opacity: 0.14;
    pointer-events: none;
    z-index: 0;
  }
  .fiche-v2 .diag-panel > * { position: relative; z-index: 1; }

  /* Eyebrow "DIAGNOSTIC · N CATÉGORIES" cerulean + dot */
  .fiche-v2 .diag-panel .diag-eyebrow {
    font-family: var(--mono);
    font-size: 10.5px;
    letter-spacing: 2.2px;
    text-transform: uppercase;
    color: var(--cerulean, #5cb8cc);
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }
  .fiche-v2 .diag-panel .diag-eyebrow .dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--cerulean, #5cb8cc);
    flex-shrink: 0;
  }

  /* Liste des catégories à l'intérieur du panel */
  .fiche-v2 .diag-panel .diag-cats {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Les .diag-cat internes — on allège les bordures/fond pour cohabiter
     dans le panel parent (pas de double carte). */
  .fiche-v2 .diag-panel .diag-cat {
    background: rgba(255,255,255,0.025);
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    border-radius: 10px;
    margin-bottom: 0;
  }

  /* Titres des catégories — même recette que .q-sublabel (mono 9.5 / 1.5 / 500 / uppercase)
     avec accent coloré différent par catégorie (voix, instruments, basses, drums, …) */
  .fiche-v2 .diag-panel .diag-cat-head {
    padding: 12px 16px;
    gap: 12px;
  }
  .fiche-v2 .diag-panel .diag-cat-head .name {
    font-family: var(--mono);
    font-size: 9.5px;
    letter-spacing: 1.5px;
    font-weight: 500;
    text-transform: uppercase;
    color: var(--cerulean, #5cb8cc);
    flex: 1;
    line-height: 1;
  }
  .fiche-v2 .diag-panel .diag-cat-head .count {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.5px;
    color: var(--muted, rgba(255,255,255,0.5));
    text-transform: uppercase;
  }
  .fiche-v2 .diag-panel .diag-cat-head .chev {
    color: var(--muted, rgba(255,255,255,0.5));
  }

  /* Accents colorés par catégorie (titres + border/fond/hover) */
  .fiche-v2 .diag-panel .diag-cat.c-cerulean .diag-cat-head .name { color: var(--cerulean, #5cb8cc); }
  .fiche-v2 .diag-panel .diag-cat.c-amber .diag-cat-head .name    { color: var(--amber, #f5a623); }
  .fiche-v2 .diag-panel .diag-cat.c-mint .diag-cat-head .name     { color: var(--mint, #8ee07a); }
  .fiche-v2 .diag-panel .diag-cat.c-red .diag-cat-head .name      { color: var(--red, #ff5d5d); }

  .fiche-v2 .diag-panel .diag-cat.c-cerulean:hover { border-color: rgba(92,184,204,0.3); }
  .fiche-v2 .diag-panel .diag-cat.c-cerulean.open  { border-color: rgba(92,184,204,0.35); background: rgba(92,184,204,0.04); }
  .fiche-v2 .diag-panel .diag-cat.c-amber:hover    { border-color: rgba(245,166,35,0.3); }
  .fiche-v2 .diag-panel .diag-cat.c-amber.open     { border-color: rgba(245,166,35,0.35); background: rgba(245,166,35,0.04); }
  .fiche-v2 .diag-panel .diag-cat.c-mint:hover     { border-color: rgba(142,224,122,0.3); }
  .fiche-v2 .diag-panel .diag-cat.c-mint.open      { border-color: rgba(142,224,122,0.35); background: rgba(142,224,122,0.04); }
  .fiche-v2 .diag-panel .diag-cat.c-red:hover      { border-color: rgba(255,93,93,0.3); }
  .fiche-v2 .diag-panel .diag-cat.c-red.open       { border-color: rgba(255,93,93,0.35); background: rgba(255,93,93,0.04); }

  /* Dans .fiche-v2, on masque la .section-head héritée si elle traîne
     en tête de .col-diag, et on resserre le gap entre le panel et ce qui suit. */
  .fiche-v2 .col-diag > .section-head { display: none; }

  /* Le panel parent — un seul conteneur cerulean façon .panel.mint-glow */
  .fiche-v2 .plan-panel {
    position: relative;
    overflow: hidden;
    background: var(--card);
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    border-radius: 14px;
    padding: 20px 22px;
    margin: 0 0 14px;
  }
  /* Halo mint en bas-droite (cf. .panel.mint-glow::after maquette L326) */
  .fiche-v2 .plan-panel::before {
    content: '';
    position: absolute;
    bottom: -60px; right: -60px;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: var(--mint, #8ee07a);
    filter: blur(80px);
    opacity: 0.16;
    pointer-events: none;
    z-index: 0;
  }
  .fiche-v2 .plan-panel > * { position: relative; z-index: 1; }

  /* Eyebrow "PLAN D'ACTION · 3 MOMENTS-CLEF" en ambre avec dot
     (cf. .eyebrow.amber maquette L303) */
  .fiche-v2 .plan-panel .plan-eyebrow {
    font-family: var(--mono);
    font-size: 10.5px;
    letter-spacing: 2.2px;
    text-transform: uppercase;
    color: var(--amber);
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }
  .fiche-v2 .plan-panel .plan-eyebrow .dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--amber);
    flex-shrink: 0;
  }
  .fiche-v2 .plan-panel .plan-eyebrow .plan-filter-toggle {
    margin-left: auto;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.08);
    color: var(--muted, rgba(255,255,255,0.5));
    font-family: var(--mono);
    font-size: 9.5px;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 4px 9px;
    border-radius: 4px;
    cursor: pointer;
    transition: color .15s, border-color .15s;
  }
  .fiche-v2 .plan-panel .plan-eyebrow .plan-filter-toggle:hover,
  .fiche-v2 .plan-panel .plan-eyebrow .plan-filter-toggle.active {
    color: var(--amber);
    border-color: rgba(245,166,35,0.4);
  }

  /* Liste des cards (cf. .plan-cards maquette L892) */
  .fiche-v2 .plan-cards {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Une card individuelle (cf. .plan-card maquette L893) */
  .fiche-v2 .plan-card {
    padding: 14px 16px;
    border-radius: 10px;
    background: rgba(255,255,255,0.025);
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    border-left: 3px solid var(--cerulean);
    min-width: 0;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  .fiche-v2 .plan-card.p0 {
    border-left-color: var(--red);
    background: rgba(255,93,93,0.04);
  }
  .fiche-v2 .plan-card.p1 {
    border-left-color: var(--amber);
    background: rgba(245,166,35,0.04);
  }
  .fiche-v2 .plan-card.p2 {
    border-left-color: var(--mint, #8ee07a);
    background: rgba(142,224,122,0.04);
  }
  .fiche-v2 .plan-card.resolved { opacity: 0.55; }

  /* Collapsible : cursor pointer + chevron ; ouvert au clic */
  .fiche-v2 .plan-card.collapsible {
    cursor: pointer;
    transition: background .18s ease, border-color .18s ease, box-shadow .18s ease;
    position: relative;
  }
  .fiche-v2 .plan-card.collapsible:hover {
    background: rgba(255,255,255,0.055);
    box-shadow: inset 0 0 0 1px rgba(245,166,35,0.22);
  }
  .fiche-v2 .plan-card.collapsible.p0:hover { background: rgba(255,93,93,0.1); }
  .fiche-v2 .plan-card.collapsible.p1:hover { background: rgba(245,166,35,0.1); }
  .fiche-v2 .plan-card.collapsible.p2:hover { background: rgba(142,224,122,0.1); }
  .fiche-v2 .plan-card.collapsible:focus-visible {
    outline: 2px solid var(--amber, #f5a623);
    outline-offset: 2px;
  }
  /* Chevron rond discret mais visible à côté du DAW / au bout de p-head */
  /* Ligne titre : chevron à gauche (sous le cercle .p-check) + titre.
     Le chevron reprend exactement la recette de .diag-cat-head .chev :
     SVG nu, couleur muted, rotate 90° quand la card est ouverte. */
  .fiche-v2 .plan-card .p-title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .fiche-v2 .plan-card .p-chev {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: var(--muted, rgba(255,255,255,0.5));
    transform: rotate(0deg);
    transition: transform .18s ease, color .18s ease;
    flex-shrink: 0;
  }
  .fiche-v2 .plan-card.open .p-chev {
    transform: rotate(90deg);
    color: var(--amber, #f5a623);
  }
  .fiche-v2 .plan-card.collapsible:hover .p-chev {
    color: var(--text, #fff);
  }
  /* Body déplié (mesures + liens) — cursor auto : seule la barre
     de titre est cliquable pour refermer la card. */
  .fiche-v2 .plan-card .p-body {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    cursor: auto;
  }
  /* Le bouton 'marquer comme résolu' garde son propre curseur pointer */
  .fiche-v2 .plan-card .p-body .p-resolve {
    cursor: pointer;
  }
  .fiche-v2 .plan-card .p-body .p-measure,
  .fiche-v2 .plan-card .p-body .p-links {
    margin-top: 0;
  }

  /* Header : juste le tag pill (le bouton 'résolu' a été déplacé en bas du body) */
  .fiche-v2 .plan-card .p-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
    min-width: 0;
    flex-wrap: wrap;
  }

  /* Bouton 'marquer comme résolu' en pied de body (visible uniquement quand
     la card est dépliée). Rond 20x20 + petite légende à côté. */
  .fiche-v2 .plan-card .p-resolve {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    padding: 4px 8px 4px 4px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 999px;
    cursor: pointer;
    align-self: flex-start;
    transition: background .15s, border-color .15s;
  }
  .fiche-v2 .plan-card .p-resolve:hover {
    background: rgba(142,224,122,0.06);
    border-color: rgba(142,224,122,0.25);
  }
  .fiche-v2 .plan-card .p-resolve .p-check {
    width: 14px; height: 14px;
    border-radius: 50%;
    border: 1.5px solid var(--muted, rgba(255,255,255,0.35));
    background: transparent;
    color: var(--mint, #8ee07a);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: border-color .15s, background .15s;
  }
  .fiche-v2 .plan-card .p-resolve .p-check svg {
    width: 8px;
    height: 8px;
  }
  .fiche-v2 .plan-card .p-resolve:hover .p-check {
    border-color: var(--mint, #8ee07a);
  }
  .fiche-v2 .plan-card .p-resolve.done .p-check {
    background: var(--mint, #8ee07a);
    border-color: var(--mint, #8ee07a);
    color: #0a0a0c;
  }
  .fiche-v2 .plan-card .p-resolve .p-resolve-label {
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 1.4px;
    font-weight: 500;
    text-transform: uppercase;
    color: var(--muted, rgba(255,255,255,0.55));
    transition: color .15s;
  }
  .fiche-v2 .plan-card .p-resolve:hover .p-resolve-label,
  .fiche-v2 .plan-card .p-resolve.done .p-resolve-label {
    color: var(--mint, #8ee07a);
  }

  /* Tag pill — EXACT maquette L908 : mono 9.5 / ls 1.5 / weight 500 */
  .fiche-v2 .plan-card .p-tag {
    font-family: var(--mono);
    font-size: 9.5px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    font-weight: 500;
    padding: 3px 8px;
    border-radius: 4px;
    flex-shrink: 0;
    line-height: 1;
  }
  .fiche-v2 .plan-card.p0 .p-tag {
    background: rgba(255,93,93,0.12);
    color: var(--red);
  }
  .fiche-v2 .plan-card.p1 .p-tag {
    background: rgba(245,166,35,0.12);
    color: var(--amber);
  }
  .fiche-v2 .plan-card.p2 .p-tag,
  .fiche-v2 .plan-card.resolved .p-tag {
    background: rgba(142,224,122,0.12);
    color: var(--mint, #8ee07a);
  }

  /* Description longue (DAW / hint) — aligné sur .diag-item .di-detail :
     body 14 / weight 300 / soft / lh 1.6 / casse naturelle (pas d'uppercase). */
  .fiche-v2 .plan-card .p-daw {
    font-family: var(--body);
    font-weight: 300;
    font-size: 14px;
    letter-spacing: 0;
    color: var(--soft, rgba(255,255,255,0.78));
    text-transform: none;
    line-height: 1.6;
    flex: 1 1 100%;
    min-width: 0;
    margin-left: 0;
    overflow-wrap: anywhere;
    word-break: break-word;
    white-space: normal;
  }

  /* Titre de l'item — aligné sur .diag-item .di-name : body 14 / weight 400.
     Dans .p-title-row (flex) : flex:1 pour prendre toute la largeur
     après le chevron. */
  .fiche-v2 .plan-card .p-title {
    font-family: var(--body);
    font-weight: 400;
    font-size: 14px;
    line-height: 1.4;
    color: var(--text);
    letter-spacing: 0;
    margin: 0;
    flex: 1 1 auto;
    min-width: 0;
    overflow-wrap: anywhere;
    word-break: break-word;
    white-space: normal;
  }

  /* Description — alignée sur .di-detail : body 14 / weight 300 / soft / lh 1.6 */
  .fiche-v2 .plan-card .p-desc {
    font-family: var(--body);
    font-weight: 300;
    font-size: 14px;
    line-height: 1.6;
    color: var(--soft, rgba(255,255,255,0.78));
    margin: 0;
  }

  /* MESURÉ / OBJECTIF — 2 colonnes, même recette typo que diagnostic :
     labels en mono 9.5/1.5/500 (comme .diag-cat-head .name),
     valeurs en body 14/300/soft (comme .di-detail). */
  .fiche-v2 .plan-card .p-measure {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed rgba(255,255,255,0.08);
  }
  .fiche-v2 .plan-card .p-measure .m-label {
    font-family: var(--mono);
    font-weight: 500;
    font-size: 9.5px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--muted, rgba(255,255,255,0.5));
    margin: 0;
  }
  /* Valeur MESURÉ / OBJECTIF — strictement identique à .diag-item .di-detail :
     DM Sans 14 / weight 300 / color --soft / line-height 1.6 / casse naturelle. */
  .fiche-v2 .plan-card .p-measure .m-val {
    font-family: var(--body, 'DM Sans', sans-serif);
    font-weight: 300;
    font-size: 14px;
    line-height: 1.6;
    letter-spacing: 0;
    text-transform: none;
    color: var(--soft, #c5c5c7);
    margin-top: 4px;
  }
  .fiche-v2 .plan-card .p-measure .m-val.target {
    font-family: var(--body, 'DM Sans', sans-serif);
    font-weight: 300;
    font-size: 14px;
    line-height: 1.6;
    letter-spacing: 0;
    text-transform: none;
    color: var(--mint, #8ee07a);
  }

  /* Chips d'éléments liés — alignés sur .di-tools span :
     mono 12 / muted / border / padding 3x8 / casse naturelle. */
  .fiche-v2 .plan-card .p-links {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }
  .fiche-v2 .plan-card .p-links .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px;
    border-radius: 4px;
    background: transparent;
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    font-family: var(--mono);
    font-weight: 400;
    font-size: 12px;
    letter-spacing: 0;
    text-transform: none;
    color: var(--muted, rgba(255,255,255,0.5));
    line-height: 1.2;
  }
  .fiche-v2 .plan-card .p-links .chip.cerulean {
    color: var(--cerulean);
    border-color: rgba(92,184,204,0.3);
    background: rgba(92,184,204,0.08);
  }

  /* Cache la section-head historique : on a le plan-eyebrow à la place */
  .fiche-v2 .col-plan > .section-head { display: none; }

  /* ══════════════════════════════════════════════════════════════════════════
     ÉVOLUTION v2 (desktop) — barres dégradées avec scores au-dessus et
     labels Vn en dessous, dernière barre en ambre, caption mint centrée.
     Matche maquette-v2-complete.html L957-982 + L2559-2578.
     ══════════════════════════════════════════════════════════════════════════ */

  /* Eyebrow mint avec dot (override du cerulean qu'on avait posé plus haut) */
  .fiche-v2 .evolution-panel .vr-title {
    font-family: var(--mono);
    font-size: 10.5px;
    letter-spacing: 2.2px;
    text-transform: uppercase;
    color: var(--mint, #8ee07a);
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }
  .fiche-v2 .evolution-panel .vr-title::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--mint, #8ee07a);
    flex-shrink: 0;
  }

  /* Halo cerulean conservé (déjà défini plus haut) — on ajuste juste le padding */
  .fiche-v2 .evolution-panel {
    padding: 20px 22px 18px;
    gap: 4px;
  }

  /* Barres : 80px de haut, padding pour laisser place aux labels haut/bas */
  .fiche-v2 .evolution-panel .spark {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    height: 80px;
    padding: 22px 4px 26px;
  }
  .fiche-v2 .evolution-panel .spark .bar {
    flex: 1;
    min-width: 24px;
    border-radius: 4px 4px 0 0;
    position: relative;
    background: linear-gradient(180deg, var(--cerulean), rgba(92,184,204,0.3));
    overflow: visible;
  }
  /* Override des tiers low/mid/high : toutes les barres sont cerulean,
     sauf la latest qui devient ambre — match maquette */
  .fiche-v2 .evolution-panel .spark .bar.low,
  .fiche-v2 .evolution-panel .spark .bar.mid,
  .fiche-v2 .evolution-panel .spark .bar.high {
    background: linear-gradient(180deg, var(--cerulean), rgba(92,184,204,0.3));
  }
  .fiche-v2 .evolution-panel .spark .bar.latest,
  .fiche-v2 .evolution-panel .spark .bar:last-child {
    background: linear-gradient(180deg, var(--amber), #ffc77a);
  }

  /* Le score affiché au-dessus de chaque barre */
  .fiche-v2 .evolution-panel .spark .bar .v-num {
    position: absolute;
    top: -18px; left: 0; right: 0;
    text-align: center;
    font-family: var(--mono);
    font-size: 10px;
    color: var(--soft, rgba(255,255,255,0.78));
    font-weight: 500;
  }
  /* Le label V1/V2/V3 en dessous */
  .fiche-v2 .evolution-panel .spark .bar .v-label {
    position: absolute;
    bottom: -20px; left: 0; right: 0;
    text-align: center;
    font-family: var(--mono);
    font-size: 9.5px;
    color: var(--muted, rgba(255,255,255,0.5));
    letter-spacing: 0.5px;
  }

  /* Le caption "↑ +N points depuis Vx" centré et mint, on cache les noms
     des extrémités (déjà visibles dans les v-label) */
  .fiche-v2 .evolution-panel .evo-label {
    justify-content: center;
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--mint, #8ee07a);
    margin-top: 8px;
  }
  .fiche-v2 .evolution-panel .evo-label > span:not(.delta) {
    display: none;
  }
  .fiche-v2 .evolution-panel .evo-label .delta {
    background: transparent;
    color: var(--mint, #8ee07a);
    padding: 0;
    border-radius: 0;
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .fiche-v2 .evolution-panel .evo-label .delta.up { color: var(--mint, #8ee07a); }
  .fiche-v2 .evolution-panel .evo-label .delta.down { color: var(--red); }
  .fiche-v2 .evolution-panel .evo-label .delta.up::before { content: '↑ '; }
  .fiche-v2 .evolution-panel .evo-label .delta.down::before { content: '↓ '; }

  /* Stats-grid (Version active + Durée) — restylage léger pour matcher la
     trame mono/serif sobre, sans bg lourd */
  .fiche-v2 .evolution-panel .stats-grid {
    margin-top: 14px;
    gap: 8px;
  }
  .fiche-v2 .evolution-panel .stats-grid .stat {
    background: rgba(255,255,255,0.02);
    border: none;
    border-radius: 8px;
    padding: 10px 12px;
  }
  .fiche-v2 .evolution-panel .stats-grid .stat .k {
    font-family: var(--mono);
    font-size: 9.5px;
    letter-spacing: 1.5px;
    color: var(--muted, rgba(255,255,255,0.5));
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .fiche-v2 .evolution-panel .stats-grid .stat .v {
    font-family: var(--body);
    font-weight: 600;
    font-size: 15px;
    color: var(--text);
  }
  .fiche-v2 .evolution-panel .stats-grid .stat .d {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--muted, rgba(255,255,255,0.5));
    margin-top: 3px;
  }

  /* Utilitaires panel réutilisables (pour plus tard : diag tiles, plan cards) */
  .fg-panel {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 18px;
    position: relative;
    overflow: hidden;
  }
  .fg-panel > * { position: relative; z-index: 1; }
  .fg-panel::before {
    content: ''; position: absolute;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(42px);
    z-index: 0;
    opacity: 0.55;
  }
  .fg-panel.amber-glow::before {
    top: -30%; right: -25%; width: 280px; height: 280px;
    background: radial-gradient(circle, rgba(245,166,35,0.55), transparent 70%);
  }
  .fg-panel.cerulean-glow::before {
    top: -28%; right: -22%; width: 260px; height: 260px;
    background: radial-gradient(circle, rgba(92,184,204,0.4), transparent 70%);
  }
  .fg-panel.mint-glow::before {
    top: -30%; right: -22%; width: 260px; height: 260px;
    background: radial-gradient(circle, rgba(142,224,122,0.35), transparent 70%);
  }
  .fg-eyebrow {
    font-family: var(--mono);
    font-size: 11px; letter-spacing: 2.5px;
    text-transform: uppercase; font-weight: 500;
    color: var(--muted); margin-bottom: 10px;
  }
  .fg-eyebrow.amber { color: var(--amber); }
  .fg-eyebrow.cerulean { color: var(--cerulean); }
  .fg-eyebrow.mint { color: var(--green); }

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
    font-family: var(--mono); font-size: 12px; color: var(--muted);
    letter-spacing: 0.5px; font-weight: 400; margin-top: 6px;
  }
  .score-ring .unit { font-family: var(--mono); font-size: 12px; color: var(--muted); letter-spacing: 1px; margin-top: 4px; }
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
    font-size: 12px;
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
    /* Fond solide un peu plus clair que --s1 pour bien trancher sur le halo
     ambre derrière le panel score (sinon l'explication paraît transparente). */
    background: #1a1b24;
    border: 1px solid rgba(255, 255, 255, 0.1);
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
    font-size: 14px;
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
    font-size: 12px;
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
    font-size: 12px;
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
    font-size: 12px;
    color: var(--amber);
    padding: 8px 10px;
    background: rgba(245, 176, 86, 0.08);
    border-radius: 6px;
    margin-bottom: 10px;
  }
  .ring-tooltip .rt-note {
    font-family: var(--body);
    font-size: 14px;
    line-height: 1.5;
    color: var(--soft);
    font-weight: 300;
  }

  /* ── Tooltips sur les 6 tuiles mix indicators ─────────────
     Même pattern que .ring-tooltip : hover / tip-open togglent
     l'opacité. Positionnement adapté à la grille 2x3 (les tuiles
     de la colonne droite et de la dernière ligne retournent
     l'ancrage pour éviter les débordements). */
  .fiche-v2 .row-verdict .rv-left .mi-tile {
    position: relative;
    cursor: help;
    transition: background-color .16s ease, border-color .16s ease;
  }
  .fiche-v2 .row-verdict .rv-left .mi-tile:hover,
  .fiche-v2 .row-verdict .rv-left .mi-tile.tip-open {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.12);
  }
  .fiche-v2 .row-verdict .rv-left .mi-tile .mi-help {
    position: absolute;
    top: 4px;
    right: 6px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--s3, rgba(255,255,255,0.06));
    color: var(--muted, rgba(255,255,255,0.5));
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity .18s ease;
    pointer-events: none;
  }
  .fiche-v2 .row-verdict .rv-left .mi-tile:hover .mi-help,
  .fiche-v2 .row-verdict .rv-left .mi-tile.tip-open .mi-help { opacity: 0.8; }

  .fiche-v2 .row-verdict .rv-left .mi-tile .mi-tooltip {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    transform: translateY(-4px);
    width: 280px;
    max-width: min(280px, calc(100vw - 40px));
    background: #1a1b24;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 12px 14px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
    opacity: 0;
    pointer-events: none;
    transition: opacity .16s ease, transform .16s ease;
    z-index: 210;
    text-align: left;
  }
  /* Tuiles de la colonne de droite → ancrage à droite */
  .fiche-v2 .row-verdict .rv-left .mix-indicators .mi-tile:nth-child(even) .mi-tooltip {
    left: auto;
    right: 0;
  }
  /* Dernière ligne (5e et 6e tuile) → tooltip au-dessus */
  .fiche-v2 .row-verdict .rv-left .mix-indicators .mi-tile:nth-child(n+5) .mi-tooltip {
    top: auto;
    bottom: calc(100% + 8px);
  }
  .fiche-v2 .row-verdict .rv-left .mi-tile:hover .mi-tooltip,
  .fiche-v2 .row-verdict .rv-left .mi-tile.tip-open .mi-tooltip {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
  /* Boost de z-index sur les containers quand un tooltip est ouvert,
     pour passer au-dessus des sections sticky environnantes. */
  .fiche-v2 .row-verdict .rv-left .rv-top:has(.mi-tile.tip-open),
  .fiche-v2 .row-verdict .rv-left .rv-top:has(.mi-tile:hover) {
    z-index: 120;
    position: relative;
  }

  .mi-tooltip .mt-head {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--body, 'DM Sans', sans-serif);
    font-size: 13px;
    color: var(--text, #f5f4ef);
    margin-bottom: 10px;
  }
  .mi-tooltip .mt-head .mt-dot {
    width: 8px; height: 8px; border-radius: 50%;
  }
  .mi-tooltip .mt-head strong { font-weight: 500; }
  .mi-tooltip .mt-head .mt-val {
    margin-left: auto;
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    color: var(--muted, rgba(255,255,255,0.5));
  }
  .mi-tooltip .mt-section { margin-bottom: 8px; }
  .mi-tooltip .mt-section:last-of-type { margin-bottom: 4px; }
  .mi-tooltip .mt-h {
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 9.5px;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: var(--muted, rgba(255,255,255,0.5));
    margin-bottom: 3px;
    font-weight: 500;
  }
  .mi-tooltip .mt-p {
    font-family: var(--body, 'DM Sans', sans-serif);
    font-size: 13px;
    line-height: 1.45;
    color: var(--soft, rgba(255,255,255,0.8));
    font-weight: 300;
  }
  .mi-tooltip .mt-sources {
    margin-top: 4px;
    margin-bottom: 8px;
    padding: 8px 10px;
    background: rgba(255,255,255,0.03);
    border-radius: 6px;
  }
  .mi-tooltip .mt-sources ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .mi-tooltip .mt-sources li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    color: var(--soft, rgba(255,255,255,0.75));
  }
  .mi-tooltip .mt-sources .mt-src-val {
    color: var(--muted, rgba(255,255,255,0.55));
  }
  .mi-tooltip .mt-note {
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 10px;
    letter-spacing: 0.3px;
    color: var(--muted, rgba(255,255,255,0.5));
    font-style: italic;
    margin-top: 6px;
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
    font-size: 14px;
    line-height: 1.7;
    color: var(--soft);
    font-weight: 300;
    margin: 0;
    max-width: 780px;
  }
  .verdict-text .analyzed-at {
    margin-top: 10px;
    font-family: var(--mono);
    font-size: 12px;
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
    font-family: var(--mono); font-size: 12px; letter-spacing: 2px;
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
    color: var(--muted); font-family: var(--mono); font-size: 12px;
  }
  .evo-label {
    display: flex; justify-content: space-between; align-items: center;
    font-family: var(--mono); font-size: 12px; color: var(--muted);
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
    font-family: var(--mono); font-size: 12px; letter-spacing: 1.5px;
    color: var(--muted); text-transform: uppercase; margin-bottom: 4px;
  }
  .stats-grid .stat .v {
    font-family: var(--serif); font-size: 18px; color: var(--text);
    line-height: 1.1;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .stats-grid .stat .d {
    font-family: var(--mono); font-size: 12px; color: var(--muted); margin-top: 3px;
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
    font-family: var(--mono); font-size: 12px; letter-spacing: 2px;
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
    font-family: var(--mono); font-size: 12px; color: var(--muted2);
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
    font-family: var(--mono); font-size: 12px; letter-spacing: 1.5px;
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
    font-family: var(--mono); font-size: 12px; letter-spacing: 1.5px;
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
    font-family: var(--mono); font-size: 12px; letter-spacing: 2px; color: var(--muted); text-transform: uppercase;
    white-space: nowrap;
  }
  .section-head .line { flex: 1; height: 1px; background: var(--border); }
  .section-head .count {
    font-family: var(--mono); font-size: 12px; color: var(--muted2);
  }
  .section-head .plan-filter-toggle {
    all: unset;
    cursor: pointer;
    font-family: var(--mono);
    font-size: 12px;
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
    font-family: var(--mono); font-size: 12px;
    padding: 3px 7px; border-radius: 4px;
    letter-spacing: 1px;
    flex-shrink: 0;
  }
  .pbadge.high { background: #ef6b6b22; color: var(--red); }
  .pbadge.med  { background: var(--amber-glow); color: var(--amber); }
  .pbadge.low  { background: var(--s3); color: var(--muted); }

  .ptitle {
    flex: 1;
    font-family: var(--body); font-size: 14px; font-weight: 300; line-height: 1.4;
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
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text);
    white-space: nowrap;
  }
  .notes-head .notes-preview {
    flex: 1;
    min-width: 0;
    font-family: var(--body);
    font-size: 14px;
    color: var(--soft);
    font-weight: 300;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .notes-head .notes-status {
    font-family: var(--mono);
    font-size: 12px;
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

  /* ── Notes v2 (desktop, maquette) ───────────────────────── */
  .fiche-v2 .notes-section.v2 {
    margin-top: 18px;
    padding: 0;
    position: relative;
  }
  .fiche-v2 .notes-panel {
    position: relative;
    background: var(--card, #101118);
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    border-radius: 14px;
    padding: 20px 22px 18px;
    overflow: hidden;
  }
  .fiche-v2 .notes-panel::before {
    content: "";
    position: absolute;
    right: -60px; bottom: -60px;
    width: 180px; height: 180px;
    background: var(--cerulean, #5cb8cc);
    filter: blur(70px);
    opacity: 0.10;
    pointer-events: none;
    z-index: 0;
  }
  .fiche-v2 .notes-panel > * { position: relative; z-index: 1; }
  .fiche-v2 .notes-panel .notes-eyebrow {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 10.5px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--muted, rgba(255,255,255,0.5));
    margin: 0 0 12px;
    line-height: 1;
  }
  .fiche-v2 .notes-panel .notes-eyebrow .dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--cerulean, #5cb8cc);
    box-shadow: 0 0 8px rgba(92,184,204,0.6);
    flex-shrink: 0;
  }
  .fiche-v2 .notes-panel .notes-eyebrow .notes-status {
    margin-left: auto;
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 1px;
    color: var(--amber, #f5a623);
    text-transform: uppercase;
    opacity: 0.85;
  }
  .fiche-v2 .notes-panel .notes-box {
    width: 100%;
    box-sizing: border-box;
    padding: 12px 14px;
    background: rgba(0,0,0,0.25);
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    border-radius: 10px;
    color: var(--soft, rgba(255,255,255,0.78));
    font-family: var(--body, 'DM Sans', sans-serif);
    font-size: 13.5px;
    font-style: italic;
    line-height: 1.55;
    min-height: 80px;
    resize: vertical;
    outline: none;
    transition: border-color .15s ease, background .15s ease;
  }
  .fiche-v2 .notes-panel .notes-box:focus {
    border-color: rgba(92,184,204,0.4);
    background: rgba(0,0,0,0.35);
  }
  .fiche-v2 .notes-panel .notes-box::placeholder {
    color: var(--muted, rgba(255,255,255,0.5));
    opacity: 0.7;
    font-style: italic;
  }
  .fiche-v2 .notes-panel .notes-box:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .fiche-v2 .notes-panel .notes-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 10px;
  }
  .fiche-v2 .notes-panel .notes-actions .btn {
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    font-weight: 500;
    padding: 7px 16px;
    border-radius: 999px;
    cursor: pointer;
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    background: transparent;
    color: var(--soft, rgba(255,255,255,0.78));
    display: inline-flex;
    align-items: center;
    gap: 6px;
    line-height: 1;
    transition: background .15s ease, border-color .15s ease, color .15s ease;
  }
  .fiche-v2 .notes-panel .notes-actions .btn:hover:not(:disabled) {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.14);
  }
  .fiche-v2 .notes-panel .notes-actions .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .fiche-v2 .notes-panel .notes-actions .btn.primary {
    background: transparent;
    color: var(--amber, #f5a623);
    border-color: var(--amber, #f5a623);
  }
  .fiche-v2 .notes-panel .notes-actions .btn.primary:hover:not(:disabled) {
    background: rgba(245, 166, 35, 0.12);
    border-color: var(--amber, #f5a623);
    color: var(--amber, #f5a623);
  }
  .fiche-v2 .notes-panel .notes-actions .btn.primary:disabled {
    background: transparent;
    border-color: var(--amber, #f5a623);
    color: var(--amber, #f5a623);
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
    font-family: var(--mono); font-size: 12px; letter-spacing: 2px; color: var(--amber); text-transform: uppercase;
    flex: 1;
  }
  .diag-cat-head .chev {
    color: var(--muted);
    transition: transform .15s;
  }
  .diag-cat.open .diag-cat-head .chev { transform: rotate(90deg); }
  .diag-cat-head .count {
    font-family: var(--mono); font-size: 12px; color: var(--muted);
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
    font-family: var(--mono); font-size: 12px; color: var(--muted);
  }
  .diag-item .di-body { flex: 1; }
  .diag-item .di-name { font-family: var(--body); font-size: 14px; font-weight: 400; margin-bottom: 4px; }
  .diag-item .di-detail { font-size: 14px; color: var(--soft); line-height: 1.6; font-weight: 300; margin-bottom: 10px; }
  .diag-item .di-tools { display: flex; flex-wrap: wrap; gap: 6px; }
  .diag-item .di-tools span {
    font-family: var(--mono); font-size: 12px; color: var(--muted);
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
    font-family: var(--mono); font-size: 12px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase;
    padding: 6px 10px; border-radius: 6px;
  }
  .focus-back:hover { color: var(--amber); background: var(--s1); }
  .focus-local {
    display: flex; align-items: center; gap: 14px;
    font-family: var(--mono); font-size: 12px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase;
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
    font-size: 12px;
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
    font-family: var(--mono); font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase;
    margin-bottom: 8px;
  }
  .mt-box.m .mt-label { color: var(--amber); }
  .mt-box.t .mt-label { color: var(--green); }
  .mt-box .mt-val {
    font-family: var(--body); font-size: 14px; line-height: 1.6; color: var(--soft); font-weight: 300;
  }

  .linked-elements { margin-top: 34px; }
  .linked-elements .label {
    font-family: var(--mono); font-size: 12px; letter-spacing: 1.5px; color: var(--muted); text-transform: uppercase;
    margin-bottom: 14px;
  }
  .le-list { display: flex; flex-direction: column; gap: 8px; }
  .le {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 16px;
    border: 1px solid var(--border); border-radius: 8px;
  }
  .le .cat {
    font-family: var(--mono); font-size: 12px; letter-spacing: 1px;
    color: var(--muted); text-transform: uppercase;
    min-width: 60px;
  }
  .le .name { flex: 1; font-family: var(--body); font-size: 14px; font-weight: 500; }
  .le .sring { width: 26px; height: 26px; position: relative; flex-shrink: 0; }
  .le .sring svg { transform: rotate(-90deg); }
  .le .sring .n {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-family: var(--mono); font-size: 12px; color: var(--muted);
  }

  .resolve-action {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    margin-top: 40px;
    padding: 14px 22px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    cursor: pointer;
    font-family: var(--mono); font-size: 12px; letter-spacing: 1px; text-transform: uppercase;
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

  /* ── Player bottom bar (v2 dark identity) ─────────────────────
     Fond transparent-noir + blur, border-top fine. Play en amber avec
     un halo amber doux (amber-glow). État idle : play en amber semi,
     transport & waveform à 25 %. */
  .player {
    position: fixed; bottom: 0; left: 0; right: 0;
    height: 68px;
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid var(--border);
    display: flex; align-items: center;
    padding: 0 24px 0 260px; /* 240 sidebar + 20 */
    gap: 18px;
    z-index: 90;
  }
  .player .pl-btn {
    width: 40px; height: 40px; border-radius: 50%;
    background: var(--amber); color: #0a0a0c;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0;
    border: none;
    box-shadow: 0 4px 20px var(--amber-glow);
    transition: filter .15s, box-shadow .15s;
  }
  .player .pl-btn:hover {
    filter: brightness(1.08);
    box-shadow: 0 4px 26px rgba(245,166,35,0.28);
  }
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
    font-family: var(--body); font-size: 14px; font-weight: 300; color: var(--soft); line-height: 1; letter-spacing: 0.3px;
  }
  .player .pl-meta .pl-sub {
    font-family: var(--mono); font-size: 12px; color: var(--muted); letter-spacing: 1px;
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
  /* État idle : le wavesurfer n'a pas été instancié, on affiche un trait
     discret (ligne horizontale) à la place pour que la barre reste lisible
     et cohérente, même avant qu'une piste soit lancée. */
  .player .pl-wavesurfer:empty {
    background: linear-gradient(to bottom,
      transparent calc(50% - 1px),
      rgba(255,255,255,0.08) calc(50% - 1px),
      rgba(255,255,255,0.08) calc(50% + 1px),
      transparent calc(50% + 1px));
  }
  .player .pl-time {
    font-family: var(--mono); font-size: 12px; color: var(--muted);
    flex-shrink: 0; min-width: 78px; text-align: right;
  }
  .player .pl-time b { color: var(--text); font-weight: 500; }

  /* Volume : icône + popup slider vertical (réutilisable dans player + hero) */
  .pl-volume { position: relative; flex-shrink: 0; }
  /* Mobile (portrait ou paysage) : pas de contrôle volume dans le player —
     on utilise le volume matériel du téléphone. Même media query que
     useMobile (hooks/useMobile.js). */
  @media (max-width: 768px), (max-height: 500px) {
    .pl-volume { display: none !important; }
  }
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
    font-family: var(--mono); font-size: 12px; letter-spacing: 2px;
    color: var(--amber); text-transform: uppercase;
  }
  /* Aligné sur .add-mini-close (modales) : 28×28 radius 8, transparent,
     hover doux sur s2. Cohérent avec le reste des fermetures du site. */
  .chat-head .cclose {
    width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    background: transparent; border: none;
    color: var(--muted); cursor: pointer;
    border-radius: 8px;
    transition: color .15s, background .15s;
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
    font-size: 14px; line-height: 1.55; font-weight: 300;
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
  .chat-input textarea,
  .chat-input input {
    flex: 1;
    background: var(--s2) !important; border: 1px solid var(--border);
    padding: 10px 12px; border-radius: 8px;
    color: var(--text); font-family: var(--body) !important;
    font-size: 14px !important;
    outline: none; resize: none;
    line-height: 1.4;
    height: 44px; min-height: 44px;
    max-height: 120px;
    overflow-y: auto;
    -webkit-appearance: none;
    appearance: none;
    box-sizing: border-box;
  }
  .chat-input textarea:focus,
  .chat-input input:focus { border-color: var(--amber); }
  .chat-input textarea::placeholder,
  .chat-input input::placeholder { font-size: 14px !important; color: var(--muted); opacity: 1; }
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
    background: transparent; color: var(--amber);
    border: 1px solid rgba(245,176,86,0.45);
    padding: 0 18px; border-radius: 999px;
    font-family: var(--mono); font-size: 12px; letter-spacing: 1px; text-transform: uppercase;
    font-weight: 500;
    height: 40px; min-height: 40px;
    flex-shrink: 0;
    cursor: pointer;
    box-sizing: border-box;
    transition: border-color .15s, background .15s, color .15s;
  }
  .chat-input button:hover:not(:disabled) {
    border-color: var(--amber);
    background: rgba(245,176,86,0.06);
  }
  .chat-input button:disabled {
    opacity: 0.5; cursor: not-allowed;
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
  /* Layout desktop v2 avec chat : grid 2 colonnes (contenu + chat).
     Le chat est sticky pour rester visible au scroll, mais son point de
     depart est cale NATURELLEMENT sur le haut de .page via le grid : plus
     de "top" hardcode qui desaligne quand on touche a la topbar. */
  .fiche-layout.has-chat {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 400px;
    column-gap: 16px;
    padding-right: 16px;
    align-items: start;
  }
  .fiche-layout.has-chat > .page { min-width: 0; }
  /* Chat en position: fixed pour rester TOUJOURS visible au scroll, ancré
     entre la topbar (72 px) et le BottomPlayer (84 px). La colonne droite du
     grid .fiche-layout.has-chat (400 px) sert de placeholder pour que .page
     s'arrête à la bonne largeur ; le chat se superpose pixel-perfect dessus.
     (Ancienne implémentation en position:sticky qui lâchait après un certain
     scroll selon la hauteur du parent grid — bypass via fixed.) */
  .fiche-chat-side {
    position: fixed;
    top: 98px;              /* 72 topbar + 26 marge visuelle */
    bottom: 100px;          /* 84 bottom player + 16 respiration */
    /* right et width sont calculés pour matcher exactement la cellule
       grid de la colonne 2 (400 px) + le padding-right du parent (16 px). */
    right: 16px;
    width: 400px;
    z-index: 12;
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
  .chat-panel.chat-panel-anchored .chat-head { padding: 14px 18px; }
  .chat-panel.chat-panel-anchored .chat-body { padding: 16px 14px; }
  .chat-panel.chat-panel-anchored .chat-input { padding: 10px 12px 12px; }

  /* Titre "Discussion" en desktop : même style que les autres eyebrow
     (mono 10.5 / ls 2.2 / uppercase + gros point ambre devant) */
  .fiche-v2 .chat-panel.chat-panel-anchored .chat-head .ctitle {
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 10.5px;
    letter-spacing: 2.2px;
    text-transform: uppercase;
    color: var(--amber, #f5a623);
    display: inline-flex;
    align-items: center;
    gap: 10px;
    line-height: 1;
  }
  .fiche-v2 .chat-panel.chat-panel-anchored .chat-head .ctitle::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--amber, #f5a623);
    flex-shrink: 0;
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
    font-family: var(--mono); font-size: 12px; letter-spacing: 2px;
    color: var(--amber); text-transform: uppercase;
  }
  .wh-tip-text {
    font-family: var(--body); font-size: 14px; color: var(--soft);
    line-height: 1.7; font-weight: 300;
  }

  .wh-actions {
    display: flex; justify-content: center; gap: 12px;
  }
  .wh-action {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 22px; border-radius: 10px;
    background: transparent; border: 1px solid var(--border);
    color: var(--soft); font-family: var(--body); font-size: 14px; font-weight: 300;
    cursor: pointer; transition: all .2s;
  }
  .wh-action:hover {
    border-color: var(--amber); color: var(--amber); background: rgba(245,176,86,0.06);
  }
  .wh-action-icon {
    font-size: 14px; line-height: 1;
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
  /* Le tagline hero reste visible sur desktop avec le nouveau grand titre v2. */
  /* .wh-desktop .wh-tagline-hero { display: none; } */

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

  /* Bouton Ajouter dans la sidebar — en fin de liste de projets.
     Remplace l'ancien bouton flottant (.wh-add-floating) pour un accès
     permanent depuis n'importe quel écran. Style aligné sur le chip
     violet de la maquette v2 (.v4-chip.violet) : pill, mono caps,
     remplissage + bordure violet dilué. */
  .sidebar-add-btn {
    display: inline-flex; align-items: center; justify-content: center;
    gap: 6px;
    /* align-self: center pour que dans un parent flex-column (qui stretch
       ses enfants par défaut), le bouton reste à la largeur de son contenu
       et se centre horizontalement dans la sidebar. */
    align-self: center;
    margin-top: 12px;
    padding: 7px 14px;
    background: rgba(166,126,245,0.1);
    border: 1px solid rgba(166,126,245,0.35);
    color: var(--violet);
    border-radius: 999px;
    font-family: var(--mono);
    font-size: 11px; letter-spacing: 1.2px; text-transform: uppercase;
    font-weight: 500;
    cursor: pointer;
    transition: background .15s, border-color .15s, color .15s;
  }
  .sidebar-add-btn:hover {
    background: rgba(166,126,245,0.18);
    border-color: rgba(166,126,245,0.55);
    color: #b892ff;
  }
  .sidebar-add-icon {
    font-size: 14px; line-height: 1; font-weight: 500;
    margin-top: -1px;
  }
  .wh-desktop .wh-header { margin-bottom: 4px; align-items: flex-start; }
  .wh-desktop .wh-greeting { font-size: 28px; letter-spacing: 2.5px; text-align: left; }
  .wh-desktop .wh-actions { justify-content: flex-start; flex-wrap: wrap; }
  .wh-desktop .wh-tracklist { max-width: none; margin: 0; }
  /* Titre "Mes projets" en desktop — même recette eyebrow que les titres
     de section de la colonne droite (.wh-rcol-title) : mono 10.5px,
     letter-spacing 2.2px, uppercase, pastille amber en tête. */
  .wh-desktop .wh-projects-title {
    display: flex; align-items: center; gap: 10px;
    font-family: var(--mono);
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: 2.2px;
    line-height: 1;
    color: var(--text);
    text-transform: uppercase;
    padding: 16px 18px 14px;
    margin: 0;
    border-bottom: 1px solid var(--border);
  }
  .wh-desktop .wh-projects-title::before {
    content: '';
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--amber); flex-shrink: 0;
  }
  .wh-desktop .wh-projects-title em {
    font-family: inherit; font-size: inherit; font-weight: inherit;
    letter-spacing: inherit; font-style: normal;
    color: inherit; text-transform: inherit;
  }
  /* La 1re row n'a plus besoin d'arrondis au sommet (le titre coiffe le panneau) */
  .wh-desktop .wh-projects-title + .wh-acc-item:first-of-type {
    border-top-left-radius: 0; border-top-right-radius: 0;
  }
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
    font-family: var(--mono); font-size: 12px; letter-spacing: 3px;
    color: var(--amber); text-transform: uppercase;
  }
  /* Tagline desktop : aligné à gauche et agrandi façon mockup v2.
     Sur mobile, on garde la version centrée (règle par défaut ci-dessus). */
  .wh-tagline-text {
    font-family: var(--serif); font-style: italic; font-size: 34px;
    line-height: 1.25; color: var(--text); max-width: 760px;
    font-weight: 400;
  }
  /* Bloc intro desktop : eyebrow + slogan fixe + tagline rotative.
     La tagline rotative est placée à droite du slogan pour équilibrer
     horizontalement. On garde l'eyebrow empilée au-dessus. */
  .wh-desktop .wh-intro {
    padding: 24px 0 18px;
    display: flex; flex-direction: column; gap: 16px;
    max-width: 1400px;
  }
  /* Grille alignée sur les 4 colonnes des stats en dessous : slogan occupe
     les 2 premières colonnes, tagline les 2 dernières — elle se retrouve
     ainsi centrée à cheval sur "Score moyen" et "Progression". */
  .wh-desktop .wh-intro-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    align-items: center;
    width: 100%;
    /* Respiration verticale pour détacher "Écoute, compare, décide." */
    padding: 28px 0 32px;
  }
  .wh-desktop .wh-intro-row .wh-slogan {
    grid-column: 1 / 3;
    align-self: end;
    overflow: visible;
    min-width: 0;
  }
  /* Garantie absolue : "Écoute, compare," tient sur une seule ligne,
     même si la cellule de grille est plus étroite. Le <br/> force
     ensuite le passage à la ligne pour "décide.". */
  .wh-desktop .wh-slogan .wh-slogan-line {
    white-space: nowrap;
  }
  .wh-eyebrow {
    font-family: var(--mono); font-size: 11px; letter-spacing: 2.5px;
    text-transform: uppercase; color: var(--violet);
    display: flex; align-items: center; gap: 10px;
  }
  .wh-eyebrow::before {
    content: ''; width: 6px; height: 6px; border-radius: 50%;
    background: var(--violet);
    box-shadow: 0 0 12px var(--violet-glow);
  }
  .wh-slogan {
    font-family: var(--body); font-weight: 700;
    font-size: 88px; line-height: 0.96;
    letter-spacing: -3.5px; color: var(--text);
    margin: 0;
  }
  .wh-slogan em {
    font-family: inherit; font-style: normal; font-weight: inherit;
    letter-spacing: inherit; color: var(--amber);
  }
  .wh-desktop .wh-intro .wh-tagline-text {
    position: relative;
    grid-column: 3 / 5;
    justify-self: center;
    align-self: center;
    font-family: var(--serif); font-style: italic;
    font-size: 20px; font-weight: 400;
    line-height: 1.45; color: var(--soft);
    max-width: 520px;
    margin: 0;
    padding-left: 42px;
  }
  .wh-desktop .wh-intro .wh-tagline-text::before {
    content: '“';
    position: absolute;
    left: 4px; top: 50%;
    transform: translateY(-38%);
    font-family: var(--serif);
    font-style: normal; font-weight: 400;
    font-size: 86px; line-height: 1;
    color: var(--text); opacity: 0.14;
    pointer-events: none;
  }
  /* Breakpoint intermédiaire : entre 1300 et 1500 px de viewport, on donne
     plus de place au slogan (3/4 colonnes au lieu de 2/4) et on laisse la
     tagline wrap sur plusieurs lignes dans la dernière colonne, SANS
     réduire sa taille — elle garde sa typo 20 px serif italic d'origine. */
  @media (max-width: 1500px) {
    .wh-desktop .wh-intro-row .wh-slogan {
      grid-column: 1 / 4;
    }
    .wh-desktop .wh-intro .wh-tagline-text {
      grid-column: 4 / 5;
      max-width: none;
      justify-self: stretch;
    }
  }
  /* Sous 1300 px de viewport, on bascule en layout colonne : slogan en
     pleine largeur, tagline en dessous. Évite tout chevauchement. */
  @media (max-width: 1300px) {
    .wh-desktop .wh-intro-row {
      display: flex; flex-direction: column;
      align-items: flex-start; gap: 8px;
    }
    .wh-desktop .wh-intro-row .wh-slogan,
    .wh-desktop .wh-intro .wh-tagline-text {
      grid-column: auto;
      justify-self: auto; align-self: auto;
    }
    .wh-desktop .wh-intro .wh-tagline-text {
      padding-left: 0;
      max-width: 720px; margin-top: 8px;
      font-size: 20px;
      line-height: 1.45;
    }
    .wh-desktop .wh-intro .wh-tagline-text::before { display: none; }
  }
  /* wh-tagline-hero n'est plus utilisée (la tagline vit dans wh-intro).
     Cette règle reste par sécurité si un template externe le réintroduit. */
  .wh-desktop .wh-tagline-hero { display: none; }

  /* ═══════════════════════════════════════════════════════════════════
     HOME DESKTOP — Responsive (tablette / mobile)
     La structure JSX est la même sur tous écrans (même wh-intro,
     wh-onboarding, wh-cols, wh-stats) ; seul le layout se transforme ici.
     ═══════════════════════════════════════════════════════════════════ */

  /* Tablette : stats passent en grille 2x2 au lieu de 4 colonnes. */
  @media (max-width: 960px) {
    .wh-desktop .wh-stats {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Tablette étroite / grand mobile : les deux colonnes de wh-cols
     s'empilent. Permet aux cartes (projets + conseils) d'être lisibles. */
  @media (max-width: 860px) {
    .wh-desktop .wh-cols {
      grid-template-columns: 1fr !important;
    }
  }

  /* Mobile : ajustements typo + padding pour que tout rentre proprement
     à 375–420px de viewport. */
  @media (max-width: 640px) {
    /* Intro : padding resserré, slogan divisé par ~2, tagline plus petite. */
    .wh-desktop .wh-intro {
      padding: 12px 0 10px;
      gap: 10px;
    }
    .wh-desktop .wh-intro-row {
      padding: 14px 0 16px;
      gap: 10px;
    }
    .wh-eyebrow {
      font-size: 10px; letter-spacing: 2px;
    }
    .wh-slogan {
      font-size: 52px;
      letter-spacing: -1.8px;
      line-height: 0.98;
    }
    .wh-desktop .wh-slogan .wh-slogan-line {
      white-space: normal;
    }
    .wh-desktop .wh-intro .wh-tagline-text {
      font-size: 18px;
      line-height: 1.4;
      padding-left: 0;
    }
    .wh-desktop .wh-intro .wh-tagline-text::before { display: none; }

    /* Bloc onboarding : stack la colonne gauche (welcome+CTAs) sur la
       checklist. Padding et welcome resserrés. */
    .wh-onboarding {
      grid-template-columns: 1fr;
      padding: 24px 22px;
      gap: 20px;
    }
    .wh-ob-welcome {
      font-size: 30px;
      letter-spacing: -0.8px;
    }
    .wh-ob-tagline {
      font-size: 18px;
      line-height: 1.35;
    }
    .wh-ob-ctas { gap: 8px; }

    /* Stats : 2x2 reste OK, mais on réduit la hauteur min et les valeurs. */
    .wh-stat {
      padding: 14px 14px;
      min-height: 96px;
    }
    .wh-stat-value { font-size: 32px; letter-spacing: -0.8px; }
    .wh-stat-label, .wh-stat-hint {
      font-size: 9.5px; letter-spacing: 1.5px;
    }

    /* Override du preview 0 projet (50/50 inline) pour stacker aussi. */
    .wh-desktop .wh-cols[style*="1fr) minmax(0, 1fr)"] {
      grid-template-columns: 1fr !important;
    }

    /* ─── Rythme vertical uniforme sur toute la Home mobile ───────────
       Même recette que la fiche : un seul gap 16px à tous les niveaux de
       containers flex (welcome-home, wh-cols, wh-col-left/right, wh-stats,
       wh-rcol-cards). Neutralisation des margins internes qui s'ajoutaient. */
    .welcome-home.wh-desktop { gap: 16px !important; }
    .wh-desktop .wh-cols { gap: 16px !important; }
    .wh-desktop .wh-col-left { gap: 16px !important; }
    .wh-desktop .wh-col-right { gap: 16px !important; }
    .wh-desktop .wh-stats { gap: 16px !important; }
    .wh-rcol-cards { gap: 12px !important; }

    /* Neutralise les margin top/bottom sur les sections directes
       de .welcome-home pour que seul le gap régisse l'écart. */
    .welcome-home.wh-desktop > .wh-intro,
    .welcome-home.wh-desktop > .wh-stats,
    .welcome-home.wh-desktop > .wh-onboarding,
    .welcome-home.wh-desktop > .wh-cols,
    .welcome-home.wh-desktop > .wh-tagline-hero {
      margin: 0 !important;
    }

    /* Padding uniforme sur les "cartes" de la Home — stats, rcol-section,
       wh-onboarding, wh-card intérieures — pour un rythme régulier. */
    .wh-rcol-section {
      padding: 18px 18px 16px;
    }
    .wh-stat {
      padding: 16px 16px;
    }
    .wh-onboarding {
      padding: 22px 20px !important;
    }
  }

  /* Très petit mobile : encore un poil de compaction. */
  @media (max-width: 380px) {
    .wh-slogan { font-size: 42px; letter-spacing: -1.4px; }
    .wh-ob-welcome { font-size: 26px; }
  }

  /* Mobile en mode paysage : la largeur peut dépasser 900px (ex: iPhone
     14 Pro Max landscape = 932×430), donc les breakpoints max-width ne
     déclenchent plus. On se base sur max-height pour détecter un mobile
     landscape et appliquer les typos compactes — mais on profite de la
     largeur disponible (~900px) pour laisser le slogan plus présent. */
  @media (max-height: 500px) {
    .wh-slogan {
      font-size: 64px;
      letter-spacing: -2.2px;
      line-height: 0.98;
    }
    .wh-desktop .wh-slogan .wh-slogan-line {
      white-space: normal;
    }
    .wh-desktop .wh-intro .wh-tagline-text {
      font-size: 18px;
      line-height: 1.4;
      padding-left: 0;
    }
    .wh-desktop .wh-intro .wh-tagline-text::before { display: none; }
    .wh-desktop .wh-intro {
      padding: 8px 0 6px;
    }
    .wh-desktop .wh-intro-row {
      padding: 8px 0 10px;
    }
    .wh-ob-welcome { font-size: 32px; letter-spacing: -1px; }
    .wh-ob-tagline { font-size: 18px; }

    /* Fiche en paysage : score ring plus gros (on a la place) mais le
       chiffre doit rester contenu. 44px sur un ring 140×140 = respiration. */
    .fiche-v2 .row-verdict .rv-left .score-ring .big,
    .fiche-v2 .score-ring .big {
      font-size: 44px !important;
      letter-spacing: -1.2px;
      line-height: 1;
    }
    .fiche-v2 .row-verdict .rv-left .score-ring .big-suffix,
    .fiche-v2 .score-ring .big-suffix {
      font-size: 10px !important;
      margin-top: 6px;
    }
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
    font-family: var(--mono); font-size: 12px; letter-spacing: 2px;
    text-transform: uppercase; color: var(--amber);
  }
  .wh-hero-title {
    /* Même taille que la tagline desktop (28px), sans italique. */
    font-family: var(--serif); font-size: 28px; font-weight: 400;
    line-height: 1.3; letter-spacing: 0.3px;
    margin: 4px 0 6px; color: var(--text);
  }
  .wh-hero-meta {
    font-family: var(--mono); font-size: 12px; color: var(--muted); letter-spacing: 0.5px;
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
    font-family: var(--mono); font-size: 12px; letter-spacing: 1.5px;
    color: var(--muted); text-transform: uppercase; font-weight: 400;
  }
  .wh-hero-score .lbl {
    font-family: var(--mono); font-size: 12px; letter-spacing: 1.5px;
    color: var(--muted); text-transform: uppercase;
  }
  .wh-hero-ctas { display: flex; gap: 10px; }
  /* Alignés sur .add-mini-btn (grammaire pill outline mono amber) pour
     rester cohérents avec les boutons des modales et le reste du site. */
  .wh-btn {
    display: inline-flex; align-items: center; justify-content: center;
    gap: 6px; padding: 10px 20px; border-radius: 999px;
    background: transparent; border: 1px solid var(--border);
    color: var(--soft);
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    letter-spacing: 1.2px; text-transform: uppercase;
    line-height: 16px; box-sizing: border-box;
    cursor: pointer; transition: all .15s;
    appearance: none; -webkit-appearance: none;
  }
  .wh-btn:hover:not(:disabled) {
    border-color: rgba(245,176,86,.4); color: var(--amber);
  }
  .wh-btn-primary {
    color: var(--amber); background: transparent;
    border-color: rgba(245,176,86,0.45);
  }
  .wh-btn-primary:hover:not(:disabled) {
    border-color: var(--amber);
    background: rgba(245,176,86,0.06);
  }
  .wh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Stats row — halos diffus varié par carte (identité v2) ── */
  .wh-stats {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
  }
  .wh-stat {
    background: var(--card); border: 1px solid var(--border); border-radius: 14px;
    padding: 20px 22px; min-height: 120px;
    display: flex; flex-direction: column;
    position: relative; overflow: hidden;
  }
  /* Halo propre à chaque stat — position / couleur / taille / blur variés */
  .wh-stat::before {
    content: ''; position: absolute; pointer-events: none;
    border-radius: 50%; z-index: 0;
  }
  .wh-stat > * { position: relative; z-index: 1; }
  .wh-stat:nth-child(1)::before {
    top: -30px; right: -30px; width: 140px; height: 140px;
    background: var(--cerulean); filter: blur(50px); opacity: .28;
  }
  .wh-stat:nth-child(2)::before {
    bottom: -50px; left: -40px; width: 180px; height: 180px;
    background: var(--amber); filter: blur(65px); opacity: .22;
  }
  .wh-stat:nth-child(3)::before {
    top: -20px; left: 40%; width: 160px; height: 160px;
    background: var(--mint); filter: blur(70px); opacity: .20;
  }
  .wh-stat:nth-child(4)::before {
    bottom: -40px; right: -30px; width: 150px; height: 150px;
    background: var(--violet); filter: blur(58px); opacity: .26;
  }
  .wh-stat-label {
    font-family: var(--mono); font-size: 10.5px; letter-spacing: 2px;
    text-transform: uppercase; color: var(--muted);
  }
  .wh-stat-value {
    font-family: var(--body); font-size: 42px; font-weight: 600;
    margin-top: 10px; line-height: 1; color: var(--text);
    letter-spacing: -1.2px;
  }
  /* La dernière stat (progression / écart) prend le violet */
  .wh-stat:nth-child(4) .wh-stat-value { color: var(--violet); }
  .wh-stat-hint {
    font-family: var(--mono); font-size: 10.5px; color: var(--muted);
    margin-top: auto; letter-spacing: 1px; text-transform: uppercase;
  }
  .wh-stat:nth-child(1) .wh-stat-hint { color: var(--cerulean); }
  .wh-stat:nth-child(2) .wh-stat-hint { color: var(--amber); }
  .wh-stat:nth-child(3) .wh-stat-hint { color: var(--mint); }
  .wh-stat-spark { margin-top: auto; }

  /* ── 2-col layout ──
     Les deux colonnes sont fractionnaires pour rester équilibrées
     quand la fenêtre grandit : un léger avantage à la gauche
     (hero + stats + projets) mais la droite suit le resize au
     lieu de rester figée à 520px.
  */
  .wh-cols {
    display: grid;
    /* Asymétrie : la colonne droite est un peu plus large pour casser
       la symétrie de la page (~46 / 54). */
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.18fr);
    gap: 22px;
    align-items: start;
  }
  .wh-col-left { display: flex; flex-direction: column; gap: 14px; min-width: 0; max-width: none; }
  /* Colonne droite : simple conteneur de 2 panneaux (userBlock + knowBlock).
     Le fond et la bordure vivent sur chaque .wh-rcol-section ci-dessous. */
  .wh-col-right {
    display: flex; flex-direction: column; gap: 16px;
    position: relative;
    min-width: 0;
  }
  /* Chaque bloc de la colonne droite = un panneau framé avec son titre. */
  .wh-rcol-section {
    position: relative;
    background: var(--s1);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 16px;
    overflow: hidden;
    display: flex; flex-direction: column; gap: 12px;
  }
  /* Halo discret sur chaque panneau (amber pour "Toi", violet pour "Le saviez-vous"). */
  .wh-rcol-section::after {
    content: '';
    position: absolute;
    right: 0; bottom: 0;
    width: 200px; height: 160px;
    background: radial-gradient(ellipse at bottom right,
      rgba(245,166,35,0.06), transparent 70%);
    border-bottom-right-radius: inherit;
    pointer-events: none;
    z-index: 0;
  }
  .wh-rcol-section:nth-of-type(2)::after {
    background: radial-gradient(ellipse at bottom right,
      rgba(166,126,245,0.07), transparent 70%);
  }
  .wh-rcol-section > * { position: relative; z-index: 1; }

  /* Titre de section (eyebrow mono) + pastille colorée. */
  .wh-rcol-title {
    display: inline-flex; align-items: center; gap: 10px;
    font-family: var(--mono); font-size: 10.5px; letter-spacing: 2.2px;
    text-transform: uppercase; color: var(--text);
    line-height: 1; margin: 2px 0 4px;
  }
  .wh-rcol-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--amber); flex-shrink: 0;
  }
  .wh-rcol-dot-violet { background: var(--violet); }

  /* Stack des cartes à l'intérieur d'une section. */
  .wh-rcol-cards {
    display: flex; flex-direction: column; gap: 10px;
  }

  /* Titre cliquable (carte "Dernier titre analysé") : on neutralise
     l'apparence bouton + on souligne discrètement au survol. */
  .wh-card-title.wh-card-title-link {
    display: inline-block;
    padding: 0; margin: 0 0 8px;
    background: none; border: none; cursor: pointer;
    text-align: left;
    color: var(--text);
    font-family: var(--body); font-size: 14px; font-weight: 500;
    transition: color .15s;
  }
  .wh-card-title.wh-card-title-link:hover {
    color: var(--amber);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 1px;
  }

  /* Les cards internes gardent leur habillage allégé (bord coloré, pas de
     glow redondant avec le panneau englobant). */
  .wh-rcol-section .wh-card {
    overflow: visible;
    border-radius: 10px;
    padding: 14px 16px;
  }
  .wh-rcol-section .wh-card::before { display: none; }

  /* ── Editorial cards — variantes colorées + halos discrets ── */
  .wh-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 14px;
    padding: 18px 20px;
    position: relative; overflow: hidden;
  }
  .wh-card > * { position: relative; z-index: 1; }
  .wh-card::before {
    content: ''; position: absolute; pointer-events: none;
    bottom: -40px; right: -40px; width: 140px; height: 140px;
    border-radius: 50%; filter: blur(55px); opacity: .18;
    background: var(--amber);
    z-index: 0;
  }
  /* Variantes de teinte pour différencier les conseils — cyclée en JSX */
  .wh-card.amber::before { background: var(--amber); opacity: .22; }
  .wh-card.cerulean::before { background: var(--cerulean); opacity: .20; }
  .wh-card.mint::before { background: var(--mint); opacity: .18; }
  .wh-card.violet::before { background: var(--violet); opacity: .22; }

  .wh-card.amber { border-color: rgba(245,166,35,0.18); }
  .wh-card.cerulean { border-color: rgba(92,184,204,0.18); }
  .wh-card.mint { border-color: rgba(142,224,122,0.18); }
  .wh-card.violet { border-color: rgba(166,126,245,0.18); }

  .wh-card-kicker {
    font-family: var(--mono); font-size: 10.5px; letter-spacing: 2px;
    text-transform: uppercase; color: var(--amber); margin-bottom: 8px;
  }
  .wh-card.cerulean .wh-card-kicker { color: var(--cerulean); }
  .wh-card.mint .wh-card-kicker { color: var(--mint); }
  .wh-card.violet .wh-card-kicker { color: var(--violet); }
  .wh-card-title {
    font-family: var(--body); font-size: 14px; font-weight: 500;
    margin-bottom: 8px; color: var(--text);
  }
  .wh-card-body {
    font-size: 13.5px; line-height: 1.55; color: var(--soft); font-weight: 300;
  }
  .wh-card-link {
    display: inline-block; margin-top: 10px;
    font-family: var(--mono); font-size: 11px; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--amber);
    background: transparent; border: none; padding: 0; cursor: pointer;
  }
  .wh-card-link:hover { color: #ffca7a; }

  /* ── Checklist ── */
  .wh-checklist { display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }
  .wh-check-item {
    display: flex; align-items: center; gap: 10px; padding: 6px 0;
    font-size: 14px;
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
  /* Alignée sur .wh-slogan (Écoute, compare, décide.) : DM Sans 700 avec
     tracking négatif. Proportionnel à la taille (46px ici, 88px pour le slogan). */
  .wh-ob-welcome {
    font-family: var(--body); font-weight: 700;
    font-size: 46px; line-height: 1;
    letter-spacing: -1.5px; color: var(--text);
    margin-bottom: 12px;
  }
  /* Alignée sur .wh-card-title (DM Sans 500) — même font UI que les
     titres de cartes (ex. "Lance ta première analyse"), mais en plus gros
     pour faire respirer le bloc onboarding sans paraître vide. */
  .wh-ob-tagline {
    font-family: var(--body); font-weight: 500;
    font-size: 22px; line-height: 1.35; letter-spacing: -0.2px;
    color: var(--soft); margin-bottom: 22px;
    max-width: 540px;
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
    width: 20px; height: 28px; flex-shrink: 0;
    cursor: grab; color: #c5c5c7;
    transition: opacity .15s;
    margin-right: -4px;
    opacity: 0;
    /* Indispensable pour le drag tactile : désactive le pan navigateur
       et la sélection de texte sur la poignée, sinon mobile scrolle la
       page ou sélectionne au long-press au lieu de drag. */
    touch-action: none;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }
  .wh-drag-handle:active { cursor: grabbing; }
  .wh-track-row:hover .wh-drag-handle { opacity: 0.55; }
  /* Sur devices tactiles (pas de :hover) : la poignée est visible en
     permanence, sans quoi l'utilisateur ne sait pas où attraper la ligne. */
  @media (hover: none) {
    .wh-drag-handle { opacity: 0.6; }
    .wh-drag-handle:active { opacity: 0.9; }
  }
  .wh-track-row:hover {
    border-color: rgba(245,176,86,0.3); background: rgba(245,176,86,0.04);
  }
  /* Bouton play + cover illustration fusionnés (carré 40x40).
     Sans image : fond transparent + icône ♪ (note de musique).
     Avec image : image en fond, triangle play en overlay au hover/playing. */
  .wh-track-play {
    position: relative;
    width: 40px; height: 40px; border-radius: 8px;
    background: transparent; border: 1px solid var(--border);
    color: var(--muted); cursor: pointer; flex-shrink: 0; padding: 0;
    display: flex; align-items: center; justify-content: center;
    transition: all .15s;
    overflow: hidden;
    background-color: rgba(255,255,255,0.02);
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
  }
  .wh-track-play:hover { color: var(--text); border-color: var(--text); }
  .wh-track-play.playing {
    color: var(--amber); border-color: var(--amber);
    background-color: rgba(245,176,86,0.12);
  }
  /* Icône ♪ de fallback (affichée quand pas d'image).
     Disparaît au hover / quand le titre joue → laisse place au triangle play. */
  .wh-track-play .wh-track-note {
    display: flex; align-items: center; justify-content: center;
    width: 100%; height: 100%;
    transition: opacity .15s;
  }
  .wh-track-play:hover .wh-track-note,
  .wh-track-play.playing .wh-track-note {
    opacity: 0;
  }
  /* Overlay play/pause par-dessus l'image : invisible par défaut, visible au hover
     OU en continu quand le titre joue. Scrim sombre pour lisibilité sur image claire. */
  .wh-track-play .wh-track-play-overlay {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    color: var(--text);
    background: rgba(0,0,0,0.45);
    opacity: 0;
    transition: opacity .15s;
  }
  .wh-track-play:not(.has-image) .wh-track-play-overlay {
    background: transparent;
    color: var(--text);
  }
  .wh-track-play:not(.has-image).playing .wh-track-play-overlay {
    color: var(--amber);
  }
  .wh-track-play:hover .wh-track-play-overlay,
  .wh-track-play.playing .wh-track-play-overlay {
    opacity: 1;
  }
  /* Quand il y a une image, on masque la note ♪ (redondante) — image gère seule
     et l'overlay prend le relais au hover. Également pas de tint amber au hover
     sur une image (l'overlay fait déjà le boulot). */
  .wh-track-play.has-image { background-color: transparent; border-color: transparent; }
  .wh-track-play.has-image:hover { border-color: var(--text); }
  .wh-track-play.has-image.playing { border-color: var(--amber); }
  .wh-track-info { flex: 1; min-width: 0; }
  .wh-track-title {
    font-family: var(--body); font-size: 14px; font-weight: 400;
    color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .wh-track-date {
    font-family: var(--mono); font-size: 12px; color: var(--muted);
    flex-shrink: 0; white-space: nowrap; letter-spacing: 0.3px;
  }
  @media (max-width: 600px) {
    .wh-track-date { display: none; }
  }
  .wh-track-meta {
    font-family: var(--mono); font-size: 12px; color: var(--muted);
    letter-spacing: 0.5px; margin-top: 2px;
  }
  /* Chip "ANALYSE" — pilule cerulean alignée sur .v4-chip.cerulean de la
     maquette v2 (même forme, même typo). Pas d'icône, juste le label. */
  .wh-track-fiche {
    display: inline-flex; align-items: center;
    padding: 5px 10px; border-radius: 20px;
    background: rgba(92,184,204,0.10); border: 1px solid rgba(92,184,204,0.35);
    color: var(--cerulean); cursor: pointer; flex-shrink: 0;
    font-family: var(--mono); font-size: 10px; letter-spacing: 1.2px;
    text-transform: uppercase; font-weight: 500;
    transition: all .15s;
  }
  .wh-track-fiche:hover {
    background: rgba(92,184,204,0.18); border-color: var(--cerulean);
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
    font-family: var(--mono); font-size: 12px; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--muted);
    padding: 8px 12px 4px;
  }
  .wh-picker-item {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 10px 12px; border-radius: 8px;
    font-family: var(--body); font-size: 14px; font-weight: 300; color: var(--soft);
    cursor: pointer; transition: all .15s;
  }
  .wh-picker-item:hover {
    background: rgba(245,176,86,0.08); color: var(--amber);
  }
  .wh-picker-count {
    font-family: var(--mono); font-size: 12px; color: var(--muted); letter-spacing: 0.5px;
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
    font-family: var(--body); font-size: 16px; font-weight: 300;
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
    font-family: var(--mono); font-size: 12px; letter-spacing: 2px;
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
    font-family: var(--body); font-size: 14px; font-weight: 400;
    color: #7bd88f; flex: 1;
  }
  .input-drop-text { flex: 1; }
  .input-drop-hint {
    font-family: var(--body); font-size: 14px; font-weight: 300; color: var(--muted);
  }
  .input-drop-formats {
    font-family: var(--mono); font-size: 12px; color: #5a5a5e; margin-top: 3px;
    letter-spacing: 0.5px;
  }

  .input-fields {
    display: flex; gap: 12px;
  }
  .input-field { flex: 1; }
  .input-label {
    font-family: var(--mono); font-size: 12px; letter-spacing: 1.5px;
    color: var(--muted); margin-bottom: 6px; display: block;
  }
  .input-input {
    width: 100%; background: var(--s2); border: 1px solid var(--border);
    border-radius: 8px; padding: 10px 14px;
    font-family: var(--body); font-size: 14px; font-weight: 300;
    color: var(--text); outline: none; transition: border-color .2s;
    box-sizing: border-box;
  }
  .input-input:focus { border-color: var(--amber); }
  .input-input::placeholder { color: #5a5a5e; }

  .input-select {
    width: 100%; background: var(--s2); border: 1px solid var(--border);
    border-radius: 8px; padding: 11px 40px 11px 14px;
    font-family: var(--body); font-size: 14px; font-weight: 300;
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
    font-family: var(--body); font-size: 14px; font-weight: 300;
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
    font-size: 14px; padding: 9px 12px;
  }

  .input-cta {
    width: 100%; padding: 14px 16px; border-radius: 10px;
    background: var(--s2); border: 1px solid var(--border);
    font-family: var(--body); font-size: 16px; font-weight: 400;
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
    text-align: center; font-family: var(--mono); font-size: 12px;
    color: var(--amber); opacity: 0.5; animation: fadeup .2s ease;
  }

  /* ── Panneau "Mes projets" — un seul cadre englobant, rows séparés
     par une bordure interne (v4-panel de la maquette). Les accordéons
     s'ouvrent à l'intérieur du panneau.
     Pas de overflow:hidden — on laisse les dropdowns (menu 3-points,
     menu versions) déborder proprement. Le halo est intégré au background
     (radial-gradient) au lieu d'un ::before blur, pour que la lueur reste
     dans les limites du panneau sans clipping. */
  .wh-projects {
    display: flex; flex-direction: column;
    width: 100%;
    /* Fond uni — les halos sont appliqués via ::before / ::after pour rester
       accrochés aux coins physiques du panneau (sinon, quand un projet est
       déplié, le panneau s'allonge et un halo en % bave au milieu des rows). */
    background: var(--s1);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 0;
    position: relative;
  }
  /* Halo ambre en bas-droite — taille fixe, accroché aux coins. Tient dans
     la boîte donc pas besoin de overflow:hidden (les dropdowns restent OK). */
  .wh-projects::before {
    content: '';
    position: absolute;
    right: 0; bottom: 0;
    width: 260px; height: 180px;
    background: radial-gradient(ellipse at bottom right,
      rgba(245,166,35,0.09), transparent 70%);
    border-bottom-right-radius: inherit;
    pointer-events: none;
    z-index: 0;
  }
  /* Halo cerulean en haut-gauche — plus doux, accroché au coin. */
  .wh-projects::after {
    content: '';
    position: absolute;
    left: 0; top: 0;
    width: 240px; height: 160px;
    background: radial-gradient(ellipse at top left,
      rgba(92,184,204,0.06), transparent 70%);
    border-top-left-radius: inherit;
    pointer-events: none;
    z-index: 0;
  }
  /* Les enfants passent au-dessus des halos. */
  .wh-projects > * { position: relative; z-index: 1; }
  /* Teintes projet (valeurs RGB, alpha appliqué plus bas).
     Correspondent à la couleur claire du gradient de chaque teinte. */
  .wh-tint-0 { --project-tint: 198, 161, 91;  }  /* 0 ambre  */
  .wh-tint-1 { --project-tint: 91, 161, 198;  }  /* 1 bleu   */
  .wh-tint-2 { --project-tint: 161, 91, 198;  }  /* 2 violet */
  .wh-tint-3 { --project-tint: 91, 198, 161;  }  /* 3 vert   */
  .wh-tint-4 { --project-tint: 198, 91, 91;   }  /* 4 rouge  */
  .wh-tint-5 { --project-tint: 140, 140, 160; }  /* 5 gris   */

  /* Chaque projet est une LIGNE du panneau (v4-project-row) — pas de card
     individuelle. Séparées par un border-bottom très discret. */
  .wh-acc-item {
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--border);
    border-radius: 0;
    transition: background 0.2s ease;
  }
  .wh-acc-item:last-child { border-bottom: none; }
  /* Coins arrondis sur la 1re et dernière row pour qu'elles épousent
     le border-radius du panneau — évite le liseré plat au sommet/au bas
     quand la row est tintée (mode ouvert). */
  .wh-acc-item:first-child { border-top-left-radius: 13px; border-top-right-radius: 13px; }
  .wh-acc-item:last-child { border-bottom-left-radius: 13px; border-bottom-right-radius: 13px; }
  .wh-acc-item:hover { background: rgba(255,255,255,0.02); }
  /* Quand le menu 3-points est ouvert sur un projet fermé, on laisse le
     menu déborder hors de la ligne (sinon overflow:hidden le tronque et
     on ne voit que la première option). */
  .wh-acc-item.menu-open {
    overflow: visible;
    position: relative;
    z-index: 5;
  }
  /* Quand un menu 3-points de TITRE (à l'intérieur d'un projet ouvert)
     est ouvert, on élève le projet parent au-dessus des siblings suivants
     pour que son popup ne passe pas derrière les scores /100 en dessous.
     Les siblings ont eux aussi z-index:1 (via .wh-projects > *), ils
     peindraient sinon par-dessus en source order. */
  .wh-acc-item:has(.wh-track-row.menu-open) {
    z-index: 6;
  }
  /* Mode ouvert : pas de surbrillance — le projet déplié reste sur le même
     fond que les autres (éviter la démarcation en haut de ligne ouverte). */
  .wh-acc-item.open {
    background: transparent;
  }
  /* ── Ligne projet compacte (alignée sur v4-project-row de la maquette) ─
     Swatch 36x36 · body flex · score à droite. Le header reste identique
     en fermé/ouvert : seul le body (tracklist) apparaît en mode ouvert.
     La row fournit son propre padding horizontal pour que le tint en
     mode ouvert remplisse bien toute la largeur du panneau. */
  .wh-acc-head {
    position: relative;
    display: grid;
    grid-template-columns: 36px 1fr auto;
    gap: 14px;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
  }
  .wh-acc-cover {
    position: relative;
    width: 36px; height: 36px;
    border-radius: 10px;
    flex-shrink: 0;
  }
  .wh-acc-title { min-width: 0; overflow: hidden; }
  .wh-acc-kicker { display: none; }
  .wh-acc-name {
    font-family: var(--body); font-size: 14px; font-weight: 500;
    color: var(--text); line-height: 1.2;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .wh-acc-meta {
    font-family: var(--mono); font-size: 10px;
    color: var(--muted); letter-spacing: 1px;
    text-transform: uppercase; margin-top: 4px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  /* Score à droite — même typo que la maquette (26px bold, coloré selon seuil) */
  .wh-acc-score {
    font-family: var(--body); font-weight: 600;
    font-size: 26px; line-height: 1;
    letter-spacing: -0.8px;
    color: var(--muted2);
    margin-right: 26px; /* place pour le menu 3-points (28px - 16 padding-head + 4 marge) */
  }
  .wh-acc-score.good { color: var(--mint); }
  .wh-acc-score.mid { color: var(--amber); }
  .wh-acc-score.low { color: var(--red); }
  .wh-acc-score.dash {
    color: var(--muted2); font-size: 22px; letter-spacing: 0;
  }
  /* Play projet : petit bouton qui apparaît sur hover du swatch, remplace
     la couleur pour garder le rendu clean. */
  .wh-acc-play {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 30px; height: 30px; border-radius: 50%;
    background: rgba(0,0,0,0.55);
    border: 1px solid rgba(255,255,255,0.18);
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
    background: rgba(245,166,35,0.2);
    border-color: var(--amber);
    color: var(--amber);
  }

  .wh-acc-body {
    display: none;
    padding: 0 16px 14px;
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
    font-family: var(--body); font-size: 14px; font-weight: 500;
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
    padding: 24px 0; color: var(--muted); font-size: 14px;
    font-style: italic; text-align: center;
  }
  /* Bouton "+ Nouveau titre" en fin de liste d'un projet ouvert.
     Aligné sur le langage des autres boutons pill de l'app (sidebar add,
     chips v4) : pill, compact, centré. On conserve la bordure en pointillés
     pour signaler l'action d'ajout (affordance "placeholder"). */
  .wh-acc-add-track {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    /* Shrink-wrap + auto-margin horizontal pour centrer dans le .wh-acc-body
       (qui est en display: block → align-self: center ne fonctionnerait pas). */
    width: fit-content;
    margin: 10px auto 0;
    padding: 7px 16px;
    border-radius: 999px;
    background: transparent;
    border: 1px dashed var(--border);
    color: var(--muted);
    font-family: var(--body); font-size: 13px; font-weight: 500;
    cursor: pointer;
    transition: all .15s;
  }
  .wh-acc-add-track:hover {
    border-color: var(--amber); color: var(--amber); background: rgba(245,176,86,0.05);
  }

  /* Gradients covers — teintes punchy alignées sur le swatch de la maquette v2 */
  .wh-gradient-0 { background: linear-gradient(135deg, #f5a623, #c77d10); }  /* 0 ambre   */
  .wh-gradient-1 { background: linear-gradient(135deg, #5cb8cc, #3b7d8f); }  /* 1 bleu    */
  .wh-gradient-2 { background: linear-gradient(135deg, #a67ef5, #6e4cc0); }  /* 2 violet  */
  .wh-gradient-3 { background: linear-gradient(135deg, #8ee07a, #4ba63a); }  /* 3 vert    */
  .wh-gradient-4 { background: linear-gradient(135deg, #ff7a7a, #c04444); }  /* 4 rouge   */
  .wh-gradient-5 { background: linear-gradient(135deg, #5a5a6e, #33333c); }  /* 5 gris    */
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
    color: var(--soft); font-family: var(--body); font-size: 14px; font-weight: 300;
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

  /* Layout compact mobile — ligne projet inchangée, on réduit juste le score
     et la taille typographique pour coller à l'écran étroit. */
  @media (max-width: 600px), (max-height: 500px) {
    .wh-acc-head { padding: 11px 12px; gap: 12px; }
    .wh-acc-name { font-size: 13px; }
    .wh-acc-meta { font-size: 9.5px; }
    .wh-acc-score { font-size: 22px; margin-right: 28px; }
    .wh-head-btn { font-size: 11px; padding: 7px 12px; }
  }

  .wh-empty {
    display: flex; flex-direction: column; align-items: center; gap: 16px;
    padding: 40px 0;
    font-family: var(--body); font-size: 14px; font-weight: 300;
    color: var(--muted); text-align: center;
  }

  /* ── Auth Screen — habillage v2 ──
     Même grammaire que LoadingScreen (ap-scaffold) : logo SVG à plat,
     titre simple avec mot amber, tagline mono, inputs dark avec focus amber,
     boutons pill outline (amber pour submit, dark pour OAuth). */
  /* Fond cohérent avec l'ambient-halo du reste de l'app : trois gradients
     radiaux hors-axe sur la même palette (cyan / violet / amber) que les
     .ambient-layer de la Home, mais en version statique pour garantir la
     présence visuelle même si JS/animation désactivés. */
  .auth-screen {
    min-height: 100vh; display: grid; place-items: center;
    padding: 40px 24px; box-sizing: border-box;
    background:
      radial-gradient(ellipse 900px 620px at 78% 18%,
        rgba(92,184,204,0.22), transparent 70%),
      radial-gradient(ellipse 720px 900px at 22% 72%,
        rgba(166,126,245,0.20), transparent 70%),
      radial-gradient(ellipse 820px 720px at 85% 78%,
        rgba(245,166,35,0.16), transparent 70%),
      var(--bg);
  }
  .auth-card {
    width: 100%; max-width: 400px;
    display: flex; flex-direction: column; gap: 22px;
    animation: fadeup .35s ease;
  }
  .auth-logo {
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    margin-bottom: 6px;
  }
  .auth-logo img {
    height: 52px !important; width: auto !important;
    filter: drop-shadow(0 0 28px rgba(245,166,35,0.20));
  }
  /* Aligné sur .brand (sidebar) pour garder une identité unifiée du wordmark
     VERSIONS d'un écran à l'autre : Inter 700, tracking négatif, compact. */
  .auth-brand {
    font-family: var(--body);
    font-size: 27px; font-weight: 700;
    letter-spacing: -0.5px;
    color: var(--text); line-height: 1;
  }
  .auth-brand .accent { color: var(--amber); font-style: normal; }
  .auth-tagline {
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    letter-spacing: 2px; color: var(--amber); text-transform: uppercase;
    display: flex; align-items: center; gap: 10px;
  }
  .auth-tagline-dot {
    font-size: 11px; line-height: 1; letter-spacing: 0; opacity: 0.6;
  }
  .auth-form {
    display: flex; flex-direction: column; gap: 10px;
    margin-top: 8px;
  }
  .auth-input {
    width: 100%; padding: 14px 16px;
    background: var(--s1); border: 1px solid var(--border);
    border-radius: 12px; color: var(--text);
    font-family: var(--body); font-size: 14px; font-weight: 400;
    outline: none; box-sizing: border-box;
    transition: border-color .15s, background .15s;
  }
  .auth-input:focus {
    border-color: rgba(245,166,35,0.55);
    background: rgba(245,166,35,0.04);
  }
  .auth-input::placeholder { color: var(--muted); }
  .auth-error {
    color: var(--red); font-family: var(--mono); font-size: 11px;
    text-align: center; letter-spacing: 1px; text-transform: uppercase;
    padding: 8px 12px; background: rgba(255,93,93,0.06);
    border: 1px solid rgba(255,93,93,0.22); border-radius: 10px;
  }
  .auth-info {
    color: var(--mint); font-family: var(--mono); font-size: 11px;
    text-align: center; letter-spacing: 1px; text-transform: uppercase;
    padding: 8px 12px; background: rgba(142,224,122,0.06);
    border: 1px solid rgba(142,224,122,0.22); border-radius: 10px;
  }
  /* Submit = pill mono uppercase, outline amber (grammaire add-mini-btn.is-primary) */
  .auth-submit {
    width: 100%; padding: 14px 24px;
    background: transparent; color: var(--amber);
    border: 1px solid rgba(245,166,35,0.45); border-radius: 999px;
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    letter-spacing: 1.5px; text-transform: uppercase;
    cursor: pointer; transition: all .15s;
    margin-top: 6px;
  }
  .auth-submit:hover:not(:disabled) {
    border-color: var(--amber);
    background: rgba(245,166,35,0.06);
  }
  .auth-submit:disabled { cursor: not-allowed; }

  .auth-sep {
    display: flex; align-items: center; gap: 14px;
    margin: 2px 0;
  }
  .auth-sep-line { flex: 1; height: 1px; background: var(--border); }
  .auth-sep-text {
    font-family: var(--mono); font-size: 10px; letter-spacing: 2px;
    color: var(--muted); text-transform: uppercase;
  }

  .auth-oauth {
    display: flex; flex-direction: column; gap: 10px;
  }
  /* OAuth = pill mono dark, outline soft (secondary look) */
  .auth-oauth-btn {
    width: 100%; padding: 12px 18px;
    background: transparent; color: var(--text);
    border: 1px solid var(--border); border-radius: 999px;
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    letter-spacing: 1.2px; text-transform: uppercase;
    cursor: pointer; transition: all .15s;
    display: flex; align-items: center; justify-content: center; gap: 10px;
  }
  .auth-oauth-btn:hover {
    border-color: rgba(255,255,255,0.18);
    background: rgba(255,255,255,0.02);
  }

  .auth-toggle { text-align: center; margin-top: 4px; }
  .auth-toggle-btn {
    background: transparent; border: none;
    color: var(--muted); font-family: var(--body); font-size: 13px;
    cursor: pointer; text-decoration: underline; text-underline-offset: 3px;
    transition: color .2s;
  }
  .auth-toggle-btn:hover { color: var(--amber); }

  /* ── Réglages Modal ──
     Overlay fullscreen + panneau centré. Le contenu (ReglagesScreen)
     conserve ses propres styles ; on neutralise juste son padding haut
     et sa largeur max dans le contexte modale pour coller à la grille. */
  /* Aligné sur .add-mini-backdrop : voile 45% + flou 5px. */
  .reglages-modal-overlay {
    position: fixed; inset: 0; z-index: 500;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    display: flex; align-items: flex-start; justify-content: center;
    padding: 5vh 20px 5vh;
    box-sizing: border-box;
    overflow-y: auto;
    animation: fadein .18s ease;
  }
  /* Aligné sur .add-mini-card : bordure 14% + halos amber/cerulean. */
  .reglages-modal-panel {
    position: relative; isolation: isolate;
    width: 100%; max-width: 620px;
    background: var(--bg);
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 16px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.5);
    animation: fadeup .22s ease;
    max-height: 90vh;
    display: flex; flex-direction: column;
    overflow: hidden;
  }
  .reglages-modal-panel::before {
    content: ''; position: absolute; pointer-events: none;
    top: 14px; right: 14px;
    width: 180px; height: 180px; border-radius: 50%;
    background: var(--amber); filter: blur(85px); opacity: 0.22;
    z-index: 0;
  }
  .reglages-modal-panel::after {
    content: ''; position: absolute; pointer-events: none;
    bottom: 18px; left: 18px;
    width: 200px; height: 200px; border-radius: 50%;
    background: var(--cerulean); filter: blur(90px); opacity: 0.18;
    z-index: 0;
  }
  .reglages-modal-panel > * { position: relative; z-index: 1; }
  .reglages-modal-scroll {
    overflow-y: auto;
    flex: 1;
  }
  .reglages-modal-panel .reglages-screen {
    padding: 36px 36px 40px;
    max-width: 100%;
    animation: none;
  }
  .reglages-modal-close {
    position: absolute;
    top: 14px; right: 14px;
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    background: var(--s1);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--muted);
    cursor: pointer;
    z-index: 2;
    transition: color .15s, background .15s;
  }
  .reglages-modal-close:hover { color: var(--text); background: var(--s2); }
  @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }

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
    font-family: var(--body); font-size: 14px; font-weight: 300;
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
    font-family: var(--mono); font-size: 12px; letter-spacing: 2px;
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
    font-family: var(--body); font-size: 14px; font-weight: 300;
    color: var(--muted); line-height: 1.5;
  }

  .reglages-fields {
    display: flex; gap: 12px;
  }
  .reglages-field { flex: 1; }
  .reglages-label {
    font-family: var(--mono); font-size: 12px; letter-spacing: 1.5px;
    color: var(--muted); margin-bottom: 6px; display: block;
  }
  .reglages-input {
    width: 100%; background: var(--s2); border: 1px solid var(--border);
    border-radius: 8px; padding: 10px 14px;
    font-family: var(--body); font-size: 14px; font-weight: 300;
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
    font-family: var(--body); font-size: 14px; font-weight: 300;
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
    color: var(--muted); font-family: var(--body); font-size: 14px;
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
    font-family: var(--mono); font-size: 12px; color: var(--muted2);
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
    font-family: var(--body); font-size: 16px; font-weight: 600;
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
    color: var(--red); font-family: var(--mono); font-size: 12px;
    letter-spacing: 1px; text-transform: uppercase;
    cursor: pointer; transition: all .2s;
  }
  .reglages-signout:hover {
    border-color: var(--red); background: rgba(239,107,107,.06);
  }

  /* ══════════════════════════════════════════════════════ */
  /* RÉGLAGES — mini-modal v2 (aligné maquette)            */
  /* ══════════════════════════════════════════════════════ */
  /* Le panel lui-même devient la mini-modal quand on ajoute .mini-modal.
     Pas de halo externe : la modale est pleinement opaque (cohérent avec
     la modale Ajouter). Le fond est assez foncé pour couvrir le halo score
     global qui peut se trouver derrière. */
  .reglages-modal-panel.mini-modal {
    /* Fond volontairement plus sombre que les lignes : dans la maquette
       les rows ressortent en étant légèrement plus clairs que le panel. */
    background: #0a0b10;
    border: 1px solid rgba(255,255,255,0.06);
    max-width: 560px;
    overflow: hidden;
  }
  .reglages-modal-panel.mini-modal .reglages-modal-scroll {
    position: relative;
    z-index: 1;
  }

  .rg-mini {
    position: relative;
    padding: 26px 28px 22px;
    display: flex; flex-direction: column; gap: 0;
  }
  .rg-mini .rg-mm-head {
    font-family: var(--mono); font-size: 10px; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--muted);
    margin-bottom: 4px;
  }
  .rg-mini .rg-mm-title {
    font-family: var(--body); font-weight: 600; font-size: 18px;
    letter-spacing: -0.2px; color: var(--text);
    margin-bottom: 18px;
  }
  .rg-mini .rg-mm-title em {
    font-family: inherit; font-style: normal; font-weight: inherit; color: var(--amber);
  }

  /* Row de réglage */
  .rg-mini .rg-row {
    /* Row légèrement plus claire que le panel, avec un subtil highlight
       haut pour l'effet "surélevé" de la maquette. */
    display: flex; align-items: center; justify-content: space-between;
    gap: 14px; padding: 12px 14px;
    border-radius: 10px;
    background: #111216;
    border: 1px solid rgba(255,255,255,0.05);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.025);
    margin-bottom: 7px;
    transition: border-color .15s, background .15s;
  }
  .rg-mini .rg-row:hover {
    border-color: rgba(245,176,86,0.22);
    background: #13141a;
  }
  .rg-mini .rg-row.is-stack {
    flex-direction: column; align-items: stretch; gap: 10px;
  }

  .rg-mini .rg-label {
    font-family: var(--body); font-size: 13px; font-weight: 500;
    color: var(--text);
    display: flex; align-items: center; gap: 8px;
  }
  .rg-mini .rg-hint {
    font-family: var(--mono); font-size: 9.5px; letter-spacing: 0.5px;
    color: var(--muted); margin-top: 3px;
    max-width: 280px;
  }

  /* Toggle pill (FR/EN + notifs) */
  .rg-mini .rg-toggle {
    display: inline-flex; align-items: center; gap: 0;
    background: rgba(0,0,0,0.35); border: 1px solid var(--border);
    border-radius: 999px; padding: 2px; flex-shrink: 0;
  }
  .rg-mini .rg-toggle button {
    font-family: var(--mono); font-size: 10px; letter-spacing: 1px;
    color: var(--muted); text-transform: uppercase;
    padding: 5px 12px; border-radius: 999px; cursor: pointer;
    background: transparent; border: none;
    transition: color .15s, background .15s;
  }
  .rg-mini .rg-toggle button:hover { color: var(--text); }
  .rg-mini .rg-toggle button.on {
    background: var(--amber); color: #0a0a0c;
  }
  .rg-mini .rg-toggle button.on:hover { color: #0a0a0c; }

  /* Valeur lecture seule (compte, range) */
  .rg-mini .rg-value {
    font-family: var(--mono); font-size: 11px; letter-spacing: 0.5px;
    color: var(--cerulean); flex-shrink: 0;
  }
  .rg-mini .rg-value.muted { color: var(--muted); }

  /* Avatar compact à droite d'une row */
  .rg-mini .rg-avatar {
    width: 46px; height: 46px; border-radius: 50%;
    background: linear-gradient(135deg, var(--amber), #e88855);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; position: relative; overflow: hidden; flex-shrink: 0;
    transition: transform .15s;
  }
  .rg-mini .rg-avatar:hover { transform: scale(1.06); }
  .rg-mini .rg-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
  .rg-mini .rg-avatar-initial {
    font-family: var(--mono); font-size: 18px; font-weight: 600; color: #000;
  }
  .rg-mini .rg-avatar-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.5); color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; opacity: 0; transition: opacity .2s;
    border-radius: 50%;
  }
  .rg-mini .rg-avatar:hover .rg-avatar-overlay { opacity: 1; }

  /* Inputs compacts en grille 2 colonnes (profil + bank) */
  .rg-mini .rg-inputs {
    display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%;
  }
  .rg-mini .rg-input {
    background: rgba(0,0,0,0.4); border: 1px solid var(--border);
    border-radius: 8px; padding: 9px 12px;
    color: var(--text); font-family: var(--body); font-size: 13px;
    outline: none; transition: border-color .15s;
    width: 100%; box-sizing: border-box;
  }
  .rg-mini .rg-input:focus { border-color: rgba(245,176,86,0.5); }
  .rg-mini .rg-input::placeholder { color: #5a5a5e; }
  .rg-mini .rg-input:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Select DAW compact */
  .rg-mini .rg-select-wrap {
    position: relative; min-width: 180px; flex-shrink: 0;
  }
  .rg-mini .rg-select {
    background: rgba(0,0,0,0.4); border: 1px solid var(--border);
    border-radius: 8px; padding: 8px 32px 8px 12px;
    color: var(--text); font-family: var(--body); font-size: 13px;
    outline: none; cursor: pointer; appearance: none;
    width: 100%; box-sizing: border-box;
  }
  .rg-mini .rg-select:focus { border-color: rgba(245,176,86,0.5); }
  .rg-mini .rg-select option { background: var(--s1); color: var(--text); }
  .rg-mini .rg-select-arrow {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    pointer-events: none; color: var(--muted);
    display: flex; align-items: center; justify-content: center;
  }

  /* Pill Premium dans le label bank */
  .rg-mini .rg-premium-pill {
    font-family: var(--mono); font-size: 8px; letter-spacing: 1.5px;
    background: var(--amber); color: #000;
    padding: 2px 6px; border-radius: 4px; font-weight: 600;
    text-transform: uppercase;
  }

  /* Feedback saved subtil */
  .rg-mini .rg-saved-chip {
    font-family: var(--mono); font-size: 10px; letter-spacing: 1px;
    color: var(--mint); text-transform: uppercase;
    align-self: flex-end; margin-top: 4px;
  }

  /* Footer boutons — aligné maquette : mono uppercase, pill outline,
     boîte stable (line-height en px), même grammaire que la maquette v2. */
  .rg-mini .rg-foot {
    display: flex; gap: 10px; justify-content: flex-end; align-items: center;
    margin-top: 18px; padding-top: 4px;
  }
  .rg-mini .rg-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 10px 20px; border-radius: 999px;
    background: transparent; border: 1px solid var(--border);
    color: var(--soft);
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    letter-spacing: 1.2px; text-transform: uppercase;
    line-height: 16px;       /* fixe en px → boîte stable pour tous les glyphs */
    box-sizing: border-box;
    flex: 0 0 auto;
    cursor: pointer; transition: all .15s;
    appearance: none; -webkit-appearance: none;
  }
  .rg-mini .rg-btn:hover {
    border-color: rgba(245,176,86,.4); color: var(--amber);
  }
  .rg-mini .rg-btn.is-danger {
    color: var(--red); border-color: rgba(255,93,93,0.35);
  }
  .rg-mini .rg-btn.is-danger:hover {
    border-color: var(--red); color: var(--red);
    background: rgba(255,93,93,0.06);
  }
  /* Primaire pill transparent (aligné sur le style danger) : ambre bordé,
     pas de fond plein. Hover = léger voile ambre. */
  .rg-mini .rg-btn.is-primary {
    color: var(--amber); background: transparent; border-color: rgba(245,176,86,0.45);
  }
  .rg-mini .rg-btn.is-primary:hover {
    border-color: var(--amber); color: var(--amber);
    background: rgba(245,176,86,0.06);
  }
  .rg-mini .rg-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* Loader interne */
  .rg-mini .rg-loading {
    padding: 28px 10px;
    text-align: center;
    font-family: var(--mono); font-size: 12px; letter-spacing: 1px;
    color: var(--muted);
  }

  /* Responsive serré */
  @media (max-width: 640px) {
    .rg-mini { padding: 22px 18px 18px; }
    .rg-mini .rg-row { padding: 10px 12px; }
    .rg-mini .rg-select-wrap { min-width: 150px; }
  }

  /* ══════════════════════════════════════════════════════ */
  /* ADD MODAL — mini-modal                                  */
  /* Alignée sur le style Réglages : card sombre #0a0b10,    */
  /* rows #111216 surélevées (inset highlight), boutons mono */
  /* uppercase pill outline. Titre « Ajouter quoi ? » avec   */
  /* un mot amber (via em, font-style forcé normal).         */
  /* ══════════════════════════════════════════════════════ */
  /* Backdrop standard : voile moyen + flou doux — on devine les formes
     derrière sans qu'elles distraient la lecture de la modale.
     Unifié avec .reglages-modal-overlay. */
  .add-mini-backdrop {
    position: fixed; inset: 0; z-index: 10000;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px; font-family: var(--body);
  }
  /* Card standard : bordure plus marquée (14% blanc) pour détacher du backdrop
     flouté + halos colorés façon .wh-stat (amber haut-droit, cerulean bas-gauche)
     pour habiter l'intérieur. overflow-x: hidden contient les halos,
     overflow-y: auto garde le scroll si le contenu dépasse. */
  .add-mini-card {
    position: relative; isolation: isolate;
    background: #0a0b10;
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 14px;
    box-shadow: 0 20px 60px rgba(0,0,0,.6);
    padding: 26px 28px 22px;
    width: 440px; max-width: 92vw;
    max-height: 92vh;
    overflow-x: hidden; overflow-y: auto;
    box-sizing: border-box;
  }
  /* Halos posés ENTIÈREMENT à l'intérieur de la card (pas de top/right
     négatif) : le blur diffuse naturellement sans jamais toucher la bordure,
     ce qui évite la ligne claire parasite visible au clip de overflow-x: hidden.
     Tailles réduites + blur augmenté pour garder un rendu diffus. */
  .add-mini-card::before {
    content: ''; position: absolute; pointer-events: none;
    top: 12px; right: 12px;
    width: 150px; height: 150px; border-radius: 50%;
    background: var(--amber); filter: blur(75px); opacity: 0.30;
    z-index: 0;
  }
  .add-mini-card::after {
    content: ''; position: absolute; pointer-events: none;
    bottom: 16px; left: 14px;
    width: 170px; height: 170px; border-radius: 50%;
    background: var(--cerulean); filter: blur(80px); opacity: 0.24;
    z-index: 0;
  }
  .add-mini-card > * { position: relative; z-index: 1; }
  .add-mini-card.is-upload { width: 520px; }

  .add-mini-close {
    position: absolute; top: 14px; right: 14px;
    background: transparent; border: none;
    color: var(--muted); cursor: pointer;
    width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px; transition: color .15s, background .15s;
  }
  .add-mini-close:hover { color: var(--text); background: var(--s2); }

  .add-mini-back {
    background: transparent; border: none; color: var(--muted);
    font-family: var(--mono); font-size: 10px; letter-spacing: 1.2px;
    text-transform: uppercase; cursor: pointer;
    padding: 0; margin-bottom: 12px;
    transition: color .15s;
  }
  .add-mini-back:hover { color: var(--text); }

  .add-mini-title {
    font-family: var(--body); font-weight: 600; font-size: 18px;
    letter-spacing: -0.2px; color: var(--text);
    margin-bottom: 18px;
  }
  .add-mini-title em {
    font-family: inherit; font-style: normal; font-weight: inherit;
    color: var(--amber);
  }

  /* Eyebrow au-dessus d'un titre de modale (mono uppercase discret) */
  .add-mini-eyebrow {
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 10px; font-weight: 500;
    letter-spacing: 1.6px; text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 10px;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .add-mini-eyebrow::before {
    content: '';
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--amber);
    flex-shrink: 0;
  }
  /* Quand la modale commence par un eyebrow, on resserre l'écart avec le titre */
  .add-mini-eyebrow + .add-mini-title { margin-top: 2px; }

  /* Root : 3 choix */
  .add-mini-choices {
    display: flex; flex-direction: column; gap: 8px;
  }
  .add-mini-choice {
    display: flex; align-items: center; gap: 14px;
    width: 100%; text-align: left;
    padding: 14px 16px; border-radius: 12px;
    background: #111216;
    border: 1px solid rgba(255,255,255,0.05);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.025);
    color: var(--text); cursor: pointer;
    font-family: var(--body);
    transition: border-color .15s, background .15s;
  }
  .add-mini-choice:hover:not(:disabled) {
    border-color: rgba(245,176,86,0.28);
    background: #13141a;
  }
  .add-mini-choice:disabled {
    opacity: 0.45; cursor: not-allowed;
  }
  .add-mini-choice-icon {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .add-mini-choice-icon.is-amber {
    background: rgba(245,176,86,0.10); color: var(--amber);
    border: 1px solid rgba(245,176,86,0.20);
  }
  .add-mini-choice-icon.is-cerulean {
    background: rgba(100,176,240,0.10); color: var(--cerulean);
    border: 1px solid rgba(100,176,240,0.20);
  }
  .add-mini-choice-icon.is-mint {
    background: rgba(123,216,143,0.10); color: var(--mint);
    border: 1px solid rgba(123,216,143,0.20);
  }
  .add-mini-choice-body { flex: 1; min-width: 0; padding-top: 1px; }
  .add-mini-choice-label {
    font-size: 14px; font-weight: 500; color: var(--text);
    margin-bottom: 2px;
  }
  .add-mini-choice-desc {
    font-family: var(--mono); font-size: 9.5px;
    letter-spacing: 0.5px; color: var(--muted);
  }

  /* Picker (pick-project, pick-track, new-project-name) */
  .add-mini-section-title {
    font-family: var(--mono); font-size: 10px;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--muted); margin-bottom: 10px;
  }
  .add-mini-pick {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; width: 100%; text-align: left;
    padding: 12px 14px; border-radius: 10px;
    background: #111216;
    border: 1px solid rgba(255,255,255,0.05);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.025);
    color: var(--text); cursor: pointer;
    font-family: var(--body); font-size: 13px;
    margin-bottom: 7px;
    transition: border-color .15s, background .15s, color .15s;
  }
  .add-mini-pick:hover {
    border-color: rgba(245,176,86,0.28);
    background: #13141a;
    color: var(--amber);
  }
  .add-mini-pick-count {
    font-family: var(--mono); font-size: 9.5px;
    letter-spacing: 0.5px; color: var(--muted);
  }
  .add-mini-pick:hover .add-mini-pick-count { color: var(--amber); }

  .add-mini-create-new {
    display: flex; align-items: center; gap: 10px;
    width: 100%; text-align: left;
    padding: 12px 14px; border-radius: 10px;
    background: transparent;
    border: 1px dashed rgba(245,176,86,0.3);
    color: var(--amber); cursor: pointer;
    font-family: var(--body); font-size: 13px;
    margin-top: 4px;
    transition: all .15s;
  }
  .add-mini-create-new:hover {
    border-color: var(--amber);
    background: rgba(245,176,86,0.05);
  }

  /* Inputs (new project, upload form) */
  .add-mini-input {
    width: 100%; box-sizing: border-box;
    background: rgba(0,0,0,0.4); border: 1px solid var(--border);
    border-radius: 8px; padding: 10px 12px;
    color: var(--text); font-family: var(--body); font-size: 13px;
    outline: none; transition: border-color .15s;
  }
  .add-mini-input:focus { border-color: rgba(245,176,86,0.5); }
  .add-mini-input:disabled { opacity: 0.5; cursor: not-allowed; }
  .add-mini-input::placeholder { color: #5a5a5e; }

  .add-mini-field { display: flex; flex-direction: column; margin-bottom: 12px; }
  .add-mini-field-label {
    font-family: var(--mono); font-size: 10px;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--muted); margin-bottom: 6px;
  }

  /* Upload : bandeau projet */
  .add-mini-upload-banner {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px;
    background: rgba(245,176,86,0.06);
    border: 1px solid rgba(245,176,86,0.25);
    margin-bottom: 14px;
  }
  .add-mini-upload-banner-kicker {
    font-family: var(--mono); font-size: 9px;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--muted);
  }
  .add-mini-upload-banner-name {
    font-size: 13px; color: var(--text); font-weight: 500;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  /* Upload : drop zone */
  .add-mini-drop {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 16px; border-radius: 10px;
    background: rgba(0,0,0,0.3);
    border: 1px dashed var(--border);
    cursor: pointer; transition: all .15s;
  }
  .add-mini-drop.is-active {
    background: rgba(245,176,86,0.06);
    border-color: var(--amber);
  }
  .add-mini-drop.is-filled {
    background: rgba(123,216,143,0.04);
    border-color: rgba(123,216,143,0.33);
  }

  /* Upload : pill (vocal) + select wrap (daw) */
  .add-mini-pill {
    padding: 8px 14px; border-radius: 999px;
    background: transparent; border: 1px solid var(--border);
    color: var(--soft);
    cursor: pointer; font-family: var(--body);
    font-size: 13px; font-weight: 500;
    transition: all .15s;
    appearance: none; -webkit-appearance: none;
  }
  .add-mini-pill.on {
    background: var(--amber); border-color: var(--amber);
    color: #0a0a0c;
  }
  .add-mini-select-wrap { position: relative; }
  .add-mini-select {
    width: 100%; box-sizing: border-box;
    background: rgba(0,0,0,0.4); border: 1px solid var(--border);
    border-radius: 8px; padding: 10px 32px 10px 12px;
    color: var(--text); font-family: var(--body); font-size: 13px;
    outline: none; cursor: pointer;
    appearance: none; -webkit-appearance: none;
    transition: border-color .15s;
  }
  .add-mini-select:focus { border-color: rgba(245,176,86,0.5); }
  .add-mini-select option { background: var(--s1); color: var(--text); }
  .add-mini-select-arrow {
    position: absolute; right: 10px; top: 50%;
    transform: translateY(-50%);
    pointer-events: none; color: var(--muted);
    display: flex; align-items: center; justify-content: center;
  }

  /* Footer boutons */
  .add-mini-foot {
    display: flex; gap: 10px; justify-content: flex-end;
    align-items: center; margin-top: 18px; padding-top: 4px;
  }
  .add-mini-btn {
    display: inline-flex; align-items: center; justify-content: center;
    gap: 6px; padding: 10px 20px; border-radius: 999px;
    background: transparent; border: 1px solid var(--border);
    color: var(--soft);
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    letter-spacing: 1.2px; text-transform: uppercase;
    line-height: 16px; box-sizing: border-box;
    flex: 0 0 auto; cursor: pointer;
    transition: all .15s;
    appearance: none; -webkit-appearance: none;
  }
  .add-mini-btn:hover:not(:disabled) {
    border-color: rgba(245,176,86,.4); color: var(--amber);
  }
  .add-mini-btn.is-primary {
    color: var(--amber); background: transparent;
    border-color: rgba(245,176,86,0.45);
  }
  .add-mini-btn.is-primary:hover:not(:disabled) {
    border-color: var(--amber);
    background: rgba(245,176,86,0.06);
  }
  .add-mini-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* CTA large (upload) */
  .add-mini-cta {
    width: 100%; padding: 12px 16px; border-radius: 999px;
    background: transparent;
    border: 1px solid rgba(245,176,86,0.45);
    color: var(--amber);
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    letter-spacing: 1.2px; text-transform: uppercase;
    line-height: 16px; cursor: pointer;
    transition: all .15s; margin-top: 6px;
    appearance: none; -webkit-appearance: none;
  }
  .add-mini-cta:hover:not(:disabled) {
    border-color: var(--amber);
    background: rgba(245,176,86,0.06);
  }
  .add-mini-cta:disabled {
    opacity: 0.4; cursor: not-allowed;
    border-color: var(--border); color: var(--muted);
  }

  /* Variantes de boutons partagées (Export PDF, Share link) */
  .add-mini-btn.is-filled-amber {
    color: var(--body); background: var(--amber);
    border-color: var(--amber);
  }
  .add-mini-btn.is-filled-amber:hover:not(:disabled) {
    background: #f7bd6e; border-color: #f7bd6e; color: var(--body);
  }
  .add-mini-btn.is-filled-mint {
    color: var(--body); background: var(--mint);
    border-color: var(--mint);
  }
  .add-mini-btn.is-mint {
    color: var(--mint); background: transparent;
    border-color: rgba(122,196,142,0.45);
  }
  .add-mini-btn.is-mint:hover:not(:disabled) {
    border-color: var(--mint); background: rgba(122,196,142,0.06);
    color: var(--mint);
  }
  .add-mini-btn.is-danger {
    color: var(--red); border-color: rgba(239,107,107,0.38);
  }
  .add-mini-btn.is-danger:hover:not(:disabled) {
    border-color: var(--red);
    background: rgba(239,107,107,0.06); color: var(--red);
  }

  /* Sous-titre sous le titre principal */
  .add-mini-sub {
    font-size: 13px; color: var(--muted);
    margin-top: -4px; margin-bottom: 16px;
    letter-spacing: .2px;
  }

  /* Texte de corps (paragraphe descriptif) */
  .add-mini-body-text {
    font-size: 14px; color: var(--soft); line-height: 1.55;
    margin-bottom: 14px;
  }

  /* En-tête de section mono uppercase */
  .add-mini-section-head {
    font-family: var(--mono); font-size: 10px; font-weight: 500;
    letter-spacing: 1.4px; text-transform: uppercase;
    color: var(--muted); margin-bottom: 10px;
  }

  /* Liste à cocher (sections à inclure dans l'export) */
  .add-mini-list {
    display: flex; flex-direction: column; gap: 8px;
    margin-bottom: 18px;
  }
  /* Variante "liste à plat" (Export PDF v2) : pas de carte par ligne,
     juste une checkbox + un label alignés. Plus aéré, plus sobre. */
  .add-mini-list.is-flat { gap: 2px; margin-bottom: 22px; }
  .add-mini-list.is-flat .add-mini-check-row {
    padding: 8px 2px;
    background: transparent;
    border: none; box-shadow: none;
    border-radius: 6px;
  }
  .add-mini-list.is-flat .add-mini-check-row:hover:not(.is-disabled) {
    background: rgba(255,255,255,0.025);
    border-color: transparent;
  }
  .add-mini-list.is-flat .add-mini-check-row.is-checked {
    border-color: transparent;
  }
  .add-mini-list.is-flat .add-mini-check-label { font-weight: 500; font-size: 14px; }
  .add-mini-check-row {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 14px; border-radius: 12px;
    background: #111216; border: 1px solid rgba(255,255,255,0.06);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.025);
    cursor: pointer;
    transition: border-color .15s, background .15s;
  }
  .add-mini-check-row:hover:not(.is-disabled) {
    border-color: rgba(245,176,86,0.28);
  }
  .add-mini-check-row.is-disabled { opacity: 0.4; cursor: not-allowed; background: transparent; }
  .add-mini-check-row.is-checked { border-color: rgba(245,176,86,0.42); }

  .add-mini-check {
    width: 18px; height: 18px; flex: 0 0 18px; border-radius: 5px;
    border: 1.5px solid #3a3a3e; background: transparent;
    display: flex; align-items: center; justify-content: center;
    margin-top: 1px;
    transition: border-color .15s, background .15s;
  }
  .add-mini-check.is-on { border-color: var(--amber); background: var(--amber); }

  .add-mini-check-body { flex: 1; min-width: 0; }
  .add-mini-check-label {
    display: block;
    font-size: 14px; color: var(--text); line-height: 1.3;
    font-weight: 500;
  }
  .add-mini-check-label-na {
    margin-left: 6px; color: var(--muted); font-size: 13px; font-weight: 400;
  }
  .add-mini-check-hint {
    display: block;
    font-size: 13px; color: var(--muted);
    margin-top: 3px; line-height: 1.4;
  }

  /* Ligne URL + bouton copier */
  .add-mini-url-row {
    display: flex; gap: 8px; align-items: stretch;
    margin-bottom: 12px;
  }
  .add-mini-url-input {
    flex: 1; padding: 10px 16px; font-size: 13px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    color: var(--text); background: #111216;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 999px; outline: none;
    min-width: 0;
  }
  .add-mini-url-input:focus { border-color: rgba(245,176,86,0.4); }

  /* Ligne de statut mint */
  .add-mini-status {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--mono); font-size: 10px; font-weight: 500;
    letter-spacing: 1.4px; text-transform: uppercase;
    color: var(--mint); margin-bottom: 16px;
  }
  .add-mini-status-check {
    display: inline-flex; align-items: center; justify-content: center;
    width: 12px; height: 12px;
  }

  /* Pied de modale avec deux groupes (gauche: destructif, droite: actions) */
  .add-mini-foot.is-split { justify-content: space-between; }

  @media (max-width: 640px) {
    .add-mini-card { padding: 22px 18px 18px; }
    .add-mini-url-row { flex-direction: column; }
  }

  /* ══════════════════════════════════════════════════════ */
  /* ANALYSE EN COURS — v2 (radial + micro-steps)           */
  /* ══════════════════════════════════════════════════════ */
  .ap-scaffold {
    width: 100%; min-height: 100%;
    display: flex; align-items: center; justify-content: center;
    padding: 40px 20px; box-sizing: border-box;
    animation: fadeup .3s ease;
  }
  .ap-stack {
    display: flex; flex-direction: column; align-items: center;
    gap: 24px; max-width: 520px; width: 100%;
  }
  .ap-logo {
    height: 60px; width: auto; display: block;
    filter: drop-shadow(0 6px 22px rgba(245,166,35,0.28));
  }
  .ap-title {
    font-family: var(--body); font-size: 30px; font-weight: 600;
    letter-spacing: -0.4px; color: var(--text);
    text-align: center; margin: 0;
  }
  .ap-title em {
    font-style: normal; color: var(--amber);
  }
  .ap-sub {
    font-family: var(--mono); font-size: 10px; font-weight: 500;
    letter-spacing: 1.6px; text-transform: uppercase;
    color: var(--muted); text-align: center;
    margin: -12px 0 4px;
  }
  .ap-sub b { color: var(--soft); font-weight: 500; }

  /* Radial */
  .ap-radial-wrap {
    position: relative; width: 220px; height: 220px;
    margin: 4px 0 2px;
  }
  .ap-radial { width: 100%; height: 100%; transform: rotate(-90deg); display: block; }
  .ap-radial circle { fill: none; stroke-width: 3; }
  .ap-radial .track { stroke: rgba(255,255,255,0.05); }
  .ap-radial .bar {
    stroke: var(--amber);
    stroke-linecap: round;
    stroke-dasharray: 628;
    filter: drop-shadow(0 0 6px rgba(245,166,35,0.5));
    transition: stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1);
  }
  .ap-radial-inner {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center;
  }
  .ap-pct {
    font-family: var(--body); font-size: 46px; font-weight: 600;
    letter-spacing: -1px; color: var(--text); line-height: 1;
  }
  .ap-pct em {
    font-style: normal; color: var(--amber);
    font-size: 20px; margin-left: 2px;
    vertical-align: super; font-weight: 500;
  }
  .ap-status {
    font-family: var(--mono); font-size: 10px; font-weight: 500;
    letter-spacing: 1.4px; text-transform: uppercase;
    color: var(--amber); margin-top: 8px;
    max-width: 140px;
  }

  /* Micro-steps horizontaux */
  .ap-micro-steps {
    display: flex; justify-content: center;
    gap: 16px; flex-wrap: wrap;
    margin: 6px 0 2px;
  }
  .ap-micro {
    display: inline-flex; align-items: center; gap: 7px;
    font-family: var(--mono); font-size: 10px; font-weight: 500;
    letter-spacing: 1.2px; text-transform: uppercase;
    color: var(--muted);
  }
  .ap-micro b { font-weight: 500; }
  .ap-micro.is-done b { color: var(--mint); }
  .ap-micro.is-active b { color: var(--amber); }
  .ap-micro-bullet {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(255,255,255,0.12);
  }
  .ap-micro.is-done .ap-micro-bullet { background: var(--mint); }
  .ap-micro.is-active .ap-micro-bullet {
    background: var(--amber);
    box-shadow: 0 0 8px rgba(245,166,35,0.6);
    animation: ap-pulse 1.4s ease-in-out infinite;
  }
  @keyframes ap-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.55; }
  }

  /* Waveform animée */
  .ap-wave {
    display: flex; align-items: flex-end; justify-content: center;
    gap: 3px; height: 32px;
  }
  .ap-wave span {
    width: 3px; border-radius: 2px;
    background: linear-gradient(180deg, var(--amber), rgba(245,166,35,0.3));
    animation: ap-wave 1.4s ease-in-out infinite;
  }
  @keyframes ap-wave {
    0%, 100% { height: 6px; opacity: 0.5; }
    50% { height: 26px; opacity: 1; }
  }
  .ap-wave span:nth-child(1)  { animation-delay: 0.00s; }
  .ap-wave span:nth-child(2)  { animation-delay: 0.08s; }
  .ap-wave span:nth-child(3)  { animation-delay: 0.16s; }
  .ap-wave span:nth-child(4)  { animation-delay: 0.24s; }
  .ap-wave span:nth-child(5)  { animation-delay: 0.32s; }
  .ap-wave span:nth-child(6)  { animation-delay: 0.40s; }
  .ap-wave span:nth-child(7)  { animation-delay: 0.48s; }
  .ap-wave span:nth-child(8)  { animation-delay: 0.56s; }
  .ap-wave span:nth-child(9)  { animation-delay: 0.64s; }
  .ap-wave span:nth-child(10) { animation-delay: 0.72s; }
  .ap-wave span:nth-child(11) { animation-delay: 0.80s; }
  .ap-wave span:nth-child(12) { animation-delay: 0.88s; }

  /* Carte "Le saviez-vous" */
  .ap-tip {
    width: 100%;
    background: #0e0f14; border: 1px solid var(--border);
    border-radius: 14px; padding: 16px 18px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.02);
  }
  .ap-tip-kicker {
    display: inline-flex; align-items: center; gap: 7px;
    font-family: var(--mono); font-size: 10px; font-weight: 500;
    letter-spacing: 1.4px; text-transform: uppercase;
    color: var(--amber); margin-bottom: 6px;
  }
  .ap-tip-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--amber); }
  .ap-tip-body {
    font-size: 14px; color: var(--soft); line-height: 1.55;
    animation: fadein .4s ease;
  }

  /* État d'erreur */
  .ap-error {
    display: flex; flex-direction: column; align-items: center;
    gap: 18px; padding: 60px 20px;
    max-width: 420px; margin: 0 auto;
  }
  .ap-error-body {
    font-family: var(--mono); font-size: 13px; color: var(--red);
    text-align: center; line-height: 1.5;
    padding: 14px 18px; background: rgba(255,93,93,0.06);
    border: 1px solid rgba(255,93,93,0.25);
    border-radius: 12px;
  }
  .ap-error-retry {
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    letter-spacing: 1.2px; text-transform: uppercase;
    padding: 10px 20px; border-radius: 999px;
    color: var(--amber); background: transparent;
    border: 1px solid rgba(245,166,35,0.45);
    cursor: pointer; transition: all .15s;
  }
  .ap-error-retry:hover {
    border-color: var(--amber);
    background: rgba(245,166,35,0.06);
  }

  /* ── Bouton "Annuler l'analyse" (pill outline amber discret) ─
     Posé en bas du ap-stack, pas une action principale : on atténue
     le contour pour qu'il ne concurrence pas le radial ni le statut. */
  .ap-cancel {
    margin-top: 8px;
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    letter-spacing: 1.2px; text-transform: uppercase;
    padding: 10px 22px; border-radius: 999px;
    color: var(--muted); background: transparent;
    border: 1px solid rgba(255,255,255,0.10);
    cursor: pointer; transition: all .15s;
  }
  .ap-cancel:hover {
    color: var(--red);
    border-color: rgba(255,93,93,0.4);
    background: rgba(255,93,93,0.04);
  }

  /* ── Variante "finalize" (widget compact pour FicheScreen AnalyzingState) ──
     Même grammaire que ap-scaffold mais plus discret : pas d'anneau 220px,
     juste un petit anneau radial 120px + micro-steps + wave + tip. Se pose
     dans la colonne droite de FicheScreen pendant la rédaction de la fiche. */
  .ap-finalize {
    display: flex; flex-direction: column; align-items: center;
    gap: 22px; padding: 48px 20px 60px;
    max-width: 520px; margin: 0 auto;
  }
  .ap-finalize .ap-radial-wrap { width: 140px; height: 140px; }
  .ap-finalize .ap-radial { width: 140px; height: 140px; }
  .ap-finalize .ap-pct { font-size: 30px; }
  .ap-finalize .ap-pct em { font-size: 14px; }
  .ap-finalize .ap-status { font-size: 10px; letter-spacing: 1.5px; }
  .ap-finalize .ap-title { font-size: 24px; }

  /* ══════════════════════════════════════════════════════ */
  /* AUTH SCREEN — habillage v2                              */
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
    font-family: var(--mono); font-size: 12px; font-weight: 400;
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
    font-family: var(--mono); font-size: 12px; color: var(--muted);
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
    font-family: var(--mono); font-size: 12px; font-weight: 500;
    min-width: 28px; text-align: center;
  }
  .versions-s-version-info { flex: 1; min-width: 0; }
  .versions-s-version-name {
    font-family: var(--body); font-size: 14px; font-weight: 300; color: var(--soft);
  }
  .versions-s-version-date {
    font-family: var(--mono); font-size: 12px; color: var(--muted2);
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
    color: var(--amber); font-family: var(--mono); font-size: 12px;
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
    font-family: var(--mono); font-size: 12px; letter-spacing: 1px;
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
    font-family: var(--mono); font-weight: 600; font-size: 12px;
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
    font-family: var(--body); font-size: 14px; font-weight: 500; color: var(--text);
  }
  .mobile-avatar-popover-mail {
    font-family: var(--mono); font-size: 12px; color: var(--muted);
    margin-top: 3px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .mobile-avatar-popover-item {
    display: flex; align-items: center; gap: 10px;
    width: 100%;
    padding: 12px 14px;
    background: transparent; border: none;
    border-bottom: 1px solid var(--border);
    font-family: var(--body); font-size: 14px; font-weight: 400;
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
    .auth-brand { font-size: 36px; letter-spacing: -0.8px; }
    .auth-tagline { font-size: 9px; letter-spacing: 2px; gap: 8px; }
    .auth-input { padding: 14px 16px; font-size: 14px; border-radius: 12px; }
    .auth-submit { padding: 16px; font-size: 14px; border-radius: 12px; }
    .auth-oauth-btn { padding: 14px 16px; font-size: 13px; border-radius: 12px; }

    /* Réglages */
    .reglages-screen { padding: 30px 20px 120px; max-width: 100%; }
    .reglages-modal-overlay { padding: 0; }
    .reglages-modal-panel { max-width: 100%; max-height: 100vh; border-radius: 0; border: none; }
    .reglages-modal-panel .reglages-screen { padding: 56px 20px 80px; }
    .reglages-modal-close { top: 12px; right: 12px; }
    .reglages-title { font-size: 30px; letter-spacing: 2px; }
    .reglages-section { padding: 16px; border-radius: 12px; }
    .reglages-fields { flex-direction: column; gap: 10px; }
    .reglages-input { font-size: 14px; padding: 12px 14px; }
    .reglages-select { font-size: 14px; padding: 13px 40px 13px 14px; }
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
    .input-input { font-size: 14px; padding: 12px 14px; }
    .input-select { font-size: 14px; padding: 13px 40px 13px 14px; }
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
    .vchip .vscore { font-size: 14px; }

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
    .stats-grid .stat .v { font-size: 14px; }

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
    /* Mobile : wavesurfer visible (même rendu que desktop, on garde les
       barres audio), scrubber range caché. */
    .player .pl-wavesurfer { display: block; }
    .player .pl-scrubber { display: none; }
    .player .pl-time { font-size: 9px; min-width: 60px; }
    .player { gap: 8px; height: 60px; }
    .player .pl-btn { width: 34px; height: 34px; }
    /* Les deux boutons prev/next collent davantage au play : on resserre
       les pl-ctrl et on leur donne moins de padding interne pour gagner
       de la place à droite pour le titre et le scrubber. */
    .player .pl-ctrl {
      width: 24px; height: 24px;
    }
    /* Le groupe {prev | play | next} se suit avec un gap encore plus
       resserré, puis le titre respire à 10px. On utilise margin pour ça. */
    .player .pl-ctrl + .pl-btn,
    .player .pl-btn + .pl-ctrl {
      margin-left: -2px;
    }
    .player .pl-ctrl + .pl-meta,
    .player .pl-btn + .pl-meta {
      margin-left: 4px;
    }
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
    font-size: 12px; font-weight: 600; letter-spacing: 2px;
    color: var(--accent);
  }
  .public-fiche-topbar .pft-subbrand {
    font-size: 12px; color: var(--muted); letter-spacing: 1px;
    text-transform: uppercase;
  }
  .public-fiche-topbar .pft-cta {
    font-size: 14px; color: var(--text); text-decoration: none;
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
    font-size: 14px; color: var(--muted);
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
    font-size: 14px; color: var(--text); text-decoration: none;
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
    text-align: center; font-size: 14px; color: var(--muted);
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
    font-size: 14px;
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
    .vchip .vscore { font-size: 14px; }
  }
`}</style>

      {/* ============================================================
          IntentionScreen — écran intermédiaire Phase A → Phase B
          Cohérence visuelle avec la refonte v2 (fond sombre, ambre
          principal, serif Fraunces pour les titres, mono pour les
          kickers, cards sur --s1 avec border --border).
          ============================================================ */}
      <style>{`
  /* L'écran d'intention prend toute la hauteur du viewport, fond transparent
     (hérite du fond ambient de la page avec les halos — comme la Home et la
     fiche). Le contenu est lui-même capé en largeur via un max-width sur les
     enfants directs pour garder une lecture confortable. */
  .intent-screen {
    min-height: 100vh;
    color: var(--text);
    font-family: var(--body);
    padding: 64px 32px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .intent-screen > * {
    width: 100%;
    max-width: 1000px;
  }
  .intent-screen-compact > * {
    max-width: 520px;
  }
  .intent-screen-compact {
    padding: 72px 24px;
  }
  /* Espacement de la waveform animée, du panneau tips et du bouton Annuler
     pour respecter les mêmes respirations que le .ap-stack du Loading.
     Largeur resserrée à 640 px pour s'aligner sur le bloc centré
     (.intent-col-main-centered) plutôt que d'étaler à 1000 px. */
  .intent-screen .ap-wave {
    margin-top: 28px;
    margin-bottom: 4px;
    max-width: 520px;
  }
  .intent-screen .ap-tip {
    margin-top: 16px;
    max-width: 520px;
  }
  /* Le bouton « Annuler l'analyse » devient direct enfant de .intent-screen :
     on l'isole (pas de max-width étiré à 1000 px), on le centre via
     align-self, et on lui donne l'espacement vertical du Loading. */
  .intent-screen > .intent-btn-cancel {
    width: auto !important;
    max-width: none !important;
    align-self: center;
    margin-top: 24px;
  }

  /* Logo VERSIONS en tête d'écran, même traitement que .ap-logo du
     Loading : drop-shadow ambre subtile, hauteur 60 px. S'aligne avec
     le centrage flex du parent .intent-screen. */
  .intent-logo {
    width: auto !important;
    max-width: 200px !important;
    height: 60px;
    display: block;
    margin-bottom: 32px;
    filter: drop-shadow(0 6px 22px rgba(245,166,35,0.28));
  }

  /* ── Header : kicker + titre + subtitle ─────────────────────
     Typo calée sur la topbar fiche (pas de serif immense) : titre
     en body/bold 24-26 px, accent ambre italique sur les mots-clés. */
  .intent-head {
    margin-bottom: 20px;
  }
  .intent-kicker {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--amber);
    margin-bottom: 14px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .intent-kicker::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--amber);
  }
  .intent-title {
    font-family: var(--body);
    font-weight: 700;
    font-size: 26px;
    line-height: 1.3;
    color: var(--text);
    margin: 0;
    letter-spacing: -0.4px;
  }
  .intent-title em {
    font-style: normal;
    font-weight: 700;
    color: var(--amber);
  }
  .intent-subtitle {
    font-size: 14px;
    line-height: 1.55;
    color: var(--soft);
    margin: 0;
    max-width: 620px;
  }
  .intent-subtitle i {
    font-style: italic;
    color: var(--text);
  }
  /* Titre de relance — bascule entre la carte "Lecture initiale" et le
     textarea d'intention. Aligné en taille/graisse sur .intent-title
     pour donner deux titres de même poids visuel. Marges à 0 : le
     rythme vertical est tenu par le gap: 20px du parent .intent-col-main. */
  .intent-section-title {
    font-family: var(--body);
    font-weight: 700;
    font-size: 26px;
    line-height: 1.3;
    color: var(--text);
    letter-spacing: -0.4px;
    margin: 0;
  }
  .intent-section-title em {
    font-style: normal;
    font-weight: 700;
    color: var(--amber);
  }

  /* ── Grid 2 colonnes (desktop) ──────────────────────────────
     Conservé pour compat éventuelle — actuellement inutilisé : l'écran
     V1 a été recentré sur une seule colonne (.intent-col-main-centered).
  */
  .intent-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(240px, 0.9fr);
    gap: 32px;
    align-items: start;
  }
  .intent-col-main {
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 0;
  }
  /* Variante colonne unique centrée — même respiration que les premières
     étapes d'upload (largeur ~640 px, contenu centré vertical+horizontal
     via le flex du parent .intent-screen). */
  .intent-col-main-centered {
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
  }
  /* Header aligné à gauche dans la largeur centrée (max-width du parent). */
  .intent-screen:has(.intent-col-main-centered) .intent-head {
    width: 100%;
    max-width: 520px;
    margin-left: auto;
    margin-right: auto;
  }
  .intent-col-side {
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
  }

  /* ── Perception card (CE QUE J'ENTENDS) ─────────────────────
     Harmonisée avec les cards de la fiche (plan-panel, intent-panel-fiche) :
     fond var(--card), border standard, radius 14 px, contenu en body font.
     Eyebrow mono ambre + dot reproduisent le pattern Notes/Plan. */
  .intent-perception {
    position: relative;
    background: var(--card);
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    border-radius: 14px;
    padding: 20px 22px;
    overflow: hidden;
  }
  .intent-perception::before {
    content: '';
    position: absolute;
    bottom: -60px; right: -60px;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: var(--amber, #F59E0B);
    filter: blur(80px);
    opacity: 0.10;
    pointer-events: none;
    z-index: 0;
  }
  .intent-perception > * { position: relative; z-index: 1; }
  .intent-perception-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--mono);
    font-size: 10.5px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--amber);
    margin-bottom: 12px;
  }
  .intent-perception-kicker::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--amber);
    flex-shrink: 0;
  }
  .intent-perception-lead {
    font-family: var(--body);
    font-size: 15px;
    line-height: 1.55;
    font-weight: 400;
    color: var(--text);
  }
  .intent-perception-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 14px;
  }
  .intent-chip {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 1px;
    padding: 5px 10px;
    border-radius: 999px;
    background: rgba(255,255,255,0.04);
    color: var(--soft, rgba(255,255,255,0.72));
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    text-transform: uppercase;
  }
  .intent-tag {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 1px;
    padding: 5px 10px;
    border-radius: 999px;
    background: transparent;
    color: var(--amber);
    border: 1px solid rgba(245, 166, 35, 0.35);
    text-transform: uppercase;
  }

  /* ── Textarea ─────────────────────────────────────────────── */
  .intent-textarea-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .intent-textarea {
    width: 100%;
    min-height: 140px;
    resize: vertical;
    background: var(--card, rgba(255,255,255,0.02));
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    border-radius: 14px;
    padding: 16px 18px 32px;
    color: var(--text);
    font-family: var(--body);
    font-size: 14px;
    line-height: 1.55;
    box-sizing: border-box;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .intent-textarea::placeholder {
    color: var(--muted);
    font-style: italic;
  }
  .intent-textarea:focus {
    outline: none;
    border-color: var(--amber-line, rgba(245,166,35,0.45));
  }
  .intent-char-count {
    position: absolute;
    right: 12px;
    bottom: 8px;
    font-family: var(--mono);
    font-size: 10px;
    color: var(--muted);
    pointer-events: none;
  }

  /* ── Scope selector (segmented) ──────────────────────────── */
  .intent-scope {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .intent-scope-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: var(--muted, rgba(255,255,255,0.5));
  }
  .intent-scope-label::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--muted, rgba(255,255,255,0.5));
  }
  .intent-seg {
    display: inline-flex;
    padding: 4px;
    background: transparent;
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    border-radius: 999px;
    width: fit-content;
    gap: 2px;
  }
  .intent-seg-btn {
    font-family: var(--mono);
    font-size: 10.5px;
    letter-spacing: 1.1px;
    text-transform: uppercase;
    font-weight: 500;
    padding: 7px 14px;
    background: transparent;
    border: 0;
    border-radius: 999px;
    color: var(--soft, rgba(255,255,255,0.72));
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
    white-space: nowrap;
  }
  .intent-seg-btn:hover:not(.on) {
    background: rgba(255,255,255,0.04);
    color: var(--text);
  }
  .intent-seg-btn.on {
    background: rgba(245, 166, 35, 0.12);
    color: var(--amber, #f5a623);
    /* Pas de fond solide : pattern ambre transparent aligné sur les
       autres états actifs de l'app (chips, bouton Enregistrer Notes). */
  }

  /* ── Actions (ghost + primary) ───────────────────────────────
     Style mono/uppercase calé sur le bouton + Nouvelle version et les
     boutons Notes (ambre transparent, pas de fond solide).
     Le bouton « Annuler » n'est PAS ici : il est posé plus bas, après
     le panneau tips, comme sur le Loading. */
  .intent-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
    flex-wrap: wrap;
  }
  .intent-actions button { white-space: nowrap; }
  .intent-btn-ghost,
  .intent-btn-primary {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 1.1px;
    text-transform: uppercase;
    font-weight: 500;
    padding: 9px 14px;
    border-radius: 999px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    line-height: 1;
    transition: background .15s ease, border-color .15s ease, color .15s ease;
    flex-shrink: 0;
  }
  .intent-btn-ghost {
    background: transparent;
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    color: var(--soft, rgba(255,255,255,0.72));
  }
  .intent-btn-ghost:hover {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.18);
    color: var(--text);
  }
  .intent-btn-primary {
    background: transparent;
    border: 1px solid var(--amber, #f5a623);
    color: var(--amber, #f5a623);
  }
  .intent-btn-primary:hover:not(:disabled) {
    background: rgba(245, 166, 35, 0.12);
  }
  .intent-btn-primary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  /* Bouton « Annuler l'analyse » — même style que .ap-cancel du Loading :
     outline très discret, hover rouge pour signaler le côté destructif.
     Positionné automatiquement à droite grâce au justify-content: space-between
     du parent .intent-actions. */
  .intent-btn-cancel {
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 1.1px;
    text-transform: uppercase;
    padding: 9px 14px;
    border-radius: 999px;
    color: var(--muted, rgba(255,255,255,0.5));
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    line-height: 1;
    transition: background .15s ease, border-color .15s ease, color .15s ease;
    flex-shrink: 0;
  }
  .intent-btn-cancel:hover {
    color: var(--red, #ff5d5d);
    border-color: rgba(255, 93, 93, 0.4);
    background: rgba(255, 93, 93, 0.04);
  }

  /* ── Examples (colonne latérale) ──────────────────────────
     Alignés sur le pattern card unifié de la refonte : fond var(--card),
     border 14 px radius. Eyebrow "DES EXEMPLES POUR TE LANCER" en mono muted
     avec dot cerulean (même que .notes-eyebrow de la fiche).  */
  .intent-examples-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: var(--muted, rgba(255,255,255,0.5));
    margin-bottom: 12px;
  }
  .intent-examples-title::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--cerulean, #5cb8cc);
  }
  .intent-examples {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .intent-example {
    display: flex;
    flex-direction: column;
    gap: 6px;
    text-align: left;
    padding: 14px 16px;
    background: var(--card);
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    border-radius: 14px;
    color: var(--soft);
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
    font-family: var(--body);
  }
  .intent-example:hover {
    background: rgba(255,255,255,0.03);
    border-color: rgba(245,166,35,0.35);
  }
  .intent-example-label {
    font-family: var(--mono);
    font-size: 9.5px;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: var(--amber);
  }
  .intent-example-body {
    font-size: 13px;
    line-height: 1.5;
    font-style: italic;
    color: var(--text);
  }

  /* ── Pipeline (colonne latérale) ─────────────────────────── */
  .intent-pipeline {
    padding: 16px 18px;
    background: var(--card);
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    border-radius: 14px;
  }
  .intent-pipeline-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: var(--muted, rgba(255,255,255,0.5));
    margin-bottom: 12px;
  }
  .intent-pipeline-title::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--cerulean, #5cb8cc);
  }
  .intent-pipeline-step {
    position: relative;
    padding: 6px 0 6px 18px;
    font-size: 13px;
    color: var(--muted);
    font-family: var(--body);
  }
  .intent-pipeline-step::before {
    content: '';
    position: absolute;
    left: 0;
    top: 12px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--muted2);
  }
  .intent-pipeline-step.done {
    color: var(--soft);
  }
  .intent-pipeline-step.done::before {
    background: var(--mint);
  }
  .intent-pipeline-step.active {
    color: var(--text);
    font-weight: 500;
  }
  .intent-pipeline-step.active::before {
    background: var(--amber);
    box-shadow: 0 0 0 3px var(--amber-glow);
  }

  /* ── Responsive : < 900px on collapse les 2 colonnes ─────── */
  @media (max-width: 900px) {
    .intent-screen {
      padding: 32px 20px 48px;
    }
    .intent-title {
      font-size: 26px;
    }
    .intent-grid {
      grid-template-columns: 1fr;
      gap: 24px;
    }
  }

  /* ── IntentPanel sur FicheScreen ──────────────────────────────────
     Aligné sur le style de .plan-panel (même card, même eyebrow ambre,
     même halo bas-droit) pour cohérence visuelle dans la colonne droite.
     Eyebrow toujours visible ; corps (prompt) déployable au clic. */
  .fiche-v2 .intent-panel-fiche {
    position: relative;
    overflow: hidden;
    background: var(--card);
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    border-radius: 14px;
    padding: 20px 22px;
    margin: 0 0 14px;
  }
  .fiche-v2 .intent-panel-fiche::before {
    content: '';
    position: absolute;
    bottom: -60px; right: -60px;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: var(--amber, #F59E0B);
    filter: blur(80px);
    opacity: 0.12;
    pointer-events: none;
    z-index: 0;
  }
  .fiche-v2 .intent-panel-fiche > * { position: relative; z-index: 1; }

  /* Eyebrow / titre cliquable — même typo que .plan-eyebrow.
     Structure : label (titre + scope en colonne) | chevron. */
  .fiche-v2 .intent-panel-fiche .intent-panel-eyebrow {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    background: transparent;
    border: 0;
    padding: 0;
    margin: 0;
    cursor: pointer;
    text-align: left;
    color: inherit;
    font: inherit;
  }
  .fiche-v2 .intent-panel-fiche .intent-panel-label {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    min-width: 0;
    flex: 1;
  }
  .fiche-v2 .intent-panel-fiche .intent-panel-title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--mono);
    font-size: 10.5px;
    letter-spacing: 2.2px;
    text-transform: uppercase;
    color: var(--amber);
  }
  .fiche-v2 .intent-panel-fiche .intent-panel-title-row .dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--amber);
    flex-shrink: 0;
  }
  .fiche-v2 .intent-panel-fiche .intent-panel-title {
    white-space: nowrap;
  }
  .fiche-v2 .intent-panel-fiche .intent-panel-scope {
    font-family: var(--mono);
    color: var(--muted, rgba(255,255,255,0.5));
    letter-spacing: 1.4px;
    font-size: 10px;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    /* aligné avec le texte « INTENTION ARTISTIQUE » (dot 6px + gap 10px) */
    padding-left: 16px;
  }
  .fiche-v2 .intent-panel-fiche .intent-panel-chev {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--amber);
    margin-left: auto;
    transition: transform .2s ease;
  }
  .fiche-v2 .intent-panel-fiche.open .intent-panel-chev {
    transform: rotate(180deg);
  }
  /* Corps (prompt) — apparaît au clic, aligné sur le contenu du card. */
  .fiche-v2 .intent-panel-fiche .intent-panel-body {
    margin: 14px 0 0;
    padding: 0;
    font-family: var(--body);
    font-size: 14px;
    line-height: 1.55;
    color: var(--text);
    font-style: italic;
  }
`}</style>
    </>
  );
}
