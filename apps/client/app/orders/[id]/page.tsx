"use client";

import { ArrowLeft, ImageOff, Package, X, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useCancelOrder from "@/hooks/mutations/use-cancel-order";
import useGetOrder from "@/hooks/queries/use-get-order";

const DEFAULT_WORKSPACE_ID = process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID;

const statusVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive" | "success" | "warning"
> = {
  pending: "warning",
  confirmed: "default",
  shipped: "default",
  completed: "success",
  cancelled: "destructive",
};

const TIMELINE_STAGES = ["pending", "confirmed", "shipped", "completed"];

function Timeline({ currentStatus }: { currentStatus: string }) {
  const { t } = useTranslation("store");
  const currentIndex = TIMELINE_STAGES.indexOf(currentStatus);
  const isCancelled = currentStatus === "cancelled";
  const stages = isCancelled
    ? [...TIMELINE_STAGES, "cancelled"]
    : TIMELINE_STAGES;

  return (
    <div className="space-y-3">
      {stages.map((stage, idx) => {
        const isCancelledStage = stage === "cancelled";
        const isPast = !isCancelledStage && idx <= currentIndex;
        const isCurrent = !isCancelledStage && idx === currentIndex;

        return (
          <div key={stage} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  isCancelledStage
                    ? "bg-destructive/10 text-destructive"
                    : isPast
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground"
                } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
              >
                {isCancelledStage ? (
                  <X className="h-3 w-3" />
                ) : isPast ? (
                  "✓"
                ) : (
                  idx + 1
                )}
              </div>
              {idx < stages.length - 1 && (
                <div
                  className={`mt-1 h-8 w-px ${
                    isCancelled && idx >= currentIndex
                      ? "bg-destructive/50"
                      : isPast
                        ? "bg-primary"
                        : "bg-border"
                  }`}
                />
              )}
            </div>
            <div className="pt-0.5">
              <p
                className={`text-sm font-medium ${
                  isCancelledStage
                    ? "font-semibold text-destructive"
                    : isPast || isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {isCancelledStage
                  ? t("statusCancelled")
                  : t(
                      `status${stage.charAt(0).toUpperCase()}${stage.slice(1)}`,
                    )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function money(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export default function OrderDetailPage() {
  const { t } = useTranslation("store");
  const params = useParams<{ id: string }>();
  const workspaceId = DEFAULT_WORKSPACE_ID ?? "";
  const { data: order, isLoading } = useGetOrder(params.id, workspaceId);
  const cancelMutation = useCancelOrder();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const handleCancel = () => {
    cancelMutation.mutate(
      { id: params.id, workspaceId },
      { onSettled: () => setCancelDialogOpen(false) },
    );
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="mb-8 h-8 w-48" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-56 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="text-lg font-medium">{t("noOrders")}</p>
      </div>
    );
  }

  return (
    <section className="relative py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <Button
            nativeButton={false}
            render={<Link href="/orders" />}
            variant="ghost"
            size="icon"
            aria-label={t("backToOrders")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {t("orderDetail")} — {order.orderNumber}
          </h1>
          <Badge
            variant={statusVariant[order.orderStatus] ?? "outline"}
            className="ml-auto"
          >
            {t(
              `status${order.orderStatus.charAt(0).toUpperCase()}${order.orderStatus.slice(1)}`,
            )}
          </Badge>
          {["pending", "confirmed"].includes(order.orderStatus) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelDialogOpen(true)}
              disabled={cancelMutation.isPending}
            >
              <XCircle className="mr-1 h-4 w-4" />
              {t("cancelOrder")}
            </Button>
          )}
          <AlertDialog
            open={cancelDialogOpen}
            onOpenChange={setCancelDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("cancelOrderTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("cancelOrderDescription")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogClose
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  {t("keepOrder")}
                </AlertDialogClose>
                <AlertDialogClose
                  className={buttonVariants({
                    variant: "destructive",
                    size: "sm",
                  })}
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending
                    ? t("cancelling")
                    : t("confirmCancel")}
                </AlertDialogClose>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="flex flex-col gap-8 xl:flex-row">
          <div className="w-full min-w-0 flex-1 space-y-6">
            {order.orderItems.map((item) => {
              const imageUrl = item.product.images?.[0];

              return (
                <div
                  key={item.id}
                  className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-muted-foreground/30 sm:flex-row sm:items-center"
                >
                  <div className="flex h-24 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-24">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.product.title}
                        width={96}
                        height={96}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageOff className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{item.product.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.size && `Size: ${item.size}`}
                        {item.size && " · "}
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {money(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              );
            })}

            <div className="rounded-xl border border-border p-4">
              <h3 className="mb-3 text-sm font-semibold">
                {t("shippingInfo")}
              </h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{order.shippingAddress}</p>
                <p>
                  {order.city}, {order.province}
                </p>
                {order.phone && <p>{order.phone}</p>}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {order.paymentMethod && (
                <div className="flex-1 rounded-xl border border-border p-4">
                  <p className="mb-1 text-xs text-muted-foreground">
                    {t("paymentMethod")}
                  </p>
                  <p className="font-medium">{t(order.paymentMethod)}</p>
                </div>
              )}
              {order.trackingNumber && (
                <div className="flex-1 rounded-xl border border-border p-4">
                  <p className="mb-1 text-xs text-muted-foreground">
                    {t("trackingNumber")}
                  </p>
                  <p className="font-mono text-sm font-medium">
                    {order.trackingNumber}
                  </p>
                </div>
              )}
            </div>

            {order.notes && (
              <div className="rounded-xl border border-border p-4">
                <h3 className="mb-2 text-sm font-semibold">{t("notes")}</h3>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            )}
          </div>

          <div className="w-full max-w-sm shrink-0 space-y-6 xl:max-w-sm">
            <div className="group rounded-xl border border-border p-6 transition-all duration-300 hover:border-muted-foreground/30">
              <h2 className="pb-4 text-lg font-bold leading-10">
                {t("orderSummary")}
              </h2>
              <div className="space-y-4 border-b border-border pb-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
                    {t("productCost")}
                  </span>
                  <span className="text-sm font-medium">
                    {money(order.subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
                    {t("shippingLabel")}
                  </span>
                  <span className="text-sm font-medium">
                    {order.shipping === 0
                      ? t("freeShipping")
                      : money(order.shipping)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
                      {t("discountLabel")}
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      -{money(order.discount)}
                    </span>
                  </div>
                )}
                {order.promotionDiscount > 0 && order.promotion && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
                      {order.promotion.code ?? order.promotion.title}
                    </span>
                    <span className="text-sm font-medium text-emerald-600">
                      -{money(order.promotionDiscount)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between pt-4">
                <span className="font-semibold">{t("subtotal")}</span>
                <span className="text-lg font-bold text-primary">
                  {money(order.total)}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border p-4">
              <h3 className="mb-4 text-sm font-semibold">
                {t("orderTimeline")}
              </h3>
              <Timeline currentStatus={order.orderStatus} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
