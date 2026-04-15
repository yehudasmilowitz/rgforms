export const ASSET_SCRIPT_MANIFEST = {
  timeZone: 'America/New_York',
  dependencies: {},
  exceptionLogging: 'STACKDRIVER',
  runtimeVersion: 'V8',
  webapp: {
    executeAs: 'USER_DEPLOYING',
    access: 'ANYONE_ANONYMOUS',
  },
  // drive.metadata.readonly: "View metadata for files in your Google Drive"
  // This is the minimum scope needed — we only read file IDs/names/mimeTypes
  // and build public lh3.googleusercontent.com URLs from the IDs.
  // We do NOT need drive.readonly ("See and download all your Drive files").
  oauthScopes: [
    'https://www.googleapis.com/auth/drive.metadata.readonly',
  ],
};

export function generateAssetScript(folderId: string, moduleName: string): string {
  return `var CONFIG = ${JSON.stringify({ folderId, moduleName })};

function doGet(e) {
  try {
    // Use Drive REST API with the script's own token (drive.metadata.readonly scope).
    // DriveApp would require the broader drive.readonly scope — avoided intentionally.
    var token = ScriptApp.getOAuthToken();
    var q = encodeURIComponent("'" + CONFIG.folderId + "' in parents and trashed = false");
    var fields = encodeURIComponent('files(id,name,mimeType,size,modifiedTime)');
    var url = 'https://www.googleapis.com/drive/v3/files'
      + '?q=' + q
      + '&fields=' + fields
      + '&orderBy=modifiedTime+desc'
      + '&pageSize=1000';

    var res = UrlFetchApp.fetch(url, {
      headers: { Authorization: 'Bearer ' + token },
      muteHttpExceptions: true,
    });

    var json = JSON.parse(res.getContentText());
    if (json.error) throw new Error(json.error.message || JSON.stringify(json.error));

    var files = (json.files || []).map(function(f) {
      var img = f.mimeType && f.mimeType.indexOf('image/') === 0;
      return {
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        size: f.size ? parseInt(f.size, 10) : 0,
        modifiedTime: f.modifiedTime,
        isImage: img,
        url: img
          ? 'https://lh3.googleusercontent.com/d/' + f.id
          : 'https://drive.google.com/uc?export=download&id=' + f.id,
        driveUrl: 'https://drive.google.com/file/d/' + f.id + '/view',
      };
    });

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
