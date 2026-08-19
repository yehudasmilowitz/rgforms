import type { Guide } from '@/lib/guides/types';
import { HTML_FORM, CURL_TEST, REACT_FORM } from '@/lib/guides/snippets';

export const USE_CASE_GUIDES: Guide[] = [
  {
    slug: 'static-website-contact-form',
    category: 'use-case',
    eyebrow: 'Start here',
    title: 'How to add a contact form to a static website',
    metaTitle: 'Contact Form for a Static Website — Four Ways, Compared',
    description:
      'A static site has no server to receive a form POST. Here are the four architectures that solve it — host-native forms, a form endpoint service, your own serverless function, and mailto — and how to choose.',
    cardBlurb: 'The four real architectures for taking submissions on a site with no server — and how to pick.',
    answer:
      "A static website can't process a form on its own, because there's no server running your code when a visitor hits Submit. You solve it by sending the submission somewhere else: a form endpoint service (RG Forms, Formspree, Formspark, FormSubmit), a form feature built into your host (Netlify Forms, Cloudflare Pages), or a small serverless function you write and maintain yourself. RG Forms is the option where the endpoint lives in your own Google account — it provisions a Google Sheet plus an Apps Script web app inside your Drive, so submissions land in a spreadsheet you own, with no server to run and no monthly fee.",
    intro: [
      "Static sites are wonderful right up until someone asks for a contact form. HTML, CSS and JavaScript sitting on a CDN can render anything — but the moment a visitor clicks Submit, something has to be listening on the other end, and a static host isn’t.",
      "This page lays out every legitimate way to fix that, what each one costs you in money and maintenance, and how to decide.",
    ],
    sections: [
      {
        type: 'prose',
        heading: 'Why the form doesn’t “just work”',
        body: [
          "A plain `<form action=\"/submit\" method=\"post\">` expects a server at `/submit` to accept the request, validate it, store it and reply. On a static host there is no such process — your files are served from a CDN and nothing executes server-side. The POST hits a 405 or a 404, and the visitor sees a broken page.",
          "So every solution below is really the same move: **point the form at something that is running**. What differs is who runs it, where the data ends up, and who pays for it.",
        ],
      },
      {
        type: 'table',
        heading: 'The four approaches',
        intro: 'All four are legitimate. The right one depends on where you want the data to live and how much you want to maintain.',
        columns: ['Approach', 'Where data lives', 'Good when'],
        rows: [
          [
            'Form endpoint service',
            'The provider’s database (or, with RG Forms, your own Google Sheet)',
            'You want it working in minutes and you don’t want to run infrastructure.',
          ],
          [
            'Host-native forms',
            'Your host’s dashboard',
            'You’re already on a host that includes forms and you plan to stay there.',
          ],
          [
            'Your own serverless function',
            'Wherever you send it',
            'You need custom logic — payments, CRM writes, complex validation — and you’re happy owning the code.',
          ],
          [
            '`mailto:` link',
            'Nowhere; it opens the visitor’s mail client',
            'Almost never. It fails silently for anyone without a configured desktop mail app.',
          ],
        ],
        note: 'A note on `mailto:` — it isn’t a form backend. It hands the job to the visitor’s device, and on most phones and webmail setups nothing useful happens. Treat it as a fallback link, not a form.',
      },
      {
        type: 'prose',
        heading: 'What makes RG Forms different',
        body: [
          "Most form endpoint services store submissions on their servers and show them to you in their dashboard. That’s a perfectly reasonable model, and the good ones do it well.",
          "RG Forms inverts it. When you sign in with Google, it creates three things **inside your own Google account**: a Drive folder, a Google Sheet, and a Google Apps Script web app deployed at a permanent HTTPS URL. That Apps Script is your form backend. Submissions travel from your visitor’s browser directly to your script and land as rows in your spreadsheet.",
          "There’s no RG Forms server in the path — which is why it’s free, and why your endpoint keeps working even if rgforms.com disappears tomorrow. Google hosts the Sheet and the script the same way it hosts any other file in your Drive.",
        ],
      },
      {
        type: 'steps',
        heading: 'Setting it up',
        intro: 'From a blank page to a live endpoint is about two minutes.',
        steps: [
          {
            title: 'Sign in with Google and describe your form',
            body: "Name the project, then set your fields — name, email, phone, message by default, or whatever you need. Turn on email notifications if you want each submission in your inbox, and spam protection if you want [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) checked server-side.",
          },
          {
            title: 'Let it provision',
            body: "RG Forms creates the Drive folder, the Sheet with a header row matching your fields, and the Apps Script web app — then hands you a permanent endpoint URL like `https://script.google.com/macros/s/AKfycb.../exec`.",
          },
          {
            title: 'Authorize the script once',
            body: "Open the endpoint URL in your browser while signed in to Google and click through the permission screen. Google shows an “unverified app” warning here — the app in question is *your own script*, created minutes ago in your own account, which is why it has no verification. This is expected and safe.",
          },
          {
            title: 'Point your form at it',
            body: "Drop this into your page. It works on any static host, with or without a framework, with no build step.",
            code: HTML_FORM,
          },
        ],
      },
      {
        type: 'code',
        heading: 'Verify it end to end',
        intro: 'Before you wire up the UI, prove the endpoint works:',
        code: CURL_TEST,
        note: 'The `-L` matters: Apps Script answers with a redirect to a `googleusercontent.com` host that serves the actual response.',
      },
      {
        type: 'checklist',
        heading: 'What to check before you ship',
        items: [
          { label: 'Use `Content-Type: text/plain`', body: '`application/json` triggers a CORS preflight that Apps Script web apps cannot answer, so the browser blocks the request. The body is still JSON — only the header changes.' },
          { label: 'Add the honeypot', body: 'A hidden `_hp` field costs nothing and stops the bulk of drive-by bot submissions. Anything with `_hp` filled in is silently discarded.' },
          { label: 'Show real states', body: 'Sending, success and failure. A form that gives no feedback feels broken even when it works.' },
          { label: 'Know the email quota', body: 'Notifications send from your own Google account, which Google caps at roughly 100 recipients/day on free Gmail and 1,500/day on Workspace. Rows still save if you hit the cap — only the email is skipped.' },
        ],
      },
    ],
    faq: [
      {
        q: 'Do I need a server at all?',
        a: 'No. Your site stays 100% static. The only thing running is the Apps Script web app in your own Google account, and Google runs that for you at no cost.',
      },
      {
        q: 'Will this work on GitHub Pages, Netlify, Vercel, Cloudflare Pages?',
        a: 'Yes — it’s a plain `fetch()` from the browser, so the host is irrelevant. There are host-specific walkthroughs for [GitHub Pages](/github-pages-contact-form), [Netlify](/netlify-contact-form), [Cloudflare Pages](/cloudflare-pages-contact-form) and [Vercel](/vercel-static-contact-form).',
      },
      {
        q: 'What happens to submissions if I stop using RG Forms?',
        a: 'Nothing — they’re already in your Drive. The Sheet, the folder and the script are ordinary files in your Google account. You can keep using the endpoint, edit the script yourself, or export the Sheet and walk away.',
      },
      {
        q: 'Can I have more than one form?',
        a: 'Yes. Each form is a tab in the same Sheet and shares the same endpoint URL — you pick which one you’re writing to with the `tab` value in the request body.',
      },
    ],
    related: [
      'html-contact-form-no-backend',
      'form-backend-for-static-sites',
      'best-contact-form-backend-for-static-sites',
      'google-sheets-contact-form',
    ],
    updated: '2026-08-19',
  },

  {
    slug: 'html-contact-form-no-backend',
    category: 'use-case',
    eyebrow: 'Plain HTML',
    title: 'HTML contact form with no backend',
    metaTitle: 'HTML Contact Form With No Backend — Copy-Paste Setup',
    description:
      'A working contact form in a plain HTML file — no PHP, no Node, no build step, no framework. Submissions go straight to a Google Sheet you own.',
    cardBlurb: 'One HTML file, one fetch call, zero build tooling. For sites that are just files.',
    answer:
      "You can run a fully working contact form from a plain HTML file with no backend by POSTing the form data to a hosted endpoint with JavaScript's fetch(). With RG Forms the endpoint is a Google Apps Script web app created inside your own Google account, so the submission goes from the visitor's browser straight to your own Google Sheet. No PHP, no Node, no build step, and no server to keep alive — the entire integration is one form element and about fifteen lines of JavaScript.",
    intro: [
      "If your website is genuinely just files — an `index.html`, a stylesheet, maybe a logo — you don’t want a framework, a package manager, or a deploy pipeline just to collect an email address.",
      "You don’t need one. Here’s the whole thing.",
    ],
    sections: [
      {
        type: 'code',
        heading: 'The complete form',
        intro: 'Paste this into your page, replace the endpoint URL with your own, and you’re done. No dependencies, no bundler, nothing to install.',
        code: HTML_FORM,
        note: 'Everything above is standard browser API — `FormData`, `fetch`, `JSON.stringify`. It works in every browser released in the last several years.',
      },
      {
        type: 'prose',
        heading: 'What each piece is doing',
        body: [
          "**`event.preventDefault()`** stops the browser’s default form submission, which would navigate away to a URL your static host can’t handle.",
          "**`Object.fromEntries(new FormData(form))`** turns the form into a plain object using the `name` attribute of each input. Name your inputs to match your field keys and there is no mapping code to write or keep in sync.",
          "**`Content-Type: text/plain`** is the one non-obvious line. Sending `application/json` makes the browser fire a CORS preflight `OPTIONS` request first, and Apps Script web apps can’t respond to `OPTIONS` — so the request never happens. `text/plain` is a “simple” content type, which skips the preflight. The body is still a JSON string and the script parses it exactly the same.",
          "**The `_hp` input** is a honeypot. It sits off-screen where no human will ever type into it, so anything that arrives with it filled in came from a bot. Those submissions are dropped without saving — and the response still says success, so the bot has no idea it was caught.",
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        heading: 'Don’t use a `mailto:` link instead',
        body: [
          "It’s tempting — no service, no JavaScript. But `mailto:` hands the job to whatever mail client the visitor’s device has configured. On a phone with only webmail, or a shared computer, or a browser with no mail handler, clicking it does nothing at all. You never find out, because there’s no record anywhere. Every submission you lose is silent.",
        ],
      },
      {
        type: 'prose',
        heading: 'Where the data goes',
        body: [
          "Each submission becomes a row in a Google Sheet in your own Drive, with a `submitted_at` timestamp and one column per field. That’s a genuinely good place for contact submissions to live: you can sort and filter them, add a “replied?” column, share the sheet with a colleague, chart them, or pull them into anything that reads Sheets.",
          "If you switch on email notifications, each submission also arrives in your inbox — sent from your own Google account, with the visitor’s email set as the reply-to address, so you can just hit Reply.",
        ],
      },
      {
        type: 'checklist',
        heading: 'Making it production-ready',
        intro: 'The snippet above works. These four additions make it hold up in the real world.',
        items: [
          { label: 'Disable the button while sending', body: 'otherwise an impatient double-click writes two rows.' },
          { label: 'Handle the failure path', body: 'wrap the `fetch` in `try/catch` and show a message with a fallback email address if it throws. Networks fail.' },
          { label: 'Label your inputs properly', body: 'a real `<label>` per field, not just a placeholder. It’s better for screen readers, and it measurably improves completion rates.' },
          { label: 'Add Turnstile if you get spam', body: 'the honeypot handles low-effort bots. For anything more determined, RG Forms can verify a [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) token server-side in your script before saving the row.' },
        ],
      },
    ],
    faq: [
      {
        q: 'Does this need any JavaScript build tooling?',
        a: 'None. It’s an inline `<script>` tag in an HTML file. No npm, no bundler, no transpiler — open the file in a browser and it works.',
      },
      {
        q: 'What if the visitor has JavaScript disabled?',
        a: 'The form won’t submit, because the whole approach depends on `fetch`. In practice this affects a vanishingly small share of visitors, but if it matters to you, include a visible email address as a `<noscript>` fallback.',
      },
      {
        q: 'Can I add file uploads?',
        a: 'Not through this endpoint — it handles text fields only. If you need attachments, ask people to email you directly or link to a Google Drive upload form.',
      },
      {
        q: 'How do I add a second form to the same site?',
        a: 'Add a form in your RG Forms dashboard — it becomes a new tab in the same Sheet. Use the same endpoint URL and change `tab: "contact"` to the new tab name.',
      },
    ],
    related: [
      'static-website-contact-form',
      'contact-form-without-backend',
      'google-sheets-contact-form',
      'how-to-add-a-contact-form-to-a-static-website',
    ],
    updated: '2026-08-19',
  },

  {
    slug: 'contact-form-without-backend',
    category: 'use-case',
    eyebrow: 'Architecture',
    title: 'Contact form without a backend',
    metaTitle: 'Contact Form Without a Backend — What You Actually Give Up',
    description:
      'A backend does five specific jobs for a contact form. Here’s each one, and how to cover it without running a server of your own.',
    cardBlurb: 'The five jobs a backend was doing — and how each gets covered with no server of your own.',
    answer:
      "Running a contact form without a backend means replacing the five jobs a server was doing — receiving the POST, validating it, storing it, notifying you, and blocking spam — with services that already exist. A hosted form endpoint covers all five. RG Forms covers them using infrastructure inside your own Google account: an Apps Script web app receives the POST, appends a row to your Google Sheet, emails you from your own account, and verifies a Turnstile token before saving. You maintain no server, no database and no dependencies, and you still own every submission.",
    intro: [
      "“No backend” sounds like a compromise, as though you’re doing without something. It’s worth being precise about what a backend was actually doing for a contact form — because for this specific job, the list is short and every item on it has a good answer.",
    ],
    sections: [
      {
        type: 'table',
        heading: 'The five jobs, and who does them now',
        columns: ['The job', 'With a server you run', 'Without one (RG Forms)'],
        rows: [
          ['Receive the POST', 'Your route handler, on a host you pay for', 'An Apps Script web app in your Google account, at a permanent HTTPS URL'],
          ['Validate the data', 'Server-side validation code you wrote', 'HTML validation in the browser, plus whatever rules you add to the script'],
          ['Store it', 'A database you provision, back up and patch', 'A row in a Google Sheet you already own'],
          ['Notify you', 'An email API with its own key and bill', '`MailApp` sending from your own Google account, with reply-to set to the sender'],
          ['Block spam', 'Rate limiting and a captcha you wire up', 'A honeypot field, plus optional Cloudflare Turnstile verified server-side'],
        ],
      },
      {
        type: 'prose',
        heading: 'The thing you’re really avoiding is operations',
        body: [
          "Writing the endpoint was never the hard part — it’s twenty lines. The cost is everything that comes after: a host that has to stay up, a runtime that goes end-of-life, dependencies with security advisories, a database that needs backups, a certificate that expires, and a monthly bill for a service that receives four messages a week.",
          "For a contact form on a brochure site, that ratio is indefensible. The whole point of going serverless here is to delete the operational surface, not to be clever.",
        ],
      },
      {
        type: 'prose',
        heading: 'What “no backend” costs you',
        body: [
          "Being honest about the trade: because there’s no server of yours in the path, **required-field enforcement is a frontend concern**. A determined person can POST directly to the endpoint and skip your HTML validation. For a contact form that’s a non-issue — the worst case is a row with empty cells — but it’s the wrong architecture for anything that needs to be authoritative, like a payment or an account signup.",
          "Two other honest limits: there are **no file uploads** (text fields only), and reads via `GET ?tab=` are public to anyone who has the endpoint URL. If your form collects something genuinely sensitive, that’s worth knowing before you build on it.",
          "Everything else you’d expect — timestamps, multiple forms, custom fields, notification routing, CC/BCC, custom subjects, spam filtering — is there.",
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        heading: 'Where the data lives is the real decision',
        body: [
          "Every hosted form service removes the operational burden. What separates them is custody: with most, submissions live in the provider’s database and you read them through their dashboard. With RG Forms they live in a Google Sheet in your Drive, and the code that writes them is a script you can open and read.",
          "Neither is wrong. But if you’re handing a site to a client, “your leads are in your own Google account, and here’s the sheet” is a much easier sentence than “your leads are in my vendor account, and here’s the login.”",
        ],
      },
      {
        type: 'code',
        heading: 'The entire client side',
        intro: 'This is the complete integration — there is no server-side counterpart to write.',
        code: HTML_FORM,
      },
    ],
    faq: [
      {
        q: 'Is a serverless function a “backend”?',
        a: 'Functionally yes — it’s your code, running on demand, that you own and maintain. It’s a great choice when you need custom logic. It’s overkill when all you need is “put this message somewhere I’ll see it.”',
      },
      {
        q: 'Can I add server-side validation later?',
        a: 'Yes — the Apps Script is in your own account and fully editable. Open it in the Apps Script editor and add whatever rules you want before the row is written.',
      },
      {
        q: 'Is it slower than a real backend?',
        a: 'The first request after a period of inactivity takes roughly 800ms–2s while Apps Script cold-starts; subsequent ones are fast. For a contact form nobody notices, especially with a “Sending…” state on the button.',
      },
      {
        q: 'What happens if Google is down?',
        a: 'The submission fails, same as any hosted service having an outage. Catch the error and show a fallback email address so the visitor still has a way to reach you.',
      },
    ],
    related: [
      'form-backend-for-static-sites',
      'html-contact-form-no-backend',
      'static-website-contact-form',
      'best-free-contact-form-for-html-websites',
    ],
    updated: '2026-08-19',
  },

  {
    slug: 'google-sheets-contact-form',
    category: 'use-case',
    eyebrow: 'Google Sheets',
    title: 'Send contact form submissions to a Google Sheet',
    metaTitle: 'Contact Form to Google Sheets — Without Writing Apps Script',
    description:
      'Get website form submissions into a Google Sheet you own. The DIY Apps Script route explained, and the two-minute version that sets it all up for you.',
    cardBlurb: 'Form → spreadsheet, in your own Drive. The DIY script route vs. the two-minute one.',
    answer:
      "To send website contact form submissions to a Google Sheet, you need a Google Apps Script web app bound to that sheet, deployed to run as you and be callable by anyone, with your form POSTing JSON to its /exec URL. You can write and deploy that script by hand, or RG Forms can create the whole thing — Drive folder, Sheet with a matching header row, script, and deployment — inside your own Google account in about ninety seconds. Either way the sheet, the script and the data belong to you, and Google hosts it at no cost.",
    intro: [
      "A spreadsheet is an underrated place for form submissions to land. It’s sortable, filterable, shareable, chartable, exportable, and everyone on your team already knows how to use it — which is more than most form dashboards can claim.",
      "There are two ways to get there.",
    ],
    sections: [
      {
        type: 'prose',
        heading: 'The DIY route, honestly described',
        body: [
          "Doing this by hand is a real option, and it’s worth understanding because it’s exactly what RG Forms automates. You create a Sheet, open **Extensions → Apps Script**, write a `doPost(e)` that parses `e.postData.contents` and calls `appendRow`, then deploy it as a web app with **Execute as: Me** and **Who has access: Anyone**. Google gives you an `/exec` URL, and your form POSTs to it.",
          "The parts that trip people up: getting the deployment access setting right (anything stricter and anonymous visitors get a login page instead of your endpoint), remembering that `application/json` triggers a CORS preflight Apps Script can’t answer, keeping the header row and the payload keys in sync by hand, and re-deploying a **new version** every time you edit the script — editing alone doesn’t change what the live URL runs.",
          "None of it is hard. It’s just fiddly enough that most people get it working once, then never want to do it again for the next site.",
        ],
      },
      {
        type: 'prose',
        heading: 'The two-minute route',
        body: [
          "RG Forms does the same thing through the Google APIs, from your browser, with your own OAuth token. It creates a Drive folder, a Sheet whose header row matches the fields you defined, a bound Apps Script project, and a web app deployment — then hands you the endpoint URL.",
          "The difference worth knowing about is the **`_manifest` tab**: a hidden tab in your sheet holding the project’s configuration as JSON. The script reads it on every request, so adding a form, renaming a field, changing the notification address or toggling spam protection takes effect immediately — no redeploy, and the endpoint URL never changes.",
        ],
      },
      {
        type: 'table',
        heading: 'What your sheet looks like',
        intro: 'One tab per form, one row per submission, one column per field:',
        columns: ['submitted_at', 'name', 'email', 'message'],
        rows: [
          ['2026-08-19T14:02:11.480Z', 'Ada Lovelace', 'ada@example.com', 'Do you take on small projects?'],
          ['2026-08-19T16:41:55.002Z', 'Grace Hopper', 'grace@example.com', 'Sending over the brief now.'],
        ],
        note: 'Column keys come from your field labels — lowercased, with any run of non-alphanumeric characters collapsed to `_`. So “Company Name” becomes `company_name`. That’s the key you send in `fields`.',
      },
      {
        type: 'code',
        heading: 'Posting to it',
        code: HTML_FORM,
      },
      {
        type: 'callout',
        tone: 'success',
        heading: 'Why the spreadsheet being *yours* matters',
        body: [
          "The Sheet, the folder and the script are ordinary files in your Drive. You can rename them, move them, share them, revoke access, open the script and edit its code, or delete the whole project — without asking anyone. If you stop using rgforms.com, the endpoint keeps running, because nothing about it depends on rgforms.com.",
        ],
      },
    ],
    faq: [
      {
        q: 'Do I need to write any Apps Script code?',
        a: 'No. RG Forms generates and deploys it. But the code is right there in your account if you want to read it or extend it — add a Slack ping, write to a second sheet, whatever you need.',
      },
      {
        q: 'Why does Google warn me that the app isn’t verified?',
        a: 'Because the “app” in that dialog is your own script, created minutes ago in your own account. Google shows that screen for any Apps Script requesting sensitive permissions that hasn’t been through its verification program — which every personal script has in common. Click Advanced, then continue, then Allow.',
      },
      {
        q: 'Can several forms share one sheet?',
        a: 'Yes, and that’s the intended shape: one project per website, one tab per form, one endpoint URL for all of them. You choose the destination with the `tab` value in your request.',
      },
      {
        q: 'Is there a submission limit?',
        a: 'Nothing meaningful for a contact form. Google Sheets holds up to 10 million cells, and Apps Script’s free quotas are far above typical contact-form traffic. The one real cap is email: about 100 recipients/day on free Gmail, 1,500 on Workspace — and if you hit it, rows still save.',
      },
    ],
    related: [
      'form-backend-for-static-sites',
      'static-website-contact-form',
      'rg-forms-vs-google-forms',
      'html-contact-form-no-backend',
    ],
    updated: '2026-08-19',
  },

  {
    slug: 'form-backend-for-static-sites',
    category: 'use-case',
    eyebrow: 'Category guide',
    title: 'What a form backend is, and how to choose one',
    metaTitle: 'Form Backend for Static Sites — What It Is and How to Choose',
    description:
      'A form backend is the hosted endpoint that receives, stores and forwards submissions from a static site. Here’s what to evaluate before you pick one.',
    cardBlurb: 'What a form backend actually does, and the eight questions worth asking before you pick.',
    answer:
      "A form backend is a hosted HTTPS endpoint that receives submissions from a static website, stores them, and notifies you — replacing the server-side code a static site can't run. When choosing one, the questions that matter are: where the data is stored and who owns it, whether the endpoint survives you cancelling the service, how spam is handled, whether it works without a build step, and what happens when volume grows. RG Forms answers the ownership question differently from most: the endpoint is a Google Apps Script web app in your own Google account and submissions land in your own Google Sheet, so there is no vendor holding your data.",
    intro: [
      "“Form backend” is one of those terms that gets used as if everyone agrees what it means. It’s worth pinning down before comparing options — because the differences between the good ones are mostly invisible until you’ve been running on one for a year.",
    ],
    sections: [
      {
        type: 'prose',
        heading: 'The definition',
        body: [
          "A form backend is a hosted endpoint that does the server half of a form submission on behalf of a site that has no server. At minimum it accepts a POST, stores the data, and tells you about it. Beyond that, providers add dashboards, integrations, autoresponders, file uploads, workflow rules and analytics.",
          "The category exists because static hosting won. Once your site is files on a CDN, the form is the one piece that still needs something running — and nobody wants to stand up a server for a single POST route.",
        ],
      },
      {
        type: 'checklist',
        heading: 'Eight questions worth asking',
        intro: 'In roughly the order they’ll bite you:',
        items: [
          { label: 'Where does the data physically live?', body: 'the provider’s database, or somewhere you control? This determines what you can say to a client about their leads, and what happens in a dispute.' },
          { label: 'What happens if you stop paying — or they stop operating?', body: 'do submissions become unreachable, or is the archive already somewhere you own? Ask this before volume gets interesting.' },
          { label: 'How is spam handled?', body: 'a honeypot catches the cheap stuff. A server-side captcha check catches the rest. Client-side-only filtering catches neither.' },
          { label: 'Does it need a build step or a framework?', body: 'if the integration is a plain `fetch`, it works everywhere forever. If it’s an SDK, you’ve taken on a dependency.' },
          { label: 'How do notifications actually send?', body: 'through the provider’s mail infrastructure, or from your own account? This affects deliverability, the reply-to address, and daily limits.' },
          { label: 'Can one project serve several forms?', body: 'contact, newsletter, quote request. Paying per form, or juggling four endpoint URLs, gets old.' },
          { label: 'Is the data exportable in a format you’d actually use?', body: 'CSV export is table stakes. Data that’s already in a spreadsheet skips the question entirely.' },
          { label: 'What does it cost at 10× today’s volume?', body: 'most pricing is per submission per month. Model the year you succeed, not the month you launch.' },
        ],
      },
      {
        type: 'prose',
        heading: 'How RG Forms answers those',
        body: [
          "Data lives in a Google Sheet in your Drive. If RG Forms disappeared tonight, your endpoint would keep serving requests tomorrow, because it’s an Apps Script deployment in your account with no dependency on rgforms.com.",
          "Spam is a hidden honeypot field plus optional Cloudflare Turnstile, verified server-side inside your script before anything is written. Integration is a plain `fetch` — no SDK, no build step, no framework requirement. Notifications send from your own Google account, so replies come back to you and the reply-to is the visitor’s address.",
          "One project covers as many forms as you need — each is a tab in the same Sheet behind one endpoint URL. And it’s free, because there’s no infrastructure for anyone to bill you for.",
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        heading: 'When a different tool is the better call',
        body: [
          "If you need file uploads, hosted autoresponder sequences, payment collection, multi-step logic with conditional branching, or a submissions dashboard your non-technical client will log into — a full-featured hosted form service is genuinely the better fit, and there are several good ones. RG Forms is deliberately narrow: text submissions, into your spreadsheet, for free, with no vendor in the middle.",
        ],
      },
    ],
    faq: [
      {
        q: 'Is a form backend the same as a form builder?',
        a: 'No. A form builder gives you the form itself — a hosted page or embed with a drag-and-drop editor. A form backend takes the form *you* built in your own HTML and handles what happens after Submit. If you want to design the form yourself, you want a backend.',
      },
      {
        q: 'Do I still need one if my host has built-in forms?',
        a: 'Not necessarily — host-native forms are convenient if you’re staying put. An independent backend is worth it when you want the data somewhere you own, or want the site to be portable between hosts without rewriting the form.',
      },
      {
        q: 'Can a form backend work without JavaScript?',
        a: 'Some support a plain HTML `action=` POST with a redirect, which works without JS. RG Forms uses `fetch`, which means JavaScript is required — the trade is that the visitor stays on your page instead of being bounced to a third-party thank-you screen.',
      },
    ],
    related: [
      'best-contact-form-backend-for-static-sites',
      'contact-form-without-backend',
      'static-website-contact-form',
      'google-sheets-contact-form',
    ],
    updated: '2026-08-19',
  },

  {
    slug: 'contact-form-for-ai-generated-websites',
    category: 'use-case',
    eyebrow: 'AI-built sites',
    title: 'Adding a contact form to an AI-generated website',
    metaTitle: 'Contact Form for an AI-Generated Website (v0, Lovable, Claude, Cursor)',
    description:
      'AI site builders produce beautiful front ends with dead contact forms. Here’s how to give one a real endpoint — including a spec file your AI assistant can wire up for you.',
    cardBlurb: 'The form your AI builder generated looks perfect and goes nowhere. Here’s the missing half.',
    answer:
      "AI website builders generate the markup and styling for a contact form but not the backend that receives it, so the form usually looks finished and silently does nothing. To make it real, give it a hosted endpoint and have the submit handler POST to it. RG Forms creates that endpoint inside your own Google account in about ninety seconds and exports an RGFORMS.md spec file listing your endpoint URL, form tabs, exact field keys and calling convention — drop that file into your project and an AI coding assistant can wire the form up correctly without guessing.",
    intro: [
      "There’s a specific moment that catches people out. The AI built the site, the design is genuinely good, the contact form has nice focus states and validation — and then the first real enquiry vanishes into nothing, because no backend was ever created.",
      "This is the single most common gap in AI-generated sites, and it’s the easiest to close.",
    ],
    sections: [
      {
        type: 'prose',
        heading: 'Why it happens',
        body: [
          "A generated form is usually one of three things: a bare `<form>` with no `action`, an `onSubmit` handler that logs to the console or fakes a delay with `setTimeout`, or a `TODO` comment where the fetch should be. The model produced exactly what it was asked for — the interface — and the part it can’t produce is an endpoint that exists on the internet with your data behind it.",
          "So test before you launch. Submit your own form and check that the message actually reached you. If nothing arrives, the backend is missing, not broken.",
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        heading: 'Check for fake success states',
        body: [
          "The failure mode to watch for is a form that shows “Thanks, we’ll be in touch!” with no network request behind it. It’s convincing, it demos beautifully, and it will quietly eat every lead. Open your browser devtools, submit the form, and confirm you see a real request in the Network tab.",
        ],
      },
      {
        type: 'steps',
        heading: 'Wiring it up',
        steps: [
          {
            title: 'Create the endpoint',
            body: "Sign in to RG Forms with Google and define fields that match the form your builder generated — same labels, same order. Takes about ninety seconds and produces a permanent endpoint URL.",
          },
          {
            title: 'Export RGFORMS.md and drop it in the repo',
            body: "From your dashboard, download **RGFORMS.md** — a spec file listing your endpoint URL, every form tab, the exact field keys, the `text/plain` calling convention, and the honeypot and captcha snippets. Put it at the root of the project.",
          },
          {
            title: 'Ask your AI assistant to wire it up',
            body: "In Claude Code, Cursor, Copilot, Windsurf or whatever you’re using, say: *“Read RGFORMS.md and connect the contact form on the homepage to the endpoint, with sending, success and error states.”* The spec file is what stops it from inventing an API shape.",
          },
          {
            title: 'Verify with a real submission',
            body: "Submit the form on the deployed site and confirm the row lands in your Google Sheet and the notification hits your inbox. If nothing arrives, check the browser console — a CORS error means something set `Content-Type: application/json`, which is the one mistake assistants reliably make here.",
            code: CURL_TEST,
          },
        ],
      },
      {
        type: 'prose',
        heading: 'If you’d rather paste the code yourself',
        body: [
          "Most AI-generated sites are React — Next.js, Vite, or a builder-specific wrapper. The component below drops in as-is; the [React guide](/react-contact-form-without-backend) covers the variations. If your site is plain HTML, use the [HTML version](/html-contact-form-no-backend).",
        ],
      },
      {
        type: 'code',
        code: REACT_FORM,
      },
      {
        type: 'callout',
        tone: 'success',
        heading: 'A useful property for handoffs',
        body: [
          "Because the Sheet and script live in a Google account rather than a vendor account, you can build the site under your own account and later transfer ownership of the Drive folder to the client — or have them create the project on their own account from the start. Either way, nobody has to share a password to a form dashboard.",
        ],
      },
    ],
    faq: [
      {
        q: 'Which AI builders does this work with?',
        a: 'All of them — v0, Lovable, Bolt, Replit, Framer exports, or anything Claude, Cursor or Copilot generated. The integration is a browser `fetch` call, so it doesn’t care what wrote the markup.',
      },
      {
        q: 'What exactly is RGFORMS.md?',
        a: 'A plain-English spec of your project: endpoint URL, tab names, field keys and types, required flags, the calling convention, and copy-paste snippets. It exists so an AI assistant working in your codebase has the real API in front of it instead of guessing at one.',
      },
      {
        q: 'My AI assistant wrote the fetch with `Content-Type: application/json`. Why did it break?',
        a: 'That header triggers a CORS preflight `OPTIONS` request, and Apps Script web apps can’t answer `OPTIONS`, so the browser blocks the call before it’s sent. Change it to `text/plain` — the body stays JSON and the script parses it identically.',
      },
      {
        q: 'Can the AI create the RG Forms project too?',
        a: 'No — provisioning needs a real Google sign-in from you, and that’s deliberate: it’s what keeps the endpoint and the data inside your own account rather than someone else’s.',
      },
    ],
    related: [
      'react-contact-form-without-backend',
      'html-contact-form-no-backend',
      'vercel-static-contact-form',
      'static-website-contact-form',
    ],
    updated: '2026-08-19',
  },
];
