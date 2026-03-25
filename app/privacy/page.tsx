import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — rgforms',
  description: 'rgforms privacy policy: what data we collect (none), how Google OAuth is used, and where your form data lives.',
};

function Section({ children }: { children: React.ReactNode }) {
  return <section className="flex flex-col gap-4">{children}</section>;
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
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

export default function PrivacyPage() {
  return (
    <main
      className="min-h-screen px-4 py-16"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <article className="w-full max-w-2xl mx-auto flex flex-col gap-10">

        {/* Header */}
        <header className="flex flex-col gap-3">
          <div
            className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-muted)',
            }}
          >
            Legal
          </div>
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ color: 'var(--color-text)' }}
          >
            Privacy Policy
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            Last updated: March 2026
          </p>
        </header>

        {/* TL;DR */}
        <div
          className="rounded-xl border p-5 flex flex-col gap-2"
          style={{
            background: 'rgba(108,99,255,0.06)',
            borderColor: 'rgba(108,99,255,0.25)',
          }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Short version
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            rgforms does not collect, store, or transmit any of your personal data or form
            submission data. We have no database, no analytics, and no server that receives
            your information. Your Google OAuth token exists only in your browser&apos;s memory
            for the duration of your session.
          </p>
        </div>

        <Section>
          <H2>1. Who we are</H2>
          <P>
            rgforms is a static web application that helps you create zero-backend HTML contact
            forms backed by your own Google Drive infrastructure. The service is provided as-is
            with no warranty.
          </P>
        </Section>

        <Section>
          <H2>2. Data we do not collect</H2>
          <P>
            rgforms does not operate any server-side infrastructure that processes your data.
            Specifically, we do not collect:
          </P>
          <ul className="flex flex-col gap-2 list-none">
            {[
              'Your name, email address, or Google account information',
              'Your OAuth access token or refresh token',
              'Your form configuration (fields, names, settings)',
              'Any submissions sent through forms you create',
              'IP addresses, device identifiers, or browser fingerprints',
              'Usage analytics or behavioral data',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span
                  className="text-xs mt-1 shrink-0"
                  style={{ color: 'var(--color-accent)' }}
                  aria-hidden="true"
                >
                  ✕
                </span>
                <span className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section>
          <H2>3. Google OAuth and access tokens</H2>
          <P>
            To create Google Sheets and Apps Script projects on your behalf, rgforms requests
            a short-lived OAuth 2.0 access token from Google. This token:
          </P>
          <ul className="flex flex-col gap-2 list-none">
            {[
              'Is stored only in your browser\'s memory (JavaScript variable) — never in localStorage, cookies, or any server.',
              'Is used exclusively to make Google API calls to create your Sheet and Apps Script.',
              'Is discarded automatically when you close or refresh the page.',
              'Is never transmitted to any rgforms server or third-party service.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span
                  className="text-xs mt-1 shrink-0"
                  style={{ color: 'var(--color-success)' }}
                  aria-hidden="true"
                >
                  ✓
                </span>
                <span className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section>
          <H2>4. OAuth scopes requested</H2>
          <P>
            When you sign in, Google will show you the permissions rgforms is requesting.
            Here is exactly what each scope is used for:
          </P>
          <div className="flex flex-col gap-3">
            {[
              {
                scope: 'spreadsheets',
                label: 'Google Sheets',
                use: 'Create the spreadsheet that stores your form submissions.',
              },
              {
                scope: 'script.projects',
                label: 'Apps Script (projects)',
                use: 'Create the Apps Script project that handles form POST requests.',
              },
              {
                scope: 'script.deployments',
                label: 'Apps Script (deployments)',
                use: 'Deploy the script as a public web app to get the endpoint URL.',
              },
              {
                scope: 'drive.file',
                label: 'Drive (files created by app)',
                use: 'Read and organize only the Sheet and Script files rgforms creates. This scope does not grant access to any other Drive files.',
              },
              {
                scope: 'userinfo.email & profile',
                label: 'Your Google profile',
                use: 'Display your name and avatar in the app, and pre-fill the notification email field with your address.',
              },
            ].map(({ scope: _, label, use }) => (
              <div
                key={label}
                className="rounded-xl border p-4 flex flex-col gap-1"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  {label}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {use}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section>
          <H2>5. Your form submissions</H2>
          <P>
            After you generate a form with rgforms, visitors who submit that form send their
            data directly from their browser to your Google Apps Script deployment URL. That
            data goes directly into your Google Sheet and is emailed to you. rgforms is not
            involved in this data flow at all — we never see, intercept, or store any
            form submissions.
          </P>
          <P>
            You are responsible for the data collected through forms you create. If you collect
            personal information from your visitors, ensure your own site&apos;s privacy policy
            accurately reflects that.
          </P>
        </Section>

        <Section>
          <H2>6. Google&apos;s privacy policy</H2>
          <P>
            By signing in with Google, you are also subject to Google&apos;s own privacy policy and
            terms of service. The resources created in your Google Drive (Sheets, Apps Script)
            are governed by Google&apos;s terms, not ours.
          </P>
          <P>
            You can revoke rgforms&apos; access to your Google account at any time by visiting{' '}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-accent)' }}
              className="underline hover:no-underline"
            >
              myaccount.google.com/permissions
            </a>{' '}
            and removing rgforms from the list of connected apps.
          </P>
        </Section>

        <Section>
          <H2>7. Cookies and tracking</H2>
          <P>
            rgforms does not use cookies, local storage, session storage, or any tracking
            pixels. There are no analytics scripts running on this site. The only external
            script loaded is Google&apos;s Identity Services library (
            <code
              className="text-xs px-1.5 py-0.5 rounded font-mono"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
            >
              accounts.google.com/gsi/client
            </code>
            ), which is required to implement the Google Sign-In flow.
          </P>
        </Section>

        <Section>
          <H2>8. Changes to this policy</H2>
          <P>
            If this privacy policy changes materially, the &ldquo;Last updated&rdquo; date at the top will
            be revised. Since we collect no personal data, changes are unlikely to affect you.
          </P>
        </Section>

        <Section>
          <H2>9. Contact</H2>
          <P>
            Questions about this privacy policy? Open an issue on the{' '}
            <a
              href="https://github.com/rgforms/rgforms"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-accent)' }}
              className="underline hover:no-underline"
            >
              rgforms GitHub repository
            </a>
            .
          </P>
        </Section>

        {/* Footer nav */}
        <div
          className="pt-4 border-t flex items-center gap-4"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <Link
            href="/"
            className="text-sm"
            style={{ color: 'var(--color-accent)' }}
          >
            ← Back to rgforms
          </Link>
          <Link
            href="/how-it-works"
            className="text-sm nav-link"
          >
            How it works
          </Link>
        </div>

      </article>
    </main>
  );
}
