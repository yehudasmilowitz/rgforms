import type { FormField, FormConfig } from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fieldName(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]/g, '_');
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

const EMBED_CSS = `.rgforms-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 480px;
  font-family: system-ui, -apple-system, sans-serif;
}
.rgforms-form input,
.rgforms-form textarea,
.rgforms-form select {
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
.rgforms-form textarea {
  min-height: 100px;
  resize: vertical;
}
.rgforms-form input:focus,
.rgforms-form textarea:focus,
.rgforms-form select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
}
.rgforms-form button[type="submit"] {
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
.rgforms-form button[type="submit"]:hover { background: #4f46e5; }
.rgforms-form button[type="submit"]:disabled { opacity: 0.6; cursor: not-allowed; }`;

// ---------------------------------------------------------------------------
// HTML snippet (with basic CSS and optional honeypot)
// ---------------------------------------------------------------------------

export function generateEmbedSnippet(config: FormConfig, deploymentUrl: string): string {
  const fieldInputs = config.fields.map((f) => getInputHtml(f)).join('\n');
  const honeypotField = config.enableHoneypot
    ? `\n  <input type="text" name="_hp" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;" />`
    : '';
  const formId = `rg-form-${Math.random().toString(36).slice(2, 7)}`;

  return `<style>
${EMBED_CSS}
</style>

<form class="rgforms-form" id="${formId}"
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
    <form onSubmit={handleSubmit} className="rgforms-form">
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
  <form @submit.prevent="handleSubmit" class="rgforms-form">
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
    <form (ngSubmit)="handleSubmit($event)" class="rgforms-form">
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
