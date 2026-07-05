export type ProductListResponse = {
  products: Array<{
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
    isFavorite: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  total: number;
  offset: number;
  limit: number;
};

import { getApiUrl } from "@/fetchers/get-api-url";

async function getProducts(
  workspaceId: string,
  params?: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    gender?: string;
    searchterm?: string;
  },
) {
  const searchParams = new URLSearchParams();
  searchParams.set("workspaceId", workspaceId);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));
  if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params?.gender) searchParams.set("gender", params.gender);
  if (params?.searchterm) searchParams.set("searchterm", params.searchterm);

  const query = searchParams.toString();
  const url = `${getApiUrl("products")}${query ? `?${query}` : ""}`;
  const response = await fetch(url, { credentials: "include" });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<ProductListResponse>;
}

export default getProducts;
