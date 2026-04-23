import { convertNgnToUsdc } from "@/lib/currency";
import type { GenerateResponse, ProductFields } from "@/lib/types";

export const FALLBACK_IDEA =
  "A practical digital guide that helps people get a fast, clear result in a specific area.";

const FORMATS_BY_CATEGORY: Record<string, string> = {
  ebook: "ebook",
  guide: "PDF guide",
  templates: "template pack",
  toolkit: "toolkit",
  resources: "mini resources",
};

const KEYWORD_FORMATS: Array<{ pattern: RegExp; format: string }> = [
  { pattern: /(template|notion|sheet|checklist)/i, format: "template pack" },
  { pattern: /(ebook|book|chapter)/i, format: "ebook" },
  { pattern: /(toolkit|bundle|kit)/i, format: "toolkit" },
  { pattern: /(prompt|ai|chatgpt)/i, format: "mini resources" },
];

const BASE_PRICE_BY_FORMAT: Record<string, number> = {
  ebook: 8500,
  "PDF guide": 6500,
  "template pack": 12000,
  toolkit: 15000,
  "mini resources": 5000,
};

const TAGLINES = [
  "Practical steps you can apply in a single sitting.",
  "Turn confusion into a repeatable system.",
  "A no-fluff resource built for immediate action.",
  "A compact digital product designed to get fast wins.",
];

const AUDIENCES = [
  "Busy freelancers and creators in Nigeria",
  "New digital sellers who need a fast launch path",
  "Professionals who want simple, practical frameworks",
  "Founders and side-hustlers validating a new offer",
];

const BENEFIT_POOL = [
  "Reduces trial-and-error with a proven action sequence",
  "Helps the buyer get a visible result within the first week",
  "Turns scattered ideas into a clear execution roadmap",
  "Includes practical examples that speed up implementation",
  "Designed for solo builders with limited time",
];

const INCLUDE_POOL = [
  "Step-by-step core guide (PDF)",
  "Implementation checklist",
  "Quick-start action plan",
  "Ready-to-use template assets",
  "Simple pricing and positioning worksheet",
];

const toTitleCase = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const hashString = (value: string) =>
  value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

const pickBySeed = <T>(items: T[], seed: number) =>
  items[Math.abs(seed) % items.length];

const normalizeIdea = (idea: string) => {
  const trimmed = idea.trim();
  return trimmed.length > 0 ? trimmed : FALLBACK_IDEA;
};

const pickFormat = (idea: string, category?: string) => {
  if (category) {
    const normalized = category.toLowerCase().trim();
    if (FORMATS_BY_CATEGORY[normalized]) {
      return FORMATS_BY_CATEGORY[normalized];
    }
  }

  const keywordFormat = KEYWORD_FORMATS.find(({ pattern }) => pattern.test(idea));
  if (keywordFormat) {
    return keywordFormat.format;
  }

  return "PDF guide";
};

const buildTitle = (idea: string) => {
  const firstSentence = idea.split(/[.!?\n]/)[0] || idea;
  const cleaned = firstSentence.replace(/[^a-zA-Z0-9\s]/g, " ").trim();
  const words = cleaned.split(/\s+/).filter(Boolean).slice(0, 6);
  const core = words.length > 0 ? toTitleCase(words.join(" ")) : "Digital Product Playbook";

  if (core.toLowerCase().includes("guide")) {
    return core;
  }

  return `${core} Guide`;
};

const buildDescription = (title: string, format: string, audience: string) => {
  return `${title} is a concise ${format} for ${audience}. It focuses on practical steps, clear examples, and a repeatable workflow buyers can apply immediately.`;
};

const buildList = (pool: string[], seed: number) => {
  const first = pickBySeed(pool, seed);
  const second = pickBySeed(pool, seed + 3);
  const third = pickBySeed(pool, seed + 7);
  return Array.from(new Set([first, second, third]));
};

export const buildMockGeneratedProduct = (
  ideaInput: string,
  category?: string,
): GenerateResponse => {
  const idea = normalizeIdea(ideaInput);
  const seed = hashString(`${idea}:${category ?? ""}`);

  const format = pickFormat(idea, category);
  const title = buildTitle(idea);
  const targetAudience = pickBySeed(AUDIENCES, seed);
  const tagline = pickBySeed(TAGLINES, seed + 1);
  const description = buildDescription(title, format, targetAudience);

  const basePrice = BASE_PRICE_BY_FORMAT[format] ?? 7000;
  const complexityMultiplier = 1 + Math.min(0.8, idea.length / 420);
  const priceNgn = Math.max(
    2500,
    Math.round((basePrice * complexityMultiplier) / 500) * 500,
  );
  const priceUsdc = convertNgnToUsdc(priceNgn);

  return {
    title,
    tagline,
    format,
    targetAudience,
    priceNgn,
    priceUsdc,
    description,
    benefits: buildList(BENEFIT_POOL, seed + 9),
    includes: buildList(INCLUDE_POOL, seed + 15),
  };
};

export const buildMockProductFields = (
  ideaInput: string,
  category?: string,
): ProductFields => {
  const idea = normalizeIdea(ideaInput);
  const generated = buildMockGeneratedProduct(idea, category);
  return {
    ...generated,
    ideaInput: idea,
  };
};

export const humanizeSlug = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((chunk) => chunk[0]?.toUpperCase() + chunk.slice(1))
    .join(" ");

export const buildPublicFallbackFromSlug = (slug: string) => {
  const idea = `${humanizeSlug(slug)} digital product`;
  return {
    ...buildMockProductFields(idea),
    slug,
  };
};
