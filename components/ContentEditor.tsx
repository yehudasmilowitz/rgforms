'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ContentModuleSummary, ContentField, ContentFieldType } from '@/types';
import {
  loadSheetData,
  appendRecord,
  updateRecord,
  deleteRecord,
  type SheetRecord,
  type SheetData,
} from '@/lib/contentEditor';

// ─── Icons ────────────────────────────────────────────────────────────────────

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
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

function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M9 2l2 2-7 7H2v-2L9 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
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

// ─── Field input renderer ─────────────────────────────────────────────────────

interface FieldInputProps {
  field: ContentField;
  value: unknown;
  onChange: (val: unknown) => void;
}

function FieldInput({ field, value, onChange }: FieldInputProps) {
  const inputStyle = {
    background: 'var(--color-surface-2)',
    borderColor: 'var(--color-border)',
    color: 'var(--color-text)',
  };
  const cls = 'w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]';

  switch (field.type as ContentFieldType) {
    case 'boolean':
      return (
        <button
          type="button"
          role="switch"
          aria-checked={!!value}
          onClick={() => onChange(!value)}
          className="relative w-9 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{ background: value ? 'var(--color-accent)' : 'var(--color-border)' }}
        >
          <span
            className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform"
            style={{ transform: value ? 'translateX(16px)' : 'translateX(0)' }}
          />
        </button>
      );
    case 'number':
      return (
        <input
          type="number"
          className={cls}
          style={inputStyle}
          value={value === null || value === undefined ? '' : String(value)}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        />
      );
    case 'date':
      return (
        <input
          type="date"
          className={cls}
          style={inputStyle}
          value={value ? String(value).slice(0, 10) : ''}
          onChange={(e) => onChange(e.target.value || null)}
        />
      );
    case 'tags':
      return (
        <div className="flex flex-col gap-1">
          <input
            type="text"
            className={cls}
            style={inputStyle}
            placeholder="tag1, tag2, tag3"
            value={Array.isArray(value) ? (value as string[]).join(', ') : String(value ?? '')}
            onChange={(e) => {
              const tags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
              onChange(tags.length ? tags : null);
            }}
          />
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Comma-separated</p>
        </div>
      );
    case 'markdown':
      return (
        <textarea
          className={cls}
          style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
          value={value === null || value === undefined ? '' : String(value)}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder="Markdown content…"
        />
      );
    default: // text, url, image_url
      return (
        <input
          type="text"
          className={cls}
          style={inputStyle}
          value={value === null || value === undefined ? '' : String(value)}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder={field.type === 'url' || field.type === 'image_url' ? 'https://' : ''}
        />
      );
  }
}

// ─── Record form modal ────────────────────────────────────────────────────────

interface RecordFormModalProps {
  module: ContentModuleSummary;
  record: SheetRecord | null;   // null = new record
  onSave: (data: SheetRecord) => Promise<void>;
  onClose: () => void;
}

