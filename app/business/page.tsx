import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Plan — RG Forms',
  description: 'Internal business plan and go-to-market strategy for RG Forms.',
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
            The path from zero-backend form tool to a profitable, hosted REST API platform — with
            outsized margins, a short-URL growth engine, and Firestore-backed analytics on top of
            Google&apos;s free infrastructure.
          </p>

          <CalloutBox accent>
            <Strong>The one-sentence pitch:</Strong> rgforms turns Google Sheets into a professional
            REST API in 2 minutes — your data stays in your Drive, but you get a managed API with
            short URLs, analytics, webhooks, and access control.
          </CalloutBox>
        </header>

        {/* ── 1. Core Thesis ──────────────────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <SectionHeader
            emoji="💡"
            title="The Core Thesis"
            subtitle="Why this business has structurally better margins than any competitor."
          />

          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Every competing tool — Formspree, SheetDB, Contentful, Airtable — pays real infrastructure
            costs for every user&apos;s data: compute, storage, bandwidth, redundancy. rgforms pays
            almost none of that. Google runs the Apps Script, stores the submissions, and serves the
            API — all from the user&apos;s own Drive, for free. Our infrastructure cost is near-fixed
            regardless of how many users we add.
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
            <div className="px-5" style={{ background: 'var(--color-surface)' }}>
              <div
                className="flex items-center justify-between gap-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
                style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}
              >
                <span>Paying Users</span>
                <div className="flex items-center gap-8">
                  <span className="hidden sm:block">Avg MRR/user</span>
                  <span>Monthly Rev</span>
                  <span>Infra Cost</span>
                  <span style={{ color: 'oklch(0.72 0.18 145)' }}>Gross Margin</span>
                </div>
              </div>
              {[
                { users: '100', avg: '$18', rev: '$1,800', cost: '~$80', margin: '96%' },
                { users: '500', avg: '$20', rev: '$10,000', cost: '~$150', margin: '98%' },
                { users: '2,000', avg: '$22', rev: '$44,000', cost: '~$500', margin: '99%' },
                { users: '10,000', avg: '$20', rev: '$200,000', cost: '~$3,000', margin: '98%' },
              ].map(({ users, avg, rev, cost, margin }) => (
                <div
                  key={users}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                  style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
                >
                  <span>{users}</span>
                  <div className="flex items-center gap-8">
                    <span className="hidden sm:block">{avg}</span>
                    <span>{rev}</span>
                    <span>{cost}</span>
                    <span className="font-bold" style={{ color: 'oklch(0.72 0.18 145)', fontFamily: 'var(--font-display)' }}>{margin}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            After Stripe fees (~3%), you still run at margins most SaaS companies never reach.
            This is the structural advantage: <Strong>Google subsidizes your cost of goods.</Strong> The
            infra column above covers Vercel hosting, Firestore (metadata only — not submission payloads),
            and a short-URL domain. That&apos;s it.
          </p>
        </section>

        {/* ── 2. Short URLs ────────────────────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <SectionHeader
            emoji="🔗"
            title="Short URLs — The Growth Engine"
            subtitle="More than a feature. The marketing flywheel, the gateway foundation, and the moat."
          />

          <div className="flex flex-col gap-3">
            <div
              className="rounded-xl border p-4 flex gap-4"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <span className="text-base shrink-0 mt-0.5">❌</span>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Today</p>
                <Mono>https://script.google.com/macros/d/AKfycbxV7Gj9z3...MhQU/exec</Mono>
                <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--color-muted)' }}>
                  90-character Google URL in every embed. Google&apos;s brand, not ours. Breaks if
                  the Apps Script is redeployed. No analytics, no control.
                </p>
              </div>
            </div>
            <div
              className="rounded-xl border p-4 flex gap-4"
              style={{ background: 'oklch(0.72 0.18 145 / 0.05)', borderColor: 'oklch(0.72 0.18 145 / 0.30)' }}
            >
              <span className="text-base shrink-0 mt-0.5">✓</span>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Tomorrow</p>
                <Mono>https://rg.fm/acme/contact</Mono>
                <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--color-muted)' }}>
                  Our brand in every embed on the internet. Stable forever. Full control.
                  Analytics, rate limiting, webhooks — all enabled.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Three reasons this matters beyond aesthetics:
          </p>

          <div className="flex flex-col gap-3">
            {[
              {
                n: '1',
                title: 'Free advertising at scale',
                body: "Every website using rgforms embeds an rg.fm URL in their source code. Developers inspecting other sites' source will see it. Similar to how Mailchimp's free tier badge drove millions of impressions. Tens of thousands of rg.fm URLs on the internet is an acquisition channel that costs nothing.",
              },
              {
                n: '2',
                title: 'The gateway foundation',
                body: 'The short URL going through our server is what makes everything else possible. Without controlling the URL, we control nothing — no rate limiting, no analytics, no CORS enforcement, no billing enforcement, no webhooks. The short URL is the choke point that all value flows through.',
              },
              {
                n: '3',
                title: 'Stability as a selling point',
                body: "Redeploy your Apps Script? Schema change? Migrate to hosted Postgres? The user's embed code never changes. This solves a real pain point: currently any redeployment breaks every form on every site. With our gateway, the short URL is permanent and we update the destination behind the scenes.",
              },
            ].map(({ n, title, body }) => (
              <div
                key={n}
                className="flex gap-4 rounded-xl border p-4"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div
                  className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0"
                  style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-accent)' }}
                >
                  {n}
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{body}</p>
                </div>
              </div>
            ))}
          </div>

          <CalloutBox>
            <Strong>Domain strategy:</Strong> Pick a punchy 4–5 character domain — <Accent>rg.fm</Accent>,{' '}
            <Accent>rgf.sh</Accent>, or similar. It needs to look clean inside a URL and be memorable
            when seen in source code. The domain itself is a brand asset.
          </CalloutBox>
        </section>

        {/* ── 3. Pricing Tiers ─────────────────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <SectionHeader
            emoji="💳"
            title="Pricing Tiers"
            subtitle="Designed so every feature has one clear tier it belongs to — and one obvious reason to upgrade."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TierCard
              name="Starter"
              price="Free"
              features={[
                '1 project, 3 modules',
                'Raw script.google.com URLs',
                '500 submissions / month',
                '"Built with rgforms" badge',
                'No analytics, no webhooks',
              ]}
              target="Indie developers, personal projects, first-time users."
              upgradeHook="Hits the 500/mo cap or needs to remove the badge."
            />
            <TierCard
              name="Builder"
              price="$9"
              features={[
                '3 projects, 10 modules',
                'Short URLs (rg.fm/your-form)',
                '5,000 submissions / month',
                'Submission inbox (last 500)',
                'Basic analytics — volume over time',
                'Remove badge',
              ]}
              target="Freelancers, developers building client sites, small blogs."
              upgradeHook="Needs webhooks or wants per-project API keys."
            />
            <TierCard
              name="Pro"
              price="$24"
              highlight
              tag="Best value"
              features={[
                'Unlimited projects & modules',
                'Vanity slugs (rg.fm/acme/contact)',
                '50,000 submissions / month',
                'Full analytics — errors, geography, latency',
                'Webhooks (unlimited endpoints)',
                'CORS + IP allowlist control',
                'API keys per project',
                'CSV export',
              ]}
              target="Small agencies, growing startups, teams of 1–3."
              upgradeHook="Needs team seats or custom domain for a client."
            />
            <TierCard
              name="Business"
              price="$59"
              features={[
                'Everything in Pro',
                'Hosted Firestore storage tier',
                'Team seats (5 included, +$8/seat)',
                'Custom domain (api.yourco.com)',
                '500,000 submissions / month',
                'Priority support',
                'SLA',
              ]}
              target="Established agencies, small businesses with real API traffic."
              upgradeHook="Needs enterprise volume or more team seats."
            />
          </div>

          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            <Strong>The upgrade logic is deliberate.</Strong> Free users hit the submission cap and want short
            URLs. Builder users want webhooks. Pro users want a team seat. Every tier has one
            feature just out of reach. The most important transition is <Accent>Builder → Pro</Accent> —
            that&apos;s where the best unit economics live and where most developers land after 30–60 days.
          </p>
        </section>

        {/* ── 4. Storage: Firestore ─────────────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <SectionHeader
            emoji="🔥"
            title="Storage: Firestore"
            subtitle="Why Firestore is the right database for this business — and the one thing to design for upfront."
          />

          <div className="flex flex-col gap-3">
            {[
              {
                title: 'Schema flexibility',
                body: 'Submission payloads vary per module — a contact form has name/email/message, a blog module has title/body/slug/published. Firestore\'s document model handles this naturally. With Postgres you\'d be forced into JSON columns or EAV patterns.',
              },
              {
                title: 'Already in the Google ecosystem',
                body: 'Google OAuth, Google Sheets, Apps Script, Firestore — one billing account, one console, one trust boundary. Firebase Admin SDK in Next.js API routes is trivial to set up.',
              },
              {
                title: 'Generous free tier',
                body: 'Spark plan: 1GB storage, 50k reads/day, 20k writes/day. Enough to run the product until you have real paying users. Blaze pay-as-you-go only gets expensive at meaningful scale.',
              },
              {
                title: 'Real-time out of the box',
                body: 'Could power a live submission inbox with zero extra infrastructure — Firestore\'s onSnapshot listeners give you WebSocket-style updates for free.',
              },
            ].map(({ title, body }) => (
              <div
                key={title}
                className="flex gap-3 rounded-xl border p-4"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <span className="text-sm shrink-0 mt-0.5" style={{ color: 'oklch(0.72 0.18 145)' }}>✓</span>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{body}</p>
                </div>
              </div>
            ))}
          </div>

          <div
            className="rounded-xl border p-4"
            style={{ background: 'oklch(0.62 0.22 25 / 0.06)', borderColor: 'oklch(0.62 0.22 25 / 0.30)' }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: 'oklch(0.72 0.16 25)' }}>One gotcha: aggregations</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Firestore has no native <Mono>COUNT(*) GROUP BY day</Mono>. For analytics dashboards,
              maintain counter documents — increment a <Mono>stats/{'{userId}'}/daily/{'{date}'}</Mono>{' '}
              document on every gateway call. Design for this upfront and it&apos;s painless; discover
              it later and it&apos;s a migration.
            </p>
            <div
              className="mt-3 rounded-lg p-3 text-xs font-mono leading-loose overflow-x-auto"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}
            >
              {`// Suggested Firestore structure
users/{userId}
  projects/{projectId}
    modules/{moduleId}
    apiKeys/{keyId}
    webhooks/{webhookId}
    stats/daily/{YYYY-MM-DD}  ← counter docs for analytics

submissions/{submissionId}    ← top-level, projectId indexed
gatewayLogs/{logId}           ← metadata only, 90-day TTL
shortUrls/{slug}              ← { destination, projectId, userId }`}
            </div>
          </div>
        </section>

        {/* ── 5. Auth, API Keys & Security ─────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <SectionHeader
            emoji="🔐"
            title="Auth, API Keys & Security"
            subtitle="Two separate auth models — one for the dashboard, one for the API. Security features that are themselves a reason to pay."
          />

          {/* Auth model overview */}
          <div
            className="rounded-xl border p-5 flex flex-col gap-4"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Two auth models, one product</p>
            <div className="flex flex-col gap-3">
              {[
                {
                  label: 'Dashboard auth (human)',
                  color: 'oklch(0.65 0.22 285)',
                  desc: 'Google OAuth → server exchanges code for access + refresh tokens → httpOnly cookie (JWT) → Firestore session doc. The user never manages tokens manually. Refresh happens silently on the server. Session expires after 30 days of inactivity.',
                },
                {
                  label: 'API auth (machine)',
                  color: 'oklch(0.72 0.18 145)',
                  desc: 'API keys issued per project. Passed as Authorization: Bearer {key} or as a query param ?key= for simple GET embeds. Validated in the gateway middleware before any forwarding happens. Keys can be rotated, scoped, and revoked without touching the underlying Apps Script deployment.',
                },
              ].map(({ label, color, desc }) => (
                <div key={label} className="flex flex-col gap-1.5 pl-3" style={{ borderLeft: `2px solid ${color}` }}>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>{label}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* API Key features */}
          <div
            className="rounded-xl border p-5 flex flex-col gap-4"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>API key design</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Scoped by permission', body: 'Each key has a permission set: read-only, write-only, or read+write. A public-facing content API gets a read-only key. A backend integration that creates submissions gets a write key. These are separate credentials.' },
                { title: 'Scoped by module', body: 'A key can be locked to one module (e.g. only the contact form), one project, or all projects in an account. Prevents a leaked embed key from exposing unrelated data.' },
                { title: 'Rotation without downtime', body: 'New key is issued, old key gets a 24-hour grace period (still valid), then expires. User updates one env var on their server. No form breakage during the transition.' },
                { title: 'Key metadata', body: 'Each key stores: label, created_at, last_used_at, use_count, scopes, status (active / revoked). Dashboard shows last-used timestamps so stale keys are obvious.' },
              ].map(({ title, body }) => (
                <div key={title} className="flex flex-col gap-1 rounded-lg p-3" style={{ background: 'var(--color-surface-2)' }}>
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Domain whitelisting */}
          <div
            className="rounded-xl border p-5 flex flex-col gap-4"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Domain whitelisting & CORS</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Each project has an allowed origins list. The gateway validates the{' '}
              <Mono>Origin</Mono> header on every request before forwarding — something the current
              raw Apps Script model cannot do at all (Apps Script never sees the Origin header).
            </p>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Browser form submissions', detail: 'Gateway checks Origin header against allowedOrigins list. Returns 403 with CORS error if not matched. Works even for embeds that don\'t send an API key.' },
                { label: 'Server-to-server API calls', detail: 'Origin header is absent on server requests, so key-based auth takes over. A server with a valid write key bypasses the origin check by design.' },
                { label: 'Localhost development', detail: 'If allowedOrigins includes "localhost" or is empty, origin check is skipped. No friction during development.' },
                { label: 'Wildcard subdomains', detail: 'Pro tier supports *.mycompany.com patterns, so staging.mycompany.com and app.mycompany.com both pass without listing each one.' },
              ].map(({ label, detail }) => (
                <div key={label} className="flex gap-3 text-sm">
                  <span className="shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }}>→</span>
                  <div>
                    <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{label}:</span>{' '}
                    <span style={{ color: 'var(--color-muted)' }}>{detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rate limiting */}
          <div
            className="rounded-xl border p-5 flex flex-col gap-4"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Rate limiting</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Enforced at the gateway — no rate limiting is possible on raw Apps Script URLs. Two dimensions:
            </p>
            <div className="flex flex-col gap-0 rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
              {[
                { dim: 'Monthly volume', desc: 'Enforced by tier. Counted in Firestore counter docs. When a project hits 95% of its limit, dashboard shows a warning. At 100%, the gateway returns 429 with a clear error message linking to the upgrade page.' },
                { dim: 'Burst rate', desc: 'Per-IP sliding window (60 req/min on free, 600/min on Pro). Prevents spam bots from hammering a single form. Implemented in Next.js middleware with Firestore or Upstash Redis as the counter store.' },
                { dim: 'Per-key rate', desc: 'Optional: each API key can have its own burst limit set by the user. Useful for multi-tenant apps where one key should not consume the full project quota.' },
              ].map(({ dim, desc }, i, arr) => (
                <div
                  key={dim}
                  className="grid px-4 py-3 gap-3 text-sm"
                  style={{
                    gridTemplateColumns: '140px 1fr',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                    background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)',
                  }}
                >
                  <span className="font-semibold text-xs" style={{ color: 'var(--color-text)' }}>{dim}</span>
                  <span className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* IP allowlist */}
          <div
            className="rounded-xl border p-5 flex flex-col gap-4"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>IP allowlisting</p>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide shrink-0"
                style={{ color: 'oklch(0.65 0.22 285)', background: 'oklch(0.65 0.22 285 / 0.10)', border: '1px solid oklch(0.65 0.22 285 / 0.30)' }}
              >
                Pro feature
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Write endpoints (form submissions, content creates) can be locked to specific IP
              addresses or CIDR ranges. A Business customer running a headless CMS integration from
              their own server adds their server&apos;s IP — even if someone finds the API key, they
              can&apos;t use it from elsewhere. Configured per-project in the dashboard.
            </p>
          </div>

          {/* Spam protection */}
          <div
            className="rounded-xl border p-5 flex flex-col gap-4"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Spam & abuse protection</p>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Honeypot (current)', tier: 'Free', detail: 'Hidden field baked into every embed snippet. The gateway checks for it before forwarding — if filled, request is silently dropped. No round-trip to Apps Script wasted.' },
                { label: 'Cloudflare Turnstile', tier: 'Builder+', detail: 'Drop-in reCAPTCHA alternative with no challenge friction. The embed snippet includes the Turnstile widget; the gateway validates the token server-side before forwarding. Works without exposing a secret key in the browser.' },
                { label: 'Abuse detection', tier: 'Pro+', detail: 'If a single IP submits more than N times in M minutes, auto-flag for review and optionally block. Dashboard surfaces flagged submissions separately from clean ones.' },
                { label: 'Submission fingerprinting', tier: 'Pro+', detail: 'Hash browser fingerprint (UA + IP + timing) to detect the same bot submitting from different IPs. Flagged, not hard-blocked — false positives are possible.' },
              ].map(({ label, tier, detail }) => (
                <div key={label} className="flex flex-col gap-1 rounded-lg p-3" style={{ background: 'var(--color-surface-2)' }}>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{label}</p>
                    <span
                      className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
                      style={{ color: 'oklch(0.60 0.030 285)', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    >
                      {tier}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{detail}</p>
                </div>
              ))}
            </div>
          </div>

          <CalloutBox accent>
            <Strong>Security as a monetization lever:</Strong> None of these features — CORS enforcement,
            rate limiting, IP allowlisting, Turnstile — are possible on raw <Mono>script.google.com</Mono>{' '}
            URLs. They are only possible because the gateway controls the endpoint. This makes the
            gateway itself the most defensible part of the product: you can&apos;t replicate these
            protections without switching away from the managed URL.
          </CalloutBox>
        </section>

        {/* ── 7. What To Build ─────────────────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <SectionHeader
            emoji="🏗"
            title="What To Build"
            subtitle="Three phases. Only Phase 1 is required to start charging. Everything else is features on top."
          />

          <PhaseCard
            number={1}
            title="The Gateway"
            timeline="4–6 weeks"
            cost="~$0 infra"
            outcome="A product you can charge for. Short URLs work, Stripe is wired, you can enforce billing limits."
            steps={[
              "Remove output: 'export' from next.config.ts — enable Next.js server mode",
              "Add Firestore (Firebase free tier) — users, projects, sessions, short URLs",
              "Backend session: Google OAuth → exchange for JWT in httpOnly cookie + Firestore session doc",
              "Short URL table: { slug, destination, projectId, userId } with Next.js middleware redirect",
              "Gateway proxy route: /api/gateway/[slug] — receive, log metadata to Firestore, forward to Apps Script, return response",
              "Billing enforcement: check Firestore submission count before forwarding, 429 if over limit",
              "Stripe Checkout: payment link for Builder/Pro/Business, webhook updates Firestore plan field",
            ]}
          />

          <PhaseCard
            number={2}
            title="Analytics + Webhooks"
            timeline="4–6 weeks"
            cost="~$50/mo"
            outcome="The features that justify Pro pricing. Users have a reason to stay and upgrade."
            steps={[
              "Analytics dashboard: request volume chart, error rate, latency — all from Firestore counter docs",
              "Submission inbox: store submission payloads for paying users (free = none stored server-side)",
              "Webhook system: on gateway POST, enqueue async delivery to user-configured URLs",
              "API key system: issue keys per project, validate in gateway before forwarding",
              "CORS + IP allowlist: validate in gateway middleware, return 403 with clear error",
              "Vanity slugs: let Pro users set custom rg.fm/acme/contact paths",
            ]}
          />

          <PhaseCard
            number={3}
            title="Hosted Storage Tier"
            timeline="When Phase 2 is profitable"
            cost="~$200/mo"
            outcome="Business tier unlocked. Data lives in Firestore, not Sheets. Real query capabilities."
            steps={[
              "For Business tier: write submissions to Firestore instead of routing through Sheets API",
              "Google Sheet kept in sync as user-owned backup and spreadsheet view",
              "SQL-like query params: ?where=published:true&sort=created_at:desc&limit=20",
              "Makes content modules viable as a real headless CMS backend for high-traffic sites",
              "Custom domain routing: api.yourcompany.com → our gateway via CNAME",
              "Team collaboration: invite by email, role-based access (viewer / editor / admin)",
            ]}
          />
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
              { layer: 'Hosting', choice: 'Vercel', why: 'Already deployed here. Edge middleware for short URL redirects.' },
              { layer: 'Short URLs', choice: 'Next.js middleware', why: 'Reads slug from Firestore, redirects in <10ms at edge.' },
              { layer: 'Webhooks', choice: 'Background fetch queue', why: 'Fire-and-forget via Vercel background functions or a simple queue doc in Firestore.' },
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
              { n: '2', s: "Remove output: 'export' from next.config.ts and deploy to Vercel in server mode — unblocks all API routes." },
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
