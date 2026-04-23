export const createId = (length = 6) => {
  return Math.random().toString(36).slice(2, 2 + length);
};

export const slugify = (value: string) => {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return normalized || "digital-product";
};

export const createUniqueSlug = (
  title: string,
  slugExists: (slug: string) => boolean,
) => {
  const base = slugify(title);
  if (!slugExists(base)) {
    return base;
  }

  let candidate = `${base}-${createId(4)}`;
  while (slugExists(candidate)) {
    candidate = `${base}-${createId(4)}`;
  }

  return candidate;
};
