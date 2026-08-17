import { client } from "@/lib/api-client";

export type CurrencyRate = {
  id: string;
  currencyCode: string;
  rate: number;
  provider: string;
  lastUpdated: string;
};

export type CurrenciesResponse = {
  source: string;
  rates: CurrencyRate[];
};

export async function getCurrencies(): Promise<CurrenciesResponse> {
  const response = await client.currency.$get();

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to fetch currency rates");
  }

  return response.json();
}
