#!/usr/bin/env node
/**
 * Scans public/templates/forms and public/templates/examples, then updates
 * src/data/template-manifest.json to reflect the current file state.
 *
 * Run: npm run sync-templates
 *
 * ID is extracted from the leading segment of each filename, e.g. "A-002" from
 * "A-002-CybersecurityPrivacyPolicy-FORM.docx".
 *
 * Example sizes (S, M, L, etc.) are sorted small-to-large. Unrecognised sizes
 * fall back to alphabetical order after known sizes.
 *
 * Existing manifest entries that have no matching files are preserved and
 * reported as warnings so nothing is silently dropped.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, copyFileSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const FORMS_DIR     = join(ROOT, 'public/templates/forms');            // [bracket] masters (source + reference download)
const COMPILED_DIR  = join(ROOT, 'public/templates/compiled/forms');   // {tag} builder copies (generated)
const EXAMPLES_DIR  = join(ROOT, 'public/templates/examples');
const MANIFEST_PATH = join(ROOT, 'src/data/template-manifest.json');
const BUILD_META_PATH = join(COMPILED_DIR, '.build.json'); // per-form master hash → compile freshness

const hashFile = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function sizeSort(a, b) {
  const ia = SIZE_ORDER.indexOf(a);
  const ib = SIZE_ORDER.indexOf(b);
  if (ia !== -1 && ib !== -1) return ia - ib;
  if (ia !== -1) return -1;
  if (ib !== -1) return 1;
  return a.localeCompare(b);
}

function extractId(filename) {
  // Matches "A-002", "B-10", "AA-999", etc. at the start of the filename
  const m = filename.match(/^([A-Z]+-\d+)/);
  return m ? m[1] : null;
}

function extractSize(filename) {
  // Matches "-EXAMPLE-S.docx", "-EXAMPLE-XL.docx", etc.
  const m = filename.match(/-EXAMPLE-([^.]+)\.(docx|xlsx)$/i);
  return m ? m[1].toUpperCase() : null;
}

function scanDir(dir, filter) {
  try {
    return readdirSync(dir).filter(f => !f.startsWith('.') && /\.(docx|xlsx)$/i.test(f) && filter(f));
  } catch (err) {
    console.error(`Cannot read ${dir}: ${err.message}`);
    process.exit(1);
  }
}

const skipConvert = process.argv.includes('--no-convert');
const reconvertAll = process.argv.includes('--reconvert-all');
const CONVERT_SCRIPTS = {
  docx: join(__dirname, 'convert-template.mjs'),
  xlsx: join(__dirname, 'convert-template-xlsx.mjs'),
};

// --- Scan folders ---
const formFiles = scanDir(FORMS_DIR, f => /-FORM\.(docx|xlsx)$/i.test(f) && !f.startsWith('~'));
const formFileMap = new Map(); // id -> { filename, ext }
for (const file of formFiles) {
  const id  = extractId(file);
  const ext = file.match(/\.(docx|xlsx)$/i)?.[1].toLowerCase();
  if (id && ext) formFileMap.set(id, { filename: file, ext });
}
const formIds = new Set(formFileMap.keys());

const exampleMap = new Map(); // id -> Set<size>
for (const file of scanDir(EXAMPLES_DIR, f => /-EXAMPLE-/i.test(f))) {
  const id   = extractId(file);
  const size = extractSize(file);
  if (!id || !size) continue;
  if (!exampleMap.has(id)) exampleMap.set(id, new Set());
  exampleMap.get(id).add(size);
}

// --- Load existing manifest ---
let existing = {};
try {
  existing = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
} catch {
  console.log('No existing manifest found — creating from scratch.');
}

// --- Compile [bracket] masters (forms/) into {tag} builder copies (compiled/) ---
// Non-destructive: the master in forms/ is never modified. A docx compiles when its
// compiled copy is missing OR the master's content hash changed since the last compile
// — so a plain `sync-templates` picks up BOTH new and revised masters. --reconvert-all
// forces every form through. Manual compiled-side edits (e.g. an authored {#loop}) must
// live in the master to survive a recompile. xlsx has no compiled fill copy yet.
mkdirSync(COMPILED_DIR, { recursive: true });
let priorHashes = {};
try { priorHashes = JSON.parse(readFileSync(BUILD_META_PATH, 'utf8')); } catch { /* first run — no prior hashes */ }
const srcHash = new Map();
for (const [id, { filename, ext }] of formFileMap) {
  if (ext === 'docx') srcHash.set(id, hashFile(join(FORMS_DIR, filename)));
}
const formsToCompile = [...formIds].filter(id => {
  const { filename, ext } = formFileMap.get(id);
  if (ext !== 'docx') return false;
  if (reconvertAll) return true;
  if (!existsSync(join(COMPILED_DIR, filename))) return true; // missing → compile
  if (!(id in priorHashes)) return false;                     // no baseline yet → trust existing compiled
  return priorHashes[id] !== srcHash.get(id);                 // master content changed → recompile
});

