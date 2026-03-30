'use client'

import { useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { motion } from 'motion/react'
import { heroContainer, fadeUp, scaleIn } from '@/lib/animations'
import { HeroScene } from '@/components/three/HeroScene'
import AuthButton from '@/components/AuthButton'
import Dashboard from '@/components/Dashboard'
import FormBuilderScreen from '@/components/FormBuilder'
import ProvisioningSteps from '@/components/ProvisioningSteps'
import ResultPanel from '@/components/ResultPanel'
import { GoogleSheetsIcon, GoogleAppsScriptIcon, GoogleDriveIcon, GoogleProfileIcon } from '@/components/google-icons'

export default function Page() {
  const { state } = useApp()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [state.screen])

  if (state.screen === 'dashboard') return <Dashboard />
  if (state.screen === 'builder') return <FormBuilderScreen />
  if (state.screen === 'provisioning') return <ProvisioningSteps />
  if (state.screen === 'result') return <ResultPanel />

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
            Zero backend required
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
          HTML contact forms in 2 minutes —{' '}
          <span style={{ color: 'var(--color-muted)' }}>no backend, no subscription</span>
        </motion.p>

        {/* Subtitle */}
        <motion.p
          className="text-base sm:text-lg leading-relaxed max-w-xl"
          style={{ color: 'var(--color-muted)' }}
          variants={fadeUp}
        >
          Sign in with Google to auto-create a Google Sheet + Apps Script that handles your form
          submissions. Everything lives in your Drive.
        </motion.p>

        {/* AuthButton */}
        <motion.div variants={scaleIn} className="mt-2">
          <AuthButton />
        </motion.div>

        {/* Scope explanations */}
        <motion.div
          className="w-full rounded-xl border p-5 flex flex-col gap-4 text-left mt-2"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
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
                Used to create the Google Sheet that stores your submissions. Cannot access any other files in your Drive.
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
                <code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--color-surface-2)', fontFamily: 'var(--font-mono)' }}>
                  doPost()
                </code>{' '}
                handler that receives submissions and sends email notifications.
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
                Deploys the script as a public web app to produce the unique HTTPS endpoint your form POSTs to.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Trust note */}
        <motion.p
          className="text-xs leading-relaxed max-w-sm"
          style={{ color: 'var(--color-muted)' }}
          variants={fadeUp}
        >
          We never store your data. Everything is created in your Google Drive. Tokens exist only in
          browser memory.
        </motion.p>

        {/* Social proof */}
        <motion.p
          className="text-sm"
          style={{ color: 'var(--color-muted)' }}
          variants={fadeUp}
        >
          Automates the{' '}
          <a
            href="https://github.com/dwyl/learn-to-send-email-via-google-script-html-no-server"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline transition-colors"
            style={{ color: 'var(--color-accent)' }}
          >
            DWYL serverless form pattern
          </a>{' '}
          — trusted by 3,000+ developers
        </motion.p>
      </motion.section>
    </main>
  )
}
