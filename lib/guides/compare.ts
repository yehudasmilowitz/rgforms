import type { Guide } from '@/lib/guides/types';
import { HTML_FORM, CURL_TEST } from '@/lib/guides/snippets';

/** Shown on every comparison page. We make one of the tools being compared. */
const DISCLOSURE = {
  type: 'callout' as const,
  tone: 'info' as const,
  heading: 'Who wrote this',
  body: [
    "We make RG Forms, so treat this the way you'd treat any comparison written by a vendor — as a starting point, not a verdict. We've tried to describe the alternatives the way their own teams would, and to say plainly where they're the better choice. Every product mentioned here is a legitimate, well-built option, and several have been solving this problem for far longer than we have.",
    "Plans and limits change often. Check each provider's own pricing page before deciding.",
  ],
};

export const COMPARE_GUIDES: Guide[] = [
  {
    slug: 'rg-forms-vs-formspree',
    category: 'compare',
    eyebrow: 'Comparison',
    title: 'RG Forms vs Formspree',
    metaTitle: 'RG Forms vs Formspree — Which Form Backend Fits Your Site',
    description:
      'Formspree is the most established form backend in the category. RG Forms takes a different approach to where your data lives. An honest side-by-side.',
    cardBlurb: 'A mature, full-featured platform vs. an endpoint inside your own Google account.',
    answer:
      "Formspree and RG Forms both let a static site accept form submissions without a server, and they differ mainly in where the data lives and how much product sits around it. Formspree is a mature, full-featured platform: submissions are stored in Formspree's system, you manage them in its dashboard, and it offers plain HTML form posts without JavaScript, file uploads, integrations and workflow features on paid plans. RG Forms stores submissions in a Google Sheet inside your own Google account, via an Apps Script endpoint it provisions for you, and is free with no paid tier — but it has fewer features and requires JavaScript. Choose Formspree for a full product with support behind it; choose RG Forms when data ownership and zero cost matter more than breadth of features.",
    intro: [
      "Formspree has been doing this since long before most of the category existed, and it shows — it’s polished, well documented, and it handles cases we deliberately don’t.",
      "The real question isn’t which is better. It’s which trade you want.",
    ],
    sections: [
      DISCLOSURE,
      {
        type: 'table',
        heading: 'Side by side',
        columns: ['', 'Formspree', 'RG Forms'],
        rows: [
          ['Where submissions are stored', 'Formspree’s platform, viewable in their dashboard', 'A Google Sheet in your own Drive'],
          ['Cost', 'Free tier with a monthly submission allowance; paid plans for more volume and features', 'Free — there’s no server for anyone to bill for'],
          ['Works without JavaScript', 'Yes — a plain `action=` POST with a redirect is supported', 'No — the integration is a `fetch` call'],
          ['File uploads', 'Yes, on paid plans', 'No — text fields only'],
          ['Integrations', 'Slack, Zapier, webhooks, CRM connections and more', 'Anything that reads a Google Sheet; the script itself is editable'],
          ['Spam protection', 'Built-in filtering plus captcha options', 'Honeypot, plus Cloudflare Turnstile verified server-side'],
          ['Notification email sends from', 'Formspree’s infrastructure', 'Your own Google account'],
          ['Support', 'A company with a support team', 'GitHub issues and the docs'],
          ['If the vendor goes away', 'Export your submissions and migrate', 'Nothing changes — the endpoint is in your account'],
        ],
      },
      {
        type: 'prose',
        heading: 'The architectural difference',
        body: [
          "Formspree works the way almost every SaaS works: your form posts to their servers, they store it, they show it to you, they email you. That’s a sound model and it’s what makes the richer features possible — dashboards, workflows, integrations and file handling all need a platform behind them.",
          "RG Forms has no servers to put anything on. When you sign in with Google, it creates a Drive folder, a Google Sheet and an Apps Script web app **in your account**, and hands you the URL. Submissions go from your visitor’s browser to your script to your spreadsheet. We never see them, which is simultaneously the main feature and the main limitation.",
        ],
      },
      {
        type: 'prose',
        heading: 'Choose Formspree when',
        body: [
          "**You need it to work without JavaScript.** Formspree supports a plain HTML form post with a redirect. RG Forms doesn’t — a `fetch` is required.",
          "**You need file uploads.** Résumés, photos, documents. RG Forms handles text only.",
          "**You want a dashboard for a non-technical client.** A spreadsheet is a fine interface for most people, but a purpose-built submissions inbox with search, tagging and export is better if that’s the daily workflow.",
          "**You want integrations that already exist.** Slack notifications, CRM pushes and Zapier connections are configuration in Formspree; with RG Forms you’d be editing Apps Script or building on top of the Sheet.",
          "**You want a support contract.** There’s a company on the other end with an incentive to answer.",
        ],
      },
      {
        type: 'prose',
        heading: 'Choose RG Forms when',
        body: [
          "**The data has to belong to the site owner.** Handing a client a Google Sheet in their own Drive is a cleaner boundary than an account on a service you control — and it survives you.",
          "**Cost has to be zero, permanently.** Not a free tier with a submission ceiling — free because nobody is hosting anything on your behalf.",
          "**You want no vendor dependency at all.** The endpoint is an Apps Script deployment in your account with no reference to rgforms.com. If this site vanished tonight, your form would still be taking submissions tomorrow.",
          "**Your team lives in spreadsheets.** Sorting, filtering, adding a “replied?” column, sharing with a colleague, charting by month — all free, all familiar, no export step.",
        ],
      },
      {
        type: 'code',
        heading: 'What the RG Forms integration looks like',
        code: HTML_FORM,
      },
    ],
    faq: [
      {
        q: 'Can I use both?',
        a: 'Yes, and it’s not unusual — a job application form with file uploads on one service, and a contact form writing to a spreadsheet on the other. They’re just two endpoints.',
      },
      {
        q: 'Is RG Forms free because it’s a trial?',
        a: 'No. There is no paid tier and no infrastructure to pay for — your endpoint runs on Google’s free Apps Script quota inside your own account. That’s the whole business model, or lack of one.',
      },
      {
        q: 'How do I migrate from Formspree?',
        a: 'Export your existing submissions from their dashboard, create an RG Forms project with matching fields, paste the exported rows into the Sheet, then swap the endpoint URL in your form. The markup barely changes.',
      },
      {
        q: 'Which handles spam better?',
        a: 'Formspree has years of aggregated signal across many sites, which is a genuine advantage for filtering. RG Forms relies on a honeypot plus server-side Turnstile verification — effective, and it happens inside your own script, but it isn’t learning from anyone else’s traffic.',
      },
    ],
    related: [
      'rg-forms-vs-formsubmit',
      'rg-forms-vs-formspark',
      'best-contact-form-backend-for-static-sites',
      'form-backend-for-static-sites',
    ],
    updated: '2026-08-19',
  },

  {
    slug: 'rg-forms-vs-formsubmit',
    category: 'compare',
    eyebrow: 'Comparison',
    title: 'RG Forms vs FormSubmit',
    metaTitle: 'RG Forms vs FormSubmit — Email Forwarding vs. a Record You Own',
    description:
      'FormSubmit is about as frictionless as a form endpoint gets — no account at all. RG Forms trades a two-minute setup for a durable record of every submission.',
    cardBlurb: 'No-account email forwarding vs. a two-minute setup that keeps a permanent record.',
    answer:
      "FormSubmit and RG Forms solve the same problem with different amounts of setup. FormSubmit needs no account at all — you point your form at their endpoint with your email address, confirm it once, and submissions are forwarded to your inbox, which makes it the fastest option in the category. RG Forms takes about two minutes to set up because it provisions a Google Sheet and an Apps Script endpoint inside your own Google account, and in exchange every submission is stored as a spreadsheet row you own rather than existing only as an email. Pick FormSubmit for speed on a small site; pick RG Forms when you want a searchable, sortable record that survives a deleted inbox.",
    intro: [
      "FormSubmit is the lowest-friction thing in this whole category, and that deserves respect. No signup, no dashboard, no config file — put an email address in a form action and you’re taking submissions.",
      "The difference is what you have afterwards.",
    ],
    sections: [
      DISCLOSURE,
      {
        type: 'table',
        heading: 'Side by side',
        columns: ['', 'FormSubmit', 'RG Forms'],
        rows: [
          ['Account required', 'No — confirm your address on first submission', 'Yes — sign in with Google'],
          ['Time to first working form', 'Under a minute', 'About two minutes'],
          ['Where submissions end up', 'Your inbox', 'A Google Sheet in your Drive, plus optional email'],
          ['Searchable history', 'Whatever your mail client gives you', 'A spreadsheet you can sort, filter and annotate'],
          ['Works without JavaScript', 'Yes — plain form post with redirect', 'No — `fetch` required'],
          ['Cost', 'Free', 'Free'],
          ['Custom redirect / thank-you page', 'Yes, via hidden fields', 'You stay on the page and show your own success state'],
          ['Spam protection', 'Built-in options including a captcha toggle', 'Honeypot, plus Cloudflare Turnstile verified server-side'],
        ],
      },
      {
        type: 'prose',
        heading: 'The real question: is an email enough?',
        body: [
          "For a personal site or a one-page portfolio, yes. Messages arrive, you reply, done. Adding a spreadsheet to that is ceremony you don’t need.",
          "It stops being enough at a predictable moment — usually when someone asks a question the inbox can’t answer. *How many enquiries did we get last month? Which ones haven’t been replied to? Can you send the marketing person a list?* Email is a delivery mechanism, not a record. If a notification is filtered, deleted, or sent to someone who has since left, the submission is simply gone.",
          "RG Forms writes the row first and emails second. If the email fails or the quota is hit, the row is still there. That ordering is the entire difference.",
        ],
      },
      {
        type: 'prose',
        heading: 'Choose FormSubmit when',
        body: [
          "**You want zero setup.** No account, no OAuth, no provisioning step. Hard to beat.",
          "**JavaScript can’t be a requirement.** The plain form post with a redirect works with JS disabled.",
          "**The site is small and personal.** A handful of messages a month, one person reading them.",
          "**You want a classic redirect flow.** Submit, land on a thank-you page. Some people prefer that to an in-page success state.",
        ],
      },
      {
        type: 'prose',
        heading: 'Choose RG Forms when',
        body: [
          "**You need the history.** Every submission, timestamped, in a sortable sheet — including the ones you deleted from your inbox by accident.",
          "**Someone else may need access.** Share a spreadsheet with a colleague; you can’t share your inbox.",
          "**It’s a client site.** Handing over a Google Sheet of leads is a deliverable. Forwarding emails isn’t.",
          "**You want the data to do something.** Charts, filters, a “replied?” column, or anything that reads Google Sheets.",
        ],
      },
      {
        type: 'code',
        heading: 'The RG Forms integration',
        code: HTML_FORM,
      },
      {
        type: 'callout',
        tone: 'success',
        heading: 'You can have both behaviours',
        body: [
          "Turning on email notifications in RG Forms gives you the FormSubmit experience — a message in your inbox for every submission, with the sender’s address as reply-to — while the row still lands in your sheet. The email is the notification; the sheet is the record.",
        ],
      },
    ],
    faq: [
      {
        q: 'Is FormSubmit’s no-account setup a security problem?',
        a: 'No — they confirm ownership of the destination address before forwarding starts, which is the check that matters. It’s a sensible design for what it does.',
      },
      {
        q: 'Does RG Forms have a redirect option?',
        a: 'Not built in. Because it’s a `fetch`, you stay on the page and show your own success state — which is generally the better experience, and you can always `window.location` to a thank-you page yourself after a success response.',
      },
      {
        q: 'Which one handles more volume?',
        a: 'Both are fine at contact-form volume. RG Forms’ one real ceiling is notification email — Google caps Apps Script at roughly 100 recipients/day on free Gmail — but rows keep saving past that, so nothing is lost.',
      },
      {
        q: 'Can I switch later without changing my form much?',
        a: 'Yes. Both are “point your form somewhere” tools. Moving means changing the endpoint URL and the submit handler — an hour of work at most, and you keep whatever history you already have.',
      },
    ],
    related: [
      'rg-forms-vs-formspree',
      'best-free-contact-form-for-html-websites',
      'rg-forms-vs-formspark',
      'html-contact-form-no-backend',
    ],
    updated: '2026-08-19',
  },

  {
    slug: 'rg-forms-vs-formspark',
    category: 'compare',
    eyebrow: 'Comparison',
    title: 'RG Forms vs Formspark',
    metaTitle: 'RG Forms vs Formspark — Two Developer-First Form Backends',
    description:
      'Formspark is a clean, developer-focused form backend with straightforward pricing. RG Forms is free and stores submissions in your own Google account. How to choose.',
    cardBlurb: 'Two developer-first tools. The split is pricing model and where submissions live.',
    answer:
      "Formspark and RG Forms are both aimed at developers who want to design their own form and just need somewhere for it to POST. Formspark is a paid, hosted service: submissions are stored on their platform, managed in their dashboard, and routed on via email, webhooks and integrations, with a pricing model based on submission volume rather than a per-seat subscription. RG Forms is free and stores nothing — it provisions a Google Sheet and an Apps Script endpoint inside your own Google account, so submissions land in your Drive and there is no vendor holding the data. Choose Formspark for a supported product with integrations; choose RG Forms when you want zero cost and full ownership.",
    intro: [
      "These two are aimed at the same person: someone who has already built the form, doesn’t want a form builder, and just needs a reliable place to POST to.",
      "Where they diverge is who runs the thing on the other end.",
    ],
    sections: [
      DISCLOSURE,
      {
        type: 'table',
        heading: 'Side by side',
        columns: ['', 'Formspark', 'RG Forms'],
        rows: [
          ['Model', 'Hosted service, paid by submission volume', 'Free; endpoint provisioned into your own Google account'],
          ['Where submissions live', 'Formspark’s platform', 'A Google Sheet in your Drive'],
          ['Setup', 'Create a form, copy the endpoint', 'Sign in with Google, define fields, copy the endpoint'],
          ['Integrations', 'Webhooks, email routing, Zapier and other connections', 'Anything that reads Google Sheets; the Apps Script is yours to edit'],
          ['Spam protection', 'Integrated options', 'Honeypot, plus Cloudflare Turnstile verified server-side'],
          ['Multiple forms', 'Create as many as your plan allows', 'Unlimited tabs in one project, one endpoint URL'],
          ['Support', 'A company you can email', 'GitHub issues and the docs'],
          ['Data portability', 'Export from their dashboard', 'It’s already a spreadsheet in your Drive'],
        ],
        note: 'Formspark’s pricing has changed over time — check their site for current numbers rather than trusting any comparison page, including this one.',
      },
      {
        type: 'prose',
        heading: 'What paying for it buys you',
        body: [
          "It’s worth being clear that “free” isn’t automatically the winning argument. Paying a vendor buys accountability: someone maintaining the service, monitoring uptime, filtering spam across a large corpus of traffic, answering support email, and shipping integrations you’d otherwise build yourself.",
          "With RG Forms, the infrastructure is Google’s and the responsibility is yours. If your Apps Script needs a change, you open the editor. If something behaves oddly, you read the code. That’s a good deal for people who like owning their stack — and the wrong deal for people who want a vendor to call.",
        ],
      },
      {
        type: 'prose',
        heading: 'Where RG Forms is genuinely different',
        body: [
          "The Apps Script endpoint has no dependency on rgforms.com. It isn’t a proxy to our servers or an API key we can revoke — it’s a deployment in your Google account that we happened to create for you. Delete your RG Forms session, and the endpoint keeps running.",
          "That property is unusual in this category, and it’s the reason to pick it: not because it costs nothing, but because there’s nobody in the middle.",
        ],
      },
      {
        type: 'code',
        heading: 'Test any endpoint before committing',
        intro: 'Whichever you pick, prove the round trip first — it takes ten seconds and saves an afternoon.',
        code: CURL_TEST,
      },
    ],
    faq: [
      {
        q: 'Is RG Forms slower than a purpose-built service?',
        a: 'Marginally, on the first request. Apps Script cold-starts in roughly 800ms–2s after a quiet period; after that it’s quick. With a “Sending…” state on the button nobody notices.',
      },
      {
        q: 'What happens at high volume?',
        a: 'Rows keep appending — Sheets holds millions of cells. The practical ceiling is notification email, which Google caps at about 100 recipients/day on free Gmail and 1,500 on Workspace. Past the cap, rows still save and only the email is skipped.',
      },
      {
        q: 'Can I edit what happens on submission?',
        a: 'Yes — the Apps Script is in your account. Add a Slack webhook, write to a second sheet, transform values before they’re stored. That’s not really possible with a hosted service unless it exposes a webhook.',
      },
      {
        q: 'Which is better for an agency?',
        a: 'It depends on your billing model. If you resell a managed service, a paid product with a dashboard and support is easy to justify. If you want to hand each client a site with no ongoing dependency on you, an endpoint in their own Google account is a cleaner exit.',
      },
    ],
    related: [
      'rg-forms-vs-formspree',
      'rg-forms-vs-formsubmit',
      'best-contact-form-backend-for-static-sites',
      'form-backend-for-static-sites',
    ],
    updated: '2026-08-19',
  },

  {
    slug: 'rg-forms-vs-google-forms',
    category: 'compare',
    eyebrow: 'Comparison',
    title: 'RG Forms vs Google Forms',
    metaTitle: 'RG Forms vs Google Forms — Form Builder or Form Backend?',
    description:
      'Both put responses in a Google Sheet. Google Forms builds and hosts the form; RG Forms takes the form you designed. Which one you need depends on that.',
    cardBlurb: 'Both end in a spreadsheet. One hosts the form for you; the other takes the form you built.',
    answer:
      "Google Forms and RG Forms both put responses into a Google Sheet, but they solve different halves of the problem. Google Forms is a form builder: it creates and hosts the form itself, gives you a drag-and-drop editor, question types, response charts and quiz logic, and you share a link or embed it in an iframe — so the form looks like Google Forms, not like your site. RG Forms is a form backend: you write your own HTML form, styled however you like, and it POSTs to an endpoint that appends rows to your sheet. Use Google Forms for surveys and internal collection; use RG Forms when the form is part of your website's design.",
    intro: [
      "These get compared constantly because they end in the same place — a spreadsheet in your Drive. But they’re answering different questions, and picking the wrong one shows up immediately in how your site looks.",
    ],
    sections: [
      DISCLOSURE,
      {
        type: 'table',
        heading: 'Side by side',
        columns: ['', 'Google Forms', 'RG Forms'],
        rows: [
          ['What it is', 'A form builder that hosts the form', 'A backend for a form you build'],
          ['Who designs the form', 'Google, from your questions', 'You, in your own HTML and CSS'],
          ['How it appears on your site', 'An iframe embed, or a link out', 'Native markup — it is part of your page'],
          ['Styling control', 'Theme colour, font and header image', 'Complete — it is your CSS'],
          ['Question types', 'Rich: multiple choice, grids, file upload, scales, sections, branching', 'Text, email, tel, textarea, select'],
          ['File uploads', 'Yes, for signed-in Google users', 'No'],
          ['Where responses go', 'A linked Google Sheet', 'A Google Sheet in your Drive'],
          ['Setup effort', 'Minutes, no code', 'Minutes, plus pasting a form into your page'],
          ['Cost', 'Free', 'Free'],
        ],
      },
      {
        type: 'prose',
        heading: 'The embed problem',
        body: [
          "You can embed a Google Form in your site, and plenty of people do. The trade-offs are consistent: it arrives in an iframe with Google’s own styling, a fixed height that fights with responsive layouts, its own scrollbar on mobile, and a “Never submit passwords through Google Forms” notice that looks out of place on a polished marketing page.",
          "On a landing page where the contact form is part of the design, it’s noticeable. On an internal survey nobody cares — and that’s exactly the point about which tool fits which job.",
        ],
      },
      {
        type: 'prose',
        heading: 'Where Google Forms is clearly better',
        body: [
          "**Surveys and questionnaires.** Rating scales, matrix questions, section branching, response summaries with charts built in. RG Forms has none of that and isn’t trying to.",
          "**Non-technical creators.** No HTML anywhere. If the person building it doesn’t write code, this is the answer.",
          "**File collection.** Google Forms can accept uploads into Drive (from signed-in Google users). RG Forms handles text only.",
          "**Quizzes and internal workflows.** Auto-grading, response validation, notifications to collaborators — mature features that come free.",
        ],
      },
      {
        type: 'prose',
        heading: 'Where RG Forms is clearly better',
        body: [
          "**When the form is part of your site.** Your fonts, your spacing, your colours, your validation, your success message — no iframe, no visual seam, no jump to a Google-branded page.",
          "**When you care about conversion.** A native form on the page consistently outperforms an embed that looks like it belongs to a different website.",
          "**When you want in-page success states.** Submit, see “Thanks — we’ll be in touch”, stay exactly where you were. No redirect, no reload.",
          "**When it’s a client site.** “Contact form” and “Google Form embed” are different deliverables, and clients can tell.",
        ],
      },
      {
        type: 'code',
        heading: 'What “part of your site” means in practice',
        intro: 'This is your markup and your CSS. Nothing about it says Google.',
        code: HTML_FORM,
      },
      {
        type: 'callout',
        tone: 'info',
        heading: 'They coexist happily',
        body: [
          "A common split: RG Forms for the contact form on the marketing site, Google Forms for the annual client survey or the event RSVP. Both write to Sheets in the same Drive, so the data ends up in the same place regardless.",
        ],
      },
    ],
    faq: [
      {
        q: 'Can I style a Google Form to match my site?',
        a: 'You can set a theme colour, a font and a header image. You can’t restyle the layout, the buttons or the surrounding chrome — it stays recognisably a Google Form.',
      },
      {
        q: 'Do both put data in the same kind of sheet?',
        a: 'Effectively yes. Google Forms links responses to a sheet it creates; RG Forms appends rows to a sheet it provisions. Both are ordinary Google Sheets in your Drive.',
      },
      {
        q: 'Which is better for accessibility?',
        a: 'Google Forms is competently accessible out of the box. A hand-built form can be better — proper labels, fieldsets, live-region status messages — but only if you actually do that work. If you won’t, the embed is the safer choice.',
      },
      {
        q: 'Can I use Google Forms without an iframe?',
        a: 'People do POST directly to a Google Form’s response URL using the field entry IDs. It works until Google changes something, it breaks silently when it does, and there’s no support for it. A purpose-built endpoint is the sturdier path.',
      },
    ],
    related: [
      'google-sheets-contact-form',
      'best-free-contact-form-for-html-websites',
      'static-website-contact-form',
      'form-backend-for-static-sites',
    ],
    updated: '2026-08-19',
  },

  {
    slug: 'best-contact-form-backend-for-static-sites',
    category: 'compare',
    eyebrow: 'Round-up',
    title: 'The best contact form backends for static sites',
    metaTitle: 'Best Contact Form Backend for Static Sites (2026)',
    description:
      'Six good options for taking form submissions on a static site — what each is best at, and the questions that actually decide it.',
    cardBlurb: 'Six good options, what each is best at, and the four questions that actually decide it.',
    answer:
      "The best contact form backend for a static site depends on one decision: where the submissions should live. If you want a full-featured hosted platform with integrations and support, Formspree and Formspark are the established choices. If you want the absolute minimum setup, FormSubmit forwards submissions to your inbox with no account. If you're staying on one host, Netlify Forms is built in and needs almost no code. If you want the data in a spreadsheet you own with no vendor in the middle, RG Forms provisions a Google Sheet and an Apps Script endpoint inside your own Google account for free. And if the form drives real business logic, writing your own serverless function is still the right answer.",
    intro: [
      "There is no single best option here, and any page that tells you otherwise is selling something. What there is, is a short list of good tools that make different trades.",
    ],
    sections: [
      DISCLOSURE,
      {
        type: 'prose',
        heading: 'Decide these four things first',
        body: [
          "**Who should own the submissions?** A vendor’s database, your host’s dashboard, or storage in your own account. This is the decision that’s expensive to reverse.",
          "**Does it need to work without JavaScript?** If yes, you need a service that accepts a plain HTML form post with a redirect, which rules several options out immediately.",
          "**Will the site move hosts?** Host-native forms are excellent until the migration, at which point they’re the thing that quietly breaks.",
          "**What does it cost at 10× volume?** Most pricing is per submission per month. Model the year it works, not the week you launch.",
        ],
      },
      {
        type: 'table',
        heading: 'The options',
        columns: ['Option', 'Best for', 'Data lives'],
        rows: [
          ['**Formspree**', 'A mature platform with integrations, file uploads and support behind it', 'Their platform'],
          ['**Formspark**', 'Developers who want a clean, no-nonsense paid endpoint', 'Their platform'],
          ['**FormSubmit**', 'The fastest possible setup — no account, straight to your inbox', 'Your inbox only'],
          ['**Netlify Forms**', 'Sites staying on Netlify that want near-zero code', 'Your Netlify dashboard'],
          ['**RG Forms**', 'Free, and submissions in a Google Sheet you own with no vendor in the path', 'Your Google Drive'],
          ['**Your own function**', 'Forms that trigger real logic — payments, CRM writes, complex rules', 'Wherever you send it'],
        ],
        note: 'Every one of these is a reasonable choice. Features and pricing move around — check each provider’s site before you commit.',
      },
      {
        type: 'prose',
        heading: 'How to pick, in one paragraph each',
        body: [
          "**Pick a hosted platform** (Formspree, Formspark) if you want someone else accountable for uptime, spam filtering and support, and you’re happy for submissions to live in their system. This is the default answer for most commercial projects and there’s nothing wrong with it.",
          "**Pick FormSubmit** if the site is small, personal, and an email in your inbox is genuinely all you need. It’s the least ceremony of anything here.",
          "**Pick your host’s built-in forms** if you’re confident you’re staying put. Netlify Forms in particular is a very good feature and needs almost no code.",
          "**Pick RG Forms** if data ownership matters — a client’s leads in the client’s own Drive — or if you want a permanent record in a spreadsheet at zero cost, with an endpoint that doesn’t depend on any vendor continuing to exist.",
          "**Write your own function** if the form does something beyond “tell me about it”. If there’s a charge to take, an account to create, or inventory to check, own the code.",
        ],
      },
      {
        type: 'checklist',
        heading: 'Whatever you pick, do these',
        items: [
          { label: 'Send a real submission from the deployed site', body: 'not localhost, not a preview. The number of live contact forms that go nowhere is genuinely alarming.' },
          { label: 'Add a honeypot field', body: 'it costs nothing and removes most low-effort bot traffic before anything else has to think about it.' },
          { label: 'Show a real error state with a fallback email', body: 'a failed submission should never be a dead end for the visitor.' },
          { label: 'Check where the notification actually lands', body: 'and whether it survives a spam filter. Test with a non-Gmail address too.' },
          { label: 'Write down what happens if you stop paying', body: 'and where the archive would come from. Future you will want to know.' },
        ],
      },
      {
        type: 'code',
        heading: 'The RG Forms version, for reference',
        code: HTML_FORM,
      },
    ],
    faq: [
      {
        q: 'What’s the difference between a form backend and a form builder?',
        a: 'A builder gives you the form — a hosted page or embed you configure. A backend takes the form you wrote in your own HTML and handles what happens after Submit. If you care how the form looks on your site, you want a backend.',
      },
      {
        q: 'Is a free option good enough for a client site?',
        a: 'It depends on the failure you’re insuring against. Free with the data in the client’s own Google account is a defensible choice. Free with no record anywhere is not.',
      },
      {
        q: 'How much spam should I expect?',
        a: 'A public endpoint on a public site will get bot traffic — it’s a matter of when. A honeypot removes most of it; a server-side captcha check removes nearly all of the rest.',
      },
      {
        q: 'Can I switch later?',
        a: 'Yes, easily. All of these are “point your form at a URL” tools, so migration is an endpoint swap plus moving whatever history you have. Export your data first — that’s the part people forget.',
      },
    ],
    related: [
      'best-free-contact-form-for-html-websites',
      'rg-forms-vs-formspree',
      'form-backend-for-static-sites',
      'how-to-add-a-contact-form-to-a-static-website',
    ],
    updated: '2026-08-19',
  },

  {
    slug: 'best-free-contact-form-for-html-websites',
    category: 'compare',
    eyebrow: 'Round-up',
    title: 'The best free contact form options for HTML websites',
    metaTitle: 'Best Free Contact Form for HTML Websites (2026)',
    description:
      'Genuinely free ways to take submissions on a plain HTML site — including what “free” means in each case, and where the ceiling is.',
    cardBlurb: 'What “free” actually means in each option, and exactly where each one’s ceiling is.',
    answer:
      "For a plain HTML website, the genuinely free options are: FormSubmit, which forwards submissions to your inbox with no account; the free tiers of hosted services like Formspree, which include a monthly submission allowance; your host's built-in forms if you're on Netlify; Google Forms if an embedded form is acceptable; and RG Forms, which is free without a tier because it provisions a Google Sheet and an Apps Script endpoint inside your own Google account rather than hosting anything itself. The distinction that matters is between free-as-a-tier, which has a ceiling and a paid plan above it, and free-because-there-is-no-infrastructure.",
    intro: [
      "“Free” covers two quite different things in this category, and the difference only becomes visible when your form starts working.",
    ],
    sections: [
      DISCLOSURE,
      {
        type: 'prose',
        heading: 'Two kinds of free',
        body: [
          "**Free as a tier.** A company hosts your submissions and gives away a slice of capacity — some number per month — hoping you’ll grow into a paid plan. Perfectly honest, and often the right choice: you get a real product with support, and the ceiling might be well above what you’ll ever use. But there is a ceiling, and there’s a bill on the other side of it.",
          "**Free because nothing is being hosted for you.** The endpoint runs on infrastructure you already have. Nobody is paying to store your data, so nobody needs to charge you. This is how RG Forms works — the Apps Script and the Sheet sit in your own Google account, on Google’s free quotas.",
          "Neither is better in the abstract. But when you’re choosing something for a site you’ll still be maintaining in three years, it’s worth knowing which one you picked.",
        ],
      },
      {
        type: 'table',
        heading: 'The free options, and where each ceiling sits',
        columns: ['Option', 'What free means', 'The ceiling'],
        rows: [
          ['**FormSubmit**', 'Free, no account needed', 'You get emails, not a stored record'],
          ['**Formspree free tier**', 'Free monthly submission allowance on a paid platform', 'The monthly allowance; paid plans above it'],
          ['**Netlify Forms**', 'Included with your Netlify site, with a plan allowance', 'Tied to Netlify; stops if you move hosts'],
          ['**Google Forms**', 'Free, unlimited', 'It’s an embed — the form won’t match your design'],
          ['**RG Forms**', 'Free with no tier — the endpoint is in your own Google account', '~100 notification emails/day on free Gmail (rows still save)'],
          ['**Your own function**', 'Free-ish on generous hosting tiers', 'You maintain code, storage and email delivery'],
        ],
      },
      {
        type: 'prose',
        heading: 'For a plain HTML site specifically',
        body: [
          "If your site is literally files — no framework, no build step, no npm — you want an option whose integration is markup plus a small script, with no SDK and no bundler. FormSubmit and RG Forms both qualify; hosted services generally do too, since a form endpoint is a form endpoint.",
          "The one to think twice about is a solution requiring a build step or a package, because on a site that has neither, you’ve just introduced a toolchain to collect an email address.",
        ],
      },
      {
        type: 'code',
        heading: 'The whole thing, on a plain HTML page',
        intro: 'No dependencies, no build, works when you open the file locally:',
        code: HTML_FORM,
      },
      {
        type: 'callout',
        tone: 'warning',
        heading: 'The free option that isn’t one',
        body: [
          "A `mailto:` link looks like the cheapest answer and is the only genuinely bad choice here. It depends on the visitor having a configured mail client — which many phones, shared computers and webmail users don’t. When it fails, nothing opens, no message is sent, and you never learn that someone tried to reach you.",
        ],
      },
    ],
    faq: [
      {
        q: 'Is a free form backend reliable enough for a business site?',
        a: 'Yes, with one condition: make sure submissions are stored somewhere durable, not just emailed. An email can be filtered or deleted; a spreadsheet row stays put.',
      },
      {
        q: 'What happens to RG Forms if it gets popular and costs money to run?',
        a: 'It doesn’t, structurally. The site is static and the endpoints live in users’ own Google accounts, so more users don’t create more cost for us. That’s why there’s no paid tier to introduce later.',
      },
      {
        q: 'Do free options put ads or branding on my form?',
        a: 'Not RG Forms — the markup is entirely yours. Some free tiers add a small “powered by” to their hosted thank-you page or notification emails; check before you launch if that matters.',
      },
      {
        q: 'What’s the catch with RG Forms?',
        a: 'Three real ones: it needs JavaScript, it doesn’t do file uploads, and notification email is capped by Google at roughly 100 recipients/day on a free Gmail account. Rows keep saving past that cap — only the email is skipped.',
      },
    ],
    related: [
      'best-contact-form-backend-for-static-sites',
      'html-contact-form-no-backend',
      'rg-forms-vs-formsubmit',
      'contact-form-without-backend',
    ],
    updated: '2026-08-19',
  },

  {
    slug: 'how-to-add-a-contact-form-to-a-static-website',
    category: 'compare',
    eyebrow: 'Tutorial',
    title: 'How to add a working contact form to a static website',
    metaTitle: 'How to Add a Contact Form to a Static Website — Step by Step',
    description:
      'A complete walkthrough: create the endpoint, add the markup, handle the states, block the bots, and verify it actually works before you launch.',
    cardBlurb: 'Start to finish — endpoint, markup, states, spam, and the verification step people skip.',
    answer:
      "To add a working contact form to a static website: create a hosted endpoint to receive submissions, add a plain HTML form to your page, submit it with JavaScript's fetch() instead of a normal form post, and show sending, success and error states. With RG Forms the endpoint is a Google Apps Script web app provisioned into your own Google account — sign in with Google, define your fields, authorize the script once, then POST to the endpoint URL with Content-Type: text/plain and a body of { tab, fields }. Each submission appends a row to your Google Sheet and optionally emails you. The whole process takes about ten minutes including testing.",
    intro: [
      "This is the complete version — every step, in order, including the two that get skipped and cause every “my contact form doesn’t work” support thread.",
    ],
    sections: [
      {
        type: 'steps',
        heading: 'The walkthrough',
        steps: [
          {
            title: 'Create the endpoint',
            body: "Sign in to RG Forms with Google. Name the project after your site and define your fields — name, email, message is the usual starting set. Turn on email notifications now if you want them: adding the capability later means re-authorizing the script, whereas enabling it up front costs nothing (no email sends until you set an address).",
          },
          {
            title: 'Wait for provisioning',
            body: "RG Forms creates a Drive folder, a Google Sheet with a header row matching your fields, and an Apps Script web app deployed at a permanent URL. About ninety seconds. Copy the endpoint URL — it looks like `https://script.google.com/macros/s/AKfycb.../exec` and never changes, even when you edit fields later.",
          },
          {
            title: 'Authorize the script — don’t skip this',
            body: "Open the endpoint URL in your browser while signed in to Google and approve the permission dialog. Google will warn that the app isn’t verified: the “app” is *your own script*, created minutes ago in your own account, which is exactly why it has no verification. Click **Advanced**, then **Go to <project> (unsafe)**, then **Allow**. Miss this step and notifications silently never send.",
          },
          {
            title: 'Prove the endpoint works before touching your site',
            body: "Ten seconds now, or an hour of guessing later. If a row appears in your Sheet, the backend half is finished and any problem after this point is in your page.",
            code: CURL_TEST,
          },
          {
            title: 'Add the form to your page',
            body: "Paste this in, replace the endpoint URL, and make sure each input’s `name` matches your field keys — the key is your field label lowercased with non-alphanumeric characters turned into underscores, so “Company Name” becomes `company_name`.",
            code: HTML_FORM,
          },
          {
            title: 'Handle the three states properly',
            body: "**Sending** — disable the button and say so, or people double-click and you get duplicate rows. **Success** — reset the form and confirm clearly. **Error** — show a real message with a fallback email address, so a failed submission never dead-ends. The snippet above covers the basics; expand the error path with a `try/catch` around the `fetch` for network failures.",
          },
          {
            title: 'Block the bots',
            body: "The hidden `_hp` honeypot in the snippet is already doing work — anything that arrives with it filled in is silently dropped. If you start seeing spam anyway, add [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/): put the widget in your form, send its token as `_captcha`, then switch verification on in your RG Forms dashboard. In that order — turning verification on before the widget is live would reject real submissions.",
          },
          {
            title: 'Test on the deployed site',
            body: "Not locally — on the real URL, on a phone as well as a desktop. Confirm the row lands in the Sheet and the notification reaches your inbox (check spam once). Then send one more a day later, because a form that works on launch day and not on Tuesday is the worst possible outcome.",
          },
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        heading: 'The single most common mistake',
        body: [
          "Setting `Content-Type: application/json`. It triggers a CORS preflight `OPTIONS` request, and Apps Script web apps can’t answer `OPTIONS`, so the browser blocks the request before it’s sent — you’ll see a CORS error in the console and nothing in the Network tab. Use `text/plain`. The body is still JSON.",
        ],
      },
      {
        type: 'checklist',
        heading: 'Pre-launch checklist',
        items: [
          { label: 'Submitted a real message from the deployed site', body: 'and confirmed it arrived in both the Sheet and the inbox.' },
          { label: 'Tested on a phone', body: 'the majority of contact form submissions on most sites are mobile.' },
          { label: 'Every input has a real `<label>`', body: 'not just a placeholder — better for screen readers, and it improves completion.' },
          { label: 'The error state names a fallback email address', body: 'so the visitor always has another route to you.' },
          { label: 'Checked the spam folder for the notification', body: 'once, deliberately, before you rely on it.' },
          { label: 'Know your notification limit', body: '~100 recipients/day on free Gmail, ~1,500 on Workspace. Rows still save past it.' },
        ],
      },
      {
        type: 'prose',
        heading: 'Framework-specific versions',
        body: [
          "The code above is plain HTML and works anywhere. If you’re on a framework, these are the idiomatic versions: [Astro](/astro-contact-form), [React](/react-contact-form-without-backend), [Hugo](/hugo-contact-form), [Jekyll](/jekyll-contact-form). By host: [GitHub Pages](/github-pages-contact-form), [Netlify](/netlify-contact-form), [Cloudflare Pages](/cloudflare-pages-contact-form), [Vercel](/vercel-static-contact-form).",
        ],
      },
    ],
    faq: [
      {
        q: 'How long does this take?',
        a: 'About ten minutes end to end — two for the endpoint, five for the markup and states, three for testing properly.',
      },
      {
        q: 'Do I need to know JavaScript?',
        a: 'You need to paste it. The snippet is complete and unmodified for most sites; the only thing you have to change is the endpoint URL and the field names.',
      },
      {
        q: 'My form submits but nothing appears in the sheet. What now?',
        a: 'Run the curl test. If that writes a row, the endpoint is fine and the problem is in your page — check the browser console for a CORS error (wrong `Content-Type`) and confirm your `tab` value matches your tab name exactly.',
      },
      {
        q: 'Can I have a separate form on another page?',
        a: 'Yes. Add a form in your dashboard — it becomes another tab in the same Sheet — and change the `tab` value in the request body. Same endpoint URL for all of them.',
      },
    ],
    related: [
      'static-website-contact-form',
      'html-contact-form-no-backend',
      'best-contact-form-backend-for-static-sites',
      'contact-form-for-ai-generated-websites',
    ],
    updated: '2026-08-19',
  },
];
