import { useEffect, useRef } from 'react';
import useLang from '../hooks/useLang';

export default function NoCreditsModal({ open, onClose, onGoPricing }) {
  const { s } = useLang();
  const ctaRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    ctaRef.current?.focus();
    const h = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'Enter') onGoPricing?.();
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose, onGoPricing]);

  if (!open) return null;

  return (
    <div className="add-mini-backdrop" onClick={onClose}>
      <div className="add-mini-card" onClick={(e) => e.stopPropagation()}>
        <div className="add-mini-title">
          {/* Convention charte unifiée : dernier mot du titre en amber via
              <em> (cf. .add-mini-title em → font-style normal + color amber). */}
          {(() => {
            const t = (s.modals.noCreditsTitle || '').toString();
            const idx = t.lastIndexOf(' ');
            if (idx < 0) return <em>{t}</em>;
            return <>{t.slice(0, idx)} <em>{t.slice(idx + 1)}</em></>;
          })()}
        </div>
        <div className="add-mini-body-text">{s.modals.noCreditsBody}</div>
        <div className="add-mini-foot">
          <button className="add-mini-btn" onClick={onClose}>
            {s.modals.noCreditsCancel}
          </button>
          <button
            ref={ctaRef}
            className="add-mini-btn is-primary"
            onClick={onGoPricing}
          >
            {s.modals.noCreditsCta}
          </button>
        </div>
      </div>
    </div>
  );
}
