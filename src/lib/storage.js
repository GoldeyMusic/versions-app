/**
 * Persistence layer for Versions — stores tracks & analysis results in Supabase.
 * All functions are async. Row-Level Security ensures users only see their own data.
 *
 * Tables:
 *  tracks(id uuid pk, user_id uuid, title text, created_at timestamptz)
 *  versions(id uuid pk, track_id uuid, name text, date text, bpm text, key text,
 *           lufs text, is_main bool, analysis_result jsonb, created_at timestamptz)
 */

import { supabase } from './supabase';

function formatDate(d = new Date()) {
  const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** Load all tracks (with their versions) for the current user */
export async function loadTracks() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: tracks, error } = await supabase
    .from('tracks')
    .select('id, title, project_id, vocal_type, created_at, versions(id, name, date, bpm, key, lufs, is_main, analysis_result, storage_path, created_at)')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[storage] loadTracks error:', error.message);
    return [];
  }

  // Normalize field name is_main → main for frontend consistency
  return (tracks || []).map(t => ({
    id: t.id,
    title: t.title,
    projectId: t.project_id,
    vocalType: t.vocal_type || 'vocal',
    createdAt: t.created_at,
    versions: (t.versions || [])
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map(v => ({
        id: v.id,
        name: v.name,
        date: v.date,
        createdAt: v.created_at,
        bpm: v.bpm,
        key: v.key,
        lufs: v.lufs,
        main: v.is_main,
        analysisResult: v.analysis_result,
        storagePath: v.storage_path,
      })),
  }));
}

/**
 * Save an analysis. Finds or creates track by title (case-insensitive),
 * then inserts or updates the version.
 *
 * `analysisLocale` (optionnel) : langue dans laquelle l'IA a généré la fiche
 * et l'écoute. Persisté dans versions.analysis_locale pour que le helper
 * loadVersionLocalized puisse décider s'il doit traduire.
 */
export async function saveAnalysis(config, analysisResult, storagePath = null, analysisLocale = null) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn('[storage] saveAnalysis: no user');
    return null;
  }

  const title = (config?.title || analysisResult?.meta?.title || 'Sans titre').trim();
  const versionName = (config?.version || 'v1').trim();

  // Resolve target project : explicit via config, or user's default
  const projectId = config?.projectId || await getOrCreateDefaultProjectId(user.id);
  if (!projectId) {
    console.warn('[storage] saveAnalysis: could not resolve a project');
    return null;
  }

  // Find existing track in the same project (case-insensitive title)
  const { data: existingTracks } = await supabase
    .from('tracks')
    .select('id, title, vocal_type')
    .eq('project_id', projectId)
    .ilike('title', title);

  let track = existingTracks?.find(t => t.title.toLowerCase() === title.toLowerCase());

  if (!track) {
    // Append at the end of the project
    const { data: last } = await supabase
      .from('tracks')
      .select('position_in_project')
      .eq('project_id', projectId)
      .order('position_in_project', { ascending: false })
      .limit(1);
    const nextPos = (last?.[0]?.position_in_project ?? -1) + 1;

    // vocal_type : piloté par le flow d'import pour un nouveau titre.
    // Valeurs autorisées : 'vocal' | 'instrumental_pending' | 'instrumental_final'.
    // Pour un titre existant, on ne touche à rien (déjà défini à la création).
    const allowedVocalTypes = ['vocal', 'instrumental_pending', 'instrumental_final'];
    const vocalType = allowedVocalTypes.includes(config?.vocalType) ? config.vocalType : 'vocal';

    const { data: newTrack, error: insertErr } = await supabase
      .from('tracks')
      .insert({
        user_id: user.id,
        title,
        project_id: projectId,
        position_in_project: nextPos,
        vocal_type: vocalType,
      })
      .select()
      .single();
    if (insertErr) {
      console.warn('[storage] track insert error:', insertErr.message);
      return null;
    }
    track = newTrack;
  }

  // Check if version with same name exists for this track
  const { data: existingVersions } = await supabase
    .from('versions')
    .select('id, name, is_main')
    .eq('track_id', track.id);

  const existing = existingVersions?.find(v => v.name.toLowerCase() === versionName.toLowerCase());

  // The newly uploaded version always becomes the main one:
  // first, unset is_main on every version of this track.
  await supabase.from('versions').update({ is_main: false }).eq('track_id', track.id);

  const finalStoragePath = storagePath || analysisResult?.storagePath || null;
  const localeToPersist = (analysisLocale || 'fr').toString().toLowerCase().slice(0, 2);

  if (existing) {
    const updatePayload = {
      date: formatDate(),
      is_main: true,
      analysis_result: analysisResult,
      analysis_locale: localeToPersist,
      // Nouvelle analyse = les anciennes traductions cachées sont obsolètes.
      analysis_translations: {},
      audio_hash: config?.audioHash || analysisResult?.audioHash || null,
    };
    if (finalStoragePath) updatePayload.storage_path = finalStoragePath;
    const { error } = await supabase
      .from('versions')
      .update(updatePayload)
      .eq('id', existing.id);
    if (error) console.warn('[storage] version update error:', error.message);
    // Fire-and-forget : pré-traduit vers la langue opposée pour que la bascule
    // de langue soit instantanée la prochaine fois. Ne bloque pas le retour.
    prewarmTranslation(existing.id, localeToPersist);
    return { trackId: track.id, versionId: existing.id };
  } else {
    const { data: newVer, error } = await supabase
      .from('versions')
      .insert({
        track_id: track.id,
        name: versionName,
        date: formatDate(),
        is_main: true,
        analysis_result: analysisResult,
        analysis_locale: localeToPersist,
        audio_hash: config?.audioHash || analysisResult?.audioHash || null,
        storage_path: finalStoragePath,
      })
      .select()
      .single();
    if (error) {
      console.warn('[storage] version insert error:', error.message);
      return null;
    }
    // Fire-and-forget : idem, pour la nouvelle version.
    prewarmTranslation(newVer.id, localeToPersist);
    return { trackId: track.id, versionId: newVer.id };
  }
}

