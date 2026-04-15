'use client';

/**
 * Generic result panel shared by all simple module types after provisioning.
 *
 * All six simple modules (Testimonial, FAQ, Menu, Newsletter, Announcement,
 * Redirects) have 95% identical success screens. This component holds that
 * shared layout so each module's file is just a thin config wrapper.
 */

import { motion } from 'motion/react';
import CopyBlock from '@/components/CopyBlock';
import { GoogleSheetsIcon, GoogleAppsScriptIcon } from '@/components/google-icons';

// ─── Internal helpers ─────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 8.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const ACCENT        = 'oklch(0.55 0.20 150)';
const ACCENT_SUBTLE = 'oklch(0.55 0.20 150 / 0.12)';
const ACCENT_BORDER = 'oklch(0.55 0.20 150 / 0.30)';

// ─── Public interface ─────────────────────────────────────────────────────────

export type ResultPanelLanguage = 'shell' | 'js' | 'text';

export interface CodeSnippet {
  /** Label shown in the CopyBlock header */
  label: string;
  /** The actual code content */
  content: string;
  /** Syntax language passed to CopyBlock */
  language: ResultPanelLanguage;
  /** Optional hint shown below the code block */
  hint?: string;
}

export interface SimpleResultPanelProps {
  /** Module instance name (e.g. "My Site") */
  moduleName: string;
  /** Heading suffix — e.g. "testimonials is live" */
  headingLabel: string;
  /** One-sentence subtitle */
  subtitle: string;
  /** Bullet-list items in the "What was created" checklist */
  completedItems: string[];
  /** Deployed web-app URL */
  deploymentUrl: string;
  /** Google Sheet URL */
  sheetUrl: string;
  /** Apps Script editor URL */
  scriptUrl: string;
  /**
   * Hint shown below the endpoint CopyBlock.
   * Accepts a plain string or pre-rendered JSX (e.g. with <code> elements).
   */
  endpointHint?: React.ReactNode;
  /** One or more code snippets shown in the "Integration code" section */
  codeSnippets?: CodeSnippet[];
  /** Label for the "Open sheet" link button (e.g. "Open Testimonials Sheet") */
  sheetLinkLabel?: string;
  /** Label for the "create new" action button */
  newButtonLabel: string;
  /** Dispatches the GO_TO_X_BUILDER / NEW action */
  onNew: () => void;
  /** Dispatches RESET_X / back-to-dashboard action */
  onDone: () => void;
  /** Custom description inside the one-time auth banner */
  authHint?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SimpleResultPanel({
  moduleName,
  headingLabel,
  subtitle,
  completedItems,
  deploymentUrl,
  sheetUrl,
  scriptUrl,
  endpointHint,
  codeSnippets,
  sheetLinkLabel = 'Open Sheet',
  newButtonLabel,
  onNew,
  onDone,
  authHint = 'Visit the endpoint URL once to authorize the script. After that it serves data to anyone automatically.',
}: SimpleResultPanelProps) {
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
              style={{ background: ACCENT_SUBTLE, border: `1px solid ${ACCENT_BORDER}`, color: ACCENT }}
            >
              <CheckIcon />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                {moduleName} {headingLabel}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
                {subtitle}
              </p>
            </div>
          </div>

          <div
            className="rounded-xl border p-4 flex flex-col gap-2"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {completedItems.map((item) => (
              <div key={item} className="flex items-center gap-2.5" style={{ color: ACCENT }}>
                <CheckIcon />
                <span className="text-sm" style={{ color: 'var(--color-text)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* One-time auth banner */}
        <div
          className="rounded-xl border p-4 flex flex-col gap-3"
          style={{ background: 'oklch(0.78 0.18 75 / 0.06)', borderColor: 'oklch(0.78 0.18 75 / 0.25)' }}
        >
          <div className="flex items-start gap-2.5">
            <div className="shrink-0 mt-0.5" style={{ color: 'oklch(0.78 0.18 75)' }}>
              <GoogleAppsScriptIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold" style={{ color: 'oklch(0.78 0.18 75)' }}>
                One-time authorization required
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                {authHint}
              </p>
            </div>
          </div>
          <a
            href={deploymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'oklch(0.78 0.18 75)', color: '#fff' }}
          >
            Open endpoint to authorize →
          </a>
        </div>

        {/* Endpoint */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>API endpoint</p>
          <CopyBlock label="endpoint" content={deploymentUrl} language="text" />
          {endpointHint && (
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              {endpointHint}
            </p>
          )}
        </div>

        {/* Integration code snippets */}
        {codeSnippets && codeSnippets.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Integration code</p>
            {codeSnippets.map((snippet) => (
              <div key={snippet.label} className="flex flex-col gap-2">
                <CopyBlock label={snippet.label} content={snippet.content} language={snippet.language} />
                {snippet.hint && (
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{snippet.hint}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Open links */}
        <div className="flex gap-3 flex-wrap">
          <a
            href={sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
          >
            <GoogleSheetsIcon className="w-4 h-4 shrink-0" />
            {sheetLinkLabel}
          </a>
          <a
            href={scriptUrl}
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
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onNew}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-accent-subtle)', borderColor: 'var(--color-accent-border)', color: 'var(--color-accent)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-subtle)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)'; }}
          >
            {newButtonLabel}
          </button>
          <button
            type="button"
            onClick={onDone}
            className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; }}
          >
            Back to dashboard
          </button>
        </div>
      </div>
    </motion.main>
  );
}
