export type OrderListResponse = {
  orders: Array<{
    id: string;
    orderNumber: string;
    orderStatus: string;
    total: number;
    customerId: string | null;
    customerName: string | null;
    createdAt: string;
  }>;
  total: number;
};

import { getApiUrl } from "@/fetchers/get-api-url";

async function getOrders(params?: {
  workspaceId?: string;
  limit?: number;
  offset?: number;
  status?: string;
  customerId?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.workspaceId) searchParams.set("workspaceId", params.workspaceId);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));
  if (params?.status) searchParams.set("status", params.status);
  if (params?.customerId) searchParams.set("customerId", params.customerId);

  const query = searchParams.toString();
  const url = `${getApiUrl("orders")}${query ? `?${query}` : ""}`;
  const response = await fetch(url, { credentials: "include" });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<OrderListResponse>;
}

export default getOrders;
