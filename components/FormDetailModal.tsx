'use client';

import EmbedCodeBlock from '@/components/EmbedCodeBlock';
import CopyBlock from '@/components/CopyBlock';
import TryItOut from '@/components/TryItOut';
import type { FormField, FormSummary } from '@/types';

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M7 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10 2h4v4M14 2L8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fieldKey(field: FormField): string {
  return field.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

// ---------------------------------------------------------------------------
// AuthorizeBanner
// ---------------------------------------------------------------------------

function AuthorizeBanner({ deploymentUrl }: { deploymentUrl: string }) {
  return (
    <div className="flex items-center gap-3 flex-wrap px-1">
      <svg className="w-3.5 h-3.5 shrink-0 opacity-60" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 1.5L1.5 14h13L8 1.5z" stroke="#eab308" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M8 6.5v3M8 11.5v.5" stroke="#eab308" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
        Script may need a one-time authorization —
      </span>
      <a
        href={deploymentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-80"
        style={{ color: '#eab308' }}
      >
        Authorize script
        <ExternalLinkIcon className="w-3 h-3" />
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FormDetailModal
// ---------------------------------------------------------------------------

interface FormDetailModalProps {
  form: FormSummary;
  onClose: () => void;
}

export default function FormDetailModal({ form, onClose }: FormDetailModalProps) {
  const { deploymentUrl, fields, formName } = form;
  const hasDetails = !!(deploymentUrl && fields?.length);

  const embedConfig = hasDetails
    ? { name: formName, notifyEmail: '', fields: fields!, enableHoneypot: form.enableHoneypot }
    : null;

  const curlExample = hasDetails
    ? `curl -X POST "${deploymentUrl}" \\\n  -d "${fields!.map((f) => `${fieldKey(f)}=value`).join('&')}"`
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl border flex flex-col"
        style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2 className="text-base font-semibold truncate" style={{ color: 'var(--color-text)' }}>
            {formName}
          </h2>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg ml-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ color: 'var(--color-muted)' }}
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex flex-col gap-6 p-6">
          {!hasDetails ? (
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              Details are not available for this form. It may have been created before field data was stored.
            </p>
          ) : (
            <>
              {/* Endpoint */}
              <section className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                  Endpoint
                </h3>
                <CopyBlock label="curl" content={curlExample} language="shell" />
              </section>

              {/* Embed snippet */}
              <section className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                  Embed snippet
                </h3>
                {embedConfig && (
                  <EmbedCodeBlock formConfig={embedConfig} deploymentUrl={deploymentUrl!} />
                )}
              </section>

              {/* Try it out */}
              <section>
                <TryItOut fields={fields!} deploymentUrl={deploymentUrl!} />
              </section>

              {/* Authorization */}
              <section>
                <AuthorizeBanner deploymentUrl={deploymentUrl!} />
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
