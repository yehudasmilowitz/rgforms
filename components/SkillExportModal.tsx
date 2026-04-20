'use client';

import { useState, useEffect } from 'react';
import { generateSkillExport } from '@/lib/skillExport';
import type { FormSummary, ContentModuleSummary, AssetModuleSummary, SiteConfigModuleSummary, CalendarModuleSummary, GalleryModuleSummary } from '@/types';

type Format = 'claude' | 'cursor' | 'generic';

interface SkillExportModalProps {
  forms: FormSummary[];
  contentModules: ContentModuleSummary[];
  assetModules: AssetModuleSummary[];
  siteConfigs: SiteConfigModuleSummary[];
  calendars: CalendarModuleSummary[];
  galleries: GalleryModuleSummary[];
  onClose: () => void;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M11 5V3.5A1.5 1.5 0 009.5 2H3.5A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

const FORMAT_OPTIONS: { value: Format; label: string; filename: string; description: string }[] = [
  {
    value: 'claude',
    label: 'Claude Code',
    filename: 'CLAUDE.md',
    description: 'Drop as CLAUDE.md in your project root — Claude reads it automatically.',
  },
  {
    value: 'cursor',
    label: 'Cursor',
    filename: '.cursorrules',
    description: 'Drop as .cursorrules in your project root — Cursor reads it automatically.',
  },
  {
    value: 'generic',
    label: 'Generic reference',
    filename: 'sheetspin-reference.md',
    description: 'Framework-agnostic Markdown reference — paste into any AI or docs system.',
  },
];

export default function SkillExportModal({
  forms,
  contentModules,
  assetModules,
  siteConfigs,
  calendars,
  galleries,
  onClose,
}: SkillExportModalProps) {
  const [format, setFormat] = useState<Format>('claude');
  const [copied, setCopied] = useState(false);

  const content = generateSkillExport({ forms, contentModules, assetModules, siteConfigs, calendars, galleries, format });
  const selectedFormat = FORMAT_OPTIONS.find((f) => f.value === format)!;

  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    }
  }, [copied]);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
  }

  function handleDownload() {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFormat.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const moduleCount = forms.length + contentModules.length + assetModules.length + siteConfigs.length + calendars.length + galleries.length;

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
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'var(--color-accent-subtle)', border: '1px solid var(--color-accent-border)', color: 'var(--color-accent)' }}
            >
              ✦
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold leading-none" style={{ color: 'var(--color-text)' }}>
                AI Skill Export
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                {moduleCount} module{moduleCount !== 1 ? 's' : ''} · teach your AI the full setup
              </p>
            </div>
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
        <div className="overflow-y-auto flex flex-col gap-5 p-6">

          {/* Explainer */}
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            This file contains all your real endpoints, schemas, and copy-paste client code.
            Drop it in your project and your AI assistant can build your entire site against live Google Drive data.
          </p>

          {/* Format selector */}
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
              Format
            </h3>
            <div className="flex flex-col gap-2">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormat(opt.value)}
                  className="flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{
                    background: format === opt.value ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
                    borderColor: format === opt.value ? 'var(--color-accent-border)' : 'var(--color-border)',
                  }}
                >
                  <div
                    className="shrink-0 w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center"
                    style={{
                      borderColor: format === opt.value ? 'var(--color-accent)' : 'var(--color-muted)',
                    }}
                  >
                    {format === opt.value && (
                      <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent)' }} />
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {opt.label}
                      </span>
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}>
                        {opt.filename}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      {opt.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Preview */}
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
              Preview
            </h3>
            <div
              className="rounded-xl border overflow-auto"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', maxHeight: '260px' }}
            >
              <pre
                className="p-4 text-xs leading-relaxed whitespace-pre-wrap"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}
              >
                {content}
              </pre>
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{
                background: copied ? 'oklch(0.55 0.18 145 / 0.12)' : 'var(--color-accent-subtle)',
                borderColor: copied ? 'oklch(0.55 0.18 145 / 0.4)' : 'var(--color-accent-border)',
                color: copied ? 'oklch(0.65 0.18 145)' : 'var(--color-accent)',
              }}
            >
              {copied ? (
                <>
                  <CheckIcon className="w-4 h-4 shrink-0" />
                  Copied!
                </>
              ) : (
                <>
                  <CopyIcon className="w-4 h-4 shrink-0" />
                  Copy to clipboard
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; }}
            >
              <DownloadIcon className="w-4 h-4 shrink-0" />
              Download {selectedFormat.filename}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
