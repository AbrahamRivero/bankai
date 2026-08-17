"use client";

import { CheckCircle, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import useUpdateNotificationPreferences from "@/hooks/mutations/use-update-notification-preferences";
import useGetNotificationPreferences from "@/hooks/queries/store/use-get-notification-preferences";
import { toast } from "@/lib/toast";

type ChannelPrefsState = {
  emailEnabled: boolean;
  ntfy: { enabled: boolean; serverUrl: string; topic: string; token: string };
  gotify: { enabled: boolean; serverUrl: string; token: string };
  webhook: { enabled: boolean; url: string; secret: string };
};

function createDefaultChannelPrefs(): ChannelPrefsState {
  return {
    emailEnabled: false,
    ntfy: { enabled: false, serverUrl: "", topic: "", token: "" },
    gotify: { enabled: false, serverUrl: "", token: "" },
    webhook: { enabled: false, url: "", secret: "" },
  };
}

function ChannelCard({
  children,
  description,
  headerRight,
  title,
}: {
  title: React.ReactNode;
  description: React.ReactNode;
  headerRight: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-md border border-border bg-sidebar p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {headerRight}
      </div>
      {children}
    </div>
  );
}

function ChannelStatus({
  enabled,
  connected,
}: {
  enabled: boolean;
  connected: boolean;
}) {
  const { t } = useTranslation("store");

  if (!connected) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <CheckCircle className="size-4 text-green-600" />
      <span>
        {enabled
          ? t("notificationStatusConnected")
          : t("notificationStatusPaused")}
      </span>
    </div>
  );
}

function ChannelActions({
  isConfigured,
  isSaving,
  onSave,
  onDisconnect,
}: {
  isConfigured: boolean;
  isSaving: boolean;
  onSave: () => Promise<void>;
  onDisconnect?: () => Promise<void>;
}) {
  const { t } = useTranslation("store");

  return (
    <div className="flex flex-wrap gap-2">
      <Button disabled={isSaving} onClick={onSave} type="button" size="sm">
        {isConfigured ? t("notificationSaveChanges") : t("notificationConnect")}
      </Button>
      {isConfigured && onDisconnect ? (
        <Button
          disabled={isSaving}
          onClick={onDisconnect}
          type="button"
          variant="outline"
          size="sm"
        >
          <Trash2 className="size-4" />
          {t("notificationDisconnect")}
        </Button>
      ) : null}
    </div>
  );
}

