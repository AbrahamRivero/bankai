export type RatesMap = Record<string, number>;

export function toRatesMap(
  rates: Array<{ currencyCode: string; rate: number }>,
): RatesMap {
  const map: RatesMap = {};
  for (const rate of rates) {
    map[rate.currencyCode] = rate.rate;
  }
  return map;
}

export function convertPrice(
  usdPrice: number,
  rates: RatesMap,
  currency: string,
): number {
  if (currency === "USD") return usdPrice;
  const usdRate = rates["USD"];
  if (!usdRate || usdRate <= 0) return usdPrice;
  if (currency === "CUP") return usdPrice * usdRate;
  const rate = rates[currency];
  if (!rate || rate <= 0) return usdPrice;
  return (usdPrice * usdRate) / rate;
}

export function convertPriceFrom(
  amount: number,
  rates: RatesMap,
  currency: string,
): number {
  if (currency === "USD") return amount;
  const usdRate = rates["USD"];
  if (!usdRate || usdRate <= 0) return amount;
  if (currency === "CUP") return amount / usdRate;
  const rate = rates[currency];
  if (!rate || rate <= 0) return amount;
  return (amount * rate) / usdRate;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  CUP: "$",
};

export function formatPrice(amount: number, currency: string): string {
  const decimals = currency === "CUP" ? 0 : 2;
  const symbol = CURRENCY_SYMBOLS[currency] ?? "";
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
