import type {
  FormSummary,
  ContentModuleSummary,
  AssetModuleSummary,
  SiteConfigModuleSummary,
  CalendarModuleSummary,
  GalleryModuleSummary,
} from '@/types';
import { calendarSkillSection } from './calendarSnippet';
import { gallerySkillSection } from './gallerySnippet';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function varName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/, '') || 'module';
}

function heading(level: number, text: string) {
  return '#'.repeat(level) + ' ' + text;
}

// ─── Per-module sections ──────────────────────────────────────────────────────

function formSection(form: FormSummary): string {
  const endpoint = form.deploymentUrl ?? 'ENDPOINT';

  const fieldDocs = form.fields?.map((f) => {
    const name = f.label.toLowerCase().replace(/\s+/g, '_');
    return `  - ${f.label}  [name="${name}", type=${f.type === 'textarea' ? 'multi-line text' : f.type}${f.required ? ', required' : ''}]`;
  }).join('\n') ?? '  (field list unavailable)';

  const honeypotBlock = form.enableHoneypot ? `

#### Honeypot (spam protection)
Include this hidden field exactly as written. **Never display it to the user.**
\`\`\`html
<input type="text" name="website" tabindex="-1" autocomplete="off"
       aria-hidden="true" style="position:absolute;left:-9999px;
       width:1px;height:1px;opacity:0;pointer-events:none;" />
\`\`\`` : '';

  return `${heading(3, `Form: ${form.formName}`)}
**Endpoint:** \`${endpoint}\`
**Sheet:** ${form.sheetUrl}
**Method:** POST · \`Content-Type: application/x-www-form-urlencoded\`
**Purpose:** Receives form submissions, stores them in the Google Sheet, and sends email notifications.

#### Fields
${fieldDocs}
${honeypotBlock}

#### Component integration
- Use the project's existing input, textarea, label, and button components — do **not** add new CSS files, UI libraries, or external dependencies.
- If the project has a shared form-field wrapper or validation helper, use it.
- Do **not** add hardcoded CSS or inline styles; rely entirely on the project's design system.
- Place the component wherever similar form components live in the project.

#### Submission (fetch + URLSearchParams)
\`\`\`javascript
async function submitForm(formElement) {
  const body = new URLSearchParams(new FormData(formElement));
  const res = await fetch('${endpoint}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const json = await res.json();
  if (json.result !== 'success') throw new Error(json.error ?? 'Submission failed');
  return json;
}
\`\`\`

#### UI states
Manage three states — never leave the form in an ambiguous state:

| State | Submit button | Form fields | Message region |
|-------|--------------|-------------|----------------|
| \`idle\` | Enabled · label "Send" (match project copy style) | Enabled | Hidden |
| \`submitting\` | Disabled · show loading indicator if project provides one | Disabled | Hidden |
| \`result\` | On success: reset form; on error: re-enable | On success: cleared | Inline success or error message |

#### Accessibility
- Associate every input with a visible \`<label>\` (or use the project's labelled field components).
- Add \`aria-live="polite"\` to the success/error message container.
- Ensure full keyboard navigation (no click-only interactions).

#### Notes
- Submissions are written to the Google Sheet immediately.
- Email notifications go to the address configured at form creation.
- Responses: \`{ "result": "success" }\` on success · \`{ "result": "error", "error": "..." }\` on failure.${form.enableHoneypot ? '\n- Honeypot enabled: include the hidden `website` field shown above; submissions that fill it in are silently discarded.' : ''}`;
}

