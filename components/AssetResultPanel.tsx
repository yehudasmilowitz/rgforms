'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '@/context/AppContext';
import CopyBlock from '@/components/CopyBlock';
import { GoogleAppsScriptIcon } from '@/components/google-icons';

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 8.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M1 4.5A1.5 1.5 0 012.5 3h3.086a1.5 1.5 0 011.06.44l.915.914A1.5 1.5 0 008.62 4.9H13.5A1.5 1.5 0 0115 6.4v5.1A1.5 1.5 0 0113.5 13h-11A1.5 1.5 0 011 11.5v-7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Snippet generator ────────────────────────────────────────────────────────

function generateIntegrationSnippet(name: string, deploymentUrl: string): string {
  const varName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/, '') || 'assets';

  return `// RG Assets — ${name}
// Read-only client — safe to use in public code
class RGAssets {
  constructor(url) {
    this._url = url;
    this._cache = null;
  }

  async _fetch(_retry) {
    if (this._cache) return this._cache;
    const res = await fetch(this._url);
    if (res.status === 503 && !_retry) {
      await new Promise(r => setTimeout(r, 2000));
      return this._fetch(true);
    }
    if (!res.ok) throw new Error('RGAssets fetch failed (' + res.status + ')');
    const json = await res.json();
    if (json.error) throw new Error('RGAssets error: ' + json.error);
    this._cache = json;
    return json;
  }

  async list()                { return (await this._fetch()).data; }
  async images()              { return (await this.list()).filter(f => f.isImage); }
  async getByName(name)       { return (await this.list()).find(f => f.name === name) || null; }
  clearCache()                { this._cache = null; }
}

const ${varName} = new RGAssets('${deploymentUrl}');

// Examples:
// const images = await ${varName}.images();   // [{id, name, url, ...}, ...]
// const logo   = await ${varName}.getByName('logo.png');
// <img src={images[0].url} alt={images[0].name} />`;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AssetResultPanel() {
  const { state, dispatch } = useApp();
  const result = state.assetResult!;
  const name = state.assetBuilderName;

  const [authExpanded, setAuthExpanded] = useState(false);

  const snippet = generateIntegrationSnippet(name, result.deploymentUrl);

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
                  {name} is live
                </h1>
                <span
                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
                  style={{ background: 'oklch(0.78 0.18 75 / 0.12)', color: 'oklch(0.78 0.18 75)', border: '1px solid oklch(0.78 0.18 75 / 0.25)' }}
                >
                  Beta
                </span>
              </div>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Your asset module is ready to use.
              </p>
            </div>
          </div>

          {/* Checklist */}
          <div
            className="rounded-xl border p-4 flex flex-col gap-2"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {[
              'Drive folder created and made public',
              'Apps Script deployed as anonymous web app',
              'Read API active — lists all files in the folder',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5" style={{ color: 'oklch(0.72 0.18 145)' }}>
                <CheckIcon />
                <span className="text-sm" style={{ color: 'var(--color-text)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Folder URL */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div style={{ color: 'oklch(0.78 0.18 75)' }}>
              <FolderIcon />
            </div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Asset folder</p>
          </div>
          <CopyBlock label="folder-url" content={result.folderUrl} language="text" />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Share this URL with your client — they can drop files directly into the folder and they&apos;ll appear in the API instantly.
          </p>
        </div>

        {/* Auth callout */}
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
                The listing endpoint needs to be authorized once before it can serve files. Visit the endpoint URL and click &ldquo;Authorize&rdquo; when prompted. This grants the script read access to your Drive so it can list all files in the folder.
              </p>
              <button
                type="button"
                onClick={() => setAuthExpanded(!authExpanded)}
                className="text-xs underline hover:no-underline w-fit mt-0.5 focus:outline-none"
                style={{ color: 'oklch(0.78 0.18 75)' }}
              >
                {authExpanded ? 'Hide instructions' : 'Show step-by-step instructions'}
              </button>
              {authExpanded && (
                <ol className="mt-2 flex flex-col gap-1 list-decimal list-inside">
                  {[
                    'Click the endpoint URL below to open it in a new tab.',
                    'You\'ll see a Google authorization dialog.',
                    'Sign in with the same Google account you used here.',
                    'Grant the requested Drive read-only access.',
                    'You\'ll be redirected back to the endpoint, which will return JSON.',
                  ].map((step, i) => (
                    <li key={i} className="text-xs" style={{ color: 'var(--color-muted)' }}>{step}</li>
                  ))}
                </ol>
              )}
            </div>
          </div>
          <a
            href={result.deploymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'oklch(0.78 0.18 75)', color: '#fff' }}
          >
            Open endpoint to authorize →
          </a>
        </div>

        {/* API endpoint */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>API endpoint</p>
          <CopyBlock label="endpoint-url" content={result.deploymentUrl} language="text" />
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Returns <code className="font-mono px-1 rounded" style={{ background: 'var(--color-surface-2)' }}>{'{data: [...], total: N}'}</code>
          </p>
        </div>

        {/* Integration snippet */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Integration snippet</p>
          <CopyBlock label="RGAssets.js" content={snippet} language="js" />
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            The URL is embedded in the snippet — safe to use in public code. The endpoint is read-only.
          </p>
        </div>

        {/* Limitations */}
        <div
          className="rounded-xl border p-4 flex flex-col gap-2"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
            Limitations
          </p>
          <ul className="flex flex-col gap-1.5">
            {[
              'Cold start: first request after inactivity takes 800ms–2s',
              'Image URLs use lh3.googleusercontent.com — works as <img src> but not a CDN',
              'Not a CDN — for high-traffic assets consider a dedicated CDN',
              'In-app delete only works for files uploaded through this app; files added manually show a "delete from Drive" message',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="shrink-0 mt-1 w-1 h-1 rounded-full" style={{ background: 'var(--color-muted)' }} />
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => dispatch({ type: 'GO_TO_ASSET_BUILDER' })}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-accent-subtle)', borderColor: 'var(--color-accent-border)', color: 'var(--color-accent)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-subtle)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)'; }}
          >
            New module
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET_ASSET' })}
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
