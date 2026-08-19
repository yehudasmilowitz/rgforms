import type { MetadataRoute } from 'next';
import { GUIDES } from '@/lib/guides';

const SITE_URL = 'https://rgforms.com';

/** Required with `output: 'export'` — the sitemap is emitted at build time. */
export const dynamic = 'force-static';

/**
 * Single source of truth for the sitemap — guide pages are added automatically
 * when they're added to the registry, so this can't drift.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = '2026-08-19';

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/how-it-works/`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/guides/`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/faq/`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/contact/`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/privacy/`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms/`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const guidePages: MetadataRoute.Sitemap = GUIDES.map((guide) => ({
    url: `${SITE_URL}/${guide.slug}/`,
    lastModified: guide.updated,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticPages, ...guidePages];
}
