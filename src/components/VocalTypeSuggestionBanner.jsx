import { useState } from 'react';
import { updateTrackVocalType } from '../lib/storage';

// Clé localStorage pour mémoriser le refus de la suggestion sur une version donnée.
// Permet de ne pas réafficher le bandeau si l'utilisateur l'a décliné, sans pour
// autant le condamner : une v3 avec voix détectée re-proposera (nouvelle key).
const DISMISS_KEY = (versionId) => `vocal-suggest-dismissed:${versionId}`;

/**
 * Bandeau de suggestion affiché sur la fiche quand :
 *  - le titre est marqué « instrumental_pending » (voix à venir)
 *  - Gemini a détecté du chant sur la version courante (contient_chant === true)
 *  - l'utilisateur n'a pas déjà refusé la suggestion sur cette version
 *
 * Sur "Oui, passer en Chanté" → update la `vocal_type` du track et rafraîchit.
 * Sur "Non merci" → mémorise le refus (localStorage) et cache le bandeau.
 */
export default function VocalTypeSuggestionBanner({ track, versionId, listening, onRefresh }) {
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (!versionId) return false;
    try { return localStorage.getItem(DISMISS_KEY(versionId)) === '1'; }
    catch { return false; }
  });

  // Garde-fous : on ne propose rien tant qu'on n'a pas un track réel + une
  // version réelle + un statut incohérent avec l'écoute.
  if (dismissed) return null;
  if (!track?.id || track.id === '__pending__') return null;
  if (!versionId || versionId === '__pending_v__') return null;
  const vocalType = track?.vocalType || 'vocal';
  if (vocalType !== 'instrumental_pending') return null;
  if (listening?.contient_chant !== true) return null;

  const handleAccept = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await updateTrackVocalType(track.id, 'vocal');
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.warn('[vocal-suggest] updateTrackVocalType failed:', err?.message || err);
    } finally {
      setBusy(false);
    }
  };

  const handleDismiss = () => {
    try { localStorage.setItem(DISMISS_KEY(versionId), '1'); } catch { /* storage quota ou mode privé */ }
    setDismissed(true);
  };

  return (
    <div className="vocal-suggest" role="region" aria-label="Suggestion de type vocal">
      <div className="vs-icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      </div>
      <div className="vs-body">
        <div className="vs-title">On a entendu de la voix sur cette version</div>
        <div className="vs-text">Ce titre est encore marqué « Voix à venir ». Le passer en « Chanté » ?</div>
      </div>
      <div className="vs-actions">
        <button type="button" className="vs-btn vs-btn-primary" onClick={handleAccept} disabled={busy}>
          {busy ? '…' : 'Oui, passer en Chanté'}
        </button>
        <button type="button" className="vs-btn vs-btn-ghost" onClick={handleDismiss} disabled={busy}>
          Non merci
        </button>
      </div>
    </div>
  );
}
