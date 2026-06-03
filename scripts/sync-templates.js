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

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const FORMS_DIR     = join(ROOT, 'public/templates/forms');
const EXAMPLES_DIR  = join(ROOT, 'public/templates/examples');
const MANIFEST_PATH = join(ROOT, 'src/data/template-manifest.json');

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

// --- Convert new forms ---
// A form is "new" if the manifest didn't previously record it as form: true
const newFormIds = [...formIds].filter(id => !existing[id]?.form);

if (!skipConvert && newFormIds.length) {
  console.log(`\nConverting ${newFormIds.length} new form(s)...\n`);
  for (const id of newFormIds) {
    const { filename, ext } = formFileMap.get(id);
    const filePath = join(FORMS_DIR, filename);
    console.log(`  ${id}: ${filename}`);
    const result = spawnSync('node', [CONVERT_SCRIPTS[ext], filePath], { stdio: 'inherit' });
    if (result.status !== 0) {
      console.error(`  Error converting ${id} — skipping manifest update for this entry.`);
      formIds.delete(id); // exclude from manifest so it stays untracked until fixed
    }
  }
} else if (skipConvert && newFormIds.length) {
  console.log(`\nSkipping conversion for new form(s): ${newFormIds.join(', ')} (--no-convert)\n`);
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

console.log('');
