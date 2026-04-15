'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '@/context/AppContext';
import { generateReadSnippet, generateWriteSnippet, generateSchemaReference } from '@/lib/contentSnippet';
import { GoogleSheetsIcon, GoogleAppsScriptIcon } from '@/components/google-icons';
import CopyBlock from '@/components/CopyBlock';

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 8.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="7" cy="9.5" r="1" fill="currentColor"/>
    </svg>
  );
}

// ─── TabButton ────────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  children,
  warning,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      style={{
        background: active ? (warning ? 'oklch(0.62 0.22 25 / 0.12)' : 'var(--color-accent-subtle)') : 'transparent',
        color: active ? (warning ? 'oklch(0.72 0.16 25)' : 'var(--color-accent)') : 'var(--color-muted)',
        border: `1px solid ${active ? (warning ? 'oklch(0.62 0.22 25 / 0.35)' : 'var(--color-accent-border)') : 'transparent'}`,
      }}
    >
      {warning && <LockIcon />}
      {children}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = 'read' | 'write' | 'schema';

export default function ContentResultPanel() {
  const { state, dispatch } = useApp();
  const result   = state.contentResult!;
  const config   = state.contentModuleConfig;

  const [tab, setTab] = useState<Tab>('read');
  const [tokenRevealed, setTokenRevealed] = useState(false);

  const readSnippet   = generateReadSnippet(result, config);
  const writeSnippet  = generateWriteSnippet(result, config);
  const schemaRef     = generateSchemaReference(config);

  return (
    <motion.main
      className="min-h-screen flex flex-col px-4 py-10"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">

        {/* Success header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'oklch(0.72 0.18 145 / 0.12)', border: '1px solid oklch(0.72 0.18 145 / 0.30)', color: 'oklch(0.72 0.18 145)' }}
            >
              <CheckIcon />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                  {config.name} is live
                </h1>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background: 'oklch(0.78 0.18 75 / 0.12)', color: 'oklch(0.78 0.18 75)', border: '1px solid oklch(0.78 0.18 75 / 0.30)' }}
                >
                  Beta
                </span>
              </div>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Your content API is deployed. Manage content by editing the Google Sheet below.
              </p>
            </div>
          </div>

          {/* Step checklist */}
          <div
            className="rounded-xl border p-4 flex flex-col gap-2"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {[
              'Google Sheet created with your column schema',
              'Apps Script deployed as a public HTTPS endpoint',
              'Read API active — doGet() with filtering, sorting, pagination',
              'Write API active — doPost() with create / update / delete',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <span style={{ color: 'oklch(0.72 0.18 145)' }} className="shrink-0 mt-0.5">
                  <CheckIcon />
                </span>
                <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Endpoint URL */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            API endpoint
          </p>
          <CopyBlock label="endpoint" content={result.deploymentUrl} language="text" />
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            This is your public read endpoint. Add it as your RGContent constructor URL.
          </p>
        </div>

        {/* Authorize callout */}
        <div
          className="rounded-xl border p-4 flex flex-col gap-2 text-sm leading-relaxed"
          style={{ background: 'oklch(0.78 0.18 75 / 0.06)', borderColor: 'oklch(0.78 0.18 75 / 0.25)', color: 'var(--color-muted)' }}
        >
          <p>
            <strong style={{ color: 'var(--color-text)' }}>One-time authorization required.</strong>{' '}
            Before the API responds to requests, visit the endpoint URL above while signed in to Google and approve the permissions dialog.
            This only needs to be done once.
          </p>
          <a
            href={result.deploymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start text-xs font-medium underline hover:no-underline"
            style={{ color: 'var(--color-accent)' }}
          >
            Open endpoint to authorize →
          </a>
        </div>

        {/* Code snippets */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              Integration code
            </p>
            <div className="flex items-center gap-1.5">
              <TabButton active={tab === 'read'}   onClick={() => setTab('read')}>Read API</TabButton>
              <TabButton active={tab === 'write'}  onClick={() => setTab('write')} warning>Write API</TabButton>
              <TabButton active={tab === 'schema'} onClick={() => setTab('schema')}>Schema</TabButton>
            </div>
          </div>

          {tab === 'read' && (
            <div className="flex flex-col gap-3">
              <CopyBlock label="Read snippet" content={readSnippet} language="js" />
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                The <code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--color-surface-2)' }}>RGContent</code> class
                is safe to use in public client-side code — it contains no secrets.
                Results are cached in memory per URL to avoid redundant fetches.
              </p>
            </div>
          )}

          {tab === 'write' && (
            <div className="flex flex-col gap-3">
              {/* Security warning */}
              <div
                className="rounded-xl border p-4 flex items-start gap-3 text-sm leading-relaxed"
                style={{ background: 'oklch(0.62 0.22 25 / 0.08)', borderColor: 'oklch(0.62 0.22 25 / 0.30)', color: 'oklch(0.72 0.16 25)' }}
              >
                <LockIcon />
                <div className="flex flex-col gap-1">
                  <strong>Keep your write token private.</strong>
                  <p className="text-xs">
                    Do not embed <code className="font-mono text-xs px-0.5">WRITE_TOKEN</code> in public client-side code.
                    Use write operations from a server, a private admin page, or a local script only.
                    Anyone who has the token can create, update, and delete records.
                  </p>
                  <button
                    type="button"
                    onClick={() => setTokenRevealed(true)}
                    className={`self-start text-xs font-medium underline hover:no-underline mt-1 ${tokenRevealed ? 'hidden' : ''}`}
                  >
                    I understand — show token
                  </button>
                </div>
              </div>

              {tokenRevealed && (
                <>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>Write token</p>
                    <CopyBlock label="write token" content={result.writeToken} language="text" />
                  </div>
                  <CopyBlock label="Write API" content={writeSnippet} language="js" />
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    Write operations use <code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--color-surface-2)' }}>application/x-www-form-urlencoded</code> POST
                    so no CORS preflight is triggered — calls work from any origin without extra headers.
                  </p>
                </>
              )}
            </div>
          )}

          {tab === 'schema' && (
            <div className="flex flex-col gap-3">
              <CopyBlock label="Schema" content={schemaRef} language="js" />
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Field keys are the normalized column names used in the API. The Sheet uses the original
                labels as column headers — the script normalizes them automatically.
              </p>
            </div>
          )}
        </div>

        {/* Sheet / Script links */}
        <div className="flex flex-wrap gap-3">
          <a
            href={result.sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)';
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)';
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)';
            }}
          >
            <GoogleSheetsIcon className="w-4 h-4 shrink-0" />
            Open Google Sheet
          </a>
          <a
            href={result.scriptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)';
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)';
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)';
            }}
          >
            <GoogleAppsScriptIcon className="w-4 h-4 shrink-0" />
            View Apps Script
          </a>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => dispatch({ type: 'GO_TO_CONTENT_BUILDER' })}
            className="flex-1 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          >
            New module
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET_CONTENT' })}
            className="flex-[2] py-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
          >
            Back to dashboard
          </button>
        </div>
      </div>
    </motion.main>
  );
}
