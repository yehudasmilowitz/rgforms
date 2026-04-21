# RG Forms

> AI-powered website backends in your Google Drive. Describe your site, get a fully provisioned Google Sheet + Apps Script API — forms, content, gallery, newsletter, and more. No server, no subscription, yours forever.

**Live site**: [rgforms.com](https://rgforms.com)

---

## ⚠️ TODO — Setup required

- [ ] **Create Firebase project named `rgforms`** — go to [console.firebase.google.com](https://console.firebase.google.com), create a new project with ID `rgforms`, enable Hosting, then run `firebase login` and `firebase use rgforms`. Until this is done the GitHub Actions deploy workflow will fail.

---

## What it does

RG Forms provisions your entire website's data backend inside your own Google Drive in under two minutes:

1. **Describe your site** — tell the AI what you're building; Gemini proposes a full module structure
2. **Review and customize** — edit field labels, types, email settings, and spam protection per module
3. **Provision everything** — one Google Sheet, one Drive folder, one Apps Script web app
4. **Manage post-launch** — add/remove modules, edit form fields, seed AI data, all without redeploying
5. **Export CLAUDE.md** — a skill file that makes Claude Code an agent for your site's API

No RG Forms server is ever involved in provisioning or in serving your site's data. Every API call is made from your browser using your own OAuth token. Everything belongs entirely to you.

---

## Architecture

```
Your Browser
    │
    ├─── Google OAuth           ──▶  Short-lived token, memory only
    ├─── Gemini API (server*)   ──▶  AI proposes module structure / seeds sample data
    ├─── Google Drive API       ──▶  Creates Sheet + Drive folder
    └─── Apps Script API        ──▶  Creates & deploys doPost/doGet handler

  * The only RG Forms server route: /api/propose-manifest and /api/seed-data — 
    forwards prompt to Gemini, returns response, logs nothing.

Your site's live API (after provisioning):

Visitor's Browser / Claude agent / your frontend
    │
    └─── fetch(scriptUrl, { body: URLSearchParams })  ← POST (form submission)
    └─── fetch(scriptUrl?tab=blog&token=...)          ← GET (read data)
              │
              └─── Apps Script reads _manifest tab at runtime
                        ├─── form:      appends row, sends email (CC/BCC/reply-to)
                        ├─── rows:      GET returns JSON array
                        ├─── key-value: GET returns config object
                        └─── Returns { result: 'success' } or { result: 'error', error: '...' }
```

---

## Module types

| Module | Tab type | What it stores |
|---|---|---|
| Contact Form | form | Submissions → sheet rows + email notification |
| Newsletter | form | Email subscriber addresses |
| Blog / Content | rows | Posts with title, body, slug, published flag |
| Gallery | rows | Image captions + Drive file IDs |
| Calendar / Events | rows | Date-structured events with start/end times |
| Asset Storage | asset | Drive subfolder; doGet lists files as JSON |
| Site Config | key-value | Flat key-value pairs (tagline, social links, etc.) |
| Custom Rows | rows | Any column structure you define |

---

## The manifest pattern

The Apps Script handler never has your site structure hardcoded. Instead it reads a `_manifest` tab in your Google Sheet on every request — a JSON object listing all your modules, their types, field configs, and folder references.

This means adding, removing, or editing modules only requires updating the sheet. **No redeployment. No script changes. Your endpoint URL never changes.**

---

## CLAUDE.md skill export

The Site Kit generates a `CLAUDE.md` file you can drop into any project. It gives Claude Code full knowledge of:

- Your API endpoint URL and auth token
- Every module, tab name, type, and column schema
- Exact calling conventions for GET and POST
- Response format: `{ result: 'success' }` / `{ result: 'error', error: '...' }`
- Form field names, types, and honeypot conventions
- Drive folder URLs for asset modules

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-first, oklch color system) |
| Auth | Google Identity Services — token model (popup, in-memory only) |
| AI | Gemini 2.5 Flash — site structure proposals + sample data generation |
| 3D / Animation | React Three Fiber + Motion |
| Deployment | Vercel |
| Backend | None — the deployed Apps Script IS the backend |

---

## Local development

### Prerequisites

- Node.js 18+
- A Google Cloud project with the **Apps Script API** enabled
- An OAuth 2.0 client ID (Web application type)
- A Gemini API key (for AI features)

### Setup

```bash
git clone https://github.com/your-org/rgforms
cd rgforms
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GEMINI_API_KEY=your_gemini_api_key_here
```

In your Google Cloud Console, add to **Authorized JavaScript origins**:

```
http://localhost:3000
```

And to **Authorized redirect URIs**:

```
http://localhost:3000/oauth-callback
```

Then run:

```bash
npm run dev
```

> **Note**: Provisioning works on localhost. Any generated Apps Script deployment URL is a live public endpoint and works from anywhere.

---

## Key files

```
app/
  api/
    propose-manifest/   Gemini route: site description → module proposal
    seed-data/          Gemini route: column names → realistic sample rows

lib/
  auth.ts               OAuth popup flow + token/userinfo fetching
  createSite.ts         Full site provisioning (Sheet + Drive folder + Apps Script)
  siteScript.ts         Apps Script code generation (doPost, doGet, manifest-driven)
  siteTabHelpers.ts     Post-provisioning sheet utilities (add/remove tabs, update headers)
  provision.ts          Legacy single-form provisioning pipeline
  modules/registry.ts   Module type registry

components/
  SiteStarter.tsx       AI site builder — describe → propose → customize → provision
  SiteKit.tsx           Site management — modules, form editor, AI seed, CLAUDE.md export
  SiteSelect.tsx        Site list — open, create, delete sites
  FormFieldEditor.tsx   Per-form field config (labels, types, required, email settings)

context/
  AppContext.tsx         Global state (useReducer) — screens, auth, manifests
```

---

## Provisioning flow

When you launch a site, `lib/createSite.ts` runs these steps in sequence using your OAuth token:

| Step | API | Result |
|---|---|---|
| 1 | Google Drive API | Creates a Drive folder for the site |
| 2 | Google Sheets API | Creates the Sheet with all module tabs pre-populated + `_manifest` tab |
| 3 | Apps Script API | Creates a standalone script project |
| 4 | Apps Script API | Uploads the manifest-driven `doPost` / `doGet` handler |
| 5 | Apps Script API | Deploys as a public web app → returns the endpoint URL |
| 6 | Sheets API | Writes the final manifest JSON (including the script URL) to `_manifest` |

---

## How the Apps Script works

The generated script (`lib/siteScript.ts`) is a single JS file uploaded to the user's Apps Script project:

- **`doPost(e)`** — reads `_manifest` tab, finds the matching form tab, appends a row, sends email via `GmailApp.sendEmail` (supports CC, BCC, custom subject, sender name, reply-to, honeypot)
- **`doGet(e)`** — reads `_manifest` tab, returns tab data as JSON (rows array, key-value object, or asset file list)
- **`_manifest` tab** — live JSON config, updated by RG Forms when you add/remove modules; no script redeploy needed
- **Response format** — always `{ result: 'success' }` or `{ result: 'error', error: '...' }`

Scopes declared in `appsscript.json`: `spreadsheets.currentonly`, `gmail.send`, `drive.readonly`.

---

## Security model

| Concern | Approach |
|---|---|
| OAuth token | In-memory only (React state), never persisted |
| Drive access | `drive.file` scope — only files created by this app |
| Sheet access | `spreadsheets.currentonly` — one sheet only |
| Script execution | Runs as the site owner; `ANYONE_ANONYMOUS` callable endpoint |
| Spam protection | Optional honeypot field — silently accepted to confuse bots |
| Email safety | All submitted values escaped before rendering in HTML email |
| AI data | Gemini receives column names + module type only — no personal data |
| CORS | Apps Script public web apps return CORS headers automatically |

---

## Limitations

- **Email quota**: ~100 emails/day on free Google accounts (Google-imposed)
- **No file uploads via API**: endpoint handles URL-encoded data; assets use Drive directly
- **Script authorization**: after provisioning, user must visit the script URL once to authorize (Google requirement)
- **Apps Script API**: must be enabled in the user's Google account before provisioning
- **Token expiry**: OAuth tokens last ~1 hour; re-auth required (provisioning is one-time)

---

## License

MIT
