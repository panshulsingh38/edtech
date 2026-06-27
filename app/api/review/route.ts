export const maxDuration = 60; // Allow 60 seconds for Vercel Hobby tier

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { questionId, status } = await req.json();

    if (!questionId || !['Hard', 'Good', 'Easy'].includes(status)) {
      return NextResponse.json({ error: 'Invalid questionId or status.' }, { status: 400 });
    }

    // Basic SRS Logic:
    // Hard: Review in 10 minutes
    // Good: Review in 1 day
    // Easy: Review in 4 days
    const now = new Date();
    let nextReview = new Date();

    if (status === 'Hard') {
      nextReview.setMinutes(now.getMinutes() + 10);
    } else if (status === 'Good') {
      nextReview.setDate(now.getDate() + 1);
    } else if (status === 'Easy') {
      nextReview.setDate(now.getDate() + 4);
    }

    const review = await prisma.flashcardReview.create({
      data: {
        questionId,
        status,
        nextReview
      }
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error('Error logging flashcard review:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
