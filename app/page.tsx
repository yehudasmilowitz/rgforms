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
import { Mail, ShieldCheck, Zap } from 'lucide-react'

export default function Page() {
  const { state } = useApp()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [state.screen])

  if (state.screen === 'site-select') return <SiteSelect />
  if (state.screen === 'site-starter') return <SiteStarter />
  if (state.screen === 'site-starter-provisioning') return <SiteStarterProgress />
  if (state.screen === 'site-kit') return <SiteKit />

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
        className="relative z-10 w-full max-w-xl flex flex-col items-center text-center gap-8"
        variants={heroContainer}
        initial="hidden"
        animate="visible"
      >

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-4">
          <h1
            className="text-[var(--text-hero)] font-extrabold tracking-tight leading-none"
            style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
          >
            RG Forms
          </h1>

          <p className="text-xl sm:text-2xl font-semibold leading-snug" style={{ color: 'var(--color-text)' }}>
            A live contact form endpoint in under 2 minutes — no backend required.
          </p>

          <p className="text-sm leading-relaxed max-w-sm" style={{ color: 'var(--color-muted)' }}>
            Sign in with Google, configure your fields, and get a POST endpoint you can drop into any site. Submissions land in your Google Sheet and hit your inbox instantly.
          </p>
        </motion.div>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <motion.div variants={scaleIn}>
          <AuthButton />
        </motion.div>

        {/* ── Benefits ─────────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="w-full flex flex-col gap-2">
          {([
            { icon: <Zap size={15} />, text: 'Live POST endpoint in under 2 minutes — no server, no backend, no monthly fee' },
            { icon: <Mail size={15} />, text: 'Email notification on every submission — straight to your inbox, instantly' },
            { icon: <ShieldCheck size={15} />, text: 'Your own HTML and design — works in any site or framework, submissions go to your Google Sheet' },
          ] as const).map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <span style={{ color: 'var(--color-accent)', flexShrink: 0 }}>{icon}</span>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{text}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Built on ─────────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <span className="text-xs" style={{ color: 'var(--color-subtle)' }}>Built on</span>
          <div
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <span title="Google Sheets" className="opacity-70"><GoogleSheetsIcon /></span>
            <span className="mx-1 text-[10px]" style={{ color: 'var(--color-subtle)' }}>·</span>
            <span title="Google Drive" className="opacity-70"><GoogleDriveIcon /></span>
            <span className="mx-1 text-[10px]" style={{ color: 'var(--color-subtle)' }}>·</span>
            <span title="Google Apps Script" className="opacity-70"><GoogleAppsScriptIcon /></span>
          </div>
          <span className="text-xs" style={{ color: 'var(--color-subtle)' }}>entirely yours</span>
        </motion.div>

        {/* ── Sheetspin CTA ────────────────────────────────────────────────── */}
        <motion.a
          href="https://sheetspin.com"
          target="_blank"
          rel="noopener noreferrer"
          variants={fadeUp}
          className="w-full flex items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left transition-colors"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent-border)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; }}
        >
          <div className="flex flex-col gap-0.5">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-subtle)' }}>
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
            { href: '/contact', label: 'Contact' },
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
