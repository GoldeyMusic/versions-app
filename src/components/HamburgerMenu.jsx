import { useState, useEffect, useRef } from 'react';

/**
 * HamburgerMenu — bouton hamburger compact (32x32) qui ouvre un menu
 * dropdown vertical avec icône + label sur chaque ligne. Refonte
 * 2026-04-30 : passé en icon-text (les icônes seules manquaient de
 * lisibilité).
 *
 * Props :
 *  - items         : [{ key, label, icon, onSelect, current?: bool }] — nav principale
 *  - utilityItems  : [...] — section utilitaire (admin/réglages/déconnexion).
 *                    Rendue après une séparation visuelle si fournie.
 *  - credits       : number | null — nb de crédits courants. Si non null,
 *                    rendu dans le footer du menu (cliquable → /pricing).
 *  - planLabel     : string | null — libellé d abonnement actif (ex.
 *                    "Indé · 5 €/mois"). Affiché sous les crédits si fourni.
 *  - onPlanClick   : fn — call-to-action footer (généralement → /pricing).
 *  - className     : optionnel
 *
 * Comportement :
 *  - click outside et Escape ferment le menu
 *  - menu ancré sous le bouton, aligné à droite
 *
 * CSS associé : .hb-menu / .hb-trigger / .hb-menu-pop / .hb-item /
 * .hb-section / .hb-footer (vit dans MockupStyles, chargé global).
 */
export default function HamburgerMenu({
  items = [],
  utilityItems = [],
  credits = null,
  planLabel = null,
  onPlanClick = null,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleSelect = (item) => {
    item.onSelect?.();
    setOpen(false);
  };

  const handleFooterClick = () => {
    onPlanClick?.();
    setOpen(false);
  };

  const renderItem = (it) => (
    <button
      key={it.key}
      type="button"
      role="menuitem"
      className={`hb-item ${it.current ? 'is-current' : ''} ${it.danger ? 'is-danger' : ''}`}
      onClick={() => handleSelect(it)}
      aria-current={it.current ? 'page' : undefined}
    >
      <span className="hb-item-icon" aria-hidden="true">{it.icon}</span>
      <span className="hb-item-label">{it.label}</span>
    </button>
  );

  const showFooter = credits != null || planLabel;

  return (
    <div className={`hb-menu ${className}`} ref={wrapRef}>
      <button
        type="button"
        className={`hb-trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="hb-menu-pop" role="menu">
          <div className="hb-section">
            {items.map(renderItem)}
          </div>
          {utilityItems.length > 0 && (
            <>
              <div className="hb-sep" role="presentation" />
              <div className="hb-section">
                {utilityItems.map(renderItem)}
              </div>
            </>
          )}
          {showFooter && (
            <>
              <div className="hb-sep" role="presentation" />
              <button
                type="button"
                className="hb-footer"
                onClick={handleFooterClick}
                aria-label="Voir les tarifs"
              >
                <span className="hb-footer-icon" aria-hidden="true">{NavIcons.wallet}</span>
                <span className="hb-footer-info">
                  {credits != null && (
                    <span className="hb-footer-credits">
                      {credits === 1 ? '1 crédit' : `${credits} crédits`}
                    </span>
                  )}
                  <span className="hb-footer-plan">
                    {planLabel || 'Voir les tarifs'}
                  </span>
                </span>
                <svg className="hb-footer-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Icônes SVG préfabriquées (style lucide minimal). Stroke 1.6, lignes
 * arrondies. ViewBox 24 pour cohérence cross-icon.
 */
export const NavIcons = {
  // Accueil — maison classique
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12L12 4l9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  ),
  // Tarifs — porte-monnaie / wallet (refonte 2026-04-30, plus parlant
  // qu une étiquette de prix générique).
  pricing: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v12a2 2 0 0 0 2 2h15v-5" />
      <path d="M3 7l3-3h13a2 2 0 0 1 2 2v3" />
      <path d="M14 12h7v5h-7a2.5 2.5 0 0 1 0-5z" />
      <circle cx="17.5" cy="14.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  // Tableau de bord — grille 2x2 (layout dashboard)
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  // Réutilisée dans le footer du hamburger pour faire le lien crédits.
  wallet: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v12a2 2 0 0 0 2 2h15v-5" />
      <path d="M3 7l3-3h13a2 2 0 0 1 2 2v3" />
      <path d="M14 12h7v5h-7a2.5 2.5 0 0 1 0-5z" />
      <circle cx="17.5" cy="14.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  // Réglages — engrenage (lucide settings)
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  // Admin — étoile/badge (réservé compte admin)
  admin: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3 7h7l-5.5 4 2 8L12 17l-6.5 4 2-8L2 9h7z" />
    </svg>
  ),
  // Déconnexion — flèche sortante (lucide log-out)
  signOut: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};
