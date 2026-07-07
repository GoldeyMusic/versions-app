import { useEffect, useState } from 'react';
import T from '../constants/theme';
import { apiFetchJson } from '../lib/apiClient';
import useLang from '../hooks/useLang';
import LangDropdown from '../components/LangDropdown';
import HamburgerMenu, { NavIcons } from '../components/HamburgerMenu';

/**
 * PluginScreen — page dédiée au plugin DAW (/plugin).
 *
 * Rendu PUBLIC (visiteur) et CONNECTÉ (sans sidebar), comme PricingScreen.
 * Même grammaire éditoriale que la landing : vouvoiement, em ambre,
 * eyebrows mono uppercase, chips, animations d'entrée au scroll.
 *
 * Faits produit sourcés depuis versions-plugin/CLAUDE.md (2026-07) :
 *  - Formats : AU + VST3 — macOS (.dmg signé/notarisé) + Windows (.exe).
 *  - Périmètre : metering + chat + Session View + écoute express.
 *    PAS d'analyse complète dans le plugin (express-only) — elle vit sur
 *    le site. Ne jamais promettre le contraire ici.
 *  - Gratuit : metering illimité + 5 écoutes express/mois + 15 messages
 *    chat/jour. Abonnés Indie/Pro : illimité (fair-use).
 *
 * Liens de téléchargement : constantes ci-dessous. Tant qu'une URL est
 * vide, le bouton correspondant est désactivé avec le libellé "bientôt".
 * GATING (2026-07-05) : le téléchargement exige un compte — visiteur non
 * connecté = clic → écran login (onViewDashboard vaut goAuth en rendu
 * public) ; connecté = <a download> + POST /api/plugin/download
 * (fire-and-forget : tracking en base + notif email ops côté versions-api).
 * L'URL statique reste techniquement accessible en direct — assumé, le
 * gate est un funnel produit, pas un DRM.
 * Les binaires vivent dans public/downloads/ sous un NOM STABLE (sans
 * version) pour ne pas avoir à toucher au code à chaque release :
 *   cp ~/versions-plugin/dist/Versions-X.Y.Z.dmg public/downloads/Versions.dmg
 * Windows : .exe NON SIGNÉ publié en attendant Azure Artifact Signing
 * (décision David 2026-07-05 — alerte SmartScreen assumée, le binaire
 * sera remplacé par la version signée dès la validation Multicolorz).
 */
const PLUGIN_DOWNLOAD_MAC_URL = '/downloads/Versions.dmg';
const PLUGIN_DOWNLOAD_WIN_URL = '/downloads/Versions-Setup.exe';
// Version affichée sous les CTAs de téléchargement (hero + footer).
// À mettre à jour à CHAQUE release, en même temps que la copie du
// binaire dans public/downloads/ (les noms de fichiers sont stables,
// cette constante est le seul endroit où la version apparaît).
const PLUGIN_VERSION = '1.0.4';

