import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import Script from 'next/script';
import { AppProvider } from '@/context/AppContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'rgforms — Create HTML contact forms in 2 minutes',
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
    <html lang="en" className={inter.variable}>
      <head>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${inter.className} bg-[var(--color-bg)] text-[var(--color-text)]`}
      >
        <header
          style={{
            borderBottom: '1px solid var(--color-border)',
            background: 'rgba(10,10,15,0.85)',
            backdropFilter: 'blur(8px)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
            <Link
              href="/"
              className="text-sm font-bold tracking-tight"
              style={{ color: 'var(--color-accent)' }}
            >
              rgforms
            </Link>
            <nav className="flex items-center gap-5">
              <Link
                href="/how-it-works"
                className="text-xs font-medium nav-link"
              >
                How it works
              </Link>
              <Link
                href="/privacy"
                className="text-xs font-medium nav-link"
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
