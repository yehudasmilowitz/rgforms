import type { Metadata } from 'next';
import SimplePlan from '@/components/SimplePlan';

export const metadata: Metadata = {
  title: 'Business Plan v3 — Sheetspin',
  description: 'Simple POC plan — multi-tab Sheet + renderer.',
  robots: { index: false, follow: false },
};

export default function BusinessV3Page() {
  return (
    <main
      className="min-h-screen px-4 sm:px-6 py-16"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <SimplePlan />
    </main>
  );
}
