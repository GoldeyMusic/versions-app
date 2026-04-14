import { useState, useEffect } from 'react';
import T from '../constants/theme';
import {
  IconStar,
  IconTrash,
  IconEdit,
  IconPlay,
  IconPause,
  IconSettings,
} from '../components/Icons';
import {
  loadTracks,
  deleteVersion as storageDeleteVersion,
  renameVersion as storageRenameVersion,
  renameTrack as storageRenameTrack,
  setMainVersion as storageSetMain,
} from '../lib/storage';

/**
 * Sidebar persistante à gauche (desktop).
 * - Liste des titres comme dossiers dépliables
 * - Versions cliquables → onSelectVersion(track, version)
 * - "+ Nouvelle version" par titre
 * - "+ Nouveau titre" en haut
 * - Réglages / Ask / email en bas
 *
 * Props:
 *  - currentTrackTitle, currentVersionName : pour highlight actif
 *  - onSelectVersion(track, version)       : clic sur une version
 *  - onAddVersion(track)                   : + Nouvelle version dans un titre
 *  - onNewTrack()                          : + Nouveau titre (ouvre InputScreen vierge)
 *  - onGoReglages(), onAskOpen()
 *  - onPlay, onStop, playerState
 *  - user, onSignOut
 *  - refreshKey : change → reload tracks (après une nouvelle analyse)
 */
