export type ProductStatus = "draft" | "published";

export type OrderStatus = "pending" | "paid" | "expired" | "cancelled";

export type ProductFields = {
  title: string;
  tagline: string;
  format: string;
  targetAudience: string;
  description: string;
  benefits: string[];
  includes: string[];
  ideaInput: string;
  priceNgn: number;
  priceUsdc: number;
};

export type ProductRecord = ProductFields & {
  id: string;
  userId: string | null;
  slug: string;
  checkoutUrl: string;
  locusSessionId: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};

export type OrderRecord = {
  id: string;
  productId: string;
  locusSessionId: string;
  buyerWalletAddress: string | null;
  amountUsdc: number;
  paymentTxHash: string | null;
  status: OrderStatus;
  paidAt: string | null;
  createdAt: string;
};

export type GenerateRequestBody = {
  idea: string;
  category?: string;
};

export type GenerateResponse = {
  title: string;
  tagline: string;
  format: string;
  targetAudience: string;
  priceNgn: number;
  priceUsdc: number;
  description: string;
  benefits: string[];
  includes: string[];
};

export type PublishRequestBody = {
  title: string;
  tagline: string;
  format: string;
  targetAudience: string;
  description: string;
  benefits: string[];
  includes: string[];
  ideaInput: string;
  priceNgn: number;
};

export type PublishResponse = {
  productId: string;
  slug: string;
  publicUrl: string;
  checkoutUrl: string;
};

export type LocusWebhookType =
  | "checkout.session.paid"
  | "checkout.session.expired";

export type LocusWebhookEvent = {
  event: LocusWebhookType;
  timestamp: string;
  data: {
    sessionId: string;
    amount: string;
    currency: "USDC";
    paymentTxHash?: string;
    payerAddress?: string;
    paidAt?: string;
    metadata?: Record<string, string>;
  };
};
