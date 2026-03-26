'use client';

import { useState } from 'react';
import { generateEmbedSnippet } from '@/lib/snippetTemplate';
import type { FormField, FormSummary } from '@/types';

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="7" y="3" width="10" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 5H5a2 2 0 00-2 2v9a2 2 0 002 2h8a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 10.5l4.5 4.5 7.5-8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

function fieldName(field: FormField): string {
  return field.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

// ---------------------------------------------------------------------------
// CopyBlock — dark code block with copy button
// ---------------------------------------------------------------------------

function CopyBlock({ label, content }: { label: string; content: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = content;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ background: '#161b22', borderColor: 'var(--color-border)' }}
      >
        <span className="text-xs font-mono" style={{ color: 'var(--color-muted)' }}>
          {label}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 focus:outline-none"
          style={{
            background: copied ? 'rgba(34,197,94,0.15)' : 'var(--color-surface-2)',
            color: copied ? 'var(--color-success)' : 'var(--color-text)',
            border: `1px solid ${copied ? 'rgba(34,197,94,0.35)' : 'var(--color-border)'}`,
          }}
          aria-label={copied ? 'Copied' : 'Copy'}
        >
          {copied ? (
            <><CheckIcon className="w-3.5 h-3.5" />Copied!</>
          ) : (
            <><ClipboardIcon className="w-3.5 h-3.5" />Copy</>
          )}
        </button>
      </div>
      <div className="overflow-x-auto" style={{ background: '#0d1117' }}>
        <pre
          className="p-5 text-xs leading-relaxed font-mono whitespace-pre"
          style={{ color: '#e6edf3', tabSize: 2 }}
        >
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TryItOut
// ---------------------------------------------------------------------------

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

function TryItOut({ fields, deploymentUrl }: { fields: FormField[]; deploymentUrl: string }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  function handleChange(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitState('submitting');
    const params = new URLSearchParams();
    fields.forEach((f) => params.append(fieldName(f), values[fieldName(f)] ?? ''));
    try {
      const res = await fetch(deploymentUrl, { method: 'POST', body: params });
      const data = await res.json();
      if (data?.result === 'success') {
        setSubmitState('success');
        setValues({});
      } else {
        setSubmitState('error');
      }
    } catch {
      // Non-JSON body (e.g. Google auth redirect HTML) or network error
      setSubmitState('error');
    }
  }

  function handleReset() {
    setSubmitState('idle');
    setValues({});
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '0.5rem',
    color: 'var(--color-text)',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none',
  };

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors"
        style={{ background: 'var(--color-surface)' }}
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{
              background: 'rgba(108,99,255,0.15)',
              border: '1px solid rgba(108,99,255,0.3)',
              color: 'var(--color-accent)',
            }}
          >
            Live
          </span>
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Try it out
          </span>
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
            — submit a real test entry
          </span>
        </div>
        <svg
          className="w-4 h-4 transition-transform"
          style={{ color: 'var(--color-muted)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="p-6 flex flex-col gap-5 border-t"
          style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            This will submit a real entry to your Google Sheet and trigger an email notification.
          </p>

          {submitState === 'success' ? (
            <div
              className="flex flex-col items-center gap-3 py-6 rounded-xl border text-center"
              style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.25)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M4 10.5l4.5 4.5 7.5-8.5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-success)' }}>
                Submission sent!
              </p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Check your Google Sheet and inbox for the test entry.
              </p>
              <button
                onClick={handleReset}
                className="mt-1 px-4 py-1.5 rounded-lg text-xs font-medium border"
                style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
              >
                Submit another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {fields.map((field) => {
                const name = fieldName(field);
                return (
                  <div key={field.id} className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
                      {field.label}
                      {field.required && <span className="ml-1" style={{ color: 'var(--color-error)' }}>*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        name={name}
                        value={values[name] ?? ''}
                        onChange={(e) => handleChange(name, e.target.value)}
                        required={field.required}
                        rows={3}
                        style={inputStyle}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        name={name}
                        value={values[name] ?? ''}
                        onChange={(e) => handleChange(name, e.target.value)}
                        required={field.required}
                        style={inputStyle}
                      >
                        <option value="">Select {field.label}</option>
                        {(field.options ?? []).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        name={name}
                        value={values[name] ?? ''}
                        onChange={(e) => handleChange(name, e.target.value)}
                        required={field.required}
                        style={inputStyle}
                      />
                    )}
                  </div>
                );
              })}

              {submitState === 'error' && (
                <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                  Submission failed. Make sure you&apos;ve authorized the script first.
                </p>
              )}

              <button
                type="submit"
                disabled={submitState === 'submitting'}
                className="self-start px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity"
                style={{
                  background: 'var(--color-accent)',
                  color: '#fff',
                  opacity: submitState === 'submitting' ? 0.6 : 1,
                  cursor: submitState === 'submitting' ? 'not-allowed' : 'pointer',
                }}
              >
                {submitState === 'submitting' ? 'Sending…' : 'Submit test entry'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
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

  const snippet = hasDetails
    ? generateEmbedSnippet({ name: formName, notifyEmail: '', fields: fields! }, deploymentUrl!)
    : '';

  const curlExample = hasDetails
    ? `curl -X POST "${deploymentUrl}" \\\n  -d "${fields!.map((f) => `${fieldName(f)}=value`).join('&')}"`
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl border flex flex-col"
        style={{
          background: 'var(--color-bg)',
          borderColor: 'var(--color-border)',
          maxHeight: '90vh',
        }}
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
                <CopyBlock label="curl" content={curlExample} />
              </section>

              {/* Embed snippet */}
              <section className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                  Embed snippet
                </h3>
                <CopyBlock label="embed.html" content={snippet} />
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
