import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useLang from '../hooks/useLang';
import DAWS from '../constants/daws';

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
  // Genre musical déclaré par l'artiste à l'upload. Soit du texte libre court,
  // soit `genreUnknown=true` quand l'utilisateur clique "Choisir automatiquement"
  // (Claude infère depuis l'écoute Gemini déjà faite, zéro coût supplémentaire).
  // Les deux états sont mutuellement exclusifs côté UI : cocher l'auto vide le
  // texte ; commencer à taper du texte décoche l'auto.
  const [declaredGenre, setDeclaredGenre] = useState('');
  const [genreUnknown, setGenreUnknown] = useState(false);
  const [drag, setDrag] = useState(false);
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

  const handlePickFile = (f) => {
    if (!f) return;
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
    onAnalyze?.({
      file,
      title: title.trim(),
      version: version.trim(),
      daw,
      projectId: uploadCtx.projectId,
      vocalType,
      refFile: null,
      // Genre musical : soit déclaré (texte non vide), soit "auto" (genreUnknown=true).
      // Si rien n'est rempli ni coché, on envoie null/false : le pipeline analyse
      // sans signal genre (mode legacy).
      declaredGenre: declaredGenre.trim() || null,
      genreUnknown: !!genreUnknown,
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
      setDeclaredGenre('');
      setGenreUnknown(false);
      setDrag(false);
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
                className={`add-mini-drop${file ? ' is-filled' : drag ? ' is-active' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                  e.preventDefault(); setDrag(false);
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
                {file ? (
                  <>
                    <span style={{ color: 'var(--mint)', fontSize: 16 }} aria-hidden="true">✓</span>
                    <div style={{
                      flex: 1, fontSize: 13, color: 'var(--text)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{file.name}</div>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={drag ? 'var(--amber)' : 'var(--muted)'} strokeWidth="1.6" aria-hidden="true">
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

            {/* Genre musical : texte libre OU "Choisir automatiquement".
                Mutuellement exclusifs : cliquer "auto" vide et grise le champ ;
                taper du texte décoche l'auto. Le genre déclaré sert de calibrage
                pour Claude (un mix dub-techno tolère ce qu'un mix folk ne
                tolère pas), et pour mention textuelle dans le verdict. Le mode
                "auto" délègue la détection au pipeline (zéro coût car partagé
                avec l'écoute Gemini déjà faite). */}
            <div className="add-mini-field">
              <div className="add-mini-field-label">{s.addModal.uploadGenreLabel}</div>
              {/* En mode auto, on affiche le message comme VALEUR (italic, opacité
                  pleine) plutôt que placeholder dans un input disabled : sinon
                  le texte est trop estompé. readOnly empêche l'édition mais ne
                  casse pas le contraste. Pour quitter le mode auto, l'utilisateur
                  re-clique sur le bouton "Choisir automatiquement" en dessous. */}
              <input
                type="text"
                className={`add-mini-input${genreUnknown ? ' is-auto' : ''}`}
                value={genreUnknown ? s.addModal.uploadGenreAutoHint : declaredGenre}
                placeholder={s.addModal.uploadGenrePlaceholder}
                readOnly={genreUnknown}
                maxLength={60}
                style={genreUnknown ? { fontStyle: 'italic' } : undefined}
                onChange={(e) => {
                  if (genreUnknown) return;
                  setDeclaredGenre(e.target.value);
                }}
              />
              <button
                type="button"
                className={`add-mini-pill${genreUnknown ? ' on' : ''}`}
                style={{ marginTop: 8 }}
                onClick={() => {
                  setGenreUnknown((v) => {
                    const next = !v;
                    if (next) setDeclaredGenre(''); // bascule en auto -> on vide le texte
                    return next;
                  });
                }}
              >
                {s.addModal.uploadGenreAutoBtn}
              </button>
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
