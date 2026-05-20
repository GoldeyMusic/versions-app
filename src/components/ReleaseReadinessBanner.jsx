import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { computeReleaseReadiness } from '../lib/ficheHelpers.jsx';
import useLang from '../hooks/useLang';

/**
 * Couleurs hex/rgba par toneClass — utilisées pour colorer la flèche
 * (currentColor du triangle CSS) en fonction du palier qu'elle survole.
 * Source unique de vérité — si on retouche les couleurs des chips, il
 * faut aussi mettre à jour cette map.
 */
const TONE_COLORS = {
  'rr-score-band-violet':      '#c2a8ff',
  'rr-score-band-cerulean':    '#5cb8cc',
  'rr-score-band-mint':        '#8ee07a',
  'rr-score-band-amber':       '#f5a623',
  'rr-score-band-amber-muted': 'rgba(245,166,35,0.78)',
  'rr-score-band-neutral':     'rgba(255,255,255,0.62)',
};

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
  // Score Band (B.3) — palier social calé sur r.score, source de
  // l'échelle complète des 6 paliers rendue sous le head. Le chip
  // unique à droite du verdict a été retiré (doublon visuel avec
  // le palier highlighted dans la ladder).
  const band = getScoreBand(r.score);
  const activeIndex = band ? SCORE_BAND_LADDER.findIndex((t) => t.stringKey === band.stringKey) : -1;
  // Animation d'entrée (2026-05-20bis, refonte fluide) : une flèche ▼
  // unique apparaît au palier le plus bas ("Début de parcours", index 5)
  // et glisse en CONTINU (requestAnimationFrame + easeOutCubic) vers le
  // palier actif. Au passage de la flèche, le palier survolé s'allume ;
  // dès qu'elle le quitte, il fade back en muted via les transitions CSS
  // de .rr-score-ladder-item. Décélération en fin de parcours pour signer
  // l'arrivée. Respect prefers-reduced-motion : jump direct au final.
  //
  // Architecture :
  //   - refs sur l'OL + chaque LI pour mesurer les centres réels (les
  //     chips ont des largeurs variables, on ne peut pas se contenter
  //     d'un % proportionnel)
  //   - useLayoutEffect mesure les centres avant le 1er paint
  //   - useEffect lance la rAF loop quand activeIndex est connu
  //   - arrow.style.left mis à jour via ref (bypass React, 60fps fluide)
  //   - setLitIndex appelé seulement quand le palier survolé change (pas
  //     à chaque frame) pour limiter les re-renders
  const startIndex = SCORE_BAND_LADDER.length - 1; // 5 = Début de parcours
  const [litIndex, setLitIndex] = useState(startIndex);
  const ladderRef = useRef(null);
  const tierRefs = useRef([]);
  const arrowRef = useRef(null);
  const centersRef = useRef([]);

  // Mesure les centres des paliers après le 1er layout (avant paint) et
  // pose la flèche au start. useLayoutEffect garantit qu'il n'y a pas
  // de flash de "flèche au mauvais endroit" à l'apparition du banner.
  useLayoutEffect(() => {
    const measure = () => {
      if (!ladderRef.current) return;
      const containerRect = ladderRef.current.getBoundingClientRect();
      centersRef.current = tierRefs.current.map((el) => {
        if (!el) return 0;
        const r2 = el.getBoundingClientRect();
        return r2.left + r2.width / 2 - containerRect.left;
      });
      // Pose initialement la flèche sur le palier "lit" courant. À
      // l'init c'est startIndex, donc bord droit de la ladder.
      if (arrowRef.current && centersRef.current[litIndex] != null) {
        arrowRef.current.style.left = `${centersRef.current[litIndex]}px`;
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // rAF animation — glisse la flèche du startCenter vers l'endCenter
  // avec easeOutCubic. Update litIndex en cours de route quand la flèche
  // change de palier survolé.
  useEffect(() => {
    if (activeIndex < 0) return undefined;
    const prefersReduce = typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Edge case : mix au palier de départ (0-29) — pas de traversal,
    // on se cale directement et on quitte.
    if (prefersReduce || activeIndex >= startIndex) {
      setLitIndex(activeIndex);
      if (arrowRef.current && centersRef.current[activeIndex] != null) {
        arrowRef.current.style.left = `${centersRef.current[activeIndex]}px`;
      }
      return undefined;
    }
    let cancelled = false;
    let rafId = null;
    let lastLit = startIndex;
    const duration = 1100;
    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
    const startTimer = setTimeout(() => {
      const startCenter = centersRef.current[startIndex];
      const endCenter = centersRef.current[activeIndex];
      if (startCenter == null || endCenter == null) {
        // Centres pas encore mesurés (cas dégénéré) — settle direct
        setLitIndex(activeIndex);
        return;
      }
      const t0 = performance.now();
      const tick = (now) => {
        if (cancelled) return;
        const elapsed = now - t0;
        const raw = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(raw);
        const px = startCenter + (endCenter - startCenter) * eased;
        if (arrowRef.current) arrowRef.current.style.left = `${px}px`;
        // Détermine le palier survolé = centre le plus proche de la flèche
        let closest = 0;
        let minDist = Infinity;
        for (let i = 0; i < centersRef.current.length; i += 1) {
          const d = Math.abs(centersRef.current[i] - px);
          if (d < minDist) { minDist = d; closest = i; }
        }
        // Évite les re-renders inutiles : on ne setState que si le palier
        // a changé (ce qui n'arrive qu'aux moments de croisement, pas
        // à chaque frame).
        if (closest !== lastLit) {
          lastLit = closest;
          setLitIndex(closest);
        }
        if (raw < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          setLitIndex(activeIndex);
        }
      };
      rafId = requestAnimationFrame(tick);
    }, 280);
    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      if (rafId) cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  // Couleur de la flèche : héritée du palier qu'elle survole (currentColor
  // sur le triangle CSS). Transition smooth via CSS sur .rr-score-ladder-arrow.
  const arrowColor = litIndex != null && SCORE_BAND_LADDER[litIndex]
    ? TONE_COLORS[SCORE_BAND_LADDER[litIndex].toneClass] || TONE_COLORS['rr-score-band-neutral']
    : TONE_COLORS['rr-score-band-neutral'];

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
      </div>

      {/* Échelle complète des 6 paliers (B.3 follow-up 2026-05-20) — inspiré
          d'AubioMix : on montre où le mix se situe dans la grille sociale,
          pas juste le palier atteint. L'actif reprend sa couleur de tier
          (cohérent avec le chip principal à droite du verdict). Les 5 autres
          paliers restent muted pour ne pas concurrencer le chip principal.
          Compact volontairement (font 8.5px, padding minimal) pour ne pas
          allonger la section. Sur mobile, retombe en 2 lignes via flex-wrap. */}
      {band && (
        <div className="rr-score-ladder-wrap">
          {/* Flèche unique ▼ — position pilotée par JS via ref (style.left).
              La couleur transitionne smoothly via CSS quand elle change de
              palier survolé. */}
          <span
            ref={arrowRef}
            className="rr-score-ladder-arrow"
            style={{ color: arrowColor }}
            aria-hidden="true"
          />
          <ol
            ref={ladderRef}
            className="rr-score-ladder"
            aria-label={s.fiche?.scoreBandAriaLabel || 'Niveau du mix'}
          >
            {SCORE_BAND_LADDER.map((tier, idx) => {
              // `isActiveSemantic` = palier réel du mix (lecteur d'écran).
              // `isLit` = palier visuellement éclairé à l'instant t — suit
              // la flèche pendant l'animation d'entrée, puis se cale sur
              // le palier actif une fois la traversal terminée.
              const isActiveSemantic = tier.stringKey === band.stringKey;
              const isLit = idx === litIndex;
              const label = s.fiche?.[tier.stringKey] || '';
              if (!label) return null;
              return (
                <li
                  key={tier.stringKey}
                  ref={(el) => { tierRefs.current[idx] = el; }}
                  className={`rr-score-ladder-item${isLit ? ` is-active ${tier.toneClass}` : ''}`}
                  aria-current={isActiveSemantic ? 'true' : undefined}
                >
                  {label}
                </li>
              );
            })}
          </ol>
        </div>
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

      /* Échelle des 6 paliers (B.3 follow-up) — strip horizontal sous le head.
         Compact volontairement : font 8.5px, padding 3px 7px, gap 5px. Sur
         desktop tient sur une seule ligne dans la colonne 920px de la fiche.
         Sur mobile, flex-wrap permet de retomber sur 2 lignes sans casser.

         Le wrapper porte le margin externe ET la position:relative qui sert
         d'origine à la flèche absolutely-positioned. */
      .rr-score-ladder-wrap {
        position: relative;
        margin: 18px 0 0 46px; /* +8px de margin-top vs avant pour laisser la place à la flèche au-dessus */
      }
      .rr-score-ladder {
        list-style: none;
        margin: 0;
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
           rester lisible mais sans concurrencer le palier survolé. */
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.10);
        color: rgba(255,255,255,0.42);
        transition: background .15s, border-color .15s, color .15s, transform .2s;
      }
      /* État actif (palier survolé par la flèche OU palier final après anim).
         La classe tier (.rr-score-band-X) est ajoutée en plus de .is-active
         dans le JSX, ce qui chaîne la spécificité (0,3,0) pour battre les
         styles muted de la base. Bump scale + box-shadow pour faire popper. */
      .rr-score-ladder-item.is-active {
        font-weight: 600;
        transform: scale(1.08);
        box-shadow: 0 6px 18px -10px rgba(0,0,0,0.55);
      }
      .rr-score-ladder-item.is-active.rr-score-band-violet      { background: rgba(166,126,245,0.20); border-color: rgba(166,126,245,0.60); color: #c2a8ff; }
      .rr-score-ladder-item.is-active.rr-score-band-cerulean    { background: rgba(92,184,204,0.20);  border-color: rgba(92,184,204,0.60);  color: #5cb8cc; }
      .rr-score-ladder-item.is-active.rr-score-band-mint        { background: rgba(142,224,122,0.20); border-color: rgba(142,224,122,0.60); color: #8ee07a; }
      .rr-score-ladder-item.is-active.rr-score-band-amber       { background: rgba(245,166,35,0.22);  border-color: rgba(245,166,35,0.66);  color: var(--amber, #f5a623); }
      .rr-score-ladder-item.is-active.rr-score-band-amber-muted { background: rgba(245,166,35,0.14);  border-color: rgba(245,166,35,0.42);  color: rgba(245,166,35,0.92); }
      .rr-score-ladder-item.is-active.rr-score-band-neutral     { background: rgba(255,255,255,0.10); border-color: rgba(255,255,255,0.34); color: rgba(255,255,255,0.85); }

      /* Flèche ▼ qui glisse au-dessus de la ladder pendant l'animation
         d'entrée. Position pilotée par JS (style.left mis à jour à 60fps
         via rAF). Triangle CSS via border-top + transparents + 0×0. La
         couleur transitionne smoothly quand la flèche change de palier
         survolé (currentColor sur le border-top). */
      .rr-score-ladder-arrow {
        position: absolute;
        top: 0;
        left: 0; /* sera overridé par style.left en JS */
        width: 0; height: 0;
        transform: translate(-50%, -100%); /* centre horizontalement + remonte au-dessus de la ladder */
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 6px solid currentColor;
        pointer-events: none;
        transition: color .15s ease;
        /* will-change: left aide le compositeur GPU sur les longues
           transitions, mais c'est ici mis à jour à la main donc pas
           strictement nécessaire — on garde pour le bénéfice marginal. */
        will-change: left;
      }
      @media (prefers-reduced-motion: reduce) {
        .rr-score-ladder-arrow { transition: none; }
      }

      @media (max-width: 768px) {
        .release-readiness { padding: 12px 14px; }
        .rr-head { gap: 10px; }
        .rr-blockers { padding-left: 24px; }
      }
    `}</style>
  );
}
