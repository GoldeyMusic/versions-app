import { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import API from '../constants/api';
import useLang from '../hooks/useLang';

/**
 * BottomPlayer — WaveSurfer + HTMLMediaElement pool.
 * Pre-loads audio blobs for each version so A/B switching is seamless.
 * WaveSurfer uses `media` option → no WebAudio decode latency on switch.
 */

// ── Module-level caches (survive re-renders & remounts) ─────
const urlCache = new Map();   // storagePath → signedUrl
const blobUrlCache = new Map(); // storagePath → blobObjectUrl
const audioPool = new Map();  // storagePath → HTMLAudioElement (preloaded)

// ── Volume global (partagé entre BottomPlayer + HeroWaveform + autres) ─
// Persisté dans localStorage, appliqué à tous les audios du pool et à ceux
// créés ensuite. Store custom minimal (listeners + setter).
const volumeStore = {
  value: (() => {
    try {
      const raw = parseFloat(localStorage.getItem('versions_volume'));
      return Number.isFinite(raw) && raw >= 0 && raw <= 1 ? raw : 1;
    } catch { return 1; }
  })(),
  listeners: new Set(),
};
export function getVolume() { return volumeStore.value; }
export function setGlobalVolume(v) {
  const clamped = Math.max(0, Math.min(1, Number(v) || 0));
  volumeStore.value = clamped;
  try { localStorage.setItem('versions_volume', String(clamped)); } catch {}
  for (const audio of audioPool.values()) {
    try { audio.volume = clamped; } catch { /* noop */ }
  }
  volumeStore.listeners.forEach((cb) => { try { cb(clamped); } catch {} });
}
export function useVolume() {
  const [v, setV] = useState(volumeStore.value);
  useEffect(() => {
    volumeStore.listeners.add(setV);
    return () => volumeStore.listeners.delete(setV);
  }, []);
  return [v, setGlobalVolume];
}

/** Download blob, create Audio element, cache everything. Reliable, zero buffer gaps. */
export async function resolveAudio(storagePath) {
  if (audioPool.has(storagePath)) return audioPool.get(storagePath);

  // Signed URL
  let signedUrl = urlCache.get(storagePath);
  if (!signedUrl) {
    const res = await fetch(`${API}/api/audio/signed-url?path=${encodeURIComponent(storagePath)}`);
    const { url, error } = await res.json();
    if (error || !url) throw new Error(error || 'no url');
    signedUrl = url;
    urlCache.set(storagePath, url);
  }

  // Full blob download (guarantees smooth playback)
  let blobUrl = blobUrlCache.get(storagePath);
  if (!blobUrl) {
    const audioRes = await fetch(signedUrl);
    const blob = await audioRes.blob();
    blobUrl = URL.createObjectURL(blob);
    blobUrlCache.set(storagePath, blobUrl);
  }

  const audio = new Audio(blobUrl);
  audio.preload = 'auto';
  audio.volume = volumeStore.value; // applique le volume global dès la création
  audio.load();
  audioPool.set(storagePath, audio);

  await new Promise((resolve) => {
    if (audio.readyState >= 3) return resolve();
    audio.addEventListener('canplay', resolve, { once: true });
    audio.addEventListener('error', resolve, { once: true });
  });

  return audio;
}

/**
 * Preload toutes les versions d'un morceau en arrière-plan.
 * Appelé à l'ouverture d'une fiche : garantit un switch V1/V2/V3 instantané
 * pour l'écoute comparative A/B sans délai au premier clic.
 *
 * NB : on ne précharge PAS les autres morceaux de la playlist — le gain
 * perceptuel est faible (arrêt naturel entre deux titres) alors que le coût
 * en egress Supabase est significatif. Voir commit egress-optim.
 */
export function preloadTrackVersions(versions) {
  if (!Array.isArray(versions)) return;
  for (const v of versions) {
    if (v?.storagePath && !audioPool.has(v.storagePath)) {
      resolveAudio(v.storagePath).catch(() => {});
    }
  }
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
  playlist,
  currentIdx,
}) {
  const { s } = useLang();
  const containerRef = useRef(null);
  const wsRef = useRef(null);
  const activeAudioRef = useRef(null);
  const activePathRef = useRef(null);
  // Mémorise le dernier resetKey vu : si inchangé = switch de version → on conserve la position.
  const lastResetKeyRef = useRef(resetKey);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);

  const fmt = (secRaw) => {
    const sec = Math.floor(secRaw);
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

        const prev = activeAudioRef.current;
        const wasPlaying = prev ? !prev.paused : isPlaying;

        // Deux cas :
        // • resetKey a changé (nouveau titre, replay explicite) → on reprend à 0.
        // • resetKey inchangé (switch de version, A/B du même titre) → on conserve
        //   la position actuelle pour une comparaison transparente sans coupure.
        const resetKeyChanged = lastResetKeyRef.current !== resetKey;
        lastResetKeyRef.current = resetKey;

        if (resetKeyChanged || !prev) {
          audio.currentTime = 0;
        } else {
          // Conserve la position. Clamp à la durée du nouvel audio au cas où
          // les versions n'ont pas exactement la même longueur.
          const prevTime = prev.currentTime || 0;
          const targetDur = Number.isFinite(audio.duration) && audio.duration > 0
            ? audio.duration
            : prevTime;
          audio.currentTime = Math.min(prevTime, Math.max(0, targetDur - 0.05));
        }

        if (wasPlaying) {
          try { await audio.play(); } catch {}
        }

        if (prev && prev !== audio) prev.pause();
        activeAudioRef.current = audio;
        // Applique le volume courant sur le nouvel audio (via le store global)
        audio.volume = volumeStore.value;

        // Plus de preload des morceaux suivants ici : le gain perceptuel est
        // faible (arrêt naturel entre deux titres) alors que chaque preload
        // consomme un full download MP3 en egress Supabase. Le preload ciblé
        // des versions du morceau en cours est piloté depuis FicheScreen via
        // preloadTrackVersions() — c'est là que l'écoute A/B a vraiment besoin
        // de zéro délai.

        // Update WaveSurfer visualization (async, audio already plays)
        if (wsRef.current) {
          wsRef.current.destroy();
          wsRef.current = null;
        }

        // Dégradé progress : cerulean → violet → amber, sur toute la largeur
        // de la waveform. La partie "déjà lue" révèle la couleur prédestinée
        // de chaque bar selon sa position dans le morceau.
        const progressGradient = (() => {
          const canvas = document.createElement('canvas');
          const width = containerRef.current?.clientWidth || 1024;
          const dpr = window.devicePixelRatio || 1;
          canvas.width = Math.max(1, Math.floor(width * dpr));
          canvas.height = 36 * dpr;
          const ctx = canvas.getContext('2d');
          const g = ctx.createLinearGradient(0, 0, canvas.width, 0);
          // Versions punchy du gradient : on s'éloigne des valeurs
          // "base theme" qui, appliquées sur des bars fines de 2px
          // contre un background très sombre, paraissent ternes.
          // On pousse saturation + clarté pour que les 3 teintes
          // ressortent sans partir dans le fluo.
          g.addColorStop(0.0, '#b4eef7');   // cerulean clair/électrique
          g.addColorStop(0.5, '#dcc2ff');   // violet clair pastel
          g.addColorStop(1.0, '#ffd470');   // amber clair chaud
          return g;
        })();

        // Mobile portrait : la waveform gardée à échelle "normale" (barres
        // lisibles) défile en suivant la lecture, au lieu d'être compressée
        // dans la largeur du container. minPxPerSec = 60 → une chanson de
        // 3 min occupe ~11 000 px, bien plus que le viewport, donc scroll
        // automatique via autoScroll (activé par défaut en WaveSurfer v7).
        const isMobilePortrait = typeof window !== 'undefined'
          && window.matchMedia('(max-width: 768px)').matches
          && window.matchMedia('(orientation: portrait)').matches;

        const ws = WaveSurfer.create({
          container: containerRef.current,
          // Bars "à venir" en blanc très léger,
          // bars "passés" en dégradé cerulean → violet → amber.
          waveColor: 'rgba(255,255,255,0.15)',
          progressColor: progressGradient,
          cursorColor: '#f5a623',
          cursorWidth: 2,
          barWidth: 2,
          barGap: 1.5,
          barRadius: 1,
          height: 36,
          normalize: true,
          interact: true,
          media: audio,
          ...(isMobilePortrait
            ? { minPxPerSec: 60, autoScroll: true, autoCenter: true, fillParent: false }
            : {}),
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

  // ── Spacebar play/pause ────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      // Ignore if user is typing in an input/textarea
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!idle && onToggle) onToggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [idle, onToggle]);

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
        aria-label={s.player.prev}
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
        aria-label={isPlaying ? s.player.pause : s.player.play}
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
        aria-label={s.player.next}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M12 3v10M3 3l7 5-7 5V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Meta */}
      <div className="pl-meta">
        {idle ? (
          <>
            <div className="pl-title" style={{ color: '#7c7c80' }}>{s.player.idleShort}</div>
            <div className="pl-sub">—</div>
          </>
        ) : (
          <>
            <div className="pl-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {trackTitle}
            </div>
            <div className="pl-sub" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {versionName}{loading ? ` · ${s.player.loadingInline}` : ''}
            </div>
          </>
        )}
      </div>

      {/* WaveSurfer container — hidden on mobile via CSS */}
      <div
        ref={containerRef}
        className="pl-wavesurfer"
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

      {/* Mobile scrubber — shown on mobile via CSS */}
      <input
        type="range"
        className="pl-scrubber"
        min={0}
        max={duration || 100}
        value={currentTime}
        step={0.1}
        disabled={idle || !duration}
        style={{ opacity: idle || !duration ? 0.35 : 1 }}
        onChange={(e) => {
          const t = parseFloat(e.target.value);
          if (activeAudioRef.current) activeAudioRef.current.currentTime = t;
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

      {/* Volume — icône + popup slider (composant partagé) */}
      <VolumeControl idle={idle} />
    </div>
  );
}

