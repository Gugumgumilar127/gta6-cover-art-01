// The panel layouts: where each photo panel sits on the poster, as fractions of the
// poster's width and height, per orientation. The composer insets each rectangle by the
// gutter, so neighbouring panels keep a thin dark seam with a gold edge, the way the
// classic multi-panel covers are built: one hero panel and a supporting cast around it.

/** A panel rectangle in fractions: x, y, w, h. */
function rect(x, y, w, h) {
  return { x, y, w, h };
}

/** The layout catalogue. `panels` is keyed by orientation: landscape, portrait, square. */
export const LAYOUTS = {
  cast: {
    id: 'cast',
    name: 'Cast of Five',
    panels: {
      landscape: [
        rect(0, 0, 0.44, 1),
        rect(0.44, 0, 0.28, 0.5),
        rect(0.72, 0, 0.28, 0.5),
        rect(0.44, 0.5, 0.28, 0.5),
        rect(0.72, 0.5, 0.28, 0.5),
      ],
      portrait: [
        rect(0, 0, 1, 0.44),
        rect(0, 0.44, 0.5, 0.28),
        rect(0.5, 0.44, 0.5, 0.28),
        rect(0, 0.72, 0.5, 0.28),
        rect(0.5, 0.72, 0.5, 0.28),
      ],
      square: [
        rect(0, 0, 1, 0.5),
        rect(0, 0.5, 0.5, 0.25),
        rect(0.5, 0.5, 0.5, 0.25),
        rect(0, 0.75, 0.5, 0.25),
        rect(0.5, 0.75, 0.5, 0.25),
      ],
    },
  },
  quad: {
    id: 'quad',
    name: 'Hero + Three',
    panels: {
      landscape: [
        rect(0, 0, 0.52, 1),
        rect(0.52, 0, 0.48, 0.34),
        rect(0.52, 0.34, 0.48, 0.33),
        rect(0.52, 0.67, 0.48, 0.33),
      ],
      portrait: [
        rect(0, 0, 1, 0.44),
        rect(0, 0.44, 0.5, 0.28),
        rect(0.5, 0.44, 0.5, 0.28),
        rect(0, 0.72, 1, 0.28),
      ],
      square: [
        rect(0, 0, 1, 0.5),
        rect(0, 0.5, 0.5, 0.25),
        rect(0.5, 0.5, 0.5, 0.25),
        rect(0, 0.75, 1, 0.25),
      ],
    },
  },
  trio: {
    id: 'trio',
    name: 'Trio',
    panels: {
      landscape: [rect(0, 0, 0.34, 1), rect(0.34, 0, 0.33, 1), rect(0.67, 0, 0.33, 1)],
      portrait: [rect(0, 0, 1, 0.52), rect(0, 0.52, 0.5, 0.48), rect(0.5, 0.52, 0.5, 0.48)],
      square: [rect(0, 0, 1, 0.52), rect(0, 0.52, 0.5, 0.48), rect(0.5, 0.52, 0.5, 0.48)],
    },
  },
  solo: {
    id: 'solo',
    name: 'Solo Cover',
    panels: {
      landscape: [rect(0, 0, 1, 1)],
      portrait: [rect(0, 0, 1, 1)],
      square: [rect(0, 0, 1, 1)],
    },
  },
};

/** The orientation key a pixel size falls under. */
export function orientationOf(width, height) {
  if (width > height) return 'landscape';
  if (height > width) return 'portrait';
  return 'square';
}

/** The panel rectangles for a layout at a pixel size, gutter included, in pixels. */
export function panelRects(layoutId, width, height, gutter) {
  const layout = LAYOUTS[layoutId] ?? LAYOUTS.cast;
  const fractions = layout.panels[orientationOf(width, height)];
  return fractions.map((f) => ({
    x: f.x * width + gutter / 2,
    y: f.y * height + gutter / 2,
    w: f.w * width - gutter,
    h: f.h * height - gutter,
  }));
}

/** How many panels a layout has at an orientation. */
export function panelCount(layoutId, orientation) {
  const layout = LAYOUTS[layoutId] ?? LAYOUTS.cast;
  return layout.panels[orientation].length;
}
