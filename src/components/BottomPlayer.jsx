import { useState, useEffect, useRef } from 'react';
import T from '../constants/theme';
import { IconPlay, IconPause, IconSkipNext, IconSkipPrev } from './Icons';

const WAVE_BARS = 80;

const generateWaveform = () => {
  const bars = [];
  for (let i = 0; i < WAVE_BARS; i++) {
    // Simulate a realistic waveform shape: louder in the middle
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
    if (!isPlaying) {
      return;
    }
    const iv = setInterval(() =>
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

  // Reset progress only when resetKey changes (new song), not on version switch within same track
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

  const totalSec = 241; // 4:01
  const currentSec = Math.floor((progress / 100) * totalSec);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div
      style={{
        background: 'rgba(16,16,16,0.98)',
        backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${T.border}`,
        padding: '10px 16px 8px',
        flexShrink: 0,
      }}
    >
      {/* Track info row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <button
            onClick={onPrev}
            disabled={!hasPrev || idle}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: hasPrev && !idle ? 'pointer' : 'default',
              opacity: hasPrev && !idle ? 0.7 : 0.2,
              transition: 'opacity .2s',
            }}
            onMouseEnter={(e) => {
              if (hasPrev && !idle) e.currentTarget.style.opacity = 1;
            }}
            onMouseLeave={(e) => {
              if (hasPrev && !idle) e.currentTarget.style.opacity = 0.7;
            }}
          >
            <IconSkipPrev c={T.text} s={14} />
          </button>
          <button
            onClick={idle ? undefined : onToggle}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: idle ? T.s3 : T.amber,
              border: `1px solid ${idle ? T.border : T.amber}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: idle ? 'default' : 'pointer',
              boxShadow: idle ? 'none' : `0 0 20px ${T.amber}33`,
              transition: 'transform .1s',
            }}
            onMouseDown={(e) => {
              if (!idle) e.currentTarget.style.transform = 'scale(0.93)';
            }}
            onMouseUp={(e) => {
              if (!idle) e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isPlaying ? (
              <IconPause c={T.black} s={14} />
            ) : (
              <IconPlay c={idle ? T.muted : T.black} s={14} />
            )}
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext || idle}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: hasNext && !idle ? 'pointer' : 'default',
              opacity: hasNext && !idle ? 0.7 : 0.2,
              transition: 'opacity .2s',
            }}
            onMouseEnter={(e) => {
              if (hasNext && !idle) e.currentTarget.style.opacity = 1;
            }}
            onMouseLeave={(e) => {
              if (hasNext && !idle) e.currentTarget.style.opacity = 0.7;
            }}
          >
            <IconSkipNext c={T.text} s={14} />
          </button>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {idle ? (
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>
              Sélectionnez un titre pour l'écouter
            </div>
          ) : (
            <>
              <div
                style={{
                  fontFamily: T.body,
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {trackTitle}
              </div>
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: 10,
                  color: T.amber,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {versionName}
              </div>
            </>
          )}
        </div>

        {/* Time */}
        {!idle && (
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, flexShrink: 0 }}>
            {fmt(currentSec)} / {fmt(totalSec)}
          </div>
        )}
      </div>

      {/* Waveform */}
      <div
        ref={waveRef}
        onClick={handleWaveClick}
        style={{
          height: 32,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          cursor: idle ? 'default' : 'pointer',
          position: 'relative',
          borderRadius: 4,
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
                height: `${h * 100}%`,
                minHeight: 2,
                background: isPast ? T.amber : idle ? `${T.muted2}55` : `${T.muted2}`,
                borderRadius: 1,
                transition: 'background .05s',
              }}
            />
          );
        })}
        {/* Playhead line */}
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
              boxShadow: `0 0 6px ${T.amber}88`,
              transform: 'translateX(-1px)',
              transition: 'left .1s linear',
            }}
          />
        )}
      </div>
    </div>
  );
}