function contentSection(mod: ContentModuleSummary): string {
  const endpoint = mod.deploymentUrl ?? 'ENDPOINT';
  const jsonUrl = `${endpoint}?json=1`;
  const v = varName(mod.moduleName);

  const fieldLines = mod.fields?.map((f) =>
    `| ${f.key.padEnd(20)} | ${f.type.padEnd(12)} | ${f.required ? 'required' : 'optional'} |`
  ).join('\n') ?? '| (fields unavailable)         |              |          |';

  const extraLines = [
    ...(mod.hasSlug      ? [`| ${'slug'.padEnd(20)} | ${'text'.padEnd(12)} | optional |`] : []),
    ...(mod.hasPublished ? [`| ${'published'.padEnd(20)} | ${'boolean'.padEnd(12)} | only TRUE rows returned |`] : []),
    `| ${'_id'.padEnd(20)} | ${'text'.padEnd(12)} | UUID, auto-generated |`,
    `| ${'_created_at'.padEnd(20)} | ${'text'.padEnd(12)} | ISO date, auto-set |`,
    `| ${'_updated_at'.padEnd(20)} | ${'text'.padEnd(12)} | ISO date, auto-updated |`,
  ].join('\n');

  const firstKey = mod.fields?.[0]?.key ?? 'field';

  return `${heading(3, `Content Module: ${mod.moduleName}`)}
**Read endpoint:** \`${jsonUrl}\`
**Sheet:** ${mod.sheetUrl}
**Purpose:** Public read API. Clients retrieve structured content (blog posts, team members, FAQs, etc.) without a backend.${mod.writeToken ? `\n**Write token:** (available in Details — required for POST/PUT/DELETE)` : ''}

#### Schema
| Field                 | Type         | Notes |
|-----------------------|--------------|-------|
${fieldLines}
${extraLines}

#### Read API
\`\`\`javascript
// List all records
const res = await fetch('${jsonUrl}');
const { data, total } = await res.json();

// With filters, pagination, sorting
const res = await fetch('${jsonUrl}&${firstKey}=value&limit=10&offset=0&sort=_created_at&order=desc');

${mod.hasSlug ? `// Get single by slug
const res = await fetch('${endpoint}?json=1&slug=my-slug');
const { data: item } = await res.json();
` : ''}// Get single by ID
const res = await fetch('${endpoint}?json=1&_id=<uuid>');
const { data: item } = await res.json();
\`\`\`

#### Client class (copy-paste — includes in-request cache)
\`\`\`javascript
class RGContent {
  constructor(url) { this._url = url; this._cache = new Map(); }
  async _get(params, _retry) {
    const entries = Object.entries({ json: 1, ...(params || {}) }).filter(([, v]) => v != null);
    const qs = '?' + new URLSearchParams(Object.fromEntries(entries));
    const url = this._url + qs;
    if (this._cache.has(url)) return this._cache.get(url);
    const res = await fetch(url);
    if (res.status === 503 && !_retry) {
      await new Promise(r => setTimeout(r, 2000));
      return this._get(params, true);
    }
    if (!res.ok) throw new Error('RGContent fetch failed (' + res.status + ')');
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    this._cache.set(url, json);
    return json;
  }
  async list(params) { return this._get(params); }
  async get(slug) { return (await this._get({ slug })).data; }
  async getById(id) { return (await this._get({ _id: id })).data; }
  clearCache() { this._cache.clear(); }
}

const ${v} = new RGContent('${endpoint}');
// const { data: posts } = await ${v}.list({ limit: 10 });
${mod.hasSlug ? `// const post = await ${v}.get('my-post-slug');` : ''}
\`\`\`

#### Server-side / build-time fetch (Next.js App Router)
\`\`\`typescript
// Cached for 5 min — set revalidate: 0 for always-fresh, Infinity for build-time only
async function get${mod.moduleName.replace(/[^a-zA-Z0-9]/g, '')}() {
  const res = await fetch('${jsonUrl}', { next: { revalidate: 300 } });
  const { data } = await res.json();
  return data as Record<string, unknown>[];
}
\`\`\`

#### Notes
- Cold starts take ~800ms–2s (Apps Script). Warm requests are fast.
- In-memory cache prevents duplicate fetches within a single page load.
- For ISR/SSG, use \`revalidate\` — clients get cached HTML and don't pay the cold start penalty.${mod.writeToken ? '\n- Write operations require the write token (Bearer auth). Do not expose in client-side code.' : ''}`;
}

