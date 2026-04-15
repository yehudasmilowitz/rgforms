'use client';

interface Props {
  deploymentUrl?: string;
  /** Pass these to avoid re-checking if already checked */
  status?: 'ok' | 'error' | 'unauthorized' | 'checking' | 'idle';
  latencyMs?: number;
  onCheck: () => void;
}

function SpinnerIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      style={{
        animation: 'ehb-spin 0.75s linear infinite',
        display: 'block',
        flexShrink: 0,
      }}
    >
      <circle
        cx="6"
        cy="6"
        r="4.5"
        stroke="var(--color-muted)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="20 8"
      />
    </svg>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
      }}
    />
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        d="M3.5 8.5l5-5M5 3.5h3.5v3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function EndpointHealthBadge({
  deploymentUrl,
  status = 'idle',
  latencyMs,
  onCheck,
}: Props) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1,
    userSelect: 'none',
  };

  if (status === 'idle') {
    return (
      <>
        <style>{`@keyframes ehb-spin { to { transform: rotate(360deg); } }`}</style>
        <button
          type="button"
          onClick={onCheck}
          title="Test endpoint health"
          style={{
            ...baseStyle,
            padding: '3px 7px',
            borderRadius: 6,
            border: '1px solid var(--color-border)',
            background: 'transparent',
            color: 'var(--color-muted)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent-border)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)';
          }}
        >
          Test
        </button>
      </>
    );
  }

  if (status === 'checking') {
    return (
      <>
        <style>{`@keyframes ehb-spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ ...baseStyle, color: 'var(--color-muted)', padding: '3px 2px' }}>
          <SpinnerIcon />
          <span>Checking…</span>
        </span>
      </>
    );
  }

  if (status === 'ok') {
    return (
      <>
        <style>{`@keyframes ehb-spin { to { transform: rotate(360deg); } }`}</style>
        <button
          type="button"
          onClick={onCheck}
          title="Re-test endpoint"
          style={{
            ...baseStyle,
            padding: '3px 6px',
            borderRadius: 6,
            border: '1px solid oklch(0.72 0.18 145 / 0.25)',
            background: 'oklch(0.72 0.18 145 / 0.08)',
            color: 'var(--color-success)',
            cursor: 'pointer',
            gap: 5,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.72 0.18 145 / 0.14)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.72 0.18 145 / 0.08)';
          }}
        >
          <Dot color="var(--color-success)" />
          <span>{latencyMs !== undefined ? `${latencyMs}ms` : 'OK'}</span>
        </button>
      </>
    );
  }

  if (status === 'error') {
    return (
      <>
        <style>{`@keyframes ehb-spin { to { transform: rotate(360deg); } }`}</style>
        <button
          type="button"
          onClick={onCheck}
          title="Re-test endpoint"
          style={{
            ...baseStyle,
            padding: '3px 6px',
            borderRadius: 6,
            border: '1px solid oklch(0.62 0.22 25 / 0.25)',
            background: 'oklch(0.62 0.22 25 / 0.08)',
            color: 'var(--color-error)',
            cursor: 'pointer',
            gap: 5,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.62 0.22 25 / 0.14)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.62 0.22 25 / 0.08)';
          }}
        >
          <Dot color="var(--color-error)" />
          <span>Error</span>
        </button>
      </>
    );
  }

  if (status === 'unauthorized') {
    return (
      <>
        <style>{`@keyframes ehb-spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ ...baseStyle, gap: 4 }}>
          <span
            style={{
              ...baseStyle,
              padding: '3px 6px',
              borderRadius: 6,
              border: '1px solid oklch(0.78 0.18 75 / 0.25)',
              background: 'oklch(0.78 0.18 75 / 0.08)',
              color: 'var(--color-warning)',
              gap: 5,
            }}
          >
            <Dot color="var(--color-warning)" />
            <span>Needs auth</span>
          </span>
          {deploymentUrl && (
            <a
              href={deploymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Authorize the Apps Script endpoint"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--color-warning)',
                textDecoration: 'none',
                padding: '3px 5px',
                borderRadius: 6,
                border: '1px solid oklch(0.78 0.18 75 / 0.20)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = '0.75';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = '1';
              }}
            >
              Authorize
              <ExternalLinkIcon />
            </a>
          )}
        </span>
      </>
    );
  }

  return null;
}
