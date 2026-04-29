"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORY_OPTIONS = [
  "PDF guides",
  "Template packs",
  "Toolkits",
  "Mini resources",
  "Ebooks",
];

export default function ProductForm() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [category, setCategory] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedIdea = idea.trim();

    if (!trimmedIdea) {
      setErrorMessage("Add your product idea or notes so Auto Seller Agent can generate your offer.");
      return;
    }

    setErrorMessage(null);
    const params = new URLSearchParams({ idea: trimmedIdea });
    if (category) {
      params.set("category", category);
    }

    window.location.href = `/builder?${params.toString()}`;
  };

  return (
    <section className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Create Product</h2>
      <p className="mt-2 text-sm text-slate-600">
        Paste rough notes, voice-note transcript, or one-line concept. We will turn it into a
        sellable digital product draft.
      </p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label
            htmlFor="idea"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Product Idea or Content
          </label>
          <textarea
            id="idea"
            className="min-h-40 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent/15"
            onChange={(event) => setIdea(event.target.value)}
            placeholder="Example: I want to sell a beginner-friendly guide that teaches freelancers how to package and price their services in NGN and close clients faster."
            value={idea}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="category"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Product Category (Optional)
          </label>
          <select
            id="category"
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
            onChange={(event) => setCategory(event.target.value)}
            value={category}
          >
            <option value="">Select a category</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {errorMessage ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </p>
        ) : null}

        <button
          className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong sm:w-auto"
          type="submit"
        >
          Generate Product
        </button>
      </form>
    </section>
  );
}
