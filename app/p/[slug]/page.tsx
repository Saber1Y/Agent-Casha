import ProductPreview from "@/components/ProductPreview";
import { buildPublicFallbackFromSlug } from "@/lib/mock-data";
import { getProductBySlug } from "@/lib/mock-store";
import type { ProductFields } from "@/lib/types";

type PublicProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type PublicViewProduct = ProductFields & { slug: string };

export default async function PublicProductPage({ params }: PublicProductPageProps) {
  const { slug } = await params;
  const storedProduct = getProductBySlug(slug);

  const product: PublicViewProduct = storedProduct
    ? {
        ...storedProduct,
        slug: storedProduct.slug,
      }
    : buildPublicFallbackFromSlug(slug);

  const checkoutUrl =
    storedProduct?.checkoutUrl ?? `https://checkout.locus.so/session/mock-${slug}`;

  return (
    <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <ProductPreview buyHref={checkoutUrl} mode="public" product={product} />
    </main>
  );
}
