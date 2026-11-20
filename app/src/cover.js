// The composer: draws a whole cover onto a canvas from the cover state and the photo
// registry — panels first with their grade, then the cast labels, the title block over
// the lower panels, the magazine furniture, a whisper of grain, and the gilt frame.
// The editor's preview and the PNG export are this same drawing, so what you see is
// exactly what exports.

import { POST_SIZES } from './state.js';
import { panelRects } from './panels.js';
import { GRADES, drawPhotoPanel, drawPanelFrame, drawGrain } from './grade.js';
import { drawChromeTitle, drawScriptSubtitle, drawTagline, drawPanelLabel } from './lettering.js';
import { drawTopStrip, drawBottomStrip, drawSeal, drawOuterFrame } from './furniture.js';

/** Draws the cover described by `state` onto `canvas`, at the state's export size. */
export function composeCover(canvas, state, photos) {
  const size = POST_SIZES[state.size] ?? POST_SIZES.landscape;
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;

  ctx.fillStyle = '#14081f';
  ctx.fillRect(0, 0, w, h);

  const gutter = Math.max(6, w * 0.007);
  const rects = panelRects(state.layout, w, h, gutter);
  const grade = GRADES[state.grade] ?? GRADES.sunset;
  const frameWidth = Math.max(2, w * 0.0016);

  rects.forEach((rect, index) => {
    const slot = state.panels[index];
    const photo = slot ? photos.get(slot.photoId) : null;
    const view = slot ?? { zoom: 1, focusX: 0.5, focusY: 0.5 };
    drawPhotoPanel(ctx, rect, photo ? photo.img : null, view, grade, state.gradeAmount);
    drawPanelFrame(ctx, rect, frameWidth);
  });

  const landscape = w > h;
  const titleY = landscape ? h * 0.66 : h * 0.585;

  // Cast labels go on before the title block, so the title — the star of the poster —
  // paints over a label's edge where they meet, never the other way round. Each label
  // sits where the foot strip cannot swallow it: lower panels wear theirs at the top,
  // a full-height hero keeps its own above the credits strip.
  if (rects.length > 1) {
    const labelSize = Math.max(15, h * 0.021);
    const chipH = labelSize * 1.72;
    const pad = labelSize * 0.55;
    const titleTop = titleY - h * (landscape ? 0.255 : 0.155) * 0.62;
    const titleBottom = titleY + h * (landscape ? 0.255 : 0.155) * 0.62 + h * 0.1;
    rects.forEach((rect, index) => {
      const slot = state.panels[index];
      if (!slot) return;
      let labelY = rect.y + rect.h - chipH - pad;
      const swallowedByTitle = labelY < titleBottom && labelY + chipH > titleTop;
      if (rect.y > h * 0.4 || swallowedByTitle) labelY = rect.y + pad;
      if (rect.h > h * 0.8) labelY = Math.min(labelY, h * 0.912 - chipH);
      drawPanelLabel(ctx, rect, slot.label, labelSize, labelY);
    });
  }

  const titleSize = drawChromeTitle(ctx, state.title, w / 2, titleY, w * 0.94, h * (landscape ? 0.255 : 0.155));
  const subtitleY = titleY + titleSize * 0.66;
  drawScriptSubtitle(ctx, state.subtitle, w / 2, subtitleY, h * 0.05);
  const taglineY = landscape || w === h ? subtitleY + h * 0.048 : h * 0.795;
  drawTagline(ctx, state.tagline, w / 2, taglineY, h * 0.019);

  drawTopStrip(ctx, w, h, state);
  drawBottomStrip(ctx, w, h, state);
  drawSeal(ctx, w * (landscape ? 0.932 : 0.895), h * (landscape ? 0.79 : 0.855), w * (landscape ? 0.046 : 0.078));

  drawGrain(ctx, w, h, 0.05);
  drawOuterFrame(ctx, w, h);
  return canvas;
}
