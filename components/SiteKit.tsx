'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '@/context/AppContext';
import {
  updateManifestInSheet,
  addTabToSheet,
  removeTabFromSheet,
  updateTabHeaders,
  fetchTabHeaders,
  appendTabRows,
  toFieldKey,
  createAssetFolder,
} from '@/lib/siteTabHelpers';
import { TAB_TYPE_MAP, KEY_VALUE_FIELDS, ROW_COLUMNS, FORM_COLUMNS } from '@/lib/createSite';
import FormFieldEditor, { DEFAULT_FORM_CONFIG, DEFAULT_NEWSLETTER_CONFIG } from '@/components/FormFieldEditor';
import type { SiteTab, SiteTabFormConfig, SiteManifest } from '@/types';

// ─── Icons ────────────────────────────────────────────────────────────────────

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

function SpinnerIcon() {
  return (
    <div className="w-4 h-4 rounded-full border-2 animate-spin shrink-0"
      style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }} />
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
        background: copied ? 'oklch(0.25 0.05 150 / 0.6)' : 'var(--color-surface-2)',
        color:      copied ? 'var(--color-success)' : 'var(--color-muted)',
        border:     '1px solid var(--color-border)',
      }}
    >
      <CopyIcon copied={copied} />
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ─── Tab color helper ─────────────────────────────────────────────────────────

const TAB_COLORS: Record<string, string> = {
  key_value: 'oklch(0.65 0.22 285)',
  rows:      'oklch(0.60 0.20 240)',
  form:      'oklch(0.73 0.17 65)',
  asset:     'oklch(0.73 0.10 75)',
};

function tabColor(type: SiteTab['type']) {
  return TAB_COLORS[type] ?? 'var(--color-muted)';
}

// ─── Add-module type list ─────────────────────────────────────────────────────

