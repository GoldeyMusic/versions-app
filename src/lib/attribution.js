/**
 * Attribution d'acquisition (pub Meta & co) — migration 051.
 *
 * Trois responsabilités :
 *   1. captureAttribution() — au chargement de l'app : lit les UTM +
 *      fbclid + referrer de l'URL d'arrivée, mémorise la provenance
 *      first-touch en localStorage, et logge un event 'visit' anonyme
 *      en DB (RPC log_landing_event, une fois par session navigateur).
 *   2. logCtaClick() — au clic sur un CTA d'inscription (goAuth) :
 *      logge un event 'cta_click' anonyme (une fois par session).
 *   3. claimAttribution(userId) — au premier SIGNED_IN (même point que
 *      trackPixelSignup) : rattache la provenance mémorisée au compte
 *      via la RPC claim_attribution (first-touch, ON CONFLICT DO
 *      NOTHING côté serveur → idempotent même si le guard localStorage
 *      saute).
 *
 * Détection Meta sans UTM : tous les clics sortants de Facebook et
 * Instagram (pub OU organique via l'app) portent un `?fbclid=...`
 * auto-ajouté. On stocke sa PRÉSENCE (boolean), jamais sa valeur —
 * c'est un identifiant de clic, inutile côté produit.
 *
 * Comme pixel.js : tout est fail-safe, JAMAIS de throw — le tracking
 * ne casse pas l'app (localStorage indispo, RPC en échec, adblock…).
 */

import { supabase } from './supabase';

const STORE_KEY = 'versions_attribution_v1';      // provenance first-touch (localStorage)
const CLAIM_KEY = 'versions_attr_claimed_v1';     // user.ids déjà rattachés (localStorage)
const VISIT_FLAG = 'versions_attr_visit_logged';  // sessionStorage (par onglet/session)
const CTA_FLAG = 'versions_attr_cta_logged';      // sessionStorage

function makeUuid() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  // Fallback vieux navigateurs : pseudo-UUID v4 via Math.random. Pas
  // cryptographique, mais suffisant pour dédupliquer des sessions.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && parsed.session_id ? parsed : null;
  } catch {
    return null;
  }
}

function writeStore(attr) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(attr)); } catch {}
}

/** Une provenance "payée/taguée" (UTM ou fbclid) prime sur direct/organique. */
function hasSourceSignal(a) {
  return !!(a && (a.utm_source || a.fbclid));
}

function readCurrentUrlAttribution() {
  const params = new URLSearchParams(window.location.search);
  const pick = (k) => {
    const v = (params.get(k) || '').trim();
    return v ? v.slice(0, 160) : null;
  };
  // Referrer externe uniquement — un referrer same-origin (navigation
  // interne) n'apporte aucune info de provenance.
  let referrer = null;
  try {
    const ref = document.referrer || '';
    if (ref && !ref.startsWith(window.location.origin)) referrer = ref.slice(0, 300);
  } catch {}
  return {
    utm_source: pick('utm_source'),
    utm_medium: pick('utm_medium'),
    utm_campaign: pick('utm_campaign'),
    utm_content: pick('utm_content'),
    utm_term: pick('utm_term'),
    fbclid: params.has('fbclid'),
    referrer,
    landing_path: (window.location.pathname || '/').slice(0, 200),
    first_seen_at: new Date().toISOString(),
  };
}

function rpcLogEvent(event, attr) {
  try {
    supabase
      .rpc('log_landing_event', {
        p_session_id: attr.session_id,
        p_event: event,
        p_utm_source: attr.utm_source || null,
        p_utm_medium: attr.utm_medium || null,
        p_utm_campaign: attr.utm_campaign || null,
        p_utm_content: attr.utm_content || null,
        p_utm_term: attr.utm_term || null,
        p_fbclid: !!attr.fbclid,
        p_referrer: attr.referrer || null,
        p_landing_path: attr.landing_path || null,
      })
      .then(({ error }) => {
        if (error) console.warn('[attribution] log_landing_event:', error.message);
      });
  } catch {}
}

/**
 * À appeler UNE FOIS au mount de l'app (avant le gate auth — le
 * composant App monte dans tous les cas). Capture la provenance de
 * l'URL courante et logge la visite anonyme.
 */
export function captureAttribution() {
  try {
    if (typeof window === 'undefined') return;
    const current = readCurrentUrlAttribution();
    let stored = readStore();
    if (!stored) {
      stored = { session_id: makeUuid(), ...current };
      writeStore(stored);
    } else if (!hasSourceSignal(stored) && hasSourceSignal(current)) {
      // Upgrade : un ancien visiteur "direct" qui revient via la pub —
      // la provenance taguée gagne (on garde le même session_id pour
      // relier visites et clics du même navigateur).
      stored = { session_id: stored.session_id, ...current };
      writeStore(stored);
    }
    // Event 'visit' : une fois par session navigateur (sessionStorage
    // meurt avec l'onglet). On logge la provenance de CETTE visite
    // (pas le first-touch) pour que les stats landing reflètent le
    // trafic réel du jour.
    let visitLogged = false;
    try { visitLogged = !!sessionStorage.getItem(VISIT_FLAG); } catch {}
    if (!visitLogged) {
      try { sessionStorage.setItem(VISIT_FLAG, '1'); } catch {}
      rpcLogEvent('visit', { session_id: stored.session_id, ...current });
    }
  } catch {}
}

/**
 * À appeler quand un visiteur non connecté clique un CTA menant à
 * l'inscription (goAuth). Une fois par session navigateur.
 */
export function logCtaClick() {
  try {
    if (typeof window === 'undefined') return;
    let already = false;
    try { already = !!sessionStorage.getItem(CTA_FLAG); } catch {}
    if (already) return;
    try { sessionStorage.setItem(CTA_FLAG, '1'); } catch {}
    const stored = readStore();
    if (!stored) return; // captureAttribution pas passée → rien à relier
    rpcLogEvent('cta_click', stored);
  } catch {}
}

/**
 * À appeler au SIGNED_IN (cf. useAuth) : rattache la provenance du
 * navigateur au compte. Server-side first-touch (ON CONFLICT DO
 * NOTHING) → un user existant qui se reconnecte ne réécrit rien ; le
 * guard localStorage évite juste des appels réseau répétés.
 */
export function claimAttribution(userId) {
  try {
    if (!userId || typeof window === 'undefined') return;
    let claimed = [];
    try {
      const raw = localStorage.getItem(CLAIM_KEY);
      claimed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(claimed)) claimed = [];
    } catch {}
    if (claimed.includes(userId)) return;

    const a = readStore();
    if (!a) return; // rien de mémorisé (localStorage indispo) → tant pis
    supabase
      .rpc('claim_attribution', {
        p_session_id: a.session_id,
        p_utm_source: a.utm_source || null,
        p_utm_medium: a.utm_medium || null,
        p_utm_campaign: a.utm_campaign || null,
        p_utm_content: a.utm_content || null,
        p_utm_term: a.utm_term || null,
        p_fbclid: !!a.fbclid,
        p_referrer: a.referrer || null,
        p_landing_path: a.landing_path || null,
        p_first_seen_at: a.first_seen_at || null,
      })
      .then(({ error }) => {
        if (error) {
          console.warn('[attribution] claim_attribution:', error.message);
          return;
        }
        try {
          // Cap à 50 ids, même rationale que trackPixelSignup.
          localStorage.setItem(CLAIM_KEY, JSON.stringify([...claimed, userId].slice(-50)));
        } catch {}
      });
  } catch {}
}
