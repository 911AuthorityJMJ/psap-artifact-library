import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import traceabilityData from '@/data/traceability.json';

type XlsxRow = (string | number | boolean | null | undefined)[];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
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
        name:          (psapInfoData[0]?.[2] as string) ?? '',
        address:       (psapInfoData[1]?.[2] as string) ?? '',
        cityZip:       (psapInfoData[2]?.[2] as string) ?? '',
        director:      (psapInfoData[4]?.[2] as string) ?? '',
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
        const ratingNorm = typeof rating === 'string' ? rating.trim().toUpperCase() : '';
        if (ratingNorm === 'NO' || ratingNorm === 'PLANNED' || ratingNorm === 'UNKNOWN') {
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