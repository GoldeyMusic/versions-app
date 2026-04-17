/**
 * Attribution des couleurs de projet.
 *
 * Garantit qu'à nombre de projets ≤ N, chaque projet a une couleur distincte.
 * Au-delà de N projets, les couleurs cyclent (inévitable avec une palette finie).
 *
 * L'ordre d'attribution est basé sur `createdAt` (stable, indépendant du DnD),
 * donc la couleur d'un projet ne change pas quand on réordonne la liste.
 */

export const PROJECT_COLOR_COUNT = 6;

/** Hash stable d'une chaîne vers [0..n-1]. */
export function hashToGradient(key, n = PROJECT_COLOR_COUNT) {
  const s = String(key || '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h) % n;
}

/**
 * Renvoie une Map<projectId, colorIndex> où chaque projet a un index unique
 * tant que projects.length ≤ n.
 *
 * Algorithme :
 *  1. Tri les projets par createdAt croissant (fallback id) pour un ordre stable.
 *  2. Chaque projet tente d'abord son index "naturel" (hash de son id).
 *  3. Si pris, rotation +1 jusqu'à trouver un slot libre.
 *  4. Si tous les slots sont occupés (>n projets), on repart d'une nouvelle passe.
 */
export function assignProjectColors(projects, n = PROJECT_COLOR_COUNT) {
  const map = new Map();
  if (!Array.isArray(projects) || projects.length === 0) return map;

  const sorted = [...projects].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (ta !== tb) return ta - tb;
    return String(a.id).localeCompare(String(b.id));
  });

  let used = new Set();
  for (const p of sorted) {
    let idx = hashToGradient(p.id, n);
    let tries = 0;
    while (used.has(idx) && tries < n) {
      idx = (idx + 1) % n;
      tries++;
    }
    if (tries >= n) {
      // Palette saturée → on démarre une nouvelle passe (doublons inévitables).
      used = new Set();
    }
    used.add(idx);
    map.set(p.id, idx);
  }
  return map;
}
