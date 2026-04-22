'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '@/context/AppContext';
import { createSite, SITE_PROVISION_STEPS } from '@/lib/createSite';
import type { SiteStarterModuleProgress, SiteTabFormConfig } from '@/types';
import FormFieldEditor, { DEFAULT_FORM_CONFIG } from '@/components/FormFieldEditor';

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start flex items-center gap-1.5 text-sm font-medium transition-colors focus:outline-none"
      style={{ color: 'var(--color-muted)' }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)'; }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      All projects
    </button>
  );
}

export default function SiteStarter() {
  const { state, dispatch } = useApp();

  const siteName    = state.siteStarterConfig.siteName;
  const defaultEmail = state.auth.user?.email ?? '';

  const [formLabel,    setFormLabel]    = useState('Contact Form');
  const [notifyEmail,  setNotifyEmail]  = useState(defaultEmail);
  const [formConfig,   setFormConfig]   = useState<SiteTabFormConfig>({ ...DEFAULT_FORM_CONFIG });
  const [launching,    setLaunching]    = useState(false);
  const [errorMsg,     setErrorMsg]     = useState('');

  const canLaunch = siteName.trim().length >= 2 && notifyEmail.trim().includes('@') && !launching;

  async function handleLaunch() {
    if (!state.auth.accessToken || !canLaunch) return;

    setLaunching(true);
    setErrorMsg('');

    const initialProgress: SiteStarterModuleProgress[] = SITE_PROVISION_STEPS.map((s) => ({
      moduleType: s.id,
      moduleName: s.label,
      status:     'pending' as const,
    }));

    dispatch({ type: 'START_SITE_STARTER_PROVISIONING', payload: initialProgress });

    try {
      const manifest = await createSite(
        state.auth.accessToken,
        {
          siteName,
          notifyEmail:   notifyEmail.trim(),
          googleAccount: state.auth.user?.email ?? '',
          formLabel:     formLabel.trim() || 'Contact Form',
          formConfig,
        },
        (step, status, error, errorCode) => {
          const label = SITE_PROVISION_STEPS.find((s) => s.id === step)?.label ?? step;
          dispatch({
            type:    'UPDATE_SITE_STARTER_MODULE',
            payload: { moduleType: step, moduleName: label, status, error, errorCode },
          });
        },
      );

      dispatch({ type: 'SET_SITE_MANIFEST', payload: manifest });
    } catch (err) {
      setErrorMsg((err as Error).message);
      dispatch({ type: 'SITE_MANIFEST_ERROR', payload: (err as Error).message });
    } finally {
      setLaunching(false);
    }
  }

  return (
    <motion.main
      className="min-h-screen flex flex-col items-center px-4 py-12"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-2xl flex flex-col gap-8">

        <BackButton onClick={() => dispatch({ type: 'RESET_SITE_STARTER' })} />

        {/* Header */}
        <div className="flex flex-col gap-1.5">
          {siteName && (
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-subtle)' }}>
              {siteName}
            </p>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
            Set up your project
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            Configure your first form&apos;s fields and notification email. You can add more forms to this project later.
          </p>
        </div>

        {(state.siteManifestError || errorMsg) && (
          <div className="rounded-xl border px-4 py-3 text-sm"
            style={{ background: 'oklch(0.40 0.18 25 / 0.10)', borderColor: 'oklch(0.55 0.20 25 / 0.30)', color: 'var(--color-error)' }}>
            {state.siteManifestError || errorMsg}
          </div>
        )}

        {/* Form label */}
        <div className="flex flex-col gap-2">
          <label htmlFor="form-label" className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Form name
          </label>
          <input
            id="form-label"
            type="text"
            value={formLabel}
            onChange={(e) => setFormLabel(e.target.value)}
            placeholder="e.g. Contact Form"
            className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
        </div>

        {/* Notification email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="notify-email" className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Send notifications to
          </label>
          <input
            id="notify-email"
            type="email"
            value={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
          <p className="text-xs" style={{ color: 'var(--color-subtle)' }}>
            You&apos;ll get an email every time someone submits the form.
          </p>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3 p-4 rounded-xl border"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
            Form fields
          </p>
          <FormFieldEditor config={formConfig} onChange={setFormConfig} />
        </div>

        {/* Launch */}
        <button
          type="button"
          onClick={handleLaunch}
          disabled={!canLaunch}
          className="py-3.5 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--color-accent)', color: '#fff' }}
        >
          {launching ? 'Creating…' : 'Create form →'}
        </button>

      </div>
    </motion.main>
  );
}
