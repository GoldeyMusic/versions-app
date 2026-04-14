import { useState, useEffect } from 'react';
import T from '../constants/theme';
import { loadTracks } from '../lib/storage';

/**
 * Sidebar — version maquette-v3 : liste plate, discrète.
 *
 * Comportement :
 *  - Clic sur un titre → onSelectVersion(track, latestVersion)
 *    (la navigation fine entre versions se fait ensuite via la timeline chips)
 *  - "+ Nouveau titre" → onNewTrack()
 *  - "Réglages" → onGoReglages()
 *
 * Props conservées pour compat avec App.jsx (certaines ne servent plus ici —
 * elles sont gérées via la timeline chips sur FicheScreen).
 */
export default function Sidebar({
  currentTrackTitle,
  // currentVersionName, onAddVersion, onAskOpen, onPlay, onStop, playerState, onSignOut : non utilisés ici
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
    <aside
      style={{
        position: 'fixed', top: 0, left: 0, bottom: 68,
        width: 240,
        background: 'transparent',
        borderRight: `1px solid ${T.border}`,
        padding: '22px 18px',
        display: 'flex', flexDirection: 'column', gap: 18,
        overflowY: 'auto',
        zIndex: 20,
      }}
    >
      {/* Brand */}
      <div
        onClick={onGoHome}
        style={{
          display: 'flex', alignItems: 'baseline', gap: 2,
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: 22, letterSpacing: 1, cursor: 'pointer',
          color: T.text,
        }}
      >
        VER<span style={{ color: T.amber, fontStyle: 'italic' }}>si</span>ONS
      </div>

      {/* User pill */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', borderRadius: 10,
          background: T.s1, border: `1px solid ${T.border}`,
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: 'linear-gradient(135deg, #f5b056, #e88855)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#000', fontFamily: T.mono, fontWeight: 600, fontSize: 12,
        }}>{initial}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 12, color: T.text, fontWeight: 500,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            maxWidth: 160,
          }}>{who}</div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 1 }}>Premier</div>
        </div>
      </div>

      {/* + Nouveau titre */}
      <button
        onClick={onNewTrack}
        style={{
          padding: '9px 12px', borderRadius: 8,
          border: `1px dashed ${T.amber}66`,
          color: T.amber, background: 'transparent',
          fontFamily: T.mono, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase',
          textAlign: 'center', cursor: 'pointer',
        }}
      >+ Nouveau titre</button>

      {/* Mes titres */}
      <div>
        <div style={{
          fontFamily: T.mono, fontSize: 9, letterSpacing: 1.5,
          color: T.muted2 || '#5a5a5e', textTransform: 'uppercase',
          margin: '4px 4px 6px',
        }}>Mes titres</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {tracks.map((track) => {
            const active = track.title === currentTrackTitle;
            const count = track.versions?.length || 0;
            return (
              <div
                key={track.id}
                onClick={() => handleTrackClick(track)}
                style={{
                  padding: '7px 10px', borderRadius: 6,
                  fontFamily: T.body, fontSize: 13,
                  color: active ? T.amber : (T.textSoft || T.text),
                  background: active ? (T.amberGlow || 'rgba(245,176,86,0.07)') : 'transparent',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                  transition: 'background .15s, color .15s',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = T.s1; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  minWidth: 0, flex: 1,
                }}>{track.title}</span>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, flexShrink: 0 }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer : Réglages */}
      <div style={{
        marginTop: 'auto',
        display: 'flex', flexDirection: 'column', gap: 6,
        paddingTop: 14, borderTop: `1px solid ${T.border}`,
      }}>
        <button
          onClick={onGoReglages}
          style={{
            padding: '7px 10px', borderRadius: 7,
            fontFamily: T.mono, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase',
            color: T.muted, border: `1px solid ${T.border}`, background: 'transparent',
            textAlign: 'left', cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.muted; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = T.muted; e.currentTarget.style.borderColor = T.border; }}
        >⚙ Réglages</button>
      </div>
    </aside>
  );
}
