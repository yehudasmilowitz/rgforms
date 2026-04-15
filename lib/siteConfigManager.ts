const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export interface ConfigRow {
  key: string;
  value: string;
  description: string;
  rowIndex: number; // 0-based index within data rows (excludes header row)
}

export async function listConfigRows(
  accessToken: string,
  spreadsheetId: string,
): Promise<{ rows: ConfigRow[]; numericSheetId: number }> {
  // Fetch sheet metadata for the numeric GID
  const meta = await fetch(`${SHEETS_API}/${spreadsheetId}?fields=sheets.properties`, {
    headers: authHeaders(accessToken),
  }).then((r) => r.json()) as {
    sheets: Array<{ properties: { title: string; sheetId: number } }>;
  };

  const configTab = meta.sheets.find((s) => s.properties.title === 'Config');
  const numericSheetId = configTab?.properties.sheetId ?? 0;

  // Read all data rows (skip header)
  const result = await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Config!A2:C1000`,
    { headers: authHeaders(accessToken) },
  ).then((r) => r.json()) as { values?: string[][] };

  const raw = result.values ?? [];
  const rows: ConfigRow[] = raw.map((row, i) => ({
    key: row[0] ?? '',
    value: row[1] ?? '',
    description: row[2] ?? '',
    rowIndex: i,
  })).filter((r) => r.key.trim() !== ''); // skip blank rows

  return { rows, numericSheetId };
}

// Update a single value cell (column B) for a given data row
export async function updateConfigValue(
  accessToken: string,
  spreadsheetId: string,
  rowIndex: number, // 0-based within data rows
  value: string,
): Promise<void> {
  const sheetRow = rowIndex + 2; // +1 for header, +1 for 1-based
  await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Config!B${sheetRow}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: authHeaders(accessToken),
      body: JSON.stringify({ values: [[value]] }),
    },
  );
}

// Append a new key/value/description row
export async function appendConfigRow(
  accessToken: string,
  spreadsheetId: string,
  key: string,
  value: string,
  description: string,
): Promise<void> {
  await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Config!A:C:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: authHeaders(accessToken),
      body: JSON.stringify({ values: [[key, value, description]] }),
    },
  );
}

// Delete a row by index
export async function deleteConfigRow(
  accessToken: string,
  spreadsheetId: string,
  numericSheetId: number,
  rowIndex: number, // 0-based within data rows
): Promise<void> {
  const startIndex = rowIndex + 1; // +1 for header
  await fetch(`${SHEETS_API}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(accessToken),
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
  });
}
