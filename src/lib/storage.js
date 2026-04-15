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
    .select('id, title, created_at, versions(id, name, date, bpm, key, lufs, is_main, analysis_result, created_at)')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[storage] loadTracks error:', error.message);
    return [];
  }

  // Normalize field name is_main → main for frontend consistency
  return (tracks || []).map(t => ({
    id: t.id,
    title: t.title,
    createdAt: t.created_at,
    versions: (t.versions || [])
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map(v => ({
        id: v.id,
        name: v.name,
        date: v.date,
        bpm: v.bpm,
        key: v.key,
        lufs: v.lufs,
        main: v.is_main,
        analysisResult: v.analysis_result,
      })),
  }));
}

/**
 * Save an analysis. Finds or creates track by title (case-insensitive),
 * then inserts or updates the version.
 */
export async function saveAnalysis(config, analysisResult) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn('[storage] saveAnalysis: no user');
    return null;
  }

  const title = (config?.title || analysisResult?.meta?.title || 'Sans titre').trim();
  const versionName = (config?.version || 'v1').trim();

  // Find existing track (case-insensitive)
  const { data: existingTracks } = await supabase
    .from('tracks')
    .select('id, title')
    .ilike('title', title);

  let track = existingTracks?.find(t => t.title.toLowerCase() === title.toLowerCase());

  if (!track) {
    const { data: newTrack, error: insertErr } = await supabase
      .from('tracks')
      .insert({ user_id: user.id, title })
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

  if (existing) {
    const { error } = await supabase
      .from('versions')
      .update({
        date: formatDate(),
        is_main: true,
        analysis_result: analysisResult,
        audio_hash: config?.audioHash || analysisResult?.audioHash || null,
      })
      .eq('id', existing.id);
    if (error) console.warn('[storage] version update error:', error.message);
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
        audio_hash: config?.audioHash || analysisResult?.audioHash || null,
      })
      .select()
      .single();
    if (error) {
      console.warn('[storage] version insert error:', error.message);
      return null;
    }
    return { trackId: track.id, versionId: newVer.id };
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

/** Delete a version. If last one, delete the track too. */
export async function deleteVersion(trackId, versionId) {
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

/** Delete a track and all its versions */
export async function deleteTrack(trackId) {
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
