import type { SiteConfigModuleSummary } from '@/types';

function varName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/, '') || 'config';
}

// ─── Client-side snippet (RGConfig class with TTL cache) ──────────────────────

export function generateConfigClientSnippet(result: { deploymentUrl: string }, name: string): string {
  const v = varName(name);
  return `// RG Config — ${name}
// Fetches your site config from Google Sheets.
// Responses are cached client-side for 5 minutes by default.
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
    if (res.status === 503) {
      await new Promise(r => setTimeout(r, 2000));
      return this._fetch();
    }
    if (!res.ok) throw new Error('RGConfig fetch failed (' + res.status + ')');
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    this._cache = json.data;
    this._ts = Date.now();
    return this._cache;
  }
  async get(key, fallback = null) {
    const data = await this._fetch();
    return key in data ? data[key] : fallback;
  }
  async all() { return this._fetch(); }
  invalidate() { this._cache = null; this._ts = 0; }
}

const ${v} = new RGConfig('${result.deploymentUrl}');

// Usage:
// const heroTitle = await ${v}.get('hero_title', 'My Site');
// const config    = await ${v}.all();
// ${v}.invalidate(); // force refresh on next call`;
}

// ─── Server-side / build-time snippet (framework-specific) ───────────────────

export function generateConfigServerSnippet(result: { deploymentUrl: string }, name: string): string {
  const url = `${result.deploymentUrl}?json=1`;
  return `// ── Next.js App Router (server component) ──────────────────────────────────
// Fetched on the server, cached by Next.js for 5 minutes.
// Update 'revalidate' to control how often the config refreshes.
async function getSiteConfig() {
  const res = await fetch('${url}', {
    next: { revalidate: 300 }, // seconds
  });
  const json = await res.json();
  return json.data as Record<string, string | number | boolean>;
}
// In your component:
// const config = await getSiteConfig();
// <h1>{config.hero_title}</h1>


// ── Next.js Pages Router ───────────────────────────────────────────────────
export async function getStaticProps() {
  const res = await fetch('${url}');
  const { data: siteConfig } = await res.json();
  return { props: { siteConfig }, revalidate: 300 };
}
// Props: { siteConfig: Record<string, string | number | boolean> }


// ── Astro ──────────────────────────────────────────────────────────────────
// In your .astro frontmatter (runs at build time):
// ---
// const res = await fetch('${url}');
// const { data: siteConfig } = await res.json();
// ---


// ── SvelteKit ──────────────────────────────────────────────────────────────
// src/routes/+layout.server.ts
// export async function load({ fetch }) {
//   const res = await fetch('${url}');
//   const { data: siteConfig } = await res.json();
//   return { siteConfig };
// }


// ── Nuxt 3 ─────────────────────────────────────────────────────────────────
// const { data: siteConfig } = await useFetch('${url}', {
//   server: true, lazy: false,
//   transform: (r) => r.data,
// });


// ── Plain HTML (build script) ──────────────────────────────────────────────
// Run: node fetch-config.js  (before deploying)
// import { writeFileSync } from 'fs';
// const res = await fetch('${url}');
// const { data } = await res.json();
// writeFileSync('src/data/site-config.json', JSON.stringify(data, null, 2));
// Then import site-config.json directly in your templates.`;
}

// ─── What the endpoint returns ────────────────────────────────────────────────

export function generateConfigSchemaSnippet(name: string): string {
  return `// ${name} — Config endpoint response shape
// GET ${' '}endpoint?json=1
{
  "data": {
    "site_name":       string,   // Name of the site
    "hero_title":      string,   // Main headline on the homepage
    "hero_subtitle":   string,   // Subheading below the hero title
    "hero_cta_label":  string,   // Call-to-action button label
    "hero_cta_url":    string,   // Call-to-action button URL
    "logo_url":        string,   // URL of the site logo
    "contact_email":   string,   // Email shown in the contact section
    "footer_text":     string,   // Footer tagline or copyright text
    // ... any keys you add to the Config sheet
  }
}

// Keys and values are defined directly in the Google Sheet.
// Adding a new row adds a new key — no code changes needed.
// Values are auto-cast: "true"/"false" → boolean, numeric strings → number.`;
}

// ─── Skill-export helper ──────────────────────────────────────────────────────

export function siteConfigSkillSection(module: SiteConfigModuleSummary): string {
  const v = varName(module.moduleName);
  const url = module.deploymentUrl ? `${module.deploymentUrl}?json=1` : 'ENDPOINT?json=1';
  return `### Site Config: ${module.moduleName}
**Endpoint:** \`${module.deploymentUrl ?? 'not yet deployed'}\`
**Sheet:** ${module.sheetUrl}
**Purpose:** Global key-value settings. Clients edit values directly in the Google Sheet — no code changes needed.

#### Fetch (Next.js App Router — server component, revalidates every 5 min)
\`\`\`typescript
const res = await fetch('${url}', { next: { revalidate: 300 } });
const { data: ${v} } = await res.json();
// ${v}.hero_title, ${v}.logo_url, etc.
\`\`\`

#### Fetch (client-side with TTL cache)
\`\`\`javascript
const ${v} = new RGConfig('${module.deploymentUrl ?? 'ENDPOINT'}');
const heroTitle = await ${v}.get('hero_title', 'My Site');
const allConfig = await ${v}.all();
\`\`\`

#### Adding new keys
Open the Google Sheet and add a row: \`key | value | description\`.
No redeployment needed — the endpoint reads live sheet data.`;
}
