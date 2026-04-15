'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '@/context/AppContext';
import type { SiteStarterModuleProgress, ProjectTemplate } from '@/types';

// ─── Module type labels and icons ────────────────────────────────────────────

const MODULE_TYPE_LABELS: Record<string, string> = {
  siteconfig:  'Site Config',
  gallery:     'Gallery',
  content:     'Content',
  calendar:    'Calendar',
  testimonial: 'Testimonials',
  faq:         'FAQ',
  menu:        'Menu',
  newsletter:  'Newsletter',
  form:        'Form',
};

const TEMPLATE_LABELS: Record<ProjectTemplate, string> = {
  portfolio:  'Portfolio',
  restaurant: 'Restaurant',
  saas:       'SaaS / Landing',
  nonprofit:  'Non-profit / Church',
  agency:     'Agency',
};

// ─── Small icons ──────────────────────────────────────────────────────────────

function CopyIcon({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M2 7l3 3 7-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="5" y="1" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 9v2.5A1.5 1.5 0 0 1 7.5 13h-6A1.5 1.5 0 0 1 0 11.5v-6A1.5 1.5 0 0 1 1.5 4H4" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 1h3m0 0v3m0-3L5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors focus:outline-none"
      style={{
        background:  copied ? 'oklch(0.25 0.05 150 / 0.6)' : 'var(--color-surface-2)',
        color:       copied ? 'var(--color-success)' : 'var(--color-muted)',
        border:      '1px solid var(--color-border)',
      }}
      aria-label="Copy to clipboard"
    >
      <CopyIcon copied={copied} />
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ─── Module card ──────────────────────────────────────────────────────────────

function ModuleCard({ mod, index }: { mod: SiteStarterModuleProgress; index: number }) {
  const isLive    = mod.status === 'complete';
  const typeLabel = MODULE_TYPE_LABELS[mod.moduleType] ?? mod.moduleType;

  const sheetUrl = mod.sheetId
    ? `https://docs.google.com/spreadsheets/d/${mod.sheetId}/edit`
    : null;

  return (
    <motion.div
      className="flex flex-col gap-3 p-4 rounded-xl border"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm font-semibold leading-snug" style={{ color: 'var(--color-text)' }}>
            {mod.moduleName}
          </span>
          <span
            className="inline-flex w-fit items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
            style={{
              background: 'var(--color-surface-2)',
              color:      'var(--color-muted)',
              border:     '1px solid var(--color-border)',
            }}
          >
            {typeLabel}
          </span>
        </div>
        {/* Status badge */}
        <span
          className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{
            background: isLive
              ? 'oklch(0.25 0.08 150 / 0.6)'
              : 'oklch(0.40 0.18 25 / 0.10)',
            color: isLive ? 'var(--color-success)' : 'var(--color-error)',
            border: `1px solid ${isLive ? 'oklch(0.55 0.20 150 / 0.30)' : 'oklch(0.55 0.20 25 / 0.30)'}`,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: isLive ? 'var(--color-success)' : 'var(--color-error)' }}
          />
          {isLive ? 'Live' : 'Error'}
        </span>
      </div>

      {/* Deployment URL */}
      {isLive && mod.deploymentUrl && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
        >
          <span className="flex-1 text-xs font-mono truncate" style={{ color: 'var(--color-muted)' }}>
            {mod.deploymentUrl}
          </span>
          <CopyButton text={mod.deploymentUrl} />
        </div>
      )}

      {/* Error message */}
      {!isLive && mod.error && (
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-error)' }}>
          {mod.error}
        </p>
      )}

      {/* Link to Google Sheet */}
      {isLive && sheetUrl && (
        <a
          href={sheetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors focus:outline-none"
          style={{ color: 'var(--color-muted)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-muted)'; }}
        >
          <ExternalLinkIcon />
          Open Google Sheet
        </a>
      )}
    </motion.div>
  );
}

// ─── CLAUDE.md export generator ───────────────────────────────────────────────

