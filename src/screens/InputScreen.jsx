import { useState, useRef, useEffect } from 'react';
import T from '../constants/theme';
import DAWS from '../constants/daws';
import { IconWave, IconCheck } from '../components/Icons';
import { loadProjects, createProject } from '../lib/storage';
import RenameModal from '../components/RenameModal';
import useLang from '../hooks/useLang';

/* ── PROJECT PICKER ─────────────────────────────────────── */
const PROJECT_GRADIENTS = [
  'linear-gradient(135deg, #4a3b2a, #8a6a3f 60%, #c6a15b)',
  'linear-gradient(135deg, #2a3a4a, #3f6a8a 60%, #5ba1c6)',
  'linear-gradient(135deg, #3a2a4a, #6a3f8a 60%, #a15bc6)',
  'linear-gradient(135deg, #2a4a3a, #3f8a6a 60%, #5bc6a1)',
  'linear-gradient(135deg, #4a2a2a, #8a3f3f 60%, #c65b5b)',
  'linear-gradient(135deg, #24242c, #3a3a48 70%, #5a5a6e)',
];

function ProjectPicker({ projects, projectId, onChange, onCreateNew, locked = false }) {
  const { s } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const current = projects.find(p => p.id === projectId) || projects[0];
  if (!current) {
    return (
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={onCreateNew}
          className="input-select"
          style={{ textAlign: 'left', cursor: 'pointer', color: T.muted }}
        >{s.input.projectPickerFirst}</button>
      </div>
    );
  }
  const gradCurrent = PROJECT_GRADIENTS[(current.coverGradient ?? 0) % 6];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => { if (!locked) setOpen((o) => !o); }}
        disabled={locked}
        title={locked ? s.input.projectLocked : undefined}
        className="input-select"
        style={{
          textAlign: 'left', cursor: locked ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
          color: T.text,
          borderColor: open ? `${T.amber}88` : undefined,
          opacity: locked ? 0.85 : 1,
        }}
      >
        <span style={{ width: 16, height: 16, borderRadius: 4, background: gradCurrent, flexShrink: 0 }} />
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {current.name}
        </span>
        <span style={{ color: T.muted, fontSize: 10 }}>
          {(current.tracks?.length || 0)} {(current.tracks?.length || 0) > 1 ? s.input.tracksPlural : s.input.tracksSingular}
        </span>
      </button>
      <div className="input-select-arrow">
        {locked ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-label={s.input.projectLocked}>
            <rect x="3" y="5.5" width="6" height="4.5" rx="1" stroke="#7c7c80" strokeWidth="1.2" fill="none" />
            <path d="M4.2 5.5 V 4 a 1.8 1.8 0 0 1 3.6 0 V 5.5" stroke="#7c7c80" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4 L6 8 L10 4" stroke={open ? T.amber : '#7c7c80'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {open && !locked && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
            background: '#141416', border: '1px solid #2a2a2e',
            borderRadius: 10, padding: 6, boxShadow: '0 12px 32px rgba(0,0,0,.55)',
            maxHeight: 280, overflowY: 'auto',
          }}
        >
          {projects.map((p) => {
            const grad = PROJECT_GRADIENTS[(p.coverGradient ?? 0) % 6];
            const n = p.tracks?.length || 0;
            const isCurrent = p.id === current.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => { onChange(p.id); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '8px 10px', borderRadius: 8,
                  background: isCurrent ? 'rgba(245,176,86,.08)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: T.text,
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.background = 'rgba(255,255,255,.04)'; }}
                onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ width: 16, height: 16, borderRadius: 4, background: grad, flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </span>
                <span style={{ color: T.muted, fontSize: 10 }}>
                  {n} {n > 1 ? s.input.tracksPlural : s.input.tracksSingular}
                </span>
              </button>
            );
          })}
          <div style={{ height: 1, background: '#2a2a2e', margin: '4px 2px' }} />
          <button
            type="button"
            onClick={() => { setOpen(false); onCreateNew(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '8px 10px', borderRadius: 8,
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: T.amber,
              textAlign: 'left',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,176,86,.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >{s.input.projectPickerNew}</button>
        </div>
      )}
    </div>
  );
}

