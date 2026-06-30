'use client';

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '@/context/AppContext';
import {
  updateManifestInSheet,
  addTabToSheet,
  removeTabFromSheet,
  updateTabHeaders,
  renameSite,
} from '@/lib/siteTabHelpers';
import { toFieldKey, redeploySiteCapabilities } from '@/lib/createSite';
import FormFieldEditor, { DEFAULT_FORM_CONFIG } from '@/components/FormFieldEditor';
import TestFormDialog from '@/components/TestFormDialog';
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

function InfoIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M6 5.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="6" cy="3.75" r="0.6" fill="currentColor"/>
    </svg>
  );
}

// ─── Tooltip link ─────────────────────────────────────────────────────────────

function WarningIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1L11.2 10H.8L6 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M6 5v2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="6" cy="9" r="0.6" fill="currentColor"/>
    </svg>
  );
}

function TooltipLink({ href, label, tooltip, variant = 'default' }: {
  href: string;
  label: string;
  tooltip: string;
  variant?: 'default' | 'warning';
}) {
  const [show, setShow] = useState(false);

  const isWarning = variant === 'warning';
  const amber = 'var(--color-warning)';

  return (
    <div className="relative inline-flex">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-description={tooltip}
        className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
        style={isWarning ? {
          background:   'var(--color-warning-bg)',
          border:       `1px solid var(--color-warning-border)`,
          color:        amber,
          borderRadius: '999px',
          padding:      '3px 9px 3px 8px',
        } : {
          color: show ? 'var(--color-accent)' : 'var(--color-muted)',
        }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
      >
        {isWarning ? <WarningIcon /> : <ExternalLinkIcon />}
        {label}
        {isWarning && (
          <>
            <span aria-hidden className="self-stretch w-px my-0.5" style={{ background: 'var(--color-warning)' }} />
            <InfoIcon />
          </>
        )}
      </a>
      {show && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg px-3 py-2 text-xs leading-relaxed shadow-lg z-10 pointer-events-none"
          style={{
            background: 'var(--color-surface-2)',
            border:     '1px solid var(--color-border)',
            color:      'var(--color-text)',
          }}
          role="tooltip"
        >
          {tooltip}
        </div>
      )}
    </div>
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
        background: copied ? 'var(--color-success-bg)' : 'var(--color-surface-2)',
        color:      copied ? 'var(--color-success)' : 'var(--color-muted)',
        border:     '1px solid var(--color-border)',
      }}
    >
      <CopyIcon copied={copied} />
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeTabName(label: string, existing: string[]): string {
  const base = label.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 20) || 'form';
  if (!existing.includes(base)) return base;
  let n = 2;
  while (existing.includes(`${base}${n}`)) n++;
  return `${base}${n}`;
}

// ─── RGFORMS.md generator ─────────────────────────────────────────────────────

