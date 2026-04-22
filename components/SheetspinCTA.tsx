'use client';

export default function SheetspinCTA() {
  return (
    <a
      href="https://sheetspin.com"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-4 rounded-xl border px-5 py-4 transition-colors"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(108,99,255,0.4)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; }}
    >
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-subtle)' }}>
          From the makers of RG Forms
        </p>
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          Need a full website backend? Try Sheetspin →
        </p>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Instantly provision a complete multi-tab Google Sheet backend — blog, gallery, events, newsletter, site config, and more — in under 2 minutes.
        </p>
      </div>
      <span className="text-xl shrink-0" style={{ color: 'var(--color-accent)' }}>✦</span>
    </a>
  );
}
