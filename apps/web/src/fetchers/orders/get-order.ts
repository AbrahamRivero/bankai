import { client } from "@kaneo/libs";

export type OrderDetailResponse = {
  id: string;
  orderNumber: string;
  trackingNumber: string | null;
  orderStatus: string;
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

async function getOrder(id: string) {
  const response = await client.orders[":id"].$get({
    param: { id },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<OrderDetailResponse>;
}

export default getOrder;
