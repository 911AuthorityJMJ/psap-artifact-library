/**
 * Client-side helper for the ASP.NET SurveyTool persistence endpoints
 * (ArtifactDataController, routed at the site ROOT under `/ArtifactData`).
 *
 * These live at the same public origin as the Artifact Library but are NOT under
 * the Next.js `/artifacts` base path, so we call them with root-relative URLs and
 * rely on the browser to send the existing OWIN session cookie. This is a separate
 * seam from the `psap_session` bridge that protects the Next.js APIs — do not route
 * these through `apiUrl()`.
 *
 * Auth model: `credentials: 'include'` so the OWIN cookie rides along; the server
 * derives ownership from the authenticated user. Writes additionally require an
 * ASP.NET anti-forgery token (fetched once, cached, sent in the
 * `RequestVerificationToken` header; refreshed once on a 400 in case it went stale).
 */

/** Root-origin base for the ASP.NET persistence API (NOT under /artifacts). */
const BASE = '/ArtifactData';

/** XLSX MIME type used when re-wrapping stored bytes into a browser File. */
export const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** Thrown on a 401 from any ArtifactData call — the OWIN session has expired. */
export class SessionExpiredError extends Error {
  constructor() {
    super('Session expired');
    this.name = 'SessionExpiredError';
  }
}

/** Non-401 HTTP failure, carrying the status and a safe server message. */
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

/** Assessment metadata (normalized to camelCase from the PascalCase DTO). */
export interface AssessmentMeta {
  exists: boolean;
  fileName?: string;
  size?: number;
  createdOn?: string;
  updatedOn?: string;
}

/** Raw profile answers on the wire — PascalCase, matching the ASP.NET DTO exactly. */
export interface ProfileWire {
  ItManagement: string;
  CybersecurityOwnership: string;
  OperationalCapability: string;
  DispatcherFteBand: string;
  CallHandlingEnvironment: string;
  GovernanceMaturity: string;
  AccessesCjis: boolean;
  Consolidated: boolean;
  Colocated: boolean;
}

let cachedToken: string | null = null;

/** Fetch (or reuse) the anti-forgery request token. `force` bypasses the cache. */
async function getToken(force = false): Promise<string> {
  if (cachedToken && !force) return cachedToken;
  const resp = await fetch(`${BASE}/AntiForgeryToken`, { credentials: 'include' });
  if (resp.status === 401) throw new SessionExpiredError();
  if (!resp.ok) throw new HttpError(resp.status, 'Could not obtain a security token.');
  const data = await resp.json();
  cachedToken = data.token as string;
  return cachedToken;
}

/** Extract a safe `{ error }` message from a failed response, else a generic one. */
async function safeError(resp: Response): Promise<string> {
  try {
    const d = await resp.json();
    return (d && typeof d.error === 'string' && d.error) || `Request failed (HTTP ${resp.status}).`;
  } catch {
    return `Request failed (HTTP ${resp.status}).`;
  }
}

/** The exact message ArtifactDataController returns for an anti-forgery failure. */
const ANTI_FORGERY_400_MESSAGE = 'Invalid or missing anti-forgery token.';

/**
 * True only when a 400 is specifically the anti-forgery failure. Reads a clone so
 * the original response body stays intact for the caller's own error handling.
 */
async function isAntiForgeryFailure(resp: Response): Promise<boolean> {
  try {
    const d = await resp.clone().json();
    return d?.error === ANTI_FORGERY_400_MESSAGE;
  } catch {
    return false;
  }
}

/**
 * Perform a write with the anti-forgery header attached. Refresh the token and
 * retry exactly once — but ONLY when the 400 is the anti-forgery failure (a stale
 * token). Ordinary validation 400s (malformed profile, empty/invalid upload, etc.)
 * are returned unretried for the caller to surface. Never sets a multipart
 * Content-Type — the browser sets the boundary for FormData.
 */
async function writeWithToken(url: string, init: RequestInit): Promise<Response> {
  const send = (token: string) =>
    fetch(url, {
      ...init,
      credentials: 'include',
      headers: { ...(init.headers ?? {}), RequestVerificationToken: token },
    });

  let resp = await send(await getToken());
  if (resp.status === 400 && (await isAntiForgeryFailure(resp))) {
    resp = await send(await getToken(true));
  }
  return resp;
}

/** GET /ArtifactData/Assessment — does the user have a saved assessment? */
export async function getAssessmentMeta(): Promise<AssessmentMeta> {
  const resp = await fetch(`${BASE}/Assessment`, { credentials: 'include' });
  if (resp.status === 401) throw new SessionExpiredError();
  if (!resp.ok) throw new HttpError(resp.status, await safeError(resp));
  const d = await resp.json();
  return {
    exists: !!d.Exists,
    fileName: d.FileName ?? undefined,
    size: d.Size ?? undefined,
    createdOn: d.CreatedOn ?? undefined,
    updatedOn: d.UpdatedOn ?? undefined,
  };
}

/** GET /ArtifactData/Assessment/Content — the stored .xlsx bytes + filename. */
export async function getAssessmentContent(): Promise<{ blob: Blob; fileName: string }> {
  const resp = await fetch(`${BASE}/Assessment/Content`, { credentials: 'include' });
  if (resp.status === 401) throw new SessionExpiredError();
  if (!resp.ok) throw new HttpError(resp.status, await safeError(resp));
  const blob = await resp.blob();
  const cd = resp.headers.get('Content-Disposition') ?? '';
  const m = cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  const fileName = m ? decodeURIComponent(m[1]) : 'assessment.xlsx';
  return { blob, fileName };
}

/** POST /ArtifactData/Assessment — upsert the current user's assessment (multipart). */
export async function saveAssessment(file: File): Promise<AssessmentMeta> {
  const fd = new FormData();
  fd.append('file', file);
  const resp = await writeWithToken(`${BASE}/Assessment`, { method: 'POST', body: fd });
  if (resp.status === 401) throw new SessionExpiredError();
  if (!resp.ok) throw new HttpError(resp.status, await safeError(resp));
  const d = await resp.json();
  return {
    exists: true,
    fileName: d.FileName ?? undefined,
    size: d.Size ?? undefined,
    createdOn: d.CreatedOn ?? undefined,
    updatedOn: d.UpdatedOn ?? undefined,
  };
}

/** GET /ArtifactData/Profile — saved answers, or null on 204 (no profile yet). */
export async function getProfile(): Promise<ProfileWire | null> {
  const resp = await fetch(`${BASE}/Profile`, { credentials: 'include' });
  if (resp.status === 401) throw new SessionExpiredError();
  if (resp.status === 204) return null;
  if (!resp.ok) throw new HttpError(resp.status, await safeError(resp));
  return (await resp.json()) as ProfileWire;
}

/** POST /ArtifactData/Profile — upsert the current user's profile (JSON).
 *  POST (not PUT): production IIS rejects the PUT verb before it reaches MVC. */
export async function saveProfile(wire: ProfileWire): Promise<void> {
  const resp = await writeWithToken(`${BASE}/Profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(wire),
  });
  if (resp.status === 401) throw new SessionExpiredError();
  if (!resp.ok) throw new HttpError(resp.status, await safeError(resp));
}
