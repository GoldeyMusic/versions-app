import { useState, useEffect, useRef, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import API from '../constants/api';

/**
 * BottomPlayer — WaveSurfer-powered audio player.
 * Barre fixe en bas, style VERSIONS (ambre/noir).
 * Charge un MP3 depuis Supabase Storage via signed URL.
 */

export default function BottomPlayer({
  trackTitle,
  versionName,
  storagePath,
  isPlaying,
  onToggle,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  resetKey,
  idle,
}) {
  const containerRef = useRef(null);
  const wsRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const loadedPathRef = useRef(null);

  const fmt = (s) => {
    const sec = Math.floor(s);
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  };

  // Create / destroy WaveSurfer instance
  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#3a3a3e',
      progressColor: '#f5b056',
      cursorColor: '#f5b056',
      cursorWidth: 1,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 36,
      normalize: true,
      backend: 'WebAudio',
      interact: true,
    });

    ws.on('timeupdate', (t) => setCurrentTime(t));
    ws.on('decode', (d) => setDuration(d));
    ws.on('finish', () => {
      if (onNext) onNext();
    });
    ws.on('loading', () => setLoading(true));
    ws.on('ready', () => setLoading(false));

    wsRef.current = ws;

    return () => {
      ws.destroy();
      wsRef.current = null;
    };
  }, []);  // mount once

  // Load audio when storagePath changes
  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || !storagePath) return;
    if (storagePath === loadedPathRef.current) return;

    loadedPathRef.current = storagePath;
    setLoading(true);
    setCurrentTime(0);
    setDuration(0);

    (async () => {
      try {
        const res = await fetch(`${API}/api/audio/signed-url?path=${encodeURIComponent(storagePath)}`);
        const { url, error } = await res.json();
        if (error || !url) {
          console.error('[player] signed-url error:', error);
          setLoading(false);
          return;
        }
        ws.load(url);
      } catch (err) {
        console.error('[player] load error:', err.message);
        setLoading(false);
      }
    })();
  }, [storagePath]);

  // Reset on track change (resetKey)
  useEffect(() => {
    const ws = wsRef.current;
    if (!ws) return;
    // If storagePath changed, loading handles it already.
    // But if resetKey changed (prev/next), we might need to reload.
    loadedPathRef.current = null;
  }, [resetKey]);

  // Sync play/pause state
  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || idle || loading) return;

    try {
      if (isPlaying && !ws.isPlaying()) {
        ws.play();
      } else if (!isPlaying && ws.isPlaying()) {
        ws.pause();
      }
    } catch {}
  }, [isPlaying, idle, loading]);

  // Auto-play when ready
  useEffect(() => {
    const ws = wsRef.current;
    if (!ws) return;

    const onReady = () => {
      if (isPlaying) {
        try { ws.play(); } catch {}
      }
    };
    ws.on('ready', onReady);
    return () => ws.un('ready', onReady);
  }, [isPlaying]);

  return (
    <div className="player" style={{ position: 'relative', padding: '0 24px', flexShrink: 0 }}>
      {/* Prev */}
      <div
        className="pl-ctrl"
        onClick={hasPrev && !idle ? onPrev : undefined}
        style={{ opacity: hasPrev && !idle ? 1 : 0.25, cursor: hasPrev && !idle ? 'pointer' : 'default' }}
        aria-label="Précédent"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 3v10M13 3l-7 5 7 5V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Play / pause */}
      <div
        className="pl-btn"
        onClick={idle ? undefined : onToggle}
        style={{
          background: idle ? 'rgba(245,176,86,.25)' : '#f5b056',
          cursor: idle ? 'default' : 'pointer',
        }}
        aria-label={isPlaying ? 'Pause' : 'Lecture'}
      >
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="3" y="2" width="3" height="10" fill="currentColor" />
            <rect x="8" y="2" width="3" height="10" fill="currentColor" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4 2l8 5-8 5V2z" fill="currentColor" />
          </svg>
        )}
      </div>

      {/* Next */}
      <div
        className="pl-ctrl"
        onClick={hasNext && !idle ? onNext : undefined}
        style={{ opacity: hasNext && !idle ? 1 : 0.25, cursor: hasNext && !idle ? 'pointer' : 'default' }}
        aria-label="Suivant"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M12 3v10M3 3l7 5-7 5V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Meta */}
      <div className="pl-meta">
        {idle ? (
          <>
            <div className="pl-title" style={{ color: '#7c7c80' }}>Aucune lecture</div>
            <div className="pl-sub">—</div>
          </>
        ) : (
          <>
            <div className="pl-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {trackTitle}
            </div>
            <div className="pl-sub" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {versionName}{loading ? ' · chargement…' : ''}
            </div>
          </>
        )}
      </div>

      {/* WaveSurfer container */}
      <div
        className="pl-wave"
        ref={containerRef}
        style={{
          flex: 1,
          minWidth: 0,
          height: 36,
          opacity: idle ? 0.25 : 1,
          cursor: idle ? 'default' : 'pointer',
        }}
      />

      {/* Time */}
      <div className="pl-time">
        {idle || !duration ? (
          <span>—:— / —:—</span>
        ) : (
          <><b>{fmt(currentTime)}</b> / {fmt(duration)}</>
        )}
      </div>
    </div>
  );
}
