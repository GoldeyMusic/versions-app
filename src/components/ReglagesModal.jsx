import { useEffect } from 'react';
import ReglagesScreen from '../screens/ReglagesScreen';
import useLang from '../hooks/useLang';

/* ─────────────────────────────────────────────────────────────
   Modale Réglages
   Encapsule ReglagesScreen dans une modale centrée. On réutilise
   toute la logique de l'écran existant (profil, avatar, DAW, langue,
   IBAN). La prop `onGoHome` est remplacée par `onClose` : après un
   sign out on ferme simplement la modale, la navigation vers l'accueil
   est gérée côté App.
   ───────────────────────────────────────────────────────────── */
export default function ReglagesModal({ open, onClose, onSignOut, onProfileUpdate }) {
  const { s } = useLang();

  // Échap ferme la modale
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    // Empêche le scroll du fond pendant que la modale est ouverte
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="reglages-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="reglages-modal-panel mini-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={s?.reglages?.title || 'Réglages'}
      >
        <button
          className="reglages-modal-close"
          onClick={onClose}
          aria-label={s?.common?.close || 'Fermer'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="reglages-modal-scroll">
          <ReglagesScreen
            onSignOut={onSignOut}
            onGoHome={onClose}
            onClose={onClose}
            onProfileUpdate={onProfileUpdate}
          />
        </div>
      </div>
    </div>
  );
}
