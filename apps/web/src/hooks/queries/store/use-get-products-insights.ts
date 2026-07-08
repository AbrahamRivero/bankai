import { useQuery } from "@tanstack/react-query";
import type { ProductsInsights } from "@/fetchers/products/get-products-insights";
import getProductsInsights from "@/fetchers/products/get-products-insights";

function useGetProductsInsights(workspaceId: string) {
  return useQuery<ProductsInsights>({
    queryFn: () => getProductsInsights(workspaceId),
    queryKey: ["products-insights", workspaceId],
  });
}

export default useGetProductsInsights;
