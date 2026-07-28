"use client";

import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Search,
  SearchX,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ProductCard from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import useGetFavorites from "@/hooks/queries/use-get-favorites";

const DEFAULT_WORKSPACE_ID = process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID;
const PAGE_SIZE = 12;

export default function FavoritesPage() {
  const { t } = useTranslation("store");
  const workspaceId = DEFAULT_WORKSPACE_ID ?? "";

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortValue, setSortValue] = useState("default");
  const [offset, setOffset] = useState(0);

  const { data: favorites, isLoading } = useGetFavorites(workspaceId);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setOffset(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filtered = useMemo(() => {
    if (!favorites) return [];

    let result = [...favorites];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tags?.some((tag: string) => tag.toLowerCase().includes(q)),
      );
    }

    switch (sortValue) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "title-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime(),
        );
        break;
      default:
        break;
    }

    return result;
  }, [favorites, searchTerm, sortValue]);

  const total = filtered.length;
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const paged = filtered.slice(offset, offset + PAGE_SIZE);

  return (
    <div className="flex min-h-svh flex-col">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2">
          <Heart className="h-5 w-5" />
          <h1 className="text-2xl font-bold">{t("wishlist")}</h1>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("searchFavorites")}
                className="h-9 pl-8 text-sm"
              />
            </div>

            <Select
              value={sortValue}
              onValueChange={(v) => {
                setSortValue(v ?? "default");
                setOffset(0);
              }}
            >
              <SelectTrigger className="h-9 w-full sm:w-40">
                <SelectValue placeholder={t("sortBy")}>
                  {(value: string | null) =>
                    value != null ? (sortLabels(t)[value] ?? value) : null
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">{t("sortDefault")}</SelectItem>
                <SelectItem value="price-asc">{t("sortPriceAsc")}</SelectItem>
                <SelectItem value="price-desc">{t("sortPriceDesc")}</SelectItem>
                <SelectItem value="title-asc">{t("sortTitleAsc")}</SelectItem>
                <SelectItem value="title-desc">{t("sortTitleDesc")}</SelectItem>
                <SelectItem value="newest">{t("sortNewest")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {total > 0 && (
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {t("itemsCount", { count: total })}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => `skeleton-${i}`).map(
                (key) => (
                  <div key={key} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                ),
              )}
            </div>
          ) : paged.length === 0 ? (
            <div className="flex flex-1 items-center justify-center px-4">
              <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                {searchTerm ? (
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <SearchX className="h-7 w-7 text-muted-foreground/60" />
                  </div>
                ) : (
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100/80 dark:bg-rose-950/30">
                    <Heart className="h-10 w-10 text-rose-500/70" />
                  </div>
                )}
                <p className="text-lg font-semibold">
                  {searchTerm ? t("noFavoritesFound") : t("noFavorites")}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {searchTerm
                    ? t("noFavoritesFoundHint")
                    : t("noFavoritesHint")}
                </p>
                {!searchTerm && (
                  <Button
                    nativeButton={false}
                    render={<Link href="/products" />}
                    className="mt-6"
                  >
                    {t("browseProducts")}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paged.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination className="pt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationLink
                        aria-label={t("goToPreviousPage")}
                        size="default"
                        className="gap-1 pl-2.5"
                        onClick={() => setOffset((currentPage - 2) * PAGE_SIZE)}
                        disabled={currentPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>{t("previousPage")}</span>
                      </PaginationLink>
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={page === currentPage}
                            onClick={() => setOffset((page - 1) * PAGE_SIZE)}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    )}
                    <PaginationItem>
                      <PaginationLink
                        aria-label={t("goToNextPage")}
                        size="default"
                        className="gap-1 pr-2.5"
                        onClick={() => setOffset(currentPage * PAGE_SIZE)}
                        disabled={currentPage >= totalPages}
                      >
                        <span>{t("nextPage")}</span>
                        <ChevronRight className="h-4 w-4" />
                      </PaginationLink>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function sortLabels(t: (key: string) => string): Record<string, string> {
  return {
    default: t("sortDefault"),
    "price-asc": t("sortPriceAsc"),
    "price-desc": t("sortPriceDesc"),
    "title-asc": t("sortTitleAsc"),
    "title-desc": t("sortTitleDesc"),
    newest: t("sortNewest"),
  };
}
