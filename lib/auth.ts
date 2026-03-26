import type { GoogleUser } from '@/types';

const SCOPES = [
  // drive.file covers the Sheets API for app-created files — more restrictive than
  // spreadsheets (which would grant access to all the user's spreadsheets)
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/script.projects',
  'https://www.googleapis.com/auth/script.deployments',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');


declare global {
  interface Window {
    google: typeof google;
    onGoogleLibraryLoad?: () => void;
  }
}

export function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    if (window.google?.accounts?.oauth2) return resolve();

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}

export function requestAccessToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (response: google.accounts.oauth2.TokenResponse) => {
        if (response.error) {
          reject(new Error(response.error_description ?? response.error));
          return;
        }
        resolve(response.access_token);
      },
    });
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}


export async function getUserInfo(accessToken: string): Promise<GoogleUser> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('Failed to fetch user info');
  const data = await response.json();
  return {
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
}

export async function signIn(clientId: string): Promise<{ user: GoogleUser; accessToken: string }> {
  await loadGisScript();
  const accessToken = await requestAccessToken(clientId);
  const user = await getUserInfo(accessToken);
  return { user, accessToken };
}

// Revoke the OAuth token at Google, removing all permissions granted to this app.
// Returns true if Google confirmed the revocation, false on network error or non-OK response.
export async function revokeToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(accessToken)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );
    return response.ok;
  } catch {
    return false;
  }
}
