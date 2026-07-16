"use client";

import { KeyRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthLayout } from "@/components/auth/layout";
import { OtpSignInForm } from "@/components/auth/otp-sign-in-form";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignInFormSkeleton } from "@/components/auth/sign-in-form-skeleton";
import { AuthToggle } from "@/components/auth/toggle";
import PageTitle from "@/components/page-title";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import useGetConfig from "@/hooks/queries/config/use-get-config";
import useInstanceStatus from "@/hooks/queries/instance/use-instance-status";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export default function SignIn() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCustomOAuthLoading, setIsCustomOAuthLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isDiscordLoading, setIsDiscordLoading] = useState(false);
  const [autoLoginFailed, setAutoLoginFailed] = useState(false);
  const lastLoginMethod = authClient.getLastUsedLoginMethod();
  const { data: config, isLoading: isConfigLoading } = useGetConfig();
  const {
    data: instanceStatus,
    isLoading: isInstanceStatusLoading,
    isError: isInstanceStatusError,
    error: instanceStatusError,
  } = useInstanceStatus();

  const invitationId = searchParams.get("invitationId") || undefined;
  const defaultEmail = searchParams.get("email") || undefined;
  const redirectParam = searchParams.get("redirect") || undefined;
  const errorParam = searchParams.get("error") || undefined;

  useEffect(() => {
    if (instanceStatus && instanceStatus.hasUsers === false) {
      router.replace("/auth/sign-up");
    }
  }, [instanceStatus, router]);

  useEffect(() => {
    if (isInstanceStatusError) {
      toast.error(
        instanceStatusError instanceof Error
          ? instanceStatusError.message
          : t("auth:signIn.instanceStatusError"),
      );
    }
  }, [isInstanceStatusError, instanceStatusError, t]);

  const autoLoginTriggered = useRef(false);

  const getSafeRedirectPath = useCallback(() => {
    if (redirectParam?.startsWith("/") && !redirectParam.includes("//")) {
      return redirectParam;
    }
    return undefined;
  }, [redirectParam]);

  const getCallbackUrl = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const safeRedirect = getSafeRedirectPath();
    if (safeRedirect) {
      return `${baseUrl}${safeRedirect}`;
    }
    if (invitationId) {
      return `${baseUrl}/invitation/accept/${invitationId}`;
    }
    return `${baseUrl}/dashboard`;
  }, [invitationId, getSafeRedirectPath]);

  const handleCustomOAuth = useCallback(async () => {
    setIsCustomOAuthLoading(true);
    try {
      const result = await authClient.signIn.oauth2({
        providerId: "custom",
        callbackURL: getCallbackUrl(),
        errorCallbackURL: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/auth/sign-in`,
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("auth:signIn.oidcError"),
      );
      setAutoLoginFailed(true);
    } finally {
      setIsCustomOAuthLoading(false);
    }
  }, [getCallbackUrl, t]);

  const handleSignInGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: getCallbackUrl(),
        errorCallbackURL: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/auth/sign-in`,
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("auth:signIn.googleError"),
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSignInGithub = async () => {
    setIsGithubLoading(true);
    try {
      const result = await authClient.signIn.social({
        provider: "github",
        callbackURL: getCallbackUrl(),
        errorCallbackURL: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/auth/sign-in`,
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("auth:signIn.githubError"),
      );
    } finally {
      setIsGithubLoading(false);
    }
  };

  const handleSignInDiscord = async () => {
    setIsDiscordLoading(true);
    try {
      const result = await authClient.signIn.social({
        provider: "discord",
        callbackURL: getCallbackUrl(),
        errorCallbackURL: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/auth/sign-in`,
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("auth:signIn.discordError"),
      );
    } finally {
      setIsDiscordLoading(false);
    }
  };

  const handleSignInSuccess = () => {
    const safeRedirect = getSafeRedirectPath();
    if (safeRedirect) {
      router.push(safeRedirect);
    } else if (invitationId) {
      router.push(`/invitation/accept/${invitationId}`);
    } else {
      router.push("/dashboard");
    }
  };

  useEffect(() => {
    if (errorParam) {
      setAutoLoginFailed(true);
    }
  }, [errorParam]);

  useEffect(() => {
    if (
      config?.customOAuthAutoLogin &&
      config?.hasCustomOAuth &&
      !autoLoginTriggered.current &&
      !errorParam
    ) {
      autoLoginTriggered.current = true;
      handleCustomOAuth();
    }
  }, [config, handleCustomOAuth, errorParam]);

  if (
    isConfigLoading ||
    isInstanceStatusLoading ||
    instanceStatus?.hasUsers === false ||
    (config?.customOAuthAutoLogin && config?.hasCustomOAuth && !autoLoginFailed)
  ) {
    return (
      <>
        <PageTitle title={t("auth:signIn.pageTitle")} />
        <AuthLayout
          title={t("auth:signIn.title")}
          subtitle={t("auth:signIn.subtitle")}
        >
          <SignInFormSkeleton />
        </AuthLayout>
      </>
    );
  }

  return (
    <>
      <PageTitle title={t("auth:signIn.pageTitle")} />
      <AuthLayout
        title={t("auth:signIn.title")}
        subtitle={
          invitationId
            ? t("auth:signIn.invitationSubtitle")
            : t("auth:signIn.subtitle")
        }
      >
        <div className="mt-6">
          {errorParam && (
            <Alert variant="error" className="mb-4">
              <AlertDescription>
                {t(`auth:signIn.errors.${errorParam}`, {
                  defaultValue: errorParam.replace(/_/g, " "),
                })}
              </AlertDescription>
            </Alert>
          )}

          {invitationId && (
            <Alert className="mb-4">
              <AlertDescription>
                {t("auth:signIn.invitationAlert")}
              </AlertDescription>
            </Alert>
          )}

          {(config?.hasGoogleSignIn ||
            config?.hasGithubSignIn ||
            config?.hasDiscordSignIn ||
            config?.hasCustomOAuth) && (
            <>
              <div className="space-y-3">
                {config?.hasGoogleSignIn && (
                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={handleSignInGoogle}
                      disabled={isGoogleLoading}
                      className={cn(
                        "w-full",
                        lastLoginMethod === "google" && "border-primary/50!",
                      )}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-5 h-5 mr-2"
                        aria-label={t("auth:providers.google")}
                      >
                        <title>Google</title>
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      {isGoogleLoading
                        ? t("auth:signIn.signingIn")
                        : t("auth:signIn.continueWithGoogle")}
                    </Button>
                    {lastLoginMethod === "google" && (
                      <span className="absolute rounded-md -top-3 right-1 px-1.5 text-xs text-primary font-medium bg-sidebar border border-primary/50">
                        {t("auth:signIn.lastUsed")}
                      </span>
                    )}
                  </div>
                )}

                {config?.hasGithubSignIn && (
                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={handleSignInGithub}
                      disabled={isGithubLoading}
                      className={cn(
                        "w-full",
                        lastLoginMethod === "github" && "border-primary/50!",
                      )}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        aria-label={t("auth:providers.github")}
                      >
                        <title>GitHub</title>
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      {isGithubLoading
                        ? t("auth:signIn.signingIn")
                        : t("auth:signIn.continueWithGithub")}
                    </Button>
                    {lastLoginMethod === "github" && (
                      <span className="absolute rounded-md -top-3 right-1 px-1.5 text-xs text-primary font-medium bg-sidebar border border-primary/50">
                        {t("auth:signIn.lastUsed")}
                      </span>
                    )}
                  </div>
                )}

                {config?.hasDiscordSignIn && (
                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={handleSignInDiscord}
                      disabled={isDiscordLoading}
                      className={cn(
                        "w-full",
                        lastLoginMethod === "discord" && "border-primary/50!",
                      )}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        aria-label={t("auth:providers.discord")}
                      >
                        <title>Discord</title>
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                      {isDiscordLoading
                        ? t("auth:signIn.signingIn")
                        : t("auth:signIn.continueWithDiscord")}
                    </Button>
                    {lastLoginMethod === "discord" && (
                      <span className="absolute rounded-md -top-3 right-1 px-1.5 text-xs text-primary font-medium bg-sidebar border border-primary/50">
                        {t("auth:signIn.lastUsed")}
                      </span>
                    )}
                  </div>
                )}

                {config?.hasCustomOAuth && (
                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={handleCustomOAuth}
                      disabled={isCustomOAuthLoading}
                      className={cn(
                        "w-full",
                        lastLoginMethod === "custom" && "border-primary/50!",
                      )}
                    >
                      <KeyRound className="w-5 h-5 mr-2" />
                      {isCustomOAuthLoading
                        ? t("auth:signIn.signingIn")
                        : t("auth:signIn.continueWithOidc")}
                    </Button>
                    {lastLoginMethod === "custom" && (
                      <span className="absolute rounded-md -top-3 right-1 px-1.5 text-xs text-primary font-medium bg-sidebar border border-primary/50">
                        {t("auth:signIn.lastUsed")}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {!config?.disableLoginForm && (
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card text-muted-foreground">
                      {t("auth:forms.or")}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
          {!config?.disableLoginForm &&
            (config?.hasSmtp ? (
              <OtpSignInForm
                invitationId={invitationId}
                defaultEmail={defaultEmail}
                redirect={getSafeRedirectPath()}
                onSuccess={handleSignInSuccess}
              />
            ) : (
              <SignInForm
                defaultEmail={defaultEmail}
                onSuccess={handleSignInSuccess}
              />
            ))}
          {config?.disableRegistration ||
          config?.disablePasswordRegistration ? (
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                {config?.disableRegistration
                  ? t("auth:signIn.registrationDisabled")
                  : t("auth:signIn.passwordRegistrationDisabled")}
              </p>
            </div>
          ) : !config?.disableLoginForm ? (
            <AuthToggle
              message={t("auth:signIn.toggleMessage")}
              linkText={t("auth:signIn.toggleLink")}
              linkTo="/auth/sign-up"
            />
          ) : null}
        </div>
      </AuthLayout>
    </>
  );
}
