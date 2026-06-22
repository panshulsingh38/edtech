import { NextRequest, NextResponse } from 'next/server';
import { processFileBuffer } from '@/lib/extractors';
import { generateQuestionSet } from '@/lib/ai-engine';
import { saveTestToDB } from '@/lib/db-mock';

// Define constraints
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // 1. Validate File Size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds the 15MB limit. Your file size is ${(file.size / 1024 / 1024).toFixed(2)}MB.` },
        { status: 400 }
      );
    }

    // 2. Validate Mime Type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Allowed types are PDF, TXT, JPEG, and PNG.` },
        { status: 400 }
      );
    }

    // 3. Extract Text from File Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let sourceText = '';
    try {
      sourceText = await processFileBuffer(buffer, file.type);
    } catch (extractionError) {
      console.error(extractionError);
      return NextResponse.json({ error: 'Failed to extract text from the provided file.' }, { status: 422 });
    }

    if (!sourceText.trim()) {
      return NextResponse.json({ error: 'Extracted text is empty. Cannot generate a test.' }, { status: 422 });
    }

    // 4. Generate Question Set via LLM
    const questionSet = await generateQuestionSet(sourceText);

    // 5. Save to Mock Database
    const testId = await saveTestToDB(questionSet);

    // 6. Return Success Response
    return NextResponse.json({
      success: true,
      testId,
      testTitle: questionSet.testTitle,
      questionCount: questionSet.questions.length,
      data: questionSet,
    });

  } catch (error) {
    console.error('Error processing file upload:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
