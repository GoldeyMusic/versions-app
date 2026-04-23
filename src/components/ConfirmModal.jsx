import { useEffect, useRef } from 'react';
import useLang from '../hooks/useLang';

/**
 * ConfirmModal — confirmation générique (delete / discard / etc.).
 * Utilise la grammaire "mini-modal" du site : add-mini-backdrop, add-mini-card,
 * add-mini-title, add-mini-body-text, add-mini-foot, add-mini-btn[.is-primary|.is-danger].
 */
export default function ConfirmModal({
  title,
  message = '',
  confirmLabel,
  cancelLabel,
  tertiaryLabel = null,
  danger = false,
  onConfirm,
  onCancel,
  onTertiary,
}) {
  const { s } = useLang();
  const effTitle = title ?? s.common.confirm;
  const effConfirm = confirmLabel ?? s.common.confirm;
  const effCancel = cancelLabel === undefined ? s.common.cancel : cancelLabel;
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
    <div className="add-mini-backdrop" onClick={onCancel}>
      <div className="add-mini-card" onClick={(e) => e.stopPropagation()}>
        <div className="add-mini-title">{effTitle}</div>
        {message && <div className="add-mini-body-text">{message}</div>}
        <div className="add-mini-foot">
          {effCancel && (
            <button className="add-mini-btn" onClick={onCancel}>{effCancel}</button>
          )}
          {tertiaryLabel && (
            <button className="add-mini-btn is-primary" onClick={onTertiary}>
              {tertiaryLabel}
            </button>
          )}
          <button
            ref={okRef}
            className={`add-mini-btn ${danger ? 'is-danger' : 'is-primary'}`}
            onClick={onConfirm}
          >
            {effConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
