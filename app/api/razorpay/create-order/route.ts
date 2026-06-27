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
    const { packId, region = 'india' } = body;

    let amount = 0;
    let insights = 0;
    let currency = region === 'intl' ? 'USD' : 'INR';

    if (currency === 'INR') {
      switch (packId) {
        case "mini":
          amount = 5000; // ₹50
          insights = 25;
          break;
        case "starter":
          amount = 24900; // ₹249
          insights = 50;
          break;
        case "midterm":
          amount = 59900; // ₹599
          insights = 150;
          break;
        case "finals":
          amount = 124900; // ₹1249
          insights = 500;
          break;
        default:
          return NextResponse.json({ error: "Invalid pack ID" }, { status: 400 });
      }
    } else {
      switch (packId) {
        case "mini":
          amount = 299; // $2.99
          insights = 25;
          break;
        case "starter":
          amount = 699; // $6.99
          insights = 50;
          break;
        case "midterm":
          amount = 1499; // $14.99
          insights = 150;
          break;
        case "finals":
          amount = 2999; // $29.99
          insights = 500;
          break;
        default:
          return NextResponse.json({ error: "Invalid pack ID" }, { status: 400 });
      }
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });

    const orderOptions = {
      amount: amount,
      currency: currency,
      receipt: `rcpt_${Date.now().toString().slice(-8)}`,
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
