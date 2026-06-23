import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2025-01-27.acacia" as any,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { packId } = body;

    let price = 0;
    let insights = 0;
    let name = "";

    switch (packId) {
      case "starter":
        price = 300; // $3.00
        insights = 50;
        name = "Starter Pack (50 Insights)";
        break;
      case "midterm":
        price = 700; // $7.00
        insights = 150;
        name = "Midterm Cram Pack (150 Insights)";
        break;
      case "finals":
        price = 1500; // $15.00
        insights = 500;
        name = "Finals Season Pack (500 Insights)";
        break;
      default:
        return NextResponse.json({ error: "Invalid pack ID" }, { status: 400 });
    }

    const host = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name,
              description: `Adds ${insights} AI Insights to your account instantly.`,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${host}/?payment_success=true`,
      cancel_url: `${host}/?payment_cancelled=true`,
      metadata: {
        // @ts-ignore
        userId: session.user.id,
        insightsToAdd: insights.toString(),
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (err: any) {
    console.error("Stripe Checkout Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
