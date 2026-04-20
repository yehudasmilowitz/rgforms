'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '@/context/AppContext';
import { createSite, SITE_PROVISION_STEPS } from '@/lib/createSite';
import type { CreateSiteInput } from '@/lib/createSite';
import type { ProjectTemplate, SiteStarterModuleProgress } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProposedTab {
  name: string;
  label: string;
  moduleType: string;
  nameSuffix: string;
  description: string;
  enabled: boolean;
}

type FlowStep =
  | 'choose'
  | 'describe'
  | 'generating'
  | 'clarify'
  | 'review'
  | 'templates'
  | 'error';

// ─── Template data ────────────────────────────────────────────────────────────

interface TemplateCard {
  id: ProjectTemplate;
  label: string;
  description: string;
  modules: string;
}

const TEMPLATES: TemplateCard[] = [
  { id: 'portfolio',  label: 'Portfolio',          description: 'Showcase your work with a gallery, project list, and contact form',          modules: 'Config · Gallery · Projects · Contact Form' },
  { id: 'restaurant', label: 'Restaurant',          description: 'Menu, photo gallery, event calendar, and reservation form',                  modules: 'Config · Menu · Photos · Events · Reservations' },
  { id: 'saas',       label: 'SaaS / Landing',      description: 'Testimonials, FAQ, waitlist signup, and contact form for product launches',  modules: 'Config · Testimonials · FAQ · Waitlist · Contact' },
  { id: 'nonprofit',  label: 'Non-profit / Church', description: 'Blog, event calendar, photo gallery, and volunteer signup form',            modules: 'Config · Blog · Events · Gallery · Volunteer' },
  { id: 'agency',     label: 'Agency',              description: 'Services, case studies, work gallery, and inquiry form for agencies',        modules: 'Config · Services · Case Studies · Work · Inquiry' },
];

const TEMPLATE_TABS: Record<ProjectTemplate, CreateSiteInput['tabs']> = {
  portfolio: [
    { name: 'config',   label: 'Site Config', moduleType: 'siteconfig', nameSuffix: 'Config' },
    { name: 'gallery',  label: 'Gallery',     moduleType: 'gallery',    nameSuffix: 'Gallery' },
    { name: 'projects', label: 'Projects',    moduleType: 'content',    nameSuffix: 'Projects' },
    { name: 'contact',  label: 'Contact',     moduleType: 'form',       nameSuffix: 'Contact Form' },
  ],
  restaurant: [
    { name: 'config',       label: 'Site Config',  moduleType: 'siteconfig', nameSuffix: 'Config' },
    { name: 'menu',         label: 'Menu',         moduleType: 'menu',       nameSuffix: 'Menu' },
    { name: 'gallery',      label: 'Photos',       moduleType: 'gallery',    nameSuffix: 'Photos' },
    { name: 'events',       label: 'Events',       moduleType: 'calendar',   nameSuffix: 'Events' },
    { name: 'reservations', label: 'Reservations', moduleType: 'form',       nameSuffix: 'Reservations' },
  ],
  saas: [
    { name: 'config',      label: 'Site Config',  moduleType: 'siteconfig',  nameSuffix: 'Config' },
    { name: 'testimonials',label: 'Testimonials', moduleType: 'testimonial', nameSuffix: 'Testimonials' },
    { name: 'faq',         label: 'FAQ',          moduleType: 'faq',         nameSuffix: 'FAQ' },
    { name: 'waitlist',    label: 'Waitlist',     moduleType: 'newsletter',  nameSuffix: 'Waitlist' },
    { name: 'contact',     label: 'Contact',      moduleType: 'form',        nameSuffix: 'Contact' },
  ],
  nonprofit: [
    { name: 'config',  label: 'Site Config', moduleType: 'siteconfig', nameSuffix: 'Config' },
    { name: 'blog',    label: 'Blog',        moduleType: 'content',    nameSuffix: 'Blog' },
    { name: 'events',  label: 'Events',      moduleType: 'calendar',   nameSuffix: 'Events' },
    { name: 'gallery', label: 'Gallery',     moduleType: 'gallery',    nameSuffix: 'Gallery' },
    { name: 'volunteer',label: 'Volunteer',  moduleType: 'form',       nameSuffix: 'Volunteer' },
  ],
  agency: [
    { name: 'config',       label: 'Site Config',  moduleType: 'siteconfig', nameSuffix: 'Config' },
    { name: 'services',     label: 'Services',     moduleType: 'content',    nameSuffix: 'Services' },
    { name: 'casestudies',  label: 'Case Studies', moduleType: 'content',    nameSuffix: 'Case Studies' },
    { name: 'work',         label: 'Work',         moduleType: 'gallery',    nameSuffix: 'Work' },
    { name: 'inquiry',      label: 'Inquiry',      moduleType: 'form',       nameSuffix: 'Inquiry' },
  ],
};

