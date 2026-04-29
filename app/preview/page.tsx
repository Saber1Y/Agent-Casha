"use client";

import Link from "next/link";
import { useState } from "react";

import ProductPreview from "@/components/ProductPreview";
import { FALLBACK_IDEA, buildMockProductFields } from "@/lib/mock-data";
import type { ProductFields } from "@/lib/types";

const fallbackProduct = buildMockProductFields(FALLBACK_IDEA);

const isProductFields = (value: unknown): value is ProductFields => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Partial<ProductFields>;
  return (
    typeof record.title === "string" &&
    typeof record.tagline === "string" &&
    typeof record.format === "string" &&
    typeof record.targetAudience === "string" &&
    typeof record.description === "string" &&
    typeof record.ideaInput === "string" &&
    typeof record.priceNgn === "number" &&
    typeof record.priceUsdc === "number" &&
    Array.isArray(record.benefits) &&
    Array.isArray(record.includes)
  );
};

export default function PreviewPage() {
  const [product] = useState<ProductFields>(() => {
    if (typeof window === "undefined") {
      return fallbackProduct;
    }

    const raw = window.localStorage.getItem("auto-seller-preview");
    if (!raw) {
      return fallbackProduct;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      return isProductFields(parsed) ? parsed : fallbackProduct;
    } catch {
      return fallbackProduct;
    }
  });
  const publishFallbackUrl = `/success?slug=preview-product&publicUrl=${encodeURIComponent("/p/preview-product")}&checkoutUrl=${encodeURIComponent("https://checkout.paywithlocus.com/mock-preview-product")}`;

  return (
    <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <p className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Step 3 of 3
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Sales Page Preview
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700 sm:text-base">
            This is how your public product page will appear to buyers.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/builder"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
            >
              Back to Builder
            </Link>
          </div>
        </section>

        <ProductPreview buyHref="#buy-cta" mode="preview" product={product} publishHref={publishFallbackUrl} />
      </div>
    </main>
  );
}
