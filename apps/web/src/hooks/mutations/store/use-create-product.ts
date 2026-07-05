import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateProductInput } from "@/fetchers/products/create-product";
import createProduct from "@/fetchers/products/create-product";

function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductInput) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    },
  });
}

export default useCreateProduct;