export default function Sidebar({
  currentTrackTitle,
  currentVersionName,
  onSelectVersion,
  onAddVersion,
  onNewTrack,
  onGoReglages,
  onAskOpen,
  onPlay,
  onStop,
  playerState,
  user,
  onSignOut,
  onGoHome,
  refreshKey,
}) {
  const [tracks, setTracks] = useState([]);
  const [expandedId, setExpandedId] = useState(null); // un seul titre ouvert à la fois
  const [menuOpen, setMenuOpen] = useState(null); // versionId
  const [trackMenuOpen, setTrackMenuOpen] = useState(null); // trackId
  const [renaming, setRenaming] = useState(null); // versionId
  const [renameVal, setRenameVal] = useState('');
  const [renamingTrack, setRenamingTrack] = useState(null);
  const [trackRenameVal, setTrackRenameVal] = useState('');

  // Load tracks
  useEffect(() => {
    let alive = true;
    loadTracks().then((t) => {
      if (!alive) return;
      setTracks(t);
      // auto-expand the current track
      if (currentTrackTitle) {
        const cur = t.find((x) => x.title === currentTrackTitle);
        if (cur) setExpandedId(cur.id);
      }
    });
    return () => {
      alive = false;
    };
  }, [refreshKey, currentTrackTitle]);

  const toggleExpand = (trackId) =>
    setExpandedId((prev) => (prev === trackId ? null : trackId));

  const isCurrentVersion = (track, v) =>
    currentTrackTitle === track.title && currentVersionName === v.name;

  const isVersionPlaying = (track, v) =>
    playerState?.isPlaying &&
    playerState.trackTitle === track.title &&
    playerState.versionName === v.name;

  const playVersion = (track, v) => {
    const playlist = track.versions.map((x) => ({
      trackTitle: track.title,
      versionName: x.name,
    }));
    const idx = track.versions.findIndex((x) => x.id === v.id);
    // Garder la progression UNIQUEMENT si on reste sur le même titre.
    // Changer de titre = redémarrer à 0.
    const sameTrack = playerState && playerState.trackTitle === track.title;
    onPlay(track.title, v.name, playlist, idx >= 0 ? idx : 0, !!sameTrack);
  };

  const togglePlayVersion = (track, v, e) => {
    e.stopPropagation();
    const isActive =
      playerState &&
      playerState.trackTitle === track.title &&
      playerState.versionName === v.name;
    if (isActive) {
      // pause/resume current — ne touche pas à l'analyse affichée
      if (playerState.isPlaying) {
        onStop();
      } else {
        playVersion(track, v);
      }
    } else {
      // Nouvelle version : lance la lecture ET affiche son analyse (si dispo)
      playVersion(track, v);
      if (v.analysisResult) onSelectVersion(track, v);
    }
  };

  const deleteV = async (trackId, versionId) => {
    const updated = await storageDeleteVersion(trackId, versionId);
    setTracks(updated);
    setMenuOpen(null);
  };
  const setMain = async (trackId, versionId) => {
    const updated = await storageSetMain(trackId, versionId);
    setTracks(updated);
    setMenuOpen(null);
  };
  const startRename = (v) => {
    setRenaming(v.id);
    setRenameVal(v.name);
    setMenuOpen(null);
  };
  const confirmRename = async (trackId) => {
    if (!renameVal.trim()) return;
    const updated = await storageRenameVersion(trackId, renaming, renameVal);
    setTracks(updated);
    setRenaming(null);
  };
  const startRenameTrack = (track) => {
    setRenamingTrack(track.id);
    setTrackRenameVal(track.title);
    setTrackMenuOpen(null);
  };
  const confirmRenameTrack = async (trackId) => {
    if (!trackRenameVal.trim()) return;
    const updated = await storageRenameTrack(trackId, trackRenameVal);
    setTracks(updated);
    setRenamingTrack(null);
  };

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: 260,
        background: T.s1,
        borderRight: `1px solid ${T.border}`,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {/* Header — logo VERSIONS (clic = home) + user pill */}
      <div
        style={{
          padding: '18px 16px 14px',
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <button
          onClick={onGoHome}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontFamily: T.display,
            fontSize: 22,
            letterSpacing: 4,
            color: T.text,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
          title="Accueil"
        >
          <img
            src="/logo-versions.svg"
            alt=""
            style={{ height: 24, width: 'auto', display: 'block' }}
          />
          <span>VER<span style={{ color: T.amber }}>SI</span>ONS</span>
        </button>

        {/* User pill */}
        {user?.email && (
          <div
            onClick={onGoReglages}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              marginBottom: 12,
              borderRadius: 10,
              cursor: 'pointer',
              background: 'transparent',
              border: `1px solid ${T.border}`,
              transition: 'background .15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = T.s2)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            title="Réglages"
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${T.amber}, ${T.orange || T.amber})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: T.mono,
                fontSize: 12,
                fontWeight: 600,
                color: T.black,
                flexShrink: 0,
              }}
            >
              {user.email[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: T.body,
                  fontSize: 11,
                  fontWeight: 500,
                  color: T.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.email.split('@')[0]}
              </div>
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: 9,
                  color: T.muted,
                  marginTop: 1,
                }}
              >
                Premier
              </div>
            </div>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: T.muted }}>
              <path d="M2 3l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        <button
          onClick={onNewTrack}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'transparent',
            border: `1px dashed ${T.amber}66`,
            borderRadius: 8,
            color: T.amber,
            fontFamily: T.mono,
            fontSize: 10,
            letterSpacing: 1,
            cursor: 'pointer',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = T.amberGlow;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <span style={{ fontSize: 14, lineHeight: 1, marginTop: -2 }}>+</span>
          Nouveau titre
        </button>
      </div>

      {/* Scrollable tree */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
        {tracks.length === 0 && (
          <div
            style={{
              fontFamily: T.body,
              fontWeight: 300,
              fontSize: 11,
              color: T.muted,
              padding: '20px 14px',
              lineHeight: 1.6,
              textAlign: 'center',
            }}
          >
            Aucun titre pour le moment. Crée-en un pour lancer ta première analyse.
          </div>
        )}

        {tracks.map((track) => {
          const isOpen = expandedId === track.id;
          const isCurrentTrack = currentTrackTitle === track.title;
          return (
            <div key={track.id} style={{ marginBottom: 2 }}>
              {/* Track row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 8px',
                  borderRadius: 6,
                  background: isCurrentTrack ? T.amberGlow : 'transparent',
                  transition: 'background .15s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isCurrentTrack) e.currentTarget.style.background = T.s2;
                }}
                onMouseLeave={(e) => {
                  if (!isCurrentTrack) e.currentTarget.style.background = 'transparent';
                }}
              >
                <button
                  onClick={() => toggleExpand(track.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 2,
                    display: 'flex',
                    alignItems: 'center',
                    color: T.muted,
                    marginRight: 4,
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0)',
                    transition: 'transform .15s',
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M3 2l4 3-4 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {renamingTrack === track.id ? (
                  <input
                    value={trackRenameVal}
                    onChange={(e) => setTrackRenameVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmRenameTrack(track.id);
                      if (e.key === 'Escape') setRenamingTrack(null);
                    }}
                    onBlur={() => confirmRenameTrack(track.id)}
                    autoFocus
                    style={{
                      flex: 1,
                      background: T.s2,
                      border: `1px solid ${T.amber}`,
                      borderRadius: 4,
                      padding: '3px 6px',
                      fontFamily: T.body,
                      fontSize: 12,
                      color: T.text,
                      outline: 'none',
                    }}
                  />
                ) : (
                  <button
                    onClick={() => toggleExpand(track.id)}
                    style={{
                      flex: 1,
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      fontFamily: T.body,
                      fontSize: 12,
                      fontWeight: isCurrentTrack ? 600 : 500,
                      color: isCurrentTrack ? T.amber : T.text,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {track.title}
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTrackMenuOpen(trackMenuOpen === track.id ? null : track.id);
                  }}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: T.muted,
                    opacity: 0.6,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.6)}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <circle cx="2" cy="6" r="1.1" />
                    <circle cx="6" cy="6" r="1.1" />
                    <circle cx="10" cy="6" r="1.1" />
                  </svg>
                </button>
                {trackMenuOpen === track.id && (
                  <>
                    <div
                      onClick={() => setTrackMenuOpen(null)}
                      style={{ position: 'fixed', inset: 0, zIndex: 600 }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 28,
                        right: 4,
                        zIndex: 601,
                        background: T.s1,
                        border: `1px solid ${T.border}`,
                        borderRadius: 8,
                        overflow: 'hidden',
                        width: 160,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
                      }}
                    >
                      <button
                        onClick={() => startRenameTrack(track)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          width: '100%',
                          padding: '8px 12px',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: T.mono,
                          fontSize: 10,
                          color: T.text,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = T.s2)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <IconEdit c={T.muted} s={10} /> Renommer
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Versions */}
              {isOpen && (
                <div style={{ paddingLeft: 22, marginTop: 2 }}>
                  {track.versions.map((v) => {
                    const isCurrent = isCurrentVersion(track, v);
                    const isPlaying = isVersionPlaying(track, v);
                    const isActivePlayer =
                      playerState &&
                      playerState.trackTitle === track.title &&
                      playerState.versionName === v.name;
                    const hasAnalysis = !!v.analysisResult;
                    return (
                      <div
                        key={v.id}
                        onClick={() => {
                          if (renaming === v.id) return;
                          if (hasAnalysis) onSelectVersion(track, v);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '5px 8px',
                          borderRadius: 6,
                          background: isCurrent ? `${T.amber}15` : 'transparent',
                          border: isCurrent ? `1px solid ${T.amber}44` : '1px solid transparent',
                          cursor: hasAnalysis ? 'pointer' : 'default',
                          marginBottom: 1,
                          position: 'relative',
                          transition: 'background .15s',
                        }}
                        onMouseEnter={(e) => {
                          if (!isCurrent) e.currentTarget.style.background = T.s2;
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrent) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <button
                          onClick={(e) => togglePlayVersion(track, v, e)}
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            background: 'transparent',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            padding: 0,
                            color: isActivePlayer ? T.amber : T.muted,
                            opacity: isActivePlayer ? 1 : 0.6,
                            transition: 'opacity .15s, color .15s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
                          onMouseLeave={(e) => { e.currentTarget.style.opacity = isActivePlayer ? 1 : 0.6; }}
                        >
                          {isPlaying ? (
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                              <rect x="1" y="1" width="2" height="6" rx="0.5" />
                              <rect x="5" y="1" width="2" height="6" rx="0.5" />
                            </svg>
                          ) : (
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                              <polygon points="1,1 7,4 1,7" />
                            </svg>
                          )}
                        </button>

                        {renaming === v.id ? (
                          <input
                            value={renameVal}
                            onChange={(e) => setRenameVal(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') confirmRename(track.id);
                              if (e.key === 'Escape') setRenaming(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onBlur={() => confirmRename(track.id)}
                            autoFocus
                            style={{
                              flex: 1,
                              background: T.s2,
                              border: `1px solid ${T.amber}`,
                              borderRadius: 4,
                              padding: '2px 6px',
                              fontFamily: T.mono,
                              fontSize: 10,
                              color: T.text,
                              outline: 'none',
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              flex: 1,
                              fontFamily: T.body,
                              fontSize: 12,
                              fontWeight: v.main ? 500 : 400,
                              color: isCurrent ? T.amber : v.main ? T.amber : T.text,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              opacity: hasAnalysis ? 1 : 0.5,
                            }}
                          >
                            {v.name}
                          </span>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(menuOpen === v.id ? null : v.id);
                          }}
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 4,
                            background: 'transparent',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: T.muted,
                            opacity: 0.5,
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.5)}
                        >
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
                            <circle cx="2" cy="6" r="1.1" />
                            <circle cx="6" cy="6" r="1.1" />
                            <circle cx="10" cy="6" r="1.1" />
                          </svg>
                        </button>

                        {menuOpen === v.id && (
                          <>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpen(null);
                              }}
                              style={{ position: 'fixed', inset: 0, zIndex: 600 }}
                            />
                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                position: 'absolute',
                                top: 24,
                                right: 4,
                                zIndex: 601,
                                background: T.s1,
                                border: `1px solid ${T.border}`,
                                borderRadius: 8,
                                overflow: 'hidden',
                                width: 170,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
                              }}
                            >
                              {!v.main && (
                                <button
                                  onClick={() => setMain(track.id, v.id)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    width: '100%',
                                    padding: '8px 12px',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: `1px solid ${T.border}`,
                                    cursor: 'pointer',
                                    fontFamily: T.mono,
                                    fontSize: 10,
                                    color: T.amber,
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = T.s2)}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                  <IconStar c={T.amber} s={10} /> Passer en principale
                                </button>
                              )}
                              <button
                                onClick={() => startRename(v)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  width: '100%',
                                  padding: '8px 12px',
                                  background: 'transparent',
                                  border: 'none',
                                  borderBottom: `1px solid ${T.border}`,
                                  cursor: 'pointer',
                                  fontFamily: T.mono,
                                  fontSize: 10,
                                  color: T.text,
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = T.s2)}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                              >
                                <IconEdit c={T.muted} s={10} /> Renommer
                              </button>
                              <button
                                onClick={() => deleteV(track.id, v.id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  width: '100%',
                                  padding: '8px 12px',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontFamily: T.mono,
                                  fontSize: 10,
                                  color: T.red,
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = T.s2)}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                              >
                                <IconTrash c={T.red} s={10} /> Supprimer
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}

                  {/* + Nouvelle version */}
                  <button
                    onClick={() => onAddVersion(track)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      width: '100%',
                      padding: '5px 8px',
                      background: 'transparent',
                      border: `1px dashed ${T.border}`,
                      borderRadius: 6,
                      color: T.muted,
                      fontFamily: T.mono,
                      fontSize: 9,
                      letterSpacing: 0.5,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      marginTop: 2,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${T.amber}66`;
                      e.currentTarget.style.color = T.amber;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = T.border;
                      e.currentTarget.style.color = T.muted;
                    }}
                  >
                    <span style={{ fontSize: 12, lineHeight: 1, marginTop: -1 }}>+</span>
                    Nouvelle version
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: `1px solid ${T.border}`,
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          background: T.s1,
        }}
      >
        <button
          onClick={onGoReglages}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            padding: '8px 10px',
            background: 'transparent',
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            color: T.muted,
            fontFamily: T.mono,
            fontSize: 10,
            letterSpacing: 0.5,
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = T.muted;
            e.currentTarget.style.color = T.text;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = T.border;
            e.currentTarget.style.color = T.muted;
          }}
        >
          <IconSettings c="currentColor" s={12} />
          Réglages
        </button>
      </div>
    </aside>
  );
}
