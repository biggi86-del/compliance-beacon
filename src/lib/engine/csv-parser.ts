const REQUIRED_HEADERS = [
  'employee_id', 'employee_name', 'pay_period_start', 'pay_period_end',
  'state', 'hours_regular', 'hours_overtime', 'hourly_rate', 'gross_wages',
  'tips_reported', 'service_charges', 'overtime_premium_paid',
  'federal_withholding', 'state_withholding', 'social_security', 'medicare',
];

export interface ParseResult {
  rows: Record<string, string>[];
  headerErrors: string[];
}

export function parseCSV(csvText: string): ParseResult {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return { rows: [], headerErrors: ['CSV must have header + data rows.'] };
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['\"]/g, ''));
  const headerErrors: string[] = [];
  for (const req of REQUIRED_HEADERS) {
    if (!headers.includes(req)) headerErrors.push(`Missing required column: "${req}"`);
  }
  if (headerErrors.length > 0) return { rows: [], headerErrors };
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(',');
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = (values[j] || '').trim().replace(/^["']|["']$/g, '');
    }
    rows.push(row);
  }
  return { rows, headerErrors: [] };
}
