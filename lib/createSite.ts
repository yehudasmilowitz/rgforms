/**
 * Provisions a complete website backend in the customer's Google account:
 *   - One Google Sheet with a tab per module + hidden _manifest tab
 *   - One Drive root folder; one subfolder per asset tab
 *   - One Apps Script (generic — reads _manifest at runtime, no per-site code)
 *
 * Returns a SiteManifest JSON the customer downloads as their handoff document.
 */

import {
  SHEETS_API,
  SCRIPT_API,
  DRIVE_API,
  authHeaders,
  apiCall,
  AppsScriptApiDisabledError,
  createScriptProject,
  uploadCode,
  deployWebApp,
  styleHeaderRow,
} from '@/lib/core/provisionHelpers';
import { generateSiteScript, generateAppsScriptJson } from './siteScript';
import type { SiteManifest, SiteTab } from '@/types';

// ─── Tab type mapping ─────────────────────────────────────────────────────────

const TAB_TYPE_MAP: Record<string, SiteTab['type']> = {
  siteconfig:  'key_value',
  content:     'rows',
  testimonial: 'rows',
  gallery:     'asset',
  form:        'form',
  calendar:    'rows',
  faq:         'rows',
  newsletter:  'form',
  menu:        'rows',
};

// ─── Default column / field definitions ──────────────────────────────────────

const KEY_VALUE_FIELDS: Record<string, string[]> = {
  siteconfig: ['site_name', 'tagline', 'phone', 'email', 'address', 'hours_weekday', 'hours_weekend', 'about'],
};

const ROW_COLUMNS: Record<string, string[]> = {
  content:     ['title', 'description', 'tags', 'link', 'slug', 'published'],
  testimonial: ['name', 'quote', 'role', 'company', 'rating', 'featured'],
  calendar:    ['title', 'date', 'location', 'description', 'slug'],
  faq:         ['question', 'answer', 'category', 'order'],
  menu:        ['name', 'description', 'price', 'category', 'image_url'],
};

const FORM_COLUMNS: Record<string, string[]> = {
  form:       ['submitted_at', 'name', 'email', 'phone', 'message'],
  newsletter: ['submitted_at', 'email', 'source'],
};

// ─── Progress callback ────────────────────────────────────────────────────────

export type SiteProvisionStep = 'drive' | 'sheet' | 'script' | 'deploy' | 'manifest';
export type SiteProvisionStatus = 'running' | 'complete' | 'error';
export type SiteProvisionCallback = (
  step: SiteProvisionStep,
  status: SiteProvisionStatus,
  error?: string,
) => void;

export const SITE_PROVISION_STEPS: Array<{ id: SiteProvisionStep; label: string }> = [
  { id: 'drive',    label: 'Drive folder + asset storage' },
  { id: 'sheet',    label: 'Google Sheet + tabs' },
  { id: 'script',   label: 'Apps Script project' },
  { id: 'deploy',   label: 'Web app deployment' },
  { id: 'manifest', label: 'Manifest + configuration' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let t = 'rgf_';
  for (let i = 0; i < 24; i++) t += chars[Math.floor(Math.random() * chars.length)];
  return t;
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

async function createDriveFolder(token: string, name: string, parentId?: string): Promise<string> {
  const body: Record<string, unknown> = { name, mimeType: 'application/vnd.google-apps.folder' };
  if (parentId) body.parents = [parentId];
  const result = await apiCall<{ id: string }>(DRIVE_API, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return result.id;
}

async function createMultiTabSheet(
  token: string,
  title: string,
  tabNames: Array<{ title: string; hidden?: boolean }>,
): Promise<{ sheetId: string; sheetUrl: string; tabGids: Record<string, number> }> {
  const result = await apiCall<{
    spreadsheetId: string;
    sheets: Array<{ properties: { title: string; sheetId: number } }>;
  }>(SHEETS_API, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      properties: { title },
      sheets: tabNames.map((t) => ({
        properties: { title: t.title, ...(t.hidden ? { hidden: true } : {}) },
      })),
    }),
  });

  const tabGids: Record<string, number> = {};
  for (const sheet of result.sheets) {
    tabGids[sheet.properties.title] = sheet.properties.sheetId;
  }
  return {
    sheetId:  result.spreadsheetId,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${result.spreadsheetId}/edit`,
    tabGids,
  };
}

async function writeTabData(
  token: string,
  sheetId: string,
  tabName: string,
  rows: (string | number | boolean)[][],
): Promise<void> {
  if (rows.length === 0) return;
  const range = `${tabName}!A1:${colLetter(rows[0].length)}${rows.length}`;
  await fetch(
    `${SHEETS_API}/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ values: rows }),
    },
  );
}

// ─── Main provisioner ─────────────────────────────────────────────────────────

export interface CreateSiteInput {
  siteName:      string;
  notifyEmail:   string;
  googleAccount: string;
  tabs: Array<{
    name:       string;
    label:      string;
    moduleType: string;
    nameSuffix: string;
  }>;
}

