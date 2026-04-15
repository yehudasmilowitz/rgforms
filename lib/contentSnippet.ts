import type { ContentModuleConfig, ContentModuleResult } from '@/types';

// ─── Read-only JS class (safe to embed publicly) ─────────────────────────────

export function generateReadSnippet(result: ContentModuleResult, config: ContentModuleConfig): string {
  const varName = config.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'content';

  return `// RG Content — ${config.name}
// Read-only client — safe to use in public code
//
// Notes:
// • First request is slow (800ms–2s) — Apps Script cold start + double redirect.
//   Subsequent calls for the same URL are instant (served from in-memory cache).
// • If the endpoint returns a 503, Google's quota is temporarily exhausted.
//   The client retries once after a short delay before throwing.
// • doGet() is a CORS-safe simple request — no preflight. Works from any origin.
class RGContent {
  constructor(url) {
    this._url = url;
    this._cache = new Map();
  }

  async _get(params, _retry) {
    const entries = Object.entries(params || {}).filter(([, v]) => v != null);
    const qs = entries.length ? '?' + new URLSearchParams(Object.fromEntries(entries)) : '';
    const url = this._url + qs;
    if (this._cache.has(url)) return this._cache.get(url);
    const res = await fetch(url);
    if (res.status === 503 && !_retry) {
      // Apps Script quota temporarily exhausted — retry once after 2s
      await new Promise(r => setTimeout(r, 2000));
      return this._get(params, true);
    }
    if (!res.ok) throw new Error('RGContent fetch failed (' + res.status + '). If this is a 503, the Apps Script quota may be exhausted.');
    const json = await res.json();
    if (json.error) throw new Error('RGContent API error: ' + json.error);
    this._cache.set(url, json);
    return json;
  }

  // Returns { data: [...], total, limit, offset }
  async list(params) { return this._get(params); }

  // Returns a single item by slug field value (null if not found)
  async get(slug) { return (await this._get({ slug })).data; }

  // Returns a single item by _id (null if not found)
  async getById(id) { return (await this._get({ _id: id })).data; }

  // Returns unique values of a field — useful for building filter UIs
  async values(field) {
    const res = await this._get();
    return [...new Set(
      (res.data || []).flatMap(row => Array.isArray(row[field]) ? row[field] : [row[field]])
        .filter(Boolean)
    )];
  }

  clearCache() { this._cache.clear(); }
}

const ${varName} = new RGContent('${result.deploymentUrl}');

// ── Examples ────────────────────────────────────────────────────────────────
// All published records (default limit: 100)
// const { data, total } = await ${varName}.list();
//
${config.fields.length > 0 ? `// Sort by ${config.fields[0].key}, newest first
// const { data } = await ${varName}.list({ sort: '${config.fields[0].key}', order: 'desc', limit: 10 });
//` : ''}
${config.hasSlug ? `// Single item by slug
// const item = await ${varName}.get('my-slug');
//` : ''}
// Filter by field value
// const { data } = await ${varName}.list({ ${config.fields[0]?.key ?? 'field'}: 'value' });
//
// Unique values for a filter dropdown
// const categories = await ${varName}.values('${config.fields.find(f => f.type === 'tags')?.key ?? config.fields[0]?.key ?? 'category'}');`;
}

// ─── Write API reference (keep private — contains write token) ───────────────

export function generateWriteSnippet(result: ContentModuleResult, config: ContentModuleConfig): string {
  const exampleCreate: Record<string, unknown> = {};
  config.fields.forEach((f) => {
    switch (f.type) {
      case 'number':   exampleCreate[f.key] = 42;               break;
      case 'boolean':  exampleCreate[f.key] = true;             break;
      case 'tags':     exampleCreate[f.key] = ['tag1', 'tag2']; break;
      case 'date':     exampleCreate[f.key] = '2026-01-01';     break;
      default:         exampleCreate[f.key] = `My ${f.label}`;  break;
    }
  });
  if (config.hasSlug)      exampleCreate['slug']      = 'my-record';
  if (config.hasPublished) exampleCreate['published'] = true;

  return `// RG Content Write API — ${config.name}
// ⚠️  Keep your write token private — server-side or admin use only
const ENDPOINT   = '${result.deploymentUrl}';
const WRITE_TOKEN = '${result.writeToken}';

async function rgPost(action, id, payload) {
  const body = new URLSearchParams({ _token: WRITE_TOKEN, _action: action });
  if (id)      body.set('_id', id);
  if (payload) body.set('_payload', JSON.stringify(payload));
  const res = await fetch(ENDPOINT, { method: 'POST', body });
  return res.json(); // { data: {...} } or { error: '...' }
}

// Create a new record — returns the created record with _id assigned
const created = await rgPost('create', null, ${JSON.stringify(exampleCreate, null, 2).split('\n').join('\n  ')});
// → { data: { _id: '...', ...fields, _created_at: '...', _updated_at: '...' } }

// Update a record by _id — only fields in the payload are changed
const updated = await rgPost('update', created.data._id, { ${config.fields[0] ? `${config.fields[0].key}: 'Updated value'` : 'field: value'} });

// Delete a record by _id
const deleted = await rgPost('delete', created.data._id, null);
// → { data: { deleted: true, _id: '...' } }`;
}

// ─── Column schema reference ─────────────────────────────────────────────────

export function generateSchemaReference(config: ContentModuleConfig): string {
  const userCols = config.fields.map((f) => `  ${f.key.padEnd(20)} ${f.type}`);
  const optionalCols = [
    ...(config.hasSlug      ? [`  ${'slug'.padEnd(20)} text`]    : []),
    ...(config.hasPublished ? [`  ${'published'.padEnd(20)} boolean`] : []),
  ];
  const systemCols = [
    `  ${'_id'.padEnd(20)} text (UUID, auto-generated)`,
    `  ${'_created_at'.padEnd(20)} date (ISO, auto-set)`,
    `  ${'_updated_at'.padEnd(20)} date (ISO, auto-updated)`,
  ];

  return `// Sheet column schema — ${config.name}
// Manage content at: (open the sheet link above)
//
// Column               Type
// ─────────────────────────────────────────────
${[...userCols, ...optionalCols, ...systemCols].join('\n')}`;
}
