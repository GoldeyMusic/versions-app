import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import useLang from '../hooks/useLang';
import DAWS from '../constants/daws';
import { confirmDialog } from '../lib/confirm.jsx';
import { logProductEvent } from '../lib/productEvents';

// Cap audio (sync avec backend versions-api/api/analyze.js).
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

// Titre « propre » déduit du nom de fichier (sans extension, tirets → espaces).
// Renvoie '' si le nom ne ressemble pas à un titre (ex: "song 20260412_0931").
// Suffixe de version courant en fin de nom de fichier : "v2", "V3b",
// "final", "master", "pre-master", "rough mix", "mix 4", "take 2"…
const VERSION_SUFFIX_RE = /\s+(v\s?\d+[a-z]?|final|master|pre[\s-]?master|rough(?:\s+mix)?|mix(?:\s?\d+)?|take\s?\d+)$/i;

// Titre « propre » déduit du nom de fichier (sans extension, tirets → espaces)
// + suffixe de version détaché s'il y en a un ("Tout s'efface v2.wav" →
// { title: "Tout s'efface", version: "v2" }). title = '' si le nom ne
// ressemble pas à un titre (ex: "6.mp3", "song 20260412_0931").
function parseFilename(name) {
  let cleaned = String(name || '').replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  let version = '';
  const m = cleaned.match(VERSION_SUFFIX_RE);
  if (m && cleaned.slice(0, m.index).trim()) {
    version = m[1].replace(/\s+/g, ' ').toLowerCase();
    cleaned = cleaned.slice(0, m.index).trim();
  }
  const letters = (cleaned.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
  const digits = (cleaned.match(/\d/g) || []).length;
  const meaningful = letters >= 3 && letters >= digits && !/^song\s+\d{6,}/i.test(cleaned);
  return { title: meaningful ? cleaned : '', version };
}

// Normalisation pour comparer un titre déduit à un titre existant :
// minuscules, ponctuation/apostrophes → espace ("Tout s'efface" ≈ "tout s efface").
const norm = (v) => String(v || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/**
 * AddModal — modale unifiée d'ajout depuis la home.
 *
 * Refonte « fichier d'abord » (audit 2026-11-06). Avant : 3 choix
 * (projet / titre / version) → choix du projet → formulaire de 9 champs.
 * Maintenant :
 *   - 'file'             : une seule chose à faire, déposer le mix.
 *   - 'details'          : titre (pré-rempli depuis le nom de fichier),
 *                          version (pré-remplie), nouveau titre / nouvelle
 *                          version (auto-détecté si le titre existe déjà),
 *                          masterisé ?, intention, droits, puis « Lancer ».
 *                          DAW (pré-rempli depuis le profil), genre et BPM
 *                          sont repliés dans « Plus d'options ».
 *   - 'new-project-name' : création inline d'un projet (depuis un lien
 *                          du step file ou l'option « + Nouveau projet »).
 * S'il n'existe aucun projet, un projet « Mes titres » est créé en
 * silence au lancement : l'utilisateur ne gère pas de dossiers avant
 * d'avoir vu sa première fiche.
 *
 * Props :
 *   - onClose            : ferme la modale
 *   - onCreateProject    : (name) => Promise<project>
 *   - onAnalyze          : (cfg) => void
 *   - projects           : [{ id, name, tracks }]
 *   - allTracks          : [...] titres à plat (avec projectId)
 *   - initialContext     : optionnel, ouvre directement dans un flow précis
 *                          - { mode: 'new-track', projectId? }
 *                          - { mode: 'add-version', trackId }
 *   - defaultDaw         : optionnel, DAW par défaut issu du profil
 *   - defaultProjectId   : optionnel, projet courant sur la home
 */
export default function AddModal({
  onClose,
  onCreateProject,
  onAnalyze,
  projects = [],
  allTracks = [],
  initialContext = null,
  defaultDaw = '',
  defaultProjectId = null,
}) {
  const { s, lang } = useLang();
  const a = s.addModal;

  // ── Contexte initial ───────────────────────────────────────
  const initialTrack = initialContext?.mode === 'add-version' && initialContext.trackId
    ? allTracks.find((t) => t.id === initialContext.trackId) || null
    : null;
  const lockedKind = initialTrack ? 'add-version' : null;

  // ── Navigation ─────────────────────────────────────────────
  const [step, setStep] = useState('file');
  // Step d'où on vient quand on ouvre 'new-project-name' (pour y revenir).
  const [returnStep, setReturnStep] = useState('file');

  // Nouveau projet inline
  const [newProjectName, setNewProjectName] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);

  // ── Fichier ────────────────────────────────────────────────
  const [file, setFile] = useState(null);
  const [fileChecking, setFileChecking] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [drag, setDrag] = useState(false);
  const fileInputRef = useRef(null);
  // Titre auto-déduit du dernier fichier : si l'utilisateur n'a pas touché
  // au titre, un changement de fichier peut le re-déduire.
  const autoTitleRef = useRef('');

  // ── Détails ────────────────────────────────────────────────
  const [kind, setKind] = useState(lockedKind || 'new-track'); // 'new-track' | 'add-version'
  const [kindAuto, setKindAuto] = useState(false); // bascule auto vers add-version
  const [targetTrackId, setTargetTrackId] = useState(initialTrack?.id || null);
  const [projectId, setProjectId] = useState(() => {
    if (initialTrack) return initialTrack.projectId || null;
    if (initialContext?.projectId && projects.some((p) => p.id === initialContext.projectId)) return initialContext.projectId;
    if (defaultProjectId && projects.some((p) => p.id === defaultProjectId)) return defaultProjectId;
    return projects[0]?.id || null;
  });
  const [title, setTitle] = useState(initialTrack?.title || '');
  const [version, setVersion] = useState('');
  const [daw, setDaw] = useState(defaultDaw || '');
  const [vocalKind, setVocalKind] = useState('vocal');
  const [finalInstru, setFinalInstru] = useState(null);
  // "Ce mix a-t-il été masterisé ?" — 'yes' → upload_type 'master',
  // 'no' (défaut) → 'mix'. Cf. lib/claude.js côté backend pour la pondération.
  const [masteredAnswer, setMasteredAnswer] = useState('no');
  const [declaredGenre, setDeclaredGenre] = useState('');
  const [artisticIntent, setArtisticIntent] = useState('');
  const [copyrightAck, setCopyrightAck] = useState(false);
  const [userBpm, setUserBpm] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const [launching, setLaunching] = useState(false);

  // Instrumentation (migration 058) : ouverture, fichier accepté, lancement,
  // fermeture sans lancement (= abandon). Fire-and-forget.
  const launchedRef = useRef(false);
  const fileLoggedRef = useRef(false);
  useEffect(() => {
    logProductEvent('add_modal_open', { mode: initialContext?.mode || 'free' });
    return () => {
      if (!launchedRef.current) {
        logProductEvent('add_modal_close', { had_file: fileLoggedRef.current });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Le DAW n'est demandé en clair que si le profil n'en a pas. Sinon il
  // est pré-rempli et modifiable dans « Plus d'options ».
  const dawInMain = !defaultDaw;
  // Écran tactile (téléphone/tablette) : on ne « dépose » pas un fichier,
  // on le choisit. Le texte du hero s'adapte (passage mobile 2026-11-06).
  const isTouch = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    && window.matchMedia('(pointer: coarse)').matches;

  // Placeholders rotatifs (cf. version précédente de la modale).
  const VERSION_EXAMPLES = ['v1', 'rough', 'rough mix', 'pre-master', 'master', 'v2 — voix témoins'];
  const GENRE_EXAMPLES = lang === 'en'
    ? ['indie pop', 'neo-soul', 'dub-techno', 'lo-fi hip-hop', 'french folk', 'electronic', 'r&b', 'ambient']
    : ['indie pop', 'néo-soul', 'dub-techno', 'lo-fi hip-hop', 'folk français', 'électro', 'r&b', 'ambient'];
  const INTENT_EXAMPLES = lang === 'en' ? [
    'e.g. I’m aiming for a Frank Ocean — Blonde sound, not Channel Orange.',
    'e.g. Warm and intimate, like a folk song recorded at home.',
    'e.g. Energetic, club-ready, but with melodic vocals up front.',
    'e.g. I want it to feel cinematic — sparse, wide, slow build.',
    'e.g. Lo-fi vibe, vinyl crackle, vocals slightly buried.',
  ] : [
    'Ex : Je vise un son à la Frank Ocean — Blonde, pas Channel Orange.',
    'Ex : Chaud et intime, comme un titre folk enregistré à la maison.',
    'Ex : Énergique, clubby, mais avec la voix qui reste devant.',
    'Ex : Je veux que ce soit cinématique — minimal, large, build lent.',
    'Ex : Vibe lo-fi, crackle vinyle, voix légèrement enfouie.',
  ];
  const [phRotIdx, setPhRotIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPhRotIdx((i) => i + 1), 3500);
    return () => clearInterval(id);
  }, []);
  const versionPh = VERSION_EXAMPLES[phRotIdx % VERSION_EXAMPLES.length];
  const genrePh = (lang === 'en' ? 'e.g. ' : 'Ex : ') + GENRE_EXAMPLES[phRotIdx % GENRE_EXAMPLES.length];
  const intentPh = INTENT_EXAMPLES[phRotIdx % INTENT_EXAMPLES.length];

  // ── Dérivés ────────────────────────────────────────────────
  const hasTracks = allTracks.length > 0;
  const targetTrack = useMemo(
    () => (kind === 'add-version' && targetTrackId ? allTracks.find((t) => t.id === targetTrackId) || null : null),
    [kind, targetTrackId, allTracks],
  );
  const effectiveProjectId = kind === 'add-version' ? (targetTrack?.projectId || null) : projectId;
  const effectiveProject = projects.find((p) => p.id === effectiveProjectId) || null;
  const effectiveTitle = kind === 'add-version' ? (targetTrack?.title || '') : title;

  const askVocal = kind === 'new-track';
  const vocalType = vocalKind === 'vocal'
    ? 'vocal'
    : (finalInstru === true ? 'instrumental_final'
      : finalInstru === false ? 'instrumental_pending'
        : null);
  const vocalOk = !askVocal || vocalType !== null;
  // Projet requis seulement s'il en existe (sinon créé en silence au lancement).
  const projectOk = kind === 'add-version' ? !!targetTrack : (projects.length === 0 || !!effectiveProject);

  const uploadOk = !!file && !!daw && !!effectiveTitle.trim() && !!version.trim()
    && projectOk && vocalOk && copyrightAck && !launching;

  // Version par défaut : v1 pour un nouveau titre, v{n+1} pour une version.
  const defaultVersionFor = (k, track) => {
    if (k === 'add-version' && track) return `v${(track.versions?.length || 0) + 1}`;
    return 'v1';
  };
  const versionTouchedRef = useRef(false);
  useEffect(() => {
    if (versionTouchedRef.current) return;
    setVersion(defaultVersionFor(kind, targetTrack));
  }, [kind, targetTrack]);

  // ── Fichier : lecture durée + pré-remplissage ─────────────
  const handlePickFile = async (f) => {
    if (!f) return;
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
    setFile(f);
    if (!fileLoggedRef.current) {
      fileLoggedRef.current = true;
      logProductEvent('add_modal_file', { duration_sec: Math.round(dur), ext: (f.name.split('.').pop() || '').toLowerCase() });
    }

    // Titre : on ne touche qu'à un titre vide ou encore égal au précédent
    // titre auto-déduit (l'utilisateur n'a rien écrit lui-même).
    const parsed = parseFilename(f.name);
    const auto = parsed.title;
    if (!lockedKind && (!title.trim() || title === autoTitleRef.current) && auto) {
      setTitle(auto);
    }
    autoTitleRef.current = auto;

    // Suffixe de version lu dans le nom de fichier ("… v2.wav") : on le
    // propose comme nom de version, sauf si l'utilisateur a déjà écrit le sien.
    if (parsed.version && !versionTouchedRef.current) {
      setVersion(parsed.version);
      versionTouchedRef.current = true;
    }

    // Auto-détection « nouvelle version » : le titre déduit correspond à un
    // titre existant → on bascule, l'utilisateur peut revenir en arrière.
    if (!lockedKind && auto) {
      const match = allTracks.find((t) => norm(t.title) === norm(auto));
      if (match) {
        setKind('add-version');
        setTargetTrackId(match.id);
        setKindAuto(true);
      } else if (kindAuto) {
        setKind('new-track');
        setTargetTrackId(null);
        setKindAuto(false);
      }
    }
    setStep('details');
  };

  // Changement de fichier depuis le step details (lien « Changer »).
  const openFilePicker = () => { if (!fileChecking) fileInputRef.current?.click(); };

  // ── Lancement ──────────────────────────────────────────────
  const handleLaunchAnalyze = async () => {
    if (!uploadOk) return;
    setLaunching(true);
    let pid = effectiveProjectId;
    try {
      if (!pid) {
        // Aucun projet : on en crée un par défaut, sans rien demander.
        const created = await onCreateProject?.(a.defaultProjectName);
        pid = created?.id || null;
      }
    } catch (err) {
      console.warn('default project creation failed', err);
    }
    if (!pid) { setLaunching(false); return; }

    const trimmedGenre = declaredGenre.trim();
    const trimmedIntent = artisticIntent.trim();
    launchedRef.current = true;
    logProductEvent('add_modal_launch', {
      kind,
      has_intent: !!trimmedIntent,
      has_genre: !!trimmedGenre,
      mastered: masteredAnswer === 'yes',
      project_created: !effectiveProjectId,
    });
    onAnalyze?.({
      file,
      title: effectiveTitle.trim(),
      version: version.trim(),
      daw,
      projectId: pid,
      vocalType,
      uploadType: masteredAnswer === 'yes' ? 'master' : 'mix',
      refFile: null,
      declaredGenre: trimmedGenre || null,
      genreUnknown: !trimmedGenre,
      inlineIntent: trimmedIntent || null,
      _pendingIntentScope: 'track',
      copyrightAcknowledgedAt: new Date().toISOString(),
      userBpm: (() => {
        const n = parseFloat((userBpm || '').trim().replace(',', '.'));
        if (!Number.isFinite(n) || n < 30 || n > 300) return null;
        return n;
      })(),
    });
    onClose();
  };

  // ── Projet inline ──────────────────────────────────────────
  const goNewProject = (from) => {
    setReturnStep(from);
    setNewProjectName('');
    setStep('new-project-name');
  };
  const handleCreateProjectSubmit = async () => {
    const n = newProjectName.trim();
    if (!n || creatingProject) return;
    setCreatingProject(true);
    try {
      const created = await onCreateProject?.(n);
      setCreatingProject(false);
      if (created?.id) {
        setKind('new-track');
        setTargetTrackId(null);
        setKindAuto(false);
        setProjectId(created.id);
      }
      setStep(file ? 'details' : returnStep);
    } catch (err) {
      console.warn('create project from AddModal failed', err);
      setCreatingProject(false);
    }
  };

  const handleBack = () => {
    if (step === 'new-project-name') { setStep(file ? 'details' : returnStep); return; }
    if (step === 'details') { setStep('file'); return; }
    setStep('file');
  };

  // ── Render ─────────────────────────────────────────────────
  const cardClass = `add-mini-card is-upload${step === 'file' ? ' is-file-step' : ''}`;

  const contextBanner = () => {
    if (kind === 'add-version' && targetTrack) {
      const pName = targetTrack._projectName || effectiveProject?.name || '';
      return (
        <div className="add-mini-upload-banner">
          <span className="add-mini-upload-banner-dot" aria-hidden="true">●</span>
          <div className="add-mini-upload-banner-body">
            <div className="add-mini-upload-banner-kicker">{a.uploadAddVersionTo}</div>
            <div className="add-mini-upload-banner-name">{targetTrack.title}{pName ? ` · ${pName}` : ''}</div>
          </div>
        </div>
      );
    }
    if (effectiveProject) {
      return (
        <div className="add-mini-upload-banner">
          <span className="add-mini-upload-banner-dot" aria-hidden="true">●</span>
          <div className="add-mini-upload-banner-body">
            <div className="add-mini-upload-banner-kicker">{a.uploadInProject}</div>
            <div className="add-mini-upload-banner-name">{effectiveProject.name}</div>
          </div>
        </div>
      );
    }
    return null;
  };

  return createPortal((
    <div className="add-mini-backdrop" onClick={onClose} role="presentation">
      <div
        className={cardClass}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={a.title}
      >
        {/* Input fichier unique, partagé par le hero (step file) et le
            lien « Changer » (step details). */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/wav,audio/mpeg,audio/flac,.wav,.mp3,.flac"
          style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) handlePickFile(f); }}
        />

        {step !== 'file' && (
          <button type="button" className="add-mini-back" onClick={handleBack}>
            {a.back}
          </button>
        )}

        {/* ── STEP 1 : le fichier ─────────────────────────────── */}
        {step === 'file' && (
          <>
            <div className="add-mini-title">{amberLastWord(a.fileStepTitle)}</div>
            {(lockedKind || initialContext?.projectId) && contextBanner()}

            <div
              className={`add-mini-hero-drop${fileError ? ' is-error' : drag ? ' is-active' : ''}${fileChecking ? ' is-busy' : ''}`}
              onClick={openFilePicker}
              onDragOver={(e) => { e.preventDefault(); if (!fileChecking) setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault(); setDrag(false);
                if (fileChecking) return;
                const f = e.dataTransfer.files?.[0];
                if (f) handlePickFile(f);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFilePicker(); } }}
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
                <path d="M8 8l4-4 4 4" />
                <path d="M12 4v12" />
              </svg>
              <div className="add-mini-hero-text">
                {fileChecking ? a.fileHeroChecking : (isTouch ? a.fileHeroTextTouch : a.fileHeroText)}
              </div>
              {!fileChecking && <div className="add-mini-hero-sub">{isTouch ? a.fileHeroSubTouch : a.fileHeroSub}</div>}
              <div className="add-mini-hero-formats">{a.fileHeroFormats}</div>
            </div>
            {fileError && (
              <div className="add-mini-file-error">
                <strong>
                  {fileError.kind === 'too_long'
                    ? a.uploadDurationTooLongTitle
                    : a.uploadDurationUnreadable.split('.')[0]}
                </strong>
                {fileError.kind === 'too_long' && (
                  <> {a.uploadDurationTooLongDetail.replace('{dur}', formatDuration(fileError.durationSec))}</>
                )}
              </div>
            )}

            <div className="add-mini-foot is-between">
              {!lockedKind ? (
                <button type="button" className="add-mini-link" onClick={() => goNewProject('file')}>
                  <span aria-hidden="true">+</span> {a.createProjectLink}
                </button>
              ) : <span />}
              <button type="button" className="add-mini-btn" onClick={onClose}>
                {a.cancel}
              </button>
            </div>
          </>
        )}

        {/* ── Création de projet inline ───────────────────────── */}
        {step === 'new-project-name' && (
          <>
            <div className="add-mini-title">{amberLastWord(a.newProjectStepTitle)}</div>
            <input
              autoFocus
              className="add-mini-input"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newProjectName.trim() && !creatingProject) handleCreateProjectSubmit();
                if (e.key === 'Escape') handleBack();
              }}
              placeholder={a.newProjectPlaceholder}
            />
            <div className="add-mini-foot">
              <button type="button" className="add-mini-btn" onClick={handleBack}>
                {a.cancel}
              </button>
              <button
                type="button"
                className="add-mini-btn is-primary"
                onClick={handleCreateProjectSubmit}
                disabled={!newProjectName.trim() || creatingProject}
              >
                {a.newProjectConfirm}
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2 : les précisions ─────────────────────────── */}
        {step === 'details' && file && (
          <>
            <div className="add-mini-title">{amberLastWord(a.detailsStepTitle)}</div>

            {/* Fichier retenu + lien Changer */}
            <div className="add-mini-file-row">
              <span className="add-mini-drop-icon is-mint" aria-hidden="true">✓</span>
              <div className="add-mini-drop-text is-truncate">{file.name}</div>
              <button type="button" className="add-mini-link" onClick={openFilePicker} disabled={fileChecking}>
                {fileChecking ? a.fileHeroChecking : a.changeFile}
              </button>
            </div>
            {fileError && (
              <div className="add-mini-file-error">
                <strong>
                  {fileError.kind === 'too_long'
                    ? a.uploadDurationTooLongTitle
                    : a.uploadDurationUnreadable.split('.')[0]}
                </strong>
                {fileError.kind === 'too_long' && (
                  <> {a.uploadDurationTooLongDetail.replace('{dur}', formatDuration(fileError.durationSec))}</>
                )}
              </div>
            )}

            {/* Nouveau titre / nouvelle version — seulement s'il y a déjà
                des titres et que le contexte ne l'impose pas. */}
            {!lockedKind && hasTracks && (
              <div className="add-mini-field">
                <div className="add-mini-field-label">{a.kindLabel}</div>
                <div className="add-mini-pill-row">
                  <button
                    type="button"
                    className={`add-mini-pill${kind === 'new-track' ? ' on' : ''}`}
                    onClick={() => { setKind('new-track'); setKindAuto(false); versionTouchedRef.current = false; }}
                  >{a.kindNewTrack}</button>
                  <button
                    type="button"
                    className={`add-mini-pill${kind === 'add-version' ? ' on' : ''}`}
                    onClick={() => {
                      setKind('add-version');
                      setKindAuto(false);
                      versionTouchedRef.current = false;
                      if (!targetTrackId && allTracks.length === 1) setTargetTrackId(allTracks[0].id);
                    }}
                  >{a.kindNewVersion}</button>
                </div>
                {kind === 'add-version' && kindAuto && (
                  <div className="add-mini-field-hint">{a.kindVersionAutoHint}</div>
                )}
              </div>
            )}

            {/* Cible : titre existant (version) ou projet (nouveau titre) */}
            {kind === 'add-version' && !lockedKind && (
              <div className="add-mini-field">
                <div className="add-mini-field-label">
                  {a.pickTrackLabel}
                  <span className="add-mini-required" aria-hidden="true">*</span>
                </div>
                <div className="add-mini-select-wrap">
                  <select
                    className="add-mini-select"
                    value={targetTrackId || ''}
                    onChange={(e) => { setTargetTrackId(e.target.value || null); versionTouchedRef.current = false; }}
                  >
                    <option value="">{a.pickTrackPlaceholder}</option>
                    {allTracks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}{t._projectName ? ` · ${t._projectName}` : ''}
                      </option>
                    ))}
                  </select>
                  <div className="add-mini-select-arrow" aria-hidden="true">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
            {lockedKind && contextBanner()}

            {/* Titre + Version */}
            <div className="add-mini-grid-2col">
              <div>
                <div className="add-mini-field-label">
                  {a.uploadTitleLabel}
                  <span className="add-mini-required" aria-hidden="true">*</span>
                </div>
                <input
                  className="add-mini-input"
                  value={effectiveTitle}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={a.uploadTitlePlaceholder}
                  disabled={kind === 'add-version'}
                />
              </div>
              <div>
                <div className="add-mini-field-label">
                  {a.uploadVersionLabel}
                  <span className="add-mini-required" aria-hidden="true">*</span>
                </div>
                <input
                  className="add-mini-input"
                  value={version}
                  onChange={(e) => { versionTouchedRef.current = true; setVersion(e.target.value); }}
                  placeholder={versionPh}
                />
              </div>
            </div>

            {/* Projet (nouveau titre, plusieurs projets) */}
            {kind === 'new-track' && projects.length > 1 && (
              <div className="add-mini-field">
                <div className="add-mini-field-label">{a.projectLabel}</div>
                <div className="add-mini-select-wrap">
                  <select
                    className="add-mini-select"
                    value={projectId || ''}
                    onChange={(e) => {
                      if (e.target.value === '__new__') { goNewProject('details'); return; }
                      setProjectId(e.target.value || null);
                    }}
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                    <option value="__new__">{a.projectNewOption}</option>
                  </select>
                  <div className="add-mini-select-arrow" aria-hidden="true">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Type vocal (nouveau titre uniquement) */}
            {askVocal && (
              <div className="add-mini-field">
                <div className="add-mini-field-label">{a.uploadVocalLabel}</div>
                <div className="add-mini-pill-row">
                  <button
                    type="button"
                    className={`add-mini-pill${vocalKind === 'vocal' ? ' on' : ''}`}
                    onClick={() => { setVocalKind('vocal'); setFinalInstru(null); }}
                  >{a.uploadVocalSung}</button>
                  <button
                    type="button"
                    className={`add-mini-pill${vocalKind === 'instrumental' ? ' on' : ''}`}
                    onClick={() => setVocalKind('instrumental')}
                  >{a.uploadVocalInstrumental}</button>
                </div>
                {vocalKind === 'instrumental' && (
                  <div className="add-mini-pill-row add-mini-pill-row-sub">
                    <button
                      type="button"
                      className={`add-mini-pill${finalInstru === false ? ' on' : ''}`}
                      onClick={() => setFinalInstru(false)}
                    >{a.uploadVocalComing}</button>
                    <button
                      type="button"
                      className={`add-mini-pill${finalInstru === true ? ' on' : ''}`}
                      onClick={() => setFinalInstru(true)}
                    >{a.uploadVocalFinal}</button>
                  </div>
                )}
              </div>
            )}

            {/* Masterisé ? */}
            <div className="add-mini-field">
              <div className="add-mini-field-label">{a.uploadTypeLabel}</div>
              <div className="add-mini-pill-row">
                <button
                  type="button"
                  className={`add-mini-pill${masteredAnswer === 'yes' ? ' on' : ''}`}
                  onClick={async () => {
                    // Confirmation à chaque clic sur « Oui » : un limiteur posé
                    // sur le master pour l'écoute n'est pas un master.
                    const choice = await confirmDialog({
                      title: a.uploadTypeMasterConfirmTitle,
                      message: a.uploadTypeMasterConfirmMessage,
                      confirmLabel: a.uploadTypeMasterConfirmYes,
                      cancelLabel: a.uploadTypeMasterConfirmNo,
                      stackedButtons: true,
                    });
                    setMasteredAnswer(choice === 'confirm' ? 'yes' : 'no');
                  }}
                >{a.uploadTypeYes}</button>
                <button
                  type="button"
                  className={`add-mini-pill${masteredAnswer === 'no' ? ' on' : ''}`}
                  onClick={() => setMasteredAnswer('no')}
                >{a.uploadTypeNo}</button>
              </div>
              <div className="add-mini-field-hint">
                {masteredAnswer === 'yes' ? a.uploadTypeYesHint : a.uploadTypeNoHint}
              </div>
            </div>

            {/* DAW en clair uniquement si le profil n'en a pas */}
            {dawInMain && (
              <div className="add-mini-field">
                <div className="add-mini-field-label">
                  {a.uploadDawLabel}
                  <span className="add-mini-required" aria-hidden="true">*</span>
                </div>
                <div className="add-mini-select-wrap">
                  <select className="add-mini-select" value={daw} onChange={(e) => setDaw(e.target.value)}>
                    <option value="">{a.uploadDawPlaceholder}</option>
                    {DAWS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <div className="add-mini-select-arrow" aria-hidden="true">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Intention artistique — optionnelle */}
            <div className="add-mini-field">
              <div className="add-mini-field-label">{a.intentLabel}</div>
              <textarea
                className="add-mini-input add-mini-textarea"
                value={artisticIntent}
                onChange={(e) => setArtisticIntent(e.target.value)}
                placeholder={intentPh}
                rows={2}
                maxLength={600}
              />
              <div className="add-mini-field-hint">{a.intentHint}</div>
            </div>

            {/* Plus d'options : DAW (si déjà pré-rempli), genre, BPM */}
            <button
              type="button"
              className="add-mini-more"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
            >
              <span className={`add-mini-more-chevron${moreOpen ? ' is-open' : ''}`} aria-hidden="true">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {moreOpen ? a.lessOptions : a.moreOptions}
              {!moreOpen && <span className="add-mini-more-hint">{a.moreOptionsHint}{daw ? ` · ${daw}` : ''}</span>}
            </button>
            {moreOpen && (
              <div className="add-mini-more-body">
                {!dawInMain && (
                  <div className="add-mini-field">
                    <div className="add-mini-field-label">{a.uploadDawLabel}</div>
                    <div className="add-mini-select-wrap">
                      <select className="add-mini-select" value={daw} onChange={(e) => setDaw(e.target.value)}>
                        <option value="">{a.uploadDawPlaceholder}</option>
                        {DAWS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <div className="add-mini-select-arrow" aria-hidden="true">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                <div className="add-mini-grid-2col">
                  <div>
                    <div className="add-mini-field-label">{a.uploadGenreLabel}</div>
                    <input
                      type="text"
                      className="add-mini-input"
                      value={declaredGenre}
                      placeholder={genrePh}
                      maxLength={60}
                      onChange={(e) => setDeclaredGenre(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="add-mini-field-label">{a.uploadBpmLabel}</div>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="add-mini-input"
                      value={userBpm}
                      placeholder={a.uploadBpmPlaceholder}
                      maxLength={5}
                      onChange={(e) => setUserBpm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="add-mini-field-hint" style={{ marginTop: -6 }}>{a.uploadBpmHint}</div>
              </div>
            )}

            {/* Droits */}
            <label className="add-mini-copyright">
              <input
                type="checkbox"
                checked={copyrightAck}
                onChange={(e) => setCopyrightAck(e.target.checked)}
              />
              <span>{a.copyrightAck}</span>
            </label>

            {/* CTA */}
            <button
              type="button"
              className="add-mini-cta"
              onClick={handleLaunchAnalyze}
              disabled={!uploadOk}
            >
              {uploadOk || launching ? a.uploadCta : a.uploadCtaIncomplete}
            </button>
          </>
        )}
      </div>
    </div>
  ), document.body);
}
