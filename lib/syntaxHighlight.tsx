/**
 * Lightweight syntax highlighter for HTML (with embedded JS) and JS/TS code.
 * Zero dependencies — returns an array of {text, color} tokens.
 */

export type Token = { text: string; color: string };

// GitHub-dark inspired token colors
const C = {
  default:  '#e6edf3',
  tag:      '#7ee787',   // green — HTML tag names
  attr:     '#e3b341',   // yellow — attribute names
  attrVal:  '#a5d6ff',   // light blue — attribute values / strings
  comment:  '#8b949e',   // gray
  keyword:  '#ff7b72',   // red — JS keywords
  string:   '#a5d6ff',   // light blue — JS strings
  builtin:  '#d2a8ff',   // purple — built-in identifiers
  number:   '#79c0ff',   // blue — numbers
  punct:    '#e6edf3',   // default — punctuation
};

const JS_KEYWORDS = new Set([
  'function', 'var', 'let', 'const', 'return', 'if', 'else', 'new', 'this',
  'typeof', 'instanceof', 'try', 'catch', 'finally', 'throw', 'async', 'await',
  'class', 'extends', 'import', 'export', 'default', 'from', 'true', 'false',
  'null', 'undefined', 'void', 'in', 'of', 'for', 'while', 'do', 'switch',
  'case', 'break', 'continue', 'type', 'interface', 'ref', 'setup',
]);

const JS_BUILTINS = new Set([
  'document', 'window', 'fetch', 'JSON', 'FormData', 'URLSearchParams',
  'console', 'Promise', 'Object', 'Array', 'String', 'Number', 'Boolean',
  'Error', 'alert', 'setTimeout', 'clearTimeout', 'React', 'useState',
  'useEffect', 'Component', 'HttpClient', 'CommonModule',
]);

// ---------------------------------------------------------------------------
// JS / TS tokenizer
// ---------------------------------------------------------------------------

export function tokenizeJS(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // Single-line comment
    if (code.startsWith('//', i)) {
      const end = code.indexOf('\n', i);
      const slice = end === -1 ? code.slice(i) : code.slice(i, end);
      tokens.push({ text: slice, color: C.comment });
      i += slice.length;
      continue;
    }

    // Multi-line comment
    if (code.startsWith('/*', i)) {
      const end = code.indexOf('*/', i + 2);
      const slice = end === -1 ? code.slice(i) : code.slice(i, end + 2);
      tokens.push({ text: slice, color: C.comment });
      i += slice.length;
      continue;
    }

    // Template literal (backtick)
    if (code[i] === '`') {
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === '\\') { j += 2; continue; }
        if (code[j] === '`') { j++; break; }
        j++;
      }
      tokens.push({ text: code.slice(i, j), color: C.string });
      i = j;
      continue;
    }

    // String literal
    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === '\\') { j += 2; continue; }
        if (code[j] === quote) { j++; break; }
        j++;
      }
      tokens.push({ text: code.slice(i, j), color: C.string });
      i = j;
      continue;
    }

    // Number
    if (/[0-9]/.test(code[i])) {
      const m = code.slice(i).match(/^[0-9]+(\.[0-9]+)?/);
      if (m) {
        tokens.push({ text: m[0], color: C.number });
        i += m[0].length;
        continue;
      }
    }

    // Identifier / keyword / builtin
    if (/[a-zA-Z_$]/.test(code[i])) {
      const m = code.slice(i).match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
      if (m) {
        const word = m[0];
        const color = JS_KEYWORDS.has(word) ? C.keyword
          : JS_BUILTINS.has(word) ? C.builtin
          : C.default;
        tokens.push({ text: word, color });
        i += word.length;
        continue;
      }
    }

    tokens.push({ text: code[i], color: C.default });
    i++;
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// HTML tokenizer (handles embedded <script> sections via tokenizeJS)
// ---------------------------------------------------------------------------

