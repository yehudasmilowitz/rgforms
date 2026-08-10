import type { Metadata } from 'next';
import Link from 'next/link';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Questions, bug reports, or feedback about RG Forms? Send us a message — the form is powered by RG Forms itself, straight into our own Google Sheet.',
  alternates: { canonical: 'https://rgforms.com/contact/' },
  openGraph: {
    title: 'Contact RG Forms',
    description: 'Questions, bug reports, or feedback? Send us a message.',
    url: 'https://rgforms.com/contact/',
  },
};

export default function ContactPage() {
  return (
    <main
      className="min-h-screen px-4 py-16"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <div className="w-full max-w-lg mx-auto flex flex-col gap-10">

        {/* Header */}
        <header className="flex flex-col gap-3">
          <div
            className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-muted)',
            }}
          >
            Get in touch
          </div>
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
          >
            Contact Us
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Have a question, a bug report, or just want to say hello? We&apos;d love to hear from you.
          </p>
        </header>

        <ContactForm />

        {/* Footer nav */}
        <div
          className="pt-4 border-t flex items-center gap-4"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <Link href="/" className="text-sm" style={{ color: 'var(--color-accent)' }}>
            ← Back to RG Forms
          </Link>
          <Link href="/how-it-works" className="text-sm nav-link">
            How it works
          </Link>
          <Link href="/privacy" className="text-sm nav-link">
            Privacy
          </Link>
        </div>

      </div>
    </main>
  );
}
