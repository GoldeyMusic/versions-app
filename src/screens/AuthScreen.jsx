import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import useLang from '../hooks/useLang';

export default function AuthScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithOAuth, resetPasswordForEmail } = useAuth();
  const { s } = useLang();
  // mode : 'signin' | 'signup' | 'reset' (mot de passe oublié)
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setInfo('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) setError(error.message);
      } else if (mode === 'signup') {
        const { data, error } = await signUpWithEmail(email, password);
        if (error) setError(error.message);
        else if (data?.user && !data.session) {
          setInfo(s.auth.confirmEmail);
        }
      } else if (mode === 'reset') {
        const { error } = await resetPasswordForEmail(email);
        if (error) setError(error.message);
        else setInfo(s.auth.resetSent);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setError('');
    setLoading(true);
    const { error } = await signInWithOAuth(provider);
    if (error) setError(error.message);
    setLoading(false);
  };

  const submitLabel = loading ? '...'
    : mode === 'signin' ? s.auth.signIn
    : mode === 'signup' ? s.auth.signUp
    : s.auth.resetSubmit;

  return (
    <div className="auth-screen">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <img src="/logo-versions-2.svg" alt="" style={{ height: 40, width: 'auto' }} />
          <div className="auth-brand">
            {"VER"}<span className="accent">{"Si"}</span>{"ONS"}
          </div>
          <div className="auth-tagline">
            {s.brand.taglineAction}
          </div>
        </div>

        {/* Titre + sous-titre en mode reset */}
        {mode === 'reset' && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{s.auth.resetTitle}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted, #888)', lineHeight: 1.5 }}>{s.auth.resetSubtitle}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder={s.auth.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          {mode !== 'reset' && (
            <input
              type="password"
              placeholder={s.auth.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="auth-input"
            />
          )}

          {/* Lien "Mot de passe oublié ?" — visible seulement en mode signin */}
          {mode === 'signin' && (
            <div style={{ textAlign: 'right', marginTop: -4 }}>
              <button
                type="button"
                onClick={() => switchMode('reset')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  font: 'inherit',
                  fontSize: 12,
                  color: 'var(--text-muted, #888)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: 2,
                }}
              >
                {s.auth.forgotPassword}
              </button>
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}
          {info && <div className="auth-info">{info}</div>}

          <button type="submit" disabled={loading} className="auth-submit" style={{ opacity: loading ? 0.6 : 1 }}>
            {submitLabel}
          </button>
        </form>

        {/* En mode reset : pas d'OAuth ni de toggle signup, juste un retour */}
        {mode === 'reset' ? (
          <div className="auth-toggle">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="auth-toggle-btn"
            >
              ← {s.auth.backToSignIn}
            </button>
          </div>
        ) : (
          <>
            {/* Separator */}
            <div className="auth-sep">
              <div className="auth-sep-line" />
              <span className="auth-sep-text">{s.auth.or}</span>
              <div className="auth-sep-line" />
            </div>

            {/* OAuth */}
            <div className="auth-oauth">
              <button type="button" onClick={() => handleOAuth('google')} disabled={loading} className="auth-oauth-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {s.auth.google}
              </button>
            </div>

            {/* Toggle signin/signup */}
            <div className="auth-toggle">
              <button
                type="button"
                onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                className="auth-toggle-btn"
              >
                {mode === 'signin' ? s.auth.noAccount : s.auth.alreadyRegistered}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
