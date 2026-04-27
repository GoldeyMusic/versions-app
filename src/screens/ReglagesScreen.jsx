import { useState, useEffect, useRef } from 'react';
import DAWS from '../constants/daws';
import { useAuth } from '../hooks/useAuth';
import useLang from '../hooks/useLang';
import { supabase } from '../lib/supabase';

/* ═══════════════════════════════════════════════════════════ */
/* RÉGLAGES — mini-modal v2                                    */
/* Style aligné sur la maquette _refonte-fiche-ref :           */
/* head mono · titre avec un mot en amber italique · rangées  */
/* .rg-row compactes (label + hint à gauche, widget à droite) */
/* + footer Se déconnecter / Enregistrer.                      */
/* ═══════════════════════════════════════════════════════════ */
export default function ReglagesScreen({ onSignOut, onGoHome, onProfileUpdate, onClose }) {
  const { user } = useAuth();
  const { s, lang, setLang } = useLang();
  const fileRef = useRef(null);

  // ── Profile state ──
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [defaultDaw, setDefaultDaw] = useState('');
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
        iban: iban.trim(),
        bic: bic.trim(),
        updated_at: new Date().toISOString(),
      });
      setSaved(true);
      if (onProfileUpdate) onProfileUpdate({ prenom: prenom.trim(), nom: nom.trim(), avatar_url: avatarUrl, default_daw: defaultDaw, langue: lang });
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

  const handleClose = () => {
    if (onClose) onClose();
    else if (onGoHome) onGoHome();
  };

  // Tant que la facturation n'est pas branchée, David est affiché Premium manuellement.
  // À remplacer par user?.plan === 'premium' quand les abonnements seront actifs.
  const planLabel = s.reglages.miniAccountPlanPremium;

  return (
    <div className="rg-mini">
      <div className="rg-mm-title">
        {s.reglages.miniTitleBefore} <em>{s.reglages.miniTitleEm}</em>
      </div>

      {loadingProfile ? (
        <div className="rg-loading">{s.common.loading}</div>
      ) : (
        <>
          {/* ── Avatar ── */}
          <div className="rg-row">
            <div>
              <div className="rg-label">{s.reglages.miniAvatarLabel}</div>
              <div className="rg-hint">{s.reglages.miniAvatarHint}</div>
            </div>
            <div
              className="rg-avatar"
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label={s.reglages.miniAvatarLabel}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" />
              ) : (
                <span className="rg-avatar-initial">{initial}</span>
              )}
              <div className="rg-avatar-overlay">{uploading ? '…' : '✎'}</div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarUpload}
            />
          </div>

          {/* ── Nom complet ── */}
          <div className="rg-row is-stack">
            <div>
              <div className="rg-label">{s.reglages.miniProfileLabel}</div>
              {s.reglages.miniProfileHint ? (
                <div className="rg-hint">{s.reglages.miniProfileHint}</div>
              ) : null}
            </div>
            <div className="rg-inputs">
              <input
                className="rg-input"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder={s.reglages.firstNamePlaceholder}
              />
              <input
                className="rg-input"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder={s.reglages.lastNamePlaceholder}
              />
            </div>
          </div>

          {/* ── Langue ── */}
          <div className="rg-row">
            <div>
              <div className="rg-label">{s.reglages.miniLangLabel}</div>
              {s.reglages.miniLangHint ? (
                <div className="rg-hint">{s.reglages.miniLangHint}</div>
              ) : null}
            </div>
            <div className="rg-toggle" role="group" aria-label={s.reglages.miniLangLabel}>
              <button
                type="button"
                className={lang === 'fr' ? 'on' : ''}
                onClick={() => setLang('fr')}
              >
                FR
              </button>
              <button
                type="button"
                className={lang === 'en' ? 'on' : ''}
                onClick={() => setLang('en')}
              >
                EN
              </button>
            </div>
          </div>

          {/* ── DAW par défaut ── */}
          <div className="rg-row">
            <div>
              <div className="rg-label">{s.reglages.miniDawLabel}</div>
              <div className="rg-hint">{s.reglages.miniDawHint}</div>
            </div>
            <div className="rg-select-wrap">
              <select
                className="rg-select"
                value={defaultDaw}
                onChange={(e) => setDefaultDaw(e.target.value)}
              >
                <option value="">{s.reglages.dawNone}</option>
                {DAWS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <div className="rg-select-arrow">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* ── Coordonnées bancaires (Premium) ── */}
          <div className="rg-row is-stack">
            <div>
              <div className="rg-label">
                {s.reglages.miniBankLabel}
                <span className="rg-premium-pill">{s.reglages.bankPremium}</span>
              </div>
              {s.reglages.miniBankHint ? (
                <div className="rg-hint">{s.reglages.miniBankHint}</div>
              ) : null}
            </div>
            <div className="rg-inputs">
              <input
                className="rg-input"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
              />
              <input
                className="rg-input"
                value={bic}
                onChange={(e) => setBic(e.target.value)}
                placeholder="BNPAFRPP"
              />
            </div>
          </div>

          {/* ── Compte ── */}
          <div className="rg-row">
            <div>
              <div className="rg-label">{s.reglages.miniAccountLabel}</div>
              <div className="rg-hint">{user?.email || ''}</div>
            </div>
            <div className="rg-value muted">{planLabel}</div>
          </div>

          {/* ── Revoir le guide d'utilisation ──
              Réefface le flag localStorage et déclenche un événement custom
              écouté par OnboardingHints. La modale Réglages se ferme et le
              guide réapparaît immédiatement sur la home. */}
          <div className="rg-row">
            <div>
              <div className="rg-label">{s.reglages.replayOnboardingLabel}</div>
              <div className="rg-hint">{s.reglages.replayOnboardingHint}</div>
            </div>
            <button
              type="button"
              className="rg-btn"
              onClick={() => {
                try { window.localStorage.removeItem('versions_onboarding_done'); } catch {}
                try { window.dispatchEvent(new CustomEvent('versions:replay-onboarding')); } catch {}
                if (onClose) onClose();
                else if (onGoHome) onGoHome();
              }}
            >
              {s.reglages.replayOnboardingBtn}
            </button>
          </div>

          {saved && <div className="rg-saved-chip">{s.reglages.saved}</div>}

          {/* ── Footer ── */}
          <div className="rg-foot">
            <button
              type="button"
              className="rg-btn is-danger"
              onClick={handleSignOut}
            >
              {s.reglages.signOut}
            </button>
            <button
              type="button"
              className="rg-btn is-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? s.reglages.saving : s.reglages.save}
            </button>
            <button
              type="button"
              className="rg-btn"
              onClick={handleClose}
            >
              {s.reglages.close}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
