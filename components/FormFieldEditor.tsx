'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import type { FormField, SiteTabFormConfig } from '@/types';
import {
  toFieldKey,
  renderSubject,
  renameSubjectTag,
  validateFormConfig,
  type ConfigIssue,
} from '@/lib/formConfig';

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
  { value: 'textarea', label: 'Long text' },
  { value: 'select',   label: 'Dropdown' },
];

function genId() {
  return 'f-' + Math.random().toString(36).slice(2, 8);
}

const inputCls =
  'rounded-lg px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]';
const inputStyle = { background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' };

// ─── Shared bits ──────────────────────────────────────────────────────────────

/** Accessible on/off switch, matching the toggles on the project screens. */
export function Switch({ on, onChange, label, disabled }: {
  on: boolean; onChange: (v: boolean) => void; label: ReactNode; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className="flex items-center gap-3 self-start min-h-[44px] sm:min-h-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:opacity-50"
    >
      <span
        className="relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors duration-200"
        style={{
          background:  on ? 'var(--color-accent)' : 'var(--color-surface-2)',
          borderColor: on ? 'var(--color-accent)' : 'var(--color-border)',
        }}
      >
        <span
          className="pointer-events-none absolute top-0.5 h-4 w-4 rounded-full shadow transition-transform duration-200"
          style={{ background: '#fff', transform: on ? 'translateX(16px)' : 'translateX(2px)' }}
        />
      </span>
      <span className="text-sm font-semibold text-left" style={{ color: 'var(--color-text)' }}>{label}</span>
    </button>
  );
}

/**
 * Text input for a comma-separated list. Keeps the raw text while typing and
 * parses on blur — parsing on every keystroke ate the comma, so a second item
 * could never be typed ("a@b.com, c@d.com" became "a@b.comc@d.com").
 */
function ListInput({ value, onCommit, ...rest }: {
  value: string[] | undefined;
  onCommit: (list: string[] | undefined) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input
      {...rest}
      value={draft ?? (value ?? []).join(', ')}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (draft === null) return;
        const list = draft.split(',').map((s) => s.trim()).filter(Boolean);
        onCommit(list.length ? list : undefined);
        setDraft(null);
      }}
    />
  );
}

