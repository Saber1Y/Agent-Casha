import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { UserButton } from "./user-button";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const products = await prisma.product.findMany({
    where: { clerkUserId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      priceNgn: true,
      createdAt: true,
    },
  });

  return (
    <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">My Products</h1>
            <p className="mt-1 text-slate-600">Manage your published digital products</p>
          </div>
          <UserButton />
        </section>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-line bg-surface p-8 text-center">
            <p className="text-slate-600">You haven't published any products yet.</p>
            <a
              href="/"
              className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Create your first product
            </a>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <a
                key={product.id}
                href={`/p/${product.slug}`}
                className="group block rounded-2xl border border-line bg-surface p-5 transition hover:border-slate-400"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 group-hover:text-slate-700">
                      {product.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">₦{product.priceNgn.toLocaleString()}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      product.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {product.status}
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Created {product.createdAt.toLocaleDateString()}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}