function assetSection(mod: AssetModuleSummary): string {
  const endpoint = mod.deploymentUrl ?? 'ENDPOINT';
  const jsonUrl = `${endpoint}?json=1`;
  const v = varName(mod.moduleName);

  return `${heading(3, `Asset Module: ${mod.moduleName}`)}
**Read endpoint:** \`${jsonUrl}\`
**Drive folder:** ${mod.folderUrl}
**Sheet:** ${mod.sheetUrl}
**Purpose:** Public file listing API. All files in the Drive folder are returned with name, MIME type, direct URL, and metadata.

#### Response shape
\`\`\`json
{
  "files": [
    {
      "id": "...",
      "name": "team-photo.jpg",
      "mimeType": "image/jpeg",
      "isImage": true,
      "size": 234567,
      "url": "https://lh3.googleusercontent.com/...",
      "driveUrl": "https://drive.google.com/file/d/.../view",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 12
}
\`\`\`

#### Fetch all files
\`\`\`javascript
const res = await fetch('${jsonUrl}');
const { files, total } = await res.json();

// All images
const images = files.filter(f => f.isImage);

// Build an image gallery
images.forEach(img => {
  const el = document.createElement('img');
  el.src = img.url;
  el.alt = img.name;
  gallery.appendChild(el);
});
\`\`\`

#### Client class with TTL cache
\`\`\`javascript
class RGAssets {
  constructor(url, ttl = 300_000) {
    this._url = url;
    this._cache = null;
    this._ts = 0;
    this._ttl = ttl;
  }
  async fetch() {
    if (this._cache && Date.now() - this._ts < this._ttl) return this._cache;
    const res = await fetch(this._url + '?json=1');
    if (!res.ok) throw new Error('RGAssets fetch failed (' + res.status + ')');
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    this._cache = json;
    this._ts = Date.now();
    return this._cache;
  }
  async images() { return (await this.fetch()).files.filter(f => f.isImage); }
  async all() { return (await this.fetch()).files; }
  invalidate() { this._cache = null; }
}

const ${v} = new RGAssets('${endpoint}');
// const images = await ${v}.images();
\`\`\`

#### Adding files
Drop files into the Google Drive folder at ${mod.folderUrl}
They appear in the API on the next fetch (no redeployment needed).

#### Notes
- Image \`url\` is a direct Google CDN link — use it in \`<img src="...">\` directly.
- Responses are cached 5 min by default in the client class above.
- The endpoint returns files in the order they appear in the Drive folder.`;
}

