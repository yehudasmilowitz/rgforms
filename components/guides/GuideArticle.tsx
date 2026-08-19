import Link from 'next/link';
import { ArrowRight, Check, Info, Sparkles, TriangleAlert } from 'lucide-react';
import type { Guide, Section } from '@/lib/guides/types';
import { getGuide } from '@/lib/guides';
import RichText from '@/components/guides/RichText';
import CodeCard from '@/components/guides/CodeCard';
import CtaBand from '@/components/landing/CtaBand';

const TONES = {
  info: { bg: 'var(--color-info-bg)', border: 'var(--color-info-border)', fg: 'var(--color-info)', Icon: Info },
  success: { bg: 'var(--color-success-bg)', border: 'var(--color-success-border)', fg: 'var(--color-success)', Icon: Check },
  warning: { bg: 'var(--color-warning-bg)', border: 'var(--color-warning-border)', fg: 'var(--color-warning)', Icon: TriangleAlert },
} as const;

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[length:var(--text-xl)] font-extrabold tracking-tight mt-2"
      style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}
    >
      {children}
    </h2>
  );
}

function Paragraph({ text }: { text: string }) {
  return (
    <p className="text-[15px] leading-[1.75]" style={{ color: 'var(--color-text)' }}>
      <RichText text={text} />
    </p>
  );
}

function SectionBlock({ section }: { section: Section }) {
  switch (section.type) {
    case 'prose':
      return (
        <section className="flex flex-col gap-3">
          {section.heading && <H2>{section.heading}</H2>}
          {section.body.map((p, i) => (
            <Paragraph key={i} text={p} />
          ))}
        </section>
      );

    case 'steps':
      return (
        <section className="flex flex-col gap-4">
          <H2>{section.heading}</H2>
          {section.intro && <Paragraph text={section.intro} />}
          <ol className="flex flex-col gap-5 mt-1">
            {section.steps.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span
                  className="shrink-0 w-8 h-8 rounded-full grid place-items-center text-sm font-extrabold"
                  style={{
                    background: 'var(--color-accent-subtle)',
                    color: 'var(--color-accent-ink)',
                    border: '1px solid var(--color-accent-border)',
                  }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex flex-col gap-2 pt-0.5">
                  <h3 className="text-base font-bold" style={{ color: 'var(--color-heading)' }}>
                    {step.title}
                  </h3>
                  <Paragraph text={step.body} />
                  {step.code && <CodeCard code={step.code} />}
                </div>
              </li>
            ))}
          </ol>
        </section>
      );

    case 'code':
      return (
        <section className="flex flex-col gap-3">
          {section.heading && <H2>{section.heading}</H2>}
          {section.intro && <Paragraph text={section.intro} />}
          <CodeCard code={section.code} />
          {section.note && (
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              <RichText text={section.note} />
            </p>
          )}
        </section>
      );

    case 'callout': {
      const tone = TONES[section.tone];
      return (
        <aside
          className="rounded-[var(--radius-lg)] p-5 flex gap-3.5"
          style={{ background: tone.bg, border: `1px solid ${tone.border}` }}
        >
          <tone.Icon size={18} className="shrink-0 mt-0.5" style={{ color: tone.fg }} aria-hidden="true" />
          <div className="min-w-0 flex flex-col gap-2">
            {section.heading && (
              <p className="text-sm font-bold" style={{ color: 'var(--color-heading)' }}>
                {section.heading}
              </p>
            )}
            {section.body.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                <RichText text={p} />
              </p>
            ))}
          </div>
        </aside>
      );
    }

    case 'table':
      return (
        <section className="flex flex-col gap-3">
          {section.heading && <H2>{section.heading}</H2>}
          {section.intro && <Paragraph text={section.intro} />}
          <div
            className="overflow-x-auto rounded-[var(--radius-lg)]"
            style={{ border: '1px solid var(--color-border)' }}
          >
            <table className="w-full text-left text-sm border-collapse min-w-[540px]">
              <thead>
                <tr style={{ background: 'var(--color-surface-2)' }}>
                  {section.columns.map((c) => (
                    <th
                      key={c}
                      scope="col"
                      className="px-4 py-3 font-bold align-bottom"
                      style={{ color: 'var(--color-heading)', borderBottom: '1px solid var(--color-border)' }}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, ri) => (
                  <tr key={ri} style={{ background: ri % 2 ? 'var(--color-surface-2)' : 'var(--color-surface)' }}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="px-4 py-3 align-top leading-relaxed"
                        style={{
                          color: ci === 0 ? 'var(--color-heading)' : 'var(--color-text)',
                          fontWeight: ci === 0 ? 600 : 400,
                          borderTop: ri ? '1px solid var(--color-border)' : undefined,
                        }}
                      >
                        <RichText text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {section.note && (
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              <RichText text={section.note} />
            </p>
          )}
        </section>
      );

    case 'checklist':
      return (
        <section className="flex flex-col gap-3">
          <H2>{section.heading}</H2>
          {section.intro && <Paragraph text={section.intro} />}
          <ul className="flex flex-col gap-3 mt-1">
            {section.items.map((item) => (
              <li key={item.label} className="flex gap-3">
                <span
                  className="shrink-0 w-5 h-5 rounded-full grid place-items-center mt-0.5"
                  style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent-ink)' }}
                  aria-hidden="true"
                >
                  <Check size={12} strokeWidth={3} />
                </span>
                <p className="text-[15px] leading-[1.7]" style={{ color: 'var(--color-text)' }}>
                  <strong style={{ color: 'var(--color-heading)', fontWeight: 700 }}>{item.label}</strong>
                  {item.body ? <> — <RichText text={item.body} /></> : null}
                </p>
              </li>
            ))}
          </ul>
        </section>
      );
  }
}

