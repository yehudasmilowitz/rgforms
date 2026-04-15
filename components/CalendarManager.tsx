'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { CalendarModuleSummary } from '@/types';
import {
  listCalendarEvents,
  appendCalendarEvent,
  deleteCalendarEvent,
  type CalendarEvent,
  type NewCalendarEvent,
} from '@/lib/calendarManager';

// ─── Icons ────────────────────────────────────────────────────────────────────

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M1.5 3.5h10M4 3.5V3a.5.5 0 01.5-.5h4A.5.5 0 019 3v.5M3 3.5l.5 7a.5.5 0 00.5.5h5a.5.5 0 00.5-.5l.5-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 9h14M7 3v4M13 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg z-[100]"
      style={{ background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
    >
      {message}
    </motion.div>
  );
}

// ─── Event row ────────────────────────────────────────────────────────────────

interface EventRowProps {
  event: CalendarEvent;
  onDelete: (event: CalendarEvent) => void;
  deleting: boolean;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return dateStr; }
}

function EventRow({ event, onDelete, deleting }: EventRowProps) {
  const dotColor = event.color || '#6366f1';
  const timeStr = event.startTime ? `${event.startTime}${event.endTime ? ` – ${event.endTime}` : ''}` : (event.allDay === 'true' ? 'All day' : '');

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-opacity"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        opacity: deleting ? 0.5 : 1,
      }}
    >
      <div
        className="shrink-0 w-3 h-3 rounded-full mt-0.5"
        style={{ background: dotColor }}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
          {event.title || '(untitled)'}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
          {formatDate(event.date)}{timeStr ? ` · ${timeStr}` : ''}{event.category ? ` · ${event.category}` : ''}
        </p>
        {event.description && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-muted)' }}>
            {event.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDelete(event)}
        disabled={deleting}
        className="shrink-0 p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
        style={{ color: 'var(--color-muted)' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        aria-label={`Delete ${event.title}`}
      >
        <TrashIcon />
      </button>
    </div>
  );
}

// ─── Add event form ───────────────────────────────────────────────────────────

