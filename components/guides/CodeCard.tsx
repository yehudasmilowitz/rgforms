'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { CodeBlock } from '@/lib/guides/types';

export default function CodeCard({ code }: { code: CodeBlock }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — the snippet is still selectable */
    }
  }

  return (
    <figure
      className="rounded-[var(--radius-lg)] overflow-hidden not-prose"
      style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}
    >
      <figcaption
        className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs"
        style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
      >
        <span className="font-semibold truncate" style={{ fontFamily: 'var(--font-mono)' }}>
          {code.label ?? code.lang}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-semibold transition-colors shrink-0"
          style={{
            background: copied ? 'var(--color-success-bg)' : 'var(--color-surface)',
            border: `1px solid ${copied ? 'var(--color-success-border)' : 'var(--color-border)'}`,
            color: copied ? 'var(--color-success)' : 'var(--color-muted)',
          }}
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </figcaption>
      {/* tabIndex: a horizontally scrollable region must be reachable by keyboard */}
      <pre
        tabIndex={0}
        role="region"
        aria-label={`Code sample: ${code.label ?? code.lang}`}
        className="overflow-x-auto px-4 py-4 text-[13px] leading-relaxed focus:outline-2 focus:outline-offset-[-2px] focus:outline-[var(--color-accent)]"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}
      >
        <code>{code.code}</code>
      </pre>
    </figure>
  );
}
