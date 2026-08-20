'use client';

import Link from 'next/link';
import { BRAND_ICONS, BrandGlyph, type BrandIcon } from '@/components/brand-icons';

/**
 * The hero's "works with your stack" proof: an overlapping avatar group of the
 * hosts and frameworks we ship guides for, so the headline copy doesn't have to
 * list eight names. Each tile links to its guide and keeps its name as
 * screen-reader (and crawler) text.
 */
const STACK: { label: string; href: string; icon: BrandIcon }[] = [
  { label: 'Plain HTML', href: '/html-contact-form-no-backend', icon: BRAND_ICONS.Html5 },
  { label: 'React', href: '/react-contact-form-without-backend', icon: BRAND_ICONS.React },
  { label: 'Astro', href: '/astro-contact-form', icon: BRAND_ICONS.Astro },
  { label: 'Hugo', href: '/hugo-contact-form', icon: BRAND_ICONS.Hugo },
  { label: 'Jekyll', href: '/jekyll-contact-form', icon: BRAND_ICONS.Jekyll },
  { label: 'GitHub Pages', href: '/github-pages-contact-form', icon: BRAND_ICONS.Github },
  { label: 'Netlify', href: '/netlify-contact-form', icon: BRAND_ICONS.Netlify },
  { label: 'Cloudflare Pages', href: '/cloudflare-pages-contact-form', icon: BRAND_ICONS.CloudflarePages },
  { label: 'Vercel', href: '/vercel-static-contact-form', icon: BRAND_ICONS.Vercel },
];

export default function StackAvatars() {
  return (
    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-2">
      <ul className="flex items-center">
        {STACK.map(({ label, href, icon }, i) => (
          <li key={href} className={i === 0 ? '' : '-ml-2'}>
            <Link href={href} className="stack-avatar" title={`${label} contact form guide`}>
              <BrandGlyph icon={icon} size={17} />
              <span className="sr-only">{label} contact form guide</span>
            </Link>
          </li>
        ))}
      </ul>
      <span className="text-xs sm:text-[13px] font-semibold" style={{ color: 'var(--color-muted)' }}>
        …and any other static site
      </span>
    </div>
  );
}
