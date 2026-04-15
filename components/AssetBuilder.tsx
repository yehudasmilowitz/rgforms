'use client';

import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useApp } from '@/context/AppContext';
import { provisionAssetModule, AppsScriptApiDisabledError } from '@/lib/assetProvision';
import ProvisioningSteps from '@/components/ProvisioningSteps';
import ProvisionErrorBanner from '@/components/ProvisionErrorBanner';

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── AssetBuilder ─────────────────────────────────────────────────────────────

export default function AssetBuilder() {
  const { state, dispatch } = useApp();
  const accessToken = state.auth.accessToken!;
  const isProvisioning = state.screen === 'asset-provisioning';

  const [name, setName] = useState(state.assetBuilderName);
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      nameRef.current?.focus();
      return;
    }

    dispatch({ type: 'SET_ASSET_BUILDER_NAME', payload: trimmed });
    dispatch({ type: 'START_ASSET_PROVISIONING' });
    setSubmitting(true);

    try {
      const result = await provisionAssetModule(
        accessToken,
        trimmed,
        (stepId, status, error) => {
          dispatch({ type: 'UPDATE_STEP', payload: { id: stepId, status, error } });
        },
      );
      dispatch({ type: 'SET_ASSET_RESULT', payload: result });
    } catch (err) {
      if (err instanceof AppsScriptApiDisabledError) {
        dispatch({ type: 'ASSET_PROVISION_ERROR', payload: 'apps-script-disabled' });
      } else {
        dispatch({ type: 'ASSET_PROVISION_ERROR', payload: (err as Error).message });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (isProvisioning) {
    return <ProvisioningSteps />;
  }

  return (
    <motion.main
      className="min-h-screen flex flex-col px-4 py-10"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-xl mx-auto flex flex-col gap-8">

        {/* Back button */}
        <button
          type="button"
          onClick={() => dispatch({ type: 'RESET_ASSET' })}
          className="flex items-center gap-1.5 w-fit text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] rounded"
          style={{ color: 'var(--color-muted)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; }}
        >
          <ArrowLeftIcon />
          Back to dashboard
        </button>

        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              New Asset Module
            </h1>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: 'oklch(0.78 0.18 75 / 0.12)', color: 'oklch(0.78 0.18 75)', border: '1px solid oklch(0.78 0.18 75 / 0.25)' }}
            >
              Beta
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Creates a public Google Drive folder with a listing API endpoint. Share the folder with clients — files they drop in become instantly available through the endpoint.
          </p>
        </div>

        <ProvisionErrorBanner error={state.assetProvisionError} />

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div
            className="rounded-2xl border p-6 flex flex-col gap-5"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {/* Module name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                Module name
              </label>
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Portfolio, Team Photos, Documents"
                required
                maxLength={80}
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{
                  background: 'var(--color-surface-2)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                Creates a public Google Drive folder. Share the folder URL with clients — files they drop in become instantly available through the API endpoint.
              </p>
            </div>

            {/* Info note */}
            <div
              className="rounded-xl border px-4 py-3 flex flex-col gap-1"
              style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
            >
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                One-time Drive authorization
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                The listing endpoint requests <code className="font-mono px-1 rounded" style={{ background: 'var(--color-border)' }}>drive.readonly</code> access during one-time authorization. This lets the script list all files in the folder, including ones your client added directly.
              </p>
            </div>
          </div>

          {/* What gets created */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
              What gets created
            </p>
            <div className="flex flex-col gap-1.5">
              {[
                'Config spreadsheet (anchor for the module)',
                'Public Google Drive folder',
                'Container-bound Apps Script with doGet() handler',
                'Deployed ANYONE_ANONYMOUS web app endpoint',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: 'var(--color-accent)' }}
                  />
                  <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
            onMouseEnter={(e) => { if (!submitting && name.trim()) (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-hover)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)'; }}
          >
            {submitting ? 'Creating…' : 'Create asset module →'}
          </button>
        </form>
      </div>
    </motion.main>
  );
}
