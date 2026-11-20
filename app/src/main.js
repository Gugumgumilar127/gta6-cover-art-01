// Palm Heat Cover Studio — the editor. It wires the page to the cover state: the words,
// the layout and size, the grade, the photo registry (the bundled samples plus the
// visitor's own photos, read locally and never uploaded), and the panel slots with
// their labels, photos, zooms and focus points. The poster canvas is live: click a
// panel to select it, drag to move its photo, scroll to zoom it, then export the PNG.

import { POST_SIZES, SAMPLE_PHOTOS, createCoverState, fitPanelsToLayout } from './state.js';
import { LAYOUTS, panelCount, panelRects, orientationOf } from './panels.js';
import { GRADES } from './grade.js';
import { composeCover } from './cover.js';
import { exportCoverPng } from './export.js';
import { readShotOverrides, applyShotOverrides } from './shots.js';

const canvas = document.getElementById('poster');
const status = document.getElementById('status');
const state = createCoverState();
const photos = new Map();
let selectedPanel = 0;
let userPhotoSeq = 0;

/** Loads an image from a URL, resolving once it can be drawn. */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Adds a photo to the registry and returns its record. */
async function addPhoto(id, name, src) {
  const img = await loadImage(src);
  const record = { id, name, src, img };
  photos.set(id, record);
  return record;
}

/** Keeps the state's panel slots matched to the layout at the current size. */
function fitPanels() {
  const size = POST_SIZES[state.size];
  fitPanelsToLayout(state, panelCount(state.layout, orientationOf(size.width, size.height)));
  if (selectedPanel >= state.panels.length) selectedPanel = 0;
}

/** Redraws only the poster canvas (safe while typing in a control). */
function redraw() {
  composeCover(canvas, state, photos);
}

/** Marks the pressed button in a row, by data value. */
function markRow(rowId, value) {
  document.querySelectorAll(`#${rowId} button`).forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.value === value));
  });
}

/** Rebuilds the dynamic controls: layout/size/grade rows, photo strip, panel list. */
function renderControls() {
  markRow('layout-row', state.layout);
  markRow('size-row', state.size);
  markRow('grade-row', state.grade);

  const strip = document.getElementById('photo-strip');
  strip.replaceChildren();
  for (const photo of photos.values()) {
    const thumb = document.createElement('img');
    thumb.src = photo.src;
    thumb.alt = photo.name;
    thumb.title = photo.name;
    const slot = state.panels[selectedPanel];
    thumb.setAttribute('aria-pressed', String(slot && slot.photoId === photo.id));
    thumb.addEventListener('click', () => {
      state.panels[selectedPanel].photoId = photo.id;
      renderControls();
      redraw();
    });
    strip.append(thumb);
  }

  const list = document.getElementById('panel-list');
  list.replaceChildren();
  state.panels.forEach((slot, index) => {
    const row = document.createElement('div');
    row.className = 'panel-row';
    row.setAttribute('aria-selected', String(index === selectedPanel));

    const label = document.createElement('input');
    label.type = 'text';
    label.value = slot.label;
    label.maxLength = 22;
    label.setAttribute('aria-label', `Panel ${index + 1} label`);
    label.addEventListener('input', () => {
      slot.label = label.value;
      redraw();
    });

    const pick = document.createElement('select');
    pick.setAttribute('aria-label', `Panel ${index + 1} photo`);
    for (const photo of photos.values()) {
      const option = document.createElement('option');
      option.value = photo.id;
      option.textContent = photo.name;
      pick.append(option);
    }
    pick.value = slot.photoId;
    pick.addEventListener('change', () => {
      slot.photoId = pick.value;
      renderControls();
      redraw();
    });

    const zoom = document.createElement('input');
    zoom.type = 'range';
    zoom.min = '1';
    zoom.max = '2.5';
    zoom.step = '0.01';
    zoom.value = String(slot.zoom);
    zoom.setAttribute('aria-label', `Panel ${index + 1} zoom`);
    zoom.addEventListener('input', () => {
      slot.zoom = Number(zoom.value);
      redraw();
    });

    row.append(label, pick, zoom);
    row.addEventListener('click', (event) => {
      if (event.target.closest('input, select')) return;
      selectedPanel = index;
      renderControls();
    });
    list.append(row);
  });
}

