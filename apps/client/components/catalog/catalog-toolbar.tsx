"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { CatalogFilters } from "@/hooks/use-catalog-filters";
import { cn } from "@/lib/utils";

type CatalogToolbarProps = {
  filters: CatalogFilters;
  onUpdateFilter: <K extends keyof CatalogFilters>(
    key: K,
    value: CatalogFilters[K],
  ) => void;
  onToggleSize: (size: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
};

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const GENDERS = [
  { value: "men", key: "modals.createProduct.genderMen" },
  { value: "women", key: "modals.createProduct.genderWomen" },
  { value: "kid", key: "modals.createProduct.genderKid" },
  { value: "unisex", key: "modals.createProduct.genderUnisex" },
];
const SORT_OPTIONS = [
  { value: "price_asc", key: "sortPriceAsc" },
  { value: "price_desc", key: "sortPriceDesc" },
  { value: "title_asc", key: "sortTitleAsc" },
  { value: "title_desc", key: "sortTitleDesc" },
  { value: "newest", key: "sortNewest" },
];

const AVAILABILITY_OPTIONS = [
  { value: "available", key: "filterInStock" },
  { value: "out_of_stock", key: "filterOutOfStock" },
];

function FilterSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h4>
      {children}
    </div>
  );
}

function FilterContent({
  filters,
  onUpdateFilter,
  onToggleSize,
  onClearFilters,
  hasActiveFilters,
  onClose,
}: CatalogToolbarProps & { onClose?: () => void }) {
  const { t } = useTranslation("store");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t("filters")}</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-7 text-xs"
            >
              <X className="mr-1 h-3 w-3" />
              {t("clearAll")}
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 lg:hidden"
              aria-label={t("closeFilters")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <FilterSection label={t("searchPlaceholder")}>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={filters.searchterm}
            onChange={(e) => onUpdateFilter("searchterm", e.target.value)}
            className="h-8 pl-7 text-xs"
          />
        </div>
      </FilterSection>

      <FilterSection label={t("sortBy")}>
        <Select
          value={filters.sortBy ?? ""}
          onValueChange={(value) => onUpdateFilter("sortBy", value || null)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={t("sortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t("sortDefault")}</SelectItem>
            {SORT_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {t(s.key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      <Separator />

      <FilterSection label={t("allGenders")}>
        <Select
          value={filters.gender ?? ""}
          onValueChange={(value) => onUpdateFilter("gender", value || null)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={t("allGenders")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t("allGenders")}</SelectItem>
            {GENDERS.map((g) => (
              <SelectItem key={g.value} value={g.value}>
                {t(g.key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection label={t("availableSizes")}>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((size) => (
            <button
              type="button"
              key={size}
              onClick={() => onToggleSize(size)}
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-colors",
                filters.sizes.includes(size)
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-foreground hover:bg-muted",
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      <Separator />

      <FilterSection label={t("priceRange")}>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            placeholder={t("min")}
            value={filters.minPrice}
            onChange={(e) => onUpdateFilter("minPrice", e.target.value)}
            className="h-8 text-xs"
          />
          <span className="text-xs text-muted-foreground">–</span>
          <Input
            type="number"
            min="0"
            placeholder={t("max")}
            value={filters.maxPrice}
            onChange={(e) => onUpdateFilter("maxPrice", e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </FilterSection>

      <FilterSection label={t("availability")}>
        <div className="space-y-1">
          {AVAILABILITY_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() =>
                onUpdateFilter(
                  "availability",
                  filters.availability === opt.value ? null : opt.value,
                )
              }
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                filters.availability === opt.value
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <div
                className={cn(
                  "h-3.5 w-3.5 rounded border border-border",
                  filters.availability === opt.value &&
                    "border-primary bg-primary",
                )}
              />
              {t(opt.key)}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

function CatalogToolbar(props: CatalogToolbarProps) {
  const { filters, onUpdateFilter } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation("store");

  return (
    <>
      <div className="flex items-center gap-2 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen(true)}
          className="gap-1.5"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {t("filters")}
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={filters.searchterm}
            onChange={(e) => onUpdateFilter("searchterm", e.target.value)}
            className="h-8 pl-7 text-xs"
          />
        </div>
      </div>

      <aside className="hidden w-64 shrink-0 lg:block">
        <FilterContent {...props} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 cursor-default"
            onClick={() => setMobileOpen(false)}
            aria-label={t("closeFilters")}
          />
          <div className="relative ml-auto h-full w-80 max-w-[calc(100vw-3rem)] overflow-y-auto border-l border-border bg-background p-4 shadow-lg">
            <FilterContent {...props} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

export default CatalogToolbar;
