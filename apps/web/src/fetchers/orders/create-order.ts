import { client } from "@kaneo/libs";

export type CreateOrderInput = {
  workspaceId: string;
  shippingAddress: string;
  phone?: string;
  city: string;
  province: string;
  discount?: number;
  promotionCode?: string;
  paymentMethod?: "usd" | "euro" | "cup" | "card";
  orderStatus: "pending" | "cancelled" | "completed" | "confirmed" | "shipped";
  subtotal: number;
  shipping: number;
  total: number;
  notes?: string;
  customerId?: string | null;
  orderItems: Array<{
    quantity: number;
    product: string;
    size?: string;
  }>;
};

async function createOrder(data: CreateOrderInput) {
  const { workspaceId, ...orderData } = data;
  const response = await client.orders.$post({
    json: { ...orderData, workspaceId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<{ id: string }>;
}

export default createOrder;