/**
 * Pré-traduit une version vers la langue opposée et écrit le cache.
 * Fire & forget : appelé après saveAnalysis pour que l'utilisateur puisse
 * basculer de langue instantanément la prochaine fois.
 *
 * Coût : ~1 appel Haiku supplémentaire par analyse (~$0.001), négligeable.
 * Bénéfice : bascule instantanée FR ↔ EN au lieu de 10-15s d'attente.
 */
async function prewarmTranslation(versionId, sourceLocale) {
  if (!versionId) return;
  const source = (sourceLocale || 'fr').toString().toLowerCase().slice(0, 2);
  const target = source === 'fr' ? 'en' : 'fr';
  try {
    const { data, error } = await supabase
      .from('versions')
      .select('analysis_result, analysis_translations')
      .eq('id', versionId)
      .single();
    if (error || !data?.analysis_result) return;
    // Déjà en cache → rien à faire
    if (data.analysis_translations && data.analysis_translations[target]) return;

    const translated = await translateAnalysisResult(data.analysis_result, source, target);
    if (!translated) return;

    // Ne cache que si la traduction est complète (évite de cacher un résultat partiel)
    const original = data.analysis_result;
    const ficheOk = !original.fiche || translated.fiche !== original.fiche;
    const listeningOk = !original.listening || translated.listening !== original.listening;
    if (!ficheOk || !listeningOk) {
      console.warn('[storage] prewarm partial, cache NON écrit');
      return;
    }

    const newCache = { ...(data.analysis_translations || {}), [target]: translated };
    const { error: werr } = await supabase
      .from('versions')
      .update({ analysis_translations: newCache })
      .eq('id', versionId);
    if (werr) console.warn('[storage] prewarm write failed:', werr.message);
    else console.log(`[storage] prewarm ${source}→${target} cached for ${versionId}`);
  } catch (e) {
    console.warn('[storage] prewarm failed:', e.message);
  }
}

/** Get a specific version's analysis result */
export async function getAnalysis(trackId, versionId) {
  const { data, error } = await supabase
    .from('versions')
    .select('analysis_result')
    .eq('id', versionId)
    .single();
  if (error) {
    console.warn('[storage] getAnalysis error:', error.message);
    return null;
  }
  return data?.analysis_result || null;
}

/**
 * Retourne l'analysisResult d'une version dans la langue demandée.
 *  - Si la langue demandée = langue d'origine → renvoie l'objet original
 *  - Sinon, check le cache analysis_translations[userLocale]
 *  - Sinon, appelle /api/translate (fiche + listening), persiste le cache,
 *    et retourne l'objet traduit.
 *
 * Si quoi que ce soit échoue, fallback sur l'objet original.
 */
