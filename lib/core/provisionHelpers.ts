/**
 * Shared primitives for all Apps Script provisioning pipelines.
 *
 * Every module (gallery, testimonial, faq, …) follows the same 4-step flow:
 *   1. createSheet   — module-specific (unique headers/data)
 *   2. createScript  — identical for every module
 *   3. uploadCode    — identical except for the generated source
 *   4. deployWebApp  — identical for every module
 *   5. saveConfig    — writes a hidden _config tab (moduleType varies)
 *
 * Import the shared pieces from here and only write the unique part per module.
 */

export const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
export const SCRIPT_API = 'https://script.googleapis.com/v1/projects';
export const DRIVE_API  = 'https://www.googleapis.com/drive/v3/files';

// ─── Error classes ────────────────────────────────────────────────────────────

export class AppsScriptUserSettingError extends Error {
  constructor() {
    super('Apps Script access needs to be enabled in your Google account settings.');
    this.name = 'AppsScriptUserSettingError';
  }
}

// ─── Shared types ─────────────────────────────────────────────────────────────

export type StepStatus = 'running' | 'complete' | 'error';
export type StepCallback = (stepId: string, status: StepStatus, error?: string) => void;

// ─── Utilities ────────────────────────────────────────────────────────────────

export function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function apiCall<T>(url: string, options: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: { message: res.statusText } })) as {
      error?: { status?: string; message?: string; details?: Array<{ reason?: string }> };
    };
    if (res.status === 403 && body.error?.status === 'PERMISSION_DENIED') {
      const details = (body.error.details ?? []) as Array<{ reason?: string }>;
      if (!details.some((d) => d.reason === 'ACCESS_TOKEN_SCOPE_INSUFFICIENT')) {
        throw new AppsScriptUserSettingError();
      }
    }
    throw new Error(body.error?.message ?? `API error: ${res.status}`);
  }
  return res.json() as T;
}

// ─── Shared pipeline steps ────────────────────────────────────────────────────

export async function createScriptProject(
  token: string,
  title: string,
  parentId: string,
): Promise<{ scriptId: string; scriptUrl: string }> {
  const result = await apiCall<{ scriptId: string }>(SCRIPT_API, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ title, parentId }),
  });
  return {
    scriptId: result.scriptId,
    scriptUrl: `https://script.google.com/d/${result.scriptId}/edit`,
  };
}

export async function uploadCode(
  token: string,
  scriptId: string,
  source: string,
  manifest: object,
): Promise<void> {
  await apiCall<unknown>(`${SCRIPT_API}/${scriptId}/content`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({
      files: [
        { name: 'Code',       type: 'SERVER_JS', source },
        { name: 'appsscript', type: 'JSON',      source: JSON.stringify(manifest) },
      ],
    }),
  });
}

export async function deployWebApp(
  token: string,
  scriptId: string,
  description = 'rgforms API',
): Promise<string> {
  const version = await apiCall<{ versionNumber: number }>(`${SCRIPT_API}/${scriptId}/versions`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ description: `${description} initial version` }),
  });
  const result = await apiCall<{ entryPoints: Array<{ entryPointType: string; webApp: { url: string } }> }>(
    `${SCRIPT_API}/${scriptId}/deployments`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        versionNumber: version.versionNumber,
        manifestFileName: 'appsscript',
        description,
      }),
    },
  );
  const webApp = result.entryPoints?.find((ep) => ep.entryPointType === 'WEB_APP');
  if (!webApp?.webApp?.url) throw new Error('Deployment succeeded but no web app URL returned');
  return webApp.webApp.url;
}

// ─── Sheet helpers ────────────────────────────────────────────────────────────

/** Bold the first row and freeze it as a header row. */
export async function styleHeaderRow(
  token: string,
  sheetId: string,
  tabGid: number,
): Promise<void> {
  await fetch(`${SHEETS_API}/${sheetId}:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      requests: [
        {
          repeatCell: {
            range: { sheetId: tabGid, startRowIndex: 0, endRowIndex: 1 },
            cell: { userEnteredFormat: { textFormat: { bold: true } } },
            fields: 'userEnteredFormat.textFormat.bold',
          },
        },
        {
          updateSheetProperties: {
            properties: { sheetId: tabGid, gridProperties: { frozenRowCount: 1 } },
            fields: 'gridProperties.frozenRowCount',
          },
        },
      ],
    }),
  }).catch(() => {});
}

/** Write rows to a sheet range. */
export async function writeRows(
  token: string,
  sheetId: string,
  range: string,
  values: (string | number | boolean)[][],
): Promise<void> {
  await fetch(`${SHEETS_API}/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ values }),
  });
}

/**
 * Create a Google Sheet with a single named tab, write header + sample rows,
 * and style the header row.
 */
export async function createModuleSheet(
  token: string,
  sheetTitle: string,
  tabName: string,
  rows: (string | number | boolean)[][],
): Promise<{ sheetId: string; sheetUrl: string; tabGid: number }> {
  const result = await apiCall<{
    spreadsheetId: string;
    sheets: Array<{ properties: { sheetId: number } }>;
  }>(SHEETS_API, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      properties: { title: sheetTitle },
      sheets: [{ properties: { title: tabName } }],
    }),
  });

  const sheetId = result.spreadsheetId;
  const tabGid  = result.sheets[0].properties.sheetId;

  if (rows.length > 0) {
    await writeRows(token, sheetId, `${tabName}!A1:${colLetter(rows[0].length)}${rows.length}`, rows);
  }

  await styleHeaderRow(token, sheetId, tabGid);

  return { sheetId, sheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`, tabGid };
}

/** Convert a 1-based column index to a letter (1→A, 26→Z, 27→AA). */
function colLetter(n: number): string {
  let s = '';
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}
