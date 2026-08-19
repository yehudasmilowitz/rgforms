'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { revealUp, inView } from '@/lib/animations';

/**
 * Homepage answer to "does this work with my stack?" — and the internal-linking
 * hub into the per-host and per-framework guides.
 */
const HOSTS = [
  { label: 'GitHub Pages', href: '/github-pages-contact-form' },
  { label: 'Netlify', href: '/netlify-contact-form' },
  { label: 'Cloudflare Pages', href: '/cloudflare-pages-contact-form' },
  { label: 'Vercel', href: '/vercel-static-contact-form' },
];

const FRAMEWORKS = [
  { label: 'Plain HTML', href: '/html-contact-form-no-backend' },
  { label: 'React', href: '/react-contact-form-without-backend' },
  { label: 'Astro', href: '/astro-contact-form' },
  { label: 'Hugo', href: '/hugo-contact-form' },
  { label: 'Jekyll', href: '/jekyll-contact-form' },
  { label: 'AI-generated sites', href: '/contact-form-for-ai-generated-websites' },
];

function LinkRow({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-subtle)' }}>
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="chip transition-colors hover:border-[var(--color-accent-border)]"
            style={{ color: 'var(--color-text)' }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function WorksWith() {
  return (
    <section className="relative px-4 py-16 sm:py-20" style={{ background: 'var(--color-bg)' }}>
      <motion.div
        className="max-w-4xl mx-auto flex flex-col gap-8"
        variants={revealUp}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
      >
        <div className="flex flex-col gap-3 text-center">
          <h2
            className="text-[length:var(--text-2xl)] font-extrabold tracking-tight"
            style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}
          >
            Works with <span className="gradient-text">whatever you build with</span>
          </h2>
          <p className="text-base leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
            The integration is a single <code style={{ fontFamily: 'var(--font-mono)' }}>fetch</code> call,
            so there&apos;s no SDK, no build step and no host-specific magic. Here are the
            copy-paste versions for the usual suspects.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          <LinkRow title="Hosts" items={HOSTS} />
          <LinkRow title="Frameworks" items={FRAMEWORKS} />
        </div>

        <div className="flex justify-center">
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: 'var(--color-accent-ink)' }}
          >
            Every guide, including honest comparisons <ArrowRight size={15} />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
