// URL du backend Versions (decode-api).
//
// REVERT 2026-04-29 (soir) : on retape sur Railway en attendant l'upload
// direct Supabase. Vercel serverless impose une limite ~4,5 Mo par body de
// requête, ce qui casse les uploads WAV (70 Mo possibles). Tant que la
// route navigateur→Supabase n'est pas branchée, on garde Railway qui n'a
// pas cette limite.
//
// Trade-off : Railway a TOUT le code récent (cap 12 min, Fadr Phase 3,
// Stripe Checkout, signed-url, etc.) car son auto-deploy suit le même repo
// `decode-api`. Le seul point qui ne marchera pas en pratique : le webhook
// Stripe pointe encore sur Vercel côté Dashboard Stripe — non bloquant tant
// que MONETIZATION_ENABLED=false. Pour le reste (analyse, Fadr, signed-url,
// cap), Railway et Vercel se comportent à l'identique — la seule vraie
// différence c'est la limite de body : Vercel ~4,5 Mo, Railway pas de cap.
//
// À refaire pointer sur Vercel (decode-kappa.vercel.app) DÈS que l'upload
// direct Supabase Storage sera en place dans LoadingScreen.
const API = "https://decode-api-production.up.railway.app";

export default API;
