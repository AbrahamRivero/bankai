import { client } from "@kaneo/libs";

export type UpdateOrderInput = {
  id: string;
  workspaceId: string;
  shippingAddress?: string;
  phone?: string;
  city?: string;
  province?: string;
  discount?: number;
  paymentMethod?: string;
  orderStatus?: string;
  subtotal?: number;
  shipping?: number;
  total?: number;
  notes?: string;
  promotionCode?: string | null;
  customerId?: string | null;
  orderItems?: Array<{
    quantity: number;
    product: string;
    size?: string;
  }>;
};

async function updateOrder(data: UpdateOrderInput) {
  const { id, workspaceId, ...body } = data;
  const response = await client.orders[":id"].$patch({
    param: { id },
    json: { ...body, workspaceId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<{ id: string }>;
}

export default updateOrder;