function RecordFormModal({ module, record, onSave, onClose }: RecordFormModalProps) {
  const fields: ContentField[] = module.fields ?? [];

  const buildInitial = useCallback((): SheetRecord => {
    const init: SheetRecord = {};
    fields.forEach((f) => {
      init[f.key] = record ? (record[f.key] ?? null) : null;
    });
    if (module.hasSlug)      init['slug']      = record?.['slug']      ?? null;
    if (module.hasPublished) init['published'] = record?.['published'] ?? false;
    return init;
  }, [record, fields, module.hasSlug, module.hasPublished]);

  const [formData, setFormData] = useState<SheetRecord>(buildInitial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField(key: string, val: unknown) {
    setFormData((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(formData);
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  const isNew = !record;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="w-full max-w-lg rounded-2xl border flex flex-col max-h-[85vh]"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between gap-3 px-6 py-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            {isNew ? 'New record' : 'Edit record'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ color: 'var(--color-muted)' }}
          >
            <XIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-0 overflow-y-auto flex-1">
          <div className="flex flex-col gap-5 px-6 py-5">
            {error && (
              <div
                className="rounded-lg px-3 py-2 text-xs"
                style={{ background: 'oklch(0.62 0.22 25 / 0.08)', borderColor: 'oklch(0.62 0.22 25 / 0.30)', color: 'oklch(0.72 0.16 25)', border: '1px solid' }}
              >
                {error}
              </div>
            )}

            {/* User-defined fields */}
            {fields.map((field) => (
              <div key={field.id} className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                  {field.label}
                  {field.required && <span style={{ color: 'var(--color-error)' }}> *</span>}
                  <span className="ml-1.5 font-normal font-mono" style={{ color: 'var(--color-muted)' }}>
                    ({field.type})
                  </span>
                </label>
                <FieldInput
                  field={field}
                  value={formData[field.key]}
                  onChange={(v) => setField(field.key, v)}
                />
              </div>
            ))}

            {/* Slug field */}
            {module.hasSlug && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                  slug
                  <span className="ml-1.5 font-normal font-mono" style={{ color: 'var(--color-muted)' }}>(text)</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  value={formData['slug'] === null || formData['slug'] === undefined ? '' : String(formData['slug'])}
                  onChange={(e) => setField('slug', e.target.value || null)}
                  placeholder="my-record-slug"
                />
              </div>
            )}

            {/* Published toggle */}
            {module.hasPublished && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!formData['published']}
                  onClick={() => setField('published', !formData['published'])}
                  className="relative w-9 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ background: formData['published'] ? 'var(--color-accent)' : 'var(--color-border)' }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform"
                    style={{ transform: formData['published'] ? 'translateX(16px)' : 'translateX(0)' }}
                  />
                </button>
                <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                  Published
                </span>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  Only published records are returned by the read API
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex gap-3 px-6 py-4 border-t"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
              style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-[2] py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ background: 'var(--color-accent)', color: '#fff' }}
            >
              {saving ? (isNew ? 'Creating…' : 'Saving…') : (isNew ? 'Create record' : 'Save changes')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Delete confirm dialog ────────────────────────────────────────────────────

function DeleteConfirmDialog({
  onConfirm,
  onCancel,
  deleting,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <motion.div
        className="w-full max-w-sm rounded-2xl border p-6 flex flex-col gap-5"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Delete this record?</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            This will permanently remove the row from the Sheet. This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-400"
            style={{ background: '#ef4444', color: '#fff' }}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Record card ──────────────────────────────────────────────────────────────

function RecordCard({
  record,
  fields,
  hasSlug,
  hasPublished,
  onEdit,
  onDelete,
  deleting,
}: {
  record: SheetRecord;
  fields: ContentField[];
  hasSlug: boolean;
  hasPublished: boolean;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const previewFields = fields.slice(0, 3);

  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-3 transition-opacity"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        opacity: deleting ? 0.4 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          {/* Primary field value as title */}
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
            {previewFields[0]
              ? (Array.isArray(record[previewFields[0].key])
                  ? (record[previewFields[0].key] as string[]).join(', ')
                  : String(record[previewFields[0].key] ?? '—'))
              : String(record['_id'] ?? '—')}
          </p>
          <div className="flex flex-wrap gap-2">
            {hasPublished && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={record['published']
                  ? { background: 'oklch(0.72 0.18 145 / 0.12)', color: 'oklch(0.60 0.18 145)', border: '1px solid oklch(0.72 0.18 145 / 0.25)' }
                  : { background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}
              >
                {record['published'] ? 'Published' : 'Draft'}
              </span>
            )}
            {hasSlug && !!record['slug'] && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                /{String(record['slug'])}
              </span>
            )}
            {previewFields.slice(1).map((f) => {
              const val = record[f.key];
              if (val === null || val === undefined || val === '') return null;
              const display = Array.isArray(val) ? (val as string[]).join(', ') : String(val);
              return (
                <span key={f.key} className="text-[10px] px-1.5 py-0.5 rounded truncate max-w-[120px]" style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                  <span style={{ color: 'var(--color-accent)' }}>{f.key}:</span> {display}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            disabled={deleting}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; }}
          >
            <EditIcon />
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="p-1.5 rounded-lg border disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-400"
            style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.5)'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            aria-label="Delete record"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {!!record['_id'] && (
        <p className="text-[10px] font-mono truncate" style={{ color: 'var(--color-subtle, var(--color-muted))' }}>
          id: {String(record['_id'])}
        </p>
      )}
    </div>
  );
}

// ─── Main ContentEditor component ─────────────────────────────────────────────

interface ContentEditorProps {
  module: ContentModuleSummary;
  accessToken: string;
  onClose: () => void;
}

export default function ContentEditor({ module, accessToken, onClose }: ContentEditorProps) {
  const fields: ContentField[] = module.fields ?? [];

  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editingRecord, setEditingRecord] = useState<{ record: SheetRecord | null; rowIndex: number } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ record: SheetRecord; rowIndex: number } | null>(null);
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await loadSheetData(accessToken, module.sheetId, fields, module.hasSlug, module.hasPublished);
      setSheetData(data);
    } catch (err) {
      setLoadError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [accessToken, module.sheetId, module.hasSlug, module.hasPublished, fields]);

  useEffect(() => { load(); }, [load]);

  async function handleSave(data: SheetRecord) {
    if (!sheetData) return;
    if (editingRecord && editingRecord.rowIndex >= 0) {
      // Update
      const updated = await updateRecord(
        accessToken,
        module.sheetId,
        sheetData.headers,
        sheetData.keys,
        fields,
        module.hasSlug,
        module.hasPublished,
        editingRecord.rowIndex,
        editingRecord.record!,
        data,
      );
      setSheetData((prev) => {
        if (!prev) return prev;
        const rows = [...prev.rows];
        rows[editingRecord.rowIndex] = updated;
        return { ...prev, rows };
      });
    } else {
      // Create
      const created = await appendRecord(
        accessToken,
        module.sheetId,
        sheetData.headers,
        sheetData.keys,
        fields,
        module.hasSlug,
        module.hasPublished,
        data,
      );
      setSheetData((prev) => prev ? { ...prev, rows: [...prev.rows, created] } : prev);
    }
    setEditingRecord(null);
  }

  async function handleConfirmDelete() {
    if (!pendingDelete || !sheetData) return;
    const { rowIndex } = pendingDelete;
    setPendingDelete(null);
    setDeletingIdx(rowIndex);
    try {
      await deleteRecord(accessToken, module.sheetId, sheetData.numericSheetId, rowIndex);
      setSheetData((prev) => {
        if (!prev) return prev;
        return { ...prev, rows: prev.rows.filter((_, i) => i !== rowIndex) };
      });
    } catch (err) {
      setLoadError((err as Error).message);
    } finally {
      setDeletingIdx(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between gap-4 px-5 py-4 border-b shrink-0"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
            aria-label="Close editor"
          >
            <XIcon />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
              {module.moduleName}
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              {loading ? 'Loading…' : sheetData ? `${sheetData.rows.length} record${sheetData.rows.length !== 1 ? 's' : ''}` : ''}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setEditingRecord({ record: null, rowIndex: -1 })}
          disabled={loading || !!loadError}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{ background: 'var(--color-accent)', color: '#fff' }}
        >
          <PlusIcon />
          New record
        </button>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-3">

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div
                className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
              />
            </div>
          )}

          {loadError && (
            <div
              className="rounded-xl border px-4 py-3 text-sm flex items-center justify-between gap-3"
              style={{ background: 'oklch(0.62 0.22 25 / 0.08)', borderColor: 'oklch(0.62 0.22 25 / 0.30)', color: 'oklch(0.72 0.16 25)' }}
            >
              <span>{loadError}</span>
              <button
                type="button"
                onClick={load}
                className="text-xs underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !loadError && sheetData && sheetData.rows.length === 0 && (
            <div
              className="rounded-xl border px-6 py-12 flex flex-col items-center gap-3 text-center"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>No records yet</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Create your first record, or add rows directly in the Google Sheet.
              </p>
              <button
                type="button"
                onClick={() => setEditingRecord({ record: null, rowIndex: -1 })}
                className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                <PlusIcon />
                New record
              </button>
            </div>
          )}

          <AnimatePresence initial={false}>
            {sheetData?.rows.map((record, idx) => (
              <motion.div
                key={String(record['_id'] ?? idx)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <RecordCard
                  record={record}
                  fields={fields}
                  hasSlug={module.hasSlug}
                  hasPublished={module.hasPublished}
                  onEdit={() => setEditingRecord({ record, rowIndex: idx })}
                  onDelete={() => setPendingDelete({ record, rowIndex: idx })}
                  deleting={deletingIdx === idx}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      {editingRecord !== null && (
        <RecordFormModal
          module={module}
          record={editingRecord.record}
          onSave={handleSave}
          onClose={() => setEditingRecord(null)}
        />
      )}

      {pendingDelete && (
        <DeleteConfirmDialog
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
          deleting={deletingIdx !== null}
        />
      )}
    </div>
  );
}
