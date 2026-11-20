// The magazine furniture that makes a poster read as a poster: the five-star review
// quote and volume chip along the top, the credits strip and barcode along the foot,
// the original-art seal, and the gilt outer frame. All drawn, all from the cover's
// state, so the words stay editable like everything else.

/** A five-pointed star path centred on (cx, cy). */
function starPath(ctx, cx, cy, radius) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? radius : radius * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** The top strip: five gold stars, the review quote and its source, and the volume chip. */
export function drawTopStrip(ctx, width, height, state) {
  const band = ctx.createLinearGradient(0, 0, 0, height * 0.13);
  band.addColorStop(0, 'rgba(10, 4, 20, 0.62)');
  band.addColorStop(1, 'rgba(10, 4, 20, 0)');
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, width, height * 0.13);

  const cy = height * 0.038;
  const starR = height * 0.013;
  ctx.fillStyle = '#ffd76a';
  for (let i = 0; i < 5; i++) {
    starPath(ctx, width * 0.028 + i * starR * 2.35, cy, starR);
    ctx.fill();
  }
  const quoteSize = height * 0.021;
  ctx.font = `${quoteSize}px Anton`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(state.quote, width * 0.028 + 5 * starR * 2.35 + starR, cy);
  const quoteWidth = ctx.measureText(state.quote).width;
  ctx.fillStyle = '#ffd76a';
  ctx.fillText(` — ${state.quoteSource}`, width * 0.028 + 5 * starR * 2.35 + starR + quoteWidth, cy);

  const chipW = width * 0.075;
  const chipH = height * 0.034;
  const chipX = width - chipW - width * 0.022;
  const chipY = cy - chipH / 2;
  ctx.beginPath();
  ctx.roundRect(chipX, chipY, chipW, chipH, chipH * 0.18);
  ctx.fillStyle = '#ffd76a';
  ctx.fill();
  ctx.font = `${height * 0.019}px Anton`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#241128';
  ctx.fillText(state.volume, chipX + chipW / 2, cy + height * 0.001);
}

/** A barcode whose bars come from the seed text, so a title always gets the same code. */
export function drawBarcode(ctx, x, y, width, height, seed) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = '#14100c';
  let cursor = x + width * 0.06;
  let i = 0;
  while (cursor < x + width * 0.9) {
    const code = seed.charCodeAt(i % seed.length) + i * 7;
    const barW = (1 + (code % 3)) * (width / 46);
    if (code % 4 !== 0) ctx.fillRect(cursor, y + height * 0.08, barW, height * 0.68);
    cursor += barW + width / 46;
    i++;
  }
  ctx.font = `${Math.round(Math.min(height * 0.2, width * 0.13))}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('9 772113', x + width / 2, y + height * 0.93);
}

/** The foot strip: COMING SOON, the credits line, and the barcode. */
export function drawBottomStrip(ctx, width, height, state) {
  const bandTop = height * 0.925;
  const band = ctx.createLinearGradient(0, bandTop, 0, height);
  band.addColorStop(0, 'rgba(8, 3, 16, 0)');
  band.addColorStop(0.45, 'rgba(8, 3, 16, 0.88)');
  band.addColorStop(1, 'rgba(8, 3, 16, 0.96)');
  ctx.fillStyle = band;
  ctx.fillRect(0, bandTop, width, height - bandTop);

  const cy = height * 0.972;
  ctx.textBaseline = 'middle';
  ctx.font = `${height * 0.02}px Anton`;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ff5ea8';
  ctx.fillText('COMING SOON', width * 0.024, cy);

  const credits = `A ${state.title.trim().toUpperCase()} PICTURE · STARRING YOU · SHOT ON YOUR OWN CAMERA · GRADED BY HAND`;
  let creditsSize = height * 0.0155;
  ctx.font = `${creditsSize}px Anton`;
  while (ctx.measureText(credits).width > width * 0.6 && creditsSize > 8) {
    creditsSize *= 0.94;
    ctx.font = `${creditsSize}px Anton`;
  }
  try { ctx.letterSpacing = '2px'; } catch { /* ignore */ }
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e8dcc8';
  ctx.fillText(credits, width / 2, cy);
  try { ctx.letterSpacing = '0px'; } catch { /* ignore */ }

  drawBarcode(ctx, width * 0.925, height * 0.945, width * 0.055, height * 0.045, state.title || 'PALM');
}

/** The original-art seal: a gold starburst with a dark heart, tilted like a sticker. */
export function drawSeal(ctx, cx, cy, radius) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.12);
  ctx.beginPath();
  const spikes = 24;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? radius : radius * 0.84;
    const a = (i * Math.PI) / spikes;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  const gold = ctx.createLinearGradient(0, -radius, 0, radius);
  gold.addColorStop(0, '#ffe9a8');
  gold.addColorStop(1, '#e8a33d');
  ctx.fillStyle = gold;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
  ctx.fillStyle = '#241128';
  ctx.fill();
  starPath(ctx, 0, -radius * 0.4, radius * 0.16);
  ctx.fillStyle = '#ffd76a';
  ctx.fill();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.font = `${radius * 0.3}px Anton`;
  ctx.fillText('ORIGINAL', 0, radius * 0.02);
  ctx.font = `${radius * 0.3}px Anton`;
  ctx.fillText('COVER ART', 0, radius * 0.34);
  ctx.restore();
}

/** The gilt double frame that closes the poster. */
export function drawOuterFrame(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = 'rgba(247, 215, 116, 0.95)';
  ctx.lineWidth = Math.max(2, width * 0.0022);
  const inset = width * 0.008;
  ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
  ctx.strokeStyle = 'rgba(16, 5, 28, 0.9)';
  ctx.lineWidth = Math.max(3, width * 0.004);
  ctx.strokeRect(width * 0.002, width * 0.002, width - width * 0.004, height - width * 0.004);
  ctx.restore();
}
