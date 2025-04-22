// app/api/summarize/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = `
You are a smart note assistant. Analyze the following note text and respond with valid JSON containing these keys:
- summary: a concise English summary (1–2 sentences)
- dates: an array of { "label": string, "date": "YYYY-MM-DD" } for any dates mentioned
- actions: an array of action items extracted from imperatives
- tags: an array of up to 5 keywords
- sentiment: one of ["urgent","neutral","positive"]

Note text:
${content}
`.trim();

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      return NextResponse.json({ error: errorText }, { status: resp.status });
    }

    const data = await resp.json();
    let raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

    // Strip markdown fences (```json ... ```)
    raw = raw
      .replace(/^```(?:json)?\s*/, '')
      .replace(/```$/, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // fallback if parsing fails
      parsed = {
        summary: raw,
        dates: [],
        actions: [],
        tags: [],
        sentiment: 'neutral',
      };
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}