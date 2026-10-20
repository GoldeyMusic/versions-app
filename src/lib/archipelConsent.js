// Consentement emails Archipel Audio (migration 052, mémo 2026-10-20).
//
// Versions des textes affichés : DOIVENT exister dans
// public.archipel_text_versions (vérifiées côté serveur). Toute nouvelle
// formulation dans strings.js (auth.archipel* ou reglages.archipel*) =
// nouvelle version ici + nouvelle ligne SQL. Ne jamais réutiliser une
// version pour un texte différent.
import { supabase } from './supabase';

export const ARCHIPEL_SIGNUP_TEXT = { fr: 'fr-2026-10-A', en: 'en-2026-10-A' };
export const ARCHIPEL_ACCOUNT_TEXT = { fr: 'acct-fr-2026-10-A', en: 'acct-en-2026-10-A' };
// Carte de sollicitation sur le tableau de bord (comptes sans choix).
export const ARCHIPEL_TOAST_TEXT = { fr: 'toast-fr-2026-10-A', en: 'toast-en-2026-10-A' };

export const archipelSignupText = (lang) => ARCHIPEL_SIGNUP_TEXT[lang === 'en' ? 'en' : 'fr'];
export const archipelAccountText = (lang) => ARCHIPEL_ACCOUNT_TEXT[lang === 'en' ? 'en' : 'fr'];
export const archipelToastText = (lang) => ARCHIPEL_TOAST_TEXT[lang === 'en' ? 'en' : 'fr'];

// Inscription Google : le choix est fait AVANT la redirection OAuth, on
// le garde le temps de l'aller-retour puis on l'enregistre au SIGNED_IN.
// La RPC est un no-op pour un compte créé il y a plus d'1 h (login d'un
// compte existant) — sans risque d'appeler à chaque connexion Google.
const PENDING_KEY = 'versions_archipel_pending';
const PENDING_TTL_MS = 30 * 60 * 1000;

export function saveArchipelPending(textVersion, refused) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify({ t: textVersion, r: !!refused, at: Date.now() }));
  } catch {}
}

export async function flushArchipelPending() {
  let pending = null;
  try {
    pending = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null');
    localStorage.removeItem(PENDING_KEY);
  } catch {}
  if (!pending || !pending.t || Date.now() - (pending.at || 0) > PENDING_TTL_MS) return;
  try {
    const { error } = await supabase.rpc('archipel_record_signup', {
      p_text_version: pending.t,
      p_refused: !!pending.r,
    });
    if (error) console.warn('[archipel] record_signup:', error.message);
  } catch (e) {
    console.warn('[archipel] record_signup:', e && e.message);
  }
}

// Ligne de consentement brute (null = aucun choix jamais fait).
export async function loadArchipelConsentRow(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('archipel_consent')
    .select('archipel_basis, archipel_optout_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

// Réglages : abonné = une base existe ET aucune opposition.
export async function loadArchipelSubscribed(userId) {
  if (!userId) return false;
  const { data, error } = await supabase
    .from('archipel_consent')
    .select('archipel_basis, archipel_optout_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return !!(data && data.archipel_basis && !data.archipel_optout_at);
}

// textVersion : version du texte réellement affiché (Réglages par défaut,
// carte du tableau de bord sinon).
export async function setArchipelSubscribed(subscribe, lang, textVersion) {
  const { data, error } = await supabase.rpc('archipel_set_preference', {
    p_subscribe: !!subscribe,
    p_text_version: subscribe ? (textVersion || archipelAccountText(lang)) : null,
  });
  if (error) throw error;
  if (data !== 'ok') throw new Error(`archipel_set_preference: ${data}`);
}
