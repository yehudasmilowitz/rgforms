import type { SiteConfigResult, ProvisioningStep } from '@/types';
import { generateSiteConfigScript, SITE_CONFIG_SCRIPT_MANIFEST } from './siteConfigScriptTemplate';
import { registerModuleInProject } from './myForms';

type StepStatus = 'running' | 'complete' | 'error';
type StepCallback = (stepId: string, status: StepStatus, error?: string) => void;

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const SCRIPT_API = 'https://script.googleapis.com/v1/projects';
const DRIVE_API  = 'https://www.googleapis.com/drive/v3/files';

export class AppsScriptApiDisabledError extends Error {
  constructor() { super('AppsScriptApiDisabledError'); this.name = 'AppsScriptApiDisabledError'; }
}

export const SITE_CONFIG_PROVISIONING_STEPS: ProvisioningStep[] = [
  { id: 'sheet',  label: 'Creating config spreadsheet', description: 'Setting up your key-value store',            status: 'pending' },
  { id: 'script', label: 'Creating Apps Script',        description: 'Initializing the config API project',        status: 'pending' },
  { id: 'code',   label: 'Uploading handler code',      description: 'Writing the doGet() config handler',         status: 'pending' },
  { id: 'deploy', label: 'Publishing API endpoint',     description: 'Making your config endpoint live',           status: 'pending' },
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

// Step 1: Create spreadsheet with pre-seeded config keys
async function createConfigSheet(token: string, name: string): Promise<{ sheetId: string; sheetUrl: string }> {
  const result = await apiCall<{ spreadsheetId: string; sheets: Array<{ properties: { sheetId: number } }> }>(SHEETS_API, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      properties: { title: `${name} — RG Config` },
      sheets: [{ properties: { title: 'Config' } }],
    }),
  });
  const sheetId = result.spreadsheetId;
  const tabGid = result.sheets[0].properties.sheetId;

  // Seed the Config sheet with a header row + common starter keys
  const rows = [
    ['key', 'value', 'description'],
    ['site_name', name, 'Name of the site'],
    ['hero_title', '', 'Main headline on the homepage'],
    ['hero_subtitle', '', 'Subheading below the hero title'],
    ['hero_cta_label', '', 'Call-to-action button label'],
    ['hero_cta_url', '', 'Call-to-action button URL'],
    ['logo_url', '', 'URL of the site logo (use an RG Assets URL)'],
    ['contact_email', '', 'Email shown in the contact section'],
    ['footer_text', '', 'Footer tagline or copyright text'],
  ];

  await fetch(`${SHEETS_API}/${sheetId}/values/Config!A1:C${rows.length}?valueInputOption=RAW`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ values: rows }),
  });

  // Bold the header row
  await fetch(`${SHEETS_API}/${sheetId}:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      requests: [{
        repeatCell: {
          range: { sheetId: tabGid, startRowIndex: 0, endRowIndex: 1 },
          cell: { userEnteredFormat: { textFormat: { bold: true } } },
          fields: 'userEnteredFormat.textFormat.bold',
        },
      }],
    }),
  }).catch(() => {}); // non-fatal

  return {
    sheetId,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
  };
}

// Step 2: Create container-bound Apps Script
async function createScriptProject(token: string, name: string, parentId: string): Promise<{ scriptId: string; scriptUrl: string }> {
  const result = await apiCall<{ scriptId: string }>(SCRIPT_API, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ title: `${name} Config API`, parentId }),
  });
  return {
    scriptId: result.scriptId,
    scriptUrl: `https://script.google.com/d/${result.scriptId}/edit`,
  };
}

// Step 3: Upload script code
async function uploadCode(token: string, scriptId: string, moduleName: string): Promise<void> {
  await apiCall<unknown>(`${SCRIPT_API}/${scriptId}/content`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({
      files: [
        { name: 'Code',       type: 'SERVER_JS', source: generateSiteConfigScript(moduleName) },
        { name: 'appsscript', type: 'JSON',      source: JSON.stringify(SITE_CONFIG_SCRIPT_MANIFEST) },
      ],
    }),
  });
}

// Step 4: Deploy web app
async function deployWebApp(token: string, scriptId: string): Promise<string> {
  const version = await apiCall<{ versionNumber: number }>(`${SCRIPT_API}/${scriptId}/versions`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ description: 'rgforms site config initial version' }),
  });
  const result = await apiCall<{ entryPoints: Array<{ entryPointType: string; webApp: { url: string } }> }>(
    `${SCRIPT_API}/${scriptId}/deployments`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        versionNumber: version.versionNumber,
        manifestFileName: 'appsscript',
        description: 'rgforms site config API',
      }),
    },
  );
  const webApp = result.entryPoints?.find((ep) => ep.entryPointType === 'WEB_APP');
  if (!webApp?.webApp?.url) throw new Error('Deployment succeeded but no web app URL returned');
  return webApp.webApp.url;
}

// Save config to hidden _config tab
async function saveConfig(token: string, sheetId: string, config: {
  moduleName: string; scriptId: string; deploymentUrl: string; projectId: string;
}): Promise<void> {
  await fetch(`${SHEETS_API}/${sheetId}:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title: '_config', hidden: true } } }] }),
  }).catch(() => {});

  const rows: string[][] = [
    ['moduleType',    'siteconfig'],
    ['moduleName',    config.moduleName],
    ['createdAt',     new Date().toISOString()],
    ['scriptId',      config.scriptId],
    ['deploymentUrl', config.deploymentUrl],
    ['projectId',     config.projectId],
  ];

  await fetch(`${SHEETS_API}/${sheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ valueInputOption: 'RAW', data: [{ range: `_config!A1:B${rows.length}`, values: rows }] }),
  });
}

// Main export
export async function provisionSiteConfig(
  token: string,
  moduleName: string,
  onStepUpdate: StepCallback,
  projectId: string,
): Promise<SiteConfigResult> {
  let sheetId = '', sheetUrl = '';
  let scriptId = '', scriptUrl = '';

  onStepUpdate('sheet', 'running');
  try {
    ({ sheetId, sheetUrl } = await createConfigSheet(token, moduleName));
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

  await saveConfig(token, sheetId, { moduleName, scriptId, deploymentUrl, projectId });
  await registerModuleInProject(token, projectId, 'siteconfig', moduleName, sheetId, deploymentUrl);

  return { sheetId, sheetUrl, scriptId, scriptUrl, deploymentUrl };
}
