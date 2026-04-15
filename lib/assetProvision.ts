import type { AssetModuleResult, ProvisioningStep } from '@/types';
import { generateAssetScript, ASSET_SCRIPT_MANIFEST } from './assetScriptTemplate';

type StepStatus = 'running' | 'complete' | 'error';
type StepCallback = (stepId: string, status: StepStatus, error?: string) => void;

const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const SCRIPT_API = 'https://script.googleapis.com/v1/projects';

export class AppsScriptApiDisabledError extends Error {
  constructor() { super('AppsScriptApiDisabledError'); this.name = 'AppsScriptApiDisabledError'; }
}

export const ASSET_PROVISIONING_STEPS: ProvisioningStep[] = [
  { id: 'sheet',  label: 'Creating config spreadsheet', description: 'Setting up module registry',                  status: 'pending' },
  { id: 'folder', label: 'Creating Drive folder',       description: 'Creating your public asset storage',          status: 'pending' },
  { id: 'share',  label: 'Making folder public',        description: 'Enabling public access to assets',            status: 'pending' },
  { id: 'script', label: 'Creating Apps Script',        description: 'Initializing the listing API project',        status: 'pending' },
  { id: 'code',   label: 'Uploading handler code',      description: 'Writing the doGet() file listing handler',    status: 'pending' },
  { id: 'deploy', label: 'Publishing API endpoint',     description: 'Making your asset endpoint live',             status: 'pending' },
];

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function apiCall<T>(url: string, options: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: { message: res.statusText } })) as {
      error?: { status?: string; message?: string; details?: Array<{ reason?: string }> };
    };
    if (res.status === 403 && body.error?.status === 'PERMISSION_DENIED') {
      const details = (body.error.details ?? []) as Array<{ reason?: string }>;
      if (!details.some((d) => d.reason === 'ACCESS_TOKEN_SCOPE_INSUFFICIENT')) {
        throw new AppsScriptApiDisabledError();
      }
    }
    throw new Error(body.error?.message ?? `API error: ${res.status}`);
  }
  return res.json() as T;
}

// Step 1: Create anchor spreadsheet (config storage + dashboard listing)
async function createAnchorSheet(token: string, name: string): Promise<{ sheetId: string; sheetUrl: string }> {
  const result = await apiCall<{ spreadsheetId: string }>(SHEETS_API, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ properties: { title: `${name} — RG Assets` } }),
  });
  return {
    sheetId: result.spreadsheetId,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${result.spreadsheetId}/edit`,
  };
}

// Step 2: Create Drive folder
async function createDriveFolder(token: string, name: string): Promise<{ folderId: string; folderUrl: string }> {
  const result = await apiCall<{ id: string }>(DRIVE_API, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ name: `${name} Assets`, mimeType: 'application/vnd.google-apps.folder' }),
  });
  return {
    folderId: result.id,
    folderUrl: `https://drive.google.com/drive/folders/${result.id}`,
  };
}

// Step 3: Share folder publicly (anyone can view)
async function shareFolderPublic(token: string, folderId: string): Promise<void> {
  await apiCall<unknown>(`${DRIVE_API}/${folderId}/permissions`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ type: 'anyone', role: 'reader' }),
  });
}

// Step 4: Create container-bound Apps Script
async function createScriptProject(token: string, name: string, parentId: string): Promise<{ scriptId: string; scriptUrl: string }> {
  const result = await apiCall<{ scriptId: string }>(SCRIPT_API, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ title: `${name} Assets API`, parentId }),
  });
  return { scriptId: result.scriptId, scriptUrl: `https://script.google.com/d/${result.scriptId}/edit` };
}

// Step 5: Upload script code
async function uploadCode(token: string, scriptId: string, folderId: string, moduleName: string): Promise<void> {
  await apiCall<unknown>(`${SCRIPT_API}/${scriptId}/content`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({
      files: [
        { name: 'Code',       type: 'SERVER_JS', source: generateAssetScript(folderId, moduleName) },
        { name: 'appsscript', type: 'JSON',      source: JSON.stringify(ASSET_SCRIPT_MANIFEST) },
      ],
    }),
  });
}

