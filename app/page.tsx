'use client';

import { useApp } from '@/context/AppContext';
import AuthButton from '@/components/AuthButton';
import FormBuilderScreen from '@/components/FormBuilder';
import ProvisioningSteps from '@/components/ProvisioningSteps';
import ResultPanel from '@/components/ResultPanel';

export default function Page() {
  const { state } = useApp();

  if (state.screen === 'builder') return <FormBuilderScreen />;
  if (state.screen === 'provisioning') return <ProvisioningSteps />;
  if (state.screen === 'result') return <ResultPanel />;

  // Landing screen
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* Hero */}
      <section className="w-full max-w-2xl flex flex-col items-center text-center gap-6">
        {/* Product name */}
        <h1
          className="text-5xl sm:text-6xl font-extrabold tracking-tight"
          style={{ color: 'var(--color-accent)' }}
        >
          rgforms
        </h1>

        {/* Tagline */}
        <p className="text-xl sm:text-2xl font-semibold leading-snug" style={{ color: 'var(--color-text)' }}>
          HTML contact forms in 2 minutes —{' '}
          <span style={{ color: 'var(--color-muted)' }}>no backend, no subscription</span>
        </p>

        {/* Subtitle */}
        <p className="text-base sm:text-lg leading-relaxed max-w-xl" style={{ color: 'var(--color-muted)' }}>
          Sign in with Google to auto-create a Google Sheet + Apps Script that handles your form
          submissions. Everything lives in your Drive.
        </p>

        {/* AuthButton */}
        <AuthButton className="mt-2" />

        {/* Scope explanations */}
        <div
          className="w-full rounded-xl border p-5 flex flex-col gap-4 text-left mt-2"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
            Permissions requested
          </p>

          <div className="flex items-start gap-3">
            <span className="text-xl leading-none mt-0.5" aria-hidden="true">📊</span>
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                Create a Google Sheet
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Stores your form submissions as rows — one sheet per form, owned by you.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl leading-none mt-0.5" aria-hidden="true">⚡</span>
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                Create an Apps Script
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Deploys a serverless{' '}
                <code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--color-surface-2)' }}>
                  doPost()
                </code>{' '}
                handler that receives submissions and sends email notifications.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl leading-none mt-0.5" aria-hidden="true">📁</span>
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                Access Drive files we create
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Reads and organizes only the Sheet and Script files rgforms creates — nothing else in your Drive.
              </p>
            </div>
          </div>
        </div>

        {/* Trust note */}
        <p className="text-xs leading-relaxed max-w-sm" style={{ color: 'var(--color-muted)' }}>
          We never store your data. Everything is created in your Google Drive. Tokens exist only in
          browser memory.
        </p>

        {/* Social proof */}
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          Automates the{' '}
          <a
            href="https://github.com/dwyl/learn-to-send-email-via-google-script-html-no-server"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline transition-colors"
            style={{ color: 'var(--color-accent)' }}
          >
            DWYL serverless form pattern
          </a>{' '}
          — trusted by 3,000+ developers
        </p>
      </section>
    </main>
  );
}
