import { useQuery } from "@tanstack/react-query";
import getReviews from "@/fetchers/reviews/get-reviews";

function useGetReviews(productId: string) {
  return useQuery({
    queryFn: () => getReviews(productId),
    queryKey: ["reviews", productId],
    enabled: !!productId,
    refetchInterval: 30_000,
  });
}

export default useGetReviews;
