"use client";

import { supportedLocales } from "@i18n/resources";
import { ChevronLeft, Info, Moon, Palette, Sun } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/components/providers/auth-provider/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

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

const tabs = ["appearance", "language", "information"] as const;

export default function SettingsPage() {
  const { t, i18n } = useTranslation("store");
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "appearance";

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

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || "U";

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
          <div className="mb-6 flex flex-col items-center gap-3 pt-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={user?.image ?? ""} alt={user?.name || ""} />
              <AvatarFallback className="border border-border/30 text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-sm font-medium">{user?.name || "—"}</p>
              <p className="text-xs text-muted-foreground">
                {user?.email || "—"}
              </p>
            </div>
          </div>
          <Separator />
          <nav className="mt-4 flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  activeTab === tab
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                {tab === "appearance" && <Palette className="h-4 w-4" />}
                {tab === "language" && <Sun className="h-4 w-4" />}
                {tab === "information" && <Info className="h-4 w-4" />}
                {t(tab)}
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

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">{t("appearance")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("appearanceDescription")}
                </p>
              </div>

              <div className="space-y-4 rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{t("themeLabel")}</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background p-1">
                    <button
                      type="button"
                      aria-label={t("themeLight")}
                      onClick={() => setTheme("light")}
                      className={`rounded-md p-1.5 transition-colors ${
                        theme === "light"
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Sun className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={t("themeDark")}
                      onClick={() => setTheme("dark")}
                      className={`rounded-md p-1.5 transition-colors ${
                        theme === "dark"
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Moon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={t("themeSystem")}
                      onClick={() => setTheme("system")}
                      className={`rounded-md p-1.5 transition-colors ${
                        theme === "system"
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Sun className="h-4 w-4 opacity-50" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "language" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">{t("language")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("languageDescription")}
                </p>
              </div>

              <div className="space-y-4 rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{t("languageLabel")}</p>
                  </div>
                  <Select
                    value={i18n.language}
                    onValueChange={(value) =>
                      value && handleLanguageChange(value)
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t("languagePlaceholder")} />
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
              </div>
            </div>
          )}

          {activeTab === "information" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">{t("information")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("informationDescription")}
                </p>
              </div>

              <div className="space-y-4 rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{t("profilePicture")}</p>
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
                    <p className="text-sm font-medium">{t("nameLabel")}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {user?.name || "—"}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{t("emailLabel")}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {user?.email || "—"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