function siteConfigSection(mod: SiteConfigModuleSummary): string {
  const endpoint = mod.deploymentUrl ?? 'ENDPOINT';
  const jsonUrl = `${endpoint}?json=1`;
  const v = varName(mod.moduleName);

  return `${heading(3, `Site Config: ${mod.moduleName}`)}
**Endpoint:** \`${jsonUrl}\`
**Sheet:** ${mod.sheetUrl}
**Purpose:** Global key-value settings store. Clients edit copy, URLs, feature flags, and any other values directly in the Google Sheet — no code changes or redeployment needed.

#### Response shape
\`\`\`json
{
  "data": {
    "site_name":      "My Site",
    "hero_title":     "Welcome to my site",
    "hero_subtitle":  "Built with RG Forms",
    "hero_cta_label": "Get started",
    "hero_cta_url":   "https://...",
    "logo_url":       "https://...",
    "contact_email":  "hello@example.com",
    "footer_text":    "© 2024 My Site"
  }
}
\`\`\`
Values are auto-cast: \`"true"\`/\`"false"\` → boolean, numeric strings → number.

#### Fetch (client-side, TTL cache)
\`\`\`javascript
class RGConfig {
  constructor(url, ttl = 300_000) {
    this._url = url;
    this._cache = null;
    this._ts = 0;
    this._ttl = ttl;
  }
  async _fetch() {
    if (this._cache && Date.now() - this._ts < this._ttl) return this._cache;
    const res = await fetch(this._url + '?json=1');
    if (res.status === 503) { await new Promise(r => setTimeout(r, 2000)); return this._fetch(); }
    if (!res.ok) throw new Error('RGConfig fetch failed (' + res.status + ')');
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    this._cache = json.data;
    this._ts = Date.now();
    return this._cache;
  }
  async get(key, fallback = null) { const d = await this._fetch(); return key in d ? d[key] : fallback; }
  async all() { return this._fetch(); }
  invalidate() { this._cache = null; this._ts = 0; }
}

const ${v} = new RGConfig('${endpoint}');
// const heroTitle = await ${v}.get('hero_title', 'My Site');
// const config    = await ${v}.all();
\`\`\`

#### Fetch (Next.js App Router — server component)
\`\`\`typescript
async function getSiteConfig() {
  const res = await fetch('${jsonUrl}', { next: { revalidate: 300 } });
  const json = await res.json();
  return json.data as Record<string, string | number | boolean>;
}
// const config = await getSiteConfig();
// <h1>{config.hero_title}</h1>
\`\`\`

#### Fetch (Astro / SvelteKit / Nuxt — build time)
\`\`\`javascript
// Astro frontmatter:
// const res = await fetch('${jsonUrl}');
// const { data: config } = await res.json();

// SvelteKit +page.server.ts:
// export async function load({ fetch }) {
//   const res = await fetch('${jsonUrl}');
//   const { data: config } = await res.json();
//   return { config };
// }

// Nuxt 3:
// const { data: config } = await useFetch('${jsonUrl}', {
//   server: true, lazy: false, transform: (r) => r.data
// });
\`\`\`

#### Adding new keys
Open the Google Sheet at ${mod.sheetUrl}
Add a row: \`key | value | description\`. It appears in the API immediately — no redeployment needed.`;
}

// ─── RGConfig / RGContent class preamble ─────────────────────────────────────

const RGCONFIG_PREAMBLE = `## RGConfig — shared client class

Use this class whenever you need to access a site config endpoint from client-side code.
Copy it once into a shared utility file (e.g. \`src/lib/rgconfig.js\`).

\`\`\`javascript
export class RGConfig {
  constructor(url, ttl = 300_000) {
    this._url = url;
    this._cache = null;
    this._ts = 0;
    this._ttl = ttl;
  }
  async _fetch() {
    if (this._cache && Date.now() - this._ts < this._ttl) return this._cache;
    const res = await fetch(this._url + '?json=1');
    if (res.status === 503) { await new Promise(r => setTimeout(r, 2000)); return this._fetch(); }
    if (!res.ok) throw new Error('RGConfig fetch failed (' + res.status + ')');
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    this._cache = json.data;
    this._ts = Date.now();
    return this._cache;
  }
  async get(key, fallback = null) { const d = await this._fetch(); return key in d ? d[key] : fallback; }
  async all() { return this._fetch(); }
  invalidate() { this._cache = null; this._ts = 0; }
}
\`\`\``;

const RGCONTENT_PREAMBLE = `## RGContent — shared client class

Use this class whenever you need to read content from a content module endpoint.
Copy it once into a shared utility file (e.g. \`src/lib/rgcontent.js\`).

\`\`\`javascript
export class RGContent {
  constructor(url) { this._url = url; this._cache = new Map(); }
  async _get(params, _retry) {
    const entries = Object.entries({ json: 1, ...(params || {}) }).filter(([, v]) => v != null);
    const qs = '?' + new URLSearchParams(Object.fromEntries(entries));
    const url = this._url + qs;
    if (this._cache.has(url)) return this._cache.get(url);
    const res = await fetch(url);
    if (res.status === 503 && !_retry) { await new Promise(r => setTimeout(r, 2000)); return this._get(params, true); }
    if (!res.ok) throw new Error('RGContent fetch failed (' + res.status + ')');
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    this._cache.set(url, json);
    return json;
  }
  async list(params) { return this._get(params); }
  async get(slug) { return (await this._get({ slug })).data; }
  async getById(id) { return (await this._get({ _id: id })).data; }
  clearCache() { this._cache.clear(); }
}
\`\`\``;

