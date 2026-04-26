export function generateAppsScriptJson(notificationsEnabled = true) {
  const scopes = ['https://www.googleapis.com/auth/spreadsheets.currentonly'];
  if (notificationsEnabled) scopes.push('https://www.googleapis.com/auth/script.send_mail');
  return {
    timeZone: 'America/New_York',
    exceptionLogging: 'STACKDRIVER',
    runtimeVersion: 'V8',
    oauthScopes: scopes,
    webapp: {
      executeAs: 'USER_DEPLOYING',
      access: 'ANYONE_ANONYMOUS',
    },
  };
}

export function generateSiteScript(notificationsEnabled = true): string {
  return `
var CONFIG = (function () {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('_manifest');
  if (!sheet) return { tabs: [] };
  var data = sheet.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === 'manifest_json') {
      try { return JSON.parse(data[i][1]); } catch (e) { return { tabs: [] }; }
    }
  }
  return { tabs: [] };
})();

function doGet(e) {
  var tabName = e.parameter.tab;

  if (!tabName) {
    var projectName = CONFIG.site_name || CONFIG.project_slug || 'RG Forms';
    var html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + projectName + ' — RG Forms</title>'
      + '<style>'
      + '*{box-sizing:border-box;margin:0;padding:0}'
      + 'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#0f0f13;color:#e2e2e8;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}'
      + '.card{background:#1a1a22;border:1px solid #2a2a38;border-radius:16px;padding:40px 48px;max-width:440px;width:100%;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,0.4)}'
      + '.badge{display:inline-flex;align-items:center;gap:8px;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.25);border-radius:999px;padding:6px 14px;margin-bottom:28px}'
      + '.dot{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px rgba(34,197,94,0.6)}'
      + '.badge-text{font-size:12px;font-weight:600;color:#22c55e;letter-spacing:0.04em}'
      + 'h1{font-size:22px;font-weight:700;color:#f0f0f6;margin-bottom:8px}'
      + '.subtitle{font-size:14px;color:#6b6b80;margin-bottom:32px;line-height:1.5}'
      + '.divider{height:1px;background:#2a2a38;margin-bottom:28px}'
      + '.meta{display:flex;flex-direction:column;gap:10px}'
      + '.meta-row{display:flex;justify-content:space-between;align-items:center;font-size:12px}'
      + '.meta-label{color:#6b6b80;font-weight:500}'
      + '.meta-value{color:#c0c0cc;font-weight:500;font-family:monospace;font-size:11px}'
      + '.pill{display:inline-block;background:#2a2a38;border:1px solid #3a3a50;border-radius:6px;padding:2px 8px}'
      + '.footer{margin-top:28px;font-size:11px;color:#3a3a50}'
      + '</style>'
      + '</head><body>'
      + '<div class="card">'
      + '<div class="badge"><span class="dot"></span><span class="badge-text">API Active</span></div>'
      + '<h1>' + projectName + '</h1>'
      + '<p class="subtitle">This RG Forms endpoint is live and ready to accept submissions.</p>'
      + '<div class="divider"></div>'
      + '<div class="meta">'
      + '<div class="meta-row"><span class="meta-label">Status</span><span class="meta-value" style="color:#22c55e">operational</span></div>'
      + '<div class="meta-row"><span class="meta-label">Method</span><span class="meta-value"><span class="pill">POST</span> application/json</span></div>'
      + '<div class="meta-row"><span class="meta-label">Forms</span><span class="meta-value">' + CONFIG.tabs.filter(function(t){return t.type==="form";}).length + ' active</span></div>'
      + '</div>'
      + '<p class="footer">Powered by RG Forms</p>'
      + '</div>'
      + '</body></html>';
    return HtmlService.createHtmlOutput(html).setTitle(projectName + ' — RG Forms');
  }

  var tabDef = findTab(tabName);
  if (!tabDef) return jsonResponse({ result: 'error', error: 'Unknown tab: ' + tabName });

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tabName);
  if (!sheet) return jsonResponse({ result: 'error', error: 'Tab not found: ' + tabName });

  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return jsonResponse([]);

  var headers = values[0];
  var rows = [];
  for (var k = 1; k < values.length; k++) {
    var row = {};
    for (var l = 0; l < headers.length; l++) {
      if (String(headers[l]) !== '_hp') {
        row[String(headers[l])] = values[k][l];
      }
    }
    rows.push(row);
  }
  return jsonResponse(rows);
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    var tabDef = findTab(body.tab);
    if (!tabDef || tabDef.type !== 'form') {
      return jsonResponse({ result: 'error', error: 'Invalid form tab: ' + body.tab });
    }

    var formConf = tabDef.formConfig || {};
    var fields = body.fields || {};

    // Honeypot — silently accept to confuse bots
    if (formConf.enableHoneypot && fields['_hp']) {
      return jsonResponse({ result: 'success' });
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(body.tab);
    if (!sheet) return jsonResponse({ result: 'error', error: 'Tab not found: ' + body.tab });

    var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    var rowData = headers.map(function (h) {
      var key = String(h);
      if (key === 'submitted_at') return new Date().toISOString();
      if (key === '_hp') return '';
      return fields[key] !== undefined ? String(fields[key]) : '';
    });
    sheet.appendRow(rowData);

    ${notificationsEnabled ? `var toEmail = (formConf.notifyEmail) || CONFIG.notification_email;
    if (toEmail) {
      var siteName = CONFIG.site_name || CONFIG.project_slug || '';
      var displayKeys = Object.keys(fields).filter(function (k) { return k !== '_hp'; });
      var subject = formConf.emailSubject || ('New ' + tabDef.label + ' submission' + (siteName ? ' — ' + siteName : ''));
      var bodyHeader = subject + '\\n' + new Array(subject.length + 1).join('-') + '\\n\\n';
      var lines = bodyHeader + displayKeys.map(function (k) { return k + ': ' + fields[k]; }).join('\\n');
      var htmlParts = displayKeys.map(function (k) {
        var val = String(fields[k] !== undefined ? fields[k] : '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        return '<div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #f3f4f6;">'
          + '<p style="margin:0 0 3px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;">' + k + '</p>'
          + '<p style="margin:0;font-size:14px;color:#111827;white-space:pre-wrap;">' + val + '</p>'
          + '</div>';
      });
      var htmlBody = '<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">'
        + '<div style="background:#6c5ce7;padding:20px 24px;border-radius:8px 8px 0 0;">'
        + '<p style="margin:0 0 2px;color:rgba(255,255,255,.65);font-size:11px;text-transform:uppercase;letter-spacing:.08em;">New submission</p>'
        + '<h2 style="margin:0;color:#fff;font-size:18px;font-weight:600;">' + tabDef.label + '</h2>'
        + (siteName ? '<p style="margin:4px 0 0;color:rgba(255,255,255,.65);font-size:13px;">' + siteName + '</p>' : '')
        + '</div>'
        + '<div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;">'
        + htmlParts.join('')
        + '</div>'
        + '<div style="padding:12px 24px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">'
        + '<p style="margin:0;font-size:11px;color:#9ca3af;">Sent via RG Forms</p>'
        + '</div>'
        + '</div>';
      var opts = { htmlBody: htmlBody };
      if (formConf.ccEmails && formConf.ccEmails.length) opts.cc = formConf.ccEmails.join(',');
      if (formConf.bccEmails && formConf.bccEmails.length) opts.bcc = formConf.bccEmails.join(',');
      if (formConf.senderName) opts.name = formConf.senderName;
      if (formConf.replyToField && fields[formConf.replyToField]) {
        opts.replyTo = String(fields[formConf.replyToField]);
      }
      try {
        MailApp.sendEmail(toEmail, subject, lines, opts);
      } catch (emailErr) {
        // don't fail the submission if email fails
      }
    }` : ''}

    return jsonResponse({ result: 'success' });
  } catch (err) {
    return jsonResponse({ result: 'error', error: err.message });
  }
}

function findTab(name) {
  for (var i = 0; i < CONFIG.tabs.length; i++) {
    if (CONFIG.tabs[i].name === name) return CONFIG.tabs[i];
  }
  return null;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`.trim();
}
