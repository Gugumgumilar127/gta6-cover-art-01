// The export: composes the cover on a fresh canvas at the chosen post size and saves
// it as a PNG through a download link — the file a person then posts. No upload, no
// server: the PNG is written by the browser straight from the canvas.

import { POST_SIZES } from './state.js';
import { composeCover } from './cover.js';

/** Exports the current cover as a PNG and reports the saved file name to `onDone`. */
export function exportCoverPng(state, photos, onDone) {
  const size = POST_SIZES[state.size] ?? POST_SIZES.landscape;
  const canvas = document.createElement('canvas');
  composeCover(canvas, state, photos);
  const name = `palm-heat-${size.width}x${size.height}.png`;
  canvas.toBlob((blob) => {
    if (!blob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 4000);
    if (onDone) onDone(`Saved ${name}`);
  }, 'image/png');
}
