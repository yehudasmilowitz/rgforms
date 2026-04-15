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
} from '@/types';

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
      `${SHEETS_VALUES_API}/${sheetId}/values/_config!A1:B20`,
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
// "Simple" types (siteconfig/calendar/gallery) have identical field shapes; registry types
// (testimonial/faq/…) are the same plus moduleType, which is a structural superset.
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

// Single-pass fetch: one Drive call + one config read per sheet, then sort by type.
export async function listAllResources(accessToken: string): Promise<AllResources> {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const fields = encodeURIComponent('files(id,name,createdTime,webViewLink)');
  const res = await fetch(
    `${DRIVE_API}?q=${query}&fields=${fields}&orderBy=createdTime desc`,
    { headers: authHeaders(accessToken) }
  );

  const result: AllResources = {
    forms: [], modules: [], assets: [], configs: [], calendars: [], galleries: [],
    testimonials: [], faqs: [], menus: [], newsletters: [], announcements: [], redirects: [],
  };
  if (!res.ok) return result;

  const data = await res.json() as {
    files?: Array<{ id: string; name: string; createdTime: string; webViewLink: string }>;
  };

  await Promise.all(
    (data.files ?? []).map(async (file) => {
      const config = await readConfigTab(accessToken, file.id);
      if (config.moduleType === 'registry') return;

      const scriptId  = config.scriptId  || undefined;
      const projectId = config.projectId || undefined;
      const scriptUrl = scriptId ? `https://script.google.com/d/${scriptId}/edit` : undefined;
      const base = {
        sheetId: file.id, sheetUrl: file.webViewLink,
        moduleName: config.moduleName ?? file.name,
        createdAt: config.createdAt ?? file.createdTime,
        scriptId, scriptUrl, projectId,
        deploymentUrl: config.deploymentUrl || undefined,
      };

      const simpleKey = SIMPLE_MODULE_MAP[config.moduleType];
      if (simpleKey) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (result[simpleKey] as any[]).push({ ...base, moduleType: config.moduleType });
      } else if (config.moduleType === 'content') {
        let fields: ContentField[] | undefined;
        try { if (config.fields) fields = JSON.parse(config.fields) as ContentField[]; } catch { /* ignore */ }
        result.modules.push({
          ...base, fields,
          hasSlug: config.hasSlug === 'true', hasPublished: config.hasPublished === 'true',
          writeToken: config.writeToken || undefined,
        });
      } else if (config.moduleType === 'asset') {
        result.assets.push({ ...base, folderId: config.folderId ?? '', folderUrl: config.folderUrl ?? '' });
      } else if (config.formName) {
        let formFields: FormField[] | undefined;
        try { if (config.fields) formFields = JSON.parse(config.fields) as FormField[]; } catch { /* ignore */ }
        result.forms.push({
          sheetId: file.id, sheetUrl: file.webViewLink,
          formName: config.formName,
          createdAt: config.createdAt ?? file.createdTime,
          scriptId, scriptUrl, projectId,
          deploymentUrl: config.deploymentUrl || undefined,
          fields: formFields,
          enableHoneypot: config.enableHoneypot === 'true' ? true : undefined,
        });
      }
    })
  );

  return result;
}

// Legacy individual list functions (kept for compatibility)
export async function listMyForms(accessToken: string): Promise<FormSummary[]> {
  const { forms } = await listAllResources(accessToken);
  return forms;
}

export async function listMyModules(accessToken: string): Promise<ContentModuleSummary[]> {
  const { modules } = await listAllResources(accessToken);
  return modules;
}

export async function listMyAssets(accessToken: string): Promise<AssetModuleSummary[]> {
  const { assets } = await listAllResources(accessToken);
  return assets;
}

export async function listMyConfigs(accessToken: string): Promise<SiteConfigModuleSummary[]> {
  const { configs } = await listAllResources(accessToken);
  return configs;
}

export async function listMyCalendars(accessToken: string): Promise<CalendarModuleSummary[]> {
  const { calendars } = await listAllResources(accessToken);
  return calendars;
}

export async function listMyGalleries(accessToken: string): Promise<GalleryModuleSummary[]> {
  const { galleries } = await listAllResources(accessToken);
  return galleries;
}

// Delete a module's Sheet. Because the Apps Script is container-bound,
// deleting the sheet removes the script and all deployments too.
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
