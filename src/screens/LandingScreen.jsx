import { useEffect } from 'react';
import T from '../constants/theme';
import useLang from '../hooks/useLang';
import LangDropdown from '../components/LangDropdown';
import HamburgerMenu, { NavIcons } from '../components/HamburgerMenu';

/**
 * LandingScreen — page de présentation accessible aux visiteurs ET aux
 * utilisateurs connectés (via `#/home`). Fusionne tickets 1.2 (méthodologie
 * "comment on évalue") et 3.1 (landing publique) en sections scrollables.
 *
 * Visiteur non connecté → onStart bascule vers AuthScreen.
 * Utilisateur connecté → onStart renvoie sur le dashboard ; les libellés des
 * CTAs peuvent être surchargés via ctaPrimaryLabel / ctaFooterLabel sinon
 * c'est `s.landing.ctaPrimary` / `s.landing.ctaFooter` qui s'appliquent
 * (et basculent FR/EN selon `useLang`).
 */
export default function LandingScreen({
  onStart,
  onViewSample,
  onViewPricing,
  onViewDashboard,
  ctaPrimaryLabel,
  ctaFooterLabel,
  isAuthenticated = false,
  // ─── Props utilitaires (utilisateur connecté) — rapatriées dans le
  //     hamburger : crédits/abonnement en footer + admin/réglages/
  //     signout en section utility. Tous facultatifs : si non passés,
  //     le hamburger ne montre que la nav publique.
  credits = null,
  planLabel = null,
  isAdmin = false,
  onGoAdmin = null,
  onGoReglages = null,
  onSignOut = null,
}) {
  const { s, lang, setLang } = useLang();
  const lp = s.landing;
  const ctaPrimary = ctaPrimaryLabel || lp.ctaPrimary;
  const ctaFooter = ctaFooterLabel || lp.ctaFooter;
  const utilityItems = [
    ...(isAdmin && onGoAdmin ? [{ key: 'admin', label: 'Admin', icon: NavIcons.admin, onSelect: onGoAdmin }] : []),
    ...(onGoReglages ? [{ key: 'reglages', label: s.sidebar?.reglages || 'Réglages', icon: NavIcons.settings, onSelect: onGoReglages }] : []),
    ...(onSignOut ? [{ key: 'signout', label: s.sidebar?.signOut || 'Se déconnecter', icon: NavIcons.signOut, onSelect: onSignOut, danger: true }] : []),
  ];

  // ── Animations d'entrée au scroll ────────────────────────────────
  // Même mécanique que sur le pricing : un IntersectionObserver
  // ajoute la classe .lp-anim-in aux .lp-anim quand ils entrent dans
  // le viewport (à 15% de profondeur). One-shot via unobserve.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const els = document.querySelectorAll('.lp-anim');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('lp-anim-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -15% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="landing-screen">
      <LandingStyles />

      {/* TOPBAR — logo VERSiONS en haut à gauche, nav + switch FR/EN à droite.
          Calé sur le topbar de la page Tarifs (mêmes tailles : logo 38px,
          wordmark 27px, padding 22px 18px) pour que les deux écrans publics
          aient une identité strictement identique en haut de page. */}
      <header className="lp-topbar">
        <div className="lp-topbar-brand">
          <img src="/logo-versions-2.svg" alt="" className="lp-topbar-logo" />
          <span className="lp-topbar-wordmark">
            VER<span className="accent">Si</span>ONS
          </span>
        </div>
        <nav className="lp-topbar-nav" aria-label="Navigation">
          {/* Desktop : nav texte (Accueil/Tarifs/Tableau de bord). Mobile :
              le hamburger prend le relais via media query (cf. CSS). */}
          <span className="lp-topbar-current" aria-current="page">Accueil</span>
          {onViewPricing && (
            <button
              type="button"
              className="lp-topbar-link"
              onClick={onViewPricing}
              aria-label="Voir les tarifs"
            >
              Tarifs
            </button>
          )}
          {onViewDashboard && (
            <button
              type="button"
              className="lp-topbar-link"
              onClick={onViewDashboard}
              aria-label={isAuthenticated ? s.sidebar.dashboardLink : s.sidebar.signInLink}
            >
              {isAuthenticated ? s.sidebar.dashboardLink : s.sidebar.signInLink}
            </button>
          )}
          {/* Hamburger menu — visible uniquement en mobile (CSS gating).
              Contient nav + utilitaires + crédits/abonnement (refonte
              2026-04-30 v3). */}
          <HamburgerMenu
            items={[
              { key: 'home', label: 'Accueil', icon: NavIcons.home, current: true },
              ...(onViewPricing ? [{ key: 'pricing', label: 'Tarifs', icon: NavIcons.pricing, onSelect: onViewPricing }] : []),
              ...(onViewDashboard ? [{
                key: 'dashboard',
                label: isAuthenticated ? s.sidebar.dashboardLink : s.sidebar.signInLink,
                icon: NavIcons.dashboard,
                onSelect: onViewDashboard,
              }] : []),
            ]}
            utilityItems={utilityItems}
            credits={credits}
            planLabel={planLabel}
            onPlanClick={onViewPricing}
          />
          <LangDropdown lang={lang} setLang={setLang} />
        </nav>
      </header>

      {/* HERO */}
      <header className="lp-hero">
        <div className="lp-hero-inner">
          {/* Mockup produit v3 — Constellation de chips.
              Petits éléments décoratifs qui évoquent le langage produit
              (score, action, plugin pick, évolution, intention) sans
              simuler d'UI. Aérien, abstrait, reconnaissable. Pas de
              container fiche, pas de bulles de chat — juste des fragments
              flottants disposés en cluster organique. */}
          <div className="lp-hero-mock" aria-hidden="true">
            <span className="lp-chip lp-chip-score">{lp.chip1}</span>
            <span className="lp-chip lp-chip-tag">{lp.chip2}</span>
            <span className="lp-chip lp-chip-diag">{lp.chip3}</span>
            <span className="lp-chip lp-chip-plugin">{lp.chip4}</span>
            <span className="lp-chip lp-chip-evo">{lp.chip5}</span>
            <span className="lp-chip lp-chip-intent">{lp.chip6}</span>
            <span className="lp-chip lp-chip-bass">{lp.chip7}</span>
          </div>

          <h1 className="lp-slogan">
            <span className="lp-slogan-line">{lp.sloganPart1} <em>{lp.sloganEm}</em></span><br />{lp.sloganPart2}
          </h1>
          <div className="lp-tagline-trio">
            {lp.taglineBefore} <em>{lp.taglineEm}</em>{lp.taglineAfter}
          </div>
          <p className="lp-hero-sub">{lp.heroSub}</p>

          {/* Badge "Première analyse offerte" — visiteurs non connectés
              uniquement. Posé juste au-dessus du CTA primaire pour lever
              la friction "ça coûte combien ?" avant le clic. Style chip
              pill amber-tinted, mono uppercase, légère rotation -1.5° et
              pulse subtil sur le dot pour attirer l'œil sans agresser. */}
          {!isAuthenticated && (
            <div className="lp-free-badge" role="status" aria-label={lp.freeFirstBadge}>
              {lp.freeFirstBadge}
            </div>
          )}

          <div className="lp-cta-row">
            <button type="button" onClick={onStart} className="lp-cta-primary">
              {ctaPrimary}
            </button>
            {onViewSample && (
              <button type="button" onClick={onViewSample} className="lp-cta-secondary">
                {lp.ctaSample}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="lp-divider" />

      {/* CE QUI NOUS REND DIFFÉRENTS — cards "stickers" :
          - rotation subtile (-1° / +1° / -1.5° / +1.5°) pour casser le grid Excel
          - numérotation 01-04 via CSS counter (mono amber dimmé)
          - halo color déjà en place, intensifié au hover
          - icônes conservées (David : "j'aime bien")
          - stagger d'entrée via .lp-anim + --anim-d */}
      <section className="lp-section">
        <div className="lp-section-eyebrow lp-anim">{lp.diffEyebrow}</div>
        <h2 className="lp-section-title lp-anim" style={{ '--anim-d': '60ms' }}>
          {lp.diffTitleStart} <em>{lp.diffTitleEm}</em>
        </h2>

        <div className="lp-diff-grid">
          <article className="lp-diff-card lp-diff-amber lp-anim" style={{ '--anim-d': '160ms' }}>
            <div className="lp-diff-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </div>
            <h3 className="lp-diff-title">{lp.diffCard1Title}</h3>
            <p className="lp-diff-body">{lp.diffCard1Body}</p>
          </article>

          <article className="lp-diff-card lp-diff-cerulean lp-anim" style={{ '--anim-d': '240ms' }}>
            <div className="lp-diff-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <h3 className="lp-diff-title">{lp.diffCard2Title}</h3>
            <p className="lp-diff-body">
              {lp.diffCard2BodyBefore}<em>{lp.diffCard2BodyEm}</em>{lp.diffCard2BodyAfter}
            </p>
          </article>

          <article className="lp-diff-card lp-diff-violet lp-anim" style={{ '--anim-d': '320ms' }}>
            <div className="lp-diff-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <h3 className="lp-diff-title">{lp.diffCard3Title}</h3>
            <p className="lp-diff-body">{lp.diffCard3Body}</p>
          </article>

          <article className="lp-diff-card lp-diff-mint lp-anim" style={{ '--anim-d': '400ms' }}>
            <div className="lp-diff-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h4l3-9 4 18 3-9h4"/>
              </svg>
            </div>
            <h3 className="lp-diff-title">{lp.diffCard4Title}</h3>
            <p className="lp-diff-body">{lp.diffCard4Body}</p>
          </article>
        </div>
      </section>

      <div className="lp-divider" />

      {/* CE QU'ON ANALYSE */}
      <section className="lp-section lp-section-axes">
        <div className="lp-section-eyebrow lp-anim">{lp.axesEyebrow}</div>
        <h2 className="lp-section-title lp-anim" style={{ '--anim-d': '60ms' }}>
          {lp.axesTitleStart} <em>{lp.axesTitleEm}</em>
        </h2>
        <p className="lp-section-lede lp-anim" style={{ '--anim-d': '120ms' }}>{lp.axesLede}</p>

        <div className="lp-axes-grid">
          <AxeCard num="01" label={lp.axe1Label} desc={lp.axe1Desc} tone="amber" pos="tl" />
          <AxeCard num="02" label={lp.axe2Label} desc={lp.axe2Desc} tone="mint" pos="br" />
          <AxeCard num="03" label={lp.axe3Label} desc={lp.axe3Desc} tone="cerulean" pos="tr" />
          <AxeCard num="04" label={lp.axe4Label} desc={lp.axe4Desc} tone="violet" pos="bl" />
          <AxeCard num="05" label={lp.axe5Label} desc={lp.axe5Desc} tone="amber" pos="br" />
          <AxeCard num="06" label={lp.axe6Label} desc={lp.axe6Desc} tone="cerulean" pos="bl" />
        </div>
      </section>

      <div className="lp-divider" />

      {/* CE QU'ON NE FAIT PAS */}
      <section className="lp-section lp-section-tight">
        <div className="lp-section-eyebrow lp-anim">{lp.nopeEyebrow}</div>
        <h2 className="lp-section-title lp-anim" style={{ '--anim-d': '60ms' }}>
          <em>{lp.nopeTitleEm}</em>{lp.nopeTitleAfter}
        </h2>

        <div className="lp-nope-grid">
          <div className="lp-nope-item lp-nope-amber lp-anim" style={{ '--anim-d': '160ms' }}>
            <span className="lp-nope-mark" aria-hidden="true">×</span>
            <p>{lp.nope1}</p>
          </div>
          <div className="lp-nope-item lp-nope-cerulean lp-anim" style={{ '--anim-d': '240ms' }}>
            <span className="lp-nope-mark" aria-hidden="true">×</span>
            <p>{lp.nope2}</p>
          </div>
          <div className="lp-nope-item lp-nope-violet lp-anim" style={{ '--anim-d': '320ms' }}>
            <span className="lp-nope-mark" aria-hidden="true">×</span>
            <p>{lp.nope3}</p>
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* FOOTER CTA */}
      <footer className="lp-footer">
        <h2 className="lp-footer-quote">
          {lp.footerQuoteStart} <em>{lp.footerQuoteEm}</em><br />
          {lp.footerQuoteEnd}
        </h2>
        <button type="button" onClick={onStart} className="lp-cta-primary lp-cta-footer">
          {ctaFooter}
        </button>
        <div className="lp-footer-mark">
          <img src="/logo-versions-2.svg" alt="" className="lp-footer-mark-img" />
          <span className="lp-footer-mark-text">
            {'VER'}<span className="accent">{'Si'}</span>{'ONS'}
          </span>
        </div>
      </footer>
    </div>
  );
}

