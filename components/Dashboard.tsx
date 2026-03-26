'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { useApp } from '@/context/AppContext';
import { listMyForms, deleteForm } from '@/lib/myForms';
import FormDetailModal from '@/components/FormDetailModal';
import type { FormSummary } from '@/types';

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 2h4v4M14 2L8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5 4L1 8l4 4M11 4l4 4-4 4M9 2l-2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpreadsheetIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 7h14M3 11h14M7 7v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ---------------------------------------------------------------------------
// FormCard
// ---------------------------------------------------------------------------

interface FormCardProps {
  form: FormSummary;
  onDelete: (form: FormSummary) => void;
  onView: (form: FormSummary) => void;
  deleting: boolean;
}

function FormCard({ form, onDelete, onView, deleting }: FormCardProps) {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-4"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        opacity: deleting ? 0.5 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Name + date */}
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
          >
            <SpreadsheetIcon className="w-4 h-4" style={{ color: 'var(--color-accent)' } as React.CSSProperties} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
              {form.formName}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
              Created {formatDate(form.createdAt)}
            </p>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDelete(form)}
          disabled={deleting}
          className={clsx(
            'shrink-0 p-1.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
            deleting && 'cursor-not-allowed',
          )}
          style={{
            background: 'transparent',
            borderColor: 'var(--color-border)',
            color: 'var(--color-muted)',
          }}
          onMouseEnter={(e) => {
            if (!deleting) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.5)';
              (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
          aria-label={`Delete ${form.formName}`}
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Action links */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onView(form)}
          disabled={deleting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{
            background: 'var(--color-surface-2)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)';
          }}
        >
          <CodeIcon className="w-3 h-3 shrink-0" />
          Details
        </button>

        <a
          href={form.sheetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{
            background: 'var(--color-surface-2)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)';
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)';
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)';
          }}
        >
          <ExternalLinkIcon className="w-3 h-3 shrink-0" />
          Google Sheet
        </a>

        {form.scriptUrl && (
          <a
            href={form.scriptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{
              background: 'var(--color-surface-2)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)';
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)';
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)';
            }}
          >
            <ExternalLinkIcon className="w-3 h-3 shrink-0" />
            Apps Script
          </a>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DeleteConfirmDialog
// ---------------------------------------------------------------------------

interface DeleteConfirmProps {
  form: FormSummary;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmDialog({ form, onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div
        className="w-full max-w-sm rounded-2xl border p-6 flex flex-col gap-5"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
            Delete &ldquo;{form.formName}&rdquo;?
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            This will permanently delete the Google Sheet and Apps Script from your Drive. This cannot be undone.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-opacity focus:outline-none focus:ring-2 focus:ring-red-400"
            style={{ background: '#ef4444', color: '#fff' }}
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const user = state.auth.user!;
  const accessToken = state.auth.accessToken!;

  const [forms, setForms] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // The form whose details modal is open
  const [selectedForm, setSelectedForm] = useState<FormSummary | null>(null);
  // The form pending deletion confirmation
  const [pendingDelete, setPendingDelete] = useState<FormSummary | null>(null);
  // IDs currently being deleted (for optimistic UI)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    listMyForms(accessToken)
      .then((result) => {
        if (!cancelled) {
          setForms(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError('Could not load your forms. Please try again.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [accessToken]);

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    const form = pendingDelete;
    setPendingDelete(null);
    setDeletingIds((prev) => new Set(prev).add(form.sheetId));

    try {
      await deleteForm(accessToken, form.sheetId, form.scriptId);
      setForms((prev) => prev.filter((f) => f.sheetId !== form.sheetId));
    } catch {
      // If delete fails, just remove from deleting set so it re-appears
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(form.sheetId);
        return next;
      });
    }
  }

  return (
    <motion.main
      className="min-h-screen flex flex-col px-4 py-8"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">

        {/* Header bar */}
        <header
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.picture}
              alt={user.name}
              width={32}
              height={32}
              className="rounded-full shrink-0 border border-[var(--color-border)]"
            />
            <div className="hidden sm:flex flex-col min-w-0">
              <span className="text-xs font-medium truncate leading-none" style={{ color: 'var(--color-text)' }}>
                {user.name}
              </span>
              <span className="text-xs truncate leading-none mt-0.5" style={{ color: 'var(--color-muted)' }}>
                {user.email}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => dispatch({ type: 'SIGN_OUT' })}
            className={clsx(
              'shrink-0 px-3 py-1.5 rounded-lg border text-xs font-medium',
              'transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
            )}
            style={{
              background: 'transparent',
              borderColor: 'var(--color-border)',
              color: 'var(--color-muted)',
            }}
          >
            Sign out
          </button>
        </header>

        {/* Page title + create button */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
              My Forms
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
              Forms you&apos;ve created with RG Forms
            </p>
          </div>

          <button
            type="button"
            onClick={() => dispatch({ type: 'GO_TO_BUILDER' })}
            className="flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-hover)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)';
            }}
          >
            <PlusIcon className="w-3.5 h-3.5" />
            New form
          </button>
        </div>

        {/* Forms list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-xl border p-5 h-24 animate-pulse"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              />
            ))}
          </div>
        ) : loadError ? (
          <div
            className="rounded-xl border p-6 text-center"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--color-error)' }}>{loadError}</p>
            <button
              onClick={() => {
                setLoading(true);
                setLoadError(null);
                listMyForms(accessToken)
                  .then(setForms)
                  .catch(() => setLoadError('Could not load your forms. Please try again.'))
                  .finally(() => setLoading(false));
              }}
              className="mt-3 text-xs underline"
              style={{ color: 'var(--color-muted)' }}
            >
              Try again
            </button>
          </div>
        ) : forms.length === 0 ? (
          <div
            className="rounded-xl border p-10 flex flex-col items-center gap-4 text-center"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
            >
              <SpreadsheetIcon className="w-6 h-6" style={{ color: 'var(--color-muted)' } as React.CSSProperties} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                No forms yet
              </p>
              <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--color-muted)' }}>
                Create your first form to get started. Your Google Sheet and Apps Script will appear here.
              </p>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: 'GO_TO_BUILDER' })}
              className="mt-1 px-5 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ background: 'var(--color-accent)', color: '#fff' }}
            >
              Create your first form
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {forms.map((form, index) => (
              <motion.div
                key={form.sheetId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
              >
                <FormCard
                  form={form}
                  onDelete={setPendingDelete}
                  onView={setSelectedForm}
                  deleting={deletingIds.has(form.sheetId)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Form detail modal */}
      {selectedForm && (
        <FormDetailModal form={selectedForm} onClose={() => setSelectedForm(null)} />
      )}

      {/* Delete confirmation dialog */}
      {pendingDelete && (
        <DeleteConfirmDialog
          form={pendingDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </motion.main>
  );
}
