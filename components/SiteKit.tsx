'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '@/context/AppContext';
import type { SiteTab } from '@/types';

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

// ─── Tab pill ────────────────────────────────────────────────────────────────

const TAB_TYPE_COLORS: Record<string, string> = {
  key_value: 'oklch(0.65 0.22 285)',
  rows:      'oklch(0.60 0.20 240)',
  form:      'oklch(0.73 0.17 65)',
  asset:     'oklch(0.73 0.10 75)',
};

function TabPill({ tab }: { tab: SiteTab }) {
  const color = TAB_TYPE_COLORS[tab.type] ?? 'var(--color-muted)';
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: color }}
      />
      <span className="text-sm font-medium flex-1" style={{ color: 'var(--color-text)' }}>
        {tab.label}
      </span>
      <span
        className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
        style={{ color, background: color.replace(')', ' / 0.10)'), border: `1px solid ${color.replace(')', ' / 0.25)')}` }}
      >
        {tab.type === 'key_value' ? 'config' : tab.type}
      </span>
    </div>
  );
}

// ─── Manifest guide (embedded in downloaded JSON) ────────────────────────────

function buildManifestGuide(tabs: SiteTab[], scriptToken: string) {
  const hasForms   = tabs.some((t) => t.type === 'form');
  const hasAssets  = tabs.some((t) => t.type === 'asset');
  const exampleTab = tabs.find((t) => t.type !== 'form');

  return {
    _readme: 'Implementation guide — safe to delete once your site is wired up.',
    security: {
      note: 'Keep script_url and script_token in server-side environment variables. Never expose them to the browser.',
      env_example: `SITE_SCRIPT_URL=${tabs[0] ? '(your script_url above)' : ''}\nSITE_TOKEN=${scriptToken}`,
    },
    nextjs_proxy: {
      note: 'Create one route handler to proxy all tab requests. The token stays server-side; your frontend calls /api/site/[tab] instead.',
      example: [
        '// app/api/site/[tab]/route.ts',
        'export async function GET(req: Request, { params }: { params: { tab: string } }) {',
        '  const url = `${process.env.SITE_SCRIPT_URL}?token=${process.env.SITE_TOKEN}&tab=${params.tab}`;',
        '  const res = await fetch(url, { next: { revalidate: 60 } });',
        '  return Response.json(await res.json());',
        '}',
      ].join('\n'),
    },
    caching: {
      note: 'Apps Script has ~1–2 s cold starts. Always fetch server-side with a revalidate window so your pages stay fast and the script stays warm.',
      ...(exampleTab && {
        example: [
          `// app/page.tsx`,
          `const res = await fetch(\`/api/site/${exampleTab.name}\`, { next: { revalidate: 60 } });`,
          `const data = await res.json();`,
        ].join('\n'),
      }),
    },
    ...(hasForms && {
      form_submissions: {
        note: 'POST form submissions to your own proxy route. The proxy appends the token before forwarding to Apps Script.',
        example: [
          '// app/api/site/submit/route.ts',
          'export async function POST(req: Request) {',
          '  const { tab, fields } = await req.json();',
          '  const res = await fetch(process.env.SITE_SCRIPT_URL!, {',
          '    method: "POST",',
          '    headers: { "Content-Type": "application/json" },',
          '    body: JSON.stringify({ token: process.env.SITE_TOKEN, tab, fields }),',
          '  });',
          '  return Response.json(await res.json());',
          '}',
        ].join('\n'),
      },
    }),
    ...(hasAssets && {
      images: {
        note: 'Asset tab items include a ready-to-use url field served from Google\'s CDN — no proxy needed since it contains no secrets.',
        url_format: 'https://lh3.googleusercontent.com/d/<fileId>',
        nextjs_config: 'Add lh3.googleusercontent.com to images.domains (or remotePatterns) in next.config.js',
      },
    }),
    content_updates: 'Edit the Google Sheet directly to add or update content — no redeployment needed. Changes appear on the next revalidation cycle.',
    authorization: 'Visit the script_url once in your browser as the Google account owner to authorize the web app before going live.',
  };
}

// ─── CLAUDE.md generator ──────────────────────────────────────────────────────