// ─── Color helpers ────────────────────────────────────────────────────────────

const MODULE_COLORS: Record<string, string> = {
  siteconfig:  'oklch(0.65 0.22 285)',
  content:     'oklch(0.60 0.20 240)',
  testimonial: 'oklch(0.72 0.18 145)',
  gallery:     'oklch(0.73 0.10 75)',
  form:        'oklch(0.73 0.17 65)',
  calendar:    'oklch(0.67 0.18 200)',
  faq:         'oklch(0.65 0.15 30)',
  newsletter:  'oklch(0.63 0.24 295)',
  menu:        'oklch(0.70 0.15 100)',
};

function colorFor(moduleType: string) {
  return MODULE_COLORS[moduleType] ?? 'var(--color-muted)';
}

function alpha(color: string, a: number) {
  return color.replace(')', ` / ${a})`);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BackButton({ label, onClick }: { label?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start flex items-center gap-1.5 text-sm font-medium transition-colors focus:outline-none"
      style={{ color: 'var(--color-muted)' }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)'; }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label ?? 'Back'}
    </button>
  );
}

function TabCard({ tab, onToggle }: { tab: ProposedTab; onToggle: () => void }) {
  const color  = colorFor(tab.moduleType);
  const locked = tab.moduleType === 'siteconfig';

  return (
    <button
      type="button"
      onClick={locked ? undefined : onToggle}
      disabled={locked}
      className="text-left w-full rounded-xl p-4 flex items-start gap-4 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      style={{
        background: tab.enabled ? 'var(--color-surface)' : 'var(--color-surface-2)',
        border:     `1px solid ${tab.enabled ? 'var(--color-border)' : 'transparent'}`,
        opacity:    tab.enabled ? 1 : 0.45,
        cursor:     locked ? 'default' : 'pointer',
      }}
    >
      <div
        className="shrink-0 mt-0.5 w-10 h-5 rounded-full relative transition-colors"
        style={{ background: tab.enabled ? color : 'var(--color-border)' }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
          style={{ left: tab.enabled ? 'calc(100% - 1.1rem)' : '0.125rem' }}
        />
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{tab.label}</p>
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
            style={{ color, background: alpha(color, 0.10), border: `1px solid ${alpha(color, 0.28)}` }}
          >
            {tab.moduleType}
          </span>
          {locked && <span className="text-[10px]" style={{ color: 'var(--color-subtle)' }}>required</span>}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{tab.description}</p>
      </div>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SiteStarter() {
  const { state, dispatch } = useApp();

  const [step, setStep]                   = useState<FlowStep>('choose');
  const [description, setDescription]    = useState('');
  const [clarifyQuestion, setClarifyQuestion] = useState('');
  const [clarification, setClarification] = useState('');
  const [tabs, setTabs]                   = useState<ProposedTab[]>([]);
  const [errorMsg, setErrorMsg]           = useState('');
  const [launching, setLaunching]         = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

  const siteName    = state.selectedProject?.projectName ?? '';
  const enabledTabs = tabs.filter((t) => t.enabled);

  // ── AI flow: propose manifest ──────────────────────────────────────────────

  async function callPropose(extra?: { clarification: string }) {
    setStep('generating');
    setErrorMsg('');

    try {
      const res  = await fetch('/api/propose-manifest', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          description:   description.trim(),
          siteName,
          clarification: extra?.clarification ?? undefined,
        }),
      });

      const data = (await res.json()) as {
        tabs?:     Omit<ProposedTab, 'enabled'>[];
        question?: string;
        error?:    string;
      };

      if (!res.ok || data.error) {
        setErrorMsg(data.error ?? 'Failed to generate structure — please try again.');
        setStep('error');
        return;
      }

      if (data.question) {
        setClarifyQuestion(data.question);
        setClarification('');
        setStep('clarify');
        return;
      }

      setTabs((data.tabs ?? []).map((t) => ({ ...t, enabled: true })));
      setStep('review');
    } catch {
      setErrorMsg('Network error — please check your connection and try again.');
      setStep('error');
    }
  }

  // ── Launch (both paths) ────────────────────────────────────────────────────

  async function handleLaunch(inputTabs: CreateSiteInput['tabs']) {
    if (!state.auth.accessToken) return;

    setLaunching(true);

    const initialProgress: SiteStarterModuleProgress[] = SITE_PROVISION_STEPS.map((s) => ({
      moduleType: s.id,
      moduleName: s.label,
      status:     'pending' as const,
    }));

    dispatch({ type: 'START_SITE_STARTER_PROVISIONING', payload: initialProgress });

    try {
      const manifest = await createSite(
        state.auth.accessToken,
        {
          siteName,
          notifyEmail:   state.auth.user?.email ?? '',
          googleAccount: state.auth.user?.email ?? '',
          tabs:          inputTabs,
        },
        (step, status, error) => {
          const label = SITE_PROVISION_STEPS.find((s) => s.id === step)?.label ?? step;
          dispatch({
            type:    'UPDATE_SITE_STARTER_MODULE',
            payload: { moduleType: step, moduleName: label, status, error },
          });
        },
      );

      dispatch({ type: 'SET_SITE_MANIFEST', payload: manifest });
    } catch (err) {
      dispatch({ type: 'SITE_MANIFEST_ERROR', payload: (err as Error).message });
    } finally {
      setLaunching(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <motion.main
      className="min-h-screen flex flex-col items-center px-4 py-12"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-2xl flex flex-col gap-8">

        <BackButton
          label="Dashboard"
          onClick={() => dispatch({ type: 'RESET' })}
        />

        {/* Header */}
        <div className="flex flex-col gap-1.5">
          {siteName && (
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-subtle)' }}>
              {siteName}
            </p>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
            Set up your site backend
          </h1>
        </div>

        {state.siteManifestError && (
          <div className="rounded-xl border px-4 py-3 text-sm"
            style={{ background: 'oklch(0.40 0.18 25 / 0.10)', borderColor: 'oklch(0.55 0.20 25 / 0.30)', color: 'var(--color-error)' }}>
            {state.siteManifestError}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── Choose path ──────────────────────────────────────────── */}
          {step === 'choose' && (
            <motion.div key="choose" className="flex flex-col gap-4"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                Build a custom structure with AI, or start from a ready-made template.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* AI card */}
                <button
                  type="button"
                  onClick={() => setStep('describe')}
                  className="text-left p-5 rounded-xl border flex flex-col gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-accent)', boxShadow: '0 0 0 1px var(--color-accent)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✦</span>
                    <p className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>AI — Custom</p>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    Describe your business in a sentence. AI proposes the right tabs and columns — tailored to your specific needs.
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-accent)' }}>
                    Recommended →
                  </p>
                </button>

                {/* Template card */}
                <button
                  type="button"
                  onClick={() => setStep('templates')}
                  className="text-left p-5 rounded-xl border flex flex-col gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">▦</span>
                    <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Templates</p>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    Pick from 5 pre-built structures: Portfolio, Restaurant, SaaS, Non-profit, or Agency.
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
                    5 templates →
                  </p>
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Describe ─────────────────────────────────────────────── */}
          {step === 'describe' && (
            <motion.div key="describe" className="flex flex-col gap-6"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <BackButton onClick={() => setStep('choose')} />
              <div className="flex flex-col gap-2">
                <label htmlFor="biz-desc" className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  What does your business do?
                </label>
                <textarea
                  id="biz-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="e.g. I run a kosher catering company in Monsey. We do weddings, bar mitzvahs, and corporate events. We have a menu and photos from past events."
                  className="w-full rounded-xl px-4 py-3 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
                <p className="text-xs" style={{ color: 'var(--color-subtle)' }}>
                  Be specific — mention your services, what you sell, and who your customers are.
                </p>
              </div>
              <button
                type="button"
                onClick={() => callPropose()}
                disabled={description.trim().length < 10}
                className="py-3 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                Generate Structure →
              </button>
            </motion.div>
          )}

          {/* ── Generating ───────────────────────────────────────────── */}
          {step === 'generating' && (
            <motion.div key="generating" className="flex flex-col items-center gap-4 py-16"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="w-8 h-8 rounded-full border-2 animate-spin"
                style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                Proposing structure for <span style={{ color: 'var(--color-text)' }}>{siteName}</span>…
              </p>
            </motion.div>
          )}

          {/* ── Clarify ──────────────────────────────────────────────── */}
          {step === 'clarify' && (
            <motion.div key="clarify" className="flex flex-col gap-6"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <BackButton onClick={() => setStep('describe')} />
              <div className="rounded-xl p-4 flex flex-col gap-2"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderLeft: '3px solid var(--color-accent)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>
                  One question
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                  {clarifyQuestion}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <textarea
                  value={clarification}
                  onChange={(e) => setClarification(e.target.value)}
                  rows={2}
                  placeholder="Your answer…"
                  className="w-full rounded-xl px-4 py-3 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>
              <button
                type="button"
                onClick={() => callPropose({ clarification })}
                disabled={clarification.trim().length < 2}
                className="py-3 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                Continue →
              </button>
            </motion.div>
          )}

          {/* ── Error ────────────────────────────────────────────────── */}
          {step === 'error' && (
            <motion.div key="error" className="flex flex-col gap-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="rounded-xl border px-4 py-3 text-sm"
                style={{ background: 'oklch(0.40 0.18 25 / 0.10)', borderColor: 'oklch(0.55 0.20 25 / 0.30)', color: 'var(--color-error)' }}>
                {errorMsg}
              </div>
              <button type="button" onClick={() => setStep('describe')}
                className="self-start text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
                ← Try again
              </button>
            </motion.div>
          )}

          {/* ── Review (AI result) ───────────────────────────────────── */}
          {step === 'review' && (
            <motion.div key="review" className="flex flex-col gap-6"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Proposed structure</p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    Toggle off any modules you don&apos;t need.
                  </p>
                </div>
                <button type="button" onClick={() => setStep('describe')}
                  className="text-xs font-medium shrink-0" style={{ color: 'var(--color-muted)' }}>
                  ← Redesign
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {tabs.map((tab) => (
                  <TabCard
                    key={tab.name}
                    tab={tab}
                    onToggle={() =>
                      setTabs((prev) => prev.map((t) => t.name === tab.name ? { ...t, enabled: !t.enabled } : t))
                    }
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleLaunch(enabledTabs.map((t) => ({
                  name:       t.name,
                  label:      t.label,
                  moduleType: t.moduleType,
                  nameSuffix: t.nameSuffix,
                })))}
                disabled={enabledTabs.length === 0 || launching}
                className="py-3 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                {launching
                  ? 'Provisioning…'
                  : `Provision ${enabledTabs.length} tab${enabledTabs.length !== 1 ? 's' : ''} →`}
              </button>
            </motion.div>
          )}

          {/* ── Templates ────────────────────────────────────────────── */}
          {step === 'templates' && (
            <motion.div key="templates" className="flex flex-col gap-6"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <BackButton onClick={() => setStep('choose')} />

              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Choose a template</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TEMPLATES.map((tpl) => {
                    const active = selectedTemplate === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setSelectedTemplate(tpl.id)}
                        className="text-left p-4 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        style={{
                          background:  active ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
                          borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                          boxShadow:   active ? '0 0 0 1px var(--color-accent)' : undefined,
                        }}
                      >
                        <p className="text-sm font-semibold mb-1"
                          style={{ color: active ? 'var(--color-accent)' : 'var(--color-text)' }}>
                          {tpl.label}
                        </p>
                        <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--color-muted)' }}>
                          {tpl.description}
                        </p>
                        <p className="text-[11px] font-mono"
                          style={{ color: active ? 'var(--color-accent)' : 'var(--color-muted)' }}>
                          {tpl.modules}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedTemplate && (
                <motion.div
                  className="rounded-xl border p-4 flex flex-col gap-2"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                    What gets created
                  </p>
                  {TEMPLATE_TABS[selectedTemplate].map((tab) => (
                    <div key={tab.name} className="flex items-center gap-2">
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
                      <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                        {tab.label}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        ({tab.moduleType})
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}

              <button
                type="button"
                onClick={() => selectedTemplate && handleLaunch(TEMPLATE_TABS[selectedTemplate])}
                disabled={!selectedTemplate || launching}
                className="py-3 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                {launching ? 'Provisioning…' : 'Provision Site →'}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.main>
  );
}
