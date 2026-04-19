/**
 * image.js — helpers image côté client.
 *
 * resizeImageFile(file, opts)
 *   - Redimensionne une image au maximum `maxSize` px sur le plus grand côté
 *     (par défaut 1200 px), en conservant le ratio.
 *   - Réencode en JPEG (qualité 0.85) sauf PNG/WebP/GIF avec transparence → WebP.
 *   - Si la source est déjà plus petite que maxSize ET plus légère que
 *     `maxBytes`, on renvoie le fichier d'origine intact.
 *   - Renvoie un File prêt à uploader (nom conservé, extension ajustée).
 *
 * Usage :
 *   const f = await resizeImageFile(userFile);
 *   await setProjectCoverImage(projectId, f);
 */

const DEFAULT_MAX = 1200;
const DEFAULT_QUALITY = 0.85;
const SKIP_IF_UNDER = 400 * 1024; // 400 KB

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
  const skipUnder = opts.skipUnder ?? SKIP_IF_UNDER;

  let img;
  try {
    img = await loadImage(file);
  } catch {
    return file; // format illisible : on laisse passer, le back gérera
  }

  const { width, height } = img;
  const biggest = Math.max(width, height);

  // Rien à faire : image déjà petite et fichier léger
  if (biggest <= maxSize && file.size <= skipUnder) return file;

  const scale = biggest > maxSize ? maxSize / biggest : 1;
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

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
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), outType, quality)
  );
  if (!blob) return file;

  // Extension de sortie
  const ext = outType === 'image/webp' ? 'webp' : 'jpg';
  const base = (file.name || 'cover').replace(/\.[^.]+$/, '');
  const name = `${base}.${ext}`;

  // Si après recompression c'est plus gros que l'original, on garde l'original
  if (blob.size >= file.size && biggest <= maxSize) return file;

  return new File([blob], name, { type: outType, lastModified: Date.now() });
}