function generateClaudeMd(
  projectName: string,
  template: ProjectTemplate,
  modules: SiteStarterModuleProgress[],
  date: string,
): string {
  const templateLabel = TEMPLATE_LABELS[template] ?? template;

  const modulesSections = modules
    .filter((m) => m.status === 'complete' && m.deploymentUrl)
    .map((m) => {
      const typeLabel = MODULE_TYPE_LABELS[m.moduleType] ?? m.moduleType;
      const endpoint  = m.deploymentUrl!;

      let usageLine = '';
      switch (m.moduleType) {
        case 'siteconfig':
          usageLine = `GET ${endpoint}?json=1 → { data: { key: value, ... } }`;
          break;
        case 'gallery':
          usageLine = `GET ${endpoint}?json=1 → { images: [...] }\nGET ${endpoint}?json=1&featured=1 → featured only\nGET ${endpoint}?json=1&category=x → filtered`;
          break;
        case 'content':
          usageLine = `GET ${endpoint}?json=1 → { data: [...], total: N }\nGET ${endpoint}?json=1&slug=my-slug → single item`;
          break;
        case 'calendar':
          usageLine = `GET ${endpoint}?json=1 → { events: [...] } (upcoming)\nGET ${endpoint}?json=1&all=1 → all events\nGET ${endpoint}?json=1&past=1 → past events`;
          break;
        case 'testimonial':
          usageLine = `GET ${endpoint}?json=1 → { testimonials: [...] }`;
          break;
        case 'faq':
          usageLine = `GET ${endpoint}?json=1 → { faqs: [...] }\nGET ${endpoint}?json=1&category=x → filtered by category`;
          break;
        case 'menu':
          usageLine = `GET ${endpoint}?json=1 → { items: [...] }\nGET ${endpoint}?json=1&category=x → filtered`;
          break;
        case 'newsletter':
          usageLine = `POST ${endpoint} with { email: "..." } → subscribe`;
          break;
        case 'form':
          usageLine = `POST ${endpoint} with form data → submit\nContent-Type: application/json or application/x-www-form-urlencoded`;
          break;
        default:
          usageLine = `GET ${endpoint}?json=1`;
      }

      const sheetUrl = m.sheetId
        ? `https://docs.google.com/spreadsheets/d/${m.sheetId}/edit`
        : null;

      return `### ${typeLabel}: ${m.moduleName}
Endpoint: ${endpoint}
${sheetUrl ? `Sheet: ${sheetUrl}` : ''}

Usage:
${usageLine}

\`\`\`javascript
// Fetch example
const res = await fetch('${endpoint}?json=1');
const data = await res.json();
\`\`\``;
    })
    .join('\n\n---\n\n');

  return `# ${projectName} — Site Backend

Generated by RG Forms on ${date}
Template: ${templateLabel}

---

## Overview

This project uses RG Forms — a serverless Google Drive backend.
All data lives in your Google Drive. No server, no database, no API keys required on the frontend.

All endpoints are Google Apps Script web apps.
- Bare URL (no params) → authorization page
- Append ?json=1 → JSON data
- Apps Script cold starts take ~800ms–2s. Warm requests are fast.
- Use server-side fetching with caching (Next.js ISR, Astro SSG) to avoid cold starts in production.

---

## APIs

${modulesSections}

---

## Instructions for Claude

When the user asks you to build UI that uses data from this project:
1. Use the endpoint URLs from this file — do not invent URLs.
2. For GET endpoints, append ?json=1 to get JSON data.
3. For server-rendered frameworks (Next.js, Astro, SvelteKit, Nuxt), fetch on the server with caching.
4. For client-side-only sites, add a TTL cache to avoid repeated cold starts.
5. Never hardcode content — always fetch from the appropriate module endpoint.
6. To add/edit content, direct the user to edit the corresponding Google Sheet — no redeployment needed.
7. Authorization: each endpoint must be visited once by the owner to authorize the script before it goes live.
`;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SiteKit() {
  const { state, dispatch } = useApp();
  const result = state.siteStarterResult!;

  if (!result) return null;

  const templateLabel = TEMPLATE_LABELS[result.template] ?? result.template;
  const liveCount     = result.modules.filter((m) => m.status === 'complete').length;
  const total         = result.modules.length;

  function handleExportSkill() {
    const date    = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const content = generateClaudeMd(result.projectName, result.template, result.modules, date);
    const blob    = new Blob([content], { type: 'text/markdown' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href        = url;
    a.download    = 'CLAUDE.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <motion.main
      className="min-h-screen flex flex-col px-4 py-10"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
            🎉 Your site kit is ready
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              {result.projectName}
            </span>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{
                background: 'var(--color-accent-subtle)',
                color:      'var(--color-accent)',
                border:     '1px solid var(--color-accent-border)',
              }}
            >
              {templateLabel}
            </span>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                background: 'var(--color-surface)',
                color:      'var(--color-muted)',
                border:     '1px solid var(--color-border)',
              }}
            >
              {liveCount} of {total} live
            </span>
          </div>
        </div>

        {/* Authorization notice */}
        <div
          className="rounded-xl border px-4 py-3 flex items-start gap-3"
          style={{
            background:  'oklch(0.78 0.18 75 / 0.06)',
            borderColor: 'oklch(0.78 0.18 75 / 0.25)',
          }}
        >
          <span className="text-base shrink-0 mt-0.5">⚠️</span>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold" style={{ color: 'oklch(0.78 0.18 75)' }}>
              One-time authorization required
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Visit each endpoint URL once in your browser to authorize it. After that it serves data publicly.
              The endpoint URL without <code className="font-mono px-1 rounded" style={{ background: 'var(--color-surface-2)' }}>?json=1</code> shows the authorization page.
            </p>
          </div>
        </div>

        {/* Module cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.modules.map((mod, i) => (
            <ModuleCard key={`${mod.moduleType}-${mod.moduleName}`} mod={mod} index={i} />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleExportSkill}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{
              background:  'var(--color-accent-subtle)',
              borderColor: 'var(--color-accent-border)',
              color:       'var(--color-accent)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background   = 'var(--color-accent)';
              (e.currentTarget as HTMLButtonElement).style.color        = '#fff';
              (e.currentTarget as HTMLButtonElement).style.borderColor  = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background   = 'var(--color-accent-subtle)';
              (e.currentTarget as HTMLButtonElement).style.color        = 'var(--color-accent)';
              (e.currentTarget as HTMLButtonElement).style.borderColor  = 'var(--color-accent-border)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 10v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
            Export AI Skill (CLAUDE.md)
          </button>

          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET_SITE_STARTER' })}
            className="px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{
              background:  'transparent',
              borderColor: 'var(--color-border)',
              color:       'var(--color-muted)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)';
              (e.currentTarget as HTMLButtonElement).style.color       = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
              (e.currentTarget as HTMLButtonElement).style.color       = 'var(--color-muted)';
            }}
          >
            Back to Dashboard
          </button>
        </div>

      </div>
    </motion.main>
  );
}