export async function loadVersionLocalized(versionId, userLocale) {
  if (!versionId || versionId === '__pending_v__' || versionId === '__pending__') return null;
  const target = (userLocale || 'fr').toString().toLowerCase().slice(0, 2);

  const { data, error } = await supabase
    .from('versions')
    .select('analysis_result, analysis_locale, analysis_translations')
    .eq('id', versionId)
    .single();
  if (error || !data) {
    console.warn('[storage] loadVersionLocalized read error:', error?.message);
    return null;
  }

  const original = data.analysis_result || null;
  if (!original) return null;

  const source = (data.analysis_locale || 'fr').toString().toLowerCase().slice(0, 2);
  // Cas 1 : langue identique → on sert l'original
  if (source === target) return original;

  // Cas 2 : cache existant
  const cache = data.analysis_translations || {};
  if (cache[target]) return cache[target];

  // Cas 3 : cache miss → traduction à la volée
  const API = (await import('../constants/api')).default;
  const callTranslate = async (type, content) => {
    if (!content || typeof content !== 'object') return null;
    try {
      const r = await fetch(`${API}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content, targetLocale: target, sourceLocale: source }),
      });
      if (!r.ok) throw new Error(`translate ${type}: ${r.status}`);
      const j = await r.json();
      return j?.translated || null;
    } catch (e) {
      console.warn('[storage] translate fallback (original):', e.message);
      return null;
    }
  };

  const [ficheT, listeningT] = await Promise.all([
    callTranslate('fiche', original.fiche),
    callTranslate('listening', original.listening),
  ]);

  // Construction du résultat : on préserve les champs non-textuels (storagePath, _stage…)
  const translated = { ...original };
  if (ficheT) translated.fiche = ficheT;
  if (listeningT) translated.listening = listeningT;

  // On ne cache que si TOUT ce qui devait être traduit l'a été.
  // Sinon on retournerait le résultat partiel mais on re-tentera la prochaine fois.
  const ficheOk = !original.fiche || !!ficheT;
  const listeningOk = !original.listening || !!listeningT;
  const fullyTranslated = ficheOk && listeningOk;

  if (fullyTranslated) {
    const newCache = { ...cache, [target]: translated };
    supabase.from('versions')
      .update({ analysis_translations: newCache })
      .eq('id', versionId)
      .then(({ error: werr }) => { if (werr) console.warn('[storage] translations cache write failed:', werr.message); });
  } else {
    console.warn('[storage] translation partielle → cache NON écrit, retry possible au prochain affichage');
  }

  return translated;
}

/**
 * Sauvegarde les notes perso d'une version dans analysis_result.userNotes.
 * Fait un read-modify-write (2 round-trips) parce qu'on n'a pas d'accès RPC jsonb_set côté client.
 * Appelé en debounce depuis la fiche.
 */
export async function saveVersionNotes(versionId, notes) {
  if (!versionId || versionId === '__pending_v__' || versionId === '__pending__') return;
  const { data, error: readErr } = await supabase
    .from('versions')
    .select('analysis_result')
    .eq('id', versionId)
    .single();
  if (readErr) {
    console.warn('[storage] saveVersionNotes read error:', readErr.message);
    return;
  }
  const next = { ...(data?.analysis_result || {}), userNotes: notes || '' };
  const { error: writeErr } = await supabase
    .from('versions')
    .update({ analysis_result: next })
    .eq('id', versionId);
  if (writeErr) console.warn('[storage] saveVersionNotes write error:', writeErr.message);
}

// ── Historique de chat par version ─────────────────────────
// Stocké dans la colonne dédiée `versions.chat_history` (jsonb).
// Pas dans `analysis_result` pour que la fiche publique ne l'expose pas
// (la RPC get_public_fiche ne lit que analysis_result).

/**
 * Lit l'historique du chat d'une version.
 * Retourne un tableau de messages { role, content } — ou [] si pas de chat
 * / version non encore persistée / erreur RLS.
 */
export async function loadChatHistory(versionId) {
  if (!versionId || versionId === '__pending_v__' || versionId === '__pending__') return [];
  const { data, error } = await supabase
    .from('versions')
    .select('chat_history')
    .eq('id', versionId)
    .single();
  if (error) {
    console.warn('[storage] loadChatHistory error:', error.message);
    return [];
  }
  return Array.isArray(data?.chat_history) ? data.chat_history : [];
}

/**
 * Réécrit tout l'historique du chat d'une version.
 * Simple full-replace : on écrit le tableau complet à chaque échange —
 * trafic négligeable pour un chat (quelques Ko par save). Fire-and-forget.
 */
export async function saveChatHistory(versionId, messages) {
  if (!versionId || versionId === '__pending_v__' || versionId === '__pending__') return;
  const safe = Array.isArray(messages) ? messages : [];
  const { error } = await supabase
    .from('versions')
    .update({ chat_history: safe })
    .eq('id', versionId);
  if (error) console.warn('[storage] saveChatHistory error:', error.message);
}

// ── Lien public (lecture seule) ────────────────────────────
// Génère un token 128 bits base64url. Utilisé pour les liens partageables.
// On reste côté client : pas besoin de faire un round-trip pour créer un
// token, et le token n'a de valeur qu'une fois écrit en DB (RLS + RPC
// SECURITY DEFINER côté back).
function generateShareToken() {
  const arr = new Uint8Array(16);
  (globalThis.crypto || window.crypto).getRandomValues(arr);
  let bin = '';
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/** Récupère le token existant d'une version (ou null). */
export async function getPublicShareToken(versionId) {
  if (!versionId || versionId === '__pending_v__' || versionId === '__pending__') return null;
  const { data, error } = await supabase
    .from('versions')
    .select('public_share_token')
    .eq('id', versionId)
    .single();
  if (error) { console.warn('[storage] getPublicShareToken error:', error.message); return null; }
  return data?.public_share_token || null;
}

/** Active le partage public pour une version. Retourne le token (existant ou nouvellement créé). */
export async function enablePublicShare(versionId) {
  if (!versionId || versionId === '__pending_v__' || versionId === '__pending__') return null;
  const existing = await getPublicShareToken(versionId);
  if (existing) return existing;
  const token = generateShareToken();
  const { error } = await supabase
    .from('versions')
    .update({ public_share_token: token })
    .eq('id', versionId);
  if (error) { console.warn('[storage] enablePublicShare error:', error.message); return null; }
  return token;
}

/** Désactive le partage public (token → null). */
export async function disablePublicShare(versionId) {
  if (!versionId || versionId === '__pending_v__' || versionId === '__pending__') return;
  const { error } = await supabase
    .from('versions')
    .update({ public_share_token: null })
    .eq('id', versionId);
  if (error) console.warn('[storage] disablePublicShare error:', error.message);
}

/** Récupère la fiche partagée pour un token. Accessible en anonyme via la RPC. */
export async function fetchPublicFiche(token) {
  if (!token) return null;
  const { data, error } = await supabase.rpc('get_public_fiche', { p_token: token });
  if (error) { console.warn('[storage] fetchPublicFiche error:', error.message); return null; }
  if (!data) return null;
  // data = { track_title, version_name, created_at, analysis_result, vocal_type,
  //          analysis_locale, analysis_translations }
  // analysis_locale / analysis_translations : ajoutés par la migration i18n
  // (par défaut 'fr' et {} pour les anciennes fiches).
  return {
    trackTitle: data.track_title || '',
    versionName: data.version_name || '',
    createdAt: data.created_at || null,
    analysisResult: data.analysis_result || null,
    vocalType: data.vocal_type || 'vocal',
    analysisLocale: (data.analysis_locale || 'fr').toString().toLowerCase().slice(0, 2),
    analysisTranslations: data.analysis_translations || {},
  };
}

/**
 * Traduit un analysisResult (fiche + écoute) vers `target` en utilisant
 * /api/translate. Pas d'écriture en DB (utile pour les visiteurs anonymes
 * qui ne peuvent pas updater le cache côté owner).
 */
export async function translateAnalysisResult(analysisResult, sourceLocale, targetLocale) {
  if (!analysisResult) return null;
  const source = (sourceLocale || 'fr').toString().toLowerCase().slice(0, 2);
  const target = (targetLocale || 'fr').toString().toLowerCase().slice(0, 2);
  if (source === target) return analysisResult;
  const API = (await import('../constants/api')).default;
  const callTranslate = async (type, content) => {
    if (!content || typeof content !== 'object') return null;
    try {
      const r = await fetch(`${API}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content, targetLocale: target, sourceLocale: source }),
      });
      if (!r.ok) throw new Error(`translate ${type}: ${r.status}`);
      const j = await r.json();
      return j?.translated || null;
    } catch (e) {
      console.warn('[storage] translate fallback (original):', e.message);
      return null;
    }
  };
  const [ficheT, listeningT] = await Promise.all([
    callTranslate('fiche', analysisResult.fiche),
    callTranslate('listening', analysisResult.listening),
  ]);
  const translated = { ...analysisResult };
  if (ficheT) translated.fiche = ficheT;
  if (listeningT) translated.listening = listeningT;
  return translated;
}

