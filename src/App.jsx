import { useState, useEffect, useRef } from "react";
import STRINGS from "./constants/strings";
import T from "./constants/theme";
import API from "./constants/api";
import { LangContext } from "./hooks/useLang";
import useMobile from "./hooks/useMobile";
import GlobalStyles from "./components/GlobalStyles";
import MockupStyles from "./components/MockupStyles";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import BottomPlayer, { resolveAudio } from "./components/BottomPlayer";
import AskModal from "./components/AskModal";
import Sidebar from "./components/Sidebar";
import InputScreen from "./screens/InputScreen";
import LoadingScreen from "./screens/LoadingScreen";
import FicheScreen from "./screens/FicheScreen";
import VersionsScreen from "./screens/VersionsScreen";

import { saveAnalysis, getAnalysis, loadProjects, createProject, renameProject, deleteProject, renameTrack, deleteTrack, moveTrackToProject, reorderTracksInProject } from "./lib/storage";
import { assignProjectColors, PROJECT_COLOR_COUNT } from "./lib/projectColors";
import { supabase } from "./lib/supabase";
import { useAuth } from "./hooks/useAuth";
import AuthScreen from "./screens/AuthScreen";
import ReglagesScreen from "./screens/ReglagesScreen";
import RenameModal from "./components/RenameModal";
import OnboardingModal from "./components/OnboardingModal";
import { confirmDialog } from "./lib/confirm.jsx";

/* ── Font loader ────────────────────────────────────────── */
const FontLink = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap');`}</style>
);

/* ── Welcome Home Screen ───────────────────────────────── */
const HOME_TIPS = [
  "Faire des pauses régulières permet de conserver une écoute attentive et objective.",
  "Tes oreilles se fatiguent après 45 min — une pause de 10 min te fait gagner 2h de travail.",
  "Écouter ton mix dans un autre contexte (voiture, écouteurs) révèle ce que le studio cache.",
  "Baisser le volume de monitoring aide à repérer les déséquilibres de balance.",
  "Prendre du recul sur un mix pendant 24h change complètement ta perception.",
  "Comparer régulièrement avec une référence recalibre ton oreille et tes choix.",
  "Le silence entre les sessions est aussi important que le travail lui-même.",
  "Écouter à faible volume est le meilleur test : si le mix fonctionne bas, il fonctionnera fort.",
];

