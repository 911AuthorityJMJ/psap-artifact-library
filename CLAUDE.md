@AGENTS.md

# CLAUDE.md — PSAP Artifact Library (Next.js)

Agent operating context for this repository. The `@AGENTS.md` include above still
applies: **this is not the Next.js you know** — read the relevant guide in
`node_modules/next/dist/docs/` before writing code.

The companion architecture document for the **ASP.NET side** of the integration is
authoritative for that tier and should be consulted alongside this file:
`C:\dev\code\surveytool\sites\in911-ngsec.911authority.com\branches\master\CLAUDE.md`.

## Project relationship & paths

- This is a **separate Git repository** from the legacy ASP.NET MVC application.
  The two repositories now form **one integrated production system**.
- **Next.js source:** `C:\dev\code\next.js\sites\psap-artifact-library`
- **ASP.NET source & identity authority:** `C:\dev\code\surveytool\sites\in911-ngsec.911authority.com\branches\master`
- **Production Node deployment:** `C:\inetpub\psap-artifact-library`
- **Public URL:** `https://in911-ngsec.911authority.com/artifacts`
- The app sets **`basePath: '/artifacts'`** (`next.config.ts` imports it from
  `src/lib/base-path.ts`).
- The **canonical URL has no trailing slash**; `/artifacts/` redirects to
  `/artifacts` (HTTP 308).

## Current authentication architecture

- **ASP.NET Identity and its OWIN cookie remain the identity authority.** This app
  never mints identity — it only verifies a token ASP.NET issues.
- Only ASP.NET users in the **`Administrator`** or **`Manager`** role can use the
  launch endpoint (`GET /ArtifactLibrary/Launch` on the ASP.NET site).
- ASP.NET mints a **short-lived HS256 JWT** and stores it in an **HttpOnly cookie
  named `psap_session`**, **scoped to `/artifacts`**.
- The signing key comes from the **machine-level `PSAP_BRIDGE_SECRET`** environment
  variable (shared by the IIS app pool and the NSSM Node service).
- **ASP.NET is the designated issuer.** The current Next.js implementation uses the
  shared HS256 secret **only to verify** tokens (`src/lib/auth.ts`, `jose.jwtVerify`).
  Because **HS256 is symmetric**, issuer/verifier separation is an **implementation
  responsibility, not a cryptographically enforced limitation** — anyone holding the
  secret could also sign. (An asymmetric scheme such as RS256/ES256 would be needed
  to enforce the split in cryptography; it is not used today.)
- **Do not display, regenerate, rotate, or expose the secret**, and never place its
  value in documentation, source, or chat.

### Access distinction (be precise)

- The **ASP.NET launch flow** is restricted to **`Administrator` and `Manager`**.
- The **three protected Next.js API operations** require a valid `psap_session`:
  `POST /api/parse-assessment`, `GET /api/template-fields/[id]`, and
  `POST /api/generate-document/[id]`.
- The **Next.js page shell itself is not currently access-gated** (no middleware,
  no page-level guard).
- A **direct unauthenticated visit can load the UI**, but protected operations
  return **HTTP 401**.
- **Missing production signing configuration fails closed with HTTP 503.**
- **Logout semantics.** ASP.NET logout expires the browser's `psap_session` cookie,
  ending normal browser access immediately. The JWT itself is stateless and is not
  placed on a revocation list; if independently copied, it remains cryptographically
  valid until its 30-minute expiration. Returning through *Tools → PSAP Artifact
  Library* mints a fresh token.
- The user has observed **"Failed to fetch"** when attempting an unauthenticated
  upload, although the API is **expected to return a JSON 401** response. The exact
  discrepancy has **not yet been reproduced or diagnosed**; treat it as an open
  UX/integration item, **not** an authentication bypass.

## Current production topology

*Operator-reported unless inspected directly on the server; these hosts are not
reachable from the development environment.*

- **IIS URL Rewrite + ARR** proxy `/artifacts/*` to **`127.0.0.1:3002`**.
- **Node binds to loopback only** — not intended to be directly internet-reachable.
- Production runs through the **NSSM service `PsapArtifactLibrary`**.
- Production working directory: **`C:\inetpub\psap-artifact-library`**.
- **Do not modify or restart the production service without approval.**

## Operating rules for agents

- **Do not commit automatically.**
- **Do not push or deploy automatically.**
- **Do not run either site without asking** — no `next dev`, `next start`, IIS
  Express, or any other local server.
- **Do not run `npm install`/`npm ci`, a Next.js build, or change dependencies
  without asking.**
- **Inspect and report before changing application code.**
- **Preserve the working production baseline and the rollback path.**
- **Keep changes small; use explicit Git checkpoints only after approval.**
- **Coordinate integration changes with the ASP.NET repository and its `CLAUDE.md`.**

## Not implemented (do not assume these exist)

None of the following exist yet:

- Upload persistence
- Saved assessments
- Saved drafts
- Per-user document libraries
- Agency-wide sharing
- Artifact Library database changes
- Agency or tenant authorization inside Next.js

Uploads are processed **in memory per request**. The JWT carries the ASP.NET
Identity user id in `sub`, but **no artifact data is persisted or scoped by it**.

**Persistence is not designed here.** Storage ownership and tenant design require a
**separate design review** — do not prescribe or assume a persistence architecture.
