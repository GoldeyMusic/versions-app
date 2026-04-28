import T from '../constants/theme';
import useLang from '../hooks/useLang';

/**
 * PricingScreen — page tarifs publique (#/pricing).
 *
 * Modèle : pay-per-use avec packs régressifs + abonnements pour usage
 * intensif. Pas de plan gratuit.
 *
 * Layout volontairement différent des concurrents (pas de "3 cartes
 * abos côte à côte" qui occupent toute la page) : deux sections
 * distinctes, l'À la carte en cartes compactes verticales (4 packs)
 * pour mettre en valeur la dégressivité, les Abonnements en lignes
 * éditoriales horizontales pour donner du poids au récurrent.
 *
 * Tous les prix en placeholders (XX) — David remplira au fil des
 * décisions produit.
 */
export default function PricingScreen({
  onStart,
  onBackToLanding,
  ctaPrimaryLabel,
}) {
  const { s } = useLang();
  const ctaLabel = ctaPrimaryLabel || s?.landing?.ctaPrimary || 'COMMENCER';

  return (
    <div className="pr-screen">
      <PricingStyles />

      {/* TOPBAR — logo cliquable + lien retour landing */}
      <header className="pr-topbar">
        <button
          type="button"
          className="pr-topbar-brand"
          onClick={onBackToLanding}
          aria-label="Retour à l'accueil"
        >
          <img src="/logo-versions-2.svg" alt="" className="pr-topbar-logo" />
          <span className="pr-topbar-wordmark">
            VER<span className="accent">Si</span>ONS
          </span>
        </button>
        <nav className="pr-topbar-nav" aria-label="Navigation">
          <button type="button" className="pr-topbar-link" onClick={onBackToLanding}>
            Accueil
          </button>
          <span className="pr-topbar-current" aria-current="page">Tarifs</span>
        </nav>
      </header>

      {/* HERO */}
      <section className="pr-hero">
        <div className="pr-hero-inner">
          <div className="pr-eyebrow">Tarifs</div>
          <h1 className="pr-hero-title">
            Paie ce que <em>tu mixes</em>.
          </h1>
          <p className="pr-hero-sub">
            Une analyse à l'unité, un pack pour creuser un projet,
            ou un abonnement dès que tu mixes en série. Pas d'engagement caché.
          </p>
        </div>
      </section>

      {/* ── À LA CARTE — 4 packs en cartes verticales compactes ─────── */}
      <section className="pr-section pr-section-tight">
        <div className="pr-section-eyebrow">À la carte</div>
        <h2 className="pr-section-title">
          Une analyse, un pack, <em>aucun engagement</em>.
        </h2>

        <div className="pr-packs-grid">
          {/* Pack 1 analyse — entrée */}
          <article className="pr-pack pr-pack-cerulean">
            <div className="pr-pack-qty">
              <span className="pr-pack-num">1</span>
              <span className="pr-pack-unit">Analyse</span>
            </div>
            <div className="pr-pack-price">
              <span className="pr-price-amount">4,90</span>
              <span className="pr-price-currency">€</span>
            </div>
            <div className="pr-pack-meta">
              <div className="pr-pack-unit-line">4,90 €/analyse</div>
              <div className="pr-pack-validity">Valable 12 mois</div>
            </div>
            <button type="button" className="pr-cta-secondary" onClick={onStart}>
              Acheter
            </button>
          </article>

          {/* Pack 3 */}
          <article className="pr-pack pr-pack-mint">
            <div className="pr-pack-qty">
              <span className="pr-pack-num">3</span>
              <span className="pr-pack-unit">Analyses</span>
            </div>
            <div className="pr-pack-price">
              <span className="pr-price-amount">12,90</span>
              <span className="pr-price-currency">€</span>
            </div>
            <div className="pr-pack-meta">
              <div className="pr-pack-unit-line">4,30 €/analyse</div>
              <div className="pr-saving-chip">−12 %</div>
            </div>
            <button type="button" className="pr-cta-secondary" onClick={onStart}>
              Acheter
            </button>
          </article>

          {/* Pack 5 */}
          <article className="pr-pack pr-pack-violet">
            <div className="pr-pack-qty">
              <span className="pr-pack-num">5</span>
              <span className="pr-pack-unit">Analyses</span>
            </div>
            <div className="pr-pack-price">
              <span className="pr-price-amount">19,90</span>
              <span className="pr-price-currency">€</span>
            </div>
            <div className="pr-pack-meta">
              <div className="pr-pack-unit-line">3,98 €/analyse</div>
              <div className="pr-saving-chip">−19 %</div>
            </div>
            <button type="button" className="pr-cta-secondary" onClick={onStart}>
              Acheter
            </button>
          </article>

          {/* Pack 10 — Featured */}
          <article className="pr-pack pr-pack-amber pr-pack-featured">
            <div className="pr-pack-ribbon">Le plus pris</div>
            <div className="pr-pack-qty">
              <span className="pr-pack-num">10</span>
              <span className="pr-pack-unit">Analyses</span>
            </div>
            <div className="pr-pack-price">
              <span className="pr-price-amount">34,90</span>
              <span className="pr-price-currency">€</span>
            </div>
            <div className="pr-pack-meta">
              <div className="pr-pack-unit-line">3,49 €/analyse</div>
              <div className="pr-saving-chip pr-saving-chip-amber">−29 %</div>
            </div>
            <button type="button" className="pr-cta-primary" onClick={onStart}>
              Acheter
            </button>
          </article>
        </div>

        {/* Bandeau "tout est inclus" sous les packs */}
        <div className="pr-included-strip">
          <span className="pr-included-label">Inclus dans toutes les analyses</span>
          <span className="pr-included-bullet">Fiche complète</span>
          <span className="pr-included-bullet">Chat contextuel</span>
          <span className="pr-included-bullet">Comparaison de versions</span>
          <span className="pr-included-bullet">Export PDF + Score Card PNG</span>
          <span className="pr-included-bullet">Suivi d'évolution</span>
        </div>
      </section>

      {/* ── ABONNEMENTS — lignes éditoriales horizontales ───────────── */}
      <section className="pr-section">
        <div className="pr-section-eyebrow">Abonnements</div>
        <h2 className="pr-section-title">
          Au-delà de 10 analyses, <em>passe en abo</em>.
        </h2>
        <p className="pr-section-lede">
          Une enveloppe d'analyses chaque mois, prix unitaire imbattable.
          Tu peux changer de palier ou résilier à tout moment.
        </p>

        <div className="pr-subs-stack">
          {/* Abo Indé */}
          <article className="pr-sub pr-sub-cerulean">
            <div className="pr-sub-meta">
              <div className="pr-sub-name">Indé</div>
              <div className="pr-sub-tag">Pour l'artiste qui sort en continu</div>
            </div>
            <div className="pr-sub-allowance">
              <span className="pr-sub-num">8</span>
              <span className="pr-sub-unit">analyses<br />par mois</span>
            </div>
            <div className="pr-sub-price">
              <span className="pr-price-amount">24,90</span>
              <span className="pr-price-suffix">€<span>/mois</span></span>
              <span className="pr-sub-unit-line">soit 3,11 €/analyse</span>
            </div>
            <button type="button" className="pr-cta-secondary" onClick={onStart}>
              Choisir
            </button>
          </article>

          {/* Abo Pro — Featured */}
          <article className="pr-sub pr-sub-amber pr-sub-featured">
            <div className="pr-sub-ribbon">Recommandé</div>
            <div className="pr-sub-meta">
              <div className="pr-sub-name">Pro</div>
              <div className="pr-sub-tag">Pour la production intensive</div>
            </div>
            <div className="pr-sub-allowance">
              <span className="pr-sub-num">25</span>
              <span className="pr-sub-unit">analyses<br />par mois</span>
            </div>
            <div className="pr-sub-price">
              <span className="pr-price-amount">74,90</span>
              <span className="pr-price-suffix">€<span>/mois</span></span>
              <span className="pr-sub-unit-line">soit 3,00 €/analyse</span>
            </div>
            <button type="button" className="pr-cta-primary" onClick={onStart}>
              {ctaLabel}
            </button>
          </article>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <section className="pr-section pr-section-tight">
        <div className="pr-section-eyebrow">Questions fréquentes</div>
        <h2 className="pr-section-title">
          Avant de te lancer, <em>tu peux tout savoir</em>.
        </h2>

        <div className="pr-faq">
          <PrFaq
            q="Mes analyses expirent-elles ?"
            a="Les analyses des packs sont valables 12 mois à compter de l'achat. Les analyses incluses dans un abonnement se rechargent chaque mois et ne sont pas reportables — mais tes fiches déjà générées, elles, restent à vie dans ton dashboard."
          />
          <PrFaq
            q="Puis-je cumuler un pack et un abonnement ?"
            a="Oui. Les analyses d'un pack restent disponibles en plus de ton enveloppe mensuelle. On consomme d'abord l'enveloppe abo, puis les analyses du pack — tu ne perds rien."
          />
          <PrFaq
            q="Puis-je résilier mon abonnement à tout moment ?"
            a="Oui, sans frais. La résiliation prend effet à la fin du mois en cours. Tes fiches déjà générées restent accessibles à vie dans ton dashboard, même après résiliation."
          />
          <PrFaq
            q="Que se passe-t-il si j'épuise mon enveloppe mensuelle ?"
            a="On te propose d'acheter un pack d'appoint ou de passer au palier supérieur — pas de coupure brutale, et jamais d'analyse facturée à ton insu."
          />
          <PrFaq
            q="Y a-t-il une limite de durée par fichier audio ?"
            a="Oui, 12 minutes maximum par fichier. C'est largement suffisant pour un titre, et ça nous permet de garantir des prix bas en maîtrisant les coûts d'analyse."
          />
          <PrFaq
            q="Les tarifs sont-ils HT ou TTC ?"
            a="Tous les prix affichés sont TTC (TVA française incluse). Une facture conforme est générée automatiquement après chaque achat."
          />
        </div>
      </section>

      {/* FOOTER simple */}
      <footer className="pr-footer">
        <div className="pr-footer-mark">
          VER<span className="accent">Si</span>ONS
        </div>
        <div className="pr-footer-line">
          Une question avant de te lancer ?{' '}
          <a href="mailto:hello@versions.studio">hello@versions.studio</a>
        </div>
      </footer>
    </div>
  );
}

