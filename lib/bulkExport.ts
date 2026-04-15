const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

// Escape a single CSV field value: quote if it contains commas, quotes, or newlines.
function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Convert a 2D array of values into a CSV string.
function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map(escapeCsvField).join(',')).join('\n');
}

// Download all data from a module sheet as CSV.
// Reads the first data tab (not _config) and converts it to a CSV string.
export async function exportSheetAsCsv(
  token: string,
  sheetId: string,
  tabName?: string,
): Promise<{ csv: string; filename: string; rowCount: number }> {
  let resolvedTabName = tabName;

  // If tabName not provided, look up the first non-_config tab from sheet metadata
  if (!resolvedTabName) {
    const metaRes = await fetch(
      `${SHEETS_API}/${sheetId}?fields=sheets.properties`,
      { headers: authHeaders(token) },
    );

    if (!metaRes.ok) {
      const body = await metaRes.json().catch(() => ({})) as { error?: { message?: string } };
      throw new Error(`Failed to read sheet metadata: ${body.error?.message ?? metaRes.statusText}`);
    }

    const meta = await metaRes.json() as {
      sheets?: Array<{ properties?: { title?: string } }>;
    };

    const firstTab = (meta.sheets ?? [])
      .map((s) => s.properties?.title ?? '')
      .find((title) => title && title !== '_config');

    if (!firstTab) {
      throw new Error('No data tab found in this sheet');
    }

    resolvedTabName = firstTab;
  }

  // Read all values from the tab
  const valuesRes = await fetch(
    `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(resolvedTabName)}!A:Z`,
    { headers: authHeaders(token) },
  );

  if (!valuesRes.ok) {
    const body = await valuesRes.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(`Failed to read sheet data: ${body.error?.message ?? valuesRes.statusText}`);
  }

  const data = await valuesRes.json() as { values?: string[][] };
  const rawRows = (data.values ?? []).map((row) => row.map(String));

  if (rawRows.length === 0) {
    return { csv: '', filename: `${resolvedTabName}.csv`, rowCount: 0 };
  }

  // Normalize row lengths to match header column count
  const headerLen = rawRows[0].length;
  const normalizedRows = rawRows.map((row) => {
    if (row.length < headerLen) {
      return [...row, ...new Array(headerLen - row.length).fill('')];
    }
    return row;
  });

  const csv = toCsv(normalizedRows);
  // Subtract 1 for the header row
  const rowCount = Math.max(0, normalizedRows.length - 1);
  const filename = `${resolvedTabName}-export.csv`;

  return { csv, filename, rowCount };
}

// Trigger a browser download of a CSV string.
export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
