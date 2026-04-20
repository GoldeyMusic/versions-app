import { useState } from 'react';
import { createPortal } from 'react-dom';
import useLang from '../hooks/useLang';

/**
 * AddModal — modale unifiée d'ajout depuis la home.
 * Trois choix : Nouveau projet, Nouveau titre, Ajouter une version.
 * Certains choix déclenchent un sous-écran (pick de projet ou de titre).
 *
 * Props :
 *   - onClose                : ferme la modale
 *   - onNewProject           : () => void
 *   - onNewTrackInProject    : (projectId) => void
 *   - onNewProjectThenTrack  : () => void  (cas 0 projet)
 *   - onAddVersionToTrack    : (track) => void
 *   - projects               : liste projets (pour le sous-écran)
 *   - allTracks              : liste titres à plat (pour le sous-écran)
 */
export default function AddModal({
  onClose,
  onNewProject,
  onNewTrackInProject,
  onNewProjectThenTrack,
  onAddVersionToTrack,
  projects = [],
  allTracks = [],
}) {
  const { s } = useLang();
  // step: 'root' | 'pick-project' | 'pick-track'
  const [step, setStep] = useState('root');

  const hasProjects = projects.length > 0;
  const hasTracks = allTracks.length > 0;

  const handleNewTrackClick = () => {
    if (!hasProjects) {
      // Pas encore de projet : crée-le, puis enchaîne sur le titre
      onNewProjectThenTrack();
      onClose();
      return;
    }
    if (projects.length === 1) {
      onNewTrackInProject(projects[0].id);
      onClose();
      return;
    }
    setStep('pick-project');
  };

  const handleAddVersionClick = () => {
    if (!hasTracks) return;
    if (allTracks.length === 1) {
      onAddVersionToTrack(allTracks[0]);
      onClose();
      return;
    }
    setStep('pick-track');
  };

  const backdropStyle = {
    position: 'fixed', inset: 0, zIndex: 10000,
    background: 'rgba(0,0,0,.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'DM Sans', sans-serif",
    padding: 16,
  };
  const cardStyle = {
    width: 440, maxWidth: '92vw',
    background: '#141416', border: '1px solid #2a2a2e',
    borderRadius: 14, padding: 22, boxShadow: '0 20px 60px rgba(0,0,0,.6)',
    boxSizing: 'border-box',
  };
  const headerStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16,
  };
  const titleStyle = {
    fontSize: 14, color: '#e8e8ea', fontWeight: 500,
  };
  const backBtnStyle = {
    background: 'transparent', border: 'none', color: '#9a9a9e',
    fontSize: 14, cursor: 'pointer', padding: '4px 8px',
    fontFamily: 'inherit',
  };
  const closeBtnStyle = {
    background: 'transparent', border: 'none', color: '#9a9a9e',
    fontSize: 20, cursor: 'pointer', padding: 0, lineHeight: 1,
    fontFamily: 'inherit',
  };
  const choiceStyle = (disabled) => ({
    display: 'flex', alignItems: 'flex-start', gap: 14,
    width: '100%', textAlign: 'left',
    padding: '14px 16px', borderRadius: 10,
    background: '#0e0e10', border: '1px solid #2a2a2e',
    color: disabled ? '#5a5a5e' : '#e8e8ea',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all .15s',
    fontFamily: 'inherit',
    opacity: disabled ? 0.5 : 1,
  });
  const iconStyle = {
    fontSize: 18, lineHeight: 1, color: '#f5b056',
    width: 22, flex: '0 0 auto', marginTop: 1,
  };
  const choiceLabel = { fontSize: 14, fontWeight: 500, marginBottom: 4 };
  const choiceDesc = { fontSize: 14, color: '#9a9a9e', fontWeight: 300, lineHeight: 1.5 };

  const pickItemStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    width: '100%', textAlign: 'left',
    padding: '12px 14px', borderRadius: 8,
    background: '#0e0e10', border: '1px solid #2a2a2e',
    color: '#e8e8ea', cursor: 'pointer', fontFamily: 'inherit',
    fontSize: 14, fontWeight: 300,
    transition: 'all .15s',
  };
  const pickCountStyle = {
    fontSize: 10, color: '#9a9a9e', letterSpacing: 0.5,
    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
  };

  return createPortal((
    <div onClick={onClose} style={backdropStyle}>
      <div onClick={(e) => e.stopPropagation()} style={cardStyle}>
        <div style={headerStyle}>
          {step === 'root' ? (
            <div style={titleStyle}>{s.addModal.title}</div>
          ) : (
            <button style={backBtnStyle} onClick={() => setStep('root')}>
              {s.addModal.back}
            </button>
          )}
          <button style={closeBtnStyle} onClick={onClose} aria-label={s.addModal.close}>×</button>
        </div>

        {step === 'root' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              style={choiceStyle(false)}
              onClick={() => { onNewProject(); onClose(); }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f5b056'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a2e'; }}
            >
              <span style={iconStyle}>+</span>
              <span>
                <div style={choiceLabel}>{s.addModal.choiceNewProjectLabel}</div>
                <div style={choiceDesc}>{s.addModal.choiceNewProjectDesc}</div>
              </span>
            </button>
            <button
              style={choiceStyle(false)}
              onClick={handleNewTrackClick}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f5b056'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a2e'; }}
            >
              <span style={iconStyle}>+</span>
              <span>
                <div style={choiceLabel}>{s.addModal.choiceNewTrackLabel}</div>
                <div style={choiceDesc}>{s.addModal.choiceNewTrackDesc}</div>
              </span>
            </button>
            <button
              style={choiceStyle(!hasTracks)}
              disabled={!hasTracks}
              onClick={handleAddVersionClick}
              onMouseEnter={(e) => { if (hasTracks) e.currentTarget.style.borderColor = '#f5b056'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a2e'; }}
            >
              <span style={iconStyle}>↻</span>
              <span>
                <div style={choiceLabel}>{s.addModal.choiceAddVersionLabel}</div>
                <div style={choiceDesc}>
                  {hasTracks
                    ? s.addModal.choiceAddVersionDesc
                    : s.addModal.choiceAddVersionDescDisabled}
                </div>
              </span>
            </button>
          </div>
        )}

        {step === 'pick-project' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 14, color: '#9a9a9e', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>
              {s.addModal.pickProjectTitle}
            </div>
            {projects.map((p) => {
              const n = p.tracks?.length || 0;
              return (
                <button
                  key={p.id}
                  style={pickItemStyle}
                  onClick={() => { onNewTrackInProject(p.id); onClose(); }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f5b056'; e.currentTarget.style.color = '#f5b056'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a2e'; e.currentTarget.style.color = '#e8e8ea'; }}
                >
                  <span>{p.name}</span>
                  <span style={pickCountStyle}>{n} {n > 1 ? s.addModal.trackPlural : s.addModal.trackSingular}</span>
                </button>
              );
            })}
            <button
              style={{ ...pickItemStyle, justifyContent: 'flex-start', gap: 10, marginTop: 4, borderTop: '1px solid #2a2a2e', borderRadius: '0 0 8px 8px' }}
              onClick={() => { onNewProjectThenTrack(); onClose(); }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#f5b056'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#e8e8ea'; }}
            >
              <span style={{ color: '#f5b056', fontSize: 14 }}>+</span>
              <span>{s.addModal.createNewProject}</span>
            </button>
          </div>
        )}

        {step === 'pick-track' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 14, color: '#9a9a9e', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>
              {s.addModal.pickTrackTitle}
            </div>
            {allTracks.map((t) => {
              const n = t.versions?.length || 0;
              return (
                <button
                  key={t.id}
                  style={pickItemStyle}
                  onClick={() => { onAddVersionToTrack(t); onClose(); }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f5b056'; e.currentTarget.style.color = '#f5b056'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a2e'; e.currentTarget.style.color = '#e8e8ea'; }}
                >
                  <span>{t.title}</span>
                  <span style={pickCountStyle}>{n} {n > 1 ? s.addModal.versionPlural : s.addModal.versionSingular}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  ), document.body);
}
