/**
 * authErrors.js — traduction des erreurs Supabase Auth en strings i18n.
 *
 * Pourquoi : Supabase renvoie ses error.message en anglais par défaut
 * (ex. "Invalid login credentials", "New password should be different from the old password").
 * Pour des utilisateurs francophones, ces messages bruts sont perçus comme un bug.
 *
 * On matche d'abord error.code (stable, exposé par Supabase Auth ≥ v2.30 via AuthApiError),
 * puis on retombe sur error.message en regex pour les vieux SDK ou les codes non documentés.
 *
 * Usage :
 *   import { translateAuthError } from '../lib/authErrors';
 *   const { s } = useLang();
 *   ...
 *   if (error) setError(translateAuthError(error, s));
 *
 * Référence des codes Supabase Auth :
 *   https://supabase.com/docs/reference/javascript/auth-error-codes
 */

/**
 * @param {object|Error|null|undefined} error  L'erreur renvoyée par supabase.auth.*
 * @param {object} s  Le pack de strings courant (FR ou EN), via useLang().
 * @returns {string}  Un message localisé prêt à afficher.
 */
export function translateAuthError(error, s) {
  if (!error) return s.auth.errGeneric;

  const code = (error.code || error.error_code || '').toString().toLowerCase();
  const msg = (error.message || '').toString();
  const msgLow = msg.toLowerCase();

  // 1) Match par code (préféré — stable et indépendant de la langue Supabase)
  const byCode = {
    invalid_credentials: s.auth.errInvalidCredentials,
    same_password: s.auth.errSamePassword,
    weak_password: s.auth.errWeakPassword,
    user_already_exists: s.auth.errUserAlreadyRegistered,
    email_address_invalid: s.auth.errInvalidEmail,
    validation_failed: s.auth.errInvalidEmail,
    email_not_confirmed: s.auth.errEmailNotConfirmed,
    over_request_rate_limit: s.auth.errRateLimit,
    over_email_send_rate_limit: s.auth.errEmailRateLimit,
    otp_expired: s.auth.errOtpExpired,
    otp_disabled: s.auth.errOtpExpired,
    signup_disabled: s.auth.errSignupsDisabled,
    email_provider_disabled: s.auth.errSignupsDisabled,
  };
  if (code && byCode[code]) return byCode[code];

  // 2) Fallback : match par regex sur le message anglais
  if (/invalid login credentials/i.test(msg)) return s.auth.errInvalidCredentials;
  if (/different from the old/i.test(msg)) return s.auth.errSamePassword;
  if (/password should be at least/i.test(msg)) return s.auth.errWeakPassword;
  if (/user already registered|already been registered/i.test(msg)) return s.auth.errUserAlreadyRegistered;
  if (/email not confirmed/i.test(msg)) return s.auth.errEmailNotConfirmed;
  if (/invalid format|invalid email/i.test(msg)) return s.auth.errInvalidEmail;
  if (/rate limit.*email|email.*rate limit/i.test(msg)) return s.auth.errEmailRateLimit;
  if (/for security purposes.*after|rate limit|too many requests/i.test(msg)) return s.auth.errRateLimit;
  if (/(otp|token|link).*(expired|invalid)/i.test(msg)) return s.auth.errOtpExpired;
  if (/signups not allowed|signup.* disabled/i.test(msg)) return s.auth.errSignupsDisabled;

  // 3) Erreurs réseau / fetch
  if (
    msgLow.includes('failed to fetch') ||
    msgLow.includes('networkerror') ||
    msgLow.includes('network request failed') ||
    error.name === 'TypeError'
  ) {
    return s.auth.errNetwork;
  }

  // 4) Aucun match : message générique (jamais l'anglais Supabase brut)
  return s.auth.errGeneric;
}
