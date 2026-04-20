/**
 * Generic Apps Script deployed into every customer's Google account.
 * One script serves all tabs in the project Sheet — no per-customer customisation needed.
 * Reads its own configuration from the hidden _manifest tab at runtime.
 */

export function generateAppsScriptJson(hasAssetTabs: boolean, hasFormTabs: boolean) {
  const oauthScopes = [
    // Only the spreadsheet this script is bound to — not all spreadsheets
    'https://www.googleapis.com/auth/spreadsheets.currentonly',
  ];

  if (hasAssetTabs) {
    // Read files from the provisioned Drive asset folders (read-only)
    oauthScopes.push('https://www.googleapis.com/auth/drive.readonly');
  }

  if (hasFormTabs) {
    // Send notification emails on form submission (send-only, not full Gmail access)
    oauthScopes.push('https://www.googleapis.com/auth/gmail.send');
  }

  return {
    timeZone: 'America/New_York',
    exceptionLogging: 'STACKDRIVER',
    runtimeVersion: 'V8',
    oauthScopes,
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

  // No token at all — friendly health-check (e.g. after authorization redirect)
  if (!token) {
    return jsonResponse({ status: 'ok', message: 'API is live. Pass token and tab parameters to query data.' });
  }

  if (token !== CONFIG.script_token) {
    return jsonResponse({ error: 'Unauthorized' });
  }

  var tabName = e.parameter.tab;
  if (!tabName) return jsonResponse({ error: 'tab parameter required' });

  var tabDef = findTab(tabName);
  if (!tabDef) return jsonResponse({ error: 'Unknown tab: ' + tabName });

  // Asset tab — serve files from Drive subfolder
  if (tabDef.type === 'asset') {
    if (!tabDef.drive_folder_id) return jsonResponse({ error: 'No Drive folder for: ' + tabName });
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
  if (!sheet) return jsonResponse({ error: 'Tab not found: ' + tabName });

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

  // Row-based tab
  var headers = values[0];
  var rows = [];
  for (var k = 1; k < values.length; k++) {
    var row = {};
    for (var l = 0; l < headers.length; l++) {
      row[String(headers[l])] = values[k][l];
    }
    rows.push(row);
  }
  return jsonResponse(rows);
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (!body.token || body.token !== CONFIG.script_token) {
      return jsonResponse({ error: 'Unauthorized' });
    }

    var tabDef = findTab(body.tab);
    if (!tabDef || tabDef.type !== 'form') {
      return jsonResponse({ error: 'Invalid form tab: ' + body.tab });
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(body.tab);
    if (!sheet) return jsonResponse({ error: 'Tab not found: ' + body.tab });

    var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    var rowData = headers.map(function (h) {
      if (String(h) === 'submitted_at') return new Date().toISOString();
      return body.fields ? (body.fields[String(h)] || '') : '';
    });
    sheet.appendRow(rowData);

    if (CONFIG.notification_email) {
      var fields = body.fields || {};
      var lines = Object.keys(fields).map(function (k) { return k + ': ' + fields[k]; }).join('\\n');
      MailApp.sendEmail(CONFIG.notification_email, 'New ' + tabDef.label + ' submission', lines);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: err.message });
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
