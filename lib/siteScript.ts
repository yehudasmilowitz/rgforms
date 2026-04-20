/**
 * Generic Apps Script deployed into every customer's Google account.
 * One script serves all tabs in the project Sheet — no per-customer customisation needed.
 * Reads its own configuration from the hidden _manifest tab at runtime.
 */

export function generateAppsScriptJson() {
  return {
    timeZone: 'America/New_York',
    exceptionLogging: 'STACKDRIVER',
    runtimeVersion: 'V8',
    oauthScopes: [
      'https://www.googleapis.com/auth/spreadsheets.currentonly',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/gmail.send',
    ],
    webapp: {
      executeAs: 'USER_DEPLOYING',
      access: 'ANYONE_ANONYMOUS',
    },
  };
}

export function generateSiteScript(): string {
  return `
// Load manifest written during provisioning
var CONFIG = (function () {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('_manifest');
  if (!sheet) return { tabs: [], script_token: '' };
  var data = sheet.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === 'manifest_json') {
      try { return JSON.parse(data[i][1]); } catch (e) { return { tabs: [], script_token: '' }; }
    }
  }
  return { tabs: [], script_token: '' };
})();

function doGet(e) {
  var token = e.parameter.token;

  // No token — friendly health-check (shown after authorization redirect)
  if (!token) {
    return jsonResponse({ status: 'ok', message: 'API is live. Pass token and tab parameters to query data.' });
  }

  if (token !== CONFIG.script_token) {
    return jsonResponse({ result: 'error', error: 'Unauthorized' });
  }

  var tabName = e.parameter.tab;
  if (!tabName) return jsonResponse({ result: 'error', error: 'tab parameter required' });

  var tabDef = findTab(tabName);
  if (!tabDef) return jsonResponse({ result: 'error', error: 'Unknown tab: ' + tabName });

  // Asset tab — serve files from Drive subfolder
  if (tabDef.type === 'asset') {
    if (!tabDef.drive_folder_id) return jsonResponse({ result: 'error', error: 'No Drive folder for: ' + tabName });
    var folder = DriveApp.getFolderById(tabDef.drive_folder_id);
    var files = [];
    var it = folder.getFiles();
    while (it.hasNext()) {
      var f = it.next();
      var mime = f.getMimeType();
      files.push({
        id:        f.getId(),
        name:      f.getName(),
        mimeType:  mime,
        isImage:   mime.indexOf('image/') === 0,
        size:      f.getSize(),
        url:       'https://lh3.googleusercontent.com/d/' + f.getId(),
        driveUrl:  f.getUrl(),
        createdAt: f.getDateCreated().toISOString(),
        updatedAt: f.getLastUpdated().toISOString()
      });
    }
    return jsonResponse(files);
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tabName);
  if (!sheet) return jsonResponse({ result: 'error', error: 'Tab not found: ' + tabName });

  var values = sheet.getDataRange().getValues();
  if (values.length === 0) return jsonResponse(tabDef.type === 'key_value' ? {} : []);

  // Key-value tab
  if (tabDef.type === 'key_value') {
    var obj = {};
    for (var j = 0; j < values.length; j++) {
      if (values[j][0]) obj[String(values[j][0])] = values[j][1];
    }
    return jsonResponse(obj);
  }

  // Row-based tab (rows or form — read-only GET, strips internal _hp col)
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
    if (!body.token || body.token !== CONFIG.script_token) {
      return jsonResponse({ result: 'error', error: 'Unauthorized' });
    }

    var tabDef = findTab(body.tab);
    if (!tabDef || tabDef.type !== 'form') {
      return jsonResponse({ result: 'error', error: 'Invalid form tab: ' + body.tab });
    }

    // Honeypot check — silently accept (looks like success) to confuse bots
    var formConf = tabDef.formConfig || {};
    var fields = body.fields || {};
    if (formConf.enableHoneypot && fields['_hp']) {
      return jsonResponse({ result: 'success' });
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(body.tab);
    if (!sheet) return jsonResponse({ result: 'error', error: 'Tab not found: ' + body.tab });

    // Append row
    var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    var rowData = headers.map(function (h) {
      var key = String(h);
      if (key === 'submitted_at') return new Date().toISOString();
      if (key === '_hp') return '';
      return fields[key] !== undefined ? String(fields[key]) : '';
    });
    sheet.appendRow(rowData);

    // Email notification
    var toEmail = (formConf.notifyEmail) || CONFIG.notification_email;
    if (toEmail) {
      var displayKeys = Object.keys(fields).filter(function (k) { return k !== '_hp'; });
      var lines = displayKeys.map(function (k) { return k + ': ' + fields[k]; }).join('\\n');
      var subject = formConf.emailSubject || ('New ' + tabDef.label + ' submission');
      var opts = {};
      if (formConf.ccEmails && formConf.ccEmails.length) opts.cc = formConf.ccEmails.join(',');
      if (formConf.bccEmails && formConf.bccEmails.length) opts.bcc = formConf.bccEmails.join(',');
      if (formConf.senderName) opts.name = formConf.senderName;
      if (formConf.replyToField && fields[formConf.replyToField]) {
        opts.replyTo = String(fields[formConf.replyToField]);
      }
      try {
        if (Object.keys(opts).length > 0) {
          GmailApp.sendEmail(toEmail, subject, lines, opts);
        } else {
          MailApp.sendEmail(toEmail, subject, lines);
        }
      } catch (emailErr) {
        // don't fail the submission if email fails
      }
    }

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
