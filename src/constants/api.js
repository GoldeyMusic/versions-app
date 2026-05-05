// URL du backend Versions.
//
// REVERT 2026-04-29 (nuit) : retour sur Railway après tentative migration
// Vercel échouée. Le pipeline d'analyse stocke le job state dans un `Map`
// JavaScript en RAM (`jobs` dans `_analyze.js`). Sur Railway (container
// long-running), toutes les requêtes hit le même process → ça marche.
// Sur Vercel serverless, chaque invocation est un Lambda potentiellement
// différent → POST /start crée le job dans Lambda A, GET /status hit
// Lambda B qui ne le connaît pas → 404 sur tous les polls.
//
// Pour migrer vraiment sur Vercel il faut d'abord déplacer le job state
// dans une table Supabase (`analysis_jobs`) lisible/écrivable par toutes
// les invocations. Plan détaillé : `docs/UPLOAD_DIRECT_PLAN.md`.
//
// 2026-05-05 : URL fournie via env (VITE_API_URL) pour faciliter la
// transition vers le nom versions-api une fois le service Railway renommé.
// Fallback sur l'URL historique decode-api-production tant que le rename
// Railway n'a pas eu lieu.
const API = import.meta.env.VITE_API_URL
  || 'https://decode-api-production.up.railway.app';

export default API;
