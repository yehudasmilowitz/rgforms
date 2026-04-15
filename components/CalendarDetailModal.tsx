'use client';

import { useState } from 'react';
import CopyBlock from '@/components/CopyBlock';
import { GoogleSheetsIcon, GoogleAppsScriptIcon } from '@/components/google-icons';
import { generateCalendarClientSnippet, generateCalendarServerSnippet, generateCalendarSchemaSnippet } from '@/lib/calendarSnippet';
import type { CalendarModuleSummary } from '@/types';

type Tab = 'client' | 'server' | 'schema';

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      style={{
        background: active ? 'var(--color-accent-subtle)' : 'transparent',
        color: active ? 'var(--color-accent)' : 'var(--color-muted)',
        border: `1px solid ${active ? 'var(--color-accent-border)' : 'transparent'}`,
      }}
    >
      {children}
    </button>
  );
}

interface CalendarDetailModalProps {
  module: CalendarModuleSummary;
  onClose: () => void;
}

export default function CalendarDetailModal({ module, onClose }: CalendarDetailModalProps) {
  const [tab, setTab] = useState<Tab>('client');
  const hasDetails = !!module.deploymentUrl;

  const result = { deploymentUrl: module.deploymentUrl ?? '' };
  const clientSnippet = hasDetails ? generateCalendarClientSnippet(result, module.moduleName) : '';
  const serverSnippet = hasDetails ? generateCalendarServerSnippet(result, module.moduleName) : '';
  const schemaSnippet = generateCalendarSchemaSnippet(module.moduleName);

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
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-base font-semibold truncate" style={{ color: 'var(--color-text)' }}>
              {module.moduleName}
            </h2>
            <span
              className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
              style={{ background: 'oklch(0.55 0.20 270 / 0.12)', color: 'oklch(0.65 0.18 270)', border: '1px solid oklch(0.55 0.20 270 / 0.25)' }}
            >
              Calendar
            </span>
          </div>
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

          {/* Endpoint + auth */}
          {module.deploymentUrl && (
            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                API endpoint
              </h3>
              <CopyBlock label="endpoint" content={module.deploymentUrl} language="text" />
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                <svg className="w-3.5 h-3.5 shrink-0 opacity-60" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 1.5L1.5 14h13L8 1.5z" stroke="#eab308" strokeWidth="1.3" strokeLinejoin="round" />
                  <path d="M8 6.5v3M8 11.5v.5" stroke="#eab308" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Script may need a one-time authorization —</span>
                <a
                  href={module.deploymentUrl}
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
          )}

          {!hasDetails ? (
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              Endpoint details not available — the module may still be provisioning.
            </p>
          ) : (
            <>
              {/* Integration code */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                    Integration code
                  </h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <TabButton active={tab === 'client'} onClick={() => setTab('client')}>Client-side</TabButton>
                    <TabButton active={tab === 'server'} onClick={() => setTab('server')}>Server / SSG</TabButton>
                    <TabButton active={tab === 'schema'} onClick={() => setTab('schema')}>Schema</TabButton>
                  </div>
                </div>

                {tab === 'client' && (
                  <div className="flex flex-col gap-3">
                    <CopyBlock label="RGCalendar.js" content={clientSnippet} language="js" />
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      Supports upcoming, past, all, date range, and category queries. Responses cached 5 min.
                    </p>
                  </div>
                )}
                {tab === 'server' && (
                  <div className="flex flex-col gap-3">
                    <CopyBlock label="Server / SSG patterns" content={serverSnippet} language="js" />
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      Fetch at build time or in a server component for zero client-side JS.
                    </p>
                  </div>
                )}
                {tab === 'schema' && (
                  <div className="flex flex-col gap-3">
                    <CopyBlock label="Response shape" content={schemaSnippet} language="js" />
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      Each Sheet row = one event. Add columns to extend the schema.
                    </p>
                  </div>
                )}
              </section>

              {/* Open links */}
              <section className="flex gap-3 flex-wrap">
                <a
                  href={module.sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
                >
                  <GoogleSheetsIcon className="w-4 h-4 shrink-0" />
                  Open Events Sheet
                </a>
                {module.scriptUrl && (
                  <a
                    href={module.scriptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none"
                    style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
                  >
                    <GoogleAppsScriptIcon className="w-4 h-4 shrink-0" />
                    View Apps Script
                  </a>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
