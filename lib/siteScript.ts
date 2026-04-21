export function generateAppsScriptJson() {
  return {
    timeZone: 'America/New_York',
    exceptionLogging: 'STACKDRIVER',
    runtimeVersion: 'V8',
    oauthScopes: [
      'https://www.googleapis.com/auth/spreadsheets.currentonly',
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
    return jsonResponse({ status: 'ok', message: 'RG Forms API is live.' });
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

    var toEmail = (formConf.notifyEmail) || CONFIG.notification_email;
    if (toEmail) {
      var siteName = CONFIG.site_name || CONFIG.project_slug || '';
      var displayKeys = Object.keys(fields).filter(function (k) { return k !== '_hp'; });
      var subject = formConf.emailSubject || ('New ' + tabDef.label + ' submission' + (siteName ? ' — ' + siteName : ''));
      var bodyHeader = subject + '\\n' + new Array(subject.length + 1).join('-') + '\\n\\n';
      var lines = bodyHeader + displayKeys.map(function (k) { return k + ': ' + fields[k]; }).join('\\n');
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
