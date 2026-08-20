import Link from 'next/link';
import type { ReactNode } from 'react';
import { BrandGlyph, type BrandIcon } from '@/components/brand-icons';

/**
 * One "works with X" avatar: a circular tile carrying the official brand mark
 * (or an arbitrary glyph for things that have no logo), with its name beneath,
 * linking to that platform's guide.
 */
export default function BrandAvatar({
  icon,
  glyph,
  label,
  href,
  size = 24,
}: {
  icon?: BrandIcon;
  glyph?: ReactNode;
  label: string;
  href: string;
  size?: number;
}) {
  return (
    <Link
      href={href}
      className="brand-link group flex flex-col items-center gap-2.5 text-center"
      aria-label={`${label} contact form guide`}
    >
      <span className="brand-tile">
        {icon ? <BrandGlyph icon={icon} size={size} /> : glyph}
      </span>
      <span
        className="text-[13px] font-semibold leading-tight transition-colors group-hover:text-[var(--color-accent-ink)]"
        style={{ color: 'var(--color-text)' }}
      >
        {label}
      </span>
    </Link>
  );
}
