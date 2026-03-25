export function generateAppsScript(sheetId: string, notifyEmail: string): string {
  return `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.openById('${sheetId}').getActiveSheet();
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var newRow = headers.map(function(header) {
      return header === 'Timestamp' ? new Date() : e.parameter[header];
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
} as const;
