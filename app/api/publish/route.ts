import { convertNgnToUsdc } from "@/lib/currency";
import { prisma } from "@/lib/prisma";
import { createId, slugify } from "@/lib/slug";
import type { PublishRequestBody, PublishResponse } from "@/lib/types";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const createUniqueSlug = async (title: string) => {
  const baseSlug = slugify(title);
  let candidateSlug = baseSlug;

  // Keep slug creation simple for MVP while avoiding collisions.
  while (
    await prisma.product.findUnique({
      where: { slug: candidateSlug },
      select: { id: true },
    })
  ) {
    candidateSlug = `${baseSlug}-${createId(4)}`;
  }

  return candidateSlug;
};

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
    const slug = await createUniqueSlug(body.title.trim());

    const sessionId = `locus_${createId(12)}`;
    const checkoutUrl = `https://checkout.locus.so/session/${sessionId}`;

    const benefits = body.benefits.map((item) => item.trim()).filter(Boolean);
    const includes = body.includes.map((item) => item.trim()).filter(Boolean);

    const createdProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          userId: null,
          title: body.title.trim(),
          slug,
          tagline: body.tagline.trim(),
          format: body.format.trim(),
          targetAudience: body.targetAudience.trim(),
          description: body.description.trim(),
          benefits,
          includes,
          ideaInput: body.ideaInput.trim(),
          priceNgn,
          priceUsdc,
          checkoutUrl,
          locusSessionId: sessionId,
          status: "published",
        },
      });

      await tx.order.create({
        data: {
          productId: product.id,
          locusSessionId: sessionId,
          buyerWalletAddress: null,
          amountUsdc: priceUsdc,
          paymentTxHash: null,
          status: "pending",
        },
      });

      return product;
    });

    const response: PublishResponse = {
      productId: createdProduct.id,
      slug,
      publicUrl: `/p/${slug}`,
      checkoutUrl,
    };

    return Response.json(response);
  } catch {
    return Response.json({ error: "invalid JSON payload" }, { status: 400 });
  }
}
