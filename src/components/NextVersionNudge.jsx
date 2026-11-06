/**
 * NextVersionNudge (audit 2026-11-05, quick win n° 4) — invitation à importer
 * la V2 en fin de première fiche.
 *
 * Pourquoi : 57 utilisateurs sur 64 s'arrêtaient après leur première analyse.
 * Le cycle V1 → V2 (bandeau d'évolution, diagnostic comparatif) est la promesse
 * différenciante du produit, et personne ne la vivait. Depuis la migration 055,
 * chaque inscrit reçoit 2 crédits : ce bandeau donne un usage clair au second.
 *
 * Affiché UNIQUEMENT quand :
 *   - la fiche est complète et persistée (pas pendant l'analyse) ;
 *   - le titre n'a qu'UNE version (c'est une V1) ;
 *   - l'utilisateur peut éditer la fiche et a un callback onAddVersion ;
 *   - il lui reste au moins 1 crédit (sinon NoCreditsModal fait déjà le travail).
 * Fiche publique / page exemple : pas de onAddVersion → jamais rendu.
 *
 * Props :
 *   - track          : titre courant (passé tel quel à onAddVersion)
 *   - credits        : solde (number | null). null = inconnu → on affiche
 *                      quand même, sans la ligne "il te reste N".
 *   - onAddVersion   : (track) => void — ouvre AddModal en mode "ajouter une version"
 *   - s              : strings (s.fiche.nextVersion*)
 */
export default function NextVersionNudge({ track, credits, onAddVersion, s }) {
  if (!track || !onAddVersion) return null;
  if (credits != null && credits < 1) return null;
  const t = s?.fiche || {};
  const n = Number.isFinite(credits) ? credits : null;
  const remaining = n == null
    ? ''
    : (n === 1 ? (t.nextVersionRemainingOne || '') : (t.nextVersionRemainingMany || '').replace('{n}', String(n)));

  return (
    <section className="nvn-banner" aria-label={t.nextVersionEyebrow || 'Prochaine étape'}>
      <div className="nvn-icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 17 L9 11 L13 14 L20 6" />
          <path d="M15 6 h5 v5" />
        </svg>
      </div>
      <div className="nvn-text">
        <div className="nvn-eyebrow">{t.nextVersionEyebrow}</div>
        <div className="nvn-title">{t.nextVersionTitle}</div>
        <div className="nvn-sub">
          {t.nextVersionSub}
          {remaining ? <span className="nvn-remaining"> {remaining}</span> : null}
        </div>
      </div>
      <button
        type="button"
        className="nvn-cta"
        onClick={() => onAddVersion(track)}
      >
        {t.nextVersionCta}
      </button>
      <Styles />
    </section>
  );
}

function Styles() {
  return (
    <style>{`
      .nvn-banner {
        margin: 0 0 18px;
        padding: 16px 18px;
        display: flex;
        align-items: center;
        gap: 14px;
        border-radius: 14px;
        border: 1px solid rgba(245, 176, 86, 0.38);
        background: linear-gradient(135deg, rgba(245, 176, 86, 0.12), rgba(245, 176, 86, 0.04));
        color: var(--text, #f3f1ec);
      }
      .nvn-icon {
        flex: 0 0 auto;
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        border-radius: 10px;
        background: rgba(245, 176, 86, 0.16);
        color: #f5b056;
      }
      .nvn-text { flex: 1 1 auto; min-width: 0; }
      .nvn-eyebrow {
        font-family: var(--mono, 'JetBrains Mono', monospace);
        font-size: 10px;
        letter-spacing: 1.6px;
        text-transform: uppercase;
        color: #f5b056;
        margin-bottom: 4px;
      }
      .nvn-title {
        font-weight: 700;
        font-size: 15px;
        line-height: 1.3;
        margin-bottom: 4px;
      }
      .nvn-sub {
        font-size: 13px;
        line-height: 1.45;
        color: var(--muted, rgba(243, 241, 236, 0.72));
      }
      .nvn-remaining { color: #f5b056; font-weight: 600; }
      .nvn-cta {
        flex: 0 0 auto;
        padding: 10px 16px;
        border-radius: 999px;
        border: 1px solid #f5b056;
        background: #f5b056;
        color: #141311;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        white-space: nowrap;
        transition: transform 120ms ease, filter 120ms ease;
      }
      .nvn-cta:hover { filter: brightness(1.06); transform: translateY(-1px); }
      @media (max-width: 640px) {
        .nvn-banner { flex-wrap: wrap; padding: 14px; }
        .nvn-cta { width: 100%; text-align: center; }
      }
    `}</style>
  );
}
