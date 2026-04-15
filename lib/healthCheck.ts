export interface HealthResult {
  deploymentUrl: string;
  status: 'ok' | 'error' | 'unauthorized';
  latencyMs: number;
  checkedAt: string;
  statusCode?: number;
  error?: string;
}

// Test an Apps Script deployment URL by fetching it and measuring response time.
// Apps Script endpoints require authorization; an unauthorized script returns a 302
// redirect to accounts.google.com which fetch follows, ending on the login page HTML.
// A properly authorized endpoint returns JSON with Content-Type: application/json.
export async function checkEndpointHealth(deploymentUrl: string): Promise<HealthResult> {
  const checkedAt = new Date().toISOString();

  if (!deploymentUrl) {
    return {
      deploymentUrl,
      status: 'error',
      latencyMs: 0,
      checkedAt,
      error: 'No deployment URL provided',
    };
  }

  const start = performance.now();

  try {
    const url = deploymentUrl.includes('?')
      ? `${deploymentUrl}&json=1`
      : `${deploymentUrl}?json=1`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    });

    const latencyMs = Math.round(performance.now() - start);
    const statusCode = response.status;

    // Check if we were redirected to Google login
    const finalUrl = response.url ?? '';
    if (finalUrl.includes('accounts.google.com')) {
      return {
        deploymentUrl,
        status: 'unauthorized',
        latencyMs,
        checkedAt,
        statusCode,
      };
    }

    const contentType = response.headers.get('content-type') ?? '';

    if (response.ok && contentType.includes('application/json')) {
      return {
        deploymentUrl,
        status: 'ok',
        latencyMs,
        checkedAt,
        statusCode,
      };
    }

    // Non-JSON response on an ok status — likely still needs auth or is misconfigured
    if (!response.ok) {
      // Some unauthorized scripts return a 403 before the redirect
      if (statusCode === 401 || statusCode === 403) {
        return {
          deploymentUrl,
          status: 'unauthorized',
          latencyMs,
          checkedAt,
          statusCode,
        };
      }
      return {
        deploymentUrl,
        status: 'error',
        latencyMs,
        checkedAt,
        statusCode,
        error: `HTTP ${statusCode}`,
      };
    }

    // response.ok but content-type is not JSON — check if it looks like Google login HTML
    const text = await response.text().catch(() => '');
    if (text.includes('accounts.google.com') || text.includes('Sign in with Google')) {
      return {
        deploymentUrl,
        status: 'unauthorized',
        latencyMs,
        checkedAt,
        statusCode,
      };
    }

    // Treat any ok response as healthy even if not JSON
    return {
      deploymentUrl,
      status: 'ok',
      latencyMs,
      checkedAt,
      statusCode,
    };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - start);
    const message = err instanceof Error ? err.message : String(err);
    return {
      deploymentUrl,
      status: 'error',
      latencyMs,
      checkedAt,
      error: message,
    };
  }
}

// Check multiple endpoints in parallel, calling onResult as each one completes
export async function checkAllEndpoints(
  modules: Array<{ deploymentUrl?: string; sheetId: string }>,
  onResult: (sheetId: string, result: HealthResult) => void,
): Promise<void> {
  await Promise.all(
    modules.map(async (mod) => {
      const result = await checkEndpointHealth(mod.deploymentUrl ?? '');
      onResult(mod.sheetId, result);
    }),
  );
}
