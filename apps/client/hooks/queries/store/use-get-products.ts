import { useQuery } from "@tanstack/react-query";
import { type GetProductsParams, getProducts } from "@/lib/fetchers/products";

function useGetProducts(params: GetProductsParams) {
  return useQuery({
    queryFn: () => getProducts(params),
    queryKey: ["products", "list", params],
    enabled: !!params.workspaceId,
    refetchInterval: 30_000,
  });
}

export default useGetProducts;
