'use client';

import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Plan A — rgforms Gateway
// Visual identity: Steel blue, technical, developer-documentation feel.
// Dense information, monospace labels, left-bordered section headers.
// ─────────────────────────────────────────────────────────────────────────────

function PlanATab() {
  const blue = 'oklch(0.60 0.20 240)';
  const blueAlpha = (a: number) => `oklch(0.60 0.20 240 / ${a})`;
  const green = 'oklch(0.72 0.18 145)';
  const warn = 'oklch(0.72 0.18 35)';

  function ASection({ title, sub }: { title: string; sub?: string }) {
    return (
      <div className="flex flex-col gap-0.5 pb-3 mb-1"
        style={{ borderBottom: `2px solid ${blueAlpha(0.25)}` }}>
        <p className="text-xs font-mono uppercase tracking-widest font-bold"
          style={{ color: blue }}>
          {title}
        </p>
        {sub && <p className="text-xs" style={{ color: 'var(--color-subtle)' }}>{sub}</p>}
      </div>
    );
  }

  function ACard({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
    return (
      <div className="rounded-lg p-4 flex flex-col gap-3 text-sm"
        style={{
          background: highlight ? blueAlpha(0.05) : 'var(--color-surface)',
          border: `1px solid ${highlight ? blueAlpha(0.35) : 'var(--color-border)'}`,
        }}>
        {children}
      </div>
    );
  }

  function ACallout({ children, type = 'info' }: { children: React.ReactNode; type?: 'info' | 'warn' }) {
    const c = type === 'warn' ? `oklch(0.72 0.18 35 / 0.08)` : blueAlpha(0.06);
    const b = type === 'warn' ? `2px solid ${warn}` : `2px solid ${blue}`;
    return (
      <div className="rounded-r-lg px-4 py-3 text-sm leading-relaxed"
        style={{ background: c, borderLeft: b, color: 'var(--color-muted)' }}>
        {children}
      </div>
    );
  }

  function ACode({ children }: { children: string }) {
    return (
      <pre className="rounded p-3 text-xs font-mono leading-loose overflow-x-auto whitespace-pre"
        style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: `1px solid ${blueAlpha(0.15)}` }}>
        {children}
      </pre>
    );
  }

  function ABullet({ items, color }: { items: string[]; color?: string }) {
    return (
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            <span className="shrink-0 mt-0.5 font-bold font-mono" style={{ color: color ?? blue }}>›</span>
            {item}
          </div>
        ))}
      </div>
    );
  }

  function ALabel({ children }: { children: React.ReactNode }) {
    return (
      <p className="text-[10px] font-mono font-bold uppercase tracking-wider"
        style={{ color: blue }}>{children}</p>
    );
  }

  function APhase({ n, title, timeline, cost, outcome, steps }: {
    n: number; title: string; timeline: string; cost: string; outcome: string; steps: string[];
  }) {
    return (
      <div className="rounded-lg border p-4 flex flex-col gap-3"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', borderLeft: `3px solid ${blue}` }}>
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded shrink-0 text-xs font-mono font-bold"
            style={{ background: blueAlpha(0.1), border: `1px solid ${blueAlpha(0.3)}`, color: blue }}>
            {String(n).padStart(2, '0')}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{title}</p>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <span className="text-xs font-mono" style={{ color: 'var(--color-subtle)' }}>{timeline}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold"
                style={{ color: green, background: `oklch(0.72 0.18 145 / 0.10)`, border: `1px solid oklch(0.72 0.18 145 / 0.25)` }}>
                {cost}
              </span>
            </div>
          </div>
        </div>
        <ABullet items={steps} />
        <div className="text-xs px-3 py-2 rounded"
          style={{ background: blueAlpha(0.06), border: `1px solid ${blueAlpha(0.2)}`, color: 'var(--color-muted)' }}>
          <span className="font-mono font-bold" style={{ color: blue }}>OUTCOME: </span>{outcome}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="flex flex-col gap-0.5 flex-1">
            <p className="text-lg font-bold font-mono" style={{ color: 'var(--color-text)' }}>Plan A — rgforms Gateway</p>
            <p className="text-xs" style={{ color: 'var(--color-subtle)' }}>Monetize the existing product. Same users, same brand, same distribution. No pivot.</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded"
              style={{ color: blue, background: blueAlpha(0.10), border: `1px solid ${blueAlpha(0.3)}` }}>
              LOW RISK
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded"
              style={{ color: green, background: `oklch(0.72 0.18 145 / 0.10)`, border: `1px solid oklch(0.72 0.18 145 / 0.25)` }}>
              SHIPS IN 4–6 WK
            </span>
          </div>
        </div>
        <ACallout type="info">
          <span className="font-mono font-bold" style={{ color: blue }}>TL;DR: </span>
          Add a paid proxy layer on top of the provisioning-only product you already shipped.
          Free-tier users get a 90-character Google URL. Paying users get{' '}
          <code className="text-xs px-1 rounded" style={{ background: blueAlpha(0.12), color: blue }}>rg.fm/acme/contact</code>,
          a submission inbox, webhooks, and server-side emails — without ever giving rgforms access to their data at rest.
        </ACallout>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'TIME TO FIRST $', value: '4–6 weeks', sub: 'Builder tier only requirement' },
            { label: 'NEW INFRA', value: 'Zero until paid', sub: 'Free tier already works' },
            { label: 'CUSTOMER', value: 'Developers', sub: 'Same people, same brand' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="rounded p-3 flex flex-col gap-1"
              style={{ background: 'var(--color-surface)', border: `1px solid ${blueAlpha(0.2)}` }}>
              <p className="text-[10px] font-mono font-bold" style={{ color: blue }}>{label}</p>
              <p className="text-sm font-bold font-mono" style={{ color: 'var(--color-text)' }}>{value}</p>
              <p className="text-[10px]" style={{ color: 'var(--color-subtle)' }}>{sub}</p>
            </div>
          ))}
        </div>
        <ACallout type="warn">
          <span className="font-mono font-bold" style={{ color: warn }}>CEILING: </span>
          This is a developer tool. The TAM is form backends — Formspree, Netlify Forms, Basin.
          Real market, real revenue, but you will not reach non-technical business owners through this plan.
          The goal here is <em>first revenue fast</em>, not scale. Get to $2–5k MRR on this,
          then make a clear-eyed decision about Plans B and C.
        </ACallout>
      </div>

      {/* Architecture */}
      <div className="flex flex-col gap-3">
        <ASection title="Architecture" sub="The free tier already works. The gateway is a proxy layer on top." />
        <ACard>
          <ALabel>Free tier (already shipped) — provisioning only</ALabel>
          <ACode>{`Provisioning (one-time, user's OAuth token):
  rgforms → Google APIs → creates Sheet + Apps Script → deploys → done

Runtime (every submission — rgforms NOT involved):
  Browser → POST script.google.com/.../exec
          → Apps Script doPost() → appends row to Sheet → sends email
          → rgforms never sees the submission payload. Ever.`}
          </ACode>
          <p className="text-xs" style={{ color: 'var(--color-subtle)' }}>
            "Architecturally incapable of accessing your data" is a sentence no competitor can say.
            Especially valuable for healthcare-adjacent or privacy-conscious buyers.
          </p>
        </ACard>
        <ACard>
          <ALabel>Gateway tier — the proxy layer that unlocks paid features</ALabel>
          <ACode>{`Runtime (paid tiers — rgforms in the path):
  Browser → POST rg.fm/acme/contact
          → Next.js middleware: rate limit · billing check · CORS
          → Gateway route: look up slug → { scriptId, userId, refreshToken }
          → Mint fresh access token from stored refresh token
          → POST googleapis.com/v1/scripts/{scriptId}:run { function: 'doPost' }
          → Script runs in user's account → appends to their Sheet
          → rgforms logs metadata only (timestamp, moduleId, status)
          → fire webhooks → store payload (paid tiers) → return to browser

Key unlock: scripts deployed as "Only myself" — never reachable via public URL.
Gateway calls scripts.run API authenticated by stored OAuth refresh token.
No "visit this URL once" step. No 90-character Google URL in embed code.`}
          </ACode>
        </ACard>
        <ACard>
          <ALabel>HIPAA — real advantage, narrow scope</ALabel>
          <ABullet items={[
            'Free tier: rgforms never in the data path at runtime. If user has Google Workspace BAA, entire data flow is covered.',
            'Gateway tier: rgforms stores a refresh token and logs submission metadata — this requires a BAA with rgforms.',
            'Free tier = no BAA needed. Gateway tier = BAA needed, planned for Enterprise.',
            '"Architecturally incapable of accessing your PHI" applies to free tier only — be precise.',
          ]} />
        </ACard>
      </div>

      {/* Pricing */}
      <div className="flex flex-col gap-3">
        <ASection title="Gateway Pricing Tiers" sub="All gateway tiers: private execution via scripts.run API, server-side email, no manual script auth." />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              name: 'Builder', price: '$9', tag: null, highlight: false,
              features: ['3 projects, 10 modules', 'Short URLs (rg.fm/your-form)', 'No manual script auth', '5,000 submissions / month', 'Submission inbox (last 500)', 'Basic analytics', 'Remove badge'],
              target: 'Freelancers, client sites, small blogs.',
              hook: 'Needs webhooks or per-project API keys.',
            },
            {
              name: 'Pro', price: '$24', tag: 'BEST VALUE', highlight: true,
              features: ['Unlimited projects & modules', 'Vanity slugs (rg.fm/acme/contact)', '50,000 submissions / month', 'Full analytics', 'Webhooks (unlimited)', 'CORS + IP allowlist', 'API keys per project', 'CSV export'],
              target: 'Small agencies, growing startups, teams of 1–3.',
              hook: 'Needs team seats or custom domain.',
            },
            {
              name: 'Business', price: '$59', tag: null, highlight: false,
              features: ['Everything in Pro', 'Hosted Firestore storage', 'Team seats (5 + $8/seat)', 'Custom domain (api.yourco.com)', '500k submissions / month', 'Priority support + SLA', 'BAA — Enterprise roadmap'],
              target: 'Established agencies, high-traffic API users.',
              hook: 'Needs enterprise volume or team management.',
            },
          ].map(({ name, price, tag, highlight, features, target, hook }) => (
            <div key={name} className="rounded-lg border p-4 flex flex-col gap-3"
              style={{
                background: highlight ? blueAlpha(0.06) : 'var(--color-surface)',
                borderColor: highlight ? blueAlpha(0.40) : 'var(--color-border)',
                borderWidth: highlight ? 1.5 : 1,
              }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold font-mono" style={{ color: 'var(--color-text)' }}>{name}</p>
                    {tag && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{ color: blue, background: blueAlpha(0.12), border: `1px solid ${blueAlpha(0.3)}` }}>
                        {tag}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-0.5 mt-1">
                    <span className="text-xl font-bold font-mono" style={{ color: highlight ? blue : 'var(--color-text)' }}>{price}</span>
                    <span className="text-xs font-mono" style={{ color: 'var(--color-subtle)' }}>/mo</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                    <span className="shrink-0 mt-0.5 font-bold" style={{ color: green }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <div className="pt-2" style={{ borderTop: `1px solid ${blueAlpha(0.15)}` }}>
                <p className="text-[10px] font-mono" style={{ color: 'var(--color-subtle)' }}>→ {target}</p>
                <p className="text-[10px] font-mono mt-0.5" style={{ color: blue }}>↑ {hook}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade triggers */}
      <div className="flex flex-col gap-3">
        <ASection title="Upgrade Triggers" sub="The specific moments free users become paying customers." />
        <div className="flex flex-col gap-2">
          {[
            { t: 'The URL conversation', d: 'Developer shows a client their contact form. Client sees script.google.com/macros/d/AKfycbx… in the browser. Client asks "can we have a real URL?" Developer upgrades to Builder ($9). This is the highest-converting trigger.' },
            { t: 'Second credit pack friction', d: "User buys their second credit pack ($15). They've now spent $15 on provisions alone. Builder at $9/mo is obviously better value. Show the comparison at checkout." },
            { t: 'Submission count curiosity', d: '"Your contact form got 847 submissions this month." Count visible, contents aren\'t. The desire to see who submitted drives upgrades. Surface this prominently.' },
            { t: 'Manual authorization', d: 'The "visit this URL once in your browser" step breaks on client handoffs. Documented as a free-tier limitation. Gateway removes it.' },
            { t: 'Badge on client deliverable', d: '"Powered by rgforms" on a form confirmation page. Any agency building for a paying client will upgrade to remove it.' },
            { t: 'Email quota hit', d: 'Free Gmail: 100 notification emails/day. Gateway sends server-side via Resend/Nodemailer — bypasses Apps Script quotas entirely.' },
          ].map(({ t, d }) => (
            <div key={t} className="flex items-start gap-3 rounded p-3"
              style={{ background: 'var(--color-surface)', border: `1px solid ${blueAlpha(0.15)}` }}>
              <span className="shrink-0 font-bold font-mono text-sm" style={{ color: blue }}>›</span>
              <div>
                <p className="text-xs font-mono font-semibold" style={{ color: 'var(--color-text)' }}>{t}</p>
                <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--color-muted)' }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Build phases */}
      <div className="flex flex-col gap-3">
        <ASection title="Build Phases" sub="Three phases. Phase 1 alone is a chargeable product." />
        <APhase n={1} title="The Gateway" timeline="4–6 weeks" cost="~$0 added infra"
          outcome="A chargeable product. Short URLs work, Stripe is wired, billing limits enforced."
          steps={[
            "Remove output: 'export' from next.config.ts — enable Next.js server mode",
            'Firestore: users, projects, sessions, short URLs, encrypted refresh tokens',
            'Backend session: Google OAuth → JWT in httpOnly cookie + Firestore session doc',
            'Short URL table: { slug, scriptId, userId } — Next.js middleware resolves to script',
            'Gateway route: validate → log metadata → mint access token → call scripts.run → return',
            'Billing: check Firestore submission count before forwarding, 429 if over limit',
            'Stripe Checkout + webhook: subscription billing, update plan in Firestore',
            'Server-side emails: Resend/Nodemailer instead of MailApp, bypasses quota limits',
          ]}
        />
        <APhase n={2} title="Analytics + Webhooks" timeline="4–6 weeks" cost="~$50/mo"
          outcome="Features that justify Pro pricing. Users have a reason to stay and upgrade."
          steps={[
            'Submission inbox: store payloads for paying users in Firestore',
            'Analytics dashboard: volume, error rate, latency from Firestore counter docs',
            'Webhook system: async delivery to user-configured URLs on each POST',
            'API key system: issue keys per project, validate in gateway middleware',
            'CORS + IP allowlist: validate in gateway, return 403 with clear error',
            'Vanity slugs: Pro users set rg.fm/acme/contact paths',
            'CSV export of submission inbox',
          ]}
        />
        <APhase n={3} title="Hosted Storage Tier" timeline="When Phase 2 profitable" cost="~$200/mo"
          outcome="Business tier unlocked. Data lives in Firestore. Query params. Custom domains."
          steps={[
            'Business tier: write submissions to Firestore instead of routing through Sheets API',
            'Google Sheet kept as user-owned backup and spreadsheet view',
            'Query params: ?where=published:true&sort=created_at:desc&limit=20',
            'Custom domain routing: api.yourco.com → gateway via CNAME + SSL',
            'Team collaboration: invite by email, role-based access',
          ]}
        />
      </div>

      {/* Revenue */}
      <div className="flex flex-col gap-3">
        <ASection title="Revenue Projections" sub="Conservative. 2–5% free-to-paid conversion (industry standard for developer freemium)." />
        <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${blueAlpha(0.25)}` }}>
          <div className="grid px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider"
            style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', background: blueAlpha(0.08), borderBottom: `1px solid ${blueAlpha(0.2)}`, color: blue }}>
            <span>Month</span><span>Free users</span><span>Paid (3%)</span><span>Avg plan</span><span>MRR</span>
          </div>
          {[
            { mo: '3', f: '200', p: '6', avg: '$9', mrr: '$54' },
            { mo: '6', f: '800', p: '24', avg: '$11', mrr: '$264' },
            { mo: '9', f: '2,000', p: '60', avg: '$14', mrr: '$840' },
            { mo: '12', f: '5,000', p: '150', avg: '$16', mrr: '$2,400' },
          ].map(({ mo, f, p, avg, mrr }, i) => (
            <div key={mo} className="grid px-4 py-2.5 text-xs font-mono"
              style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', borderBottom: `1px solid ${blueAlpha(0.1)}`, background: i % 2 === 0 ? 'var(--color-surface)' : 'transparent', color: 'var(--color-muted)' }}>
              <span>Mo {mo}</span><span>{f}</span><span>{p}</span><span>{avg}</span>
              <span className="font-bold" style={{ color: green }}>{mrr}</span>
            </div>
          ))}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
          3% free-to-paid is the realistic baseline for a developer freemium. At $2,400 MRR (Month 12),
          the gateway tier is profitable but not a business on its own. The value is what you learn and
          the infrastructure you now have to support Plans B and C.
        </p>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Plan B — The Service Model
// Visual identity: Warm amber, human-centered, business pitch feel.
// Larger headings, story-driven callouts, warm border treatments.
// ─────────────────────────────────────────────────────────────────────────────

function PlanBTab() {
  const amber = 'oklch(0.73 0.17 65)';
  const amberA = (a: number) => `oklch(0.73 0.17 65 / ${a})`;
  const warnRed = 'oklch(0.68 0.18 25)';
  const warnRedA = (a: number) => `oklch(0.68 0.18 25 / ${a})`;
  const green = 'oklch(0.72 0.18 145)';

  function BSection({ title, sub }: { title: string; sub?: string }) {
    return (
      <div className="pb-3 mb-1" style={{ borderBottom: `3px solid ${amberA(0.35)}` }}>
        <p className="text-base font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{title}</p>
        {sub && <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>{sub}</p>}
      </div>
    );
  }

  function BCard({ children, highlighted }: { children: React.ReactNode; highlighted?: boolean }) {
    return (
      <div className="rounded-2xl p-5 flex flex-col gap-3"
        style={{
          background: highlighted ? amberA(0.06) : 'var(--color-surface)',
          border: `1.5px solid ${highlighted ? amberA(0.40) : 'var(--color-border)'}`,
        }}>
        {children}
      </div>
    );
  }

  function BStory({ children }: { children: React.ReactNode }) {
    return (
      <div className="rounded-2xl p-5 text-sm leading-relaxed"
        style={{
          background: amberA(0.07),
          border: `1.5px solid ${amberA(0.35)}`,
          color: 'var(--color-muted)',
          borderLeft: `4px solid ${amber}`,
        }}>
        {children}
      </div>
    );
  }

  function BWarn({ children }: { children: React.ReactNode }) {
    return (
      <div className="rounded-2xl p-5 text-sm leading-relaxed"
        style={{
          background: warnRedA(0.06),
          border: `1.5px solid ${warnRedA(0.35)}`,
          color: 'var(--color-muted)',
          borderLeft: `4px solid ${warnRed}`,
        }}>
        {children}
      </div>
    );
  }

  function BLabel({ children }: { children: React.ReactNode }) {
    return <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{children}</p>;
  }

  function BBullet({ items, strike }: { items: string[]; strike?: boolean }) {
    return (
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            <span className="shrink-0 mt-0.5 text-base" style={{ color: strike ? warnRed : amber }}>
              {strike ? '✕' : '•'}
            </span>
            <span style={{ textDecoration: strike ? 'none' : 'none' }}>{item}</span>
          </div>
        ))}
      </div>
    );
  }

  function BMoney({ value, label }: { value: string; label: string }) {
    return (
      <div className="flex flex-col items-center gap-0.5 rounded-2xl p-4"
        style={{ background: amberA(0.08), border: `1px solid ${amberA(0.25)}` }}>
        <span className="text-2xl font-bold" style={{ color: amber }}>{value}</span>
        <span className="text-xs text-center leading-snug" style={{ color: 'var(--color-subtle)' }}>{label}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-9">

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Plan B — The Service Model
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            Done-for-you websites for non-technical business owners. Vertical-first. Starts manual, productizes later.
          </p>
        </div>
        <BStory>
          <span className="font-bold" style={{ color: amber }}>The origin story: </span>
          A friend called. He wanted a site for his real estate wholesale business.
          He&apos;d already bought a domain and started on Squarespace but couldn&apos;t get it to look professional
          or add forms that actually worked the way he needed. He wanted sellers to find him online and submit
          property information — that&apos;s it. He just needed the digital stamp and the leads to flow in.
          This is the product. Not a platform. Not a Squarespace competitor. A specific solution for a specific person
          who exists in every city in the country.
        </BStory>
        <BWarn>
          <span className="font-bold" style={{ color: warnRed }}>The hard truth about your friend: </span>
          He called you because he knows you — not because he found your product.
          The real question isn&apos;t &ldquo;is there value for him?&rdquo; It&apos;s &ldquo;how does the next person
          like him find you instead of Durable or GoDaddy AI Builder?&rdquo; He won&apos;t search &ldquo;Google Sheets website
          builder.&rdquo; He&apos;ll search &ldquo;website for real estate investor&rdquo; and land on whoever ranks or advertises.
          The answer to this question is the entire business plan.
        </BWarn>
      </div>

      {/* What the customer gets */}
      <div className="flex flex-col gap-4">
        <BSection title="What the customer buys vs. what runs underneath"
          sub="The customer never sees the words 'Apps Script,' 'Google Sheets,' or 'provisioning.'" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BCard highlighted>
            <BLabel>What the customer sees</BLabel>
            <BBullet items={[
              "A beautiful website at their domain that looks better than what they'd build on Squarespace",
              'A form where sellers (or clients) submit their information',
              'An email notification every time someone fills out the form',
              'A simple spreadsheet where all their leads accumulate, ready to work',
              'A site they can tell people about and feel proud of',
            ]} />
          </BCard>
          <BCard>
            <BLabel>What runs underneath (invisible to them)</BLabel>
            <BBullet items={[
              'Google Apps Script deployed in their own Google account',
              'A Google Sheet in their own Drive collecting every lead',
              "The sheet is their CMS — but they don't know it as a CMS, they just open it like a spreadsheet",
              'rgforms provisioned it all in 90 seconds; the customer never touched any of it',
              "If rgforms disappears tomorrow, their site keeps working and their leads keep coming in",
            ]} />
          </BCard>
        </div>
        <BCard>
          <BLabel>The notification email is the primary interface</BLabel>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Most non-technical users will never open their Google Sheet. They&apos;ll get an email that says
            &ldquo;New lead from John Smith — 123 Main St, 3bed/2bath, asking $180k, motivated seller.&rdquo; That&apos;s
            the product. The Sheet is a bonus for the 20% who want to organize and filter their leads.
            Design around the email first, the Sheet second.
          </p>
        </BCard>
      </div>

      {/* Pricing */}
      <div className="flex flex-col gap-4">
        <BSection title="Pricing — one plan, no tier ladder"
          sub="Non-technical buyers don't want to choose a plan. They want one answer at one price." />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BCard>
            <BLabel>Free — lead magnet only</BLabel>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Subdomain (acmewholesale.rgforms.app), rgforms badge, 1 lead form.
              Lets people try it. Not a real product — just enough to feel the value
              and feel the friction (the ugly URL, the badge).
            </p>
          </BCard>
          <BCard highlighted>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold" style={{ color: amber }}>$12</span>
              <span className="text-sm" style={{ color: 'var(--color-muted)' }}>/mo — the only plan</span>
            </div>
            <BBullet items={[
              'Custom domain (the one they already bought)',
              'No badge',
              'All modules for their vertical',
              'Unlimited form submissions',
              'Lead notification emails',
              'Google Sheet with all leads',
            ]} />
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
              Squarespace is $16–49/mo and data is theirs. You&apos;re $12/mo and they own everything.
              This should be an easy yes.
            </p>
          </BCard>
          <BCard>
            <BLabel>$299 one-time — &ldquo;we build it for you&rdquo;</BLabel>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              You spend 2 hours. They get a finished, polished site — logo placed, copy written,
              forms configured, domain connected. They go on the $12/mo plan forever.
            </p>
            <div className="rounded-xl p-3 flex flex-col gap-1"
              style={{ background: amberA(0.08), border: `1px solid ${amberA(0.25)}` }}>
              <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>Unit economics per done-for-you customer:</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Setup: $299 − $10 infra = <span className="font-bold" style={{ color: green }}>$289 profit</span></p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Recurring: $12/mo − $0.03 infra = <span className="font-bold" style={{ color: green }}>$11.97/mo</span></p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>24-month LTV: $299 + ($11.97 × 24) = <span className="font-bold" style={{ color: green }}>$586</span></p>
            </div>
          </BCard>
        </div>
        <BStory>
          <span className="font-bold" style={{ color: amber }}>Why the done-for-you tier is the unlock: </span>
          It&apos;s the highest-margin item in your catalog and the easiest to sell to this customer.
          Your friend would have paid $300 to never touch it himself. Most SaaS founders refuse to do this
          because &ldquo;it doesn&apos;t scale.&rdquo; It doesn&apos;t have to scale —
          it has to fund the next six months while you figure out what does.
          Do 50 of these manually. Watch what every customer struggles with.
          The AI provisioning flow in Plan C is built from that data.
        </BStory>
      </div>

      {/* Vertical strategy */}
      <div className="flex flex-col gap-4">
        <BSection title="The vertical strategy — why this beats 'any business'"
          sub="'AI website builder for any business' is a crowded ocean. 'Website for real estate wholesalers' is a pond with two competitors." />
        <BCard highlighted>
          <BLabel>Vertical 1: Real estate investors / wholesalers (start here)</BLabel>
          <BBullet items={[
            'Your friend is in this market. You understand the language and the problem.',
            'Very large community: BiggerPockets (2M+ members), local REI groups in every city, active Facebook groups',
            'Clear, specific need: a site that collects seller leads with specific property information fields',
            'They are NOT technical. They use Squarespace, Carrot.com, or a freelancer-built site.',
            'Carrot.com charges $49–149/mo for basically this product. You undercut at $12/mo with data ownership.',
            'The language they use: "motivated seller website," "wholesale buyer\'s list," "property submission form"',
          ]} />
          <div className="rounded-xl p-3 text-xs font-mono leading-loose"
            style={{ background: 'var(--color-surface-2)', border: `1px solid ${amberA(0.2)}`, color: 'var(--color-muted)' }}>
            {`Forms a real estate wholesaler actually needs:
  Seller intake:   address | beds/baths | condition | asking price
                   timeline | mortgage balance | why selling | contact info
  Buyer criteria:  name | email | markets | price range | property types
                   cash buyer? | closing timeline | experience level
  Agent referral:  name | email | referral name | property address | commission split`}
          </div>
        </BCard>
        <BCard>
          <BLabel>Verticals 2–3: expand after Vertical 1 has 25+ customers</BLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { v: 'Local service businesses', d: 'Plumbers, landscapers, cleaners, contractors. Need: quote request form + service area + testimonials. Currently: Wix or nothing. Community: Nextdoor, local Facebook groups, Alignable.' },
              { v: 'Solo professionals', d: 'Lawyers, accountants, therapists, consultants. Need: clean site + intake form + meeting booking. Currently: Squarespace or Calendly-only. Community: LinkedIn, bar associations, local chambers.' },
            ].map(({ v, d }) => (
              <div key={v} className="rounded-xl p-3 flex flex-col gap-1.5"
                style={{ background: amberA(0.05), border: `1px solid ${amberA(0.2)}` }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{v}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{d}</p>
              </div>
            ))}
          </div>
        </BCard>
      </div>

      {/* Acquisition */}
      <div className="flex flex-col gap-4">
        <BSection title="How to actually get the first 50 clients"
          sub="Not SEO, not Product Hunt, not Hacker News. Those channels reach developers. Your buyer is not a developer." />
        <div className="flex flex-col gap-3">
          {[
            {
              ch: '1. The origin story as content',
              effort: 'Low effort, high signal',
              d: "Write the story about building your friend's site. Post it in BiggerPockets, REI Facebook groups, local real estate investor Meetup communities. \"My friend needed a seller website, Squarespace was too hard, here's what I built him — $12/mo.\" Link to his live site. People in that community will DM you.",
            },
            {
              ch: '2. Done-for-you as the acquisition channel',
              effort: 'High effort, builds referral engine',
              d: "Offer to build the first 5 sites free (or at cost) in exchange for a testimonial and referrals. Real estate investors talk to each other constantly. One happy customer in a local REI group is worth 10 Google Ads. The $299 done-for-you fee comes later once you have proof.",
            },
            {
              ch: '3. Targeted Facebook/Instagram ads in specific markets',
              effort: 'Paid, scalable once validated',
              d: 'Target: real estate investors in specific metro areas. Ad copy: "Wholesale website with motivated seller form — $12/mo. Less than Squarespace. Your leads go straight to your Google Sheet." Budget: $10–20/day. Cost per trial: probably $8–15 if copy is specific enough.',
            },
            {
              ch: '4. Local networking (REIA meetings)',
              effort: 'Time-intensive, high conversion',
              d: "Every city has a REIA (Real Estate Investors Association) that meets monthly. Bring a laptop. Show the product live. $12/mo is a non-decision for someone who's writing $50k contracts. Offer to set it up at the meeting for anyone who wants it ($299 done-for-you).",
            },
          ].map(({ ch, effort, d }) => (
            <div key={ch} className="rounded-2xl p-4 flex flex-col gap-2"
              style={{ background: 'var(--color-surface)', border: `1.5px solid var(--color-border)` }}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{ch}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0 font-semibold"
                  style={{ color: amber, background: amberA(0.12), border: `1px solid ${amberA(0.3)}` }}>
                  {effort}
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What to build */}
      <div className="flex flex-col gap-4">
        <BSection title="What to build — and what NOT to build"
          sub="The 'not' list is as important as the 'yes' list. Scope kills service businesses." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BCard highlighted>
            <BLabel>Build this for v1</BLabel>
            <BBullet items={[
              '3 vertical templates only: real estate investor, local service business, solo professional',
              '8 modules that cover 90% of small business needs: hero, services, testimonials, faq, gallery, blog, contact form, intake form',
              '3 visual styles: Professional (clean/navy), Warm (friendly/approachable), Bold (modern/high-contrast)',
              'Subdomain + custom domain connection (CNAME + guided DNS)',
              'Lead notification emails from Apps Script (100/day free Gmail, 1500/day Workspace)',
              'Google Sheet per site with all submissions accumulating',
              'Simple dashboard: site URL, "Open your Sheet," module toggles',
            ]} />
          </BCard>
          <BCard>
            <BLabel>Do NOT build for v1</BLabel>
            <BBullet strike items={[
              '9 visual styles — your buyer doesn\'t want choices. They want one good answer.',
              '25 modules — build the 8 that cover real estate, service, and solo pro. Nothing else.',
              'Next.js export — your buyer will never use it. Add when developers adopt the platform.',
              'White-label agency tier — a completely different sale, different support, different pricing.',
              'AI provisioning — do the first 50 manually. Learn what the AI actually needs to generate correctly.',
              'Full DNS management dashboard — CNAME instructions are enough for v1.',
              'Multiple sites per account — one site per customer is the whole use case.',
            ]} />
          </BCard>
        </div>
      </div>

      {/* Competitive */}
      <div className="flex flex-col gap-4">
        <BSection title="Competitive reality — honest"
          sub="The actual competition is not Formspree. It's Durable, Carrot, Wix AI, and Squarespace." />
        <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid var(--color-border)` }}>
          <div className="grid px-5 py-2.5 text-xs font-bold"
            style={{ gridTemplateColumns: '1fr 1fr 1.5fr 1.5fr', background: amberA(0.08), borderBottom: `1px solid var(--color-border)`, color: amber }}>
            <span>Competitor</span><span>Price</span><span>Their strength</span><span>Your wedge</span>
          </div>
          {[
            { c: 'Carrot.com', p: '$49–149/mo', s: 'Built for real estate specifically. SEO-optimized templates.', w: '4× cheaper. Data in your Google account. They don\'t own your leads.' },
            { c: 'Durable.co', p: '$15/mo', s: 'AI builds site in 30 seconds. 200k+ users. Big brand awareness.', w: 'Vertical-specific forms. Your data stays in Google. They don\'t offer real estate intake forms.' },
            { c: 'Wix AI Builder', p: '$17–36/mo', s: 'Huge distribution, brand recognition, templates.', w: 'Their data is locked in Wix. Your leads are in your Google Sheet, always.' },
            { c: 'Squarespace', p: '$16–49/mo', s: 'Design quality. Brand credibility.', w: 'Forms are notoriously janky. Data locked. DNS setup confusing. You\'re $12 and set it up for them.' },
            { c: 'GoDaddy Website Builder', p: '$10–25/mo', s: 'Sold alongside domain purchase.', w: 'Terrible design output. Their forms don\'t send real-time emails reliably.' },
          ].map(({ c, p, s, w }, i) => (
            <div key={c} className="grid px-5 py-3 text-xs items-start gap-2"
              style={{ gridTemplateColumns: '1fr 1fr 1.5fr 1.5fr', borderBottom: `1px solid var(--color-border)`, background: i % 2 === 0 ? 'var(--color-surface)' : 'transparent' }}>
              <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{c}</span>
              <span style={{ color: 'var(--color-muted)' }}>{p}</span>
              <span style={{ color: 'var(--color-muted)' }}>{s}</span>
              <span style={{ color: green }}>{w}</span>
            </div>
          ))}
        </div>
        <BWarn>
          <span className="font-bold" style={{ color: warnRed }}>The Durable problem: </span>
          &ldquo;Describe your business, AI builds your site in 30 seconds&rdquo;
          is Durable&apos;s exact pitch from 2023. They have 200,000+ users and real distribution. You cannot
          beat them on that feature alone. You beat them by being specific where they&apos;re generic:
          real estate intake forms with the right fields, not a generic contact form.
          The vertical specificity is the moat, not the AI.
        </BWarn>
      </div>

      {/* The moat */}
      <div className="flex flex-col gap-4">
        <BSection title="The real moat — what no competitor can say"
          sub="These three claims are simultaneously true. None of the competitors above can make all three." />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { claim: 'Your leads are yours forever', detail: "They accumulate in a Google Sheet in your own Google account. If you cancel, stop paying, or we disappear — your data is still there. No other builder can say this. Squarespace, Wix, Durable all hold your form data hostage." },
            { claim: 'The forms actually work', detail: "Every submission emails you instantly, from Google's servers, with the exact fields that matter for your business. Squarespace forms are notoriously unreliable. GoDaddy's are worse. Ours are built on the same infrastructure that handles billions of Gmail emails." },
            { claim: 'Less than Squarespace, more than nothing', detail: "$12/mo is below the psychological 'is this worth it?' threshold for someone writing $50k contracts. The positioning isn't 'cheap alternative to Squarespace' — it's 'less than a Starbucks run a week for a professional digital presence.'" },
          ].map(({ claim, detail }) => (
            <div key={claim} className="rounded-2xl p-5 flex flex-col gap-2"
              style={{ background: amberA(0.07), border: `1.5px solid ${amberA(0.35)}` }}>
              <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{claim}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue */}
      <div className="flex flex-col gap-4">
        <BSection title="Revenue model — the first 6 months"
          sub="Manual. Unsexy. The goal is 50 paying customers and enough signal to decide on Plan C." />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-1">
          <BMoney value="$289" label="profit per done-for-you setup" />
          <BMoney value="$11.97" label="net recurring / customer / mo" />
          <BMoney value="$586" label="24-month LTV per customer" />
          <BMoney value="~$5/mo" label="total infra cost" />
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid var(--color-border)` }}>
          <div className="grid px-5 py-2.5 text-xs font-bold"
            style={{ gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr', background: amberA(0.08), borderBottom: `1px solid var(--color-border)`, color: amber }}>
            <span>Month</span><span>Done-for-you</span><span>Self-serve $12</span><span>Setup fees</span><span>Total rev</span>
          </div>
          {[
            { mo: '1–2', dfy: '5 (free/discounted)', ss: '0', fees: '$0', rev: '$60 MRR' },
            { mo: '3', dfy: '5 at $299', ss: '5', fees: '$1,495', rev: '$1,555' },
            { mo: '4', dfy: '8 at $299', ss: '12', fees: '$2,392', rev: '$2,536' },
            { mo: '5', dfy: '10 at $299', ss: '22', fees: '$2,990', rev: '$3,254' },
            { mo: '6', dfy: '10 at $299', ss: '35', fees: '$2,990', rev: '$3,410 + $420 MRR' },
          ].map(({ mo, dfy, ss, fees, rev }, i) => (
            <div key={mo} className="grid px-5 py-3 text-xs items-start"
              style={{ gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr', borderBottom: `1px solid var(--color-border)`, background: i % 2 === 0 ? 'var(--color-surface)' : 'transparent', color: 'var(--color-muted)' }}>
              <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{mo}</span>
              <span>{dfy}</span><span>{ss}</span><span>{fees}</span>
              <span className="font-bold" style={{ color: green }}>{rev}</span>
            </div>
          ))}
        </div>
        <BCard>
          <BLabel>The decision gate at month 6</BLabel>
          <BBullet items={[
            'If you have 50+ customers and referrals are coming in: you have product-market fit. Build Plan C.',
            'If you have 50+ customers but retention is poor (churn >5%/mo): fix the product before scaling.',
            'If you have <20 customers after 6 months of effort: the vertical or pricing is wrong. Pivot the vertical, not the architecture.',
            'The data from 50 done-for-you builds is the market research for Plan C\'s AI provisioning. Don\'t skip this.',
          ]} />
        </BCard>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Plan C — Platform Vision
// Visual identity: Violet/purple, ambitious, futuristic, data-heavy.
// Dark card surfaces, bold metrics, structural code blocks, phase gates.
// ─────────────────────────────────────────────────────────────────────────────

function PlanCTab() {
  const violet = 'oklch(0.63 0.24 295)';
  const violetA = (a: number) => `oklch(0.63 0.24 295 / ${a})`;
  const green = 'oklch(0.72 0.18 145)';
  const warn = 'oklch(0.70 0.16 30)';
  const warnA = (a: number) => `oklch(0.70 0.16 30 / ${a})`;

  function CSection({ title, sub }: { title: string; sub?: string }) {
    return (
      <div className="flex flex-col gap-1 pb-3 mb-1" style={{ borderBottom: `1px solid ${violetA(0.3)}` }}>
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 rounded-full shrink-0" style={{ background: violet }} />
          <p className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--color-text)' }}>{title}</p>
        </div>
        {sub && <p className="text-xs ml-4" style={{ color: 'var(--color-subtle)' }}>{sub}</p>}
      </div>
    );
  }

  function CCard({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
    return (
      <div className="rounded-xl p-4 flex flex-col gap-3"
        style={{
          background: dark ? violetA(0.08) : 'var(--color-surface)',
          border: `1px solid ${dark ? violetA(0.35) : violetA(0.15)}`,
        }}>
        {children}
      </div>
    );
  }

  function CAlert({ children, type = 'vision' }: { children: React.ReactNode; type?: 'vision' | 'warn' }) {
    const isWarn = type === 'warn';
    return (
      <div className="rounded-xl p-4 text-sm leading-relaxed"
        style={{
          background: isWarn ? warnA(0.07) : violetA(0.07),
          border: `1px solid ${isWarn ? warnA(0.35) : violetA(0.30)}`,
          color: 'var(--color-muted)',
          borderTop: `3px solid ${isWarn ? warn : violet}`,
        }}>
        {children}
      </div>
    );
  }

  function CCode({ children }: { children: string }) {
    return (
      <pre className="rounded-lg p-3 text-xs font-mono leading-loose overflow-x-auto whitespace-pre"
        style={{
          background: 'oklch(0.12 0.02 250 / 0.8)',
          color: 'oklch(0.85 0.05 250)',
          border: `1px solid ${violetA(0.2)}`,
        }}>
        {children}
      </pre>
    );
  }

  function CBullet({ items }: { items: string[] }) {
    return (
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            <span className="shrink-0 mt-0.5 font-bold" style={{ color: violet }}>→</span>
            {item}
          </div>
        ))}
      </div>
    );
  }

  function CLabel({ children }: { children: React.ReactNode }) {
    return (
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: violet }}>{children}</p>
    );
  }

  function CPhase({ n, title, timeline, cost, outcome, steps, gate }: {
    n: number; title: string; timeline: string; cost: string; outcome: string; steps: string[]; gate: string;
  }) {
    return (
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${violetA(0.25)}` }}>
        <div className="flex items-center gap-3 px-4 py-3"
          style={{ background: violetA(0.10), borderBottom: `1px solid ${violetA(0.2)}` }}>
          <div className="flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold font-mono shrink-0"
            style={{ background: violet, color: '#fff' }}>
            {n}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-mono" style={{ color: 'var(--color-subtle)' }}>{timeline}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ color: green, background: `oklch(0.72 0.18 145 / 0.12)` }}>
                {cost}
              </span>
            </div>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <CBullet items={steps} />
          <div className="rounded-lg p-3 text-xs"
            style={{ background: violetA(0.06), border: `1px solid ${violetA(0.2)}`, color: 'var(--color-muted)' }}>
            <span className="font-bold" style={{ color: violet }}>Outcome: </span>{outcome}
          </div>
          <div className="text-[10px] px-2 py-1.5 rounded"
            style={{ background: warnA(0.06), border: `1px solid ${warnA(0.25)}`, color: 'var(--color-subtle)' }}>
            <span className="font-bold" style={{ color: warn }}>Gate: </span>{gate}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-bold" style={{ color: violet }}>Plan C — Platform Vision</p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
              The ambitious website builder. Real architecture. Honest scope. Build this after Plan B proves demand.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded"
              style={{ color: violet, background: violetA(0.12), border: `1px solid ${violetA(0.3)}` }}>
              REQUIRES PLAN B FIRST
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded"
              style={{ color: warn, background: warnA(0.10), border: `1px solid ${warnA(0.3)}` }}>
              40–50 WK BUILD
            </span>
          </div>
        </div>
        <CAlert type="warn">
          <span className="font-bold" style={{ color: warn }}>Prerequisites before starting Plan C: </span>
          50+ paying customers from Plan B. Real data on what the AI needs to generate (from 50 done-for-you builds).
          A decision on the brand (rgforms or a new brand — see below).
          This is a 40–50 week build for one person. Starting it before Plan B validates demand
          is how promising pivots run out of runway.
        </CAlert>
        <CAlert type="vision">
          <span className="font-bold" style={{ color: violet }}>The real differentiator — not what you think: </span>
          Every AI website builder does &ldquo;describe your business, we build your site in 30 seconds.&rdquo;
          Durable launched this in 2023. Wix AI, Framer AI, Squarespace Blueprint followed.
          AI provisioning is table stakes, not a wedge.
          The actual differentiator is: <strong>your content lives in a Google Sheet you own
          and you can export working Next.js source code.</strong> No builder in this space does both.
          Lead with the Sheet and the export. Treat AI as a convenience feature, not the headline.
        </CAlert>
      </div>

      {/* Architecture */}
      <div className="flex flex-col gap-3">
        <CSection title="System Architecture"
          sub="rgforms hosts the website. Apps Script is a JSON data API. One Cloudflare Worker deployment serves every user." />
        <CCard dark>
          <CLabel>Runtime flow — how a page visit works</CLabel>
          <CCode>{`Visitor → yourdomain.com (or username.rgforms.app)
        → Cloudflare CDN: cache hit → serve HTML instantly (~15ms, worldwide)
        → cache miss → invoke Cloudflare Worker

Cloudflare Worker (one deployment, serves ALL user sites):
  1. Read Host header → KV lookup: domain → { userId, siteConfig, scriptUrl }
  2. Parse path: /blog/my-post → { module: 'blog', slug: 'my-post' }
  3. Fetch data: GET scriptUrl?action=data&module=blog (Apps Script JSON API)
     → Apps Script reads Sheet → returns JSON (CacheService, 5-min TTL)
  4. Render HTML: inject data into chosen template, apply style CSS vars
  5. Set Cache-Control: s-maxage=300 → Cloudflare caches for 5 min
  6. Return full SSR HTML with <title>, meta, JSON-LD, GA4 tag, sitemap link

Form submission (free tier — direct to Apps Script, not proxied):
  Browser → POST scriptUrl (doPost) → appends row to Sheet → email notification

Cache invalidation (near real-time):
  User edits Sheet → onEdit trigger → POST /api/purge?siteId=xxx
  → Worker purges site pages from Cloudflare cache
  → next visitor gets fresh HTML within ~1 second`}
          </CCode>
        </CCard>
        <CCard>
          <CLabel>Apps Script — JSON API only, never serves HTML</CLabel>
          <CCode>{`function doGet(e) {
  if (e.parameter.action !== 'data') return jsonErr('invalid_action');
  const rows = getCachedRows(e.parameter.module); // CacheService, 5-min TTL
  return ContentService
    .createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const { module, fields } = JSON.parse(e.postData.contents);
  SpreadsheetApp.getActive()
    .getSheetByName(module + '_submissions')
    .appendRow([new Date(), ...Object.values(fields)]);
  MailApp.sendEmail(OWNER_EMAIL, 'New lead', formatEmail(fields));
  return jsonOk();
}

function onEdit(e) {
  CacheService.getScriptCache().remove(e.range.getSheet().getName());
  UrlFetchApp.fetch(PURGE_URL + '?siteId=' + SITE_ID, { method: 'post' });
}`}
          </CCode>
          <p className="text-xs" style={{ color: 'var(--color-subtle)' }}>
            Apps Script never serves HTML. It is purely a data layer. The Cloudflare Worker owns rendering.
            This separation makes the Next.js export possible — same data source whether rendered by Cloudflare
            or the user&apos;s self-hosted Next.js app.
          </p>
        </CCard>
        <CCard>
          <CLabel>Infrastructure cost — real Cloudflare numbers</CLabel>
          <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${violetA(0.2)}` }}>
            <div className="grid px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider"
              style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr', background: violetA(0.10), borderBottom: `1px solid ${violetA(0.2)}`, color: violet }}>
              <span>Component</span><span>1K sites</span><span>10K sites</span><span>100K sites</span>
            </div>
            {[
              { c: 'Cloudflare Workers (requests)', a: '$5', b: '$15', d: '$100' },
              { c: 'Cloudflare KV (configs + cache)', a: '$0', b: '$5', d: '$30' },
              { c: 'Firestore (user metadata only)', a: '$0', b: '$0', d: '$20' },
              { c: 'Claude Sonnet (AI provisions)', a: '$1', b: '$10', d: '$100' },
              { c: 'Egress fees', a: '$0', b: '$0', d: '$0' },
              { c: 'Total / month', a: '$6', b: '$30', d: '$250' },
            ].map(({ c, a, b, d }, i) => (
              <div key={c} className="grid px-4 py-2 text-xs font-mono"
                style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: `1px solid ${violetA(0.1)}`, background: i % 2 === 0 ? 'var(--color-surface)' : 'transparent' }}>
                <span style={{ color: c.includes('Total') ? 'var(--color-text)' : 'var(--color-muted)', fontWeight: c.includes('Total') ? 700 : 400 }}>{c}</span>
                {[a, b, d].map((v, vi) => (
                  <span key={vi} style={{ color: c.includes('Total') ? green : 'var(--color-muted)', fontWeight: c.includes('Total') ? 700 : 400 }}>{v}</span>
                ))}
              </div>
            ))}
          </div>
          <p className="text-xs" style={{ color: 'var(--color-subtle)' }}>
            Cloudflare does not charge for egress. At 100,000 sites: $250/mo total web infrastructure.
          </p>
        </CCard>
      </div>

      {/* AI provisioning */}
      <div className="flex flex-col gap-3">
        <CSection title="AI Provisioning — honest scope and cost"
          sub="A convenience feature, not the product. Treat it that way in the marketing." />
        <CCard dark>
          <CLabel>The full flow</CLabel>
          <CCode>{`Step 1 — User types a description:
  "I'm a real estate wholesaler in Chicago. I need a site to collect
   seller leads and build a buyer's list."

Step 2 — Claude generates site spec (Sonnet for quality, not Haiku):
  Input:  system prompt + business description      (~1,200 tokens)
  Output: site config JSON + seed data per module   (~6,000 tokens)
  Cost:   ~$0.05/provision with Sonnet (not $0.008)
  Time:   ~3 seconds

  NOTE: Haiku output quality for coherent vertical-specific seed data
  across 8 modules is insufficient. Use Sonnet for paid AI provisions.
  At $0.05/provision and 1,000 provisions/month: $50/mo.

Step 3 — Confirmation screen (editable before committing):
  Site name: Chicago REI Solutions
  Style: Professional (navy/clean)
  Sections: hero · services · testimonials · faq · locations · contact
  Forms: seller-intake · buyer-criteria · contact
  Seed data: 3 services, 2 testimonials, 4 FAQ items (edit in Sheet after)
  Credits: 4

Step 4 — User confirms → 90-second provision → site is live`}
          </CCode>
        </CCard>
      </div>

      {/* Module library */}
      <div className="flex flex-col gap-3">
        <CSection title="Module Library"
          sub="Start with 8 content + 4 form modules. Expand based on what Plan B customers actually need." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CCard>
            <CLabel>Content modules (read from Sheet)</CLabel>
            <div className="flex flex-col gap-0.5">
              {[
                { m: 'hero', d: 'Headline, subhead, CTA, background image' },
                { m: 'services', d: 'Offerings: name, description, price, icon' },
                { m: 'team', d: 'Staff: name, title, bio, photo, social links' },
                { m: 'testimonials', d: 'Reviews: name, quote, rating, company' },
                { m: 'faq', d: 'Q&A pairs, grouped by category' },
                { m: 'gallery', d: 'Photos/portfolio: image (Drive), title, tag' },
                { m: 'blog', d: 'Posts: title, slug, Markdown body, date' },
                { m: 'locations', d: 'Address, hours, phone, Maps embed URL' },
                { m: 'pricing', d: 'Plans: name, price, features, highlight' },
                { m: 'events', d: 'Schedule: title, date, location, ticket URL' },
                { m: 'stats', d: 'Key numbers: label, value, suffix' },
                { m: 'jobs', d: 'Open roles: title, dept, type, apply URL' },
              ].map(({ m, d }) => (
                <div key={m} className="flex items-start gap-2 text-xs py-1.5" style={{ borderBottom: `1px solid ${violetA(0.10)}` }}>
                  <code className="text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0"
                    style={{ background: violetA(0.12), color: violet, border: `1px solid ${violetA(0.25)}` }}>
                    {m}
                  </code>
                  <span style={{ color: 'var(--color-muted)' }}>{d}</span>
                </div>
              ))}
            </div>
          </CCard>
          <div className="flex flex-col gap-4">
            <CCard>
              <CLabel>Form modules (write to Sheet)</CLabel>
              <div className="flex flex-col gap-0.5">
                {[
                  { m: 'contact', d: 'Name, email, message. Universal.' },
                  { m: 'intake', d: 'Custom fields from _config. Any intake form.' },
                  { m: 'booking', d: 'Service, date/time, name, notes.' },
                  { m: 'quote', d: 'Project type, budget, description, RFQ.' },
                  { m: 'newsletter', d: 'Email + first name. Subscribers in Sheet.' },
                  { m: 'apply', d: 'Role, resume (Drive link), cover letter.' },
                ].map(({ m, d }) => (
                  <div key={m} className="flex items-start gap-2 text-xs py-1.5" style={{ borderBottom: `1px solid ${violetA(0.10)}` }}>
                    <code className="text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0"
                      style={{ background: violetA(0.12), color: violet, border: `1px solid ${violetA(0.25)}` }}>
                      {m}
                    </code>
                    <span style={{ color: 'var(--color-muted)' }}>{d}</span>
                  </div>
                ))}
              </div>
            </CCard>
            <CCard>
              <CLabel>Visual styles</CLabel>
              <CBullet items={[
                'Professional — white bg, Inter, navy accent. Law, finance, consulting.',
                'Warm — cream bg, serif headings, earthy tones. Restaurants, wellness, local biz.',
                'Bold — high contrast, large type, accent blocks. Agencies, creatives.',
                'Modern — dark bg, neon accent, code aesthetic. Tech, SaaS.',
                'Minimal — monochrome, tight grid. Portfolio, architects, photographers.',
              ]} />
            </CCard>
          </div>
        </div>
      </div>

      {/* Custom domains */}
      <div className="flex flex-col gap-3">
        <CSection title="Custom Domains — simplified for non-technical users"
          sub="Two paths. Path 1 requires zero DNS knowledge from the user." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CCard dark>
            <CLabel>Path 1 — Buy through rgforms (push this)</CLabel>
            <CCode>{`User types "chicagoreibuys.com"
→ rgforms checks availability (Namecheap API)
→ "Available — $12.99/yr"
→ User pays in Stripe Checkout
→ rgforms registers domain (Namecheap API)
→ Sets nameservers to Cloudflare
→ Adds CNAME record for www
→ SSL provisioned automatically
→ Done — zero user DNS interaction`}
            </CCode>
            <p className="text-xs" style={{ color: 'var(--color-subtle)' }}>Revenue: $2–4 markup/domain/yr. At 2,000 domains: ~$6k/yr passive.</p>
          </CCard>
          <CCard>
            <CLabel>Path 2 — Bring your own (guided)</CLabel>
            <CBullet items={[
              'User enters existing domain',
              'rgforms shows step-by-step with copy-paste DNS records',
              'Live propagation checker turns green when DNS resolves (~15 min avg)',
              'SSL auto-provisioned by Cloudflare once DNS resolves',
              'Visual screenshots for GoDaddy, Namecheap, Google Domains',
            ]} />
          </CCard>
        </div>
      </div>

      {/* Export */}
      <div className="flex flex-col gap-3">
        <CSection title="Export to Next.js — the trust signal"
          sub="No other builder does this. 'You can always leave' makes people more willing to commit." />
        <CCard dark>
          <CLabel>What the exported project contains</CLabel>
          <CCode>{`acme-site/
├── app/
│   ├── layout.tsx              ← GA4, fonts, global CSS
│   ├── page.tsx                ← home (hero + module sections)
│   ├── blog/[slug]/page.tsx    ← blog post (ISR, revalidate: 300)
│   ├── services/page.tsx
│   ├── contact/page.tsx
│   └── sitemap.ts              ← auto-generates sitemap.xml
├── components/modules/         ← only the user's provisioned modules
├── lib/sheets.ts               ← pre-configured with SCRIPT_URL + SHEET_ID
├── .env.example                ← all values pre-filled from provisioning
├── next.config.ts
└── README.md                   ← "deploy to Netlify in 5 steps"

lib/sheets.ts (pre-configured):
  const SCRIPT_URL = process.env.SCRIPT_URL!; // their actual URL, baked in
  export async function getRows<T>(module: string): Promise<T[]> {
    const res = await fetch(\`\${SCRIPT_URL}?action=data&module=\${module}\`,
      { next: { revalidate: 300 } });
    return res.json();
  }`}
          </CCode>
        </CCard>
      </div>

      {/* SEO */}
      <div className="flex flex-col gap-3">
        <CSection title="SEO — complete, automatic"
          sub="Because rgforms hosts the site (not Apps Script), every SEO capability is available." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { t: 'Clean URLs', d: '/blog/my-post, /services, /team — not ?page= query strings. Proper path-based routing from the Cloudflare Worker.' },
            { t: 'Per-page meta tags', d: '<title> and <meta description> from Sheet row or _config fallback. Open Graph for social sharing.' },
            { t: 'JSON-LD structured data', d: 'LocalBusiness (home), BlogPosting (blog posts), FAQPage (faq tab — Google shows as accordion in search), Person (team).' },
            { t: 'Sitemap.xml', d: 'Auto-generated from all published pages and blog slugs. Submit to Google Search Console in one click.' },
            { t: 'Proper HTTP status codes', d: '404 returns 404, not 200. 301 redirects for old slugs. This matters for Google indexing.' },
            { t: 'Google Analytics 4', d: 'GA4 tag injected from ga_id in _config Sheet. User adds their property ID — tracking is automatic.' },
          ].map(({ t, d }) => (
            <div key={t} className="rounded-lg p-3 flex flex-col gap-1"
              style={{ background: 'var(--color-surface)', border: `1px solid ${violetA(0.2)}` }}>
              <p className="text-xs font-bold" style={{ color: violet }}>{t}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive */}
      <div className="flex flex-col gap-3">
        <CSection title="Competitive Landscape — platform level"
          sub="At platform scale you're competing with well-funded companies. Be precise about where you win." />
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${violetA(0.25)}` }}>
          <div className="grid px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider"
            style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', background: violetA(0.10), borderBottom: `1px solid ${violetA(0.2)}`, color: violet }}>
            <span>Competitor</span><span>Funding / scale</span><span>What they lack</span><span>Your only advantage</span>
          </div>
          {[
            { c: 'Durable.co', f: '$22M raised, 200k users', l: 'Data locked. No export. Generic forms.', a: 'Sheet CMS + Next.js export' },
            { c: 'Framer', f: '$27M raised, design-focused', l: 'Complex for non-technical users. No form backend.', a: 'Simpler. Real form-to-Sheet.' },
            { c: 'Wix AI Builder', f: 'Public co, $1.5B revenue', l: 'Data silo. Expensive at scale. No export.', a: 'Data ownership story.' },
            { c: 'Dorik AI', f: 'Bootstrapped, $8M ARR', l: 'No spreadsheet CMS. Forms via Zapier.', a: 'Integrated CMS + forms.' },
            { c: 'Webflow', f: '$140M raised, $213M ARR', l: 'Complex. No non-technical path.', a: 'Easier onboarding, same export.' },
          ].map(({ c, f, l, a }, i) => (
            <div key={c} className="grid px-4 py-2.5 text-xs items-start"
              style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', borderBottom: `1px solid ${violetA(0.12)}`, background: i % 2 === 0 ? 'var(--color-surface)' : 'transparent' }}>
              <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{c}</span>
              <span style={{ color: 'var(--color-muted)' }}>{f}</span>
              <span style={{ color: 'var(--color-muted)' }}>{l}</span>
              <span style={{ color: green }}>{a}</span>
            </div>
          ))}
        </div>
        <CAlert type="warn">
          <span className="font-bold" style={{ color: warn }}>The distribution problem: </span>
          Every competitor above is losing (if they are) on distribution and design quality, not on cost structure
          or technical architecture. Your cost advantage is real — it gives you margin headroom, not customer acquisition.
          You still need a channel. The answer from Plan B: vertical communities + done-for-you services + referral.
          Do not assume the platform will self-distribute.
        </CAlert>
      </div>

      {/* Brand decision */}
      <div className="flex flex-col gap-3">
        <CSection title="The brand decision — separate brand or hard pivot?"
          sub="sheetspin.com positions as form backends. This product is a website builder. They attract different customers." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CCard dark>
            <CLabel>Option A — Separate brand (recommended)</CLabel>
            <CBullet items={[
              'New domain: something like sitecraft.app, sheetsite.co, gridsite.io — domain that says "website" not "form"',
              'rgforms becomes the form backend product (Plan A), separate from the website product',
              'Plan B and Plan C live under the new brand',
              'Advantages: cleaner messaging, different SEO keywords, different customer expectations',
              'Real cost: you split your marketing attention — only do this if Plan B shows real pull',
            ]} />
          </CCard>
          <CCard>
            <CLabel>Option B — Hard pivot from rgforms</CLabel>
            <CBullet items={[
              'rgforms becomes a website builder. Form backend is one feature.',
              'Pro: keep existing user base, existing SEO equity, existing brand awareness',
              'Con: confuses existing developer users. "rgforms" says nothing about websites.',
              'Viable if rgforms has minimal traction and you want a clean break',
              "Not viable if Plan A is generating meaningful MRR — don't abandon paying customers",
            ]} />
          </CCard>
        </div>
      </div>

      {/* Pricing */}
      <div className="flex flex-col gap-3">
        <CSection title="Pricing Tiers — for the platform product"
          sub="The free tier must be genuinely painful in exactly one way: the URL." />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              name: 'Free', price: 'Free', dark: false,
              features: ['username.sitecraft.app', '5 modules', '1 site', 'All styles', 'rgforms badge', '3 credits included'],
              gate: 'Custom domain + badge removal = upgrade.',
            },
            {
              name: 'Launch', price: '$15/mo', dark: false,
              features: ['Custom domain + SSL', 'All modules', '1 site', 'AI provisioning', 'No badge', 'Basic analytics'],
              gate: 'More sites + export = Studio.',
            },
            {
              name: 'Studio', price: '$35/mo', dark: true,
              features: ['Everything in Launch', '3 sites', 'Next.js code export', 'Full analytics', 'Webhooks', 'Priority CDN'],
              gate: 'Unlimited sites + white-label = Agency.',
            },
            {
              name: 'Agency', price: '$75/mo', dark: false,
              features: ['Unlimited sites', 'White-label badge', '5 team seats (+$8)', 'Client dashboard', 'API access'],
              gate: 'Enterprise / BAA: future roadmap.',
            },
          ].map(({ name, price, dark, features, gate }) => (
            <div key={name} className="rounded-xl p-4 flex flex-col gap-3"
              style={{
                background: dark ? violetA(0.10) : 'var(--color-surface)',
                border: `1px solid ${dark ? violetA(0.40) : violetA(0.18)}`,
              }}>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: dark ? violet : 'var(--color-text)' }}>{name}</p>
                <p className="text-xl font-bold mt-0.5" style={{ color: dark ? violet : 'var(--color-text)' }}>{price}</p>
              </div>
              <div className="flex flex-col gap-1">
                {features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                    <span className="shrink-0 mt-0.5" style={{ color: violet }}>→</span>{f}
                  </div>
                ))}
              </div>
              <p className="text-[10px] pt-2 leading-relaxed" style={{ borderTop: `1px solid ${violetA(0.15)}`, color: 'var(--color-subtle)' }}>{gate}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue */}
      <div className="flex flex-col gap-3">
        <CSection title="Revenue Projections — with honest conversion rates"
          sub="2–5% free-to-paid (industry standard). Not 15%. Projections based on Plan B building distribution first." />
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${violetA(0.25)}` }}>
          <div className="grid px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider"
            style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', background: violetA(0.10), borderBottom: `1px solid ${violetA(0.2)}`, color: violet }}>
            <span>Quarter</span><span>Free users</span><span>Paid (4%)</span><span>Avg plan</span><span>MRR</span>
          </div>
          {[
            { q: 'Q1 (launch)', f: '300', p: '12', avg: '$15', mrr: '$180' },
            { q: 'Q2', f: '1,200', p: '48', avg: '$18', mrr: '$864' },
            { q: 'Q3', f: '4,000', p: '160', avg: '$20', mrr: '$3,200' },
            { q: 'Q4', f: '10,000', p: '400', avg: '$22', mrr: '$8,800' },
            { q: 'Y2 Q2', f: '30,000', p: '1,200', avg: '$24', mrr: '$28,800' },
          ].map(({ q, f, p, avg, mrr }, i) => (
            <div key={q} className="grid px-4 py-2.5 text-xs font-mono"
              style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', borderBottom: `1px solid ${violetA(0.10)}`, background: i % 2 === 0 ? 'var(--color-surface)' : 'transparent', color: 'var(--color-muted)' }}>
              <span style={{ color: 'var(--color-text)' }}>{q}</span>
              <span>{f}</span><span>{p}</span><span>{avg}</span>
              <span className="font-bold" style={{ color: green }}>{mrr}</span>
            </div>
          ))}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
          At Y2 Q2 ($28,800 MRR), infra cost is ~$80/mo. Net margin: ~97%.
          These numbers assume Plan B has built real distribution. Without distribution, free user growth is the bottleneck, not conversion.
        </p>
        <CAlert type="warn">
          <span className="font-bold" style={{ color: warn }}>Honest timeline for one person: </span>
          Phase 1 (hosted sites + 3 styles + 8 modules + subdomains) is 8–10 weeks optimistically.
          Phase 2 (AI provisioning + custom domains) is 4–6 weeks.
          Phase 3 (Next.js export + full SEO) is 4–5 weeks.
          Phase 4 (agency dashboard) is 6–8 weeks.
          Total: 22–29 weeks happy path.
          Realistically, with debugging, UX iteration, and support interruptions:{' '}
          <strong>40–50 weeks.</strong> This is a year-long build. Plan accordingly.
        </CAlert>
      </div>

      {/* Build phases */}
      <div className="flex flex-col gap-3">
        <CSection title="Build Phases"
          sub="Each phase is a shippable product. Don't start the next phase until the previous one has paying users." />
        <CPhase n={1} title="Hosted sites — the smallest viable product"
          timeline="8–10 weeks" cost="~$5/mo (Cloudflare Workers Paid)"
          outcome="A hosted website builder at username.sitecraft.app. 3 styles. 8 modules. Real sites. No AI yet."
          steps={[
            'Cloudflare Worker: multi-tenant routing by hostname (KV: domain → userId → site config)',
            'Apps Script template: doGet JSON API + doPost form handler + onEdit cache purge trigger',
            'Provisioning API: create multi-tab Sheet + compile + deploy Script + register site in KV',
            '3 visual styles: Professional, Warm, Bold. 8 core modules. Manual module picker.',
            'Subdomain provisioning: username.sitecraft.app + SSL (Cloudflare custom hostname)',
            'Dashboard: site list, module toggles, style picker, "Open Sheet" link',
            'Badge in footer of every free site',
          ]}
          gate="Don't start Phase 2 until you have 10+ paying users who found you on their own."
        />
        <CPhase n={2} title="AI provisioning + custom domains"
          timeline="4–6 weeks" cost="~$50/mo added (Claude Sonnet)"
          outcome="Non-technical users describe their business and get a live site in 90 seconds. Custom domains unlock Launch tier."
          steps={[
            'Claude Sonnet API: user description → site spec JSON + seed data (use Sonnet, not Haiku, for quality)',
            'Seed data injection: AI-generated rows written into each Sheet tab at provision time',
            'Confirmation screen: module list, style preview, seed data summary, credit cost — editable before committing',
            'Custom domain Path 1: Namecheap API + Stripe Checkout + auto DNS/SSL (push this)',
            'Custom domain Path 2: CNAME instructions + DNS propagation checker + auto SSL',
            'Launch tier billing: Stripe subscriptions + plan enforcement in Worker middleware',
          ]}
          gate="Don't start Phase 3 until AI provisioning has produced 50+ live sites you didn't build yourself."
        />
        <CPhase n={3} title="Next.js export + full SEO"
          timeline="4–5 weeks" cost="~$0 added infra"
          outcome="Studio tier unlocked. Export builds developer trust. Sites are fully SEO-complete."
          steps={[
            "Next.js project generator: zip file with pre-configured lib/sheets.ts + user's module components",
            'sitemap.xml: Worker serves /sitemap.xml from Sheet data (blog slugs + all pages)',
            'JSON-LD per page: LocalBusiness, BlogPosting, FAQPage — auto-built from Sheet rows',
            'Proper 404 status codes + RSS feed from blog module',
            'Studio tier billing + 3-site enforcement',
          ]}
          gate="Don't start Phase 4 until Studio tier has 20+ paying subscribers."
        />
        <CPhase n={4} title="Agency dashboard + white-label"
          timeline="6–8 weeks" cost="~$20/mo added (Firestore multi-seat)"
          outcome="Agencies adopt as white-label platform. Each agency is a distribution channel."
          steps={[
            'Multi-site dashboard: all sites, client names, last-edit times, analytics ping counts',
            'Client access: invite by email → Sheet edit access + view-only dashboard',
            'White-label badge: "Powered by [Agency Name]" — $10/mo add-on',
            'Team seats: Admin / Editor / Viewer roles',
            'Site templates: save configured site → provision new clients from it in 1 click',
          ]}
          gate="This is the scale tier. Only build it if you have evidence agencies want it."
        />
      </div>

    </div>
  );
}

