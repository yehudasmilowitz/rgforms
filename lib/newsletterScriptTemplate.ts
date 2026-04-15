export const NEWSLETTER_SCRIPT_MANIFEST = {
  timeZone: 'America/New_York',
  dependencies: {},
  exceptionLogging: 'STACKDRIVER',
  runtimeVersion: 'V8',
  webapp: {
    executeAs: 'USER_DEPLOYING',
    access: 'ANYONE_ANONYMOUS',
  },
  oauthScopes: [
    'https://www.googleapis.com/auth/spreadsheets.currentonly',
  ],
};

export function generateNewsletterScript(moduleName: string): string {
  return `var CONFIG = ${JSON.stringify({ moduleName, sheetName: 'Subscribers' })};

function corsResponse(payload) {
  var output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var email = body.email ? String(body.email).trim().toLowerCase() : '';
    if (!email) return corsResponse({ success: false, message: 'Email is required' });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.sheetName);
    if (!sheet) return corsResponse({ success: false, message: 'Subscribers sheet not found' });

    var lastRow = sheet.getLastRow();

    // Check for duplicate email (case-insensitive)
    if (lastRow >= 2) {
      var emailCol = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var i = 0; i < emailCol.length; i++) {
        if (String(emailCol[i][0]).trim().toLowerCase() === email) {
          return corsResponse({ success: false, message: 'Already subscribed' });
        }
      }
    }

    var name = body.name ? String(body.name).trim() : '';
    var tag = body.tag ? String(body.tag).trim() : '';
    var subscribedAt = new Date().toISOString();
    var unsubscribeToken = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

    sheet.appendRow([email, name, tag, subscribedAt, unsubscribeToken, 'TRUE']);

    return corsResponse({ success: true, message: 'Subscribed successfully' });
  } catch (err) {
    return corsResponse({ success: false, message: err.message });
  }
}

function doGet(e) {
  var p = (e && e.parameter) ? e.parameter : {};
  var action = p.action || '';

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.sheetName);
    if (!sheet) return corsResponse({ error: 'Subscribers sheet not found' });

    // Unsubscribe
    if (action === 'unsubscribe') {
      var token = p.token ? String(p.token).trim() : '';
      if (!token) return corsResponse({ success: false, message: 'Token is required' });

      var lastRow = sheet.getLastRow();
      if (lastRow < 2) return corsResponse({ success: false, message: 'Token not found' });

      var data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
      for (var i = 0; i < data.length; i++) {
        if (String(data[i][4]).trim() === token) {
          // Column 6 = Active (index 5), row is i+2 (1-indexed, offset by header)
          sheet.getRange(i + 2, 6).setValue('FALSE');
          return corsResponse({ success: true, message: 'Unsubscribed successfully' });
        }
      }
      return corsResponse({ success: false, message: 'Token not found' });
    }

    // Count active subscribers
    if (action === 'count') {
      var lastRow = sheet.getLastRow();
      var count = 0;
      if (lastRow >= 2) {
        var activeCol = sheet.getRange(2, 6, lastRow - 1, 1).getValues();
        for (var i = 0; i < activeCol.length; i++) {
          if (activeCol[i][0] === true || activeCol[i][0] === 'TRUE') count++;
        }
      }
      return corsResponse({ count: count, moduleName: CONFIG.moduleName });
    }

    // Default: list all subscribers
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return corsResponse({ subscribers: [], total: 0 });

    var rows = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
    var subscribers = rows
      .filter(function(row) { return String(row[0]).trim() !== ''; })
      .map(function(row) {
        return {
          email: String(row[0] || '').trim(),
          name: String(row[1] || '').trim(),
          tag: String(row[2] || '').trim(),
          subscribedAt: String(row[3] || '').trim(),
          active: row[5] === true || row[5] === 'TRUE'
        };
      });

    return corsResponse({ subscribers: subscribers, total: subscribers.length });
  } catch (err) {
    return corsResponse({ error: err.message });
  }
}
`;
}
