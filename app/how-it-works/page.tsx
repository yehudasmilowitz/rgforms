import type { Metadata } from 'next';
import Link from 'next/link';
import { GoogleSheetsIcon, GoogleAppsScriptIcon, GoogleDriveIcon } from '@/components/google-icons';
import SheetspinCTA from '@/components/SheetspinCTA';

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'RG Forms creates a live contact form endpoint backed by a Google Sheet you own. No server, no monthly fees — submissions land directly in your Drive.',
  alternates: { canonical: 'https://rgforms.com/how-it-works/' },
  openGraph: {
    title: 'How RG Forms Works',
    description: 'Sign in with Google, configure your fields, get a live form endpoint. Submissions go to your own Google Sheet.',
    url: 'https://rgforms.com/how-it-works/',
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
            How RG Forms works
          </h1>
          <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            RG Forms gives you a live contact form endpoint in under 2 minutes — backed entirely by a Google Sheet you own. No server to manage, no monthly fee, no third-party data storage.
          </p>
        </header>

        {/* The idea */}
        <Section>
          <H2>The idea</H2>
          <P>
            Most contact form tools store your submissions on their servers. You pay monthly, you depend on their uptime, and your data lives in their database. RG Forms does the opposite: every submission goes directly into a Google Sheet in your own Google Drive, sent by an Apps Script you own and control.
          </P>
          <P>
            RG Forms provisions that sheet and script for you — the whole thing takes about 90 seconds. After that, your endpoint works forever at no cost, independent of any RG Forms server.
          </P>
        </Section>

        {/* Architecture */}
        <Section>
          <H2>Architecture</H2>
          <P>
            RG Forms is a fully static web app. There is no RG Forms server, no database, and no backend. Every API call during setup goes directly from your browser to Google using your own OAuth token.
          </P>
          <div
            className="rounded-xl border p-5 font-mono text-xs leading-loose overflow-x-auto"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          >
            <pre>{`Setup (one time, in your browser):

  Your Browser
      ├─── Google OAuth        ──▶  Short-lived token (memory only)
      ├─── Google Drive API    ──▶  Creates Sheet + Drive folder
      └─── Apps Script API     ──▶  Creates & deploys form handler

Live endpoint (after provisioning):

  Your Website / App
      └─── POST to script URL
                └─── Apps Script (in your Google account)
                          ├─── Appends row to Google Sheet
                          ├─── Sends email notification
                          └─── Returns { result: "success" }`}</pre>
          </div>
        </Section>

        {/* Step by step */}
        <Section>
          <H2>Step-by-step walkthrough</H2>

          <StepCard
            number={1}
            title="Sign in with Google"
            description="You grant RG Forms a temporary OAuth access token. This token lives only in browser memory — it's never sent to any RG Forms server, never written to disk, and disappears when you close the tab."
          />

          <StepCard
            number={2}
            title="Configure your form"
            description="Give your form a name (e.g. 'Contact' or 'Get a Quote'), set the email address for notifications, and configure your fields. You can add any fields you need — text, email, phone, textarea, select — and mark them required or optional."
          />

          <StepCard
            number={3}
            title="We provision everything"
            description="RG Forms creates a Drive folder, a Google Sheet with your form's column headers and a hidden _manifest tab, and an Apps Script project. The script is deployed as a public HTTPS web app — giving you a permanent endpoint URL."
          />

          <StepCard
            number={4}
            title="Authorize your script"
            description="Because the script was deployed via API, Google requires a one-time manual authorization. Open the script URL shown in the dashboard, sign in if prompted, and approve the permissions dialog. The script only requests access to its one spreadsheet and email sending — nothing else."
          />

          <StepCard
            number={5}
            title="Start receiving submissions"
            description="POST JSON to your endpoint from any website, app, or no-code tool. Each submission appends a row to your Google Sheet and sends you an email notification. You can edit field labels, add new fields, or update email settings at any time without reprovisioning."
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
                body: 'Named after your form slug. Contains your Google Sheet. Browse, share, and manage it like any other Drive folder.',
              },
              {
                icon: <GoogleSheetsIcon />,
                title: 'A Google Sheet',
                body: 'One tab for your form submissions, pre-populated with your column headers, plus a hidden _manifest tab the script reads on every request.',
              },
              {
                icon: <GoogleAppsScriptIcon />,
                title: 'An Apps Script web app',
                body: 'Handles form submissions (POST), appends rows, and sends email notifications. Deployed as a permanent HTTPS endpoint under your Google account.',
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

        {/* Submitting to the endpoint */}
        <Section>
          <H2>Submitting to your endpoint</H2>
          <P>
            Your endpoint accepts a JSON POST with a <code className="text-xs px-1 rounded font-mono" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>token</code>, <code className="text-xs px-1 rounded font-mono" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>tab</code>, and <code className="text-xs px-1 rounded font-mono" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>fields</code> object. Keep the token on the server side.
          </P>
          <div
            className="rounded-xl border p-5 font-mono text-xs leading-loose overflow-x-auto"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          >
            <pre>{`// Next.js server-side proxy (keeps token out of browser)
// app/api/contact/route.ts

export async function POST(req: Request) {
  const { fields } = await req.json();
  const res = await fetch(process.env.FORM_SCRIPT_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: process.env.FORM_TOKEN,
      tab: 'contact',
      fields,          // { name, email, phone, message, ... }
    }),
  });
  return Response.json(await res.json());
  // { result: 'success' } or { result: 'error', error: '...' }
}`}</pre>
          </div>
          <P>
            The CLAUDE.md export from your dashboard gives your Claude Code agent the exact field names, tab name, and endpoint URL — so it can wire up the form for you automatically.
          </P>
        </Section>

        {/* Features */}
        <Section>
          <H2>What&apos;s included</H2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: 'Email notifications', desc: 'Every submission triggers an email to your notification address. Configurable subject line.' },
              { title: 'CC / BCC support', desc: 'Copy other addresses on every notification without exposing them in your frontend code.' },
              { title: 'Reply-to field', desc: 'Map a form field (like email) as the reply-to address so you can respond directly.' },
              { title: 'Honeypot spam protection', desc: 'A hidden field bots fill out; the script silently discards those submissions.' },
              { title: 'Multiple forms', desc: 'Add more form tabs to the same sheet from the dashboard — separate tabs, same endpoint.' },
              { title: 'Edit fields any time', desc: 'Update labels, add fields, remove fields — no reprovisioning or redeployment needed.' },
              { title: 'CLAUDE.md export', desc: 'Export an AI skill file so Claude Code can wire up your form in a new project instantly.' },
              { title: 'Manifest JSON', desc: 'Download your full configuration as JSON for your own records or tooling.' },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="rounded-xl border p-4 flex flex-col gap-1"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Limitations */}
        <Section>
          <H2>Limitations to know about</H2>
          <div className="flex flex-col gap-3">
            {[
              {
                title: 'Email quota',
                body: 'Google Apps Script accounts are limited to roughly 100 email notifications per day on free Google accounts. This is a Google-imposed quota.',
              },
              {
                title: 'One-time script authorization required',
                body: 'After provisioning, you must open the script URL once while signed in to Google and approve the permissions. This is a Google requirement for scripts deployed via API.',
              },
              {
                title: 'Apps Script API must be enabled',
                body: 'The Google Apps Script API must be enabled in your Google account before provisioning. RG Forms will detect this and show a direct link to enable it — it\'s a single toggle.',
              },
              {
                title: 'Honeypot-only spam protection',
                body: 'Forms support a honeypot hidden field. For high-traffic forms, consider adding reCAPTCHA to your frontend HTML manually.',
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
          RG Forms is a static app that makes API calls on your behalf using a short-lived access token that never touches our servers. Form submissions go directly from your website to your own Apps Script endpoint and land in your own Google Sheet.{' '}
          <Link href="/privacy" style={{ color: 'var(--color-accent)' }} className="underline hover:no-underline">
            Read our privacy policy.
          </Link>
        </CalloutBox>

        {/* Sheetspin CTA */}
        <SheetspinCTA />

        {/* CTA */}
        <div className="flex items-center justify-center pt-2">
          <Link
            href="/"
            className="px-6 py-3 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
          >
            Create your form →
          </Link>
        </div>

        {/* Footer nav */}
        <div className="pt-4 border-t flex items-center gap-4" style={{ borderColor: 'var(--color-border)' }}>
          <Link href="/" className="text-sm" style={{ color: 'var(--color-accent)' }}>← Back to RG Forms</Link>
          <Link href="/privacy" className="text-sm nav-link">Privacy Policy</Link>
          <Link href="/terms" className="text-sm nav-link">Terms of Service</Link>
        </div>

      </article>
    </main>
  );
}
