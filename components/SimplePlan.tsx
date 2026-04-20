'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Business Plan v3 — Simple, realistic POC
// The whole thing on one page. No tabs, no sidebar.
// ─────────────────────────────────────────────────────────────────────────────

const green = 'oklch(0.72 0.18 145)';
const greenA = (a: number) => `oklch(0.72 0.18 145 / ${a})`;
const amber = 'oklch(0.73 0.17 65)';
const amberA = (a: number) => `oklch(0.73 0.17 65 / ${a})`;
const violet = 'oklch(0.63 0.24 295)';
const violetA = (a: number) => `oklch(0.63 0.24 295 / ${a})`;

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

function Pill({ children, color, bg, border }: { children: React.ReactNode; color: string; bg: string; border: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
      style={{ color, background: bg, border: `1px solid ${border}` }}>
      {children}
    </span>
  );
}

function Block({ children, color }: { children: React.ReactNode; color?: string }) {
  const c = color ?? amberA(0.30);
  const bg = color ? `${color.slice(0, -1)} / 0.06)`.replace('oklch(', 'oklch(') : amberA(0.06);
  return (
    <div className="rounded-xl p-4 text-sm leading-relaxed"
      style={{ background: amberA(0.06), border: `1px solid ${amberA(0.30)}`, color: 'var(--color-muted)', borderLeft: `3px solid ${amber}` }}>
      {children}
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4 text-sm leading-relaxed"
      style={{ background: violetA(0.06), border: `1px solid ${violetA(0.25)}`, color: 'var(--color-muted)', borderLeft: `3px solid ${violet}` }}>
      {children}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{label}</span>
      <span className="text-sm font-semibold text-right" style={{ color: highlight ? green : 'var(--color-text)' }}>{value}</span>
    </div>
  );
}

