/**
 * Helpers Meta Pixel (window.fbq).
 *
 * Le snippet pixel est chargé en synchrone dans index.html, donc window.fbq
 * est généralement défini quand ces helpers sont appelés. Mais on tolère
 * l'absence de fbq (dev local sans pixel, adblock qui bloque facebook.net,
 * échec réseau) en no-op silencieux — JAMAIS de throw, on ne casse pas
 * l'app pour un event de tracking qui passe pas.
 *
 * Pixel ID exposé côté client : c'est la valeur publique du `fbq('init', ID)`
 * dans le snippet, lisible par n'importe qui via les sources de la page.
 * Pas un secret — pas de raison de le passer en variable d'env.
 */

function safeFbq(...args) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try { window.fbq(...args); } catch {}
  }
}

/** PageView standard. Tiré à chaque navigation SPA (history pushState/popstate). */
export function trackPixelPageView() {
  safeFbq('track', 'PageView');
}

/**
 * CompleteRegistration : signup utilisateur réussi.
 * Idempotent par user.id via localStorage — ne re-tire pas l'event quand
 * l'utilisateur se reconnecte (chaque SIGNED_IN passe par useAuth, mais on
 * ne veut comptabiliser que la création initiale du compte).
 */
export function trackPixelSignup(userId) {
  if (!userId) return;
  const KEY = 'versions_pixel_signup_fired';
  try {
    const raw = localStorage.getItem(KEY);
    const fired = raw ? JSON.parse(raw) : [];
    if (Array.isArray(fired) && fired.includes(userId)) return;
    safeFbq('track', 'CompleteRegistration');
    const next = Array.isArray(fired) ? [...fired, userId] : [userId];
    // Cap à 50 ids : un Mac partagé entre comptes ne fait pas grossir le storage.
    localStorage.setItem(KEY, JSON.stringify(next.slice(-50)));
  } catch {
    // localStorage indispo (Safari mode privé ancien) → fallback : fire quand
    // même. Pire cas : l'event part 2 fois sur un même navigateur, acceptable.
    safeFbq('track', 'CompleteRegistration');
  }
}

/**
 * Custom event LaunchAnalysis : tiré quand l'utilisateur lance une nouvelle
 * analyse (handleAnalyze dans App.jsx). Pas un event standard Meta, mais
 * indexé automatiquement et exploitable comme audience custom + comme
 * objectif d'optimisation Conversions une fois ~50 occurrences cumulées.
 *
 * NOTE : on tire l'event sur CHAQUE analyse (pas seulement la 1ère), parce
 * que c'est l'action de valeur côté business — une réinscription d'analyse
 * compte autant qu'une première.
 */
export function trackPixelAnalysisStarted() {
  safeFbq('trackCustom', 'LaunchAnalysis');
}
