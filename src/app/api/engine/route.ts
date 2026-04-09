import { NextRequest, NextResponse } from 'next/server';
import { parseCSV } from '@/lib/engine/csv-parser';
import { runComplianceEngine } from '@/lib/engine/compliance-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const csv: string = body.csv;
    if (!csv || typeof csv !== 'string') return NextResponse.json({ error: 'Missing csv field' }, { status: 400 });
    const { rows, headerErrors } = parseCSV(csv);
    if (headerErrors.length > 0) return NextResponse.json({ error: 'CSV header validation failed', header_errors: headerErrors }, { status: 400 });
    const result = runComplianceEngine(rows, body.as_of_date || '2026-06-15');
    return NextResponse.json(result);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ engine: 'ComplianceBeacon 2026 OBBBA', version: '1.0.0', status: 'operational', codes: ['TP','TT'], penalty: '$680/W-2', states: ['CA','NY','WA'] });
}