/** Delete a version. If last one, delete the track too. Also removes audio from Storage. */
export async function deleteVersion(trackId, versionId) {
  // Récupère le storage_path AVANT de supprimer la row
  const { data: ver } = await supabase.from('versions').select('storage_path').eq('id', versionId).single();
  if (ver?.storage_path) {
    await supabase.storage.from('audio').remove([ver.storage_path]).catch((e) => console.warn('[storage] audio remove error:', e.message));
  }

  const { error } = await supabase.from('versions').delete().eq('id', versionId);
  if (error) console.warn('[storage] delete version error:', error.message);

  // Check remaining versions
  const { data: remaining } = await supabase
    .from('versions')
    .select('id, is_main')
    .eq('track_id', trackId);

  if (!remaining || remaining.length === 0) {
    await supabase.from('tracks').delete().eq('id', trackId);
  } else if (!remaining.some(v => v.is_main)) {
    // Promote first remaining as main
    await supabase.from('versions').update({ is_main: true }).eq('id', remaining[0].id);
  }

  return loadTracks();
}

/** Rename a version */
export async function renameVersion(trackId, versionId, newName) {
  await supabase.from('versions').update({ name: newName.trim() }).eq('id', versionId);
  return loadTracks();
}

/** Rename a track */
export async function renameTrack(trackId, newTitle) {
  await supabase.from('tracks').update({ title: newTitle.trim() }).eq('id', trackId);
  return loadTracks();
}

