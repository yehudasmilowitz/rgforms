'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from '@/lib/auth';
import { useApp } from '@/context/AppContext';

/** Compact nav sign-in. Runs the OAuth flow; once signed in, links into the app. */
export default function NavAuthButton() {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

  async function handleSignIn() {
    if (loading) return;
    setLoading(true);
    try {
      const { user, accessToken } = await signIn(clientId);
      dispatch({ type: 'SIGN_IN', payload: { user, accessToken } });
    } catch {
      /* user cancelled or popup blocked — silent in nav */
    } finally {
      setLoading(false);
    }
  }

  if (state.auth.user) {
    return (
      <Link
        href="/"
        className="btn-gradient text-sm font-semibold px-4 py-2 rounded-full inline-flex items-center gap-2"
      >
        My forms
      </Link>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      aria-busy={loading}
      className="inline-flex items-center gap-2 rounded-full pl-3 pr-4 py-2 text-sm font-semibold bg-[var(--color-surface)] border transition-all duration-150 hover:shadow-md disabled:opacity-60"
      style={{ borderColor: 'var(--color-border-strong)', color: 'var(--color-heading)' }}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: 'var(--color-accent)' }}>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      )}
      <span className="hidden sm:inline">{loading ? 'Signing in…' : 'Sign in with Google'}</span>
      <span className="sm:hidden">{loading ? '…' : 'Sign in'}</span>
    </button>
  );
}