const COLOR_PRESETS = [
  { label: 'Indigo',  value: '#6366f1' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Amber',   value: '#f59e0b' },
  { label: 'Rose',    value: '#f43f5e' },
  { label: 'Sky',     value: '#0ea5e9' },
  { label: 'Violet',  value: '#8b5cf6' },
];

const EMPTY_FORM: NewCalendarEvent = {
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  location: '',
  category: '',
  url: '',
  allDay: false,
  color: '#6366f1',
};

interface AddEventFormProps {
  onAdd: (event: NewCalendarEvent) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

function AddEventForm({ onAdd, onCancel, saving }: AddEventFormProps) {
  const [form, setForm] = useState<NewCalendarEvent>(EMPTY_FORM);

  function set<K extends keyof NewCalendarEvent>(key: K, value: NewCalendarEvent[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    await onAdd(form);
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.625rem',
    fontSize: '0.8125rem',
    outline: 'none',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: 'var(--color-muted)',
    marginBottom: '0.25rem',
    display: 'block',
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label style={labelStyle}>Title <span style={{ color: '#ef4444' }}>*</span></label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Team Standup"
          required
          style={inputStyle}
          onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
          onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
        />
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label style={labelStyle}>Date <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            required
            style={inputStyle}
            onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
            onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
          />
        </div>
        <div className="flex items-end gap-2 pb-0.5">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.allDay}
              onChange={(e) => set('allDay', e.target.checked)}
              className="rounded"
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>All day</span>
          </label>
        </div>
      </div>

      {!form.allDay && (
        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label style={labelStyle}>Start time</label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => set('startTime', e.target.value)}
              style={inputStyle}
              onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
              onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label style={labelStyle}>End time</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => set('endTime', e.target.value)}
              style={inputStyle}
              onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
              onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label style={labelStyle}>Category</label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            placeholder="Meeting"
            style={inputStyle}
            onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
            onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label style={labelStyle}>Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="Conference room A"
            style={inputStyle}
            onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
            onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label style={labelStyle}>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Event details..."
          rows={2}
          style={{ ...inputStyle, resize: 'vertical' }}
          onFocus={(e) => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--color-accent)'; }}
          onBlur={(e) => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--color-border)'; }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label style={labelStyle}>Color</label>
        <div className="flex items-center gap-2 flex-wrap">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => set('color', c.value)}
              className="w-6 h-6 rounded-full border-2 transition-all focus:outline-none"
              style={{
                background: c.value,
                borderColor: form.color === c.value ? 'var(--color-text)' : 'transparent',
                transform: form.color === c.value ? 'scale(1.2)' : 'scale(1)',
              }}
              aria-label={c.label}
            />
          ))}
          <input
            type="color"
            value={form.color}
            onChange={(e) => set('color', e.target.value)}
            className="w-6 h-6 rounded cursor-pointer border"
            style={{ borderColor: 'var(--color-border)', padding: '1px' }}
            aria-label="Custom color"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving || !form.title.trim() || !form.date}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{
            background: 'var(--color-accent)',
            color: '#fff',
            opacity: (saving || !form.title.trim() || !form.date) ? 0.5 : 1,
            cursor: (saving || !form.title.trim() || !form.date) ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : 'Add event'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface CalendarManagerProps {
  module: Pick<CalendarModuleSummary, 'sheetId' | 'sheetUrl' | 'moduleName'>;
  accessToken: string;
  onClose: () => void;
}

export default function CalendarManager({ module, accessToken, onClose }: CalendarManagerProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [numericSheetId, setNumericSheetId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingRows, setDeletingRows] = useState<Set<number>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const { events: evts, numericSheetId: gid } = await listCalendarEvents(accessToken, module.sheetId);
      setEvents(evts);
      setNumericSheetId(gid);
      setError(null);
    } catch {
      setError('Could not load events. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, module.sheetId]);

  useEffect(() => { reload(); }, [reload]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleAdd(event: NewCalendarEvent) {
    setSaving(true);
    try {
      await appendCalendarEvent(accessToken, module.sheetId, event);
      await reload();
      setShowAddForm(false);
      setToast('Event added');
    } catch {
      setToast('Failed to add event');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(event: CalendarEvent) {
    setDeletingRows((prev) => new Set(prev).add(event.rowIndex));
    try {
      await deleteCalendarEvent(accessToken, module.sheetId, numericSheetId, event.rowIndex);
      await reload(); // re-load to get fresh rowIndex values
      setToast('Event deleted');
    } catch {
      setToast('Failed to delete event');
      setDeletingRows((prev) => {
        const next = new Set(prev);
        next.delete(event.rowIndex);
        return next;
      });
    }
  }

  // Sort events: upcoming first, then past
  const today = new Date().toISOString().split('T')[0];
  const upcoming = events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = events.filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: 'rgba(0,0,0,0.7)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          className="w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl border flex flex-col"
          style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', maxHeight: '90vh' }}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 32 }}
          transition={{ duration: 0.25 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'oklch(0.55 0.20 270 / 0.12)', border: '1px solid oklch(0.55 0.20 270 / 0.25)', color: 'oklch(0.65 0.18 270)' }}
              >
                <CalendarIcon />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                  {module.moduleName}
                </h2>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  {events.length} event{events.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!showAddForm && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ background: 'var(--color-accent)', color: '#fff' }}
                >
                  <PlusIcon />
                  Add event
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ color: 'var(--color-muted)' }}
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex flex-col gap-4 p-5">

            {/* Add event form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div
                    className="rounded-xl border p-4 mb-1"
                    style={{ background: 'var(--color-surface)', borderColor: 'var(--color-accent-border)' }}
                  >
                    <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-accent)' }}>New event</p>
                    <AddEventForm
                      onAdd={handleAdd}
                      onCancel={() => setShowAddForm(false)}
                      saving={saving}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Event list */}
            {loading ? (
              <div className="flex flex-col gap-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-xl border p-6 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <p className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>
                <button onClick={() => { setLoading(true); reload(); }} className="mt-3 text-xs underline" style={{ color: 'var(--color-muted)' }}>Try again</button>
              </div>
            ) : events.length === 0 && !showAddForm ? (
              <div className="rounded-xl border p-10 flex flex-col items-center gap-3 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'oklch(0.55 0.20 270 / 0.10)', color: 'oklch(0.65 0.18 270)' }}>
                  <CalendarIcon />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>No events yet</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Add your first event above or edit the sheet directly.</p>
                </div>
              </div>
            ) : (
              <>
                {upcoming.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                      Upcoming · {upcoming.length}
                    </p>
                    {upcoming.map((event) => (
                      <EventRow
                        key={`${event.date}-${event.rowIndex}`}
                        event={event}
                        onDelete={handleDelete}
                        deleting={deletingRows.has(event.rowIndex)}
                      />
                    ))}
                  </div>
                )}
                {past.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                      Past · {past.length}
                    </p>
                    {past.map((event) => (
                      <EventRow
                        key={`${event.date}-${event.rowIndex}`}
                        event={event}
                        onDelete={handleDelete}
                        deleting={deletingRows.has(event.rowIndex)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Footer link */}
            <div className="pt-1 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <a
                href={module.sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium"
                style={{ color: 'var(--color-muted)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-muted)'; }}
              >
                Open Events Sheet for full editing →
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </>
  );
}
