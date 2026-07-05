import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateProductInput } from "@/fetchers/products/update-product";
import updateProduct from "@/fetchers/products/update-product";

function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProductInput) => updateProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["promotions", "products"] });
    },
  });
}

export default useUpdateProduct;
