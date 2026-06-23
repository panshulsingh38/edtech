import { NextRequest, NextResponse } from 'next/server';
import { gradeAnswer } from '@/lib/ai-engine';

export async function POST(req: NextRequest) {
  try {
    const { questionText, correctAnswer, userAnswer } = await req.json();

    if (!questionText || !correctAnswer || !userAnswer) {
      return NextResponse.json({ error: 'Missing required grading parameters.' }, { status: 400 });
    }

    const gradingResult = await gradeAnswer(questionText, correctAnswer, userAnswer);

    return NextResponse.json(gradingResult);
  } catch (error: any) {
    console.error('Error in grading route:', error);
    return NextResponse.json(
      { error: 'An error occurred while grading your answer.' },
      { status: 500 }
    );
  }
}
