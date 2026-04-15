'use client';

/**
 * Shared error banner for all builder screens.
 * Pass the provision error string from AppContext state.
 * - 'apps-script-disabled' → yellow "one-time setup" banner with enable link
 * - anything else         → red generic error banner
 */
export default function ProvisionErrorBanner({ error }: { error: string | null }) {
  if (!error) return null;

  if (error === 'apps-script-disabled') {
    return (
      <div
        className="rounded-xl border p-4 flex items-start gap-3"
        style={{ background: 'rgba(234,179,8,0.06)', borderColor: 'rgba(234,179,8,0.3)' }}
      >
        <svg className="shrink-0 mt-0.5 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="rgb(202,138,4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            One setup step required
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            The <strong style={{ color: 'var(--color-text)' }}>Google Apps Script API</strong> needs
            to be enabled in your Google account. This is a one-time step.
          </p>
          <a
            href="https://script.google.com/home/usersettings"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold self-start mt-1"
            style={{ background: 'rgba(202,138,4,0.15)', color: 'rgb(202,138,4)', border: '1px solid rgba(234,179,8,0.4)' }}
          >
            Enable in Google settings
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M3.5 8.5l5-5M5 3.5h3.5v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border px-4 py-3 text-sm"
      style={{ background: 'oklch(0.62 0.22 25 / 0.08)', borderColor: 'oklch(0.62 0.22 25 / 0.30)', color: 'oklch(0.72 0.16 25)' }}
    >
      {error}
    </div>
  );
}
