'use client';

import { motion } from 'motion/react';
import { revealUp, inView } from '@/lib/animations';
import AuthButton from '@/components/AuthButton';

function BeaconFallback() {
  return (
    <span className="relative inline-flex items-center justify-center w-3 h-3">
      <span className="absolute inline-flex h-full w-full rounded-full animate-glow-pulse" style={{ background: 'var(--color-accent)' }} />
      <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--color-accent)' }} />
    </span>
  );
}

export default function CtaBand() {
  return (
    <section className="px-4 py-20" style={{ background: 'var(--color-bg-2)' }}>
      <motion.div
        className="relative max-w-5xl mx-auto rounded-[var(--radius-2xl)] overflow-hidden px-6 py-16 sm:py-20 text-center"
        style={{ background: 'linear-gradient(120deg, var(--grad-from), var(--grad-via) 55%, var(--grad-to))', boxShadow: 'var(--shadow-xl)' }}
        variants={revealUp}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
      >
        {/* soft texture */}
        <div className="absolute inset-0 dot-grid opacity-30" aria-hidden="true" />

        <div className="relative z-10 flex flex-col items-center gap-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}>
            <BeaconFallback /> Your endpoint goes live in ~90 seconds
          </span>
          <div className="mt-2 rounded-xl bg-white/10 p-1.5 backdrop-blur-sm">
            <AuthButton />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
