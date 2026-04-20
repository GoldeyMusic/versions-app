import { useEffect, useRef, useState } from 'react';
import {
  enablePublicShare,
  disablePublicShare,
  getPublicShareToken,
} from '../lib/storage';
import useLang from '../hooks/useLang';

// Modale de partage d'une fiche par lien public (lecture seule).
// Elle porte l'état du token : on le charge au mount, et on laisse l'utilisateur
// activer / désactiver et copier l'URL finale dans le presse-papiers.
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
    return () => document.removeEventListener('keydown', h);
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

  return (
    <div
      onClick={busy ? undefined : onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 480, maxWidth: '92vw',
          background: '#141416', border: '1px solid #2a2a2e',
          borderRadius: 14, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,.6)',
        }}
      >
        <div style={{ fontSize: 14, color: '#e8e8ea', marginBottom: 4, fontWeight: 500 }}>
          {s.modals.shareModalTitle}
        </div>
        <div style={{ fontSize: 12, color: '#8a8a8f', marginBottom: 16 }}>
          {trackTitle}{versionName ? ` — ${s.modals.shareVersionPrefix} ${versionName}` : ''}
        </div>

        {loading ? (
          <div style={{ fontSize: 12, color: '#8a8a8f', padding: '18px 0' }}>
            {s.modals.shareLoading}
          </div>
        ) : token ? (
          <>
            <div style={{
              fontSize: 12, color: '#c5c5c7', lineHeight: 1.6, marginBottom: 14,
            }}>
              {s.modals.shareActiveBody}
            </div>
            <div style={{
              display: 'flex', gap: 8, alignItems: 'stretch', marginBottom: 16,
            }}>
              <input
                ref={inputRef}
                readOnly
                value={shareUrl}
                onFocus={(e) => e.target.select()}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  fontSize: 12,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  color: '#e8e8ea',
                  background: '#1a1a1d',
                  border: '1px solid #2a2a2e',
                  borderRadius: 8,
                  outline: 'none',
                }}
              />
              <button
                onClick={handleCopy}
                style={{
                  padding: '0 14px', fontSize: 12, borderRadius: 8,
                  background: copied ? '#7ac48e' : '#f5b056', border: 'none',
                  color: '#141416', cursor: 'pointer', fontWeight: 500,
                  fontFamily: 'inherit', whiteSpace: 'nowrap',
                }}
              >
                {copied ? s.modals.shareCopiedShort : s.modals.shareCopyShort}
              </button>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap',
            }}>
              <button
                onClick={handleDisable}
                disabled={busy}
                style={{
                  padding: '8px 14px', fontSize: 12, borderRadius: 8,
                  background: 'transparent', border: '1px solid #ef6b6b66',
                  color: '#ef6b6b', cursor: busy ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {busy ? '…' : s.modals.shareDisable}
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '8px 16px', fontSize: 12, borderRadius: 8,
                  background: '#1a1a1d', border: '1px solid #2a2a2e',
                  color: '#c5c5c7', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {s.modals.shareClose}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{
              fontSize: 12, color: '#c5c5c7', lineHeight: 1.6, marginBottom: 16,
            }}>
              {s.modals.shareInactiveBody}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={onClose}
                disabled={busy}
                style={{
                  padding: '8px 16px', fontSize: 12, borderRadius: 8,
                  background: 'transparent', border: '1px solid #2a2a2e',
                  color: '#c5c5c7', cursor: busy ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {s.modals.shareCancel}
              </button>
              <button
                onClick={handleEnable}
                disabled={busy}
                style={{
                  padding: '8px 16px', fontSize: 12, borderRadius: 8,
                  background: '#f5b056', border: 'none',
                  color: '#141416', cursor: busy ? 'not-allowed' : 'pointer',
                  fontWeight: 500, fontFamily: 'inherit',
                }}
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
