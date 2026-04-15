import type { Project } from '@/types';

const DRIVE_API  = 'https://www.googleapis.com/drive/v3/files';
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

const REGISTRY_SHEET_NAME = 'RGForms — Projects';
const REGISTRY_COLUMNS    = ['project_id', 'project_name', 'template', 'created_at', 'modules_json'];

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function apiCall<T>(url: string, options: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: { message: res.statusText } })) as {
      error?: { message?: string };
    };
    throw new Error(body.error?.message ?? `API error: ${res.status}`);
  }
  return res.json() as T;
}

// ─── Find or create the "RGForms — Projects" registry spreadsheet ─────────────

export async function getOrCreateRegistry(token: string): Promise<string> {
  // Search for an existing sheet with the registry name
  const query  = encodeURIComponent(
    `mimeType='application/vnd.google-apps.spreadsheet' and name='${REGISTRY_SHEET_NAME}' and trashed=false`
  );
  const fields = encodeURIComponent('files(id,name)');
  const res    = await fetch(`${DRIVE_API}?q=${query}&fields=${fields}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    const data = await res.json() as { files?: Array<{ id: string }> };
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // Create a new registry spreadsheet
  const result = await apiCall<{ spreadsheetId: string; sheets: Array<{ properties: { sheetId: number } }> }>(
    SHEETS_API,
    {
      method:  'POST',
      headers: authHeaders(token),
      body:    JSON.stringify({
        properties: { title: REGISTRY_SHEET_NAME },
        sheets: [{ properties: { title: 'Projects' } }],
      }),
    },
  );

  const sheetId = result.spreadsheetId;
  const tabGid  = result.sheets[0].properties.sheetId;

  // Write header row
  await fetch(
    `${SHEETS_API}/${sheetId}/values/Projects!A1:E1?valueInputOption=RAW`,
    {
      method:  'PUT',
      headers: authHeaders(token),
      body:    JSON.stringify({ values: [REGISTRY_COLUMNS] }),
    },
  ).catch(() => {});

  // Bold header + freeze row 1
  await fetch(`${SHEETS_API}/${sheetId}:batchUpdate`, {
    method:  'POST',
    headers: authHeaders(token),
    body:    JSON.stringify({
      requests: [
        {
          repeatCell: {
            range: { sheetId: tabGid, startRowIndex: 0, endRowIndex: 1 },
            cell:  { userEnteredFormat: { textFormat: { bold: true } } },
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
  }).catch(() => {});

  // Add a hidden _config tab so listAllResources skips it
  await fetch(`${SHEETS_API}/${sheetId}:batchUpdate`, {
    method:  'POST',
    headers: authHeaders(token),
    body:    JSON.stringify({
      requests: [{ addSheet: { properties: { title: '_config', hidden: true } } }],
    }),
  }).catch(() => {});

  await fetch(
    `${SHEETS_API}/${sheetId}/values:batchUpdate`,
    {
      method:  'POST',
      headers: authHeaders(token),
      body:    JSON.stringify({
        valueInputOption: 'RAW',
        data: [{ range: '_config!A1:B2', values: [['moduleType', 'registry'], ['moduleName', REGISTRY_SHEET_NAME]] }],
      }),
    },
  ).catch(() => {});

  return sheetId;
}

// ─── Save a project entry (append a row) ─────────────────────────────────────

export async function saveProject(
  token: string,
  registrySheetId: string,
  project: Project,
): Promise<void> {
  const row = [
    project.projectId,
    project.projectName,
    project.template,
    project.createdAt,
    JSON.stringify(project.modules),
  ];

  await fetch(
    `${SHEETS_API}/${registrySheetId}/values/Projects!A:E:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method:  'POST',
      headers: authHeaders(token),
      body:    JSON.stringify({ values: [row] }),
    },
  ).catch(() => {});
}

// ─── Load all projects from the registry ────────────────────────────────────

export async function loadProjects(token: string): Promise<Project[]> {
  try {
    // Find the registry sheet first
    const query  = encodeURIComponent(
      `mimeType='application/vnd.google-apps.spreadsheet' and name='${REGISTRY_SHEET_NAME}' and trashed=false`
    );
    const fields = encodeURIComponent('files(id)');
    const res    = await fetch(`${DRIVE_API}?q=${query}&fields=${fields}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return [];
    const data = await res.json() as { files?: Array<{ id: string }> };
    if (!data.files || data.files.length === 0) return [];

    const registrySheetId = data.files[0].id;

    // Fetch the Projects tab
    const valRes = await fetch(
      `${SHEETS_API}/${registrySheetId}/values/Projects!A2:E`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!valRes.ok) return [];

    const valData = await valRes.json() as { values?: string[][] };
    if (!valData.values || valData.values.length === 0) return [];

    const projects: Project[] = [];
    for (const row of valData.values) {
      try {
        const [projectId, projectName, template, createdAt, modulesJson] = row;
        if (!projectId) continue;
        const modules = modulesJson ? JSON.parse(modulesJson) : [];
        projects.push({
          projectId,
          projectName,
          template: template as Project['template'],
          createdAt,
          modules,
        });
      } catch {
        // Skip malformed rows
      }
    }
    return projects;
  } catch {
    return [];
  }
}

// ─── Update a project's module list ──────────────────────────────────────────

export async function updateProject(
  token: string,
  registrySheetId: string,
  project: Project,
): Promise<void> {
  try {
    // Read all rows to find the matching project_id
    const valRes = await fetch(
      `${SHEETS_API}/${registrySheetId}/values/Projects!A2:E`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!valRes.ok) return;

    const valData = await valRes.json() as { values?: string[][] };
    if (!valData.values) return;

    const rowIndex = valData.values.findIndex((row) => row[0] === project.projectId);
    if (rowIndex === -1) return;

    // Row 1 is the header, data starts at row 2, so actual sheet row = rowIndex + 2
    const sheetRow = rowIndex + 2;
    const updatedRow = [
      project.projectId,
      project.projectName,
      project.template,
      project.createdAt,
      JSON.stringify(project.modules),
    ];

    await fetch(
      `${SHEETS_API}/${registrySheetId}/values/Projects!A${sheetRow}:E${sheetRow}?valueInputOption=RAW`,
      {
        method:  'PUT',
        headers: authHeaders(token),
        body:    JSON.stringify({ values: [updatedRow] }),
      },
    ).catch(() => {});
  } catch {
    // Best-effort
  }
}
