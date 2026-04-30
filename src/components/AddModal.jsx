import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useLang from '../hooks/useLang';
import DAWS from '../constants/daws';

// Cap audio (sync avec backend decode-api/api/analyze.js).
// 720s = 12 min : limite anti-DJ-set qui protège l'API Fadr/Gemini.
const MAX_AUDIO_DURATION_SEC = 720;

// Lit la durée audio d'un File via HTMLAudioElement (sans buffer entier en RAM).
// Renvoie un Number (secondes) ou Promise.reject si format illisible.
function readAudioDuration(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    let done = false;
    const cleanup = () => { try { URL.revokeObjectURL(url); } catch {} };
    audio.preload = 'metadata';
    audio.addEventListener('loadedmetadata', () => {
      if (done) return; done = true;
      const d = Number(audio.duration);
      cleanup();
      if (Number.isFinite(d) && d > 0) resolve(d);
      else reject(new Error('invalid_duration'));
    });
    audio.addEventListener('error', () => {
      if (done) return; done = true;
      cleanup();
      reject(new Error('decode_error'));
    });
    // Garde-fou : un fichier qui ne charge ni n'erreur en 8s = on abandonne.
    setTimeout(() => {
      if (done) return; done = true;
      cleanup();
      reject(new Error('timeout'));
    }, 8000);
    audio.src = url;
  });
}

