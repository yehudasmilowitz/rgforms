import type { Guide, GuideCategory } from '@/lib/guides/types';
import { USE_CASE_GUIDES } from '@/lib/guides/use-case';
import { PLATFORM_GUIDES } from '@/lib/guides/platform';
import { FRAMEWORK_GUIDES } from '@/lib/guides/framework';
import { COMPARE_GUIDES } from '@/lib/guides/compare';

export const GUIDES: Guide[] = [
  ...USE_CASE_GUIDES,
  ...PLATFORM_GUIDES,
  ...FRAMEWORK_GUIDES,
  ...COMPARE_GUIDES,
];

export const GUIDE_SLUGS = GUIDES.map((g) => g.slug);

const BY_SLUG = new Map(GUIDES.map((g) => [g.slug, g]));

export function getGuide(slug: string): Guide | undefined {
  return BY_SLUG.get(slug);
}

export const CATEGORY_META: Record<GuideCategory, { title: string; blurb: string }> = {
  'use-case': {
    title: 'Start here',
    blurb: 'The core question — how do you take submissions on a site with no server behind it?',
  },
  platform: {
    title: 'By host',
    blurb: 'Where your static site is deployed changes the options you have. Pick yours.',
  },
  framework: {
    title: 'By framework',
    blurb: 'Copy-paste integrations that match how your generator actually builds pages.',
  },
  compare: {
    title: 'Compare your options',
    blurb: 'Honest side-by-sides. There are several good tools here — these pages help you pick.',
  },
};

export const CATEGORY_ORDER: GuideCategory[] = ['use-case', 'platform', 'framework', 'compare'];

export function guidesByCategory(category: GuideCategory): Guide[] {
  return GUIDES.filter((g) => g.category === category);
}