if (!skipConvert && formsToCompile.length) {
  console.log(`\nCompiling ${formsToCompile.length} master(s) → compiled/${reconvertAll ? ' (--reconvert-all)' : ''}...\n`);
  for (const id of formsToCompile) {
    const { filename } = formFileMap.get(id);
    const dst = join(COMPILED_DIR, filename);
    console.log(`  ${id}: ${filename}`);
    copyFileSync(join(FORMS_DIR, filename), dst); // copy the master, then convert the copy in place
    const result = spawnSync('node', [CONVERT_SCRIPTS.docx, dst], { stdio: 'inherit' });
    if (result.status !== 0) {
      console.error(`  Error compiling ${id} — removing partial compiled copy, leaving it untracked.`);
      try { rmSync(dst); } catch { /* ignore */ }
      formIds.delete(id); // exclude from manifest so a broken form isn't offered
    }
  }
} else if (skipConvert && formsToCompile.length) {
  console.log(`\nSkipping compile for form(s): ${formsToCompile.join(', ')} (--no-convert)\n`);
}

// Record the master hash each compiled copy was built from (drives the freshness
// check above). Only forms whose compiled copy exists are recorded.
if (!skipConvert) {
  const newHashes = {};
  for (const [id, h] of srcHash) {
    if (formIds.has(id) && existsSync(join(COMPILED_DIR, formFileMap.get(id).filename))) newHashes[id] = h;
  }
  writeFileSync(BUILD_META_PATH, JSON.stringify(newHashes, null, 2) + '\n');
}

// --- Build updated manifest ---
const allIds = new Set([...Object.keys(existing), ...formIds, ...exampleMap.keys()]);
const manifest = {};

for (const id of [...allIds].sort()) {
  manifest[id] = {
    form:     formIds.has(id) ? formFileMap.get(id).ext : false,
    examples: exampleMap.has(id)
      ? [...exampleMap.get(id)].sort(sizeSort)
      : [],
  };
}

// --- Diff reporting ---
const added   = Object.keys(manifest).filter(id => !existing[id]);
const removed = Object.keys(existing).filter(id => !manifest[id]);
const changed = Object.keys(manifest).filter(
  id => existing[id] && JSON.stringify(manifest[id]) !== JSON.stringify(existing[id])
);

// --- Write ---
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 4) + '\n');

const total = Object.keys(manifest).length;
console.log(`\nManifest synced — ${total} entr${total === 1 ? 'y' : 'ies'} total\n`);

if (added.length)   console.log(`  Added:   ${added.join(', ')}`);
if (changed.length) console.log(`  Updated: ${changed.join(', ')}`);
if (removed.length) console.log(`  Removed: ${removed.join(', ')}`);

if (!added.length && !changed.length && !removed.length) {
  console.log('  No changes.');
}

// Warn about entries with no files at all
const orphans = Object.keys(manifest).filter(
  id => !manifest[id].form && manifest[id].examples.length === 0
);
if (orphans.length) {
  console.log(`\n  Warning: entries with no files found: ${orphans.join(', ')}`);
}

// --- Lint templates (report mode; informational, never blocks the sync) ---
if (!skipConvert) {
  console.log('\nLinting templates (report mode)...');
  spawnSync('node', [join(__dirname, 'lint-templates.mjs')], { stdio: 'inherit' });
}

console.log('');
