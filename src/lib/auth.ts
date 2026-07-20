import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, type JWTPayload } from 'jose';

/**
 * Authenticated session, derived from the signed JWT that the ASP.NET site
 * issues into the `psap_session` cookie at `/ArtifactLibrary/Launch`. The
 * ASP.NET app is the sole identity authority; this app only *verifies* the
 * token — it never mints identity.
 */
export interface Session {
  /** ASP.NET Identity user id (JWT `sub`). Comes only from the validated token. */
  subject: string;
  /** Authenticated username / email (JWT `email`). */
  email: string;
  /** Display name when available (JWT `name`); may be empty. */
  name: string;
  /** ASP.NET Identity roles (JWT `roles`). */
  roles: string[];
}

const COOKIE_NAME = 'psap_session';
const DEFAULT_ISSUER = 'in911-ngsec.911authority.com';
const DEFAULT_AUDIENCE = 'psap-artifact-library';

/** Read + decode the shared HS256 signing key from PSAP_BRIDGE_SECRET (base64). */
function getSigningKey(): Uint8Array | null {
  const secret = process.env.PSAP_BRIDGE_SECRET;
  if (!secret) return null;
  const key = Buffer.from(secret, 'base64');
  // HS256 requires a 256-bit key; anything shorter is a misconfiguration.
  if (key.length < 32) return null;
  return key;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

/**
 * Resolve the caller's session, or null if unauthenticated.
 *
 * ── IDENTITY SEAM ─────────────────────────────────────────────────────────────
 * The ASP.NET site validates the OWIN cookie + role authorization, then issues a
 * short-lived HS256 JWT into the HttpOnly `psap_session` cookie. Here we ONLY
 * verify that token: signature (HS256, key from PSAP_BRIDGE_SECRET), issuer,
 * audience, `nbf`/`exp` (60s clock tolerance). Any failure → null → 401.
 * ──────────────────────────────────────────────────────────────────────────────
 */
export async function getSession(request: NextRequest): Promise<Session | null> {
  const key = getSigningKey();
  if (!key) return null;

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  let payload: JWTPayload;
  try {
    ({ payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'], // pin the algorithm — reject alg-confusion / "none"
      issuer: process.env.PSAP_TOKEN_ISS ?? DEFAULT_ISSUER,
      audience: process.env.PSAP_TOKEN_AUD ?? DEFAULT_AUDIENCE,
      clockTolerance: 60, // seconds — allows minor clock skew on nbf/exp
    }));
  } catch {
    // Malformed, expired, wrong signature, wrong algorithm, wrong issuer/audience,
    // not-yet-valid — all collapse to "no session".
    return null;
  }

  // Validate claim TYPES rather than coercing malformed values to empty strings.
  const subject = asString(payload.sub);
  if (!subject) return null; // sub is required and must be a non-empty string

  const email = asString(payload.email);
  if (email === null) return null; // present but wrong type → reject

  // name is optional; when present it must be a string.
  const rawName = payload.name;
  if (rawName !== undefined && typeof rawName !== 'string') return null;
  const name = (rawName as string | undefined) ?? '';

  // roles must be an array of strings when present.
  const rawRoles = payload.roles;
  let roles: string[] = [];
  if (rawRoles !== undefined) {
    if (!Array.isArray(rawRoles) || rawRoles.some((r) => typeof r !== 'string')) return null;
    roles = rawRoles as string[];
  }

  return { subject, email, name, roles };
}

/**
 * Gate an API route. Returns a Session when the caller may proceed, or a
 * NextResponse the handler must return immediately.
 *
 *   - PSAP_BRIDGE_SECRET set      → require a valid JWT cookie (401 otherwise).
 *   - secret unset + dev          → allow, so local dev / preview keep working.
 *   - secret unset + production   → 503: refuse to serve an unauthenticated tool.
 *
 * The prod-unset case fails *closed* on purpose: a deployed instance is never
 * accidentally wide open just because the secret wasn't configured.
 */
export async function requireAuth(request: NextRequest): Promise<Session | NextResponse> {
  const isProd = process.env.NODE_ENV === 'production';
  const key = getSigningKey();

  // Missing OR invalid (too-short) signing key = missing required configuration.
  if (!key) {
    if (isProd) {
      console.error('PSAP_BRIDGE_SECRET missing or invalid — refusing API requests in production.');
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    return { subject: 'dev', email: 'dev@local', name: 'Local Dev', roles: [] };
  }

  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session;
}
