import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import T from '../constants/theme';
import useLang from '../hooks/useLang';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

/**
 * FeedbackModal — questionnaire 6 questions pour capter les retours
 * testeurs en phase beta. Posté dans la table public.feedback (cf.
 * supabase/migrations/024_feedback.sql).
 *
 * Pourquoi en in-app et pas Tally/Typeform : on veut capter le contexte
 * automatiquement (version_id, track_id, route, user_agent) sans le
 * demander au testeur, et on veut centraliser ces retours dans Supabase
 * à côté des autres signaux d'observabilité (analysis_cost_logs,
 * chat_cost_logs).
 *
 * Déclenché depuis le DashboardRail (pill "Ton avis compte" en bas-gauche)
 * ou la sidebar. Si on est sur une fiche, version_id/track_id sont passés
 * en props pour enrichir le retour avec le contexte.
 *
 * Grammaire visuelle : on suit RIGOUREUSEMENT le template unifié des
 * modales du site (.add-mini-card.is-upload + .add-mini-eyebrow + .add-mini-title
 * + .add-mini-input + .add-mini-foot + .add-mini-btn).
 *
 * IMPORTANT TYPOGRAPHIE :
 *   - PAS de Bebas Neue (T.display) — bannie de la charte courante
 *   - PAS de Cormorant Garamond (T.serif) — réservée aux verdicts
 *   - Tout en DM Sans (var(--body)) ou JetBrains Mono (var(--mono))
 *   - Les <em> dans .add-mini-title sont automatiquement coloriés ambre
 *     (cf. .add-mini-title em dans MockupStyles)
 */