/**
 * Change le type vocal d'un titre existant (étape 5 de la feature vocal-type).
 * Accepte 'vocal', 'instrumental_pending', 'instrumental_final'. Retourne la
 * nouvelle liste de tracks pour mettre à jour l'état immédiatement.
 */
export async function updateTrackVocalType(trackId, newVocalType) {
  const allowed = ['vocal', 'instrumental_pending', 'instrumental_final'];
  if (!allowed.includes(newVocalType)) {
    console.warn('[storage] updateTrackVocalType: invalid type', newVocalType);
    return loadTracks();
  }
  const { error } = await supabase
    .from('tracks')
    .update({ vocal_type: newVocalType })
    .eq('id', trackId);
  if (error) console.warn('[storage] updateTrackVocalType error:', error.message);
  return loadTracks();
}

/** Set a version as main, unset others in the same track */
export async function setMainVersion(trackId, versionId) {
  await supabase.from('versions').update({ is_main: false }).eq('track_id', trackId);
  await supabase.from('versions').update({ is_main: true }).eq('id', versionId);
  return loadTracks();
}

/**
 * Reorder versions — we don't have a position column, so this is a no-op
 * at the DB level. Loading uses is_main-first + created_at desc.
 * For now we just reload to keep UI consistent. If ordering matters beyond
 * "main first", add a `position int` column later.
 */
export async function reorderVersions(trackId, fromIdx, toIdx) {
  return loadTracks();
}

/** Placeholder kept for API compatibility */
export function saveTracks() {
  // Supabase handles persistence; this export exists only to avoid
  // breaking imports in older code paths.
}

/** Save custom track order (array of track IDs) to localStorage */
export function saveTrackOrder(orderedIds) {
  try { localStorage.setItem('versions_track_order', JSON.stringify(orderedIds)); } catch {}
}

