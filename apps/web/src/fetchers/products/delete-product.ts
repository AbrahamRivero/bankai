import { client } from "@kaneo/libs";

async function deleteProduct(id: string, workspaceId: string) {
  const response = await client.products[":id"].$delete({
    param: { id },
    query: { workspaceId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<{ success: boolean }>;
}

export default deleteProduct;
