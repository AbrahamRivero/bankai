"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/components/providers/auth-provider/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import useCheckout from "@/hooks/mutations/use-checkout";
import { useCart } from "@/lib/cart-context";
import { convertPrice, formatPrice } from "@/lib/currency";
import { useCurrencyStore } from "@/lib/currency-store";

const DEFAULT_WORKSPACE_ID = process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID;

type PaymentMethod = "usd" | "euro" | "cup" | "card";

export default function CheckoutPage() {
  const { t } = useTranslation("store");
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const checkoutMutation = useCheckout();
  const currency = useCurrencyStore((state) => state.currency);
  const rates = useCurrencyStore((state) => state.rates);
  const router = useRouter();

  const [shippingAddress, setShippingAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cup");
  const [promotionCode, setPromotionCode] = useState("");

  const usdRate = rates["USD"];

  if (!user) {
    router.replace("/auth/sign-in");
    return null;
  }

  if (items.length === 0) {
    router.replace("/cart");
    return null;
  }

  const hasFreeShipping = subtotal >= 100;
  const shipping = hasFreeShipping ? 0 : 9.99;
  const total = subtotal + shipping;
  const displaySubtotal = convertPrice(subtotal, rates, currency);
  const displayShipping = convertPrice(shipping, rates, currency);
  const displayTotal = convertPrice(total, rates, currency);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!DEFAULT_WORKSPACE_ID) return;

    try {
      await checkoutMutation.mutateAsync({
        shippingAddress,
        city,
        province,
        phone: phone || undefined,
        notes: notes || undefined,
        paymentMethod,
        promotionCode: promotionCode || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          size: i.size ?? undefined,
        })),
        workspaceId: DEFAULT_WORKSPACE_ID,
      });
      clearCart();
      router.push("/orders/confirmation");
    } catch {
      // toast handled by mutation
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold">{t("checkout")}</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-border p-4 space-y-4">
              <h2 className="text-sm font-semibold">{t("shippingAddress")}</h2>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="address">{t("shippingAddress")}</Label>
                  <Input
                    id="address"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="city">{t("cityLabel")}</Label>
                    <Input
                      id="city"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="province">{t("provinceLabel")}</Label>
                    <Input
                      id="province"
                      required
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">{t("phoneLabel")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border p-4 space-y-4">
              <h2 className="text-sm font-semibold">{t("paymentMethod")}</h2>
              <Select
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">{t("card")}</SelectItem>
                  <SelectItem value="usd">{t("usd")}</SelectItem>
                  <SelectItem value="euro">{t("euro")}</SelectItem>
                  <SelectItem value="cup">{t("cup")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border border-border p-4 space-y-4">
              <h2 className="text-sm font-semibold">{t("promotionCode")}</h2>
              <div className="flex gap-2">
                <Input
                  value={promotionCode}
                  onChange={(e) => setPromotionCode(e.target.value)}
                  placeholder={t("promotionCodePlaceholder")}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border p-4 space-y-4">
              <h2 className="text-sm font-semibold">{t("notes")}</h2>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("notesPlaceholder")}
                rows={3}
              />
            </div>

            <div className="rounded-xl border border-border p-4 space-y-3">
              <h2 className="text-sm font-semibold">{t("orderSummary")}</h2>
              {items.map((item) => {
                const key = `${item.productId}-${item.size ?? ""}`;
                return (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.title}
                      {item.size && ` (${item.size})`} x{item.quantity}
                    </span>
                    <span>
                      {formatPrice(
                        convertPrice(
                          item.price * item.quantity,
                          rates,
                          currency,
                        ),
                        currency,
                      )}{" "}
                      {currency}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border p-4 space-y-3">
              <h3 className="text-sm font-semibold">{t("orderSummary")}</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("itemsCount", { count: items.length })}</span>
                  <span>
                    {formatPrice(displaySubtotal, currency)} {currency}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("shippingLabel")}</span>
                  <span>
                    {hasFreeShipping
                      ? t("freeShipping")
                      : `${formatPrice(displayShipping, currency)} ${currency}`}
                  </span>
                </div>
                {usdRate != null && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("usd")}</span>
                    <span>
                      1 {t("usd")} = {formatPrice(usdRate, "CUP")} {t("cup")}
                    </span>
                  </div>
                )}
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-semibold">
                <span>{t("orderTotal")}</span>
                <span>
                  {formatPrice(displayTotal, currency)} {currency}
                </span>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={checkoutMutation.isPending}
              >
                {checkoutMutation.isPending
                  ? t("placingOrder")
                  : t("placeOrder")}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
