// The colour grades and the panel painter: a photo is drawn into its panel with a
// cover-fit crop (the panel's zoom and focus choose the window), a CSS-filter grade on
// the draw itself, warm washes laid over the top and the foot, and a vignette. Four
// grades ship with the studio: Sunset, Neon Nights, Golden Hour and Noir.

/** The grade catalogue: a canvas filter plus the washes laid over the graded photo. */
export const GRADES = {
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    filter: 'saturate(1.28) contrast(1.07) brightness(1.02)',
    washTop: 'rgba(255, 166, 66, 0.16)',
    washBottom: 'rgba(232, 44, 116, 0.30)',
    glow: 'rgba(255, 94, 58, 0.10)',
  },
  neon: {
    id: 'neon',
    name: 'Neon Nights',
    filter: 'saturate(1.38) contrast(1.13) brightness(1.0)',
    washTop: 'rgba(64, 224, 255, 0.15)',
    washBottom: 'rgba(255, 46, 136, 0.34)',
    glow: 'rgba(120, 40, 200, 0.14)',
  },
  golden: {
    id: 'golden',
    name: 'Golden Hour',
    filter: 'sepia(0.30) saturate(1.22) contrast(1.05) brightness(1.06)',
    washTop: 'rgba(255, 196, 86, 0.20)',
    washBottom: 'rgba(214, 96, 44, 0.26)',
    glow: 'rgba(255, 170, 60, 0.12)',
  },
  noir: {
    id: 'noir',
    name: 'Noir',
    filter: 'saturate(0.5) contrast(1.24) brightness(0.97)',
    washTop: 'rgba(140, 160, 220, 0.10)',
    washBottom: 'rgba(8, 8, 24, 0.38)',
    glow: 'rgba(60, 60, 90, 0.10)',
  },
};

/** Clamps a number into a range. */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** The source window of `img` that fills `rect` under a view's zoom and focus. */
export function photoWindow(img, rect, view) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(rect.w / iw, rect.h / ih) * Math.max(1, view.zoom);
  const sw = rect.w / scale;
  const sh = rect.h / scale;
  return {
    sx: clamp((iw - sw) * view.focusX, 0, Math.max(0, iw - sw)),
    sy: clamp((ih - sh) * view.focusY, 0, Math.max(0, ih - sh)),
    sw,
    sh,
  };
}

/** Paints one panel: the graded photo, its washes and vignette, clipped to the panel. */
export function drawPhotoPanel(ctx, rect, img, view, grade, amount) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (img) {
    const win = photoWindow(img, rect, view);
    ctx.filter = grade.filter;
    ctx.drawImage(img, win.sx, win.sy, win.sw, win.sh, rect.x, rect.y, rect.w, rect.h);
    ctx.filter = 'none';
  } else {
    const empty = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    empty.addColorStop(0, '#3a1654');
    empty.addColorStop(1, '#170a2a');
    ctx.fillStyle = empty;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
  if (amount > 0) {
    const wash = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
    wash.addColorStop(0, grade.washTop);
    wash.addColorStop(0.45, grade.glow);
    wash.addColorStop(1, grade.washBottom);
    ctx.globalAlpha = amount;
    ctx.fillStyle = wash;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.globalAlpha = 1;
    const vignette = ctx.createRadialGradient(
      rect.x + rect.w / 2, rect.y + rect.h / 2, Math.min(rect.w, rect.h) * 0.42,
      rect.x + rect.w / 2, rect.y + rect.h / 2, Math.max(rect.w, rect.h) * 0.78,
    );
    vignette.addColorStop(0, 'rgba(12, 2, 22, 0)');
    vignette.addColorStop(1, `rgba(12, 2, 22, ${0.34 * amount})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
  ctx.restore();
}

/** The panel's gold edge, drawn after the photo so the seam reads as a gilt frame. */
export function drawPanelFrame(ctx, rect, lineWidth) {
  ctx.save();
  ctx.strokeStyle = 'rgba(247, 215, 116, 0.92)';
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = 'rgba(20, 8, 36, 0.85)';
  ctx.lineWidth = lineWidth * 0.45;
  ctx.strokeRect(rect.x + lineWidth, rect.y + lineWidth, rect.w - lineWidth * 2, rect.h - lineWidth * 2);
  ctx.restore();
}

let grainTile = null;

/** A small tile of random grey noise, made once and reused as the poster's film grain. */
export function makeGrainTile() {
  if (grainTile) return grainTile;
  const tile = document.createElement('canvas');
  tile.width = 128;
  tile.height = 128;
  const tctx = tile.getContext('2d');
  const data = tctx.createImageData(128, 128);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 96 + Math.floor(Math.random() * 96);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  tctx.putImageData(data, 0, 0);
  grainTile = tile;
  return tile;
}

/** Lays the film grain over the whole poster at a whisper of opacity. */
export function drawGrain(ctx, width, height, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(makeGrainTile(), 'repeat');
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}
