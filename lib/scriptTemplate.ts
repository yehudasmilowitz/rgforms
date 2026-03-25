export function generateAppsScript(sheetId: string, notifyEmail: string): string {
  return `function normalizeHeader(h) {
  return h.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

function doGet() {
  return ContentService
    .createTextOutput('Form endpoint is active. Submit via POST.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.openById('${sheetId}').getActiveSheet();
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var newRow = headers.map(function(header) {
      return header === 'Timestamp' ? new Date() : e.parameter[normalizeHeader(header)];
    });
    sheet.appendRow(newRow);
    MailApp.sendEmail({
      to: '${notifyEmail}',
      subject: 'New form submission',
      body: JSON.stringify(e.parameter, null, 2)
    });
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
