// The cover's state: the words, the layout, the size, the grade, and one slot per panel
// holding a photo id, a label and a view (zoom + focus). Everything the editor edits and
// everything the composer draws lives here, so a cover can be rebuilt from state alone.

/** The export sizes, in pixels: the common post sizes the bounty names. */
export const POST_SIZES = {
  square: { id: 'square', label: '1080 × 1080', width: 1080, height: 1080 },
  portrait: { id: 'portrait', label: '1080 × 1350', width: 1080, height: 1350 },
  landscape: { id: 'landscape', label: '1920 × 1080', width: 1920, height: 1080 },
};

/** The sample photos bundled with the app (made with an image model; free to use). */
export const SAMPLE_PHOTOS = [
  { id: 'driver', src: 'samples/driver.jpg', name: 'Driver at golden hour' },
  { id: 'insider', src: 'samples/insider.jpg', name: 'Insider under neon' },
  { id: 'boss', src: 'samples/boss.jpg', name: 'Boss above the skyline' },
  { id: 'rider', src: 'samples/rider.jpg', name: 'Rider on the promenade' },
  { id: 'courier', src: 'samples/courier.jpg', name: 'Courier in the rain' },
  { id: 'boulevard', src: 'samples/boulevard.jpg', name: 'Boulevard at sunset' },
];

/** The cast names a fresh cover starts with, one per panel slot. */
export const DEFAULT_LABELS = ['THE DRIVER', 'THE INSIDER', 'THE BOSS', 'THE RIDER', 'THE COURIER'];

/** One panel slot: which photo fills it, its label, and how the photo sits inside it. */
export function createPanelSlot(index) {
  const sample = SAMPLE_PHOTOS[index % SAMPLE_PHOTOS.length];
  return {
    photoId: sample.id,
    label: DEFAULT_LABELS[index % DEFAULT_LABELS.length],
    zoom: 1,
    focusX: 0.5,
    focusY: 0.3,
  };
}

/** A fresh cover: the samples already cast, so the first thing anyone sees is a poster. */
export function createCoverState() {
  return {
    title: 'PALM HEAT',
    subtitle: 'one last summer',
    tagline: 'FIVE FRIENDS · ONE COAST · NO WAY BACK',
    quote: '“PURE GOLDEN-HOUR MAYHEM”',
    quoteSource: 'THE HARBOR GAZETTE',
    volume: 'VOL. 1',
    layout: 'cast',
    size: 'landscape',
    grade: 'sunset',
    gradeAmount: 0.85,
    panels: [0, 1, 2, 3, 4].map(createPanelSlot),
  };
}

/** Keeps the panel slots in step with a layout's panel count, keeping what is already cast. */
export function fitPanelsToLayout(state, panelCount) {
  while (state.panels.length < panelCount) state.panels.push(createPanelSlot(state.panels.length));
  state.panels.length = panelCount;
}