function generateClaudeMd(manifest: SiteManifest, date: string): string {
  const { project_slug, script_url, sheet_url, drive_root_folder_url, tabs, captcha } = manifest;
  const captchaOn = !!captcha?.enabled;

  const tabDocs = tabs
    .filter((tab) => tab.type === 'form')
    .map((tab) => {
      const fields = tab.formConfig?.fields ?? [];
      const fieldLines = fields.length
        ? fields.map((f) => `    - ${f.label} [key: ${toFieldKey(f.label)}, type: ${f.type}${f.required ? ', required' : ''}]`).join('\n')
        : '    - name, email, phone, message';
      const honeypot = tab.formConfig?.enableHoneypot
        ? '\n  Spam: include `<input type="text" name="_hp" style="display:none" tabindex="-1" />` — script discards submissions with this filled.'
        : '';
      const cc  = tab.formConfig?.ccEmails?.length  ? `\n  CC:  ${tab.formConfig.ccEmails.join(', ')}` : '';
      const bcc = tab.formConfig?.bccEmails?.length ? `\n  BCC: ${tab.formConfig.bccEmails.join(', ')}` : '';
      return `#### \`${tab.name}\` — ${tab.label}\nPOST to /api/form/submit with \`{ tab: "${tab.name}", fields: { ... } }\`\nFields:\n${fieldLines}${honeypot}${cc}${bcc}\nResponse: \`{ result: "success" }\` or \`{ result: "error", error: "..." }\``;
    })
    .join('\n\n');

  const anyHoneypot = tabs.some((t) => t.formConfig?.enableHoneypot);

  return `# ${project_slug} — RG Forms

Generated by RG Forms on ${date}

---

## Architecture

One Google Sheet · One Apps Script web app · All submissions in your Google Drive.

- **Sheet**: ${sheet_url}
- **Drive folder**: ${drive_root_folder_url}
- **API endpoint**: \`${script_url}\`

---

## Submitting to the endpoint

\`\`\`typescript
// POST directly from your site — no server proxy needed.
// IMPORTANT: use Content-Type: text/plain to avoid a CORS preflight.
// Apps Script ignores OPTIONS requests, so application/json will be
// blocked by the browser. The body is still JSON; the script parses it fine.
const res = await fetch('${script_url}', {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain' },
  body: JSON.stringify({ tab: 'contact', fields }),
});
const data = await res.json();
// { result: 'success' } or { result: 'error', error: '...' }
\`\`\`
${captchaOn ? `
---

## Spam protection (Cloudflare Turnstile)

This form has Turnstile **enabled** — the backend verifies a captcha token on every
submission and rejects requests without a valid one. You must render the widget and
send its token as the \`_captcha\` field.

1. Load the Turnstile script in your page \`<head>\`:

\`\`\`html
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
\`\`\`

2. Render the widget inside your form (site key is public):

\`\`\`html
<div class="cf-turnstile" data-sitekey="${captcha?.siteKey || 'YOUR_SITE_KEY'}"></div>
\`\`\`

3. Send the token (Turnstile writes it to a hidden \`cf-turnstile-response\` input) as \`_captcha\`:

\`\`\`typescript
const token = (document.querySelector('[name="cf-turnstile-response"]') as HTMLInputElement)?.value;
const res = await fetch('${script_url}', {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain' },
  body: JSON.stringify({ tab: 'contact', fields: { ...fields, _captcha: token } }),
});
\`\`\`

If protection is toggled off later in the RG Forms dashboard, the token is simply
ignored — you can leave the widget in place. If it's on and no token is sent, the
response is \`{ result: "error", error: "Spam protection is enabled but no captcha token was sent…" }\`.
` : ''}
---

## Environment variables

\`\`\`
FORM_SCRIPT_URL=${script_url}
\`\`\`

---

## API reference

${tabDocs}

---

## Usage notes

1. **Authorization**: Visit the script URL once in your browser as the account owner to authorize before first use.
2. **CORS**: Always use \`Content-Type: text/plain\` — never \`application/json\`. Apps Script cannot respond to the CORS preflight that \`application/json\` triggers, which causes the browser to block the request. The body is still JSON; the script parses it correctly.
3. **Cold starts**: Apps Script takes ~800ms–2s on the first request after inactivity. Normal after that.
4. **Form responses**: \`{ result: "success" }\` on success, \`{ result: "error", error: "..." }\` on failure.
${anyHoneypot ? `5. **Honeypot**: include \`<input type="text" name="_hp" style="display:none" tabindex="-1" />\`. Script silently discards submissions where this is filled.` : ''}
${captchaOn ? `6. **Captcha**: Turnstile is enabled — render the widget and send its token as \`_captcha\` (see "Spam protection" above). Submissions without a valid token are rejected.` : ''}

---

## Instructions for AI assistants

When building UI for this form:
1. POST \`{ tab, fields }\` directly to \`${script_url}\`.
2. Set \`Content-Type: text/plain\` — NOT \`application/json\`. This prevents a CORS preflight that Apps Script cannot handle.
3. The endpoint is public — no auth token required.${captchaOn ? `\n4. **Spam protection is ON.** Add the Cloudflare Turnstile widget (site key \`${captcha?.siteKey || 'YOUR_SITE_KEY'}\`) and send its token as the \`_captcha\` field, or every submission is rejected.` : ''}
${captchaOn ? '5' : '4'}. Check \`data.result === "success"\` for the response.
`;
}

// ─── Manifest guide ───────────────────────────────────────────────────────────