/** Load custom track order from localStorage */
export function getTrackOrder() {
  try {
    const raw = localStorage.getItem('versions_track_order');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** Apply custom order to tracks array. Tracks not in the order go at the end. */
export function applyTrackOrder(tracks) {
  const order = getTrackOrder();
  if (!order || !order.length) return tracks;
  const map = new Map(tracks.map(t => [t.id, t]));
  const ordered = [];
  for (const id of order) {
    const t = map.get(id);
    if (t) { ordered.push(t); map.delete(id); }
  }
  // Append any tracks not in saved order (new tracks)
  for (const t of map.values()) ordered.push(t);
  return ordered;
}

/** Delete a track, all its versions, and their audio files from Storage */
export async function deleteTrack(trackId) {
  // Récupère tous les storage_path AVANT de supprimer
  const { data: versions } = await supabase.from('versions').select('storage_path').eq('track_id', trackId);
  const paths = (versions || []).map(v => v.storage_path).filter(Boolean);
  if (paths.length > 0) {
    await supabase.storage.from('audio').remove(paths).catch((e) => console.warn('[storage] audio remove error:', e.message));
  }

  await supabase.from('versions').delete().eq('track_id', trackId);
  const { error } = await supabase.from('tracks').delete().eq('id', trackId);
  if (error) console.warn('[storage] deleteTrack error:', error.message);
  return loadTracks();
}

/** SHA-256 du fichier audio (Web Crypto), en hex minuscule. */
export async function hashAudioFile(file) {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Cherche un fichier audio identique déjà uploadé pour ce titre. */
export async function findDuplicateAudio(title, audioHash) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: tracks } = await supabase
    .from('tracks')
    .select('id, title')
    .eq('user_id', user.id)
    .ilike('title', title);
  const track = tracks?.find(t => t.title.toLowerCase() === title.toLowerCase());
  if (!track) return null;
  const { data: versions } = await supabase
    .from('versions')
    .select('id, name')
    .eq('track_id', track.id)
    .eq('audio_hash', audioHash)
    .limit(1);
  return versions?.[0] || null;
}

/** Compare two versions (A = older, B = newer). Returns {resume, progres, regressions, inchanges}.
 * Caches results in the `comparisons` table keyed by (trackId, vA, vB).
 *
 * Multi-langues : le `result` persisté est l'original (dans result_locale).
 * Les autres langues sont cachées dans result_translations.
 */
export async function getOrCreateComparison(trackId, versionA, versionB, locale) {
  if (!trackId || !versionA?.id || !versionB?.id) throw new Error('trackId + 2 versions requis');
  const target = (locale || 'fr').toString().toLowerCase().slice(0, 2);

  // Lookup cache
  const { data: cached } = await supabase
    .from('comparisons')
    .select('result, result_locale, result_translations')
    .eq('track_id', trackId)
    .eq('version_a_id', versionA.id)
    .eq('version_b_id', versionB.id)
    .maybeSingle();

  if (cached?.result) {
    const source = (cached.result_locale || 'fr').toString().toLowerCase().slice(0, 2);
    // Même langue que l'origine → sert le résultat original
    if (source === target) return cached.result;
    // Cache hit dans la langue cible
    const trCache = cached.result_translations || {};
    if (trCache[target]) return trCache[target];

    // Cache miss : on traduit à la demande
    const API = (await import('../constants/api')).default;
    try {
      const r = await fetch(`${API}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'comparison', content: cached.result, targetLocale: target, sourceLocale: source }),
      });
      if (!r.ok) throw new Error(`translate compare: ${r.status}`);
      const j = await r.json();
      const translated = j?.translated;
      if (!translated) throw new Error('translate compare: empty result');

      const newCache = { ...trCache, [target]: translated };
      supabase.from('comparisons')
        .update({ result_translations: newCache })
        .eq('track_id', trackId)
        .eq('version_a_id', versionA.id)
        .eq('version_b_id', versionB.id)
        .then(({ error }) => { if (error) console.warn('[compare] translations cache write failed:', error.message); });

      return translated;
    } catch (e) {
      console.warn('[compare] translate fallback (original):', e.message);
      return cached.result; // fallback : on sert l'original même si langue ≠
    }
  }

  // Pas de cache du tout : on génère un compare neuf dans la langue demandée.
  const ficheA = versionA.analysisResult?.fiche || versionA.analysisResult || null;
  const ficheB = versionB.analysisResult?.fiche || versionB.analysisResult || null;
  if (!ficheA || !ficheB) {
    const err = new Error('Les deux versions doivent avoir une fiche analysée');
    err.code = 'COMPARE_NEEDS_FICHES';
    throw err;
  }

  const API = (await import('../constants/api')).default;
  const resp = await fetch(`${API}/api/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ficheA, ficheB, nameA: versionA.name, nameB: versionB.name, locale: target }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Compare API error: ${err}`);
  }
  const result = await resp.json();

  // Save cache (fire and forget — not critical)
  supabase.from('comparisons').insert({
    track_id: trackId,
    version_a_id: versionA.id,
    version_b_id: versionB.id,
    result,
    result_locale: target,
  }).then(({ error }) => { if (error) console.warn('[compare] cache save failed:', error.message); });

  return result;
}

// =============================================================
// PROJECTS (Phase 2)
// =============================================================

/**
 * Return the user's default project id (first by position, then by created_at).
 * If the user has zero projects, create "Mon premier projet" and return its id.
 */
async function getOrCreateDefaultProjectId(userId) {
  const { data: existing } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', userId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(1);
  if (existing?.[0]) return existing[0].id;

  const { data: created, error } = await supabase
    .from('projects')
    .insert({ user_id: userId, name: 'Mon premier projet', cover_gradient: 0, position: 0 })
    .select('id')
    .single();
  if (error) {
    console.warn('[storage] getOrCreateDefaultProjectId error:', error.message);
    return null;
  }
  return created.id;
}

/** Load all projects for the current user, with nested tracks and versions. */
export async function loadProjects() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      cover_gradient,
      cover_image_url,
      position,
      created_at,
      tracks(
        id,
        title,
        created_at,
        position_in_project,
        versions(id, name, date, bpm, key, lufs, is_main, analysis_result, storage_path, created_at)
      )
    `)
    .eq('user_id', user.id)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('[storage] loadProjects error:', error.message);
    return [];
  }

  return (data || []).map(p => ({
    id: p.id,
    name: p.name,
    coverGradient: p.cover_gradient,
    coverImageUrl: p.cover_image_url || null,
    position: p.position,
    createdAt: p.created_at,
    tracks: (p.tracks || [])
      .slice()
      .sort((a, b) => (a.position_in_project ?? 0) - (b.position_in_project ?? 0))
      .map(t => ({
        id: t.id,
        title: t.title,
        projectId: p.id,
        createdAt: t.created_at,
        positionInProject: t.position_in_project,
        versions: (t.versions || [])
          .slice()
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .map(v => ({
            id: v.id,
            name: v.name,
            date: v.date,
            createdAt: v.created_at,
            bpm: v.bpm,
            key: v.key,
            lufs: v.lufs,
            main: v.is_main,
            analysisResult: v.analysis_result,
            storagePath: v.storage_path,
          })),
      })),
  }));
}

/** Create a new project. Appends at the end of the user's project list. */
export async function createProject(name, coverGradient = 0) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: last } = await supabase
    .from('projects')
    .select('position')
    .eq('user_id', user.id)
    .order('position', { ascending: false })
    .limit(1);
  const nextPos = (last?.[0]?.position ?? -1) + 1;

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name: (name || '').trim() || 'Nouveau projet',
      cover_gradient: coverGradient,
      position: nextPos,
    })
    .select()
    .single();
  if (error) {
    console.warn('[storage] createProject error:', error.message);
    return null;
  }
  return {
    id: project.id,
    name: project.name,
    coverGradient: project.cover_gradient,
    position: project.position,
    createdAt: project.created_at,
    tracks: [],
  };
}

