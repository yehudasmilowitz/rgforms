/**
 * Shared helpers for Apps Script code generation.
 *
 * Every module's Apps Script handler shares the same boilerplate:
 * - appsscript.json manifest
 * - htmlConfirmation() — shown on first GET before authorization
 * - jsonResponse() / corsResponse() — CORS-enabled JSON output
 *
 * Import these and compose your module's unique doGet/doPost logic on top.
 */

// ─── Manifest ─────────────────────────────────────────────────────────────────

interface Manifest {
  timeZone: string;
  dependencies: Record<string, unknown>;
  exceptionLogging: string;
  runtimeVersion: string;
  webapp: { executeAs: string; access: string };
  oauthScopes: string[];
}

/** Default manifest — uses spreadsheets.currentonly (container-bound, minimal scope). */
export const DEFAULT_MANIFEST: Manifest = {
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

/** Manifest variant that allows writing to the spreadsheet (needed for click-tracking, etc.). */
export const WRITE_MANIFEST: Manifest = {
  ...DEFAULT_MANIFEST,
  oauthScopes: [
    'https://www.googleapis.com/auth/spreadsheets',
  ],
};

// ─── Shared Apps Script code blocks ──────────────────────────────────────────
// These are template strings embedded into generated Apps Script source.

/**
 * The htmlConfirmation() function shown to users when they first open the
 * deployed URL to authorize it. Rendered as an HtmlService page.
 */
export function htmlConfirmationBlock(apiLabel: string, apiDescription: string): string {
  return `
function htmlConfirmation_() {
  var html = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1"><title>${apiLabel}</title>'
    + '<style>'
    + '@keyframes pop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}'
    + '@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}'
    + '@keyframes draw{to{stroke-dashoffset:0}}'
    + '*{box-sizing:border-box}'
    + 'body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;'
    + 'background:radial-gradient(ellipse at 50% 0%,#0d1f2d 0%,#050a10 70%);'
    + 'font-family:system-ui,-apple-system,sans-serif;color:#e2e8f0}'
    + '.card{text-align:center;padding:2.5rem 3rem;background:rgba(255,255,255,.04);'
    + 'border:1px solid rgba(255,255,255,.08);border-radius:20px;max-width:400px;width:90%;'
    + 'animation:rise .45s cubic-bezier(.22,1,.36,1) both}'
    + '.ic{width:68px;height:68px;border-radius:50%;'
    + 'background:linear-gradient(135deg,#041a0e,#083320);'
    + 'border:1px solid rgba(74,222,128,.25);'
    + 'display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;'
    + 'animation:pop .5s cubic-bezier(.34,1.56,.64,1) .15s both;'
    + 'box-shadow:0 0 32px rgba(74,222,128,.18),inset 0 1px 0 rgba(74,222,128,.1)}'
    + '.check{stroke-dasharray:30;stroke-dashoffset:30;animation:draw .35s ease .55s forwards}'
    + 'h1{margin:0 0 .5rem;font-size:1.3rem;font-weight:600;letter-spacing:-.02em}'
    + '.desc{margin:0 0 1.75rem;color:#94a3b8;font-size:.875rem;line-height:1.65}'
    + '.hint{font-size:.75rem;color:#3d5269;margin:0;'
    + 'border-top:1px solid rgba(255,255,255,.05);padding-top:1.25rem}'
    + '</style></head><body><div class="card"><div class="ic">'
    + '<svg width="30" height="30" viewBox="0 0 24 24" fill="none">'
    + '<path class="check" d="M5 13l4 4L19 7" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
    + '</svg></div>'
    + '<h1>${apiLabel} is authorized</h1>'
    + '<p class="desc">${apiDescription}</p>'
    + '<p class="hint">Authorization complete — you can close this tab.</p>'
    + '</div></body></html>';
  return HtmlService.createHtmlOutput(html);
}
`.trim();
}

/**
 * The jsonResponse() helper used to return CORS-enabled JSON from doGet/doPost.
 * Paste this into generated scripts so they can call jsonResponse_(payload).
 */
export const JSON_RESPONSE_BLOCK = `
function jsonResponse_(payload) {
  var output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
`.trim();

/**
 * A standard doGet guard: if the request isn't a JSON request (no ?json=1),
 * return the HTML confirmation page. Otherwise run the handler.
 * Usage: embed this pattern in the generated doGet().
 */
export function doGetGuardBlock(): string {
  return `
  if (!e || !e.parameter || e.parameter.json !== '1') {
    return htmlConfirmation_();
  }
`.trim();
}

/**
 * Standard row-to-object parser for read-only GET APIs.
 * Maps sheet column headers to camelCase keys.
 * Handles boolean columns (pass an array of column keys that should be bool).
 * Handles numeric columns (pass an array of column keys that should be number).
 */
export function rowParserBlock(
  booleanKeys: string[] = [],
  numericKeys: string[] = [],
): string {
  const boolSet = JSON.stringify(booleanKeys);
  const numSet  = JSON.stringify(numericKeys);
  return `
function parseRow_(headers, row) {
  var BOOL_KEYS = ${boolSet};
  var NUM_KEYS  = ${numSet};
  var obj = { id: '' };
  for (var j = 0; j < headers.length; j++) {
    var rawKey = headers[j];
    if (!rawKey) continue;
    var key = String(rawKey).toLowerCase().replace(/\\s+/g, '_');
    var val  = row[j];
    if (BOOL_KEYS.indexOf(key) !== -1) {
      val = val === true || val === 'TRUE' || val === 'true';
    } else if (NUM_KEYS.indexOf(key) !== -1) {
      val = (val !== '' && val !== null && val !== undefined && !isNaN(Number(val))) ? Number(val) : null;
    } else {
      val = (val !== null && val !== undefined) ? String(val) : '';
    }
    obj[key] = val;
  }
  return obj;
}
`.trim();
}

// ─── Convenience: build a complete read-only GET script ───────────────────────

export interface GetScriptOptions {
  /** Human label for the HTML confirmation page (e.g. "My Gallery API") */
  apiLabel: string;
  /** Short description for the confirmation page */
  apiDescription: string;
  /** Name of the tab to read (e.g. "Gallery") */
  tabName: string;
  /** Apps Script variable name for the result array (e.g. "images", "faqs") */
  arrayKey: string;
  /** Module name variable (injected from TypeScript at code-gen time) */
  moduleName: string;
  /** Keys that should be parsed as booleans */
  booleanKeys?: string[];
  /** Keys that should be parsed as numbers */
  numericKeys?: string[];
  /**
   * Custom filter logic injected into the doGet function.
   * Receives `e.parameter` as `params` and the parsed object as `item`.
   * Should return Apps Script code (as a string) that returns true to include the row.
   * Example: "if (params.category && item.category.toLowerCase() !== params.category.toLowerCase()) return false;"
   */
  filterLogic?: string;
  /**
   * Custom sort logic — Apps Script code string.
   * Example: "result.sort(function(a, b) { return (a.order || 999) - (b.order || 999); });"
   */
  sortLogic?: string;
  /** Any extra keys to include in the response root object besides arrayKey and total */
  extraResponseFields?: string;
}

/**
 * Generate a complete read-only GET Apps Script handler.
 * This covers 90% of module types — only write the unique parts via the options.
 */
export function generateReadOnlyScript(opts: GetScriptOptions): string {
  const {
    apiLabel,
    apiDescription,
    tabName,
    arrayKey,
    moduleName,
    booleanKeys = [],
    numericKeys  = [],
    filterLogic  = '',
    sortLogic    = '',
    extraResponseFields = '',
  } = opts;

  return `
var MODULE_NAME_ = ${JSON.stringify(moduleName)};
var TAB_NAME_    = ${JSON.stringify(tabName)};

${htmlConfirmationBlock(apiLabel, apiDescription)}

${JSON_RESPONSE_BLOCK}

${rowParserBlock(booleanKeys, numericKeys)}

function doGet(e) {
  if (!e || !e.parameter || e.parameter.json !== '1') {
    return htmlConfirmation_();
  }
  try {
    var ss      = SpreadsheetApp.getActiveSpreadsheet();
    var sheet   = ss.getSheetByName(TAB_NAME_);
    if (!sheet) return jsonResponse_({ error: 'Sheet not found', tab: TAB_NAME_ });

    var data    = sheet.getDataRange().getValues();
    if (data.length < 2) return jsonResponse_({ ${arrayKey}: [], total: 0, moduleName: MODULE_NAME_ });

    var headers = data[0];
    var params  = e.parameter || {};
    var result  = [];

    for (var i = 1; i < data.length; i++) {
      var item = parseRow_(headers, data[i]);
      item.id  = String(i);
      var skip = false;
      ${filterLogic}
      if (!skip) result.push(item);
    }

    ${sortLogic || `// default: sheet order`}

    var limit = params.limit ? parseInt(params.limit, 10) : 0;
    if (limit > 0) result = result.slice(0, limit);

    return jsonResponse_({ ${arrayKey}: result, total: result.length, moduleName: MODULE_NAME_${extraResponseFields ? ', ' + extraResponseFields : ''} });
  } catch (err) {
    return jsonResponse_({ error: err.message });
  }
}
`.trim();
}
