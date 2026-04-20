'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Business Plan v5 — The Real Answer
// A provisioning utility + a productized service. Two clean things.
// ─────────────────────────────────────────────────────────────────────────────

const forest = 'oklch(0.55 0.16 155)';
const forestA = (a: number) => `oklch(0.55 0.16 155 / ${a})`;
const sand = 'oklch(0.73 0.10 75)';
const sandA = (a: number) => `oklch(0.73 0.10 75 / ${a})`;
const stone = 'oklch(0.58 0.04 75)';
const stoneA = (a: number) => `oklch(0.58 0.04 75 / ${a})`;

function Rule() {
  return <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />;
}

function Label({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest"
      style={{ color: color ?? 'var(--color-subtle)' }}>
      {children}
    </p>
  );
}

function Pill({ children, color, bg, border }: {
  children: React.ReactNode; color: string; bg: string; border: string;
}) {
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

function Callout({ children, color, colorA }: {
  children: React.ReactNode; color: string; colorA: (a: number) => string;
}) {
  return (
    <div className="rounded-xl p-4 text-sm leading-relaxed"
      style={{ background: colorA(0.07), border: `1px solid ${colorA(0.28)}`, color: 'var(--color-muted)', borderLeft: `3px solid ${color}` }}>
      {children}
    </div>
  );
}

function Row({ label, value, hl, sub }: { label: string; value: string; hl?: string; sub?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5"
      style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div>
        <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{label}</span>
        {sub && <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-subtle)' }}>{sub}</p>}
      </div>
      <span className="text-sm font-semibold text-right shrink-0"
        style={{ color: hl ?? 'var(--color-text)' }}>{value}</span>
    </div>
  );
}

function Check({ items }: { items: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
          <span className="shrink-0 mt-0.5 font-bold" style={{ color: forest }}>✓</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function Drop({ items }: { items: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
          <span className="shrink-0 mt-0.5 font-bold" style={{ color: stoneA(0.9) }}>—</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

export default function FoundationPlan() {
  return (
    <article className="w-full max-w-2xl mx-auto flex flex-col gap-10 pb-20 pt-4">

      {/* Header */}
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Pill color="var(--color-muted)" bg="var(--color-surface-2)" border="var(--color-border)">Internal · Not indexed</Pill>
          <Pill color={forest} bg={forestA(0.10)} border={forestA(0.30)}>v5 — The real answer</Pill>
        </div>
        <h1 className="text-3xl font-bold tracking-tight"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
          Two clean things.
        </h1>
        <p className="text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          A provisioning utility that sets up Google infrastructure for a customer and gets out of the way.
          A service business that builds custom sites on top of it.
          Not a SaaS. Not a platform. Two clean, honest things.
        </p>
      </header>

      <Rule />

      {/* What this actually is */}
      <section className="flex flex-col gap-4">
        <Label>What this actually is</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl p-4 flex flex-col gap-3"
            style={{ background: forestA(0.06), border: `1px solid ${forestA(0.22)}`, borderTop: `3px solid ${forest}` }}>
            <p className="text-xs font-bold" style={{ color: forest }}>Thing 1 — sheetspin (the tool)</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              A provisioning utility. Customer signs in with Google (one session, no refresh token stored),
              describes their project, AI proposes a structure, they confirm, sheetspin creates everything
              in their Drive. Hands them a manifest JSON. Forgets them immediately.
            </p>
            <p className="text-xs" style={{ color: stone }}>
              Free or one-time fee. Not a subscription. Not a platform.
            </p>
          </div>
          <div className="rounded-xl p-4 flex flex-col gap-3"
            style={{ background: sandA(0.10), border: `1px solid ${sandA(0.35)}`, borderTop: `3px solid ${sand}` }}>
            <p className="text-xs font-bold" style={{ color: sand }}>Thing 2 — the service</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Custom small-business websites built on top of the provisioned infrastructure.
              You take the manifest, build a custom Next.js site, deploy to Vercel, connect their domain.
              Customer manages their content via the Sheet you provisioned into their Drive.
            </p>
            <p className="text-xs" style={{ color: stone }}>
              $800 setup + $49/mo. Your time + your craft. Real money now.
            </p>
          </div>
        </div>
        <Callout color={forest} colorA={forestA}>
          <span className="font-semibold" style={{ color: forest }}>The separation is the insight. </span>
          sheetspin doesn&apos;t need customers — it&apos;s a tool. The service business has customers —
          they&apos;re the people you already know. The tool makes the service fast and honest.
          The service pays the bills. Neither one needs to be the other thing.
        </Callout>
      </section>

      <Rule />

      {/* The manifest */}
      <section className="flex flex-col gap-4">
        <Label>The manifest — the central artifact</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Provisioning produces one output: a JSON manifest describing everything that was created.
          The customer downloads it. You use it to build their site. sheetspin stores nothing — the manifest
          is the complete record, and it lives with the customer, not with you.
        </p>
        <Code>{`// acme-hardware.sheetspin.json
{
  "project_slug": "acme-hardware",
  "created_at": "2026-04-20T14:22:10Z",
  "google_account": "owner@acmehardware.com",
  "script_url": "https://script.google.com/macros/s/AKfy.../exec",
  "script_token": "ss_xxxxxxxx",   // X-Sheetspin-Token — blocks direct hits
  "sheet_id": "1AbCdEfGhIjKlMnOpQrSt",
  "sheet_url": "https://docs.google.com/spreadsheets/d/1AbC.../edit",
  "drive_root_folder_id": "0B9zXyZAbCdEfGhIjKl",
  "tabs": [
    {
      "name": "info",
      "type": "key_value",
      "fields": [
        { "key": "phone",         "label": "Phone number" },
        { "key": "email",         "label": "Email" },
        { "key": "hours_weekday", "label": "Weekday hours" },
        { "key": "hours_weekend", "label": "Weekend hours" },
        { "key": "address",       "label": "Street address" },
        { "key": "tagline",       "label": "Tagline" }
      ]
    },
    {
      "name": "services",
      "type": "rows",
      "columns": ["title", "description", "price", "slug"]
    },
    {
      "name": "testimonials",
      "type": "rows",
      "columns": ["name", "quote", "rating", "date"]
    },
    {
      "name": "gallery",
      "type": "asset",
      "drive_folder_id": "0B9zXyZ.../gallery",
      "columns": ["caption", "category"]
    },
    {
      "name": "contact_form",
      "type": "form",
      "fields": ["name", "email", "phone", "message"],
      "required": ["name", "email", "message"],
      "notification_email": "owner@acmehardware.com"
    }
  ]
}`}
        </Code>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          A copy of the manifest is also written into the Sheet itself (as a <code className="text-xs px-1 rounded font-mono"
            style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>_manifest</code> tab)
          and saved as a JSON file in the root Drive folder. The customer can&apos;t lose it — even if they
          lose the download, it&apos;s recoverable from their own Drive.
        </p>
      </section>

      <Rule />

      {/* AI provisioning */}
      <section className="flex flex-col gap-4">
        <Label>AI provisioning — how the manifest gets proposed</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Non-technical customers can&apos;t design a tab/column schema. They can describe their business
          in one sentence. AI bridges the gap — it proposes a complete manifest from the description,
          the customer reviews and edits it, and provisioning runs against the approved version.
        </p>
        <div className="flex flex-col gap-2">
          {[
            {
              step: '1',
              label: 'Sign in with Google',
              detail: 'Customer grants provisioning scopes. Session only — no refresh token stored. This is the only time sheetspin has access to their Google account.',
            },
            {
              step: '2',
              label: 'Describe the business',
              detail: '"I run a kosher catering company in Monsey. We do weddings, bar mitzvahs, and corporate events. We have a menu and photos from past events."',
            },
            {
              step: '3',
              label: 'AI proposes a manifest',
              detail: 'Gemini Flash (or Claude Haiku — ~$0.002/call) reads the description and generates the full tab structure: tab names, column lists, form fields, asset folder names, key-value fields for the info tab. Contextually aware — a caterer gets a menu tab, a contractor gets a projects tab.',
            },
            {
              step: '4',
              label: 'Customer reviews and edits',
              detail: 'Each proposed tab is shown as a card. Customer can rename tabs, add/remove columns, toggle a tab off, change form fields. This is the only UI they interact with in sheetspin.',
            },
            {
              step: '5',
              label: 'Confirm and provision (90 seconds)',
              detail: 'sheetspin creates: Sheet with correct tabs and column headers + seed rows, Drive root folder, per-tab Drive subfolders for asset tabs, Apps Script deployed as web app (running as the customer). All in their Google Drive.',
            },
            {
              step: '6',
              label: 'Download manifest — done',
              detail: 'One download button. One JSON file. Optionally: "Email this to your developer." sheetspin session ends. No record kept. The manifest is the complete handoff document.',
            },
          ].map(({ step, label, detail }) => (
            <div key={step} className="flex items-start gap-3 rounded-lg p-3"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5"
                style={{ background: forest, color: '#fff', fontFamily: 'var(--font-display)' }}>
                {step}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{label}</p>
                <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--color-muted)' }}>{detail}</p>
              </div>
            </div>
          ))}
        </div>
        <Callout color={sand} colorA={sandA}>
          <span className="font-semibold" style={{ color: sand }}>Why AI fits here specifically: </span>
          Every previous plan used AI to seed content (blog posts, service descriptions). That&apos;s not the
          bottleneck. The bottleneck is the customer having to design their own data schema. Nobody wants to
          think about tab names and column types. AI handles that; the customer just confirms it makes sense.
          The manifest review screen is a confirmation dialog, not a data design session.
        </Callout>
      </section>

      <Rule />

      {/* Architecture */}
      <section className="flex flex-col gap-4">
        <Label>Architecture — one Sheet, flexible tabs</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          One Sheet per project. Tabs are whatever the business needs — not a fixed set.
          The Apps Script is the same code across every customer; only the Sheet content differs.
        </p>
        <Code>{`Per-customer infrastructure (all in their Google Drive):

  Sheet: "Acme Hardware — Website Data"
    info          key-value: phone, email, hours, address, tagline
    services      rows: title, description, price, slug
    testimonials  rows: name, quote, rating, date
    gallery       asset-backed (reads from gallery/ Drive subfolder)
    contact_form  form: name, email, phone, message  (submissions append here)
    _manifest     the provisioning manifest — recoverable from Drive

  Script: deployed as web app, running as the customer
    → GET  ?tab=info         returns key-value object
    → GET  ?tab=services     returns array of row objects
    → GET  ?tab=gallery      reads gallery/ Drive subfolder, returns file list
    → POST body:{tab,fields} appends to form tab, sends email via MailApp
    Script is identical across all customers — copy-paste on provision.

  Drive root folder: "Acme Hardware — Assets"
    gallery/           subfolder for gallery tab
    (any asset tabs get their own subfolder here)

  Nothing in your infrastructure. Nothing in your database.
  The customer owns all of it outright.`}
        </Code>

        <p className="text-sm font-semibold mt-1" style={{ color: 'var(--color-text)' }}>Tab types</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            {
              type: 'key_value',
              label: 'Key-value',
              desc: 'Two columns: key and value. One row per field. Used for info — phone, hours, address, tagline. Customer edits values; keys never change.',
              example: 'phone | (845) 555-1234\nhours | Mon–Fri 8am–6pm',
            },
            {
              type: 'rows',
              label: 'Row-based',
              desc: 'Standard spreadsheet rows. First row is column headers. Each subsequent row is one record. Customer adds rows to add content.',
              example: 'title | price | slug\nKey cutting | $5 | key-cutting',
            },
            {
              type: 'form',
              label: 'Form',
              desc: 'Submissions append here via doPost. Script also sends email notification to the owner via MailApp. No OAuth scope needed — MailApp runs inside their account.',
              example: 'submitted_at | name | email | message\n2026-04-20 | Jane | … | …',
            },
          ].map(({ type, label, desc, example }) => (
            <div key={type} className="rounded-lg p-3 flex flex-col gap-2"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderTop: `2px solid ${forest}` }}>
              <p className="text-xs font-bold" style={{ color: forest }}>{label}</p>
              <p className="text-xs leading-snug" style={{ color: 'var(--color-muted)' }}>{desc}</p>
              <pre className="text-[10px] font-mono rounded p-1.5 leading-relaxed overflow-x-auto"
                style={{ background: 'var(--color-surface-2)', color: 'var(--color-subtle)', border: '1px solid var(--color-border)' }}>
                {example}
              </pre>
            </div>
          ))}
        </div>

        {/* Asset tab — full width */}
        <div className="rounded-lg p-3 flex flex-col gap-2"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderTop: `2px solid ${sand}` }}>
          <p className="text-xs font-bold" style={{ color: sand }}>Asset tab</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <p className="text-xs leading-snug" style={{ color: 'var(--color-muted)' }}>
              Not a Sheet data tab — backed by a Drive subfolder. When
              <code className="mx-1 text-[10px] px-1 rounded font-mono"
                style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>
                doGet?tab=gallery
              </code>
              is called, the Script reads the <code className="text-[10px] px-1 rounded font-mono"
                style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>gallery/</code> subfolder
              via <code className="text-[10px] px-1 rounded font-mono"
                style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>DriveApp.getFolderById()</code> and
              returns the file list as JSON. Files are served via Google&apos;s CDN
              (<code className="text-[10px] px-1 rounded font-mono"
                style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>lh3.googleusercontent.com/d/{'{fileId}'}</code>).
              Zero egress cost.
            </p>
            <p className="text-xs leading-snug" style={{ color: 'var(--color-muted)' }}>
              To add photos, the customer opens their Drive folder bookmark (handed to them at onboarding)
              and uploads directly. The sheetspin dashboard also provides an upload panel for the session —
              file picker that writes to the correct subfolder via the Drive API, using the same OAuth
              access granted at provisioning. No separate auth.
            </p>
          </div>
        </div>

        <Callout color={forest} colorA={forestA}>
          <span className="font-semibold" style={{ color: forest }}>The rule for what goes in a tab: </span>
          Will the customer want to edit this more than once a year? If yes, it&apos;s a tab.
          If no, it&apos;s hardcoded in the Next.js template. Their tagline probably never changes — put it in
          info anyway (cheap). Their &quot;About Us&quot; story definitely never changes — hardcode it.
          The Sheet holds what&apos;s dynamic. The template holds what&apos;s permanent.
        </Callout>
      </section>

      <Rule />

      {/* OAuth */}
      <section className="flex flex-col gap-4">
        <Label>OAuth — minimal scopes, no stored tokens</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          The entire philosophy of this architecture is that the data is the customer&apos;s, not yours.
          The OAuth model follows the same logic.
        </p>
        <div className="flex flex-col gap-0 rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <Row label="spreadsheets" value="Create and write the Sheet"
            sub="Used once at provision time. Not needed after." />
          <Row label="drive.file" value="Create the Drive folder + subfolders"
            sub="Scoped to files created by sheetspin — cannot read pre-existing Drive files." />
          <Row label="script.projects" value="Create the Apps Script project and paste code"
            sub="Used once at provision time." />
          <Row label="script.deployments" value="Deploy the Script as a web app"
            sub="Used once at provision time." />
          <Row label="Gmail / MailApp" value="Not needed" hl={forest}
            sub="Form notifications use MailApp inside the Script — runs as the customer, no extra OAuth scope." />
          <Row label="Refresh token stored" value="Never" hl={forest}
            sub="Session only. After provisioning completes, sheetspin has no ongoing access." />
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Four scopes, one session, zero stored tokens. The Script&apos;s own authorization — granted separately
          by the customer when they click through the deployment prompt — persists independently.
          The site keeps working forever even if the customer revokes their sheetspin OAuth access,
          because the Script runs under its own authorization inside their account.
        </p>
        <Callout color={sand} colorA={sandA}>
          <span className="font-semibold" style={{ color: sand }}>What you tell customers: </span>
          &quot;We don&apos;t store your Google password, your email, your other files, or your identity.
          We connect to your account for the 90 seconds it takes to set up your Sheet, Script, and Drive folder.
          After that, everything runs inside your Google account. We&apos;re not in the loop.&quot;
          That&apos;s a real trust differentiator and worth saying out loud.
        </Callout>
      </section>

      <Rule />

      {/* The Apps Script */}
      <section className="flex flex-col gap-4">
        <Label>The Apps Script — simple, shared, generic</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          The same ~50-line script gets deployed into every customer&apos;s project. No hardcoded tab names,
          no hardcoded columns. It reads whatever tabs and columns exist. You never update it per customer.
        </p>
        <Code>{`doGet(e)
  tab = e.parameter.tab
  sheet = SpreadsheetApp.getActive().getSheetByName(tab)

  // For asset tabs: read from Drive folder stored in manifest
  if (tab is asset type):
    folder = DriveApp.getFolderById(manifest[tab].drive_folder_id)
    → return file list as JSON

  // For key-value tabs:
  if (tab is key_value type):
    rows = sheet.getDataRange().getValues()
    → return Object.fromEntries(rows.map([k,v] => [k,v]))

  // For row-based tabs:
  rows = sheet.getDataRange().getValues()
  headers = rows[0]
  → return rows.slice(1).map(row =>
      Object.fromEntries(headers.map((h, i) => [h, row[i]]))
    )

doPost(e)
  body = JSON.parse(e.postData.contents)
  sheet = SpreadsheetApp.getActive().getSheetByName(body.tab)
  → append [new Date(), ...body.fields values] as row
  → MailApp.sendEmail(owner_email, "New form submission", body.fields)
  → return { success: true }

Security check (every request):
  if (e.parameter.token !== CONFIG.script_token) → return 403
  (CONFIG is the _manifest tab — blocks direct Script URL hits)`}
        </Code>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          The Script reads tab type metadata from the <code className="text-xs px-1 rounded font-mono"
            style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>_manifest</code> tab
          (written during provisioning). No external config, no dashboard calls, no API keys.
          The whole thing is self-contained inside the customer&apos;s Google account.
        </p>
      </section>

      <Rule />

      {/* Building the site */}
      <section className="flex flex-col gap-4">
        <Label>Building the site — your job, not the product&apos;s</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          The provisioning is the utility. The site is your craft. Each customer gets a custom Next.js
          site built against their specific manifest. Not a template system — actual design work,
          fetching from their specific tabs.
        </p>
        <Code>{`// How you use the manifest in the Next.js site
// This is YOUR code, not sheetspin — one file per customer

const MANIFEST = require('./acme-hardware.sheetspin.json')
const BASE = MANIFEST.script_url
const TOKEN = process.env.SHEETSPIN_TOKEN  // the script_token, never public

async function fetchTab(tab: string) {
  const res = await fetch(\`\${BASE}?tab=\${tab}&token=\${TOKEN}\`)
  return res.json()
}

// In getStaticProps / generateStaticParams:
export async function getStaticProps() {
  const [info, services, testimonials, gallery] = await Promise.all([
    fetchTab('info'),
    fetchTab('services'),
    fetchTab('testimonials'),
    fetchTab('gallery'),
  ])
  return { props: { info, services, testimonials, gallery }, revalidate: 300 }
}

// Contact form POST — from a Server Action:
async function submitForm(formData: FormData) {
  await fetch(BASE, {
    method: 'POST',
    body: JSON.stringify({
      tab: 'contact_form',
      token: TOKEN,
      fields: { name, email, message }
    })
  })
}`}
        </Code>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          The fetch calls are 20 lines. The site itself is custom — real design, right fonts, right images,
          right copy for this specific business. The value you deliver isn&apos;t the template; it&apos;s the judgment
          about what a hardware store&apos;s site should look like vs. what a catering company&apos;s should.
          That judgment is what the $800 pays for.
        </p>
        <Callout color={forest} colorA={forestA}>
          <span className="font-semibold" style={{ color: forest }}>The AI skill changes the economics here: </span>
          With the frontend-dev-skill build system, the custom Next.js site goes from a 2-day build to a
          4-6 hour build. That&apos;s not a marginal improvement — it&apos;s the difference between a service that costs
          you time and one that earns you $150–200/hr effectively. The manifest is machine-readable context
          the skill uses to scaffold the right component structure from day one. The customer gets a custom
          site. You spend half a day on it.
        </Callout>
      </section>

      <Rule />

      {/* Business model */}
      <section className="flex flex-col gap-4">
        <Label>Business model — what actually makes money</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${forestA(0.25)}` }}>
            <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider"
              style={{ background: forestA(0.08), borderBottom: `1px solid ${forestA(0.20)}`, color: forest }}>
              Setup fee — per site
            </div>
            <div className="flex flex-col">
              <Row label="First 1–3 customers" value="$500–800" />
              <Row label="After you have a proven process" value="$800–1,500" />
              <Row label="With the AI skill compressing build time" value="~4–6 hrs work" />
              <Row label="Effective hourly rate" value="$130–250/hr" hl={forest} />
            </div>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${sandA(0.40)}` }}>
            <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider"
              style={{ background: sandA(0.12), borderBottom: `1px solid ${sandA(0.35)}`, color: sand }}>
              Monthly fee — per site
            </div>
            <div className="flex flex-col">
              <Row label="Hosting on your Vercel account" value="$49/mo" />
              <Row label="What it includes" value="Vercel + 'text me for changes'" />
              <Row label="Your actual Vercel cost per site" value="~$0–2/mo" />
              <Row label="MRR at 10 sites" value="$490/mo" hl={forest} />
              <Row label="MRR at 25 sites" value="$1,225/mo" hl={forest} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-0 rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <Row label="Banked after 5 sites at $800 setup" value="$4,000 lump sum" hl={forest} />
          <Row label="Monthly recurring after 10 sites" value="$490/mo" hl={forest} />
          <Row label="Monthly recurring after 25 sites" value="$1,225/mo" hl={forest}
            sub="This is when you genuinely have reason to abstract the infrastructure into a real product." />
          <Row label="Support time per customer per month" value="~15 min average"
            sub="Community customers text you. They're not strangers. Churn is near-zero." />
        </div>
      </section>

      <Rule />

      {/* What to build */}
      <section className="flex flex-col gap-4">
        <Label>What to actually build</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          The entire build scope. If it&apos;s not here, it doesn&apos;t exist yet. In rough order.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold" style={{ color: forest }}>Build this</p>
            <Check items={[
              'Google OAuth flow — session-only, no refresh token stored',
              'AI manifest proposal (Gemini Flash) — one-sentence description → full tab structure',
              'Manifest review UI — customer edits proposed tabs/columns before confirming',
              'Provisioning backend — creates Sheet, Drive folder, deploys Script using session token',
              'Asset upload panel — file picker during session, uploads to correct Drive subfolder',
              'Manifest download + email — JSON file, copy to _manifest tab and Drive folder',
              'Apps Script template — generic doGet/doPost, reads _manifest for tab type metadata',
              'Next.js starter — fetchTab() helpers, revalidation, contact form Server Action',
              'Delivery playbook — your personal checklist from manifest to live site',
            ]} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold" style={{ color: stone }}>Don&apos;t build this yet</p>
            <Drop items={[
              'User accounts / login system (no stored users)',
              'Customer dashboard (their Sheet IS the dashboard)',
              'Template system (each site is custom)',
              'Typed client / npm package (that\'s v4 territory)',
              'Cloudflare Workers gateway (script runs server-side only)',
              'Stripe billing in sheetspin (invoice separately or use Stripe links)',
              'Renderer / preview page (customer\'s site is the preview)',
              'Module registry / _config tab (that\'s v3 territory)',
              'SEO system / sitemap / JSON-LD (hardcoded in each Next.js site)',
            ]} />
          </div>
        </div>
      </section>

      <Rule />

      {/* First customer */}
      <section className="flex flex-col gap-4">
        <Label>First customer — this week</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Your friend&apos;s real estate wholesale business. The concrete steps, no hypotheticals.
        </p>
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <div className="grid px-4 py-2 text-[10px] font-bold uppercase tracking-wider"
            style={{ gridTemplateColumns: '1fr 3fr', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}>
            <span>When</span><span>What</span>
          </div>
          {[
            ['This week', 'Call him. Tell him you\'re building a new version of his site that he can update himself. Offer it at $800 now, $49/mo after. He says yes.'],
            ['Next 20 min', 'He signs in to sheetspin.app. AI proposes: info, services, testimonials, gallery, contact_form. He confirms. Manifest downloads.'],
            ['That same session', 'He adds his photos to the gallery Drive folder. Done — he\'s set up.'],
            ['Next 4–6 hours (you)', 'Build the custom Next.js site from the manifest. Use the frontend-dev-skill. Real estate, real design, real copy.'],
            ['Day 2', 'Deploy to Vercel. Point his domain. Walk him through his Sheet — show him how to change his phone number. Send him the Drive folder bookmark.'],
            ['Day 3', 'Invoice $800. Set up $49/mo Stripe link. Done.'],
            ['Week 2', 'Text three people in your community. Same offer. Same process.'],
          ].map(([when, what], i) => (
            <div key={when as string} className="grid px-4 py-2.5 text-xs"
              style={{ gridTemplateColumns: '1fr 3fr', borderBottom: i < 6 ? '1px solid var(--color-border)' : 'none', background: i % 2 === 0 ? 'var(--color-surface)' : 'transparent' }}>
              <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{when}</span>
              <span style={{ color: 'var(--color-muted)' }}>{what}</span>
            </div>
          ))}
        </div>
      </section>

      <Rule />

      {/* When to build more */}
      <section className="flex flex-col gap-4">
        <Label>When to build more — the right triggers</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          The v3/v4 features aren&apos;t wrong — they&apos;re just early. Here&apos;s when each one actually earns its build time:
        </p>
        <div className="flex flex-col gap-2">
          {[
            {
              trigger: 'After 5 sites',
              build: 'Extract your Next.js starter into a reusable template. You\'ve now copy-pasted the same scaffolding 5 times — abstract it.',
              color: forest,
            },
            {
              trigger: 'After 10 sites',
              build: 'Automate provisioning end-to-end. You\'ve done the manual checklist 10 times — you know exactly what the script should do.',
              color: forest,
            },
            {
              trigger: 'After 15 sites',
              build: 'Add a Cloudflare Workers gateway with API key auth. You\'ll have real traffic and real reason to not expose Script URLs.',
              color: sand,
            },
            {
              trigger: 'After 20 sites',
              build: 'Build the v4 typed client. You\'ll have developers asking to integrate with your customer sites — give them a proper API.',
              color: sand,
            },
            {
              trigger: 'When customers ask for it specifically',
              build: 'A template library (v3). A visual dashboard. Billing inside sheetspin. None of these exist unless customers are blocked without them.',
              color: stone,
            },
          ].map(({ trigger, build, color }) => (
            <div key={trigger} className="rounded-lg p-3 flex flex-col gap-1.5"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderLeft: `3px solid ${color}` }}>
              <p className="text-xs font-semibold" style={{ color }}>{trigger}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{build}</p>
            </div>
          ))}
        </div>
        <Callout color={forest} colorA={forestA}>
          <span className="font-semibold" style={{ color: forest }}>The abstraction follows the repetition. </span>
          At 20 customers with $980/mo MRR and $16k in setup fees banked, you&apos;ll have: concrete knowledge
          of which 6 fields every small business edits, which industries need which tabs, which Next.js
          patterns you reuse every time, and a real financial reason to invest build time in the platform.
          None of that exists at customer zero. Build when the pattern demands it, not before.
        </Callout>
      </section>

      <Rule />

      {/* The one thing */}
      <section className="flex flex-col gap-3">
        <Label>The one thing</Label>
        <div className="rounded-xl p-5 flex flex-col gap-2"
          style={{ background: forestA(0.07), border: `1px solid ${forestA(0.28)}` }}>
          <p className="text-base font-bold leading-snug"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
            Text your friend. This week. Not after you finish building.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            The architecture is right. The scope is right. The economics work. The only remaining question
            is whether you start or keep planning. Four conversations have produced four increasingly
            correct plans. The fifth one is this. The sixth one doesn&apos;t exist — there&apos;s nothing left to design.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            You provision his project in 90 seconds. You build his site in a day. You charge him $800.
            He manages his phone number from a bookmark on his phone. You text three more people.
            That&apos;s the business.
          </p>
          <p className="text-sm font-semibold mt-1" style={{ color: forest }}>
            Go text the three people.
          </p>
        </div>
      </section>

    </article>
  );
}
