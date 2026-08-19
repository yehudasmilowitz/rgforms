import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GUIDE_SLUGS, getGuide } from '@/lib/guides';
import type { Guide } from '@/lib/guides/types';
import { stripFormatting } from '@/components/guides/RichText';
import GuideArticle from '@/components/guides/GuideArticle';

const SITE_URL = 'https://rgforms.com';

/** Only the slugs below exist — anything else 404s at build time. */
export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};

  const url = `${SITE_URL}/${guide.slug}/`;
  const title = guide.metaTitle ?? guide.title;

  return {
    title,
    description: guide.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description: guide.description,
      modifiedTime: guide.updated,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: guide.description,
    },
  };
}

/**
 * Structured data. The answer field is the extractable one-paragraph answer,
 * so it doubles as the Article description and the schema abstract.
 */
function jsonLd(guide: Guide) {
  const url = `${SITE_URL}/${guide.slug}/`;

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'TechArticle',
      '@id': `${url}#article`,
      headline: guide.title,
      name: guide.metaTitle ?? guide.title,
      description: guide.description,
      abstract: guide.answer,
      url,
      datePublished: guide.updated,
      dateModified: guide.updated,
      inLanguage: 'en',
      isAccessibleForFree: true,
      author: { '@type': 'Organization', name: 'RG Forms', url: SITE_URL },
      publisher: {
        '@type': 'Organization',
        name: 'RG Forms',
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.svg` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      about: {
        '@type': 'SoftwareApplication',
        name: 'RG Forms',
        applicationCategory: 'DeveloperApplication',
        url: SITE_URL,
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'RG Forms', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides/` },
        { '@type': 'ListItem', position: 3, name: guide.title, item: url },
      ],
    },
  ];

  if (guide.faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: guide.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: stripFormatting(item.a) },
      })),
    });
  }

  const steps = guide.sections.find((s) => s.type === 'steps');
  if (steps && steps.type === 'steps') {
    graph.push({
      '@type': 'HowTo',
      '@id': `${url}#howto`,
      name: guide.title,
      description: guide.answer,
      totalTime: 'PT10M',
      supply: [],
      tool: [{ '@type': 'HowToTool', name: 'A Google account' }],
      step: steps.steps.map((step, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: step.title,
        text: stripFormatting(step.body),
        url: `${url}#step-${i + 1}`,
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(guide)) }}
      />
      <GuideArticle guide={guide} />
    </>
  );
}
