"use client";

import { Heart, LogOut, Package, Settings } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/components/providers/auth-provider/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/menu";
import { Separator } from "@/components/ui/separator";
import { useSignOut } from "@/hooks/mutations/use-sign-out";

export function UserAvatar() {
  const { t } = useTranslation("store");
  const { user } = useAuth();
  const { mutate: signOut, isPending } = useSignOut();

  if (!user) {
    return null;
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full p-0"
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={user.image ?? ""} alt={user.name || ""} />
            <AvatarFallback className="text-xs font-medium border border-border/30">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52 p-0" side="bottom" align="start">
        <div className="px-2.5 py-2">
          <div className="flex items-center gap-2 text-left text-sm">
            <Avatar className="h-7 w-7 rounded-full">
              <AvatarImage src={user.image ?? ""} alt={user.name || ""} />
              <AvatarFallback className="rounded-full border border-border/30">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {user.name || "User"}
              </span>
              {user.email && (
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div className="p-0.5">
          <DropdownMenuItem
            className="h-7 gap-2 px-2 text-sm font-normal"
            render={<Link href="/orders" />}
          >
            <Package className="size-3.5" />
            {t("myOrders")}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="h-7 gap-2 px-2 text-sm font-normal"
            render={<Link href="/favorites" />}
          >
            <Heart className="size-3.5" />
            {t("wishlist")}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="h-7 gap-2 px-2 text-sm font-normal"
            render={<Link href="/settings" />}
          >
            <Settings className="size-3.5" />
            {t("settings")}
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        <div className="p-0.5">
          <DropdownMenuItem
            onClick={() => signOut()}
            disabled={isPending}
            className="h-7 gap-2 px-2 text-sm font-normal"
          >
            <LogOut className="size-3.5" />
            {isPending ? t("signingOut") : t("signOut")}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
