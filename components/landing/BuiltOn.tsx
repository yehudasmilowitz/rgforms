'use client';

import { Fragment } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { revealUp, revealStagger, inView } from '@/lib/animations';
import { GoogleSheetsIcon, GoogleAppsScriptIcon, GoogleDriveIcon } from '@/components/google-icons';

const TOOLS = [
  {
    icon: <GoogleDriveIcon className="w-7 h-7" />,
    name: 'Google Drive',
    role: 'Where it lives',
    desc: 'A Drive folder holds your Google Sheet — browse, share, rename, or move it like any other folder in your own Drive. It is yours, not ours.',
  },
  {
    icon: <GoogleSheetsIcon className="w-7 h-7" />,
    name: 'Google Sheets',
    role: 'Your database',
    desc: 'Every submission lands as a row in a Sheet you own, with your column headers. Sort, filter, chart, or export it however you like.',
  },
  {
    icon: <GoogleAppsScriptIcon className="w-7 h-7" />,
    name: 'Apps Script',
    role: 'Your endpoint',
    desc: 'An Apps Script web app deployed under your account receives each POST, appends the row, and sends your email notification — a permanent HTTPS endpoint, no server required.',
  },
] as const;

export default function BuiltOn() {
  return (
    <section className="relative px-4 py-20 sm:py-28" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={revealUp} initial="hidden" whileInView="visible" viewport={inView}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-subtle)' }}>
            Nothing new to learn
          </p>
          <h2
            className="text-[length:var(--text-3xl)] font-extrabold tracking-tight"
            style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}
          >
            Built entirely on tools you{' '}
            <span className="gradient-text">already own</span>
          </h2>
          <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            No new account, no new dashboard. RG Forms just wires together three Google products you
            already trust — and hands you the keys.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col lg:flex-row items-stretch gap-5 lg:gap-3"
          variants={revealStagger} initial="hidden" whileInView="visible" viewport={inView}
        >
          {TOOLS.map((tool, i) => (
            <Fragment key={tool.name}>
              <motion.div variants={revealUp} className="card card-hover p-7 flex-1 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex items-center justify-center w-14 h-14 rounded-2xl"
                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                  >
                    {tool.icon}
                  </span>
                  <span
                    className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent-ink)' }}
                  >
                    {tool.role}
                  </span>
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}>
                  {tool.name}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {tool.desc}
                </p>
              </motion.div>

              {i < TOOLS.length - 1 && (
                <div className="hidden lg:flex items-center justify-center shrink-0" aria-hidden="true">
                  <ArrowRight size={22} style={{ color: 'var(--color-accent-border)' }} />
                </div>
              )}
            </Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
