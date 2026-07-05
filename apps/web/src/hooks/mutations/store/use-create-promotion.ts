import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreatePromotionInput } from "@/fetchers/promotions/create-promotion";
import createPromotion from "@/fetchers/promotions/create-promotion";

function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePromotionInput & { workspaceId: string }) =>
      createPromotion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions", "list"] });
    },
  });
}

export default useCreatePromotion;
