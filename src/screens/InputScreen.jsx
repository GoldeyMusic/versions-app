import { useState, useRef, Fragment } from 'react';
import T from '../constants/theme';
import DAWS from '../constants/daws';
import { IconWave, IconPlus, IconX, IconCheck } from '../components/Icons';

/* ── FILE DROP ZONE ─────────────────────────────────────── */
const FileDropZone = ({ file, onFile, accent = T.green, hint, formats, compact = false }) => {
  const [drag, setDrag] = useState(false);
  const ref = useRef(null);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]);
      }}
      onClick={() => ref.current?.click()}
      style={{
        border: `1px dashed ${drag ? T.amber : file ? accent : T.border}`,
        borderRadius: 10,
        padding: compact ? '10px 14px' : '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        transition: 'all .2s',
        background: drag ? T.amberGlow : file ? `${accent}08` : 'transparent',
      }}
    >
      <input
        ref={ref}
        type="file"
        accept="audio/*,.mp3,.wav,.aiff,.aif,.flac,.m4a,.ogg"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />
      <IconWave c={file ? accent : T.muted} s={compact ? 16 : 20} />
      {file ? (
        <>
          <div
            style={{
              fontFamily: T.body,
              fontWeight: 400,
              fontSize: compact ? 12 : 13,
              color: accent,
              flex: 1,
            }}
          >
            {file.name}
          </div>
          <IconCheck c={accent} />
        </>
      ) : (
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: T.body,
              fontWeight: 400,
              fontSize: compact ? 12 : 13,
              color: T.muted,
            }}
          >
            {hint}
          </div>
          {!compact && (
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 10,
                color: T.muted2,
                marginTop: 2,
              }}
            >
              {formats}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════ */
