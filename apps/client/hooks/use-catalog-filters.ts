import { useCallback, useEffect, useMemo, useState } from "react";
import type { GetProductsParams } from "@/lib/fetchers/products";

export type CatalogFilters = {
  searchterm: string;
  gender: string | null;
  sizes: string[];
  minPrice: string;
  maxPrice: string;
  sortBy: string | null;
  availability: string | null;
};

const DEFAULT_FILTERS: CatalogFilters = {
  searchterm: "",
  gender: null,
  sizes: [],
  minPrice: "",
  maxPrice: "",
  sortBy: null,
  availability: null,
};

const PAGE_SIZE = 12;

export function useCatalogFilters(workspaceId: string) {
  const storageKey = "bankai:catalog-filters";

  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFilters((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(filters));
  }, [filters]);

  const updateFilter = useCallback(
    <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setOffset(0);
    },
    [],
  );

  const toggleSize = useCallback((size: string) => {
    setFilters((prev) => {
      const sizes = prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes };
    });
    setOffset(0);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setOffset(0);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchterm !== "" ||
      filters.gender !== null ||
      filters.sizes.length > 0 ||
      filters.minPrice !== "" ||
      filters.maxPrice !== "" ||
      filters.sortBy !== null ||
      filters.availability !== null
    );
  }, [filters]);

  const queryParams: GetProductsParams = useMemo(() => {
    return {
      workspaceId,
      limit: PAGE_SIZE,
      offset,
      ...(filters.searchterm && { searchterm: filters.searchterm }),
      ...(filters.gender && { gender: filters.gender }),
      ...(filters.sizes.length > 0 && { sizes: filters.sizes.join(",") }),
      ...(filters.minPrice && { minPrice: Number(filters.minPrice) }),
      ...(filters.maxPrice && { maxPrice: Number(filters.maxPrice) }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.availability && { availability: filters.availability }),
    };
  }, [workspaceId, filters, offset]);

  const handlePageChange = useCallback((page: number) => {
    setOffset((page - 1) * PAGE_SIZE);
  }, []);

  return {
    filters,
    updateFilter,
    toggleSize,
    clearFilters,
    hasActiveFilters,
    queryParams,
    offset,
    setOffset,
    handlePageChange,
    pageSize: PAGE_SIZE,
  };
}
