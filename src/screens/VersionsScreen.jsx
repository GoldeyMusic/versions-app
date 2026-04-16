import { useState, useEffect } from 'react';
import { loadTracks } from '../lib/storage';

/* ═══════════════════════════════════════════════════════════ */
/* MES TITRES — page mobile stylisée                          */
/* ═══════════════════════════════════════════════════════════ */
export default function VersionsScreen({
  onViewAnalysis,
  onAddVersion,
  autoSelectTrackTitle,
  onAutoSelectConsumed,
  onPlay,
  onStop,
  onToggle,
  playerState,
}) {
  const [tracks, setTracks] = useState([]);
  const [openTrackId, setOpenTrackId] = useState(null);

  useEffect(() => {
    loadTracks().then((t) => {
      setTracks(t);
      // Auto-open a track if requested
      if (autoSelectTrackTitle) {
        const found = t.find((tr) => tr.title === autoSelectTrackTitle);
        if (found) setOpenTrackId(found.id);
        if (onAutoSelectConsumed) onAutoSelectConsumed();
      }
    });
  }, []);

  const scoreColor = (s) =>
    typeof s !== 'number' ? 'var(--muted)' : s < 50 ? 'var(--red)' : s < 75 ? 'var(--amber)' : 'var(--green)';

  const toggleTrack = (id) => setOpenTrackId(openTrackId === id ? null : id);

  return (
    <div className="versions-screen">
      {/* Header */}
      <div className="versions-s-header">
        <div className="versions-s-title">MES TITRES</div>
        <div className="versions-s-tagline">
          {tracks.length} titre{tracks.length > 1 ? 's' : ''} <span className="versions-s-tagline-dot">·</span> {tracks.reduce((s, t) => s + (t.versions?.length || 0), 0)} version{tracks.reduce((s, t) => s + (t.versions?.length || 0), 0) > 1 ? 's' : ''}
        </div>
      </div>

      {/* Track list */}
      {tracks.length === 0 ? (
        <div className="versions-s-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--muted2)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          <div>Aucun titre pour le moment</div>
          <div style={{ fontSize: 12, color: 'var(--muted2)' }}>Lance ta première analyse pour commencer</div>
        </div>
      ) : (
        <div className="versions-s-list">
          {tracks.map((track) => {
            const isOpen = openTrackId === track.id;
            const versions = track.versions || [];
            const latestScore = versions.length > 0
              ? versions[versions.length - 1]?.analysisResult?.fiche?.globalScore
              : null;

            return (
              <div key={track.id} className={`versions-s-card${isOpen ? ' open' : ''}`}>
                {/* Track header */}
                <div className="versions-s-card-head" onClick={() => toggleTrack(track.id)}>
                  <div className="versions-s-card-score" style={{
                    borderColor: scoreColor(latestScore),
                    color: scoreColor(latestScore),
                  }}>
                    {typeof latestScore === 'number' ? latestScore : '—'}
                  </div>
                  <div className="versions-s-card-info">
                    <div className="versions-s-card-title">{track.title}</div>
                    <div className="versions-s-card-meta">
                      {versions.length} version{versions.length > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="versions-s-card-chev">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}>
                      <path d="M5 3l4 4-4 4" />
                    </svg>
                  </div>
                </div>

                {/* Versions list (expanded) */}
                {isOpen && (
                  <div className="versions-s-card-body">
                    {versions.map((v, i) => {
                      const score = v.analysisResult?.fiche?.globalScore;
                      // Matching souple : par storagePath OU par titre+version
                      const pathMatch = v.storagePath && playerState?.storagePath && v.storagePath === playerState.storagePath;
                      const nameMatch = playerState?.trackTitle === track.title && playerState?.versionName === v.name;
                      const isThisVersion = pathMatch || nameMatch;
                      const isPlaying = isThisVersion && !!playerState?.isPlaying;

                      return (
                        <div key={v.id} className="versions-s-version">
                          {/* Top row: score + name + play */}
                          <div className="versions-s-version-row">
                            <div className="versions-s-version-badge" style={{ color: scoreColor(score) }}>
                              {typeof score === 'number' ? score : '—'}
                            </div>
                            <div className="versions-s-version-info">
                              <div className="versions-s-version-name">{v.name}</div>
                              {v.date && <div className="versions-s-version-date">{v.date}</div>}
                            </div>
                            {v.storagePath && (
                              <button
                                className={`versions-s-btn-icon${isPlaying ? ' playing' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isPlaying) { if (onToggle) onToggle(); else onStop(); }
                                  else { onPlay(track.title, v.name, v.storagePath); }
                                }}
                                title={isPlaying ? 'Stop' : 'Écouter'}
                              >
                                {isPlaying ? (
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="2" width="3" height="10" rx="1"/><rect x="8" y="2" width="3" height="10" rx="1"/></svg>
                                ) : (
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1.5v11l9-5.5z"/></svg>
                                )}
                              </button>
                            )}
                          </div>
                          {/* CTA fiche — full width */}
                          {v.analysisResult?.fiche && (
                            <button
                              className="versions-s-btn-fiche"
                              onClick={(e) => { e.stopPropagation(); onViewAnalysis(track, v); }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                              Voir la fiche d'analyse
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 2.5l4 3.5-4 3.5"/></svg>
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Add version */}
                    <button className="versions-s-add" onClick={() => onAddVersion(track)}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M7 3v8M3 7h8"/></svg>
                      Ajouter une version
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