function buildManifestGuide(manifest: SiteManifest) {
  const { script_url, captcha } = manifest;
  const captchaOn = !!captcha?.enabled;
  return {
    _readme: 'Implementation guide — safe to delete once your form is wired up.',
    form_submissions: {
      note: 'POST { tab, fields } directly to script_url — no auth token required.',
      response_success: '{ result: "success" }',
      response_error:   '{ result: "error", error: "..." }',
      example: [
        '// Use text/plain to avoid CORS preflight — body is still JSON',
        'const res = await fetch(FORM_SCRIPT_URL, {',
        '  method: "POST", headers: { "Content-Type": "text/plain" },',
        `  body: JSON.stringify({ tab: "contact", fields${captchaOn ? ': { ...fields, _captcha: turnstileToken }' : ''} }),`,
        '});',
      ].join('\n'),
      env_example: `FORM_SCRIPT_URL=${script_url}`,
    },
    ...(captchaOn ? {
      spam_protection: {
        provider: 'cloudflare-turnstile',
        note: 'Captcha is ON — render the Turnstile widget and send its token as the _captcha field, or submissions are rejected. See RGFORMS.md for the snippet.',
        site_key: captcha?.siteKey || '',
        script: 'https://challenges.cloudflare.com/turnstile/v0/api.js',
      },
    } : {}),
    authorization: 'Visit script_url once in your browser as the Google account owner to authorize.',
  };
}

// ─── Form row ─────────────────────────────────────────────────────────────────

function FormRow({
  tab, onEdit, onTest, onConfirmRemove, onCancelRemove, onRemove,
  isEditing, isConfirmingRemove, saving,
}: {
  tab: SiteTab;
  onEdit: () => void;
  onTest: () => void;
  onConfirmRemove: () => void;
  onCancelRemove: () => void;
  onRemove: () => void;
  isEditing: boolean;
  isConfirmingRemove: boolean;
  saving: boolean;
}) {
  const color = 'var(--color-warning)';

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background:  'var(--color-surface)',
        borderColor: isConfirmingRemove
          ? 'var(--color-error-border)'
          : isEditing ? 'var(--color-accent)' : 'var(--color-border)',
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{tab.label}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide mt-0.5" style={{ color }}>
            form{tab.formConfig?.fields.length ? ` · ${tab.formConfig.fields.length} fields` : ''}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button type="button" onClick={onTest} disabled={saving}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
            style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; }}
          >
            Test
          </button>
          <button type="button" onClick={onEdit} disabled={saving}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
            style={{
              background: isEditing ? 'var(--color-accent)' : 'var(--color-surface-2)',
              color:      isEditing ? '#fff' : 'var(--color-muted)',
              border:     `1px solid ${isEditing ? 'var(--color-accent)' : 'var(--color-border)'}`,
            }}>
            Edit fields
          </button>
          <button type="button" onClick={onConfirmRemove} disabled={saving}
            className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors disabled:opacity-40"
            style={{ color: 'var(--color-subtle)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-error)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-subtle)'; }}
            title="Remove form"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1.5 3h10M4.5 3V2h4v1M4 3l.5 7.5M9 3l-.5 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {isConfirmingRemove && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t"
          style={{ background: 'var(--color-error-bg)', borderColor: 'var(--color-error-border)' }}>
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
      style={{ background: 'rgba(15,30,28,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xl)' }}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.18 }}
      >
        <div className="flex items-center gap-3 px-5 py-3.5 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}>
          <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            {entry.title}
          </span>
          <button
            type="button" onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: copied ? 'var(--color-success-bg)' : 'var(--color-surface-2)',
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

// ─── Collapsible capability card ──────────────────────────────────────────────

function StatusPill({ on, label }: { on: boolean; label: string }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0"
      style={{
        background: on ? 'var(--color-success-bg)' : 'var(--color-surface-2)',
        color:      on ? 'var(--color-success)' : 'var(--color-subtle)',
        border:     `1px solid ${on ? 'var(--color-success-border)' : 'var(--color-border)'}`,
      }}>
      {label}
    </span>
  );
}

