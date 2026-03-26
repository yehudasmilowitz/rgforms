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

// Requested incrementally at delete time — needed to permanently delete Apps Script project
// files, which are not covered by drive.file (they were created via script.googleapis.com).
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';

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

// Request an incremental drive token at the moment it's needed (e.g. on delete).
// Uses prompt: '' so Google silently issues the token if the user already granted
// the scope, or shows a focused consent screen if they haven't yet.
export function requestDriveToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: (response: google.accounts.oauth2.TokenResponse) => {
        if (response.error) {
          reject(new Error(response.error_description ?? response.error));
          return;
        }
        resolve(response.access_token);
      },
    });
    tokenClient.requestAccessToken({ prompt: '' });
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
