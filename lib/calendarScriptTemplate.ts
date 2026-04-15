export const CALENDAR_SCRIPT_MANIFEST = {
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

export function generateCalendarScript(moduleName: string): string {
  return `var CONFIG = ${JSON.stringify({ moduleName, sheetName: 'Events' })};

function htmlConfirmation(name) {
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1"><title>Authorized</title>'
    + '<style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;'
    + 'justify-content:center;background:#0a0a0f;font-family:system-ui,sans-serif;color:#e2e8f0}'
    + '.c{text-align:center;padding:2rem}.ic{width:56px;height:56px;border-radius:50%;background:#1e1b4b;'
    + 'display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem}'
    + 'h1{margin:0 0 .5rem;font-size:1.2rem;font-weight:600}p{margin:0;color:#94a3b8;font-size:.875rem;line-height:1.5}'
    + '</style></head><body><div class="c"><div class="ic">'
    + '<svg width="28" height="28" viewBox="0 0 24 24" fill="none">'
    + '<path d="M5 13l4 4L19 7" stroke="#818cf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
    + '</svg></div><h1>' + name + ' is authorized</h1>'
    + '<p>Calendar endpoint is live and ready to use.<br>Append ?json=1 to fetch events.</p>'
    + '</div></body></html>';
  return HtmlService.createHtmlOutput(html);
}

function parseRow(headers, row) {
  var event = {};
  for (var j = 0; j < headers.length; j++) {
    var rawKey = headers[j];
    if (!rawKey) continue;
    var key = String(rawKey).toLowerCase().replace(/\\s+/g, '_');
    var val = row[j];
    // Normalize dates (Sheets may return Date objects)
    if (val instanceof Date) {
      val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    } else if (key === 'all_day') {
      val = val === true || val === 'TRUE' || val === 'true';
    } else if (typeof val === 'number') {
      val = val; // keep number
    } else {
      val = val !== null && val !== undefined ? String(val) : '';
    }
    event[key] = val;
  }
  return event;
}

function doGet(e) {
  var p = (e && e.parameter) ? e.parameter : {};
  if (!p.json) return htmlConfirmation(CONFIG.moduleName);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.sheetName);
    if (!sheet) return jsonResponse({ error: 'Events sheet not found', events: [], total: 0 });

    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow < 2 || lastCol < 1) return jsonResponse({ events: [], total: 0 });

    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var dataRows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

    // Parse all events, skip empty rows
    var events = [];
    for (var i = 0; i < dataRows.length; i++) {
      var row = dataRows[i];
      if (!row[0] && !row[1]) continue;
      events.push(parseRow(headers, row));
    }

    // Get today as YYYY-MM-DD string
    var todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

    var all = p.all === '1';
    var past = p.past === '1';

    // Default: upcoming events only
    if (!all) {
      events = events.filter(function(ev) {
        if (!ev.date) return !past; // undated events show in upcoming, not past
        return past ? ev.date < todayStr : ev.date >= todayStr;
      });
    }

    // Date range filters
    if (p.from) {
      events = events.filter(function(ev) { return !ev.date || ev.date >= p.from; });
    }
    if (p.to) {
      events = events.filter(function(ev) { return !ev.date || ev.date <= p.to; });
    }

    // Category filter (case-insensitive)
    if (p.category) {
      var cat = String(p.category).toLowerCase();
      events = events.filter(function(ev) {
        return ev.category && String(ev.category).toLowerCase() === cat;
      });
    }

    // Sort by date
    events.sort(function(a, b) {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      if (a.date < b.date) return past ? 1 : -1;
      if (a.date > b.date) return past ? -1 : 1;
      // Same date: sort by start_time
      if (a.start_time && b.start_time) return a.start_time < b.start_time ? -1 : 1;
      return 0;
    });

    // Pagination
    var limit = Math.min(parseInt(p.limit) || 100, 500);
    var offset = parseInt(p.offset) || 0;
    var total = events.length;
    var paginated = events.slice(offset, offset + limit);

    return jsonResponse({ events: paginated, total: total });
  } catch (err) {
    return jsonResponse({ error: err.message, events: [], total: 0 });
  }
}

function jsonResponse(payload) {
  var output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
`;
}