/** Rename a project. Returns true on success. */
export async function renameProject(projectId, newName) {
  const clean = (newName || '').trim();
  if (!clean) return false;
  const { error } = await supabase
    .from('projects')
    .update({ name: clean })
    .eq('id', projectId);
  if (error) console.warn('[storage] renameProject error:', error.message);
  return !error;
}

/**
 * Upload / replace a project cover image.
 * Bucket `project-covers` (public). Path = `{user_id}/{project_id}.{ext}`.
 * Renvoie l'URL publique, ou null en cas d'échec.
 */
export async function setProjectCoverImage(projectId, file) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !file) return null;

  const ext = (file.name || '').split('.').pop()?.toLowerCase() || 'jpg';
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
  const path = `${user.id}/${projectId}.${safeExt}`;

  const { error: uploadErr } = await supabase.storage
    .from('project-covers')
    .upload(path, file, { upsert: true, contentType: file.type || `image/${safeExt}` });
  if (uploadErr) {
    console.warn('[storage] setProjectCoverImage upload error:', uploadErr.message);
    return null;
  }

  const { data: urlData } = supabase.storage.from('project-covers').getPublicUrl(path);
  // On ajoute un cache-buster pour forcer le navigateur à recharger
  // après remplacement d'une image existante (même path → même URL).
  const publicUrl = urlData?.publicUrl ? `${urlData.publicUrl}?v=${Date.now()}` : null;
  if (!publicUrl) return null;

  const { error: updateErr } = await supabase
    .from('projects')
    .update({ cover_image_url: publicUrl })
    .eq('id', projectId);
  if (updateErr) {
    console.warn('[storage] setProjectCoverImage update error:', updateErr.message);
    return null;
  }
  return publicUrl;
}

