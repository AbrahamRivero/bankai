import { client } from "@/lib/api-client";

export type ProductListResponse = {
  products: Array<{
    id: string;
    title: string;
    price: number;
    compareAtPrice: number | null;
    description: string | null;
    slug: string;
    stock: number;
    sizes: string[];
    gender: string;
    tags: string[];
    images: string[];
    isFavorite: boolean;
    reviewCount: number;
    averageRating: number | null;
    createdAt: string;
    updatedAt: string;
  }>;
  total: number;
  offset: number;
  limit: number;
};

export type RelatedProduct = {
  id: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  slug: string;
  stock: number;
  sizes: string[];
  gender: string;
  tags: string[];
  images: string[];
  reviewCount: number;
  averageRating: number | null;
};

export type ProductResponse = {
  id: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  description: string | null;
  slug: string;
  stock: number;
  sizes: string[];
  gender: string;
  tags: string[];
  images: string[];
  relatedProducts: RelatedProduct[];
  relatedProductIds: string[];
  isFavorite: boolean;
  reviewCount: number;
  averageRating: number | null;
  createdAt: string;
  updatedAt: string;
};

export type GetProductsParams = {
  workspaceId: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  gender?: string;
  sizes?: string;
  tags?: string;
  minPrice?: number;
  maxPrice?: number;
  searchterm?: string;
  availability?: string;
};

export async function getProducts(params: GetProductsParams) {
  const { workspaceId, ...queryParams } = params;

  const response = await client.products.$get({
    query: {
      workspaceId,
      ...(queryParams.limit !== undefined && {
        limit: String(queryParams.limit),
      }),
      ...(queryParams.offset !== undefined && {
        offset: String(queryParams.offset),
      }),
      ...(queryParams.sortBy && { sortBy: queryParams.sortBy }),
      ...(queryParams.gender && { gender: queryParams.gender }),
      ...(queryParams.sizes && { sizes: queryParams.sizes }),
      ...(queryParams.tags && { tags: queryParams.tags }),
      ...(queryParams.minPrice !== undefined && {
        minPrice: String(queryParams.minPrice),
      }),
      ...(queryParams.maxPrice !== undefined && {
        maxPrice: String(queryParams.maxPrice),
      }),
      ...(queryParams.searchterm && { searchterm: queryParams.searchterm }),
      ...(queryParams.availability && {
        availability: queryParams.availability,
      }),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(
        parsed.message || `Request failed with status ${response.status}`,
      );
    } catch {
      throw new Error(text || `Request failed with status ${response.status}`);
    }
  }

  return response.json() as Promise<ProductListResponse>;
}

export async function getProduct(term: string, workspaceId: string) {
  const response = await client.products[":term"].$get({
    param: { term },
    query: { workspaceId },
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(
        parsed.message || `Request failed with status ${response.status}`,
      );
    } catch {
      throw new Error(text || `Request failed with status ${response.status}`);
    }
  }

  return response.json() as Promise<ProductResponse>;
}
