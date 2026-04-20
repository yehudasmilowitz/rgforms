# 🔐 Google OAuth Setup Guide

A focused guide to configuring the OAuth consent screen and scopes for sheetspin. This is the part of setup most likely to cause confusion — this document explains exactly what to do and why.

---

## Table of Contents

1. [Why These Scopes Are Needed](#1-why-these-scopes-are-needed)
2. [Exact Scope Strings](#2-exact-scope-strings)
3. [Configuring the Consent Screen](#3-configuring-the-consent-screen)
4. [Test Users](#4-test-users)
5. [OAuth Verification](#5-oauth-verification)
6. [Development vs Production Comparison](#6-development-vs-production-comparison)

---

## 1. Why These Scopes Are Needed

sheetspin makes Google API calls directly from the browser using the signed-in user's OAuth token. It needs five OAuth scopes to do its job. Here is what each one does in plain English:

### `https://www.googleapis.com/auth/spreadsheets`

**"Create the Google Sheet that stores form submissions."**

When the user clicks "Generate my form", sheetspin creates a new Google Sheet in their Drive with columns matching the form fields they configured. Every future form submission is appended as a new row in that Sheet. This scope is what allows sheetspin to create that spreadsheet and write the initial headers.

### `https://www.googleapis.com/auth/script.projects`

**"Create and deploy the Apps Script that handles form submissions."**

The contact form embed works by posting data to a Google Apps Script web app, which is a small JavaScript function hosted by Google. sheetspin programmatically creates that Apps Script project, uploads the form handler code (`doPost()`), and publishes it as a web app — all via API. This scope grants access to the Apps Script API to do that.

> ⚠️ This scope is classified as **"sensitive"** by Google and requires OAuth verification before non-test users can authorize it. See [Section 5](#5-oauth-verification).

### `https://www.googleapis.com/auth/drive.file`

**"Create a folder in your Drive to organize form assets. Only sees files sheetspin creates — nothing else."**

sheetspin creates a folder in the user's Google Drive to keep the Sheet and Script organized. The `drive.file` scope is the most limited Drive scope available — it only grants access to files and folders that sheetspin itself created. It cannot read, list, or modify any existing files in the user's Drive.

### `https://www.googleapis.com/auth/userinfo.email`

**"Read your email address to pre-fill the notification field."**

When the user signs in, sheetspin fetches their email address from Google and pre-fills the "notification email" field in the form builder. This means the user receives email alerts for form submissions by default, without having to type their own address.

### `https://www.googleapis.com/auth/userinfo.profile`

**"Read your name and profile picture for the header."**

After sign-in, the app header shows the user's display name and profile photo. This scope provides access to those two fields from the user's Google profile.

---

## 2. Exact Scope Strings

Copy these exact strings when adding scopes to the OAuth consent screen. Typos will cause silent failures.

```
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/script.projects
https://www.googleapis.com/auth/drive.file
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/userinfo.profile
```

These are also the scopes requested in code at `/lib/auth.ts`:

```typescript
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/script.projects',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');
```

> **Important:** The scopes configured in the Google Cloud Console must match the scopes requested in code. If they don't match, Google will either reject the authorization request or show an error to the user.

---

## 3. Configuring the Consent Screen

### Step-by-Step

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Select your sheetspin project from the dropdown
3. Navigate to **APIs & Services** → **OAuth consent screen**

#### App Information Tab

| Field | Value |
|---|---|
| User Type | **External** (required for non-Workspace users) |
| App name | `sheetspin` |
| User support email | Your email |
| App logo | Optional |
| App domain | Your production domain (or `http://localhost:3000` for dev) |
| Developer contact email | Your email |

Click **"SAVE AND CONTINUE"**.

#### Scopes Tab

1. Click **"ADD OR REMOVE SCOPES"**
2. Use the search filter to find each scope and check its checkbox

**Finding each scope:**

| Search Term | Scope to Select |
|---|---|
| `spreadsheets` | `https://www.googleapis.com/auth/spreadsheets` |
| `script.projects` | `https://www.googleapis.com/auth/script.projects` |
| `drive.file` | `https://www.googleapis.com/auth/drive.file` |
| `userinfo.email` | `https://www.googleapis.com/auth/userinfo.email` |
| `userinfo.profile` | `https://www.googleapis.com/auth/userinfo.profile` |

3. After checking all five, click **"UPDATE"**
4. The scopes panel should show all five scopes listed
5. Click **"SAVE AND CONTINUE"**

#### Scope Sensitivity Classification

After adding the scopes, the Google Cloud Console will classify them:

| Scope | Classification |
|---|---|
| `userinfo.email` | Non-sensitive |
| `userinfo.profile` | Non-sensitive |
| `drive.file` | Non-sensitive |
| `spreadsheets` | Sensitive |
| `script.projects` | **Sensitive** |

The presence of sensitive scopes means Google requires OAuth verification before public production use. See [Section 5](#5-oauth-verification).

---

## 4. Test Users

### What Are Test Users?

While your app's publishing status is **"Testing"** (the default), only email addresses explicitly added to the test users list can complete the OAuth sign-in flow. Anyone else will see this screen:

> _"Google hasn't verified this app. The app is requesting access to sensitive info in your Google Account."_

Non-test users can still proceed by clicking "Advanced" → "Go to sheetspin (unsafe)", but most people will not do this.

### How to Add Test Users

1. Go to **APIs & Services** → **OAuth consent screen**
2. Scroll to the **"Test users"** section
3. Click **"+ ADD USERS"**
4. Enter one email address per line (must be Gmail or Google Workspace accounts)
5. Click **"ADD"**

Changes take effect immediately — no rebuild or redeploy is required.

### Limits

- Maximum **100 test users** while in Testing publishing status
- Test users can be from any Google-signed domain (`@gmail.com`, `@company.com` with Workspace, etc.)
- You can add and remove test users at any time

### Who to Add

During development, add:
- Your own email address
- Any team members or QA testers
- Client emails if you need them to test before you complete OAuth verification

### Removing the Test User Requirement

Once you complete OAuth verification (see [Section 5](#5-oauth-verification)) and publish your app, the test user list is no longer enforced — any Google account can sign in.

---

## 5. OAuth Verification

### What Is It?

Google requires any app that requests "sensitive" or "restricted" OAuth scopes to go through a manual review process before it can be used by the general public. This is to prevent malicious apps from abusing Google APIs.

sheetspin requests `script.projects` (sensitive), which triggers this requirement.

### When Do You Need It?

| Scenario | Verification Needed? |
|---|---|
| Running locally for yourself | No |
| Testing with colleagues (add as test users) | No |
| A small team under 100 people (all added as test users) | No |
| Public-facing app for anyone to use | **Yes** |

### What Happens If You Skip It?

Your app stays in "Testing" status. Users not on your test list will hit the "Google hasn't verified this app" warning screen. This is acceptable for internal tools, but not for a public product.

### How to Submit for Verification

Before submitting:
- [ ] Your app is deployed to a public URL (production)
- [ ] You have a privacy policy published at a public URL
- [ ] Your privacy policy explains that sheetspin does not store user data
- [ ] Your OAuth consent screen has accurate app name, logo, and domain info

**Submission steps:**

1. Go to **APIs & Services** → **OAuth consent screen**
2. Click **"PUBLISH APP"** — this moves your app from Testing to In Production
   - After this, anyone can attempt to sign in (though they'll see a warning without verification)
3. Click **"PREPARE FOR VERIFICATION"**
4. Fill in the verification form:

| Section | What to Provide |
|---|---|
| App homepage URL | Your production URL |
| Privacy policy URL | Direct link to your privacy policy page |
| Scope justifications | Plain-English explanation for each sensitive scope (see below) |
| Demo video | Screen recording of the OAuth consent flow in your app |

**Suggested scope justification text:**

For `https://www.googleapis.com/auth/script.projects`:
> "sheetspin creates a Google Apps Script web app on behalf of the user to handle HTML form submissions. The Apps Script serves as the serverless backend for the user's contact form — it receives POST requests, appends data to a Google Sheet, and sends email notifications. This scope is required to create, upload code to, and deploy that Apps Script project via the Apps Script API."

For `https://www.googleapis.com/auth/spreadsheets`:
> "sheetspin creates a Google Sheet that stores contact form submissions for the user. The Sheet is created in the user's own Drive and the user has full ownership. This scope is required to create the spreadsheet and write the initial column headers."

5. Submit the form and watch for email responses from Google
6. Respond promptly to any follow-up questions from the review team

### Timeline

The review process typically takes **1 to 4 weeks**. Factors that can speed it up:
- Clear, detailed scope justifications
- A clean demo video that shows the full OAuth flow
- A professional-looking app UI
- A published privacy policy

### Reference

Full OAuth verification documentation: [https://support.google.com/cloud/answer/9110914](https://support.google.com/cloud/answer/9110914)

---

## 6. Development vs Production Comparison

| Aspect | Development | Production (Unverified) | Production (Verified) |
|---|---|---|---|
| Publishing status | Testing | In Production | In Production |
| Who can sign in | Test users only (max 100) | Anyone (with warning screen) | Anyone (no warning) |
| OAuth consent screen | Shows "unverified" banner | Shows "unverified" warning | Clean, branded screen |
| `script.projects` scope | Works for test users | Works but scary warning | Works cleanly |
| Setup required | Add emails to test list | Click "Publish App" | Complete Google review |
| Time to set up | Immediate | Immediate | 1–4 weeks |
| Suitable for | Local dev, internal testing | Soft launches, beta | Public production |

### Token Behavior (Same in All Environments)

Regardless of verification status, the following is always true:

- OAuth tokens expire after approximately **1 hour**
- Tokens are stored **only in browser memory** — never in localStorage, cookies, or sent to any server
- On page refresh or tab close, the token is discarded and the user must re-authenticate
- sheetspin never stores any user credentials, tokens, or personal data anywhere
- All created assets (Sheets, Scripts, Drive folders) belong to the user in their own Google account

This behavior is by design. sheetspin has zero ongoing access to a user's account after the session ends.
