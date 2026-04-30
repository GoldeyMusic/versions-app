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
    /* Bordure dédiée aux boutons "outline / ghost" (transparent + bordure
       seule). --border à 0.06 est calibré pour les panels/cards et devient
       quasi invisible sur des boutons posés directement sur le fond — d'où
       ces deux tokens dédiés, plus contrastés. */
    --btn-border: rgba(255,255,255,0.28);
    --btn-border-hover: rgba(255,255,255,0.45);

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
  html, body { margin: 0; padding: 0; background: var(--bg); color: var(--text); font-family: var(--body); font-weight: 300; font-size: 14px; scroll-behavior: smooth; overflow-x: hidden; }
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

  /* ── Orbes colorées globales — couche monté en sibling de #root ──
     Continu d'une page à l'autre (pas de remount à chaque navigation,
     contrairement aux anciennes ::before par-page qui repartaient à
     0% à chaque switch). Trois orbes (cerulean / amber / violet) en
     position fixed, drift lent (50s) pour rester subtil. */
  .va-bg-orbs {
    position: fixed;
    /* Conteneur volontairement plus grand que le viewport (-8vh/-8vw)
       pour que l'animation va-bg-drift (qui translate jusqu'à -2.5%
       horizontalement) ne fasse JAMAIS apparaître un bord noir du
       body bg sur la droite. Avant : inset 0 + translate -2.5% →
       bande sombre côté droit pendant ~25s du cycle. */
    inset: -8vh -8vw;
    pointer-events: none;
    z-index: 0;
    background:
      radial-gradient(ellipse 60% 45% at 12% 22%, rgba(92,184,204,0.14), transparent 80%),
      radial-gradient(ellipse 55% 60% at 92% 50%, rgba(245,166,35,0.16), transparent 85%),
      radial-gradient(ellipse 60% 45% at 25% 85%, rgba(166,126,245,0.13), transparent 80%);
    animation: va-bg-drift 50s ease-in-out infinite alternate;
  }
  @keyframes va-bg-drift {
    0%   { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(-2.5%, 1.5%, 0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .va-bg-orbs { animation: none; }
  }

  /* ── Animations d'entrée au scroll (système global) ─────────────
     Classe ajoutée par un IntersectionObserver côté JS quand
     l'élément entre dans le viewport. Fade-up doux, stagger via
     la CSS var --anim-d (ms). Utilisée sur le dashboard, et
     potentiellement à terme sur landing+pricing pour unifier
     (extraction prévue dans une passe future).
     prefers-reduced-motion : transitions désactivées. */
  .wh-anim {
    opacity: 0;
    transform: translateY(14px);
    transition:
      opacity .55s cubic-bezier(.2,.7,.3,1),
      transform .55s cubic-bezier(.2,.7,.3,1);
    transition-delay: var(--anim-d, 0ms);
    will-change: opacity, transform;
  }
  .wh-anim.wh-anim-in {
    opacity: 1;
    transform: none;
    /* Une fois l'animation passée, on libère will-change : il garde
       sinon un stacking context permanent qui isole les z-index des
       enfants (le menu 3-points d'un titre se faisait masquer par les
       sections sœurs sous le bloc projets). */
    will-change: auto;
  }
  @media (prefers-reduced-motion: reduce) {
    .wh-anim {
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
    }
  }

  /* ── Rail utilitaire bas-gauche (DashboardRail) ──────────────────
     picto Réglages + Déconnexion + pill crédits. Rendu sur welcome
     ET sur la landing pour utilisateurs connectés. Position fixed,
     aligné avec le logo (même left padding 18px), au-dessus du
     player (76px + 16px d'air = ~92px du bas).
     Le CSS vit ici (pas dans le composant) pour être chargé global
     — sinon le rail rendu hors DashboardTopbar n'aurait pas son
     style. */
  .db-utility-rail {
    position: fixed;
    left: 18px;
    bottom: 92px;
    z-index: 10;
    display: inline-flex; align-items: center; gap: 8px;
  }
  /* Pill crédits — mono uppercase ambre, click → /pricing.
     Visuellement parente des .pr-chip (langage néon, interactive). */
  .db-utility-credits {
    display: inline-flex; align-items: center;
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    letter-spacing: 1.4px; text-transform: uppercase;
    padding: 9px 14px;
    border-radius: 999px;
    background: rgba(245,166,35,0.10);
    border: 1px solid rgba(245,166,35,0.34);
    color: var(--amber);
    cursor: pointer;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    transition: background .15s, border-color .15s, transform .15s;
  }
  .db-utility-credits:hover {
    background: rgba(245,166,35,0.16);
    border-color: rgba(245,166,35,0.55);
    transform: translateY(-1px);
  }
  .db-utility-credits:focus-visible {
    outline: 2px solid var(--amber);
    outline-offset: 2px;
  }
  .db-utility-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 36px; height: 36px;
    background: rgba(20, 20, 22, 0.6);
    border: 1px solid var(--border);
    border-radius: 999px;
    color: var(--muted);
    cursor: pointer;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition: color .15s, border-color .15s, background .15s, transform .15s;
  }
  .db-utility-btn:hover {
    color: var(--text);
    border-color: rgba(255, 255, 255, 0.20);
    background: rgba(255, 255, 255, 0.04);
    transform: translateY(-1px);
  }
  .db-utility-btn:focus-visible {
    outline: 2px solid var(--amber);
    outline-offset: 2px;
  }
  /* Variante Admin — accent ambre pour le distinguer (visible
     uniquement sur le compte admin via VITE_ADMIN_EMAIL). */
  .db-utility-btn-admin {
    color: var(--amber, #f5a623);
    border-color: rgba(245,166,35,0.35);
  }
  .db-utility-btn-admin:hover {
    color: var(--amber, #f5a623);
    border-color: rgba(245,166,35,0.55);
    background: rgba(245,166,35,0.08);
  }

  /* ── EvolutionBanner — fix layout mobile ──────────────────────
     Sur mobile (≤480 px), les chips compactes (n↑ n↓ n→ +n) prennent
     trop de place sur la ligne du titre, ce qui réduit le résumé à
     "Score …". On réagence : titre + résumé prennent toute la ligne,
     les chips wrap sur une 2e ligne sous le titre, le chevron reste
     à droite. Sélecteurs neutralisent les inline-styles via attr. */
  @media (max-width: 480px) {
    .evo-eyebrow {
      flex-wrap: wrap !important;
      align-items: flex-start !important;
    }
    /* La colonne titre+résumé prend toute la largeur disponible, le
       chevron sticky à droite. Les chips wrap dessous (order 3). */
    .evo-eyebrow > span:first-of-type {
      flex: 1 1 100% !important;
      min-width: 0 !important;
    }
    .evo-eyebrow > span:first-of-type span:last-child {
      white-space: normal !important;
      display: -webkit-box !important;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-clamp: 2;
      overflow: hidden;
    }
  }

  /* ── Lang dropdown — variante compacte du switch FR/EN ─────────
     Bouton avec la langue courante + chevron, qui ouvre un mini menu
     listant les deux options en toutes lettres (Français / English).
     Calé sur la grammaire visuelle des autres pills topbar (.lp-topbar-link
     / .db-topbar-link, .pr-chip etc.) : mono uppercase, border subtle,
     hover ambre. */
  .lang-dd {
    position: relative;
    display: inline-flex;
    align-items: center;
  }
  .lang-dd-trigger {
    display: inline-flex; align-items: center; gap: 6px;
    /* Refonte 2026-04-30 : aligné sur .hb-trigger (32 px de haut)
       pour que hamburger + lang dropdown soient raccord visuellement
       côté droit du topbar. */
    height: 32px;
    padding: 0 11px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 999px;
    color: var(--text-soft, var(--muted));
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    letter-spacing: 1.4px; text-transform: uppercase;
    line-height: 1; cursor: pointer;
    box-sizing: border-box;
    transition: border-color .15s, color .15s, background .15s;
  }
  .lang-dd-trigger:hover,
  .lang-dd-trigger.is-open {
    color: var(--amber);
    border-color: rgba(245, 166, 35, 0.45);
    background: rgba(245, 166, 35, 0.04);
  }
  .lang-dd-trigger:focus-visible {
    outline: 2px solid var(--amber);
    outline-offset: 2px;
  }
  .lang-dd-chev {
    transition: transform .18s ease;
    flex-shrink: 0;
  }
  .lang-dd-trigger.is-open .lang-dd-chev {
    transform: rotate(180deg);
  }
  .lang-dd-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 140px;
    background: var(--s1, #18181c);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    padding: 6px;
    z-index: 200;
    display: flex; flex-direction: column;
    gap: 2px;
  }
  .lang-dd-item {
    display: flex; align-items: center;
    padding: 8px 12px;
    background: transparent;
    border: 0;
    border-radius: 8px;
    color: var(--text-soft, var(--muted));
    font-family: var(--body); font-size: 13px; font-weight: 400;
    letter-spacing: 0;
    text-align: left;
    cursor: pointer;
    transition: background .12s, color .12s;
  }
  .lang-dd-item:hover {
    color: var(--text);
    background: rgba(255, 255, 255, 0.05);
  }
  .lang-dd-item.is-active {
    color: var(--amber);
    background: rgba(245, 166, 35, 0.08);
  }
  .lang-dd-item.is-active::after {
    content: '✓';
    margin-left: auto;
    font-size: 12px;
  }

  /* ── Hamburger menu — bouton + dropdown nav principale ─────────
     Trigger 32x32 carré arrondi avec icône 3 lignes. Au click, ouvre
     un mini menu vertical avec icône + label par ligne. Le hamburger
     est rendu côte à côte des liens texte sur le DOM, mais visible
     UNIQUEMENT en mobile (≤768 px) via CSS — sur desktop, c'est la
     nav texte classique (Accueil/Tarifs/Tableau de bord) qui s'affiche
     dans la topbar. */
  .hb-menu {
    /* Hidden by default (desktop) — toggled to inline-flex in mobile
       media query below. */
    display: none;
    position: relative;
    align-items: center;
  }
  @media (max-width: 768px) {
    .hb-menu { display: inline-flex; }
    /* À l'inverse, on cache la nav texte sur mobile pour ne pas avoir
       de doublon avec le hamburger. */
    .lp-topbar-nav .lp-topbar-link,
    .lp-topbar-nav .lp-topbar-current,
    .pr-topbar-nav .pr-topbar-link,
    .pr-topbar-nav .pr-topbar-current,
    .db-topbar-nav .db-topbar-link,
    .db-topbar-nav .db-topbar-current {
      display: none;
    }
  }
  .hb-trigger {
    display: inline-flex; align-items: center; justify-content: center;
    width: 32px; height: 32px;
    padding: 0;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 999px;
    color: var(--text-soft, var(--muted));
    cursor: pointer;
    transition: border-color .15s, color .15s, background .15s;
  }
  .hb-trigger:hover,
  .hb-trigger.is-open {
    color: var(--amber);
    border-color: rgba(245, 166, 35, 0.45);
    background: rgba(245, 166, 35, 0.04);
  }
  .hb-trigger:focus-visible {
    outline: 2px solid var(--amber);
    outline-offset: 2px;
  }

  /* Menu vertical : icône + label sur chaque ligne. Refonte 2026-04-30
     suite test icon-only — les symboles seuls n étaient pas assez
     parlants. Sections Nav + Utility + Footer (crédits/abonnement). */
  .hb-menu-pop {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    background: var(--s1, #18181c);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 14px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    padding: 6px;
    z-index: 200;
    display: flex;
    flex-direction: column;
    gap: 0;
    min-width: 220px;
    overflow: hidden;
  }
  .hb-section {
    display: flex; flex-direction: column;
    gap: 2px;
  }
  .hb-sep {
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin: 6px 4px;
  }

  .hb-item {
    display: inline-flex; align-items: center;
    width: 100%;
    padding: 9px 12px;
    gap: 12px;
    text-align: left;
    background: transparent;
    border: 0;
    border-radius: 8px;
    color: var(--text-soft, var(--muted));
    cursor: pointer;
    transition: background .12s, color .12s;
  }
  .hb-item:hover {
    color: var(--text);
    background: rgba(255, 255, 255, 0.05);
  }
  .hb-item.is-current {
    color: var(--amber);
    background: rgba(245, 166, 35, 0.08);
  }
  .hb-item.is-danger { color: rgba(255, 130, 130, 0.85); }
  .hb-item.is-danger:hover {
    color: #ff8a8a;
    background: rgba(255, 100, 100, 0.08);
  }
  .hb-item-icon {
    display: inline-flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    width: 22px; height: 22px;
  }
  .hb-item-label {
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    letter-spacing: 1.2px; text-transform: uppercase;
    line-height: 1.1;
  }

  /* Footer crédits + abonnement — pill cliquable plein-largeur en bas
     du menu, qui mène à /pricing. Tinted ambre subtil pour l attirer
     l œil sans crier. */
  .hb-footer {
    display: inline-flex; align-items: center;
    width: 100%;
    padding: 10px 12px;
    gap: 12px;
    text-align: left;
    background: rgba(245, 166, 35, 0.06);
    border: 0;
    border-radius: 8px;
    color: var(--text);
    cursor: pointer;
    transition: background .12s;
  }
  .hb-footer:hover {
    background: rgba(245, 166, 35, 0.12);
  }
  .hb-footer-icon {
    display: inline-flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    width: 22px; height: 22px;
    color: var(--amber);
  }
  .hb-footer-info {
    display: flex; flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }
  .hb-footer-credits {
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    letter-spacing: 1.4px; text-transform: uppercase;
    color: var(--amber);
    line-height: 1;
  }
  .hb-footer-plan {
    font-family: var(--body); font-size: 11px; font-weight: 400;
    color: var(--muted);
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hb-footer-arrow {
    color: var(--muted);
    flex-shrink: 0;
  }
  .hb-footer:hover .hb-footer-arrow { color: var(--amber); }

  @media (max-width: 480px) {
    /* Fix mobile 2026-04-30 : sur 390 px le rail bas-gauche
       (99 CRÉDITS + ★ ⚙ ⎋) chevauchait l add-pill, le chat-pill et le
       player en bas — 4 couches superposées sur ~100 px.
       → On le passe en position: absolute (scroll-with-page) ancré
         juste sous la topbar, à droite. Visible au chargement, scrolle
         avec la page (pas de chevauchement permanent). Pour revenir à
         crédits/réglages/signout, l utilisateur remonte en haut. */
    /* Refonte mobile 2026-04-30 (v3) : tous les items du rail flottant
       (crédits, admin, réglages, signout) sont maintenant rapatriés
       dans le menu hamburger de la topbar — section utility + footer
       crédits/abonnement. Le rail devient redondant sur mobile, on le
       masque entièrement. Le rail desktop reste inchangé (toujours
       affiché en bas-gauche pour les utilisateurs connectés). */
    .db-utility-rail {
      display: none;
    }
  }

  /* ── Layout ──────────────────────────────────── */
  .app { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }
  /* .dapp = wrapper utilisé quand pas de sidebar (mobile + welcome
     desktop). On crée un stacking context (position relative + z-index
     1) pour soulever le contenu au-dessus de .ambient-halo, comme le
     font .lp-screen et .pr-screen. Sans ça, l'ambient-halo peint par-
     dessus le contenu, qui assombrit visuellement la page.
     IMPORTANT : background transparent !important pour overrider la
     règle de GlobalStyles.jsx qui pose un .dapp { background: black }
     opaque. Sans ça, .dapp cache les orbes globaux (.va-bg-orbs) et
     l'ambient-halo derrière son fond solide → fond noir uni. */
  .dapp {
    position: relative; z-index: 1; min-height: 100vh;
    background: transparent !important;
  }

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
    background: transparent; border: 1px solid var(--btn-border);
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
  /* Variante portalisée (rendue dans <body>) : neutralise les styles
     d'ancrage absolu hérités, conserve l'apparence + monte le z-index
     pour être au-dessus des stacking contexts (topbar sticky, chat, ...). */
  .version-dropdown-menu-portal {
    top: auto; left: auto; /* écrasés par le style inline */
    z-index: 1000;
    max-width: min(90vw, 360px);
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
    border: 1px solid var(--btn-border);
    color: var(--textSoft, #b8bdc7);
  }
  .vocal-suggest .vs-btn-ghost:hover:not(:disabled) {
    border-color: var(--btn-border-hover);
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
    background: transparent; border: 1px solid var(--btn-border);
    color: var(--soft); cursor: pointer;
    width: 34px; height: 34px; border-radius: 8px;
    display: inline-flex; align-items: center; justify-content: center;
    padding: 0; flex-shrink: 0;
    transition: background .15s, color .15s, border-color .15s;
  }
  .fiche-topbar-wrap .fiche-back:hover {
    background: var(--s1); color: var(--text); border-color: var(--btn-border-hover);
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
    border: 1px solid var(--btn-border); background: transparent;
    color: var(--soft); cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center;
    padding: 0;
    transition: background .15s, color .15s, border-color .15s;
  }
  .fiche-topbar-actions .btn-ic:hover:not(:disabled) {
    background: var(--s1); color: var(--text);
    border-color: var(--btn-border-hover);
  }
  .fiche-topbar-actions .btn-ic:disabled { opacity: .5; cursor: not-allowed; }
  .fiche-topbar-actions .btn-ic svg { width: 16px; height: 16px; }

  /* ── Verdict row grid (refonte 2026-04-30bis) ──────────────────
     Layout 2/3 + 1/3 sous la fiche : à gauche le bandeau "Verdict
     de sortie" (ReleaseReadinessBanner), à droite un panneau "pop"
     avec BPM/Key/LUFS/Genre en chips colorés (langage néon comme
     les chips de la pricing/landing) + actions share/scoreCard/
     export. Sur viewport étroit, on revient à 1 colonne. */
  .verdict-row-grid {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    gap: 16px;
    margin: 0 0 18px;
    align-items: stretch;
  }
  /* Le ReleaseReadinessBanner a déjà son margin-bottom de 18px ; on
     l'annule dans le grid pour que le gap géré par grid suffise. */
  .verdict-row-grid .verdict-col-main .release-readiness {
    margin: 0;
    height: 100%;
  }
  .verdict-col-side {
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border-radius: 14px;
    border: 1px solid var(--border, rgba(255,255,255,0.06));
    background: var(--card, #101118);
    text-align: center;
  }
  .vside-chips {
    display: flex; flex-wrap: wrap;
    gap: 8px 10px;
    align-items: center; justify-content: center;
  }
  .vside-chip {
    display: inline-flex; align-items: center;
    font-family: var(--mono);
    font-size: 10.5px; font-weight: 500;
    letter-spacing: 1.4px; text-transform: uppercase;
    padding: 5px 11px;
    border-radius: 999px;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    box-shadow: 0 6px 18px -10px rgba(0,0,0,0.55);
    user-select: none;
    transition: transform .2s ease, background .15s, border-color .15s;
  }
  /* Reset des styles bouton natif pour les chips boutons (genre éditable) */
  button.vside-chip {
    font-family: var(--mono);
    cursor: pointer;
    appearance: none;
  }
  button.vside-chip:disabled { cursor: default; opacity: 0.7; }
  .vside-chip-cerulean { background: rgba(92,184,204,0.10); border: 1px solid rgba(92,184,204,0.34); color: #5cb8cc; }
  .vside-chip-violet   { background: rgba(166,126,245,0.10); border: 1px solid rgba(166,126,245,0.34); color: #c2a8ff; }
  .vside-chip-mint     { background: rgba(142,224,122,0.10); border: 1px solid rgba(142,224,122,0.34); color: #8ee07a; }
  .vside-chip-amber    { background: rgba(245,166,35,0.12);  border: 1px solid rgba(245,166,35,0.40); color: var(--amber, #f5a623); }
  /* Variantes empty / editing pour la chip genre */
  .vside-chip-empty {
    background: rgba(245,166,35,0.04);
    border-style: dashed;
    color: rgba(245,166,35,0.75);
  }
  .vside-chip-editing {
    padding: 2px 8px;
  }
  .vside-chip-editing input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--amber, #f5a623);
    font-family: var(--mono);
    font-size: 10.5px; font-weight: 500;
    letter-spacing: 1.4px; text-transform: uppercase;
    width: 100%; min-width: 90px;
    padding: 3px 0;
  }
  /* Rotations subtiles pour le côté "pop", chacun son angle */
  .vside-rot-a { transform: rotate(-2deg); }
  .vside-rot-b { transform: rotate(1.5deg); }
  .vside-rot-c { transform: rotate(-1deg); }
  .vside-rot-d { transform: rotate(2deg); }
  .vside-chip:hover:not(:disabled) { transform: rotate(0deg) scale(1.02); }
  /* Boutons d'action (share / scoreCard / export) — petits, neutres,
     alignés à gauche. Cohérents avec les .btn-ic existants mais en
     plus compact pour la colonne 1/3. */
  .vside-actions {
    display: flex; gap: 6px;
    justify-content: center;
    margin-top: 2px;
  }
  .vside-action-btn {
    width: 30px; height: 30px;
    border-radius: 8px;
    border: 1px solid var(--btn-border, rgba(255,255,255,0.10));
    background: transparent;
    color: var(--soft, rgba(255,255,255,0.78));
    cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center;
    padding: 0;
    transition: background .15s, color .15s, border-color .15s, transform .15s;
  }
  .vside-action-btn:hover {
    background: var(--s1, rgba(255,255,255,0.04));
    color: var(--text, #ededed);
    border-color: var(--btn-border-hover, rgba(255,255,255,0.20));
    transform: translateY(-1px);
  }
  /* Mobile / narrow : on bascule en 1 colonne, on neutralise les
     rotations pour la lisibilité (cohérent avec .pr-chip mobile). */
  @media (max-width: 900px) {
    .verdict-row-grid {
      grid-template-columns: 1fr;
    }
    .vside-chip { transform: none !important; }
    .vside-chip:hover { transform: scale(1.02); }
  }

  /* ── Diagnostic : icône catégorie + count chip color-coded ─────
     Refonte 2026-04-30 ("page plus jeune") : un glyphe SVG premium
     est ajouté à gauche du nom de la catégorie. La moyenne devient
     un mini chip coloré (mint ≥80, amber 60-79, red <60) à droite.
     Le compteur "X éléments" devient une typographie plus douce
     (chiffre en évidence, label en muted). */
  .fiche-v2 .diag-cat-head .diag-cat-icon {
    display: inline-flex;
    align-items: center; justify-content: center;
    width: 22px; height: 22px;
    border-radius: 7px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: currentColor;
    flex-shrink: 0;
    margin-right: 2px;
    transition: transform .25s cubic-bezier(.4,1.5,.5,1),
                background .15s, border-color .15s;
  }
  .fiche-v2 .diag-cat:hover .diag-cat-head .diag-cat-icon {
    transform: rotate(-6deg) scale(1.05);
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.16);
  }
  /* Couleur de l'icône calée sur la couleur de la catégorie (.c-amber, .c-cerulean, etc.) */
  .fiche-v2 .diag-cat.c-amber    .diag-cat-icon { color: var(--amber, #f5a623); border-color: rgba(245,166,35,0.28); }
  .fiche-v2 .diag-cat.c-cerulean .diag-cat-icon { color: #5cb8cc;             border-color: rgba(92,184,204,0.28); }
  .fiche-v2 .diag-cat.c-mint     .diag-cat-icon { color: #8ee07a;             border-color: rgba(142,224,122,0.28); }
  .fiche-v2 .diag-cat.c-red      .diag-cat-icon { color: #ef6b6b;             border-color: rgba(239,107,107,0.28); }
  .fiche-v2 .diag-cat.c-violet   .diag-cat-icon { color: #c2a8ff;             border-color: rgba(166,126,245,0.28); }

  /* Count "X éléments" en typo douce (chiffre solide, label muted) */
  .fiche-v2 .diag-cat-head .count {
    display: inline-flex; align-items: center; gap: 6px;
  }
  .fiche-v2 .diag-cat-head .count .count-num {
    font-family: var(--mono);
    font-size: 11.5px;
    font-weight: 600;
    color: var(--soft, rgba(255,255,255,0.78));
    font-variant-numeric: tabular-nums;
  }
  .fiche-v2 .diag-cat-head .count .count-label {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--muted);
    text-transform: lowercase;
    letter-spacing: 0.4px;
  }
  /* Avg chip : mini score color-coded à droite du count */
  .fiche-v2 .diag-cat-head .avg-chip {
    display: inline-flex; align-items: center;
    margin-left: 6px;
    padding: 2px 8px;
    border-radius: 999px;
    font-family: var(--mono); font-size: 10px; font-weight: 600;
    letter-spacing: 0.6px;
    font-variant-numeric: tabular-nums;
    border: 1px solid;
    transition: transform .2s ease, background .15s;
  }
  .fiche-v2 .diag-cat-head .avg-chip.avg-mint {
    background: rgba(142,224,122,0.10);
    border-color: rgba(142,224,122,0.40);
    color: #8ee07a;
  }
  .fiche-v2 .diag-cat-head .avg-chip.avg-amber {
    background: rgba(245,166,35,0.10);
    border-color: rgba(245,166,35,0.40);
    color: var(--amber, #f5a623);
  }
  .fiche-v2 .diag-cat-head .avg-chip.avg-red {
    background: rgba(239,107,107,0.10);
    border-color: rgba(239,107,107,0.40);
    color: #ef6b6b;
  }
  .fiche-v2 .diag-cat:hover .diag-cat-head .avg-chip {
    transform: scale(1.06);
  }

  /* ── Eyebrow pop : transforme les eyebrows mono uppercase
     existants en mini chips colorés avec rotation subtile.
     Cible toutes les eyebrows (.score-eyebrow, .q-eyebrow,
     .diag-eyebrow, .notes-eyebrow, .intent-panel-eyebrow) sans
     casser leur structure (dot + texte). On ajoute un bg, une
     bordure, padding pill, box-shadow doux et une légère rotation.
     La rotation alterne via :nth-of-type pour casser l'alignement. */
  .fiche-v2 .score-eyebrow,
  .fiche-v2 .q-eyebrow,
  .fiche-v2 .diag-panel .diag-eyebrow,
  .fiche-v2 .notes-panel .notes-eyebrow {
    align-self: flex-start;
    width: auto;
    padding: 5px 12px 5px 10px;
    border-radius: 999px;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.10);
    box-shadow: 0 6px 18px -10px rgba(0,0,0,0.55);
    transition: transform .2s ease, background .15s, border-color .15s;
  }
  /* Pas de rotation sur les eyebrows — ça ressemblait à un bug. On
     garde juste le chip pill coloré pour le pop. */
  .fiche-v2 .diag-panel .diag-eyebrow { align-self: flex-start; }
  .fiche-v2 .notes-panel .notes-eyebrow { align-self: flex-start; }
  /* Au hover de la section parente, légère intensification du fond */
  .fiche-v2 .row-verdict:hover .score-eyebrow,
  .fiche-v2 .row-qualitative:hover .q-eyebrow,
  .fiche-v2 .diag-panel:hover .diag-eyebrow,
  .fiche-v2 .notes-panel:hover .notes-eyebrow {
    background: rgba(255,255,255,0.04);
  }
  /* Tinted bg basé sur la couleur du dot — héritée des règles
     existantes via leur color: var(--xxx). Le dot reste tel quel. */
  .fiche-v2 .score-eyebrow            { color: var(--amber, #f5a623); border-color: rgba(245,166,35,0.30); background: rgba(245,166,35,0.06); }
  .fiche-v2 .q-eyebrow                { color: #c2a8ff;              border-color: rgba(166,126,245,0.30); background: rgba(166,126,245,0.06); }
  .fiche-v2 .q-eyebrow.cerulean       { color: #5cb8cc;              border-color: rgba(92,184,204,0.30); background: rgba(92,184,204,0.06); }
  .fiche-v2 .q-eyebrow.amber          { color: var(--amber, #f5a623); border-color: rgba(245,166,35,0.30); background: rgba(245,166,35,0.06); }
  .fiche-v2 .q-eyebrow.mint           { color: #8ee07a;              border-color: rgba(142,224,122,0.30); background: rgba(142,224,122,0.06); }
  .fiche-v2 .diag-panel .diag-eyebrow { color: #5cb8cc;              border-color: rgba(92,184,204,0.30); background: rgba(92,184,204,0.06); }
  .fiche-v2 .notes-panel .notes-eyebrow { color: var(--amber, #f5a623); border-color: rgba(245,166,35,0.30); background: rgba(245,166,35,0.06); }

  /* (Plus de rotations sur les eyebrows — média query mobile retirée.) */


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
    /* Layout 1 colonne : tout pleine largeur, ordre source = ordre visuel. */
    display: grid;
    grid-template-columns: 1fr;
    row-gap: 18px;
    align-items: start;
    padding: 20px 28px 80px;
  }
  /* f2-col-* deviennent transparents → leurs enfants montent au niveau .page. */
  .fiche-v2 .page > .f2-col-main,
  .fiche-v2 .page > .f2-col-side { display: contents; }
  /* Pochette + score sur la même ligne (parité avec le layout 2 colonnes
     d'avant) : la pochette se superpose à gauche du card .rv-left via
     absolute positioning. row-verdict est position: relative pour ancrer la
     pochette. .rv-left réserve l'espace via padding-left, comme avant. */
  .fiche-v2 .page .row-verdict {
    position: relative;
    z-index: 1;
  }
  /* Quand un tooltip est ouvert (score global ou tuile mix), on booste le
     z-index de toute la row pour que le tooltip puisse déborder au-dessus
     du Plan d'action / Diagnostic qui suit dans la grille ET au-dessus du
     chat (.fiche-chat-side z-index 12). On vise 9999 pour être safe contre
     tout autre stacking context introduit plus tard. */
  .fiche-v2 .page .row-verdict:has(.score-ring.tip-open),
  .fiche-v2 .page .row-verdict:has(.score-ring:hover),
  .fiche-v2 .page .row-verdict:has(.mi-tile.tip-open),
  .fiche-v2 .page .row-verdict:has(.mi-tile:hover) {
    z-index: 9999;
  }
  /* Quand row-verdict monte à z-index 100 pour laisser le tooltip déborder,
     la pochette (z-index: 2 par défaut) passe DERRIÈRE et disparaît visuellement.
     On la remonte au-dessus de row-verdict pour qu'elle reste visible. */
  .fiche-v2 .page:has(.row-verdict .score-ring.tip-open) .col-cover-wrap,
  .fiche-v2 .page:has(.row-verdict .score-ring:hover) .col-cover-wrap,
  .fiche-v2 .page:has(.row-verdict .mi-tile.tip-open) .col-cover-wrap,
  .fiche-v2 .page:has(.row-verdict .mi-tile:hover) .col-cover-wrap {
    z-index: 101;
  }
  .fiche-v2 .page .row-verdict .rv-left {
    /* Padding-left reserve la place de la pochette (33.33% + 40px), comme
       dans le layout 2 colonnes d'avant. */
    padding-left: calc(33.33% + 40px);
  }
  /* Pochette ancree a gauche du card .rv-left via absolute positioning.
     33.33% de largeur (parite avec le 2/6 de l'ancien grid), holder
     centre via flex avec max-width 250px et aspect-ratio 1/1. */
  .fiche-v2 .page .row-verdict > .col-cover-wrap {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 33.33%;
    margin: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 48px;
    box-sizing: border-box;
    aspect-ratio: auto;
    max-width: none;
  }
  .fiche-v2 .page .row-verdict > .col-cover-wrap .col-cover-holder {
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
     meme style que les autres eyebrows). On annule le padding-left
     calc(33.33% + 40px) qui reserve la place de la pochette, via un
     margin-left negatif, pour qu'il s'aligne avec la bordure interne gauche
     du card (= 24px, meme que diag-eyebrow). */
  .fiche-v2 .row-verdict .rv-left .score-eyebrow {
    margin-left: calc(-33.33% - 16px);
  }

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
  /* Layout 1 colonne : row-qualitative et notes-section prennent automatiquement toute la largeur. */

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
      /* Refonte 2026-04-30 : padding latéral remonté à 22 px pour
         laisser de l'air entre les cards et le bord viewport (les
         16 px précédents donnaient l'impression que le contenu collait
         les bords sur smartphone). */
      padding: 16px 22px 80px;
    }
    /* display: contents fait remonter les enfants de f2-col-main / side
       directement au niveau du flex parent .page. Ça permet d'ordonner
       pochette → score → diag → plan → qualitative → notes sans tenir
       compte de leur colonne d'origine (main ou side). */
    .fiche-v2 .page > .f2-col-main,
    .fiche-v2 .page > .f2-col-side {
      display: contents;
    }
    /* Ordre d'empilement mobile (refonte 2026-04-30 v3) — ordre voulu
       par David :
         1. chipset version (timeline, hors .page)
         2. mesures (verdict-col-side : BPM/Tonalité/LUFS chips)
         3. verdict de sortie (verdict-col-main)
         4. pochette + chanté (col-cover-wrap)
         5. score global (score-eyebrow + rv-top)
         6. évolution + intention (evo-intent-stack)
         7. diagnostic par élément (col-diag)
         8. impression d écoute (row-qualitative)
         9. notes de version (notes-section, en dernier)
       Pour pouvoir ordonner verdict-col-side / verdict-col-main / score
       eyebrow / rv-top au même niveau que col-cover-wrap, on aplatit
       leurs wrappers (.row-verdict + .rv-left + .verdict-row-grid)
       avec display: contents — leurs enfants deviennent des flex items
       directs de .page et se laissent ré-ordonner. */
    .fiche-v2 .page .row-verdict,
    .fiche-v2 .page .rv-left,
    .fiche-v2 .page .verdict-row-grid {
      display: contents !important;
    }
    /* Halo + petits bandeaux secondaires inutiles en mobile (rv-halo
       est purement décoratif et pose problème quand .rv-left passe en
       display: contents). */
    .fiche-v2 .page .row-verdict .rv-halo {
      display: none;
    }

    /* Ordre v4 (2026-04-30) : pochette remontée tout en haut, juste
       sous le chipset version. */
    .fiche-v2 .page .vocal-suggest         { order: 0; }
    .fiche-v2 .page .col-cover-wrap        { order: 1; }
    .fiche-v2 .page .verdict-col-side      { order: 2; }
    .fiche-v2 .page .verdict-col-main      { order: 3; }
    .fiche-v2 .page .score-eyebrow         { order: 4; }
    .fiche-v2 .page .rv-top                { order: 5; }
    .fiche-v2 .page .score-calibration     { order: 6; }
    .fiche-v2 .page .score-floor-banner    { order: 7; }
    .fiche-v2 .page .verdict-text          { order: 8; }
    .fiche-v2 .page .evo-intent-stack      { order: 9; }
    .fiche-v2 .page .col-diag              { order: 10; }
    .fiche-v2 .page .col-plan,
    .fiche-v2 .page .intent-panel-fiche    { order: 11; }
    .fiche-v2 .page .row-qualitative       { order: 12; }
    .fiche-v2 .page .notes-section         { order: 13; }
    /* Sample fiche (#/exemple) — la sample utilise les mêmes classes
       de base mais a quelques noms différents : verdict via
       <ReleaseReadinessBanner> rendu en .release-readiness sans
       wrapper verdict-col-main, diag-panel sans .col-diag wrapper.
       Le .fiche-genre-line bubble up via display: contents sur
       .rv-left → on lui donne l'ordre 2 (à la place des mesures
       chips qui n'existent pas en sample). */
    .fiche-v2 .page .fiche-genre-line      { order: 2; }
    .fiche-v2 .page .release-readiness     { order: 3; }
    .fiche-v2 .page .diag-panel            { order: 10; }
    /* QualitativeSection et NotesSection sont enveloppés dans des
       <div class="wh-anim"> directement enfants de .page — l'order
       posé sur .row-qualitative / .notes-section ne s'applique donc
       pas. On cible les wrappers via :has() pour les ordonner. */
    .fiche-v2 .page > .wh-anim:has(.row-qualitative) { order: 12; }
    .fiche-v2 .page > .wh-anim:has(.notes-section)   { order: 13; }
    /* Neutralise les grid-column/row du layout desktop (qui faisaient
       déborder les enfants puisqu'on n'est plus en grid). On reset aussi
       align-self : en grid c'est l'axe block, mais en flex column c'est
       l'axe horizontal — laisser align-self start rétrécirait le panel
       à la largeur de son contenu (ex. .col-plan en mobile). */
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
      align-self: stretch;
    }
    /* Pochette : on neutralise le padding-left 48px et le stretch desktop,
       on la centre horizontalement dans .page (qui est flex column).
       Fix 2026-04-30 : il faut aussi neutraliser le position absolute
       hérité du desktop (.row-verdict > .col-cover-wrap) — sans ça la
       pochette sortait de son flow et chevauchait le radar du Score Global.
       Le sélecteur enfant direct ci-dessous est plus spécifique, on
       l override explicitement. */
    .fiche-v2 .page .col-cover-wrap,
    .fiche-v2 .page .row-verdict > .col-cover-wrap {
      position: relative;
      inset: auto;
      width: 100%;
      max-width: 280px;
      padding-left: 0;
      padding-right: 0;
      margin: 0 auto;
      align-self: center;
      justify-self: center;
      justify-content: center;
      z-index: auto;
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
    font-size: 46px;
    letter-spacing: -1.5px;
    line-height: 1;
  }
  .fiche-v2 .row-verdict .rv-left .score-ring .big-suffix {
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 9px;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    margin-top: 7px;
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

  /* Ticket 4.1 — bandeau plafond de score : ton ambré, ligne fine sous le delta.
     Scope aux deux fiches (privée v2 + publique) sans dupliquer la règle. */
  .row-verdict .rv-left .score-floor-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    margin: 6px auto 2px;
    padding: 6px 12px;
    border: 1px solid rgba(245, 166, 35, 0.28);
    background: rgba(245, 166, 35, 0.08);
    border-radius: 999px;
    max-width: 480px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    line-height: 1.4;
    color: var(--amber, #f5a623);
  }
  .row-verdict .rv-left .score-floor-banner .sf-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--amber, #f5a623);
    flex-shrink: 0;
  }
  .row-verdict .rv-left .score-floor-banner .sf-text {
    color: var(--text, #ededed);
    font-weight: 400;
  }
  .row-verdict .rv-left .score-floor-banner .sf-original {
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 10.5px;
    letter-spacing: 0.6px;
    color: var(--muted, rgba(255,255,255,0.55));
  }

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
    flex: 1 1 auto;
    min-width: 0;
    line-height: 1.15;
  }
  .fiche-v2 .diag-panel .diag-cat-head .count {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.5px;
    color: var(--muted, rgba(255,255,255,0.5));
    text-transform: uppercase;
    flex-shrink: 0;
  }
  /* Fix mobile 2026-04-30 : sur 390 px les noms longs (INSTRUMENTS,
     DRUMS & PERCUSSIONS) poussaient le chip de score en-dehors de
     la card. On resserre padding + gap, on autorise le wrap du nom,
     et on garde le count compact à droite. */
  @media (max-width: 480px) {
    .fiche-v2 .diag-panel .diag-cat-head {
      padding: 12px 12px;
      gap: 8px;
    }
    .fiche-v2 .diag-panel .diag-cat-head .name {
      font-size: 9px;
      letter-spacing: 1px;
      white-space: normal;
      word-break: break-word;
    }
    .fiche-v2 .diag-panel .diag-cat-head .count {
      font-size: 9.5px;
      gap: 6px;
    }
    .fiche-v2 .diag-panel .diag-cat-head .count .count-label {
      display: none;
    }
    .fiche-v2 .diag-panel .diag-cat-head .avg-chip {
      padding: 3px 8px;
      font-size: 12px;
      min-width: 28px;
    }
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
    width: 120px; height: 120px; position: relative; flex-shrink: 0;
  }
  .score-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  .score-ring .center {
    position: absolute; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
  }
  .score-ring .big {
    font-family: var(--serif); font-size: 48px; line-height: 1; color: var(--text);
    display: inline-flex; align-items: flex-start; gap: 2px;
  }
  .score-ring .big-suffix {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    letter-spacing: 0.5px; font-weight: 400; margin-top: 5px;
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
  /* .ring-tooltip était l'ancien tooltip enfant de .score-ring. Remplacé
     par .score-tooltip (rendu via React Portal dans <body>) qui escape
     les stacking contexts parents (le chat .fiche-chat-side écrasait
     l'ancien). Styles legacy conservés au cas où un autre callsite l'utilise. */
  .score-ring .ring-tooltip {
    display: none; /* plus utilisé, désactivé */
  }
  /* Nouveau tooltip score via Portal — position fixed, distinct visuellement
     pour bien se détacher du fond de la fiche (gradient + bordure ambre +
     glow plus marqué). */
  .score-tooltip {
    width: 300px;
    max-width: min(300px, calc(100vw - 40px));
    /* Fond TOTALEMENT opaque pour ne pas laisser deviner le contenu
       sous-jacent sur petits écrans. */
    background:
      linear-gradient(180deg,
        rgb(34, 30, 22) 0%,
        rgb(22, 22, 28) 60%,
        rgb(18, 18, 22) 100%);
    border: 1px solid rgba(245, 166, 35, 0.30);
    border-left: 3px solid var(--st-accent, var(--amber));
    border-radius: 10px;
    padding: 14px 16px;
    box-shadow:
      0 18px 48px rgba(0, 0, 0, 0.55),
      0 0 32px rgba(245, 166, 35, 0.06);
    color: var(--text, #ededed);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    line-height: 1.5;
  }
  .score-tooltip .rt-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }
  .score-tooltip .rt-head .rt-dot {
    width: 8px; height: 8px; border-radius: 50%;
  }
  .score-tooltip .rt-head strong { font-weight: 500; }
  .score-tooltip .rt-head .rt-val {
    margin-left: auto;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--soft, rgba(255,255,255,0.78));
  }
  .score-tooltip .rt-bands {
    display: flex; flex-direction: column; gap: 4px;
    margin-bottom: 10px;
  }
  .score-tooltip .rt-band {
    display: flex; align-items: center; gap: 8px;
    font-size: 12px;
    color: var(--muted);
    opacity: 0.6;
  }
  .score-tooltip .rt-band.active { opacity: 1; color: var(--text); }
  .score-tooltip .rt-band .dot {
    width: 6px; height: 6px; border-radius: 50%;
  }
  .score-tooltip .rt-calib {
    margin-bottom: 8px;
    padding: 6px 8px;
    background: rgba(245, 166, 35, 0.06);
    border-radius: 6px;
    font-size: 12px;
    color: var(--soft);
  }
  .score-tooltip .rt-note {
    font-size: 11px;
    color: var(--muted);
    line-height: 1.45;
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

  /* ── ROW 3 : Diagnostic (gauche) + Notes ou plein écran ── */
  .row-two {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 32px;
    margin-bottom: 64px;
  }
  /* Quand seul .col-diag est présent (plus de col-plan), il reprend toute la
     largeur de la rangée. */
  .row-two:not(:has(.col-plan)) {
    grid-template-columns: minmax(0, 1fr);
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

  /* ── CTA "Parlons-en dans le chat" — pill posée sous le diagnostic
     pour inviter à creuser les recommandations dans le chat. Pleine
     largeur de la colonne contenu, glow amber subtil + lift hover. */
  .diag-chat-cta {
    display: flex; align-items: center; justify-content: center;
    gap: 12px;
    width: 100%;
    margin: 22px 0 8px;
    padding: 18px 24px;
    border-radius: 14px;
    background: rgba(245,166,35,0.06);
    border: 1px solid rgba(245,166,35,0.30);
    color: var(--amber);
    cursor: pointer;
    font-family: var(--body);
    font-size: 15px; font-weight: 500;
    letter-spacing: -0.1px;
    box-shadow: 0 16px 40px -22px rgba(245,166,35,0.45);
    transition: background .2s, border-color .2s, box-shadow .2s, transform .15s;
  }
  .diag-chat-cta:hover {
    background: rgba(245,166,35,0.12);
    border-color: rgba(245,166,35,0.55);
    box-shadow: 0 22px 48px -18px rgba(245,166,35,0.55);
    transform: translateY(-1px);
  }
  .diag-chat-cta-icon {
    display: inline-flex; align-items: center; justify-content: center;
    width: 36px; height: 36px;
    border-radius: 50%;
    background: rgba(245,166,35,0.14);
    color: var(--amber);
    flex-shrink: 0;
  }
  .diag-chat-cta:hover .diag-chat-cta-icon {
    background: var(--amber);
    color: var(--black, #0a0a0c);
  }
  .diag-chat-cta-label {
    flex: 1;
    text-align: left;
  }
  .diag-chat-cta-arrow {
    display: inline-flex; align-items: center; justify-content: center;
    width: 28px; height: 28px;
    border-radius: 50%;
    background: rgba(255,255,255,0.05);
    color: var(--muted);
    flex-shrink: 0;
    transition: background .2s, color .2s, transform .2s;
  }
  .diag-chat-cta:hover .diag-chat-cta-arrow {
    background: var(--amber);
    color: var(--black, #0a0a0c);
    transform: translateX(3px);
  }

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
  /* Ticket 1.1 — nouveau schema notes : priority / how / plugin_pick */
  .diag-item .di-name {
    display: flex; align-items: center; gap: 8px;
  }
  .diag-item .di-prio {
    width: 8px; height: 8px; border-radius: 50%;
    flex-shrink: 0;
    background: var(--muted, #7c7c80);
  }
  .diag-item .di-prio.prio-high { background: #ef6b6b; box-shadow: 0 0 0 3px rgba(239,107,107,0.18); }
  .diag-item .di-prio.prio-med  { background: #f5b056; box-shadow: 0 0 0 3px rgba(245,176,86,0.16); }
  .diag-item .di-prio.prio-low  { background: #7bd88f; box-shadow: 0 0 0 3px rgba(123,216,143,0.14); }
  /* Ticket 4.2 — cadenas pour les items dont le score est verrouillé suite
     à un advice coché en V_(n-1) mais encore présent en V_n. */
  .diag-item .di-advice-lock {
    display: inline-flex; align-items: center; justify-content: center;
    width: 18px; height: 18px;
    margin-left: 4px;
    color: var(--amber, #f5b056);
    border-radius: 4px;
    background: rgba(245, 176, 86, 0.12);
    flex-shrink: 0;
    cursor: help;
  }
  .diag-item.advice-locked .di-name {
    color: var(--text, #ededed);
  }
  .diag-item .di-how {
    display: flex; align-items: flex-start; gap: 8px;
    margin: 6px 0 10px;
    padding: 8px 10px;
    background: rgba(255, 255, 255, 0.03);
    border-left: 2px solid var(--amber, #f5b056);
    border-radius: 3px;
  }
  .diag-item .di-how .di-how-label {
    font-family: var(--mono); font-size: 10px; letter-spacing: 1.4px;
    color: var(--amber, #f5b056); text-transform: uppercase;
    flex-shrink: 0; padding-top: 2px;
  }
  .diag-item .di-how code {
    font-family: var(--mono); font-size: 12.5px; line-height: 1.55;
    color: var(--soft); background: transparent; padding: 0;
    word-break: break-word;
  }
  .diag-item .di-tools .di-plugin {
    font-family: var(--mono); font-size: 12px;
    color: var(--amber, #f5b056);
    padding: 3px 8px;
    border: 1px solid rgba(245, 176, 86, 0.4);
    border-radius: 4px;
    background: rgba(245, 176, 86, 0.08);
  }
  /* Ticket 2.1 — checklist cochable + compteur de progression */
  .diag-item .di-check {
    width: 22px; height: 22px;
    flex-shrink: 0;
    margin-top: 5px;
    border: 1.5px solid var(--border);
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #0c0c0d;
    transition: border-color .15s ease, background .15s ease, transform .1s ease;
    padding: 0;
  }
  .diag-item .di-check:hover:not(:disabled) {
    border-color: var(--amber, #f5b056);
    background: rgba(245, 176, 86, 0.08);
  }
  .diag-item .di-check:focus-visible {
    outline: 2px solid var(--amber, #f5b056);
    outline-offset: 2px;
  }
  .diag-item .di-check:disabled {
    opacity: .35;
    cursor: not-allowed;
  }
  .diag-item .di-check.checked {
    background: var(--amber, #f5b056);
    border-color: var(--amber, #f5b056);
  }
  .diag-item .di-check.checked:hover:not(:disabled) {
    background: var(--amber, #f5b056);
  }
  .diag-item .di-check.checked:active {
    transform: scale(.94);
  }
  /* Item coché : titre/why barrés et grisés pour signaler "fait". */
  .diag-item.is-done .di-name,
  .diag-item.is-done .di-detail {
    text-decoration: line-through;
    text-decoration-color: rgba(255,255,255,0.3);
    color: var(--muted, #7c7c80);
  }
  .diag-item.is-done .di-how,
  .diag-item.is-done .di-tools {
    opacity: 0.5;
  }
  .diag-item.is-done .sring {
    opacity: 0.55;
  }

  /* Compteur global "X/N complétés (Y%)" dans le diag-eyebrow */
  .diag-progress {
    display: inline-flex; align-items: center; gap: 10px;
    margin-left: auto;
    padding-left: 14px;
  }
  .diag-progress-bar {
    width: 90px; height: 4px;
    background: rgba(255,255,255,0.08);
    border-radius: 2px;
    overflow: hidden;
    display: inline-block;
  }
  .diag-progress-bar-fill {
    display: block; height: 100%;
    background: var(--amber, #f5b056);
    border-radius: 2px;
    transition: width .2s ease;
  }
  .diag-progress-label {
    font-family: var(--mono); font-size: 11px;
    color: var(--muted, #7c7c80);
    letter-spacing: 0.5px;
    white-space: nowrap;
  }
  /* diag-eyebrow doit pouvoir étirer le compteur à droite */
  .fiche-v2 .diag-panel .diag-eyebrow,
  .diag-eyebrow {
    flex-wrap: wrap;
  }

  @media (max-width: 720px) {
    .diag-progress { width: 100%; margin-left: 0; padding-left: 0; }
    .diag-progress-bar { flex: 1; width: auto; }
    .diag-item .di-check { width: 20px; height: 20px; margin-top: 4px; }
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
  /* Variante single-line — refonte 2026-04-30 : seul le titre est rendu,
     plus besoin de réserver la place du sous-titre version. On baisse
     le min-width pour laisser plus de largeur à la waveform. */
  .player .pl-meta.pl-meta-single {
    min-width: 0;
    flex: 0 1 auto;
    max-width: 180px;
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
    flex-shrink: 0; min-width: 38px; text-align: right;
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
    /* Ombre désactivée au repos : sinon elle dépasse de ~60 px à gauche
       du panel et entre dans le viewport — le panel est hors écran via
       translateX 100%, mais le shadow -20 0 40 reste visible et crée la
       bande sombre fantôme sur le bord droit de la fiche. On applique
       l'ombre uniquement quand le chat est réellement ouvert. */
    box-shadow: 0 0 0 rgba(0,0,0,0);
    /* Translation un peu plus large que 100% pour empêcher tout résidu
       de paint / composite layer de déborder dans le viewport. */
    transform: translateX(calc(100% + 80px));
    transition:
      transform .28s cubic-bezier(.4, .0, .2, 1),
      box-shadow .2s ease;
  }
  body.chat-open .chat-panel {
    transform: translateX(0);
    box-shadow: -20px 0 40px rgba(0,0,0,0.45);
  }
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
    /* Préserve les sauts de ligne du contenu (utile pour le seed
       mastering qui structure ses sections avec \n). Les réponses IA
       n'utilisent pas le markdown (system prompt côté backend), donc
       ce comportement est inoffensif sur du texte sans sauts. */
    white-space: pre-wrap;
    word-break: break-word;
  }
  /* Seed = premier message AI pré-rempli (charte mastering p. ex.).
     Légèrement plus large pour respirer le contenu structuré. */
  .msg.msg-seed {
    max-width: 94%;
  }
  .msg strong {
    color: var(--text);
    font-weight: 600;
  }
  /* Label "Préparation de la charte mastering…" affiché à côté du
     typing indicator pendant que /api/mastering-charter génère le seed
     personnalisé. Reste lisible mais discret pour ne pas compétir avec
     les 3 dots qui annoncent l'attente. */
  .chat-seeding-label {
    display: block;
    margin-bottom: 6px;
    font-size: 12px;
    line-height: 1.4;
    color: var(--muted, rgba(255,255,255,0.6));
    font-weight: 400;
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
    /* z-index bas pour que les tooltips portalés (.score-tooltip z 9999)
       passent par-dessus sans aucun stacking context concurrent. */
    z-index: 1;
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
    /* Pas de z-index ici → évite de créer un stacking context qui
       écraserait les tooltips portalés (score-tooltip z 9999). */
    z-index: auto;
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

  /* ── Chat pill (refonte 2026-04-30 — wrapper anchor) ───────────
     Approche plus fiable que calc() : un wrapper fixed occupe
     l'espace libre à droite (entre fin du contenu 920px et bord
     droit), centré verticalement, avec la pill centrée DEDANS via
     flex justify-content: center align-items: center. Quand la
     largeur de la pill change (animation peek), elle grandit des
     2 côtés simultanément parce que le flex la garde centrée. */
  .chat-pill-wrap {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    /* Largeur = moitié de l'espace "extra" autour du wrap centré
       920px de la fiche. Si viewport > 920, c'est (V-920)/2.
       Sinon 0 (mais alors @media bottom-centered prend le relais). */
    width: max(0px, calc((100vw - 920px) / 2));
    pointer-events: none;
    display: flex; align-items: center; justify-content: center;
    /* Léger padding-right pour compenser le décalage perçu (la pill
       paraît trop à droite sans, trop à gauche avec 80). 40 = sweet
       spot : pill décalée de 20 px à gauche du centre mathématique. */
    padding-right: 40px;
    z-index: 100;
  }
  .chat-pill {
    position: relative;
    pointer-events: auto;
    width: 56px;
    /* justify-content flex-start (default) — sinon le groupe icon+
       placeholder+cta dépasse 56px et se centre en débordant des 2
       côtés, faisant disparaître l'icône clippée à gauche. Avec
       flex-start + padding 12, l'icône (32px) est positionnée de
       12 à 44 → center 28 = center du pill 56 ✓. */
    display: inline-flex; align-items: center;
    gap: 10px;
    padding: 12px;
    background: rgba(20, 20, 22, 0.78);
    border: 1px solid rgba(245, 166, 35, 0.32);
    border-radius: 999px;
    color: var(--soft);
    cursor: pointer;
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    box-shadow: 0 12px 40px -12px rgba(0,0,0,0.55), 0 0 0 0 rgba(245, 166, 35, 0);
    overflow: hidden;
    white-space: nowrap;
    /* Refonte 2026-04-30 : retiré l animation peek (qui ouvrait
       automatiquement la pill toutes les 60s pendant 10s) — David
       préfère que la pill reste fermée tant qu on ne la survole pas
       / clique pas. La pill ne s anime plus que sur hover/focus. */
    transition:
      width 0.5s cubic-bezier(.34, 1.45, .64, 1),
      border-color .2s, box-shadow .2s, background .2s;
  }
  .chat-pill:hover {
    width: 280px;
    border-color: rgba(245, 166, 35, 0.55);
    box-shadow: 0 16px 48px -12px rgba(0,0,0,0.65), 0 0 32px -8px rgba(245, 166, 35, 0.32);
    background: rgba(28, 24, 20, 0.85);
  }
  .chat-pill:focus-visible {
    outline: 2px solid var(--amber);
    outline-offset: 2px;
  }
  .chat-pill-icon {
    display: inline-flex; align-items: center; justify-content: center;
    width: 32px; height: 32px;
    border-radius: 999px;
    background: rgba(245, 166, 35, 0.14);
    color: var(--amber);
    flex-shrink: 0;
  }
  .chat-pill-placeholder {
    flex: 1;
    font-family: var(--body); font-size: 14px; font-weight: 400;
    color: var(--muted);
    text-align: left;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .chat-pill-cta {
    display: inline-flex; align-items: center; justify-content: center;
    width: 28px; height: 28px;
    border-radius: 999px;
    background: rgba(255,255,255,0.05);
    color: var(--muted);
    flex-shrink: 0;
    transition: background .2s, color .2s;
  }
  .chat-pill:hover .chat-pill-cta {
    background: var(--amber);
    color: var(--black);
  }
  /* Quand le chat panel est ouvert, on cache la pill (légère
     translation + fade out). Pas besoin de translateX/translateY
     compliqué — la pill est centrée par flex dans son wrapper. */
  body.chat-open .chat-pill {
    opacity: 0;
    transform: translateY(8px);
    pointer-events: none;
    animation: none;
  }
  /* Sous 1240px : pas d'espace libre à droite — on rebascule le
     wrapper en bottom-strip pleine largeur. La pill reste centrée
     à l'intérieur via flex. */
  @media (max-width: 1240px) {
    .chat-pill-wrap {
      top: auto;
      bottom: 94px;
      right: 0;
      width: 100vw;
      height: auto;
    }
  }
  @media (max-width: 480px) {
    /* Fix mobile 2026-04-30 : la chat-pill remonte juste au-dessus du
       player et se cale à DROITE, en miroir de l add-pill (gauche).
       Le wrap était centré (justify-content: center) → on passe à
       flex-end pour ancrer la pill côté droit. */
    .chat-pill-wrap {
      bottom: 72px;
      justify-content: flex-end;
      padding-right: 16px;
    }
    .chat-pill {
      gap: 8px;
      padding: 8px;
      width: 48px;
    }
    /* Expand vers la GAUCHE depuis le bord droit. Avec
       justify-content: flex-end, la pill garde son ancrage right:16
       et grandit vers le centre. Cap 240 px → finit à x≈134, l
       add-pill (16-154) reste hors de portée. */
    .chat-pill:hover { width: 240px; }
    .chat-pill-icon { width: 28px; height: 28px; }
    .chat-pill-placeholder { font-size: 13px; }
  }
  /* prefers-reduced-motion : keyframe peek désormais retiré, plus
     besoin de l override pour neutraliser l animation. La règle
     reste pour neutraliser le bounce du transform au hover. */
  @media (prefers-reduced-motion: reduce) {
    .chat-pill:hover {
      transform: none;
    }
  }

  /* Ancien FAB rond + rail vertical B — masqués (remplacés par
     .chat-pill mix A+B ci-dessous, positionnée centre-vertical à
     droite, pas collée au bord). */
  .chat-fab { display: none; }
  .chat-rail { display: none; }

  /* ── Pill "Ajouter" (refonte 2026-04-30bis) ─────────────────────
     Miroir gauche du .chat-pill : même grammaire visuelle (rond 56px
     en collapsed, expand à 280px au hover, glassmorphism amber-tinted)
     mais positionnée à GAUCHE et SANS animation auto. La pill ne
     bouge que sur hover/focus ; pas de cycle peek qui s'ouvre tout
     seul (David : "il ne s'anime pas tout seul si on ne le survole
     pas"). Click ouvre la modale d'ajout (projet / titre / version). */
  .add-pill-wrap {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    /* Largeur = moitié de l'espace libre à gauche du contenu centré.
       --app-content-w est piloté par App.jsx via une classe sur body :
       fiche → 920px, dashboard → 1080px. Sans ça, la pill paraissait
       trop à droite sur le dashboard (qui a un contenu plus large
       donc moins d'espace libre à gauche). */
    width: max(0px, calc((100vw - var(--app-content-w, 920px)) / 2));
    pointer-events: none;
    display: flex; align-items: center; justify-content: center;
    /* Padding-left décale la pill vers la DROITE (vers le contenu).
       60 = sweet spot trouvé en alternant fiche/dashboard : sur la
       fiche elle reste lisiblement vers le contenu, sur le dashboard
       elle ne déborde plus à droite. */
    padding-left: 60px;
    z-index: 100;
  }
  .add-pill {
    position: relative;
    pointer-events: auto;
    /* Compact = icône + label "Ajouter" tight, sans espace mort à
       droite (la flèche cta est repliée à width:0 en compact). Hover
       expand révèle le placeholder + déplie la flèche cta. */
    width: 142px;
    /* flex-shrink: 0 IMPORTANT — la pill est dans un wrap flex parfois
       plus étroit qu'elle (dashboard avec contenu 1080 sur viewport
       moyen), si on laisse le shrink par défaut elle se contracte au
       lieu de s'ouvrir à 320px. La pill peut déborder visuellement du
       wrap, c'est OK (cf. chat-pill qui fait pareil à droite). */
    flex-shrink: 0;
    display: inline-flex; align-items: center;
    gap: 10px;
    /* Padding asymétrique : 12 à gauche, 16 à droite pour que la
       flèche cta ne colle pas la bordure quand elle apparaît au hover. */
    padding: 12px 16px 12px 12px;
    background: rgba(20, 20, 22, 0.78);
    border: 1px solid rgba(245, 166, 35, 0.32);
    border-radius: 999px;
    color: var(--soft);
    cursor: pointer;
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    box-shadow: 0 12px 40px -12px rgba(0,0,0,0.55), 0 0 0 0 rgba(245, 166, 35, 0);
    overflow: hidden;
    white-space: nowrap;
    /* PAS d'animation auto — on n'a que la transition width au hover.
       Easing standard non-bouncy (Material .4,0,.2,1) : pas d'overshoot
       à la fermeture qui faisait paraître la flèche flasher trop vite
       à gauche. Bouncy seulement à l'OUVERTURE via la règle :hover. */
    transition:
      width .35s cubic-bezier(.4, 0, .2, 1),
      border-color .2s, box-shadow .2s, background .2s;
  }
  .add-pill:hover, .add-pill:focus-visible {
    /* 290 = tout juste de quoi afficher "+ Ajouter Projet, titre, version"
       sans ellipsis. Calé tight pour ne pas déborder inutilement. */
    width: 290px;
    border-color: rgba(245, 166, 35, 0.55);
    box-shadow: 0 16px 48px -12px rgba(0,0,0,0.65), 0 0 32px -8px rgba(245, 166, 35, 0.32);
    background: rgba(28, 24, 20, 0.85);
    outline: none;
    /* À l'ouverture : bouncy easing pour que la pill "pop" en place.
       Ce transition prime sur celui de la base (vers la transition de
       l'état entré, ici hover). À la fermeture, c'est la base qui
       s'applique → pas de bounce. */
    transition:
      width .5s cubic-bezier(.34, 1.45, .64, 1),
      border-color .2s, box-shadow .2s, background .2s;
  }
  .add-pill-icon {
    display: inline-flex; align-items: center; justify-content: center;
    width: 32px; height: 32px;
    border-radius: 999px;
    background: rgba(245, 166, 35, 0.14);
    color: var(--amber);
    flex-shrink: 0;
    transition: background .2s, color .2s;
  }
  .add-pill:hover .add-pill-icon, .add-pill:focus-visible .add-pill-icon {
    background: var(--amber);
    color: var(--black);
  }
  /* Label "Ajouter" — visible en mode compact, ne se masque jamais.
     Couleur amber pour le rendre identifiable comme action principale.
     Évolue de amber soft à amber plein au hover. */
  .add-pill-label {
    flex-shrink: 0;
    font-family: var(--body); font-size: 14px; font-weight: 500;
    color: var(--amber);
    letter-spacing: -0.1px;
    transition: color .2s;
  }
  .add-pill:hover .add-pill-label,
  .add-pill:focus-visible .add-pill-label {
    color: #ffd07a;
  }
  /* Placeholder = sous-titre détaillé, repliée en compact (largeur 0 +
     margin négative pour absorber le gap), se déploie au hover en flex:1
     pour occuper l'espace libéré par l'expansion de la pill. Ce repli
     évite l'espace mort à droite de "Ajouter" en compact. */
  .add-pill-placeholder {
    flex: 0 0 0;
    width: 0;
    margin-left: -10px;
    font-family: var(--body); font-size: 13px; font-weight: 300;
    color: var(--muted);
    text-align: left;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    opacity: 0;
    /* Pareil que .add-pill-cta : flex-basis / width / margin-left
       changent instantanément, le clip de la pill s'occupe du visuel.
       Seule l'opacité fait une transition smooth pour le fade. */
    transition: opacity .35s cubic-bezier(.4, 0, .2, 1);
  }
  .add-pill:hover .add-pill-placeholder,
  .add-pill:focus-visible .add-pill-placeholder {
    flex: 1;
    width: auto;
    margin-left: 0;
    opacity: 1;
    /* Pareil que .add-pill-cta : bounce à l'ouverture seulement. */
    transition:
      flex-basis .45s cubic-bezier(.34, 1.45, .64, 1),
      width .45s cubic-bezier(.34, 1.45, .64, 1),
      margin-left .45s cubic-bezier(.34, 1.45, .64, 1),
      opacity .35s cubic-bezier(.4, 0, .2, 1);
  }
  .add-pill-cta {
    display: inline-flex; align-items: center; justify-content: center;
    /* En compact : width 0 + margin négatif pour absorber le gap qui la
       précédait. La flèche est complètement repliée → pas d'espace
       mort à droite du label "Ajouter". Au hover, elle se déplie à
       width 28 et regagne son gap.
       width / margin-left : changement INSTANTANÉ (pas de transition) —
       la pill qui s'élargit/rétrécit avec overflow:hidden gère le clip
       visuel. Animer width+margin+opacity en parallèle créait un
       effet "la flèche file à gauche" en fermeture, distinct du reste. */
    width: 0; height: 28px;
    margin-left: -10px;
    border-radius: 999px;
    background: rgba(255,255,255,0.05);
    color: var(--muted);
    flex-shrink: 0;
    opacity: 0;
    transition:
      opacity .35s cubic-bezier(.4, 0, .2, 1),
      background .2s, color .2s;
  }
  .add-pill:hover .add-pill-cta, .add-pill:focus-visible .add-pill-cta {
    width: 28px;
    margin-left: 0;
    background: var(--amber);
    color: var(--black);
    opacity: 1;
    /* À l'OUVERTURE seulement : bounce subtle sur width/margin pour
       que la flèche "pop" en place avec le reste de la pill. À la
       fermeture, c'est la base qui s'applique → width/margin
       instantanés, pas de bounce parasite. */
    transition:
      width .45s cubic-bezier(.34, 1.45, .64, 1),
      margin-left .45s cubic-bezier(.34, 1.45, .64, 1),
      opacity .35s cubic-bezier(.4, 0, .2, 1),
      background .2s, color .2s;
  }
  /* Quand la modale d'ajout est ouverte, on cache la pill (parité
     visuelle avec body.chat-open .chat-pill). */
  body.add-modal-open .add-pill {
    opacity: 0;
    transform: translateY(8px);
    pointer-events: none;
  }
  /* Largeur de contenu adaptée par écran — pilote la position de la
     pill via .add-pill-wrap. Fiche fait 920px, dashboard fait 1080px
     (cf. App.jsx maxWidth des 2 layouts). Sans ça, la pill paraît
     trop à droite sur le dashboard (ou trop à gauche sur la fiche
     si on calait la formule sur 1080). */
  body.app-layout-fiche { --app-content-w: 920px; }
  body.app-layout-dashboard { --app-content-w: 1080px; }
  /* Sous 1240px : pas d'espace libre à gauche → on rebascule en
     bottom-strip pleine largeur (mais à gauche du chat pill qui est
     aussi en bottom-strip via son @media). */
  @media (max-width: 1240px) {
    .add-pill-wrap {
      top: auto;
      bottom: 24px;
      left: 16px;
      width: auto;
      height: auto;
      padding-left: 0;
      justify-content: flex-start;
    }
  }
  @media (max-width: 480px) {
    /* Fix mobile 2026-04-30 : alignée avec la chat-pill (bottom 72)
       pour qu elles partagent la même ligne au-dessus du player.
       Largeur resserrée (138 → 100) pour coller au contenu visible
       en compact (icône 28 + gap 8 + label "Ajouter" ~52 + padding
       8+8 = ~104). Plus d espace mort à droite après le mot. */
    .add-pill-wrap {
      bottom: 72px;
    }
    .add-pill {
      gap: 8px;
      padding: 8px 12px 8px 8px;
      width: 100px;
    }
    /* Expand cap réduit pour ne pas chevaucher la chat-pill (centrée
       horizontalement dans son wrap full width). 16 + 240 = 256 < 320
       qui serait trop proche de la chat-pill collapsed à center 195. */
    .add-pill:hover, .add-pill:focus-visible { width: 240px; }
    .add-pill-icon { width: 28px; height: 28px; }
    .add-pill-label { font-size: 13px; }
    .add-pill-placeholder { font-size: 12.5px; }
  }

  /* ── Chat rail (variante B 2026-04-30) ─────────────────────────
     Strip fin collé au bord droit du viewport, vertical. Icône
     chat ambre + label "Demander" en texte vertical (writing-mode).
     Click n'importe où sur le rail → ouvre le panel chat slide-in. */
  .chat-rail {
    position: fixed;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 52px;
    padding: 22px 0;
    background: rgba(20, 20, 22, 0.78);
    border: 1px solid rgba(245, 166, 35, 0.32);
    border-right: none;
    border-radius: 16px 0 0 16px;
    display: flex; flex-direction: column; align-items: center;
    gap: 16px;
    cursor: pointer;
    color: var(--muted);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    box-shadow: -8px 0 24px -10px rgba(0,0,0,0.5);
    z-index: 100;
    transition: width .2s, padding .2s, border-color .2s, background .2s, box-shadow .2s, color .2s;
  }
  .chat-rail:hover {
    width: 60px;
    border-color: rgba(245, 166, 35, 0.55);
    background: rgba(28, 24, 20, 0.85);
    box-shadow: -10px 0 32px -10px rgba(0,0,0,0.55), 0 0 24px -8px rgba(245, 166, 35, 0.32);
    color: var(--text);
  }
  .chat-rail:focus-visible {
    outline: 2px solid var(--amber);
    outline-offset: 2px;
  }
  .chat-rail-icon {
    display: inline-flex; align-items: center; justify-content: center;
    width: 32px; height: 32px;
    border-radius: 999px;
    background: rgba(245, 166, 35, 0.14);
    color: var(--amber);
    flex-shrink: 0;
    transition: background .2s, transform .2s;
  }
  .chat-rail:hover .chat-rail-icon {
    background: rgba(245, 166, 35, 0.22);
    transform: scale(1.05);
  }
  /* Label vertical : writing-mode rotate le texte de bas en haut.
     Mono uppercase pour rester dans le langage chips/topbar. */
  .chat-rail-label {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-family: var(--mono);
    font-size: 11px; font-weight: 500;
    letter-spacing: 2.4px;
    text-transform: uppercase;
    color: inherit;
    user-select: none;
    transition: color .2s;
  }
  /* Quand le panel chat est ouvert, on cache le rail (le panel a son
     propre header avec close, le rail ferait doublon). */
  body.chat-open .chat-rail {
    opacity: 0;
    transform: translateY(-50%) translateX(8px);
    pointer-events: none;
  }
  /* Mobile : rail collé en bas (pas un strip à droite — pas adapté
     aux écrans étroits avec keyboard ouvert), redevient quasi un
     petit FAB pour ne pas rogner sur le contenu. */
  @media (max-width: 720px) {
    .chat-rail {
      top: auto;
      bottom: 92px;
      right: 16px;
      width: auto; height: auto;
      padding: 10px 14px;
      transform: none;
      border-right: 1px solid rgba(245, 166, 35, 0.32);
      border-radius: 999px;
      flex-direction: row;
      gap: 8px;
    }
    .chat-rail:hover {
      width: auto;
      transform: translateY(-2px);
    }
    .chat-rail-label {
      writing-mode: horizontal-tb;
      transform: none;
      font-size: 10.5px;
    }
    body.chat-open .chat-rail {
      transform: translateY(8px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .chat-rail { transition: none; }
    .chat-rail:hover { width: 52px; transform: translateY(-50%); }
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
    background: transparent; border: 1px solid var(--btn-border);
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
  /* Bouton "Tableau de bord" — placé au-dessus de "Mes projets", offre un
     retour direct au dashboard depuis n'importe quelle fiche. Grammaire
     alignée sur un en-tête de projet (padding/radius identiques) avec
     accent discret (icône amber au hover) pour bien le faire ressortir
     comme bouton de navigation principal. */
  .sidebar-dashboard-btn {
    display: flex; align-items: center; gap: 10px;
    width: calc(100% - 4px);
    margin: 0 2px 8px;
    padding: 8px 10px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 10px;
    color: #e8e8ea;
    font-family: var(--body);
    font-size: 14px; font-weight: 500;
    text-align: left;
    cursor: pointer;
    transition: background .15s, color .15s, border-color .15s;
  }
  .sidebar-dashboard-btn svg {
    color: var(--amber);
    flex-shrink: 0;
    opacity: 0.85;
    transition: opacity .15s;
  }
  .sidebar-dashboard-btn:hover {
    background: rgba(245,176,86,.08);
    border-color: rgba(245,176,86,.25);
  }
  .sidebar-dashboard-btn:hover svg { opacity: 1; }

  /* Lien "À propos" — pied de sidebar, discret, mono uppercase muted. */
  .sidebar-about-btn {
    align-self: center;
    margin: 16px 0 14px;
    padding: 6px 10px;
    background: transparent;
    border: none;
    color: var(--muted);
    font-family: var(--mono);
    font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
    font-weight: 500;
    cursor: pointer;
    transition: color .15s;
  }
  .sidebar-about-btn:hover { color: var(--amber); }
  .wh-desktop .wh-header { margin-bottom: 4px; align-items: flex-start; }
  .wh-desktop .wh-greeting { font-size: 28px; letter-spacing: 2.5px; text-align: left; }
  .wh-desktop .wh-actions { justify-content: flex-start; flex-wrap: wrap; }
  .wh-desktop .wh-tracklist { max-width: none; margin: 0; }
  /* Titre "Mes projets" en desktop — même recette eyebrow que les titres
     de section de la colonne droite (.wh-rcol-title) : mono 10.5px,
     letter-spacing 2.2px, uppercase, pastille amber en tête. */
  /* Titre "Mes projets" — eyebrow mono uppercase au-dessus de la pile
     de cards. Plus dans la grille (le panneau projects est maintenant
     flex-column, pas grid). */
  .wh-desktop .wh-projects-title {
    display: flex; align-items: center; gap: 10px;
    font-family: var(--mono);
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: 2.2px;
    line-height: 1;
    color: var(--text);
    text-transform: uppercase;
    padding: 4px 4px 12px;
    margin: 0;
    border-bottom: none;
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
  /* Refonte 2026-04-29 — slogan centré et tagline dessous (comme la
     landing / pricing). Plus de grille 4 colonnes, on lit en colonne
     centrée. La tagline italique se cale juste sous le slogan. */
  .wh-desktop .wh-intro-row {
    display: flex; flex-direction: column;
    align-items: center;
    gap: 18px;
    width: 100%;
    padding: 28px 0 32px;
    text-align: center;
  }
  .wh-desktop .wh-intro-row .wh-slogan {
    overflow: visible;
    min-width: 0;
    text-align: center;
  }
  /* Garantie absolue : "Écoute, compare," tient sur une seule ligne. */
  .wh-desktop .wh-slogan .wh-slogan-line {
    white-space: nowrap;
  }
  /* L'eyebrow d'accueil "Bonjour {name} — N titres…" est rendu juste
     avant les 4 cards stats (positionné dans WelcomeHome, hors de
     .wh-intro depuis la refonte 2026-04-29). Il reste affiché sur tous
     les viewports : desktop ET mobile.
     La variante "floating" gère son propre espacement quand l'eyebrow
     n'est plus enveloppé par .wh-intro. */
  .wh-eyebrow-floating {
    margin: 8px 0 18px;
    justify-content: center;
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
  /* Tagline directement sous le slogan, centrée. Italique conservé
     (exception déjà actée pour les tagline / verdicts). Pas de grand
     guillemet décoratif : on l'a retiré avec le passage en colonne
     centrée car il ne servait qu'à équilibrer la grille horizontale. */
  .wh-desktop .wh-intro .wh-tagline-text {
    position: relative;
    font-family: var(--serif); font-style: italic;
    font-size: 22px; font-weight: 400;
    line-height: 1.45; color: var(--soft);
    max-width: 720px;
    margin: 0;
    text-align: center;
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
     s'empilent. Permet aux cartes (projets + conseils) d'être lisibles.
     Pareil pour .wh-onboarding (welcome+CTAs / checklist) qui doit
     stacker dès le même breakpoint pour ne pas déborder en mode
     portrait tablette. */
  @media (max-width: 860px) {
    .wh-desktop .wh-cols {
      grid-template-columns: 1fr !important;
    }
    .wh-onboarding {
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
    background: transparent; border: 1px solid var(--btn-border);
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

  /* ── Stats row — halos diffus variés par carte + sticker rotation
     ──────────────────────────────────────────────────────────────
     Refonte 2026-04-29 : 4 cards-stickers indépendantes (rotation
     subtile par card via --card-rot) avec halo color, hover qui
     lift + intensifie le halo. Chaque card a sa teinte alignée sur
     les hint colors (cerulean / amber / mint / violet). */
  .wh-stats {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px;
  }
  .wh-stat {
    background: var(--card); border: 1px solid var(--border); border-radius: 14px;
    padding: 20px 22px; min-height: 120px;
    display: flex; flex-direction: column;
    position: relative; overflow: hidden;
    transform: rotate(var(--card-rot, 0deg));
    transition: border-color .25s, transform .25s, box-shadow .25s;
  }
  /* Rotations subtiles par card — moins marquées que les diff cards
     de la landing parce que les stats portent du chiffre et ont
     besoin de rester très lisibles. */
  .wh-stats > .wh-stat:nth-child(1) { --card-rot: -0.6deg; }
  .wh-stats > .wh-stat:nth-child(2) { --card-rot:  0.6deg; }
  .wh-stats > .wh-stat:nth-child(3) { --card-rot: -0.8deg; }
  .wh-stats > .wh-stat:nth-child(4) { --card-rot:  0.8deg; }
  /* Override du système .wh-anim pour préserver la rotation pendant
     l'animation d'entrée (sinon transform: none écraserait la rotation). */
  .wh-anim.wh-stat {
    transform: translateY(14px) rotate(var(--card-rot, 0deg));
  }
  .wh-anim.wh-stat.wh-anim-in {
    transform: rotate(var(--card-rot, 0deg));
  }
  /* Hover : lift + halo intensifié + bordure plus visible */
  .wh-stat:hover {
    border-color: rgba(255,255,255,0.18);
    transform: rotate(var(--card-rot, 0deg)) translateY(-3px);
  }
  .wh-stat:hover::before {
    opacity: 0.55 !important;
    filter: blur(48px) !important;
  }
  /* Halo propre à chaque stat — position / couleur / taille / blur variés */
  .wh-stat::before {
    content: ''; position: absolute; pointer-events: none;
    border-radius: 50%; z-index: 0;
    transition: opacity .25s, filter .25s;
  }
  .wh-stat > * { position: relative; z-index: 1; }
  .wh-stat:nth-child(1)::before {
    top: -30px; right: -30px; width: 140px; height: 140px;
    background: var(--cerulean); filter: blur(50px); opacity: .35;
  }
  .wh-stat:nth-child(2)::before {
    bottom: -50px; left: -40px; width: 180px; height: 180px;
    background: var(--amber); filter: blur(65px); opacity: .30;
  }
  .wh-stat:nth-child(3)::before {
    top: -20px; left: 40%; width: 160px; height: 160px;
    background: var(--mint); filter: blur(70px); opacity: .26;
  }
  .wh-stat:nth-child(4)::before {
    bottom: -40px; right: -30px; width: 150px; height: 150px;
    background: var(--violet); filter: blur(58px); opacity: .32;
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
    transition: border-color .25s, transform .25s;
  }
  /* Refonte 2026-04-30bis : rotation subtile sur les 2 gros panneaux
     Recommandations + Saviez-vous pour donner du caractère à la grille,
     sans toucher aux cards internes (qui restent droites pour rester
     lisibles). Hover : on redresse pour le petit effet de réaction et
     pour ne pas faire bouger le contenu pendant l'interaction. */
  .wh-col-left > .wh-rcol-section { transform: rotate(-1deg); }
  .wh-col-right > .wh-rcol-section { transform: rotate(1deg); }
  .wh-col-left > .wh-rcol-section:hover,
  .wh-col-right > .wh-rcol-section:hover {
    transform: rotate(0deg) translateY(-2px);
  }
  /* Halo discret sur chaque panneau (amber pour "Toi", violet pour "Le saviez-vous").
     Bumpé pour être plus présent (0.06/0.07 → 0.10/0.12) et intensifié au hover. */
  .wh-rcol-section::after {
    content: '';
    position: absolute;
    right: 0; bottom: 0;
    width: 240px; height: 200px;
    background: radial-gradient(ellipse at bottom right,
      rgba(245,166,35,0.10), transparent 70%);
    border-bottom-right-radius: inherit;
    pointer-events: none;
    z-index: 0;
    transition: opacity .25s, filter .25s;
  }
  .wh-rcol-section:nth-of-type(2)::after {
    background: radial-gradient(ellipse at bottom right,
      rgba(166,126,245,0.12), transparent 70%);
  }
  .wh-rcol-section > * { position: relative; z-index: 1; }
  /* Hover : lift discret + halo qui prend de l'ampleur */
  .wh-rcol-section:hover {
    border-color: rgba(255,255,255,0.16);
    transform: translateY(-2px);
  }
  .wh-rcol-section:hover::after { opacity: 1.5; filter: brightness(1.2); }

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

  /* Cartes à l'intérieur d'une section.
     Refonte 2026-04-30bis : maintenant que les sections Recommandations
     et Saviez-vous sont en 50/50 sous le bloc projets pleine largeur,
     un simple stack vertical donnait deux colonnes hautes et creuses.
     On bascule en grille 2-col asymétrique : les 2 premières cards en
     haut côte à côte, la 3ᵉ s'étend sur toute la largeur en dessous.
     Cards droites (pas de rotation) — seul le panneau parent
     .wh-rcol-section reçoit une légère rotation pour donner le ton. */
  .wh-rcol-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .wh-rcol-cards > .wh-card:nth-child(3n) {
    grid-column: 1 / -1;
  }
  @media (max-width: 980px) {
    .wh-rcol-cards { grid-template-columns: 1fr; }
    .wh-rcol-cards > .wh-card:nth-child(3n) { grid-column: auto; }
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

  /* ── Onboarding hero (état vide) — refonte 2026-04-29
     Card "égayée" : 3 orbes de couleur en pseudo-éléments (cerulean
     top-left + amber center-right + violet bottom-left), bordure
     ambre conservée mais halos plus marqués. Hover : lift + glow
     intensifié comme sur les cards atouts/axes de la landing. */
  .wh-onboarding {
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(245,176,86,0.12) 0%, rgba(245,176,86,0.03) 100%);
    border: 1px solid rgba(245,176,86,0.28);
    border-radius: 20px;
    padding: 36px 40px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center;
    transition: border-color .25s, transform .25s, box-shadow .25s;
  }
  /* Halo cerulean en haut-gauche */
  .wh-onboarding::before {
    content: '';
    position: absolute;
    top: -30%; left: -15%;
    width: 360px; height: 360px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(92,184,204,0.35), transparent 70%);
    filter: blur(60px);
    pointer-events: none;
    z-index: 0;
    transition: opacity .25s, filter .25s;
  }
  /* Halo violet en bas-droite */
  .wh-onboarding::after {
    content: '';
    position: absolute;
    bottom: -35%; right: -15%;
    width: 380px; height: 380px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(166,126,245,0.30), transparent 70%);
    filter: blur(64px);
    pointer-events: none;
    z-index: 0;
    transition: opacity .25s, filter .25s;
  }
  /* Tout le contenu passe au-dessus des halos */
  .wh-onboarding > * { position: relative; z-index: 1; }

  /* Pulse subtle de la bordure ambre — respiration lente (8s) qui
     attire discrètement l'œil sur la card hero du compte neuf. Coupé
     sur prefers-reduced-motion. */
  .wh-onboarding {
    animation: wh-ob-pulse 8s ease-in-out infinite;
  }
  @keyframes wh-ob-pulse {
    0%, 100% {
      border-color: rgba(245,176,86,0.28);
      box-shadow: 0 0 0 0 rgba(245,176,86,0.0);
    }
    50% {
      border-color: rgba(245,176,86,0.45);
      box-shadow: 0 0 32px -8px rgba(245,176,86,0.20);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .wh-onboarding { animation: none; }
  }

  /* Chips décoratifs au-dessus de "Bienvenue, David" — clin d'œil au
     langage chips de la home/landing (constellation néon en haut du
     hero). 3 mini-pills colorées avec rotation libre, pas cliquables. */
  .wh-ob-chips {
    display: flex; flex-wrap: wrap; gap: 8px;
    margin-bottom: 18px;
    pointer-events: none;
    user-select: none;
  }
  .wh-ob-chip {
    display: inline-flex; align-items: center;
    font-family: var(--mono); font-size: 10.5px; font-weight: 500;
    letter-spacing: 1.4px; text-transform: uppercase;
    padding: 5px 11px;
    border-radius: 999px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 6px 20px -10px rgba(0,0,0,0.5);
    cursor: default;
  }
  .wh-ob-chip-amber    { background: rgba(245,166,35,0.14); border: 1px solid rgba(245,166,35,0.42); color: var(--amber); transform: rotate(-1.5deg); }
  .wh-ob-chip-cerulean { background: rgba(92,184,204,0.10); border: 1px solid rgba(92,184,204,0.34); color: #5cb8cc; transform: rotate(1.5deg); }
  .wh-ob-chip-mint     { background: rgba(142,224,122,0.10); border: 1px solid rgba(142,224,122,0.34); color: #8ee07a; transform: rotate(-1deg); }
  /* Sur mobile on neutralise les rotations pour la lisibilité */
  @media (max-width: 640px) {
    .wh-ob-chip { transform: none !important; font-size: 9.5px; padding: 4px 9px; }
    .wh-ob-chips { margin-bottom: 14px; gap: 6px; }
  }
  /* Hover : lift discret + halos qui s'intensifient + bordure plus chaude */
  .wh-onboarding:hover {
    border-color: rgba(245,176,86,0.42);
    transform: translateY(-2px);
  }
  .wh-onboarding:hover::before { opacity: 1.4; filter: blur(50px); }
  .wh-onboarding:hover::after { opacity: 1.4; filter: blur(54px); }
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
  /* Card "Mise en route" — petite rotation sticker pour casser
     l'alignement parfait avec la zone welcome à gauche et donner
     du caractère. Hover réutilise la rotation pour ne pas la
     "dérotater" au survol. Neutralisée sur mobile (1 col). */
  .wh-ob-checklist {
    background: var(--s1); border: 1px solid var(--border); border-radius: 14px;
    padding: 20px 22px;
    transform: rotate(1.2deg);
    transition: border-color .25s, transform .25s;
  }
  .wh-ob-checklist:hover {
    border-color: rgba(255,255,255,0.18);
    transform: rotate(1.2deg) translateY(-2px);
  }
  @media (max-width: 860px) {
    .wh-ob-checklist {
      transform: none;
    }
    .wh-ob-checklist:hover {
      transform: translateY(-2px);
    }
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
    background: transparent; border: 1px solid var(--btn-border);
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
  /* Suffixe durée collé au titre — couleur muted pour discrétion,
     même family/size pour rester aligné, pas de letter-spacing
     particulier (le séparateur "·" donne déjà le rythme visuel). */
  .wh-track-title .wh-track-title-dur {
    color: var(--muted);
    font-weight: 400;
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
  /* "Mes projets" — pile de cards pleine largeur (refonte 2026-04-30ter).
     Précédente version : grid auto-fill 2-col qui laissait des demi-colonnes
     vides quand peu de projets et faisait swiper le drag-n-drop entre
     colonnes (mental model "playlist" cassé). On repasse en stack vertical :
     - 1 card par rangée, full width
     - mono-open strict (1 seul ouvert à la fois)
     - card ouverte : hero header (cover bigger + nom big + meta band)
       + liste tracks en dessous, 1 par ligne. Inspiré du pattern Mixup
       adapté au contexte Versions (pas de comments / download). */
  .wh-projects {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 0;
    position: relative;
  }
  /* Quand un menu (projet ou titre) est ouvert dans la grille, on monte
     toute la grille au-dessus des sections sœurs (Recommandations, Le
     saviez-vous) — sinon la card .wh-rcol-section a son propre stacking
     context (position: relative + descendants z-index:1) et masque le
     dropdown qui dépasse de la card projet. */
  .wh-projects:has(.wh-acc-item.menu-open),
  .wh-projects:has(.wh-track-row.menu-open) {
    z-index: 20;
  }
  /* Teintes projet (valeurs RGB, alpha appliqué plus bas).
     Correspondent à la couleur claire du gradient de chaque teinte. */
  .wh-tint-0 { --project-tint: 198, 161, 91;  }  /* 0 ambre  */
  .wh-tint-1 { --project-tint: 91, 161, 198;  }  /* 1 bleu   */
  .wh-tint-2 { --project-tint: 161, 91, 198;  }  /* 2 violet */
  .wh-tint-3 { --project-tint: 91, 198, 161;  }  /* 3 vert   */
  .wh-tint-4 { --project-tint: 198, 91, 91;   }  /* 4 rouge  */
  .wh-tint-5 { --project-tint: 140, 140, 160; }  /* 5 gris   */

  /* Card projet — chaque item est une cellule de la grille .wh-projects.
     Refonte 2026-04-30bis : on quitte le pattern "row dans un panneau
     unique" (l'ancien v4-project-row) pour une vraie grille de cards.
     Chaque card a son propre fond + bordure + lift hover. */
  .wh-acc-item {
    background: var(--s1);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    position: relative;
    transition: transform .2s ease, border-color .2s, box-shadow .2s, background .2s;
  }
  .wh-acc-item:hover {
    transform: translateY(-2px);
    border-color: rgba(255,255,255,0.18);
    box-shadow: 0 14px 30px -18px rgba(0,0,0,0.6);
  }
  /* Mode ouvert — la card prend toute la largeur (déjà le cas en stack
     vertical) et change d'allure pour signaler l'état actif. Le fond
     passe en s2 (un poil plus clair) + bordure ambre légère + box-shadow
     plus marquée pour donner de la profondeur. Le hero header prend
     l'identité visuelle du projet (cover + name big), tracks en dessous. */
  .wh-acc-item.open {
    background:
      linear-gradient(180deg, rgba(245,166,35,0.04), transparent 40%),
      var(--s2, rgba(255,255,255,0.02));
    border-color: rgba(245,166,35,0.28);
    transform: none;
    box-shadow: 0 18px 40px -22px rgba(0,0,0,0.7);
  }
  .wh-acc-item.open:hover {
    transform: none; /* on ne lève pas la card ouverte (elle est posée) */
    border-color: rgba(245,166,35,0.42);
  }
  /* Hero header — quand la card est ouverte, le head devient plus
     généreux : cover passe à 64px, padding plus large, nom du projet
     plus gros. Ressort visuellement la sélection sans casser la grille
     verticale. Le score à droite reste à sa place habituelle. */
  .wh-acc-item.open .wh-acc-head {
    padding: 18px 20px;
    grid-template-columns: 64px 1fr auto;
    gap: 18px;
  }
  .wh-acc-item.open .wh-acc-cover {
    width: 64px; height: 64px;
    border-radius: 14px;
  }
  .wh-acc-item.open .wh-acc-name {
    font-family: var(--body); font-size: 20px; font-weight: 600;
    letter-spacing: -0.4px;
  }
  .wh-acc-item.open .wh-acc-meta {
    font-size: 10.5px; letter-spacing: 1.4px;
    margin-top: 6px;
  }
  /* Score plus gros aussi en mode ouvert pour rester proportionné. */
  .wh-acc-item.open .wh-acc-score {
    font-size: 32px;
    letter-spacing: -1px;
  }
  /* Quand le menu 3-points est ouvert sur un projet fermé, on laisse le
     menu déborder hors de la card (sinon overflow:hidden le tronque). */
  .wh-acc-item.menu-open {
    overflow: visible;
    z-index: 5;
  }
  /* Quand un menu 3-points de TITRE (à l'intérieur d'un projet ouvert)
     est ouvert, on élève le projet parent au-dessus des siblings suivants
     pour que son popup ne passe pas derrière les scores /100 en dessous. */
  .wh-acc-item:has(.wh-track-row.menu-open) {
    z-index: 6;
    overflow: visible;
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
  /* Wrapper score à droite — eyebrow "Score moyen" + chiffre.
     L'eyebrow donne le contexte qui manquait avant. */
  .wh-acc-score-block {
    display: flex; flex-direction: column; align-items: flex-end;
    gap: 2px;
    margin-right: 26px; /* place pour le menu 3-points (cf .wh-acc-score précédent) */
  }
  .wh-acc-score-eyebrow {
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: var(--muted);
    line-height: 1;
    white-space: nowrap;
  }
  /* Tinte l'eyebrow avec la couleur du tier — discret rappel du score. */
  .wh-acc-score-block.good .wh-acc-score-eyebrow { color: rgba(142,224,122,0.65); }
  .wh-acc-score-block.mid .wh-acc-score-eyebrow { color: rgba(245,166,35,0.65); }
  .wh-acc-score-block.low .wh-acc-score-eyebrow { color: rgba(255,93,93,0.65); }
  /* Score à droite — même typo que la maquette (26px bold, coloré selon seuil).
     Le margin-right est porté par .wh-acc-score-block maintenant, pas ici. */
  .wh-acc-score {
    font-family: var(--body); font-weight: 600;
    font-size: 26px; line-height: 1;
    letter-spacing: -0.8px;
    color: var(--muted2);
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
    background: transparent; border: 1px solid var(--btn-border);
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

  /* Liste des titres — 1 titre par ligne, full width.
     Le 2-col grid était joli pour absorber 12 titres mais cassait le
     mental model "playlist = liste verticale ordonnée" et rendait le
     drag-n-drop des titres confus (l'ordre serpente entre les colonnes
     plutôt que descendre droit). On revient au stack vertical qui
     est l'archétype playlist universel. L'espace gauche/droite vide
     une fois la card projet ouverte est rempli par .wh-project-side
     (panneau projet à droite). */
  .wh-acc-tracklist {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
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

  /* Fix mobile 2026-04-30 : sur 390 px les titres de projets/versions
     étaient tronqués à 2-3 caractères ("EP …", "Yo…", "Co…"). On
     compacte le head en mode ouvert (cover 48 au lieu de 64, padding
     réduit, eyebrow Score moyen masquée) et on resserre les tracks
     (drag handle masqué, gaps + paddings réduits, ANALYSE compact). */
  @media (max-width: 480px) {
    .wh-acc-item.open .wh-acc-head {
      padding: 14px 12px;
      grid-template-columns: 48px 1fr auto;
      gap: 12px;
    }
    .wh-acc-item.open .wh-acc-cover {
      width: 48px; height: 48px;
      border-radius: 12px;
    }
    .wh-acc-item.open .wh-acc-name { font-size: 16px; }
    .wh-acc-item.open .wh-acc-score { font-size: 24px; }
    /* Compacte le score-block — eyebrow masquée et marge droite réduite
       pour rendre la place au titre. */
    .wh-acc-score-block { margin-right: 18px; }
    .wh-acc-score-eyebrow { display: none; }

    /* Track-row : drag-handle masqué (pas de DnD prioritaire en mobile),
       padding/gap resserrés. Le titre + meta retrouvent une largeur
       lisible. ANALYSE devient une chip compacte. */
    .wh-track-row {
      padding: 8px 10px;
      gap: 10px;
    }
    .wh-drag-handle { display: none; }
    .wh-track-play { width: 36px; height: 36px; }
    .wh-track-fiche {
      padding: 4px 8px;
      font-size: 9.5px;
      letter-spacing: 1px;
    }
    .wh-track-title { font-size: 13.5px; }
    .wh-track-meta { font-size: 11px; }
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
  /* Aligné sur .add-mini-backdrop : voile 45% + flou 5px.
     Refonte 2026-04-30bis : centrage vertical (align-items: center)
     pour que la modale s'affiche au milieu de la page plutôt que
     collée en haut. Si le contenu dépasse 90vh, max-height + overflow
     interne sur le panel s'occupent du scroll. */
  .reglages-modal-overlay {
    position: fixed; inset: 0; z-index: 500;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    display: flex; align-items: center; justify-content: center;
    padding: 5vh 20px;
    box-sizing: border-box;
    overflow-y: auto;
    animation: fadein .18s ease;
  }
  /* Modale dark — fond éclairci pour créer du contraste avec la
     page (--bg: #0a0b14). Ancien --s2 #16171e était trop proche du
     fond et la modale "se confondait". On bump à #2a2d36 → ~3× plus
     lumineux que le bg, le panneau décolle clairement, sans toucher
     aux rows/inputs internes (qui restent nettement plus dark à
     l'intérieur, donnant l'effet "puits inset"). */
  .reglages-modal-panel {
    position: relative; isolation: isolate;
    width: 100%; max-width: 620px;
    background: #2a2d36;
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
    background: transparent; border: 1px solid var(--btn-border);
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
    /* Fond éclairci pour décoller du dark page background (#0a0b14).
       Ancienne valeur #0a0b10 était quasi-identique au fond de page,
       la modale s'y fondait. Maintenant à #2a2d36 → ~3× plus clair
       que le bg, panneau qui flotte clairement.
       Bordure accentuée (rgba 0.22) pour un trait franc qui dessine
       le contour de la card. */
    /* Teinte froide bleutée — pose le panneau dans un registre
       légèrement différent du gris pur, avec une nuance fraîche qui
       complémente les accents amber. */
    background: #262b38;
    border: 1px solid rgba(255,255,255,0.16);
    max-width: 560px;
    overflow: hidden;
  }
  .reglages-modal-panel.mini-modal .reglages-modal-scroll {
    position: relative;
    z-index: 1;
  }

  .rg-mini {
    position: relative;
    padding: 28px 28px 24px;
    display: flex; flex-direction: column; gap: 0;
  }
  /* Eyebrow chip pill — même grammaire que .rr-eyebrow / .score-eyebrow
     de la fiche, .ap-eyebrow du loading. Mono amber, bg amber-tinted,
     bordure amber subtile. Pas de rotation (règle no-eyebrow-rotation). */
  .rg-mini .rg-mm-eyebrow {
    align-self: flex-start;
    display: inline-flex; align-items: center;
    font-family: var(--mono);
    font-size: 9.5px; font-weight: 500;
    letter-spacing: 1.8px; text-transform: uppercase;
    color: var(--amber);
    padding: 4px 11px; border-radius: 999px;
    background: rgba(245,166,35,0.10);
    border: 1px solid rgba(245,166,35,0.38);
    margin-bottom: 10px;
  }
  .rg-mini .rg-mm-head {
    font-family: var(--mono); font-size: 10px; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--muted);
    margin-bottom: 4px;
  }
  /* Titre — DM Sans 600 22px, em amber non-italique. */
  .rg-mini .rg-mm-title {
    font-family: var(--body); font-weight: 600; font-size: 22px;
    letter-spacing: -0.4px; color: var(--text);
    margin: 0 0 22px;
    line-height: 1.15;
  }
  .rg-mini .rg-mm-title em {
    font-family: inherit; font-style: normal; font-weight: inherit; color: var(--amber);
  }

  /* Row de réglage — restaure le look d'origine demandé par David :
     row légèrement plus claire que le panel, avec un subtil highlight
     haut pour l'effet "surélevé". */
  .rg-mini .rg-row {
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

  /* Label = eyebrow mono uppercase au-dessus du contenu de la row,
     comme les eyebrows de section ailleurs sur le site. Plus
     hiérarchisé que l'ancien label 13px medium.
     Sur la modale crème, --rg-text bascule en dark warm. */
  .rg-mini .rg-label {
    font-family: var(--mono);
    font-size: 10.5px; font-weight: 500;
    letter-spacing: 1.6px; text-transform: uppercase;
    color: var(--text);
    display: flex; align-items: center; gap: 8px;
    line-height: 1.2;
  }
  .rg-mini .rg-hint {
    font-family: var(--body); font-size: 12px; font-weight: 300;
    letter-spacing: 0; text-transform: none;
    color: var(--muted); margin-top: 4px;
    max-width: 320px;
    line-height: 1.4;
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

  /* Compte : layout 2 niveaux dans une row stack — top = label/email à
     gauche + crédits/plan/renew à droite, bottom = CTA pleine largeur
     "Acheter des crédits" (ou "Gérer mon abonnement" si déjà abonné). */
  .rg-mini .rg-account-row {
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px;
    width: 100%;
  }
  /* Crédits + plan + renew, alignés à droite, en colonne pour
     hiérarchiser. Crédits = ligne amber DM Sans 600 (action principale),
     plan = pill outline (premium = amber rempli, free = neutral), renew =
     ligne mono soft en dessous. */
  .rg-mini .rg-account-meta {
    display: flex; flex-direction: column; align-items: flex-end;
    gap: 6px; flex-shrink: 0;
    text-align: right;
  }
  .rg-mini .rg-account-credits {
    font-family: var(--body); font-weight: 600; font-size: 14px;
    color: var(--amber); letter-spacing: -0.1px;
    line-height: 1;
  }
  .rg-mini .rg-account-plan {
    font-family: var(--mono); font-size: 9.5px; font-weight: 500;
    letter-spacing: 1.6px; text-transform: uppercase;
    padding: 4px 10px; border-radius: 999px;
    color: var(--muted);
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    line-height: 1;
  }
  .rg-mini .rg-account-plan.is-premium {
    color: var(--amber);
    background: rgba(245,166,35,0.10);
    border-color: rgba(245,166,35,0.38);
  }
  .rg-mini .rg-account-renew {
    font-family: var(--mono); font-size: 9px; font-weight: 500;
    letter-spacing: 1.2px; text-transform: uppercase;
    color: var(--muted);
    line-height: 1.2;
  }
  /* CTA "+ Acheter des crédits" — pill amber sur fond dark. */
  .rg-mini .rg-account-cta {
    display: inline-flex; align-items: center; justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 11px 18px;
    border-radius: 999px;
    background: rgba(245,166,35,0.10);
    border: 1px solid rgba(245,166,35,0.42);
    color: var(--amber);
    font-family: var(--mono);
    font-size: 11px; font-weight: 500;
    letter-spacing: 1.6px; text-transform: uppercase;
    cursor: pointer;
    box-shadow: 0 12px 30px -16px rgba(245,166,35,0.4);
    transition: background .18s, border-color .18s, box-shadow .18s, transform .15s;
  }
  .rg-mini .rg-account-cta:hover {
    background: rgba(245,166,35,0.16);
    border-color: var(--amber);
    box-shadow: 0 16px 36px -14px rgba(245,166,35,0.55);
    transform: translateY(-1px);
  }
  .rg-mini .rg-account-cta:active {
    transform: translateY(0);
  }
  .rg-account-cta-icon {
    display: inline-flex; align-items: center; justify-content: center;
    width: 20px; height: 20px;
    border-radius: 50%;
    background: rgba(245,166,35,0.20);
    color: var(--amber);
    font-size: 14px; font-weight: 600;
    line-height: 1;
  }

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
    background: transparent; border: 1px solid var(--btn-border);
    color: var(--soft);
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    letter-spacing: 1.2px; text-transform: uppercase;
    line-height: 16px;
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
  /* Card standard — UNIFIED MODAL TEMPLATE (refonte 2026-04-30bis).
     Cette card est le modèle commun pour TOUTES les modales du site
     (AddModal, RenameModal, ConfirmModal, ShareLinkModal, ExportPdfModal,
     DspEditModal, ReglagesModal qui s'aligne via .reglages-modal-panel.mini-modal).
     - Fond #262b38 : cool blue tinted, ~3× plus lumineux que --bg
       (#0a0b14) → la modale décolle clairement de la page.
     - Bordure 16% blanc : trait franc qui dessine le contour.
     - Halos amber/cerulean conservés pour habiter l'intérieur. */
  .add-mini-card {
    position: relative; isolation: isolate;
    background: #262b38;
    border: 1px solid rgba(255,255,255,0.16);
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

  /* Variant UPLOAD — modale d'ajout titre/version (.is-upload).
     Refonte 2026-04-30bis : on aère cette modale (cruciale pour le
     onboarding) sans toucher aux autres (rename/confirm/share qui
     restent compactes). Width bumpée + padding intérieur + tailles
     typo/inputs revues à la hausse pour respiration et ergonomie. */
  .add-mini-card.is-upload {
    width: 600px;
    padding: 32px 36px 28px;
  }
  .add-mini-card.is-upload .add-mini-title { margin-bottom: 22px; }
  .add-mini-card.is-upload .add-mini-field { margin-bottom: 18px; }
  .add-mini-card.is-upload .add-mini-field-label {
    font-size: 11px;
    letter-spacing: 1.8px;
    margin-bottom: 9px;
    /* Couleur amber soft pour que les titres de section ressortent
       du gros bloc de gris uniforme — donne des "ancres visuelles"
       qui hiérarchisent la modale sans crier. */
    color: rgba(245,166,35,0.78);
  }
  .add-mini-card.is-upload .add-mini-input,
  .add-mini-card.is-upload .add-mini-select {
    padding: 12px 14px;
    font-size: 14px;
  }
  .add-mini-card.is-upload .add-mini-select {
    padding: 12px 36px 12px 14px;
  }
  .add-mini-card.is-upload .add-mini-drop {
    padding: 18px 20px;
    gap: 14px;
  }
  .add-mini-card.is-upload .add-mini-pill {
    padding: 9px 16px;
    font-size: 14px;
  }
  .add-mini-card.is-upload .add-mini-upload-banner {
    padding: 12px 14px;
    margin-bottom: 18px;
  }
  .add-mini-card.is-upload .add-mini-upload-banner-name {
    font-size: 14px;
  }
  .add-mini-card.is-upload .add-mini-upload-banner-kicker {
    font-size: 10px;
    letter-spacing: 1.6px;
  }
  .add-mini-card.is-upload .add-mini-cta {
    padding: 14px 18px;
    font-size: 12px;
    letter-spacing: 1.4px;
    margin-top: 10px;
  }
  .add-mini-card.is-upload .add-mini-intent-toggle {
    font-size: 14px;
  }

  /* ── Helpers homogénéisation modale upload ──────────────────────── */
  /* Grid 2 colonnes (titre + version) */
  .add-mini-grid-2col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 18px;
  }
  /* Row de pills (vocal type, mix/master, etc.) */
  .add-mini-pill-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .add-mini-pill-row-sub { margin-top: 8px; }
  /* Hint sous un champ — DM Sans 300 light, couleur muted, line-height aéré.
     Utilisé sous le toggle Mix/Master pour expliquer l'impact, etc. */
  .add-mini-field-hint {
    margin-top: 10px;
    font-family: var(--body);
    font-size: 12.5px;
    font-weight: 300;
    line-height: 1.5;
    color: var(--muted);
  }
  /* Drop zone : icone amber/mint, texte body, formats mono */
  .add-mini-drop-icon {
    font-size: 16px;
    flex-shrink: 0;
    line-height: 1;
  }
  .add-mini-drop-icon.is-amber { color: var(--amber); }
  .add-mini-drop-icon.is-mint { color: var(--mint); }
  .add-mini-drop-text-block { flex: 1; min-width: 0; }
  .add-mini-drop-text {
    flex: 1;
    font-family: var(--body);
    font-size: 14px;
    color: var(--text);
    line-height: 1.3;
  }
  .add-mini-drop-text.is-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .add-mini-drop-formats {
    margin-top: 4px;
    font-family: var(--mono);
    font-size: 9.5px;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: var(--muted);
  }
  /* Banner projet verrouillé : dot amber + body 1fr + lock icon */
  .add-mini-upload-banner-dot {
    font-size: 12px;
    color: var(--amber);
    flex-shrink: 0;
    line-height: 1;
  }
  .add-mini-upload-banner-body {
    flex: 1;
    min-width: 0;
  }

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
  /* Etat erreur sur la zone drop : cap duree audio depasse ou format illisible */
  .add-mini-drop.is-error {
    background: rgba(255,93,93,0.04);
    border-color: rgba(255,93,93,0.45);
  }
  .add-mini-file-error {
    margin-top: 6px;
    padding: 10px 12px;
    border-radius: 8px;
    background: rgba(255,93,93,0.06);
    border: 1px solid rgba(255,93,93,0.22);
    color: var(--text);
    font-family: var(--body);
    font-size: 12.5px;
    line-height: 1.5;
  }
  .add-mini-file-error strong {
    display: block;
    font-weight: 600;
    color: rgba(255,93,93,0.92);
    margin-bottom: 2px;
    font-size: 12px;
    letter-spacing: 0.2px;
  }

  /* Upload : pill (vocal) + select wrap (daw) */
  .add-mini-pill {
    padding: 8px 14px; border-radius: 999px;
    background: transparent; border: 1px solid var(--btn-border);
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
  /* Toggle "+ Ajouter une intention artistique" — discret, link-like.
     Hover : couleur ambre, soulignement subtil. */
  .add-mini-intent-toggle {
    display: inline-flex; align-items: center;
    background: transparent; border: none;
    color: var(--muted);
    font-family: var(--body); font-size: 13px; font-weight: 400;
    padding: 4px 0; cursor: pointer;
    transition: color .15s;
  }
  .add-mini-intent-toggle:hover {
    color: var(--amber);
  }
  /* Label avec un bouton × à droite (replier le textarea intention) */
  .add-mini-field-label-row {
    display: flex; align-items: center; justify-content: space-between;
    width: 100%;
  }
  .add-mini-intent-collapse {
    background: transparent; border: none;
    color: var(--muted2);
    font-family: var(--body); font-size: 18px; font-weight: 400;
    line-height: 1; padding: 0 4px; cursor: pointer;
    transition: color .15s;
  }
  .add-mini-intent-collapse:hover { color: var(--text); }
  /* Textarea — même style que .add-mini-input mais hauteur libre,
     placeholder italic léger. */
  .add-mini-textarea {
    min-height: 80px;
    resize: vertical;
    line-height: 1.5;
    padding: 10px 12px;
    font-family: var(--body); font-size: 13px;
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
    background: transparent; border: 1px solid var(--btn-border);
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
  /* ANALYSE EN COURS — v3 (refonte 2026-04-30, page focus) */
  /*                                                          */
  /* Pas de sidebar, pas de topbar nav : juste le brand mark  */
  /* top-left + tout le reste centré au milieu de l'écran.    */
  /* Typo : DM Sans body, Cormorant Garamond pour le titre    */
  /* dramatique, JetBrains Mono pour les eyebrows / steps.    */
  /* Système chip eyebrow cohérent avec la fiche.             */
  /* ══════════════════════════════════════════════════════ */
  .ap-scaffold {
    position: relative;
    width: 100%; min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 120px 24px 80px; box-sizing: border-box;
    animation: fadeup .3s ease;
  }
  .ap-stack {
    display: flex; flex-direction: column; align-items: center;
    gap: 22px; max-width: 560px; width: 100%;
  }

  /* Brand mark top-left — calé sur .db-topbar-brand pour rester cohérent
     avec le brand des autres écrans, mais positionné en absolute pour
     ne pas forcer un layout topbar complet. */
  .ap-brand {
    position: absolute; top: 22px; left: 22px;
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; border: 0; cursor: pointer;
    padding: 0; border-radius: 8px;
    transition: opacity .15s;
    z-index: 5;
  }
  .ap-brand:hover { opacity: 0.82; }
  .ap-brand-logo {
    height: 38px; width: auto;
    filter: drop-shadow(0 0 16px rgba(245,166,35,0.18));
  }
  .ap-brand-wordmark {
    font-family: var(--body);
    font-weight: 700; font-size: 27px;
    letter-spacing: -0.5px; color: var(--text); line-height: 1;
  }
  .ap-brand-wordmark .accent { color: var(--amber); font-style: normal; }

  /* Eyebrow chip "Analyse en cours" — système chip pill cohérent avec
     .rr-eyebrow / .score-eyebrow / .diag-eyebrow de la fiche : mono
     amber, bg amber-tinted, sans rotation (cf. règle no-eyebrow-rotation). */
  .ap-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--mono);
    font-size: 9.5px; font-weight: 500;
    letter-spacing: 1.8px; text-transform: uppercase;
    color: var(--amber);
    padding: 5px 12px; border-radius: 999px;
    background: rgba(245,166,35,0.10);
    border: 1px solid rgba(245,166,35,0.38);
    box-shadow: 0 6px 18px -10px rgba(0,0,0,0.55);
  }
  .ap-eyebrow-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--amber);
    box-shadow: 0 0 8px rgba(245,166,35,0.6);
    animation: ap-pulse 1.4s ease-in-out infinite;
  }

  /* Titre hero — même grammaire typo que .lp-slogan / .wh-slogan :
     DM Sans 700, gros, line-height serré, letter-spacing négatif,
     em amber non-italique. C'est la signature des grosses phrases
     hero du produit. Cormorant Garamond, lui, reste réservé aux
     verdicts de la fiche (italique). */
  .ap-title {
    font-family: var(--body); font-weight: 700;
    font-style: normal;
    font-size: clamp(40px, 6vw, 72px);
    line-height: 0.98; letter-spacing: -2px;
    color: var(--text); text-align: center; margin: 4px 0 0;
  }
  .ap-title em {
    font-family: inherit; font-style: normal; font-weight: inherit;
    letter-spacing: inherit; color: var(--amber);
  }

  /* Sous-titre meta : titre + version courants en mono uppercase, look
     eyebrow soft. */
  .ap-sub {
    font-family: var(--mono); font-size: 10.5px; font-weight: 500;
    letter-spacing: 1.8px; text-transform: uppercase;
    color: var(--muted); text-align: center;
    margin: -6px 0 6px;
  }
  .ap-sub b { color: var(--soft); font-weight: 500; }

  /* Radial — bumpé à 240px pour donner plus d'impact visuel maintenant
     qu'il est l'élément central de la page (pas de sidebar). */
  .ap-radial-wrap {
    position: relative; width: 240px; height: 240px;
    margin: 8px 0 2px;
  }
  .ap-radial { width: 100%; height: 100%; transform: rotate(-90deg); display: block; }
  .ap-radial circle { fill: none; stroke-width: 3; }
  .ap-radial .track { stroke: rgba(255,255,255,0.05); }
  .ap-radial .bar {
    stroke: var(--amber);
    stroke-linecap: round;
    stroke-dasharray: 628;
    filter: drop-shadow(0 0 8px rgba(245,166,35,0.55));
    transition: stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1);
  }
  .ap-radial-inner {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center;
  }
  .ap-pct {
    font-family: var(--body); font-size: 56px; font-weight: 600;
    letter-spacing: -1.2px; color: var(--text); line-height: 1;
  }
  .ap-pct em {
    font-style: normal; color: var(--amber);
    font-size: 22px; margin-left: 3px;
    vertical-align: super; font-weight: 500;
  }
  .ap-status {
    font-family: var(--mono); font-size: 9.5px; font-weight: 500;
    letter-spacing: 1.6px; text-transform: uppercase;
    color: var(--amber); margin-top: 12px;
    max-width: 160px;
  }

  /* Micro-steps horizontaux — chips pill style cohérent avec le système
     chip global (.pr-chip, .vside-chip). État done = mint, active = amber
     pulsant, pending = muted. Légères rotations -2°/+1.5°/-1°/+2° sur les
     4 chips, raccord avec les chips de métadonnées de la fiche (.vside-chip,
     deltas EvolutionBanner). Les eyebrows de TITRE restent sans rotation
     (règle no-eyebrow-rotation), mais ces chips-ci sont des données d'état
     séquentielles, donc rotations OK. */
  .ap-micro-steps {
    display: flex; justify-content: center;
    gap: 12px; flex-wrap: wrap;
    margin: 8px 0 2px;
    padding: 4px 0;
  }
  .ap-micro {
    display: inline-flex; align-items: center; gap: 7px;
    font-family: var(--mono); font-size: 9.5px; font-weight: 500;
    letter-spacing: 1.4px; text-transform: uppercase;
    color: var(--muted);
    padding: 5px 11px; border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.02);
    transition: color .2s, border-color .2s, background .2s, transform .2s ease;
  }
  /* Rotations subtiles, pattern alterné — même grammaire que .vside-chip /
     EvolutionBanner deltas. Au hover, la chip se redresse pour donner un
     petit effet de réaction. */
  .ap-micro:nth-child(1) { transform: rotate(-2deg); }
  .ap-micro:nth-child(2) { transform: rotate(1.5deg); }
  .ap-micro:nth-child(3) { transform: rotate(-1deg); }
  .ap-micro:nth-child(4) { transform: rotate(2deg); }
  .ap-micro:hover { transform: rotate(0deg); }
  .ap-micro b { font-weight: 500; }
  .ap-micro.is-done {
    color: var(--mint);
    border-color: rgba(142,224,122,0.32);
    background: rgba(142,224,122,0.06);
  }
  .ap-micro.is-done b { color: var(--mint); }
  .ap-micro.is-active {
    color: var(--amber);
    border-color: rgba(245,166,35,0.38);
    background: rgba(245,166,35,0.08);
    box-shadow: 0 6px 18px -10px rgba(245,166,35,0.45);
  }
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

  /* Carte "Le saviez-vous" — eyebrow chip pill + corps DM Sans, même
     grammaire que les notes-card de la fiche. Bg légèrement plus chaud
     (amber-tinted) pour différencier d'une card neutre. */
  .ap-tip {
    width: 100%;
    background:
      linear-gradient(180deg, rgba(245,166,35,0.04), rgba(245,166,35,0.015) 60%, transparent),
      #0e0f14;
    border: 1px solid rgba(245,166,35,0.16);
    border-radius: 16px; padding: 18px 20px 20px;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.02),
      0 18px 36px -28px rgba(0,0,0,0.7);
  }
  .ap-tip-kicker {
    display: inline-flex; align-items: center; gap: 7px;
    font-family: var(--mono); font-size: 9.5px; font-weight: 500;
    letter-spacing: 1.6px; text-transform: uppercase;
    color: var(--amber);
    padding: 4px 10px; border-radius: 999px;
    background: rgba(245,166,35,0.10);
    border: 1px solid rgba(245,166,35,0.32);
    box-shadow: 0 6px 18px -10px rgba(0,0,0,0.55);
    margin-bottom: 10px;
  }
  .ap-tip-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--amber); }
  .ap-tip-body {
    font-family: var(--body);
    font-size: 14px; color: var(--soft); line-height: 1.55;
    font-weight: 300;
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

  /* ── Bouton "Annuler l'analyse" (pill outline discret) ─
     Posé en bas du ap-stack, pas une action principale : on atténue
     le contour pour qu'il ne concurrence pas le radial ni le statut. */
  .ap-cancel {
    margin-top: 12px;
    font-family: var(--mono); font-size: 10.5px; font-weight: 500;
    letter-spacing: 1.6px; text-transform: uppercase;
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

  /* Mobile : compact. Brand mark plus petit, padding réduit, titre
     dégonflé pour rester lisible sur narrow viewport. */
  @media (max-width: 720px) {
    .ap-scaffold { padding: 96px 16px 60px; }
    .ap-brand { top: 14px; left: 14px; gap: 6px; }
    .ap-brand-logo { height: 30px; }
    .ap-brand-wordmark { font-size: 21px; }
    .ap-title { font-size: 38px; }
    .ap-radial-wrap { width: 200px; height: 200px; }
    .ap-pct { font-size: 44px; }
    .ap-pct em { font-size: 18px; }
    .ap-micro-steps { gap: 8px; }
    .ap-micro { font-size: 9px; padding: 4px 9px; }
    /* Mobile : on dégonfle les rotations pour éviter que ça déborde
       sur narrow viewport. */
    .ap-micro:nth-child(1) { transform: rotate(-1deg); }
    .ap-micro:nth-child(2) { transform: rotate(0.8deg); }
    .ap-micro:nth-child(3) { transform: rotate(-0.5deg); }
    .ap-micro:nth-child(4) { transform: rotate(1deg); }
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
  /* Finalize = widget compact dans la fiche, on retombe en DM Sans pour
     ne pas avoir un Cormorant 24px qui jure avec les titres de section
     de la fiche en sans-serif. Le Cormorant ne sert qu'au gros titre
     dramatique de l'écran d'analyse plein écran. */
  .ap-finalize .ap-title {
    font-family: var(--body); font-size: 24px; font-weight: 600;
    letter-spacing: -0.3px;
  }
  .ap-finalize .ap-title em { font-style: normal; }

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
    background: transparent; border: 1px solid var(--btn-border);
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

  /* Bouton menu — refonte 2026-04-29 : avatar/photo retiré, on garde
     un trigger sobre type "hamburger" (pill backdrop-blur, picto neutre).
     Identique à .db-utility-btn pour un langage cohérent entre rail
     desktop (gear/log-out) et menu mobile (hamburger). */
  .mobile-avatar-btn {
    width: 36px; height: 36px;
    border-radius: 999px;
    padding: 0;
    background: rgba(20, 20, 22, 0.6);
    border: 1px solid var(--border);
    color: var(--muted);
    display: inline-flex; align-items: center; justify-content: center;
    cursor: pointer;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition: color .15s, border-color .15s, background .15s, transform .15s;
  }
  .mobile-avatar-btn:hover {
    color: var(--text);
    border-color: rgba(255, 255, 255, 0.20);
    background: rgba(255, 255, 255, 0.04);
  }
  .mobile-avatar-btn.open {
    color: var(--text);
    border-color: rgba(245, 166, 35, 0.45);
    background: rgba(245, 166, 35, 0.08);
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
    /* Padding bas pour réserver la place du dock en mobile : player
       (60) + chat/add-pill row (46 + 12 gap) ≈ 120 px. Le rail
       utilitaire est remonté dans la topbar (cf. App.jsx + MockupStyles
       .db-utility-rail mobile), donc plus besoin de réserver 168. */
    body { padding-bottom: 128px; }

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

    /* Player mobile — refonte 2026-04-30 : meta single-line, cap haut
       à 110 px pour laisser la waveform respirer. !important pour
       battre la règle .pl-meta-single (max-width 180px desktop). */
    .player .pl-meta .pl-title { font-size: 12px; }
    .player .pl-meta,
    .player .pl-meta.pl-meta-single { min-width: 0; max-width: 110px; }
    .player .pl-wave { display: none; }
    /* Mobile : wavesurfer visible (même rendu que desktop, on garde les
       barres audio), scrubber range caché. */
    .player .pl-wavesurfer { display: block; }
    .player .pl-scrubber { display: none; }
    .player .pl-time { font-size: 10px; min-width: 36px; }
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
    /* Refonte 2026-04-30 : background transparent pour laisser passer
       les halos ambient (.ambient-halo + .va-bg-orbs montés au body)
       comme sur le reste du site. Avant : var(--bg) solide cachait
       complètement les halos derrière. Le shell garde un stacking
       context (position + z-index) pour rester au-dessus des halos. */
    position: relative;
    z-index: 1;
    background: transparent;
    color: var(--text);
    display: flex;
    flex-direction: column;
  }
  .public-fiche-topbar {
    /* Refonte 2026-04-30 v4 : topbar exemple alignée strictement sur
       celle des pages d'analyses (lp-topbar / db-topbar) — bg
       transparent, plus de border-bottom, plus de sticky qui collait
       au scroll (les autres topbars ne le sont pas non plus). Padding
       22 18 pour matcher exactement .db-topbar / .lp-topbar. */
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 18px;
    border-bottom: 0;
    background: transparent;
    position: relative;
    z-index: 2;
    gap: 24px;
  }
  .public-fiche-topbar .pft-left {
    display: flex; align-items: center; gap: 12px;
  }
  /* Typographie nav identique à .lp-topbar-link / .db-topbar-link
     (mono uppercase 11 px, hauteur 32 px, padding 0 16, hover ambre).
     On override .pft-nav-link / .pft-cta pour qu ils héritent de la
     même grammaire que partout ailleurs. */
  .public-fiche-topbar .pft-nav-link,
  .public-fiche-topbar .pft-cta {
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    letter-spacing: 1.6px; text-transform: uppercase;
    height: 32px;
    padding: 0 16px;
    border-radius: 999px;
    background: transparent;
    color: var(--text-soft, var(--muted));
    border: 1px solid transparent;
    box-sizing: border-box;
    cursor: pointer;
    transition: color .15s, background .15s, border-color .15s;
    display: inline-flex; align-items: center;
    line-height: 1;
    text-decoration: none;
  }
  .public-fiche-topbar .pft-nav-link:hover,
  .public-fiche-topbar .pft-cta:hover {
    color: var(--text);
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.10);
  }
  /* Le CTA "Tableau de bord" est marqué comme current pour correspondre
     au style du badge ambre des autres topbars (.db-topbar-current,
     .pr-topbar-current). */
  .public-fiche-topbar .pft-cta {
    color: var(--amber);
    background: rgba(245,166,35,0.06);
    border-color: rgba(245,166,35,0.32);
  }
  .public-fiche-topbar .pft-cta:hover {
    color: var(--amber);
    background: rgba(245,166,35,0.12);
    border-color: rgba(245,166,35,0.55);
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
    /* Refonte 2026-04-30 : padding latéral remonté à 22 px (aligné
       sur .fiche-v2 .page mobile) pour donner plus d'air aux cards. */
    .public-fiche-topbar { padding: 12px 22px; }
    .public-fiche-page { padding: 0 22px; }
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

    /* Fix mobile 2026-04-30 : la topbar fiche débordait à droite parce que
       le dropdown de version (.version-dropdown) ne se laissait pas
       comprimer quand le nom était long ("Mix sans limiter" = 173 px).
       Le bouton "exporter en PDF" se faisait alors couper.
       → On rend le dropdown shrinkable, le texte tronqué via ellipsis,
         et on resserre les actions share/scoreCard/export. */
    /* Refonte mobile 2026-04-30 (v3) : topbar fiche allégée — DspBadge
       + 3 boutons retirés du JSX (dupliqués dans le panneau side du
       verdict). Flèche back retirée aussi. Reste juste le dropdown de
       version, centré horizontalement, sur fond transparent (plus de
       bande sombre disjointe). */
    .timeline {
      position: static;
      background: transparent;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      border-bottom: 0;
      gap: 0;
      padding: 4px 14px 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      grid-template-columns: none;
      grid-template-rows: none;
    }
    .version-dropdown {
      display: inline-flex;
      flex: 0 1 auto;
      min-width: 0;
      max-width: 100%;
    }
    .version-dropdown-trigger {
      width: 100%;
      min-width: 0;
      padding: 7px 10px;
      gap: 6px;
      letter-spacing: 0.8px;
      overflow: hidden;
    }
    .version-dropdown-trigger b {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      letter-spacing: 0.8px;
      min-width: 0;
    }
    .version-dropdown-trigger .vdd-chev { flex-shrink: 0; }
    .fiche-head-actions { gap: 2px; }
    .fiche-head-btn { padding: 6px 6px; }
    .fiche-head-btn svg { width: 16px; height: 16px; }
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
    border: 1px solid var(--btn-border, rgba(255,255,255,0.28));
    color: var(--soft, rgba(255,255,255,0.72));
  }
  .intent-btn-ghost:hover {
    background: rgba(255,255,255,0.04);
    border-color: var(--btn-border-hover, rgba(255,255,255,0.45));
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

  /* ─────────────────────────────────────────────────────────────
     DSP_PLAN A.3 — Radar constellation 6 catégories
     Hexagone non rempli, lignes ambre 1px + points ambre par axe à
     la position du score moyen. Cohérent grammaire "constellation"
     de la landing. Hover = axe éclairé + carte détail.
     Remplace .mix-indicators dans .rv-top (même data, viz plus pure).
     ───────────────────────────────────────────────────────────── */
  .fiche-v2 .row-verdict .rv-left .rv-top .mix-radar {
    flex: 1;
    min-width: 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 0;
  }
  .fiche-v2 .mix-radar-svg {
    width: 100%;
    max-width: 240px;
    height: auto;
    aspect-ratio: 1 / 1;
    overflow: visible;
    animation: dsp-fade-in .15s ease-out both;
  }
  /* Labels axes : mono caps tiny, muted par défaut, ambre au hover.
     Letter-spacing réduit + size légèrement plus petite pour limiter la
     largeur des longs labels horizontaux ('ASSISE BASSE', 'DYNAMIQUE')
     qui débordaient sur le score ring / hors de la card à étroit. */
  .fiche-v2 .mix-radar-label {
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 8px;
    letter-spacing: 0.8px;
    font-weight: 500;
    transition: fill .12s ease;
    pointer-events: none;
  }
  /* Échelle 0–100 au centre — discret, mono petit. Plus contrasté qu'à
     l'origine (0.25 → 0.45) pour rester lisible avec la vignette + halos,
     mais sans ressortir comme un texte principal. */
  .fiche-v2 .mix-radar-scale {
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 10px;
    letter-spacing: 0.8px;
    font-weight: 500;
    fill: rgba(255,255,255,0.45);
    pointer-events: none;
    transition: fill .35s ease, font-size .35s ease;
  }
  .fiche-v2 .mix-radar.is-hovering .mix-radar-scale {
    fill: var(--amber, #f5a623);
    font-size: 13px;
    font-weight: 600;
  }
  /* Polygone constellation : draw-in au mount, puis pulsation très
     douce du stroke (David aime cette respiration globale). */
  .fiche-v2 .mr-poly-anim {
    stroke-dasharray: var(--mr-perim, 600);
    stroke-dashoffset: var(--mr-perim, 600);
    animation: mr-draw-in 1.4s cubic-bezier(.4,0,.2,1) .1s forwards,
               mr-poly-glow 6s ease-in-out 1.5s infinite;
  }
  @keyframes mr-draw-in {
    to { stroke-dashoffset: 0; }
  }
  @keyframes mr-poly-glow {
    0%, 100% { stroke-opacity: 0.55; }
    50%      { stroke-opacity: 0.85; }
  }
  /* Score affiché sur l'axe en cours de highlight (auto-cycle ou hover). */
  .fiche-v2 .mix-radar-axis-score {
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.4px;
    fill: var(--amber, #f5a623);
    pointer-events: none;
    transition: opacity .4s ease;
  }
  /* Respect des préférences accessibilité — désactive draw-in + pulsation. */
  @media (prefers-reduced-motion: reduce) {
    .fiche-v2 .mr-poly-anim {
      animation: none;
      stroke-dashoffset: 0;
    }
  }
  /* Carte détail — bg fully opaque + z-index très élevé pour ne pas
     laisser passer le contenu en dessous (panel "Évolution depuis V1"
     etc.). Anchored à droite pour ne pas déborder vers le chat. */
  .fiche-v2 .mix-radar-detail {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 6px;
    width: 280px;
    max-width: calc(100vw - 60px);
    padding: 12px 14px;
    /* Fond TOTALEMENT opaque (alpha 1) — le 0.98 laissait deviner
       le contenu en arrière-plan sur petits écrans. */
    background:
      linear-gradient(180deg,
        rgb(34, 30, 22) 0%,
        rgb(22, 22, 28) 60%,
        rgb(18, 18, 22) 100%);
    border: 1px solid rgba(245, 166, 35, 0.30);
    border-left: 3px solid var(--amber, #f5a623);
    border-radius: 8px;
    box-shadow:
      0 14px 40px rgba(0, 0, 0, 0.55),
      0 0 24px rgba(245, 166, 35, 0.06);
    /* z-index très haut pour passer au-dessus de tout panel sibling
       (évolution, intention, etc.). */
    z-index: 9999;
    pointer-events: none;
    animation: dsp-fade-in .12s ease-out both;
  }
  .fiche-v2 .mix-radar-detail .mr-detail-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 8px;
  }
  .fiche-v2 .mix-radar-detail .mr-detail-label {
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 10.5px;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: var(--amber, #f5a623);
    font-weight: 500;
  }
  .fiche-v2 .mix-radar-detail .mr-detail-val {
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 12px;
    color: var(--soft, rgba(255,255,255,0.78));
  }
  .fiche-v2 .mix-radar-detail .mr-detail-section + .mr-detail-section {
    margin-top: 6px;
  }
  .fiche-v2 .mix-radar-detail .mr-detail-h {
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 9px;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: var(--muted, rgba(255,255,255,0.5));
    margin-bottom: 2px;
  }
  .fiche-v2 .mix-radar-detail .mr-detail-p {
    font-family: var(--body, 'DM Sans', sans-serif);
    font-size: 12.5px;
    line-height: 1.45;
    color: var(--soft, rgba(255,255,255,0.78));
  }
  /* Layout étroit : ring sur le dessus, radar en dessous (déjà géré
     par .rv-top flex-direction:column dans la media @1100px existante). */
  @media (max-width: 1100px) {
    .fiche-v2 .row-verdict .rv-left .rv-top .mix-radar {
      width: 100%;
      justify-content: center;
    }
    .fiche-v2 .mix-radar-svg { max-width: 220px; }
  }

  /* ─────────────────────────────────────────────────────────────
     MASTER & LOUDNESS — refonte 2026-04-28 v2 (Apple Watch style) :
     3 anneaux concentriques colorés, un par mesure (LUFS / LRA / TP).
     Couleur selon tier de la valeur, fill selon position sur l'échelle.
     ───────────────────────────────────────────────────────────── */
  .dsp-master-rings {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    align-items: start;
    justify-items: center;
    padding: 10px 6px 6px;
  }
  @media (max-width: 580px) {
    .dsp-master-rings { gap: 8px; }
  }
  .dsp-master-rings .ms-ring {
    text-align: center;
    width: 100%;
  }
  .dsp-master-rings .ms-ring-svg {
    width: 100%;
    max-width: 104px;
    height: auto;
    aspect-ratio: 1 / 1;
    overflow: visible;
  }
  /* Anim arc en React state désormais (useAnimatedValue), plus de CSS
     animation pour éviter les replays sur display:none → block. */
  /* Valeur centrale : grosse mono, color injecté inline */
  .dsp-master-rings .ms-ring-num {
    font-family: var(--mono);
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -0.3px;
  }
  .dsp-master-rings .ms-ring-label {
    margin-top: 4px;
    font-family: var(--mono);
    font-size: 9.5px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--muted, #7c7c80);
  }
  .dsp-master-rings .ms-ring-verdict {
    margin-top: 2px;
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 1.3px;
    text-transform: uppercase;
    font-weight: 500;
  }
  /* Caption "Cible : X..Y" — toute petite, mono italique légère, neutre */
  .dsp-master-rings .ms-ring-target {
    margin-top: 4px;
    font-family: var(--mono);
    font-size: 9.5px;
    letter-spacing: 0.5px;
    color: rgba(255,255,255,0.38);
  }
  /* prefers-reduced-motion : non requis ici, useAnimatedValue ne
     déclenche aucune anim CSS. Pour les utilisateurs avec
     reduced-motion on pourrait court-circuiter dans le hook lui-même
     (TODO : checker matchMedia('(prefers-reduced-motion: reduce)')). */

  /* ─────────────────────────────────────────────────────────────
     LEGACY skyline montagneux — abandonné 2026-04-28 v2 mais styles
     conservés pour le composant archivé _DspMasterBlockSkyline.
  .dsp-master-scape .ms-stage {
    position: relative;
    margin: -2px 0 4px;
  }
  .dsp-master-scape .ms-stage-svg {
    width: 100%;
    height: auto;
    display: block;
    overflow: visible;
  }
  /* Hero LUFS : gros chiffre dans le ciel */
  .dsp-master-scape .ms-lufs {
    font-family: var(--mono);
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.5px;
    fill: rgba(255,255,255,0.95);
  }
  .dsp-master-scape .ms-lufs.t-soft     { fill: rgba(195,225,235,0.95); }
  .dsp-master-scape .ms-lufs.t-low      { fill: rgba(245,176,86,0.95); }
  .dsp-master-scape .ms-lufs.t-target   { fill: rgba(245,166,35,1); }
  .dsp-master-scape .ms-lufs.t-critical { fill: rgba(255,140,140,1); }
  .dsp-master-scape .ms-lufs-unit {
    font-family: var(--mono);
    font-size: 9.5px;
    font-weight: 500;
    letter-spacing: 1.5px;
    fill: var(--muted, #7c7c80);
  }
  /* LRA à droite */
  .dsp-master-scape .ms-lra {
    font-family: var(--mono);
    font-size: 22px;
    font-weight: 600;
    fill: rgba(255,255,255,0.85);
  }
  .dsp-master-scape .ms-lra-unit {
    font-size: 11px;
    fill: var(--muted, #7c7c80);
    font-weight: 400;
    letter-spacing: 0.4px;
  }
  .dsp-master-scape .ms-lra-sub {
    font-family: var(--mono);
    font-size: 9.5px;
    font-weight: 500;
    letter-spacing: 1.5px;
    fill: var(--muted, #7c7c80);
  }
  /* True Peak label (au-dessus du ceiling) */
  .dsp-master-scape .ms-tp-label {
    font-family: var(--mono);
    font-size: 9.5px;
    font-weight: 500;
    letter-spacing: 1.4px;
    fill: var(--muted, #7c7c80);
  }
  .dsp-master-scape .ms-tp-label.t-low      { fill: rgba(245,166,35,0.9); }
  .dsp-master-scape .ms-tp-label.t-critical { fill: rgba(255,93,93,1); }
  /* Aurora — pulse subtile */
  .dsp-master-scape .ms-aurora-pulse {
    transform-origin: center;
    transform-box: fill-box;
    animation: ms-aurora-breath 6s ease-in-out infinite;
  }
  @keyframes ms-aurora-breath {
    0%, 100% { opacity: 0.85; transform: scale(1);    }
    50%      { opacity: 1;    transform: scale(1.06); }
  }
  /* Étoiles : twinkle léger */
  .dsp-master-scape .ms-star {
    animation: ms-star-twinkle 4s ease-in-out infinite;
  }
  @keyframes ms-star-twinkle {
    0%, 100% { opacity: 0.35; }
    50%      { opacity: 0.85; }
  }
  /* Mountains : parallax horizontal très lent */
  .dsp-master-scape .ms-mtn-near {
    animation: ms-parallax-near 38s linear infinite;
    transform-origin: center;
    transform-box: fill-box;
  }
  .dsp-master-scape .ms-mtn-far {
    animation: ms-parallax-far 65s linear infinite;
    transform-origin: center;
    transform-box: fill-box;
  }
  @keyframes ms-parallax-near {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-3%); }
  }
  @keyframes ms-parallax-far {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-1.5%); }
  }
  /* True Peak ligne critique : pulse rouge si > 0 dBTP */
  .dsp-master-scape .ms-tp-line.ms-tp-critical {
    animation: ms-tp-pulse 1.6s ease-in-out infinite;
  }
  @keyframes ms-tp-pulse {
    0%, 100% { stroke-opacity: 0.55; stroke-width: 1; }
    50%      { stroke-opacity: 1;    stroke-width: 1.4; }
  }
  @media (prefers-reduced-motion: reduce) {
    .dsp-master-scape .ms-aurora-pulse,
    .dsp-master-scape .ms-star,
    .dsp-master-scape .ms-mtn-near,
    .dsp-master-scape .ms-mtn-far,
    .dsp-master-scape .ms-tp-line {
      animation: none;
    }
  }

  /* ─────────────────────────────────────────────────────────────
     DSP_PLAN A.1 + A.2 — Visuels MASTER & LOUDNESS (LEGACY,
     conservés pour rollback ou si on revient à l'ancien design)
     LoudnessMeter (barre 6px, 4 zones, curseur ambre + valeur mono)
     + DspMiniCard (LRA / True Peak, kicker mono caps + grosse valeur)
     Couleurs : amber pour cible, muted pour neutre, rouge subtle
     pour critique seulement. Pas de barres mint→rouge AubioMix.
     ───────────────────────────────────────────────────────────── */

  .dsp-master-block {
    margin: 4px 0 18px;
    padding: 14px 14px 12px;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    background: rgba(255,255,255,0.02);
    box-shadow: 0 0 12px rgba(245,176,86,0.04);
    animation: dsp-fade-in .15s ease-out both;
  }
  @keyframes dsp-fade-in {
    from { opacity: 0; transform: translateY(2px); }
    to   { opacity: 1; transform: translateY(0);   }
  }

  /* ── Loudness meter ─────────────────────────────────────────── */
  .dsp-loudness {
    position: relative;
    padding: 22px 4px 26px;
  }
  .dsp-loudness-track {
    display: flex;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    background: rgba(255,255,255,0.04);
  }
  .dsp-loudness-track .dsp-zone {
    height: 100%;
    border-right: 1px solid rgba(0,0,0,0.4);
  }
  .dsp-loudness-track .dsp-zone:last-child { border-right: none; }
  .dsp-loudness-track .z-soft      { background: rgba(255,255,255,0.06); }
  .dsp-loudness-track .z-streaming { background: rgba(245,166,35,0.18); }
  .dsp-loudness-track .z-target    { background: rgba(245,166,35,0.42); }
  .dsp-loudness-track .z-critical  { background: rgba(255,93,93,0.22); }

  .dsp-loudness-cursor {
    position: absolute;
    top: 0;
    bottom: 14px;
    transform: translateX(-50%);
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--amber, #f5a623);
  }
  .dsp-loudness-cursor .dsp-loudness-value {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.4px;
    color: currentColor;
    margin-bottom: 4px;
    white-space: nowrap;
  }
  .dsp-loudness-cursor .dsp-loudness-line {
    width: 2px;
    flex: 1;
    background: currentColor;
    border-radius: 1px;
    box-shadow: 0 0 6px currentColor;
    opacity: 0.95;
  }

  .dsp-loudness-ticks {
    position: absolute;
    left: 4px;
    right: 4px;
    bottom: 6px;
    height: 12px;
    pointer-events: none;
  }
  .dsp-loudness-ticks span {
    position: absolute;
    transform: translateX(-50%);
    font-family: var(--mono);
    font-size: 9.5px;
    letter-spacing: 0.5px;
    color: var(--muted, #7c7c80);
    opacity: 0.65;
  }

  .dsp-loudness-verdict {
    margin-top: 6px;
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    text-align: right;
  }

  /* ── Mini-cards row (LRA + TruePeak) ───────────────────────── */
  .dsp-mini-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 6px;
  }
  @media (max-width: 600px) {
    .dsp-mini-row { grid-template-columns: 1fr; }
  }

  .dsp-mini-card {
    padding: 10px 12px 12px;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    background: rgba(255,255,255,0.015);
  }
  .dsp-mini-card .dsp-mini-kicker {
    font-family: var(--mono);
    font-size: 9.5px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--muted, #7c7c80);
    margin-bottom: 6px;
  }
  .dsp-mini-card .dsp-mini-value {
    font-family: var(--mono);
    font-size: 22px;
    font-weight: 500;
    line-height: 1;
    color: var(--amber, #f5a623);
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 10px;
  }
  .dsp-mini-card .dsp-mini-unit {
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.5px;
    color: var(--muted, #7c7c80);
  }
  .dsp-mini-card .dsp-mini-track {
    position: relative;
    display: flex;
    height: 4px;
    border-radius: 2px;
    overflow: visible;
    background: rgba(255,255,255,0.04);
    margin-bottom: 6px;
  }
  .dsp-mini-card .dsp-mini-zone {
    height: 4px;
    border-right: 1px solid rgba(0,0,0,0.4);
  }
  .dsp-mini-card .dsp-mini-zone:last-child { border-right: none; }
  .dsp-mini-card .dsp-mini-zone.t-target   { background: rgba(245,166,35,0.42); }
  .dsp-mini-card .dsp-mini-zone.t-low      { background: rgba(245,166,35,0.18); }
  .dsp-mini-card .dsp-mini-zone.t-soft     { background: rgba(255,255,255,0.06); }
  .dsp-mini-card .dsp-mini-zone.t-critical { background: rgba(255,93,93,0.22); }
  .dsp-mini-card .dsp-mini-cursor {
    position: absolute;
    top: -3px;
    bottom: -3px;
    width: 2px;
    transform: translateX(-50%);
    background: currentColor;
    border-radius: 1px;
    box-shadow: 0 0 6px currentColor;
    pointer-events: none;
  }
  .dsp-mini-card .dsp-mini-verdict {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 1.4px;
    text-transform: uppercase;
  }

  /* ─────────────────────────────────────────────────────────────
     DSP_PLAN C.1 — Voix (refonte 2026-04-28 — jauge delta unique)
     Une seule jauge horizontale ±6 LU avec zone cible verte centrale
     (−3/+3 LU). Curseur avec la valeur du delta. Verdict gros en haut.
     Message instantané : "ma voix est-elle bien placée ?"
     ───────────────────────────────────────────────────────────── */
  .dsp-voice-block {
    padding: 16px 16px 14px;
  }
  /* Verdict — message principal, plus contenu qu'avant */
  .dsp-voice-block .vv-verdict {
    text-align: center;
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 18px;
  }
  /* Jauge — padding-top augmenté pour que la valeur 20px + la flèche
     tiennent au-dessus de la barre sans chevaucher. */
  .dsp-voice-block .vv-gauge {
    position: relative;
    padding: 38px 4px 22px;
  }
  .dsp-voice-block .vv-track {
    display: flex;
    height: 10px;
    border-radius: 5px;
    overflow: hidden;
    background: rgba(255,255,255,0.04);
  }
  /* 3 zones colorées : 25% rouge / 50% mint / 25% rouge */
  .dsp-voice-block .vv-zone-bad-low {
    flex: 0 0 25%;
    background: linear-gradient(90deg, rgba(255,93,93,0.20), rgba(255,93,93,0.30));
  }
  .dsp-voice-block .vv-zone-target {
    flex: 0 0 50%;
    background: rgba(142,224,122,0.42);
    border-left: 1px solid rgba(0,0,0,0.4);
    border-right: 1px solid rgba(0,0,0,0.4);
  }
  .dsp-voice-block .vv-zone-bad-high {
    flex: 0 0 25%;
    background: linear-gradient(90deg, rgba(255,93,93,0.30), rgba(255,93,93,0.20));
  }
  /* Valeur nette au-dessus de la jauge — plus grosse pour rester
     dominante comme les chiffres hero de stéréo (22px) et master (17px).
     Mono weight 600, sans halo. */
  .dsp-voice-block .vv-cursor-value {
    position: absolute;
    top: 4px;
    transform: translateX(-50%);
    font-family: var(--mono);
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.2px;
    color: currentColor;
    white-space: nowrap;
    pointer-events: none;
  }
  /* Flèche ▼ qui mord légèrement sur la barre (top 33 → tip à 42,
     soit 4px à l'intérieur de la barre qui démarre à 38). Plus
     visible aussi : borders 7+10. */
  .dsp-voice-block .vv-cursor-arrow {
    position: absolute;
    top: 33px;
    width: 0;
    height: 0;
    transform: translateX(-50%);
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-top: 10px solid currentColor;
    pointer-events: none;
    z-index: 2;
  }
  /* Graduations -6/-3/0/+3/+6 LU sous la jauge */
  .dsp-voice-block .vv-ticks {
    position: relative;
    height: 14px;
    margin-top: 8px;
  }
  .dsp-voice-block .vv-ticks span {
    position: absolute;
    transform: translateX(-50%);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.5px;
    color: rgba(255,255,255,0.32);
  }
  /* Légende sous la jauge : 3 labels alignés sur les zones */
  .dsp-voice-block .vv-legend {
    margin-top: 10px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0;
    font-family: var(--mono);
    font-size: 9.5px;
    letter-spacing: 1.3px;
    text-transform: uppercase;
  }
  .dsp-voice-block .vv-legend-l {
    text-align: left;
    color: rgba(255,93,93,0.7);
  }
  .dsp-voice-block .vv-legend-c {
    text-align: center;
    color: rgba(142,224,122,0.85);
    font-weight: 500;
  }
  .dsp-voice-block .vv-legend-r {
    text-align: right;
    color: rgba(255,93,93,0.7);
  }
  /* Détails techniques en bas (LUFS exacts) — pour les power users */
  .dsp-voice-block .vv-details {
    margin-top: 8px;
    text-align: center;
    font-family: var(--mono);
    font-size: 9.5px;
    letter-spacing: 0.5px;
    color: rgba(255,255,255,0.32);
  }
  /* ─────────────────────────────────────────────────────────────
     LEGACY voice block (avant refonte — 2 jauges stackées). Conservé
     au cas où on revient en arrière.
  .dsp-voice-block .dsp-voice-row {
    display: grid;
    grid-template-columns: 56px 1fr 90px;
    align-items: center;
    gap: 10px;
  }
  .dsp-voice-block .dsp-voice-label {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--muted, #7c7c80);
    font-weight: 500;
  }
  .dsp-voice-block .dsp-voice-bar {
    position: relative;
    height: 6px;
    border-radius: 3px;
    background: rgba(255,255,255,0.04);
    overflow: visible;
  }
  .dsp-voice-block .dsp-voice-fill {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(90deg,
      rgba(245,166,35,0.18) 0%,
      rgba(245,166,35,0.42) 100%);
    transition: width .2s ease-out;
  }
  .dsp-voice-block .dsp-voice-cursor {
    position: absolute;
    top: -3px;
    bottom: -3px;
    width: 2px;
    transform: translateX(-50%);
    background: var(--amber, #f5a623);
    border-radius: 1px;
    box-shadow: 0 0 6px var(--amber, #f5a623);
    pointer-events: none;
  }
  .dsp-voice-block .dsp-voice-value {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.4px;
    color: var(--soft, rgba(255,255,255,0.78));
    text-align: right;
    white-space: nowrap;
  }
  /* Range de delta entre les deux jauges : ligne fine + badge centre. */
  .dsp-voice-block .dsp-voice-delta-row {
    display: grid;
    grid-template-columns: 56px 1fr 90px;
    align-items: center;
    gap: 10px;
    margin: 6px 0;
    position: relative;
  }
  .dsp-voice-block .dsp-voice-delta-row .dsp-voice-delta-line {
    grid-column: 2;
    grid-row: 1;
    height: 1px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(255,255,255,0.06) 50%,
      transparent 100%);
    align-self: center;
  }
  .dsp-voice-block .dsp-voice-delta-badge {
    grid-column: 2;
    grid-row: 1;
    justify-self: center;
    z-index: 1;
    padding: 2px 8px;
    background: rgba(20,20,22,0.95);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 999px;
    font-family: var(--mono);
    font-size: 10.5px;
    letter-spacing: 0.5px;
    color: currentColor;
  }
  .dsp-voice-block .dsp-voice-verdict {
    margin-top: 10px;
    font-family: var(--mono);
    font-size: 10.5px;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    text-align: right;
    font-weight: 500;
  }
  @media (max-width: 600px) {
    .dsp-voice-block .dsp-voice-row,
    .dsp-voice-block .dsp-voice-delta-row {
      grid-template-columns: 48px 1fr 78px;
      gap: 8px;
    }
    .dsp-voice-block .dsp-voice-value { font-size: 10.5px; }
  }

  /* ─────────────────────────────────────────────────────────────
     DSP_PLAN C.2 — Stereo field (refonte 2026-04-28)
     HERO : arène stéréo SVG (nuage radial qui respire) + 3 mini-cards
     en row dessous (WIDTH, MONO COMPAT, CORR L/R).
     Cohérent avec A.1 LoudnessMeter et A.2 mini-cards.
     ───────────────────────────────────────────────────────────── */
  .dsp-stereo-block { padding: 14px 14px 12px; }

  /* HERO stage stéréo (refonte radicale 2026-04-28) — blob lava-lamp
     gooey qui morphe en continu, avec typographie hero en dessous.
     La card extérieure reste neutre, seul le rectangle intérieur du
     SVG (la zone qui contient L, R et le blob) reçoit un fond
     ambient warm→cool. */
  .dsp-stereo-stage {
    position: relative;
    margin: 4px 0 8px;
    text-align: center;
  }
  .dsp-stereo-stage-svg {
    width: 100%;
    max-width: 540px;
    height: auto;
    display: block;
    margin: 0 auto;
    overflow: visible;
  }
  .dsp-stereo-stage .ss-stage-channel {
    font-family: var(--mono);
    font-size: 16px;
    letter-spacing: 2px;
    font-weight: 600;
    fill: rgba(255,255,255,0.45);
    pointer-events: none;
  }
  .dsp-stereo-stage .ss-stage-balance {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 1.4px;
    font-weight: 500;
    text-transform: uppercase;
    fill: var(--muted, #7c7c80);
    pointer-events: none;
  }
  /* Balance text en HTML sous le SVG (sortie du viewBox pour éviter les
     chevauchements avec le blob quand on réduit la hauteur). */
  .dsp-stereo-stage-balance {
    margin-top: 4px;
    text-align: center;
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: var(--muted, #7c7c80);
  }
  /* Drift par particule — chaque point translate dans un petit
     pattern et oscille en opacité. Delay/duration injectés inline
     depuis le JSX → chaque particule bouge à son rythme, le nuage
     se mélange organiquement (effet "matière vivante"). */
  .dsp-stereo-stage .ss-particle {
    transform-origin: center;
    transform-box: fill-box;
    animation-name: ss-particle-drift;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
  }
  @keyframes ss-particle-drift {
    0%, 100% { transform: translate(0, 0);    opacity: 0.85; }
    25%      { transform: translate(3px, -2.5px);  opacity: 1;    }
    50%      { transform: translate(-2.5px, -2px); opacity: 0.75; }
    75%      { transform: translate(-2px, 2.5px);  opacity: 0.92; }
  }
  /* Ticks de balance (-6, -3, +3, +6 dB) sous le nuage */
  .dsp-stereo-stage .ss-stage-tick-label {
    font-family: var(--mono);
    font-size: 8.5px;
    letter-spacing: 0.5px;
    fill: rgba(255,255,255,0.32);
    pointer-events: none;
  }
  .dsp-stereo-stage .ss-stage-tick-center {
    fill: rgba(255,255,255,0.45);
    font-weight: 500;
  }
  @media (prefers-reduced-motion: reduce) {
    .dsp-stereo-stage .ss-particle { animation: none; }
  }

  /* HERO TYPOGRAPHIQUE — 3 chiffres en row, plus de cards, plus
     d'encadrés. Juste de la grosse typo bien alignée avec un kicker
     mono caps + un verdict. Les 3 stats partagent l'horizontal. */
  .dsp-stereo-stats {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 6px;
    margin-top: 14px;
    padding: 10px 0 4px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  @media (max-width: 640px) {
    .dsp-stereo-stats { grid-template-columns: 1fr 1fr; row-gap: 16px; }
  }
  @media (max-width: 420px) {
    .dsp-stereo-stats { grid-template-columns: 1fr; row-gap: 14px; }
  }
  .dsp-stereo-stats .ss-stat {
    text-align: center;
    padding: 4px 6px;
  }
  .dsp-stereo-stats .ss-stat-num {
    font-family: var(--mono);
    font-size: 22px;
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.3px;
    margin-bottom: 5px;
    transition: color 0.4s ease, text-shadow 0.4s ease;
  }
  .dsp-stereo-stats .ss-stat-unit {
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.4px;
    margin-left: 2px;
    color: var(--muted, #7c7c80);
  }
  .dsp-stereo-stats .ss-stat-kicker {
    font-family: var(--mono);
    font-size: 9.5px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--muted, #7c7c80);
    margin-bottom: 3px;
  }
  .dsp-stereo-stats .ss-stat-verdict {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 1.3px;
    text-transform: uppercase;
    font-weight: 500;
  }
  /* Caption "Cible : X..Y" sous chaque stat — neutre, mono petit. */
  .dsp-stereo-stats .ss-stat-target {
    margin-top: 6px;
    font-family: var(--mono);
    font-size: 9.5px;
    letter-spacing: 0.5px;
    color: rgba(255,255,255,0.38);
  }
  /* Couleurs par tier (target/low/critical/soft) */
  .dsp-stereo-stats .ss-stat.t-target .ss-stat-num,
  .dsp-stereo-stats .ss-stat.t-target .ss-stat-verdict {
    color: rgb(142, 224, 122);
    text-shadow: 0 0 18px rgba(142, 224, 122, 0.25);
  }
  .dsp-stereo-stats .ss-stat.t-low .ss-stat-num,
  .dsp-stereo-stats .ss-stat.t-low .ss-stat-verdict {
    color: var(--amber, #f5a623);
    text-shadow: 0 0 18px rgba(245, 166, 35, 0.28);
  }
  .dsp-stereo-stats .ss-stat.t-critical .ss-stat-num,
  .dsp-stereo-stats .ss-stat.t-critical .ss-stat-verdict {
    color: rgb(255, 93, 93);
    text-shadow: 0 0 18px rgba(255, 93, 93, 0.30);
  }
  .dsp-stereo-stats .ss-stat.t-soft .ss-stat-num,
  .dsp-stereo-stats .ss-stat.t-soft .ss-stat-verdict {
    color: rgba(255, 255, 255, 0.55);
  }

  /* Balance bar — réplique la grammaire du LoudnessMeter (A.1) */
  .dsp-balance {
    position: relative;
    padding: 22px 4px 30px;
    margin-bottom: 4px;
  }
  .dsp-balance-track {
    display: flex;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    background: rgba(255,255,255,0.04);
  }
  .dsp-balance-track .dsp-balance-zone {
    height: 100%;
  }
  /* Échelle ±6 dB → zone centrale ±0.5 dB = 8.3% chacun → 16.6% total */
  .dsp-balance-track .z-soft {
    flex: 1 1 auto;
    background: rgba(255,255,255,0.06);
  }
  .dsp-balance-track .z-target {
    flex: 0 0 8.3%;
    background: rgba(245,166,35,0.42);
    border-left: 1px solid rgba(0,0,0,0.4);
    border-right: 1px solid rgba(0,0,0,0.4);
  }
  .dsp-balance-cursor {
    position: absolute;
    top: 0;
    bottom: 18px;
    transform: translateX(-50%);
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--amber, #f5a623);
  }
  .dsp-balance-cursor .dsp-balance-value {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.4px;
    color: currentColor;
    margin-bottom: 4px;
    white-space: nowrap;
  }
  .dsp-balance-cursor .dsp-balance-line {
    width: 2px;
    flex: 1;
    background: currentColor;
    border-radius: 1px;
    box-shadow: 0 0 6px currentColor;
    opacity: 0.95;
  }
  /* Ticks L · R en bas de la barre */
  .dsp-balance-ticks {
    position: absolute;
    left: 4px;
    right: 4px;
    bottom: 10px;
    height: 12px;
    pointer-events: none;
  }
  .dsp-balance-ticks span {
    position: absolute;
    transform: translateX(-50%);
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 1.4px;
    color: var(--muted, #7c7c80);
    opacity: 0.75;
  }
  /* Verdict centré (ex: "centré", "légèrement à gauche") */
  .dsp-balance-verdict {
    margin-top: 4px;
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    text-align: center;
    color: var(--muted, #7c7c80);
  }

  /* 3 mini-cards en row (override du grid 2-col par défaut de .dsp-mini-row) */
  .dsp-stereo-block .dsp-stereo-mini-row {
    grid-template-columns: 1fr 1fr 1fr;
  }
  @media (max-width: 700px) {
    .dsp-stereo-block .dsp-stereo-mini-row {
      grid-template-columns: 1fr 1fr;
    }
  }
  @media (max-width: 480px) {
    .dsp-stereo-block .dsp-stereo-mini-row {
      grid-template-columns: 1fr;
    }
  }
`}</style>
    </>
  );
}
