import { z } from 'zod';
import { generateObject, generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const questionSetSchema = z.object({
  testTitle: z.string().describe('The title of the generated test'),
  questions: z.array(
    z.object({
      id: z.string().describe('A unique string ID for this question (e.g. q1, q2)'),
      type: z.enum(['mcq', 'true_false', 'short_answer', 'slider_interactive', 'reverse_construction', 'coordinate_hotspot', 'estimation']),
      questionText: z.string().describe('The text of the question'),
      options: z.array(z.string()).nullable().describe('Array of 4 options if mcq, otherwise empty array or null'),
      correctAnswer: z.string().describe('The exact text of the correct answer. Must match one of the options for MCQ. For coordinate_hotspot, represent as "x,y".'),
      explanation: z.string().describe('Explanation of why the answer is correct based on the source text'),
      steps: z.array(z.object({
        stepNumber: z.number(),
        title: z.string(),
        logicalDeduction: z.string(),
        equation: z.string().optional()
      })).nullable().optional().describe('For math/logic problems, a step-by-step breakdown of the solution'),
      flawIndex: z.number().nullable().optional().describe('For flaw questions, the stepNumber where the intentional algebraic/logic flaw was injected'),
      variables: z.array(z.object({
        name: z.string(),
        min: z.number(),
        max: z.number(),
        step: z.number(),
        defaultValue: z.number()
      })).nullable().optional().describe('For slider_interactive, the variables to adjust (e.g., mass, velocity)'),
      targetCoordinate: z.object({
        x: z.number(),
        y: z.number()
      }).nullable().optional().describe('For coordinate_hotspot, the target (x,y) coordinates to click on a Cartesian plane.'),
      trapLabel: z.string().nullable().optional().describe('For mcq and true_false, a short 1-3 word label of the specific cognitive trap or fallacy a student falls for if they get it wrong (e.g., "Unit Mismatch", "Confirmation Bias").'),
      alignmentCode: z.string().nullable().optional().describe('National Core Competency standard alignment code (e.g. CCSS.MATH.CONTENT.HSA.CED.A.1) if applicable.'),
      imagePrompt: z.string().nullable().optional().describe('A concise, descriptive prompt for generating an image to accompany this question. Must be a visual description (e.g. "a glowing blue microscopic cell structure").')
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
export async function generateQuestionSet(
  sourceText: string, 
  difficulty: string = 'College Level', 
  tone: string = 'Professional', 
  isSynthesis: boolean = false,
  images?: { data: string, mimeType: string }[],
  questionCount: number = 10
): Promise<QuestionSet> {
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
${isSynthesis ? `CRITICAL INSTRUCTION: You are generating a CROSS-DOCUMENT SYNTHESIS test. The source text contains concatenated text from MULTIPLE distinct documents. 
You MUST generate questions that explicitly bridge concepts between these different documents. Compare, contrast, and synthesize ideas across the entire provided corpus.` : ''}
CRITICAL INSTRUCTION: You MUST generate EXACTLY ${questionCount} questions. No more, no less.
You must return the result strictly matching the provided JSON schema.
- For Multiple Choice Questions (mcq), provide exactly 4 options. The 'correctAnswer' must exactly match one of the 'options'.
- For True/False questions (true_false), provide options: ["True", "False"]. The 'correctAnswer' must be "True" or "False".
- For short_answer, provide an empty array for options. 'correctAnswer' should be the ideal written response.
- For mcq and true_false, generate a 'trapLabel' that succinctly names the fallacy or common trap a student would fall for if they answered incorrectly.
- For estimation questions, the 'correctAnswer' should be an integer representing the exponent of base 10 (e.g. "3" for 10^3).
- For reverse_construction, the 'questionText' should give the user an answer, and ask them to construct the formula or question that leads to it. The 'correctAnswer' is the formula/question.
- For slider_interactive, provide 'variables' to adjust. The 'questionText' should describe the physics/math system. The 'correctAnswer' should be the outcome when defaults are used.
- For coordinate_hotspot, provide 'targetCoordinate' (x, y) between -10 and 10. The 'correctAnswer' must be "x,y".
- For math or logic problems, always provide a strictly typed JSON array of 'steps' breaking down the solution.
- For "Spot the Flaw" questions (if the difficulty/topic calls for it), inject EXACTLY ONE algebraic or logical flaw (e.g., division by zero) into the steps, and set the 'flawIndex' to the stepNumber of the mistake.
- When generating questions, attempt to tag them with a relevant National Core Competency standard 'alignmentCode' (e.g., Common Core CCSS.MATH.CONTENT.HSA.CED.A.1, NGSS, etc.) if applicable to the subject matter.
Make sure the explanations are clear and refer back to the text.
Do NOT include any conversational filler, markdown code blocks, or text outside of the JSON payload.
  `.trim();

  try {
    const messageContent: any[] = [
      { type: 'text', text: `Here is the source material to base the test on:\n\n${sourceText}` }
    ];

    if (images && images.length > 0) {
      images.forEach(img => {
        messageContent.push({
          type: 'image',
          image: new URL(`data:${img.mimeType};base64,${img.data}`)
        });
      });
    }

    try {
      const { object } = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: questionSetSchema,
        system: systemPrompt,
        messages: [{ role: 'user', content: messageContent }],
        temperature: 0.2, 
        maxRetries: 4 // Enable robust auto-retries for minor hiccups
      });
      return object;
    } catch (primaryError: any) {
      console.error('gemini-2.5-flash failed after retries:', primaryError.message);
      throw primaryError;
    }

  } catch (error: any) {
    console.error('Error generating question set:', error);
    throw new Error(`Google API Error: ${error.message || 'Unknown error during test generation'}`);
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
    model: google('gemini-2.5-flash'),
    schema: gradingSchema,
    system: systemPrompt,
    prompt: `Question: ${questionText}\nCorrect Answer/Concept: ${correctAnswer}\nStudent's Answer: ${userAnswer}`,
    temperature: 0.1,
    maxRetries: 0
  });

  return object;
}

export async function chatWithDocument(sourceText: string, chatHistory: any[], newMessage: string, persona: string = "Standard", isTranspiling: boolean = false) {
  let personaInstruction = "";
  if (isTranspiling) {
    personaInstruction = "You are a Code-to-Proof Algorithmic Transpiler. The user will provide JavaScript/Python code. You must translate their logic into a rigorous mathematical proof or algebraic formula.";
  } else if (persona === "Albert Einstein") {
    personaInstruction = "You are Albert Einstein. Explain concepts using thought experiments (gedankenexperiments), visualizations, and references to space-time, relativity, or light when relevant. Maintain a brilliant but slightly absent-minded professor tone.";
  } else if (persona === "Socrates") {
    personaInstruction = "You are Socrates. You never give direct answers. Instead, you constantly ask probing, philosophical questions to force the student to arrive at the conclusion themselves through the Socratic method.";
  } else if (persona === "Marie Curie") {
    personaInstruction = "You are Marie Curie. You emphasize rigorous experimentation, determination, and the beauty of science and discovery. You are highly analytical and deeply committed to the scientific method.";
  } else if (persona === "Gordon Ramsay (Strict)") {
    personaInstruction = "You are Gordon Ramsay, but as a tutor. You are intensely strict, extremely demanding, and constantly disappointed, but ultimately you want the student to succeed. You use cooking metaphors (e.g., 'This logic is RAW!'). No profanity, but highly aggressive.";
  } else {
    personaInstruction = "You are a helpful and supportive AI tutor.";
  }

  const systemPrompt = `You are an AI Tutor answering questions based on the following document:
---
${sourceText}
---

${personaInstruction}

CRITICAL INSTRUCTION: Adopt a Socratic teaching style. DO NOT simply hand the student the final answer. Instead, ask small, guiding questions to help them discover the answer themselves. If they are stuck, give them a hint about the next step, but make them do the work.
If you are acting as the Transpiler, you may give direct transpilation results.

CRITICAL INSTRUCTION ON MATH FORMATTING: You must strictly wrap ALL LaTeX math expressions in valid delimiters for markdown rendering. Use \`$\` for inline math (e.g., $x = 2$) and \`$$\` for block math (e.g., $$x^2 = 4$$). Never output raw LaTeX like \\begin{array} without wrapping it in \`$$\` or \`\\[\\]\`!`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory,
    { role: 'user', content: newMessage }
  ];

  const { text } = await generateText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages: messages as any,
    temperature: 0.7,
    maxRetries: 0,
  });

  return text;
}
