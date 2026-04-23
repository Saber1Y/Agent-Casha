import type { OrderRecord, OrderStatus, ProductRecord } from "@/lib/types";

const productBySlug = new Map<string, ProductRecord>();
const orderBySessionId = new Map<string, OrderRecord>();

export const saveProduct = (product: ProductRecord) => {
  productBySlug.set(product.slug, product);
  return product;
};

export const getProductBySlug = (slug: string) => {
  return productBySlug.get(slug) ?? null;
};

export const slugExists = (slug: string) => productBySlug.has(slug);

export const saveOrder = (order: OrderRecord) => {
  orderBySessionId.set(order.locusSessionId, order);
  return order;
};

export const getOrderBySessionId = (sessionId: string) => {
  return orderBySessionId.get(sessionId) ?? null;
};

type WebhookOrderUpdate = {
  sessionId: string;
  status: OrderStatus;
  buyerWalletAddress?: string | null;
  paymentTxHash?: string | null;
};

export const updateOrderFromWebhook = ({
  sessionId,
  status,
  buyerWalletAddress,
  paymentTxHash,
}: WebhookOrderUpdate) => {
  const existingOrder = orderBySessionId.get(sessionId);
  if (!existingOrder) {
    return null;
  }

  const updatedOrder: OrderRecord = {
    ...existingOrder,
    status,
    buyerWalletAddress: buyerWalletAddress ?? existingOrder.buyerWalletAddress,
    paymentTxHash: paymentTxHash ?? existingOrder.paymentTxHash,
    paidAt: status === "paid" ? new Date().toISOString() : existingOrder.paidAt,
  };

  orderBySessionId.set(sessionId, updatedOrder);
  return updatedOrder;
};
