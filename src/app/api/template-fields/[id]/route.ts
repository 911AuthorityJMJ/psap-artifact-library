import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { resolveFormTemplate, getDocumentSchema } from '@/lib/templates';
import { resolveFieldById, resolveFieldForTag, resolveLoopById, humanizeTag } from '@/lib/field-registry.mjs';
import { buildDocxView } from '@/lib/docx-view.mjs';
import type { BuilderField, LoopSubField, TemplateSection } from '@/lib/builder-types';
import { requireAuth } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/**
 * Build the label/type/options a subfield should render with. The LABEL comes
 * from the loop's own column config, else a humanized version of the tag name —
 * a loop column is loop-local, so it does NOT inherit a global field's (often
 * verbose) label. TYPE and OPTIONS still fall back to a matching global field so
 * a sub-field like {yesNo} keeps its dropdown.
 */
function buildSubField(loopFields: { id: string }[] | undefined, subId: string): LoopSubField {
  const local = loopFields?.find((x) => x.id === subId) as
    | { id: string; label?: string; type?: LoopSubField['type']; options?: string[]; placeholder?: string }
    | undefined;
  const global = resolveFieldById(subId);
  return {
    name: subId,
    label: local?.label ?? humanizeTag(subId),
    type: local?.type ?? global?.type ?? 'text',
    ...((local?.options ?? global?.options) ? { options: local?.options ?? global?.options } : {}),
    ...((local?.placeholder ?? global?.placeholder) ? { placeholder: local?.placeholder ?? global?.placeholder } : {}),
  };
}

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

    const schema = getDocumentSchema(doc);

    const flat: BuilderField[] = [];

    // Read the document view once: readable preview HTML, section structure, and the
    // "Label:" text written next to each placeholder (used to name disambiguated cells
    // — e.g. two [Date] slots become "Effective Date" and "Next Review").
    const documentXml = zip.files['word/document.xml']?.asText() ?? '';
    const { previewHtml, sections: docSections, labels: docLabels } = buildDocxView(documentXml);

    // Scalars first, in document order. Disambiguated tags (e.g. severityHml2)
    // resolve to their base field so they keep its type/options; the label prefers
    // the document's adjacent "Label:" text, else the registry label (+ number).
    for (const name of schema.scalars) {
      const { field: f, index } = resolveFieldForTag(name);
      const suffix = index > 1 ? ` ${index}` : '';
      const registryLabel = (f?.label ?? humanizeTag(name)) + suffix;
      // A clean curated field keeps its registry label; a disambiguated or
      // un-curated cell prefers the document's adjacent "Label:" text.
      const label = f && index === 1 ? registryLabel : (docLabels[name] ?? registryLabel);
      flat.push({
        kind: 'scalar',
        name,
        label,
        type: f?.type ?? 'text',
        ...(f?.options ? { options: f.options } : {}),
        ...(f?.autoFill && index === 1 ? { autoFill: f.autoFill } : {}),
        ...(f?.placeholder ? { placeholder: f.placeholder } : {}),
      });
    }

    // Then repeating loop sections.
    for (const [name, subIds] of Object.entries(schema.loops)) {
      const loop = resolveLoopById(name);
      flat.push({
        kind: 'loop',
        name,
        label: loop?.label ?? docLabels[name] ?? humanizeTag(name),
        ...(loop?.maxRows ? { maxRows: loop.maxRows } : {}),
        fields: subIds.map((subId) => buildSubField(loop?.fields, subId)),
      });
    }

    // Group fields under the document's own section headings; anything unplaced
    // falls into a trailing "Other".
    const byName = new Map(flat.map((f) => [f.name, f]));
    const placed = new Set<string>();
    const sections: TemplateSection[] = docSections
      .map((s) => ({
        heading: s.heading,
        fields: s.tagNames
          .filter((n) => byName.has(n) && !placed.has(n))
          .map((n) => {
            placed.add(n);
            return byName.get(n) as BuilderField;
          }),
      }))
      .filter((s) => s.fields.length > 0);
    const leftover = flat.filter((f) => !placed.has(f.name));
    if (leftover.length) sections.push({ heading: 'Other', fields: leftover });

    return NextResponse.json({ artifactId: id, artifactName: artifact.name, sections, previewHtml });
  } catch (error) {
    console.error('template-fields error:', error);
    return NextResponse.json({ error: 'Failed to read template' }, { status: 500 });
  }
}
