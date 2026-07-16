import type { AppType } from "@kaneo/api";
import { hc } from "hono/client";

const windowId = Math.random().toString(36).substring(2, 11);

export const client = hc<AppType>("/api", {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    return fetch(input, {
      ...init,
      headers: {
        ...init?.headers,
        "Content-Type": "application/json",
        "X-Kaneo-Window-Id": windowId,
      },
      credentials: "include",
    }).catch((error) => {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Failed to connect to API server. Make sure the API server is running and NEXT_PUBLIC_API_URL is correctly configured.",
        );
      }
      throw error;
    });
  },
});
