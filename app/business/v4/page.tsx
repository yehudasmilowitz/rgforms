import type { Metadata } from 'next';
import ApiPlan from '@/components/ApiPlan';

export const metadata: Metadata = {
  title: 'Business Plan v4 — RG Forms',
  description: 'API-as-a-service pivot — Google Sheets as a typed REST backend.',
  robots: { index: false, follow: false },
};

export default function BusinessV4Page() {
  return (
    <main
      className="min-h-screen px-4 sm:px-6 py-16"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <ApiPlan />
    </main>
  );
}
