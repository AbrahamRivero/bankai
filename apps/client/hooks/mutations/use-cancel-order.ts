import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelOrder } from "@/lib/fetchers/orders";
import { toast } from "@/lib/toast";

function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, workspaceId }: { id: string; workspaceId: string }) =>
      cancelOrder(id, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order cancelled successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel order",
      );
    },
  });
}

export default useCancelOrder;
