import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

export interface Session {
  /**
   * Stable identifier for the authenticated principal. Interim shared-secret
   * auth uses a single principal; per-user auth (Entra) will put the user's
   * id/email here so routes and logs can attribute requests.
   */
  subject: string;
}

const COOKIE_NAME = 'psap_access';

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * Resolve the caller's session, or null if unauthenticated.
 *
 * ── SEAM ────────────────────────────────────────────────────────────────────
 * This is the single place to swap interim shared-secret auth for the real
 * identity provider (Microsoft Entra via OIDC). When that lands, replace the
 * body with "validate the OIDC session/JWT and return { subject: <user id> }".
 * `requireAuth` and every route handler stay exactly as they are.
 * ────────────────────────────────────────────────────────────────────────────
 */
export function getSession(request: NextRequest): Session | null {
  const secret = process.env.APP_ACCESS_SECRET;
  if (!secret) return null;

  // Interim: accept the shared secret via `Authorization: Bearer <secret>`
  // or a `psap_access` cookie. Compared in constant time.
  const authHeader = request.headers.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const cookie = request.cookies.get(COOKIE_NAME)?.value ?? null;
  const presented = bearer ?? cookie;

  if (presented && safeEqual(presented, secret)) {
    return { subject: 'shared' };
  }
  return null;
}

/**
 * Gate an API route. Returns a Session when the caller may proceed, or a
 * NextResponse the handler must return immediately.
 *
 *   - APP_ACCESS_SECRET set    → require a valid credential (401 otherwise).
 *   - secret unset + dev       → allow, so local dev / preview keep working.
 *   - secret unset + production → 503: refuse to serve an unauthenticated tool.
 *
 * The prod-unset case fails *closed* on purpose: a deployed instance is never
 * accidentally wide open just because the secret wasn't configured.
 */
export function requireAuth(request: NextRequest): Session | NextResponse {
  const secret = process.env.APP_ACCESS_SECRET;
  const isProd = process.env.NODE_ENV === 'production';

  if (!secret) {
    if (isProd) {
      console.error('APP_ACCESS_SECRET is not set — refusing API requests in production.');
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    return { subject: 'dev' };
  }

  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session;
}
