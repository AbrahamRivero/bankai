import { client } from "@kaneo/libs";

export type ProductResponse = {
  id: string;
  title: string;
  price: number;
  description: string | null;
  slug: string;
  stock: number;
  sizes: string[];
  gender: string;
  tags: string[];
  images: string[];
  relatedProductIds: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};

async function getProduct(term: string, workspaceId: string) {
  const response = await client.products[":term"].$get({
    param: { term },
    query: { workspaceId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<ProductResponse>;
}

export default getProduct;
