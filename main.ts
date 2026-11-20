// Palm Heat Cover Studio — the program that hands the app in (Node 22, standard library only).
//
// The app itself is the static web app in app/: plain files a desktop browser opens offline
// (app/index.html and its ES modules; no library, no network request, photos never leave the
// machine). This program copies app/ and screenshots/ from beside this file into the output
// directory and writes dossier.json there with the vendored make.fun library, byte for byte
// the way the scorer builds it again.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the app locally with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps are the scorer's own (reference/gate.json): at most 4 screenshots of at most
// 256 KiB each, at most 993 files and 48 MiB under app/, no app path over 1,000 bytes, and
// the dossier text capped at 160 KiB. buildDossier refuses anything the scorer would refuse.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

// Say what was handed in, so a local run leaves a trace in the terminal.
console.log(`Palm Heat Cover Studio: dossier written to ${join(out, 'dossier.json')}`);
