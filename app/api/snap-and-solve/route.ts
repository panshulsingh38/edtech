import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60; // Allow 60 seconds for Vercel Hobby tier

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
    if (user.role !== "ADMIN" && user.insights < 1) {
      return NextResponse.json(
        { error: "Insufficient Insights. You need at least 1 Insight to solve a problem." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const buffer = await image.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `You are a world-class tutor for Math, Physics, and Chemistry. 
A student has uploaded a picture of a homework problem they are stuck on.
Provide a step-by-step solution. Do NOT just give the final answer. 
Break down the concepts clearly so the student can learn from it.
Use markdown formatting to make it easy to read.

CRITICAL INSTRUCTION ON MATH FORMATTING: You must strictly wrap ALL LaTeX math expressions in valid delimiters for markdown rendering. Use \`$\` for inline math (e.g., $x = 2$) and \`$$\` for block math (e.g., $$x^2 = 4$$). Never output raw LaTeX like \\begin{array} without wrapping it in \`$$\`!`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type,
        },
      },
    ]);

    const responseText = result.response.text();

    // Deduct 1 insight if not admin
    if (user.role !== "ADMIN") {
      await prisma.user.update({
        where: { id: user.id },
        data: { insights: { decrement: 1 } },
      });
    }

    // Log the solution in the DB
    await prisma.solutionLog.create({
      data: {
        userId: user.id,
        type: "SNAP_AND_SOLVE",
        content: responseText,
      },
    });

    return NextResponse.json({ solution: responseText });
  } catch (error: any) {
    console.error("Snap & Solve Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process image. Please check your API key and try again." }, { status: 500 });
  }
}
