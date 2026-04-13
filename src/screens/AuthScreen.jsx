import { useState } from 'react';
import T from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

export default function AuthScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithOAuth } = useAuth();
  const [mode, setMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) setError(error.message);
      } else {
        const { data, error } = await signUpWithEmail(email, password);
        if (error) setError(error.message);
        else if (data?.user && !data.session) {
          setInfo('Vérifiez votre email pour confirmer votre compte.');
        }
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

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: T.s1,
    border: `1px solid ${T.border}`,
    borderRadius: 10,
    color: T.text,
    fontFamily: T.body,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const btnPrimary = {
    width: '100%',
    padding: '14px',
    background: T.amber,
    color: T.black,
    border: 'none',
    borderRadius: 10,
    fontFamily: T.mono,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 1,
    cursor: 'pointer',
    textTransform: 'uppercase',
    opacity: loading ? 0.6 : 1,
  };

  const btnOAuth = {
    width: '100%',
    padding: '12px',
    background: T.s2,
    color: T.text,
    border: `1px solid ${T.border}`,
    borderRadius: 10,
    fontFamily: T.mono,
    fontSize: 12,
    letterSpacing: 0.5,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '40px 24px',
        background: T.black,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: T.display, fontSize: 48, letterSpacing: 6, color: T.amber }}>
            VERSIONS
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.muted, marginTop: 4 }}>
            ANALYSE MUSICALE PROFESSIONNELLE
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={inputStyle}
          />
          {error && (
            <div style={{ color: T.red, fontFamily: T.mono, fontSize: 11, textAlign: 'center' }}>
              {error}
            </div>
          )}
          {info && (
            <div style={{ color: T.green, fontFamily: T.mono, fontSize: 11, textAlign: 'center' }}>
              {info}
            </div>
          )}
          <button type="submit" disabled={loading} style={btnPrimary}>
            {loading ? '...' : mode === 'signin' ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        <div style={{ textAlign: 'center', margin: '20px 0', fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: 1 }}>
          — OU —
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button type="button" onClick={() => handleOAuth('google')} disabled={loading} style={btnOAuth}>
            <span style={{ fontWeight: 600 }}>G</span> Continuer avec Google
          </button>
          <button type="button" onClick={() => handleOAuth('apple')} disabled={loading} style={btnOAuth}>
            <span style={{ fontWeight: 600 }}></span> Continuer avec Apple
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            type="button"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setInfo(''); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: T.muted,
              fontFamily: T.mono,
              fontSize: 11,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {mode === 'signin' ? "Pas de compte ? S'inscrire" : 'Déjà inscrit ? Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
}
