import type { Guide } from '@/lib/guides/types';
import { HTML_FORM, CURL_TEST } from '@/lib/guides/snippets';

export const PLATFORM_GUIDES: Guide[] = [
  {
    slug: 'github-pages-contact-form',
    icon: 'Github',
    category: 'platform',
    eyebrow: 'GitHub Pages',
    title: 'Adding a contact form to a GitHub Pages site',
    metaTitle: 'GitHub Pages Contact Form — No Server, No Functions',
    description:
      'GitHub Pages serves static files and nothing else — no PHP, no functions, no server-side code. Here’s how to run a real contact form on it anyway.',
    cardBlurb: 'GitHub Pages runs no server-side code at all. An external endpoint is the only route — here it is.',
    answer:
      "GitHub Pages serves static files only — it runs no server-side code and offers no serverless functions — so a contact form there must POST to an endpoint hosted somewhere else. With RG Forms that endpoint is a Google Apps Script web app in your own Google account: your page sends a fetch() to it and each submission lands as a row in your own Google Sheet. Nothing about your repository or your Pages build changes, and the whole setup stays free.",
    intro: [
      "GitHub Pages is the strictest of the common static hosts. Netlify, Vercel and Cloudflare Pages all let you bolt on a function when you need one; Pages does not. It serves files. That’s the entire feature set, and it’s why it’s so reliable.",
      "Which makes the contact form question simple: the endpoint lives elsewhere, full stop.",
    ],
    sections: [
      {
        type: 'prose',
        heading: 'What you can’t do on GitHub Pages',
        body: [
          "There’s no PHP, no Node process, no serverless runtime, and no way to handle a POST to your own domain. GitHub Actions can run code, but only at build time — it can’t receive a request from a visitor. The `action=\"/contact\"` pattern from PHP-era tutorials has nowhere to land.",
          "The only remaining options are an external form endpoint or a `mailto:` link, and `mailto:` quietly fails for any visitor without a configured desktop mail client.",
        ],
      },
      {
        type: 'steps',
        heading: 'The setup',
        steps: [
          {
            title: 'Create your endpoint',
            body: "Sign in to RG Forms with Google, name the project after your repo, and set your fields. You get back a permanent URL like `https://script.google.com/macros/s/AKfycb.../exec`.",
          },
          {
            title: 'Authorize the script once',
            body: "Open that URL in your browser while signed in to Google and approve the permission screen. Until you do, the script can’t send notification emails.",
          },
          {
            title: 'Add the form to your page',
            body: "Drop this into any page in your repo — `index.html`, a Jekyll layout, an include, wherever your contact section lives.",
            code: HTML_FORM,
          },
          {
            title: 'Commit and push',
            body: "Pages rebuilds and the form is live. No workflow changes, no secrets to configure, no build plugin.",
          },
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        heading: 'If your repo uses Jekyll',
        body: [
          "GitHub Pages runs Jekyll by default, and Jekyll will try to interpret `{{` and `{%` inside your files. The snippet above contains neither, so it passes through untouched — but if you templatise it, wrap the script in `{% raw %}` … `{% endraw %}`.",
          "If you aren’t using Jekyll at all, add an empty `.nojekyll` file at the repo root so Pages skips processing entirely — it also stops Jekyll ignoring folders that start with an underscore.",
        ],
      },
      {
        type: 'prose',
        heading: 'The endpoint URL is public — and that’s fine',
        body: [
          "Your repository is probably public, so anyone can read the endpoint URL out of your HTML. That’s expected: it has to be publicly callable for anonymous visitors to submit at all, exactly like every other form endpoint on the web.",
          "What protects you is the honeypot and, if you want it, Cloudflare Turnstile verified inside your script before a row is written. What the URL doesn’t give anyone is access to your Google account — the script can only touch its own spreadsheet.",
          "One thing to know: a `GET` to the endpoint with `?tab=contact` returns that tab’s submissions as JSON, and that read is as public as the write. Don’t collect anything through it that you wouldn’t be comfortable having read by someone who found the URL in your source.",
        ],
      },
      {
        type: 'code',
        heading: 'Check it before you announce it',
        code: CURL_TEST,
      },
      {
        type: 'checklist',
        heading: 'GitHub Pages specifics worth remembering',
        items: [
          { label: 'Custom domains work unchanged', body: 'the fetch is cross-origin either way, and the endpoint accepts requests from any origin.' },
          { label: 'No build secrets needed', body: 'the endpoint URL isn’t a credential, so there’s nothing to hide in Actions secrets — which is good, because Pages can’t inject env vars into static output anyway.' },
          { label: 'It survives repo transfers', body: 'the endpoint lives in your Google account, not the repo. Move the repo, change the org, rename the project — the form keeps working.' },
          { label: 'Project sites and user sites are identical here', body: 'nothing in this depends on the path your site is served from.' },
        ],
      },
    ],
    faq: [
      {
        q: 'Can’t I use GitHub Actions to handle the submission?',
        a: 'No. Actions run on push, schedule, or other repository events — they can’t receive an HTTP request from a visitor’s browser. There’s the `repository_dispatch` API, but calling it requires a token, and putting a repo-write token in public client-side code is not something you want to do.',
      },
      {
        q: 'Does this work with GitHub Pages’ HTTPS?',
        a: 'Yes. Both your site and the endpoint are HTTPS, so there’s no mixed-content problem.',
      },
      {
        q: 'What about GitHub Issues as a form backend?',
        a: 'People do it, and it works, but it needs a token in client-side code or a proxy — and every submission becomes a public issue. For contact forms, a private spreadsheet is a better home.',
      },
      {
        q: 'Will this slow my Pages site down?',
        a: 'No. It’s about fifteen lines of inline JavaScript with no libraries, and no request is made until someone actually submits.',
      },
    ],
    related: [
      'jekyll-contact-form',
      'html-contact-form-no-backend',
      'static-website-contact-form',
      'cloudflare-pages-contact-form',
    ],
    updated: '2026-08-19',
  },

  {
    slug: 'netlify-contact-form',
    icon: 'Netlify',
    category: 'platform',
    eyebrow: 'Netlify',
    title: 'Contact forms on Netlify: the built-in option and the portable one',
    metaTitle: 'Netlify Contact Form — Netlify Forms vs. an External Endpoint',
    description:
      'Netlify Forms is genuinely good and needs almost no code. Here’s when it’s the right call, when an external endpoint fits better, and how to wire one up.',
    cardBlurb: 'Netlify Forms is excellent. Here’s when to use it, and when you want the data in your own Drive.',
    answer:
      "Netlify has a built-in form handler: add a netlify attribute to your form and Netlify's build step detects it and starts capturing submissions into your site dashboard, with no code at all. It's the fastest option if you're staying on Netlify. An external endpoint like RG Forms is the better fit when you want submissions stored in your own Google Sheet rather than a host dashboard, when the site may move hosts later, or when the same form code needs to run identically across several projects — because a plain fetch() has no host-specific build magic behind it.",
    intro: [
      "Netlify Forms deserves credit: it’s one of the neatest features on any static host. You add an attribute, Netlify’s build parses your HTML, and submissions start appearing in your dashboard. For a lot of sites that is exactly the right answer, and this page isn’t going to pretend otherwise.",
      "But it’s worth understanding the trade you’re making, because the convenience comes from being deeply tied to the platform.",
    ],
    sections: [
      {
        type: 'table',
        heading: 'Two good options, different shapes',
        columns: ['', 'Netlify Forms', 'RG Forms'],
        rows: [
          ['Setup', 'Add a `netlify` attribute; detected at build', 'Sign in with Google; POST to your endpoint'],
          ['Where submissions live', 'Your Netlify site dashboard', 'A Google Sheet in your own Drive'],
          ['Cost', 'Included, with a monthly submission allowance per plan — see Netlify’s pricing', 'Free; no infrastructure to bill for'],
          ['If you move hosts', 'Form handling stops; export first', 'Nothing changes — the endpoint isn’t tied to a host'],
          ['Spam handling', 'Built-in filtering, plus honeypot and captcha options', 'Honeypot, plus optional Cloudflare Turnstile verified server-side'],
          ['Works locally / on any preview', 'Only on deployed Netlify builds', 'Anywhere, including `localhost`'],
        ],
        note: 'Neither of these is the “right” answer in general. Pick on data custody and portability, not on features — both cover the basics well.',
      },
      {
        type: 'prose',
        heading: 'When Netlify Forms is the better choice',
        body: [
          "You’re staying on Netlify, you want zero JavaScript, and you want submissions in the same dashboard as your deploys. It also handles a plain non-JS form post with a redirect, which is genuinely useful if you care about the no-JavaScript case.",
        ],
      },
      {
        type: 'prose',
        heading: 'When an external endpoint fits better',
        body: [
          "**The site might move.** Agency work gets migrated. When it does, host-native forms are the piece that quietly breaks, and the submission history has to be exported before the account is closed.",
          "**The client should own the data.** Handing over a Google Sheet in the client’s own Drive is a cleaner boundary than sharing access to your Netlify account, and it doesn’t depend on your billing relationship continuing.",
          "**You want it working in local dev.** Netlify’s form detection happens at deploy time, so you can’t exercise the real path on `localhost` without a deploy. A `fetch` to an endpoint behaves identically everywhere.",
          "**You maintain many sites.** One integration pattern that’s identical across every project — regardless of host or framework — is worth a lot when you’re maintaining a dozen of them.",
        ],
      },
      {
        type: 'steps',
        heading: 'Wiring up an external endpoint on Netlify',
        steps: [
          {
            title: 'Create the RG Forms project',
            body: "Sign in with Google, define your fields, and copy the endpoint URL.",
          },
          {
            title: 'Store the URL as an environment variable (optional)',
            body: "In **Site configuration → Environment variables**, add e.g. `VITE_FORM_ENDPOINT` or `PUBLIC_FORM_ENDPOINT` depending on your framework’s prefix convention. This isn’t about secrecy — the URL ends up in the client bundle regardless — it’s so a rebuild can repoint the form without a code change.",
          },
          {
            title: 'Add the form',
            body: "Note there’s no `netlify` attribute and no `data-netlify` — you’re deliberately opting out of the build-time detection.",
            code: HTML_FORM,
          },
          {
            title: 'Deploy and submit a real message',
            body: "Confirm the row lands in your Sheet. If you’d rather test before deploying, hit the endpoint directly.",
            code: CURL_TEST,
          },
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        heading: 'You can run both',
        body: [
          "There’s no conflict. Some teams keep Netlify Forms on the marketing site and use an external endpoint for a form whose data needs to sit in a shared spreadsheet the whole team can filter. Netlify only captures forms it detects, so a `fetch`-based form is simply invisible to it.",
        ],
      },
    ],
    faq: [
      {
        q: 'Will Netlify try to capture my fetch-based form too?',
        a: 'No. Netlify’s build step looks for forms marked with the `netlify` attribute. Without it, your form is just markup and Netlify ignores it.',
      },
      {
        q: 'Do I need a Netlify Function for this?',
        a: 'No — that’s the point. The browser POSTs straight to your Apps Script endpoint, so there’s no function to write, deploy, or count against your invocation limits.',
      },
      {
        q: 'Does it work on Netlify deploy previews?',
        a: 'Yes, on every preview and branch deploy, and on `localhost` too. There’s no build-time detection involved.',
      },
      {
        q: 'What about Netlify’s spam filtering?',
        a: 'That applies to Netlify Forms. For an external endpoint you use the endpoint’s own protection: the hidden `_hp` honeypot, plus Cloudflare Turnstile if you want a server-side captcha check before rows are written.',
      },
    ],
    related: [
      'cloudflare-pages-contact-form',
      'vercel-static-contact-form',
      'astro-contact-form',
      'form-backend-for-static-sites',
    ],
    updated: '2026-08-19',
  },

  {
    slug: 'cloudflare-pages-contact-form',
    icon: 'CloudflarePages',
    category: 'platform',
    eyebrow: 'Cloudflare Pages',
    title: 'Adding a contact form to a Cloudflare Pages site',
    metaTitle: 'Cloudflare Pages Contact Form — Without Writing a Worker',
    description:
      'Cloudflare Pages has no built-in form handling. You can write a Pages Function, or point the form at an endpoint you don’t have to maintain. Both explained.',
    cardBlurb: 'Write a Pages Function, or skip it entirely — plus the free Turnstile pairing.',
    answer:
      "Cloudflare Pages serves static assets and has no built-in form handling, so you either write a Pages Function (a Worker) to receive the POST or send it to an external endpoint. A Pages Function gives you full control but leaves you owning code, storage and deployment for a contact form. RG Forms is the no-code path: your page POSTs to a Google Apps Script web app in your own Google account and submissions land in your own Google Sheet — and because RG Forms verifies Cloudflare Turnstile tokens server-side, you can pair it with the free Turnstile widget you already have access to.",
    intro: [
      "Cloudflare Pages doesn’t ship a forms feature the way Netlify does. What it gives you instead is Pages Functions — real Workers, running on Cloudflare’s edge, that can handle a POST to your own domain.",
      "That’s more power than a contact form needs, and it comes with more to maintain. Here are both routes, honestly.",
    ],
    sections: [
      {
        type: 'prose',
        heading: 'Option 1: a Pages Function',
        body: [
          "Drop a file at `functions/api/contact.ts` and Cloudflare routes `POST /api/contact` to it. From there you can do anything — validate, rate-limit, write to D1 or KV, call an email API, fan out to a CRM.",
          "The catch is that you now own a small application. You need somewhere to put the data (D1, KV, or an external store), a way to send email (Workers can’t send mail on their own — you’ll be calling a third-party email API with its own key and quota), and a plan for spam. Plus the bindings, the deploy config, and the runtime upgrades.",
          "If your form feeds a real workflow, that investment is correct. If it emails you three times a week, it isn’t.",
        ],
      },
      {
        type: 'prose',
        heading: 'Option 2: an endpoint you don’t maintain',
        body: [
          "The alternative is to leave your Pages project purely static and POST from the browser to an endpoint that already handles storage, notification and spam. Your `functions/` directory stays empty, your deploy stays a pure asset upload, and there’s no Worker to keep an eye on.",
          "With RG Forms that endpoint is an Apps Script web app inside your own Google account — so “an endpoint you don’t maintain” doesn’t mean “an endpoint someone else owns.”",
        ],
      },
      {
        type: 'code',
        heading: 'The integration',
        intro: 'Framework-agnostic — works with an Astro, Hugo, SvelteKit-static or plain HTML Pages project.',
        code: HTML_FORM,
      },
      {
        type: 'callout',
        tone: 'success',
        heading: 'The Turnstile pairing',
        body: [
          "You’re already on Cloudflare, so [Turnstile](https://www.cloudflare.com/products/turnstile/) is free and sitting in the same dashboard. RG Forms verifies Turnstile tokens **server-side**, inside your own Apps Script, before writing anything — which is the part that actually matters. A captcha checked only in the browser stops nobody.",
          "Add the widget script to your `<head>`, drop `<div class=\"cf-turnstile\" data-sitekey=\"…\"></div>` in the form, send the token as `_captcha`, then flip verification on in your RG Forms dashboard. Do it in that order — turning verification on before the widget is live would start rejecting real submissions.",
        ],
      },
      {
        type: 'table',
        heading: 'Choosing between them',
        columns: ['If you need…', 'Go with'],
        rows: [
          ['A contact form that emails you and keeps a record', 'An external endpoint — there’s nothing here worth a Worker'],
          ['Custom validation, CRM writes, payment logic, rate limiting', 'A Pages Function'],
          ['Submissions in a spreadsheet your team can filter and annotate', 'An external endpoint writing to Google Sheets'],
          ['Data that must stay inside Cloudflare (D1/KV/R2)', 'A Pages Function'],
          ['The same form code across several sites on different hosts', 'An external endpoint'],
        ],
      },
      {
        type: 'code',
        heading: 'Verify the endpoint first',
        code: CURL_TEST,
      },
    ],
    faq: [
      {
        q: 'Does Cloudflare Pages have built-in forms like Netlify?',
        a: 'No. Pages serves static assets; anything dynamic goes through Pages Functions, which you write yourself.',
      },
      {
        q: 'Will an external POST be blocked by Cloudflare’s proxy or WAF?',
        a: 'No. The request originates in the visitor’s browser and goes directly to the endpoint’s domain — it never passes through your Cloudflare zone.',
      },
      {
        q: 'Can I use Turnstile without a Worker?',
        a: 'Yes — that’s exactly what this setup does. The widget runs in the browser and the token is verified inside your Apps Script, so no Worker is involved at any point.',
      },
      {
        q: 'What about Cloudflare Web Analytics on the form page?',
        a: 'Unaffected. Analytics is a separate script and doesn’t interact with the form submission at all.',
      },
    ],
    related: [
      'netlify-contact-form',
      'vercel-static-contact-form',
      'github-pages-contact-form',
      'astro-contact-form',
    ],
    updated: '2026-08-19',
  },

  {
    slug: 'vercel-static-contact-form',
    icon: 'Vercel',
    category: 'platform',
    eyebrow: 'Vercel',
    title: 'A contact form on Vercel without an API route',
    metaTitle: 'Vercel Static Contact Form — No API Route, No Serverless Function',
    description:
      'Vercel makes it easy to add an API route for your form — but then you own it. Here’s the case for keeping the deployment purely static, and how to do it.',
    cardBlurb: 'An API route is one file — and then it’s yours forever. Here’s the static alternative.',
    answer:
      "On Vercel you can handle a contact form with an API route or Server Action, but that turns a static deployment into one with server code you own, plus a database or email API to store and forward submissions. If the form only needs to reach your inbox and leave a record, an external endpoint keeps the deployment purely static: the browser POSTs directly to a Google Apps Script web app in your own Google account, submissions land in your own Google Sheet, no function is invoked, and there is nothing extra to maintain or pay for.",
    intro: [
      "Vercel makes the serverless route so easy that it’s the default assumption: create `app/api/contact/route.ts`, handle the POST, done. It’s one file.",
      "It’s never one file. It’s one file plus a place to put the data, plus an email provider, plus a key to rotate, plus spam handling, plus a runtime that will need upgrading — for a form that gets a handful of messages a week.",
    ],
    sections: [
      {
        type: 'prose',
        heading: 'What the API route actually commits you to',
        body: [
          "The handler itself is trivial. Everything around it isn’t. **Storage:** a serverless function has no memory between invocations, so you need Postgres, KV, or a third-party store — provisioned, connected, and paid for. **Email:** you’ll be calling an email API, which means an account, an API key in your environment, a verified sending domain, and a deliverability problem when messages start landing in spam. **Abuse:** a public POST route with no rate limiting will eventually get found.",
          "Every piece is reasonable on its own. Together they’re a small application, and it exists to service a contact form.",
        ],
      },
      {
        type: 'prose',
        heading: 'Keeping it static instead',
        body: [
          "Point the form at an endpoint that already does all of it. Your Vercel project stays a pure static deployment: no functions in the bundle, no invocations metered, no cold starts on your side, no environment secrets to manage.",
          "This works identically whether you’re on Next.js with `output: 'export'`, Astro, Vite, SvelteKit static, or plain HTML.",
        ],
      },
      {
        type: 'code',
        heading: 'The component',
        intro: 'For a Next.js App Router project, mark it `\'use client\'` — it needs state and an event handler.',
        code: {
          lang: 'tsx',
          label: 'components/ContactForm.tsx',
          code: `'use client';

import { useState } from 'react';

const ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT!;

export default function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState('sending');

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, // avoids the CORS preflight
        body: JSON.stringify({
          tab: 'contact',
          fields: Object.fromEntries(new FormData(form)),
        }),
      });
      const data = await res.json();
      setState(data.result === 'success' ? 'sent' : 'error');
      if (data.result === 'success') form.reset();
    } catch {
      setState('error');
    }
  }

  if (state === 'sent') {
    return <p role="status">Thanks — we&apos;ll be in touch shortly.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <input name="name" placeholder="Name" required />
      <input type="email" name="email" placeholder="Email" required />
      <textarea name="message" placeholder="Message" rows={5} required />
      {/* honeypot */}
      <input
        type="text"
        name="_hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px]"
      />
      <button type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : 'Send message'}
      </button>
      {state === 'error' && (
        <p role="alert">
          Something went wrong. Email us directly at hello@example.com.
        </p>
      )}
    </form>
  );
}`,
        },
        note: 'The `NEXT_PUBLIC_` prefix is required for the value to reach the browser. That’s fine here — the endpoint URL is not a secret, and can’t be: it has to be publicly callable for visitors to submit.',
      },
      {
        type: 'callout',
        tone: 'info',
        heading: 'When you should write the API route',
        body: [
          "If the form needs to charge a card, create an account, check inventory, enforce server-side business rules, or write to a database that’s already yours — write the route. Vercel is excellent at that and you’ll want the control.",
          "The argument here is narrower: a contact form usually isn’t any of those things, and building infrastructure for it is a cost that never stops being paid.",
        ],
      },
      {
        type: 'checklist',
        heading: 'Vercel-specific notes',
        items: [
          { label: 'Set `NEXT_PUBLIC_FORM_ENDPOINT` in Project Settings → Environment Variables', body: 'across Production, Preview and Development, so preview deployments work too.' },
          { label: 'Preview deployments work unchanged', body: 'the endpoint accepts requests from any origin, so every preview URL submits successfully.' },
          { label: 'No `runtime` or `dynamic` exports needed', body: 'the page stays fully static; only the browser talks to the endpoint.' },
          { label: 'Server Actions aren’t needed either', body: 'and using one would move you back to a deployment with server code in it.' },
        ],
      },
      {
        type: 'code',
        heading: 'Sanity-check the endpoint',
        code: CURL_TEST,
      },
    ],
    faq: [
      {
        q: 'Does this work with Next.js `output: "export"`?',
        a: 'Yes — that’s the ideal case. Fully static export, no functions, and the form still works because the submission happens in the browser.',
      },
      {
        q: 'Will this count against my Vercel function invocations?',
        a: 'No. No function is invoked. The request goes from the visitor’s browser straight to the Apps Script endpoint and never touches your Vercel deployment.',
      },
      {
        q: 'Can I use a Server Action instead?',
        a: 'You can, but it puts server code back into the deployment and you still need storage and an email provider behind it. If you’re going that far, a proper API route is the cleaner shape.',
      },
      {
        q: 'Is the endpoint URL safe in a public bundle?',
        a: 'Yes. It’s a public write endpoint by design, protected by the honeypot and optional Turnstile rather than by secrecy. It grants no access to your Google account — the script can only touch its own spreadsheet.',
      },
    ],
    related: [
      'react-contact-form-without-backend',
      'contact-form-for-ai-generated-websites',
      'netlify-contact-form',
      'contact-form-without-backend',
    ],
    updated: '2026-08-19',
  },
];
