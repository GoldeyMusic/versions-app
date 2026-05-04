import useLang from '../hooks/useLang';
import { renderLegalInline, LegalStyles } from '../components/LegalLayout';

/**
 * PrivacyScreen — Politique de confidentialité (FR/EN).
 * Page publique accessible via `#/privacy`. Le contenu vit dans
 * `STRINGS.legal.privacy` (cf. constants/strings.js) et bascule FR/EN
 * via `useLang()` comme le reste de l'app.
 */
export default function PrivacyScreen({ onBackToLanding, onGoTerms }) {
  const { s } = useLang();
  const p = s.legal.privacy;
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
        <div className="legal-eyebrow">{p.eyebrow}</div>
        <h1 className="legal-title">
          {p.title} <em>{p.titleEm}</em>
        </h1>
        <p className="legal-updated">{p.updated}</p>

        <p className="legal-lede">{p.lede}</p>

        {p.sections.map((section, i) => (
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
          {onGoTerms && (
            <button type="button" onClick={onGoTerms} className="legal-link">
              {s.legal.common.termsLink}
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
