'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '@/context/AppContext';
import { provisionContentModule, AppsScriptApiDisabledError } from '@/lib/contentProvision';
import ProvisioningSteps from '@/components/ProvisioningSteps';
import type { ContentField, ContentFieldType } from '@/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function labelToKey(label: string): string {
  return label.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

function generateId() {
  return `cf-${Math.random().toString(36).slice(2, 9)}`;
}

function generateWriteToken(): string {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
}

const FIELD_TYPE_OPTIONS: { value: ContentFieldType; label: string; hint: string }[] = [
  { value: 'text',      label: 'Text',      hint: 'Short string'       },
  { value: 'markdown',  label: 'Markdown',  hint: 'Long / rich text'   },
  { value: 'number',    label: 'Number',    hint: 'Integer or decimal'  },
  { value: 'date',      label: 'Date',      hint: 'ISO date string'    },
  { value: 'boolean',   label: 'Boolean',   hint: 'TRUE / FALSE'       },
  { value: 'tags',      label: 'Tags',      hint: 'Comma-separated list'},
  { value: 'image_url', label: 'Image URL', hint: 'URL to an image'    },
  { value: 'url',       label: 'URL',       hint: 'Any web URL'        },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2">
      {([1, 2] as const).map((n) => (
        <div key={n} className="flex items-center gap-2">
          {n > 1 && (
            <div
              className="h-px w-8"
              style={{ background: step >= n ? 'var(--color-accent)' : 'var(--color-border)' }}
            />
          )}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
            style={{
              background: step === n ? 'var(--color-accent)' : step > n ? 'var(--color-accent-subtle)' : 'var(--color-surface-2)',
              border: `1px solid ${step >= n ? 'var(--color-accent)' : 'var(--color-border)'}`,
              color: step === n ? '#fff' : step > n ? 'var(--color-accent)' : 'var(--color-muted)',
            }}
          >
            {step > n ? '✓' : n}
          </div>
        </div>
      ))}
    </div>
  );
}

