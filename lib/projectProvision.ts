import type { ProjectSummary, ProvisioningStep } from '@/types';
import { generateProjectScript, PROJECT_SCRIPT_MANIFEST } from './projectScriptTemplate';

export const PROJECT_PROVISIONING_STEPS: ProvisioningStep[] = [
  { id: 'sheet',  label: 'Creating project sheet',  description: 'Setting up your project workspace',    status: 'pending', scopes: [{ label: 'drive.file' }] },
  { id: 'script', label: 'Creating Apps Script',    description: 'Building your project API',             status: 'pending', scopes: [{ label: 'script.projects', sensitive: true }] },
  { id: 'config', label: 'Writing project config',  description: 'Saving project metadata to the sheet', status: 'pending', scopes: [{ label: 'drive.file' }] },
  { id: 'code',   label: 'Uploading API handler',   description: 'Deploying the project endpoint code',  status: 'pending', scopes: [{ label: 'script.projects', sensitive: true }] },
  { id: 'deploy', label: 'Publishing project API',  description: 'Making your project endpoint live',    status: 'pending', scopes: [{ label: 'script.deployments', sensitive: true }] },
];

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const SCRIPT_API  = 'https://script.googleapis.com/v1/projects';
const DRIVE_API   = 'https://www.googleapis.com/drive/v3/files';

type StepStatus = 'running' | 'complete' | 'error';
type StepCallback = (stepId: string, status: StepStatus, error?: string) => void;

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function apiCall<T>(url: string, options: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: { message: (res as Response).statusText } })) as {
      error?: { message?: string };
    };
    throw new Error(body.error?.message ?? `API error: ${res.status}`);
  }
  return res.json() as T;
}

// Step 1 — Create the project spreadsheet
async function createProjectSheet(token: string, projectName: string): Promise<{ sheetId: string; sheetUrl: string }> {
  const result = await apiCall<{ spreadsheetId: string; spreadsheetUrl: string }>(SHEETS_API, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      properties: { title: `${projectName} — RG Project` },
      sheets: [
        {
          properties: { title: 'Modules', sheetId: 0, index: 0 },
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: [{
              values: ['module_type', 'module_name', 'sheet_id', 'deployment_url', 'created_at'].map((h) => ({
                userEnteredValue: { stringValue: h },
                userEnteredFormat: { textFormat: { bold: true } },
              })),
            }],
          }],
        },
      ],
    }),
  });

  const sheetId = result.spreadsheetId;

  // Tag the Drive file so listProjects can find it with an appProperties query
  // instead of relying on the sheet title.
  await fetch(`${DRIVE_API}/${sheetId}?fields=id`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ appProperties: { sheetspin_type: 'project' } }),
  }).catch(() => {}); // best-effort — provisioning still succeeds without it

  return { sheetId, sheetUrl: result.spreadsheetUrl };
}

// Step 2 — Create container-bound Apps Script project
async function createScriptProject(token: string, projectName: string, sheetId: string): Promise<{ scriptId: string; scriptUrl: string }> {
  const result = await apiCall<{ scriptId: string }>(SCRIPT_API, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ title: `${projectName} — RG Project API`, parentId: sheetId }),
  });

  return {
    scriptId: result.scriptId,
    scriptUrl: `https://script.google.com/d/${result.scriptId}/edit`,
  };
}

// Step 3 — Write _config tab to the project sheet
async function writeProjectConfig(
  token: string,
  sheetId: string,
  projectName: string,
  scriptId: string,
  createdAt: string,
): Promise<void> {
  // Add hidden _config tab
  await apiCall<unknown>(`${SHEETS_API}/${sheetId}:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      requests: [{
        addSheet: {
          properties: { title: '_config', hidden: true, tabColor: { red: 0.4, green: 0.4, blue: 0.4 } },
        },
      }],
    }),
  });

  const configRows: string[][] = [
    ['moduleType',   'project'],
    ['projectName',  projectName],
    ['createdAt',    createdAt],
    ['scriptId',     scriptId],
  ];

  await apiCall<unknown>(`${SHEETS_API}/${sheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      valueInputOption: 'RAW',
      data: [{ range: `_config!A1:B${configRows.length}`, values: configRows }],
    }),
  });
}