// ─── Tabs shell ───────────────────────────────────────────────────────────────

const TABS = [
  { id: 'plan-a', label: 'Plan A — Gateway', sublabel: 'Existing product · Low risk' },
  { id: 'plan-b', label: 'Plan B — Service', sublabel: 'Done-for-you · Vertical-first' },
  { id: 'plan-c', label: 'Plan C — Platform', sublabel: 'AI builder · Scale vision' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function BusinessPlanTabs() {
  const [active, setActive] = useState<TabId>('plan-a');

  const accentByTab: Record<TabId, string> = {
    'plan-a': 'oklch(0.60 0.20 240)',
    'plan-b': 'oklch(0.73 0.17 65)',
    'plan-c': 'oklch(0.63 0.24 295)',
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          const accent = accentByTab[tab.id];
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className="flex-1 flex flex-col items-center gap-0.5 rounded-lg px-3 py-3 text-sm font-semibold transition-all"
              style={{
                background: isActive ? 'var(--color-bg)' : 'transparent',
                border: isActive ? `1px solid ${accent}` : '1px solid transparent',
                color: isActive ? 'var(--color-text)' : 'var(--color-muted)',
                fontFamily: 'var(--font-display)',
                cursor: 'pointer',
                boxShadow: isActive ? `0 0 0 1px ${accent}20` : 'none',
              }}
            >
              {tab.label}
              <span className="text-[10px] font-normal" style={{ color: isActive ? accent : 'var(--color-subtle)' }}>
                {tab.sublabel}
              </span>
            </button>
          );
        })}
      </div>

      {active === 'plan-a' ? <PlanATab /> : active === 'plan-b' ? <PlanBTab /> : <PlanCTab />}
    </div>
  );
}
