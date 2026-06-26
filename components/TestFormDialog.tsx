'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SiteTab } from '@/types';
import { toFieldKey } from '@/lib/createSite';

interface Props {
  tab:       SiteTab;
  scriptUrl: string;
  onClose:   () => void;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function TestFormDialog({ tab, scriptUrl, onClose }: Props) {
  const fields = tab.formConfig?.fields ?? [];

  const [values,  setValues]  = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [toFieldKey(f.label), ''])),
  );
  const [status,  setStatus]  = useState<Status>('idle');
  const [errMsg,  setErrMsg]  = useState('');

  function handleChange(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrMsg('');

    try {
      const res = await fetch(scriptUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'text/plain' },
        body:    JSON.stringify({ tab: tab.name, fields: values }),
      });

      const json = await res.json().catch(() => ({ result: 'error', error: 'Invalid response' }));

      if (json.result === 'success') {
        setStatus('success');
      } else {
        setStatus('error');
        setErrMsg(json.error ?? 'Unknown error');
      }
    } catch (err) {
      setStatus('error');
      setErrMsg((err as Error).message);
    }
  }

  function handleReset() {
    setValues(Object.fromEntries(fields.map((f) => [toFieldKey(f.label), ''])));
    setStatus('idle');
    setErrMsg('');
  }

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(15,30,28,0.45)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          className="w-full max-w-md flex flex-col rounded-2xl overflow-hidden"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xl)' }}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18 }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-5 py-3.5 shrink-0"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <div className="flex-1 flex flex-col gap-0.5">
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                Test — {tab.label}
              </span>
              <span className="text-[10px] font-mono" style={{ color: 'var(--color-muted)' }}>
                POST → script_url
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
              style={{ color: 'var(--color-subtle)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-2)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-subtle)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-5 flex flex-col gap-5 overflow-auto max-h-[70vh]">

            {status === 'success' ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M4 10.5l4.5 4.5 8-9" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Submission successful</p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    The response was <code className="font-mono">&#123; result: &quot;success&quot; &#125;</code>. Check your Sheet for the new row.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg text-xs font-semibold"
                  style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}
                >
                  Test again
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {fields.length === 0 ? (
                  <p className="text-sm text-center py-6" style={{ color: 'var(--color-muted)' }}>
                    This form has no fields configured.
                  </p>
                ) : (
                  fields.map((field) => {
                    const key = toFieldKey(field.label);
                    const inputStyle = {
                      background: 'var(--color-bg)',
                      border:     '1px solid var(--color-border)',
                      color:      'var(--color-text)',
                    };
                    const inputClass = 'w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]';

                    return (
                      <div key={field.id} className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-text)' }}>
                          {field.label}
                          {field.required && <span style={{ color: 'var(--color-error)' }}>*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            value={values[key] ?? ''}
                            onChange={(e) => handleChange(key, e.target.value)}
                            required={field.required}
                            rows={3}
                            className={inputClass}
                            style={inputStyle}
                          />
                        ) : field.type === 'select' ? (
                          <select
                            value={values[key] ?? ''}
                            onChange={(e) => handleChange(key, e.target.value)}
                            required={field.required}
                            className={inputClass}
                            style={inputStyle}
                          >
                            <option value="">Select…</option>
                            {(field.options ?? []).map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            value={values[key] ?? ''}
                            onChange={(e) => handleChange(key, e.target.value)}
                            required={field.required}
                            className={inputClass}
                            style={inputStyle}
                          />
                        )}
                      </div>
                    );
                  })
                )}

                {status === 'error' && (
                  <div
                    className="rounded-lg px-3 py-2.5 text-xs"
                    style={{ background: 'var(--color-error-bg)', border: '1px solid var(--color-error-border)', color: 'var(--color-error)' }}
                  >
                    {errMsg || 'Submission failed. Check the script is deployed and authorized.'}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting' || fields.length === 0}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'var(--color-accent)', color: '#fff' }}
                >
                  {status === 'submitting' ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                        <path d="M12 2 A10 10 0 0 1 22 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Submitting…
                    </>
                  ) : 'Submit test'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
