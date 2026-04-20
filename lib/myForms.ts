import type {
  FormField,
  FormSummary,
  ContentField,
  ContentModuleSummary,
  AssetModuleSummary,
  SiteConfigModuleSummary,
  CalendarModuleSummary,
  GalleryModuleSummary,
  ModuleSummary,
  ProjectSummary,
} from '@/types';

const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';
const SHEETS_VALUES_API = 'https://sheets.googleapis.com/v4/spreadsheets';

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

// Read key-value pairs from the hidden _config tab in a spreadsheet
async function readConfigTab(
  accessToken: string,
  sheetId: string,
  signal?: AbortSignal,
): Promise<Record<string, string>> {
  try {
    const res = await fetch(
      `${SHEETS_VALUES_API}/${sheetId}/values/_config!A1:B20`,
      { headers: authHeaders(accessToken), signal }
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

export interface AllResources {
  forms: FormSummary[];
  modules: ContentModuleSummary[];
  assets: AssetModuleSummary[];
  configs: SiteConfigModuleSummary[];
  calendars: CalendarModuleSummary[];
  galleries: GalleryModuleSummary[];
  testimonials: ModuleSummary[];
  faqs: ModuleSummary[];
  menus: ModuleSummary[];
  newsletters: ModuleSummary[];
  announcements: ModuleSummary[];
  redirects: ModuleSummary[];
}

// Module types whose summaries share the same shape — maps moduleType → AllResources key.
const SIMPLE_MODULE_MAP: Partial<Record<string, keyof AllResources>> = {
  siteconfig:   'configs',
  calendar:     'calendars',
  gallery:      'galleries',
  testimonial:  'testimonials',
  faq:          'faqs',
  menu:         'menus',
  newsletter:   'newsletters',
  announcement: 'announcements',
  redirects:    'redirects',
};

// Append a row to the project sheet's Modules tab when a module is provisioned.
export async function registerModuleInProject(
  accessToken: string,
  projectId: string,
  moduleType: string,
  moduleName: string,
  sheetId: string,
  deploymentUrl: string,
): Promise<void> {
  await fetch(
    `${SHEETS_VALUES_API}/${projectId}/values/${encodeURIComponent('Modules!A:E')}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: { ...authHeaders(accessToken), 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [[moduleType, moduleName, sheetId, deploymentUrl, new Date().toISOString()]] }),
    },
  ).catch(() => {}); // best-effort; failure doesn't break the provision result
}

// Read the project's Modules tab and return the list of registered module sheet IDs.
// Returns an empty array if the tab has no data rows yet.
async function readModulesTab(
  accessToken: string,
  projectId: string,
  signal?: AbortSignal,
): Promise<Array<{ sheetId: string; moduleName: string; moduleType: string }>> {
  const res = await fetch(
    `${SHEETS_VALUES_API}/${projectId}/values/Modules!A:E`,
    { headers: authHeaders(accessToken), signal },
  );
  if (!res.ok) return [];
  const data = await res.json() as { values?: string[][] };
  const rows = data.values ?? [];
  if (rows.length < 2) return []; // header-only or empty

  const headers = rows[0].map((h) => String(h).toLowerCase());
  const typeIdx = headers.indexOf('module_type');
  const nameIdx = headers.indexOf('module_name');
  const idIdx   = headers.indexOf('sheet_id');
  if (idIdx === -1) return [];

  return rows.slice(1)
    .map((row) => ({
      moduleType: row[typeIdx] ?? '',
      moduleName: row[nameIdx] ?? '',
      sheetId:    row[idIdx]   ?? '',
    }))
    .filter((m) => m.sheetId);
}

// Read _config for each module in the Modules tab and classify into AllResources buckets.
export async function listAllResources(accessToken: string, projectId: string, signal?: AbortSignal): Promise<AllResources> {
  const result: AllResources = {
    forms: [], modules: [], assets: [], configs: [], calendars: [], galleries: [],
    testimonials: [], faqs: [], menus: [], newsletters: [], announcements: [], redirects: [],
  };

  const moduleEntries = await readModulesTab(accessToken, projectId, signal);

  await Promise.all(
    moduleEntries.map(async (entry) => {
      const sheetId  = entry.sheetId;
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
      const config   = await readConfigTab(accessToken, sheetId, signal);

      const scriptId  = config.scriptId || undefined;
      const scriptUrl = scriptId ? `https://script.google.com/d/${scriptId}/edit` : undefined;
      const base = {
        sheetId, sheetUrl,
        moduleName: config.moduleName ?? entry.moduleName,
        createdAt:  config.createdAt  ?? '',
        scriptId, scriptUrl, projectId,
        deploymentUrl: config.deploymentUrl || undefined,
      };

      const moduleType = config.moduleType || entry.moduleType;

      const simpleKey = SIMPLE_MODULE_MAP[moduleType];
      if (simpleKey) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (result[simpleKey] as any[]).push({ ...base, moduleType });
      } else if (moduleType === 'content') {
        let fields: ContentField[] | undefined;
        try { if (config.fields) fields = JSON.parse(config.fields) as ContentField[]; } catch { /* ignore */ }
        result.modules.push({
          ...base, fields,
          hasSlug:    config.hasSlug    === 'true',
          hasPublished: config.hasPublished === 'true',
          writeToken: config.writeToken || undefined,
        });
      } else if (moduleType === 'asset') {
        result.assets.push({ ...base, folderId: config.folderId ?? '', folderUrl: config.folderUrl ?? '' });
      } else if (moduleType === 'form') {
        let formFields: FormField[] | undefined;
        try { if (config.fields) formFields = JSON.parse(config.fields) as FormField[]; } catch { /* ignore */ }
        result.forms.push({
          sheetId, sheetUrl,
          formName:      config.formName ?? entry.moduleName,
          createdAt:     config.createdAt ?? '',
          scriptId, scriptUrl, projectId,
          deploymentUrl: config.deploymentUrl || undefined,
          fields:        formFields,
          enableHoneypot: config.enableHoneypot === 'true' ? true : undefined,
        });
      }
    })
  );

  return result;
}

