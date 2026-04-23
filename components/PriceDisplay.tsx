import { formatNgn, formatUsdc } from "@/lib/currency";

type PriceDisplayProps = {
  priceNgn: number;
  priceUsdc: number;
  className?: string;
  emphasize?: boolean;
};

export default function PriceDisplay({
  priceNgn,
  priceUsdc,
  className = "",
  emphasize = false,
}: PriceDisplayProps) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface-muted px-4 py-3 ${className}`}
    >
      <p
        className={`text-2xl font-semibold tracking-tight text-foreground ${
          emphasize ? "sm:text-4xl" : "sm:text-3xl"
        }`}
      >
        {formatNgn(priceNgn)}
      </p>
      <p className="mt-1 text-sm text-slate-600">≈ {formatUsdc(priceUsdc)} USDC</p>
    </div>
  );
}
