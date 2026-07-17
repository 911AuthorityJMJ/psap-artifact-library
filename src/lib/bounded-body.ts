import { NextRequest } from 'next/server';

/**
 * Read a request body into memory while enforcing `maxBytes` DURING the read.
 *
 * A Content-Length check alone is bypassable: a chunked request carries no
 * Content-Length header, and by the time `request.json()` / `request.formData()`
 * returns, the whole body has already been buffered. This helper is the shared
 * guard for every route that buffers a body — it fails the request at the first
 * byte past the cap, so an unbounded stream can never exhaust memory.
 */
export type BoundedBody =
  | { ok: true; bytes: Buffer }
  | { ok: false; status: number; error: string };

export async function readBodyBounded(
  request: NextRequest,
  maxBytes: number,
): Promise<BoundedBody> {
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) {
    return { ok: false, status: 413, error: 'Request body too large' };
  }
  const body = request.body;
  if (!body) {
    // No body stream at all (e.g. empty request) — nothing to bound.
    return { ok: true, bytes: Buffer.alloc(0) };
  }
  const reader = body.getReader();
  const chunks: Buffer[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      // Best-effort: cancellation failure must not mask the 413.
      await reader.cancel().catch(() => {});
      return { ok: false, status: 413, error: 'Request body too large' };
    }
    chunks.push(Buffer.from(value));
  }
  return { ok: true, bytes: Buffer.concat(chunks) };
}
