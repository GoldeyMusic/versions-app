import { useEffect, useState } from 'react';
import useLang from '../hooks/useLang';
import {
  loadArchipelConsentRow,
  setArchipelSubscribed,
  archipelToastText,
} from '../lib/archipelConsent';

// Carte « Nouvelles d'Archipel Audio » pour les comptes qui n'ont encore
// fait AUCUN choix (en pratique : les comptes créés avant la mention à
// l'inscription, migration 052). Même principe que sur AudioKit.
//
// - Affichée sur le tableau de bord uniquement, quelques secondes après
//   l'arrivée, en bas à droite (pleine largeur sur mobile).
// - Deux boutons de même poids, rien de présélectionné :
//   Oui = opt-in explicite (archipel_set_preference(true), texte versionné
//   toast-*-2026-10-A gardé en preuve) ; Non merci = refus enregistré.
//   Dans les deux cas une ligne existe ensuite → la carte ne revient plus.
// - Croix = « plus tard » : revient après 30 jours, au plus 2 fois.
// - Toute erreur réseau → la carte se ferme sans rien enregistrer.
const DISMISS_KEY = (uid) => `versions_archipel_toast_${uid}`;
const DISMISS_DELAY_MS = 30 * 24 * 3600 * 1000;
const MAX_DISMISSALS = 2;
const SHOW_AFTER_MS = 3000;

function readDismiss(uid) {
  try {
    const v = JSON.parse(localStorage.getItem(DISMISS_KEY(uid)) || 'null');
    return v && typeof v === 'object' ? v : { n: 0, at: 0 };
  } catch {
    return { n: 0, at: 0 };
  }
}

function writeDismiss(uid, v) {
  try { localStorage.setItem(DISMISS_KEY(uid), JSON.stringify(v)); } catch {}
}

export default function ArchipelConsentToast({ user, active }) {
  const { s, lang } = useLang();
  const t = s.archipelToast;
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!active || !user?.id) { setVisible(false); return undefined; }
    const d = readDismiss(user.id);
    if (d.n >= MAX_DISMISSALS) return undefined;
    if (d.at && Date.now() - d.at < DISMISS_DELAY_MS) return undefined;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const row = await loadArchipelConsentRow(user.id);
        if (!cancelled && !row) setVisible(true);
      } catch {
        // table absente / réseau : on n'affiche rien
      }
    }, SHOW_AFTER_MS);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [active, user?.id]);

  if (!visible || !t) return null;

  const answer = async (subscribe) => {
    if (busy) return;
    setBusy(true);
    try {
      await setArchipelSubscribed(subscribe, lang, archipelToastText(lang));
    } catch (e) {
      console.warn('[archipel-toast] save failed:', e && e.message);
    } finally {
      setBusy(false);
      setVisible(false);
    }
  };

  const later = () => {
    const d = readDismiss(user.id);
    writeDismiss(user.id, { n: (d.n || 0) + 1, at: Date.now() });
    setVisible(false);
  };

  return (
    <div className="arch-toast" role="dialog" aria-live="polite" aria-label={t.aria}>
      <button type="button" className="arch-toast-close" onClick={later} aria-label={t.later}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
      <p className="arch-toast-text">{t.text}</p>
      <p className="arch-toast-sub">
        {t.sub}{' · '}
        <a href="/privacy" target="_blank" rel="noopener noreferrer">{t.privacy}</a>
      </p>
      <div className="arch-toast-actions">
        <button type="button" className="arch-toast-btn" disabled={busy} onClick={() => answer(false)}>
          {t.no}
        </button>
        <button type="button" className="arch-toast-btn is-yes" disabled={busy} onClick={() => answer(true)}>
          {t.yes}
        </button>
      </div>
    </div>
  );
}
