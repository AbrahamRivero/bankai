"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/common/logo";
import { useAuth } from "@/components/providers/auth-provider/hooks/use-auth";
import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { useCart } from "@/lib/cart-context";

export function SiteHeader() {
  const { t } = useTranslation("store");
  const { user } = useAuth();
  const { uniqueItemCount } = useCart();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border/40 bg-background px-6">
      <Logo />
      <div className="flex items-center gap-1">
        {user && (
          <Link
            href="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t("cart")}
          >
            <ShoppingCart className="h-5 w-5" />
            {uniqueItemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {uniqueItemCount > 9 ? "9+" : uniqueItemCount}
              </span>
            )}
          </Link>
        )}
        <ThemeToggle />
        {user ? (
          <UserAvatar />
        ) : (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/auth/sign-in" />}
          >
            {t("signIn")}
          </Button>
        )}
      </div>
    </header>
  );
}
