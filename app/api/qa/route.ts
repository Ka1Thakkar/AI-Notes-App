import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { content, question } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = `
You are a helpful assistant. Given the following note text, answer the user's question as clearly and concisely as possible, and use markdown, like bold, italics and bullet points etc, in the answer. If the answer is not in the note, say "I couldn't find the answer in the note.".

Note text:
${content}

Question:
${question}

Answer:
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
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

    return NextResponse.json({ answer });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 