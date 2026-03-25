import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { deploymentUrl, fields } = await req.json() as {
    deploymentUrl: string;
    fields: Record<string, string>;
  };

  if (!deploymentUrl || !fields) {
    return NextResponse.json({ error: 'Missing deploymentUrl or fields' }, { status: 400 });
  }

  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }

  let res: Response;
  try {
    res = await fetch(deploymentUrl, { method: 'POST', body: formData });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Network error' },
      { status: 502 },
    );
  }

  if (!res.ok) {
    return NextResponse.json({ error: `Upstream error: ${res.status}` }, { status: res.status });
  }

  // Apps Script always returns 200 — check the body for script-level errors
  const body = await res.json().catch(() => null) as { result?: string; error?: string } | null;
  if (body?.result === 'error') {
    return NextResponse.json(
      { error: body.error ?? 'Script error' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
