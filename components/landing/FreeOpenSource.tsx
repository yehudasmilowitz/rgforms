'use client';

import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { revealUp, inView } from '@/lib/animations';
import { GithubIcon } from '@/components/GithubIcon';

const REPO_URL = 'https://github.com/yehudasmilowitz/rgforms';

const POINTS = [
  'No subscription, no monthly fee, no usage limits from us',
  'No credit card — ever',
  'Full source on GitHub — audit it, fork it, self-host it',
] as const;

export default function FreeOpenSource() {
  return (
    <section className="px-4 py-16 sm:py-20" style={{ background: 'var(--color-bg-2)' }}>
      <motion.div
        className="relative max-w-5xl mx-auto rounded-[var(--radius-2xl)] overflow-hidden px-6 py-14 sm:px-14 sm:py-16"
        style={{
          background: 'linear-gradient(120deg, var(--grad-from), var(--grad-via) 55%, var(--grad-to))',
          boxShadow: 'var(--shadow-xl)',
        }}
        variants={revealUp}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
      >
        <div className="absolute inset-0 dot-grid opacity-25" aria-hidden="true" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div className="flex flex-col gap-5 text-center lg:text-left">
            <span
              className="self-center lg:self-start inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}
            >
              Free forever · Open source
            </span>
            <h2
              className="text-[length:var(--text-3xl)] font-extrabold tracking-tight leading-[1.1]"
              style={{ color: '#fff', fontFamily: 'var(--font-display)' }}
            >
              RG Forms is 100% free — and always will be.
            </h2>
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>
              This isn&apos;t a free trial or a freemium plan waiting to upsell you. There&apos;s nothing
              to pay, because everything runs inside your own Google account. The entire project is open
              source on GitHub.
            </p>

            <ul className="flex flex-col gap-2.5 max-w-md mx-auto lg:mx-0">
              {POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm sm:text-base text-left" style={{ color: '#fff' }}>
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5"
                    style={{ background: 'rgba(255,255,255,0.22)' }}
                  >
                    <Check size={13} strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center gap-4">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-base transition-transform hover:-translate-y-0.5"
              style={{ background: '#fff', color: 'var(--color-accent-ink)', boxShadow: 'var(--shadow-lg)' }}
            >
              <GithubIcon size={20} /> View source on GitHub
            </a>
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Star it, fork it, or open an issue
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
