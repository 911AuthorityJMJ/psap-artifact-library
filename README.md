# PSAP Artifact Library

A web app that helps PSAPs (Public Safety Answering Points) close cybersecurity
and privacy gaps. Upload a completed assessment matrix and the app maps every
gap answer to the compliance artifacts that address it, prioritized into build
tiers — then lets you fill the document templates in the browser and download
completed `.docx` files.

Developed by 911 Authority, LLC in partnership with the Indiana Statewide 911
Board.

## Status

**Deployed in production**, served beneath the legacy ASP.NET site at
**`/artifacts`** (`https://in911-ngsec.911authority.com/artifacts`):

- **ASP.NET provides identity, authorization, and the launch flow.** It is the
  identity authority (ASP.NET Identity + OWIN cookie) and mints the short-lived
  bridge token that this app verifies.
- **IIS (URL Rewrite + ARR) reverse-proxies** requests to a **loopback Node
  service** (`127.0.0.1:3002`, run under the NSSM service `PsapArtifactLibrary`).
  The Node process is not intended to be directly internet-reachable.
- The Artifact Library remains a **separate Next.js repository and deployment**
  from the ASP.NET application.

See [SECURITY.md](SECURITY.md) for trust boundaries and remaining hardening, and
[CLAUDE.md](CLAUDE.md) for agent operating rules and the full integration paths.
(Production hosting facts are operator-reported unless inspected on the server.)

## Integration (paths & entry point)

| | |
| --- | --- |
| ASP.NET companion repo (identity authority) | `C:\dev\code\surveytool\sites\in911-ngsec.911authority.com\branches\master` |
| Next.js source (this repo) | `C:\dev\code\next.js\sites\psap-artifact-library` |
| Production Node deployment | `C:\inetpub\psap-artifact-library` |
| Public URL | `https://in911-ngsec.911authority.com/artifacts` (canonical — no trailing slash; `/artifacts/` → `/artifacts`, 308) |
| `basePath` | `/artifacts` |

The **normal production entry point is the ASP.NET Tools page**
(*Tools → PSAP Artifact Library*, available to `Administrator`/`Manager` users) —
**not** direct navigation to `/artifacts`.

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

## Authentication & access

- **The page shell is currently public** — the UI can load without an
  authenticated session.
- **Protected server operations require a valid `psap_session` session:**
  spreadsheet parsing (`/api/parse-assessment`), template-field retrieval
  (`/api/template-fields/[id]`), and document generation
  (`/api/generate-document/[id]`). Missing, invalid, or expired user sessions
  return **HTTP 401**. Missing or invalid production signing configuration returns
  **HTTP 503**.
- Auth is a **signed HS256 JWT** that ASP.NET issues into an HttpOnly
  `psap_session` cookie and that this app **only verifies** (`src/lib/auth.ts`)
  against the shared `PSAP_BRIDGE_SECRET`. Full details in [SECURITY.md](SECURITY.md).

## Getting started

> **AI agents:** do not run installs, dev servers, or builds automatically — ask
> first, per [CLAUDE.md](CLAUDE.md). The commands below are for human developers.

```bash
npm install
npm run dev
```

The dev server runs on **http://localhost:3002** (set in the `dev` script).

**Local auth.** Copy `.env.example` to `.env.local` if you need to exercise the
bridge locally. The signing key is **`PSAP_BRIDGE_SECRET`** (base64, ≥32 bytes,
and it must match the ASP.NET side). With it **unset in development, auth is
bypassed for convenience** (a synthetic dev principal in `requireAuth`); in
**production a missing or invalid secret fails closed (503)**. Do **not** copy the
real production secret into local config, and never commit secret values.

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
src/app/layout.tsx                app shell (header/footer); not auth-gated
src/components/                   ProfileSelector, DocumentBuilder
src/app/api/parse-assessment/     parses the uploaded matrix (in-memory only)
src/app/api/template-fields/[id]/ template → builder field schema + live preview
src/app/api/generate-document/[id]/ fills and returns a completed .docx
src/lib/                          auth (JWT verify), rate limiting, base-path, field registry, docx tooling
src/data/                         generated lookups (traceability, manifest, tiers)
scripts/                          template pipeline + data generation
```