const RGASSETS_PREAMBLE = `## RGAssets — shared client class

Use this class whenever you need to list files from an asset module endpoint.
Copy it once into a shared utility file (e.g. \`src/lib/rgassets.js\`).

\`\`\`javascript
export class RGAssets {
  constructor(url, ttl = 300_000) { this._url = url; this._cache = null; this._ts = 0; this._ttl = ttl; }
  async fetch() {
    if (this._cache && Date.now() - this._ts < this._ttl) return this._cache;
    const res = await fetch(this._url + '?json=1');
    if (!res.ok) throw new Error('RGAssets fetch failed (' + res.status + ')');
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    this._cache = json; this._ts = Date.now(); return this._cache;
  }
  async images() { return (await this.fetch()).files.filter(f => f.isImage); }
  async all() { return (await this.fetch()).files; }
  invalidate() { this._cache = null; }
}
\`\`\``;

// ─── Caching strategy guide ───────────────────────────────────────────────────

const CACHING_GUIDE = `## Caching strategy

All RG endpoints are backed by Apps Script web apps. They have a ~800ms–2s cold start on first request,
but warm requests are fast. Use these caching patterns to avoid the cold start penalty in production.

| Context | Recommended approach | Revalidation |
|---------|---------------------|-------------|
| Client-side SPA | Use RGConfig / RGContent class (TTL cache) | 5 min by default, call \`.invalidate()\` to force refresh |
| Next.js App Router | \`fetch(url, { next: { revalidate: 300 } })\` | ISR: regenerates stale pages in background |
| Next.js Pages Router | \`getStaticProps\` + \`revalidate: 300\` | ISR |
| Astro | Fetch in frontmatter (build time) | Redeploy or use SSR mode |
| SvelteKit | \`+page.server.ts load()\` | Configure \`config.isr\` or redeploy |
| Nuxt 3 | \`useFetch\` with \`server: true\` | \`getCachedData\` option |
| Plain HTML | Fetch at build time, write to JSON file | Redeploy when content changes |

**Key principle:** fetch on the server when possible. Clients get cached HTML and never see the cold start.
When client-side fetching is unavoidable, use the TTL cache classes — they prevent repeated API calls
during a page session and automatically retry on 503 (Apps Script quota exhaustion).`;

// ─── Authorization guide ──────────────────────────────────────────────────────

const AUTH_GUIDE = `## One-time script authorization

Each Apps Script endpoint requires a one-time authorization by the Google account that owns it.
This is a Google security requirement — it happens once, not for every user of the site.

**To authorize:** Visit the bare endpoint URL (without \`?json=1\`) in a browser while signed in
to the owning Google account. Click through the consent screen. After that, the endpoint serves
data publicly to anyone without requiring authentication.

If a user sees \`{"error": "Authorization required"}\` it means the script owner hasn't authorized it yet.`;

// ─── Main export ─────────────────────────────────────────────────────────────

