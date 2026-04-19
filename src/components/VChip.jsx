import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { confirmDialog } from '../lib/confirm.jsx';
import { renameVersion, deleteVersion } from '../lib/storage';

export default function VChip({ track, version, idx, isActive, score, onSelect, onRefresh, onDeleted, onShare, onExport }) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [busy, setBusy] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e) => {
      if (menuRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setMenuOpen(false);
    };
    const esc = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', h);
      document.removeEventListener('keydown', esc);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (renameOpen) {
      setRenameValue(version.name || '');
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [renameOpen, version.name]);

  const openMenu = (e) => {
    e.stopPropagation();
    if (!menuOpen && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setMenuPos({ top: r.bottom + 6, left: Math.max(8, r.right - 200) });
    }
    setMenuOpen((o) => !o);
  };

  const openRename = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    setRenameOpen(true);
  };

  const submitRename = async () => {
    const next = renameValue.trim();
    if (!next || next === version.name) { setRenameOpen(false); return; }
    setBusy(true);
    try { await renameVersion(track.id, version.id, next); onRefresh?.(); }
    catch (err) { console.warn('renameVersion failed', err); }
    setBusy(false);
    setRenameOpen(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    const ok = await confirmDialog({
      title: "Supprimer la version ?",
      message: `Voulez-vous supprimer la version "${version.name}" ? Cette action est définitive.`,
      confirmLabel: "Supprimer",
      cancelLabel: "Annuler",
      danger: true,
    });
    if (ok !== "confirm") return;
    try {
      await deleteVersion(track.id, version.id);
      onDeleted?.(version);
      onRefresh?.();
    } catch (err) { console.warn('deleteVersion failed', err); }
  };

  const showDots = hover || menuOpen;

  return (
    <div
      className={`vchip${isActive ? ' active current-badge' : ''}`}
      onClick={() => { console.log("[vchip] clicked", version.name); onSelect?.(track, version); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: 'relative' }}
    >
      <span className="vname">V{idx + 1}</span>
      <span className="vscore">
        {typeof score === 'number' ? Math.round(score) : '—'}
        {typeof score === 'number' && <span className="pct">%</span>}
      </span>
      {showDots && (
        <span ref={btnRef} role="button" tabIndex={0}
          onClick={openMenu}
          onMouseDown={(e) => e.stopPropagation()}
          title="Options de la version"
          style={{
            position: 'absolute', top: 2, right: 2, zIndex: 30,
            width: 22, height: 22, borderRadius: 4,
            background: menuOpen ? 'rgba(245,176,86,.18)' : 'rgba(20,20,22,.85)',
            color: '#c5c5c7', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, lineHeight: 1, userSelect: 'none',
          }}
        >⋯</span>
      )}
      {menuOpen && createPortal(
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed', top: menuPos.top, left: menuPos.left, zIndex: 9999,
            minWidth: 180, background: '#141416', border: '1px solid #2a2a2e',
            borderRadius: 10, padding: 6, boxShadow: '0 12px 32px rgba(0,0,0,.55)',
          }}
        >
          <Item label="Renommer" onClick={openRename} />
          {onShare && (
            <Item
              label="Partager un lien public"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onShare(track, version); }}
            />
          )}
          {onExport && (
            <Item
              label="Exporter en PDF"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onExport(track, version); }}
            />
          )}
          <div style={{ height: 1, background: '#2a2a2e', margin: '4px 2px' }} />
          <Item label="Supprimer" danger onClick={handleDelete} />
        </div>,
        document.body
      )}
      {renameOpen && createPortal(
        <div
          onClick={() => setRenameOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 380, background: '#141416', border: '1px solid #2a2a2e',
              borderRadius: 14, padding: 22, boxShadow: '0 20px 60px rgba(0,0,0,.6)',
            }}
          >
            <div style={{ fontSize: 14, color: '#e8e8ea', marginBottom: 14, fontWeight: 500 }}>
              Renommer la version
            </div>
            <input
              ref={inputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitRename();
                if (e.key === 'Escape') setRenameOpen(false);
              }}
              placeholder="Nom de la version"
              style={{
                width: '100%', padding: '10px 12px', fontSize: 13,
                background: '#0e0e10', border: '1px solid #2a2a2e',
                borderRadius: 8, color: '#e8e8ea', outline: 'none',
                fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => setRenameOpen(false)} disabled={busy}
                style={{
                  padding: '8px 16px', fontSize: 12, borderRadius: 8,
                  background: 'transparent', border: '1px solid #2a2a2e',
                  color: '#c5c5c7', cursor: 'pointer', fontFamily: 'inherit',
                }}>Annuler</button>
              <button onClick={submitRename} disabled={busy || !renameValue.trim()}
                style={{
                  padding: '8px 16px', fontSize: 12, borderRadius: 8,
                  background: '#f5b056', border: 'none',
                  color: '#141416', cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit',
                  opacity: busy || !renameValue.trim() ? 0.5 : 1,
                }}>{busy ? '...' : 'Renommer'}</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function Item({ label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        padding: '8px 12px', borderRadius: 6, border: 'none',
        background: 'transparent', cursor: 'pointer',
        fontFamily: 'Inter, sans-serif', fontSize: 12,
        color: danger ? '#ef6b6b' : '#c5c5c7',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = danger ? 'rgba(239,107,107,.08)' : 'rgba(245,176,86,.06)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >{label}</button>
  );
}
