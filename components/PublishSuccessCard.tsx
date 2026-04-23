import Link from "next/link";

type PublishSuccessCardProps = {
  slug: string;
  publicUrl: string;
  checkoutUrl: string;
  productId?: string;
};

export default function PublishSuccessCard({
  slug,
  publicUrl,
  checkoutUrl,
  productId,
}: PublishSuccessCardProps) {
  const checkoutIsExternal = checkoutUrl.startsWith("http");

  return (
    <section className="mx-auto w-full max-w-2xl rounded-3xl border border-line bg-surface p-8 shadow-sm sm:p-10">
      <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
        Published
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
        Product is live and ready to sell
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Share your public product page and receive payment through Locus checkout in USDC.
      </p>

      <dl className="mt-6 space-y-3 rounded-2xl border border-line bg-surface-muted p-4 text-sm">
        {productId ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate-500">Product ID</dt>
            <dd className="font-medium text-slate-900">{productId}</dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-500">Slug</dt>
          <dd className="font-medium text-slate-900">{slug}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-500">Public URL</dt>
          <dd className="font-medium text-slate-900">{publicUrl}</dd>
        </div>
      </dl>

      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          href={publicUrl}
          className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
        >
          View Public Page
        </Link>
        <a
          href={checkoutUrl}
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
          rel={checkoutIsExternal ? "noreferrer" : undefined}
          target={checkoutIsExternal ? "_blank" : undefined}
        >
          Open Checkout Link
        </a>
      </div>
    </section>
  );
}
