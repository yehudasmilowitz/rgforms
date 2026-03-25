import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import Script from 'next/script';
import { AppProvider } from '@/context/AppContext';
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

export const metadata: Metadata = {
  title: 'RG Forms — Create HTML contact forms in 2 minutes',
  description:
    'Zero-backend contact forms powered by your own Google Drive. No subscription, no server.',
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
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
              className="font-bold tracking-tight text-base"
              style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
            >
              RG Forms
            </Link>
            <nav className="flex items-center gap-6">
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
            </nav>
          </div>
        </header>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
