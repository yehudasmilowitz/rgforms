'use client';

import { useState, useMemo } from 'react';
import { tokenizeShell, tokenizeJS } from '@/lib/syntaxHighlight';
import type { Token } from '@/lib/syntaxHighlight';

type Language = 'shell' | 'js' | 'text';

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="7" y="3" width="10" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 5H5a2 2 0 00-2 2v9a2 2 0 002 2h8a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 10.5l4.5 4.5 7.5-8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function tokenize(content: string, language: Language): Token[] | null {
  if (language === 'shell') return tokenizeShell(content);
  if (language === 'js') return tokenizeJS(content);
  return null; // plain text
}

interface CopyBlockProps {
  label: string;
  content: string;
  language?: Language;
}

export default function CopyBlock({ label, content, language = 'text' }: CopyBlockProps) {
  const [copied, setCopied] = useState(false);
  const tokens = useMemo(() => tokenize(content, language), [content, language]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = content;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ background: '#161b22', borderColor: 'var(--color-border)' }}
      >
        <span className="text-xs font-mono" style={{ color: 'var(--color-muted)' }}>
          {label}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 focus:outline-none"
          style={{
            background: copied ? 'rgba(34,197,94,0.15)' : 'var(--color-surface-2)',
            color: copied ? 'var(--color-success)' : 'var(--color-text)',
            border: `1px solid ${copied ? 'rgba(34,197,94,0.35)' : 'var(--color-border)'}`,
          }}
          aria-label={copied ? 'Copied' : 'Copy'}
        >
          {copied ? (
            <><CheckIcon className="w-3.5 h-3.5" />Copied!</>
          ) : (
            <><ClipboardIcon className="w-3.5 h-3.5" />Copy</>
          )}
        </button>
      </div>
      <div className="overflow-x-auto" style={{ background: '#0d1117' }}>
        <pre
          className="p-5 text-xs leading-relaxed font-mono whitespace-pre"
          style={{ tabSize: 2 }}
        >
          {tokens ? (
            <code>
              {tokens.map((tok, i) => (
                <span key={i} style={{ color: tok.color }}>{tok.text}</span>
              ))}
            </code>
          ) : (
            <code style={{ color: '#e6edf3' }}>{content}</code>
          )}
        </pre>
      </div>
    </div>
  );
}
