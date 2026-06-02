import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const trackerPath = path.join(process.cwd(), '--Artifact_Development_Tracker.xlsx');
const wb = XLSX.read(fs.readFileSync(trackerPath), { type: 'buffer' });

// Build artifact map from Tracker sheet
// Columns: #(0), Phase(1), Seq.ID(2), Artifact ID(3), Gate?(4), Depends On(5),
//          Artifact Name(6), Type(7), Classification(8), Status(9)
const trackerRows = XLSX.utils.sheet_to_json(wb.Sheets['Tracker'], { header: 1 });

const artifactMap = {};
for (const row of trackerRows.slice(2)) {
  const id = row[3];
  if (!id || !/^A-\d+$/.test(id)) continue;
  artifactMap[id] = {
    id,
    name:           row[6] ?? '',
    type:           row[7] ?? '',
    phase:          row[1] ?? '',
    seqId:          row[2] ?? '',
    gate:           row[4] === 'Y',
    classification: row[8] ?? '',
    status:         row[9] ?? '',
  };
}

// Build question map from Question Traceability sheet
// Columns: Q ID(0), Domain(1), Cat. ID(2), Category(3),
//          Named Artifacts(4), Mapped Artifact IDs(5), Mapping(6), Notes(7)
const traceRows = XLSX.utils.sheet_to_json(wb.Sheets['Question Traceability'], { header: 1 });

const questionMap = {};
for (const row of traceRows.slice(3)) {
  const qId = row[0];
  if (!qId || !/^\d+[A-Z]-\d+$/.test(qId)) continue;

  const cell = row[5] ?? '';
  const artifactIds = cell
    .split('\n')
    .map(line => { const m = line.match(/^(A-\d+)/); return m ? m[1] : null; })
    .filter(Boolean);

  questionMap[qId] = {
    domain:      row[1] ?? '',
    catId:       row[2] ?? '',
    category:    row[3] ?? '',
    artifactIds,
  };
}

// Build artifact → categories map from question traceability
const artifactCategories = {};
for (const [, qData] of Object.entries(questionMap)) {
  for (const artifactId of qData.artifactIds) {
    if (!artifactCategories[artifactId]) artifactCategories[artifactId] = new Set();
    artifactCategories[artifactId].add(qData.catId);
  }
}
for (const id of Object.keys(artifactCategories)) {
  artifactCategories[id] = [...artifactCategories[id]];
}

const output = { questionMap, artifactMap, artifactCategories };

const outPath = path.join(process.cwd(), 'src', 'data', 'traceability.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

console.log(`Done.`);
console.log(`  ${Object.keys(questionMap).length} questions mapped`);
console.log(`  ${Object.keys(artifactMap).length} artifacts indexed`);