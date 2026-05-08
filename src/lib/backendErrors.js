/**
 * backendErrors.js — traduction des codes d'erreur du backend versions-api
 * en strings i18n FR/EN.
 *
 * Pourquoi : avant ce mapper, quand une analyse échouait côté backend,
 * `_analyze.js` stockait `err.message` brut dans le champ `job.error` (ex.
 * "Storage download failed: ...", "Analysis API: timeout (120s)", "Fadr upload2: 503").
 * Le LoadingScreen le poll via /status, lit ce champ et l'affichait tel quel
 * à l'utilisateur — donc en anglais technique.
 *
 * Désormais le backend (lib/jobErrors.js) classifie les exceptions en codes
 * stables (analysis_failed, analysis_timeout, analysis_service_unavailable…)
 * et c'est ce mapper qui traduit côté front.
 *
 * Usage :
 *   import { translateBackendError } from '../lib/backendErrors';
 *   const { s } = useLang();
 *   ...
 *   throw new Error(translateBackendError(job.error, s));
 */

/**
 * Traduit un code d'erreur backend en string i18n.
 * @param {string|null|undefined} code  Le contenu de `job.error` ou `payload.error`.
 * @param {object} s  Le pack de strings courant (FR ou EN), via useLang().
 * @returns {string}  Un message localisé prêt à afficher.
 */
export function translateBackendError(code, s) {
  // Pas de code → fallback générique
  if (!code) return s.loading.errorFailed;

  const c = String(code).trim().toLowerCase();

  // Codes que le backend met dans job.error via classifyJobError()
  switch (c) {
    case 'analysis_timeout':
      return s.loading.errorAnalysisTimeout;
    case 'analysis_service_unavailable':
      return s.loading.errorAnalysisService;
    case 'analysis_storage_failed':
      return s.loading.errorAnalysisStorage;
    case 'analysis_parse_failed':
      return s.loading.errorAnalysisParse;
    case 'analysis_failed':
      return s.loading.errorFailed;

    // Codes HTTP métier (peuvent aussi remonter via apiFetchJson)
    case 'job_not_found':
      return s.loading.errorJobNotFound;
    case 'job_not_in_awaiting_intent':
      return s.loading.errorJobNotAwaiting;
    case 'no_credits':
      return s.loading.errorNoCredits;
    case 'audio_too_long':
      return s.loading.errorTooLongAudio.replace('{recv}', '');
    case 'rate_limited':
      // Pas de string spécifique côté loading ; on réutilise le générique auth.
      return s.auth?.errRateLimit || s.loading.errorFailed;

    default:
      // Si le code ressemble encore à du texte anglais brut (espaces, ponctuation),
      // on refuse de l'afficher — fallback générique. Ça protège contre les
      // anciennes versions du backend qui mettraient encore `err.message` brut
      // pendant la fenêtre de transition (avant redeploy versions-api).
      if (/[ .:!?'"()]/.test(c)) return s.loading.errorFailed;

      // Code inconnu mais d'allure code-like (snake_case sans espaces) :
      // on log mais on affiche le générique pour ne rien fuiter.
      console.warn('[backendErrors] code inconnu :', c);
      return s.loading.errorFailed;
  }
}
