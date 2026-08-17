import { client } from "@/lib/api-client";

export type UpdateNotificationPreferencesInput = {
  emailEnabled?: boolean;
  ntfyEnabled?: boolean;
  ntfyServerUrl?: string | null;
  ntfyTopic?: string | null;
  ntfyToken?: string | null;
  gotifyEnabled?: boolean;
  gotifyServerUrl?: string | null;
  gotifyToken?: string | null;
  webhookEnabled?: boolean;
  webhookUrl?: string | null;
  webhookSecret?: string | null;
};

export async function getNotificationPreferences() {
  const response = await client.notificationPreferences.$get();

  if (!response.ok) {
    throw new Error("Failed to fetch notification preferences");
  }

  return response.json();
}

export async function updateNotificationPreferences(
  input: UpdateNotificationPreferencesInput,
) {
  const response = await client.notificationPreferences.$put({ json: input });

  if (!response.ok) {
    throw new Error("Failed to update notification preferences");
  }

  return response.json();
}
