"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Trans, useTranslation } from "react-i18next";
import { AuthLayout } from "@/components/auth/layout";
import PageTitle from "@/components/page-title";

export default function CheckEmail() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || undefined;

  return (
    <>
      <PageTitle title={t("auth:checkEmail.pageTitle")} />
      <AuthLayout title={t("auth:checkEmail.title")}>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <Trans
                i18nKey="auth:checkEmail.inboxMessage"
                values={{
                  email: email || t("auth:checkEmail.emailFallback"),
                }}
                components={{
                  email: <span className="text-foreground font-medium" />,
                }}
              />
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center justify-center w-full h-8 text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              {t("auth:checkEmail.backToLogin")}
            </Link>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