function generateClaudeMd(
  projectSlug: string,
  scriptUrl: string,
  scriptToken: string,
  sheetUrl: string,
  driveFolderUrl: string,
  tabs: SiteTab[],
  date: string,
): string {
  const tabDocs = tabs
    .map((tab) => {
      if (tab.type === 'key_value') {
        return `#### \`${tab.name}\` — ${tab.label} (config)
GET ${scriptUrl}?token=${scriptToken}&tab=${tab.name}
Returns: \`{ site_name: "...", tagline: "...", ... }\``;
      }
      if (tab.type === 'rows') {
        return `#### \`${tab.name}\` — ${tab.label} (rows)
GET ${scriptUrl}?token=${scriptToken}&tab=${tab.name}
Returns: \`[{ title: "...", ... }, ...]\``;
      }
      if (tab.type === 'form') {
        return `#### \`${tab.name}\` — ${tab.label} (form submissions)
POST ${scriptUrl}
Body: \`{ token: "${scriptToken}", tab: "${tab.name}", fields: { name: "...", email: "...", ... } }\`
Returns: \`{ success: true }\``;
      }
      if (tab.type === 'asset') {
        return `#### \`${tab.name}\` — ${tab.label} (Drive assets)
GET ${scriptUrl}?token=${scriptToken}&tab=${tab.name}
Returns: \`[{ id, name, mimeType, isImage, size, url, driveUrl, createdAt, updatedAt }, ...]\`
Image URLs use the Google Docs viewer format: https://lh3.googleusercontent.com/d/<id>`;
      }
      return '';
    })
    .filter(Boolean)
    .join('\n\n');

  return `# ${projectSlug} — Site Backend

Generated by RG Forms on ${date}

---

## Architecture

One Google Sheet, one Apps Script web app. All data lives in your Google Drive.
No server, no database, no hosting required.

- **Sheet**: ${sheetUrl}
- **Drive folder**: ${driveFolderUrl}
- **API endpoint**: ${scriptUrl}
- **Token**: \`${scriptToken}\` (include in every request)

---

## API Reference

All requests require \`token=${scriptToken}\`.

${tabDocs}

---

## Usage notes

1. **Authorization**: Visit the script URL once in your browser to authorize it before use.
2. **Cold starts**: Apps Script cold starts take ~800ms–2s. Use server-side caching (Next.js ISR, Astro SSG) in production.
3. **Content updates**: Edit the Google Sheet directly — no redeployment needed.
4. **Forms**: POST submissions are appended as new rows. Email notifications go to the configured address.

---

## Instructions for Claude

When building UI for this project:
1. Use the single endpoint URL above for all tabs.
2. Include the token in every request.
3. Use \`tab=<name>\` param for GET, \`tab\` in the body for POST.
4. Fetch on the server with caching for production builds.
5. Never hardcode content — always fetch from the API.
`;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SiteKit() {
  const { state, dispatch } = useApp();
  const manifest = state.siteManifest;

  if (!manifest) return null;

  const date = new Date(manifest.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  function handleDownloadManifest() {
    const guide = buildManifestGuide(manifest!.tabs, manifest!.script_token);
    const blob = new Blob([JSON.stringify({ ...manifest, ...guide }, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${manifest!.project_slug}-manifest.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleExportClaudeMd() {
    const content = generateClaudeMd(
      manifest!.project_slug,
      manifest!.script_url,
      manifest!.script_token,
      manifest!.sheet_url,
      manifest!.drive_root_folder_url,
      manifest!.tabs,
      date,
    );
    const blob = new Blob([content], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'CLAUDE.md';
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
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-subtle)' }}>
            {manifest.google_account}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
            Site backend ready
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            {manifest.tabs.length} tab{manifest.tabs.length !== 1 ? 's' : ''} · provisioned {date}
          </p>
        </div>

        {/* Authorization notice */}
        <div
          className="rounded-xl border px-4 py-3 flex items-start gap-3"
          style={{ background: 'oklch(0.78 0.18 75 / 0.06)', borderColor: 'oklch(0.78 0.18 75 / 0.25)' }}
        >
          <span className="text-base shrink-0 mt-0.5">⚠️</span>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold" style={{ color: 'oklch(0.78 0.18 75)' }}>
              One-time authorization required
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Visit the script URL once in your browser to authorize. You&apos;ll see this response — that means the API is live:
            </p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg mt-1"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--color-success)' }} />
              <code className="text-[11px] font-mono flex-1" style={{ color: 'var(--color-success)' }}>
                {`{ "status": "ok", "message": "API is live…" }`}
              </code>
            </div>
          </div>
        </div>

        {/* API endpoint */}
        <div className="flex flex-col gap-3 p-4 rounded-xl border"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
            API Endpoint
          </p>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
            <span className="flex-1 text-xs font-mono truncate" style={{ color: 'var(--color-text)' }}>
              {manifest.script_url}
            </span>
            <CopyButton text={manifest.script_url} />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Token: <code className="font-mono px-1.5 py-0.5 rounded text-[11px]"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                {manifest.script_token}
              </code>
            </p>
            <CopyButton text={manifest.script_token} />
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <a href={manifest.script_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium"
              style={{ color: 'var(--color-accent)' }}>
              <ExternalLinkIcon /> Open Script (authorize)
            </a>
            <a href={manifest.sheet_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium"
              style={{ color: 'var(--color-muted)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-muted)'; }}>
              <ExternalLinkIcon /> Open Google Sheet
            </a>
            <a href={manifest.drive_root_folder_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium"
              style={{ color: 'var(--color-muted)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-muted)'; }}>
              <ExternalLinkIcon /> Open Drive Folder
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
            Tabs ({manifest.tabs.length})
          </p>
          <div className="flex flex-col gap-2">
            {manifest.tabs.map((tab) => (
              <TabPill key={tab.name} tab={tab} />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleExportClaudeMd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-accent-subtle)', borderColor: 'var(--color-accent-border)', color: 'var(--color-accent)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background  = 'var(--color-accent)';
              (e.currentTarget as HTMLButtonElement).style.color       = '#fff';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background  = 'var(--color-accent-subtle)';
              (e.currentTarget as HTMLButtonElement).style.color       = 'var(--color-accent)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent-border)';
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
            onClick={handleDownloadManifest}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)';
              (e.currentTarget as HTMLButtonElement).style.color       = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
              (e.currentTarget as HTMLButtonElement).style.color       = 'var(--color-muted)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 10v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
            Download Manifest (JSON)
          </button>

          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET_SITE_STARTER' })}
            className="px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
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
