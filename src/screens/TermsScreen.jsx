import useLang from '../hooks/useLang';
import { renderLegalInline, LegalStyles } from '../components/LegalLayout';

/**
 * TermsScreen — Conditions générales d'utilisation (FR/EN).
 * Page publique accessible via `#/terms`. Le contenu vit dans
 * `STRINGS.legal.terms` (cf. constants/strings.js) et bascule FR/EN
 * via `useLang()` comme le reste de l'app.
 */
export default function TermsScreen({ onBackToLanding, onGoPrivacy }) {
  const { s } = useLang();
  const t = s.legal.terms;
  const backLabel = s.legal.common.backToHome;
  return (
    <div className="legal-screen">
      <LegalStyles />

      <header className="legal-topbar">
        <button
          type="button"
          onClick={onBackToLanding}
          className="legal-topbar-brand"
          aria-label={backLabel}
        >
          <img src="/logo-versions-2.svg" alt="" className="legal-topbar-logo" />
          <span className="legal-topbar-wordmark">
            VER<span className="accent">Si</span>ONS
          </span>
        </button>
      </header>

      <main className="legal-main">
        <div className="legal-eyebrow">{t.eyebrow}</div>
        <h1 className="legal-title">
          {t.title} <em>{t.titleEm}</em>
        </h1>
        <p className="legal-updated">{t.updated}</p>

        <p className="legal-lede">{t.lede}</p>

        {t.sections.map((section, i) => (
          <section key={i} className="legal-section">
            <h2>{section.title}</h2>
            {section.blocks.map((block, j) => {
              if (block.type === 'ul') {
                return (
                  <ul key={j}>
                    {block.items.map((item, k) => (
                      <li key={k}>{renderLegalInline(item)}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={j}>{renderLegalInline(block.text)}</p>;
            })}
          </section>
        ))}

        <nav className="legal-footer-nav" aria-label={s.legal.common.navAria}>
          {onGoPrivacy && (
            <button type="button" onClick={onGoPrivacy} className="legal-link">
              {s.legal.common.privacyLink}
            </button>
          )}
          {onBackToLanding && (
            <button type="button" onClick={onBackToLanding} className="legal-link">
              {backLabel}
            </button>
          )}
        </nav>
      </main>
    </div>
  );
}