function tokenizeAttributes(chunk: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < chunk.length) {
    // Whitespace
    const ws = chunk.slice(i).match(/^[\s]+/);
    if (ws) {
      tokens.push({ text: ws[0], color: C.default });
      i += ws[0].length;
      continue;
    }

    // Attribute name
    const name = chunk.slice(i).match(/^[a-zA-Z_:@.#][a-zA-Z0-9_:\-.@]*/);
    if (name) {
      tokens.push({ text: name[0], color: C.attr });
      i += name[0].length;

      if (chunk[i] === '=') {
        tokens.push({ text: '=', color: C.punct });
        i++;

        if (chunk[i] === '"' || chunk[i] === "'") {
          const q = chunk[i];
          const end = chunk.indexOf(q, i + 1);
          const slice = end === -1 ? chunk.slice(i) : chunk.slice(i, end + 1);
          tokens.push({ text: slice, color: C.attrVal });
          i += slice.length;
        } else {
          const val = chunk.slice(i).match(/^[^\s>\/]*/);
          if (val) {
            tokens.push({ text: val[0], color: C.attrVal });
            i += val[0].length;
          }
        }
      }
      continue;
    }

    tokens.push({ text: chunk[i], color: C.default });
    i++;
  }

  return tokens;
}

export function tokenizeHTML(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // Embedded <script> — tokenize body as JS
    if (code.startsWith('<script', i) || code.startsWith('<style', i)) {
      const isScript = code[i + 1] === 's' && code[i + 2] === 'c';
      const tagName = isScript ? 'script' : 'style';
      const tagEnd = code.indexOf('>', i);
      if (tagEnd !== -1) {
        // Opening tag
        tokens.push({ text: '<', color: C.punct });
        tokens.push({ text: tagName, color: C.tag });
        const attrChunk = code.slice(i + 1 + tagName.length, tagEnd);
        tokens.push(...tokenizeAttributes(attrChunk));
        tokens.push({ text: '>', color: C.punct });
        i = tagEnd + 1;

        // Body
        const closeTag = `</${tagName}>`;
        const bodyEnd = code.indexOf(closeTag, i);
        if (bodyEnd === -1) {
          tokens.push(...(isScript ? tokenizeJS(code.slice(i)) : [{ text: code.slice(i), color: C.string }]));
          i = code.length;
        } else {
          tokens.push(...(isScript ? tokenizeJS(code.slice(i, bodyEnd)) : [{ text: code.slice(i, bodyEnd), color: C.string }]));
          tokens.push({ text: '</', color: C.punct });
          tokens.push({ text: tagName, color: C.tag });
          tokens.push({ text: '>', color: C.punct });
          i = bodyEnd + closeTag.length;
        }
      }
      continue;
    }

    // HTML comment
    if (code.startsWith('<!--', i)) {
      const end = code.indexOf('-->', i);
      const slice = end === -1 ? code.slice(i) : code.slice(i, end + 3);
      tokens.push({ text: slice, color: C.comment });
      i += slice.length;
      continue;
    }

    // Closing tag
    if (code.startsWith('</', i)) {
      tokens.push({ text: '</', color: C.punct });
      i += 2;
      const m = code.slice(i).match(/^[a-zA-Z][a-zA-Z0-9]*/);
      if (m) { tokens.push({ text: m[0], color: C.tag }); i += m[0].length; }
      if (code[i] === '>') { tokens.push({ text: '>', color: C.punct }); i++; }
      continue;
    }

    // Opening tag
    if (code[i] === '<' && /[a-zA-Z!]/.test(code[i + 1] ?? '')) {
      tokens.push({ text: '<', color: C.punct });
      i++;
      const m = code.slice(i).match(/^[a-zA-Z][a-zA-Z0-9]*/);
      if (m) { tokens.push({ text: m[0], color: C.tag }); i += m[0].length; }

      // Collect attribute region until > or />
      let attrChunk = '';
      while (i < code.length && code[i] !== '>' && !(code[i] === '/' && code[i + 1] === '>')) {
        attrChunk += code[i++];
      }
      tokens.push(...tokenizeAttributes(attrChunk));

      if (code.startsWith('/>', i)) {
        tokens.push({ text: '/>', color: C.punct });
        i += 2;
      } else if (code[i] === '>') {
        tokens.push({ text: '>', color: C.punct });
        i++;
      }
      continue;
    }

    // Plain text
    const text = code.slice(i).match(/^[^<]*/);
    if (text && text[0]) {
      tokens.push({ text: text[0], color: C.default });
      i += text[0].length;
    } else {
      tokens.push({ text: code[i], color: C.default });
      i++;
    }
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Vue SFC tokenizer — template as HTML, script section as JS
// ---------------------------------------------------------------------------

export function tokenizeVue(code: string): Token[] {
  // Vue SFCs are HTML-like at the top level; reuse the HTML tokenizer
  // which already handles <script> blocks as JS.
  return tokenizeHTML(code);
}
