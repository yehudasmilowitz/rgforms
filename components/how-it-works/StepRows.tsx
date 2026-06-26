'use client';

import { motion } from 'motion/react';
import { LogIn, SlidersHorizontal, ServerCog, ShieldCheck, MailCheck } from 'lucide-react';
import { GoogleSheetsIcon } from '@/components/google-icons';
import { revealUp, inView } from '@/lib/animations';

const STEPS = [
  {
    icon: LogIn,
    title: 'Sign in with Google',
    text: "You grant RG Forms a temporary OAuth access token. This token lives only in browser memory — it's never sent to any RG Forms server, never written to disk, and disappears when you close the tab.",
  },
  {
    icon: SlidersHorizontal,
    title: 'Configure your form',
    text: 'Give your form a name, set the email address for notifications, and configure your fields. Add any fields you need — text, email, phone, textarea, select — and mark them required or optional.',
  },
  {
    icon: ServerCog,
    title: 'We provision everything',
    text: 'RG Forms creates a Drive folder, a Google Sheet with your column headers and a hidden _manifest tab, and an Apps Script project — deployed as a public HTTPS web app with a permanent endpoint URL.',
  },
  {
    icon: ShieldCheck,
    title: 'Authorize your script',
    text: 'Because the script was deployed via API, Google requires a one-time manual authorization. Open the script URL, sign in if prompted, and approve. It only requests access to its one spreadsheet and email sending — nothing else.',
  },
  {
    icon: MailCheck,
    title: 'Start receiving submissions',
    text: 'POST JSON to your endpoint from any website, app, or no-code tool. Each submission appends a row to your Google Sheet and sends you an email notification — edit fields any time without reprovisioning.',
  },
] as const;

function Visual({ index }: { index: number }) {
  const common = 'w-full max-w-sm rounded-2xl p-5 bg-[var(--color-surface)] border';
  const style = { borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-lg)' } as const;

  if (index === 0)
    return (
      <div className={common} style={style}>
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="w-14 h-14 rounded-2xl btn-gradient flex items-center justify-center">
            <LogIn size={24} className="text-white" />
          </div>
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-lg border" style={{ borderColor: 'var(--color-border-strong)' }}>
            <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-heading)' }}>Sign in with Google</span>
          </div>
          <p className="text-[11px]" style={{ color: 'var(--color-subtle)' }}>Token stays in your browser</p>
        </div>
      </div>
    );

  if (index === 1)
    return (
      <div className={common} style={style}>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-subtle)' }}>Form fields</p>
        <div className="flex flex-col gap-2.5">
          {['Name', 'Email', 'Phone', 'Message'].map((f, i) => (
            <div key={f} className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: 'var(--color-border)' }}>
              <span className="text-sm flex-1" style={{ color: 'var(--color-text)' }}>{f}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: i < 2 ? 'var(--color-accent)' : 'var(--color-surface-2)', color: i < 2 ? '#fff' : 'var(--color-subtle)' }}>REQ</span>
            </div>
          ))}
        </div>
      </div>
    );

  if (index === 2)
    return (
      <div className={common} style={style}>
        <div className="flex flex-col gap-3 py-1">
          {['Drive folder created', 'Google Sheet created', 'Apps Script deployed'].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: 'var(--color-accent)' }}>✓</span>
              <span className="text-sm" style={{ color: 'var(--color-text)' }}>{s}</span>
            </div>
          ))}
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
            <span className="text-sm" style={{ color: 'var(--color-muted)' }}>Finalizing endpoint…</span>
          </div>
        </div>
      </div>
    );

  if (index === 3)
    return (
      <div className={common} style={style}>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={18} style={{ color: 'var(--color-accent)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--color-heading)' }}>This app wants access to</span>
        </div>
        <div className="flex flex-col gap-2">
          {['See & manage this one spreadsheet', 'Send email on your behalf'].map((s) => (
            <div key={s} className="flex items-center gap-2 text-sm rounded-lg px-3 py-2" style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}>
              <span style={{ color: 'var(--color-accent)' }}>•</span>{s}
            </div>
          ))}
        </div>
        <button className="mt-4 w-full btn-gradient text-sm font-semibold py-2.5 rounded-lg">Allow</button>
      </div>
    );

  return (
    <div className={common} style={style}>
      <div className="flex items-center gap-2 mb-3">
        <MailCheck size={18} style={{ color: 'var(--color-accent)' }} />
        <span className="text-sm font-bold" style={{ color: 'var(--color-heading)' }}>New submission</span>
      </div>
      <div className="flex items-center gap-2 rounded-lg border px-3 py-2 mb-3" style={{ borderColor: 'var(--color-border)' }}>
        <GoogleSheetsIcon />
        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Row appended · email sent</span>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="h-3 rounded" style={{ background: i > 5 ? 'var(--color-accent-subtle)' : 'var(--color-surface-2)' }} />
        ))}
      </div>
    </div>
  );
}

export default function StepRows() {
  return (
    <div className="max-w-5xl mx-auto px-4">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        return (
          <motion.div
            key={step.title}
            variants={revealUp}
            initial="hidden"
            whileInView="visible"
            viewport={inView}
            className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center py-14 sm:py-16 ${
              i > 0 ? 'border-t' : 'pt-0'
            }`}
            style={i > 0 ? { borderColor: 'var(--color-border)' } : undefined}
          >
            {/* text — consistently on the left */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="inline-flex items-center justify-center w-11 h-11 rounded-2xl btn-gradient text-white text-lg font-extrabold"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {i + 1}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide"
                  style={{ color: 'var(--color-accent-ink)' }}
                >
                  <Icon size={15} />
                  Step {i + 1}
                </span>
              </div>
              <h3
                className="text-[length:var(--text-2xl)] font-extrabold tracking-tight leading-tight"
                style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}
              >
                {step.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed max-w-lg" style={{ color: 'var(--color-muted)' }}>
                {step.text}
              </p>
            </div>
            {/* graphic — consistently on the right */}
            <div className="flex justify-center lg:justify-end">
              <Visual index={i} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
