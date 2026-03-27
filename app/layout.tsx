import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { AppProvider } from '@/context/AppContext';
import ScrollToTop from '@/components/ScrollToTop';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
    default: 'RG Forms — HTML Contact Forms in 2 Minutes',
    template: '%s — RG Forms',
  },
  description:
    'Create fully functional HTML contact forms in under 2 minutes. Zero backend, no subscription — form submissions go straight to your Google Drive.',
  keywords: ['contact form', 'HTML form', 'Google Sheets form', 'serverless form', 'no backend form', 'free contact form', 'embed form'],
  authors: [{ name: 'RG Forms' }],
  creator: 'RG Forms',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'RG Forms',
    title: 'RG Forms — HTML Contact Forms in 2 Minutes',
    description:
      'Zero-backend contact forms powered by your own Google Drive. No subscription, no server — just sign in and get a copy-paste embed snippet.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RG Forms — HTML Contact Forms in 2 Minutes',
    description: 'Zero-backend contact forms powered by Google Drive. Free forever.',
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
  themeColor: '#060411',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <head>
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
                'Create fully functional HTML contact forms in under 2 minutes. Zero backend, no subscription — form submissions go straight to your Google Drive.',
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
        <div className="scroll-progress" aria-hidden="true" />
        <header
          style={{
            borderBottom: '1px solid var(--color-border)',
            background: 'oklch(0.07 0.015 285 / 0.85)',
            backdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2"
              aria-label="RG Forms home"
            >
              <Image
                src="/favicon.svg"
                alt="RG Forms logo"
                width={28}
                height={28}
                priority
              />
              <span
                className="font-bold tracking-tight text-base"
                style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
              >
                Forms
              </span>
            </Link>
            <nav className="flex items-center gap-6" aria-label="Main navigation">
              <Link
                href="/how-it-works"
                className="text-sm font-medium nav-link"
              >
                How it works
              </Link>
              <Link
                href="/privacy"
                className="text-sm font-medium nav-link"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm font-medium nav-link"
              >
                Terms
              </Link>
            </nav>
          </div>
        </header>
        <ScrollToTop />
        <AppProvider>{children}</AppProvider>
        <footer
          style={{ borderTop: '1px solid var(--color-border)' }}
          className="mt-auto py-6 text-center text-xs"
        >
          <span style={{ color: 'var(--color-text-muted)' }}>
            RG Forms is a project of{' '}
            <a
              href="https://rgmarketinggroup.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80 transition-opacity"
              style={{ color: 'var(--color-text-muted)' }}
            >
              RG Marketing Group
            </a>
          </span>
        </footer>
      </body>
    </html>
  );
}
