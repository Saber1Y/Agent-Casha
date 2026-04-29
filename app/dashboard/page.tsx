import { UserButton } from "./user-button";

export default async function DashboardPage() {
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

        <div className="rounded-3xl border border-line bg-surface p-8 text-center">
          <p className="text-slate-600">You haven't published any products yet.</p>
          <button
            // href="/"
            className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Create your first product
          </button>
        </div>
      </div>
    </main>
  );
}