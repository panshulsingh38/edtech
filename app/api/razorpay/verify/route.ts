import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, insightsToAdd } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET || "";

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Payment is verified! Give the user the insights.
    // @ts-ignore
    const userId = session.user.id;
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        insights: { increment: parseInt(insightsToAdd) }
      }
    });

    return NextResponse.json({ success: true, insightsAdded: insightsToAdd });
  } catch (err: any) {
    console.error("Razorpay Verification Error:", err);
    return NextResponse.json({ error: err.message || "Verification failed" }, { status: 500 });
  }
}
