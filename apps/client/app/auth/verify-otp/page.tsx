"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { AuthLayout } from "@/components/auth/layout";
import PageTitle from "@/components/page-title";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/toast";

export default function VerifyOtp() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const invitationId = searchParams.get("invitationId") || undefined;
  const redirect = searchParams.get("redirect") || undefined;
  const [isPending, setIsPending] = useState(false);

  const verifyOtpSchema = useMemo(
    () =>
      z.object({
        otp: z.string().length(6, t("auth:verifyOtp.validation.codeLength")),
      }),
    [t],
  );

  type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;

  const form = useForm<VerifyOtpFormValues>({
    defaultValues: { otp: "" },
  });

  const safeRedirect = useMemo(() => {
    if (redirect?.startsWith("/") && !redirect.includes("//")) {
      return redirect;
    }
    return undefined;
  }, [redirect]);

  const signInPath = useMemo(() => {
    if (!redirect) {
      return "/auth/sign-in";
    }
    return `/auth/sign-in?redirect=${encodeURIComponent(redirect)}`;
  }, [redirect]);

  const onSubmit = useCallback(
    async (data: VerifyOtpFormValues) => {
      setIsPending(true);
      try {
        const result = await authClient.signIn.emailOtp({
          email,
          otp: data.otp,
        });
        if (result.error) {
          toast.error(
            result.error.message || t("auth:verifyOtp.toast.invalidCode"),
          );
          return;
        }
        toast.success(t("auth:verifyOtp.toast.signedInSuccess"));
        if (safeRedirect) {
          router.push(safeRedirect);
        } else if (invitationId) {
          router.push(`/invitation/accept/${invitationId}`);
        } else {
          router.push("/dashboard");
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : t("auth:verifyOtp.toast.verifyFailed"),
        );
      } finally {
        setIsPending(false);
      }
    },
    [email, invitationId, router, safeRedirect, t],
  );

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "otp" && value.otp?.length === 6 && !isPending) {
        form.handleSubmit(onSubmit)();
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isPending, onSubmit]);

  const handleResendOtp = async () => {
    setIsPending(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      if (result.error) {
        toast.error(
          result.error.message || t("auth:verifyOtp.toast.resendFailed"),
        );
        return;
      }
      toast.success(t("auth:verifyOtp.toast.resendSuccess"));
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("auth:verifyOtp.toast.resendFailed"),
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <PageTitle title={t("auth:verifyOtp.pageTitle")} />
      <AuthLayout
        title={t("auth:verifyOtp.title")}
        subtitle={t("auth:verifyOtp.subtitle")}
      >
        <div className="space-y-4">
          <Alert>
            <AlertDescription className="text-xs">
              {t("auth:verifyOtp.codeSentTo", { email })}
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="otp"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium sr-only">
                      {t("auth:verifyOtp.verificationCodeLabel")}
                    </FormLabel>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        pattern={REGEXP_ONLY_DIGITS}
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        name="one-time-code"
                      >
                        <InputOTPGroup className="grid w-full grid-cols-6 gap-1.5">
                          <InputOTPSlot className="h-11 w-full" index={0} />
                          <InputOTPSlot className="h-11 w-full" index={1} />
                          <InputOTPSlot className="h-11 w-full" index={2} />
                          <InputOTPSlot className="h-11 w-full" index={3} />
                          <InputOTPSlot className="h-11 w-full" index={4} />
                          <InputOTPSlot className="h-11 w-full" index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending
                  ? t("auth:verifyOtp.verifying")
                  : t("auth:verifyOtp.verifyAndSignIn")}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(signInPath)}
                  className="w-full"
                >
                  <ArrowLeft className="size-4" />
                  {t("auth:verifyOtp.changeEmail")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleResendOtp}
                  disabled={isPending}
                  className="w-full"
                >
                  <RefreshCcw className="size-4" />
                  {t("auth:verifyOtp.resend")}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </AuthLayout>
    </>
  );
}
