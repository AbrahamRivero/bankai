import { client } from "@kaneo/libs";

export type UpdateProductInput = {
  id: string;
  workspaceId: string;
  title?: string;
  price?: number;
  description?: string;
  slug?: string;
  stock?: number;
  sizes?: string[];
  gender?: string;
  tags?: string[];
  images?: string[];
  relatedProductIds?: string[];
};

export type UpdateProductResponse = {
  id: string;
  title: string;
  slug: string;
};

async function updateProduct(data: UpdateProductInput) {
  const { id, workspaceId, ...body } = data;
  const response = await client.products[":id"].$patch({
    param: { id },
    json: { ...body, workspaceId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<UpdateProductResponse>;
}

export default updateProduct;
