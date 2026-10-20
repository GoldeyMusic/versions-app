// Mail de bienvenue (ajout 2026-10-20) — POST /api/account/welcome au
// SIGNED_IN. Le backend est la seule source de vérité (flag
// app_metadata.welcome_sent_at, comptes de moins de 48 h, email confirmé) ;
// ici on évite seulement les appels inutiles : comptes anciens ignorés,
// un seul appel par compte et par navigateur, pas de double appel si
// SIGNED_IN tire deux fois de suite.
import API from '../constants/api';

const MAX_AGE_MS = 48 * 3600 * 1000;
const inFlight = new Set();

function readLocale() {
  try {
    const stored = localStorage.getItem('versions_lang');
    if (stored === 'en' || stored === 'fr') return stored;
  } catch {}
  return undefined;
}

export async function sendWelcomeOnce(session) {
  const user = session?.user;
  const token = session?.access_token;
  if (!user?.id || !token) return;
  const created = new Date(user.created_at || 0).getTime();
  if (!created || Date.now() - created > MAX_AGE_MS) return;
  if (!user.email_confirmed_at && !user.confirmed_at) return;
  const key = `versions_welcome_done_${user.id}`;
  try { if (localStorage.getItem(key)) return; } catch {}
  if (inFlight.has(user.id)) return;
  inFlight.add(user.id);
  try {
    const res = await fetch(`${API}/api/account/welcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ locale: readLocale() }),
    });
    if (res.ok) {
      try { localStorage.setItem(key, '1'); } catch {}
    }
  } catch (e) {
    console.warn('[welcome] request failed:', e && e.message);
  } finally {
    inFlight.delete(user.id);
  }
}