/**
 * Clear a project's cover image — supprime le fichier du bucket et met
 * cover_image_url à null en base.
 */
export async function clearProjectCoverImage(projectId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // On essaie de supprimer toutes les extensions possibles (upsert précédent
  // peut en avoir laissé plusieurs si l'utilisateur a changé de format).
  const paths = ['jpg', 'jpeg', 'png', 'webp', 'gif'].map(ext => `${user.id}/${projectId}.${ext}`);
  await supabase.storage.from('project-covers').remove(paths).catch(() => {});

  const { error } = await supabase
    .from('projects')
    .update({ cover_image_url: null })
    .eq('id', projectId);
  if (error) {
    console.warn('[storage] clearProjectCoverImage update error:', error.message);
    return false;
  }
  return true;
}

/**
 * Delete a project — removes audio files from Storage, then the row
 * (DB cascade deletes tracks + versions).
 * Refuses to delete the user's last remaining project.
 * Returns { ok, reason? } so the UI can react to the "last project" case.
 */
export async function deleteProject(projectId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: 'no-user' };

  const { count } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);
  if ((count ?? 0) <= 1) {
    return { ok: false, reason: 'last-project' };
  }

  const { data: tracks } = await supabase
    .from('tracks')
    .select('id, versions(storage_path)')
    .eq('project_id', projectId);

  const storagePaths = (tracks || [])
    .flatMap(t => (t.versions || []).map(v => v.storage_path))
    .filter(Boolean);

  if (storagePaths.length > 0) {
    await supabase.storage
      .from('audio')
      .remove(storagePaths)
      .catch(e => console.warn('[storage] audio remove error:', e.message));
  }

  // Nettoie aussi une éventuelle cover image du projet
  const coverPaths = ['jpg', 'jpeg', 'png', 'webp', 'gif']
    .map(ext => `${user.id}/${projectId}.${ext}`);
  await supabase.storage.from('project-covers').remove(coverPaths).catch(() => {});

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);
  if (error) {
    console.warn('[storage] deleteProject error:', error.message);
    return { ok: false, reason: error.message };
  }
  return { ok: true };
}

/** Persist the order of projects. `orderedIds` is the new [id, id, ...] order. */
export async function reorderProjects(orderedIds) {
  const updates = orderedIds.map((id, idx) =>
    supabase.from('projects').update({ position: idx }).eq('id', id)
  );
  const results = await Promise.all(updates);
  const firstErr = results.find(r => r.error)?.error;
  if (firstErr) console.warn('[storage] reorderProjects error:', firstErr.message);
  return !firstErr;
}

/**
 * Move a track to another project. Appends at the end of the target project
 * unless `newPosition` (integer) is specified.
 */
export async function moveTrackToProject(trackId, projectId, newPosition = null) {
  let pos = newPosition;
  if (pos == null) {
    const { data: last } = await supabase
      .from('tracks')
      .select('position_in_project')
      .eq('project_id', projectId)
      .order('position_in_project', { ascending: false })
      .limit(1);
    pos = (last?.[0]?.position_in_project ?? -1) + 1;
  }
  const { error } = await supabase
    .from('tracks')
    .update({ project_id: projectId, position_in_project: pos })
    .eq('id', trackId);
  if (error) console.warn('[storage] moveTrackToProject error:', error.message);
  return !error;
}

/** Persist the order of tracks within a project. */
export async function reorderTracksInProject(projectId, orderedTrackIds) {
  const updates = orderedTrackIds.map((id, idx) =>
    supabase
      .from('tracks')
      .update({ position_in_project: idx })
      .eq('id', id)
      .eq('project_id', projectId)
  );
  const results = await Promise.all(updates);
  const firstErr = results.find(r => r.error)?.error;
  if (firstErr) console.warn('[storage] reorderTracksInProject error:', firstErr.message);
  return !firstErr;
}