const ADD_MODULE_TYPES = [
  { moduleType: 'form',        label: 'Contact Form',   description: 'Collects submissions + email notifications' },
  { moduleType: 'newsletter',  label: 'Newsletter',     description: 'Email signup with source tracking' },
  { moduleType: 'content',     label: 'Content / Blog', description: 'Articles, posts, any list of content' },
  { moduleType: 'testimonial', label: 'Testimonials',   description: 'Customer reviews and quotes' },
  { moduleType: 'faq',         label: 'FAQ',            description: 'Questions and answers' },
  { moduleType: 'calendar',    label: 'Events',         description: 'Event calendar with dates and locations' },
  { moduleType: 'menu',        label: 'Menu / Pricing', description: 'Products, dishes, or service tiers' },
  { moduleType: 'gallery',     label: 'Image Gallery',  description: 'Drive-backed photo gallery (creates folder)' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeTabName(label: string, existing: string[]): string {
  const base = label.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 20) || 'tab';
  if (!existing.includes(base)) return base;
  let n = 2;
  while (existing.includes(`${base}${n}`)) n++;
  return `${base}${n}`;
}

function defaultColumnsFor(moduleType: string, type: SiteTab['type']): string[] {
  if (type === 'key_value') return KEY_VALUE_FIELDS[moduleType] ?? ['name', 'value'];
  if (type === 'rows')      return ROW_COLUMNS[moduleType]      ?? ['title', 'description'];
  if (type === 'form')      return FORM_COLUMNS[moduleType]     ?? ['submitted_at', 'name', 'email', 'message'];
  return [];
}

// ─── CLAUDE.md generator ──────────────────────────────────────────────────────

function generateClaudeMd(manifest: SiteManifest, date: string): string {
  const { project_slug, script_url, script_token, sheet_url, drive_root_folder_url, tabs } = manifest;

  const tabDocs = tabs
    .map((tab) => {
      if (tab.type === 'key_value') {
        return `#### \`${tab.name}\` — ${tab.label} (config)\nGET ${script_url}?token=<TOKEN>&tab=${tab.name}\nReturns: \`{ site_name: "...", tagline: "...", ... }\``;
      }
      if (tab.type === 'rows') {
        return `#### \`${tab.name}\` — ${tab.label} (rows)\nGET ${script_url}?token=<TOKEN>&tab=${tab.name}\nReturns: \`[{ title: "...", ... }, ...]\``;
      }
      if (tab.type === 'form') {
        const fields = tab.formConfig?.fields ?? [];
        const fieldLines = fields.length
          ? fields.map((f) => `    - ${f.label} [key: ${toFieldKey(f.label)}, type: ${f.type}${f.required ? ', required' : ''}]`).join('\n')
          : '    - name, email, phone, message';
        const honeypot = tab.formConfig?.enableHoneypot
          ? '\n  Spam: include `<input type="text" name="_hp" style="display:none" tabindex="-1" />` — script discards submissions with this filled.'
          : '';
        const cc  = tab.formConfig?.ccEmails?.length  ? `\n  CC:  ${tab.formConfig.ccEmails.join(', ')}` : '';
        const bcc = tab.formConfig?.bccEmails?.length ? `\n  BCC: ${tab.formConfig.bccEmails.join(', ')}` : '';
        return `#### \`${tab.name}\` — ${tab.label} (form)\nPOST to /api/site/submit with \`{ tab: "${tab.name}", fields: { ... } }\`\nFields:\n${fieldLines}${honeypot}${cc}${bcc}\nResponse: \`{ result: "success" }\` or \`{ result: "error", error: "..." }\``;
      }
      if (tab.type === 'asset') {
        return `#### \`${tab.name}\` — ${tab.label} (Drive assets)\nGET ${script_url}?token=<TOKEN>&tab=${tab.name}\nReturns: \`[{ id, name, mimeType, isImage, size, url, driveUrl, createdAt, updatedAt }]\`\nImage URLs: \`https://lh3.googleusercontent.com/d/<id>\``;
      }
      return '';
    })
    .filter(Boolean)
    .join('\n\n');

  const hasForms  = tabs.some((t) => t.type === 'form');
  const hasAssets = tabs.some((t) => t.type === 'asset');
  const anyHoneypot = tabs.some((t) => t.formConfig?.enableHoneypot);

  return `# ${project_slug} — Site Backend

Generated by Sheetspin on ${date}

---

## Architecture

One Google Sheet · One Apps Script web app · All data in your Google Drive.

- **Sheet**: ${sheet_url}
- **Drive folder**: ${drive_root_folder_url}
- **API endpoint**: \`${script_url}\`
- **Token**: \`${script_token}\` — keep server-side only, never expose to browser

---

## Next.js proxy (keeps token server-side)

\`\`\`typescript
// app/api/site/[tab]/route.ts
export async function GET(req: Request, { params }: { params: { tab: string } }) {
  const url = \`\${process.env.SITE_SCRIPT_URL}?token=\${process.env.SITE_TOKEN}&tab=\${params.tab}\`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  return Response.json(await res.json());
}
\`\`\`
${hasForms ? `
\`\`\`typescript
// app/api/site/submit/route.ts
export async function POST(req: Request) {
  const { tab, fields } = await req.json();
  const res = await fetch(process.env.SITE_SCRIPT_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: process.env.SITE_TOKEN, tab, fields }),
  });
  const data = await res.json();
  // data.result === "success" | "error"
  return Response.json(data);
}
\`\`\`` : ''}
---

## Environment variables

\`\`\`
SITE_SCRIPT_URL=${script_url}
SITE_TOKEN=${script_token}
\`\`\`
${hasAssets ? `
## Images

Asset tab \`url\` fields use Google CDN. Add to \`next.config.js\`:
\`\`\`js
images: { remotePatterns: [{ hostname: 'lh3.googleusercontent.com' }] }
\`\`\`` : ''}
---

## API reference

${tabDocs}

---

## Usage notes

