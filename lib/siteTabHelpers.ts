import { SHEETS_API, DRIVE_API, authHeaders, styleHeaderRow } from '@/lib/core/provisionHelpers';
import type { SiteManifest, SiteTab } from '@/types';

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
  await fetch(
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
  const addRes = await fetch(`${SHEETS_API}/${sheetId}:batchUpdate`, {
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
    await fetch(
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
  const infoRes = await fetch(
    `${SHEETS_API}/${sheetId}?fields=sheets.properties(title,sheetId)`,
    { headers: authHeaders(token) },
  );
  const info = (await infoRes.json()) as {
    sheets?: Array<{ properties: { title: string; sheetId: number } }>;
  };
  const sheet = info.sheets?.find((s) => s.properties.title === tabName);
  if (!sheet) return;

  await fetch(`${SHEETS_API}/${sheetId}:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ requests: [{ deleteSheet: { sheetId: sheet.properties.sheetId } }] }),
  });
}

export async function updateTabHeaders(
  token: string,
  sheetId: string,
  tabName: string,
  columns: string[],
): Promise<void> {
  if (columns.length === 0) return;
  const range = `${tabName}!A1:${colLetter(columns.length)}1`;
  await fetch(
    `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ values: [columns] }),
    },
  );
}

export async function fetchTabHeaders(
  token: string,
  sheetId: string,
  tabName: string,
): Promise<string[]> {
  const res = await fetch(
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
  await fetch(
    `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(tabName + '!A:A')}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ values: rows }),
    },
  );
}

export async function createAssetFolder(
  token: string,
  folderName: string,
  parentFolderId: string,
): Promise<string> {
  const res = await fetch(DRIVE_API, {
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
