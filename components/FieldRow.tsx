'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import type { FormField } from '@/types';

export interface FieldRowProps {
  field: FormField;
  index: number;
  total: number;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isReplyTo?: boolean;
  onSetReplyTo?: (id: string | null) => void;
}

export function FieldRow({
  field,
  index,
  total,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  dragHandleProps,
  isReplyTo = false,
  onSetReplyTo,
}: FieldRowProps) {
  const [labelError, setLabelError] = useState(false);

  function handleLabelBlur() {
    setLabelError(field.label.trim() === '');
  }

  function handleLabelChange(val: string) {
    onUpdate(field.id, { label: val });
    if (val.trim() !== '') setLabelError(false);
  }

  function handleTypeChange(val: FormField['type']) {
    const updates: Partial<FormField> = { type: val };
    if (val !== 'select') updates.options = undefined;
    // If this field was the reply-to and type is changing away from email, clear it
    if (val !== 'email' && isReplyTo) onSetReplyTo?.(null);
    onUpdate(field.id, updates);
  }

  function handleOptionsBlur(raw: string) {
    const parsed = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onUpdate(field.id, { options: parsed.length > 0 ? parsed : [] });
  }

  const isFirst = index === 0;
  const isLast = index === total - 1;
  const isOnly = total === 1;

  return (
    <div
      className={clsx(
        'rounded-lg border p-4 gap-4',
        'bg-[var(--color-surface-2)] border-[var(--color-border)]',
        'flex flex-col sm:flex-row sm:items-start',
        'transition-shadow duration-150',
      )}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className={clsx(
          'flex items-center justify-center w-6 h-6 mt-1 shrink-0 cursor-grab',
          'text-[var(--color-muted)] hover:text-[var(--color-text)]',
          'active:cursor-grabbing select-none',
        )}
        aria-label="Drag to reorder"
        title="Drag to reorder"
      >
        {/* 6-dot grid icon */}
        <svg
          width="14"
          height="18"
          viewBox="0 0 14 18"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="3" cy="3" r="1.5" />
          <circle cx="11" cy="3" r="1.5" />
          <circle cx="3" cy="9" r="1.5" />
          <circle cx="11" cy="9" r="1.5" />
          <circle cx="3" cy="15" r="1.5" />
          <circle cx="11" cy="15" r="1.5" />
        </svg>
      </div>

      {/* Main fields */}
      <div className="flex-1 flex flex-col gap-3">
        {/* Label + Type row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Label input */}
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">
              Label
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              onBlur={handleLabelBlur}
              placeholder="Field label"
              className={clsx(
                'w-full px-3 py-2 rounded-md text-sm',
                'bg-[var(--color-surface)] text-[var(--color-text)]',
                'border transition-colors duration-150',
                'placeholder:text-[var(--color-muted)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
                labelError
                  ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]'
                  : 'border-[var(--color-border)]',
              )}
              aria-invalid={labelError}
              aria-describedby={labelError ? `label-error-${field.id}` : undefined}
            />
            {labelError && (
              <span
                id={`label-error-${field.id}`}
                className="text-xs text-[var(--color-error)]"
                role="alert"
              >
                Label cannot be empty
              </span>
            )}
          </div>

          {/* Type select */}
          <div className="flex flex-col gap-1 sm:w-36">
            <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">
              Type
            </label>
            <select
              value={field.type}
              onChange={(e) => handleTypeChange(e.target.value as FormField['type'])}
              className={clsx(
                'w-full px-3 py-2 rounded-md text-sm',
                'bg-[var(--color-surface)] text-[var(--color-text)]',
                'border border-[var(--color-border)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
                'cursor-pointer',
              )}
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="textarea">Textarea</option>
              <option value="tel">Phone</option>
              <option value="select">Select</option>
            </select>
          </div>
        </div>

        {/* Options textarea (only for select type) */}
        {field.type === 'select' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">
              Options{' '}
              <span className="normal-case font-normal">(comma-separated)</span>
            </label>
            <textarea
              defaultValue={(field.options ?? []).join(', ')}
              key={`options-${field.id}`}
              onBlur={(e) => handleOptionsBlur(e.target.value)}
              placeholder="Option 1, Option 2, Option 3"
              rows={2}
              className={clsx(
                'w-full px-3 py-2 rounded-md text-sm resize-none',
                'bg-[var(--color-surface)] text-[var(--color-text)]',
                'border border-[var(--color-border)]',
                'placeholder:text-[var(--color-muted)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
              )}
            />
          </div>
        )}

        {/* Reply-to toggle — only for email-type fields */}
        {field.type === 'email' && onSetReplyTo && (
          <button
            type="button"
            onClick={() => onSetReplyTo(isReplyTo ? null : field.id)}
            className={clsx(
              'self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium',
              'border transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
              isReplyTo
                ? 'bg-[var(--color-accent)]/15 border-[var(--color-accent)]/40 text-[var(--color-accent)]'
                : 'bg-transparent border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]',
            )}
            title={isReplyTo ? 'Remove reply-to on this field' : 'Replies to notification emails will go to the address submitted in this field'}
          >
            {/* Reply arrow icon */}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 17 4 12 9 7" />
              <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
            </svg>
            {isReplyTo ? (
              <>Reply-to: this field <Check size={10} className="inline" aria-hidden="true" /></>
            ) : 'Use as reply-to'}
          </button>
        )}
      </div>

      {/* Right controls */}
      <div className="flex sm:flex-col items-center gap-2 sm:gap-1 mt-1 shrink-0">
        {/* Required toggle */}
        <div className="flex items-center gap-2 sm:flex-row">
          <span className="text-xs text-[var(--color-muted)] hidden sm:inline">Req.</span>
          <button
            type="button"
            role="switch"
            aria-checked={field.required}
            onClick={() => onUpdate(field.id, { required: !field.required })}
            title={field.required ? 'Required (click to make optional)' : 'Optional (click to make required)'}
            className={clsx(
              'relative inline-flex h-5 w-9 items-center rounded-full',
              'transition-colors duration-200 focus:outline-none',
              'focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1 focus:ring-offset-[var(--color-surface-2)]',
              field.required
                ? 'bg-[var(--color-accent)]'
                : 'bg-[var(--color-border)]',
            )}
          >
            <span
              className={clsx(
                'inline-block h-3.5 w-3.5 rounded-full bg-white shadow',
                'transform transition-transform duration-200',
                field.required ? 'translate-x-4.5' : 'translate-x-0.5',
              )}
            />
          </button>
        </div>

        <div className="flex sm:flex-col gap-1">
          {/* Move up */}
          <button
            type="button"
            onClick={() => onMoveUp(field.id)}
            disabled={isFirst}
            title="Move up"
            aria-label="Move field up"
            className={clsx(
              'p-1 rounded transition-colors duration-150',
              'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]',
              'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--color-muted)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>

          {/* Move down */}
          <button
            type="button"
            onClick={() => onMoveDown(field.id)}
            disabled={isLast}
            title="Move down"
            aria-label="Move field down"
            className={clsx(
              'p-1 rounded transition-colors duration-150',
              'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]',
              'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--color-muted)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {/* Remove */}
          <button
            type="button"
            onClick={() => onRemove(field.id)}
            disabled={isOnly}
            title="Remove field"
            aria-label="Remove field"
            className={clsx(
              'p-1 rounded transition-colors duration-150',
              'text-[var(--color-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-surface)]',
              'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--color-muted)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-error)]',
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
