// Pure helpers for form settings, shared by the dashboard UI, the generated
// Apps Script, and the tests. No imports: node --test loads this directly.

import type { SiteTabFormConfig } from '../types/index.ts';

export function toFieldKey(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'field';
}

// ─── Subject merge tags ───────────────────────────────────────────────────────
//
// Syntax: {{field_key}}, where field_key is the column name the form submits
// (toFieldKey of the label). Rules, identical in the preview and the live script
// because both run THIS source:
//  - a blank, missing, deleted or unknown field renders as nothing, and the
//    separator next to it is dropped ("A - {{x}} - B" → "A - B"); raw tags never
//    reach the inbox
//  - keys starting with _ (honeypot, captcha token) never resolve
//  - each value is capped at 80 characters, the whole subject at 200
//  - control characters (CR, LF, tab, U+2028/9) become spaces, so a submitted
//    value can't inject email headers or break the subject line
//  - a template with no tags keeps its old behaviour exactly, apart from the
//    control-character scrub
//  - an empty result falls back to the default subject
//
// Written as ES5-ish source because it is emitted verbatim into Apps Script.
export const SUBJECT_RENDERER_SRC = String.raw`
function renderSubject_(template, fields, fallback) {
  var TAG = /\{\{\s*([^{}]*?)\s*\}\}/g;
  var scrub = function (s) {
    return String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ').replace(/\s+/g, ' ');
  };
  var cap = function (s, n) {
    var chars = Array.from(s);
    return chars.length > n ? chars.slice(0, n - 1).join('').replace(/\s+$/, '') + '…' : s;
  };
  var raw = String(template == null ? '' : template);
  if (!/\{\{\s*[^{}]*?\s*\}\}/.test(raw)) {
    var plain = scrub(raw).trim();
    return plain ? cap(plain, 200) : fallback;
  }
  // Split into [literal, key, literal, key, ..., literal].
  var parts = raw.split(TAG);
  var segs = [];
  for (var i = 0; i < parts.length; i++) {
    if (i % 2 === 0) { segs.push(scrub(parts[i])); continue; }
    var key = parts[i];
    var ok = key && key.charAt(0) !== '_' && fields && Object.prototype.hasOwnProperty.call(fields, key);
    segs.push(ok ? cap(scrub(fields[key]).trim(), 80) : '');
  }
  var SEP_END = /\s*[-–—|·:,\/]+\s*$/;
  var SEP_START = /^\s*[-–—|·:,\/]+\s*/;
  for (var j = 1; j < segs.length; j += 2) {
    if (segs[j] !== '') continue;
    var left = segs[j - 1], right = segs[j + 1];
    var atStart = segs.slice(0, j).join('').trim() === '';
    var atEnd = segs.slice(j + 1).join('').trim() === '';
    if (/[\(\[]\s*$/.test(left) && /^\s*[\)\]]/.test(right)) {
      segs[j - 1] = left.replace(/\s*[\(\[]\s*$/, '');
      segs[j + 1] = right.replace(/^\s*[\)\]]/, '');
    } else if (SEP_END.test(left) && (SEP_START.test(right) || atEnd)) {
      segs[j - 1] = left.replace(SEP_END, '');
    } else if (atStart && SEP_START.test(right)) {
      segs[j + 1] = right.replace(SEP_START, '');
    } else if (/\s$/.test(left) && /^[!?.,;:]/.test(right)) {
      segs[j - 1] = left.replace(/\s+$/, '');
    }
  }
  var out = segs.join('').replace(/\s+/g, ' ').trim();
  return out ? cap(out, 200) : fallback;
}`.trim();

// Built with new Function so the preview runs the exact source the script runs.
// If a CSP is ever added to rgforms.com it needs 'unsafe-eval', or this module
// (and the dashboard) fails to load.
export const renderSubject = new Function(`${SUBJECT_RENDERER_SRC}; return renderSubject_;`)() as (
  template: string | undefined,
  fields: Record<string, unknown>,
  fallback: string,
) => string;

/** Keys referenced by {{tags}} in a template, in order, duplicates removed. */
export function subjectTagKeys(template: string): string[] {
  const keys = [...template.matchAll(/\{\{\s*([^{}]*?)\s*\}\}/g)].map((m) => m[1]);
  return [...new Set(keys)];
}

