import { convertNgnToUsdc } from "@/lib/currency";
import { saveOrder, saveProduct, slugExists } from "@/lib/mock-store";
import { createId, createUniqueSlug } from "@/lib/slug";
import type { PublishRequestBody, PublishResponse, ProductRecord } from "@/lib/types";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PublishRequestBody>;

    if (
      !isNonEmptyString(body.title) ||
      !isNonEmptyString(body.tagline) ||
      !isNonEmptyString(body.format) ||
      !isNonEmptyString(body.targetAudience) ||
      !isNonEmptyString(body.description) ||
      !isNonEmptyString(body.ideaInput) ||
      !isStringArray(body.benefits) ||
      !isStringArray(body.includes)
    ) {
      return Response.json({ error: "missing or invalid publish fields" }, { status: 400 });
    }

    const priceNgn = Number(body.priceNgn);
    if (!Number.isFinite(priceNgn) || priceNgn <= 0) {
      return Response.json({ error: "priceNgn must be a positive number" }, { status: 400 });
    }

    const priceUsdc = convertNgnToUsdc(priceNgn);
    const slug = createUniqueSlug(body.title, slugExists);

    const productId = `prod_${createId(10)}`;
    const sessionId = `locus_${createId(12)}`;
    const now = new Date().toISOString();
    const checkoutUrl = `https://checkout.locus.so/session/${sessionId}`;

    const product: ProductRecord = {
      id: productId,
      userId: null,
      title: body.title.trim(),
      slug,
      tagline: body.tagline.trim(),
      format: body.format.trim(),
      targetAudience: body.targetAudience.trim(),
      description: body.description.trim(),
      benefits: body.benefits.map((item) => item.trim()).filter(Boolean),
      includes: body.includes.map((item) => item.trim()).filter(Boolean),
      ideaInput: body.ideaInput.trim(),
      priceNgn,
      priceUsdc,
      checkoutUrl,
      locusSessionId: sessionId,
      status: "published",
      createdAt: now,
      updatedAt: now,
    };

    saveProduct(product);

    saveOrder({
      id: `order_${createId(10)}`,
      productId,
      locusSessionId: sessionId,
      buyerWalletAddress: null,
      amountUsdc: priceUsdc,
      paymentTxHash: null,
      status: "pending",
      paidAt: null,
      createdAt: now,
    });

    const response: PublishResponse = {
      productId,
      slug,
      publicUrl: `/p/${slug}`,
      checkoutUrl,
    };

    return Response.json(response);
  } catch {
    return Response.json({ error: "invalid JSON payload" }, { status: 400 });
  }
}
