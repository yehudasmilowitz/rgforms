import { DRIVE_API, SHEETS_API, authHeaders } from '@/lib/core/provisionHelpers';
import type { SiteManifest } from '@/types';

export interface SiteSummary {
  sheetId:   string;
  siteName:  string;
  createdAt: string;
  sheetUrl:  string;
}

export async function listSites(token: string, signal?: AbortSignal): Promise<SiteSummary[]> {
  const query  = encodeURIComponent("appProperties has { key='sheetspin_type' and value='site' } and trashed=false");
  const fields = encodeURIComponent('files(id,name,createdTime,webViewLink)');
  const res = await fetch(
    `${DRIVE_API}?q=${query}&fields=${fields}&orderBy=createdTime desc`,
    { headers: authHeaders(token), signal },
  );
  if (!res.ok) return [];

  const data = (await res.json()) as {
    files?: Array<{ id: string; name: string; createdTime: string; webViewLink: string }>;
  };

  return (data.files ?? []).map((f) => ({
    sheetId:  f.id,
    siteName: f.name.replace(/ — Website Data$/, ''),
    createdAt: f.createdTime,
    sheetUrl:  f.webViewLink,
  }));
}

export async function loadSiteManifest(token: string, sheetId: string): Promise<SiteManifest | null> {
  const res = await fetch(
    `${SHEETS_API}/${sheetId}/values/${encodeURIComponent('_manifest!A:B')}`,
    { headers: authHeaders(token) },
  );
  if (!res.ok) return null;

  const data = (await res.json()) as { values?: string[][] };
  const row = (data.values ?? []).find((r) => r[0] === 'manifest_json');
  if (!row?.[1]) return null;

  try {
    return JSON.parse(row[1]) as SiteManifest;
  } catch {
    return null;
  }
}
