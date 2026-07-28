import { useQuery } from "@tanstack/react-query";
import { getReviews } from "@/lib/fetchers/reviews";

function useGetReviews(productId: string, workspaceId: string) {
  return useQuery({
    queryFn: () => getReviews(productId, workspaceId),
    queryKey: ["reviews", productId],
    enabled: !!productId && !!workspaceId,
  });
}

export default useGetReviews;