const RGCALENDAR_PREAMBLE = `## RGCalendar — shared client class

\`\`\`javascript
export class RGCalendar {
  constructor(url, ttl = 300_000) { this._url = url; this._cache = new Map(); this._ttl = ttl; }
  async _fetch(params, _retry) {
    const entries = Object.entries({ json: 1, ...(params || {}) }).filter(([, v]) => v != null);
    const key = JSON.stringify(entries);
    const cached = this._cache.get(key);
    if (cached && Date.now() - cached.ts < this._ttl) return cached.data;
    const qs = '?' + new URLSearchParams(Object.fromEntries(entries));
    const res = await fetch(this._url + qs);
    if (res.status === 503 && !_retry) { await new Promise(r => setTimeout(r, 2000)); return this._fetch(params, true); }
    if (!res.ok) throw new Error('RGCalendar fetch failed (' + res.status + ')');
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    this._cache.set(key, { data: json, ts: Date.now() });
    return json;
  }
  async upcoming(params) { return this._fetch(params); }
  async past(params) { return this._fetch({ ...params, past: 1 }); }
  async all(params) { return this._fetch({ ...params, all: 1 }); }
  async range(from, to, params) { return this._fetch({ ...params, from, to }); }
  async byCategory(category, params) { return this._fetch({ ...params, category }); }
  invalidate() { this._cache.clear(); }
}
\`\`\``;

const RGGALLERY_PREAMBLE = `## RGGallery — shared client class

\`\`\`javascript
export class RGGallery {
  constructor(url, ttl = 300_000) { this._url = url; this._cache = new Map(); this._ttl = ttl; }
  async _fetch(params, _retry) {
    const entries = Object.entries({ json: 1, ...(params || {}) }).filter(([, v]) => v != null);
    const key = JSON.stringify(entries);
    const cached = this._cache.get(key);
    if (cached && Date.now() - cached.ts < this._ttl) return cached.data;
    const qs = '?' + new URLSearchParams(Object.fromEntries(entries));
    const res = await fetch(this._url + qs);
    if (res.status === 503 && !_retry) { await new Promise(r => setTimeout(r, 2000)); return this._fetch(params, true); }
    if (!res.ok) throw new Error('RGGallery fetch failed (' + res.status + ')');
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    this._cache.set(key, { data: json, ts: Date.now() });
    return json;
  }
  async all(params) { return this._fetch(params); }
  async featured() { return this._fetch({ featured: 1 }); }
  async byCategory(category, params) { return this._fetch({ ...params, category }); }
  async search(query) { return this._fetch({ search: query }); }
  invalidate() { this._cache.clear(); }
}
\`\`\``;

export interface SkillExportOptions {
  forms: FormSummary[];
  contentModules: ContentModuleSummary[];
  assetModules: AssetModuleSummary[];
  siteConfigs: SiteConfigModuleSummary[];
  calendars: CalendarModuleSummary[];
  galleries: GalleryModuleSummary[];
  format: 'claude' | 'cursor' | 'generic';
}

