export const maxDuration = 60; // Allow 60 seconds for Vercel Hobby tier

import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const { concept, discipline } = await req.json();

    if (!concept || !discipline) {
      return NextResponse.json({ error: 'Concept and discipline are required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json({ 
        analogy: `Since no API key is provided, imagine ${concept} as a very complicated concept in ${discipline}. For example, if it was biology vs computers, a cell wall is like a firewall.` 
      });
    }

    const systemPrompt = `You are a Cross-Discipline Analogy Evaluator. 
Your goal is to explain the provided concept using a structurally accurate analogy from the requested discipline.
Do not provide a dictionary definition. Map the specific components of the concept to the specific components of the discipline.`;

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      prompt: `Concept to explain: ${concept}\nTarget Discipline: ${discipline}\n\nGenerate the analogy:`,
      temperature: 0.7,
    });

    return NextResponse.json({ analogy: text });
  } catch (error) {
    console.error('Analogy error:', error);
    return NextResponse.json({ error: 'Failed to generate analogy' }, { status: 500 });
  }
}