/* ── Item FAQ ──────────────────────────────────────────── */
function PrFaq({ q, a }) {
  return (
    <details className="pr-faq-item">
      <summary>
        <span>{q}</span>
        <span className="pr-faq-chev" aria-hidden="true">+</span>
      </summary>
      <p>{a}</p>
    </details>
  );
}

/* ── Styles ────────────────────────────────────────────── */
function PricingStyles() {
  return (
    <style>{`
      .pr-screen {
        position: relative; z-index: 1;
        min-height: 100vh; min-height: 100dvh;
        background: transparent;
        color: var(--text, ${T.text});
        font-family: var(--body, ${T.body});
        overflow-x: hidden;
      }

      /* ── TOPBAR ───────────────────────────────────── */
      .pr-topbar {
        position: relative; z-index: 2;
        max-width: 1180px; margin: 0 auto;
        padding: 22px 28px;
        display: flex; align-items: center; justify-content: space-between;
        gap: 24px;
      }
      .pr-topbar-brand {
        display: inline-flex; align-items: center; gap: 10px;
        background: transparent; border: 0; cursor: pointer;
        padding: 4px 6px; border-radius: 8px;
        transition: opacity .15s;
      }
      .pr-topbar-brand:hover { opacity: 0.82; }
      .pr-topbar-logo {
        height: 26px; width: auto;
        filter: drop-shadow(0 0 16px rgba(245,166,35,0.18));
      }
      .pr-topbar-wordmark {
        font-family: ${T.body}; font-weight: 700;
        font-size: 17px; letter-spacing: -0.4px;
        color: ${T.text}; line-height: 1;
      }
      .pr-topbar-wordmark .accent { color: ${T.amber}; font-style: normal; }

      .pr-topbar-nav {
        display: inline-flex; align-items: center; gap: 8px;
      }
      .pr-topbar-link, .pr-topbar-current {
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 1.6px; text-transform: uppercase;
        padding: 9px 16px; border-radius: 999px;
        transition: all .15s;
      }
      .pr-topbar-link {
        background: transparent; color: ${T.textSoft};
        border: 1px solid transparent; cursor: pointer;
      }
      .pr-topbar-link:hover {
        color: ${T.text};
        background: rgba(255,255,255,0.04);
        border-color: rgba(255,255,255,0.10);
      }
      .pr-topbar-current {
        color: ${T.amber};
        background: rgba(245,166,35,0.06);
        border: 1px solid rgba(245,166,35,0.32);
      }

      /* ── HERO ─────────────────────────────────────── */
      .pr-hero {
        padding: clamp(48px, 8vw, 96px) 24px clamp(24px, 4vw, 56px);
        display: grid; place-items: center;
      }
      .pr-hero-inner {
        width: 100%; max-width: 760px;
        display: flex; flex-direction: column; align-items: center;
        gap: 22px; text-align: center;
        animation: fadeup .5s ease;
      }
      .pr-eyebrow {
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 2.4px; color: ${T.amber}; text-transform: uppercase;
      }
      .pr-hero-title {
        font-family: ${T.body}; font-weight: 700;
        font-size: clamp(40px, 6.4vw, 72px);
        line-height: 1.0; letter-spacing: -2px;
        color: ${T.text}; margin: 0;
      }
      .pr-hero-title em {
        font-family: ${T.serif}; font-style: italic; font-weight: 500;
        color: ${T.amber}; letter-spacing: -1.8px;
      }
      .pr-hero-sub {
        font-family: ${T.body}; font-size: 15px; font-weight: 300;
        line-height: 1.7; color: ${T.textSoft};
        max-width: 560px; margin: 0;
      }

      /* ── SECTIONS génériques ───────────────────────── */
      .pr-section {
        padding: clamp(56px, 8vw, 96px) 24px;
        max-width: 1180px; margin: 0 auto;
      }
      .pr-section-tight { padding: clamp(40px, 6vw, 72px) 24px; }
      .pr-section-eyebrow {
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 2.4px; color: ${T.amber}; text-transform: uppercase;
        text-align: center; margin-bottom: 18px;
      }
      .pr-section-title {
        font-family: ${T.body}; font-weight: 500;
        font-size: clamp(22px, 2.6vw, 30px);
        line-height: 1.25; letter-spacing: -0.4px;
        color: ${T.textSoft}; text-align: center;
        max-width: 760px; margin: 0 auto;
      }
      .pr-section-title em {
        font-family: ${T.serif}; font-style: italic; font-weight: 500;
        color: ${T.amber};
      }
      .pr-section-lede {
        font-family: ${T.body}; font-size: 15px; font-weight: 300;
        line-height: 1.7; color: ${T.textSoft};
        text-align: center; max-width: 560px;
        margin: 18px auto 0;
      }

      /* ── À LA CARTE — Grid 4 packs ─────────────────────────── */
      .pr-packs-grid {
        margin-top: clamp(40px, 5vw, 56px);
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
      }
      .pr-pack {
        position: relative; overflow: hidden;
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 16px;
        padding: 28px 22px 24px;
        display: flex; flex-direction: column; align-items: center;
        gap: 18px;
        text-align: center;
        transition: border-color .2s, transform .2s;
      }
      .pr-pack::before {
        content: '';
        position: absolute;
        border-radius: 50%;
        filter: blur(48px);
        opacity: 0.5;
        pointer-events: none;
        z-index: 0;
      }
      .pr-pack > * { position: relative; z-index: 1; }
      .pr-pack:hover {
        border-color: rgba(255,255,255,0.16);
        transform: translateY(-2px);
      }

      /* Variantes de halo par pack — chacun son coin pour casser
         la symétrie (jamais centré, jamais pile en coin) */
      .pr-pack-cerulean::before {
        top: -40%; right: -25%; width: 220px; height: 220px;
        background: radial-gradient(circle, rgba(92,184,204,0.45), transparent 70%);
      }
      .pr-pack-mint::before {
        bottom: -42%; left: -22%; width: 230px; height: 230px;
        background: radial-gradient(circle, rgba(142,224,122,0.42), transparent 70%);
      }
      .pr-pack-amber::before {
        top: -38%; right: -22%; width: 260px; height: 260px;
        background: radial-gradient(circle, rgba(245,166,35,0.55), transparent 70%);
        opacity: 0.6;
      }
      .pr-pack-violet::before {
        bottom: -40%; right: -22%; width: 240px; height: 240px;
        background: radial-gradient(circle, rgba(166,126,245,0.45), transparent 70%);
      }

      /* Featured pack 10 — bordure ambre + glow box-shadow */
      .pr-pack-amber {
        border-color: rgba(245,166,35,0.40);
        background: linear-gradient(180deg, rgba(245,166,35,0.04), transparent 60%), ${T.s1};
      }
      .pr-pack-featured {
        box-shadow:
          0 0 0 1px rgba(245,166,35,0.22),
          0 24px 60px -30px rgba(245,166,35,0.45);
      }
      .pr-pack-ribbon {
        position: absolute;
        top: -1px; left: 50%; transform: translateX(-50%);
        padding: 5px 14px;
        font-family: ${T.mono}; font-size: 9.5px; font-weight: 500;
        letter-spacing: 1.5px; text-transform: uppercase;
        background: ${T.amber}; color: #1a1206;
        border-radius: 0 0 8px 8px;
        z-index: 2;
      }

      /* Quantité (gros chiffre + label) */
      .pr-pack-qty {
        display: flex; flex-direction: column; align-items: center; gap: 2px;
        margin-top: 4px;
      }
      .pr-pack-num {
        font-family: ${T.serif}; font-style: italic; font-weight: 500;
        font-size: 56px; line-height: 1; letter-spacing: -2px;
        color: ${T.text};
      }
      .pr-pack-amber .pr-pack-num { color: ${T.amber}; }
      .pr-pack-unit {
        font-family: ${T.mono}; font-size: 10px; font-weight: 500;
        letter-spacing: 1.6px; text-transform: uppercase;
        color: ${T.muted};
      }

      /* Prix total */
      .pr-pack-price {
        display: flex; align-items: baseline; gap: 4px;
        font-family: ${T.body};
      }
      .pr-pack-price .pr-price-amount {
        font-size: 36px; font-weight: 600;
        letter-spacing: -1px; line-height: 1;
        color: ${T.text};
      }
      .pr-pack-amber .pr-pack-price .pr-price-amount { color: ${T.amber}; }
      .pr-price-currency {
        font-family: ${T.body}; font-weight: 500;
        font-size: 18px; color: ${T.textSoft};
      }

      /* Meta : prix unitaire + chip économie */
      .pr-pack-meta {
        display: flex; flex-direction: column; align-items: center; gap: 8px;
        min-height: 48px;
      }
      .pr-pack-unit-line {
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 1.2px; text-transform: uppercase;
        color: ${T.textSoft};
      }
      .pr-pack-validity {
        font-family: ${T.body}; font-size: 11.5px; font-weight: 300;
        color: ${T.muted2}; font-style: italic;
      }
      .pr-saving-chip {
        font-family: ${T.mono}; font-size: 10px; font-weight: 500;
        letter-spacing: 1.4px; text-transform: uppercase;
        padding: 4px 10px; border-radius: 999px;
        background: rgba(142,224,122,0.10);
        color: ${T.mint};
        border: 1px solid rgba(142,224,122,0.35);
      }
      .pr-saving-chip-amber {
        background: rgba(245,166,35,0.10);
        color: ${T.amber};
        border-color: rgba(245,166,35,0.40);
      }

      /* CTA dans un pack — pleine largeur */
      .pr-pack .pr-cta-primary,
      .pr-pack .pr-cta-secondary {
        width: 100%;
        margin-top: auto;
      }

      /* Reflow mobile pour les packs */
      @media (max-width: 980px) {
        .pr-packs-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 520px) {
        .pr-packs-grid {
          grid-template-columns: 1fr;
        }
      }

      /* ── Bandeau "tout est inclus" ──────────────── */
      .pr-included-strip {
        margin-top: clamp(28px, 4vw, 40px);
        padding: 18px 24px;
        background: rgba(255,255,255,0.02);
        border: 1px solid ${T.border};
        border-radius: 999px;
        display: flex; align-items: center; justify-content: center;
        flex-wrap: wrap; gap: 6px 18px;
        font-family: ${T.body}; font-size: 13px; font-weight: 400;
      }
      .pr-included-label {
        font-family: ${T.mono}; font-size: 10.5px; font-weight: 500;
        letter-spacing: 1.6px; text-transform: uppercase;
        color: ${T.amber};
        margin-right: 4px;
      }
      .pr-included-bullet {
        position: relative; padding-left: 14px;
        color: ${T.textSoft};
      }
      .pr-included-bullet::before {
        content: '';
        position: absolute; left: 0; top: 50%; transform: translateY(-50%);
        width: 4px; height: 4px; border-radius: 50%;
        background: ${T.amber}; opacity: 0.7;
      }
      @media (max-width: 720px) {
        .pr-included-strip { border-radius: 16px; padding: 16px 18px; }
        .pr-included-label { width: 100%; text-align: center; margin-bottom: 4px; }
      }

      /* ── ABONNEMENTS — lignes éditoriales ─────────── */
      .pr-subs-stack {
        margin-top: clamp(40px, 5vw, 56px);
        display: flex; flex-direction: column; gap: 18px;
        max-width: 980px; margin-left: auto; margin-right: auto;
      }
      .pr-sub {
        position: relative; overflow: hidden;
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 18px;
        padding: 28px 28px;
        display: grid;
        grid-template-columns: 1.2fr 1fr 1.1fr 0.9fr;
        align-items: center;
        gap: 28px;
        transition: border-color .2s;
      }
      .pr-sub::before {
        content: '';
        position: absolute;
        border-radius: 50%;
        filter: blur(56px);
        opacity: 0.5;
        pointer-events: none;
        z-index: 0;
      }
      .pr-sub > * { position: relative; z-index: 1; }
      .pr-sub:hover { border-color: rgba(255,255,255,0.16); }

      .pr-sub-cerulean::before {
        bottom: -55%; left: -10%;
        width: 380px; height: 380px;
        background: radial-gradient(circle, rgba(92,184,204,0.42), transparent 70%);
      }
      .pr-sub-violet::before {
        top: -55%; right: -8%;
        width: 380px; height: 380px;
        background: radial-gradient(circle, rgba(166,126,245,0.42), transparent 70%);
      }
      .pr-sub-amber {
        border-color: rgba(245,166,35,0.40);
        background: linear-gradient(180deg, rgba(245,166,35,0.04), transparent 60%), ${T.s1};
      }
      .pr-sub-amber::before {
        top: -50%; right: -8%;
        width: 420px; height: 420px;
        background: radial-gradient(circle, rgba(245,166,35,0.50), transparent 70%);
        opacity: 0.55;
      }
      .pr-sub-featured {
        box-shadow:
          0 0 0 1px rgba(245,166,35,0.22),
          0 24px 60px -30px rgba(245,166,35,0.45);
      }
      .pr-sub-ribbon {
        position: absolute;
        top: -1px; right: 28px;
        padding: 6px 14px;
        font-family: ${T.mono}; font-size: 10px; font-weight: 500;
        letter-spacing: 1.6px; text-transform: uppercase;
        background: ${T.amber}; color: #1a1206;
        border-radius: 0 0 8px 8px;
        z-index: 2;
      }

      .pr-sub-meta { display: flex; flex-direction: column; gap: 6px; }
      .pr-sub-name {
        font-family: ${T.serif}; font-style: italic; font-weight: 500;
        font-size: 32px; line-height: 1; letter-spacing: -0.6px;
        color: ${T.text};
      }
      .pr-sub-amber .pr-sub-name { color: ${T.amber}; }
      .pr-sub-tag {
        font-family: ${T.mono}; font-size: 10.5px; font-weight: 500;
        letter-spacing: 1.5px; text-transform: uppercase;
        color: ${T.muted};
      }

      /* Allowance "XX analyses par mois" */
      .pr-sub-allowance {
        display: flex; align-items: baseline; gap: 10px;
      }
      .pr-sub-num {
        font-family: ${T.serif}; font-style: italic; font-weight: 500;
        font-size: 48px; line-height: 1; letter-spacing: -1.5px;
        color: ${T.text};
      }
      .pr-sub-amber .pr-sub-num { color: ${T.amber}; }
      .pr-sub-unit {
        font-family: ${T.mono}; font-size: 10.5px; font-weight: 500;
        letter-spacing: 1.4px; text-transform: uppercase;
        color: ${T.muted}; line-height: 1.3;
      }

      /* Prix mensuel + suffixe */
      .pr-sub-price {
        display: flex; flex-direction: column; align-items: flex-start;
        gap: 4px;
      }
      .pr-sub-price .pr-price-amount {
        font-family: ${T.serif};
        font-size: 44px; font-weight: 500;
        letter-spacing: -1.5px; line-height: 1;
        color: ${T.text};
      }
      .pr-sub-amber .pr-sub-price .pr-price-amount { color: ${T.amber}; }
      .pr-price-suffix {
        font-family: ${T.body}; font-weight: 500;
        font-size: 16px; color: ${T.textSoft};
        display: inline-flex; align-items: baseline; gap: 4px;
      }
      .pr-price-suffix span {
        font-size: 11px; font-family: ${T.mono};
        letter-spacing: 1.4px; text-transform: uppercase;
        color: ${T.muted};
      }
      .pr-sub-unit-line {
        font-family: ${T.mono}; font-size: 10.5px; font-weight: 500;
        letter-spacing: 1.3px; text-transform: uppercase;
        color: ${T.muted2};
      }

      .pr-sub .pr-cta-primary,
      .pr-sub .pr-cta-secondary {
        justify-self: end;
      }

      /* Reflow mobile abonnements */
      @media (max-width: 880px) {
        .pr-sub {
          grid-template-columns: 1fr;
          gap: 18px; padding: 26px 22px;
          text-align: left;
        }
        .pr-sub .pr-cta-primary,
        .pr-sub .pr-cta-secondary { justify-self: stretch; width: 100%; text-align: center; }
        .pr-sub-ribbon { right: 16px; }
      }

      /* ── CTA pills (partagés packs + abos) ──────────── */
      .pr-cta-primary, .pr-cta-secondary {
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 1.6px; text-transform: uppercase;
        padding: 13px 22px; border-radius: 999px;
        cursor: pointer; transition: all .15s;
        white-space: nowrap;
        display: inline-flex; align-items: center; justify-content: center;
      }
      .pr-cta-primary {
        background: ${T.amber}; color: #1a1206;
        border: 1px solid ${T.amber};
      }
      .pr-cta-primary:hover {
        background: rgba(245,166,35,0.92);
        box-shadow: 0 0 0 6px rgba(245,166,35,0.10);
      }
      .pr-cta-secondary {
        background: transparent; color: ${T.text};
        border: 1px solid var(--btn-border, rgba(255,255,255,0.28));
      }
      .pr-cta-secondary:hover {
        border-color: var(--btn-border-hover, rgba(255,255,255,0.45));
        background: rgba(255,255,255,0.04);
      }

      /* ── FAQ ───────────────────────────────────────── */
      .pr-faq {
        margin-top: clamp(36px, 5vw, 56px);
        max-width: 720px; margin-left: auto; margin-right: auto;
        display: flex; flex-direction: column; gap: 10px;
      }
      .pr-faq-item {
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 14px;
        overflow: hidden;
      }
      .pr-faq-item summary {
        list-style: none;
        padding: 18px 22px;
        cursor: pointer;
        display: flex; align-items: center; justify-content: space-between;
        gap: 16px;
        font-family: ${T.body}; font-weight: 500; font-size: 15px;
        color: ${T.text};
        transition: background .15s;
      }
      .pr-faq-item summary::-webkit-details-marker { display: none; }
      .pr-faq-item summary:hover { background: rgba(255,255,255,0.025); }
      .pr-faq-chev {
        font-family: ${T.mono}; font-size: 18px; font-weight: 400;
        color: ${T.amber};
        transition: transform .2s;
      }
      .pr-faq-item[open] .pr-faq-chev { transform: rotate(45deg); }
      .pr-faq-item p {
        margin: 0;
        padding: 0 22px 20px;
        font-family: ${T.body}; font-size: 14px; font-weight: 300;
        line-height: 1.7; color: ${T.textSoft};
      }

      /* ── FOOTER ───────────────────────────────────── */
      .pr-footer {
        padding: clamp(48px, 7vw, 88px) 24px clamp(56px, 8vw, 96px);
        max-width: 1080px; margin: 0 auto;
        text-align: center;
        display: flex; flex-direction: column; align-items: center; gap: 14px;
      }
      .pr-footer-mark {
        font-family: ${T.body}; font-weight: 700;
        font-size: 24px; letter-spacing: -0.5px;
        color: ${T.text};
      }
      .pr-footer-mark .accent { color: ${T.amber}; }
      .pr-footer-line {
        font-family: ${T.body}; font-size: 13.5px; font-weight: 300;
        color: ${T.muted};
      }
      .pr-footer-line a {
        color: ${T.amber}; text-decoration: none;
        border-bottom: 1px dashed rgba(245,166,35,0.4);
      }
      .pr-footer-line a:hover { border-bottom-color: ${T.amber}; }

      @keyframes fadeup {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  );
}
