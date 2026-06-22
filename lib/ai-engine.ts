import { z } from 'zod';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// Define the exact schema requested for the question set
export const questionSetSchema = z.object({
  testTitle: z.string().describe('The title of the generated test'),
  questions: z.array(
    z.object({
      id: z.string().uuid().describe('A unique UUIDv4 for this question'),
      type: z.enum(['mcq', 'true_false', 'short_answer']),
      questionText: z.string().describe('The text of the question'),
      options: z.array(z.string()).nullable().describe('Array of 4 options if mcq, otherwise empty array or null'),
      correctAnswer: z.string().describe('The exact text of the correct answer. Must match one of the options for MCQ.'),
      explanation: z.string().describe('Explanation of why the answer is correct based on the source text'),
    })
  ),
});

export type QuestionSet = z.infer<typeof questionSetSchema>;

// Initialize the OpenAI client using the Vercel AI SDK
// The API key is automatically picked up from process.env.OPENAI_API_KEY
const openai = createOpenAI({
  compatibility: 'strict', // Strict mode for OpenAI
});

/**
 * Generates a structured question set from provided text using an LLM.
 *
 * @param sourceText The parsed text from the uploaded document
 * @returns A promise that resolves to the structured question set
 */
export async function generateQuestionSet(sourceText: string): Promise<QuestionSet> {
  const systemPrompt = `
You are an expert educator and instructional designer.
Your task is to analyze the provided source material and generate a comprehensive, highly accurate test based on it.
You must return the result strictly matching the provided JSON schema.
- For Multiple Choice Questions (mcq), provide exactly 4 options. The 'correctAnswer' must exactly match one of the 'options'.
- For True/False questions (true_false), provide options: ["True", "False"]. The 'correctAnswer' must be "True" or "False".
- For Short Answer questions (short_answer), 'options' should be an empty array or null.
Make sure the explanations are clear and refer back to the text.
Do NOT include any conversational filler, markdown code blocks, or text outside of the JSON payload.
  `.trim();

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'), // Use gpt-4o for complex instruction following and structured outputs
      schema: questionSetSchema,
      system: systemPrompt,
      prompt: `Here is the source material to base the test on:\n\n${sourceText}`,
      temperature: 0.2, // Low temperature for more factual and consistent question generation
    });

    return object;
  } catch (error) {
    console.error('Error generating question set:', error);
    throw new Error('Failed to generate question set using the AI Engine.');
  }
}
