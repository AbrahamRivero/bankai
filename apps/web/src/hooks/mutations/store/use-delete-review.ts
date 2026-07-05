import { useMutation, useQueryClient } from "@tanstack/react-query";
import deleteReview from "@/fetchers/reviews/delete-review";

function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      workspaceId,
    }: {
      reviewId: string;
      workspaceId: string;
    }) => deleteReview(reviewId, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

export default useDeleteReview;
