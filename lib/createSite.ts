import {
  SHEETS_API,
  SCRIPT_API,
  DRIVE_API,
  authHeaders,
  apiCall,
  AppsScriptUserSettingError,
  createScriptProject,
  uploadCode,
  deployWebApp,
  styleHeaderRow,
} from '@/lib/core/provisionHelpers';
import { generateSiteScript, generateAppsScriptJson } from './siteScript';
import type { SiteManifest, SiteTab, SiteTabFormConfig } from '@/types';

export function toFieldKey(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'field';
}

// ─── Progress callback ────────────────────────────────────────────────────────

export type SiteProvisionStep = 'drive' | 'sheet' | 'script' | 'deploy' | 'manifest';
export type SiteProvisionStatus = 'running' | 'complete' | 'error';
export type SiteProvisionCallback = (
  step: SiteProvisionStep,
  status: SiteProvisionStatus,
  error?: string,
  errorCode?: string,
) => void;

export const SITE_PROVISION_STEPS: Array<{ id: SiteProvisionStep; label: string }> = [
  { id: 'drive',    label: 'Drive folder' },
  { id: 'sheet',    label: 'Google Sheet' },
  { id: 'script',   label: 'Apps Script project' },
  { id: 'deploy',   label: 'Web app deployment' },
  { id: 'manifest', label: 'Manifest + configuration' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  siteName:              string;
  notifyEmail:           string;
  googleAccount:         string;
  formLabel:             string;
  formConfig:            SiteTabFormConfig;
  notificationsEnabled:  boolean;
}

export async function createSite(
  token: string,
  input: CreateSiteInput,
  onStep: SiteProvisionCallback,
): Promise<SiteManifest> {
  const { siteName, notifyEmail, googleAccount, formLabel, formConfig, notificationsEnabled } = input;
  const createdAt   = new Date().toISOString();
  const projectSlug = siteName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const tabName     = 'contact';

  // ── 1. Drive: root folder ─────────────────────────────────────────────────

  onStep('drive', 'running');
  let rootFolderId = '';

  try {
    rootFolderId = await createDriveFolder(token, `${siteName} — RG Forms`);
    onStep('drive', 'complete');
  } catch (err) {
    onStep('drive', 'error', (err as Error).message);
    throw err;
  }

  // ── 2. Sheet: one form tab + hidden _manifest ─────────────────────────────

  onStep('sheet', 'running');
  let sheetId  = '';
  let sheetUrl = '';
  let tabGids: Record<string, number> = {};

  try {
    ({ sheetId, sheetUrl, tabGids } = await createMultiTabSheet(
      token,
      `${siteName} — Forms`,
      [{ title: tabName }, { title: '_manifest', hidden: true }],
    ));

    const headerCols = formConfig.fields?.length
      ? ['submitted_at', ...formConfig.fields.map((f) => toFieldKey(f.label))]
      : ['submitted_at', 'name', 'email', 'phone', 'message'];

    await writeTabData(token, sheetId, tabName, [headerCols]);

    const gid = tabGids[tabName];
    if (gid !== undefined) await styleHeaderRow(token, sheetId, gid);

    await fetch(`${DRIVE_API}/${sheetId}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ appProperties: { rgforms_type: 'site', project_slug: projectSlug } }),
    }).catch(() => {});

    await fetch(`${DRIVE_API}/${sheetId}?addParents=${rootFolderId}&removeParents=root`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    }).catch(() => {});

    onStep('sheet', 'complete');
  } catch (err) {
    if (sheetId) {
      await fetch(`${DRIVE_API}/${sheetId}`, { method: 'DELETE', headers: authHeaders(token) }).catch(() => {});
    }
    await fetch(`${DRIVE_API}/${rootFolderId}?supportsAllDrives=true`, {
      method: 'DELETE', headers: authHeaders(token),
    }).catch(() => {});
    onStep('sheet', 'error', (err as Error).message);
    throw err;
  }

  // ── 3. Script: create project + upload code ───────────────────────────────

  onStep('script', 'running');
  let scriptId      = '';
  let deploymentUrl = '';

  try {
    ({ scriptId } = await createScriptProject(token, `${siteName} — Forms API`, sheetId));
    await uploadCode(token, scriptId, generateSiteScript(notificationsEnabled), generateAppsScriptJson(notificationsEnabled));
    onStep('script', 'complete');
  } catch (err) {
    if (err instanceof AppsScriptUserSettingError) {
      await fetch(`${DRIVE_API}/${sheetId}`, { method: 'DELETE', headers: authHeaders(token) }).catch(() => {});
      await fetch(`${DRIVE_API}/${rootFolderId}`, { method: 'DELETE', headers: authHeaders(token) }).catch(() => {});
      onStep('script', 'error', (err as Error).message, 'apps-script-user-setting');
      throw err;
    }
    onStep('script', 'error', (err as Error).message);
    throw err;
  }

  onStep('deploy', 'running');
  try {
    deploymentUrl = await deployWebApp(token, scriptId, `${siteName} — Forms API`);
    onStep('deploy', 'complete');
  } catch (err) {
    onStep('deploy', 'error', (err as Error).message);
    throw err;
  }

  // ── 4. Manifest: write to _manifest tab ───────────────────────────────────

  onStep('manifest', 'running');

  const tab: SiteTab = {
    name:       tabName,
    label:      formLabel,
    type:       'form',
    moduleType: 'form',
    nameSuffix: formLabel,
    formConfig,
  };

  const manifest: SiteManifest = {
    project_slug:          projectSlug,
    site_name:             siteName,
    created_at:            createdAt,
    google_account:        googleAccount,
    script_url:            deploymentUrl,
    sheet_id:              sheetId,
    sheet_url:             sheetUrl,
    drive_root_folder_id:  rootFolderId,
    drive_root_folder_url: `https://drive.google.com/drive/folders/${rootFolderId}`,
    notification_email:    notifyEmail,
    tabs:                  [tab],
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
