import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2025-01-27.acacia" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    // Verify webhook signature if secret is provided
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message);
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
    } else {
      // In dev mode without a secret, just parse the JSON
      event = JSON.parse(body) as Stripe.Event;
      console.warn("⚠️ Bypassing Stripe Webhook signature verification because STRIPE_WEBHOOK_SECRET is not set.");
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const userId = session.metadata?.userId;
      const insightsToAdd = parseInt(session.metadata?.insightsToAdd || "0", 10);

      if (userId && insightsToAdd > 0) {
        console.log(`[Stripe Webhook] Adding ${insightsToAdd} insights to user ${userId}`);
        
        await prisma.user.update({
          where: { id: userId },
          data: {
            insights: {
              increment: insightsToAdd
            }
          }
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
