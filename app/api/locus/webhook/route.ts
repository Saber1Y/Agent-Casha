import { prisma } from "@/lib/prisma";
import type { LocusWebhookEvent, OrderStatus } from "@/lib/types";

const WEBHOOK_STATUS_MAP: Record<LocusWebhookEvent["type"], OrderStatus> = {
  "checkout.paid": "paid",
  "checkout.expired": "expired",
  "checkout.cancelled": "cancelled",
};

export async function POST(request: Request) {
  const requiredSecret = process.env.LOCUS_WEBHOOK_SECRET;
  const incomingSignature = request.headers.get("x-locus-signature");

  if (requiredSecret && incomingSignature !== requiredSecret) {
    return Response.json({ error: "invalid webhook signature" }, { status: 401 });
  }

  let event: Partial<LocusWebhookEvent>;
  try {
    event = (await request.json()) as Partial<LocusWebhookEvent>;
  } catch {
    return Response.json({ error: "invalid JSON payload" }, { status: 400 });
  }

  if (!event.type || !event.data?.sessionId) {
    return Response.json({ error: "missing event type or sessionId" }, { status: 400 });
  }

  const status = WEBHOOK_STATUS_MAP[event.type];
  if (!status) {
    return Response.json({ received: true, ignored: true });
  }

  const existingOrder = await prisma.order.findUnique({
    where: { locusSessionId: event.data.sessionId },
    select: { id: true },
  });

  if (!existingOrder) {
    return Response.json({ error: "order not found for this session" }, { status: 404 });
  }

  const updatedOrder = await prisma.order.update({
    where: { locusSessionId: event.data.sessionId },
    data: {
      status,
      buyerWalletAddress: event.data.buyerWalletAddress ?? undefined,
      paymentTxHash: event.data.paymentTxHash ?? undefined,
      ...(status === "paid" ? { paidAt: new Date() } : {}),
    },
    select: {
      locusSessionId: true,
      status: true,
      paidAt: true,
    },
  });

  return Response.json({
    received: true,
    locusSessionId: updatedOrder.locusSessionId,
    status: updatedOrder.status,
    paidAt: updatedOrder.paidAt,
  });
}
