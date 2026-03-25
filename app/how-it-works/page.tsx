import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How rgforms works — Zero-backend HTML contact forms',
  description:
    'A deep dive into how rgforms automates the DWYL serverless form pattern: Google OAuth, Apps Script, and Sheets — all from your browser.',
};

function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      {children}
    </section>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xl font-bold mt-2"
      style={{ color: 'var(--color-text)' }}
    >
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

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div
      className="flex gap-4 rounded-xl border p-5"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0"
        style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-accent)',
        }}
      >
        {number}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          {title}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          {description}
        </p>
      </div>
    </div>
  );
}

function CalloutBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border p-5 text-sm leading-relaxed"
      style={{
        background: 'rgba(108,99,255,0.06)',
        borderColor: 'rgba(108,99,255,0.25)',
        color: 'var(--color-muted)',
      }}
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
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-muted)',
            }}
          >
            Documentation
          </div>
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ color: 'var(--color-text)' }}
          >
            How rgforms works
          </h1>
          <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            rgforms automates a proven serverless form pattern — giving you a fully functional
            HTML contact form in under two minutes, backed entirely by infrastructure you already
            own in Google Drive.
          </p>
        </header>

        {/* The problem */}
        <Section>
          <H2>The problem with contact forms</H2>
          <P>
            Most contact form solutions require a paid subscription, a backend server, or hand
            over your submission data to a third party. Even simple form-handling services add
            monthly costs and vendor lock-in for something that should be a solved problem.
          </P>
          <P>
            The{' '}
            <a
              href="https://github.com/dwyl/learn-to-send-email-via-google-script-html-no-server"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-accent)' }}
              className="underline hover:no-underline"
            >
              DWYL serverless form pattern
            </a>{' '}
            solves this elegantly: use a Google Apps Script as a free, serverless HTTP endpoint
            that writes submissions to a Google Sheet and emails you. The catch? Setting it up
            manually takes 20–30 minutes and involves navigating multiple Google dashboards.
            rgforms does it for you in seconds.
          </P>
        </Section>

        {/* Architecture overview */}
        <Section>
          <H2>Architecture overview</H2>
          <P>
            rgforms is a fully static web app — there is no rgforms server, no database, and no
            third-party storage. Every API call is made directly from your browser using your
            own Google OAuth access token. The resources created belong entirely to you.
          </P>
          <div
            className="rounded-xl border p-5 font-mono text-xs leading-loose overflow-x-auto"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          >
            <pre>{`Your Browser
    │
    ├─── Google OAuth (sign-in, access token)
    │
    ├─── Google Sheets API  ──▶  Creates your spreadsheet
    │
    ├─── Apps Script API    ──▶  Creates & deploys your handler
    │
    └─── (no rgforms server involved)

Later, when your form is submitted:

Visitor's Browser
    │
    └─── fetch(deploymentUrl, { mode: 'no-cors' })
              │
              └─── Apps Script doPost()
                        ├─── Appends row to Google Sheet
                        └─── Sends email to you`}</pre>
          </div>
        </Section>

        {/* Step by step */}
        <Section>
          <H2>Step-by-step walkthrough</H2>

          <StepCard
            number={1}
            title="Sign in with Google"
            description="You grant rgforms a temporary OAuth access token. This token lives only in browser memory — it's never sent to any rgforms server, never written to disk, and is gone the moment you close the tab."
          />

          <StepCard
            number={2}
            title="Configure your form"
            description="Give your form a name (used as the spreadsheet title), set the email address for submission notifications, and add your fields. Supported types: text, email, textarea, phone, and select/dropdown."
          />

          <StepCard
            number={3}
            title="Apps Script is created"
            description="Using your access token, rgforms calls the Google Apps Script API to create a new script project in your Google Drive. The script is pre-written — a doPost() function that handles incoming form submissions."
          />

          <StepCard
            number={4}
            title="Google Sheet is created"
            description="rgforms creates a new Google Spreadsheet in your Drive, titled with your form name. A hidden _config tab stores metadata. The first row of the main sheet is pre-populated with your field names as column headers."
          />

          <StepCard
            number={5}
            title="Handler code is uploaded"
            description="The doPost() function is generated based on your field definitions and uploaded to the Apps Script project. It maps incoming form data to the correct columns in your sheet and sends email notifications to your address."
          />

          <StepCard
            number={6}
            title="Script is deployed as a web app"
            description="The Apps Script is deployed as a public web app with execute-as-user permissions. This deployment produces a unique HTTPS URL — the endpoint your form will POST to."
          />

          <StepCard
            number={7}
            title="Embed snippet is generated"
            description="rgforms generates a self-contained HTML+JS snippet with your deployment URL baked in. Paste it anywhere in your HTML and the form is live. No additional configuration needed."
          />
        </Section>

        {/* What the Apps Script does */}
        <Section>
          <H2>What happens when a form is submitted</H2>
          <P>
            When a visitor submits your form, their browser sends a POST request directly to
            your Apps Script deployment URL. Google's servers run your doPost() function, which:
          </P>
          <ol className="flex flex-col gap-2 list-none">
            {[
              'Reads the column headers from row 1 of your sheet.',
              'Maps each form field to its matching column.',
              'Appends a new row with the submission data and a timestamp.',
              'Sends an email notification to your configured address.',
              'Returns a JSON success response.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="text-xs font-bold shrink-0 mt-0.5"
                  style={{ color: 'var(--color-accent)', minWidth: '1rem' }}
                >
                  {i + 1}.
                </span>
                <span className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {item}
                </span>
              </li>
            ))}
          </ol>
          <P>
            The embed snippet uses{' '}
            <code
              className="text-xs px-1.5 py-0.5 rounded font-mono"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
            >
              mode: &apos;no-cors&apos;
            </code>{' '}
            when fetching, which means the browser doesn&apos;t need CORS headers from the Apps Script
            endpoint. The trade-off is that the response body can&apos;t be read — but since the script
            always succeeds or throws, the fetch resolving is sufficient to show a success state.
          </P>
        </Section>

        {/* What's in your Drive */}
        <Section>
          <H2>What gets created in your Google Drive</H2>
          <div className="flex flex-col gap-3">
            {[
              {
                icon: '📊',
                title: 'A Google Spreadsheet',
                body: 'Named after your form. Contains a header row matching your fields, and a hidden _config tab with metadata. All submissions are appended as rows.',
              },
              {
                icon: '⚡',
                title: 'A Google Apps Script project',
                body: 'Contains the doPost() handler. You can view and edit it at any time via script.google.com. It runs under your Google account.',
              },
            ].map(({ icon, title, body }) => (
              <div
                key={title}
                className="flex gap-4 rounded-xl border p-5"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <span className="text-xl leading-none mt-0.5 shrink-0">{icon}</span>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    {title}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <P>
            Both files are owned by your Google account. rgforms has no ongoing access to them
            after provisioning — it only calls the APIs during the one-time setup flow.
          </P>
        </Section>

        {/* Limitations */}
        <Section>
          <H2>Limitations to know about</H2>
          <div className="flex flex-col gap-3">
            {[
              {
                title: 'Email quota',
                body: 'Google Apps Script free accounts are limited to roughly 100 email notifications per day. This is a Google-imposed limit and applies to your personal Apps Script quota.',
              },
              {
                title: 'Apps Script API must be enabled',
                body: 'The Google Apps Script API must be enabled in your Google account before provisioning. rgforms will show a direct link to enable it if needed — it only takes a few seconds.',
              },
              {
                title: 'No file uploads',
                body: 'The form supports text-based field types only. File inputs are not supported because the Apps Script endpoint handles URL-encoded form data, not multipart uploads.',
              },
              {
                title: 'No CAPTCHA',
                body: 'The generated embed does not include spam protection. For low-traffic personal sites this is usually fine; for higher-traffic forms, consider adding reCAPTCHA to your embed HTML manually.',
              },
            ].map(({ title, body }) => (
              <div
                key={title}
                className="rounded-xl border p-4 flex flex-col gap-1"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  {title}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Trust */}
        <CalloutBox>
          <strong style={{ color: 'var(--color-text)' }}>No data leaves your Google account.</strong>{' '}
          rgforms is a static site that makes API calls on your behalf using a short-lived access
          token that never touches our servers. Your form submissions go directly from your
          visitors&apos; browsers to your own Apps Script endpoint, and land in your own Google Sheet.
          We never see them.{' '}
          <Link href="/privacy" style={{ color: 'var(--color-accent)' }} className="underline hover:no-underline">
            Read our privacy policy.
          </Link>
        </CalloutBox>

        {/* CTA */}
        <div className="flex items-center justify-center pt-2">
          <Link
            href="/"
            className="px-6 py-3 rounded-lg text-sm font-semibold"
            style={{
              background: 'var(--color-accent)',
              color: '#fff',
            }}
          >
            Create your form →
          </Link>
        </div>

      </article>
    </main>
  );
}