export default function GuideArticle({ guide }: { guide: Guide }) {
  const related = guide.related.map(getGuide).filter((g): g is Guide => Boolean(g));
  const updated = new Date(`${guide.updated}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <main style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {/* Header band */}
      <header className="relative overflow-hidden px-4 pt-12 pb-10 sm:pt-16">
        <div className="mesh-bg" aria-hidden="true" />
        <div className="absolute inset-0 dot-grid pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col gap-4">
          <nav aria-label="Breadcrumb" className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
            <Link href="/" className="hover:underline">
              RG Forms
            </Link>
            <span className="mx-1.5" aria-hidden="true">/</span>
            <Link href="/guides" className="hover:underline">
              Guides
            </Link>
          </nav>

          <span
            className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: 'var(--color-accent-subtle)',
              border: '1px solid var(--color-accent-border)',
              color: 'var(--color-accent-ink)',
            }}
          >
            <Sparkles size={12} /> {guide.eyebrow}
          </span>

          <h1
            className="text-[length:var(--text-3xl)] font-extrabold leading-[1.12] tracking-tight"
            style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}
          >
            {guide.title}
          </h1>

          {guide.intro.map((p, i) => (
            <p key={i} className="text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              <RichText text={p} />
            </p>
          ))}

          <p className="text-xs" style={{ color: 'var(--color-subtle)' }}>
            Last updated {updated}
          </p>
        </div>
      </header>

      <article className="px-4 pb-16">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">
          {/* The extractable answer */}
          <div
            className="rounded-[var(--radius-lg)] p-5 sm:p-6 flex flex-col gap-2"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderLeft: '4px solid var(--color-accent)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-accent-ink)' }}>
              The short answer
            </p>
            <p className="text-[15px] leading-[1.75]" style={{ color: 'var(--color-text)' }}>
              <RichText text={guide.answer} />
            </p>
          </div>

          {guide.sections.map((section, i) => (
            <SectionBlock key={i} section={section} />
          ))}

          {guide.faq.length > 0 && (
            <section className="flex flex-col gap-5">
              <H2>Common questions</H2>
              {guide.faq.map((item) => (
                <div key={item.q} className="flex flex-col gap-1.5">
                  <h3 className="text-base font-bold" style={{ color: 'var(--color-heading)' }}>
                    {item.q}
                  </h3>
                  <p className="text-[15px] leading-[1.7]" style={{ color: 'var(--color-text)' }}>
                    <RichText text={item.a} />
                  </p>
                </div>
              ))}
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                More answers in the{' '}
                <Link
                  href="/faq"
                  className="underline underline-offset-2 hover:no-underline"
                  style={{ color: 'var(--color-accent-ink)', fontWeight: 600 }}
                >
                  full FAQ
                </Link>
                .
              </p>
            </section>
          )}
        </div>
      </article>

      <CtaBand />

      {related.length > 0 && (
        <section className="px-4 py-16" style={{ background: 'var(--color-bg)' }}>
          <div className="max-w-3xl mx-auto flex flex-col gap-5">
            <H2>Keep reading</H2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/${r.slug}`}
                  className="card card-hover p-5 flex flex-col gap-2 group"
                >
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-accent-ink)' }}>
                    {r.eyebrow}
                  </span>
                  <span className="font-bold leading-snug" style={{ color: 'var(--color-heading)' }}>
                    {r.title}
                  </span>
                  <span className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    {r.cardBlurb}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 text-sm font-semibold mt-1"
                    style={{ color: 'var(--color-accent-ink)' }}
                  >
                    Read <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
            <Link
              href="/guides"
              className="text-sm font-semibold inline-flex items-center gap-1.5 w-fit"
              style={{ color: 'var(--color-accent-ink)' }}
            >
              Browse every guide <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
