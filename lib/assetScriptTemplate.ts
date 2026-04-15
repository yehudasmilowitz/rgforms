export const ASSET_SCRIPT_MANIFEST = {
  timeZone: 'America/New_York',
  dependencies: {},
  exceptionLogging: 'STACKDRIVER',
  runtimeVersion: 'V8',
  webapp: {
    executeAs: 'USER_DEPLOYING',
    access: 'ANYONE_ANONYMOUS',
  },
  oauthScopes: [
    'https://www.googleapis.com/auth/drive.readonly',
  ],
};

export function generateAssetScript(folderId: string, moduleName: string): string {
  return `var CONFIG = ${JSON.stringify({ folderId, moduleName })};

function isImage(mimeType) {
  return String(mimeType).indexOf('image/') === 0;
}

function getPublicUrl(fileId, mimeType) {
  if (isImage(mimeType)) return 'https://lh3.googleusercontent.com/d/' + fileId;
  return 'https://drive.google.com/uc?export=download&id=' + fileId;
}

function doGet(e) {
  try {
    var folder = DriveApp.getFolderById(CONFIG.folderId);
    var files = folder.getFiles();
    var result = [];
    while (files.hasNext()) {
      var file = files.next();
      var mimeType = file.getMimeType();
      result.push({
        id: file.getId(),
        name: file.getName(),
        mimeType: mimeType,
        isImage: isImage(mimeType),
        size: file.getSize(),
        url: getPublicUrl(file.getId(), mimeType),
        driveUrl: file.getUrl(),
        createdAt: file.getDateCreated().toISOString(),
        updatedAt: file.getLastUpdated().toISOString(),
      });
    }
    result.sort(function(a, b) { return a.createdAt > b.createdAt ? -1 : 1; });
    return jsonResponse({ data: result, total: result.length });
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
