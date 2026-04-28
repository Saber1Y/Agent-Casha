import type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
} from "@withlocus/checkout-react";

const DEFAULT_LOCUS_API_BASE_URL = "https://api.paywithlocus.com";
const DEFAULT_LOCUS_CHECKOUT_BASE_URL = "https://checkout.paywithlocus.com";
const DEFAULT_SESSION_TTL_MS = 30 * 60 * 1000;

type CreateSessionSuccessPayload = CreateCheckoutSessionResponse & {
  data: CreateCheckoutSessionResponse["data"] & {
    webhookSecret?: string;
  };
  webhookSecret?: string;
};

type CreateSessionErrorPayload = {
  error?: string;
  message?: string;
};

type CreateLocusSessionParams = {
  apiKey: string;
  amountUsdc: number;
  description: string;
  successUrl?: string;
  cancelUrl?: string;
  webhookUrl?: string;
  metadata?: Record<string, string>;
};

export type CreateLocusSessionResult = {
  id: string;
  checkoutUrl: string;
  expiresAt: string;
  webhookSecret?: string;
};

const normalizeBaseUrl = (value: string | undefined, fallback: string) => {
  if (!value || !value.trim()) {
    return fallback;
  }

  return value.trim().replace(/\/+$/, "");
};

const formatUsdcAmount = (amountUsdc: number) => amountUsdc.toFixed(2);

const isSuccessPayload = (payload: unknown): payload is CreateSessionSuccessPayload => {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const record = payload as Partial<CreateSessionSuccessPayload>;
  return (
    record.success === true &&
    typeof record.data === "object" &&
    record.data !== null &&
    typeof record.data.id === "string" &&
    typeof record.data.checkoutUrl === "string" &&
    typeof record.data.expiresAt === "string"
  );
};

export const buildLocusCheckoutUrl = (
  sessionId: string,
  checkoutBaseUrl = process.env.LOCUS_CHECKOUT_BASE_URL,
) => {
  const normalizedBase = normalizeBaseUrl(checkoutBaseUrl, DEFAULT_LOCUS_CHECKOUT_BASE_URL);
  return `${normalizedBase}/${sessionId}`;
};

export const createLocusCheckoutSession = async ({
  apiKey,
  amountUsdc,
  description,
  successUrl,
  cancelUrl,
  webhookUrl,
  metadata,
}: CreateLocusSessionParams): Promise<CreateLocusSessionResult> => {
  const apiBase = normalizeBaseUrl(process.env.LOCUS_API_BASE_URL, DEFAULT_LOCUS_API_BASE_URL);

  const requestBody: CreateCheckoutSessionRequest = {
    amount: formatUsdcAmount(amountUsdc),
    description,
    metadata,
    ...(webhookUrl ? { webhookUrl } : {}),
    ...(successUrl ? { successUrl } : {}),
    ...(cancelUrl ? { cancelUrl } : {}),
  };

  const response = await fetch(`${apiBase}/api/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
    cache: "no-store",
  });

  const rawResponseText = await response.text();
  let payload: CreateSessionSuccessPayload | CreateSessionErrorPayload | null = null;
  if (rawResponseText) {
    try {
      payload = JSON.parse(rawResponseText) as CreateSessionSuccessPayload | CreateSessionErrorPayload;
    } catch {
      payload = null;
    }
  }

  const parsedPayload = payload as
    | CreateSessionSuccessPayload
    | CreateSessionErrorPayload
    | null;

  if (!response.ok || !isSuccessPayload(parsedPayload)) {
    const errorPayload = parsedPayload as CreateSessionErrorPayload | null;
    const normalizedBody = rawResponseText.trim().replace(/\s+/g, " ");
    const compactBody = normalizedBody ? normalizedBody.slice(0, 200) : "";
    const message =
      (errorPayload && typeof errorPayload.error === "string" && errorPayload.error) ||
      (errorPayload && typeof errorPayload.message === "string" && errorPayload.message) ||
      (compactBody
        ? `Locus session creation failed (HTTP ${response.status}): ${compactBody}`
        : `Locus session creation failed (HTTP ${response.status})`);

    throw new Error(message);
  }

  const fallbackExpiration = new Date(Date.now() + DEFAULT_SESSION_TTL_MS).toISOString();
  return {
    id: parsedPayload.data.id,
    checkoutUrl: parsedPayload.data.checkoutUrl || buildLocusCheckoutUrl(parsedPayload.data.id),
    expiresAt: parsedPayload.data.expiresAt || fallbackExpiration,
    webhookSecret:
      parsedPayload.data.webhookSecret ||
      (typeof parsedPayload.webhookSecret === "string" ? parsedPayload.webhookSecret : undefined),
  };
};
