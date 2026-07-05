import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateOrderInput } from "@/fetchers/orders/update-order";
import updateOrder from "@/fetchers/orders/update-order";

function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateOrderInput) => updateOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export default useUpdateOrder;
