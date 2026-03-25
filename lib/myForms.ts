import type { FormSummary } from '@/types';

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
      const summary: FormSummary = {
        sheetId: file.id,
        sheetUrl: file.webViewLink,
        formName: config.formName,
        createdAt: config.createdAt ?? file.createdTime,
        scriptId,
        scriptUrl: scriptId ? `https://script.google.com/d/${scriptId}/edit` : undefined,
        deploymentUrl: config.deploymentUrl || undefined,
      };
      return summary;
    })
  );

  return forms.filter((f): f is FormSummary => f !== null);
}

// Permanently delete a form's Sheet (and its associated Script if known).
// Uses the Drive API trash-then-delete approach — both files go to trash.
export async function deleteForm(
  accessToken: string,
  sheetId: string,
  scriptId?: string
): Promise<void> {
  const trashFile = (fileId: string) =>
    fetch(`${DRIVE_API}/${fileId}`, {
      method: 'DELETE',
      headers: authHeaders(accessToken),
    });

  await trashFile(sheetId);

  if (scriptId) {
    // Best-effort — script deletion failure should not surface as an error to the user
    await trashFile(scriptId).catch(() => {});
  }
}
