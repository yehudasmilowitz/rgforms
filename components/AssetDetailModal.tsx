'use client';

import { useState } from 'react';
import CopyBlock from '@/components/CopyBlock';
import { GoogleAppsScriptIcon } from '@/components/google-icons';
import type { AssetModuleSummary } from '@/types';

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function generateSnippet(name: string, deploymentUrl: string): string {
  const varName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/, '') || 'assets';
  return `// RG Assets — ${name}
class RGAssets {
  constructor(url) {
    this._url = url;
    this._cache = null;
  }
  async _fetch(_retry) {
    if (this._cache) return this._cache;
    const res = await fetch(this._url + '?json=1');
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
  async list()          { return (await this._fetch()).data; }
  async images()        { return (await this.list()).filter(f => f.isImage); }
  async getByName(name) { return (await this.list()).find(f => f.name === name) || null; }
  clearCache()          { this._cache = null; }
}

const ${varName} = new RGAssets('${deploymentUrl}');
// const images = await ${varName}.images();
// <img src={images[0].url} alt={images[0].name} />`;
}

interface AssetDetailModalProps {
  module: AssetModuleSummary;
  onClose: () => void;
}

export default function AssetDetailModal({ module, onClose }: AssetDetailModalProps) {
  const [authExpanded, setAuthExpanded] = useState(false);
  const hasEndpoint = !!module.deploymentUrl;
  const snippet = hasEndpoint ? generateSnippet(module.moduleName, module.deploymentUrl!) : '';

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

          {/* Folder URL */}
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
              Asset folder
            </h3>
            <CopyBlock label="folder-url" content={module.folderUrl} language="text" />
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Share with your client — files dropped here appear in the API instantly.
            </p>
          </section>

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
                  The listing endpoint needs to be authorized before it can serve files. Visit the endpoint URL and grant Drive read-only access when prompted.
                </p>
                <button
                  type="button"
                  onClick={() => setAuthExpanded(!authExpanded)}
                  className="text-xs underline hover:no-underline w-fit mt-0.5 focus:outline-none"
                  style={{ color: 'oklch(0.78 0.18 75)' }}
                >
                  {authExpanded ? 'Hide instructions' : 'Show step-by-step'}
                </button>
                {authExpanded && (
                  <ol className="mt-2 flex flex-col gap-1 list-decimal list-inside">
                    {[
                      'Click the endpoint link below to open it.',
                      'Sign in with the same Google account you used to create this module.',
                      'Grant the requested Drive read-only access.',
                      'You\'ll be redirected to the endpoint, which will return JSON.',
                    ].map((step, i) => (
                      <li key={i} className="text-xs" style={{ color: 'var(--color-muted)' }}>{step}</li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
            {hasEndpoint && (
              <a
                href={module.deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ background: 'oklch(0.78 0.18 75)', color: '#fff' }}
              >
                Open endpoint to authorize →
              </a>
            )}
          </div>

          {/* API endpoint + snippet */}
          {hasEndpoint ? (
            <>
              <section className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                  API endpoint
                </h3>
                <CopyBlock label="endpoint" content={module.deploymentUrl!} language="text" />
                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                  <svg className="w-3.5 h-3.5 shrink-0 opacity-60" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 1.5L1.5 14h13L8 1.5z" stroke="#eab308" strokeWidth="1.3" strokeLinejoin="round" />
                    <path d="M8 6.5v3M8 11.5v.5" stroke="#eab308" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    Script may need a one-time authorization —
                  </span>
                  <a
                    href={module.deploymentUrl!}
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

              {module.scriptUrl && (
                <section className="flex flex-col gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                    Apps Script
                  </h3>
                  <a
                    href={module.scriptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
                  >
                    <GoogleAppsScriptIcon className="w-4 h-4 shrink-0" />
                    View Apps Script
                  </a>
                </section>
              )}

              <section className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                  Integration snippet
                </h3>
                <CopyBlock label="RGAssets.js" content={snippet} language="js" />
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  Read-only — safe to use in public client-side code.
                </p>
              </section>
            </>
          ) : (
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              Endpoint details not available — the module may still be provisioning.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