// Step 4 — Upload the Apps Script source code
async function uploadScriptCode(token: string, scriptId: string, projectId: string, projectName: string, createdAt: string): Promise<void> {
  await apiCall<unknown>(`${SCRIPT_API}/${scriptId}/content`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({
      files: [
        { name: 'Code',       type: 'SERVER_JS', source: generateProjectScript(projectId, projectName, createdAt) },
        { name: 'appsscript', type: 'JSON',      source: JSON.stringify(PROJECT_SCRIPT_MANIFEST) },
      ],
    }),
  });
}

// Step 5 — Deploy as web app and return the endpoint URL
async function deployWebApp(token: string, scriptId: string): Promise<string> {
  const version = await apiCall<{ versionNumber: number }>(
    `${SCRIPT_API}/${scriptId}/versions`,
    { method: 'POST', headers: authHeaders(token), body: JSON.stringify({ description: 'sheetspin project initial version' }) },
  );

  const result = await apiCall<{
    entryPoints: Array<{ entryPointType: string; webApp: { url: string } }>;
  }>(`${SCRIPT_API}/${scriptId}/deployments`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      versionNumber: version.versionNumber,
      manifestFileName: 'appsscript',
      description: 'sheetspin project API',
    }),
  });

  const webApp = result.entryPoints?.find((ep) => ep.entryPointType === 'WEB_APP');
  if (!webApp?.webApp?.url) throw new Error('Deployment succeeded but no web app URL returned');
  return webApp.webApp.url;
}

// Save deploymentUrl back into _config after deploy
async function saveDeploymentUrl(token: string, sheetId: string, deploymentUrl: string): Promise<void> {
  await fetch(`${SHEETS_API}/${sheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      valueInputOption: 'RAW',
      data: [{ range: '_config!A5:B5', values: [['deploymentUrl', deploymentUrl]] }],
    }),
  }).catch(() => {});
}

// Main export — provisions a new project and reports progress via onStepUpdate
export async function provisionProject(
  token: string,
  projectName: string,
  onStepUpdate: StepCallback,
): Promise<ProjectSummary> {
  const createdAt = new Date().toISOString();
  let sheetId = '';
  let sheetUrl = '';
  let scriptId = '';
  let scriptUrl = '';

  onStepUpdate('sheet', 'running');
  try {
    ({ sheetId, sheetUrl } = await createProjectSheet(token, projectName));
    onStepUpdate('sheet', 'complete');
  } catch (err) {
    onStepUpdate('sheet', 'error', (err as Error).message);
    throw err;
  }

  onStepUpdate('script', 'running');
  try {
    ({ scriptId, scriptUrl } = await createScriptProject(token, projectName, sheetId));
    onStepUpdate('script', 'complete');
  } catch (err) {
    onStepUpdate('script', 'error', (err as Error).message);
    throw err;
  }

  onStepUpdate('config', 'running');
  try {
    await writeProjectConfig(token, sheetId, projectName, scriptId, createdAt);
    onStepUpdate('config', 'complete');
  } catch (err) {
    onStepUpdate('config', 'error', (err as Error).message);
    throw err;
  }

  onStepUpdate('code', 'running');
  try {
    await uploadScriptCode(token, scriptId, sheetId, projectName, createdAt);
    onStepUpdate('code', 'complete');
  } catch (err) {
    onStepUpdate('code', 'error', (err as Error).message);
    throw err;
  }

  onStepUpdate('deploy', 'running');
  let deploymentUrl = '';
  try {
    deploymentUrl = await deployWebApp(token, scriptId);
    await saveDeploymentUrl(token, sheetId, deploymentUrl);
    onStepUpdate('deploy', 'complete');
  } catch (err) {
    onStepUpdate('deploy', 'error', (err as Error).message);
    throw err;
  }

  return { sheetId, sheetUrl, projectName, createdAt, scriptId, scriptUrl, deploymentUrl };
}