function NotificationPreferencesSettings() {
  const { t } = useTranslation("store");
  const { data: preferences, isLoading } = useGetNotificationPreferences();
  const { mutateAsync: updatePreferences, isPending: isSavingPreferences } =
    useUpdateNotificationPreferences();

  const [prefs, setPrefs] = React.useState<ChannelPrefsState>(
    createDefaultChannelPrefs,
  );

  React.useEffect(() => {
    if (!preferences) return;
    setPrefs({
      emailEnabled: preferences.emailEnabled,
      ntfy: {
        enabled: preferences.ntfyEnabled,
        serverUrl: preferences.ntfyServerUrl ?? "",
        topic: preferences.ntfyTopic ?? "",
        token: "",
      },
      gotify: {
        enabled: preferences.gotifyEnabled,
        serverUrl: preferences.gotifyServerUrl ?? "",
        token: "",
      },
      webhook: {
        enabled: preferences.webhookEnabled,
        url: preferences.webhookUrl ?? "",
        secret: "",
      },
    });
  }, [preferences]);

  const save = async (
    action: () => Promise<unknown>,
    successMessage: string,
  ) => {
    try {
      await action();
      toast.success(successMessage);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("notificationSaveFailed"),
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-md" />
        <Skeleton className="h-40 rounded-md" />
        <Skeleton className="h-40 rounded-md" />
        <Skeleton className="h-40 rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ChannelCard
        description={t("notificationEmailDescription")}
        headerRight={
          <div className="flex items-center gap-3">
            <ChannelStatus
              enabled={prefs.emailEnabled}
              connected={Boolean(preferences?.emailAddress)}
            />
            <Switch
              checked={prefs.emailEnabled}
              disabled={isSavingPreferences || !preferences?.emailAddress}
              onCheckedChange={(checked) =>
                setPrefs((prev) => ({ ...prev, emailEnabled: checked }))
              }
            />
          </div>
        }
        title={t("notificationEmailTitle")}
      >
        <div className="space-y-1">
          <Label className="text-sm font-medium">
            {t("notificationAccountEmailLabel")}
          </Label>
          <Input
            disabled
            readOnly
            value={
              preferences?.emailAddress ??
              t("notificationAccountEmailNoAddress")
            }
          />
          <p className="text-xs text-muted-foreground">
            {t("notificationAccountEmailHint")}
          </p>
        </div>
        <ChannelActions
          isConfigured={Boolean(preferences?.emailAddress)}
          isSaving={isSavingPreferences}
          onSave={() =>
            save(
              () =>
                updatePreferences({
                  emailEnabled: prefs.emailEnabled,
                }),
              t("notificationSaved"),
            )
          }
        />
      </ChannelCard>

      <ChannelCard
        description={t("notificationGotifyDescription")}
        headerRight={
          <div className="flex items-center gap-3">
            <ChannelStatus
              enabled={prefs.gotify.enabled}
              connected={Boolean(preferences?.gotifyConfigured)}
            />
            <Switch
              checked={prefs.gotify.enabled}
              disabled={isSavingPreferences}
              onCheckedChange={(checked) =>
                setPrefs((prev) => ({
                  ...prev,
                  gotify: { ...prev.gotify, enabled: checked },
                }))
              }
            />
          </div>
        }
        title={t("notificationGotifyTitle")}
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium">
              {t("notificationServerUrl")}
            </Label>
            <Input
              autoComplete="off"
              placeholder={t("notificationGotifyServerPlaceholder")}
              value={prefs.gotify.serverUrl}
              onChange={(event) =>
                setPrefs((prev) => ({
                  ...prev,
                  gotify: { ...prev.gotify, serverUrl: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium">
              {t("notificationToken")}
            </Label>
            <Input
              autoComplete="off"
              placeholder={t("notificationGotifyTokenPlaceholder")}
              type="password"
              value={prefs.gotify.token}
              onChange={(event) =>
                setPrefs((prev) => ({
                  ...prev,
                  gotify: { ...prev.gotify, token: event.target.value },
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              {preferences?.gotifyTokenConfigured
                ? t("notificationGotifyTokenHintConfigured", {
                    masked: preferences.maskedGotifyToken ?? "••••",
                  })
                : t("notificationGotifyTokenHintRequired")}
            </p>
          </div>
        </div>
        <ChannelActions
          isConfigured={Boolean(preferences?.gotifyConfigured)}
          isSaving={isSavingPreferences}
          onSave={() =>
            save(
              () =>
                updatePreferences({
                  gotifyEnabled: prefs.gotify.enabled,
                  gotifyServerUrl: prefs.gotify.serverUrl,
                  gotifyToken: prefs.gotify.token.trim()
                    ? prefs.gotify.token
                    : undefined,
                }).then(() =>
                  setPrefs((prev) => ({
                    ...prev,
                    gotify: { ...prev.gotify, token: "" },
                  })),
                ),
              t("notificationSaved"),
            )
          }
          onDisconnect={() =>
            save(
              () =>
                updatePreferences({
                  gotifyEnabled: false,
                  gotifyServerUrl: null,
                  gotifyToken: null,
                }).then(() =>
                  setPrefs((prev) => ({
                    ...prev,
                    gotify: { enabled: false, serverUrl: "", token: "" },
                  })),
                ),
              t("notificationDisconnected"),
            )
          }
        />
      </ChannelCard>

      <ChannelCard
        description={t("notificationNtfyDescription")}
        headerRight={
          <div className="flex items-center gap-3">
            <ChannelStatus
              enabled={prefs.ntfy.enabled}
              connected={Boolean(preferences?.ntfyConfigured)}
            />
            <Switch
              checked={prefs.ntfy.enabled}
              disabled={isSavingPreferences}
              onCheckedChange={(checked) =>
                setPrefs((prev) => ({
                  ...prev,
                  ntfy: { ...prev.ntfy, enabled: checked },
                }))
              }
            />
          </div>
        }
        title={t("notificationNtfyTitle")}
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium">
              {t("notificationServerUrl")}
            </Label>
            <Input
              autoComplete="off"
              placeholder={t("notificationNtfyServerPlaceholder")}
              value={prefs.ntfy.serverUrl}
              onChange={(event) =>
                setPrefs((prev) => ({
                  ...prev,
                  ntfy: { ...prev.ntfy, serverUrl: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium">
              {t("notificationTopic")}
            </Label>
            <Input
              autoComplete="off"
              placeholder={t("notificationNtfyTopicPlaceholder")}
              value={prefs.ntfy.topic}
              onChange={(event) =>
                setPrefs((prev) => ({
                  ...prev,
                  ntfy: { ...prev.ntfy, topic: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium">
              {t("notificationToken")}
            </Label>
            <Input
              autoComplete="off"
              placeholder={t("notificationNtfyTokenPlaceholder")}
              type="password"
              value={prefs.ntfy.token}
              onChange={(event) =>
                setPrefs((prev) => ({
                  ...prev,
                  ntfy: { ...prev.ntfy, token: event.target.value },
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              {preferences?.ntfyTokenConfigured
                ? t("notificationNtfyTokenHintConfigured", {
                    masked: preferences.maskedNtfyToken ?? "••••",
                  })
                : t("notificationNtfyTokenHintOptional")}
            </p>
          </div>
        </div>
        <ChannelActions
          isConfigured={Boolean(preferences?.ntfyConfigured)}
          isSaving={isSavingPreferences}
          onSave={() =>
            save(
              () =>
                updatePreferences({
                  ntfyEnabled: prefs.ntfy.enabled,
                  ntfyServerUrl: prefs.ntfy.serverUrl,
                  ntfyTopic: prefs.ntfy.topic,
                  ntfyToken: prefs.ntfy.token.trim()
                    ? prefs.ntfy.token
                    : undefined,
                }).then(() =>
                  setPrefs((prev) => ({
                    ...prev,
                    ntfy: { ...prev.ntfy, token: "" },
                  })),
                ),
              t("notificationSaved"),
            )
          }
          onDisconnect={() =>
            save(
              () =>
                updatePreferences({
                  ntfyEnabled: false,
                  ntfyServerUrl: null,
                  ntfyTopic: null,
                  ntfyToken: null,
                }).then(() =>
                  setPrefs((prev) => ({
                    ...prev,
                    ntfy: {
                      enabled: false,
                      serverUrl: "",
                      topic: "",
                      token: "",
                    },
                  })),
                ),
              t("notificationDisconnected"),
            )
          }
        />
      </ChannelCard>

      <ChannelCard
        description={t("notificationWebhookDescription")}
        headerRight={
          <div className="flex items-center gap-3">
            <ChannelStatus
              enabled={prefs.webhook.enabled}
              connected={Boolean(preferences?.webhookConfigured)}
            />
            <Switch
              checked={prefs.webhook.enabled}
              disabled={isSavingPreferences}
              onCheckedChange={(checked) =>
                setPrefs((prev) => ({
                  ...prev,
                  webhook: { ...prev.webhook, enabled: checked },
                }))
              }
            />
          </div>
        }
        title={t("notificationWebhookTitle")}
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium">
              {t("notificationEndpointUrl")}
            </Label>
            <Input
              autoComplete="off"
              placeholder={t("notificationWebhookUrlPlaceholder")}
              type="url"
              value={prefs.webhook.url}
              onChange={(event) =>
                setPrefs((prev) => ({
                  ...prev,
                  webhook: { ...prev.webhook, url: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium">
              {t("notificationSigningSecret")}
            </Label>
            <Input
              autoComplete="off"
              placeholder={t("notificationWebhookSecretPlaceholder")}
              type="password"
              value={prefs.webhook.secret}
              onChange={(event) =>
                setPrefs((prev) => ({
                  ...prev,
                  webhook: { ...prev.webhook, secret: event.target.value },
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              {preferences?.webhookSecretConfigured
                ? t("notificationWebhookSecretHintConfigured", {
                    masked: preferences.maskedWebhookSecret ?? "••••",
                  })
                : t("notificationWebhookSecretHintOptional")}
            </p>
          </div>
        </div>
        <ChannelActions
          isConfigured={Boolean(preferences?.webhookConfigured)}
          isSaving={isSavingPreferences}
          onSave={() =>
            save(
              () =>
                updatePreferences({
                  webhookEnabled: prefs.webhook.enabled,
                  webhookUrl: prefs.webhook.url,
                  webhookSecret: prefs.webhook.secret.trim()
                    ? prefs.webhook.secret
                    : undefined,
                }).then(() =>
                  setPrefs((prev) => ({
                    ...prev,
                    webhook: { ...prev.webhook, secret: "" },
                  })),
                ),
              t("notificationSaved"),
            )
          }
          onDisconnect={() =>
            save(
              () =>
                updatePreferences({
                  webhookEnabled: false,
                  webhookUrl: null,
                  webhookSecret: null,
                }).then(() =>
                  setPrefs((prev) => ({
                    ...prev,
                    webhook: { enabled: false, url: "", secret: "" },
                  })),
                ),
              t("notificationDisconnected"),
            )
          }
        />
      </ChannelCard>
    </div>
  );
}

export default NotificationPreferencesSettings;
