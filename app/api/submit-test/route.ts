import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { results } = await req.json();
    // results is an array of { questionId, isCorrect, confidenceScore }

    for (const result of results) {
      const { questionId, isCorrect, confidenceScore } = result;

      // 1. Log the QuestionResult
      await prisma.questionResult.create({
        data: {
          userId: user.id,
          questionId,
          isCorrect,
          confidenceScore,
        }
      });

      // 2. SM-2 Spaced Repetition Logic
      let q = 0;
      if (isCorrect) {
        if (confidenceScore === 1.0) q = 5;
        else if (confidenceScore === 0.5) q = 4;
        else q = 3;
      } else {
        if (confidenceScore === 0.0) q = 2;
        else if (confidenceScore === 0.5) q = 1;
        else q = 0;
      }

      const existingSR = await prisma.spacedRepetition.findFirst({
        where: { userId: user.id, questionId }
      });

      let interval = 1;
      let repetitions = 0;
      let easeFactor = 2.5;

      if (existingSR) {
        repetitions = existingSR.repetitions;
        easeFactor = existingSR.easeFactor;
        
        if (q < 3) {
          repetitions = 0;
          interval = 1;
        } else {
          repetitions += 1;
          if (repetitions === 1) interval = 1;
          else if (repetitions === 2) interval = 6;
          else interval = Math.round(existingSR.interval * easeFactor);
        }

        easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
        if (easeFactor < 1.3) easeFactor = 1.3;

        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + interval);

        await prisma.spacedRepetition.update({
          where: { id: existingSR.id },
          data: {
            interval,
            easeFactor,
            repetitions,
            nextReview: nextReviewDate
          }
        });
      } else {
        if (q >= 3) repetitions = 1;
        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + interval);

        await prisma.spacedRepetition.create({
          data: {
            userId: user.id,
            questionId,
            interval,
            easeFactor,
            repetitions,
            nextReview: nextReviewDate
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting test results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
