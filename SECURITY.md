# Security notes

How this app handles untrusted input, what's been hardened, the trust boundaries
of the ASP.NET ↔ Next.js integration, and what remains as future hardening. The
app is **already publicly reachable** through the production ASP.NET domain at
`/artifacts`, so this is a live-system document, not a pre-launch checklist.

## Data handling

The app ingests an uploaded `.xlsx` assessment matrix and fills `.docx`
templates. Uploaded data (agency name, director contact details, and the
agency's security-gap answers) is **processed in-memory per request and never
persisted or logged** — only error objects are logged, never request payloads.
There is **no persistence** on this tier (see "Not implemented").

## Trust boundary (ASP.NET is the identity authority)

Identity is owned by the **ASP.NET SurveyTool site**; this app never mints
identity and only **verifies** a token ASP.NET issues.

- **Launch is role-gated on the ASP.NET side.** A user in the `Administrator` or
  `Manager` role opens *Tools → PSAP Artifact Library*, which hits
  `GET /ArtifactLibrary/Launch` on the ASP.NET app. That endpoint validates the
  OWIN cookie + role, mints a **short-lived (30 min) HS256 JWT**, writes it to an
  **HttpOnly, `Secure` (over the production HTTPS flow), `SameSite=Lax`,
  `Path=/artifacts`** cookie named **`psap_session`**, and 302-redirects to
  `/artifacts/` (which canonicalizes to `/artifacts`).
- **This app validates the token** (`getSession()` via `jose.jwtVerify`):
  algorithm pinned to **`HS256`**, explicit **issuer** and **audience** checks,
  **signature**, **`exp`** and **`nbf`** (60s clock tolerance), and **required-claim
  type validation** (`sub` must be a non-empty string; `email`/`name`/`roles` are
  type-checked). Any failure (missing / malformed / expired / not-yet-valid /
  wrong-signature / wrong-algorithm / wrong-issuer / wrong-audience) → `null` → **401**.
- **Symmetric-key model — read carefully.** The signing key is the shared
  **`PSAP_BRIDGE_SECRET`** (base64, ≥32 bytes), sourced from a machine-level
  environment variable that both the IIS app pool and the NSSM Node service inherit.
  The current Next.js implementation uses this secret **only for verification**, but
  because **HS256 is symmetric the same key can also sign** — anyone holding the
  secret could mint tokens. Keeping "ASP.NET issues, Next.js only verifies" true is
  therefore an **implementation responsibility, not a cryptographic guarantee**.
  This app does **not** hold a public verification key; do not describe it as doing
  so. (Enforcing the split in cryptography would require an asymmetric scheme such
  as RS256/ES256, which is not used today.)
- **Fail-closed in production.** If `PSAP_BRIDGE_SECRET` is missing or invalid,
  every protected API call returns **503**. Unset in development → auth is bypassed
  (a synthetic dev principal), for local convenience only.
- **Logout.** ASP.NET logout expires the browser's `psap_session` cookie, ending
  normal browser access immediately. The JWT itself is stateless and is not placed
  on a revocation list; if independently copied, it remains cryptographically valid
  until its 30-minute expiration. There is **no silent-renewal flow**: revisiting
  *Tools → PSAP Artifact Library* mints a fresh 30-minute token.
- **`sub` is present but unused for storage.** The token carries the ASP.NET
  Identity user id (`sub`), plus `email`, `name`, and `roles`. `sub` is retained for
  possible future per-user work; **no artifact data is persisted or scoped by it in
  Stage 1**.

### Page-versus-API gating

- The **page shell is authentication-gated** as defense in depth: `src/app/page.tsx`
  is a Server Component that verifies the `psap_session` session (`getPageAuth()`)
  before rendering the client UI (`src/app/HomeClient.tsx`). No valid session → an
  **"Authentication required"** page (never the upload UI); production signing
  config missing → an **"Artifact Library unavailable"** page (fail closed). In
  development with the secret unset, a synthetic dev principal is returned so the
  app runs standalone (see README "Standalone development").
- The **three API operations remain the authoritative gate** and are protected
  independently because they can be called directly: `POST /api/parse-assessment`,
  `GET /api/template-fields/[id]`, `POST /api/generate-document/[id]`. Their
  `requireAuth()` checks are unchanged.
- The earlier generic **"Failed to fetch"** on an unauthenticated upload is now
  **handled in the client** (`HomeClient`): 401, 503, a network-level fetch
  rejection, and other non-OK responses each map to a specific, actionable message,
  so the raw browser text is no longer shown. The UX is corrected **regardless of
  the underlying cause** — a network-level rejection is surfaced generically rather
  than root-caused — and it was never an authentication bypass (the APIs still fail
  closed server-side).

## Implemented controls

### Request order in each API route
All three routes run **`enforceRateLimit` first, then `requireAuth`**, before doing
any work (verified in the route sources). A rate-limited caller receives **429**
before authentication is evaluated; an unauthenticated caller that is within the
rate limit receives **401** (or **503** if the production secret is unconfigured).

### Dependencies
- **`xlsx` is aliased to the maintained fork `@e965/xlsx`, pinned at `0.20.3`**
  (`"xlsx": "npm:@e965/xlsx@0.20.3"` in `package.json`) rather than the npm
  registry's frozen SheetJS `0.18.5`. The `0.20.3` line addresses the
  prototype-pollution (GHSA-4r6h-8v6p-xvw6) and ReDoS (GHSA-5pgg-2g8v-p4x9)
  advisories. Because it is a registry alias (not the base `xlsx` package),
  advisory tooling may attribute findings differently — **treat exact
  `npm audit` status as requiring a separate dependency review** (this document
  does not run audits).

### Upload endpoint (`/api/parse-assessment`)
- Rejects requests whose `Content-Length` exceeds ~266 KB before buffering, and
  enforces the same bound **during** the streamed read (so a chunked body with no
  `Content-Length` can't bypass it).
- Rejects files over **250 KB** (`MAX_FILE_BYTES`) and any file not ending in
  `.xlsx`. The client-side `accept=".xlsx"` is cosmetic and is not relied on.

### Template routes (`/api/template-fields/[id]`, `/api/generate-document/[id]`)
- The `[id]` segment is validated against the artifact-id shape **and** checked
  with `Object.hasOwn` (in `src/lib/templates.ts`), so inherited keys
  (`__proto__`, `constructor`, …) cannot satisfy the lookup. The on-disk path is
  rebuilt from trusted library data, so no traversal is possible via `id`.
- Both handlers are wrapped in `try/catch` and return generic errors.
- `generate-document` rejects oversized JSON bodies, and **allow-lists** the
  submitted fields against the tags the template actually declares, coercing
  values to strings and capping length (`sanitizeFields`). Loop rows are bounded
  (per-loop cap plus a global leaf cap) and object depth is fixed, so the client
  cannot push unexpected or non-scalar data into the renderer.

### Response headers (`next.config.ts`)
- CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`,
  `Referrer-Policy`, `Permissions-Policy`, and (in production) HSTS. The CSP
  `frame-ancestors 'self'` (with `X-Frame-Options: SAMEORIGIN`) lets the
  same-origin ASP.NET Tools page embed `/artifacts` in a modal iframe while still
  blocking third-party framing.
- `X-Powered-By` is disabled.
- docxtemplater runs with the **default parser** (no `angular-expressions`), so
  template values are XML-escaped and not evaluated as expressions.

### Rate limiting (`src/lib/rate-limit.ts`)
- Per-IP fixed windows: **parse-assessment 30 / 5 min**, **generate-document
  60 / 5 min**, **template-fields 120 / 5 min**; over-limit returns **429** with
  `Retry-After`. Client IP is taken from `x-forwarded-for` / `x-real-ip`, which is
  only trustworthy behind a trusted proxy (here, IIS on loopback).
- **In-memory ⇒ per-instance.** Counters live in the process, so limiting is exact
  for the single production Node instance; it would become per-instance if the
  deployment ever scaled out (see the deployment note in `rate-limit.ts`).

## Current hosting & deployment security

*Operator-reported unless inspected directly on the server.*

- **Same-origin `/artifacts` deployment**: the Next.js app is served beneath the
  ASP.NET site via **IIS URL Rewrite + ARR**, which proxies `/artifacts/*` to the
  Node process. `basePath: '/artifacts'` keeps the prefix intact.
- **Node binds only to `127.0.0.1:3002`** (NSSM service `PsapArtifactLibrary`);
  there is **no intended direct public Node exposure** — all public traffic arrives
  through IIS.
- The signing secret is a **machine-level environment variable inherited by both
  IIS (app pool) and the NSSM service**; both tiers must read the same value.
- **Fail-closed** when either tier cannot obtain the secret: ASP.NET issues no token
  (its launch returns 500), and Next.js returns 503 on protected APIs.
- **No production secret values** appear in documentation or source, and the
  production service must not be modified or restarted without approval.

## Current remaining hardening & future decisions

None of the following are approved changes — they are open items to weigh, scoped
to the current IIS + ARR + NSSM + loopback-Node deployment on Windows Server:

- ~~**Whether to gate the page shell itself**~~ — **implemented.** The page shell
  is now authentication-gated at the Server Component level (see "Page-versus-API
  gating"); the API routes remain the authoritative enforcement.
- ~~**Better UI handling of 401 / 503 / expired sessions**~~ — **implemented.** The
  upload path maps 401 / 503 / network / other non-OK responses to clear messages
  (see "Page-versus-API gating").
- **Root-cause the "Failed to fetch" network path (open).** The client no longer
  surfaces the raw browser text, but the *underlying* reason an unauthenticated
  upload could reject at the network level (rather than return a JSON 401) has
  still not been confirmed via browser network inspection. The diagnosis remains
  open even though the UX is handled.
- **CSRF (defense in depth).** Authentication is already cookie-based. `SameSite=Lax`
  on `psap_session` provides meaningful cross-site protection, but the multipart
  upload route (no preflight) may still merit an explicit **Origin/Referer check**.
  This is a potential hardening item, **not proof of a current exploit** — confirm
  the exact behavior before implementing.
- **Rate-limit storage** only if production later becomes multi-instance — move
  `hit()` to a shared store; call sites don't change. Not needed for the single
  loopback instance today.
- **Tenant / IDOR controls** — only relevant **if persistence is ever introduced**.
  Nothing is stored today; do not build tenant scoping speculatively (see
  "Not implemented").
- **Keep CORS same-origin** (default). Do not add `Access-Control-Allow-Origin: *`.
- **Dependency review** — periodically re-check advisories (notably the `xlsx`
  fork and transitive `postcss`); see "Known / accepted".
- **CSP nonce tradeoff** — see "Known / accepted".

## Not implemented

The following do **not** exist yet and must not be documented as present:
upload persistence, saved assessments, saved drafts, per-user document libraries,
agency-wide sharing, Artifact Library database changes, and agency/tenant
authorization inside Next.js. **Storage ownership and tenant design require a
separate design review** — this document does not prescribe a persistence
architecture.

## Known / accepted

- **Dependency audit (current local audit):** `npm audit` reports **0
  vulnerabilities**, for the full tree and for `--omit=dev` alike. Dependabot
  alerts and Dependabot security updates are both enabled on the repository, and
  `.github/dependabot.yml` adds weekly `npm` version updates on top of them.
- **Do not reintroduce an `overrides` pin for `postcss`.** One was added on
  2026-07-15 by automated review tooling as `overrides.next.postcss` = `8.5.10`,
  at a point when Next 16.2.7 shipped `postcss` 8.4.31 and the pin was a genuine
  bump for GHSA-qx2v-qp2m-jg93. Next 16.3.0 ships `postcss` 8.5.23, so the pin
  silently inverted into a 13-patch downgrade and reintroduced
  GHSA-6g55-p6wh-862q and GHSA-r28c-9q8g-f849 (both high) plus
  GHSA-fxqj-rqcc-2cmp. **Dependabot cannot patch a transitive version that an
  `overrides` entry pins**, so those alerts stayed open even after it bumped
  every unpinned `postcss` copy in the tree. Upgrade the parent package rather
  than pinning its transitive dependency.
- **CSP `script-src 'unsafe-inline'`**: for a strict policy, switch to per-request
  nonces via `proxy.ts` (see
  `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`, which
  is present for this Next version). That forces dynamic rendering, so it is a
  deliberate tradeoff rather than a default.
