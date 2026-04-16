import { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import API from '../constants/api';

/**
 * BottomPlayer — WaveSurfer + HTMLMediaElement pool.
 * Pre-loads audio blobs for each version so A/B switching is seamless.
 * WaveSurfer uses `media` option → no WebAudio decode latency on switch.
 */

// ── Module-level caches (survive re-renders & remounts) ─────
const urlCache = new Map();   // storagePath → signedUrl
const blobUrlCache = new Map(); // storagePath → blobObjectUrl
const audioPool = new Map();  // storagePath → HTMLAudioElement (preloaded)

async function resolveAudio(storagePath) {
  // Already in pool?
  if (audioPool.has(storagePath)) return audioPool.get(storagePath);

  // Resolve signed URL
  let signedUrl = urlCache.get(storagePath);
  if (!signedUrl) {
    const res = await fetch(`${API}/api/audio/signed-url?path=${encodeURIComponent(storagePath)}`);
    const { url, error } = await res.json();
    if (error || !url) throw new Error(error || 'no url');
    signedUrl = url;
    urlCache.set(storagePath, url);
  }

  // Download blob & create Object URL
  let blobUrl = blobUrlCache.get(storagePath);
  if (!blobUrl) {
    const audioRes = await fetch(signedUrl);
    const blob = await audioRes.blob();
    blobUrl = URL.createObjectURL(blob);
    blobUrlCache.set(storagePath, blobUrl);
  }

  // Create & pre-load audio element
  const audio = new Audio(blobUrl);
  audio.preload = 'auto';
  audio.load();
  audioPool.set(storagePath, audio);

  // Wait until browser has enough data to play
  await new Promise((resolve) => {
    if (audio.readyState >= 3) return resolve();
    audio.addEventListener('canplay', resolve, { once: true });
    audio.addEventListener('error', resolve, { once: true });
  });

  return audio;
}

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
  const activeAudioRef = useRef(null);
  const activePathRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);

  const fmt = (s) => {
    const sec = Math.floor(s);
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  };

  // ── Switch audio source ───────────────────────────────────
  useEffect(() => {
    if (!storagePath || !containerRef.current) return;
    // Avoid reloading same path unless resetKey forced it
    if (storagePath === activePathRef.current && wsRef.current) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const audio = await resolveAudio(storagePath);
        if (cancelled) return;

        activePathRef.current = storagePath;

        // Capture current playback position & playing state
        const prev = activeAudioRef.current;
        const prevTime = prev ? prev.currentTime : 0;
        const wasPlaying = prev ? !prev.paused : isPlaying;

        // Start new audio IMMEDIATELY (seamless switch)
        audio.currentTime = prevTime;
        if (wasPlaying) {
          try { await audio.play(); } catch {}
        }

        // Now stop the old one (new is already playing)
        if (prev && prev !== audio) {
          prev.pause();
        }
        activeAudioRef.current = audio;

        // Update WaveSurfer visualization (async, audio already plays)
        if (wsRef.current) {
          wsRef.current.destroy();
          wsRef.current = null;
        }

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
          interact: true,
          media: audio,
        });

        ws.on('timeupdate', (t) => setCurrentTime(t));
        ws.on('decode', (d) => setDuration(d));
        ws.on('finish', () => { if (onNext) onNext(); });
        ws.on('ready', () => {
          setLoading(false);
          // Audio already playing via audio.play() above — no need to call ws.play()
        });

        wsRef.current = ws;
      } catch (err) {
        console.error('[player] load error:', err.message);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [storagePath, resetKey]);

  // ── Sync play/pause ───────────────────────────────────────
  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || idle || loading) return;
    try {
      if (isPlaying && !ws.isPlaying()) ws.play();
      else if (!isPlaying && ws.isPlaying()) ws.pause();
    } catch {}
  }, [isPlaying, idle, loading]);

  // ── Cleanup on unmount ────────────────────────────────────
  useEffect(() => {
    return () => {
      if (wsRef.current) { wsRef.current.destroy(); wsRef.current = null; }
      if (activeAudioRef.current) { activeAudioRef.current.pause(); }
    };
  }, []);

  return (
    <div className="player">
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
        ref={containerRef}
        style={{
          flex: 1,
          minWidth: 0,
          height: 36,
          opacity: idle ? 0.25 : 1,
          cursor: idle ? 'default' : 'pointer',
          display: 'block',
          overflow: 'hidden',
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
