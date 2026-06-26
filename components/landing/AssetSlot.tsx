'use client';

import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ImagePlus } from 'lucide-react';

interface AssetSlotProps {
  /** What illustration belongs here — shown so the slot is self-documenting */
  label: string;
  caption?: string;
  icon?: LucideIcon;
  className?: string;
  /** Tailwind aspect ratio class, e.g. "aspect-square" */
  ratio?: string;
  /**
   * Drop-in path under /public (e.g. "/illustrations/speed.png"). While the file
   * doesn't exist the <img> errors and the labelled placeholder shows; the moment
   * the real art is dropped at this path it renders automatically — zero code change.
   */
  src?: string;
  alt?: string;
}

/**
 * Visible, on-concept placeholder for an illustration that hasn't been produced
 * yet (commission / AI-generate per public/illustrations/ASSETS.md, then drop the
 * file at `src`). Never a blank gap or broken image.
 */
export default function AssetSlot({
  label,
  caption,
  icon: Icon = ImagePlus,
  className,
  ratio = 'aspect-[4/3]',
  src,
  alt,
}: AssetSlotProps) {
  // Preload: keep showing the placeholder until the real file actually loads, so a
  // missing asset never flashes a broken image. Drop the file at `src` → it appears.
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.onload = () => setLoaded(true);
    img.src = src;
  }, [src]);

  if (src && loaded) {
    return (
      <div className={`relative ${ratio} w-full ${className ?? ''}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt ?? label} className="w-full h-full object-contain" />
      </div>
    );
  }

  return (
    <div
      className={`group relative ${ratio} w-full overflow-hidden rounded-[var(--radius-2xl)] ${className ?? ''}`}
      style={{
        border: '2px dashed var(--color-accent-border)',
        background:
          'radial-gradient(70% 60% at 30% 20%, var(--color-accent-subtle), transparent 70%), radial-gradient(60% 60% at 85% 90%, var(--color-coral-soft), transparent 70%), var(--color-surface)',
      }}
      role="img"
      aria-label={`Illustration placeholder: ${label}`}
    >
      {/* floating decorative atoms so the slot never reads as empty */}
      <span className="absolute top-5 right-6 w-10 h-10 rounded-2xl animate-float-slow" style={{ background: 'var(--color-accent-subtle)' }} aria-hidden="true" />
      <span className="absolute bottom-8 left-7 w-6 h-6 rounded-full animate-float" style={{ background: 'var(--color-coral-soft)' }} aria-hidden="true" />
      <span className="absolute top-10 left-10 w-3 h-3 rounded-full" style={{ background: 'var(--color-accent-border)' }} aria-hidden="true" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <span
          className="inline-flex items-center justify-center w-12 h-12 rounded-2xl transition-transform group-hover:scale-110"
          style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-md)', color: 'var(--color-accent-ink)' }}
        >
          <Icon size={22} />
        </span>
        <p className="text-sm font-bold" style={{ color: 'var(--color-heading)', fontFamily: 'var(--font-display)' }}>
          {label}
        </p>
        {caption && (
          <p className="text-xs leading-relaxed max-w-[16rem]" style={{ color: 'var(--color-muted)' }}>
            {caption}
          </p>
        )}
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-subtle)' }}>
          Illustration placeholder
        </span>
      </div>
    </div>
  );
}
