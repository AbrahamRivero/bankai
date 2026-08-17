"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type RatesMap, toRatesMap } from "@/lib/currency";
import { getCurrencies } from "@/lib/fetchers/currency";

export type DisplayCurrency = "USD" | "EUR" | "CUP";

type CurrencyState = {
  currency: DisplayCurrency;
  rates: RatesMap;
  ratesDate: string | null;
  loading: boolean;
  error: string | null;
  setCurrency: (currency: DisplayCurrency) => void;
  fetchRates: () => Promise<void>;
};

function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: "USD",
      rates: {},
      ratesDate: null,
      loading: false,
      error: null,
      setCurrency: (currency) => set({ currency }),
      fetchRates: async () => {
        if (get().loading) return;
        if (get().ratesDate === todayKey()) return;

        set({ loading: true, error: null });
        try {
          const data = await getCurrencies();
          set({
            rates: toRatesMap(data.rates ?? []),
            ratesDate: todayKey(),
            loading: false,
          });
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch currency rates",
          });
        }
      },
    }),
    {
      name: "bankai-currency",
      partialize: (state) => ({
        currency: state.currency,
        rates: state.rates,
        ratesDate: state.ratesDate,
      }),
    },
  ),
);
