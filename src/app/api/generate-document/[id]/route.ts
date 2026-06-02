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

export async function POST(
  request: NextRequest,
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

  let fields: Record<string, string>;
  try {
    const body = await request.json();
    fields = body.fields ?? {};
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const buf = readFileSync(templatePath);
  const zip = new PizZip(buf);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    // Return empty string for any missing tag rather than throwing
    nullGetter() { return ''; },
  });

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
}
