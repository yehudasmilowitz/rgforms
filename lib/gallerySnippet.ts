import type { GalleryModuleSummary } from '@/types';

function varName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/, '') || 'gallery';
}

// ─── Client-side snippet (RGGallery class with TTL cache) ─────────────────────

export function generateGalleryClientSnippet(result: { deploymentUrl: string }, name: string): string {
  const v = varName(name);
  const url = result.deploymentUrl;
  return `// RG Gallery — ${name}
// Fetches images from your Google Sheet. Responses cached 5 min by default.
class RGGallery {
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
    if (!res.ok) throw new Error('RGGallery fetch failed (' + res.status + ')');
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    this._cache.set(key, { data: json, ts: Date.now() });
    return json;
  }
  // All images (sorted by order field)
  async all(params) { return this._fetch(params); }
  // Only featured images
  async featured() { return this._fetch({ featured: 1 }); }
  // Images in a category
  async byCategory(category, params) { return this._fetch({ ...params, category }); }
  // Search by title/caption/alt text
  async search(query) { return this._fetch({ search: query }); }
  invalidate() { this._cache.clear(); }
}

const ${v} = new RGGallery('${url}');

// Usage:
// const { images, total } = await ${v}.all();
// const { images } = await ${v}.featured();
// const { images } = await ${v}.byCategory('portraits');
// const { images } = await ${v}.search('sunset');

// Render a grid:
// images.forEach(img => {
//   const el = document.createElement('img');
//   el.src = img.image_url;
//   el.alt = img.alt || img.title;
//   gallery.appendChild(el);
// });`;
}

// ─── Server-side / build-time snippet ────────────────────────────────────────

export function generateGalleryServerSnippet(result: { deploymentUrl: string }, name: string): string {
  const url = `${result.deploymentUrl}?json=1`;
  return `// ── Next.js App Router (server component) ──────────────────────────────────
async function getGallery(params = {}) {
  const qs = new URLSearchParams({ ...params, json: '1' }).toString();
  const res = await fetch(\`${result.deploymentUrl}?\${qs}\`, {
    next: { revalidate: 300 },
  });
  const { images, total } = await res.json();
  return { images, total };
}
// All:      const { images } = await getGallery();
// Featured: const { images } = await getGallery({ featured: '1' });
// Category: const { images } = await getGallery({ category: 'portraits' });


// ── Next.js Pages Router ────────────────────────────────────────────────────
export async function getStaticProps() {
  const res = await fetch('${url}');
  const { images } = await res.json();
  return { props: { images }, revalidate: 300 };
}


// ── Astro (build time) ──────────────────────────────────────────────────────
// const res = await fetch('${url}');
// const { images } = await res.json();


// ── React image gallery (client-side) ──────────────────────────────────────
// const ${varName(name)} = new RGGallery('${result.deploymentUrl}');
// const { images } = await ${varName(name)}.all();
// {images.map(img => (
//   <img key={img.image_url} src={img.image_url} alt={img.alt || img.title} />
// ))}


// ── Query parameters reference ──────────────────────────────────────────────
// ${url}              → all images, sorted by order field
// ?featured=1         → only images with Featured=TRUE
// ?category=portraits → images in this category
// ?search=keyword     → search title, caption, alt text
// ?limit=20&offset=0  → paginate (max 500)`;
}

// ─── Schema reference ─────────────────────────────────────────────────────────

export function generateGallerySchemaSnippet(name: string): string {
  return `// ${name} — Gallery endpoint response shape
// GET  endpoint?json=1
{
  "images": [
    {
      "title":     string,   // Image title (required)
      "image_url": string,   // Direct image URL — use in <img src="...">
      "caption":   string,   // Displayed below the image, optional
      "alt":       string,   // Accessibility alt text, optional
      "category":  string,   // For filtering (e.g. "portraits"), optional
      "featured":  boolean,  // true = show in featured gallery
      "order":     number,   // Sort order (lower = first), optional
      "link_url":  string,   // Clickable link wrapping the image, optional
    }
  ],
  "total": number
}

// Images are sorted by order field (ascending), nulls last, then row order.
// ?featured=1         → only images with Featured=TRUE
// ?category=portraits → filter by category (case-insensitive)
// ?search=keyword     → search title, caption, alt text
// ?limit=N&offset=M   → pagination (max 500)

// To add images: open the Google Sheet, add a row with an image URL.
// image_url can be any public URL — Google Drive sharing links,
// RG Assets CDN URLs, or any hosted image.`;
}

// ─── Skill-export helper ──────────────────────────────────────────────────────

export function gallerySkillSection(module: GalleryModuleSummary): string {
  const v = varName(module.moduleName);
  const url = module.deploymentUrl ? `${module.deploymentUrl}?json=1` : 'ENDPOINT?json=1';
  return `### Gallery: ${module.moduleName}
**Endpoint:** \`${module.deploymentUrl ?? 'not yet deployed'}\`
**Sheet:** ${module.sheetUrl}
**Purpose:** Image gallery API. Add image URLs (from RG Assets, Google Drive, or any public host) to the Sheet — they appear in the API immediately.

#### Fetch images (Next.js App Router)
\`\`\`typescript
const res = await fetch('${url}', { next: { revalidate: 300 } });
const { images, total } = await res.json();
\`\`\`

#### Client-side with cache
\`\`\`javascript
const ${v} = new RGGallery('${module.deploymentUrl ?? 'ENDPOINT'}');
const { images } = await ${v}.all();
const { images: featured } = await ${v}.featured();
const { images: portraits } = await ${v}.byCategory('portraits');
\`\`\`

#### Image shape
\`\`\`json
{ "title": string, "image_url": string, "caption": string, "alt": string,
  "category": string, "featured": boolean, "order": number, "link_url": string }
\`\`\`

#### Rendering
\`\`\`html
<!-- Simple gallery grid -->
<div class="gallery">
  {images.map(img => \`
    <figure>
      <img src="\${img.image_url}" alt="\${img.alt || img.title}" loading="lazy" />
      \${img.caption ? \`<figcaption>\${img.caption}</figcaption>\` : ''}
    </figure>
  \`).join('')}
</div>
\`\`\`

#### Query params
- Default: all images sorted by Order field
- \`?featured=1\` only Featured=TRUE images
- \`?category=portraits\` filter by category
- \`?search=keyword\` search title/caption/alt`;
}