function AxeCard({ num, label, desc, tone = 'amber', pos = 'tr' }) {
  return (
    <div className={`lp-axe-card lp-axe-${tone} lp-axe-pos-${pos} lp-anim`}>
      <div className="lp-axe-num">{num}</div>
      <div className="lp-axe-body">
        <div className="lp-axe-label">{label}</div>
        <div className="lp-axe-desc">{desc}</div>
      </div>
    </div>
  );
}

function LandingStyles() {
  return (
    <style>{`
      .landing-screen {
        position: relative; z-index: 1;
        min-height: 100vh; min-height: 100dvh;
        /* Background continu : .ambient-halo global (3 calques crossfading
           en 95s) + .va-bg-orbs global (3 orbes color drift 50s) montés
           tous les deux sur body. Persistent à travers les changements
           de page → cohérence visuelle landing/pricing/dashboard. */
        background: transparent;
        color: var(--text, ${T.text});
        font-family: var(--body, ${T.body});
        overflow-x: hidden;
      }

      /* ── ANIMATIONS D'ENTRÉE AU SCROLL ────────────────────────────
         Classe ajoutée par l'IntersectionObserver côté JS quand
         l'élément entre dans le viewport (à 15% de profondeur).
         Fade-up doux, stagger possible via la CSS var --anim-d. */
      .lp-anim {
        opacity: 0;
        transform: translateY(14px);
        transition:
          opacity .55s cubic-bezier(.2,.7,.3,1),
          transform .55s cubic-bezier(.2,.7,.3,1);
        transition-delay: var(--anim-d, 0ms);
        will-change: opacity, transform;
      }
      .lp-anim.lp-anim-in {
        opacity: 1;
        transform: none;
      }
      @media (prefers-reduced-motion: reduce) {
        .lp-anim {
          opacity: 1 !important;
          transform: none !important;
          transition: none !important;
        }
      }

      /* TOPBAR — calé sur le topbar de la page Tarifs (PricingScreen) :
         logo 38px, wordmark 27px, padding 22px 18px, full-width côté gauche
         pour que le brand soit collé au bord gauche du viewport (comme la
         sidebar du dashboard). */
      .lp-topbar {
        position: relative; z-index: 2;
        padding: 22px 18px;
        display: flex; align-items: center; justify-content: space-between;
        gap: 24px;
      }
      .lp-topbar-brand {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 0;
      }
      .lp-topbar-logo {
        height: 38px; width: auto;
        filter: drop-shadow(0 0 16px rgba(245,166,35,0.18));
      }
      .lp-topbar-wordmark {
        font-family: ${T.body}; font-weight: 700;
        font-size: 27px; letter-spacing: -0.5px;
        color: ${T.text}; line-height: 1;
      }
      .lp-topbar-wordmark .accent, .lp-footer-mark .accent {
        color: ${T.amber}; font-style: normal;
      }
      .lp-topbar-nav { display: inline-flex; align-items: center; gap: 8px; }
      .lp-topbar-link, .lp-topbar-current {
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 1.6px; text-transform: uppercase;
        padding: 9px 16px; border-radius: 999px;
        transition: all .15s;
      }
      .lp-topbar-link {
        background: transparent; color: ${T.textSoft};
        border: 1px solid transparent; cursor: pointer;
      }
      .lp-topbar-link:hover {
        color: ${T.text};
        background: rgba(255,255,255,0.04);
        border-color: rgba(255,255,255,0.10);
      }
      .lp-topbar-current {
        color: ${T.amber};
        background: rgba(245,166,35,0.06);
        border: 1px solid rgba(245,166,35,0.32);
      }
      /* Mobile / petit desktop — calé sur le pattern .pr-topbar /
         .sample-brand : logo 28px / wordmark 22px (format mobile éprouvé).
         On masque le badge "Accueil" current : c'est redondant car on
         est sur cette page. */
      @media (max-width: 720px) {
        .lp-topbar { padding: 16px 14px; gap: 12px; }
        .lp-topbar-wordmark { font-size: 22px; letter-spacing: -0.4px; }
        .lp-topbar-logo { height: 28px; }
        .lp-topbar-nav { gap: 6px; }
        .lp-topbar-current { display: none; }
      }
      @media (max-width: 480px) {
        .lp-topbar { padding: 14px 12px; gap: 8px; }
        .lp-topbar-link {
          font-size: 10px; letter-spacing: 1.2px;
          padding: 7px 11px;
        }
      }

      /* ── HERO ─────────────────────────────────────── */
      .lp-hero {
        padding: clamp(48px, 10vw, 120px) 24px clamp(56px, 8vw, 96px);
        display: grid; place-items: center;
      }
      .lp-hero-inner {
        width: 100%; max-width: 760px;
        display: flex; flex-direction: column; align-items: center;
        gap: 28px; text-align: center;
        animation: fadeup .5s ease;
      }
      /* ── HERO MOCKUP — Constellation de chips ──────────────────
         Cluster de petits chips colorés disposés en wrap libre,
         légèrement inclinés. Évoque le langage produit (score,
         action, plugin pick, évolution, intention) sans simuler
         d'écran. Petit, aéré, abstrait. */
      .lp-hero-mock {
        display: flex; flex-wrap: wrap;
        align-items: center; justify-content: center;
        gap: 10px 14px;
        width: 100%; max-width: 720px;
        margin: 8px auto 4px;
        padding: 8px 4px;
        pointer-events: none;
      }
      .lp-chip {
        display: inline-flex; align-items: center;
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 1.4px; text-transform: uppercase;
        padding: 6px 12px;
        border-radius: 999px;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
        box-shadow: 0 8px 24px -10px rgba(0,0,0,0.5);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      /* Score — ambre (pilier principal) */
      .lp-chip-score {
        background: rgba(245,166,35,0.12);
        border: 1px solid rgba(245,166,35,0.40);
        color: ${T.amber};
        transform: rotate(-2deg);
        font-size: 12.5px;
      }
      /* Tag mix-quality (Mix solide) — vert */
      .lp-chip-tag {
        background: rgba(142,224,122,0.10);
        border: 1px solid rgba(142,224,122,0.32);
        color: #8ee07a;
        transform: rotate(1.5deg);
      }
      /* Diagnostic chiffré — céruléen */
      .lp-chip-diag {
        background: rgba(92,184,204,0.10);
        border: 1px solid rgba(92,184,204,0.32);
        color: #5cb8cc;
        transform: rotate(-1deg);
      }
      /* Plugin pick — violet */
      .lp-chip-plugin {
        background: rgba(166,126,245,0.10);
        border: 1px solid rgba(166,126,245,0.34);
        color: #c2a8ff;
        transform: rotate(2deg);
      }
      /* Évolution V1→V2 — vert (delta positif) */
      .lp-chip-evo {
        background: rgba(142,224,122,0.12);
        border: 1px solid rgba(142,224,122,0.40);
        color: #8ee07a;
        transform: rotate(-2.5deg);
        font-size: 12px;
      }
      /* Intention artistique — ambre dimmé */
      .lp-chip-intent {
        background: rgba(245,166,35,0.06);
        border: 1px solid rgba(245,166,35,0.26);
        color: rgba(245,166,35,0.85);
        transform: rotate(1deg);
      }
      /* Note "basses maîtrisées" — neutre clair */
      .lp-chip-bass {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.14);
        color: rgba(255,255,255,0.72);
        transform: rotate(-1.5deg);
      }
      /* Sous 640 px on neutralise les rotations pour la lisibilité ;
         le wrap se débrouille tout seul pour le stack. */
      @media (max-width: 640px) {
        .lp-hero-mock { gap: 8px; max-width: 100%; }
        .lp-chip { transform: none !important; font-size: 10.5px; }
      }

      /* Slogan principal — même grammaire typo que .wh-slogan du dashboard
         ("Écoute, compare, décide.") : DM Sans 700, gros, line-height
         serré, em ambre sans italique. */
      .lp-slogan {
        font-family: ${T.body}; font-weight: 700;
        font-size: clamp(48px, 8.4vw, 96px);
        line-height: 0.96; letter-spacing: -3px;
        color: ${T.text}; max-width: 760px; margin: 0;
      }
      .lp-slogan em {
        font-family: inherit; font-style: normal; font-weight: inherit;
        letter-spacing: inherit; color: ${T.amber};
      }
      /* Garantit que la 1ʳᵉ ligne du slogan tient d'un bloc, le <br/>
         force ensuite la 2ᵉ ligne — même technique que .wh-slogan-line. */
      .lp-slogan .lp-slogan-line { white-space: nowrap; }
      /* Tagline-trio "écoute, comprend, guide." — placée juste sous le
         grand slogan, taille intermédiaire pour rester un signal fort
         sans concurrencer le titre. DM Sans 500 medium, em ambre. */
      .lp-tagline-trio {
        font-family: ${T.body}; font-weight: 500;
        font-size: clamp(18px, 2.2vw, 26px);
        line-height: 1.3; letter-spacing: -0.4px;
        color: ${T.textSoft}; margin: 0;
      }
      .lp-tagline-trio em {
        font-style: normal; font-weight: 600; color: ${T.amber};
      }
      /* Sous-titre sous le slogan : même grammaire typo que la prose
         d'écoute qualitative dans les fiches d'analyse — DM Sans 300
         light, 15px, line-height 1.7, couleur soft. PAS d'italique. */
      .lp-hero-sub {
        font-family: ${T.body}; font-style: normal;
        font-size: 15px; font-weight: 300; line-height: 1.7;
        color: var(--soft, ${T.textSoft});
        max-width: 560px; margin: 0;
      }
      @media (max-width: 640px) {
        .lp-slogan {
          font-size: clamp(40px, 12vw, 64px);
          letter-spacing: -1.4px;
        }
        .lp-slogan .lp-slogan-line { white-space: normal; }
      }

      /* Badge "Première analyse offerte" — chip pill amber posée
         au-dessus du CTA primary. Système chip cohérent avec .pr-chip
         et .vside-chip (mono uppercase, bg amber-tinted, bordure amber).
         Légère rotation -1.5° pour rester dans la grammaire chip
         globale ; au hover, la chip se redresse. Pas de halo, pas de
         dot — sobre et discrète. */
      .lp-free-badge {
        display: inline-flex; align-items: center;
        margin: 4px 0 18px;
        padding: 6px 14px; border-radius: 999px;
        font-family: ${T.mono}; font-size: 10.5px; font-weight: 500;
        letter-spacing: 1.8px; text-transform: uppercase;
        color: ${T.amber};
        background: rgba(245,166,35,0.10);
        border: 1px solid rgba(245,166,35,0.42);
        transform: rotate(-1.5deg);
        transition: transform .2s ease;
      }
      .lp-free-badge:hover { transform: rotate(0deg); }

      /* CTA row : primary + optional secondary "Voir un exemple". */
      .lp-cta-row {
        margin-top: 12px;
        display: flex; flex-wrap: wrap; gap: 12px;
        justify-content: center; align-items: center;
      }
      /* CTA — pill ambre, grammaire .auth-submit */
      .lp-cta-primary {
        padding: 16px 32px;
        background: transparent; color: ${T.amber};
        border: 1px solid rgba(245,166,35,0.55); border-radius: 999px;
        font-family: ${T.mono}; font-size: 12px; font-weight: 500;
        letter-spacing: 1.8px; text-transform: uppercase;
        cursor: pointer; transition: all .15s;
      }
      .lp-cta-primary:hover {
        border-color: ${T.amber};
        background: rgba(245,166,35,0.08);
        box-shadow: 0 0 0 6px rgba(245,166,35,0.06);
      }
      /* CTA secondaire — bordure neutre nettement visible (la version
         précédente à rgba 0.06 était quasi invisible). On garde la même
         géométrie de pill que le primary, juste sans la couleur ambre. */
      .lp-cta-secondary {
        padding: 16px 28px;
        background: transparent; color: ${T.text};
        border: 1px solid var(--btn-border, rgba(255,255,255,0.28));
        border-radius: 999px;
        font-family: ${T.mono}; font-size: 12px; font-weight: 500;
        letter-spacing: 1.8px; text-transform: uppercase;
        cursor: pointer; transition: all .15s;
      }
      .lp-cta-secondary:hover {
        color: ${T.text};
        border-color: var(--btn-border-hover, rgba(255,255,255,0.45));
        background: rgba(255,255,255,0.04);
      }

      /* ── DIVIDERS ─────────────────────────────────── */
      .lp-divider {
        width: 100%; max-width: 960px; margin: 0 auto;
        height: 1px;
        background: linear-gradient(90deg,
          transparent, rgba(255,255,255,0.10), transparent);
      }

      /* ── SECTIONS ─────────────────────────────────── */
      .lp-section {
        padding: clamp(72px, 11vw, 128px) 24px;
        max-width: 1080px; margin: 0 auto;
      }
      .lp-section-tight { padding: clamp(56px, 9vw, 96px) 24px; }
      .lp-section-eyebrow {
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 2.4px; color: ${T.amber}; text-transform: uppercase;
        text-align: center; margin-bottom: 18px;
      }
      /* Titres de section — recette strictement alignée sur .lp-tagline-trio
         "écoute, comprend, guide" : DM Sans 500, em ambre 600 (pas
         d'italique), couleur soft, taille intermédiaire. */
      .lp-section-title {
        font-family: ${T.body};
        font-weight: 500;
        font-size: clamp(18px, 2.2vw, 26px);
        line-height: 1.3; letter-spacing: -0.4px;
        color: ${T.textSoft}; text-align: center;
        max-width: 760px; margin: 0 auto;
      }
      .lp-section-title em {
        font-family: inherit; font-style: normal; font-weight: 600;
        letter-spacing: inherit; color: ${T.amber};
      }
      .lp-section-lede {
        font-family: ${T.body}; font-size: 15px; font-weight: 300;
        line-height: 1.6; color: ${T.textSoft};
        text-align: center; max-width: 640px;
        margin: 18px auto 0;
      }

      /* ── DIFF GRID ────────────────────────────────── */
      .lp-diff-grid {
        margin-top: clamp(40px, 6vw, 64px);
        display: grid; gap: 22px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        counter-reset: lp-diff-counter;
      }
      /* Cartes "atouts" — halo de couleur radial flouté en haut à droite,
         même grammaire que les .fg-panel des fiches d'analyse. Chaque
         carte a sa teinte (amber, cerulean, violet, mint) qui colore à
         la fois le halo, l'icône, et l'em du body.
         Rotation sticker subtile via --card-rot (set par nth-child),
         numérotation 01-04 via CSS counter (mono amber dimmé en haut
         à droite). */
      .lp-diff-card {
        position: relative;
        overflow: hidden;
        padding: 28px 26px;
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 16px;
        display: flex; flex-direction: column; gap: 12px;
        transform: rotate(var(--card-rot, 0deg));
        transition: border-color .25s, transform .25s, box-shadow .25s;
        counter-increment: lp-diff-counter;
      }
      /* Rotation par position dans le grid — chaque card a un angle
         distinct pour éviter l'effet rangée stricte. Désactivé en mobile
         (cf. media query existante 1 col). */
      .lp-diff-grid > .lp-diff-card:nth-child(1) { --card-rot: -1deg; }
      .lp-diff-grid > .lp-diff-card:nth-child(2) { --card-rot:  1deg; }
      .lp-diff-grid > .lp-diff-card:nth-child(3) { --card-rot: -1.5deg; }
      .lp-diff-grid > .lp-diff-card:nth-child(4) { --card-rot:  1.5deg; }
      /* Numérotation 01-04 — mono ambre dimmé en haut à droite, hors flux */
      .lp-diff-card::after {
        content: counter(lp-diff-counter, decimal-leading-zero);
        position: absolute; top: 14px; right: 18px;
        z-index: 2;
        font-family: ${T.mono}; font-weight: 600;
        font-size: 14px; letter-spacing: 1.6px;
        color: ${T.amber};
        opacity: 0.5;
        transition: opacity .25s;
      }
      /* On surcharge l'animation d'entrée pour préserver la rotation
         (sans ça, .lp-anim-in retomberait à transform:none et casserait
         la rotation par card). */
      .lp-anim.lp-diff-card {
        transform: translateY(14px) rotate(var(--card-rot, 0deg));
      }
      .lp-anim.lp-diff-card.lp-anim-in {
        transform: rotate(var(--card-rot, 0deg));
      }
      /* Le halo lui-même : cercle radial flouté en pseudo-élément, posé
         au-dessus du fond mais derrière le contenu (z-index 0 vs 1).
         Chaque variante place son halo dans un coin différent (et avec
         une taille légèrement différente) pour casser l'effet "tous
         éclairés pareil" — rendu hors-axe, jamais centré, jamais
         strictement aligné, comme l'ambient-halo de l'app. */
      .lp-diff-card::before {
        content: '';
        position: absolute;
        border-radius: 50%;
        filter: blur(42px);
        opacity: 0.55;
        pointer-events: none;
        z-index: 0;
      }
      .lp-diff-card > * { position: relative; z-index: 1; }
      /* Variante 1 — Amber (chat contextuel) — halo en haut à droite */
      .lp-diff-card.lp-diff-amber::before {
        top: -34%; right: -28%; width: 260px; height: 260px;
        background: radial-gradient(circle, rgba(245,166,35,0.55), transparent 70%);
      }
      .lp-diff-card.lp-diff-amber .lp-diff-icon {
        background: rgba(245,166,35,0.10);
        border-color: rgba(245,166,35,0.32);
        color: ${T.amber};
      }
      /* Variante 2 — Cerulean (intention) — halo en bas à gauche */
      .lp-diff-card.lp-diff-cerulean::before {
        bottom: -36%; left: -22%; width: 240px; height: 240px;
        background: radial-gradient(circle, rgba(92,184,204,0.5), transparent 70%);
        opacity: 0.6;
      }
      .lp-diff-card.lp-diff-cerulean .lp-diff-icon {
        background: rgba(92,184,204,0.10);
        border-color: rgba(92,184,204,0.32);
        color: #5cb8cc;
      }
      /* Variante 3 — Violet (recommandations) — halo en haut à gauche */
      .lp-diff-card.lp-diff-violet::before {
        top: -28%; left: -30%; width: 280px; height: 280px;
        background: radial-gradient(circle, rgba(166,126,245,0.50), transparent 70%);
        opacity: 0.5;
      }
      .lp-diff-card.lp-diff-violet .lp-diff-icon {
        background: rgba(166,126,245,0.10);
        border-color: rgba(166,126,245,0.32);
        color: #a67ef5;
      }
      /* Variante 4 — Mint (suivi versions) — halo en bas à droite */
      .lp-diff-card.lp-diff-mint::before {
        bottom: -30%; right: -24%; width: 250px; height: 250px;
        background: radial-gradient(circle, rgba(142,224,122,0.45), transparent 70%);
        opacity: 0.55;
      }
      .lp-diff-card.lp-diff-mint .lp-diff-icon {
        background: rgba(142,224,122,0.10);
        border-color: rgba(142,224,122,0.32);
        color: #8ee07a;
      }
      /* Hover : on garde la rotation native + on lift + glow plus intense
         (drop-shadow color-matched, intensifié par variante via les rules
         color-spécifiques en dessous). Le numéro 01-04 sort de l'ombre. */
      .lp-diff-card:hover {
        border-color: rgba(255,255,255,0.18);
        transform: rotate(var(--card-rot, 0deg)) translateY(-3px);
      }
      .lp-diff-card:hover::after { opacity: 0.85; }
      .lp-diff-card:hover::before { opacity: 0.85; filter: blur(36px); }
      .lp-diff-icon {
        width: 40px; height: 40px; border-radius: 10px;
        display: grid; place-items: center;
        background: rgba(245,166,35,0.08);
        border: 1px solid rgba(245,166,35,0.22);
        color: ${T.amber};
      }
      .lp-diff-title {
        font-family: ${T.body}; font-weight: 500;
        font-size: 16px; letter-spacing: -0.1px;
        color: ${T.text}; margin: 4px 0 0;
      }
      .lp-diff-body {
        font-family: ${T.body}; font-size: 14px; font-weight: 300;
        line-height: 1.6; color: ${T.textSoft};
      }
      .lp-diff-body em { color: ${T.amber}; font-style: normal; font-weight: 600; }

      /* ── AXES GRID (2×3 desktop) ──────────────────── */
      /* AXES — 6 cards-stickers indépendantes (avant : tableau collé
         par 1px de bordure partagée). Chacune a son halo color, sa
         rotation propre via --card-rot, son hover qui lift + intensifie
         le halo. Animation d'entrée staggered via nth-child. */
      .lp-axes-grid {
        margin-top: clamp(40px, 6vw, 64px);
        display: grid; gap: 18px;
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .lp-axe-card {
        position: relative;
        overflow: hidden;
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 14px;
        padding: 22px 20px;
        display: flex; gap: 14px; align-items: flex-start;
        transform: rotate(var(--card-rot, 0deg));
        transition: border-color .25s, transform .25s, box-shadow .25s;
      }
      /* Rotations subtiles — différentes par card pour casser la symétrie */
      .lp-axes-grid > .lp-axe-card:nth-child(1) { --card-rot: -1deg;   transition-delay: 80ms; }
      .lp-axes-grid > .lp-axe-card:nth-child(2) { --card-rot:  0.6deg; transition-delay: 140ms; }
      .lp-axes-grid > .lp-axe-card:nth-child(3) { --card-rot: -1.4deg; transition-delay: 200ms; }
      .lp-axes-grid > .lp-axe-card:nth-child(4) { --card-rot:  1deg;   transition-delay: 260ms; }
      .lp-axes-grid > .lp-axe-card:nth-child(5) { --card-rot: -0.8deg; transition-delay: 320ms; }
      .lp-axes-grid > .lp-axe-card:nth-child(6) { --card-rot:  1.4deg; transition-delay: 380ms; }
      /* Override .lp-anim pour préserver la rotation pendant l'entrée */
      .lp-anim.lp-axe-card {
        transform: translateY(14px) rotate(var(--card-rot, 0deg));
      }
      .lp-anim.lp-axe-card.lp-anim-in {
        transform: rotate(var(--card-rot, 0deg));
      }
      /* Halo color */
      .lp-axe-card::before {
        content: '';
        position: absolute;
        width: 220px; height: 220px;
        border-radius: 50%;
        filter: blur(42px);
        opacity: 0.5;
        pointer-events: none;
        z-index: 0;
        transition: opacity .25s, filter .25s;
      }
      .lp-axe-card > * { position: relative; z-index: 1; }
      .lp-axe-pos-tr::before { top: -34%; right: -22%; }
      .lp-axe-pos-tl::before { top: -34%; left: -22%; }
      .lp-axe-pos-br::before { bottom: -34%; right: -22%; }
      .lp-axe-pos-bl::before { bottom: -34%; left: -22%; }
      .lp-axe-amber::before    { background: radial-gradient(circle, rgba(245,166,35,0.55), transparent 70%); }
      .lp-axe-cerulean::before { background: radial-gradient(circle, rgba(92,184,204,0.50), transparent 70%); }
      .lp-axe-violet::before   { background: radial-gradient(circle, rgba(166,126,245,0.48), transparent 70%); }
      .lp-axe-mint::before     { background: radial-gradient(circle, rgba(142,224,122,0.46), transparent 70%); }
      /* Hover : lift + halo plus intense + numéro qui sort de l'ombre */
      .lp-axe-card:hover {
        border-color: rgba(255,255,255,0.18);
        transform: rotate(var(--card-rot, 0deg)) translateY(-3px);
      }
      .lp-axe-card:hover::before { opacity: 0.85; filter: blur(36px); }
      .lp-axe-card:hover .lp-axe-num { opacity: 1; }
      /* Numéro grossi, color-matched au halo de la card */
      .lp-axe-num {
        font-family: ${T.mono}; font-size: 22px; font-weight: 600;
        letter-spacing: -0.3px; line-height: 1;
        padding-top: 2px; flex-shrink: 0;
        opacity: 0.7; transition: opacity .25s;
      }
      .lp-axe-amber    .lp-axe-num { color: ${T.amber}; }
      .lp-axe-cerulean .lp-axe-num { color: #5cb8cc; }
      .lp-axe-violet   .lp-axe-num { color: #a67ef5; }
      .lp-axe-mint     .lp-axe-num { color: #8ee07a; }
      .lp-axe-body { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
      .lp-axe-label {
        font-family: ${T.body}; font-weight: 500; font-size: 15px;
        color: ${T.text};
      }
      .lp-axe-desc {
        font-family: ${T.body}; font-weight: 300; font-size: 13px;
        line-height: 1.55; color: ${T.muted};
      }

      /* ── NOPE — 3 stickers "ce qu'on ne fait pas" ─────────────────
         Même grammaire que les cards atouts/axes : rotation subtile,
         halo color, hover qui lift + intensifie. Le × est gros, color-
         matched, presque comme un sceau de refus. */
      .lp-nope-grid {
        margin-top: clamp(36px, 5vw, 56px);
        display: grid; gap: 22px;
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .lp-nope-item {
        position: relative;
        overflow: hidden;
        padding: 24px 22px;
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 14px;
        display: flex; gap: 14px; align-items: flex-start;
        transform: rotate(var(--card-rot, 0deg));
        transition: border-color .25s, transform .25s, box-shadow .25s;
      }
      .lp-nope-grid > .lp-nope-item:nth-child(1) { --card-rot: -1deg; }
      .lp-nope-grid > .lp-nope-item:nth-child(2) { --card-rot:  1.2deg; }
      .lp-nope-grid > .lp-nope-item:nth-child(3) { --card-rot: -0.8deg; }
      /* Override .lp-anim pour préserver la rotation pendant l'entrée */
      .lp-anim.lp-nope-item {
        transform: translateY(14px) rotate(var(--card-rot, 0deg));
      }
      .lp-anim.lp-nope-item.lp-anim-in {
        transform: rotate(var(--card-rot, 0deg));
      }
      /* Halo color */
      .lp-nope-item::before {
        content: '';
        position: absolute;
        border-radius: 50%;
        filter: blur(44px);
        opacity: 0.5;
        pointer-events: none;
        z-index: 0;
        transition: opacity .25s, filter .25s;
      }
      .lp-nope-item > * { position: relative; z-index: 1; }
      .lp-nope-amber::before {
        top: -38%; right: -26%; width: 240px; height: 240px;
        background: radial-gradient(circle, rgba(245,166,35,0.50), transparent 70%);
      }
      .lp-nope-cerulean::before {
        bottom: -34%; left: -22%; width: 240px; height: 240px;
        background: radial-gradient(circle, rgba(92,184,204,0.48), transparent 70%);
      }
      .lp-nope-violet::before {
        top: -32%; left: -28%; width: 250px; height: 250px;
        background: radial-gradient(circle, rgba(166,126,245,0.46), transparent 70%);
      }
      /* Hover : lift + glow + le × se gonfle un poil et brille */
      .lp-nope-item:hover {
        border-color: rgba(255,255,255,0.18);
        transform: rotate(var(--card-rot, 0deg)) translateY(-3px);
      }
      .lp-nope-item:hover::before { opacity: 0.85; filter: blur(36px); }
      .lp-nope-item:hover .lp-nope-mark { transform: scale(1.05); opacity: 1; }
      /* × gros, color-matched par variante, droit (pas d'italique) */
      .lp-nope-mark {
        font-family: ${T.body}; font-size: 36px; font-weight: 700;
        line-height: 1; flex-shrink: 0; padding-top: 0;
        opacity: 0.85;
        transition: transform .25s, opacity .25s;
      }
      .lp-nope-amber    .lp-nope-mark { color: ${T.amber}; }
      .lp-nope-cerulean .lp-nope-mark { color: #5cb8cc; }
      .lp-nope-violet   .lp-nope-mark { color: #a67ef5; }
      .lp-nope-item p {
        font-family: ${T.body}; font-weight: 300; font-size: 14px;
        line-height: 1.6; color: ${T.textSoft}; margin: 0;
        align-self: center;
      }

      /* ── FOOTER ───────────────────────────────────── */
      .lp-footer {
        padding: clamp(80px, 12vw, 140px) 24px clamp(48px, 8vw, 80px);
        max-width: 760px; margin: 0 auto;
        display: flex; flex-direction: column; align-items: center;
        gap: 28px; text-align: center;
      }
      /* Citation footer — recette charte alignée sur .lp-section-title /
         .lp-tagline-trio : DM Sans 500, em ambre droit weight 600,
         couleur soft. Plus de Cormorant italique. */
      .lp-footer-quote {
        font-family: ${T.body};
        font-weight: 500;
        font-size: clamp(20px, 2.6vw, 30px);
        line-height: 1.3; letter-spacing: -0.5px;
        color: ${T.textSoft}; margin: 0;
      }
      .lp-footer-quote em {
        font-family: inherit; font-style: normal; font-weight: 600;
        letter-spacing: inherit; color: ${T.amber};
      }
      .lp-cta-footer { margin-top: 4px; }
      /* Marque de signature en pied de page — même grammaire que le hero
         (logo SVG + wordmark DM Sans 700), mais en plus petit. */
      .lp-footer-mark {
        margin-top: 28px;
        display: flex; align-items: center; gap: 10px;
      }
      .lp-footer-mark-img {
        height: 28px; width: auto;
        filter: drop-shadow(0 0 18px rgba(245,166,35,0.18));
      }
      .lp-footer-mark-text {
        font-family: ${T.body}; font-weight: 700;
        font-size: 22px; letter-spacing: -0.4px;
        color: ${T.text}; line-height: 1;
      }

      /* ── RESPONSIVE ───────────────────────────────── */
      @media (max-width: 768px) {
        .lp-diff-grid { grid-template-columns: 1fr; }
        .lp-axes-grid { grid-template-columns: 1fr; }
        .lp-nope-grid { grid-template-columns: 1fr; }
        .lp-section { padding: 64px 20px; }
        .lp-section-tight { padding: 48px 20px; }
        .lp-hero { padding: 56px 20px 48px; }
        .lp-footer { padding: 64px 20px 48px; }
        .lp-diff-card { padding: 22px 20px; }
        .lp-cta-primary, .lp-cta-secondary { padding: 14px 26px; font-size: 11px; letter-spacing: 1.5px; }
        .lp-cta-row { flex-direction: column; gap: 10px; width: 100%; }
        .lp-cta-row > button { width: 100%; max-width: 320px; }
        /* Sur mobile on neutralise la rotation des cards (1 col, lecture
           prime sur l'effet sticker). On préserve les transforms hover
           qui se simplifient à un translateY tout court. */
        .lp-diff-grid > .lp-diff-card,
        .lp-axes-grid > .lp-axe-card,
        .lp-nope-grid > .lp-nope-item {
          --card-rot: 0deg;
        }
      }
    `}</style>
  );
}
