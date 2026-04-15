const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// Parse a CSV string into an array of row objects.
// Handles quoted fields (fields in "quotes" can contain commas and escaped quotes).
export function parseCsv(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  function parseRow(line: string): string[] {
    const fields: string[] = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === '"') {
        // Quoted field
        let field = '';
        i++; // skip opening quote
        while (i < line.length) {
          if (line[i] === '"' && line[i + 1] === '"') {
            // Escaped quote
            field += '"';
            i += 2;
          } else if (line[i] === '"') {
            i++; // skip closing quote
            break;
          } else {
            field += line[i];
            i++;
          }
        }
        fields.push(field);
        // Skip trailing comma
        if (line[i] === ',') i++;
      } else {
        // Unquoted field — read until next comma
        const end = line.indexOf(',', i);
        if (end === -1) {
          fields.push(line.slice(i).trim());
          break;
        } else {
          fields.push(line.slice(i, end).trim());
          i = end + 1;
        }
      }
    }
    return fields;
  }

  const nonEmptyLines = lines.filter((l) => l.trim().length > 0);
  if (nonEmptyLines.length === 0) return { headers: [], rows: [] };

  const headers = parseRow(nonEmptyLines[0]).map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let li = 1; li < nonEmptyLines.length; li++) {
    const values = parseRow(nonEmptyLines[li]);
    // Skip rows that are entirely empty
    if (values.every((v) => v.trim() === '')) continue;
    const row: Record<string, string> = {};
    for (let hi = 0; hi < headers.length; hi++) {
      row[headers[hi]] = values[hi]?.trim() ?? '';
    }
    rows.push(row);
  }

  return { headers, rows };
}

// Import CSV rows into a Google Sheet tab.
// Maps CSV headers to sheet headers case-insensitively.
// Appends rows after the last existing row.
export async function importCsvToSheet(
  token: string,
  sheetId: string,
  tabName: string,
  csvText: string,
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const errors: string[] = [];

  // Step 1: Read existing headers from row 1
  const headersRes = await fetch(
    `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(tabName)}!1:1`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!headersRes.ok) {
    const body = await headersRes.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(`Failed to read sheet headers: ${body.error?.message ?? headersRes.statusText}`);
  }

  const headersData = await headersRes.json() as { values?: string[][] };
  const sheetHeaders: string[] = (headersData.values?.[0] ?? []).map((h) => String(h));

  // Step 2: Parse the CSV
  const { headers: csvHeaders, rows } = parseCsv(csvText);

  if (rows.length === 0) {
    return { imported: 0, skipped: 0, errors };
  }

  // Step 3: Map CSV header indices to sheet column indices (case-insensitive)
  const sheetHeadersLower = sheetHeaders.map((h) => h.toLowerCase());
  const colMap: Array<number | null> = csvHeaders.map((csvH) => {
    const idx = sheetHeadersLower.indexOf(csvH.toLowerCase());
    return idx === -1 ? null : idx;
  });

  const unmappedHeaders = csvHeaders.filter((_, i) => colMap[i] === null);
  if (unmappedHeaders.length > 0) {
    errors.push(`Skipped columns not found in sheet: ${unmappedHeaders.join(', ')}`);
  }

  // Step 4: Build values array — each row maps to a sheet row
  const numSheetCols = sheetHeaders.length;
  const values: string[][] = rows.map((row) => {
    const sheetRow: string[] = new Array(numSheetCols).fill('');
    csvHeaders.forEach((csvH, ci) => {
      const sheetColIdx = colMap[ci];
      if (sheetColIdx !== null) {
        sheetRow[sheetColIdx] = row[csvH] ?? '';
      }
    });
    return sheetRow;
  });

  // Step 5: Append rows using the Sheets values append API
  const appendRes = await fetch(
    `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(tabName)}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ values }),
    },
  );

  if (!appendRes.ok) {
    const body = await appendRes.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(`Failed to append rows: ${body.error?.message ?? appendRes.statusText}`);
  }

  const appendData = await appendRes.json() as { updates?: { updatedRows?: number } };
  const imported = appendData.updates?.updatedRows ?? values.length;
  const skipped = rows.length - imported;

  return { imported, skipped, errors };
}
