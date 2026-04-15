import type { GalleryResult, ProvisioningStep } from '@/types';
import { generateGalleryScript, GALLERY_SCRIPT_MANIFEST } from './galleryScriptTemplate';

type StepStatus = 'running' | 'complete' | 'error';
type StepCallback = (stepId: string, status: StepStatus, error?: string) => void;

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const SCRIPT_API = 'https://script.googleapis.com/v1/projects';
const DRIVE_API  = 'https://www.googleapis.com/drive/v3/files';

export class AppsScriptApiDisabledError extends Error {
  constructor() { super('AppsScriptApiDisabledError'); this.name = 'AppsScriptApiDisabledError'; }
}

export const GALLERY_PROVISIONING_STEPS: ProvisioningStep[] = [
  { id: 'sheet',  label: 'Creating Gallery spreadsheet', description: 'Setting up your image registry',     status: 'pending' },
  { id: 'script', label: 'Creating Apps Script',         description: 'Initializing the gallery API',       status: 'pending' },
  { id: 'code',   label: 'Uploading handler code',       description: 'Writing the doGet() gallery handler', status: 'pending' },
  { id: 'deploy', label: 'Publishing API endpoint',      description: 'Making your gallery endpoint live',  status: 'pending' },
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

// Step 1: Create spreadsheet with Gallery tab + sample placeholder rows
async function createGallerySheet(token: string, name: string): Promise<{ sheetId: string; sheetUrl: string }> {
  const result = await apiCall<{ spreadsheetId: string }>(SHEETS_API, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      properties: { title: `${name} — RG Gallery` },
      sheets: [{ properties: { title: 'Gallery' } }],
    }),
  });
  const sheetId = result.spreadsheetId;

  // Headers + placeholder rows (users replace image URLs with real ones)
  const rows = [
    ['Title', 'Image URL', 'Caption', 'Alt', 'Category', 'Featured', 'Order', 'Link URL'],
    ['Sample Image 1', '', 'A sample image — replace this URL with your image',      'Sample image 1', 'portfolio', 'TRUE',  '1', ''],
    ['Sample Image 2', '', 'Another sample — replace with a real image URL',         'Sample image 2', 'portfolio', 'FALSE', '2', ''],
    ['Sample Image 3', '', 'Featured image — add your URL and set Featured to TRUE', 'Sample image 3', 'featured',  'TRUE',  '3', ''],
  ];

  await fetch(`${SHEETS_API}/${sheetId}/values/Gallery!A1:H${rows.length}?valueInputOption=RAW`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ values: rows }),
  });

  // Bold header row, freeze row 1
  await fetch(`${SHEETS_API}/${sheetId}:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      requests: [
        {
          repeatCell: {
            range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
            cell: { userEnteredFormat: { textFormat: { bold: true } } },
            fields: 'userEnteredFormat.textFormat.bold',
          },
        },
        {
          updateSheetProperties: {
            properties: { sheetId: 0, gridProperties: { frozenRowCount: 1 } },
            fields: 'gridProperties.frozenRowCount',
          },
        },
      ],
    }),
  }).catch(() => {});

  return {
    sheetId,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
  };
}

async function createScriptProject(token: string, name: string, parentId: string): Promise<{ scriptId: string; scriptUrl: string }> {
  const result = await apiCall<{ scriptId: string }>(SCRIPT_API, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ title: `${name} Gallery API`, parentId }),
  });
  return {
    scriptId: result.scriptId,
    scriptUrl: `https://script.google.com/d/${result.scriptId}/edit`,
  };
}

async function uploadCode(token: string, scriptId: string, moduleName: string): Promise<void> {
  await apiCall<unknown>(`${SCRIPT_API}/${scriptId}/content`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({
      files: [
        { name: 'Code',       type: 'SERVER_JS', source: generateGalleryScript(moduleName) },
        { name: 'appsscript', type: 'JSON',      source: JSON.stringify(GALLERY_SCRIPT_MANIFEST) },
      ],
    }),
  });
}

async function deployWebApp(token: string, scriptId: string): Promise<string> {
  const version = await apiCall<{ versionNumber: number }>(`${SCRIPT_API}/${scriptId}/versions`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ description: 'rgforms gallery initial version' }),
  });
  const result = await apiCall<{ entryPoints: Array<{ entryPointType: string; webApp: { url: string } }> }>(
    `${SCRIPT_API}/${scriptId}/deployments`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        versionNumber: version.versionNumber,
        manifestFileName: 'appsscript',
        description: 'rgforms gallery API',
      }),
    },
  );
  const webApp = result.entryPoints?.find((ep) => ep.entryPointType === 'WEB_APP');
  if (!webApp?.webApp?.url) throw new Error('Deployment succeeded but no web app URL returned');
  return webApp.webApp.url;
}

async function saveConfig(token: string, sheetId: string, config: {
  moduleName: string; scriptId: string; deploymentUrl: string;
}): Promise<void> {
  await fetch(`${SHEETS_API}/${sheetId}:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title: '_config', hidden: true } } }] }),
  }).catch(() => {});

  const rows = [
    ['moduleType',    'gallery'],
    ['moduleName',    config.moduleName],
    ['createdAt',     new Date().toISOString()],
    ['scriptId',      config.scriptId],
    ['deploymentUrl', config.deploymentUrl],
  ];

  await fetch(`${SHEETS_API}/${sheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ valueInputOption: 'RAW', data: [{ range: '_config!A1:B5', values: rows }] }),
  });
}

export async function provisionGallery(
  token: string,
  moduleName: string,
  onStepUpdate: StepCallback,
): Promise<GalleryResult> {
  let sheetId = '', sheetUrl = '';
  let scriptId = '', scriptUrl = '';

  onStepUpdate('sheet', 'running');
  try {
    ({ sheetId, sheetUrl } = await createGallerySheet(token, moduleName));
    onStepUpdate('sheet', 'complete');
  } catch (err) { onStepUpdate('sheet', 'error', (err as Error).message); throw err; }

  onStepUpdate('script', 'running');
  try {
    ({ scriptId, scriptUrl } = await createScriptProject(token, moduleName, sheetId));
    onStepUpdate('script', 'complete');
  } catch (err) {
    if (err instanceof AppsScriptApiDisabledError) {
      await fetch(`${DRIVE_API}/${sheetId}`, { method: 'DELETE', headers: authHeaders(token) }).catch(() => {});
    } else {
      onStepUpdate('script', 'error', (err as Error).message);
    }
    throw err;
  }

  onStepUpdate('code', 'running');
  try {
    await uploadCode(token, scriptId, moduleName);
    onStepUpdate('code', 'complete');
  } catch (err) { onStepUpdate('code', 'error', (err as Error).message); throw err; }

  onStepUpdate('deploy', 'running');
  let deploymentUrl = '';
  try {
    deploymentUrl = await deployWebApp(token, scriptId);
    onStepUpdate('deploy', 'complete');
  } catch (err) { onStepUpdate('deploy', 'error', (err as Error).message); throw err; }

  await saveConfig(token, sheetId, { moduleName, scriptId, deploymentUrl });

  return { sheetId, sheetUrl, scriptId, scriptUrl, deploymentUrl };
}
