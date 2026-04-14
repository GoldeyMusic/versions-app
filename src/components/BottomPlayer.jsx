import { useState, useEffect, useRef } from 'react';
import T from '../constants/theme';
import { IconPlay, IconPause, IconSkipNext, IconSkipPrev } from './Icons';

const WAVE_BARS = 80;

const generateWaveform = () => {
  const bars = [];
  for (let i = 0; i < WAVE_BARS; i++) {
    const pos = i / WAVE_BARS;
    const envelope = Math.sin(pos * Math.PI) * 0.6 + 0.4;
    const rand = 0.3 + Math.random() * 0.7;
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
      () =>
        setProgress((p) => {
          if (p >= 100) {
            onNext && onNext();
            return 0;
          }
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

  return (
    <div
      style={{
        background: 'rgba(16,16,16,0.98)',
        backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${T.border}`,
        padding: '6px 14px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        height: 48,
        boxSizing: 'border-box',
      }}
    >
      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <button
          onClick={onPrev}
          disabled={!hasPrev || idle}
          style={{
            width: 24, height: 24, borderRadius: '50%',
            background: 'transparent', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: hasPrev && !idle ? 'pointer' : 'default',
            opacity: hasPrev && !idle ? 0.7 : 0.2,
            transition: 'opacity .2s',
          }}
          onMouseEnter={(e) => { if (hasPrev && !idle) e.currentTarget.style.opacity = 1; }}
          onMouseLeave={(e) => { if (hasPrev && !idle) e.currentTarget.style.opacity = 0.7; }}
        >
          <IconSkipPrev c={T.text} s={12} />
        </button>
        <button
          onClick={idle ? undefined : onToggle}
          style={{
            width: 30, height: 30, borderRadius: '50%',
            background: idle ? T.s3 : T.amber,
            border: `1px solid ${idle ? T.border : T.amber}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: idle ? 'default' : 'pointer',
            boxShadow: idle ? 'none' : `0 0 14px ${T.amber}33`,
            transition: 'transform .1s',
            padding: 0,
          }}
          onMouseDown={(e) => { if (!idle) e.currentTarget.style.transform = 'scale(0.93)'; }}
          onMouseUp={(e) => { if (!idle) e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {isPlaying ? (
            <IconPause c={T.black} s={12} />
          ) : (
            <IconPlay c={idle ? T.muted : T.black} s={12} />
          )}
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext || idle}
          style={{
            width: 24, height: 24, borderRadius: '50%',
            background: 'transparent', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: hasNext && !idle ? 'pointer' : 'default',
            opacity: hasNext && !idle ? 0.7 : 0.2,
            transition: 'opacity .2s',
          }}
          onMouseEnter={(e) => { if (hasNext && !idle) e.currentTarget.style.opacity = 1; }}
          onMouseLeave={(e) => { if (hasNext && !idle) e.currentTarget.style.opacity = 0.7; }}
        >
          <IconSkipNext c={T.text} s={12} />
        </button>
      </div>

      {/* Info (title + version) */}
      <div style={{ minWidth: 120, maxWidth: 200, flexShrink: 0 }}>
        {idle ? (
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Aucune lecture
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
            <span
              style={{
                fontFamily: T.body, fontSize: 11, fontWeight: 600, color: T.text,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                flexShrink: 1, minWidth: 0,
              }}
            >
              {trackTitle}
            </span>
            <span
              style={{
                fontFamily: T.mono, fontSize: 9, color: T.amber,
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {versionName}
            </span>
          </div>
        )}
      </div>

      {/* Waveform (fills remaining space) */}
      <div
        ref={waveRef}
        onClick={handleWaveClick}
        style={{
          flex: 1,
          height: 26,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: idle ? 'default' : 'pointer',
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {waveform.map((h, i) => {
          const barPct = (i / WAVE_BARS) * 100;
          const isPast = !idle && barPct < progress;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${Math.max(12, h * 100)}%`,
                minHeight: 2,
                background: isPast ? T.amber : idle ? `${T.muted2}55` : `${T.muted2}`,
                borderRadius: 1,
                transition: 'background .05s',
              }}
            />
          );
        })}
        {!idle && (
          <div
            style={{
              position: 'absolute',
              left: `${progress}%`,
              top: 0,
              bottom: 0,
              width: 2,
              background: T.text,
              borderRadius: 1,
              boxShadow: `0 0 4px ${T.amber}88`,
              transform: 'translateX(-1px)',
              transition: 'left .1s linear',
            }}
          />
        )}
      </div>

      {/* Time */}
      {!idle && (
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, flexShrink: 0, minWidth: 70, textAlign: 'right' }}>
          {fmt(currentSec)} / {fmt(totalSec)}
        </div>
      )}
    </div>
  );
}
