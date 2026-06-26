'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Terminal } from 'lucide-react';
import { revealUp, inView } from '@/lib/animations';

const SNIPPET = `const res = await fetch(FORM_SCRIPT_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain' },
  body: JSON.stringify({
    tab: 'contact',
    fields,          // { name, email, message, ... }
  }),
});
const data = await res.json();`;

// dark code window palette (deliberate dark element on the light page)
const WIN = {
  bg: 'oklch(0.21 0.05 295)',
  head: 'oklch(0.26 0.06 295)',
  text: 'oklch(0.93 0.02 295)',
  dim: 'oklch(0.64 0.05 295)',
  green: 'oklch(0.80 0.14 162)',
  teal: 'oklch(0.80 0.15 295)',
  coral: 'oklch(0.78 0.16 350)',
};

function Line({ children }: { children: React.ReactNode }) {
  return <div className="whitespace-pre">{children}</div>;
}

export default function CodeDemo() {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(SNIPPET).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <section className="px-4 py-16 sm:py-24" style={{ background: 'var(--color-bg-2)' }}>
      <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
        {/* copy */}
        <motion.div
          className="lg:col-span-2 text-center lg:text-left"
          variants={revealUp}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
        >
          <span className="chip mb-4"><Terminal size={14} style={{ color: 'var(--color-accent)' }} /> Works anywhere</span>
          <h2
            className="text-[length:var(--text-3xl)] font-extrabold tracking-tight"
            style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}
          >
            Drop it into <span className="gradient-text">any site</span>
          </h2>
          <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            POST JSON to your endpoint from any website, app, or no-code tool — no server proxy
            needed. Use <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ background: 'var(--color-surface-2)', color: 'var(--color-accent-ink)' }}>text/plain</code> to skip the CORS preflight; the body is still parsed as JSON.
          </p>
        </motion.div>

        {/* window */}
        <motion.div
          className="lg:col-span-3 rounded-2xl overflow-hidden"
          style={{ background: WIN.bg, boxShadow: 'var(--shadow-xl)' }}
          variants={revealUp}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
        >
          {/* title bar */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: WIN.head }}>
            <span className="w-3 h-3 rounded-full" style={{ background: WIN.coral }} />
            <span className="w-3 h-3 rounded-full" style={{ background: 'oklch(0.80 0.12 90)' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: WIN.green }} />
            <span className="ml-3 text-xs font-mono" style={{ color: WIN.dim }}>send-contact.js</span>
            <button
              onClick={copy}
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md transition-colors"
              style={{ color: WIN.text, background: 'oklch(1 0 0 / 0.08)' }}
            >
              {copied ? <Check size={13} style={{ color: WIN.green }} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* code */}
          <div className="p-4 sm:p-5 overflow-x-auto font-mono text-[12.5px] leading-relaxed" style={{ color: WIN.text }}>
            <Line><span style={{ color: WIN.coral }}>const</span> res = <span style={{ color: WIN.coral }}>await</span> <span style={{ color: WIN.teal }}>fetch</span>(FORM_SCRIPT_URL, {'{'}</Line>
            <Line>{'  '}method: <span style={{ color: WIN.green }}>{"'POST'"}</span>,</Line>
            <Line>{'  '}headers: {'{'} <span style={{ color: WIN.text }}>{"'Content-Type'"}</span>: <span style={{ color: WIN.green }}>{"'text/plain'"}</span> {'}'},</Line>
            <Line>{'  '}body: <span style={{ color: WIN.teal }}>JSON</span>.<span style={{ color: WIN.teal }}>stringify</span>({'{'}</Line>
            <Line>{'    '}tab: <span style={{ color: WIN.green }}>{"'contact'"}</span>,</Line>
            <Line>{'    '}fields,{'          '}<span style={{ color: WIN.dim }}>{"// { name, email, message, ... }"}</span></Line>
            <Line>{'  '}{'}'}),</Line>
            <Line>{'}'});</Line>
            <Line><span style={{ color: WIN.coral }}>const</span> data = <span style={{ color: WIN.coral }}>await</span> res.<span style={{ color: WIN.teal }}>json</span>();</Line>

            {/* animated success response */}
            <motion.div
              className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: 'oklch(0.80 0.14 162 / 0.12)', border: '1px solid oklch(0.80 0.14 162 / 0.3)' }}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <Check size={15} style={{ color: WIN.green }} />
              <span style={{ color: WIN.green }}>{'{ result: '}<span style={{ color: WIN.text }}>{"'success'"}</span>{' }'}</span>
              <span className="ml-auto text-[11px]" style={{ color: WIN.dim }}>200 · row added · email sent</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
