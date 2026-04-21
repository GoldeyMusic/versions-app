import { useEffect, useRef, useState } from 'react';
import useLang from '../hooks/useLang';

// Modale d'export PDF. L'utilisateur choisit quelles sections embarquer
// dans le fichier téléchargé. Par défaut tout est coché, car sur une vraie
// fiche "premium" on veut tout voir — mais David a explicitement demandé
// de laisser le choix côté utilisateur (pas d'export rigide).
//
// Habillage v2 : mini-modal (dark card, un mot amber dans le titre,
// boutons pill mono uppercase) — partage le même langage visuel que
// Réglages, AddModal et ShareLinkModal.
export default function ExportPdfModal({
  title,
  versionName,
  hasListening,
  hasDiagnostic,
  hasPlan,
  hasNotes,
  onExport,
  onCancel,
}) {
  const { s } = useLang();
  const [sections, setSections] = useState({
    qualitatif: true,
    diagnostic: true,
    plan: true,
    notes: true,
  });
  const [busy, setBusy] = useState(false);
  const okRef = useRef(null);

  useEffect(() => {
    okRef.current?.focus();
    const h = (e) => {
      if (e.key === 'Escape' && !busy) onCancel?.();
    };
    document.addEventListener('keydown', h);
    // Empêche le scroll du fond pendant que la modale est ouverte
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', h);
      document.body.style.overflow = prev;
    };
  }, [onCancel, busy]);

  const toggle = (k) => setSections((s) => ({ ...s, [k]: !s[k] }));

  const options = [
    { key: 'qualitatif', label: s.modals.exportPdfOptListeningLabel, hint: s.modals.exportPdfOptListeningHint, available: hasListening },
    { key: 'diagnostic', label: s.modals.exportPdfOptDiagnosticLabel, hint: s.modals.exportPdfOptDiagnosticHint, available: hasDiagnostic },
    { key: 'plan', label: s.modals.exportPdfOptPlanLabel, hint: s.modals.exportPdfOptPlanHint, available: hasPlan },
    { key: 'notes', label: s.modals.exportPdfOptNotesLabel, hint: s.modals.exportPdfOptNotesHint, available: hasNotes },
  ];

  const anyChecked = options.some((o) => o.available && sections[o.key]);

  const handleExport = async () => {
    if (busy || !anyChecked) return;
    setBusy(true);
    try {
      await onExport?.(sections);
    } catch (e) {
      console.warn('[export PDF] failed', e);
    } finally {
      setBusy(false);
    }
  };

  // Titre (maquette v2) : "{piste} · <em>V{versionName}</em>"
  // L'eyebrow "Modale · Export PDF" remplace l'ancien titre générique ;
  // le titre parle désormais de la fiche sur laquelle on agit, avec la
  // version en ambre comme accent (convention une-couleur du projet).
  const hasTitle = !!(title && title.trim());
  const hasVersion = !!(versionName && versionName.toString().trim());

  return (
    <div
      className="add-mini-backdrop"
      onClick={busy ? undefined : onCancel}
      role="presentation"
    >
      <div
        className="add-mini-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={s.modals.exportPdfModalTitle}
      >
        <button
          type="button"
          className="add-mini-close"
          onClick={onCancel}
          disabled={busy}
          aria-label={s.common?.close || 'Fermer'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="add-mini-eyebrow">
          {s.modals.exportPdfEyebrow}
        </div>
        <div className="add-mini-title">
          {hasTitle ? title : s.modals.exportPdfModalTitle}
          {hasTitle && hasVersion && <>{' · '}<em>{versionName}</em></>}
        </div>

        <div className="add-mini-list is-flat">
          {options.map((opt) => {
            const disabled = !opt.available;
            const checked = !disabled && sections[opt.key];
            const rowCls = [
              'add-mini-check-row',
              disabled ? 'is-disabled' : '',
              checked ? 'is-checked' : '',
            ].filter(Boolean).join(' ');
            return (
              <label key={opt.key} className={rowCls}>
                <span
                  aria-hidden="true"
                  className={`add-mini-check${checked ? ' is-on' : ''}`}
                >
                  {checked && (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6l2.3 2.3L9.5 3.5" stroke="#0a0b10" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(opt.key)}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                />
                <span className="add-mini-check-body">
                  <span className="add-mini-check-label">
                    {opt.label}
                    {disabled && (
                      <span className="add-mini-check-label-na">
                        {s.modals.exportPdfNotAvailable}
                      </span>
                    )}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        <div className="add-mini-foot">
          <button
            type="button"
            className="add-mini-btn"
            onClick={onCancel}
            disabled={busy}
          >
            {s.modals.exportPdfCancel}
          </button>
          <button
            type="button"
            ref={okRef}
            className="add-mini-btn is-primary"
            onClick={handleExport}
            disabled={busy || !anyChecked}
          >
            {busy ? s.modals.exportPdfGeneratingShort : s.modals.exportPdfExport}
          </button>
        </div>
      </div>
    </div>
  );
}
