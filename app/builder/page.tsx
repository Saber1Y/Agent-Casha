import ProductBuilder from "@/components/ProductBuilder";
import { buildMockProductFields } from "@/lib/mock-data";

type BuilderPageProps = {
  searchParams: Promise<{
    idea?: string;
    category?: string;
  }>;
};

export default async function BuilderPage({ searchParams }: BuilderPageProps) {
  const params = await searchParams;
  const idea = typeof params.idea === "string" ? params.idea : "";
  const category = typeof params.category === "string" ? params.category : undefined;
  const initialData = buildMockProductFields(idea, category);

  return (
    <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <p className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Step 2 of 3
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Refine Your Product Draft
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700 sm:text-base">
            Tweak messaging, price, benefits, and what is included before previewing your public
            sales page.
          </p>
        </section>

        <ProductBuilder initialCategory={category} initialData={initialData} />
      </div>
    </main>
  );
}
