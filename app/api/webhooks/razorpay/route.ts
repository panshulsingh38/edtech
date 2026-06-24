import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error("Missing RAZORPAY_WEBHOOK_SECRET");
      return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
    }

    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // We only care about successful captures
    if (event.event === "payment.captured") {
      const paymentEntity = event.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;
      
      const userId = paymentEntity.notes?.userId;
      const insightsToAdd = parseInt(paymentEntity.notes?.insightsToAdd || "0");
      const packId = paymentEntity.notes?.packId;

      if (!userId || insightsToAdd <= 0) {
         // Missing notes, maybe this order was created outside our app
         return NextResponse.json({ success: true, message: "No fulfillment info" });
      }

      // Check if this order was already fulfilled (e.g. by the frontend verify route)
      const existingPayment = await prisma.payment.findUnique({
        where: { razorpayOrderId: razorpayOrderId }
      });

      if (existingPayment) {
        return NextResponse.json({ success: true, message: "Already processed by frontend" });
      }

      try {
        await prisma.$transaction([
          prisma.payment.create({
            data: {
              razorpayOrderId: razorpayOrderId,
              razorpayPaymentId: razorpayPaymentId,
              userId: userId,
              packId: packId,
              insightsAdded: insightsToAdd,
              status: "SUCCESS"
            }
          }),
          prisma.user.update({
            where: { id: userId },
            data: {
              insights: { increment: insightsToAdd }
            }
          })
        ]);
        console.log(`[Webhook] Successfully credited ${insightsToAdd} insights to user ${userId}`);
      } catch (err: any) {
        // P2002 means the frontend beat us to it in the exact same millisecond
        if (err.code === 'P2002') {
          return NextResponse.json({ success: true, message: "Already processed concurrently" });
        }
        throw err;
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Razorpay Webhook Error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
