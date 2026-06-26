import type { Metadata } from 'next';
import HowItWorks from '@/components/how-it-works/HowItWorks';

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'RG Forms creates a live contact form endpoint backed by a Google Sheet you own. No server, no monthly fees — submissions land directly in your Drive.',
  alternates: { canonical: 'https://rgforms.com/how-it-works/' },
  openGraph: {
    title: 'How RG Forms Works',
    description: 'Sign in with Google, configure your fields, get a live form endpoint. Submissions go to your own Google Sheet.',
    url: 'https://rgforms.com/how-it-works/',
  },
};

export default function HowItWorksPage() {
  return <HowItWorks />;
}
