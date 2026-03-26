import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const alt = 'RG Forms — HTML Contact Forms in 2 Minutes';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #0d0a1e 0%, #080615 40%, #0d0a1e 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '60px 80px',
        position: 'relative',
      }}
    >
      {/* Subtle glow backdrop */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '400px',
          background: 'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.12) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      {/* Logo row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '44px' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: '800',
            color: 'white',
            letterSpacing: '-0.5px',
          }}
        >
          RG
        </div>
        <span
          style={{
            color: '#a78bfa',
            fontSize: '30px',
            fontWeight: '700',
            letterSpacing: '-0.5px',
          }}
        >
          RG Forms
        </span>
      </div>

      {/* Headline */}
      <div
        style={{
          fontSize: '68px',
          fontWeight: '800',
          color: '#f0ecff',
          textAlign: 'center',
          lineHeight: 1.05,
          letterSpacing: '-2.5px',
          marginBottom: '28px',
          maxWidth: '960px',
        }}
      >
        HTML Contact Forms in 2 Minutes
      </div>

      {/* Subline */}
      <div
        style={{
          fontSize: '26px',
          color: '#8b7fb8',
          textAlign: 'center',
          maxWidth: '720px',
          lineHeight: 1.5,
          marginBottom: '52px',
        }}
      >
        Zero backend. No subscription. Submissions go straight to your Google Drive.
      </div>

      {/* Pill tags */}
      <div style={{ display: 'flex', gap: '14px' }}>
        {['Free Forever', 'Google Drive', 'Copy-Paste Embed'].map((tag) => (
          <div
            key={tag}
            style={{
              padding: '10px 22px',
              background: 'rgba(124, 58, 237, 0.12)',
              border: '1px solid rgba(124, 58, 237, 0.35)',
              borderRadius: '100px',
              color: '#a78bfa',
              fontSize: '19px',
              fontWeight: '500',
            }}
          >
            {tag}
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}
