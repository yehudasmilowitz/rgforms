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
import { GoogleSheetsIcon, GoogleAppsScriptIcon, GoogleDriveIcon, GoogleProfileIcon } from '@/components/google-icons'

// ─── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border p-5"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <span className="text-2xl leading-none">{icon}</span>
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{title}</p>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{body}</p>
    </div>
  )
}

// ─── Module pill ──────────────────────────────────────────────────────────────

function ModulePill({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
    >
      {label}
    </span>
  )
}

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
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 overflow-hidden"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* Three.js / CSS background */}
      <HeroScene />

      {/* Atmospheric gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 50% 100%, oklch(0.07 0.015 285 / 0.9) 0%, transparent 60%),
            radial-gradient(ellipse at 50% 0%, oklch(0.07 0.015 285 / 0.6) 0%, transparent 50%)
          `,
        }}
        aria-hidden="true"
      />

      {/* Hero grid texture */}
      <div className="absolute inset-0 hero-grid pointer-events-none" aria-hidden="true" />

      {/* Content */}
      <motion.section
        className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center gap-6"
        variants={heroContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={fadeUp}>
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border"
            style={{
              background: 'var(--color-accent-subtle)',
              borderColor: 'var(--color-accent-border)',
              color: 'var(--color-accent)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-glow-pulse"
              style={{ background: 'var(--color-accent)' }}
            />
            AI-powered · Zero backend · Yours forever
          </span>
        </motion.div>

        {/* Product name */}
        <motion.h1
          className="text-[var(--text-hero)] font-extrabold tracking-tight leading-none"
          style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
          variants={fadeUp}
        >
          RG Forms
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-xl sm:text-2xl font-semibold leading-snug"
          style={{ color: 'var(--color-text)' }}
          variants={fadeUp}
        >
          Your website&apos;s entire backend —{' '}
          <span style={{ color: 'var(--color-muted)' }}>in your Google Drive, in minutes</span>
        </motion.p>

        {/* Subtitle */}
        <motion.p
          className="text-base sm:text-lg leading-relaxed max-w-xl"
          style={{ color: 'var(--color-muted)' }}
          variants={fadeUp}
        >
          Describe your site to AI. It proposes the full structure — forms, content, gallery, newsletter,
          calendar, and more. We provision everything as a single Google Sheet with a live API endpoint.
          No server, no subscription, no lock-in.
        </motion.p>

        {/* AuthButton */}
        <motion.div variants={scaleIn} className="mt-2">
          <AuthButton />
        </motion.div>

        {/* Module types */}
        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2 mt-1">
          {['Contact Form', 'Newsletter', 'Blog / Content', 'Gallery', 'Calendar', 'Asset Storage', 'Site Config', 'Custom Rows'].map((m) => (
            <ModulePill key={m} label={m} />
          ))}
        </motion.div>

        {/* Feature cards */}
        <motion.div variants={fadeUp} className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2 text-left">
          <FeatureCard
            icon="🤖"
            title="AI site builder"
            body="Describe your site in plain English. Gemini proposes a full module structure — tabs, field types, and settings — which you can review and customize before provisioning."
          />
          <FeatureCard
            icon="⚡"
            title="Live API, no redeploy"
            body="Add, remove, or edit modules after provisioning. The Apps Script reads a live manifest tab on every request — no redeployment needed when your site evolves."
          />
          <FeatureCard
            icon="🧠"
            title="CLAUDE.md AI skill"
            body="Export a CLAUDE.md file that turns Claude Code into an agent that knows your site's API, data schema, and calling conventions. Seed realistic test data with one click."
          />
        </motion.div>

        {/* How it works teaser */}
        <motion.div
          className="w-full rounded-xl border p-5 flex flex-col gap-4 text-left mt-2"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          variants={fadeUp}
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
            How it works
          </p>
          <div className="flex flex-col gap-3">
            {[
              { n: '1', label: 'Sign in with Google', body: 'A short-lived OAuth token is used entirely in your browser. Nothing is sent to RG Forms servers.' },
              { n: '2', label: 'Describe your site', body: 'Tell the AI what kind of site you\'re building. It proposes modules, field names, and types. You tweak and confirm.' },
              { n: '3', label: 'We provision everything', body: 'One Google Sheet, one Drive folder, one Apps Script web app with a live HTTPS endpoint — all in your account.' },
              { n: '4', label: 'Manage and evolve', body: 'Add modules, edit form fields, seed AI data, and export your CLAUDE.md skill file — all without touching code or redeploying.' },
            ].map(({ n, label, body }) => (
              <div key={n} className="flex gap-3 items-start">
                <span
                  className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-accent)' }}
                >
                  {n}
                </span>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{label}</p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--color-muted)' }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/how-it-works"
            className="self-start text-xs font-medium"
            style={{ color: 'var(--color-accent)' }}
          >
            Full technical walkthrough →
          </Link>
        </motion.div>

        {/* Scope explanations */}
        <motion.div
          className="w-full rounded-xl border p-5 flex flex-col gap-4 text-left mt-2"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          variants={fadeUp}
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
            Permissions requested
          </p>

          <div className="flex items-start gap-3">
            <span className="shrink-0 mt-0.5"><GoogleProfileIcon /></span>
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                See your Google profile and email
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Displays your name and avatar in the app, and pre-fills the notification email field. Includes the <code className="font-mono px-1 rounded" style={{ background: 'var(--color-surface-2)' }}>openid</code> scope required by Google&apos;s sign-in protocol.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="shrink-0 mt-0.5"><GoogleDriveIcon /></span>
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                See, edit, create, and delete only the specific Drive files you use with this app
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Used to create the Google Sheet and Drive folder that store your site&apos;s data and assets. Cannot access any other files in your Drive.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="shrink-0 mt-0.5"><GoogleAppsScriptIcon /></span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                  Create and update Google Apps Script projects
                </p>
                <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: 'rgba(234,179,8,0.12)', color: 'rgb(161,120,0)' }}>Sensitive</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Creates the script project and uploads the{' '}
                <code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--color-surface-2)', fontFamily: 'var(--font-mono)' }}>doPost()</code>{' '}
                and{' '}
                <code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--color-surface-2)', fontFamily: 'var(--font-mono)' }}>doGet()</code>{' '}
                handlers that power your site&apos;s API endpoint.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="shrink-0 mt-0.5"><GoogleAppsScriptIcon /></span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                  Create and update Google Apps Script deployments
                </p>
                <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: 'rgba(234,179,8,0.12)', color: 'rgb(161,120,0)' }}>Sensitive</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Deploys the script as a public web app to produce the unique HTTPS endpoint your site POSTs to.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Apps Script one-time authorization notice */}
        <motion.div
          className="w-full rounded-xl border p-5 flex flex-col gap-3 text-left"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          variants={fadeUp}
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
            One-time script authorization
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>
            After setup, Google will ask you to <strong>authorize the deployed Apps Script</strong> before it can run. This is a <em>separate</em> Google consent screen — independent of the permissions you grant above.
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            The script runs inside <strong>your own Google account</strong>, so Google requires you to approve it directly. You&apos;ll see this prompt the first time you open the script&apos;s URL. It happens once and is not shown to your end users.
          </p>
          <div className="flex flex-col gap-2 pt-1">
            <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Scopes the script will request at that moment:</p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-start gap-2">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded mt-0.5 shrink-0" style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>spreadsheets.currentonly</span>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Read/write the specific Google Sheet this site is bound to — not all your spreadsheets.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded mt-0.5 shrink-0" style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>gmail.send</span>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Send email notifications on new form submissions — with support for CC, BCC, custom subject, and reply-to.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded mt-0.5 shrink-0" style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>drive.readonly</span>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>List files in the Drive folder for asset browser modules.</span>
              </div>
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            These scopes are written into the <code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--color-surface-2)' }}>appsscript.json</code> manifest that gets uploaded to your script project — you can inspect them in the Google Apps Script editor after setup.
          </p>
        </motion.div>

        {/* Trust note */}
        <motion.p
          className="text-xs leading-relaxed max-w-sm"
          style={{ color: 'var(--color-muted)' }}
          variants={fadeUp}
        >
          We never store your data. Everything is created in your Google Drive. OAuth tokens exist only in
          browser memory. AI seed data calls use your column names only — no personal information.
        </motion.p>

        {/* Footer nav */}
        <motion.div
          className="flex items-center gap-5 flex-wrap justify-center text-xs"
          style={{ color: 'var(--color-subtle)' }}
          variants={fadeUp}
        >
          <Link href="/how-it-works" className="hover:underline transition-colors" style={{ color: 'var(--color-muted)' }}>
            How it works
          </Link>
          <Link href="/privacy" className="hover:underline transition-colors" style={{ color: 'var(--color-muted)' }}>
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:underline transition-colors" style={{ color: 'var(--color-muted)' }}>
            Terms of Service
          </Link>
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
