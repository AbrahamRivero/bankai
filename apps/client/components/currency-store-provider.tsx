"use client";

import { useEffect } from "react";
import { useCurrencyStore } from "@/lib/currency-store";

export function CurrencyStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const fetchRates = useCurrencyStore((state) => state.fetchRates);

  useEffect(() => {
    void fetchRates();
  }, [fetchRates]);

  return children;
}
