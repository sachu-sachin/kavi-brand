import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { markOrderPaid } from "@/lib/checkout";
import { sendOrderConfirmation } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const payment = event.payload?.payment?.entity;
    const razorpayOrderId = payment?.order_id;
    const razorpayPaymentId = payment?.id;

    if (razorpayOrderId && razorpayPaymentId) {
      const result = await markOrderPaid(razorpayOrderId, razorpayPaymentId);
      if (result.status === "paid") {
        // Fire-and-forget — must not block the 200 to Razorpay.
        void sendOrderConfirmation(result.orderId);
      }
    }
  }

  return NextResponse.json({ received: true });
}
