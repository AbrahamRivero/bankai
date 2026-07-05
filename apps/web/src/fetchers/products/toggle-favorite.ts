import { client } from "@kaneo/libs";

async function toggleFavorite(productId: string) {
  const response = await client.products.favorites.$post({
    json: { productId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<{
    id: string;
    userId: string;
    productId: string;
  }>;
}

export default toggleFavorite;
