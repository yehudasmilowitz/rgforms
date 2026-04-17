'use client';

import { useState } from 'react';

// ─── Shared primitives ────────────────────────────────────────────────────────

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>
      {children}
    </code>
  );
}
function Strong({ children }: { children: React.ReactNode }) {
  return <strong style={{ color: 'var(--color-text)' }}>{children}</strong>;
}
function Accent({ children }: { children: React.ReactNode }) {
  return <span style={{ color: 'var(--color-accent)' }}>{children}</span>;
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
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{children}</p>
  );
}
function Card({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-3"
      style={{
        background: accent ? 'oklch(0.65 0.22 285 / 0.04)' : 'var(--color-surface)',
        borderColor: accent ? 'oklch(0.65 0.22 285 / 0.25)' : 'var(--color-border)',
      }}
    >
      {children}
    </div>
  );
}
function CodeBlock({ children }: { children: string }) {
  return (
    <div
      className="rounded-lg p-3 text-xs font-mono leading-loose overflow-x-auto whitespace-pre"
      style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}
    >
      {children}
    </div>
  );
}
function BulletList({ items, color }: { items: string[]; color?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
          <span className="shrink-0 mt-0.5 text-xs" style={{ color: color ?? 'var(--color-accent)' }}>→</span>
          {item}
        </div>
      ))}
    </div>
  );
}

// ─── Tier card (gateway tab) ──────────────────────────────────────────────────

function TierCard({ name, price, period = '/mo', highlight = false, tag, features, target, upgradeHook }: {
  name: string; price: string; period?: string; highlight?: boolean; tag?: string;
  features: string[]; target: string; upgradeHook: string;
}) {
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
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide"
                style={{ color: 'oklch(0.65 0.22 285)', background: 'oklch(0.65 0.22 285 / 0.10)', border: '1px solid oklch(0.65 0.22 285 / 0.30)' }}>
                {tag}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold" style={{ color: highlight ? 'var(--color-accent)' : 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
              {price}
            </span>
            {price !== 'Free' && <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{period}</span>}
          </div>
        </div>
      </div>
      <ul className="flex flex-col gap-1.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
            <span className="shrink-0 mt-0.5 text-xs" style={{ color: 'oklch(0.72 0.18 145)' }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-1 pt-1" style={{ borderTop: '1px solid var(--color-border)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-subtle)' }}>Target</p>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{target}</p>
      </div>
      <div className="rounded-lg p-3 text-xs leading-relaxed"
        style={{ background: 'var(--color-surface-2)', borderLeft: '2px solid var(--color-accent)', color: 'var(--color-muted)' }}>
        <span style={{ color: 'var(--color-accent)' }}>Upgrade hook: </span>{upgradeHook}
      </div>
    </div>
  );
}

function PhaseCard({ number, title, timeline, cost, outcome, steps }: {
  number: number; title: string; timeline: string; cost: string; outcome: string; steps: string[];
}) {
  return (
    <div className="rounded-xl border p-5 flex flex-col gap-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold shrink-0"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}>
          {number}
        </div>
        <div className="flex flex-col gap-0.5 flex-1">
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{title}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{timeline}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ color: 'oklch(0.72 0.18 145)', background: 'oklch(0.72 0.18 145 / 0.10)', border: '1px solid oklch(0.72 0.18 145 / 0.30)' }}>
              {cost}
            </span>
          </div>
        </div>
      </div>
      <ul className="flex flex-col gap-1.5 ml-13">
        {steps.map((s) => (
          <li key={s} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
            <span className="shrink-0 mt-0.5 text-xs" style={{ color: 'var(--color-accent)' }}>→</span>
            {s}
          </li>
        ))}
      </ul>
      <div className="rounded-lg p-3 text-xs leading-relaxed font-semibold"
        style={{ background: 'oklch(0.65 0.22 285 / 0.06)', borderLeft: '2px solid var(--color-accent)', color: 'var(--color-text)' }}>
        Outcome: <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>{outcome}</span>
      </div>
    </div>
  );
}

// ─── Starter tab ─────────────────────────────────────────────────────────────

