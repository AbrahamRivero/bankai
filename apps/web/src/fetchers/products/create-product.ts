import { client } from "@kaneo/libs";

export type CreateProductInput = {
  workspaceId: string;
  title: string;
  price: number;
  description?: string;
  slug?: string;
  stock?: number;
  sizes?: string[];
  gender?: string;
  tags?: string[];
  images?: string[];
  relatedProductIds?: string[];
};

export type CreateProductResponse = {
  id: string;
  title: string;
  slug: string;
};

async function createProduct(data: CreateProductInput) {
  const { workspaceId, ...productData } = data;
  const response = await client.products.$post({
    json: { ...productData, workspaceId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<CreateProductResponse>;
}

export default createProduct;
