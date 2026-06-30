'use client';

import { motion } from 'motion/react';
import { Bell, Copy, Reply, Bug, ShieldCheck, Layers, PencilLine, FileCode2, Braces } from 'lucide-react';
import { revealUp, revealStagger, inView } from '@/lib/animations';

const FEATURED = {
  icon: FileCode2,
  title: 'RGFORMS.md export',
  desc: 'Export an AI skill file compatible with any AI IDE — Claude Code, Cursor, Copilot, Windsurf, and more — so your assistant can wire up the form for you automatically.',
};

const FEATURES = [
  { icon: Bell, title: 'Email notifications', desc: 'Every submission triggers an email to your notification address. Configurable subject line.' },
  { icon: Copy, title: 'CC / BCC support', desc: 'Copy other addresses on every notification without exposing them in your frontend code.' },
  { icon: Reply, title: 'Reply-to field', desc: 'Map a form field (like email) as the reply-to address so you can respond directly.' },
  { icon: Bug, title: 'Honeypot spam protection', desc: 'A hidden field bots fill out; the script silently discards those submissions.' },
  { icon: ShieldCheck, title: 'Captcha (Cloudflare Turnstile)', desc: 'Optional server-side Turnstile verification on every submission. Toggle it on or off any time — no redeploy.' },
  { icon: Layers, title: 'Multiple forms', desc: 'Add more form tabs to the same sheet — separate tabs, same endpoint.' },
  { icon: PencilLine, title: 'Edit fields any time', desc: 'Update labels, add or remove fields — no reprovisioning needed.' },
  { icon: Braces, title: 'Manifest JSON', desc: 'Download your full configuration as JSON for your own records or tooling.' },
] as const;

export default function Features() {
  return (
    <section className="relative px-4 py-16 sm:py-24" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2
            className="text-[length:var(--text-3xl)] font-extrabold tracking-tight"
            style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}
          >
            Everything you need, <span className="gradient-text">nothing you don&apos;t</span>
          </h2>
          <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Production-ready form handling, all running inside your own Google account.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr"
          variants={revealStagger}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
        >
          {/* featured wide cell */}
          <motion.div
            variants={revealUp}
            className="col-span-2 card card-hover p-6 flex flex-col justify-between gap-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(125deg, var(--color-accent-subtle), var(--color-coral-soft))' }}
          >
            <div className="mesh-bg opacity-60" aria-hidden="true" />
            <div className="relative flex items-start justify-between gap-4">
              <span
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl btn-gradient shrink-0"
              >
                <FEATURED.icon size={22} className="text-white" />
              </span>
              <span className="text-[11px] font-mono px-2 py-1 rounded-md" style={{ background: 'var(--color-surface)', color: 'var(--color-accent-ink)', boxShadow: 'var(--shadow-sm)' }}>
                RGFORMS.md
              </span>
            </div>
            <div className="relative">
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}>
                {FEATURED.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed max-w-md" style={{ color: 'var(--color-muted)' }}>
                {FEATURED.desc}
              </p>
            </div>
          </motion.div>

          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={revealUp} className="card card-hover p-5 flex flex-col gap-2.5">
              <span
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg"
                style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent-ink)' }}
              >
                <Icon size={18} />
              </span>
              <h3 className="text-sm font-bold" style={{ color: 'var(--color-heading)' }}>{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
