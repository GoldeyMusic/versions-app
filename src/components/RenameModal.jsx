import { createPortal } from 'react-dom';
import useLang from '../hooks/useLang';

/**
 * RenameModal — modale unifiée pour renommer / créer (projet, titre, version…).
 * Utilisée par Sidebar et WelcomeHome. Valide si la valeur est non vide et
 * différente de `originalValue` (qui peut être "" pour un mode "création").
 *
 * Montée via portail dans document.body pour échapper à tout conteneur
 * `overflow: auto` (sidebar, accordéon, etc.) qui pourrait la clipper.
 *
 * Utilise la grammaire "mini-modal" du site : add-mini-backdrop, add-mini-card,
 * add-mini-title, add-mini-input, add-mini-foot, add-mini-btn[.is-primary].
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
  confirmLabel,
}) {
  const { s } = useLang();
  const effConfirm = confirmLabel ?? s.common.save;
  const trimmed = (value || '').trim();
  const disabled = !trimmed || trimmed === originalValue;
  return createPortal((
    <div className="add-mini-backdrop" onClick={onCancel}>
      <div className="add-mini-card" onClick={(e) => e.stopPropagation()}>
        <div className="add-mini-title">
          {(() => {
            // Colore le dernier mot en amber (via <em>) pour rester raccord
            // avec la grammaire des autres modales (« Ajouter quoi ? »,
            // « Nouveau titre », etc.).
            if (typeof title !== 'string') return title;
            const idx = title.lastIndexOf(' ');
            if (idx < 0) return title;
            return <>{title.slice(0, idx)} <em>{title.slice(idx + 1)}</em></>;
          })()}
        </div>
        <input
          ref={inputRef}
          className="add-mini-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !disabled) onSubmit();
            if (e.key === 'Escape') onCancel();
          }}
          placeholder={placeholder}
        />
        <div className="add-mini-foot">
          <button className="add-mini-btn" onClick={onCancel}>{s.common.cancel}</button>
          <button
            className="add-mini-btn is-primary"
            onClick={onSubmit}
            disabled={disabled}
          >{effConfirm}</button>
        </div>
      </div>
    </div>
  ), document.body);
}
