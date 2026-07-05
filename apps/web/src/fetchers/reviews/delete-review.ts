import { client } from "@kaneo/libs";

async function deleteReview(reviewId: string, workspaceId: string) {
  const response = await client.reviews[":reviewId"].$delete({
    param: { reviewId },
    query: { workspaceId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<{ success: boolean }>;
}

export default deleteReview;
