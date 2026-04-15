import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { renameVersion, deleteVersion, setMainVersion } from '../lib/storage';

export default function VChip({ track, version, idx, isActive, score, onSelect, onRefresh, onDeleted }) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const btnRef = useRef(null);

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

  const openMenu = (e) => {
    e.stopPropagation();
    if (!menuOpen && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setMenuPos({ top: r.bottom + 6, left: Math.max(8, r.right - 200) });
    }
    setMenuOpen((o) => !o);
  };

  const handleRename = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    const next = window.prompt('Nouveau nom pour cette version :', version.name);
    if (!next || next.trim() === '' || next.trim() === version.name) return;
    try { await renameVersion(track.id, version.id, next.trim()); onRefresh?.(); }
    catch (err) { console.warn('renameVersion failed', err); }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (!window.confirm(`Supprimer la version "${version.name}" ? Cette action est definitive.`)) return;
    try {
      await deleteVersion(track.id, version.id);
      onDeleted?.(version);
      onRefresh?.();
    } catch (err) { console.warn('deleteVersion failed', err); }
  };

  const handleSetMain = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    try { await setMainVersion(track.id, version.id); onRefresh?.(); }
    catch (err) { console.warn('setMainVersion failed', err); }
  };

  const showDots = hover || menuOpen;

  return (
    <div
      className={`vchip${isActive ? ' active current-badge' : ''}`}
      onClick={() => onSelect?.(track, version)}
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
            minWidth: 200, background: '#141416', border: '1px solid #2a2a2e',
            borderRadius: 10, padding: 6, boxShadow: '0 12px 32px rgba(0,0,0,.55)',
          }}
        >
          <Item label="Renommer" onClick={handleRename} />
          {!version.main && <Item label="Definir comme principale" onClick={handleSetMain} />}
          <div style={{ height: 1, background: '#2a2a2e', margin: '4px 2px' }} />
          <Item label="Supprimer la version" danger onClick={handleDelete} />
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