1. **Authorization**: Visit the script URL once in your browser as the account owner to authorize before first use.
2. **Cold starts**: Apps Script takes ~800ms–2s cold. Always fetch server-side with \`revalidate\`.
3. **Content updates**: Edit the Google Sheet directly — no redeployment needed.
${hasForms ? `4. **Form responses**: \`{ result: "success" }\` on success, \`{ result: "error", error: "..." }\` on failure.` : ''}
${anyHoneypot ? `5. **Spam protection**: Honeypot-enabled forms — include \`<input type="text" name="_hp" style="display:none" tabindex="-1" />\`. Script silently discards submissions where this is filled.` : ''}

---

## Instructions for Claude

When building UI for this project:
1. Use the proxy routes above — never call the script URL directly from the browser.
2. Fetch data server-side with \`revalidate\`.
3. Form POST: \`{ tab, fields }\` to \`/api/site/submit\`; check \`data.result === "success"\`.
4. Never hardcode content — always fetch from the API.
5. Asset image URLs use \`https://lh3.googleusercontent.com/d/<id>\` — configure Next.js \`remotePatterns\`.
`;
}

// ─── Manifest guide (downloaded JSON) ────────────────────────────────────────

function buildManifestGuide(manifest: SiteManifest) {
  const { tabs, script_url, script_token } = manifest;
  const hasForms  = tabs.some((t) => t.type === 'form');
  const hasAssets = tabs.some((t) => t.type === 'asset');
  const exampleTab = tabs.find((t) => t.type !== 'form');

  return {
    _readme: 'Implementation guide — safe to delete once your site is wired up.',
    security: {
      note: 'Keep script_url and script_token in server-side env vars only. Never expose to the browser.',
      env_example: `SITE_SCRIPT_URL=${script_url}\nSITE_TOKEN=${script_token}`,
    },
    nextjs_proxy: {
      note: 'Route all tab requests through a server-side proxy. Token stays server-side.',
      example: [
        '// app/api/site/[tab]/route.ts',
        'export async function GET(req, { params }) {',
        `  const url = \`\${process.env.SITE_SCRIPT_URL}?token=\${process.env.SITE_TOKEN}&tab=\${params.tab}\`;`,
        '  const res = await fetch(url, { next: { revalidate: 60 } });',
        '  return Response.json(await res.json());',
        '}',
      ].join('\n'),
    },
    ...(hasForms && {
      form_submissions: {
        note: 'POST { tab, fields } to your proxy. Proxy adds token and forwards to Apps Script.',
        response_success: '{ result: "success" }',
        response_error:   '{ result: "error", error: "..." }',
        honeypot_note: 'For forms with spam protection (enableHoneypot): include <input type="text" name="_hp" style="display:none" tabindex="-1" autocomplete="off" /> in your HTML. The script silently discards submissions where _hp is filled.',
        example: [
          '// app/api/site/submit/route.ts',
          'export async function POST(req) {',
          '  const { tab, fields } = await req.json();',
          '  const res = await fetch(process.env.SITE_SCRIPT_URL, {',
          '    method: "POST", headers: { "Content-Type": "application/json" },',
          '    body: JSON.stringify({ token: process.env.SITE_TOKEN, tab, fields }),',
          '  });',
          '  return Response.json(await res.json());',
          '}',
        ].join('\n'),
      },
    }),
    ...(hasAssets && {
      images: {
        note: 'Asset tab url fields use Google CDN — no auth needed in URL.',
        url_format: 'https://lh3.googleusercontent.com/d/<fileId>',
        nextjs_config: 'Add { hostname: "lh3.googleusercontent.com" } to images.remotePatterns in next.config.js',
      },
    }),
    ...(exampleTab && {
      caching: {
        note: 'Apps Script cold-starts take ~1–2s. Always fetch server-side with revalidate.',
        example: `const res = await fetch(\`/api/site/${exampleTab.name}\`, { next: { revalidate: 60 } });`,
      },
    }),
    content_updates: 'Edit the Google Sheet directly — no redeployment needed.',
    authorization:   'Visit script_url once in your browser as the Google account owner to authorize.',
  };
}

// ─── Module row ───────────────────────────────────────────────────────────────

