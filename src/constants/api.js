// URL du backend Versions (decode-api).
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
// État actuel : upload direct câblé côté frontend, fonctionnel sur
// Railway aussi (même code backend). Le PUT signé navigateur→Supabase
// marche, le storagePath est bien transmis à `/analyze/start`. Seule
// l'archi de partage de state bloque le passage Vercel.
const API = "https://decode-api-production.up.railway.app";

export default API;
