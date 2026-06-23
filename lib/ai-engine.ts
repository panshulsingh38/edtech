import { z } from 'zod';
import { generateObject, generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const questionSetSchema = z.object({
  testTitle: z.string().describe('The title of the generated test'),
  questions: z.array(
    z.object({
      id: z.string().describe('A unique string ID for this question (e.g. q1, q2)'),
      type: z.enum(['mcq', 'true_false', 'short_answer']),
      questionText: z.string().describe('The text of the question'),
      options: z.array(z.string()).nullable().describe('Array of 4 options if mcq, otherwise empty array or null'),
      correctAnswer: z.string().describe('The exact text of the correct answer. Must match one of the options for MCQ.'),
      explanation: z.string().describe('Explanation of why the answer is correct based on the source text'),
    })
  ),
});

export type QuestionSet = z.infer<typeof questionSetSchema>;

// Initialize the Google Generative AI client
const rawApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
console.log(`[DEBUG] Initializing AI SDK. Key length: ${rawApiKey.length}, Starts with: ${rawApiKey.substring(0, 5)}...`);

const google = createGoogleGenerativeAI({
  apiKey: rawApiKey,
});

/**
 * Generates a structured question set from provided text using Gemini.
 * Falls back to a mock mode if the API key is missing.
 */
export async function generateQuestionSet(sourceText: string, difficulty: string = 'College Level', tone: string = 'Professional'): Promise<QuestionSet> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  // Mock fallback if no API key is present
  if (!apiKey) {
    console.warn("No GOOGLE_GENERATIVE_AI_API_KEY found. Falling back to Mock AI Mode.");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
    
    return {
      testTitle: "Mocked History Test (No API Key)",
      questions: [
        {
          id: crypto.randomUUID(),
          type: "mcq",
          questionText: "What year did the Apollo 11 moon landing occur?",
          options: ["1965", "1969", "1971", "1980"],
          correctAnswer: "1969",
          explanation: "Apollo 11 landed on the moon on July 20, 1969."
        },
        {
          id: crypto.randomUUID(),
          type: "true_false",
          questionText: "The capital of France is Rome.",
          options: ["True", "False"],
          correctAnswer: "False",
          explanation: "The capital of France is Paris."
        }
      ]
    };
  }

  const systemPrompt = `
You are an expert educator and instructional designer.
Your task is to analyze the provided source material and generate a comprehensive, highly accurate test based on it.
TARGET AUDIENCE / DIFFICULTY LEVEL: ${difficulty}. The questions and concepts tested must be appropriate for this level.
TONE OF VOICE / STYLE: ${tone}. The questions, answers, and especially the explanations should be written in this tone.
You must return the result strictly matching the provided JSON schema.
- For Multiple Choice Questions (mcq), provide exactly 4 options. The 'correctAnswer' must exactly match one of the 'options'.
- For True/False questions (true_false), provide options: ["True", "False"]. The 'correctAnswer' must be "True" or "False".
- For Short Answer questions (short_answer), 'options' should be an empty array or null.
Make sure the explanations are clear and refer back to the text.
Do NOT include any conversational filler, markdown code blocks, or text outside of the JSON payload.
  `.trim();

  try {
    const { object } = await generateObject({
      model: google('gemini-flash-latest'),
      schema: questionSetSchema,
      system: systemPrompt,
      prompt: `Here is the source material to base the test on:\n\n${sourceText}`,
      temperature: 0.2, 
    });

    return object;
  } catch (error: any) {
    console.error('Error generating question set:', error);
    console.warn("Falling back to Mock AI Mode due to API error (likely Quota Exceeded or Invalid Model).");
    // Return mock response to prevent the app from breaking
    return {
      testTitle: "Mocked Video/Document Test (API Quota Exceeded)",
      questions: [
        {
          id: crypto.randomUUID(),
          type: "mcq",
          questionText: "What happens when you exceed a free-tier API quota?",
          options: ["The app crashes forever", "You gracefully fall back to mock data", "You cry", "You delete the codebase"],
          correctAnswer: "You gracefully fall back to mock data",
          explanation: "Graceful degradation is a key principle of robust software engineering."
        },
        {
          id: crypto.randomUUID(),
          type: "true_false",
          questionText: "Spaced Repetition Systems (SRS) are proven to increase long-term memory retention.",
          options: ["True", "False"],
          correctAnswer: "True",
          explanation: "SRS algorithms optimize the intervals at which you review material to combat the forgetting curve."
        }
      ]
    };
  }
}

export const gradingSchema = z.object({
  score: z.number().min(0).max(10).describe('Score out of 10 based on how correct the answer is'),
  feedback: z.string().describe('Personalized feedback explaining what they got right, wrong, and how to improve.')
});

export type GradingResult = z.infer<typeof gradingSchema>;

export async function gradeAnswer(questionText: string, correctAnswer: string, userAnswer: string): Promise<GradingResult> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { score: 7, feedback: "This is a mock grade because no API key was found." };
  }

  const systemPrompt = `You are a strict but fair professor. Grade the student's short answer out of 10.
Provide personalized, encouraging feedback. Point out exactly what they missed if they didn't get a 10/10.`;

  const { object } = await generateObject({
    model: google('gemini-1.5-flash'),
    schema: gradingSchema,
    system: systemPrompt,
    prompt: `Question: ${questionText}\nCorrect Answer/Concept: ${correctAnswer}\nStudent's Answer: ${userAnswer}`,
    temperature: 0.1,
  });

  return object;
}

export async function chatWithDocument(sourceText: string, chatHistory: { role: 'user'|'assistant', content: string }[], newMessage: string): Promise<string> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return "This is a mocked response from the AI tutor since no API key is provided.";
  }

  const systemPrompt = `You are a helpful AI Tutor assisting a student. 
Use the provided Source Document as your sole source of truth.
If the answer is not in the document, say so. Do not invent information.

--- SOURCE DOCUMENT ---
${sourceText}
-----------------------`;

  const messages = [
    ...chatHistory.map(m => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: newMessage }
  ];

  const { text } = await generateText({
    model: google('gemini-1.5-flash'),
    system: systemPrompt,
    messages: messages as any,
    temperature: 0.3,
  });

  return text;
}
