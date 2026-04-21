'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '@/context/AppContext';
import { listSites, loadSiteManifest } from '@/lib/listSites';
import { DRIVE_API, authHeaders } from '@/lib/core/provisionHelpers';
import type { SiteSummary } from '@/lib/listSites';

function SpinnerIcon() {
  return (
    <div className="w-5 h-5 rounded-full border-2 animate-spin shrink-0"
      style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
  );
}

function SiteRow({ site, onOpen, onDelete, onConfirmDelete, onCancelDelete, opening, deleting, confirming }: {
  site: SiteSummary;
  onOpen: () => void;
  onDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  opening: boolean;
  deleting: boolean;
  confirming: boolean;
}) {
  const date = new Date(site.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <motion.div
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--color-surface)', borderColor: confirming ? 'oklch(0.55 0.20 25 / 0.50)' : 'var(--color-border)' }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
            {site.siteName}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{date}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpen}
            disabled={opening || deleting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none disabled:opacity-50"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
          >
            {opening ? <SpinnerIcon /> : null}
            {opening ? 'Loading…' : 'Open →'}
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            disabled={opening || deleting}
            className="flex items-center justify-center w-7 h-7 rounded-lg transition-all focus:outline-none disabled:opacity-40"
            style={{ color: 'var(--color-muted)', background: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-error)'; e.currentTarget.style.background = 'oklch(0.40 0.18 25 / 0.10)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)'; e.currentTarget.style.background = 'transparent'; }}
            title="Delete site"
          >
            {deleting
              ? <SpinnerIcon />
              : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 3.5l.5 8M9 3.5l-.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            }
          </button>
        </div>
      </div>
      {confirming && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t"
          style={{ background: 'oklch(0.40 0.18 25 / 0.08)', borderColor: 'oklch(0.55 0.20 25 / 0.30)' }}>
          <p className="text-xs" style={{ color: 'var(--color-error)' }}>
            Delete <strong>{site.siteName}</strong>? This removes the Google Sheet permanently.
          </p>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={onDelete}
              className="px-3 py-1 rounded-lg text-xs font-semibold"
              style={{ background: 'var(--color-error)', color: '#fff' }}>
              Delete
            </button>
            <button type="button" onClick={onCancelDelete}
              className="px-3 py-1 rounded-lg text-xs font-medium"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function SiteSelect() {
  const { state, dispatch } = useApp();
  const token = state.auth.accessToken!;

  const [sites, setSites]             = useState<SiteSummary[]>([]);
  const [loading, setLoading]         = useState(true);
  const [openingId, setOpeningId]     = useState<string | null>(null);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newSiteName, setNewSiteName] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [error, setError]             = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listSites(token)
      .then((result) => { if (!cancelled) { setSites(result); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token]);

  async function handleOpen(site: SiteSummary) {
    setOpeningId(site.sheetId);
    const manifest = await loadSiteManifest(token, site.sheetId);
    setOpeningId(null);
    if (manifest) {
      dispatch({ type: 'OPEN_SITE', payload: manifest });
    } else {
      setError(`Could not load manifest for "${site.siteName}". The sheet may have been deleted.`);
    }
  }

  async function handleDelete(site: SiteSummary) {
    setDeletingId(site.sheetId);
    setConfirmDeleteId(null);
    try {
      await fetch(`${DRIVE_API}/${site.sheetId}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      });
      setSites((prev) => prev.filter((s) => s.sheetId !== site.sheetId));
    } catch {
      setError(`Failed to delete "${site.siteName}". Please try again.`);
    } finally {
      setDeletingId(null);
    }
  }

  function handleNewSite() {
    const name = newSiteName.trim();
    if (!name) return;
    dispatch({ type: 'SET_SITE_STARTER_CONFIG', payload: { siteName: name, notifyEmail: state.auth.user?.email ?? '' } });
    dispatch({ type: 'GO_TO_SITE_STARTER' });
  }

  return (
    <motion.main
      className="min-h-screen flex flex-col items-center px-4 py-12"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-lg flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-subtle)' }}>
              {state.auth.user?.email}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
              Your sites
            </h1>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'SIGN_OUT' })}
            className="text-xs font-medium mt-1 transition-colors"
            style={{ color: 'var(--color-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)'; }}
          >
            Sign out
          </button>
        </div>

        {error && (
          <div className="rounded-xl border px-4 py-3 text-sm"
            style={{ background: 'oklch(0.40 0.18 25 / 0.10)', borderColor: 'oklch(0.55 0.20 25 / 0.30)', color: 'var(--color-error)' }}>
            {error}
          </div>
        )}

        {/* Site list */}
        {loading ? (
          <div className="flex items-center gap-3 py-8 justify-center">
            <SpinnerIcon />
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading your sites…</p>
          </div>
        ) : sites.length > 0 ? (
          <div className="flex flex-col gap-2">
            {sites.map((site) => (
              <SiteRow
                key={site.sheetId}
                site={site}
                onOpen={() => handleOpen(site)}
                onConfirmDelete={() => setConfirmDeleteId(site.sheetId)}
                onCancelDelete={() => setConfirmDeleteId(null)}
                onDelete={() => handleDelete(site)}
                opening={openingId === site.sheetId}
                deleting={deletingId === site.sheetId}
                confirming={confirmDeleteId === site.sheetId}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Nothing spinning yet</p>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Spin up your first site below.
            </p>
          </div>
        )}

        {/* New site */}
        {!showNewForm ? (
          <button
            type="button"
            onClick={() => setShowNewForm(true)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-accent-subtle)', borderColor: 'var(--color-accent-border)', color: 'var(--color-accent)' }}
          >
            + New Site
          </button>
        ) : (
          <motion.div
            className="flex flex-col gap-3 p-4 rounded-xl border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-accent)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>New site</p>
            <input
              type="text"
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleNewSite(); }}
              placeholder="e.g. Acme Real Estate"
              autoFocus
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleNewSite}
                disabled={newSiteName.trim().length < 2}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                Continue →
              </button>
              <button
                type="button"
                onClick={() => { setShowNewForm(false); setNewSiteName(''); }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </motion.main>
  );
}
