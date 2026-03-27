import type { FormConfig } from '@/types';
import { honeypotFieldName } from '@/lib/snippetTemplate';

export function generateAppsScript(sheetId: string, config: FormConfig): string {
  const {
    notifyEmail,
    ccEmails = [],
    bccEmails = [],
    emailSubject,
    senderName,
    replyToFieldId,
    enableHoneypot,
    fields,
    name: formName,
  } = config;

  // Resolve the reply-to field label → normalized key at provision time
  const replyToKey = replyToFieldId
    ? (fields.find((f) => f.id === replyToFieldId)?.label ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
    : '';

  // Embed config as a JSON constant — JSON.stringify handles all escaping
  const configJson = JSON.stringify({
    sheetId,
    notifyEmail,
    cc: ccEmails.join(','),
    bcc: bccEmails.join(','),
    subject: emailSubject || `New submission: ${formName}`,
    senderName: senderName || '',
    replyToKey,   // normalized field key resolved at runtime from e.parameter
    formName,
    honeypotField: enableHoneypot ? honeypotFieldName(fields) : '',
  });

  return `var CONFIG = ${configJson};

function normalizeHeader(h) {
  return h.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function doGet() {
  var html = [
    '<!DOCTYPE html><html lang="en"><head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<title>Form Active \u2014 RG Forms</title>',
    '<style>',
    '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}',
    'body{min-height:100vh;display:flex;align-items:center;justify-content:center;',
    'background:#0a0a0b;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
    'padding:24px;-webkit-font-smoothing:antialiased;}',
    '.card{background:#18181b;border:1px solid #27272a;border-radius:16px;',
    'padding:48px 40px;max-width:440px;width:100%;text-align:center;}',
    '.icon{width:60px;height:60px;margin:0 auto 28px;',
    'background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);',
    'border-radius:50%;display:flex;align-items:center;justify-content:center;}',
    'h1{font-size:24px;font-weight:600;color:#fafafa;margin-bottom:12px;letter-spacing:-.01em;}',
    'p{font-size:14px;color:#71717a;line-height:1.65;margin-bottom:32px;}',
    '.badge{display:inline-flex;align-items:center;gap:8px;',
    'background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.25);',
    'border-radius:100px;padding:8px 18px;font-size:13px;font-weight:500;',
    'color:#22c55e;letter-spacing:.01em;}',
    '.dot{width:7px;height:7px;border-radius:50%;background:#22c55e;',
    'animation:pulse 2s ease-in-out infinite;flex-shrink:0;}',
    '@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}',
    '.footer{margin-top:40px;font-size:12px;color:#3f3f46;}',
    '.footer strong{color:#71717a;font-weight:600;}',
    '</style></head><body>',
    '<div class="card">',
    '<div class="icon">',
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none"',
    ' stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">',
    '<polyline points="20 6 9 17 4 12"/></svg>',
    '</div>',
    '<h1>Endpoint active</h1>',
    '<p>This form is live and accepting submissions.<br>',
    'POST your form data to this URL to capture responses and trigger email notifications.</p>',
    '<span class="badge"><span class="dot"></span>Listening for submissions</span>',
    '<div class="footer">Powered by<br>',
    '<span style="display:inline-flex;align-items:center;gap:5px;margin-top:6px;">',
    '<img src="https://rgforms.com/icon-192.png" alt="" width="20" height="20" style="display:inline-block;border-radius:4px;vertical-align:middle;">',
    '<strong style="vertical-align:middle;">Forms</strong>',
    '</span></div>',
    '</div>',
    '</body></html>'
  ].join('');
  return HtmlService
    .createHtmlOutput(html)
    .setTitle('Form Active \u2014 RG Forms');
}

function buildEmailHtml(headers, params, formName, timestamp) {
  var rows = '';
  for (var i = 0; i < headers.length; i++) {
    var h = headers[i];
    if (h === 'Timestamp') continue;
    var key = normalizeHeader(h);
    var raw = params[key];
    var hasValue = raw != null && String(raw).trim() !== '';
    var val = hasValue ? escapeHtml(raw) : '';
    rows += '<div class="field">'
      + '<div class="field-label">' + escapeHtml(h) + '</div>'
      + (hasValue
          ? '<div class="field-value">' + val + '</div>'
          : '<div class="field-value field-empty">No response</div>')
      + '</div>';
  }

  var styles = [
    'body{margin:0;padding:0;background:#f4f4f5;',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
    '-webkit-font-smoothing:antialiased;}',
    '.wrapper{max-width:560px;margin:0 auto;padding:32px 16px;}',
    '.card{background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;}',
    '.hdr{background:#18181b;padding:28px 32px;}',
    '.eyebrow{font-size:11px;font-weight:600;color:#52525b;text-transform:uppercase;',
    'letter-spacing:.08em;margin-bottom:6px;}',
    '.title{font-size:22px;font-weight:700;color:#fff;margin:0;letter-spacing:-.01em;}',
    '.body{padding:28px 32px;}',
    '.field{padding:0 0 20px;margin-bottom:20px;border-bottom:1px solid #f4f4f5;}',
    '.field:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0;}',
    '.field-label{font-size:11px;font-weight:600;color:#a1a1aa;text-transform:uppercase;',
    'letter-spacing:.06em;margin-bottom:6px;}',
    '.field-value{font-size:15px;color:#18181b;line-height:1.6;word-break:break-word;white-space:pre-wrap;}',
    '.field-empty{color:#d4d4d8;font-style:italic;}',
    '.meta{padding:16px 32px;background:#fafafa;border-top:1px solid #f4f4f5;',
    'display:flex;justify-content:space-between;align-items:center;gap:8px;}',
    '.meta-label{font-size:12px;color:#a1a1aa;}',
    '.meta-value{font-size:12px;color:#71717a;font-weight:500;}',
    '.footer{text-align:center;padding:24px 16px 8px;}',
    '.footer-text{font-size:12px;color:#a1a1aa;margin:0;}',
  ].join('');

  return '<!DOCTYPE html><html lang="en"><head>'
    + '<meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>New submission</title>'
    + '<style>' + styles + '</style>'
    + '</head><body>'
    + '<div class="wrapper"><div class="card">'
    + '<div class="hdr">'
    + '<div class="eyebrow">New submission</div>'
    + '<h1 class="title">' + escapeHtml(formName) + '</h1>'
    + '</div>'
    + '<div class="body">' + rows + '</div>'
    + '<div class="meta">'
    + '<span class="meta-label">Received:</span>'
    + '<span class="meta-value">' + escapeHtml(timestamp) + '</span>'
    + '</div>'
    + '</div>'
    + '<div class="footer">'
    + '<p class="footer-text">Powered by</p>'
    + '<div style="display:inline-flex;align-items:center;gap:6px;margin-top:6px;">'
    + '<img src="https://rgforms.com/icon-192.png" alt="" width="20" height="20" style="display:inline-block;border-radius:4px;vertical-align:middle;">'
    + '<span style="font-size:13px;font-weight:600;color:#71717a;vertical-align:middle;">Forms</span>'
    + '</div>'
    + '</div>'
    + '</div>'
    + '</body></html>';
}

function doPost(e) {
  try {
    // Honeypot check — silently succeed so bots don't know they were blocked
    if (CONFIG.honeypotField && e.parameter[CONFIG.honeypotField]) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: 'success' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.openById(CONFIG.sheetId).getActiveSheet();
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var newRow = headers.map(function(header) {
      return header === 'Timestamp' ? new Date() : e.parameter[normalizeHeader(header)];
    });
    sheet.appendRow(newRow);

    var timestamp = new Date().toLocaleString();
    var htmlBody = buildEmailHtml(headers, e.parameter, CONFIG.formName, timestamp);

    var mailOpts = {
      to: CONFIG.notifyEmail,
      subject: CONFIG.subject,
      htmlBody: htmlBody,
      body: 'New submission for ' + CONFIG.formName + ' received at ' + timestamp
    };
    if (CONFIG.cc) mailOpts.cc = CONFIG.cc;
    if (CONFIG.bcc) mailOpts.bcc = CONFIG.bcc;
    if (CONFIG.senderName) mailOpts.name = CONFIG.senderName;
    // Resolve reply-to dynamically from the submitted form field
    if (CONFIG.replyToKey && e.parameter[CONFIG.replyToKey]) {
      mailOpts.replyTo = e.parameter[CONFIG.replyToKey];
    }

    MailApp.sendEmail(mailOpts);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
}

export const APPS_SCRIPT_MANIFEST = {
  timeZone: 'America/New_York',
  dependencies: {},
  exceptionLogging: 'STACKDRIVER',
  runtimeVersion: 'V8',
  webapp: {
    executeAs: 'USER_DEPLOYING',
    access: 'ANYONE_ANONYMOUS',
  },
  // Explicitly declare scopes so the script shares the user's already-granted
  // authorization from the app's OAuth flow (requires same GCP project via parentId).
  oauthScopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/script.send_mail',
  ],
} as const;
