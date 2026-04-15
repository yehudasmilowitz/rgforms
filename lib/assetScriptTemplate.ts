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

function doGet(e) {
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
