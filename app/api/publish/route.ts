import { convertNgnToUsdc } from "@/lib/currency";
import { createLocusCheckoutSession } from "@/lib/locus";
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

const resolveBaseUrl = (request: Request) => {
  const configuredBaseUrl = process.env.APP_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (configuredBaseUrl && configuredBaseUrl.trim()) {
    return configuredBaseUrl.trim().replace(/\/+$/, "");
  }

  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedHost) {
    const host = forwardedHost.split(",")[0]?.trim();
    const protocol = forwardedProto?.split(",")[0]?.trim() || requestUrl.protocol.replace(":", "");
    if (host && protocol) {
      return `${protocol}://${host}`;
    }
  }

  return requestUrl.origin;
};

const isLocalHostname = (hostname: string) =>
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";

export async function POST(request: Request) {
  let body: Partial<PublishRequestBody>;
  try {
    body = (await request.json()) as Partial<PublishRequestBody>;
  } catch {
    return Response.json({ error: "invalid JSON payload" }, { status: 400 });
  }

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

  const locusApiKey = process.env.LOCUS_API_KEY ?? process.env.CLAW_API_KEY;
  if (!locusApiKey) {
    return Response.json(
      { error: "LOCUS_API_KEY (or CLAW_API_KEY) is not configured" },
      { status: 500 },
    );
  }

  const priceUsdc = convertNgnToUsdc(priceNgn);
  const title = body.title.trim();
  const tagline = body.tagline.trim();
  const format = body.format.trim();
  const targetAudience = body.targetAudience.trim();
  const description = body.description.trim();
  const ideaInput = body.ideaInput.trim();
  const benefits = body.benefits.map((item) => item.trim()).filter(Boolean);
  const includes = body.includes.map((item) => item.trim()).filter(Boolean);
  const slug = await createUniqueSlug(title);

  const baseUrl = resolveBaseUrl(request);
  const publicUrl = `/p/${slug}`;
  const publicProductUrl = `${baseUrl}${publicUrl}`;
  const baseHostname = new URL(baseUrl).hostname.toLowerCase();
  const shouldSendCallbacks = !isLocalHostname(baseHostname);
  const successUrl = shouldSendCallbacks
    ? `${baseUrl}/success?slug=${encodeURIComponent(slug)}&payment=success`
    : undefined;
  const cancelUrl = shouldSendCallbacks ? `${publicProductUrl}?payment=cancelled` : undefined;
  const webhookUrl = shouldSendCallbacks ? `${baseUrl}/api/locus/webhook` : undefined;

  if (!shouldSendCallbacks) {
    console.warn(
      "Publishing without callback URLs because base URL is local. Set APP_BASE_URL to a public HTTPS URL to enable success redirects and webhooks.",
    );
  }

  let session: Awaited<ReturnType<typeof createLocusCheckoutSession>>;
  try {
    session = await createLocusCheckoutSession({
      apiKey: locusApiKey,
      amountUsdc: priceUsdc,
      description: `${title} (${format})`,
      successUrl,
      cancelUrl,
      webhookUrl,
      metadata: {
        slug,
        productTitle: title.slice(0, 120),
        priceNgn: String(priceNgn),
      },
    });
  } catch (error) {
    const baseMessage =
      error instanceof Error ? error.message : "could not create Locus checkout session";
    const callbackHint = shouldSendCallbacks
      ? ""
      : " Set APP_BASE_URL to a public HTTPS URL if you want success/cancel redirects and webhook updates during local development.";

    return Response.json(
      {
        error: `${baseMessage}${callbackHint}`,
      },
      { status: 502 },
    );
  }

  try {
    const createdProduct = await prisma.product.create({
      data: {
        userId: null,
        title,
        slug,
        tagline,
        format,
        targetAudience,
        description,
        benefits,
        includes,
        ideaInput,
        priceNgn,
        priceUsdc,
        checkoutUrl: session.checkoutUrl,
        locusSessionId: session.id,
        status: "published",
        orders: {
          create: {
            locusSessionId: session.id,
            locusWebhookSecret: session.webhookSecret ?? null,
            buyerWalletAddress: null,
            amountUsdc: priceUsdc,
            paymentTxHash: null,
            status: "pending",
          },
        },
      },
      select: {
        id: true,
      },
    });

    const response: PublishResponse = {
      productId: createdProduct.id,
      slug,
      publicUrl,
      checkoutUrl: session.checkoutUrl,
    };

    return Response.json(response);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? `failed to persist published product: ${error.message}` : "failed to persist published product",
      },
      { status: 500 },
    );
  }
}
