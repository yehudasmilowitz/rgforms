'use client';

import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { useApp } from '@/context/AppContext';
import type { ProvisioningStep } from '@/types';

function StatusIcon({ status }: { status: ProvisioningStep['status'] }) {
  if (status === 'pending') {
    return (
      <div
        className="w-8 h-8 rounded-full border-2 shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
        aria-label="Pending"
      />
    );
  }

  if (status === 'running') {
    return (
      <div className="relative w-8 h-8 shrink-0" aria-label="Running">
        {/* Outer spinning ring */}
        <svg
          className="absolute inset-0 w-8 h-8 animate-spin"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle
            cx="16"
            cy="16"
            r="13"
            stroke="var(--color-border)"
            strokeWidth="2.5"
          />
          <path
            d="M16 3 A13 13 0 0 1 29 16"
            stroke="var(--color-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        {/* Inner dot */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: 'var(--color-accent)' }}
          />
        </div>
      </div>
    );
  }

  if (status === 'complete') {
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'var(--color-success)' }}
        aria-label="Complete"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3 8.5l3.5 3.5 6.5-7"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // error
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
      style={{ background: 'var(--color-error)' }}
      aria-label="Error"
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M4 4l8 8M12 4l-8 8"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function StepRow({ step }: { step: ProvisioningStep }) {
  const isRunning = step.status === 'running';

  return (
    <div
      className={clsx(
        'flex items-start gap-4 p-4 rounded-lg border transition-all duration-300',
        isRunning && 'border-l-2'
      )}
      style={{
        background: isRunning ? 'var(--color-surface-2)' : 'var(--color-surface)',
        borderColor: isRunning ? 'var(--color-accent)' : 'var(--color-border)',
        borderLeftColor: isRunning ? 'var(--color-accent)' : undefined,
        boxShadow: isRunning ? '0 0 12px var(--color-accent-glow)' : undefined,
      }}
    >
      <StatusIcon status={step.status} />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span
          className="text-sm font-semibold leading-snug"
          style={{ color: step.status === 'pending' ? 'var(--color-muted)' : 'var(--color-text)' }}
        >
          {step.label}
        </span>
        <span className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          {step.description}
        </span>
        {step.status === 'error' && step.error && (
          <span
            className="text-xs mt-1 leading-relaxed"
            style={{ color: 'var(--color-error)' }}
            role="alert"
          >
            {step.error}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ProvisioningSteps() {
  const { state, dispatch } = useApp();
  const { steps } = state;

  const hasError = steps.some((s) => s.status === 'error');
  const allComplete = steps.length > 0 && steps.every((s) => s.status === 'complete');

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
            Setting up your form...
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            Usually takes about 10 seconds
          </p>
        </div>

        {/* Steps list */}
        <div className="flex flex-col gap-3" role="list" aria-label="Provisioning steps">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              role="listitem"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
            >
              <StepRow step={step} />
            </motion.div>
          ))}
        </div>

        {/* All complete success state */}
        {allComplete && !hasError && (
          <div
            className="flex items-center justify-center gap-2 py-3 rounded-lg animate-fade-in"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
            role="status"
            aria-live="polite"
          >
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3 8.5l3.5 3.5 6.5-7"
                stroke="var(--color-success)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
              All done! Building your embed...
            </span>
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div
            className="flex flex-col items-center gap-4 py-5 px-6 rounded-lg border animate-fade-in"
            style={{
              background: 'rgba(239,68,68,0.08)',
              borderColor: 'rgba(239,68,68,0.3)',
            }}
            role="alert"
          >
            <p className="text-sm font-medium text-center" style={{ color: 'var(--color-error)' }}>
              Something went wrong during setup.
            </p>
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                background: 'var(--color-surface-2)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
              }}
            >
              Try again
            </button>
          </div>
        )}
      </motion.div>
    </main>
  );
}
