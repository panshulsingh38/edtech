import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { chatWithDocument } from '@/lib/ai-engine';

export async function POST(req: NextRequest) {
  try {
    const { testId, chatHistory, newMessage } = await req.json();

    if (!testId || !newMessage) {
      return NextResponse.json({ error: 'Missing testId or newMessage.' }, { status: 400 });
    }

    // 1. Fetch the source document from Prisma
    const testRecord = await prisma.test.findUnique({
      where: { id: testId },
      select: { sourceText: true }
    });

    if (!testRecord || !testRecord.sourceText) {
      return NextResponse.json({ error: 'Test document not found in database.' }, { status: 404 });
    }

    // 2. Stream/Generate Response
    const aiResponse = await chatWithDocument(testRecord.sourceText, chatHistory || [], newMessage);

    return NextResponse.json({ text: aiResponse });

  } catch (error: any) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: 'An error occurred while communicating with the AI Tutor.' },
      { status: 500 }
    );
  }
}
