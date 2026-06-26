'use client';

import { motion } from 'motion/react';
import { FileText, ArrowRight, Mail } from 'lucide-react';
import { GoogleSheetsIcon } from '@/components/google-icons';

/**
 * The signature hero illustration: a submission travelling from a form, into a
 * Google Sheet row, and out as an email notification. Pure inline SVG/markup +
 * Motion — no raster assets. Reduced-motion users get the static composition
 * (the global media query freezes the looping pieces).
 */

const ease = [0.21, 1.02, 0.73, 0.99] as const;

function Station({
  children,
  label,
  tint,
  delay,
}: {
  children: React.ReactNode;
  label: string;
  tint: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease, delay }}
      className="relative flex flex-col items-center gap-3"
    >
      <div
        className="relative w-[180px] rounded-2xl p-4 bg-[var(--color-surface)] border"
        style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-lg)', borderTop: `3px solid ${tint}` }}
      >
        {children}
      </div>
      <span className="text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>
        {label}
      </span>
    </motion.div>
  );
}

function Connector({ delay }: { delay: number }) {
  return (
    <div className="relative hidden lg:flex items-center justify-center w-16 shrink-0" aria-hidden="true">
      <svg width="64" height="24" viewBox="0 0 64 24" fill="none">
        <line
          x1="2" y1="12" x2="62" y2="12"
          stroke="var(--color-border-strong)" strokeWidth="2" strokeLinecap="round"
          strokeDasharray="2 6"
        />
      </svg>
      <motion.span
        className="absolute left-0 w-2.5 h-2.5 rounded-full"
        style={{ background: 'linear-gradient(100deg, var(--grad-from), var(--grad-to))', boxShadow: '0 0 10px var(--color-accent-glow)' }}
        initial={{ x: 4, opacity: 0 }}
        animate={{ x: [4, 54, 54], opacity: [0, 1, 0] }}
        transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.6, delay }}
      />
    </div>
  );
}

function FieldLine({ w, filled }: { w: string; filled?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-2 rounded-full"
        style={{ width: w, background: filled ? 'var(--color-accent-subtle)' : 'var(--color-surface-2)' }}
      />
    </div>
  );
}

export default function FlowDiagram() {
  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="relative flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-0">

        {/* 1 · Form */}
        <Station label="Your form, your HTML" tint="var(--color-coral)" delay={0.15}>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} style={{ color: 'var(--color-coral)' }} />
            <span className="text-xs font-bold" style={{ color: 'var(--color-heading)' }}>Contact</span>
          </div>
          <div className="flex flex-col gap-2.5">
            <FieldLine w="100%" />
            <FieldLine w="80%" />
            <FieldLine w="92%" />
          </div>
          <motion.div
            className="mt-3 h-7 rounded-lg btn-gradient flex items-center justify-center text-[11px] font-semibold"
            animate={{ scale: [1, 0.95, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.6, times: [0, 0.25, 0.5] }}
          >
            Send
          </motion.div>
        </Station>

        <Connector delay={0.2} />

        {/* 2 · Google Sheet */}
        <Station label="Your Google Sheet" tint="var(--color-accent)" delay={0.35}>
          <div className="flex items-center gap-2 mb-3">
            <GoogleSheetsIcon />
            <span className="text-xs font-bold" style={{ color: 'var(--color-heading)' }}>Submissions</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {[0, 1, 2].map((r) => (
              <div key={r} className="grid grid-cols-3 gap-1">
                {[0, 1, 2].map((c) => (
                  <span key={c} className="h-3 rounded" style={{ background: 'var(--color-surface-2)' }} />
                ))}
              </div>
            ))}
            <motion.div
              className="grid grid-cols-3 gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 1, 1, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.4, 0.5, 0.9, 1] }}
            >
              {[0, 1, 2].map((c) => (
                <span key={c} className="h-3 rounded" style={{ background: 'var(--color-accent-subtle)' }} />
              ))}
            </motion.div>
          </div>
        </Station>

        <Connector delay={1.0} />

        {/* 3 · Inbox */}
        <Station label="Straight to your inbox" tint="var(--grad-to)" delay={0.55}>
          <div className="flex items-center gap-2 mb-3">
            <Mail size={16} style={{ color: 'var(--color-accent-ink)' }} />
            <span className="text-xs font-bold" style={{ color: 'var(--color-heading)' }}>New submission</span>
          </div>
          <motion.div
            className="rounded-lg p-2.5 border"
            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
            animate={{ y: [6, 0, 0, 6], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, times: [0.45, 0.6, 0.9, 1] }}
          >
            <FieldLine w="70%" />
            <div className="mt-1.5"><FieldLine w="90%" filled /></div>
          </motion.div>
        </Station>
      </div>

      <p className="mt-7 flex items-center justify-center gap-2 text-xs font-medium" style={{ color: 'var(--color-subtle)' }}>
        No server in between
        <ArrowRight size={13} />
        just your Google account
      </p>
    </div>
  );
}
