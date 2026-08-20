import type { Guide } from '@/lib/guides/types';
import { REACT_FORM, CURL_TEST } from '@/lib/guides/snippets';

export const FRAMEWORK_GUIDES: Guide[] = [
  {
    slug: 'astro-contact-form',
    icon: 'Astro',
    category: 'framework',
    eyebrow: 'Astro',
    title: 'Adding a contact form to an Astro site',
    metaTitle: 'Astro Contact Form — Static Output, No Adapter Needed',
    description:
      'Keep Astro in static mode and still take submissions. A drop-in .astro component, the env-var pattern, and why you don’t need an SSR adapter.',
    cardBlurb: 'A drop-in `.astro` component that keeps your output static — no adapter, no island required.',
    answer:
      "You can add a working contact form to a static Astro site without switching to SSR or installing an adapter. Keep output static, put the form in a .astro component with a client-side <script> that POSTs to a hosted endpoint, and pass the endpoint URL in with define:vars from PUBLIC_FORM_ENDPOINT. With RG Forms that endpoint is a Google Apps Script web app in your own Google account, so submissions land in your own Google Sheet and the build stays a pure static output you can deploy anywhere.",
    intro: [
      "Astro’s whole proposition is shipping less: static HTML, JavaScript only where you ask for it. Adding an SSR adapter and a server runtime just to handle a contact form undoes a good part of that.",
      "You don’t need to. Here’s the version that keeps `output: 'static'`.",
    ],
    sections: [
      {
        type: 'code',
        heading: 'The component',
        intro: 'Save this as `src/components/ContactForm.astro` and use it anywhere. No framework island, no React, no client directive.',
        code: {
          lang: 'astro',
          label: 'src/components/ContactForm.astro',
          code: `---
const endpoint = import.meta.env.PUBLIC_FORM_ENDPOINT;
---

<form id="contact-form" class="contact-form">
  <label>
    Name
    <input name="name" required />
  </label>
  <label>
    Email
    <input type="email" name="email" required />
  </label>
  <label>
    Message
    <textarea name="message" rows="5" required></textarea>
  </label>

  <!-- honeypot: hidden from humans, irresistible to bots -->
  <input type="text" name="_hp" tabindex="-1" autocomplete="off" aria-hidden="true" />

  <button type="submit">Send message</button>
  <p id="form-status" role="status" aria-live="polite"></p>
</form>

<script define:vars={{ endpoint }}>
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const button = form.querySelector('button');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    button.disabled = true;
    status.textContent = 'Sending…';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        // text/plain keeps this a "simple request" — no CORS preflight
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          tab: 'contact',
          fields: Object.fromEntries(new FormData(form)),
        }),
      });
      const data = await res.json();

      if (data.result === 'success') {
        form.reset();
        status.textContent = 'Thanks — we’ll be in touch.';
      } else {
        status.textContent = 'Something went wrong. Please try again.';
      }
    } catch {
      status.textContent = 'Network error. Email us at hello@example.com.';
    } finally {
      button.disabled = false;
    }
  });
</script>

<style>
  .contact-form { display: grid; gap: 0.75rem; max-width: 32rem; }
  .contact-form label { display: grid; gap: 0.25rem; }
  .contact-form input[name='_hp'] { position: absolute; left: -9999px; }
</style>`,
        },
        note: '`define:vars` is the important detail — Astro bundles `<script>` tags separately from the component frontmatter, so a value from `import.meta.env` won’t be in scope inside the script unless you pass it through explicitly.',
      },
      {
        type: 'steps',
        heading: 'Setting it up',
        steps: [
          {
            title: 'Create your endpoint',
            body: "Sign in to RG Forms with Google and define fields matching your form’s input names: `name`, `email`, `message`. You get a permanent endpoint URL back.",
          },
          {
            title: 'Add the env var',
            body: "Astro only exposes variables prefixed with `PUBLIC_` to client code — which is what you want here, since the fetch runs in the browser.",
            code: {
              lang: 'bash',
              label: '.env',
              code: `PUBLIC_FORM_ENDPOINT="https://script.google.com/macros/s/AKfycb.../exec"`,
            },
          },
          {
            title: 'Drop the component in a page',
            body: "Import and render it — nothing else to configure.",
            code: {
              lang: 'astro',
              label: 'src/pages/contact.astro',
              code: `---
import Layout from '../layouts/Layout.astro';
import ContactForm from '../components/ContactForm.astro';
---

<Layout title="Contact us">
  <h1>Get in touch</h1>
  <ContactForm />
</Layout>`,
            },
          },
          {
            title: 'Test the real path',
            body: "Run `astro dev` and submit. Unlike host-native form features, this works identically in dev, in preview builds and in production — there’s no build-time detection involved.",
            code: CURL_TEST,
          },
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        heading: 'Using a React island instead',
        body: [
          "If your project already has `@astrojs/react`, you can use a React component with `client:load` or `client:visible` and skip the `define:vars` dance. It’s a perfectly good option — see the [React guide](/react-contact-form-without-backend). The `.astro` version above just ships less JavaScript, which is usually why people chose Astro.",
        ],
      },
      {
        type: 'prose',
        heading: 'Multiple forms, one endpoint',
        body: [
          "A newsletter signup in the footer and a contact form on `/contact` don’t need two projects. Add a second form in your RG Forms dashboard — it becomes another tab in the same Sheet — and change the `tab` value in the request body. Same endpoint URL, same component, one prop different.",
          "Make `tab` a prop on the component and you have a reusable form for the whole site.",
        ],
      },
    ],
    faq: [
      {
        q: 'Do I need an SSR adapter?',
        a: 'No. `output: "static"` is all you need — the submission happens in the browser after the page is served, so nothing runs on a server at request time.',
      },
      {
        q: 'Where should the endpoint URL live?',
        a: 'A `PUBLIC_` env var, for convenience rather than secrecy. The URL ships in the client bundle either way; it has to be publicly callable for anonymous visitors to submit at all.',
      },
      {
        q: 'Can I use Astro Actions?',
        a: 'Actions require a server, which means an adapter and a hosting runtime. For a contact form that’s a lot of machinery to add — and you’d still need somewhere to store the data and a way to send email.',
      },
      {
        q: 'Does the honeypot need styling in every theme?',
        a: 'The scoped `<style>` block above handles it. Keep it positioned off-screen rather than `display: none` — some bots skip fields that are explicitly hidden.',
      },
    ],
    related: [
      'react-contact-form-without-backend',
      'netlify-contact-form',
      'cloudflare-pages-contact-form',
      'form-backend-for-static-sites',
    ],
    updated: '2026-08-19',
  },

  {
    slug: 'hugo-contact-form',
    icon: 'Hugo',
    category: 'framework',
    eyebrow: 'Hugo',
    title: 'Adding a contact form to a Hugo site',
    metaTitle: 'Hugo Contact Form — A Partial That Works on Any Host',
    description:
      'A reusable Hugo partial and shortcode for a working contact form, with the endpoint URL configured in hugo.toml. No server, no theme lock-in.',
    cardBlurb: 'A partial plus a shortcode, endpoint in `hugo.toml`, usable from any page or theme.',
    answer:
      "Hugo generates static HTML with no server behind it, so a contact form has to POST to an external endpoint. The clean pattern is a partial in layouts/partials/contact-form.html that reads the endpoint URL from a site parameter in hugo.toml, plus a thin shortcode so content authors can drop the form into any Markdown page. With RG Forms the endpoint is a Google Apps Script web app in your own Google account and submissions land in your own Google Sheet — so the form works on GitHub Pages, Netlify, Cloudflare Pages or any other host without changes.",
    intro: [
      "Hugo builds fast and deploys anywhere, which is exactly why the contact form is the one thing that doesn’t fit: there’s no server in the picture at any point.",
      "The tidy solution is a partial with the endpoint in site config, so the form is themeable, reusable and has no URL hardcoded in your templates.",
    ],
    sections: [
      {
        type: 'steps',
        heading: 'The setup',
        steps: [
          {
            title: 'Put the endpoint in site config',
            body: "Keeping it in config means a single place to change it, and it’s available to every template through `.Site.Params`.",
            code: {
              lang: 'toml',
              label: 'hugo.toml',
              code: `[params]
  formEndpoint = "https://script.google.com/macros/s/AKfycb.../exec"
  contactFallbackEmail = "hello@example.com"`,
            },
          },
          {
            title: 'Create the partial',
            body: "This is the whole form — markup, behaviour and the honeypot, in one file.",
            code: {
              lang: 'html',
              label: 'layouts/partials/contact-form.html',
              code: `{{ $endpoint := .Site.Params.formEndpoint }}
{{ $fallback := .Site.Params.contactFallbackEmail }}

<form id="contact-form" class="contact-form" data-endpoint="{{ $endpoint }}">
  <label>Name <input name="name" required></label>
  <label>Email <input type="email" name="email" required></label>
  <label>Message <textarea name="message" rows="5" required></textarea></label>

  <input type="text" name="_hp" tabindex="-1" autocomplete="off"
         aria-hidden="true" style="position:absolute;left:-9999px">

  <button type="submit">Send message</button>
  <p id="form-status" role="status" aria-live="polite"></p>
</form>

<script>
  (function () {
    var form = document.getElementById('contact-form');
    var status = document.getElementById('form-status');
    var button = form.querySelector('button');
    var endpoint = form.dataset.endpoint;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      button.disabled = true;
      status.textContent = 'Sending\\u2026';

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          tab: 'contact',
          fields: Object.fromEntries(new FormData(form))
        })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.result === 'success') {
            form.reset();
            status.textContent = 'Thanks \\u2014 we will be in touch.';
          } else {
            status.textContent = 'Something went wrong. Please try again.';
          }
        })
        .catch(function () {
          status.textContent = 'Network error. Email us at {{ $fallback }}.';
        })
        .finally(function () { button.disabled = false; });
    });
  })();
</script>`,
            },
          },
          {
            title: 'Add a shortcode so Markdown pages can use it',
            body: "One line, so authors don’t need to touch templates.",
            code: {
              lang: 'html',
              label: 'layouts/shortcodes/contact-form.html',
              code: `{{ partial "contact-form.html" . }}`,
            },
          },
          {
            title: 'Use it in content',
            body: "In `content/contact.md`, or in a template with `{{ partial \"contact-form.html\" . }}`.",
            code: {
              lang: 'markdown',
              label: 'content/contact.md',
              code: `---
title: "Contact"
---

Questions about a project? Send a note and we'll reply within a day.

{{< contact-form >}}`,
            },
          },
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        heading: 'Two Hugo gotchas',
        body: [
          "**Shortcodes need `{{<` not `{{%`.** The percent form runs the output through the Markdown renderer, which will mangle your HTML. Use the angle-bracket form.",
          "**Watch escaping in the script.** Hugo passes JavaScript through untouched, but Unicode escapes like `\\u2026` are safer than pasted ellipsis and em-dash characters if your build pipeline does any transformation.",
        ],
      },
      {
        type: 'prose',
        heading: 'Why not Hugo’s own form handling?',
        body: [
          "There isn’t any — and that’s not a gap in Hugo, it’s the design. Hugo is a static site generator: it renders HTML at build time and stops. Nothing is running when a visitor clicks Submit.",
          "So every Hugo contact form is an external endpoint. The only question is whose, and where the data ends up.",
        ],
      },
      {
        type: 'code',
        heading: 'Verify it before you push',
        code: CURL_TEST,
      },
    ],
    faq: [
      {
        q: 'Will this work with any Hugo theme?',
        a: 'Yes. It’s a partial you own, in your own `layouts/` directory, which overrides the theme. Style it with your theme’s classes and it will look native.',
      },
      {
        q: 'Can I put the JavaScript in my asset pipeline instead?',
        a: 'Yes — move the script body into `assets/js/contact-form.js`, process it with `resources.Get` and `js.Build`, and keep only the `data-endpoint` attribute in the markup. The inline version is here so the partial is one self-contained file.',
      },
      {
        q: 'How do I add a second form, like a newsletter signup?',
        a: 'Add the form in your RG Forms dashboard (it becomes a new tab in the same Sheet), then parameterise the partial with a `tab` argument and pass it through from the shortcode.',
      },
      {
        q: 'Does this work with `hugo server` locally?',
        a: 'Yes. The fetch goes to a public HTTPS endpoint that accepts any origin, so local development submits for real — useful for testing, and a reason to use a separate test project while you build.',
      },
    ],
    related: [
      'jekyll-contact-form',
      'github-pages-contact-form',
      'static-website-contact-form',
      'form-backend-for-static-sites',
    ],
    updated: '2026-08-19',
  },

  {
    slug: 'jekyll-contact-form',
    icon: 'Jekyll',
    category: 'framework',
    eyebrow: 'Jekyll',
    title: 'Adding a contact form to a Jekyll site',
    metaTitle: 'Jekyll Contact Form — An Include That Works on GitHub Pages',
    description:
      'A Jekyll include for a working contact form, with the endpoint in _config.yml and the Liquid escaping handled. Works on GitHub Pages with no plugins.',
    cardBlurb: 'An `_includes` partial with the endpoint in `_config.yml` — plugin-free, GitHub Pages safe.',
    answer:
      "Jekyll builds static HTML with no server behind it, so a contact form must POST to an external endpoint. Put the endpoint URL in _config.yml, build the form as an include in _includes/contact-form.html, and reference it with {% include contact-form.html %}. With RG Forms the endpoint is a Google Apps Script web app in your own Google account and submissions land in your own Google Sheet — no plugins are involved, so it works on GitHub Pages' restricted Jekyll build exactly as it does locally.",
    intro: [
      "Most Jekyll sites are on GitHub Pages, which means two constraints at once: no server-side code, and no arbitrary plugins in the build. Anything requiring a gem that isn’t on the allowed list is out.",
      "This approach needs neither. It’s an include, a config value, and standard browser JavaScript.",
    ],
    sections: [
      {
        type: 'steps',
        heading: 'The setup',
        steps: [
          {
            title: 'Add the endpoint to _config.yml',
            body: "Remember that changes to `_config.yml` aren’t picked up by `jekyll serve` — restart it after editing.",
            code: {
              lang: 'yaml',
              label: '_config.yml',
              code: `form_endpoint: "https://script.google.com/macros/s/AKfycb.../exec"
contact_fallback_email: "hello@example.com"`,
            },
          },
          {
            title: 'Create the include',
            body: "The `{% raw %}` wrapper around the script isn’t strictly required for this snippet, but it’s the habit worth having: the moment you add a template literal with `${...}` or an object literal spanning `{{`, Liquid will try to parse it and the build will fail with a confusing error.",
            code: {
              lang: 'html',
              label: '_includes/contact-form.html',
              code: `<form id="contact-form" class="contact-form"
      data-endpoint="{{ site.form_endpoint }}"
      data-fallback="{{ site.contact_fallback_email }}">
  <label>Name <input name="name" required></label>
  <label>Email <input type="email" name="email" required></label>
  <label>Message <textarea name="message" rows="5" required></textarea></label>

  <input type="text" name="_hp" tabindex="-1" autocomplete="off"
         aria-hidden="true" style="position:absolute;left:-9999px">

  <button type="submit">Send message</button>
  <p id="form-status" role="status" aria-live="polite"></p>
</form>

{% raw %}
<script>
  (function () {
    var form = document.getElementById('contact-form');
    var status = document.getElementById('form-status');
    var button = form.querySelector('button');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      button.disabled = true;
      status.textContent = 'Sending...';

      fetch(form.dataset.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          tab: 'contact',
          fields: Object.fromEntries(new FormData(form))
        })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.result === 'success') {
            form.reset();
            status.textContent = 'Thanks - we will be in touch.';
          } else {
            status.textContent = 'Something went wrong. Please try again.';
          }
        })
        .catch(function () {
          status.textContent = 'Network error. Email us at ' + form.dataset.fallback + '.';
        })
        .finally(function () { button.disabled = false; });
    });
  })();
</script>
{% endraw %}`,
            },
          },
          {
            title: 'Include it on your contact page',
            body: "Works in a layout, a page, or a Markdown file with front matter.",
            code: {
              lang: 'markdown',
              label: 'contact.md',
              code: `---
layout: page
title: Contact
permalink: /contact/
---

Have a question? Send a message and we'll get back to you.

{% include contact-form.html %}`,
            },
          },
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        heading: 'Why the config values ride in as data attributes',
        body: [
          "Putting `{{ site.form_endpoint }}` inside the `{% raw %}` block wouldn’t work — `raw` stops Liquid processing, so the variable would render literally. Passing values into the markup as `data-` attributes keeps the Liquid outside the raw block and the JavaScript inside it. It also keeps the script identical across every site you build.",
        ],
      },
      {
        type: 'prose',
        heading: 'GitHub Pages notes',
        body: [
          "Nothing here needs a plugin, so the restricted GitHub Pages build handles it fine. Custom domains and HTTPS are unaffected — both sides are HTTPS, so no mixed-content warnings.",
          "If you’re also using a custom `_config.yml` for local development, remember that Pages builds only ever read the committed one. A missing `form_endpoint` there produces an empty `data-endpoint` and a form that silently does nothing, which is an unpleasant five minutes to debug.",
        ],
      },
      {
        type: 'code',
        heading: 'Confirm the endpoint works',
        code: CURL_TEST,
      },
    ],
    faq: [
      {
        q: 'Do I need a Jekyll plugin?',
        a: 'No. It’s an include and a config value — both core Jekyll, both allowed on GitHub Pages.',
      },
      {
        q: 'Why did my build break after I edited the script?',
        a: 'Almost certainly Liquid parsing something in your JavaScript — `{{` in an object literal or a `${...}` template literal. Keep the script inside `{% raw %}` and pass dynamic values in through `data-` attributes.',
      },
      {
        q: 'Can I use this with a Jekyll theme gem?',
        a: 'Yes. Create `_includes/contact-form.html` in your own repo and it takes precedence over anything the theme ships.',
      },
      {
        q: 'Is there a no-JavaScript version?',
        a: 'Not with this endpoint — it expects a `fetch` with a JSON body. Services that accept a plain `action=` POST and redirect are the ones to look at if no-JS support is a hard requirement.',
      },
    ],
    related: [
      'github-pages-contact-form',
      'hugo-contact-form',
      'html-contact-form-no-backend',
      'static-website-contact-form',
    ],
    updated: '2026-08-19',
  },

  {
    slug: 'react-contact-form-without-backend',
    icon: 'React',
    category: 'framework',
    eyebrow: 'React',
    title: 'A React contact form with no backend',
    metaTitle: 'React Contact Form Without a Backend — Component + Hook',
    description:
      'A production-shaped React contact form: real submit states, a honeypot, error handling, and a reusable hook. Works in Vite, Next.js and CRA.',
    cardBlurb: 'Component, states, honeypot and a reusable hook — no API route, no server.',
    answer:
      "A React contact form needs no backend of your own if the submit handler POSTs directly to a hosted endpoint. Send the form data as JSON with Content-Type: text/plain — application/json triggers a CORS preflight that Google Apps Script endpoints cannot answer — and track idle, sending, sent and error states so the UI stays honest. With RG Forms the endpoint is an Apps Script web app in your own Google account, so submissions land in your own Google Sheet and your React app stays a pure static build with no API route to deploy.",
    intro: [
      "The React part of this is not the hard bit. What separates a form that works from one that quietly loses leads is the state handling around it — and getting one header right.",
    ],
    sections: [
      {
        type: 'code',
        heading: 'The component',
        intro: 'Drop-in, no dependencies. Works in Vite, Create React App, Next.js (with `\'use client\'`), Remix or an Astro React island.',
        code: REACT_FORM,
      },
      {
        type: 'prose',
        heading: 'The one line people get wrong',
        body: [
          "`headers: { 'Content-Type': 'text/plain' }`. Every instinct says `application/json`, and every AI assistant writes it that way by default. It fails.",
          "Setting `application/json` makes the request “non-simple”, so the browser sends a preflight `OPTIONS` request first. Google Apps Script web apps only implement `doGet` and `doPost` — there’s no `OPTIONS` handler — so the preflight fails and the browser blocks the real request before it leaves. You see a CORS error in the console and no request in the Network tab.",
          "`text/plain` is one of the three content types that skip preflight. The body is still `JSON.stringify(...)`, and the script parses it identically. One header, and the whole class of problem disappears.",
        ],
      },
      {
        type: 'code',
        heading: 'As a reusable hook',
        intro: 'If you have more than one form — contact, newsletter, quote request — pull the mechanics out. Each form is a tab in the same project, so only `tab` changes.',
        code: {
          lang: 'tsx',
          label: 'hooks/useFormEndpoint.ts',
          code: `import { useCallback, useState } from 'react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT;

export function useFormEndpoint(tab: string) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (form: HTMLFormElement) => {
      setStatus('sending');
      setError(null);

      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            tab,
            fields: Object.fromEntries(new FormData(form)),
          }),
        });

        const data = await res.json();

        if (data.result === 'success') {
          form.reset();
          setStatus('sent');
          return true;
        }

        setError(data.error ?? 'Submission failed.');
        setStatus('error');
        return false;
      } catch {
        setError('Network error. Please try again.');
        setStatus('error');
        return false;
      }
    },
    [tab],
  );

  return { status, error, submit, reset: () => setStatus('idle') };
}

// Usage:
//   const { status, error, submit } = useFormEndpoint('contact');
//   <form onSubmit={(e) => { e.preventDefault(); submit(e.currentTarget); }}>`,
        },
      },
      {
        type: 'checklist',
        heading: 'What makes it production-grade',
        items: [
          { label: 'Disable the button while sending', body: 'a double-click otherwise writes two rows and sends two emails.' },
          { label: 'Handle the network failure separately', body: 'a rejected `fetch` and a `{ result: "error" }` response are different problems and deserve different messages.' },
          { label: 'Always show a fallback contact route', body: 'in the error state, put a real email address on screen. Never let a failed submission be a dead end.' },
          { label: 'Use uncontrolled inputs', body: '`FormData` reads the DOM directly, so you don’t need `useState` per field. Less code, fewer re-renders, and the field names double as your payload keys.' },
          { label: 'Keep the honeypot off-screen, not `display: none`', body: 'some bots skip fields that are explicitly hidden, which defeats the trap.' },
          { label: 'Announce status changes', body: '`role="status"` with `aria-live="polite"` so screen-reader users hear the result.' },
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        heading: 'Do you need a form library?',
        body: [
          "For a contact form, no. React Hook Form and TanStack Form are excellent when you have conditional fields, multi-step flows, or complex validation — but a name, an email and a message are handled fine by `FormData` and the browser’s built-in `required` and `type=\"email\"` validation. Ship less.",
        ],
      },
      {
        type: 'code',
        heading: 'Check the endpoint independently',
        intro: 'When a form misbehaves, this tells you instantly whether the problem is your React code or the endpoint.',
        code: CURL_TEST,
      },
    ],
    faq: [
      {
        q: 'Does this work with Next.js?',
        a: 'Yes. Add `\'use client\'` at the top of the component and use `process.env.NEXT_PUBLIC_FORM_ENDPOINT`. The page can stay fully static — see the [Vercel guide](/vercel-static-contact-form).',
      },
      {
        q: 'Why not use a Server Action or API route?',
        a: 'You can, but then you own server code plus storage plus an email provider. If the form only needs to reach your inbox and leave a record, this keeps the deployment static and the maintenance at zero.',
      },
      {
        q: 'How do I add file uploads?',
        a: 'This endpoint handles text fields only. For attachments, link to a Google Drive upload form or ask people to email directly.',
      },
      {
        q: 'Can I validate on the server?',
        a: 'The Apps Script is in your own Google account and fully editable, so you can add whatever checks you like before the row is written. Out of the box, required-field enforcement is a frontend concern.',
      },
    ],
    related: [
      'vercel-static-contact-form',
      'contact-form-for-ai-generated-websites',
      'astro-contact-form',
      'contact-form-without-backend',
    ],
    updated: '2026-08-19',
  },
];