function WelcomeHome({ userProfile, currentProjectId, onSetCurrentProject, onNewTrack, onAddVersion, onSelectVersion, onPlay, onToggle, playerState, refreshKey, onMutate }) {
  const [projects, setProjects] = useState([]);
  const [tip] = useState(() => HOME_TIPS[Math.floor(Math.random() * HOME_TIPS.length)]);
  const [localRefresh, setLocalRefresh] = useState(0);
  const [pickingTrack, setPickingTrack] = useState(false);
  const pickerRef = useRef(null);
  const [pickingProject, setPickingProject] = useState(false);
  const projectPickerRef = useRef(null);
  // true si l'utilisateur a cliqué "+ Nouveau projet" depuis le picker "Nouveau titre"
  // → après création on enchaîne directement sur la saisie du titre.
  const pendingNewTrackRef = useRef(false);

  // Modales
  const [renameProjectTarget, setRenameProjectTarget] = useState(null);
  const [renameTrackTarget, setRenameTrackTarget] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectValue, setNewProjectValue] = useState('');
  const renameInputRef = useRef(null);
  const newProjectInputRef = useRef(null);

  useEffect(() => {
    let alive = true;
    loadProjects().then((p) => { if (alive) setProjects(p || []); });
    return () => { alive = false; };
  }, [refreshKey, localRefresh]);

  // Ferme le picker au clic extérieur / Escape
  useEffect(() => {
    if (!pickingTrack) return;
    const onDown = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickingTrack(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') setPickingTrack(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [pickingTrack]);

  // Même logique pour le picker "Nouveau titre → dans quel projet ?"
  useEffect(() => {
    if (!pickingProject) return;
    const onDown = (e) => {
      if (projectPickerRef.current && !projectPickerRef.current.contains(e.target)) setPickingProject(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') setPickingProject(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [pickingProject]);

  // Liste à plat de tous les titres (pour le picker "À quel titre ?")
  const allTracks = projects.flatMap((p) => (p.tracks || []).map((t) => ({ ...t, _projectName: p.name })));

  // Map projectId → index de couleur. Garantit l'unicité tant que
  // le nombre de projets ≤ PROJECT_COLOR_COUNT. Recalculée à chaque render,
  // mais basée uniquement sur createdAt ⇒ stable quand on réordonne.
  const projectColorMap = assignProjectColors(projects);

  const displayName = userProfile?.prenom || null;

  // ── Helpers ──
  const metaLine = (project) => {
    const nTracks = project.tracks?.length || 0;
    const nVersions = (project.tracks || []).reduce(
      (sum, t) => sum + (t.versions?.length || 0),
      0
    );
    const tLabel = `${nTracks} titre${nTracks > 1 ? 's' : ''}`;
    const vLabel = `${nVersions} version${nVersions > 1 ? 's' : ''}`;
    return `${tLabel} · ${vLabel}`;
  };

  const buildProjectPlaylist = (project) =>
    (project.tracks || [])
      .map((t) => {
        const latest = t.versions?.[t.versions.length - 1];
        if (!latest?.storagePath) return null;
        return { trackTitle: t.title, versionName: latest.name, storagePath: latest.storagePath };
      })
      .filter(Boolean);

  // ── Handlers projets ──
  const toggleProject = (projectId) => {
    if (!onSetCurrentProject) return;
    onSetCurrentProject(projectId === currentProjectId ? null : projectId);
  };

  const handlePlayProject = (e, project) => {
    e.stopPropagation();
    const playlist = buildProjectPlaylist(project);
    if (!playlist.length || !onPlay) return;
    // Toggle si déjà en lecture sur ce projet
    const firstTitle = playlist[0].trackTitle;
    if (playerState?.trackTitle && project.tracks?.some(t => t.title === playerState.trackTitle) && onToggle) {
      onToggle();
      return;
    }
    onPlay(playlist[0].trackTitle, playlist[0].versionName, playlist[0].storagePath, playlist, 0);
    // Ouvre l'accordéon si fermé
    if (project.id !== currentProjectId && onSetCurrentProject) onSetCurrentProject(project.id);
    void firstTitle;
  };

  const handlePlayTrack = (track, project) => {
    if (playerState?.trackTitle === track.title && onToggle) { onToggle(); return; }
    const playlist = buildProjectPlaylist(project);
    const idx = playlist.findIndex((p) => p.trackTitle === track.title);
    if (idx < 0 || !onPlay) return;
    onPlay(playlist[idx].trackTitle, playlist[idx].versionName, playlist[idx].storagePath, playlist, idx);
  };

  const handleViewFiche = (track) => {
    const latest = track.versions?.[track.versions.length - 1];
    if (latest && onSelectVersion) onSelectVersion(track, latest);
  };

  const handleAddTrackToProject = (project) => {
    if (onSetCurrentProject) onSetCurrentProject(project.id);
    if (onNewTrack) onNewTrack();
  };

  // Renommer projet
  const handleRenameProjectStart = (project) => {
    setRenameProjectTarget(project);
    setRenameValue(project.name);
    setTimeout(() => renameInputRef.current?.select(), 50);
  };
  const submitRenameProject = async () => {
    const next = renameValue.trim();
    if (!next || next === renameProjectTarget?.name) { setRenameProjectTarget(null); return; }
    try {
      await renameProject(renameProjectTarget.id, next);
      setLocalRefresh((n) => n + 1);
      if (onMutate) onMutate();
    } catch (err) { console.warn('renameProject failed', err); }
    setRenameProjectTarget(null);
  };

  // Supprimer projet
  const handleDeleteProject = async (project) => {
    if (projects.length <= 1) {
      await confirmDialog({
        title: 'Impossible',
        message: 'Au moins un projet est requis. Crée un autre projet avant de supprimer celui-ci.',
        confirmLabel: 'OK',
        cancelLabel: null,
      });
      return;
    }
    const nTracks = (project.tracks || []).length;
    const msg = nTracks === 0
      ? `Supprimer le projet "${project.name}" ?`
      : `Supprimer le projet "${project.name}" et ses ${nTracks} titre${nTracks > 1 ? 's' : ''} (avec toutes leurs versions et fichiers audio) ? Cette action est définitive.`;
    const ok = await confirmDialog({
      title: 'Supprimer le projet ?',
      message: msg,
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      danger: true,
    });
    if (ok !== 'confirm') return;
    try {
      const res = await deleteProject(project.id);
      if (res?.ok === false && res?.reason === 'last-project') {
        await confirmDialog({
          title: 'Impossible',
          message: 'Au moins un projet est requis.',
          confirmLabel: 'OK',
          cancelLabel: null,
        });
        return;
      }
      setLocalRefresh((n) => n + 1);
      if (onMutate) onMutate();
    } catch (err) { console.warn('deleteProject failed', err); }
  };

  // Nouveau projet
  const handleNewProject = () => {
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
      setLocalRefresh((n) => n + 1);
      if (onMutate) onMutate();
      if (created?.id && onSetCurrentProject) onSetCurrentProject(created.id);
      // Si l'utilisateur venait du bouton "Nouveau titre", on enchaîne
      // directement sur la saisie du titre dans ce projet fraîchement créé.
      if (pendingNewTrackRef.current) {
        pendingNewTrackRef.current = false;
        if (onNewTrack) onNewTrack();
      }
    } catch (err) { console.warn('createProject failed', err); }
  };

  // Renommer titre
  const handleRenameTrackStart = (track) => {
    setRenameTrackTarget(track);
    setRenameValue(track.title);
    setTimeout(() => renameInputRef.current?.select(), 50);
  };
  const submitRenameTrack = async () => {
    const next = renameValue.trim();
    if (!next || next === renameTrackTarget?.title) { setRenameTrackTarget(null); return; }
    try {
      await renameTrack(renameTrackTarget.id, next);
      setLocalRefresh((n) => n + 1);
      if (onMutate) onMutate();
    } catch (err) { console.warn('renameTrack failed', err); }
    setRenameTrackTarget(null);
  };

  // Supprimer titre
  const handleDeleteTrack = async (track) => {
    const n = (track.versions || []).length;
    const ok = await confirmDialog({
      title: 'Supprimer le titre ?',
      message: `Supprimer "${track.title}" et ses ${n} version${n > 1 ? 's' : ''} ? Cette action est définitive.`,
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      danger: true,
    });
    if (ok !== 'confirm') return;
    try {
      await deleteTrack(track.id);
      setLocalRefresh((n2) => n2 + 1);
      if (onMutate) onMutate();
    } catch (err) { console.warn('deleteTrack failed', err); }
  };

  const totalProjects = projects.length;

  /* ─── Drag & drop Home ──────────────────────────────── */
  const [drag, setDrag] = useState(null);

  const handleDropTrackOnTrack = async (sourceTrackId, sourceProjectId, targetTrackId, targetProjectId, position) => {
    if (sourceTrackId === targetTrackId) return;
    const targetProject = projects.find(p => p.id === targetProjectId);
    if (!targetProject) return;
    const targetOrder = (targetProject.tracks || []).map(t => t.id).filter(id => id !== sourceTrackId);
    const targetIdx = targetOrder.findIndex(id => id === targetTrackId);
    if (targetIdx < 0 && sourceProjectId === targetProjectId) return;
    const insertAt = position === 'before' ? (targetIdx < 0 ? 0 : targetIdx) : (targetIdx < 0 ? targetOrder.length : targetIdx + 1);
    targetOrder.splice(insertAt, 0, sourceTrackId);
    try {
      if (sourceProjectId !== targetProjectId) {
        await moveTrackToProject(sourceTrackId, targetProjectId);
        const sourceProject = projects.find(p => p.id === sourceProjectId);
        if (sourceProject) {
          const sourceOrder = (sourceProject.tracks || []).map(t => t.id).filter(id => id !== sourceTrackId);
          if (sourceOrder.length) await reorderTracksInProject(sourceProjectId, sourceOrder);
        }
      }
      await reorderTracksInProject(targetProjectId, targetOrder);
      setLocalRefresh(n => n + 1);
      if (onMutate) onMutate();
    } catch (err) { console.warn('home drop track on track failed', err); }
  };

  const handleDropTrackOnProject = async (sourceTrackId, sourceProjectId, targetProjectId) => {
    if (sourceProjectId === targetProjectId) return;
    try {
      await moveTrackToProject(sourceTrackId, targetProjectId);
      const sourceProject = projects.find(p => p.id === sourceProjectId);
      if (sourceProject) {
        const sourceOrder = (sourceProject.tracks || []).map(t => t.id).filter(id => id !== sourceTrackId);
        if (sourceOrder.length) await reorderTracksInProject(sourceProjectId, sourceOrder);
      }
      setLocalRefresh(n => n + 1);
      if (onMutate) onMutate();
    } catch (err) { console.warn('home drop track on project failed', err); }
  };

  return (
    <div className="welcome-home">
      {/* Header */}
      <div className="wh-header">
        <div className="wh-greeting">{displayName ? `SALUT ${displayName.toUpperCase()} !` : "SALUT !"}</div>
      </div>

      {/* Raccourcis : Nouveau projet + Nouveau titre + Ajouter une version */}
      <div className="wh-actions">
        <button className="wh-action" onClick={handleNewProject}>
          <span className="wh-action-icon">+</span>
          <span>Nouveau projet</span>
        </button>
        <div ref={projectPickerRef} style={{ position: "relative", display: "flex" }}>
          <button
            className="wh-action"
            style={{ flex: 1 }}
            onClick={() => {
              // Pas encore de projet → créer d'abord, puis chaîner sur le titre
              if (totalProjects === 0) {
                pendingNewTrackRef.current = true;
                handleNewProject();
                return;
              }
              setPickingProject((v) => !v);
            }}
          >
            <span className="wh-action-icon">+</span>
            <span>Nouveau titre</span>
          </button>
          {pickingProject && (
            <div className="wh-track-picker">
              <div className="wh-picker-label">Dans quel projet ?</div>
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="wh-picker-item"
                  onClick={() => {
                    setPickingProject(false);
                    if (onSetCurrentProject) onSetCurrentProject(p.id);
                    if (onNewTrack) onNewTrack();
                  }}
                >
                  {p.name}
                  <span className="wh-picker-count">
                    {metaLine(p)}
                  </span>
                </div>
              ))}
              <div
                className="wh-picker-item wh-picker-create"
                onClick={() => {
                  setPickingProject(false);
                  pendingNewTrackRef.current = true;
                  handleNewProject();
                }}
              >
                <span className="wh-action-icon">+</span>
                <span>Nouveau projet</span>
              </div>
            </div>
          )}
        </div>
        {allTracks.length > 0 && (
          <div ref={pickerRef} style={{ position: "relative", display: "flex" }}>
            <button
              className="wh-action"
              style={{ flex: 1 }}
              onClick={() => setPickingTrack((v) => !v)}
            >
              <span className="wh-action-icon">↻</span>
              <span>Ajouter une version</span>
            </button>
            {pickingTrack && (
              <div className="wh-track-picker">
                <div className="wh-picker-label">À quel titre ?</div>
                {allTracks.map((t) => (
                  <div
                    key={t.id}
                    className="wh-picker-item"
                    onClick={() => { setPickingTrack(false); if (onAddVersion) onAddVersion(t); }}
                  >
                    {t.title}
                    <span className="wh-picker-count">
                      {t.versions?.length || 0} version{(t.versions?.length || 0) > 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Liste accordéon des projets */}
      {totalProjects > 0 && (
        <div className="wh-tracklist">
          <div className="wh-section-title">Mes <em>projets</em></div>
          <div className="wh-projects">
            {projects.map((project) => {
              const isOpen = project.id === currentProjectId;
              const nTracks = project.tracks?.length || 0;
              // Couleur du projet : priorité à cover_gradient s'il est explicite (>0),
              // sinon index unique issu de assignProjectColors (garanti distinct
              // tant qu'on a ≤ PROJECT_COLOR_COUNT projets).
              const gradIdx = project.coverGradient
                ? project.coverGradient % PROJECT_COLOR_COUNT
                : (projectColorMap.get(project.id) ?? 0);
              const isProjectPlaying = !!(
                playerState?.isPlaying &&
                project.tracks?.some((t) => t.title === playerState.trackTitle)
              );

              return (
                <div
                  key={project.id}
                  className={`wh-acc-item wh-tint-${gradIdx}${isOpen ? ' open' : ''}`}
                >
                  {/* Header projet */}
                  <div
                    className="wh-acc-head"
                    onClick={() => toggleProject(project.id)}
                    onDragOver={(e) => {
                      // Seul le drop d'un titre depuis un autre projet est accepté sur le header
                      if (!drag || drag.type !== 'track') return;
                      if (drag.sourceProjectId === project.id) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      e.currentTarget.style.background = 'rgba(245,176,86,.08)';
                    }}
                    onDragLeave={(e) => { e.currentTarget.style.background = ''; }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const d = drag;
                      e.currentTarget.style.background = '';
                      setDrag(null);
                      if (!d) return;
                      if (d.type === 'track' && d.sourceProjectId !== project.id) {
                        handleDropTrackOnProject(d.trackId, d.sourceProjectId, project.id);
                      }
                    }}
                  >
                    <div className={`wh-acc-cover wh-gradient-${gradIdx}`}>
                      {/* Play projet — apparaît au hover de la vignette, centré dessus */}
                      <button
                        className={`wh-acc-play${isProjectPlaying ? ' playing' : ''}`}
                        onClick={(e) => handlePlayProject(e, project)}
                        title={isProjectPlaying ? 'En lecture' : 'Lire le projet'}
                      >
                        {isProjectPlaying ? (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="2" width="3" height="10" rx="1"/><rect x="8" y="2" width="3" height="10" rx="1"/></svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1.5v11l9-5.5z"/></svg>
                        )}
                      </button>
                    </div>

                    <div className="wh-acc-title">
                      <div className="wh-acc-kicker">Projet</div>
                      <div className="wh-acc-name">{project.name}</div>
                      <div className="wh-acc-meta">{metaLine(project)}</div>
                      {isOpen && (
                        <div className="wh-head-actions">
                          <button
                            className="wh-head-btn primary"
                            onClick={(e) => { e.stopPropagation(); handleAddTrackToProject(project); }}
                          >+ Nouveau titre</button>
                          <button
                            className="wh-head-btn"
                            onClick={(e) => { e.stopPropagation(); handleRenameProjectStart(project); }}
                          >Renommer</button>
                          <button
                            className="wh-head-btn danger ghost"
                            onClick={(e) => { e.stopPropagation(); handleDeleteProject(project); }}
                          >Supprimer</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body : liste des titres */}
                  <div className="wh-acc-body">
                    {nTracks > 0 ? (
                      <div className="wh-acc-tracklist">
                        {project.tracks.map((track) => (
                          <WhTrackRow
                            key={track.id}
                            track={track}
                            project={project}
                            playerState={playerState}
                            onPlay={() => handlePlayTrack(track, project)}
                            onViewFiche={() => handleViewFiche(track)}
                            onRename={() => handleRenameTrackStart(track)}
                            onDelete={() => handleDeleteTrack(track)}
                            drag={drag}
                            setDrag={setDrag}
                            onDropTrackOnTrack={handleDropTrackOnTrack}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="wh-acc-empty">Aucun titre pour l'instant.</div>
                    )}
                    <button
                      className="wh-acc-add-track"
                      onClick={() => handleAddTrackToProject(project)}
                    >+ Nouveau titre</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalProjects === 0 && (
        <div className="wh-empty">
          <img src="/logo-versions.svg" alt="" style={{ height: 60, width: "auto", opacity: 0.3 }} />
          <div>Crée ton premier projet pour commencer l'aventure.</div>
        </div>
      )}

      {/* Tip en bas */}
      <div className="wh-tip">
        <div className="wh-tip-label">Le saviez-vous</div>
        <div className="wh-tip-text">{tip}</div>
      </div>

      {/* Modale renommer titre */}
      {renameTrackTarget && (
        <RenameModal
          title="Renommer le titre"
          placeholder="Nom du titre"
          value={renameValue}
          originalValue={renameTrackTarget.title}
          inputRef={renameInputRef}
          onChange={setRenameValue}
          onCancel={() => setRenameTrackTarget(null)}
          onSubmit={submitRenameTrack}
          confirmLabel="Renommer"
        />
      )}

      {/* Modale renommer projet */}
      {renameProjectTarget && (
        <RenameModal
          title="Renommer le projet"
          placeholder="Nom du projet"
          value={renameValue}
          originalValue={renameProjectTarget.name}
          inputRef={renameInputRef}
          onChange={setRenameValue}
          onCancel={() => setRenameProjectTarget(null)}
          onSubmit={submitRenameProject}
          confirmLabel="Renommer"
        />
      )}

      {/* Modale nouveau projet */}
      {newProjectOpen && (
        <RenameModal
          title="Nouveau projet"
          placeholder="Nom du projet"
          value={newProjectValue}
          originalValue=""
          inputRef={newProjectInputRef}
          onChange={setNewProjectValue}
          onCancel={() => setNewProjectOpen(false)}
          onSubmit={submitNewProject}
          confirmLabel="Créer"
        />
      )}
    </div>
  );
}

/* ─── Ligne titre dans Home (accordéon ouvert) ─────────────────────── */
function WhTrackRow({ track, project, playerState, onPlay, onViewFiche, onRename, onDelete, drag, setDrag, onDropTrackOnTrack }) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOver, setDropOver] = useState(null);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e) => {
      if (menuRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setMenuOpen(false);
    };
    const esc = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', h);
      document.removeEventListener('keydown', esc);
    };
  }, [menuOpen]);

  const latest = track.versions?.[track.versions.length - 1];
  const fiche = latest?.analysisResult?.fiche;
  const hasFiche = !!fiche;
  const dur = fiche?.duration_seconds;
  const durStr = dur ? `${Math.floor(dur / 60)}:${String(Math.floor(dur % 60)).padStart(2, '0')}` : null;
  const dateStr = latest?.date || null;
  const isThisPlaying = playerState?.trackTitle === track.title && !!playerState?.isPlaying;
  const showDots = hover || menuOpen;

  return (
    <div
      className="wh-track-row"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDragOver={(e) => {
        if (!drag || drag.type !== 'track') return;
        if (drag.trackId === track.id) return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        const rect = e.currentTarget.getBoundingClientRect();
        const isAbove = (e.clientY - rect.top) < rect.height / 2;
        setDropOver(isAbove ? 'before' : 'after');
      }}
      onDragLeave={() => setDropOver(null)}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const d = drag;
        const rect = e.currentTarget.getBoundingClientRect();
        setDropOver(null);
        if (setDrag) setDrag(null);
        if (!d || d.type !== 'track' || d.trackId === track.id) return;
        const isAbove = (e.clientY - rect.top) < rect.height / 2;
        onDropTrackOnTrack?.(d.trackId, d.sourceProjectId, track.id, project?.id, isAbove ? 'before' : 'after');
      }}
      style={{
        position: 'relative',
        boxShadow: dropOver === 'before' ? 'inset 0 2px 0 0 #f5b056' : (dropOver === 'after' ? 'inset 0 -2px 0 0 #f5b056' : 'none'),
        transition: 'box-shadow .1s',
      }}
    >
      {/* Poignée de déplacement titre */}
      <span
        className="wh-drag-handle"
        draggable={true}
        onClick={(e) => e.stopPropagation()}
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('application/x-versions-dnd', 'track');
          const row = e.currentTarget.closest('.wh-track-row');
          if (row) e.dataTransfer.setDragImage(row, 10, 10);
          if (setDrag) setDrag({ type: 'track', trackId: track.id, sourceProjectId: project?.id });
        }}
        onDragEnd={() => { if (setDrag) setDrag(null); setDropOver(null); }}
        title="Glisser pour déplacer le titre"
        aria-label="Déplacer le titre"
        style={{ opacity: hover ? 0.55 : 0 }}
      >
        <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden>
          <circle cx="3" cy="3" r="1.1"/><circle cx="7" cy="3" r="1.1"/>
          <circle cx="3" cy="7" r="1.1"/><circle cx="7" cy="7" r="1.1"/>
          <circle cx="3" cy="11" r="1.1"/><circle cx="7" cy="11" r="1.1"/>
        </svg>
      </span>

      {/* Play */}
      <button
        className={`wh-track-play${isThisPlaying ? ' playing' : ''}`}
        onClick={onPlay}
        title={isThisPlaying ? 'En lecture' : 'Écouter'}
      >
        {isThisPlaying ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="2" width="3" height="10" rx="1"/><rect x="8" y="2" width="3" height="10" rx="1"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1.5v11l9-5.5z"/></svg>
        )}
      </button>

      {/* Info */}
      <div className="wh-track-info">
        <div className="wh-track-title">{track.title}</div>
        <div className="wh-track-meta">
          {durStr && <>{durStr} · </>}
          {track.versions?.length || 1} version{(track.versions?.length || 1) > 1 ? 's' : ''}
        </div>
      </div>

      {/* Date */}
      {dateStr && <span className="wh-track-date">{dateStr}</span>}

      {/* Voir analyse */}
      {hasFiche && (
        <button className="wh-track-fiche" onClick={onViewFiche}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span>Analyse</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3.5 2l3.5 3-3.5 3"/></svg>
        </button>
      )}

      {/* Menu ⋯ */}
      {showDots && (
        <button
          ref={btnRef}
          onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
          title="Options"
          style={{
            width: 26, height: 26, borderRadius: 6,
            background: menuOpen ? 'rgba(245,176,86,.15)' : 'transparent',
            border: 'none', color: '#c5c5c7', cursor: 'pointer',
            padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, lineHeight: 1, marginLeft: 4,
          }}
        >⋯</button>
      )}

      {menuOpen && (
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 100,
            minWidth: 180, background: '#141416', border: '1px solid #2a2a2e',
            borderRadius: 10, padding: 6, boxShadow: '0 12px 32px rgba(0,0,0,.55)',
          }}
        >
          <WhMenuItem label="Renommer" onClick={() => { setMenuOpen(false); onRename(); }} />
          <div style={{ height: 1, background: '#2a2a2e', margin: '4px 2px' }} />
          <WhMenuItem label="Supprimer" danger onClick={() => { setMenuOpen(false); onDelete(); }} />
        </div>
      )}
    </div>
  );
}

function WhMenuItem({ label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        padding: '8px 12px', borderRadius: 6, border: 'none',
        background: 'transparent', cursor: 'pointer',
        fontFamily: 'Inter, sans-serif', fontSize: 12,
        color: danger ? '#ef6b6b' : '#c5c5c7',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = danger ? 'rgba(239,107,107,.08)' : 'rgba(245,176,86,.06)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >{label}</button>
  );
}

const SIDEBAR_WIDTH = 260;

/* ── Mobile Avatar Menu ────────────────────────────────── */
function MobileMenu({ onNavigate, onSignOut, user, userProfile }) {
  const [open, setOpen] = useState(false);
  const go = (target) => { setOpen(false); onNavigate(target); };
  const avatarUrl = userProfile?.avatar_url || null;
  const displayName = userProfile?.prenom || (user?.email ? user.email.split('@')[0] : 'utilisateur');
  const initial = (userProfile?.prenom || user?.email || 'U').trim().charAt(0).toUpperCase();

  return (
    <>
      {/* ── Top bar ── */}
      <div className="mobile-topbar">
        <div className="brand" onClick={() => go('welcome')} style={{ cursor: 'pointer', fontSize: 20, letterSpacing: 2, gap: 8 }}>
          <img src="/logo-versions.svg" alt="" style={{ height: 22, width: 'auto' }} />
          <span>{"VER"}<span className="accent">{"SI"}</span>{"ONS"}</span>
        </div>
        <div className="mobile-avatar-wrap">
          <button
            className={`mobile-avatar-btn${open ? ' open' : ''}`}
            onClick={() => setOpen(!open)}
            aria-label="Menu utilisateur"
          >
            {avatarUrl
              ? <img src={avatarUrl} alt="" />
              : <span className="mobile-avatar-initial">{initial}</span>}
          </button>

          {open && (
            <>
              <div className="mobile-avatar-backdrop" onClick={() => setOpen(false)} />
              <div className="mobile-avatar-popover">
                <div className="mobile-avatar-popover-user">
                  <div className="mobile-avatar-popover-who">{displayName}</div>
                  {user?.email && <div className="mobile-avatar-popover-mail">{user.email}</div>}
                </div>
                <button className="mobile-avatar-popover-item" onClick={() => go('reglages')}>
                  <span className="mobile-menu-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                    </svg>
                  </span>
                  Réglages
                </button>
                <button
                  className="mobile-avatar-popover-item danger"
                  onClick={async () => { setOpen(false); if (onSignOut) await onSignOut(); }}
                >
                  <span className="mobile-menu-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                  </span>
                  Se déconnecter
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* APP                                                        */
/* ═══════════════════════════════════════════════════════════ */
export default function VersionsApp() {
  const { user, loading: authLoading, signOut } = useAuth();
  const isMobile = useMobile();
  const isDesktop = !isMobile;
  // On desktop, default = "welcome" (neutral empty state); on mobile, old default = "input"
  const [screen, setScreen] = useState("welcome");
  const [config, setConfig] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [askOpen, setAskOpen] = useState(false);
  // When adding a new version from an existing track, we prefill the title
  // and, after analysis completes, auto-open that track's folder in Versions tab
  const [prefillTitle, setPrefillTitle] = useState("");
  const [autoSelectTrackTitle, setAutoSelectTrackTitle] = useState("");
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const [homeRefreshKey, setHomeRefreshKey] = useState(0);
  // Projet courant — synchronise l'accordéon Sidebar ↔ Home, et sert de scope
  // à la playlist du player. null = aucun projet explicitement ouvert.
  const [currentProjectId, setCurrentProjectId] = useState(null);

  // ── User profile (avatar, prénom…) ──
  const [userProfile, setUserProfile] = useState(null);
  useEffect(() => {
    if (!user) { setUserProfile(null); return; }
    supabase
      .from("profiles")
      .select("prenom, nom, avatar_url, default_daw, langue")
      .eq("id", user.id)
      .single()
      .then(({ data }) => { if (data) setUserProfile(data); })
      .catch(() => {});
  }, [user]);

  // ── Onboarding gate : true si user connecté mais sans projet ──
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // ── Preload first track audio on login (kills the 5s first-play delay) ──
  // Au passage, détecte si l'utilisateur n'a aucun projet → onboarding bloquant.
  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNeedsOnboarding(false);
      return;
    }
    loadProjects().then((projects) => {
      if (!projects || projects.length === 0) {
        setNeedsOnboarding(true);
        return;
      }
      setNeedsOnboarding(false);
      const firstProject = projects[0];
      const firstTrack = firstProject?.tracks?.[0];
      const latest = firstTrack?.versions?.[firstTrack.versions.length - 1];
      if (latest?.storagePath) resolveAudio(latest.storagePath).catch(() => {});
      // Mémorise aussi le projet par défaut pour l'accordéon
      if (firstProject?.id) setCurrentProjectId(firstProject.id);
    }).catch(() => {});
  }, [user, sidebarRefreshKey]);

  const handleOnboardingCreate = async (name) => {
    const created = await createProject(name);
    if (!created?.id) throw new Error('La création a échoué, réessaye.');
    setCurrentProjectId(created.id);
    setNeedsOnboarding(false);
    // Force la sidebar et la home à recharger leurs projets
    setSidebarRefreshKey((k) => k + 1);
    setHomeRefreshKey((k) => k + 1);
  };

  // ── Language ──
  const [lang, setLangState] = useState("fr");
  useEffect(() => {
    try {
      const stored = localStorage.getItem("versions_lang");
      if (stored === "en") setLangState("en");
    } catch {}
  }, []);
  const setLang = (l) => {
    setLangState(l);
    try { localStorage.setItem("versions_lang", l); } catch {}
  };
  const s = STRINGS[lang];

  // ── Persistent player state ──
  const [playerState, setPlayerState] = useState(null);
  const resetKeyRef = useRef(0);

  const play = (trackTitle, versionName, storagePath, playlist, currentIdx, keepProgress) => {
    if (!storagePath) return; // pas d'audio disponible
    const samePath = playerState?.storagePath === storagePath;
    const sameTrack = playerState?.trackTitle === trackTitle;
    // Restart si : même fichier rejoué, OU titre différent (playlist avance)
    // Pas de restart si : switch de version au sein du même titre (lecture ininterrompue)
    if (samePath && !keepProgress) {
      resetKeyRef.current += 1;  // replay même fichier
    } else if (!sameTrack) {
      resetKeyRef.current += 1;  // nouveau titre → reprend du début
    }
    // Si sameTrack && !samePath → switch de version, pas de bump → lecture continue
    setPlayerState({
      trackTitle, versionName, storagePath, isPlaying: true,
      playlist: playlist || [], currentIdx: currentIdx || 0,
      resetKey: resetKeyRef.current,
    });
  };
  const loadPlayer = (trackTitle, versionName, storagePath) => {
    if (!storagePath) return;
    resetKeyRef.current += 1;
    setPlayerState({
      trackTitle, versionName, storagePath, isPlaying: false,
      playlist: [], currentIdx: 0,
      resetKey: resetKeyRef.current,
    });
  };
  const togglePlay = () => setPlayerState(prev => prev ? { ...prev, isPlaying: !prev.isPlaying } : null);
  const stopPlay = () => setPlayerState(null);
  const playNext = () => {
    if (!playerState?.playlist?.length) return;
    const nextIdx = playerState.currentIdx + 1;
    if (nextIdx >= playerState.playlist.length) {
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
      return;
    }
    const next = playerState.playlist[nextIdx];
    resetKeyRef.current += 1;
    setPlayerState({
      trackTitle: next.trackTitle, versionName: next.versionName,
      storagePath: next.storagePath,
      isPlaying: true, playlist: playerState.playlist, currentIdx: nextIdx,
      resetKey: resetKeyRef.current,
    });
  };
  const playPrev = () => {
    if (!playerState?.playlist?.length) return;
    const prevIdx = playerState.currentIdx - 1;
    if (prevIdx < 0) return;
    const prev = playerState.playlist[prevIdx];
    resetKeyRef.current += 1;
    setPlayerState({
      trackTitle: prev.trackTitle, versionName: prev.versionName,
      storagePath: prev.storagePath,
      isPlaying: true, playlist: playerState.playlist, currentIdx: prevIdx,
      resetKey: resetKeyRef.current,
    });
  };
  const hasNext = playerState?.playlist?.length > 0 && playerState.currentIdx < playerState.playlist.length - 1;
  const hasPrev = playerState?.playlist?.length > 0 && playerState.currentIdx > 0;

  // ── Background polling for progressive results ──
  const pollingRef = useRef(null);

  // Track saved state to avoid double-saving
  const savedRef = useRef(false);

  const startBackgroundPolling = (jobId) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/analyze/status/${jobId}`);
        const job = await res.json();
        if (job.fiche) {
          setAnalysisResult(prev => ({ ...prev, fiche: job.fiche, _stage: job.stage }));
        }
        if (job.listening) {
          setAnalysisResult(prev => ({ ...prev, listening: job.listening, _stage: job.stage }));
        }
        if (job.status === "complete" || job.status === "error") {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          // Save completed analysis to localStorage
          if (job.status === "complete" && !savedRef.current) {
            savedRef.current = true;
            setAnalysisResult(prev => {
              const full = { ...prev, fiche: job.fiche || prev?.fiche, listening: job.listening || prev?.listening, storagePath: job.storagePath || prev?.storagePath || null, _stage: "all_done" };
              saveAnalysis(config, full, job.storagePath || prev?.storagePath || null)
                .then(() => setSidebarRefreshKey(k => k + 1))
                .catch(e => console.warn("saveAnalysis failed:", e));
              return full;
            });
          }
        }
      } catch (e) { console.error("bg poll error:", e); }
    }, 3000);
  };

  // Cleanup on unmount
  useEffect(() => () => { if (pollingRef.current) clearInterval(pollingRef.current); }, []);

  // ── Handlers ──
  const handleAnalyze = (cfg) => {
    // Injecte le projet cible (choisi explicitement dans InputScreen ou déduit du contexte)
    const cfgWithProject = { ...cfg, projectId: cfg.projectId || currentProjectId || null };
    setConfig(cfgWithProject);
    setAnalysisResult(null);
    savedRef.current = false;
    setScreen("loading");
  };
  const handleLoaded = (result) => {
    // Called with partial or complete results — always go to fiche
    const merged = { ...(analysisResult || {}), ...result };
    setAnalysisResult(merged);
    const cfgWithHash = result.audioHash ? { ...config, audioHash: result.audioHash } : config;
    if (result.audioHash) setConfig(cfgWithHash);
    if (screen !== "fiche") {
      setScreen("fiche");
      // Start background polling if not complete yet
      if (result._jobId && result._stage !== "all_done") {
        startBackgroundPolling(result._jobId);
      } else if (result._stage === "all_done" && !savedRef.current) {
        // Analysis completed in one shot — save immediately
        savedRef.current = true;
        saveAnalysis(cfgWithHash, merged, merged.storagePath || null)
          .then(() => setSidebarRefreshKey(k => k + 1))
          .catch(e => console.warn("saveAnalysis failed:", e));
      }
    }
  };
  const goHome = () => {
    setScreen("welcome");
    setConfig(null);
    setAnalysisResult(null);
    setPrefillTitle("");
  };

  // Sidebar handlers
  const handleSidebarSelectVersion = async (track, v) => {
    // Charger l'audio EN PREMIER (avant l'await) pour éviter la coupure
    if (v.storagePath) {
      if (playerState?.isPlaying) {
        play(track.title, v.name, v.storagePath);
      } else {
        loadPlayer(track.title, v.name, v.storagePath);
      }
    }
    const saved = await getAnalysis(track.id, v.id);
    setConfig({ title: track.title, version: v.name, daw: config?.daw || "Logic Pro" });
    setAnalysisResult(saved || v.analysisResult || null);
    setScreen("fiche");
  };
  const handleSidebarNewTrack = () => {
    setPrefillTitle("");
    setAutoSelectTrackTitle("");
    setAnalysisResult(null);
    setConfig(null);
    setScreen("input");
  };
  const handleAddVersionFromPicker = (track) => {
    // Pré-sélectionne le projet du titre pour que l'upload y atterrisse
    if (track?.projectId) setCurrentProjectId(track.projectId);
    setPrefillTitle(track.title);
    setAutoSelectTrackTitle(track.title);
    setAnalysisResult(null);
    setConfig(null);
    setScreen("input");
  };

  // ── Screen routing ──
  const renderContent = () => {
    switch (screen) {
      case "welcome":
        return (
          <WelcomeHome
            userProfile={userProfile}
            currentProjectId={currentProjectId}
            onSetCurrentProject={setCurrentProjectId}
            onNewTrack={handleSidebarNewTrack}
            onAddVersion={handleAddVersionFromPicker}
            onSelectVersion={handleSidebarSelectVersion}
            onPlay={play}
            onToggle={togglePlay}
            playerState={playerState}
            refreshKey={homeRefreshKey}
            onMutate={() => setSidebarRefreshKey(k => k + 1)}
          />
        );
      case "input":
        return <InputScreen onAnalyze={handleAnalyze} onAsk={() => setAskOpen(true)} initialTitle={prefillTitle} initialProjectId={currentProjectId} lockProject={!!prefillTitle} onRefreshProjects={() => setSidebarRefreshKey(k => k + 1)} />;
      case "loading":
        return <LoadingScreen config={config} onDone={handleLoaded} onBackToInput={handleSidebarNewTrack} />;
      case "fiche":
        return (
          <FicheScreen
            config={config}
            analysisResult={analysisResult}
            onSelectVersion={handleSidebarSelectVersion}
            onGoHome={goHome}
            refreshKey={sidebarRefreshKey}
            onAddVersion={handleAddVersionFromPicker}
          />
        );
      case "versions":
        return (
          <VersionsScreen
            onViewAnalysis={handleSidebarSelectVersion}
            onAddVersion={handleAddVersionFromPicker}
            autoSelectTrackTitle={autoSelectTrackTitle}
            onAutoSelectConsumed={() => setAutoSelectTrackTitle("")}
            onPlay={play}
            onStop={stopPlay}
            onToggle={togglePlay}
            playerState={playerState}
          />
        );
      case "reglages":
        return <ReglagesScreen onSignOut={signOut} onGoHome={goHome} onProfileUpdate={setUserProfile} />;
      default:
        return <InputScreen onAnalyze={handleAnalyze} onAsk={() => setAskOpen(true)} initialProjectId={currentProjectId} onRefreshProjects={() => setSidebarRefreshKey(k => k + 1)} />;
    }
  };

  // Auth gate
  if (authLoading) {
    return (
      <>
        <FontLink />
        <GlobalStyles />
        <div style={{minHeight:"100vh",display:"grid",placeItems:"center",background:T.black,color:T.muted,fontFamily:T.mono,fontSize:12,letterSpacing:2}}>
          CHARGEMENT...
        </div>
      </>
    );
  }
  if (!user) {
    return (
      <LangContext.Provider value={{ lang, s, setLang }}>
        <FontLink />
        <GlobalStyles />
        <MockupStyles />
        <AuthScreen />
      </LangContext.Provider>
    );
  }

  // On desktop, the sidebar shows the tracks list so we don't need the "versions" screen
  const showSidebar = isDesktop;
  const contentMarginLeft = showSidebar ? SIDEBAR_WIDTH : 0;

  return (
    <LangContext.Provider value={{ lang, s, setLang }}>
      <FontLink />
      <GlobalStyles />
      <MockupStyles />
      {needsOnboarding && (
        <OnboardingModal
          displayName={userProfile?.prenom || null}
          onCreate={handleOnboardingCreate}
        />
      )}
      <div className={showSidebar ? "app" : "dapp"}>
        {/* Desktop Sidebar */}
        {showSidebar && (
          <Sidebar
            currentTrackTitle={config?.title}
            currentVersionName={config?.version}
            currentProjectId={currentProjectId}
            onSetCurrentProject={setCurrentProjectId}
            onSelectVersion={handleSidebarSelectVersion}
            onNewTrack={handleSidebarNewTrack}
            onGoReglages={() => setScreen("reglages")}
            onAskOpen={() => setAskOpen(true)}
            onPlay={play}
            onToggle={togglePlay}
            onMutate={() => { setHomeRefreshKey(k => k + 1); }}
            onStop={stopPlay}
            playerState={playerState}
            user={user}
            userProfile={userProfile}
            onSignOut={signOut}
            onGoHome={goHome}
            refreshKey={sidebarRefreshKey}
          />
        )}

        {/* Main column */}
        <div style={showSidebar ? { display: "flex", flexDirection: "column", minWidth: 0 } : { marginLeft: contentMarginLeft, display: "flex", flexDirection: "column", minHeight: "100vh", transition: "margin-left .2s" }}>
          {/* Mobile top bar with avatar menu */}
          {isMobile && (
            <MobileMenu
              onNavigate={(target) => {
                setAskOpen(false);
                if (target === 'input') setPrefillTitle('');
                setScreen(target);
              }}
              onSignOut={signOut}
              user={user}
              userProfile={userProfile}
            />
          )}

          {/* Ask Modal */}
          {askOpen && <AskModal onClose={() => setAskOpen(false)} />}

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", width: "100%", minHeight: 0, paddingBottom: 80 }}>
            {renderContent()}
          </div>

          {/* Persistent Bottom Player — toujours visible */}
          <BottomPlayer
            trackTitle={playerState?.trackTitle}
            versionName={playerState?.versionName}
            storagePath={playerState?.storagePath}
            isPlaying={!!playerState?.isPlaying}
            onToggle={togglePlay}
            onNext={playNext}
            onPrev={playPrev}
            hasNext={hasNext}
            hasPrev={hasPrev}
            resetKey={playerState?.resetKey || 0}
            idle={!playerState}
            playlist={playerState?.playlist}
            currentIdx={playerState?.currentIdx}
          />

          {/* BottomNav retiré — remplacé par le hamburger menu */}
        </div>
      </div>
    </LangContext.Provider>
  );
}
