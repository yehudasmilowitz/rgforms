# 🚀 rgforms Setup Guide

A step-by-step guide to getting rgforms running locally and deploying it to production.

rgforms is a **zero-backend** static Next.js app. There is no server to configure, no database to provision, and no subscription required. The only setup is a one-time Google Cloud project so the app can make OAuth-authenticated API calls on behalf of your users.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone & Install](#2-clone--install)
3. [Google Cloud Console Setup](#3-google-cloud-console-setup)
4. [Environment Variables](#4-environment-variables)
5. [Running Locally](#5-running-locally)
6. [Production Deployment (Vercel)](#6-production-deployment-vercel)
7. [OAuth Verification for Production](#7-oauth-verification-for-production)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Prerequisites

Before you begin, make sure you have the following:

| Requirement | Minimum Version | Check |
|---|---|---|
| Node.js | 18.x or higher | `node --version` |
| npm | 9.x or higher | `npm --version` |
| Google account | Any personal or Workspace account | — |

> **Note:** You do not need a paid Google account. A free `@gmail.com` account is sufficient for development and testing.

---

## 2. Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-org/rgforms.git
cd rgforms

# Install dependencies
npm install
```

The install takes about 30 seconds. There are no native modules and no post-install scripts.

---

## 3. Google Cloud Console Setup

This is the most involved part of the setup. Follow each step carefully — the exact menu names are listed.

### 3.1 Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the **project selector** dropdown at the top of the page (it may say "Select a project")
3. Click **"NEW PROJECT"** in the top-right of the modal
4. Enter a project name — `rgforms` works well
5. Leave the organization as-is (or select yours if applicable)
6. Click **"CREATE"**
7. Wait a few seconds, then select your new project from the dropdown

### 3.2 Enable Required APIs

You need to enable 3 APIs. For each one:

1. In the left sidebar, click **"APIs & Services"** → **"Library"**
2. Search for the API name in the search box
3. Click the result card
4. Click **"ENABLE"**
5. Wait for the enable confirmation, then go back to the Library for the next one

**Enable these three APIs:**

| API Name to Search | Purpose |
|---|---|
| `Google Sheets API` | Create the spreadsheet that stores form submissions |
| `Apps Script API` | Create and deploy the Apps Script web app endpoint |
| `Google Drive API` | Create the Drive folder that organizes form assets |

> ⚠️ **Important:** All three APIs must be enabled. If any one is missing, the provisioning pipeline will fail with a `403` error.

### 3.3 Configure the OAuth Consent Screen

The OAuth consent screen is what users see when they click "Sign in with Google". You must configure it before creating credentials.

1. In the left sidebar, go to **"APIs & Services"** → **"OAuth consent screen"**
2. Under **"User Type"**, select **"External"**
3. Click **"CREATE"**

**Fill in the App Information form:**

| Field | Value |
|---|---|
| App name | `rgforms` |
| User support email | Your email address |
| App logo | Optional — skip for now |
| App domain / Homepage URL | `http://localhost:3000` (update later for production) |
| Developer contact information | Your email address |

4. Click **"SAVE AND CONTINUE"**

**Add Scopes:**

5. On the Scopes screen, click **"ADD OR REMOVE SCOPES"**
6. In the filter box, search for and **check** each of the following scopes:

| Scope String | How to Find It |
|---|---|
| `https://www.googleapis.com/auth/spreadsheets` | Search `spreadsheets` |
| `https://www.googleapis.com/auth/script.projects` | Search `script.projects` |
| `https://www.googleapis.com/auth/drive.file` | Search `drive.file` |
| `https://www.googleapis.com/auth/userinfo.email` | Search `userinfo.email` |
| `https://www.googleapis.com/auth/userinfo.profile` | Search `userinfo.profile` |

7. Click **"UPDATE"** after selecting all five
8. Click **"SAVE AND CONTINUE"**

**Add Test Users:**

9. On the Test Users screen, click **"+ ADD USERS"**
10. Enter your Gmail address (the one you'll sign in with during development)
11. Add any other developer emails that need access during testing
12. Click **"ADD"**
13. Click **"SAVE AND CONTINUE"**
14. Review the summary and click **"BACK TO DASHBOARD"**

> 📝 **Why test users?** While your app is in "Testing" publishing status, only users on this list can sign in. This is required until you complete Google's OAuth verification process. See [Section 7](#7-oauth-verification-for-production) for details.

### 3.4 Create OAuth Credentials

1. In the left sidebar, go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**
4. For **Application type**, select **"Web application"**
5. For **Name**, enter `rgforms web`

**Add Authorized JavaScript Origins:**

Under "Authorized JavaScript origins", click **"+ ADD URI"** and add:

```
http://localhost:3000
```

If you know your production domain already, add it now too:

```
https://yourdomain.com
```

> ⚠️ **Do not add a trailing slash.** Google rejects origins with trailing slashes.

6. Leave "Authorized redirect URIs" empty — rgforms uses the implicit token flow, not redirect-based OAuth
7. Click **"CREATE"**

**Copy your Client ID:**

A dialog will appear showing your credentials. Copy the **Client ID** — it looks like:

```
123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

You will need this in the next step.

---

## 4. Environment Variables

Create a `.env.local` file in the root of the project:

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Replace `your-client-id.apps.googleusercontent.com` with the Client ID you copied from the Google Cloud Console.

**Notes:**
- The `NEXT_PUBLIC_` prefix is intentional and required — it causes Next.js to embed the value in the client-side bundle, which is correct for OAuth client IDs
- OAuth client IDs are not secrets; they are safe to expose in client-side code
- Never put a Client Secret here — rgforms does not use one

> 🔒 `.env.local` is already in `.gitignore`. Never commit this file.

---

## 5. Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the rgforms landing page with a "Sign in with Google" button. Click it and sign in with one of the test user emails you added in step 3.3.

**Other useful commands:**

```bash
# Type-check without building
npm run type-check

# Lint
npm run lint

# Build static export (outputs to /out directory)
npm run build
```

---

## 6. Production Deployment (Vercel)

rgforms is a Next.js static export (`output: 'export'` in `next.config.ts`). It has no server-side code and deploys as a purely static site.

### 6.1 Deploy to Vercel

**Option A — Vercel CLI:**

```bash
npm i -g vercel
vercel
```

Follow the prompts. On first deploy, Vercel will ask you to link or create a project.

**Option B — Vercel Dashboard:**

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub/GitLab/Bitbucket repository
4. Vercel auto-detects Next.js — leave all settings as defaults
5. Click **"Deploy"**

### 6.2 Add Environment Variable in Vercel

1. In the Vercel dashboard, go to your project → **"Settings"** → **"Environment Variables"**
2. Add a new variable:
   - **Name:** `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - **Value:** your Client ID from step 3.4
   - **Environments:** Production, Preview, Development
3. Click **"Save"**
4. Redeploy for the variable to take effect

### 6.3 Update Authorized JavaScript Origins

After Vercel assigns you a domain (e.g., `rgforms.vercel.app` or your custom domain):

1. Return to the Google Cloud Console → **"APIs & Services"** → **"Credentials"**
2. Click on your `rgforms web` OAuth client
3. Under "Authorized JavaScript origins", click **"+ ADD URI"**
4. Add your production URL: `https://rgforms.vercel.app` (no trailing slash)
5. Click **"SAVE"**

> ⏱️ OAuth credential changes can take a few minutes to propagate.

---

## 7. OAuth Verification for Production

### What is OAuth Verification?

When your app requests "sensitive" OAuth scopes (which `script.projects` is), Google requires you to submit the app for review before users outside your test list can sign in. This process is called **OAuth verification**.

### When is it Required?

| Situation | Verification Required? |
|---|---|
| Local development with test users | No |
| Testing with colleagues (add them as test users) | No |
| Public production app accessible to anyone | **Yes** |

### What Happens Without Verification?

Users who are **not** on your test user list will see a warning screen: _"Google hasn't verified this app"_. They can still proceed by clicking "Advanced" → "Go to rgforms (unsafe)", but most non-technical users will not do this.

### How to Submit for Verification

1. Complete your production deployment first
2. Publish a privacy policy at a public URL (e.g., `https://rgforms.com/privacy`)
3. Go to Google Cloud Console → **"APIs & Services"** → **"OAuth consent screen"**
4. Click **"PUBLISH APP"** to move from Testing to In Production status
5. Click **"PREPARE FOR VERIFICATION"**
6. Fill in the verification form:
   - App homepage URL
   - Privacy policy URL (required)
   - Justification for each sensitive scope (explain in plain English why the scope is needed)
   - Demo video showing the OAuth flow in your app
7. Submit and wait for Google's response

**Timeline:** The review typically takes **1–4 weeks**. Google may ask follow-up questions.

For full details, see: [https://support.google.com/cloud/answer/9110914](https://support.google.com/cloud/answer/9110914)

> 💡 **Tip:** During the verification waiting period, you can continue adding test users (up to 100) so that real users can still access the app in Testing mode.

---

## 8. Troubleshooting

### "The OAuth client was not found" / 400 error on sign-in

- Your `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is missing, incorrect, or has extra whitespace
- Double-check the value in `.env.local`
- Make sure you restarted `npm run dev` after creating `.env.local`

### "Access blocked: rgforms has not completed the Google verification process"

- You are signed in with an account that is **not** on the test users list
- Go to Google Cloud Console → OAuth consent screen → Test users → add your email

### "Error 403: access_denied" during sign-in

- The scopes on your OAuth consent screen do not match what the app is requesting
- Verify all 5 scopes are added (see step 3.3)

### "Google Sheets API has not been used in project" / 403 on provisioning

- One or more of the three APIs (Sheets, Apps Script, Drive) is not enabled
- Go to APIs & Services → Library and enable all three

### Sign-in popup is blocked

- Your browser is blocking the OAuth popup
- Allow popups for `localhost:3000` in your browser settings

### "Authorized JavaScript origin" error

- `http://localhost:3000` is not added to the OAuth client's authorized origins
- Go to APIs & Services → Credentials → click your client → add the origin

### Build fails with TypeScript errors

```bash
npm run type-check
```

This will surface all TypeScript errors without a full build. Fix any errors before deploying.

### The provisioning fails at step 3 or 4 (Apps Script steps)

- The Apps Script API may not be enabled — check APIs & Services → Library
- Your OAuth token may have expired (tokens last ~1 hour) — sign out and sign back in
- You may have hit the Apps Script deployment quota (~50/day per user) — try again tomorrow

---

## Quick Reference

```bash
# Development
npm run dev           # Start dev server at http://localhost:3000
npm run type-check    # TypeScript check
npm run lint          # ESLint

# Production
npm run build         # Static export to /out directory
vercel                # Deploy to Vercel
```

```
# .env.local (required)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
```
