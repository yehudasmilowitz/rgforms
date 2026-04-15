import type { ContentModuleConfig } from '@/types';

// Manifest for content module scripts — read-only Sheet access, no email scope needed
export const CONTENT_SCRIPT_MANIFEST = {
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

export function generateContentScript(config: ContentModuleConfig, writeToken: string): string {
  const configJson = JSON.stringify({
    moduleName: config.name,
    sheetName: 'Content',
    slugField:      config.hasSlug      ? 'slug'      : '',
    publishedField: config.hasPublished ? 'published' : '',
    writeToken,
    fields: [
      ...config.fields.map((f) => ({ key: f.key, type: f.type })),
      ...(config.hasSlug      ? [{ key: 'slug',      type: 'text'    }] : []),
      ...(config.hasPublished ? [{ key: 'published',  type: 'boolean' }] : []),
    ],
  });

  return `var CONFIG = ${configJson};

// ─── Utilities ──────────────────────────────────────────────────────────────

function normalizeKey(h) {
  return String(h).trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
}

function coerce(value, type) {
  if (value === '' || value === null || value === undefined) return null;
  switch (type) {
    case 'number':    return isNaN(Number(value)) ? null : Number(value);
    case 'boolean':   return value === true || String(value).toUpperCase() === 'TRUE';
    case 'date':      return value instanceof Date ? value.toISOString() : String(value);
    case 'tags':      return String(value).split(',').map(function(t) { return t.trim(); }).filter(Boolean);
    default:          return String(value);
  }
}

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.sheetName);
}

function getHeaders(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) {
    return String(h).trim();
  });
}

function buildFieldMap() {
  var map = {};
  (CONFIG.fields || []).forEach(function(f) { map[f.key] = f.type; });
  return map;
}

function sheetToJson(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0].map(function(h) { return String(h).trim(); });
  var fieldMap = buildFieldMap();
  var SYSTEM = ['_id', '_created_at', '_updated_at'];
  return data.slice(1).filter(function(row) {
    return row.some(function(cell) { return cell !== '' && cell !== null && cell !== undefined; });
  }).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) {
      var key = normalizeKey(h);
      var type = fieldMap[key] || (SYSTEM.indexOf(key) > -1 ? 'text' : 'text');
      obj[key] = coerce(row[i], type);
    });
    return obj;
  });
}

function jsonResponse(payload) {
  var output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

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

// Apps Script doGet() responses automatically include Access-Control-Allow-Origin: *
// when deployed as ANYONE_ANONYMOUS. doPost() with form-encoded body (URLSearchParams)
// is a CORS "simple request" — no preflight OPTIONS check — so it works cross-origin
// without any extra headers. JSON Content-Type POST would fail; always use URLSearchParams.

// ─── Read API (doGet) ────────────────────────────────────────────────────────

function doGet(e) {
  var p = (e && e.parameter) ? e.parameter : {};
  if (!p.json) return htmlConfirmation(CONFIG.moduleName);
  try {
    var sheet = getSheet();
    if (!sheet) return jsonResponse({ error: 'Sheet not found', data: [] });
    var data = sheetToJson(sheet);

    // Filter to published records only (if enabled)
    if (CONFIG.publishedField) {
      data = data.filter(function(r) { return r[CONFIG.publishedField] === true; });
    }

    // Single item by slug
    if (p.slug && CONFIG.slugField) {
      var bySlug = null;
      for (var s = 0; s < data.length; s++) {
        if (data[s][CONFIG.slugField] === p.slug) { bySlug = data[s]; break; }
      }
      return jsonResponse({ data: bySlug });
    }

    // Single item by ID
    if (p._id) {
      var byId = null;
      for (var d = 0; d < data.length; d++) {
        if (data[d]['_id'] === p._id) { byId = data[d]; break; }
      }
      return jsonResponse({ data: byId });
    }

    // Filter by any column value
    var reserved = ['limit', 'offset', 'sort', 'order', 'slug', '_id'];
    Object.keys(p).forEach(function(key) {
      if (reserved.indexOf(key) > -1) return;
      var filterVal = String(p[key]).toLowerCase();
      data = data.filter(function(r) {
        var val = r[key];
        if (Array.isArray(val)) {
          return val.map(function(t) { return t.toLowerCase(); }).indexOf(filterVal) > -1;
        }
        return val !== null && String(val).toLowerCase() === filterVal;
      });
    });

    // Sort
    if (p.sort && data.length > 0 && data[0][p.sort] !== undefined) {
      var dir = p.order === 'asc' ? 1 : -1;
      data.sort(function(a, b) {
        if (a[p.sort] === null) return 1;
        if (b[p.sort] === null) return -1;
        return a[p.sort] > b[p.sort] ? dir : -dir;
      });
    }

    // Pagination
    var total = data.length;
    var limit = Math.min(parseInt(p.limit) || 100, 500);
    var offset = parseInt(p.offset) || 0;
    data = data.slice(offset, offset + limit);

    return jsonResponse({ data: data, total: total, limit: limit, offset: offset });
  } catch (err) {
    return jsonResponse({ error: err.message, data: [] });
  }
}

// ─── Write API (doPost) ──────────────────────────────────────────────────────

function doPost(e) {
  try {
    var p = (e && e.parameter) ? e.parameter : {};

    // Validate write token
    if (!CONFIG.writeToken || p._token !== CONFIG.writeToken) {
      return jsonResponse({ error: 'Unauthorized' });
    }

    var action = p._action;
    var sheet = getSheet();
    if (!sheet) return jsonResponse({ error: 'Sheet not found' });

    var payload = {};
    if (p._payload) {
      try { payload = JSON.parse(p._payload); } catch (pe) {
        return jsonResponse({ error: 'Invalid _payload JSON: ' + pe.message });
      }
    }

    if (action === 'create') {
      return handleCreate(sheet, payload);
    } else if (action === 'update') {
      if (!p._id) return jsonResponse({ error: 'Missing _id for update' });
      return handleUpdate(sheet, p._id, payload);
    } else if (action === 'delete') {
      if (!p._id) return jsonResponse({ error: 'Missing _id for delete' });
      return handleDelete(sheet, p._id);
    }

    return jsonResponse({ error: 'Unknown _action. Use create | update | delete' });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

// ─── Write handlers ──────────────────────────────────────────────────────────

function handleCreate(sheet, data) {
  var headers = getHeaders(sheet);
  var now = new Date().toISOString();
  var id = Utilities.getUuid();

  var row = headers.map(function(h) {
    var key = normalizeKey(h);
    if (key === '_id')         return id;
    if (key === '_created_at') return now;
    if (key === '_updated_at') return now;
    var val = data[key];
    if (val === undefined || val === null) return '';
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'boolean') return val.toString().toUpperCase();
    return String(val);
  });

  sheet.appendRow(row);

  var created = {};
  headers.forEach(function(h, i) { created[normalizeKey(h)] = row[i]; });
  return jsonResponse({ data: created });
}

function handleUpdate(sheet, id, data) {
  var headers = getHeaders(sheet);
  var allValues = sheet.getDataRange().getValues();

  var idColIndex = -1;
  headers.forEach(function(h, i) {
    if (normalizeKey(h) === '_id') idColIndex = i;
  });
  if (idColIndex === -1) return jsonResponse({ error: 'No _id column in sheet' });

  var rowIndex = -1;
  for (var i = 1; i < allValues.length; i++) {
    if (String(allValues[i][idColIndex]) === id) { rowIndex = i + 1; break; } // 1-indexed
  }
  if (rowIndex === -1) return jsonResponse({ error: 'Record not found: ' + id });

  var now = new Date().toISOString();
  var existing = allValues[rowIndex - 1];

  var updatedRow = headers.map(function(h, i) {
    var key = normalizeKey(h);
    if (key === '_id')         return id;
    if (key === '_updated_at') return now;
    if (key === '_created_at') return existing[i]; // preserve original
    if (data[key] !== undefined) {
      var val = data[key];
      if (Array.isArray(val)) return val.join(', ');
      if (typeof val === 'boolean') return val.toString().toUpperCase();
      return String(val);
    }
    return existing[i]; // preserve existing value if not in payload
  });

  sheet.getRange(rowIndex, 1, 1, updatedRow.length).setValues([updatedRow]);

  var updated = {};
  headers.forEach(function(h, i) { updated[normalizeKey(h)] = updatedRow[i]; });
  return jsonResponse({ data: updated });
}

function handleDelete(sheet, id) {
  var headers = getHeaders(sheet);
  var allValues = sheet.getDataRange().getValues();

  var idColIndex = -1;
  headers.forEach(function(h, i) {
    if (normalizeKey(h) === '_id') idColIndex = i;
  });
  if (idColIndex === -1) return jsonResponse({ error: 'No _id column in sheet' });

  var rowIndex = -1;
  for (var i = 1; i < allValues.length; i++) {
    if (String(allValues[i][idColIndex]) === id) { rowIndex = i + 1; break; }
  }
  if (rowIndex === -1) return jsonResponse({ error: 'Record not found: ' + id });

  sheet.deleteRow(rowIndex);
  return jsonResponse({ data: { deleted: true, _id: id } });
}
`;
}
