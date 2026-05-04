import T from '../constants/theme';

/**
 * Helpers partagés par PrivacyScreen et TermsScreen.
 * - `renderLegalInline(text)` : transforme `**gras**` en <strong> et le
 *   placeholder `{email}` en lien mailto vers l'adresse de contact.
 * - `<LegalStyles />` : feuille de styles commune aux deux pages
 *   légales (mêmes classes .legal-*, montée une seule fois — un seul
 *   écran rendu à la fois).
 */
const CONTACT_EMAIL = 'contact@versions.studio';

export function renderLegalInline(text) {
  if (text == null) return null;
  const parts = String(text).split(/(\*\*[^*]+\*\*|\{email\})/g);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part === '{email}') {
      return (
        <a key={i} href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function LegalStyles() {
  return (
    <style>{`
      .legal-screen {
        position: relative; z-index: 1;
        min-height: 100vh; min-height: 100dvh;
        background: transparent;
        color: var(--text, ${T.text});
        font-family: var(--body, ${T.body});
      }

      .legal-topbar {
        padding: 22px 18px;
        display: flex; align-items: center; justify-content: flex-start;
      }
      .legal-topbar-brand {
        display: inline-flex; align-items: center; gap: 8px;
        background: transparent; border: 0; cursor: pointer; padding: 0;
        color: ${T.text};
      }
      .legal-topbar-logo {
        height: 38px; width: auto;
        filter: drop-shadow(0 0 16px rgba(245,166,35,0.18));
      }
      .legal-topbar-wordmark {
        font-family: ${T.body}; font-weight: 700;
        font-size: 27px; letter-spacing: -0.5px;
        color: ${T.text}; line-height: 1;
      }
      .legal-topbar-wordmark .accent { color: ${T.amber}; }

      .legal-main {
        max-width: 700px;
        margin: 0 auto;
        padding: clamp(32px, 6vw, 64px) 24px clamp(64px, 10vw, 120px);
      }

      .legal-eyebrow {
        font-family: ${T.mono};
        font-size: 11px; font-weight: 500;
        letter-spacing: 2px; text-transform: uppercase;
        color: ${T.amber};
        margin-bottom: 16px;
      }
      .legal-title {
        font-family: ${T.body};
        font-weight: 600;
        font-size: clamp(32px, 4.6vw, 48px);
        line-height: 1.15; letter-spacing: -0.8px;
        color: ${T.text};
        margin: 0 0 12px;
      }
      .legal-title em {
        font-style: normal;
        color: ${T.amber};
      }
      .legal-updated {
        font-family: ${T.mono};
        font-size: 11px; font-weight: 400;
        letter-spacing: 1.4px; text-transform: uppercase;
        color: ${T.muted};
        margin: 0 0 32px;
      }
      .legal-lede {
        font-size: 17px; line-height: 1.6;
        color: ${T.textSoft};
        margin: 0 0 40px;
      }

      .legal-section {
        margin-bottom: 32px;
      }
      .legal-section h2 {
        font-family: ${T.body};
        font-weight: 600;
        font-size: 18px; line-height: 1.3;
        letter-spacing: -0.2px;
        color: ${T.text};
        margin: 0 0 12px;
      }
      .legal-section p {
        font-size: 15px; line-height: 1.7;
        color: ${T.textSoft};
        margin: 0 0 12px;
      }
      .legal-section p:last-child { margin-bottom: 0; }
      .legal-section ul {
        margin: 0 0 12px;
        padding-left: 22px;
      }
      .legal-section li {
        font-size: 15px; line-height: 1.7;
        color: ${T.textSoft};
        margin-bottom: 8px;
      }
      .legal-section li:last-child { margin-bottom: 0; }
      .legal-section strong {
        color: ${T.text};
        font-weight: 600;
      }
      .legal-section a {
        color: ${T.amber};
        text-decoration: none;
        border-bottom: 1px solid ${T.amberLine};
        transition: border-color .15s;
      }
      .legal-section a:hover {
        border-bottom-color: ${T.amber};
      }

      .legal-footer-nav {
        margin-top: 56px;
        padding-top: 32px;
        border-top: 1px solid ${T.border};
        display: flex; flex-wrap: wrap; gap: 12px 24px;
      }
      .legal-link {
        font-family: ${T.mono};
        font-size: 11px; font-weight: 500;
        letter-spacing: 1.6px; text-transform: uppercase;
        color: ${T.muted};
        background: transparent; border: 0;
        padding: 0;
        cursor: pointer;
        transition: color .15s;
      }
      .legal-link:hover { color: ${T.amber}; }

      @media (max-width: 768px) {
        .legal-main { padding: 32px 20px 80px; }
        .legal-title { font-size: 30px; }
        .legal-lede { font-size: 16px; }
        .legal-section h2 { font-size: 17px; }
      }
    `}</style>
  );
}
