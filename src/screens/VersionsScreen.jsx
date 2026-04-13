import { useState, useEffect } from 'react';
import T from '../constants/theme';
import {
  IconStar,
  IconDrag,
  IconTrash,
  IconEdit,
  IconEye,
  IconPlay,
  IconPause,
} from '../components/Icons';
import {
  loadTracks,
  saveTracks,
  deleteVersion as storageDeleteVersion,
  renameVersion as storageRenameVersion,
  renameTrack as storageRenameTrack,
  setMainVersion as storageSetMain,
  reorderVersions as storageReorder,
} from '../lib/storage';

export default function VersionsScreen({ onViewAnalysis, onPlay, onStop, playerState }) {
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [renameVal, setRenameVal] = useState('');
  const [renamingTrack, setRenamingTrack] = useState(false);
  const [trackRenameVal, setTrackRenameVal] = useState('');
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  // Load tracks from localStorage on mount
  useEffect(() => {
    setTracks(loadTracks());
  }, []);

  const currentTrack = selectedTrack ? tracks.find((t) => t.id === selectedTrack) : null;

  // Build playlist for Level 1: each track's main version
  const buildTrackPlaylist = (startTrackId) => {
    const playlist = tracks.map((t) => {
      const main = t.versions.find((v) => v.main) || t.versions[0];
      return { trackTitle: t.title, versionName: main.name };
    });
    const idx = tracks.findIndex((t) => t.id === startTrackId);
    return { playlist, idx: idx >= 0 ? idx : 0 };
  };

  // Build playlist for Level 2: all versions of a track
  const buildVersionPlaylist = (track, startVersionId) => {
    const playlist = track.versions.map((v) => ({ trackTitle: track.title, versionName: v.name }));
    const idx = track.versions.findIndex((v) => v.id === startVersionId);
    return { playlist, idx: idx >= 0 ? idx : 0 };
  };

  const playTrack = (trackId) => {
    const { playlist, idx } = buildTrackPlaylist(trackId);
    onPlay(playlist[idx].trackTitle, playlist[idx].versionName, playlist, idx, false);
  };

  const playVersion = (track, versionId) => {
    const { playlist, idx } = buildVersionPlaylist(track, versionId);
    onPlay(playlist[idx].trackTitle, playlist[idx].versionName, playlist, idx, true);
  };

  const enterTrackVersions = (trackId) => {
    const track = tracks.find((t) => t.id === trackId);
    if (playerState && playerState.trackTitle !== track.title) {
      onStop();
    } else if (playerState && playerState.isPlaying && playerState.trackTitle === track.title) {
      const currentVersion = track.versions.find((v) => v.name === playerState.versionName);
      if (currentVersion) {
        const { playlist, idx } = buildVersionPlaylist(track, currentVersion.id);
        onPlay(playlist[idx].trackTitle, playlist[idx].versionName, playlist, idx, true);
      }
    }
    setSelectedTrack(trackId);
  };

  const exitToTrackList = () => {
    if (playerState && playerState.isPlaying) {
      const playingTrack = tracks.find((t) => t.title === playerState.trackTitle);
      if (playingTrack) {
        const { playlist, idx } = buildTrackPlaylist(playingTrack.id);
        onPlay(playlist[idx].trackTitle, playlist[idx].versionName, playlist, idx, true);
      }
    }
    setSelectedTrack(null);
    setRenamingTrack(false);
  };

  const isVersionPlaying = (trackTitle, versionName) =>
    playerState?.isPlaying &&
    playerState.trackTitle === trackTitle &&
    playerState.versionName === versionName;

  const isTrackActive = (trackTitle) => playerState && playerState.trackTitle === trackTitle;

  const deleteVersion = (trackId, versionId) => {
    const updated = storageDeleteVersion(trackId, versionId);
    setTracks(updated);
    // If current track was deleted entirely, go back
    if (!updated.find(t => t.id === trackId)) {
      setSelectedTrack(null);
    }
    setMenuOpen(null);
  };

  const startRename = (v) => {
    setRenaming(v.id);
    setRenameVal(v.name);
    setMenuOpen(null);
  };

  const confirmRename = (trackId) => {
    if (!renameVal.trim()) return;
    const updated = storageRenameVersion(trackId, renaming, renameVal);
    setTracks(updated);
    setRenaming(null);
  };

  const setMainVersion = (trackId, versionId) => {
    const updated = storageSetMain(trackId, versionId);
    setTracks(updated);
  };

  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };
  const handleDrop = (trackId, idx) => {
    if (dragIdx === null || dragIdx === idx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    const updated = storageReorder(trackId, dragIdx, idx);
    setTracks(updated);
    setDragIdx(null);
    setDragOverIdx(null);
  };

  /* ── EMPTY STATE ── */
  if (tracks.length === 0) {
    return (
      <div style={{
        width: '100%', minHeight: '100%', display: 'grid', placeItems: 'center',
        padding: '40px 30px', boxSizing: 'border-box', animation: 'fadeup .3s ease',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: T.amberGlow,
            border: `1px solid ${T.amber}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18V5l12-2v13" stroke={T.amber} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="18" r="3" stroke={T.amber} strokeWidth="1.5"/>
              <circle cx="18" cy="16" r="3" stroke={T.amber} strokeWidth="1.5"/>
            </svg>
          </div>
          <div style={{ fontFamily: T.display, fontSize: 28, letterSpacing: 4, color: T.amber }}>MES TITRES</div>
          <div style={{ fontFamily: T.body, fontWeight: 300, fontSize: 12, color: T.muted, textAlign: 'center', lineHeight: 1.6, maxWidth: 260 }}>
            Aucune analyse pour le moment. Lance une analyse depuis l'accueil pour retrouver tes titres ici.
          </div>
        </div>
      </div>
    );
  }

  /* ── LEVEL 2: versions of a track ── */
  if (currentTrack) {
    return (
      <div
        style={{
          padding: '20px 16px 30px',
          maxWidth: 680,
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          animation: 'fadeup .3s ease',
        }}
      >
        {/* Back + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button
            onClick={exitToTrackList}
            style={{
              background: T.s2,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: T.muted,
              flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            {renamingTrack ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  value={trackRenameVal}
                  onChange={(e) => setTrackRenameVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && trackRenameVal.trim()) {
                      const updated = storageRenameTrack(selectedTrack, trackRenameVal);
                      setTracks(updated);
                      setRenamingTrack(false);
                    }
                  }}
                  autoFocus
                  style={{
                    flex: 1,
                    background: T.s2,
                    border: `1px solid ${T.amber}`,
                    borderRadius: 8,
                    padding: '6px 10px',
                    fontFamily: T.display,
                    fontSize: 20,
                    letterSpacing: 2,
                    color: T.text,
                    outline: 'none',
                  }}
                />
                <button
                  onClick={() => {
                    if (trackRenameVal.trim()) {
                      const updated = storageRenameTrack(selectedTrack, trackRenameVal);
                      setTracks(updated);
                      setRenamingTrack(false);
                    }
                  }}
                  style={{
                    fontFamily: T.mono,
                    fontSize: 10,
                    color: T.amber,
                    background: 'transparent',
                    border: `1px solid ${T.amber}44`,
                    borderRadius: 6,
                    padding: '5px 12px',
                    cursor: 'pointer',
                  }}
                >
                  OK
                </button>
                <button
                  onClick={() => setRenamingTrack(false)}
                  style={{
                    fontFamily: T.mono,
                    fontSize: 10,
                    color: T.muted,
                    background: 'transparent',
                    border: `1px solid ${T.border}`,
                    borderRadius: 6,
                    padding: '5px 10px',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2
                  style={{
                    fontFamily: T.display,
                    fontSize: 24,
                    letterSpacing: 3,
                    color: T.text,
                    lineHeight: 1,
                  }}
                >
                  {currentTrack.title}
                </h2>
                <button
                  onClick={() => {
                    setRenamingTrack(true);
                    setTrackRenameVal(currentTrack.title);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    opacity: 0.5,
                    transition: 'opacity .2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.5)}
                >
                  <IconEdit c={T.muted} s={13} />
                </button>
              </div>
            )}
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 2 }}>
              {currentTrack.versions.length} version
              {currentTrack.versions.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Hint */}
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted2, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconDrag /> Glisser une version vers le haut pour la passer en principale
        </div>

        {/* Versions list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {currentTrack.versions.map((v, idx) => {
            const isMain = v.main;
            const isPlaying = isVersionPlaying(currentTrack.title, v.name);
            const isActive = playerState && playerState.trackTitle === currentTrack.title && playerState.versionName === v.name;
            const isDragOver = dragOverIdx === idx && dragIdx !== idx;
            const hasAnalysis = !!v.analysisResult;
            return (
              <div
                key={v.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={() => {
                  setDragIdx(null);
                  setDragOverIdx(null);
                }}
                onDrop={() => handleDrop(currentTrack.id, idx)}
                onClick={() => {
                  if (!renaming) playVersion(currentTrack, v.id);
                }}
                style={{
                  background: isActive ? T.amberGlow : isMain ? `${T.amber}08` : T.s1,
                  border: `1px solid ${
                    isDragOver ? T.amber : isActive ? T.amber + '66' : isMain ? T.amber + '22' : T.border
                  }`,
                  borderTop: isDragOver
                    ? `2px solid ${T.amber}`
                    : `1px solid ${isDragOver ? T.amber : isActive ? T.amber + '66' : isMain ? T.amber + '22' : T.border}`,
                  borderRadius: 10,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all .15s',
                  opacity: dragIdx === idx ? 0.4 : 1,
                }}
              >
                {/* Main row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{ flexShrink: 0, cursor: 'grab', padding: '4px 2px', touchAction: 'none' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconDrag c={isMain ? T.amber : T.muted2} />
                  </div>

                  {/* Playing indicator or version icon */}
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: isActive ? T.amber : T.s2,
                      border: `1px solid ${isActive ? T.amber : T.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isPlaying ? (
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 12 }}>
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            style={{
                              width: 2,
                              borderRadius: 1,
                              background: T.black,
                              animation: `barrise 0.${4 + i * 2}s ease infinite alternate`,
                              height: `${6 + i * 3}px`,
                            }}
                          />
                        ))}
                      </div>
                    ) : isActive ? (
                      <IconPause c={T.black} s={12} />
                    ) : (
                      <IconPlay c={isMain ? T.amber : T.muted} s={12} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {renaming === v.id ? (
                      <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                        <input
                          value={renameVal}
                          onChange={(e) => setRenameVal(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && confirmRename(currentTrack.id)}
                          autoFocus
                          style={{
                            flex: 1,
                            background: T.s2,
                            border: `1px solid ${T.amber}`,
                            borderRadius: 6,
                            padding: '4px 8px',
                            fontFamily: T.mono,
                            fontSize: 11,
                            color: T.text,
                            outline: 'none',
                          }}
                        />
                        <button
                          onClick={() => confirmRename(currentTrack.id)}
                          style={{
                            fontFamily: T.mono,
                            fontSize: 10,
                            color: T.amber,
                            background: 'transparent',
                            border: `1px solid ${T.amber}44`,
                            borderRadius: 6,
                            padding: '4px 10px',
                            cursor: 'pointer',
                          }}
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {isMain && <IconStar c={T.amber} s={12} filled />}
                          <span
                            style={{
                              fontFamily: T.body,
                              fontSize: 12,
                              fontWeight: isMain ? 600 : 400,
                              color: isActive ? T.amber : isMain ? T.amber : T.text,
                            }}
                          >
                            {v.name}
                          </span>
                          {isMain && (
                            <span
                              style={{
                                fontFamily: T.mono,
                                fontSize: 8,
                                color: T.amber,
                                background: `${T.amber}15`,
                                border: `1px solid ${T.amber}33`,
                                borderRadius: 4,
                                padding: '1px 5px',
                                letterSpacing: 0.5,
                              }}
                            >
                              PRINCIPALE
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
                          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>{v.date}</span>
                          {v.lufs && <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>LUFS {v.lufs}</span>}
                          {v.bpm && <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>{v.bpm} BPM</span>}
                          {v.key && <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>{v.key}</span>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, position: 'relative' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {hasAnalysis && (
                      <button
                        onClick={() => onViewAnalysis && onViewAnalysis(currentTrack, v)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '5px 10px',
                          borderRadius: 6,
                          background: T.amberGlow,
                          border: `1px solid ${T.amber}33`,
                          cursor: 'pointer',
                          fontFamily: T.mono,
                          fontSize: 9,
                          color: T.amber,
                          letterSpacing: 0.3,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `${T.amber}30`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = T.amberGlow;
                        }}
                      >
                        <IconEye c={T.amber} s={11} /> Analyse
                      </button>
                    )}
                    <button
                      onClick={() => setMenuOpen(menuOpen === v.id ? null : v.id)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: 'transparent',
                        border: `1px solid ${T.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: T.muted,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = T.muted;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = T.border;
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="currentColor"
                      >
                        <circle cx="2" cy="6" r="1.2" />
                        <circle cx="6" cy="6" r="1.2" />
                        <circle cx="10" cy="6" r="1.2" />
                      </svg>
                    </button>
                    {menuOpen === v.id && (
                      <>
                        <div onClick={() => setMenuOpen(null)} style={{ position: 'fixed', inset: 0, zIndex: 600 }} />
                        <div
                          style={{
                            position: 'absolute',
                            top: 34,
                            right: 0,
                            zIndex: 601,
                            background: T.s1,
                            border: `1px solid ${T.border}`,
                            borderRadius: 10,
                            overflow: 'hidden',
                            width: 180,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
                            animation: 'fadeup .1s ease',
                          }}
                        >
                          {!isMain && (
                            <button
                              onClick={() => {
                                setMainVersion(currentTrack.id, v.id);
                                setMenuOpen(null);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                width: '100%',
                                padding: '10px 14px',
                                background: 'transparent',
                                border: `1px solid ${T.border}`,
                                borderBottom: `1px solid ${T.border}`,
                                cursor: 'pointer',
                                fontFamily: T.mono,
                                fontSize: 11,
                                color: T.amber,
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = T.s2)}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                              <IconStar c={T.amber} s={12} /> Passer en principale
                            </button>
                          )}
                          <button
                            onClick={() => startRename(v)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              width: '100%',
                              padding: '10px 14px',
                              background: 'transparent',
                              border: `1px solid ${T.border}`,
                              borderBottom: `1px solid ${T.border}`,
                              cursor: 'pointer',
                              fontFamily: T.mono,
                              fontSize: 11,
                              color: T.text,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = T.s2)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            <IconEdit c={T.muted} s={12} /> Renommer
                          </button>
                          <button
                            onClick={() => deleteVersion(currentTrack.id, v.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              width: '100%',
                              padding: '10px 14px',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              fontFamily: T.mono,
                              fontSize: 11,
                              color: T.red,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = T.s2)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            <IconTrash c={T.red} s={12} /> Supprimer
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── LEVEL 1: all tracks ── */
  return (
    <div
      style={{
        padding: '20px 16px 30px',
        maxWidth: 680,
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        animation: 'fadeup .3s ease',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <h2
          style={{
            fontFamily: T.display,
            fontSize: 28,
            letterSpacing: 4,
            color: T.text,
            marginBottom: 4,
          }}
        >
          MES TITRES
        </h2>
        <div style={{ fontFamily: T.body, fontWeight: 300, fontSize: 12, color: T.muted }}>
          {tracks.length} titre{tracks.length > 1 ? 's' : ''} · {tracks.reduce((a, t) => a + t.versions.length, 0)} versions
        </div>
      </div>

      {/* Track list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tracks.map((track) => {
          const mainVersion = track.versions.find((v) => v.main) || track.versions[0];
          const active = isTrackActive(track.title);
          const playing = isVersionPlaying(track.title, mainVersion.name);
          return (
            <div
              key={track.id}
              onClick={() => enterTrackVersions(track.id)}
              style={{
                background: active ? T.amberGlow : T.s1,
                border: `1px solid ${active ? T.amber + '44' : T.border}`,
                borderRadius: 12,
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'all .2s',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.borderColor = T.muted;
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.borderColor = T.border;
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Playing indicator */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: active ? T.amber : T.s2,
                    border: `1px solid ${active ? T.amber : T.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {playing ? (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 14 }}>
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          style={{
                            width: 2.5,
                            borderRadius: 1,
                            background: T.black,
                            animation: `barrise 0.${4 + i * 2}s ease infinite alternate`,
                            height: `${7 + i * 3}px`,
                          }}
                        />
                      ))}
                    </div>
                  ) : active ? (
                    <IconPause c={T.black} s={14} />
                  ) : (
                    <IconPlay c={T.muted} s={14} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: T.body,
                      fontSize: 13,
                      fontWeight: 600,
                      color: active ? T.amber : T.text,
                      marginBottom: 2,
                    }}
                  >
                    {track.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IconStar c={T.amber} s={10} filled />
                    <span style={{ fontFamily: T.mono, fontSize: 10, color: T.amber }}>
                      {mainVersion.name}
                    </span>
                    <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>
                      · {track.versions.length} version{track.versions.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    {mainVersion.bpm && <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>{mainVersion.bpm} BPM</span>}
                    {mainVersion.lufs && <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>LUFS {mainVersion.lufs}</span>}
                    {mainVersion.key && <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>{mainVersion.key}</span>}
                  </div>
                </div>

                {/* Arrow */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: T.muted,
                    flexShrink: 0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
