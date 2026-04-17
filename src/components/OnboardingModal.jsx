import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * OnboardingModal — modale bloquante affichée au premier login
 * quand l'utilisateur n'a aucun projet.
 *
 * - Non dismissible (pas de bouton Annuler, pas d'Escape, pas de clic extérieur)
 * - Un seul champ : nom du premier projet
 * - Pré-rempli avec une suggestion que l'utilisateur peut éditer
 */
export default function OnboardingModal({ displayName, onCreate }) {
  const [value, setValue] = useState('Mon premier projet');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 80);
    return () => clearTimeout(t);
  }, []);

  const trimmed = value.trim();
  const disabled = !trimmed || submitting;

  const submit = async () => {
    if (disabled) return;
    setSubmitting(true);
    setError(null);
    try {
      await onCreate(trimmed);
    } catch (err) {
      setError(err?.message || 'Impossible de créer le projet.');
      setSubmitting(false);
    }
  };

  const greeting = displayName ? `Bienvenue, ${displayName}.` : 'Bienvenue sur VERSIONS.';

  return createPortal((
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
        animation: 'fadeup .25s ease',
      }}
    >
      <div
        style={{
          width: 460, maxWidth: '92vw',
          background: '#141416',
          border: '1px solid #2a2a2e',
          borderRadius: 16,
          padding: '28px 28px 22px',
          boxShadow: '0 30px 80px rgba(0,0,0,.7)',
        }}
      >
        <div style={{ fontSize: 11, color: '#f5b056', letterSpacing: '0.12em', marginBottom: 10, textTransform: 'uppercase' }}>
          Premier pas
        </div>
        <div style={{ fontSize: 22, color: '#e8e8ea', marginBottom: 10, fontWeight: 500 }}>
          {greeting}
        </div>
        <div style={{ fontSize: 13, color: '#a0a0a8', lineHeight: 1.5, marginBottom: 20 }}>
          Pour commencer, crée ton premier projet. C'est un dossier
          qui regroupera tes titres (un album, un EP, une session de travail…).
          Tu pourras en créer d'autres plus tard.
        </div>

        <label style={{ display: 'block', fontSize: 10, color: '#8a8a95', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
          Nom du projet
        </label>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !disabled) submit(); }}
          placeholder="Mon premier projet"
          style={{
            width: '100%', padding: '12px 14px', fontSize: 14,
            background: '#0e0e10', border: '1px solid #2a2a2e',
            borderRadius: 10, color: '#e8e8ea', outline: 'none',
            fontFamily: 'inherit', boxSizing: 'border-box',
            transition: 'border-color .15s',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(245,176,86,.55)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#2a2a2e'; }}
        />

        {error && (
          <div style={{ marginTop: 10, fontSize: 12, color: '#ff6b6b' }}>
            {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={disabled}
          style={{
            marginTop: 20,
            width: '100%',
            padding: '12px 16px', fontSize: 13, borderRadius: 10,
            background: '#f5b056', border: 'none',
            color: '#141416', fontWeight: 600, fontFamily: 'inherit',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'opacity .15s',
          }}
        >
          {submitting ? 'Création…' : 'Créer mon projet'}
        </button>
      </div>
    </div>
  ), document.body);
}
