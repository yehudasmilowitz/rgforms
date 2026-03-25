import type { FormConfig, ProvisioningResult } from '@/types';
import { generateAppsScript, APPS_SCRIPT_MANIFEST } from './scriptTemplate';

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
      if (!isScopeError) {
        throw new AppsScriptApiDisabledError();
      }
    }
    throw new Error(body.error?.message ?? `API error: ${res.status}`);
  }
  return res.json() as T;
}

/**
 * Preflight: verify the Apps Script API is enabled before touching anything.
 * Uses a GET to a nonexistent project — returns 404 if the API is reachable
 * (project not found), or 403 PERMISSION_DENIED if the API is disabled.
 * Must be called before START_PROVISIONING so the caller's component is still mounted.
 */
export async function checkAppsScriptApiEnabled(accessToken: string): Promise<void> {
  const res = await fetch(`${SCRIPT_API}/preflight_check`, {
    headers: authHeaders(accessToken),
  });
  if (res.status === 403) {
    const body = await res.json().catch(() => ({})) as { error?: { status?: string } };
    if (body.error?.status === 'PERMISSION_DENIED') {
      throw new AppsScriptApiDisabledError();
    }
  }
  // Any other response (200, 404 "not found", etc.) means the API is reachable — proceed.
}

// Step 1: Create the Google Sheet with bold header row
async function createSheet(
  accessToken: string,
  config: FormConfig
): Promise<{ sheetId: string; sheetUrl: string }> {
  const headers = [...config.fields.map((f) => f.label), 'Timestamp'];

  const body = {
    properties: { title: config.name },
    sheets: [
      {
        properties: { title: 'Submissions', sheetId: 0, index: 0 },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: headers.map((h) => ({
                  userEnteredValue: { stringValue: h },
                  userEnteredFormat: { textFormat: { bold: true } },
                })),
              },
            ],
          },
        ],
      },
    ],
  };

  const result = await apiCall<{ spreadsheetId: string; spreadsheetUrl: string }>(SHEETS_API, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(body),
  });

  return {
    sheetId: result.spreadsheetId,
    sheetUrl: result.spreadsheetUrl,
  };
}

// Step 2: Add a hidden _config tab and write metadata into it
async function addConfigTab(
  accessToken: string,
  sheetId: string,
  config: FormConfig,
  scriptId: string
): Promise<void> {
  // Add the _config sheet
  await apiCall<unknown>(`${SHEETS_API}/${sheetId}:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      requests: [
        {
          addSheet: {
            properties: {
              title: '_config',
              hidden: true,
              tabColor: { red: 0.4, green: 0.4, blue: 0.4 },
            },
          },
        },
      ],
    }),
  });

  // Confirm the new sheet was created (also retrieves its numeric sheetId if needed later)
  const spreadsheet = await apiCall<{
    sheets: Array<{ properties: { title: string; sheetId: number } }>;
  }>(`${SHEETS_API}/${sheetId}`, { headers: authHeaders(accessToken) });

  const configSheet = spreadsheet.sheets.find((s) => s.properties.title === '_config');
  if (!configSheet) throw new Error('_config sheet not found after creation');

  // Write config metadata using the values:batchUpdate endpoint
  const configData: string[][] = [
    ['notifyEmail', config.notifyEmail],
    ['formName', config.name],
    ['fields', JSON.stringify(config.fields)],
    ['createdAt', new Date().toISOString()],
    ['scriptId', scriptId],
  ];

  await apiCall<unknown>(`${SHEETS_API}/${sheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      valueInputOption: 'RAW',
      data: [
        {
          range: `_config!A1:B${configData.length}`,
          values: configData,
        },
      ],
    }),
  });
}

// Save the deployment URL into the _config tab after the web app is deployed
async function saveDeploymentUrl(
  accessToken: string,
  sheetId: string,
  deploymentUrl: string
): Promise<void> {
  // Best-effort — a failure here shouldn't break the overall provisioning result
  await fetch(`${SHEETS_API}/${sheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      valueInputOption: 'RAW',
      data: [{ range: '_config!A6:B6', values: [['deploymentUrl', deploymentUrl]] }],
    }),
  }).catch(() => {});
}

// Step 1: Create a standalone Apps Script project (verifies the API is enabled before touching Sheets)
async function createScriptProject(
  accessToken: string,
  formName: string
): Promise<{ scriptId: string; scriptUrl: string }> {
  const result = await apiCall<{ scriptId: string }>(SCRIPT_API, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      title: `${formName} Form Handler`,
    }),
  });

  return {
    scriptId: result.scriptId,
    scriptUrl: `https://script.google.com/d/${result.scriptId}/edit`,
  };
}

