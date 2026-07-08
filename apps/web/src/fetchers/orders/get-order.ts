import { getApiUrl } from "@/fetchers/get-api-url";

export type OrderDetailResponse = {
  id: string;
  orderNumber: string;
  trackingNumber: string | null;
  orderStatus: string;
  shippingAddress: string;
  city: string;
  province: string;
  phone: string | null;
  discount: number;
  promotionId: string | null;
  promotionDiscount: number;
  total: number;
  subtotal: number;
  shipping: number;
  notes: string | null;
  paymentMethod: string;
  userId: string;
  customerId: string | null;
  customerName: string | null;
  orderItems: Array<{
    id: string;
    productId: string;
    quantity: number;
    size: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
};

async function getOrder(id: string, workspaceId?: string) {
  const searchParams = new URLSearchParams();
  if (workspaceId) searchParams.set("workspaceId", workspaceId);
  const query = searchParams.toString();
  const url = `${getApiUrl("orders")}/${id}${query ? `?${query}` : ""}`;
  const response = await fetch(url, { credentials: "include" });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<OrderDetailResponse>;
}

export default getOrder;
