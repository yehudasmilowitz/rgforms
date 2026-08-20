'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { revealUp, inView } from '@/lib/animations';
import BrandAvatar from '@/components/BrandAvatar';
import { BRAND_ICONS } from '@/components/brand-icons';

/**
 * Homepage answer to "does this work with my stack?" — and the internal-linking
 * hub into the per-host and per-framework guides.
 */
const HOSTS = [
  { label: 'GitHub Pages', href: '/github-pages-contact-form', icon: BRAND_ICONS.Github },
  { label: 'Netlify', href: '/netlify-contact-form', icon: BRAND_ICONS.Netlify },
  { label: 'Cloudflare', href: '/cloudflare-pages-contact-form', icon: BRAND_ICONS.CloudflarePages },
  { label: 'Vercel', href: '/vercel-static-contact-form', icon: BRAND_ICONS.Vercel },
];

const FRAMEWORKS = [
  { label: 'Plain HTML', href: '/html-contact-form-no-backend', icon: BRAND_ICONS.Html5 },
  { label: 'React', href: '/react-contact-form-without-backend', icon: BRAND_ICONS.React },
  { label: 'Astro', href: '/astro-contact-form', icon: BRAND_ICONS.Astro },
  { label: 'Hugo', href: '/hugo-contact-form', icon: BRAND_ICONS.Hugo },
  { label: 'Jekyll', href: '/jekyll-contact-form', icon: BRAND_ICONS.Jekyll },
];

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <p
        className="text-xs font-bold uppercase tracking-widest text-center"
        style={{ color: 'var(--color-muted)' }}
      >
        {title}
      </p>
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-7 sm:gap-x-10">{children}</div>
    </div>
  );
}

export default function WorksWith() {
  return (
    <section className="relative px-4 py-16 sm:py-24" style={{ background: 'var(--color-bg)' }}>
      <motion.div
        className="max-w-4xl mx-auto flex flex-col gap-12"
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
            so there&apos;s no SDK, no build step and no host-specific magic. Pick yours for the
            copy-paste version.
          </p>
        </div>

        <Group title="Hosts">
          {HOSTS.map((host) => (
            <BrandAvatar key={host.href} {...host} />
          ))}
        </Group>

        <Group title="Frameworks">
          {FRAMEWORKS.map((framework) => (
            <BrandAvatar key={framework.href} {...framework} />
          ))}
          <BrandAvatar
            label="AI-built"
            href="/contact-form-for-ai-generated-websites"
            glyph={<Sparkles size={22} style={{ color: 'var(--color-accent)' }} />}
          />
        </Group>

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
