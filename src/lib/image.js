/**
 * image.js — helpers image côté client.
 *
 * resizeImageFile(file, opts)
 *   - Par défaut : center-crop CARRÉ + resize à `maxSize` px (1200 par défaut).
 *     → le fichier stocké est toujours un carré, propre à afficher partout.
 *   - Réencode en JPEG (qualité 0.85). Si la source a de la transparence
 *     (PNG/WebP/GIF), on sort en WebP pour la préserver.
 *   - Options :
 *        square      : true (par défaut) pour center-crop carré, false pour
 *                      simple resize sans crop.
 *        maxSize     : 1200 par défaut (côté du carré, ou plus grand côté).
 *        quality     : 0.85 par défaut.
 *   - Renvoie un File prêt à uploader (nom conservé, extension ajustée).
 *
 * Usage :
 *   const f = await resizeImageFile(userFile);
 *   await setProjectCoverImage(projectId, f);
 */

const DEFAULT_MAX = 1200;
const DEFAULT_QUALITY = 0.85;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

function hasAlpha(type) {
  return type === 'image/png' || type === 'image/webp' || type === 'image/gif';
}

export async function resizeImageFile(file, opts = {}) {
  if (!file || !file.type?.startsWith('image/')) return file;

  const maxSize = opts.maxSize ?? DEFAULT_MAX;
  const quality = opts.quality ?? DEFAULT_QUALITY;
  const square = opts.square !== false; // carré par défaut

  let img;
  try {
    img = await loadImage(file);
  } catch {
    return file; // format illisible : on laisse passer, le back gérera
  }

  const { width: srcW, height: srcH } = img;

  // Calcule la zone source à peindre et la taille du canvas cible.
  let sx, sy, sW, sH, targetSize;
  let targetW, targetH;

  if (square) {
    // Center-crop carré dans la source
    const minSide = Math.min(srcW, srcH);
    sx = Math.round((srcW - minSide) / 2);
    sy = Math.round((srcH - minSide) / 2);
    sW = minSide;
    sH = minSide;
    targetSize = Math.min(minSide, maxSize);
    targetW = targetSize;
    targetH = targetSize;
  } else {
    sx = 0; sy = 0; sW = srcW; sH = srcH;
    const biggest = Math.max(srcW, srcH);
    const scale = biggest > maxSize ? maxSize / biggest : 1;
    targetW = Math.round(srcW * scale);
    targetH = Math.round(srcH * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  // Fond blanc si on passe en JPEG pour éviter les artefacts de transparence
  const outType = hasAlpha(file.type) ? 'image/webp' : 'image/jpeg';
  if (outType === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, sW, sH, 0, 0, targetW, targetH);

  const blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), outType, quality)
  );
  if (!blob) return file;

  const ext = outType === 'image/webp' ? 'webp' : 'jpg';
  const base = (file.name || 'cover').replace(/\.[^.]+$/, '');
  const name = `${base}.${ext}`;

  return new File([blob], name, { type: outType, lastModified: Date.now() });
}
