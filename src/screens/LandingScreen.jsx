import T from '../constants/theme';

/**
 * LandingScreen — page de présentation accessible aux visiteurs ET aux
 * utilisateurs connectés (via `#/home`). Fusionne tickets 1.2 (méthodologie
 * "comment on évalue") et 3.1 (landing publique) en sections scrollables.
 *
 * Visiteur non connecté → onStart bascule vers AuthScreen.
 * Utilisateur connecté → onStart renvoie sur le dashboard ; libellés des
 * CTAs adaptés via ctaPrimaryLabel / ctaFooterLabel.
 */
export default function LandingScreen({
  onStart,
  onViewSample,
  ctaPrimaryLabel = 'Analyser mon premier titre',
  ctaFooterLabel = 'Commencer gratuitement',
}) {
  return (
    <div className="landing-screen">
      <LandingStyles />

      {/* HERO */}
      <header className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-logo-row">
            <img src="/logo-versions-2.svg" alt="" className="lp-logo-img" />
            <div className="lp-brand">
              {'VER'}<span className="accent">{'Si'}</span>{'ONS'}
            </div>
          </div>

          <div className="lp-tagline">
            <span className="lp-tagline-dot">●</span>
            UN COMPAGNON DE STUDIO, PAS UN JUGE
          </div>

          <h1 className="lp-headline">
            Versions écoute votre musique,<br />
            <em>comprend votre intention,</em><br />
            et vous guide pour améliorer votre mix.
          </h1>

          <div className="lp-cta-row">
            <button type="button" onClick={onStart} className="lp-cta-primary">
              {ctaPrimaryLabel}
            </button>
            {onViewSample && (
              <button type="button" onClick={onViewSample} className="lp-cta-secondary">
                Voir un exemple
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="lp-divider" />

      {/* CE QUI NOUS REND DIFFÉRENTS */}
      <section className="lp-section">
        <div className="lp-section-eyebrow">CE QUI NOUS REND DIFFÉRENTS</div>
        <h2 className="lp-section-title">
          Pas un rapport. <em>Un dialogue.</em>
        </h2>

        <div className="lp-diff-grid">
          <article className="lp-diff-card">
            <div className="lp-diff-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </div>
            <h3 className="lp-diff-title">Un ingé son qui vous connaît</h3>
            <p className="lp-diff-body">
              Le chat contextuel illimité — pas un rapport statique. Posez
              toutes vos questions, demandez les détails, contestez l'analyse.
              Versions garde le fil de votre projet, version après version.
            </p>
          </article>

          <article className="lp-diff-card">
            <div className="lp-diff-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <h3 className="lp-diff-title">Votre intention en premier</h3>
            <p className="lp-diff-body">
              On ne juge pas votre morceau dans l'absolu. L'analyse est
              calibrée sur ce que <em>vous</em> cherchez : l'émotion, le
              genre, le rendu sonore visé. Vos références deviennent la
              boussole.
            </p>
          </article>

          <article className="lp-diff-card">
            <div className="lp-diff-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <h3 className="lp-diff-title">Des recommandations applicables</h3>
            <p className="lp-diff-body">
              Pas de "votre haut médium est un peu chargé". Des valeurs
              techniques concrètes, des plages de fréquences, des plugins
              adaptés à votre DAW. Vous repartez avec un plan d'action.
            </p>
          </article>

          <article className="lp-diff-card">
            <div className="lp-diff-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h4l3-9 4 18 3-9h4"/>
              </svg>
            </div>
            <h3 className="lp-diff-title">Le suivi par versions</h3>
            <p className="lp-diff-body">
              V1, V2, V3… Versions garde la mémoire de chaque itération.
              La progression est mesurée — vous voyez ce qui s'améliore et
              ce qui reste à creuser, sans repartir à zéro à chaque mix.
            </p>
          </article>
        </div>
      </section>

      <div className="lp-divider" />

      {/* CE QU'ON ANALYSE */}
      <section className="lp-section">
        <div className="lp-section-eyebrow">CE QU'ON ANALYSE</div>
        <h2 className="lp-section-title">
          Six axes, <em>une écoute complète.</em>
        </h2>
        <p className="lp-section-lede">
          Chaque axe combine une analyse DSP objective et un jugement IA
          calibré sur votre intention. Aucune note n'est posée sans
          justification.
        </p>

        <div className="lp-axes-grid">
          <AxeCard num="01" label="Équilibre fréquentiel" desc="Bas, médiums, aigus — pondération entre les bandes, masquages, courbe globale." />
          <AxeCard num="02" label="Dynamique" desc="Crest factor, plage dynamique, transitoires, gestion de la compression." />
          <AxeCard num="03" label="Image stéréo" desc="Largeur, mono-compatibilité, équilibre L/R, placement des éléments." />
          <AxeCard num="04" label="Espace et profondeur" desc="Réverbérations, delays, plans avant/arrière, lecture spatiale du mix." />
          <AxeCard num="05" label="Cohérence globale" desc="Tenue d'ensemble, fluidité entre sections, identité sonore." />
          <AxeCard num="06" label="Voix" desc="Intelligibilité, présence, sibilances, intégration au reste du mix." />
        </div>
      </section>

      <div className="lp-divider" />

      {/* CE QU'ON NE FAIT PAS */}
      <section className="lp-section lp-section-tight">
        <div className="lp-section-eyebrow">CE QU'ON NE FAIT PAS</div>
        <h2 className="lp-section-title">
          <em>Honnête</em> sur nos limites.
        </h2>

        <div className="lp-nope-grid">
          <div className="lp-nope-item">
            <span className="lp-nope-mark" aria-hidden="true">×</span>
            <p>On ne dicte pas vos arrangements. La structure, les choix créatifs, le parti-pris artistique — c'est votre territoire.</p>
          </div>
          <div className="lp-nope-item">
            <span className="lp-nope-mark" aria-hidden="true">×</span>
            <p>On ne remplace pas un ingé son humain. On rend l'expertise accessible quand elle ne l'était pas — pour préparer votre prochain rendez-vous studio, pas pour l'éviter.</p>
          </div>
          <div className="lp-nope-item">
            <span className="lp-nope-mark" aria-hidden="true">×</span>
            <p>Le score n'est pas une vérité absolue. C'est un repère, calibré sur votre intention, pas un verdict.</p>
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* FOOTER CTA */}
      <footer className="lp-footer">
        <h2 className="lp-footer-quote">
          Votre musique. <em>Votre vision.</em><br />
          Notre accompagnement.
        </h2>
        <button type="button" onClick={onStart} className="lp-cta-primary lp-cta-footer">
          {ctaFooterLabel}
        </button>
        <div className="lp-footer-mark">
          {'VER'}<span className="accent">{'Si'}</span>{'ONS'}
        </div>
      </footer>
    </div>
  );
}

function AxeCard({ num, label, desc }) {
  return (
    <div className="lp-axe-card">
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
        min-height: 100vh; min-height: 100dvh;
        background:
          radial-gradient(ellipse 900px 620px at 78% 8%, rgba(245,166,35,0.10), transparent 70%),
          radial-gradient(ellipse 720px 900px at 12% 42%, rgba(92,184,204,0.10), transparent 70%),
          radial-gradient(ellipse 820px 720px at 85% 78%, rgba(166,126,245,0.08), transparent 70%),
          var(--bg, ${T.black});
        color: var(--text, ${T.text});
        font-family: var(--body, ${T.body});
        overflow-x: hidden;
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
      .lp-logo-row {
        display: flex; flex-direction: column; align-items: center; gap: 14px;
      }
      .lp-logo-img {
        height: 56px; width: auto;
        filter: drop-shadow(0 0 32px rgba(245,166,35,0.22));
      }
      .lp-brand {
        font-family: ${T.body}; font-weight: 700;
        font-size: clamp(28px, 4.5vw, 36px);
        letter-spacing: -0.6px; color: ${T.text}; line-height: 1;
      }
      .lp-brand .accent, .lp-footer-mark .accent {
        color: ${T.amber}; font-style: normal;
      }
      .lp-tagline {
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 2.4px; color: ${T.amber}; text-transform: uppercase;
        display: flex; align-items: center; gap: 10px;
      }
      .lp-tagline-dot { font-size: 10px; opacity: 0.6; line-height: 1; }
      .lp-headline {
        font-family: 'Cormorant Garamond', ${T.serif};
        font-weight: 400;
        font-size: clamp(28px, 5.2vw, 48px);
        line-height: 1.18; letter-spacing: -0.3px;
        color: ${T.text}; max-width: 680px; margin: 8px 0 0;
      }
      .lp-headline em {
        font-style: italic; color: ${T.amber}; font-weight: 400;
      }

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
      /* CTA secondaire — texte muté + bordure très douce, hiérarchie claire
         vs le primary ambre. */
      .lp-cta-secondary {
        padding: 16px 28px;
        background: transparent; color: ${T.textSoft};
        border: 1px solid ${T.border}; border-radius: 999px;
        font-family: ${T.mono}; font-size: 12px; font-weight: 500;
        letter-spacing: 1.8px; text-transform: uppercase;
        cursor: pointer; transition: all .15s;
      }
      .lp-cta-secondary:hover {
        color: ${T.text};
        border-color: ${T.borderStrong};
        background: rgba(255,255,255,0.02);
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
      .lp-section-title {
        font-family: 'Cormorant Garamond', ${T.serif};
        font-weight: 400;
        font-size: clamp(28px, 4.4vw, 40px);
        line-height: 1.2; letter-spacing: -0.2px;
        color: ${T.text}; text-align: center;
        max-width: 720px; margin: 0 auto;
      }
      .lp-section-title em {
        font-style: italic; color: ${T.amber}; font-weight: 400;
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
        display: grid; gap: 16px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .lp-diff-card {
        position: relative;
        padding: 28px 26px;
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 16px;
        display: flex; flex-direction: column; gap: 12px;
        transition: border-color .2s, transform .2s;
      }
      .lp-diff-card:hover {
        border-color: rgba(245,166,35,0.30);
        transform: translateY(-2px);
      }
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
      .lp-diff-body em { color: ${T.amber}; font-style: italic; }

      /* ── AXES GRID (2×3 desktop) ──────────────────── */
      .lp-axes-grid {
        margin-top: clamp(40px, 6vw, 64px);
        display: grid; gap: 1px;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        background: ${T.border};
        border: 1px solid ${T.border};
        border-radius: 14px;
        overflow: hidden;
      }
      .lp-axe-card {
        background: ${T.s1};
        padding: 26px 22px;
        display: flex; gap: 14px; align-items: flex-start;
        transition: background .2s;
      }
      .lp-axe-card:hover { background: ${T.s2}; }
      .lp-axe-num {
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 1.5px; color: ${T.amber};
        padding-top: 2px; flex-shrink: 0;
      }
      .lp-axe-body { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
      .lp-axe-label {
        font-family: ${T.body}; font-weight: 500; font-size: 15px;
        color: ${T.text};
      }
      .lp-axe-desc {
        font-family: ${T.body}; font-weight: 300; font-size: 13px;
        line-height: 1.55; color: ${T.muted};
      }

      /* ── NOPE LIST ────────────────────────────────── */
      .lp-nope-grid {
        margin-top: clamp(36px, 5vw, 56px);
        display: grid; gap: 14px;
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .lp-nope-item {
        padding: 22px 20px;
        background: transparent;
        border: 1px solid ${T.border};
        border-radius: 14px;
        display: flex; gap: 12px; align-items: flex-start;
      }
      .lp-nope-mark {
        font-family: ${T.serif}; font-size: 24px; line-height: 1;
        color: ${T.muted2}; flex-shrink: 0; padding-top: 2px;
      }
      .lp-nope-item p {
        font-family: ${T.body}; font-weight: 300; font-size: 13.5px;
        line-height: 1.6; color: ${T.textSoft}; margin: 0;
      }

      /* ── FOOTER ───────────────────────────────────── */
      .lp-footer {
        padding: clamp(80px, 12vw, 140px) 24px clamp(48px, 8vw, 80px);
        max-width: 760px; margin: 0 auto;
        display: flex; flex-direction: column; align-items: center;
        gap: 28px; text-align: center;
      }
      .lp-footer-quote {
        font-family: 'Cormorant Garamond', ${T.serif};
        font-weight: 400;
        font-size: clamp(26px, 4.6vw, 38px);
        line-height: 1.25; letter-spacing: -0.2px;
        color: ${T.text}; margin: 0;
      }
      .lp-footer-quote em {
        font-style: italic; color: ${T.amber}; font-weight: 400;
      }
      .lp-cta-footer { margin-top: 4px; }
      .lp-footer-mark {
        margin-top: 28px;
        font-family: ${T.body}; font-weight: 700;
        font-size: 18px; letter-spacing: -0.3px;
        color: ${T.muted2};
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
      }
    `}</style>
  );
}
