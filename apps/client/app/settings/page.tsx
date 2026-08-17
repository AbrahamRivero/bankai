"use client";

import { supportedLocales } from "@i18n/resources";
import { ChevronLeft, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/components/providers/auth-provider/hooks/use-auth";
import NotificationPreferencesSettings from "@/components/settings/notification-preferences-settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { type DisplayCurrency, useCurrencyStore } from "@/lib/currency-store";
import { cn } from "@/lib/utils";

function getLocaleLabel(locale: string) {
  try {
    const localeObj = new Intl.Locale(locale);
    const languageDisplayNames = new Intl.DisplayNames([locale], {
      type: "language",
    });
    const regionDisplayNames = new Intl.DisplayNames([locale], {
      type: "region",
    });
    const raw = languageDisplayNames.of(localeObj.language) ?? locale;
    const languageLabel = raw.charAt(0).toUpperCase() + raw.slice(1);

    if (!localeObj.region) {
      return languageLabel;
    }

    const regionLabel =
      regionDisplayNames.of(localeObj.region) ?? localeObj.region;

    return `${languageLabel} (${regionLabel})`;
  } catch {
    return locale;
  }
}

const CURRENCIES: DisplayCurrency[] = ["USD", "EUR", "CUP"];

export default function SettingsPage() {
  const { t, i18n } = useTranslation("store");
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "preferences";
  const currency = useCurrencyStore((state) => state.currency);
  const setCurrency = useCurrencyStore((state) => state.setCurrency);

  const setActiveTab = useCallback(
    (tab: string) => {
      router.replace(`/settings?tab=${tab}`);
    },
    [router],
  );

  const handleLanguageChange = useCallback(
    async (nextLocale: string) => {
      await i18n.changeLanguage(nextLocale);
      await authClient.updateUser({ locale: nextLocale });
    },
    [i18n],
  );

  const themeLabels: Record<string, string> = {
    light: t("themeLight"),
    dark: t("themeDark"),
    system: t("themeSystem"),
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || "U";

  const navItems = [
    { value: "preferences", label: t("preferences"), icon: Settings },
    { value: "account", label: t("account"), icon: User },
  ];

  return (
    <div className="flex min-h-svh flex-col">
      <nav className="flex items-center gap-2 border-b border-border/40 px-6 py-3 text-sm">
        <Link
          href="/"
          className="font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("home")}
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link
          href="/products"
          className="font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("products")}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">{t("settings")}</span>
      </nav>

      <div className="flex flex-1">
        <aside className="hidden w-64 flex-col border-r border-border/40 p-4 md:flex">
          <div className="mb-2 flex items-center gap-3 rounded-md px-2 py-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.image ?? ""} alt={user?.name || ""} />
              <AvatarFallback className="border border-border/30 text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <p className="truncate text-sm">{user?.name || "—"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email || "—"}
              </p>
            </div>
          </div>
          <Separator />
          <nav className="mt-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setActiveTab(item.value)}
                className={cn(
                  "flex h-8 w-full items-center justify-start gap-2 rounded-lg px-2 text-[11px] font-normal text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  activeTab === item.value &&
                    "bg-sidebar-accent text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 px-6 py-8 md:px-10">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors md:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("back")}
          </button>

          <div className="mb-8 flex gap-1 rounded-lg border border-border bg-background p-1 md:hidden">
            {navItems.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setActiveTab(item.value)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                  activeTab === item.value
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>

          {activeTab === "preferences" && (
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold">{t("preferences")}</h1>
                <p className="text-muted-foreground">
                  {t("preferencesDescription")}
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-md font-medium">{t("appearance")}</h2>
                  <p className="text-xs text-muted-foreground">
                    {t("appearanceDescription")}
                  </p>
                </div>

                <div className="space-y-4 rounded-md border border-border bg-sidebar p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        {t("themeLabel")}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t("themeDescription")}
                      </p>
                    </div>
                    <Select
                      value={theme}
                      onValueChange={(value) => value && setTheme(value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder={t("themeSystem")}>
                          {themeLabels[theme ?? "system"]}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">{t("themeLight")}</SelectItem>
                        <SelectItem value="dark">{t("themeDark")}</SelectItem>
                        <SelectItem value="system">
                          {t("themeSystem")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        {t("languageLabel")}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t("languageDescription")}
                      </p>
                    </div>
                    <Select
                      value={i18n.language}
                      onValueChange={(value) =>
                        value && handleLanguageChange(value)
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder={t("languagePlaceholder")}>
                          {getLocaleLabel(i18n.language)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {supportedLocales.map((locale) => (
                          <SelectItem key={locale} value={locale}>
                            {getLocaleLabel(locale)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        {t("currencyLabel")}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t("currencyDescription")}
                      </p>
                    </div>
                    <Select
                      value={currency}
                      onValueChange={(value) =>
                        value && setCurrency(value as DisplayCurrency)
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder={t("currencyPlaceholder")}>
                          {currency}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((code) => (
                          <SelectItem key={code} value={code}>
                            {code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold">{t("account")}</h1>
                <p className="text-muted-foreground">
                  {t("accountDescription")}
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-md font-medium">{t("information")}</h2>
                  <p className="text-xs text-muted-foreground">
                    {t("informationDescription")}
                  </p>
                </div>

                <div className="space-y-4 rounded-md border border-border bg-sidebar p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        {t("profilePicture")}
                      </Label>
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user?.image ?? ""}
                        alt={user?.name || ""}
                      />
                      <AvatarFallback className="border border-border/30 text-xs font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        {t("nameLabel")}
                      </Label>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {user?.name || "—"}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        {t("emailLabel")}
                      </Label>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {user?.email || "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-md font-medium">{t("notifications")}</h2>
                  <p className="text-xs text-muted-foreground">
                    {t("notificationsDescription")}
                  </p>
                </div>

                <NotificationPreferencesSettings />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
