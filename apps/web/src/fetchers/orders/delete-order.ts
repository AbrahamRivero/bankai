import { client } from "@kaneo/libs";

async function deleteOrder(id: string, workspaceId: string) {
  const response = await client.orders[":id"].$delete({
    param: { id },
    query: { workspaceId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<{ message: string }>;
}

export default deleteOrder;
