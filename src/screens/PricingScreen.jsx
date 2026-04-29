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
// Grille révisée 2026-04-29 : packs réduits à 2 cartes (essai + occasionnel).
// Les anciens variants amber/violet/rose restent dans le CSS — au cas où on
// réintroduirait des packs plus tard, et parce qu'ils ne coûtent rien.
const PACK_ACCENT = {
  pack_1: 'cerulean',
  pack_5: 'mint',
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

  // ── Animations d'entrée au scroll ────────────────────────────────
  // Ajoute la classe .pr-anim-in aux éléments .pr-anim quand ils
  // entrent dans le viewport. Animation jouée une seule fois (unobserve
  // après déclenchement). Pas de reset au scroll up — éviter les yoyos
  // visuels. Coupé via prefers-reduced-motion (côté CSS).
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const els = document.querySelectorAll('.pr-anim');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('pr-anim-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -15% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
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
          <span className="pr-topbar-current" aria-current="page">{t.topbarCurrent}</span>
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

      {/* HERO — eyebrow + titre + sub, et constellation de chips
          décoratives au-dessus (clin d'œil au mockup de la home).
          aria-hidden + pointer-events:none pour qu'on les lise comme
          du décor, pas comme une nav cliquable. */}
      <section className="pr-hero">
        <div className="pr-hero-inner">
          <div className="pr-hero-chips" aria-hidden="true">
            <span className="pr-chip pr-chip-amber pr-chip-rot-a">{t.heroChip1}</span>
            <span className="pr-chip pr-chip-cerulean pr-chip-rot-b">{t.heroChip2}</span>
            <span className="pr-chip pr-chip-amber-strong pr-chip-rot-c">{t.heroChip3}</span>
            <span className="pr-chip pr-chip-mint pr-chip-rot-d">{t.heroChip4}</span>
            <span className="pr-chip pr-chip-violet pr-chip-rot-e">{t.heroChip5}</span>
          </div>
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
        <div className="pr-section-eyebrow pr-anim">{t.packsEyebrow}</div>
        <h2 className="pr-section-title pr-anim" style={{ '--anim-d': '60ms' }}>
          {t.packsTitleStart}<em>{t.packsTitleEm}</em>{t.packsTitleEnd}
        </h2>
        <p className="pr-section-lede pr-anim" style={{ '--anim-d': '120ms' }}>{t.packsLede}</p>

        <div className="pr-packs-grid">
          {PACKS.map((p, i) => {
            const accent = PACK_ACCENT[p.key] || 'cerulean';
            // 'mostChosen' = bouton CTA en mode primary (featured)
            const isFeatured = p.highlightKey === 'mostChosen';
            const isPending = pendingKey === p.key;
            const ribbonLabel = p.highlightKey ? t.ribbons?.[p.highlightKey] : null;
            return (
              <article
                key={p.key}
                className={`pr-pack pr-pack-${accent}${isFeatured ? ' pr-pack-featured' : ''} pr-anim`}
                style={{ '--anim-d': `${100 + i * 80}ms` }}
              >
                {ribbonLabel && <div className="pr-pack-ribbon">{ribbonLabel}</div>}
                <div className="pr-pack-qty">
                  <span className="pr-pack-num">{p.credits}</span>
                  <span className="pr-pack-unit">
                    {p.credits > 1 ? t.packAnalysisPlural : t.packAnalysisSingular}
                  </span>
                </div>
                <div className="pr-pack-price">
                  <span className={`pr-price-pill pr-price-pill-${accent}`}>
                    <span className="pr-price-amount">{formatPrice(p.price_eur)}</span>
                    <span className="pr-price-currency">€</span>
                  </span>
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

        {/* Grappe "tout est inclus" — chips colorées, rythme un peu
            décalé pour casser le strip horizontal monotone. Couleurs
            qui rappellent les chips du hero (cerulean / mint / violet
            / amber / rose). */}
        <div className="pr-included-strip pr-anim">
          <span className="pr-included-label">{t.includedLabel}</span>
          <div className="pr-included-chips" aria-hidden="true">
            <span className="pr-chip pr-chip-mint pr-chip-rot-a">{t.included1}</span>
            <span className="pr-chip pr-chip-cerulean pr-chip-rot-b">{t.included2}</span>
            <span className="pr-chip pr-chip-violet pr-chip-rot-c">{t.included3}</span>
            <span className="pr-chip pr-chip-amber-soft pr-chip-rot-d">{t.included4}</span>
            <span className="pr-chip pr-chip-neutral pr-chip-rot-e">{t.included5}</span>
          </div>
        </div>
      </section>

      <div className="pr-divider" />

      {/* ── ABONNEMENTS — 3 cards (Indie + Pro + École) ──────────────
          Indie + Pro viennent de SUBSCRIPTIONS, École est un cas
          spécial (sans Stripe — mailto + tarif "sur devis"). Les 3
          tiennent dans la même grille pour une lecture côte-à-côte. */}
      <section className="pr-section">
        <div className="pr-section-eyebrow pr-anim">{t.subsEyebrow}</div>
        <h2 className="pr-section-title pr-anim" style={{ '--anim-d': '60ms' }}>
          {t.subsTitleStart}<em>{t.subsTitleEm}</em>{t.subsTitleEnd}
        </h2>
        <p className="pr-section-lede pr-anim" style={{ '--anim-d': '120ms' }}>{t.subsLede}</p>

        <div className="pr-subs-grid">
          {SUBSCRIPTIONS.map((sub, i) => {
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
                className={`pr-sub pr-sub-${accent}${isFeatured ? ' pr-sub-featured' : ''} pr-anim`}
                style={{ '--anim-d': `${180 + i * 100}ms` }}
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
                  <span className={`pr-price-pill pr-price-pill-${accent}`}>
                    <span className="pr-price-amount">{formatPrice(sub.price_eur)}</span>
                    <span className="pr-price-suffix">€<span>{t.subPerMonth}</span></span>
                  </span>
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

          {/* École — card "sur devis", CTA mailto */}
          <article
            className="pr-sub pr-sub-violet pr-sub-school pr-anim"
            style={{ '--anim-d': `${180 + SUBSCRIPTIONS.length * 100}ms` }}
          >
            <div className="pr-sub-meta">
              <div className="pr-sub-name">{t.schoolCardLabel}</div>
              <div className="pr-sub-tag">{t.schoolLede}</div>
            </div>
            <div className="pr-sub-allowance pr-sub-allowance-school">
              <span className="pr-sub-quote">{t.schoolCardPrice}</span>
            </div>
            <div className="pr-sub-price">
              <span className="pr-sub-unit-line">{t.schoolCardHint}</span>
            </div>
            <a
              href={`mailto:${SCHOOL_CONTACT_EMAIL}?subject=${encodeURIComponent(t.schoolMailSubject)}`}
              className="pr-cta-secondary pr-sub-school-cta"
            >
              {t.schoolCta}
            </a>
          </article>
        </div>
      </section>

      <div className="pr-divider" />

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <section className="pr-section pr-section-tight">
        <div className="pr-section-eyebrow pr-anim">{t.faqEyebrow}</div>
        <h2 className="pr-section-title pr-anim" style={{ '--anim-d': '60ms' }}>
          {t.faqTitleStart}<em>{t.faqTitleEm}</em>{t.faqTitleEnd}
        </h2>

        <div className="pr-faq">
          <PrFaq q={t.faq1Q} a={t.faq1A} i={0} />
          <PrFaq q={t.faq2Q} a={t.faq2A} i={1} />
          <PrFaq q={t.faq3Q} a={t.faq3A} i={2} />
          <PrFaq q={t.faq4Q} a={t.faq4A} i={3} />
          <PrFaq q={t.faq5Q} a={t.faq5A} i={4} />
          <PrFaq q={t.faq6Q} a={t.faq6A} i={5} />
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
function PrFaq({ q, a, i = 0 }) {
  return (
    // name="pricing-faq" → comportement accordion natif HTML5 :
    // un seul <details> ouvert à la fois dans le groupe.
    // i = index dans la FAQ → stagger de l'animation d'entrée.
    <details
      className="pr-faq-item pr-anim"
      name="pricing-faq"
      style={{ '--anim-d': `${120 + i * 70}ms` }}
    >
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
      /* ── ATMOSPHÈRE DE FOND ───────────────────────────────────────
         3 grosses orbes diffuses (cerulean / amber / violet) en fixed,
         drift très lent — donne un fond vivant sans distraire. */
      .pr-screen::before {
        content: '';
        position: fixed; inset: 0;
        pointer-events: none;
        z-index: 0;
        background:
          radial-gradient(ellipse 50% 38% at 18% 22%, rgba(92,184,204,0.10), transparent 70%),
          radial-gradient(ellipse 42% 50% at 82% 48%, rgba(245,166,35,0.11), transparent 70%),
          radial-gradient(ellipse 50% 40% at 30% 82%, rgba(166,126,245,0.09), transparent 70%);
        animation: pr-bg-drift 28s ease-in-out infinite alternate;
      }
      @keyframes pr-bg-drift {
        0%   { transform: translate3d(0, 0, 0); }
        100% { transform: translate3d(-2.5%, 1.5%, 0); }
      }
      /* Si l'utilisateur a réduit les animations, on fige le fond */
      @media (prefers-reduced-motion: reduce) {
        .pr-screen::before { animation: none; }
      }

      /* ── ANIMATIONS D'ENTRÉE AU SCROLL ────────────────────────────
         Classe ajoutée par l'IntersectionObserver côté JS. Fade-up
         doux, stagger possible via la CSS var --anim-d (set inline
         sur l'élément avec un delay en ms). */
      .pr-anim {
        opacity: 0;
        transform: translateY(14px);
        transition:
          opacity .55s cubic-bezier(.2,.7,.3,1),
          transform .55s cubic-bezier(.2,.7,.3,1);
        transition-delay: var(--anim-d, 0ms);
        will-change: opacity, transform;
      }
      .pr-anim.pr-anim-in {
        opacity: 1;
        transform: none;
      }
      @media (prefers-reduced-motion: reduce) {
        .pr-anim {
          opacity: 1 !important;
          transform: none !important;
          transition: none !important;
        }
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

      /* TOPBAR — adaptation mobile : on aligne le brand (logo + wordmark)
         sur le format éprouvé de la fiche échantillon (.sample-brand) :
         logo 28px, wordmark 22px. Et on masque "Accueil" (le logo
         cliquable suffit) + le badge "Tarifs" current (on est déjà sur
         la page). Tableau de bord + FR/EN restent. */
      @media (max-width: 720px) {
        .pr-topbar { padding: 16px 14px; gap: 12px; }
        .pr-topbar-wordmark { font-size: 22px; }
        .pr-topbar-logo { height: 28px; }
        .pr-topbar-nav > .pr-topbar-link:first-child,
        .pr-topbar-nav > .pr-topbar-current {
          display: none;
        }
        .pr-topbar-nav { gap: 6px; }
      }
      @media (max-width: 480px) {
        .pr-topbar { padding: 14px 12px; gap: 8px; }
        .pr-topbar-link {
          font-size: 10px;
          letter-spacing: 1.2px;
          padding: 7px 11px;
        }
      }

      /* HERO */
      .pr-hero { padding: clamp(24px, 4vw, 48px) 24px clamp(16px, 3vw, 32px); display: grid; place-items: center; }
      .pr-hero-inner { width: 100%; max-width: 760px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; animation: prfadeup .5s ease; }
      .pr-eyebrow { font-family: ${T.mono}; font-size: 11px; font-weight: 500; letter-spacing: 2.4px; color: ${T.amber}; text-transform: uppercase; }
      .pr-hero-title { font-family: ${T.body}; font-weight: 700; font-size: clamp(36px, 5vw, 64px); line-height: 1.0; letter-spacing: -1.6px; color: ${T.text}; margin: 0; }
      .pr-hero-title em { font-family: inherit; font-style: normal; font-weight: inherit; color: ${T.amber}; }
      .pr-hero-sub { font-family: ${T.body}; font-size: 14px; font-weight: 300; color: ${T.muted}; margin: 0; max-width: 580px; }

      /* ── CHIPS NÉON ───────────────────────────────────────────────
         Petits éléments décoratifs (pas des CTAs). On copie le
         langage visuel des chips de la landing (.lp-chip) :
         pill, mono uppercase, légère rotation.
         Différence avec les CTAs réels :
           - cursor: default + pointer-events: none → non interactifs
           - rotation libre + placement organique (wrap, gap aéré)
           - pas de fond plein, pas de bordure 1.5px+
         L'œil les lit comme des stickers d'info, pas des boutons. */
      .pr-hero-chips {
        display: flex; flex-wrap: wrap;
        align-items: center; justify-content: center;
        gap: 10px 14px;
        width: 100%; max-width: 720px;
        margin: 0 auto 8px;
        padding: 8px 4px;
        pointer-events: none;
      }
      .pr-chip {
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
        cursor: default;
        user-select: none;
      }
      .pr-chip-amber        { background: rgba(245,166,35,0.12); border: 1px solid rgba(245,166,35,0.40); color: ${T.amber}; }
      .pr-chip-amber-strong { background: rgba(245,166,35,0.18); border: 1px solid rgba(245,166,35,0.55); color: ${T.amber}; font-size: 12.5px; }
      .pr-chip-amber-soft   { background: rgba(245,166,35,0.06); border: 1px solid rgba(245,166,35,0.26); color: rgba(245,166,35,0.85); }
      .pr-chip-cerulean     { background: rgba(92,184,204,0.10); border: 1px solid rgba(92,184,204,0.34); color: #5cb8cc; }
      .pr-chip-mint         { background: rgba(142,224,122,0.10); border: 1px solid rgba(142,224,122,0.34); color: #8ee07a; }
      .pr-chip-violet       { background: rgba(166,126,245,0.10); border: 1px solid rgba(166,126,245,0.34); color: #c2a8ff; }
      .pr-chip-neutral      { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.14); color: rgba(255,255,255,0.72); }
      /* Rotations subtiles — chacun son angle pour casser l'alignement */
      .pr-chip-rot-a { transform: rotate(-2deg); }
      .pr-chip-rot-b { transform: rotate(1.5deg); }
      .pr-chip-rot-c { transform: rotate(-1deg); }
      .pr-chip-rot-d { transform: rotate(2deg); }
      .pr-chip-rot-e { transform: rotate(-2.5deg); }
      .pr-chip-rot-f { transform: rotate(1deg); }
      /* En mobile : on remet à plat pour la lisibilité */
      @media (max-width: 640px) {
        .pr-hero-chips { gap: 8px; }
        .pr-chip { transform: none !important; font-size: 10.5px; }
      }

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

      /* SÉPARATEURS HORIZONTAUX — fine ligne en dégradé entre sections,
         identique au .lp-divider de la landing. Largeur cappée à 960px
         centrée pour ne pas filer pleine largeur. */
      .pr-divider {
        width: 100%; max-width: 960px; margin: 0 auto;
        height: 1px;
        background: linear-gradient(90deg,
          transparent, rgba(255,255,255,0.10), transparent);
      }

      /* SECTIONS
         Padding asymétrique : top resserré (la section précédente
         se termine sur le strip "inclus" qui apporte déjà sa propre
         respiration via margin-top). Bottom aligné sur .pr-section-tight
         pour homogénéiser les transitions inter-sections. */
      .pr-section { padding: clamp(28px, 4vw, 56px) 24px clamp(40px, 6vw, 72px); max-width: 1180px; margin: 0 auto; }
      .pr-section-tight { padding: clamp(40px, 6vw, 72px) 24px; }
      /* Section École : on garde un peu d'air en dessous mais on colle haut
         à la section Abonnements pour ne pas casser la lecture. */
      .pr-section-school { padding: 8px 24px clamp(40px, 6vw, 64px); }
      .pr-section-eyebrow { font-family: ${T.mono}; font-size: 10.5px; font-weight: 500; letter-spacing: 2.2px; color: ${T.amber}; text-transform: uppercase; margin-bottom: 12px; text-align: center; }
      .pr-section-title { font-family: ${T.body}; font-weight: 600; font-size: clamp(24px, 3vw, 36px); line-height: 1.2; letter-spacing: -0.6px; color: ${T.text}; margin: 0 0 16px; text-align: center; }
      .pr-section-title em { font-family: inherit; font-style: normal; font-weight: inherit; color: ${T.amber}; }
      .pr-section-lede { font-family: ${T.body}; font-size: 14px; font-weight: 300; color: ${T.muted}; margin: 0 auto; max-width: 680px; text-align: center; }

      /* PACKS GRID — 2 cartes (Pack 1 + Pack 5) côte à côte sur desktop/tablet,
         empilées en mobile. Centrées avec une largeur max pour ne pas avoir
         des cartes énormes sur grand écran. */
      .pr-packs-grid {
        margin-top: clamp(40px, 5vw, 56px);
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 24px;
        max-width: 560px;
        margin-left: auto;
        margin-right: auto;
      }
      @media (max-width: 480px)  { .pr-packs-grid { grid-template-columns: 1fr; gap: 16px; } }

      .pr-pack {
        position: relative; overflow: hidden;
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 16px;
        padding: 20px 16px 16px;
        display: flex; flex-direction: column; gap: 10px;
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

      .pr-pack-qty { display: flex; flex-direction: column; gap: 2px; align-items: center; text-align: center; }
      .pr-pack-num {
        font-family: ${T.body}; font-weight: 700;
        font-size: 38px; line-height: 1; letter-spacing: -1.5px;
        color: ${T.text};
      }
      .pr-pack-unit {
        font-family: ${T.mono}; font-size: 10.5px; font-weight: 500;
        letter-spacing: 1.6px; text-transform: uppercase; color: ${T.muted};
      }
      .pr-pack-price { display: flex; align-items: baseline; gap: 4px; justify-content: center; }
      .pr-price-amount { font-family: ${T.body}; font-weight: 700; font-size: 32px; letter-spacing: -1px; color: ${T.text}; }
      .pr-price-currency { font-family: ${T.body}; font-size: 18px; color: ${T.muted}; }
      .pr-pack-meta { display: flex; flex-direction: column; gap: 4px; flex: 1; align-items: center; text-align: center; }
      .pr-pack-unit-line { font-family: ${T.mono}; font-size: 10.5px; letter-spacing: 1.4px; color: ${T.muted2}; text-transform: uppercase; }

      /* ── PILL PRIX ─────────────────────────────────────────────────
         Pill décorative qui contient le prix. Visuellement parente des
         chips néon mais plus dense (pour porter du chiffre lisible).
         Pas de hover, cursor default → on ne la confond pas avec un CTA. */
      .pr-price-pill {
        display: inline-flex; align-items: baseline; gap: 4px;
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.10);
        box-shadow: 0 8px 22px -10px rgba(0,0,0,0.55);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        cursor: default;
        user-select: none;
      }
      .pr-price-pill-cerulean { background: rgba(92,184,204,0.08);  border-color: rgba(92,184,204,0.30); }
      .pr-price-pill-amber    { background: rgba(245,166,35,0.10);  border-color: rgba(245,166,35,0.36); }
      .pr-price-pill-mint     { background: rgba(142,224,122,0.08); border-color: rgba(142,224,122,0.30); }
      .pr-price-pill-violet   { background: rgba(166,126,245,0.08); border-color: rgba(166,126,245,0.32); }
      .pr-price-pill-rose     { background: rgba(245,123,166,0.08); border-color: rgba(245,123,166,0.30); }

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

      /* INCLUDED — grappe de chips, sans cadre (strip transparent)
         Margin-top large pour équilibrer la distance avec la section
         abonnements en-dessous (qui apporte un padding-top de section). */
      .pr-included-strip {
        margin-top: clamp(64px, 8vw, 104px);
        padding: 0;
        background: transparent;
        border: 0;
        border-radius: 0;
        display: flex; flex-direction: column; gap: 32px;
        align-items: center;
      }
      .pr-included-label { font-family: ${T.mono}; font-size: 10.5px; font-weight: 600; letter-spacing: 1.8px; color: ${T.amber}; text-transform: uppercase; text-align: center; }
      .pr-included-chips {
        display: flex; flex-wrap: wrap; gap: 10px 12px;
        justify-content: center;
        pointer-events: none;
        max-width: 640px;
      }
      /* On reset les rotations en mobile (cf. .pr-chip media query existante) */

      /* SUBS — grille 3 cards (Indie + Pro + École) avec effet podium :
         Pro au centre est featured (scale 1.06, halo amber plus fort),
         Indie + École légèrement décalées et inclinées (-1° / +1°)
         pour casser l'alignement parfait Excel-style. */
      .pr-subs-grid {
        margin-top: clamp(40px, 5vw, 64px);
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 28px;
        align-items: center;
        max-width: 880px;
        margin-left: auto;
        margin-right: auto;
      }
      @media (max-width: 880px) { .pr-subs-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: stretch; gap: 22px; max-width: 600px; } }
      @media (max-width: 560px) { .pr-subs-grid { grid-template-columns: 1fr; gap: 18px; max-width: 360px; } }

      .pr-sub {
        position: relative; overflow: hidden;
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 18px;
        padding: 22px 18px 18px;
        display: flex; flex-direction: column; gap: 12px;
        transition: border-color .25s, transform .25s, box-shadow .25s;
      }
      /* Indie (1ère card) — légère inclinaison à gauche */
      .pr-subs-grid > .pr-sub:nth-child(1) { transform: rotate(-1deg); }
      .pr-subs-grid > .pr-sub:nth-child(1):hover { transform: rotate(-1deg) translateY(-3px); border-color: rgba(255,255,255,0.16); }
      /* École (3ème card) — inclinaison miroir à droite */
      .pr-subs-grid > .pr-sub:nth-child(3) { transform: rotate(1deg); }
      .pr-subs-grid > .pr-sub:nth-child(3):hover { transform: rotate(1deg) translateY(-3px); border-color: rgba(166,126,245,0.40); }
      /* Pro (featured, 2ème card) — scale up, glow fort, no rotation */
      .pr-sub-featured {
        transform: scale(1.06);
        z-index: 2;
        box-shadow: 0 30px 60px -30px rgba(245,166,35,0.45), 0 0 0 1px rgba(245,166,35,0.20);
      }
      .pr-sub-featured:hover { transform: scale(1.06) translateY(-3px); }
      /* Sur petit écran on neutralise les rotations + scale pour lisibilité */
      @media (max-width: 880px) {
        .pr-subs-grid > .pr-sub:nth-child(1),
        .pr-subs-grid > .pr-sub:nth-child(3),
        .pr-sub-featured {
          transform: none;
        }
        .pr-subs-grid > .pr-sub:nth-child(1):hover,
        .pr-subs-grid > .pr-sub:nth-child(3):hover,
        .pr-sub-featured:hover {
          transform: translateY(-3px);
        }
      }
      .pr-sub::before {
        content: '';
        position: absolute;
        top: -40%; right: -25%;
        width: 260px; height: 260px;
        border-radius: 50%;
        filter: blur(60px);
        opacity: 0.45;
        pointer-events: none;
      }
      .pr-sub > * { position: relative; z-index: 1; }
      .pr-sub-cerulean::before { background: radial-gradient(circle, rgba(92,184,204,0.55), transparent 70%); }
      .pr-sub-amber::before    { background: radial-gradient(circle, rgba(245,166,35,0.65), transparent 70%); }
      .pr-sub-violet::before   { background: radial-gradient(circle, rgba(166,126,245,0.55), transparent 70%); }
      /* Pro card glow plus marqué — déjà casté via box-shadow dans .pr-sub-featured */
      .pr-sub-amber::before    { opacity: 0.75; }
      .pr-sub-school   { border-color: rgba(166,126,245,0.30); }
      .pr-sub-ribbon {
        position: absolute; top: 14px; right: 14px;
        font-family: ${T.mono}; font-size: 9.5px; font-weight: 600;
        letter-spacing: 1.4px; text-transform: uppercase;
        color: ${T.amber};
        background: rgba(245,166,35,0.10);
        border: 1px solid rgba(245,166,35,0.32);
        padding: 4px 10px; border-radius: 999px;
      }
      .pr-sub-meta { display: flex; flex-direction: column; gap: 6px; align-items: center; text-align: center; }
      .pr-sub-name { font-family: ${T.body}; font-weight: 600; font-size: 24px; color: ${T.text}; letter-spacing: -0.5px; line-height: 1; }
      .pr-sub-tag { font-family: ${T.body}; font-size: 12.5px; color: ${T.muted}; line-height: 1.45; }
      .pr-sub-allowance { display: flex; align-items: center; gap: 8px; justify-content: center; }
      .pr-sub-num { font-family: ${T.body}; font-weight: 700; font-size: 36px; letter-spacing: -1px; color: ${T.text}; line-height: 1; }
      .pr-sub-unit { font-family: ${T.mono}; font-size: 10px; letter-spacing: 1.4px; text-transform: uppercase; color: ${T.muted}; line-height: 1.2; }
      .pr-sub-quote { font-family: ${T.body}; font-weight: 400; font-size: 14px; letter-spacing: 0; color: ${T.muted}; line-height: 1.2; }
      .pr-sub-price { display: flex; flex-direction: column; gap: 4px; align-items: center; flex: 1; text-align: center; }
      .pr-sub-price .pr-price-amount { font-size: 28px; }
      .pr-sub-price .pr-price-suffix { font-family: ${T.body}; font-size: 14px; color: ${T.muted}; }
      .pr-sub-price .pr-price-suffix span { font-size: 11px; }
      .pr-sub-unit-line { font-family: ${T.mono}; font-size: 10px; letter-spacing: 1.4px; color: ${T.muted2}; text-transform: uppercase; }
      /* CTA école — texte décoratif violet, comportement secondary
         (lien <a> stylé comme un bouton). */
      .pr-sub-school-cta {
        text-decoration: none;
        color: ${T.violet || '#a67ef5'};
        border-color: rgba(166,126,245,0.4);
        background: rgba(166,126,245,0.10);
      }
      .pr-sub-school-cta:hover {
        color: ${T.violet || '#a67ef5'};
        border-color: rgba(166,126,245,0.65);
        background: rgba(166,126,245,0.20);
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
      .pr-school-title em { font-family: inherit; font-style: normal; font-weight: inherit; color: ${T.violet || '#a67ef5'}; }
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

      /* FAQ — numérotation oversize serif italic en compteur CSS
         (01, 02, 03…) pour un côté éditorial / plus brand qu'un
         accordéon SaaS générique. Bloc resserré pour ne pas tirer
         sur toute la largeur de la section. */
      .pr-faq {
        margin-top: clamp(24px, 3vw, 36px);
        display: flex; flex-direction: column; gap: 8px;
        counter-reset: pr-faq-counter;
        max-width: 540px;
        margin-left: auto;
        margin-right: auto;
      }
      .pr-faq-item {
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 12px;
        overflow: hidden;
        transition: border-color .2s;
        counter-increment: pr-faq-counter;
      }
      .pr-faq-item:hover { border-color: rgba(255,255,255,0.14); }
      .pr-faq-item summary {
        list-style: none;
        cursor: pointer;
        padding: 16px 20px;
        font-family: ${T.body}; font-size: 14.5px; font-weight: 500;
        color: ${T.text};
        display: flex; align-items: center; gap: 18px;
      }
      .pr-faq-item summary::before {
        content: counter(pr-faq-counter, decimal-leading-zero);
        font-family: ${T.mono}; font-weight: 600;
        font-size: 13px; line-height: 1;
        letter-spacing: 1.4px;
        color: ${T.amber};
        opacity: 0.55;
        min-width: 28px;
        flex-shrink: 0;
      }
      .pr-faq-item[open] summary::before { opacity: 0.95; }
      .pr-faq-item summary > span:first-of-type { flex: 1; }
      .pr-faq-item summary::-webkit-details-marker { display: none; }
      .pr-faq-chev { font-family: ${T.mono}; font-size: 18px; color: ${T.muted}; transition: transform .2s; }
      .pr-faq-item[open] .pr-faq-chev { transform: rotate(45deg); }
      .pr-faq-item p { margin: 0 20px 18px 66px; font-family: ${T.body}; font-size: 13.5px; font-weight: 300; color: ${T.textSoft}; line-height: 1.7; }
      @media (max-width: 560px) {
        .pr-faq-item summary::before { font-size: 12px; min-width: 24px; }
        .pr-faq-item p { margin-left: 20px; }
      }

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
