'use client';

import { useState } from 'react';
import { generateReadSnippet, generateWriteSnippet, generateSchemaReference, generateAgentInstructions } from '@/lib/contentSnippet';
import CopyBlock from '@/components/CopyBlock';
import type { ContentModuleSummary } from '@/types';

// ─── Icons ────────────────────────────────────────────────────────────────────

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

// ─── ContentModuleDetailModal ─────────────────────────────────────────────────

interface ContentModuleDetailModalProps {
  module: ContentModuleSummary;
  onClose: () => void;
}

type Tab = 'read' | 'write' | 'schema' | 'agent';

export default function ContentModuleDetailModal({ module, onClose }: ContentModuleDetailModalProps) {
  const [tab, setTab] = useState<Tab>('read');
  const [tokenRevealed, setTokenRevealed] = useState(false);

  const hasDetails = !!(module.deploymentUrl && module.fields?.length);

  // Adapt summary to the shapes the snippet generators expect
  const result = {
    sheetId: module.sheetId,
    sheetUrl: module.sheetUrl,
    scriptId: module.scriptId ?? '',
    scriptUrl: module.scriptUrl ?? '',
    deploymentUrl: module.deploymentUrl ?? '',
    writeToken: module.writeToken ?? '',
  };
  const config = {
    name: module.moduleName,
    fields: module.fields ?? [],
    hasSlug: module.hasSlug,
    hasPublished: module.hasPublished,
  };

  const readSnippet       = hasDetails ? generateReadSnippet(result, config)       : '';
  const writeSnippet      = hasDetails ? generateWriteSnippet(result, config)      : '';
  const schemaRef         = hasDetails ? generateSchemaReference(config)           : '';
  const agentInstructions = hasDetails ? generateAgentInstructions(result, config) : '';

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
            {module.moduleName}
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
              Details are not available for this module. It may have been created before field data was stored.
            </p>
          ) : (
            <>
              {/* Endpoint */}
              <section className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                  API endpoint
                </h3>
                <CopyBlock label="endpoint" content={result.deploymentUrl} language="text" />
                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                  <svg className="w-3.5 h-3.5 shrink-0 opacity-60" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 1.5L1.5 14h13L8 1.5z" stroke="#eab308" strokeWidth="1.3" strokeLinejoin="round" />
                    <path d="M8 6.5v3M8 11.5v.5" stroke="#eab308" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    Script may need a one-time authorization —
                  </span>
                  <a
                    href={result.deploymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium hover:opacity-80"
                    style={{ color: '#eab308' }}
                  >
                    Authorize script
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M3.5 8.5l5-5M5 3.5h3.5v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </section>

              {/* Code snippets */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                    Integration code
                  </h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <TabButton active={tab === 'read'}   onClick={() => setTab('read')}>Read API</TabButton>
                    <TabButton active={tab === 'write'}  onClick={() => setTab('write')} warning>Write API</TabButton>
                    <TabButton active={tab === 'schema'} onClick={() => setTab('schema')}>Schema</TabButton>
                    <TabButton active={tab === 'agent'}  onClick={() => setTab('agent')}>Agent</TabButton>
                  </div>
                </div>

                {tab === 'read' && (
                  <div className="flex flex-col gap-3">
                    <CopyBlock label="Read snippet" content={readSnippet} language="js" />
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      The <code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--color-surface-2)' }}>RGContent</code> class
                      is safe to use in public client-side code — it contains no secrets.
                    </p>
                  </div>
                )}

                {tab === 'write' && (
                  <div className="flex flex-col gap-3">
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
                        </p>
                        {!tokenRevealed && (
                          <button
                            type="button"
                            onClick={() => setTokenRevealed(true)}
                            className="self-start text-xs font-medium underline hover:no-underline mt-1"
                          >
                            I understand — show token
                          </button>
                        )}
                      </div>
                    </div>

                    {tokenRevealed && (
                      <>
                        {module.writeToken ? (
                          <div className="flex flex-col gap-1">
                            <p className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>Write token</p>
                            <CopyBlock label="write token" content={module.writeToken} language="text" />
                          </div>
                        ) : (
                          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                            Write token not available — it may not have been stored for this module.
                          </p>
                        )}
                        <CopyBlock label="Write API" content={writeSnippet} language="js" />
                      </>
                    )}
                  </div>
                )}

                {tab === 'schema' && (
                  <div className="flex flex-col gap-3">
                    <CopyBlock label="Schema" content={schemaRef} language="js" />
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      Field keys are the normalized column names used in the API.
                    </p>
                  </div>
                )}

                {tab === 'agent' && (
                  <div className="flex flex-col gap-3">
                    <CopyBlock label="Agent instructions" content={agentInstructions} language="text" />
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      Paste into your AI agent context, a{' '}
                      <code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--color-surface-2)' }}>CLAUDE.md</code>,{' '}
                      or any system prompt to give an AI assistant full knowledge of the read API.
                    </p>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
