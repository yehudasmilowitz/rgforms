'use client';

import { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Comprehensive Business Plan
// A ground-up synthesis of all context including the frontend-dev-skill build
// system. Structured as a scrollable executive brief with sidebar navigation.
// ─────────────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'inventory', label: 'What you have' },
  { id: 'insight', label: 'The compound insight' },
  { id: 'models', label: 'Business models evaluated' },
  { id: 'path', label: 'The recommended path' },
  { id: 'economics', label: 'Unit economics' },
  { id: 'moat', label: 'Actual defensibility' },
  { id: 'distribution', label: 'Distribution (the real problem)' },
  { id: 'buildplan', label: 'What to build' },
  { id: 'gates', label: 'Decision gates' },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

// ─── Local design atoms ───────────────────────────────────────────────────────

const C = {
  accent: 'oklch(0.65 0.22 285)',
  accentA: (a: number) => `oklch(0.65 0.22 285 / ${a})`,
  amber: 'oklch(0.73 0.17 65)',
  amberA: (a: number) => `oklch(0.73 0.17 65 / ${a})`,
  green: 'oklch(0.72 0.18 145)',
  greenA: (a: number) => `oklch(0.72 0.18 145 / ${a})`,
  red: 'oklch(0.68 0.18 25)',
  redA: (a: number) => `oklch(0.68 0.18 25 / ${a})`,
  violet: 'oklch(0.63 0.24 295)',
  violetA: (a: number) => `oklch(0.63 0.24 295 / ${a})`,
};

function Tag({ children, type = 'default' }: { children: React.ReactNode; type?: 'insight' | 'warn' | 'gate' | 'data' | 'default' }) {
  const styles = {
    insight: { color: C.violet, bg: C.violetA(0.10), border: C.violetA(0.30) },
    warn: { color: C.amber, bg: C.amberA(0.10), border: C.amberA(0.30) },
    gate: { color: C.green, bg: C.greenA(0.10), border: C.greenA(0.30) },
    data: { color: C.accent, bg: C.accentA(0.10), border: C.accentA(0.30) },
    default: { color: 'var(--color-muted)', bg: 'var(--color-surface-2)', border: 'var(--color-border)' },
  }[type];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
      style={{ color: styles.color, background: styles.bg, border: `1px solid ${styles.border}` }}>
      {children}
    </span>
  );
}

function SectionHead({ id, tag, tagType, title, sub }: {
  id: string; tag: string; tagType: 'insight' | 'warn' | 'gate' | 'data' | 'default';
  title: string; sub: string;
}) {
  return (
    <div id={id} className="flex flex-col gap-2 pb-4" style={{ borderBottom: '1px solid var(--color-border)', scrollMarginTop: '5rem' }}>
      <Tag type={tagType}>{tag}</Tag>
      <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
        {title}
      </h2>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)', maxWidth: '70ch' }}>{sub}</p>
    </div>
  );
}

function Insight({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4 text-sm leading-relaxed"
      style={{ background: C.violetA(0.07), border: `1px solid ${C.violetA(0.30)}`, color: 'var(--color-muted)', borderLeft: `3px solid ${C.violet}` }}>
      {children}
    </div>
  );
}

function Warn({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4 text-sm leading-relaxed"
      style={{ background: C.amberA(0.07), border: `1px solid ${C.amberA(0.30)}`, color: 'var(--color-muted)', borderLeft: `3px solid ${C.amber}` }}>
      {children}
    </div>
  );
}

function Gate({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider"
        style={{ background: C.greenA(0.12), borderBottom: `1px solid ${C.greenA(0.3)}`, color: C.green }}>
        Gate: {title}
      </div>
      <div className="px-4 py-3 text-sm leading-relaxed"
        style={{ background: C.greenA(0.05), border: `1px solid ${C.greenA(0.25)}`, borderTop: 'none', color: 'var(--color-muted)' }}>
        {children}
      </div>
    </div>
  );
}

function Card({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-3"
      style={{
        background: accent ? C.accentA(0.05) : 'var(--color-surface)',
        border: `1px solid ${accent ? C.accentA(0.30) : 'var(--color-border)'}`,
      }}>
      {children}
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-subtle)' }}>{children}</p>;
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{children}</p>;
}

