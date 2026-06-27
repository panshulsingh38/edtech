export const maxDuration = 60; // Allow 60 seconds for Vercel Hobby tier

import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    // 1. Fetch the user's hardest questions from QuestionResult
    const weakResults = await prisma.questionResult.findMany({
      where: {
        OR: [
          { isCorrect: false },
          { confidenceScore: 0.0 }
        ]
      },
      include: { question: true },
      take: 20
    });

    const weakTopicsContext = weakResults
      .map(r => `Question: ${r.question.questionText}\nCorrect Answer: ${r.question.correctAnswer}\nExplanation: ${r.question.explanation}`)
      .join('\n\n');

    // 2. Instruct the AI to build a condensed cram-sheet
    const prompt = `
      You are a strict, highly efficient tutor preparing a student for an exam tomorrow.
      The student has struggled with the following concepts recently based on their incorrect test answers:

      ${weakTopicsContext}

      Create a "Last 24 Hours Survival Guide" cheat sheet.
      - Extract the most critical formulas, concepts, or traps the student MUST remember based on their mistakes.
      - Format as a high-density, bulleted Markdown list.
      - Be extremely concise. Use LaTeX (e.g. \\( E=mc^2 \\)) for any formulas.
      - No fluff. Just the facts.
    `;

    const { text } = await generateText({
      model: google('gemini-3.5-flash'),
      prompt,
    });

    return NextResponse.json({ cheatSheet: text });
  } catch (error) {
    console.error('Error generating cheat sheet:', error);
    return NextResponse.json({ error: 'Failed to generate cheat sheet' }, { status: 500 });
  }
}
