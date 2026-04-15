'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SiteConfigModuleSummary } from '@/types';
import {
  listConfigRows,
  updateConfigValue,
  appendConfigRow,
  deleteConfigRow,
  type ConfigRow,
} from '@/lib/siteConfigManager';

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

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M2 6.5l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 3v1.5M10 15.5V17M3 10h1.5M15.5 10H17M4.93 4.93l1.06 1.06M14 14l1.06 1.06M4.93 15.07l1.06-1.06M14 6l1.06-1.06" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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

// ─── Config row editor ────────────────────────────────────────────────────────

interface ConfigRowEditorProps {
  row: ConfigRow;
  onSave: (rowIndex: number, value: string) => Promise<void>;
  onDelete: (row: ConfigRow) => void;
  saving: boolean;
  deleting: boolean;
}

function ConfigRowEditor({ row, onSave, onDelete, saving, deleting }: ConfigRowEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(row.value);

  // Keep draft in sync if row updates externally
  useEffect(() => { if (!editing) setDraft(row.value); }, [row.value, editing]);

  async function handleSave() {
    if (draft === row.value) { setEditing(false); return; }
    await onSave(row.rowIndex, draft);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); }
    if (e.key === 'Escape') { setDraft(row.value); setEditing(false); }
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--color-bg)',
    border: '1px solid var(--color-accent)',
    borderRadius: '0.5rem',
    padding: '0.375rem 0.5rem',
    fontSize: '0.8125rem',
    color: 'var(--color-text)',
    outline: 'none',
    width: '100%',
    fontFamily: row.value.startsWith('http') ? 'var(--font-mono)' : 'inherit',
    resize: 'vertical' as const,
  };

  const isLong = row.value.length > 80;

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-xl border transition-all"
      style={{
        background: editing ? 'var(--color-surface)' : 'var(--color-surface)',
        borderColor: editing ? 'var(--color-accent-border)' : 'var(--color-border)',
        opacity: deleting ? 0.5 : 1,
      }}
    >
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <code
            className="text-xs font-mono px-1.5 py-0.5 rounded shrink-0"
            style={{ background: 'var(--color-surface-2)', color: 'var(--color-accent)' }}
          >
            {row.key}
          </code>
          {row.description && (
            <span className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>
              {row.description}
            </span>
          )}
        </div>

        {editing ? (
          isLong ? (
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          ) : (
            <input
              autoFocus
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              style={inputStyle}
            />
          )
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-left text-sm px-2 py-1 rounded-lg transition-colors focus:outline-none"
            style={{ color: row.value ? 'var(--color-text)' : 'var(--color-muted)', fontStyle: row.value ? 'normal' : 'italic' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            {row.value || 'Click to set a value…'}
          </button>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-1 mt-1">
        {editing ? (
          <>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ background: 'oklch(0.55 0.18 145 / 0.15)', color: 'oklch(0.65 0.18 145)' }}
              aria-label="Save"
            >
              {saving ? '…' : <CheckIcon />}
            </button>
            <button
              type="button"
              onClick={() => { setDraft(row.value); setEditing(false); }}
              className="p-1.5 rounded-lg transition-colors focus:outline-none"
              style={{ color: 'var(--color-muted)' }}
              aria-label="Cancel"
            >
              <XIcon />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onDelete(row)}
            disabled={deleting}
            className="p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            style={{ color: 'var(--color-muted)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            aria-label={`Delete ${row.key}`}
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Add row form ─────────────────────────────────────────────────────────────

interface AddRowFormProps {
  onAdd: (key: string, value: string, description: string) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

function AddRowForm({ onAdd, onCancel, saving }: AddRowFormProps) {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;
    await onAdd(key.trim().toLowerCase().replace(/\s+/g, '_'), value, description);
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

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)';
  };
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label style={labelStyle}>Key <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="hero_title"
            required
            style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
            onFocus={focusBorder}
            onBlur={blurBorder}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label style={labelStyle}>Value</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Welcome to my site"
            style={inputStyle}
            onFocus={focusBorder}
            onBlur={blurBorder}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label style={labelStyle}>Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description of what this key controls"
          style={inputStyle}
          onFocus={focusBorder}
          onBlur={blurBorder}
        />
      </div>
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving || !key.trim()}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{
            background: 'var(--color-accent)',
            color: '#fff',
            opacity: (saving || !key.trim()) ? 0.5 : 1,
            cursor: (saving || !key.trim()) ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : 'Add key'}
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

interface SiteConfigManagerProps {
  module: Pick<SiteConfigModuleSummary, 'sheetId' | 'sheetUrl' | 'moduleName'>;
  accessToken: string;
  onClose: () => void;
}

export default function SiteConfigManager({ module, accessToken, onClose }: SiteConfigManagerProps) {
  const [rows, setRows] = useState<ConfigRow[]>([]);
  const [numericSheetId, setNumericSheetId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingRow, setSavingRow] = useState<number | null>(null);
  const [deletingRows, setDeletingRows] = useState<Set<number>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingSaving, setAddingSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const { rows: r, numericSheetId: gid } = await listConfigRows(accessToken, module.sheetId);
      setRows(r);
      setNumericSheetId(gid);
      setError(null);
    } catch {
      setError('Could not load config. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, module.sheetId]);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSaveValue(rowIndex: number, value: string) {
    setSavingRow(rowIndex);
    try {
      await updateConfigValue(accessToken, module.sheetId, rowIndex, value);
      setRows((prev) => prev.map((r) => r.rowIndex === rowIndex ? { ...r, value } : r));
      setToast('Saved');
    } catch {
      setToast('Failed to save');
    } finally {
      setSavingRow(null);
    }
  }

  async function handleDelete(row: ConfigRow) {
    setDeletingRows((prev) => new Set(prev).add(row.rowIndex));
    try {
      await deleteConfigRow(accessToken, module.sheetId, numericSheetId, row.rowIndex);
      await reload();
      setToast('Key deleted');
    } catch {
      setToast('Failed to delete');
      setDeletingRows((prev) => { const next = new Set(prev); next.delete(row.rowIndex); return next; });
    }
  }

  async function handleAdd(key: string, value: string, description: string) {
    setAddingSaving(true);
    try {
      await appendConfigRow(accessToken, module.sheetId, key, value, description);
      await reload();
      setShowAddForm(false);
      setToast('Key added');
    } catch {
      setToast('Failed to add key');
    } finally {
      setAddingSaving(false);
    }
  }

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
                style={{ background: 'oklch(0.65 0.22 290 / 0.12)', border: '1px solid oklch(0.65 0.22 290 / 0.25)', color: 'oklch(0.72 0.18 290)' }}
              >
                <SettingsIcon />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                  {module.moduleName}
                </h2>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  {rows.length} key{rows.length !== 1 ? 's' : ''} · click any value to edit
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
                  Add key
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

            {/* Add form */}
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
                    <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-accent)' }}>New key</p>
                    <AddRowForm
                      onAdd={handleAdd}
                      onCancel={() => setShowAddForm(false)}
                      saving={addingSaving}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Row list */}
            {loading ? (
              <div className="flex flex-col gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-xl border p-6 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <p className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>
                <button onClick={() => { setLoading(true); reload(); }} className="mt-3 text-xs underline" style={{ color: 'var(--color-muted)' }}>Try again</button>
              </div>
            ) : rows.length === 0 && !showAddForm ? (
              <div className="rounded-xl border p-10 flex flex-col items-center gap-3 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'oklch(0.65 0.22 290 / 0.10)', color: 'oklch(0.72 0.18 290)' }}>
                  <SettingsIcon />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>No config keys yet</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Add your first key above or edit the sheet directly.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {rows.map((row) => (
                  <ConfigRowEditor
                    key={row.key}
                    row={row}
                    onSave={handleSaveValue}
                    onDelete={handleDelete}
                    saving={savingRow === row.rowIndex}
                    deleting={deletingRows.has(row.rowIndex)}
                  />
                ))}
              </div>
            )}

            {/* Footer */}
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
                Open Config Sheet for full editing →
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
