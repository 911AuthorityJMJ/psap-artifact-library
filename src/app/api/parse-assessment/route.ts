import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import traceabilityData from '@/data/traceability.json';
import { requireAuth } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rate-limit';
import { readBodyBounded } from '@/lib/bounded-body';

type XlsxRow = (string | number | boolean | null | undefined)[];

/** Ratings that count as a gap. IN PROGRESS is included deliberately: work
 *  that has started but isn't finished is still a gap (a lesser one — the UI
 *  badges it distinctly). YES and NOT APPLICABLE are the only non-gaps. */
const GAP_RATINGS = new Set(['NO', 'IN PROGRESS', 'PLANNED', 'UNKNOWN']);

/** A routine assessment matrix is ~125 KB; cap well above that. The .xlsx is a
 *  zip, so an unbounded upload is a decompression-bomb / memory-exhaustion risk. */
const MAX_FILE_BYTES = 250 * 1024;

/** Early gate on the raw request before buffering it; leaves room for the
 *  multipart envelope around a max-size file. */
const MAX_BODY_BYTES = MAX_FILE_BYTES + 16 * 1024;

export async function POST(request: NextRequest) {
  try {
    const limited = enforceRateLimit(request, {
      name: 'parse-assessment',
      limit: 30,
      windowMs: 5 * 60_000,
    });
    if (limited) return limited;

    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    // Buffer the multipart body with the size cap enforced DURING the read —
    // request.formData() alone would buffer an unbounded chunked body (no
    // Content-Length) into memory before any check could run.
    const body = await readBodyBounded(request, MAX_BODY_BYTES);
    if (!body.ok) {
      return NextResponse.json({ error: 'File too large (250 KB max)' }, { status: body.status });
    }

    let formData: FormData;
    try {
      // (Buffer is a Uint8Array at runtime; TS's BodyInit just doesn't know it.)
      formData = await new Response(body.bytes as unknown as BodyInit, {
        headers: { 'content-type': request.headers.get('content-type') ?? '' },
      }).formData();
    } catch {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'File too large (250 KB max)' }, { status: 413 });
    }

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      return NextResponse.json({ error: 'Only .xlsx files are accepted' }, { status: 415 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });

    // Parse PSAP Information sheet
    const psapInfoSheet = workbook.Sheets['PSAP Information'];
    if (!psapInfoSheet) {
      return NextResponse.json(
        { error: 'Invalid file: PSAP Information sheet not found' },
        { status: 400 }
      );
    }

    const psapInfoData = XLSX.utils.sheet_to_json<XlsxRow>(psapInfoSheet, { header: 1 });
    const psapInfo = {
      name: (psapInfoData[0]?.[2] as string) ?? '',
      address: (psapInfoData[1]?.[2] as string) ?? '',
      cityZip: (psapInfoData[2]?.[2] as string) ?? '',
      director: (psapInfoData[4]?.[2] as string) ?? '',
      directorPhone: (psapInfoData[5]?.[2] as string) ?? '',
      directorEmail: (psapInfoData[6]?.[2] as string) ?? '',
    };

    // Parse Question Set for gaps
    const questionSheet = workbook.Sheets['Question Set'];
    if (!questionSheet) {
      return NextResponse.json(
        { error: 'Invalid file: Question Set sheet not found' },
        { status: 400 }
      );
    }

    const questionData = XLSX.utils.sheet_to_json<XlsxRow>(questionSheet, { header: 1 });

    const gaps: Array<{ id: string; rating: string; domain: string; category: string }> = [];
    let currentDomain = '';
    let currentCategory = '';

    for (const row of questionData) {
      const col0 = row[0];
      const col1 = row[1];
      const col2 = row[2];
      const rating = row[6];

      // Domain header row: col[1] has domain name, col[0] and col[2] empty
      if (!col0 && col1 && typeof col1 === 'string' && !col2) {
        currentDomain = col1;
        continue;
      }

      // Category header row: col[2] has category name, col[0] and col[1] empty
      if (!col0 && !col1 && col2 && typeof col2 === 'string') {
        currentCategory = col2;
        continue;
      }

      // Question row: col[0] matches ID pattern (e.g. 1A-1, 2B-3)
      if (col0 && typeof col0 === 'string' && /^\d+[A-Z]-\d+$/.test(col0)) {
        const ratingNorm =
          typeof rating === 'string' ? rating.replace(/\s+/g, ' ').trim().toUpperCase() : '';
        if (GAP_RATINGS.has(ratingNorm)) {
          gaps.push({ id: col0, rating: ratingNorm, domain: currentDomain, category: currentCategory });
        }
      }
    }

    const enrichedGaps = gaps.map(gap => {
      const trace = traceabilityData.questionMap[gap.id as keyof typeof traceabilityData.questionMap];
      const artifacts = (trace?.artifactIds ?? [])
        .map(id => traceabilityData.artifactMap[id as keyof typeof traceabilityData.artifactMap])
        .filter(Boolean);
      return { ...gap, artifacts };
    });

    return NextResponse.json({ psapInfo, gaps: enrichedGaps, totalGaps: enrichedGaps.length });
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json({ error: 'Failed to parse file' }, { status: 500 });
  }
}
