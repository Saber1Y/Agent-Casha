"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PriceDisplay from "@/components/PriceDisplay";
import { convertNgnToUsdc } from "@/lib/currency";
import type {
  GenerateResponse,
  ProductFields,
  PublishRequestBody,
  PublishResponse,
} from "@/lib/types";

type ProductBuilderProps = {
  initialIdea: string;
  initialCategory?: string;
};

type ListField = "benefits" | "includes";

const parseMoney = (value: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.round(parsed);
};

const createEmptyProductFields = (ideaInput: string): ProductFields => ({
  title: "",
  tagline: "",
  format: "",
  targetAudience: "",
  description: "",
  benefits: [""],
  includes: [""],
  ideaInput,
  priceNgn: 0,
  priceUsdc: 0,
});

const requestGeneratedDraft = async (idea: string, category?: string) => {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idea,
      category,
    }),
  });

  const payload = (await response.json()) as GenerateResponse | { error?: string };
  if (!response.ok) {
    const errorPayload = payload as { error?: string };
    throw new Error(errorPayload.error ?? "Could not generate product copy.");
  }

  return payload as GenerateResponse;
};

export default function ProductBuilder({ initialIdea, initialCategory }: ProductBuilderProps) {
  const router = useRouter();
  const normalizedInitialIdea = initialIdea.trim();
  const [form, setForm] = useState<ProductFields>(() =>
    createEmptyProductFields(normalizedInitialIdea),
  );
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(Boolean(normalizedInitialIdea));
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    normalizedInitialIdea ? null : "No product idea found. Go back and add your product idea.",
  );

  useEffect(() => {
    if (!normalizedInitialIdea) {
      return;
    }

    let cancelled = false;

    const generateInitialDraft = async () => {
      try {
        const generated = await requestGeneratedDraft(normalizedInitialIdea, initialCategory);
        if (cancelled) {
          return;
        }

        setForm((current) => ({
          ...current,
          ...generated,
          ideaInput: normalizedInitialIdea,
        }));
        setErrorMessage(null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Could not generate the initial product draft.",
        );
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    };

    void generateInitialDraft();

    return () => {
      cancelled = true;
    };
  }, [initialCategory, normalizedInitialIdea]);

  const setField = <K extends keyof ProductFields>(field: K, value: ProductFields[K]) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const setListItem = (field: ListField, index: number, value: string) => {
    setForm((current) => {
      const nextItems = [...current[field]];
      nextItems[index] = value;
      return { ...current, [field]: nextItems };
    });
  };

  const addListItem = (field: ListField) => {
    setForm((current) => ({
      ...current,
      [field]: [...current[field], ""],
    }));
  };

  const removeListItem = (field: ListField, index: number) => {
    setForm((current) => {
      const nextItems = current[field].filter((_, itemIndex) => itemIndex !== index);
      return { ...current, [field]: nextItems.length > 0 ? nextItems : [""] };
    });
  };

  const handleRegenerate = async () => {
    setErrorMessage(null);
    setIsGenerating(true);

    try {
      const generated = await requestGeneratedDraft(form.ideaInput, initialCategory);
      setForm((current) => ({
        ...current,
        ...generated,
      }));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not regenerate product copy.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = () => {
    setErrorMessage(null);
    window.localStorage.setItem("auto-seller-preview", JSON.stringify(form));
    router.push("/preview");
  };

  const handlePublish = async () => {
    setErrorMessage(null);
    setIsPublishing(true);

    const payload: PublishRequestBody = {
      title: form.title.trim(),
      tagline: form.tagline.trim(),
      format: form.format.trim(),
      targetAudience: form.targetAudience.trim(),
      description: form.description.trim(),
      benefits: form.benefits.map((item) => item.trim()).filter(Boolean),
      includes: form.includes.map((item) => item.trim()).filter(Boolean),
      ideaInput: form.ideaInput.trim(),
      priceNgn: form.priceNgn,
    };

    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as PublishResponse | { error?: string };
      if (!response.ok) {
        const errorPayload = result as { error?: string };
        throw new Error(errorPayload.error ?? "Could not publish this product right now.");
      }

      const publishResult = result as PublishResponse;
      const params = new URLSearchParams({
        productId: publishResult.productId,
        slug: publishResult.slug,
        publicUrl: publishResult.publicUrl,
        checkoutUrl: publishResult.checkoutUrl,
      });

      router.push(`/success?${params.toString()}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not publish this product right now.",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Product Builder
          </h2>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Step 2 of 3
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-600">
          Edit your generated draft before preview and publishing.
        </p>

        {isBootstrapping ? (
          <p className="mt-5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">
            Generating your first product draft from the idea you submitted...
          </p>
        ) : null}

        <fieldset className="mt-6 space-y-5 disabled:opacity-70" disabled={isBootstrapping}>
          <LabeledInput
            id="title"
            label="Title"
            onChange={(value) => setField("title", value)}
            placeholder="Digital product title"
            value={form.title}
          />

          <LabeledInput
            id="tagline"
            label="Tagline"
            onChange={(value) => setField("tagline", value)}
            placeholder="One-line promise"
            value={form.tagline}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <LabeledInput
              id="format"
              label="Format"
              onChange={(value) => setField("format", value)}
              placeholder="PDF guide, template pack..."
              value={form.format}
            />
            <LabeledInput
              id="targetAudience"
              label="Target Audience"
              onChange={(value) => setField("targetAudience", value)}
              placeholder="Who this is for"
              value={form.targetAudience}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <LabeledInput
              id="priceNgn"
              label="Price (NGN)"
              onChange={(value) => {
                const nextPriceNgn = parseMoney(value);
                setForm((current) => ({
                  ...current,
                  priceNgn: nextPriceNgn,
                  priceUsdc: convertNgnToUsdc(nextPriceNgn),
                }));
              }}
              placeholder="0"
              type="number"
              value={String(form.priceNgn)}
            />
            <LabeledInput
              disabled
              id="priceUsdc"
              label="Approx. Price (USDC)"
              onChange={() => undefined}
              placeholder="0"
              type="number"
              value={String(form.priceUsdc)}
            />
          </div>

          <LabeledTextarea
            id="description"
            label="Description"
            onChange={(value) => setField("description", value)}
            placeholder="Core product description"
            rows={5}
            value={form.description}
          />

          <EditableList
            fieldKey="benefits"
            items={form.benefits}
            label="Benefits"
            onAdd={addListItem}
            onChange={setListItem}
            onRemove={removeListItem}
          />

          <EditableList
            fieldKey="includes"
            items={form.includes}
            label="What Is Included"
            onAdd={addListItem}
            onChange={setListItem}
            onRemove={removeListItem}
          />

          <div className="space-y-2">
            <LabeledInput
              id="downloadLink"
              label="Download Link (Optional)"
              onChange={(value) => setField("downloadLink", value)}
              placeholder="https://drive.google.com/... or https://dropbox.com/..."
              value={form.downloadLink || ""}
            />
            <p className="text-xs text-slate-500">
              Link to your product file (Google Drive, Dropbox, etc.). Leave empty for text delivery.
            </p>
          </div>
        </fieldset>
      </div>

      <aside className="space-y-4 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-semibold text-slate-900">Pricing Preview</h3>
        <PriceDisplay priceNgn={form.priceNgn} priceUsdc={form.priceUsdc} />

        <div className="rounded-2xl border border-line bg-surface-muted p-4 text-sm text-slate-700">
          <p className="font-medium text-slate-900">Idea Input</p>
          <p className="mt-2 leading-6">{form.ideaInput}</p>
        </div>

        {errorMessage ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </p>
        ) : null}

        <div className="space-y-3">
          <button
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isGenerating || isBootstrapping}
            onClick={handleRegenerate}
            type="button"
          >
            {isBootstrapping ? "Generating..." : isGenerating ? "Regenerating..." : "Regenerate"}
          </button>
          <button
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
            disabled={isBootstrapping}
            onClick={handlePreview}
            type="button"
          >
            Preview Sales Page
          </button>
          <button
            className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isPublishing || isBootstrapping}
            onClick={handlePublish}
            type="button"
          >
            {isPublishing ? "Publishing..." : "Publish Product"}
          </button>
        </div>
      </aside>
    </section>
  );
}

type LabeledInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  type?: "text" | "number";
  disabled?: boolean;
};

function LabeledInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: LabeledInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <input
        className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:cursor-not-allowed disabled:bg-slate-100"
        disabled={disabled}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        step={type === "number" ? "1" : undefined}
        type={type}
        value={value}
      />
    </div>
  );
}

type LabeledTextareaProps = {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  rows?: number;
};

function LabeledTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: LabeledTextareaProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <textarea
        className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent/15"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        value={value}
      />
    </div>
  );
}

type EditableListProps = {
  fieldKey: ListField;
  label: string;
  items: string[];
  onChange: (field: ListField, index: number, value: string) => void;
  onAdd: (field: ListField) => void;
  onRemove: (field: ListField, index: number) => void;
};

function EditableList({ fieldKey, label, items, onChange, onAdd, onRemove }: EditableListProps) {
  return (
    <fieldset className="space-y-3 rounded-2xl border border-line bg-surface-muted p-4">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </legend>
      {items.map((item, index) => (
        <div className="flex gap-2" key={`${fieldKey}-${index}`}>
          <input
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent/15"
            onChange={(event) => onChange(fieldKey, index, event.target.value)}
            placeholder={`${label} item ${index + 1}`}
            value={item}
          />
          <button
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
            onClick={() => onRemove(fieldKey, index)}
            type="button"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        className="inline-flex items-center justify-center rounded-lg border border-accent/30 bg-white px-3 py-2 text-xs font-semibold text-accent-strong transition hover:border-accent/60"
        onClick={() => onAdd(fieldKey)}
        type="button"
      >
        Add Item
      </button>
    </fieldset>
  );
}
