import { useState, useEffect, useRef } from 'react';
import T from '../constants/theme';
import DAWS from '../constants/daws';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

/* ═══════════════════════════════════════════════════════════ */
/* RÉGLAGES                                                    */
/* ═══════════════════════════════════════════════════════════ */
export default function ReglagesScreen({ onSignOut, onGoHome }) {
  const { user } = useAuth();
  const fileRef = useRef(null);

  // ── Profile state ──
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [defaultDaw, setDefaultDaw] = useState('');
  const [langue, setLangue] = useState('fr');
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
          setLangue(data.langue || 'fr');
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
        langue,
        iban: iban.trim(),
        bic: bic.trim(),
        updated_at: new Date().toISOString(),
      });
      setSaved(true);
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
        <div className="reglages-title">RÉGLAGES</div>
        <div className="reglages-subtitle">Gérer ton profil et tes préférences</div>
      </div>

      {loadingProfile ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 1, padding: 40 }}>
          CHARGEMENT...
        </div>
      ) : (
        <div className="reglages-body">

          {/* ── PHOTO DE PROFIL ── */}
          <div className="reglages-section">
            <div className="reglages-section-label">
              PHOTO DE PROFIL <div className="reglages-section-line" />
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
                Clique sur l'avatar pour changer ta photo
              </div>
            </div>
          </div>

          {/* ── PROFIL ── */}
          <div className="reglages-section">
            <div className="reglages-section-label">
              PROFIL <div className="reglages-section-line" />
            </div>
            <div className="reglages-fields">
              <div className="reglages-field">
                <label className="reglages-label">PRÉNOM</label>
                <input
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Ton prénom"
                  className="reglages-input"
                />
              </div>
              <div className="reglages-field">
                <label className="reglages-label">NOM</label>
                <input
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ton nom"
                  className="reglages-input"
                />
              </div>
            </div>
            <div className="reglages-field" style={{ marginTop: 12 }}>
              <label className="reglages-label">EMAIL</label>
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
              DAW PAR DÉFAUT <div className="reglages-section-line" />
            </div>
            <div style={{ position: 'relative' }}>
              <select
                value={defaultDaw}
                onChange={(e) => setDefaultDaw(e.target.value)}
                className="reglages-select"
              >
                <option value="">Aucun (demander à chaque fois)</option>
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
              LANGUE <div className="reglages-section-line" />
            </div>
            <div className="reglages-lang-row">
              <button
                className={`reglages-lang-btn${langue === 'fr' ? ' active' : ''}`}
                onClick={() => setLangue('fr')}
              >
                Français
              </button>
              <button
                className={`reglages-lang-btn${langue === 'en' ? ' active' : ''}`}
                onClick={() => setLangue('en')}
              >
                English
              </button>
            </div>
          </div>

          {/* ── COORDONNÉES BANCAIRES (PREMIUM) ── */}
          <div className="reglages-section premium">
            <div className="reglages-section-label">
              COORDONNÉES BANCAIRES <div className="reglages-section-line" />
              <span className="reglages-premium-badge">PREMIUM</span>
            </div>
            <div className="reglages-fields">
              <div className="reglages-field">
                <label className="reglages-label">IBAN</label>
                <input
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                  className="reglages-input"
                />
              </div>
              <div className="reglages-field">
                <label className="reglages-label">BIC / SWIFT</label>
                <input
                  value={bic}
                  onChange={(e) => setBic(e.target.value)}
                  placeholder="BNPAFRPP"
                  className="reglages-input"
                />
              </div>
            </div>
            <div className="reglages-bank-hint">
              Ces informations sont chiffrées et utilisées uniquement pour les reversements d'abonnement.
            </div>
          </div>

          {/* ── ACTIONS ── */}
          <div className="reglages-actions">
            <button onClick={handleSave} disabled={saving} className="reglages-save">
              {saving ? 'Enregistrement...' : saved ? '✓ Enregistré' : 'Enregistrer'}
            </button>
            <button onClick={handleSignOut} className="reglages-signout">
              Se déconnecter
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
