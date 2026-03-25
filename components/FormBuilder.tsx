'use client';

import { useState, useRef, useCallback } from 'react';
import { clsx } from 'clsx';
import { useApp } from '@/context/AppContext';
import { provision, AppsScriptApiDisabledError } from '@/lib/provision';
import { FieldRow } from './FieldRow';
import type { FormField } from '@/types';

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

interface ValidationErrors {
  formName?: string;
  notifyEmail?: string;
  fields?: string;
  duplicateLabels?: string;
  emptyLabels?: string;
}

function validate(
  formName: string,
  notifyEmail: string,
  fields: FormField[],
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!formName.trim()) {
    errors.formName = 'Form name is required.';
  }

  if (!notifyEmail.trim()) {
    errors.notifyEmail = 'Notification email is required.';
  } else if (!isValidEmail(notifyEmail)) {
    errors.notifyEmail = 'Please enter a valid email address.';
  }

  if (fields.length === 0) {
    errors.fields = 'Your form needs at least one field.';
  }

  const hasEmpty = fields.some((f) => f.label.trim() === '');
  if (hasEmpty) {
    errors.emptyLabels = 'All field labels must be non-empty.';
  }

  const labels = fields.map((f) => f.label.trim().toLowerCase()).filter(Boolean);
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const l of labels) {
    if (seen.has(l)) dupes.add(l);
    seen.add(l);
  }
  if (dupes.size > 0) {
    errors.duplicateLabels = `Duplicate field labels: ${[...dupes].join(', ')}.`;
  }

  return errors;
}

function isValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}

// ---------------------------------------------------------------------------
// FormBuilderScreen component
// ---------------------------------------------------------------------------

