import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Sheetspin terms of service. Free to use, no warranty, no liability. Plain-English terms for an AI-powered, zero-backend website backend builder.',

  robots: { index: false, follow: false },
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

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            Last updated: April 2026
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
            Sheetspin is free to use. We provide the service as-is with no warranties. You are
            responsible for the site modules you create, the data collected through them, and
            any content generated with AI features. Don&apos;t use Sheetspin for anything illegal or harmful.
          </p>
        </div>

        <Section>
          <H2>1. Acceptance of terms</H2>
          <P>
            By accessing or using Sheetspin (&ldquo;the Service&rdquo;), you agree to be bound by
            these Terms of Service. If you do not agree to these terms, do not use the Service.
          </P>
        </Section>

        <Section>
          <H2>2. Description of the service</H2>
          <P>
            Sheetspin is a free web application that uses AI to design and provision complete website backends — forms, content modules, galleries, newsletters, and more — backed by your own Google Drive infrastructure. A single Google Sheet and Google Apps Script deployment serve as your site&apos;s live API. Most operations run entirely in your browser; AI-powered features (site structure proposals and data seeding) route through a lightweight server-side endpoint that forwards requests to Google&apos;s Gemini API and returns the response without storing anything.
          </P>
          <P>
            The resources created by the Service (Google Sheets, Apps Script projects) are
            created in your Google account and are owned and governed by you.
          </P>
        </Section>

        <Section>
          <H2>3. Google account and OAuth</H2>
          <P>
            Using Sheetspin requires you to authenticate with a Google account via OAuth 2.0.
            By signing in, you authorize Sheetspin to act on your behalf to create and manage
            specific Google Drive resources. The exact permissions requested are described in
            our{' '}
            <Link
              href="/privacy"
              className="underline hover:no-underline"
              style={{ color: 'var(--color-accent)' }}
            >
              Privacy Policy
            </Link>
            .
          </P>
          <P>
            Your use of Google&apos;s services is subject to Google&apos;s own{' '}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
              style={{ color: 'var(--color-accent)' }}
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
              style={{ color: 'var(--color-accent)' }}
            >
              Privacy Policy
            </a>
            .
          </P>
        </Section>

        <Section>
          <H2>4. Acceptable use</H2>
          <P>
            You agree not to use Sheetspin to:
          </P>
          <ul className="flex flex-col gap-2 list-none">
            {[
              'Collect personal data without appropriate consent or legal basis',
              'Create forms designed to deceive, defraud, or phish users',
              'Violate any applicable law or regulation',
              'Infringe the intellectual property rights of any third party',
              'Attempt to reverse engineer, exploit, or disrupt the Service',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span
                  className="mt-1 shrink-0 text-xs"
                  style={{ color: 'var(--color-muted)' }}
                  aria-hidden="true"
                >
                  —
                </span>
                <span className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section>
          <H2>4a. AI-generated content</H2>
          <P>
            Sheetspin offers AI-powered features (site structure proposals and data seeding) powered by Google&apos;s Gemini API. You are responsible for reviewing AI-generated content before use. Sheetspin makes no guarantees about the accuracy, completeness, or suitability of AI-generated module structures or sample data. You must not rely on AI-generated data as a substitute for real data in production contexts.
          </P>
        </Section>

        <Section>
          <H2>5. Your responsibilities</H2>
          <P>
            You are solely responsible for the forms you create using Sheetspin, the content of
            those forms, and any data collected through them. If your forms collect personal
            information from visitors, you are responsible for complying with applicable privacy
            laws (such as GDPR, CCPA, or other regulations) and for maintaining an accurate
            privacy policy on your own website.
          </P>
          <P>
            You are also responsible for the security of the Google Drive resources created
            on your behalf. Sheetspin cannot access or manage these resources after they are
            created, except through actions you initiate while signed in.
          </P>
        </Section>

        <Section>
          <H2>6. No warranty</H2>
          <P>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
            warranties of any kind, either express or implied. Sheetspin makes no warranty that
            the Service will be uninterrupted, error-free, or that defects will be corrected.
            We do not warrant that the Service will meet your requirements.
          </P>
        </Section>

        <Section>
          <H2>7. Limitation of liability</H2>
          <P>
            To the fullest extent permitted by law, Sheetspin and its operators shall not be
            liable for any indirect, incidental, special, consequential, or punitive damages
            arising out of or related to your use of the Service, including but not limited to
            loss of data, loss of revenue, or service interruptions — even if advised of the
            possibility of such damages.
          </P>
        </Section>

        <Section>
          <H2>8. Intellectual property</H2>
          <P>
            The Sheetspin name, logo, and branding are the property of RG Marketing Group. Forms
            and content you create using the Service belong to you.
          </P>
        </Section>

        <Section>
          <H2>9. Changes to these terms</H2>
          <P>
            We may update these Terms of Service from time to time. The &ldquo;Last updated&rdquo;
            date at the top of this page will reflect any changes. Continued use of the Service
            after changes are posted constitutes your acceptance of the revised terms.
          </P>
        </Section>

        <Section>
          <H2>10. Contact</H2>
          <P>
            Questions about these terms? Contact us at{' '}
            <a
              href="https://rgmarketinggroup.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-accent)' }}
              className="underline hover:no-underline"
            >
              RG Marketing Group
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
            ← Back to Sheetspin
          </Link>
          <Link
            href="/privacy"
            className="text-sm nav-link"
          >
            Privacy Policy
          </Link>
        </div>

      </article>
    </main>
  );
}
