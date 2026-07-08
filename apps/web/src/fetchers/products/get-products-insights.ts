import { client } from "@kaneo/libs";

export type ProductsInsights = {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  averagePrice: number;
  byGender: { gender: string; count: number }[];
  topFavorited: {
    id: string;
    title: string;
    price: number;
    slug: string;
    stock: number;
    images: string[];
    favoritesCount: number;
  }[];
};

async function getProductsInsights(workspaceId: string) {
  const response = await client.products.insights.$get({
    query: { workspaceId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<ProductsInsights>;
}

export default getProductsInsights;
