/**
 * PlateauBanner (ticket 4.4) — invitation à marquer la version comme finale
 * quand le plateau detector signale une convergence avec V_(n-1).
 *
 * Props :
 *   - currentFiche, previousFiche : fiches comparées (raw, post-normalisation)
 *   - isFinal : version déjà marquée finale → on n'affiche pas la CTA, on
 *               montre un badge "Final" à la place (rendu côté FicheScreen).
 *   - onMarkFinal() : callback persistance — toggle is_final en DB.
 *   - busy : true pendant l'update Supabase (désactive le bouton).
 *
 * Si aucun plateau détecté, retourne null (pas de bruit visuel).
 */
import { detectPlateau } from '../lib/ficheHelpers.jsx';

export default function PlateauBanner({
  currentFiche,
  previousFiche,
  isFinal = false,
  onMarkFinal,
  busy = false,
}) {
  if (isFinal) return null;
  const r = detectPlateau(currentFiche, previousFiche);
  if (!r || !r.plateau) return null;

  return (
    <section className="plateau-banner" aria-label="Plateau détecté">
      <div className="plateau-icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12 h6 l3 -7 l3 14 l3 -7 h3" />
        </svg>
      </div>
      <div className="plateau-text">
        <div className="plateau-eyebrow">PLATEAU DÉTECTÉ</div>
        <div className="plateau-title">
          Cette version converge — {r.within}/{r.total} critères stables vs la précédente.
        </div>
        <div className="plateau-sub">
          Les itérations récentes touchent peu le diagnostic. Si le mix sonne comme tu le veux, c'est peut-être le moment de la marquer comme finale.
        </div>
      </div>
      <button
        type="button"
        className="plateau-cta"
        onClick={onMarkFinal}
        disabled={busy || !onMarkFinal}
      >
        {busy ? 'Marquage…' : 'Marquer comme finale'}
      </button>
      <Styles />
    </section>
  );
}

function Styles() {
  return (
    <style>{`
      .plateau-banner {
        margin: 0 0 18px;
        padding: 14px 18px;
        border-radius: 14px;
        border: 1px solid rgba(245, 166, 35, 0.28);
        background: rgba(245, 166, 35, 0.06);
        display: flex;
        align-items: center;
        gap: 14px;
        font-family: 'DM Sans', sans-serif;
      }
      .plateau-icon {
        flex-shrink: 0;
        width: 32px; height: 32px;
        border-radius: 50%;
        background: rgba(245, 166, 35, 0.14);
        display: grid; place-items: center;
        color: var(--amber, #f5a623);
      }
      .plateau-text {
        flex: 1; min-width: 0;
        display: flex; flex-direction: column; gap: 2px;
      }
      .plateau-eyebrow {
        font-family: var(--mono, 'JetBrains Mono', monospace);
        font-size: 9.5px;
        letter-spacing: 1.8px;
        text-transform: uppercase;
        color: var(--amber, #f5a623);
      }
      .plateau-title {
        font-size: 14px;
        font-weight: 500;
        letter-spacing: -0.1px;
        color: var(--text, #ededed);
      }
      .plateau-sub {
        font-size: 12.5px;
        color: var(--muted, rgba(255,255,255,0.5));
        font-weight: 300;
        line-height: 1.5;
      }
      .plateau-cta {
        flex-shrink: 0;
        padding: 10px 16px;
        border-radius: 999px;
        background: transparent;
        color: var(--amber, #f5a623);
        border: 1px solid rgba(245, 166, 35, 0.55);
        font-family: var(--mono, 'JetBrains Mono', monospace);
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        cursor: pointer;
        transition: all .15s;
      }
      .plateau-cta:hover:not(:disabled) {
        border-color: var(--amber, #f5a623);
        background: rgba(245, 166, 35, 0.10);
      }
      .plateau-cta:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      @media (max-width: 768px) {
        .plateau-banner { flex-direction: column; align-items: stretch; gap: 12px; padding: 12px 14px; }
        .plateau-cta { align-self: flex-end; }
      }
    `}</style>
  );
}
