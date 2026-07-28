import { client } from "@/lib/api-client";

export type ReviewResponse = {
  id: string;
  comment: string;
  rating: number;
  userId: string;
  productId: string;
  user?: { name: string | null; image: string | null };
  createdAt: string;
  updatedAt: string;
};

export async function getReviews(productId: string, workspaceId: string) {
  const response = await client.reviews.product[":productId"].$get({
    param: { productId },
    query: { workspaceId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<ReviewResponse[]>;
}

export async function createReview(
  productId: string,
  rating: number,
  comment: string,
  workspaceId: string,
) {
  const response = await client.reviews.$post({
    json: { productId, rating, comment, workspaceId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<{ id: string }>;
}
