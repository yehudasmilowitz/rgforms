/**
 * Content model for the guide / comparison pages.
 *
 * These pages exist to answer one specific question well — for a human reader
 * first, and (because the answer is stated plainly and marked up with schema)
 * for AI search engines that cite pages when answering the same question.
 *
 * Body strings support a tiny inline syntax rendered by components/guides/RichText:
 *   **bold**, `code`, [label](/href)
 */

export type CodeBlock = {
  /** Language label shown on the block and used for the ```lang fence in exports. */
  lang: string;
  /** Short caption, e.g. "index.html" or "src/components/ContactForm.astro". */
  label?: string;
  code: string;
};

export type QA = { q: string; a: string };

export type Section =
  | { type: 'prose'; heading?: string; body: string[] }
  | {
      type: 'steps';
      heading: string;
      intro?: string;
      steps: Array<{ title: string; body: string; code?: CodeBlock }>;
    }
  | { type: 'code'; heading?: string; intro?: string; code: CodeBlock; note?: string }
  | { type: 'callout'; tone: 'info' | 'success' | 'warning'; heading?: string; body: string[] }
  | {
      type: 'table';
      heading?: string;
      intro?: string;
      columns: string[];
      rows: string[][];
      note?: string;
    }
  | { type: 'checklist'; heading: string; intro?: string; items: Array<{ label: string; body?: string }> };

export type GuideCategory = 'use-case' | 'platform' | 'framework' | 'compare';

export type Guide = {
  /** Top-level URL segment: rgforms.com/<slug>/ */
  slug: string;
  category: GuideCategory;
  /** Small label above the H1. */
  eyebrow: string;
  /** H1. */
  title: string;
  /** <title> — falls back to title. */
  metaTitle?: string;
  /** Meta description + OG description. */
  description: string;
  /**
   * The extractable answer. One self-contained paragraph that makes sense with
   * zero surrounding context — this is what an AI assistant quotes.
   */
  answer: string;
  /** Lead paragraphs under the H1. */
  intro: string[];
  sections: Section[];
  faq: QA[];
  /** Slugs of related guides, rendered as a "keep reading" grid. */
  related: string[];
  /** ISO date — surfaced to readers and in Article schema. */
  updated: string;
  /** Card blurb on the /guides hub. */
  cardBlurb: string;
};
