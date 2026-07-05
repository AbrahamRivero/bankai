import { client } from "@kaneo/libs";

async function updateOrderStatus(id: string, status: string) {
  const response = await client.orders[":id"].$patch({
    param: { id },
    json: { orderStatus: status },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<{ id: string }>;
}

export default updateOrderStatus;
