# 🛠️ rgforms Developer Guide

A comprehensive reference for working on the rgforms codebase. Covers architecture, file structure, how to extend the app, and common pitfalls.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [File Structure Walkthrough](#2-file-structure-walkthrough)
3. [How to Add a New Field Type](#3-how-to-add-a-new-field-type)
4. [The Provisioning Pipeline](#4-the-provisioning-pipeline)
5. [How the Embed Snippet Is Generated](#5-how-the-embed-snippet-is-generated)
6. [Testing Locally with Test Users](#6-testing-locally-with-test-users)
7. [Common Gotchas](#7-common-gotchas)
8. [Build and Deploy Checklist](#8-build-and-deploy-checklist)

---

## 1. Architecture Overview

### No Backend

rgforms has no server. There is no Express app, no API routes, no database, no server-side rendering. The `output: 'export'` setting in `next.config.ts` produces a directory of static HTML, CSS, and JS files that can be hosted anywhere.

Every action that would normally go to a server — authentication, data storage, Google API calls — is done entirely from the browser using the signed-in user's own OAuth token.

### The GIS Token Model

Authentication uses **Google Identity Services (GIS)**, Google's current standard for browser-only OAuth apps. The flow is:

1. The GIS library (`accounts.google.com/gsi/client`) is loaded as a browser script
2. When the user clicks "Sign in with Google", `google.accounts.oauth2.initTokenClient()` is called with the required scopes
3. Google presents the consent screen
4. On approval, GIS calls back with an **access token** (valid ~1 hour)
5. The token is stored in React state — never in `localStorage`, never in a cookie, never sent to any server

All Google API calls (Sheets, Apps Script, Drive, userinfo) attach this token as a `Bearer` header. When the token expires or the user signs out, the React state is cleared.

There are no refresh tokens. This is intentional — GIS's token model for browser apps does not issue refresh tokens. Re-authentication after ~1 hour is acceptable because creating a form is a one-time task, not an ongoing session.

### State Lives in React Only

All application state is managed by a single `useReducer` in `context/AppContext.tsx`. Nothing is persisted to `localStorage`, `sessionStorage`, or any remote store. If the user refreshes the page, they start over from the landing screen.

The state shape is:

```typescript
interface AppState {
  screen: 'landing' | 'builder' | 'provisioning' | 'result';
  auth: { user: GoogleUser | null; accessToken: string | null };
  formConfig: FormConfig;
  steps: ProvisioningStep[];
  result: ProvisioningResult | null;
}
```

Screen transitions are driven by dispatched actions — there is no Next.js router navigation between the four app screens. The app is a single-page state machine.

### How a User Session Flows

```
landing (sign-in)
    |
    | SIGN_IN action dispatched
    v
builder (configure form fields)
    |
    | START_PROVISIONING action dispatched
    v
provisioning (5 sequential API calls)
    |
    | SET_RESULT action dispatched
    v
result (copy embed snippet)
    |
    | RESET action dispatched
    v
builder (create another form, same auth)
```

---

## 2. File Structure Walkthrough

```
rgforms/
├── app/
│   ├── layout.tsx              # Root layout, fonts, GIS script tag, metadata
│   ├── page.tsx                # Landing screen (sign-in CTA)
│   ├── globals.css             # @import "tailwindcss" + @theme tokens
│   └── builder/
│       └── page.tsx            # Form builder screen (client component)
├── components/
│   ├── AuthButton.tsx          # "Sign in with Google" button (triggers GIS)
│   ├── FormBuilder.tsx         # Field list, form name, notification email
│   ├── FieldRow.tsx            # Single draggable field row (label, type, required)
│   ├── ProvisioningSteps.tsx   # 5-step animated progress indicator
│   └── ResultPanel.tsx         # Embed snippet display, copy button, links
├── lib/
│   ├── auth.ts                 # GIS script loader, token request, userinfo fetch
│   ├── provision.ts            # 5-step provisioning pipeline (all Google API calls)
│   ├── scriptTemplate.ts       # Apps Script doPost() code generator
│   └── snippetTemplate.ts      # HTML embed snippet generator
├── context/
│   └── AppContext.tsx          # Global state: useReducer, actions, context hooks
├── types/
│   └── index.ts                # Shared TypeScript interfaces and types
├── public/
│   └── favicon.svg
├── next.config.ts              # output: 'export', trailingSlash: true
├── package.json
└── tsconfig.json
```

### Key Files in Detail

**`lib/auth.ts`**
Three exported functions: `loadGisScript()` (dynamically injects the GIS `<script>` tag), `requestAccessToken()` (calls `google.accounts.oauth2.initTokenClient()` and returns a Promise), and `getUserInfo()` (fetches name/email/picture from the Google userinfo endpoint). The public-facing `signIn()` function calls all three in sequence.

**`lib/provision.ts`**
The heart of the app. Contains one primary exported function (e.g., `provision()`) that accepts a `FormConfig` and an access token, runs the 5 Google API calls sequentially, and dispatches step status updates via a callback. Each step maps to one API call. See [Section 4](#4-the-provisioning-pipeline) for details.

**`lib/scriptTemplate.ts`**
Exports `generateAppsScript(sheetId, notifyEmail)`, which returns the full source string of the `doPost()` Apps Script function with the sheet ID and notification email interpolated in. Also exports `APPS_SCRIPT_MANIFEST`, the `appsscript.json` manifest object required by the Apps Script API.

**`lib/snippetTemplate.ts`**
Exports a function that accepts the provisioning result (specifically the `deploymentUrl`) and the form field configuration, and returns a self-contained HTML+JS embed snippet string.

**`context/AppContext.tsx`**
Defines `AppProvider`, `useApp()`, `useAuth()`, and `useFormConfig()` hooks. The reducer handles all state transitions. The `SIGN_IN` action also pre-fills `notifyEmail` with the signed-in user's email.

**`types/index.ts`**
All shared TypeScript interfaces live here. Nothing is inlined in component files — import from `@/types`.

---

## 3. How to Add a New Field Type

Field types are defined in `types/index.ts` as a union type. Adding a new type requires changes in four places.

### Step 1: Add the type to the union in `types/index.ts`

```typescript
// Before
type: 'text' | 'email' | 'textarea' | 'tel' | 'select';

// After (adding 'number' as an example)
type: 'text' | 'email' | 'textarea' | 'tel' | 'select' | 'number';
```

### Step 2: Add the type to the field type selector in `components/FieldRow.tsx`

Find the `<select>` element for field type and add a new `<option>`:

```tsx
<option value="number">Number</option>
```

### Step 3: Add the HTML input rendering in `lib/snippetTemplate.ts`

The snippet generator maps field types to HTML input elements. Add a case for the new type:

```typescript
function renderField(field: FormField): string {
  switch (field.type) {
    case 'textarea':
      return `<textarea name="${field.label}" placeholder="${field.label}"${field.required ? ' required' : ''}></textarea>`;
    case 'select':
      // ... existing select handling
    case 'number':
      return `<input type="number" name="${field.label}" placeholder="${field.label}"${field.required ? ' required' : ''} />`;
    default:
      return `<input type="${field.type}" name="${field.label}" placeholder="${field.label}"${field.required ? ' required' : ''} />`;
  }
}
```

### Step 4: Add a preview render in `components/FieldRow.tsx` (if showing a live preview)

If the form builder shows a live preview of what the field will look like in the embed, add a case for the new type in the preview renderer.

### What You Do NOT Need to Change

- `lib/provision.ts` — the provisioning pipeline reads field labels from `FormConfig.fields` regardless of type; the Sheet columns and Apps Script template are type-agnostic
- `lib/scriptTemplate.ts` — the Apps Script `doPost()` reads `e.parameter[header]` which works for any field name
- `lib/auth.ts` — authentication is unrelated to field types

---

## 4. The Provisioning Pipeline

When the user clicks "Generate my form", `lib/provision.ts` runs 5 Google API calls sequentially from the browser. Here is what each step does:

### Step 1: Create the Google Sheet (`sheet`)

**API call:** `sheets.spreadsheets.create`

Creates a new Google Spreadsheet with:
- Title set to the form name the user entered
- A first row of headers: `Timestamp` followed by each field label in order

After this step, the provisioning result has a `sheetId` and `sheetUrl`.

### Step 2: Add the Config Tab (`config`)

**API call:** `sheets.spreadsheets.batchUpdate`

Adds a hidden `_config` sheet to the spreadsheet. This tab stores:
- The field schema (labels, types, required flags)
- The notification email address

This is a convenience tab that allows future tooling to read the form configuration from the Sheet itself without needing to store anything elsewhere.

### Step 3: Create the Apps Script Project (`script`)

**API call:** `script.projects.create`

Creates a new Apps Script project bound to the Sheet created in Step 1. Binding the script to the sheet means the script runs with the Sheet owner's permissions.

After this step, the provisioning result has a `scriptId` and `scriptUrl`.

### Step 4: Upload the Handler Code (`code`)

**API call:** `script.projects.updateContent`

Uploads two files to the Apps Script project:
1. `Code.gs` — the `doPost()` function generated by `lib/scriptTemplate.ts`, with the Sheet ID and notification email baked in as string literals
2. `appsscript.json` — the manifest from `APPS_SCRIPT_MANIFEST`, which sets the webapp execution mode to `USER_DEPLOYING` and access to `ANYONE_ANONYMOUS`

### Step 5: Publish the Web App (`deploy`)

**API call:** `script.projects.deployments.create`

Creates a versioned deployment of the Apps Script project as a web app. The deployment configuration:
- Description: auto-generated
- `manifestFileName`: `appsscript`

The response contains a `deploymentId` which is combined with the `scriptId` to construct the `deploymentUrl` — the endpoint that the generated HTML form POSTs to.

### Step Status Tracking

Each step's status flows through `'pending' → 'running' → 'complete'` on success, or `'pending' → 'running' → 'error'` on failure. The `UPDATE_STEP` action is dispatched before and after each API call:

```typescript
dispatch({ type: 'UPDATE_STEP', payload: { id: 'sheet', status: 'running' } });
// ... API call ...
dispatch({ type: 'UPDATE_STEP', payload: { id: 'sheet', status: 'complete' } });
```

On error, the error message is stored in the step:

```typescript
dispatch({ type: 'UPDATE_STEP', payload: { id: 'sheet', status: 'error', error: err.message } });
```

The `ProvisioningSteps` component reads these statuses from the global state and renders a live animated progress list.

---

## 5. How the Embed Snippet Is Generated

After all 5 provisioning steps complete, `lib/snippetTemplate.ts` generates the embed snippet using the `ProvisioningResult` and `FormConfig` from state.

The snippet is a self-contained block of HTML and JavaScript. Here is the structure:

```html
<form class="rgforms-form" id="rg-form"
      action="DEPLOYMENT_URL"
      method="POST">
  <!-- One input element per field, matching type and label -->
  <input type="text" name="Name" placeholder="Name" required />
  <input type="email" name="Email" placeholder="Email" required />
  <textarea name="Message" placeholder="Message" required></textarea>
  <button type="submit">Send</button>
  <div id="rg-success" style="display:none">
    Thanks! Your message has been sent.
  </div>
</form>
<script>
  document.getElementById('rg-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var data = new FormData(this);
    fetch(this.action, { method: 'POST', body: data })
      .then(function() {
        document.getElementById('rg-success').style.display = 'block';
        document.getElementById('rg-form').reset();
      });
  });
</script>
```

**Key design decisions:**

- The `fetch()` call does **not** use `mode: 'no-cors'` explicitly in the snippet template, but the Apps Script manifest sets `access: 'ANYONE_ANONYMOUS'`, which returns permissive CORS headers. See [Section 7](#7-common-gotchas) for CORS details.
- The `name` attribute of each input matches the column header in the Google Sheet, which is how `doPost()` maps form values to the correct columns
- The snippet uses vanilla JavaScript with no dependencies — it can be pasted into any HTML page, WordPress theme, Webflow custom code block, etc.

The `ResultPanel` component renders the snippet in a syntax-highlighted `<pre><code>` block with a copy-to-clipboard button.

---

## 6. Testing Locally with Test Users

### Setup

1. Add your email (and any colleague emails) to the test users list in Google Cloud Console → APIs & Services → OAuth consent screen → Test users
2. Create `.env.local` with your OAuth client ID
3. Run `npm run dev`

### Signing In

Click "Sign in with Google". A popup will appear showing the OAuth consent screen with the "unverified app" banner. Click "Continue" to proceed. This is expected behavior for apps in Testing publishing status.

If the popup does not appear, check your browser's popup blocker settings and allow popups for `localhost:3000`.

### Testing the Full Provisioning Flow

1. Sign in
2. Configure a form with a few fields (the defaults work fine)
3. Click "Generate my form"
4. Watch the 5 provisioning steps complete
5. Check your Google Drive — you should see a new folder with a Sheet and Script inside
6. Copy the embed snippet and test it in a simple HTML file

### Simulating Token Expiry

To test how the app handles token expiry without waiting an hour:

1. Open Chrome DevTools → Application → Storage
2. There is nothing to clear (the token is in React state, not storage)
3. The easiest approach: open the browser console and set a breakpoint or console log in `lib/auth.ts` to observe token behavior

Alternatively, the app will naturally hit a `401` error on the next API call after the token expires. The correct behavior is to surface an error and prompt re-authentication.

### Testing Error States

To test what happens when a provisioning step fails:

- Temporarily disable one of the three APIs in Google Cloud Console → APIs & Services → Library (re-enable after testing)
- Use a Client ID from a different project that doesn't have the APIs enabled
- Remove the `script.projects` scope from the consent screen to simulate a scope mismatch

---

## 7. Common Gotchas

### "Apps Script API has not been enabled for this project"

**Symptom:** Provisioning fails at Step 3 (`script`) with a `403` error containing "Apps Script API has not been used in project".

**Cause:** The Apps Script API is not enabled in the Google Cloud project.

**Fix:** Go to Google Cloud Console → APIs & Services → Library → search "Apps Script API" → click Enable.

This is separate from the Sheets API and Drive API — all three must be enabled independently.

---

### Token Expiry After ~1 Hour

**Symptom:** API calls return `401 Unauthorized` during or after provisioning.

**Cause:** GIS access tokens expire after approximately 1 hour. The GIS token model for browser apps does not issue refresh tokens, so the user must re-authenticate.

**Behavior:** The app should detect the `401` and dispatch a `SIGN_OUT` action, returning the user to the landing screen. The `formConfig` state is preserved through `RESET` so the user doesn't lose their field configuration.

**For developers:** When making API calls in `lib/provision.ts`, wrap calls in a try/catch and check for `401` specifically:

```typescript
if (error.status === 401) {
  // Token expired — surface error, user must re-auth
  // The formConfig in state is preserved through the RESET action
}
```

---

### Static Export Means No Server-Side Code

**Symptom:** Build fails or runtime errors when trying to use Node.js APIs, server actions, or API routes.

**Cause:** `next.config.ts` sets `output: 'export'`, which produces a fully static build. There is no Node.js process at runtime.

**Constraints:**
- No `app/api/` routes — they require a Node.js server
- No `getServerSideProps` — static export only
- No `next/headers` or other server-only Next.js utilities
- All pages must be `'use client'` components or work without server rendering
- The `googleapis` npm package is used at the type level for TypeScript; actual API calls go through `fetch()` with the Bearer token

If you find yourself wanting to add a server-side component, consider whether the operation can be done client-side with the user's OAuth token. If it genuinely requires a server, that is a significant architectural change — rgforms is designed to have zero backend.

---

### CORS with Apps Script

**Symptom:** Form submissions from an external website get CORS errors in the browser console.

**Cause:** The Apps Script deployment is configured with `access: 'ANYONE_ANONYMOUS'` in the manifest, which makes Google return permissive CORS headers. However, this can still behave unexpectedly in some scenarios.

**How the embed handles it:** The generated embed snippet uses a plain `fetch()` POST. The Apps Script web app returns `Access-Control-Allow-Origin: *` for anonymous access deployments, so standard CORS requests should work.

**If you encounter CORS errors:** The most common fix is to ensure the Apps Script deployment is set to `ANYONE_ANONYMOUS` access (not `ANYONE` — the two are different). `ANYONE_ANONYMOUS` does not require the user to be signed in to Google, which is correct for a public-facing contact form.

If CORS errors persist for a specific hosting environment, the fallback approach is to use `mode: 'no-cors'` in the `fetch()` call. The trade-off is that you cannot read the response body, so you cannot show a success or error message based on the API response — you can only show a success message optimistically.

---

### "The provided authorization grant is invalid"

**Symptom:** A previously working Client ID stops working.

**Cause:** OAuth client credentials can be invalidated if the consent screen or credentials are reconfigured incorrectly.

**Fix:** Delete the existing OAuth 2.0 Client ID in Google Cloud Console → APIs & Services → Credentials, create a new one following the steps in `SETUP.md`, and update `.env.local`.

---

### Tailwind v4 Has No Config File

**Symptom:** Developers try to add `tailwind.config.ts` and wonder why it has no effect.

**Cause:** rgforms uses Tailwind CSS v4, which uses CSS-first configuration. There is no `tailwind.config.ts`.

**How to customize:** All theme customization goes in `app/globals.css` using `@theme`:

```css
@import "tailwindcss";

@theme {
  --color-brand: #4f46e5;
  --font-sans: "Inter", sans-serif;
}
```

See the [Tailwind v4 docs](https://tailwindcss.com/blog/tailwindcss-v4) for the full CSS-first API.

---

## 8. Build and Deploy Checklist

Use this checklist before every production deployment.

### Pre-Build

- [ ] `.env.local` is configured with the correct production Client ID
- [ ] All three APIs are enabled in Google Cloud Console (Sheets, Apps Script, Drive)
- [ ] The production domain is added to the OAuth client's Authorized JavaScript origins (no trailing slash)
- [ ] TypeScript passes: `npm run type-check`
- [ ] No lint errors: `npm run lint`

### Build

```bash
npm run build
```

The static output is written to `./out/`. Verify the build succeeds without errors.

Check the output directory:

```bash
ls out/
# Should contain: index.html, builder/, _next/, favicon.svg, etc.
```

### Environment Variables in Vercel

- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in Vercel project settings
- [ ] Variable is enabled for Production environment
- [ ] A redeploy was triggered after adding/changing the variable

### OAuth Consent Screen

- [ ] App name, support email, and developer contact are filled in
- [ ] All 5 scopes are added and saved
- [ ] For dev/staging: test user emails are added
- [ ] For production: OAuth verification has been submitted (or you have accepted the "unverified app" warning for your audience)

### Post-Deploy Verification

- [ ] Visit the production URL — landing page loads
- [ ] Click "Sign in with Google" — consent screen appears
- [ ] Sign in completes — builder screen loads with user avatar
- [ ] Create a test form and run provisioning to completion
- [ ] Verify the generated Sheet appears in Google Drive
- [ ] Paste the embed snippet in a test HTML file and submit the form
- [ ] Verify the submission appears in the Sheet
- [ ] Verify the notification email arrives

### Rollback

If something breaks in production:

1. Revert the commit in git
2. Push the revert to trigger a Vercel redeploy
3. If the issue is OAuth-related (credentials changed), restore the previous Client ID in Vercel environment variables and redeploy

---

## Tech Stack Reference

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router, static export) | 15.x |
| UI | React | 19.x |
| Language | TypeScript | 5.x |
| Auth | Google Identity Services (GIS) | Latest (browser CDN) |
| Google APIs | `googleapis` npm (types + client) | 144.x |
| State | React Context + `useReducer` | Built-in |
| Styling | Tailwind CSS v4 (CSS-first config) | 4.x |
| Deployment | Vercel (static hosting) | — |

## Useful Links

- [Google Identity Services (GIS) docs](https://developers.google.com/identity/oauth2/web/guides/overview)
- [GIS Token Client reference](https://developers.google.com/identity/oauth2/web/reference/js-reference#google.accounts.oauth2.initTokenClient)
- [Google Sheets API reference](https://developers.google.com/sheets/api/reference/rest)
- [Apps Script API reference](https://developers.google.com/apps-script/api/reference/rest)
- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4)
- [DWYL serverless form pattern](https://github.com/dwyl/learn-to-send-email-via-google-script-html-no-server) (the pattern rgforms automates)