// Step 4: Upload the doPost() handler + manifest
async function uploadScriptCode(
  accessToken: string,
  scriptId: string,
  sheetId: string,
  notifyEmail: string
): Promise<void> {
  const code = generateAppsScript(sheetId, notifyEmail);

  await apiCall<unknown>(`${SCRIPT_API}/${scriptId}/content`, {
    method: 'PUT',
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      files: [
        {
          name: 'Code',
          type: 'SERVER_JS',
          source: code,
        },
        {
          name: 'appsscript',
          type: 'JSON',
          source: JSON.stringify(APPS_SCRIPT_MANIFEST),
        },
      ],
    }),
  });
}

// Step 5: Deploy the script as a public web app and return its URL
async function deployWebApp(accessToken: string, scriptId: string): Promise<string> {
  // Create a version first — deployments reference a version number, not HEAD
  const version = await apiCall<{ versionNumber: number }>(
    `${SCRIPT_API}/${scriptId}/versions`,
    {
      method: 'POST',
      headers: authHeaders(accessToken),
      body: JSON.stringify({ description: 'rgforms initial version' }),
    }
  );

  const result = await apiCall<{
    deploymentId: string;
    entryPoints: Array<{
      entryPointType: string;
      webApp: { url: string };
    }>;
  }>(`${SCRIPT_API}/${scriptId}/deployments`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      versionNumber: version.versionNumber,
      manifestFileName: 'appsscript',
      description: 'rgforms web app deployment',
    }),
  });

  const webAppEntry = result.entryPoints?.find((ep) => ep.entryPointType === 'WEB_APP');
  if (!webAppEntry?.webApp?.url) {
    throw new Error('Deployment succeeded but no web app URL returned');
  }

  return webAppEntry.webApp.url;
}

// Main provisioning function — runs all 5 steps in sequence, reporting progress via onStepUpdate
export async function provision(
  accessToken: string,
  config: FormConfig,
  onStepUpdate: StepCallback
): Promise<ProvisioningResult> {
  let sheetId = '';
  let sheetUrl = '';
  let scriptId = '';
  let scriptUrl = '';
  let deploymentUrl = '';

  // Step 1 — Create Apps Script project (must come first: verifies the Script API is enabled
  // before any Sheets resources are created, so a disabled API fails with nothing to clean up)
  onStepUpdate('script', 'running');
  try {
    ({ scriptId, scriptUrl } = await createScriptProject(accessToken, config.name));
    onStepUpdate('script', 'complete');
  } catch (err) {
    onStepUpdate('script', 'error', (err as Error).message);
    throw err;
  }

  // Step 2 — Create Sheet
  onStepUpdate('sheet', 'running');
  try {
    ({ sheetId, sheetUrl } = await createSheet(accessToken, config));
    onStepUpdate('sheet', 'complete');
  } catch (err) {
    onStepUpdate('sheet', 'error', (err as Error).message);
    throw err;
  }

  // Step 3 — Add _config tab
  onStepUpdate('config', 'running');
  try {
    await addConfigTab(accessToken, sheetId, config, scriptId);
    onStepUpdate('config', 'complete');
  } catch (err) {
    onStepUpdate('config', 'error', (err as Error).message);
    throw err;
  }

  // Step 4 — Upload handler code
  onStepUpdate('code', 'running');
  try {
    await uploadScriptCode(accessToken, scriptId, sheetId, config.notifyEmail);
    onStepUpdate('code', 'complete');
  } catch (err) {
    onStepUpdate('code', 'error', (err as Error).message);
    throw err;
  }

  // Step 5 — Deploy as web app
  onStepUpdate('deploy', 'running');
  try {
    deploymentUrl = await deployWebApp(accessToken, scriptId);
    onStepUpdate('deploy', 'complete');
  } catch (err) {
    onStepUpdate('deploy', 'error', (err as Error).message);
    throw err;
  }

  // Save deployment URL to _config tab so the dashboard can regenerate embed snippets
  await saveDeploymentUrl(accessToken, sheetId, deploymentUrl);

  return { sheetId, sheetUrl, scriptId, scriptUrl, deploymentUrl };
}
