import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { questionSetSchema } from '@/lib/ai-engine';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const { failedQuestion } = await req.json();

    if (!failedQuestion) {
      return NextResponse.json({ error: 'Failed question data is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json({ 
        variation: {
          ...failedQuestion,
          id: crypto.randomUUID(),
          questionText: `[MOCK VARIATION] ${failedQuestion.questionText}`
        }
      });
    }

    const systemPrompt = `You are an Infinite Variation Branching Generator.
The user failed the provided question. Your task is to generate a single new question that tests the exact same concept, but with slightly varied numbers, context, or wording to ensure they actually learn it.
Return a QuestionSet containing EXACTLY ONE question. Use the same schema provided.`;

    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: questionSetSchema,
      system: systemPrompt,
      prompt: `Failed Question:\n${JSON.stringify(failedQuestion, null, 2)}\n\nGenerate the variation:`,
      temperature: 0.8,
    });

    if (object.questions.length > 0) {
      return NextResponse.json({ variation: object.questions[0] });
    } else {
      throw new Error('No question generated');
    }
  } catch (error) {
    console.error('Variation error:', error);
    return NextResponse.json({ error: 'Failed to generate variation' }, { status: 500 });
  }
}
