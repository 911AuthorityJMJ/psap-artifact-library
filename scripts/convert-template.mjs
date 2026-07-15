#!/usr/bin/env node
/**
 * Convert a FORM.docx template from [Bracket Syntax] to {docxtemplaterSyntax},
 * driven by the shared field registry (src/lib/field-registry.mjs) — the single
 * source of truth for which brackets are fillable fields.
 *
 * Run: node scripts/convert-template.mjs <path-to-FORM.docx> [--dry-run]
 *
 * Behaviour:
 *  - Only DATA brackets are converted: registry aliases -> {canonicalId},
 *    clean un-curated values -> {deterministicSlug}.
 *  - INSTRUCTIONAL / IGNORE / AMBIGUOUS brackets are left literal (human-facing).
 *  - Existing {curly} tags are never touched, so the pass is idempotent and safe
 *    to re-run (already-converted forms convert nothing and are not rewritten).
 *  - Conversion is in-place; the authored [bracket] masters live in the separate
 *    authoring repo, so the site-facing copies are safe to overwrite.
 */

import PizZip from 'pizzip';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { convertBracket, classifyBracket, resolveFieldById } from '../src/lib/field-registry.mjs';

/** Innermost [brackets] only (no nested [), 1–120 chars. */
export const BRACKET_RE = /\[[^\][]{1,120}\]/g;

/**
 * Convert one XML part's text. Longest tokens first so a short token can't
 * partially match inside a longer one.
 * @param {string} content
 * @returns {{ content: string, replacements: Array<{from:string,to:string,count:number}>, literal: Map<string,string> }}
 */
export function convertXmlContent(content) {
  const tokens = [...new Set(content.match(BRACKET_RE) ?? [])].sort((a, b) => b.length - a.length);
  const replacements = [];
  const literal = new Map();
  let out = content;
  for (const raw of tokens) {
    const tag = convertBracket(raw);
    if (tag) {
      const count = out.split(raw).length - 1;
      if (count > 0) {
        out = out.split(raw).join(tag);
        replacements.push({ from: raw, to: tag, count });
      }
    } else {
      literal.set(raw, classifyBracket(raw));
    }
  }
  return { content: out, replacements, literal };
}

/**
 * Disambiguate repeated NON-shared tags so textually-identical brackets used in
 * distinct cells (e.g. four [High / Med / Low] impact columns) stay independently
 * fillable instead of collapsing onto one docxtemplater tag. The first occurrence
 * keeps the base id; later occurrences become {id2}, {id3}, … A `shared:true`
 * field (agencyName, effectiveDate, version, …) is left collapsed on purpose, and
 * tags inside a {#loop}…{/loop} region are never touched (they repeat per row).
 * @param {string} content
 * @returns {{ content: string, renames: Array<{from:string,to:string}> }}
 */
export function disambiguateRepeatedTags(content) {
  // 1) loop-region spans to skip
  const loopSpans = [];
  const loopOpen = /\{#([A-Za-z0-9_]+)\}/g;
  let lm;
  while ((lm = loopOpen.exec(content))) {
    const closeTag = `{/${lm[1]}}`;
    const close = content.indexOf(closeTag, lm.index);
    if (close >= 0) loopSpans.push([lm.index, close + closeTag.length]);
  }
  const inLoop = (idx) => loopSpans.some(([s, e]) => idx >= s && idx < e);

  // 2) every tag id already present, so a rename target never collides with an
  //    existing tag (keeps distinct cells distinct AND keeps the pass idempotent
  //    even when a doc already contains a {baseN}-shaped tag).
  const used = new Set();
  {
    const re = /\{([A-Za-z0-9_]+)\}/g;
    let mm;
    while ((mm = re.exec(content))) used.add(mm[1]);
  }

  // 3) rename non-shared repeats (# and / are excluded from the class, so loop
  //    control tags {#x}/{/x} never match and are preserved verbatim)
  const seen = new Map();
  const renames = [];
  const tagRe = /\{([A-Za-z0-9_]+)\}/g;
  let out = '';
  let last = 0;
  let m;
  while ((m = tagRe.exec(content))) {
    const [full, id] = m;
    if (inLoop(m.index)) continue;
    const shared = resolveFieldById(id)?.shared === true;
    const n = (seen.get(id) ?? 0) + 1;
    seen.set(id, n);
    if (shared || n === 1) continue;
    let k = n;
    while (used.has(`${id}${k}`)) k++;
    const newId = `${id}${k}`;
    used.add(newId);
    out += content.slice(last, m.index) + `{${newId}}`;
    last = m.index + full.length;
    renames.push({ from: id, to: newId });
  }
  out += content.slice(last);
  return { content: out, renames };
}

/**
 * Convert every word/*.xml part of a loaded docx (mutates the zip in place),
 * then disambiguate repeated non-shared tags.
 * @param {import('pizzip')} zip
 * @returns {{ totalReplaced: number, changed: boolean, replacements: Array, ambiguous: string[], renames: Array }}
 */
export function convertDocxZip(zip) {
  const xmlFiles = Object.keys(zip.files).filter((f) => f.startsWith('word/') && f.endsWith('.xml'));
  let totalReplaced = 0;
  let changed = false;
  const replacements = [];
  const literalSummary = new Map();
  const renames = [];
  for (const fileName of xmlFiles) {
    const original = zip.files[fileName].asText();
    const res = convertXmlContent(original);
    const dis = disambiguateRepeatedTags(res.content);
    const content = dis.content;
    for (const r of res.replacements) {
      replacements.push({ fileName, ...r });
      totalReplaced += r.count;
    }
    for (const [raw, cls] of res.literal) literalSummary.set(raw, cls);
    for (const r of dis.renames) renames.push({ fileName, ...r });
    if (content !== original) {
      changed = true;
      zip.file(fileName, content);
    }
  }
  const ambiguous = [...literalSummary].filter(([, c]) => c === 'ambiguous').map(([r]) => r);
  return { totalReplaced, changed, replacements, ambiguous, renames };
}

// ── CLI (only when run directly, so the linter/sync can import the helpers) ──
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const inputPath = process.argv[2];
  const dryRun = process.argv.includes('--dry-run');
  if (!inputPath) {
    console.error('Usage: node scripts/convert-template.mjs <path-to-FORM.docx> [--dry-run]');
    process.exit(1);
  }

  const zip = new PizZip(readFileSync(inputPath));
  const { totalReplaced, changed, replacements, ambiguous, renames } = convertDocxZip(zip);

  for (const r of replacements) console.log(`  ${r.fileName}: ${r.from} → ${r.to} (${r.count}x)`);
  for (const r of renames) console.log(`  ${r.fileName}: disambiguated {${r.from}} → {${r.to}}`);
  if (ambiguous.length) {
    console.log(`\n  Left literal (ambiguous — review): ${ambiguous.join(', ')}`);
  }

  if (!changed) {
    console.log('No changes (already converted / disambiguated, or nothing to convert).');
    process.exit(0);
  }
  if (dryRun) {
    console.log(`\n[dry-run] Would change ${inputPath}: ${totalReplaced} conversion(s), ${renames.length} disambiguation(s).`);
    process.exit(0);
  }
  const outputBuf = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
  writeFileSync(inputPath, outputBuf);
  console.log(`\nConverted ${totalReplaced} placeholder(s), disambiguated ${renames.length} tag(s). Saved: ${inputPath}`);
}
