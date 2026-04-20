import { useState, useRef } from 'react';
import T from '../constants/theme';
import DAWS from '../constants/daws';
import { IconWave, IconCheck } from '../components/Icons';

/* ── FILE DROP ZONE ─────────────────────────────────────── */
const FileDropZone = ({ file, onFile }) => {
  const [drag, setDrag] = useState(false);
  const ref = useRef(null);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault(); setDrag(false);
        if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]);
      }}
      onClick={() => ref.current?.click()}
      className="input-dropzone"
      style={{
        borderColor: drag ? T.amber : file ? '#7bd88f55' : undefined,
        background: drag ? 'rgba(245,176,86,0.06)' : file ? 'rgba(123,216,143,0.04)' : undefined,
        cursor: 'pointer',
      }}
    >
      {/* Visible file input on mobile — iOS Safari doesn't support drag & drop */}
      <input
        ref={ref}
        type="file"
        accept="audio/*,.mp3,.wav,.aiff,.aif,.flac,.m4a,.ogg"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />
      {file ? (
        <>
          <IconCheck c="#7bd88f" />
          <div className="input-drop-name">{file.name}</div>
        </>
      ) : (
        <>
          <IconWave c={drag ? T.amber : '#7c7c80'} s={22} />
          <div className="input-drop-text">
            <div className="input-drop-hint input-drop-hint-desktop">Glisser le fichier ici ou cliquer</div>
            <div className="input-drop-hint input-drop-hint-mobile">Appuyer pour choisir un fichier</div>
            <div className="input-drop-formats">WAV · AIFF · MP3 · FLAC — 200 MB max</div>
          </div>
        </>
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

  const handleMainFile = (f) => {
    if (!f) return;
    setFile(f);
    if (!title) {
      const cleaned = f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim();
      const letters = (cleaned.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
      const digits = (cleaned.match(/\d/g) || []).length;
      const looksMeaningful = letters >= 3 && letters >= digits && !/^song\s+\d{6,}/i.test(cleaned);
      if (looksMeaningful) setTitle(cleaned);
    }
  };

  const ok = !!file && !!daw && !!title && !!version;

  const handleAnalyze = () => {
    if (!ok) return;
    onAnalyze({ file, title, version, daw, refFile: null });
  };

  // Progress indicator
  const filled = [!!file, !!title, !!version, !!daw].filter(Boolean).length;

  return (
    <div className="input-screen">
      {/* Header */}
      <div className="input-header">
        <div className="input-title">NOUVELLE ANALYSE</div>
        <div className="input-tagline">Analyse <span className="input-tagline-dot">·</span> Compare <span className="input-tagline-dot">·</span> Évolue</div>
      </div>

      {/* Progress bar */}
      <div className="input-progress">
        <div className="input-progress-bar" style={{ width: `${(filled / 4) * 100}%` }} />
      </div>

      {/* Form */}
      <div className="input-form">

        {/* ── FILE DROP ── */}
        <div className="input-section">
          <div className="input-section-label">
            TON MIX <div className="input-section-line" />
            {file && <span style={{ color: '#7bd88f', fontSize: 9 }}>✓</span>}
          </div>
          <FileDropZone file={file} onFile={handleMainFile} />
        </div>

        {/* ── TITRE + VERSION + DAW — toujours visibles, désactivés sans fichier ── */}
        <div className="input-fields">
          <div className="input-field">
            <label className="input-label">TITRE</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nom du morceau"
              className="input-input"
              disabled={!file}
              style={{
                borderColor: title ? '#7bd88f66' : undefined,
                opacity: !file ? 0.4 : 1,
                cursor: !file ? 'not-allowed' : undefined,
              }}
            />
          </div>
          <div className="input-field">
            <label className="input-label">VERSION</label>
            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="Mix v3, Demo…"
              className="input-input"
              disabled={!file}
              style={{
                borderColor: version ? '#7bd88f66' : undefined,
                opacity: !file ? 0.4 : 1,
                cursor: !file ? 'not-allowed' : undefined,
              }}
            />
          </div>
          <div className="input-field">
            <label className="input-label">DAW</label>
            <div style={{ position: 'relative' }}>
              <select
                value={daw || ''}
                onChange={(e) => setDaw(e.target.value || null)}
                className="input-select"
                disabled={!file}
                style={{
                  borderColor: daw ? `${T.amber}88` : undefined,
                  color: daw ? T.text : undefined,
                  opacity: !file ? 0.4 : 1,
                  cursor: !file ? 'not-allowed' : 'pointer',
                }}
              >
                <option value="">Ton DAW…</option>
                {DAWS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <div className="input-select-arrow">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4 L6 8 L10 4" stroke={daw ? T.amber : '#7c7c80'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <button
          onClick={handleAnalyze}
          disabled={!ok}
          className={`input-cta${ok ? ' ready' : ''}`}
        >
          {ok ? 'Analyser' : !file ? 'Dépose ton mix pour commencer' : 'Complète les infos pour continuer'}
        </button>

      </div>
    </div>
  );
};

export default InputScreen;