function CardBody({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{children}</p>;
}

function Bullets({ items, color }: { items: string[]; color?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
          <span className="shrink-0 mt-0.5 font-bold" style={{ color: color ?? C.accent }}>›</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function Strikes({ items }: { items: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
          <span className="shrink-0 mt-0.5 font-bold" style={{ color: C.red }}>✕</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function Table({ headers, rows, highlightLast }: { headers: string[]; rows: string[][]; highlightLast?: boolean }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
      <div className="grid px-4 py-2 text-[10px] font-bold uppercase tracking-wider"
        style={{ gridTemplateColumns: `repeat(${headers.length}, 1fr)`, background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}>
        {headers.map((h) => <span key={h}>{h}</span>)}
      </div>
      {rows.map((row, i) => (
        <div key={i} className="grid px-4 py-2.5 text-xs"
          style={{ gridTemplateColumns: `repeat(${headers.length}, 1fr)`, borderBottom: i < rows.length - 1 ? '1px solid var(--color-border)' : 'none', background: i % 2 === 0 ? 'var(--color-surface)' : 'transparent' }}>
          {row.map((cell, ci) => (
            <span key={ci} style={{
              color: ci === 0 ? 'var(--color-text)' : highlightLast && ci === row.length - 1 ? C.green : 'var(--color-muted)',
              fontWeight: ci === 0 ? 600 : 400,
            }}>
              {cell}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="rounded-lg p-3 text-xs font-mono leading-loose overflow-x-auto whitespace-pre"
      style={{ background: 'oklch(0.09 0.01 285)', color: 'oklch(0.80 0.04 285)', border: `1px solid ${C.accentA(0.15)}` }}>
      {children}
    </pre>
  );
}

function StageHeader({ n, title, period, focus }: { n: number; title: string; period: string; focus: string }) {
  const colors = [C.amber, C.accent, C.violet, C.green];
  const c = colors[(n - 1) % colors.length];
  const alphaFn = [C.amberA, C.accentA, C.violetA, C.greenA][(n - 1) % 4];
  return (
    <div className="rounded-xl overflow-hidden">
      <div className="flex items-center gap-4 px-5 py-4"
        style={{ background: alphaFn(0.10), borderBottom: `1px solid ${alphaFn(0.25)}`, border: `1px solid ${alphaFn(0.25)}`, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
        <div className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold shrink-0"
          style={{ background: c, color: 'oklch(0.1 0 0)', fontFamily: 'var(--font-display)' }}>
          {n}
        </div>
        <div className="flex-1">
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{title}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs font-mono" style={{ color: 'var(--color-muted)' }}>{period}</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-semibold"
              style={{ color: c, background: alphaFn(0.15), border: `1px solid ${alphaFn(0.3)}` }}>
              {focus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Inventory
// ─────────────────────────────────────────────────────────────────────────────

function InventorySection() {
  return (
    <section className="flex flex-col gap-6">
      <SectionHead
        id="inventory"
        tag="Foundation"
        tagType="data"
        title="What you have actually built"
        sub="Before planning the next twelve months, an honest accounting of what exists versus what's been discussed. These are different things."
      />

      <Insight>
        <span className="font-semibold" style={{ color: C.violet }}>The trap most founders fall into: </span>
        planning against an idealized version of what they&apos;ve built rather than the actual thing.
        Three working pieces of this stack exist. The rest are designs. Being precise about the distinction
        changes every decision downstream.
      </Insight>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* What actually exists */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.green }}>What exists and works</p>
          {[
            {
              name: 'sheetspin provisioning',
              detail: 'Creates a Google Sheet + deploys an Apps Script web app in ~90 seconds using the user\'s OAuth token. The script handles doPost (form submissions) and doGet (JSON data API). Shipped.',
            },
            {
              name: 'The build skill (frontend-dev-skill)',
              detail: 'A multi-agent system: Design, Builder, Content, SEO, Animator, QA agents run in parallel from a design brief to produce a complete production Vite + React + Tailwind v4 site. Working code.',
            },
            {
              name: 'A live customer site',
              detail: 'A real estate wholesaler\'s site was built. Real sheetspin endpoints, real data schema (RGContent, RGGallery), real contact form. This is the closest thing to a validated product you have.',
            },
            {
              name: 'Apps Script as JSON API',
              detail: 'The doGet endpoint returns JSON from Sheet rows. The build skill already integrates against it. Five real endpoint URLs exist for a live site. The data contract is proven.',
            },
          ].map(({ name, detail }) => (
            <div key={name} className="rounded-lg p-3 flex flex-col gap-1"
              style={{ background: C.greenA(0.05), border: `1px solid ${C.greenA(0.20)}` }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{name}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{detail}</p>
            </div>
          ))}
        </div>

        {/* What doesn't exist yet */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.amber }}>What is designed but not built</p>
          {[
            {
              name: 'Gateway / paid tier',
              detail: 'No proxy layer exists. No short URLs. No Stripe billing. No Firestore user metadata. No rate limiting. The gateway architecture is well-designed but is entirely on paper.',
            },
            {
              name: 'Consumer site builder UI',
              detail: 'No UI for non-technical users to provision a site. No module picker. No style chooser. No dashboard. The build skill runs from a CLI, not a form a wholesaler fills out.',
            },
            {
              name: 'Distribution',
              detail: 'No paying customers from strangers. One customer from a personal contact. No organic traffic. No SEO presence. No community positioning. No brand presence outside the developer audience.',
            },
            {
              name: 'Validated pricing',
              detail: 'No one has paid $12/mo, $299, or any other amount. Every price in the business plan is a hypothesis. The wholesaler site was built free (presumably). Nothing is validated.',
            },
          ].map(({ name, detail }) => (
            <div key={name} className="rounded-lg p-3 flex flex-col gap-1"
              style={{ background: C.amberA(0.05), border: `1px solid ${C.amberA(0.20)}` }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{name}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{detail}</p>
            </div>
          ))}
        </div>
      </div>

      <Warn>
        <span className="font-semibold" style={{ color: C.amber }}>The honest diagnosis: </span>
        You have excellent infrastructure (sheetspin provisioning + the build skill) and one unvalidated customer.
        The infrastructure is genuinely impressive — the build skill generating a production agency site from a brief
        is not something most teams have. But infrastructure without a sales motion and distribution is a project, not a business.
        Everything in this plan is about closing that gap.
      </Warn>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: The Compound Insight
// ─────────────────────────────────────────────────────────────────────────────

function InsightSection() {
  return (
    <section className="flex flex-col gap-6">
      <SectionHead
        id="insight"
        tag="The key insight"
        tagType="insight"
        title="Three pieces that change everything together"
        sub="Individually, each piece is a tool. Together, they are a complete vertical site factory — something no competitor has. The business model question is how to extract the most value from that combination."
      />

      <div className="flex flex-col gap-3">
        <Code>{`The stack you've built:

  sheetspin                    → Apps Script + Sheets provisioned in 90s
  + build skill              → complete production site from a design brief in ~45 min
  + vertical knowledge       → real estate intake forms, specific field names,
                               how a wholesaler thinks about leads

  Together:
  → A new real estate wholesaler website in <2 hours, production quality,
    hosted anywhere, data owned by them in their Google account, $12/mo forever
  → Repeatable across any vertical with a design brief + vertical-specific forms
  → Buildable without hiring: the skill replaces a designer, developer, and copywriter

Competitor comparison:
  Carrot.com:         30-minute setup, $49-149/mo, their data
  Agency (freelance): 4-8 week build, $3,000-15,000 one-time, no ongoing support
  Durable.co:         2-minute AI build, $15/mo, generic forms, their data
  You (with skill):   <2 hour build, $12/mo, specific vertical forms, their data`}
        </Code>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            label: 'Speed vs. freelancer',
            value: '40×',
            detail: 'A freelancer takes 40+ hours. The skill takes 1-2. Same quality output or better.',
          },
          {
            label: 'Price vs. Carrot.com',
            value: '4–12×',
            detail: '$12/mo vs. $49-149/mo. Identical outcome: motivated seller leads in a spreadsheet.',
          },
          {
            label: 'Data ownership',
            value: 'Only one',
            detail: 'No competitor routes data through the user\'s own Google account. This is the actual moat.',
          },
        ].map(({ label, value, detail }) => (
          <div key={label} className="rounded-xl p-4 flex flex-col gap-2"
            style={{ background: C.violetA(0.07), border: `1px solid ${C.violetA(0.25)}` }}>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.violet }}>{label}</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{value}</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{detail}</p>
          </div>
        ))}
      </div>

      <Insight>
        <span className="font-semibold" style={{ color: C.violet }}>What this changes about the sequencing: </span>
        The original three-plan model (A → B → C) assumed Plan C was far away because &ldquo;AI provisioning&rdquo;
        needed to be built. It&apos;s already built — the build skill IS the AI provisioning system, just running
        via CLI instead of a web UI. The gap between where you are and a &ldquo;consumer platform&rdquo; is much smaller
        than the original 40-50 week estimate, if you build on top of the skill rather than rebuilding from scratch.
        The question isn&apos;t when to build AI provisioning — it&apos;s when to put a UI around what already exists.
      </Insight>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Business Models Evaluated
// ─────────────────────────────────────────────────────────────────────────────

function ModelsSection() {
  return (
    <section className="flex flex-col gap-6">
      <SectionHead
        id="models"
        tag="Options"
        tagType="data"
        title="Four business models evaluated honestly"
        sub="Not three plans that feed into each other — four genuinely different businesses, evaluated against the same criteria: time to first dollar, founder-hour efficiency, ceiling, and what it requires you to be good at."
      />

      <div className="flex flex-col gap-4">

        {/* Model 1 */}
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardLabel>Model 1</CardLabel>
              <CardTitle>API Gateway — developer tool</CardTitle>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Tag type="data">Low risk</Tag>
              <span className="text-[10px]" style={{ color: 'var(--color-subtle)' }}>4–6 wk to revenue</span>
            </div>
          </div>
          <CardBody>
            Add a paid proxy layer on top of sheetspin. Short URLs, webhooks, submission inbox, server-side email.
            Customers are developers already using sheetspin. No new distribution needed.
          </CardBody>
          <Table
            headers={['Metric', 'Reality']}
            rows={[
              ['Time to first $', '4–6 weeks if shipping today'],
              ['Ceiling (realistic)', '$2–5K MRR — developer tools are small markets'],
              ['Founder-hr efficiency', 'Low — requires a full gateway build before any revenue'],
              ['Distribution', 'Same developer audience you already have'],
              ['What breaks this', 'Formspree and Basin already own this positioning. Low switching cost to them.'],
            ]}
          />
          <Warn>
            The honest problem with Model 1: you&apos;re building infrastructure for 6 weeks to serve the same
            audience you already have, for $9-59/mo per customer, with a $5K MRR ceiling. That&apos;s a
            sustainable side project, not the business the build skill enables. Worth building eventually —
            not worth being the first thing you build if you want to reach non-technical business owners.
          </Warn>
        </Card>

        {/* Model 2 */}
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardLabel>Model 2</CardLabel>
              <CardTitle>Done-for-you premium service — skill-enabled</CardTitle>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Tag type="gate">Recommended first</Tag>
              <span className="text-[10px]" style={{ color: 'var(--color-subtle)' }}>Revenue in days, not weeks</span>
            </div>
          </div>
          <CardBody>
            Build sites for non-technical business owners using the build skill. Charge $1,500-$3,000 per site
            (not $299 — the skill changes the pricing floor). Every site goes on $12/mo recurring.
          </CardBody>
          <Table
            headers={['Metric', 'Reality']}
            rows={[
              ['Time to first $', '1-2 weeks — sell before building anything new'],
              ['Build time per site', '45-90 min with the skill (vs. 8-16 hours from scratch)'],
              ['Revenue per hour', '$1,500 / 1.5hr = $1,000/hr effective rate'],
              ['Founder-hr efficiency', 'Highest of any model in stage 1'],
              ['Ceiling', '$15-30K/mo if you do 10-20 sites/month — not the plan long term'],
              ['What it gives you', '50 real sites, real customer data, validated vertical knowledge'],
            ]}
            highlightLast
          />
          <Insight>
            <span className="font-semibold" style={{ color: C.violet }}>The $299 pricing is wrong: </span>
            The original plan priced done-for-you at $299 because it assumed 2 hours of manual work.
            The build skill changes that to 45-90 minutes. More importantly, $299 is what you&apos;d charge
            for a template. A production-quality branded site with custom vertical-specific forms, working
            data pipeline, mobile-responsive, SEO-complete, deployed to their domain — that&apos;s $1,500-$3,000
            minimum. Your friend would have paid $2,000. The freelancer who would have done this charges $5,000-$15,000
            and takes 6 weeks. You should be priced between your own infrastructure cost and that freelancer.
          </Insight>
        </Card>

        {/* Model 3 */}
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardLabel>Model 3</CardLabel>
              <CardTitle>Agency licensing — B2B, skill + sheetspin</CardTitle>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Tag type="insight">Stage 2 opportunity</Tag>
              <span className="text-[10px]" style={{ color: 'var(--color-subtle)' }}>Build after 10 sites built</span>
            </div>
          </div>
          <CardBody>
            License the build skill + sheetspin backend to small agencies ($250-500/mo). They use it to
            deliver sites faster to their existing clients. Every site they build adds a $12/mo sheetspin customer.
            Agencies are the distribution channel you currently lack.
          </CardBody>
          <Table
            headers={['Metric', 'Reality']}
            rows={[
              ['Customer', 'Small web agencies (1-5 people), already have clients in target verticals'],
              ['Price point', '$299/mo license + $5/mo per live sheetspin site'],
              ['Distribution', 'Agencies find you — LinkedIn, agency communities, referrals from your sites'],
              ['LTV', '$299/mo × 12 = $3,588/yr + sheetspin recurring from their sites'],
              ['10 agencies, 5 sites avg', '$2,990/mo license + $600/mo sheetspin = $3,590/mo from 10 customers'],
              ['What they get', 'A production site builder they can resell. You\'ve done the hardest part.'],
            ]}
            highlightLast
          />
        </Card>

        {/* Model 4 */}
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardLabel>Model 4</CardLabel>
              <CardTitle>Consumer self-serve platform</CardTitle>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Tag type="warn">Build last</Tag>
              <span className="text-[10px]" style={{ color: 'var(--color-subtle)' }}>After Model 2 + 3 proven</span>
            </div>
          </div>
          <CardBody>
            The original &ldquo;Plan C&rdquo; — a web UI where non-technical users describe their business and
            get a live site. The build skill becomes the provisioning engine. The consumer platform becomes
            the UI wrapper around it.
          </CardBody>
          <Table
            headers={['Metric', 'Reality']}
            rows={[
              ['Gap from today', 'Need a UI, account system, billing, domain management — but the core engine exists'],
              ['Real build time', '12-18 weeks (not 40-50 — build skill reduces scope dramatically)'],
              ['Ceiling', 'Highest of all models — millions of businesses need websites'],
              ['Distribution problem', 'Unsolved. Durable has 200K users. You need a channel they don\'t own.'],
              ['Right time to build', 'After 50+ sites prove vertical demand and you have community presence'],
            ]}
          />
        </Card>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Recommended Path
// ─────────────────────────────────────────────────────────────────────────────

function PathSection() {
  return (
    <section className="flex flex-col gap-6">
      <SectionHead
        id="path"
        tag="Strategy"
        tagType="insight"
        title="The recommended path — four stages with clear exit criteria"
        sub="Not a roadmap. A sequence of evidence-gathering exercises, each one funding and informing the next. The only rule: don't start stage N+1 until stage N has answered its question."
      />

      <div className="flex flex-col gap-5">

        <div className="flex flex-col gap-3">
          <StageHeader n={1} title="Stage 1 — Sell before you build" period="Weeks 1-6" focus="First paying customer" />
          <div className="pl-4 flex flex-col gap-3" style={{ borderLeft: `2px solid ${C.amberA(0.30)}` }}>
            <Card>
              <CardTitle>The question this stage must answer</CardTitle>
              <CardBody>Will a stranger (not a friend) pay $1,500-$3,000 for a website built with the skill?</CardBody>
            </Card>
            <Bullets items={[
              'Do NOT build any new infrastructure. The skill + sheetspin + existing provisioning is enough to deliver.',
              'Post in BiggerPockets, local REI Facebook groups: the origin story — what you built your friend, what it cost, what it does.',
              'Price at $1,500 minimum. If it feels scary, you\'re pricing it right. $299 says "template." $1,500 says "agency alternative."',
              'Spend 0 hours on the gateway, 0 hours on consumer UI, 0 hours on Stripe. Sell first. Invoice via Venmo/PayPal/Stripe Checkout manually.',
              'First 5 customers: document every single thing they asked for that you didn\'t have. This is the product spec for Stage 3.',
            ]} color={C.amber} />
            <Gate title="Exit criteria for Stage 1">
              3 paying customers who found you from a post or referral (not from your personal network).
              You know what they asked for that you couldn&apos;t deliver. You have $4,500-$9,000 in revenue.
            </Gate>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <StageHeader n={2} title="Stage 2 — Prove the vertical" period="Months 2-5" focus="10 sites, 1 vertical" />
          <div className="pl-4 flex flex-col gap-3" style={{ borderLeft: `2px solid ${C.accentA(0.30)}` }}>
            <Card>
              <CardTitle>The question this stage must answer</CardTitle>
              <CardBody>Is the real estate vertical deep enough to sustain 10 sites/month via referral alone? Or is it a one-time niche?</CardBody>
            </Card>
            <Bullets items={[
              'Stay in one vertical. Real estate. Don\'t add local services or solo pros yet — that\'s scope growth masquerading as strategy.',
              'Build a portfolio page (one afternoon). Show the 3 sites you built. Real screenshots, real customer names with permission.',
              'Attend one local REIA meeting. Bring a laptop. Show the site live. The room will tell you the price in 5 minutes.',
              'NOW build the gateway (Plan A, Phase 1 only): Stripe + short URLs + billing enforcement. This unlocks the $12/mo recurring.',
              'Target: 10 done-for-you sites at $1,500-$3,000 + all 10 on $12/mo. That\'s $15-30K in setup fees + $120/mo MRR.',
              'Start identifying the 2-3 things every single customer asks for. These are the platform features.',
            ]} color={C.accent} />
            <Gate title="Exit criteria for Stage 2">
              10 paying sites, all on $12/mo. At least 2 came from referrals from other customers.
              You can articulate the 3 specific things they need that the skill doesn&apos;t yet produce automatically.
              The REIA presentation generated at least 5 inquiries.
            </Gate>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <StageHeader n={3} title="Stage 3 — B2B leverage" period="Months 5-10" focus="Agency licensing" />
          <div className="pl-4 flex flex-col gap-3" style={{ borderLeft: `2px solid ${C.violetA(0.30)}` }}>
            <Card>
              <CardTitle>The question this stage must answer</CardTitle>
              <CardBody>Will an agency pay $299-500/mo for the build skill + sheetspin backend so they can offer their own clients faster, cheaper sites?</CardBody>
            </Card>
            <Bullets items={[
              'Package the skill as a product: a zip file + documentation + video walkthrough. Not a SaaS — just a license.',
              'Target: 1-3 person agencies in real estate, legal, or local services. They already have clients. You give them a superpower.',
              'Price: $299/mo for skill access + $5/mo per live sheetspin site. Agency with 20 clients = $299 + $100 = $399/mo.',
              'Build the sheetspin agency dashboard (multi-project, multi-client). This is 4 weeks of real work.',
              'The agency model solves your distribution problem. Each agency brings 5-20 sites you didn\'t have to find.',
              'At 10 agencies × $399/mo average = $3,990/mo. Plus sheetspin recurring from all their client sites.',
            ]} color={C.violet} />
            <Gate title="Exit criteria for Stage 3">
              3 paying agencies, each with 5+ active client sites. At least one came from a referral.
              Monthly sheetspin recurring from agency sites &gt; direct client recurring.
              You have evidence of whether agencies need the consumer platform or would rather keep using the skill directly.
            </Gate>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <StageHeader n={4} title="Stage 4 — Consumer platform" period="Month 10+" focus="Self-serve at scale" />
          <div className="pl-4 flex flex-col gap-3" style={{ borderLeft: `2px solid ${C.greenA(0.30)}` }}>
            <Card>
              <CardTitle>The question this stage must answer</CardTitle>
              <CardBody>Do non-technical business owners want to self-serve the provisioning, or do they always want someone to do it for them?</CardBody>
            </Card>
            <Bullets items={[
              'The build skill becomes the backend. The consumer platform is a UI: describe your business → confirmation screen → live site.',
              'Build estimate (revised down from 40-50 weeks): 12-16 weeks. The skill replaces most of the AI provisioning work.',
              'The 50 done-for-you builds from Stages 1-2 are the training data for the AI prompt system. Don\'t skip those.',
              'This is where the brand decision matters: separate brand (sitecraft.app, gridsite.co) vs. sheetspin expansion.',
              'At this stage you have: proof of demand, 50+ live sites, 3+ agencies, community presence, case studies.',
              'ONLY build this if Stage 3 showed agencies hitting their limits and requesting self-serve for their end-clients.',
            ]} color={C.green} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Unit Economics
// ─────────────────────────────────────────────────────────────────────────────

function EconomicsSection() {
  return (
    <section className="flex flex-col gap-6">
      <SectionHead
        id="economics"
        tag="Numbers"
        tagType="data"
        title="Unit economics — modeled per stage"
        sub="Real numbers, not projections. Each table shows what the math looks like if the stage exit criteria are hit."
      />

      <div className="flex flex-col gap-5">

        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Tag type="warn">Stage 1–2</Tag>
            <CardTitle>Done-for-you service economics</CardTitle>
          </div>
          <Table
            headers={['Item', 'Conservative', 'Mid', 'Good']}
            rows={[
              ['Build time / site (skill)', '90 min', '60 min', '45 min'],
              ['Site fee', '$1,500', '$2,000', '$2,500'],
              ['Revenue / hour', '$1,000/hr', '$2,000/hr', '$3,333/hr'],
              ['Monthly recurring (per site)', '$11.97 net', '$11.97 net', '$11.97 net'],
              ['10 sites → setup revenue', '$15,000', '$20,000', '$25,000'],
              ['10 sites → monthly recurring', '$120/mo', '$120/mo', '$120/mo'],
              ['24-mo LTV per site', '$15,287', '$20,287', '$25,287'],
              ['Infra cost / site', '~$0.50/mo', '~$0.50/mo', '~$0.50/mo'],
            ]}
            highlightLast
          />
          <Insight>
            <span className="font-semibold" style={{ color: C.violet }}>Why $1,500 and not $299: </span>
            The skill compresses build time, not the value delivered. A real estate wholesaler getting a
            production-quality branded website, custom seller intake form, Google Sheet data pipeline, email
            notifications, and domain connection — that solves a $3,000-15,000 problem. The question is
            &ldquo;what would they pay a local agency?&rdquo; not &ldquo;what did it cost you to build?&rdquo;
          </Insight>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Tag type="insight">Stage 3</Tag>
            <CardTitle>Agency licensing economics</CardTitle>
          </div>
          <Table
            headers={['Metric', '5 agencies', '10 agencies', '20 agencies']}
            rows={[
              ['License fee / agency', '$299/mo', '$299/mo', '$299/mo'],
              ['Avg sites / agency', '8', '10', '12'],
              ['sheetspin / site', '$5/mo', '$5/mo', '$5/mo'],
              ['License revenue', '$1,495/mo', '$2,990/mo', '$5,980/mo'],
              ['sheetspin revenue', '$200/mo', '$500/mo', '$1,200/mo'],
              ['Total MRR', '$1,695/mo', '$3,490/mo', '$7,180/mo'],
              ['Infra cost', '~$40/mo', '~$75/mo', '~$150/mo'],
              ['Net margin', '~97.6%', '~97.9%', '~97.9%'],
            ]}
            highlightLast
          />
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Tag type="gate">Combined — end of Stage 3</Tag>
            <CardTitle>What month 10 looks like if all gates are hit</CardTitle>
          </div>
          <Table
            headers={['Revenue stream', 'Monthly amount', 'Source']}
            rows={[
              ['Done-for-you setup fees (5/mo)', '$10,000–15,000', 'Referrals from existing customers'],
              ['Direct sheetspin recurring (25 sites)', '$300/mo', '$12/mo × 25 direct clients'],
              ['Agency licensing (5 agencies)', '$1,495/mo', '$299/mo × 5 agencies'],
              ['Agency sheetspin (5 × 10 sites)', '$250/mo', '$5/mo × 50 agency sites'],
              ['Total MRR (recurring only)', '$2,045/mo', 'Growing monthly without new sales'],
              ['Total revenue (incl. setup fees)', '$12,000–17,000/mo', 'Target for month 10'],
              ['Infra cost', '~$80/mo', 'Firebase + Firestore + sheetspin compute'],
            ]}
            highlightLast
          />
          <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--color-subtle)' }}>
            These numbers require hitting every stage gate in sequence. If Stage 1 fails (no stranger pays),
            these numbers are fictional. If Stage 2 stalls at 3 sites, the referral engine never starts.
            The plan is plausible — not guaranteed.
          </p>
        </Card>

      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Moat
// ─────────────────────────────────────────────────────────────────────────────

function MoatSection() {
  return (
    <section className="flex flex-col gap-6">
      <SectionHead
        id="moat"
        tag="Defensibility"
        tagType="insight"
        title="What is actually defensible here"
        sub="Claimed moats versus real moats. Being precise about this prevents building the wrong things and making the wrong marketing claims."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.green }}>Real advantages (hard to replicate)</p>
          {[
            {
              claim: 'Data ownership architecture',
              why: 'The free tier routes data through the user\'s own Google account — never through your servers. Competitors cannot make this claim without rebuilding from scratch. This is 2-3 years of trust asymmetry for any newcomer to overcome.',
            },
            {
              claim: 'The build skill quality',
              why: 'Specialized agents (Design, Builder, Content, SEO, QA, Animator) in parallel produces a level of site quality that a single LLM call cannot match. The skill is the result of iteration. A competitor can copy the idea but not the current output quality overnight.',
            },
            {
              claim: 'Vertical-specific form knowledge',
              why: 'You know the exact fields a real estate wholesaler needs: address, beds/baths, condition, asking price, timeline, mortgage balance, motivation. Generic AI builders don\'t. This knowledge accumulates with every customer and is hard to replicate without the customers.',
            },
            {
              claim: 'Google platform trust',
              why: 'The Apps Script + Sheets stack runs on Google infrastructure. Most small business owners already trust Google with their data. "Your leads go straight to your Google Sheet, never to us" is a statement that converts skeptics.',
            },
          ].map(({ claim, why }) => (
            <div key={claim} className="rounded-lg p-3 flex flex-col gap-1"
              style={{ background: C.greenA(0.05), border: `1px solid ${C.greenA(0.20)}` }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{claim}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{why}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.red }}>Claimed moats that aren&apos;t real yet</p>
          {[
            {
              claim: 'AI provisioning quality',
              why: 'Not a moat until users are self-serving and generating high-quality output consistently. Right now it\'s a CLI tool that requires expert oversight. The moat requires the UI, the UX, and the feedback loop with real users.',
            },
            {
              claim: 'Community presence',
              why: 'You have zero posts in BiggerPockets, zero presence in REI Facebook groups, no content, no testimonials. Community moats are built, not assumed. You haven\'t started building this.',
            },
            {
              claim: 'Price',
              why: '$12/mo is a great price — but price is not a moat. A competitor can always price lower. The moat is the specific forms, the data ownership story, and the trust asymmetry. Lead with those.',
            },
            {
              claim: 'Next.js export',
              why: 'A feature, not a moat. Non-technical users (your Stage 1-2 customers) don\'t care about this. It becomes a meaningful advantage only when you have technical users at Stage 4. Don\'t market it to real estate wholesalers.',
            },
          ].map(({ claim, why }) => (
            <div key={claim} className="rounded-lg p-3 flex flex-col gap-1"
              style={{ background: C.redA(0.05), border: `1px solid ${C.redA(0.20)}` }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{claim}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{why}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Distribution
// ─────────────────────────────────────────────────────────────────────────────

function DistributionSection() {
  return (
    <section className="flex flex-col gap-6">
      <SectionHead
        id="distribution"
        tag="The hardest problem"
        tagType="warn"
        title="Distribution — the only thing that actually matters right now"
        sub="Every plan in this document fails if you can't answer this question: how does the next real estate wholesaler who doesn't know you find you? This section is entirely about that."
      />

      <Warn>
        <span className="font-semibold" style={{ color: C.amber }}>The honest situation: </span>
        Your friend found you because he knows you. He would not have found you through Google, BiggerPockets,
        Instagram, or LinkedIn. He is not representative of your potential customer base — he&apos;s a sample of
        one from the wrong channel. The business plan only works if a stranger can find you.
        Every tactic below is concrete and actionable in the next 30 days. None of them are &ldquo;build SEO.&rdquo;
      </Warn>

      <div className="flex flex-col gap-3">
        {[
          {
            channel: 'BiggerPockets forum posts',
            timeline: 'This week',
            cost: 'Free',
            how: 'Write: "I built my friend\'s wholesale website — here\'s what it cost him, here\'s how it works, happy to do it for 5 people for free to build case studies." Include a screenshot of the live site. Do NOT pitch — tell the story. BiggerPockets has 2M+ members actively looking for tools.',
            effort: 'High signal',
          },
          {
            channel: 'Local REIA meeting',
            timeline: 'This month',
            cost: 'Free (most are)',
            how: 'Google "[your city] real estate investors association." Show up. Bring a laptop. Demo the site you built. Offer to build one live in the room (setup takes 90 seconds for provisioning + 45 min for the skill). This is the highest-conversion channel for this vertical.',
            effort: 'High effort, high conversion',
          },
          {
            channel: 'REI Facebook Groups',
            timeline: 'This week',
            cost: 'Free',
            how: 'Join 5-10 groups (Wholesale Real Estate Investors, Motivated Seller Leads, your city). Post the origin story — not an ad, a story. "Built my friend a website last week, took 90 minutes, he\'s getting leads already — happy to do 3 more for free to test it."',
            effort: 'Medium effort, unknown conversion',
          },
          {
            channel: 'Your friend as a case study',
            timeline: 'Now',
            cost: 'Free',
            how: 'Ask your friend to post in his REIA group or Facebook group: "A friend built me this site, I\'ve already gotten 2 leads, cost me $12/mo." His testimonial is worth more than any ad. Real estate investors follow each other obsessively.',
            effort: 'Low effort, high credibility',
          },
          {
            channel: 'Targeted Instagram/Facebook ads',
            timeline: 'Month 2, after 3 paying customers',
            cost: '$10-20/day',
            how: 'Target: "real estate investor," "wholesale real estate," your metro area. Copy: "Motivated seller website for $12/mo. Your leads go straight to your Google Sheet." Show the actual site. Show the actual form. Show the email they get when a lead submits. Do not run ads before you have 3 paying customers and a validated price.',
            effort: 'Paid, scalable once validated',
          },
        ].map(({ channel, timeline, cost, how, effort }) => (
          <Card key={channel}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <CardTitle>{channel}</CardTitle>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] px-2 py-0.5 rounded"
                  style={{ color: C.amber, background: C.amberA(0.10), border: `1px solid ${C.amberA(0.25)}` }}>
                  {timeline}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded"
                  style={{ color: 'var(--color-subtle)', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                  {cost}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded"
                  style={{ color: C.green, background: C.greenA(0.10), border: `1px solid ${C.greenA(0.25)}` }}>
                  {effort}
                </span>
              </div>
            </div>
            <CardBody>{how}</CardBody>
          </Card>
        ))}
      </div>

      <Insight>
        <span className="font-semibold" style={{ color: C.violet }}>What you should NOT do for distribution: </span>
        Product Hunt, Hacker News Show HN, Twitter/X posts, dev.to articles, GitHub README traffic.
        These reach developers. Developers are your Plan A (gateway) customer, not your Plan B (done-for-you) customer.
        Your wholesaler doesn&apos;t read Hacker News. Mixing channels will confuse both audiences and produce
        mediocre results in both. Pick one customer, one channel per stage. Right now: real estate investors, REIA + BiggerPockets.
      </Insight>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Build Plan
// ─────────────────────────────────────────────────────────────────────────────

function BuildPlanSection() {
  return (
    <section className="flex flex-col gap-6">
      <SectionHead
        id="buildplan"
        tag="Engineering"
        tagType="data"
        title="What to build, in what order, and what not to build"
        sub="Sequenced by what unlocks revenue, not by what's technically interesting. The 'not' list matters as much as the 'yes' list."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.green }}>Build this — ordered by ROI</p>
          {[
            { n: 1, item: 'The sales page', why: 'Before any code: a single page with the friend\'s site screenshot, the origin story, pricing ($1,500 setup + $12/mo), and a contact form. Needs to exist before the first REIA meeting.' },
            { n: 2, item: 'Stripe + manual billing', why: 'Accept payment. Not a Stripe integration — a Stripe Checkout link for $1,500 or $12/mo. 30 minutes of setup. Do this before your second customer.' },
            { n: 3, item: 'Gateway Phase 1 (short URLs only)', why: 'Remove the script.google.com URL from client embed code. This is the #1 upgrade trigger and unlocks the $12/mo pitch. 1 week of focused work.' },
            { n: 4, item: 'sheetspin billing enforcement', why: 'Firestore user + Stripe webhook → unlock/lock features. Required before agency licensing. 1 week.' },
            { n: 5, item: 'Agency dashboard (multi-project)', why: 'The seat at the table for B2B licensing. Shows all client sites, last-edit times, module toggles per client. 2-3 weeks.' },
            { n: 6, item: 'Consumer provisioning UI', why: 'Only after 50 done-for-you builds have told you exactly what the UI needs to handle. Not before.' },
          ].map(({ n, item, why }) => (
            <div key={item} className="flex items-start gap-3 rounded-lg p-3"
              style={{ background: C.greenA(0.05), border: `1px solid ${C.greenA(0.18)}` }}>
              <span className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 mt-0.5"
                style={{ background: C.green, color: 'oklch(0.1 0 0)' }}>
                {n}
              </span>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{item}</p>
                <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--color-muted)' }}>{why}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.red }}>Do NOT build before Stage 4</p>
          <Strikes items={[
            'The full consumer UI with AI provisioning — build on top of the skill when you have 50 sites\' worth of knowledge.',
            'Next.js export feature — your Stage 1-3 customers don\'t care. This is for technical users who don\'t exist yet.',
            'Webhooks, analytics dashboard, CORS enforcement — Phase 2 features that require Phase 1 customers to matter.',
            'White-label / agency rebrand — not until you have agency customers asking for it.',
            'Multiple visual styles (9+) — 3 styles covers 90% of cases. More is decision paralysis for non-technical users.',
            'Full DNS management dashboard — a guided CNAME instruction with 3 registrar screenshots is sufficient for 18 months.',
            'Domain purchase flow (Namecheap API) — cool feature, not revenue. Skip until Stage 4.',
            'SEO/sitemap/JSON-LD automation — real but not urgent. Manual meta tags in the skill cover it for 12 months.',
          ]} />
          <Warn>
            <span className="font-semibold" style={{ color: C.amber }}>The scope trap: </span>
            The build skill produces a high-quality site and it&apos;s tempting to add features to the platform
            because they&apos;re interesting to build. Every feature you build before you have a customer who
            asked for it is a bet. Some bets pay off. Most don&apos;t. The done-for-you service model specifically
            exists to tell you which features to bet on.
          </Warn>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Decision Gates
// ─────────────────────────────────────────────────────────────────────────────

function GatesSection() {
  return (
    <section className="flex flex-col gap-6">
      <SectionHead
        id="gates"
        tag="Decision points"
        tagType="gate"
        title="The gates — where you choose, not just execute"
        sub="Three moments where the data from previous stages tells you which path to take. These aren't arbitrary milestones — they're the moments where you have enough information to decide."
      />

      <div className="flex flex-col gap-4">
        {[
          {
            title: 'Gate 1: After first 3 paying customers (week 4-8)',
            question: 'Is the done-for-you service repeatable and referrable?',
            if_yes: 'Continue Stage 2. Expand to 10 sites. Stay in real estate. Add the Stripe/billing layer.',
            if_no: 'Two sub-cases: (a) nobody paid → price or channel is wrong, try the REIA meeting in a different city; (b) people paid but it didn\'t lead to referrals → the product doesn\'t have "tell a friend" energy. Diagnose before scaling.',
            signal: 'Yes if: at least one customer said "I\'m telling my investor friend about this." No if: customers paid but you had to push hard for every single one.',
          },
          {
            title: 'Gate 2: After 10-15 sites (month 3-5)',
            question: 'Is the real estate vertical scalable via referral, or does every customer require active sales?',
            if_yes: 'Expand the community presence (more REIA meetings, BiggerPockets posts, Facebook ads). Stay single-vertical. Start agency licensing conversations.',
            if_no: 'Add a second vertical — but pick it based on what existing customers told you, not what seems logical. Local service businesses (plumbers, landscapers) are the most similar customer profile.',
            signal: 'Yes if: 3+ customers came from referrals without any prompting from you. No if: you found every single customer through direct outreach.',
          },
          {
            title: 'Gate 3: At $5K MRR recurring (month 8-12)',
            question: 'Does the consumer self-serve platform accelerate growth, or does the done-for-you + agency model scale indefinitely?',
            if_yes: 'Build Stage 4. Wrap the build skill in a consumer UI. Put the 50+ site examples on the homepage. Launch to your community first.',
            if_no: 'Stay in Stage 3. The agency model compounds: every new agency brings 10 new sites. You might reach $30-50K MRR without a consumer platform. That\'s not failure.',
            signal: 'Yes if: agencies are telling you their end-clients want to self-manage the site after launch. No if: everyone wants you to keep running it.',
          },
        ].map(({ title, question, if_yes, if_no, signal }) => (
          <div key={title} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.greenA(0.25)}` }}>
            <div className="px-4 py-3" style={{ background: C.greenA(0.10), borderBottom: `1px solid ${C.greenA(0.20)}` }}>
              <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{title}</p>
              <p className="text-xs mt-0.5" style={{ color: C.green }}>{question}</p>
            </div>
            <div className="p-4 flex flex-col gap-3" style={{ background: 'var(--color-surface)' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg p-3 flex flex-col gap-1"
                  style={{ background: C.greenA(0.05), border: `1px solid ${C.greenA(0.18)}` }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.green }}>If yes →</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{if_yes}</p>
                </div>
                <div className="rounded-lg p-3 flex flex-col gap-1"
                  style={{ background: C.amberA(0.05), border: `1px solid ${C.amberA(0.18)}` }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.amber }}>If no →</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{if_no}</p>
                </div>
              </div>
              <div className="text-xs px-3 py-2 rounded"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
                <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Signal: </span>{signal}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-5 flex flex-col gap-3"
        style={{ background: C.violetA(0.07), border: `1.5px solid ${C.violetA(0.30)}` }}>
        <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>The meta-principle across all gates</p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Every stage of this plan generates specific data about the next stage. The done-for-you builds tell you
          what the AI provisioning needs to generate. The community presence tells you what the marketing copy
          should say. The agency conversations tell you whether a consumer platform is needed. This is not a
          linear roadmap — it&apos;s a series of experiments, each one reducing the uncertainty of the next.
          You don&apos;t need to be certain about Stage 4 to start Stage 1. You need to start Stage 1 to have
          any useful information about Stage 4.
        </p>
        <div className="flex flex-col gap-1 pt-2" style={{ borderTop: `1px solid ${C.violetA(0.20)}` }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.violet }}>The one thing to do this week</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Post in one BiggerPockets forum thread. Tell the story about building your friend&apos;s site.
            Include a screenshot. Say you&apos;ll do 3 more for free. See what happens.
            Everything in this document becomes real or fictional based on that experiment.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ComprehensivePlan() {
  const [activeSection, setActiveSection] = useState<SectionId>('inventory');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="flex gap-8 w-full max-w-5xl mx-auto">

      {/* Sidebar — sticky nav */}
      <aside className="hidden lg:flex flex-col gap-1 shrink-0 w-44 pt-1"
        style={{ position: 'sticky', top: '5rem', alignSelf: 'flex-start', height: 'fit-content' }}>
        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-subtle)' }}>
          Contents
        </p>
        {SECTIONS.map(({ id, label }) => {
          const isActive = activeSection === id;
          return (
            <a key={id} href={`#${id}`}
              className="text-xs py-1.5 px-2 rounded transition-all"
              style={{
                color: isActive ? 'var(--color-text)' : 'var(--color-subtle)',
                background: isActive ? C.accentA(0.08) : 'transparent',
                borderLeft: isActive ? `2px solid ${C.accent}` : '2px solid transparent',
                fontWeight: isActive ? 600 : 400,
              }}>
              {label}
            </a>
          );
        })}
      </aside>

      {/* Main content */}
      <article className="flex-1 min-w-0 flex flex-col gap-14 pb-20">
        <header className="flex flex-col gap-3 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag type="default">Internal · Not indexed</Tag>
            <Tag type="warn">Updated with full stack context</Tag>
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
            Comprehensive Business Plan
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)', maxWidth: '70ch' }}>
            A ground-up synthesis incorporating the sheetspin provisioning stack, the frontend-dev-skill
            multi-agent build system, and the real estate wholesaler as the origin customer. Includes
            honest pushback on previous assumptions, revised pricing, revised sequencing, and specific
            tactics for the distribution problem.
          </p>
          <div className="flex items-center gap-4 pt-2 flex-wrap" style={{ borderTop: '1px solid var(--color-border)' }}>
            {[
              { label: 'sheetspin provisioning', status: 'Shipped' },
              { label: 'Build skill', status: 'Working' },
              { label: 'Live customer site', status: '1 site' },
              { label: 'Paying customers', status: '0' },
              { label: 'Gateway tier', status: 'Not built' },
            ].map(({ label, status }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="text-[10px]" style={{ color: 'var(--color-subtle)' }}>{label}</span>
                <span className="text-[10px] font-semibold" style={{
                  color: status === 'Not built' || status === '0' ? C.amber
                    : status === 'Shipped' || status === 'Working' ? C.green
                    : 'var(--color-text)',
                }}>{status}</span>
              </div>
            ))}
          </div>
        </header>

        <InventorySection />
        <InsightSection />
        <ModelsSection />
        <PathSection />
        <EconomicsSection />
        <MoatSection />
        <DistributionSection />
        <BuildPlanSection />
        <GatesSection />
      </article>
    </div>
  );
}
