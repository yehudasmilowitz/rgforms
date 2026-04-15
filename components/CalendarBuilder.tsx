'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '@/context/AppContext';
import ProvisioningSteps from '@/components/ProvisioningSteps';
import { provisionCalendar, AppsScriptApiDisabledError } from '@/lib/calendarProvision';

export default function CalendarBuilder() {
  const { state, dispatch } = useApp();
  const [name, setName] = useState('');
  const [provisioning, setProvisioning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (state.screen === 'calendar-provisioning') return <ProvisioningSteps />;

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed || !state.auth.accessToken) return;
    setProvisioning(true);
    setError(null);
    dispatch({ type: 'SET_CALENDAR_BUILDER_NAME', payload: trimmed });
    dispatch({ type: 'START_CALENDAR_PROVISIONING' });
    try {
      const result = await provisionCalendar(
        state.auth.accessToken,
        trimmed,
        (stepId, status, err) => dispatch({ type: 'UPDATE_STEP', payload: { id: stepId, status, error: err } }),
      );
      dispatch({ type: 'SET_CALENDAR_RESULT', payload: result });
    } catch (err) {
      if (err instanceof AppsScriptApiDisabledError) {
        dispatch({ type: 'CALENDAR_PROVISION_ERROR', payload: 'apps-script-disabled' });
      } else {
        dispatch({ type: 'CALENDAR_PROVISION_ERROR', payload: (err as Error).message });
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
              style={{ background: 'oklch(0.55 0.20 270 / 0.12)', color: 'oklch(0.65 0.18 270)', border: '1px solid oklch(0.55 0.20 270 / 0.25)' }}
            >
              Beta
            </span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            New calendar
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            A Google Sheet becomes your event schedule. Add events directly to the sheet and they
            appear in the API immediately — no backend, no redeployment.
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
            'A Google Sheet with an Events tab + 3 sample upcoming events',
            'An Apps Script web app that exposes events as a JSON API',
            'Filter by date, category, or date range with query params',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2">
              <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(0.55 0.20 270)' }} />
              <span className="text-sm" style={{ color: 'var(--color-text)' }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Name input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            Calendar name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) handleCreate(); }}
            placeholder="Company Events"
            autoFocus
            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Usually the site or project name. Creates a sheet named &ldquo;[name] — RG Calendar&rdquo;.
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
            Create calendar
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET_CALENDAR' })}
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
