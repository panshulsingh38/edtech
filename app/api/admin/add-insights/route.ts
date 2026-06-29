import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { insights } = await req.json();
    
    await prisma.user.update({
      where: { id: (session.user as any).id },
      data: { insights: { increment: insights } }
    });

    return NextResponse.json({ success: true });
  } catch(e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
