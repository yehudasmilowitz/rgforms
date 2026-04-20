import type { Metadata } from 'next';
import BusinessPlanTabs from '@/components/BusinessPlanTabs';

export const metadata: Metadata = {
  title: 'Business Plan — Sheetspin',
  description: 'Internal business plan and go-to-market strategy for Sheetspin.',
  robots: { index: false, follow: false },
};

// ─── Primitives ──────────────────────────────────────────────────────────────

function SectionHeader({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-1 pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{title}</h2>
      </div>
      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{subtitle}</p>
    </div>
  );
}

function CalloutBox({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className="rounded-xl border p-5 text-sm leading-relaxed"
      style={{
        background: accent ? 'oklch(0.65 0.22 285 / 0.06)' : 'var(--color-surface)',
        borderColor: accent ? 'oklch(0.65 0.22 285 / 0.25)' : 'var(--color-border)',
        color: 'var(--color-muted)',
      }}
    >
      {children}
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="text-xs px-1.5 py-0.5 rounded font-mono"
      style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
    >
      {children}
    </code>
  );
}

function Accent({ children }: { children: React.ReactNode }) {
  return <span style={{ color: 'var(--color-accent)' }}>{children}</span>;
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong style={{ color: 'var(--color-text)' }}>{children}</strong>;
}

// ─── Tier Card ───────────────────────────────────────────────────────────────

interface TierProps {
  name: string;
  price: string;
  period?: string;
  highlight?: boolean;
  tag?: string;
  features: string[];
  target: string;
  upgradeHook: string;
}

function TierCard({ name, price, period = '/mo', highlight = false, tag, features, target, upgradeHook }: TierProps) {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-4"
      style={{
        background: highlight ? 'oklch(0.65 0.22 285 / 0.06)' : 'var(--color-surface)',
        borderColor: highlight ? 'oklch(0.65 0.22 285 / 0.35)' : 'var(--color-border)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{name}</p>
            {tag && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide"
                style={{
                  color: 'oklch(0.65 0.22 285)',
                  background: 'oklch(0.65 0.22 285 / 0.10)',
                  border: '1px solid oklch(0.65 0.22 285 / 0.30)',
                }}
              >
                {tag}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold" style={{ color: highlight ? 'var(--color-accent)' : 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
              {price}
            </span>
            {price !== 'Free' && (
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{period}</span>
            )}
          </div>
        </div>
      </div>

      <ul className="flex flex-col gap-1.5">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
            <span className="shrink-0 mt-0.5 text-xs" style={{ color: 'oklch(0.72 0.18 145)' }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-1 pt-1" style={{ borderTop: '1px solid var(--color-border)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-subtle)' }}>Target</p>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{target}</p>
      </div>

      <div
        className="rounded-lg p-3 text-xs leading-relaxed"
        style={{ background: 'var(--color-surface-2)', borderLeft: '2px solid var(--color-accent)', color: 'var(--color-muted)' }}
      >
        <span style={{ color: 'var(--color-accent)' }}>Upgrade hook: </span>
        {upgradeHook}
      </div>
    </div>
  );
}

// ─── Phase Card ──────────────────────────────────────────────────────────────

function PhaseCard({
  number,
  title,
  timeline,
  cost,
  outcome,
  steps,
}: {
  number: number;
  title: string;
  timeline: string;
  cost: string;
  outcome: string;
  steps: string[];
}) {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-4"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold shrink-0"
          style={{
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-display)',
          }}
        >
          {number}
        </div>
        <div className="flex flex-col gap-0.5 flex-1">
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{title}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{timeline}</span>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{
                color: 'oklch(0.72 0.18 145)',
                background: 'oklch(0.72 0.18 145 / 0.10)',
                border: '1px solid oklch(0.72 0.18 145 / 0.30)',
              }}
            >
              {cost}
            </span>
          </div>
        </div>
      </div>

      <ul className="flex flex-col gap-1.5 ml-13">
        {steps.map((s, i) => (
          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
            <span className="shrink-0 mt-0.5 text-xs" style={{ color: 'var(--color-accent)' }}>→</span>
            {s}
          </li>
        ))}
      </ul>

      <div
        className="rounded-lg p-3 text-xs leading-relaxed font-semibold"
        style={{ background: 'oklch(0.65 0.22 285 / 0.06)', borderLeft: '2px solid var(--color-accent)', color: 'var(--color-text)' }}
      >
        Outcome: <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>{outcome}</span>
      </div>
    </div>
  );
}

