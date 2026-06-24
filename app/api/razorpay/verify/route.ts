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
    
    // Check if this order was already fulfilled by the webhook
    const existingPayment = await prisma.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id }
    });

    if (existingPayment) {
      // Already processed, just return success
      return NextResponse.json({ success: true, insightsAdded: 0, message: "Already processed" });
    }

    try {
      // Use a database transaction to ensure atomicity
      await prisma.$transaction([
        prisma.payment.create({
          data: {
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            userId: userId,
            insightsAdded: parseInt(insightsToAdd),
            status: "SUCCESS"
          }
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            insights: { increment: parseInt(insightsToAdd) }
          }
        })
      ]);
    } catch (err: any) {
      // P2002 is Prisma's error code for a Unique Constraint Violation (meaning the webhook literally just created it)
      if (err.code === 'P2002') {
        return NextResponse.json({ success: true, insightsAdded: 0, message: "Already processed concurrently" });
      }
      throw err; // Re-throw other errors
    }

    return NextResponse.json({ success: true, insightsAdded: insightsToAdd });
  } catch (err: any) {
    console.error("Razorpay Verification Error:", err);
    return NextResponse.json({ error: err.message || "Verification failed" }, { status: 500 });
  }
}
