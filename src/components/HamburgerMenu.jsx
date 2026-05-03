import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

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
  const triggerRef = useRef(null);
  const popRef = useRef(null);
  // Position calculée pour le popover en mode portal (top + right depuis
  // le viewport, recomputée à chaque ouverture / resize). Sans ça, on
  // reste sur le mode "absolute relatif au trigger" qui marche tant que
  // le popover vit dans le même DOM tree.
  const [popPos, setPopPos] = useState(null);

  // Recompute la position du popover : sous le trigger, aligné à droite
  // sur le bord droit du trigger. Top = bottom du trigger + 6px de gap.
  // En portal dans <body>, on utilise getBoundingClientRect du trigger
  // (coordonnées viewport, ce que veut position: fixed).
  const recomputePosition = () => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPopPos({
      top: Math.round(r.bottom + 6),
      // right = distance entre le bord droit du viewport et le bord
      // droit du trigger (pour aligner le popover à droite du trigger).
      right: Math.round(window.innerWidth - r.right),
    });
  };

  useEffect(() => {
    if (!open) return;
    recomputePosition();
    const onDown = (e) => {
      // Le popover est en portal dans <body> donc !wrapRef.current.contains
      // ne suffit plus. On vérifie aussi si le clic est dans le popover.
      const inWrap = wrapRef.current && wrapRef.current.contains(e.target);
      const inPop = popRef.current && popRef.current.contains(e.target);
      if (!inWrap && !inPop) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onResize = () => recomputePosition();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
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
        ref={triggerRef}
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
      {/* Popover monté EN PORTAL dans <body> pour échapper au stacking
          context du .db-topbar (z-index 2). Sur fiche mobile, sans ça
          le chip "MIX SANS LIMITER" du VersionDropdown passait devant
          le menu — parce qu'il vit dans un parent avec un stacking
          context plus haut. En portal, le popover s'assoit dans le
          stacking context racine, plus rien ne le domine. */}
      {open && popPos && createPortal((
        <div
          ref={popRef}
          className="hb-menu-pop hb-menu-pop-portal"
          role="menu"
          style={{ top: popPos.top, right: popPos.right }}
        >
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
      ), document.body)}
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
  // Feedback — cœur Lucide rempli (utilisé pour l'item "Ton avis
   // compte" dans le hamburger mobile du DashboardTopbar). Filled
   // pour rester reconnaissable même à 20px.
  feedback: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
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
