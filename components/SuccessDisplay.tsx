"use client";

type SuccessDisplayProps = {
  slug: string;
  productData?: {
    title: string;
    format: string;
    includes: string[];
    description: string;
  };
  isCreator?: boolean;
};

export default function SuccessDisplay({
  slug,
  productData,
  isCreator = false,
}: SuccessDisplayProps) {
  if (isCreator) {
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
          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate-500">Slug</dt>
            <dd className="font-medium text-slate-900">{slug}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate-500">Public URL</dt>
            <dd className="font-medium text-slate-900">/p/{slug}</dd>
          </div>
        </dl>

        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href={`/p/${slug}`}
            className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
          >
            View Public Page
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-2xl rounded-3xl border border-emerald-200 bg-emerald-50 p-8 shadow-sm sm:p-10">
      <p className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
        Payment Successful
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
        Thank you for your purchase!
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Your payment has been received. Here is your product:
      </p>

      {productData ? (
        <dl className="mt-6 space-y-4 rounded-2xl border border-emerald-200 bg-white p-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Product
            </dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">
              {productData.title}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Format
            </dt>
            <dd className="mt-1 text-slate-900">{productData.format}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              What's Included
            </dt>
            <dd className="mt-1 space-y-1">
              {productData.includes?.map((item, i) => (
                <li key={i} className="text-slate-700">
                  • {item}
                </li>
              ))}
            </dd>
          </div>
        </dl>
      ) : (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-white p-4">
          <p className="text-slate-600">
            Product: <strong>{slug}</strong>
          </p>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          <strong>Next steps:</strong> The creator will send your product to your email
          within 24 hours. Check your inbox (and spam folder)!
        </p>
      </div>

      <div className="mt-7">
        <a
          href="/"
          className="text-sm font-medium text-accent-strong hover:underline"
        >
          ← Create your own product
        </a>
      </div>
    </section>
  );
}