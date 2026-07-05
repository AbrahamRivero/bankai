import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateOrderInput } from "@/fetchers/orders/create-order";
import createOrder from "@/fetchers/orders/create-order";

function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderInput) => createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export default useCreateOrder;
