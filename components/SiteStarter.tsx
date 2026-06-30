'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '@/context/AppContext';
import { useSiteProvisioning } from '@/hooks/useSiteProvisioning';
import type { SiteTabFormConfig } from '@/types';
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
  const provision = useSiteProvisioning();

  const siteName     = state.siteStarterConfig.siteName;
  const defaultEmail = state.auth.user?.email ?? '';

  const [formLabel,              setFormLabel]              = useState('Contact Form');
  const [notificationsEnabled,   setNotificationsEnabled]   = useState(false);
  const [notifyEmail,            setNotifyEmail]            = useState(defaultEmail);
  const [captchaEnabled,         setCaptchaEnabled]         = useState(false);
  const [captchaSiteKey,         setCaptchaSiteKey]         = useState('');
  const [captchaSecret,          setCaptchaSecret]          = useState('');
  const [formConfig,             setFormConfig]             = useState<SiteTabFormConfig>({ ...DEFAULT_FORM_CONFIG });
  const [launching,              setLaunching]              = useState(false);

  const emailValid = !notificationsEnabled || notifyEmail.trim().includes('@');
  const canLaunch  = siteName.trim().length >= 2 && emailValid && !launching;

  async function handleLaunch() {
    if (!state.auth.accessToken || !canLaunch) return;

    setLaunching(true);

    try {
      await provision({
        siteName,
        notifyEmail:          notificationsEnabled ? notifyEmail.trim() : '',
        googleAccount:        state.auth.user?.email ?? '',
        formLabel:            formLabel.trim() || 'Contact Form',
        formConfig,
        notificationsEnabled,
        captchaEnabled,
        captchaSiteKey:       captchaEnabled ? captchaSiteKey.trim() : '',
        captchaSecret:        captchaEnabled ? captchaSecret.trim() : '',
      });
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

        {state.siteManifestError && (
          <div className="rounded-xl border px-4 py-3 text-sm"
            style={{ background: 'var(--color-error-bg)', borderColor: 'var(--color-error-border)', color: 'var(--color-error)' }}>
            {state.siteManifestError}
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

        {/* Email notifications toggle */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={notificationsEnabled}
            onClick={() => setNotificationsEnabled((v) => !v)}
            className="flex items-center gap-3 self-start group"
          >
            {/* Track */}
            <span
              className="relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors duration-200"
              style={{
                background:   notificationsEnabled ? 'var(--color-accent)' : 'var(--color-surface-2)',
                borderColor:  notificationsEnabled ? 'var(--color-accent)' : 'var(--color-border)',
              }}
            >
              {/* Thumb */}
              <span
                className="pointer-events-none absolute top-0.5 h-4 w-4 rounded-full shadow transition-transform duration-200"
                style={{
                  background: '#fff',
                  transform:  notificationsEnabled ? 'translateX(16px)' : 'translateX(2px)',
                }}
              />
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              Send email notifications on form submission
            </span>
          </button>

          {!notificationsEnabled && (
            <p className="text-xs" style={{ color: 'var(--color-subtle)' }}>
              Enable now if there&apos;s any chance you&apos;ll want it — you can turn it on or off any time, but adding it after the project is created means re-authorizing the script.
            </p>
          )}

          {notificationsEnabled && (
            <motion.div
              className="flex flex-col gap-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Email input */}
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
              </div>

              {/* Sensitive scope info box */}
              <div
                className="flex gap-3 rounded-xl p-4 text-xs leading-relaxed"
                style={{ background: 'var(--color-info-bg)', border: '1px solid var(--color-info-border)' }}
              >
                <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="6" stroke="var(--color-info)" strokeWidth="1.4"/>
                  <path d="M7 6v4" stroke="var(--color-info)" strokeWidth="1.4" strokeLinecap="round"/>
                  <circle cx="7" cy="4.5" r="0.6" fill="var(--color-info)"/>
                </svg>
                <div className="flex flex-col gap-1.5" style={{ color: 'var(--color-info)' }}>
                  <p className="font-semibold" style={{ color: 'var(--color-info)' }}>
                    Apps Script authorization required
                  </p>
                  <p>
                    Email notifications use the{' '}
                    <code className="px-1 py-0.5 rounded text-[11px]" style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
                      script.send_mail
                    </code>{' '}
                    scope. After provisioning, you&apos;ll need to open the Apps Script and authorize it.
                  </p>
                  <p>
                    Because this is a sensitive scope, Google may show an &ldquo;App isn&apos;t verified&rdquo; warning.
                    Click <strong style={{ color: 'var(--color-info)' }}>Advanced → Continue</strong> to proceed.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Spam protection (captcha) toggle */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={captchaEnabled}
            onClick={() => setCaptchaEnabled((v) => !v)}
            className="flex items-center gap-3 self-start group"
          >
            {/* Track */}
            <span
              className="relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors duration-200"
              style={{
                background:   captchaEnabled ? 'var(--color-accent)' : 'var(--color-surface-2)',
                borderColor:  captchaEnabled ? 'var(--color-accent)' : 'var(--color-border)',
              }}
            >
              {/* Thumb */}
              <span
                className="pointer-events-none absolute top-0.5 h-4 w-4 rounded-full shadow transition-transform duration-200"
                style={{
                  background: '#fff',
                  transform:  captchaEnabled ? 'translateX(16px)' : 'translateX(2px)',
                }}
              />
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              Enable spam protection (Cloudflare Turnstile)
            </span>
          </button>

          {!captchaEnabled && (
            <p className="text-xs" style={{ color: 'var(--color-subtle)' }}>
              Enable now if there&apos;s any chance you&apos;ll want it — validation stays off until you turn it on, but adding it after the project is created means re-authorizing the script.
            </p>
          )}

          {captchaEnabled && (
            <motion.div
              className="flex flex-col gap-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Key inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label htmlFor="ts-site-key" className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    Turnstile site key
                  </label>
                  <input
                    id="ts-site-key"
                    type="text"
                    value={captchaSiteKey}
                    onChange={(e) => setCaptchaSiteKey(e.target.value)}
                    placeholder="0x4AAAA…"
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="ts-secret" className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    Turnstile secret key
                  </label>
                  <input
                    id="ts-secret"
                    type="password"
                    value={captchaSecret}
                    onChange={(e) => setCaptchaSecret(e.target.value)}
                    placeholder="0x4AAAA…"
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Get a free key pair at{' '}
                <a
                  href="https://dash.cloudflare.com/?to=/:account/turnstile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Cloudflare Turnstile
                </a>. You can leave these blank and add them later from the dashboard.
              </p>

              {/* Sensitive scope info box */}
              <div
                className="flex gap-3 rounded-xl p-4 text-xs leading-relaxed"
                style={{ background: 'var(--color-info-bg)', border: '1px solid var(--color-info-border)' }}
              >
                <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="6" stroke="var(--color-info)" strokeWidth="1.4"/>
                  <path d="M7 6v4" stroke="var(--color-info)" strokeWidth="1.4" strokeLinecap="round"/>
                  <circle cx="7" cy="4.5" r="0.6" fill="var(--color-info)"/>
                </svg>
                <div className="flex flex-col gap-1.5" style={{ color: 'var(--color-info)' }}>
                  <p className="font-semibold" style={{ color: 'var(--color-info)' }}>
                    Apps Script authorization required
                  </p>
                  <p>
                    Spam protection verifies each submission with Cloudflare from your script, which uses the{' '}
                    <code className="px-1 py-0.5 rounded text-[11px]" style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
                      script.external_request
                    </code>{' '}
                    scope. After provisioning, open the Apps Script and authorize it (Google may show an
                    &ldquo;App isn&apos;t verified&rdquo; warning — click <strong style={{ color: 'var(--color-info)' }}>Advanced → Continue</strong>).
                  </p>
                  <p>
                    Validation stays <strong style={{ color: 'var(--color-info)' }}>off</strong> until you turn it on from the
                    dashboard — do that after adding the Turnstile widget to your site, so live submissions never break.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
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
