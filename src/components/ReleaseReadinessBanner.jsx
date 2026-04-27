import { useState } from 'react';
import { computeReleaseReadiness } from '../lib/ficheHelpers.jsx';

/**
 * ReleaseReadinessBanner (ticket 4.3) — bandeau "Prêt à sortir / Presque
 * prêt / Pas encore" rendu en tête du rapport, avec liste des bloquants
 * exacts. Trois paliers, trois couleurs (mint / amber / red).
 *
 * Props :
 *   - fiche : objet `analysisResult.fiche`
 *   - completedItems : Set<string> (clés items cochés via checklist 2.1)
 *
 * Si la fiche n'a pas de globalScore exploitable, le bandeau n'est pas
 * rendu (on ne veut pas bruiter une analyse encore en cours de stream).
 */
export default function ReleaseReadinessBanner({ fiche, completedItems }) {
  const r = computeReleaseReadiness(fiche, completedItems);
  // null safety : si la fiche n'a pas de score (stream partiel), on attend.
  const [open, setOpen] = useState(true);
  if (!fiche || r.score == null) return null;

  const cfg = TIER_CONFIG[r.tier];
  const blockerCount = r.blockers.length;
  const hasBlockers = blockerCount > 0;
  const showToggle = hasBlockers && r.tier !== 'ready';

  return (
    <section className={`release-readiness rr-${r.tier}`} aria-label="État de sortie">
      <div
        className="rr-head"
        role={showToggle ? 'button' : undefined}
        tabIndex={showToggle ? 0 : -1}
        onClick={showToggle ? () => setOpen((v) => !v) : undefined}
        onKeyDown={showToggle ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((v) => !v);
          }
        } : undefined}
        style={{ cursor: showToggle ? 'pointer' : 'default' }}
      >
        <span className="rr-icon" aria-hidden="true">
          <Icon kind={cfg.icon} />
        </span>
        <span className="rr-text">
          <span className="rr-eyebrow">VERDICT DE SORTIE</span>
          <span className="rr-label">{cfg.label}</span>
          <span className="rr-sub">
            {r.tier === 'ready' && 'Tu peux la sortir — aucun bloquant détecté.'}
            {r.tier === 'almost' && (
              r.uncompletedHigh > 0
                ? `${r.uncompletedHigh} action${r.uncompletedHigh > 1 ? 's' : ''} prioritaire${r.uncompletedHigh > 1 ? 's' : ''} avant de sortir.`
                : 'Score à consolider avant la sortie.'
            )}
            {r.tier === 'not-yet' && (
              r.uncompletedHigh > 0
                ? `${r.uncompletedHigh} action${r.uncompletedHigh > 1 ? 's' : ''} prioritaire${r.uncompletedHigh > 1 ? 's' : ''} en attente.`
                : 'Score sous le seuil — encore du chemin avant la sortie.'
            )}
          </span>
        </span>
        {showToggle && (
          <span className={`rr-chev${open ? ' open' : ''}`} aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>

      {open && hasBlockers && (
        <ul className="rr-blockers">
          {r.blockers.map((b, i) => (
            <li key={i} className={`rr-blocker rr-blocker-${b.kind}`}>
              <span className="rr-blocker-mark" aria-hidden="true" />
              {b.kind === 'score'
                ? <span className="rr-blocker-text">{b.text}</span>
                : (
                  <span className="rr-blocker-text">
                    {b.cat && <span className="rr-blocker-cat">{b.cat}</span>}
                    <span>{b.title}</span>
                  </span>
                )
              }
            </li>
          ))}
        </ul>
      )}

      <Styles />
    </section>
  );
}

const TIER_CONFIG = {
  ready: { label: 'Prêt à sortir', icon: 'check' },
  almost: { label: 'Presque prêt', icon: 'half' },
  'not-yet': { label: 'Pas encore', icon: 'circle' },
};

function Icon({ kind }) {
  if (kind === 'check') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  if (kind === 'half') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2 v20" />
        <path d="M12 2 a10 10 0 0 1 0 20" fill="currentColor" opacity="0.18" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function Styles() {
  return (
    <style>{`
      .release-readiness {
        margin: 0 0 18px;
        padding: 14px 18px;
        border-radius: 14px;
        border: 1px solid var(--border, rgba(255,255,255,0.06));
        background: var(--card, #101118);
        position: relative;
        overflow: hidden;
        font-family: 'DM Sans', sans-serif;
      }
      .release-readiness::after {
        content: '';
        position: absolute;
        left: 0; top: 0; bottom: 0;
        width: 3px;
        background: var(--rr-accent);
      }
      .rr-ready { --rr-accent: var(--mint, #8ee07a); }
      .rr-almost { --rr-accent: var(--amber, #f5a623); }
      .rr-not-yet { --rr-accent: var(--red, #ff5d5d); }

      .rr-head {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .rr-icon {
        flex-shrink: 0;
        width: 32px; height: 32px;
        border-radius: 50%;
        background: color-mix(in oklab, var(--rr-accent) 14%, transparent);
        display: grid; place-items: center;
        color: var(--rr-accent);
      }
      .rr-text {
        flex: 1; min-width: 0;
        display: flex; flex-direction: column; gap: 2px;
      }
      .rr-eyebrow {
        font-family: var(--mono, 'JetBrains Mono', monospace);
        font-size: 9.5px;
        letter-spacing: 1.8px;
        text-transform: uppercase;
        color: var(--rr-accent);
      }
      .rr-label {
        font-size: 16px;
        font-weight: 500;
        letter-spacing: -0.2px;
        color: var(--text, #ededed);
      }
      .rr-sub {
        font-size: 12.5px;
        color: var(--muted, rgba(255,255,255,0.5));
        font-weight: 300;
      }
      .rr-chev {
        flex-shrink: 0;
        color: var(--muted, rgba(255,255,255,0.5));
        transition: transform .2s ease;
      }
      .rr-chev.open { transform: rotate(180deg); }

      .rr-blockers {
        margin: 12px 0 0;
        padding: 12px 0 0 46px;
        list-style: none;
        border-top: 1px dashed rgba(255,255,255,0.06);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .rr-blocker {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 13px;
        line-height: 1.5;
        color: var(--text, #ededed);
        font-weight: 300;
      }
      .rr-blocker-mark {
        flex-shrink: 0;
        margin-top: 6px;
        width: 5px; height: 5px; border-radius: 50%;
        background: var(--rr-accent);
        opacity: 0.7;
      }
      .rr-blocker-text {
        display: inline-flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: baseline;
      }
      .rr-blocker-cat {
        font-family: var(--mono, 'JetBrains Mono', monospace);
        font-size: 10px;
        letter-spacing: 1.2px;
        text-transform: uppercase;
        color: var(--muted, rgba(255,255,255,0.5));
      }
      .rr-blocker-score .rr-blocker-text { color: var(--rr-accent); }

      @media (max-width: 768px) {
        .release-readiness { padding: 12px 14px; }
        .rr-head { gap: 10px; }
        .rr-blockers { padding-left: 24px; }
      }
    `}</style>
  );
}
