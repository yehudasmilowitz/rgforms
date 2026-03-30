import type { FormField, FormSummary } from '@/types';

const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';
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
        enableHoneypot: config.enableHoneypot === 'true' ? true : undefined,
      };
      return summary;
    })
  );

  return forms.filter((f): f is FormSummary => f !== null);
}

// Delete a form's Sheet. Because the Apps Script is container-bound to the sheet,
// deleting the sheet also permanently removes the script and all its deployments.
export async function deleteForm(
  accessToken: string,
  sheetId: string,
): Promise<void> {
  const headers = authHeaders(accessToken);

  const sheetRes = await fetch(`${DRIVE_API}/${sheetId}`, {
    method: 'DELETE',
    headers,
  });
  if (!sheetRes.ok && sheetRes.status !== 404) {
    throw new Error(`Failed to delete sheet (${sheetRes.status})`);
  }
}