function formatDuration(sec) {
  const total = Math.round(Number(sec) || 0);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

/**
 * Met en amber (via <em>) le dernier mot d'un titre de modale, en conservant
 * une éventuelle ponctuation finale (« ? », « ! », etc.) collée au mot.
 * Exemples :
 *   "Dans quel projet ?" → "Dans quel " + <em>projet ?</em>
 *   "Nom du projet"      → "Nom du " + <em>projet</em>
 *   "À quel titre ?"     → "À quel " + <em>titre ?</em>
 */
function amberLastWord(str) {
  if (typeof str !== 'string') return str;
  const m = str.match(/^(.+?)\s+(\S+)(\s*[?!.,:;]+)?\s*$/);
  if (!m) return str;
  return (
    <>
      {m[1]} <em>{m[2]}{m[3] || ''}</em>
    </>
  );
}

/**
 * AddModal — modale unifiée d'ajout depuis la home.
 * Style mini-modal (aligné Réglages) : card sombre #0a0b10, rows
 * surélevées #111216, boutons mono uppercase pill outline. Titre
 * « Ajouter quoi ? » avec un mot amber (pas d'italique).
 *
 * Steps :
 *   - 'root'             : 3 choix (Nouveau projet, Nouveau titre, Nouvelle version)
 *   - 'new-project-name' : input inline pour créer un projet
 *   - 'pick-project'     : choix du projet cible pour Nouveau titre
 *   - 'pick-track'       : choix du titre cible pour Nouvelle version
 *   - 'upload'           : formulaire upload du mix
 *
 * Props :
 *   - onClose            : ferme la modale
 *   - onCreateProject    : (name) => Promise<project>
 *   - onAnalyze          : (cfg) => void
 *   - projects           : [{ id, name, tracks }]
 *   - allTracks          : [...] titres à plat (avec projectId)
 *   - initialContext     : optionnel, ouvre directement dans un flow précis
 *                          - { mode: 'new-track' }
 *                          - { mode: 'add-version', trackId }
 *   - defaultDaw         : optionnel, DAW par défaut issu du profil
 */
export default function AddModal({
  onClose,
  onCreateProject,
  onAnalyze,
  projects = [],
  allTracks = [],
  initialContext = null,
  defaultDaw = '',
}) {
  const { s } = useLang();

  // ── Navigation ─────────────────────────────────────────────
  const [step, setStep] = useState('root');

  // Nouveau projet inline
  const [newProjectName, setNewProjectName] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  const [chainToUploadAfterCreate, setChainToUploadAfterCreate] = useState(false);

  // Contexte d'upload
  const [uploadCtx, setUploadCtx] = useState(null);

  // ── Upload form state ──────────────────────────────────────
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [version, setVersion] = useState('');
  const [daw, setDaw] = useState(defaultDaw || '');
  const [vocalKind, setVocalKind] = useState('vocal');
  const [finalInstru, setFinalInstru] = useState(null);
  // Mix / Master toggle (refonte 2026-04-30). Default 'mix' : on part du
  // principe que la grande majorité des artistes envoient un mix en cours
  // d'itération, pas un master prêt-à-publier. La valeur sera persistée
  // dans versions.upload_type côté backend et conditionne :
  //   - la pondération master & loudness dans le score (mix : 0.5 vs
  //     master : 2) — cf. lib/claude.js
  //   - le verdict de sortie ("Prêt pour le mastering" vs "Prêt pour la
  //     sortie")
  const [uploadType, setUploadType] = useState('mix');
  // Genre musical déclaré par l'artiste à l'upload. Texte libre court.
  // Refonte 2026-04-29 : si vide au lancement, le pipeline détecte
  // automatiquement (équivalent ancien "Choisir automatiquement"). Le
  // bouton dédié a été retiré pour alléger la modale — moins de
  // décisions, plus fluide.
  const [declaredGenre, setDeclaredGenre] = useState('');
  // Intention artistique (facultative). Toggle dépliable pour ne pas
  // alourdir la modale par défaut. Ce qu'on saisissait avant dans
  // l'IntentionScreen post-Phase-A : maintenant tout en amont, plus
  // d'interruption mid-analyse.
  const [artisticIntent, setArtisticIntent] = useState('');
  const [intentExpanded, setIntentExpanded] = useState(false);
  const [drag, setDrag] = useState(false);
  // États du check durée audio (lecture/erreur). file ne devient non-null
  // que si la durée a été lue ET qu'elle est ≤ MAX_AUDIO_DURATION_SEC.
  const [fileChecking, setFileChecking] = useState(false);
  const [fileError, setFileError] = useState(null);
  const fileInputRef = useRef(null);

  const hasProjects = projects.length > 0;
  const hasTracks = allTracks.length > 0;

  const askVocal = uploadCtx?.mode === 'new-track';
  const vocalType = vocalKind === 'vocal'
    ? 'vocal'
    : (finalInstru === true ? 'instrumental_final'
      : finalInstru === false ? 'instrumental_pending'
        : null);
  const vocalOk = !askVocal || vocalType !== null;

  const uploadOk = !!file && !!daw && !!title.trim() && !!version.trim() && !!uploadCtx?.projectId && vocalOk;

  const handlePickFile = async (f) => {
    if (!f) return;
    // Reset les états du précédent essai et lance la lecture de durée.
    setFileError(null);
    setFile(null);
    setFileChecking(true);
    let dur;
    try {
      dur = await readAudioDuration(f);
    } catch (e) {
      setFileChecking(false);
      setFileError({ kind: 'unreadable' });
      return;
    }
    setFileChecking(false);
    if (dur > MAX_AUDIO_DURATION_SEC) {
      setFileError({ kind: 'too_long', durationSec: dur });
      return;
    }
    // OK : on accepte le fichier.
    setFile(f);
    if (!title.trim()) {
      const cleaned = f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim();
      const letters = (cleaned.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
      const digits = (cleaned.match(/\d/g) || []).length;
      const meaningful = letters >= 3 && letters >= digits && !/^song\s+\d{6,}/i.test(cleaned);
      if (meaningful) setTitle(cleaned);
    }
  };

  const handleLaunchAnalyze = () => {
    if (!uploadOk) return;
    const trimmedGenre = declaredGenre.trim();
    const trimmedIntent = artisticIntent.trim();
    onAnalyze?.({
      file,
      title: title.trim(),
      version: version.trim(),
      daw,
      projectId: uploadCtx.projectId,
      vocalType,
      // Persisté en colonne versions.upload_type. Le backend (lib/claude.js)
      // bascule la pondération master & loudness selon cette valeur.
      uploadType,
      refFile: null,
      // Genre : si l'utilisateur a tapé quelque chose on le passe, sinon
      // on bascule en auto-détection (équivalent ancien "Choisir
      // automatiquement" — supprimé de l'UI). Le pipeline infère depuis
      // l'écoute Gemini déjà faite, zéro coût supplémentaire.
      declaredGenre: trimmedGenre || null,
      genreUnknown: !trimmedGenre,
      // Intention artistique saisie en amont (toggle "+ Ajouter une
      // intention artistique"). On utilise le champ `inlineIntent`
      // existant que LoadingScreen passe directement dans /api/analyze/
      // start → le backend reçoit l'intention dès le départ et ne pause
      // plus sur `awaiting_intent` post-Phase-A. Plus d'IntentionScreen
      // à afficher mid-analyse, plus de double round-trip.
      inlineIntent: (intentExpanded && trimmedIntent) ? trimmedIntent : null,
      // Scope par défaut 'track' (cas le plus courant : V1, ou V2+
      // qui re-déclare l'intention pour tout le titre).
      _pendingIntentScope: 'track',
    });
    onClose();
  };

  // Reset upload form quand on sort du step upload (DAW reprend defaultDaw)
  useEffect(() => {
    if (step !== 'upload') {
      setFile(null);
      setTitle('');
      setVersion('');
      setDaw(defaultDaw || '');
      setVocalKind('vocal');
      setFinalInstru(null);
      setUploadType('mix');
      setDeclaredGenre('');
      setArtisticIntent('');
      setIntentExpanded(false);
      setDrag(false);
      setFileError(null);
      setFileChecking(false);
    }
  }, [step, defaultDaw]);

  // initialContext : ouvrir la modale directement dans un flow précis (mount only)
  const initRanRef = useRef(false);
  useEffect(() => {
    if (initRanRef.current) return;
    if (!initialContext) return;
    initRanRef.current = true;
    if (initialContext.mode === 'new-track') {
      if (!projects.length) {
        setNewProjectName('');
        setChainToUploadAfterCreate(true);
        setStep('new-project-name');
        return;
      }
      if (initialContext.projectId) {
        const p = projects.find((x) => x.id === initialContext.projectId);
        if (p) {
          setUploadCtx({ mode: 'new-track', projectId: p.id, projectName: p.name, prefillTitle: '', lockTitle: false });
          setTitle('');
          setStep('upload');
          return;
        }
      }
      if (projects.length === 1) {
        const p = projects[0];
        setUploadCtx({ mode: 'new-track', projectId: p.id, projectName: p.name, prefillTitle: '', lockTitle: false });
        setTitle('');
        setStep('upload');
        return;
      }
      setStep('pick-project');
      return;
    }
    if (initialContext.mode === 'add-version' && initialContext.trackId) {
      const t = allTracks.find((x) => x.id === initialContext.trackId);
      if (t) {
        const pName = t._projectName || projects.find((p) => p.id === t.projectId)?.name || '';
        setUploadCtx({
          mode: 'add-version',
          projectId: t.projectId,
          projectName: pName,
          prefillTitle: t.title,
          lockTitle: true,
        });
        setTitle(t.title);
        setStep('upload');
        return;
      }
      if (allTracks.length) setStep('pick-track');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers de navigation depuis le root ──────────────────
  const goUpload = (ctx) => {
    setUploadCtx(ctx);
    setTitle(ctx.prefillTitle || '');
    setStep('upload');
  };

  const handleNewProjectClick = () => {
    setNewProjectName('');
    setChainToUploadAfterCreate(false);
    setStep('new-project-name');
  };

  const handleNewTrackClick = () => {
    if (!hasProjects) {
      setNewProjectName('');
      setChainToUploadAfterCreate(true);
      setStep('new-project-name');
      return;
    }
    if (projects.length === 1) {
      const p = projects[0];
      goUpload({ mode: 'new-track', projectId: p.id, projectName: p.name, prefillTitle: '', lockTitle: false });
      return;
    }
    setStep('pick-project');
  };

  const handleAddVersionClick = () => {
    if (!hasTracks) return;
    if (allTracks.length === 1) {
      const t = allTracks[0];
      goUpload({
        mode: 'add-version',
        projectId: t.projectId,
        projectName: t._projectName || projects.find((p) => p.id === t.projectId)?.name || '',
        prefillTitle: t.title,
        lockTitle: true,
      });
      return;
    }
    setStep('pick-track');
  };

  const handleCreateProjectSubmit = async () => {
    const n = newProjectName.trim();
    if (!n || creatingProject) return;
    setCreatingProject(true);
    try {
      const created = await onCreateProject?.(n);
      setNewProjectName('');
      setCreatingProject(false);
      if (chainToUploadAfterCreate && created?.id) {
        setChainToUploadAfterCreate(false);
        goUpload({ mode: 'new-track', projectId: created.id, projectName: n, prefillTitle: '', lockTitle: false });
      } else {
        onClose();
      }
    } catch (err) {
      console.warn('create project from AddModal failed', err);
      setCreatingProject(false);
    }
  };

  // Retour intelligent depuis l'étape upload selon le flow
  const handleBack = () => {
    if (step === 'upload') {
      if (uploadCtx?.mode === 'add-version') {
        setStep(allTracks.length > 1 ? 'pick-track' : 'root');
      } else if (uploadCtx?.mode === 'new-track') {
        setStep(projects.length > 1 ? 'pick-project' : 'root');
      } else {
        setStep('root');
      }
      return;
    }
    setStep('root');
  };

  // ── Render ─────────────────────────────────────────────────
  const cardClass = `add-mini-card${step === 'upload' ? ' is-upload' : ''}`;

  return createPortal((
    <div className="add-mini-backdrop" onClick={onClose} role="presentation">
      <div
        className={cardClass}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={s.addModal.title}
      >
        {step !== 'root' && (
          <button type="button" className="add-mini-back" onClick={handleBack}>
            {s.addModal.back}
          </button>
        )}

        {step === 'root' && (
          <>
            <div className="add-mini-title">
              {s.addModal.rootTitleBefore} <em>{s.addModal.rootTitleEm}</em>
            </div>

            <div className="add-mini-choices">
              <button
                type="button"
                className="add-mini-choice"
                onClick={handleNewProjectClick}
              >
                <span className="add-mini-choice-icon is-amber" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                </span>
                <span className="add-mini-choice-body">
                  <div className="add-mini-choice-label">{s.addModal.choiceNewProjectLabel}</div>
                  <div className="add-mini-choice-desc">{s.addModal.choiceNewProjectDesc}</div>
                </span>
              </button>
              <button
                type="button"
                className="add-mini-choice"
                disabled={!hasProjects}
                onClick={handleNewTrackClick}
              >
                <span className="add-mini-choice-icon is-cerulean" aria-hidden="true">
                  {/* Croche (eighth note) : tête pleine tiltée + hampe verticale + crochet qui
                      retombe à droite — silhouette ♪ classique. */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 18.3V3.5" />
                    <path d="M10 3.5c3.3 .4 5.7 2.6 5.7 5.8" fill="none" />
                    <ellipse cx="6.6" cy="18.1" rx="3.4" ry="2.4" fill="currentColor" stroke="currentColor" transform="rotate(-22 6.6 18.1)" />
                  </svg>
                </span>
                <span className="add-mini-choice-body">
                  <div className="add-mini-choice-label">{s.addModal.choiceNewTrackLabel}</div>
                  <div className="add-mini-choice-desc">
                    {hasProjects ? s.addModal.choiceNewTrackDesc : s.addModal.choiceNewTrackDescDisabled}
                  </div>
                </span>
              </button>
              <button
                type="button"
                className="add-mini-choice"
                disabled={!hasTracks}
                onClick={handleAddVersionClick}
              >
                <span className="add-mini-choice-icon is-mint" aria-hidden="true">
                  {/* Feather RotateCw — arc clockwise quasi-complet + arrowhead en haut-droite */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 4 22 10 16 10" />
                    <path d="M19.49 15a9 9 0 1 1-2.12-9.36L22 10" />
                  </svg>
                </span>
                <span className="add-mini-choice-body">
                  <div className="add-mini-choice-label">{s.addModal.choiceAddVersionLabel}</div>
                  <div className="add-mini-choice-desc">
                    {hasTracks ? s.addModal.choiceAddVersionDesc : s.addModal.choiceAddVersionDescDisabled}
                  </div>
                </span>
              </button>
            </div>

            <div className="add-mini-foot">
              <button type="button" className="add-mini-btn" onClick={onClose}>
                {s.addModal.cancel}
              </button>
            </div>
          </>
        )}

        {step === 'new-project-name' && (
          <>
            <div className="add-mini-title">{amberLastWord(s.addModal.newProjectStepTitle)}</div>
            <input
              autoFocus
              className="add-mini-input"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newProjectName.trim() && !creatingProject) handleCreateProjectSubmit();
                if (e.key === 'Escape') setStep('root');
              }}
              placeholder={s.addModal.newProjectPlaceholder}
            />
            <div className="add-mini-foot">
              <button type="button" className="add-mini-btn" onClick={onClose}>
                {s.addModal.cancel}
              </button>
              <button
                type="button"
                className="add-mini-btn is-primary"
                onClick={handleCreateProjectSubmit}
                disabled={!newProjectName.trim() || creatingProject}
              >
                {s.addModal.newProjectConfirm}
              </button>
            </div>
          </>
        )}

        {step === 'pick-project' && (
          <>
            <div className="add-mini-title">{amberLastWord(s.addModal.pickProjectTitle)}</div>
            {projects.map((p) => {
              const n = p.tracks?.length || 0;
              return (
                <button
                  key={p.id}
                  type="button"
                  className="add-mini-pick"
                  onClick={() => goUpload({ mode: 'new-track', projectId: p.id, projectName: p.name, prefillTitle: '', lockTitle: false })}
                >
                  <span>{p.name}</span>
                  <span className="add-mini-pick-count">
                    {n} {n > 1 ? s.addModal.trackPlural : s.addModal.trackSingular}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              className="add-mini-create-new"
              onClick={() => { setNewProjectName(''); setChainToUploadAfterCreate(true); setStep('new-project-name'); }}
            >
              <span aria-hidden="true">+</span>
              <span>{s.addModal.createNewProject}</span>
            </button>
            <div className="add-mini-foot">
              <button type="button" className="add-mini-btn" onClick={onClose}>
                {s.addModal.cancel}
              </button>
            </div>
          </>
        )}

        {step === 'pick-track' && (
          <>
            <div className="add-mini-title">{amberLastWord(s.addModal.pickTrackTitle)}</div>
            {allTracks.map((t) => {
              const n = t.versions?.length || 0;
              return (
                <button
                  key={t.id}
                  type="button"
                  className="add-mini-pick"
                  onClick={() => goUpload({
                    mode: 'add-version',
                    projectId: t.projectId,
                    projectName: t._projectName || projects.find((p) => p.id === t.projectId)?.name || '',
                    prefillTitle: t.title,
                    lockTitle: true,
                  })}
                >
                  <span>{t.title}</span>
                  <span className="add-mini-pick-count">
                    {n} {n > 1 ? s.addModal.versionPlural : s.addModal.versionSingular}
                  </span>
                </button>
              );
            })}
            <div className="add-mini-foot">
              <button type="button" className="add-mini-btn" onClick={onClose}>
                {s.addModal.cancel}
              </button>
            </div>
          </>
        )}

        {step === 'upload' && uploadCtx && (
          <>
            <div className="add-mini-title">
              {(() => {
                // Réutilise les libellés des choix root pour rester raccord
                // avec ce que l'utilisateur vient de cliquer.
                const label = uploadCtx.mode === 'add-version'
                  ? s.addModal.choiceAddVersionLabel
                  : s.addModal.choiceNewTrackLabel;
                // Colorie le dernier mot en amber (via <em>), comme le titre
                // « Ajouter quoi ? » du step root.
                const idx = label.lastIndexOf(' ');
                if (idx < 0) return label;
                return <>{label.slice(0, idx)} <em>{label.slice(idx + 1)}</em></>;
              })()}
            </div>
            {/* Bandeau projet verrouillé */}
            <div className="add-mini-upload-banner">
              <span style={{ fontSize: 12, color: 'var(--amber)' }}>●</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="add-mini-upload-banner-kicker">
                  {uploadCtx.mode === 'add-version' ? s.addModal.uploadAddVersionTo : s.addModal.uploadInProject}
                </div>
                <div className="add-mini-upload-banner-name">
                  {uploadCtx.mode === 'add-version'
                    ? `${uploadCtx.prefillTitle} · ${uploadCtx.projectName}`
                    : uploadCtx.projectName}
                </div>
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <rect x="3" y="5.5" width="6" height="4.5" rx="1" stroke="var(--muted)" strokeWidth="1.2" fill="none" />
                <path d="M4.2 5.5 V 4 a 1.8 1.8 0 0 1 3.6 0 V 5.5" stroke="var(--muted)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              </svg>
            </div>

            {/* Zone drop */}
            <div className="add-mini-field">
              <div className="add-mini-field-label">{s.addModal.uploadMixLabel}</div>
              <div
                className={`add-mini-drop${file ? ' is-filled' : fileError ? ' is-error' : drag ? ' is-active' : ''}`}
                onClick={() => !fileChecking && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); if (!fileChecking) setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                  e.preventDefault(); setDrag(false);
                  if (fileChecking) return;
                  const f = e.dataTransfer.files?.[0];
                  if (f) handlePickFile(f);
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.aiff,.aif,.flac,.m4a,.ogg"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files?.[0] && handlePickFile(e.target.files[0])}
                />
                {fileChecking ? (
                  <>
                    <span style={{ color: 'var(--amber)', fontSize: 14 }} aria-hidden="true">⏳</span>
                    <div style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>
                      {s.addModal.uploadDurationReading}
                    </div>
                  </>
                ) : file ? (
                  <>
                    <span style={{ color: 'var(--mint)', fontSize: 16 }} aria-hidden="true">✓</span>
                    <div style={{
                      flex: 1, fontSize: 13, color: 'var(--text)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{file.name}</div>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={drag ? 'var(--amber)' : fileError ? 'var(--red, #ff5d5d)' : 'var(--muted)'} strokeWidth="1.6" aria-hidden="true">
                      <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
                      <path d="M8 8l4-4 4 4" />
                      <path d="M12 4v12" />
                    </svg>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: 'var(--text)' }}>{s.addModal.uploadDropText}</div>
                      <div style={{
                        fontSize: 9, letterSpacing: 1, color: 'var(--muted)',
                        fontFamily: 'var(--mono)', marginTop: 2,
                      }}>{s.addModal.uploadDropFormats}</div>
                    </div>
                  </>
                )}
              </div>
              {fileError && (
                <div className="add-mini-file-error">
                  <strong>
                    {fileError.kind === 'too_long'
                      ? s.addModal.uploadDurationTooLongTitle
                      : s.addModal.uploadDurationUnreadable.split('.')[0]}
                  </strong>
                  {fileError.kind === 'too_long' && (
                    <> {s.addModal.uploadDurationTooLongDetail.replace('{dur}', formatDuration(fileError.durationSec))}</>
                  )}
                </div>
              )}
            </div>

            {/* Titre + Version */}
            {file && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <div className="add-mini-field-label">{s.addModal.uploadTitleLabel}</div>
                  <input
                    className="add-mini-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={s.addModal.uploadTitlePlaceholder}
                    disabled={!!uploadCtx.lockTitle}
                  />
                </div>
                <div>
                  <div className="add-mini-field-label">{s.addModal.uploadVersionLabel}</div>
                  <input
                    className="add-mini-input"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder={s.addModal.uploadVersionPlaceholder}
                  />
                </div>
              </div>
            )}

            {/* Type vocal (nouveau titre uniquement) */}
            {file && askVocal && (
              <div className="add-mini-field">
                <div className="add-mini-field-label">{s.addModal.uploadVocalLabel}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`add-mini-pill${vocalKind === 'vocal' ? ' on' : ''}`}
                    onClick={() => { setVocalKind('vocal'); setFinalInstru(null); }}
                  >{s.addModal.uploadVocalSung}</button>
                  <button
                    type="button"
                    className={`add-mini-pill${vocalKind === 'instrumental' ? ' on' : ''}`}
                    onClick={() => setVocalKind('instrumental')}
                  >{s.addModal.uploadVocalInstrumental}</button>
                </div>
                {vocalKind === 'instrumental' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className={`add-mini-pill${finalInstru === false ? ' on' : ''}`}
                      onClick={() => setFinalInstru(false)}
                    >{s.addModal.uploadVocalComing}</button>
                    <button
                      type="button"
                      className={`add-mini-pill${finalInstru === true ? ' on' : ''}`}
                      onClick={() => setFinalInstru(true)}
                    >{s.addModal.uploadVocalFinal}</button>
                  </div>
                )}
              </div>
            )}

            {/* Mix / Master toggle — placé entre vocal et DAW (spec
                CLAUDE.md "Toggle Mix/Master à l'upload"). Default 'mix'.
                On garde la même grammaire que les pills vocal pour
                rester cohérent visuellement. La hint sous le toggle
                explique en clair l'impact sur le score, au cas où
                l'utilisateur ne sait pas quoi cocher.
                Toujours visible (pas de gate sur `file`) pour rester
                cohérent avec DAW/Genre qui s'affichent dès l'ouverture. */}
            <div className="add-mini-field">
              <div className="add-mini-field-label">{s.addModal.uploadTypeLabel}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`add-mini-pill${uploadType === 'mix' ? ' on' : ''}`}
                  onClick={() => setUploadType('mix')}
                >{s.addModal.uploadTypeMix}</button>
                <button
                  type="button"
                  className={`add-mini-pill${uploadType === 'master' ? ' on' : ''}`}
                  onClick={() => setUploadType('master')}
                >{s.addModal.uploadTypeMaster}</button>
              </div>
              <div style={{
                marginTop: 8,
                fontSize: 11.5,
                lineHeight: 1.45,
                color: 'var(--muted)',
                fontWeight: 300,
              }}>
                {uploadType === 'mix'
                  ? s.addModal.uploadTypeMixHint
                  : s.addModal.uploadTypeMasterHint}
              </div>
            </div>

            {/* DAW */}
            <div className="add-mini-field">
              <div className="add-mini-field-label">{s.addModal.uploadDawLabel}</div>
              <div className="add-mini-select-wrap">
                <select
                  className="add-mini-select"
                  value={daw}
                  onChange={(e) => setDaw(e.target.value)}
                >
                  <option value="">{s.addModal.uploadDawPlaceholder}</option>
                  {DAWS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <div className="add-mini-select-arrow" aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Genre musical — texte libre. Si vide au moment du
                lancement, le pipeline détecte automatiquement (cf.
                handleLaunchAnalyze : genreUnknown = !trimmedGenre).
                Plus de bouton "Choisir automatiquement" : moins de
                décisions, le défaut intelligent suffit. */}
            <div className="add-mini-field">
              <div className="add-mini-field-label">{s.addModal.uploadGenreLabel}</div>
              <input
                type="text"
                className="add-mini-input"
                value={declaredGenre}
                placeholder={s.addModal.uploadGenrePlaceholder}
                maxLength={60}
                onChange={(e) => setDeclaredGenre(e.target.value)}
              />
            </div>

            {/* Intention artistique — toggle dépliable. Plié par défaut
                pour ne pas alourdir la modale. Si l'utilisateur clique
                "+ Ajouter une intention artistique", le textarea
                apparaît. Si saisi, le pipeline saute l'IntentionScreen
                post-Phase-A (tout est en amont, pas d'interruption). */}
            <div className="add-mini-field">
              {!intentExpanded ? (
                <button
                  type="button"
                  className="add-mini-intent-toggle"
                  onClick={() => setIntentExpanded(true)}
                >
                  + Ajouter une intention artistique
                </button>
              ) : (
                <>
                  <div className="add-mini-field-label add-mini-field-label-row">
                    <span>Intention artistique</span>
                    <button
                      type="button"
                      className="add-mini-intent-collapse"
                      onClick={() => { setIntentExpanded(false); setArtisticIntent(''); }}
                      aria-label="Replier"
                      title="Replier"
                    >×</button>
                  </div>
                  <textarea
                    className="add-mini-input add-mini-textarea"
                    value={artisticIntent}
                    onChange={(e) => setArtisticIntent(e.target.value)}
                    placeholder="Ex : Je vise un son à la Frank Ocean — Blonde, pas Channel Orange."
                    rows={3}
                    maxLength={600}
                  />
                </>
              )}
            </div>

            {/* CTA */}
            <button
              type="button"
              className="add-mini-cta"
              onClick={handleLaunchAnalyze}
              disabled={!uploadOk}
            >
              {uploadOk ? s.addModal.uploadCta : s.addModal.uploadCtaIncomplete}
            </button>
          </>
        )}
      </div>
    </div>
  ), document.body);
}
