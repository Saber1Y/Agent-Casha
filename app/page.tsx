import { UserButton } from "@clerk/nextjs";

import ProductForm from "@/components/ProductForm";
import { AuthGreeting } from "./auth-greeting";

export default function CreateProductPage() {
  return (
    <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-3xl border border-line bg-surface p-8 shadow-sm sm:p-10">
          <div className="flex items-center justify-between">
            <p className="inline-flex rounded-full border border-accent/20 bg-accent-soft/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-strong">
              Auto Seller Agent
            </p>
            <UserButton />
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Turn rough ideas into ready-to-sell digital products
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700 sm:text-lg">
            Generate positioning, pricing, product copy, and a public product page with checkout in
            USDC. This MVP keeps the flow simple: Generate, Edit, and Publish.
          </p>

          <AuthGreeting />
        </section>
      </div>
    </main>
  );
}