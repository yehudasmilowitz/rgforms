export const ASSET_SCRIPT_MANIFEST = {
  timeZone: 'America/New_York',
  dependencies: {},
  exceptionLogging: 'STACKDRIVER',
  runtimeVersion: 'V8',
  webapp: {
    executeAs: 'USER_DEPLOYING',
    access: 'ANYONE_ANONYMOUS',
  },
  // DriveApp is a built-in Apps Script service — no Drive API enablement needed.
  // drive.readonly shows "See and download all your Google Drive files" on consent,
  // but is the minimum scope DriveApp requires and cannot be narrowed further.
  oauthScopes: [
    'https://www.googleapis.com/auth/drive.readonly',
  ],
};

export function generateAssetScript(folderId: string, moduleName: string): string {
  return `var CONFIG = ${JSON.stringify({ folderId, moduleName })};

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
  // Bare URL (no ?json=1) — shown after Google's auth redirect which strips params.
  // Also handles the "Authorize script" link click for already-authorized users.
  if (!p.json) return htmlConfirmation(CONFIG.moduleName);
  try {
    var folder = DriveApp.getFolderById(CONFIG.folderId);
    var iter = folder.getFiles();
    var files = [];
    while (iter.hasNext()) {
      var f = iter.next();
      var mime = f.getMimeType();
      var isImage = mime.indexOf('image/') === 0;
      files.push({
        id: f.getId(),
        name: f.getName(),
        mimeType: mime,
        size: f.getSize(),
        isImage: isImage,
        url: isImage
          ? 'https://lh3.googleusercontent.com/d/' + f.getId()
          : 'https://drive.google.com/uc?export=download&id=' + f.getId(),
        driveUrl: f.getUrl(),
        createdAt: f.getDateCreated().toISOString(),
        updatedAt: f.getLastUpdated().toISOString(),
      });
    }
    files.sort(function(a, b) { return a.createdAt > b.createdAt ? -1 : 1; });
    return jsonResponse({ data: files, total: files.length });
  } catch (err) {
    return jsonResponse({ error: err.message, data: [] });
  }
}

function jsonResponse(payload) {
  var output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
`;
}