/* INPUT SCREEN                                               */
/* ═══════════════════════════════════════════════════════════ */
const InputScreen = ({ onAnalyze, initialTitle = '' }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState(initialTitle);
  const [version, setVersion] = useState('');
  const [daw, setDaw] = useState(null);
  const [showRef, setShowRef] = useState(false);
  const [refFile, setRefFile] = useState(null);

  const handleMainFile = (f) => {
    if (!f) return;
    setFile(f);
    if (!title) {
      setTitle(f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  const handleRefFile = (f) => {
    if (!f) return;
    setRefFile(f);
  };

  const toggleRef = () => {
    if (showRef) {
      setRefFile(null);
    }
    setShowRef(!showRef);
  };

  const hasRef = showRef && refFile;
  const ok = !!file && !!daw && !!title && !!version;

  const handleAnalyze = () => {
    if (!ok) return;
    onAnalyze({
      file,
      title,
      version,
      daw,
      refFile: hasRef ? refFile : null,
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 20px 40px',
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        animation: 'fadeup .4s ease',
      }}
    >
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h1
          style={{
            fontFamily: T.display,
            fontSize: 'clamp(44px,12vw,56px)',
            letterSpacing: 8,
            lineHeight: 1,
            color: T.text,
            marginBottom: 8,
          }}
        >
          VER<span style={{ color: T.amber }}>SI</span>ONS
        </h1>
        <div
          style={{
            fontFamily: T.body,
            fontWeight: 300,
            fontSize: 11,
            letterSpacing: 3,
            color: T.muted,
            textTransform: 'uppercase',
          }}
        >
          Analyse. Compare. Évolue.
        </div>
      </div>

      {/* How it works — 3 steps */}
      <div
        className="how-strip"
        style={{
          width: '100%',
          maxWidth: 560,
          display: 'flex',
          alignItems: 'center',
          marginBottom: 20,
          gap: 0,
        }}
      >
        {[
          {
            label: 'Upload ton mix',
            sub: 'Dépose ton fichier audio',
            color: T.green,
            icon: (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M8 3v7M5 6l3-3 3 3"
                  stroke={T.green}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 11v2h10v-2"
                  stroke={T.green}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            ),
          },
          {
            label: 'Ajoute une ref',
            sub: 'Optionnel — pour comparer',
            color: T.cyan,
            icon: (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="5.5"
                  stroke={T.cyan}
                  strokeWidth="1.3"
                />
                <path
                  d="M8 5v3l2 1.5"
                  stroke={T.cyan}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            ),
          },
          {
            label: 'Rapport IA',
            sub: 'Chiffré + plan d\'action',
            color: T.amber,
            icon: (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M2 11l3-4 3 2 4-6"
                  stroke={T.amber}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="13"
                  cy="4"
                  r="1.5"
                  fill={T.amber}
                  opacity=".5"
                />
              </svg>
            ),
          },
        ].map((s, i) => (
          <Fragment key={i}>
            <div
              style={{
                flex: 1,
                background: T.s1,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                padding: '12px 10px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 40,
                  height: 40,
                  background: `radial-gradient(circle at top right,${s.color}10,transparent 70%)`,
                }}
              />
              <div style={{ marginBottom: 6 }}>{s.icon}</div>
              <div
                style={{
                  fontFamily: T.body,
                  fontWeight: 600,
                  fontSize: 10,
                  color: s.color,
                  marginBottom: 2,
                  letterSpacing: 0.3,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: 8,
                  color: T.muted,
                  lineHeight: 1.4,
                }}
              >
                {s.sub}
              </div>
            </div>
            {i < 2 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 4px',
                  flexShrink: 0,
                  opacity: 0.4,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M5 3l4 4-4 4"
                    stroke={T.muted}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </Fragment>
        ))}
      </div>

      {/* Form */}
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {/* ── SECTION: TON MIX ─────────────────────────────── */}
        <div
          style={{
            background: T.s1,
            border: `1px solid ${file ? T.green + '44' : T.border}`,
            borderRadius: 14,
            padding: 18,
            transition: 'border-color .2s',
          }}
        >
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 10,
              letterSpacing: 2,
              color: T.amber,
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            TON MIX <div style={{ flex: 1, height: 1, background: T.border }} />
          </div>
          <FileDropZone
            file={file}
            onFile={handleMainFile}
            accent={T.green}
            hint="Glisser le fichier ici ou cliquer"
            formats="WAV · AIFF · MP3 · FLAC — 200 MB max"
          />
          {file && (
            <div
              style={{
                display: 'flex',
                gap: 10,
                marginTop: 12,
                animation: 'fadeup .25s ease',
              }}
            >
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontFamily: T.mono,
                    fontSize: 9,
                    letterSpacing: 1.5,
                    color: T.muted,
                    marginBottom: 4,
                    display: 'block',
                  }}
                >
                  TITRE
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nom du morceau"
                  style={{
                    width: '100%',
                    background: T.s2,
                    border: `1px solid ${title ? T.green + '66' : T.border}`,
                    borderRadius: 8,
                    padding: '9px 12px',
                    color: T.text,
                    outline: 'none',
                    transition: 'border-color .2s',
                    fontFamily: T.body,
                    fontSize: 13,
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontFamily: T.mono,
                    fontSize: 9,
                    letterSpacing: 1.5,
                    color: T.muted,
                    marginBottom: 4,
                    display: 'block',
                  }}
                >
                  NOM DE LA VERSION
                </label>
                <input
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="ex: Mix v3, Demo, Master…"
                  style={{
                    width: '100%',
                    background: T.s2,
                    border: `1px solid ${version ? T.green + '66' : T.border}`,
                    borderRadius: 8,
                    padding: '9px 12px',
                    color: T.text,
                    outline: 'none',
                    transition: 'border-color .2s',
                    fontFamily: T.body,
                    fontSize: 13,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── ADD REFERENCE ────────────────────────────────── */}
        {!showRef ? (
          <div
            onClick={toggleRef}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = T.amber;
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.background = T.amberGlow;
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = T.border;
              e.currentTarget.style.opacity = '0.7';
              e.currentTarget.style.background = 'transparent';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) {
                setShowRef(true);
                handleRefFile(f);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              padding: '12px 16px',
              background: 'transparent',
              border: `1px dashed ${T.border}`,
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'all .2s',
              fontFamily: T.mono,
              fontSize: 11,
              letterSpacing: 0.5,
              color: T.muted,
              opacity: 0.7,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = T.muted;
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = T.border;
              e.currentTarget.style.opacity = '0.7';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <IconPlus /> Ajouter une référence{' '}
            <span style={{ opacity: 0.5, fontSize: 10 }}>(optionnel)</span>
          </div>
        ) : (
          <div
            style={{
              background: T.s1,
              border: `1px solid ${refFile ? T.muted + '44' : T.border}`,
              borderRadius: 14,
              padding: 18,
              animation: 'fadeup .3s ease',
              position: 'relative',
            }}
          >
            <button
              onClick={toggleRef}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: T.s2,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: T.muted,
                transition: 'all .15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = T.red;
                e.currentTarget.style.color = T.red;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = T.border;
                e.currentTarget.style.color = T.muted;
              }}
            >
              <IconX />
            </button>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 10,
                letterSpacing: 2,
                color: T.muted,
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              RÉFÉRENCE (optionnel)
            </div>
            <p
              style={{
                fontFamily: T.body,
                fontWeight: 300,
                fontSize: 11,
                color: T.muted,
                marginBottom: 12,
              }}
            >
              Compare ton mix avec une prod qui t'inspire
            </p>
            <FileDropZone
              file={refFile}
              onFile={handleRefFile}
              accent={T.muted}
              hint="Fichier audio de référence"
              formats="WAV · AIFF · MP3 · FLAC"
              compact
            />
          </div>
        )}

        {/* ── DAW ──────────────────────────────────────────── */}
        <div
          style={{
            background: T.s1,
            border: `1px solid ${daw ? T.amber + '44' : T.border}`,
            borderRadius: 14,
            padding: 18,
            transition: 'border-color .2s',
          }}
        >
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 10,
              letterSpacing: 2,
              color: T.amber,
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            TON DAW <div style={{ flex: 1, height: 1, background: T.border }} />
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={daw || ''}
              onChange={(e) => setDaw(e.target.value || null)}
              style={{
                width: '100%',
                background: T.s2,
                border: `1px solid ${daw ? T.amber : T.border}`,
                borderRadius: 8,
                padding: '11px 40px 11px 14px',
                fontFamily: T.mono,
                fontSize: 11,
                color: daw ? T.text : T.muted,
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                transition: 'border-color .2s',
              }}
            >
              <option value="" style={{ background: T.s2, color: T.muted }}>
                Sélectionne ton DAW…
              </option>
              {DAWS.map((d) => (
                <option key={d} value={d} style={{ background: T.s1, color: T.text }}>
                  {d}
                </option>
              ))}
            </select>
            <div
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 4 L6 8 L10 4"
                  stroke={daw ? T.amber : T.muted}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ── CTA ──────────────────────────────────────────── */}
        <button
          onClick={handleAnalyze}
          disabled={!ok}
          style={{
            width: '100%',
            padding: '14px 16px',
            background: ok
              ? `linear-gradient(135deg,${T.amber},${T.orange})`
              : T.s2,
            border: `1px solid ${ok ? T.amber : T.border}`,
            borderRadius: 10,
            cursor: ok ? 'pointer' : 'not-allowed',
            fontFamily: T.body,
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: ok ? T.black : T.muted,
            transition: 'all .2s',
            boxShadow: ok ? `0 4px 24px rgba(245,160,0,.3)` : 'none',
          }}
        >
          {ok ? 'ANALYSER' : 'Compléter les champs'}
        </button>

        {ok && hasRef && (
          <div
            style={{
              textAlign: 'center',
              fontFamily: T.mono,
              fontSize: 10,
              color: T.muted,
              opacity: 0.6,
              animation: 'fadeup .2s ease',
            }}
          >
            + référence : {refFile.name}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputScreen;
