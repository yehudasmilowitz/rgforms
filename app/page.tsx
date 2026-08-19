'use client'

import { useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import SiteStarter from '@/components/SiteStarter'
import SiteStarterProgress from '@/components/SiteStarterProgress'
import SiteKit from '@/components/SiteKit'
import SiteSelect from '@/components/SiteSelect'
import Hero from '@/components/landing/Hero'
import FlowDiagram from '@/components/landing/FlowDiagram'
import Benefits from '@/components/landing/Benefits'
import CodeDemo from '@/components/landing/CodeDemo'
import Features from '@/components/landing/Features'
import WorksWith from '@/components/landing/WorksWith'
import CtaBand from '@/components/landing/CtaBand'
import BuiltOn from '@/components/landing/BuiltOn'
import FreeOpenSource from '@/components/landing/FreeOpenSource'
import SectionDivider from '@/components/landing/SectionDivider'

const BG = 'var(--color-bg)'
const BG2 = 'var(--color-bg-2)'

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
    <main className="relative" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Hero />

      {/* How a submission travels */}
      <section className="relative px-4 pt-10 pb-16 sm:pb-20" style={{ background: BG }}>
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-center text-[length:var(--text-2xl)] font-extrabold tracking-tight mb-10"
            style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}
          >
            Every submission flows straight to{' '}
            <span className="gradient-text">tools you own</span>
          </h2>
          <FlowDiagram />
        </div>
      </section>

      <SectionDivider top={BG} bottom={BG2} flip />

      <Benefits />

      <FreeOpenSource />

      <SectionDivider top={BG2} bottom={BG} />

      <BuiltOn />

      <SectionDivider top={BG} bottom={BG2} flip />

      <CodeDemo />

      <SectionDivider top={BG2} bottom={BG} />

      <Features />

      <WorksWith />

      <CtaBand />
    </main>
  )
}
