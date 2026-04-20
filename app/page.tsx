'use client'

import { useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { motion } from 'motion/react'
import { heroContainer, fadeUp, scaleIn } from '@/lib/animations'
import { HeroScene } from '@/components/three/HeroScene'
import AuthButton from '@/components/AuthButton'
import FormBuilderScreen from '@/components/FormBuilder'
import ProvisioningSteps from '@/components/ProvisioningSteps'
import ResultPanel from '@/components/ResultPanel'
import ContentBuilder from '@/components/ContentBuilder'
import ContentResultPanel from '@/components/ContentResultPanel'
import AssetBuilder from '@/components/AssetBuilder'
import AssetResultPanel from '@/components/AssetResultPanel'
import SiteConfigBuilder from '@/components/SiteConfigBuilder'
import SiteConfigResultPanel from '@/components/SiteConfigResultPanel'
import CalendarBuilder from '@/components/CalendarBuilder'
import CalendarResultPanel from '@/components/CalendarResultPanel'
import GalleryBuilder from '@/components/GalleryBuilder'
import GalleryResultPanel from '@/components/GalleryResultPanel'
import DynamicModuleBuilder from '@/components/DynamicModuleBuilder'
import DynamicResultPanel from '@/components/DynamicResultPanel'
import SiteStarter from '@/components/SiteStarter'
import SiteStarterProgress from '@/components/SiteStarterProgress'
import SiteKit from '@/components/SiteKit'
import SiteSelect from '@/components/SiteSelect'
import Link from 'next/link'
import { GoogleSheetsIcon, GoogleAppsScriptIcon, GoogleDriveIcon } from '@/components/google-icons'
import { Sparkles, Layers, Bot, LogIn, MessageSquare, Rocket, RefreshCw } from 'lucide-react'

export default function Page() {
  const { state } = useApp()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [state.screen])

  if (state.screen === 'site-select') return <SiteSelect />
  if (state.screen === 'builder') return <FormBuilderScreen />
  if (state.screen === 'provisioning') return <ProvisioningSteps />
  if (state.screen === 'result') return <ResultPanel />
  if (state.screen === 'content-builder') return <ContentBuilder />
  if (state.screen === 'content-provisioning') return <ProvisioningSteps />
  if (state.screen === 'content-result') return <ContentResultPanel />
  if (state.screen === 'asset-builder') return <AssetBuilder />
  if (state.screen === 'asset-provisioning') return <ProvisioningSteps />
  if (state.screen === 'asset-result') return <AssetResultPanel />
  if (state.screen === 'siteconfig-builder') return <SiteConfigBuilder />
  if (state.screen === 'siteconfig-provisioning') return <ProvisioningSteps />
  if (state.screen === 'siteconfig-result') return <SiteConfigResultPanel />
  if (state.screen === 'calendar-builder') return <CalendarBuilder />
  if (state.screen === 'calendar-provisioning') return <ProvisioningSteps />
  if (state.screen === 'calendar-result') return <CalendarResultPanel />
  if (state.screen === 'gallery-builder') return <GalleryBuilder />
  if (state.screen === 'gallery-provisioning') return <ProvisioningSteps />
  if (state.screen === 'gallery-result') return <GalleryResultPanel />
  if (state.screen === 'module-builder') return <DynamicModuleBuilder />
  if (state.screen === 'module-provisioning') return <ProvisioningSteps />
  if (state.screen === 'module-result') return <DynamicResultPanel />
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
            Zero server · Yours forever
          </span>

          <h1
            className="text-[var(--text-hero)] font-extrabold tracking-tight leading-none"
            style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
          >
            Sheetspin
          </h1>

          <p className="text-xl sm:text-2xl font-semibold leading-snug" style={{ color: 'var(--color-text)' }}>
            Spin up your website&apos;s backend.{' '}
            <span style={{ color: 'var(--color-muted)' }}>In minutes.</span>
          </p>

          <p className="text-base leading-relaxed max-w-lg" style={{ color: 'var(--color-muted)' }}>
            Describe your site. AI spins a complete Google Sheet + live API into your Drive —
            forms, content, gallery, newsletter, and more. No server. No subscription. No lock-in.
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
              icon: <Sparkles size={18} />,
              title: 'AI designs the structure',
              body: 'Describe in a sentence. Get modules, fields, and settings — reviewed and ready to launch.',
            },
            {
              icon: <Layers size={18} />,
              title: 'Live without redeploying',
              body: 'Edit modules any time. The script reads a live manifest — your endpoint never moves.',
            },
            {
              icon: <Bot size={18} />,
              title: 'Your AI knows the whole sheet',
              body: 'Export a CLAUDE.md. Your Claude agent gets the full schema and API instantly.',
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
              { n: 1, icon: <LogIn size={14} />, label: 'Sign in', sub: 'Google OAuth — token stays in memory only' },
              { n: 2, icon: <MessageSquare size={14} />, label: 'Describe your site', sub: 'AI proposes the modules and fields' },
              { n: 3, icon: <Rocket size={14} />, label: 'We spin it up', sub: 'Sheet, folder, and live API endpoint' },
              { n: 4, icon: <RefreshCw size={14} />, label: 'Keep spinning', sub: 'Add modules, seed data, no redeploy ever' },
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

        {/* ── Module types ─────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
            What you can build
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Contact Form', 'Newsletter', 'Blog / Content', 'Gallery', 'Calendar', 'Asset Storage', 'Site Config', 'Custom Rows'].map((m) => (
              <span
                key={m}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
              >
                {m}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── Trust note ───────────────────────────────────────────────────── */}
        <motion.p className="text-xs leading-relaxed max-w-xs" style={{ color: 'var(--color-muted)' }} variants={fadeUp}>
          Your data stays in your Drive. We see nothing.{' '}
          OAuth tokens live in memory only and vanish when you close the tab.
        </motion.p>

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
