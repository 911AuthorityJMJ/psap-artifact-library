import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { resolveFormTemplate, getDocumentSchema, toFileNameStem, type DocumentSchema } from '@/lib/templates';
import { resolveLoopById } from '@/lib/field-registry.mjs';
import { effectiveMaxRows } from '@/lib/loop-limits';
import { readBodyBounded } from '@/lib/bounded-body';
import { requireAuth } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/** Reject oversized JSON bodies while reading, before buffering the whole thing.
 *  Sized so a legitimately loop-heavy document (100 rows of long textarea cells)
 *  fits with room to spare, while still bounding memory per request. */
const MAX_BODY_BYTES = 256 * 1024;
/** Cap any single field so one giant value can't bloat the rendered document. */
const MAX_FIELD_LEN = 5_000;
/** Global cap across all loop cells, independent of any per-loop cap. */
const MAX_TOTAL_LEAVES = 2_000;

type FieldValue = string | Array<Record<string, string>>;

type ParsedBody =
  | { ok: true; value: unknown }
  | { ok: false; status: number; error: string };

/**
 * Read and JSON-parse the request body while enforcing MAX_BODY_BYTES during the
 * read — so a request with no/chunked Content-Length can't bypass the size guard
 * and stream an unbounded body into memory.
 */
async function readJsonBounded(request: NextRequest, maxBytes: number): Promise<ParsedBody> {
  const body = await readBodyBounded(request, maxBytes);
  if (!body.ok) return body;
  try {
    return { ok: true, value: JSON.parse(body.bytes.toString('utf8')) };
  } catch {
    return { ok: false, status: 400, error: 'Invalid request body' };
  }
}

/** Accept only scalar primitives; coerce to a length-capped string, else null. */
function coerceScalar(v: unknown): string | null {
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
    return String(v).slice(0, MAX_FIELD_LEN);
  }
  return null;
}

/**
 * Keep only what the template declares, and only as scalars — extended to loops:
 * a loop tag accepts an array of flat rows, each row keyed to that loop's declared
 * sub-fields, every leaf a length-capped scalar. Arrays are bounded (MAX_ROWS,
 * MAX_TOTAL_LEAVES) and object depth is fixed at 1, so no nested/non-scalar value
 * ever reaches the renderer — preserving the pre-loop security invariant. Absent
 * tags are handled by nullGetter.
 */
function sanitizeFields(raw: unknown, schema: DocumentSchema): Record<string, FieldValue> {
  const out: Record<string, FieldValue> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  const obj = raw as Record<string, unknown>;

  for (const key of schema.scalars) {
    const s = coerceScalar(obj[key]);
    if (s !== null) out[key] = s;
  }

  let budget = MAX_TOTAL_LEAVES;
  for (const [loop, subFields] of Object.entries(schema.loops)) {
    const arr = obj[loop];
    if (!Array.isArray(arr)) continue;
    // Honor the loop's declared maxRows (single source of truth with the UI),
    // clamped to a hard ceiling so the UI never accepts more than we render.
    const cap = effectiveMaxRows(resolveLoopById(loop)?.maxRows);
    const rows: Array<Record<string, string>> = [];
    for (const rowRaw of arr.slice(0, cap)) {
      if (!rowRaw || typeof rowRaw !== 'object' || Array.isArray(rowRaw)) continue;
      const rowObj = rowRaw as Record<string, unknown>;
      const clean: Record<string, string> = {};
      for (const sf of subFields) {
        if (budget <= 0) break;
        const s = coerceScalar(rowObj[sf]);
        if (s !== null) {
          clean[sf] = s;
          budget--;
        }
      }
      // Drop all-empty rows so a seeded / untouched loop emits no blank row.
      if (Object.values(clean).some((v) => v.trim() !== '')) rows.push(clean);
    }
    out[loop] = rows;
  }
  return out;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const limited = enforceRateLimit(request, { name: 'generate-document', limit: 60, windowMs: 5 * 60_000 });
    if (limited) return limited;

    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;

    const resolved = resolveFormTemplate(id);
    if (!resolved) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    const { artifact, templatePath } = resolved;

    const parsed = await readJsonBounded(request, MAX_BODY_BYTES);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }
    const rawFields = (parsed.value as { fields?: unknown } | null)?.fields;

    const buf = readFileSync(templatePath);
    const zip = new PizZip(buf);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      // Return empty string for any missing tag rather than throwing
      nullGetter() { return ''; },
    });

    const fields = sanitizeFields(rawFields, getDocumentSchema(doc));
    doc.render(fields);

    const outputBuf = doc.toUint8Array();
    const stem = toFileNameStem(artifact.name);
    const filename = `${id}-${stem}-COMPLETED.docx`;

    return new NextResponse(outputBuf as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('generate-document error:', error);
    return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 });
  }
}
