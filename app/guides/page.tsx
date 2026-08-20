import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CATEGORY_META, CATEGORY_ORDER, GUIDES, guidesByCategory } from '@/lib/guides';
import SectionDivider from '@/components/landing/SectionDivider';
import { BRAND_ICONS, BrandGlyph } from '@/components/brand-icons';

const SITE_URL = 'https://rgforms.com';

export const metadata: Metadata = {
  title: 'Guides — Contact Forms for Static Sites',
  description:
    'Every guide to adding a working contact form to a static site: by host, by framework, and honest comparisons of the form backends worth considering.',
  alternates: { canonical: `${SITE_URL}/guides/` },
  openGraph: {
    title: 'RG Forms Guides — Contact Forms for Static Sites',
    description:
      'Step-by-step guides by host and framework, plus honest comparisons of the form backends worth considering.',
    url: `${SITE_URL}/guides/`,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'RG Forms Guides',
  url: `${SITE_URL}/guides/`,
  description:
    'Guides to adding a working contact form to a static website — by host, by framework, and comparisons of the available form backends.',
  hasPart: GUIDES.map((g) => ({
    '@type': 'TechArticle',
    headline: g.title,
    url: `${SITE_URL}/${g.slug}/`,
    description: g.description,
  })),
};

export default function GuidesPage() {
  return (
    <main style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="relative overflow-hidden px-4 pt-14 pb-24 sm:pb-28">
        <div className="mesh-bg" aria-hidden="true" />
        <div className="absolute inset-0 dot-grid pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col gap-4">
          <span
            className="inline-flex self-start items-center px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: 'var(--color-accent-subtle)',
              border: '1px solid var(--color-accent-border)',
              color: 'var(--color-accent-ink)',
            }}
          >
            {GUIDES.length} guides
          </span>
          <h1
            className="text-[length:var(--text-3xl)] font-extrabold tracking-tight leading-[1.1]"
            style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}
          >
            Contact forms on sites with <span className="gradient-text">no backend</span>
          </h1>
          <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'var(--color-muted)' }}>
            Everything we know about taking form submissions on a static site — the architectures,
            the copy-paste integrations for each host and framework, and straight comparisons of the
            tools worth considering, including the ones that aren&apos;t ours.
          </p>
        </div>

        {/* Wave seam out of the mesh, so the band never butts into the content. */}
        <SectionDivider overlay bottom="var(--color-bg)" />
      </header>

      <div className="px-4 pt-2 sm:pt-4 pb-20">
        <div className="max-w-5xl mx-auto flex flex-col gap-14">
          {CATEGORY_ORDER.map((category) => {
            const guides = guidesByCategory(category);
            const meta = CATEGORY_META[category];

            return (
              <section key={category} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <h2
                    className="text-[length:var(--text-xl)] font-extrabold tracking-tight"
                    style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}
                  >
                    {meta.title}
                  </h2>
                  <p className="text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--color-muted)' }}>
                    {meta.blurb}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {guides.map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/${guide.slug}`}
                      className="card card-hover p-5 flex flex-col gap-2 group"
                    >
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold"
                        style={{ color: 'var(--color-accent-ink)' }}
                      >
                        {guide.icon && <BrandGlyph icon={BRAND_ICONS[guide.icon]} size={13} />}
                        {guide.eyebrow}
                      </span>
                      <h3 className="font-bold leading-snug" style={{ color: 'var(--color-heading)' }}>
                        {guide.title}
                      </h3>
                      <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--color-muted)' }}>
                        {guide.cardBlurb}
                      </p>
                      <span
                        className="inline-flex items-center gap-1 text-sm font-semibold mt-1"
                        style={{ color: 'var(--color-accent-ink)' }}
                      >
                        Read{' '}
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}

          <div
            className="rounded-[var(--radius-lg)] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex flex-col gap-1">
              <p className="font-bold" style={{ color: 'var(--color-heading)' }}>
                Skip the reading?
              </p>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                Sign in with Google and your endpoint is live in about ninety seconds.
              </p>
            </div>
            <Link
              href="/"
              className="btn-gradient inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold shrink-0"
            >
              Create a form endpoint <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
