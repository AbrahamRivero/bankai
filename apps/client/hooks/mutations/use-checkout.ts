import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkout } from "@/lib/fetchers/orders";

function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export default useCheckout;