/** Rewrite {{oldKey}} to {{newKey}} — used when a field is renamed. */
export function renameSubjectTag(template: string, oldKey: string, newKey: string): string {
  const esc = oldKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return template.replace(new RegExp(`\\{\\{\\s*${esc}\\s*\\}\\}`, 'g'), `{{${newKey}}}`);
}

// ─── Validation ───────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@,;<>"]+@[^\s@,;<>"]+\.[^\s@,;<>"]+$/;
export const isEmail = (s: string) => EMAIL_RE.test(s.trim());

export interface ConfigIssue {
  where: 'fields' | 'email' | 'subject';
  message: string;
}

/** Problems that would lose data or silently break notifications. Empty = safe to save. */
export function validateFormConfig(
  config: SiteTabFormConfig,
  opts: { mergeTags?: boolean } = {},
): ConfigIssue[] {
  const issues: ConfigIssue[] = [];
  const seen = new Map<string, string>();
  for (const f of config.fields) {
    if (!f.label.trim()) { issues.push({ where: 'fields', message: 'Every field needs a label.' }); continue; }
    const key = toFieldKey(f.label);
    if (key === 'submitted_at') {
      issues.push({ where: 'fields', message: `"${f.label}" clashes with the built-in submitted_at column. Rename it.` });
    }
    const prev = seen.get(key);
    if (prev !== undefined) {
      issues.push({ where: 'fields', message: `"${prev}" and "${f.label}" would save to the same column (${key}). Rename one.` });
    }
    seen.set(key, f.label);
  }
  for (const [list, name] of [[config.ccEmails, 'CC'], [config.bccEmails, 'BCC']] as const) {
    const bad = (list ?? []).filter((e) => !isEmail(e));
    if (bad.length) issues.push({ where: 'email', message: `${name} has an address that isn't valid: ${bad.join(', ')}` });
  }
  const subject = config.emailSubject ?? '';
  // No lookbehind: Safari before 16.4 can't parse it and would fail to load the page.
  if (/\{\{|\}\}/.test(subject.replace(/\{\{[^{}]*\}\}/g, ''))) {
    issues.push({ where: 'subject', message: 'The subject has an unclosed {{ or }}.' });
  }
  // A form handler older than v3 would send {{tags}} through literally.
  if (opts.mergeTags === false && subjectTagKeys(subject).length) {
    issues.push({ where: 'subject', message: 'Form answers in the subject need the latest form handler. Run "Update form handler" at the top of this page first, or remove the {{tags}}.' });
    return issues;
  }
  const unknown = subjectTagKeys(subject).filter((k) => !seen.has(k));
  if (unknown.length) {
    issues.push({ where: 'subject', message: `The subject uses ${unknown.map((k) => `{{${k}}}`).join(', ')}, which isn't a field on this form. Remove it or pick a field from the list.` });
  }
  return issues;
}

// ─── Sheet header row ─────────────────────────────────────────────────────────

/**
 * The header row to write after editing a form, built so existing columns
 * never move: submissions already in the Sheet stay under the right heading.
 *  - renamed field → its header is renamed in place
 *  - removed field → its column stays (old answers keep their heading; new rows leave it blank)
 *  - new field     → appended on the right, or reuses a retired column with the same key
 */
export function mergeHeaders(
  existing: string[],
  oldFields: { id: string; label: string }[],
  newFields: { id: string; label: string }[],
): string[] {
  const headers = existing.length ? [...existing] : ['submitted_at'];
  const oldKeyById = new Map(oldFields.map((f) => [f.id, toFieldKey(f.label)]));
  for (const f of newFields) {
    const key = toFieldKey(f.label);
    if (headers.includes(key)) continue;
    const oldKey = oldKeyById.get(f.id);
    const at = oldKey ? headers.indexOf(oldKey) : -1;
    const stillUsed = oldKey !== undefined && newFields.some((g) => toFieldKey(g.label) === oldKey);
    if (at !== -1 && !stillUsed) headers[at] = key;
    else headers.push(key);
  }
  return headers;
}
