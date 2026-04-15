'use client';

/**
 * Generic name-input builder shared by all simple module types.
 *
 * All six simple modules (Testimonial, FAQ, Menu, Newsletter, Announcement,
 * Redirects) have 95% identical UI. This component holds that shared layout
 * so each module's file is just a thin config wrapper.
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import ProvisioningSteps from '@/components/ProvisioningSteps';
import ProvisionErrorBanner from '@/components/ProvisionErrorBanner';
import { AppsScriptApiDisabledError } from '@/lib/core/provisionHelpers';
import type { StepCallback } from '@/lib/core/provisionHelpers';

export interface SimpleBuilderProps {
  /** Screen heading — e.g. "New testimonials module" */
  title: string;
  /** One-sentence description shown below the title */
  description: string;
  /** Bullet points in the "What gets created" card */
  features: string[];
  /** Optional tip/callout text. Supports JSX via a render prop. */
  tip?: string;
  /** Hint text below the input — e.g. 'Creates a sheet named "[name] — RG Testimonials"' */
  inputHint?: string;
  /** Primary button label — e.g. "Create testimonials module" */
  buttonLabel: string;
  /** Error string from app state (e.g. state.testimonialProvisionError) */
  provisionError: string | null;
  /** Whether we are currently on the provisioning screen */
  isProvisioning: boolean;
  /** The actual provision function for this module */
  provision: (
    token: string,
    name: string,
    onStepUpdate: StepCallback,
  ) => Promise<unknown>;
  /** Called with the module name just before provisioning starts (set name in state) */
  onSetName: (name: string) => void;
  /** Dispatches the START_X_PROVISIONING action */
  onStart: () => void;
  /** Dispatches SET_X_RESULT with the successful result */
  onSuccess: (result: unknown) => void;
  /** Dispatches X_PROVISION_ERROR with the error string */
  onError: (errorPayload: string) => void;
  /** Dispatches RESET_X to go back to the dashboard */
  onCancel: () => void;
  /** Access token from state.auth.accessToken */
  accessToken: string | null;
  /** Callback to get the step update dispatcher (usually UPDATE_STEP) */
  onStepUpdate: StepCallback;
}

export default function SimpleBuilder({
  title,
  description,
  features,
  tip,
  inputHint,
  buttonLabel,
  provisionError,
  isProvisioning,
  provision,
  onSetName,
  onStart,
  onSuccess,
  onError,
  onCancel,
  accessToken,
  onStepUpdate,
}: SimpleBuilderProps) {
  const [name, setName] = useState('');
  const [provisioning, setProvisioning] = useState(false);

  if (isProvisioning) return <ProvisioningSteps />;

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed || !accessToken) return;
    setProvisioning(true);
    onSetName(trimmed);
    onStart();
    try {
      const result = await provision(accessToken, trimmed, onStepUpdate);
      onSuccess(result);
    } catch (err) {
      if (err instanceof AppsScriptApiDisabledError) {
        onError('apps-script-disabled');
      } else {
        onError((err as Error).message);
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
              style={{
                background: 'oklch(0.55 0.20 150 / 0.12)',
                color: 'oklch(0.65 0.18 150)',
                border: '1px solid oklch(0.55 0.20 150 / 0.25)',
              }}
            >
              Beta
            </span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            {title}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            {description}
          </p>
        </div>

        {/* What gets created */}
        <div
          className="rounded-xl border p-4 flex flex-col gap-2"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-muted)' }}
          >
            What gets created
          </p>
          {features.map((item) => (
            <div key={item} className="flex items-start gap-2">
              <span
                className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                style={{ background: 'oklch(0.55 0.20 150)' }}
              />
              <span className="text-sm" style={{ color: 'var(--color-text)' }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Tip (optional) */}
        {tip && (
          <div
            className="rounded-xl border px-4 py-3 flex items-start gap-3"
            style={{
              background: 'oklch(0.55 0.20 150 / 0.06)',
              borderColor: 'oklch(0.55 0.20 150 / 0.20)',
            }}
          >
            <span className="shrink-0 mt-0.5 text-sm" style={{ color: 'oklch(0.65 0.18 150)' }}>
              💡
            </span>
            <p
              className="text-xs leading-relaxed"
              style={{ color: 'var(--color-muted)' }}
              dangerouslySetInnerHTML={{ __html: tip }}
            />
          </div>
        )}

        {/* Name input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            Module name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) handleCreate(); }}
            placeholder="My Site"
            autoFocus
            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
          {inputHint && (
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              {inputHint}
            </p>
          )}
        </div>

        <ProvisionErrorBanner error={provisionError} />

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim() || provisioning}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-40"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
          >
            {buttonLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 rounded-xl border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{
              background: 'transparent',
              borderColor: 'var(--color-border)',
              color: 'var(--color-muted)',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.main>
  );
}
