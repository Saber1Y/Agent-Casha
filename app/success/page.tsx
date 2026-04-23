import PublishSuccessCard from "@/components/PublishSuccessCard";

type SuccessPageProps = {
  searchParams: Promise<{
    productId?: string;
    slug?: string;
    publicUrl?: string;
    checkoutUrl?: string;
  }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;

  const slug = typeof params.slug === "string" && params.slug ? params.slug : "your-product";
  const publicUrl =
    typeof params.publicUrl === "string" && params.publicUrl
      ? params.publicUrl
      : `/p/${slug}`;
  const checkoutUrl =
    typeof params.checkoutUrl === "string" && params.checkoutUrl
      ? params.checkoutUrl
      : `https://checkout.locus.so/session/mock-${slug}`;
  const productId = typeof params.productId === "string" ? params.productId : undefined;

  return (
    <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <PublishSuccessCard
        checkoutUrl={checkoutUrl}
        productId={productId}
        publicUrl={publicUrl}
        slug={slug}
      />
    </main>
  );
}
