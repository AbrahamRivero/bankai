import { useMutation, useQueryClient } from "@tanstack/react-query";
import deleteOrder from "@/fetchers/orders/delete-order";

function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, workspaceId }: { id: string; workspaceId: string }) =>
      deleteOrder(id, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export default useDeleteOrder;
