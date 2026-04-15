import { useEffect, useRef } from 'react';

export default function ConfirmModal({
  title = 'Confirmer',
  message = '',
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  tertiaryLabel = null,
  danger = false,
  onConfirm,
  onCancel,
  onTertiary,
}) {
  const okRef = useRef(null);

  useEffect(() => {
    okRef.current?.focus();
    const h = (e) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onConfirm, onCancel]);

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 440, maxWidth: '90vw',
          background: '#141416', border: '1px solid #2a2a2e',
          borderRadius: 14, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,.6)',
        }}
      >
        <div style={{ fontSize: 14, color: '#e8e8ea', marginBottom: 10, fontWeight: 500 }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: '#c5c5c7', lineHeight: 1.6, marginBottom: 20 }}>
          {message}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px', fontSize: 12, borderRadius: 8,
              background: 'transparent', border: '1px solid #2a2a2e',
              color: '#c5c5c7', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {cancelLabel}
          </button>
          {tertiaryLabel && (
            <button
              onClick={onTertiary}
              style={{
                padding: '8px 16px', fontSize: 12, borderRadius: 8,
                background: 'transparent', border: '1px solid #f5b05666',
                color: '#f5b056', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {tertiaryLabel}
            </button>
          )}
          <button
            ref={okRef}
            onClick={onConfirm}
            style={{
              padding: '8px 16px', fontSize: 12, borderRadius: 8,
              background: danger ? '#ef6b6b' : '#f5b056', border: 'none',
              color: '#141416', cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
