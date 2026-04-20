import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `You are a website data-structure expert. Given a small business description, propose a minimal Google Sheets-based website backend.

Your response must be one of two shapes (return only valid JSON, no markdown):

Shape A — you have enough context:
{
  "tabs": [
    {
      "name": "tab_name_lowercase",
      "label": "Display Name",
      "moduleType": "siteconfig|content|testimonial|gallery|form|calendar|faq|newsletter|menu",
      "nameSuffix": "Human label for the Google Sheet name, e.g. 'Services'",
      "description": "One sentence: what this tab stores"
    }
  ]
}

Shape B — you need one specific clarification (use sparingly, only when the description is genuinely ambiguous about what data to store):
{
  "question": "Your single, specific clarifying question here"
}

Rules for tabs (Shape A):
- First tab is always siteconfig (name: "config", label: "Site Config", nameSuffix: "Config")
- Include however many tabs make sense for the business — no fixed minimum or maximum
- Include a form tab if the business would benefit from customer contact, bookings, or inquiries
- Include multiple form tabs if the business has distinct contact needs (e.g. a booking form AND a general inquiry form)
- Include gallery/asset tab whenever photos or files would add value — don't be conservative about this
- Use testimonial, faq, calendar, newsletter, menu tabs freely when they fit
- moduleType must be one of: siteconfig, content, testimonial, gallery, form, calendar, faq, newsletter, menu
- Prefer specificity: a bakery gets a "menu" tab not a generic "content" tab; an events venue gets a "calendar" tab

When clarification is provided alongside the description, always return Shape A.`;

interface RequestBody {
  description: string;
  siteName?: string;
  clarification?: string;
  existingTabs?: Array<{ name: string; label: string; moduleType: string; nameSuffix: string }>;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured on the server.' },
      { status: 500 },
    );
  }

  const { description, siteName, clarification, existingTabs } = (await req.json()) as RequestBody;

  if (!description?.trim()) {
    return NextResponse.json({ error: 'description is required' }, { status: 400 });
  }

  let userMessage = `Business: ${description.trim()}\nSite name: ${siteName ?? 'My Business'}`;
  if (existingTabs && existingTabs.length > 0) {
    userMessage += `\nExisting tabs already provisioned: ${existingTabs.map((t) => `${t.name} (${t.moduleType})`).join(', ')}`;
    userMessage += `\nNote: you can suggest keeping, replacing, or adding to these tabs.`;
  }
  if (clarification?.trim()) {
    userMessage += `\nClarification: ${clarification.trim()}`;
  }

  const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    return NextResponse.json(
      { error: `Gemini API error (${geminiRes.status}): ${errText}` },
      { status: 502 },
    );
  }

  const data = (await geminiRes.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  try {
    const parsed = JSON.parse(raw) as { tabs?: unknown[]; question?: string };
    if (parsed.question) return NextResponse.json({ question: parsed.question });
    if (Array.isArray(parsed.tabs)) return NextResponse.json({ tabs: parsed.tabs });
    throw new Error('Unexpected response shape');
  } catch {
    return NextResponse.json(
      { error: 'Could not parse Gemini response — please try again.', raw },
      { status: 502 },
    );
  }
}
