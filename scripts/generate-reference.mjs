#!/usr/bin/env node
/**
 * Derive a human-readable REFERENCE .docx from a compiled ({tag}) form: replace
 * each docxtemplater tag with a readable bracket placeholder, strip loop markers,
 * and leave instructional / « guidance » text verbatim. Used as a stopgap to give
 * a clean reference for any form that lacks a bracket master on-site (the primary
 * reference is the authored [bracketed] master in public/templates/forms/).
 *
 * Run: node scripts/generate-reference.mjs <compiled-FORM.docx> <output-FORM.docx>
 *
 *   {agencyName}          -> [Agency Name]
 *   {reviewCadence}       -> [Weekly / Monthly / Quarterly / Annually]   (enum options)
 *   {severityHml2}        -> [Severity 2]                                 (disambiguated)
 *   {#loop}…{/loop}       -> markers removed (one readable row remains)
 */

import PizZip from 'pizzip';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolveFieldForTag, humanizeTag } from '../src/lib/field-registry.mjs';

/** Transform one XML part's text: tags -> readable [placeholders]. */
export function toReferenceXml(xml) {
  return xml
    .replace(/\{[#/][A-Za-z0-9_]+\}/g, '') // strip {#loop} / {/loop} markers
    .replace(/\{([A-Za-z0-9_]+)\}/g, (_m, id) => {
      const { field, index } = resolveFieldForTag(id);
      const sfx = index > 1 ? ` ${index}` : '';
      if (!field) return `[${humanizeTag(id)}]`;
      if (field.type === 'select' && field.options?.length) return `[${field.options.join(' / ')}${sfx}]`;
      return `[${field.label}${sfx}]`;
    });
}

/** Build a reference docx buffer from a compiled docx buffer. */
export function buildReferenceDocx(buf) {
  const zip = new PizZip(buf);
  for (const name of Object.keys(zip.files)) {
    if (!name.startsWith('word/') || !name.endsWith('.xml')) continue;
    zip.file(name, toReferenceXml(zip.files[name].asText()));
  }
  return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) {
    console.error('Usage: node scripts/generate-reference.mjs <compiled-FORM.docx> <output-FORM.docx>');
    process.exit(1);
  }
  writeFileSync(output, buildReferenceDocx(readFileSync(input)));
  console.log(`Reference written: ${output}`);
}
