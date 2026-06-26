import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export async function POST(req: NextRequest) {
  try {
    const { testId } = await req.json();

    if (!testId) {
      return NextResponse.json({ error: 'Missing testId' }, { status: 400 });
    }

    const testRecord = await prisma.test.findUnique({
      where: { id: testId },
      select: { sourceText: true, title: true }
    });

    if (!testRecord || !testRecord.sourceText) {
      return NextResponse.json({ error: 'Test document not found.' }, { status: 404 });
    }

    const systemPrompt = `You are an expert educator. Extract the most important concepts, formulas, dates, and definitions from the following text and format them into a highly condensed, bulleted Markdown Cheat Sheet. Keep it concise.

Source Text:
---
${testRecord.sourceText.substring(0, 30000)}
---`;

    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      prompt: 'Generate the cheat sheet in markdown format.',
      temperature: 0.2,
    });

    return NextResponse.json({ markdown: `# Cheat Sheet: ${testRecord.title}\n\n${text}` });

  } catch (error) {
    console.error('Error generating cheat sheet:', error);
    return NextResponse.json({ error: 'Failed to generate cheat sheet' }, { status: 500 });
  }
}
