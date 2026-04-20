import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ideas & Roadmap — Sheetspin',
  description: 'Developer brainstorm: planned features, content modules, and security improvements for Sheetspin.',
  robots: { index: false, follow: false },
};

// ─── Shared primitives ──────────────────────────────────────────────────────

type Status = 'idea' | 'feasible' | 'in-progress' | 'done' | 'needs-research';

const STATUS_STYLES: Record<Status, { label: string; color: string; bg: string; border: string }> = {
  'done':           { label: 'Done',           color: 'oklch(0.72 0.18 145)',       bg: 'oklch(0.72 0.18 145 / 0.10)', border: 'oklch(0.72 0.18 145 / 0.30)' },
  'in-progress':    { label: 'In Progress',    color: 'oklch(0.78 0.18 75)',        bg: 'oklch(0.78 0.18 75 / 0.10)',  border: 'oklch(0.78 0.18 75 / 0.30)'  },
  'feasible':       { label: 'Feasible',       color: 'oklch(0.65 0.22 285)',       bg: 'oklch(0.65 0.22 285 / 0.10)', border: 'oklch(0.65 0.22 285 / 0.30)' },
  'idea':           { label: 'Idea',           color: 'oklch(0.60 0.030 285)',      bg: 'oklch(0.60 0.030 285 / 0.10)', border: 'oklch(0.23 0.015 285)'       },
  'needs-research': { label: 'Needs Research', color: 'oklch(0.62 0.22 25)',        bg: 'oklch(0.62 0.22 25 / 0.10)',  border: 'oklch(0.62 0.22 25 / 0.30)'  },
};

function Badge({ status }: { status: Status }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide shrink-0"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  );
}

function SectionHeader({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-1 pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{title}</h2>
      </div>
      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{subtitle}</p>
    </div>
  );
}

interface IdeaCardProps {
  title: string;
  status: Status;
  summary: string;
  detail?: string;
  technicalNote?: string;
  limitation?: string;
  checked?: boolean;
}

