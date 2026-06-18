import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import useLang from '../hooks/useLang';
import GlobalStyles from '../components/GlobalStyles';
import MockupStyles from '../components/MockupStyles';
import AuthScreen from './AuthScreen';
import { previewInvite, acceptProjectInvite } from '../lib/storage';

// Écran d'acceptation d'invitation : /join/{token}
// Lire l'aperçu marche sans compte ; rejoindre exige d'être connecté
// (on affiche AuthScreen en place, puis le bouton Rejoindre apparaît).
function FontLink() {
  return (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
    />
  );
}

export default function JoinScreen({ token }) {
  const { s } = useLang();
  const t = (s && s.join) || {};
  const roleLabel = (r) => (s && s.share && s.share.roles && s.share.roles[r]) || r;
  const { user, loading: authLoading } = useAuth();

  const [preview, setPreview] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    previewInvite(token).then((p) => { if (alive) setPreview(p); });
    return () => { alive = false; };
  }, [token]);

  const onAccept = async () => {
    setAccepting(true); setError('');
    const res = await acceptProjectInvite(token);
    setAccepting(false);
    if (res && res.project_id) {
      window.location.href = '/dashboard';
    } else {
      const map = t.errors || {};
      setError(map[res?.error] || t.errorGeneric || 'Impossible de rejoindre ce projet.');
    }
  };

  const shell = (inner) => (
    <>
      <FontLink />
      <GlobalStyles />
      <MockupStyles />
      <div className="join-shell">
        <style>{JOIN_CSS}</style>
        {inner}
      </div>
    </>
  );

  if (!preview) {
    return shell(<div className="join-loading">{t.loading || 'Chargement de l’invitation…'}</div>);
  }

  if (!preview.valid) {
    const reasonMsg = (t.invalid && t.invalid[preview.reason]) || t.invalidGeneric || "Cette invitation n'est plus valide.";
    return shell(
      <div className="join-card">
        <div className="join-eyebrow">VERSIONS</div>
        <h1 className="join-title">{t.invalidTitle || 'Invitation invalide'}</h1>
        <p className="join-text">{reasonMsg}</p>
        <a href="/" className="join-home">{t.home || "Retour à l'accueil"}</a>
      </div>,
    );
  }

  // Invitation valide.
  return shell(
    <div className="join-card">
      <div className="join-eyebrow">VERSIONS</div>
      <h1 className="join-title">{t.title || 'Invitation à collaborer'}</h1>
      <p className="join-text">
        {(t.intro || 'On t’invite à rejoindre {project}.').replace('{project}', preview.project_name || '')}
        {' '}
        <span className="join-role">{roleLabel(preview.role)}</span>
      </p>

      {authLoading ? (
        <div className="join-loading">…</div>
      ) : user ? (
        <>
          <button className="join-btn" disabled={accepting} onClick={onAccept}>
            {accepting ? (t.joining || 'On te connecte…') : (t.joinBtn || 'Rejoindre le projet')}
          </button>
          {error && <div className="join-error">{error}</div>}
        </>
      ) : (
        <>
          <p className="join-text muted">{t.signInPrompt || 'Connecte-toi ou crée un compte pour rejoindre.'}</p>
          <div className="join-auth"><AuthScreen /></div>
        </>
      )}
    </div>,
  );
}

const JOIN_CSS = `
.join-shell { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
.join-card {
  width: 100%; max-width: 460px; background: rgba(22,22,27,0.92); border: 1px solid rgba(255,255,255,0.10);
  border-radius: 20px; padding: 32px 28px; text-align: center; font-family: 'DM Sans', sans-serif; color: #eaeaea;
}
.join-eyebrow { font-size: 12px; letter-spacing: 0.16em; font-weight: 700; color: #f5b056; }
.join-title { font-size: 24px; color: #fff; margin: 12px 0 10px; }
.join-text { font-size: 15px; color: rgba(255,255,255,0.7); line-height: 1.5; margin: 0 0 8px; }
.join-text.muted { font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 14px; }
.join-role {
  display: inline-block; font-size: 12px; font-weight: 700; color: #f5b056;
  background: rgba(245,176,86,0.10); border: 1px solid rgba(245,176,86,0.30); border-radius: 999px; padding: 2px 10px;
}
.join-btn {
  margin-top: 18px; cursor: pointer; font-family: inherit; font-size: 15px; font-weight: 700; color: #1a1206;
  background: linear-gradient(135deg,#f5b056,#d4900e); border: none; border-radius: 12px; padding: 13px 26px;
}
.join-btn:disabled { opacity: 0.5; cursor: default; }
.join-error { margin-top: 12px; font-size: 13px; color: #ff8a8a; }
.join-loading { font-size: 14px; color: rgba(255,255,255,0.6); }
.join-home { display: inline-block; margin-top: 16px; color: #f5b056; text-decoration: none; font-weight: 600; }
.join-auth { margin-top: 16px; }
`;
