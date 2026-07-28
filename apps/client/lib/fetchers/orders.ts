import { client } from "@/lib/api-client";

export type CheckoutItem = {
  productId: string;
  quantity: number;
  size?: string;
};

export type CheckoutInput = {
  shippingAddress: string;
  city: string;
  province: string;
  phone?: string;
  notes?: string;
  paymentMethod?: "usd" | "euro" | "cup" | "card";
  promotionCode?: string;
  items: CheckoutItem[];
  workspaceId: string;
};

export type OrderItemResponse = {
  id: string;
  quantity: number;
  size: string | null;
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    stock: number;
    images?: string[];
  };
};

export type OrderResponse = {
  id: string;
  shippingAddress: string;
  phone: string | null;
  city: string;
  province: string;
  discount: number;
  promotionId: string | null;
  promotionDiscount: number;
  promotion: { code: string; title: string } | null;
  paymentMethod: string;
  orderStatus: string;
  orderNumber: string;
  trackingNumber: string;
  subtotal: number;
  shipping: number;
  total: number;
  notes: string | null;
  userId: string;
  customerId: string | null;
  customerName: string | null;
  orderItems: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
};

export async function checkout(input: CheckoutInput): Promise<OrderResponse> {
  const res = await client.orders.checkout.$post({
    json: input,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Checkout failed" }));
    throw new Error(err.message ?? "Checkout failed");
  }
  return res.json();
}

export type OrderStats = {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
};

export type UserOrdersParams = {
  workspaceId: string;
  limit?: number;
  offset?: number;
  orderStatus?: string;
  searchterm?: string;
  minTotal?: number;
  maxTotal?: number;
  sortBy?: "createdAt" | "total" | "orderNumber";
  sortOrder?: "asc" | "desc";
};

export type UserOrdersResponse = {
  orders: OrderResponse[];
  total: number;
  stats?: OrderStats;
};

export async function getUserOrders(
  params: UserOrdersParams,
): Promise<UserOrdersResponse> {
  const query: Record<string, string> = {
    workspaceId: params.workspaceId,
    limit: String(params.limit ?? 10),
    offset: String(params.offset ?? 0),
  };
  if (params.orderStatus) query.orderStatus = params.orderStatus;
  if (params.searchterm) query.searchterm = params.searchterm;
  if (params.minTotal !== undefined) query.minTotal = String(params.minTotal);
  if (params.maxTotal !== undefined) query.maxTotal = String(params.maxTotal);
  if (params.sortBy) query.sortBy = params.sortBy;
  if (params.sortOrder) query.sortOrder = params.sortOrder;
  const url = `/api/orders/user-orders?${new URLSearchParams(query)}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export async function getOrder(
  id: string,
  workspaceId: string,
): Promise<OrderResponse> {
  const url = `/api/orders/${id}?workspaceId=${encodeURIComponent(workspaceId)}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch order");
  return res.json();
}

export async function cancelOrder(
  id: string,
  workspaceId: string,
): Promise<OrderResponse> {
  const res = await fetch(`/api/orders/${id}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workspaceId }),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ message: "Failed to cancel order" }));
    throw new Error(err.message ?? "Failed to cancel order");
  }
  return res.json();
}
