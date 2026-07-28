import { client } from "@/lib/api-client";

export type FavoriteProduct = {
  id: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  slug: string;
  stock: number;
  sizes: string[];
  images: string[];
  isFavorite: boolean;
  reviewCount: number;
  averageRating: number | null;
  tags: string[];
  createdAt: string;
};

async function getFavorites(workspaceId: string): Promise<FavoriteProduct[]> {
  const response = await client.products.favorites.$get({
    query: { workspaceId },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to fetch favorites");
  }

  return response.json();
}

export default getFavorites;
