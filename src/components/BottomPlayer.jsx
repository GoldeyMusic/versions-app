import { useState, useEffect, useRef } from 'react';

/**
 * BottomPlayer — rendu fidèle à mockup-v3.html (.player).
 * Barre fixe de 68px en bas d'écran, avec prev / play-pause / next,
 * meta (titre serif + version mono), waveform cliquable et temps.
 *
 * TODO (pending): brancher un vrai audio Supabase + WaveSurfer.
 * Pour l'instant, on simule la progression.
 */

const WAVE_BARS = 120;

const generateWaveform = () => {
  const bars = [];
  for (let i = 0; i < WAVE_BARS; i++) {
    const pos = i / WAVE_BARS;
    const envelope = Math.sin(pos * Math.PI) * 0.55 + 0.45;
    const rand = 0.35 + Math.random() * 0.65;
    bars.push(Math.min(1, rand * envelope));
  }
  return bars;
};

export default function BottomPlayer({
  trackTitle,
  versionName,
  isPlaying,
  onToggle,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  resetKey,
  idle,
}) {
  const [progress, setProgress] = useState(0);
  const [waveform] = useState(() => generateWaveform());
  const waveRef = useRef(null);
  const lastResetKey = useRef(resetKey);

  useEffect(() => {
    if (!isPlaying) return;
    const iv = setInterval(
      () => setProgress((p) => {
        if (p >= 100) { onNext && onNext(); return 0; }
        return p + 0.15;
      }),
      100
    );
    return () => clearInterval(iv);
  }, [isPlaying, onNext]);

  useEffect(() => {
    if (resetKey !== lastResetKey.current) {
      setProgress(0);
      lastResetKey.current = resetKey;
    }
  }, [resetKey]);

  const handleWaveClick = (e) => {
    if (!waveRef.current || idle) return;
    const rect = waveRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setProgress(pct);
  };

  const totalSec = 241;
  const currentSec = Math.floor((progress / 100) * totalSec);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const headIdx = Math.round((progress / 100) * WAVE_BARS);

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
              {versionName}
            </div>
          </>
        )}
      </div>

      {/* Waveform */}
      <div className="pl-wave" ref={waveRef} onClick={handleWaveClick}>
        {waveform.map((h, i) => {
          const isPast = !idle && i < headIdx;
          const isHead = !idle && i === headIdx;
          const cls = isHead ? 'bar head' : isPast ? 'bar past' : 'bar';
          return (
            <div key={i} className={cls} style={{ height: `${Math.max(10, h * 100)}%` }} />
          );
        })}
      </div>

      {/* Time */}
      <div className="pl-time">
        {idle ? (
          <span>—:— / —:—</span>
        ) : (
          <><b>{fmt(currentSec)}</b> / {fmt(totalSec)}</>
        )}
      </div>
    </div>
  );
}
