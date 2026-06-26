'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Server, ShieldCheck, Database, FileCode2, Bell, Copy, Reply, Bug,
  Layers, PencilLine, Braces, ArrowRight, KeyRound, Mail as MailIcon,
} from 'lucide-react';
import { revealUp, revealStagger, inView } from '@/lib/animations';
import { GoogleSheetsIcon, GoogleAppsScriptIcon, GoogleDriveIcon } from '@/components/google-icons';
import AuthButton from '@/components/AuthButton';
import StepRows from '@/components/how-it-works/StepRows';
import SectionDivider from '@/components/landing/SectionDivider';

const ease = [0.21, 1.02, 0.73, 0.99] as const;
const BG = 'var(--color-bg)';
const BG2 = 'var(--color-bg-2)';

/* ── Page header (compact — intentionally not a hero) ──────────── */
function PageHeader() {
  return (
    <section className="relative px-4 pt-20 pb-10 sm:pt-24 sm:pb-12" style={{ background: BG }}>
      <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center gap-4">
        <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="chip">
          Documentation
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.05 }}
          className="text-[length:var(--text-4xl)] font-extrabold tracking-tight leading-[1.1]"
          style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}
        >
          How RG Forms <span className="gradient-text">actually works</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.15 }}
          className="text-base sm:text-lg leading-relaxed max-w-2xl"
          style={{ color: 'var(--color-muted)' }}
        >
          RG Forms gives you a live contact form endpoint in under 2 minutes — backed entirely by a
          Google Sheet you own. No server to manage, no monthly fee, no third-party data storage.
        </motion.p>
      </div>
    </section>
  );
}

/* ── The idea (contrast) ───────────────────────────────────────── */
function Idea() {
  return (
    <section className="relative px-4 py-24 sm:py-32" style={{ background: 'var(--color-bg-2)' }}>
      <div className="aura" aria-hidden="true" />
      <div className="relative max-w-5xl mx-auto">
        <motion.h2
          variants={revealUp} initial="hidden" whileInView="visible" viewport={inView}
          className="text-[length:var(--text-4xl)] font-extrabold tracking-tight text-center max-w-3xl mx-auto leading-[1.08]"
          style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}
        >
          Most form tools keep your data. <span className="gradient-text">RG Forms gives it back.</span>
        </motion.h2>

        <motion.div
          className="mt-16 grid md:grid-cols-2 gap-5"
          variants={revealStagger} initial="hidden" whileInView="visible" viewport={inView}
        >
          <motion.div variants={revealUp} className="card p-7 flex flex-col gap-3" style={{ opacity: 0.92 }}>
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl" style={{ background: 'var(--color-surface-2)', color: 'var(--color-subtle)' }}>
              <Server size={20} />
            </span>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}>The usual way</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Most contact form tools store your submissions on their servers. You pay monthly, you
              depend on their uptime, and your data lives in their database.
            </p>
          </motion.div>
          <motion.div variants={revealUp} className="card card-hover p-7 flex flex-col gap-3" style={{ borderColor: 'var(--color-accent-border)' }}>
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl btn-gradient">
              <ShieldCheck size={20} className="text-white" />
            </span>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}>The RG Forms way</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Every submission goes directly into a Google Sheet in your own Google Drive, sent by an
              Apps Script you own and control. RG Forms provisions that sheet and script for you — about
              90 seconds — then your endpoint works forever at no cost, independent of any RG Forms server.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Architecture (dark window) ────────────────────────────────── */
const ARCH = `Setup (one time, in your browser):

  Your Browser
      ├─── Google OAuth        ──▶  Short-lived token (memory only)
      ├─── Google Drive API    ──▶  Creates Sheet + Drive folder
      └─── Apps Script API     ──▶  Creates & deploys form handler

Live endpoint (after provisioning):

  Your Website / App
      └─── POST to script URL
                └─── Apps Script (in your Google account)
                          ├─── Appends row to Google Sheet
                          ├─── Sends email notification
                          └─── Returns { result: "success" }`;

