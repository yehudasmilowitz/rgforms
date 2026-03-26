'use client';

import { useState } from 'react';
import type { FormField } from '@/types';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

function fieldKey(field: FormField): string {
  return field.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
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

export default function TryItOut({
  fields,
  deploymentUrl,
}: {
  fields: FormField[];
  deploymentUrl: string;
}) {
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
    fields.forEach((f) => params.append(fieldKey(f), values[fieldKey(f)] ?? ''));
    try {
      const res = await fetch(deploymentUrl, { method: 'POST', body: params });
      const data = res.ok ? await res.json().catch(() => null) : null;
      if (data?.result === 'success') {
        setSubmitState('success');
        setValues({});
      } else {
        setSubmitState('error');
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
                const name = fieldKey(field);
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
                  Submission failed. Make sure you&apos;ve authorized your script first.
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
