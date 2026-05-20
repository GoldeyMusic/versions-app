import { computeReleaseReadiness } from '../lib/ficheHelpers.jsx';
import useLang from '../hooks/useLang';

/**
 * Échelle des 6 paliers Score Band, ordonnée du plus haut au plus bas.
 * Source de vérité partagée entre `getScoreBand` (résolution du palier
 * actif) et le rendu de la ladder qui affiche tous les paliers pour
 * situer socialement.
 */
const SCORE_BAND_LADDER = [
  { stringKey: 'scoreBandReference',    toneClass: 'rr-score-band-violet' },
  { stringKey: 'scoreBandHit',          toneClass: 'rr-score-band-cerulean' },
  { stringKey: 'scoreBandPro',          toneClass: 'rr-score-band-mint' },
  { stringKey: 'scoreBandDemoAdvanced', toneClass: 'rr-score-band-amber' },
  { stringKey: 'scoreBandDeveloping',   toneClass: 'rr-score-band-amber-muted' },
  { stringKey: 'scoreBandStart',        toneClass: 'rr-score-band-neutral' },
];

/**
 * getScoreBand (B.3, refonte 2026-05-20) — palier social calé sur le
 * globalScore /100. Option A "Sobre et factuel" tranchée avec David.
 *
 * 6 paliers, du plus haut au plus bas. Le mapping couleur passe par
 * violet → cerulean → mint → amber → amber-muted → neutre. Pas de
 * rouge dans la grille : les paliers bas restent encourageants.
 *
 * Retour : { stringKey, toneClass } — stringKey à résoudre via
 * s.fiche.scoreBand*, toneClass à concaténer à `.rr-score-band`.
 * Si le score est null ou hors plage, retourne null (chip non rendu).
 */
function getScoreBand(score) {
  if (typeof score !== 'number' || Number.isNaN(score)) return null;
  if (score >= 90) return SCORE_BAND_LADDER[0];
  if (score >= 80) return SCORE_BAND_LADDER[1];
  if (score >= 65) return SCORE_BAND_LADDER[2];
  if (score >= 50) return SCORE_BAND_LADDER[3];
  if (score >= 30) return SCORE_BAND_LADDER[4];
  return SCORE_BAND_LADDER[5];
}

/**
 * ReleaseReadinessBanner (ticket 4.3) — bandeau "Prêt à sortir / Presque
 * prêt / Pas encore" rendu en tête du rapport, avec liste des bloquants
 * exacts. Trois paliers, trois couleurs (mint / amber / red).
 *
 * Props :
 *   - fiche : objet `analysisResult.fiche`
 *   - completedItems : Set<string> (clés items cochés via checklist 2.1)
 *   - uploadType : 'mix' | 'master' (refonte 2026-04-30 — toggle Mix/Master)
 *     • 'master' → libellés "Prêt à sortir / Presque prêt / Pas encore"
 *       (verdict streaming, comportement historique)
 *     • 'mix'    → libellés "Prêt pour le mastering / Presque prêt à
 *       masteriser / Pas encore prêt" : on cap au mastering, pas à la
 *       sortie streaming, parce que la pondération master & loudness
 *       est neutralisée côté backend.
 *
 * Si la fiche n'a pas de globalScore exploitable, le bandeau n'est pas
 * rendu (on ne veut pas bruiter une analyse encore en cours de stream).
 */
