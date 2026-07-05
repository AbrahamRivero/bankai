import { useMutation, useQueryClient } from "@tanstack/react-query";
import deletePromotion from "@/fetchers/promotions/delete-promotion";

function useDeletePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, workspaceId }: { id: string; workspaceId: string }) =>
      deletePromotion(id, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions", "list"] });
      queryClient.invalidateQueries({ queryKey: ["promotions", "products"] });
    },
  });
}

export default useDeletePromotion;
