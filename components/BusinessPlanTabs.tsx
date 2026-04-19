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

// ─── Sites tab ────────────────────────────────────────────────────────────────

function SitesTab() {
  return (
    <div className="flex flex-col gap-8">

      {/* Concept */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>The product</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>A complete website builder for non-technical users. Beautiful templates. Forms that work. Data you own. Your domain.</p>
        </div>
        <CalloutBox accent>
          <Strong>The pitch:</Strong> &ldquo;Tell us about your business in one sentence. Our AI designs the entire
          site — picks your modules, writes real seed content, configures your forms — and provisions everything in
          90 seconds. Your site runs on your domain, beautiful out of the box. Your data lives in a Google Sheet
          you own and can edit like a spreadsheet. When you outgrow us: download a full Next.js project and
          self-host it anywhere. No vendor lock-in. No designer needed. No technical knowledge required.&rdquo;
        </CalloutBox>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { title: 'Non-technical business owner', body: 'Describe your business. AI builds the site. Edit content by typing in a spreadsheet. Live on your domain in under 2 minutes — no designer, no developer, no CMS to learn.' },
            { title: 'Freelancer / developer', body: 'Build client sites 10× faster. Client gets a Google Sheet as their CMS — they can update their own content without ever calling you. Export clean Next.js code if they want to self-host later.' },
            { title: 'Agency', body: 'White-label the builder. Provision client sites in minutes. They manage content in Sheets. You earn recurring revenue. Unlimited sites on one plan.' },
          ].map(({ title, body }) => (
            <div key={title} className="rounded-lg p-3 flex flex-col gap-1.5"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* System architecture */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>System architecture</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>rgforms hosts the website. Apps Script is a JSON API. Google holds all the data. Two completely separated concerns.</p>
        </div>
        <Card>
          <SectionLabel>Runtime data flow — how a page visit works</SectionLabel>
          <CodeBlock>{`Visitor → yourdomain.com (or username.rgforms.app)
        → Cloudflare CDN: cache hit → serve HTML instantly (~15ms)
        → Cloudflare CDN: cache miss → invoke Cloudflare Worker

Cloudflare Worker (multi-tenant — one deployment serves ALL sites):
  1. Read Host header → look up { userId, siteConfig, scriptUrl } from KV
  2. Parse path: /blog/my-post → { module: 'blog', slug: 'my-post' }
  3. Fetch data: GET scriptUrl?action=data&module=blog (Apps Script JSON API)
     → Apps Script reads Sheet, returns JSON array (CacheService, 5-min TTL)
  4. Render HTML: inject data into the chosen template component
  5. Set Cache-Control: s-maxage=300 → Cloudflare caches for 5 min
  6. Return full SSR HTML with <title>, meta, JSON-LD, GA4 tag

Form submission (stays directly in Google — no rgforms proxy on free tier):
  Browser → POST scriptUrl (Apps Script doPost)
          → appends row to Sheet tab → sends email (MailApp) → returns JSON

Cache invalidation (near real-time updates):
  User edits Sheet → Apps Script onEdit trigger
  → POST https://workers.rgforms.app/api/purge?siteId=xxx
  → Cloudflare Worker purges all cached pages for that site
  → next visitor gets fresh HTML within ~1 second of the Sheet edit`}
          </CodeBlock>
        </Card>
        <Card>
          <SectionLabel>Why Cloudflare Workers — the key architectural decision</SectionLabel>
          <BulletList items={[
            'One Next.js-like Worker deployment serves every user\'s site — no per-user deployment cost',
            'Cloudflare\'s edge network (300+ PoPs globally) — pages load in <50ms from cache, worldwide',
            'Custom domains: Cloudflare handles SSL, HTTPS, certificate renewal automatically per domain',
            'Workers KV: ultra-fast key-value store for site configs and cached Apps Script responses',
            'No egress fees — Cloudflare does not charge for outbound bandwidth (unlike AWS/GCP)',
            'At 50,000 sites: ~$30/mo total hosting cost. This is the entire business\'s web infrastructure.',
          ]} />
        </Card>
        <Card>
          <SectionLabel>Apps Script role — JSON API only, not a web server</SectionLabel>
          <CodeBlock>{`// Apps Script doGet — returns data as JSON (not HTML)
function doGet(e) {
  const action = e.parameter.action;
  const module = e.parameter.module || '';

  if (action !== 'data') {
    return jsonResponse({ error: 'invalid_action' });
  }

  const rows = getCachedRows(module); // CacheService, 5-min TTL
  return ContentService
    .createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
}

// Apps Script doPost — form submissions go straight to Sheet
function doPost(e) {
  const { module, fields } = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActive()
    .getSheetByName(module + '_submissions');
  sheet.appendRow([new Date(), ...Object.values(fields)]);
  MailApp.sendEmail(NOTIFICATION_EMAIL, 'New ' + module, formatEmail(fields));
  return jsonResponse({ ok: true });
}

// onEdit — busts Cloudflare cache when Sheet is edited
function onEdit(e) {
  CacheService.getScriptCache().remove(e.range.getSheet().getName());
  UrlFetchApp.fetch(PURGE_URL + '?siteId=' + SITE_ID, { method: 'post' });
}`}
          </CodeBlock>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
            Apps Script never serves HTML. It is purely a data layer — read JSON, write rows.
            The Cloudflare Worker owns the rendering. This separation is what makes the export feature possible.
          </p>
        </Card>
      </div>

      {/* AI provisioning */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>AI provisioning — the star feature</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>One sentence about your business. AI designs the whole site. User confirms. 90-second provision.</p>
        </div>
        <Card>
          <SectionLabel>The full flow</SectionLabel>
          <CodeBlock>{`Step 1 — User types a description (no form to fill):
  "I run a yoga studio in Brooklyn. Morning classes, private sessions,
   4 instructors. I want to take class bookings and sell retreat packages."

Step 2 — Claude Haiku processes the prompt (cost: ~$0.008/call):
  Input:  system prompt + user description   (~800 tokens)
  Output: structured site spec JSON          (~2,500 tokens)
  Time:   ~1.5 seconds

Step 3 — rgforms shows a confirmation screen (user can edit before committing):
  ┌─────────────────────────────────────────────────┐
  │ Site name:     Brooklyn Yoga Studio              │
  │ Style:         Warm   Font: Lato   Color: #7c9e8f│
  │                                                  │
  │ Sections (8):  hero · services · team · events   │
  │                gallery · testimonials · faq · loc │
  │                                                  │
  │ Forms (3):     booking · contact · newsletter    │
  │                                                  │
  │ Seed data:     3 services, 2 team members,       │
  │                2 FAQ items, 1 testimonial         │
  │                (edit anything in your Sheet after)│
  │                                                  │
  │ Credits used:  4 (3 bundle + 1 extra module)     │
  │                                                  │
  │         [Edit]              [Build my site →]    │
  └─────────────────────────────────────────────────┘

Step 4 — User clicks "Build my site":
  → Create Google Sheet with all tabs + seed data pre-filled
  → Compile Apps Script (JSON API + form handlers + onEdit trigger)
  → Deploy script as web app
  → Register site in Cloudflare KV: { siteId → scriptUrl, config }
  → Provision subdomain: username.rgforms.app → live

Total time: ~60–90 seconds. Site is live with real content.`}
          </CodeBlock>
        </Card>
        <Card>
          <SectionLabel>What the AI generates — the site spec JSON</SectionLabel>
          <CodeBlock>{`{
  "siteConfig": {
    "site_name": "Brooklyn Yoga Studio",
    "tagline": "Mind. Body. Community.",
    "style": "warm",
    "font": "Lato",
    "primary_color": "#7c9e8f",
    "meta_description": "Yoga classes in Brooklyn — morning flow, private sessions, and retreat experiences for all levels.",
    "ga_placeholder": true    // user adds GA4 ID later in _config Sheet
  },
  "modules": ["hero","services","team","events","gallery","testimonials","faq","locations"],
  "formModules": ["booking","contact","newsletter"],
  "seedData": {
    "services": [
      { "name": "Morning Flow", "price": "$22 / class", "featured": "TRUE",
        "description": "60-minute vinyasa to start your day grounded.", "order": "1" },
      { "name": "Private Session", "price": "From $120",
        "description": "One-on-one instruction tailored to your goals.", "order": "2" },
      { "name": "Weekend Retreat", "price": "$450",
        "description": "2-day immersive retreat upstate. Meals included.", "order": "3" }
    ],
    "team": [
      { "name": "Sarah Chen", "title": "Founder & Lead Instructor",
        "bio": "RYT-500 certified, 12 years teaching experience.", "order": "1" },
      { "name": "Marcus Rivera", "title": "Meditation Teacher",
        "bio": "Specializes in mindfulness and restorative practice.", "order": "2" }
    ],
    "faq": [
      { "question": "Do I need experience?",
        "answer": "All levels welcome. Morning Flow suits beginners.", "order": "1" },
      { "question": "What should I bring?",
        "answer": "Mat, water bottle, comfortable clothing. Blocks provided.", "order": "2" }
    ]
  },
  "bookingConfig": {
    "services_list": "Morning Flow|Private Session|Weekend Retreat",
    "confirmation_message": "Thank you! We'll confirm your booking within 24 hours."
  }
}`}
          </CodeBlock>
        </Card>
        <Card>
          <SectionLabel>AI cost — negligible at any scale</SectionLabel>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="grid px-4 py-2 text-xs font-semibold uppercase tracking-wider"
              style={{ gridTemplateColumns: '2fr 1fr 1fr', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}>
              <span>Item</span><span>Rate</span><span>Cost</span>
            </div>
            {[
              { item: 'Claude Haiku input (~800 tokens)', rate: '$0.80 / 1M tokens', cost: '$0.00064' },
              { item: 'Claude Haiku output (~2,500 tokens)', rate: '$4.00 / 1M tokens', cost: '$0.01000' },
              { item: 'Total per AI provision', rate: '—', cost: '$0.01064' },
              { item: '1,000 provisions / month', rate: '$0.01064 each', cost: '$10.64 / mo' },
              { item: '10,000 provisions / month', rate: '$0.01064 each', cost: '$106 / mo' },
            ].map(({ item, rate, cost }, i) => (
              <div key={item} className="grid px-4 py-2.5 text-xs"
                style={{ gridTemplateColumns: '2fr 1fr 1fr', borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)' }}>
                <span style={{ color: 'var(--color-text)' }}>{item}</span>
                <span style={{ color: 'var(--color-muted)' }}>{rate}</span>
                <span style={{ color: cost.includes('mo') ? 'oklch(0.72 0.18 145)' : 'var(--color-muted)', fontWeight: cost.includes('mo') ? 700 : 400 }}>{cost}</span>
              </div>
            ))}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
            At 10,000 AI provisions/month the cost is $106 — easily absorbed by credit pack revenue from those same provisions.
            AI provisioning is included on Launch tier and above; free tier users get a manual module-picker instead.
          </p>
        </Card>
      </div>

      {/* Module library */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Module library — the full catalog</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Every module is a Sheet tab + a rendered section + optional form handler. AI picks the right set; users add more at any time.</p>
        </div>
        <Card>
          <SectionLabel>Content modules — read from Sheet, rendered on site</SectionLabel>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="grid px-4 py-2 text-xs font-semibold uppercase tracking-wider"
              style={{ gridTemplateColumns: '1fr 2fr', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}>
              <span>Module</span><span>Sheet tab = CMS for</span>
            </div>
            {[
              { m: 'hero',         s: 'Headline, subheadline, CTA button text + link, background image — single row' },
              { m: 'blog',         s: 'Posts: title, slug, body (Markdown), author, date, tags, og_image. Index + post pages.' },
              { m: 'services',     s: 'Offerings: name, description, price, icon, featured flag, order' },
              { m: 'team',         s: 'Staff: name, title, bio, photo_url, linkedin, twitter, order' },
              { m: 'testimonials', s: 'Reviews: name, company, quote, rating (1–5), photo_url, order' },
              { m: 'faq',          s: 'Q&A pairs: question, answer, category. Collapsible accordion, grouped.' },
              { m: 'gallery',      s: 'Portfolio / photos: title, image_url (Drive link), description, tag, link' },
              { m: 'events',       s: 'Schedule: title, date, time, location, description, ticket_url' },
              { m: 'menu',         s: 'Food/drink: name, description, price, category, dietary_flags, image_url' },
              { m: 'products',     s: 'Catalog: name, price, image, description, variants, buy_link (external checkout)' },
              { m: 'jobs',         s: 'Open roles: title, department, location, type (full/part), description, apply_url' },
              { m: 'press',        s: 'Media coverage: publication, headline, date, link, logo_url' },
              { m: 'partners',     s: 'Logos + names: company, logo_url, website, tier (gold/silver/bronze)' },
              { m: 'stats',        s: 'Key numbers: label, value, suffix — e.g. "Clients served", "500", "+"' },
              { m: 'timeline',     s: 'History / roadmap: year, title, description. Renders as vertical timeline.' },
              { m: 'resources',    s: 'Downloads / links: title, type (PDF/video/link), url, description, date' },
              { m: 'locations',    s: 'Multi-location: name, address, phone, hours, map_embed_url' },
              { m: 'pricing',      s: 'Plans: name, price, period, features (pipe-delimited), highlight, cta_label' },
            ].map(({ m, s }, i) => (
              <div key={m} className="grid px-4 py-2.5 text-xs items-start"
                style={{ gridTemplateColumns: '1fr 2fr', borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)' }}>
                <Mono>{m}</Mono>
                <span style={{ color: 'var(--color-muted)' }}>{s}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionLabel>Form modules — write to Sheet tab, trigger notification email</SectionLabel>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="grid px-4 py-2 text-xs font-semibold uppercase tracking-wider"
              style={{ gridTemplateColumns: '1fr 2fr', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}>
              <span>Module</span><span>Collects → Sheet tab</span>
            </div>
            {[
              { m: 'contact',    s: 'Name, email, message, subject. Universal — on every site.' },
              { m: 'newsletter', s: 'Email, first name, opt-in timestamp. Subscribers accumulate.' },
              { m: 'booking',    s: 'Name, email, date, time, service, notes. Appointment request.' },
              { m: 'quote',      s: 'Name, email, company, project type, budget range, description. RFQ.' },
              { m: 'apply',      s: 'Name, email, role, resume_url (Drive link), cover letter.' },
              { m: 'rsvp',       s: 'Name, email, event_id, headcount, dietary notes.' },
              { m: 'intake',     s: 'Custom fields defined in _config. Any intake form or survey.' },
            ].map(({ m, s }, i) => (
              <div key={m} className="grid px-4 py-2.5 text-xs items-start"
                style={{ gridTemplateColumns: '1fr 2fr', borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)' }}>
                <Mono>{m}</Mono>
                <span style={{ color: 'var(--color-muted)' }}>{s}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Business type presets */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Any business type — AI-generated or manual preset</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>These are the module combinations the AI picks by default. Every combination is fully editable — add or remove modules at any time.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { biz: 'Digital Agency',         mods: 'hero · services · team · testimonials · blog · stats · contact', form: 'contact + quote' },
            { biz: 'Freelance Portfolio',     mods: 'hero · gallery · services · testimonials · blog · contact', form: 'contact' },
            { biz: 'Restaurant / Cafe',       mods: 'hero · menu · gallery · events · testimonials · locations', form: 'contact + booking + rsvp' },
            { biz: 'Law Firm',               mods: 'hero · services · team · testimonials · faq · blog · locations', form: 'contact + intake' },
            { biz: 'Medical Practice',        mods: 'hero · services · team · faq · testimonials · locations', form: 'contact + booking + intake' },
            { biz: 'SaaS / App Landing',      mods: 'hero · stats · services · pricing · faq · testimonials · blog', form: 'contact + newsletter' },
            { biz: 'E-commerce (light)',      mods: 'hero · products · gallery · testimonials · faq · blog', form: 'contact + newsletter' },
            { biz: 'Non-profit',             mods: 'hero · stats · events · team · partners · press · timeline', form: 'contact + newsletter + rsvp' },
            { biz: 'Real Estate Agent',       mods: 'hero · gallery · services · testimonials · stats · locations', form: 'contact + booking + quote' },
            { biz: 'Personal Brand / Speaker',mods: 'hero · blog · events · press · testimonials · resources', form: 'contact + newsletter + booking' },
            { biz: 'Fitness / Wellness',      mods: 'hero · services · team · events · gallery · testimonials', form: 'contact + booking + newsletter' },
            { biz: 'Tech Startup',           mods: 'hero · stats · services · team · press · jobs · blog · faq', form: 'contact + newsletter + apply' },
            { biz: 'Consulting Firm',         mods: 'hero · services · team · blog · partners · stats', form: 'contact + quote' },
            { biz: 'Event / Conference',      mods: 'hero · events · team (speakers) · partners (sponsors) · faq · gallery', form: 'contact + rsvp + newsletter' },
            { biz: 'Photography Studio',      mods: 'hero · gallery · services · pricing · testimonials · blog', form: 'contact + booking + quote' },
            { biz: 'Contractor / Trades',     mods: 'hero · services · gallery · testimonials · stats · locations', form: 'contact + quote + booking' },
            { biz: 'School / Tutoring',       mods: 'hero · services · team · events · faq · testimonials', form: 'contact + booking + newsletter' },
            { biz: 'Accounting / Finance',    mods: 'hero · services · team · faq · resources · testimonials · blog', form: 'contact + intake + quote' },
          ].map(({ biz, mods, form }) => (
            <div key={biz} className="rounded-lg p-3 flex flex-col gap-1.5"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{biz}</p>
              <p className="text-[10px] font-mono leading-relaxed" style={{ color: 'var(--color-accent)' }}>{mods}</p>
              <p className="text-[10px]" style={{ color: 'var(--color-subtle)' }}>Forms: {form}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Visual styles */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Visual styles — independent of modules</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>The AI picks a style based on your business type. Users swap styles any time — same data, new look, no re-provisioning.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { name: 'Clean',      desc: 'White background, generous whitespace, Inter. Safe, professional, universal.', tag: 'Default' },
            { name: 'Bold',       desc: 'Large type, high contrast, accent color blocks. Agencies and creative studios.', tag: '' },
            { name: 'Minimal',    desc: 'Near-monochrome, tight grid. Portfolio, personal brand, architects.', tag: '' },
            { name: 'Warm',       desc: 'Cream background, serif headings, earthy tones. Restaurants, wellness, artisans.', tag: '' },
            { name: 'Corporate',  desc: 'Navy/gray palette, formal type, structured grid. Law, finance, consulting.', tag: '' },
            { name: 'Playful',    desc: 'Rounded cards, bright accents, relaxed layout. Schools, studios, consumer apps.', tag: '' },
            { name: 'Dark',       desc: 'Dark background, neon accent, code aesthetic. Tech, SaaS, developer tools.', tag: '' },
            { name: 'Magazine',   desc: 'Multi-column editorial grid, image-forward. Media, blogs, news outlets.', tag: '' },
            { name: 'Storefront', desc: 'Product-card grid, price badges, CTA-heavy. Catalogs, e-commerce light.', tag: '' },
          ].map(({ name, desc, tag }) => (
            <div key={name} className="rounded-lg p-3 flex flex-col gap-1"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{name}</p>
                {tag && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                  style={{ color: 'oklch(0.65 0.22 285)', background: 'oklch(0.65 0.22 285 / 0.10)', border: '1px solid oklch(0.65 0.22 285 / 0.30)' }}>{tag}</span>}
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--color-subtle)' }}>{desc}</p>
            </div>
          ))}
        </div>
        <Card>
          <SectionLabel>Style × module independence — how it works technically</SectionLabel>
          <CodeBlock>{`// A "style" is a CSS variable set + layout config. Modules don't know about style.

// _config Sheet (user can edit color, font, style directly):
  primary_color | #7c9e8f
  style         | warm          ← Cloudflare Worker reads this, applies CSS vars
  font          | Lato

// Cloudflare Worker selects the CSS file at render time:
  const styles = await KV.get('style:warm:css'); // pre-built CSS string per style
  const html = renderTemplate(moduleData, { styles, config });

// Changing style = editing _config Sheet → Worker reads new value on next cache miss.
// No re-provisioning. No script recompile. No credits spent.`}
          </CodeBlock>
        </Card>
      </div>

      {/* Custom domains */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Custom domains + DNS — simplified for non-technical users</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Three paths. The easiest is fully automated — no DNS knowledge required.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card accent>
            <SectionLabel>Path 1 — Buy through rgforms (recommended)</SectionLabel>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              User types a domain name → rgforms checks availability via Namecheap API → user pays in Stripe
              Checkout → rgforms registers the domain, sets nameservers to Cloudflare, provisions SSL, adds
              the Cloudflare DNS record. Done. Zero user interaction with DNS.
            </p>
            <CodeBlock>{`User flow:
  1. Type "acmeyoga.com"
  2. See: "Available — $12.99/yr"
  3. Click Buy (Stripe Checkout)
  4. Done — acmeyoga.com is live

rgforms backend:
  → Namecheap API: register domain
  → Set nameservers: ns1.cloudflare.com
  → Cloudflare API: add zone, CNAME record
  → Cloudflare API: add custom hostname
  → SSL: auto-provisioned by Cloudflare
  → KV: map acmeyoga.com → userId`}
            </CodeBlock>
            <p className="text-xs" style={{ color: 'var(--color-subtle)' }}>
              Revenue: $2–4 markup per domain/year. At 2,000 domains: ~$6,000/yr passive.
            </p>
          </Card>
          <Card>
            <SectionLabel>Path 2 — Bring your own domain (guided)</SectionLabel>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              User enters their existing domain. rgforms shows step-by-step DNS instructions with
              copy-paste values and a live propagation checker that turns green when complete.
            </p>
            <CodeBlock>{`rgforms dashboard shows:

  Step 1: Log into your registrar
  Step 2: Add these DNS records:

  Type  Name   Value
  CNAME www  → sites.rgforms.app
  A     @    → 104.21.x.x (Cloudflare)

  [Copy CNAME]  [Copy A record]

  Step 3: Waiting for DNS...
    ○ www.acmeyoga.com — propagating
    ✓ www.acmeyoga.com — live! (~15 min avg)`}
            </CodeBlock>
          </Card>
          <Card>
            <SectionLabel>Path 3 — Transfer DNS to rgforms</SectionLabel>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Power users change their nameservers to rgforms-managed Cloudflare.
              Full DNS control from the rgforms dashboard — add subdomains, MX records for email,
              TXT records for verification, all in one place.
            </p>
            <BulletList items={[
              'Nameservers: ns1.rgforms-dns.app / ns2.rgforms-dns.app',
              'Dashboard DNS editor: add A, CNAME, MX, TXT records visually',
              'Automatic SSL for every subdomain (api.yoursite.com, mail.yoursite.com)',
              'Useful for agencies managing all client DNS from one place',
            ]} />
          </Card>
        </div>
        <Card>
          <SectionLabel>SSL — fully automated, zero user involvement</SectionLabel>
          <BulletList items={[
            'Cloudflare Universal SSL: automatically provisions TLS cert for every custom hostname added',
            'Wildcard cert covers *.rgforms.app — all free-tier subdomains are HTTPS with no configuration',
            'Custom domain SSL: Cloudflare issues cert within minutes of DNS resolution',
            'Auto-renewal: Cloudflare renews all certs silently — no Let\'s Encrypt expiry emails ever',
            'HSTS enabled by default: browsers force HTTPS, prevents mixed-content warnings',
          ]} />
        </Card>
      </div>

      {/* Export to Next.js */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Export to Next.js — own your code</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>No other website builder does this. Download a full, working Next.js project and deploy it anywhere.</p>
        </div>
        <CalloutBox>
          <Strong>Why this is a major differentiator:</Strong> Squarespace, Wix, and Webflow all hold your site
          hostage. If you want to leave, you lose your design and have to rebuild. rgforms is the only
          builder where leaving is a first-class feature — download your code and self-host on Netlify, Vercel,
          or your own server. Your data is already in Google Sheets. Your site is already yours.
          This builds massive trust with developers who would otherwise never use a website builder.
        </CalloutBox>
        <Card>
          <SectionLabel>Generated project structure</SectionLabel>
          <CodeBlock>{`acme-yoga-studio/
├── app/
│   ├── layout.tsx              ← GA4, fonts, global CSS
│   ├── page.tsx                ← home (hero + module sections)
│   ├── blog/
│   │   ├── page.tsx            ← blog index
│   │   └── [slug]/page.tsx     ← blog post (ISR, revalidate: 300)
│   ├── services/page.tsx
│   ├── team/page.tsx
│   ├── events/page.tsx
│   ├── gallery/page.tsx
│   ├── contact/page.tsx
│   └── sitemap.ts              ← auto-generates sitemap.xml from Sheet data
├── components/
│   ├── modules/
│   │   ├── Hero.tsx
│   │   ├── Services.tsx        ← pre-built, styled for chosen visual style
│   │   ├── Team.tsx
│   │   └── ...                 ← only the modules the user provisioned
│   └── ui/                     ← Button, Card, Nav, Footer primitives
├── lib/
│   ├── sheets.ts               ← pre-configured with SCRIPT_URL + SHEET_ID
│   └── types.ts                ← TypeScript types per module
├── public/
│   └── favicon.ico
├── .env.example                ← SCRIPT_URL, SHEET_ID, GA_ID all pre-filled
├── next.config.ts
├── tailwind.config.ts
└── README.md                   ← 5-step deploy guide for Netlify / Vercel`}
          </CodeBlock>
        </Card>
        <Card>
          <SectionLabel>lib/sheets.ts — pre-configured, user just deploys</SectionLabel>
          <CodeBlock>{`// This file is generated with the user's actual SCRIPT_URL baked in.
// User copies .env.example to .env.local — values are already correct.

const SCRIPT_URL = process.env.SCRIPT_URL!; // pre-filled from provisioning

export async function getRows<T>(module: string): Promise<T[]> {
  const res = await fetch(
    \`\${SCRIPT_URL}?action=data&module=\${module}\`,
    { next: { revalidate: 300 } }  // ISR: re-fetch every 5 minutes
  );
  if (!res.ok) return [];
  return res.json();
}

// Usage in any page:
// const services = await getRows<Service>('services');
// → returns the user's Google Sheet rows as typed objects`}
          </CodeBlock>
        </Card>
        <Card>
          <SectionLabel>Deploy to Netlify in 5 steps (what README.md says)</SectionLabel>
          <BulletList items={[
            '1. Unzip the download. Open terminal: npm install',
            '2. Copy .env.example → .env.local  (all values already pre-filled)',
            '3. npm run dev — verify site works locally at localhost:3000',
            '4. Push to a GitHub repo',
            '5. Connect repo to Netlify / Vercel — deploy. Your domain from before still works via CNAME.',
          ]} />
          <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--color-subtle)' }}>
            Export is available on Studio plan and above. It&apos;s a powerful trust signal even for users
            who never export — knowing they <em>can</em> leave removes the fear of commitment.
          </p>
        </Card>
      </div>

      {/* Sheet as CMS */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>The Sheet as CMS</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Every website section is a Sheet tab. Every piece of content is a row. No CMS login ever.</p>
        </div>
        <Card>
          <SectionLabel>Provisioned Sheet structure</SectionLabel>
          <CodeBlock>{`Tab: _config
  key               | value
  site_name         | Brooklyn Yoga Studio
  tagline           | Mind. Body. Community.
  primary_color     | #7c9e8f
  style             | warm          ← change this to swap visual style instantly
  font              | Lato
  ga_id             | G-XXXXXXXXXX  ← user adds GA4 ID here
  meta_description  | Yoga classes in Brooklyn…

Tab: blog       title | slug | body | published | publish_at | date | author | og_image
Tab: team       name | title | bio | photo_url | linkedin | order | published
Tab: services   name | description | price | icon | featured | order | published
Tab: testimonials  name | company | quote | rating | photo_url | order | published
Tab: faq        question | answer | category | order | published
Tab: events     title | date | time | location | description | ticket_url | published
Tab: nav        label | page | order | hidden
Tab: booking_submissions    ← booking form responses land here
Tab: contact_submissions    ← contact form responses land here`}
          </CodeBlock>
        </Card>
        <Card>
          <SectionLabel>Column conventions — universal across all modules</SectionLabel>
          <BulletList items={[
            'published: TRUE/FALSE — hides/shows row site-wide. Default TRUE in AI seed data.',
            'publish_at: ISO datetime — hourly trigger auto-publishes at that time. Free scheduled posts.',
            'order: integer — sort order of section items. Reorder by editing the number.',
            'slug: URL-safe string — "my-post" becomes /blog/my-post on the live site.',
            'meta_description / og_image: per-row SEO overrides. Falls back to _config defaults.',
            'Any extra column is silently ignored — clients add notes columns without breaking anything.',
          ]} />
        </Card>
      </div>

      {/* SEO */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>SEO — complete out of the box</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Because rgforms hosts the site (not Apps Script), we get real HTTP, clean URLs, and proper server-side rendering.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <SectionLabel>What every site gets automatically</SectionLabel>
            <BulletList items={[
              'Clean path-based URLs: /blog/my-post, /services, /team (not ?page= query strings)',
              '<title> and <meta description> per page, from Sheet row or _config fallback',
              'Open Graph tags: og:title, og:description, og:image on every page',
              'JSON-LD structured data per page type (LocalBusiness, BlogPosting, FAQPage, Person)',
              'sitemap.xml auto-generated from all published pages and blog slugs',
              'robots.txt configured per site (allow all by default, customizable)',
              'Google Analytics 4: GA4 tag injected from ga_id in _config Sheet',
              'Proper HTTP 404 pages — real 404 status codes, not a 200 with error content',
              'Canonical URLs: prevent duplicate content between www and non-www',
            ]} />
          </Card>
          <Card>
            <SectionLabel>JSON-LD structured data — auto-built from Sheet rows</SectionLabel>
            <CodeBlock>{`// Cloudflare Worker injects per-page schema:

// Home → LocalBusiness
{ "@type": "LocalBusiness",
  "name": config.site_name,
  "description": config.meta_description,
  "url": "https://acmeyoga.com" }

// Blog post → BlogPosting (rich result eligible)
{ "@type": "BlogPosting",
  "headline": post.title,
  "author": { "@type": "Person", "name": post.author },
  "datePublished": post.date,
  "image": post.og_image }

// FAQ page → FAQPage (Google shows as accordion in search)
{ "@type": "FAQPage",
  "mainEntity": faqs.map(f => ({
    "@type": "Question", "name": f.question,
    "acceptedAnswer": { "text": f.answer }
  })) }

// No configuration needed. Filled automatically from Sheet data.`}
            </CodeBlock>
          </Card>
        </div>
      </div>

      {/* Infrastructure costs */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Infrastructure costs — real numbers</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Cloudflare Workers does not charge for egress. This changes everything about the cost model.</p>
        </div>
        <Card>
          <SectionLabel>Monthly infra cost at scale</SectionLabel>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="grid px-4 py-2 text-xs font-semibold uppercase tracking-wider"
              style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}>
              <span>Component</span><span>1,000 sites</span><span>10,000 sites</span><span>100,000 sites</span>
            </div>
            {[
              { c: 'Cloudflare Workers (requests)', a: '$5', b: '$15', d: '$100' },
              { c: 'Cloudflare KV (configs + cache)', a: '$0', b: '$5', d: '$30' },
              { c: 'Firestore (user metadata)', a: '$0', b: '$0', d: '$20' },
              { c: 'Claude Haiku (AI provisions)', a: '$1', b: '$10', d: '$100' },
              { c: 'Cloudflare egress', a: '$0', b: '$0', d: '$0' },
              { c: 'Total infra / month', a: '$6', b: '$30', d: '$250' },
            ].map(({ c, a, b, d }, i) => (
              <div key={c} className="grid px-4 py-2.5 text-xs"
                style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)' }}>
                <span style={{ color: c.includes('Total') ? 'var(--color-text)' : 'var(--color-muted)', fontWeight: c.includes('Total') ? 700 : 400 }}>{c}</span>
                <span style={{ color: c.includes('Total') ? 'oklch(0.72 0.18 145)' : 'var(--color-muted)', fontWeight: c.includes('Total') ? 700 : 400 }}>{a}</span>
                <span style={{ color: c.includes('Total') ? 'oklch(0.72 0.18 145)' : 'var(--color-muted)', fontWeight: c.includes('Total') ? 700 : 400 }}>{b}</span>
                <span style={{ color: c.includes('Total') ? 'oklch(0.72 0.18 145)' : 'var(--color-muted)', fontWeight: c.includes('Total') ? 700 : 400 }}>{d}</span>
              </div>
            ))}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
            Cloudflare Workers Paid plan: $5/mo flat + $0.50/million requests beyond 10M. No egress fees ever.
            At 100,000 sites each averaging 30 visitors/day × 2 pages: 180M requests/month → $90 Workers cost.
            This entire platform runs for <strong style={{ color: 'var(--color-text)' }}>$250/mo at 100,000 sites.</strong>
          </p>
        </Card>
      </div>

      {/* Pricing tiers */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Pricing tiers</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Four tiers. Each one unlocks the reason the previous tier felt limiting.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            {
              name: 'Free', price: 'Free', highlight: false,
              features: ['username.rgforms.app', '5 modules max', '1 site', 'All templates', 'Manual module picker', 'rgforms badge in footer', '3 provisioning credits'],
              gate: 'Custom domain and badge removal require Launch.',
            },
            {
              name: 'Launch', price: '$19', highlight: false,
              features: ['Custom domain + DNS setup', 'All modules', '1 site', 'AI provisioning', 'No badge', 'Basic analytics', 'Style swap anytime'],
              gate: 'Multiple sites and code export require Studio.',
            },
            {
              name: 'Studio', price: '$39', highlight: true,
              features: ['Everything in Launch', '3 sites', 'Next.js code export', 'Full analytics + referrers', 'Webhooks on form submit', 'Priority CDN routing', 'Client access to Sheet CMS'],
              gate: 'Unlimited sites and white-label require Agency.',
            },
            {
              name: 'Agency', price: '$79', highlight: false,
              features: ['Everything in Studio', 'Unlimited sites', 'White-label badge', '5 team seats (+$8/seat)', 'Client dashboard login', 'API access', 'Priority support'],
              gate: 'Enterprise / BAA: future roadmap.',
            },
          ].map(({ name, price, highlight, features, gate }) => (
            <div key={name} className="rounded-xl border p-4 flex flex-col gap-3"
              style={{ background: highlight ? 'oklch(0.65 0.22 285 / 0.06)' : 'var(--color-surface)', borderColor: highlight ? 'oklch(0.65 0.22 285 / 0.35)' : 'var(--color-border)' }}>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold" style={{ color: highlight ? 'var(--color-accent)' : 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{price}</span>
                  {price !== 'Free' && <span className="text-xs" style={{ color: 'var(--color-muted)' }}>/mo</span>}
                </div>
              </div>
              <ul className="flex flex-col gap-1.5">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                    <span className="shrink-0 mt-0.5 text-xs" style={{ color: 'oklch(0.72 0.18 145)' }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <p className="text-[10px] leading-relaxed pt-2" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}>{gate}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Unit economics */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Unit economics + revenue projections</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Real cost per user. Real margin. Realistic growth trajectory.</p>
        </div>
        <Card>
          <SectionLabel>Cost per user per month (variable cost only)</SectionLabel>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="grid px-4 py-2 text-xs font-semibold uppercase tracking-wider"
              style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}>
              <span>Cost item</span><span>Free user</span><span>Launch ($19)</span><span>Agency ($79)</span>
            </div>
            {[
              { item: 'Hosting (Cloudflare Workers)', free: '~$0.0003', launch: '~$0.003', agency: '~$0.03' },
              { item: 'AI provisioning (amortized)', free: '$0', launch: '$0.01', agency: '$0.05' },
              { item: 'Firestore metadata', free: '~$0.001', launch: '~$0.001', agency: '~$0.01' },
              { item: 'Stripe fees (on sub revenue)', free: '$0', launch: '$0.85', agency: '$2.59' },
              { item: 'Total variable cost / user', free: '< $0.01', launch: '~$0.86', agency: '~$2.69' },
              { item: 'Revenue', free: '$0 (credit upsell)', launch: '$19', agency: '$79' },
              { item: 'Gross margin', free: 'n/a', launch: '~96%', agency: '~97%' },
            ].map(({ item, free, launch, agency }, i) => (
              <div key={item} className="grid px-4 py-2.5 text-xs"
                style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)' }}>
                <span style={{ color: item.includes('margin') || item.includes('Revenue') ? 'var(--color-text)' : 'var(--color-muted)', fontWeight: item.includes('margin') || item.includes('Total') ? 700 : 400 }}>{item}</span>
                <span style={{ color: 'var(--color-muted)' }}>{free}</span>
                <span style={{ color: item.includes('margin') ? 'oklch(0.72 0.18 145)' : 'var(--color-muted)', fontWeight: item.includes('margin') ? 700 : 400 }}>{launch}</span>
                <span style={{ color: item.includes('margin') ? 'oklch(0.72 0.18 145)' : 'var(--color-muted)', fontWeight: item.includes('margin') ? 700 : 400 }}>{agency}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionLabel>Revenue projections — conservative growth model</SectionLabel>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="grid px-4 py-2 text-xs font-semibold uppercase tracking-wider"
              style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}>
              <span>Quarter</span><span>Free</span><span>Launch</span><span>Studio</span><span>Agency</span>
              <span style={{ color: 'oklch(0.72 0.18 145)' }}>MRR</span>
            </div>
            {[
              { q: 'Q1 (launch)', f: '200', la: '30', s: '10', ag: '3', mrr: '$1,107' },
              { q: 'Q2', f: '800', la: '100', s: '35', ag: '12', mrr: '$4,303' },
              { q: 'Q3', f: '3,000', la: '350', s: '120', ag: '40', mrr: '$15,910' },
              { q: 'Q4', f: '8,000', la: '900', s: '300', ag: '100', mrr: '$40,800' },
              { q: 'Y2 Q2', f: '25,000', la: '2,500', s: '800', ag: '250', mrr: '$110,750' },
            ].map(({ q, f, la, s, ag, mrr }, i) => (
              <div key={q} className="grid px-4 py-2.5 text-xs"
                style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)', color: 'var(--color-muted)' }}>
                <span style={{ color: 'var(--color-text)' }}>{q}</span>
                <span>{f}</span><span>{la}</span><span>{s}</span><span>{ag}</span>
                <span className="font-bold" style={{ color: 'oklch(0.72 0.18 145)', fontFamily: 'var(--font-display)' }}>{mrr}</span>
              </div>
            ))}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
            MRR = (Launch × $19) + (Studio × $39) + (Agency × $79) + free-tier credit pack revenue (20% of free users buy ~$12 avg).
            Infra cost at Y2 Q2 (25,000 sites): ~$80/mo. Net margin on subscription revenue: ~97%.
            At $110K MRR, the entire product runs for $80/mo in infra.
          </p>
        </Card>
        <Card>
          <SectionLabel>Additional revenue streams — compounding over time</SectionLabel>
          <BulletList items={[
            'Domain sales: $2–4 markup per .com/yr. At 5,000 domains: ~$15,000/yr recurring.',
            'Badge backlinks: every free site has "Powered by rgforms" → SEO + brand impressions → compounding organic growth.',
            'Agency resale: agencies charge clients $50–150/mo for a site rgforms hosts for $0.03. High-margin resale channel.',
            'Credit packs: free users buy provisions ($5–40). 20% conversion assumed in projections above.',
            'White-label add-on: $10/mo extra for custom badge text ("Powered by YourAgency"). Low effort, pure margin.',
            'AI re-provision: user asks AI to redesign their site → 2 credits + $0.01 AI cost → same revenue as new site.',
          ]} />
        </Card>
      </div>

      {/* Build phases */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>What to build — four phases</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Phase 1 is a launchable product. Each phase adds the feature that unlocks the next revenue tier.</p>
        </div>
        <PhaseCard
          number={1}
          title="MVP — hosted sites with manual module picker"
          timeline="8–10 weeks"
          cost="~$5/mo infra (Cloudflare Workers Paid)"
          outcome="A fully hosted website builder at username.rgforms.app. Users pick modules, pick a style, provision a real working site. No AI yet, no custom domain yet — but a real product."
          steps={[
            'Cloudflare Worker: multi-tenant routing (KV hostname → userId → site config)',
            'Apps Script template: doGet JSON API + doPost form handler + onEdit cache purge trigger',
            'Provisioning API: create Sheet (with all selected module tabs) + compile + deploy Script + register in KV',
            '3 visual styles: Clean, Bold, Warm. 5 core modules: hero, services, testimonials, contact, blog.',
            'rgforms dashboard: site list, module toggles, style picker, "Open Sheet" link',
            'Cache purge endpoint: POST /api/purge?siteId= — called by onEdit trigger, clears Cloudflare cache',
            'Subdomain provisioning: username.rgforms.app → Cloudflare custom hostname + SSL',
            'rgforms badge injected in footer of every free site',
          ]}
        />
        <PhaseCard
          number={2}
          title="AI provisioning + custom domains"
          timeline="4–6 weeks"
          cost="~$10/mo added (Claude API)"
          outcome="Non-technical users can describe their business and get a fully provisioned site in 90 seconds. Custom domains unlock the first paid tier."
          steps={[
            'AI provisioning: Claude Haiku API call with user description → site spec JSON → confirmation UI → provision',
            'Seed data injection: AI-generated rows written into each Sheet tab during provisioning',
            'Confirmation screen: show module list, style preview, seed data summary, credit cost — editable before committing',
            'Custom domain flow: Path 2 (bring your own) — CNAME instructions + DNS propagation polling + auto SSL',
            'Domain purchase: Path 1 — Namecheap API integration, Stripe Checkout for domain registration',
            'All 9 visual styles. All 18 content + 7 form modules.',
            'Launch tier billing: Stripe subscriptions, plan enforcement in Worker middleware',
          ]}
        />
        <PhaseCard
          number={3}
          title="Next.js export + full SEO suite"
          timeline="4–5 weeks"
          cost="~$0 added infra"
          outcome="Studio tier unlocked. Developers adopt the platform. Export feature becomes the most-shared feature in the product."
          steps={[
            'Next.js project generator: build zip from template with pre-configured lib/sheets.ts + user\'s module components',
            'Sitemap.xml: Cloudflare Worker serves /sitemap.xml from Sheet data (blog slugs + all pages)',
            'robots.txt: served per-site, configurable from _config Sheet',
            'JSON-LD structured data: per page type, auto-built from Sheet rows in Worker renderer',
            'Proper HTTP 404: Worker returns 404 status for unknown slugs',
            'RSS feed: /feed.xml from blog module rows',
            'Studio tier billing + 3-site limit enforcement',
          ]}
        />
        <PhaseCard
          number={4}
          title="Agency dashboard + white-label"
          timeline="6–8 weeks"
          cost="~$20/mo added (Firestore for multi-seat)"
          outcome="Agencies adopt rgforms as their white-label website platform. Each agency becomes a distribution channel."
          steps={[
            'Multi-site dashboard: all sites in one view, client name, last edit time, live status, analytics ping count',
            'Client access: invite client by email → they get read/write access to their site\'s Sheet + view-only dashboard',
            'White-label badge: "Powered by [Agency Name]" instead of "Powered by rgforms" — $10/mo add-on',
            'Team seats: invite team members with role-based access (Admin / Editor / Viewer)',
            'Site templates: save a configured site as a template → provision new client sites from it in 1 click',
            'Agency billing: manage client subscriptions from the agency dashboard, collect markup',
            'DNS management dashboard: Path 3 — full DNS editor for clients with transferred nameservers',
          ]}
        />
      </div>

    </div>
  );
}

      {/* Architecture */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Architecture — rgforms not in the path</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Provision once, step away completely. Same model as free-tier forms.</p>
        </div>
        <Card>
          <SectionLabel>Full runtime flow</SectionLabel>
          <CodeBlock>{`Provisioning (one-time, while user is logged in):
  rgforms → Google APIs (user token)
           → creates Sheet with all content tabs (_config, blog, team, services…)
           → compiles chosen template into Apps Script source code
           → deploys script as web app (Execute as: User, Access: Anyone)
           → writes { scriptUrl, sheetUrl } to Firestore → done

Page view (every request, rgforms not involved):
  Visitor → GET script.google.com/macros/…/exec?page=blog&slug=my-post
          → Apps Script doGet(e): check CacheService (300s TTL)
          → cache hit  → render HTML from cached rows → return
          → cache miss → read Sheet tab → render HTML → put cache → return

Form submit (contact, newsletter):
  Browser → POST script.google.com/macros/…/exec
          → doPost(e): append row to Sheet, send email (MailApp)
          → optional ping to rgforms /api/ping for analytics counter
          → return JSON { ok: true }

Sheet edit (content update):
  User edits any cell → onEdit trigger fires → CACHE.remove(sheetName)
  → next page view fetches fresh data → site updated within seconds`}
          </CodeBlock>
        </Card>
        <Card>
          <SectionLabel>Infrastructure cost to rgforms at runtime</SectionLabel>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="grid px-4 py-2 text-xs font-semibold uppercase tracking-wider"
              style={{ gridTemplateColumns: '2fr 1fr 1fr', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}>
              <span>Component</span><span>Provider</span><span>Cost</span>
            </div>
            {[
              { c: 'Web server / HTML rendering', p: 'Apps Script (HtmlService)', cost: '$0' },
              { c: 'Content database', p: 'Google Sheets', cost: '$0' },
              { c: 'Page cache', p: 'Apps Script CacheService', cost: '$0' },
              { c: 'SSL certificate', p: 'Google (included)', cost: '$0' },
              { c: 'Global CDN delivery', p: "Google's network", cost: '$0' },
              { c: 'Email notifications', p: 'MailApp (Apps Script)', cost: '$0' },
              { c: 'Analytics', p: 'Google Analytics 4', cost: '$0' },
              { c: 'Media / image storage', p: 'Google Drive', cost: '$0' },
              { c: 'rgforms infra cost per site', p: '—', cost: '$0 / mo' },
            ].map(({ c, p, cost }, i) => (
              <div key={c} className="grid px-4 py-2.5 text-xs"
                style={{ gridTemplateColumns: '2fr 1fr 1fr', borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)' }}>
                <span style={{ color: 'var(--color-text)' }}>{c}</span>
                <span style={{ color: 'var(--color-muted)' }}>{p}</span>
                <span style={{ color: cost === '$0 / mo' ? 'oklch(0.72 0.18 145)' : 'var(--color-muted)', fontWeight: cost === '$0 / mo' ? 700 : 400 }}>{cost}</span>
              </div>
            ))}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
            Infra cost at 10,000 live sites: still $0/mo. This tier scales infinitely with zero marginal cost to rgforms.
            The only cost is the provisioning API calls — covered by credit purchases.
          </p>
        </Card>
      </div>

      {/* Sheet as CMS */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>The Sheet as CMS</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Every website section is a Sheet tab. Every piece of content is a row. No CMS login, no dashboard — just a spreadsheet.</p>
        </div>
        <Card>
          <SectionLabel>Provisioned Sheet structure</SectionLabel>
          <CodeBlock>{`Tab: _config
  key               | value
  site_name         | Acme Agency
  tagline           | We build great things
  logo_drive_id     | 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
  primary_color     | #6B48FF
  theme             | agency
  font              | Inter
  ga_id             | G-XXXXXXXXXX     ← GA4 injected into every page automatically
  meta_description  | Full-service digital agency in New York

Tab: blog
  title | slug | body | published | publish_at | date | author | og_image | meta_description

Tab: team
  name | title | bio | photo_url | linkedin | twitter | order | published

Tab: services
  name | description | price | icon | featured | order | published

Tab: testimonials
  name | company | quote | rating | photo_url | published | order

Tab: faq
  question | answer | category | order | published

Tab: gallery
  title | image_url | description | tag | link | order | published

Tab: events
  title | date | location | description | ticket_url | published

Tab: nav
  label | page | slug | order | external_url

Tab: contact_submissions    ← existing module — form responses land here`}
          </CodeBlock>
        </Card>
        <Card>
          <SectionLabel>Column conventions — discoverable, not magic</SectionLabel>
          <BulletList items={[
            'published: TRUE/FALSE — controls visibility site-wide. Unpublished rows never appear.',
            'publish_at: ISO date — time trigger auto-sets published=TRUE at that timestamp. Zero-cost scheduled content.',
            'order: integer — sort order within a section. Lower = higher on the page.',
            'slug: URL-safe string — e.g. "my-blog-post" becomes ?page=blog&slug=my-blog-post',
            'meta_description / og_image: per-row SEO overrides. Falls back to _config site defaults.',
            'Any extra column is silently ignored — adding columns never breaks the site.',
          ]} />
        </Card>
      </div>

      {/* Apps Script as web server */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Apps Script as web server</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>doGet() handles every page view. doPost() handles every form. One deployed script, full site.</p>
        </div>
        <Card>
          <SectionLabel>Routing pattern — compiled into the script at provision time</SectionLabel>
          <CodeBlock>{`function doGet(e) {
  const page   = (e.parameter.page || 'home').toLowerCase();
  const slug   = e.parameter.slug   || '';
  const format = e.parameter.format || 'html';
  const q      = e.parameter.q      || '';

  // Special non-HTML formats — served from same endpoint
  if (format === 'sitemap') return serveSitemap();
  if (format === 'rss')     return serveRss();

  const config = getConfig(); // reads _config tab (always cached)
  const html   = renderPage(page, slug, q, config);

  return HtmlService.createHtmlOutput(html)
    .setTitle(getTitle(page, slug, config))
    .addMetaTag('description',   getMetaDesc(page, slug, config))
    .addMetaTag('og:title',      getOgTitle(page, slug, config))
    .addMetaTag('og:image',      getOgImage(page, slug, config))
    .addMetaTag('og:url',        getCanonical(page, slug))
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function renderPage(page, slug, q, config) {
  switch (page) {
    case 'home':      return tpl.home(getHomeData(), config);
    case 'blog':      return slug
                        ? tpl.post(getBlogPost(slug), config)
                        : tpl.blogIndex(getBlogPosts(), config);
    case 'services':  return tpl.services(getRows('services'), config);
    case 'team':      return tpl.team(getRows('team'), config);
    case 'faq':       return tpl.faq(getRows('faq'), config);
    case 'gallery':   return tpl.gallery(getRows('gallery'), config);
    case 'events':    return tpl.events(getRows('events'), config);
    case 'contact':   return tpl.contact(config);
    case 'search':    return tpl.search(searchAll(q), q, config);
    default:          return tpl.notFound(config);
  }
}`}
          </CodeBlock>
        </Card>
        <Card>
          <SectionLabel>CacheService — performance without infrastructure</SectionLabel>
          <CodeBlock>{`const CACHE = CacheService.getScriptCache();
const TTL   = 300; // 5 min. Google limits: max 6h, 6MB/key, 100MB total per script.

function cached(key, fn) {
  const hit = CACHE.get(key);
  if (hit) return JSON.parse(hit);
  const data = fn();
  try { CACHE.put(key, JSON.stringify(data), TTL); } catch (_) {}
  return data;
}

function getRows(tab) {
  return cached(tab, () => {
    const sheet  = SpreadsheetApp.getActive().getSheetByName(tab);
    const [head, ...rows] = sheet.getDataRange().getValues();
    return rows
      .map(r => Object.fromEntries(head.map((k, i) => [k, r[i]])))
      .filter(r => r.published === 'TRUE' || r.published === true);
  });
}

// onEdit trigger — fires when user edits any cell in the Sheet
function onEdit(e) {
  const tab = e.range.getSheet().getName();
  CACHE.remove(tab);
  CACHE.remove('_config'); // config change affects all pages
  // Result: site reflects the edit within milliseconds of saving the cell.
}`}
          </CodeBlock>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
            First request after an edit: ~600–900ms (Sheet read). Every subsequent request within 5 min: ~80–150ms (cache hit).
            The <Mono>onEdit</Mono> trigger is provisioned by rgforms — the user never has to set it up.
          </p>
        </Card>
        <Card>
          <SectionLabel>Scheduled publishing — time-triggered, zero rgforms infra</SectionLabel>
          <CodeBlock>{`// Hourly time-based trigger — provisioned by rgforms at setup time
function checkScheduledPosts() {
  const now   = new Date();
  const sheet = SpreadsheetApp.getActive().getSheetByName('blog');
  const data  = sheet.getDataRange().getValues();
  const head  = data[0];
  const piCol = head.indexOf('publish_at') + 1;  // 1-indexed for setCell
  const puCol = head.indexOf('published')  + 1;

  data.slice(1).forEach((row, i) => {
    const publishAt = new Date(row[piCol - 1]);
    if (row[puCol - 1] !== 'TRUE' && publishAt && publishAt <= now) {
      sheet.getRange(i + 2, puCol).setValue('TRUE');
      CACHE.remove('blog');
    }
  });
}`}
          </CodeBlock>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
            User writes a future date in <Mono>publish_at</Mono>. Post goes live automatically.
            Runs in the user&apos;s Google account. rgforms is not involved.
          </p>
        </Card>
      </div>

      {/* Module library */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Module library — the full catalog</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Every module is a Sheet tab + a rendered section + optional form handler. Add any combination.</p>
        </div>
        <Card>
          <SectionLabel>Content modules (read from Sheet, rendered on the page)</SectionLabel>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="grid px-4 py-2 text-xs font-semibold uppercase tracking-wider"
              style={{ gridTemplateColumns: '1fr 2fr', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}>
              <span>Module</span><span>Sheet tab = CMS for</span>
            </div>
            {[
              { m: 'hero',         s: 'Headline, subheadline, CTA button, background image — single row in Sheet' },
              { m: 'blog',         s: 'Posts: title, slug, body (Markdown), author, date, tags, og_image. Index + post pages.' },
              { m: 'services',     s: 'Offerings: name, description, price, icon, featured flag, order' },
              { m: 'team',         s: 'Staff: name, title, bio, photo_url, linkedin, twitter, order' },
              { m: 'testimonials', s: 'Reviews: name, company, quote, rating (1–5), photo_url, order' },
              { m: 'faq',          s: 'Q&A pairs: question, answer, category. Collapsible accordion, grouped.' },
              { m: 'gallery',      s: 'Portfolio / photos: title, image_url (Drive link), description, tag, link' },
              { m: 'events',       s: 'Schedule: title, date, time, location, description, ticket_url' },
              { m: 'menu',         s: 'Food/drink: name, description, price, category, dietary_flags, image_url' },
              { m: 'products',     s: 'Catalog: name, price, image, description, variants, buy_link (external checkout)' },
              { m: 'jobs',         s: 'Open roles: title, department, location, type (full/part), description, apply_url' },
              { m: 'press',        s: 'Media coverage: publication, headline, date, link, logo_url' },
              { m: 'partners',     s: 'Logos + names: company, logo_url, website, tier (gold/silver/bronze)' },
              { m: 'stats',        s: 'Key numbers: label, value, suffix (e.g. "Clients served", "500", "+")' },
              { m: 'timeline',     s: 'History / roadmap: year, title, description. Renders as vertical timeline.' },
              { m: 'resources',    s: 'Downloads / links: title, type (PDF/video/link), url, description, date' },
              { m: 'locations',    s: 'Multi-location: name, address, phone, hours, map_embed_url' },
              { m: 'pricing',      s: 'Plans: name, price, period, features (pipe-delimited), highlight, cta_label' },
            ].map(({ m, s }, i) => (
              <div key={m} className="grid px-4 py-2.5 text-xs items-start"
                style={{ gridTemplateColumns: '1fr 2fr', borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)' }}>
                <Mono>{m}</Mono>
                <span style={{ color: 'var(--color-muted)' }}>{s}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionLabel>Form modules (write to Sheet, trigger email)</SectionLabel>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="grid px-4 py-2 text-xs font-semibold uppercase tracking-wider"
              style={{ gridTemplateColumns: '1fr 2fr', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}>
              <span>Module</span><span>Collects → Sheet tab</span>
            </div>
            {[
              { m: 'contact',    s: 'Name, email, message, subject. The universal module — on every site.' },
              { m: 'newsletter', s: 'Email, first name, opt-in timestamp. Subscribers accumulate in Sheet.' },
              { m: 'booking',    s: 'Name, email, date, time, service, notes. Appointment request form.' },
              { m: 'quote',      s: 'Name, email, company, project type, budget range, description. RFQ form.' },
              { m: 'apply',      s: 'Name, email, role, resume_url (Drive), cover letter. Job application form.' },
              { m: 'rsvp',       s: 'Name, email, event_id, headcount, dietary notes. Event RSVP form.' },
              { m: 'intake',     s: 'Fully custom — column names defined in _config. Any intake or survey form.' },
            ].map(({ m, s }, i) => (
              <div key={m} className="grid px-4 py-2.5 text-xs items-start"
                style={{ gridTemplateColumns: '1fr 2fr', borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)' }}>
                <Mono>{m}</Mono>
                <span style={{ color: 'var(--color-muted)' }}>{s}</span>
              </div>
            ))}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
            Any number of form modules can coexist on one site — a restaurant can have contact + booking + rsvp
            all writing to separate Sheet tabs. Each is provisioned independently (1 credit each).
          </p>
        </Card>
      </div>

      {/* Business type matrix */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Any business type — pre-built combinations</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>These are templates: curated module selections, not locked layouts. Any module can be added or removed.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { biz: 'Digital Agency', mods: 'hero · services · team · testimonials · blog · contact · stats', form: 'contact + quote' },
            { biz: 'Freelance Portfolio', mods: 'hero · gallery · services · testimonials · blog · contact', form: 'contact' },
            { biz: 'Restaurant / Cafe', mods: 'hero · menu · gallery · events · testimonials · locations', form: 'contact + booking + rsvp' },
            { biz: 'Law Firm', mods: 'hero · services · team · testimonials · faq · blog · locations', form: 'contact + intake' },
            { biz: 'Medical Practice', mods: 'hero · services · team · faq · testimonials · locations', form: 'contact + booking + intake' },
            { biz: 'SaaS / App Landing', mods: 'hero · stats · services · pricing · faq · testimonials · blog', form: 'contact + newsletter' },
            { biz: 'E-commerce (light)', mods: 'hero · products · gallery · testimonials · faq · blog', form: 'contact + newsletter' },
            { biz: 'Non-profit', mods: 'hero · stats · events · team · partners · press · timeline', form: 'contact + newsletter + rsvp' },
            { biz: 'Real Estate Agent', mods: 'hero · gallery · services · testimonials · stats · locations', form: 'contact + booking + quote' },
            { biz: 'Personal Brand / Speaker', mods: 'hero · blog · events · press · testimonials · resources', form: 'contact + newsletter + booking' },
            { biz: 'Fitness / Wellness Studio', mods: 'hero · services · team · events · gallery · testimonials', form: 'contact + booking + newsletter' },
            { biz: 'Tech Startup', mods: 'hero · stats · services · team · press · jobs · blog · faq', form: 'contact + newsletter + apply' },
            { biz: 'Consulting Firm', mods: 'hero · services · team · case studies (blog) · partners · stats', form: 'contact + quote' },
            { biz: 'Event / Conference', mods: 'hero · events · team (speakers) · partners (sponsors) · faq · gallery', form: 'contact + rsvp + newsletter' },
            { biz: 'Photography Studio', mods: 'hero · gallery · services · pricing · testimonials · blog', form: 'contact + booking + quote' },
            { biz: 'Accounting / Finance', mods: 'hero · services · team · faq · resources · testimonials · blog', form: 'contact + intake + quote' },
            { biz: 'Contractor / Trades', mods: 'hero · services · gallery · testimonials · stats · locations', form: 'contact + quote + booking' },
            { biz: 'School / Tutoring', mods: 'hero · services · team · events · faq · testimonials', form: 'contact + booking + newsletter' },
          ].map(({ biz, mods, form }) => (
            <div key={biz} className="rounded-lg p-3 flex flex-col gap-1.5"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{biz}</p>
              <p className="text-[10px] font-mono leading-relaxed" style={{ color: 'var(--color-accent)' }}>{mods}</p>
              <p className="text-[10px]" style={{ color: 'var(--color-subtle)' }}>Forms: {form}</p>
            </div>
          ))}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
          These 18 combinations cover the vast majority of small-to-medium business websites.
          Each is a starting point — users add or remove modules as their business evolves.
          A photography studio that starts a blog adds the blog module for 1 credit, no re-provisioning needed.
        </p>
      </div>

      {/* Template system */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Template system — visual styles, not cages</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>A template is a visual style + a curated starting module set. Modules are independent of the template.</p>
        </div>
        <Card>
          <SectionLabel>How the compile step works</SectionLabel>
          <CodeBlock>{`// At provision time, rgforms builds the script source from parts:

1. Core engine    — doGet router, CacheService, onEdit trigger, renderPage()
2. Active modules — only the modules the user selected are compiled in
                    (unused modules = zero bytes in the deployed script)
3. Visual theme   — the HTML/CSS template for the chosen style
4. Site config    — MODULE_LIST, SCRIPT_URL constants injected as literals

// Result: one self-contained .gs file uploaded via Apps Script API.
// The deployed script has no runtime dependency on rgforms whatsoever.

// Theme change (color, font): user edits _config Sheet — no recompile.
// Module add:     user requests +1 module from dashboard → 1 credit →
//                 rgforms recompiles + redeploys the script in-place.
// Template swap:  user picks a new visual style → 2 credits →
//                 same modules, new HTML/CSS wrapper, redeployed.`}
          </CodeBlock>
        </Card>
        <Card>
          <SectionLabel>Visual styles library</SectionLabel>
          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--color-muted)' }}>
            Styles are independent of module content — any style works with any module combination.
            Users pick a style at setup and can swap it any time (2 credits for a recompile).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { name: 'Clean',       desc: 'White background, generous whitespace, Inter font. Safe, professional, universal.', tag: 'Default' },
              { name: 'Bold',        desc: 'Large type, high contrast, accent color sections. High-energy agencies and studios.', tag: '' },
              { name: 'Minimal',     desc: 'Near-monochrome, tight grid, no borders. Suits portfolio and personal brand sites.', tag: '' },
              { name: 'Warm',        desc: 'Cream background, serif headings, earthy tones. Restaurants, wellness, artisans.', tag: '' },
              { name: 'Corporate',   desc: 'Navy/gray palette, structured grid, formal type. Law, finance, consulting.', tag: '' },
              { name: 'Playful',     desc: 'Rounded cards, bright accents, relaxed layout. Schools, studios, consumer apps.', tag: '' },
              { name: 'Dark',        desc: 'Dark background, neon accent, code-like details. Tech, SaaS, developer tools.', tag: '' },
              { name: 'Magazine',    desc: 'Multi-column editorial grid, prominent imagery. Media, blogs, news outlets.', tag: '' },
              { name: 'Storefront',  desc: 'Product-card grid, price badges, CTA-heavy. E-commerce light, catalogs.', tag: '' },
            ].map(({ name, desc, tag }) => (
              <div key={name} className="rounded-lg p-3 flex flex-col gap-1"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{name}</p>
                  {tag && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                    style={{ color: 'oklch(0.65 0.22 285)', background: 'oklch(0.65 0.22 285 / 0.10)', border: '1px solid oklch(0.65 0.22 285 / 0.30)' }}>{tag}</span>}
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: 'var(--color-subtle)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionLabel>Section ordering — controlled entirely by the nav Sheet tab</SectionLabel>
          <CodeBlock>{`Tab: nav
  label          | page      | order | hidden
  Home           | home      | 1     | FALSE
  Services       | services  | 2     | FALSE
  Our Work       | gallery   | 3     | FALSE
  Blog           | blog      | 4     | FALSE
  About          | team      | 5     | FALSE
  Contact        | contact   | 6     | FALSE
  Client Login   | —         | 7     | TRUE   ← hidden from nav, page still exists

// Reorder: change the order column. Site reflects it on next page view.
// Hide a section: set hidden=TRUE. Module still compiled, just removed from nav.
// Add a page: user adds 1 row here + the module was provisioned → it appears.`}
          </CodeBlock>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
            Navigation is data, not code. Clients can reorder their own nav by editing this tab —
            no developer needed, no re-provisioning, no credits spent.
          </p>
        </Card>
      </div>

      {/* SEO */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>SEO on the free tier</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>What Apps Script can do. What it can&apos;t. Honest limits with a clear upgrade path.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <SectionLabel>What works</SectionLabel>
            <BulletList items={[
              '<title> and <meta description> per page via HtmlService.setTitle() + addMetaTag()',
              'Open Graph tags: og:title, og:description, og:image — injected server-side on every page',
              'JSON-LD structured data: LocalBusiness, BlogPosting, Person — auto-built from Sheet rows',
              'Sitemap XML: served at ?format=sitemap from blog + custom pages tabs',
              'RSS feed: served at ?format=rss — Atom-compatible, great for content distribution',
              'Google Analytics 4: GA tag injected automatically from ga_id in _config Sheet',
              'Server-side rendering: full HTML returned to crawler, no JS execution required',
            ]} />
          </Card>
          <Card>
            <SectionLabel>Limitations (honest)</SectionLabel>
            <BulletList items={[
              'Domain is script.google.com — not the user\'s brand. Search Console can\'t verify ownership.',
              'URL structure: ?page=blog&slug=my-post — not clean path-based. Works, but non-ideal.',
              'HTTP status: Apps Script always returns 200 — no real 404 pages for crawlers.',
              'No robots.txt at the script URL — can\'t configure crawl directives.',
              'Cold-start latency: 500ms–1.5s on first hit after idle (5-min cache eliminates for repeat visitors).',
              '→ All solved by upgrading to the gateway tier (real domain, path URLs, proper HTTP).',
            ]} color="oklch(0.65 0.15 25)" />
          </Card>
        </div>
        <Card>
          <SectionLabel>JSON-LD structured data — auto-generated from Sheet rows, zero config</SectionLabel>
          <CodeBlock>{`// Home page → LocalBusiness schema
{ "@context": "https://schema.org", "@type": "LocalBusiness",
  "name": config.site_name, "description": config.meta_description,
  "image": config.logo_url, "url": scriptUrl }

// Blog post → BlogPosting schema
{ "@context": "https://schema.org", "@type": "BlogPosting",
  "headline": post.title, "author": { "@type": "Person", "name": post.author },
  "datePublished": post.date, "image": post.og_image,
  "description": post.meta_description }

// Team page → ItemList of Person schemas
{ "@context": "https://schema.org", "@type": "ItemList",
  "itemListElement": team.map((m, i) => ({
    "@type": "ListItem", "position": i + 1,
    "item": { "@type": "Person", "name": m.name, "jobTitle": m.title,
               "image": m.photo_url, "sameAs": [m.linkedin, m.twitter] }
  })) }

// FAQ page → FAQPage schema (Google shows these as rich results in search)
{ "@context": "https://schema.org", "@type": "FAQPage",
  "mainEntity": faqs.map(f => ({
    "@type": "Question", "name": f.question,
    "acceptedAnswer": { "@type": "Answer", "text": f.answer }
  })) }`}
          </CodeBlock>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
            FAQ schema is particularly valuable — Google surfaces FAQ rich results directly in search with zero
            additional configuration. Just fill in the faq Sheet tab.
          </p>
        </Card>
        <Card>
          <SectionLabel>Sitemap + RSS — served from the same script URL</SectionLabel>
          <CodeBlock>{`// ?format=sitemap → ContentService returns XML
function serveSitemap() {
  const posts  = getBlogPosts();
  const pages  = ['home', 'services', 'team', 'faq', 'contact', 'gallery'];
  const base   = ScriptApp.getService().getUrl();

  const urls = [
    ...pages.map(p => \`<url><loc>\${base}?page=\${p}</loc></url>\`),
    ...posts.map(p => \`<url><loc>\${base}?page=blog&slug=\${p.slug}</loc>
                          <lastmod>\${p.date}</lastmod></url>\`),
  ].join('\\n');

  return ContentService
    .createTextOutput(\`<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\${urls}</urlset>\`)
    .setMimeType(ContentService.MimeType.XML);
}`}
          </CodeBlock>
        </Card>
      </div>

      {/* Google ecosystem depth */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Google ecosystem depth</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Features that are free because they live inside Google&apos;s platform — not in spite of it.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: 'Google Drive for media', body: 'Images live in Google Drive, referenced by file ID. Apps Script generates the public sharing URL programmatically. Logo, blog thumbnails, portfolio images — zero-cost media hosting with the user\'s own storage quota.' },
            { title: 'Google Analytics 4', body: 'The ga_id value from _config injects a GA4 <script> tag into every page. Full pageview tracking, scroll depth, form events — at zero cost to rgforms. The user sees their traffic in Google Analytics, not in a separate rgforms dashboard.' },
            { title: 'Google Fonts', body: 'Font choice in _config (Inter, Playfair Display, Roboto, etc.) injects a Google Fonts <link> tag. Professional typography from Google\'s CDN at zero cost.' },
            { title: 'Google Maps embed', body: 'Address in _config generates a Maps embed iframe (no API key needed for embed URLs). Essential for restaurants and local businesses. Shows up on the contact and home pages automatically.' },
            { title: 'YouTube embeds', body: 'Any youtube.com URL in an image_url or video_url column is automatically converted to a responsive embed iframe. Video content — product demos, testimonials, tutorials — requires zero additional setup.' },
            { title: 'Site search', body: '?page=search&q=keyword queries all Sheet tabs simultaneously — blog titles, service names, FAQ questions, team bios. Full-text search with zero Algolia or Elasticsearch dependency. Results ranked by relevance score computed in the script.' },
            { title: 'Markdown in blog body', body: 'Blog post body column accepts Markdown. A lightweight JS Markdown renderer (marked.js, ~30KB) is compiled into the script template. Users write formatted content in plain text — no rich text editor needed.' },
            { title: 'Multilingual via LanguageApp', body: 'Apps Script includes LanguageApp.translate(text, from, to). A ?lang=es query param on any page triggers auto-translation of all visible text. Experimental but possible entirely within Google\'s infrastructure.' },
          ].map(({ title, body }) => (
            <div key={title} className="rounded-lg p-3 flex flex-col gap-1.5"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* HIPAA angle */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>HIPAA advantage — carried forward</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>The sites tier inherits the free tier&apos;s compliance architecture by construction.</p>
        </div>
        <CalloutBox accent>
          <Strong>The pitch:</Strong> &ldquo;Every form submission — contact requests, intake forms, newsletter signups — flows
          directly from the patient&apos;s browser to your Google Sheet. rgforms is never in that path.
          If your Google Workspace account has a signed BAA with Google (which covers Sheets and Apps Script),
          your entire website is HIPAA-compatible. We don&apos;t need to sign a BAA with you because we never
          touch your data — not at runtime, not ever on this tier.&rdquo;
        </CalloutBox>
        <Card>
          <BulletList items={[
            'Therapist practice sites, medical provider directories, patient intake forms — all viable on this tier',
            'The website itself is served by Apps Script (Google) — no rgforms server sees the HTTP request',
            'Submissions go browser → Apps Script → Sheet (Google infrastructure, covered by Workspace BAA)',
            'rgforms stores: module metadata, script URL, sheet URL. No form payloads. No patient data. Ever.',
            'This is not a feature to add later — it is the default architecture of this entire tier.',
          ]} />
        </Card>
      </div>

      {/* Monetization */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Monetization — three engines</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Credits, badge traffic, and the Google URL that sells every upgrade itself.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <SectionLabel>1. Site provisioning credits</SectionLabel>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              A full site bundle (6 modules) costs <Strong>3 credits</Strong> — discounted vs. provisioning each
              individually. Extra modules added later: 1 credit each. Template re-provision: 2 credits.
            </p>
            <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--color-subtle)' }}>
              Agencies building for clients buy the $40 pack (150 credits) and provision 50 client sites.
              That&apos;s $0.80/site — far cheaper than any managed hosting solution they can name.
            </p>
          </Card>
          <Card accent>
            <SectionLabel>2. Badge flywheel</SectionLabel>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Every free site has &ldquo;Powered by rgforms&rdquo; in the footer, linking to rgforms.app.
              A site with 500 visitors/month = 500 brand impressions. At 10,000 live sites:
              <Strong> 5M impressions/month at $0 ad spend.</Strong>
            </p>
            <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--color-subtle)' }}>
              At 0.1% CTR → 5,000 new visitors/month from the badge alone. Badge removal is the
              first upgrade trigger ($9/mo Builder plan). This is the Mailchimp model applied to websites.
            </p>
          </Card>
          <Card>
            <SectionLabel>3. The URL that sells itself</SectionLabel>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Every free site URL is <Mono>script.google.com/macros/d/AKfy…/exec</Mono>.
              The ugliest URL in web development. Every client who sees it asks for a real domain.
              Every developer who demos a client site feels this pain immediately.
            </p>
            <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--color-subtle)' }}>
              Builder ($9/mo) → <Mono>rg.fm/client</Mono>. Pro ($24/mo) → vanity slug.
              Business ($59/mo) → custom domain. The URL sells every tier with zero sales effort.
            </p>
          </Card>
        </div>
      </div>

      {/* Upgrade triggers */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Upgrade triggers — sites specific</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>The exact moments a sites user becomes a paying customer.</p>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { trigger: 'The URL conversation', detail: 'Client sees script.google.com in their browser and asks "can we have a real domain?" Developer upgrades to Builder ($9/mo) for rg.fm/client-name. This single conversation is the highest-converting upgrade moment in the product — it happens on every client engagement.' },
            { trigger: 'Badge on a client deliverable', detail: '"Powered by rgforms" in a client\'s footer is unprofessional. Any developer building for a client will pay $9/mo to remove it before the site goes live. The badge is doing direct sales work on every live site.' },
            { trigger: 'Google Search Console rejection', detail: '"Why isn\'t my site showing up on Google?" The script.google.com domain is the answer — Search Console won\'t verify it. Gateway tier with a clean domain solves this. It\'s the most emotionally compelling reason to upgrade.' },
            { trigger: 'Template change friction', detail: 'Re-provisioning for a template change costs 2 credits. After paying for credits twice to change templates, the user sees that a paid plan includes unlimited re-provisioning. Show the cost comparison at credit checkout.' },
            { trigger: 'Multiple client sites compound cost', detail: 'Building a second client site costs another 3 credits. A developer building 5 sites/month spends ~15 credits/month. At $0.37/credit (mid pack), that\'s $5.55/mo on credits alone — $9/mo for Builder starts to look obvious.' },
            { trigger: 'Content editor access conflict', detail: 'User shares the Google Sheet with a client or content writer for editing. But sharing the Sheet also exposes the Apps Script code. Pro plan\'s dashboard-based content editing solves this without exposing the underlying script.' },
          ].map(({ trigger, detail }) => (
            <div key={trigger} className="flex flex-col gap-1 rounded-lg p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{trigger}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Build phases */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>What to build — sites tier</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Three phases. Phase 1 is launchable alongside the existing free tier — no new infra needed.</p>
        </div>
        <PhaseCard
          number={1}
          title="Sites MVP — Agency + Portfolio templates"
          timeline="6–8 weeks"
          cost="$0 new infra"
          outcome="Users can provision a full working website — blog, team, services, contact — running entirely in Google's infrastructure."
          steps={[
            'Write the Apps Script site template in TypeScript as a compiled string (doGet router + CacheService + onEdit trigger)',
            'Build 2 HTML/CSS templates: agency (services · team · testimonials · contact) and portfolio (gallery · blog · contact)',
            'Extend provisioning API: create multi-tab Sheet structure, compile chosen template into script source, deploy',
            'Update credit system: site bundle = 3 credits (vs 1 credit per individual module)',
            'Add Sites section to rgforms dashboard: site URL, module list, "Open Sheet" link, "Rebuild" button',
            'Inject GA4 tag if ga_id is present in _config. Inject "Powered by rgforms" badge in all template footers.',
            'Provision the onEdit trigger and hourly scheduled-publishing trigger automatically during setup',
          ]}
        />
        <PhaseCard
          number={2}
          title="SEO suite + 4 more templates"
          timeline="4–6 weeks"
          cost="$0 new infra"
          outcome="Sites are SEO-complete with structured data, sitemaps, and RSS. Template library covers 90% of small-business use cases."
          steps={[
            'Add sitemap.xml: ?format=sitemap reads blog slugs + custom pages, returns valid XML urlset',
            'Add RSS feed: ?format=rss — Atom-compatible XML from blog tab',
            'Inject JSON-LD per page type: LocalBusiness (home), BlogPosting (blog post), FAQPage (faq tab), Person (team)',
            'Per-row SEO: meta_description and og_image columns parsed per page; fall back to _config defaults',
            'Add site search: ?page=search&q= filters all Sheet tabs, returns scored results rendered as HTML',
            'Build 4 new templates: blog, small-business, restaurant, saas-landing',
            'Google Drive media helper: function converts Drive file ID to public sharing URL in rendered HTML',
            'Markdown rendering in blog body: compile marked.js (~30KB) into the script template',
          ]}
        />
        <PhaseCard
          number={3}
          title="Template editor + agency dashboard"
          timeline="When Phase 2 is live"
          cost="~$20/mo (Firestore metadata only)"
          outcome="Agencies manage multiple client sites from one dashboard. Non-technical users customize appearance without touching the Sheet."
          steps={[
            'Theme customizer in rgforms dashboard: pick primary_color, font, accent — writes directly to _config Sheet',
            'Module toggle: enable/disable sections from dashboard UI without touching the Sheet tab',
            'Multi-site view: all provisioned sites with status, last-edit time, analytics ping count',
            'Site clone: duplicate a site\'s Sheet structure + script for a new client — 1 credit to re-provision',
            'Analytics ping for page views (same /api/ping model as form submissions) — visible in dashboard',
            'Agency white-label badge: "Powered by [Agency Name]" instead of "Powered by rgforms" — paid add-on ($4/mo)',
          ]}
        />
      </div>

// ─── Tabs shell ───────────────────────────────────────────────────────────────

const TABS = [
  { id: 'starter', label: 'Starter Plan', sublabel: 'Free · No gateway' },
  { id: 'gateway', label: 'Gateway Plans', sublabel: 'Builder · Pro · Business' },
  { id: 'sites', label: 'Sites Plan', sublabel: 'AI-powered · Custom domains · Export' },
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
      {active === 'starter' ? <StarterTab /> : active === 'gateway' ? <GatewayTab /> : <SitesTab />}
    </div>
  );
}
