import ProductPreview from "@/components/ProductPreview";
import { buildPublicFallbackFromSlug } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import type { ProductFields } from "@/lib/types";

type PublicProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type PublicViewProduct = ProductFields & { slug: string };

const parseStringArray = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
};

export default async function PublicProductPage({ params }: PublicProductPageProps) {
  const { slug } = await params;

  const storedProduct = await prisma.product.findUnique({
    where: { slug },
    select: {
      slug: true,
      title: true,
      tagline: true,
      format: true,
      targetAudience: true,
      description: true,
      benefits: true,
      includes: true,
      ideaInput: true,
      priceNgn: true,
      priceUsdc: true,
      checkoutUrl: true,
    },
  });

  const product: PublicViewProduct = storedProduct
    ? {
        slug: storedProduct.slug,
        title: storedProduct.title,
        tagline: storedProduct.tagline,
        format: storedProduct.format,
        targetAudience: storedProduct.targetAudience,
        description: storedProduct.description,
        benefits: parseStringArray(storedProduct.benefits),
        includes: parseStringArray(storedProduct.includes),
        ideaInput: storedProduct.ideaInput,
        priceNgn: storedProduct.priceNgn,
        priceUsdc: Number(storedProduct.priceUsdc),
      }
    : buildPublicFallbackFromSlug(slug);

  const checkoutUrl =
    storedProduct?.checkoutUrl ?? `https://checkout.paywithlocus.com/mock-${slug}`;

  return (
    <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <ProductPreview buyHref={checkoutUrl} mode="public" product={product} />
    </main>
  );
}