export function generateSkillExport(opts: SkillExportOptions): string {
  const { forms, contentModules, assetModules, siteConfigs, calendars, galleries, format } = opts;

  const hasContent   = contentModules.length > 0;
  const hasAssets    = assetModules.length > 0;
  const hasConfigs   = siteConfigs.length > 0;
  const hasForms     = forms.length > 0;
  const hasCalendars = calendars.length > 0;
  const hasGalleries = galleries.length > 0;

  const header = format === 'claude'
    ? `# RG Forms — AI Skill File

This file teaches Claude Code how to integrate with all of this project's RG Forms modules.
Include it as \`CLAUDE.md\` at the root of your project, or import it in your CLAUDE.md.

Generated by [RG Forms](https://rgforms.io) · ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

---`
    : format === 'cursor'
    ? `# RG Forms — Cursor Rules

This file teaches Cursor AI how to integrate with all of this project's RG Forms modules.
Include it as \`.cursorrules\` at the root of your project.

Generated by RG Forms · ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

---`
    : `# RG Forms — Integration Reference

This file documents all RG Forms modules for this project and provides ready-to-use code snippets.

Generated by RG Forms · ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

---`;

  const overview = `## Overview

This project uses **RG Forms** — a serverless Google Drive backend.
All data lives in the owner's Google Drive. No server, no database, no API keys required on the frontend.

| Module type | Count | Purpose |
|-------------|-------|---------|
| Contact forms | ${forms.length} | Receive and store form submissions, send email notifications |
| Content modules | ${contentModules.length} | Structured content APIs (blog posts, team, FAQs, etc.) |
| Asset modules | ${assetModules.length} | File/image galleries from Google Drive folders |
| Site configs | ${siteConfigs.length} | Global key-value settings editable from a Google Sheet |
| Calendars | ${calendars.length} | Event/schedule APIs with date range + category filtering |
| Galleries | ${galleries.length} | Image gallery APIs with category/featured/search filtering |

### How endpoints work
- All endpoints are Google Apps Script web app URLs (e.g. \`https://script.google.com/macros/s/.../exec\`)
- Bare URL (no params) → returns an HTML authorization confirmation page
- Append \`?json=1\` → returns JSON data (for content/asset/config modules)
- Forms accept POST with JSON or form-encoded body
- No API keys required — endpoints are publicly readable`;

  const sections: string[] = [header, overview];

  if (hasConfigs || hasContent || hasAssets || hasCalendars || hasGalleries) {
    sections.push(CACHING_GUIDE);
    sections.push(AUTH_GUIDE);
  }

  if (hasForms) {
    sections.push(heading(2, 'Contact Forms'));
    sections.push(...forms.map(formSection));
  }

  if (hasConfigs) {
    sections.push(heading(2, 'Site Config Modules'));
    sections.push(RGCONFIG_PREAMBLE);
    sections.push(...siteConfigs.map(siteConfigSection));
  }

  if (hasContent) {
    sections.push(heading(2, 'Content Modules'));
    sections.push(RGCONTENT_PREAMBLE);
    sections.push(...contentModules.map(contentSection));
  }

  if (hasAssets) {
    sections.push(heading(2, 'Asset Modules'));
    sections.push(RGASSETS_PREAMBLE);
    sections.push(...assetModules.map(assetSection));
  }

  if (hasCalendars) {
    sections.push(heading(2, 'Calendar Modules'));
    sections.push(RGCALENDAR_PREAMBLE);
    sections.push(...calendars.map(calendarSkillSection));
  }

  if (hasGalleries) {
    sections.push(heading(2, 'Gallery Modules'));
    sections.push(RGGALLERY_PREAMBLE);
    sections.push(...galleries.map(gallerySkillSection));
  }

  if (format === 'claude') {
    const formInstructions = hasForms ? `

### Contact forms
7. Submit forms with \`Content-Type: application/x-www-form-urlencoded\` and \`URLSearchParams\` — do **not** use JSON.
8. Use the project's existing UI components and design system — do **not** add new CSS files, UI libraries, or external dependencies.
9. Manage three UI states: \`idle\` (form enabled), \`submitting\` (button disabled, show loading indicator if available), \`result\` (inline success/error message; reset form on success).
10. Add \`aria-live="polite"\` to the success/error message region; associate every input with a visible \`<label>\`.
11. If the form lists a honeypot field, include the exact hidden \`<input name="website" ...>\` shown in the form section — never display it to the user.` : '';

    sections.push(`## Instructions for Claude

When the user asks you to build UI that uses data from any of the modules above:
1. Use the correct endpoint URL from this file — do not invent URLs.
2. Use the provided client class (RGConfig, RGContent, RGAssets) — copy-paste it into a utility file.
3. For server-rendered frameworks (Next.js, Astro, SvelteKit, Nuxt), fetch on the server with appropriate caching.
4. For client-side-only sites, use TTL-cached classes to avoid repeated cold starts.
5. Never hardcode content — always fetch from the appropriate module endpoint.
6. If the user wants to add new content types or fields, direct them to edit the Google Sheet — no code changes needed for content, only for schema-changing content modules.${formInstructions}`);
  }

  return sections.join('\n\n---\n\n');
}
