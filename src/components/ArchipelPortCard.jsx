import { useId } from 'react';
import useLang from '../hooks/useLang';
import T from '../constants/theme';
import { useArchipelPortLinks, PortAppleIcon, PortWindowsIcon } from '../lib/archipelPort';

/**
 * Archipel Port — carte compacte (landing, pied de page ; /plugin, pied de
 * page). Contenu et liens : cf. lib/archipelPort.jsx.
 *
 * @param {'default'|'plugin'} variant — 'plugin' = accroche « l'app gratuite
 *   d'Archipel Audio » (page /plugin) ; sinon l'accroche abonnement/crédits.
 */
export default function ArchipelPortCard({ variant = 'default', className = '' }) {
  const { s, lang } = useLang();
  const titleId = useId();
  const links = useArchipelPortLinks(lang);
  const p = s.archipelPort;
  if (!p) return null;
  const pitch = variant === 'plugin' ? p.pitchPlugin : p.pitch;
  const ext = { target: '_blank', rel: 'noopener noreferrer' };

  return (
    <aside className={`apc-card${className ? ` ${className}` : ''}`} aria-labelledby={titleId}>
      <ArchipelPortCardStyles />
      <div className="apc-eyebrow">{p.eyebrow}</div>
      <h3 className="apc-title" id={titleId}>{p.title}</h3>
      <p className="apc-pitch">{pitch}</p>
      <div className="apc-actions">
        <a className="apc-btn" href={links.mac} {...ext} aria-label={p.osAria.replace('{os}', p.mac)}>
          {PortAppleIcon}{p.mac}
        </a>
        <a className="apc-btn" href={links.windows} {...ext} aria-label={p.osAria.replace('{os}', p.windows)}>
          {PortWindowsIcon}{p.windows}
        </a>
        <a className="apc-link" href={links.landing} {...ext} aria-label={`${p.discover} ${p.newTab}`}>
          {p.discover} <span aria-hidden="true">→</span>
        </a>
      </div>
    </aside>
  );
}

function ArchipelPortCardStyles() {
  return (
    <style>{`
      .apc-card {
        box-sizing: border-box;
        width: 100%; max-width: 560px;
        margin: 0 auto;
        padding: 20px 22px;
        text-align: left;
        border-radius: 14px;
        background: rgba(255,255,255,0.025);
        border: 1px solid ${T.borderStrong};
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
      }
      .apc-eyebrow {
        font-family: ${T.mono};
        font-size: 10px; font-weight: 500;
        letter-spacing: 1.6px; text-transform: uppercase;
        color: ${T.muted};
        margin-bottom: 6px;
      }
      .apc-title {
        font-family: ${T.body};
        font-size: 18px; font-weight: 600; letter-spacing: -0.3px;
        color: ${T.text};
        margin: 0 0 6px;
        line-height: 1.2;
      }
      .apc-pitch {
        font-family: ${T.body};
        font-size: 13.5px; font-weight: 400;
        line-height: 1.55;
        color: ${T.textSoft};
        margin: 0 0 14px;
      }
      .apc-actions {
        display: flex; flex-wrap: wrap; align-items: center;
        gap: 10px 10px;
      }
      .apc-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 7px;
        padding: 9px 18px;
        border-radius: 999px;
        border: 1px solid ${T.amberLine};
        background: transparent;
        color: ${T.amber};
        font-family: ${T.mono};
        font-size: 11px; font-weight: 500;
        letter-spacing: 1.2px; text-transform: uppercase;
        line-height: 16px;
        text-decoration: none;
        transition: border-color .15s, background .15s;
      }
      .apc-btn:hover {
        border-color: ${T.amber};
        background: rgba(245,166,35,0.08);
      }
      .apc-link {
        margin-left: 4px;
        font-family: ${T.mono};
        font-size: 11px; font-weight: 500;
        letter-spacing: 0.6px;
        color: ${T.muted};
        text-decoration: none;
        transition: color .15s;
      }
      .apc-link:hover { color: ${T.amber}; }
      .apc-btn:focus-visible, .apc-link:focus-visible {
        outline: 2px solid ${T.amber}; outline-offset: 2px;
      }
      @media (max-width: 480px) {
        .apc-card { padding: 18px 16px; }
        .apc-btn { flex: 1 1 0; }
        .apc-link { flex-basis: 100%; margin: 4px 0 0; }
      }
    `}</style>
  );
}
