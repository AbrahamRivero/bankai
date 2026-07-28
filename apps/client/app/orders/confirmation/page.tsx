"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function OrderConfirmationPage() {
  const { t } = useTranslation("store");

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <CheckCircle className="h-16 w-16 text-emerald-500" />

        <h1 className="text-2xl font-bold">{t("orderConfirmed")}</h1>

        <p className="text-muted-foreground">
          {t("orderConfirmationHint", { number: "" })}
        </p>

        <div className="flex gap-3">
          <Button nativeButton={false} render={<Link href="/orders" />}>
            {t("viewOrder")}
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/products" />}
            variant="outline"
          >
            {t("continueShopping")}
          </Button>
        </div>
      </div>
    </div>
  );
}
