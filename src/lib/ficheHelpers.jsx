// Petits utilitaires partagés entre FicheScreen (privé) et PublicFicheScreen
// (lien public lecture seule). Extraits pour satisfaire la règle
// react-refresh/only-export-components : un fichier de composants ne doit
// exporter que des composants, les fonctions utilitaires vivent à côté.

export function renderWithEmphasis(text) {
  if (!text) return null;
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((p, i) =>
    p.startsWith('*') && p.endsWith('*') && p.length > 2
      ? <em key={i}>{p.slice(1, -1)}</em>
      : <span key={i}>{p}</span>
  );
}

// Formate un timestamp en texte humain : "il y a N jours" / "hier" / "le X avril".
// Retourne null si la date n'est pas interprétable.
export function formatAnalyzedAt(input) {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'Analysé à l\u2019instant';
  if (diffMin < 60) return `Analysé il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `Analysé il y a ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  if (diffD === 1) return 'Analysé hier';
  if (diffD < 30) return `Analysé il y a ${diffD} jours`;
  try {
    const f = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    return `Analysé le ${f.format(d)}`;
  } catch {
    return `Analysé le ${d.toLocaleDateString('fr-FR')}`;
  }
}

// Sépare un texte en (1ʳᵉ phrase → titre) + (reste → paragraphe).
// Retourne { headline, rest } ; rest peut être vide.
export function splitVerdict(text) {
  if (!text) return { headline: '', rest: '' };
  const m = text.match(/^([^.!?]*[.!?])\s+(.*)$/s);
  if (m) return { headline: m[1].trim(), rest: m[2].trim() };
  return { headline: text.trim(), rest: '' };
}
