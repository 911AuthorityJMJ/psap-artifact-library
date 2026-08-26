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

- **The page shell is authentication-gated.** `src/app/page.tsx` is a Server
  Component that checks the `psap_session` session (via `getPageAuth()` in
  `src/lib/auth.ts`) before rendering the interactive UI (`src/app/HomeClient.tsx`).
  It resolves to one of three states:
  - **Authenticated** → the full Setup / Assessment / Library UI.
  - **Missing / invalid / expired session** → an **"Authentication required"**
    page linking to the ASP.NET launch endpoint (`/ArtifactLibrary/Launch`) —
    not the upload interface.
  - **Production signing configuration unavailable** → an **"Artifact Library
    unavailable"** page (fail closed; no sign-in prompt).
- **Protected server operations independently require a valid `psap_session`
  session:** spreadsheet parsing (`/api/parse-assessment`), template-field
  retrieval (`/api/template-fields/[id]`), and document generation
  (`/api/generate-document/[id]`). Missing, invalid, or expired sessions return
  **HTTP 401**; missing or invalid production signing configuration returns
  **HTTP 503**. These `requireAuth()` checks are unchanged and remain the
  authoritative server-side gate — the page gate is defense in depth.
- Auth is a **signed HS256 JWT** that ASP.NET issues into an HttpOnly
  `psap_session` cookie and that this app **only verifies** (`src/lib/auth.ts`)
  against the shared `PSAP_BRIDGE_SECRET`. Full details in [SECURITY.md](SECURITY.md).
- **In local development with `PSAP_BRIDGE_SECRET` unset, both the page gate and
  the APIs bypass auth** (a synthetic dev principal), so the app runs fully
  standalone — see [Standalone development](#standalone-development-without-the-aspnet-site).

## Getting started

> **AI agents:** do not run installs, dev servers, or builds automatically — ask
> first, per [CLAUDE.md](CLAUDE.md). The commands below are for human developers.

```bash
npm install
npm run dev
```

The dev server runs on **http://localhost:3002**. Because the app sets
`basePath: '/artifacts'`, open **http://localhost:3002/artifacts** — the bare
`http://localhost:3002/` root is not served.

**Local auth.** Copy `.env.example` to `.env.local` if you need to exercise the
bridge locally. The signing key is **`PSAP_BRIDGE_SECRET`** (base64, ≥32 bytes,
and it must match the ASP.NET side). With it **unset in development, auth is
bypassed for convenience** — a synthetic dev principal is returned by both
`requireAuth` (APIs) and `getPageAuth` (the page shell), so the full UI loads and
uploads/builds work. In **production a missing or invalid secret fails closed
(503)**. Do **not** copy the real production secret into local config, and never
commit secret values.

### Standalone development (without the ASP.NET site)

The Artifact Library is a standard Next.js app and **runs entirely on its own** —
no ASP.NET MVC site, IIS, Windows, or SQL Server required. This is the normal way
to develop it (for example, on macOS).

```bash
npm install
npm run dev
# then open http://localhost:3002/artifacts
```

- **Leave `PSAP_BRIDGE_SECRET` unset** (don't create `.env.local`, or leave the
  value blank). In development with no signing key, the page gate and all three
  protected APIs return a synthetic **`dev`** principal, so you get the full UI and
  can upload an assessment, browse the library, and build documents without any
  session cookie. You will **not** hit the "Authentication required" page in this
  mode.
- The "Authentication required" / "Artifact Library unavailable" pages, the
  `psap_session` cookie, and the `/ArtifactLibrary/Launch` link only apply to the
  **integrated deployment** (below). That launch link targets the ASP.NET site and
  will 404 in standalone dev — expected; it isn't part of the standalone flow.
- **Everything except the auth bridge is self-contained:** the template pipeline
  (`npm run sync-templates`), data generation, and the Document Builder need no
  external services. Uploads are processed in memory; there is no database.
- **To exercise the real bridge locally** (optional, rarely needed): set a
  matching `PSAP_BRIDGE_SECRET` in `.env.local`. Auth then enforces, but because
  only ASP.NET mints `psap_session`, a browser with no valid cookie sees the
  "Authentication required" page and the APIs return 401. Use this only to test the
  verification/error paths, not for normal feature work.

### Integrated (production) authentication

In production the app is served beneath the ASP.NET site at `/artifacts`, and the
ASP.NET site is the identity authority. End-to-end:

1. A user signs into the ASP.NET SurveyTool site (OWIN cookie).
2. An `Administrator`/`Manager` opens **Tools → PSAP Artifact Library**, which
   opens a near-full-screen modal whose iframe loads `GET /ArtifactLibrary/Launch`.
3. That endpoint role-checks the user, mints a 30-minute HS256 JWT, sets the
   HttpOnly `psap_session` cookie (`Path=/artifacts`, `SameSite=Lax`, `Secure` over
   HTTPS), and redirects the iframe to `/artifacts`.
4. The page gate verifies the cookie and renders the UI; client `fetch()` calls
   carry the cookie and pass `requireAuth()`.
5. Reopening the modal re-runs the launch endpoint and refreshes the session; the
   iframe `src` is cleared to `about:blank` on close. ASP.NET logout expires the
   cookie, ending access immediately.

The same-origin modal iframe is why the framing headers are
`X-Frame-Options: SAMEORIGIN` and CSP `frame-ancestors 'self'` (third-party
framing stays blocked). See [SECURITY.md](SECURITY.md) for the full trust boundary.

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
src/app/page.tsx                  server-side auth gate → HomeClient / auth-required / unavailable
src/app/HomeClient.tsx            the whole client UI flow (setup / assessment / library)
src/app/layout.tsx                minimal document shell + footer (header removed)
src/components/                   ProfileSelector, DocumentBuilder
src/app/api/parse-assessment/     parses the uploaded matrix (in-memory only)
src/app/api/template-fields/[id]/ template → builder field schema + live preview
src/app/api/generate-document/[id]/ fills and returns a completed .docx
src/lib/                          auth (JWT verify), rate limiting, base-path, field registry, docx tooling
src/data/                         generated lookups (traceability, manifest, tiers)
scripts/                          template pipeline + data generation
```
