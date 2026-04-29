// URL du backend Versions (decode-api).
//
// REVERT 2026-04-29 (soir) : on retape sur Railway en attendant l'upload
// direct Supabase. Vercel serverless impose une limite ~4,5 Mo par body de
// requête, ce qui casse les uploads WAV (70 Mo possibles). Tant que la
// route navigateur→Supabase n'est pas branchée, on garde Railway qui n'a
// pas cette limite.
//
// Trade-off : on perd le backend Stripe (`/api/billing/checkout`, webhook)
// et le cap 12 min côté serveur. Pas bloquant : MONETIZATION_ENABLED=false
// et le cap est aussi enforced côté front (AddModal.jsx).
//
// À refaire pointer sur Vercel (decode-kappa.vercel.app) DÈS que l'upload
// direct Supabase Storage sera en place dans LoadingScreen.
const API = "https://decode-api-production.up.railway.app";

export default API;
