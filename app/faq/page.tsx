import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions',
  description:
    'Answers to common RG Forms questions: the "app isn\'t verified" warning, script authorization, email notification limits, spam protection, CORS, and data ownership.',
  alternates: { canonical: 'https://rgforms.com/faq/' },
  openGraph: {
    title: 'RG Forms — Frequently Asked Questions',
    description:
      'The unverified-app warning, script authorization, email limits, spam protection, and data ownership — answered in plain English.',
    url: 'https://rgforms.com/faq/',
  },
};

const FAQS: Array<{ q: string; a: React.ReactNode; aText: string }> = [
  {
    q: 'What is RG Forms?',
    aText:
      'RG Forms creates a live contact form endpoint backed entirely by your own Google account. It provisions a Google Sheet, a Drive folder, and a Google Apps Script web app in about 90 seconds — then your website POSTs submissions straight to that endpoint. There is no RG Forms server involved: submissions go from your visitor directly to your own Apps Script and land in your own Sheet.',
    a: (
      <>
        RG Forms creates a live contact form endpoint backed entirely by your own Google account. It
        provisions a Google Sheet, a Drive folder, and a Google Apps Script web app in about 90
        seconds — then your website POSTs submissions straight to that endpoint. There is no RG
        Forms server involved: submissions go from your visitor directly to your own Apps Script and
        land in your own Sheet.
      </>
    ),
  },
  {
    q: 'Is RG Forms really free? What’s the catch?',
    aText:
      'Yes — completely free and open source, with no paid tier. There is no catch because there is nothing for us to host: RG Forms is a static site that sets things up inside your Google account, and Google hosts your Sheet and Apps Script endpoint for free. Your endpoint keeps working even if rgforms.com disappears.',
    a: (
      <>
        Yes — completely free and open source, with no paid tier. There is no catch because there is
        nothing for us to host: RG Forms is a static site that sets things up inside your Google
        account, and Google hosts your Sheet and Apps Script endpoint for free. Your endpoint keeps
        working even if rgforms.com disappears.
      </>
    ),
  },
  {
    q: 'Why does Google say “This app isn’t verified” when I authorize my script?',
    aText:
      'The "app" in that warning is your own Apps Script — the form handler RG Forms just created inside your Google account — not RG Forms itself. Google shows this screen for any script that requests sensitive permissions (sending email, contacting an external service) and hasn\'t gone through Google\'s app-verification program. A personal script created minutes ago is naturally unverified, so the warning is expected. It is safe to proceed because you are granting your own script access to your own account, and you can read its code in the Apps Script editor. Click Advanced, then "Go to <project name> (unsafe)", then Allow.',
    a: (
      <>
        The &ldquo;app&rdquo; in that warning is <strong>your own Apps Script</strong> — the form
        handler RG Forms just created inside your Google account — not RG Forms itself. Google shows
        this screen for any script that requests sensitive permissions (sending email, contacting an
        external service) and hasn&apos;t gone through Google&apos;s app-verification program. A
        personal script created minutes ago is naturally unverified, so the warning is expected. It
        is safe to proceed because you are granting your own script access to your own account, and
        you can read its code in the Apps Script editor. Click <strong>Advanced</strong>, then{' '}
        <strong>Go to &lt;project name&gt; (unsafe)</strong>, then <strong>Allow</strong>.
      </>
    ),
  },
  {
    q: 'Why do I have to authorize the script at all?',
    aText:
      'Google requires a one-time manual authorization for any Apps Script that was deployed programmatically. RG Forms cannot grant permissions on your behalf — only you, the account owner, can click Allow. Open your endpoint URL once in your browser while signed in to Google and approve the dialog. The script only asks for access to its one spreadsheet, plus email sending and/or external requests if you enabled those features.',
    a: (
      <>
        Google requires a one-time manual authorization for any Apps Script that was deployed
        programmatically. RG Forms cannot grant permissions on your behalf — only you, the account
        owner, can click Allow. Open your endpoint URL once in your browser while signed in to
        Google and approve the dialog. The script only asks for access to its one spreadsheet, plus
        email sending and/or external requests if you enabled those features.
      </>
    ),
  },
  {
    q: 'Setup failed saying Apps Script access needs to be enabled. What do I do?',
    aText:
      'Google requires you to opt in to the Apps Script API once per account before scripts can be created programmatically. Open script.google.com/home/usersettings, turn on "Google Apps Script API", then return to RG Forms and retry. It takes a few seconds and never needs to be done again.',
    a: (
      <>
        Google requires you to opt in to the Apps Script API once per account before scripts can be
        created programmatically. Open{' '}
        <a
          href="https://script.google.com/home/usersettings"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
          style={{ color: 'var(--color-accent-ink)' }}
        >
          script.google.com/home/usersettings
        </a>
        , turn on &ldquo;Google Apps Script API&rdquo;, then return to RG Forms and retry. It takes
        a few seconds and never needs to be done again.
      </>
    ),
  },
  {
    q: 'How do email notifications work, and how many emails can I send?',
    aText:
      'When enabled, your Apps Script emails every submission to your notification address from your own Google account, with optional CC, BCC, custom subject, sender name, and a reply-to mapped to the visitor\'s email field. Google caps Apps Script email at roughly 100 recipients per day on a free Gmail account and about 1,500 per day on a paid Google Workspace account. If the cap is hit, rows still get saved to your Sheet — only the notification is skipped.',
    a: (
      <>
        When enabled, your Apps Script emails every submission to your notification address from
        your own Google account, with optional CC, BCC, custom subject, sender name, and a reply-to
        mapped to the visitor&apos;s email field. Google caps Apps Script email at roughly{' '}
        <strong>100 recipients per day</strong> on a free Gmail account and about{' '}
        <strong>1,500 per day</strong> on a paid Google Workspace account. If the cap is hit, rows
        still get saved to your Sheet — only the notification is skipped.
      </>
    ),
  },
  {
    q: 'Should I enable email notifications and spam protection when creating the project?',
    aText:
      'Yes, if there\'s any chance you\'ll want them. Both can be added later, but adding them after creation redeploys the script with a new permission and requires re-authorizing it. Enabling at creation costs nothing: notifications only fire if an address is set, and Turnstile validation stays off until you switch it on from the dashboard.',
    a: (
      <>
        Yes, if there&apos;s any chance you&apos;ll want them. Both can be added later, but adding
        them after creation redeploys the script with a new permission and requires re-authorizing
        it. Enabling at creation costs nothing: notifications only fire if an address is set, and
        Turnstile validation stays off until you switch it on from the dashboard.
      </>
    ),
  },
  {
    q: 'Why must I POST with Content-Type: text/plain instead of application/json?',
    aText:
      'Sending application/json triggers a CORS preflight (an OPTIONS request), and Apps Script web apps cannot answer OPTIONS, so the browser blocks the request. text/plain is a "simple" content type that skips the preflight. Your body is still a JSON string — the script parses it normally.',
    a: (
      <>
        Sending <code>application/json</code> triggers a CORS preflight (an OPTIONS request), and
        Apps Script web apps cannot answer OPTIONS, so the browser blocks the request.{' '}
        <code>text/plain</code> is a &ldquo;simple&rdquo; content type that skips the preflight.
        Your body is still a JSON string — the script parses it normally.
      </>
    ),
  },
  {
    q: 'Can I add forms or edit fields later without breaking my endpoint?',
    aText:
      'Yes. Your script reads its configuration from a hidden _manifest tab in your Sheet on every request, so adding forms, editing fields, changing the notification address, or toggling spam protection takes effect immediately — no redeploy, and your endpoint URL never changes. Only adding a new permission (email or Turnstile capability) touches the deployment, and even that keeps the same URL.',
    a: (
      <>
        Yes. Your script reads its configuration from a hidden <code>_manifest</code> tab in your
        Sheet on every request, so adding forms, editing fields, changing the notification address,
        or toggling spam protection takes effect immediately — no redeploy, and your endpoint URL
        never changes. Only adding a new permission (email or Turnstile capability) touches the
        deployment, and even that keeps the same URL.
      </>
    ),
  },
  {
    q: 'How does spam protection work?',
    aText:
      'Two layers. A honeypot: a hidden _hp field that humans leave empty and bots fill in — the script silently discards those submissions while returning a fake success, so bots can\'t tell they were caught. And optionally Cloudflare Turnstile: you add the widget to your form, and the script verifies its token server-side with Cloudflare before saving anything. Turnstile validation is toggled from the dashboard and takes effect instantly.',
    a: (
      <>
        Two layers. A <strong>honeypot</strong>: a hidden <code>_hp</code> field that humans leave
        empty and bots fill in — the script silently discards those submissions while returning a
        fake success, so bots can&apos;t tell they were caught. And optionally{' '}
        <strong>Cloudflare Turnstile</strong>: you add the widget to your form, and the script
        verifies its token server-side with Cloudflare before saving anything. Turnstile validation
        is toggled from the dashboard and takes effect instantly.
      </>
    ),
  },
  {
    q: 'Can RG Forms see my submissions or my Google Drive?',
    aText:
      'No. RG Forms has no server and no database — your OAuth token lives only in your browser\'s memory during setup, and the drive.file permission only covers files the app itself created. Submissions travel from your visitor\'s browser directly to your Apps Script endpoint and into your Sheet; they never pass through anything RG Forms operates.',
    a: (
      <>
        No. RG Forms has no server and no database — your OAuth token lives only in your
        browser&apos;s memory during setup, and the <code>drive.file</code> permission only covers
        files the app itself created. Submissions travel from your visitor&apos;s browser directly
        to your Apps Script endpoint and into your Sheet; they never pass through anything RG Forms
        operates.
      </>
    ),
  },
  {
    q: 'Can an AI assistant wire up my form for me?',
    aText:
      'Yes. The dashboard exports RGFORMS.md — a skill file containing your endpoint URL, every form\'s exact field keys, and the calling conventions — that you can drop into any project for Claude Code, Cursor, Copilot, Windsurf, or any other AI IDE. There\'s also a machine-readable overview of the whole product at rgforms.com/llms.txt.',
    a: (
      <>
        Yes. The dashboard exports <strong>RGFORMS.md</strong> — a skill file containing your
        endpoint URL, every form&apos;s exact field keys, and the calling conventions — that you can
        drop into any project for Claude Code, Cursor, Copilot, Windsurf, or any other AI IDE.
        There&apos;s also a machine-readable overview of the whole product at{' '}
        <a href="/llms.txt" className="underline hover:no-underline" style={{ color: 'var(--color-accent-ink)' }}>
          rgforms.com/llms.txt
        </a>
        .
      </>
    ),
  },
  {
    q: 'My endpoint URL is showing up in Google search results. How do I stop that?',
    aText:
      'Endpoints created before August 2026 served a small HTML confirmation page at the bare script URL, and because Apps Script cannot serve a robots.txt, a noindex tag, or a non-200 status, Google could index that page. New endpoints return a plain JSON response ({"ok":true}) at the bare URL instead, which search engines don\'t index as a page, and serve the confirmation page only at ?setup=1. To update an existing endpoint: open your project\'s script editor from the dashboard, find the doGet function, and move the HTML branch behind a check for e.parameter.setup === \'1\', returning ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON) otherwise. Then Deploy → Manage deployments → edit the active deployment → New version → Deploy (this keeps your URL the same). Your form action URL and doPost submissions are unaffected. Once the live response has changed, use Google Search Console → Removals → Outdated content to clear the already-indexed result.',
    a: (
      <>
        Endpoints created before August 2026 served a small HTML confirmation page at the bare
        script URL, and because Apps Script cannot serve a robots.txt, a noindex tag, or a non-200
        status, Google could index that page. New endpoints return a plain JSON response
        (<code>{'{"ok":true}'}</code>) at the bare URL instead — which search engines don&apos;t
        index as a page — and serve the confirmation page only at <code>?setup=1</code>. To update
        an existing endpoint: open your project&apos;s script editor from the dashboard, find the{' '}
        <code>doGet</code> function, and move the HTML branch behind a check for{' '}
        <code>e.parameter.setup === &apos;1&apos;</code>, returning{' '}
        <code>ContentService.createTextOutput(JSON.stringify({'{ ok: true }'})).setMimeType(ContentService.MimeType.JSON)</code>{' '}
        otherwise. Then <strong>Deploy → Manage deployments → edit the active deployment → New
        version → Deploy</strong> — this keeps your URL the same. Your form action URL and{' '}
        <code>doPost</code> submissions are unaffected. Once the live response has changed, use{' '}
        <strong>Google Search Console → Removals → Outdated content</strong> to clear the
        already-indexed result.
      </>
    ),
  },
];

