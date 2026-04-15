import type { CalendarModuleSummary } from '@/types';

function varName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/, '') || 'calendar';
}

// ─── Client-side snippet (RGCalendar class with TTL cache) ────────────────────

export function generateCalendarClientSnippet(result: { deploymentUrl: string }, name: string): string {
  const v = varName(name);
  const url = result.deploymentUrl;
  return `// RG Calendar — ${name}
// Fetches events from your Google Sheet. Responses cached 5 min by default.
class RGCalendar {
  constructor(url, ttl = 300_000) {
    this._url = url;
    this._cache = new Map();
    this._ttl = ttl;
  }
  async _fetch(params, _retry) {
    const entries = Object.entries({ json: 1, ...(params || {}) }).filter(([, v]) => v != null);
    const key = JSON.stringify(entries);
    const cached = this._cache.get(key);
    if (cached && Date.now() - cached.ts < this._ttl) return cached.data;
    const qs = '?' + new URLSearchParams(Object.fromEntries(entries));
    const res = await fetch(this._url + qs);
    if (res.status === 503 && !_retry) {
      await new Promise(r => setTimeout(r, 2000));
      return this._fetch(params, true);
    }
    if (!res.ok) throw new Error('RGCalendar fetch failed (' + res.status + ')');
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    this._cache.set(key, { data: json, ts: Date.now() });
    return json;
  }
  // Upcoming events (default)
  async upcoming(params) { return this._fetch(params); }
  // Past events
  async past(params) { return this._fetch({ ...params, past: 1 }); }
  // All events (past + future)
  async all(params) { return this._fetch({ ...params, all: 1 }); }
  // Events between two dates (YYYY-MM-DD)
  async range(from, to, params) { return this._fetch({ ...params, from, to }); }
  // Events for a specific category
  async byCategory(category, params) { return this._fetch({ ...params, category }); }
  invalidate() { this._cache.clear(); }
}

const ${v} = new RGCalendar('${url}');

// Usage:
// const { events, total } = await ${v}.upcoming();
// const { events } = await ${v}.byCategory('workshop');
// const { events } = await ${v}.range('2024-06-01', '2024-06-30');
// const { events } = await ${v}.past({ limit: 5 });`;
}

// ─── Server-side / build-time snippet ────────────────────────────────────────

export function generateCalendarServerSnippet(result: { deploymentUrl: string }, name: string): string {
  const url = `${result.deploymentUrl}?json=1`;
  const urlPast = `${result.deploymentUrl}?json=1&past=1`;
  const urlAll = `${result.deploymentUrl}?json=1&all=1`;
  return `// ── Next.js App Router (server component) ──────────────────────────────────
// Revalidates every 5 minutes. Set 0 for always-fresh, Infinity for build-time only.
async function getEvents(params = {}) {
  const qs = new URLSearchParams({ ...params, json: '1' }).toString();
  const res = await fetch(\`${result.deploymentUrl}?\${qs}\`, {
    next: { revalidate: 300 },
  });
  const { events, total } = await res.json();
  return { events, total };
}
// Upcoming: const { events } = await getEvents();
// Past:     const { events } = await getEvents({ past: '1' });
// Range:    const { events } = await getEvents({ from: '2024-06-01', to: '2024-06-30' });


// ── Next.js Pages Router ────────────────────────────────────────────────────
export async function getStaticProps() {
  const res = await fetch('${url}');
  const { events } = await res.json();
  return { props: { events }, revalidate: 300 };
}


// ── Astro (build time) ──────────────────────────────────────────────────────
// In your .astro frontmatter:
// const res = await fetch('${url}');
// const { events } = await res.json();


// ── SvelteKit ───────────────────────────────────────────────────────────────
// src/routes/+page.server.ts
// export async function load({ fetch }) {
//   const res = await fetch('${url}');
//   const { events } = await res.json();
//   return { events };
// }


// ── Query parameters reference ──────────────────────────────────────────────
// ${url}              → upcoming events (today and later)
// ${urlPast}   → past events, sorted newest first
// ${urlAll}     → all events
// ?from=2024-01-01&to=2024-12-31  → events in a date range
// ?category=workshop              → events matching this category
// ?limit=10&offset=0              → paginate (max 500)`;
}

// ─── Schema reference ─────────────────────────────────────────────────────────

export function generateCalendarSchemaSnippet(name: string): string {
  return `// ${name} — Calendar endpoint response shape
// GET  endpoint?json=1
{
  "events": [
    {
      "title":       string,   // Event name (required)
      "date":        string,   // YYYY-MM-DD (e.g. "2024-06-15")
      "start_time":  string,   // HH:MM (e.g. "14:00"), optional
      "end_time":    string,   // HH:MM (e.g. "15:30"), optional
      "description": string,   // Event description, optional
      "location":    string,   // Venue or address, optional
      "category":    string,   // For filtering (e.g. "workshop"), optional
      "url":         string,   // External link for the event, optional
      "all_day":     boolean,  // true if no specific time
      "color":       string,   // Hex color for calendar display, optional
    }
  ],
  "total": number
}

// Default: returns upcoming events (today and later), sorted by date ascending.
// ?past=1    → past events sorted newest first
// ?all=1     → all events
// ?from=YYYY-MM-DD  → from this date (inclusive)
// ?to=YYYY-MM-DD    → to this date (inclusive)
// ?category=x       → filter by category (case-insensitive)
// ?limit=N&offset=M → pagination (max 500 per request)

// Edit events in the Google Sheet directly — no redeployment needed.`;
}

// ─── Skill-export helper ──────────────────────────────────────────────────────

export function calendarSkillSection(module: CalendarModuleSummary): string {
  const v = varName(module.moduleName);
  const url = module.deploymentUrl ? `${module.deploymentUrl}?json=1` : 'ENDPOINT?json=1';
  return `### Calendar: ${module.moduleName}
**Endpoint:** \`${module.deploymentUrl ?? 'not yet deployed'}\`
**Sheet:** ${module.sheetUrl}
**Purpose:** Event/schedule API. Clients add events to the Google Sheet — they appear in the API immediately.

#### Fetch upcoming events (Next.js App Router)
\`\`\`typescript
const res = await fetch('${url}', { next: { revalidate: 300 } });
const { events, total } = await res.json();
\`\`\`

#### Client-side with cache
\`\`\`javascript
const ${v} = new RGCalendar('${module.deploymentUrl ?? 'ENDPOINT'}');
const { events } = await ${v}.upcoming();
const { events: past } = await ${v}.past({ limit: 5 });
const { events: workshops } = await ${v}.byCategory('workshop');
\`\`\`

#### Event shape
\`\`\`json
{ "title": string, "date": "YYYY-MM-DD", "start_time": "HH:MM", "end_time": "HH:MM",
  "description": string, "location": string, "category": string, "url": string,
  "all_day": boolean, "color": "#hex" }
\`\`\`

#### Query params
- Default: upcoming (today+), sorted by date asc
- \`?past=1\` past events, newest first
- \`?all=1\` all events
- \`?from=2024-01-01&to=2024-12-31\` date range
- \`?category=workshop\` filter by category`;
}
