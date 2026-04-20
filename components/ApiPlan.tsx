'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Business Plan v4 — The API Pivot
// Google Sheets as a typed REST backend. Developer tool, not website builder.
// ─────────────────────────────────────────────────────────────────────────────

const cyan = 'oklch(0.75 0.15 195)';
const cyanA = (a: number) => `oklch(0.75 0.15 195 / ${a})`;
const rose = 'oklch(0.65 0.20 15)';
const roseA = (a: number) => `oklch(0.65 0.20 15 / ${a})`;
const amber = 'oklch(0.73 0.17 65)';
const amberA = (a: number) => `oklch(0.73 0.17 65 / ${a})`;

function Rule() {
  return <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />;
}

function Label({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest"
      style={{ color: color ?? 'var(--color-subtle)', fontFamily: 'var(--font-mono, monospace)' }}>
      {children}
    </p>
  );
}

function Pill({ children, color, bg, border }: { children: React.ReactNode; color: string; bg: string; border: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
      style={{ color, background: bg, border: `1px solid ${border}` }}>
      {children}
    </span>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="rounded-lg p-3 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre"
      style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
      {children}
    </pre>
  );
}

function Callout({ children, color, colorA }: { children: React.ReactNode; color: string; colorA: (a: number) => string }) {
  return (
    <div className="rounded-xl p-4 text-sm leading-relaxed"
      style={{ background: colorA(0.06), border: `1px solid ${colorA(0.28)}`, color: 'var(--color-muted)', borderLeft: `3px solid ${color}` }}>
      {children}
    </div>
  );
}

function Row({ label, value, highlight, sub }: { label: string; value: string; highlight?: string; sub?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div>
        <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{label}</span>
        {sub && <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-subtle)' }}>{sub}</p>}
      </div>
      <span className="text-sm font-semibold text-right shrink-0"
        style={{ color: highlight ?? 'var(--color-text)' }}>{value}</span>
    </div>
  );
}

