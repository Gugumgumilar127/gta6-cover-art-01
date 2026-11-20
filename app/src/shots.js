// Screenshot scenes: a `?shot=` query turns the studio into a fixed scene the maker
// captures for the entry's screenshots. `?shot=cover&size=landscape|square|portrait`
// shows one exported cover alone, filling the window; `?shot=editor` shows the studio
// with the samples cast. Text can be overridden with title, subtitle and tagline
// parameters. The scene is settled once window.__shotReady is set (see main.js).

/** Reads the shot query, or returns null when the studio should open normally. */
export function readShotOverrides() {
  const query = new URLSearchParams(location.search);
  const mode = query.get('shot');
  if (!mode) return null;
  return {
    mode,
    size: query.get('size'),
    title: query.get('title'),
    subtitle: query.get('subtitle'),
    tagline: query.get('tagline'),
    panel: query.get('panel'),
  };
}

/** Applies a shot's overrides to the cover state and the page, before the first draw. */
export function applyShotOverrides(state, shot, fitPanels) {
  if (shot.size) state.size = shot.size;
  if (shot.title) state.title = shot.title;
  if (shot.subtitle) state.subtitle = shot.subtitle;
  if (shot.tagline) state.tagline = shot.tagline;
  fitPanels();
  if (shot.mode === 'cover') document.body.classList.add('shot-cover');
  if (shot.mode === 'editor') document.body.classList.add('shot-editor');
}
