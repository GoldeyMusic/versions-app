import { useState, useEffect, useRef } from 'react';
import {
  createProject,
  renameProject,
  deleteProject,
  deleteTrack,
  renameTrack,
  moveTrackToProject,
  reorderTracksInProject,
  reorderProjects,
} from '../lib/storage';
import { confirmDialog } from '../lib/confirm.jsx';
import RenameModal from './RenameModal';
import { assignProjectColors, PROJECT_COLOR_COUNT } from '../lib/projectColors';

/**
 * Sidebar — accordéon de projets.
 * Un seul projet ouvert à la fois (piloté par `currentProjectId`).
 * Chaque projet ouvert déplie sa liste de titres + un bouton "+ Nouveau titre".
 */
export default function Sidebar({
  currentTrackTitle,
  currentProjectId,
  onSetCurrentProject,
  onSelectVersion,
  onNewTrack,       // ancien: "Nouveau titre global" — réutilisé pour "Nouveau titre dans ce projet" (Phase 4 y ajoutera le projectId)
  onGoReglages,
  onGoHome,
  onPlay,
  onToggle,
  playerState,
  user,
  userProfile,
  projects = [],
  // projectsLoaded non utilisé ici — la sidebar ne différencie pas "chargé / pas chargé"
  // puisqu'un cache localStorage fournit les projets dès le premier render
  onMutate,
}) {
  // Modales
  const [renameProjectTarget, setRenameProjectTarget] = useState(null);
  const [renameTrackTarget, setRenameTrackTarget] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectValue, setNewProjectValue] = useState('');
  const renameInputRef = useRef(null);
  const newProjectInputRef = useRef(null);

  // Si le projet courant n'existe plus (après suppression), ouvre le 1er dispo.
  // `null` = volontairement replié → on le laisse tel quel.
  useEffect(() => {
    if (!projects.length) return;
    if (currentProjectId == null) return;
    const exists = projects.some((p) => p.id === currentProjectId);
    if (!exists && onSetCurrentProject) onSetCurrentProject(projects[0].id);
  }, [projects, currentProjectId, onSetCurrentProject]);

  // ── Handlers tracks ──
  const handleTrackClick = (track) => {
    const latest = track.versions?.[track.versions.length - 1];
    if (latest && onSelectVersion) onSelectVersion(track, latest);
  };

  const handlePlayTrack = (e, track, project) => {
    e.stopPropagation();
    if (playerState?.trackTitle === track.title && onToggle) { onToggle(); return; }
    // Playlist scopée au projet (stop en fin de projet)
    const playlist = (project.tracks || [])
      .map((t) => {
        const latest = t.versions?.[t.versions.length - 1];
        if (!latest?.storagePath) return null;
        return { trackTitle: t.title, versionName: latest.name, storagePath: latest.storagePath };
      })
      .filter(Boolean);
    const idx = playlist.findIndex((p) => p.trackTitle === track.title);
    if (idx < 0 || !onPlay) return;
    onPlay(playlist[idx].trackTitle, playlist[idx].versionName, playlist[idx].storagePath, playlist, idx);
  };

  const handleRenameTrack = (e, track) => {
    e.stopPropagation();
    setRenameTrackTarget(track);
    setRenameValue(track.title);
    setTimeout(() => renameInputRef.current?.select(), 50);
  };

  const submitRenameTrack = async () => {
    const next = renameValue.trim();
    if (!next || next === renameTrackTarget?.title) { setRenameTrackTarget(null); return; }
    try {
      await renameTrack(renameTrackTarget.id, next);
      if (onMutate) onMutate();
    } catch (err) { console.warn('renameTrack failed', err); }
    setRenameTrackTarget(null);
  };

  const handleDeleteTrack = async (e, track) => {
    e.stopPropagation();
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
      if (onMutate) onMutate();
    } catch (err) { console.warn('deleteTrack failed', err); }
  };

  // ── Handlers projets ──
  const toggleProject = (projectId) => {
    if (!onSetCurrentProject) return;
    onSetCurrentProject(projectId === currentProjectId ? null : projectId);
  };

  const handleRenameProject = (e, project) => {
    e.stopPropagation();
    setRenameProjectTarget(project);
    setRenameValue(project.name);
    setTimeout(() => renameInputRef.current?.select(), 50);
  };

  const submitRenameProject = async () => {
    const next = renameValue.trim();
    if (!next || next === renameProjectTarget?.name) { setRenameProjectTarget(null); return; }
    try {
      await renameProject(renameProjectTarget.id, next);
      if (onMutate) onMutate();
    } catch (err) { console.warn('renameProject failed', err); }
    setRenameProjectTarget(null);
  };

  const handleDeleteProject = async (e, project) => {
    e.stopPropagation();
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
      if (onMutate) onMutate();
    } catch (err) { console.warn('deleteProject failed', err); }
  };

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
      if (onMutate) onMutate();
      if (created?.id && onSetCurrentProject) onSetCurrentProject(created.id);
    } catch (err) { console.warn('createProject failed', err); }
  };

  const handleAddTrackToProject = (e, project) => {
    e.stopPropagation();
    // Phase 4 : on passera le projectId au flux d'upload.
    // Pour l'instant, on marque le projet comme "courant" (sera utilisé par
    // saveAnalysis en 4a) et on déclenche le flux "Nouveau titre".
    if (onSetCurrentProject) onSetCurrentProject(project.id);
    if (onNewTrack) onNewTrack();
  };

  /* ─── Drag & drop ─────────────────────────────────────────── */
  // drag = { type: 'track'|'project', trackId?, sourceProjectId?, projectId? } | null
  const [drag, setDrag] = useState(null);

  const handleDropTrackOnTrack = async (sourceTrackId, sourceProjectId, targetTrackId, targetProjectId, position /* 'before' | 'after' */) => {
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
        // Réindexe l'ancien projet (positions propres)
        const sourceProject = projects.find(p => p.id === sourceProjectId);
        if (sourceProject) {
          const sourceOrder = (sourceProject.tracks || []).map(t => t.id).filter(id => id !== sourceTrackId);
          if (sourceOrder.length) await reorderTracksInProject(sourceProjectId, sourceOrder);
        }
      }
      await reorderTracksInProject(targetProjectId, targetOrder);
      if (onMutate) onMutate();
    } catch (err) { console.warn('drop track on track failed', err); }
  };

  const handleDropTrackOnProject = async (sourceTrackId, sourceProjectId, targetProjectId) => {
    if (sourceProjectId === targetProjectId) return;
    try {
      await moveTrackToProject(sourceTrackId, targetProjectId);
      // Réindexe l'ancien projet
      const sourceProject = projects.find(p => p.id === sourceProjectId);
      if (sourceProject) {
        const sourceOrder = (sourceProject.tracks || []).map(t => t.id).filter(id => id !== sourceTrackId);
        if (sourceOrder.length) await reorderTracksInProject(sourceProjectId, sourceOrder);
      }
      if (onMutate) onMutate();
    } catch (err) { console.warn('drop track on project failed', err); }
  };

  const handleDropProjectOnProject = async (sourceProjectId, targetProjectId, position) => {
    if (sourceProjectId === targetProjectId) return;
    const order = projects.map(p => p.id).filter(id => id !== sourceProjectId);
    const targetIdx = order.findIndex(id => id === targetProjectId);
    if (targetIdx < 0) return;
    const insertAt = position === 'before' ? targetIdx : targetIdx + 1;
    order.splice(insertAt, 0, sourceProjectId);
    try {
      await reorderProjects(order);
      if (onMutate) onMutate();
    } catch (err) { console.warn('drop project failed', err); }
  };

  const avatarUrl = userProfile?.avatar_url || null;
  const displayName = userProfile?.prenom || null;
  const initial = (displayName || user?.email || 'U').trim().charAt(0).toUpperCase();
  const who = displayName || (user?.email ? user.email.split('@')[0] : 'utilisateur');

  return (
    <aside className="sidebar">
      <div className="brand" onClick={onGoHome} style={{ cursor: 'pointer' }}>
        <img src="/logo-versions.svg" alt="" style={{ height: 38, width: 'auto' }} />
        <span>{'VER'}<span className="accent">{'SI'}</span>{'ONS'}</span>
      </div>

      <div className="user-pill" onClick={onGoReglages} style={{ cursor: 'pointer' }}>
        <div className="avatar">
          {avatarUrl
            ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            : initial}
        </div>
        <div>
          <div className="who">{who}</div>
          <div className="plan">Premier</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0, marginTop: 8 }}>
        <div className="section-label">Mes projets</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 2px' }}>
          {(() => {
            // Couleurs uniques par projet (même logique que la home).
            const colorMap = assignProjectColors(projects);
            return projects.map((project) => (
              <ProjectAccordion
                key={project.id}
                project={project}
                colorIndex={colorMap.get(project.id) ?? 0}
                open={project.id === currentProjectId}
                onToggle={() => toggleProject(project.id)}
                onTrackClick={handleTrackClick}
                onPlayTrack={handlePlayTrack}
                onRenameTrack={handleRenameTrack}
                onDeleteTrack={handleDeleteTrack}
                onRenameProject={handleRenameProject}
                onDeleteProject={handleDeleteProject}
                onAddTrack={handleAddTrackToProject}
                currentTrackTitle={currentTrackTitle}
                playerState={playerState}
                drag={drag}
                setDrag={setDrag}
                onDropTrackOnTrack={handleDropTrackOnTrack}
                onDropTrackOnProject={handleDropTrackOnProject}
                onDropProjectOnProject={handleDropProjectOnProject}
              />
            ));
          })()}

          <button
            className="new-track"
            onClick={handleNewProject}
            style={{ marginTop: 10 }}
          >+ Nouveau projet</button>
        </div>
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
    </aside>
  );
}

