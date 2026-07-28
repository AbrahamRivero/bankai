"use client";

import { AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import CatalogToolbar from "@/components/catalog/catalog-toolbar";
import ProductGrid from "@/components/catalog/product-grid";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import useGetProducts from "@/hooks/queries/store/use-get-products";
import { useCatalogFilters } from "@/hooks/use-catalog-filters";

const DEFAULT_WORKSPACE_ID = process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID;

export default function ProductsPage() {
  const { t } = useTranslation("store");
  const workspaceId = DEFAULT_WORKSPACE_ID ?? "";

  const {
    filters,
    updateFilter,
    toggleSize,
    clearFilters,
    hasActiveFilters,
    queryParams,
    handlePageChange,
    pageSize,
  } = useCatalogFilters(workspaceId);

  const { data, isLoading, isError, error } = useGetProducts(queryParams);
  const currentPage = data ? Math.floor((data.offset || 0) / pageSize) + 1 : 1;
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  if (!DEFAULT_WORKSPACE_ID) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("configErrorTitle")}</AlertTitle>
          <AlertDescription>{t("configError")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("errorTitle")}</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : t("errorDescription")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col">
      <nav className="flex items-center gap-2 border-b border-border/40 px-6 py-3 text-sm">
        <Link
          href="/"
          className="font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("home")}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">{t("products")}</span>
      </nav>

      <main className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-center font-bold text-3xl text-foreground min-[400px]:text-4xl lg:text-left">
            {t("title")}
          </h1>

          <div className="flex flex-col gap-8 lg:flex-row">
            <CatalogToolbar
              filters={filters}
              onUpdateFilter={updateFilter}
              onToggleSize={toggleSize}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />

            <div className="min-w-0 flex-1 space-y-6">
              <div className="flex flex-wrap items-center gap-1.5">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex h-6 items-center gap-1 rounded-md border border-border bg-background px-2 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                    {t("clearAll")}
                  </button>
                )}
                {filters.searchterm && (
                  <span className="inline-flex h-6 items-center gap-1 rounded-md border border-border bg-background px-2 text-[11px] text-muted-foreground">
                    &ldquo;{filters.searchterm}&rdquo;
                    <button
                      type="button"
                      onClick={() => updateFilter("searchterm", "")}
                      className="ml-0.5 hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.gender && (
                  <span className="inline-flex h-6 items-center gap-1 rounded-md border border-border bg-background px-2 text-[11px] text-muted-foreground">
                    {filters.gender}
                    <button
                      type="button"
                      onClick={() => updateFilter("gender", null)}
                      className="ml-0.5 hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.sizes.length > 0 && (
                  <span className="inline-flex h-6 items-center gap-1 rounded-md border border-border bg-background px-2 text-[11px] text-muted-foreground">
                    {filters.sizes.join(", ")}
                    <button
                      type="button"
                      onClick={() => {
                        for (const s of filters.sizes) {
                          toggleSize(s);
                        }
                      }}
                      className="ml-0.5 hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.minPrice && (
                  <span className="inline-flex h-6 items-center gap-1 rounded-md border border-border bg-background px-2 text-[11px] text-muted-foreground">
                    {t("filterChipMin")} ${filters.minPrice}
                    <button
                      type="button"
                      onClick={() => updateFilter("minPrice", "")}
                      className="ml-0.5 hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.maxPrice && (
                  <span className="inline-flex h-6 items-center gap-1 rounded-md border border-border bg-background px-2 text-[11px] text-muted-foreground">
                    {t("filterChipMax")} ${filters.maxPrice}
                    <button
                      type="button"
                      onClick={() => updateFilter("maxPrice", "")}
                      className="ml-0.5 hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.availability && (
                  <span className="inline-flex h-6 items-center gap-1 rounded-md border border-border bg-background px-2 text-[11px] text-muted-foreground">
                    {filters.availability === "available"
                      ? t("filterInStock")
                      : t("filterOutOfStock")}
                    <button
                      type="button"
                      onClick={() => updateFilter("availability", null)}
                      className="ml-0.5 hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>

              <ProductGrid
                products={data?.products ?? []}
                isLoading={isLoading}
              />

              {totalPages > 1 && (
                <Pagination className="pt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={page === currentPage}
                            onClick={() => handlePageChange(page)}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
