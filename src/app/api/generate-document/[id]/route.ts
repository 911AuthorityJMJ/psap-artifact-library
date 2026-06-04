import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { resolveFormTemplate, getDocumentTagNames, toFileNameStem } from '@/lib/templates';
import { requireAuth } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/** Reject obviously oversized JSON bodies before buffering them. A document's
 *  worth of short form fields is well under this. */
const MAX_BODY_BYTES = 64 * 1024;
/** Cap any single field so one giant value can't bloat the rendered document. */
const MAX_FIELD_LEN = 5_000;

/**
 * Keep only the fields the template actually declares, coerce scalar values to
 * strings, and cap their length. Anything the template doesn't expose — and any
 * non-scalar value (objects/arrays/null) — is dropped, so the client cannot
 * push unexpected data into the renderer. Absent tags are handled by nullGetter.
 */
function sanitizeFields(raw: unknown, allowed: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  const obj = raw as Record<string, unknown>;
  for (const key of allowed) {
    const v = obj[key];
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      out[key] = String(v).slice(0, MAX_FIELD_LEN);
    }
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

    const contentLength = Number(request.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const rawFields = (rawBody as { fields?: unknown } | null)?.fields;

    const buf = readFileSync(templatePath);
    const zip = new PizZip(buf);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      // Return empty string for any missing tag rather than throwing
      nullGetter() { return ''; },
    });

    const fields = sanitizeFields(rawFields, getDocumentTagNames(doc));
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
