/**
 * Converts a FORM.docx template from [Bracket Syntax] to {docxtemplaterSyntax}.
 * Run: node scripts/convert-template.mjs <path-to-form.docx>
 *
 * Only converts known, intentional data placeholders. Instructional brackets
 * like [Add Agency-specific systems.] are left unchanged for manual editing.
 */

import PizZip from 'pizzip';
import { readFileSync, writeFileSync } from 'fs';

const REPLACEMENTS = [
  ['[Agency Name]',               '{agencyName}'],
  ['[Director / Coordinator]',    '{directorName}'],
  ['[signing official / title]',  '{signingOfficialTitle}'],
  ['[Date]',                      '{effectiveDate}'],
  ['[#]',                         '{version}'],
  ['[Owner role]',                '{ownerRole}'],
  ['[Role]',                      '{reviewerRole}'],
  ['[Initial issue]',             '{revisionNote}'],
  ['[Approving official / title]','{approvingOfficialTitle}'],
];

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node scripts/convert-template.mjs <path-to-FORM.docx>');
  process.exit(1);
}

const buf = readFileSync(inputPath);
const zip = new PizZip(buf);

const xmlFiles = Object.keys(zip.files).filter(
  f => f.startsWith('word/') && f.endsWith('.xml')
);

let totalReplaced = 0;
for (const fileName of xmlFiles) {
  let content = zip.files[fileName].asText();
  let changed = false;
  for (const [from, to] of REPLACEMENTS) {
    const count = content.split(from).length - 1;
    if (count > 0) {
      content = content.split(from).join(to);
      console.log(`  ${fileName}: [${from}] → ${to} (${count}x)`);
      totalReplaced += count;
      changed = true;
    }
  }
  if (changed) zip.file(fileName, content);
}

if (totalReplaced === 0) {
  console.log('No replacements made. Template may already be converted or use different syntax.');
  process.exit(0);
}

const outputBuf = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
writeFileSync(inputPath, outputBuf);
console.log(`\nConverted ${totalReplaced} placeholder(s). Saved: ${inputPath}`);
