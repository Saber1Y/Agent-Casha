import { redirect } from "next/navigation";

import PublishSuccessCard from "@/components/PublishSuccessCard";
import SuccessDisplay from "@/components/SuccessDisplay";

type SuccessPageProps = {
  searchParams: Promise<{
    productId?: string;
    slug?: string;
    publicUrl?: string;
    checkoutUrl?: string;
    payment?: string;
    title?: string;
    format?: string;
    includes?: string;
    downloadLink?: string;
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
      : `https://checkout.paywithlocus.com/mock-${slug}`;
  const productId = typeof params.productId === "string" ? params.productId : undefined;
  const payment = typeof params.payment === "string" ? params.payment : undefined;
  const title = typeof params.title === "string" ? params.title : undefined;
  const format = typeof params.format === "string" ? params.format : undefined;
  const downloadLink = typeof params.downloadLink === "string" ? params.downloadLink : undefined;
  
  // Parse includes from URL (JSON string)
  let includesList: string[] = ["Digital product files"];
  if (params.includes) {
    try {
      includesList = JSON.parse(params.includes);
    } catch {
      // Use default if parse fails
    }
  }

  // If payment=success, this is a BUYER who just paid
  if (payment === "success") {
    return (
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <SuccessDisplay
          slug={slug}
          productData={{
            title: title || "Your Product",
            format: format || "Digital Product",
            includes: includesList,
            description: "Thank you for your purchase!",
          }}
        />
      </main>
    );
  }

  // Otherwise, this is a CREATOR who just published
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