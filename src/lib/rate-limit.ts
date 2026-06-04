import { NextRequest, NextResponse } from 'next/server';

/**
 * In-memory fixed-window rate limiter.
 *
 * ── DEPLOYMENT NOTE ─────────────────────────────────────────────────────────
 * Counters live in this process's memory, so limiting is *per-instance*:
 *   - Single Node server / single container  → exact global limit.
 *   - Multiple instances behind a load balancer → each instance limits
 *     independently. Total allowed traffic is (instances × limit). This still
 *     bounds load and fails safe, but is not a single global cap.
 * To enforce a global limit across instances, replace `hit()` with a shared
 * store (Redis / ElastiCache, DynamoDB, etc.) — the call sites stay the same.
 * See SECURITY.md.
 * ────────────────────────────────────────────────────────────────────────────
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Drop expired buckets once the map gets large, so it can't grow unbounded. */
function sweep(now: number): void {
  if (buckets.size < 5000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function hit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  existing.count += 1;
  return {
    allowed: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}

/**
 * Best-effort client IP from proxy headers. Only trustworthy when the app sits
 * behind a trusted proxy/load balancer (e.g. an AWS ALB) that sets
 * `x-forwarded-for`. If the app is ever directly internet-exposed, this header
 * can be spoofed to evade limits — keep it behind the LB. `NextRequest.ip` was
 * removed in Next 15, so header parsing is the portable approach.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

export interface RateLimitOptions {
  /** Distinguishes buckets per route, e.g. "parse-assessment". */
  name: string;
  limit: number;
  windowMs: number;
}

/**
 * Enforce a per-IP rate limit for a route. Returns a 429 NextResponse when the
 * caller is over the limit (the handler should return it immediately), or null
 * to proceed.
 */
export function enforceRateLimit(
  request: NextRequest,
  opts: RateLimitOptions,
): NextResponse | null {
  const ip = getClientIp(request);
  const { allowed, remaining, resetAt } = hit(`${opts.name}:${ip}`, opts.limit, opts.windowMs);
  if (allowed) return null;

  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { error: 'Too many requests. Please slow down and try again shortly.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Remaining': String(remaining),
      },
    },
  );
}
