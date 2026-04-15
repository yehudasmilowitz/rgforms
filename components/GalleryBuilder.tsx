'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '@/context/AppContext';
import ProvisioningSteps from '@/components/ProvisioningSteps';
import { provisionGallery, AppsScriptApiDisabledError } from '@/lib/galleryProvision';

export default function GalleryBuilder() {
  const { state, dispatch } = useApp();
  const [name, setName] = useState('');
  const [provisioning, setProvisioning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (state.screen === 'gallery-provisioning') return <ProvisioningSteps />;

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed || !state.auth.accessToken) return;
    setProvisioning(true);
    setError(null);
    dispatch({ type: 'SET_GALLERY_BUILDER_NAME', payload: trimmed });
    dispatch({ type: 'START_GALLERY_PROVISIONING' });
    try {
      const result = await provisionGallery(
        state.auth.accessToken,
        trimmed,
        (stepId, status, err) => dispatch({ type: 'UPDATE_STEP', payload: { id: stepId, status, error: err } }),
      );
      dispatch({ type: 'SET_GALLERY_RESULT', payload: result });
    } catch (err) {
      if (err instanceof AppsScriptApiDisabledError) {
        dispatch({ type: 'GALLERY_PROVISION_ERROR', payload: 'apps-script-disabled' });
      } else {
        dispatch({ type: 'GALLERY_PROVISION_ERROR', payload: (err as Error).message });
      }
    } finally {
      setProvisioning(false);
    }
  }

  return (
    <motion.main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-md flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: 'oklch(0.55 0.20 150 / 0.12)', color: 'oklch(0.65 0.18 150)', border: '1px solid oklch(0.55 0.20 150 / 0.25)' }}
            >
              Beta
            </span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            New gallery
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            A Google Sheet becomes your image registry. Add image URLs (from RG Assets, Google Drive,
            or any public host) to the sheet and they appear in your gallery API instantly.
          </p>
        </div>

        {/* What gets created */}
        <div
          className="rounded-xl border p-4 flex flex-col gap-2"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
            What gets created
          </p>
          {[
            'A Google Sheet with a Gallery tab pre-seeded with placeholder rows',
            'An Apps Script web app that serves images as a JSON API',
            'Filter by category, featured status, or search by title/caption',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2">
              <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(0.55 0.20 150)' }} />
              <span className="text-sm" style={{ color: 'var(--color-text)' }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div
          className="rounded-xl border px-4 py-3 flex items-start gap-3"
          style={{ background: 'oklch(0.55 0.20 150 / 0.06)', borderColor: 'oklch(0.55 0.20 150 / 0.20)' }}
        >
          <span className="shrink-0 mt-0.5 text-sm" style={{ color: 'oklch(0.65 0.18 150)' }}>💡</span>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Works great with RG Assets — use the direct image URL from your asset module as the Image URL here.
            Assets serve images from Google Drive CDN, so they load fast.
          </p>
        </div>

        {/* Name input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            Gallery name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) handleCreate(); }}
            placeholder="Portfolio"
            autoFocus
            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Usually the collection name. Creates a sheet named &ldquo;[name] — RG Gallery&rdquo;.
          </p>
        </div>

        {error && (
          <p className="text-sm rounded-xl px-4 py-3 border" style={{ color: 'var(--color-error)', background: 'oklch(0.4 0.15 25 / 0.08)', borderColor: 'oklch(0.4 0.15 25 / 0.25)' }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim() || provisioning}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-40"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
          >
            Create gallery
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET_GALLERY' })}
            className="px-5 py-3 rounded-xl border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.main>
  );
}
