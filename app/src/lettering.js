// The lettering: a chrome-sunset display title in Anton with a striped sheen and a hard
// poster shadow, a neon script subtitle in Yellowtail, a letterspaced tagline on a dark
// pill, and the little cast labels that sit in each panel's corner. All of it is drawn
// with the two bundled fonts — no lettering is ever an image, so every word stays editable.

/** Shrinks a font size until `text` fits `maxWidth` on `ctx`, and returns the size used. */
export function fitFontSize(ctx, text, family, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `${size}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && size > 10) {
    size *= 0.94;
    ctx.font = `${size}px ${family}`;
  }
  return size;
}

/** The sunset chrome gradient a title is filled with, over a height of `height`. */
function chromeGradient(ctx, top, height) {
  const gradient = ctx.createLinearGradient(0, top, 0, top + height);
  gradient.addColorStop(0, '#fffbe8');
  gradient.addColorStop(0.32, '#ffe9a8');
  gradient.addColorStop(0.48, '#ffc44d');
  gradient.addColorStop(0.52, '#ff7a3d');
  gradient.addColorStop(0.57, '#e84e7a');
  gradient.addColorStop(0.76, '#c93a86');
  gradient.addColorStop(1, '#7a2ea6');
  return gradient;
}

/**
 * Draws the title: skewed capitals filled with striped chrome, a dark outline and a
 * hard offset shadow, centred on (centerX, centerY). Returns the size it was drawn at.
 */
export function drawChromeTitle(ctx, text, centerX, centerY, maxWidth, startSize) {
  const words = text.trim().toUpperCase();
  if (!words) return 0;
  const size = fitFontSize(ctx, words, 'Anton', maxWidth, startSize);
  const width = ctx.measureText(words).width;
  const pad = size * 0.3;

  // The fill is painted on its own canvas so the sheen stripes can be clipped to the glyphs.
  const fill = document.createElement('canvas');
  fill.width = Math.ceil(width + pad * 2);
  fill.height = Math.ceil(size * 1.5);
  const fctx = fill.getContext('2d');
  fctx.font = `${size}px Anton`;
  fctx.textAlign = 'center';
  fctx.textBaseline = 'middle';
  fctx.save();
  fctx.translate(fill.width / 2, fill.height / 2);
  fctx.transform(1, 0, -0.07, 1, 0, 0);
  fctx.fillStyle = chromeGradient(fctx, -size * 0.55, size * 1.1);
  fctx.fillText(words, 0, size * 0.04);
  fctx.globalCompositeOperation = 'source-atop';
  fctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  fctx.fillRect(0, fill.height / 2 - size * 0.02, fill.width, size * 0.035);
  fctx.fillStyle = 'rgba(64, 8, 54, 0.20)';
  for (let y = fill.height * 0.58; y < fill.height; y += size * 0.11) {
    fctx.fillRect(0, y, fill.width, size * 0.03);
  }
  fctx.restore();

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.transform(1, 0, -0.07, 1, 0, 0);
  ctx.font = `${size}px Anton`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#170726';
  ctx.lineWidth = size * 0.15;
  ctx.strokeText(words, 0, size * 0.04);
  ctx.restore();

  ctx.save();
  ctx.shadowColor = 'rgba(10, 2, 24, 0.55)';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = size * 0.055;
  ctx.drawImage(fill, centerX - fill.width / 2, centerY - fill.height / 2);
  ctx.restore();
  return size;
}

/** The script subtitle: Yellowtail in hot pink with a soft neon glow, tilted a touch. */
export function drawScriptSubtitle(ctx, text, centerX, centerY, startSize) {
  const words = text.trim();
  if (!words) return;
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(-0.03);
  const size = fitFontSize(ctx, words, 'Yellowtail', ctx.canvas.width * 0.7, startSize);
  ctx.font = `${size}px Yellowtail`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(255, 46, 136, 0.95)';
  ctx.shadowBlur = size * 0.32;
  ctx.fillStyle = '#ff6fb5';
  ctx.fillText(words, 0, 0);
  ctx.fillText(words, 0, 0);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffd3e8';
  ctx.fillText(words, 0, 0);
  ctx.restore();
}

/** The tagline: letterspaced capitals on a dark pill with gold end ticks. */
export function drawTagline(ctx, text, centerX, centerY, startSize) {
  const words = text.trim().toUpperCase();
  if (!words) return;
  ctx.save();
  const size = fitFontSize(ctx, words, 'Anton', ctx.canvas.width * 0.86, startSize);
  ctx.font = `${size}px Anton`;
  try { ctx.letterSpacing = `${Math.round(size * 0.16)}px`; } catch { /* older canvas: no spacing */ }
  const width = ctx.measureText(words).width;
  const pillH = size * 1.9;
  const pillW = width + size * 2.4;
  ctx.beginPath();
  ctx.roundRect(centerX - pillW / 2, centerY - pillH / 2, pillW, pillH, pillH / 2);
  ctx.fillStyle = 'rgba(12, 5, 24, 0.82)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(247, 215, 116, 0.9)';
  ctx.lineWidth = Math.max(1.5, size * 0.06);
  ctx.stroke();
  ctx.fillStyle = '#ffd76a';
  ctx.fillRect(centerX - pillW / 2 + size * 0.55, centerY - size * 0.09, size * 0.5, size * 0.18);
  ctx.fillRect(centerX + pillW / 2 - size * 1.05, centerY - size * 0.09, size * 0.5, size * 0.18);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(words, centerX, centerY + size * 0.05);
  try { ctx.letterSpacing = '0px'; } catch { /* ignore */ }
  ctx.restore();
}

/** A panel's cast label: a slanted dark chip with a gold tick, at the panel's left edge,
 *  at the height `labelY` the composer chose (so it never hides under the title block). */
export function drawPanelLabel(ctx, rect, label, fontSize, labelY) {
  const words = label.trim().toUpperCase();
  if (!words) return;
  ctx.save();
  ctx.font = `${fontSize}px Anton`;
  try { ctx.letterSpacing = '1px'; } catch { /* ignore */ }
  const textWidth = ctx.measureText(words).width;
  const chipH = fontSize * 1.72;
  const chipW = textWidth + fontSize * 1.5;
  const x = rect.x + fontSize * 0.55;
  const y = labelY;
  const slant = chipH * 0.32;
  ctx.beginPath();
  ctx.moveTo(x + slant, y);
  ctx.lineTo(x + chipW, y);
  ctx.lineTo(x + chipW - slant, y + chipH);
  ctx.lineTo(x, y + chipH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(10, 5, 22, 0.86)';
  ctx.fill();
  ctx.fillStyle = '#ff5ea8';
  ctx.fillRect(x + slant * 0.4, y, fontSize * 0.28, chipH);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(words, x + fontSize * 0.62, y + chipH / 2 + fontSize * 0.05);
  try { ctx.letterSpacing = '0px'; } catch { /* ignore */ }
  ctx.restore();
}
