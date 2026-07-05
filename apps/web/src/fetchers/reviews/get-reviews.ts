import { client } from "@kaneo/libs";

export type ReviewResponse = {
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    userName: string;
    createdAt: string;
  }>;
  total: number;
};

async function getReviews(productId: string, workspaceId: string) {
  const response = await client.reviews.product[":productId"].$get({
    param: { productId },
    query: { workspaceId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<ReviewResponse>;
}

export default getReviews;
