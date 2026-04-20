/**
 * Project-level Apps Script template.
 *
 * The deployed web app acts as a lightweight read API for the project:
 *   GET  /exec              → returns a friendly HTML confirmation page (for browser / post-auth)
 *   GET  /exec?json=1       → returns project metadata + all registered modules as JSON
 *   GET  /exec?module=<id>  → returns a single module entry by sheetId as JSON
 */

export const PROJECT_SCRIPT_MANIFEST = {
  timeZone: 'America/New_York',
  exceptionLogging: 'STACKDRIVER',
  runtimeVersion: 'V8',
  oauthScopes: [
    'https://www.googleapis.com/auth/spreadsheets.currentonly',
  ],
  webapp: {
    executeAs: 'USER_DEPLOYING',
    access: 'ANYONE_ANONYMOUS',
  },
};

export function generateProjectScript(projectId: string, projectName: string, createdAt: string): string {
  // Escape any quotes in the project name
  const safeName = projectName.replace(/'/g, "\\'").replace(/"/g, '\\"');
  const safeCreatedAt = createdAt.replace(/'/g, "\\'");

  return `
var PROJECT_CONFIG = {
  projectId: "${projectId}",
  projectName: "${safeName}",
  createdAt: "${safeCreatedAt}"
};

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var modulesSheet = ss.getSheetByName('Modules');
    var modules = [];

    if (modulesSheet) {
      var data = modulesSheet.getDataRange().getValues();
      if (data.length > 1) {
        var headers = data[0];
        for (var i = 1; i < data.length; i++) {
          if (!data[i][0]) continue;
          var entry = {};
          for (var j = 0; j < headers.length; j++) {
            if (headers[j]) entry[headers[j]] = data[i][j];
          }
          modules.push(entry);
        }
      }
    }

    var params = e && e.parameter ? e.parameter : {};

    // ?module=<sheetId> — single module lookup (always JSON)
    if (params.module) {
      var found = null;
      for (var k = 0; k < modules.length; k++) {
        if (modules[k].sheet_id === params.module) { found = modules[k]; break; }
      }
      var single = found
        ? { ok: true, module: found }
        : { ok: false, error: 'Module not found' };
      return ContentService
        .createTextOutput(JSON.stringify(single))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ?json=1 — programmatic JSON response
    if (params.json === '1' || params.format === 'json') {
      var jsonOut = JSON.stringify({ ok: true, project: PROJECT_CONFIG, modules: modules });
      return ContentService
        .createTextOutput(jsonOut)
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Default — friendly HTML page shown after browser authorization
    var moduleRows = '';
    for (var m = 0; m < modules.length; m++) {
      var mod = modules[m];
      moduleRows += '<tr><td>' + (mod.module_type || '') + '</td><td>' + (mod.module_name || '') + '</td><td style="font-family:monospace;font-size:12px">' + (mod.deployment_url ? '<a href="' + mod.deployment_url + '" target="_blank" style="color:#22c55e">Open ↗</a>' : '—') + '</td></tr>';
    }
    var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + PROJECT_CONFIG.projectName + ' — RG Project</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#0a0a0f;color:#e8e8f0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}.card{background:#13131a;border:1px solid #2a2a3a;border-radius:16px;padding:32px;max-width:480px;width:100%}.badge{display:inline-flex;align-items:center;gap:6px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);color:#22c55e;border-radius:999px;padding:4px 12px;font-size:12px;font-weight:600;margin-bottom:20px}.dot{width:6px;height:6px;border-radius:50%;background:#22c55e;animation:pulse 1.5s infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}h1{font-size:22px;font-weight:700;color:#fff;margin-bottom:6px}p.sub{font-size:13px;color:#888;margin-bottom:24px}table{width:100%;border-collapse:collapse;font-size:13px}th{text-align:left;color:#666;font-weight:600;padding:8px 0;border-bottom:1px solid #2a2a3a}td{padding:10px 0;border-bottom:1px solid #1e1e2e;color:#ccc}td:first-child{color:#e8e8f0;font-weight:500}.empty{color:#555;font-size:13px;padding:16px 0}.footer{margin-top:24px;font-size:11px;color:#444}a{color:#22c55e;text-decoration:none}a:hover{text-decoration:underline}</style></head><body><div class="card"><div class="badge"><span class="dot"></span>API active</div><h1>' + PROJECT_CONFIG.projectName + '</h1><p class="sub">Project API is live. Add <code style="background:#1e1e2e;padding:1px 6px;border-radius:4px">?json=1</code> for the raw JSON endpoint.</p>' + (modules.length > 0 ? '<table><thead><tr><th>Type</th><th>Module</th><th>Endpoint</th></tr></thead><tbody>' + moduleRows + '</tbody></table>' : '<p class="empty">No modules registered yet.</p>') + '<p class="footer">Created ' + PROJECT_CONFIG.createdAt.substring(0,10) + ' &middot; Powered by Sheetspin</p></div></body></html>';
    return HtmlService.createHtmlOutput(html);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Called by the Sheetspin app to register a module with this project.
 * Not exposed as a web endpoint — invoked via the Sheets API values:batchUpdate
 * by writing directly to the Modules tab.
 */
function registerModule(moduleType, moduleName, sheetId, deploymentUrl) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Modules');
  if (!sheet) {
    sheet = ss.insertSheet('Modules');
    sheet.getRange('A1:E1').setValues([['module_type', 'module_name', 'sheet_id', 'deployment_url', 'created_at']]);
    sheet.getRange('1:1').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([moduleType, moduleName, sheetId, deploymentUrl || '', new Date().toISOString()]);
}
`.trim();
}
