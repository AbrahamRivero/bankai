import { client } from "@kaneo/libs";

export type CreateReviewInput = {
  workspaceId: string;
  productId: string;
  rating: number;
  comment?: string;
};

async function createReview(data: CreateReviewInput) {
  const response = await client.reviews.$post({ json: data });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<{ id: string }>;
}

export default createReview;
