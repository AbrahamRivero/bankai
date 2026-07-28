"use client";

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/components/providers/auth-provider/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { t } = useTranslation("store");
  const { user } = useAuth();
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, itemCount, subtotal } =
    useCart();

  if (!user) {
    router.replace("/auth/sign-in");
    return null;
  }

  const hasFreeShipping = subtotal >= 100;
  const shipping = hasFreeShipping ? 0 : 9.99;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
        <ShoppingCart className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-xl font-medium">{t("cartEmpty")}</h2>
        <p className="text-sm text-muted-foreground">{t("cartEmptyHint")}</p>
        <Button nativeButton={false} render={<Link href="/products" />}>
          {t("browseProducts")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("cart")}</h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("cartClear")}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const key = `${item.productId}-${item.size ?? ""}`;
            return (
              <div
                key={key}
                className="flex gap-4 rounded-xl border border-border p-4"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      {t("noImage")}
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {item.title}
                    </Link>
                    {item.size && (
                      <p className="text-xs text-muted-foreground">
                        {t("sizeLabel")}: {item.size}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.quantity - 1,
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
                        aria-label={t("decreaseQuantity")}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="flex h-7 w-10 items-center justify-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.quantity + 1,
                          )
                        }
                        disabled={item.quantity >= item.stock}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
                        aria-label={t("increaseQuantity")}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.size)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label={t("removeItem")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-sm font-semibold">{t("orderSummary")}</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{t("itemsCount", { count: itemCount })}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t("shippingLabel")}</span>
                <span>
                  {hasFreeShipping
                    ? t("freeShipping")
                    : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {!hasFreeShipping && subtotal > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("freeShippingHint", {
                    amount: (100 - subtotal).toFixed(2),
                  })}
                </p>
              )}
            </div>
            <Separator />
            <div className="flex justify-between text-sm font-semibold">
              <span>{t("total")}</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Button
              className="w-full"
              nativeButton={false}
              render={<Link href="/checkout" />}
            >
              {t("proceedToCheckout")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
