import { useEffect, useRef, useState } from 'react';
import {
  enablePublicShare,
  disablePublicShare,
  getPublicShareToken,
} from '../lib/storage';
import useLang from '../hooks/useLang';

// Modale de partage d'une fiche par lien public (lecture seule).
// Elle porte l'état du token : on le charge au mount, et on laisse
// l'utilisateur activer / désactiver et copier l'URL finale dans le
// presse-papiers.
//
// Habillage v2 : mini-modal (dark card, un mot amber dans le titre,
// URL en pill mono + bouton COPIER amber filled, ligne de statut mint,
// DÉSACTIVER en rouge outline). Partage le même langage visuel que
// Réglages, AddModal et ExportPdfModal.
export default function ShareLinkModal({ versionId, trackTitle, versionName, onClose }) {
  const { s } = useLang();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const t = await getPublicShareToken(versionId);
      if (alive) { setToken(t); setLoading(false); }
    })();
    return () => { alive = false; };
  }, [versionId]);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape' && !busy) onClose?.(); };
    document.addEventListener('keydown', h);
    // Empêche le scroll du fond pendant que la modale est ouverte
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', h);
      document.body.style.overflow = prev;
    };
  }, [onClose, busy]);

  // URL construite à partir de l'origine courante + hash route #/p/<token>
  const shareUrl = token
    ? `${window.location.origin}${window.location.pathname}#/p/${token}`
    : '';

  const handleEnable = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const t = await enablePublicShare(versionId);
      if (t) setToken(t);
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    if (busy || !token) return;
    setBusy(true);
    try {
      await disablePublicShare(versionId);
      setToken(null);
      setCopied(false);
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback : select the input
      inputRef.current?.select();
      document.execCommand?.('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  // Sous-titre : "Pour {trackTitle} · Version {versionName}"
  const subParts = [];
  if (trackTitle) subParts.push(trackTitle);
  if (versionName) subParts.push(`${s.modals.shareVersionPrefix} ${versionName}`);
  const sub = subParts.length
    ? `${s.modals.shareSubPrefix} ${subParts.join(' · ')}`
    : null;

  return (
    <div
      className="add-mini-backdrop"
      onClick={busy ? undefined : onClose}
      role="presentation"
    >
      <div
        className="add-mini-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={s.modals.shareModalTitle}
      >
        <button
          type="button"
          className="add-mini-close"
          onClick={onClose}
          disabled={busy}
          aria-label={s.common?.close || 'Fermer'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="add-mini-title">
          {s.modals.shareTitleBefore}{' '}
          <em>{s.modals.shareTitleEm}</em>
        </div>
        {sub && <div className="add-mini-sub">{sub}</div>}

        {loading ? (
          <div className="add-mini-body-text">{s.modals.shareLoading}</div>
        ) : token ? (
          <>
            <div className="add-mini-body-text">
              {s.modals.shareActiveBody}
            </div>

            <div className="add-mini-url-row">
              <input
                ref={inputRef}
                readOnly
                className="add-mini-url-input"
                value={shareUrl}
                onFocus={(e) => e.target.select()}
              />
              <button
                type="button"
                className={`add-mini-btn ${copied ? 'is-mint' : 'is-primary'}`}
                onClick={handleCopy}
              >
                {copied ? s.modals.shareCopiedShort : s.modals.shareCopyShort}
              </button>
            </div>

            <div className="add-mini-status" aria-live="polite">
              <span className="add-mini-status-check" aria-hidden="true">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 6.2l2.3 2.3L9.5 3.5" />
                </svg>
              </span>
              {s.modals.shareStatusActive}
            </div>

            <div className="add-mini-foot">
              <button
                type="button"
                className="add-mini-btn is-danger"
                onClick={handleDisable}
                disabled={busy}
              >
                {busy ? '…' : s.modals.shareDisable}
              </button>
              <button
                type="button"
                className="add-mini-btn"
                onClick={onClose}
                disabled={busy}
              >
                {s.modals.shareClose}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="add-mini-body-text">
              {s.modals.shareInactiveBody}
            </div>
            <div className="add-mini-foot">
              <button
                type="button"
                className="add-mini-btn"
                onClick={onClose}
                disabled={busy}
              >
                {s.modals.shareCancel}
              </button>
              <button
                type="button"
                className="add-mini-btn is-primary"
                onClick={handleEnable}
                disabled={busy}
              >
                {busy ? s.modals.shareEnabling : s.modals.shareEnable}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
