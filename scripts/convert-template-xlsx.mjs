/**
 * Converts a FORM.xlsx template from [Bracket Syntax] to {docxtemplaterSyntax}.
 * Run: node scripts/convert-template-xlsx.mjs <path-to-form.xlsx>
 *
 * Only converts known, intentional data placeholders. Instructional brackets
 * like [Allocation summary.] are left unchanged for manual editing.
 */

import * as XLSX from 'xlsx';
import { readFileSync, writeFileSync } from 'fs';

const REPLACEMENTS = [
  ['[Agency Name]',                '{agencyName}'],
  ['[Director / Coordinator]',     '{directorName}'],
  ['[signing official / title]',   '{signingOfficialTitle}'],
  ['[Date]',                       '{effectiveDate}'],
  ['[#]',                          '{version}'],
  ['[Owner role]',                 '{ownerRole}'],
  ['[Role]',                       '{reviewerRole}'],
  ['[Initial issue]',              '{revisionNote}'],
  ['[Approving official / title]', '{approvingOfficialTitle}'],
];

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node scripts/convert-template-xlsx.mjs <path-to-FORM.xlsx>');
  process.exit(1);
}

const buf = readFileSync(inputPath);
const wb = XLSX.read(buf, { type: 'buffer', cellStyles: true });

let totalReplaced = 0;

for (const sheetName of wb.SheetNames) {
  const ws = wb.Sheets[sheetName];
  for (const cellAddr of Object.keys(ws).filter(k => !k.startsWith('!'))) {
    const cell = ws[cellAddr];
    if (cell.t !== 's' || typeof cell.v !== 'string') continue;

    let value = cell.v;
    for (const [from, to] of REPLACEMENTS) {
      const count = value.split(from).length - 1;
      if (count > 0) {
        value = value.split(from).join(to);
        console.log(`  ${sheetName}!${cellAddr}: [${from}] → ${to} (${count}x)`);
        totalReplaced += count;
      }
    }
    if (value !== cell.v) {
      cell.v = value;
      cell.w = value;
      if (cell.h) cell.h = value;
    }
  }
}

if (totalReplaced === 0) {
  console.log('No replacements made. Template may already be converted or use different syntax.');
  process.exit(0);
}

const outputBuf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
writeFileSync(inputPath, outputBuf);
console.log(`\nConverted ${totalReplaced} placeholder(s). Saved: ${inputPath}`);
