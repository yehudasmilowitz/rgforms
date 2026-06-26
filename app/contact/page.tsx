'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

const ENDPOINT =
  'https://script.google.com/macros/s/AKfycbyKrCLs04CJv_BZcz558YLV2gfhZwMl2eqyKIUYS9Xc9IMxhd6LNBjVZT_9QkliHRcH/exec';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          tab: 'contact',
          fields: { name, email, phone, message, _hp: honeypot },
        }),
      });
      const data = await res.json();
      if (data.result === 'success') {
        setStatus('success');
        setName(''); setEmail(''); setPhone(''); setMessage('');
      } else {
        throw new Error(data.error ?? 'Unknown error');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  const inputClass =
    'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-subtle)]';
  const inputStyle = { borderColor: 'var(--color-border)' };
  const labelClass = 'block text-sm font-medium mb-1.5';

  return (
    <main
      className="min-h-screen px-4 py-16"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <div className="w-full max-w-lg mx-auto flex flex-col gap-10">

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
            Get in touch
          </div>
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
          >
            Contact Us
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Have a question, a bug report, or just want to say hello? We&apos;d love to hear from you.
          </p>
        </header>

        {status === 'success' ? (
          <div
            className="rounded-xl border p-6 flex flex-col items-center gap-3 text-center"
            style={{ background: 'var(--color-success-bg)', borderColor: 'var(--color-success-border)' }}
          >
            <CheckCircle size={32} style={{ color: 'var(--color-success)' }} />
            <p className="font-semibold" style={{ color: 'var(--color-text)' }}>Message sent!</p>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              Thanks for reaching out. We&apos;ll get back to you as soon as we can.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-2 text-sm underline hover:no-underline"
              style={{ color: 'var(--color-accent)' }}
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {/* Honeypot */}
            <input
              type="text"
              name="_hp"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              style={{ display: 'none' }}
              tabIndex={-1}
              aria-hidden="true"
            />

            <div>
              <label htmlFor="name" className={labelClass} style={{ color: 'var(--color-text)' }}>
                Name <span style={{ color: 'var(--color-accent)' }}>*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClass} style={{ color: 'var(--color-text)' }}>
                Email <span style={{ color: 'var(--color-accent)' }}>*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="phone" className={labelClass} style={{ color: 'var(--color-text)' }}>
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="message" className={labelClass} style={{ color: 'var(--color-text)' }}>
                Message <span style={{ color: 'var(--color-accent)' }}>*</span>
              </label>
              <textarea
                id="message"
                required
                rows={5}
                placeholder="Tell us what's on your mind…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={inputClass}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {status === 'error' && (
              <div
                className="flex items-start gap-2 rounded-lg border px-4 py-3"
                style={{ background: 'var(--color-error-bg)', borderColor: 'var(--color-error-border)' }}
              >
                <AlertCircle size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--color-error)' }} />
                <p className="text-sm" style={{ color: 'var(--color-error)' }}>{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-opacity disabled:opacity-60"
              style={{ background: 'var(--color-accent)', color: '#fff' }}
            >
              {status === 'submitting' ? (
                <>
                  <span
                    className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                    aria-hidden="true"
                  />
                  Sending…
                </>
              ) : (
                <>
                  <Send size={15} />
                  Send message
                </>
              )}
            </button>

            <p className="text-center text-xs" style={{ color: 'var(--color-subtle)' }}>
              Powered by{' '}
              <Link href="/" className="underline hover:no-underline" style={{ color: 'var(--color-subtle)' }}>
                RG Forms
              </Link>
            </p>
          </form>
        )}

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
          <Link href="/privacy" className="text-sm nav-link">
            Privacy
          </Link>
        </div>

      </div>
    </main>
  );
}