function Section({ title, pill, open, onToggle, children }: {
  title: string; pill?: ReactNode; open: boolean; onToggle: () => void; children: ReactNode;
}) {
  const id = useId();
  return (
    <div className="rounded-lg" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      >
        <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"
            style={{ color: 'var(--color-muted)', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
            <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {title}
        </span>
        {pill}
      </button>
      {open && <div id={id} className="px-3 pb-3 flex flex-col gap-4">{children}</div>}
    </div>
  );
}

function Pill({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0"
      style={{
        background: on ? 'var(--color-success-bg)' : 'var(--color-bg)',
        color:      on ? 'var(--color-success)' : 'var(--color-muted)',
        border:     `1px solid ${on ? 'var(--color-success-border)' : 'var(--color-border)'}`,
      }}>
      {children}
    </span>
  );
}

function Help({ id, children }: { id?: string; children: ReactNode }) {
  return <p id={id} className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{children}</p>;
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return <label htmlFor={htmlFor} className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{children}</label>;
}

// ─── Single field row ─────────────────────────────────────────────────────────

function FieldRow({ field, index, onUpdate, onRemove, canRemove }: {
  field: FormField;
  index: number;
  onUpdate: (updates: Partial<FormField>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const name = field.label.trim() || `field ${index + 1}`;
  return (
    <div
      className="flex flex-wrap items-center gap-2 p-2 rounded-lg"
      style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
    >
      <input
        type="text"
        value={field.label}
        onChange={(e) => onUpdate({ label: e.target.value })}
        placeholder="Field label"
        aria-label={`Field ${index + 1} label`}
        aria-invalid={!field.label.trim()}
        className={`${inputCls} flex-1 min-w-[8rem] py-1.5`}
        style={inputStyle}
      />

      <select
        value={field.type}
        onChange={(e) => onUpdate({ type: e.target.value as FormField['type'] })}
        aria-label={`${name} type`}
        className={`${inputCls} py-1.5`}
        style={inputStyle}
      >
        {FIELD_TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => onUpdate({ required: !field.required })}
        aria-pressed={field.required}
        aria-label={`${name} required`}
        className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        style={{
          background: field.required ? 'var(--color-accent)' : 'transparent',
          color:      field.required ? '#fff' : 'var(--color-muted)',
          border:     `1px solid ${field.required ? 'var(--color-accent)' : 'var(--color-border)'}`,
        }}
      >
        {field.required ? 'Required' : 'Optional'}
      </button>

      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          title="Remove field"
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:text-[var(--color-error)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-error)]"
          style={{ color: 'var(--color-muted)' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}

      {field.type === 'select' && (
        <ListInput
          value={field.options}
          onCommit={(options) => onUpdate({ options })}
          placeholder="Choices, separated by commas"
          aria-label={`${name} choices, separated by commas`}
          className={`${inputCls} w-full py-1.5`}
          style={inputStyle}
        />
      )}
    </div>
  );
}

// ─── Notification email section ───────────────────────────────────────────────

function SubjectEditor({ config, onChange, mergeTags, defaultSubject }: {
  config: SiteTabFormConfig;
  onChange: (updates: Partial<SiteTabFormConfig>) => void;
  mergeTags: boolean;
  defaultSubject: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const id = useId();
  const subject = config.emailSubject ?? '';
  const named = config.fields.filter((f) => f.label.trim());
  const sample = Object.fromEntries(named.map((f) => [toFieldKey(f.label), `[${f.label.trim()}]`]));
  const preview = renderSubject(subject, sample, defaultSubject);

  function insert(key: string) {
    const el = ref.current;
    const tag = `{{${key}}}`;
    const start = el?.selectionStart ?? subject.length;
    const end = el?.selectionEnd ?? subject.length;
    const before = subject.slice(0, start);
    const pad = before && !/\s$/.test(before) ? ' ' : '';
    const next = before + pad + tag + subject.slice(end);
    onChange({ emailSubject: next });
    requestAnimationFrame(() => {
      el?.focus();
      const pos = (before + pad + tag).length;
      el?.setSelectionRange(pos, pos);
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={`${id}-subject`}>Subject line</FieldLabel>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id={`${id}-subject`}
          ref={ref}
          type="text"
          value={subject}
          onChange={(e) => onChange({ emailSubject: e.target.value || undefined })}
          placeholder={defaultSubject}
          aria-describedby={`${id}-preview ${id}-help`}
          className={`${inputCls} flex-1 min-w-0`}
          style={inputStyle}
        />
        <select
          value=""
          disabled={!mergeTags || named.length === 0}
          onChange={(e) => { if (e.target.value) insert(e.target.value); }}
          aria-label="Insert a form answer into the subject"
          className={`${inputCls} sm:w-52 disabled:opacity-50`}
          style={inputStyle}
        >
          <option value="">+ Insert an answer</option>
          {named.map((f) => (
            <option key={f.id} value={toFieldKey(f.label)}>
              {f.label.trim()}{f.type === 'textarea' ? ' (long text)' : ''}
            </option>
          ))}
        </select>
      </div>
      <p id={`${id}-preview`} className="text-xs rounded-md px-2.5 py-1.5 break-words"
        style={{ background: 'var(--color-bg)', border: '1px dashed var(--color-border)', color: 'var(--color-text)' }}>
        <span style={{ color: 'var(--color-muted)' }}>Preview with sample values: </span>{preview}
      </p>
      <Help id={`${id}-help`}>
        {mergeTags ? (
          <>Answers in [brackets] are filled in from each submission. A blank answer is left out along with the dash
          next to it. Subjects show in inbox previews and phone notifications, so avoid phone numbers or private
          details. Leave empty to use the default subject.</>
        ) : (
          <>To put form answers in the subject, first run <strong>Update form handler</strong> at the top of this
          page. Plain-text subjects work now.</>
        )}
      </Help>
    </div>
  );
}

function NotificationSettings({ config, onChange, mergeTags, defaultSubject }: {
  config: SiteTabFormConfig;
  onChange: (updates: Partial<SiteTabFormConfig>) => void;
  mergeTags: boolean;
  defaultSubject: string;
}) {
  const id = useId();
  const emailFields = config.fields.filter((f) => f.type === 'email' && f.label.trim());

  return (
    <>
      <SubjectEditor config={config} onChange={onChange} mergeTags={mergeTags} defaultSubject={defaultSubject} />

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor={`${id}-sender`}>Sender name</FieldLabel>
        <input
          id={`${id}-sender`}
          type="text"
          value={config.senderName ?? ''}
          onChange={(e) => onChange({ senderName: e.target.value || undefined })}
          placeholder="e.g. ELC Construction Website"
          aria-describedby={`${id}-sender-help`}
          className={inputCls}
          style={inputStyle}
        />
        <Help id={`${id}-sender-help`}>
          The name your inbox shows the email as coming from. Use your business or website name. The sending
          address is always your Google account. Leave empty to use your Google account name.
        </Help>
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor={`${id}-replyto`}>When you hit Reply, send to</FieldLabel>
        <select
          id={`${id}-replyto`}
          value={config.replyToField ?? ''}
          onChange={(e) => onChange({ replyToField: e.target.value || undefined })}
          disabled={emailFields.length === 0}
          aria-describedby={`${id}-replyto-help`}
          className={`${inputCls} disabled:opacity-50`}
          style={inputStyle}
        >
          <option value="">Your own address (default)</option>
          {emailFields.map((f) => (
            <option key={f.id} value={toFieldKey(f.label)}>The address typed into &ldquo;{f.label.trim()}&rdquo;</option>
          ))}
        </select>
        <Help id={`${id}-replyto-help`}>
          {emailFields.length === 0
            ? 'Add a field of type Email to reply straight to the person who filled in the form.'
            : 'Lets you answer the person who filled in the form directly from the notification.'}
        </Help>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor={`${id}-cc`}>CC</FieldLabel>
          <ListInput id={`${id}-cc`} type="text" inputMode="email" value={config.ccEmails}
            onCommit={(ccEmails) => onChange({ ccEmails })}
            placeholder="cc@example.com" className={inputCls} style={inputStyle} />
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor={`${id}-bcc`}>BCC</FieldLabel>
          <ListInput id={`${id}-bcc`} type="text" inputMode="email" value={config.bccEmails}
            onCommit={(bccEmails) => onChange({ bccEmails })}
            placeholder="bcc@example.com" className={inputCls} style={inputStyle} />
        </div>
      </div>
      <Help>Separate several addresses with commas.</Help>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  config: SiteTabFormConfig;
  onChange: (config: SiteTabFormConfig) => void;
  /** Whether this project sends notification emails at all. */
  emailEnabled?: boolean;
  /** Where to turn email on, shown when emailEnabled is false. */
  emailOffHint?: string;
  /** False when the deployed form handler predates {{merge tags}}. */
  mergeTags?: boolean;
  /** The subject used when the template is empty, for placeholder + preview. */
  defaultSubject?: string;
}

/** Problems that should block saving this config. Same rules the editor displays. */
export function formConfigIssues(config: SiteTabFormConfig, mergeTags = true): ConfigIssue[] {
  return validateFormConfig(config, { mergeTags });
}

export default function FormFieldEditor({
  config, onChange, emailEnabled = true, emailOffHint, mergeTags = true,
  defaultSubject = 'New form submission',
}: Props) {
  const [showEmail, setShowEmail] = useState(false);
  const [showSpam,  setShowSpam]  = useState(false);
  // The key each field's subject tag currently uses. Renames are typed one
  // character at a time and can pass through another field's key; the tag only
  // moves when the new key is unique, so remember where it last landed.
  const tagKeyById = useRef(new Map<string, string>());
  const issues = formConfigIssues(config, mergeTags);

  function updateField(id: string, updates: Partial<FormField>) {
    const before = config.fields.find((f) => f.id === id);
    const fields = config.fields.map((f) => (f.id === id ? { ...f, ...updates } : f));
    let { emailSubject, replyToField } = config;
    // Renaming a field changes its column key; carry the subject tag and the
    // reply-to choice across, unless the new key collides with another field.
    if (before && updates.label !== undefined) {
      const oldKey = tagKeyById.current.get(id) ?? toFieldKey(before.label);
      const newKey = toFieldKey(updates.label);
      const others = config.fields.filter((f) => f.id !== id).map((f) => toFieldKey(f.label));
      if (oldKey !== newKey && !others.includes(newKey)) {
        if (emailSubject) emailSubject = renameSubjectTag(emailSubject, oldKey, newKey);
        if (replyToField === oldKey) replyToField = newKey;
        tagKeyById.current.set(id, newKey);
      } else {
        tagKeyById.current.set(id, oldKey);
      }
    }
    if (before && updates.type && updates.type !== 'email' && replyToField === toFieldKey(before.label)) {
      replyToField = undefined;
    }
    onChange({ ...config, fields, emailSubject, replyToField });
  }

  function removeField(id: string) {
    const gone = config.fields.find((f) => f.id === id);
    const replyToField = gone && config.replyToField === toFieldKey(gone.label) ? undefined : config.replyToField;
    onChange({ ...config, fields: config.fields.filter((f) => f.id !== id), replyToField });
  }

  function addField() {
    onChange({
      ...config,
      fields: [...config.fields, { id: genId(), label: '', type: 'text', required: false }],
    });
  }

  function patch(updates: Partial<SiteTabFormConfig>) {
    onChange({ ...config, ...updates });
  }

  const subjectIssue = issues.some((i) => i.where !== 'fields');

  return (
    <div className="flex flex-col gap-3">
      {/* Field list */}
      <div className="flex flex-col gap-2">
        {config.fields.map((field, i) => (
          <FieldRow
            key={field.id}
            field={field}
            index={i}
            onUpdate={(u) => updateField(field.id, u)}
            onRemove={() => removeField(field.id)}
            canRemove={config.fields.length > 1}
          />
        ))}
        <button
          type="button"
          onClick={addField}
          className="self-start text-sm font-semibold px-2 py-1.5 -mx-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          style={{ color: 'var(--color-accent)' }}
        >
          + Add field
        </button>
      </div>

      <Section
        title="Notification email"
        open={showEmail || subjectIssue}
        onToggle={() => setShowEmail((v) => !v)}
        pill={<Pill on={emailEnabled}>{emailEnabled ? 'On' : 'Off'}</Pill>}
      >
        {!emailEnabled && (
          <p className="text-xs rounded-md px-2.5 py-2"
            style={{ background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)', color: 'var(--color-warning)' }}>
            Email notifications are off{emailOffHint ? `. ${emailOffHint}` : ''}. These settings are kept and apply
            once they&apos;re on.
          </p>
        )}
        <NotificationSettings config={config} onChange={patch} mergeTags={mergeTags} defaultSubject={defaultSubject} />
      </Section>

      <Section
        title="Spam protection"
        open={showSpam}
        onToggle={() => setShowSpam((v) => !v)}
        pill={<Pill on={!!config.enableHoneypot}>{config.enableHoneypot ? 'Honeypot on' : 'Honeypot off'}</Pill>}
      >
        <Switch
          on={!!config.enableHoneypot}
          onChange={(v) => patch({ enableHoneypot: v })}
          label="Honeypot trap for this form"
        />
        <Help>
          Adds a hidden field that people never see but bots fill in. Those submissions are thrown away quietly, so
          the bot thinks it worked. Your site&apos;s form needs the hidden <code className="font-mono">_hp</code> input;
          the AI skill file (RGFORMS.md) includes the snippet. Turning this on never blocks real visitors.
          Cloudflare Turnstile, the stronger check, is set for the whole project.
        </Help>
      </Section>

      {issues.length > 0 && (
        <ul aria-live="polite" className="flex flex-col gap-1 rounded-lg px-3 py-2 text-xs"
          style={{ background: 'var(--color-error-bg)', border: '1px solid var(--color-error-border)', color: 'var(--color-error)' }}>
          {issues.map((i) => <li key={i.message}>{i.message}</li>)}
        </ul>
      )}
    </div>
  );
}
