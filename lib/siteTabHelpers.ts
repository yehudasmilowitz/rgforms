import { SHEETS_API, DRIVE_API, authHeaders, styleHeaderRow } from '@/lib/core/provisionHelpers';
import type { SiteManifest, SiteTab } from '@/types';
import { mergeHeaders } from '@/lib/formConfig';

/**
 * fetch() that throws on a non-2xx response. Every helper here used to ignore
 * the status, so an expired sign-in (tokens last an hour) made "Save changes"
 * look successful while nothing reached the Sheet.
 */
async function googleFetch(url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, init);
  if (res.ok) return res;
  const detail = await res.json().then((b: { error?: { message?: string } }) => b.error?.message ?? '').catch(() => '');
  if (res.status === 401) {
    throw new Error('Your Google sign-in has expired, so this change wasn’t saved. Sign out and back in, then try again.');
  }
  if (res.status === 403 || res.status === 404) {
    throw new Error(`Google refused access to this project’s Sheet or folder, so this change wasn’t saved. Check you’re signed in as the account that created it.${detail ? ` (${detail})` : ''}`);
  }
  throw new Error(`Google returned an error (${res.status}), so this change wasn’t saved.${detail ? ` ${detail}` : ''}`);
}

export function toFieldKey(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'field';
}

function colLetter(n: number): string {
  let s = '';
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export async function updateManifestInSheet(
  token: string,
  sheetId: string,
  manifest: SiteManifest,
): Promise<void> {
  await googleFetch(
    `${SHEETS_API}/${sheetId}/values/${encodeURIComponent('_manifest!A1:B1')}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ values: [['manifest_json', JSON.stringify(manifest)]] }),
    },
  );
}

export async function addTabToSheet(
  token: string,
  sheetId: string,
  tabName: string,
  columns: string[],
): Promise<void> {
  const addRes = await googleFetch(`${SHEETS_API}/${sheetId}:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title: tabName } } }] }),
  });
  const addData = (await addRes.json()) as {
    replies?: Array<{ addSheet?: { properties?: { sheetId?: number } } }>;
  };
  const gid = addData.replies?.[0]?.addSheet?.properties?.sheetId;

  if (columns.length > 0) {
    const range = `${tabName}!A1:${colLetter(columns.length)}1`;
    await googleFetch(
      `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({ values: [columns] }),
      },
    );
  }

  if (gid !== undefined && columns.length > 0) {
    await styleHeaderRow(token, sheetId, gid).catch(() => {});
  }
}

export async function removeTabFromSheet(
  token: string,
  sheetId: string,
  tabName: string,
): Promise<void> {
  const infoRes = await googleFetch(
    `${SHEETS_API}/${sheetId}?fields=sheets.properties(title,sheetId)`,
    { headers: authHeaders(token) },
  );
  const info = (await infoRes.json()) as {
    sheets?: Array<{ properties: { title: string; sheetId: number } }>;
  };
  const sheet = info.sheets?.find((s) => s.properties.title === tabName);
  if (!sheet) return;

  await googleFetch(`${SHEETS_API}/${sheetId}:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ requests: [{ deleteSheet: { sheetId: sheet.properties.sheetId } }] }),
  });
}

/**
 * Rewrite a form tab's header row after its fields change, without moving any
 * existing column (see mergeHeaders). Returns the header row written.
 */
export async function updateTabHeaders(
  token: string,
  sheetId: string,
  tabName: string,
  oldFields: { id: string; label: string }[],
  newFields: { id: string; label: string }[],
): Promise<string[]> {
  const res = await googleFetch(
    `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(tabName + '!1:1')}`,
    { headers: authHeaders(token) },
  );
  const data = (await res.json()) as { values?: string[][] };
  const existing = (data.values?.[0] ?? []).map(String);
  while (existing.length && !existing[existing.length - 1].trim()) existing.pop();
  const columns = mergeHeaders(existing, oldFields, newFields);
  const range = `${tabName}!A1:${colLetter(columns.length)}1`;
  await googleFetch(
    `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ values: [columns] }),
    },
  );
  return columns;
}

export async function fetchTabHeaders(
  token: string,
  sheetId: string,
  tabName: string,
): Promise<string[]> {
  const res = await googleFetch(
    `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(tabName + '!1:1')}`,
    { headers: authHeaders(token) },
  );
  const data = (await res.json()) as { values?: string[][] };
  return data.values?.[0]?.filter(Boolean) ?? [];
}

export async function appendTabRows(
  token: string,
  sheetId: string,
  tabName: string,
  rows: (string | number | boolean)[][],
): Promise<void> {
  if (rows.length === 0) return;
  await googleFetch(
    `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(tabName + '!A:A')}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ values: rows }),
    },
  );
}

export async function renameSite(
  token: string,
  sheetId: string,
  folderId: string,
  newName: string,
): Promise<void> {
  await googleFetch(`${SHEETS_API}/${sheetId}:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      requests: [{ updateSpreadsheetProperties: { properties: { title: `${newName} — Forms` }, fields: 'title' } }],
    }),
  });

  // The folder name is cosmetic. If it can't be renamed (moved, trashed) the
  // project rename still completes rather than leaving Sheet and manifest out of step.
  await googleFetch(`${DRIVE_API}/${folderId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ name: `${newName} — RG Forms` }),
  }).catch((err) => console.warn('Drive folder rename skipped:', err));
}

export async function createAssetFolder(
  token: string,
  folderName: string,
  parentFolderId: string,
): Promise<string> {
  const res = await googleFetch(DRIVE_API, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    }),
  });
  const data = (await res.json()) as { id: string };
  return data.id;
}
