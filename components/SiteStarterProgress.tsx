'use client';

import { motion } from 'motion/react';
import { useApp } from '@/context/AppContext';
import type { SiteStarterModuleProgress } from '@/types';

// ─── Step / module type → human label map ────────────────────────────────────

const STEP_LABELS: Record<string, string> = {
  drive:    'Drive folder + asset storage',
  sheet:    'Google Sheet + tabs',
  script:   'Apps Script project',
  deploy:   'Web app deployment',
  manifest: 'Manifest + configuration',
};

const STEP_SCOPES: Record<string, string[]> = {
  drive:  ['drive.file'],
  sheet:  ['drive.file'],
  script: ['script.projects'],
  deploy: ['script.deployments'],
};

function ScopeBadge({ scope }: { scope: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold"
      style={{
        background:  'oklch(0.25 0.12 250 / 0.35)',
        border:      '1px solid oklch(0.55 0.15 250 / 0.40)',
        color:       'oklch(0.78 0.14 250)',
      }}
    >
      <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <circle cx="5" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="2" y="5" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
      {scope}
    </span>
  );
}

// ─── Status icons ─────────────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <div className="relative w-6 h-6 shrink-0" aria-label="Running">
      <svg className="absolute inset-0 w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="var(--color-border)" strokeWidth="2" />
        <path d="M12 2 A10 10 0 0 1 22 12" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function CheckIcon() {
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
      style={{ background: 'var(--color-success)' }}
      aria-label="Complete"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M2 6.5l2.5 2.5 5.5-5.5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function ErrorIcon() {
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
      style={{ background: 'var(--color-error)' }}
      aria-label="Error"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M3 3l6 6M9 3l-6 6" stroke="white" strokeWidth="1.75" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function PendingDot() {
  return (
    <div
      className="w-6 h-6 flex items-center justify-center shrink-0"
      aria-label="Pending"
    >
      <div
        className="w-2.5 h-2.5 rounded-full"
        style={{ background: 'var(--color-border)' }}
      />
    </div>
  );
}

function StatusIcon({ status }: { status: SiteStarterModuleProgress['status'] }) {
  if (status === 'running')  return <SpinnerIcon />;
  if (status === 'complete') return <CheckIcon />;
  if (status === 'error')    return <ErrorIcon />;
  return <PendingDot />;
}

// ─── Module row ───────────────────────────────────────────────────────────────

function ModuleRow({ mod, index }: { mod: SiteStarterModuleProgress; index: number }) {
  const isRunning = mod.status === 'running';
  const typeLabel = STEP_LABELS[mod.moduleType] ?? mod.moduleType;
  const scopes    = STEP_SCOPES[mod.moduleType] ?? [];
  const truncUrl  = mod.deploymentUrl
    ? mod.deploymentUrl.replace('https://script.google.com/macros/s/', '…/s/').slice(0, 60) + (mod.deploymentUrl.length > 60 ? '…' : '')
    : null;

  return (
    <motion.div
      className="flex items-start gap-3 p-4 rounded-xl border transition-all duration-200"
      style={{
        background:    isRunning ? 'var(--color-surface-2)' : 'var(--color-surface)',
        borderColor:   isRunning ? 'var(--color-accent)'    : 'var(--color-border)',
        borderLeftWidth: isRunning ? '2px' : '1px',
      }}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
    >
      <StatusIcon status={mod.status} />

      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-sm font-semibold leading-snug"
            style={{ color: mod.status === 'pending' ? 'var(--color-muted)' : 'var(--color-text)' }}
          >
            {mod.moduleName}
          </span>
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
            style={{
              background: 'var(--color-surface-2)',
              color:      'var(--color-muted)',
              border:     '1px solid var(--color-border)',
            }}
          >
            {typeLabel}
          </span>
          {(isRunning || mod.status === 'complete') && scopes.map((s) => (
            <ScopeBadge key={s} scope={s} />
          ))}
        </div>

        {mod.status === 'complete' && truncUrl && (
          <span className="text-xs font-mono truncate" style={{ color: 'var(--color-muted)' }}>
            {truncUrl}
          </span>
        )}

        {mod.status === 'error' && mod.errorCode === 'apps-script-user-setting' && (
          <div
            className="mt-2 flex flex-col gap-2 p-3 rounded-lg text-xs leading-relaxed"
            style={{ background: 'oklch(0.40 0.18 25 / 0.08)', border: '1px solid oklch(0.55 0.20 25 / 0.25)' }}
            role="alert"
          >
            <p style={{ color: 'var(--color-text)' }}>
              Google requires you to opt in to Apps Script access once in your account settings. This is a one-time step — it only takes a few seconds.
            </p>
            <a
              href="https://script.google.com/home/usersettings"
              target="_blank"
              rel="noopener noreferrer"
              className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-opacity hover:opacity-80"
              style={{ background: 'var(--color-accent)', color: 'white' }}
            >
              Open Google Account Settings
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 8L8 2M8 2H4M8 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <p style={{ color: 'var(--color-muted)' }}>
              After enabling Apps Script API, come back and try again.
            </p>
          </div>
        )}

        {mod.status === 'error' && !mod.errorCode && mod.error && (
          <span className="text-xs leading-relaxed" style={{ color: 'var(--color-error)' }} role="alert">
            {mod.error}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SiteStarterProgress() {
  const { state } = useApp();
  const { siteStarterProgress, siteStarterConfig } = state;

  const total    = siteStarterProgress.length;
  const complete = siteStarterProgress.filter((m) => m.status === 'complete').length;
  const hasError = siteStarterProgress.some((m) => m.status === 'error');
  const allDone  = total > 0 && siteStarterProgress.every((m) => m.status === 'complete' || m.status === 'error');

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <motion.div
        className="w-full max-w-lg flex flex-col gap-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.21, 1.02, 0.73, 0.99] }}
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
            Creating your contact form…
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            {siteStarterConfig.siteName ?? 'Setting up your form…'}
          </p>
          <div
            className="mt-1 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: 'var(--color-surface)',
              color:      complete === total && total > 0 ? 'var(--color-success)' : 'var(--color-accent)',
              border:     '1px solid var(--color-border)',
            }}
          >
            {complete} of {total} complete
          </div>
        </div>

        {/* Module list */}
        <div className="flex flex-col gap-2" role="list" aria-label="Module provisioning status">
          {siteStarterProgress.map((mod, i) => (
            <div key={`${mod.moduleType}-${mod.moduleName}`} role="listitem">
              <ModuleRow mod={mod} index={i} />
            </div>
          ))}
        </div>

        {/* All done — success */}
        {allDone && !hasError && (
          <motion.div
            className="flex items-center justify-center gap-2 py-3 rounded-xl"
            style={{ background: 'oklch(0.25 0.05 150 / 0.6)', border: '1px solid oklch(0.55 0.20 150 / 0.30)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            role="status"
            aria-live="polite"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8.5l3.5 3.5 6.5-7" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
              All done! Loading your dashboard…
            </span>
          </motion.div>
        )}

        {/* Partial success / error */}
        {allDone && hasError && (() => {
          const userSettingFailed = siteStarterProgress.some((m) => m.errorCode === 'apps-script-user-setting');
          return (
            <motion.div
              className="flex flex-col gap-1 py-3 px-4 rounded-xl"
              style={{ background: 'oklch(0.40 0.18 25 / 0.10)', border: '1px solid oklch(0.55 0.20 25 / 0.30)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              role="alert"
            >
              {userSettingFailed ? (
                <p className="text-sm font-medium" style={{ color: 'var(--color-error)' }}>
                  Enable Apps Script in your Google account settings, then try again.
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-error)' }}>
                    Some steps failed to complete
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    {complete} of {total} steps succeeded. Please try again.
                  </p>
                </>
              )}
            </motion.div>
          );
        })()}
      </motion.div>
    </main>
  );
}