function Check({ items }: { items: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
          <span className="shrink-0 mt-0.5 font-bold" style={{ color: cyan }}>✓</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function Cross({ items }: { items: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
          <span className="shrink-0 mt-0.5 font-bold" style={{ color: rose }}>✕</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function Dash({ items }: { items: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
          <span className="shrink-0 mt-0.5 font-bold" style={{ color: amber }}>—</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function Step({ n, label, detail, effort, color, colorA }: {
  n: string; label: string; detail: React.ReactNode; effort: string;
  color: string; colorA: (a: number) => string;
}) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderLeft: `3px solid ${color}` }}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{n}. {label}</p>
        <span className="text-[10px] px-2 py-0.5 rounded font-semibold shrink-0 font-mono"
          style={{ color, background: colorA(0.10), border: `1px solid ${colorA(0.28)}` }}>
          {effort}
        </span>
      </div>
      <div className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{detail}</div>
    </div>
  );
}

export default function ApiPlan() {
  return (
    <article className="w-full max-w-2xl mx-auto flex flex-col gap-10 pb-20 pt-4">

      {/* Header */}
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Pill color="var(--color-muted)" bg="var(--color-surface-2)" border="var(--color-border)">Internal · Not indexed</Pill>
          <Pill color={cyan} bg={cyanA(0.10)} border={cyanA(0.30)}>v4 — The pivot</Pill>
          <Pill color={rose} bg={roseA(0.10)} border={roseA(0.30)}>Replaces the website builder</Pill>
        </div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
          Build the API.
        </h1>
        <p className="text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Google Sheets as a typed REST backend. Instant provisioning, zero infrastructure to manage,
          auto-generated TypeScript client. You&apos;re not a website builder — you&apos;re a developer tool.
        </p>
      </header>

      <Rule />

      {/* The reframe */}
      <section className="flex flex-col gap-4">
        <Label>The reframe — one sentence</Label>
        <div className="rounded-xl p-5"
          style={{ background: cyanA(0.06), border: `1px solid ${cyanA(0.28)}` }}>
          <p className="text-base font-semibold leading-snug" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
            sheetspin is not a website builder. It&apos;s an instant typed REST API backed by a Google Sheet,
            with a form endpoint built in, free to run.
          </p>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Same underlying infrastructure. Same provisioning. Same Apps Script. Completely different product
          framing, completely different customer, completely different price point. What changes is who you
          are building for and what they are paying for.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl p-4 flex flex-col gap-3"
            style={{ background: roseA(0.05), border: `1px solid ${roseA(0.20)}` }}>
            <Label color={rose}>What you were building</Label>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              A website builder where the CMS is a Google Sheet. Competing with Wix, Squarespace, Carrd.
              Customers: small business owners. Price: $12/mo. Support load: high.
              Distribution: cold outreach, SEO, word of mouth. Build time: 3+ months.
            </p>
          </div>
          <div className="rounded-xl p-4 flex flex-col gap-3"
            style={{ background: cyanA(0.05), border: `1px solid ${cyanA(0.20)}` }}>
            <Label color={cyan}>What you are building now</Label>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              A developer API tool where the database is a Google Sheet. Competing with Airtable API,
              SheetDB, Sheety, NoCodeAPI. Customers: developers, indie hackers, agencies. Price: $19–49/mo.
              Support load: low. Distribution: ProductHunt, HN, r/webdev. Build time: 2–3 weeks.
            </p>
          </div>
        </div>
      </section>

      <Rule />

      {/* Competitive landscape */}
      <section className="flex flex-col gap-4">
        <Label>Who you compete with now</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Every month there are Reddit threads and HN posts asking: &quot;what&apos;s the easiest way to use a
          Google Sheet as a backend?&quot; The current answers are all bad. You slot directly into this gap.
        </p>
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <div className="grid px-4 py-2 text-[10px] font-bold uppercase tracking-wider"
            style={{ gridTemplateColumns: '1.2fr 0.8fr 1fr 1.5fr', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}>
            <span>Product</span><span>Price</span><span>Typed client</span><span>Why it falls short</span>
          </div>
          {[
            { name: 'Airtable API', price: '$24/mo min', typed: '—', gap: 'Not Google Sheets. Forces migration. Vendor lock-in. Price jumps fast.' },
            { name: 'SheetDB', price: '$19/mo', typed: '—', gap: 'No provisioning — you bring your own Sheet. No typed client. No form endpoint.' },
            { name: 'Sheety', price: '$6–20/mo', typed: '—', gap: 'Read-only for most plans. No POST endpoint on free tier. No schema awareness.' },
            { name: 'NoCodeAPI', price: '$9–49/mo', typed: '—', gap: 'Generic, no TypeScript client, no auto-schema, no Drive integration.' },
            { name: 'Roll your own Apps Script', price: '$0', typed: '—', gap: 'Most developers give up at OAuth. No dashboard, no key management, no client.' },
            { name: 'sheetspin (this)', price: '$19–49/mo', typed: '✓ auto-generated', gap: '—' },
          ].map(({ name, price, typed, gap }, i) => {
            const isUs = name.startsWith('sheetspin');
            return (
              <div key={name} className="grid px-4 py-2.5 text-xs"
                style={{
                  gridTemplateColumns: '1.2fr 0.8fr 1fr 1.5fr',
                  borderBottom: i < 5 ? '1px solid var(--color-border)' : 'none',
                  background: isUs ? cyanA(0.06) : (i % 2 === 0 ? 'var(--color-surface)' : 'transparent'),
                }}>
                <span className="font-semibold" style={{ color: isUs ? cyan : 'var(--color-text)' }}>{name}</span>
                <span style={{ color: 'var(--color-muted)' }}>{price}</span>
                <span style={{ color: isUs ? cyan : 'var(--color-subtle)' }}>{typed}</span>
                <span style={{ color: isUs ? 'var(--color-subtle)' : 'var(--color-muted)' }}>{gap}</span>
              </div>
            );
          })}
        </div>
        <Callout color={cyan} colorA={cyanA}>
          <span className="font-semibold" style={{ color: cyan }}>The gap is real and actively searched. </span>
          &quot;Google Sheets API&quot; gets 40k+ searches/month. &quot;Use Google Sheets as database&quot; has dozens of
          tutorials with hundreds of thousands of views. The demand exists. The good solution doesn&apos;t.
        </Callout>
      </section>

      <Rule />

      {/* The product */}
      <section className="flex flex-col gap-4">
        <Label>What the product looks like</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          User connects their Google account, names a project. sheetspin provisions a Sheet + Script in their
          Drive and returns a set of live API endpoints — one per tab — plus an API key and a typed client.
          Adding a tab to the Sheet adds an endpoint. Adding a column updates the TypeScript types.
        </p>
        <Code>{`User creates project "acme-crm"

sheetspin provisions:
  → Google Sheet: "acme-crm — RG Data"
     tab: _config   (project metadata)
     tab: contacts  (name, email, company, status)
     tab: products  (name, price, sku, active)
     tab: orders    (contact_id, product_id, amount, date)
  → Apps Script deployed as web app (user's Drive, user's quota)
  → Gateway entry: api.sheetspin.app/v1/acme-crm → script URL + API key

Live endpoints (immediately):
  GET  /v1/acme-crm/contacts
  GET  /v1/acme-crm/contacts/:id
  POST /v1/acme-crm/contacts
  PUT  /v1/acme-crm/contacts/:id
  GET  /v1/acme-crm/products
  GET  /v1/acme-crm/orders
  POST /v1/acme-crm/orders          ← form endpoint, same infrastructure
  GET  /v1/acme-crm/schema          ← returns column definitions for all tabs

All endpoints:
  → Require API key (x-sheetspin-key header)
  → Rate limited (100 req/min read, 20 req/min write)
  → Cached 5s on read (CacheService in Apps Script)
  → Return typed JSON matching the Sheet's column names exactly`}
        </Code>
        <Code>{`Query params (all read endpoints):
  ?limit=20&offset=0          pagination
  ?filter[status]=active      column filter (any column)
  ?sort=created_at&dir=desc   sort by any column
  ?q=smith                    full-text search across all columns

Response shape:
  {
    data: [...],
    meta: { total, limit, offset, schema: { name: "string", email: "string", ... } }
  }`}
        </Code>
      </section>

      <Rule />

      {/* The typed client — the killer feature */}
      <section className="flex flex-col gap-4">
        <Label>The typed client — the actual moat</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Every other Sheet-as-API product returns untyped JSON. You return a TypeScript client where every
          method is typed to the exact columns in the user&apos;s Sheet. This is the feature nobody ships because
          it requires schema awareness — and schema awareness requires provisioning the Sheet yourself,
          which your competitors don&apos;t do.
        </p>
        <Code>{`// Auto-generated client — published to npm as @sheetspin/client-acme-crm
// Regenerates whenever a column is added/removed in the Sheet

import { createClient } from '@sheetspin/client-acme-crm'

const db = createClient({ key: 'rgf_live_...' })

// Fully typed — IDE autocomplete works on column names
const contacts = await db.contacts.list({ filter: { status: 'active' } })
// contacts: Array<{ name: string; email: string; company: string; status: string }>

const orders = await db.orders.list({ sort: 'date', dir: 'desc', limit: 10 })
// orders: Array<{ contact_id: string; product_id: string; amount: number; date: string }>

await db.contacts.create({ name: 'Jane Smith', email: 'j@acme.com', status: 'lead' })
// TypeScript error if you pass an unknown column or wrong type

await db.orders.get('row_42')
// Single row by ID — typed return

// Schema always matches the Sheet — add a "phone" column in the Sheet,
// the generated types include phone: string on the next client regeneration`}
        </Code>
        <Callout color={cyan} colorA={cyanA}>
          <span className="font-semibold" style={{ color: cyan }}>Why this is defensible: </span>
          Airtable doesn&apos;t ship a typed client. SheetDB doesn&apos;t. Sheety doesn&apos;t. The reason is that generating
          a typed client requires knowing the schema at build time — which requires controlling the provisioning.
          You control the provisioning. The typed client is a direct consequence of the generic column-reading
          architecture already built for v3. The moat is the combination: provisioning + schema extraction +
          client codegen. Any single piece is copyable. All three together take 12–18 months to replicate
          if a competitor starts today.
        </Callout>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Alongside the typed client, the provisioning flow also emits an{' '}
          <strong style={{ color: 'var(--color-text)' }}>OpenAPI 3.0 spec</strong> for the project —
          downloadable from the dashboard. This means the API works immediately with Postman, Insomnia,
          any OpenAPI-aware tool, and can be imported into any API gateway. It&apos;s a one-liner of perceived
          credibility that costs almost nothing to generate.
        </p>
      </section>

      <Rule />

      {/* The gateway */}
      <section className="flex flex-col gap-4">
        <Label>The gateway layer — in the POC</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Unlike the website builder plan, the gateway is not post-POC here — it&apos;s the product.
          Without the gateway, you have no API key auth, no rate limiting, no request logging, no
          <code className="text-xs px-1 rounded font-mono mx-1" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>api.sheetspin.app</code>
          URL. The gateway is what turns the user&apos;s Script URL (ugly, exposable) into a managed API endpoint.
        </p>
        <Code>{`Request path:

  Developer → GET api.sheetspin.app/v1/acme-crm/contacts?filter[status]=active
            → Cloudflare Worker (one deployment, serves ALL projects)

  Worker:
    1. Extract project slug ("acme-crm") from path
    2. KV lookup → { scriptUrl, apiKey, plan, rateLimitTier }
    3. Validate x-sheetspin-key header against stored apiKey → 401 if missing
    4. Rate limit check (Cloudflare built-in) → 429 if exceeded
    5. Translate request → GET {scriptUrl}?tab=contacts&filter[status]=active
    6. Forward to Apps Script, await JSON response
    7. Inject meta (total, schema) if not present
    8. Set Cache-Control: s-maxage=5 on GET responses
    9. Log to KV: { ts, method, tab, status, latency }
   10. Return response to developer

  Security:
    → Script URL never exposed to the API consumer
    → API key stored in KV, rotatable from dashboard without reprovisioning
    → Worker can kill a project's traffic instantly (remove KV entry)
    → Direct hits to the Script URL can be blocked via X-Sheetspin-Token
       (secret header — Worker sets it, Script validates it, rejects direct calls)

  Cost at 1,000 projects:
    Cloudflare Workers Paid:  $5/mo
    KV reads/writes:          ~$1/mo
    Egress:                   $0
    Total:                    ~$6/mo for 1,000 active projects`}
        </Code>
      </section>

      <Rule />

      {/* Two products */}
      <section className="flex flex-col gap-4">
        <Label>Two products, one infrastructure</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          The same Sheet + Script architecture serves two distinct products with different customers,
          different pricing, and different distribution. Build the infrastructure once; sell it twice.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl p-4 flex flex-col gap-3"
            style={{ background: cyanA(0.05), border: `1px solid ${cyanA(0.22)}`, borderTop: `3px solid ${cyan}` }}>
            <div>
              <p className="text-sm font-bold" style={{ color: cyan }}>sheetspin API</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-subtle)' }}>For developers</p>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Instant typed REST API backed by a Google Sheet. Multi-tab, full CRUD, typed client,
              OpenAPI spec, API key auth, rate limiting, request log. The Sheet is the database.
            </p>
            <div className="flex flex-col gap-1 mt-auto">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--color-muted)' }}>Price</span>
                <span className="font-semibold" style={{ color: 'var(--color-text)' }}>$19–49/mo</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--color-muted)' }}>Competes with</span>
                <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Airtable, SheetDB</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--color-muted)' }}>Support load</span>
                <span className="font-semibold" style={{ color: cyan }}>Low — reads docs</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--color-muted)' }}>Distribution</span>
                <span className="font-semibold" style={{ color: 'var(--color-text)' }}>HN, ProductHunt, devs</span>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-4 flex flex-col gap-3"
            style={{ background: amberA(0.05), border: `1px solid ${amberA(0.22)}`, borderTop: `3px solid ${amber}` }}>
            <div>
              <p className="text-sm font-bold" style={{ color: amber }}>sheetspin Forms</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-subtle)' }}>For marketers + site builders</p>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Paste an HTML snippet, get form submissions in a Google Sheet, get an email notification.
              No backend, no server, no code. The form endpoint is a single POST route on the same
              Apps Script infrastructure.
            </p>
            <div className="flex flex-col gap-1 mt-auto">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--color-muted)' }}>Price</span>
                <span className="font-semibold" style={{ color: 'var(--color-text)' }}>$9–19/mo</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--color-muted)' }}>Competes with</span>
                <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Formspree, Getform</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--color-muted)' }}>Support load</span>
                <span className="font-semibold" style={{ color: amber }}>Medium — non-technical</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--color-muted)' }}>Distribution</span>
                <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Dev blogs, tutorials</span>
              </div>
            </div>
          </div>
        </div>
        <Callout color={amber} colorA={amberA}>
          <span className="font-semibold" style={{ color: amber }}>Launch order: </span>
          API first. The Forms product is simpler (it&apos;s just a POST endpoint), lower ARPU, and higher churn.
          The API is harder to build but 3–5x the revenue per customer and much stickier — once a developer
          builds against your API, switching means rewriting their app. Launch the API, use the Forms endpoint
          as a free-tier feature to drive signups.
        </Callout>
      </section>

      <Rule />

      {/* The renderer as demo */}
      <section className="flex flex-col gap-4">
        <Label>The v3 renderer — demo, not product</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          The website renderer from v3 is not abandoned — it&apos;s repositioned. It becomes an open-source
          reference implementation that demonstrates what you can build with the sheetspin API in ~200 lines
          of Next.js. This is more valuable than shipping it as a product.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl p-3 flex flex-col gap-2"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>As a product (v3 plan)</p>
            <Cross items={[
              'You own the design, templates, SEO',
              'Support when the site looks wrong',
              'Compete with Wix on aesthetics',
              'Maintain 6 templates forever',
            ]} />
          </div>
          <div className="rounded-xl p-3 flex flex-col gap-2"
            style={{ background: cyanA(0.04), border: `1px solid ${cyanA(0.18)}` }}>
            <p className="text-xs font-semibold" style={{ color: cyan }}>As a demo (v4 plan)</p>
            <Check items={[
              'Drives API signups ("I want to build this")',
              'Zero support obligation (it\'s example code)',
              'Shows the typed client in real usage',
              'Your friend\'s site is built on top of it',
            ]} />
          </div>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Your friend still gets his website. A developer (you, initially) writes the renderer against
          your own API, deploys to Vercel, points his domain. Later, agencies and freelancers pay $19/mo
          to do the same thing for their clients. The website is the demo. The API is the product.
        </p>
      </section>

      <Rule />

      {/* What you're NOT building */}
      <section className="flex flex-col gap-4">
        <Label>What you are not building — and why that matters</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          The v3 plan had real scope creep hidden inside it. This is what falls off the list entirely
          when you make the API pivot. Every item below was a real week of work that no longer exists.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold" style={{ color: rose }}>Dropped entirely</p>
            <Cross items={[
              'CSS templates and template picker',
              'SEO meta tags and JSON-LD injection',
              'Sitemap.xml generation',
              'Blog listing + slug-based detail view',
              'Custom domain connection',
              'Preview renderer page in sheetspin app',
              'Design opinions of any kind',
            ]} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold" style={{ color: amber }}>Deferred but not dropped</p>
            <Dash items={[
              'Gemini AI provisioning — still valuable, but post-launch',
              'Premium template library — becomes a separate product later',
              'Multiple asset types with Drive subfolders — still the right architecture',
              'Upload UI for Drive assets — still in scope, just not blocking launch',
            ]} />
          </div>
        </div>
      </section>

      <Rule />

      {/* POC scope */}
      <section className="flex flex-col gap-4">
        <Label>POC scope — exactly five things</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          The entire POC is five components. No more. If it&apos;s not in this list, it does not exist yet.
        </p>

        <Step n="1" label="Multi-tab Sheet provisioning" effort="3–4 days" color={cyan} colorA={cyanA}
          detail={
            <div className="flex flex-col gap-2">
              <p>Same core as v3 — one Sheet per project, one Script, tabs per resource. The only addition: the Script exposes
              a generic GET/POST/PUT API instead of a renderer-oriented response. No _config module list, no template field.
              Just: tab name → endpoint.</p>
              <Code>{`Provisioning output:
  Sheet: "my-project — RG Data"  (in user's Drive)
  Script: deployed web app       (in user's Drive, user's quota)
  Dashboard entry: { projectSlug, scriptUrl, apiKey }
  npm package: @sheetspin/client-my-project (auto-generated)`}
              </Code>
            </div>
          }
        />

        <Step n="2" label="Unified Apps Script — generic CRUD" effort="3–4 days" color={cyan} colorA={cyanA}
          detail={
            <div className="flex flex-col gap-2">
              <p>One script template handles all projects. Reads columns generically. Routes by tab name. No hardcoded fields.</p>
              <Code>{`doGet(e)
  ?tab=contacts               → all rows from contacts tab
  ?tab=contacts&id=row_42     → single row
  ?tab=contacts&filter[status]=active&sort=name
  ?tab=schema                 → { contacts: {name:"string", email:"string",...}, ... }
  (5-second CacheService TTL on read endpoints)

doPost(e)
  body: { tab: "contacts", data: { name, email, status } }
  → appends row, returns { id, ...data }
  body: { tab: "orders", _method: "PUT", id: "row_42", data: { status: "shipped" } }
  → updates row

Validation:
  → Unknown tab name → 404
  → Missing required columns (non-empty headers) → 400
  → No X-Sheetspin-Token header → 403 (blocks direct script access)`}
              </Code>
            </div>
          }
        />

        <Step n="3" label="Cloudflare Workers gateway" effort="3–4 days" color={cyan} colorA={cyanA}
          detail={
            <div className="flex flex-col gap-2">
              <p>
                The gateway is the product surface. It owns the URL, the API key, the rate limiting, and the request log.
                The Script URL is never exposed to the API consumer.
              </p>
              <Code>{`api.sheetspin.app/v1/{slug}/{tab}
  → Worker → KV lookup for slug → scriptUrl + apiKey
  → Validate x-sheetspin-key
  → Rate limit (Cloudflare native, no extra cost)
  → Forward to Script with X-Sheetspin-Token
  → Log { ts, method, tab, status, latency } to KV
  → Return response`}
              </Code>
            </div>
          }
        />

        <Step n="4" label="Dashboard — projects, keys, schema, request log" effort="2–3 days" color={cyan} colorA={cyanA}
          detail={
            <p>
              The dashboard is minimal: create project, see endpoints, copy API key, rotate key, view last 100 requests
              (tab, status, latency), see schema (column names + inferred types per tab). No analytics, no billing UI,
              no design work. The schema view is the most important panel — it&apos;s how a developer validates their Sheet
              is set up correctly before writing code.
            </p>
          }
        />

        <Step n="5" label="Auto-generated TypeScript client" effort="3–4 days" color={cyan} colorA={cyanA}
          detail={
            <div className="flex flex-col gap-2">
              <p>
                On every provisioning and every schema change (detected via onEdit → webhook → regeneration), the system
                publishes a new version of the project&apos;s npm package. The client is a thin typed wrapper over fetch —
                no dependencies, ~2kb gzipped.
              </p>
              <Code>{`Package: @sheetspin/client-{slug}
Published to: npm (public, no auth needed to install)
Regeneration trigger: onEdit in Apps Script → POST /api/regenerate-client

Usage:
  npm install @sheetspin/client-my-project

  import { createClient } from '@sheetspin/client-my-project'
  const db = createClient({ key: process.env.SHEETSPIN_KEY })
  const rows = await db.contacts.list()   // typed to Sheet columns`}
              </Code>
            </div>
          }
        />

        <div className="flex flex-col gap-0 rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <Row label="Total build time" value="2–3 weeks" highlight={cyan} />
          <Row label="New backend infrastructure required" value="None" sub="Cloudflare Workers + KV is the only new infra — already on the v3 roadmap" />
          <Row label="Design work required" value="None" sub="No templates, no renderer, no CSS theming" />
          <Row label="Ready to put on ProductHunt" value="After step 5" highlight={cyan} />
        </div>
      </section>

      <Rule />

      {/* Economics */}
      <section className="flex flex-col gap-4">
        <Label>Economics — why the API is a better business</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${roseA(0.25)}` }}>
            <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider"
              style={{ background: roseA(0.08), borderBottom: `1px solid ${roseA(0.20)}`, color: rose }}>
              Website builder ($12/mo)
            </div>
            <div className="flex flex-col">
              <Row label="Monthly revenue at 100 customers" value="$1,200" />
              <Row label="Support emails/customer/month" value="2–3" />
              <Row label="Support time at 100 customers" value="~20 hrs/mo" />
              <Row label="Churn driver" value="'site looks bad'" />
              <Row label="Distribution" value="Cold + SEO (slow)" />
            </div>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${cyanA(0.25)}` }}>
            <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider"
              style={{ background: cyanA(0.08), borderBottom: `1px solid ${cyanA(0.20)}`, color: cyan }}>
              API tool ($29/mo avg)
            </div>
            <div className="flex flex-col">
              <Row label="Monthly revenue at 100 customers" value="$2,900" highlight={cyan} />
              <Row label="Support emails/customer/month" value="0.2–0.5" />
              <Row label="Support time at 100 customers" value="~3 hrs/mo" highlight={cyan} />
              <Row label="Churn driver" value="'built something else'" />
              <Row label="Distribution" value="HN post + ProductHunt (fast)" />
            </div>
          </div>
        </div>
        <Callout color={cyan} colorA={cyanA}>
          <span className="font-semibold" style={{ color: cyan }}>The math on support: </span>
          A small business owner who pays $12/mo emails you when their phone number is wrong, when the
          template changed, when they don&apos;t know how to add a new service. A developer who pays $29/mo reads
          the docs, files a GitHub issue with a repro, and waits. At 100 customers: 20 hours of support/month
          vs 3 hours. That&apos;s 17 hours you get back to build the product, every single month, forever.
        </Callout>
      </section>

      <Rule />

      {/* The Google moat */}
      <section className="flex flex-col gap-4">
        <Label>The moat — why Google specifically</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          The product lives inside Google&apos;s ecosystem and that is not a weakness — it&apos;s the positioning.
          Your competitor can build a Sheet-as-API product. They cannot easily replicate the combination of:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            {
              label: 'Zero data migration',
              body: 'The customer\'s data is already in Google Sheets. Or it\'s easy to put there. No import, no ETL, no new storage bill. The database already exists.',
            },
            {
              label: 'Google hosts the compute',
              body: 'Apps Script runs on Google\'s infrastructure. Your per-customer compute cost at 1,000 projects is $0. No servers to manage. Google\'s SLA.',
            },
            {
              label: 'Google handles the auth',
              body: 'The OAuth dance is done at provisioning. The user never has to think about credentials again. No service accounts, no API keys for the Script — just the user\'s existing Google session.',
            },
            {
              label: 'Typed client from column schema',
              body: 'Because you own provisioning, you know the schema. Because you know the schema, you can generate types. Competitors who don\'t provision can\'t do this.',
            },
            {
              label: 'Drive integration for assets',
              body: 'Asset tabs read directly from Drive. CDN delivery via lh3.googleusercontent.com. Zero egress. No S3, no Cloudflare R2, no upload infrastructure.',
            },
            {
              label: 'Non-technical editor experience',
              body: 'The Sheet IS the CMS. Clients edit their own data without learning a new tool. Every Google Workspace user already knows how. This is the network effect.',
            },
          ].map(({ label, body }) => (
            <div key={label} className="rounded-lg p-3 flex flex-col gap-1.5"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{label}</p>
              <p className="text-xs leading-snug" style={{ color: 'var(--color-muted)' }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <Rule />

      {/* Distribution */}
      <section className="flex flex-col gap-4">
        <Label>Distribution — where developer signups come from</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          You don&apos;t have a distribution channel for small business owners. You do have one for developers —
          you just haven&apos;t used it yet.
        </p>
        <div className="flex flex-col gap-2">
          {[
            {
              channel: 'Hacker News — Show HN',
              detail: '"Show HN: I built a typed REST API from a Google Sheet in 90 seconds." This hits every criteria for a good Show HN: novel, technically interesting, solves a real problem. One good Show HN gets 500–2,000 visitors, 50–200 signups.',
              effort: 'Zero cost',
              color: cyan,
            },
            {
              channel: 'ProductHunt launch',
              detail: '"Instant typed API from Google Sheets — no backend needed." Schedule for a Tuesday. Line up 20 upvotes from genuine users the day before. A top-5 finish gets 1,000+ signups in 24 hours.',
              effort: 'One prep week',
              color: cyan,
            },
            {
              channel: 'r/webdev, r/selfhosted, r/nocode',
              detail: '"I got tired of paying for Airtable so I built a free alternative that runs in your own Google Drive." Not a launch post — a story post. Developers read this subreddit. This gets shared.',
              effort: 'One post',
              color: cyan,
            },
            {
              channel: 'Twitter / X developer community',
              detail: 'Post the typed client code snippet. "Add a column to your Sheet → TypeScript types update automatically." Show the 5-second demo GIF. Developer Twitter shares things that are technically interesting.',
              effort: 'One thread',
              color: cyan,
            },
            {
              channel: 'Dev.to / Hashnode tutorial',
              detail: '"Building a contacts app with Google Sheets as the backend" — a full tutorial that ends with people signing up for the hosted version. Long-tail SEO for "Google Sheets API" searches.',
              effort: '2–3 hours writing',
              color: amber,
            },
          ].map(({ channel, detail, effort, color }) => (
            <div key={channel} className="rounded-lg p-3 flex items-start gap-3"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{channel}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                    style={{ color, background: color === cyan ? cyanA(0.10) : amberA(0.10), border: `1px solid ${color === cyan ? cyanA(0.25) : amberA(0.25)}` }}>
                    {effort}
                  </span>
                </div>
                <p className="text-xs leading-snug mt-1" style={{ color: 'var(--color-muted)' }}>{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Rule />

      {/* First customer path */}
      <section className="flex flex-col gap-4">
        <Label>First customer path — two tracks</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold" style={{ color: cyan }}>Track A — your friend&apos;s site (week 1)</p>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
              {[
                ['Provision', 'Create project "real-estate-wholesale". Gets Sheet + Script + API key.'],
                ['Build renderer', '~200 lines of Next.js consuming the sheetspin API. Deploy to Vercel.'],
                ['Connect domain', 'His domain → Vercel. Done. No custom domain feature needed in sheetspin.'],
                ['He manages content', 'Edits rows in his Sheet. Site updates in 5 seconds.'],
                ['Charge him', '$39/mo for the API access. He pays it — his site actually works.'],
              ].map(([step, detail], i) => (
                <div key={step as string} className="grid px-3 py-2 text-xs"
                  style={{ gridTemplateColumns: '1fr 2fr', borderBottom: i < 4 ? '1px solid var(--color-border)' : 'none', background: i % 2 === 0 ? 'var(--color-surface)' : 'transparent' }}>
                  <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{step}</span>
                  <span style={{ color: 'var(--color-muted)' }}>{detail}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold" style={{ color: amber }}>Track B — developer strangers (week 3+)</p>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
              {[
                ['Show HN', 'Post "Show HN: typed REST API from a Google Sheet." Get 50–200 signups.'],
                ['Free tier', '1 project, 1,000 reads/day, no write API, no typed client. Real usage.'],
                ['Paid conversion', 'After a week of free usage, email: "You hit the read limit 3 times. $19/mo removes it."'],
                ['Expansion', 'Developer builds more projects. $29/mo (3 projects). $49/mo (unlimited).'],
                ['Word of mouth', 'Developer posts about it. Their followers sign up. This is how dev tools grow.'],
              ].map(([step, detail], i) => (
                <div key={step as string} className="grid px-3 py-2 text-xs"
                  style={{ gridTemplateColumns: '1fr 2fr', borderBottom: i < 4 ? '1px solid var(--color-border)' : 'none', background: i % 2 === 0 ? 'var(--color-surface)' : 'transparent' }}>
                  <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{step}</span>
                  <span style={{ color: 'var(--color-muted)' }}>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Rule />

      {/* The one question */}
      <section className="flex flex-col gap-3">
        <Label>The one question this POC answers</Label>
        <div className="rounded-xl p-5 flex flex-col gap-2"
          style={{ background: cyanA(0.07), border: `1px solid ${cyanA(0.30)}` }}>
          <p className="text-base font-bold leading-snug" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
            Will a developer integrate the typed client into a real project — and find the Sheet-as-database
            workflow natural enough to keep paying for?
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            If yes: the API is a product. The typed client is sticky. The Sheet being the database is
            a feature, not a limitation. Developers tell other developers. You have a business.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            If no: you find out in 2–3 weeks with $0 spent on infrastructure. The provisioning, the Script,
            and the gateway are all reusable regardless. Nothing is wasted.
          </p>
          <p className="text-sm font-semibold mt-1" style={{ color: cyan }}>
            Build the five things. Ship it. Watch what developers do with it.
          </p>
        </div>
      </section>

    </article>
  );
}