function CollapsibleCard({ title, pill, open, onToggle, children }: {
  title: string; pill: ReactNode; open: boolean; onToggle: () => void; children: ReactNode;
}) {
  return (
    <div className="rounded-xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between gap-3 px-4 py-3">
        <span className="flex items-center gap-2 min-w-0">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
            style={{ color: 'var(--color-subtle)', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
            <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs font-bold uppercase tracking-widest truncate" style={{ color: 'var(--color-muted)' }}>{title}</span>
        </span>
        {pill}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 flex flex-col gap-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SiteKit() {
  const { state, dispatch } = useApp();
  const manifest = state.siteManifest;
  const token    = state.auth.accessToken!;

  const [editingTab,  setEditingTab]  = useState<string | null>(null);
  const [removingTab, setRemovingTab] = useState<string | null>(null);
  const [showAdd,     setShowAdd]     = useState(false);

  const [editFormConfig, setEditFormConfig] = useState<SiteTabFormConfig | null>(null);
  const [addFormLabel,   setAddFormLabel]   = useState('');
  const [addFormConfig,  setAddFormConfig]  = useState<SiteTabFormConfig>({ ...DEFAULT_FORM_CONFIG });

  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState('');
  const [preview,        setPreview]        = useState<PreviewEntry | null>(null);
  const [testingTab,     setTestingTab]     = useState<SiteTab | null>(null);

  const [renamingProject, setRenamingProject] = useState(false);
  const [renameValue,     setRenameValue]     = useState('');
  const [renameSaving,    setRenameSaving]    = useState(false);

  const [captchaDraft,  setCaptchaDraft]  = useState<{ enabled: boolean; siteKey: string; secret: string } | null>(null);
  const [captchaSaving, setCaptchaSaving] = useState(false);

  // Capability upgrades (in-place redeploy) + the re-auth prompt they trigger.
  const [upgrading,    setUpgrading]    = useState<null | 'email' | 'captcha'>(null);
  const [needsReauth,  setNeedsReauth]  = useState(false);
  const [enableEmailValue, setEnableEmailValue] = useState(manifest?.google_account ?? '');
  const [enableCaptchaKeys, setEnableCaptchaKeys] = useState({ siteKey: '', secret: '' });
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [emailSaving, setEmailSaving] = useState(false);
  const [showEmailCard,   setShowEmailCard]   = useState(false);
  const [showCaptchaCard, setShowCaptchaCard] = useState(false);

  if (!manifest) return null;
  const m: SiteManifest = manifest;

  const emailGranted   = m.capabilities?.email ?? !!m.notification_email;
  const captchaGranted = m.capabilities?.captcha ?? !!m.captcha;
  const canUpgrade     = !!m.script_id;
  const scriptEditorUrl = m.script_id ? `https://script.google.com/d/${m.script_id}/edit` : m.script_url;
  const captcha = captchaDraft ?? {
    enabled: m.captcha?.enabled ?? false,
    siteKey: m.captcha?.siteKey ?? '',
    secret:  m.captcha?.secret ?? '',
  };
  const captchaDirty =
    captcha.enabled !== (m.captcha?.enabled ?? false) ||
    captcha.siteKey !== (m.captcha?.siteKey ?? '') ||
    captcha.secret  !== (m.captcha?.secret ?? '');

  async function handleSaveCaptcha() {
    setCaptchaSaving(true); setError('');
    try {
      const newManifest: SiteManifest = {
        ...m,
        captcha: { provider: 'turnstile', enabled: captcha.enabled, siteKey: captcha.siteKey.trim(), secret: captcha.secret.trim() },
      };
      await updateManifestInSheet(token, m.sheet_id, newManifest);
      dispatch({ type: 'UPDATE_SITE_MANIFEST', payload: newManifest });
      setCaptchaDraft(null);
    } catch (err) { setError((err as Error).message); }
    finally { setCaptchaSaving(false); }
  }

  // Add the captcha capability to an existing project: redeploy the script with
  // the external_request scope (same URL, same sheet), then persist the config.
  async function handleEnableCaptcha() {
    setUpgrading('captcha'); setError('');
    try {
      await redeploySiteCapabilities(token, m, { email: emailGranted, captcha: true });
      const newManifest: SiteManifest = {
        ...m,
        capabilities: { email: emailGranted, captcha: true },
        captcha: { provider: 'turnstile', enabled: false, siteKey: enableCaptchaKeys.siteKey.trim(), secret: enableCaptchaKeys.secret.trim() },
      };
      await updateManifestInSheet(token, m.sheet_id, newManifest);
      dispatch({ type: 'UPDATE_SITE_MANIFEST', payload: newManifest });
      setEnableCaptchaKeys({ siteKey: '', secret: '' });
      setNeedsReauth(true);
    } catch (err) { setError((err as Error).message); }
    finally { setUpgrading(null); }
  }

  // Add the email-notifications capability to an existing project.
  async function handleEnableEmail() {
    setUpgrading('email'); setError('');
    try {
      await redeploySiteCapabilities(token, m, { email: true, captcha: captchaGranted });
      const newManifest: SiteManifest = {
        ...m,
        capabilities: { email: true, captcha: captchaGranted },
        notification_email: enableEmailValue.trim(),
      };
      await updateManifestInSheet(token, m.sheet_id, newManifest);
      dispatch({ type: 'UPDATE_SITE_MANIFEST', payload: newManifest });
      setNeedsReauth(true);
    } catch (err) { setError((err as Error).message); }
    finally { setUpgrading(null); }
  }

  // Edit the notification address (scope already granted — manifest only, no redeploy).
  async function handleSaveEmail() {
    if (emailDraft === null) return;
    setEmailSaving(true); setError('');
    try {
      const newManifest: SiteManifest = { ...m, notification_email: emailDraft.trim() };
      await updateManifestInSheet(token, m.sheet_id, newManifest);
      dispatch({ type: 'UPDATE_SITE_MANIFEST', payload: newManifest });
      setEmailDraft(null);
    } catch (err) { setError((err as Error).message); }
    finally { setEmailSaving(false); }
  }

  const date = new Date(m.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  function openEdit(tab: SiteTab) {
    if (editingTab === tab.name) { setEditingTab(null); setEditFormConfig(null); return; }
    setEditingTab(tab.name);
    setEditFormConfig(tab.formConfig ? { ...tab.formConfig, fields: [...tab.formConfig.fields] } : { ...DEFAULT_FORM_CONFIG });
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

  async function handleAddForm() {
    if (addFormLabel.trim().length < 2) return;
    setSaving(true); setError('');
    try {
      const label   = addFormLabel.trim();
      const tabName = makeTabName(label, m.tabs.map((t) => t.name));
      const newTab: SiteTab = {
        name:       tabName,
        label,
        type:       'form',
        moduleType: 'form',
        nameSuffix: label,
        formConfig: addFormConfig,
      };
      await addTabToSheet(token, m.sheet_id, tabName,
        ['submitted_at', ...addFormConfig.fields.map((f) => toFieldKey(f.label))]);
      const newManifest = { ...m, tabs: [...m.tabs, newTab] };
      await updateManifestInSheet(token, m.sheet_id, newManifest);
      dispatch({ type: 'UPDATE_SITE_MANIFEST', payload: newManifest });
      setShowAdd(false); setAddFormLabel(''); setAddFormConfig({ ...DEFAULT_FORM_CONFIG });
    } catch (err) { setError((err as Error).message); }
    finally { setSaving(false); }
  }

  function handlePreviewManifest() {
    const guide = buildManifestGuide(m);
    // Redact the Turnstile secret — this manifest is meant to be copied/committed,
    // and the secret must never leave the owner's private Sheet.
    const safe = m.captcha
      ? { ...m, captcha: { ...m.captcha, secret: m.captcha.secret ? '••• stored in your private Sheet •••' : '' } }
      : m;
    const content = JSON.stringify({ ...safe, ...guide }, null, 2);
    setPreview({ title: `${m.project_slug}-manifest.json`, content, filename: `${m.project_slug}-manifest.json` });
  }

  function handlePreviewClaudeMd() {
    const content = generateClaudeMd(m, date);
    setPreview({ title: 'RGFORMS.md — AI skill', content, filename: 'RGFORMS.md' });
  }

  function startRename() {
    setRenameValue(m.site_name);
    setRenamingProject(true);
  }

  async function handleRenameProject() {
    const newName = renameValue.trim();
    if (!newName || newName === m.site_name) { setRenamingProject(false); return; }
    setRenameSaving(true); setError('');
    try {
      await renameSite(token, m.sheet_id, m.drive_root_folder_id, newName);
      const newSlug     = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const newManifest = { ...m, site_name: newName, project_slug: newSlug };
      await updateManifestInSheet(token, m.sheet_id, newManifest);
      dispatch({ type: 'UPDATE_SITE_MANIFEST', payload: newManifest });
      setRenamingProject(false);
    } catch (err) { setError((err as Error).message); }
    finally { setRenameSaving(false); }
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
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-subtle)' }}>
              {m.google_account}
            </p>
            {renamingProject ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRenameProject(); if (e.key === 'Escape') setRenamingProject(false); }}
                  disabled={renameSaving}
                  className="text-2xl sm:text-3xl font-bold bg-transparent border-b-2 outline-none w-full"
                  style={{ color: 'var(--color-text)', borderColor: 'var(--color-accent)' }}
                />
                <button type="button" onClick={handleRenameProject} disabled={renameSaving}
                  className="shrink-0 text-xs font-semibold px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                  style={{ background: 'var(--color-accent)', color: '#fff' }}>
                  {renameSaving ? <SpinnerIcon /> : 'Save'}
                </button>
                <button type="button" onClick={() => setRenamingProject(false)} disabled={renameSaving}
                  className="shrink-0 text-xs font-medium px-2 py-1 rounded-lg transition-colors"
                  style={{ color: 'var(--color-muted)', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                  {m.site_name}
                </h1>
                <button type="button" onClick={startRename} title="Rename project"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                  style={{ color: 'var(--color-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)'; }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5zM8.5 3.5l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              {m.tabs.length} form{m.tabs.length !== 1 ? 's' : ''} · created {date}
            </p>
          </div>
          <button type="button"
            onClick={() => dispatch({ type: 'RESET_SITE_STARTER' })}
            className="text-xs font-medium mt-1 transition-colors shrink-0"
            style={{ color: 'var(--color-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)'; }}
          >
            ← All projects
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border px-4 py-3 text-sm flex items-start justify-between gap-3"
            style={{ background: 'var(--color-error-bg)', borderColor: 'var(--color-error-border)', color: 'var(--color-error)' }}>
            {error}
            <button type="button" onClick={() => setError('')} className="shrink-0 text-xs">✕</button>
          </div>
        )}

        {/* Re-authorize required (after a capability upgrade) */}
        {needsReauth && (
          <div className="rounded-xl border px-4 py-3.5 flex flex-col gap-2"
            style={{ background: 'var(--color-warning-bg)', borderColor: 'var(--color-warning-border)', color: 'var(--color-warning)' }}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold">Action required: re-authorize the script</p>
              <button type="button" onClick={() => setNeedsReauth(false)} className="shrink-0 text-xs">✕</button>
            </div>
            <p className="text-xs leading-relaxed">
              The new capability is deployed and your form URL is unchanged — but until you approve the added permission,
              the script may <strong>reject submissions</strong>, so do this now. Open the script editor, run any function
              (or use <strong>Deploy → Test deployments</strong>), and click <strong>Review permissions → Allow</strong>.
              Google may show an &ldquo;App isn&apos;t verified&rdquo; warning — choose <strong>Advanced → Continue</strong>.
            </p>
            <a href={scriptEditorUrl} target="_blank" rel="noopener noreferrer"
              className="self-start inline-flex items-center gap-1.5 text-xs font-semibold mt-0.5">
              <ExternalLinkIcon /> Open script editor
            </a>
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
          <div className="flex items-center gap-4 flex-wrap">
            {[
              { label: 'Open Google Sheet', href: m.sheet_url },
              { label: 'Open Drive Folder', href: m.drive_root_folder_url },
            ].map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium"
                style={{ color: 'var(--color-muted)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-muted)'; }}>
                <ExternalLinkIcon /> {link.label}
              </a>
            ))}
            <TooltipLink
              href={m.script_url}
              label="Open Script to Authorize"
              tooltip="Google requires a one-time authorization after your script is deployed. Click to open the script in your browser, then approve the permissions dialog when prompted. You only need to do this once."
              variant="warning"
            />
          </div>
        </div>

        {/* Capabilities */}
        <div className="flex flex-col gap-2">
        {/* Email notifications */}
        <CollapsibleCard
          title="Email notifications"
          open={showEmailCard}
          onToggle={() => setShowEmailCard((v) => !v)}
          pill={<StatusPill on={emailGranted && !!m.notification_email} label={emailGranted ? (m.notification_email ? 'On' : 'Off') : 'Add'} />}
        >
          {!emailGranted ? (
            !canUpgrade ? (
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                This project was created before in-place upgrades were supported, so the{' '}
                <code className="font-mono text-[11px]">script.send_mail</code> scope can&apos;t be added automatically —
                recreate the project with email notifications enabled to use them.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  Get an email on every submission. We&apos;ll redeploy the script with the{' '}
                  <code className="font-mono text-[11px]">script.send_mail</code> scope — same endpoint URL and sheet.
                  You must re-authorize right after (the form may reject submissions until you do).
                </p>
                <input type="email" value={enableEmailValue} onChange={(e) => setEnableEmailValue(e.target.value)}
                  placeholder="you@example.com"
                  className="rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                <button type="button" onClick={handleEnableEmail}
                  disabled={upgrading !== null || !enableEmailValue.trim().includes('@')}
                  className="self-start flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-40"
                  style={{ background: 'var(--color-accent)', color: '#fff' }}>
                  {upgrading === 'email' ? <SpinnerIcon /> : null}
                  {upgrading === 'email' ? 'Redeploying…' : 'Enable email notifications'}
                </button>
              </div>
            )
          ) : (
            <>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                Submissions are emailed to this address. Clear it to stop notifications — no redeploy needed.
              </p>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
                  Notification address
                </label>
                <input type="email" value={emailDraft ?? m.notification_email ?? ''}
                  onChange={(e) => setEmailDraft(e.target.value)}
                  placeholder="you@example.com"
                  className="rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
              </div>
              {emailDraft !== null && emailDraft.trim() !== (m.notification_email ?? '') && (
                <div className="flex gap-2">
                  <button type="button" onClick={handleSaveEmail} disabled={emailSaving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-40"
                    style={{ background: 'var(--color-accent)', color: '#fff' }}>
                    {emailSaving ? <SpinnerIcon /> : null} Save changes
                  </button>
                  <button type="button" onClick={() => setEmailDraft(null)} disabled={emailSaving}
                    className="px-4 py-2 rounded-lg text-xs font-medium"
                    style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </CollapsibleCard>

        {/* Spam protection */}
        <CollapsibleCard
          title="Spam protection"
          open={showCaptchaCard}
          onToggle={() => setShowCaptchaCard((v) => !v)}
          pill={<StatusPill on={captchaGranted && captcha.enabled} label={captchaGranted ? (captcha.enabled ? 'On' : 'Off') : 'Add'} />}
        >
          {!captchaGranted ? (
            !canUpgrade ? (
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                This project was created before in-place upgrades were supported, so the{' '}
                <code className="font-mono text-[11px]">script.external_request</code> scope can&apos;t be added
                automatically — recreate the project with spam protection enabled to use Turnstile. (The honeypot field
                works on any form without it.)
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  Add Cloudflare Turnstile to this project. We&apos;ll redeploy the script with the{' '}
                  <code className="font-mono text-[11px]">script.external_request</code> scope — your endpoint URL and
                  sheet stay exactly the same. You must re-authorize right after (the form may reject submissions until
                  you do), then turn validation on once the widget is on your site.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
                      Site key (public)
                    </label>
                    <input type="text" value={enableCaptchaKeys.siteKey}
                      onChange={(e) => setEnableCaptchaKeys((k) => ({ ...k, siteKey: e.target.value }))}
                      placeholder="0x4AAAA…"
                      className="rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                      style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
                      Secret key (private)
                    </label>
                    <input type="password" value={enableCaptchaKeys.secret}
                      onChange={(e) => setEnableCaptchaKeys((k) => ({ ...k, secret: e.target.value }))}
                      placeholder="0x4AAAA…"
                      className="rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                      style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                  </div>
                </div>
                <button type="button" onClick={handleEnableCaptcha} disabled={upgrading !== null}
                  className="self-start flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-40"
                  style={{ background: 'var(--color-accent)', color: '#fff' }}>
                  {upgrading === 'captcha' ? <SpinnerIcon /> : null}
                  {upgrading === 'captcha' ? 'Redeploying…' : 'Enable spam protection'}
                </button>
              </div>
            )
          ) : (
            <>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                Turnstile verifies each submission server-side. Toggle it on once the widget is live on your site —
                changes take effect immediately, no redeploy. See <strong style={{ color: 'var(--color-text)' }}>RGFORMS.md</strong> for the widget snippet.
              </p>

              <label className="flex items-center gap-3 self-start cursor-pointer select-none">
                <span
                  className="relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors duration-200"
                  style={{
                    background:  captcha.enabled ? 'var(--color-accent)' : 'var(--color-surface-2)',
                    borderColor: captcha.enabled ? 'var(--color-accent)' : 'var(--color-border)',
                  }}
                  onClick={() => setCaptchaDraft({ ...captcha, enabled: !captcha.enabled })}
                >
                  <span className="pointer-events-none absolute top-0.5 h-4 w-4 rounded-full shadow transition-transform duration-200"
                    style={{ background: '#fff', transform: captcha.enabled ? 'translateX(16px)' : 'translateX(2px)' }} />
                </span>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}
                  onClick={() => setCaptchaDraft({ ...captcha, enabled: !captcha.enabled })}>
                  Verify submissions with Turnstile
                </span>
              </label>

              {captcha.enabled && !captcha.secret.trim() && (
                <div className="rounded-lg px-3 py-2 text-xs"
                  style={{ background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)', color: 'var(--color-warning)' }}>
                  Validation is on but no secret key is set — submissions with a token will be rejected. Add your secret key below.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
                    Site key (public)
                  </label>
                  <input
                    type="text"
                    value={captcha.siteKey}
                    onChange={(e) => setCaptchaDraft({ ...captcha, siteKey: e.target.value })}
                    placeholder="0x4AAAA…"
                    className="rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
                    Secret key (private)
                  </label>
                  <input
                    type="password"
                    value={captcha.secret}
                    onChange={(e) => setCaptchaDraft({ ...captcha, secret: e.target.value })}
                    placeholder="0x4AAAA…"
                    className="rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
              </div>

              {captchaDirty && (
                <div className="flex gap-2">
                  <button type="button" onClick={handleSaveCaptcha} disabled={captchaSaving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-40"
                    style={{ background: 'var(--color-accent)', color: '#fff' }}>
                    {captchaSaving ? <SpinnerIcon /> : null} Save changes
                  </button>
                  <button type="button" onClick={() => setCaptchaDraft(null)} disabled={captchaSaving}
                    className="px-4 py-2 rounded-lg text-xs font-medium"
                    style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </CollapsibleCard>
        </div>

        {/* Forms */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
            Forms ({m.tabs.length})
          </p>

          <div className="flex flex-col gap-2">
            {m.tabs.map((tab) => (
              <div key={tab.name}>
                <FormRow
                  tab={tab}
                  onEdit={() => openEdit(tab)}
                  onTest={() => setTestingTab(tab)}
                  onConfirmRemove={() => { setRemovingTab(tab.name); setEditingTab(null); }}
                  onCancelRemove={() => setRemovingTab(null)}
                  onRemove={() => handleRemoveTab(tab.name)}
                  isEditing={editingTab === tab.name}
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
              </div>
            ))}
          </div>

          {/* Add form */}
          {!showAdd ? (
            <button type="button" onClick={() => { setShowAdd(true); setAddFormLabel(''); setAddFormConfig({ ...DEFAULT_FORM_CONFIG }); }}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border text-xs font-semibold transition-all"
              style={{ background: 'var(--color-accent-subtle)', borderColor: 'var(--color-accent-border)', color: 'var(--color-accent)' }}>
              + Add Form
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border p-4 flex flex-col gap-4"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-accent)' }}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>Add form</p>
                <button type="button" onClick={() => setShowAdd(false)} className="text-xs" style={{ color: 'var(--color-muted)' }}>✕</button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>Form name</label>
                <input type="text" value={addFormLabel} onChange={(e) => setAddFormLabel(e.target.value)}
                  placeholder="e.g. Newsletter Signup"
                  autoFocus
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>Form fields</p>
                <FormFieldEditor config={addFormConfig} onChange={setAddFormConfig} />
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={handleAddForm}
                  disabled={saving || addFormLabel.trim().length < 2}
                  className="flex items-center gap-1.5 flex-1 justify-center py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'var(--color-accent)', color: '#fff' }}>
                  {saving ? <SpinnerIcon /> : null} Add form
                </button>
                <button type="button" onClick={() => setShowAdd(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
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
            AI Skill (RGFORMS.md)
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

        {/* Sheetspin CTA */}
        <a
          href="https://sheetspin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-4 rounded-xl border px-5 py-4 transition-colors"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent-border)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; }}
        >
          <div className="flex flex-col gap-0.5">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-subtle)' }}>
              From the makers of RG Forms
            </p>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              Need more than a contact form?
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Sheetspin provisions a full site backend — blog, gallery, events, newsletter — all in your Google Drive.
            </p>
          </div>
          <span className="text-lg shrink-0" style={{ color: 'var(--color-accent)' }}>✦</span>
        </a>

      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {preview && (
          <PreviewModal entry={preview} onClose={() => setPreview(null)} />
        )}
      </AnimatePresence>

      {/* Test form dialog */}
      {testingTab && manifest && (
        <TestFormDialog
          tab={testingTab}
          scriptUrl={manifest.script_url}
          captcha={m.captcha ? { enabled: m.captcha.enabled, siteKey: m.captcha.siteKey } : undefined}
          onClose={() => setTestingTab(null)}
        />
      )}

    </motion.main>
  );
}