export default function ReleaseReadinessBanner({ fiche, completedItems, open: openProp, onToggle, uploadType = 'master', onOpenChat }) {
  const { s } = useLang();
  const r = computeReleaseReadiness(fiche, completedItems);
  // Lookup helpers : on bascule entre les deux familles de strings ("sortie"
  // vs "mastering") selon uploadType. Si une string mastering manque (ex.
  // langue où elle n'a pas encore été ajoutée), on retombe gracieusement
  // sur la version "sortie" historique.
  const isMixUpload = uploadType === 'mix';
  const pickStr = (mixKey, masterKey, defaultStr) =>
    (isMixUpload ? (s.fiche?.[mixKey] || s.fiche?.[masterKey]) : s.fiche?.[masterKey]) || defaultStr;

  const tierLabel = (
    r.tier === 'ready'
      ? pickStr('releaseMasteringReady', 'releaseReady', isMixUpload ? 'Prêt pour le mastering' : 'Prêt à sortir')
      : r.tier === 'almost'
        ? pickStr('releaseMasteringAlmost', 'releaseAlmost', isMixUpload ? 'Presque prêt à masteriser' : 'Presque prêt')
        : pickStr('releaseMasteringNotYet', 'releaseNotYet', isMixUpload ? 'Pas encore prêt' : 'Pas encore')
  );
  const fmt = (tpl, count) => (tpl || '')
    .replace('{count}', String(count))
    .replace(/\{plural\}/g, count > 1 ? 's' : '');
  const subText = (() => {
    if (r.tier === 'ready') {
      return pickStr(
        'releaseMasteringReadySub', 'releaseReadySub',
        isMixUpload
          ? "Tu peux l'envoyer au mastering — aucun bloquant détecté."
          : 'Tu peux la sortir — aucun bloquant détecté.',
      );
    }
    if (r.tier === 'almost') {
      if (r.uncompletedHigh > 0) {
        return fmt(
          pickStr('releaseMasteringAlmostSubAction', 'releaseAlmostSubAction',
            isMixUpload
              ? '{count} action{plural} prioritaire{plural} avant le mastering.'
              : '{count} action{plural} prioritaire{plural} avant de sortir.'),
          r.uncompletedHigh,
        );
      }
      return pickStr(
        'releaseMasteringAlmostSubScore', 'releaseAlmostSubScore',
        isMixUpload ? 'Score à consolider avant le mastering.' : 'Score à consolider avant la sortie.',
      );
    }
    if (r.uncompletedHigh > 0) {
      return fmt(
        pickStr('releaseMasteringNotYetSubAction', 'releaseNotYetSubAction',
          isMixUpload
            ? '{count} action{plural} prioritaire{plural} en attente.'
            : '{count} action{plural} prioritaire{plural} en attente.'),
        r.uncompletedHigh,
      );
    }
    return pickStr(
      'releaseMasteringNotYetSubScore', 'releaseNotYetSubScore',
      isMixUpload
        ? 'Score sous le seuil — encore du chemin avant le mastering.'
        : 'Score sous le seuil — encore du chemin avant la sortie.',
    );
  })();
  // Refonte 2026-04-30bis : le verdict de sortie est maintenant
  // TOUJOURS déployé (plus de toggle collapsible). Les bloquants sont
  // visibles d'office pour que l'utilisateur les voie sans avoir à
  // cliquer. Les props `open`/`onToggle` sont ignorées (gardées dans
  // la signature pour compat mais sans effet).
  if (!fiche || r.score == null) return null;

  const cfg = TIER_CONFIG[r.tier];
  const blockerCount = r.blockers.length;
  const hasBlockers = blockerCount > 0;
  // Score Band (B.3) — palier social calé sur r.score, rendu à droite
  // du verdict. Null si pas de score exploitable (pas de chip alors).
  const band = getScoreBand(r.score);
  const bandLabel = band ? (s.fiche?.[band.stringKey] || '') : '';

  return (
    <section className={`release-readiness rr-${r.tier} is-always-open`} aria-label={s.fiche?.releaseAriaLabel || 'État de sortie'}>
      <div className="rr-head">
        <span className="rr-icon" aria-hidden="true">
          <Icon kind={cfg.icon} />
        </span>
        <span className="rr-text">
          <span className="rr-eyebrow">{s.fiche?.releaseEyebrow || 'VERDICT DE SORTIE'}</span>
          <span className="rr-label">{tierLabel}</span>
          <span className="rr-sub">{subText}</span>
        </span>
        {band && bandLabel && (
          <span
            className={`rr-score-band ${band.toneClass}`}
            aria-label={`${s.fiche?.scoreBandAriaLabel || 'Niveau du mix'} : ${bandLabel}`}
          >
            {bandLabel}
          </span>
        )}
      </div>

      {/* Échelle complète des 6 paliers (B.3 follow-up 2026-05-20) — inspiré
          d'AubioMix : on montre où le mix se situe dans la grille sociale,
          pas juste le palier atteint. L'actif reprend sa couleur de tier
          (cohérent avec le chip principal à droite du verdict). Les 5 autres
          paliers restent muted pour ne pas concurrencer le chip principal.
          Compact volontairement (font 8.5px, padding minimal) pour ne pas
          allonger la section. Sur mobile, retombe en 2 lignes via flex-wrap. */}
      {band && (
        <ol
          className="rr-score-ladder"
          aria-label={s.fiche?.scoreBandAriaLabel || 'Niveau du mix'}
        >
          {SCORE_BAND_LADDER.map((tier) => {
            const isActive = tier.stringKey === band.stringKey;
            const label = s.fiche?.[tier.stringKey] || '';
            if (!label) return null;
            return (
              <li
                key={tier.stringKey}
                className={`rr-score-ladder-item${isActive ? ` is-active ${tier.toneClass}` : ''}`}
                aria-current={isActive ? 'true' : undefined}
              >
                {label}
              </li>
            );
          })}
        </ol>
      )}

      {hasBlockers && (
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

      {/* CTA chat — posé à l'intérieur du bandeau verdict, sous la
          liste des bloquants quand il y en a. Visible aussi en mode
          "ready" (pas de bloquants) pour inviter à creuser même un mix
          qui passe le seuil. Affiché sur 2 lignes : intro discrète
          ("Conseils mastering ?") sur la 1ère ligne, libellé principal
          ("Parlons-en dans le chat") sur la 2ème — l'aria-label
          regroupe les deux pour rester lisible aux lecteurs d'écran. */}
      {onOpenChat && (() => {
        const intro = s.fiche?.diagChatCtaIntro || 'Conseils mastering ?';
        const main = s.fiche?.diagChatCta || 'Parlons-en dans le chat';
        return (
          <button
            type="button"
            className="rr-chat-cta"
            onClick={onOpenChat}
            aria-label={`${intro} ${main}`}
          >
            <span className="rr-chat-cta-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 12a8.5 8.5 0 0 1-12.39 7.55L4 21l1.45-4.61A8.5 8.5 0 1 1 21 12z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="rr-chat-cta-label">
              <span className="rr-chat-cta-intro">{intro}</span>
              <span className="rr-chat-cta-main">{main}</span>
            </span>
            <span className="rr-chat-cta-arrow" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
        );
      })()}

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
        align-self: flex-start;
        display: inline-flex; align-items: center;
        font-family: var(--mono, 'JetBrains Mono', monospace);
        font-size: 9.5px;
        letter-spacing: 1.8px;
        text-transform: uppercase;
        color: #5cb8cc;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(92,184,204,0.10);
        border: 1px solid rgba(92,184,204,0.38);
        box-shadow: 0 6px 18px -10px rgba(0,0,0,0.55);
        transform: rotate(-1.5deg);
        transition: transform .2s ease, background .15s;
        margin-bottom: 2px;
      }
      .release-readiness:hover .rr-eyebrow {
        transform: rotate(0deg);
      }
      @media (max-width: 720px) {
        .rr-eyebrow { transform: none !important; }
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

      /* CTA "Parlons-en dans le chat" — discret link-style, posé en
         bas du bandeau verdict. Pas pleine largeur, pas de glow, juste
         une icône bulle + label + flèche en amber soft. Hover : couleur
         plus marquée et flèche qui glisse. */
      .rr-chat-cta {
        display: inline-flex; align-items: center;
        gap: 10px;
        margin: 14px 0 0 46px;
        padding: 0;
        background: transparent;
        border: none;
        color: rgba(245,166,35,0.78);
        font-family: var(--body);
        font-size: 12.5px; font-weight: 500;
        letter-spacing: 0;
        text-align: left;
        cursor: pointer;
        transition: color .15s;
        /* Bounce subtil toutes les 30s pour signaler discrètement la
           présence du CTA. 1er bounce à 5s, puis cycle infini.
           Le keyframe occupe ~1.5s sur 30s (5%), le reste = pause. */
        animation: rr-chat-bounce 30s ease-in-out 5s infinite;
      }
      .rr-chat-cta:hover,
      .rr-chat-cta:focus-visible {
        color: var(--amber);
        animation: none;
      }
      @keyframes rr-chat-bounce {
        0%   { transform: translateY(0); }
        1%   { transform: translateY(-5px); }
        2.5% { transform: translateY(0); }
        4%   { transform: translateY(-2px); }
        5%, 100% { transform: translateY(0); }
      }
      @media (prefers-reduced-motion: reduce) {
        .rr-chat-cta { animation: none; }
      }
      .rr-chat-cta-icon {
        display: inline-flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        opacity: 0.85;
        transition: opacity .15s;
      }
      .rr-chat-cta:hover .rr-chat-cta-icon { opacity: 1; }
      /* Label en 2 lignes : intro discrète au-dessus, main en dessous.
         flex-direction: column pour empiler, align-items: flex-start
         pour caler les deux lignes sur le même bord gauche. */
      .rr-chat-cta-label {
        display: inline-flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 1px;
        line-height: 1.15;
      }
      /* Intro et main rendues identiques visuellement (à la demande
         du user) — même taille, même graisse, même opacité. Les deux
         lignes ont juste un saut de ligne entre elles. */
      .rr-chat-cta-intro,
      .rr-chat-cta-main {
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0;
      }
      .rr-chat-cta-arrow {
        display: inline-flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        opacity: 0.7;
        transition: opacity .15s, transform .2s;
      }
      .rr-chat-cta:hover .rr-chat-cta-arrow {
        opacity: 1;
        transform: translateX(3px);
      }

      /* Score Band social (B.3, refonte 2026-05-20) — chip pill aligné à
         droite du verdict, vertically-centered. Visuellement parent des
         .vside-chip de la fiche (même typo mono, même padding, même
         rounded pill) pour rester cohérent avec le système de chips
         néon. La couleur du chip est calée sur le palier (cf.
         getScoreBand) — pas sur le tier de readiness (ready/almost/
         not-yet), car les deux dimensions sont indépendantes (un mix
         peut être "Niveau pro" mais "Pas encore prêt" si bloquants
         non résolus). Subtle rotation -1deg pour rejoindre la grammaire
         des chips de la side panel verdict. */
      .rr-score-band {
        flex-shrink: 0;
        align-self: center;
        display: inline-flex; align-items: center;
        font-family: var(--mono, 'JetBrains Mono', monospace);
        font-size: 10.5px; font-weight: 500;
        letter-spacing: 1.4px; text-transform: uppercase;
        padding: 5px 11px;
        border-radius: 999px;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
        box-shadow: 0 6px 18px -10px rgba(0,0,0,0.55);
        user-select: none;
        transform: rotate(-1deg);
        transition: transform .2s ease, background .15s, border-color .15s;
      }
      .release-readiness:hover .rr-score-band {
        transform: rotate(0deg) scale(1.02);
      }
      .rr-score-band-violet      { background: rgba(166,126,245,0.10); border: 1px solid rgba(166,126,245,0.34); color: #c2a8ff; }
      .rr-score-band-cerulean    { background: rgba(92,184,204,0.10);  border: 1px solid rgba(92,184,204,0.34);  color: #5cb8cc; }
      .rr-score-band-mint        { background: rgba(142,224,122,0.10); border: 1px solid rgba(142,224,122,0.34); color: #8ee07a; }
      .rr-score-band-amber       { background: rgba(245,166,35,0.12);  border: 1px solid rgba(245,166,35,0.40);  color: var(--amber, #f5a623); }
      /* Variante amber-muted (30-49) — même teinte, opacité réduite
         pour signaler un palier plus bas sans basculer dans le rouge. */
      .rr-score-band-amber-muted { background: rgba(245,166,35,0.06);  border: 1px solid rgba(245,166,35,0.22);  color: rgba(245,166,35,0.78); }
      /* Variante neutre (0-29) — gris très discret. Volontairement
         dépourvu de signal négatif : encourage sans punir. */
      .rr-score-band-neutral     { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.14); color: rgba(255,255,255,0.62); }

      /* Échelle des 6 paliers (B.3 follow-up) — strip horizontal sous le head.
         Compact volontairement : font 8.5px, padding 3px 7px, gap 5px. Sur
         desktop tient sur une seule ligne dans la colonne 920px de la fiche.
         Sur mobile, flex-wrap permet de retomber sur 2 lignes sans casser. */
      .rr-score-ladder {
        list-style: none;
        margin: 10px 0 0 46px;
        padding: 0;
        display: flex; flex-wrap: wrap;
        gap: 5px;
        align-items: center;
      }
      .rr-score-ladder-item {
        display: inline-flex; align-items: center;
        font-family: var(--mono, 'JetBrains Mono', monospace);
        font-size: 8.5px; font-weight: 500;
        letter-spacing: 1.2px; text-transform: uppercase;
        padding: 3px 7px;
        border-radius: 999px;
        white-space: nowrap;
        /* État par défaut (inactif) : muted, juste assez visible pour
           rester lisible mais sans concurrencer le chip principal. */
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.10);
        color: rgba(255,255,255,0.42);
        transition: background .15s, border-color .15s, color .15s;
      }
      /* État actif : la classe de couleur tier (rr-score-band-*) est
         ajoutée en plus de .is-active dans le JSX, ce qui ré-écrit
         background/border/color avec la teinte du palier. is-active
         force juste une légère emphase typographique. */
      .rr-score-ladder-item.is-active {
        font-weight: 600;
        box-shadow: 0 6px 18px -10px rgba(0,0,0,0.55);
      }

      @media (max-width: 768px) {
        .release-readiness { padding: 12px 14px; }
        .rr-head { gap: 10px; flex-wrap: wrap; }
        /* Sur mobile, le chip retombe sous le bloc texte (rr-text)
           pour ne pas serrer le label verdict. flex-wrap: wrap au
           niveau du head + ce qui suit aligne le chip à gauche du
           contenu, sous la bordure de l'icône. */
        .rr-score-band {
          margin-left: 46px;
          transform: none !important;
        }
        .rr-blockers { padding-left: 24px; }
      }
    `}</style>
  );
}
