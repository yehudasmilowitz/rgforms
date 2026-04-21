# RG Forms — Feature Roadmap & Ideas

## Site Starter (highest priority)

Instead of provisioning modules one at a time, the user picks a website template, enters a site name, and we spin up the entire backend in parallel.

### How it works
1. Show template cards with a description of what gets created
2. User enters one site name (used as prefix for all module names)
3. Provision all modules in **parallel** with a combined progress view ("Creating 5 modules… 3 of 5 done")
4. Show a final **Site Kit** screen — all endpoints organized by module in one place
5. One-click export of a fully-populated CLAUDE.md / `.cursorrules` that teaches an AI the full site setup

### Templates

| Template | Modules provisioned |
|---|---|
| Portfolio | Config · Gallery · Content (projects) · Form (contact) |
| Restaurant | Config · Content (menu items) · Gallery (food photos) · Calendar (events) · Form (reservations) |
| SaaS / Landing | Config · Content (testimonials) · Content (FAQs) · Form (waitlist) · Form (contact) |
| Non-profit / Church | Config · Content (blog) · Calendar (services/events) · Gallery · Form (volunteer/contact) |
| Agency | Config · Content (services) · Content (case studies) · Gallery · Form (inquiry) |

---

## New Module Types

### Testimonials
Structured content for marketing sites — author, quote, role, company, photo URL, rating (1–5), featured bool. Common enough that a dedicated pre-structured module is much friendlier than a generic Content module.

### FAQ
Question, answer, category, order. Pre-seeded with sample questions. Purpose-built schema covers the majority of FAQ use cases without the user having to define fields manually.

### Menu / Catalog
Name, description, price, category, image URL, available bool. Covers restaurants, product listings, and service menus. One of the highest-demand site types.

### Newsletter / Waitlist
Simpler than a form: email + name + optional tag + unsubscribe_token. Returns a confirmation response, stores subscribers in a Sheet, sends a welcome email. Users get a signup endpoint AND a live subscriber list in Drive.

### Redirects
Short slug → destination URL key-value map. Apps Script serves a 302. Cheap URL shortener / redirect manager backed by a Sheet — no server needed.

### Announcements / Banners
Message, type (info/warning/success/error), active bool, start_date, expiry_date. Sites read this API and conditionally show a banner. Zero-redeploy CMS for urgent messages, maintenance notices, or promotions.

---

## Developer UX Improvements

### Endpoint health check
A "Test endpoint" button on each module card that does a quick fetch to `?json=1` and shows latency + whether the script is authorized. Saves users from discovering broken or unauthorized endpoints in production.

### CSV import
Upload a `.csv` to pre-populate any module's sheet. Covers migration from Notion, Airtable, Excel, or any existing data source. Users shouldn't have to manually enter existing content row by row.

### Module duplication
Clone any existing module to a new name. Common pattern: "I want the same gallery structure but for a different event / season / client."

### Embeddable form widget
A `<script>` tag that renders a fully functional form on any HTML page — no React, no framework, no build step required. One line of HTML. Critical for agency use cases where clients aren't running a JS framework.

### Webhook notifications
When a form receives a submission, fire a webhook to a user-supplied URL (Slack, Discord, Zapier, Make, custom endpoint). Unlocks real-time notifications without email.

### Bulk export
Download all data from any module as a CSV directly from the Dashboard — no need to open the Google Sheet.

---

## Priority order (suggested)

1. **Site Starter** — step-function change in value prop; transforms "provision individual APIs" into "get a complete website backend in 60 seconds"
2. **Testimonials module** — fills an obvious gap in SaaS/landing templates; very high demand
3. **FAQ module** — same reasoning; nearly every marketing site needs one
4. **Endpoint health check** — low effort, high trust signal for users debugging live sites
5. **Newsletter / Waitlist module** — common need, unique enough from existing Form module to warrant its own flow
6. **Embeddable form widget** — unlocks agency and non-developer use cases
7. **Menu / Catalog module** — required for restaurant template to be complete
8. **CSV import** — unblocks migration use cases
9. **Announcements / Banners module** — nice-to-have, relatively niche
10. **Redirects module** — useful but niche compared to the others
11. **Module duplication** — quality of life, lower priority
12. **Webhook notifications** — powerful but adds complexity; can wait until form usage grows
