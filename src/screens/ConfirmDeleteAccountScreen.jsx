import { useState, useEffect } from 'react';
import useLang from '../hooks/useLang';
import { supabase } from '../lib/supabase';
import API from '../constants/api';

/**
 * ConfirmDeleteAccountScreen — page d'atterrissage du lien "Confirme la
 * suppression" envoyé par email.
 *
 * Le user clique le bouton dans le mail → arrive ici avec ?token=xxx.
 * On affiche une dernière confirmation visuelle (warning rouge) puis un
 * bouton "Confirmer définitivement" qui POST le token vers
 * /api/account/confirm-deletion. Le backend valide le token signé et
 * supprime le compte via Supabase Admin API.
 *
 * Si le token manque ou est invalide/expiré → message d'erreur + lien
 * "Retour à la connexion".
 */
export default function ConfirmDeleteAccountScreen() {
  const { s } = useLang();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    setToken(t);
  }, []);

  const handleConfirm = async () => {
    if (!token) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/account/confirm-deletion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body?.error === 'invalid_or_expired_token') {
          setError(s.deleteAccount.confirmTokenInvalid);
        } else {
          setError(s.deleteAccount.confirmFailed);
        }
        return;
      }
      // Le user est supprimé en base. On signOut localement (la session
      // sur ce device est déjà invalide côté serveur, mais le client garde
      // la session en localStorage tant qu'on ne la purge pas).
      try { await supabase.auth.signOut(); } catch { /* ignore */ }
      setSuccess(true);
      // Redirige vers landing au bout de 4s pour laisser lire le message.
      setTimeout(() => { window.location.href = '/'; }, 4000);
    } catch (e) {
      console.warn('[confirm-delete] fetch failed:', e?.message);
      setError(s.deleteAccount.confirmFailed);
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

        {success ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
              {s.deleteAccount.confirmedTitle}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted, #888)', lineHeight: 1.5 }}>
              {s.deleteAccount.confirmedMessage}
            </div>
          </div>
        ) : token === null ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted, #888)' }}>
              {s.common.loading || 'Chargement…'}
            </div>
          </div>
        ) : !token ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{s.deleteAccount.invalidLinkTitle}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted, #888)', lineHeight: 1.5 }}>
                {s.deleteAccount.invalidLinkMessage}
              </div>
            </div>
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
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: '#ff5d5d' }}>
                ⚠ {s.deleteAccount.confirmFinalTitle}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-muted, #888)', lineHeight: 1.55 }}>
                {s.deleteAccount.confirmFinalMessage}
              </div>
            </div>

            {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}

            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="auth-submit"
              style={{
                background: '#ff5d5d',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '...' : s.deleteAccount.confirmFinalBtn}
            </button>

            <div className="auth-toggle">
              <button
                type="button"
                onClick={() => { window.location.href = '/'; }}
                className="auth-toggle-btn"
              >
                ← {s.deleteAccount.confirmCancelBtn}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
