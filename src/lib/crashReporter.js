/**
 * lib/crashReporter.js — télémétrie d'erreurs front minimale.
 *
 * Contexte (2026-07-21) : un utilisateur (Windows/Edge) voit des pages
 * blanches sur versions.studio sans qu'on puisse diagnostiquer à distance
 * (pas de Sentry, pas de logs client). Ce module capture les erreurs JS
 * globales (window.onerror + unhandledrejection + crashs React via
 * l'ErrorBoundary de main.jsx) et les POST sur
 * `${API}/api/client-error` → Railway logs + table Supabase
 * `client_errors` + notif ops throttlée.
 *
 * Garde-fous :
 *   - max 3 rapports par chargement de page (pas de spam en boucle) ;
 *   - dédup par message (une même erreur répétée ne part qu'une fois) ;
 *   - tout échec du reporter est avalé silencieusement (jamais de crash
 *     causé par le rapporteur de crash) ;
 *   - payload plafonné (message 500 chars, stack 3000) ;
 *   - filtre de bruit tiers (cf. isNoise ci-dessous).
 */

import API_URL from '../constants/api';

const MAX_REPORTS = 3;
let sent = 0;
const seen = new Set();

/* ---------------------------------------------------------------------
 * Filtre de bruit tiers (2026-08-18)
 *
 * Depuis le lancement des pubs Instagram, le gros du trafic landing
 * arrive via le navigateur in-app Meta (Android WebView, UA `IABMV/1`).
 * Ce navigateur injecte SES PROPRES scripts dans la page — visibles dans
 * la stack sous `iabjs://navigation_performance_logger_android`. Quand
 * l'utilisateur swipe pour fermer la webview, le pont JS↔Java est détruit
 * avant que le logger Meta ait fini son `postMessage` :
 *     Uncaught Error: Error invoking postMessage: Java object is gone
 * C'est du bruit pur : le code vient de Meta, pas de Versions, et zéro
 * utilisateur n'est impacté (la page se ferme, c'est tout). Sans filtre
 * ça déclenche une notif ops par heure (throttle backend) sur du vide.
 *
 * Même logique pour les extensions navigateur et les erreurs cross-origin
 * anonymisées ("Script error.") qui n'apportent aucune info exploitable.
 *
 * On ne coupe PAS tout le trafic in-app : un vrai crash de notre bundle
 * dans la webview Instagram a une stack qui pointe nos assets et remonte
 * normalement.
 * ------------------------------------------------------------------- */
const NOISE_MESSAGES = [
  /java object is gone/i,            // pont JS↔Java WebView détruit
  /error invoking postmessage/i,     // idem, formulation Meta
  /^(uncaught )?script error\.?$/i,  // cross-origin, aucune info
  /resizeobserver loop/i,            // bruit navigateur classique, inoffensif
  /instantsearchsdkjsbridge/i,       // navigateur in-app Bing / Edge
  /vue is not defined|ucbrowser/i,   // navigateurs in-app exotiques
];

const NOISE_STACK = [
  /iabjs:\/\//i,                     // in-app browser Instagram / Facebook
  /fbjs:\/\//i,
  /navigation_performance_logger/i,
  /chrome-extension:\/\//i,          // extensions navigateur
  /moz-extension:\/\//i,
  /safari-(web-)?extension:\/\//i,
  /webkit-masked-url:/i,             // script injecté (extension Safari / WKUserScript)
  /anonymous scripts?/i,
];

function isNoise(message, stack) {
  const m = String(message || '');
  const s = String(stack || '');
  if (NOISE_MESSAGES.some((re) => re.test(m))) return true;
  if (NOISE_STACK.some((re) => re.test(s))) return true;
  return false;
}

// user_id / email best-effort depuis le token Supabase en localStorage
// (pas d'import du client supabase ici : le reporter doit fonctionner
// même si l'init du client est précisément ce qui a crashé).
function readAuthInfo() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) {
        const raw = JSON.parse(localStorage.getItem(k));
        const u = raw?.user || raw?.currentSession?.user || null;
        if (u) return { userId: u.id || null, email: u.email || null };
      }
    }
  } catch { /* silencieux */ }
  return { userId: null, email: null };
}

export function reportClientError(message, stack, source) {
  try {
    // Bruit tiers filtré AVANT le compteur : un crash in-app Meta ne doit
    // pas consommer un des 3 slots de rapport de la page.
    if (isNoise(message, stack)) return;
    const msg = String(message || 'unknown').slice(0, 500);
    if (sent >= MAX_REPORTS || seen.has(msg)) return;
    sent += 1;
    seen.add(msg);
    const { userId, email } = readAuthInfo();
    const payload = {
      message: msg,
      stack: String(stack || '').slice(0, 3000),
      source: String(source || 'window'),
      path: window.location.pathname + window.location.search,
      ua: navigator.userAgent,
      userId,
      email,
      ts: new Date().toISOString(),
    };
    // fetch keepalive : part même si la page se ferme juste après.
    fetch(`${API_URL}/api/client-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch { /* jamais de throw depuis le reporter */ }
}

export function installCrashReporter() {
  try {
    window.addEventListener('error', (e) => {
      // e.error peut être null (erreurs de ressources) — on ne rapporte
      // que les vraies erreurs JS, pas les <img> 404.
      if (!e || (!e.error && !e.message)) return;
      reportClientError(e.message, e.error?.stack, 'window.onerror');
    });
    window.addEventListener('unhandledrejection', (e) => {
      const r = e?.reason;
      reportClientError(r?.message || String(r), r?.stack, 'unhandledrejection');
    });
  } catch { /* silencieux */ }
}
