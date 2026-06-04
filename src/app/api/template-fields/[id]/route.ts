import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { resolveFormTemplate, getDocumentTagNames } from '@/lib/templates';
import { requireAuth } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export interface FieldDef {
  name: string;
  label: string;
  /** psapInfo key to auto-populate from, if any */
  autoFill?: string;
  placeholder?: string;
  type?: 'date' | 'text';
}

const FIELD_CONFIG: Record<string, Omit<FieldDef, 'name'>> = {
  agencyName:            { label: 'Agency Name',              autoFill: 'name' },
  directorName:          { label: 'Director / Coordinator',   autoFill: 'director' },
  directorEmail:         { label: 'Director Email',           autoFill: 'directorEmail' },
  signingOfficialTitle:  { label: 'Signing Official & Title', placeholder: 'e.g. Jane Smith, PSAP Director' },
  effectiveDate:         { label: 'Effective Date',           type: 'date' },
  version:               { label: 'Version',                  placeholder: '1.0' },
  ownerRole:             { label: 'Owner Role',               placeholder: 'e.g. PSAP Director' },
  reviewerRole:          { label: 'Reviewer Role',            placeholder: 'e.g. IT Supervisor' },
  approvingOfficialTitle:{ label: 'Approving Official & Title', placeholder: 'e.g. County Manager' },
  revisionNote:          { label: 'Initial Revision Note',    placeholder: 'Initial issue' },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const limited = enforceRateLimit(request, { name: 'template-fields', limit: 120, windowMs: 5 * 60_000 });
    if (limited) return limited;

    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;

    const resolved = resolveFormTemplate(id);
    if (!resolved) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    const { artifact, templatePath } = resolved;

    const buf = readFileSync(templatePath);
    const zip = new PizZip(buf);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    const tagNames = getDocumentTagNames(doc);

    const fields: FieldDef[] = tagNames.map(name => ({
      name,
      ...(FIELD_CONFIG[name] ?? { label: name }),
    }));

    return NextResponse.json({ artifactId: id, artifactName: artifact.name, fields });
  } catch (error) {
    console.error('template-fields error:', error);
    return NextResponse.json({ error: 'Failed to read template' }, { status: 500 });
  }
}
