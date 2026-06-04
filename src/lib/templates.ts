import { existsSync } from 'fs';
import path from 'path';
import traceabilityData from '@/data/traceability.json';

export interface Artifact {
  id: string;
  name: string;
}

const artifactMap = traceabilityData.artifactMap as Record<string, Artifact>;

/** Every artifact id in the library has the shape "A-002" / "A-172". */
const ARTIFACT_ID_RE = /^[A-Za-z]+-\d+$/;

export function toFileNameStem(name: string): string {
  return name
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

/**
 * Resolve the on-disk FORM (.docx) template for an artifact id.
 *
 * `id` arrives straight from the request URL, so it is treated as untrusted:
 *   1. it must match the artifact-id shape, and
 *   2. it must be an *own* property of artifactMap — `Object.hasOwn` is used
 *      rather than a truthiness check so inherited keys ("__proto__",
 *      "constructor", "toString", ...) cannot satisfy the lookup, and
 *   3. the resolved file must exist.
 *
 * Returns null (caller should answer 404) if any check fails. Because the
 * filename is rebuilt from trusted library data via `toFileNameStem`, no part
 * of the raw `id` can introduce path-traversal segments.
 */
export function resolveFormTemplate(
  id: string,
): { artifact: Artifact; templatePath: string } | null {
  if (typeof id !== 'string' || !ARTIFACT_ID_RE.test(id)) return null;
  if (!Object.hasOwn(artifactMap, id)) return null;

  const artifact = artifactMap[id];
  const templatePath = path.join(
    process.cwd(),
    'public',
    'templates',
    'forms',
    `${id}-${toFileNameStem(artifact.name)}-FORM.docx`,
  );

  if (!existsSync(templatePath)) return null;
  return { artifact, templatePath };
}

/** Structural type for a compiled Docxtemplater instance's getTags(). */
type TagReader = { getTags: () => { document?: { tags: Record<string, unknown> } } };

/**
 * Names of the placeholder tags docxtemplater found in the document body.
 * This is the single source of truth for "which fields a form exposes", shared
 * by the field-listing route and the document-generation route so the set of
 * fields the UI offers always matches the set the generator will accept.
 * (getTags() exists at runtime but is absent from the type definitions.)
 */
export function getDocumentTagNames(doc: unknown): string[] {
  const raw = (doc as TagReader).getTags();
  return Object.keys(raw.document?.tags ?? {});
}
