'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '@/context/AppContext';
import CopyBlock from '@/components/CopyBlock';
import GalleryManager from '@/components/GalleryManager';
import { GoogleSheetsIcon, GoogleAppsScriptIcon } from '@/components/google-icons';
import { generateGalleryClientSnippet, generateGalleryServerSnippet, generateGallerySchemaSnippet } from '@/lib/gallerySnippet';

type Tab = 'client' | 'server' | 'schema';

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

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 8.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const ACCENT = 'oklch(0.55 0.20 150)';
const ACCENT_SUBTLE = 'oklch(0.55 0.20 150 / 0.12)';
const ACCENT_BORDER = 'oklch(0.55 0.20 150 / 0.30)';

export default function GalleryResultPanel() {
  const { state, dispatch } = useApp();
  const result = state.galleryResult!;
  const name = state.galleryBuilderName;
  const [tab, setTab] = useState<Tab>('client');
  const [managerOpen, setManagerOpen] = useState(false);

  const clientSnippet = generateGalleryClientSnippet(result, name);
  const serverSnippet = generateGalleryServerSnippet(result, name);
  const schemaSnippet = generateGallerySchemaSnippet(name);
  const accessToken = state.auth.accessToken!;
  const moduleForManager = { sheetId: result.sheetId, sheetUrl: result.sheetUrl, scriptUrl: result.scriptUrl, deploymentUrl: result.deploymentUrl, moduleName: name, createdAt: new Date().toISOString() };

  return (
    <>
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
                {name} gallery is live
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Your gallery module is ready. Add image URLs to the Sheet to populate it.
              </p>
            </div>
          </div>

          <div
            className="rounded-xl border p-4 flex flex-col gap-2"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {[
              'Google Sheet created with Gallery tab and placeholder rows',
              'Apps Script deployed as a public image gallery API',
              'Add image URLs to the sheet — images appear in the API immediately',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5" style={{ color: ACCENT }}>
                <CheckIcon />
                <span className="text-sm" style={{ color: 'var(--color-text)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next step — manage images */}
        <div
          className="rounded-xl border p-4 flex items-center justify-between gap-4"
          style={{ background: ACCENT_SUBTLE, borderColor: ACCENT_BORDER }}
        >
          <div className="flex flex-col gap-0.5 min-w-0">
            <p className="text-sm font-semibold" style={{ color: ACCENT }}>Add your images now</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Upload images directly — they go to Drive and the URL auto-fills into the sheet.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setManagerOpen(true)}
            className="shrink-0 px-4 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: ACCENT, color: '#fff' }}
          >
            Manage images
          </button>
        </div>

        {/* Auth */}
        <div
          className="rounded-xl border p-4 flex flex-col gap-3"
          style={{ background: 'oklch(0.78 0.18 75 / 0.06)', borderColor: 'oklch(0.78 0.18 75 / 0.25)' }}
        >
          <div className="flex items-start gap-2.5">
            <div className="shrink-0 mt-0.5" style={{ color: 'oklch(0.78 0.18 75)' }}>
              <GoogleAppsScriptIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold" style={{ color: 'oklch(0.78 0.18 75)' }}>One-time authorization required</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                Visit the endpoint URL once to authorize the script. After that it serves images to anyone automatically.
              </p>
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

        {/* Endpoint */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>API endpoint</p>
          <CopyBlock label="endpoint" content={result.deploymentUrl} language="text" />
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Append <code className="font-mono px-1 rounded" style={{ background: 'var(--color-surface-2)' }}>?json=1</code> for all images.
            Add <code className="font-mono px-1 rounded" style={{ background: 'var(--color-surface-2)' }}>?featured=1</code> or <code className="font-mono px-1 rounded" style={{ background: 'var(--color-surface-2)' }}>?category=x</code> to filter.
          </p>
        </div>

        {/* Integration code */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Integration code</p>
            <div className="flex items-center gap-1.5">
              <TabButton active={tab === 'client'} onClick={() => setTab('client')}>Client-side</TabButton>
              <TabButton active={tab === 'server'} onClick={() => setTab('server')}>Server / SSG</TabButton>
              <TabButton active={tab === 'schema'} onClick={() => setTab('schema')}>Schema</TabButton>
            </div>
          </div>

          {tab === 'client' && (
            <div className="flex flex-col gap-3">
              <CopyBlock label="RGGallery.js" content={clientSnippet} language="js" />
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Safe for public client-side code. Supports all, featured, category, and search queries.
              </p>
            </div>
          )}
          {tab === 'server' && (
            <div className="flex flex-col gap-3">
              <CopyBlock label="Server / SSG patterns" content={serverSnippet} language="js" />
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Fetch at build time or in a server component for fast initial loads and good SEO.
              </p>
            </div>
          )}
          {tab === 'schema' && (
            <div className="flex flex-col gap-3">
              <CopyBlock label="Response shape" content={schemaSnippet} language="js" />
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Each row in the Gallery sheet becomes one image object. Add columns to extend the schema.
              </p>
            </div>
          )}
        </div>

        {/* Open links */}
        <div className="flex gap-3 flex-wrap">
          <a
            href={result.sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
          >
            <GoogleSheetsIcon className="w-4 h-4 shrink-0" />
            Open Gallery Sheet
          </a>
          <a
            href={result.scriptUrl}
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
            onClick={() => dispatch({ type: 'GO_TO_GALLERY_BUILDER' })}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-accent-subtle)', borderColor: 'var(--color-accent-border)', color: 'var(--color-accent)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-subtle)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)'; }}
          >
            New gallery
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET_GALLERY' })}
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

      {managerOpen && (
        <GalleryManager
          module={moduleForManager}
          accessToken={accessToken}
          onClose={() => setManagerOpen(false)}
        />
      )}
    </>
  );
}
