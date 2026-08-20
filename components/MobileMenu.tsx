'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { GithubIcon } from '@/components/GithubIcon';

const REPO_URL = 'https://github.com/yehudasmilowitz/rgforms';

const LINKS = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Guides', href: '/guides' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

/**
 * Small-screen navigation. The header's links are hidden below `sm`, so
 * without this the only way to reach anything from a phone is the footer.
 * Follows the same dismissal rules as ThemeToggle: outside click, Escape, and
 * — since client-side navigation doesn't unmount us — a route change.
 */
export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative sm:hidden" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-[var(--color-surface-2)]"
        style={{ color: 'var(--color-muted)' }}
      >
        {open ? <X size={19} /> : <Menu size={19} />}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Site navigation"
          className="absolute right-0 mt-2 w-52 p-1.5 rounded-2xl z-50 animate-fade-in"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-[var(--color-surface-2)]"
                style={{ color: active ? 'var(--color-accent-ink)' : 'var(--color-text)' }}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="my-1.5 h-px" style={{ background: 'var(--color-border)' }} />

          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-[var(--color-surface-2)]"
            style={{ color: 'var(--color-text)' }}
          >
            <GithubIcon size={15} />
            Free &amp; open source
          </a>
        </div>
      )}
    </div>
  );
}
