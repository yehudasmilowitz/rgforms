import type { ContentField } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SheetRecord {
  /** Raw row values indexed by normalized column key */
  [key: string]: unknown;
}

export interface SheetData {
  headers: string[];         // original header labels from row 1
  keys: string[];            // normalized keys (one-to-one with headers)
  rows: SheetRecord[];       // data rows, indexed from 0 (sheet row 2+)
  numericSheetId: number;    // numeric sheetId needed for deleteDimension
}

// ─── Key normalization (must match Apps Script normalizeKey) ──────────────────

function normalizeKey(h: string): string {
  return String(h).trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
}

// ─── Type coercion (sheet string → JS value) ─────────────────────────────────

function coerceFromSheet(raw: unknown, type: string): unknown {
  if (raw === '' || raw === null || raw === undefined) return null;
  switch (type) {
    case 'number':  return isNaN(Number(raw)) ? null : Number(raw);
    case 'boolean': return String(raw).toUpperCase() === 'TRUE';
    case 'tags':    return String(raw).split(',').map((t) => t.trim()).filter(Boolean);
    default:        return String(raw);
  }
}

function coerceToSheet(value: unknown, type: string): string {
  if (value === null || value === undefined || value === '') return '';
  switch (type) {
    case 'boolean': return (value as boolean) ? 'TRUE' : 'FALSE';
    case 'tags':    return Array.isArray(value) ? (value as string[]).join(', ') : String(value);
    default:        return String(value);
  }
}

// ─── Build a field-type lookup from ContentField[] ───────────────────────────

function buildTypeMap(fields: ContentField[], hasSlug: boolean, hasPublished: boolean): Record<string, string> {
  const map: Record<string, string> = {};
  for (const f of fields) map[f.key] = f.type;
  if (hasSlug)      map['slug']      = 'text';
  if (hasPublished) map['published'] = 'boolean';
  map['_id']         = 'text';
  map['_created_at'] = 'text';
  map['_updated_at'] = 'text';
  return map;
}

// ─── Load all rows (including unpublished) from the Content sheet ─────────────

export async function loadSheetData(
  accessToken: string,
  spreadsheetId: string,
  fields: ContentField[],
  hasSlug: boolean,
  hasPublished: boolean,
): Promise<SheetData> {
  // Fetch spreadsheet metadata to get the numeric sheetId for the Content tab
  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!metaRes.ok) throw new Error(`Failed to load sheet metadata (${metaRes.status})`);
  const meta = await metaRes.json();
  const contentSheet = (meta.sheets as Array<{ properties: { title: string; sheetId: number } }>)
    .find((s) => s.properties.title === 'Content');
  if (!contentSheet) throw new Error('Content sheet not found');
  const numericSheetId = contentSheet.properties.sheetId;

  // Fetch all values from the Content tab
  const valRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Content`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!valRes.ok) throw new Error(`Failed to load sheet data (${valRes.status})`);
  const valJson = await valRes.json();

  const allValues: unknown[][] = valJson.values ?? [];
  if (allValues.length === 0) {
    return { headers: [], keys: [], rows: [], numericSheetId };
  }

  const headers = (allValues[0] as string[]).map((h) => String(h).trim());
  const keys = headers.map(normalizeKey);
  const typeMap = buildTypeMap(fields, hasSlug, hasPublished);

  const rows: SheetRecord[] = allValues.slice(1).map((raw) => {
    const obj: SheetRecord = {};
    keys.forEach((key, i) => {
      obj[key] = coerceFromSheet((raw as unknown[])[i], typeMap[key] ?? 'text');
    });
    return obj;
  });

  return { headers, keys, rows, numericSheetId };
}

// ─── Append a new record ──────────────────────────────────────────────────────

export async function appendRecord(
  accessToken: string,
  spreadsheetId: string,
  headers: string[],
  keys: string[],
  fields: ContentField[],
  hasSlug: boolean,
  hasPublished: boolean,
  data: SheetRecord,
): Promise<SheetRecord> {
  const typeMap = buildTypeMap(fields, hasSlug, hasPublished);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const rowValues: string[] = keys.map((key) => {
    if (key === '_id')         return id;
    if (key === '_created_at') return now;
    if (key === '_updated_at') return now;
    const val = data[key];
    if (val === undefined || val === null) return '';
    return coerceToSheet(val, typeMap[key] ?? 'text');
  });

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Content!A:${colLetter(keys.length)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [rowValues] }),
    },
  );
  if (!res.ok) throw new Error(`Failed to append record (${res.status})`);

  // Build the returned record from what we wrote
  const created: SheetRecord = {};
  keys.forEach((key, i) => {
    created[key] = coerceFromSheet(rowValues[i], typeMap[key] ?? 'text');
  });
  return created;
}

// ─── Update an existing record ────────────────────────────────────────────────
// rowIndex is 0-based index in the rows array (sheet row = rowIndex + 2)

export async function updateRecord(
  accessToken: string,
  spreadsheetId: string,
  headers: string[],
  keys: string[],
  fields: ContentField[],
  hasSlug: boolean,
  hasPublished: boolean,
  rowIndex: number,
  existing: SheetRecord,
  patch: SheetRecord,
): Promise<SheetRecord> {
  const typeMap = buildTypeMap(fields, hasSlug, hasPublished);
  const sheetRow = rowIndex + 2; // 1-indexed + skip header
  const now = new Date().toISOString();

  const rowValues: string[] = keys.map((key) => {
    if (key === '_id')         return String(existing['_id'] ?? '');
    if (key === '_created_at') return String(existing['_created_at'] ?? '');
    if (key === '_updated_at') return now;
    const val = key in patch ? patch[key] : existing[key];
    if (val === undefined || val === null) return '';
    return coerceToSheet(val, typeMap[key] ?? 'text');
  });

  const range = `Content!A${sheetRow}:${colLetter(keys.length)}${sheetRow}`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ range, values: [rowValues] }),
    },
  );
  if (!res.ok) throw new Error(`Failed to update record (${res.status})`);

  const updated: SheetRecord = {};
  keys.forEach((key, i) => {
    updated[key] = coerceFromSheet(rowValues[i], typeMap[key] ?? 'text');
  });
  return updated;
}

// ─── Delete a record ──────────────────────────────────────────────────────────
// rowIndex is 0-based index in the rows array (sheet row = rowIndex + 2, 0-indexed in Sheets = rowIndex + 1)

export async function deleteRecord(
  accessToken: string,
  spreadsheetId: string,
  numericSheetId: number,
  rowIndex: number,
): Promise<void> {
  const startIndex = rowIndex + 1; // skip header, 0-indexed
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          deleteDimension: {
            range: {
              sheetId: numericSheetId,
              dimension: 'ROWS',
              startIndex,
              endIndex: startIndex + 1,
            },
          },
        }],
      }),
    },
  );
  if (!res.ok) throw new Error(`Failed to delete record (${res.status})`);
}

// ─── Column letter helper (A=1, Z=26, AA=27 …) ───────────────────────────────

function colLetter(n: number): string {
  let result = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}
