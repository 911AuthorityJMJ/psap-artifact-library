/**
 * Single source of truth for the sub-path this app is hosted under.
 *
 * In production the app is served beneath `/artifacts` (IIS reverse-proxies
 * `/artifacts/*` to this Next server, preserving the prefix) and
 * `next.config.ts` sets `basePath` to the same value. Next automatically
 * prefixes `basePath` onto `next/link`, `next/image`, the router, and its own
 * asset URLs — but NOT onto string literals passed to `fetch()`. So client-side
 * API calls must go through `apiUrl()` to reach the right path.
 *
 * Keep this value in sync with `basePath` in `next.config.ts` (that file
 * imports BASE_PATH from here, so this constant is authoritative).
 */
export const BASE_PATH = '/artifacts';

/** Prefix an app-absolute path (e.g. `/api/parse-assessment`) with BASE_PATH. */
export function apiUrl(path: string): string {
  return `${BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`;
}
