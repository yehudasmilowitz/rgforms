import type { ContentModuleConfig, ContentModuleResult, ProvisioningStep } from '@/types';
import { generateContentScript, CONTENT_SCRIPT_MANIFEST } from './contentScriptTemplate';
import { registerModuleInProject } from './myForms';

type StepStatus = 'running' | 'complete' | 'error';
type StepCallback = (stepId: string, status: StepStatus, error?: string) => void;

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const SCRIPT_API = 'https://script.googleapis.com/v1/projects';

export class AppsScriptApiDisabledError extends Error {
  constructor() {
    super('AppsScriptApiDisabledError');
    this.name = 'AppsScriptApiDisabledError';
  }
}

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

async function apiCall<T>(url: string, options: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: { message: res.statusText } })) as {
      error?: { status?: string; message?: string; details?: Array<{ reason?: string }> };
    };
    if (res.status === 403 && body.error?.status === 'PERMISSION_DENIED') {
      const details = (body.error.details ?? []) as Array<{ reason?: string }>;
      const isScopeError = details.some((d) => d.reason === 'ACCESS_TOKEN_SCOPE_INSUFFICIENT');
      if (!isScopeError) throw new AppsScriptApiDisabledError();
    }
    throw new Error(body.error?.message ?? `API error: ${res.status}`);
  }
  return res.json() as T;
}

// ─── Provisioning steps ──────────────────────────────────────────────────────

export const CONTENT_PROVISIONING_STEPS: ProvisioningStep[] = [
  { id: 'sheet',  label: 'Creating Google Sheet',     description: 'Setting up your content spreadsheet',       status: 'pending', scopes: [{ label: 'drive.file' }] },
  { id: 'script', label: 'Creating Apps Script',      description: 'Initializing your content API project',     status: 'pending', scopes: [{ label: 'script.projects', sensitive: true }] },
  { id: 'config', label: 'Adding configuration',      description: 'Writing field schema and module settings',  status: 'pending', scopes: [{ label: 'drive.file' }] },
  { id: 'code',   label: 'Uploading handler code',    description: 'Deploying the doGet / doPost handlers',     status: 'pending', scopes: [{ label: 'script.projects', sensitive: true }] },
  { id: 'deploy', label: 'Publishing API endpoint',   description: 'Making your content endpoint live',         status: 'pending', scopes: [{ label: 'script.deployments', sensitive: true }] },
];

// Step 1: Create the Sheet with user-defined columns + system columns
async function createContentSheet(
  accessToken: string,
  config: ContentModuleConfig,
): Promise<{ sheetId: string; sheetUrl: string }> {
  // Column order: user fields → slug? → published? → _id → _created_at → _updated_at
  const userHeaders = config.fields.map((f) => f.label);
  const optionalHeaders = [
    ...(config.hasSlug      ? ['slug']      : []),
    ...(config.hasPublished ? ['published'] : []),
  ];
  const systemHeaders = ['_id', '_created_at', '_updated_at'];
  const headers = [...userHeaders, ...optionalHeaders, ...systemHeaders];
  const totalCols = headers.length;

  const body = {
    properties: { title: config.name },
    sheets: [
      {
        properties: { title: 'Content', sheetId: 0 },
        data: [{
          startRow: 0,
          startColumn: 0,
          rowData: [{
            values: headers.map((h) => ({
              userEnteredValue: { stringValue: h },
              userEnteredFormat: { textFormat: { bold: true } },
            })),
          }],
        }],
      },
    ],
  };

  const result = await apiCall<{ spreadsheetId: string; spreadsheetUrl: string }>(SHEETS_API, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(body),
  });

  // Freeze the header row
  await fetch(`${SHEETS_API}/${result.spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      requests: [{
        updateSheetProperties: {
          properties: { sheetId: 0, gridProperties: { frozenRowCount: 1 } },
          fields: 'gridProperties.frozenRowCount',
        },
      }],
    }),
  }).catch(() => {});

  // Auto-resize all columns for readability
  await fetch(`${SHEETS_API}/${result.spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      requests: [{
        autoResizeDimensions: {
          dimensions: { sheetId: 0, dimension: 'COLUMNS', startIndex: 0, endIndex: totalCols },
        },
      }],
    }),
  }).catch(() => {});

  return {
    sheetId: result.spreadsheetId,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${result.spreadsheetId}/edit`,
  };
}

// Step 2: Create container-bound Apps Script
async function createScriptProject(
  accessToken: string,
  moduleName: string,
  parentId: string,
): Promise<{ scriptId: string; scriptUrl: string }> {
  const result = await apiCall<{ scriptId: string }>(SCRIPT_API, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      title: `${moduleName} Content API`,
      parentId,
    }),
  });
  return {
    scriptId: result.scriptId,
    scriptUrl: `https://script.google.com/d/${result.scriptId}/edit`,
  };
}

