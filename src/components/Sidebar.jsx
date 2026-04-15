import { useState, useEffect, useRef } from 'react';
import { loadTracks, deleteTrack, renameTrack } from '../lib/storage';

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

  useEffect(() => {
    let alive = true;
    loadTracks().then((t) => { if (alive) setTracks(t); });
    return () => { alive = false; };
  }, [refreshKey, localRefresh]);

  const handleTrackClick = (track) => {
    const latest = track.versions?.[track.versions.length - 1];
    if (latest && onSelectVersion) onSelectVersion(track, latest);
  };

  const handleRename = async (e, track) => {
    e.stopPropagation();
    const next = window.prompt('Nouveau nom du titre :', track.title);
    if (!next || next.trim() === '' || next.trim() === track.title) return;
    try {
      await renameTrack(track.id, next.trim());
      setLocalRefresh((n) => n + 1);
    } catch (err) { console.warn('renameTrack failed', err); }
  };

  const handleDelete = async (e, track) => {
    e.stopPropagation();
    const n = (track.versions || []).length;
    const msg = `Supprimer "${track.title}" et ses ${n} version${n > 1 ? 's' : ''} ? Cette action est définitive.`;
    if (!window.confirm(msg)) return;
    try {
      await deleteTrack(track.id);
      setLocalRefresh((n2) => n2 + 1);
    } catch (err) { console.warn('deleteTrack failed', err); }
  };

  const initial = (user?.email || 'U').trim().charAt(0).toUpperCase();
  const who = user?.email ? user.email.split('@')[0] : 'utilisateur';

  return (
    <aside className="sidebar">
      <div className="brand" onClick={onGoHome} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
        <img src="/logo-versions.svg" alt="" style={{ height: 22, width: "auto", display: "block" }} />
        <span>VER<span className="accent">si</span>ONS</span>
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