interface FieldRowProps {
  field: ContentField;
  index: number;
  total: number;
  onChange: (id: string, patch: Partial<ContentField>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  dragHandleProps: React.HTMLAttributes<HTMLDivElement>;
}

function FieldRow({ field, index, total, onChange, onDelete, onMove, dragHandleProps }: FieldRowProps) {
  const [labelError, setLabelError] = useState('');

  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-3"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="mt-1 cursor-grab active:cursor-grabbing shrink-0"
          style={{ color: 'var(--color-border)', touchAction: 'none' }}
          aria-label="Drag to reorder"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
            <circle cx="4" cy="3" r="1.2"/><circle cx="10" cy="3" r="1.2"/>
            <circle cx="4" cy="7" r="1.2"/><circle cx="10" cy="7" r="1.2"/>
            <circle cx="4" cy="11" r="1.2"/><circle cx="10" cy="11" r="1.2"/>
          </svg>
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={field.label}
            placeholder="Field label"
            onChange={(e) => {
              onChange(field.id, { label: e.target.value, key: labelToKey(e.target.value) });
              if (labelError) setLabelError('');
            }}
            onBlur={() => {
              if (!field.label.trim()) setLabelError('Label is required');
            }}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{
              background: 'var(--color-surface-2)',
              borderColor: labelError ? 'var(--color-error)' : 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
          {labelError && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{labelError}</p>
          )}
          {field.key && (
            <p className="text-xs mt-1 font-mono" style={{ color: 'var(--color-muted)' }}>
              key: <span style={{ color: 'var(--color-accent)' }}>{field.key}</span>
            </p>
          )}
        </div>

        {/* Type */}
        <select
          value={field.type}
          onChange={(e) => onChange(field.id, { type: e.target.value as ContentFieldType })}
          className="shrink-0 px-2 py-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{
            background: 'var(--color-surface-2)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
        >
          {FIELD_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onMove(field.id, -1)}
            disabled={index === 0}
            className="p-1.5 rounded-lg border disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
            aria-label="Move up"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
              <path d="M5 2L1 7h8L5 2z"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onMove(field.id, 1)}
            disabled={index === total - 1}
            className="p-1.5 rounded-lg border disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
            aria-label="Move down"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
              <path d="M5 8L1 3h8L5 8z"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDelete(field.id)}
            disabled={total <= 1}
            className="p-1.5 rounded-lg border disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-red-400"
            style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
            onMouseEnter={(e) => {
              if (total > 1) {
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
            aria-label={`Delete ${field.label || 'field'}`}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M1 2.5h8M3.5 2.5V2a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v.5M4 4.5v3M6 4.5v3M2 2.5l.5 5a.5.5 0 00.5.5h4a.5.5 0 00.5-.5l.5-5"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Required toggle */}
      <div className="flex items-center gap-2 pl-5">
        <button
          type="button"
          role="switch"
          aria-checked={field.required}
          onClick={() => onChange(field.id, { required: !field.required })}
          className="relative w-8 h-4 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{ background: field.required ? 'var(--color-accent)' : 'var(--color-border)' }}
        >
          <span
            className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform"
            style={{ transform: field.required ? 'translateX(16px)' : 'translateX(0)' }}
          />
        </button>
        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Required</span>
        <span className="text-xs ml-2" style={{ color: 'var(--color-subtle)' }}>
          {FIELD_TYPE_OPTIONS.find(o => o.value === field.type)?.hint}
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ContentBuilder() {
  const { state, dispatch } = useApp();
  const { contentModuleConfig: config } = state;
  const accessToken = state.auth.accessToken!;

  const [step, setStep] = useState<1 | 2>(1);
  const [nameError, setNameError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Drag-and-drop state
  const dragIndex = useRef<number | null>(null);

  // ── Step 1 helpers ──────────────────────────────────────────────────────────

  function validateStep1(): boolean {
    if (!config.name.trim()) { setNameError('Module name is required'); return false; }
    setNameError('');
    return true;
  }

  // ── Step 2 helpers ──────────────────────────────────────────────────────────

  function updateField(id: string, patch: Partial<ContentField>) {
    dispatch({
      type: 'SET_CONTENT_CONFIG',
      payload: {
        fields: config.fields.map((f) => f.id === id ? { ...f, ...patch } : f),
      },
    });
  }

  function deleteField(id: string) {
    dispatch({
      type: 'SET_CONTENT_CONFIG',
      payload: { fields: config.fields.filter((f) => f.id !== id) },
    });
  }

  function moveField(id: string, dir: -1 | 1) {
    const idx = config.fields.findIndex((f) => f.id === id);
    if (idx < 0) return;
    const next = [...config.fields];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    dispatch({ type: 'SET_CONTENT_CONFIG', payload: { fields: next } });
  }

  function addField() {
    const newField: ContentField = {
      id: generateId(),
      label: '',
      key: '',
      type: 'text',
      required: false,
    };
    dispatch({ type: 'SET_CONTENT_CONFIG', payload: { fields: [...config.fields, newField] } });
  }

  function validateStep2(): boolean {
    const errors = config.fields.map((f) => {
      if (!f.label.trim()) return 'Label required';
      return '';
    });

    // Check for duplicates
    const keys = config.fields.map((f) => f.key).filter(Boolean);
    const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
    if (dupes.length > 0) {
      const withDupe = config.fields.map((f) =>
        dupes.includes(f.key) ? 'Duplicate field key' : (errors[config.fields.indexOf(f)] || '')
      );
      setFieldErrors(withDupe);
      return false;
    }

    setFieldErrors(errors);
    return errors.every((e) => !e);
  }

  // ── Drag-and-drop ───────────────────────────────────────────────────────────

  const handleDragStart = useCallback((index: number) => {
    dragIndex.current = index;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === index) return;
    const next = [...config.fields];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(index, 0, moved);
    dragIndex.current = index;
    dispatch({ type: 'SET_CONTENT_CONFIG', payload: { fields: next } });
  }, [config.fields, dispatch]);

  const handleDragEnd = useCallback(() => { dragIndex.current = null; }, []);

  // ── Provisioning ────────────────────────────────────────────────────────────

  async function handleProvision() {
    if (!validateStep2()) return;
    setIsProvisioning(true);
    dispatch({ type: 'START_CONTENT_PROVISIONING' });

    const writeToken = generateWriteToken();

    try {
      const result = await provisionContentModule(
        accessToken,
        config,
        writeToken,
        (stepId, status, error) => {
          dispatch({ type: 'UPDATE_STEP', payload: { id: stepId, status, error } });
        },
      );
      dispatch({ type: 'SET_CONTENT_RESULT', payload: result });
    } catch (err) {
      if (err instanceof AppsScriptApiDisabledError) {
        dispatch({ type: 'CONTENT_PROVISION_ERROR', payload: 'The Apps Script API is not enabled on your Google account. Enable it at script.google.com and try again.' });
      } else {
        dispatch({ type: 'CONTENT_PROVISION_ERROR', payload: (err as Error).message });
      }
    } finally {
      setIsProvisioning(false);
    }
  }

  // ── Render: provisioning progress screen ────────────────────────────────────

  if (state.screen === 'content-provisioning') {
    return <ProvisioningSteps />;
  }

  // ── Render: builder ──────────────────────────────────────────────────────────

  return (
    <motion.main
      className="min-h-screen flex flex-col px-4 py-10"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="w-full max-w-xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                New Content Module
              </h1>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ background: 'oklch(0.78 0.18 75 / 0.12)', color: 'oklch(0.78 0.18 75)', border: '1px solid oklch(0.78 0.18 75 / 0.30)' }}
              >
                Beta
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              Your Google Sheet becomes a live content API — read &amp; write.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET_CONTENT' })}
            className="text-xs shrink-0"
            style={{ color: 'var(--color-muted)' }}
          >
            ← Back
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between">
          <StepIndicator step={step} />
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Step {step} of 2
          </span>
        </div>

        {/* Error banner */}
        {state.contentProvisionError && (
          <div
            className="rounded-xl border px-4 py-3 text-sm"
            style={{ background: 'oklch(0.62 0.22 25 / 0.08)', borderColor: 'oklch(0.62 0.22 25 / 0.30)', color: 'oklch(0.72 0.16 25)' }}
          >
            {state.contentProvisionError}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ── Step 1: Name & options ─────────────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              className="flex flex-col gap-6"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
            >
              {/* Module name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Module name <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={config.name}
                  placeholder="e.g. Blog Posts, Team, Gallery"
                  onChange={(e) => {
                    dispatch({ type: 'SET_CONTENT_CONFIG', payload: { name: e.target.value } });
                    if (nameError) setNameError('');
                  }}
                  onBlur={() => { if (!config.name.trim()) setNameError('Module name is required'); }}
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{
                    background: 'var(--color-surface)',
                    borderColor: nameError ? 'var(--color-error)' : 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
                {nameError && <p className="text-xs" style={{ color: 'var(--color-error)' }}>{nameError}</p>}
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  Used as the spreadsheet title and module identifier.
                </p>
              </div>

              {/* System column options */}
              <div
                className="rounded-xl border p-5 flex flex-col gap-4"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  System columns
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  <code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--color-surface-2)' }}>_id</code>,{' '}
                  <code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--color-surface-2)' }}>_created_at</code>, and{' '}
                  <code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--color-surface-2)' }}>_updated_at</code>{' '}
                  are always added automatically. Enable these to manage visibility and URL-friendly lookups:
                </p>

                {/* Published toggle */}
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={config.hasPublished}
                    onClick={() => dispatch({ type: 'SET_CONTENT_CONFIG', payload: { hasPublished: !config.hasPublished } })}
                    className="relative w-9 h-5 rounded-full transition-colors shrink-0 mt-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    style={{ background: config.hasPublished ? 'var(--color-accent)' : 'var(--color-border)' }}
                  >
                    <span
                      className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform"
                      style={{ transform: config.hasPublished ? 'translateX(16px)' : 'translateX(0)' }}
                    />
                  </button>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                      Published column
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                      Adds a <code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--color-surface-2)' }}>published</code> boolean column.
                      The API only returns rows where <code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--color-surface-2)' }}>published = TRUE</code>.
                      Set it to FALSE to keep a record as a draft.
                    </p>
                  </div>
                </div>

                {/* Slug toggle */}
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={config.hasSlug}
                    onClick={() => dispatch({ type: 'SET_CONTENT_CONFIG', payload: { hasSlug: !config.hasSlug } })}
                    className="relative w-9 h-5 rounded-full transition-colors shrink-0 mt-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    style={{ background: config.hasSlug ? 'var(--color-accent)' : 'var(--color-border)' }}
                  >
                    <span
                      className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform"
                      style={{ transform: config.hasSlug ? 'translateX(16px)' : 'translateX(0)' }}
                    />
                  </button>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                      Slug column
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                      Adds a <code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--color-surface-2)' }}>slug</code> column for URL-friendly lookups.
                      Lets you fetch a single record via <code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--color-surface-2)' }}>?slug=my-record</code>.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { if (validateStep1()) setStep(2); }}
                className="w-full py-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                Next: Define fields →
              </button>
            </motion.div>
          )}

          {/* ── Step 2: Fields ─────────────────────────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              className="flex flex-col gap-5"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    Content fields
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                    Each field becomes a column in your Sheet.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addField}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  + Add field
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {config.fields.map((field, index) => (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <FieldRow
                      field={fieldErrors[index] ? { ...field } : field}
                      index={index}
                      total={config.fields.length}
                      onChange={updateField}
                      onDelete={deleteField}
                      onMove={moveField}
                      dragHandleProps={{}}
                    />
                    {fieldErrors[index] && (
                      <p className="text-xs mt-1 ml-1" style={{ color: 'var(--color-error)' }}>
                        {fieldErrors[index]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Sheet preview */}
              <div
                className="rounded-xl border p-4 flex flex-col gap-2"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <p className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
                  Sheet column preview
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    ...config.fields.map((f) => ({ label: f.label || '…', system: false })),
                    ...(config.hasSlug      ? [{ label: 'slug',      system: true }] : []),
                    ...(config.hasPublished ? [{ label: 'published', system: true }] : []),
                    { label: '_id',         system: true },
                    { label: '_created_at', system: true },
                    { label: '_updated_at', system: true },
                  ].map((col, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded font-mono"
                      style={{
                        background: col.system ? 'var(--color-surface-2)' : 'var(--color-accent-subtle)',
                        color: col.system ? 'var(--color-muted)' : 'var(--color-accent)',
                        border: `1px solid ${col.system ? 'var(--color-border)' : 'var(--color-accent-border)'}`,
                      }}
                    >
                      {col.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleProvision}
                  disabled={isProvisioning}
                  className="flex-[2] py-3 rounded-xl text-sm font-semibold disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ background: 'var(--color-accent)', color: '#fff' }}
                >
                  {isProvisioning ? 'Creating…' : 'Create content module →'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.main>
  );
}