function Architecture() {
  return (
    <section className="px-4 py-24 sm:py-28">
      <div className="max-w-5xl mx-auto">
        <motion.div variants={revealUp} initial="hidden" whileInView="visible" viewport={inView} className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-[length:var(--text-3xl)] font-extrabold tracking-tight" style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}>
            No server in the <span className="gradient-text">middle</span>
          </h2>
          <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            RG Forms is a fully static web app. There is no RG Forms server, no database, and no
            backend. Every API call during setup goes directly from your browser to Google using your
            own OAuth token.
          </p>
        </motion.div>
        <motion.div
          variants={revealUp} initial="hidden" whileInView="visible" viewport={inView}
          className="rounded-2xl overflow-hidden" style={{ background: 'oklch(0.21 0.05 295)', boxShadow: 'var(--shadow-xl)' }}
        >
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'oklch(0.26 0.06 295)' }}>
            <span className="w-3 h-3 rounded-full" style={{ background: 'oklch(0.78 0.16 350)' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: 'oklch(0.80 0.12 90)' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: 'oklch(0.80 0.15 162)' }} />
            <span className="ml-3 text-xs font-mono" style={{ color: 'oklch(0.64 0.05 295)' }}>architecture.txt</span>
          </div>
          <pre className="p-5 overflow-x-auto font-mono text-[12px] leading-relaxed" style={{ color: 'oklch(0.90 0.03 295)' }}>{ARCH}</pre>
        </motion.div>
      </div>
    </section>
  );
}

/* ── What gets created ─────────────────────────────────────────── */
const CREATED = [
  { icon: <GoogleDriveIcon />, title: 'A Drive folder', body: 'Named after your form slug. Contains your Google Sheet. Browse, share, and manage it like any other Drive folder.' },
  { icon: <GoogleSheetsIcon />, title: 'A Google Sheet', body: 'One tab for your form submissions, pre-populated with your column headers, plus a hidden _manifest tab the script reads on every request.' },
  { icon: <GoogleAppsScriptIcon />, title: 'An Apps Script web app', body: 'Handles form submissions (POST), appends rows, and sends email notifications. Deployed as a permanent HTTPS endpoint under your Google account.' },
];

function Created() {
  return (
    <section className="px-4 py-24 sm:py-28" style={{ background: 'var(--color-bg-2)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.h2 variants={revealUp} initial="hidden" whileInView="visible" viewport={inView}
          className="text-[length:var(--text-3xl)] font-extrabold tracking-tight text-center mb-14"
          style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}>
          What lands in <span className="gradient-text">your Google Drive</span>
        </motion.h2>
        <motion.div className="grid md:grid-cols-3 gap-5" variants={revealStagger} initial="hidden" whileInView="visible" viewport={inView}>
          {CREATED.map(({ icon, title, body }) => (
            <motion.div key={title} variants={revealUp} className="card card-hover p-7 flex flex-col gap-3">
              <span className="text-2xl">{icon}</span>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── Endpoint (dark window) ────────────────────────────────────── */
const SNIPPET = `// POST directly from your site — no server proxy needed.
// Use Content-Type: text/plain to avoid a CORS preflight.
const res = await fetch(FORM_SCRIPT_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain' },
  body: JSON.stringify({
    tab: 'contact',
    fields,          // { name, email, phone, message, ... }
  }),
});
const data = await res.json();
// { result: 'success' } or { result: 'error', error: '...' }`;

function Endpoint() {
  return (
    <section className="px-4 py-24 sm:py-28">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-10 items-center">
        <motion.div variants={revealUp} initial="hidden" whileInView="visible" viewport={inView} className="lg:col-span-2">
          <h2 className="text-[length:var(--text-3xl)] font-extrabold tracking-tight" style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}>
            Submit from <span className="gradient-text">anywhere</span>
          </h2>
          <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Your endpoint accepts a JSON POST with a <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ background: 'var(--color-surface-2)', color: 'var(--color-accent-ink)' }}>tab</code> and <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ background: 'var(--color-surface-2)', color: 'var(--color-accent-ink)' }}>fields</code> object. Use <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ background: 'var(--color-surface-2)', color: 'var(--color-accent-ink)' }}>text/plain</code> — this avoids a CORS preflight that Apps Script cannot respond to, while the body is still parsed as JSON.
          </p>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            The RGFORMS.md export from your dashboard gives any AI assistant the exact field names, tab
            name, and endpoint URL — so it can wire up the form for you automatically.
          </p>
        </motion.div>
        <motion.div variants={revealUp} initial="hidden" whileInView="visible" viewport={inView}
          className="lg:col-span-3 rounded-2xl overflow-hidden" style={{ background: 'oklch(0.21 0.05 295)', boxShadow: 'var(--shadow-xl)' }}>
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'oklch(0.26 0.06 295)' }}>
            <span className="w-3 h-3 rounded-full" style={{ background: 'oklch(0.78 0.16 350)' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: 'oklch(0.80 0.12 90)' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: 'oklch(0.80 0.15 162)' }} />
            <span className="ml-3 text-xs font-mono" style={{ color: 'oklch(0.64 0.05 295)' }}>send-contact.js</span>
          </div>
          <pre className="p-5 overflow-x-auto font-mono text-[12px] leading-relaxed" style={{ color: 'oklch(0.90 0.03 295)' }}>{SNIPPET}</pre>
        </motion.div>
      </div>
    </section>
  );
}

