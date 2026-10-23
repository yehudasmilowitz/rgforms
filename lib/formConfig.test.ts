import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderSubject, renameSubjectTag, subjectTagKeys, validateFormConfig } from './formConfig.ts';
import type { SiteTabFormConfig } from '../types/index.ts';

const T = 'Acme website contact form - {{applicant_name}} - {{type_of_job}}';
const D = 'New Contact Form submission — Acme';

test('resolves submitted values', () => {
  assert.equal(renderSubject(T, { applicant_name: 'Ann Lee', type_of_job: 'Roofing' }, D),
    'Acme website contact form - Ann Lee - Roofing');
});

test('blank, missing and deleted fields drop out with their separator', () => {
  assert.equal(renderSubject(T, { applicant_name: '', type_of_job: 'Roofing' }, D), 'Acme website contact form - Roofing');
  assert.equal(renderSubject(T, { applicant_name: 'Ann' }, D), 'Acme website contact form - Ann');
  assert.equal(renderSubject(T, {}, D), 'Acme website contact form');
  assert.equal(renderSubject('{{name}} - Contact', {}, D), 'Contact');
  assert.equal(renderSubject('Lead ({{name}}) today', {}, D), 'Lead today');
  assert.equal(renderSubject('Lead: {{deleted_field}}', { name: 'Ann' }, D), 'Lead');
});

test('consecutive blanks and trailing punctuation clean up', () => {
  assert.equal(renderSubject('{{a}} - {{b}} - New lead', {}, D), 'New lead');
  assert.equal(renderSubject('Hi {{name}}!', {}, D), 'Hi!');
  assert.equal(renderSubject('Hi {{name}}!', { name: 'Ann' }, D), 'Hi Ann!');
});

test('the unclosed-tag check needs no lookbehind (Safari < 16.4)', () => {
  assert.doesNotMatch(readFileSync(new URL('./formConfig.ts', import.meta.url), 'utf8'), /\(\?<[!=]/);
});

test('an all-blank result falls back to the default subject, never an empty one', () => {
  assert.equal(renderSubject('{{name}}', {}, D), D);
  assert.equal(renderSubject('', {}, D), D);
  assert.equal(renderSubject(undefined, {}, D), D);
});

test('existing tag-free templates are unchanged', () => {
  for (const s of ['Acme website contact form', 'New lead — website', 'Re: {not a tag}', 'A -- B']) {
    assert.equal(renderSubject(s, {}, D), s);
  }
});

test('carriage returns and newlines cannot reach the header', () => {
  const out = renderSubject(T, { applicant_name: 'Evil\r\nBcc: victim@example.com\u2028x', type_of_job: '\tRoof\n' }, D);
  assert.doesNotMatch(out, /[\r\n\t\u2028\u2029]/);
  assert.equal(out, 'Acme website contact form - Evil Bcc: victim@example.com x - Roof');
  assert.doesNotMatch(renderSubject('Static\r\nBcc: x@y.z', {}, D), /[\r\n]/);
});

test('reserved and inherited keys never resolve', () => {
  assert.equal(renderSubject('Hi {{_hp}}', { _hp: 'bot' }, D), 'Hi');
  assert.equal(renderSubject('Hi {{constructor}}', {}, D), 'Hi');
});

test('long values and Unicode are capped by character, not byte', () => {
  const out = renderSubject('{{m}}', { m: '🚀'.repeat(200) }, D);
  assert.equal(Array.from(out).length, 80);
  assert.ok(out.endsWith('…'));
  assert.equal(renderSubject('{{n}} — {{j}}', { n: 'José Ñúñez', j: '日本' }, D), 'José Ñúñez — 日本');
  assert.ok(Array.from(renderSubject('x'.repeat(500), {}, D)).length <= 200);
});

test('non-string values render as text', () => {
  assert.equal(renderSubject('#{{n}}', { n: 42 }, D), '#42');
});

test('renaming a field rewrites its tag', () => {
  assert.equal(renameSubjectTag('A {{ name }} {{name}} {{name2}}', 'name', 'full_name'), 'A {{full_name}} {{full_name}} {{name2}}');
  assert.deepEqual(subjectTagKeys(T + ' {{applicant_name}}'), ['applicant_name', 'type_of_job']);
});

const base = (over: Partial<SiteTabFormConfig> = {}): SiteTabFormConfig => ({
  fields: [
    { id: '1', label: 'Applicant name', type: 'text', required: true },
    { id: '2', label: 'Type of job', type: 'select', required: false },
  ],
  ...over,
});

test('a valid config has no issues', () => {
  assert.deepEqual(validateFormConfig(base({ emailSubject: T, ccEmails: ['a@b.co'] })), []);
});

test('blocks configs that would lose data or drop notifications', () => {
  const msgs = (c: SiteTabFormConfig) => validateFormConfig(c).map((i) => i.where);
  assert.deepEqual(msgs(base({ emailSubject: 'X {{gone}}' })), ['subject']);
  assert.deepEqual(msgs(base({ emailSubject: 'X {{applicant_name' })), ['subject']);
  assert.deepEqual(msgs(base({ ccEmails: ['not-an-email'] })), ['email']);
  assert.deepEqual(msgs(base({ bccEmails: ['a@b.co, c@d.co'] })), ['email']);
  assert.deepEqual(msgs({ fields: [...base().fields, { id: '3', label: 'applicant  NAME', type: 'text', required: false }] }), ['fields']);
  assert.deepEqual(msgs({ fields: [{ id: '1', label: ' ', type: 'text', required: false }] }), ['fields']);
  assert.deepEqual(msgs({ fields: [{ id: '1', label: 'Submitted at', type: 'text', required: false }] }), ['fields']);
});

test('tags are refused while the live form handler predates merge tags', () => {
  const issues = validateFormConfig(base({ emailSubject: T }), { mergeTags: false });
  assert.equal(issues.length, 1);
  assert.match(issues[0].message, /Update form handler/);
  assert.deepEqual(validateFormConfig(base({ emailSubject: 'Plain' }), { mergeTags: false }), []);
});

import { mergeHeaders } from './formConfig.ts';

const F = (id: string, label: string) => ({ id, label });
const OLD = [F('1', 'Name'), F('2', 'Email'), F('3', 'Type of job'), F('4', 'Message')];
const HDR = ['submitted_at', 'name', 'email', 'type_of_job', 'message'];

test('removing a middle field keeps every existing column in place', () => {
  // Used to write [submitted_at, name, email, message], shifting old answers under the wrong heading.
  assert.deepEqual(mergeHeaders(HDR, OLD, [F('1', 'Name'), F('2', 'Email'), F('4', 'Message')]), HDR);
});

test('renaming renames in place; adding appends', () => {
  assert.deepEqual(
    mergeHeaders(HDR, OLD, [F('1', 'Full name'), F('2', 'Email'), F('3', 'Type of job'), F('4', 'Message'), F('5', 'Phone')]),
    ['submitted_at', 'full_name', 'email', 'type_of_job', 'message', 'phone'],
  );
});

test('a re-added field reuses its retired column', () => {
  assert.deepEqual(mergeHeaders(HDR, OLD.slice(0, 2), [...OLD.slice(0, 2), F('9', 'Message')]), HDR);
});

test('owner-added columns in the Sheet are preserved', () => {
  assert.deepEqual(mergeHeaders([...HDR, 'notes'], OLD, OLD), [...HDR, 'notes']);
});

test('an empty sheet gets a fresh header row', () => {
  assert.deepEqual(mergeHeaders([], [], OLD), HDR);
});
