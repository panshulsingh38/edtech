import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { packId } = body;

    let priceInPaisa = 0;
    let insights = 0;

    switch (packId) {
      case "starter":
        priceInPaisa = 24900; // ₹249
        insights = 50;
        break;
      case "midterm":
        priceInPaisa = 59900; // ₹599
        insights = 150;
        break;
      case "finals":
        priceInPaisa = 124900; // ₹1249
        insights = 500;
        break;
      default:
        return NextResponse.json({ error: "Invalid pack ID" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });

    const orderOptions = {
      amount: priceInPaisa,
      currency: "INR",
      // @ts-ignore
      receipt: `receipt_${packId}_${session.user.id}`,
      notes: {
        // @ts-ignore
        userId: session.user.id,
        insightsToAdd: insights.toString(),
        packId,
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    return NextResponse.json({ 
      id: order.id, 
      currency: order.currency, 
      amount: order.amount,
      insightsToAdd: insights
    });
  } catch (err: any) {
    console.error("Razorpay Create Order Error:", err);
    return NextResponse.json({ error: err.message || "Failed to create order" }, { status: 500 });
  }
}