function ModuleRow({
  tab, onEdit, onSeed, onConfirmRemove, onCancelRemove, onRemove,
  isEditing, isSeedOpen, isConfirmingRemove, saving,
}: {
  tab: SiteTab;
  onEdit: () => void;
  onSeed: () => void;
  onConfirmRemove: () => void;
  onCancelRemove: () => void;
  onRemove: () => void;
  isEditing: boolean;
  isSeedOpen: boolean;
  isConfirmingRemove: boolean;
  saving: boolean;
}) {
  const color  = tabColor(tab.type);
  const locked = tab.moduleType === 'siteconfig';

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background:  'var(--color-surface)',
        borderColor: isConfirmingRemove
          ? 'oklch(0.55 0.20 25 / 0.50)'
          : isEditing || isSeedOpen ? 'var(--color-accent)' : 'var(--color-border)',
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{tab.label}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide mt-0.5" style={{ color }}>
            {tab.type === 'key_value' ? 'config' : tab.type}
            {tab.type === 'form' && tab.formConfig?.fields.length
              ? ` · ${tab.formConfig.fields.length} fields`
              : ''}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {tab.type === 'form' && (
            <button type="button" onClick={onEdit} disabled={saving}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
              style={{
                background: isEditing ? 'var(--color-accent)' : 'var(--color-surface-2)',
                color:      isEditing ? '#fff' : 'var(--color-muted)',
                border:     `1px solid ${isEditing ? 'var(--color-accent)' : 'var(--color-border)'}`,
              }}>
              Edit fields
            </button>
          )}
          {tab.type === 'rows' && (
            <button type="button" onClick={onSeed} disabled={saving}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
              style={{
                background: isSeedOpen ? 'oklch(0.65 0.22 285)' : 'var(--color-surface-2)',
                color:      isSeedOpen ? '#fff' : 'var(--color-muted)',
                border:     `1px solid ${isSeedOpen ? 'oklch(0.65 0.22 285)' : 'var(--color-border)'}`,
              }}>
              Seed AI
            </button>
          )}
          {!locked && (
            <button type="button" onClick={onConfirmRemove} disabled={saving}
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors disabled:opacity-40"
              style={{ color: 'var(--color-subtle)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-error)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-subtle)'; }}
              title="Remove module"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M1.5 3h10M4.5 3V2h4v1M4 3l.5 7.5M9 3l-.5 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {isConfirmingRemove && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t"
          style={{ background: 'oklch(0.40 0.18 25 / 0.08)', borderColor: 'oklch(0.55 0.20 25 / 0.30)' }}>
          <p className="text-xs" style={{ color: 'var(--color-error)' }}>
            Remove <strong>{tab.label}</strong>? This deletes the sheet tab permanently.
          </p>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={onRemove} disabled={saving}
              className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
              style={{ background: 'var(--color-error)', color: '#fff' }}>
              {saving ? <SpinnerIcon /> : null} Remove
            </button>
            <button type="button" onClick={onCancelRemove}
              className="px-3 py-1 rounded-lg text-xs font-medium"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Preview modal ────────────────────────────────────────────────────────────

interface PreviewEntry {
  title:    string;
  content:  string;
  filename: string;
}

function PreviewModal({ entry, onClose }: { entry: PreviewEntry; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(entry.content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handleDownload() {
    const blob = new Blob([entry.content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: entry.filename });
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.18 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}>
          <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            {entry.title}
          </span>
          <button
            type="button" onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: copied ? 'oklch(0.25 0.05 150 / 0.6)' : 'var(--color-surface-2)',
              color:      copied ? 'var(--color-success)' : 'var(--color-muted)',
              border:     '1px solid var(--color-border)',
            }}
          >
            <CopyIcon copied={copied} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            type="button" onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1v7M3.5 5.5 6 8l2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 9v1.5A1.5 1.5 0 0 0 2.5 12h7A1.5 1.5 0 0 0 11 10.5V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Download
          </button>
          <button
            type="button" onClick={onClose}
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

        {/* Content */}
        <div className="overflow-auto flex-1 p-5">
          <pre className="text-[12px] font-mono leading-relaxed whitespace-pre-wrap break-words"
            style={{ color: 'var(--color-text)' }}>
            {entry.content}
          </pre>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SiteKit() {
  const { state, dispatch } = useApp();
  const manifest = state.siteManifest;
  const token    = state.auth.accessToken!;

  const [editingTab,  setEditingTab]  = useState<string | null>(null);
  const [seedingTab,  setSeedingTab]  = useState<string | null>(null);
  const [removingTab, setRemovingTab] = useState<string | null>(null);
  const [showAdd,     setShowAdd]     = useState(false);

  const [editFormConfig, setEditFormConfig] = useState<SiteTabFormConfig | null>(null);

  const [seedCount, setSeedCount] = useState(5);
  const [seedMsg,   setSeedMsg]   = useState('');

  const [addModuleType,   setAddModuleType]   = useState('');
  const [addModuleLabel,  setAddModuleLabel]  = useState('');
  const [addFormConfig,   setAddFormConfig]   = useState<SiteTabFormConfig>({ ...DEFAULT_FORM_CONFIG });

  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [preview, setPreview] = useState<PreviewEntry | null>(null);

  if (!manifest) return null;
  const m: SiteManifest = manifest;

  const date = new Date(m.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  function openEdit(tab: SiteTab) {
    if (editingTab === tab.name) { setEditingTab(null); setEditFormConfig(null); return; }
    setEditingTab(tab.name);
    setEditFormConfig(tab.formConfig ? { ...tab.formConfig, fields: [...tab.formConfig.fields] } : { ...DEFAULT_FORM_CONFIG });
    setSeedingTab(null);
    setRemovingTab(null);
  }

  function openSeed(tab: SiteTab) {
    if (seedingTab === tab.name) { setSeedingTab(null); setSeedMsg(''); return; }
    setSeedingTab(tab.name);
    setSeedMsg('');
    setEditingTab(null);
    setRemovingTab(null);
  }

  async function handleSaveFormEdit() {
    if (!editingTab || !editFormConfig) return;
    setSaving(true); setError('');
    try {
      const cols = ['submitted_at', ...editFormConfig.fields.map((f) => toFieldKey(f.label))];
      await updateTabHeaders(token, m.sheet_id, editingTab, cols);
      const newTabs     = m.tabs.map((t) => t.name === editingTab ? { ...t, formConfig: editFormConfig } : t);
      const newManifest = { ...m, tabs: newTabs };
      await updateManifestInSheet(token, m.sheet_id, newManifest);
      dispatch({ type: 'UPDATE_SITE_MANIFEST', payload: newManifest });
      setEditingTab(null); setEditFormConfig(null);
    } catch (err) { setError((err as Error).message); }
    finally { setSaving(false); }
  }

  async function handleRemoveTab(tabName: string) {
    setSaving(true); setError('');
    try {
      await removeTabFromSheet(token, m.sheet_id, tabName);
      const newTabs     = m.tabs.filter((t) => t.name !== tabName);
      const newManifest = { ...m, tabs: newTabs };
      await updateManifestInSheet(token, m.sheet_id, newManifest);
      dispatch({ type: 'UPDATE_SITE_MANIFEST', payload: newManifest });
      setRemovingTab(null);
    } catch (err) { setError((err as Error).message); }
    finally { setSaving(false); }
  }

  async function handleSeedData(tab: SiteTab) {
    setSaving(true); setSeedMsg(''); setError('');
    try {
      const headers  = await fetchTabHeaders(token, m.sheet_id, tab.name);
      const dataCols = headers.filter((c) => c && c !== 'submitted_at' && c !== '_hp');
      const res      = await fetch('/api/seed-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteName: m.project_slug, tabLabel: tab.label, moduleType: tab.moduleType, columns: dataCols, count: seedCount }),
      });
      const data = (await res.json()) as { rows?: Record<string, string>[]; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? 'Seed failed');
      const rows = (data.rows ?? []).map((row) =>
        headers.map((h) => h === 'submitted_at' ? new Date().toISOString() : String(row[h] ?? '')),
      );
      await appendTabRows(token, m.sheet_id, tab.name, rows);
      setSeedMsg(`Added ${rows.length} rows to ${tab.label}.`);
    } catch (err) { setError((err as Error).message); }
    finally { setSaving(false); }
  }

  async function handleAddModule() {
    if (!addModuleType || addModuleLabel.trim().length < 2) return;
    setSaving(true); setError('');
    try {
      const label   = addModuleLabel.trim();
      const tabType = TAB_TYPE_MAP[addModuleType] ?? 'rows';
      const tabName = makeTabName(label, m.tabs.map((t) => t.name));
      const newTab: SiteTab = { name: tabName, label, type: tabType, moduleType: addModuleType, nameSuffix: label };

      if (tabType === 'form') {
        newTab.formConfig = addFormConfig;
        await addTabToSheet(token, m.sheet_id, tabName,
          ['submitted_at', ...addFormConfig.fields.map((f) => toFieldKey(f.label))]);
      } else if (tabType === 'asset') {
        const folderId = await createAssetFolder(token, label, m.drive_root_folder_id);
        newTab.drive_folder_id = folderId;
      } else {
        await addTabToSheet(token, m.sheet_id, tabName, defaultColumnsFor(addModuleType, tabType));
      }

      const newManifest = { ...m, tabs: [...m.tabs, newTab] };
      await updateManifestInSheet(token, m.sheet_id, newManifest);
      dispatch({ type: 'UPDATE_SITE_MANIFEST', payload: newManifest });
      setShowAdd(false); setAddModuleType(''); setAddModuleLabel(''); setAddFormConfig({ ...DEFAULT_FORM_CONFIG });
    } catch (err) { setError((err as Error).message); }
    finally { setSaving(false); }
  }

  function handlePreviewManifest() {
    const guide    = buildManifestGuide(m);
    const content  = JSON.stringify({ ...m, ...guide }, null, 2);
    setPreview({ title: `${m.project_slug}-manifest.json`, content, filename: `${m.project_slug}-manifest.json` });
  }

  function handlePreviewClaudeMd() {
    const content = generateClaudeMd(m, date);
    setPreview({ title: 'CLAUDE.md — AI Skill instructions', content, filename: 'CLAUDE.md' });
  }

  const addIsForm = addModuleType === 'form' || addModuleType === 'newsletter';

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
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-subtle)' }}>
              {m.google_account}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
              {m.project_slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              {m.tabs.length} module{m.tabs.length !== 1 ? 's' : ''} · spun {date}
            </p>
          </div>
          <button type="button"
            onClick={() => dispatch({ type: 'RESET_SITE_STARTER' })}
            className="text-xs font-medium mt-1 transition-colors shrink-0"
            style={{ color: 'var(--color-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)'; }}
          >
            ← All sites
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border px-4 py-3 text-sm flex items-start justify-between gap-3"
            style={{ background: 'oklch(0.40 0.18 25 / 0.10)', borderColor: 'oklch(0.55 0.20 25 / 0.30)', color: 'var(--color-error)' }}>
            {error}
            <button type="button" onClick={() => setError('')} className="shrink-0 text-xs">✕</button>
          </div>
        )}

        {/* API endpoint */}
        <div className="flex flex-col gap-3 p-4 rounded-xl border"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>API Endpoint</p>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
            <span className="flex-1 text-xs font-mono truncate" style={{ color: 'var(--color-text)' }}>
              {m.script_url}
            </span>
            <CopyButton text={m.script_url} />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Token: <code className="font-mono px-1.5 py-0.5 rounded text-[11px]"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                {m.script_token}
              </code>
            </p>
            <CopyButton text={m.script_token} />
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {[
              { label: 'Open Google Sheet',  href: m.sheet_url },
              { label: 'Open Drive Folder',  href: m.drive_root_folder_url },
            ].map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium"
                style={{ color: 'var(--color-muted)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-muted)'; }}>
                <ExternalLinkIcon /> {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Modules */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
            Modules ({m.tabs.length})
          </p>

          <div className="flex flex-col gap-2">
            {m.tabs.map((tab) => (
              <div key={tab.name}>
                <ModuleRow
                  tab={tab}
                  onEdit={() => openEdit(tab)}
                  onSeed={() => openSeed(tab)}
                  onConfirmRemove={() => { setRemovingTab(tab.name); setEditingTab(null); setSeedingTab(null); }}
                  onCancelRemove={() => setRemovingTab(null)}
                  onRemove={() => handleRemoveTab(tab.name)}
                  isEditing={editingTab === tab.name}
                  isSeedOpen={seedingTab === tab.name}
                  isConfirmingRemove={removingTab === tab.name}
                  saving={saving && removingTab === tab.name}
                />

                {/* Form field editor */}
                <AnimatePresence>
                  {editingTab === tab.name && editFormConfig && (
                    <motion.div key="edit" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="mt-1 rounded-xl border p-4 flex flex-col gap-4"
                        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-accent)' }}>
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>
                          Edit fields — {tab.label}
                        </p>
                        <FormFieldEditor config={editFormConfig} onChange={setEditFormConfig} />
                        <div className="flex gap-2">
                          <button type="button" onClick={handleSaveFormEdit} disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-40"
                            style={{ background: 'var(--color-accent)', color: '#fff' }}>
                            {saving ? <SpinnerIcon /> : null} Save changes
                          </button>
                          <button type="button" onClick={() => { setEditingTab(null); setEditFormConfig(null); }}
                            className="px-4 py-2 rounded-lg text-xs font-medium"
                            style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Seed AI panel */}
                <AnimatePresence>
                  {seedingTab === tab.name && (
                    <motion.div key="seed" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="mt-1 rounded-xl border p-4 flex flex-col gap-3"
                        style={{ background: 'var(--color-surface)', borderColor: 'oklch(0.65 0.22 285)' }}>
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'oklch(0.65 0.22 285)' }}>
                          Seed AI data — {tab.label}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Rows:</span>
                          <select value={seedCount} onChange={(e) => setSeedCount(Number(e.target.value))}
                            className="rounded-lg px-2 py-1 text-xs"
                            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                            {[3, 5, 10, 20].map((n) => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                        {seedMsg && <p className="text-xs" style={{ color: 'var(--color-success)' }}>{seedMsg}</p>}
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleSeedData(tab)} disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-40"
                            style={{ background: 'oklch(0.65 0.22 285)', color: '#fff' }}>
                            {saving ? <SpinnerIcon /> : null} Generate &amp; add rows
                          </button>
                          <button type="button" onClick={() => { setSeedingTab(null); setSeedMsg(''); }}
                            className="px-4 py-2 rounded-lg text-xs font-medium"
                            style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                            Close
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Add module */}
          {!showAdd ? (
            <button type="button" onClick={() => { setShowAdd(true); setAddModuleType(''); setAddModuleLabel(''); }}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border text-xs font-semibold transition-all"
              style={{ background: 'var(--color-accent-subtle)', borderColor: 'var(--color-accent-border)', color: 'var(--color-accent)' }}>
              + Add Module
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border p-4 flex flex-col gap-4"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-accent)' }}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>Add module</p>
                <button type="button" onClick={() => setShowAdd(false)} className="text-xs" style={{ color: 'var(--color-muted)' }}>✕</button>
              </div>

              {/* Type grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ADD_MODULE_TYPES.map((m) => (
                  <button key={m.moduleType} type="button"
                    onClick={() => {
                      setAddModuleType(m.moduleType);
                      setAddFormConfig(m.moduleType === 'newsletter' ? { ...DEFAULT_NEWSLETTER_CONFIG } : { ...DEFAULT_FORM_CONFIG });
                    }}
                    className="text-left p-2.5 rounded-lg border transition-all"
                    style={{
                      background:  addModuleType === m.moduleType ? 'var(--color-accent-subtle)' : 'var(--color-surface-2)',
                      borderColor: addModuleType === m.moduleType ? 'var(--color-accent)' : 'var(--color-border)',
                    }}>
                    <p className="text-xs font-semibold" style={{ color: addModuleType === m.moduleType ? 'var(--color-accent)' : 'var(--color-text)' }}>
                      {m.label}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-subtle)' }}>{m.description}</p>
                  </button>
                ))}
              </div>

              {addModuleType && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>Module name</label>
                  <input type="text" value={addModuleLabel} onChange={(e) => setAddModuleLabel(e.target.value)}
                    placeholder={`e.g. ${ADD_MODULE_TYPES.find((m) => m.moduleType === addModuleType)?.label ?? 'Module'}`}
                    autoFocus
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
              )}

              {addIsForm && addModuleType && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>Form fields</p>
                  <FormFieldEditor config={addFormConfig} onChange={setAddFormConfig} />
                </div>
              )}

              {addModuleType && (
                <div className="flex gap-2">
                  <button type="button" onClick={handleAddModule}
                    disabled={saving || addModuleLabel.trim().length < 2}
                    className="flex items-center gap-1.5 flex-1 justify-center py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: 'var(--color-accent)', color: '#fff' }}>
                    {saving ? <SpinnerIcon /> : null} Add to site
                  </button>
                  <button type="button" onClick={() => setShowAdd(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium"
                    style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                    Cancel
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Authorization */}
        <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'oklch(0.78 0.18 75 / 0.30)' }}>
          <div className="flex items-center gap-3 px-4 py-2.5"
            style={{ background: 'oklch(0.78 0.18 75 / 0.08)', borderBottom: '1px solid oklch(0.78 0.18 75 / 0.20)' }}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'oklch(0.78 0.18 75)' }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'oklch(0.78 0.18 75)' }}>
              One-time authorization required
            </p>
          </div>
          <div className="flex flex-col gap-3 px-4 py-4" style={{ background: 'var(--color-surface)' }}>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Open the script in your browser. Google will ask you to authorize it once. After approving you&apos;ll see:
            </p>
            <div className="rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2 px-3 py-1.5"
                style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                <div className="flex gap-1.5">
                  {['oklch(0.65 0.20 25)', 'oklch(0.78 0.18 75)', 'oklch(0.72 0.18 145)'].map((c) => (
                    <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                  ))}
                </div>
                <span className="text-[10px] font-mono truncate flex-1" style={{ color: 'var(--color-subtle)' }}>
                  {m.script_url.slice(0, 60)}…
                </span>
              </div>
              <div className="px-4 py-3" style={{ background: 'var(--color-bg)' }}>
                <pre className="text-[11px] font-mono leading-relaxed" style={{ color: 'var(--color-success)' }}>
{`{
  "status": "ok",
  "message": "API is live. Pass token and tab parameters to query data."
}`}
                </pre>
              </div>
            </div>
            <a href={m.script_url} target="_blank" rel="noopener noreferrer"
              className="self-start inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
              style={{ background: 'oklch(0.78 0.18 75 / 0.12)', color: 'oklch(0.78 0.18 75)', border: '1px solid oklch(0.78 0.18 75 / 0.30)' }}>
              <ExternalLinkIcon /> Open Script to Authorize
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <button type="button" onClick={handlePreviewClaudeMd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-colors focus:outline-none"
            style={{ background: 'var(--color-accent-subtle)', borderColor: 'var(--color-accent-border)', color: 'var(--color-accent)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-subtle)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent-border)'; }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 3h12M1 7h8M1 11h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
            AI Skill (CLAUDE.md)
          </button>
          <button type="button" onClick={handlePreviewManifest}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none"
            style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 5h6M4 8h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Manifest (JSON)
          </button>
        </div>

      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {preview && (
          <PreviewModal entry={preview} onClose={() => setPreview(null)} />
        )}
      </AnimatePresence>

    </motion.main>
  );
}
