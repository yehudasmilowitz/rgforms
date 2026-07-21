import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeContext';
import ScrollToTop from '@/components/ScrollToTop';
import NavAuthButton from '@/components/NavAuthButton';
import ThemeToggle from '@/components/ThemeToggle';
import SiteFooter from '@/components/SiteFooter';
import { GithubIcon } from '@/components/GithubIcon';
import './globals.css';

// Applies the saved (or system) theme before first paint to avoid a flash.
// Keep the storage key in sync with context/ThemeContext.tsx.
const themeInitScript = `(function(){try{var k='rgforms-theme';var s=localStorage.getItem(k)||'system';var d=s==='dark'||(s==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

const siteUrl = 'https://rgforms.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'RG Forms — Free, Open-Source Contact Forms Backed by Your Google Sheet',
    template: '%s — RG Forms',
  },
  description:
    'A free, open-source contact form endpoint. Submissions go directly to a Google Sheet you own — email notifications, spam protection (honeypot + optional Cloudflare Turnstile), no monthly fees, no third-party storage.',
  keywords: ['contact form', 'Google Sheets form', 'form to spreadsheet', 'Google Apps Script form', 'free contact form', 'open source contact form', 'serverless form backend'],
  authors: [{ name: 'RG Forms' }],
  creator: 'RG Forms',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'RG Forms',
    title: 'RG Forms — Free, Open-Source Contact Forms Backed by Your Google Sheet',
    description:
      'Set up your fields, connect your Google account, get a live form endpoint. Submissions go straight to a Google Sheet you own. Completely free and open source — no monthly fees.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RG Forms — Contact Forms Backed by Your Google Sheet',
    description: 'Contact forms that store submissions in your own Google Sheet. Free, no server, zero lock-in.',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'icon', url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf8ff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1626' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bricolage.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'RG Forms',
              url: siteUrl,
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Web',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              description:
                'Describe your forms and get a fully provisioned Google Sheet + Apps Script backend — ready to accept submissions in under 2 minutes. No server, no subscription.',
              logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.svg` },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'RG Forms',
              url: siteUrl,
            }),
          }}
        />
      </head>
      <body
        className={`${plusJakartaSans.className} bg-[var(--color-bg)] text-[var(--color-text)]`}
      >
        <ThemeProvider>
        <AppProvider>
        <div className="scroll-progress" aria-hidden="true" />
        <header
          style={{
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-header-bg)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          <div className="w-full px-5 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2.5"
              aria-label="RG Forms home"
            >
              <Image
                src="/favicon.svg"
                alt="RG Forms logo"
                width={30}
                height={30}
                priority
              />
              <span
                className="font-extrabold tracking-tight text-lg gradient-text"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                RG Forms
              </span>
            </Link>
            <nav className="flex items-center gap-2 sm:gap-4" aria-label="Main navigation">
              <div className="hidden sm:flex items-center gap-6">
                <Link href="/how-it-works" className="text-sm font-medium nav-link">
                  How it works
                </Link>
                <Link href="/privacy" className="text-sm font-medium nav-link">
                  Privacy
                </Link>
                <Link href="/contact" className="text-sm font-medium nav-link">
                  Contact
                </Link>
              </div>
              <span
                className="hidden sm:block h-5 w-px"
                style={{ background: 'var(--color-border)' }}
                aria-hidden="true"
              />
              <div className="flex items-center gap-1">
                <a
                  href="https://github.com/yehudasmilowitz/rgforms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors nav-link"
                  aria-label="RG Forms on GitHub — free and open source"
                  title="Free & open source — view on GitHub"
                >
                  <GithubIcon size={17} />
                  <span className="hidden md:inline">Free &amp; open source</span>
                </a>
                <ThemeToggle />
              </div>
              <NavAuthButton />
            </nav>
          </div>
        </header>
        <ScrollToTop />
        {children}
        <SiteFooter />
        </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
