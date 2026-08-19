import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-static';
export const alt = 'RG Forms — Contact Forms Backed by Your Google Sheet';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  const logoData = readFileSync(join(process.cwd(), 'public/icon-192.png'));
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #f7f4ff 0%, #ffffff 45%, #f3edff 100%)',
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
          background: 'radial-gradient(ellipse at center, rgba(135, 113, 255, 0.20) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      {/* Logo row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '44px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width={52}
          height={52}
          style={{ borderRadius: '12px' }}
          alt="RG Forms logo"
        />
        <span
          style={{
            color: '#5b34cf',
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
          fontSize: '62px',
          fontWeight: '800',
          color: '#241640',
          textAlign: 'center',
          lineHeight: 1.05,
          letterSpacing: '-2.5px',
          marginBottom: '28px',
          maxWidth: '960px',
        }}
      >
        The free form backend for static websites
      </div>

      {/* Subline */}
      <div
        style={{
          fontSize: '24px',
          color: '#5b5470',
          textAlign: 'center',
          maxWidth: '720px',
          lineHeight: 1.5,
          marginBottom: '52px',
        }}
      >
        Add a contact form to any static site without building a backend. Submissions go
        straight to a Google Sheet you own.
      </div>

      {/* Pill tags */}
      <div style={{ display: 'flex', gap: '14px' }}>
        {['Google Sheets', 'No server', 'Free & open source'].map((tag) => (
          <div
            key={tag}
            style={{
              padding: '10px 22px',
              background: 'rgba(135, 113, 255, 0.12)',
              border: '1px solid rgba(83, 43, 199, 0.38)',
              borderRadius: '100px',
              color: '#5b34cf',
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
