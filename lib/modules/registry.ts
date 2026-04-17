import { DEFAULT_MANIFEST, WRITE_MANIFEST } from '@/lib/core/scriptHelpers';
import { MENU_SCRIPT_MANIFEST, generateMenuScript } from '@/lib/menuScriptTemplate';
import { NEWSLETTER_SCRIPT_MANIFEST, generateNewsletterScript } from '@/lib/newsletterScriptTemplate';
import { REDIRECTS_SCRIPT_MANIFEST, generateRedirectsScript } from '@/lib/redirectsScriptTemplate';
import type { ModuleDef, ModuleRegistry } from './types';

// Suppress unused-import warnings — WRITE_MANIFEST is available for future modules
void WRITE_MANIFEST;

export const MODULE_REGISTRY: ModuleRegistry = {

  // ─── Testimonial ────────────────────────────────────────────────────────────
  testimonial: {
    type: 'testimonial',
    label: 'Testimonials',
    noun: 'testimonials',

    builderTitle: 'New testimonials module',
    builderDescription:
      'A Google Sheet becomes your testimonials registry. Add customer quotes, ratings, and author details — they appear in your testimonials API instantly.',
    builderFeatures: [
      'A Google Sheet with a Testimonials tab pre-seeded with sample rows',
      'An Apps Script web app that serves testimonials as a JSON API',
      'Filter by featured status or limit results by count',
    ],
    builderTip:
      'Use the Featured column to highlight your best testimonials. Fetch only featured ones with <code class="mx-1 font-mono">?featured=true</code> for a hero section or spotlight widget.',
    builderInputHint: 'Creates a sheet named \u201c[name] \u2014 RG Testimonials\u201d.',
    builderButtonLabel: 'Create testimonials module',

    steps: [
      { id: 'sheet',  label: 'Creating Testimonials spreadsheet', description: 'Setting up your testimonials registry',      scopes: [{ label: 'drive.file' }] },
      { id: 'script', label: 'Creating Apps Script',              description: 'Initializing the testimonials API',          scopes: [{ label: 'script.projects', sensitive: true }] },
      { id: 'code',   label: 'Uploading handler code',            description: 'Writing the doGet() testimonials handler',   scopes: [{ label: 'script.projects', sensitive: true }] },
      { id: 'deploy', label: 'Publishing API endpoint',           description: 'Making your testimonials endpoint live',     scopes: [{ label: 'script.deployments', sensitive: true }] },
    ],

    sheetSuffix: 'RG Testimonials',
    tabName: 'Testimonials',
    sampleRows: [
      ['Author', 'Quote', 'Role', 'Company', 'Photo URL', 'Rating', 'Featured', 'Order'],
      ['Jane Smith',    'This product completely changed how we work. Highly recommend to anyone!', 'CEO',                'Acme Corp', '', '5', 'TRUE',  '1'],
      ['John Doe',      'Outstanding support and a beautiful product. Our team loves it.',          'Product Manager',    'Beta LLC',  '', '4', 'FALSE', '2'],
      ['Sarah Johnson', 'Simple to set up and incredibly powerful. Worth every penny.',             'Freelance Designer', '',          '', '5', 'TRUE',  '3'],
    ],

    scriptSuffix: 'Testimonials API',
    script: {
      mode: 'readonly',
      apiLabel: 'Testimonials API',
      apiDescription: 'Testimonials endpoint is live. Append ?json=1 to fetch data.',
      arrayKey: 'testimonials',
      booleanKeys: ['featured'],
      numericKeys: ['rating', 'order'],
      filterLogic: `if (params.featured === 'true' || params.featured === '1') { if (!item.featured) skip = true; }`,
      sortLogic: `result.sort(function(a, b) { var aOrd = a.order !== null && a.order !== undefined ? a.order : Infinity; var bOrd = b.order !== null && b.order !== undefined ? b.order : Infinity; return aOrd - bOrd; });`,
    },

    resultHeadingLabel: 'testimonials is live',
    resultSubtitle: 'Your testimonials module is ready. Add customer quotes to the Sheet to populate it.',
    resultCompletedItems: [
      'Google Sheet created with Testimonials tab and sample rows',
      'Apps Script deployed as a public testimonials API',
      'Add quotes to the sheet — they appear in the API immediately',
    ],
    resultEndpointHint:
      'Append ?json=1 for all testimonials. Add ?featured=true to fetch only featured, or ?limit=N to cap results.',
    resultSheetLinkLabel: 'Open Testimonials Sheet',
    resultNewButtonLabel: 'New testimonials module',
    resultCodeSnippets: (deploymentUrl, moduleName) => [
      {
        label: 'fetch examples',
        language: 'js',
        content: `// Fetch all testimonials
const res = await fetch('${deploymentUrl}?json=1');
const { testimonials, total, moduleName } = await res.json();

// Fetch only featured testimonials
const featured = await fetch('${deploymentUrl}?json=1&featured=true');
const { testimonials: featuredList } = await featured.json();

// Limit results
const limited = await fetch('${deploymentUrl}?json=1&limit=5');`,
        hint: 'Safe for public client-side code. Supports all, featured, and limit queries.',
      },
      {
        label: 'Response shape',
        language: 'js',
        content: `// Response shape
{
  testimonials: [
    {
      id: 1,
      author: "Jane Smith",
      quote: "This product completely changed how we work.",
      role: "CEO",
      company: "Acme Corp",
      photo_url: "",     // optional photo URL
      rating: 5,         // number 1–5 (or null if empty)
      featured: true,    // boolean
      order: 1           // sort order (or null if empty)
    }
  ],
  total: 3,
  moduleName: "${moduleName}"
}`,
        hint: 'Each row in the Testimonials sheet becomes one testimonial object. Add columns to extend the schema.',
      },
    ],
  } satisfies ModuleDef,

  // ─── FAQ ────────────────────────────────────────────────────────────────────
  faq: {
    type: 'faq',
    label: 'FAQ',
    noun: 'faqs',

    builderTitle: 'New FAQ module',
    builderDescription:
      'A Google Sheet becomes your FAQ registry. Add questions and answers to the sheet and they appear in your FAQ API instantly — no redeploys needed.',
    builderFeatures: [
      'A Google Sheet with an FAQ tab pre-seeded with sample questions',
      'An Apps Script web app that serves FAQs as a JSON API',
      'Filter by category or toggle active/inactive entries',
    ],
    builderTip:
      'Use the Active column to hide FAQs without deleting them. Set Active to FALSE to pull an entry offline instantly without touching your code.',
    builderInputHint: 'Creates a sheet named \u201c[name] \u2014 RG FAQ\u201d.',
    builderButtonLabel: 'Create FAQ module',

    steps: [
      { id: 'sheet',  label: 'Creating FAQ spreadsheet', description: 'Setting up your FAQ registry',      scopes: [{ label: 'drive.file' }] },
      { id: 'script', label: 'Creating Apps Script',     description: 'Initializing the FAQ API',          scopes: [{ label: 'script.projects', sensitive: true }] },
      { id: 'code',   label: 'Uploading handler code',   description: 'Writing the doGet() FAQ handler',   scopes: [{ label: 'script.projects', sensitive: true }] },
      { id: 'deploy', label: 'Publishing API endpoint',  description: 'Making your FAQ endpoint live',     scopes: [{ label: 'script.deployments', sensitive: true }] },
    ],

    sheetSuffix: 'RG FAQ',
    tabName: 'FAQ',
    sampleRows: [
      ['Question', 'Answer', 'Category', 'Order', 'Active'],
      ['What is your return policy?',    'We offer a 30-day no-questions-asked return policy on all items.',        'Shipping & Returns', '1', 'TRUE'],
      ['How long does shipping take?',   'Standard shipping takes 3-5 business days. Expedited options available.',  'Shipping & Returns', '2', 'TRUE'],
      ['Do you offer customer support?', 'Yes! Our support team is available Monday\u2013Friday, 9am\u20135pm EST.', 'Support',            '3', 'TRUE'],
    ],

    scriptSuffix: 'FAQ API',
    script: {
      mode: 'readonly',
      apiLabel: 'FAQ API',
      apiDescription: 'FAQ endpoint is live. Append ?json=1 to fetch FAQs.',
      arrayKey: 'faqs',
      booleanKeys: ['active'],
      numericKeys: ['order'],
      filterLogic: `var showActive = params.active !== 'false'; if (showActive && !item.active) { skip = true; } if (!skip && params.category) { var cat = String(params.category).toLowerCase(); if (!item.category || String(item.category).toLowerCase() !== cat) skip = true; }`,
      sortLogic: `result.sort(function(a, b) { var aOrd = a.order !== null && a.order !== undefined ? a.order : Infinity; var bOrd = b.order !== null && b.order !== undefined ? b.order : Infinity; return aOrd - bOrd; });`,
    },

    resultHeadingLabel: 'FAQ is live',
    resultSubtitle: 'Your FAQ module is ready. Add questions and answers to the Sheet to populate it.',
    resultCompletedItems: [
      'Google Sheet created with FAQ tab and sample questions',
      'Apps Script deployed as a public FAQ API',
      'Add Q&As to the sheet — they appear in the API immediately',
    ],
    resultEndpointHint:
      'Append ?json=1 for all active FAQs. Add ?category=X to filter by category, or ?active=false to include inactive entries.',
    resultSheetLinkLabel: 'Open FAQ Sheet',
    resultNewButtonLabel: 'New FAQ module',
    resultCodeSnippets: (deploymentUrl, moduleName) => [
      {
        label: 'fetch examples',
        language: 'js',
        content: `// Fetch all active FAQs
const res = await fetch('${deploymentUrl}?json=1');
const { faqs, total, moduleName } = await res.json();

// Filter by category
const shipping = await fetch('${deploymentUrl}?json=1&category=Shipping+%26+Returns');
const { faqs: shippingFaqs } = await shipping.json();

// Include inactive entries
const all = await fetch('${deploymentUrl}?json=1&active=false');`,
        hint: 'Safe for public client-side code. Supports all, category, and active filter queries.',
      },
      {
        label: 'Response shape',
        language: 'js',
        content: `// Response shape
{
  faqs: [
    {
      id: 1,
      question: "What is your return policy?",
      answer: "We offer a 30-day no-questions-asked return policy.",
      category: "Shipping & Returns",
      order: 1,       // sort order (or null if empty)
      active: true    // boolean — only active=true rows returned by default
    }
  ],
  total: 3,
  moduleName: "${moduleName}"
}`,
        hint: 'Each row in the FAQ sheet becomes one FAQ object. Add columns to extend the schema.',
      },
    ],
  } satisfies ModuleDef,

  // ─── Menu ────────────────────────────────────────────────────────────────────
  menu: {
    type: 'menu',
    label: 'Menu',
    noun: 'menu items',

    builderTitle: 'New menu',
    builderDescription:
      'A Google Sheet becomes your menu or product catalog. Add items to the sheet and they appear in your API instantly — filter by category or availability.',
    builderFeatures: [
      'A Google Sheet with a Menu tab pre-seeded with sample items',
      'An Apps Script web app that serves menu items as a JSON API',
      'Filter by category or availability — sorted by order field',
    ],
    builderTip:
      'Works for any catalog \u2014 restaurant menus, product listings, service packages. Set <strong>Available</strong> to FALSE to hide items without deleting them.',
    builderInputHint: 'Creates a sheet named \u201c[name] \u2014 RG Menu\u201d.',
    builderButtonLabel: 'Create menu',

    steps: [
      { id: 'sheet',  label: 'Creating Menu spreadsheet', description: 'Setting up your menu registry',     scopes: [{ label: 'drive.file' }] },
      { id: 'script', label: 'Creating Apps Script',       description: 'Initializing the menu API',        scopes: [{ label: 'script.projects', sensitive: true }] },
      { id: 'code',   label: 'Uploading handler code',     description: 'Writing the doGet() menu handler', scopes: [{ label: 'script.projects', sensitive: true }] },
      { id: 'deploy', label: 'Publishing API endpoint',    description: 'Making your menu endpoint live',   scopes: [{ label: 'script.deployments', sensitive: true }] },
    ],

    sheetSuffix: 'RG Menu',
    tabName: 'Menu',
    sampleRows: [
      ['Name', 'Description', 'Price', 'Category', 'Image URL', 'Available', 'Order'],
      ['Margherita Pizza',    'Classic tomato sauce, fresh mozzarella, and basil on a hand-tossed crust',       '12.99', 'Pizza',    '', 'TRUE', '1'],
      ['Caesar Salad',        'Crisp romaine lettuce, parmesan, croutons, and house caesar dressing',           '9.50',  'Salads',   '', 'TRUE', '2'],
      ['Chocolate Lava Cake', 'Warm chocolate cake with a gooey molten center, served with vanilla ice cream', '7.99',  'Desserts', '', 'TRUE', '3'],
    ],

    scriptSuffix: 'Menu API',
    script: {
      mode: 'custom',
      generate: generateMenuScript,
      manifest: MENU_SCRIPT_MANIFEST,
    },

    resultHeadingLabel: 'menu is live',
    resultSubtitle: 'Your menu module is ready. Edit items directly in the Google Sheet.',
    resultCompletedItems: [
      'Google Sheet created with Menu tab and sample items',
      'Apps Script deployed as a public menu API',
      'Filter by category or availability — items sorted by order',
    ],
    resultEndpointHint:
      'Returns { items, total, moduleName }. Add ?category=X or ?available=true to filter.',
    resultSheetLinkLabel: 'Open Menu Sheet',
    resultNewButtonLabel: 'New menu',
    resultCodeSnippets: (deploymentUrl, _moduleName) => [
      {
        label: 'fetch-menu.js',
        language: 'js',
        content: `// Fetch all menu items
const res = await fetch('${deploymentUrl}');
const { items, total } = await res.json();

// Filter by category
const pizzas = await fetch('${deploymentUrl}?category=Pizza')
  .then(r => r.json());

// Only available items
const available = await fetch('${deploymentUrl}?available=true')
  .then(r => r.json());`,
      },
    ],
  } satisfies ModuleDef,

  // ─── Newsletter ──────────────────────────────────────────────────────────────
  newsletter: {
    type: 'newsletter',
    label: 'Newsletter',
    noun: 'subscribers',

    builderTitle: 'New newsletter',
    builderDescription:
      'A Google Sheet becomes your subscriber list. POST to subscribe, use the unsubscribe token to let readers opt out — no third-party service required.',
    builderFeatures: [
      'A Google Sheet with a Subscribers tab — email, name, tag, and active status',
      'An Apps Script API: POST to subscribe, GET to count or list subscribers',
      'Duplicate-email protection and unique unsubscribe tokens built in',
    ],
    builderTip:
      'Use <strong>tags</strong> to segment subscribers (e.g. \u201claunch\u201d, \u201cweekly\u201d). View and manage your list directly in the Google Sheet.',
    builderInputHint: 'Creates a sheet named \u201c[name] \u2014 RG Newsletter\u201d.',
    builderButtonLabel: 'Create newsletter',

    steps: [
      { id: 'sheet',  label: 'Creating Newsletter spreadsheet', description: 'Setting up your subscriber list',             scopes: [{ label: 'drive.file' }] },
      { id: 'script', label: 'Creating Apps Script',            description: 'Initializing the newsletter API',             scopes: [{ label: 'script.projects', sensitive: true }] },
      { id: 'code',   label: 'Uploading handler code',          description: 'Writing the doPost() subscriber handler',     scopes: [{ label: 'script.projects', sensitive: true }] },
      { id: 'deploy', label: 'Publishing API endpoint',         description: 'Making your newsletter endpoint live',        scopes: [{ label: 'script.deployments', sensitive: true }] },
    ],

    sheetSuffix: 'RG Newsletter',
    tabName: 'Subscribers',
    sampleRows: [
      ['Email', 'Name', 'Tag', 'Subscribed At', 'Unsubscribe Token', 'Active'],
      ['subscriber@example.com', 'Jane Doe',   'general', '', 'sample-token-abc123', 'TRUE'],
      ['reader@example.com',     'John Smith', 'launch',  '', 'sample-token-def456', 'TRUE'],
    ],

    scriptSuffix: 'Newsletter API',
    script: {
      mode: 'custom',
      generate: generateNewsletterScript,
      manifest: NEWSLETTER_SCRIPT_MANIFEST,
    },

    resultHeadingLabel: 'newsletter is live',
    resultSubtitle: 'Your subscriber API is ready. Start collecting emails immediately.',
    resultCompletedItems: [
      'Google Sheet created with Subscribers tab and sample rows',
      'Apps Script deployed — POST to subscribe, GET to count or list',
      'Duplicate detection and unsubscribe tokens built in',
    ],
    resultEndpointHint:
      'Send a POST with { email, name?, tag? } in the JSON body. Subscribers are stored in the linked Google Sheet.',
    resultSheetLinkLabel: 'Open Subscribers Sheet',
    resultNewButtonLabel: 'New newsletter',
    resultCodeSnippets: (deploymentUrl, _moduleName) => [
      {
        label: 'subscribe.js',
        language: 'js',
        content: `// Subscribe a user
const res = await fetch('${deploymentUrl}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'Jane Doe',   // optional
    tag: 'launch',      // optional — for segmentation
  }),
});
const data = await res.json();
// { success: true, message: "Subscribed successfully" }
// { success: false, message: "Already subscribed" }`,
      },
      {
        label: 'unsubscribe-url',
        language: 'text',
        content: `${deploymentUrl}?action=unsubscribe&token=TOKEN`,
        hint: 'Replace TOKEN with each subscriber\u2019s unique token (stored in column E of the sheet). Sets their Active field to FALSE.',
      },
      {
        label: 'count.js',
        language: 'js',
        content: `// Get active subscriber count
const { count } = await fetch('${deploymentUrl}?action=count')
  .then(r => r.json());`,
      },
    ],
  } satisfies ModuleDef,

  // ─── Announcement ────────────────────────────────────────────────────────────
  announcement: {
    type: 'announcement',
    label: 'Announcements',
    noun: 'announcements',

    builderTitle: 'New announcements module',
    builderDescription:
      'A Google Sheet becomes your announcements registry. Add banners, alerts, and notices to the sheet and they appear on your site instantly — no redeploy needed.',
    builderFeatures: [
      'A Google Sheet with an Announcements tab pre-seeded with sample rows',
      'An Apps Script web app that serves active announcements as a JSON API',
      'Date-range filtering — set Start Date and Expiry Date per announcement',
      'Types: info, warning, success, error — style each banner on your site',
    ],
    builderTip:
      'Toggle the Active column in the sheet to show or hide any announcement instantly. Set an Expiry Date to auto-hide time-sensitive notices without touching code.',
    builderInputHint: 'Creates a sheet named \u201c[name] \u2014 RG Announcements\u201d.',
    builderButtonLabel: 'Create announcements module',

    steps: [
      { id: 'sheet',  label: 'Creating Announcements spreadsheet', description: 'Setting up your announcements registry',       scopes: [{ label: 'drive.file' }] },
      { id: 'script', label: 'Creating Apps Script',               description: 'Initializing the announcements API',           scopes: [{ label: 'script.projects', sensitive: true }] },
      { id: 'code',   label: 'Uploading handler code',             description: 'Writing the doGet() announcements handler',    scopes: [{ label: 'script.projects', sensitive: true }] },
      { id: 'deploy', label: 'Publishing API endpoint',            description: 'Making your announcements endpoint live',      scopes: [{ label: 'script.deployments', sensitive: true }] },
    ],

    sheetSuffix: 'RG Announcements',
    tabName: 'Announcements',
    sampleRows: [
      ['Message', 'Type', 'Active', 'Start Date', 'Expiry Date', 'Order'],
      ['Welcome to our site! Check out our latest features.', 'info',    'TRUE',  '',           '',           '1'],
      ['Scheduled maintenance on Sunday 2am\u20134am UTC.',   'warning', 'FALSE', '2025-01-01', '2025-12-31', '2'],
    ],

    scriptSuffix: 'Announcements API',
    script: {
      mode: 'readonly',
      apiLabel: 'Announcements API',
      apiDescription: 'Announcements endpoint is live. Returns active announcements within their date range.',
      arrayKey: 'announcements',
      booleanKeys: ['active'],
      numericKeys: ['order'],
      filterLogic: `if (params.all !== 'true') {
  if (!item.active) { skip = true; }
  if (!skip && item.start_date) {
    var todayStr = new Date().toISOString().slice(0, 10);
    if (item.start_date > todayStr) skip = true;
  }
  if (!skip && item.expiry_date) {
    var todayStr2 = new Date().toISOString().slice(0, 10);
    if (item.expiry_date < todayStr2) skip = true;
  }
}
if (!skip && params.type) {
  if (!item.type || String(item.type).toLowerCase() !== String(params.type).toLowerCase()) skip = true;
}`,
    },

    resultHeadingLabel: 'announcements is live',
    resultSubtitle: 'Your announcements module is ready. Add messages to the Sheet to broadcast them instantly.',
    resultCompletedItems: [
      'Google Sheet created with Announcements tab and sample rows',
      'Apps Script deployed as a public announcements JSON API',
      'Toggle Active in the sheet to show or hide any announcement immediately',
    ],
    resultEndpointHint:
      'Default (no params) returns only active announcements that are within their date range. Add ?all=true to return every row regardless of status.',
    resultSheetLinkLabel: 'Open Announcements Sheet',
    resultNewButtonLabel: 'New announcements module',
    resultCodeSnippets: (deploymentUrl, _moduleName) => [
      {
        label: 'fetch-announcements.js',
        language: 'js',
        content: `// Fetch active announcements (date-filtered automatically)
const res = await fetch('${deploymentUrl}?json=1');
const { announcements } = await res.json();

// announcements shape:
// [{ id, message, type, active, startDate, expiryDate, order }]

// Render by type
announcements.forEach(a => {
  const banner = document.createElement('div');
  banner.className = \`announcement announcement--\${a.type}\`;
  banner.textContent = a.message;
  document.body.prepend(banner);
});`,
      },
      {
        label: 'fetch-all.js',
        language: 'js',
        content: `// Fetch ALL announcements regardless of active/date status
const res = await fetch('${deploymentUrl}?all=true');
const { announcements } = await res.json();`,
        hint: 'Use ?all=true in admin tools or previews to see every announcement including inactive ones.',
      },
    ],
  } satisfies ModuleDef,

  // ─── Redirects ───────────────────────────────────────────────────────────────
  redirects: {
    type: 'redirects',
    label: 'Redirects',
    noun: 'redirects',

    builderTitle: 'New redirects module',
    builderDescription:
      'A Google Sheet becomes your link shortener and redirect registry. Add slugs and destination URLs to the sheet — your site resolves them via the API with click tracking built in.',
    builderFeatures: [
      'A Google Sheet with a Redirects tab pre-seeded with sample slugs',
      'An Apps Script web app that resolves slugs and returns destination URLs',
      'Click tracking — the Clicks column auto-increments on each lookup',
      'Toggle Active per slug without touching any code',
    ],
    builderTip:
      'Use short slugs like <code class="font-mono">docs</code> or <code class="font-mono">pricing</code> in your marketing materials. Update the destination URL in the sheet anytime without changing the slug.',
    builderInputHint: 'Creates a sheet named \u201c[name] \u2014 RG Redirects\u201d.',
    builderButtonLabel: 'Create redirects module',

    steps: [
      { id: 'sheet',  label: 'Creating Redirects spreadsheet', description: 'Setting up your redirects registry',     scopes: [{ label: 'drive.file' }] },
      { id: 'script', label: 'Creating Apps Script',           description: 'Initializing the redirects API',         scopes: [{ label: 'script.projects', sensitive: true }] },
      { id: 'code',   label: 'Uploading handler code',         description: 'Writing the doGet() redirects handler',  scopes: [{ label: 'script.projects', sensitive: true }] },
      { id: 'deploy', label: 'Publishing API endpoint',        description: 'Making your redirects endpoint live',    scopes: [{ label: 'script.deployments', sensitive: true }] },
    ],

    sheetSuffix: 'RG Redirects',
    tabName: 'Redirects',
    sampleRows: [
      ['Slug', 'Destination URL', 'Active', 'Clicks'],
      ['docs',    'https://docs.example.com',    'TRUE', '0'],
      ['pricing', 'https://example.com/pricing', 'TRUE', '0'],
      ['github',  'https://github.com/example',  'TRUE', '0'],
    ],

    scriptSuffix: 'Redirects API',
    script: {
      mode: 'custom',
      generate: generateRedirectsScript,
      manifest: REDIRECTS_SCRIPT_MANIFEST,
    },

    resultHeadingLabel: 'redirects is live',
    resultSubtitle: 'Your redirects module is ready. Add slugs and destinations directly to the Google Sheet.',
    resultCompletedItems: [
      'Google Sheet created with Redirects tab and sample slugs',
      'Apps Script deployed as a public redirects JSON API with click tracking',
      'Add new slugs directly to the sheet — no redeploy needed',
    ],
    resultEndpointHint:
      '?slug=my-link \u2192 returns { redirect: "https://..." }, then use window.location = data.redirect. ?list=true \u2192 returns all slugs with click counts.',
    resultSheetLinkLabel: 'Open Redirects Sheet',
    resultNewButtonLabel: 'New redirects module',
    resultCodeSnippets: (deploymentUrl, _moduleName) => [
      {
        label: 'resolve-redirect.js',
        language: 'js',
        content: `// Resolve a slug and redirect the user
async function resolveSlug(slug) {
  const res = await fetch('${deploymentUrl}?slug=' + encodeURIComponent(slug));
  const data = await res.json();

  if (data.redirect) {
    window.location.href = data.redirect;
  } else {
    console.error('Slug not found:', data.error);
  }
}

// Usage
resolveSlug('docs');
// \u2192 GETs ?slug=docs
// \u2192 { redirect: "https://docs.example.com", slug: "docs" }
// \u2192 window.location = "https://docs.example.com"`,
        hint: 'Apps Script returns JSON — the client calls window.location to perform the redirect. Each lookup automatically increments the Clicks counter in the sheet.',
      },
      {
        label: 'list-slugs.js',
        language: 'js',
        content: `// List all slugs (for an admin panel or sitemap)
const res = await fetch('${deploymentUrl}?list=true');
const { redirects } = await res.json();

// redirects shape:
// [{ id, slug, destination, active, clicks }]
console.log(redirects);`,
      },
    ],
  } satisfies ModuleDef,

};
