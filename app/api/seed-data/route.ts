import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface SeedRequest {
  siteName:   string;
  tabLabel:   string;
  moduleType: string;
  columns:    string[];
  count?:     number;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
  }

  const { siteName, tabLabel, moduleType, columns, count = 5 } = (await req.json()) as SeedRequest;

  if (!columns?.length) {
    return NextResponse.json({ error: 'columns is required' }, { status: 400 });
  }

  const numRows = Math.min(Math.max(1, count), 50);
  const colList = columns.join(', ');

  const prompt = `Generate ${numRows} realistic sample data rows for a Google Sheet tab.

Context:
- Site: ${siteName || 'a small business website'}
- Tab: ${tabLabel} (type: ${moduleType})
- Columns: ${colList}

Return ONLY a JSON array of ${numRows} objects. Each object must have exactly these keys: ${colList}.
Rules:
- Use realistic, varied, and professional data appropriate for the site and tab type
- For date columns: use ISO format (YYYY-MM-DD)
- For boolean columns: use true or false
- For URL columns: use plausible placeholder URLs (e.g. /slug or https://example.com/path)
- For price/number columns: use realistic numeric values as strings
- Do NOT include submitted_at, _hp, or timestamp fields
- Do NOT wrap in markdown code blocks — return raw JSON only`;

  const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: 'You are a data generator. Return only valid JSON arrays, no markdown.' }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature:      0.7,
        maxOutputTokens:  4096,
      },
    }),
  });

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    return NextResponse.json(
      { error: `Gemini error (${geminiRes.status}): ${errText}` },
      { status: 502 },
    );
  }

  const data = (await geminiRes.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  try {
    const parsed = JSON.parse(raw);
    const rows = Array.isArray(parsed) ? parsed : (parsed.rows ?? []);
    return NextResponse.json({ rows });
  } catch {
    return NextResponse.json({ error: 'Could not parse Gemini response', raw }, { status: 502 });
  }
}
