// URL du backend Versions (decode-api).
//
// 2026-04-29 (nuit) : retour sur Vercel après upgrade Supabase Pro et
// activation de l'upload direct navigateur → Supabase Storage. La limite
// ~4,5 Mo body de Vercel serverless n'est plus un blocage : le frontend
// fait un PUT signé direct sur Supabase puis n'envoie qu'un body JSON
// minuscule (storagePath + métadonnées) à `/api/analyze/start`.
//
// Conséquences :
// - Stack 100 % Vercel + Supabase Pro
// - Stripe Checkout opérationnel (env vars déjà sur Vercel)
// - Egress Supabase doublé pour les sources audio (entrée + sortie pour
//   traitement backend), large sous 250 Go inclus Pro à ce stade
// - Railway peut être coupé (économie ~$10/mois Hobby)
//
// Rollback d'urgence sur Railway : `decode-api-production.up.railway.app`
// (Railway garde le même code, en filet jusqu'à validation de la migration)
const API = "https://decode-kappa.vercel.app";

export default API;
