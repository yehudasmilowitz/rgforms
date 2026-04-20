import type { Metadata } from 'next';
import Link from 'next/link';
import { GoogleSheetsIcon, GoogleAppsScriptIcon, GoogleDriveIcon } from '@/components/google-icons';

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'Give Sheetspin your pitch. AI spins your site\'s full backend into a single Google Sheet + Apps Script in your Drive — no server, no subscription.',
  alternates: { canonical: 'https://sheetspin.com/how-it-works/' },
  openGraph: {
    title: 'How Sheetspin Works — AI-Powered Site Backends',
    description: 'Describe your site. AI designs the structure. Everything provisions in your Google Drive in under two minutes.',
    url: 'https://sheetspin.com/how-it-works/',
  },
};

function Section({ children }: { children: React.ReactNode }) {
  return <section className="flex flex-col gap-5">{children}</section>;
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-bold mt-2" style={{ color: 'var(--color-text)' }}>
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
      {children}
    </p>
  );
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div
      className="flex gap-4 rounded-xl border p-5"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0"
        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-accent)' }}
      >
        {number}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{title}</p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{description}</p>
      </div>
    </div>
  );
}

function CalloutBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border p-5 text-sm leading-relaxed"
      style={{ background: 'rgba(108,99,255,0.06)', borderColor: 'rgba(108,99,255,0.25)', color: 'var(--color-muted)' }}
    >
      {children}
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <main
      className="min-h-screen px-4 py-16"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <article className="w-full max-w-2xl mx-auto flex flex-col gap-12">

        {/* Header */}
        <header className="flex flex-col gap-4">
          <div
            className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
          >
            Documentation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>
            How Sheetspin works
          </h1>
          <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Give Sheetspin your pitch. AI spins your website&apos;s full data backend into existence — forms, content, gallery, calendar, newsletter, and more — entirely inside your Google Drive. No server, no subscription, no lock-in.
          </p>
        </header>

        {/* The problem */}
        <Section>
          <H2>The problem with website backends</H2>
          <P>
            Most websites need a backend the moment they add a contact form, a blog, or a newsletter signup. The options are either a paid SaaS (that owns your data), a DIY server (that requires ongoing maintenance), or a patchwork of separate tools that don&apos;t talk to each other.
          </P>
          <P>
            Sheetspin takes a different approach: your entire site&apos;s backend lives in a single Google Sheet that you already own. A single Google Apps Script acts as the API layer, reading a live configuration tab on every request. There&apos;s nothing to maintain and nothing to pay for.
          </P>
        </Section>

        {/* Architecture overview */}
        <Section>
          <H2>Architecture overview</H2>
          <P>
            Sheetspin is a fully static web app — there is no Sheetspin server, no database, and no third-party storage. Every API call is made directly from your browser using your own Google OAuth access token. The resources created belong entirely to you.
          </P>
          <div
            className="rounded-xl border p-5 font-mono text-xs leading-loose overflow-x-auto"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          >
            <pre>{`Your Browser
    │
    ├─── Google OAuth          ──▶  Short-lived access token (memory only)
    ├─── Gemini API (Google)   ──▶  AI proposes site module structure
    ├─── Google Drive API      ──▶  Creates Sheet + Drive folder
    ├─── Apps Script API       ──▶  Creates & deploys API handler
    └─── (no Sheetspin server involved)

Your site's live API (after provisioning):

Visitor's Browser / Your Claude agent
    │
    └─── fetch(scriptUrl, { body: URLSearchParams })
              │
              └─── Apps Script  ──▶  reads _manifest tab at runtime
                        ├─── form tab:    appends row + sends email
                        ├─── rows tab:    GET returns JSON array
                        ├─── key-value:   GET returns config object
                        └─── Returns { result: 'success' } or { result: 'error', error: '...' }`}</pre>
          </div>
        </Section>

        {/* The manifest pattern */}
        <Section>
          <H2>The manifest pattern — no redeployment needed</H2>
          <P>
            The Apps Script handler doesn&apos;t have your site structure hardcoded into it. Instead, it reads a <code className="text-xs px-1 rounded font-mono" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>_manifest</code> tab in your Google Sheet on every request. The manifest is a JSON object that lists all your modules — their names, types, form field configurations, and Drive folder references.
          </P>
          <P>
            This means you can add a new module, remove an old one, or update form fields by simply updating the sheet and the manifest row. No redeployment. No changes to the script. Your endpoint URL never changes.
          </P>
        </Section>

        {/* Step by step */}
        <Section>
          <H2>Step-by-step walkthrough</H2>

          <StepCard
            number={1}
            title="Sign in with Google"
            description="You grant Sheetspin a temporary OAuth access token. This token lives only in browser memory — it's never sent to any Sheetspin server, never written to disk, and is gone the moment you close the tab."
          />

          <StepCard
            number={2}
            title="Describe your site to AI"
            description="Type a plain-English description of your website — what it does, what kind of content it has, whether it needs forms or a gallery. Gemini (Google's AI) reads this and proposes a complete module structure: each tab, its type (form, rows, key-value, asset, etc.), field names, and settings."
          />

          <StepCard
            number={3}
            title="Review and customize"
            description="You see each proposed module as a card. For form-type modules, you can expand the field editor to customize field labels, types (text, email, textarea, phone, select), required flags, and email settings (CC, BCC, subject, sender name, reply-to, honeypot spam protection). Accept, edit, or remove any module before provisioning."
          />

          <StepCard
            number={4}
            title="Your Drive gets the full spin"
            description="A Drive folder is created for your site. Inside it: a Google Sheet with one tab per module plus a _manifest tab, and an asset subfolder for any file storage modules. All columns are pre-populated based on the module type and your field definitions."
          />

          <StepCard
            number={5}
            title="Apps Script is deployed"
            description="A single Apps Script project is created and bound to your sheet. The doPost() handler receives form submissions; doGet() serves row data as JSON. Both read the _manifest tab at runtime so the script never needs to be updated as your site evolves. The script is deployed as a public web app — producing the unique HTTPS URL that is your site's API endpoint."
          />

          <StepCard
            number={6}
            title="Authorize your script"
            description="Because the script was deployed via API, Google requires a one-time manual authorization before it can run. Open the script URL shown in the Site Kit, sign in if prompted, and approve the permissions dialog. The script requests three scopes: access to its one spreadsheet (spreadsheets.currentonly), email sending (gmail.send), and read access to its Drive folder (drive.readonly). This runs under your Google account — not ours."
          />

          <StepCard
            number={7}
            title="Manage and evolve your site"
            description="From the Site Kit, you can add new modules at any time, remove ones you no longer need, and edit form field configurations — all with instant effect. No code changes, no redeployment. Use AI-powered data seeding to populate any module with realistic sample data using Gemini, or export your CLAUDE.md skill file so your Claude Code agent knows your site's full API and data schema."
          />
        </Section>

        {/* What gets created */}
        <Section>
          <H2>What gets created in your Google Drive</H2>
          <div className="flex flex-col gap-3">
            {[
              {
                icon: <GoogleDriveIcon />,
                title: 'A Drive folder',
                body: 'Named after your site slug. Contains your Google Sheet and any asset subfolders. You can browse, share, and manage it like any other Drive folder.',
              },
              {
                icon: <GoogleSheetsIcon />,
                title: 'A Google Sheet with multiple tabs',
                body: 'One tab per module (form submissions, blog posts, gallery images, etc.) plus a _manifest tab that the script reads on every request. All tabs are pre-populated with the correct column headers.',
              },
              {
                icon: <GoogleAppsScriptIcon />,
                title: 'A single Apps Script web app',
                body: 'One script handles all your modules dynamically by reading the _manifest tab. It supports form submissions (doPost) and data retrieval (doGet). One deployment URL, forever — no matter how many modules you add or remove.',
              },
            ].map(({ icon, title, body }) => (
              <div
                key={title}
                className="flex gap-4 rounded-xl border p-5"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <span className="leading-none mt-0.5 shrink-0">{icon}</span>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Module types */}
        <Section>
          <H2>Module types</H2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { type: 'Contact Form', desc: 'Submissions go to a sheet tab + email notification. Supports CC, BCC, custom subject, honeypot spam protection.' },
              { type: 'Newsletter', desc: 'Single email field form. Collects subscriber addresses in a dedicated tab.' },
              { type: 'Blog / Content', desc: 'Structured rows with title, body, slug, and published flag. Your doGet endpoint returns published items as JSON.' },
              { type: 'Gallery', desc: 'Links Google Drive image files to rows in a sheet tab. Your doGet returns captions and Drive file IDs.' },
              { type: 'Calendar / Events', desc: 'Date-structured rows with title, description, start/end times. Returned as a sorted JSON array.' },
              { type: 'Asset Storage', desc: 'Files are uploaded to a Drive subfolder. The doGet endpoint lists them for your frontend.' },
              { type: 'Site Config', desc: 'Key-value pairs for site-wide settings (tagline, social links, etc.). Retrieved as a single JSON object.' },
              { type: 'Custom Rows', desc: 'Freeform tabular data with any column structure you define. Returned as a JSON array.' },
            ].map(({ type, desc }) => (
              <div
                key={type}
                className="rounded-xl border p-4 flex flex-col gap-1"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{type}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* CLAUDE.md */}
        <Section>
          <H2>CLAUDE.md — your AI skill file</H2>
          <P>
            After provisioning, the Site Kit lets you export a <code className="text-xs px-1 rounded font-mono" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>CLAUDE.md</code> file. Drop this into your website project and Claude Code will understand your site&apos;s entire backend without any configuration:
          </P>
          <div className="flex flex-col gap-2">
            {[
              'Your API endpoint URL and authentication token',
              'Every module, its tab name, type, and column schema',
              'Exact calling conventions for GET (data retrieval) and POST (form submissions)',
              'Expected response formats — { result: "success" } / { result: "error", error: "..." }',
              'Form field names, types, and honeypot instructions',
              'Drive folder URLs for asset modules',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <span className="shrink-0 mt-1 text-xs" style={{ color: 'var(--color-accent)' }}>▸</span>
                <span className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{item}</span>
              </div>
            ))}
          </div>
          <P>
            You can also use the AI seed data feature to populate any module with realistic sample rows generated by Gemini — useful for testing your frontend before real data arrives. The seed request sends only your column names and module type to the AI — no personal data.
          </P>
        </Section>

        {/* Limitations */}
        <Section>
          <H2>Limitations to know about</H2>
          <div className="flex flex-col gap-3">
            {[
              {
                title: 'Email quota',
                body: 'Google Apps Script free accounts are limited to roughly 100 email notifications per day. This is a Google-imposed limit that applies to your personal Apps Script quota.',
              },
              {
                title: 'One-time script authorization required',
                body: 'After provisioning, you must visit the script URL once while signed in to Google to authorize it. This is a Google requirement for scripts deployed via the API. The authorization dialog will show the script requesting spreadsheets.currentonly, gmail.send, and drive.readonly — all scoped to the resources for this one site.',
              },
              {
                title: 'Apps Script API must be enabled',
                body: 'The Google Apps Script API must be enabled in your Google account before provisioning. If it isn\'t, Sheetspin will detect this and show a direct link to enable it — it\'s a single toggle.',
              },
              {
                title: 'No file uploads via the form endpoint',
                body: 'The API endpoint handles URL-encoded data and JSON, not multipart uploads. File storage uses Drive directly — asset modules list files you upload to Drive manually or via the Drive API.',
              },
              {
                title: 'Honeypot-only spam protection',
                body: 'Forms support a honeypot hidden field that silently discards bot submissions. For higher-traffic forms, consider adding reCAPTCHA to your frontend HTML manually.',
              },
            ].map(({ title, body }) => (
              <div
                key={title}
                className="rounded-xl border p-4 flex flex-col gap-1"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{title}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Trust */}
        <CalloutBox>
          <strong style={{ color: 'var(--color-text)' }}>No data leaves your Google account.</strong>{' '}
          Sheetspin is a static site that makes API calls on your behalf using a short-lived access token that never touches our servers. Submissions and data go directly from the browser to your own Apps Script endpoint and land in your own Google Sheet. The AI seed feature sends only column names and module types to Gemini — no personal information.{' '}
          <Link href="/privacy" style={{ color: 'var(--color-accent)' }} className="underline hover:no-underline">
            Read our privacy policy.
          </Link>
        </CalloutBox>

        {/* CTA */}
        <div className="flex items-center justify-center pt-2">
          <Link
            href="/"
            className="px-6 py-3 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
          >
            Spin up your site →
          </Link>
        </div>

        {/* Footer nav */}
        <div className="pt-4 border-t flex items-center gap-4" style={{ borderColor: 'var(--color-border)' }}>
          <Link href="/" className="text-sm" style={{ color: 'var(--color-accent)' }}>← Back to Sheetspin</Link>
          <Link href="/privacy" className="text-sm nav-link">Privacy Policy</Link>
          <Link href="/terms" className="text-sm nav-link">Terms of Service</Link>
        </div>

      </article>
    </main>
  );
}