export default function FeedbackModal({ onClose, versionId = null, trackId = null }) {
  const { s, lang } = useLang();
  const { user } = useAuth();
  const t = s.feedback || {};

  // ── État formulaire ────────────────────────────────────────────────
  const [nps, setNps] = useState(null);          // 0..10 ou null
  const [surprise, setSurprise] = useState('');
  const [friction, setFriction] = useState('');
  const [paywill, setPaywill] = useState('');
  const [oneliner, setOneliner] = useState('');
  const [priority, setPriority] = useState('');

  // ── État UX ────────────────────────────────────────────────────────
  // 'form' | 'submitting' | 'success' | 'error'
  const [stage, setStage] = useState('form');
  const [errorMsg, setErrorMsg] = useState('');

  // Au moins une réponse pour activer le submit. On considère le NPS
  // comme une réponse à part entière (même 0 = info utile).
  const hasAnyAnswer = useMemo(() => {
    if (nps !== null && nps !== undefined) return true;
    return [surprise, friction, paywill, oneliner, priority]
      .some((v) => (v || '').trim().length > 0);
  }, [nps, surprise, friction, paywill, oneliner, priority]);

  // Échappe = ferme (sauf en cours d'envoi).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && stage !== 'submitting') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, stage]);

  const handleSubmit = async () => {
    if (!user) {
      setErrorMsg(t.mustBeSignedIn || 'Sign in required.');
      setStage('error');
      return;
    }
    if (!hasAnyAnswer) return;

    setStage('submitting');
    setErrorMsg('');
    try {
      const route = (typeof window !== 'undefined' && window.location?.hash) || '';
      const userAgent = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
      const appVersion = (import.meta.env.VITE_APP_VERSION || '').trim() || null;

      const payload = {
        user_id: user.id,
        nps: nps,
        surprise: surprise.trim() || null,
        friction: friction.trim() || null,
        paywill: paywill.trim() || null,
        oneliner: oneliner.trim() || null,
        priority: priority.trim() || null,
        version_id: versionId || null,
        track_id: trackId || null,
        route: route || null,
        app_version: appVersion,
        user_agent: userAgent || null,
        locale: lang || null,
      };

      const { error } = await supabase.from('feedback').insert(payload);
      if (error) throw error;

      setStage('success');
    } catch (err) {
      setErrorMsg(err?.message || '');
      setStage('error');
    }
  };

  const handleBackdropClick = () => {
    if (stage === 'submitting') return;
    onClose?.();
  };

  // ── Rendu ──────────────────────────────────────────────────────────
  // On utilise la grammaire .add-mini-card.is-upload (600px, padding
  // confortable, halos ambre/cerulean intégrés). Le close button et
  // tous les états passent par les classes existantes.
  return createPortal((
    <div className="add-mini-backdrop" onClick={handleBackdropClick}>
      <div
        className="add-mini-card is-upload fb-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t.title || 'Feedback'}
      >
        {/* Bouton fermeture — petit cercle haut-droite, classe .add-mini-back
            réutilisée (link-style discret) plutôt que de réinventer. */}
        <button
          type="button"
          onClick={() => stage !== 'submitting' && onClose?.()}
          className="fb-close"
          aria-label="Fermer"
          disabled={stage === 'submitting'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Titre seul (eyebrow retiré 2026-05-03 sur retour David —
            l'info de durée est déjà donnée dans l'intro descriptive
            juste en dessous, pas la peine de la dupliquer en eyebrow). */}
        <div className="add-mini-title">
          {/* On colore "avis" en ambre via <em> — cf. .add-mini-title em
              dans MockupStyles (font-style: normal, color: amber). */}
          {(() => {
            // Stratégie : on prend le titre traduit (FR "TON AVIS",
            // EN "YOUR FEEDBACK"), on emphasie le dernier mot pour rester
            // raccord avec la convention des autres modales (qui colorent
            // le dernier mot du titre).
            const title = (t.title || 'Ton avis').toString();
            const idx = title.lastIndexOf(' ');
            if (idx < 0) return <em>{title}</em>;
            return <>{title.slice(0, idx)} <em>{title.slice(idx + 1)}</em></>;
          })()}
        </div>

        {/* Intro descriptive — masquée sur les états success/error. */}
        {stage !== 'success' && stage !== 'error' && (
          <div className="fb-intro">{t.intro}</div>
        )}

        {/* ────────── ÉTAT : success ────────── */}
        {stage === 'success' && (
          <div className="fb-result">
            <div className="add-mini-title fb-result-title">
              {(() => {
                const tt = (t.successTitle || 'Reçu — merci.').toString();
                const idx = tt.lastIndexOf(' ');
                if (idx < 0) return <em>{tt}</em>;
                return <>{tt.slice(0, idx)} <em>{tt.slice(idx + 1)}</em></>;
              })()}
            </div>
            <div className="fb-result-body">{t.successBody}</div>
            <div className="add-mini-foot">
              <button
                type="button"
                className="add-mini-btn is-primary"
                onClick={onClose}
              >
                {t.successClose}
              </button>
            </div>
          </div>
        )}

        {/* ────────── ÉTAT : error ────────── */}
        {stage === 'error' && (
          <div className="fb-result">
            <div className="fb-result-error-title">{t.errorTitle}</div>
            <div className="fb-result-body">
              {t.errorBody}
              {errorMsg ? <div className="fb-result-error-detail">{errorMsg}</div> : null}
            </div>
            <div className="add-mini-foot">
              <button type="button" className="add-mini-btn" onClick={onClose}>
                {t.cancel}
              </button>
              <button
                type="button"
                className="add-mini-btn is-primary"
                onClick={() => { setStage('form'); }}
              >
                {t.errorRetry}
              </button>
            </div>
          </div>
        )}

        {/* ────────── ÉTAT : form / submitting ────────── */}
        {(stage === 'form' || stage === 'submitting') && (
          <>
            {/* Q1 — NPS */}
            <FbQuestion label={t.q1Label} hint={t.q1Hint}>
              <NpsScale
                value={nps}
                onChange={setNps}
                lowLabel={t.q1Low}
                highLabel={t.q1High}
                disabled={stage === 'submitting'}
              />
            </FbQuestion>

            {/* Q2 — Surprise */}
            <FbQuestion label={t.q2Label}>
              <textarea
                className="add-mini-input add-mini-textarea fb-textarea"
                value={surprise}
                onChange={(e) => setSurprise(e.target.value)}
                placeholder={t.q2Placeholder}
                disabled={stage === 'submitting'}
                rows={2}
              />
            </FbQuestion>

            {/* Q3 — Friction */}
            <FbQuestion label={t.q3Label}>
              <textarea
                className="add-mini-input add-mini-textarea fb-textarea"
                value={friction}
                onChange={(e) => setFriction(e.target.value)}
                placeholder={t.q3Placeholder}
                disabled={stage === 'submitting'}
                rows={2}
              />
            </FbQuestion>

            {/* Q4 — Pay willingness */}
            <FbQuestion label={t.q4Label}>
              <textarea
                className="add-mini-input add-mini-textarea fb-textarea"
                value={paywill}
                onChange={(e) => setPaywill(e.target.value)}
                placeholder={t.q4Placeholder}
                disabled={stage === 'submitting'}
                rows={2}
              />
            </FbQuestion>

            {/* Q5 — Verbatim landing */}
            <FbQuestion label={t.q5Label}>
              <textarea
                className="add-mini-input add-mini-textarea fb-textarea"
                value={oneliner}
                onChange={(e) => setOneliner(e.target.value)}
                placeholder={t.q5Placeholder}
                disabled={stage === 'submitting'}
                rows={2}
              />
            </FbQuestion>

            {/* Q6 — Priorité */}
            <FbQuestion label={t.q6Label}>
              <textarea
                className="add-mini-input add-mini-textarea fb-textarea"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                placeholder={t.q6Placeholder}
                disabled={stage === 'submitting'}
                rows={2}
              />
            </FbQuestion>

            {/* Footer — .add-mini-foot.is-split pour aligner le hint à
                gauche et les boutons à droite, comme les modales d'upload. */}
            <div className="add-mini-foot is-split">
              <div
                className="fb-required-hint"
                style={{ visibility: hasAnyAnswer ? 'hidden' : 'visible' }}
              >
                {t.requiredHint}
              </div>
              <div className="fb-foot-actions">
                <button
                  type="button"
                  className="add-mini-btn"
                  onClick={onClose}
                  disabled={stage === 'submitting'}
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  className="add-mini-btn is-primary"
                  onClick={handleSubmit}
                  disabled={!hasAnyAnswer || stage === 'submitting'}
                >
                  {stage === 'submitting' ? t.submitting : t.submit}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  ), document.body);
}

/* ──────────────────────────────────────────────────────────────────────
   Sous-composants privés.
   ────────────────────────────────────────────────────────────────────── */

/**
 * FbQuestion — wrapper d'une question. Rend le label en DM Sans normal-case
 * (pas mono uppercase comme .add-mini-field-label, qui rendrait une question
 * complète illisible) + un hint mono optionnel sous le label.
 */
function FbQuestion({ label, hint, children }) {
  return (
    <div className="add-mini-field fb-q">
      <div className="fb-q-label">{label}</div>
      {hint && <div className="fb-q-hint">{hint}</div>}
      {children}
    </div>
  );
}

/**
 * NpsScale — 11 boutons (0..10) qui se colorent selon le segment NPS :
 *   0..6 = rouge (détracteur), 7..8 = ambre (passif), 9..10 = mint (promoteur).
 * Cliquer sur la valeur déjà sélectionnée la déselectionne.
 */
function NpsScale({ value, onChange, lowLabel, highLabel, disabled }) {
  const colorFor = (n) => {
    if (n <= 6) return T.red;
    if (n <= 8) return T.amber;
    return T.mint;
  };
  return (
    <div className="fb-nps-wrap">
      <div className="fb-nps-row">
        {Array.from({ length: 11 }, (_, n) => {
          const active = value === n;
          const c = colorFor(n);
          return (
            <button
              key={n}
              type="button"
              onClick={() => !disabled && onChange(active ? null : n)}
              disabled={disabled}
              className={`fb-nps-btn${active ? ' is-active' : ''}`}
              style={active ? {
                borderColor: c,
                background: `${c}26`,
                color: c,
              } : undefined}
              aria-pressed={active}
              aria-label={`Note ${n} sur 10`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="fb-nps-anchors">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
