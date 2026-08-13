"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function HomeClient() {
  const { t } = useTranslation("store");

  return (
    <div className="flex min-h-svh flex-col">
      <main className="flex-1">
        <section className="relative flex min-h-svh items-center justify-center overflow-hidden px-6">
          <div className="absolute inset-0 bg-linear-to-b from-muted/50 via-background to-background" />
          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              {t("premiumBadge")}
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t("heroTitle")}
              <br />
              <span className="text-primary">{t("heroTitleAccent")}</span>
            </h1>
            <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
              {t("heroDescription")}
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="gap-2 text-base h-12 px-8"
                nativeButton={false}
                render={<Link href="/products" />}
              >
                {t("browseProducts")}
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base h-12 px-8"
                nativeButton={false}
                render={<Link href="/auth/sign-up" />}
              >
                {t("createAccount")}
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} {t("brand")}. {t("allRightsReserved")}
      </footer>
    </div>
  );
}
