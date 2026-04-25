import crypto from "node:crypto";

import { prisma } from "@/lib/prisma";
import type { LocusWebhookEvent, OrderStatus } from "@/lib/types";

const WEBHOOK_STATUS_MAP: Record<LocusWebhookEvent["event"], OrderStatus> = {
  "checkout.session.paid": "paid",
  "checkout.session.expired": "expired",
};

const verifyWebhookSignature = ({
  payload,
  incomingSignature,
  secret,
}: {
  payload: string;
  incomingSignature: string;
  secret: string;
}) => {
  const expected = `sha256=${crypto.createHmac("sha256", secret).update(payload).digest("hex")}`;
  const incomingBuffer = Buffer.from(incomingSignature);
  const expectedBuffer = Buffer.from(expected);

  if (incomingBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(incomingBuffer, expectedBuffer);
};

export async function POST(request: Request) {
  const rawPayload = await request.text();

  let event: Partial<LocusWebhookEvent> & { type?: string };
  try {
    event = JSON.parse(rawPayload) as Partial<LocusWebhookEvent> & { type?: string };
  } catch {
    return Response.json({ error: "invalid JSON payload" }, { status: 400 });
  }

  const eventName =
    (typeof event.event === "string" && event.event) ||
    (typeof event.type === "string" && event.type) ||
    "";
  const sessionIdFromHeader = request.headers.get("x-session-id");
  const sessionId =
    (sessionIdFromHeader && sessionIdFromHeader.trim()) ||
    (typeof event.data?.sessionId === "string" ? event.data.sessionId : "");

  if (!eventName || !sessionId) {
    return Response.json({ error: "missing event name or sessionId" }, { status: 400 });
  }

  const existingOrder = await prisma.order.findUnique({
    where: { locusSessionId: sessionId },
    select: {
      id: true,
      status: true,
      locusWebhookSecret: true,
    },
  });

  if (!existingOrder) {
    return Response.json({ error: "order not found for this session" }, { status: 404 });
  }

  const incomingSignature = request.headers.get("x-signature-256");
  if (!incomingSignature) {
    return Response.json({ error: "missing X-Signature-256 header" }, { status: 401 });
  }

  const webhookSecret = existingOrder.locusWebhookSecret ?? process.env.LOCUS_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json({ error: "webhook secret is not configured for this session" }, { status: 500 });
  }

  const signatureIsValid = verifyWebhookSignature({
    payload: rawPayload,
    incomingSignature,
    secret: webhookSecret,
  });

  if (!signatureIsValid) {
    return Response.json({ error: "invalid webhook signature" }, { status: 401 });
  }

  const status = WEBHOOK_STATUS_MAP[eventName as LocusWebhookEvent["event"]];
  if (!status) {
    return Response.json({ received: true, ignored: true, event: eventName });
  }

  // Never regress a paid order back to expired.
  if (existingOrder.status === "paid" && status !== "paid") {
    return Response.json({ received: true, ignored: true, status: existingOrder.status });
  }

  const updatedOrder = await prisma.order.update({
    where: { locusSessionId: sessionId },
    data: {
      status,
      buyerWalletAddress: event.data?.payerAddress ?? undefined,
      paymentTxHash: event.data.paymentTxHash ?? undefined,
      ...(status === "paid"
        ? {
            paidAt: event.data?.paidAt ? new Date(event.data.paidAt) : new Date(),
          }
        : {}),
    },
    select: {
      locusSessionId: true,
      status: true,
      paidAt: true,
    },
  });

  return Response.json({
    received: true,
    event: eventName,
    locusSessionId: updatedOrder.locusSessionId,
    status: updatedOrder.status,
    paidAt: updatedOrder.paidAt,
  });
}
