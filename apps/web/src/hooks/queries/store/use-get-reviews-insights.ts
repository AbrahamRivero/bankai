import { useQuery } from "@tanstack/react-query";
import type { ReviewsInsights } from "@/fetchers/reviews/get-reviews-insights";
import getReviewsInsights from "@/fetchers/reviews/get-reviews-insights";

function useGetReviewsInsights(workspaceId: string) {
  return useQuery<ReviewsInsights>({
    queryFn: () => getReviewsInsights(workspaceId),
    queryKey: ["reviews-insights", workspaceId],
  });
}

export default useGetReviewsInsights;
