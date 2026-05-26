// Persistance d'un job d'analyse en cours dans localStorage, pour survivre
// à un refresh / une navigation / un tab close pendant que l'analyse tourne
// côté backend. Indispensable parce que :
//   - LoadingScreen est un composant React : son state (jobId, config) est
//     wipé à chaque unmount (refresh, click sur le logo, back navigateur).
//   - Le crédit est débité côté serveur dès POST /start, mais la persistance
//     côté front (saveAnalysis) ne tourne qu'à la fin du polling. Si le front
//     n'est plus là pour poller, l'utilisateur n'a aucun lien vers sa fiche.
//   - Le palier 4 (persistance backend) crée bien la version en DB, mais le
//     front a besoin de l'ID pour naviguer vers /fiche/... — sans entrée
//     pending, il ne sait pas qu'une analyse était en cours.
//
// TTL 30 min : au-delà, on présume que le job est mort (timeout backend
// ou abandon volontaire). Le cron refund_orphan_debits côté Supabase
// nettoie le crédit dans ce cas.

const KEY = 'versions_pending_job';
const TTL_MS = 30 * 60 * 1000;

function readRaw() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== 'object' || !obj.jobId) return null;
    if (!obj.startedAt || (Date.now() - obj.startedAt) > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return obj;
  } catch { return null; }
}

// Sauvegarde une entrée pending. `entry` doit contenir au minimum jobId.
// Champs utiles : title, version, projectId, audioHash, vocalType, uploadType.
export function savePending(entry) {
  if (!entry?.jobId) return;
  try {
    const merged = { startedAt: Date.now(), ...entry };
    localStorage.setItem(KEY, JSON.stringify(merged));
  } catch { /* quota / mode privé : on ignore, c'est best-effort */ }
}

// Récupère l'entrée pending courante (null si absente ou expirée).
export function getPending() {
  return readRaw();
}

// Merge des champs dans l'entrée existante (ex : persistedTrackId reçu en
// cours de polling). Sans-op si pas d'entrée courante.
export function updatePending(patch) {
  const cur = readRaw();
  if (!cur) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...cur, ...patch }));
  } catch { /* noop */ }
}

// Supprime l'entrée pending — à appeler dès qu'une fiche a été persistée
// avec succès et que l'utilisateur est en train de la voir.
export function clearPending() {
  try { localStorage.removeItem(KEY); } catch { /* noop */ }
}
