import { useEffect, useRef, useState } from 'react';
import useLang from '../hooks/useLang';

// Modale d'export PDF. L'utilisateur choisit quelles sections embarquer
// dans le fichier téléchargé. Par défaut tout est coché, car sur une vraie
// fiche "premium" on veut tout voir — mais David a explicitement demandé
// de laisser le choix côté utilisateur (pas d'export rigide).
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
    return () => document.removeEventListener('keydown', h);
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

  return (
    <div
      onClick={busy ? undefined : onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 460, maxWidth: '92vw',
          background: '#141416', border: '1px solid #2a2a2e',
          borderRadius: 14, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,.6)',
        }}
      >
        <div style={{ fontSize: 14, color: '#e8e8ea', marginBottom: 4, fontWeight: 500 }}>
          {s.modals.exportPdfModalTitle}
        </div>
        <div style={{ fontSize: 14, color: '#8a8a8f', marginBottom: 16 }}>
          {title}{versionName ? ` — ${s.modals.exportPdfVersionPrefix} ${versionName}` : ''}
        </div>

        <div style={{ fontSize: 14, color: '#8a8a8f', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {s.modals.exportPdfSections}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          {options.map((opt) => {
            const disabled = !opt.available;
            const checked = !disabled && sections[opt.key];
            return (
              <label
                key={opt.key}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  background: disabled ? 'transparent' : '#1a1a1d',
                  border: `1px solid ${disabled ? '#222226' : checked ? '#f5b05666' : '#2a2a2e'}`,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.4 : 1,
                  transition: 'border-color .15s ease, background .15s ease',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 16, height: 16, flex: '0 0 16px',
                    borderRadius: 4,
                    border: `1.5px solid ${checked ? '#f5b056' : '#3a3a3e'}`,
                    background: checked ? '#f5b056' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: 1,
                  }}
                >
                  {checked && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="#141416" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 14, color: '#e8e8ea', lineHeight: 1.3 }}>
                    {opt.label}
                    {disabled && (
                      <span style={{ marginLeft: 6, fontSize: 14, color: '#6a6a6e' }}>{s.modals.exportPdfNotAvailable}</span>
                    )}
                  </span>
                  <span style={{ display: 'block', fontSize: 14, color: '#8a8a8f', marginTop: 2 }}>
                    {opt.hint}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onCancel}
            disabled={busy}
            style={{
              padding: '8px 16px', fontSize: 14, borderRadius: 8,
              background: 'transparent', border: '1px solid #2a2a2e',
              color: '#c5c5c7', cursor: busy ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {s.modals.exportPdfCancel}
          </button>
          <button
            ref={okRef}
            onClick={handleExport}
            disabled={busy || !anyChecked}
            style={{
              padding: '8px 16px', fontSize: 14, borderRadius: 8,
              background: anyChecked ? '#f5b056' : '#4a3c22', border: 'none',
              color: anyChecked ? '#141416' : '#8a7a52',
              cursor: busy || !anyChecked ? 'not-allowed' : 'pointer',
              fontWeight: 500, fontFamily: 'inherit',
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? s.modals.exportPdfGeneratingShort : s.modals.exportPdfExport}
          </button>
        </div>
      </div>
    </div>
  );
}
