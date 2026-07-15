#!/usr/bin/env node
/**
 * Template coverage & completeness linter for the .docx FORM templates.
 *
 * Modes:
 *   (default)  report — prints findings, ALWAYS exits 0. Safe to run while
 *              authoring and from sync-templates; never blocks the loop.
 *   --strict   gate  — exits 1 if any form has an unconverted data bracket
 *              (a coverage hole → empty field) or a malformed loop. For
 *              prebuild / CI, so nothing ships silently incomplete.
 *
 * Findings (assumes forms have already been converted):
 *   ERROR  leftover   a [bracket] still resolves to a field ⇒ the form was not
 *                     converted, or a run-split bracket the converter missed.
 *   ERROR  malformed  docxtemplater getTags() throws (e.g. an unclosed {#loop}).
 *   WARN   ambiguous  a [bracket] the registry can't place ⇒ left literal, not
 *                     fillable. Curation backlog, not a release blocker.
 *   WARN   generic    a {tag} with no curated registry entry ⇒ consider adding
 *                     one for a better label / input type.
 */

import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { classifyBracket, resolveFieldForTag, resolveLoopById } from '../src/lib/field-registry.mjs';
import { BRACKET_RE } from './convert-template.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Lint the COMPILED ({tag}) copies — forms/ is intentionally all [bracket] masters.
const FORMS_DIR = join(__dirname, '..', 'public', 'templates', 'compiled', 'forms');
const strict = process.argv.includes('--strict');

const files = readdirSync(FORMS_DIR)
  .filter((f) => /-FORM\.docx$/i.test(f) && !f.startsWith('~') && !f.startsWith('.'))
  .sort();

let errorForms = 0;
let leftoverTotal = 0;
let malformedTotal = 0;
const ambiguousSeen = new Set();
const genericSeen = new Set();

for (const file of files) {
  const path = join(FORMS_DIR, file);
  let zip;
  try {
    zip = new PizZip(readFileSync(path));
  } catch (e) {
    console.log(`✗ ${file}: cannot read (${e.message})`);
    errorForms++;
    continue;
  }

  // 1) Scan remaining [brackets]
  const brackets = new Set();
  for (const name of Object.keys(zip.files)) {
    if (!name.startsWith('word/') || !name.endsWith('.xml')) continue;
    for (const raw of zip.files[name].asText().match(BRACKET_RE) ?? []) brackets.add(raw);
  }
  const leftover = [];
  const ambiguous = [];
  for (const raw of brackets) {
    const cls = classifyBracket(raw);
    if (cls === 'field-registry' || cls === 'field-generic') leftover.push(raw);
    else if (cls === 'ambiguous') ambiguous.push(raw);
  }

  // 2) getTags → malformed loops + un-curated {tags} (disambiguated tags like
  //    severityHml2 resolve to their base field, so they're not "un-curated")
  let malformed = null;
  const generic = [];
  try {
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    const tags = doc.getTags().document?.tags ?? {};
    for (const [name, value] of Object.entries(tags)) {
      const isLoop = Object.keys((value ?? {})).length > 0;
      if (isLoop) {
        if (!resolveLoopById(name)) generic.push(`{#${name}}`);
      } else if (!resolveFieldForTag(name).field) {
        generic.push(`{${name}}`);
      }
    }
  } catch (e) {
    malformed = e.message;
  }

  const hasError = leftover.length > 0 || malformed !== null;
  if (hasError) errorForms++;
  leftoverTotal += leftover.length;
  if (malformed) malformedTotal++;
  ambiguous.forEach((a) => ambiguousSeen.add(a));
  generic.forEach((g) => genericSeen.add(g));

  if (leftover.length || malformed || ambiguous.length || generic.length) {
    console.log(`${hasError ? '✗' : '•'} ${file}`);
    if (malformed) console.log(`    ERROR  malformed loop: ${malformed}`);
    if (leftover.length) console.log(`    ERROR  ${leftover.length} unconverted data bracket(s): ${leftover.join(', ')}`);
    if (ambiguous.length) console.log(`    warn   ${ambiguous.length} ambiguous bracket(s): ${ambiguous.join(', ')}`);
    if (generic.length) console.log(`    warn   ${generic.length} un-curated tag(s): ${generic.join(', ')}`);
  }
}

console.log(`\n── Lint summary (${files.length} docx forms) ──`);
console.log(`  errors:   ${errorForms} form(s)  —  ${leftoverTotal} unconverted bracket(s), ${malformedTotal} malformed loop(s)`);
console.log(`  warnings: ${ambiguousSeen.size} distinct ambiguous bracket(s), ${genericSeen.size} distinct un-curated tag(s)`);

if (strict && errorForms) {
  console.error(`\n[strict] FAIL — ${errorForms} form(s) have coverage/loop errors.`);
  process.exit(1);
}
console.log(strict ? '\n[strict] PASS — no coverage or loop errors.' : '\n(report mode — informational; run with --strict to gate a release.)');
