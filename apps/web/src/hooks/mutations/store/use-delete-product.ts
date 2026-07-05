import { useMutation, useQueryClient } from "@tanstack/react-query";
import deleteProduct from "@/fetchers/products/delete-product";

function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, workspaceId }: { id: string; workspaceId: string }) =>
      deleteProduct(id, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["promotions", "products"] });
    },
  });
}

export default useDeleteProduct;
