'use client';

import { useState, useMemo } from 'react';
import type { FormConfig } from '@/types';
import {
  generateEmbedSnippet,
  generateReactSnippet,
  generateVueSnippet,
  generateAngularSnippet,
} from '@/lib/snippetTemplate';
import { tokenizeHTML, tokenizeJS, tokenizeVue } from '@/lib/syntaxHighlight';
import type { Token } from '@/lib/syntaxHighlight';

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

type TabId = 'html' | 'react' | 'vue' | 'angular';

interface Tab {
  id: TabId;
  label: string;
  filename: string;
  tokenize: (code: string) => Token[];
}

const TABS: Tab[] = [
  { id: 'html',    label: 'HTML',    filename: 'embed.html',           tokenize: tokenizeHTML },
  { id: 'react',   label: 'React',   filename: 'ContactForm.tsx',      tokenize: tokenizeJS   },
  { id: 'vue',     label: 'Vue',     filename: 'ContactForm.vue',      tokenize: tokenizeVue  },
  { id: 'angular', label: 'Angular', filename: 'contact-form.component.ts', tokenize: tokenizeJS },
];

// ---------------------------------------------------------------------------
// Syntax-highlighted code renderer
// ---------------------------------------------------------------------------

function HighlightedCode({ tokens }: { tokens: Token[] }) {
  return (
    <code>
      {tokens.map((tok, i) => (
        <span key={i} style={{ color: tok.color }}>{tok.text}</span>
      ))}
    </code>
  );
}

// ---------------------------------------------------------------------------
// EmbedCodeBlock — tabbed, syntax-highlighted embed code panel
// ---------------------------------------------------------------------------

interface EmbedCodeBlockProps {
  formConfig: FormConfig;
  deploymentUrl: string;
}

export default function EmbedCodeBlock({ formConfig, deploymentUrl }: EmbedCodeBlockProps) {
  const [activeTab, setActiveTab] = useState<TabId>('html');
  const [copied, setCopied] = useState(false);

  const snippets = useMemo(() => ({
    html:    generateEmbedSnippet(formConfig, deploymentUrl),
    react:   generateReactSnippet(formConfig, deploymentUrl),
    vue:     generateVueSnippet(formConfig, deploymentUrl),
    angular: generateAngularSnippet(formConfig, deploymentUrl),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [deploymentUrl, formConfig.fields, formConfig.enableHoneypot]);

  const tab = TABS.find((t) => t.id === activeTab)!;
  const code = snippets[activeTab];
  const tokens = useMemo(() => tab.tokenize(code), [tab, code]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = code;
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
      {/* Header: tabs + filename + copy */}
      <div
        className="flex items-center justify-between gap-2 px-4 py-2 border-b"
        style={{ background: '#161b22', borderColor: 'var(--color-border)' }}
      >
        {/* Framework tabs */}
        <div className="flex items-center gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 focus:outline-none"
              style={{
                background: activeTab === t.id ? 'var(--color-surface-2)' : 'transparent',
                color: activeTab === t.id ? 'var(--color-text)' : 'var(--color-muted)',
                border: activeTab === t.id ? '1px solid var(--color-border)' : '1px solid transparent',
              }}
              aria-pressed={activeTab === t.id}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filename + copy button */}
        <div className="flex items-center gap-3 shrink-0">
          <span
            className="text-xs font-mono hidden sm:block"
            style={{ color: 'var(--color-muted)' }}
          >
            {tab.filename}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 focus:outline-none focus:ring-2"
            style={{
              background: copied ? 'rgba(34,197,94,0.15)' : 'var(--color-surface-2)',
              color: copied ? 'var(--color-success)' : 'var(--color-text)',
              border: `1px solid ${copied ? 'rgba(34,197,94,0.35)' : 'var(--color-border)'}`,
            }}
            aria-label={copied ? 'Copied to clipboard' : `Copy ${tab.label} snippet`}
          >
            {copied ? (
              <><CheckIcon className="w-3.5 h-3.5" />Copied!</>
            ) : (
              <><ClipboardIcon className="w-3.5 h-3.5" />Copy</>
            )}
          </button>
        </div>
      </div>

      {/* Code area */}
      <div className="overflow-x-auto" style={{ background: '#0d1117' }}>
        <pre
          className="p-5 text-xs leading-relaxed font-mono whitespace-pre"
          style={{ tabSize: 2 }}
          aria-label={`${tab.label} embed snippet`}
        >
          <HighlightedCode tokens={tokens} />
        </pre>
      </div>
    </div>
  );
}
