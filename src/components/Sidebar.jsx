import { useState, useEffect, useRef } from 'react';
import { loadTracks, deleteTrack, renameTrack } from '../lib/storage';
import { confirmDialog } from '../lib/confirm.jsx';

/**
 * Sidebar — rendu conforme à mockup-v3.html (classes maquette).
 * Les styles sont définis dans MockupStyles.jsx.
 */
export default function Sidebar({
  currentTrackTitle,
  onSelectVersion,
  onNewTrack,
  onGoReglages,
  onGoHome,
  user,
  refreshKey,
}) {
  const [tracks, setTracks] = useState([]);
  const [localRefresh, setLocalRefresh] = useState(0);
  const [renameTarget, setRenameTarget] = useState(null); // track being renamed
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef(null);

  useEffect(() => {
    let alive = true;
    loadTracks().then((t) => { if (alive) setTracks(t); });
    return () => { alive = false; };
  }, [refreshKey, localRefresh]);

  const handleTrackClick = (track) => {
    const latest = track.versions?.[track.versions.length - 1];
    if (latest && onSelectVersion) onSelectVersion(track, latest);
  };

  const handleRename = (e, track) => {
    e.stopPropagation();
    setRenameTarget(track);
    setRenameValue(track.title);
    setTimeout(() => renameInputRef.current?.select(), 50);
  };

  const submitRename = async () => {
    const next = renameValue.trim();
    if (!next || next === renameTarget?.title) { setRenameTarget(null); return; }
    try {
      await renameTrack(renameTarget.id, next);
      setLocalRefresh((n) => n + 1);
    } catch (err) { console.warn('renameTrack failed', err); }
    setRenameTarget(null);
  };

  const handleDelete = async (e, track) => {
    e.stopPropagation();
    const n = (track.versions || []).length;
    const ok = await confirmDialog({
      title: "Supprimer le titre ?",
      message: `Supprimer "${track.title}" et ses ${n} version${n > 1 ? 's' : ''} ? Cette action est définitive.`,
      confirmLabel: "Supprimer",
      cancelLabel: "Annuler",
      danger: true,
    });
    if (ok !== 'confirm') return;
    try {
      await deleteTrack(track.id);
      setLocalRefresh((n2) => n2 + 1);
    } catch (err) { console.warn('deleteTrack failed', err); }
  };

  const initial = (user?.email || 'U').trim().charAt(0).toUpperCase();
  const who = user?.email ? user.email.split('@')[0] : 'utilisateur';

  return (
    <aside className="sidebar">
      <div className="brand" onClick={onGoHome} style={{ cursor: 'pointer' }}>
        <img src="/logo-versions.svg" alt="" style={{ height: 28, width: 'auto' }} />
        VER<span className="accent">SI</span>ONS
      </div>

      <div className="user-pill">
        <div className="avatar">{initial}</div>
        <div>
          <div className="who">{who}</div>
          <div className="plan">Premier</div>
        </div>
      </div>

      <button className="new-track" onClick={onNewTrack}>+ Nouveau titre</button>

      <div>
        <div className="section-label">Mes titres</div>
        <div className="track-list">
          {tracks.map((track) => {
            const active = track.title === currentTrackTitle;
            const count = track.versions?.length || 0;
            return (
              <TrackRow
                key={track.id}
                track={track}
                active={active}
                count={count}
                onClick={() => handleTrackClick(track)}
                onRename={(e) => handleRename(e, track)}
                onDelete={(e) => handleDelete(e, track)}
              />
            );
          })}
        </div>
      </div>

      <div className="footer">
        <button onClick={onGoReglages}>⚙ Réglages</button>
      </div>

      {/* Modale renommer titre */}
      {renameTarget && (
        <div
          onClick={() => setRenameTarget(null)}
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
              Renommer le titre
            </div>
            <input
              ref={renameInputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitRename();
                if (e.key === 'Escape') setRenameTarget(null);
              }}
              placeholder="Nom du titre"
              style={{
                width: '100%', padding: '10px 12px', fontSize: 13,
                background: '#0e0e10', border: '1px solid #2a2a2e',
                borderRadius: 8, color: '#e8e8ea', outline: 'none',
                fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => setRenameTarget(null)}
                style={{
                  padding: '8px 16px', fontSize: 12, borderRadius: 8,
                  background: 'transparent', border: '1px solid #2a2a2e',
                  color: '#c5c5c7', cursor: 'pointer', fontFamily: 'inherit',
                }}>Annuler</button>
              <button onClick={submitRename}
                disabled={!renameValue.trim() || renameValue.trim() === renameTarget?.title}
                style={{
                  padding: '8px 16px', fontSize: 12, borderRadius: 8,
                  background: '#f5b056', border: 'none',
                  color: '#141416', cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit',
                  opacity: (!renameValue.trim() || renameValue.trim() === renameTarget?.title) ? 0.5 : 1,
                }}>Renommer</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function TrackRow({ track, active, count, onClick, onRename, onDelete }) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const showDots = hover || menuOpen;

  return (
    <div
      className={`track${active ? ' active' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: 'relative' }}
    >
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {track.title}
      </span>

      {/* ⋯ au hover ; remplace le compteur au survol */}
      {showDots ? (
        <button
          ref={btnRef}
          onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
          title="Options"
          style={{
            width: 24, height: 24, borderRadius: 6,
            background: menuOpen ? 'rgba(245,176,86,.15)' : 'transparent',
            border: 'none', color: '#c5c5c7', cursor: 'pointer',
            padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, lineHeight: 1,
          }}
        >⋯</button>
      ) : (
        <span className="count">{count}</span>
      )}

      {menuOpen && (
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 100,
            minWidth: 180, background: '#141416', border: '1px solid #2a2a2e',
            borderRadius: 10, padding: 6, boxShadow: '0 12px 32px rgba(0,0,0,.55)',
          }}
        >
          <SbMenuItem label="Renommer" onClick={(e) => { setMenuOpen(false); onRename(e); }} />
          <div style={{ height: 1, background: '#2a2a2e', margin: '4px 2px' }} />
          <SbMenuItem label="Supprimer" danger onClick={(e) => { setMenuOpen(false); onDelete(e); }} />
        </div>
      )}
    </div>
  );
}

function SbMenuItem({ label, onClick, danger }) {
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
