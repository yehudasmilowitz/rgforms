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

const siteUrl = 'https://sheetspin.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Sheetspin — AI-Powered Website Backends in Your Google Drive',
    template: '%s — Sheetspin',
  },
  description:
    'Describe your site to AI. Get a fully provisioned Google Sheet + Apps Script backend — forms, content, gallery, newsletter, and more. No server, no subscription.',
  keywords: ['website backend', 'Google Sheets CMS', 'serverless backend', 'AI site builder', 'Google Drive backend', 'no backend', 'contact form', 'Google Apps Script'],
  authors: [{ name: 'Sheetspin' }],
  creator: 'Sheetspin',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Sheetspin',
    title: 'Sheetspin — AI-Powered Website Backends in Your Google Drive',
    description:
      'Describe your site. AI designs the structure. Everything provisions in your Google Drive — forms, content, gallery, and more. No server, no subscription.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sheetspin — AI-Powered Website Backends in Your Google Drive',
    description: 'Your website\'s entire backend, in your Google Drive. AI-powered, zero server, free forever.',
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
              name: 'Sheetspin',
              url: siteUrl,
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Web',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              description:
                'Describe your site to AI. Get a fully provisioned Google Sheet + Apps Script backend — forms, content, gallery, newsletter, and more. No server, no subscription.',
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
              name: 'Sheetspin',
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
              aria-label="Sheetspin home"
            >
              <Image
                src="/favicon.svg"
                alt="Sheetspin logo"
                width={28}
                height={28}
                priority
              />
              <span
                className="font-bold tracking-tight text-base"
                style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
              >
                Sheetspin
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
            Sheetspin is a project of{' '}
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
