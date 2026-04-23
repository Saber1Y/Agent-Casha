import Link from "next/link";
import PriceDisplay from "@/components/PriceDisplay";
import type { ProductFields } from "@/lib/types";

type ProductPreviewProps = {
  product: ProductFields & { slug?: string };
  mode?: "preview" | "public";
  buyHref?: string;
  publishHref?: string;
};

export default function ProductPreview({
  product,
  mode = "preview",
  buyHref = "#",
  publishHref = "/builder",
}: ProductPreviewProps) {
  const openBuyInNewTab = buyHref.startsWith("http");
  const showPublishAction = mode === "preview";

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
        <div className="bg-gradient-to-br from-accent-soft via-white to-[#fff8eb] px-6 py-10 sm:px-10">
          <p className="inline-flex rounded-full border border-accent/20 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-accent-strong">
            Digital Product
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {product.title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-700">{product.tagline}</p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700">
            {product.description}
          </p>

          <div className="mt-8 max-w-sm">
            <PriceDisplay priceNgn={product.priceNgn} priceUsdc={product.priceUsdc} emphasize />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={buyHref}
              className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
              rel={openBuyInNewTab ? "noreferrer" : undefined}
              target={openBuyInNewTab ? "_blank" : undefined}
            >
              Buy Now
            </a>
            {showPublishAction ? (
              <Link
                href={publishHref}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
              >
                Publish Product
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Benefits</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            {product.benefits.map((benefit, index) => (
              <li key={`${benefit}-${index}`} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">What Is Included</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            {product.includes.map((item, index) => (
              <li key={`${item}-${index}`} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="grid gap-4 rounded-2xl border border-line bg-surface p-6 text-sm text-slate-700 shadow-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Format</p>
          <p className="mt-2 text-base font-medium text-slate-900">{product.format}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Target Audience
          </p>
          <p className="mt-2 text-base font-medium text-slate-900">{product.targetAudience}</p>
        </div>
      </div>
    </section>
  );
}