// Step 3: Write _config tab with module metadata
async function addContentConfigTab(
  accessToken: string,
  sheetId: string,
  config: ContentModuleConfig,
  scriptId: string,
  writeToken: string,
  projectId: string,
): Promise<void> {
  // Add a hidden _config sheet
  await apiCall<unknown>(`${SHEETS_API}/${sheetId}:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      requests: [
        { addSheet: { properties: { title: '_config', hidden: true } } },
      ],
    }),
  });

  const now = new Date().toISOString();
  const rows: string[][] = [
    ['moduleType',    'content'],
    ['moduleName',    config.name],
    ['fields',        JSON.stringify(config.fields)],
    ['hasSlug',       String(config.hasSlug)],
    ['hasPublished',  String(config.hasPublished)],
    ['createdAt',     now],
    ['scriptId',      scriptId],
    ['writeToken',    writeToken],
    ['deploymentUrl', ''],  // filled in after deploy
    ['projectId', projectId],
  ];

  await fetch(`${SHEETS_API}/${sheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      valueInputOption: 'RAW',
      data: [{ range: `_config!A1:B${rows.length}`, values: rows }],
    }),
  });
}

// Step 4: Upload the content API script code
async function uploadContentCode(
  accessToken: string,
  scriptId: string,
  config: ContentModuleConfig,
  writeToken: string,
): Promise<void> {
  const code = generateContentScript(config, writeToken);
  await apiCall<unknown>(`${SCRIPT_API}/${scriptId}/content`, {
    method: 'PUT',
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      files: [
        { name: 'Code',        type: 'SERVER_JS', source: code },
        { name: 'appsscript',  type: 'JSON',      source: JSON.stringify(CONTENT_SCRIPT_MANIFEST) },
      ],
    }),
  });
}

// Step 5: Deploy as public web app
async function deployWebApp(accessToken: string, scriptId: string): Promise<string> {
  const version = await apiCall<{ versionNumber: number }>(
    `${SCRIPT_API}/${scriptId}/versions`,
    {
      method: 'POST',
      headers: authHeaders(accessToken),
      body: JSON.stringify({ description: 'rgforms content module initial version' }),
    },
  );

  const result = await apiCall<{
    entryPoints: Array<{ entryPointType: string; webApp: { url: string } }>;
  }>(`${SCRIPT_API}/${scriptId}/deployments`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      versionNumber: version.versionNumber,
      manifestFileName: 'appsscript',
      description: 'rgforms content API deployment',
    }),
  });

  const webApp = result.entryPoints?.find((ep) => ep.entryPointType === 'WEB_APP');
  if (!webApp?.webApp?.url) throw new Error('Deployment succeeded but no web app URL returned');
  return webApp.webApp.url;
}

async function saveDeploymentUrl(
  accessToken: string,
  sheetId: string,
  deploymentUrl: string,
): Promise<void> {
  await fetch(`${SHEETS_API}/${sheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      valueInputOption: 'RAW',
      data: [{ range: '_config!A9:B9', values: [['deploymentUrl', deploymentUrl]] }],
    }),
  }).catch(() => {});
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function provisionContentModule(
  accessToken: string,
  config: ContentModuleConfig,
  writeToken: string,
  onStepUpdate: StepCallback,
  projectId: string,
): Promise<ContentModuleResult> {
  let sheetId = '';
  let sheetUrl = '';
  let scriptId = '';
  let scriptUrl = '';

  onStepUpdate('sheet', 'running');
  try {
    ({ sheetId, sheetUrl } = await createContentSheet(accessToken, config));
    onStepUpdate('sheet', 'complete');
  } catch (err) {
    onStepUpdate('sheet', 'error', (err as Error).message);
    throw err;
  }

  onStepUpdate('script', 'running');
  try {
    ({ scriptId, scriptUrl } = await createScriptProject(accessToken, config.name, sheetId));
    onStepUpdate('script', 'complete');
  } catch (err) {
    if (err instanceof AppsScriptApiDisabledError) {
      await fetch(`https://www.googleapis.com/drive/v3/files/${sheetId}`, {
        method: 'DELETE',
        headers: authHeaders(accessToken),
      }).catch(() => {});
    } else {
      onStepUpdate('script', 'error', (err as Error).message);
    }
    throw err;
  }

  onStepUpdate('config', 'running');
  try {
    await addContentConfigTab(accessToken, sheetId, config, scriptId, writeToken, projectId);
    onStepUpdate('config', 'complete');
  } catch (err) {
    onStepUpdate('config', 'error', (err as Error).message);
    throw err;
  }

  onStepUpdate('code', 'running');
  try {
    await uploadContentCode(accessToken, scriptId, config, writeToken);
    onStepUpdate('code', 'complete');
  } catch (err) {
    onStepUpdate('code', 'error', (err as Error).message);
    throw err;
  }

  onStepUpdate('deploy', 'running');
  let deploymentUrl = '';
  try {
    deploymentUrl = await deployWebApp(accessToken, scriptId);
    onStepUpdate('deploy', 'complete');
  } catch (err) {
    onStepUpdate('deploy', 'error', (err as Error).message);
    throw err;
  }

  await saveDeploymentUrl(accessToken, sheetId, deploymentUrl);
  await registerModuleInProject(accessToken, projectId, 'content', config.name, sheetId, deploymentUrl);

  return { sheetId, sheetUrl, scriptId, scriptUrl, deploymentUrl, writeToken };
}
