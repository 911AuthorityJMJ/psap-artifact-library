# PSAP Artifact Library

A web app that helps PSAPs (Public Safety Answering Points) close cybersecurity
and privacy gaps. Upload a completed assessment matrix and the app maps every
gap answer to the compliance artifacts that address it, prioritized into build
tiers — then lets you fill the document templates in the browser and download
completed `.docx` files.

Developed by 911 Authority, LLC in partnership with the Indiana Statewide 911
Board.

## What it does

- **Setup** — upload a completed assessment matrix (`.xlsx`). The app parses
  PSAP contact info and every question rated `NO`, `IN PROGRESS`, `PLANNED`,
  or `UNKNOWN` (all treated as gaps), and calibrates a PSAP profile
  (Small / Medium / Large, plus CJIS and structure flags).
- **Assessment** — gap-driven views of the artifact library: *Build Priority*
  (artifacts deduplicated and ordered by tier) and *By Question* (gaps grouped
  by domain, each linked to its artifacts).
- **Full Library** — browse, search, and filter all artifacts, no upload
  required.
- **Document Builder** — fill a `.docx` template in-app with a live preview;
  fields auto-fill from the uploaded assessment where possible. Spreadsheet
  (`.xlsx`) artifacts are downloaded and completed in Excel instead.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on **http://localhost:3002** (set in the `dev` script).

Copy `.env.example` to `.env.local` if you need to exercise auth locally —
with `APP_ACCESS_SECRET` unset, auth is bypassed in dev for convenience and
**fails closed (503) in production**. See [SECURITY.md](SECURITY.md) for the
full interim-auth and hardening story.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 3002 |
| `npm run build` | Production build (runs the strict template lint first) |
| `npm run sync-templates` | Scan `public/templates/`, compile changed masters, regenerate the manifest, validate file names |
| `npm run lint:templates` | Template coverage report (informational) |
| `npm run lint:templates:strict` | Same, but exits 1 on coverage/loop errors — this gates `build` |
| `npm run lint` | ESLint |
| `node scripts/generate-lookup.js` | Regenerate `src/data/traceability.json` from the artifact development tracker workbook |

## Template pipeline

Authored templates use human-readable `[Bracket Syntax]`; the app fills
docxtemplater `{tag}` copies. The pipeline keeps the two in sync:

```
public/templates/forms/        [bracket] masters — the reference downloads
public/templates/compiled/forms/  {tag} copies the Document Builder fills (generated)
public/templates/examples/     worked examples per profile size (S / M / L)
src/data/template-manifest.json   what each artifact offers (generated — do not hand-edit)
```

`npm run sync-templates`:

1. compiles new or changed `.docx` masters into `compiled/forms/` (content-hash
   tracked in `compiled/forms/.build.json`),
2. regenerates the manifest, recording each artifact's form format and example
   sizes/extension,
3. **validates every file name** against the stem derived from the artifact's
   display name (`src/lib/file-naming.mjs`) — a mismatched name (even by
   letter case) would 404 in production, so mismatches fail the script.

File naming: `A-002-CybersecurityPrivacyPolicy-FORM.docx`,
`A-002-CybersecurityPrivacyPolicy-EXAMPLE-S.docx`. The stem comes from
`toFileNameStem(artifact name)` — never hand-case it.

`src/lib/field-registry.mjs` is the single source of truth mapping brackets to
fillable fields (labels, input types, select options, loop row caps). See
[docs/LOOP-AND-TABLE-AUTHORING.md](docs/LOOP-AND-TABLE-AUTHORING.md) for
authoring repeating table rows.

## Project structure

```
src/app/page.tsx                  the whole UI flow (setup / assessment / library)
src/components/                   ProfileSelector, DocumentBuilder
src/app/api/parse-assessment/     parses the uploaded matrix (in-memory only)
src/app/api/template-fields/[id]/ template → builder field schema + live preview
src/app/api/generate-document/[id]/ fills and returns a completed .docx
src/lib/                          auth, rate limiting, field registry, docx tooling
src/data/                         generated lookups (traceability, manifest, tiers)
scripts/                          template pipeline + data generation
```

## Status

Local development. Production deployment, Microsoft Entra authentication, and
hosting topology are being coordinated separately — the open items are tracked
in [SECURITY.md](SECURITY.md).
