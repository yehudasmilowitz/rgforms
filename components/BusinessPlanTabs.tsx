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
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>The concept</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Zero-infrastructure websites. Google Sheets as CMS. Apps Script as web server. Google hosts everything.</p>
        </div>
        <CalloutBox accent>
          <Strong>The pitch:</Strong> &ldquo;Squarespace gives you a rigid template. Webflow charges $23/mo and
          takes your data hostage. rgforms Sites works like Lego: pick the modules your business actually needs —
          blog, menu, services, gallery, events, team, FAQ, testimonials — in any combination, any order.
          Every piece of content lives in a Google Sheet you own. Edit a row, the site updates instantly.
          And because Google hosts everything, this costs us nothing to run — so it&apos;s free for you to start.&rdquo;
        </CalloutBox>
        <Card>
          <SectionLabel>The core modularity principle</SectionLabel>
          <BulletList items={[
            'Modules are independent units — each one is a Sheet tab + a rendered page section + an optional form handler',
            'Templates are just curated starting sets — preset module selections with a visual style, not a cage',
            'Any module can be added to any template at any time (1 credit each) — the site grows with the business',
            'Section order is controlled by the nav Sheet tab — drag rows to reorder without re-provisioning',
            'A module can appear as a full page AND as a section on the home page simultaneously (one tab, two views)',
            'Google Apps Script compiles all active modules into one deployed script — zero runtime dependencies on rgforms',
          ]} />
        </Card>
      </div>

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

      {/* Revenue projections */}
      <div className="flex flex-col gap-4">
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <p className="text-base font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Revenue projections — sites tier</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Credit packs + badge-driven new users. Before any gateway upgrades are counted.</p>
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
          <div className="grid px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
            style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}>
            <span>Sites live</span><span>Credit buyers (30%)</span><span>Avg pack</span><span>Badge signups/mo</span>
            <span style={{ color: 'oklch(0.72 0.18 145)' }}>Monthly Rev</span>
          </div>
          {[
            { s: '100', b: '30', a: '$15', bg: '50', r: '$450' },
            { s: '1,000', b: '300', a: '$18', bg: '500', r: '$5,400' },
            { s: '5,000', b: '1,500', a: '$20', bg: '2,500', r: '$30,000' },
          ].map(({ s, b, a, bg, r }, i) => (
            <div key={s} className="grid px-5 py-3 text-sm"
              style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)', color: 'var(--color-muted)' }}>
              <span>{s}</span><span>{b}</span><span>{a}</span><span>{bg}</span>
              <span className="font-bold" style={{ color: 'oklch(0.72 0.18 145)', fontFamily: 'var(--font-display)' }}>{r}</span>
            </div>
          ))}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
          Site builders buy larger credit packs than form-only users (avg $18–20 vs $7) because a full
          site costs 3 credits plus individual module additions. Badge-driven signups compound over time —
          each new user may build another site, driving more impressions. Infra cost at 5,000 sites: $0/mo.
        </p>
      </div>

    </div>
  );
}

// ─── Tabs shell ───────────────────────────────────────────────────────────────

const TABS = [
  { id: 'starter', label: 'Starter Plan', sublabel: 'Free · No gateway' },
  { id: 'gateway', label: 'Gateway Plans', sublabel: 'Builder · Pro · Business' },
  { id: 'sites', label: 'Sites Plan', sublabel: 'Google-native · $0 infra' },
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
