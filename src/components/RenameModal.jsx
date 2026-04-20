import { createPortal } from 'react-dom';

/**
 * RenameModal — modale unifiée pour renommer / créer (projet, titre, version…).
 * Utilisée par Sidebar et WelcomeHome. Valide si la valeur est non vide et
 * différente de `originalValue` (qui peut être "" pour un mode "création").
 *
 * Montée via portail dans document.body pour échapper à tout conteneur
 * `overflow: auto` (sidebar, accordéon, etc.) qui pourrait la clipper.
 */
export default function RenameModal({
  title,
  placeholder,
  value,
  originalValue = '',
  inputRef,
  onChange,
  onCancel,
  onSubmit,
  confirmLabel = 'Enregistrer',
}) {
  const trimmed = (value || '').trim();
  const disabled = !trimmed || trimmed === originalValue;
  return createPortal((
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 380, maxWidth: '90vw',
          background: '#141416', border: '1px solid #2a2a2e',
          borderRadius: 14, padding: 22, boxShadow: '0 20px 60px rgba(0,0,0,.6)',
        }}
      >
        <div style={{ fontSize: 14, color: '#e8e8ea', marginBottom: 14, fontWeight: 500 }}>
          {title}
        </div>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !disabled) onSubmit();
            if (e.key === 'Escape') onCancel();
          }}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '10px 12px', fontSize: 13,
            background: '#0e0e10', border: '1px solid #2a2a2e',
            borderRadius: 8, color: '#e8e8ea', outline: 'none',
            fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px', fontSize: 12, borderRadius: 8,
              background: 'transparent', border: '1px solid #2a2a2e',
              color: '#c5c5c7', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >Annuler</button>
          <button
            onClick={onSubmit}
            disabled={disabled}
            style={{
              padding: '8px 16px', fontSize: 12, borderRadius: 8,
              background: '#f5b056', border: 'none',
              color: '#141416', cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit',
              opacity: disabled ? 0.5 : 1,
            }}
          >{confirmLabel}</button>
        </div>
      </div>
    </div>
  ), document.body);
}
