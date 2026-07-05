import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdatePromotionInput } from "@/fetchers/promotions/update-promotion";
import updatePromotion from "@/fetchers/promotions/update-promotion";

function useUpdatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePromotionInput & { workspaceId: string }) =>
      updatePromotion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions", "list"] });
      queryClient.invalidateQueries({ queryKey: ["promotions", "products"] });
    },
  });
}

export default useUpdatePromotion;
