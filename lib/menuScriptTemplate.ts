export const MENU_SCRIPT_MANIFEST = {
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

export function generateMenuScript(moduleName: string): string {
  return `var CONFIG = ${JSON.stringify({ moduleName, sheetName: 'Menu' })};

function corsResponse(payload) {
  var output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function doGet(e) {
  var p = (e && e.parameter) ? e.parameter : {};

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.sheetName);
    if (!sheet) return corsResponse({ error: 'Menu sheet not found', items: [], total: 0 });

    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow < 2 || lastCol < 1) return corsResponse({ items: [], total: 0, moduleName: CONFIG.moduleName });

    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var dataRows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

    // Build column index map
    var idx = {};
    for (var h = 0; h < headers.length; h++) {
      var key = String(headers[h]).trim().toLowerCase().replace(/\\s+/g, '_');
      idx[key] = h;
    }

    var items = [];
    for (var i = 0; i < dataRows.length; i++) {
      var row = dataRows[i];
      var name = idx['name'] !== undefined ? String(row[idx['name']] || '').trim() : '';
      if (!name) continue; // skip empty rows

      var priceRaw = idx['price'] !== undefined ? row[idx['price']] : '';
      var price = priceRaw !== '' && !isNaN(Number(priceRaw)) ? Number(priceRaw) : 0;

      var availableRaw = idx['available'] !== undefined ? row[idx['available']] : '';
      var available = availableRaw === true || availableRaw === 'TRUE' || availableRaw === 'true';

      var orderRaw = idx['order'] !== undefined ? row[idx['order']] : '';
      var order = orderRaw !== '' && !isNaN(Number(orderRaw)) ? Number(orderRaw) : 9999;

      items.push({
        id: String(i + 2), // row number as id
        name: name,
        description: idx['description'] !== undefined ? String(row[idx['description']] || '').trim() : '',
        price: price,
        category: idx['category'] !== undefined ? String(row[idx['category']] || '').trim() : '',
        imageUrl: idx['image_url'] !== undefined ? String(row[idx['image_url']] || '').trim() : '',
        available: available,
        order: order
      });
    }

    // Filter by category (case-insensitive)
    if (p.category) {
      var cat = String(p.category).toLowerCase();
      items = items.filter(function(item) {
        return item.category && item.category.toLowerCase() === cat;
      });
    }

    // Filter by available=true
    if (p.available === 'true') {
      items = items.filter(function(item) { return item.available === true; });
    }

    // Sort by order ascending
    items.sort(function(a, b) { return a.order - b.order; });

    return corsResponse({ items: items, total: items.length, moduleName: CONFIG.moduleName });
  } catch (err) {
    return corsResponse({ error: err.message, items: [], total: 0 });
  }
}
`;
}
