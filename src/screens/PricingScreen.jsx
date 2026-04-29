import { useEffect, useState } from 'react';
import T from '../constants/theme';
import API from '../constants/api';
import useLang from '../hooks/useLang';
import { supabase } from '../lib/supabase';
import { PACKS, SUBSCRIPTIONS, SCHOOL_CONTACT_EMAIL, getPriceIdForPlan } from '../constants/plans';

/**
 * PricingScreen — page tarifs publique (#/pricing).
 *
 * Source de vérité : src/constants/plans.js (5 packs + 2 abos + École).
 * Les Price IDs Stripe arrivent par variables d'env Vite (cf. plans.js) ;
 * sans elles, le bouton est désactivé avec mention "configuration en cours".
 *
 * Flow d'achat :
 *   - Visiteur non connecté → clic CTA appelle `onStart` (redirect AuthScreen).
 *   - User connecté → POST /api/billing/checkout, redirige vers Stripe Checkout.
 *
 * Le screen est rendu PUBLIC (sans sidebar) ET CONNECTÉ (sans sidebar) :
 *   - Public : on voit la page tarifs avant de signer
 *   - Connecté : on revient acheter d'autres crédits sans bruit
 *
 * Couleurs des cartes (réutilisation tokens thème) : cerulean / mint / violet
 * / amber / rose. Le pack featured est ambré (CTA principal). Les abos ont
 * Indie en cerulean et Pro en ambré featured.
 */

// Mapping clé plan → variant CSS de carte (cycle d'accent visuel).
const PACK_ACCENT = {
  pack_1: 'cerulean',
  pack_5: 'mint',
  pack_10: 'amber',     // featured (Le plus choisi)
  pack_25: 'violet',
  pack_50: 'rose',
};
const SUB_ACCENT = {
  sub_indie: 'cerulean',
  sub_pro: 'amber',     // featured
};