// Step 6: Deploy web app
async function deployWebApp(token: string, scriptId: string): Promise<string> {
  const version = await apiCall<{ versionNumber: number }>(`${SCRIPT_API}/${scriptId}/versions`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ description: 'rgforms asset module initial version' }),
  });
  const result = await apiCall<{ entryPoints: Array<{ entryPointType: string; webApp: { url: string } }> }>(
    `${SCRIPT_API}/${scriptId}/deployments`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ versionNumber: version.versionNumber, manifestFileName: 'appsscript', description: 'rgforms asset API' }),
    },
  );
  const webApp = result.entryPoints?.find((ep) => ep.entryPointType === 'WEB_APP');
  if (!webApp?.webApp?.url) throw new Error('Deployment succeeded but no web app URL returned');
  return webApp.webApp.url;
}

// Save config to anchor sheet
async function saveConfig(token: string, sheetId: string, config: {
  moduleName: string; scriptId: string; folderId: string; folderUrl: string; deploymentUrl: string;
}): Promise<void> {
  // Add hidden _config tab
  await fetch(`${SHEETS_API}/${sheetId}:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title: '_config', hidden: true } } }] }),
  }).catch(() => {});

  const rows = [
    ['moduleType',    'asset'],
    ['moduleName',    config.moduleName],
    ['createdAt',     new Date().toISOString()],
    ['scriptId',      config.scriptId],
    ['folderId',      config.folderId],
    ['folderUrl',     config.folderUrl],
    ['deploymentUrl', config.deploymentUrl],
  ];

  await fetch(`${SHEETS_API}/${sheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ valueInputOption: 'RAW', data: [{ range: '_config!A1:B7', values: rows }] }),
  });
}

// Main export
export async function provisionAssetModule(
  token: string,
  moduleName: string,
  onStepUpdate: StepCallback,
): Promise<AssetModuleResult> {
  let sheetId = '', sheetUrl = '';
  let folderId = '', folderUrl = '';
  let scriptId = '', scriptUrl = '';

  onStepUpdate('sheet', 'running');
  try {
    ({ sheetId, sheetUrl } = await createAnchorSheet(token, moduleName));
    onStepUpdate('sheet', 'complete');
  } catch (err) { onStepUpdate('sheet', 'error', (err as Error).message); throw err; }

  onStepUpdate('folder', 'running');
  try {
    ({ folderId, folderUrl } = await createDriveFolder(token, moduleName));
    onStepUpdate('folder', 'complete');
  } catch (err) { onStepUpdate('folder', 'error', (err as Error).message); throw err; }

  onStepUpdate('share', 'running');
  try {
    await shareFolderPublic(token, folderId);
    onStepUpdate('share', 'complete');
  } catch (err) { onStepUpdate('share', 'error', (err as Error).message); throw err; }

  onStepUpdate('script', 'running');
  try {
    ({ scriptId, scriptUrl } = await createScriptProject(token, moduleName, sheetId));
    onStepUpdate('script', 'complete');
  } catch (err) {
    if (err instanceof AppsScriptApiDisabledError) {
      await fetch(`${DRIVE_API}/${sheetId}`, { method: 'DELETE', headers: authHeaders(token) }).catch(() => {});
      await fetch(`${DRIVE_API}/${folderId}`, { method: 'DELETE', headers: authHeaders(token) }).catch(() => {});
    } else {
      onStepUpdate('script', 'error', (err as Error).message);
    }
    throw err;
  }

  onStepUpdate('code', 'running');
  try {
    await uploadCode(token, scriptId, folderId, moduleName);
    onStepUpdate('code', 'complete');
  } catch (err) { onStepUpdate('code', 'error', (err as Error).message); throw err; }

  onStepUpdate('deploy', 'running');
  let deploymentUrl = '';
  try {
    deploymentUrl = await deployWebApp(token, scriptId);
    onStepUpdate('deploy', 'complete');
  } catch (err) { onStepUpdate('deploy', 'error', (err as Error).message); throw err; }

  await saveConfig(token, sheetId, { moduleName, scriptId, folderId, folderUrl, deploymentUrl });

  return { sheetId, sheetUrl, scriptId, scriptUrl, folderId, folderUrl, deploymentUrl };
}
