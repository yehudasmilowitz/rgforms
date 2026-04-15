export const GALLERY_SCRIPT_MANIFEST = {
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

export function generateGalleryScript(moduleName: string): string {
  return `var CONFIG = ${JSON.stringify({ moduleName, sheetName: 'Gallery' })};

function htmlConfirmation(name) {
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1"><title>Authorized</title>'
    + '<style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;'
    + 'justify-content:center;background:#0a0a0f;font-family:system-ui,sans-serif;color:#e2e8f0}'
    + '.c{text-align:center;padding:2rem}.ic{width:56px;height:56px;border-radius:50%;background:#0f2d0f;'
    + 'display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem}'
    + 'h1{margin:0 0 .5rem;font-size:1.2rem;font-weight:600}p{margin:0;color:#94a3b8;font-size:.875rem;line-height:1.5}'
    + '</style></head><body><div class="c"><div class="ic">'
    + '<svg width="28" height="28" viewBox="0 0 24 24" fill="none">'
    + '<path d="M5 13l4 4L19 7" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
    + '</svg></div><h1>' + name + ' is authorized</h1>'
    + '<p>Gallery endpoint is live and ready to use.<br>Append ?json=1 to fetch images.</p>'
    + '</div></body></html>';
  return HtmlService.createHtmlOutput(html);
}

function parseRow(headers, row) {
  var image = {};
  for (var j = 0; j < headers.length; j++) {
    var rawKey = headers[j];
    if (!rawKey) continue;
    var key = String(rawKey).toLowerCase().replace(/\\s+/g, '_');
    var val = row[j];
    if (key === 'featured') {
      val = val === true || val === 'TRUE' || val === 'true';
    } else if (key === 'order') {
      val = val !== '' && !isNaN(Number(val)) ? Number(val) : null;
    } else if (typeof val === 'number') {
      val = val;
    } else {
      val = val !== null && val !== undefined ? String(val) : '';
    }
    image[key] = val;
  }
  return image;
}

function doGet(e) {
  var p = (e && e.parameter) ? e.parameter : {};
  if (!p.json) return htmlConfirmation(CONFIG.moduleName);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.sheetName);
    if (!sheet) return jsonResponse({ error: 'Gallery sheet not found', images: [], total: 0 });

    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow < 2 || lastCol < 1) return jsonResponse({ images: [], total: 0 });

    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var dataRows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

    // Parse images, skip rows with no image_url
    var images = [];
    for (var i = 0; i < dataRows.length; i++) {
      var row = dataRows[i];
      var parsed = parseRow(headers, row);
      if (!parsed.image_url && !parsed.title) continue; // skip empty rows
      images.push(parsed);
    }

    // Category filter (case-insensitive)
    if (p.category) {
      var cat = String(p.category).toLowerCase();
      images = images.filter(function(img) {
        return img.category && String(img.category).toLowerCase() === cat;
      });
    }

    // Featured filter
    if (p.featured === '1') {
      images = images.filter(function(img) { return img.featured === true; });
    }

    // Search by title/caption
    if (p.search) {
      var q = String(p.search).toLowerCase();
      images = images.filter(function(img) {
        return (img.title && String(img.title).toLowerCase().indexOf(q) !== -1)
          || (img.caption && String(img.caption).toLowerCase().indexOf(q) !== -1)
          || (img.alt && String(img.alt).toLowerCase().indexOf(q) !== -1);
      });
    }

    // Sort: by order field (nulls last), then original row order
    images.sort(function(a, b) {
      var aOrd = a.order !== null ? a.order : Infinity;
      var bOrd = b.order !== null ? b.order : Infinity;
      return aOrd - bOrd;
    });

    // Pagination
    var limit = Math.min(parseInt(p.limit) || 200, 500);
    var offset = parseInt(p.offset) || 0;
    var total = images.length;
    var paginated = images.slice(offset, offset + limit);

    return jsonResponse({ images: paginated, total: total });
  } catch (err) {
    return jsonResponse({ error: err.message, images: [], total: 0 });
  }
}

function jsonResponse(payload) {
  var output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
`;
}