/* ─── Accordéon projet ─────────────────────────────────────── */
function ProjectAccordion({
  project,
  colorIndex = 0,
  open,
  onToggle,
  onTrackClick,
  onPlayTrack,
  onRenameTrack,
  onDeleteTrack,
  onRenameProject,
  onDeleteProject,
  onAddTrack,
  currentTrackTitle,
  playerState,
  drag,
  setDrag,
  onDropTrackOnTrack,
  onDropTrackOnProject,
  onDropProjectOnProject,
}) {
  // Couleur projet : cover_gradient si défini (>0), sinon index unique
  // calculé au niveau parent (garantit l'unicité entre projets).
  const resolvedIdx = project.coverGradient
    ? project.coverGradient % PROJECT_COLOR_COUNT
    : colorIndex;
  const gradient = GRADIENTS[resolvedIdx % GRADIENTS.length];
  const nTracks = project.tracks?.length || 0;
  const [hoverHead, setHoverHead] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // dropOver = 'before' | 'after' | 'into' | null
  const [dropOver, setDropOver] = useState(null);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const headRef = useRef(null);

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

  const showDots = hoverHead || menuOpen;

  return (
    <div
      style={{
        background: open ? 'rgba(255,255,255,.02)' : 'transparent',
        borderRadius: 10,
        transition: 'background .15s',
      }}
    >
      {/* Header projet */}
      <div
        ref={headRef}
        onClick={onToggle}
        onMouseEnter={() => setHoverHead(true)}
        onMouseLeave={() => setHoverHead(false)}
        onDragOver={(e) => {
          if (!drag) return;
          if (drag.type === 'project' && drag.projectId === project.id) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          const rect = headRef.current?.getBoundingClientRect();
          if (!rect) return;
          if (drag.type === 'project') {
            const isAbove = (e.clientY - rect.top) < rect.height / 2;
            setDropOver(isAbove ? 'before' : 'after');
          } else if (drag.type === 'track' && drag.sourceProjectId !== project.id) {
            setDropOver('into');
          }
        }}
        onDragLeave={() => setDropOver(null)}
        onDrop={(e) => {
          e.preventDefault();
          const d = drag;
          setDropOver(null);
          setDrag(null);
          if (!d) return;
          if (d.type === 'project' && d.projectId !== project.id) {
            const rect = headRef.current?.getBoundingClientRect();
            const isAbove = rect ? (e.clientY - rect.top) < rect.height / 2 : true;
            onDropProjectOnProject?.(d.projectId, project.id, isAbove ? 'before' : 'after');
          } else if (d.type === 'track' && d.sourceProjectId !== project.id) {
            onDropTrackOnProject?.(d.trackId, d.sourceProjectId, project.id);
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 10px',
          borderRadius: 10,
          cursor: 'pointer',
          position: 'relative',
          background: dropOver === 'into' ? 'rgba(245,176,86,.10)' : (open ? undefined : 'transparent'),
          boxShadow: dropOver === 'before' ? 'inset 0 2px 0 0 #f5b056' : (dropOver === 'after' ? 'inset 0 -2px 0 0 #f5b056' : 'none'),
          transition: 'background .1s, box-shadow .1s',
        }}
      >
        {/* Poignée de déplacement projet */}
        <span
          draggable={true}
          onClick={(e) => e.stopPropagation()}
          onDragStart={(e) => {
            e.stopPropagation();
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('application/x-versions-dnd', 'project');
            if (headRef.current) e.dataTransfer.setDragImage(headRef.current, 10, 10);
            setDrag({ type: 'project', projectId: project.id });
          }}
          onDragEnd={() => { setDrag(null); setDropOver(null); }}
          title="Glisser pour déplacer le projet"
          aria-label="Déplacer le projet"
          style={{
            width: 14, height: 18, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'grab',
            opacity: hoverHead ? 0.55 : 0,
            transition: 'opacity .15s',
            color: '#c5c5c7',
            marginLeft: -4,
          }}
          onMouseDown={(e) => { e.currentTarget.style.cursor = 'grabbing'; }}
          onMouseUp={(e) => { e.currentTarget.style.cursor = 'grab'; }}
        >
          <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden>
            <circle cx="3" cy="3" r="1.1"/><circle cx="7" cy="3" r="1.1"/>
            <circle cx="3" cy="7" r="1.1"/><circle cx="7" cy="7" r="1.1"/>
            <circle cx="3" cy="11" r="1.1"/><circle cx="7" cy="11" r="1.1"/>
          </svg>
        </span>

        <span
          aria-hidden
          style={{
            width: 16, height: 16, borderRadius: 5,
            background: gradient,
            flexShrink: 0,
            boxShadow: open ? '0 2px 6px rgba(0,0,0,.4)' : 'none',
          }}
        />
        <span
          style={{
            flex: 1, minWidth: 0, fontSize: 13, fontWeight: 500,
            color: '#e8e8ea',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >{project.name}</span>

        {showDots ? (
          <button
            ref={btnRef}
            onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
            title="Options"
            style={{
              width: 22, height: 22, borderRadius: 6,
              background: menuOpen ? 'rgba(245,176,86,.15)' : 'transparent',
              border: 'none', color: '#c5c5c7', cursor: 'pointer',
              padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, lineHeight: 1,
            }}
          >⋯</button>
        ) : (
          <span style={{ fontSize: 11, color: '#8a8a95', minWidth: 18, textAlign: 'right' }}>
            {nTracks}
          </span>
        )}

        <span
          style={{
            fontSize: 10, color: '#8a8a95', width: 10, textAlign: 'center',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform .15s ease',
          }}
        >▾</span>

        {menuOpen && (
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', top: 'calc(100% + 2px)', right: 6, zIndex: 100,
              minWidth: 200, background: '#141416', border: '1px solid #2a2a2e',
              borderRadius: 10, padding: 6, boxShadow: '0 12px 32px rgba(0,0,0,.55)',
            }}
          >
            <SbMenuItem label="+ Nouveau titre" onClick={(e) => { setMenuOpen(false); onAddTrack(e, project); }} />
            <div style={{ height: 1, background: '#2a2a2e', margin: '4px 2px' }} />
            <SbMenuItem label="Renommer" onClick={(e) => { setMenuOpen(false); onRenameProject(e, project); }} />
            <SbMenuItem label="Supprimer" danger onClick={(e) => { setMenuOpen(false); onDeleteProject(e, project); }} />
          </div>
        )}
      </div>

      {/* Body : liste des tracks */}
      {open && (
        <div style={{ paddingLeft: 6, paddingBottom: 6 }}>
          {(project.tracks || []).map((track) => {
            const active = track.title === currentTrackTitle;
            const isPlaying = playerState?.trackTitle === track.title && !!playerState?.isPlaying;
            return (
              <TrackRow
                key={track.id}
                track={track}
                projectId={project.id}
                active={active}
                isPlaying={isPlaying}
                onClick={() => onTrackClick(track)}
                onPlay={(e) => onPlayTrack(e, track, project)}
                onRename={(e) => onRenameTrack(e, track)}
                onDelete={(e) => onDeleteTrack(e, track)}
                drag={drag}
                setDrag={setDrag}
                onDropTrackOnTrack={onDropTrackOnTrack}
              />
            );
          })}
          {nTracks === 0 && (
            <div style={{ padding: '8px 12px', color: '#8a8a95', fontSize: 12, fontStyle: 'italic' }}>
              Aucun titre pour l'instant
            </div>
          )}
          <button
            onClick={(e) => onAddTrack(e, project)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%',
              padding: '8px 10px',
              marginTop: 2,
              background: 'transparent',
              border: '1px dashed #2a2a2e',
              borderRadius: 8,
              color: '#8a8a95',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3a3a44'; e.currentTarget.style.color = '#c5c5c7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a2e'; e.currentTarget.style.color = '#8a8a95'; }}
          >+ Nouveau titre</button>
        </div>
      )}
    </div>
  );
}

/* ─── Row titre (DnD Phase 6) ──────────────────────────────── */
function TrackRow({ track, projectId, active, isPlaying, onClick, onPlay, onRename, onDelete, drag, setDrag, onDropTrackOnTrack }) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // dropOver = 'before' | 'after' | null
  const [dropOver, setDropOver] = useState(null);
  const rowRef = useRef(null);
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

  const showDots = hover || menuOpen;

  return (
    <div
      ref={rowRef}
      className={`track${active ? ' active' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDragOver={(e) => {
        if (!drag || drag.type !== 'track') return;
        if (drag.trackId === track.id) return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        const rect = rowRef.current?.getBoundingClientRect();
        if (!rect) return;
        const isAbove = (e.clientY - rect.top) < rect.height / 2;
        setDropOver(isAbove ? 'before' : 'after');
      }}
      onDragLeave={() => setDropOver(null)}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const d = drag;
        setDropOver(null);
        if (setDrag) setDrag(null);
        if (!d || d.type !== 'track' || d.trackId === track.id) return;
        const rect = rowRef.current?.getBoundingClientRect();
        const isAbove = rect ? (e.clientY - rect.top) < rect.height / 2 : true;
        onDropTrackOnTrack?.(d.trackId, d.sourceProjectId, track.id, projectId, isAbove ? 'before' : 'after');
      }}
      style={{
        position: 'relative',
        boxShadow: dropOver === 'before' ? 'inset 0 2px 0 0 #f5b056' : (dropOver === 'after' ? 'inset 0 -2px 0 0 #f5b056' : 'none'),
        transition: 'box-shadow .1s',
      }}
    >
      {/* Poignée de déplacement titre */}
      <span
        draggable={true}
        onClick={(e) => e.stopPropagation()}
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('application/x-versions-dnd', 'track');
          if (rowRef.current) e.dataTransfer.setDragImage(rowRef.current, 10, 10);
          if (setDrag) setDrag({ type: 'track', trackId: track.id, sourceProjectId: projectId });
        }}
        onDragEnd={() => { if (setDrag) setDrag(null); setDropOver(null); }}
        title="Glisser pour déplacer le titre"
        aria-label="Déplacer le titre"
        style={{
          width: 12, height: 16, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'grab',
          opacity: hover ? 0.55 : 0,
          transition: 'opacity .15s',
          color: '#c5c5c7',
          marginLeft: -2,
        }}
        onMouseDown={(e) => { e.currentTarget.style.cursor = 'grabbing'; }}
        onMouseUp={(e) => { e.currentTarget.style.cursor = 'grab'; }}
      >
        <svg width="9" height="13" viewBox="0 0 9 13" fill="currentColor" aria-hidden>
          <circle cx="2.5" cy="2.5" r="1"/><circle cx="6.5" cy="2.5" r="1"/>
          <circle cx="2.5" cy="6.5" r="1"/><circle cx="6.5" cy="6.5" r="1"/>
          <circle cx="2.5" cy="10.5" r="1"/><circle cx="6.5" cy="10.5" r="1"/>
        </svg>
      </span>

      <button
        onClick={onPlay}
        title={isPlaying ? 'En lecture' : 'Écouter'}
        className={`sb-play-btn${isPlaying ? ' playing' : ''}`}
      >
        {isPlaying ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="2" y="1.5" width="3" height="9" rx="0.8" /><rect x="7" y="1.5" width="3" height="9" rx="0.8" /></svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M2.5 1v10l8-5z" /></svg>
        )}
      </button>

      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {track.title}
      </span>

      {showDots ? (
        <button
          ref={btnRef}
          onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
          title="Options"
          style={{
            width: 24, height: 24, borderRadius: 6,
            background: menuOpen ? 'rgba(245,176,86,.15)' : 'transparent',
            border: 'none', color: '#c5c5c7', cursor: 'pointer',
            padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, lineHeight: 1,
          }}
        >⋯</button>
      ) : null}

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
          <SbMenuItem label="Renommer" onClick={(e) => { setMenuOpen(false); onRename(e); }} />
          <div style={{ height: 1, background: '#2a2a2e', margin: '4px 2px' }} />
          <SbMenuItem label="Supprimer" danger onClick={(e) => { setMenuOpen(false); onDelete(e); }} />
        </div>
      )}
    </div>
  );
}

function SbMenuItem({ label, onClick, danger }) {
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

/* ─── Dégradés des covers projet (6 teintes, en phase avec la DB cover_gradient 0–5) ── */
const GRADIENTS = [
  'linear-gradient(135deg, #4a3b2a, #8a6a3f 60%, #c6a15b)', // 0 ambre
  'linear-gradient(135deg, #2a3a4a, #3f6a8a 60%, #5ba1c6)', // 1 bleu
  'linear-gradient(135deg, #3a2a4a, #6a3f8a 60%, #a15bc6)', // 2 violet
  'linear-gradient(135deg, #2a4a3a, #3f8a6a 60%, #5bc6a1)', // 3 vert
  'linear-gradient(135deg, #4a2a2a, #8a3f3f 60%, #c65b5b)', // 4 rouge
  'linear-gradient(135deg, #24242c, #3a3a48 70%, #5a5a6e)', // 5 gris
];

