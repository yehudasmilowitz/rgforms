'use client'

import { useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { motion } from 'motion/react'
import { heroContainer, fadeUp, scaleIn } from '@/lib/animations'
import { HeroScene } from '@/components/three/HeroScene'
import AuthButton from '@/components/AuthButton'
import SiteStarter from '@/components/SiteStarter'
import SiteStarterProgress from '@/components/SiteStarterProgress'
import SiteKit from '@/components/SiteKit'
import SiteSelect from '@/components/SiteSelect'
import Link from 'next/link'
import { GoogleSheetsIcon, GoogleAppsScriptIcon, GoogleDriveIcon } from '@/components/google-icons'
import { Shield, Zap, Code2, LogIn, Settings, Rocket, CheckCircle2 } from 'lucide-react'

export default function Page() {
  const { state } = useApp()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [state.screen])

  if (state.screen === 'site-select') return <SiteSelect />
  if (state.screen === 'site-starter') return <SiteStarter />
  if (state.screen === 'site-starter-provisioning') return <SiteStarterProgress />
  if (state.screen === 'site-kit') return <SiteKit />

  // Landing screen
  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <HeroScene />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 110%, oklch(0.65 0.22 285 / 0.07) 0%, transparent 70%),
            radial-gradient(ellipse at 50% 0%, oklch(0.07 0.015 285 / 0.7) 0%, transparent 50%)
          `,
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 hero-grid pointer-events-none" aria-hidden="true" />

      <motion.section
        className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center gap-10"
        variants={heroContainer}
        initial="hidden"
        animate="visible"
      >

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-5">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border"
            style={{
              background: 'var(--color-accent-subtle)',
              borderColor: 'var(--color-accent-border)',
              color: 'var(--color-accent)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-glow-pulse" style={{ background: 'var(--color-accent)' }} />
            Zero server · No monthly fees
          </span>

          <h1
            className="text-[var(--text-hero)] font-extrabold tracking-tight leading-none"
            style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
          >
            RG Forms
          </h1>

          <p className="text-xl sm:text-2xl font-semibold leading-snug" style={{ color: 'var(--color-text)' }}>
            Contact forms that go straight{' '}
            <span style={{ color: 'var(--color-muted)' }}>to your Google Sheet.</span>
          </p>

          <p className="text-base leading-relaxed max-w-lg" style={{ color: 'var(--color-muted)' }}>
            Set up your fields, connect your Google account, and get a live form endpoint in under 2 minutes.
            Submissions land in a Google Sheet you own — no monthly fees, no third-party storage.
          </p>
        </motion.div>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <motion.div variants={scaleIn} className="-mt-2">
          <AuthButton />
        </motion.div>

        {/* ── Built on ─────────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="flex items-center gap-3 -mt-4">
          <span className="text-xs tracking-wide" style={{ color: 'var(--color-muted)' }}>Built on</span>
          <div
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <span title="Google Sheets" className="opacity-80 hover:opacity-100 transition-opacity"><GoogleSheetsIcon /></span>
            <span className="mx-1.5 text-[10px]" style={{ color: 'var(--color-muted)' }}>·</span>
            <span title="Google Drive" className="opacity-80 hover:opacity-100 transition-opacity"><GoogleDriveIcon /></span>
            <span className="mx-1.5 text-[10px]" style={{ color: 'var(--color-muted)' }}>·</span>
            <span title="Google Apps Script" className="opacity-80 hover:opacity-100 transition-opacity"><GoogleAppsScriptIcon /></span>
          </div>
          <span className="text-xs tracking-wide" style={{ color: 'var(--color-muted)' }}>— entirely yours</span>
        </motion.div>

        {/* ── Feature trio ─────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          {([
            {
              icon: <Zap size={18} />,
              title: 'Live in 2 minutes',
              body: 'Sign in, name your form, configure your fields. You get a working API endpoint before you close this tab.',
            },
            {
              icon: <Shield size={18} />,
              title: 'Your data, your Drive',
              body: 'Every submission goes directly to a Google Sheet in your account. We never touch your data.',
            },
            {
              icon: <Code2 size={18} />,
              title: 'Drop-in anywhere',
              body: 'A standard POST endpoint. Works with any framework — Next.js, plain HTML, no-code tools, all of it.',
            },
          ] as const).map(({ icon, title, body }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-xl border p-5"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                style={{
                  background: 'var(--color-accent-subtle)',
                  border: '1px solid var(--color-accent-border)',
                  color: 'var(--color-accent)',
                  boxShadow: '0 0 16px var(--color-accent-glow)',
                }}
              >
                {icon}
              </div>
              <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--color-text)' }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{body}</p>
            </div>
          ))}
        </motion.div>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="w-full flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-center" style={{ color: 'var(--color-muted)' }}>
            How it works
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {([
              { n: 1, icon: <LogIn size={14} />, label: 'Sign in with Google', sub: 'OAuth only — token stays in memory, never stored' },
              { n: 2, icon: <Settings size={14} />, label: 'Configure your form', sub: 'Name your fields and set a notification email' },
              { n: 3, icon: <Rocket size={14} />, label: 'We provision it', sub: 'Sheet, Drive folder, and live API endpoint' },
              { n: 4, icon: <CheckCircle2 size={14} />, label: 'Start receiving', sub: 'POST to your endpoint — submissions go to the Sheet' },
            ] as const).map(({ n, icon, label, sub }) => (
              <div
                key={n}
                className="relative flex flex-col gap-2 rounded-xl border p-4 overflow-hidden"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0"
                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-accent)' }}
                  >
                    {n}
                  </span>
                  <span style={{ color: 'var(--color-accent)', opacity: 0.7 }}>{icon}</span>
                </div>
                <p className="text-xs font-semibold leading-snug" style={{ color: 'var(--color-text)' }}>{label}</p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>{sub}</p>
              </div>
            ))}
          </div>
          <Link href="/how-it-works" className="self-center text-xs font-medium mt-0.5 hover:underline transition-colors" style={{ color: 'var(--color-accent)' }}>
            Full walkthrough →
          </Link>
        </motion.div>

        {/* ── What you get ─────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
            What you get
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Email notifications', 'Spam honeypot', 'CC / BCC support', 'Custom fields', 'Multiple forms', 'Submissions in Sheets', 'Apps Script API', 'CLAUDE.md export'].map((item) => (
              <span
                key={item}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── Trust note ───────────────────────────────────────────────────── */}
        <motion.p className="text-xs leading-relaxed max-w-xs" style={{ color: 'var(--color-muted)' }} variants={fadeUp}>
          Your data stays in your Drive. We see nothing.{' '}
          OAuth tokens live in memory only and vanish when you close the tab.
        </motion.p>

        {/* ── Sheetspin CTA ────────────────────────────────────────────────── */}
        <motion.a
          href="https://sheetspin.com"
          target="_blank"
          rel="noopener noreferrer"
          variants={fadeUp}
          className="w-full flex items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left transition-colors group"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent-border)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; }}
        >
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-subtle)' }}>
              From the makers of RG Forms
            </p>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              Need a full site backend? Try Sheetspin →
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              AI provisions a complete Google Sheet backend — blog, gallery, events, newsletter, and more — in under 2 minutes.
            </p>
          </div>
          <span className="text-xl shrink-0" style={{ color: 'var(--color-accent)' }}>✦</span>
        </motion.a>

        {/* ── Footer nav ───────────────────────────────────────────────────── */}
        <motion.div
          className="flex items-center gap-5 flex-wrap justify-center text-xs pb-2"
          variants={fadeUp}
        >
          {[
            { href: '/how-it-works', label: 'How it works' },
            { href: '/privacy', label: 'Privacy' },
            { href: '/terms', label: 'Terms' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="hover:underline transition-colors" style={{ color: 'var(--color-muted)' }}>
              {label}
            </Link>
          ))}
          <a
            href="https://rgmarketinggroup.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline transition-colors"
            style={{ color: 'var(--color-muted)' }}
          >
            RG Marketing Group
          </a>
        </motion.div>

      </motion.section>
    </main>
  )
}
