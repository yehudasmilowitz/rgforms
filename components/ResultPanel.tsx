'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { generateEmbedSnippet } from '@/lib/snippetTemplate';

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="7" y="3" width="10" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7 5H5a2 2 0 00-2 2v9a2 2 0 002 2h8a2 2 0 002-2v-2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 10.5l4.5 4.5 7.5-8.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

export default function ResultPanel() {
  const { state, dispatch } = useApp();
  const { result, formConfig } = state;
  const [copied, setCopied] = useState(false);

  if (!result || !formConfig) return null;

  const snippet = generateEmbedSnippet(formConfig, result.deploymentUrl);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text in a textarea
      const ta = document.createElement('textarea');
      ta.value = snippet;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

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

        {/* Code block with copy button */}
        <div
          className="relative rounded-xl overflow-hidden border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {/* Code block header bar */}
          <div
            className="flex items-center justify-between px-4 py-2.5 border-b"
            style={{
              background: '#161b22',
              borderColor: 'var(--color-border)',
            }}
          >
            <span className="text-xs font-mono" style={{ color: 'var(--color-muted)' }}>
              embed.html
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 focus:outline-none focus:ring-2"
              style={{
                background: copied ? 'rgba(34,197,94,0.15)' : 'var(--color-surface-2)',
                color: copied ? 'var(--color-success)' : 'var(--color-text)',
                border: `1px solid ${copied ? 'rgba(34,197,94,0.35)' : 'var(--color-border)'}`,
              }}
              aria-label={copied ? 'Copied to clipboard' : 'Copy embed snippet'}
            >
              {copied ? (
                <>
                  <CheckIcon className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <ClipboardIcon className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Syntax-highlighted code area */}
          <div
            className="overflow-x-auto"
            style={{ background: '#0d1117' }}
          >
            <pre
              className="p-5 text-xs leading-relaxed font-mono whitespace-pre"
              style={{ color: '#e6edf3', tabSize: 2 }}
              aria-label="Embed snippet"
            >
              <code>{snippet}</code>
            </pre>
          </div>
        </div>

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
