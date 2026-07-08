import { client } from "@kaneo/libs";

export type ReviewsInsights = {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { rating: number; count: number }[];
  productsWithoutReviews: number;
};

async function getReviewsInsights(workspaceId: string) {
  const response = await client.reviews.insights.$get({
    query: { workspaceId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<ReviewsInsights>;
}

export default getReviewsInsights;