/* ── FILE DROP ZONE ─────────────────────────────────────── */
const FileDropZone = ({ file, onFile }) => {
  const { s } = useLang();
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
      }}
    >
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
            <div className="input-drop-hint">{s.input.dropText}</div>
            <div className="input-drop-formats">{s.input.dropFormats}</div>
          </div>
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════ */
/* INPUT SCREEN                                               */
/* ═══════════════════════════════════════════════════════════ */
const InputScreen = ({ onAnalyze, initialTitle = '', initialProjectId = null, lockProject = false, onRefreshProjects }) => {
  const { s } = useLang();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState(initialTitle);
  const [version, setVersion] = useState('');
  const [daw, setDaw] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(initialProjectId);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectValue, setNewProjectValue] = useState('');
  const newProjectInputRef = useRef(null);

  // --- Type vocal du TITRE (question posée uniquement à la création d'un titre) ---
  // kind : 'vocal' | 'instrumental'
  // finalInstru : si instrumental, est-ce définitif ?
  // Ces deux états se combinent pour produire vocalType : 'vocal' |
  // 'instrumental_pending' | 'instrumental_final'. On ne pose PAS la question
  // quand on ajoute une version à un titre existant (lockProject=true).
  const [vocalKind, setVocalKind] = useState('vocal');
  const [finalInstru, setFinalInstru] = useState(null); // null tant que pas choisi
  const askVocal = !lockProject;
  const vocalType = vocalKind === 'vocal'
    ? 'vocal'
    : (finalInstru === true ? 'instrumental_final'
      : finalInstru === false ? 'instrumental_pending'
        : null);
  const vocalOk = !askVocal || vocalType !== null;

  // Charge la liste des projets
  useEffect(() => {
    let alive = true;
    loadProjects().then((p) => {
      if (!alive) return;
      setProjects(p || []);
      // Si aucun projet n'est pré-sélectionné, on prend le premier disponible
      if (!initialProjectId && p && p.length) setProjectId(p[0].id);
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const ok = !!file && !!daw && !!title && !!version && !!projectId && vocalOk;

  const handleAnalyze = () => {
    if (!ok) return;
    onAnalyze({ file, title, version, daw, projectId, vocalType, refFile: null });
  };

  // Progress indicator — 5 champs (projet, fichier, titre, version, DAW).
  // Le type vocal est conditionnel (caché quand on ajoute à un titre existant),
  // donc on ne l'ajoute au compteur que s'il est demandé, et on normalise
  // le total en conséquence pour garder une barre cohérente.
  const baseFilled = [!!projectId, !!file, !!title, !!version, !!daw].filter(Boolean).length;
  const totalSteps = askVocal ? 6 : 5;
  const filled = baseFilled + (askVocal && vocalOk ? 1 : 0);

  // Création rapide de projet depuis le picker
  const handleCreateNewProject = () => {
    setNewProjectValue('');
    setNewProjectOpen(true);
    setTimeout(() => newProjectInputRef.current?.focus(), 50);
  };
  const submitNewProject = async () => {
    const name = newProjectValue.trim();
    if (!name) return;
    try {
      const created = await createProject(name);
      setNewProjectOpen(false);
      setNewProjectValue('');
      if (created?.id) {
        // Recharge la liste et sélectionne le projet juste créé
        const fresh = await loadProjects();
        setProjects(fresh || []);
        setProjectId(created.id);
        if (onRefreshProjects) onRefreshProjects();
      }
    } catch (err) { console.warn('createProject failed', err); }
  };

  return (
    <div className="input-screen">
      {/* Header */}
      <div className="input-header">
        <div className="input-title">{s.input.title}</div>
        <div className="input-tagline">{s.input.taglineWord1} <span className="input-tagline-dot">·</span> {s.input.taglineWord2} <span className="input-tagline-dot">·</span> {s.input.taglineWord3}</div>
      </div>

      {/* Progress bar */}
      <div className="input-progress">
        <div className="input-progress-bar" style={{ width: `${(filled / totalSteps) * 100}%` }} />
      </div>

      {/* Body — 2 colonnes sur desktop (≥ 1100px) : fichier + type à gauche,
          métadonnées + CTA à droite. Mono-colonne sur mobile, ordre logique. */}
      <div className="input-body">

        {/* ══ Colonne principale (gauche) : fichier + type de titre ══ */}
        <div className="input-col-main">

          {/* ── FILE DROP ── */}
          <div className="input-section input-section-file">
            <div className="input-section-label">
              {s.input.sectionMix} <div className="input-section-line" />
              {file && <span style={{ color: '#7bd88f', fontSize: 9 }}>✓</span>}
            </div>
            <FileDropZone file={file} onFile={handleMainFile} />
          </div>

          {/* ── TYPE DE TITRE (nouveau titre uniquement) ── */}
          {file && askVocal && (
            <div className="input-section" style={{ animation: 'fadeup .25s ease' }}>
              <div className="input-section-label">
                {s.input.sectionVocalType} <div className="input-section-line" />
                {vocalOk && <span style={{ color: '#7bd88f', fontSize: 9 }}>✓</span>}
              </div>

              {/* Étape 1 : chanté ou instrumental ? */}
              <div className="input-vkind">
                <button
                  type="button"
                  className={`input-vpill${vocalKind === 'vocal' ? ' on' : ''}`}
                  onClick={() => { setVocalKind('vocal'); setFinalInstru(null); }}
                >
                  {s.input.vocalSung}
                </button>
                <button
                  type="button"
                  className={`input-vpill${vocalKind === 'instrumental' ? ' on' : ''}`}
                  onClick={() => setVocalKind('instrumental')}
                >
                  {s.input.vocalInstrumental}
                </button>
              </div>

              {/* Étape 2 : si instrumental, voix à venir ou définitif ? */}
              {vocalKind === 'instrumental' && (
                <div style={{ marginTop: 10, animation: 'fadeup .2s ease' }}>
                  <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, fontFamily: T.mono, letterSpacing: 1 }}>
                    {s.input.vocalVoiceQuestion}
                  </div>
                  <div className="input-vkind">
                    <button
                      type="button"
                      className={`input-vpill small${finalInstru === false ? ' on' : ''}`}
                      onClick={() => setFinalInstru(false)}
                      title={s.input.vocalComingTip}
                    >
                      {s.input.vocalComing}
                    </button>
                    <button
                      type="button"
                      className={`input-vpill small${finalInstru === true ? ' on' : ''}`}
                      onClick={() => setFinalInstru(true)}
                      title={s.input.vocalFinalTip}
                    >
                      {s.input.vocalFinal}
                    </button>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 11, color: T.muted, fontFamily: T.mono, lineHeight: 1.5 }}>
                    {finalInstru === null && s.input.vocalHintIdle}
                    {finalInstru === false && s.input.vocalHintComing}
                    {finalInstru === true && s.input.vocalHintFinal}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* ══ Colonne secondaire (droite) : métadonnées + CTA ══ */}
        <div className="input-col-side">

          {/* ── PROJET ── */}
          <div className="input-section">
            <div className="input-section-label">
              {s.input.sectionProject} <div className="input-section-line" />
              {projectId && <span style={{ color: '#7bd88f', fontSize: 9 }}>✓</span>}
            </div>
            <ProjectPicker
              projects={projects}
              projectId={projectId}
              onChange={setProjectId}
              onCreateNew={handleCreateNewProject}
              locked={lockProject}
            />
            {lockProject && (
              <div style={{ marginTop: 6, fontSize: 10, color: T.muted, fontFamily: "'DM Sans', sans-serif" }}>
                {s.input.projectLockedHint}
              </div>
            )}
          </div>

          {/* ── TITLE + VERSION (appear after file) ── */}
          {file && (
            <div className="input-section" style={{ animation: 'fadeup .25s ease' }}>
              <div className="input-fields">
                <div className="input-field">
                  <label className="input-label">{s.input.sectionTitle}</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={s.input.titlePlaceholder}
                    className="input-input"
                    style={{ borderColor: title ? '#7bd88f66' : undefined }}
                  />
                </div>
                <div className="input-field">
                  <label className="input-label">{s.input.sectionVersion}</label>
                  <input
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder={s.input.versionPlaceholder}
                    className="input-input"
                    style={{ borderColor: version ? '#7bd88f66' : undefined }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── DAW ── */}
          <div className="input-section">
            <div className="input-section-label">
              {s.input.sectionDaw} <div className="input-section-line" />
              {daw && <span style={{ color: '#7bd88f', fontSize: 9 }}>✓</span>}
            </div>
            <div style={{ position: 'relative' }}>
              <select
                value={daw || ''}
                onChange={(e) => setDaw(e.target.value || null)}
                className="input-select"
                style={{ borderColor: daw ? `${T.amber}88` : undefined, color: daw ? T.text : undefined }}
              >
                <option value="">{s.input.dawPlaceholder}</option>
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

          {/* ── CTA ── */}
          <button
            onClick={handleAnalyze}
            disabled={!ok}
            className={`input-cta${ok ? ' ready' : ''}`}
          >
            {ok ? s.input.analyze : s.input.fieldsRemaining.replace('{filled}', String(filled)).replace('{total}', String(totalSteps))}
          </button>

        </div>

      </div>

      {/* Modale nouveau projet (depuis le picker) */}
      {newProjectOpen && (
        <RenameModal
          title={s.input.newProjectTitle}
          placeholder={s.input.newProjectPlaceholder}
          value={newProjectValue}
          originalValue=""
          inputRef={newProjectInputRef}
          onChange={setNewProjectValue}
          onCancel={() => setNewProjectOpen(false)}
          onSubmit={submitNewProject}
          confirmLabel={s.input.confirmCreate}
        />
      )}
    </div>
  );
};

export default InputScreen;
