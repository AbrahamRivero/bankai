import { useMutation, useQueryClient } from "@tanstack/react-query";
import updateOrderStatus from "@/fetchers/orders/update-order-status";

function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export default useUpdateOrderStatus;
