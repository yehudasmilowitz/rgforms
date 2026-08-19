import type { CodeBlock } from '@/lib/guides/types';

/**
 * Canonical RG Forms integration snippets, shared across guides so every page
 * teaches the same (correct) calling convention:
 *   POST <endpoint>  •  Content-Type: text/plain  •  { tab, fields }
 *
 * text/plain is not a style choice — application/json triggers a CORS preflight
 * and Apps Script web apps cannot answer OPTIONS, so the browser blocks it.
 */

export const ENDPOINT_PLACEHOLDER = 'https://script.google.com/macros/s/AKfycb.../exec';

export const HTML_FORM: CodeBlock = {
  lang: 'html',
  label: 'index.html',
  code: `<form id="contact-form">
  <label>Name <input name="name" required /></label>
  <label>Email <input type="email" name="email" required /></label>
  <label>Message <textarea name="message" required></textarea></label>

  <!-- Honeypot: humans never see it, bots fill it in -->
  <input type="text" name="_hp" tabindex="-1" autocomplete="off"
         style="position:absolute;left:-9999px" aria-hidden="true" />

  <button type="submit">Send</button>
  <p id="form-status" role="status"></p>
</form>

<script>
  const ENDPOINT = "${ENDPOINT_PLACEHOLDER}";
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Sending…";

    const res = await fetch(ENDPOINT, {
      method: "POST",
      // text/plain avoids the CORS preflight Apps Script can't answer
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        tab: "contact",
        fields: Object.fromEntries(new FormData(form)),
      }),
    });

    const data = await res.json();
    status.textContent =
      data.result === "success" ? "Thanks — we'll be in touch." : "Something went wrong.";
    if (data.result === "success") form.reset();
  });
</script>`,
};

export const REACT_FORM: CodeBlock = {
  lang: 'tsx',
  label: 'ContactForm.tsx',
  code: `import { useState } from 'react';

const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT; // or process.env.NEXT_PUBLIC_FORM_ENDPOINT

export default function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState('sending');

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, // no preflight
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

  if (state === 'sent') return <p>Thanks — we&apos;ll be in touch.</p>;

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input type="email" name="email" placeholder="Email" required />
      <textarea name="message" placeholder="Message" required />
      <input type="text" name="_hp" tabIndex={-1} autoComplete="off" aria-hidden="true"
             style={{ position: 'absolute', left: '-9999px' }} />
      <button disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : 'Send'}
      </button>
      {state === 'error' && <p role="alert">Something went wrong. Please try again.</p>}
    </form>
  );
}`,
};

export const CURL_TEST: CodeBlock = {
  lang: 'bash',
  label: 'Test the endpoint from your terminal',
  code: `curl -L -X POST "${ENDPOINT_PLACEHOLDER}" \\
  -H "Content-Type: text/plain" \\
  -d '{"tab":"contact","fields":{"name":"Ada","email":"ada@example.com","message":"Hello"}}'

# → {"result":"success"}   and a new row appears in your Google Sheet`,
};

export const NO_BUILD_STEP: CodeBlock = {
  lang: 'html',
  label: 'The whole integration, minus the markup',
  code: `await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "text/plain" },
  body: JSON.stringify({ tab: "contact", fields: { name, email, message } }),
});`,
};
