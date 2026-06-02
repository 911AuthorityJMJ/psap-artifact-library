import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import traceabilityData from '@/data/traceability.json';

export const runtime = 'nodejs';

interface Artifact {
  id: string;
  name: string;
}

function toFileNameStem(name: string): string {
  return name
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const artifactMap = traceabilityData.artifactMap as Record<string, Artifact>;
  const artifact = artifactMap[id];
  if (!artifact) {
    return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
  }

  const templatePath = path.join(
    process.cwd(),
    'public',
    'templates',
    'forms',
    `${id}-${toFileNameStem(artifact.name)}-FORM.docx`
  );

  if (!existsSync(templatePath)) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  const buf = readFileSync(templatePath);
  const zip = new PizZip(buf);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

  // getTags() exists at runtime but is missing from the type definitions
  const rawTags = (doc as unknown as { getTags: () => { document?: { tags: Record<string, unknown> } } }).getTags();
  const tagNames: string[] = Object.keys(rawTags.document?.tags ?? {});

  const fields: FieldDef[] = tagNames.map(name => ({
    name,
    ...(FIELD_CONFIG[name] ?? { label: name }),
  }));

  return NextResponse.json({ artifactId: id, artifactName: artifact.name, fields });
}
