import { NextRequest, NextResponse } from 'next/server';
import { processFileBuffer } from '@/lib/extractors';
import { generateQuestionSet } from '@/lib/ai-engine';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const maxDuration = 60; // Allow 60 seconds for Vercel Hobby tier

// Define constraints
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const file = formData.get('file') as File | null; // For backwards compatibility
    const allFiles = files.length > 0 ? files : (file ? [file] : []);
    const difficulty = formData.get('difficulty') as string || 'College Level';
    const tone = formData.get('tone') as string || 'Professional';
    const isSynthesis = formData.get('isSynthesis') === 'true';

    if (allFiles.length === 0) {
      return NextResponse.json({ error: 'No files uploaded.' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    let user = null;
    if (session?.user?.email) {
      user = await prisma.user.findUnique({ 
        where: { email: session.user.email },
        include: { _count: { select: { tests: true } } }
      });
      if (user && user.role !== 'ADMIN') {
        if (user._count.tests >= 3) {
          return NextResponse.json({ error: "Freemium limit reached. You can only generate 3 tests for free. Please upgrade to Pro." }, { status: 403 });
        }
        if (user.insights < 3) {
          return NextResponse.json({ error: "Insufficient Insights. You need at least 3 to generate a test." }, { status: 403 });
        }
      }
    }

    // 1-3. Validate and Extract Text from all files
    let sourceText = '';
    
    for (const f of allFiles) {
      if (f.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `File ${f.name} size exceeds the 15MB limit.` }, { status: 400 });
      }
      if (!ALLOWED_MIME_TYPES.includes(f.type)) {
        return NextResponse.json({ error: `Unsupported file type: ${f.type}. Allowed types are PDF, TXT, JPEG, and PNG.` }, { status: 400 });
      }
      
      const arrayBuffer = await f.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      try {
        const text = await processFileBuffer(buffer, f.type);
        sourceText += `\n\n--- DOCUMENT: ${f.name} ---\n\n` + text;
      } catch (extractionError) {
        console.error(extractionError);
        return NextResponse.json({ error: `Failed to extract text from ${f.name}.` }, { status: 422 });
      }
    }

    if (!sourceText.trim()) {
      return NextResponse.json({ error: 'Extracted text is empty. Cannot generate a test.' }, { status: 422 });
    }

    // 4. Generate Question Set via LLM
    const questionSet = await generateQuestionSet(sourceText, difficulty, tone, isSynthesis);

    // 5. Save to PostgreSQL Database using Prisma
    // We use a transaction or single nested create to insert the Test and its Questions
    const testRecord = await prisma.test.create({
      data: {
        title: questionSet.testTitle,
        sourceText: sourceText, // Save the raw text for future Chat Tutor features
        questions: {
          create: questionSet.questions.map(q => {
            const realUuid = crypto.randomUUID();
            q.id = realUuid; // Update the in-memory object so the frontend gets the UUID too
            return {
              id: realUuid,
              type: q.type,
              questionText: q.questionText,
              options: q.options ? JSON.stringify(q.options) : null,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              steps: q.steps ? JSON.stringify(q.steps) : null,
              flawIndex: q.flawIndex || null,
              variables: q.variables ? JSON.stringify(q.variables) : null,
              targetCoordinate: q.targetCoordinate ? JSON.stringify(q.targetCoordinate) : null,
            };
          })
        }
      }
    });

    // Deduct 3 insights from the user's DB balance if they are logged in
    if (user && user.role !== 'ADMIN') {
      await prisma.user.update({
        where: { id: user.id },
        data: { insights: { decrement: 3 } }
      });
    }

    // 6. Return Success Response
    return NextResponse.json({
      success: true,
      testId: testRecord.id,
      testTitle: testRecord.title,
      questionCount: questionSet.questions.length,
      data: questionSet,
    });

  } catch (error: any) {
    console.error('Error processing file upload:', error);
    
    if (error.message === 'INVALID_API_KEY') {
      return NextResponse.json(
        { error: 'Your API key is invalid! A valid Google Gemini API key must start with "AIza". Please generate a new key from Google AI Studio.' },
        { status: 400 }
      );
    }

    // Extract Google's actual API error message
    let errorMessage = 'An internal server error occurred while processing your request.';
    
    if (error.message) {
      errorMessage = `Google API Error: ${error.message}`;
    }
    if (error.cause && error.cause.message) {
      errorMessage = `Google API Error: ${error.cause.message}`;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
