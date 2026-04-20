import { useState, useEffect, useRef } from 'react';
import T from '../constants/theme';
import DAWS from '../constants/daws';
import { useAuth } from '../hooks/useAuth';
import useLang from '../hooks/useLang';
import { supabase } from '../lib/supabase';

/* ═══════════════════════════════════════════════════════════ */
/* RÉGLAGES                                                    */
/* ═══════════════════════════════════════════════════════════ */
export default function ReglagesScreen({ onSignOut, onGoHome, onProfileUpdate }) {
  const { user } = useAuth();
  const { s, lang, setLang } = useLang();
  const fileRef = useRef(null);

  // ── Profile state ──
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [defaultDaw, setDefaultDaw] = useState('');
  // La langue affichée dans le switch suit en temps réel la langue globale
  // de l'app (via useLang). Pas besoin d'un state local dédié.
  const langue = lang;
  // Coordonnées bancaires (display only for now)
  const [iban, setIban] = useState('');
  const [bic, setBic] = useState('');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // ── Load profile on mount ──
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('prenom, nom, avatar_url, default_daw, langue, iban, bic')
          .eq('id', user.id)
          .single();
        if (data) {
          setPrenom(data.prenom || '');
          setNom(data.nom || '');
          setAvatarUrl(data.avatar_url || null);
          setDefaultDaw(data.default_daw || '');
          // La langue est gérée via LangContext (App.jsx synchronise automatiquement
          // quand userProfile change), donc on n'a rien à faire ici.
          setIban(data.iban || '');
          setBic(data.bic || '');
        }
      } catch (e) {
        console.warn('load profile:', e);
      } finally {
        setLoadingProfile(false);
      }
    };
    load();
  }, [user]);

  // ── Save profile ──
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        prenom: prenom.trim(),
        nom: nom.trim(),
        avatar_url: avatarUrl,
        default_daw: defaultDaw,
        // langue : gérée en direct par setLang (useLang), pas besoin de la ré-écrire ici
        iban: iban.trim(),
        bic: bic.trim(),
        updated_at: new Date().toISOString(),
      });
      setSaved(true);
      if (onProfileUpdate) onProfileUpdate({ prenom: prenom.trim(), nom: nom.trim(), avatar_url: avatarUrl, default_daw: defaultDaw, langue });
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.warn('save profile:', e);
    } finally {
      setSaving(false);
    }
  };

  // ── Avatar upload ──
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `avatars/${user.id}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatarUrl(urlData?.publicUrl || null);
    } catch (err) {
      console.warn('avatar upload:', err);
    } finally {
      setUploading(false);
    }
  };

  const initial = (prenom || user?.email || 'U').trim().charAt(0).toUpperCase();

  const handleSignOut = async () => {
    if (onSignOut) await onSignOut();
    if (onGoHome) onGoHome();
  };

  return (
    <div className="reglages-screen">
      <div className="reglages-header">
        <div className="reglages-title">{s.reglages.title}</div>
        <div className="reglages-subtitle">{s.reglages.subtitle}</div>
      </div>

      {loadingProfile ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 14, letterSpacing: 1, padding: 40 }}>
          {s.common.loading}
        </div>
      ) : (
        <div className="reglages-body">

          {/* ── PHOTO DE PROFIL ── */}
          <div className="reglages-section">
            <div className="reglages-section-label">
              {s.reglages.sectionAvatar} <div className="reglages-section-line" />
            </div>
            <div className="reglages-avatar-row">
              <div className="reglages-avatar" onClick={() => fileRef.current?.click()}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <span className="reglages-avatar-initial">{initial}</span>
                )}
                <div className="reglages-avatar-overlay">
                  {uploading ? '...' : '✎'}
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
              <div className="reglages-avatar-hint">
                {s.reglages.avatarHint}
              </div>
            </div>
          </div>

          {/* ── PROFIL ── */}
          <div className="reglages-section">
            <div className="reglages-section-label">
              {s.reglages.sectionProfile} <div className="reglages-section-line" />
            </div>
            <div className="reglages-fields">
              <div className="reglages-field">
                <label className="reglages-label">{s.reglages.firstName}</label>
                <input
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder={s.reglages.firstNamePlaceholder}
                  className="reglages-input"
                />
              </div>
              <div className="reglages-field">
                <label className="reglages-label">{s.reglages.lastName}</label>
                <input
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder={s.reglages.lastNamePlaceholder}
                  className="reglages-input"
                />
              </div>
            </div>
            <div className="reglages-field" style={{ marginTop: 12 }}>
              <label className="reglages-label">{s.reglages.emailLabel}</label>
              <input
                value={user?.email || ''}
                disabled
                className="reglages-input disabled"
              />
            </div>
          </div>

          {/* ── DAW PAR DÉFAUT ── */}
          <div className="reglages-section">
            <div className="reglages-section-label">
              {s.reglages.sectionDaw} <div className="reglages-section-line" />
            </div>
            <div style={{ position: 'relative' }}>
              <select
                value={defaultDaw}
                onChange={(e) => setDefaultDaw(e.target.value)}
                className="reglages-select"
              >
                <option value="">{s.reglages.dawNone}</option>
                {DAWS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <div className="reglages-select-arrow">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4 L6 8 L10 4" stroke={defaultDaw ? 'var(--amber)' : '#7c7c80'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* ── LANGUE ── */}
          <div className="reglages-section">
            <div className="reglages-section-label">
              {s.reglages.sectionLang} <div className="reglages-section-line" />
            </div>
            <div className="reglages-lang-row">
              <button
                className={`reglages-lang-btn${langue === 'fr' ? ' active' : ''}`}
                onClick={() => setLang('fr')}
              >
                {s.reglages.langFrench}
              </button>
              <button
                className={`reglages-lang-btn${langue === 'en' ? ' active' : ''}`}
                onClick={() => setLang('en')}
              >
                {s.reglages.langEnglish}
              </button>
            </div>
          </div>

          {/* ── COORDONNÉES BANCAIRES (PREMIUM) ── */}
          <div className="reglages-section premium">
            <div className="reglages-section-label">
              {s.reglages.sectionBank} <div className="reglages-section-line" />
              <span className="reglages-premium-badge">{s.reglages.bankPremium}</span>
            </div>
            <div className="reglages-fields">
              <div className="reglages-field">
                <label className="reglages-label">{s.reglages.ibanLabel}</label>
                <input
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                  className="reglages-input"
                />
              </div>
              <div className="reglages-field">
                <label className="reglages-label">{s.reglages.bicLabel}</label>
                <input
                  value={bic}
                  onChange={(e) => setBic(e.target.value)}
                  placeholder="BNPAFRPP"
                  className="reglages-input"
                />
              </div>
            </div>
            <div className="reglages-bank-hint">
              {s.reglages.bankHint}
            </div>
          </div>

          {/* ── ACTIONS ── */}
          <div className="reglages-actions">
            <button onClick={handleSave} disabled={saving} className="reglages-save">
              {saving ? s.reglages.saving : saved ? s.reglages.saved : s.reglages.save}
            </button>
            <button onClick={handleSignOut} className="reglages-signout">
              {s.reglages.signOut}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
