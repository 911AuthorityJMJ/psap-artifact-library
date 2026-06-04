# Security notes

How this app handles untrusted input, what's been hardened, and what still
needs to happen before it goes public-facing.

## Data handling

The app ingests an uploaded `.xlsx` assessment matrix and fills `.docx`
templates. Uploaded data (agency name, director contact details, and the
agency's security-gap answers) is **processed in-memory per request and never
persisted or logged** — only error objects are logged, never request payloads.

## Implemented controls

### Dependencies
- `xlsx` is pinned to the patched SheetJS build from the official CDN
  (`https://cdn.sheetjs.com/xlsx-0.20.3/...`), not the npm registry's frozen
  `0.18.5`. This closes the prototype-pollution (GHSA-4r6h-8v6p-xvw6) and ReDoS
  (GHSA-5pgg-2g8v-p4x9) advisories. **CI must be able to reach `cdn.sheetjs.com`.**
  `npm audit` no longer tracks `xlsx` because it's a URL dependency — re-check it
  manually against https://cdn.sheetjs.com/ periodically.

### Upload endpoint (`/api/parse-assessment`)
- Rejects requests whose `Content-Length` exceeds ~266 KB before buffering.
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
  values to strings and capping length (`sanitizeFields`). The client cannot
  push unexpected or non-scalar data into the renderer.

### Response headers (`next.config.ts`)
- CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy`, `Permissions-Policy`, and (in production) HSTS.
- `X-Powered-By` is disabled.
- docxtemplater runs with the **default parser** (no `angular-expressions`), so
  template values are XML-escaped and not evaluated as expressions.

### Authentication & rate limiting (interim)
- All three `/api` routes call `requireAuth` (`src/lib/auth.ts`) then
  `enforceRateLimit` (`src/lib/rate-limit.ts`) before doing any work.
- **Auth is fail-closed in production**: with `APP_ACCESS_SECRET` set, requests
  must present it (`Authorization: Bearer <secret>` or a `psap_access` cookie,
  constant-time compared). Unset in production → 503; unset in dev → open, for
  local convenience. `getSession()` is the single seam to replace with Entra
  OIDC; the route handlers won't change.
- **Rate limits** are per-IP fixed windows: parse-assessment 30 / 5 min,
  generate-document 60 / 5 min, template-fields 120 / 5 min, returning 429 with
  `Retry-After`. In-memory ⇒ per-instance (see the deployment note in
  `rate-limit.ts`).

## Before going public-facing — remaining

Gating the UI is **not enough** — the API routes are protected independently
(above) because they can be called directly. Still to finalize:

- [ ] **Wire Microsoft Entra (OIDC)** by replacing `getSession()` in
      `src/lib/auth.ts`. Once it returns per-user identities, key rate limits
      per-user and retire `APP_ACCESS_SECRET`.
- [ ] **Pick the rate-limit store for the AWS topology.** Single instance →
      in-memory is fine. Multiple instances / Lambda → move `hit()` to a shared
      store (ElastiCache Redis or DynamoDB); call sites don't change.
- [ ] **CSRF**: once auth is cookie-based, the multipart upload is CSRF-reachable
      (no preflight). Use `SameSite=Lax/Strict` cookies + an Origin/Referer check
      (Entra's OIDC flow + a session cookie covers most of this).
- [ ] **Body-size backstop**: optionally set `experimental.proxyClientMaxBodySize`
      (requires a `proxy.ts`) and/or an ALB request-size limit. Note it
      *truncates* rather than rejects, so it complements — doesn't replace — the
      in-route `Content-Length`/`file.size` check.
- [ ] **If uploaded assessments ever become persisted**, add per-tenant
      authorization (avoid IDOR on assessment IDs). Nothing is stored today.
- [ ] Keep CORS closed (same-origin default). Do not add `Access-Control-Allow-Origin: *`.

## Integration details needed (to wire Entra + finalize hosting)

Questions for the infrastructure/tech owner — answering these unblocks the real
auth wiring and the rate-limit store choice:

**Microsoft Entra**
- Which tenant, and an App Registration: client ID, client secret (or cert), and
  the redirect URI(s) for the deployed domain.
- How do **external** users (PSAP staff, not 911 Authority employees) sign in —
  as guests in the corporate tenant, or via an Entra External ID (CIAM) / B2C
  tenant? This sets the OIDC authority and whether an invite/signup flow is needed.
- Authorization model: allowlist specific users/groups, or anyone who
  authenticates? Any group/role claims to gate on?
- Expected session lifetime and sign-out behavior.

**AWS hosting**
- Hosting model: single EC2/container, ECS/Fargate with N tasks behind an ALB,
  or Lambda? (Decides whether in-memory rate limiting is sufficient.)
- Is the app strictly behind the ALB, so `x-forwarded-for` is trustworthy and the
  instance isn't directly reachable?
- Where will secrets live (AWS Secrets Manager / SSM Parameter Store)? — for
  `APP_ACCESS_SECRET` now and the Entra client secret later.
- TLS termination point (ALB / CloudFront), so HSTS and `Secure` cookies apply.

## Known / accepted

- `npm audit` reports 2 moderate `postcss` issues pulled in transitively by Next
  itself; the only "fix" is downgrading Next to v9, so it's accepted until Next
  updates its bundled `postcss`.
- The CSP uses `script-src 'unsafe-inline'`. For a strict policy, switch to
  per-request nonces via `proxy.ts` (see
  `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`).
  This forces dynamic rendering, so it's a deliberate tradeoff rather than a
  default.
