'use client';

import { motion } from 'motion/react';
import { Zap, Mail, ShieldCheck } from 'lucide-react';
import { revealUp, inView, revealStagger } from '@/lib/animations';

const BENEFITS = [
  {
    icon: Zap,
    title: 'Live in under 2 minutes',
    text: 'A live POST endpoint with no server, no backend, and no monthly fee — provisioned straight into your own Google account.',
  },
  {
    icon: Mail,
    title: 'Instant email alerts',
    text: 'Every submission sends an email notification straight to your inbox, the moment it lands — with CC, BCC and reply-to support.',
  },
  {
    icon: ShieldCheck,
    title: 'Your HTML, your data',
    text: 'Use your own form markup and design in any site or framework. Submissions go to a Google Sheet you own and control.',
  },
] as const;

export default function Benefits() {
  return (
    <section className="relative px-4 py-14 sm:py-16" style={{ background: 'var(--color-bg-2)' }}>
      <motion.div
        className="max-w-2xl mx-auto flex flex-col gap-3"
        variants={revealStagger}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
      >
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <motion.div
            key={title}
            variants={revealUp}
            className="flex items-start gap-4 rounded-[var(--radius-2xl)] p-4 sm:p-5"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
              style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent-ink)' }}
            >
              <Icon size={20} />
            </span>
            <div className="min-w-0">
              <h3
                className="text-[length:var(--text-base)] font-extrabold tracking-tight leading-tight"
                style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}
              >
                {title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                {text}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
