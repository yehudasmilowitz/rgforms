import type { Metadata } from 'next';
import FoundationPlan from '@/components/FoundationPlan';

export const metadata: Metadata = {
  title: 'Business Plan v5 — Sheetspin',
  description: 'The real answer — provisioning utility + productized service.',
  robots: { index: false, follow: false },
};

export default function BusinessV5Page() {
  return (
    <main
      className="min-h-screen px-4 sm:px-6 py-16"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <FoundationPlan />
    </main>
  );
}
