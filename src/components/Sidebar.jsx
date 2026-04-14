import { useState, useEffect } from 'react';
import { loadTracks } from '../lib/storage';

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

  useEffect(() => {
    let alive = true;
    loadTracks().then((t) => { if (alive) setTracks(t); });
    return () => { alive = false; };
  }, [refreshKey]);

  const handleTrackClick = (track) => {
    const latest = track.versions?.[track.versions.length - 1];
    if (latest && onSelectVersion) onSelectVersion(track, latest);
  };

  const initial = (user?.email || 'U').trim().charAt(0).toUpperCase();
  const who = user?.email ? user.email.split('@')[0] : 'utilisateur';

  return (
    <aside className="sidebar">
      <div className="brand" onClick={onGoHome} style={{ cursor: 'pointer' }}>
        VER<span className="accent">si</span>ONS
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
              <div
                key={track.id}
                className={`track${active ? ' active' : ''}`}
                onClick={() => handleTrackClick(track)}
              >
                <span>{track.title}</span>
                <span className="count">{count}</span>
              </div>
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
