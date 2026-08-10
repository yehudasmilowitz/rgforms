import Link from 'next/link';
import Image from 'next/image';
import { GoogleSheetsIcon, GoogleAppsScriptIcon, GoogleDriveIcon } from '@/components/google-icons';
import { GithubIcon } from '@/components/GithubIcon';

const REPO_URL = 'https://github.com/yehudasmilowitz/rgforms';

type FooterLink = { label: string; href: string; external?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '/how-it-works' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Get started', href: '/' },
      { label: 'Source on GitHub', href: REPO_URL, external: true },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
  {
    title: 'More from us',
    links: [
      { label: 'Sheetspin', href: 'https://sheetspin.com', external: true },
      { label: 'RG Marketing Group', href: 'https://rgmarketinggroup.com/', external: true },
    ],
  },
];

function FooterAnchor({ link }: { link: FooterLink }) {
  const cls = 'text-sm transition-colors hover:text-[var(--color-accent-ink)]';
  const style = { color: 'var(--color-muted)' };
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls} style={style}>
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={cls} style={style}>
      {link.label}
    </Link>
  );
}

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-auto relative"
      style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-2)' }}
    >
      {/* gradient hairline accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent, var(--grad-from), var(--grad-via), var(--grad-to), transparent)' }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-5 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 w-fit" aria-label="RG Forms home">
              <Image src="/favicon.svg" alt="RG Forms logo" width={30} height={30} />
              <span className="font-extrabold tracking-tight text-lg gradient-text" style={{ fontFamily: 'var(--font-display)' }}>
                RG Forms
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--color-muted)' }}>
              A live contact form endpoint in under 2 minutes — backed entirely by a Google Sheet you own.
              No server, no monthly fee. <span style={{ color: 'var(--color-heading)', fontWeight: 600 }}>Completely free and open source.</span>
            </p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 w-fit rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
              style={{
                background: 'var(--color-surface)',
                color: 'var(--color-heading)',
                border: '1px solid var(--color-border)',
              }}
            >
              <GithubIcon size={16} /> Star on GitHub
            </a>
            <a
              href="https://www.producthunt.com/products/rg-forms?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-rg-forms"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-90 transition-opacity w-fit"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="RG Forms - Add a contact form to any static site without a backend | Product Hunt"
                width={210}
                height={45}
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1168947&theme=light&t=1781144858758"
              />
            </a>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <nav key={col.title} className="lg:col-span-2 flex flex-col gap-3" aria-label={col.title}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-subtle)' }}>
                {col.title}
              </p>
              {col.links.map((link) => (
                <FooterAnchor key={link.label} link={link} />
              ))}
            </nav>
          ))}

          {/* Built on */}
          <div className="col-span-2 lg:col-span-1 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-subtle)' }}>
              Built on
            </p>
            <div className="flex items-center gap-2.5">
              <span title="Google Drive" className="opacity-80"><GoogleDriveIcon /></span>
              <span title="Google Sheets" className="opacity-80"><GoogleSheetsIcon /></span>
              <span title="Google Apps Script" className="opacity-80"><GoogleAppsScriptIcon /></span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-subtle)' }}
        >
          <span>© {year} RG Forms. All rights reserved.</span>
          <span>
            A project of{' '}
            <a
              href="https://rgmarketinggroup.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline hover:no-underline"
              style={{ color: 'var(--color-accent-ink)' }}
            >
              RG Marketing Group
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
