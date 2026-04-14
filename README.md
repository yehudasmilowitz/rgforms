# RG Forms

> Zero-backend HTML contact forms powered by your own Google Drive. Sign in with Google, configure your form, and get a copy-paste embed snippet — backed entirely by infrastructure you already own.

**Live site**: [rgforms.com](https://rgforms.com)

---

## What it does

RG Forms automates the [DWYL serverless form pattern](https://github.com/dwyl/learn-to-send-email-via-google-script-html-no-server). In under 2 minutes, it:

1. Creates a Google Sheet in your Drive (to store submissions)
2. Creates a container-bound Apps Script (the form handler)
3. Deploys it as a public HTTPS web app
4. Generates a copy-paste embed snippet for HTML, React, Vue, or Angular

No RG Forms server is ever involved. Every API call is made from your browser using your own OAuth token. The Sheet, the Script, and all form data belong entirely to you.

---

## Architecture

```
Your Browser
    │
    ├─── Google OAuth (popup flow, token in memory only)
    │
    ├─── Google Sheets API  ──▶  Creates spreadsheet + _config tab
    │
    ├─── Apps Script API    ──▶  Creates, uploads, and deploys doPost() handler
    │
    └─── (no RG Forms server involved at any point)

Later, when a visitor submits your form:

Visitor's Browser
    │
    └─── POST fetch(deploymentUrl, { body: URLSearchParams })
              │
              └─── Apps Script doPost()  [runs on Google's servers]
                        ├─── Appends row to your Sheet
                        ├─── Sends email notification (with CC/BCC, reply-to)
                        └─── Returns JSON { result: 'success' }
```

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, static export) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-first, oklch color system) |
| Auth | Google Identity Services — token model (popup, in-memory only) |
| 3D / Animation | React Three Fiber + Motion |
| Deployment | Static export — works on Vercel, Netlify, GitHub Pages |
| Backend | None — the deployed Apps Script IS the backend |

---

## Local development

### Prerequisites

- Node.js 18+
- A Google Cloud project with the **Apps Script API** enabled
- An OAuth 2.0 client ID (Web application type)

### Setup

```bash
git clone https://github.com/your-org/rgforms
cd rgforms
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

In your Google Cloud Console, add the following to **Authorized JavaScript origins**:

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

> **Note**: The form provisioning flow works on localhost, but any embed snippet you generate will point to a live Apps Script deployment URL. The Apps Script endpoint itself is a public URL and works from anywhere.

---

## Key files

```
lib/
  auth.ts             OAuth popup flow + token/userinfo fetching
  provision.ts        5-step provisioning pipeline (Sheet → Script → Deploy)
  scriptTemplate.ts   Apps Script code generation (doPost, doGet, email HTML)
  snippetTemplate.ts  Embed snippet generators (HTML, React, Vue, Angular, AI Agent)
  myForms.ts          List and delete forms from Drive

components/
  FormBuilder.tsx     3-step form builder wizard
  FieldRow.tsx        Draggable field editor
  Dashboard.tsx       "My Forms" list, delete, sign-out
  ResultPanel.tsx     Embed snippet display + instructions

context/
  AppContext.tsx      Global state (useReducer) — screens, auth, form config, steps
```

---

## How provisioning works

The provisioning pipeline in `lib/provision.ts` makes 5 sequential API calls using the user's OAuth token:

| Step | API | Result |
|---|---|---|
| 1 | Google Sheets API | Creates spreadsheet with field headers + hidden `_config` tab |
| 2 | Apps Script API | Creates script project bound to the sheet |
| 3 | Sheets API | Writes config JSON to `_config` tab (email, fields, metadata) |
| 4 | Apps Script API | Uploads generated `doPost()` handler code |
| 5 | Apps Script API | Creates version → deploys as public web app → returns URL |

If step 2 fails (Apps Script API not enabled), the sheet created in step 1 is automatically deleted to avoid orphaned Drive files.

---

## How the Apps Script works

The generated script (`lib/scriptTemplate.ts`) is a single JavaScript file uploaded to the user's Apps Script project. It contains:

- **`doPost(e)`** — receives form submissions, appends a row to the sheet, sends email
- **`doGet()`** — returns a status HTML page when the deployment URL is visited directly
- **`CONFIG`** — a JSON constant baked in at generation time (email addresses, honeypot field, etc.)
- **`normalizeHeader(h)`** — converts `"My Email Field"` → `"my_email_field"` for field matching
- **`escapeHtml(str)`** — sanitizes submission data before displaying in email HTML
- **`buildEmailHtml()`** — generates a styled HTML email with all submitted fields

The script deploys with `executeAs: USER_DEPLOYING` (runs as the form creator) and `access: ANYONE_ANONYMOUS` (publicly callable endpoint). OAuth scope is `spreadsheets.currentonly` — access to the one bound sheet only.

---

## Security model

| Concern | Approach |
|---|---|
| OAuth token | In-memory only (React state), never persisted, revoked on sign-out |
| Drive access | `drive.file` scope — only files created by this app |
| Sheet access | Container-bound script = `spreadsheets.currentonly` (one sheet) |
| Spam protection | Optional honeypot field (hidden input, silently rejected server-side) |
| Email safety | `escapeHtml()` on all submitted values before rendering in email |
| CORS | Apps Script public web apps return correct CORS headers automatically |
| Rate limiting | Google's Apps Script quotas apply (100 emails/day on free accounts) |

For ideas on improving security (origin verification, reCAPTCHA), see [/ideas](/ideas).

---

## Embed snippet formats

After provisioning, RG Forms generates snippets in five formats:

- **HTML** — self-contained `<form>` with inline CSS and vanilla JS fetch handler
- **React** — functional component with `useState` and typed form submission
- **Vue** — Composition API component with `ref()` and `@submit.prevent`
- **Angular** — standalone component with `HttpClient`
- **AI Agent** — plain-text instructions describing the form spec and API contract (for LLM-assisted implementation)

---

## Limitations

- **Email quota**: ~100 emails/day on free Google accounts (Google-imposed)
- **No file uploads**: Apps Script handles URL-encoded data only, not multipart
- **Token expiry**: OAuth tokens last ~1 hour; re-auth required (provisioning is one-time so this is fine)
- **Script authorization**: After provisioning via API, the user must visit the deployment URL once to authorize the script (Google requirement)
- **Apps Script API**: Must be enabled in the user's Google account before provisioning

---

## Ideas & roadmap

See the developer brainstorm page at [/ideas](/ideas) for the full list of planned features, modules, and security improvements — with implementation notes and feasibility ratings.

---

## License

MIT
