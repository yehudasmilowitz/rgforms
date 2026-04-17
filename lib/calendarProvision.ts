import type { CalendarResult, ProvisioningStep } from '@/types';
import { generateCalendarScript, CALENDAR_SCRIPT_MANIFEST } from './calendarScriptTemplate';
import { registerModuleInProject } from './myForms';

type StepStatus = 'running' | 'complete' | 'error';
type StepCallback = (stepId: string, status: StepStatus, error?: string) => void;

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const SCRIPT_API = 'https://script.googleapis.com/v1/projects';
const DRIVE_API  = 'https://www.googleapis.com/drive/v3/files';

export class AppsScriptApiDisabledError extends Error {
  constructor() { super('AppsScriptApiDisabledError'); this.name = 'AppsScriptApiDisabledError'; }
}

export const CALENDAR_PROVISIONING_STEPS: ProvisioningStep[] = [
  { id: 'sheet',  label: 'Creating Events spreadsheet', description: 'Setting up your calendar with sample events', status: 'pending', scopes: [{ label: 'drive.file' }] },
  { id: 'script', label: 'Creating Apps Script',        description: 'Initializing the calendar API project',      status: 'pending', scopes: [{ label: 'script.projects', sensitive: true }] },
  { id: 'code',   label: 'Uploading handler code',      description: 'Writing the doGet() calendar handler',       status: 'pending', scopes: [{ label: 'script.projects', sensitive: true }] },
  { id: 'deploy', label: 'Publishing API endpoint',     description: 'Making your calendar endpoint live',         status: 'pending', scopes: [{ label: 'script.deployments', sensitive: true }] },
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

// Format date as YYYY-MM-DD, N days from today
function futureDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// Step 1: Create spreadsheet with Events tab + sample data
async function createEventsSheet(token: string, name: string): Promise<{ sheetId: string; sheetUrl: string }> {
  const result = await apiCall<{ spreadsheetId: string; sheets: Array<{ properties: { sheetId: number } }> }>(SHEETS_API, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      properties: { title: `${name} — RG Calendar` },
      sheets: [{ properties: { title: 'Events' } }],
    }),
  });
  const sheetId = result.spreadsheetId;
  const tabGid = result.sheets[0].properties.sheetId;

  // Headers + 3 pre-seeded sample events with future dates
  const rows = [
    ['Title', 'Date', 'Start Time', 'End Time', 'Description', 'Location', 'Category', 'URL', 'All Day', 'Color'],
    ['Team Standup', futureDate(7),  '09:00', '09:30', 'Weekly team standup meeting',     '',                'Meeting', '', 'false', '#6366f1'],
    ['Product Launch', futureDate(14), '14:00', '15:00', 'Launch of the new product version', '',            'Launch',  '', 'false', '#10b981'],
    ['Annual Review', futureDate(30), '10:00', '11:00', 'Quarterly performance review',    '',              'Review',  '', 'false', '#f59e0b'],
  ];

  await fetch(`${SHEETS_API}/${sheetId}/values/Events!A1:J${rows.length}?valueInputOption=RAW`, {
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
            range: { sheetId: tabGid, startRowIndex: 0, endRowIndex: 1 },
            cell: { userEnteredFormat: { textFormat: { bold: true } } },
            fields: 'userEnteredFormat.textFormat.bold',
          },
        },
        {
          updateSheetProperties: {
            properties: { sheetId: tabGid, gridProperties: { frozenRowCount: 1 } },
            fields: 'gridProperties.frozenRowCount',
          },
        },
      ],
    }),
  }).catch(() => {}); // non-fatal

  return {
    sheetId,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
  };
}

async function createScriptProject(token: string, name: string, parentId: string): Promise<{ scriptId: string; scriptUrl: string }> {
  const result = await apiCall<{ scriptId: string }>(SCRIPT_API, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ title: `${name} Calendar API`, parentId }),
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
        { name: 'Code',       type: 'SERVER_JS', source: generateCalendarScript(moduleName) },
        { name: 'appsscript', type: 'JSON',      source: JSON.stringify(CALENDAR_SCRIPT_MANIFEST) },
      ],
    }),
  });
}

async function deployWebApp(token: string, scriptId: string): Promise<string> {
  const version = await apiCall<{ versionNumber: number }>(`${SCRIPT_API}/${scriptId}/versions`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ description: 'rgforms calendar initial version' }),
  });
  const result = await apiCall<{ entryPoints: Array<{ entryPointType: string; webApp: { url: string } }> }>(
    `${SCRIPT_API}/${scriptId}/deployments`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        versionNumber: version.versionNumber,
        manifestFileName: 'appsscript',
        description: 'rgforms calendar API',
      }),
    },
  );
  const webApp = result.entryPoints?.find((ep) => ep.entryPointType === 'WEB_APP');
  if (!webApp?.webApp?.url) throw new Error('Deployment succeeded but no web app URL returned');
  return webApp.webApp.url;
}

async function saveConfig(token: string, sheetId: string, config: {
  moduleName: string; scriptId: string; deploymentUrl: string; projectId: string;
}): Promise<void> {
  await fetch(`${SHEETS_API}/${sheetId}:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title: '_config', hidden: true } } }] }),
  }).catch(() => {});

  const rows: string[][] = [
    ['moduleType',    'calendar'],
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

export async function provisionCalendar(
  token: string,
  moduleName: string,
  onStepUpdate: StepCallback,
  projectId: string,
): Promise<CalendarResult> {
  let sheetId = '', sheetUrl = '';
  let scriptId = '', scriptUrl = '';

  onStepUpdate('sheet', 'running');
  try {
    ({ sheetId, sheetUrl } = await createEventsSheet(token, moduleName));
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
  await registerModuleInProject(token, projectId, 'calendar', moduleName, sheetId, deploymentUrl);

  return { sheetId, sheetUrl, scriptId, scriptUrl, deploymentUrl };
}
