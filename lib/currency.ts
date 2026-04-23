const NGN_PER_USDC = 1550;

const roundTo = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

export const formatNgn = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

export const formatUsdc = (value: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export const convertNgnToUsdc = (priceNgn: number) => {
  if (!Number.isFinite(priceNgn) || priceNgn <= 0) {
    return 0;
  }

  return roundTo(priceNgn / NGN_PER_USDC, 2);
};

export const convertUsdcToNgn = (priceUsdc: number) => {
  if (!Number.isFinite(priceUsdc) || priceUsdc <= 0) {
    return 0;
  }

  return Math.round(priceUsdc * NGN_PER_USDC);
};