export async function createSite(
  token: string,
  input: CreateSiteInput,
  onStep: SiteProvisionCallback,
): Promise<SiteManifest> {
  const { siteName, notifyEmail, googleAccount, tabs: inputTabs } = input;
  const scriptToken = generateToken();
  const createdAt   = new Date().toISOString();
  const projectSlug = siteName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // ── 1. Drive: root folder + subfolders for asset tabs ────────────────────

  onStep('drive', 'running');
  let rootFolderId = '';
  const assetFolderIds: Record<string, string> = {};

  try {
    rootFolderId = await createDriveFolder(token, `${siteName} — Assets`);

    for (const tab of inputTabs) {
      if (TAB_TYPE_MAP[tab.moduleType] === 'asset') {
        assetFolderIds[tab.name] = await createDriveFolder(token, tab.name, rootFolderId);
      }
    }
    onStep('drive', 'complete');
  } catch (err) {
    onStep('drive', 'error', (err as Error).message);
    throw err;
  }

  // ── 2. Resolve final tab list ─────────────────────────────────────────────

  const resolvedTabs: SiteTab[] = inputTabs.map((t) => {
    const type = TAB_TYPE_MAP[t.moduleType] ?? 'rows';
    const tab: SiteTab = { name: t.name, label: t.label, type, moduleType: t.moduleType, nameSuffix: t.nameSuffix };
    if (type === 'asset' && assetFolderIds[t.name]) tab.drive_folder_id = assetFolderIds[t.name];
    return tab;
  });

  // ── 3. Sheet: create with all tabs + write seed data ─────────────────────

  onStep('sheet', 'running');
  let sheetId  = '';
  let sheetUrl = '';
  let tabGids: Record<string, number> = {};

  try {
    const sheetTabs = [
      ...resolvedTabs
        .filter((t) => t.type !== 'asset')
        .map((t) => ({ title: t.name })),
      { title: '_manifest', hidden: true },
    ];

    ({ sheetId, sheetUrl, tabGids } = await createMultiTabSheet(
      token,
      `${siteName} — Website Data`,
      sheetTabs,
    ));

    for (const tab of resolvedTabs) {
      if (tab.type === 'asset') continue;

      let rows: (string | number | boolean)[][] = [];

      if (tab.type === 'key_value') {
        const fields = KEY_VALUE_FIELDS[tab.moduleType] ?? ['name', 'value'];
        rows = fields.map((f) => [f, '']);
      } else if (tab.type === 'rows') {
        rows = [ROW_COLUMNS[tab.moduleType] ?? ['title', 'description']];
      } else if (tab.type === 'form') {
        rows = [FORM_COLUMNS[tab.moduleType] ?? ['submitted_at', 'name', 'email', 'message']];
      }

      await writeTabData(token, sheetId, tab.name, rows);

      const gid = tabGids[tab.name];
      if (gid !== undefined && (tab.type === 'rows' || tab.type === 'form')) {
        await styleHeaderRow(token, sheetId, gid);
      }
    }

    // Tag the sheet so we can discover it later without a project registry
    await fetch(`${DRIVE_API}/${sheetId}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ appProperties: { rgforms_type: 'site', project_slug: projectSlug } }),
    }).catch(() => {});

    onStep('sheet', 'complete');
  } catch (err) {
    await fetch(`${DRIVE_API}/${rootFolderId}?supportsAllDrives=true`, {
      method: 'DELETE', headers: authHeaders(token),
    }).catch(() => {});
    onStep('sheet', 'error', (err as Error).message);
    throw err;
  }

  // ── 4. Script: create project + upload generic code ───────────────────────

  onStep('script', 'running');
  let scriptId      = '';
  let deploymentUrl = '';

  try {
    ({ scriptId } = await createScriptProject(token, `${siteName} — Website API`, sheetId));
    const hasAssetTabs = resolvedTabs.some((t) => t.type === 'asset');
    const hasFormTabs  = resolvedTabs.some((t) => t.type === 'form');
    await uploadCode(token, scriptId, generateSiteScript(), generateAppsScriptJson(hasAssetTabs, hasFormTabs));
    onStep('script', 'complete');
  } catch (err) {
    if (err instanceof AppsScriptApiDisabledError) {
      await fetch(`${DRIVE_API}/${sheetId}`, { method: 'DELETE', headers: authHeaders(token) }).catch(() => {});
      await fetch(`${DRIVE_API}/${rootFolderId}?supportsAllDrives=true`, { method: 'DELETE', headers: authHeaders(token) }).catch(() => {});
    }
    onStep('script', 'error', (err as Error).message);
    throw err;
  }

  onStep('deploy', 'running');
  try {
    deploymentUrl = await deployWebApp(token, scriptId, `${siteName} Website API`);
    onStep('deploy', 'complete');
  } catch (err) {
    onStep('deploy', 'error', (err as Error).message);
    throw err;
  }

  // ── 5. Manifest: write to _manifest tab + return ──────────────────────────

  onStep('manifest', 'running');

  const manifest: SiteManifest = {
    project_slug:          projectSlug,
    created_at:            createdAt,
    google_account:        googleAccount,
    script_url:            deploymentUrl,
    script_token:          scriptToken,
    sheet_id:              sheetId,
    sheet_url:             sheetUrl,
    drive_root_folder_id:  rootFolderId,
    drive_root_folder_url: `https://drive.google.com/drive/folders/${rootFolderId}`,
    notification_email:    notifyEmail,
    tabs:                  resolvedTabs,
  };

  try {
    await writeTabData(token, sheetId, '_manifest', [
      ['manifest_json', JSON.stringify(manifest)],
      ['created_at',    createdAt],
      ['script_url',    deploymentUrl],
    ]);
    onStep('manifest', 'complete');
  } catch (err) {
    onStep('manifest', 'error', (err as Error).message);
    throw err;
  }

  return manifest;
}
