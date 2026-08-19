import Link from 'next/link';

/**
 * Minimal inline formatter for guide copy: **bold**, `code`, [label](href).
 * Deliberately tiny — guide bodies are prose, not a document format, and this
 * keeps the content files readable without pulling in a markdown runtime.
 */

const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

export function stripFormatting(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

export default function RichText({ text }: { text: string }) {
  const parts = text.split(TOKEN).filter(Boolean);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} style={{ color: 'var(--color-heading)', fontWeight: 700 }}>
              {part.slice(2, -2)}
            </strong>
          );
        }

        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={i}
              className="text-[0.92em] px-1.5 py-0.5 rounded"
              style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-heading)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (link) {
          const [, label, href] = link;
          const style = { color: 'var(--color-accent-ink)', fontWeight: 600 };
          const cls = 'underline underline-offset-2 hover:no-underline';
          if (href.startsWith('http')) {
            return (
              <a key={i} href={href} target="_blank" rel="noopener noreferrer" className={cls} style={style}>
                {label}
              </a>
            );
          }
          return (
            <Link key={i} href={href} className={cls} style={style}>
              {label}
            </Link>
          );
        }

        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
