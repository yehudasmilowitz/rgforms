'use client';

import { useEffect, useState } from 'react';
import { OAUTH_CALLBACK_MESSAGE_TYPE } from '@/lib/auth';

export default function OAuthCallback() {
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);

    const accessToken = params.get('access_token');
    const error = params.get('error');

    if (!window.opener) return;

    if (accessToken) {
      setStatus('success');
      // Brief pause so the user sees the success state before the popup closes
      setTimeout(() => {
        window.opener.postMessage(
          { type: OAUTH_CALLBACK_MESSAGE_TYPE, access_token: accessToken },
          window.location.origin,
        );
        window.close();
      }, 800);
    } else {
      setStatus('error');
      window.opener.postMessage(
        { type: OAUTH_CALLBACK_MESSAGE_TYPE, error: error ?? 'Unknown error' },
        window.location.origin,
      );
      setTimeout(() => window.close(), 1500);
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4 text-center px-6">
        {status === 'success' ? (
          <>
            <div
              className="flex items-center justify-center w-14 h-14 rounded-full"
              style={{ background: 'var(--color-success)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              Signed in successfully
            </p>
          </>
        ) : status === 'error' ? (
          <>
            <div
              className="flex items-center justify-center w-14 h-14 rounded-full"
              style={{ background: 'var(--color-error)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              Sign-in failed
            </p>
          </>
        ) : (
          <>
            <svg
              className="animate-spin w-10 h-10"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              style={{ color: 'var(--color-accent)' }}
            >
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Completing sign-in…
            </p>
          </>
        )}
      </div>
    </div>
  );
}