// Named export used by app/builder/page.tsx
// Default export used by app/page.tsx (imported as FormBuilderScreen)
export function FormBuilderScreen() {
  const { state, dispatch } = useApp();
  const { formConfig } = state;
  const user = state.auth.user!;
  const accessToken = state.auth.accessToken!;

  // Local editable copies of form-level fields
  const [formName, setFormName] = useState(formConfig.name);
  const [notifyEmail, setNotifyEmail] = useState(
    formConfig.notifyEmail || user.email,
  );
  const [fields, setFields] = useState<FormField[]>(formConfig.fields);

  // Touch state for form-level fields
  const [formNameTouched, setFormNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const provisionError = state.provisionError;
  const appsScriptApiDisabled = state.appsScriptApiDisabled;

  // Drag-and-drop state
  const dragIndexRef = useRef<number | null>(null);
  const dragOverIndexRef = useRef<number | null>(null);

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  const errors = validate(formName, notifyEmail, fields);
  const formIsValid = isValid(errors);

  // ---------------------------------------------------------------------------
  // Field management
  // ---------------------------------------------------------------------------

  const handleAddField = useCallback(() => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      label: '',
      type: 'text',
      required: false,
    };
    setFields((prev) => [...prev, newField]);
  }, []);

  const handleUpdateField = useCallback(
    (id: string, updates: Partial<FormField>) => {
      setFields((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
      );
    },
    [],
  );

  const handleRemoveField = useCallback((id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleMoveUp = useCallback((id: string) => {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }, []);

  const handleMoveDown = useCallback((id: string) => {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }, []);

  // ---------------------------------------------------------------------------
  // HTML5 drag-and-drop reordering
  // ---------------------------------------------------------------------------

  function handleDragStart(index: number) {
    dragIndexRef.current = index;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    dragOverIndexRef.current = index;
  }

  function handleDrop() {
    const from = dragIndexRef.current;
    const to = dragOverIndexRef.current;
    if (from === null || to === null || from === to) return;
    setFields((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    dragIndexRef.current = null;
    dragOverIndexRef.current = null;
  }

  function handleDragEnd() {
    dragIndexRef.current = null;
    dragOverIndexRef.current = null;
  }

  // ---------------------------------------------------------------------------
  // Provisioning
  // ---------------------------------------------------------------------------

  async function handleGenerate() {
    if (!formIsValid || isSubmitting) return;

    dispatch({ type: 'CLEAR_ERROR' });
    setIsSubmitting(true);

    const config = {
      name: formName.trim(),
      notifyEmail: notifyEmail.trim(),
      fields,
    };

    // Sync latest config to global state before provisioning
    dispatch({ type: 'SET_FORM_CONFIG', payload: config });
    dispatch({ type: 'START_PROVISIONING' });

    try {
      const result = await provision(
        accessToken,
        config,
        (id, status, error) =>
          dispatch({ type: 'UPDATE_STEP', payload: { id, status, error } }),
      );
      dispatch({ type: 'SET_RESULT', payload: result });
    } catch (err) {
      setIsSubmitting(false);
      dispatch({ type: 'SET_FORM_CONFIG', payload: config });
      if (err instanceof AppsScriptApiDisabledError) {
        dispatch({ type: 'APPS_SCRIPT_API_DISABLED' });
      } else {
        dispatch({
          type: 'PROVISION_ERROR',
          payload: err instanceof Error ? err.message : 'Provisioning failed. Please try again.',
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Sign out
  // ---------------------------------------------------------------------------

  function handleSignOut() {
    dispatch({ type: 'SIGN_OUT' });
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // Derive validation errors to show inline (only after field is touched)
  const showFormNameError = formNameTouched && !!errors.formName;
  const showEmailError = emailTouched && !!errors.notifyEmail;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Header bar */}
      <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Logo */}
          <span className="font-semibold text-[var(--color-text)] mr-auto text-sm tracking-tight">
            rg<span className="text-[var(--color-accent)]">forms</span>
          </span>

          {/* User avatar + name */}
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
              <span className="text-xs font-medium text-[var(--color-text)] truncate leading-none">
                {user.name}
              </span>
              <span className="text-xs text-[var(--color-muted)] truncate leading-none mt-0.5">
                {user.email}
              </span>
            </div>
          </div>

          {/* Sign out */}
          <button
            type="button"
            onClick={handleSignOut}
            className={clsx(
              'text-xs px-3 py-1.5 rounded-md',
              'border border-[var(--color-border)]',
              'text-[var(--color-muted)] hover:text-[var(--color-text)]',
              'hover:border-[var(--color-text)] transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
            )}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Build your form
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Configure your fields, then generate a live Google-powered form in seconds.
          </p>
        </div>

        {/* Generic provisioning error toast */}
        {provisionError && (
          <div
            role="alert"
            className={clsx(
              'flex items-start gap-3 px-4 py-3 rounded-lg',
              'bg-[var(--color-error)]/10 border border-[var(--color-error)]/40',
              'text-sm text-[var(--color-error)]',
              'animate-slide-up',
            )}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="flex-1">
              <p className="font-medium">Provisioning failed</p>
              <p className="mt-0.5 opacity-90">{provisionError}</p>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Dismiss error"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Form settings card */}
        <section
          className={clsx(
            'rounded-xl border border-[var(--color-border)]',
            'bg-[var(--color-surface)] p-6 flex flex-col gap-5',
          )}
        >
          <h2 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider">
            Form settings
          </h2>

          {/* Form name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="form-name"
              className="text-sm font-medium text-[var(--color-text)]"
            >
              Form name <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              id="form-name"
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              onBlur={() => setFormNameTouched(true)}
              placeholder="e.g. Contact Us"
              className={clsx(
                'w-full px-3 py-2.5 rounded-lg text-sm',
                'bg-[var(--color-surface-2)] text-[var(--color-text)]',
                'border transition-colors duration-150',
                'placeholder:text-[var(--color-muted)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
                showFormNameError
                  ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]'
                  : 'border-[var(--color-border)]',
              )}
              aria-invalid={showFormNameError}
              aria-describedby={showFormNameError ? 'form-name-error' : undefined}
            />
            {showFormNameError && (
              <p
                id="form-name-error"
                role="alert"
                className="text-xs text-[var(--color-error)]"
              >
                {errors.formName}
              </p>
            )}
          </div>

          {/* Notification email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="notify-email"
              className="text-sm font-medium text-[var(--color-text)]"
            >
              Notification email <span className="text-[var(--color-error)]">*</span>
            </label>
            <p className="text-xs text-[var(--color-muted)]">
              New submissions will be emailed here.
            </p>
            <input
              id="notify-email"
              type="email"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder="you@example.com"
              className={clsx(
                'w-full px-3 py-2.5 rounded-lg text-sm',
                'bg-[var(--color-surface-2)] text-[var(--color-text)]',
                'border transition-colors duration-150',
                'placeholder:text-[var(--color-muted)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
                showEmailError
                  ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]'
                  : 'border-[var(--color-border)]',
              )}
              aria-invalid={showEmailError}
              aria-describedby={showEmailError ? 'notify-email-error' : undefined}
            />
            {showEmailError && (
              <p
                id="notify-email-error"
                role="alert"
                className="text-xs text-[var(--color-error)]"
              >
                {errors.notifyEmail}
              </p>
            )}
          </div>
        </section>

        {/* Fields section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider">
                Fields
              </h2>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                Drag rows to reorder. At least one field required.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddField}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium',
                'bg-[var(--color-surface-2)] border border-[var(--color-border)]',
                'text-[var(--color-text)] hover:border-[var(--color-accent)]',
                'hover:text-[var(--color-accent)] transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
              )}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add field
            </button>
          </div>

          {/* Field validation errors */}
          {(errors.fields || errors.emptyLabels || errors.duplicateLabels) && (
            <div
              role="alert"
              className={clsx(
                'px-4 py-3 rounded-lg text-xs',
                'bg-[var(--color-error)]/10 border border-[var(--color-error)]/30',
                'text-[var(--color-error)] flex flex-col gap-1',
              )}
            >
              {errors.fields && <p>{errors.fields}</p>}
              {errors.emptyLabels && <p>{errors.emptyLabels}</p>}
              {errors.duplicateLabels && <p>{errors.duplicateLabels}</p>}
            </div>
          )}

          {/* Field rows */}
          <div className="flex flex-col gap-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                className="transition-opacity duration-150"
              >
                <FieldRow
                  field={field}
                  index={index}
                  total={fields.length}
                  onUpdate={handleUpdateField}
                  onRemove={handleRemoveField}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  dragHandleProps={{}}
                />
              </div>
            ))}
          </div>

          {fields.length === 0 && (
            <div
              className={clsx(
                'rounded-lg border-2 border-dashed border-[var(--color-border)]',
                'py-10 flex flex-col items-center justify-center gap-2',
                'text-[var(--color-muted)] text-sm',
              )}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-50"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <p>No fields yet — click "Add field" to get started.</p>
            </div>
          )}
        </section>

        {/* Generate CTA */}
        <div className="flex flex-col gap-3 pb-12">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!formIsValid || isSubmitting}
            className={clsx(
              'w-full py-4 px-6 rounded-xl text-base font-semibold',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]',
              formIsValid && !isSubmitting
                ? [
                    'bg-[var(--color-accent)] text-white',
                    'hover:bg-[var(--color-accent-hover)] shadow-lg shadow-[var(--color-accent-glow)]',
                    'active:scale-[0.99]',
                  ]
                : [
                    'bg-[var(--color-surface-2)] text-[var(--color-muted)]',
                    'border border-[var(--color-border)] cursor-not-allowed',
                  ],
            )}
            aria-disabled={!formIsValid || isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Generating…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Generate my form
              </span>
            )}
          </button>

          {!formIsValid && (
            <p className="text-xs text-center text-[var(--color-muted)]">
              Fill in all required fields and fix any errors above to continue.
            </p>
          )}
        </div>
      </main>

      {/* Apps Script API disabled dialog */}
      {appsScriptApiDisabled && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="apps-script-dialog-title"
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4 shadow-2xl"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-error)' }} aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h2 id="apps-script-dialog-title" className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                  One-time setup required
                </h2>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
                className="shrink-0 opacity-50 hover:opacity-100 transition-opacity mt-0.5"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text)' }} aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              To use rgforms, you need to enable the <strong style={{ color: 'var(--color-text)' }}>Apps Script API</strong> in your Google account. This is a one-time step.
            </p>

            {/* Steps */}
            <ol className="flex flex-col gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
              {[
                <>Click <strong style={{ color: 'var(--color-text)' }}>Enable the Apps Script API</strong> below.</>,
                <>On the settings page, toggle <strong style={{ color: 'var(--color-text)' }}>Google Apps Script API</strong> to <strong style={{ color: 'var(--color-text)' }}>On</strong>.</>,
                <>Come back here and click <strong style={{ color: 'var(--color-text)' }}>Generate my form</strong> again.</>,
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: 'var(--color-surface-2)', color: 'var(--color-accent)', border: '1px solid var(--color-border)' }}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <a
                href="https://script.google.com/home/usersettings"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-accent-hover)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-accent)'; }}
              >
                Enable the Apps Script API
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M10 2h4v4M14 2L8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <button
                type="button"
                onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
                className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-border)]"
                style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormBuilderScreen;
