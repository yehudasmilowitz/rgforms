# rgforms — Project Brief

**Domain:** sheetspin.com
**Version:** 1.0
**Status:** Draft
**Date:** March 2026

---

## What is rgforms?

rgforms is a zero-backend, static web application that lets any developer create a fully functional HTML contact form in under two minutes. Users sign in with their Google account, configure form fields and a notification email in a visual builder, and receive a ready-to-paste embed snippet. No server, no database, no subscription — everything lives in the user's own Google Drive.

rgforms automates the popular [DWYL serverless contact form pattern](https://github.com/dwyl/learn-to-send-email-via-google-script-html-no-server) (3k+ GitHub stars), eliminating the 15–30 minute manual setup of Google Sheets, Apps Script, and OAuth permissions.

---

## Core Principles

- **No backend** — all API calls are made from the browser using the user's OAuth token
- **No database** — no Firestore, no server storage of any kind
- **User owns everything** — all created assets live in the user's Google Drive
- **Zero ongoing dependency** — once the embed is set up, it works independently forever
- **Static deployment** — the entire app is a Next.js static export, hostable on Vercel, Netlify, or GitHub Pages

---

## Tech Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router, static export via `output: 'export'`) | **16** |
| UI Library | React | **19** |
| Language | TypeScript | **6** |
| Auth | **Google Identity Services (GIS)** via `accounts.google.com/gsi/client` | Latest (browser script) |
| Google APIs | `googleapis` npm package — called from browser with user's access token | **171+** |
| State | React Context + `useReducer` — in-memory only, nothing persisted | — |
| Styling | Tailwind CSS (v4 — CSS-first config, zero-config setup, `@import "tailwindcss"`) | **4** |
| Deployment | Vercel (free tier) — static export, no server functions | — |
| Token handling | In-memory only — stored in React state, cleared on tab close | — |

---

## Authentication Flow (Updated for GIS)

rgforms uses **Google Identity Services (GIS) Token Model**, the current standard for browser-only apps needing API access.

1. Load GIS library: `<script src="https://accounts.google.com/gsi/client"></script>`
2. User clicks "Sign in with Google"
3. App calls `google.accounts.oauth2.initTokenClient()` with required scopes
4. Google presents the OAuth consent screen
5. On approval, GIS returns an access token (valid ~1 hour)
6. Token is stored in React state only — never in localStorage, cookies, or sent to any server
7. All Google API calls use `Authorization: Bearer <token>`
8. On page refresh or tab close, state is cleared — user re-authenticates

### Required OAuth Scopes

| Scope | Purpose |
|---|---|
| `https://www.googleapis.com/auth/spreadsheets` | Create the Google Sheet for form submissions |
| `https://www.googleapis.com/auth/script.projects` | Create and deploy the Apps Script web app |
| `https://www.googleapis.com/auth/drive.file` | Create Drive folder for form assets (only accesses files rgforms creates) |

**Security:** rgforms never stores login data, tokens, or user information anywhere. There is no backend, no database, and no server. The access token exists only in browser memory for the duration of the session.

---

## How It Works (Provisioning Pipeline)

When the user clicks "Generate my form", 5 API calls run sequentially from the browser:

| Step | What Happens |
|---|---|
| 1. Create Sheet | `sheets.spreadsheets.create` — new Google Sheet with columns matching form fields + Timestamp |
| 2. Add config tab | `sheets.spreadsheets.batchUpdate` — hidden `_config` tab with field schema and notification email |
| 3. Create Script | `script.projects.create` — new Apps Script project bound to the Sheet |
| 4. Upload code | `script.projects.updateContent` — uploads the `doPost()` handler with Sheet ID and email baked in |
| 5. Deploy | `script.projects.deployments.create` — publishes as web app; returns deployment URL |

The deployment URL is templated into a self-contained HTML/JS embed snippet.

---

## Generated Apps Script Template

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.openById('SHEET_ID').getActiveSheet();
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var newRow = headers.map(function(header) {
      return header === 'timestamp' ? new Date() : e.parameter[header];
    });
    sheet.appendRow(newRow);
    MailApp.sendEmail({
      to: 'NOTIFY_EMAIL',
      subject: 'New form submission',
      body: JSON.stringify(e.parameter, null, 2)
    });
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## Generated Embed Snippet

```html
<form class="rgforms-form" id="rg-form"
      action="SCRIPT_DEPLOYMENT_URL"
      method="POST">
  <input type="text" name="name" placeholder="Name" required />
  <input type="email" name="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit">Send</button>
  <div id="rg-success" style="display:none">
    Thanks! Your message has been sent.
  </div>
</form>
<script>
  document.getElementById('rg-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var data = new FormData(this);
    fetch(this.action, { method:'POST', body: data })
      .then(function() {
        document.getElementById('rg-success').style.display = 'block';
        document.getElementById('rg-form').reset();
      });
  });
</script>
```

---

## Screens

| Screen | Purpose |
|---|---|
| **1. Landing / Sign In** | Product value prop + "Sign in with Google" CTA. Shows scopes in plain English. Trust note: "We never store your data." |
| **2. Form Builder** | Configure form name, notification email, and fields (label, type, required toggle). Add/remove/reorder fields. Inline validation. |
| **3. Loading / Provisioning** | 5-step animated progress with per-step status (pending/running/complete/error). Retry from failed step. |
| **4. Result / Embed** | Syntax-highlighted embed snippet with copy button. Links to open Sheet and Apps Script. Setup instructions. |

### Screen Details

**Screen 1 — Landing / Sign In**
- Product name, tagline, 2-sentence description
- Three OAuth scopes displayed with plain-English explanations
- Single CTA: "Sign in with Google" (official Google styling guidelines)
- Trust note: "We never store your data. Everything is created in your Google Drive."
- On success → Screen 2. On error → clear message + retry

**Screen 2 — Form Builder**
- Header: user avatar, email, sign-out button
- Form name input (used as Sheet name and email subject prefix)
- Notification email input (pre-filled with signed-in user's email)
- Field builder list: Label, Type (text/email/textarea/tel/select), Required toggle
- Default fields: Name (text, required), Email (email, required), Message (textarea, required)
- Add/remove field buttons, drag-to-reorder (HTML5 drag events, no library)
- Validation: non-empty name, valid email, at least 1 field, no duplicate labels (case-insensitive), inline on blur
- "Generate my form" CTA (disabled until valid)

**Screen 3 — Loading / Provisioning**
- 5 steps with status indicators: pending / in progress / complete / error
- Sequential animation — one step active at a time
- "Usually takes about 10 seconds" estimate
- On failure: specific step error + "Try again" (retries from failed step)
- No generic spinner

**Screen 4 — Result / Embed**
- Syntax-highlighted embed snippet in code block
- "Copy to clipboard" with checkmark confirmation (2 seconds)
- Numbered setup instructions in plain language
- "Open my Google Sheet" link (new tab)
- "View Apps Script" link (new tab)
- "Create another form" button → Screen 2
- Sign out button

---

## Project File Structure

```
rgforms/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata
│   ├── page.tsx                # Landing / sign-in screen
│   ├── globals.css             # @import "tailwindcss" + @theme config
│   └── builder/
│       └── page.tsx            # Form builder (client component)
├── components/
│   ├── AuthButton.tsx          # Google sign-in button (GIS)
│   ├── FormBuilder.tsx         # Field configuration UI
│   ├── FieldRow.tsx            # Single draggable field row
│   ├── ProvisioningSteps.tsx   # Animated step progress
│   └── ResultPanel.tsx         # Snippet + instructions
├── lib/
│   ├── auth.ts                 # GIS token client helpers
│   ├── provision.ts            # 5-step provisioning pipeline
│   ├── scriptTemplate.ts       # Apps Script doPost() template
│   └── snippetTemplate.ts      # HTML embed snippet generator
├── context/
│   └── AppContext.tsx           # Global state (auth, form config, result)
├── types/
│   └── index.ts                # Shared TypeScript interfaces
├── public/
│   └── favicon.svg
├── next.config.ts              # output: 'export', images: unoptimized
├── package.json
└── tsconfig.json
```

Note: No `tailwind.config.ts` — Tailwind v4 uses CSS-first configuration via `@import "tailwindcss"` in `globals.css`.

---

## Key TypeScript Interfaces

```typescript
export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'tel' | 'select';
  required: boolean;
  options?: string[];   // for select fields
}

export interface FormConfig {
  name: string;
  notifyEmail: string;
  fields: FormField[];
}

export interface ProvisioningResult {
  sheetId: string;
  sheetUrl: string;
  scriptId: string;
  scriptUrl: string;
  deploymentUrl: string;
}

export interface ProvisioningStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  error?: string;
}

export interface AuthState {
  user: GoogleUser | null;
  accessToken: string | null;
}
```

---

## Next.js Configuration

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
```

All pages use `'use client'` directive — required because all pages interact with browser-only GIS and Google APIs.

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

This is the only environment variable. It is `NEXT_PUBLIC_` (embedded in client bundle) — correct and expected for OAuth client IDs.

---

## Google Cloud Setup (One-Time, Developer Only)

1. Create project at console.cloud.google.com
2. Enable: Google Sheets API, Apps Script API, Google Drive API
3. Create OAuth 2.0 Client ID (Web application type)
4. Add authorized JavaScript origins: `http://localhost:3000` and `https://sheetspin.com`
5. Configure OAuth consent screen (External) with the three scopes
6. For production: submit for Google OAuth verification (1–4 weeks, requires privacy policy)

---

## Known Constraints

| Constraint | Detail |
|---|---|
| OAuth token expiry | Tokens expire after ~1 hour. Detect 401 errors, prompt re-auth, preserve form config in state. |
| Apps Script quota | ~50 deployments/day per user (free). One deployment per form — most users won't hit this. |
| Email send limit | `MailApp.sendEmail()` limited to ~100/day (free) or ~1,500/day (Workspace). Show warning in UI. |
| OAuth verification | `script.projects` scope requires Google verification for production. Use test users during dev. |
| No token refresh | GIS token model for browser apps does not provide refresh tokens. Re-auth after ~1 hour. Acceptable — form creation is a one-time task. |
| Static hosting only | No SSR. Works on Vercel static, Netlify, GitHub Pages, Cloudflare Pages. |
| CORS on Apps Script | Apps Script web apps return CORS headers when set to "Anyone can access". Generated embed uses no-cors mode to avoid issues. |

---

## Target Users

- **Freelancers** building client sites who want contact forms without recurring SaaS costs
- **Agency devs** who need a repeatable, fast form setup across projects
- **Indie hackers** launching landing pages who need a form before launch day
- **No-code builders** (Webflow, Framer, Squarespace) who need a real form backend affordably

---

## Out of Scope (V1)

- User accounts or saved form history (sessions are stateless)
- Form submission analytics
- Custom SMTP/email providers
- File upload fields
- Conditional logic / multi-step forms
- CAPTCHA / spam protection (users can add to their own embed)
- Form editing after creation
- Webhook / Zapier integrations
- White-labelling

---

## Development Milestones

| Milestone | Deliverables |
|---|---|
| M1 — Foundation | Next.js 16 scaffolded, Tailwind v4 configured, GIS auth working, user profile displayed |
| M2 — Form Builder | Field types, add/remove/reorder, validation, all field types supported |
| M3 — Provisioning | All 5 Google API calls in `lib/provision.ts`, step progress UI, error handling + retry |
| M4 — Result Screen | Snippet generator, instructions, copy-to-clipboard, Sheet/Script links |
| M5 — Polish | Loading/empty/error states, responsive layout, accessibility audit, performance audit |
| M6 — Launch Prep | OAuth verification submitted, privacy policy at sheetspin.com/privacy, production deploy to Vercel |

---

## Privacy & Data Commitment

**rgforms does not store anyone's login or data. Ever.**

- No backend server exists
- No database exists
- No user tokens, emails, or form data are stored, logged, or transmitted to any server other than Google's own APIs
- The access token lives only in browser memory and is destroyed when the tab closes
- All created assets (Sheets, Scripts) belong to the user in their own Google Drive
- rgforms has zero access to form submissions after setup is complete

---

## Reference Links

- [DWYL Pattern](https://github.com/dwyl/learn-to-send-email-via-google-script-html-no-server)
- [Google Identity Services (GIS)](https://developers.google.com/identity/oauth2/web/guides/overview)
- [GIS Migration Guide](https://developers.google.com/identity/oauth2/web/guides/migration-to-gis)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Apps Script API](https://developers.google.com/apps-script/api)
- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4)
- [Google OAuth Verification](https://support.google.com/cloud/answer/9110914)
