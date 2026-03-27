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

const OAUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/auth';
const POPUP_MESSAGE_TYPE = 'RG_FORMS_OAUTH_CALLBACK';

// Opens a standard OAuth 2.0 implicit-grant popup — no third-party SDK required.
// The popup redirects to /oauth-callback, which postMessages the token back.
export function requestAccessToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const redirectUri = `${window.location.origin}/oauth-callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: SCOPES,
      prompt: 'consent',
    });

    const left = Math.round(window.screen.width / 2 - 250);
    const top = Math.round(window.screen.height / 2 - 325);
    const popup = window.open(
      `${OAUTH_ENDPOINT}?${params}`,
      'google-oauth',
      `width=500,height=650,left=${left},top=${top}`,
    );

    if (!popup) {
      reject(new Error('Popup blocked. Please allow popups for this site and try again.'));
      return;
    }

    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== POPUP_MESSAGE_TYPE) return;

      window.removeEventListener('message', handleMessage);
      clearInterval(closedCheck);

      if (event.data.error) {
        reject(new Error(event.data.error));
      } else if (event.data.access_token) {
        resolve(event.data.access_token as string);
      } else {
        reject(new Error('No access token received'));
      }
    }

    window.addEventListener('message', handleMessage);

    // Detect popup closed without completing auth
    const closedCheck = setInterval(() => {
      if (popup.closed) {
        clearInterval(closedCheck);
        window.removeEventListener('message', handleMessage);
        reject(new Error('Sign-in cancelled'));
      }
    }, 500);
  });
}

export const OAUTH_CALLBACK_MESSAGE_TYPE = POPUP_MESSAGE_TYPE;

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