export default function PluginScreen({
  onBackToLanding,
  onViewPricing,
  onViewDashboard,
  isAuthenticated = false,
  // Props utilitaires (utilisateur connecté) — hamburger mobile.
  credits = null,
  planLabel = null,
  isAdmin = false,
  onGoAdmin = null,
  onGoReglages = null,
  onSignOut = null,
}) {
  const { s, lang, setLang } = useLang();
  const t = s.pluginPage;
  const [videoOk, setVideoOk] = useState(true);
  const utilityItems = [
    ...(isAdmin && onGoAdmin ? [{ key: 'admin', label: 'Admin', icon: NavIcons.admin, onSelect: onGoAdmin }] : []),
    ...(onGoReglages ? [{ key: 'reglages', label: s.sidebar?.reglages || 'Réglages', icon: NavIcons.settings, onSelect: onGoReglages }] : []),
    ...(onSignOut ? [{ key: 'signout', label: s.sidebar?.signOut || 'Se déconnecter', icon: NavIcons.signOut, onSelect: onSignOut, danger: true }] : []),
  ];

  // Animations d'entrée au scroll — même mécanique que landing/pricing.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const els = document.querySelectorAll('.plg-anim');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('plg-anim-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -15% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Glyphes plateformes — SVG inline (charte : symboles premium, pas
  // d'emojis), fill currentColor pour hériter de l'ambre du bouton.
  const AppleIcon = (
    <svg className="plg-dl-ico" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
  const WindowsIcon = (
    <svg className="plg-dl-ico" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 5.55l7.6-1.05v7h-7.6v-5.95zM3 18.45l7.6 1.05v-6.95h-7.6v5.9zM11.6 4.35L21 3v8.5h-9.4V4.35zM11.6 19.65L21 21v-8.45h-9.4v7.1z" />
    </svg>
  );

  // Log de téléchargement — fire-and-forget vers le backend (tracking en
  // base + notif email ops). Best-effort : un échec ne bloque JAMAIS le
  // téléchargement (l'anchor natif part quoi qu'il arrive).
  const logDownload = (platform) => {
    apiFetchJson('/api/plugin/download', { method: 'POST', body: { platform } })
      .catch(() => { /* tracking best-effort */ });
  };

  // Bouton de téléchargement — 3 états (décision David 2026-07-05 : le
  // download est GATÉ par le compte ; le plugin exige un login à
  // l'ouverture de toute façon, autant capter l'inscription ici) :
  //  - URL vide → bouton désactivé "lien à venir" ;
  //  - visiteur → même look, mais clic = écran d'inscription/login
  //    (onViewDashboard vaut goAuth dans le rendu public, cf. App.jsx) ;
  //  - connecté → <a download> + logDownload au clic.
  const DownloadCta = ({ url, label, icon, platform }) => {
    if (!url) {
      return (
        <button
          type="button"
          className="lp-cta-primary plg-dl"
          disabled
          title={t.ctaComingSoon}
          aria-label={`${label} — ${t.ctaComingSoon}`}
        >
          {icon}{label}
        </button>
      );
    }
    if (!isAuthenticated) {
      return (
        <button
          type="button"
          className="lp-cta-primary plg-dl"
          onClick={onViewDashboard}
          title={t.ctaAuthNote}
        >
          {icon}{label}
        </button>
      );
    }
    return (
      <a className="lp-cta-primary plg-dl" href={url} download onClick={() => logDownload(platform)}>
        {icon}{label}
      </a>
    );
  };

  return (
    <div className="plg-screen">
      <PluginStyles />

      {/* TOPBAR — même grammaire que pricing : brand cliquable → landing */}
      <header className="plg-topbar">
        <button
          type="button"
          className="plg-topbar-brand"
          onClick={onBackToLanding}
          aria-label={t.topbarBackAria}
        >
          <img src="/Logo-Versions-2.png" alt="" className="plg-topbar-logo" />
          <span className="plg-topbar-wordmark">
            VER<span className="accent">Si</span>ONS
          </span>
        </button>
        <nav className="plg-topbar-nav" aria-label="Navigation">
          <button type="button" className="plg-topbar-link" onClick={onBackToLanding}>
            {t.topbarHome}
          </button>
          <span className="plg-topbar-current" aria-current="page">{t.topbarCurrent}</span>
          {onViewPricing && (
            <button type="button" className="plg-topbar-link" onClick={onViewPricing}>
              {s.pricing?.topbarCurrent || 'Tarifs'}
            </button>
          )}
          {onViewDashboard && (
            <button
              type="button"
              className="plg-topbar-link"
              onClick={onViewDashboard}
              aria-label={isAuthenticated ? s.sidebar.dashboardLink : s.sidebar.signInLink}
            >
              {isAuthenticated ? s.sidebar.dashboardLink : s.sidebar.signInLink}
            </button>
          )}
          <HamburgerMenu
            items={[
              { key: 'home', label: t.topbarHome, icon: NavIcons.home, onSelect: onBackToLanding },
              { key: 'plugin', label: t.topbarCurrent, icon: NavIcons.plugin, current: true },
              ...(onViewPricing ? [{ key: 'pricing', label: s.pricing?.topbarCurrent || 'Tarifs', icon: NavIcons.pricing, onSelect: onViewPricing }] : []),
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

      {/* HERO — chips metering + slogan + tagline + sub + compat + CTAs */}
      <header className="plg-hero">
        <div className="plg-hero-inner">
          <div className="plg-hero-chips" aria-hidden="true">
            <span className="lp-chip lp-chip-diag plg-chip">{t.heroChip1}</span>
            <span className="lp-chip lp-chip-score plg-chip-score">{t.heroChip2}</span>
            <span className="lp-chip plg-chip-neutral">{t.heroChip3}</span>
            <span className="lp-chip plg-chip-mint">{t.heroChip4}</span>
          </div>
          <h1 className="plg-slogan">
            {t.heroTitleLine1}<br />
            {t.heroTitleLine2Before}<em>{t.heroTitleLine2Em}</em>{t.heroTitleLine2After}
          </h1>
          <div className="plg-tagline">
            {t.taglineBefore}<em>{t.taglineEm}</em>{t.taglineAfter}
          </div>
          <p className="plg-hero-sub">{t.heroSub}</p>
          {/* Compat : GRATUIT + formats AU/VST3 (les 2 OS sont déjà dans
              les libellés des boutons de téléchargement juste dessous). */}
          <div className="plg-compat">
            <span className="plg-compat-chip plg-compat-free">{t.chipFree}</span>
            <span className="plg-compat-chip">AU</span>
            <span className="plg-compat-chip">VST3</span>
          </div>
          <div className="plg-cta-row">
            <DownloadCta url={PLUGIN_DOWNLOAD_MAC_URL} label={t.ctaMac} icon={AppleIcon} platform="mac" />
            <DownloadCta
              url={PLUGIN_DOWNLOAD_WIN_URL}
              label={PLUGIN_DOWNLOAD_WIN_URL ? t.ctaWin : t.ctaWinSoon}
              icon={WindowsIcon}
              platform="windows"
            />
          </div>
          <p className="plg-version-note">Version {PLUGIN_VERSION}</p>
          {!isAuthenticated && <p className="plg-dl-note">{t.ctaAuthNote}</p>}
        </div>
      </header>

      {/* VIDÉO plein format — /plugin-demo.mp4, placeholder si absente */}
      <div className="plg-big-video plg-anim">
        <div className="plg-video-frame">
          {videoOk ? (
            <video
              className="plg-video-el"
              src="/plugin-demo.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onError={() => setVideoOk(false)}
            />
          ) : (
            <div className="plg-video-ph">
              <div className="plg-video-play" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <div className="plg-video-note">{t.videoNote}</div>
            </div>
          )}
        </div>
      </div>

      {/* COMMENT ÇA MARCHE — 3 étapes */}
      <section className="plg-section">
        <div className="plg-eyebrow plg-anim">{t.howEyebrow}</div>
        <h2 className="plg-section-title plg-anim" style={{ '--anim-d': '60ms' }}>
          {t.howTitleStart}<em>{t.howTitleEm}</em>
        </h2>
        <div className="plg-steps">
          <div className="plg-step plg-anim" style={{ '--anim-d': '160ms' }}>
            <div className="plg-step-num">01</div>
            <div className="plg-step-title">{t.step1Title}</div>
            <div className="plg-step-body">{t.step1Body}</div>
          </div>
          <div className="plg-step plg-anim" style={{ '--anim-d': '240ms' }}>
            <div className="plg-step-num">02</div>
            <div className="plg-step-title">{t.step2Title}</div>
            <div className="plg-step-body">{t.step2Body}</div>
          </div>
          <div className="plg-step plg-anim" style={{ '--anim-d': '320ms' }}>
            <div className="plg-step-num">03</div>
            <div className="plg-step-title">{t.step3Title}</div>
            <div className="plg-step-body">{t.step3Body}</div>
          </div>
        </div>
      </section>

      <div className="plg-divider" />

      {/* CE QU'IL SAIT FAIRE — 4 features + note abonnés */}
      <section className="plg-section">
        <div className="plg-eyebrow plg-anim">{t.featEyebrow}</div>
        <h2 className="plg-section-title plg-anim" style={{ '--anim-d': '60ms' }}>
          {t.featTitleStart}<em>{t.featTitleEm}</em>
        </h2>
        <div className="plg-feat-grid">
          <article className="plg-feat plg-feat-cerulean plg-anim" style={{ '--anim-d': '160ms' }}>
            <span className="plg-feat-tag">{t.feat1Tag}</span>
            <h3 className="plg-feat-title">{t.feat1Title}</h3>
            <p className="plg-feat-body">{t.feat1Body}</p>
          </article>
          <article className="plg-feat plg-feat-violet plg-anim" style={{ '--anim-d': '240ms' }}>
            <span className="plg-feat-tag">{t.feat2Tag}</span>
            <h3 className="plg-feat-title">{t.feat2Title}</h3>
            <p className="plg-feat-body">{t.feat2Body}</p>
          </article>
          <article className="plg-feat plg-feat-amber plg-anim" style={{ '--anim-d': '320ms' }}>
            <span className="plg-feat-tag">{t.feat3Tag}</span>
            <h3 className="plg-feat-title">{t.feat3Title}</h3>
            <p className="plg-feat-body">{t.feat3Body}</p>
          </article>
          <article className="plg-feat plg-feat-mint plg-anim" style={{ '--anim-d': '400ms' }}>
            <span className="plg-feat-tag">{t.feat4Tag}</span>
            <h3 className="plg-feat-title">{t.feat4Title}</h3>
            <p className="plg-feat-body">{t.feat4Body}</p>
          </article>

          {/* Cartes 5-6 — le contexte des Settings (ajout 2026-07-05) :
              scan de l'arsenal de plugins + profil DAW/écoute/niveau.
              Rangée 3 = écho couleurs de la rangée 1 (cerulean/violet). */}
          <article className="plg-feat plg-feat-cerulean plg-anim" style={{ '--anim-d': '480ms' }}>
            <span className="plg-feat-tag">{t.feat5Tag}</span>
            <h3 className="plg-feat-title">{t.feat5Title}</h3>
            <p className="plg-feat-body">{t.feat5Body}</p>
          </article>
          <article className="plg-feat plg-feat-violet plg-anim" style={{ '--anim-d': '560ms' }}>
            <span className="plg-feat-tag">{t.feat6Tag}</span>
            <h3 className="plg-feat-title">{t.feat6Title}</h3>
            <p className="plg-feat-body">{t.feat6Body}</p>
          </article>
        </div>
        <p className="plg-feat-note plg-anim" style={{ '--anim-d': '620ms' }}>{t.featNote}</p>
      </section>

      <div className="plg-divider" />

      {/* FOOTER — citation déclinée + CTA téléchargement */}
      <footer className="plg-footer">
        <h2 className="plg-footer-quote plg-anim">
          {t.footerQuoteStart}<em>{t.footerQuoteEm}</em><br />
          {t.footerQuoteEnd}
        </h2>
        <div className="plg-cta-row plg-anim" style={{ '--anim-d': '80ms' }}>
          <DownloadCta url={PLUGIN_DOWNLOAD_MAC_URL} label={t.ctaMac} icon={AppleIcon} platform="mac" />
          <DownloadCta
            url={PLUGIN_DOWNLOAD_WIN_URL}
            label={PLUGIN_DOWNLOAD_WIN_URL ? t.ctaWin : t.ctaWinSoon}
            icon={WindowsIcon}
            platform="windows"
          />
        </div>
        <p className="plg-version-note plg-anim" style={{ '--anim-d': '100ms' }}>Version {PLUGIN_VERSION}</p>
        {!isAuthenticated && <p className="plg-dl-note plg-anim" style={{ '--anim-d': '120ms' }}>{t.ctaAuthNote}</p>}
        <button type="button" className="plg-back-link" onClick={onBackToLanding}>
          {t.backToHome}
        </button>
      </footer>
    </div>
  );
}

function PluginStyles() {
  return (
    <style>{`
      .plg-screen {
        position: relative; z-index: 1;
        min-height: 100vh; min-height: 100dvh;
        background: transparent;
        color: var(--text, ${T.text});
        font-family: var(--body, ${T.body});
        overflow-x: hidden;
      }

      /* Animations d'entrée — même recette que .lp-anim / .pr-anim */
      .plg-anim {
        opacity: 0;
        transform: translateY(14px);
        transition:
          opacity .55s cubic-bezier(.2,.7,.3,1),
          transform .55s cubic-bezier(.2,.7,.3,1);
        transition-delay: var(--anim-d, 0ms);
        will-change: opacity, transform;
      }
      .plg-anim.plg-anim-in { opacity: 1; transform: none; }
      /* Cards inclinées : l'animation d'entrée écrase transform → on
         combine translateY + rotate pendant l'anim, rotate seul après
         (même recette que .lp-anim.lp-diff-card sur la home). */
      .plg-anim.plg-step, .plg-anim.plg-feat {
        transform: translateY(14px) rotate(var(--card-rot, 0deg));
      }
      .plg-anim.plg-anim-in.plg-step, .plg-anim.plg-anim-in.plg-feat {
        transform: rotate(var(--card-rot, 0deg));
      }
      @media (prefers-reduced-motion: reduce) {
        .plg-anim { opacity: 1 !important; transform: none !important; transition: none !important; }
      }

      /* ── TOPBAR — copie de la grammaire lp-topbar / pr-topbar ── */
      .plg-topbar {
        position: relative; z-index: 2;
        padding: 22px 18px;
        display: flex; align-items: center; justify-content: space-between;
        gap: 24px;
      }
      .plg-topbar-brand {
        display: inline-flex; align-items: center; gap: 8px;
        background: transparent; border: 0; padding: 0; cursor: pointer;
      }
      .plg-topbar-logo {
        height: 38px; width: auto;
        filter: drop-shadow(0 0 16px rgba(245,166,35,0.18));
      }
      .plg-topbar-wordmark {
        font-family: ${T.body}; font-weight: 700;
        font-size: 27px; letter-spacing: -0.5px;
        color: ${T.text}; line-height: 1;
      }
      .plg-topbar-wordmark .accent { color: ${T.amber}; font-style: normal; }
      .plg-topbar-nav { display: inline-flex; align-items: center; gap: 8px; }
      .plg-topbar-link, .plg-topbar-current {
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 1.6px; text-transform: uppercase;
        padding: 9px 16px; border-radius: 999px;
        transition: all .15s;
      }
      .plg-topbar-link {
        background: transparent; color: ${T.textSoft};
        border: 1px solid transparent; cursor: pointer;
      }
      .plg-topbar-link:hover {
        color: ${T.text};
        background: rgba(255,255,255,0.04);
        border-color: rgba(255,255,255,0.10);
      }
      .plg-topbar-current {
        color: ${T.amber};
        background: rgba(245,166,35,0.06);
        border: 1px solid rgba(245,166,35,0.32);
      }
      @media (max-width: 720px) {
        .plg-topbar { padding: 16px 14px; gap: 12px; }
        .plg-topbar-wordmark { font-size: 22px; letter-spacing: -0.4px; }
        .plg-topbar-logo { height: 28px; }
        .plg-topbar-nav { gap: 6px; }
      }

      /* ── HERO ─────────────────────────────────────── */
      .plg-hero {
        /* Padding bas = 26px : même espace que le gap du hero-inner,
           pour un rythme chips → CTAs → version → vidéo homogène. */
        padding: clamp(48px, 8vw, 96px) 24px 26px;
        display: grid; place-items: center;
      }
      .plg-hero-inner {
        width: 100%; max-width: 820px;
        display: flex; flex-direction: column; align-items: center;
        gap: 26px; text-align: center;
        animation: fadeup .5s ease;
      }
      .plg-hero-chips {
        display: flex; flex-wrap: wrap;
        align-items: center; justify-content: center;
        gap: 10px 14px;
        pointer-events: none;
      }
      /* Chips hero — grammaire .lp-chip (la landing charge ces classes
         globalement quand on y passe, mais la page doit être autonome :
         on redéclare le socle ici). */
      .plg-hero-chips .lp-chip {
        display: inline-flex; align-items: center;
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 1.4px; text-transform: uppercase;
        padding: 6px 12px; border-radius: 999px;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
        box-shadow: 0 8px 24px -10px rgba(0,0,0,0.5);
      }
      .plg-chip {
        background: rgba(92,184,204,0.10);
        border: 1px solid rgba(92,184,204,0.32);
        color: ${T.cerulean};
        transform: rotate(-1deg);
      }
      .plg-chip-score {
        background: rgba(245,166,35,0.12);
        border: 1px solid rgba(245,166,35,0.40);
        color: ${T.amber};
        transform: rotate(1.5deg);
        font-size: 12.5px;
      }
      .plg-chip-neutral {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.14);
        color: rgba(255,255,255,0.72);
        transform: rotate(-1.5deg);
      }
      .plg-chip-mint {
        background: rgba(142,224,122,0.12);
        border: 1px solid rgba(142,224,122,0.40);
        color: ${T.mint};
        transform: rotate(2deg);
      }
      @media (max-width: 640px) {
        .plg-hero-chips .lp-chip { transform: none !important; font-size: 10.5px; }
      }

      .plg-slogan {
        font-family: ${T.body}; font-weight: 700;
        font-size: clamp(40px, 6.6vw, 80px);
        line-height: 0.98; letter-spacing: -2.4px;
        color: ${T.text}; margin: 0;
      }
      .plg-slogan em {
        font-family: inherit; font-style: normal; font-weight: inherit;
        letter-spacing: inherit; color: ${T.amber};
      }
      .plg-tagline {
        font-family: ${T.body}; font-weight: 500;
        font-size: clamp(17px, 2vw, 24px);
        line-height: 1.3; letter-spacing: -0.4px;
        color: ${T.textSoft}; margin: 0;
      }
      .plg-tagline em { font-style: normal; font-weight: 600; color: ${T.amber}; }
      .plg-hero-sub {
        font-family: ${T.body}; font-style: normal;
        font-size: 15px; font-weight: 300; line-height: 1.7;
        color: ${T.textSoft};
        max-width: 620px; margin: 0;
      }

      /* Chips compat — neutres + variante GRATUIT ambre */
      .plg-compat {
        display: flex; flex-wrap: wrap; gap: 8px;
        justify-content: center;
      }
      .plg-compat-chip {
        font-family: ${T.mono}; font-size: 10px; font-weight: 500;
        letter-spacing: 1.4px; text-transform: uppercase;
        padding: 5px 12px; border-radius: 999px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.14);
        color: rgba(255,255,255,0.72);
        white-space: nowrap;
      }
      .plg-compat-free {
        background: rgba(245,166,35,0.08);
        border-color: rgba(245,166,35,0.40);
        color: ${T.amber};
      }

      .plg-cta-row {
        margin-top: 0;
        display: flex; flex-wrap: wrap; gap: 12px;
        justify-content: center; align-items: center;
      }
      /* CTAs — même grammaire que la landing (lp-cta-*), redéclarée
         localement pour que la page soit autonome. Le <a> download
         hérite du même style que le <button>. */
      .plg-screen .lp-cta-primary {
        display: inline-flex; align-items: center; justify-content: center;
        padding: 16px 32px;
        background: transparent; color: ${T.amber};
        border: 1px solid rgba(245,166,35,0.55); border-radius: 999px;
        font-family: ${T.mono}; font-size: 12px; font-weight: 500;
        letter-spacing: 1.8px; text-transform: uppercase;
        cursor: pointer; transition: all .15s;
        text-decoration: none;
      }
      .plg-screen .lp-cta-primary:hover:not(:disabled) {
        border-color: ${T.amber};
        background: rgba(245,166,35,0.08);
        box-shadow: 0 0 0 6px rgba(245,166,35,0.06);
      }
      .plg-screen .lp-cta-primary:disabled {
        opacity: 0.45; cursor: not-allowed;
      }
      /* Glyphe plateforme dans les boutons de téléchargement */
      .plg-dl-ico { margin-right: 9px; flex-shrink: 0; }
      /* Note sous les CTAs (visiteur non connecté) : le download passe par
         un compte gratuit — on l'annonce plutôt que de surprendre au clic. */
      .plg-dl-note {
        margin: 12px 0 0; text-align: center;
        font-size: 13px; color: ${T.textMuted || 'rgba(240,240,245,0.55)'};
      }
      /* Numéro de version sous les CTAs — discret, grammaire mono
         uppercase de la charte. Source unique : PLUGIN_VERSION.
         Rythme vertical homogène (demande David 2026-07-07) : chips
         compat → CTAs → version → vidéo, tout à 26px = le gap du
         hero-inner. Donc AUCUNE marge ici, et le padding bas du hero
         vaut 26px aussi. */
      .plg-version-note {
        margin: 0; text-align: center;
        font-family: ${T.mono}; font-size: 10px; font-weight: 500;
        letter-spacing: 1.8px; text-transform: uppercase;
        color: ${T.muted};
      }
      .plg-version-note + .plg-dl-note { margin-top: -18px; }
      .plg-screen .lp-cta-secondary {
        display: inline-flex; align-items: center; justify-content: center;
        padding: 16px 28px;
        background: transparent; color: ${T.text};
        border: 1px solid rgba(255,255,255,0.28); border-radius: 999px;
        font-family: ${T.mono}; font-size: 12px; font-weight: 500;
        letter-spacing: 1.8px; text-transform: uppercase;
        cursor: pointer; transition: all .15s;
      }
      .plg-screen .lp-cta-secondary:hover {
        border-color: rgba(255,255,255,0.45);
        background: rgba(255,255,255,0.04);
      }

      /* ── VIDÉO plein format ───────────────────────── */
      .plg-big-video {
        max-width: 960px; margin: 0 auto;
        padding: 0 24px;
      }
      .plg-video-frame {
        position: relative; aspect-ratio: 16 / 9;
        border-radius: 18px; overflow: hidden;
        background: ${T.s1};
        border: 1px solid ${T.borderStrong};
        box-shadow: 0 24px 64px -20px rgba(0,0,0,0.7);
      }
      .plg-video-el {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover; display: block;
        background: ${T.s1};
      }
      .plg-video-ph {
        position: absolute; inset: 0;
        display: grid; place-items: center;
        background:
          radial-gradient(ellipse 60% 50% at 30% 30%, rgba(92,184,204,0.10), transparent),
          radial-gradient(ellipse 50% 45% at 75% 70%, rgba(245,166,35,0.08), transparent);
      }
      .plg-video-play {
        width: 72px; height: 72px; border-radius: 50%;
        display: grid; place-items: center;
        color: ${T.amber};
        background: rgba(245,166,35,0.14);
        border: 1px solid rgba(245,166,35,0.5);
      }
      .plg-video-play svg { margin-left: 4px; }
      .plg-video-note {
        position: absolute; bottom: 14px; left: 50%;
        transform: translateX(-50%);
        font-family: ${T.mono}; font-size: 9.5px; font-weight: 500;
        letter-spacing: 1.6px; text-transform: uppercase;
        color: ${T.muted}; white-space: nowrap;
      }

      /* ── SECTIONS ─────────────────────────────────── */
      .plg-section {
        padding: clamp(64px, 10vw, 116px) 24px;
        max-width: 1080px; margin: 0 auto;
      }
      .plg-divider {
        width: 100%; max-width: 960px; margin: 0 auto;
        height: 1px;
        background: linear-gradient(90deg,
          transparent, rgba(255,255,255,0.10), transparent);
      }
      .plg-eyebrow {
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 2.4px; color: ${T.amber}; text-transform: uppercase;
        text-align: center; margin-bottom: 18px;
      }
      .plg-section-title {
        font-family: ${T.body}; font-weight: 500;
        font-size: clamp(24px, 3.4vw, 38px);
        letter-spacing: -0.8px; line-height: 1.15;
        color: ${T.textSoft};
        text-align: center; max-width: 720px; margin: 0 auto 16px;
      }
      .plg-section-title em {
        font-style: normal; font-weight: 600; color: ${T.amber};
      }

      /* ── ÉTAPES ───────────────────────────────────── */
      .plg-steps {
        display: grid; grid-template-columns: repeat(3, 1fr);
        gap: 20px; margin-top: 48px;
      }
      .plg-step {
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 16px; padding: 26px 22px; text-align: left;
        transform: rotate(var(--card-rot, 0deg));
        transition: border-color .18s, transform .18s;
      }
      /* Rotation sticker subtile par position — même grammaire que les
         .lp-diff-card de la home. Neutralisée en mobile (1 col). */
      .plg-steps > .plg-step:nth-child(1) { --card-rot: -1deg; }
      .plg-steps > .plg-step:nth-child(2) { --card-rot:  1.5deg; }
      .plg-steps > .plg-step:nth-child(3) { --card-rot: -1.5deg; }
      .plg-step:hover { border-color: ${T.borderStrong}; transform: rotate(var(--card-rot, 0deg)) translateY(-2px); }
      .plg-step-num {
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 2px; color: ${T.amber}; margin-bottom: 12px;
      }
      .plg-step-title {
        font-family: ${T.body}; font-size: 16px; font-weight: 600;
        color: ${T.text}; margin-bottom: 8px;
      }
      .plg-step-body {
        font-family: ${T.body}; font-size: 13.5px; font-weight: 300;
        line-height: 1.65; color: ${T.muted};
      }

      /* ── FEATURES ─────────────────────────────────── */
      .plg-feat-grid {
        display: grid; grid-template-columns: repeat(2, 1fr);
        gap: 20px; margin-top: 48px;
      }
      .plg-feat {
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 16px; padding: 26px 24px;
        transform: rotate(var(--card-rot, 0deg));
        transition: border-color .18s, transform .18s;
      }
      .plg-feat-grid > .plg-feat:nth-child(1) { --card-rot: -1deg; }
      .plg-feat-grid > .plg-feat:nth-child(2) { --card-rot:  1deg; }
      .plg-feat-grid > .plg-feat:nth-child(3) { --card-rot:  1.5deg; }
      .plg-feat-grid > .plg-feat:nth-child(4) { --card-rot: -1.5deg; }
      .plg-feat-grid > .plg-feat:nth-child(5) { --card-rot:  1deg; }
      .plg-feat-grid > .plg-feat:nth-child(6) { --card-rot: -1deg; }
      .plg-feat:hover { transform: rotate(var(--card-rot, 0deg)) translateY(-2px); }
      .plg-feat-cerulean:hover { border-color: rgba(92,184,204,0.40); }
      .plg-feat-violet:hover   { border-color: rgba(166,126,245,0.40); }
      .plg-feat-amber:hover    { border-color: rgba(245,166,35,0.40); }
      .plg-feat-mint:hover     { border-color: rgba(142,224,122,0.40); }
      .plg-feat-tag {
        display: inline-flex;
        font-family: ${T.mono}; font-size: 9.5px; font-weight: 500;
        letter-spacing: 1.8px; text-transform: uppercase;
        padding: 4px 10px; border-radius: 999px; margin-bottom: 14px;
      }
      .plg-feat-cerulean .plg-feat-tag { background: rgba(92,184,204,0.10); border: 1px solid rgba(92,184,204,0.32); color: ${T.cerulean}; }
      .plg-feat-violet   .plg-feat-tag { background: rgba(166,126,245,0.10); border: 1px solid rgba(166,126,245,0.32); color: #c2a8ff; }
      .plg-feat-amber    .plg-feat-tag { background: rgba(245,166,35,0.10); border: 1px solid rgba(245,166,35,0.32); color: ${T.amber}; }
      .plg-feat-mint     .plg-feat-tag { background: rgba(142,224,122,0.10); border: 1px solid rgba(142,224,122,0.32); color: ${T.mint}; }
      .plg-feat-title {
        font-family: ${T.body}; font-size: 17px; font-weight: 600;
        color: ${T.text}; margin: 0 0 8px;
      }
      .plg-feat-body {
        font-family: ${T.body}; font-size: 13.5px; font-weight: 300;
        line-height: 1.65; color: ${T.muted}; margin: 0;
      }
      .plg-feat-note {
        font-family: ${T.body}; font-size: 14px; font-weight: 300;
        line-height: 1.7; color: ${T.muted};
        text-align: center; max-width: 620px;
        margin: 36px auto 0;
      }

      /* ── FOOTER ───────────────────────────────────── */
      .plg-footer {
        padding: clamp(72px, 11vw, 128px) 24px clamp(48px, 8vw, 80px);
        max-width: 760px; margin: 0 auto;
        display: flex; flex-direction: column; align-items: center;
        gap: 28px; text-align: center;
      }
      .plg-footer-quote {
        font-family: ${T.body}; font-weight: 500;
        font-size: clamp(20px, 2.6vw, 30px);
        line-height: 1.3; letter-spacing: -0.5px;
        color: ${T.textSoft}; margin: 0;
      }
      .plg-footer-quote em {
        font-family: inherit; font-style: normal; font-weight: 600;
        letter-spacing: inherit; color: ${T.amber};
      }
      .plg-back-link {
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 1.6px; text-transform: uppercase;
        color: ${T.muted};
        background: transparent; border: 0; padding: 4px 6px;
        cursor: pointer; transition: color .15s;
      }
      .plg-back-link:hover { color: ${T.amber}; }

      /* ── RESPONSIVE ───────────────────────────────── */
      @media (max-width: 768px) {
        .plg-steps { grid-template-columns: 1fr; }
        .plg-feat-grid { grid-template-columns: 1fr; }
        /* 1 colonne : la lecture prime sur l'effet sticker (même règle
           que la home). */
        .plg-steps > .plg-step,
        .plg-feat-grid > .plg-feat { --card-rot: 0deg; }
        .plg-section { padding: 64px 20px; }
        .plg-hero { padding: 48px 20px 26px; }
        .plg-slogan { font-size: clamp(36px, 10vw, 56px); letter-spacing: -1.2px; }
        .plg-cta-row { flex-direction: column; gap: 10px; width: 100%; }
        .plg-cta-row > a, .plg-cta-row > button { width: 100%; max-width: 320px; }
      }
    `}</style>
  );
}