// ─── Volume control (speaker icon + vertical slider popup) ─────
// Composant réutilisable : dans BottomPlayer et dans le hero de la home.
// Utilise le store global (useVolume) pour que les deux restent synchro.
export function VolumeControl({ idle = false }) {
  const { s } = useLang();
  const [volume, setVolume] = useVolume();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div className="pl-volume" ref={wrapRef}>
      <button
        type="button"
        className="pl-ctrl pl-volume-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label={s.player?.volume || 'Volume'}
        title={s.player?.volume || 'Volume'}
        style={{ opacity: idle ? 0.4 : 1 }}
      >
        {volume === 0 ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 6h2.5L9 3v10L5.5 10H3V6z" fill="currentColor" />
            <path d="M11 6l4 4M15 6l-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        ) : volume < 0.5 ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 6h2.5L9 3v10L5.5 10H3V6z" fill="currentColor" />
            <path d="M11.5 6.5c.7.7.7 2.3 0 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 6h2.5L9 3v10L5.5 10H3V6z" fill="currentColor" />
            <path d="M11.5 5c1.3 1.3 1.3 4.7 0 6M13.5 3.5c2 2 2 7 0 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
          </svg>
        )}
      </button>
      {open && (
        <div className="pl-volume-pop" role="dialog" aria-label={s.player?.volume || 'Volume'}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            aria-label={s.player?.volume || 'Volume'}
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
