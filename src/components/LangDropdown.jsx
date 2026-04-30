import { useState, useEffect, useRef } from 'react';

/**
 * LangDropdown — bouton compact avec la langue courante + chevron, qui
 * ouvre un mini menu pour choisir l'autre langue. Remplace l'ancien
 * toggle .sb-lang-switch (deux boutons côte-à-côte) sur les topbars
 * qui veulent économiser l'espace (landing, pricing, sample, dashboard).
 *
 * Click outside + ESC ferment le menu.
 *
 * Props :
 *  - lang ('fr' | 'en'), setLang(fn)
 *  - className (optionnel, pour ajuster contexte couleur)
 *
 * CSS associé : .lang-dd / .lang-dd-trigger / .lang-dd-menu / .lang-dd-item
 * (vit dans MockupStyles, chargé global).
 */
export default function LangDropdown({ lang, setLang, className = '' }) {
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

  const choose = (l) => {
    setLang(l);
    setOpen(false);
  };

  return (
    <div className={`lang-dd ${className}`} ref={wrapRef}>
      <button
        type="button"
        className={`lang-dd-trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Langue / Language"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="lang-dd-current">{lang === 'en' ? 'EN' : 'FR'}</span>
        <svg className="lang-dd-chev" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="lang-dd-menu" role="listbox">
          <button
            type="button"
            role="option"
            aria-selected={lang === 'fr'}
            className={`lang-dd-item ${lang === 'fr' ? 'is-active' : ''}`}
            onClick={() => choose('fr')}
          >Français</button>
          <button
            type="button"
            role="option"
            aria-selected={lang === 'en'}
            className={`lang-dd-item ${lang === 'en' ? 'is-active' : ''}`}
            onClick={() => choose('en')}
          >English</button>
        </div>
      )}
    </div>
  );
}
