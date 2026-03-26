'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import EmbedCodeBlock from '@/components/EmbedCodeBlock';
import type { FormField } from '@/types';

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 2h4v4M14 2L8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

function TryItOut({ fields, deploymentUrl }: { fields: FormField[]; deploymentUrl: string }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  function fieldName(field: FormField) {
    return field.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  function handleChange(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitState('submitting');
    const params = new URLSearchParams();
    fields.forEach((f) => {
      params.append(fieldName(f), values[fieldName(f)] ?? '');
    });
    try {
      const res = await fetch(deploymentUrl, { method: 'POST', body: params });
      if (!res.ok) {
        setSubmitState('error');
      } else {
        setSubmitState('success');
        setValues({});
      }
    } catch {
      setSubmitState('error');
    }
  }

  function handleReset() {
    setSubmitState('idle');
    setValues({});
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Toggle header */}
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
          style={{
            color: 'var(--color-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expandable form */}
      {open && (
        <div
          className="p-6 flex flex-col gap-5 border-t animate-fade-in"
          style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            This will submit a real entry to your Google Sheet and trigger an email notification.
            Use it to confirm everything is wired up correctly.
          </p>

          {submitState === 'success' ? (
            <div
              className="flex flex-col items-center gap-3 py-6 rounded-xl border text-center"
              style={{
                background: 'rgba(34,197,94,0.06)',
                borderColor: 'rgba(34,197,94,0.25)',
              }}
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
                style={{
                  background: 'transparent',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-muted)',
                }}
              >
                Submit another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {fields.map((field) => {
                const name = fieldName(field);
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
                  <div key={field.id} className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
                      {field.label}
                      {field.required && (
                        <span className="ml-1" style={{ color: 'var(--color-error)' }}>*</span>
                      )}
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
                  Submission failed. Make sure you&apos;ve authorized your script using the button above.
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

export default function ResultPanel() {
  const { state, dispatch } = useApp();
  const { result, formConfig } = state;

  if (!result || !formConfig) return null;

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <div className="w-full max-w-2xl flex flex-col gap-8 animate-slide-up">

        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold"
            style={{
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.35)',
              color: 'var(--color-success)',
            }}
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M2 7.5l3.5 3.5 6.5-6.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Your form is ready!
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center" style={{ color: 'var(--color-text)' }}>
            Embed your form
          </h1>
          <p className="text-sm text-center" style={{ color: 'var(--color-muted)' }}>
            Copy the snippet below and paste it anywhere in your HTML.
          </p>
        </div>

        {/* Authorization required callout */}
        <div
          className="rounded-xl border p-5 flex flex-col gap-4"
          style={{
            background: 'rgba(234,179,8,0.07)',
            borderColor: 'rgba(234,179,8,0.35)',
          }}
        >
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 2L2 17h16L10 2z" stroke="#eab308" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M10 8v4M10 14.5v.5" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold" style={{ color: '#eab308' }}>
                One more step — authorize your script
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                Google requires you to grant your script permission to write to Sheets and send email.
                Click the button below, sign in if prompted, and approve the permissions dialog.
                You only need to do this once.
              </p>
            </div>
          </div>
          <a
            href={result.deploymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity"
            style={{
              background: 'rgba(234,179,8,0.15)',
              border: '1px solid rgba(234,179,8,0.4)',
              color: '#eab308',
            }}
          >
            Authorize script
            <ExternalLinkIcon className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Embed code block — tabbed with syntax highlighting */}
        <EmbedCodeBlock formConfig={formConfig} deploymentUrl={result.deploymentUrl} />

        {/* Try it out */}
        <TryItOut fields={formConfig.fields} deploymentUrl={result.deploymentUrl} />

        {/* Setup instructions */}
        <div
          className="rounded-xl border p-6 flex flex-col gap-4"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
            How to use it
          </h2>
          <ol className="flex flex-col gap-3 list-none" aria-label="Setup instructions">
            {[
              'Copy the embed snippet above.',
              'Paste it into your HTML where you want the form to appear.',
              'When someone submits the form, responses go to your Google Sheet and you get an email notification.',
              'The form works immediately — no server configuration needed.',
            ].map((instruction, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0 mt-0.5"
                  style={{
                    background: 'var(--color-surface-2)',
                    color: 'var(--color-accent)',
                    border: '1px solid var(--color-border)',
                  }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                  {instruction}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Links section */}
        <div
          className="rounded-xl border p-6 flex flex-col gap-4"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
            Your resources
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={result.sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2"
              style={{
                background: 'var(--color-surface-2)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)';
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)';
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)';
              }}
            >
              <ExternalLinkIcon className="w-4 h-4 shrink-0" />
              Open my Google Sheet
            </a>
            <a
              href={result.scriptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2"
              style={{
                background: 'var(--color-surface-2)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)';
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)';
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)';
              }}
            >
              <ExternalLinkIcon className="w-4 h-4 shrink-0" />
              View Apps Script
            </a>
          </div>
        </div>

        {/* Email quota warning */}
        <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Google Apps Script limits email notifications to ~100/day on free accounts.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2"
            style={{
              background: 'var(--color-accent)',
              color: '#fff',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-hover)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)';
            }}
          >
            Create another form
          </button>
          <button
            onClick={() => dispatch({ type: 'SIGN_OUT' })}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2"
            style={{
              background: 'transparent',
              borderColor: 'var(--color-border)',
              color: 'var(--color-muted)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-muted)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)';
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}