export default function PricingScreen({
  onStart,
  onBackToLanding,
  onViewDashboard,
  ctaPrimaryLabel,
}) {
  const { s, lang, setLang } = useLang();
  const ctaLabel = ctaPrimaryLabel || s?.landing?.ctaPrimary || 'COMMENCER';
  // Raccourci vers le namespace pricing — la page est traduite intégralement
  // FR/EN via useLang. Tout texte en dur ici doit avoir une clé sous
  // s.pricing dans constants/strings.js.
  const t = s.pricing;

  const [user, setUser] = useState(null);
  const [pendingKey, setPendingKey] = useState(null);
  const [errMsg, setErrMsg] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!cancelled) setUser(data?.user || null);
      } catch { /* anonyme = ok */ }
    })();
    return () => { cancelled = true; };
  }, []);

  // Lance Stripe Checkout pour un plan donné. Si l'utilisateur n'est pas
  // connecté, on bascule sur le flow signup (onStart), Stripe attendra.
  async function goToCheckout(plan) {
    setErrMsg(null);
    if (!user) {
      // Stocke le plan visé pour reprendre le flow après login (cf. App.jsx).
      try {
        sessionStorage.setItem('pendingCheckoutPlan', plan.key);
      } catch {}
      onStart?.();
      return;
    }
    const priceId = getPriceIdForPlan(plan);
    if (!priceId) {
      setErrMsg(t.errCheckoutNotConfigured);
      return;
    }
    setPendingKey(plan.key);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess?.session?.access_token || '';
      const res = await fetch(`${API}/api/billing/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planKey: plan.key,
          priceId,
          mode: plan.priceIdEnv?.startsWith('VITE_STRIPE_PRICE_SUB_') ? 'subscription' : 'payment',
        }),
      });
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try { const err = await res.json(); msg = err?.message || err?.error || msg; } catch {}
        throw new Error(msg);
      }
      const { url } = await res.json();
      if (!url) throw new Error('checkout_url_missing');
      window.location.href = url;
    } catch (e) {
      console.error('[pricing] checkout failed:', e);
      setErrMsg(t.errCheckoutPrefix + (e?.message || t.errUnknown));
      setPendingKey(null);
    }
  }

  return (
    <div className="pr-screen">
      <PricingStyles />

      {/* TOPBAR — logo cliquable + lien retour landing */}
      <header className="pr-topbar">
        <button
          type="button"
          className="pr-topbar-brand"
          onClick={onBackToLanding}
          aria-label={t.topbarBackAria}
        >
          <img src="/logo-versions-2.svg" alt="" className="pr-topbar-logo" />
          <span className="pr-topbar-wordmark">
            VER<span className="accent">Si</span>ONS
          </span>
        </button>
        <nav className="pr-topbar-nav" aria-label="Navigation">
          <button type="button" className="pr-topbar-link" onClick={onBackToLanding}>
            {t.topbarHome}
          </button>
          {onViewDashboard && (
            <button
              type="button"
              className="pr-topbar-link"
              onClick={onViewDashboard}
              aria-label={s.sidebar.dashboardLink}
            >
              {s.sidebar.dashboardLink}
            </button>
          )}
          <span className="pr-topbar-current" aria-current="page">{t.topbarCurrent}</span>
          {/* Switch FR/EN — même classe (.sb-lang-switch) que la sidebar du
              dashboard pour garder une UI parfaitement uniforme entre les
              deux écrans. */}
          <div
            className="sb-lang-switch"
            role="group"
            aria-label="Langue / Language"
          >
            <button
              type="button"
              className={lang === 'fr' ? 'on' : ''}
              onClick={() => setLang('fr')}
              aria-pressed={lang === 'fr'}
            >
              FR
            </button>
            <button
              type="button"
              className={lang === 'en' ? 'on' : ''}
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="pr-hero">
        <div className="pr-hero-inner">
          <div className="pr-eyebrow">{t.heroEyebrow}</div>
          <h1 className="pr-hero-title">
            {t.heroTitleStart}<em>{t.heroTitleEm}</em>{t.heroTitleEnd}
          </h1>
          <p className="pr-hero-sub">{t.heroSub}</p>
        </div>
      </section>

      {/* Bandeau erreur si l'init checkout a planté */}
      {errMsg && (
        <div className="pr-errbar" role="alert">{errMsg}</div>
      )}

      {/* ── À LA CARTE — 5 packs en cartes verticales compactes ─────── */}
      <section className="pr-section pr-section-tight">
        <div className="pr-section-eyebrow">{t.packsEyebrow}</div>
        <h2 className="pr-section-title">
          {t.packsTitleStart}<em>{t.packsTitleEm}</em>{t.packsTitleEnd}
        </h2>

        <div className="pr-packs-grid">
          {PACKS.map((p) => {
            const accent = PACK_ACCENT[p.key] || 'cerulean';
            // 'mostChosen' = bouton CTA en mode primary (featured)
            const isFeatured = p.highlightKey === 'mostChosen';
            const isPending = pendingKey === p.key;
            const ribbonLabel = p.highlightKey ? t.ribbons?.[p.highlightKey] : null;
            return (
              <article
                key={p.key}
                className={`pr-pack pr-pack-${accent}${isFeatured ? ' pr-pack-featured' : ''}`}
              >
                {ribbonLabel && <div className="pr-pack-ribbon">{ribbonLabel}</div>}
                <div className="pr-pack-qty">
                  <span className="pr-pack-num">{p.credits}</span>
                  <span className="pr-pack-unit">
                    {p.credits > 1 ? t.packAnalysisPlural : t.packAnalysisSingular}
                  </span>
                </div>
                <div className="pr-pack-price">
                  <span className="pr-price-amount">{formatPrice(p.price_eur)}</span>
                  <span className="pr-price-currency">€</span>
                </div>
                <div className="pr-pack-meta">
                  <div className="pr-pack-unit-line">{formatPrice(p.perUnit)} {t.packPerUnit}</div>
                </div>
                <button
                  type="button"
                  className={isFeatured ? 'pr-cta-primary' : 'pr-cta-secondary'}
                  onClick={() => goToCheckout(p)}
                  disabled={isPending}
                >
                  {isPending ? t.packRedirecting : t.packBuy}
                </button>
              </article>
            );
          })}
        </div>

        {/* Bandeau "tout est inclus" sous les packs */}
        <div className="pr-included-strip">
          <span className="pr-included-label">{t.includedLabel}</span>
          <span className="pr-included-bullet">{t.included1}</span>
          <span className="pr-included-bullet">{t.included2}</span>
          <span className="pr-included-bullet">{t.included3}</span>
          <span className="pr-included-bullet">{t.included4}</span>
          <span className="pr-included-bullet">{t.included5}</span>
        </div>
      </section>

      {/* ── ABONNEMENTS — lignes éditoriales horizontales ───────────── */}
      <section className="pr-section">
        <div className="pr-section-eyebrow">{t.subsEyebrow}</div>
        <h2 className="pr-section-title">
          {t.subsTitleStart}<em>{t.subsTitleEm}</em>{t.subsTitleEnd}
        </h2>
        <p className="pr-section-lede">{t.subsLede}</p>

        <div className="pr-subs-stack">
          {SUBSCRIPTIONS.map((sub) => {
            const accent = SUB_ACCENT[sub.key] || 'cerulean';
            const isFeatured = sub.key === 'sub_pro';
            const isPending = pendingKey === sub.key;
            // Description traduite si dispo, sinon fallback sur la copy
            // FR de plans.js (sécurité : aucun écran cassé si une clé manque).
            const subDesc = t.subDescriptions?.[sub.key] || sub.description;
            const subUnitLine = (t.subUnitLine || 'soit {price} €/analyse')
              .replace('{price}', formatPrice(sub.perUnit));
            return (
              <article
                key={sub.key}
                className={`pr-sub pr-sub-${accent}${isFeatured ? ' pr-sub-featured' : ''}`}
              >
                {isFeatured && <div className="pr-sub-ribbon">{t.ribbons?.recommended}</div>}
                <div className="pr-sub-meta">
                  <div className="pr-sub-name">{sub.label}</div>
                  <div className="pr-sub-tag">{subDesc}</div>
                </div>
                <div className="pr-sub-allowance">
                  <span className="pr-sub-num">{sub.credits}</span>
                  <span className="pr-sub-unit">{t.subAllowanceLine1}<br />{t.subAllowanceLine2}</span>
                </div>
                <div className="pr-sub-price">
                  <span className="pr-price-amount">{formatPrice(sub.price_eur)}</span>
                  <span className="pr-price-suffix">€<span>{t.subPerMonth}</span></span>
                  <span className="pr-sub-unit-line">{subUnitLine}</span>
                </div>
                <button
                  type="button"
                  className={isFeatured ? 'pr-cta-primary' : 'pr-cta-secondary'}
                  onClick={() => goToCheckout(sub)}
                  disabled={isPending}
                >
                  {isPending ? t.packRedirecting : (isFeatured ? ctaLabel : t.subChoose)}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── ÉCOLES — bloc partenariat sur devis ────────────────────── */}
      <section className="pr-section pr-section-school">
        <div className="pr-school">
          <div className="pr-school-text">
            <div className="pr-school-eyebrow">{t.schoolEyebrow}</div>
            <h3 className="pr-school-title">
              {t.schoolTitleStart}<em>{t.schoolTitleEm}</em>{t.schoolTitleEnd}
            </h3>
            <p className="pr-school-lede">{t.schoolLede}</p>
          </div>
          <a
            href={`mailto:${SCHOOL_CONTACT_EMAIL}?subject=${encodeURIComponent(t.schoolMailSubject)}`}
            className="pr-school-cta"
          >
            {t.schoolCta}
          </a>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <section className="pr-section pr-section-tight">
        <div className="pr-section-eyebrow">{t.faqEyebrow}</div>
        <h2 className="pr-section-title">
          {t.faqTitleStart}<em>{t.faqTitleEm}</em>{t.faqTitleEnd}
        </h2>

        <div className="pr-faq">
          <PrFaq q={t.faq1Q} a={t.faq1A} />
          <PrFaq q={t.faq2Q} a={t.faq2A} />
          <PrFaq q={t.faq3Q} a={t.faq3A} />
          <PrFaq q={t.faq4Q} a={t.faq4A} />
          <PrFaq q={t.faq5Q} a={t.faq5A} />
          <PrFaq q={t.faq6Q} a={t.faq6A} />
        </div>
      </section>

      {/* FOOTER simple */}
      <footer className="pr-footer">
        <div className="pr-footer-mark">
          VER<span className="accent">Si</span>ONS
        </div>
        <div className="pr-footer-line">
          {t.footerLine}{' '}
          <a href={`mailto:${SCHOOL_CONTACT_EMAIL}`}>{SCHOOL_CONTACT_EMAIL}</a>
        </div>
      </footer>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────── */
function formatPrice(n) {
  // Force la virgule française et 2 décimales pour les centimes (sauf nombres entiers).
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  // 4.99 → "4,99" ; 4 → "4" ; 4.5 → "4,50".
  return v.toLocaleString('fr-FR', {
    minimumFractionDigits: Number.isInteger(v) ? 0 : 2,
    maximumFractionDigits: 2,
  });
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

      /* TOPBAR
         Logo + wordmark calés sur la sidebar du dashboard (38px / 27px /
         padding 22px 18px) pour garder la même identité visuelle d'un écran
         à l'autre. Topbar full-width côté gauche : la nav reste poussée à
         droite. */
      .pr-topbar {
        position: relative; z-index: 2;
        padding: 22px 18px;
        display: flex; align-items: center; justify-content: space-between;
        gap: 24px;
      }
      .pr-topbar-brand {
        display: inline-flex; align-items: center; gap: 8px;
        background: transparent; border: 0; cursor: pointer;
        padding: 0; border-radius: 8px;
        transition: opacity .15s;
      }
      .pr-topbar-brand:hover { opacity: 0.82; }
      .pr-topbar-logo { height: 38px; width: auto; filter: drop-shadow(0 0 16px rgba(245,166,35,0.18)); }
      .pr-topbar-wordmark { font-family: ${T.body}; font-weight: 700; font-size: 27px; letter-spacing: -0.5px; color: ${T.text}; line-height: 1; }
      .pr-topbar-wordmark .accent { color: ${T.amber}; font-style: normal; }
      .pr-topbar-nav { display: inline-flex; align-items: center; gap: 8px; }
      .pr-topbar-link, .pr-topbar-current {
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 1.6px; text-transform: uppercase;
        padding: 9px 16px; border-radius: 999px;
        transition: all .15s;
      }
      .pr-topbar-link { background: transparent; color: ${T.textSoft}; border: 1px solid transparent; cursor: pointer; }
      .pr-topbar-link:hover { color: ${T.text}; background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.10); }
      .pr-topbar-current { color: ${T.amber}; background: rgba(245,166,35,0.06); border: 1px solid rgba(245,166,35,0.32); }

      /* HERO */
      .pr-hero { padding: clamp(24px, 4vw, 48px) 24px clamp(16px, 3vw, 32px); display: grid; place-items: center; }
      .pr-hero-inner { width: 100%; max-width: 760px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; animation: prfadeup .5s ease; }
      .pr-eyebrow { font-family: ${T.mono}; font-size: 11px; font-weight: 500; letter-spacing: 2.4px; color: ${T.amber}; text-transform: uppercase; }
      .pr-hero-title { font-family: ${T.body}; font-weight: 700; font-size: clamp(36px, 5vw, 64px); line-height: 1.0; letter-spacing: -1.6px; color: ${T.text}; margin: 0; }
      .pr-hero-title em { font-family: ${T.serif}; font-style: italic; font-weight: 500; color: ${T.amber}; }
      .pr-hero-sub { font-family: ${T.body}; font-size: 14px; font-weight: 300; color: ${T.muted}; margin: 0; max-width: 580px; }

      /* ERROR BAR */
      .pr-errbar {
        max-width: 1180px; margin: 0 auto 16px;
        padding: 10px 16px;
        background: rgba(255,93,93,0.06);
        border: 1px solid rgba(255,93,93,0.22);
        border-radius: 8px;
        color: ${T.text};
        font-family: ${T.body}; font-size: 13px; font-weight: 300;
        text-align: center;
      }

      /* SECTIONS */
      .pr-section { padding: clamp(56px, 7vw, 96px) 24px; max-width: 1180px; margin: 0 auto; }
      .pr-section-tight { padding: clamp(40px, 6vw, 72px) 24px; }
      /* Section École : on garde un peu d'air en dessous mais on colle haut
         à la section Abonnements pour ne pas casser la lecture. */
      .pr-section-school { padding: 8px 24px clamp(40px, 6vw, 64px); }
      .pr-section-eyebrow { font-family: ${T.mono}; font-size: 10.5px; font-weight: 500; letter-spacing: 2.2px; color: ${T.amber}; text-transform: uppercase; margin-bottom: 12px; }
      .pr-section-title { font-family: ${T.body}; font-weight: 600; font-size: clamp(24px, 3vw, 36px); line-height: 1.2; letter-spacing: -0.6px; color: ${T.text}; margin: 0 0 16px; }
      .pr-section-title em { font-family: ${T.serif}; font-style: italic; font-weight: 500; color: ${T.amber}; }
      .pr-section-lede { font-family: ${T.body}; font-size: 14px; font-weight: 300; color: ${T.muted}; margin: 0; max-width: 680px; }

      /* PACKS GRID — 5 colonnes desktop, 3 en grand tablet, 2 en tablet, 1 en mobile */
      .pr-packs-grid {
        margin-top: clamp(40px, 5vw, 56px);
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 14px;
      }
      @media (max-width: 1080px) { .pr-packs-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
      @media (max-width: 760px)  { .pr-packs-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; } }
      @media (max-width: 480px)  { .pr-packs-grid { grid-template-columns: 1fr; } }

      .pr-pack {
        position: relative; overflow: hidden;
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 16px;
        padding: 24px 18px 20px;
        display: flex; flex-direction: column; gap: 14px;
        transition: border-color .2s, transform .2s;
      }
      .pr-pack:hover { border-color: rgba(255,255,255,0.16); transform: translateY(-2px); }
      .pr-pack::before {
        content: '';
        position: absolute;
        top: -40%; right: -25%;
        width: 220px; height: 220px;
        border-radius: 50%;
        filter: blur(48px);
        opacity: 0.45;
        pointer-events: none;
      }
      .pr-pack > * { position: relative; z-index: 1; }

      .pr-pack-cerulean::before { background: radial-gradient(circle, rgba(92,184,204,0.55), transparent 70%); }
      .pr-pack-mint::before     { background: radial-gradient(circle, rgba(142,224,122,0.55), transparent 70%); }
      .pr-pack-amber::before    { background: radial-gradient(circle, rgba(245,166,35,0.65), transparent 70%); }
      .pr-pack-violet::before   { background: radial-gradient(circle, rgba(166,126,245,0.55), transparent 70%); }
      .pr-pack-rose::before     { background: radial-gradient(circle, rgba(245,123,166,0.55), transparent 70%); }

      .pr-pack-featured { border-color: rgba(245,166,35,0.34); }
      .pr-pack-ribbon {
        position: absolute; top: 12px; right: 12px; z-index: 2;
        font-family: ${T.mono}; font-size: 9.5px; font-weight: 600;
        letter-spacing: 1.4px; text-transform: uppercase;
        color: ${T.amber};
        background: rgba(245,166,35,0.10);
        border: 1px solid rgba(245,166,35,0.32);
        padding: 4px 8px; border-radius: 999px;
      }

      .pr-pack-qty { display: flex; flex-direction: column; gap: 2px; }
      .pr-pack-num {
        font-family: ${T.serif}; font-style: italic; font-weight: 500;
        font-size: 38px; line-height: 1; letter-spacing: -1px;
        color: ${T.text};
      }
      .pr-pack-unit {
        font-family: ${T.mono}; font-size: 10.5px; font-weight: 500;
        letter-spacing: 1.6px; text-transform: uppercase; color: ${T.muted};
      }
      .pr-pack-price { display: flex; align-items: baseline; gap: 4px; }
      .pr-price-amount { font-family: ${T.body}; font-weight: 700; font-size: 32px; letter-spacing: -1px; color: ${T.text}; }
      .pr-price-currency { font-family: ${T.body}; font-size: 18px; color: ${T.muted}; }
      .pr-pack-meta { display: flex; flex-direction: column; gap: 4px; flex: 1; }
      .pr-pack-unit-line { font-family: ${T.mono}; font-size: 10.5px; letter-spacing: 1.4px; color: ${T.muted2}; text-transform: uppercase; }

      /* CTA */
      .pr-cta-primary, .pr-cta-secondary {
        font-family: ${T.mono}; font-size: 11px; font-weight: 600;
        letter-spacing: 1.8px; text-transform: uppercase;
        padding: 12px 16px; border-radius: 999px;
        cursor: pointer; transition: all .15s;
        border: 1px solid;
        width: 100%; text-align: center;
      }
      .pr-cta-primary {
        background: ${T.amber};
        border-color: ${T.amber};
        color: ${T.bg};
      }
      .pr-cta-primary:hover { filter: brightness(1.06); transform: translateY(-1px); }
      .pr-cta-secondary {
        background: transparent;
        border-color: rgba(255,255,255,0.14);
        color: ${T.textSoft};
      }
      .pr-cta-secondary:hover { color: ${T.text}; border-color: rgba(255,255,255,0.28); background: rgba(255,255,255,0.04); }
      .pr-cta-primary:disabled, .pr-cta-secondary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

      /* INCLUDED STRIP */
      .pr-included-strip {
        margin-top: 28px;
        padding: 14px 20px;
        background: rgba(255,255,255,0.02);
        border: 1px solid ${T.border};
        border-radius: 12px;
        display: flex; flex-wrap: wrap; align-items: center; gap: 14px 22px;
      }
      .pr-included-label { font-family: ${T.mono}; font-size: 10px; font-weight: 600; letter-spacing: 1.6px; color: ${T.amber}; text-transform: uppercase; }
      .pr-included-bullet { font-family: ${T.body}; font-size: 12.5px; color: ${T.textSoft}; position: relative; padding-left: 14px; }
      .pr-included-bullet::before { content: '✓'; position: absolute; left: 0; color: ${T.mint || '#8ee07a'}; font-weight: 700; }

      /* SUBS */
      .pr-subs-stack {
        margin-top: clamp(32px, 4vw, 48px);
        display: flex; flex-direction: column; gap: 14px;
      }
      .pr-sub {
        position: relative; overflow: hidden;
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 18px;
        padding: 24px 28px;
        display: grid;
        grid-template-columns: 2fr 1fr 1.4fr auto;
        gap: 20px;
        align-items: center;
        transition: border-color .2s;
      }
      .pr-sub:hover { border-color: rgba(255,255,255,0.16); }
      .pr-sub::before {
        content: '';
        position: absolute;
        top: -50%; right: -10%;
        width: 320px; height: 320px;
        border-radius: 50%;
        filter: blur(70px);
        opacity: 0.4;
        pointer-events: none;
      }
      .pr-sub > * { position: relative; z-index: 1; }
      .pr-sub-cerulean::before { background: radial-gradient(circle, rgba(92,184,204,0.5), transparent 70%); }
      .pr-sub-amber::before    { background: radial-gradient(circle, rgba(245,166,35,0.6), transparent 70%); }
      .pr-sub-featured { border-color: rgba(245,166,35,0.34); }
      .pr-sub-ribbon {
        position: absolute; top: 14px; right: 18px;
        font-family: ${T.mono}; font-size: 9.5px; font-weight: 600;
        letter-spacing: 1.4px; text-transform: uppercase;
        color: ${T.amber};
        background: rgba(245,166,35,0.10);
        border: 1px solid rgba(245,166,35,0.32);
        padding: 4px 10px; border-radius: 999px;
      }
      .pr-sub-meta { display: flex; flex-direction: column; gap: 4px; }
      .pr-sub-name { font-family: ${T.serif}; font-style: italic; font-weight: 500; font-size: 26px; color: ${T.text}; letter-spacing: -0.4px; }
      .pr-sub-tag { font-family: ${T.body}; font-size: 12.5px; color: ${T.muted}; }
      .pr-sub-allowance { display: flex; align-items: baseline; gap: 8px; }
      .pr-sub-num { font-family: ${T.body}; font-weight: 700; font-size: 36px; letter-spacing: -1px; color: ${T.text}; line-height: 1; }
      .pr-sub-unit { font-family: ${T.mono}; font-size: 10px; letter-spacing: 1.4px; text-transform: uppercase; color: ${T.muted}; line-height: 1.2; }
      .pr-sub-price { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
      .pr-sub-price .pr-price-amount { font-size: 28px; }
      .pr-sub-price .pr-price-suffix { font-family: ${T.body}; font-size: 14px; color: ${T.muted}; }
      .pr-sub-price .pr-price-suffix span { font-size: 11px; }
      .pr-sub-unit-line { font-family: ${T.mono}; font-size: 10px; letter-spacing: 1.4px; color: ${T.muted2}; text-transform: uppercase; }
      @media (max-width: 760px) {
        .pr-sub {
          grid-template-columns: 1fr;
          gap: 14px;
        }
        .pr-sub-price { align-items: flex-start; }
      }

      /* SCHOOL */
      .pr-school {
        margin-top: 16px;
        padding: clamp(24px, 4vw, 40px);
        background: linear-gradient(180deg, rgba(166,126,245,0.06), rgba(255,255,255,0.015));
        border: 1px solid rgba(166,126,245,0.22);
        border-radius: 18px;
        display: grid; grid-template-columns: 1fr auto;
        gap: 28px; align-items: center;
      }
      @media (max-width: 760px) {
        .pr-school { grid-template-columns: 1fr; }
      }
      .pr-school-eyebrow { font-family: ${T.mono}; font-size: 10.5px; font-weight: 500; letter-spacing: 2.2px; color: ${T.violet || '#a67ef5'}; text-transform: uppercase; margin-bottom: 10px; }
      .pr-school-title { font-family: ${T.body}; font-weight: 600; font-size: clamp(22px, 2.6vw, 28px); line-height: 1.2; letter-spacing: -0.4px; color: ${T.text}; margin: 0 0 10px; }
      .pr-school-title em { font-family: ${T.serif}; font-style: italic; font-weight: 500; color: ${T.violet || '#a67ef5'}; }
      .pr-school-lede { font-family: ${T.body}; font-size: 13.5px; font-weight: 300; color: ${T.textSoft}; margin: 0; line-height: 1.65; max-width: 600px; }
      .pr-school-cta {
        font-family: ${T.mono}; font-size: 11px; font-weight: 600;
        letter-spacing: 1.8px; text-transform: uppercase;
        padding: 14px 24px; border-radius: 999px;
        background: rgba(166,126,245,0.12);
        border: 1px solid rgba(166,126,245,0.4);
        color: ${T.violet || '#a67ef5'};
        text-decoration: none;
        white-space: nowrap;
        transition: all .15s;
      }
      .pr-school-cta:hover { background: rgba(166,126,245,0.20); border-color: rgba(166,126,245,0.65); }

      /* FAQ */
      .pr-faq { margin-top: clamp(24px, 3vw, 36px); display: flex; flex-direction: column; gap: 8px; }
      .pr-faq-item {
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 12px;
        overflow: hidden;
        transition: border-color .2s;
      }
      .pr-faq-item:hover { border-color: rgba(255,255,255,0.14); }
      .pr-faq-item summary {
        list-style: none;
        cursor: pointer;
        padding: 16px 20px;
        font-family: ${T.body}; font-size: 14.5px; font-weight: 500;
        color: ${T.text};
        display: flex; align-items: center; justify-content: space-between;
        gap: 16px;
      }
      .pr-faq-item summary::-webkit-details-marker { display: none; }
      .pr-faq-chev { font-family: ${T.mono}; font-size: 18px; color: ${T.muted}; transition: transform .2s; }
      .pr-faq-item[open] .pr-faq-chev { transform: rotate(45deg); }
      .pr-faq-item p { margin: 0 20px 16px; font-family: ${T.body}; font-size: 13.5px; font-weight: 300; color: ${T.textSoft}; line-height: 1.7; }

      /* FOOTER */
      .pr-footer {
        padding: clamp(40px, 6vw, 72px) 24px;
        max-width: 1080px; margin: 0 auto;
        text-align: center;
        display: flex; flex-direction: column; align-items: center; gap: 14px;
      }
      .pr-footer-mark { font-family: ${T.body}; font-weight: 700; font-size: 22px; letter-spacing: -0.5px; color: ${T.text}; }
      .pr-footer-mark .accent { color: ${T.amber}; }
      .pr-footer-line { font-family: ${T.body}; font-size: 13px; font-weight: 300; color: ${T.muted}; }
      .pr-footer-line a { color: ${T.amber}; text-decoration: none; }
      .pr-footer-line a:hover { text-decoration: underline; }

      @keyframes prfadeup {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  );
}
