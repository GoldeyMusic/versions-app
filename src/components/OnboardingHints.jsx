// ============================================================
// versions-app / components / OnboardingHints.jsx
// Petites cartes d'onboarding affichées en bas à gauche pour
// guider les nouveaux utilisateurs sur un écran donné.
// ============================================================
//
// Props :
//   - steps        : tableau d'étapes [{ n, title, body }]
//                    (par défaut HOME_STEPS pour rétro-compat)
//   - storageKey   : clé localStorage pour le flag 'déjà vu'
//                    (par défaut celle de la home)
//
// Position : fixed, bottom-left, juste au-dessus du BottomPlayer.
// Style : aligné avec le design system Versions (dark card,
// halo ambre, mono kicker, body sans).
//
// Le composant se masque définitivement après fermeture, mais
// peut être réaffiché via :
//   - ?onboarding=show dans l'URL (test/dev)
//   - événement custom 'versions:replay-onboarding' (déclenché
//     par le bouton 'Revoir le guide' dans Réglages)
// ============================================================

import { useEffect, useState } from 'react';
import { HOME_STEPS, ONBOARDING_STORAGE_KEYS } from '../constants/onboardingSteps';

export default function OnboardingHints({
  steps = HOME_STEPS,
  storageKey = ONBOARDING_STORAGE_KEYS.home,
}) {
  const STEPS = steps;
  const STORAGE_KEY = storageKey;
  // null = fermé / déjà vu, 0..3 = étape courante
  const [step, setStep] = useState(null);

  // Au mount : si jamais vu, on démarre sur l'étape 1.
  // Bypass possible via ?onboarding=show dans l'URL (utile en dev/test
  // pour forcer l'affichage sans toucher à localStorage).
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const force = url.searchParams.get('onboarding') === 'show'
        || (window.location.hash || '').includes('onboarding=show');
      if (force) {
        // On laisse le flag tel quel, mais on force l'affichage le temps
        // de la session courante.
        setStep(0);
        return;
      }
      const done = window.localStorage.getItem(STORAGE_KEY);
      if (!done) setStep(0);
    } catch {
      // localStorage indisponible (mode privé navigateur, SSR…) : on n'affiche pas
    }
  }, [STORAGE_KEY]);

  // Écoute un événement custom pour relancer le guide depuis l'extérieur
  // (ex: bouton 'Revoir le guide' dans Réglages). On efface aussi le flag
  // pour que ça reste cohérent au prochain reload.
  useEffect(() => {
    const handler = () => {
      try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
      setStep(0);
    };
    window.addEventListener('versions:replay-onboarding', handler);
    return () => window.removeEventListener('versions:replay-onboarding', handler);
  }, [STORAGE_KEY]);

  const close = () => {
    setStep(null);
    try { window.localStorage.setItem(STORAGE_KEY, '1'); } catch {}
  };

  const next = () => {
    if (step == null) return;
    if (step >= STEPS.length - 1) close();
    else setStep(step + 1);
  };

  const prev = () => {
    if (step == null || step <= 0) return;
    setStep(step - 1);
  };

  if (step == null) return null;

  const cur = STEPS[step];
  const isLast = step >= STEPS.length - 1;
  const total = STEPS.length;

  return (
    <div
      className="versions-onboarding-hints"
      role="dialog"
      aria-live="polite"
      aria-label={`${cur.title} — étape ${cur.n} sur ${total}`}
      style={{
        position: 'fixed',
        bottom: 88, // au-dessus du BottomPlayer (~68px) + marge
        left: 16,
        width: 'min(360px, calc(100vw - 32px))',
        zIndex: 80,
        background: 'var(--s1)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 14,
        padding: 18,
        boxShadow: '0 20px 50px rgba(0,0,0,0.45), 0 0 0 1px rgba(245,176,86,0.08)',
        fontFamily: 'var(--body)',
        color: 'var(--text)',
        animation: 'versionsOnboardingFadeUp .25s ease',
      }}
    >
      {/* Mini barre de progression au-dessus de la carte */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0, left: 14, right: 14,
          height: 2,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${((step + 1) / total) * 100}%`,
            height: '100%',
            background: 'var(--amber)',
            transition: 'width .25s ease',
          }}
        />
      </div>

      {/* Header : kicker + bouton fermer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: 'var(--muted)',
          }}
        >
          Étape {cur.n} sur {total}
        </span>
        <button
          type="button"
          onClick={close}
          aria-label="Fermer le guide"
          style={{
            width: 22, height: 22,
            border: 0, background: 'transparent',
            color: 'var(--muted)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0,
            marginTop: -4, marginRight: -6,
            opacity: 0.7,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Titre */}
      <h3
        style={{
          margin: '6px 0 8px',
          fontSize: 17,
          fontWeight: 600,
          lineHeight: 1.3,
        }}
      >
        {cur.title}
      </h3>

      {/* Body */}
      <p
        style={{
          margin: '0 0 16px',
          fontSize: 13.5,
          lineHeight: 1.55,
          color: 'var(--soft)',
          fontWeight: 300,
        }}
      >
        {cur.body}
      </p>

      {/* Footer : navigation — précédent à gauche, suivant/compris à droite */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        {step > 0 ? (
          <button
            type="button"
            onClick={prev}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'transparent',
              color: 'var(--soft)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--body)',
              transition: 'border-color .15s, color .15s',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 2l-4 4 4 4" />
            </svg>
            Précédent
          </button>
        ) : (
          // Spacer pour garder le bouton "Suivant" aligné à droite à l'étape 1
          <span aria-hidden="true" />
        )}
        <button
          type="button"
          onClick={next}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 0,
            background: 'var(--amber)',
            color: '#1b1108',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--body)',
          }}
        >
          {isLast ? 'Compris !' : 'Suivant'}
          {!isLast && (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 2l4 4-4 4" />
            </svg>
          )}
        </button>
      </div>

      {/* Animation keyframes (injection inline pour éviter une nouvelle classe globale) */}
      <style>{`
        @keyframes versionsOnboardingFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
