"use client";

import { Package, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import useGetOrders from "@/hooks/queries/use-get-orders";
import { formatPrice } from "@/lib/currency";

const DEFAULT_WORKSPACE_ID = process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID;
const PAGE_SIZE = 10;

const statusVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive" | "success"
> = {
  pending: "secondary",
  confirmed: "default",
  shipped: "default",
  completed: "success",
  cancelled: "destructive",
};

const STATUS_OPTIONS = [
  "",
  "pending",
  "confirmed",
  "shipped",
  "completed",
  "cancelled",
] as const;

function getStatusLabel(status: string, t: (key: string) => string): string {
  const labels: Record<string, string> = {
    pending: t("statusPending"),
    confirmed: t("statusConfirmed"),
    shipped: t("statusShipped"),
    completed: t("statusCompleted"),
    cancelled: t("statusCancelled"),
  };
  return labels[status] ?? status;
}

function orderCurrency(paymentMethod: string): string {
  if (paymentMethod === "usd") return "USD";
  if (paymentMethod === "euro") return "EUR";
  return "CUP";
}

export default function OrdersPage() {
  const { t } = useTranslation("store");
  const workspaceId = DEFAULT_WORKSPACE_ID ?? "";

  const [searchInput, setSearchInput] = useState("");
  const [searchterm, setSearchterm] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [offset, setOffset] = useState(0);

  const sortValue =
    sortBy === "createdAt" && sortOrder === "desc"
      ? "newest"
      : sortBy === "createdAt" && sortOrder === "asc"
        ? "oldest"
        : sortBy === "total" && sortOrder === "desc"
          ? "highest"
          : "lowest";

  const sortLabels: Record<string, string> = {
    newest: t("sortNewest"),
    oldest: t("sortOldest"),
    highest: t("sortHighestTotal"),
    lowest: t("sortLowestTotal"),
  };

  const statusLabels: Record<string, string> = {
    "": t("statusAll"),
    pending: t("statusPending"),
    confirmed: t("statusConfirmed"),
    shipped: t("statusShipped"),
    completed: t("statusCompleted"),
    cancelled: t("statusCancelled"),
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchterm(searchInput);
      setOffset(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useGetOrders({
    workspaceId,
    limit: PAGE_SIZE,
    offset,
    orderStatus: orderStatus || undefined,
    searchterm: searchterm || undefined,
    sortBy: sortBy as "createdAt" | "total" | "orderNumber",
    sortOrder: sortOrder as "asc" | "desc",
  });

  const orders = data?.orders ?? [];
  const total = data?.total ?? 0;
  const stats = data?.stats;
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSortChange = (value: string | null) => {
    if (!value) return;
    switch (value) {
      case "newest":
        setSortBy("createdAt");
        setSortOrder("desc");
        break;
      case "oldest":
        setSortBy("createdAt");
        setSortOrder("asc");
        break;
      case "highest":
        setSortBy("total");
        setSortOrder("desc");
        break;
      case "lowest":
        setSortBy("total");
        setSortOrder("asc");
        break;
    }
    setOffset(0);
  };

  const handleStatusChange = (value: string | null) => {
    setOrderStatus(value ?? "");
    setOffset(0);
  };

  return (
    <div className="flex min-h-svh flex-col">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          <h1 className="text-2xl font-bold">{t("myOrders")}</h1>
        </div>

        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">
                {t("totalOrders")}
              </p>
              <p className="mt-1 text-xl font-bold">{stats.total}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">
                {t("activeOrders")}
              </p>
              <p className="mt-1 text-xl font-bold">{stats.active}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">
                {t("completedOrders")}
              </p>
              <p className="mt-1 text-xl font-bold">{stats.completed}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">
                {t("cancelledOrders")}
              </p>
              <p className="mt-1 text-xl font-bold">{stats.cancelled}</p>
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("searchOrders")}
              className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          <Select value={orderStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t("filterByStatus")}>
                {(value: string | null) =>
                  value != null ? (statusLabels[value] ?? value) : null
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t("statusAll")}</SelectItem>
              {STATUS_OPTIONS.filter(Boolean).map((s) => (
                <SelectItem key={s} value={s}>
                  {getStatusLabel(s, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortValue} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t("sortBy")}>
                {(value: string | null) =>
                  value != null ? (sortLabels[value] ?? value) : null
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t("sortNewest")}</SelectItem>
              <SelectItem value="oldest">{t("sortOldest")}</SelectItem>
              <SelectItem value="highest">{t("sortHighestTotal")}</SelectItem>
              <SelectItem value="lowest">{t("sortLowestTotal")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-1 flex-col">
          {isLoading ? (
            <div className="flex-1 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border py-16 text-center">
                <Package className="h-12 w-12 text-muted-foreground/40" />
                <p className="text-lg font-medium">
                  {searchterm || orderStatus
                    ? t("noOrdersFound")
                    : t("noOrders")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchterm || orderStatus
                    ? t("noOrdersFoundHint")
                    : t("noOrdersHint")}
                </p>
                {!searchterm && !orderStatus && (
                  <Button
                    nativeButton={false}
                    render={<Link href="/products" />}
                  >
                    {t("browseProducts")}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="block rounded-xl border border-border p-4 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {order.orderNumber}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          {order.customerName && (
                            <span>{order.customerName}</span>
                          )}
                          <span>
                            {order.orderItems.length} {t("orderItems")}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={
                            statusVariant[order.orderStatus] ?? "outline"
                          }
                        >
                          {getStatusLabel(order.orderStatus, t)}
                        </Badge>
                        <p className="text-sm font-semibold">
                          {order.totalInCurrency != null
                            ? `${formatPrice(order.totalInCurrency, orderCurrency(order.paymentMethod))} ${orderCurrency(order.paymentMethod)}`
                            : `$${order.total.toFixed(2)} ${t("usd")}`}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination className="pt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setOffset((currentPage - 2) * PAGE_SIZE)}
                        disabled={currentPage <= 1}
                      />
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
                      <PaginationNext
                        onClick={() => setOffset(currentPage * PAGE_SIZE)}
                        disabled={currentPage >= totalPages}
                      />
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