// ─── Stat Row ────────────────────────────────────────────────────────────────

function StatRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-3"
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{label}</span>
      <div className="flex items-center gap-3">
        {note && <span className="text-xs hidden sm:block" style={{ color: 'var(--color-subtle)' }}>{note}</span>}
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{value}</span>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function BusinessPage() {
  return (
    <main
      className="min-h-screen px-4 py-16"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <article className="w-full max-w-2xl mx-auto flex flex-col gap-14">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className="flex flex-col gap-4">
          <div
            className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-muted)',
            }}
          >
            Internal · Not indexed
          </div>

          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
          >
            Business Plan
          </h1>

          <p className="text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            A two-tier product built on a structural advantage: the free tier runs entirely on
            Google&apos;s infrastructure with zero data ever touching our servers, and the paid tiers
            layer a managed gateway on top — short URLs, analytics, webhooks, and access control —
            while preserving the same near-zero cost base.
          </p>

          <CalloutBox accent>
            <Strong>The one-sentence pitch:</Strong> rgforms turns Google Sheets into a professional
            REST API in 2 minutes — free tier keeps your data entirely in your own Drive (HIPAA-compatible,
            zero vendor lock-in), paid tiers add the professional API layer on top.
          </CalloutBox>
        </header>

        {/* ── 1. Core Thesis ──────────────────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <SectionHeader
            emoji="💡"
            title="The Core Thesis"
            subtitle="Why this business has structurally better margins than any competitor — and a free tier that's a genuine product, not a loss leader."
          />

          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Every competing tool — Formspree, SheetDB, Contentful, Airtable — pays real infrastructure
            costs for every user&apos;s data: compute, storage, bandwidth, redundancy. rgforms pays
            almost none of that. On the free tier, Google runs the Apps Script, stores the submissions,
            and serves the API — all from the user&apos;s own Drive. Our infrastructure cost is near-fixed
            regardless of how many free users we add. On paid tiers, we introduce a gateway layer that
            adds the professional features — but the underlying data still lives in Google&apos;s
            infrastructure, keeping our COGS far below any competitor.
          </p>

          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div
              className="px-5 py-3 text-xs font-semibold uppercase tracking-wider"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-subtle)', borderBottom: '1px solid var(--color-border)' }}
            >
              Unit Economics at Scale
            </div>
            <div style={{ background: 'var(--color-surface)' }}>
              <div
                className="grid px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
                style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', borderBottom: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}
              >
                <span>Paying Users</span>
                <span>Avg MRR/user</span>
                <span>Monthly Rev</span>
                <span>Infra Cost</span>
                <span style={{ color: 'oklch(0.72 0.18 145)' }}>Gross Margin</span>
              </div>
              {[
                { users: '100', avg: '$18', rev: '$1,800', cost: '~$80', margin: '96%' },
                { users: '500', avg: '$20', rev: '$10,000', cost: '~$150', margin: '98%' },
                { users: '2,000', avg: '$22', rev: '$44,000', cost: '~$500', margin: '99%' },
                { users: '10,000', avg: '$20', rev: '$200,000', cost: '~$3,000', margin: '98%' },
              ].map(({ users, avg, rev, cost, margin }) => (
                <div
                  key={users}
                  className="grid px-5 py-3 text-sm"
                  style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
                >
                  <span>{users}</span>
                  <span>{avg}</span>
                  <span>{rev}</span>
                  <span>{cost}</span>
                  <span className="font-bold" style={{ color: 'oklch(0.72 0.18 145)', fontFamily: 'var(--font-display)' }}>{margin}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            After Stripe fees (~3%), you still run at margins most SaaS companies never reach.
            This is the structural advantage: <Strong>Google subsidizes your cost of goods.</Strong> The
            infra column above covers Firebase App Hosting, Firestore (metadata only — not submission payloads),
            and a short-URL domain. That&apos;s it.
          </p>
        </section>

        {/* ── 2. Two Architectures ────────────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <SectionHeader
            emoji="🏛"
            title="Two Architectures, One Product"
            subtitle="The free tier and paid tiers are not the same product with features removed — they are architecturally different, and that difference is a selling point."
          />

          <div className="flex flex-col gap-3">
            <div
              className="rounded-xl border p-5 flex flex-col gap-4"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Free tier — no gateway</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                Form submissions flow directly from the user&apos;s site → Google&apos;s Apps Script
                server → their Google Sheet. rgforms is never in that path. We provision the
                infrastructure once (creating the Sheet and deploying the script using their OAuth
                token during setup), then step entirely out of the way.
              </p>
              <div
                className="rounded-lg p-3 text-xs font-mono leading-loose"
                style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}
              >
                {`Browser → script.google.com/macros/…/exec → Google Sheet\n         (rgforms is not in this path)`}
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  'Scripts deployed as "Anyone can access, Execute as: Me" — standard public web app',
                  'OAuth token used only during provisioning, never stored long-term',
                  'rgforms has zero access to submissions after setup completes',
                  'One-time browser authorization still required after provisioning (Google platform limitation)',
                  'Raw script.google.com URLs in every embed',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                    <span className="shrink-0 mt-0.5" style={{ color: 'var(--color-subtle)' }}>·</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-xl border p-5 flex flex-col gap-4"
              style={{ background: 'oklch(0.65 0.22 285 / 0.04)', borderColor: 'oklch(0.65 0.22 285 / 0.25)' }}
            >
              <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Paid tiers — gateway architecture</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                All traffic flows through our gateway. Scripts are deployed privately ("Only myself")
                and called via the Apps Script <Mono>scripts.run</Mono> API using the user&apos;s stored
                OAuth refresh token — never via a public URL. The one-time authorization is handled
                programmatically during provisioning.
              </p>
              <div
                className="rounded-lg p-3 text-xs font-mono leading-loose"
                style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}
              >
                {`Browser → rg.fm/slug → our gateway → scripts.run API → Google Sheet\n                       (analytics, rate limiting, webhooks happen here)`}
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  'Scripts private — never reachable via public URL',
                  'Gateway calls scripts/{scriptId}:run authenticated by stored refresh token',
                  'Refresh token encrypted at rest in Firestore, minted fresh on each outbound call',
                  'No manual browser authorization — consent handled inline during provisioning',
                  'Short URLs, analytics, webhooks, CORS enforcement all enabled',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                    <span className="shrink-0 mt-0.5" style={{ color: 'oklch(0.65 0.22 285)' }}>·</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* HIPAA comparison */}
          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div
              className="px-5 py-3 text-xs font-semibold uppercase tracking-wider"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-subtle)', borderBottom: '1px solid var(--color-border)' }}
            >
              HIPAA Posture Comparison
            </div>
            <div style={{ background: 'var(--color-surface)' }}>
              <div
                className="grid px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
                style={{ gridTemplateColumns: '1.5fr 1fr 1fr', borderBottom: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}
              >
                <span>Dimension</span>
                <span>Free (no gateway)</span>
                <span>Paid (gateway)</span>
              </div>
              {[
                { dim: 'PHI touches our servers', free: 'Never', paid: 'In transit (gateway)' },
                { dim: 'PHI stored by us', free: 'Never', paid: 'Metadata only (payloads = Sheets)' },
                { dim: 'Google Workspace BAA covers data', free: 'Yes — fully', paid: 'Yes — for Sheets/Firestore' },
                { dim: 'rgforms BAA required', free: 'Debatable — provisioning-only access', paid: 'Yes — we become a Business Associate' },
                { dim: 'User data sovereignty', free: 'Complete — their Drive, their keys', paid: 'Partial — data in Drive, metadata in our Firestore' },
                { dim: 'Breach exposure', free: 'None — we hold no PHI', paid: 'Transit-only if payloads not stored' },
              ].map(({ dim, free, paid }, i) => (
                <div
                  key={dim}
                  className="grid px-5 py-3 text-xs gap-4"
                  style={{
                    gridTemplateColumns: '1.5fr 1fr 1fr',
                    borderBottom: '1px solid var(--color-border)',
                    background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)',
                  }}
                >
                  <span style={{ color: 'var(--color-text)' }}>{dim}</span>
                  <span style={{ color: 'oklch(0.72 0.18 145)' }}>{free}</span>
                  <span style={{ color: 'var(--color-muted)' }}>{paid}</span>
                </div>
              ))}
            </div>
          </div>

          <CalloutBox>
            <Strong>The pitch for free-tier HIPAA users:</Strong> &ldquo;The free tier is architecturally
            incapable of accessing your data. Submissions go directly from your site to your Google Sheet —
            rgforms is not in that path. If your Google Workspace account has a signed BAA with Google
            (covering Sheets and Apps Script), you&apos;re HIPAA-compatible with zero additional
            compliance overhead on our side.&rdquo; No competing form tool can say this.
          </CalloutBox>
        </section>

        {/* ── Plan Details (tabbed) ──────────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Plan Details</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>Deep-dive into each tier — architecture, monetization, and what to build.</p>
          </div>
          <BusinessPlanTabs />
        </section>
        {/* ── 8. Competitive Landscape ─────────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <SectionHeader
            emoji="⚔️"
            title="Competitive Landscape"
            subtitle="What we beat, and the honest truth about each comparison."
          />

          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div
              className="grid text-xs font-semibold uppercase tracking-wider px-5 py-3"
              style={{
                gridTemplateColumns: '1fr 1fr 1fr',
                background: 'var(--color-surface-2)',
                borderBottom: '1px solid var(--color-border)',
                color: 'var(--color-subtle)',
              }}
            >
              <span>Competitor</span>
              <span>Their price</span>
              <span>Our edge</span>
            </div>
            {[
              {
                name: 'Formspree / Basin',
                price: '$10–40/mo',
                edge: 'Same price, but you own your data + you get a content API, not just form submissions.',
              },
              {
                name: 'SheetDB / Sheet.best',
                price: '$7–99/mo',
                edge: 'They require manually setting up the Sheet. We provision everything in 2 minutes.',
              },
              {
                name: 'Contentful / DatoCMS',
                price: '$25–300/mo',
                edge: 'Same headless CMS concept, $0 storage, data is a Google Sheet you can always export.',
              },
              {
                name: 'Airtable',
                price: '$20–45/seat/mo',
                edge: 'Google Sheets is free. We add the managed API layer on top automatically.',
              },
              {
                name: 'Zapier / Make',
                price: '$20–100/mo',
                edge: 'We produce webhook events they can consume — complementary, not competing.',
              },
            ].map(({ name, price, edge }) => (
              <div
                key={name}
                className="grid px-5 py-3 text-sm gap-4"
                style={{
                  gridTemplateColumns: '1fr 1fr 1fr',
                  borderBottom: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                }}
              >
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>{name}</span>
                <span style={{ color: 'var(--color-muted)' }}>{price}</span>
                <span style={{ color: 'var(--color-muted)' }}>{edge}</span>
              </div>
            ))}
          </div>

          <CalloutBox accent>
            <Strong>The moat that deepens over time:</Strong> Every module a user creates writes a{' '}
            <Mono>_config</Mono> tab that rgforms reads. Every webhook is configured in our dashboard.
            Every short URL lives on our domain. Analytics history lives in our Firestore.
            Switching to a competitor means losing provisioned infrastructure, analytics history,
            webhook configs, and stable URLs. Switching cost compounds with every module created.
          </CalloutBox>
        </section>

        {/* ── 9. Revenue Projections ────────────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <SectionHeader
            emoji="📈"
            title="Revenue Projections"
            subtitle="Conservative, realistic, and optimistic scenarios. All assume ~70% annual churn on free, 15% on paid."
          />

          <div className="flex flex-col gap-5">
            {[
              {
                label: 'Conservative — 6 months post-launch',
                color: 'oklch(0.60 0.030 285)',
                bg: 'oklch(0.60 0.030 285 / 0.06)',
                border: 'oklch(0.23 0.015 285)',
                stats: [
                  { label: 'Free users', value: '400', note: 'via Product Hunt + HN' },
                  { label: 'Paying users', value: '60', note: '15% conversion' },
                  { label: 'Avg plan', value: 'Builder ($9)', note: '' },
                  { label: 'MRR', value: '$540', note: '' },
                  { label: 'Infra cost', value: '~$80/mo', note: '' },
                  { label: 'Net profit', value: '~$440/mo', note: '81% margin' },
                ],
              },
              {
                label: 'Realistic — 12 months post-launch',
                color: 'oklch(0.65 0.22 285)',
                bg: 'oklch(0.65 0.22 285 / 0.06)',
                border: 'oklch(0.65 0.22 285 / 0.25)',
                stats: [
                  { label: 'Free users', value: '2,000', note: 'organic + SEO' },
                  { label: 'Paying users', value: '300', note: '15% conversion' },
                  { label: 'Avg plan', value: 'Pro ($24)', note: 'mix of Builder + Pro' },
                  { label: 'MRR', value: '$7,200', note: '' },
                  { label: 'Infra cost', value: '~$200/mo', note: '' },
                  { label: 'Net profit', value: '~$6,800/mo', note: '94% margin' },
                ],
              },
              {
                label: 'Optimistic — 24 months post-launch',
                color: 'oklch(0.72 0.18 145)',
                bg: 'oklch(0.72 0.18 145 / 0.06)',
                border: 'oklch(0.72 0.18 145 / 0.25)',
                stats: [
                  { label: 'Free users', value: '15,000', note: 'rg.fm brand flywheel' },
                  { label: 'Paying users', value: '1,800', note: '12% conversion' },
                  { label: 'Avg plan', value: '$28', note: 'Pro + Business mix' },
                  { label: 'MRR', value: '$50,400', note: '$604k ARR' },
                  { label: 'Infra cost', value: '~$2,000/mo', note: '' },
                  { label: 'Net profit', value: '~$46,000/mo', note: '91% margin' },
                ],
              },
            ].map(({ label, color, bg, border, stats }) => (
              <div key={label} className="rounded-xl border overflow-hidden" style={{ borderColor: border }}>
                <div
                  className="px-5 py-3 text-xs font-semibold"
                  style={{ background: bg, borderBottom: `1px solid ${border}`, color }}
                >
                  {label}
                </div>
                <div className="px-5" style={{ background: 'var(--color-surface)' }}>
                  {stats.map(({ label: sl, value, note }) => (
                    <StatRow key={sl} label={sl} value={value} note={note} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 10. Go-To-Market ──────────────────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <SectionHeader
            emoji="🚀"
            title="Go-To-Market"
            subtitle="How people find us. Built around SEO, community, and the brand flywheel."
          />

          <div className="flex flex-col gap-4">

            <div
              className="rounded-xl border p-5 flex flex-col gap-3"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>SEO — own the intent searches</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                High-intent, low-competition keywords that map exactly to what we do:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'turn google sheets into rest api',
                  'google sheets form backend',
                  'google sheets headless cms',
                  'google sheets api endpoint',
                  'formspree alternative',
                  'free contact form backend',
                ].map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div
              className="rounded-xl border p-5 flex flex-col gap-3"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Launch sequence</p>
              <ol className="flex flex-col gap-2">
                {[
                  { n: '1', s: 'Product Hunt launch the day Phase 1 ships — get early adopters and feedback.' },
                  { n: '2', s: 'HackerNews "Show HN" — the zero-backend story resonates strongly there.' },
                  { n: '3', s: 'Dev.to / Hashnode: "How I turned Google Sheets into a REST API in 2 minutes" — SEO content that teaches.' },
                  { n: '4', s: 'Reddit r/webdev, r/SideProject, r/nocode — all separate posts, community-appropriate tone.' },
                  { n: '5', s: 'The rg.fm flywheel kicks in — embeds on other developers\' sites drive organic discovery.' },
                ].map(({ n, s }) => (
                  <li key={n} className="flex items-start gap-3 text-sm" style={{ color: 'var(--color-muted)' }}>
                    <span className="shrink-0 font-bold text-xs mt-0.5" style={{ color: 'var(--color-accent)', minWidth: '1rem' }}>{n}.</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>

            <div
              className="rounded-xl border p-5 flex flex-col gap-3"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>The "Built with rgforms" badge</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                Free tier form confirmation pages show a small "Powered by rgforms" link — the same
                model Mailchimp used to reach millions. Pro tier removes it. Estimated reach: if 1,000
                free-tier forms each get 50 unique visitors/month, that&apos;s 50,000 monthly brand
                impressions at $0 CAC.
              </p>
            </div>
          </div>
        </section>

        {/* ── 11. Tech Stack Summary ────────────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <SectionHeader
            emoji="⚙️"
            title="Tech Stack"
            subtitle="The smallest set of technology that can ship Phase 1 in 4 weeks."
          />

          <div className="flex flex-col gap-0 rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            {[
              { layer: 'Frontend', choice: 'Next.js (server mode)', why: 'Remove output: export, add API routes. Already the framework we use.' },
              { layer: 'Database', choice: 'Firestore (Firebase)', why: 'Schema-flexible, Google ecosystem, generous free tier, real-time.' },
              { layer: 'Auth', choice: 'Google OAuth → backend JWT', why: 'httpOnly cookie session, refresh token stored in Firestore.' },
              { layer: 'Payments', choice: 'Stripe Billing', why: 'Subscriptions, Checkout, webhooks to update Firestore plan field.' },
              { layer: 'Hosting', choice: 'Firebase App Hosting', why: 'Full Next.js SSR support (via Cloud Run). One billing account, one console — same ecosystem as Firestore and Google OAuth.' },
              { layer: 'Short URLs', choice: 'Next.js middleware', why: 'Reads slug from Firestore, redirects at the edge via Firebase CDN.' },
              { layer: 'Webhooks', choice: 'Background fetch queue', why: 'Fire-and-forget via Cloud Tasks or a simple queue doc in Firestore.' },
            ].map(({ layer, choice, why }, i, arr) => (
              <div
                key={layer}
                className="grid px-5 py-3.5 gap-4 text-sm"
                style={{
                  gridTemplateColumns: '120px 1fr 1fr',
                  background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-subtle)' }}>{layer}</span>
                <span className="font-medium" style={{ color: 'var(--color-accent)' }}>{choice}</span>
                <span style={{ color: 'var(--color-muted)' }}>{why}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer Summary ───────────────────────────────────────────── */}
        <div
          className="rounded-xl border p-5 flex flex-col gap-3 text-sm leading-relaxed"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
        >
          <p className="font-bold" style={{ color: 'var(--color-text)' }}>Suggested first three steps</p>
          <ol className="flex flex-col gap-2">
            {[
              { n: '1', s: "Acquire the short URL domain (rg.fm or similar) — this is time-sensitive and costs ~$15." },
              { n: '2', s: "Remove output: 'export' from next.config.ts, connect the repo to Firebase App Hosting — full Next.js SSR, API routes, and git-push deploys in one step." },
              { n: '3', s: "Add Firestore + backend session + one gateway proxy route that logs calls — this is the proof-of-concept for the entire business model." },
            ].map(({ n, s }) => (
              <li key={n} className="flex items-start gap-3">
                <span className="shrink-0 font-bold text-xs mt-0.5" style={{ color: 'var(--color-accent)', minWidth: '1rem' }}>{n}.</span>
                {s}
              </li>
            ))}
          </ol>
          <p style={{ color: 'var(--color-subtle)' }}>
            Everything else — analytics, webhooks, Stripe billing, team features — is features on top of
            that foundation. Phase 1 is the only thing that needs to exist before you can start charging.
          </p>
        </div>

      </article>
    </main>
  );
}
