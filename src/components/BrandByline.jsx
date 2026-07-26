/**
 * Byline "by Archipel Audio" affichee sous le wordmark VERSiONS.
 * Une lettre par span + flex space-between (CSS .brand-byline dans
 * MockupStyles) pour que la ligne fasse STRICTEMENT la largeur du
 * wordmark au-dessus : on wrappe wordmark + byline dans .brand-col
 * (colonne dont le wordmark definit la largeur, byline etiree via
 * align-self: stretch). Decision David 2026-07-26.
 */
export default function BrandByline({ className = 'brand-byline' }) {
  return (
    <span className={className} aria-label="by Archipel Audio">
      {'by Archipel Audio'.split('').map((c, i) => (
        <span key={i} aria-hidden="true">{c === ' ' ? '\u00A0' : c}</span>
      ))}
    </span>
  );
}
