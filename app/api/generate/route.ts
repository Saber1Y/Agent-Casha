import OpenAI from "openai";

import { convertNgnToUsdc } from "@/lib/currency";
import type { GenerateRequestBody } from "@/lib/types";

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.2";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PRODUCT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "tagline",
    "format",
    "targetAudience",
    "priceNgn",
    "priceUsdc",
    "description",
    "benefits",
    "includes",
  ],
  properties: {
    title: { type: "string", minLength: 6, maxLength: 120 },
    tagline: { type: "string", minLength: 6, maxLength: 140 },
    format: { type: "string", minLength: 3, maxLength: 60 },
    targetAudience: { type: "string", minLength: 4, maxLength: 120 },
    priceNgn: { type: "number", minimum: 1000, maximum: 5000000 },
    priceUsdc: { type: "number", minimum: 1, maximum: 5000 },
    description: { type: "string", minLength: 20, maxLength: 1200 },
    benefits: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: { type: "string", minLength: 6, maxLength: 180 },
    },
    includes: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: { type: "string", minLength: 4, maxLength: 180 },
    },
  },
} as const;

type GeneratedPayload = {
  title: string;
  tagline: string;
  format: string;
  targetAudience: string;
  priceNgn: number;
  priceUsdc: number;
  description: string;
  benefits: string[];
  includes: string[];
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isGeneratedPayload = (value: unknown): value is GeneratedPayload => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Partial<GeneratedPayload>;

  return (
    typeof record.title === "string" &&
    typeof record.tagline === "string" &&
    typeof record.format === "string" &&
    typeof record.targetAudience === "string" &&
    typeof record.description === "string" &&
    typeof record.priceNgn === "number" &&
    typeof record.priceUsdc === "number" &&
    isStringArray(record.benefits) &&
    isStringArray(record.includes)
  );
};

const normalizeList = (items: string[]) => {
  const cleaned = items.map((item) => item.trim()).filter(Boolean);
  return Array.from(new Set(cleaned)).slice(0, 8);
};

const normalizePriceNgn = (priceNgn: number) => {
  if (!Number.isFinite(priceNgn) || priceNgn <= 0) {
    return 5000;
  }

  return Math.max(1000, Math.round(priceNgn / 500) * 500);
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<GenerateRequestBody>;
    const idea = typeof body.idea === "string" ? body.idea.trim() : "";

    if (!idea) {
      return Response.json({ error: "idea is required" }, { status: 400 });
    }

    const category = typeof body.category === "string" ? body.category.trim() : undefined;

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "OPENAI_API_KEY is not configured" }, { status: 500 });
    }

    const input = [
      "Generate a sellable digital product offer from this seller input.",
      `Idea: ${idea}`,
      category ? `Category: ${category}` : "Category: not provided",
      "",
      "Requirements:",
      "- Seller thinks in NGN.",
      "- Return concise, marketable copy.",
      "- Choose a realistic simple price in NGN for a digital product in Nigeria.",
      "- Keep benefits and includes practical and believable.",
      "- Ensure output is only valid JSON matching the schema.",
    ].join("\n");

    const response = await openai.responses.create({
      model: DEFAULT_MODEL,
      instructions:
        "You are a digital product strategist and direct-response copywriter. Turn rough notes into practical, believable digital offers.",
      input,
      temperature: 0.7,
      max_output_tokens: 500,
      text: {
        format: {
          type: "json_schema",
          name: "auto_seller_generated_product",
          strict: true,
          schema: PRODUCT_SCHEMA,
        },
      },
    });

    if (!response.output_text) {
      return Response.json({ error: "model returned empty output" }, { status: 502 });
    }

    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(response.output_text);
    } catch {
      return Response.json({ error: "model returned invalid JSON" }, { status: 502 });
    }

    if (!isGeneratedPayload(parsedPayload)) {
      return Response.json({ error: "model JSON did not match expected shape" }, { status: 502 });
    }

    const normalizedPriceNgn = normalizePriceNgn(parsedPayload.priceNgn);
    const normalizedBenefits = normalizeList(parsedPayload.benefits).slice(0, 6);
    const normalizedIncludes = normalizeList(parsedPayload.includes).slice(0, 8);

    const generatedProduct = {
      title: parsedPayload.title.trim(),
      tagline: parsedPayload.tagline.trim(),
      format: parsedPayload.format.trim(),
      targetAudience: parsedPayload.targetAudience.trim(),
      priceNgn: normalizedPriceNgn,
      priceUsdc: convertNgnToUsdc(normalizedPriceNgn),
      description: parsedPayload.description.trim(),
      benefits:
        normalizedBenefits.length > 0
          ? normalizedBenefits
          : ["Practical guidance for immediate implementation"],
      includes:
        normalizedIncludes.length > 0
          ? normalizedIncludes
          : ["Core digital product file"],
    };

    return Response.json(generatedProduct);
  } catch {
    return Response.json({ error: "invalid JSON payload" }, { status: 400 });
  }
}
