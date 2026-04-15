export const SITE_CONFIG_SCRIPT_MANIFEST = {
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

export function generateSiteConfigScript(moduleName: string): string {
  return `var CONFIG = ${JSON.stringify({ moduleName, sheetName: 'Config' })};

function htmlConfirmation(name) {
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1"><title>Authorized</title>'
    + '<style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;'
    + 'justify-content:center;background:#0a0a0f;font-family:system-ui,sans-serif;color:#e2e8f0}'
    + '.c{text-align:center;padding:2rem}.ic{width:56px;height:56px;border-radius:50%;background:#14532d;'
    + 'display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem}'
    + 'h1{margin:0 0 .5rem;font-size:1.2rem;font-weight:600}p{margin:0;color:#94a3b8;font-size:.875rem;line-height:1.5}'
    + '</style></head><body><div class="c"><div class="ic">'
    + '<svg width="28" height="28" viewBox="0 0 24 24" fill="none">'
    + '<path d="M5 13l4 4L19 7" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
    + '</svg></div><h1>' + name + ' is authorized</h1>'
    + '<p>This endpoint is live and ready to use.<br>You can close this tab.</p>'
    + '</div></body></html>';
  return HtmlService.createHtmlOutput(html);
}

function doGet(e) {
  var p = (e && e.parameter) ? e.parameter : {};
  if (!p.json) return htmlConfirmation(CONFIG.moduleName);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.sheetName);
    if (!sheet) return jsonResponse({ error: 'Config sheet not found', data: {} });

    var values = sheet.getDataRange().getValues();
    var data = {};

    // Row 0 is the header (key | value | description) — skip it
    for (var i = 1; i < values.length; i++) {
      var key = String(values[i][0]).trim();
      if (!key || key === '') continue;
      var raw = values[i][1];
      // Auto-cast booleans and numbers; leave everything else as string
      var val;
      if (raw === true || raw === false) {
        val = raw;
      } else if (raw === 'true') {
        val = true;
      } else if (raw === 'false') {
        val = false;
      } else if (raw !== '' && raw !== null && !isNaN(Number(raw)) && String(raw).trim() !== '') {
        val = Number(raw);
      } else {
        val = raw === null ? '' : String(raw);
      }
      data[key] = val;
    }

    return jsonResponse({ data: data });
  } catch (err) {
    return jsonResponse({ error: err.message, data: {} });
  }
}

function jsonResponse(payload) {
  var output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
`;
}