function Check({ items }: { items: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
          <span className="shrink-0 mt-0.5 font-bold" style={{ color: green }}>✓</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function X({ items }: { items: string[] }) {
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

function Code({ children }: { children: string }) {
  return (
    <pre className="rounded-lg p-3 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre"
      style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
      {children}
    </pre>
  );
}

export default function SimplePlan() {
  return (
    <article className="w-full max-w-2xl mx-auto flex flex-col gap-10 pb-20 pt-4">

      {/* Header */}
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Pill color="var(--color-muted)" bg="var(--color-surface-2)" border="var(--color-border)">Internal · Not indexed</Pill>
          <Pill color={green} bg={greenA(0.10)} border={greenA(0.30)}>v3 — Start here</Pill>
        </div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
          The Simple Plan
        </h1>
        <p className="text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          One organized Sheet. One Script. One renderer. A working website in 90 seconds.
          This is the proof of concept — everything else comes after this works.
        </p>
      </header>

      <Rule />

      {/* What changes */}
      <section className="flex flex-col gap-4">
        <Label>What changes in provisioning</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Right now rgforms provisions each module separately — a form gets its own Sheet + Script, a content
          module gets its own Sheet + Script. The POC changes one thing: instead of one Sheet per module,
          provision <strong style={{ color: 'var(--color-text)' }}>one Sheet per project</strong> with a tab for each module.
          One Script reads all the tabs and routes by name.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl p-4 flex flex-col gap-3"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <Label color={amber}>Today — one Sheet per module</Label>
            <Code>{`Project "Acme Wholesale"
  /form-module     → Sheet A + Script A
  /content-module  → Sheet B + Script B
  /gallery-module  → Sheet C + Script C

  3 separate Sheets
  3 separate Scripts
  3 separate URLs`}
            </Code>
          </div>
          <div className="rounded-xl p-4 flex flex-col gap-3"
            style={{ background: greenA(0.05), border: `1px solid ${greenA(0.22)}` }}>
            <Label color={green}>POC — one Sheet, all tabs</Label>
            <Code>{`Project "Acme Wholesale"
  /project-sheet
    tab: _config       ← site name, template, module list
    tab: hero          ← headline, subtitle, cta
    tab: services      ← title, description, price
    tab: testimonials  ← name, quote, rating
    tab: gallery       ← image_url, caption, category
    tab: contact_form  ← submissions append here
  1 Script, 1 URL`}
            </Code>
          </div>
        </div>
      </section>

      <Rule />

      {/* Dynamic modules */}
      <section className="flex flex-col gap-4">
        <Label>Adding + updating modules after provisioning</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          The <code className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>_config</code> tab
          acts as a live module registry — a <code className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>modules</code> row
          that lists which tabs are active and in what order. The Script reads this list at runtime.
          The renderer renders whatever is in it. Adding a module is a single dashboard action.
        </p>

        <Code>{`_config tab (the module registry):

  key         | value
  site_name   | Acme Wholesale
  template    | professional
  modules     | hero,services,testimonials,gallery,contact_form
              ↑ the renderer renders sections in this exact order

To add a "blog" module later:
  1. User clicks "Add module → Blog" in the rgforms dashboard
  2. rgforms calls addTab("blog") on the existing Script
     → creates the tab with correct column headers
     → appends "blog" to the modules row in _config
  3. Renderer sees blog in the list → renders the blog section
  4. User adds/edits rows in the blog tab → site updates live

No reprovisioning. No new Script URL. Same Sheet, new tab.`}
        </Code>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              action: 'Update content',
              how: 'Edit a row in any tab. onEdit fires, cache clears, site reflects it within 5 seconds.',
              works: true,
            },
            {
              action: 'Add a module',
              how: '"Add module" in dashboard → tab created + _config.modules updated. No new Script deploy.',
              works: true,
            },
            {
              action: 'Add a form',
              how: 'Same as adding a module. Each form type (contact, booking, quote) is just a tab the Script routes doPost to.',
              works: true,
            },
            {
              action: 'Add a custom field',
              how: 'Add a column to the tab in the Sheet. The Script reads all columns generically as key-value pairs. Renderer shows known fields, ignores unknown ones.',
              works: true,
            },
            {
              action: 'Remove a module',
              how: 'Remove its name from _config.modules. Tab stays in the Sheet (data preserved) but renderer skips it.',
              works: true,
            },
            {
              action: 'Reorder sections',
              how: 'Edit the order of names in _config.modules. Renderer re-renders in the new order immediately.',
              works: true,
            },
          ].map(({ action, how, works }) => (
            <div key={action} className="rounded-lg p-3 flex flex-col gap-1.5"
              style={{ background: works ? greenA(0.05) : 'var(--color-surface)', border: `1px solid ${works ? greenA(0.20) : 'var(--color-border)'}` }}>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold" style={{ color: works ? green : amber }}>
                  {works ? '✓' : '—'}
                </span>
                <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{action}</p>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{how}</p>
            </div>
          ))}
        </div>

        <Note>
          <span className="font-semibold" style={{ color: violet }}>The one thing to design right from the start: </span>
          The Script must read tab columns generically — not hardcoded field names. Each row becomes a plain
          object with whatever keys the columns define. This means a user can add a{' '}
          <code className="text-xs px-1 rounded font-mono" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>phone</code> column
          to their services tab without touching any code — it just shows up as an extra field.
          Templates decide which fields to feature prominently and which to display as secondary info.
        </Note>
      </section>

      <Rule />

      {/* The Script */}
      <section className="flex flex-col gap-4">
        <Label>The Apps Script — what it does</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          One script, two endpoints, fully dynamic. The Script never has a hardcoded list of tabs —
          it reads whatever tabs exist and routes by name.
        </p>
        <Code>{`doGet(e)
  ?tab=services    → returns JSON array of rows from "services" tab
                     (columns read generically — any field works)
  ?tab=all         → reads _config.modules list → fetches each tab
                     → returns { config, hero, services, ... }
                     (only the active modules, in config order)
  (CacheService, 5-min TTL per tab — fast repeat fetches)

doPost(e)
  body: { tab: "contact_form", fields: { name, email, message } }
  → appends row to whichever tab is named in "tab"
  → sends email notification to site owner
  (works for any form tab — contact, booking, quote, intake, etc.)

addTab(tabName)   ← called by rgforms dashboard "Add module" button
  → inserts a new tab with the standard column headers for that module type
  → appends tabName to _config.modules row

onEdit(e)
  → clears cache for the edited tab
  → site reflects changes in under 5 seconds`}
        </Code>
        <Note>
          <span className="font-semibold" style={{ color: violet }}>Why this is still free to run: </span>
          Apps Script free quota is 6 minutes of compute/day. A site with 1,000 page views/day
          uses roughly 20-30 seconds. Google hosts it, Google stores the Sheet, Google sends the emails.
          Your infrastructure cost for a live site: $0.00/month until you need the gateway features.
        </Note>
      </section>

      <Rule />

      {/* The renderer */}
      <section className="flex flex-col gap-4">
        <Label>The renderer — viewing the Sheet as a website</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          A new page in rgforms at <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>/preview</code>.
          It takes a Script URL, fetches all tabs, and renders the site using the template stored in the{' '}
          <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>_config</code> tab.
          That&apos;s the whole product.
        </p>
        <div className="flex flex-col gap-2">
          {[
            {
              step: '1',
              label: 'User provisions a project',
              detail: 'rgforms creates the multi-tab Sheet + deploys the Script. Same 90-second flow, but now one endpoint URL for the whole site.',
            },
            {
              step: '2',
              label: 'User picks a template',
              detail: 'In the rgforms dashboard: 4 template choices (Professional, Warm, Bold, Minimal). Stored in the _config tab. Changeable anytime.',
            },
            {
              step: '3',
              label: 'User gets a preview link',
              detail: 'rgforms.app/preview?url=SCRIPT_URL — shareable. They show it to clients. They use it as the actual site. The URL is not pretty, but it works.',
            },
            {
              step: '4',
              label: 'User edits content in their Sheet',
              detail: 'Change a service name in the Sheet → reload the preview → the site updates. No dashboard, no CMS UI. The Sheet IS the CMS.',
            },
          ].map(({ step, label, detail }) => (
            <div key={step} className="flex items-start gap-3 rounded-lg p-3"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5"
                style={{ background: violet, color: '#fff', fontFamily: 'var(--font-display)' }}>
                {step}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{label}</p>
                <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--color-muted)' }}>{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Rule />

      {/* Templates */}
      <section className="flex flex-col gap-4">
        <Label>The 4 templates — nothing more</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Each template is a CSS custom property set + a fixed section order. Same data, different look.
          Not a visual editor — just 4 options a user picks once.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { name: 'Professional', palette: 'Navy + white + clean sans', target: 'Real estate, legal, finance' },
            { name: 'Warm', palette: 'Cream + amber + serif headings', target: 'Local service, wellness, food' },
            { name: 'Bold', palette: 'Dark + high contrast + large type', target: 'Creative, agency, tech' },
            { name: 'Minimal', palette: 'White + monochrome + tight grid', target: 'Consultant, portfolio, architect' },
          ].map(({ name, palette, target }) => (
            <div key={name} className="rounded-lg p-3 flex flex-col gap-1.5"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>{name}</p>
              <p className="text-[10px] leading-snug" style={{ color: 'var(--color-muted)' }}>{palette}</p>
              <p className="text-[10px] leading-snug" style={{ color: 'var(--color-subtle)' }}>{target}</p>
            </div>
          ))}
        </div>
        <Note>
          <span className="font-semibold" style={{ color: violet }}>What templates are not: </span>
          Not drag-and-drop. Not a visual editor. Not a block builder. Just 4 CSS themes.
          The sections are always in the same order — hero, services, testimonials, gallery, contact.
          If someone asks for a custom layout, that&apos;s a done-for-you service, not a POC feature.
        </Note>
      </section>

      <Rule />

      {/* Cost to build */}
      <section className="flex flex-col gap-4">
        <Label>What it takes to build the POC</Label>
        <div className="flex flex-col gap-0 rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <Row label="Extend provisioning to multi-tab Sheet" value="3–5 days" />
          <Row label="One unified Apps Script template" value="2–3 days" />
          <Row label="/preview renderer + 4 templates" value="4–6 days" />
          <Row label="Template picker in dashboard" value="1–2 days" />
          <Row label="Testing + QA" value="2–3 days" />
          <Row label="Total" value="2–3 weeks" highlight />
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
          This is all frontend + Apps Script work. No new backend infrastructure.
          No Stripe, no Firestore changes, no gateway, no custom domains. Just the Sheet renderer.
        </p>
      </section>

      <Rule />

      {/* Cost to run */}
      <section className="flex flex-col gap-4">
        <Label>Cost to run — monthly</Label>
        <div className="flex flex-col gap-0 rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <Row label="Apps Script hosting (Google)" value="$0 — Google's infrastructure" />
          <Row label="Google Sheets storage" value="$0 — user's Drive" />
          <Row label="Email notifications" value="$0 — MailApp (100/day free)" />
          <Row label="rgforms renderer page" value="$0 — already hosted on Firebase" />
          <Row label="Per-site cost at 100 sites" value="~$0" highlight />
          <Row label="Per-site cost at 1,000 sites" value="~$0" highlight />
        </div>
        <Block>
          <span className="font-semibold" style={{ color: amber }}>The business model advantage: </span>
          Google subsidizes the entire stack. Your only real cost is Firebase App Hosting for the rgforms
          dashboard itself, which you already pay. Adding 1,000 sites to the renderer adds zero marginal cost.
          This is what makes $12/mo work — at 98%+ gross margin.
        </Block>
      </section>

      <Rule />

      {/* First customer */}
      <section className="flex flex-col gap-4">
        <Label>First customer path</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          You already have one. Your friend&apos;s real estate wholesale business. Right now he has a site
          built with the frontend-dev-skill. The POC is: rebuild it using the multi-tab Sheet renderer
          instead — and let him manage the content himself.
        </p>
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <div className="grid px-4 py-2 text-[10px] font-bold uppercase tracking-wider"
            style={{ gridTemplateColumns: '1fr 2fr', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}>
            <span>Step</span><span>What happens</span>
          </div>
          {[
            ['Provision', 'Run the new multi-tab provisioning for his project — gets one Sheet with hero, services, testimonials, contact_form tabs'],
            ['Content', 'Migrate his current site content into the Sheet tabs (30 min, one time)'],
            ['Template', 'He picks Professional or Warm — done'],
            ['Preview link', 'He gets rgforms.app/preview?url=HIS_SCRIPT_URL — share it, test it'],
            ['His feedback', 'He tells you what doesn\'t work or what he wishes it did. That\'s the product spec.'],
            ['Charge him', '$12/mo starting month 2. He\'ll pay it — it\'s less than a lunch.'],
          ].map(([step, detail], i) => (
            <div key={step} className="grid px-4 py-2.5 text-xs"
              style={{ gridTemplateColumns: '1fr 2fr', borderBottom: i < 5 ? '1px solid var(--color-border)' : 'none', background: i % 2 === 0 ? 'var(--color-surface)' : 'transparent' }}>
              <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{step}</span>
              <span style={{ color: 'var(--color-muted)' }}>{detail}</span>
            </div>
          ))}
        </div>
        <Note>
          <span className="font-semibold" style={{ color: violet }}>What this proves: </span>
          That the renderer works on a real site for a real person. That the Sheet-as-CMS workflow makes
          sense to a non-technical user. That the template is good enough that they&apos;re not embarrassed
          to share the URL. Three yes answers = the POC works. Any no = you know what to fix before
          trying to charge strangers.
        </Note>
      </section>

      <Rule />

      {/* What's in / out of POC */}
      <section className="flex flex-col gap-4">
        <Label>POC scope — what&apos;s in and what waits</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold" style={{ color: green }}>In the POC</p>
            <Check items={[
              'Multi-tab Sheet provisioning (one per project)',
              'Multiple sites per account — each project = its own Sheet + Script, listed in dashboard',
              'Unified Apps Script — fully dynamic, reads tab columns generically',
              '_config tab as module registry (modules row = active tab list + order)',
              'addTab() function — dashboard can add new module tabs without reprovisioning',
              'CacheService per tab, 5-min TTL — fast repeat fetches',
              '/preview renderer — reads _config.modules, renders sections in order',
              'Blog module — title, slug, content (Markdown), date, published columns. Listing + detail view.',
              'SEO from _config — meta_description, og_title, og_image, ga_id injected into renderer <head>',
              'Sitemap.xml — generated at /preview?url=…&sitemap=1 from active modules + blog slugs',
              'JSON-LD — LocalBusiness on home, BlogPosting on blog posts, FAQPage on faq module',
              '6 CSS templates in _config tab, changeable anytime',
              'Template picker in the rgforms dashboard',
              'Any form tab routed through doPost → append row + email notification',
              'onEdit cache invalidation (near-real-time content updates)',
              'Module reorder by editing _config.modules order',
            ]} />
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold" style={{ color: amber }}>Explicitly not in the POC</p>
            <X items={[
              'Custom domains — the preview URL is fine for POC',
              'Stripe / billing — charge manually for now',
              'Short URLs / gateway — not needed until there\'s something to monetize',
              'User accounts for site visitors — not relevant',
              'Visual site editor — the Sheet IS the editor',
              'Cloudflare Workers hosting — comes in post-POC once custom domains are needed',
              'AI provisioning (Gemini) — comes in post-POC once the module system is stable',
            ]} />
          </div>
        </div>
      </section>

      <Rule />

      {/* After POC */}
      <section className="flex flex-col gap-4">
        <Label>After POC — what to charge and what to build next</Label>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          If the POC works for your friend and one or two strangers, the next additions unlock revenue — and then scale. Ordered by impact per week of build time.
        </p>
        <div className="flex flex-col gap-2">
          {[
            {
              n: '1', label: 'Custom domain connection',
              detail: 'Guided CNAME setup + a Next.js middleware that reads a Firestore mapping of domain → scriptUrl. The renderer already exists — this just makes the URL yours.',
              unlocks: 'The $12/mo pitch. Hard to charge for a preview link. Easy to charge for yourname.com.',
              effort: '1 week',
              color: green,
              colorA: greenA,
            },
            {
              n: '2', label: 'Stripe $12/mo subscription',
              detail: 'Stripe Checkout link, webhook updates a plan field in Firestore. Enforce: if no active subscription, show upgrade banner on the preview page.',
              unlocks: 'First recurring revenue. Without this you have a product but no business.',
              effort: '3–4 days',
              color: green,
              colorA: greenA,
            },
            {
              n: '3', label: 'Done-for-you tier ($500–$1,500)',
              detail: 'Offer to provision the Sheet, fill in the content, connect the domain, and hand them a working site. Use the build skill for content quality. 90 minutes of work at most.',
              unlocks: 'Lump-sum revenue that funds the next 6 months of development.',
              effort: 'No code needed',
              color: green,
              colorA: greenA,
            },
            {
              n: '4', label: 'Cloudflare Workers + KV — real hosting',
              detail: '',
              unlocks: '',
              effort: '1–2 weeks',
              color: violet,
              colorA: violetA,
              isCloudflare: true,
            },
            {
              n: '5', label: 'Gemini AI provisioning',
              detail: '',
              unlocks: '',
              effort: '1 week',
              color: amber,
              colorA: amberA,
              isGemini: true,
            },
            {
              n: '6', label: 'Premium template library',
              detail: '',
              unlocks: '',
              effort: '2–3 weeks',
              color: violet,
              colorA: violetA,
              isTemplates: true,
            },
          ].map(({ n, label, detail, unlocks, effort, color, colorA, isCloudflare, isGemini, isTemplates }) => (
            <div key={n} className="rounded-xl p-4 flex flex-col gap-2"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderLeft: `3px solid ${color}` }}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{n}. {label}</p>
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold shrink-0"
                  style={{ color, background: colorA(0.10), border: `1px solid ${colorA(0.28)}` }}>
                  {effort}
                </span>
              </div>
              {!isCloudflare && !isGemini && !isTemplates && (
                <>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{detail}</p>
                  <p className="text-xs" style={{ color }}>
                    <span className="font-semibold">Unlocks: </span>{unlocks}
                  </p>
                </>
              )}
              {isCloudflare && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    The preview renderer runs inside rgforms.app. That works for the POC but has three problems
                    at scale: the URL isn&apos;t the user&apos;s domain, every page load hits your Next.js server,
                    and there&apos;s no edge caching. Cloudflare Workers fixes all three.
                  </p>
                  <Code>{`How it works:
  Visitor → acmewholesale.com (their domain)
          → Cloudflare CDN: cache hit → HTML served in ~15ms worldwide
          → cache miss → Cloudflare Worker invoked

  Worker (one deployment, serves ALL user sites):
    1. Read hostname → KV lookup → { scriptUrl, template, siteId }
    2. Parse path: /blog/my-post → fetch blog tab, filter by slug
    3. Fetch data: GET scriptUrl?tab=all (or just the needed tab)
    4. Render full HTML with the right template + SEO tags
    5. Set Cache-Control: s-maxage=300 → CDN caches for 5 min
    6. Return complete HTML to visitor

  onEdit in Apps Script → POST /purge?siteId=xxx
    → Worker clears that site from CDN cache
    → next visitor gets fresh HTML in ~1 second

Cost at 1,000 sites:
  Cloudflare Workers Paid plan:  $5/mo flat
  Cloudflare KV reads:           ~$0.50/mo
  Egress fees:                   $0 (Cloudflare never charges egress)
  Total:                         ~$5.50/mo for 1,000 sites`}
                  </Code>
                  <p className="text-xs" style={{ color }}>
                    <span className="font-semibold">Unlocks: </span>
                    Custom domains with automatic SSL, worldwide edge performance, proper HTTP status codes (404 returns 404),
                    clean URLs (/blog/my-post instead of ?tab=blog&amp;slug=my-post), and zero load on your Next.js server.
                    This is what makes the product feel like a real hosting platform rather than a preview tool.
                  </p>
                </div>
              )}
              {isGemini && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    Instead of the user manually filling in their Sheet, they describe their business in one sentence.
                    Gemini generates the complete site spec — module list, seed content for every tab, _config values —
                    and the provisioning flow creates the Sheet with real content already in it.
                  </p>
                  <Code>{`Provisioning flow with Gemini:

  Step 1 — User types:
    "I'm a real estate wholesaler in Chicago. I buy houses
     as-is, fast close, any condition."

  Step 2 — Gemini 1.5 Flash generates site spec:
    Input:  system prompt + business description  (~800 tokens)
    Output: JSON site spec                        (~3,000 tokens)
    Cost:   ~$0.002/provision (Gemini Flash pricing)
    Time:   ~1.5 seconds

    Spec includes:
    • _config: site_name, tagline, modules list, template suggestion
    • hero tab: headline, subtitle, CTA text seeded for real estate
    • services tab: 3 seed services (Cash Offers, Fast Close, As-Is)
    • faq tab:  4 common seller questions pre-filled
    • testimonials tab: 2 placeholder testimonials (user replaces)
    • contact_form: seller intake fields pre-configured

  Step 3 — Confirmation screen (editable before committing):
    Site name: Chicago REI Solutions
    Template: Professional
    Modules: hero · services · faq · testimonials · contact_form
    Seed rows: 3 services, 4 FAQs, 2 testimonials
    [ Edit ] [ Confirm & Provision ]

  Step 4 — User confirms → 90-second provisioning → site live`}
                  </Code>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    Why Gemini specifically: Google AI Studio gives free API access during development.
                    Gemini Flash is extremely cheap at production scale (~$0.002/site). And staying in the Google
                    ecosystem (Sheets + Script + Gemini) makes the whole story coherent — Google infrastructure all the way down.
                  </p>
                  <p className="text-xs" style={{ color }}>
                    <span className="font-semibold">Unlocks: </span>
                    Non-technical users who would never fill in a spreadsheet themselves can go from zero to live site
                    in 90 seconds. This is the consumer product. Without it, the target customer is someone comfortable
                    editing a Sheet. With it, the target customer is anyone.
                  </p>
                </div>
              )}
              {isTemplates && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    The POC has 6 CSS themes — different colors, fonts, spacing. Good enough to prove the concept.
                    The premium template library goes further: distinct layouts per template, not just different colors.
                    Each template is a completely different visual experience.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { name: 'Editorial', desc: 'Magazine-style. Giant display type, asymmetric grid, serif headings, full-bleed image blocks. Think Squarespace\'s best templates.', target: 'Creatives, agencies, photographers' },
                      { name: 'Professional', desc: 'Clean navy + white. Card-based services, tight grid, trust signals prominent. Looks like a $5,000 agency build.', target: 'Real estate, legal, finance, consulting' },
                      { name: 'Local', desc: 'Warm, approachable, neighborhood feel. Large photos, handwritten-style accent, review stars. Works for any local business.', target: 'Restaurants, cleaners, landscapers, gyms' },
                      { name: 'Bold', desc: 'Dark background, high contrast, large type, amber/neon accents. Immediately eye-catching.', target: 'Contractors, trades, movers, security' },
                      { name: 'Minimal', desc: 'White space, monochrome, tight typography. Every element earns its place.', target: 'Consultants, architects, therapists, coaches' },
                      { name: 'Vibrant', desc: 'Colorful gradients, rounded everything, playful. Energetic and modern without being chaotic.', target: 'Beauty, wellness, studios, youth brands' },
                    ].map(({ name, desc, target }) => (
                      <div key={name} className="rounded-lg p-3 flex flex-col gap-1"
                        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                        <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>{name}</p>
                        <p className="text-xs leading-snug" style={{ color: 'var(--color-muted)' }}>{desc}</p>
                        <p className="text-[10px]" style={{ color: 'var(--color-subtle)' }}>{target}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    Each template defines: section layout (hero centered vs. split vs. full-bleed), card style,
                    typography pairing, motion behavior, color system. The same Sheet data renders completely
                    differently across templates. Switching template is one click — the Sheet doesn&apos;t change.
                  </p>
                  <p className="text-xs" style={{ color }}>
                    <span className="font-semibold">Unlocks: </span>
                    Higher perceived value (better-looking sites justify higher pricing). Gemini can suggest
                    the right template based on business type. Premium templates become a paid feature — free
                    tier gets 2, paid tiers get all 6+.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Rule />

      {/* The one question */}
      <section className="flex flex-col gap-3">
        <Label>The one question this POC answers</Label>
        <div className="rounded-xl p-5 flex flex-col gap-2"
          style={{ background: violetA(0.07), border: `1px solid ${violetA(0.30)}` }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
            Will a non-technical person open their Google Sheet to update their website content — and find that natural?
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            If yes: the whole model works. The Sheet is the CMS. Every small business owner already uses spreadsheets.
            The renderer becomes a product. The provisioning becomes the value.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            If no: you find out in 2-3 weeks, having built nothing that can&apos;t be repurposed. The renderer and
            multi-tab provisioning are still useful even if the Sheet-as-CMS workflow gets replaced by a simple
            form-based editor later.
          </p>
          <p className="text-sm font-semibold mt-1" style={{ color: violet }}>
            Build the POC. Show it to your friend. Watch what he does with the Sheet. You&apos;ll know immediately.
          </p>
        </div>
      </section>

    </article>
  );
}