// Returns all RG project spreadsheets from Drive.
// Uses Drive appProperties (set during provisioning) so the query is exact — no name matching.
export async function listProjects(accessToken: string, signal?: AbortSignal): Promise<ProjectSummary[]> {
  const query  = encodeURIComponent("appProperties has { key='sheetspin_type' and value='project' } and trashed=false");
  const fields = encodeURIComponent('files(id,name,createdTime,webViewLink)');
  const res = await fetch(
    `${DRIVE_API}?q=${query}&fields=${fields}&orderBy=createdTime desc`,
    { headers: authHeaders(accessToken), signal }
  );
  if (!res.ok) return [];

  const data = await res.json() as {
    files?: Array<{ id: string; name: string; createdTime: string; webViewLink: string }>;
  };

  const projects: ProjectSummary[] = [];
  await Promise.all(
    (data.files ?? []).map(async (file) => {
      const config = await readConfigTab(accessToken, file.id, signal);
      if (config.moduleType !== 'project') return;
      projects.push({
        sheetId:       file.id,
        sheetUrl:      file.webViewLink,
        projectName:   config.projectName ?? file.name,
        createdAt:     config.createdAt   ?? file.createdTime,
        scriptId:      config.scriptId    || undefined,
        scriptUrl:     config.scriptId    ? `https://script.google.com/d/${config.scriptId}/edit` : undefined,
        deploymentUrl: config.deploymentUrl || undefined,
      });
    })
  );

  projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return projects;
}

// Delete a module's Sheet. Because the Apps Script is container-bound,
// deleting the sheet removes the script and all deployments too.
export async function deleteForm(
  accessToken: string,
  sheetId: string,
): Promise<void> {
  const sheetRes = await fetch(`${DRIVE_API}/${sheetId}`, {
    method: 'DELETE',
    headers: authHeaders(accessToken),
  });
  if (!sheetRes.ok && sheetRes.status !== 404) {
    throw new Error(`Failed to delete sheet (${sheetRes.status})`);
  }
}
