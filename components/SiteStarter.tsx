'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '@/context/AppContext';
import { runSiteStarter, getInitialProgress } from '@/lib/siteStarter';
import type { ProjectTemplate } from '@/types';

// ─── Template data ────────────────────────────────────────────────────────────

interface TemplateCard {
  id: ProjectTemplate;
  label: string;
  description: string;
  modules: string;
  icon: React.ReactNode;
}

function BriefcaseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.75"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeWidth="1.75"/>
      <line x1="12" y1="12" x2="12" y2="16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
      <line x1="9"  y1="14" x2="15" y2="14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  );
}

function FoodIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="6" y1="1" x2="6"  y2="4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
      <line x1="10" y1="1" x2="10" y2="4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
      <line x1="14" y1="1" x2="14" y2="4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function AgencyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.75"/>
      <path d="M8 21h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
      <path d="M12 17v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
      <path d="M7 8l3 3 2-2 3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const TEMPLATES: TemplateCard[] = [
  {
    id:          'portfolio',
    label:       'Portfolio',
    description: 'Showcase your work with a gallery, project list, and contact form',
    modules:     'Config · Gallery · Projects · Contact Form',
    icon:        <BriefcaseIcon />,
  },
  {
    id:          'restaurant',
    label:       'Restaurant',
    description: 'Menu, photo gallery, event calendar, and reservation form',
    modules:     'Config · Menu · Photos · Events · Reservations',
    icon:        <FoodIcon />,
  },
  {
    id:          'saas',
    label:       'SaaS / Landing',
    description: 'Testimonials, FAQ, waitlist signup, and contact form for product launches',
    modules:     'Config · Testimonials · FAQ · Waitlist · Contact',
    icon:        <RocketIcon />,
  },
  {
    id:          'nonprofit',
    label:       'Non-profit / Church',
    description: 'Blog, event calendar, photo gallery, and volunteer signup form',
    modules:     'Config · Blog · Events · Gallery · Volunteer Form',
    icon:        <HeartIcon />,
  },
  {
    id:          'agency',
    label:       'Agency',
    description: 'Services, case studies, work gallery, and inquiry form for agencies',
    modules:     'Config · Services · Case Studies · Work · Inquiry',
    icon:        <AgencyIcon />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SiteStarter() {
  const { state, dispatch } = useApp();
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [launching, setLaunching]               = useState(false);

  const canLaunch = selectedTemplate !== null && !launching;

  async function handleLaunch() {
    if (!canLaunch || !state.auth.accessToken) return;

    const token      = state.auth.accessToken;
    const notifyEmail = state.auth.user?.email ?? '';

    const config = {
      template:    selectedTemplate,
      siteName:    state.selectedProject!.projectName,
      notifyEmail,
      projectId:   state.selectedProject!.sheetId,
    };

    setLaunching(true);
    dispatch({ type: 'SET_SITE_STARTER_CONFIG', payload: config });

    const initialProgress = getInitialProgress(config);
    dispatch({ type: 'START_SITE_STARTER_PROVISIONING', payload: initialProgress });

    try {
      const result = await runSiteStarter(
        token,
        config,
        (update) => dispatch({ type: 'UPDATE_SITE_STARTER_MODULE', payload: update }),
      );
      dispatch({ type: 'SET_SITE_STARTER_RESULT', payload: result });
    } catch (err) {
      dispatch({ type: 'SITE_STARTER_ERROR', payload: (err as Error).message });
    } finally {
      setLaunching(false);
    }
  }

  return (
    <motion.main
      className="min-h-screen flex flex-col items-center px-4 py-12"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-3xl flex flex-col gap-10">

        {/* Back button */}
        <button
          type="button"
          onClick={() => dispatch({ type: 'RESET' })}
          className="self-start flex items-center gap-1.5 text-sm font-medium transition-colors focus:outline-none"
          style={{ color: 'var(--color-muted)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Dashboard
        </button>

        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
            Launch a complete site backend
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Pick a template and we&apos;ll spin up all your APIs in parallel — no waiting.
          </p>
        </div>

        {/* Error banner */}
        {state.siteStarterError && (
          <div
            className="rounded-xl border px-4 py-3 text-sm"
            style={{ background: 'oklch(0.40 0.18 25 / 0.10)', borderColor: 'oklch(0.55 0.20 25 / 0.30)', color: 'var(--color-error)' }}
          >
            {state.siteStarterError}
          </div>
        )}

        {/* Template grid */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Choose a template
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TEMPLATES.map((tpl) => {
              const active = selectedTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className="text-left p-4 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{
                    background:   active ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
                    borderColor:  active ? 'var(--color-accent)'        : 'var(--color-border)',
                    boxShadow:    active ? '0 0 0 1px var(--color-accent)' : undefined,
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <span style={{ color: active ? 'var(--color-accent)' : 'var(--color-muted)' }}>
                      {tpl.icon}
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: active ? 'var(--color-accent)' : 'var(--color-text)' }}
                    >
                      {tpl.label}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--color-muted)' }}>
                    {tpl.description}
                  </p>
                  <p className="text-[11px] font-mono" style={{ color: active ? 'var(--color-accent)' : 'var(--color-muted)' }}>
                    {tpl.modules}
                  </p>
                </button>
              );
            })}
          </div>
        </div>


        {/* What gets created info box */}
        {selectedTemplate && (
          <motion.div
            className="rounded-xl border p-4 flex flex-col gap-2"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
              What gets created
            </p>
            {TEMPLATES.find((t) => t.id === selectedTemplate)?.modules.split(' · ').map((mod) => (
              <div key={mod} className="flex items-center gap-2">
                <span
                  className="shrink-0 w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--color-accent)' }}
                />
                <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                  {state.selectedProject ? `${state.selectedProject.projectName} ${mod}` : mod}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Launch button */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleLaunch}
            disabled={!canLaunch}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
          >
            {launching ? 'Launching…' : 'Launch Site Kit'}
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET' })}
            className="px-5 py-3 rounded-xl border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.main>
  );
}
