import { useState, useEffect, useRef } from 'react';
import DAWS from '../constants/daws';
import { useAuth } from '../hooks/useAuth';
import useLang from '../hooks/useLang';
import { supabase } from '../lib/supabase';
import { confirmDialog } from '../lib/confirm.jsx';

// Adresse de contact unique (cf. pages légales). Centralisée ici pour
// pouvoir construire les mailto de résiliation et suppression de compte
// sans duppliquer la chaîne.
const CONTACT_EMAIL = 'contact@versions.studio';

// Construit un lien mailto encodé. Subject + body peuvent contenir
// du texte multi-lignes (les \n dans body sont encodés).
function buildMailto(subject, body) {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  // URLSearchParams encode les espaces en "+" — pour un mailto on
  // préfère %20 (certains clients mail interprètent mal le "+"). On
  // remplace après coup pour garder l'encodage des autres caractères.
  const qs = params.toString().replace(/\+/g, '%20');
  return `mailto:${CONTACT_EMAIL}?${qs}`;
}

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

  // ── Crédits / abonnement ──
  // Mirror du flow App.jsx (rail bas-gauche). On refetch au montage de
  // la modale pour avoir les chiffres frais — pas de prop drilling.
  // Schema (cf. RPC get_or_create_user_credits, migration 020) :
  //   balance_remaining   : total restant (sub + pack)
  //   subscription_balance: crédits du mois en cours (purgés à résiliation)
  //   pack_balance        : crédits packs (cumulables, jamais purgés)
  //   monthly_grant       : taille du grant mensuel (>0 = abonné)
  //   monthly_renews_at   : date du prochain renew
  const [creditsRow, setCreditsRow] = useState(null);
  useEffect(() => {
    if (!user?.id) { setCreditsRow(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.rpc('get_or_create_user_credits');
        if (cancelled) return;
        if (error) {
          console.warn('[reglages] get_or_create_user_credits failed:', error.message);
          return;
        }
        const row = Array.isArray(data) ? data[0] : data;
        setCreditsRow(row || null);
      } catch (e) {
        console.warn('[reglages] credits fetch threw:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

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

  // ── Résiliation d'abonnement ───────────────────────────────
  // Stripe pas encore branché côté backend → la modale de confirmation
  // explique la marche à suivre (e-mail au support) et le bouton
  // déclenche l'ouverture d'un mailto pré-rempli avec l'email du compte.
  // À remplacer par un appel `cancel_subscription` quand le webhook
  // Stripe sera branché.
  const handleCancelSubscription = async () => {
    const ok = await confirmDialog({
      title: s.reglages.cancelSubModalTitle,
      message: s.reglages.cancelSubModalMessage,
      confirmLabel: s.reglages.cancelSubModalConfirm,
      cancelLabel: s.common.cancel,
    });
    if (ok !== 'confirm') return;
    const subject = s.reglages.mailtoCancelSubSubject;
    const body = (s.reglages.mailtoCancelSubBody || '')
      .replace('{email}', user?.email || '');
    if (typeof window !== 'undefined') {
      window.location.href = buildMailto(subject, body);
    }
  };

  // ── Suppression de compte ──────────────────────────────────
  // Branché sur la RPC `delete_my_account` (SECURITY DEFINER, supprime
  // en cascade : mix_note_completions, comparisons, versions, tracks,
  // projects, credit_events, user_credits, analysis_cost_logs,
  // chat_cost_logs, feedback, user_profiles, revenue_logs, puis
  // auth.users). Les fichiers Storage (audio, avatars, project-covers,
  // track-covers) ne sont pas purgés par la RPC — ils deviennent
  // orphelins (plus aucun row pour les référencer côté DB) et seront
  // nettoyés via un job batch ultérieur si besoin.
  const handleDeleteAccount = async () => {
    const ok = await confirmDialog({
      title: s.reglages.deleteAccountModalTitle,
      message: s.reglages.deleteAccountModalMessage,
      confirmLabel: s.reglages.deleteAccountModalConfirm,
      cancelLabel: s.common.cancel,
      danger: true,
    });
    if (ok !== 'confirm') return;
    try {
      const { error } = await supabase.rpc('delete_my_account');
      if (error) throw error;
      // Compte purgé en base — on déconnecte l'utilisateur et on le
      // ramène à la landing publique. Le signOut déclenche déjà la
      // bascule via le hook useAuth, mais on appelle explicitement
      // l'override App-level (handleSignOut) qui force aussi le
      // hash routing vers `#/`.
      try { await supabase.auth.signOut(); } catch { /* ignore */ }
      if (onSignOut) {
        try { await onSignOut(); } catch { /* ignore */ }
      }
      if (typeof window !== 'undefined') {
        try { window.location.hash = '#/'; } catch { /* ignore */ }
      }
      if (onClose) onClose();
    } catch (e) {
      console.warn('[reglages] delete_my_account failed:', e?.message || e);
      // Ré-affiche une modale d'erreur (ConfirmModal en mode "alert"
      // sans bouton annuler) pour que l'utilisateur voie clairement
      // que l'opération a échoué et qu'il peut nous écrire.
      await confirmDialog({
        title: s.reglages.deleteAccountErrorTitle,
        message: s.reglages.deleteAccountErrorMessage,
        confirmLabel: s.common.ok,
        cancelLabel: '',
        danger: true,
      });
    }
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
          {/* Section Photo de profil retirée (refonte modale 2026-04-30bis) :
              elle alourdissait la modale sans usage clair (pas d'affichage
              de l'avatar dans l'app au-delà de la sidebar). On garde le
              code de upload côté logique au cas où on la réintroduit, mais
              plus de UI ici. */}

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

          {/* Section Coordonnées bancaires retirée (refonte modale 2026-04-30bis) :
              les achats passent par /pricing → Stripe Checkout, pas par
              une saisie IBAN directe dans l'app. Les states iban/bic
              côté hook restent en mémoire pour ne pas casser un éventuel
              ré-attach futur, mais plus de UI. */}

          {/* ── Compte ── crédits restants + abonnement actif si applicable.
              CTA "+ Acheter des crédits" pill amber posé à côté pour
              que le user puisse top-up directement depuis la modale.
              Click → navigue vers /pricing + ferme la modale (via
              onClose). */}
          {(() => {
            const balance = creditsRow?.balance_remaining;
            const monthly = Number(creditsRow?.monthly_grant || 0);
            const isSubscribed = monthly > 0;
            const credText = balance != null
              ? `${balance} ${balance > 1 ? (s.reglages.creditsPlural || 'crédits') : (s.reglages.creditSingular || 'crédit')}`
              : null;
            const planText = isSubscribed
              ? (s.reglages.miniAccountPlanPremium || 'Premium')
              : (s.reglages.miniAccountPlanFree || 'Free');
            const renewMs = creditsRow?.monthly_renews_at
              ? new Date(creditsRow.monthly_renews_at).getTime()
              : null;
            const renewText = (isSubscribed && Number.isFinite(renewMs))
              ? new Date(renewMs).toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short' })
              : null;
            const goToPricing = () => {
              // Hash routing — navigation directe + fermeture de la modale.
              if (typeof window !== 'undefined') {
                window.location.hash = '#/pricing';
              }
              if (onClose) onClose();
              else if (onGoHome) onGoHome();
            };
            return (
              <>
                <div className="rg-row is-stack">
                  <div className="rg-account-row">
                    <div>
                      <div className="rg-label">{s.reglages.miniAccountLabel}</div>
                      <div className="rg-hint">{user?.email || ''}</div>
                    </div>
                    <div className="rg-account-meta">
                      {credText && (
                        <span className="rg-account-credits">{credText}</span>
                      )}
                      <span className={`rg-account-plan${isSubscribed ? ' is-premium' : ''}`}>
                        {planText}
                      </span>
                      {renewText && (
                        <span className="rg-account-renew">
                          {(s.reglages.renewsOn || 'Renouvelle le {date}').replace('{date}', renewText)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rg-account-cta"
                    onClick={goToPricing}
                  >
                    <span className="rg-account-cta-icon" aria-hidden="true">+</span>
                    <span>{s.reglages.buyCreditsCta || (isSubscribed ? 'Gérer mon abonnement' : 'Acheter des crédits')}</span>
                  </button>
                </div>

                {/* Résilier l'abonnement — visible seulement si l'user est
                    abonné. Modale d'explication + mailto contact pré-rempli. */}
                {isSubscribed && (
                  <div className="rg-row">
                    <div>
                      <div className="rg-label">{s.reglages.cancelSubLabel}</div>
                      <div className="rg-hint">{s.reglages.cancelSubHint}</div>
                    </div>
                    <button
                      type="button"
                      className="rg-btn"
                      onClick={handleCancelSubscription}
                    >
                      {s.reglages.cancelSubBtn}
                    </button>
                  </div>
                )}
              </>
            );
          })()}

          {/* ── Revoir le guide d'utilisation ──
              Efface les flags localStorage des DEUX guides (home + fiche)
              et déclenche un événement custom écouté par chaque instance
              de OnboardingHints. La modale Réglages se ferme et le guide
              de l'écran courant réapparaît immédiatement. */}
          <div className="rg-row">
            <div>
              <div className="rg-label">{s.reglages.replayOnboardingLabel}</div>
              <div className="rg-hint">{s.reglages.replayOnboardingHint}</div>
            </div>
            <button
              type="button"
              className="rg-btn"
              onClick={() => {
                try {
                  // Compat avec l'ancienne clef + les deux nouvelles clefs scoped
                  ['versions_onboarding_done',
                   'versions_onboarding_done_home',
                   'versions_onboarding_done_fiche'].forEach((k) => {
                    window.localStorage.removeItem(k);
                  });
                } catch {}
                try { window.dispatchEvent(new CustomEvent('versions:replay-onboarding')); } catch {}
                if (onClose) onClose();
                else if (onGoHome) onGoHome();
              }}
            >
              {s.reglages.replayOnboardingBtn}
            </button>
          </div>

          {/* ── Supprimer mon compte ── danger zone, en bas avant le footer.
              Tant que la RPC backend n'existe pas, la modale demande à
              l'utilisateur d'écrire au support — bouton mailto pré-rempli. */}
          <div className="rg-row rg-row-danger">
            <div>
              <div className="rg-label">{s.reglages.deleteAccountLabel}</div>
              <div className="rg-hint">{s.reglages.deleteAccountHint}</div>
            </div>
            <button
              type="button"
              className="rg-btn is-danger"
              onClick={handleDeleteAccount}
            >
              {s.reglages.deleteAccountBtn}
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
