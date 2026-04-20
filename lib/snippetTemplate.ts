import type { FormField, FormConfig } from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fieldName(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

const HONEYPOT_CANDIDATES = ['website', 'url', 'homepage', 'fax', 'company', 'address_2', 'zip_code'];

export function honeypotFieldName(fields: FormField[]): string {
  const used = new Set(fields.map((f) => fieldName(f.label)));
  return HONEYPOT_CANDIDATES.find((name) => !used.has(name)) ?? 'form_url';
}

function getInputHtml(field: FormField, indent: string = '  '): string {
  const requiredAttr = field.required ? ' required' : '';
  const nameAttr = fieldName(field.label);

  switch (field.type) {
    case 'textarea':
      return `${indent}<textarea name="${nameAttr}" placeholder="${field.label}"${requiredAttr}></textarea>`;
    case 'select': {
      const options = (field.options ?? [])
        .map((opt) => `${indent}  <option value="${opt}">${opt}</option>`)
        .join('\n');
      return `${indent}<select name="${nameAttr}"${requiredAttr}>\n${indent}  <option value="">Select ${field.label}</option>\n${options}\n${indent}</select>`;
    }
    default:
      return `${indent}<input type="${field.type}" name="${nameAttr}" placeholder="${field.label}"${requiredAttr} />`;
  }
}

function getReactFieldJsx(field: FormField, indent: string = '      '): string {
  const requiredAttr = field.required ? ' required' : '';
  const nameAttr = fieldName(field.label);

  switch (field.type) {
    case 'textarea':
      return `${indent}<textarea name="${nameAttr}" placeholder="${field.label}"${requiredAttr} />`;
    case 'select': {
      const options = (field.options ?? [])
        .map((opt) => `${indent}  <option value="${opt}">${opt}</option>`)
        .join('\n');
      return `${indent}<select name="${nameAttr}"${requiredAttr}>\n${indent}  <option value="">Select ${field.label}</option>\n${options}\n${indent}</select>`;
    }
    default:
      return `${indent}<input type="${field.type}" name="${nameAttr}" placeholder="${field.label}"${requiredAttr} />`;
  }
}

function getVueFieldTemplate(field: FormField, indent: string = '    '): string {
  const requiredAttr = field.required ? ' required' : '';
  const nameAttr = fieldName(field.label);

  switch (field.type) {
    case 'textarea':
      return `${indent}<textarea name="${nameAttr}" placeholder="${field.label}"${requiredAttr}></textarea>`;
    case 'select': {
      const options = (field.options ?? [])
        .map((opt) => `${indent}  <option value="${opt}">${opt}</option>`)
        .join('\n');
      return `${indent}<select name="${nameAttr}"${requiredAttr}>\n${indent}  <option value="">Select ${field.label}</option>\n${options}\n${indent}</select>`;
    }
    default:
      return `${indent}<input type="${field.type}" name="${nameAttr}" placeholder="${field.label}"${requiredAttr} />`;
  }
}

function getAngularFieldTemplate(field: FormField, indent: string = '      '): string {
  const requiredAttr = field.required ? ' required' : '';
  const nameAttr = fieldName(field.label);

  switch (field.type) {
    case 'textarea':
      return `${indent}<textarea name="${nameAttr}" placeholder="${field.label}"${requiredAttr}></textarea>`;
    case 'select': {
      const options = (field.options ?? [])
        .map((opt) => `${indent}  <option value="${opt}">${opt}</option>`)
        .join('\n');
      return `${indent}<select name="${nameAttr}"${requiredAttr}>\n${indent}  <option value="">Select ${field.label}</option>\n${options}\n${indent}</select>`;
    }
    default:
      return `${indent}<input type="${field.type}" name="${nameAttr}" placeholder="${field.label}"${requiredAttr} />`;
  }
}

// ---------------------------------------------------------------------------
// Shared basic CSS (included in HTML snippet, referenced in others)
// ---------------------------------------------------------------------------

const EMBED_CSS = `.sheetspin-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 480px;
  font-family: system-ui, -apple-system, sans-serif;
}
.sheetspin-form input,
.sheetspin-form textarea,
.sheetspin-form select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background: #fff;
  color: #111827;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
}
.sheetspin-form textarea {
  min-height: 100px;
  resize: vertical;
}
.sheetspin-form input:focus,
.sheetspin-form textarea:focus,
.sheetspin-form select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
}
.sheetspin-form button[type="submit"] {
  align-self: flex-start;
  padding: 10px 24px;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.sheetspin-form button[type="submit"]:hover { background: #4f46e5; }
.sheetspin-form button[type="submit"]:disabled { opacity: 0.6; cursor: not-allowed; }`;

// ---------------------------------------------------------------------------
// HTML snippet (with basic CSS and optional honeypot)
// ---------------------------------------------------------------------------

export function generateEmbedSnippet(config: FormConfig, deploymentUrl: string): string {
  const fieldInputs = config.fields.map((f) => getInputHtml(f)).join('\n');
  const hpName = config.enableHoneypot ? honeypotFieldName(config.fields) : null;
  const honeypotField = hpName
    ? `\n  <input type="text" name="${hpName}" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;" />`
    : '';
  const formId = `rg-form-${Math.random().toString(36).slice(2, 7)}`;

  return `<style>
${EMBED_CSS}
</style>

<form class="sheetspin-form" id="${formId}"
    action="${deploymentUrl}"
    method="POST">
${fieldInputs}${honeypotField}
  <button type="submit">Send</button>
  <div id="${formId}-success" style="display:none">
    Thanks! Your message has been sent.
  </div>
</form>
<script>
  document.getElementById('${formId}').addEventListener('submit', function(e) {
    e.preventDefault();
    var form = this;
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending...';
    fetch(form.action, { method: 'POST', body: new URLSearchParams(new FormData(form)) })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.result === 'success') {
          document.getElementById('${formId}-success').style.display = 'block';
          form.reset();
          btn.disabled = false;
          btn.textContent = 'Send';
        } else {
          btn.disabled = false;
          btn.textContent = 'Send';
          alert('Something went wrong. Please try again.');
        }
      })
      .catch(function() {
        btn.disabled = false;
        btn.textContent = 'Send';
        alert('Something went wrong. Please try again.');
      });
  });
</script>`;
}

// ---------------------------------------------------------------------------
// React snippet (.tsx)
// ---------------------------------------------------------------------------

export function generateReactSnippet(config: FormConfig, deploymentUrl: string): string {
  const fields = config.fields.map((f) => getReactFieldJsx(f)).join('\n');

  return `import { useState } from 'react';

// Paste this CSS into your stylesheet (or a <style> tag):
//
// ${EMBED_CSS.split('\n').join('\n// ')}

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    const form = e.currentTarget;
    try {
      const res = await fetch('${deploymentUrl}', {
        method: 'POST',
        body: new URLSearchParams(new FormData(form) as unknown as Record<string, string>),
      });
      const data = await res.json();
      if (data?.result === 'success') {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="sheetspin-form">
${fields}
      <button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending...' : 'Send'}
      </button>
      {status === 'success' && (
        <p style={{ color: '#16a34a' }}>Thanks! Your message has been sent.</p>
      )}
      {status === 'error' && (
        <p style={{ color: '#dc2626' }}>Something went wrong. Please try again.</p>
      )}
    </form>
  );
}`;
}

// ---------------------------------------------------------------------------
// Vue snippet (.vue — Composition API)
// ---------------------------------------------------------------------------

export function generateVueSnippet(config: FormConfig, deploymentUrl: string): string {
  const fields = config.fields.map((f) => getVueFieldTemplate(f)).join('\n');

  return `<template>
  <form @submit.prevent="handleSubmit" class="sheetspin-form">
${fields}
    <button type="submit" :disabled="status === 'sending'">
      {{ status === 'sending' ? 'Sending...' : 'Send' }}
    </button>
    <p v-if="status === 'success'" style="color:#16a34a">
      Thanks! Your message has been sent.
    </p>
    <p v-if="status === 'error'" style="color:#dc2626">
      Something went wrong. Please try again.
    </p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Paste this CSS into your stylesheet:
//
// ${EMBED_CSS.split('\n').join('\n// ')}

type Status = 'idle' | 'sending' | 'success' | 'error';
const status = ref<Status>('idle');

async function handleSubmit(e: Event) {
  status.value = 'sending';
  const form = e.target as HTMLFormElement;
  try {
    const res = await fetch('${deploymentUrl}', {
      method: 'POST',
      body: new URLSearchParams(new FormData(form) as unknown as Record<string, string>),
    });
    const data = await res.json();
    if (data?.result === 'success') {
      status.value = 'success';
      form.reset();
    } else {
      status.value = 'error';
    }
  } catch {
    status.value = 'error';
  }
}
</script>`;
}

// ---------------------------------------------------------------------------
// AI Agent instructions (plain-text prompt for Claude Code / Cursor)
// ---------------------------------------------------------------------------

export function generateAgentInstructions(config: FormConfig, deploymentUrl: string): string {
  const fieldList = config.fields.map((f) => {
    const typeLabel = f.type === 'textarea' ? 'multi-line text' : f.type;
    const req = f.required ? 'required' : 'optional';
    const fieldKey = fieldName(f.label);
    const extra =
      f.type === 'select' && f.options?.length
        ? ` (options: ${f.options.join(', ')})`
        : '';
    return `  - ${f.label}  [name="${fieldKey}", type=${typeLabel}, ${req}]${extra}`;
  }).join('\n');

  const hpNameAgent = config.enableHoneypot ? honeypotFieldName(config.fields) : null;
  const honeypotNote = hpNameAgent
    ? `\nHoneypot (spam protection) — include this hidden field exactly as written;\n` +
      `do NOT display it to the user:\n` +
      `  <input type="text" name="${hpNameAgent}" tabindex="-1" autocomplete="off"\n` +
      `         aria-hidden="true" style="position:absolute;left:-9999px;\n` +
      `         width:1px;height:1px;opacity:0;pointer-events:none;" />\n`
    : '';

  return `You are helping me integrate a contact form into my codebase.
Use my existing project's UI components, design system, and styling conventions —
do not add new CSS files, UI libraries, or external dependencies.

─────────────────────────────────────────
FORM DETAILS
─────────────────────────────────────────
  Name:     ${config.name}
  Endpoint: ${deploymentUrl}

FIELDS
${fieldList}
${honeypotNote}─────────────────────────────────────────
API CONTRACT
─────────────────────────────────────────
  Method:       POST
  URL:          ${deploymentUrl}
  Content-Type: application/x-www-form-urlencoded
  Body:         URL-encoded form data using the field names listed above

  Success →  { "result": "success" }
  Error   →  { "result": "error", "error": "..." }

─────────────────────────────────────────
IMPLEMENTATION REQUIREMENTS
─────────────────────────────────────────
1. Create a form component that renders all fields listed above.
   • Use my existing input, textarea, select, label, and button components if
     they exist. Match my project's naming conventions and file structure.
   • If my project has a shared form-field wrapper or validation library, use it.

2. Submit by POSTing to the endpoint:
   • Collect data with FormData, encode with URLSearchParams.
   • Use fetch (or my project's preferred HTTP client if one exists).

3. Manage three UI states:
   • idle      — form enabled, submit button shows "Send" (or match my copy style).
   • submitting — disable the submit button; show a loading indicator if available.
   • result    — show an inline success or error message; on success reset the form.

4. Accessibility:
   • Associate every input with a visible <label> (or use my labelled field components).
   • Add aria-live="polite" to the success/error message region.
   • Ensure full keyboard navigation.

5. Do NOT include hardcoded CSS or inline styles — rely entirely on my design system.

6. Place the file wherever similar form components live in my project.`;
}

// ---------------------------------------------------------------------------
// Angular snippet (standalone component)
// ---------------------------------------------------------------------------

export function generateAngularSnippet(config: FormConfig, deploymentUrl: string): string {
  const fields = config.fields.map((f) => getAngularFieldTemplate(f)).join('\n');

  return `import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

// Paste this CSS into your stylesheet (or component styles):
//
// ${EMBED_CSS.split('\n').join('\n// ')}

type Status = 'idle' | 'sending' | 'success' | 'error';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <form (ngSubmit)="handleSubmit($event)" class="sheetspin-form">
${fields}
      <button type="submit" [disabled]="status === 'sending'">
        {{ status === 'sending' ? 'Sending...' : 'Send' }}
      </button>
      <p *ngIf="status === 'success'" style="color:#16a34a">
        Thanks! Your message has been sent.
      </p>
      <p *ngIf="status === 'error'" style="color:#dc2626">
        Something went wrong. Please try again.
      </p>
    </form>
  \`,
})
export class ContactFormComponent {
  status: Status = 'idle';

  constructor(private http: HttpClient) {}

  handleSubmit(e: SubmitEvent): void {
    e.preventDefault();
    this.status = 'sending';
    const form = e.target as HTMLFormElement;
    const body = new URLSearchParams(
      new FormData(form) as unknown as Record<string, string>
    ).toString();
    this.http
      .post<{ result: string }>('${deploymentUrl}', body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .subscribe({
        next: (data) => {
          this.status = data?.result === 'success' ? 'success' : 'error';
          if (this.status === 'success') form.reset();
        },
        error: () => (this.status = 'error'),
      });
  }
}`;
}
