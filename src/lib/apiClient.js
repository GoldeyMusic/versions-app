// lib/apiClient.js
//
// Wrapper authentifié autour de fetch() pour parler au backend Versions.
// Récupère le JWT Supabase courant et l'attache en `Authorization: Bearer …`.
//
// Usage :
//   import { apiFetch, apiFetchJson } from '../lib/apiClient';
//
//   // FormData / multipart : passe init normal, le helper ne touche pas Content-Type.
//   const res = await apiFetch('/api/analyze/start', { method: 'POST', body: formData });
//
//   // JSON : init.body peut être un objet, le helper sérialise + pose Content-Type.
//   const data = await apiFetchJson('/api/chat', { method: 'POST', body: { messages, … } });
//
// SÉCURITÉ : tous les appels au backend passent désormais le JWT. Le backend
// (requireAuth) vérifie le token et dérive l'identité du user — c'est lui
// qui détermine `userId` côté serveur, pas le client.

import API from '../constants/api';
import { supabase } from './supabase';

async function getAuthHeader() {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

/**
 * fetch authentifié. Renvoie la Response brute — à toi de gérer res.ok / .json().
 * @param {string} pathOrUrl  Chemin (ex. '/api/chat') ou URL absolue.
 * @param {RequestInit} [init]
 * @returns {Promise<Response>}
 */
export async function apiFetch(pathOrUrl, init = {}) {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${API}${pathOrUrl}`;
  const authHeaders = await getAuthHeader();
  const headers = { ...(init.headers || {}), ...authHeaders };
  return fetch(url, { ...init, headers });
}

/**
 * fetch authentifié + JSON in/out. Si init.body est un objet (pas FormData /
 * Blob / string), il est sérialisé en JSON et Content-Type est posé.
 * Lève si !res.ok (avec le payload d'erreur si parsable, sinon le statut).
 */
export async function apiFetchJson(pathOrUrl, init = {}) {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${API}${pathOrUrl}`;
  const authHeaders = await getAuthHeader();

  let { body, headers = {}, ...rest } = init;
  // Auto-sérialise les objets simples en JSON (sauf FormData / Blob / string).
  const isAlreadySerialized = body === undefined
    || body === null
    || typeof body === 'string'
    || (typeof FormData !== 'undefined' && body instanceof FormData)
    || (typeof Blob !== 'undefined' && body instanceof Blob)
    || (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer);
  if (!isAlreadySerialized && typeof body === 'object') {
    body = JSON.stringify(body);
    headers = { 'Content-Type': 'application/json', ...headers };
  }

  const res = await fetch(url, {
    ...rest,
    body,
    headers: { ...headers, ...authHeaders },
  });

  if (!res.ok) {
    let payload = null;
    try { payload = await res.json(); } catch { /* not JSON */ }
    const err = new Error(payload?.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }
  return res.json();
}
