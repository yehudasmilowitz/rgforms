import type { Metadata } from 'next';
import ComprehensivePlan from '@/components/ComprehensivePlan';

export const metadata: Metadata = {
  title: 'Business Plan v2 — RG Forms',
  description: 'Comprehensive go-to-market strategy incorporating the full stack context.',
  robots: { index: false, follow: false },
};

export default function BusinessV2Page() {
  return (
    <main
      className="min-h-screen px-4 sm:px-6 py-16"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <ComprehensivePlan />
    </main>
  );
}
