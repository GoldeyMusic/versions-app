/**
 * Persistence layer for Versions — stores tracks & analysis results in localStorage.
 *
 * Data model:
 * {
 *   tracks: [
 *     {
 *       id: "t_xxx",
 *       title: "Lacher prise",
 *       createdAt: "2026-04-13T...",
 *       versions: [
 *         {
 *           id: "v_xxx",
 *           name: "Mix v2 LUNA",
 *           date: "13 avr 2026",
 *           bpm: "78",
 *           key: "Dm",
 *           lufs: "-12.1",
 *           main: true,
 *           analysisResult: { fadrData, fiche, listening, _stage }
 *         }
 *       ]
 *     }
 *   ]
 * }
 */

const STORAGE_KEY = 'versions_tracks';

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function formatDate(d = new Date()) {
  const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** Load all tracks from localStorage */
export function loadTracks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** Save all tracks to localStorage */
export function saveTracks(tracks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
  } catch (e) {
    console.warn('[storage] save failed:', e.message);
  }
}

/**
 * Save an analysis result. Finds or creates the track by title,
 * then adds/updates the version.
 *
 * @param {object} config - { title, version, daw, mode, artist }
 * @param {object} analysisResult - { fadrData, fiche, listening, _stage, meta }
 * @returns {object} { trackId, versionId }
 */
export function saveAnalysis(config, analysisResult) {
  const tracks = loadTracks();
  const title = (config.title || analysisResult?.meta?.title || 'Sans titre').trim();
  const versionName = (config.version || 'v1').trim();

  // Extract metadata from fadrData
  const fadr = analysisResult?.fadrData || {};
  const bpm = fadr.bpm ? String(fadr.bpm) : '';
  const key = fadr.key || '';
  const lufs = fadr.lufs ? String(fadr.lufs) : '';

  // Find existing track by title (case-insensitive)
  let track = tracks.find(t => t.title.toLowerCase() === title.toLowerCase());

  if (!track) {
    track = {
      id: 't_' + uid(),
      title,
      createdAt: new Date().toISOString(),
      versions: [],
    };
    tracks.unshift(track); // newest first
  }

  // Check if version name already exists for this track → update it
  let version = track.versions.find(v => v.name.toLowerCase() === versionName.toLowerCase());

  if (version) {
    // Update existing version
    version.date = formatDate();
    version.bpm = bpm || version.bpm;
    version.key = key || version.key;
    version.lufs = lufs || version.lufs;
    version.analysisResult = analysisResult;
  } else {
    // New version — add at the top
    const isFirst = track.versions.length === 0;
    version = {
      id: 'v_' + uid(),
      name: versionName,
      date: formatDate(),
      bpm,
      key,
      lufs,
      main: isFirst,
      analysisResult,
    };
    track.versions.unshift(version);
  }

  saveTracks(tracks);
  return { trackId: track.id, versionId: version.id };
}

/**
 * Get a specific version's analysis result
 */
export function getAnalysis(trackId, versionId) {
  const tracks = loadTracks();
  const track = tracks.find(t => t.id === trackId);
  if (!track) return null;
  const version = track.versions.find(v => v.id === versionId);
  return version?.analysisResult || null;
}

/**
 * Delete a version. If it was the last one, delete the whole track.
 */
export function deleteVersion(trackId, versionId) {
  let tracks = loadTracks();
  tracks = tracks.map(t => {
    if (t.id !== trackId) return t;
    const versions = t.versions.filter(v => v.id !== versionId);
    // If main was deleted, promote first remaining
    if (versions.length && !versions.some(v => v.main)) {
      versions[0].main = true;
    }
    return { ...t, versions };
  }).filter(t => t.versions.length > 0);
  saveTracks(tracks);
  return tracks;
}

/**
 * Rename a version
 */
export function renameVersion(trackId, versionId, newName) {
  const tracks = loadTracks();
  const track = tracks.find(t => t.id === trackId);
  if (track) {
    const v = track.versions.find(v => v.id === versionId);
    if (v) v.name = newName.trim();
  }
  saveTracks(tracks);
  return tracks;
}

/**
 * Rename a track
 */
export function renameTrack(trackId, newTitle) {
  const tracks = loadTracks();
  const track = tracks.find(t => t.id === trackId);
  if (track) track.title = newTitle.trim();
  saveTracks(tracks);
  return tracks;
}

/**
 * Set a version as main (and unset others)
 */
export function setMainVersion(trackId, versionId) {
  const tracks = loadTracks();
  const track = tracks.find(t => t.id === trackId);
  if (track) {
    track.versions.forEach(v => { v.main = v.id === versionId; });
    // Move main to top
    const idx = track.versions.findIndex(v => v.id === versionId);
    if (idx > 0) {
      const [moved] = track.versions.splice(idx, 1);
      track.versions.unshift(moved);
    }
  }
  saveTracks(tracks);
  return tracks;
}

/**
 * Reorder versions (after drag & drop)
 */
export function reorderVersions(trackId, fromIdx, toIdx) {
  const tracks = loadTracks();
  const track = tracks.find(t => t.id === trackId);
  if (track) {
    const [moved] = track.versions.splice(fromIdx, 1);
    track.versions.splice(toIdx, 0, moved);
    track.versions.forEach((v, i) => { v.main = i === 0; });
  }
  saveTracks(tracks);
  return tracks;
}
