import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import useLang from '../hooks/useLang';
import { supabase } from '../lib/supabase';
import { translateAuthError } from '../lib/authErrors';

/**
 * UpdatePasswordScreen — page d'atterrissage du lien "Réinitialise ton mot de passe".
 *
 * Le user clique sur le bouton "Choisir un nouveau mot de passe" dans le mail,
 * arrive ici avec une session active (Supabase a validé le token de recovery).
 * Il saisit son nouveau mot de passe → updateUser({ password }) → redirect dashboard.
 *
 * Si la session n'est pas valide (lien expiré ou ouverte sans token), on affiche
 * un message d'erreur et un bouton pour redemander un mail.
 */
export default function UpdatePasswordScreen() {
  const { updateUserPassword } = useAuth();
  const { s } = useLang();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(null); // null = chargement

  useEffect(() => {
    // Vérifie qu'on a bien une session (le user vient cliquer le lien recovery)
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) setHasRecoverySession(!!session);
    });
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError(s.auth.updatePasswordTooShort);
      return;
    }
    if (password !== confirm) {
      setError(s.auth.updatePasswordMismatch);
      return;
    }
    setLoading(true);
    try {
      const { error } = await updateUserPassword(password);
      if (error) {
        setError(translateAuthError(error, s));
      } else {
        setSuccess(true);
        // Redirige vers dashboard au bout de 2s
        setTimeout(() => { window.location.href = '/dashboard'; }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/Logo-Versions-2.png" alt="" style={{ height: 40, width: 'auto' }} />
          <div className="auth-brand">
            {"VER"}<span className="accent">{"Si"}</span>{"ONS"}
          </div>
          <div className="auth-tagline">
            {s.brand.taglineAction}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{s.auth.updateTitle}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted, #888)', lineHeight: 1.5 }}>{s.auth.updateSubtitle}</div>
        </div>

        {hasRecoverySession === false ? (
          // Pas de session → lien expiré ou non valide
          <>
            <div className="auth-error" style={{ marginBottom: 12 }}>{s.auth.updateLinkExpired}</div>
            <div className="auth-toggle">
              <button
                type="button"
                onClick={() => { window.location.href = '/'; }}
                className="auth-toggle-btn"
              >
                ← {s.auth.backToSignIn}
              </button>
            </div>
          </>
        ) : success ? (
          <div className="auth-info" style={{ textAlign: 'center', padding: 16 }}>
            ✓ {s.auth.updateSuccess}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="password"
              placeholder={s.auth.newPassword}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoFocus
              className="auth-input"
            />
            <input
              type="password"
              placeholder={s.auth.confirmPassword}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              className="auth-input"
            />
            {error && <div className="auth-error">{error}</div>}
            <button
              type="submit"
              disabled={loading || hasRecoverySession === null}
              className="auth-submit"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? '...' : s.auth.updateSubmit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
