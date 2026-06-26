import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";

const prisma = new PrismaClient();

export const maxDuration = 60; // Allow up to 60 seconds for processing long PDFs

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has enough insights
    if (user.role !== "ADMIN" && user.insights < 5) {
      return NextResponse.json(
        { error: "Insufficient Insights. You need at least 5 Insights to generate a survival guide." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Send the file directly inline to Gemini
    const buffer = Buffer.from(await file.arrayBuffer());

    const prompt = `You are a master exam prep tutor helping a panicked student the night before their exam.
They have uploaded their textbook, syllabus, or notes.
Read the entire document and condense it into a 'Night-Before Survival Guide'.
Please include:
1. **The Core 20%**: The most critical concepts/formulas that yield 80% of the results.
2. **Top 10 Highest-Probability Questions**: What is most likely to be on the test? Provide the answers.
3. **Rapid-Fire Cheat Sheet**: Quick bullet points they can read in the hallway before walking in.
Make it highly structured and readable using Markdown. Use bolding and lists to make it skimmable.`;

    const result = await streamText({
      model: google('gemini-3.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'file', data: buffer, mediaType: file.type }
          ]
        }
      ],
      async onFinish({ text }) {
        // Deduct 5 insights if not admin
        if (user.role !== "ADMIN") {
          await prisma.user.update({
            where: { id: user.id },
            data: { insights: { decrement: 5 } },
          });
        }

        // Log the guide in the DB
        await prisma.solutionLog.create({
          data: {
            userId: user.id,
            type: "SURVIVAL_GUIDE",
            content: text,
          },
        });
      }
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Survival Guide Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to generate guide." }), { status: 500 });
  }
}