export default function FaqPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(({ q, aText }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: aText },
    })),
  };

  return (
    <main
      className="min-h-screen px-4 py-16"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
            FAQ
          </div>
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
          >
            Frequently Asked Questions
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Straight answers about how RG Forms works — verification warnings, email limits, spam
            protection, and who owns your data. For the full walkthrough, see{' '}
            <Link href="/how-it-works" className="underline hover:no-underline" style={{ color: 'var(--color-accent-ink)' }}>
              how it works
            </Link>
            , or the{' '}
            <Link href="/guides" className="underline hover:no-underline" style={{ color: 'var(--color-accent-ink)' }}>
              guides
            </Link>{' '}
            for per-host and per-framework setups.
          </p>
        </header>

        {/* Questions */}
        <div className="flex flex-col gap-8">
          {FAQS.map(({ q, a }) => (
            <section key={q} className="flex flex-col gap-2">
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                {q}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                {a}
              </p>
            </section>
          ))}
        </div>

        {/* Footer nav */}
        <div
          className="pt-4 border-t flex items-center gap-4"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <Link href="/" className="text-sm" style={{ color: 'var(--color-accent)' }}>
            ← Back to RG Forms
          </Link>
          <Link href="/how-it-works" className="text-sm nav-link">
            How it works
          </Link>
          <Link href="/guides" className="text-sm nav-link">
            Guides
          </Link>
          <Link href="/contact" className="text-sm nav-link">
            Contact
          </Link>
        </div>

      </article>
    </main>
  );
}
