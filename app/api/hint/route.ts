export const maxDuration = 60; // Allow 60 seconds for Vercel Hobby tier

import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const { questionText, correctAnswer } = await req.json();

    if (!questionText || !correctAnswer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json({ 
        hint: `Mock Hint: Think about what ${correctAnswer} means in this context. What step usually precedes this?` 
      });
    }

    const systemPrompt = `You are a Socratic Dialogue Hint Engine. 
The user is stuck on a question. 
DO NOT give them the direct answer.
Instead, ask a leading, Socratic question that points them in the right direction based on the correct answer.
Keep it extremely concise (1-2 sentences max).`;

    const { text } = await generateText({
      model: google('gemini-3.5-flash'),
      system: systemPrompt,
      prompt: `Question: ${questionText}\nCorrect Answer: ${correctAnswer}\n\nProvide the Socratic hint:`,
      temperature: 0.7,
    });

    return NextResponse.json({ hint: text });
  } catch (error) {
    console.error('Hint error:', error);
    return NextResponse.json({ error: 'Failed to generate hint' }, { status: 500 });
  }
}
