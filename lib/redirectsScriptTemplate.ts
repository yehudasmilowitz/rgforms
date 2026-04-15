import { WRITE_MANIFEST, htmlConfirmationBlock, JSON_RESPONSE_BLOCK } from '@/lib/core/scriptHelpers';

/** Redirects uses WRITE_MANIFEST because it increments the Clicks counter on each lookup. */
export const REDIRECTS_SCRIPT_MANIFEST = WRITE_MANIFEST;

export function generateRedirectsScript(moduleName: string): string {
  return `
var MODULE_NAME_ = ${JSON.stringify(moduleName)};
var TAB_NAME_    = 'Redirects';

${htmlConfirmationBlock('Redirects API', 'Redirects endpoint is live. Use ?slug=X to resolve a slug or ?list=true to list all.')}

${JSON_RESPONSE_BLOCK}

function doGet(e) {
  if (!e || !e.parameter || e.parameter.json !== '1') {
    if (!e || !e.parameter || (!e.parameter.slug && !e.parameter.list)) {
      return htmlConfirmation_();
    }
  }
  try {
    var ss     = SpreadsheetApp.getActiveSpreadsheet();
    var sheet  = ss.getSheetByName(TAB_NAME_);
    if (!sheet) return jsonResponse_({ error: 'Redirects sheet not found' });

    var data    = sheet.getDataRange().getValues();
    if (data.length < 2) return jsonResponse_({ redirects: [], total: 0, moduleName: MODULE_NAME_ });

    var headers  = data[0];
    var params   = e.parameter || {};

    // Build column index map
    var idx = {};
    for (var h = 0; h < headers.length; h++) {
      var key = String(headers[h]).trim().toLowerCase().replace(/\\s+/g, '_');
      idx[key] = h;
    }

    // Helper to read a cell value by key
    function col(row, k) { return idx[k] !== undefined ? row[idx[k]] : ''; }

    // ?slug=X — resolve a single slug and increment click count
    if (params.slug) {
      var slug = String(params.slug).toLowerCase().trim();
      for (var i = 1; i < data.length; i++) {
        var row      = data[i];
        var rowSlug  = String(col(row, 'slug') || '').toLowerCase().trim();
        var active   = col(row, 'active');
        var isActive = active === true || active === 'TRUE' || active === 'true';
        if (rowSlug === slug && isActive) {
          var dest = String(col(row, 'destination_url') || col(row, 'destination') || '').trim();
          if (!dest) return jsonResponse_({ error: 'Slug has no destination URL' });
          // Increment clicks
          if (idx['clicks'] !== undefined) {
            var clicksRaw = col(row, 'clicks');
            var clicks    = (clicksRaw !== '' && !isNaN(Number(clicksRaw))) ? Number(clicksRaw) : 0;
            sheet.getRange(i + 1, idx['clicks'] + 1).setValue(clicks + 1);
          }
          return jsonResponse_({ redirect: dest, slug: rowSlug, moduleName: MODULE_NAME_ });
        }
      }
      return jsonResponse_({ error: 'Slug not found or inactive', slug: slug });
    }

    // ?list=true — return all redirects
    var redirects = [];
    for (var j = 1; j < data.length; j++) {
      var r       = data[j];
      var rSlug   = String(col(r, 'slug') || '').trim();
      if (!rSlug) continue;
      var rActive  = col(r, 'active');
      var rClicks  = col(r, 'clicks');
      redirects.push({
        id:          String(j),
        slug:        rSlug,
        destination: String(col(r, 'destination_url') || col(r, 'destination') || '').trim(),
        active:      rActive === true || rActive === 'TRUE' || rActive === 'true',
        clicks:      (rClicks !== '' && !isNaN(Number(rClicks))) ? Number(rClicks) : 0,
      });
    }

    return jsonResponse_({ redirects: redirects, total: redirects.length, moduleName: MODULE_NAME_ });
  } catch (err) {
    return jsonResponse_({ error: err.message });
  }
}
`.trim();
}