/** Builds the static button rows once: layouts, sizes and grades. */
function buildButtonRows() {
  const layoutRow = document.getElementById('layout-row');
  for (const layout of Object.values(LAYOUTS)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.value = layout.id;
    button.textContent = layout.name;
    button.addEventListener('click', () => {
      state.layout = layout.id;
      fitPanels();
      renderControls();
      redraw();
    });
    layoutRow.append(button);
  }
  const sizeRow = document.getElementById('size-row');
  for (const size of Object.values(POST_SIZES)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.value = size.id;
    button.textContent = size.label;
    button.addEventListener('click', () => {
      state.size = size.id;
      fitPanels();
      renderControls();
      redraw();
    });
    sizeRow.append(button);
  }
  const gradeRow = document.getElementById('grade-row');
  for (const grade of Object.values(GRADES)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.value = grade.id;
    button.textContent = grade.name;
    button.addEventListener('click', () => {
      state.grade = grade.id;
      renderControls();
      redraw();
    });
    gradeRow.append(button);
  }
}

/** Wires the text fields, the grade strength, the photo picker and the export button. */
function wireFields() {
  const bind = (id, apply) => {
    document.getElementById(id).addEventListener('input', (event) => {
      apply(event.target.value);
      redraw();
    });
  };
  bind('title-input', (value) => { state.title = value; });
  bind('subtitle-input', (value) => { state.subtitle = value; });
  bind('tagline-input', (value) => { state.tagline = value; });
  document.getElementById('grade-amount').addEventListener('input', (event) => {
    state.gradeAmount = Number(event.target.value) / 100;
    redraw();
  });
  document.getElementById('photo-input').addEventListener('change', async (event) => {
    const files = [...event.target.files];
    for (const file of files) {
      userPhotoSeq += 1;
      const record = await addPhoto(`user-${userPhotoSeq}`, file.name, URL.createObjectURL(file));
      state.panels[selectedPanel].photoId = record.id;
    }
    if (files.length) status.textContent = `${files.length} photo(s) added — pick a panel to place each one.`;
    renderControls();
    redraw();
  });
  document.getElementById('export-button').addEventListener('click', () => {
    exportCoverPng(state, photos, (message) => { status.textContent = message; });
  });
}

/** Canvas gestures: click selects a panel, drag moves its photo, wheel zooms it. */
function wireCanvasGestures() {
  const toCanvasPoint = (event) => {
    const box = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - box.left) / box.width) * canvas.width,
      y: ((event.clientY - box.top) / box.height) * canvas.height,
    };
  };
  let drag = null;
  canvas.addEventListener('pointerdown', (event) => {
    const point = toCanvasPoint(event);
    const gutter = Math.max(6, canvas.width * 0.007);
    const rects = panelRects(state.layout, canvas.width, canvas.height, gutter);
    const index = rects.findIndex((r) => point.x >= r.x && point.x <= r.x + r.w && point.y >= r.y && point.y <= r.y + r.h);
    if (index < 0) return;
    selectedPanel = index;
    const slot = state.panels[index];
    drag = { rect: rects[index], startX: point.x, startY: point.y, focusX: slot.focusX, focusY: slot.focusY };
    canvas.setPointerCapture(event.pointerId);
    renderControls();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const point = toCanvasPoint(event);
    const slot = state.panels[selectedPanel];
    slot.focusX = Math.min(1, Math.max(0, drag.focusX - (point.x - drag.startX) / drag.rect.w));
    slot.focusY = Math.min(1, Math.max(0, drag.focusY - (point.y - drag.startY) / drag.rect.h));
    redraw();
  });
  canvas.addEventListener('pointerup', () => { drag = null; });
  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const slot = state.panels[selectedPanel];
    const factor = event.deltaY < 0 ? 1.06 : 0.94;
    slot.zoom = Math.min(3, Math.max(1, slot.zoom * factor));
    renderControls();
    redraw();
  }, { passive: false });
}

/** Boots the studio: samples in, fonts in, controls up, first poster drawn. */
async function boot() {
  buildButtonRows();
  wireFields();
  wireCanvasGestures();
  await Promise.all(SAMPLE_PHOTOS.map((sample) => addPhoto(sample.id, sample.name, sample.src)));
  try {
    await Promise.all([document.fonts.load('80px Anton'), document.fonts.load('80px Yellowtail')]);
    await document.fonts.ready;
  } catch { /* the poster still draws with fallback fonts */ }
  const shot = readShotOverrides();
  if (shot) {
    applyShotOverrides(state, shot, fitPanels);
    if (shot.panel) selectedPanel = Math.min(Number(shot.panel), state.panels.length - 1);
    document.getElementById('title-input').value = state.title;
    document.getElementById('subtitle-input').value = state.subtitle;
    document.getElementById('tagline-input').value = state.tagline;
  } else {
    fitPanels();
  }
  renderControls();
  redraw();
  if (shot) {
    requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
  }
}

boot();