function StarterTab() {
  return (
    <div className="flex flex-col gap-8">

      {/* Architecture */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Architecture</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>How data flows — and where rgforms is not involved</p>
        </div>
        <Card>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            On the free tier, rgforms provisions the infrastructure once and then steps out of the
            way entirely. Every form submission flows directly from the user&apos;s site to Google&apos;s
            Apps Script server to their Google Sheet. rgforms is never in that path at runtime.
          </p>
          <CodeBlock>{`Provisioning (one-time, while user is logged in):
  rgforms → Google APIs (user token) → creates Sheet + Script + deploys code → done

Runtime (every submission, rgforms not involved):
  Browser → POST script.google.com/macros/…/exec
          → Google Apps Script (runs as user, in their account)
          → appends row to their Sheet
          → sends notification email (if configured)`}
          </CodeBlock>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
            The user&apos;s OAuth token is used only during provisioning and never stored.
            After setup completes, rgforms has zero access to submissions or sheet contents.
          </p>
        </Card>

        <Card>
          <SectionLabel>Google Apps Script quotas — know before you promise</SectionLabel>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            The free tier is bound by Google&apos;s platform limits. These are per-account limits,
            not per-module. They apply to the script owner&apos;s Google account.
          </p>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="grid px-4 py-2 text-xs font-semibold uppercase tracking-wider"
              style={{ gridTemplateColumns: '1.5fr 1fr 1fr', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}>
              <span>Quota</span>
              <span>Free Gmail</span>
              <span>Workspace</span>
            </div>
            {[
              { quota: 'Email sends (MailApp)', free: '100 / day', workspace: '1,500 / day' },
              { quota: 'URL Fetch calls (ping)', free: '20,000 / day', workspace: '20,000 / day' },
              { quota: 'Script execution time', free: '6 min / run', workspace: '6 min / run' },
              { quota: 'Concurrent executions', free: '30', workspace: '30' },
              { quota: 'Spreadsheet writes', free: 'Rate-limited', workspace: 'Rate-limited' },
              { quota: 'Triggers', free: '20 total', workspace: '20 total' },
            ].map(({ quota, free, workspace }, i) => (
              <div key={quota} className="grid px-4 py-2.5 text-xs gap-4"
                style={{ gridTemplateColumns: '1.5fr 1fr 1fr', borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)' }}>
                <span style={{ color: 'var(--color-text)' }}>{quota}</span>
                <span style={{ color: 'var(--color-muted)' }}>{free}</span>
                <span style={{ color: 'oklch(0.72 0.18 145)' }}>{workspace}</span>
              </div>
            ))}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
            <strong style={{ color: 'var(--color-text)' }}>Practical ceiling:</strong> free Gmail users can handle ~100 form
            submissions/day that trigger email notifications. Workspace users can handle ~1,500/day.
            For higher volumes, email notifications should be disabled or users should upgrade to
            the gateway tier (where we send notifications server-side, bypassing Apps Script email quotas entirely).
          </p>
        </Card>
      </div>

      {/* What to build */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>What to build — free tier only</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Minimal infra. No gateway, no stored tokens, no proxy layer.</p>
        </div>
        <Card>
          <SectionLabel>Required infrastructure</SectionLabel>
          <CodeBlock>{`next.config.ts
  Remove output: 'export' → enables API routes

Firestore collections:
  users/{userId}
    email, plan: 'free', createdAt, lastActiveAt

  users/{userId}/credits
    balance: number          ← provisioning credits remaining

  modules/{moduleId}
    userId, projectId, type, name
    sheetId, scriptId, deploymentUrl
    createdAt

  modules/{moduleId}/stats/{YYYY-MM}
    count: number            ← incremented by ping endpoint

API routes needed:
  POST /api/auth/callback    ← Google OAuth exchange
  POST /api/provision        ← deduct credit, run provisioning
  POST /api/ping             ← submission counter (called by script)
  POST /api/stripe/webhook   ← credit pack purchases
  GET  /api/credits          ← balance check for dashboard`}
          </CodeBlock>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
            Total infra cost at this stage: Firebase free tier (Spark plan) covers all Firestore
            reads/writes until meaningful scale. Only cost is hosting (~$0 on Firebase App Hosting
            free tier) and Stripe fees on credit packs.
          </p>
        </Card>
      </div>

      {/* Provisioning credits */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Provisioning credits</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>The primary revenue mechanism on the free tier. Monetizes the one moment we control.</p>
        </div>

        <Card>
          <SectionLabel>Pack pricing</SectionLabel>
          <CodeBlock>{`Free tier includes: 3 provisions (seeded on signup)

Credit packs (one-time Stripe Checkout):
  $5  → 10 provisions   (~$0.50 each)
  $15 → 40 provisions   (~$0.37 each)
  $40 → 150 provisions  (~$0.27 each)

Stripe fee math (why packs, not per-provision):
  $0.50 single charge  → ~$0.33 fees → $0.17 net  (34% kept)
  $5 pack, 10 uses     → ~$0.45 fees → $4.55 net  (91% kept)`}
          </CodeBlock>
        </Card>

        <Card>
          <SectionLabel>Provisioning flow — credit check</SectionLabel>
          <CodeBlock>{`// POST /api/provision
1. Verify session (httpOnly cookie → Firestore session doc)
2. Read users/{userId}/credits.balance
3. if balance < 1:
     return 402 { error: 'no_credits', checkoutUrl: '...' }
     → client shows "Buy credits" modal → Stripe Checkout
4. if balance >= 1:
     begin provisioning (create Sheet + Script + deploy)
     on success: decrement balance by 1 in Firestore transaction
     on failure: do NOT decrement (provision failed, credit preserved)
5. Write modules/{moduleId} doc with result metadata`}
          </CodeBlock>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
            The decrement happens <strong style={{ color: 'var(--color-text)' }}>after</strong> successful
            provisioning — a failed provision doesn&apos;t cost a credit. Use a Firestore transaction
            to make the decrement atomic.
          </p>
        </Card>

        <Card>
          <SectionLabel>Stripe webhook — crediting the purchase</SectionLabel>
          <CodeBlock>{`// POST /api/stripe/webhook
// Event: checkout.session.completed

const session = event.data.object;
const userId = session.metadata.userId;
const credits = session.metadata.credits; // '10', '40', or '150'

await db
  .doc(\`users/\${userId}/credits\`)
  .update({ balance: FieldValue.increment(Number(credits)) });`}
          </CodeBlock>
        </Card>
      </div>

      {/* Analytics ping */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Analytics ping</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Submission counting without payload access. Dashboard engagement + upgrade pressure.</p>
        </div>

        <Card>
          <SectionLabel>Deployed inside every free-tier script</SectionLabel>
          <CodeBlock>{`const MODULE_ID = '__MODULE_ID__'; // replaced at provision time
const PING_URL  = 'https://rgforms.app/api/ping';

function doPost(e) {
  // Fire-and-forget — does not block form handler, never throws
  try {
    UrlFetchApp.fetch(PING_URL, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ moduleId: MODULE_ID }),
      muteHttpExceptions: true,
    });
  } catch (_) {}

  // ... rest of handler (write to sheet, send email, etc.)
}`}
          </CodeBlock>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
            The ping uses one of the 20,000/day UrlFetch quota — well within limits for any
            realistic free-tier volume. The <Mono>try/catch</Mono> ensures a ping failure never
            breaks a form submission. The code is visible in the script editor — fully transparent.
          </p>
        </Card>

        <Card>
          <SectionLabel>Server-side ping handler</SectionLabel>
          <CodeBlock>{`// POST /api/ping
export async function POST(req: Request) {
  const { moduleId } = await req.json();
  if (!moduleId || typeof moduleId !== 'string') {
    return new Response(null, { status: 400 });
  }

  const month = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  await db
    .doc(\`modules/\${moduleId}/stats/\${month}\`)
    .set({ count: FieldValue.increment(1) }, { merge: true });

  return new Response(null, { status: 204 });
}`}
          </CodeBlock>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
            No auth required on this endpoint — <Mono>moduleId</Mono> is a non-guessable UUID
            written into the script at provision time. If someone spams it, their count goes up,
            which only hurts their own upgrade decision. No sensitive data is involved.
          </p>
        </Card>

        <Card>
          <SectionLabel>Dashboard display + upgrade hook</SectionLabel>
          <BulletList items={[
            'Dashboard reads modules/{moduleId}/stats/{YYYY-MM} for each of the user\'s modules',
            'Shows: "Contact form — 312 submissions this month", "Blog API — 47 this month"',
            'Upgrade CTA: "See who submitted and what they said → Builder plan"',
            'Monthly count resets automatically (new document per month, old ones kept for history)',
            'Free tier sees current month only. Paid tiers see full history.',
          ]} />
        </Card>
      </div>

      {/* HIPAA */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>HIPAA advantage</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>The free tier&apos;s data architecture is a compliance feature, not a limitation.</p>
        </div>
        <CalloutBox accent>
          <Strong>The pitch:</Strong> &ldquo;The free tier is architecturally incapable of accessing
          your PHI. Submissions go directly from your site to your Google Sheet — rgforms is never
          in that path. If your Google Workspace account has a signed BAA with Google (which covers
          Sheets and Apps Script), you are HIPAA-compatible with zero additional compliance overhead
          on our side. We don&apos;t need to sign a BAA with you because we never touch your data.&rdquo;
        </CalloutBox>
        <Card>
          <BulletList items={[
            'Google Workspace BAA covers: Gmail, Drive, Docs, Sheets, Apps Script — the full free-tier data path',
            'rgforms never stores OAuth tokens beyond the active session (discarded after provisioning)',
            'Only data we hold: module metadata (IDs, names, sheet URLs) and monthly submission counts — no PHI',
            'Ping endpoint receives: moduleId + timestamp. No form fields, no patient data, ever.',
            'BAA support for gateway tiers is planned for a future Enterprise tier — not available yet.',
          ]} />
        </Card>
      </div>

      {/* Upgrade hooks */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Upgrade triggers</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Specific moments that push free users toward Builder.</p>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { trigger: 'Credit pack friction', detail: 'User buys their second credit pack ($15). At that point they\'ve spent $15 on provisions alone — the Builder plan at $9/mo is now obviously better value. Show the comparison at checkout.' },
            { trigger: 'Submission count curiosity', detail: '"Your contact form got 847 submissions this month." The count is visible but the contents aren\'t. The desire to see who submitted is the upgrade. Surface this prominently in the dashboard.' },
            { trigger: 'Client-facing URL', detail: 'Developer builds a client site, client sees the script.google.com URL. Client asks for a clean URL. Developer upgrades to Builder ($9). This is the most common real-world trigger.' },
            { trigger: 'Manual authorization', detail: 'The "visit this URL once in your browser" step confuses non-technical users. Documented as a free-tier limitation. Gateway tier removes it completely — no browser visit needed.' },
            { trigger: 'Badge removal', detail: '"Powered by rgforms" on a client\'s form confirmation page. Any agency building for a client will upgrade to remove it.' },
            { trigger: 'Email quota hit', detail: 'Free Gmail users hit 100 email notifications/day. Workspace users hit 1,500/day. Gateway tier sends emails server-side, bypassing Apps Script quotas entirely.' },
          ].map(({ trigger, detail }) => (
            <div key={trigger} className="flex flex-col gap-1 rounded-lg p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{trigger}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Free tier revenue */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Free tier revenue projections</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Before a single paid subscriber. Assumes 20% of free users buy at least one credit pack.</p>
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
          <div className="grid px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
            style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}>
            <span>Free Users</span>
            <span>Pack buyers (20%)</span>
            <span>Avg pack</span>
            <span style={{ color: 'oklch(0.72 0.18 145)' }}>Monthly Rev</span>
          </div>
          {[
            { users: '200', buyers: '40', avg: '$5', rev: '$200' },
            { users: '1,000', buyers: '200', avg: '$7', rev: '$1,400' },
            { users: '5,000', buyers: '1,000', avg: '$8', rev: '$8,000' },
          ].map(({ users, buyers, avg, rev }, i) => (
            <div key={users} className="grid px-5 py-3 text-sm"
              style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)', color: 'var(--color-muted)' }}>
              <span>{users}</span>
              <span>{buyers}</span>
              <span>{avg}</span>
              <span className="font-bold" style={{ color: 'oklch(0.72 0.18 145)', fontFamily: 'var(--font-display)' }}>{rev}</span>
            </div>
          ))}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
          This revenue requires zero gateway infrastructure — just Firestore, Stripe, and the ping
          endpoint. Infra cost at 5,000 free users: ~$20/mo. The free tier is not just a funnel;
          it&apos;s a self-sustaining product line.
        </p>
      </div>

    </div>
  );
}

// ─── Gateway tab ──────────────────────────────────────────────────────────────

function GatewayTab() {
  return (
    <div className="flex flex-col gap-8">

      {/* Short URLs */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Short URLs — the growth engine</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>The gateway&apos;s most visible feature — and the marketing flywheel.</p>
        </div>
        <div className="flex flex-col gap-3">
          <Card>
            <div className="flex gap-3 items-start">
              <span className="text-base shrink-0">❌</span>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Free tier</p>
                <Mono>https://script.google.com/macros/d/AKfycbxV7Gj9z3...MhQU/exec</Mono>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--color-muted)' }}>90-character Google URL. Google&apos;s brand. Breaks on redeploy. No analytics, no control.</p>
              </div>
            </div>
          </Card>
          <Card accent>
            <div className="flex gap-3 items-start">
              <span className="text-base shrink-0">✓</span>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Gateway tier</p>
                <Mono>https://rg.fm/acme/contact</Mono>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--color-muted)' }}>Our brand in every embed on the internet. Stable forever. Full analytics, rate limiting, webhooks all enabled.</p>
              </div>
            </div>
          </Card>
        </div>
        <BulletList items={[
          'Every site using rgforms embeds an rg.fm URL — free brand impressions at scale (same model as Mailchimp\'s badge)',
          'URL stability: redeploy the script or migrate to hosted storage — the embed code never changes',
          'The short URL is the choke point: rate limiting, billing enforcement, CORS, webhooks all happen here',
          'Domain strategy: pick a punchy 4–5 char domain — rg.fm, rgf.sh — memorable in source code',
        ]} />
      </div>

      {/* Pricing */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Gateway pricing tiers</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>All gateway tiers include: no manual script authorization, private script execution via scripts.run API.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TierCard
            name="Builder"
            price="$9"
            features={[
              '3 projects, 10 modules',
              'Short URLs (rg.fm/your-form)',
              'No manual script auth',
              '5,000 submissions / month',
              'Submission inbox (last 500)',
              'Basic analytics',
              'Remove badge',
            ]}
            target="Freelancers, client sites, small blogs."
            upgradeHook="Needs webhooks or per-project API keys."
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
              'Full analytics',
              'Webhooks (unlimited)',
              'CORS + IP allowlist',
              'API keys per project',
              'CSV export',
            ]}
            target="Small agencies, growing startups, teams of 1–3."
            upgradeHook="Needs team seats or custom domain."
          />
          <TierCard
            name="Business"
            price="$59"
            features={[
              'Everything in Pro',
              'Hosted Firestore storage',
              'Team seats (5 + $8/seat)',
              'Custom domain',
              '500k submissions / month*',
              'Priority support + SLA',
              'BAA — planned for future Enterprise tier',
            ]}
            target="Established agencies, high-traffic API users."
            upgradeHook="Needs enterprise volume or team seats."
          />
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
          * Submission limits on gateway tiers are enforced by our infrastructure, not Apps Script.
          Email notifications are sent server-side on paid tiers, bypassing Apps Script&apos;s
          100–1,500/day email quota entirely.
        </p>
      </div>

      {/* Gateway architecture */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Gateway architecture</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>How private script execution works — no manual auth, no public URLs.</p>
        </div>
        <Card>
          <SectionLabel>Runtime data flow</SectionLabel>
          <CodeBlock>{`Browser → POST rg.fm/slug
  → Next.js middleware (rate limit, billing check, CORS)
  → Gateway route: look up slug in Firestore → get { scriptId, userId }
  → Mint fresh access token from stored refresh token
  → POST https://script.googleapis.com/v1/scripts/{scriptId}:run
      { function: 'doPost', parameters: [e] }
  → Receive result → log metadata to Firestore → return to browser

Side effects (async):
  → increment monthly submission counter
  → fire webhooks (if configured)
  → store payload in Firestore (paid tiers only)`}
          </CodeBlock>
        </Card>
        <Card>
          <SectionLabel>Eliminating manual script authorization</SectionLabel>
          <BulletList items={[
            'Scripts deployed as "Only myself" — never reachable via public URL',
            'Gateway calls scripts/{scriptId}:run authenticated by stored OAuth refresh token',
            'Refresh token encrypted at rest in Firestore, fresh access token minted per call',
            'Scope consent triggered inline during provisioning — user never leaves the app',
            'Requires https://www.googleapis.com/auth/script.projects added to sign-in scopes (already needed for provisioning)',
          ]} />
        </Card>
      </div>

      {/* What to build */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>What to build — gateway tiers</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Three phases. Phase 1 is sufficient to start charging for gateway plans.</p>
        </div>
        <PhaseCard
          number={1}
          title="The Gateway"
          timeline="4–6 weeks"
          cost="~$0 infra"
          outcome="A chargeable product. Short URLs work, Stripe is wired, billing limits are enforced."
          steps={[
            'Remove output: \'export\' from next.config.ts — enable Next.js server mode',
            'Add Firestore — users, projects, sessions, short URLs, refresh tokens (encrypted)',
            'Backend session: Google OAuth → JWT in httpOnly cookie + Firestore session doc',
            'Short URL table: { slug, scriptId, userId, projectId } with Next.js middleware redirect',
            'Gateway proxy route: /api/gateway/[slug] — validate, log metadata, call scripts.run, return response',
            'Billing enforcement: check Firestore submission count before forwarding, 429 if over limit',
            'Stripe Checkout + webhook: subscription billing, update plan field in Firestore',
            'Server-side email notifications: send via Nodemailer/Resend instead of Apps Script MailApp',
          ]}
        />
        <PhaseCard
          number={2}
          title="Analytics + Webhooks"
          timeline="4–6 weeks"
          cost="~$50/mo"
          outcome="The features that justify Pro pricing. Users have a reason to stay and upgrade."
          steps={[
            'Analytics dashboard: request volume, error rate, latency — from Firestore counter docs',
            'Submission inbox: store payloads for paying users (free = ping count only)',
            'Webhook system: async delivery to user-configured URLs on each POST',
            'API key system: issue keys per project, validate in gateway before forwarding',
            'CORS + IP allowlist: validate in gateway middleware, return 403 with clear error',
            'Vanity slugs: Pro users set custom rg.fm/acme/contact paths',
          ]}
        />
        <PhaseCard
          number={3}
          title="Hosted Storage Tier"
          timeline="When Phase 2 is profitable"
          cost="~$200/mo"
          outcome="Business tier unlocked. Data lives in Firestore, not just Sheets. Real query capabilities."
          steps={[
            'Business tier: write submissions to Firestore instead of routing through Sheets API',
            'Google Sheet kept as user-owned backup and spreadsheet view',
            'Query params: ?where=published:true&sort=created_at:desc&limit=20',
            'Custom domain routing: api.yourco.com → gateway via CNAME',
            'Team collaboration: invite by email, role-based access',
          ]}
        />
      </div>

    </div>
  );
}

// ─── Tabs shell ───────────────────────────────────────────────────────────────

const TABS = [
  { id: 'starter', label: 'Starter Plan', sublabel: 'Free · No gateway' },
  { id: 'gateway', label: 'Gateway Plans', sublabel: 'Builder · Pro · Business' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function BusinessPlanTabs() {
  const [active, setActive] = useState<TabId>('starter');

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar */}
      <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className="flex-1 flex flex-col items-center gap-0.5 rounded-lg px-4 py-3 text-sm font-semibold transition-colors"
              style={{
                background: isActive ? 'var(--color-bg)' : 'transparent',
                border: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                color: isActive ? 'var(--color-text)' : 'var(--color-muted)',
                fontFamily: 'var(--font-display)',
                cursor: 'pointer',
              }}
            >
              {tab.label}
              <span className="text-[10px] font-normal" style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-subtle)' }}>
                {tab.sublabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {active === 'starter' ? <StarterTab /> : <GatewayTab />}
    </div>
  );
}