/* ── What's included ───────────────────────────────────────────── */
const FEATURES = [
  { icon: Bell, title: 'Email notifications', desc: 'Every submission triggers an email to your notification address. Configurable subject line.' },
  { icon: Copy, title: 'CC / BCC support', desc: 'Copy other addresses on every notification without exposing them in your frontend code.' },
  { icon: Reply, title: 'Reply-to field', desc: 'Map a form field (like email) as the reply-to address so you can respond directly.' },
  { icon: Bug, title: 'Honeypot spam protection', desc: 'A hidden field bots fill out; the script silently discards those submissions.' },
  { icon: Layers, title: 'Multiple forms', desc: 'Add more form tabs to the same sheet from the dashboard — separate tabs, same endpoint.' },
  { icon: PencilLine, title: 'Edit fields any time', desc: 'Update labels, add fields, remove fields — no reprovisioning or redeployment needed.' },
  { icon: FileCode2, title: 'RGFORMS.md export', desc: 'Export an AI skill file compatible with any AI IDE — Claude Code, Cursor, Copilot, Windsurf, and more.' },
  { icon: Braces, title: 'Manifest JSON', desc: 'Download your full configuration as JSON for your own records or tooling.' },
];

function Features() {
  return (
    <section className="px-4 py-24 sm:py-28" style={{ background: 'var(--color-bg-2)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.h2 variants={revealUp} initial="hidden" whileInView="visible" viewport={inView}
          className="text-[length:var(--text-3xl)] font-extrabold tracking-tight text-center mb-14"
          style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}>
          Everything that&apos;s <span className="gradient-text">included</span>
        </motion.h2>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={revealStagger} initial="hidden" whileInView="visible" viewport={inView}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={revealUp} className="card card-hover p-5 flex flex-col gap-2.5">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent-ink)' }}>
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

/* ── Limitations ───────────────────────────────────────────────── */
const LIMITS = [
  { icon: MailIcon, title: 'Email quota', body: 'Google Apps Script accounts are limited to roughly 100 email notifications per day on free Google accounts. This is a Google-imposed quota.' },
  { icon: KeyRound, title: 'One-time script authorization', body: 'After provisioning, you must open the script URL once while signed in to Google and approve the permissions. This is a Google requirement for scripts deployed via API.' },
  { icon: ShieldCheck, title: 'Apps Script API must be enabled', body: 'The Google Apps Script API must be enabled in your Google account before provisioning. RG Forms detects this and shows a direct link to enable it — a single toggle.' },
  { icon: Bug, title: 'Honeypot-only spam protection', body: 'Forms support a honeypot hidden field. For high-traffic forms, consider adding reCAPTCHA to your frontend HTML manually.' },
];

function Limitations() {
  return (
    <section className="px-4 py-24 sm:py-28">
      <div className="max-w-5xl mx-auto">
        <motion.h2 variants={revealUp} initial="hidden" whileInView="visible" viewport={inView}
          className="text-[length:var(--text-3xl)] font-extrabold tracking-tight text-center mb-3"
          style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}>
          Honest about the <span className="gradient-text">limits</span>
        </motion.h2>
        <motion.div className="mt-12 grid md:grid-cols-2 gap-5" variants={revealStagger} initial="hidden" whileInView="visible" viewport={inView}>
          {LIMITS.map(({ icon: Icon, title, body }) => (
            <motion.div key={title} variants={revealUp} className="card p-6 flex gap-4">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg shrink-0" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
                <Icon size={18} />
              </span>
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--color-heading)' }}>{title}</h3>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── Trust + CTA ───────────────────────────────────────────────── */
function TrustCta() {
  return (
    <section className="px-4 pb-28">
      <motion.div
        variants={revealUp} initial="hidden" whileInView="visible" viewport={inView}
        className="relative max-w-5xl mx-auto rounded-[var(--radius-2xl)] overflow-hidden px-6 py-16 sm:py-20 text-center"
        style={{ background: 'linear-gradient(120deg, var(--grad-from), var(--grad-via) 55%, var(--grad-to))', boxShadow: 'var(--shadow-xl)' }}
      >
        <div className="absolute inset-0 dot-grid opacity-30" aria-hidden="true" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <Database size={32} className="text-white/90" />
          <h2 className="text-[length:var(--text-3xl)] font-extrabold tracking-tight text-white max-w-2xl" style={{ fontFamily: 'var(--font-display)' }}>
            No data leaves your Google account
          </h2>
          <p className="text-white/90 max-w-xl leading-relaxed">
            RG Forms is a static app that makes API calls on your behalf using a short-lived access
            token that never touches our servers. Submissions go directly from your website to your own
            Apps Script endpoint and land in your own Google Sheet.
          </p>
          <div className="mt-2 rounded-xl bg-white/10 p-1.5 backdrop-blur-sm">
            <AuthButton />
          </div>
          <div className="flex items-center gap-5 text-sm text-white/85">
            <Link href="/privacy" className="underline hover:no-underline">Privacy policy</Link>
            <Link href="/" className="inline-flex items-center gap-1.5 underline hover:no-underline">Back to home <ArrowRight size={14} /></Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default function HowItWorks() {
  return (
    <main className="relative" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <PageHeader />
      <SectionDivider top={BG} bottom={BG2} />
      <Idea />
      <SectionDivider top={BG2} bottom={BG} flip />
      <Architecture />
      <section className="pt-8 pb-24 sm:pb-28" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center px-4 mb-16">
          <motion.h2 variants={revealUp} initial="hidden" whileInView="visible" viewport={inView}
            className="text-[length:var(--text-3xl)] font-extrabold tracking-tight"
            style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}>
            Five steps, <span className="gradient-text">about 90 seconds</span>
          </motion.h2>
          <p className="mt-3 text-base" style={{ color: 'var(--color-muted)' }}>Here&apos;s the whole flow, start to finish.</p>
        </div>
        <StepRows />
      </section>
      <SectionDivider top={BG} bottom={BG2} />
      <Created />
      <SectionDivider top={BG2} bottom={BG} flip />
      <Endpoint />
      <SectionDivider top={BG} bottom={BG2} />
      <Features />
      <SectionDivider top={BG2} bottom={BG} flip />
      <Limitations />
      <TrustCta />
    </main>
  );
}
