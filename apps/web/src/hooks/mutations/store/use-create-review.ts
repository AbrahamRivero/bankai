import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateReviewInput } from "@/fetchers/reviews/create-review";
import createReview from "@/fetchers/reviews/create-review";

function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewInput & { workspaceId: string }) =>
      createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

export default useCreateReview;
