'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowRight, Server, ShieldCheck, Timer } from 'lucide-react';
import { heroContainer, fadeUp, scaleIn } from '@/lib/animations';
import AuthButton from '@/components/AuthButton';
import HeroGraphic from '@/components/landing/HeroGraphic';
import SectionDivider from '@/components/landing/SectionDivider';
import { GithubIcon } from '@/components/GithubIcon';

const CHIPS = [
  { icon: Timer, label: 'Live endpoint in under 2 minutes' },
  { icon: Server, label: 'No server' },
  { icon: GithubIcon, label: 'Open source' },
  { icon: ShieldCheck, label: 'Your data stays in your Drive' },
] as const;

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-12 pb-16 sm:pt-16 sm:pb-20">
      {/* Atmosphere */}
      <div className="mesh-bg mesh-animated" aria-hidden="true" />
      <div className="absolute inset-0 dot-grid pointer-events-none" aria-hidden="true" />

      <motion.div
        className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.25fr_0.85fr] gap-10 lg:gap-14 items-center"
        variants={heroContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Left — copy */}
        <div className="min-w-0 flex flex-col items-center text-center lg:items-start lg:text-left gap-5">
          <motion.h1
            variants={fadeUp}
            className="text-[length:var(--text-hero)] font-extrabold leading-[1.08] tracking-tight"
            style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}
          >
            The free form backend for{' '}
            <span className="gradient-text gradient-text-pan">static websites</span>.
          </motion.h1>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-2 justify-center lg:justify-start">
            {CHIPS.map(({ icon: Icon, label }) => (
              <span key={label} className="chip">
                <Icon size={14} className="shrink-0" style={{ color: 'var(--color-accent)' }} />
                {label}
              </span>
            ))}
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg leading-relaxed max-w-xl"
            style={{ color: 'var(--color-muted)' }}
          >
            Add contact forms to HTML, React, Astro, Hugo, Jekyll, GitHub Pages, Netlify or any
            static site — without building a backend. Your submissions go directly to{' '}
            <span style={{ color: 'var(--color-heading)', fontWeight: 700 }}>
              your own Google Sheet
            </span>
            . No server. No database. No monthly fee — it&apos;s free and open source.
          </motion.p>

          <motion.div variants={scaleIn} className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <AuthButton />
            <Link
              href="/guides"
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
              style={{ color: 'var(--color-accent-ink)' }}
            >
              Read the guides <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>

        {/* Right — custom animated 3D graphic */}
        <motion.div variants={scaleIn} className="relative w-full max-w-md mx-auto lg:max-w-none">
          <HeroGraphic />
        </motion.div>
      </motion.div>

      {/* Wave seam emerging from the hero mesh into the white first section */}
      <SectionDivider overlay bottom="var(--color-bg)" />
    </section>
  );
}
