import type { FormField, FormSummary } from '@/types';

const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';
const SCRIPT_API = 'https://script.googleapis.com/v1/projects';
const SHEETS_VALUES_API = 'https://sheets.googleapis.com/v4/spreadsheets';

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

// Read key-value pairs from the hidden _config tab in a spreadsheet
async function readConfigTab(
  accessToken: string,
  sheetId: string
): Promise<Record<string, string>> {
  try {
    const res = await fetch(
      `${SHEETS_VALUES_API}/${sheetId}/values/_config!A1:B15`,
      { headers: authHeaders(accessToken) }
    );
    if (!res.ok) return {};
    const data = await res.json() as { values?: string[][] };
    const pairs: Record<string, string> = {};
    for (const row of (data.values ?? [])) {
      const [key, value] = row;
      if (key) pairs[key] = value ?? '';
    }
    return pairs;
  } catch {
    return {};
  }
}

// List all Google Sheets created by rgforms for this user.
// With the drive.file scope, files.list returns only files this app created.
export async function listMyForms(accessToken: string): Promise<FormSummary[]> {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const fields = encodeURIComponent('files(id,name,createdTime,webViewLink)');
  const res = await fetch(
    `${DRIVE_API}?q=${query}&fields=${fields}&orderBy=createdTime desc`,
    { headers: authHeaders(accessToken) }
  );
  if (!res.ok) return [];

  const data = await res.json() as {
    files?: Array<{ id: string; name: string; createdTime: string; webViewLink: string }>;
  };

  const forms = await Promise.all(
    (data.files ?? []).map(async (file) => {
      const config = await readConfigTab(accessToken, file.id);
      // Only include sheets that have an rgforms _config tab
      if (!config.formName) return null;

      const scriptId = config.scriptId || undefined;
      let fields: FormField[] | undefined;
      try {
        if (config.fields) fields = JSON.parse(config.fields) as FormField[];
      } catch { /* ignore malformed fields */ }
      const summary: FormSummary = {
        sheetId: file.id,
        sheetUrl: file.webViewLink,
        formName: config.formName,
        createdAt: config.createdAt ?? file.createdTime,
        scriptId,
        scriptUrl: scriptId ? `https://script.google.com/d/${scriptId}/edit` : undefined,
        deploymentUrl: config.deploymentUrl || undefined,
        fields,
      };
      return summary;
    })
  );

  return forms.filter((f): f is FormSummary => f !== null);
}

// Permanently delete a form's Sheet (and its associated Script if known).
// driveAccessToken should be a token with the full drive scope — needed to delete
// the Apps Script project file, which drive.file cannot reach. If omitted, the
// Drive delete is still attempted (and silently skipped on 404).
export async function deleteForm(
  accessToken: string,
  sheetId: string,
  scriptId?: string,
  driveAccessToken?: string,
): Promise<void> {
  const headers = authHeaders(accessToken);
  const driveHeaders = driveAccessToken ? authHeaders(driveAccessToken) : headers;

  // Delete the sheet — this is the primary resource and must succeed.
  const sheetRes = await fetch(`${DRIVE_API}/${sheetId}`, {
    method: 'DELETE',
    headers,
  });
  if (!sheetRes.ok && sheetRes.status !== 404) {
    throw new Error(`Failed to delete sheet (${sheetRes.status})`);
  }

  if (!scriptId) return;

  // Delete all deployments via the Apps Script API first — this deactivates the web app
  // endpoint even if the Drive file delete below can't reach the project (drive.file scope
  // does not cover script projects created via script.googleapis.com).
  try {
    const listRes = await fetch(`${SCRIPT_API}/${scriptId}/deployments`, { headers });
    if (listRes.ok) {
      const data = await listRes.json() as { deployments?: Array<{ deploymentId: string }> };
      await Promise.all(
        (data.deployments ?? []).map((d) =>
          fetch(`${SCRIPT_API}/${scriptId}/deployments/${d.deploymentId}`, {
            method: 'DELETE',
            headers,
          })
        )
      );
    }
  } catch {
    // Best-effort — continue to Drive delete regardless.
  }

  // Permanently delete the script project file via Drive API.
  // driveHeaders carries the full drive scope token when the user granted it at delete time.
  const scriptRes = await fetch(`${DRIVE_API}/${scriptId}`, {
    method: 'DELETE',
    headers: driveHeaders,
  });

  if (scriptRes.ok || scriptRes.status === 404) return;

  // Fall back to trashing if permanent delete fails (e.g. drive scope not granted).
  await fetch(`${DRIVE_API}/${scriptId}`, {
    method: 'PATCH',
    headers: { ...driveHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ trashed: true }),
  }).catch(() => {
    // Best-effort — the sheet and deployments are already gone.
  });
}
