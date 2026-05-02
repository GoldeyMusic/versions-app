import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import T from '../constants/theme';
import useLang from '../hooks/useLang';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { IconX } from './Icons';

/**
 * FeedbackModal — questionnaire 6 questions pour capter les retours
 * testeurs en phase beta. Posté dans la table public.feedback (cf.
 * supabase/migrations/024_feedback.sql).
 *
 * Pourquoi en in-app et pas Tally/Typeform : on veut capter le contexte
 * automatiquement (version_id, track_id, route, user_agent) sans le
 * demander au testeur, et on veut centraliser ces retours dans Supabase
 * à côté des autres signaux d'observabilité (analysis_cost_logs,
 * chat_cost_logs). Un onglet Feedback dans #/admin viendra plus tard.
 *
 * Déclenché depuis le DashboardRail (bouton bulle "Ton avis ?"). La
 * route courante (window.location.hash) est capturée à la soumission.
 * Si on est sur une fiche, version_id/track_id sont passés en props.
 *
 * Comportement :
 *   - 6 champs optionnels mais au moins UN doit être renseigné (NPS
 *     ou un verbatim non vide), sinon le bouton submit reste disabled.
 *   - Trois états visuels : form (par défaut) → submitting → success
 *     ou error (avec retry).
 *   - Esc ferme uniquement quand pas en cours d'envoi.
 *
 * Grammaire visuelle : on suit le template unifié des modales du site
 * (.add-mini-backdrop / .add-mini-card.is-upload) pour garder l'identité
 * cohérente avec AddModal / RenameModal / ExportPdfModal.
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
  const cardRef = useRef(null);

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
      // Pas de console.error en prod : on log via Supabase si besoin
      // mais on garde la fenêtre console propre côté testeur.
      setErrorMsg(err?.message || '');
      setStage('error');
    }
  };

  const handleBackdropClick = () => {
    if (stage === 'submitting') return;
    onClose?.();
  };

  // ── Rendu ──────────────────────────────────────────────────────────
  return createPortal((
    <div className="add-mini-backdrop" onClick={handleBackdropClick}>
      <div
        ref={cardRef}
        className="add-mini-card is-upload"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t.title || 'Feedback'}
        style={{ width: 620 }}
      >
        {/* Croix de fermeture */}
        <button
          type="button"
          onClick={() => stage !== 'submitting' && onClose?.()}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: stage === 'submitting' ? 'not-allowed' : 'pointer',
            color: T.muted,
            zIndex: 2,
          }}
        >
          <IconX c={T.muted} />
        </button>

        {/* Eyebrow + titre + intro */}
        <div className="add-mini-eyebrow" style={{
          fontFamily: T.mono,
          fontSize: 11,
          letterSpacing: 1.8,
          color: T.amber,
          textTransform: 'uppercase',
          marginBottom: 6,
        }}>
          BETA · {t.sub}
        </div>
        <div className="add-mini-title" style={{
          fontFamily: T.display,
          fontSize: 24,
          letterSpacing: 2.4,
          color: T.text,
          marginBottom: 8,
        }}>
          {t.title}
        </div>

        {stage !== 'success' && stage !== 'error' && (
          <div style={{
            fontFamily: T.body,
            fontSize: 14,
            color: T.muted,
            lineHeight: 1.55,
            marginBottom: 22,
          }}>
            {t.intro}
          </div>
        )}

        {/* ────────── ÉTAT : success ────────── */}
        {stage === 'success' && (
          <div style={{ paddingTop: 8, paddingBottom: 6 }}>
            <div style={{
              fontFamily: T.serif,
              fontSize: 22,
              color: T.amber,
              lineHeight: 1.3,
              marginBottom: 10,
            }}>
              {t.successTitle}
            </div>
            <div style={{
              fontFamily: T.body,
              fontSize: 15,
              color: T.textSoft,
              lineHeight: 1.6,
              marginBottom: 22,
            }}>
              {t.successBody}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
          <div style={{ paddingTop: 8, paddingBottom: 6 }}>
            <div style={{
              fontFamily: T.body,
              fontWeight: 700,
              fontSize: 16,
              color: T.red,
              marginBottom: 8,
            }}>
              {t.errorTitle}
            </div>
            <div style={{
              fontFamily: T.body,
              fontSize: 14,
              color: T.textSoft,
              lineHeight: 1.55,
              marginBottom: 18,
            }}>
              {t.errorBody}
              {errorMsg ? <div style={{ color: T.muted2, fontSize: 12, marginTop: 6 }}>{errorMsg}</div> : null}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
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
            <Field label={t.q1Label} hint={t.q1Hint}>
              <NpsScale
                value={nps}
                onChange={setNps}
                lowLabel={t.q1Low}
                highLabel={t.q1High}
                disabled={stage === 'submitting'}
              />
            </Field>

            {/* Q2 — Surprise */}
            <Field label={t.q2Label}>
              <textarea
                className="add-mini-input"
                value={surprise}
                onChange={(e) => setSurprise(e.target.value)}
                placeholder={t.q2Placeholder}
                disabled={stage === 'submitting'}
                rows={2}
                style={textareaStyle}
              />
            </Field>

            {/* Q3 — Friction */}
            <Field label={t.q3Label}>
              <textarea
                className="add-mini-input"
                value={friction}
                onChange={(e) => setFriction(e.target.value)}
                placeholder={t.q3Placeholder}
                disabled={stage === 'submitting'}
                rows={2}
                style={textareaStyle}
              />
            </Field>

            {/* Q4 — Pay willingness */}
            <Field label={t.q4Label}>
              <textarea
                className="add-mini-input"
                value={paywill}
                onChange={(e) => setPaywill(e.target.value)}
                placeholder={t.q4Placeholder}
                disabled={stage === 'submitting'}
                rows={2}
                style={textareaStyle}
              />
            </Field>

            {/* Q5 — Verbatim landing */}
            <Field label={t.q5Label}>
              <textarea
                className="add-mini-input"
                value={oneliner}
                onChange={(e) => setOneliner(e.target.value)}
                placeholder={t.q5Placeholder}
                disabled={stage === 'submitting'}
                rows={2}
                style={textareaStyle}
              />
            </Field>

            {/* Q6 — Priorité */}
            <Field label={t.q6Label}>
              <textarea
                className="add-mini-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                placeholder={t.q6Placeholder}
                disabled={stage === 'submitting'}
                rows={2}
                style={textareaStyle}
              />
            </Field>

            {/* Footer */}
            <div className="add-mini-foot" style={{
              marginTop: 10,
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{
                fontFamily: T.mono,
                fontSize: 11,
                color: T.muted2,
                letterSpacing: 0.5,
                opacity: hasAnyAnswer ? 0 : 1,
                transition: 'opacity .2s',
              }}>
                {t.requiredHint}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
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
   Sous-composants privés (champ + échelle NPS).
   On garde tout dans le même fichier pour ne pas multiplier les fichiers
   pour une feature utilisée à un seul endroit (cf. AskModal qui suit la
   même logique).
   ────────────────────────────────────────────────────────────────────── */

function Field({ label, hint, children }) {
  return (
    <div className="add-mini-field" style={{ marginBottom: 18 }}>
      <div
        className="add-mini-field-label"
        style={{
          fontFamily: T.body,
          fontWeight: 500,
          fontSize: 14,
          color: T.textSoft,
          letterSpacing: 0,
          textTransform: 'none',
          lineHeight: 1.45,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {hint && (
        <div style={{
          fontFamily: T.mono,
          fontSize: 11,
          color: T.muted2,
          letterSpacing: 0.5,
          marginBottom: 8,
        }}>
          {hint}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * NpsScale — 11 boutons (0..10) qui se colorent selon le segment NPS :
 *   0..6 = rouge (détracteur), 7..8 = ambre (passif), 9..10 = mint (promoteur).
 * Affiche le label sélectionné + ancres "low / high" sous l'échelle.
 */
function NpsScale({ value, onChange, lowLabel, highLabel, disabled }) {
  const colorFor = (n) => {
    if (n <= 6) return T.red;
    if (n <= 8) return T.amber;
    return T.mint;
  };
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {Array.from({ length: 11 }, (_, n) => {
          const active = value === n;
          const c = colorFor(n);
          return (
            <button
              key={n}
              type="button"
              onClick={() => !disabled && onChange(active ? null : n)}
              disabled={disabled}
              style={{
                flex: '1 1 0',
                minWidth: 36,
                height: 36,
                borderRadius: 8,
                border: `1px solid ${active ? c : 'rgba(255,255,255,0.10)'}`,
                background: active ? `${c}26` : 'rgba(255,255,255,0.03)',
                color: active ? c : T.textSoft,
                fontFamily: T.mono,
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all .15s',
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 6,
        fontFamily: T.mono,
        fontSize: 11,
        color: T.muted2,
        letterSpacing: 0.5,
      }}>
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

const textareaStyle = {
  width: '100%',
  minHeight: 60,
  resize: 'vertical',
  fontFamily: T.body,
  fontSize: 14,
  lineHeight: 1.5,
  padding: '12px 14px',
  boxSizing: 'border-box',
};
