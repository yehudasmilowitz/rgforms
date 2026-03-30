'use client';

import { useState, useRef, useCallback, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { useApp } from '@/context/AppContext';
import { provision, AppsScriptApiDisabledError } from '@/lib/provision';
import { FieldRow } from './FieldRow';
import type { FormField } from '@/types';
import UserAvatar from '@/components/UserAvatar';

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
// EmailTagInput — chip-style multi-email input
// ---------------------------------------------------------------------------

interface EmailTagInputProps {
  id: string;
  emails: string[];
  inputValue: string;
  placeholder?: string;
  onInputChange: (val: string) => void;
  onAdd: (email: string) => void;
  onRemove: (email: string) => void;
}

function EmailTagInput({
  id,
  emails,
  inputValue,
  placeholder,
  onInputChange,
  onAdd,
  onRemove,
}: EmailTagInputProps) {
  function commit(raw: string) {
    const email = raw.trim().replace(/,+$/, '');
    if (email && isValidEmail(email) && !emails.includes(email)) {
      onAdd(email);
      onInputChange('');
    } else if (email && !isValidEmail(email)) {
      // leave it in the input so the user can see what's wrong
    } else {
      onInputChange('');
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      if (inputValue.trim()) {
        e.preventDefault();
        commit(inputValue);
      }
    }
    if (e.key === 'Backspace' && inputValue === '' && emails.length > 0) {
      onRemove(emails[emails.length - 1]);
    }
  }

  function handleBlur() {
    if (inputValue.trim()) commit(inputValue);
  }

  return (
    <div
      className={clsx(
        'flex flex-wrap gap-1.5 px-2.5 py-2 rounded-lg min-h-[42px]',
        'bg-[var(--color-surface-2)] border border-[var(--color-border)]',
        'focus-within:ring-2 focus-within:ring-[var(--color-accent)] focus-within:border-[var(--color-accent)]',
        'transition-colors duration-150 cursor-text',
      )}
      onClick={(e) => {
        const input = (e.currentTarget as HTMLDivElement).querySelector('input');
        input?.focus();
      }}
    >
      {emails.map((email) => (
        <span
          key={email}
          className={clsx(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium',
            'bg-[var(--color-accent)]/15 text-[var(--color-accent)]',
            'border border-[var(--color-accent)]/30',
          )}
        >
          {email}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(email); }}
            className="opacity-60 hover:opacity-100 transition-opacity leading-none ml-0.5 focus:outline-none"
            aria-label={`Remove ${email}`}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </span>
      ))}
      <input
        id={id}
        type="email"
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={emails.length === 0 ? (placeholder ?? 'Type an email, press Enter to add') : ''}
        className={clsx(
          'flex-1 min-w-[180px] bg-transparent text-sm outline-none',
          'text-[var(--color-text)] placeholder:text-[var(--color-muted)]',
          'py-0.5',
        )}
        autoComplete="off"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// StepIndicator
// ---------------------------------------------------------------------------

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, label: 'Name' },
    { number: 2, label: 'Fields' },
    { number: 3, label: 'Notifications' },
  ];

  return (
    <div className="flex items-center justify-center gap-0" aria-label="Form creation progress">
      {steps.map((step, i) => {
        const isDone = step.number < currentStep;
        const isActive = step.number === currentStep;

        return (
          <div key={step.number} className="flex items-start">
            {/* Connector line before (not before step 1) */}
            {i > 0 && (
              <div
                className={clsx(
                  'h-px w-10 sm:w-16 mt-4 transition-colors duration-300',
                  step.number <= currentStep
                    ? 'bg-[var(--color-accent)]'
                    : 'bg-[var(--color-border)]',
                )}
              />
            )}

            <div className="flex flex-col items-center gap-1.5">
              {/* Circle */}
              <div
                className={clsx(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold',
                  'transition-all duration-300 border-2',
                  isDone
                    ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
                    : isActive
                      ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white shadow-md shadow-[var(--color-accent)]/30'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-muted)]',
                )}
                style={{ fontFamily: 'var(--font-display)' }}
                aria-current={isActive ? 'step' : undefined}
              >
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>

              {/* Label */}
              <span
                className={clsx(
                  'text-[10px] font-medium tracking-wide hidden sm:block',
                  isActive
                    ? 'text-[var(--color-accent)]'
                    : isDone
                      ? 'text-[var(--color-text)]'
                      : 'text-[var(--color-muted)]',
                )}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 30 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.21, 1.02, 0.73, 0.99] as const } },
  exit: (dir: number) => ({ opacity: 0, x: dir * -30, transition: { duration: 0.2 } }),
};

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

  // Wizard step — initialise to the last step if returning from a failed provision
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(state.builderInitialStep ?? 1);
  const directionRef = useRef(1);

  // Core form settings
  const [formName, setFormName] = useState(formConfig.name);
  const [notifyEmail, setNotifyEmail] = useState(
    formConfig.notifyEmail || user.email,
  );
  const [fields, setFields] = useState<FormField[]>(formConfig.fields);

  // Email notification settings
  const [ccEmails, setCcEmails] = useState<string[]>(formConfig.ccEmails ?? []);
  const [bccEmails, setBccEmails] = useState<string[]>(formConfig.bccEmails ?? []);
  const [emailSubject, setEmailSubject] = useState(formConfig.emailSubject ?? '');
  const [senderName, setSenderName] = useState(formConfig.senderName ?? '');
  const [replyToFieldId, setReplyToFieldId] = useState<string | null>(
    formConfig.replyToFieldId ?? formConfig.fields.find((f) => f.type === 'email')?.id ?? null,
  );
  const prevEmailFieldIdsRef = useRef<Set<string>>(
    new Set(formConfig.fields.filter((f) => f.type === 'email').map((f) => f.id)),
  );
  const [enableHoneypot, setEnableHoneypot] = useState(formConfig.enableHoneypot ?? true);
  const [additionalSettingsOpen, setAdditionalSettingsOpen] = useState(false);

  // Tag input buffer values
  const [ccInput, setCcInput] = useState('');
  const [bccInput, setBccInput] = useState('');

  // Touch state
  const [formNameTouched, setFormNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const provisionError = state.provisionError;
  const appsScriptApiDisabled = state.appsScriptApiDisabled;

  // Drag-and-drop state
  const dragIndexRef = useRef<number | null>(null);
  const dragOverIndexRef = useRef<number | null>(null);

  // Auto-select reply-to when a new email field is added and none is selected
  useEffect(() => {
    const currentEmailFields = fields.filter((f) => f.type === 'email');
    const prevIds = prevEmailFieldIdsRef.current;
    const newEmailField = currentEmailFields.find((f) => !prevIds.has(f.id));
    prevEmailFieldIdsRef.current = new Set(currentEmailFields.map((f) => f.id));
    if (newEmailField && replyToFieldId === null) {
      setReplyToFieldId(newEmailField.id);
    }
  }, [fields, replyToFieldId]);

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  const errors = validate(formName, notifyEmail, fields);
  const formIsValid = isValid(errors);

  // Step advancement guards
  const canAdvanceStep1 = formName.trim().length > 0;
  const canAdvanceStep2 =
    fields.length > 0 && !errors.fields && !errors.emptyLabels && !errors.duplicateLabels;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      ccEmails: ccEmails.length > 0 ? ccEmails : undefined,
      bccEmails: bccEmails.length > 0 ? bccEmails : undefined,
      emailSubject: emailSubject.trim() || undefined,
      senderName: senderName.trim() || undefined,
      replyToFieldId: replyToFieldId ?? undefined,
      enableHoneypot: enableHoneypot || undefined,
    };

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
        dispatch({ type: 'PROVISION_FAILED_API_DISABLED' });
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
  // Navigation helpers
  // ---------------------------------------------------------------------------

  function goNext() {
    directionRef.current = 1;
    setWizardStep((s) => Math.min(s + 1, 3) as 1 | 2 | 3);
  }

  function goBack() {
    directionRef.current = -1;
    setWizardStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3);
  }

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const showFormNameError = formNameTouched && !!errors.formName;
  const showEmailError = emailTouched && !!errors.notifyEmail;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Header bar */}
      <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="mr-auto flex flex-col">
            <span
              className="font-semibold text-[var(--color-text)] text-sm tracking-tight leading-none"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              RG <span style={{ color: 'var(--color-accent)' }}>Forms</span>
            </span>
            <span className="text-[10px] text-[var(--color-muted)] mt-0.5 leading-none" style={{ fontFamily: 'var(--font-display)' }}>
              Step {wizardStep} of 3
            </span>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <UserAvatar name={user.name} picture={user.picture} />
            <div className="hidden sm:flex flex-col min-w-0">
              <span className="text-xs font-medium text-[var(--color-text)] truncate leading-none">
                {user.name}
              </span>
              <span className="text-xs text-[var(--color-muted)] truncate leading-none mt-0.5">
                {user.email}
              </span>
            </div>
          </div>

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
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Step indicator */}
        <StepIndicator currentStep={wizardStep} />

        {/* Apps Script API disabled banner — shown after a failed provision attempt */}
        {appsScriptApiDisabled && (
          <div
            className="rounded-xl border p-4 flex items-start gap-3"
            style={{ background: 'rgba(234,179,8,0.06)', borderColor: 'rgba(234,179,8,0.3)' }}
          >
            <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(202,138,4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div className="flex flex-col gap-2 min-w-0 flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                One setup step required
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                The <strong style={{ color: 'var(--color-text)' }}>Google Apps Script API</strong> needs to be enabled in your Google account. This is part of the initial setup and only needs to be done once.
              </p>
              <a
                href="https://script.google.com/home/usersettings"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold self-start mt-1"
                style={{ background: 'rgba(202,138,4,0.15)', color: 'rgb(202,138,4)', border: '1px solid rgba(234,179,8,0.4)' }}
              >
                Enable in Google settings
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M10 2h4v4M14 2L8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        )}

        {/* Animated step content */}
        <AnimatePresence mode="wait" custom={directionRef.current}>
          {wizardStep === 1 && (
            <motion.div
              key="step1"
              custom={directionRef.current}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col gap-6"
            >
              {/* Step 1: Name your form */}
              <div>
                <h1
                  className="text-2xl font-bold text-[var(--color-text)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Name your form
                </h1>
                <p className="mt-1.5 text-sm text-[var(--color-muted)]">
                  Give your form a memorable name.
                </p>
              </div>

              <section
                className={clsx(
                  'rounded-xl border border-[var(--color-border)]',
                  'bg-[var(--color-surface)] p-6 flex flex-col gap-5',
                )}
              >
                <div className="flex flex-col gap-2">
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
                    autoFocus
                    className={clsx(
                      'w-full px-4 py-3 rounded-lg text-base',
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
                    onKeyDown={(e) => { if (e.key === 'Enter' && canAdvanceStep1) goNext(); }}
                  />
                  {showFormNameError && (
                    <p id="form-name-error" role="alert" className="text-xs text-[var(--color-error)]">
                      {errors.formName}
                    </p>
                  )}
                </div>
              </section>

              {/* Navigation */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setFormNameTouched(true);
                    if (canAdvanceStep1) goNext();
                  }}
                  disabled={!canAdvanceStep1}
                  className={clsx(
                    'flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold',
                    'transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]',
                    'w-full sm:w-auto justify-center',
                    canAdvanceStep1
                      ? 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-md shadow-[var(--color-accent)]/20'
                      : 'bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)] cursor-not-allowed',
                  )}
                >
                  Continue
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}

          {wizardStep === 2 && (
            <motion.div
              key="step2"
              custom={directionRef.current}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col gap-6"
            >
              {/* Step 2: Build your fields */}
              <div>
                <h1
                  className="text-2xl font-bold text-[var(--color-text)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Build your fields
                </h1>
                <p className="mt-1.5 text-sm text-[var(--color-muted)]">
                  Add and arrange the fields your visitors will fill out.
                </p>
              </div>

              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[var(--color-muted)]">
                    Drag rows to reorder. At least one field required.
                  </p>
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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
                        isReplyTo={replyToFieldId === field.id}
                        onSetReplyTo={(id) => setReplyToFieldId(id)}
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
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    <p>No fields yet — click &ldquo;Add field&rdquo; to get started.</p>
                  </div>
                )}
              </section>

              {/* Navigation */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className={clsx(
                    'flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-medium',
                    'border border-[var(--color-border)] text-[var(--color-muted)]',
                    'hover:text-[var(--color-text)] hover:border-[var(--color-text)]',
                    'transition-colors duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
                    'w-full sm:w-auto',
                  )}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (canAdvanceStep2) goNext();
                  }}
                  disabled={!canAdvanceStep2}
                  className={clsx(
                    'flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold',
                    'transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]',
                    'w-full sm:w-auto',
                    canAdvanceStep2
                      ? 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-md shadow-[var(--color-accent)]/20'
                      : 'bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)] cursor-not-allowed',
                  )}
                >
                  Continue
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}

          {wizardStep === 3 && (
            <motion.div
              key="step3"
              custom={directionRef.current}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col gap-6"
            >
              {/* Step 3: Notification settings */}
              <div>
                <h1
                  className="text-2xl font-bold text-[var(--color-text)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Notification settings
                </h1>
                <p className="mt-1.5 text-sm text-[var(--color-muted)]">
                  Configure how you&apos;ll be alerted when someone submits the form.
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

              <section
                className={clsx(
                  'rounded-xl border border-[var(--color-border)]',
                  'bg-[var(--color-surface)] p-6 flex flex-col gap-5',
                )}
              >
                {/* Notify email (To) */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="notify-email"
                    className="text-sm font-medium text-[var(--color-text)]"
                  >
                    Notify email <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <p className="text-xs text-[var(--color-muted)]">
                    Primary recipient for new submission emails.
                  </p>
                  <input
                    id="notify-email"
                    type="email"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="you@example.com"
                    className={clsx(
                      'w-full px-4 py-3 rounded-lg text-sm',
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
                    <p id="notify-email-error" role="alert" className="text-xs text-[var(--color-error)]">
                      {errors.notifyEmail}
                    </p>
                  )}
                </div>

                <div
                  className={clsx(
                    'h-px',
                    'bg-[var(--color-border)]',
                  )}
                  aria-hidden="true"
                />

                {/* Honeypot spam protection */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-[var(--color-text)]">
                      Honeypot spam protection
                    </span>
                    <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                      Adds a hidden field to the embed. Bots that fill it in are silently discarded — real users never see it.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enableHoneypot}
                    onClick={() => setEnableHoneypot((v) => !v)}
                    className={clsx(
                      'shrink-0 relative inline-flex h-5 w-9 items-center rounded-full',
                      'transition-colors duration-200 focus:outline-none focus:ring-2',
                      'focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]',
                      enableHoneypot
                        ? 'bg-[var(--color-accent)]'
                        : 'bg-[var(--color-surface-2)] border border-[var(--color-border)]',
                    )}
                  >
                    <span
                      className={clsx(
                        'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200',
                        enableHoneypot ? 'translate-x-4' : 'translate-x-0.5',
                      )}
                    />
                  </button>
                </div>

                <div
                  className={clsx(
                    'h-px',
                    'bg-[var(--color-border)]',
                  )}
                  aria-hidden="true"
                />

                {/* Additional settings (collapsible) */}
                <div className="flex flex-col gap-0">
                  <button
                    type="button"
                    onClick={() => setAdditionalSettingsOpen((v) => !v)}
                    className={clsx(
                      'flex items-center justify-between w-full',
                      'text-sm font-medium text-[var(--color-muted)]',
                      'hover:text-[var(--color-text)] transition-colors duration-150',
                      'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] rounded',
                    )}
                    aria-expanded={additionalSettingsOpen}
                  >
                    <span>Additional settings</span>
                    <svg
                      width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className={clsx('transition-transform duration-200', additionalSettingsOpen ? 'rotate-180' : '')}
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {additionalSettingsOpen && (
                    <div className="flex flex-col gap-5 mt-5">
                      <div>
                        <p className="text-xs text-[var(--color-muted)]">
                          Press{' '}
                          <kbd className="px-1 py-0.5 rounded text-[10px] bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono">Enter</kbd>{' '}
                          or{' '}
                          <kbd className="px-1 py-0.5 rounded text-[10px] bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono">,</kbd>{' '}
                          to add each email in CC / BCC.
                        </p>
                      </div>

                      {/* CC */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="cc-input" className="text-sm font-medium text-[var(--color-text)]">
                          CC
                        </label>
                        <p className="text-xs text-[var(--color-muted)]">
                          These addresses will be CC&apos;d on every submission email.
                        </p>
                        <EmailTagInput
                          id="cc-input"
                          emails={ccEmails}
                          inputValue={ccInput}
                          placeholder="cc@example.com"
                          onInputChange={setCcInput}
                          onAdd={(e) => setCcEmails((prev) => [...prev, e])}
                          onRemove={(e) => setCcEmails((prev) => prev.filter((x) => x !== e))}
                        />
                      </div>

                      {/* BCC */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="bcc-input" className="text-sm font-medium text-[var(--color-text)]">
                          BCC
                        </label>
                        <p className="text-xs text-[var(--color-muted)]">
                          These addresses will be BCC&apos;d — hidden from other recipients.
                        </p>
                        <EmailTagInput
                          id="bcc-input"
                          emails={bccEmails}
                          inputValue={bccInput}
                          placeholder="bcc@example.com"
                          onInputChange={setBccInput}
                          onAdd={(e) => setBccEmails((prev) => [...prev, e])}
                          onRemove={(e) => setBccEmails((prev) => prev.filter((x) => x !== e))}
                        />
                      </div>

                      {/* Email subject */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="email-subject" className="text-sm font-medium text-[var(--color-text)]">
                          Email subject
                        </label>
                        <input
                          id="email-subject"
                          type="text"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder={`New submission: ${formName || 'your form name'}`}
                          className={clsx(
                            'w-full px-4 py-3 rounded-lg text-sm',
                            'bg-[var(--color-surface-2)] text-[var(--color-text)]',
                            'border border-[var(--color-border)] transition-colors duration-150',
                            'placeholder:text-[var(--color-muted)]',
                            'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
                          )}
                        />
                        <p className="text-xs text-[var(--color-muted)]">
                          Leave blank to use the default: &ldquo;New submission: {formName || 'form name'}&rdquo;
                        </p>
                      </div>

                      {/* Sender name */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="sender-name" className="text-sm font-medium text-[var(--color-text)]">
                          Sender name
                        </label>
                        <input
                          id="sender-name"
                          type="text"
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          placeholder="e.g. Acme Contact Form"
                          className={clsx(
                            'w-full px-4 py-3 rounded-lg text-sm',
                            'bg-[var(--color-surface-2)] text-[var(--color-text)]',
                            'border border-[var(--color-border)] transition-colors duration-150',
                            'placeholder:text-[var(--color-muted)]',
                            'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
                          )}
                        />
                        <p className="text-xs text-[var(--color-muted)]">
                          The display name shown in the &ldquo;From&rdquo; field of the email.
                        </p>
                      </div>

                      {/* Reply-to info */}
                      <div className={clsx(
                        'flex items-start gap-3 px-3.5 py-3 rounded-lg',
                        'bg-[var(--color-surface-2)] border border-[var(--color-border)]',
                      )}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-[var(--color-muted)]" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="16" x2="12" y2="12" />
                          <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                          <strong className="text-[var(--color-text)] font-medium">Reply-to:</strong> on any{' '}
                          <span className="text-[var(--color-text)]">Email</span>-type field in the Fields step, click{' '}
                          <span className="text-[var(--color-accent)]">Use as reply-to</span> to route notification replies to the address your visitor submits.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Create form button */}
              <div className="flex flex-col gap-3">
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
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Generating…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                      Create form
                    </span>
                  )}
                </button>

                {!formIsValid && (
                  <p className="text-xs text-center text-[var(--color-muted)]">
                    Fill in all required fields and fix any errors to continue.
                  </p>
                )}
              </div>

              {/* Navigation back */}
              <div className="flex">
                <button
                  type="button"
                  onClick={goBack}
                  className={clsx(
                    'flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium',
                    'border border-[var(--color-border)] text-[var(--color-muted)]',
                    'hover:text-[var(--color-text)] hover:border-[var(--color-text)]',
                    'transition-colors duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
                    'w-full sm:w-auto justify-center',
                  )}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back to fields
                </button>
              </div>

              {/* Bottom spacing */}
              <div className="pb-8" />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
}

export default FormBuilderScreen;
