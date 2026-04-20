'use client';

import { useState } from 'react';
import type { FormField, SiteTabFormConfig } from '@/types';

// ─── Default configs ──────────────────────────────────────────────────────────

export const DEFAULT_FORM_CONFIG: SiteTabFormConfig = {
  fields: [
    { id: 'f-1', label: 'Name',    type: 'text',     required: true  },
    { id: 'f-2', label: 'Email',   type: 'email',    required: true  },
    { id: 'f-3', label: 'Phone',   type: 'tel',      required: false },
    { id: 'f-4', label: 'Message', type: 'textarea', required: true  },
  ],
};

export const DEFAULT_NEWSLETTER_CONFIG: SiteTabFormConfig = {
  fields: [
    { id: 'f-1', label: 'Email', type: 'email', required: true },
  ],
};

// ─── Field types ──────────────────────────────────────────────────────────────

const FIELD_TYPES: Array<{ value: FormField['type']; label: string }> = [
  { value: 'text',     label: 'Text' },
  { value: 'email',    label: 'Email' },
  { value: 'tel',      label: 'Phone' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select',   label: 'Select' },
];

function genId() {
  return 'f-' + Math.random().toString(36).slice(2, 8);
}

// ─── Single field row ─────────────────────────────────────────────────────────

function FieldRow({
  field,
  onUpdate,
  onRemove,
  canRemove,
}: {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div
      className="flex items-start gap-2 p-2 rounded-lg"
      style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
    >
      {/* Label */}
      <input
        type="text"
        value={field.label}
        onChange={(e) => onUpdate({ label: e.target.value })}
        placeholder="Field label"
        className="flex-1 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
        style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
      />

      {/* Type */}
      <select
        value={field.type}
        onChange={(e) => onUpdate({ type: e.target.value as FormField['type'] })}
        className="rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
        style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
      >
        {FIELD_TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      {/* Required toggle */}
      <button
        type="button"
        onClick={() => onUpdate({ required: !field.required })}
        className="shrink-0 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-colors"
        style={{
          background: field.required ? 'var(--color-accent)' : 'transparent',
          color:      field.required ? '#fff' : 'var(--color-subtle)',
          border:     `1px solid ${field.required ? 'var(--color-accent)' : 'var(--color-border)'}`,
        }}
        title={field.required ? 'Required' : 'Optional'}
      >
        REQ
      </button>

      {/* Remove */}
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 w-6 h-6 flex items-center justify-center rounded transition-colors"
          style={{ color: 'var(--color-subtle)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-error)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-subtle)'; }}
          title="Remove field"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}

      {/* Options (select only) */}
      {field.type === 'select' && (
        <div className="w-full col-span-full mt-1.5 pl-0">
          <input
            type="text"
            value={field.options?.join(', ') ?? ''}
            onChange={(e) => onUpdate({ options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            placeholder="Options: comma, separated"
            className="w-full rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Email settings section ───────────────────────────────────────────────────

function EmailSettings({
  config,
  onChange,
}: {
  config: SiteTabFormConfig;
  onChange: (updates: Partial<SiteTabFormConfig>) => void;
}) {
  const emailFields = config.fields.filter((f) => f.type === 'email');

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
            CC (comma-separated)
          </span>
          <input
            type="text"
            value={config.ccEmails?.join(', ') ?? ''}
            onChange={(e) => onChange({ ccEmails: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            placeholder="cc@example.com"
            className="rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
            BCC (comma-separated)
          </span>
          <input
            type="text"
            value={config.bccEmails?.join(', ') ?? ''}
            onChange={(e) => onChange({ bccEmails: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            placeholder="bcc@example.com"
            className="rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
            Subject template
          </span>
          <input
            type="text"
            value={config.emailSubject ?? ''}
            onChange={(e) => onChange({ emailSubject: e.target.value || undefined })}
            placeholder="New form submission"
            className="rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
            Sender name
          </span>
          <input
            type="text"
            value={config.senderName ?? ''}
            onChange={(e) => onChange({ senderName: e.target.value || undefined })}
            placeholder="Website Notifications"
            className="rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
        </label>
      </div>

      {emailFields.length > 0 && (
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
            Reply-to field
          </span>
          <select
            value={config.replyToField ?? ''}
            onChange={(e) => onChange({ replyToField: e.target.value || undefined })}
            className="rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
          >
            <option value="">None</option>
            {emailFields.map((f) => (
              <option key={f.id} value={f.label.toLowerCase().replace(/[^a-z0-9]+/g, '_')}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={config.enableHoneypot ?? false}
          onChange={(e) => onChange({ enableHoneypot: e.target.checked })}
          className="w-4 h-4 rounded accent-[var(--color-accent)]"
        />
        <span className="text-xs" style={{ color: 'var(--color-text)' }}>
          Enable spam protection (honeypot)
        </span>
      </label>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  config: SiteTabFormConfig;
  onChange: (config: SiteTabFormConfig) => void;
}

export default function FormFieldEditor({ config, onChange }: Props) {
  const [showEmail, setShowEmail] = useState(false);

  function updateField(id: string, updates: Partial<FormField>) {
    onChange({ ...config, fields: config.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)) });
  }

  function removeField(id: string) {
    onChange({ ...config, fields: config.fields.filter((f) => f.id !== id) });
  }

  function addField() {
    onChange({
      ...config,
      fields: [...config.fields, { id: genId(), label: '', type: 'text', required: false }],
    });
  }

  function handleEmailChange(updates: Partial<SiteTabFormConfig>) {
    onChange({ ...config, ...updates });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Field list */}
      <div className="flex flex-col gap-2">
        {config.fields.map((field) => (
          <FieldRow
            key={field.id}
            field={field}
            onUpdate={(u) => updateField(field.id, u)}
            onRemove={() => removeField(field.id)}
            canRemove={config.fields.length > 1}
          />
        ))}
        <button
          type="button"
          onClick={addField}
          className="self-start text-xs font-medium flex items-center gap-1 transition-colors"
          style={{ color: 'var(--color-accent)' }}
        >
          + Add field
        </button>
      </div>

      {/* Email settings toggle */}
      <button
        type="button"
        onClick={() => setShowEmail((v) => !v)}
        className="self-start flex items-center gap-1 text-xs font-medium transition-colors"
        style={{ color: showEmail ? 'var(--color-text)' : 'var(--color-muted)' }}
      >
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transform: showEmail ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
        >
          <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Email settings
      </button>

      {showEmail && (
        <div
          className="rounded-lg p-3"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
        >
          <EmailSettings config={config} onChange={handleEmailChange} />
        </div>
      )}
    </div>
  );
}