function IdeaCard({ title, status, summary, detail, technicalNote, limitation, checked = false }: IdeaCardProps) {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-3"
      style={{
        background: 'var(--color-surface)',
        borderColor: checked ? 'oklch(0.72 0.18 145 / 0.30)' : 'var(--color-border)',
        opacity: checked ? 0.7 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 text-base shrink-0"
            style={{ color: checked ? 'oklch(0.72 0.18 145)' : 'var(--color-border)' }}
          >
            {checked ? '✓' : '○'}
          </span>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)', textDecoration: checked ? 'line-through' : 'none' }}>
            {title}
          </p>
        </div>
        <Badge status={status} />
      </div>

      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
        {summary}
      </p>

      {detail && (
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          {detail}
        </p>
      )}

      {technicalNote && (
        <div
          className="rounded-lg p-3 text-xs leading-relaxed font-mono"
          style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', borderLeft: '2px solid var(--color-accent)' }}
        >
          <span style={{ color: 'var(--color-accent)' }}>Technical: </span>
          {technicalNote}
        </div>
      )}

      {limitation && (
        <div
          className="rounded-lg p-3 text-xs leading-relaxed"
          style={{ background: 'oklch(0.62 0.22 25 / 0.08)', color: 'oklch(0.72 0.16 25)', borderLeft: '2px solid oklch(0.62 0.22 25 / 0.50)' }}
        >
          <span className="font-semibold">Limitation: </span>
          {limitation}
        </div>
      )}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function IdeasPage() {
  return (
    <main
      className="min-h-screen px-4 py-16"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <article className="w-full max-w-2xl mx-auto flex flex-col gap-14">

        {/* Header */}
        <header className="flex flex-col gap-4">
          <div
            className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-muted)',
            }}
          >
            Developer Reference · Not indexed
          </div>
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ color: 'var(--color-text)' }}
          >
            Ideas & Roadmap
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Brainstorm checklist for Sheetspin. Each idea is grounded in what the codebase can
            actually support, with notes on feasibility, implementation approach, and known
            limitations. This page is not indexed and not in the nav.
          </p>
          <div
            className="rounded-xl border p-4 text-sm leading-relaxed"
            style={{ background: 'oklch(0.65 0.22 285 / 0.06)', borderColor: 'oklch(0.65 0.22 285 / 0.25)', color: 'var(--color-muted)' }}
          >
            <strong style={{ color: 'var(--color-text)' }}>The core insight</strong> — Sheetspin
            already turns a Google account into a serverless backend via Apps Script. Every idea
            here is an extension of that pattern: deploy a new script type, expose a new endpoint,
            or build a new provisioning flow on top of the existing 5-step pipeline.
          </div>
        </header>

        {/* ── Section 1: Security ─────────────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <SectionHeader
            emoji="🔒"
            title="Security"
            subtitle="Closing gaps in the current public-endpoint model."
          />

          <IdeaCard
            title="Origin verification in doPost()"
            status="feasible"
            summary="Add an allowedOrigins array to CONFIG and check it on every submission. The frontend injects a hidden _origin field; the script validates it server-side."
            technicalNote="Apps Script doPost(e) does not expose HTTP Origin headers — e only has e.parameter and e.postData. Workaround: inject a hidden field named _origin in the embed snippet with value set to window.location.origin at submit time. The script checks e.parameter['_origin'] against CONFIG.allowedOrigins. Not cryptographically secure but raises the bar significantly for casual abuse."
            limitation="A determined attacker can spoof the _origin field since it's just a POST parameter. This is mitigation, not a hard block. Document this clearly."
          />

          <IdeaCard
            title="Allowed domains UI in Form Builder Step 1"
            status="feasible"
            summary="Add a 'Allowed Domains' multi-input in the builder (same pattern as the CC/BCC EmailTagInput). Pre-fill with the user's expected domain. Embed in CONFIG.allowedOrigins. Pair with origin check above."
            detail="Add a dev-mode bypass: if allowedOrigins includes 'localhost' or is empty, skip the check. This avoids breaking local development."
          />

          <IdeaCard
            title="Optional reCAPTCHA v3 support"
            status="needs-research"
            summary="Add an optional reCAPTCHA Site Key field to the builder. The embed snippet calls grecaptcha.execute() before submit and includes the token as a hidden field. The Apps Script verifies it via UrlFetchApp."
            technicalNote="UrlFetchApp can call external URLs from Apps Script. The verify call is: UrlFetchApp.fetch('https://www.google.com/recaptcha/api/siteverify', { method: 'post', payload: { secret: CONFIG.recaptchaSecret, response: token } }). The reCAPTCHA secret key would live in CONFIG — readable by anyone with access to the Sheet. Document this tradeoff."
            limitation="The reCAPTCHA secret key is embedded in the Apps Script source, which is visible to anyone who opens the script in Google Drive. For high-stakes forms this is a meaningful risk. Consider documenting that reCAPTCHA here is spam mitigation, not authentication."
          />

          <IdeaCard
            title="Honeypot field name randomization"
            status="idea"
            summary="Currently honeypot candidates are a fixed list (website, url, homepage, etc.). Randomizing the field name per-form makes it harder for bots trained on the current pattern."
            technicalNote="honeypotFieldName() in snippetTemplate.ts selects the first candidate not already used by real fields. Could be extended to generate a random string like 'form_field_7a3f' instead, baked into CONFIG.honeypotField at provision time."
          />
        </section>

        {/* ── Section 2: Content Modules ──────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <SectionHeader
            emoji="📦"
            title="Content Modules"
            subtitle="Extend the 'Google Drive as backend' concept beyond forms — read-only doGet() endpoints that power dynamic website content."
          />

          <div
            className="rounded-xl border p-4 text-sm leading-relaxed"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          >
            <strong style={{ color: 'var(--color-text)' }}>Pattern:</strong> Instead of a{' '}
            <code
              className="text-xs px-1.5 py-0.5 rounded font-mono"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
            >
              doPost()
            </code>{' '}
            form handler, deploy a{' '}
            <code
              className="text-xs px-1.5 py-0.5 rounded font-mono"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
            >
              doGet()
            </code>{' '}
            that reads from a Sheet (or Drive folder) and returns JSON. The static site fetches
            this public URL on page load. Same provisioning pipeline, different script template.
            <br /><br />
            <strong style={{ color: 'oklch(0.78 0.18 75)' }}>SEO caveat:</strong> Content loaded
            via client-side fetch() is not in the initial HTML — not ideal for blog posts or pages
            that need to rank. Fine for galleries, team pages, announcements, and anything where
            SEO is not the primary goal.
          </div>

          <IdeaCard
            title="Gallery module — images from a Google Drive folder"
            status="feasible"
            summary="User creates a public-shared folder in Google Drive and drops in images. The Apps Script doGet() lists all files in the folder via the Drive API, returns an array of { name, url, mimeType } objects as JSON. The embed snippet fetches this and renders a responsive image grid."
            detail="The Drive folder URL is set as share-publicly so the image URLs are directly accessible. The script uses DriveApp.getFolderById(CONFIG.folderId).getFiles() to enumerate them. No Sheet needed — the folder IS the data source."
            technicalNote="Drive API in Apps Script: DriveApp.getFolderById(folderId).getFiles() returns a FileIterator. Each file has getId(), getName(), getMimeType(). Public image URL pattern: https://drive.google.com/uc?export=view&id={fileId}. Filter by mimeType starting with 'image/'. Sort by getName() or getDateCreated()."
            limitation="Images must be in a publicly shared Drive folder. The folder ID is in the script source (readable). Not suitable for private media. Google Drive's image serving can be slow on the first load — not a CDN."
          />

          <IdeaCard
            title="Blog module — posts from a Google Sheet"
            status="feasible"
            summary="User fills a Sheet with columns: title, slug, body (Markdown or HTML), date, published (TRUE/FALSE). The doGet() filters published rows and returns them as JSON. Embed snippet fetches and renders posts."
            technicalNote="The script reads the sheet, filters rows where published === 'TRUE', sorts by date descending, and returns JSON. ?slug=my-post-slug query param filters to a single post. Apps Script can handle basic query params via e.parameter."
            limitation="SEO-unfriendly for blog content that needs to rank. Pages that need SEO should use a static site generator with the Sheet data fetched at build time instead (e.g. via the Sheets API in a CI step). Client-side rendering is fine for internal blogs, changelogs, or low-traffic content."
          />

          <IdeaCard
            title="Announcements / banner module"
            status="feasible"
            summary="A single-row Sheet: message, active (TRUE/FALSE), link, link_text, expires. doGet() returns the active announcement as JSON. The embed snippet shows a dismissible banner if active is TRUE and the current date is before expires."
            detail="This is the simplest module — single row, no pagination, minimal data. Great first module to build because it proves the pattern end-to-end with low complexity."
          />

          <IdeaCard
            title="Team / About page module"
            status="idea"
            summary="Sheet columns: name, role, bio, photo_url, order, visible. doGet() returns visible rows sorted by order. Embed snippet renders a team grid."
            detail="photo_url can point to a Drive file (public share link) or any external image URL. The user manages the team page by editing the Sheet — no CMS login needed."
          />

          <IdeaCard
            title="FAQ module"
            status="idea"
            summary="Sheet columns: question, answer, category, order, published. doGet() groups by category and returns structured JSON. Embed snippet renders an accordion."
          />

          <IdeaCard
            title="Portfolio / Projects module"
            status="idea"
            summary="Sheet columns: title, description, url, image_url, tags (comma-separated), featured, order. doGet() returns all rows with featured items first. Embed snippet renders a card grid with optional tag filter."
          />
        </section>

        {/* ── Section 3: Core Feature Improvements ────────────────────── */}
        <section className="flex flex-col gap-5">
          <SectionHeader
            emoji="⚡"
            title="Core Form Features"
            subtitle="Improvements to the existing contact form provisioning flow."
          />

          <IdeaCard
            title="Webhook / Slack notification on submission"
            status="feasible"
            summary="Add an optional Webhook URL field in the builder. If set, doPost() calls UrlFetchApp.fetch(CONFIG.webhookUrl, { method: 'post', payload: JSON.stringify(data) }) after appending to the Sheet. Works for Slack, Discord, Zapier, Make, n8n."
            technicalNote="UrlFetchApp in Apps Script can POST to any HTTPS URL. Slack incoming webhooks accept { text: '...' } payload. Could add a webhookType selector (Generic JSON / Slack / Discord) to format the payload appropriately per platform."
          />

          <IdeaCard
            title="Submission viewer in Dashboard"
            status="feasible"
            summary="The Dashboard already knows each form's sheetId (stored in _config). During an active session (token in memory), fetch submission rows via the Sheets API and display them in a modal or inline table — no extra setup required."
            technicalNote="GET https://sheets.googleapis.com/v4/spreadsheets/{sheetId}/values/Submissions using the existing OAuth token. Parse rows, skip header row, render as a sortable table in FormDetailModal.tsx. The token is in AppContext — accessible anywhere in the tree."
            limitation="Only works during an active session (~1 hour token lifetime). Cannot be bookmarked or shared. Re-auth would be needed after token expiry. For persistent access, users should open the Sheet directly in Google Drive."
          />

          <IdeaCard
            title="Date / time field type"
            status="feasible"
            summary="Add 'date' and 'time' to the field type selector in FormBuilder. The embed snippet renders <input type='date'> or <input type='time'>. No backend changes needed — the value arrives as a string and gets appended like any other field."
          />

          <IdeaCard
            title="Checkbox field type"
            status="feasible"
            summary="A boolean yes/no field. Renders as <input type='checkbox'>, submits as 'on' or empty string. The Apps Script normalizes missing checkbox values to 'No' for readability in the Sheet and email."
          />

          <IdeaCard
            title="Number field type with min/max"
            status="idea"
            summary="Add 'number' type with optional min/max attributes. Renders as <input type='number' min=... max=...>. The script could validate the range server-side and return an error if out of bounds."
          />

          <IdeaCard
            title="Field descriptions / helper text"
            status="idea"
            summary="Add an optional 'description' property to FormField. Rendered as a <small> element below the input in the embed snippet. Helps users understand what to enter without changing the data model."
          />

          <IdeaCard
            title="Multi-step / wizard form support"
            status="idea"
            summary="Split fields across named 'pages' in the builder. The embed snippet renders one page at a time with Next/Back navigation and a progress bar. On final submit, all fields are sent in one POST."
            limitation="Significantly increases snippet complexity. May be better as a separate standalone embed (a full JS widget) rather than inline HTML."
          />

          <IdeaCard
            title="File upload support"
            status="needs-research"
            summary="Allow users to upload files via the form, which get saved to a Drive folder."
            technicalNote="Apps Script doPost() receives e.postData.contents as a raw string — binary data via URLSearchParams is not reliable. Would require switching the submission format to multipart/form-data and using DriveApp.createFile() in the script. The OAuth scope would need to expand from spreadsheets.currentonly to drive.file. This is a significant architecture change."
            limitation="Major scope increase. The current approach's simplicity (URL-encoded POST, no file handling) is intentional. File uploads require multipart encoding, Drive API write access, and significantly more complex embed snippet JavaScript. Consider as a separate 'advanced mode' rather than a default feature."
          />
        </section>

        {/* ── Section 4: Developer Experience ─────────────────────────── */}
        <section className="flex flex-col gap-5">
          <SectionHeader
            emoji="🛠"
            title="Developer Experience"
            subtitle="Better tooling and output for developers integrating Sheetspin into projects."
          />

          <IdeaCard
            title="Svelte / SvelteKit snippet"
            status="feasible"
            summary="Add a Svelte tab to EmbedCodeBlock. Same pattern as the Vue snippet — on:submit|preventDefault handler, bind:value on fields, simple fetch call. Svelte syntax is close enough to vanilla that this is low effort."
          />

          <IdeaCard
            title="Web Component snippet"
            status="idea"
            summary="A framework-agnostic custom element (<rg-form endpoint='...'></rg-form>) that works in any HTML page without a build step. Defined as a class extending HTMLElement using the CustomElements API."
          />

          <IdeaCard
            title="CSV export of submissions from Dashboard"
            status="feasible"
            summary="During an active session, fetch all submission rows via the Sheets API and trigger a browser download of a CSV file. No new Google API calls needed — just format the rows array and use URL.createObjectURL(new Blob([csv]))."
          />

          <IdeaCard
            title="Form duplication"
            status="idea"
            summary="From the Dashboard, clone an existing form's config (re-read from _config tab) and pre-fill the Form Builder. User gets a new form with the same fields without re-configuring from scratch."
            technicalNote="Read _config!A2:B11 from the existing sheet to get the stored JSON config. Parse it, dispatch SET_FORM_CONFIG, navigate to builder. The new form gets its own Sheet and Script on provision."
          />

          <IdeaCard
            title="Edit form notification settings post-deployment"
            status="needs-research"
            summary="Allow users to update email addresses, subject, CC/BCC without re-deploying. If the config values are read from the _config tab at runtime rather than baked into CONFIG, the script could re-read them on each invocation."
            technicalNote="Currently CONFIG is baked into the script source at provision time. To make it dynamic, the script would need to read from the Sheet at runtime: SpreadsheetApp.getActiveSpreadsheet().getSheetByName('_config').getRange(...).getValues(). This adds latency to each submission but enables live config updates without redeployment."
            limitation="Reading from the Sheet on every doPost() invocation adds ~100–300ms of latency. May hit quota limits on high-traffic forms. A middle ground: bake most config in, but allow email overrides via _config at runtime."
          />
        </section>

        {/* ── Section 5: Platform / Distribution ──────────────────────── */}
        <section className="flex flex-col gap-5">
          <SectionHeader
            emoji="🚀"
            title="Platform & Distribution"
            subtitle="Ways to grow, monetize, or distribute Sheetspin."
          />

          <IdeaCard
            title="Publish as a Claude Code / MCP skill"
            status="idea"
            summary="Package the form provisioning logic as an MCP tool or Claude Code skill. Developers using Claude Code could say 'add a contact form to this project' and the skill would authenticate, provision, and insert the embed snippet into the right file automatically."
          />

          <IdeaCard
            title="Module marketplace / directory"
            status="idea"
            summary="A page listing all available modules (Gallery, Blog, Announcements, etc.) with one-click provisioning for each. Each module has its own script template and provisioning flow, but all share the same auth pattern and Drive-as-backend philosophy."
          />

          <IdeaCard
            title="Freemium module gating"
            status="idea"
            summary="Core contact form stays free and open. Advanced modules (Gallery, Blog, Webhooks) are behind a paid tier. Since everything runs in the user's Google account, 'gating' would be at the provisioning UI level — the script templates themselves could remain open source."
            detail="Revenue model: charge for the convenience of the provisioning UI, not for the running infrastructure. Once provisioned, the script runs free in the user's account forever. This is honest and aligns with the zero-backend philosophy."
          />

          <IdeaCard
            title="Open source the script templates separately"
            status="idea"
            summary="Publish the Apps Script templates (scriptTemplate.ts, and future module templates) as a standalone repo or npm package. Developers can use them directly without the Sheetspin UI. Sheetspin becomes the easiest way to use them, not the only way."
          />
        </section>

        {/* Footer note */}
        <div
          className="rounded-xl border p-5 text-sm leading-relaxed"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
        >
          <strong style={{ color: 'var(--color-text)' }}>Implementation order suggestion:</strong>
          {' '}Based on feasibility and impact —{' '}
          <span style={{ color: 'var(--color-accent)' }}>
            (1) Origin verification
          </span>
          {' → '}
          <span style={{ color: 'var(--color-accent)' }}>
            (2) Submission viewer
          </span>
          {' → '}
          <span style={{ color: 'var(--color-accent)' }}>
            (3) Gallery module (Drive folder)
          </span>
          {' → '}
          <span style={{ color: 'var(--color-accent)' }}>
            (4) Announcements module
          </span>
          {' → '}
          <span style={{ color: 'var(--color-accent)' }}>
            (5) Webhook support
          </span>
          . The gallery module is the flagship content feature — it demonstrates the Drive-as-backend
          concept most visibly and is a clear differentiator from contact-form-only tools.
        </div>

      </article>
    </main>
  );
}
